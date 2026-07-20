// ===== TEAL COMET CURSOR TRAIL =====
(function() {
  const TRAIL_LENGTH = 25;
  const trail = [];

  // Create trail dots
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: opacity 0.1s;
    `;
    document.body.appendChild(dot);
    trail.push({ el: dot, x: 0, y: 0 });
  }

  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    // Head follows mouse
    trail[0].x = mouseX;
    trail[0].y = mouseY;

    // Each dot follows the previous
    for (let i = 1; i < TRAIL_LENGTH; i++) {
      trail[i].x += (trail[i - 1].x - trail[i].x) * 0.45;
      trail[i].y += (trail[i - 1].y - trail[i].y) * 0.45;
    }

    // Render each dot
    trail.forEach((dot, i) => {
      const ratio = 1 - i / TRAIL_LENGTH;
      const size = ratio * 14 + 1; // head: 15px, tail: 1px
      const opacity = ratio * 0.9;

      // Color: head = white/teal, tail = deep teal fading out
      const r = Math.round(128 * ratio + 10);
      const g = Math.round(203 * ratio + 40);
      const b = Math.round(196 * ratio + 30);

      // Glow on head dots
      const glow = i < 5
        ? `0 0 ${8 * ratio}px rgba(128,203,196,${opacity}), 0 0 ${16 * ratio}px rgba(42,138,138,${opacity * 0.6})`
        : 'none';

      dot.el.style.cssText = `
        position: fixed;
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        left: ${dot.x}px;
        top: ${dot.y}px;
        width: ${size}px;
        height: ${size}px;
        background: rgba(${r},${g},${b},${opacity});
        box-shadow: ${glow};
      `;
    });

    requestAnimationFrame(animate);
  }

  animate();
})();
