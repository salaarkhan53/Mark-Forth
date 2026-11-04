"""Build a GitHub Pages preview of the site under /Mark-Forth/.

Copies site/dist, prefixes every root-relative address with the base path, serves the job list
from a static file (Pages has no PHP), and keeps the preview out of search engines.
"""
import io, os, re, shutil, sys

SRC = 'X:/MarkForth Website/site/dist'
OUT = sys.argv[1]
JOBS = sys.argv[2]
BASE = '/Mark-Forth'
# On the preview only, "Agent Login" opens the public demo of the new portal.
# The real site (site/dist and markforth-upload.zip) keeps https://agents.markforthsol.com.
REAL_PORTAL = 'https://agents.markforthsol.com'
PORTAL_PREVIEW = 'https://markforth-portal-demo.markforth.workers.dev/login'

if os.path.exists(OUT):
    for name in os.listdir(OUT):
        if name == '.git':
            continue
        p = os.path.join(OUT, name)
        shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
else:
    os.makedirs(OUT)
for name in os.listdir(SRC):
    s, d = os.path.join(SRC, name), os.path.join(OUT, name)
    shutil.copytree(s, d) if os.path.isdir(s) else shutil.copy2(s, d)

roots = sorted(os.listdir(SRC)) + ['api/']
alt = '|'.join(re.escape(r) for r in roots)
# a "/" that starts a site address: after a quote, bracket, = or space, followed by a known top-level name.
# Addresses like "/#privacy" are only rewritten inside pages: in scripts the same characters can be
# code, for example the regular expression /#pragma/ inside the 3D library.
ROOTED = re.compile(r'(?<=["\'(=\s,])/(?=(?:' + alt + r'))')
ROOTED_PAGE = re.compile(r'(?<=["\'(=\s,])/(?=(?:' + alt + r'|#|\?))')
BARE_HOME = re.compile(r'(?<=href=")/(?=")')

changed = 0
for dirpath, _, files in os.walk(OUT):
    # third-party libraries are left exactly as they are
    if '.git' in dirpath or 'vendor' in dirpath.replace(os.sep, '/').split('/'):
        continue
    for f in files:
        if not f.endswith(('.html', '.css', '.js', '.webmanifest', '.xml')):
            continue
        p = os.path.join(dirpath, f)
        s = io.open(p, encoding='utf-8').read()
        o = s
        # the job list: a static copy instead of the PHP endpoint
        s = s.replace('/api/jobs.php', BASE + '/assets/preview-jobs.json')
        s = s.replace(REAL_PORTAL, PORTAL_PREVIEW)
        s = (ROOTED_PAGE if f.endswith('.html') else ROOTED).sub(BASE + '/', s)
        if f.endswith('.html'):
            s = BARE_HOME.sub(BASE + '/', s)
            # keep the preview out of search results (the real site is markforthsol.com)
            if 'name="robots"' not in s:
                s = s.replace('<meta charset="UTF-8">', '<meta charset="UTF-8"><meta name="robots" content="noindex,nofollow">', 1)
        if s != o:
            io.open(p, 'w', encoding='utf-8').write(s)
            changed += 1

shutil.copy2(JOBS, os.path.join(OUT, 'assets', 'preview-jobs.json'))
io.open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
io.open(os.path.join(OUT, '.nojekyll'), 'w').write('')
# Pages serves 404.html for missing addresses
print('files rewritten:', changed)
