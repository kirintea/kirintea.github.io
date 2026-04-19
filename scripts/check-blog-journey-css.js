const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'pages', 'blog.css');
const css = fs.readFileSync(cssPath, 'utf8');

const requiredSelectors = [
    '.blog-posts.journey-view',
    '.journey-post',
    '.journey-content',
    '.journey-dot'
];

const missing = requiredSelectors.filter((selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`${escaped}\\s*\\{[^}]*box-sizing\\s*:\\s*border-box\\s*;`, 's');
    return !pattern.test(css);
});

if (missing.length > 0) {
    console.error(`Missing border-box protection for: ${missing.join(', ')}`);
    process.exit(1);
}

console.log('Blog journey CSS includes border-box protection for key timeline selectors.');
