TTS = window.TTS || {};
TTS.Parse = window.TTS.Parse || {};

/** Hilight object.
*  Registers for the TTS events WORD and STOP.  With a WORD event, this receives the starting character of the string (see TTSParse.ParseNode), and searches the _speakString
* (the string that was passed by control to the speech engine) for a word boundary, starting at the designated character. It applies a span around any text within that area
* with the class designated as _textHighlighterClass.  It applies another class to existing image and input nodes as designated by  _nonTextHighlighterClass
*
* the extra spans around text are removed when the speech stops.
*/

TTS.Parse.Highlighter = function (doc) {

    var _textHighlighterClass = 'tts-highlight';
    var _nonTextHighlighterClass = 'tts-highlight';
    var _speakString = "";
    var _parseNodeRoot = null;
    var _document = doc ? doc : document;
    var _wordEndingPattern = null; //this defines word boundaries. It is set upon instantiation by call to getWordEndingPattern, which is currently a stub. 
    //getWordEndingPattern can be specialized to browsers or OSs if necessary without being too kludgy
    var _textClassApplier = rangy.createCssClassApplier(_textHighlighterClass, { normalize: true });
    var _currentRange = null;
    var _chromebookOffset = 0;
    var _prevStatus = null;

    var Debug = function(string) {
        if (TTS.Config.Debug) {
            console.log(string);
        }
    };

    /*
    * pn--the top-level parse node
    * start - the character in the _speakstring at which the word starts
    * end - the inferred end character of the string
    */
    var highliteRange = function (pn, start, end) {

        // check for valid arguments (in error logs they sometimes are null)
        if (pn == null || start == null || end == null) return;

        clearCurrentRange();
        start = pn.getLocation(start, true);
        
        // Bug 111824 end position was being set beyond the end of the spoken content
        // resulting in end = null, causing exceptions in following code
        var endIndex = pn.getEndIndex();
        end = end > endIndex ? endIndex : end;
        end = pn.getLocation(end, false);
		
        // Check that we can locate the start/end of the range - other wise, just skip this highlight event
		if(start == null || end == null) return;
		
        var ownerDoc = pn.getOwnerDocument();
        if (!ownerDoc) {
            ownerDoc = document;
        }
        _currentRange = rangy.createRange(ownerDoc);
        if (start.getOffset() != null) {
            _currentRange.setStart(start.getNode(), start.getOffset());
        } else {
            _currentRange.setStart(start.getNode());
        } //if you don't get an end, just set the end after the end of the start node
        if (end.getOffset() != null) {
            _currentRange.setEnd(end.getNode(), end.getOffset());
        } else {
            _currentRange.setEndAfter(end.getNode());
        }

        // Bug 113201 Only highlight the word if we are currently not paused
        var state = TTS.Manager.getStatus();
        if (state && state != TTS.Status.Paused) {
            highlightRange(_currentRange);
        }
    };

    var highlightRange = function (range) {
        var nodes = getHighlightRangeNodes(range);
        if (nodes.length == 0) { // Bug 127753 Only use rangy application if range is text
            _textClassApplier.applyToRange(range);
        } else {
            nodes.forEach(function (node) {
                YUD.addClass(node, _nonTextHighlighterClass);
            });
        }
    };

    var unhighlightRange = function (range) {
        var nodes = getHighlightRangeNodes(range);
        if (nodes.length == 0) { // Bug 127753 Only use rangy application if range is text
            _textClassApplier.undoToRange(range);
        } else {
            nodes.forEach(function (node) {
                YUD.removeClass(node, _nonTextHighlighterClass);
            });
        }
    };

    // nodes considered non-text
    var highlightNodeNames = ['img','math','input'];

    var getHighlightRangeNodes = function (range) {
        return range.getNodes([1],
            function (node) {
                var nodeName = node.nodeName.toLowerCase();
                return highlightNodeNames.filter(function(element){return element == nodeName;}).length > 0;  // nodename found in the list 
            });
    };

    var clearCurrentRange = function() {
        if (_currentRange == null) {
            return;
        }
        unhighlightRange(_currentRange);
        _currentRange = null;
    };

    // Bug 113201 Remove the highlight from current range when we are paused
    TTS.Manager.Events.onStatusChange.subscribe(function (currentStatus) {
        if (currentStatus && currentStatus == TTS.Status.Paused) {
            if (_currentRange != null) {
                unhighlightRange(_currentRange);
            }
        }
    });

    this.setSpeakString = function (speakString, pn) {
        _speakString = speakString;
        _parseNodeRoot = pn;
        
        // Bug 133270 Word index values returned by Chromebook v34 speech engine are offset from those used in tracking by the number of leading spaces + 1
        var leadingSpaces = _speakString.match(/^ +/) || [''];
        _chromebookOffset = leadingSpaces[0].length + 1;
    };

    this.highlightCallback = function (obj1) {
        if (!TTS.Config.isTrackingEnabled()) return;
        var start = parseInt(obj1.index); //this should be a function that figures out what is counted here. may depend on browser. this is the start tag
        if (Util.Browser.isChromeOS() && Util.Browser.getChromeVersion() >= 34) {
            start += _chromebookOffset;
        }
        var part = _speakString.substring(start);
        var match = _wordEndingPattern.exec(part);
        var end;
        if ((match != null) && (match.length > 0)) {
            end = start + match[0].length - 1;
            Debug('********' + match[0] + " start: " + start + " len: " + match[0].length + " string: " + part);
        } else {
            end = start + part.length;
            Debug("******** start: " + start + " string: " + part);
        }
        highliteRange(_parseNodeRoot, start, end);
    };

    this.statusChangeCallback = function (currentStatus) {
        if (!TTS.Config.isTrackingEnabled()) return;
        if (currentStatus == TTS.Status.Stopped) {
            clearCurrentRange();
            _speakString = ""; // NOTE FOR BRUCE: This had 'var' in front of it and we removed, same with line below.
            _parseNodeRoot = null;
        }
    };

    this.subscribe = function (eM) {
        if (eM) {
            if (eM.onWord) {
                eM.onWord.subscribe(this.highlightCallback);
            }
            if (eM.onStatusChange) {
                eM.onStatusChange.subscribe(this.statusChangeCallback);
            }
        }
    };

    this.unsubscribe = function (eM) {
        if (eM) {
            if (eM.onWord && this.highlightCallback) {
                eM.onWord.unsubscribe(this.highlightCallback);
            }
            if (eM.onStatusChange && this.statusChangeCallback) {
                eM.onStatusChange.subscribe(this.statusChangeCallback);
            }
        }
    };

    this.setTextHighlighterClass = function(name) {
        _textHighlighterClass = name;
        _textClassApplier = rangy.createCssClassApplier(_textHighlighterClass, { normalize: true });
    };

    this.setNonTextHighlighterClass = function (name) {
        _nonTextHighlighterClass = name;
    };

    var getWordEndingPattern = function () {
        //this is really a stub that can be changed to modify the pattern based on the browser, OS, or other things that may
        //influence the interpetation of word boundaries. This is only used for highlighting, so a mistake is very transient--the whole word might not
        // be highlighted.
        return new RegExp("[\s.;()]*[a-zA-Z0-9,\'\-]+[\r\t .:;()?]", 'm'); //this needs to be a much better regEx
    };

    _wordEndingPattern = getWordEndingPattern();
  
};