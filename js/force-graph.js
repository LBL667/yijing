/* ============================================================
   公共组件 ForceGraph · 力导向图
   节点受 向心力(回布局位) + 节点间斥力 + 阻尼 驱动，
   支持拖拽（释放回弹）与点击（径向脉冲、连线高亮、波纹）

   用法：
     const ctrl = ForceGraph.create(containerEl, {
       nodes: [{ name, desc, img, color }],
       angles: [-90, -22, 45, 135, 202],   // 角度(度), 与 nodes 对齐
       centerImg: 'images/xxx.jpg',
       centerName: '小雁不吃薯',
       avatarR: 25, centerR: 35,           // 头像半径(px)
       cxR: 0.5, cyR: 0.43, rxR: 0.27, ryR: 0.345,
       minDist: 62,
     });
   ============================================================ */
'use strict';

const ForceGraph = (() => {
  const DEFAULTS = {
    angles: [-90, -30, 30, 90, 150, 210],
    cxR: 0.5, cyR: 0.42,
    rxR: 0.28, ryR: 0.32,
    avatarR: 25, centerR: 35,
    minDist: 62,
    spring: 0.022,
    damping: 0.86,
    ripple: 5,
  };

  function create(container, cfg) {
    const opt = { ...DEFAULTS, ...cfg };
    const nodes = opt.nodes;
    const svgNS = 'http://www.w3.org/2000/svg';
    const state = [];
    let W = 0, H = 0, CX = 0, CY = 0;
    let dragging = -1;
    let running = true;
    let centerEl = null;

    const svg = container.querySelector('.fdi-links');
    svg.innerHTML = '';

    /* ---------- 中心节点 ---------- */
    centerEl = document.createElement('button');
    centerEl.className = 'fdi-center';
    centerEl.setAttribute('aria-label', opt.centerName || '中心');
    centerEl.innerHTML = `<img src="${opt.centerImg}" alt="${opt.centerName || ''}"><span>${opt.centerName || ''}</span>`;
    container.appendChild(centerEl);
    centerEl.addEventListener('click', onCenterTap);

    /* ---------- 建图 ---------- */
    W = container.clientWidth;
    H = container.clientHeight;
    CX = W * opt.cxR;
    CY = H * opt.cyR;

    nodes.forEach((n, i) => {
      const ang = (opt.angles[i] * Math.PI) / 180;
      const hx = CX + W * opt.rxR * Math.cos(ang);
      const hy = CY + H * opt.ryR * Math.sin(ang);

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('stroke', n.color || '#D9DBE0');
      svg.appendChild(path);

      const el = document.createElement('div');
      el.className = 'fdi-node';
      el.style.setProperty('--nc', n.color || '#E8101B');
      el.innerHTML = `
        <div class="fdi-avatar"><img src="${n.img}" alt="${n.name}" draggable="false"></div>
        <p class="fdi-name">${n.name}</p>
        <p class="fdi-desc">${n.desc || ''}</p>`;
      container.appendChild(el);

      state.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0, el, path });
      bindNode(el, i);
    });

    placeCenter();
    drawLinks();

    /* ---------- 内部方法 ---------- */
    function placeCenter() {
      centerEl.style.transform =
        `translate(${CX - opt.centerR}px, ${CY - opt.centerR}px)`;
    }

    function drawLinks() {
      for (const s of state) {
        const mx = (CX + s.x) / 2 + (s.y - CY) * 0.12;
        const my = (CY + s.y) / 2 - (s.x - CX) * 0.12;
        s.path.setAttribute('d', `M ${CX} ${CY} Q ${mx} ${my} ${s.x} ${s.y}`);
      }
    }

    function tick() {
      if (running && !document.hidden) {
        state.forEach((s, i) => {
          if (i === dragging) return;
          s.vx += (s.hx - s.x) * opt.spring;
          s.vy += (s.hy - s.y) * opt.spring;
          state.forEach((o, j) => {
            if (j === i) return;
            const dx = s.x - o.x, dy = s.y - o.y;
            const d = Math.hypot(dx, dy) || 0.01;
            if (d < opt.minDist) {
              const f = ((opt.minDist - d) / opt.minDist) * 1.9;
              s.vx += (dx / d) * f;
              s.vy += (dy / d) * f;
            }
          });
          s.vx *= opt.damping;
          s.vy *= opt.damping;
          s.x += s.vx;
          s.y += s.vy;
          s.x = Math.max(opt.avatarR + 1, Math.min(W - opt.avatarR - 1, s.x));
          s.y = Math.max(opt.avatarR + 1, Math.min(H - 14, s.y));
        });
        for (const s of state) {
          s.el.style.transform = `translate(${s.x}px, ${s.y - opt.avatarR}px)`;
        }
        drawLinks();
      }
      requestAnimationFrame(tick);
    }

    function bindNode(el, idx) {
      let sx = 0, sy = 0, moved = false;

      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        dragging = idx;
        moved = false;
        sx = e.clientX;
        sy = e.clientY;
        try { el.setPointerCapture(e.pointerId); } catch (_) { /* 合成事件 */ }
      });

      el.addEventListener('pointermove', (e) => {
        if (dragging !== idx) return;
        if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) moved = true;
        if (!moved) return;
        const s = state[idx];
        s.x = Math.max(opt.avatarR + 2, Math.min(W - opt.avatarR - 2, s.x + (e.movementX || 0)));
        s.y = Math.max(opt.avatarR + 2, Math.min(H - 30, s.y + (e.movementY || 0)));
      });

      el.addEventListener('pointerup', () => {
        if (dragging !== idx) return;
        dragging = -1;
        if (!moved) tap(idx);
      });

      el.addEventListener('pointercancel', () => { dragging = -1; });
    }

    function tap(idx) {
      const s = state[idx];
      const n = nodes[idx];

      const dx = s.x - CX, dy = s.y - CY;
      const d = Math.hypot(dx, dy) || 1;
      s.vx += (dx / d) * opt.ripple;
      s.vy += (dy / d) * opt.ripple;

      state.forEach((o, j) => {
        o.path.classList.toggle('is-hot', j === idx);
        o.path.classList.toggle('is-dim', j !== idx);
        o.path.style.color = nodes[j].color || '#E8101B';
        o.el.classList.toggle('is-hot', j === idx);
      });

      const ripple = document.createElement('span');
      ripple.className = 'fdi-ripple';
      ripple.style.setProperty('--nc', n.color || '#E8101B');
      ripple.style.left = `${s.x}px`;
      ripple.style.top = `${s.y - opt.avatarR}px`;
      container.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    }

    function onCenterTap() {
      centerEl.classList.add('is-pulse');
      setTimeout(() => centerEl.classList.remove('is-pulse'), 300);
      state.forEach((s) => {
        s.path.classList.add('is-hot');
        s.path.style.color = s.path.getAttribute('stroke');
        setTimeout(() => {
          s.path.classList.remove('is-hot', 'is-dim');
          s.el.classList.remove('is-hot');
        }, 460);
      });
    }

    function onResize() {
      const w = container.clientWidth, h = container.clientHeight;
      if (Math.abs(w - W) < 2) return;
      W = w; H = h;
      CX = W * opt.cxR; CY = H * opt.cyR;
      state.forEach((s, i) => {
        const ang = (opt.angles[i] * Math.PI) / 180;
        s.hx = CX + W * opt.rxR * Math.cos(ang);
        s.hy = CY + H * opt.ryR * Math.sin(ang);
      });
      placeCenter();
    }

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', () => { running = !document.hidden; });
    requestAnimationFrame(tick);

    return {
      reset() {
        state.forEach((s) => {
          s.path.classList.remove('is-hot', 'is-dim');
          s.el.classList.remove('is-hot');
        });
      },
    };
  }

  return { create };
})();
