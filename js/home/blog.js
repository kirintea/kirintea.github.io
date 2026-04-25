const HOME_BLOG_POST_LIMIT = 4;
const HOME_BLOG_POSTS_SELECTOR = '#home-blog-posts';
const HOME_BLOG_PAGE_URL = './components/blog/blog.html';
const HOME_POST_PAGE_URL = './components/blog/post.html';

function getDateValue(post) {
    const value = Date.parse(post.date);
    return Number.isNaN(value) ? null : value;
}

function sortPostsDescending(posts) {
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

        return bDate - aDate;
    });
}

async function loadPostsMeta() {
    const indexResponse = await fetch('./data/blog/posts/index.json');
    const indexData = await indexResponse.json();

    const metaPromises = indexData.posts.map(async (postDir) => {
        const metaResponse = await fetch(`./data/blog/posts/${postDir}/meta.json`);
        const meta = await metaResponse.json();
        meta.dir = postDir;
        return meta;
    });

    return Promise.all(metaPromises);
}

function createTagMarkup(tag) {
    return `<span class="bg-secondary/15 text-secondary text-xs px-2 py-1 rounded">${tag}</span>`;
}

function createCardMarkup(post, index) {
    const tags = post.tags.slice(0, 2).map(createTagMarkup).join('');
    const href = `${HOME_POST_PAGE_URL}?post=${encodeURIComponent(post.dir)}&lang=en`;
    const delay = 100 * (index + 1);

    return `
        <article
            class="bg-dark rounded-xl overflow-hidden border border-primary/20 card-hover home-blog-card cursor-pointer group h-full"
            data-dir="${post.dir}"
            data-aos="fade-up"
            data-aos-delay="${delay}"
        >
            <a href="${href}" class="block h-full">
                <div class="h-32 px-5 py-4 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 border-b border-primary/10 flex flex-col justify-between">
                    <div class="flex items-start justify-between gap-3 text-sm text-gray-400">
                        <span>${post.date}</span>
                        <span class="bg-primary/20 text-primary text-xs px-2 py-1 rounded">Latest</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        ${tags}
                    </div>
                </div>
                <div class="p-5 flex flex-col h-full">
                    <h3 class="text-lg font-bold mb-3 text-white group-hover:text-primary transition-colors duration-300 leading-snug">
                        ${post.title.en}
                    </h3>
                    <p class="text-sm text-gray-400 mb-5 flex-1 leading-7">
                        ${post.excerpt.en}
                    </p>
                    <span class="text-primary text-sm font-medium flex items-center">
                        Read More <i class="fa fa-arrow-right ml-2"></i>
                    </span>
                </div>
            </a>
        </article>
    `;
}

function renderEmptyState(container) {
    container.innerHTML = `
        <div class="bg-dark rounded-xl overflow-hidden border border-primary/20 p-6 text-gray-400 md:col-span-2 lg:col-span-3">
            No blog posts available yet.
        </div>
    `;
}

function renderErrorState(container) {
    container.innerHTML = `
        <div class="bg-dark rounded-xl overflow-hidden border border-primary/20 p-6 text-gray-400 md:col-span-2 lg:col-span-3">
            Failed to load latest posts. Please visit the full blog page instead.
            <a href="${HOME_BLOG_PAGE_URL}" class="text-primary ml-2">Open Blog</a>
        </div>
    `;
}

function bindCardNavigation(container) {
    container.querySelectorAll('[data-dir]').forEach((card) => {
        card.addEventListener('click', (event) => {
            const anchor = card.querySelector('a');
            if (!anchor) {
                return;
            }

            if (event.target instanceof HTMLElement && event.target.closest('a')) {
                return;
            }

            window.location.href = anchor.href;
        });
    });
}

export async function initHomeBlog() {
    const container = document.querySelector(HOME_BLOG_POSTS_SELECTOR);
    if (!container) {
        return;
    }

    try {
        const posts = await loadPostsMeta();
        const latestPosts = sortPostsDescending(posts).slice(0, HOME_BLOG_POST_LIMIT);

        if (latestPosts.length === 0) {
            renderEmptyState(container);
            return;
        }

        container.innerHTML = latestPosts.map(createCardMarkup).join('');
        bindCardNavigation(container);

        if (typeof AOS !== 'undefined') {
            AOS.refreshHard();
        }
    } catch (error) {
        console.error('Failed to initialize home blog:', error);
        renderErrorState(container);
    }
}
