function htmlToMarkdown(html) {
  let md = html;
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*');
  md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![]($1)');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n');
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n');
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n');
  md = md.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');
  md = md.replace(/<hr\s*\/?>/gi, '---\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<[^>]*>/g, '');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.replace(/[ \t]+/g, ' ');
  return md.trim();
}

function estimateTokens(text) {
  return Math.round(text.length / 4);
}

export default {
  async fetch(request, env, ctx) {
    const accept = request.headers.get('Accept') || '';
    const url = new URL(request.url);

    // Browser request → serve a test HTML page
    if (!accept.includes('text/markdown')) {
      const html = `<!DOCTYPE html>
<html>
<head><title>Feito - Markdown for Agents Test</title></head>
<body>
  <h1>Hello from Feito!</h1>
  <p>This is a <strong>test page</strong> for the Markdown for Agents worker.</p>
  <p>Try curling with <code>Accept: text/markdown</code> to see the markdown version.</p>
  <ul>
    <li>Item one</li>
    <li>Item two</li>
    <li>Item three</li>
  </ul>
  <p>Visit <a href="https://example.com">Example</a> for more info.</p>
</body>
</html>`;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Agent request → fetch the HTML version of ourselves, then convert
    const htmlUrl = url.toString();
    const htmlResponse = await fetch(htmlUrl, {
      headers: { 'Accept': 'text/html' },
    });
    const html = await htmlResponse.text();
    const markdown = htmlToMarkdown(html);

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': estimateTokens(markdown).toString(),
      },
    });
  },
};
