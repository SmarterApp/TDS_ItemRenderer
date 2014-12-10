/**
 * @fileoverview This is a simple template engine inspired by JsTemplates
 * optimized for i18n.
 *
 * It currently supports two handlers:
 *
 *   * i18n-content which sets the textContent of the element
 *
 *     <span i18n-content="myContent"></span>
 *     i18nTemplate.process(element, {'myContent': 'Content'});
 *
 *   * i18n-values is a list of attribute-value or property-value pairs.
 *     Properties are prefixed with a '.' and can contain nested properties.
 *
 *     <span i18n-values="title:myTitle;.style.fontSize:fontSize"></span>
 *     i18nTemplate.process(element, {
 *       'myTitle': 'Title',
 *       'fontSize': '13px'
 *     });
 */

TDS.Messages.Template = (function () {

    // check if an element has any readable text
    var hasText = function(element) {
        var text = Util.Dom.getTextContent(element);
        if (text == null) {
            return false;
        }
        text = YAHOO.lang.trim(text);
        return (text.length > 0);
    };

    /**
    * This provides the handlers for the templating engine. The key is used as
    * the attribute name and the value is the function that gets called for every
    * single node that has this attribute.
    * @type {Object}
    */
    var handlers = {
        /**
        * This handler sets the inner html of the element.
        */
        'i18n-content': function(element, key, dictionary) {
            var replacement = dictionary[key];
            if (YAHOO.lang.isString(replacement)) {
                element.innerHTML = replacement;
            }
            else if (!hasText(element)) {
                element.innerHTML = key;
            }
        },

        /**
        * This handler sets the textContent of the element.
        */
        'i18n-text': function(element, key, dictionary) {
            var replacement = dictionary[key];
            if (YAHOO.lang.isString(replacement)) {
                Util.Dom.setTextContent(element, replacement);
            } else if (!hasText(element)) {
                Util.Dom.setTextContent(element, key);
            }
        },

        // this handler is for TDS buttons
        'i18n-button': function(element, key, dictionary) {
            var replacement = dictionary[key];
            if (YAHOO.lang.isString(replacement)) {
                // HACK: This is for TDS for some reason buttons have <span>'s in them
                replacement = replacement.replace('<span>', '');
                replacement = replacement.replace('</span>', '');
                Util.Dom.setTextContent(element, replacement);
            } else if (!hasText(element)) {
                Util.Dom.setTextContent(element, key);
            }
        },

        /**
        * This handler adds options to a select element.
        */
        'i18n-options': function(element, key, dictionary) {
            var options = dictionary[key];
            options.forEach(function(values) {
                var option = (typeof values == 'string') ? new Option(values) : new Option(values[1], values[0]);
                element.appendChild(option);
            });
        },

        /**
        * This is used to set HTML attributes and DOM properties,. The syntax is:
        *   attributename:key;
        *   .domProperty:key;
        *   .nested.dom.property:key
        */
        'i18n-values': function (element, attributeAndKeys, dictionary) {

            var parts = attributeAndKeys.replace(/\s/g, '').split(/;/);

            for (var j = 0; j < parts.length; j++) {
                var attributeAndKeyPair = parts[j].match(/^([^:]+):(.+)$/);

                if (attributeAndKeyPair) {
                    var propName = attributeAndKeyPair[1];
                    var propExpr = attributeAndKeyPair[2];

                    // Ignore missing properties
                    if (propExpr in dictionary) {
                        var value = dictionary[propExpr];
                        if (propName.charAt(0) == '.') {
                            var path = propName.slice(1).split('.');
                            var targetObject = element;

                            while (targetObject && path.length > 1) {
                                targetObject = targetObject[path.shift()];
                            }

                            if (targetObject) {
                                targetObject[path] = value;

                                // In case we set innerHTML (ignoring others) we need to
                                // recursively check the content
                                if (path == 'innerHTML') {
                                    process(element, dictionary);
                                }
                            }
                        } else {
                            element.setAttribute(propName, value);
                        }
                    } else {
                        Util.log('i18n-values: Missing value for "' + propExpr + '"');
                    }
                }
            }
        }
    };

    // add attribute handler functions
    var attributeNames = Util.Object.keys(handlers);

    // query selector format
    var selector = '[' + attributeNames.join('],[') + ']';

    /**
    * Processes a DOM tree with the {@code obj} map.
    */
    function process(node, dictionary) {
        // var elements = node.querySelectorAll(selector);
        var elements = YAHOO.util.Selector.query(selector, node);

        for (var element, i = 0; element = elements[i]; i++) {
            for (var j = 0; j < attributeNames.length; j++) {
                var name = attributeNames[j];
                var attribute = element.getAttribute(name);
                if (attribute != null) {
                    handlers[name](element, attribute, dictionary);
                }
            }
        }
    }

    return {
        process: process
    };

})();

// helper function for passing in a language and replacing the documents translations
TDS.Messages.Template.processLanguage = function(node) {
    // render replacements
    var templateData = TDS.messages.getTemplateData();
    TDS.Messages.Template.process(node || document, templateData);
};