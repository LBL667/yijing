/* ============================================================
   应用路由 · 单页切换
   ------------------------------------------------------------
   各页面（community / assistant / wardrobe / profile / settings）
   以片段形式按需注入，页面脚本首次进入时加载一次，之后常驻内存。
   切换使用 View Transitions（支持时）或 CSS 淡入降级，做到无白屏。
   ============================================================ */
'use strict';

const Router = (() => {
  const ROUTES = {
    community: { file: 'community.html', js: 'js/main.js',     tab: 'community' },
    assistant: { file: 'ai.html',        js: 'js/ai.js',       tab: 'assistant' },
    wardrobe:  { file: 'wardrobe.html',  js: 'js/wardrobe.js', tab: 'wardrobe' },
    profile:   { file: 'profile.html',   js: 'js/profile.js',  tab: 'profile' },
    settings:  { file: 'settings.html',  js: 'js/settings.js', tab: null },
  };
  const DEFAULT = 'community';

  const cache = new Map();       // name -> section 元素
  const scripts = new Set();     // 已加载的页面脚本
  let current = null;
  let boot = null;               // 当前切换 promise，避免并发
  let firstPaint = true;

  const host = () => document.getElementById('pageHost');

  /* 首屏无独立骨架层，内容自身淡入 */
  function dismissBoot() {}

  /* ---------- 时间工具 ----------
     等一帧：rAF 在无头浏览器 / 后台标签 / 省电模式下可能不触发，
     必须带定时兜底，否则切换流程会永久挂起。 */
  const nextFrame = () => new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    requestAnimationFrame(finish);
    setTimeout(finish, 60);
  });

  /* ---------- 拉取页面片段 ---------- */
  async function fetchPage(name) {
    const cfg = ROUTES[name];
    const res = await fetch(cfg.file, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`${cfg.file} ${res.status}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const app = doc.querySelector('.app');
    if (!app) throw new Error(`${cfg.file} 缺少 .app 外壳`);

    const page = document.createElement('section');
    page.className = 'page';
    page.dataset.page = name;
    page.appendChild(document.importNode(app, true));
    return page;
  }

  /* ---------- 加载页面脚本（仅一次） ---------- */
  function loadScript(src) {
    if (scripts.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => { scripts.add(src); resolve(); };
      s.onerror = () => reject(new Error(`脚本加载失败 ${src}`));
      document.body.appendChild(s);
    });
  }

  /* ---------- 准备页面（DOM + 脚本 + 首屏渲染） ---------- */
  async function ensure(name) {
    if (cache.has(name)) return cache.get(name);

    const page = await fetchPage(name);
    host().appendChild(page);          // 先入 DOM，脚本才能取到元素
    await loadScript(ROUTES[name].js);
    await nextFrame();                 // 等页面 boot 的首轮渲染落地
    await nextFrame();
    cache.set(name, page);
    return page;
  }

  /* ---------- tab 高亮 ---------- */
  function syncTab(name) {
    const tabName = ROUTES[name] ? ROUTES[name].tab : null;
    document.querySelectorAll('#tabBar .tab').forEach((btn) => {
      const active = btn.dataset.route === tabName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    /* 设置等二级页隐藏底部导航，贴近原生二级页体感 */
    document.getElementById('tabBar').style.display = tabName ? '' : 'none';
  }

  /* ---------- 子视图（衣柜：dash / graph / capsule） ---------- */
  function applyQuery(name, query) {
    if (name === 'wardrobe' && query.view && window.Pages?.wardrobe) {
      window.Pages.wardrobe.open(query.view);
    }
  }

  /* ---------- 切换 ---------- */
  async function go(name, { query = {}, replace = false, silent = false } = {}) {
    if (!ROUTES[name]) name = DEFAULT;
    if (name === current) {
      applyQuery(name, query);
      return;
    }
    if (boot) await boot.catch(() => {});
    boot = (async () => {
      const page = await ensure(name);
      const prev = current ? cache.get(current) : null;

      /* 纯 CSS 过渡：新页淡入 + 轻微上移，旧页立即卸载。
         不依赖 View Transitions API（该 API 在无渲染帧的环境下不回调，
         会导致切换卡死），任何浏览器行为一致。 */
      if (prev) prev.classList.remove('is-active', 'is-entering');
      document.querySelectorAll('.page').forEach((p) => p.classList.remove('is-active'));
      page.classList.add('is-active');
      if (!firstPaint) {
        page.classList.remove('is-entering');
        void page.offsetWidth;      // 强制回流，让动画可重播
        page.classList.add('is-entering');
      }
      current = name;
      syncTab(name);

      applyQuery(name, query);
      updateHash(name, query, replace);
      firstPaint = false;
      dismissBoot();
      /* 页面回到顶部，符合 APP 切页习惯 */
      window.scrollTo(0, 0);
    })();

    try {
      await boot;
    } finally {
      boot = null;
    }
  }

  /* ---------- hash 同步 ---------- */
  function updateHash(name, query, replace) {
    const qs = Object.entries(query)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const hash = `#/${name}${qs ? '?' + qs : ''}`;
    if (location.hash === hash) return;
    if (replace) history.replaceState(null, '', hash);
    else history.pushState(null, '', hash);
  }

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    if (!raw) return { name: DEFAULT, query: {} };
    const [name, qs] = raw.split('?');
    const query = {};
    if (qs) {
      qs.split('&').forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k) query[k] = decodeURIComponent(v || '');
      });
    }
    return { name: ROUTES[name] ? name : DEFAULT, query };
  }

  /* ---------- 站内跳转入口（供其他页面调用） ---------- */
  function navigate(route, opts = {}) {
    if (!route) return;
    /* 兼容 "wardrobe.html?view=graph" 这类页面地址 */
    const m = /^([\w-]+)\.html(?:\?(.*))?$/.exec(route);
    if (m) {
      const query = {};
      if (m[2]) {
        m[2].split('&').forEach((pair) => {
          const [k, v] = pair.split('=');
          if (k) query[k] = decodeURIComponent(v || '');
        });
      }
      const alias = { 'community': 'community', 'index': 'community', 'ai': 'assistant' };
      const name = ROUTES[m[1]] ? m[1] : (alias[m[1]] || DEFAULT);
      go(name, { query, ...opts });
      return;
    }
    if (route.startsWith('#/')) {
      const [name, qs] = route.slice(2).split('?');
      const query = {};
      if (qs) {
        qs.split('&').forEach((pair) => {
          const [k, v] = pair.split('=');
          if (k) query[k] = decodeURIComponent(v || '');
        });
      }
      go(ROUTES[name] ? name : DEFAULT, { query, ...opts });
      return;
    }
    location.href = route;
  }

  /* ---------- 预热：空闲时预取其余页面 HTML ---------- */
  function prefetch() {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 900));
    idle(() => {
      Object.keys(ROUTES).forEach(async (name) => {
        if (cache.has(name) || name === current) return;
        if (document.querySelector(`.page[data-page="${name}"]`)) return;
        try {
          const page = await fetchPage(name);
          host().appendChild(page);
          cache.set(name, page);
        } catch (_) { /* 预取失败静默忽略 */ }
      });
    });
  }

  /* ---------- 初始化 ---------- */
  function start() {
    /* tab 点击 */
    document.getElementById('tabBar').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      const route = btn.dataset.route;
      if (route === current) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      go(route);
    });

    /* 浏览器前进/后退 */
    window.addEventListener('popstate', () => {
      const { name, query } = parseHash();
      go(name, { query, silent: false });
    });

    /* 暴露给页面脚本使用 */
    window.Navigate = navigate;
    window.AppRouter = { go, navigate };

    const { name, query } = parseHash();
    go(name, { query, replace: true })
      .catch((err) => {
        console.error('[router] 首屏加载失败', err);
        dismissBoot();
        if (window.showToast) showToast('页面加载失败，请刷新重试');
      })
      .finally(() => prefetch());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  return { go, navigate };
})();
