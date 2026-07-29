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
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
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
  let listType = 'ul';

  function flushParagraph() {
    if (paragraphLines.length) {
      htmlParts.push(`<p>${inlineMarkdown(paragraphLines.join(' '))}</p>`);
      paragraphLines = [];
    }
  }

  function flushList() {
    if (listItems.length) {
      const items = listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('');
      htmlParts.push(`<${listType}>${items}</${listType}>`);
      listItems = [];
      listType = 'ul';
    }
  }

  let inCodeBlock = false;
  let codeLang = '';
  let codeLines = [];

  for (const line of lines) {
    const trimmed = line.trim();

    const fenceMatch = trimmed.match(/^```\s*([\w-]*)\s*$/);
    if (fenceMatch) {
      if (!inCodeBlock) {
        flushParagraph();
        flushList();
        inCodeBlock = true;
        codeLang = fenceMatch[1];
        codeLines = [];
      } else {
        const classAttr = codeLang ? ` class="language-${codeLang}"` : '';
        htmlParts.push(`<pre><code${classAttr}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        inCodeBlock = false;
        codeLang = '';
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

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
      if (listType !== 'ul' && listItems.length) flushList();
      listType = 'ul';
      listItems.push(listMatch[1]);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== 'ol' && listItems.length) flushList();
      listType = 'ol';
      listItems.push(orderedMatch[1]);
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

  <script src="/footer.js"></script>
  <script src="/nav.js"></script>

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

  <script src="footer.js"></script>
  <script src="nav.js"></script>

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
