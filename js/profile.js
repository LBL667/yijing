/* ============================================================
   个人中心 · 穿搭资产
   数据来自 API 层（js/api/client.js），页面不硬编码业务数据
   ============================================================ */
'use strict';

const pcState = { data: null };

/* 站内跳转：SPA 内走路由，独立页访问时直接跳转 */
const goPage = (route) => {
  if (window.Navigate) window.Navigate(route);
  else location.href = route;
};

/* ---------- 线性图标库 ---------- */
const PC_ICONS = {
  shirt: '<path d="M8.6 4.6 5.2 6.3 3.7 10l2.9 1v8.6h10.8V11l2.9-1-1.5-3.7-3.4-1.7a3.5 3.5 0 0 1-6.8 0z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  layers: '<path d="M12 4 3.6 8.2 12 12.4l8.4-4.2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m3.6 12.4 8.4 4.2 8.4-4.2M3.6 16.4l8.4 4.2 8.4-4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  tag: '<path d="M11.4 3.6h6.2a2 2 0 0 1 2 2v6.2L11 20.4 3.6 13z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16.4" cy="7.6" r="1.3" fill="currentColor"/>',
  closet: '<rect x="5" y="3.8" width="14" height="16.4" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 3.8v16.4M9.2 9.6v2.4M14.8 9.6v2.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  hanger: '<path d="M14.5 7a2.5 2.5 0 1 0-5 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 7 3.9 12.8c-.9.7-.4 2.1.7 2.1h14.8c1.1 0 1.6-1.4.7-2.1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  compass: '<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m15.6 8.4-2 5.2-5.2 2 2-5.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  diamond: '<path d="M7.2 4.4h9.6l3.4 4.4L12 20.2 3.8 8.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3.8 8.8h16.4M9.4 4.4 8 8.8l4 11.4 4-11.4-1.4-4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  wallet: '<rect x="3.6" y="6.4" width="16.8" height="12.4" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.6 9.6h16.8M15.2 13.6h2.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  box: '<path d="M4.4 8.2h15.2v10a2 2 0 0 1-2 2H6.4a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3.2 5.2h17.6v3H3.2zM10 12h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  truck: '<path d="M3.4 7h10.2v9.4H3.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13.6 10.2h3.6l3 3.2v3H13.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7" cy="18" r="1.7" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16.8" cy="18" r="1.7" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  check: '<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m8.4 12.2 2.5 2.5 4.7-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  ruler: '<path d="M4.4 14.8 14.8 4.4l4.8 4.8L9.2 19.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m8 11.2 2 2M10.8 8.4l2 2M13.6 5.6l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  heart: '<path d="M12 20.4 10.9 19.4C6 15.1 3.2 12.5 3.2 9.3c0-2.5 1.9-4.4 4.4-4.4 1.4 0 2.8.7 3.6 1.8l.8 1.1.8-1.1c.8-1.1 2.2-1.8 3.6-1.8 2.5 0 4.4 1.9 4.4 4.4 0 3.2-2.8 5.8-7.7 10.1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  robot: '<rect x="4.4" y="8" width="15.2" height="11" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 4.8v3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="3.6" r="1.1" fill="currentColor"/><circle cx="9" cy="13" r="1.1" fill="currentColor"/><circle cx="15" cy="13" r="1.1" fill="currentColor"/><path d="M9.8 16.4h4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  chat: '<path d="M4 7.4C4 6.1 5 5.2 6.2 5.2h11.6c1.2 0 2.2.9 2.2 2.2v7c0 1.3-1 2.2-2.2 2.2H9.4L5.6 19.4l.2-2.8c-1-.2-1.8-1-1.8-2.2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  help: '<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4.9.4c0 1.6-2.4 1.9-2.4 3.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="16.9" r="1.05" fill="currentColor"/>',
  coin: '<ellipse cx="12" cy="7.4" rx="7.4" ry="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4.6 7.4v4.4c0 1.8 3.3 3.2 7.4 3.2s7.4-1.4 7.4-3.2V7.4M4.6 11.8v4.4c0 1.8 3.3 3.2 7.4 3.2s7.4-1.4 7.4-3.2v-4.4" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  bag: '<path d="M5.6 8h12.8l-.9 11.2a1.8 1.8 0 0 1-1.8 1.6H8.3a1.8 1.8 0 0 1-1.8-1.6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.8 10V6.8a3.2 3.2 0 0 1 6.4 0V10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  plusCircle: '<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8.4v7.2M8.4 12h7.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
};

