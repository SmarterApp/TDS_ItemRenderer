// REQUIRES: NONE

(function(D) {
    
    // A Mochikit style Dombuilder for YUI:
    // DESCRIPTION: http://jeethurao.com/blog/?p=156
    // EXAMPLE: http://mochi.github.com/mochikit/doc/html/MochiKit/DOM.html
    // ORIGINAL SOURCE: http://bitbucket.org/woadwarrior/dombuilder/src/tip/dombuilder.js
    var L = YAHOO.lang;
    var HTML = {};

    function processChild(child) {
        if (L.isNull(child) || L.isUndefined(child)) {
            return null;
        }
        else if (L.isArray(child)) {
            var r, fn = arguments.callee, l = [];

            for (var i = 0; i < child.length; i++) {
                r = fn.call(this, child[i]);
                if (L.isArray(r)) {
                    for (var j = 0; j < r.length; j++) {
                        l.push(r[j]);
                    }
                }
                else {
                    l.push(r);
                }
            }
            return l;
        }
        else if (L.isString(child) || L.isNumber(child)) {
            return document.createTextNode(child);
        }
        else if (L.isFunction(child)) {
            return arguments.callee.call(this, child.call(this));
        }
        else {
            return child;
        }
    }

    function __replaceWord(w) {
        return w.substr(1, 2).toUpperCase();
    }

    function processStyleName(k) {
        return k.replace(/\-\w/, __replaceWord);
    }

    function processAttr(k, v) {
        if (k == 'style' && L.isObject(v)) {
            var d = {};

            for (var sk in v) {
                if (L.isValue(v[sk])) {
                    d[processStyleName(sk)] = v[sk];
                }
            }

            return d;
        }
        else if (!L.isString(v) && L.isValue(v)) {
            return v.toString();
        }
        else if (L.isFunction(v)) {
            return arguments.callee.call(this, k, v());
        }
        return v;
    }

    function createDom(tag, attrs /* children */) {
        // IE does not allow setting of 'type' attribute on 'input' or 'button'.
        // http://msdn.microsoft.com/workshop/author/dhtml/reference/properties/name_2.asp
        if ((YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 9) && L.isObject(attrs) && (attrs.name || attrs.type)) {
            var tagNameArr = ['<', tag];

            if (attrs.name) {
                tagNameArr.push(' name="', attrs.name, '"');
            }

            if (attrs.type) {
                tagNameArr.push(' type="', attrs.type, '"');

                // Clone attributes map to remove 'type' without mutating the input.
                attrs = L.merge(attrs);
                delete attrs.type;
            }

            tagNameArr.push('>');
            tag = tagNameArr.join('');
        }

        var el = document.createElement(tag);

        if (L.isObject(attrs)) {
            for (var key in attrs) {
                if (L.hasOwnProperty(attrs, key)) {
                    var attr = processAttr.call(this, key, attrs[key]);

                    if (key === 'style') {
                        if (L.isObject(attr)) {
                            for (var sk in attr) {
                                if (L.hasOwnProperty(attr, sk)) {
                                    YUD.setStyle(el, sk, attr[sk]);
                                }
                            }
                        }
                        else {
                            el.style.cssText = attr;
                        }
                    }
                    else if (key === 'class') {
                        el.className = attr;
                    }
                    else {
                        YUD.setAttribute(el, key, attr);
                    }
                }
            }
        }

        var children = [];

        for (var i = 2; i < arguments.length; i++) {
            children.push(arguments[i]);
        }

        for (var i = 0; i < children.length; i++) {
            var child = processChild.call(this, children[i]);

            if (!L.isNull(child)) {
                if (L.isArray(child)) {
                    for (var j = 0; j < child.length; j++) {
                        el.appendChild(child[j]);
                    }
                }
                else {
                    el.appendChild(child);
                }
            }
        }

        return el;
    }

    HTML.createDom = createDom;

    var tag_cache = {};

    function makeTag(t) {
        var tag_name = t.toUpperCase();

        if (tag_cache.hasOwnProperty(tag_name)) {
            return tag_cache[tag_name];
        }

        return Util.Function.bind(createDom, null, t);
    }

    HTML.makeTag = makeTag;
    var tag, tags = ['a', 'button', 'br', 'canvas',
        'dd', 'div', 'dl', 'dt', 'em', 'fieldset', 'form',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'img', 'input',
        'label', 'legend', 'li', 'ol', 'optgroup', 'option', 'p', 'pre',
        'select', 'span', 'strong', 'table', 'tbody', 'td', 'textarea',
        'tfoot', 'th', 'thead', 'tr', 'tt', 'ul'];

    // add each tag function to dom builder
    for (var i = 0, i_max = tags.length; i < i_max; i++) {
        tag = tags[i];
        HTML[tag.toUpperCase()] = makeTag(tag);
    }

    // exports
    D.Builder = HTML;
    window.HTML = HTML; // TODO: Remove this!!

})(Util.Dom);

