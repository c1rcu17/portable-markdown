(function (document, jsyaml, nunjucks, markdownit, hljs, markdownItAnchor, markdownItTocDoneRight, RUNTIME_CSS_STYLES) {
    'use strict';

    const replaceHtml = (title, head, body) => {
        const newHtml = document.open();
        newHtml.write('<!DOCTYPE html><html><head><meta charset="utf-8">');
        newHtml.write('<title>' + title + '</title>');
        newHtml.write(head);
        newHtml.write('</head><body class="markdown-body">');
        newHtml.write(body);
        newHtml.write('</body></html>');
        newHtml.close();
    };

    const main = (body) => {
        const lines = body.split('\n');

        let contextYaml, template;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('#')) {
                contextYaml = lines.slice(0, i).join('\n').trim();
                template = lines.slice(i).join('\n').trim();
                break;
            }
        }

        const context = jsyaml.load(contextYaml);

        nunjucks.configure({
            autoescape: false,
            throwOnUndefined: true
        });

        const markdown = nunjucks.renderString(template, context);

        const md = markdownit({
            html: true,
            linkify: true,
            typographer: true,
            highlight: (str, lang) => {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre class="hljs"><code>' + hljs.highlight(lang, str, true).value + '</code></pre>';
                    } catch (__) {}
                }

                return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        })
            .use(markdownItAnchor, {
                permalink: true,
                permalinkSymbol: '&#128279;'
            })
            .use(markdownItTocDoneRight);

        const newBody = md.render(markdown);

        const title = markdown.split('\n')[0].replace(/^#+/, '').trim();

        replaceHtml(title, '<style>' + RUNTIME_CSS_STYLES + '</style>', newBody);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const scripts = document.getElementsByTagName('script');
        const body = scripts[scripts.length - 1].textContent.trim();

        try {
            main(body);
        } catch (e) {
            replaceHtml('Error', '', '<font color="#FF0000"><pre>' + e.stack + '</pre></font>');
        }
    });
})(document, jsyaml, nunjucks, markdownit, hljs, markdownItAnchor, markdownItTocDoneRight, RUNTIME_CSS_STYLES);
