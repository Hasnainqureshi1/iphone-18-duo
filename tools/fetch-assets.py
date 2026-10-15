"""Download the public artwork used by this local interface study."""
import concurrent.futures
import json
import pathlib
import re
import urllib.request

root = pathlib.Path(__file__).resolve().parents[1]
source = (root / 'assets/apple-apps-source.html').read_text(encoding='utf-8')
names = {'phone','messages','facetime','mail','photos','camera','notes','clock','weather','music','files','maps','calendar','app_store','safari','health','wallet','reminders','shortcuts','tv','settings','calculator'}
jobs = {}
for path in re.findall(r'/v/apps/[^\s"<>]+_xlarge.png', source):
    if '/chiclets/' not in path:
        continue
    name = path.rsplit('/', 1)[1].split('_chiclet')[0]
    if name in names:
        jobs['icons/' + name.replace('app_store', 'appstore') + '.png'] = 'https://www.apple.com' + path
jobs.update({
    'dunes.jpg': 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1800&q=90&fit=crop',
    'memory.jpg': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=85&fit=crop',
    'coast.jpg': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1000&q=85&fit=crop',
    'forest.jpg': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&q=85&fit=crop',
})
def fetch(item):
    name, url = item
    dest = root / 'assets' / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        with urllib.request.urlopen(url, timeout=35) as response:
            dest.write_bytes(response.read())
        return name, url
    except Exception as error:
        print(name, str(error))
        return None
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    results = dict(result for result in pool.map(fetch, jobs.items()) if result)
(root / 'assets/sources.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
(root / 'js/asset-manifest.js').write_text('window.DUO_ASSETS = ' + json.dumps(results) + ';\n', encoding='utf-8')
print('Downloaded', len(results), 'assets')
