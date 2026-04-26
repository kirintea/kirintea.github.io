function normalizeRelativeAssetPath(url) {
    return url.replace(/^\.\/+/, '');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function isRelativePostAssetUrl(url) {
    if (typeof url !== 'string' || !url.trim()) {
        return false;
    }

    const normalizedUrl = url.trim();

    return !/^(?:[a-z][a-z\d+\-.]*:|\/\/|#|\/)/i.test(normalizedUrl);
}

export function resolvePostAssetUrl(postDir, url) {
    if (!isRelativePostAssetUrl(url)) {
        return url;
    }

    return `../../data/blog/posts/${postDir}/${normalizeRelativeAssetPath(url)}`;
}

export function normalizeRendererLanguage(language) {
    if (typeof language !== 'string') {
        return '';
    }

    const normalizedLanguage = language.trim().toLowerCase();
    const aliases = {
        javascript: 'js',
        jsx: 'jsx',
        typescript: 'ts',
        tsx: 'tsx',
        shell: 'bash',
        sh: 'bash',
        zsh: 'bash',
        xml: 'markup',
        html: 'markup',
        svg: 'markup'
    };

    return aliases[normalizedLanguage] || normalizedLanguage;
}

export function createCodeBlockHtml({ code, language, highlightedHtml }) {
    return [
        `<pre class="code-block language-${language}">`,
        `<code class="language-${language}">${highlightedHtml}</code>`,
        '</pre>'
    ].join('');
}

export function createMermaidBlockHtml(code) {
    return [
        '<div class="mermaid-block">',
        `<div class="mermaid">${escapeHtml(code)}</div>`,
        '</div>'
    ].join('');
}

export function createPostMarkedRenderer(postDir) {
    const renderer = new marked.Renderer();
    const defaultCodeRenderer = renderer.code.bind(renderer);
    const defaultImageRenderer = renderer.image.bind(renderer);
    const defaultLinkRenderer = renderer.link.bind(renderer);

    renderer.code = ({ text, lang }) => {
        const normalizedLanguage = normalizeRendererLanguage(lang);

        if (normalizedLanguage === 'mermaid') {
            return createMermaidBlockHtml(text);
        }

        if (!normalizedLanguage || typeof Prism === 'undefined') {
            return defaultCodeRenderer({ text, lang: normalizedLanguage || lang });
        }

        const grammar = Prism.languages[normalizedLanguage];

        if (!grammar) {
            return createCodeBlockHtml({
                code: text,
                language: normalizedLanguage,
                highlightedHtml: escapeHtml(text)
            });
        }

        const highlightedHtml = Prism.highlight(text, grammar, normalizedLanguage);

        return createCodeBlockHtml({
            code: text,
            language: normalizedLanguage,
            highlightedHtml
        });
    };

    renderer.image = ({ href, title, text }) => defaultImageRenderer({
        href: resolvePostAssetUrl(postDir, href),
        title,
        text
    });

    renderer.link = ({ href, title, text, tokens }) => defaultLinkRenderer({
        href: resolvePostAssetUrl(postDir, href),
        title,
        text,
        tokens
    });

    return renderer;
}
