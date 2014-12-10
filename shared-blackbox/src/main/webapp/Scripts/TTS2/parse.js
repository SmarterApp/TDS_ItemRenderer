TTS = window.TTS || {};
TTS.Parse = window.TTS.Parse || {};

/*
*  ParseNode.  This object takes a dom node or a collection of dom nodes as input and creates a parse tree.  Each node of the tree has a DOM node and a "speakString". The
*  speakString is the text that this dom node will contribute to the overall text to be spoken.  The leaf nodes contain the actual text, and their parents simply node their
*  spans.  Hence, when we go to speak something that has been parsed, we assemble the speakString through depth-first recursion.  When we need to highlight, we know
*  where to highlight, because the parseNode knows how to translate between the position in the speakString and the position of the text within the speakable DOM node.
*  The tree structure allows us to very quickly find the node containing the word about to be spoken.
*
*  There are some complications here.  
*  1. At one points I thought that I had to remove extra spaces from the speak string.  Turns out, we were stripping them out before passing the string to the speech engine.
*     However, I left the code in there to do that.  CompoundSpeak is a text node that contains more than one sequential whitespace.  Those nodes are broken into a sequence
*     of parsenodes, with some containing only the multiple whitespaces (which, of course, do not contribute to the speakstring.
*  2. Most nodes that have been marked up for alternate pronounciation use the speak-as tag. However, images always use the alt tag.
*  3. Silence can be inserted as its own separate node
*  4. In most cases, there are different domNodes for different languages. Howeever, input nodes can accommodate multiple languages; hence the method nodeAccommodatesLanguage
*/

//endIndex = -1 means end at the end of the string. It is equivalent to endIndex = null
TTS.Parse.TTSNodeTypes = { Speak: 0, DoNotSpeak: 1, Alt: 2, CompoundSpeak: 3, ContainerWithPause: 4, Silence: 5, SpeakableInput: 6, Image: 7, Other: 8 };

