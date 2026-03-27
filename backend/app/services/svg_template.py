"""
svg_template.py
Generates a self-contained SVG "Dev Card" for a SkillForge user.
All styling is embedded; no external resources are referenced.
Dimensions: 495 x 215 px (wider than GitHub card minimum to accommodate 2-column layout).
"""

from typing import Dict, Any, List


# ── Theme definitions ────────────────────────────────────────────────────────
THEMES = {
    "dark": {
        "bg_from":       "#0d1117",
        "bg_to":         "#161b22",
        "border":        "#30363d",
        "title":         "#e6edf3",
        "subtitle":      "#8b949e",
        "text":          "#c9d1d9",
        "muted":         "#484f58",
        "accent":        "#a371f7",
        "accent2":       "#58a6ff",
        "bar_bg":        "#21262d",
        "stat_bg":       "#161b22",
        "lang_colors": {
            "Python":     "#3572A5",
            "JavaScript": "#f1e05a",
            "TypeScript": "#2b7489",
            "Java":       "#b07219",
            "C++":        "#f34b7d",
            "Go":         "#00ADD8",
            "Rust":       "#dea584",
            "HTML":       "#e34c26",
            "CSS":        "#563d7c",
            "default":    "#8b949e",
        },
    },
    "light": {
        "bg_from":       "#ffffff",
        "bg_to":         "#f6f8fa",
        "border":        "#d0d7de",
        "title":         "#1f2328",
        "subtitle":      "#636c76",
        "text":          "#24292f",
        "muted":         "#aaaaaa",
        "accent":        "#8250df",
        "accent2":       "#0969da",
        "bar_bg":        "#e6edf3",
        "stat_bg":       "#f6f8fa",
        "lang_colors": {
            "Python":     "#3572A5",
            "JavaScript": "#d6b028",
            "TypeScript": "#2b7489",
            "Java":       "#b07219",
            "C++":        "#d63a65",
            "Go":         "#00ADD8",
            "Rust":       "#c0684b",
            "HTML":       "#e34c26",
            "CSS":        "#563d7c",
            "default":    "#636c76",
        },
    },
    "matrix": {
        "bg_from":       "#000000",
        "bg_to":         "#001100",
        "border":        "#00ff41",
        "title":         "#00ff41",
        "subtitle":      "#00bb30",
        "text":          "#00cc35",
        "muted":         "#005010",
        "accent":        "#00ff41",
        "accent2":       "#39ff14",
        "bar_bg":        "#001800",
        "stat_bg":       "#001100",
        "lang_colors": {
            "default":    "#00ff41",
        },
    },
}

# Card dimensions
CARD_W = 495
CARD_H = 215
DIVIDER_X = 240


def _get_lang_color(theme_data: dict, lang: str) -> str:
    """Return the hex color for a language, falling back to default."""
    colors = theme_data.get("lang_colors", {})
    val = colors.get(lang, colors.get("default", "#8b949e"))
    return str(val) if val else "#8b949e"


def _progress_bar(x: int, y: int, width: int, pct: float, color: str, bg: str) -> str:
    """Rounded horizontal progress bar SVG."""
    filled = max(3, round(width * min(pct, 100) / 100))
    return (
        f'<rect x="{x}" y="{y}" width="{width}" height="5" rx="2.5" fill="{bg}"/>'
        f'<rect x="{x}" y="{y}" width="{filled}" height="5" rx="2.5" fill="{color}"/>'
    )


def _activity_bars(x: int, y_baseline: int, days: List[int], accent: str, bg: str, bar_h_max: int = 28) -> str:
    """Mini 7-column bar chart."""
    all_days = list(days)
    n = min(len(all_days), 7)
    days7 = all_days[max(0, len(all_days) - n):]
    max_val = max(list(days7) + [1])
    bar_w, gap = 10, 4
    parts: List[str] = []
    # baseline rule
    total_w = n * (bar_w + gap) - gap
    parts.append(f'<rect x="{x}" y="{y_baseline}" width="{total_w}" height="1" fill="{bg}" opacity="0.6"/>')
    for i, val in enumerate(days7):
        h = max(2, round(bar_h_max * val / max_val))
        bx = x + i * (bar_w + gap)
        by = y_baseline - h
        parts.append(
            f'<rect x="{bx}" y="{by}" width="{bar_w}" height="{h}" rx="2" fill="{accent}" opacity="0.85"/>'
        )
    return "".join(parts)


