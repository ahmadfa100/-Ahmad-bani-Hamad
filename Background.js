/**
 * background.js — Network canvas animation
 * Animated node graph with wave propagation on click.
 * Dark: sky-blue nodes. Light: deep navy nodes.
 */

(function () {

  var canvas     = document.getElementById('network');
  if (!canvas) { return; }

  var ctx        = canvas.getContext('2d');
  var MAX_NODES  = 52;
  var CONN_DIST  = 148;
  var MOVE_SPEED = 0.36;
  var WAVE_SPEED = 0.46;
  var WAVE_THICK = 7;
  var PULSE_DUR  = 600;
  var nextWaveId = 1;
  var nodes      = [];
  var waves      = [];

  /* ── resize ───────────────────────────────── */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── theme helpers ────────────────────────── */
  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function nc(a) {
    return isDark()
      ? 'rgba(99,179,237,'  + a + ')'
      : 'rgba(30,58,138,'   + a + ')';
  }
  function nc2(a) {
    return isDark()
      ? 'rgba(118,228,247,' + a + ')'
      : 'rgba(7,89,133,'    + a + ')';
  }

  /* ── node factory ─────────────────────────── */
  function makeNode(x, y) {
    return {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * MOVE_SPEED,
      vy: (Math.random() - 0.5) * MOVE_SPEED,
      pulseTime: -Infinity,
      seenWaves: new Set()
    };
  }

  /* seed initial nodes */
  for (var s = 0; s < MAX_NODES; s++) {
    nodes.push(makeNode(
      Math.random() * canvas.width,
      Math.random() * canvas.height
    ));
  }

  /* ── main render loop ─────────────────────── */
  function loop() {
    var now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* move nodes */
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  { n.vx *= -1; }
      if (n.y < 0 || n.y > canvas.height) { n.vy *= -1; }
    }

    /* wave → node pulse propagation */
    for (var wi = 0; wi < waves.length; wi++) {
      var w  = waves[wi];
      var wr = (now - w.t0) * WAVE_SPEED;
      for (var ni = 0; ni < nodes.length; ni++) {
        var nd = nodes[ni];
        if (nd.seenWaves.has(w.id)) { continue; }
        var dist = Math.hypot(nd.x - w.x, nd.y - w.y);
        if (Math.abs(dist - wr) < WAVE_THICK) {
          nd.pulseTime = now;
          nd.seenWaves.add(w.id);
        }
      }
    }

    /* cull spent waves */
    var maxDim = Math.hypot(canvas.width, canvas.height);
    for (var k = waves.length - 1; k >= 0; k--) {
      if ((now - waves[k].t0) * WAVE_SPEED > maxDim) {
        waves.splice(k, 1);
      }
    }

    /* draw edges */
    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var na = nodes[a], nb = nodes[b];
        var dx = na.x - nb.x, dy = na.y - nb.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < CONN_DIST * CONN_DIST) {
          var al = (1 - Math.sqrt(d2) / CONN_DIST) * (isDark() ? 0.20 : 0.16);
          ctx.strokeStyle = nc(al);
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }
      }
    }

    /* draw wave rings */
    for (var ri = 0; ri < waves.length; ri++) {
      var wv  = waves[ri];
      var age = now - wv.t0;
      var r   = age * WAVE_SPEED;
      var wa  = Math.max(0, (isDark() ? 0.28 : 0.20) - age / 3000);
      ctx.strokeStyle = nc(wa);
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* draw nodes */
    for (var j = 0; j < nodes.length; j++) {
      var node  = nodes[j];
      var since = now - node.pulseTime;

      if (since < PULSE_DUR) {
        var f = 1 - since / PULSE_DUR;
        /* glow halo */
        var g = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, 14 + 8 * f
        );
        g.addColorStop(0, nc(0.55 * f));
        g.addColorStop(1, nc(0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14 + 8 * f, 0, Math.PI * 2);
        ctx.fill();
        /* bright core */
        ctx.fillStyle = nc2(0.75 + 0.25 * f);
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3.5 + 1.5 * f, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = nc(isDark() ? 0.45 : 0.38);
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(loop);
  }

  loop();

  /* ── click → spawn wave + node ───────────── */
  document.addEventListener('click', function (e) {
    if (e.target.closest('a, button, input, textarea, select')) { return; }
    var x = e.clientX, y = e.clientY;
    nodes.push(makeNode(x, y));
    if (nodes.length > MAX_NODES + 18) { nodes.splice(0, 1); }
    waves.push({ id: nextWaveId++, x: x, y: y, t0: performance.now() });
  });

}());