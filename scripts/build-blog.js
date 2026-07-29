#!/usr/bin/env node
/**
 * Reads markdown articles from a source directory, generates:
 *  - blog.html (list page, cards baked in)
 *  - blog/<slug>.html (prebuilt article page)
 * Everything is static output, no fetch/API call at runtime.
 * Run manually: node scripts/build-blog.js <path-to-articles-dir>
 */

const fs = require('fs');
const path = require('path');

const sourceArg = process.argv[2];
if (!sourceArg) {
  console.error('Usage: node scripts/build-blog.js <path-to-articles-dir>');
  console.error('Example: node scripts/build-blog.js ../personal-media-ai/articles');
  process.exit(1);
}

const SOURCE_DIR = path.resolve(process.cwd(), sourceArg);
const OUT_DIR = path.join(__dirname, '..', 'blog');
const BLOG_LIST_PATH = path.join(__dirname, '..', 'blog.html');

function parseArticle(raw) {
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) {
    throw new Error('missing json front-matter block');
  }
  const meta = JSON.parse(jsonMatch[1]);

  const afterJson = raw.slice(jsonMatch.index + jsonMatch[0].length);
  const bodyStart = afterJson.indexOf('---');
  const body = bodyStart === -1 ? afterJson : afterJson.slice(bodyStart + 3);

  return { meta, body: body.trim() };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineMarkdown(text) {
  let out = escapeHtml(text);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
}

function markdownToHtml(markdown) {
  const lines = markdown.split('\n');
  const htmlParts = [];
  let paragraphLines = [];
  let listItems = [];

  function flushParagraph() {
    if (paragraphLines.length) {
      htmlParts.push(`<p>${inlineMarkdown(paragraphLines.join(' '))}</p>`);
      paragraphLines = [];
    }
  }

  function flushList() {
    if (listItems.length) {
      const items = listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('');
      htmlParts.push(`<ul>${items}</ul>`);
      listItems = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1]);
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return htmlParts.join('\n');
}

function renderArticlePage(meta, bodyHtml) {
  return `<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(meta.description)}" />
  <meta name="keywords" content="${meta.tags.map(escapeHtml).join(',')}" />
  <meta name="robots" content="index, follow">
  <title>${escapeHtml(meta.title)} | Lair Júnior</title>
  <link rel="icon" href="../favicon.ico" type="image/x-icon" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
    rel="stylesheet">
  <link href="../colors.css" rel="stylesheet" type="text/css" />
  <link href="../common.css" rel="stylesheet" type="text/css" />
  <link href="../footer.css" rel="stylesheet" type="text/css" />
  <link href="../blog.css" rel="stylesheet" type="text/css" />
</head>

<body>
  <div class="blog-article">
    <div class="container">
      <a href="../blog.html" class="back-link">&larr; Back to blog</a>

      <article>
        <h1>${escapeHtml(meta.title)}</h1>

        <div class="meta">
          <span class="date">${escapeHtml(meta.publishedAt)}</span>
          <span class="reading-time">${escapeHtml(meta.readingTime)}</span>
        </div>

        <span class="tools">
          ${meta.tags.map((tag) => `<div class="chip">${escapeHtml(tag)}</div>`).join('\n          ')}
        </span>

        <div class="content">
${bodyHtml}
        </div>
      </article>
    </div>
  </div>

  <footer class="footer">
    <div class="container">
      ©&nbsp;<span id="copyright-year">2026</span>&nbsp;copyright Lair Júnior all right reserved
    </div>
  </footer>

  <script src="../script.js"></script>
</body>

</html>
`;
}

function renderCard(meta) {
  const searchText = escapeHtml(
    [meta.title, meta.description, ...meta.tags].join(' ').toLowerCase()
  );

  return `        <a href="blog/${meta.slug}.html" class="card" data-search="${searchText}">
          <h3>${escapeHtml(meta.title)}</h3>
          <span class="date">${escapeHtml(meta.publishedAt)} &middot; ${escapeHtml(meta.readingTime)}</span>
          <p class="description">${escapeHtml(meta.description)}</p>
          <span class="tools">
            ${meta.tags.map((tag) => `<div class="chip">${escapeHtml(tag)}</div>`).join('\n            ')}
          </span>
        </a>`;
}

function renderBlogListPage(metaList) {
  const cardsHtml = metaList.map(renderCard).join('\n\n');

  return `<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Articles by Lair Júnior on software engineering, AI adoption, and product building." />
  <meta name="keywords" content="blog,articles,software,engineering,ai" />
  <meta name="robots" content="index, follow">
  <title>Blog | Lair Júnior</title>
  <link rel="icon" href="./favicon.ico" type="image/x-icon" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
    rel="stylesheet">
  <link href="colors.css" rel="stylesheet" type="text/css" />
  <link href="common.css" rel="stylesheet" type="text/css" />
  <link href="footer.css" rel="stylesheet" type="text/css" />
  <link href="blog.css" rel="stylesheet" type="text/css" />
</head>

<body>
  <div class="blog-list">
    <div class="container">
      <h1>Blog</h1>

      <input type="search" class="search" id="blog-search" placeholder="Search articles by title, tag, or description..." />

      <div class="cards-container" id="blog-cards">
${cardsHtml}
      </div>

      <p class="empty-state" id="blog-empty" style="display: none;">No articles found.</p>
    </div>
  </div>

  <footer class="footer">
    <div class="container">
        ©&nbsp;<span id="copyright-year">2026</span>&nbsp;copyright Lair Júnior all right reserved
    </div>
  </footer>

  <nav class="menu">
    <ul>
        <li class="tooltip-container">
            <a href="index.html#home">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10M2 10.6L12 2l10 8.6"/></svg>
            </a>
            <span class="tooltip-text">Home</span>
        </li>
        <li class="tooltip-container">
            <a href="index.html#about">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
            </a>
            <span class="tooltip-text">About</span>
        </li>
        <li class="tooltip-container">
            <a href="index.html#projects">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </a>
            <span class="tooltip-text">Projects</span>
        </li>
        <li class="tooltip-container">
            <a href="index.html#work">
                <svg xmlns="http://www.w3.org/2000/svg"  width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </a>
            <span class="tooltip-text">Work</span>
        </li>
        <li class="tooltip-container">
            <a href="blog.html">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </a>
            <span class="tooltip-text">Blog</span>
        </li>
    </ul>
  </nav>

  <script src="script.js"></script>
  <script src="blog.js"></script>
</body>

</html>
`;
}

function build() {
  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((file) => file.endsWith('.md') && !file.endsWith('.pt-br.md'));

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const metaList = [];
  const seenSlugs = new Map();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8');
    const { meta, body } = parseArticle(raw);

    if (seenSlugs.has(meta.slug)) {
      throw new Error(
        `duplicate slug "${meta.slug}": ${seenSlugs.get(meta.slug)} and ${file}`
      );
    }
    seenSlugs.set(meta.slug, file);

    const bodyHtml = markdownToHtml(body);

    fs.writeFileSync(path.join(OUT_DIR, `${meta.slug}.html`), renderArticlePage(meta, bodyHtml));

    metaList.push(meta);
  }

  metaList.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  fs.writeFileSync(BLOG_LIST_PATH, renderBlogListPage(metaList));

  console.log(`Built ${metaList.length} article(s): blog.html + blog/*.html`);
}

build();
