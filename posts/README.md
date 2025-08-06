# rSearch Blog Posts

This directory contains markdown blog posts for the rSearch blog. Each post is written in Markdown format with YAML front matter for metadata.

## File Structure

Each blog post should be a `.md` file with the following structure:

```markdown
---
title: "Your Blog Post Title"
description: "A brief description of the blog post content"
publishDate: "YYYY-MM-DD"
author: "Author Name"
readTime: "X min read"
category: "Category Name"
keywords: ["keyword1", "keyword2", "keyword3"]
---

# Your Blog Post Content

Your markdown content goes here...
```

## Required Front Matter Fields

- **title**: The title of the blog post
- **description**: A brief description for SEO and preview purposes
- **publishDate**: Publication date in YYYY-MM-DD format
- **author**: Author name
- **readTime**: Estimated reading time (e.g., "5 min read")
- **category**: Post category (e.g., "AI Technology", "AI Models", "AI Tools", etc.)
- **keywords**: Array of relevant keywords for SEO

## Adding New Blog Posts

1. Create a new `.md` file in this directory
2. Use a descriptive filename (e.g., `my-new-blog-post.md`)
3. Add the required YAML front matter
4. Write your content in Markdown format
5. The post will automatically appear on the blog page, sorted by publish date

## Markdown Features

The blog system supports standard Markdown features:

- **Headers**: `#`, `##`, `###`, etc.
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Links**: `[text](url)`
- **Lists**: `-` or `1.`
- **Code**: `` `code` `` or ``` ``` ```
- **Tables**: Standard markdown table syntax
- **Blockquotes**: `> text`

## Styling

Blog posts use the same styling as the rSearch results component, with:
- Orange theme colors
- Responsive design
- Proper typography
- Code highlighting
- Table styling

## Categories

Current categories include:
- AI Technology
- AI Models
- AI Tools
- AI Research
- Search Technology

## Examples

See the existing blog posts in this directory for examples of well-formatted content:
- `ai-reasoning-search-engines.md`
- `deepseek-r1-reasoning.md`
- `perplexity-alternatives.md`
- `chain-of-thought-reasoning.md`
- `multi-source-search.md`