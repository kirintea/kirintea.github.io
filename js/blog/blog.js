// blog.js - blog page interactions
let blogPostsMeta = [];
let currentLang = 'en';
let activeTag = 'all';
let sortOrder = 'desc';
let viewMode = 'cards';
// const isLocalDebugHost = ['127.0.0.1', 'localhost'].includes(window.location.hostname);

async function initBlog() {
    // syncDebugVisualAid();
    await loadPostsMeta();
    renderTags();
    setupSortToggle();
    setupViewSwitcher();
    setupLanguageSwitcher();
    renderPosts();
}

async function loadPostsMeta() {
    try {
        const indexResponse = await fetch('../../data/blog/posts/index.json');
        const indexData = await indexResponse.json();

        const metaPromises = indexData.posts.map(async (postDir) => {
            const metaResponse = await fetch(`../../data/blog/posts/${postDir}/meta.json`);
            const meta = await metaResponse.json();
            meta.dir = postDir;
            return meta;
        });

        blogPostsMeta = await Promise.all(metaPromises);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function getDateValue(post) {
    const value = Date.parse(post.date);
    return Number.isNaN(value) ? null : value;
}

function getSortedPosts(posts) {
    return [...posts].sort((a, b) => {
        const aDate = getDateValue(a);
        const bDate = getDateValue(b);

        if (aDate === null && bDate === null) {
            return a.dir.localeCompare(b.dir);
        }

        if (aDate === null) {
            return 1;
        }

        if (bDate === null) {
            return -1;
        }

        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    });
}

function renderTags() {
    const tagsList = document.getElementById('tags-list');
    const allTags = new Set();

    blogPostsMeta.forEach((post) => {
        post.tags.forEach((tag) => allTags.add(tag));
    });

    let tagsHTML = '<span class="filter-tag all active" data-tag="all">All</span>';
    allTags.forEach((tag) => {
        tagsHTML += `<span class="filter-tag" data-tag="${tag}">${tag}</span>`;
    });

    tagsList.innerHTML = tagsHTML;

    document.querySelectorAll('.filter-tag').forEach((tag) => {
        tag.addEventListener('click', (e) => {
            activeTag = e.currentTarget.dataset.tag;
            updateActiveTag();
            renderPosts();
        });
    });
}

function updateActiveTag() {
    document.querySelectorAll('.filter-tag').forEach((tag) => {
        tag.classList.toggle('active', tag.dataset.tag === activeTag);
    });
}

function renderPosts() {
    const postsContainer = document.getElementById('blog-posts');
    let filteredPosts = blogPostsMeta;

    if (activeTag !== 'all') {
        filteredPosts = blogPostsMeta.filter((post) => post.tags.includes(activeTag));
    }

    const sortedPosts = getSortedPosts(filteredPosts);
    postsContainer.classList.toggle('cards-view', viewMode === 'cards');
    postsContainer.classList.toggle('journey-view', viewMode === 'journey');
    // syncDebugVisualAid();

    if (sortedPosts.length === 0) {
        postsContainer.innerHTML = '<div class="posts-empty">No posts found for the current filter.</div>';
        return;
    }

    postsContainer.innerHTML = viewMode === 'journey'
        ? renderJourneyPosts(sortedPosts)
        : renderCardPosts(sortedPosts);

    postsContainer.querySelectorAll('[data-dir]').forEach((card) => {
        card.addEventListener('click', () => {
            const dir = card.dataset.dir;
            window.location.href = `post.html?post=${dir}&lang=${currentLang}`;
        });
    });

    if (viewMode === 'journey') {
        syncJourneyDotPositions();
    }
}

function renderCardPosts(posts) {
    return posts.map((post) => {
        const tagsHTML = post.tags.map((tag) => `<span class="post-tag">${tag}</span>`).join('');

        return `
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
    }).join('');
}

function renderJourneyPosts(posts) {
    const itemsHTML = posts.map((post, index) => {
        const tagsHTML = post.tags.map((tag) => `<span class="post-tag">${tag}</span>`).join('');
        const position = index % 2 === 0 ? 'left' : 'right';

        return `
            <div class="journey-row ${position}" data-dir="${post.dir}">
                <article class="journey-post">
                    <div class="post-meta">
                        <span class="post-date">${post.date}</span>
                        <span class="post-lang">${currentLang === 'en' ? 'EN' : 'CN'}</span>
                    </div>
                    <h2 class="post-title">${post.title[currentLang]}</h2>
                    <p class="post-excerpt">${post.excerpt[currentLang]}</p>
                    <div class="post-tags">
                        ${tagsHTML}
                    </div>
                </article>
                <div class="journey-rail" aria-hidden="true">
                    <div class="journey-dot"></div>
                </div>
            </div>
        `;
    }).join('');

    return `<div class="journey-line"></div>${itemsHTML}`;
}

function setupLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            currentLang = e.currentTarget.dataset.lang;
            updateActiveLang();
            renderPosts();
        });
    });
}

function updateActiveLang() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

function setupSortToggle() {
    const sortButton = document.getElementById('sort-toggle-btn');
    if (!sortButton) {
        return;
    }

    sortButton.addEventListener('click', () => {
        sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        updateSortButton();
        renderPosts();
    });

    updateSortButton();
}

function updateSortButton() {
    const sortButton = document.getElementById('sort-toggle-btn');
    if (!sortButton) {
        return;
    }

    sortButton.dataset.order = sortOrder;
    sortButton.textContent = sortOrder === 'desc' ? 'Newest First' : 'Oldest First';
}

function setupViewSwitcher() {
    document.querySelectorAll('.view-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            viewMode = e.currentTarget.dataset.view;
            updateActiveView();
            renderPosts();
        });
    });

    updateActiveView();
}

function updateActiveView() {
    document.querySelectorAll('.view-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.view === viewMode);
    });
}

// function syncDebugVisualAid() {
//     document.body.classList.toggle('debug-visual-aid', isLocalDebugHost && viewMode === 'journey');
// }

function syncJourneyDotPositions() {
    requestAnimationFrame(() => {
        document.querySelectorAll('.journey-row').forEach((row) => {
            const post = row.querySelector('.journey-post');
            const rail = row.querySelector('.journey-rail');

            if (!post || !rail) {
                return;
            }

            const postRect = post.getBoundingClientRect();
            const railRect = rail.getBoundingClientRect();
            const postCenter = (postRect.top - railRect.top) + (postRect.height / 2);

            rail.style.setProperty('--journey-dot-center', `${postCenter}px`);
        });
    });
}

document.addEventListener('DOMContentLoaded', initBlog);
window.addEventListener('resize', () => {
    if (viewMode === 'journey') {
        syncJourneyDotPositions();
    }
});
