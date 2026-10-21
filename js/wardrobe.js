/* ============================================================
   我的衣柜 · 三视图（仪表盘 / 穿搭图谱 / 胶囊衣柜）
   所有业务数据来自 API 层（js/api/client.js），本文件不硬编码数据
   模块：DashView / GraphView / CapsuleView / ViewSwitch / ToastLinks
   ============================================================ */
'use strict';

const state = {
  data: null,
  dashCat: '全部',
  season: '春夏',
};

/* ============================================================
   模块 1：我的衣柜（仪表盘）
   ============================================================ */
const DashView = (() => {
  const statsEl = document.getElementById('dashStats');
  const legendEl = document.getElementById('dnaLegend');
  const donutEl = document.getElementById('dnaDonut');
  const cloudEl = document.getElementById('styleCloud');
  const repeatEl = document.getElementById('repeatRate');
  const gapImg = document.getElementById('gapImg');
  const tabsEl = document.getElementById('closetTabs');
  const gridEl = document.getElementById('closetGrid');

  /* 由色系数据生成环形渐变 */
  function buildDonut(colors) {
    let acc = 0;
    const stops = [];
    colors.forEach((c, i) => {
      const pct = parseFloat(c.pct);
      const end = Math.min(100, acc + pct);
      const next = i === colors.length - 1 ? 100 : end;
      stops.push(`${c.hex} ${acc.toFixed(2)}% ${Math.max(acc, next - 0.9).toFixed(2)}%`);
      stops.push(`#FFFFFF ${Math.max(acc, next - 0.9).toFixed(2)}% ${(next + 0.1).toFixed(2)}%`);
      acc = end;
    });
    donutEl.style.background = `conic-gradient(${stops.join(', ')})`;
  }

  function renderCloset(cat) {
    const items = state.data.dashboard.items.filter((it) => cat === '全部' || it.cat === cat);
    gridEl.innerHTML = items.length
      ? items.map((it) => `
        <div class="closet-item" data-toast="衣物详情为演示入口" role="button" tabindex="0">
          <img src="${it.img}" alt="${it.name}" loading="lazy">
          <p class="item-name">${it.name}</p>
          <p class="item-tags">${it.tags.join(' · ')}</p>
        </div>`).join('')
      : '<p class="closet-empty">该分类下暂无衣物</p>';
    ToastLinks.bind(gridEl);
  }

  function render(dash) {
    state.dashCat = '全部';

    /* 统计 */
    statsEl.innerHTML = dash.stats.map((s) => `
      <div class="ws-item"><span>${s.label}</span><b>${s.value}</b></div>`).join('');

    /* DNA */
    legendEl.innerHTML = dash.dna.colors.map((c) => `
      <li><i style="--c:${c.hex}"></i><span>${c.name}</span><b>${c.pct}</b></li>`).join('');
    buildDonut(dash.dna.colors);
    cloudEl.innerHTML = dash.dna.styles.map((s) => `
      <span class="style-chip">${s.name}<b>${s.pct}</b></span>`).join('');

    /* 重复率与缺口 */
    repeatEl.textContent = dash.repeatRate;
    gapImg.src = dash.gap.img;

    /* 智能衣柜 */
    tabsEl.innerHTML = dash.cats.map((c) => `
      <button class="closet-tab ${c === '全部' ? 'is-active' : ''}" data-cat="${c}">${c}</button>`).join('');
    renderCloset('全部');
  }

  function bind() {
    tabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.closet-tab');
      if (!btn || btn.classList.contains('is-active')) return;
      tabsEl.querySelector('.is-active').classList.remove('is-active');
      btn.classList.add('is-active');
      state.dashCat = btn.dataset.cat;
      renderCloset(state.dashCat);
    });
    document.getElementById('gapCard').addEventListener('click', () => {
      showToast('去补货为演示入口');
    });
  }

  function init() { bind(); }
  return { init, render };
})();

/* ============================================================
   模块 2：穿搭图谱
   ============================================================ */
const GraphView = (() => {
  let inited = false;

  function renderStats(stats) {
    document.getElementById('graphStats').innerHTML = stats.map((s) => `
      <div class="ws-item"><span>${s.label}</span><b>${s.value}</b></div>`).join('');
  }

  function renderCombos(combos) {
    document.getElementById('comboRow').innerHTML = combos.map((c) => `
      <div class="combo-card" data-toast="搭配详情为演示入口" role="button" tabindex="0">
        <img src="${c.img}" alt="${c.name}" loading="lazy">
        <p>${c.name}</p>
      </div>`).join('');
    ToastLinks.bind(document.getElementById('comboRow'));
  }

  /* 查看全部搭配：底部弹层 */
  function openAllCombos(graph) {
    Sheet.open({
      title: '全部搭配',
      content: `
        <div class="sheet-list">
          ${graph.allCombos.map((c) => `
            <div class="sheet-list-item">
              <img src="${c.img}" alt="${c.name}" loading="lazy">
              <p>${c.name}</p>
              <span>${c.scene} · 穿过 ${c.freq} 次</span>
            </div>`).join('')}
        </div>`,
    });
  }

  function init(retry = true) {
    if (inited) return;
    const el = document.getElementById('fdiGraph');
    if (!el || el.clientWidth < 10) {
      if (retry) setTimeout(() => init(false), 60);
      return;
    }
    inited = true;

    const g = state.data.graph;
    ForceGraph.create(el, {
      nodes: g.nodes,
      angles: [-90, -33, 41, 140, 207],
      centerImg: g.center.img,
      centerName: g.center.name,
      avatarR: 24, centerR: 32,
      cxR: 0.5, cyR: 0.47,
      rxR: 0.33, ryR: 0.36,
      minDist: 58,
    });
  }

  function render(g) {
    renderStats(g.stats);
    renderCombos(g.combos);
  }

  return { init, render, openAllCombos };
})();

