/*
 * Olly dot-matrix shimmer — standalone, dependency-free.
 *
 * Usage:
 *   <canvas data-anim="wave"></canvas>
 *   <script src="shimmer.js"></script>
 *
 * Any <canvas data-anim="..."> on the page is auto-animated. Size the canvas
 * with CSS (width/height); the script handles the backing store + devicePixelRatio.
 *
 * Animations (data-anim):
 *   wave      diagonal sweep across the matrix
 *   radial    concentric rings pulsing from the center
 *   scan      a single column scans left to right
 *   progress  left-to-right fill with a glowing leading edge
 *   twinkle   soft ambient random twinkle (breathing field)
 *   orbit     a bright node + trail circling the field
 *   thinking  small sequential row (for buttons / inline status)
 *   hero      strong centered radial pulse (full-bleed loading hero)
 *   perimeter a light tracing the inside border of the canvas
 *   surround  a soft cloud AROUND an inner element, with an orbiting light.
 *             Put a sibling element with [data-surround-box] inside the same
 *             parent as the canvas; the cloud avoids that element's rectangle.
 *
 * Optional attributes:
 *   data-sp="14"   dot spacing in px (default 15)
 */
(function () {
  'use strict';

  function build(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return null;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var sp = +(cv.dataset.sp || 15);
    var cols = Math.max(1, Math.round((w - sp) / sp));
    var rows = Math.max(1, Math.round((h - sp) / sp));
    var ox = (w - (cols - 1) * sp) / 2, oy = (h - (rows - 1) * sp) / 2;
    var dots = [];
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      dots.push({ x: ox + i * sp, y: oy + j * sp, gx: i, gy: j, r: Math.random() });
    }
    var field = { ctx: ctx, w: w, h: h, sp: sp, dots: dots, cx: w / 2, cy: h / 2, anim: cv.dataset.anim };
    if (cv.dataset.anim === 'surround') {
      var box = cv.parentElement && cv.parentElement.querySelector('[data-surround-box]');
      if (box) {
        var cr = cv.getBoundingClientRect(), br = box.getBoundingClientRect();
        var sx = w / cr.width, sy = h / cr.height;
        field.hole = {
          x0: (br.left - cr.left) * sx, y0: (br.top - cr.top) * sy,
          x1: (br.right - cr.left) * sx, y1: (br.bottom - cr.top) * sy
        };
      }
    }
    return field;
  }

  function col(b, anim) {
    b = b < 0 ? 0 : b > 1 ? 1 : b;
    var a = (anim === 'hero' ? (0.14 + 0.86 * b) : (0.02 + 0.30 * b)).toFixed(3);
    var r = Math.round(96 + 44 * b), g = Math.round(60 + 62 * b), bl = Math.round(196 + 40 * b);
    return 'rgba(' + r + ',' + g + ',' + bl + ',' + a + ')';
  }

  function draw(f, t) {
    var ctx = f.ctx, w = f.w, h = f.h, sp = f.sp, dots = f.dots, cx = f.cx, cy = f.cy, anim = f.anim;
    ctx.clearRect(0, 0, w, h);
    var minwh = Math.min(w, h);
    for (var n = 0; n < dots.length; n++) {
      var d = dots[n], b = 0;
      if (anim === 'wave') { b = 0.5 + 0.5 * Math.sin(t * 2.6 - (d.gx + d.gy) * 0.5); }
      else if (anim === 'radial') { var dist = Math.hypot(d.x - cx, d.y - cy) / sp; b = 0.5 + 0.5 * Math.sin(t * 3.0 - dist * 0.6); }
      else if (anim === 'scan') { var p = (t * 0.5) % 1; var lx = p * w; var dx = (d.x - lx) / (sp * 1.7); b = 0.05 + 0.95 * Math.exp(-dx * dx); }
      else if (anim === 'progress') { var pp = (t * 0.4) % 1.3; var lead = Math.min(pp, 1); var fx = d.x / w; b = fx <= lead ? 0.78 : 0.06; var e = (fx - lead) * 7; b = Math.min(1, b + 0.7 * Math.exp(-e * e)); }
      else if (anim === 'twinkle') { b = 0.42 + 0.58 * Math.sin(t * 2.1 + d.r * 6.2832); }
      else if (anim === 'orbit') { var ang = t * 1.5; var r0 = minwh * 0.32; var bb = 0; for (var k = 0; k < 3; k++) { var aa = ang - k * 0.45; var px = cx + Math.cos(aa) * r0, py = cy + Math.sin(aa) * r0; var dd0 = Math.hypot(d.x - px, d.y - py) / sp; bb += Math.exp(-dd0 * dd0 / 5) * (1 - k * 0.3); } b = 0.05 + Math.min(1, bb); }
      else if (anim === 'thinking') { b = 0.22 + 0.78 * Math.max(0, Math.sin(t * 5 - d.gx * 0.9)); }
      else if (anim === 'hero') { var dh = Math.hypot(d.x - cx, d.y - cy) / sp; var R = minwh / (2 * sp); var ring = 0.5 + 0.5 * Math.sin(t * 2.6 - dh * 0.55); var env = Math.max(0, 1 - dh / (R * 1.02)); b = 0.04 + 0.96 * ring * env; }
      else if (anim === 'perimeter') { var edge = Math.min(d.x, w - d.x, d.y, h - d.y); var band = sp * 1.9; if (edge > band) { b = -1; } else { var ef = 1 - edge / band; var pa = (Math.atan2(d.y - cy, d.x - cx) / 6.2832) + 0.5; var ph = (t * 0.16) % 1; var pd = Math.abs(pa - ph); pd = Math.min(pd, 1 - pd); var ph2 = (ph + 0.5) % 1; var pd2 = Math.abs(pa - ph2); pd2 = Math.min(pd2, 1 - pd2); var pg = Math.exp(-(pd * 7) * (pd * 7)) + 0.45 * Math.exp(-(pd2 * 7) * (pd2 * 7)); b = (0.10 + 0.62 * pg) * ef; } }
      else if (anim === 'surround') { var hl = f.hole; if (!hl) { b = -1; } else if (d.x > hl.x0 && d.x < hl.x1 && d.y > hl.y0 && d.y < hl.y1) { b = -1; } else { var sdx = Math.max(hl.x0 - d.x, d.x - hl.x1, 0), sdy = Math.max(hl.y0 - d.y, d.y - hl.y1, 0); var sdist = Math.hypot(sdx, sdy); var bcx = (hl.x0 + hl.x1) / 2, bcy = (hl.y0 + hl.y1) / 2; var sa = (Math.atan2(d.y - bcy, d.x - bcx) / 6.2832) + 0.5; var sph = (t * 0.13) % 1; var sd = Math.abs(sa - sph); sd = Math.min(sd, 1 - sd); var sph2 = (sph + 0.5) % 1; var sd2 = Math.abs(sa - sph2); sd2 = Math.min(sd2, 1 - sd2); var halo = Math.exp(-(sdist / (sp * 4.5)) * (sdist / (sp * 4.5))); var near = Math.exp(-(sdist / (sp * 2.6)) * (sdist / (sp * 2.6))); var sg = Math.exp(-(sd * 6) * (sd * 6)) + 0.4 * Math.exp(-(sd2 * 6) * (sd2 * 6)); b = 0.05 * halo + 0.5 * sg * near; } }

      if (b < 0) continue;
      var isP = anim === 'perimeter' || anim === 'surround';
      var rad = isP ? (0.6 + b * 1.7) : (anim === 'hero' ? (0.9 + b * 2.7) : (0.7 + b * 2.5));
      ctx.beginPath();
      ctx.arc(d.x, d.y, rad, 0, 6.2832);
      ctx.fillStyle = col(b, anim);
      ctx.fill();
    }
  }

  var startT = 0;
  function tick(now) {
    if (!startT) startT = now;
    var t = (now - startT) / 1000;
    var cvs = document.querySelectorAll('canvas[data-anim]');
    for (var i = 0; i < cvs.length; i++) {
      var cv = cvs[i];
      if (!cv.isConnected) continue;
      var f = cv.__field;
      if (!f || f.ctx.canvas !== cv) { f = build(cv); if (f) cv.__field = f; }
      if (f) draw(f, t);
    }
    requestAnimationFrame(tick);
  }

  function init() {
    // Rebuild fields on resize so the matrix + surround hole stay correct.
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var cvs = document.querySelectorAll('canvas[data-anim]');
        for (var i = 0; i < cvs.length; i++) cvs[i].__field = null;
      }, 120);
    });
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
