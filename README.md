# 衣境 · 智能穿搭

面向移动端的智能穿搭助手，包含社区、AI 助手、衣柜、个人中心与设置五大模块。

## 功能

- **社区**：双列瀑布流穿搭分享，按身材类型与场景筛选，支持点赞、搜索
- **AI 助手**：身材数据管理、夹克推荐轮播（商品详情与店铺随图联动）、对话提问、一键加入衣柜
- **衣柜**：穿搭资产仪表盘（色系 DNA、搭配重复率、缺口分析、智能衣柜）、穿搭图谱（可拖拽的力导向图）、胶囊衣柜（季节筛选、上传衣服、编辑胶囊）
- **个人中心**：SVIP 会员、穿搭资产统计、快捷入口、资产管理、订单、更多服务
- **设置**：昵称、签名、手机号编辑，清除缓存等

## 技术方案

- 原生 HTML / CSS / JavaScript，无构建步骤，直接部署即可运行
- **单页应用**：`index.html` 为唯一入口，页面片段按需加载并常驻内存，切换无白屏；支持浏览器前进后退与 hash 深链（`#/wardrobe?view=graph`）
- **数据层收敛**：所有业务数据集中在 `js/api/client.js`，以 Promise 接口暴露。接入真实后端时只需替换该文件的实现，页面代码无需改动
- **公共组件**：力导向图（`js/force-graph.js`）、底部弹层（`js/ui-sheet.js`）
- 字体与布局锁定：固定 px 字号 + `text-size-adjust` 锁定，输入框统一 16px，规避 iOS 聚焦放大与系统大字体导致的走形

## 本地运行

```bash
cd frontend
python -m http.server 8788
```

打开 http://127.0.0.1:8788

> 必须通过 HTTP 访问，直接双击打开 HTML 会因浏览器跨域策略无法加载页面片段。

## 目录结构

```
frontend/
├── index.html          单页应用入口
├── community.html      社区（独立入口 / 片段源）
├── ai.html             AI 助手
├── wardrobe.html       衣柜
├── profile.html        个人中心
├── settings.html       设置
├── css/                样式（按模块拆分）
├── js/
│   ├── router.js       路由与页面装载
│   ├── api/client.js   数据访问层（Mock）
│   ├── force-graph.js  力导向图组件
│   ├── ui-sheet.js     底部弹层组件
│   └── main.js / ai.js / wardrobe.js / profile.js / settings.js
└── images/             图片素材
```

## 部署

GitHub Pages：仓库 Settings → Pages → Source 选择 `main` 分支根目录即可。已包含 `.nojekyll`，无需额外配置。
