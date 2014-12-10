// This code is inspired by Google Closure:
// \closure\goog\spell\spellcheck.js
// \closure\goog\ui\abstractspellchecker.js
// \closure\goog\ui\richspellchecker.js

var SpellCheck = function(handler, node)
{
    this._handler = handler;
    this._rootNode = node;
    this._doc = Util.Dom.getOwnerDocument(node);
    this._elementsInserted = 0;
    this._wordElements = {};

    this._splitRegex = new RegExp(
        '([^' + SpellCheck.WORD_BOUNDARY_CHARS + ']*)' +
        '([' + SpellCheck.WORD_BOUNDARY_CHARS + ']*)', 'g');

    this.wordClassName = 'spellcheck-word';
    this.invalidWordCssText = 'background: yellow;';

    this.onCheckStart = new YAHOO.util.CustomEvent('onCheckStart', this, false, YAHOO.util.CustomEvent.FLAT);
    this.onCheckCompleted = new YAHOO.util.CustomEvent('onCheckCompleted', this, false, YAHOO.util.CustomEvent.FLAT);
    this.onDone = new YAHOO.util.CustomEvent('onDone', this, false, YAHOO.util.CustomEvent.FLAT);
    this.onWordChange = new YAHOO.util.CustomEvent('onWordChange', this, false, YAHOO.util.CustomEvent.FLAT);
}

SpellCheck.WordStatus =
{
    UNKNOWN: 0,
    VALID: 1,
    INVALID: 2,
    IGNORED: 3,
    CORRECTED: 4 // Temporary status, not stored in cache
};

SpellCheck.WORD_BOUNDARY_CHARS = '\t\r\n\u00A0 !\"#$%&()*+,\-.\/:;<=>?@\[\\\]^_`{|}~';

SpellCheck._KEY_PREFIX = ':';

// get all the misspelled word elements as an array
SpellCheck.prototype.getWordElements = function()
{
    var wordElements = [];

    for (var wordKey in this._wordElements)
    {
        Util.Array.each(this._wordElements[wordKey], function(wordElement)
        {
            wordElements.push(wordElement);
        });
    }

    return wordElements;
};

// check a HTML node for spelling errors and highlight them
SpellCheck.prototype.check = function()
{
    this.onCheckStart.fire();

    // get all the words
    var words = this._getWords(this._rootNode);

    var sc = this;

    // subscribe to when the dictionary done checking the words
    // Bug 108774 - subscriber used to be an anonymous function, and could not be properly unsubscribed
    this._handler.onDictionaryReady.subscribe(sc._onDictionaryReady, sc, true);

    // check words
    this._handler.lookupWords(words);
};

SpellCheck.prototype._onDictionaryReady = function()
{
    this._handler.onDictionaryReady.unsubscribe(this._onDictionaryReady);

    this._wordElements = {};
    this._elementsInserted = 0;
    this._processHtml(this._rootNode);
};

// finish spell check and remove highlight
SpellCheck.prototype.done = function()
{
    this._wordElements = {};
    this._elementsInserted = 0;
    this._restoreHtml(this._rootNode);
};

// get a list of words from an HTML node
SpellCheck.prototype._getWords = function(node)
{
    var words = [];

    while (node)
    {
        var next = this._nextNode(node);

        if (node.nodeType == Util.Dom.NodeType.TEXT)
        {
            if (node.nodeValue)
            {
                // parse words from text node
                var parsedWords = this._parseWords(node.nodeValue);

                // add words to main collection
                for (var i = 0; i < parsedWords.length; i++) words.push(parsedWords[i]);
            }
        }
        else if (node.nodeType == Util.Dom.NodeType.ELEMENT)
        {
            if (node.firstChild)
            {
                next = node.firstChild;
            }
        }

        node = next;
    }

    return words;
};

