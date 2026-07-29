# myspace
This is my space website

## Blog

Blog pages (`blog.html` + `blog/*.html`) are static HTML, generated from
markdown article files. No server, no runtime fetch — everything baked in
at build time.

**Requires Node.js** (no npm packages, built-ins only).

To regenerate, point the script at your articles directory:

```bash
node scripts/build-blog.js ../personal-media-ai/articles
```

It reads every `*.md` in that directory (skipping `*.pt-br.md`), and writes:
- `blog.html` — article list with search, cards baked in
- `blog/<slug>.html` — one prebuilt page per article

Commit the generated output along with the rest of the site.

### Article format

See `scripts/examples/example-article.md` for a real example of the expected
shape: `# Title` line, a \`\`\`json front-matter block (`slug`, `publishedAt`,
`tags`, `description`, `readingTime`), a `---` separator, then the markdown
body.