const icon = (name, size = 17) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${PC_ICONS[name] || ''}</svg>`;

const ARROW = '<svg class="pc-sc-arrow" viewBox="0 0 24 24" width="12" height="12"><path d="m9 5.5 6.5 6.5L9 18.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ============================================================
   渲染
   ============================================================ */
function renderProfileCenter(data) {
  /* 头部 */
  document.getElementById('pcAvatar').src = data.user.avatar;
  document.getElementById('pcName').textContent = data.user.name;
  document.getElementById('pcLevel').textContent = data.user.level;
  document.getElementById('pcBio').textContent = data.user.bio;

  /* SVIP 横幅 */
  document.getElementById('svipTitle').textContent = data.svip.title;
  document.getElementById('svipDesc').textContent = data.svip.desc;
  document.getElementById('svipAction').textContent = data.svip.action;

  /* 资产统计 */
  document.getElementById('pcStats').innerHTML = data.assetStats.map((s) => `
    <div class="pc-stat">
      <b>${s.value}</b>
      <span class="pc-stat-label">${icon(s.icon, 12)}${s.label}</span>
    </div>`).join('');

  /* 快捷入口（均可跳转） */
  document.getElementById('pcShortcuts').innerHTML = data.shortcuts.map((s, i) => `
    <button class="pc-shortcut" data-shortcut="${i}">
      ${icon(s.icon, 20)}
      ${ARROW}
      <span class="pc-sc-name">${s.name}</span>
    </button>`).join('');

  document.querySelectorAll('[data-shortcut]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = data.shortcuts[Number(btn.dataset.shortcut)].route;
      if (route) goPage(route);
    });
  });

  /* 穿搭关键词 */
  document.getElementById('pcKeywords').innerHTML = (data.keywords || [])
    .map((k, i) => `<span class="pc-kw${i === 0 ? ' is-main' : ''}">${k.name}<i>${k.pct}%</i></span>`)
    .join('');

  /* 订单 */
  document.getElementById('pcOrders').innerHTML = data.orders.map((o) => `
    <button class="pc-order" data-toast="${o.label}订单为演示入口">
      <span class="pc-order-ic">
        ${icon(o.icon, 22)}
        ${o.badge ? `<span class="pc-order-badge">${o.badge}</span>` : ''}
      </span>
      <span class="pc-order-label">${o.label}</span>
    </button>`).join('');

  /* 更多服务 */
  document.getElementById('pcServices').innerHTML = data.services.map((s, i) => `
    <button class="pc-service" data-service="${i}">
      ${icon(s.icon, 21)}
      <span>${s.label}</span>
    </button>`).join('');

  document.querySelectorAll('[data-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const svc = data.services[Number(btn.dataset.service)];
      if (svc.route) goPage(svc.route);
      else showToast(`「${svc.label}」开发中`);
    });
  });

  /* 静态项 */
  document.querySelectorAll('#pcOrders [data-toast], [data-toast]').forEach((el) => {
    if (el.dataset.toastBound) return;
    el.dataset.toastBound = '1';
    el.addEventListener('click', () => showToast(el.dataset.toast));
  });
}

/* ============================================================
   启动
   ============================================================ */
(async function boot() {
  try {
    const data = await API.getProfileCenter();
    pcState.data = data;
    renderProfileCenter(data);

    /* 设置 → 设置页 */
    document.getElementById('btnSettings')
      .addEventListener('click', () => goPage('settings.html'));

    /* 通知 */
    document.getElementById('btnBell').addEventListener('click', () => {
      showToast('暂无新通知');
    });

  } catch (err) {
    console.error(err);
    showToast('数据加载失败，请刷新重试');
  }
})();