// parse words from text
SpellCheck.prototype._parseWords = function(text)
{
    var words = [];

    this._splitRegex.lastIndex = 0;
    var result;

    // use regex to split words
    while (result = this._splitRegex.exec(text))
    {
        if (result[0].length == 0) break;

        var word = result[1];

        if (word)
        {
            words.push(word);
        }
    }

    return words;
};

/**
* Processes nodes recursively.
*
* @param {Node} node Node where to start.
* @private
*/
SpellCheck.prototype._processHtml = function(node) // HTML
{
    while (node)
    {
        var next = this._nextNode(node);

        if (node.nodeType == Util.Dom.NodeType.TEXT)
        {
            var deleteNode = true;

            if (node.nodeValue)
            {
                var currentElements = this._elementsInserted;

                this._processText(node, node.nodeValue);

                // If we did not add nodes in processing, the current element is still
                // valid. Let's preserve it!
                if (currentElements == this._elementsInserted)
                {
                    deleteNode = false;
                }
            }

            if (deleteNode)
            {
                Util.Dom.removeNode(node);
            }

        }
        else if (node.nodeType == Util.Dom.NodeType.ELEMENT)
        {
            // If this is a spell checker element...
            if (node.className == this.wordClassName)
            {
                // First, reconsolidate the text nodes inside the element - editing
                // in IE splits them up.
                var runner = node.firstChild;

                while (runner)
                {
                    if (this._isTextLeaf(runner))
                    {
                        while (this._isTextLeaf(runner.nextSibling))
                        {
                            // Yes, this is not super efficient in IE, but it will almost
                            // never happen.
                            runner.nodeValue += runner.nextSibling.nodeValue;
                            Util.Dom.removeNode(runner.nextSibling);
                        }
                    }
                    runner = runner.nextSibling;
                }

                // Move its contents out and reprocess it on the next iteration.
                if (node.firstChild)
                {
                    next = node.firstChild;

                    while (node.firstChild)
                    {
                        node.parentNode.insertBefore(node.firstChild, node);
                    }
                }

                // get rid of the empty shell.
                Util.Dom.removeNode(node);
            }
            else
            {
                if (node.firstChild)
                {
                    next = node.firstChild;
                }
            }
        }

        node = next;
    }
};

/**
* Splits text into individual words and blocks of separators. Calls _processWord and _processRange methods.
*
* @param {Node} node Node containing text.
* @param {string} text Text to process.
* @protected
*/
SpellCheck.prototype._processText = function(node, text)
{
    this._splitRegex.lastIndex = 0;
    var stringSegmentStart = 0;

    var result;

    // use regex to split words
    while (result = this._splitRegex.exec(text))
    {
        if (result[0].length == 0) break;

        var word = result[1];

        if (word)
        {
            var status = this._handler.checkWord(word);

            if (status != SpellCheck.WordStatus.VALID)
            {
                var preceedingText = text.substr(stringSegmentStart, result.index - stringSegmentStart);

                if (preceedingText)
                {
                    this._processRange(node, preceedingText);
                }

                stringSegmentStart = result.index + word.length;

                this._processWord(node, word, status);
            }
        }
    }

    var leftoverText = text.substr(stringSegmentStart);

    if (leftoverText)
    {
        this._processRange(node, leftoverText);
    }

    return true;
};

// creates text node for a range of text
SpellCheck.prototype._processRange = function(node, text)
{
    // The text does not change, it only gets split, so if the lengths are the
    // same, the text is the same, so keep the existing node.
    if (node.nodeType == Util.Dom.NodeType.TEXT && node.nodeValue.length == text.length)
    {
        return;
    }

    node.parentNode.insertBefore(this._doc.createTextNode(text), node);
    this._elementsInserted++;
};

// creates element wrapper for a misspelled word
SpellCheck.prototype._processWord = function(node, word, status)
{
    // create span container
    var el = this._doc.createElement('a');

    // set style
    el.setAttribute('id', this.wordClassName + '-' + YUD.generateId());
    el.setAttribute('href', '#');
    // el.setAttribute('style', (status == SpellCheck.WordStatus.INVALID) ? this.invalidWordCssText : '');

    // set class
    YUD.addClass(el, this.wordClassName);

    // set text
    el.appendChild(this._doc.createTextNode(word));

    // register word in collection
    this._registerWordElement(word, el);

    // add node
    node.parentNode.insertBefore(el, node);

    this._elementsInserted++;
};

