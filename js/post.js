// post.js - 文章详情页面逻辑
let currentPostMeta = null;
let currentLang = 'en';

async function initPost() {
    const params = new URLSearchParams(window.location.search);
    const postDir = params.get('post');
    const langParam = params.get('lang');
    
    if (langParam) {
        currentLang = langParam;
    }
    
    if (!postDir) {
        window.location.href = 'blog.html';
        return;
    }
    
    await loadPost(postDir);
}

async function loadPost(postDir) {
    try {
        const metaResponse = await fetch(`../posts/${postDir}/meta.json`);
        currentPostMeta = await metaResponse.json();
        currentPostMeta.dir = postDir;
        
        const mdResponse = await fetch(`../posts/${postDir}/${currentLang}.md`);
        const mdContent = await mdResponse.text();
        
        renderPost(mdContent);
    } catch (error) {
        console.error('Error loading post:', error);
        document.getElementById('post-content').innerHTML = `
            <div class="post-loading">Error loading post. <a href="blog.html">Back to Blog</a></div>
        `;
    }
}

async function switchLang(newLang) {
    currentLang = newLang;
    try {
        const mdResponse = await fetch(`../posts/${currentPostMeta.dir}/${currentLang}.md`);
        const mdContent = await mdResponse.text();
        
        renderPost(mdContent);
        
        const url = new URL(window.location);
        url.searchParams.set('lang', currentLang);
        window.history.replaceState({}, '', url);
    } catch (error) {
        console.error('Error switching language:', error);
    }
}

function renderPost(mdContent) {
    const postContainer = document.getElementById('post-content');
    
    const htmlContent = marked.parse(mdContent);
    
    const tagsHTML = currentPostMeta.tags.map(tag => `<span class="post-article-tag">${tag}</span>`).join('');
    
    postContainer.innerHTML = `
        <div class="post-article-header">
            <h1 class="post-article-title">${currentPostMeta.title[currentLang]}</h1>
            <div class="post-article-meta">
                <span class="post-article-date">${currentPostMeta.date}</span>
                <div class="post-article-lang-switcher">
                    <button class="post-article-lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
                    <button class="post-article-lang-btn ${currentLang === 'cn' ? 'active' : ''}" data-lang="cn">中文</button>
                </div>
            </div>
            <div class="post-article-tags">
                ${tagsHTML}
            </div>
        </div>
        <div class="post-article-body">
            ${htmlContent}
        </div>
    `;
    
    document.querySelectorAll('.post-article-lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchLang(e.target.dataset.lang);
        });
    });
    
    document.title = currentPostMeta.title[currentLang];
}

document.addEventListener('DOMContentLoaded', initPost);
