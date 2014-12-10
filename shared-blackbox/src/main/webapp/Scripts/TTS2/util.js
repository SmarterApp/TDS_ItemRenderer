/**
 *  The parsing is made up of 
 *     TTS.Parser.Container -> Wrapper interface for all the parsing logic
 *
 *     TTS.Parser.DOM  -> Parses Dom fragements / nodes
 *     TTS.Parser.HTML -> Parser an html string, then parsed by DOM 
 *     TTS.Parser.Selection -> Parses the user selection, then hands off to the DOM parser
 *
 *     TTS.Util -> Helper methods for determining content
 *
 *     TODO: More test cases
 *           Provide standard namespace usage TTS.Parser.*
 *           Fix up the 'language divider' code for all the parsing elements.
 *           Consider a better option for the stored dom / element references.
 *
 *
 *     Provide something that the TTS highlighter can use to actually track 
 *     word boundary modifications => alt text, ssml etc.
 *
 * //Example SSML tag
 * <SPAN class=”tts” ssml=”sub” ssml_alias=”the alternate text”>
 */
YUD = YAHOO.util.Dom;

TTS.Util = {

    createDiv: function(strOrHtml) {
        var newdiv = document.createElement('div');
        newdiv.innerHTML = strOrHtml || '';
        return newdiv;
    },

    //This really should have been done with data-attr information....
    getSub: function(elmObj, attrTag, lang) { //Get alternative subtitle text out of the node.
        if (!elmObj) {
            return;
        }
        lang = lang || 'ENU';
        attrTag = attrTag || 'ssml';

        if (elmObj.nodeName == 'SPAN') { //Supports the old way of tagging.
            if (YUD.hasClass(elmObj, 'tts') || YUD.hasClass(elmObj, 'TTS')) {
                if (elmObj.attributes != null && elmObj.attributes.getNamedItem("ssml") != null) {
                    var ssmlType = elmObj.attributes.getNamedItem("ssml").nodeValue;
                    if (ssmlType == "sub") {
                        var ssmlAlias = "";
                        if (elmObj.attributes.getNamedItem(attrTag) != null) {
                            ssmlAlias = elmObj.attributes.getNamedItem(attrTag).nodeValue;
                        }
                        return ssmlAlias + " ";
                    }
                }
            }
        } else if (elmObj.nodeName == 'INPUT') { //Supports the input hack method (for now)
            if (YUD.hasClass(elmObj, 'tts')) {
                if (elmObj.attributes != null && elmObj.attributes.getNamedItem(lang) != null) {
                    return elmObj.attributes.getNamedItem(lang).nodeValue + ' ';
                }
            }
        }
        return null;
    },

    ignore: function(node) {
        if (node && YUD.getAttribute(node, 'data-tts-skip') == 'true') {
            return true;
        }
    },

    sanitizeLang: function(lang) {
        if (lang == 'ENU') {
            return 'en-us';
        } else if (lang == 'ESN') {
            return 'es-mx';
        }
    },

    markLang: function(node, lang) {
        if (node && node.nodeType != 3 && lang) {
            YUD.setAttribute(node, 'lang', lang);
        }
    },

    isLang: function(node, lang) {
        lang = TTS.Util.sanitizeLang(lang);
        if (TTS.Util.getLang(node) == lang) {
            return true;
        }
        return false;
    },

    getLang: function(node) {
        if (node) {
            if (node.nodeType == 3) { //Text node
                return TTS.Util.getLang(node.parentNode);
            } else {
                return YUD.getAttribute(node, 'lang');
            }
        }
    },

    hasAlt: function(node) { //Does the node contain alternative text
        if (node && node.nodeType != 3) { //YUD.hasClass acts really stupid on textNodes
            if (YUD.hasClass(node, 'hasAlt') || YUD.hasClass(node, 'contextAreaAlt')) {
                return true;
            }
        }
    },

    hasLanguageAttr: function(node) { //Check to see if there is a language divider
        if (node && node.nodeType == Node.ELEMENT_NODE && YUD.hasClass(node, 'languagedivider')) {
            return node;
        }
        return null;
    },

    hasLanguageAttributes: function(domNodesArray) { //Check to see if there is a language divider
        for (var i = 0; i < domNodesArray.length; ++i) {
            var domNode = domNodesArray[i];
            if (domNode != null && domNode.nodeType == Node.ELEMENT_NODE) {
                if (YUD.hasClass(domNode, 'languagedivider')) {
                    return domNode;
                }
            }
        }
        return null;
    },

    bubble: function(node, match, results) { //Bubble up the tree looking for a match.
        results = results || {};
        if (node && typeof match == 'function') {
            if (match(node)) {
                results.node = node;
            } else if (node.parentNode && node.nodeName != "BODY" && node.nodeName != 'IFRAME') {
                TTS.Util.bubble(node.parentNode, match, results);
            }
        }
        return results.node;
    },

    dfs: function(nodes, match, results) { //Search through the dom looking for a match
        if (!nodes) {
            return;
        }
        results = results || {};
        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            if (results.node) {
                break;
            } else if (match(node)) {
                results.node = node;
                break;
            } else {
                TTS.Util.dfs(node.childNodes, match, results);
            }
        }
        return results.node;
    },

    cleanText: function(text, addHacks) { // controls speech..
        text = text.replace(/"/g, " ");
        text = text.replace(/\u201C/g, " "); //left quote   
        text = text.replace(/\u201D/g, " "); //right quote
        text = text.replace(/\u2019/g, "'"); //unicode apostrophe

        if (TTS.Config.shouldSanitizeTextForTTS()) {
            // Remove all non ASCII characters outside the standard ASCII set with the exception of the Spanish characters 
            // Spanish character list from http://webdesign.about.com/od/localization/l/blhtmlcodes-sp.htm#codes
            text = text.replace(/[^\u0000-\u0081\u00C1\u00E1\u00C9\u00E9\u00CD\u00ED\u00D1\u00F1\u00D3\u00F3\u00DA\u00FA\u00DC\u00FC\u00AB\u00BB\u00BF\u00A1\u2047]+/g, "");
        }

        if (text != null && text != '' && addHacks) {
            text = TTS.Util.addTagsAndHacks(text);
        }

        // Replace multi space with single spaces, replace endlines with space.
        // text = text.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/gm, ' ');

        text = text.replace(/{silence}/g, "{silence:200}");
        
        if (Util.Browser.isWindows()) {
            text = text.replace(/{silence:([0-9]+)}/g, ',<silence msec="$1"/>'); // the , is to soften the breaks.
            // In SB4.0, we need to include this pretag to force the code to understand that speech 
            // tags are embedded. Otherwise, it reads the tags as text
        } else if (Util.Browser.isMac()) {
            // Bug 112603 Non-blanking spaces (unicode 00A0) cause misalignment in TTS tracking in OSx 10.7 and earlier
            text = text.replace(/\u00A0/g, " ");
            text = text.replace(/{silence:([0-9]+)}/g, "[[slnc $1]]");
        } else {
            // I dont really have a solution here other than to put back our hack
            text = text.replace(/{silence:([0-9]+)}/g, " ; ");
        }

        return text;
    },
    
    replaceLeadDirectives: function (text) {
        var replaceText = function (expString, target) {
            var exp = new RegExp(expString);
            
            // Create regular expression to find TTS prefix and leading replacement target
            var prefix = TTS.Util.getTTSPrefix();
            var prefixRegExp = new RegExp('^' + prefix + '\\s*' + expString);

            var replacement = prefixRegExp.exec(target); // get string containing prefix, separating whitespace, and replacement target
            if (replacement && replacement[0]) {
                var spaces = exp.exec(replacement[0]); // get replacement target
                if (spaces && spaces[0]) {
                    // Convert characters of replacement target to spaces, preserving the string length
                    spaces = spaces[0].replace(/\S/g, ' ');
                    replacement = replacement[0].replace(exp, spaces); 
                }
            }

            target = target.replace(prefixRegExp, replacement);
            return target;

        };

        // replace leading semicolons
        var expString = ';'; 
        text = replaceText(expString, text);
        
        // replace leading Windows silences
        expString = ',<silence msec="[0-9]*"\/>';
        text = replaceText(expString, text);
        
        return text;

    },
    
        // Bug 114921 Silenced tables cause excessive silences to occur.  Resolve by making 2nd - nth silence 1msec duration
    // Note: Replaced silence string must be the same length as the original string, or else TTS highlighting gets out of sync
    shortenSilence: function (text) {
        if (Util.Browser.isWindows()) {
            var shortenSilence = text.split('/>');
            var filteredSilence = /<silencemsec="200"/g;
            var silence = /<silence msec="200"/g;
            for (var i = shortenSilence.length - 1 ; i > 0; i--) {
                var filteredShortenSilence = i > 0 ? shortenSilence[i - 1].replace(/[ ,]/g, '') : null;
                if (filteredShortenSilence && filteredShortenSilence.search(filteredSilence) == 0) {
                    shortenSilence[i] = shortenSilence[i].replace(silence, '<silence msec="1"  ');
                }
            }
            text = shortenSilence.join('/>');
        } else if (Util.Browser.isMac()) {
            shortenSilence = text.split(']]');
            filteredSilence = /\[\[slnc200/g;
            silence = /\[\[slnc 200/g;
            for (i = shortenSilence.length - 1 ; i > 0; i--) {
                filteredShortenSilence = i > 0 ? shortenSilence[i - 1].replace(/[ ,]/g, '') : null;
                if (filteredShortenSilence && filteredShortenSilence.search(filteredSilence) == 0) {
                    shortenSilence[i] = shortenSilence[i].replace(silence, '[[slnc 1  ');
                }
            }
            text = shortenSilence.join(']]');
        }
        return text;
    },

    /*
    Remove all the {silence:xxx} directives and replace with the OS specific silence markup
    For windows - it is <silence="400ms"/>
    For OS X - it is [[slnc 400]]
    For Linux - we dont have anything ... We have been using ; as a hack everywhere so I will use that here
    */

    getTTSPrefix: function () {
        var text = '';
        if (Util.Browser.isWindows()) {
            return '<bookmark mark="start"/> ';
            // In SB4.0, we need to include this pretag to force the code to understand that speech 
            // tags are embedded. Otherwise, it reads the tags as text
        } else if (Util.Browser.isMac()) {
            text = "[[sync 0x000000A1]] "; // Adding the bookmarks so that in OS X, the      last portion of a long string still gets read. Otherwise, the last word does not get read fully.
        }
        return text;
    },

    getTTSPostscript: function() {
        var text = '';
        if (Util.Browser.isMac()) {
            text = " [[sync 0x000000A2]]"; // Adding the bookmarks so that in OS X, the      last portion of a long string still gets read. Otherwise, the last word does not get read fully.
        }
        return text;
    },

    getDisplayType: function(element) {
        if (element.nodeType != Node.ELEMENT_NODE) {
            return 'inline';
        }
        var cStyle = element.currentStyle || window.getComputedStyle(element, "");
        return cStyle.display;
    }

};