# KirinTeaAki - 个人网站

基于原生 HTML5 + Tailwind CSS + JavaScript 的个人网站，用于展示一些信息、想法、博客和项目。

[![访问在线站点](https://img.shields.io/badge/Visit-Live%20Site-0f766e?style=for-the-badge&logo=cloudflare&logoColor=white)](https://kirintea.github.io/)
[![查看 GitHub 仓库](https://img.shields.io/badge/GitHub-Repository-111827?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kirintea/kirintea_github_io)

## 主站点

主要访问入口为 **kirintea.github.io**（GitHub Pages）。

## 特性 🚀

一个现代化的个人网站技术栈，致力于展示个人技能、项目和博客内容：

- 基于原生 HTML5 + CSS3 + JavaScript (ES6+) 的前端实现
- 响应式设计，适配不同屏幕尺寸
- 动态组件加载，异步加载 HTML 组件
- 丰富的动画效果：滚动动画、页面过渡效果
- 3D 视觉效果：使用 Three.js 实现的 3D 元素
- 博客系统：支持中英文双语博客
- 粒子效果：交互式粒子背景
- 导航系统：平滑滚动和导航菜单
- 链接页面：展示友情链接和项目链接

## 系统架构 🧱

### 内容管道

- 源码：`components/` 目录下的模块化组件
- 数据：`data/` 目录下的 JSON 数据文件
- 博客文章：`data/blog/posts/` 目录下的 Markdown 文件
- 渲染：通过 JavaScript 动态加载组件和数据

### UI 组合

- 全局外壳：导航栏 + 内容区域 + 页脚
- 组件化设计：模块化的 HTML 组件
- 响应式布局：适配桌面端和移动端
- 动画效果：AOS 和 GSAP 实现的平滑动画

### 技术栈

- **前端框架**: 原生 HTML5, CSS3, JavaScript (ES6+)
- **CSS 框架**: Tailwind CSS
- **动画库**: AOS (Animate On Scroll), GSAP
- **3D 库**: Three.js
- **图标库**: Font Awesome 7
- **图表库**: Chart.js
- **Markdown 解析**: Marked

## 项目结构 📁

```text
.
├─ assets/             # 静态资源
│  ├─ home/           # 首页资源
│  │  ├─ icons/       # 图标资源
│  │  └─ images/      # 首页图片
│  ├─ images/         # 通用图片资源
│  ├─ links/          # 链接页面资源
│  └─ navbar/         # 导航栏资源
├─ components/         # 模块化组件
│  ├─ blog/           # 博客相关组件
│  ├─ home/           # 首页组件
│  ├─ links/          # 链接页面组件
│  └─ navbar/         # 导航栏组件
├─ css/                # 样式文件
│  ├─ blog/           # 博客样式
│  ├─ home/           # 首页样式
│  ├─ links/          # 链接页面样式
│  └─ navbar/         # 导航栏样式
├─ data/               # 数据文件
│  ├─ blog/           # 博客数据
│  │  └─ posts/       # 博客文章
│  └─ links/          # 链接数据
├─ js/                 # JavaScript 文件
│  ├─ blog/           # 博客脚本
│  ├─ home/           # 首页脚本
│  ├─ links/          # 链接页面脚本
│  └─ navbar/         # 导航栏脚本
├─ tests/              # 测试文件
├─ vendor/             # 第三方库
├─ .gitignore          # Git 忽略文件
├─ index.html          # 主页面
└─ README.md           # 项目说明
```

## 核心模块

### 首页模块
- **个人信息展示**: 个人简介和角色展示
- **技能展示**: 专业技能和技术栈
- **博客预览**: 最新博客文章预览
- **项目展示**: 个人项目展示

### 博客模块
- **文章列表**: 博客文章索引
- **文章详情**: 支持 Markdown 格式的文章内容
- **多语言支持**: 中英文双语文章

### 链接模块
- **友情链接**: 展示朋友和合作伙伴的网站
- **项目链接**: 展示相关项目和资源

## 工程决策 🛠️

### 1) 模块化设计

采用组件化开发，将页面拆分为多个独立的 HTML 组件，便于维护和扩展。通过 JavaScript 动态加载组件，提高页面加载速度和代码可维护性。

### 2) 性能优化

- 懒加载组件和资源，提高页面加载速度
- 优化图片资源，减少页面加载时间
- 使用现代 JavaScript 特性，提高代码执行效率

### 3) 用户体验

- 流畅的动画效果和交互体验
- 响应式设计，适配不同屏幕尺寸
- 符合 Web 可访问性标准

## 部署 🌐

### 推荐环境：GitHub Pages

- 主域名：`https://kirintea.github.io/`
- 这是推荐的公共访问入口，提供最新的功能和性能表现。

### 发布前检查清单

- 验证所有页面是否正常加载
- 检查响应式设计是否在不同设备上正常显示
- 测试动画效果和交互功能
- 检查网络请求是否有 404 错误

## 开发 💻

### 运行调试

1. 克隆项目到本地环境
2. 使用本地服务器打开 `index.html` 文件
   - 可以使用 `python -m http.server` 启动简单的 HTTP 服务器
   - 或者使用 VS Code 的 Live Server 插件

### 添加新博客文章

1. 在 `data/blog/posts/` 目录下创建新的文件夹，命名格式为 `000-title`
2. 在文件夹中创建 `cn.md` (中文) 和 `en.md` (英文) 文件
3. 创建 `meta.json` 文件，包含文章的元数据
4. 在 `data/blog/posts/index.json` 中添加新文章的文件夹名称

### 添加新链接

1. 在 `data/links/` 目录下的 `friends.json` 或 `projects.json` 中添加新的链接信息
2. 确保提供必要的字段，如名称、URL、描述等

### 自定义样式

- 全局样式在 `css/home/custom.css` 中定义
- 组件特定样式在对应的 CSS 文件中定义
- 可以通过修改 `tailwind.config` 来自定义 Tailwind CSS 配置

## 浏览器兼容性

- 支持所有现代浏览器（Chrome, Firefox, Safari, Edge）
- 不支持 IE11 及以下版本

## 常见问题 📌

### 为什么使用GitHub Pages部署？

- **免费且稳定**：GitHub Pages 提供免费的静态网站托管服务，对于个人博客来说完全足够，且拥有良好的稳定性保障。
- **与代码仓库集成**：可以直接从 GitHub 仓库自动部署，每次推送代码后自动更新网站，无需额外的部署流程。
- **支持自定义域名**：可以轻松配置自定义域名，同时也提供免费的 HTTPS 证书。
- **适合静态内容**：本项目是纯静态网站（HTML + CSS + JavaScript），GitHub Pages 对静态内容的支持非常完善。
- **全球 CDN 加速**：GitHub Pages 使用全球 CDN 网络，确保网站在世界各地都能快速访问。
- **出发点契合**：本项目初衷就是一个纯静态的个人博客，用于展示信息、想法、博客文章和项目作品，GitHub Pages 正好满足这一需求。

### 如何添加新的页面或功能？

可以在 `components/` 目录下创建新的组件，在 `js/` 目录下添加对应的脚本，然后在 `index.html` 中引用。

### 如何优化网站性能？

- 压缩图片和资源文件
- 减少 HTTP 请求
- 使用浏览器缓存
- 优化 JavaScript 代码

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过网站上的联系表单或 GitHub Issues 与我联系。