/**
* Processes nodes recursively, removes all spell checker markup, and
* consolidates text nodes.
*
* @param {Node} node node on which to recurse.
* @private
*/
SpellCheck.prototype._restoreHtml = function(node) // restoreNode
{
    while (node)
    {
        // Contents of the child of the element is usually 1 text element, but the
        // user can actually add multiple nodes in it during editing. So we move
        // all the children out, prepend, and reprocess (pointer is set back to
        // the first node that's been moved out, and the loop repeats).
        if (node.nodeType == Util.Dom.NodeType.ELEMENT && node.className == this.wordClassName)
        {
            var firstElement = node.firstChild;
            var next;
            for (var child = firstElement; child; child = next)
            {
                next = child.nextSibling;
                node.parentNode.insertBefore(child, node);
            }
            next = firstElement || node.nextSibling;
            Util.Dom.removeNode(node);
            node = next;
            continue;
        }

        // If this is a chain of text elements, we're trying to consolidate it.
        var textLeaf = this._isTextLeaf(node);

        if (textLeaf)
        {
            var textNodes = 1;
            var next = node.nextSibling;

            while (this._isTextLeaf(node.previousSibling))
            {
                node = node.previousSibling;
                ++textNodes;
            }

            while (this._isTextLeaf(next))
            {
                next = next.nextSibling;
                ++textNodes;
            }

            if (textNodes > 1)
            {
                // use in reassembly of the original text
                var workBuffer = [];

                workBuffer.push(node.nodeValue);

                while (this._isTextLeaf(node.nextSibling))
                {
                    workBuffer.push(node.nextSibling.nodeValue);
                    Util.Dom.removeNode(node.nextSibling);
                }

                node.nodeValue = workBuffer.join('');
            }
        }

        // Process child nodes, if any.
        if (node.firstChild)
        {
            this._restoreHtml(node.firstChild);
        }

        node = node.nextSibling;
    }
};

/**
* Replaces a highlighted elements old word with a new one.
*
* @param {Element} el An element wrapping the word that should be replaced.
* @param {string} old Word that was replaced.
* @param {string} word Word to replace with.
*/
SpellCheck.prototype.replaceWord = function(el, old, word)
{
    if (old == word) return;

    Util.Dom.setTextContent(el, word);

    // var status = this.handler_.checkWord(word);
    var status = SpellCheck.WordStatus.VALID;

    // Avoid potential collision with the built-in object namespace. For
    // example, 'watch' is a reserved name in FireFox.
    var oldIndex = SpellCheck._toInternalKey(old);
    var newIndex = SpellCheck._toInternalKey(word);

    // Remove reference between old word and element
    var elements = this._wordElements[oldIndex];
    Util.Array.remove(elements, el);

    if (status != SpellCheck.WordStatus.VALID)
    {
        // Create reference between new word and element
        if (this._wordElements[newIndex])
        {
            this._wordElements[newIndex].push(el);
        }
        else
        {
            this._wordElements[newIndex] = [el];
        }
    }

    // Update element based on status.
    this.updateElement(el, word, status);

    this.onWordChange.fire(
    {
        element: el,
        word: word,
        status: status
    });
};

/**
* Updates element based on word status. Either converts it to a text node, or
* merges it with the previous or next text node if the status of the world is
* VALID, in which case the element itself is eliminated.
*
* @param {Element} el Word element.
* @param {string} word Word to update status for.
* @param {SpellCheck.WordStatus} status Status of word.
* @protected
*/
SpellCheck.prototype.updateElement = function(el, word, status)
{
    if (status == SpellCheck.WordStatus.VALID)
    {
        this.removeMarkup(el);
    }
    else
    {
        Util.Dom.setProperties(el, this.getElementProperties(status));
    }
};

