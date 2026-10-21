/* ============================================================
   公共模块：底部导航路由 + Toast
   由社区页(index.html)与 AI 助手页(ai.html)共用
   ============================================================ */
'use strict';

/* ---------- Toast ---------- */
const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(text) {
  if (!toastEl || !text) return;
  toastEl.textContent = text;
  toastEl.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 1600);
}

/* ---------- 底部导航路由 ---------- */
/* 站点已升级为单页应用：独立页面作为降级入口，
   底部导航统一回到 SPA 的对应路由。 */
const TAB_ROUTES = {
  '社区': 'index.html#/community',
  'AI助手': 'index.html#/assistant',
  '衣柜': 'index.html#/wardrobe',
  '我的': 'index.html#/profile',
};

const tabBar = document.getElementById('tabBar');
if (tabBar) {
  tabBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn || btn.classList.contains('is-active')) return;
    const name = btn.dataset.tab;
    const route = TAB_ROUTES[name];
    if (route) {
      location.href = route;
    } else {
      showToast(`「${name}」为演示入口，敬请期待`);
    }
  });
}
