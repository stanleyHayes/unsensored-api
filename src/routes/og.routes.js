const express = require('express');
const Article = require('../models/article');

const router = express.Router();

/**
 * Dynamic Open Graph meta tags for article links.
 * When a bot (WhatsApp, Slack, Twitter, etc.) fetches /articles/:id,
 * this middleware serves an HTML page with the right OG tags.
 * For regular browsers, it redirects to the SPA.
 */
router.get('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .select('title summary banner author tags')
            .populate('author', 'name username');

        if (!article) {
            return res.redirect('/');
        }

        const title = article.title || 'Uncensored';
        const description = article.summary || 'Speak freely. Think boldly.';
        const image = article.banner || '/images/og-card.svg';
        const authorName = article.author?.name || 'Unknown';
        const url = `${req.protocol}://${req.get('host')}/articles/${req.params.id}`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>${escapeHtml(title)} — Uncensored</title>
    <meta name="description" content="${escapeHtml(description)}"/>

    <!-- Open Graph -->
    <meta property="og:type" content="article"/>
    <meta property="og:site_name" content="Uncensored"/>
    <meta property="og:title" content="${escapeHtml(title)}"/>
    <meta property="og:description" content="${escapeHtml(description)}"/>
    <meta property="og:image" content="${escapeHtml(image)}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>
    <meta property="og:url" content="${escapeHtml(url)}"/>
    <meta property="article:author" content="${escapeHtml(authorName)}"/>

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${escapeHtml(title)}"/>
    <meta name="twitter:description" content="${escapeHtml(description)}"/>
    <meta name="twitter:image" content="${escapeHtml(image)}"/>

    <!-- Redirect browsers to the SPA -->
    <meta http-equiv="refresh" content="0;url=/articles/${req.params.id}"/>
    <script>window.location.href = '/articles/${req.params.id}';</script>
</head>
<body>
    <p>Redirecting to <a href="/articles/${req.params.id}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

        res.set('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        res.redirect('/');
    }
});

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

module.exports = router;
