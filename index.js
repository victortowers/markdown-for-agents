function htmlToMarkdown(html) {
  // Remove boilerplate sections completely
  let md = html
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<select[\s\S]*?<\/select>/gi, '')
    .replace(/<option[\s\S]*?<\/option>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Headers
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');

  // Bold and italic
  md = md.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*');

  // Links
  md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![]($1)');

  // Paragraphs and divs as paragraph breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n\n');

  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '\n$1\n');
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '\n$1\n');

  // Code
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  md = md.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');

  // Horizontal rules
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/tr>/gi, '\n');
  md = md.replace(/<\/td>/gi, ' | ');
  md = md.replace(/<\/th>/gi, ' | ');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]*>/g, '');

  // Decode entities
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');

}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('webpage');

    if (!targetUrl) {
      return new Response('Usage: ?webpage=https://example.com/page', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const response = await fetch(targetUrl);
    const html = await response.text();
    const markdown = htmlToMarkdown(html);

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': estimateTokens(markdown).toString(),
      },
    });
  },
};
