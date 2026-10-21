/* ============================================================
   API Client · 统一数据访问层（Mock）
   ------------------------------------------------------------
   所有页面数据必须经由本文件获取，页面组件禁止硬编码业务数据。
   后续接入真实后端时，仅需替换本文件内各方法的实现
   （保持函数签名与返回结构不变），页面代码无需改动。
   ============================================================ */
'use strict';

window.API = (() => {
  /* ==========================================================
     数据区（Mock DB）
     ========================================================== */
  const DB = {
    /* ---------- 社区 ---------- */
    community: {
      shapes: ['全部', '梨型', '苹果型', '沙漏型'],
      scenes: ['全部场景', '日常', '通勤', '约会', '正式', '旅行', '运动'],
      cards: [
        { id: 1, img: 'images/card-1.jpg', w: 395, h: 304, shape: '梨型', scene: '日常',
          title: '梨型姐妹看过来！这条阔腿裤真的显腿吗？求真实上身反馈！',
          user: '小熊不吃草', avatar: 'images/avatar-1.jpg', likes: 1286 },
        { id: 2, img: 'images/card-2.jpg', w: 395, h: 303, shape: '沙漏型', scene: '约会',
          title: '这条裙子对沙漏型身材友好吗？求真实上身反馈！',
          user: '夏天的风', avatar: 'images/avatar-2.jpg', likes: 982 },
        { id: 3, img: 'images/card-3.jpg', w: 395, h: 282, shape: '苹果型', scene: '通勤',
          title: '你觉得梨型，西装外套怎么选？求建议！',
          user: '可乐加冰', avatar: 'images/avatar-3.jpg', likes: 756 },
        { id: 4, img: 'images/card-4.jpg', w: 395, h: 281, shape: '梨型', scene: '旅行',
          title: '海边度假穿什么？梨型身材求推荐！',
          user: '椰子味的风', avatar: 'images/avatar-4.jpg', likes: 643 },
        { id: 5, img: 'images/card-5.jpg', w: 395, h: 227, shape: '沙漏型', scene: '运动',
          title: '健身房穿搭分享｜修身显身材的运动套装推荐！',
          user: '进击的小楠', avatar: 'images/avatar-5.jpg', likes: 512 },
        { id: 6, img: 'images/card-6.jpg', w: 395, h: 227, shape: '苹果型', scene: '正式',
          title: '职场穿搭｜微胖女生也能穿出高级感的西装搭配！',
          user: '晚风与猫', avatar: 'images/avatar-6.jpg', likes: 798 },
      ],
    },

    /* ---------- AI 助手 ---------- */
    assistant: {
      userMessage: '我想穿宽松一些的夹克',
      replyText: '根据你的身材数据，为你推荐以下宽松版型的夹克。',
      body: {
        silhouette: 'images/body-silhouette.png',
        avatar: 'images/user-avatar.jpg',
        aiAvatar: 'images/ai-avatar-2.jpg',
        metrics: [
          { label: '身高', value: '165', unit: 'cm' },
          { label: '体重', value: '52', unit: 'kg' },
          { label: '肩宽', value: '38', unit: 'cm' },
          { label: '胸围', value: '86', unit: 'cm' },
          { label: '腰围', value: '68', unit: 'cm' },
          { label: '袖长', value: '56', unit: 'cm' },
        ],
      },
      sizeStrip: {
        size: 'M',
        sizeNote: '（宽松版型）',
        fit: '92%',
        fitTag: '非常合适',
        reasons: ['肩部线条流畅，不会紧绷', '下摆宽松修饰臂胯比例', '适合日常/通勤/出游等多种场景'],
      },
      /* 每个商品对应轮播中的一张图，切换时详情与店铺同步变化 */
      products: [
        {
          img: 'images/jack-1.jpg',
          title: '黑色短款夹克',
          chips: ['休闲', '春秋', '短款', '百搭'],
          size: 'M',
          sizeTable: [['衣长', '58 cm'], ['胸围', '108 cm'], ['肩宽', '46 cm'], ['袖长', '57 cm']],
          match: 88,
          reason: '黑色短款提高腰线，对小个子友好。面料挺括不塌，内搭白 T 或针织都利落，搭配高腰牛仔裤能拉长腿部比例，适合日常通勤和周末出行。',
          stores: [
            { name: '拾光的小店', sub: '时尚 · 品质 · 生活', icon: 'bag' },
            { name: '南风衣橱', sub: '简约 · 气质 · 轻奢', icon: 'hanger' },
            { name: '初见小裳', sub: '潮流 · 个性 · 设计', icon: 'store' },
          ],
        },
        {
          img: 'images/jack-2.jpg',
          title: '复古红棕皮夹克',
          chips: ['复古', '秋冬', '宽松', '街头'],
          size: 'L',
          sizeTable: [['衣长', '64 cm'], ['胸围', '116 cm'], ['肩宽', '50 cm'], ['袖长', '58 cm']],
          match: 90,
          reason: '红棕色皮质带哑光质感，落肩版型修饰肩线，内搭高领毛衣不紧绷。配阔腿裤和墨镜就是复古港风，适合咖啡馆约会和街拍。',
          stores: [
            { name: '旧巷皮具', sub: '复古 · 手工 · 质感', icon: 'store' },
            { name: '南风衣橱', sub: '简约 · 气质 · 轻奢', icon: 'hanger' },
            { name: '暮色商店', sub: '港风 · 复古 · 小众', icon: 'bag' },
          ],
        },
        {
          img: 'images/jack-3.jpg',
          title: '军绿工装夹克',
          chips: ['工装', '秋冬', '宽松', '中性'],
          size: 'M',
          sizeTable: [['衣长', '68 cm'], ['胸围', '118 cm'], ['肩宽', '48 cm'], ['袖长', '59 cm']],
          match: 85,
          reason: '军绿色低饱和不挑肤色，四个工装口袋增加结构感，下摆抽绳可调节松紧。配黑色直筒裤干净利落，适合上课、通勤和轻户外场景。',
          stores: [
            { name: '山野工装', sub: '户外 · 工装 · 耐穿', icon: 'store' },
            { name: '拾光的小店', sub: '时尚 · 品质 · 生活', icon: 'bag' },
            { name: '初见小裳', sub: '潮流 · 个性 · 设计', icon: 'hanger' },
          ],
        },
        {
          img: 'images/jack-4.jpg',
          title: '米白毛领夹克',
          chips: ['甜美', '秋冬', '宽松', '保暖'],
          size: 'M',
          sizeTable: [['衣长', '62 cm'], ['胸围', '112 cm'], ['肩宽', '47 cm'], ['袖长', '58 cm']],
          match: 92,
          reason: '毛领提升柔和感，米白色比纯白更衬肤色，宽松版型内搭厚毛衣也不显臃肿。秋冬配牛仔裤和短靴，整体干净温暖。',
          stores: [
            { name: '初见小裳', sub: '潮流 · 个性 · 设计', icon: 'hanger' },
            { name: '奶白工作室', sub: '甜美 · 温柔 · 日常', icon: 'bag' },
            { name: '南风衣橱', sub: '简约 · 气质 · 轻奢', icon: 'store' },
          ],
        },
        {
          img: 'images/jack-5.jpg',
          title: '撞色亮面夹克',
          chips: ['潮流', '春秋', '街头', '夜拍'],
          size: 'M',
          sizeTable: [['衣长', '66 cm'], ['胸围', '114 cm'], ['肩宽', '49 cm'], ['袖长', '58 cm']],
          match: 87,
          reason: '亮面材质在夜景灯光下很出片，蓝绿撞色有记忆点。宽松落肩不挑身材，配黑色短裙和马丁靴，适合街拍和音乐节。',
          stores: [
            { name: '霓虹俱乐部', sub: '潮流 · 街头 · 夜拍', icon: 'bag' },
            { name: '初见小裳', sub: '潮流 · 个性 · 设计', icon: 'hanger' },
            { name: '拾光的小店', sub: '时尚 · 品质 · 生活', icon: 'store' },
          ],
        },
      ],
    },

    /* ---------- 衣柜 ---------- */
    wardrobe: {
      /* 我的衣柜（仪表盘） */
      dashboard: {
        stats: [
          { label: '衣物总数', value: 86 },
          { label: '本季可穿', value: 72 },
          { label: '待整理', value: 14 },
        ],
        dna: {
          colors: [
            { name: '黑', pct: '28%', hex: '#2F3438' },
            { name: '白', pct: '22%', hex: '#EEEEEE' },
            { name: '灰', pct: '15%', hex: '#C2C5CB' },
            { name: '蓝', pct: '12%', hex: '#8FA6C0' },
            { name: '其他', pct: '23%', hex: '#F0D8D8' },
          ],
          styles: [
            { name: '简约', pct: '32%' }, { name: '休闲', pct: '26%' }, { name: '甜美', pct: '18%' },
            { name: '通勤', pct: '12%' }, { name: '复古', pct: '8%' }, { name: '其他', pct: '4%' },
          ],
        },
        repeatRate: '32%',
        gap: { text: '正式场合的外套', img: 'images/wd-gap.jpg' },
        cats: ['全部', '上衣', '下装', '裙装', '外套', '鞋包'],
        items: [
          { img: 'images/wd-shirt.jpg', name: '白色衬衫', tags: ['通勤', '简约', '春秋'], cat: '上衣' },
          { img: 'images/wd-blazer.jpg', name: '黑色西装外套', tags: ['通勤', '简约', '春秋'], cat: '外套' },
          { img: 'images/wd-jeans.jpg', name: '牛仔裤', tags: ['休闲', '复古', '四季'], cat: '下装' },
          { img: 'images/wd-dress.jpg', name: '连衣裙', tags: ['约会', '甜美', '夏季'], cat: '裙装' },
          { img: 'images/wd-knit.jpg', name: '针织衫', tags: ['日常', '简约', '春秋'], cat: '上衣' },
          { img: 'images/wd-sneakers.jpg', name: '运动鞋', tags: ['休闲', '运动', '四季'], cat: '鞋包' },
        ],
      },

      /* 穿搭图谱 */
      graph: {
        stats: [
          { label: '穿搭总数', value: 72 },
          { label: '常用单品', value: 18 },
          { label: '风格标签', value: 5 },
        ],
        center: { img: 'images/wg-center.jpg', name: '小雁不吃薯' },
        nodes: [
          { name: '通勤', desc: '干练·简约', img: 'images/wg-commute.jpg', color: '#F5B93C' },
          { name: '休闲', desc: '舒适·随性', img: 'images/wg-casual.jpg',  color: '#4A90D9' },
          { name: '约会', desc: '浪漫·优雅', img: 'images/wg-date.jpg',    color: '#E85D8A' },
          { name: '学院', desc: '青春·减龄', img: 'images/wg-school.jpg',  color: '#4CAF7D' },
          { name: '运动', desc: '活力·健康', img: 'images/wg-sport.jpg',   color: '#9B6BD9' },
        ],
        combos: [
          { img: 'images/wg-combo-1.jpg', name: '西装外套 + 白衬衫' },
          { img: 'images/wg-combo-2.jpg', name: '牛仔裤 + 运动鞋' },
          { img: 'images/wg-combo-3.jpg', name: '针织衫 + 半身裙' },
        ],
        /* 「查看全部搭配」弹层数据 */
        allCombos: [
          { img: 'images/wg-combo-1.jpg', name: '西装外套 + 白衬衫', scene: '通勤', freq: 12 },
          { img: 'images/wg-combo-2.jpg', name: '牛仔裤 + 运动鞋', scene: '休闲', freq: 10 },
          { img: 'images/wg-combo-3.jpg', name: '针织衫 + 半身裙', scene: '约会', freq: 8 },
          { img: 'images/wg-combo-1.jpg', name: '西装外套 + 针织衫', scene: '通勤', freq: 6 },
          { img: 'images/wg-combo-2.jpg', name: '白衬衫 + 半身裙', scene: '学院', freq: 5 },
          { img: 'images/wg-combo-3.jpg', name: '针织衫 + 牛仔裤', scene: '休闲', freq: 4 },
        ],
      },

      /* 胶囊衣柜 */
      capsule: {
        seasons: ['春夏', '秋冬', '四季通用'],
        seasonStats: {
          '春夏':     { core: 12, looks: 24, week: 7 },
          '秋冬':     { core: 9,  looks: 18, week: 5 },
          '四季通用': { core: 6,  looks: 12, week: 4 },
        },
        categories: [
          {
            key: '上装', cols: 4,
            items: [
              { id: 't1', name: '白衬衫', img: 'images/wg-top-1.jpg', season: ['春夏', '秋冬', '四季通用'] },
              { id: 't2', name: '黑色西装外套', img: 'images/wg-top-2.jpg', season: ['春夏', '秋冬'] },
              { id: 't3', name: '浅粉针织衫', img: 'images/wg-top-3.jpg', season: ['春夏', '秋冬'] },
              { id: 't4', name: '基础T恤', img: 'images/wg-top-4.jpg', season: ['春夏'] },
            ],
          },
          {
            key: '下装', cols: 3,
            items: [
              { id: 'b1', name: '蓝色牛仔裤', img: 'images/wg-bottom-1.jpg', season: ['春夏', '秋冬', '四季通用'] },
              { id: 'b2', name: '黑色半身裙', img: 'images/wg-bottom-2.jpg', season: ['春夏', '秋冬', '四季通用'] },
              { id: 'b3', name: '米色长裤', img: 'images/wg-bottom-3.jpg', season: ['春夏', '四季通用'] },
            ],
          },
          {
            key: '鞋包', cols: 3,
            items: [
              { id: 's1', name: '白色运动鞋', img: 'images/wg-shoes-1.jpg', season: ['春夏', '秋冬', '四季通用'] },
              { id: 's2', name: '黑色手提包', img: 'images/wg-shoes-2.jpg', season: ['春夏', '秋冬', '四季通用'] },
              { id: 's3', name: '简洁单鞋', img: 'images/wg-shoes-3.jpg', season: ['春夏'] },
            ],
          },
        ],
      },
    },

    /* ---------- 个人中心（穿搭资产） ---------- */
    profileCenter: {
      user: {
        name: '小雁不吃薯',
        bio: '热爱穿搭 · 追求品质生活',
        level: 'SVIP',
        avatar: 'images/pc-avatar.jpg',
      },
      svip: {
        title: 'SVIP 会员',
        desc: '专属穿搭资产权益 · 解锁更多高级功能',
        action: '立即续费',
      },
      assetStats: [
        { icon: 'shirt',  label: '服装单品', value: 86 },
        { icon: 'layers', label: '搭配方案', value: 18 },
        { icon: 'tag',    label: '风格标签', value: 5 },
        { icon: 'closet', label: '虚拟衣橱', value: 12 },
      ],
      shortcuts: [
        { icon: 'hanger',  name: '穿搭顾问', desc: '查看和管理单品',      route: 'ai.html' },
        { icon: 'compass', name: '穿搭图谱', desc: '搜索风格与搭配',      route: 'wardrobe.html?view=graph' },
        { icon: 'closet',  name: '胶囊衣柜', desc: '高效搭配 · 精简衣橱', route: 'wardrobe.html?view=capsule' },
        { icon: 'diamond', name: '穿搭资产', desc: '我的数字藏品',        route: 'wardrobe.html?view=dash' },
      ],
      manage: {
        total: '¥28,560', totalUp: '12.5%',
        count: 86, countUp: '8.7%',
        newCount: 12, newUp: '20.0%',
      },
      orders: [
        { icon: 'wallet', label: '待付款', badge: 2 },
        { icon: 'box',    label: '待发货', badge: 1 },
        { icon: 'truck',  label: '待收货', badge: 0 },
        { icon: 'check',  label: '已完成', badge: 0 },
      ],
      services: [
        { icon: 'ruler', label: '我的尺码' },
        { icon: 'heart', label: '穿搭偏好' },
        { icon: 'robot', label: 'AI助手', route: 'ai.html' },
        { icon: 'chat',  label: '意见反馈' },
        { icon: 'help',  label: '帮助中心' },
      ],
    },

    /* ---------- 我的 ---------- */
    profile: {
      user: {
        name: '小雁不吃薯',
        level: 'Lv.3',
        tags: ['大学生', '恐惧活命', '喜欢买菜'],
        avatar: 'images/profile-avatar.jpg',
        bg: 'images/header-bg.jpg',
        bio: '喜欢干净利落的穿搭，正在攒一件正式场合的外套。',
      },
      nodes: [
        { name: '学校', desc: '幸运取向·热情', img: 'images/node-school.jpg', color: '#F5B93C' },
        { name: '旅游', desc: '度假向·轻松',   img: 'images/node-travel.jpg', color: '#4A90D9' },
        { name: '霸游', desc: '职场向·干练',   img: 'images/node-bayou.jpg',  color: '#E85D8A' },
        { name: '爱洒', desc: '舞向·个性',     img: 'images/node-aisa.jpg',   color: '#9B6BD9' },
        { name: '社交', desc: '趣味向·时尚',   img: 'images/node-social.jpg', color: '#4CAF7D' },
        { name: '自拍', desc: '休闲向·舒适',   img: 'images/node-selfie.jpg', color: '#F08A3C' },
      ],
      keywords: ['清新', '简约', '甜美', '学院', '复古'],
      records: [
        { img: 'images/record-1.jpg', name: '学院·学院风', date: '4月12日' },
        { img: 'images/record-2.jpg', name: '和服套·休闲', date: '4月10日' },
        { img: 'images/record-3.jpg', name: '清新·干练', date: '4月8日' },
      ],
      allRecords: [
        { img: 'images/record-1.jpg', name: '学院·学院风', date: '4月12日' },
        { img: 'images/record-2.jpg', name: '和服套·休闲', date: '4月10日' },
        { img: 'images/record-3.jpg', name: '清新·干练', date: '4月8日' },
        { img: 'images/record-2.jpg', name: '约会·温柔', date: '4月5日' },
        { img: 'images/record-1.jpg', name: '学院·减龄', date: '4月2日' },
        { img: 'images/record-3.jpg', name: '通勤·利落', date: '3月29日' },
        { img: 'images/record-3.jpg', name: '正式·干练', date: '3月26日' },
        { img: 'images/record-1.jpg', name: '日常·清新', date: '3月22日' },
        { img: 'images/record-2.jpg', name: '出游·舒适', date: '3月18日' },
      ],
    },
  };

  /* ==========================================================
     工具
     ========================================================== */
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const respond = (data, ms = 0) =>
    new Promise((resolve) => setTimeout(() => resolve(clone(data)), ms));

  /* 本会话内的可变状态（模拟后端持久化） */
  const state = {
    userName: DB.profile.user.name,
    userBio: DB.profile.user.bio,
    phone: '138****8842',
    capsuleRemoved: new Set(),
    customItems: [],                                   // 用户上传的衣物
    bodyMetrics: DB.assistant.body.metrics.map((m) => ({ ...m })),
  };

  /* ==========================================================
     接口
     ========================================================== */
  return {
    /* 社区 */
    getCommunityFeed() {
      return respond(DB.community);
    },

    /* AI 助手 */
    getAssistantHome() {
      const data = clone(DB.assistant);
      data.body.metrics = clone(state.bodyMetrics);
      return respond(data);
    },
    /* 编辑身材数据 */
    updateBodyMetrics(metrics) {
      state.bodyMetrics = state.bodyMetrics.map((m) => {
        const next = metrics.find((x) => x.label === m.label);
        return next ? { ...m, value: String(next.value) } : m;
      });
      return respond({ ok: true, metrics: clone(state.bodyMetrics) }, 120);
    },
    /* 发送提问（模拟回复） */
    askAssistant(text) {
      return respond({
        reply: `收到！我正在结合你的身材数据和衣橱库存整理「${text}」的搭配建议，稍等片刻～`,
      }, 500);
    },

    /* 衣柜 */
    getWardrobe() {
      const data = clone(DB.wardrobe);
      /* 叠加本会话内的胶囊编辑结果 */
      data.capsule.categories.forEach((cat) => {
        cat.items = cat.items.filter((it) => !state.capsuleRemoved.has(it.id));
      });
      /* 合并用户上传的衣物（四季可见） */
      state.customItems.forEach((it) => {
        const target = data.capsule.categories.find((c) => c.key === it.cat);
        if (target) {
          target.items.push({
            id: it.id, name: it.name, img: it.img,
            season: ['春夏', '秋冬', '四季通用'],
          });
        }
      });
      return respond(data);
    },
    removeCapsuleItem(itemId) {
      state.capsuleRemoved.add(itemId);
      return respond({ ok: true }, 60);
    },
    resetCapsule() {
      state.capsuleRemoved.clear();
      return respond({ ok: true }, 60);
    },
    /* 上传衣物并加入胶囊衣柜 */
    addCapsuleItem({ name, img, cat }) {
      const item = { id: 'c' + Date.now(), name, img, cat };
      state.customItems.push(item);
      return respond({ ok: true, item }, 150);
    },

    /* 我的 */
    getProfile() {
      const data = clone(DB.profile);
      data.user.name = state.userName;
      data.user.bio = state.userBio;
      return respond(data);
    },
    saveUserName(name) {
      state.userName = name;
      return respond({ ok: true, name }, 120);
    },
    /* 个人中心 */
    getProfileCenter() {
      const data = clone(DB.profileCenter);
      data.user.name = state.userName;
      return respond(data);
    },

    /* 设置页 */
    getSettings() {
      return respond({
        user: {
          name: state.userName,
          bio: state.userBio,
          level: DB.profile.user.level,
          tags: DB.profile.user.tags,
          avatar: DB.profile.user.avatar,
        },
        account: {
          phone: state.phone,
          wechat: '已绑定',
          cacheSize: '2.4 MB',
          registeredAt: '2025年9月',
        },
      });
    },
    saveUserProfile({ name, bio }) {
      if (name) state.userName = name;
      if (typeof bio === 'string') state.userBio = bio;
      return respond({ ok: true, name: state.userName, bio: state.userBio }, 120);
    },
    savePhone(phone) {
      state.phone = phone;
      return respond({ ok: true, phone }, 120);
    },
  };
})();
