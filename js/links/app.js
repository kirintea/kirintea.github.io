const baseUrl = window.location.origin;

const linksUrl = `${baseUrl}/components/links/links-content.html`;

function renderFriends(friendsData) {
    const grid = document.getElementById('friendsGrid');

    grid.innerHTML = friendsData.map(friend => `
        <a href="${friend.link}" class="friend-link" target="_blank" rel="noopener">
            <div class="friend-card">
                <div class="friend-header">
                    <img src="${baseUrl}/assets/links/${friend.avatar}" alt="${friend.name}" class="friend-avatar">
                    <div class="friend-info">
                        <h3 class="friend-name">${friend.name}</h3>
                        <p class="friend-role">${friend.role}</p>
                    </div>
                </div>
                <p class="friend-desc">${friend.desc}</p>
            </div>
        </a>
    `).join('');
}

function renderProjects(projectsData) {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = projectsData.map(project => `
        <div class="project-card">
            <h3 class="project-title">${project.name}</h3>
            <p class="project-desc">${project.desc}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>
            <a href="${project.link}" class="project-link" target="_blank" rel="noopener">View Project →</a>
        </div>
    `).join('');
}

async function loadData() {
    try {
        const [friendsResponse, projectsResponse] = await Promise.all([
            fetch(`${baseUrl}/data/links/friends.json`),
            fetch(`${baseUrl}/data/links/projects.json`)
        ]);

        const friendsData = await friendsResponse.json();
        const projectsData = await projectsResponse.json();

        renderFriends(friendsData);
        renderProjects(projectsData);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function loadLinks() {
    return fetch(linksUrl)
        .then((response) => response.text())
        .then((html) => {
            const container = document.getElementById('links-container');
            if (container) {
                container.innerHTML = html;
            }
        })
        .then(loadData)
        .catch((error) => {
            console.error('Error loading links:', error);
        });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLinks);
} else {
    loadLinks();
}