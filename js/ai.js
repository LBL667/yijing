/* ============================================================
   AI 助手 · 页面交互
   数据全部来自 API 层（js/api/client.js）
   模块：BodyPanel（含编辑弹层）/ ProductCarousel / AddCloset / ChatFlow
   ============================================================ */
'use strict';

const aiState = {
  data: null,
  index: 0,
};

/* ---------- 店铺图标模板 ---------- */
const STORE_ICONS = {
  bag: '<path d="M5.6 8h12.8l-.9 11.2a1.8 1.8 0 0 1-1.8 1.6H8.3a1.8 1.8 0 0 1-1.8-1.6z" fill="none" stroke="#E05585" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.8 10V6.8a3.2 3.2 0 0 1 6.4 0V10" fill="none" stroke="#E05585" stroke-width="1.7" stroke-linecap="round"/>',
  hanger: '<path d="M14.5 7a2.5 2.5 0 1 0-5 0" fill="none" stroke="#E05585" stroke-width="1.7" stroke-linecap="round"/><path d="M12 7 3.9 12.8c-.9.7-.4 2.1.7 2.1h14.8c1.1 0 1.6-1.4.7-2.1z" fill="none" stroke="#E05585" stroke-width="1.7" stroke-linejoin="round"/>',
  store: '<path d="M4.5 9.5 6 5.4a1.2 1.2 0 0 1 1.1-.8h9.8a1.2 1.2 0 0 1 1.1.8l1.5 4.1" fill="none" stroke="#E05585" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 9.5V19a.8.8 0 0 0 .8.8h12.4a.8.8 0 0 0 .8-.8V9.5M10 19.6v-5h4v5" fill="none" stroke="#E05585" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
};

/* ============================================================
   模块 1：身材数据卡（可编辑）
   ============================================================ */
const BodyPanel = (() => {
  function renderMetrics(metrics) {
    document.querySelector('.body-metrics').innerHTML = metrics.map((m) => `
      <div class="metric">
        <span class="m-label">${m.label}</span>
        <p><b>${m.value}</b><i>${m.unit}</i></p>
      </div>`).join('');
  }

  function render(body) {
    document.querySelector('.body-img').src = body.silhouette;
    const userAv = document.querySelector('.msg-av[alt="用户头像"]');
    if (userAv) userAv.src = body.avatar;
    renderMetrics(body.metrics);
  }

  /* 编辑弹层 */
  function openEditor() {
    const metrics = aiState.data.body.metrics;
    Sheet.open({
      title: '编辑身材数据',
      content: `
        <div class="metric-edit-grid">
          ${metrics.map((m) => `
            <div class="me-row">
              <label>${m.label}</label>
              <div class="me-input">
                <input type="number" inputmode="decimal" data-label="${m.label}" value="${m.value}">
                <span>${m.unit}</span>
              </div>
            </div>`).join('')}
        </div>
        <div class="sheet-actions">
          <button class="sheet-btn ghost" data-cancel>取消</button>
          <button class="sheet-btn primary" data-save>保存</button>
        </div>`,
      onMount(root) {
        root.querySelector('[data-cancel]').addEventListener('click', () => Sheet.close());
        root.querySelector('[data-save]').addEventListener('click', async () => {
          const list = [...root.querySelectorAll('.me-input input')].map((inp) => ({
            label: inp.dataset.label,
            value: inp.value.trim(),
          }));
          if (list.some((m) => !m.value)) {
            showToast('请填写完整的身材数据');
            return;
          }
          try {
            const res = await API.updateBodyMetrics(list);
            aiState.data.body.metrics = res.metrics;
            renderMetrics(res.metrics);
            Sheet.close();
            showToast('身材数据已更新');
          } catch (_) {
            showToast('保存失败，请稍后再试');
          }
        });
      },
    });
  }

  function init() {
    document.getElementById('btnEditBody').addEventListener('click', openEditor);
  }

  return { render, init };
})();

/* ============================================================
   模块 2：商品轮播（图 + 详情 + 店铺联动）
   ============================================================ */
