/* Urban Roots: "Grow Your Own Garden" mini-game (garden.html only).
   Pick a seed, click an empty plot to plant it, then click it again to water it.
   Every watering grows the plant one stage: Seed > Sprout > Seedling > Growing > Fully grown. */
{
  const yard = document.querySelector('.plots');
  if (yard) {
    const STAGES = ['Seed', 'Sprout', 'Seedling', 'Growing', 'Fully grown'];
    const PLOTS = 6;

    const PLANTS = {
      tomato: {
        name: 'Tomato',
        planted: 'Tomatoes are fruits, botanically speaking. In a pot they need lots of room: a container with at least 5 gallons of potting mix.',
        grown: 'Ready to pick! Fruiting crops like tomatoes need about 6 to 8 hours of direct sun each day to ripen well.',
        source: 'Alabama Extension; UC Master Gardeners',
      },
      carrot: {
        name: 'Carrot',
        planted: 'Carrots are root crops, so they need a deeper container than leafy greens. Loose, well-drained potting mix lets the roots grow easily.',
        grown: 'Carrots can handle partial shade, which makes them a good choice for a spot that does not get sun all day.',
        source: 'Univ. of Wisconsin Extension; UC Master Gardeners',
      },
      sunflower: {
        name: 'Sunflower',
        planted: 'Young sunflowers follow the sun! They face east in the morning, turn west during the day, then swing back east at night.',
        grown: 'Once a sunflower is fully grown it stops following the sun and mostly faces east. Its big flowers attract bees.',
        source: 'UC Davis plant biology research',
      },
      basil: {
        name: 'Basil',
        planted: 'Basil is an herb that grows well in containers, both outdoors and indoors under lights.',
        grown: 'Pinch off the growing tips and basil branches out into a bushier plant with more leaves to eat.',
        source: 'Penn State Extension',
      },
    };

    /* ---------- drawings (viewBox 0 0 100 120, soil line at y = 112) ---------- */
    const leafPath = (x, y, len, ang, c) =>
      `<path transform="translate(${x} ${y}) rotate(${ang})" d="M0 0C${len * .3} ${-len * .3} ${len * .75} ${-len * .25} ${len} 0C${len * .75} ${len * .25} ${len * .3} ${len * .3} 0 0Z" fill="${c}"/>`;
    const stem = (h, w = 3, c = '#3f8f52') => `<path d="M50 112C48 ${112 - h * .5} 52 ${112 - h * .8} 50 ${112 - h}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    const G = ['#2f7a45', '#3f8f52', '#57a862', '#79c27a'];

    function draw(type, stage) {
      if (stage === 0) {
        return '<ellipse cx="50" cy="112" rx="16" ry="5" fill="#5a3d2b"/><ellipse cx="50" cy="108" rx="5" ry="3.4" fill="#e7c48d" transform="rotate(-20 50 108)"/>';
      }
      if (stage === 1) {
        return stem(16) + leafPath(50, 97, 13, 200, '#79c27a') + leafPath(50, 97, 13, -20, '#57a862');
      }
      if (stage === 2) {
        if (type === 'carrot') return stem(10, 2) + [-40, -65, -90, -115, -140].map((a, i) => `<path d="M50 104l${(Math.cos(a * Math.PI / 180) * 26).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 26).toFixed(1)}" stroke="${G[i % 4]}" stroke-width="3" stroke-linecap="round"/>`).join('');
        if (type === 'basil') return stem(28) + [[96, 200], [96, -20], [86, 205], [86, -25]].map(([y, a], i) => `<ellipse cx="${a > 0 ? 42 : 58}" cy="${y}" rx="8" ry="5.5" fill="${G[(i + 1) % 4]}" transform="rotate(${a > 0 ? -25 : 25} ${a > 0 ? 42 : 58} ${y})"/>`).join('');
        return stem(34) + leafPath(50, 98, 16, 200, '#57a862') + leafPath(50, 98, 16, -20, '#3f8f52') + leafPath(50, 86, 14, 210, '#79c27a') + leafPath(50, 86, 14, -30, '#57a862');
      }
      if (type === 'tomato') {
        const h = stage === 3 ? 62 : 82;
        let s = `<path d="M34 112V${112 - h - 6}M66 112V${112 - h - 6}" stroke="#a27a52" stroke-width="3"/>` + stem(h, 4);
        for (let i = 0; i < 7; i++) s += leafPath(50, 112 - h * (.18 + i * .12), 18, i % 2 ? -25 : 205, G[i % 4]);
        if (stage === 3) s += [[44, 112 - h * .6], [57, 112 - h * .4], [47, 112 - h * .85]].map(([x, y]) => `<circle cx="${x}" cy="${y.toFixed(1)}" r="3.2" fill="#ffd166"/>`).join('');
        else s += [[42, 60], [58, 72], [46, 84], [60, 48], [40, 44]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${6 + (i % 2)}" fill="${i === 3 ? '#f39a3d' : '#e8493a'}"/><circle cx="${x - 2}" cy="${y - 2}" r="1.6" fill="#fff" opacity=".6"/>`).join('');
        return s;
      }
      if (type === 'carrot') {
        const len = stage === 3 ? 34 : 46;
        let s = stage === 4 ? '<path d="M42 104h16l-8 22z" fill="#f28c28"/><path d="M45 109h6M47 115h4" stroke="#c96a12" stroke-width="1.5"/>' : '<path d="M45 108h10l-5 8z" fill="#f28c28"/>';
        [-30, -50, -70, -90, -110, -130, -150].forEach((a, i) => {
          const r = a * Math.PI / 180, ex = 50 + Math.cos(r) * len, ey = 106 + Math.sin(r) * len;
          s += `<path d="M50 106L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${G[i % 4]}" stroke-width="3" stroke-linecap="round"/>`;
          for (let k = 1; k < 4; k++) s += `<circle cx="${(50 + Math.cos(r) * len * k / 3.4).toFixed(1)}" cy="${(106 + Math.sin(r) * len * k / 3.4).toFixed(1)}" r="3.6" fill="${G[(i + k) % 4]}"/>`;
        });
        return s;
      }
      if (type === 'sunflower') {
        const h = stage === 3 ? 72 : 96;
        let s = stem(h, 5) + leafPath(50, 112 - h * .35, 22, 205, '#57a862') + leafPath(50, 112 - h * .55, 20, -25, '#3f8f52') + leafPath(50, 112 - h * .75, 16, 210, '#79c27a');
        if (stage === 3) return s + `<circle cx="50" cy="${112 - h}" r="8" fill="#57a862"/><path d="M44 ${112 - h - 4}l6 -6 6 6" fill="#79c27a"/>`;
        let petals = '';
        for (let i = 0; i < 14; i++) petals += `<ellipse cx="0" cy="-15" rx="4.6" ry="10" fill="${i % 2 ? '#ffc83d' : '#ffb21f'}" transform="rotate(${i * 25.7})"/>`;
        return s + `<g transform="translate(50 ${112 - h})">${petals}<circle r="9" fill="#6b4a33"/><circle r="5" fill="#4d3424"/></g>`;
      }
      // basil
      const rows = stage === 3 ? 3 : 5;
      let s = stem(stage === 3 ? 40 : 58, 3.5);
      for (let i = 0; i < rows; i++) {
        const y = 100 - i * 11, spread = 16 - i * 1.5;
        s += `<ellipse cx="${50 - spread}" cy="${y}" rx="${10 - i * .6}" ry="${6.5 - i * .3}" fill="${G[i % 4]}" transform="rotate(-25 ${50 - spread} ${y})"/>`;
        s += `<ellipse cx="${50 + spread}" cy="${y}" rx="${10 - i * .6}" ry="${6.5 - i * .3}" fill="${G[(i + 1) % 4]}" transform="rotate(25 ${50 + spread} ${y})"/>`;
      }
      if (stage === 4) s += `<ellipse cx="50" cy="${100 - rows * 11}" rx="7" ry="9" fill="#79c27a"/>`;
      return s;
    }

    const ICONS = {
      tomato: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="23" r="14" fill="#e8493a"/><path d="M20 9l3 5 5-2-3 5 5 2-6 1-4 3-4-3-6-1 5-2-3-5 5 2z" fill="#3f8f52"/><circle cx="15" cy="20" r="3" fill="#fff" opacity=".4"/></svg>',
      carrot: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M12 14h16L20 38z" fill="#f28c28"/><path d="M16 20h5M18 27h4" stroke="#c96a12" stroke-width="2"/><path d="M20 14L14 3M20 14V2M20 14l6-11" stroke="#3f8f52" stroke-width="3" stroke-linecap="round"/></svg>',
      sunflower: '<svg viewBox="0 0 40 40" aria-hidden="true">' + Array.from({ length: 12 }, (_, i) => `<ellipse cx="20" cy="8" rx="3.4" ry="7" fill="${i % 2 ? '#ffc83d' : '#ffb21f'}" transform="rotate(${i * 30} 20 20)"/>`).join('') + '<circle cx="20" cy="20" r="7" fill="#6b4a33"/></svg>',
      basil: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 36V18" stroke="#3f8f52" stroke-width="3"/><ellipse cx="13" cy="22" rx="9" ry="6" fill="#57a862" transform="rotate(-30 13 22)"/><ellipse cx="27" cy="22" rx="9" ry="6" fill="#3f8f52" transform="rotate(30 27 22)"/><ellipse cx="20" cy="11" rx="6" ry="8" fill="#79c27a"/></svg>',
    };

    /* ---------- state ---------- */
    let selected = 'tomato';
    let plots = Array.from({ length: PLOTS }, () => null); // null or { type, stage }
    let busy = false;

    const factCard = document.querySelector('.fact-card');
    const factIcon = factCard.querySelector('.fact-icon');
    const factTitle = factCard.querySelector('h3');
    const factText = factCard.querySelector('p');
    const factSrc = factCard.querySelector('.fact-src');
    const live = document.getElementById('game-live');
    const chipPlanted = document.getElementById('chip-planted');
    const chipGrown = document.getElementById('chip-grown');
    const can = document.querySelector('.can');
    const yardBox = document.querySelector('.yard');

    // build plots
    for (let i = 0; i < PLOTS; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'plot';
      b.dataset.i = i;
      yard.appendChild(b);
      b.addEventListener('click', () => act(i));
    }
    const buttons = [...yard.children];

    // seed picker
    document.querySelectorAll('.seed-btn').forEach((btn) => {
      btn.insertAdjacentHTML('afterbegin', ICONS[btn.dataset.seed]);
      btn.addEventListener('click', () => {
        selected = btn.dataset.seed;
        document.querySelectorAll('.seed-btn').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        renderAll();
        say(`${PLANTS[selected].name} seeds selected. Choose an empty plot to plant.`);
      });
    });

    function say(msg) { live.textContent = msg; }

    function showFact(type, grown) {
      const p = PLANTS[type];
      factIcon.innerHTML = ICONS[type];
      factTitle.textContent = grown ? `${p.name}: fully grown!` : `${p.name} fact`;
      factText.textContent = grown ? p.grown : p.planted;
      factSrc.textContent = 'Source: ' + p.source;
      factCard.classList.remove('flash');
      void factCard.offsetWidth; // restart animation
      factCard.classList.add('flash');
    }

    function render(i, animate) {
      const b = buttons[i], plot = plots[i];
      if (!plot) {
        b.innerHTML = `<span class="empty-hint">Plant ${PLANTS[selected].name.toLowerCase()}</span>`;
        b.setAttribute('aria-label', `Plot ${i + 1}: empty. Press to plant ${PLANTS[selected].name.toLowerCase()} seeds.`);
        b.classList.remove('is-wet');
        return;
      }
      const g = `<g class="${animate ? 'stage' : ''}">${draw(plot.type, plot.stage)}</g>`;
      b.innerHTML = `<svg class="plant" viewBox="0 0 100 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${g}</svg><span class="stage-tag">${PLANTS[plot.type].name} · ${STAGES[plot.stage]}</span>`;
      const next = plot.stage < 4 ? 'Press to water it.' : 'Fully grown. Press to read its fact.';
      b.setAttribute('aria-label', `Plot ${i + 1}: ${PLANTS[plot.type].name}, ${STAGES[plot.stage]}. ${next}`);
    }
    function renderAll() { plots.forEach((_, i) => render(i, false)); updateChips(); }
    function updateChips() {
      chipPlanted.textContent = `Planted ${plots.filter(Boolean).length}/${PLOTS}`;
      chipGrown.textContent = `Fully grown ${plots.filter((p) => p && p.stage === 4).length}`;
    }

    function water(i, done) {
      const b = buttons[i];
      const yr = yardBox.getBoundingClientRect(), br = b.getBoundingClientRect();
      const x = br.left - yr.left + br.width * 0.55, y = br.top - yr.top - 50;
      can.style.left = x + 'px';
      can.style.top = y + 'px';
      can.classList.remove('pour');
      void can.offsetWidth;
      can.classList.add('pour');
      for (let k = 0; k < 7; k++) {
        setTimeout(() => {
          const d = document.createElement('span');
          d.className = 'drop';
          d.style.left = (x - 6 + Math.random() * 26) + 'px';
          d.style.top = (y + 52) + 'px';
          yardBox.appendChild(d);
          setTimeout(() => d.remove(), 800);
        }, 380 + k * 70);
      }
      b.classList.add('is-wet');
      setTimeout(done, 950);
      setTimeout(() => b.classList.remove('is-wet'), 2600);
    }

    function act(i) {
      if (busy) return;
      const plot = plots[i];
      if (!plot) {
        plots[i] = { type: selected, stage: 0 };
        render(i, true); updateChips();
        showFact(selected, false);
        say(`Planted ${PLANTS[selected].name.toLowerCase()} seeds in plot ${i + 1}. Press the plot again to water it.`);
        return;
      }
      if (plot.stage >= 4) {
        showFact(plot.type, true);
        say(`${PLANTS[plot.type].name} in plot ${i + 1} is fully grown.`);
        return;
      }
      busy = true;
      water(i, () => {
        plot.stage += 1;
        render(i, true); updateChips();
        if (plot.stage === 4) showFact(plot.type, true);
        say(`Watered plot ${i + 1}. The ${PLANTS[plot.type].name.toLowerCase()} is now: ${STAGES[plot.stage]}.`);
        busy = false;
        buttons[i].focus({ preventScroll: true });
      });
    }

    document.querySelector('.tool-btn--reset').addEventListener('click', () => {
      plots = plots.map(() => null);
      renderAll();
      factIcon.innerHTML = '';
      factTitle.textContent = 'Your garden is ready';
      factText.textContent = 'Pick a seed, plant it in an empty plot, then water it to watch it grow. A fact about each plant appears here.';
      factSrc.textContent = '';
      say('Garden reset. All plots are empty.');
    });

    // start with one tomato already sprouting, so the game opens mid-use
    plots[1] = { type: 'tomato', stage: 2 };
    plots[3] = { type: 'sunflower', stage: 1 };
    renderAll();
  }
}