/**
* Removes spell-checker markup and restore the node to text.
*
* @param {Element} el Word element. MUST have a text node child.
* @protected
*/
SpellCheck.prototype.removeMarkup = function(el)
{
    var firstChild = el.firstChild;
    var text = firstChild.nodeValue;

    if (el.nextSibling && el.nextSibling.nodeType == Util.Dom.NodeType.TEXT)
    {
        if (el.previousSibling && el.previousSibling.nodeType == Util.Dom.NodeType.TEXT)
        {
            el.previousSibling.nodeValue = el.previousSibling.nodeValue + text + el.nextSibling.nodeValue;
            Util.Dom.removeNode(el.nextSibling);
        }
        else
        {
            el.nextSibling.nodeValue = text + el.nextSibling.nodeValue;
        }
    }
    else if (el.previousSibling && el.previousSibling.nodeType == Util.Dom.NodeType.TEXT)
    {
        el.previousSibling.nodeValue += text;
    }
    else
    {
        el.parentNode.insertBefore(firstChild, el);
    }

    Util.Dom.removeNode(el);
};

/**
* Handles word change events and updates the word elements accordingly.
*
* @param {goog.spell.SpellCheck.WordChangedEvent} event The event object.
* @private
*/
/*
SpellCheck.prototype.onWordChanged = function(word, status)
{
    // Avoid potential collision with the built-in object namespace. For
    // example, 'watch' is a reserved name in FireFox.
    var index = SpellCheck._toInternalKey(word);
    var elements = this._wordElements[index];

    if (elements)
    {
        for (var el, i = 0; el = elements[i]; i++)
        {
            this.updateElement(el, word, status);
        }
    }
};
*/

/**
* Stores a reference to word element.
*
* @param {string} word The word to store.
* @param {HTMLSpanElement} el The element associated with it.
* @private
*/
SpellCheck.prototype._registerWordElement = function(word, el)
{
    // Avoid potential collision with the built-in object namespace. For
    // example, 'watch' is a reserved name in FireFox.
    var index = SpellCheck._toInternalKey(word);

    if (this._wordElements[index])
    {
        this._wordElements[index].push(el);
    }
    else
    {
        this._wordElements[index] = [el];
    }
};

/**
* Converts a word to an internal key representation. This is necessary to
* avoid collisions with object's internal namespace. Only words that are
* reserved need to be escaped.
*
* @param {string} word The word to map.
* @return {string} The index.
* @private
*/
SpellCheck._toInternalKey = function(word)
{
    if (word in Object.prototype)
    {
        return SpellCheck._KEY_PREFIX + word;
    }

    return word;
};

/*************/
/* HTML CODE */
/*************/

/**
* Finds next node in our enumeration of the tree.
*
* @param {Node} node The node to which we're computing the next node for.
* @return {Node} The next node or null if none was found.
* @private
*/
SpellCheck.prototype._nextNode = function(node) // HTML
{
    while (node != this._rootNode)
    {
        if (node.nextSibling)
        {
            return node.nextSibling;
        }
        
        node = node.parentNode;
    }

    return null;
};

/**
* Determines if the node is text node without any children.
*
* @param {Node} node The node to check.
* @return {boolean} Whether the node is a text leaf node.
* @private
*/
SpellCheck.prototype._isTextLeaf = function(node) // HTML
{
    return node != null && node.nodeType == Util.Dom.NodeType.TEXT && !node.firstChild;
};

/**
* Returns desired element properties for the specified status.
*
* @param {goog.spell.SpellCheck.WordStatus} status Status of the word.
* @return {Object} Properties to apply to word element.
* @protected
*/
SpellCheck.prototype.getElementProperties = function(status)
{
    return {
        'class': this.wordClassName,
        'style': (status == SpellCheck.WordStatus.INVALID) ? this.invalidWordCssText : ''
    };
};



