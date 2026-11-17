// Pixel garden: a night meadow where a flower grows one step per correct answer.
// Shared by index.html (the app) and garden-test.html (the test page).
(function () {
  const W = 96, H = 32, GY = H - 4, CX = 48;
  const C = {
    stem: '#3d8a45', leaf: '#57a85c', leafd: '#2f6b37', bud: '#2f6b37',
    petal: '#b48cff', petal2: '#7d5bd6', center: '#ffc53d',
    orange: '#ff8c32', red: '#ff5a4e', yellow: '#ffc53d',
    g0: '#1c3f24', g1: '#2a5e34', g2: '#3f8547', soil: '#0b140d',
    moon: '#d9d9d9', star: '#e6e6e6', stardim: '#4a4a4a', fly: '#ffe27a'
  };
  /* Flower heads to choose from. 'grid' is 9x9 pixels around the centre of the head (top row = highest);
     each letter is a color from 'pal'. The purple head is drawn in code below. */
  const HEADS = {
    purple: { name: 'Purple star', tip: 'petal' },
    sunflower: {
      name: 'Sunflower', tip: '#ffd23d',
      pal: { S: '#ffd23d', s: '#e09a1e', B: '#7a4a1e', b: '#3f2410' },
      grid: ['...S.S...', '.S.SsS.S.', '..sBBBs..', 'SsBbBbBsS', '.sBBbBBs.', 'SsBbBbBsS', '..sBBBs..', '.S.SsS.S.', '...S.S...']
    },
    poppy: {
      name: 'Red poppy', tip: '#ff5a4e',
      pal: { R: '#ff5a4e', r: '#c22b33', K: '#1a1214', g: '#5a7a3a' },
      grid: ['..rRRRr..', '.rRRRRRr.', 'rRRrRrRRr', 'RRrKKKrRR', 'RRRKgKRRR', 'RRrKKKrRR', 'rRRrRrRRr', '.rRRRRRr.', '..rRRRr..']
    },
    tulip: {
      name: 'Tulip', tip: '#ff6f8a',
      pal: { T: '#ff6f8a', t: '#c23a5e', h: '#ffc2cc' },
      grid: ['.t..T..h.', '.ttTTThh.', '.ttTTThh.', '.ttTTTTh.', '.ttTTTTh.', '..ttTTT..', '...tTT...', '.........', '.........']
    },
    rose: {
      name: 'Rose', tip: '#e0303e',
      pal: { R: '#e0303e', r: '#9e1c2c', d: '#5e0f1c', g: '#3d8a45' },
      grid: ['.........', '..rRRRr..', '.rRddRRr.', 'rRdRRdRRr', 'rRdRdRdRr', 'rRRdddRRr', '.rRRRRRr.', '..rrrrr..', '...g.g...']
    },
    cornflower: {
      name: 'Cornflower', tip: '#5a8cff',
      pal: { B: '#7aa8ff', b: '#3a5fd0', p: '#6a2a9a', P: '#b48cff' },
      grid: ['B..B.B..B', '.BbBbBbB.', '..bBbBb..', 'BBbpppbBB', '.bbpPpbb.', 'BBbpppbBB', '..bBbBb..', '.BbBbBbB.', 'B..B.B..B']
    },
    lily: {
      name: 'Pink lily', tip: '#ec8396',
      pal: { P: '#ffc2c7', p: '#ec8396', q: '#b8486a', y: '#ffb347', Y: '#ffe066' },
      grid: ['Y...P...Y', '.y.pPp.y.', 'P.ypPpy.P', '.PpypypP.', 'PPpyYypPP', '.qppyppq.', 'q.qp.pq.q', '..q...q..', '.........']
    },
    daisy: {
      name: 'White daisy', tip: '#e6e6e6',
      pal: { W: '#f2f2f2', w: '#b8b8b8', Y: '#ffc53d' },
      grid: ['...W.W...', '.W.WwW.W.', '..WwWwW..', 'WWwYYYwWW', '.wWYYYWw.', 'WWwYYYwWW', '..WwWwW..', '.W.WwW.W.', '...W.W...']
    }
  };
  // The big flower gets one of these heads, picked at random each time a garden starts
  const RANDOM_HEADS = ['purple', 'sunflower', 'tulip', 'cornflower', 'lily', 'daisy'];
  const randomHead = () => RANDOM_HEADS[Math.floor(Math.random() * RANDOM_HEADS.length)];
  const col = c => C[c] || c;   // a palette name or a color
  /* Build every growth step for one choice of flower head */
  function build(headKey) {
  let seed = 11;   // seeded random, so the meadow looks the same every visit
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* Growth steps: each correct answer reveals the next step.
     A step belongs to a plant and holds pixels [x, height above ground, color]. */
  const plants = [{ x: CX, top: 26 }];
  const steps = [];
  const add = (p, label, px) => steps.push({ p, label, px });
  let h = 0;
  const grow = (to, label = 'Stem grows') => {
    const px = [];
    for (let y = h + 1; y <= to; y++) px.push([0, y, 'stem']);
    h = to;
    add(0, label, px);
  };
  const leaf = (s, y) => [[s, y, 'leaf'], [2 * s, y, 'leaf'], [2 * s, y + 1, 'leaf'], [3 * s, y + 1, 'leafd']];

  // The big flower: stem and three leaves
  add(0, 'Sprout', [[0, 1, 'stem'], [0, 2, 'stem'], [-1, 3, 'leaf'], [1, 3, 'leaf']]); h = 2;
  grow(7);  add(0, 'Leaf, left', leaf(-1, 6));
  grow(12); add(0, 'Leaf, right', leaf(1, 11));
  grow(17); add(0, 'Leaf, left', leaf(-1, 16));

  // then straight to a large flower head, centred at height 22
  const HY = 22;
  const disc = (rMin, rMax, c) => {
    const px = [];
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.hypot(dx, dy);
      if (d > rMin && d <= rMax) px.push([dx, HY + dy, c]);
    }
    return px;
  };
  const plus = (r, c) => {
    const px = [];
    for (let i = 1; i <= r; i++) px.push([i, HY, c], [-i, HY, c], [0, HY + i, c], [0, HY - i, c]);
    return px;
  };
  const centre = [[0, HY, 'center'], [-1, HY, 'center'], [1, HY, 'center'], [0, HY + 1, 'center'], [0, HY - 1, 'center']];
  const head = HEADS[headKey] || HEADS.purple;
  if (!head.grid) {
    add(0, 'Flower bud', [[0, 18, 'stem'], [0, 19, 'stem'], [0, 20, 'bud'], [-1, 21, 'bud'], [0, 21, 'bud'], [1, 21, 'bud'], [0, 22, 'petal']]);
    add(0, 'Bud opens', [[-1, 22, 'petal'], [1, 22, 'petal'], [0, 23, 'petal'], [-1, 23, 'petal2'], [1, 23, 'petal2'], [0, 24, 'petal']]);
    add(0, 'First petals', [...plus(3, 'petal'), ...centre]);
    // fill between the first petals without covering them
    const firstSet = new Set([...plus(3), ...centre].map(([x, y]) => x + ',' + y));
    add(0, 'Flower head fills out', disc(0, 3.2, 'petal2').filter(([x, y]) => !firstSet.has(x + ',' + y)));
    // eight petal tips around the head, with gaps between them
    const tips = disc(2.9, 4.3, 'petal').filter(([x, y]) => {
      const deg = (Math.atan2(y - HY, x) * 180 / Math.PI + 360) % 45;
      return deg < 12 || deg > 33;
    });
    add(0, 'Petal tips', tips);
  } else {
    // any other head: a bud in its color, then the head opens from the centre outwards
    const t = head.tip;
    add(0, 'Flower bud', [[0, 18, 'stem'], [0, 19, 'stem'], [0, 20, 'bud'], [-1, 21, 'bud'], [0, 21, 'bud'], [1, 21, 'bud'], [0, 22, t]]);
    add(0, 'Bud opens', [[-1, 22, t], [1, 22, t], [0, 23, t], [-1, 23, 'bud'], [1, 23, 'bud'], [0, 24, t]]);
    const all = [];
    head.grid.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') all.push([c - 4, HY + 4 - r, head.pal[ch]]); }));
    const d = ([x, y]) => Math.hypot(x, y - HY);
    add(0, 'Flower opens', all.filter(p => d(p) <= 1.6));
    add(0, 'Flower head fills out', all.filter(p => d(p) > 1.6 && d(p) <= 2.9));
    add(0, 'Outer petals', all.filter(p => d(p) > 2.9));
  }
  const FULL_BLOOM = steps.length;

  // After the big flower: small meadow flowers, each appears whole in one step
  const spots = [18, 78, 8, 88, 28, 66, 37, 59, 13, 83, 23, 72, 3, 93];
  const colors = ['petal', 'orange', 'red', 'yellow'];
  spots.forEach((x, i) => {
    const fh = 3 + Math.floor(rnd() * 5), mid = Math.ceil(fh / 2), s = rnd() < 0.5 ? -1 : 1;
    const col = colors[i % colors.length], ctr = col === 'yellow' ? 'orange' : 'center';
    const p = plants.push({ x, top: fh + 2 }) - 1;
    const px = [];
    for (let y = 1; y <= fh; y++) px.push([0, y, 'stem']);
    px.push([s, mid, 'leaf'], [2 * s, mid + 1, 'leafd']);
    px.push([-1, fh + 1, col], [1, fh + 1, col], [0, fh + 2, col], [0, fh, col], [0, fh + 1, ctr]);
    add(p, `Meadow flower ${i + 1}`, px);
  });

  return { plants, steps, FULL_BLOOM };
  }
  const builds = {};
  const getBuild = key => builds[key] || (builds[key] = build(HEADS[key] ? key : DEFAULT_HEAD));
  const DEFAULT_HEAD = 'purple';

  // Backdrop pieces get their own seeded random
  let seed = 23;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // After the meadow is full: fireflies
  const flies = [...Array(24)].map(() => ({ x: 4 + rnd() * (W - 8), y: 5 + rnd() * (GY - 12), ph: rnd() * 6.28 }));
  // Sky and grass
  const stars = [...Array(30)].map(() => ({ x: Math.floor(rnd() * W), y: Math.floor(rnd() * (GY - 12)), ph: rnd() * 6.28, sp: 0.6 + rnd() * 1.6 }))
    .filter(s => !(s.x > 78 && s.x < 90 && s.y < 11));
  const moon = [];
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++)
    if (x * x + y * y <= 10 && (x - 2) * (x - 2) + (y + 1) * (y + 1) > 8) moon.push([84 + x, 6 + y]);
  const blades = [...Array(W)].map(() => 1 + Math.floor(rnd() * 4));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const wind = (t, x, still) => still ? 0 : 0.6 * Math.sin(0.9 * t - 0.06 * x) + 0.4 * Math.sin(2.3 * t - 0.13 * x + 1.7);
  const place = (pl, dx, y, t, still) => [
    pl.x + dx + Math.round(wind(t, pl.x, still) * Math.pow(Math.max(y, 0) / pl.top, 1.5) * 1.6),
    GY - y
  ];

  /* Draw the scene for a given number of correct answers.
     fx: { still: no motion, lastGrow: time of the last step (for the white flash), sparks: [...] } */
  function drawScene(g, count, ms, fx = {}) {
    const t = ms / 1000, still = fx.still || reduce.matches;
    const { steps, plants } = getBuild(fx.head || DEFAULT_HEAD);
    const dot = (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
    const flashing = fx.lastGrow !== undefined && ms - fx.lastGrow < 180;

    for (let y = 0; y < GY; y++) {
      const f = y / GY;
      g.fillStyle = f < 0.45 ? '#000000' : f < 0.7 ? '#07040d' : f < 0.88 ? '#0e0819' : '#170c2b';
      g.fillRect(0, y, W, 1);
    }
    stars.forEach(s => dot(s.x, s.y, still || Math.sin(t * s.sp + s.ph) > -0.2 ? C.star : C.stardim));
    moon.forEach(([x, y]) => dot(x, y, C.moon));

    const shown = Math.min(count, steps.length);
    for (let i = 0; i < shown; i++) {
      const st = steps[i], pl = plants[st.p];
      const white = flashing && i === count - 1;
      st.px.forEach(([dx, y, c]) => { const [x, sy] = place(pl, dx, y, t, still); dot(x, sy, white ? '#ffffff' : col(c)); });
    }

    const nFlies = Math.min(Math.max(0, count - steps.length), flies.length);
    for (let i = 0; i < nFlies; i++) {
      const f = flies[i];
      if (!still && Math.sin(t * 2 + f.ph) < -0.4) continue;
      const fx2 = Math.round(f.x + (still ? 0 : 3 * Math.sin(t * 0.7 + f.ph)));
      const fy2 = Math.round(f.y + (still ? 0 : 2 * Math.sin(t * 1.1 + f.ph * 2)));
      dot(fx2, fy2, flashing && i === nFlies - 1 ? '#ffffff' : C.fly);
    }

    g.fillStyle = C.g0; g.fillRect(0, GY, W, 1);
    g.fillStyle = C.soil; g.fillRect(0, GY + 1, W, H - GY - 1);
    for (let x = 0; x < W; x++) {
      if ((x * 7) % 5 === 0) dot(x, GY + 2, C.g0);
      const hb = blades[x], sway = hb >= 3 ? Math.round(wind(t, x, still) * 0.9) : 0;
      for (let y = 1; y <= hb; y++) dot(x + (y === hb ? sway : 0), GY - y + 1, y === hb ? C.g2 : C.g1);
    }

    (fx.sparks || []).forEach(s => {
      const k = (ms - s.born) / 1000;
      dot(Math.round(s.x + s.vx * k), Math.round(s.y - s.vy * k), s.c);
    });
  }

  const STEPS = getBuild(DEFAULT_HEAD).steps.length;
  const FULL_BLOOM = getBuild(DEFAULT_HEAD).FULL_BLOOM;
  const total = STEPS + flies.length;
  function label(n, headKey) {
    const { steps } = getBuild(headKey || DEFAULT_HEAD);
    if (n <= 0) return 'Empty meadow';
    if (n <= steps.length) return steps[n - 1].label;
    return `Firefly ${Math.min(n, total) - steps.length}`;
  }

  /* A live, animated garden on a canvas. onChange(count) runs after every change.
     opts.head picks the flower head (see Garden.heads); without it, a random one is picked. */
  function create(canvas, onChange, opts = {}) {
    canvas.width = W; canvas.height = H;
    const g = canvas.getContext('2d');
    let head = opts.head || randomHead();
    let count = 0, lastGrow = -1e9, sparks = [], lastFrame = 0;
    const changed = () => onChange && onChange(count);

    function frame(ms) {
      requestAnimationFrame(frame);
      if (ms - lastFrame < 66) return;   // about 15 frames per second, like an old screen
      lastFrame = ms;
      sparks = sparks.filter(s => ms - s.born < 800);
      drawScene(g, count, ms, { lastGrow, sparks, head });
    }

    function grow() {
      count++;
      const now = performance.now();
      lastGrow = now;
      if (!reduce.matches) {
        const { steps, plants } = getBuild(head);
        let src;
        if (count <= steps.length) {
          const st = steps[count - 1], pl = plants[st.p];
          src = st.px.map(([dx, y]) => place(pl, dx, y, now / 1000, false));
        } else src = [[W / 2, GY - 10]];
        for (let i = 0; i < 6; i++) {
          const [x, y] = src[Math.floor(Math.random() * src.length)];
          sparks.push({ x, y, vx: (Math.random() - 0.5) * 10, vy: 6 + Math.random() * 10, born: now, c: i % 2 ? C.yellow : '#ffffff' });
        }
      }
      changed();
    }

    function set(n) {
      count = Math.max(0, n);
      lastGrow = -1e9;
      sparks = [];
      changed();
    }

    requestAnimationFrame(frame);
    changed();
    return {
      grow, set,
      setHead(k) { head = k; changed(); },
      get head() { return head; },
      get count() { return count; }
    };
  }

  const heads = Object.entries(HEADS).map(([key, h]) => ({ key, name: h.name }));
  self.Garden = { W, H, FULL_BLOOM, stepCount: STEPS, total, label, drawScene, create, heads, defaultHead: DEFAULT_HEAD,
    randomHeads: RANDOM_HEADS, randomHead };
})();