const ProductCarousel = (() => {
  const pImage = document.getElementById('pImage');
  const pCount = document.getElementById('pCount');
  const pTitle = document.getElementById('pTitle');
  const pChips = document.getElementById('pChips');
  const pSizeTitle = document.getElementById('pSizeTitle');
  const pSizeTable = document.getElementById('pSizeTable');
  const pMatchNum = document.getElementById('pMatchNum');
  const pMatchBar = document.getElementById('pMatchBar');
  const pReason = document.getElementById('pReason');
  const storeRow = document.getElementById('storeRow');

  function current() {
    return aiState.data.products[aiState.index];
  }

  function render(index, animate) {
    const products = aiState.data.products;
    aiState.index = (index + products.length) % products.length;
    const p = products[aiState.index];

    if (animate) {
      pImage.style.animation = 'none';
      void pImage.offsetWidth;
      pImage.style.animation = 'ai2In 0.3s ease';
    }
    pImage.src = p.img;
    pImage.alt = p.title;
    pCount.textContent = `${aiState.index + 1}/${products.length}`;

    pTitle.textContent = p.title;
    pChips.innerHTML = p.chips.map((c) => `<span>${c}</span>`).join('');
    pSizeTitle.textContent = `尺码建议（${p.size}）`;
    pSizeTable.innerHTML = p.sizeTable.map(([k, v]) => `<p><span>${k}</span><b>${v}</b></p>`).join('');
    pMatchNum.textContent = `${p.match}%`;
    pMatchBar.style.width = `${p.match}%`;
    pReason.textContent = p.reason;

    storeRow.innerHTML = p.stores.map((s) => `
      <button class="store-card" data-toast="正在前往「${s.name}」（演示）">
        <svg class="store-ic" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">${STORE_ICONS[s.icon] || STORE_ICONS.store}</svg>
        <span class="store-txt"><b>${s.name}</b><i>${s.sub}</i></span>
        <svg class="store-arrow" viewBox="0 0 24 24" width="13" height="13"><path d="m9 5.5 6.5 6.5L9 18.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>`).join('');

    storeRow.querySelectorAll('[data-toast]').forEach((el) => {
      el.addEventListener('click', () => showToast(el.dataset.toast));
    });
  }

  function init() {
    document.getElementById('pPrev').addEventListener('click', () => render(aiState.index - 1, true));
    document.getElementById('pNext').addEventListener('click', () => render(aiState.index + 1, true));
  }

  return { init, render, current };
})();

/* ============================================================
   模块 3：加入衣柜（名称 + 分类标签，同步胶囊衣柜）
   ============================================================ */
