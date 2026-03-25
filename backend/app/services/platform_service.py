import httpx
from typing import Optional
from app.config import get_settings


async def fetch_github_stats(username: str) -> dict:
    """Fetch GitHub stats for a user."""
    if not username:
        return {"repos": 0, "commits": 0, "contributions": 0}

    settings = get_settings()
    headers = {"Accept": "application/vnd.github.v3+json"}
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    result = {"repos": 0, "commits": 0, "contributions": 0, "languages": {}}

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            # Fetch repos
            resp = await client.get(
                f"https://api.github.com/users/{username}/repos?per_page=100&sort=updated",
                headers=headers,
            )
            if resp.status_code == 200:
                repos = resp.json()
                result["repos"] = len(repos)
                languages = {}
                for repo in repos:
                    lang = repo.get("language")
                    if lang:
                        languages[lang] = languages.get(lang, 0) + 1
                result["languages"] = languages

            # Fetch recent events for commit count
            resp = await client.get(
                f"https://api.github.com/users/{username}/events?per_page=100",
                headers=headers,
            )
            if resp.status_code == 200:
                events = resp.json()
                push_events = [e for e in events if e.get("type") == "PushEvent"]
                commits = sum(
                    len(e.get("payload", {}).get("commits", []))
                    for e in push_events
                )
                result["commits"] = commits

            # Fetch contribution count from profile page (approximation)
            resp = await client.get(
                f"https://github.com/users/{username}/contributions",
                headers={"Accept": "text/html"},
            )
            if resp.status_code == 200:
                # Count data-count attributes in contribution graph
                import re
                counts = re.findall(r'data-count="(\d+)"', resp.text)
                result["contributions"] = sum(int(c) for c in counts)

        except Exception as e:
            print(f"[GitHub API Error] {username}: {e}")

    return result


async def fetch_leetcode_stats(username: str) -> dict:
    """Fetch LeetCode stats using GraphQL API."""
    if not username:
        return {"solved": 0, "easy": 0, "medium": 0, "hard": 0, "rating": 0}

    query = """
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
            profile {
                ranking
            }
        }
    }
    """

    result = {"solved": 0, "easy": 0, "medium": 0, "hard": 0, "rating": 0}

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.post(
                "https://leetcode.com/graphql",
                json={"query": query, "variables": {"username": username}},
                headers={"Content-Type": "application/json", "Referer": "https://leetcode.com"},
            )
            if resp.status_code == 200:
                data = resp.json()
                user_data = data.get("data", {}).get("matchedUser", {})
                if user_data:
                    submissions = user_data.get("submitStatsGlobal", {}).get("acSubmissionNum", [])
                    for s in submissions:
                        diff = s.get("difficulty", "")
                        count = s.get("count", 0)
                        if diff == "All":
                            result["solved"] = count
                        elif diff == "Easy":
                            result["easy"] = count
                        elif diff == "Medium":
                            result["medium"] = count
                        elif diff == "Hard":
                            result["hard"] = count

                    ranking = user_data.get("profile", {}).get("ranking", 0)
                    result["rating"] = ranking or 0
        except Exception as e:
            print(f"[LeetCode API Error] {username}: {e}")

    return result


async def fetch_codeforces_stats(username: str) -> dict:
    """Fetch Codeforces stats using public API."""
    if not username:
        return {"solved": 0, "rating": 0}

    result = {"solved": 0, "rating": 0}

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            # User info for rating
            resp = await client.get(
                f"https://codeforces.com/api/user.info?handles={username}"
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "OK" and data.get("result"):
                    user_info = data["result"][0]
                    result["rating"] = user_info.get("rating", 0)

            # User submissions for problem count
            resp = await client.get(
                f"https://codeforces.com/api/user.status?handle={username}&from=1&count=10000"
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "OK":
                    submissions = data.get("result", [])
                    solved_problems = set()
                    for sub in submissions:
                        if sub.get("verdict") == "OK":
                            problem = sub.get("problem", {})
                            problem_id = f"{problem.get('contestId', '')}{problem.get('index', '')}"
                            solved_problems.add(problem_id)
                    result["solved"] = len(solved_problems)
        except Exception as e:
            print(f"[Codeforces API Error] {username}: {e}")

    return result


async def fetch_codechef_stats(username: str) -> dict:
    """Fetch CodeChef stats."""
    if not username:
        return {"solved": 0, "rating": 0}

    result = {"solved": 0, "rating": 0}

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        try:
            resp = await client.get(
                f"https://www.codechef.com/users/{username}",
                headers={"User-Agent": "Mozilla/5.0"},
            )
            if resp.status_code == 200:
                import re
                # Try to extract rating
                rating_match = re.search(r'rating.*?(\d{3,4})', resp.text, re.IGNORECASE)
                if rating_match:
                    result["rating"] = int(rating_match.group(1))

                # Try to extract problems solved
                solved_match = re.search(
                    r'Problems\s+Solved.*?(\d+)', resp.text, re.IGNORECASE | re.DOTALL
                )
                if solved_match:
                    result["solved"] = int(solved_match.group(1))
        except Exception as e:
            print(f"[CodeChef API Error] {username}: {e}")

    return result


async def verify_github_user(username: str) -> bool:
    """Check if a GitHub user exists."""
    if not username:
        return False
    
    settings = get_settings()
    headers = {"Accept": "application/vnd.github.v3+json"}
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(f"https://api.github.com/users/{username}", headers=headers)
            return resp.status_code == 200
        except Exception as e:
            print(f"Error checking GitHub user {username}: {e}")
            return False
    return False

async def verify_leetcode_user(username: str) -> bool:
    """Check if a LeetCode user exists."""
    if not username:
        return False
    query = """
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            username
        }
    }
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(
                "https://leetcode.com/graphql",
                json={"query": query, "variables": {"username": username}},
                headers={"Content-Type": "application/json", "Referer": "https://leetcode.com"},
            )
            if resp.status_code == 200:
                data = resp.json()
                return bool(data.get("data", {}).get("matchedUser"))
        except Exception:
            pass
    return False

async def verify_codeforces_user(username: str) -> bool:
    """Check if a Codeforces user exists."""
    if not username:
        return False
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(f"https://codeforces.com/api/user.info?handles={username}")
            if resp.status_code == 200:
                data = resp.json()
                return data.get("status") == "OK"
        except Exception:
            pass
    return False

async def verify_codechef_user(username: str) -> bool:
    """Check if a CodeChef user exists."""
    if not username:
        return False
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            resp = await client.get(
                f"https://www.codechef.com/users/{username}",
                headers={"User-Agent": "Mozilla/5.0"},
            )
            # CodeChef might redirect to home page if user not found, so check URL and title
            return resp.status_code == 200 and username.lower() in str(resp.url).lower()
        except Exception:
            pass
    return False

