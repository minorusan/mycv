/* DEV ONLY — drag-and-drop asset slot in the detail panel.
   Needs dev-server.py running; stays invisible on any static host.
   To remove: delete this file, dev-server.py, and the <script> tag in index.html. */

(() => {
  let live = false;

  const css = `
    .dev-drop {
      margin: 22px 0 0;
      padding: 18px 16px;
      border: 1px dashed var(--border);
      border-radius: 6px;
      background: rgba(187, 154, 247, 0.04);
      text-align: center;
      font-family: var(--mono);
      font-size: 11.5px;
      color: var(--muted);
      transition: border-color 0.12s, background 0.12s;
    }
    .dev-drop.is-over { border-color: var(--accent); background: rgba(53, 192, 138, 0.1); color: var(--text); }
    .dev-drop b { display: block; font-weight: 500; color: var(--subtle); }
    .dev-drop .dest { color: var(--purple); }
    .dev-drop ul { margin: 12px 0 0; padding: 0; list-style: none; text-align: left; }
    .dev-drop li { font-size: 11px; color: var(--accent-bright); margin-bottom: 3px; overflow-wrap: anywhere; }
    .dev-drop li.bad { color: #ff8a8a; }

    .row { position: relative; }
    .row.dev-gone { display: none; }
    .dev-bin {
      position: absolute;
      right: 0;
      top: 0;
      height: var(--row-h);
      width: 28px;
      display: none;
      align-items: center;
      justify-content: center;
      border: 0;
      padding: 0;
      cursor: pointer;
      color: var(--faint);
      background: var(--raised);
    }
    .row:hover .dev-bin { display: flex; }
    .dev-bin:hover { color: #ff8a8a; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* the open panel is branch-scoped for workplaces; the folder is the branch's last segment */
  const folderOf = (c) => {
    const b = byId[c.merge || c.branch];
    return b && b.kind === 'job' ? b.id.split('/').pop() : null;
  };

  async function send(file, folder, list) {
    const li = document.createElement('li');
    li.textContent = `… ${file.name}`;
    list.appendChild(li);
    try {
      const res = await fetch('/_dev/upload', {
        method: 'POST',
        headers: { 'X-Folder': folder, 'X-Filename': encodeURIComponent(file.name) },
        body: file,
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const { path } = await res.json();
      li.textContent = path;
    } catch (err) {
      li.className = 'bad';
      li.textContent = `${file.name} — ${err.message}`;
    }
  }

  function mount(i) {
    if (!live) return;
    const folder = folderOf(LOG[i]);
    if (!folder) return;

    const zone = document.createElement('div');
    zone.className = 'dev-drop';
    zone.innerHTML = `<b>drop assets here</b><span class="dest">assets/${folder}/</span><ul></ul>`;
    document.querySelector('.detail-body').appendChild(zone);

    const list = zone.querySelector('ul');
    const over = (on) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.toggle('is-over', on);
    };
    zone.addEventListener('dragover', over(true));
    zone.addEventListener('dragenter', over(true));
    zone.addEventListener('dragleave', over(false));
    zone.addEventListener('drop', (e) => {
      over(false)(e);
      for (const f of e.dataTransfer.files) send(f, folder, list);
    });
  }

  const BIN = `<svg width="11" height="12" viewBox="0 0 11 12" fill="none"
      stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 2.5h9M4 2.5V1.3h3v1.2M2.1 2.5l.6 8.2h5.6l.6-8.2M4.3 4.8v4M6.7 4.8v4"/></svg>`;

  async function bin(row) {
    const c = LOG[Number(row.dataset.i)];
    try {
      await fetch('/_dev/remove', {
        method: 'POST',
        headers: {
          'X-Commit': encodeURIComponent(c.id),
          'X-Subject': encodeURIComponent(c.subject),
        },
      });
      row.classList.add('dev-gone');
    } catch (err) {
      console.warn('bin failed', err);
    }
  }

  function bins(gone) {
    for (const row of document.querySelectorAll('.row')) {
      if (gone.includes(LOG[Number(row.dataset.i)].id)) row.classList.add('dev-gone');
      const b = document.createElement('button');
      b.className = 'dev-bin';
      b.title = 'remove from the CV';
      b.innerHTML = BIN;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        bin(row);
      });
      row.appendChild(b);
    }
  }

  /* the page must not open a dropped file when it misses the zone */
  for (const ev of ['dragover', 'drop']) addEventListener(ev, (e) => e.preventDefault());

  fetch('/_dev/removed')
    .then((r) => {
      if (!r.ok) throw new Error('no dev server');
      live = true;
      return r.json();
    })
    .then(({ ids }) => {
      bins(ids);
      const open = document.querySelector('.row.is-selected');
      if (open) mount(Number(open.dataset.i));
    })
    .catch(() => {});

  const base = window.renderDetail;
  window.renderDetail = function (i) {
    base(i);
    mount(i);
  };
})();
