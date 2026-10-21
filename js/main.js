/* ============================================================
   社区 · 页面交互
   数据来自 API 层（js/api/client.js）
   模块：FilterBar / Feed / LikeBox / StickyHeader
   ============================================================ */
'use strict';

const cmState = {
  data: null,
  shape: '全部',
  scene: '全部场景',
  keyword: '',
  liked: new Set(),
};

const colLeft = document.getElementById('colLeft');
const colRight = document.getElementById('colRight');
const emptyState = document.getElementById('emptyState');

/* ---------- SVG 模板 ---------- */
const HEART_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true">' +
  '<path class="heart-path" d="M12 20.4l-1.1-1C6 15.1 3.2 12.5 3.2 9.3c0-2.5 1.9-4.4 4.4-4.4 1.4 0 2.8.7 3.6 1.8l.8 1.1.8-1.1c.8-1.1 2.2-1.8 3.6-1.8 2.5 0 4.4 1.9 4.4 4.4 0 3.2-2.8 5.8-7.7 10.1z" ' +
  'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

/* ============================================================
   模块 1：筛选栏（数据来自 API）
   ============================================================ */
const FilterBar = (() => {
  function render(data) {
    document.getElementById('pillRow').innerHTML = data.shapes.map((s, i) => `
      <button class="pill ${i === 0 ? 'is-active' : ''}" data-shape="${s}">${s}</button>`).join('');
    document.getElementById('sceneRow').innerHTML = data.scenes.map((s, i) => `
      <button class="scene ${i === 0 ? 'is-active' : ''}" data-scene="${s}">${s}</button>`).join('');
  }

  function bind(onChange) {
    ['pillRow', 'sceneRow'].forEach((id) => {
      const row = document.getElementById(id);
      row.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || btn.classList.contains('is-active')) return;
        row.querySelector('.is-active').classList.remove('is-active');
        btn.classList.add('is-active');
        if (row.id === 'pillRow') cmState.shape = btn.dataset.shape;
        else cmState.scene = btn.dataset.scene;
        onChange();
      });
    });
  }

  return { render, bind };
})();

/* ============================================================
   模块 2：信息流（双列分配 + 筛选）
   ============================================================ */
const Feed = (() => {
  function buildCard(card) {
    const el = document.createElement('article');
    el.className = 'card is-entering';
    el.dataset.id = card.id;

    const liked = cmState.liked.has(card.id);
    const likeCount = card.likes + (liked ? 1 : 0);

    el.innerHTML = `
      <div class="card-media">
        <img src="${card.img}" alt="${card.shape}身材${card.scene}穿搭"
             style="aspect-ratio:${card.w}/${card.h}">
        <div class="card-tags"><span>${card.shape}</span><i></i><span>${card.scene}</span></div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${card.title}</h3>
        <div class="card-meta">
          <div class="card-user">
            <img class="card-avatar" src="${card.avatar}" alt="" loading="lazy">
            <span class="card-name">${card.user}</span>
          </div>
          <button class="card-like ${liked ? 'is-liked' : ''}" aria-label="点赞" aria-pressed="${liked}">
            ${HEART_SVG}<span class="like-count">${likeCount}</span>
          </button>
        </div>
      </div>`;

    const img = el.querySelector('.card-media img');
    img.addEventListener('load', () => img.classList.add('is-loaded'));
    if (img.complete) img.classList.add('is-loaded');

    el.querySelector('.card-like').addEventListener('click', (e) => {
      e.stopPropagation();
      LikeBox.toggle(card.id, e.currentTarget);
    });

    return el;
  }

  function render() {
    const list = cmState.data.cards.filter((c) => {
      if (cmState.shape !== '全部' && c.shape !== cmState.shape) return false;
      if (cmState.scene !== '全部场景' && c.scene !== cmState.scene) return false;
      if (cmState.keyword && !c.title.includes(cmState.keyword)) return false;
      return true;
    });

    colLeft.innerHTML = '';
    colRight.innerHTML = '';

    const colW = colLeft.clientWidth || 160;
    let hL = 0, hR = 0;
    list.forEach((card) => {
      const est = Math.round((colW * (card.h / card.w) + 96) / 8) * 8;
      const target = hL <= hR + 1 ? colLeft : colRight;
      if (target === colLeft) hL += est; else hR += est;
      target.appendChild(buildCard(card));
    });

    emptyState.hidden = list.length > 0;
  }

  return { render };
})();

/* ============================================================
   模块 3：点赞
   ============================================================ */
const LikeBox = (() => {
  function toggle(id, btn) {
    const card = cmState.data.cards.find((c) => c.id === id);
    const countEl = btn.querySelector('.like-count');
    const nowLiked = !cmState.liked.has(id);

    if (nowLiked) cmState.liked.add(id);
    else cmState.liked.delete(id);

    btn.classList.toggle('is-liked', nowLiked);
    btn.setAttribute('aria-pressed', String(nowLiked));
    countEl.textContent = card.likes + (nowLiked ? 1 : 0);

    btn.classList.remove('is-popping');
    void btn.offsetWidth;
    btn.classList.add('is-popping');
  }
  return { toggle };
})();

/* ============================================================
   模块 4：吸顶阴影 + 搜索
   ============================================================ */
const StickyHeader = (() => {
  function init() {
    const topSticky = document.getElementById('topSticky');
    window.addEventListener('scroll', () => {
      topSticky.classList.toggle('is-scrolled', window.scrollY > 4);
    }, { passive: true });

    const input = document.getElementById('searchInput');
    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        cmState.keyword = input.value.trim();
        Feed.render();
      }, 250);
    });

    window.addEventListener('resize', () => Feed.render());
  }
  return { init };
})();

/* ============================================================
   启动
   ============================================================ */
(async function boot() {
  try {
    const data = await API.getCommunityFeed();
    cmState.data = data;

    FilterBar.render(data);
    FilterBar.bind(() => Feed.render());
    StickyHeader.init();
    Feed.render();
  } catch (err) {
    console.error(err);
    emptyState.hidden = false;
  }
})();
