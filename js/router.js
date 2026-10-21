/* ============================================================
   应用路由 · 单页切换
   ------------------------------------------------------------
   · 各页面以片段形式按需注入，脚本首次进入时加载一次，之后常驻内存
   · 页面唯一性：注入前清理同名残留 + inflight 加载锁，
     避免重复注入导致页面脚本绑定到隐藏的那份 DOM（点击失效）
   · 切换使用纯 CSS 过渡，不依赖 View Transitions（部分环境不回调）
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

  const pageCache = new Map();   // name -> section（DOM + 脚本就绪）
  const htmlCache = new Map();   // name -> 片段 HTML 文本
  const inflight = new Map();    // name -> Promise<section>
  const scripts = new Set();     // 已加载的页面脚本

  let current = null;
  let boot = null;
  let firstPaint = true;

  const host = () => document.getElementById('pageHost');

  /* ---------- 等一帧（rAF 在后台/省电模式可能不触发，必须有定时兜底） ---------- */
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

  /* ---------- 片段获取（只缓存文本，不碰 DOM） ---------- */
  async function fetchHtml(name) {
    if (htmlCache.has(name)) return htmlCache.get(name);
    const cfg = ROUTES[name];
    const res = await fetch(cfg.file, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`${cfg.file} ${res.status}`);
    const html = await res.text();
    htmlCache.set(name, html);
    return html;
  }

  /* ---------- 由片段构建页面节点 ---------- */
  function buildPage(name, html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const app = doc.querySelector('.app');
    if (!app) throw new Error(`${ROUTES[name].file} 缺少 .app 外壳`);
    const page = document.createElement('section');
    page.className = 'page';
    page.dataset.page = name;
    page.appendChild(document.importNode(app, true));
    return page;
  }

  /* ---------- 页面脚本（每个文件只执行一次） ---------- */
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

  /* ---------- 准备页面：唯一性由「清理残留 + 加载锁」保证 ---------- */
  async function ensure(name) {
    if (pageCache.has(name)) return pageCache.get(name);
    if (inflight.has(name)) return inflight.get(name);

    const task = (async () => {
      const html = await fetchHtml(name);
      /* 清理同名残留节点，确保脚本里的 #id 查询命中的是本份 DOM */
      host().querySelectorAll(`.page[data-page="${name}"]`).forEach((el) => el.remove());
      const page = buildPage(name, html);
      host().appendChild(page);
      await loadScript(ROUTES[name].js);
      await nextFrame();
      await nextFrame();
      pageCache.set(name, page);
      return page;
    })().finally(() => inflight.delete(name));

    inflight.set(name, task);
    return task;
  }

  /* ---------- tab 高亮 ---------- */
  function syncTab(name) {
    const tabName = ROUTES[name] ? ROUTES[name].tab : null;
    document.querySelectorAll('#tabBar .tab').forEach((btn) => {
      const active = btn.dataset.route === tabName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    /* 设置这类二级页隐藏底部导航，贴近原生二级页体感 */
    document.getElementById('tabBar').style.display = tabName ? '' : 'none';
  }

  /* ---------- 子视图（衣柜：dash / graph / capsule） ---------- */
  function applyQuery(name, query) {
    if (name === 'wardrobe' && query.view && window.Pages && window.Pages.wardrobe) {
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
      const prev = current ? pageCache.get(current) : null;

      if (prev) prev.classList.remove('is-active', 'is-entering');
      if (!silent) {
        document.querySelectorAll('.page').forEach((p) => p.classList.remove('is-active'));
      }
      page.classList.add('is-active');
      if (!firstPaint && !silent) {
        page.classList.remove('is-entering');
        void page.offsetWidth;          // 强制回流，让动画可重播
        page.classList.add('is-entering');
      }

      current = name;
      syncTab(name);
      applyQuery(name, query);
      updateHash(name, query, replace);
      firstPaint = false;
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

  /* ---------- 站内跳转入口 ---------- */
  function navigate(route, opts = {}) {
    if (!route) return;
    const m = /^([\w-]+)\.html(?:\?(.*))?$/.exec(route);
    if (m) {
      const query = {};
      if (m[2]) {
        m[2].split('&').forEach((pair) => {
          const [k, v] = pair.split('=');
          if (k) query[k] = decodeURIComponent(v || '');
        });
      }
      const alias = { community: 'community', index: 'community', ai: 'assistant' };
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

  /* ---------- 预热：只拉片段文本，不插入 DOM、不执行脚本 ---------- */
  function prefetch() {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 700));
    idle(() => {
      Object.keys(ROUTES).forEach((name) => {
        if (pageCache.has(name) || htmlCache.has(name)) return;
        fetchHtml(name).catch(() => {});
      });
    });
  }

  /* ---------- 初始化 ---------- */
  function start() {
    document.getElementById('tabBar').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      const route = btn.dataset.route;
      if (!route) return;
      if (route === current) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      go(route);
    });

    window.addEventListener('popstate', () => {
      const { name, query } = parseHash();
      go(name, { query });
    });

    window.Navigate = navigate;
    window.AppRouter = { go, navigate };

    const { name, query } = parseHash();
    go(name, { query, replace: true })
      .catch((err) => {
        console.error('[router] 首屏加载失败', err);
        if (window.showToast) window.showToast('页面加载失败，请刷新重试');
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
