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

It reads every `*.md` in that directory and writes:
- `blog.html` — article list with search, cards baked in (originals only —
  see below)
- `blog/<slug>.html` — one prebuilt page per article, original or translated

Commit the generated output along with the rest of the site.

### Article format

See `scripts/examples/example-article.md` for a real example of the expected
shape: `# Title` line, a \`\`\`json front-matter block (`slug`, `publishedAt`,
`tags`, `description`, `readingTime`, `language`, `version`), a `---`
separator, then the markdown body.

### Original vs. translated articles

Articles get written in whichever language comes naturally, then optionally
get an AI-translated pt-BR counterpart. Two extra front-matter fields drive
this:
- `language`: `"en"` or `"pt-br"`.
- `version`: `"original"` for the hand-written version, `"ai-translated"` for
  the AI-translated counterpart. Only `"original"` articles get a card on
  `blog.html`; the translated version is reachable only via a language-switch
  link on the article page itself.

`slug` is the article's identifier and must be identical in both files (it's
how the build script pairs an original with its translation). The output
URL slug is derived automatically: the pt-BR page gets a `-pt-br` suffix
appended (e.g. `my-article` -> `my-article-pt-br.html`), the original does
not. See `scripts/examples/example-article.md` +
`scripts/examples/example-article.pt-br.md` for a working pair.
