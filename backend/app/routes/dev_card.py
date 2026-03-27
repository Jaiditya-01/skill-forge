"""
dev_card.py
Public API route: GET /api/cards/{username}.svg?theme=dark
Returns a self-contained SVG Dev Card for embedding in GitHub READMEs.
No authentication required — this endpoint is intentionally public.
"""

from fastapi import APIRouter, Query
from fastapi.responses import Response
from app.models.user import User, UserProfile, UserStats
from app.models.platform_metrics import PlatformMetrics
from app.services.svg_template import generate_svg
import re

router = APIRouter(prefix="/api/cards", tags=["Dev Card"])


@router.get("/{slug}", include_in_schema=True)
async def get_dev_card(
    slug: str,
    theme: str = Query(default="dark", pattern="^(dark|light|matrix)$"),
):
    """
    Generate and return a real-time SVG Dev Card for the given SkillForge username.
    Accepts both /api/cards/{username} and /api/cards/{username}.svg

    - `username` is the SkillForge display name (case-insensitive).
    - `theme` can be `dark` (default), `light`, or `matrix`.
    - Cache-Control is set to 2 hours to balance freshness vs rate limits.
    """
    # Strip .svg extension if present (allows both /name and /name.svg)
    username = slug[:-4] if slug.lower().endswith(".svg") else slug
    # ── 1. Find user by name (case-insensitive) ──────────────────────────────
    # Beanie doesn't natively support case-insensitive find, so we use a regex.
    users = await User.find(
        {"name": {"$regex": f"^{re.escape(username)}$", "$options": "i"}}
    ).to_list()

    if not users:
        # Return a minimal "user not found" SVG
        not_found_svg = _not_found_svg(username, theme)
        return Response(
            content=not_found_svg,
            media_type="image/svg+xml",
            headers={"Cache-Control": "public, max-age=300"},  # 5min cache for misses
        )

    user = users[0]

    # ── 2. Fetch related documents ──────────────────────────────────────────
    profile = await UserProfile.find_one(UserProfile.user_id == user.id)
    stats = await UserStats.find_one(UserStats.user_id == user.id)

    # Latest metrics snapshot
    metrics = await PlatformMetrics.find(
        PlatformMetrics.user_id == user.id
    ).sort("-date").first_or_none()

    # ── 3. Assemble the data payload ────────────────────────────────────────
    languages: dict = {}
    if metrics and metrics.github_languages:
        languages = metrics.github_languages

    # Build 7-day activity array (sum across all platforms for each day)
    from datetime import datetime, timedelta
    today = datetime.utcnow()
    activity_7d = []
    for offset in range(6, -1, -1):  # 6 days ago → today
        day_str = (today - timedelta(days=offset)).strftime("%Y-%m-%d")
        total = 0
        if metrics:
            for daily_dict in [
                metrics.github_daily or {},
                metrics.leetcode_daily or {},
                metrics.codeforces_daily or {},
            ]:
                total += daily_dict.get(day_str, 0)
        activity_7d.append(total)

    data = {
        "name":            user.name,
        "username":        username,
        "level":           stats.current_level if stats else 1,
        "total_xp":        stats.total_xp if stats else 0,
        "current_streak":  stats.current_streak if stats else 0,
        "longest_streak":  stats.longest_streak if stats else 0,
        "target_role":     user.target_role or "Developer",
        "languages":       languages,
        "activity_7d":     activity_7d,
        "lc_solved":       metrics.leetcode_solved if metrics else 0,
        "cf_rating":       metrics.codeforces_rating if metrics else 0,
        "gh_repos":        metrics.github_repos if metrics else 0,
    }

    # ── 4. Render SVG and respond ────────────────────────────────────────────
    svg_content = generate_svg(data, theme)

    return Response(
        content=svg_content,
        media_type="image/svg+xml",
        headers={
            # 2-hour cache — GitHub CDN will serve this without hammering our server
            "Cache-Control": "public, max-age=7200",
        },
    )


def _not_found_svg(username: str, theme: str) -> str:
    """Return a minimal 'User not found' SVG card."""
    bg = "#0d1117" if theme != "light" else "#ffffff"
    border = "#30363d" if theme != "light" else "#d0d7de"
    text = "#8b949e" if theme != "light" else "#636c76"
    accent = "#a371f7"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="495" height="195" viewBox="0 0 495 195">
  <rect width="495" height="195" rx="10" fill="{bg}" stroke="{border}" stroke-width="1"/>
  <text x="247" y="88" font-size="12" font-weight="600" fill="{accent}"
        text-anchor="middle" font-family="system-ui,sans-serif">⚡ SKILLFORGE</text>
  <text x="247" y="114" font-size="14" fill="{text}"
        text-anchor="middle" font-family="system-ui,sans-serif">User "{username}" not found.</text>
  <text x="247" y="133" font-size="10" fill="{text}"
        text-anchor="middle" font-family="system-ui,sans-serif">Sign up at skillforge.app</text>
</svg>"""