const AddCloset = (() => {
  const CATS = ['上装', '下装', '鞋包'];

  function open() {
    const p = ProductCarousel.current();
    Sheet.open({
      title: '加入衣柜',
      content: `
        <div class="add-closet-form">
          <div class="ac-preview"><img src="${p.img}" alt="${p.title}"></div>
          <div class="sheet-field">
            <label for="acName">衣服名称</label>
            <input id="acName" type="text" maxlength="12" value="${p.title}" placeholder="输入衣服名称">
          </div>
          <div class="sheet-field">
            <label>分类标签</label>
            <div class="cat-picker" id="acCats">
              ${CATS.map((c, i) => `<button class="${i === 0 ? 'is-active' : ''}" data-cat="${c}">${c}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="sheet-actions">
          <button class="sheet-btn ghost" data-cancel>取消</button>
          <button class="sheet-btn primary" data-save>保存到衣柜</button>
        </div>`,
      onMount(root) {
        let cat = CATS[0];
        const picker = root.querySelector('#acCats');
        picker.addEventListener('click', (e) => {
          const btn = e.target.closest('button');
          if (!btn) return;
          picker.querySelector('.is-active').classList.remove('is-active');
          btn.classList.add('is-active');
          cat = btn.dataset.cat;
        });

        root.querySelector('[data-cancel]').addEventListener('click', () => Sheet.close());
        root.querySelector('[data-save]').addEventListener('click', async () => {
          const name = root.querySelector('#acName').value.trim();
          if (!name) {
            showToast('请填写衣服名称');
            return;
          }
          try {
            await API.addCapsuleItem({ name, img: p.img, cat });
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
    document.getElementById('btnAddCloset').addEventListener('click', open);
  }

  return { init };
})();

/* ============================================================
   模块 4：对话流（发送提问）
   ============================================================ */
const ChatFlow = (() => {
  const msgs = document.getElementById('ai2Msgs');
  const input = document.getElementById('ask2Input');

  function addUserMsg(text, avatar) {
    const row = document.createElement('div');
    row.className = 'msg-row row-user msg-anim';
    const bubble = document.createElement('div');
    bubble.className = 'bubble-user2';
    bubble.textContent = text;
    const img = document.createElement('img');
    img.className = 'msg-av';
    img.src = avatar;
    img.alt = '';
    row.append(bubble, img);
    msgs.appendChild(row);
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function addAiMsg(text, avatar) {
    const row = document.createElement('div');
    row.className = 'msg-row row-ai msg-anim';
    const img = document.createElement('img');
    img.className = 'msg-av';
    img.src = avatar;
    img.alt = '';
    const card = document.createElement('div');
    card.className = 'ai-reply';
    const p = document.createElement('p');
    p.className = 'reply-text';
    p.textContent = text;
    card.appendChild(p);
    row.append(img, card);
    msgs.appendChild(row);
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMsg(text, aiState.data.body.avatar);
    try {
      const res = await API.askAssistant(text);
      addAiMsg(res.reply, aiState.data.body.aiAvatar);
    } catch (_) {
      showToast('发送失败，请稍后再试');
    }
  }

  function init() {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        send();
      }
    });
    document.getElementById('ask2Mic').addEventListener('click', () => showToast('语音输入为演示功能'));
  }

  return { init };
})();

/* ============================================================
   启动
   ============================================================ */
(async function boot() {
  try {
    const data = await API.getAssistantHome();
    aiState.data = data;

    /* 各区块独立容错：某一块失败不影响其它部分渲染 */
    const step = (name, fn) => {
      try {
        fn();
      } catch (err) {
        console.warn('[ai] ' + name + ' 失败', err);
      }
    };

    step('身材卡', () => { BodyPanel.render(data.body); BodyPanel.init(); });

    step('对话文案', () => {
      const userBubble = document.querySelector('.bubble-user2');
      if (userBubble) userBubble.textContent = data.userMessage;
      const replyText = document.querySelector('.reply-text');
      if (replyText) replyText.textContent = data.replyText;
    });

    step('尺码条', () => {
      const strip = data.sizeStrip;
      const ssValues = document.querySelectorAll('.ss-value');
      if (ssValues[0]) ssValues[0].innerHTML = `<b>${strip.size}</b> 码`;
      const ssSub = document.querySelector('.ss-sub');
      if (ssSub) ssSub.textContent = strip.sizeNote;
      if (ssValues[1]) ssValues[1].innerHTML = `<b>${strip.fit}</b>`;
      const ssBadge = document.querySelector('.ss-badge');
      if (ssBadge) ssBadge.textContent = strip.fitTag;
      const reasonsEl = document.querySelector('.ss-reasons');
      if (reasonsEl) reasonsEl.innerHTML = strip.reasons.map((r) => `<li>${r}</li>`).join('');
    });

    step('商品轮播', () => { ProductCarousel.init(); ProductCarousel.render(0, false); });
    step('加入衣柜', () => AddCloset.init());
    step('对话输入', () => ChatFlow.init());

    step('通用提示', () => {
      document.querySelectorAll('[data-toast]').forEach((el) => {
        el.addEventListener('click', () => showToast(el.dataset.toast));
      });
    });
  } catch (err) {
    console.error(err);
    showToast('数据加载失败，请刷新重试');
  }
})();
