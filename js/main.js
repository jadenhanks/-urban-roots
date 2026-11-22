/* Urban Roots: shared interactions for every page.
   Each block checks whether its elements exist, so one file serves all five pages. */
{
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce) root.classList.add('reduce');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---- 1. Page load + seed loader ---------------------------------------- */
  const loader = $('.loader');
  const markLoaded = () => requestAnimationFrame(() => root.classList.add('is-loaded'));
  if (loader && !reduce) {
    setTimeout(() => { loader.classList.add('is-done'); markLoaded(); }, 1500);
  } else {
    markLoaded();
  }

  /* ---- 2. Header changes look after scrolling ---------------------------- */
  const header = $('.site-header');
  const onHeader = () => header && header.classList.toggle('is-scrolled', window.scrollY > 40);
  onHeader();
  window.addEventListener('scroll', onHeader, { passive: true });

  /* ---- 3. Mobile menu ----------------------------------------------------- */
  const toggle = $('.nav-toggle');
  const setMenu = (open) => {
    document.body.classList.toggle('nav-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  };
  if (toggle) {
    toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
    $$('.nav-links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });
  }

  /* ---- 4. Split headings into words for the reveal ----------------------- */
  $$('.split').forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            w.innerHTML = '<span></span>';
            w.firstChild.textContent = part;
            w.style.setProperty('--i', i++);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
  });

  /* ---- 5. Reveal on scroll (IntersectionObserver) ------------------------ */
  const revealables = $$('.reveal, .split, .step, .cta');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('in'));
  }
  // safety net: never leave content hidden
  setTimeout(() => $$('.reveal:not(.in), .split:not(.in)').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
  }), 2500);

  /* ---- 6. Home hero: clouds part, then the city turns green ------------- */
  const heroScroll = $('.hero-scroll');
  if (heroScroll && window.UrbanCity) {
    const stage = $('.hero-stage');
    $('.city-gray').innerHTML = UrbanCity.city({ mode: 'gray', sky: true, id: 'hg', attrs: 'preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"' });
    $('.city-green').innerHTML = UrbanCity.city({ mode: 'green', sky: true, animate: true, id: 'hc', attrs: 'preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"' });

    // soft cloud banks drawn with SVG
    const cloudSVG = (flip) => {
      let s = '';
      const pts = [[150, 260, 170], [330, 200, 150], [480, 300, 190], [260, 420, 210], [520, 470, 170], [120, 520, 160], [420, 600, 200], [620, 330, 140]];
      pts.forEach(([x, y, r], k) => { s += `<circle cx="${flip ? 800 - x : x}" cy="${y}" r="${r}" fill="${k % 2 ? '#eef1ef' : '#ffffff'}"/>`; });
      return `<svg viewBox="0 0 800 800" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><filter id="blur${flip ? 'r' : 'l'}"><feGaussianBlur stdDeviation="28"/></filter></defs><g filter="url(#blur${flip ? 'r' : 'l'})" opacity=".96">${s}</g></svg>`;
    };
    $('.cloud-bank--l').innerHTML = cloudSVG(false);
    $('.cloud-bank--r').innerHTML = cloudSVG(true);

    const label = $('.meter-label');
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = heroScroll.getBoundingClientRect();
      const total = heroScroll.offsetHeight - window.innerHeight;
      const prog = clamp(-rect.top / total);
      const c = clamp(prog / 0.22);
      const p = clamp((prog - 0.14) / 0.72);
      stage.style.setProperty('--c', c.toFixed(3));
      stage.style.setProperty('--p', p.toFixed(3));
      if (label) label.textContent = p < 0.05 ? 'Gray city' : p > 0.95 ? 'Green city' : `Greening ${Math.round(p * 100)}%`;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // gentle pointer parallax on desktop
    if (finePointer && !reduce) {
      const layers = $$('.hero-layer.city-gray, .hero-layer.city-green');
      stage.addEventListener('pointermove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * -14;
        const y = (e.clientY / window.innerHeight - 0.5) * -8;
        layers.forEach((l) => { l.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.02)`; });
      });
    }

    // floating leaves
    const leafBox = $('.leaves');
    if (leafBox && !reduce) {
      const colors = ['#7ee08a', '#57a862', '#c8f0d0', '#9fd78b'];
      for (let i = 0; i < 14; i++) {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('viewBox', '0 0 24 24');
        s.setAttribute('class', 'leaf');
        s.setAttribute('aria-hidden', 'true');
        s.innerHTML = `<path d="M3 21C3 11 9 4 21 3c-1 12-8 18-18 18z" fill="${colors[i % colors.length]}"/><path d="M3 21L14 10" stroke="#0f3b28" stroke-width="1.2" opacity=".5"/>`;
        const size = 14 + Math.random() * 18;
        s.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${10 + Math.random() * 10}s;animation-delay:${-Math.random() * 20}s;--drift:${(Math.random() - 0.5) * 220}px`;
        leafBox.appendChild(s);
      }
    }
  }

  /* ---- 7. Statement: words light up as you scroll ------------------------ */
  const statement = $('.statement');
  if (statement) {
    const words = [];
    const walk = (node, hl) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const sp = document.createElement('span');
            sp.className = 'sw' + (hl ? ' hl' : '');
            sp.textContent = part;
            words.push(sp);
            frag.appendChild(sp);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child, hl || child.classList.contains('hl'));
        }
      });
    };
    walk(statement, false);
    const paint = () => {
      const r = statement.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = reduce ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const lit = Math.round(prog * words.length);
      words.forEach((w, k) => w.classList.toggle('on', k < lit));
    };
    paint();
    window.addEventListener('scroll', () => requestAnimationFrame(paint), { passive: true });
  }

  /* ---- 8. Inner page hero: slow parallax --------------------------------- */
  const heroImg = $('.page-hero > img');
  if (heroImg && !reduce) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) heroImg.style.setProperty('--py', `${(y * 0.25).toFixed(1)}px`);
    }, { passive: true });
  }

  /* ---- 9. 3D tilt on type cards (desktop only) --------------------------- */
  if (finePointer && !reduce) {
    $$('.type-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---- 10. "Learn more" dialogs ------------------------------------------ */
  $$('[data-open]').forEach((btn) => {
    const dlg = document.getElementById(btn.dataset.open);
    if (!dlg) return;
    btn.addEventListener('click', () => {
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    });
  });
  $$('dialog.sheet').forEach((dlg) => {
    $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close ? dlg.close() : dlg.removeAttribute('open')));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // click on backdrop
  });

  /* ---- 11. Illustration hotspots ------------------------------------------ */
  const info = $('.hotspot-info');
  $$('.hotspot').forEach((spot) => {
    spot.addEventListener('click', () => {
      $$('.hotspot').forEach((s) => s.setAttribute('aria-pressed', String(s === spot)));
      if (info) {
        info.querySelector('h3').textContent = spot.dataset.title;
        info.querySelector('p').textContent = spot.dataset.text;
      }
    });
  });

  /* ---- 12. Flip cards ----------------------------------------------------- */
  $$('.flip-btn').forEach((b) => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
  }));

  /* ---- 13. Before / after slider ----------------------------------------- */
  $$('.ba').forEach((ba) => {
    const range = $('.ba-range', ba);
    const set = (v) => { ba.style.setProperty('--pos', v + '%'); range.value = v; range.setAttribute('aria-valuetext', `${100 - v}% of the green city showing`); };
    range.addEventListener('input', () => set(range.value));
    set(range.value);
    // a one-time "wipe" so visitors see it is interactive
    if (!reduce && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const anim = (t) => {
          const k = clamp((t - start) / 1600);
          const ease = 1 - Math.pow(1 - k, 3);
          set(Math.round(88 - ease * 38));
          if (k < 1) requestAnimationFrame(anim);
        };
        requestAnimationFrame(anim);
      }, { threshold: 0.5 });
      io.observe(ba);
    }
  });

  /* ---- 14. Timeline line fills as you scroll ----------------------------- */
  const timeline = $('.timeline');
  if (timeline) {
    const fill = () => {
      const r = timeline.getBoundingClientRect();
      const prog = clamp((window.innerHeight * 0.6 - r.top) / r.height);
      timeline.style.setProperty('--fill', prog.toFixed(3));
    };
    fill();
    window.addEventListener('scroll', () => requestAnimationFrame(fill), { passive: true });
  }

  /* ---- 15. Back to top ---------------------------------------------------- */
  $$('[data-top]').forEach((b) => b.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    const first = $('.skip-link') || document.body;
    first.focus({ preventScroll: true });
  }));
}