/* ============================================================
   模块 3：胶囊衣柜
   ============================================================ */
const CapsuleView = (() => {
  const container = document.getElementById('capsuleCats');
  const seasonRow = document.getElementById('seasonRow');

  function renderSeasonRow(seasons) {
    seasonRow.innerHTML = seasons.map((s) => `
      <button class="season ${s === state.season ? 'is-active' : ''}" data-season="${s}">${s}</button>`).join('');
  }

  function renderCats(capsule) {
    const stats = capsule.seasonStats[state.season];
    document.getElementById('statCore').textContent = stats.core;
    document.getElementById('statLooks').textContent = stats.looks;
    document.getElementById('statWeek').textContent = stats.week;

    container.innerHTML = capsule.categories.map((cat) => {
      const list = cat.items.filter((it) => it.season.includes(state.season));
      if (!list.length) return '';
      return `
        <section class="panel cat-panel">
          <button class="cat-head" data-toast="${cat.key}全部单品为演示入口">
            <span class="cat-name">${cat.key} <span class="cat-count">${list.length}件</span></span>
            <svg class="cat-arrow" viewBox="0 0 24 24" width="15" height="15"><path d="m9 5.5 6.5 6.5L9 18.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="item-grid cols-${cat.cols}">
            ${list.map((it) => `
              <div class="cap-item" data-toast="衣物详情为演示入口" role="button" tabindex="0">
                <img src="${it.img}" alt="${it.name}" loading="lazy">
                <p>${it.name}</p>
              </div>`).join('')}
          </div>
        </section>`;
    }).join('');
    ToastLinks.bind(container);
  }

  /* 编辑胶囊：底部弹层，可移除单品 */
  function openEdit() {
    const capsule = state.data.capsule;
    const all = capsule.categories.flatMap((cat) =>
      cat.items.map((it) => ({ ...it, catKey: cat.key })));

    Sheet.open({
      title: '编辑胶囊',
      content: all.length ? `
        <div class="cap-edit-list">
          ${all.map((it) => `
            <div class="cap-edit-item" data-id="${it.id}">
              <img src="${it.img}" alt="${it.name}">
              <span class="ce-name">${it.name}<span class="ce-cat">${it.catKey}</span></span>
              <button class="cap-edit-remove" data-remove="${it.id}">移除</button>
            </div>`).join('')}
        </div>
        <div class="sheet-actions">
          <button class="sheet-btn ghost" data-upload>上传衣服</button>
          <button class="sheet-btn primary" data-done>完成</button>
        </div>` : '<p class="cap-edit-empty">胶囊衣柜是空的</p>',
      onMount(root) {
        root.querySelectorAll('[data-remove]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            await API.removeCapsuleItem(btn.dataset.remove);
            const fresh = await API.getWardrobe();
            state.data.capsule = fresh.capsule;
            renderCats(state.data.capsule);
            Sheet.close();
            showToast('已从胶囊中移除');
          });
        });
        root.querySelector('[data-upload]')?.addEventListener('click', () => {
          Sheet.close();
          openUpload();
        });
        root.querySelector('[data-done]')?.addEventListener('click', () => Sheet.close());
      },
    });
  }

  /* 上传衣服：图片 + 名称 + 分类标签 */
  function openUpload() {
    const CATS = ['上装', '下装', '鞋包'];
    Sheet.open({
      title: '上传衣服',
      content: `
        <div class="upload-form">
          <label class="upload-pick">
            <input type="file" accept="image/*" id="upFile" hidden>
            <div class="upload-preview" id="upPreview">
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <path d="M4 8.6c0-1 .8-1.8 1.8-1.8h1.7l1.2-1.9h6.6l1.2 1.9h1.7c1 0 1.8.8 1.8 1.8v8.6c0 1-.8 1.8-1.8 1.8H5.8c-1 0-1.8-.8-1.8-1.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                <circle cx="12" cy="12.4" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/>
              </svg>
              <span>点击上传衣服图片</span>
            </div>
          </label>
          <div class="sheet-field">
            <label for="upName">衣服名称</label>
            <input id="upName" type="text" maxlength="12" placeholder="给这件衣服起个名字">
          </div>
          <div class="sheet-field">
            <label>分类标签</label>
            <div class="cat-picker" id="upCats">
              ${CATS.map((c, i) => `<button class="${i === 0 ? 'is-active' : ''}" data-cat="${c}">${c}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="sheet-actions">
          <button class="sheet-btn ghost" data-cancel>取消</button>
          <button class="sheet-btn primary" data-save>保存到衣柜</button>
        </div>`,
      onMount(root) {
        let imgData = '';
        let cat = CATS[0];
        const fileInput = root.querySelector('#upFile');
        const preview = root.querySelector('#upPreview');

        fileInput.addEventListener('change', () => {
          const file = fileInput.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            imgData = reader.result;
            preview.classList.add('has-img');
            preview.innerHTML = `<img src="${imgData}" alt="衣服预览">`;
          };
          reader.readAsDataURL(file);
        });

        const picker = root.querySelector('#upCats');
        picker.addEventListener('click', (e) => {
          const btn = e.target.closest('button');
          if (!btn) return;
          picker.querySelector('.is-active').classList.remove('is-active');
          btn.classList.add('is-active');
          cat = btn.dataset.cat;
        });

        root.querySelector('[data-cancel]').addEventListener('click', () => Sheet.close());
        root.querySelector('[data-save]').addEventListener('click', async () => {
          const name = root.querySelector('#upName').value.trim();
          if (!imgData) { showToast('请先选择衣服图片'); return; }
          if (!name) { showToast('请填写衣服名称'); return; }
          try {
            await API.addCapsuleItem({ name, img: imgData, cat });
            const fresh = await API.getWardrobe();
            state.data.capsule = fresh.capsule;
            renderCats(state.data.capsule);
            Sheet.close();
            showToast(`「${name}」已加入胶囊衣柜`);
          } catch (_) {
            showToast('保存失败，请稍后再试');
          }
        });
      },
    });
  }

  function init() {
    seasonRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.season');
      if (!btn || btn.classList.contains('is-active')) return;
      state.season = btn.dataset.season;
      renderSeasonRow(state.data.capsule.seasons);
      renderCats(state.data.capsule);
    });
    document.getElementById('btnGenWeek').addEventListener('click', () => {
      showToast('已按当前季节生成一周穿搭方案');
    });
    document.getElementById('btnEditCapsule').addEventListener('click', openEdit);
  }

  function render(capsule) {
    renderSeasonRow(capsule.seasons);
    renderCats(capsule);
  }

  return { init, render };
})();

/* ============================================================
   模块 4：视图切换
   ============================================================ */
const ViewSwitch = (() => {
  const tabs = document.getElementById('wdTabs');
  const views = {
    dash: document.getElementById('viewDash'),
    graph: document.getElementById('viewGraph'),
    capsule: document.getElementById('viewCapsule'),
  };

  function switchTo(view) {
    Object.entries(views).forEach(([key, el]) => {
      const active = key === view;
      el.hidden = !active;
      el.classList.toggle('is-entering', active);
    });
    tabs.querySelectorAll('.wd2-tab').forEach((btn) => {
      const active = btn.dataset.view === view;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    if (view === 'graph') {
      GraphView.init();
    }
  }

  function init() {
    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.wd2-tab');
      if (!btn || btn.classList.contains('is-active')) return;
      switchTo(btn.dataset.view);
      /* 独立页面时同步地址，便于刷新保持视图 */
      if (!window.AppRouter) {
        history.replaceState(null, '', `?view=${btn.dataset.view}`);
      }
    });

    /* 支持 ?view= / #view= 直接进入对应视图（独立访问与 SPA 首入都适用） */
    const fromSearch = new URLSearchParams(location.search).get('view');
    const fromHash = (location.hash.match(/[?&]view=(\w+)/) || [])[1];
    const view = fromSearch || fromHash;
    if (view && views[view]) switchTo(view);
  }

  return { init, open: (view) => { if (views[view]) switchTo(view); } };
})();

/* ============================================================
   模块 5：演示入口提示（支持动态节点）
   ============================================================ */
const ToastLinks = (() => {
  function bind(scope) {
    (scope || document).querySelectorAll('[data-toast]').forEach((el) => {
      if (el.dataset.toastBound) return;
      el.dataset.toastBound = '1';
      el.addEventListener('click', () => showToast(el.dataset.toast));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showToast(el.dataset.toast);
        }
      });
    });
  }
  function init() { bind(document); }
  return { init, bind };
})();

/* ============================================================
   启动
   ============================================================ */
(async function boot() {
  try {
    const data = await API.getWardrobe();
    state.data = data;

    DashView.init();
    DashView.render(data.dashboard);

    GraphView.render(data.graph);

    CapsuleView.init();
    CapsuleView.render(data.capsule);

    ViewSwitch.init();
    window.Pages = window.Pages || {};
    window.Pages.wardrobe = { open: ViewSwitch.open };
    ToastLinks.init();
    document.getElementById('btnAllCombos')
      .addEventListener('click', () => GraphView.openAllCombos(state.data.graph));
    GraphView.init();
  } catch (err) {
    console.error(err);
    showToast('数据加载失败，请刷新重试');
  }
})();
