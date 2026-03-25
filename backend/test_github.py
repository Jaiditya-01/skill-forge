import urllib.request, re
url = 'https://github.com/users/octocat/contributions'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
# Find tooltips
rects = re.findall(r'<tool-tip[^>]*for="contribution-day-component-[^>]*>([^<]+)</tool-tip>', html)
print(rects[-5:])
