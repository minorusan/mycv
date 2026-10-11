/* Graph layout + rendering. Content lives in data.js. */

const ROW_H = 34;
const LANE_W = 18;
const LANE_X0 = 14;

const byId = Object.fromEntries(BRANCHES.map((b) => [b.id, b]));
const tagById = Object.fromEntries(TAGS.map((t) => [t.id, t]));
const MAIN = REPO.head;

/* ---------- derived model ---------- */

function sha(seed) {
  let h = 0x811c9dc5;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let out = '';
  for (let i = 0; i < 2; i++) {
    out += h.toString(16).padStart(8, '0');
    h = Math.imul(h ^ (h >>> 13), 0x85ebca6b) >>> 0;
  }
  return out.slice(0, 7);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/* A month-only date sorts as mid-month, so day-precision courses slot around the work. */
const key = (d) => (d.length === 7 ? d + '-15' : d);
/* Day precision is kept in the data for ordering; the log only ever shows month and year. */
function fmtDate(d) {
  const [y, m] = d.split('-');
  return `${MONTHS[+m - 1]} ${y}`;
}

LOG.sort((a, b) => (key(a.date) < key(b.date) ? 1 : key(a.date) > key(b.date) ? -1 : 0));

/* Vertical span of every branch off the trunk, in row indices (0 = newest row). */
const span = {};
LOG.forEach((c, i) => {
  const b = c.merge || c.branch;
  if (b === MAIN) return;
  const s = (span[b] ||= { top: i, bot: i, merged: false });
  s.top = Math.min(s.top, i);
  s.bot = Math.max(s.bot, i);
  if (c.merge) s.merged = true;
});
/* `tip` is where the branch label and merge node sit. An unmerged branch is still alive at HEAD,
   so its lane is drawn all the way to the top of the log instead of stopping at its newest commit. */
for (const s of Object.values(span)) {
  s.tip = s.top;
  if (!s.merged) s.top = 0;
}

/* Lowest free lane per branch — lanes are recycled once a branch closes, like Fork does. */
const lane = { [MAIN]: 0 };
const taken = [];
Object.entries(span)
  .sort((a, b) => b[1].bot - a[1].bot)
  .forEach(([id, s]) => {
    let l = 1;
    while ((taken[l] || []).some((r) => !(r.bot < s.top || r.top > s.bot))) l++;
    (taken[l] ||= []).push(s);
    lane[id] = l;
  });
const MAX_LANE = Math.max(0, ...Object.values(lane));
const GRAPH_W = LANE_X0 * 2 + MAX_LANE * LANE_W + 14;

const commitsOf = (id) => LOG.filter((c) => c.branch === id || c.merge === id);
const taggedWith = (id) => LOG.filter((c) => c.tag === id);

/* ---------- graph drawing ---------- */

const x = (l) => LANE_X0 + l * LANE_W;

function graph(i) {
  const c = LOG[i];
  const h = ROW_H;
  const hc = h / 2;
  const seg = [];
  const curve = [];

  /* the trunk runs the whole log, stopping at the root commit */
  seg.push({ l: 0, y1: 0, y2: c.root ? hc : h, color: byId[MAIN].color });

  for (const [id, s] of Object.entries(span)) {
    if (i < s.top || i > s.bot) continue;
    const l = lane[id];
    const col = byId[id].color;

    if (s.merged && i === s.tip) {
      /* the branch dies into the trunk here */
      curve.push({ d: `M ${x(l)} ${h} C ${x(l)} ${hc} ${x(l)} ${hc} ${x(0)} ${hc}`, color: col });
    } else if (i === s.bot) {
      /* and is born out of it here */
      seg.push({ l, y1: 0, y2: hc, color: col });
      curve.push({ d: `M ${x(0)} ${h} C ${x(0)} ${hc} ${x(l)} ${hc} ${x(l)} ${hc}`, color: col });
    } else {
      seg.push({ l, y1: 0, y2: h, color: col });
    }
  }

  const nodeLane = c.merge || c.branch === MAIN ? 0 : lane[c.branch];
  const nodeColor = c.tag ? tagById[c.tag].color : byId[c.merge || c.branch].color;

  const body = [
    ...seg.map((s) => `<line x1="${x(s.l)}" y1="${s.y1}" x2="${x(s.l)}" y2="${s.y2}" stroke="${s.color}" stroke-width="1.6"/>`),
    ...curve.map((p) => `<path d="${p.d}" fill="none" stroke="${p.color}" stroke-width="1.6"/>`),
    c.merge
      ? `<circle cx="${x(0)}" cy="${hc}" r="5" fill="var(--bg)" stroke="${nodeColor}" stroke-width="2"/>`
      : `<circle cx="${x(nodeLane)}" cy="${hc}" r="3.6" fill="${nodeColor}" stroke="var(--bg)" stroke-width="2"/>`,
  ].join('');

  return `<svg class="graph" width="${GRAPH_W}" height="${h}" viewBox="0 0 ${GRAPH_W} ${h}">${body}</svg>`;
}

/* ---------- rendering ---------- */

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const chip = (label, color) => `<span class="ref-chip" style="color:${color};border-color:${color}66">${esc(label)}</span>`;

function renderSidebar() {
  const p = PROFILE;
  document.querySelector('.identity').innerHTML = `
    <img src="${p.avatar}" alt="${esc(p.name)}">
    <div class="name">${esc(p.name)}</div>
    <div class="role">${esc(p.role)}</div>
    <dl>
      <dt>where</dt><dd>${esc(p.location)}</dd>
      <dt>tel</dt><dd><a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></dd>
      <dt>mail</dt><dd><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></dd>
    </dl>`;

  const item = (o, n, head) => `<button class="branch${head ? ' is-head' : ''}" data-ref="${esc(o.id)}">
      <i class="dot" style="background:${o.color}"></i>
      <span class="label">${esc(o.name)}${o.note ? `<span class="note">${esc(o.note)}</span>` : ''}</span>
      <span class="count">${n}</span>
    </button>`;

  document.querySelector('#branches').innerHTML = BRANCHES.map((b) =>
    item(b, commitsOf(b.id).length, b.kind === 'head')
  ).join('');
  document.querySelector('#tags').innerHTML = TAGS.map((t) => item(t, taggedWith(t.id).length, false)).join('');

  const meters = (list) =>
    list
      .map(
        (s) => `<div class="meter">
          <div class="mlabel"><span>${esc(s.name)}</span></div>
          <div class="track"><i class="fill" style="width:${Math.round(s.level * 100)}%"></i></div>
        </div>`
      )
      .join('');
  document.querySelector('#skills').innerHTML = meters(PROFILE.skills);
  document.querySelector('#languages').innerHTML = meters(PROFILE.languages);
}

const HEAD_ROW = LOG.findIndex((c) => c.branch === MAIN);

function renderLog() {
  document.documentElement.style.setProperty('--graph-w', GRAPH_W + 'px');
  document.querySelector('.rows').innerHTML = LOG.map((c, i) => {
    /* the chip names the branch the commit sits ON, so a merge reads as trunk, not as itself */
    const on = byId[c.branch];
    const chips =
      (i === HEAD_ROW ? chip(`HEAD → ${MAIN}`, byId[MAIN].color) : chip(on.name, on.color)) +
      (c.tag ? chip(tagById[c.tag].name, tagById[c.tag].color) : '');
    const role = c.role
      ? `<span style="color:var(--muted);font-weight:400"> — ${esc(c.role.title)}, ${esc(c.role.company)}</span>`
      : '';
    return `<div class="row${c.merge ? ' is-merge' : ''}${c.root ? ' is-root' : ''}" data-i="${i}" data-ref="${esc(
      c.tag || c.merge || c.branch
    )}" style="--tint: ${i === HEAD_ROW ? byId[MAIN].color : on.color}">
      ${graph(i)}
      <div class="subject">${chips}<span class="text">${esc(c.subject)}${role}</span></div>
      <div class="sha">${sha(c.id)}</div>
      <div class="date">${fmtDate(c.date)}</div>
    </div>`;
  }).join('');
}

const sec = (title, html) => (html ? `<h4>${title}</h4>${html}` : '');

const card = (title, where, when, summary) => `<div class="role-card">
    <div class="title">${esc(title)}</div>
    <div class="where">${esc(where)}</div>
    <div class="when">${esc(when)}</div>
    ${(summary || []).map((t) => `<p class="summary">${esc(t)}</p>`).join('')}
  </div>`;

const diffstat = (lines) =>
  lines.length
    ? `<div class="diffstat">${lines.map((l) => `<div class="line"><span class="plus">+</span><span>${esc(l)}</span></div>`).join('')}</div>`
    : '';

const reflist = (refs) =>
  refs.length
    ? `<div class="reflist">${refs.map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)} ↗</a>`).join('')}</div>`
    : '';

/* An embed has to behave like the local videos: start itself, loop, stay silent. `background`
   additionally strips the player chrome, which is what the panel wants and the gallery does not. */
const EMBED_ALLOW = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
const embedSrc = (src, chromeless) => {
  const [base, hash] = String(src).split('#');
  return `${base}${base.includes('?') ? '&' : '?'}autoplay=1&loop=1&muted=1${
    chromeless ? '&background=1' : ''
  }${hash ? '#' + hash : ''}`;
};

/* Portrait embeds exist. `ratio` overrides the 16:9 default; anything malformed is ignored. */
const ratioVar = (m) => (/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(m.ratio || '') ? ` style="--r: ${m.ratio}"` : '');

/* Assets for the whole workplace, stacked under the role card. Video plays itself, silently. */
const mediaPanel = (items) =>
  items.length
    ? `<div class="media-card">${items
        .map((m, n) => {
          const el =
            m.type === 'video'
              ? `<video src="${esc(m.src)}" autoplay loop muted playsinline preload="metadata"${
                  m.poster ? ` poster="${esc(m.poster)}"` : ''
                }></video>`
              : m.type === 'embed'
              ? `<iframe src="${esc(embedSrc(m.src, true))}" loading="lazy" title="${esc(
                  m.caption || 'embedded video'
                )}" allow="${EMBED_ALLOW}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen frameborder="0"${ratioVar(
                  m
                )}></iframe><i class="shim"></i>`
              : `<img src="${esc(m.src)}" loading="lazy" alt="${esc(m.caption || '')}">`;
          return `<figure class="media-item" data-n="${n}" tabindex="0">${el}${
            m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ''
          }</figure>`;
        })
        .join('')}</div>`
    : '';

/* One bullet of a CV entry: lead paragraph, any extra paragraphs, then its sub-bullets. */
const bullet = (c) => `<li>${(c.body || []).map((p, n) => (n ? `<p>${esc(p)}</p>` : esc(p))).join('')}${
  (c.sub || []).length ? `<ul>${c.sub.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''
}</li>`;

const uniq = (a) => [...new Set(a)];

/* A commit on a workplace branch opens that whole workplace, straight out of the CV. */
function renderJob(branchId) {
  /* A finished job carries its role on the merge commit; the current one carries it on the branch. */
  const head = LOG.find((c) => c.merge === branchId) || byId[branchId];
  const work = LOG.filter((c) => c.branch === branchId);
  const r = head.role;

  shots = work.flatMap((c) => c.media || []);

  return `
    ${card(r.title, `${r.company} · ${r.place}`, r.period, head.body)}
    ${mediaPanel(shots)}
    <ul>${work.map(bullet).join('')}</ul>
    ${sec('Stack', diffstat(uniq(work.flatMap((c) => c.stack || []))))}
    ${sec('Links', reflist(work.flatMap((c) => c.refs || [])))}`;
}

/* Anything off a workplace branch — the root commit, a tagged course — is its own story. */
function renderCommit(c, parent) {
  shots = c.media || [];
  return `
    <h3>${esc(c.subject)}</h3>
    <dl class="trailers">
      <dt>author</dt><dd>${esc(PROFILE.name)} &lt;${esc(PROFILE.email)}&gt;</dd>
      <dt>date</dt><dd>${fmtDate(c.date)}</dd>
      <dt>parent</dt><dd>${parent ? sha(parent.id) : '(root commit)'}</dd>
    </dl>
    ${(c.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}
    ${sec('Education', c.education ? card(c.education.degree, `${c.education.school} · ${c.education.place}`, c.education.period) : '')}
    ${mediaPanel(shots)}
    ${sec('Changed files', diffstat(c.stack || []))}
    ${sec('Links', reflist(c.refs || []))}`;
}

function renderDetail(i) {
  const c = LOG[i];
  const ref = byId[c.merge || c.branch];
  const job = ref.kind === 'job' ? ref.id : null;

  document.querySelector('.detail-head').innerHTML = `
    <span class="sha">${sha(c.id)}</span>
    ${chip(ref.name, ref.color)}
    ${c.tag ? chip(tagById[c.tag].name, tagById[c.tag].color) : ''}
    <button class="close" aria-label="Close">×</button>`;

  document.querySelector('.detail-body').innerHTML = job ? renderJob(job) : renderCommit(c, LOG[i + 1]);
  document.querySelector('.detail').scrollTop = 0;

  document.querySelector('.detail').classList.add('is-open');
  document.querySelectorAll('.row.is-selected').forEach((r) => r.classList.remove('is-selected'));
  document.querySelector(`.row[data-i="${i}"]`).classList.add('is-selected');
}

/* ---------- the gallery overlay ---------- */

let shots = [];
let shotAt = 0;

const lb = () => document.querySelector('.lightbox');

function showShot(n) {
  if (!shots.length) return;
  shotAt = (n + shots.length) % shots.length;
  const m = shots[shotAt];
  const el = lb();
  el.querySelector('.lb-stage').innerHTML =
    m.type === 'video'
      ? `<video src="${esc(m.src)}" autoplay loop muted playsinline controls></video>`
      : m.type === 'embed'
      ? `<iframe src="${esc(embedSrc(m.src, false))}" title="${esc(
          m.caption || 'embedded video'
        )}" allow="${EMBED_ALLOW}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen frameborder="0"${ratioVar(
          m
        )}></iframe>`
      : `<img src="${esc(m.src)}" alt="${esc(m.caption || '')}">`;
  el.querySelector('.lb-caption').textContent = m.caption || '';
  el.querySelector('.lb-count').textContent = shots.length > 1 ? `${shotAt + 1} / ${shots.length}` : '';
  el.querySelectorAll('.lb-step').forEach((b) => b.classList.toggle('is-hidden', shots.length < 2));
  el.classList.add('is-open');
}

function closeShot() {
  const el = lb();
  el.classList.remove('is-open');
  el.querySelector('.lb-stage').innerHTML = ''; /* stops playback */
}

const shotOpen = () => lb().classList.contains('is-open');

/* ---------- interaction ---------- */

let activeRef = null;

function filterRef(id) {
  activeRef = activeRef === id ? null : id;
  document.querySelectorAll('.branch').forEach((el) => el.classList.toggle('is-active', el.dataset.ref === activeRef));
  document.querySelectorAll('.row').forEach((el) => el.classList.toggle('is-dimmed', !!activeRef && el.dataset.ref !== activeRef));
  if (!activeRef) return;
  stopScroll();
  const first = document.querySelector(`.row[data-ref="${CSS.escape(activeRef)}"]`);
  if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function wire() {
  document.querySelector('.rows').addEventListener('click', (e) => {
    const row = e.target.closest('.row');
    if (row) {
      stopScroll();
      renderDetail(Number(row.dataset.i));
    }
  });
  document.querySelector('.sidebar').addEventListener('click', (e) => {
    const b = e.target.closest('.branch');
    if (b) filterRef(b.dataset.ref);
  });
  document.querySelector('.detail').addEventListener('click', (e) => {
    if (e.target.closest('.close')) return document.querySelector('.detail').classList.remove('is-open');
    const item = e.target.closest('.media-item');
    if (item) showShot(Number(item.dataset.n));
  });
  document.querySelector('.detail').addEventListener('keydown', (e) => {
    const item = e.target.closest('.media-item');
    if (item && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      showShot(Number(item.dataset.n));
    }
  });

  lb().addEventListener('click', (e) => {
    const step = e.target.closest('.lb-step');
    if (step) return showShot(shotAt + Number(step.dataset.step));
    if (!e.target.closest('.lb-stage')) closeShot();
  });

  document.addEventListener('keydown', (e) => {
    if (shotOpen()) {
      if (e.key === 'Escape') closeShot();
      if (e.key === 'ArrowRight') showShot(shotAt + 1);
      if (e.key === 'ArrowLeft') showShot(shotAt - 1);
      return;
    }
    if (e.key !== 'Escape') return;
    document.querySelector('.detail').classList.remove('is-open');
    stopScroll();
  });
}

/* ---------- the opening autoscroll: hold on the root commit, then snap up to today ---------- */

const HOLD_MS = 1000;
const RUN_MS = 1000;

const log = () => document.querySelector('.log');
let raf = null;

function stopScroll() {
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  document.querySelector('.rewind').classList.remove('is-visible');
}

function playback() {
  const el = log();
  const pill = document.querySelector('.rewind');
  const bar = pill.querySelector('.bar i');

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  el.scrollTop = el.scrollHeight;
  const from = el.scrollTop;
  if (from < 200) return;

  const t0 = performance.now() + HOLD_MS;
  pill.classList.add('is-visible');

  const step = (t) => {
    const k = Math.min(1, Math.max(0, (t - t0) / RUN_MS));
    const eased = 0.5 - Math.cos(Math.PI * k) / 2;
    el.scrollTop = from * (1 - eased);
    bar.style.width = `${k * 100}%`;
    if (k < 1) raf = requestAnimationFrame(step);
    else stopScroll();
  };
  raf = requestAnimationFrame(step);

  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((ev) =>
    addEventListener(ev, stopScroll, { once: true, passive: true })
  );
}

/* ---------- boot ---------- */

renderSidebar();
renderLog();
wire();

document.querySelector('#repo-path').innerHTML = `${esc(REPO.owner)}/<b>${esc(REPO.name)}</b>`;
document.querySelector('#head-branch').textContent = MAIN;
document.querySelector('#head-branch-2').textContent = MAIN;
document.querySelector('#counts').textContent = `${LOG.length} commits · ${BRANCHES.length} branches`;
document.querySelector('#toolbar-links').innerHTML = PROFILE.links
  .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
  .join('');

playback();
