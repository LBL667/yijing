/* ============================================================
   设置 · 页面交互
   数据来自 API 层（js/api/client.js）
   模块：SettingsPage（账号资料编辑 / 通用项）
   ============================================================ */
'use strict';

const stState = { data: null };

const SettingsPage = (() => {
  /* ---------- 渲染 ---------- */
  function render() {
    const { user, account } = stState.data;
    document.getElementById('stAvatar').src = user.avatar;
    document.getElementById('stName').textContent = user.name;
    document.getElementById('stMeta').textContent = `${user.level} · ${user.tags[0] || ''}`;
    document.getElementById('rowNameVal').textContent = user.name;
    document.getElementById('rowBioVal').textContent = user.bio || '未填写';
    document.getElementById('rowPhoneVal').textContent = account.phone;
    document.getElementById('rowWechat').textContent = account.wechat;
    document.getElementById('rowCacheVal').textContent = account.cacheSize;
  }

  /* ---------- 通用输入弹层 ---------- */
  function openField({ title, label, value, placeholder, maxlength, validate, onSave }) {
    Sheet.open({
      title,
      content: `
        <div class="sheet-field">
          <label for="stField">${label}</label>
          <input id="stField" type="text" maxlength="${maxlength || 20}"
                 value="${value || ''}" placeholder="${placeholder || ''}">
        </div>
        <div class="sheet-actions">
          <button class="sheet-btn ghost" data-cancel>取消</button>
          <button class="sheet-btn primary" data-save>保存</button>
        </div>`,
      onMount(root) {
        const input = root.querySelector('#stField');
        root.querySelector('[data-cancel]').addEventListener('click', () => Sheet.close());
        root.querySelector('[data-save]').addEventListener('click', async () => {
          const val = input.value.trim();
          const err = validate ? validate(val) : (!val ? '内容不能为空' : '');
          if (err) {
            showToast(err);
            return;
          }
          try {
            await onSave(val);
            Sheet.close();
          } catch (_) {
            showToast('保存失败，请稍后再试');
          }
        });
        input.focus();
        input.select();
      },
    });
  }

  /* ---------- 事件绑定 ---------- */
  function bind() {
    document.getElementById('btnBack').addEventListener('click', () => {
      if (history.length > 1) history.back();
      else location.href = 'profile.html';
    });

    /* 昵称 */
    document.getElementById('rowName').addEventListener('click', () => {
      openField({
        title: '修改昵称',
        label: '昵称',
        value: stState.data.user.name,
        placeholder: '输入新昵称',
        maxlength: 12,
        onSave: async (name) => {
          const res = await API.saveUserProfile({ name });
          stState.data.user.name = res.name;
          render();
          showToast('昵称已更新');
        },
      });
    });

    /* 个性签名 */
    document.getElementById('rowBio').addEventListener('click', () => {
      openField({
        title: '个性签名',
        label: '一句话介绍自己',
        value: stState.data.user.bio,
        placeholder: '写点什么吧',
        maxlength: 30,
        validate: (v) => (v.length > 30 ? '签名最多 30 个字' : ''),
        onSave: async (bio) => {
          const res = await API.saveUserProfile({ bio });
          stState.data.user.bio = res.bio;
          render();
          showToast('签名已更新');
        },
      });
    });

    /* 手机号 */
    document.getElementById('rowPhone').addEventListener('click', () => {
      openField({
        title: '修改手机号',
        label: '手机号',
        value: '',
        placeholder: '输入 11 位手机号',
        maxlength: 11,
        validate: (v) => (/^1\d{10}$/.test(v) ? '' : '请输入正确的 11 位手机号'),
        onSave: async (phone) => {
          const masked = phone.slice(0, 3) + '****' + phone.slice(7);
          const res = await API.savePhone(masked);
          stState.data.account.phone = res.phone;
          render();
          showToast('手机号已更新');
        },
      });
    });

    /* 清除缓存 */
    document.getElementById('rowCache').addEventListener('click', () => {
      showToast('缓存已清除');
      document.getElementById('rowCacheVal').textContent = '0 MB';
    });

    /* 关于我们 */
    document.getElementById('rowAbout').addEventListener('click', () => {
      showToast('型格智能 · 让穿搭变简单');
    });

    /* 退出登录 */
    document.getElementById('btnLogout').addEventListener('click', () => {
      showToast('退出登录为演示功能');
    });
  }

  function init() {
    bind();
    render();
  }

  return { init };
})();

/* ============================================================
   启动
   ============================================================ */
(async function boot() {
  try {
    const data = await API.getSettings();
    stState.data = data;
    SettingsPage.init();
  } catch (err) {
    console.error(err);
    showToast('数据加载失败，请刷新重试');
  }
})();
