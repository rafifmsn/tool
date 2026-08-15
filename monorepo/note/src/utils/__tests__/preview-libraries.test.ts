import { describe, it, expect } from 'vitest';
import { renderMarkdown, containsMermaid } from '../markdown';
import { codeToHtml } from 'shiki';

describe('preview libraries integration', () => {
  it('should correctly detect mermaid code blocks', () => {
    const withMermaid = 'some text\n```mermaid\ngraph TD;\n  A-->B;\n```\n';
    const withoutMermaid = 'some text\n```javascript\nconsole.log(123);\n```\n';

    expect(containsMermaid(withMermaid)).toBe(true);
    expect(containsMermaid(withoutMermaid)).toBe(false);
  });

  it('should parse markdown with LaTeX math equations', async () => {
    const markdown = 'Einstein equation is $E = mc^2$ and block math:\n\n$$E = mc^2$$';
    const html = await renderMarkdown(markdown);

    expect(html).toContain('katex');
  });

  it('should execute syntax highlighting using shiki', async () => {
    const code = 'const hello = "world";';
    const highlighted = await codeToHtml(code, {
      lang: 'js',
      theme: 'github-dark',
    });

    expect(highlighted).toContain('<pre');
    expect(highlighted).toContain('class="shiki');
    expect(highlighted).toContain('style="background-color:#24292e'); // github-dark background
  });
});
