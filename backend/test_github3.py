import re

html = open('github.html', 'r', encoding='utf-8').read()

# tds: list of (date, id)
tds = re.findall(r'data-date="([^"]+)"\s+id="([^"]+)"', html)
date_map = {id_: date for date, id_ in tds}

tooltips = re.findall(r'<tool-tip[^>]+for="([^"]+)"[^>]*>\s*(.*?)\s*</tool-tip>', html)

daily_counts = {}
for tooltip_id, text in tooltips:
    if tooltip_id in date_map:
        date = date_map[tooltip_id]
        m = re.search(r'^([\d,]+|No)\s+contribution', text)
        if m:
            val = m.group(1)
            count = 0 if val == 'No' else int(val.replace(',', ''))
            daily_counts[date] = count

print("Extracted days:", len(daily_counts))
print("Last 5 days:")
for d in sorted(daily_counts.keys())[-5:]:
    print(d, daily_counts[d])
