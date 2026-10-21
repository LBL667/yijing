/* ============================================================
   公共 UI · 底部弹层 Sheet
   用法：
     Sheet.open({
       title: '全部搭配',
       content: '<div>...</div>',   // HTML 字符串
       onMount(root) { ... },        // 可选，挂载后绑定事件
     });
     Sheet.close();
   ============================================================ */
'use strict';

window.Sheet = (() => {
  let overlay = null;
  let panel = null;
  let bodyEl = null;
  let titleEl = null;
  let onCloseCb = null;

  function ensure() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'sheet-overlay';
    overlay.innerHTML = `
      <div class="sheet-panel" role="dialog" aria-modal="true">
        <div class="sheet-grab" aria-hidden="true"></div>
        <header class="sheet-head">
          <h2 class="sheet-title"></h2>
          <button class="sheet-close" aria-label="关闭">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </header>
        <div class="sheet-body"></div>
      </div>`;
    document.body.appendChild(overlay);

    panel = overlay.querySelector('.sheet-panel');
    bodyEl = overlay.querySelector('.sheet-body');
    titleEl = overlay.querySelector('.sheet-title');

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector('.sheet-close').addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  }

  function open({ title, content, onMount, onClose }) {
    ensure();
    titleEl.textContent = title || '';
    bodyEl.innerHTML = content || '';
    onCloseCb = onClose || null;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (typeof onMount === 'function') onMount(bodyEl);
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (typeof onCloseCb === 'function') {
      const cb = onCloseCb;
      onCloseCb = null;
      cb();
    }
  }

  return { open, close };
})();
