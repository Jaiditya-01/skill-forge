import urllib.request, re
url = 'https://github.com/users/octocat/contributions'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
# GitHub's old format used data-count="X" data-date="YYYY-MM-DD"
# New format is <tool-tip id="tooltip-...-2024-03-25" ...>X contributions on ...</tool-tip>
# Let's just find "X contributions on YYYY-MM-DD" or similar if they exist.
# Actually, the SVG has: `<rect ... data-date="2024-03-25" id="contribution-day-component-1-2" ...>`
# and the tooltip has: `<tool-tip for="contribution-day-component-1-2" ...>12 contributions on ...</tool-tip>`
# Let's map id to date from rects, then map id to count from tooltips.

rects = re.findall(r'<rect[^>]+id="([^"]+)"[^>]+data-date="([^"]+)"', html)
tooltips = re.findall(r'<tool-tip[^>]+for="([^"]+)"[^>]*>([^<]+)</tool-tip>', html)

date_map = {rect_id: date for rect_id, date in rects}
daily_counts = {}
for tooltip_id, text in tooltips:
    if tooltip_id in date_map:
        date = date_map[tooltip_id]
        m = re.search(r'^(\d+|No) contributions', text.strip())
        if m:
            count = 0 if m.group(1) == 'No' else int(m.group(1))
            daily_counts[date] = count

print("Last 5 days:")
for d in sorted(daily_counts.keys())[-5:]:
    print(d, daily_counts[d])
