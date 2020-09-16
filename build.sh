#/bin/sh

# npm i -g prettier parcel-bundler csso-cli

set -e

prettier_default_args() {
    prettier $1 \
        --end-of-line lf \
        --parser babel \
        --print-width 140 \
        --single-quote \
        --tab-width 4 \
        --trailing-comma none \
        $2
}

prettier_default_args -c index.js || {
    TMP_INDEX=$(mktemp)
    cp index.js $TMP_INDEX
    prettier_default_args -w $TMP_INDEX
    diff index.js $TMP_INDEX
    rm $TMP_INDEX
    exit 1
}

mkdir -p dist

if test ! -f dist/vendor.js; then
    {
        echo -e "/* js-yaml 3.14.0 */"
        curl -sSLf https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.14.0/js-yaml.min.js
        echo -e "\n/* nunjucks 3.0.1 */"
        curl -sSLf https://cdnjs.cloudflare.com/ajax/libs/nunjucks/3.0.1/nunjucks.min.js
        echo -e "\n/* markdown-it 11.0.1 */"
        curl -sSLf https://cdnjs.cloudflare.com/ajax/libs/markdown-it/11.0.1/markdown-it.min.js
        echo -e "\n/* highlight 10.2.0 */"
        curl -sSLf https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.0/highlight.min.js
        echo -e "\n/* /markdown-it-anchor 5.3.0 */"
        curl -sSLf https://wzrd.in/standalone/markdown-it-anchor@5.3.0
        echo -e "\n/* /markdown-it-toc-done-right 4.1.0 */"
        curl -sSLf https://wzrd.in/standalone/markdown-it-toc-done-right@4.1.0
        echo -e "\n/* render-vendor-assets */"
        echo -n "var RUNTIME_CSS_STYLES = '$({ cat style.css; curl -sSLf https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.0/styles/github-gist.min.css; } | csso)';"
    } | sed '/sourceMappingURL=/d' >dist/vendor.js
fi

parcel build -d dist -o index.js --no-cache --no-source-maps -t browser index.js

cat dist/vendor.js dist/index.js >pm.js
