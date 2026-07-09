// cadmo-grammar — THE single grammar for Cadmo front matter and watch-globs.
// Every consumer (spec-drift, cadmo-score, the plugin's Stop hook, the scaffolded
// copy) uses THIS logic; the copies are byte-identical and guarded by
// scripts/check-template-sync.sh. Round-4 review found three divergent
// reimplementations (one carrying an already-fixed globstar bug) — hence this file.
//
// Accepted `watches:` forms (all equivalent):
//   watches:            |  watches:          |  watches: [a/**, b.py]  |  watches: a/**
//     - a/**            |  - a/**            |
//     - b.py            |  - b.py            |
// (indented block, unindented block, inline array, single inline value)

export function frontMatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  return { fm: text.slice(3, end), end };
}

function unquote(s) {
  return s.trim().replace(/^["']|["']$/g, '');
}

export function parseWatches(text) {
  const parsed = frontMatter(text);
  if (!parsed) return null;
  const lines = parsed.fm.split(/\r?\n/);
  const watches = [];
  let inWatches = false;
  for (const line of lines) {
    const head = line.match(/^watches:\s*(.*)$/);
    if (head) {
      inWatches = true;
      const inline = head[1].trim();
      if (inline.startsWith('[')) {
        for (const part of inline.replace(/^\[|\]\s*$/g, '').split(',')) {
          const v = unquote(part);
          if (v) watches.push(v);
        }
        inWatches = false; // inline array is complete on this line
      } else if (inline) {
        watches.push(unquote(inline)); // single inline value
        inWatches = false;
      }
      continue;
    }
    if (inWatches) {
      const item = line.match(/^\s*-\s+(.+?)\s*$/); // indented OR unindented list item
      if (item) watches.push(unquote(item[1]));
      else if (line.trim() !== '') inWatches = false; // next key ends the block
    }
  }
  return watches.length ? watches : null;
}

export function parseReviewed(text) {
  const parsed = frontMatter(text);
  if (!parsed) return null;
  for (const line of parsed.fm.split(/\r?\n/)) {
    const m = line.match(/^reviewed:\s*(\S+)\s*$/);
    if (m) return m[1];
  }
  return null;
}

// Glob -> RegExp. `*` matches within one path segment; `**` matches zero or more
// segments (gitignore semantics: src/**/auth.js matches src/auth.js).
// Zero-backslash implementation (escaping via char classes / fromCharCode).
const BS = String.fromCharCode(92);
export function globToRegex(glob) {
  let esc = '';
  for (const ch of glob) {
    if (ch === '*' || ch === '/') esc += ch;
    else if ('.+^$(){}|[]?'.includes(ch) || ch === BS) esc += BS + ch;
    else esc += ch;
  }
  esc = esc.split('**').join('__DSTAR__');
  esc = esc.split('*').join('[^/]*');
  esc = esc.split('/__DSTAR__/').join('/(?:.*/)?'); // a/**/b -> a/b and a/x/y/b
  esc = esc.split('__DSTAR__/').join('(?:.*/)?');   // **/b  -> b and x/b
  esc = esc.split('/__DSTAR__').join('(?:/.*)?');   // a/**  -> a and a/x
  esc = esc.split('__DSTAR__').join('.*');          // bare **
  return new RegExp('^' + esc + '$');
}

export function anyMatch(watches, file) {
  return watches.some((w) => globToRegex(w).test(file));
}