TTS.Parse.ParseNode = function (lang, node, offset, startIndex, endOffset, doNotAssemble, insertPrecedingSpace) {

    var _lang = lang;
    var _ttsNodeType = TTS.Parse.TTSNodeTypes.Other;
    var _speakString = "";
    var _children = new Array();
    var _offset = ((offset == null) || !(offset)) ? 0 : offset;
    var _domNode = node;
    var _startIndex = (startIndex == null) ? 0 : startIndex; //this is the lowest index of the spoken string that is found in this node or its children
    var _endIndex = _startIndex; //this is the highest index of the spoken string that is found in this node or its children
    var _cutoff = null;
    var _prefix = '';
    var _postscript = '';
    if (!(endOffset) || (endOffset == -1)) {
        endOffset = null;
    }

    var isFirst = ((_offset == 0) && (endOffset == null));

    var Debug = function(string) {
        if (TTS.Config.Debug) {
            console.log(string);
        }
    };

    //TODO: NOTE: the current code assumes that stemTTS and illustrationTTS does not exist. 
    // this will have to be handled if these are encountered. Probably handle by hand-constructing a speak-as node.
    var assembleNode = function(node, isFirst) {
        _ttsNodeType = TTS.Parse.ParseNode.classifyTTSNode(node, _offset, isFirst);
        if (!TTS.Parse.nodeAccommodatesLanguage(node, _ttsNodeType, _lang)) {
            createParseNodeChildren(node, 0, _endIndex, insertPrecedingSpace);
            return;
        }

        var start = _endIndex;
        var child;
        var pn;
        switch (_ttsNodeType) {
            case TTS.Parse.TTSNodeTypes.Speak: //speak is a textNode, so just grab the text
                createSpeakableNode(node, _offset, endOffset, insertPrecedingSpace);
                Debug("start: " + _startIndex + " end: " + _endIndex + " " + _speakString);
                break;
            case TTS.Parse.TTSNodeTypes.Alt:
                _speakString = getSpeakAsText(node);
                _speakString = _speakString.replace(/\s{2,}/g, ' ').trim() + ' ';
                _speakString = TTS.Util.cleanText(_speakString);
                _endIndex = _startIndex + _speakString.length;
                Debug("start: " + _startIndex + " end: " + _endIndex + " " + _speakString);
                break;
            case TTS.Parse.TTSNodeTypes.Image:
                _speakString = getAltText(node);
                _speakString = _speakString.replace(/\s{2,}/g, ' ').trim() + ' ';
                _speakString = TTS.Util.cleanText(_speakString);
                _endIndex = _startIndex + _speakString.length;
                Debug("start: " + _startIndex + " end: " + _endIndex + " " + _speakString);
                break;
            case TTS.Parse.TTSNodeTypes.DoNotSpeak:
                _speakString = TTS.Util.cleanText(' {silence} ');
                _endIndex = _startIndex + _speakString.length;
                break;
            case TTS.Parse.TTSNodeTypes.CompoundSpeak: //why not add an end-at parameter for the parent node to accommodate selection?
                var nextStart = _startIndex;
                var offset = _offset;
                var speakText;
                if (!_cutoff) {
                    speakText = node.nodeValue.substring(_offset);
                } else {
                    speakText = node.nodeValue.substring(_offset, _cutoff);
                }
                var idx = speakText.search(/\s{2,}/);
                var idx2 = speakText.search(/\S+/);
                var i = 0;
                while ((idx > -1) || (idx2 > -1)) {
                    if (idx == 0) { //if this is one of the empty text blocks
                        if (idx2 == -1) {
                            pn = new TTS.Parse.ParseNode(_lang, node, offset, nextStart, -1);
                            speakText = '';
                        } else {
                            pn = new TTS.Parse.ParseNode(_lang, node, offset, nextStart, offset + idx2);
                            speakText = speakText.substring(idx2);
                            offset = offset + idx2;
                            nextStart = pn.getEndIndex();
                        }
                    } else { //this is a chunck with actual text
                        if (idx == -1) {
                            pn = new TTS.Parse.ParseNode(_lang, node, offset, nextStart, (!_cutoff) ? -1 : _cutoff);
                            speakText = '';
                        } else {
                            pn = new TTS.Parse.ParseNode(_lang, node, offset, nextStart, offset + idx);
                            speakText = speakText.substring(idx);
                            offset = offset + idx;
                            nextStart = pn.getEndIndex();
                        }
                    }
                    _children[i] = pn;
                    i = i + 1;
                    idx = speakText.search(/\s{2,}/);
                    idx2 = speakText.search(/\S+/);
                    _endIndex = pn.getEndIndex();
                }
                Debug("wrote a compound speak");
                break;
            case TTS.Parse.TTSNodeTypes.ContainerWithPause:
                createParseNodeChildren(node, Math.max(0, _offset - start), start, insertPrecedingSpace);
                _children[_children.length] = silentParseNode(_endIndex);
                _endIndex = _children[_children.length - 1].getEndIndex();
                break;
            case TTS.Parse.TTSNodeTypes.SpeakableInput:
                createSpeakableInputNode(node, _lang);
                break;
            case TTS.Parse.TTSNodeTypes.Other:
                createParseNodeChildren(node, Math.max(0, _offset - start), start, insertPrecedingSpace);
                break;
        }
    };

    var createParseNodeChildren = function(node, offset, start, insertSpace) {
        var insertSpace = (insertSpace || (TTS.Util.getDisplayType(node) == 'block'));
        var pn = null;
        var child;
        for (var i = 0; i < node.childNodes.length; i++) {
            child = node.childNodes[i];
            pn = new TTS.Parse.ParseNode(_lang, child, offset, start, null, false, insertSpace);
            _children[i] = pn;
            if (insertSpace) {
                if (pn.getStringLength() > 0) {
                    insertSpace = false;
                } else {
                    insertSpace = true;
                }
            }
            insertSpace = insertSpace || (TTS.Util.getDisplayType(child) == 'block') || $(child).hasClass('draggable');
            start = pn.getEndIndex();
            _endIndex = pn.getEndIndex();
            Debug("start: " + _startIndex + " end: " + _endIndex + " " + " chunk" + '--Dom Node--' + _domNode);
        }
    };

    var silentParseNode = function(start) {
        var pn = new TTS.Parse.ParseNode(_lang, null, 0, start, null, true, false);
        pn.setSpeakString(" {silence} ");
        return pn;
    };

    //todo: util.cleantext and util.addhacksAndTags should go be done here.
    var createSpeakableNode = function(node, offset, endOffset, insertPrecedingSpace) {
        _speakString = (insertPrecedingSpace) ? ' ' : '';
        if ((offset == 0) && (endOffset == null) && (node.nodeValue.search(/\S+/) > -1)) { //then this is a textNode without any embedded extra whitespace
            _speakString += node.nodeValue;
        } else {
            var substring = (endOffset == null) ? node.nodeValue.substring(offset) : node.nodeValue.substring(offset, endOffset);
            if (substring.search(/\S+/) > -1) { //you have a segment that contains text
                if (endOffset == null) {
                    _speakString += node.nodeValue.substring(offset);
                } else {
                    _speakString += node.nodeValue.substring(offset, endOffset);
                }
            } else { //this is a segment that contains just whitespace
                _speakString += " ";
            }
        }

        _speakString = TTS.Util.cleanText(_speakString);
        _endIndex = _startIndex + _speakString.length;
        if (insertPrecedingSpace) {
            _startIndex = _startIndex + 1;
        }
        Debug("Speakable Node: " + node.nodeValue + " _speakString: " + _speakString + " start: " + _startIndex + " end: " + _endIndex);
    };

    var createSpeakableInputNode = function(node, lang) {
        //In case, we have some input elements that need specific TTS prefixes spoken out,
        // the element may bring with it the TTS key to look up in the i18N infrastructure (MS for example)
        // Otherwise, we look up based on a key we make up (legacy MC)
        var val = node.getAttribute('value');
        var ttsKey = node.getAttribute('data-tts-prefix');
        if (ttsKey == null) {
            ttsKey = 'TDSTTS.Speak.Option' + val;
        }
        _speakString = TTS.Util.cleanText(Messages.getAlt(ttsKey + "." + lang, " "));
        _endIndex = _startIndex + _speakString.length;
        Debug("Speakable INPUT Node: " + node.nodeValue + " _speakString: " + _speakString + " start: " + _startIndex + " end: " + _endIndex + "-Dom-" + _domNode.nodeName);
    };

    this.CompileSpeakString = function() {
        var finalString = _prefix + _speakString;
        for (var i = 0; i < _children.length; i++) {
            var pn = _children[i];
            var string = pn.CompileSpeakString();
            finalString += string;
        }
        return finalString + _postscript;
    };

    this.getChildren = function() {
        return _children;
    };

    this.getEndIndex = function() {
        return _endIndex;
    };

    this.getStartIndex = function() {
        return _startIndex;
    };

    this.getChildCount = function() {
        return _children.length;
    };

    this.getNodeID = function() {
        return _domNode.id;
    };

    this.getOwnerDocument = function() {
        return _domNode.ownerDocument;
    };

    this.getStringLength = function() {
        return _endIndex - _startIndex;
    };

    //-----------------------------------------------
    //CAUTION: These functions mess with the internals of parsenodes and should not be used. I am using them for selections in order to simplify the code base
    //this is used by the selector to build a special type of parseNode for selections. It has the capacity to hose things up wildly, so you need
    //a really good reason to ever call these functions
    this.addChild = function(pn) {
        _children[_children.length] = pn;
        _endIndex = pn.getEndIndex();
    };

    //this is also used by the selector to ensure that the speaking stops at the end of the selection
    this.setCutoff = function(cutoff) {
        _cutoff = cutoff;
    };

    this.assembleNodeForSelector = function() {
        assembleNode(_domNode, true);
    };

    this.setEndIndex = function(idx) {
        _endIndex = idx;
    };

    this.setSpeakString = function(string) {
        _speakString = TTS.Util.cleanText(string);
        _endIndex = _startIndex + _speakString.length;
    };

    this.createSilentParseNode = function(start) {
        return silentParseNode(start);
    };

    //------------------------------------------------------------------ 
    var getSpeakAsText = function(node) {
        if (node.className && node.className.indexOf("TTS speakAs") >= 0) {
            return node.getAttribute('ssml_alias');
        }
    };

    var getAltText = function(node) {
        var txt = node.getAttribute('alt');
        return (txt) ? txt : '';
    };

    this.getLocation = function(idx, isStart) {
        if (idx < _startIndex) {
            return null;
        }
        if (isStart) {
            if (idx >= _endIndex) {
                return null;
            }
        } else if (idx > _endIndex) {
            return null;
        }
        if (_startIndex == _endIndex) {
            return null;
        }
        switch (_ttsNodeType) {
            case TTS.Parse.TTSNodeTypes.Speak:
                return new TTS.Parse.Location(_domNode, Math.min(idx - _startIndex + _offset, _domNode.nodeValue.length));
            case TTS.Parse.TTSNodeTypes.SpeakableInput:
            case TTS.Parse.TTSNodeTypes.Image:
            case TTS.Parse.TTSNodeTypes.Alt:
                return new TTS.Parse.Location(_domNode, null);
            default:
                for (var i = 0; i < _children.length; i++) {
                    var loc = _children[i].getLocation(idx, isStart);
                    if (loc != null) {
                        return loc;
                    }
                }
                return null;
        }
    };

    //this takes the text (previously generated by compileSpeakString()) and checks whether it contains something that might actually get vocalized
    this.containsSpeakableText = function(text) {
        if (!text) {
            text = this.CompileSpeakString();
        }
        var start = 0;
        if (_prefix) {
            start = _prefix.length;
        }
        var substring = text.substring(start);
        if (_postscript) {
            if (substring.length == _postscript.length) {
                return false;
            }
        }
        // Bug 115249 Remove silences before determining if text is speakable
        if (Util.Browser.isWindows()) {
            substring = substring.replace(/<silence msec="([0-9]+)"\/>/g, "");
        } else if (Util.Browser.isMac()) {
            substring = substring.replace(/\[\[slnc ([0-9]+)\]\]/g, "");
            substring = substring.substring(0, substring.length - _postscript.length);
        }
        var index = substring.search(/[\r\t ,.;()]*[a-zA-Z0-9]/g); //may need a better regex
        return (index > -1);
    };

    if (_startIndex == 0) {
        _prefix = TTS.Util.getTTSPrefix();
        _endIndex = _prefix.length;
        _postscript = TTS.Util.getTTSPostscript();
    }

    //module_tts wants to assemble a collection of nodes and pass it in. If that is the case, just create a top-level node and process them one at a time
    if (node && YAHOO.lang.isArray(node)) {
        _domNode = node[0]; //this is a hack because this needs some sort of node here
        var start = _endIndex;
        for (var i = 0; i < node.length; i++) {
            var next = node[i];
            var pn = new TTS.Parse.ParseNode(_lang, next, Math.max(0, _offset - start), start, null, false, true);
            _children[i] = pn;
            start = pn.getEndIndex();
            _endIndex = pn.getEndIndex();
            Debug("start: " + _startIndex + " end: " + _endIndex + " " + " Dom Node" + _domNode);
        }
        doNotAssemble = true;
    }
    
    if (!doNotAssemble) {
        assembleNode(node, isFirst);
    }
    return this;
};

