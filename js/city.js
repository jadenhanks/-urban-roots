/* Urban Roots: city scene generator.
   Draws the same city twice, gray and green, so the two versions line up exactly.
   Used live by the home page hero and, at build time, to create the before/after images. */
(function (root) {
  'use strict';

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var W = 1600, H = 900, GROUND = 812;

  var PAL = {
    gray: {
      skyTop: '#aeb4ba', skyBot: '#d9dcdf', far: '#a3a9af', farTop: '#9aa0a6',
      bodies: ['#868c92', '#93999f', '#7c8288', '#8e9399', '#a0a5aa'],
      shade: 'rgba(0,0,0,.16)', win: '#62686e', lit: '#6c7278', parapet: '#6d7378',
      ground: '#7a7f84', curb: '#5f6468', road: '#55595d', lot: '#8f8a82'
    },
    green: {
      skyTop: '#9fd9c0', skyBot: '#f6f1dd', far: '#b9d6c4', farTop: '#9cc7ac',
      bodies: ['#e9dcc3', '#d9b993', '#cf9a76', '#efe5d1', '#c7ae8f'],
      shade: 'rgba(60,35,20,.16)', win: '#355447', lit: '#ffe3a1', parapet: '#b58f6c',
      ground: '#cfc6b2', curb: '#a99f8a', road: '#6d6a63', lot: '#7a5a3e'
    }
  };

  var LEAF = ['#2f7a45', '#3f8f52', '#57a862', '#79c27a', '#9fd78b'];
  var BLOOM = ['#f28fb0', '#ffd166', '#ff7b5c', '#f7f3e8', '#c9a7f2'];

  function n(v) { return Math.round(v * 10) / 10; }

  function clump(r, x, y, s) {
    var out = '';
    var count = 3 + Math.floor(r() * 3);
    for (var i = 0; i < count; i++) {
      var cx = x + (r() - 0.5) * s * 1.6, cy = y - r() * s * 0.6;
      out += '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(s * (0.45 + r() * 0.35)) + '" fill="' + LEAF[Math.floor(r() * LEAF.length)] + '"/>';
    }
    return out;
  }

  function flowers(r, x, y, w, k) {
    var out = '';
    for (var i = 0; i < k; i++) {
      out += '<circle cx="' + n(x + r() * w) + '" cy="' + n(y - r() * 10) + '" r="' + n(2.2 + r() * 2) + '" fill="' + BLOOM[Math.floor(r() * BLOOM.length)] + '"/>';
    }
    return out;
  }

  function tree(r, x, y, s) {
    return '<rect x="' + n(x - s * 0.08) + '" y="' + n(y - s * 0.9) + '" width="' + n(s * 0.16) + '" height="' + n(s * 0.9) + '" rx="2" fill="#6b4a33"/>' +
      '<circle cx="' + n(x) + '" cy="' + n(y - s * 1.05) + '" r="' + n(s * 0.55) + '" fill="#2f7a45"/>' +
      '<circle cx="' + n(x - s * 0.32) + '" cy="' + n(y - s * 0.85) + '" r="' + n(s * 0.38) + '" fill="#3f8f52"/>' +
      '<circle cx="' + n(x + s * 0.3) + '" cy="' + n(y - s * 0.9) + '" r="' + n(s * 0.4) + '" fill="#57a862"/>' +
      '<circle cx="' + n(x + s * 0.1) + '" cy="' + n(y - s * 1.3) + '" r="' + n(s * 0.3) + '" fill="#79c27a" opacity=".9"/>';
  }

  function sunflower(x, y, h) {
    return '<path d="M' + x + ' ' + y + 'V' + (y - h) + '" stroke="#3f8f52" stroke-width="3"/>' +
      '<ellipse cx="' + (x - 7) + '" cy="' + (y - h * 0.5) + '" rx="8" ry="4" fill="#57a862"/>' +
      '<circle cx="' + x + '" cy="' + (y - h) + '" r="11" fill="#ffc83d"/><circle cx="' + x + '" cy="' + (y - h) + '" r="5" fill="#6b4a33"/>';
  }

  function grow(on, d, inner) {
    return on ? '<g class="grow" style="--d:' + d.toFixed(2) + '">' + inner + '</g>' : '<g>' + inner + '</g>';
  }

  /* opts: mode 'gray'|'green', sky bool, animate bool (adds .grow groups), id prefix */
  function city(opts) {
    var mode = opts.mode, P = PAL[mode], g = mode === 'green', A = !!opts.animate;
    var id = (opts.id || 'c') + mode;
    var r = rng(20260); // geometry: same seed for both modes = same shapes
    var d = rng(4242);  // decoration only
    var defs = '', body = '';

    defs += '<linearGradient id="' + id + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P.skyTop + '"/><stop offset="1" stop-color="' + P.skyBot + '"/></linearGradient>';
    defs += '<linearGradient id="' + id + 'fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="' + (g ? '.18' : '.28') + '"/></linearGradient>';

    if (opts.sky) {
      body += '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'sky)"/>';
      if (g) body += '<circle cx="1220" cy="250" r="140" fill="#fff6d6" opacity=".55"/><circle cx="1220" cy="250" r="78" fill="#fff3c4"/>';
      else body += '<circle cx="1220" cy="250" r="78" fill="#e4e6e8" opacity=".7"/>';
    }

    // far skyline
    var fx = -30, far = '';
    while (fx < W + 40) {
      var fw = 70 + r() * 90, fh = 160 + r() * 210;
      far += '<rect x="' + n(fx) + '" y="' + n(GROUND - fh - 40) + '" width="' + n(fw) + '" height="' + n(fh + 40) + '" fill="' + P.far + '"/>';
      if (g && d() > 0.45) far += '<rect x="' + n(fx + 4) + '" y="' + n(GROUND - fh - 48) + '" width="' + n(fw - 8) + '" height="9" rx="4" fill="' + P.farTop + '"/>';
      fx += fw + 4 + r() * 18;
    }
    body += far + '<rect y="' + (GROUND - 520) + '" width="' + W + '" height="520" fill="url(#' + id + 'fade)"/>';

    // front row
    var x = -20, i = 0, roofs = '', fronts = '', greens = '';
    while (x < W + 20) {
      if (i === 4) { // vacant lot / community garden
        var lw = 240, lx = x;
        fronts += '<rect x="' + n(lx) + '" y="' + (GROUND - 14) + '" width="' + lw + '" height="14" fill="' + P.lot + '"/>';
        if (!g) {
          var fence = '';
          for (var f = 0; f <= lw; f += 16) fence += '<path d="M' + n(lx + f) + ' ' + (GROUND - 14) + 'v-46" stroke="#5d6166" stroke-width="2"/>';
          fronts += fence + '<path d="M' + lx + ' ' + (GROUND - 60) + 'h' + lw + 'M' + lx + ' ' + (GROUND - 38) + 'h' + lw + '" stroke="#5d6166" stroke-width="2"/>' +
            '<rect x="' + (lx + 80) + '" y="' + (GROUND - 96) + '" width="80" height="34" fill="#9a9fa4"/><path d="M' + (lx + 120) + ' ' + (GROUND - 62) + 'v48" stroke="#5d6166" stroke-width="3"/>';
        } else {
          var cg = '';
          for (var b = 0; b < 3; b++) {
            var bx = lx + 14 + b * 76;
            cg += '<rect x="' + bx + '" y="' + (GROUND - 30) + '" width="62" height="18" rx="3" fill="#8a5a3c"/>' + clump(d, bx + 31, GROUND - 32, 12) + flowers(d, bx + 6, GROUND - 40, 50, 4);
          }
          cg += sunflower(lx + 30, GROUND - 30, 70) + sunflower(lx + 120, GROUND - 30, 86) + sunflower(lx + 205, GROUND - 30, 64);
          cg += '<rect x="' + (lx + 150) + '" y="' + (GROUND - 80) + '" width="58" height="50" fill="#d9b993"/><path d="M' + (lx + 144) + ' ' + (GROUND - 80) + 'l35 -26 35 26z" fill="#2f7a45"/>';
          greens += grow(A, 0.32, cg);
        }
        x += lw; i++; continue;
      }
      var w = 140 + r() * 100, h = 250 + r() * 220, y = GROUND - h;
      var col = P.bodies[i % P.bodies.length];
      var bid = id + 'w' + i;
      defs += '<pattern id="' + bid + '" x="' + n(x + 16) + '" y="' + n(y + 34) + '" width="30" height="40" patternUnits="userSpaceOnUse"><rect x="6" y="8" width="16" height="22" rx="1.5" fill="' + P.win + '"/></pattern>';
      fronts += '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + col + '"/>';
      fronts += '<rect x="' + n(x + w * 0.8) + '" y="' + n(y) + '" width="' + n(w * 0.2) + '" height="' + n(h) + '" fill="' + P.shade + '"/>';
      fronts += '<rect x="' + n(x + 16) + '" y="' + n(y + 34) + '" width="' + n(w - 32) + '" height="' + n(h - 80) + '" fill="url(#' + bid + ')"/>';
      // a few lit windows in the green city
      for (var lwn = 0; lwn < 5; lwn++) {
        var cols = Math.floor((w - 32) / 30), rows = Math.floor((h - 80) / 40);
        var cx = Math.floor(d() * cols), cy = Math.floor(d() * rows);
        if (g) fronts += '<rect x="' + n(x + 16 + cx * 30 + 6) + '" y="' + n(y + 34 + cy * 40 + 8) + '" width="16" height="22" rx="1.5" fill="' + P.lit + '"/>';
      }
      fronts += '<rect x="' + n(x - 3) + '" y="' + n(y - 8) + '" width="' + n(w + 6) + '" height="10" fill="' + P.parapet + '"/>';
      // door
      fronts += '<rect x="' + n(x + w / 2 - 14) + '" y="' + (GROUND - 46) + '" width="28" height="46" fill="' + (g ? '#2f5a46' : '#5c6166') + '"/>';

      // roof
      if (!g) {
        roofs += '<rect x="' + n(x + 14) + '" y="' + n(y - 30) + '" width="34" height="22" fill="#747a80"/><rect x="' + n(x + w - 48) + '" y="' + n(y - 20) + '" width="18" height="12" fill="#6b7177"/>';
      } else {
        var rg = '';
        var beds = Math.max(1, Math.floor((w - 30) / 62));
        for (var k = 0; k < beds; k++) {
          var bx2 = x + 14 + k * 62;
          rg += '<rect x="' + n(bx2) + '" y="' + n(y - 22) + '" width="52" height="14" rx="2" fill="#8a5a3c"/>' + clump(d, bx2 + 26, y - 24, 11);
          if (k % 2 === 0) rg += '<circle cx="' + n(bx2 + 14) + '" cy="' + n(y - 30) + '" r="3.2" fill="#e8493a"/><circle cx="' + n(bx2 + 36) + '" cy="' + n(y - 36) + '" r="3" fill="#e8493a"/>';
        }
        if (w > 200) rg += tree(d, x + w - 30, y - 8, 48);
        greens += grow(A, 0.08 + (i % 5) * 0.07, rg);
      }

      // balconies
      var floors = Math.floor((h - 120) / 92);
      for (var fl = 0; fl < floors; fl++) {
        if (r() > 0.55) continue;
        var by = y + 90 + fl * 92, side = r() > 0.5, bxx = side ? x + 10 : x + w - 74;
        fronts += '<rect x="' + n(bxx) + '" y="' + n(by) + '" width="64" height="5" fill="' + (g ? '#7d5c44' : '#5c6166') + '"/>';
        fronts += '<path d="M' + n(bxx) + ' ' + n(by) + 'v-18h64v18M' + n(bxx + 16) + ' ' + n(by) + 'v-18M' + n(bxx + 32) + ' ' + n(by) + 'v-18M' + n(bxx + 48) + ' ' + n(by) + 'v-18" stroke="' + (g ? '#5a4232' : '#565b60') + '" stroke-width="2" fill="none"/>';
        if (g) {
          var bal = '<rect x="' + n(bxx + 4) + '" y="' + n(by - 12) + '" width="56" height="10" rx="2" fill="#c9673f"/>' + clump(d, bxx + 32, by - 14, 9) + flowers(d, bxx + 6, by - 18, 52, 5) +
            '<path d="M' + n(bxx + 8) + ' ' + n(by + 4) + 'q4 14 -2 26M' + n(bxx + 54) + ' ' + n(by + 4) + 'q-5 12 1 20" stroke="#3f8f52" stroke-width="3" fill="none" stroke-linecap="round"/>';
          greens += grow(A, 0.18 + fl * 0.05 + (i % 3) * 0.06, bal);
        }
      }
      x += w + 6 + r() * 14; i++;
    }

    body += roofs + fronts;
    // ground
    body += '<rect y="' + GROUND + '" width="' + W + '" height="26" fill="' + P.ground + '"/><rect y="' + (GROUND + 26) + '" width="' + W + '" height="6" fill="' + P.curb + '"/><rect y="' + (GROUND + 32) + '" width="' + W + '" height="' + (H - GROUND - 32) + '" fill="' + P.road + '"/>';
    var dash = '';
    for (var dx = 20; dx < W; dx += 120) dash += '<rect x="' + dx + '" y="' + (GROUND + 58) + '" width="60" height="5" fill="' + (g ? '#e9e2cf' : '#8b9095') + '"/>';
    body += dash;
    if (g) {
      var st = '';
      for (var tx = 90; tx < W; tx += 210) st += tree(d, tx, GROUND + 14, 62);
      greens += grow(A, 0.5, st);
    }
    body += greens;

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '"' +
      (opts.attrs ? ' ' + opts.attrs : '') + '><defs>' + defs + '</defs>' + body + '</svg>';
  }

  var api = { city: city, W: W, H: H };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.UrbanCity = api;
})(this);