# ── Main generator ───────────────────────────────────────────────────────────
def generate_svg(data: Dict[str, Any], theme: str = "dark") -> str:
    """
    Build and return the complete SVG string for a SkillForge Dev Card.

    Parameters
    ----------
    data : dict  {name, username, level, total_xp, current_streak,
                  longest_streak, target_role, languages, activity_7d,
                  lc_solved, cf_rating, gh_repos}
    theme : str  "dark" | "light" | "matrix"
    """
    t = THEMES.get(theme, THEMES["dark"])

    # Safely cast all theme strings
    bg_from:   str = str(t["bg_from"])
    bg_to:     str = str(t["bg_to"])
    border:    str = str(t["border"])
    title_c:   str = str(t["title"])
    subtitle_c:str = str(t["subtitle"])
    text_c:    str = str(t["text"])
    muted_c:   str = str(t["muted"])
    accent:    str = str(t["accent"])
    accent2:   str = str(t["accent2"])
    bar_bg:    str = str(t["bar_bg"])

    # ── User data ──────────────────────────────────────────────────────────
    name        = str(data.get("name", "Developer"))[:22]
    level       = int(data.get("level", 1))
    total_xp    = int(data.get("total_xp", 0))
    streak      = int(data.get("current_streak", 0))
    target_role = str(data.get("target_role", "Developer"))[:30]
    raw_langs   = dict(data.get("languages", {}))
    activity_7d = list(data.get("activity_7d", [0] * 7))
    lc_solved   = int(data.get("lc_solved", 0))
    cf_rating   = int(data.get("cf_rating", 0))
    gh_repos    = int(data.get("gh_repos", 0))

    # Rank
    if level >= 20:   rank = "Grandmaster"
    elif level >= 15: rank = "Master"
    elif level >= 10: rank = "Expert"
    elif level >= 5:  rank = "Apprentice"
    else:             rank = "Initiate"

    # XP bar
    xp_needed = max(500 * level, 1)
    xp_pct    = min(100.0, total_xp / xp_needed * 100)

    # ── Top 4 languages ────────────────────────────────────────────────────
    total_bytes = sum(raw_langs.values()) or 1
    top_langs   = sorted(raw_langs.items(), key=lambda kv: kv[1], reverse=True)[:4]

    # ── ── BUILD SVG SECTIONS ── ──

    # LEFT COLUMN ─────────────────────────────────────────────────────────────
    # Row positions (y coords for text baseline):
    #   28  : brand
    #   52  : name
    #   67  : role
    #   83  : rank badge
    #   112 : XP label
    #   122 : XP bar
    #   155 : stat numbers
    #   167 : stat labels

    xp_bar_svg = _progress_bar(20, 122, 200, xp_pct, accent, bar_bg)

    left_col = f"""
  <!-- Brand -->
  <text x="20" y="28" font-size="10" font-weight="700" letter-spacing="1.2"
        fill="{accent}" font-family="system-ui,sans-serif">⚡ SKILLFORGE</text>

  <!-- Name -->
  <text x="20" y="54" font-size="20" font-weight="700"
        fill="{title_c}" font-family="system-ui,sans-serif">{name}</text>

  <!-- Role -->
  <text x="20" y="70" font-size="10" fill="{subtitle_c}"
        font-family="system-ui,sans-serif">{target_role}</text>

  <!-- Rank badge -->
  <rect x="20" y="80" width="90" height="17" rx="8"
        fill="{accent}22" stroke="{accent}" stroke-width="0.8"/>
  <text x="65" y="92" font-size="9" font-weight="600" text-anchor="middle"
        fill="{accent}" font-family="system-ui,sans-serif">Lv.{level} · {rank}</text>

  <!-- XP label -->
  <text x="20" y="112" font-size="8.5" fill="{muted_c}"
        font-family="system-ui,sans-serif">XP {total_xp:,} / {xp_needed:,}</text>
  {xp_bar_svg}

  <!-- Stats row -->
  <text x="20"  y="155" font-size="18" font-weight="700"
        fill="{accent2}" font-family="system-ui,sans-serif">{lc_solved}</text>
  <text x="20"  y="167" font-size="8"  fill="{muted_c}"
        font-family="system-ui,sans-serif">LC Solved</text>

  <text x="88"  y="155" font-size="18" font-weight="700"
        fill="{accent2}" font-family="system-ui,sans-serif">{cf_rating}</text>
  <text x="88"  y="167" font-size="8"  fill="{muted_c}"
        font-family="system-ui,sans-serif">CF Rating</text>

  <text x="160" y="155" font-size="18" font-weight="700"
        fill="{accent2}" font-family="system-ui,sans-serif">{gh_repos}</text>
  <text x="160" y="167" font-size="8"  fill="{muted_c}"
        font-family="system-ui,sans-serif">Repos</text>

  <!-- Streak (bottom-left) -->
  <text x="20" y="197" font-size="8.5" fill="{muted_c}"
        font-family="system-ui,sans-serif">🔥 {streak}-day streak</text>"""

    # RIGHT COLUMN ────────────────────────────────────────────────────────────
    # Layout (x starts at DIVIDER_X + 15 = 255):
    #   Row 1: "TOP LANGUAGES" heading y=28
    #   Languages start y=42, spacing 22px each:
    #     label  at y, bar at y+8  (up to 4 langs → 42, 64, 86, 108)
    #   Separator at y=130
    #   "7-DAY ACTIVITY" label at y=144
    #   Activity bars baseline at y=190
    #   Streak at y=205

    RX = DIVIDER_X + 16  # right column x start = 256
    RW = CARD_W - RX - 12  # bar width for language progress bars = ~227

    lang_rows = ""
    for i, (lang, bytes_count) in enumerate(top_langs):
        pct   = round(bytes_count / total_bytes * 100)
        color = _get_lang_color(t, lang)
        ly    = 42 + i * 22
        lang_rows += (
            f'\n  <text x="{RX}" y="{ly}" font-size="9" fill="{text_c}"'
            f' font-family="system-ui,sans-serif">'
            f'{lang} <tspan fill="{muted_c}" font-size="8">{pct}%</tspan></text>'
        )
        lang_rows += "\n  " + _progress_bar(RX, ly + 5, RW, pct, color, bar_bg)

    # Build activity bars — baseline at y=192, max bar height 30px
    activity_svg = _activity_bars(RX, 192, activity_7d, accent, muted_c, bar_h_max=30)

    right_col = f"""
  <!-- TOP LANGUAGES heading -->
  <text x="{RX}" y="26" font-size="8.5" font-weight="600" letter-spacing="0.8"
        fill="{subtitle_c}" font-family="system-ui,sans-serif">TOP LANGUAGES</text>
  {lang_rows}

  <!-- Thin separator -->
  <line x1="{RX}" y1="133" x2="{CARD_W - 12}" y2="133"
        stroke="{border}" stroke-width="0.6" opacity="0.5"/>

  <!-- 7-DAY ACTIVITY heading -->
  <text x="{RX}" y="148" font-size="8.5" font-weight="600" letter-spacing="0.8"
        fill="{subtitle_c}" font-family="system-ui,sans-serif">7-DAY ACTIVITY</text>

  <!-- Activity bars -->
  {activity_svg}

  <!-- Streak label (right column, bottom-right) -->
  <text x="{CARD_W - 12}" y="205" font-size="8" text-anchor="end"
        fill="{muted_c}" font-family="system-ui,sans-serif">🔥 {streak}d streak</text>"""

    # ── FINAL SVG ──────────────────────────────────────────────────────────
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg"
     width="{CARD_W}" height="{CARD_H}" viewBox="0 0 {CARD_W} {CARD_H}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="{bg_from}"/>
      <stop offset="100%" stop-color="{bg_to}"/>
    </linearGradient>
  </defs>

  <!-- Card background -->
  <rect width="{CARD_W}" height="{CARD_H}" rx="12"
        fill="url(#bgGrad)" stroke="{border}" stroke-width="1"/>

  <!-- Vertical divider -->
  <line x1="{DIVIDER_X}" y1="16" x2="{DIVIDER_X}" y2="{CARD_H - 16}"
        stroke="{border}" stroke-width="0.7" opacity="0.5"/>

  {left_col}
  {right_col}
</svg>"""

    return svg