TTS.Parse.ParseNode.classifyTTSNode = function (node, offset, isFirst) {
    if (node.nodeType == Node.ELEMENT_NODE) {
        if (node.className && node.className.indexOf("TTS speakAs") >=0) {
            return TTS.Parse.TTSNodeTypes.Alt;
        } else {
            var skip = node.getAttribute('data-tts-skip');
            if (skip && (skip == 'true')) {
                return TTS.Parse.TTSNodeTypes.DoNotSpeak;
            }
        }
        var nme = node.nodeName.toLowerCase();
        switch (nme) {
            case 'td':
            case 'th':
            case 'dt':
            case 'dd':
                return TTS.Parse.TTSNodeTypes.ContainerWithPause;
            case 'input':
                if (node.getAttribute('value') != null) {
                    return TTS.Parse.TTSNodeTypes.SpeakableInput;
                }
            case 'img':
            case 'math':
                return TTS.Parse.TTSNodeTypes.Image;
        }
    }
    if (node.nodeType == 3) {
        var idx = node.nodeValue.substring(offset).search(/\s{2,}\S/);
        if ((idx > -1) && isFirst) {
            return TTS.Parse.TTSNodeTypes.CompoundSpeak;
        } //multiple embedded spaces are removed by the speech engine and can cause you to lose track of where you are. Just remove them here and make them unspeakable
        return TTS.Parse.TTSNodeTypes.Speak; //should check this AFTER you check for things like speak alternate, I think
    }
    return TTS.Parse.TTSNodeTypes.Other;
};

TTS.Parse.ParseNode.getEnclosingAltNode = function(node) {
    if (!node) {
        return null;
    }
    if ((node.nodeType == Node.ELEMENT_NODE) && (node.className && node.className.indexOf("TTS speakAs") >= 0)) {
        return node;
    } else {
        return TTS.Parse.ParseNode.getEnclosingAltNode(node.parentNode);
    }
};

TTS.Parse.Location = function(node, offset) {
    var _node = node;
    var _offset = offset;

    this.getNode = function() {
        return _node;
    };
    this.getOffset = function() {
        return _offset;
    };
};

TTS.Parse.nodeAccommodatesLanguage = function(node, ttsNodeType, lang) {
    if (ttsNodeType == TTS.Parse.TTSNodeTypes.SpeakableInput) {
        return true;
    }
    var nodeLang = TTS.getInstance().getMarkedLanguage(node);
    return ((nodeLang != null) && (nodeLang == lang));
};