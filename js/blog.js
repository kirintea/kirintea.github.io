// blog.js - 博客页面逻辑
let blogPostsMeta = [];
let currentLang = 'en';
let activeTag = 'all';

async function initBlog() {
    await loadPostsMeta();
    renderTags();
    renderPosts();
    setupLanguageSwitcher();
}

async function loadPostsMeta() {
    try {
        const indexResponse = await fetch('../posts/index.json');
        const indexData = await indexResponse.json();
        
        const metaPromises = indexData.posts.map(async (postDir) => {
            const metaResponse = await fetch(`../posts/${postDir}/meta.json`);
            const meta = await metaResponse.json();
            meta.dir = postDir;
            return meta;
        });
        
        blogPostsMeta = await Promise.all(metaPromises);
        blogPostsMeta.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function renderTags() {
    const tagsList = document.getElementById('tags-list');
    const allTags = new Set();
    
    blogPostsMeta.forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });
    
    let tagsHTML = `<span class="filter-tag all active" data-tag="all">All</span>`;
    allTags.forEach(tag => {
        tagsHTML += `<span class="filter-tag" data-tag="${tag}">${tag}</span>`;
    });
    
    tagsList.innerHTML = tagsHTML;
    
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            activeTag = e.target.dataset.tag;
            updateActiveTag();
            renderPosts();
        });
    });
}

function updateActiveTag() {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
        if (tag.dataset.tag === activeTag) {
            tag.classList.add('active');
        }
    });
}

function renderPosts() {
    const postsContainer = document.getElementById('blog-posts');
    
    let filteredPosts = blogPostsMeta;
    if (activeTag !== 'all') {
        filteredPosts = blogPostsMeta.filter(post => post.tags.includes(activeTag));
    }
    
    let postsHTML = '';
    filteredPosts.forEach(post => {
        const tagsHTML = post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('');
        
        postsHTML += `
            <article class="post-card" data-dir="${post.dir}">
                <div class="post-header">
                    <h2 class="post-title">${post.title[currentLang]}</h2>
                    <div class="post-meta">
                        <span class="post-date">${post.date}</span>
                        <span class="post-lang">${currentLang === 'en' ? 'EN' : 'CN'}</span>
                    </div>
                </div>
                <p class="post-excerpt">${post.excerpt[currentLang]}</p>
                <div class="post-tags">
                    ${tagsHTML}
                </div>
            </article>
        `;
    });
    
    postsContainer.innerHTML = postsHTML;
    
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', () => {
            const dir = card.dataset.dir;
            window.location.href = `post.html?post=${dir}&lang=${currentLang}`;
        });
    });
}

function setupLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentLang = e.target.dataset.lang;
            updateActiveLang();
            renderPosts();
        });
    });
}

function updateActiveLang() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', initBlog);
