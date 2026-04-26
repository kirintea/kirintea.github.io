# KirinTeaAki - Personal Website

A personal website built with native HTML5 + Tailwind CSS + JavaScript, used to showcase information, ideas, blog posts, and projects.

[![Visit Live Site](https://img.shields.io/badge/Visit-Live%20Site-0f766e?style=for-the-badge&logo=cloudflare&logoColor=white)](https://kirintea.github.io/)
[![View GitHub Repository](https://img.shields.io/badge/GitHub-Repository-111827?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kirintea/kirintea_github_io)

> **中文版本**: [查看中文文档](README.zh-CN.md)

## Main Site

The primary access point is **kirintea.github.io** (GitHub Pages).

## Features 🚀

A modern personal website tech stack dedicated to showcasing personal skills, projects, and blog content:

- Built with native HTML5 + CSS3 + JavaScript (ES6+)
- Responsive design, adapting to different screen sizes
- Dynamic component loading, asynchronously loading HTML components
- Rich animation effects: scroll animations, page transition effects
- 3D visual effects: 3D elements implemented with Three.js
- Blog system: supporting bilingual (Chinese/English) blog posts
- Particle effects: interactive particle backgrounds
- Navigation system: smooth scrolling and navigation menu
- Links page: displaying friend links and project links

## System Architecture 🧱

### Content Pipeline

- Source code: modular components in `components/` directory
- Data: JSON data files in `data/` directory
- Blog posts: Markdown files in `data/blog/posts/` directory
- Rendering: dynamically loading components and data via JavaScript

### UI Composition

- Global shell: navigation bar + content area + footer
- Component-based design: modular HTML components
- Responsive layout: adapting to desktop and mobile devices
- Animation effects: smooth animations implemented with AOS and GSAP

### Technology Stack

- **Frontend**: Native HTML5, CSS3, JavaScript (ES6+)
- **CSS Framework**: Tailwind CSS
- **Animation Libraries**: AOS (Animate On Scroll), GSAP
- **3D Library**: Three.js
- **Icon Library**: Font Awesome 7
- **Chart Library**: Chart.js
- **Markdown Parser**: Marked

## Project Structure 📁

```text
.
├─ assets/             # Static resources
│  ├─ home/           # Home page resources
│  │  ├─ icons/       # Icon resources
│  │  └─ images/      # Home page images
│  ├─ images/         # General image resources
│  ├─ links/          # Links page resources
│  └─ navbar/         # Navigation bar resources
├─ components/         # Modular components
│  ├─ blog/           # Blog-related components
│  ├─ home/           # Home page components
│  ├─ links/          # Links page components
│  └─ navbar/         # Navigation bar components
├─ css/                # Style files
│  ├─ blog/           # Blog styles
│  ├─ home/           # Home page styles
│  ├─ links/          # Links page styles
│  └─ navbar/         # Navigation bar styles
├─ data/               # Data files
│  ├─ blog/           # Blog data
│  │  └─ posts/       # Blog posts
│  └─ links/          # Links data
├─ js/                 # JavaScript files
│  ├─ blog/           # Blog scripts
│  ├─ home/           # Home page scripts
│  ├─ links/          # Links page scripts
│  └─ navbar/         # Navigation bar scripts
├─ tests/              # Test files
├─ vendor/             # Third-party libraries
├─ .gitignore          # Git ignore file
├─ index.html          # Main page
├─ README.md           # Chinese documentation
└─ README-en.md        # English documentation
```

## Core Modules

### Home Page Module
- **Personal Information**: Personal profile and role display
- **Skills Showcase**: Professional skills and tech stack
- **Blog Preview**: Latest blog post previews
- **Project Showcase**: Personal project display

### Blog Module
- **Article List**: Blog post index
- **Article Details**: Markdown-formatted article content
- **Bilingual Support**: Chinese and English articles

### Links Module
- **Friend Links**: Displaying friends and partners' websites
- **Project Links**: Displaying related projects and resources

## Engineering Decisions 🛠️

### 1) Modular Design

Adopting component-based development, splitting pages into multiple independent HTML components for easier maintenance and extension. Dynamically loading components via JavaScript to improve page loading speed and code maintainability.

### 2) Performance Optimization

- Lazy loading of components and resources to improve page loading speed
- Optimizing image resources to reduce page loading time
- Using modern JavaScript features to improve code execution efficiency

### 3) User Experience

- Smooth animation effects and interactive experience
- Responsive design adapting to different screen sizes
- Compliance with Web accessibility standards

## Deployment 🌐

### Recommended Environment: GitHub Pages

- Main domain: `https://kirintea.github.io/`
- This is the recommended public access point, providing the latest features and performance.

### Pre-Release Checklist

- Verify all pages load correctly
- Check responsive design displays properly on different devices
- Test animation effects and interactive functions
- Check for 404 errors in network requests

## Development 💻

### Running and Debugging

1. Clone the project to your local environment
2. Open `index.html` file using a local server
   - You can use `python -m http.server` to start a simple HTTP server
   - Or use VS Code's Live Server extension

### Adding New Blog Posts

1. Create a new folder in `data/blog/posts/` directory, named in the format `000-title`
2. Create `cn.md` (Chinese) and `en.md` (English) files in the folder
3. Create a `meta.json` file containing the post's metadata
4. Add the new post's folder name to `data/blog/posts/index.json`

### Adding New Links

1. Add new link information to `friends.json` or `projects.json` in `data/links/` directory
2. Ensure to provide necessary fields such as name, URL, description, etc.

### Customizing Styles

- Global styles are defined in `css/home/custom.css`
- Component-specific styles are defined in corresponding CSS files
- You can customize Tailwind CSS configuration by modifying `tailwind.config`

## Browser Compatibility

- Supports all modern browsers (Chrome, Firefox, Safari, Edge)
- Does not support IE11 and below

## Frequently Asked Questions 📌

### Why use GitHub Pages for deployment?

- **Free and stable**: GitHub Pages provides free static website hosting service, which is completely sufficient for personal blogs, with good stability guarantees.
- **Integration with code repository**: Can be automatically deployed directly from GitHub repository, automatically updating the website after each code push, without additional deployment process.
- **Support for custom domains**: Can easily configure custom domains, and also provides free HTTPS certificates.
- **Suitable for static content**: This project is a pure static website (HTML + CSS + JavaScript), and GitHub Pages has perfect support for static content.
- **Global CDN acceleration**: GitHub Pages uses a global CDN network to ensure fast access to the website worldwide.
- **Alignment with original intent**: The original intention of this project is a pure static personal blog for showcasing information, ideas, blog posts, and project works, and GitHub Pages just meets this need.

### How to add new pages or features?

You can create new components in the `components/` directory, add corresponding scripts in the `js/` directory, and then reference them in `index.html`.

### How to optimize website performance?

- Compress images and resource files
- Reduce HTTP requests
- Use browser caching
- Optimize JavaScript code

## License

MIT License

## Contact

For questions or suggestions, please contact me through the contact form on the website or GitHub Issues.