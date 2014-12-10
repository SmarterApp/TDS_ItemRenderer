//Main class that handles everything needed to address a keyboard based item such as wordbuilder
function WordBuilder(keyboardDiv, textfield) {

    this._keyboard = keyboardDiv;
    this._textfield = textfield;
    this._keyLinkToValueMap = new Object();  //Maps on-screen key to the corresponding value to send to the text field.    
    this._allowedKeyCodesMap = new Object(); //Collection of permitted keycodes that we can pass through to the text field
    this._allowedCharCodesMap = new Object(); //Collection of permitted charcodes that we can pass through to the text field
    
    // Lets include some well known keys that would be useful in dealing with WB items
    this._allowedKeyCodesMap['8']="OK";  // backspace key
    this._allowedKeyCodesMap['9']="OK";  // tab key (for student site)
    this._allowedKeyCodesMap['46']="OK"; // delete key
    this._allowedKeyCodesMap['37']="OK"; //left arrow
    this._allowedKeyCodesMap['38']="OK"; //up arrow
    this._allowedKeyCodesMap['39']="OK"; //right arrow
    this._allowedKeyCodesMap['40']="OK"; //down arrow
     
    //Installs the keyboard handler and sets up the datastructures used
    this.activate = function()
    {
        if (!this._textfield) this._textfield = this._getAssociatedTextField();

        //Get each key on that keyboard and set the click handler
        var keyContainers = this._keyboard.getElementsByTagName('li');
        var allowableKeysArray = [];
        for (var i = 0; i < keyContainers.length; i++) {
            var keyValue = this._getText(YAHOO.util.Dom.getElementsByClassName('keyvalue', 'span', keyContainers[i])[0]);
            var keyLink = keyContainers[i].getElementsByTagName('a')[0];
            var keyDisplay = this._getText(keyLink);
            allowableKeysArray.push(keyDisplay);
            var success = YAHOO.util.Event.addListener(keyLink, 'click', this._keyboardClick, null, this);

            // update the various maps with the value that needs to be used when that link/key is clicked
            this._keyLinkToValueMap[keyLink.id] = keyValue;
            if (keyDisplay.length == 1) {  //If it is a single character value,
                this._allowedCharCodesMap[keyDisplay.toUpperCase().charCodeAt()+'']="OK";
                this._allowedCharCodesMap[keyDisplay.toLowerCase().charCodeAt()+'']="OK";
            }
            if (keyDisplay.toLowerCase() == 'space') {  //Special case handling for Space key
                this._allowedCharCodesMap['32']="OK";
                this._allowedKeyCodesMap['32']="OK";                
            }          
        }

        // add instructions
        var instructions;
        if ($(keyboardDiv).hasClass('fullsize')) {
            instructions= Messages.getAlt('WB.Accessible.LetterKeys', 'Use the letter keys on your keyboard to answer the question.');
        } else {
            instructions = Messages.getAlt('WB.Accessible.AllowableKeys', 'Use the following keys on your keyboard to answer the question: ');
            instructions += allowableKeysArray.join(', ');
        }
        this._textfield.setAttribute('aria-label', instructions);

        // make required
        this._textfield.setAttribute('aria-required', 'true');
        
        //Hookup to the text field for key events        
        YAHOO.util.Event.addListener(this._textfield, 'keypress', this._keyboardClick2, this, true);

        /*
        NOTE: This is disabled because "on iPAD as inserts are always go to the head of the field. "
        // For touch screen devices, prevent the onscreen keyboard from popping up since we have our own custom on screenkeyboard
        if (keyContainers.length > 0 && // check that we have a custom keyboard to show
           "ontouchstart" in window)  // check that we are on a touch screen device
        {
            YAHOO.util.Dom.setAttribute(this._textfield, 'readonly', true);
        } 
        */
    };
    
    // Gets the text field that is associated with the onscreen keyboard (in case there are multiple items of this type on a page)
    this._getAssociatedTextField = function() {
        var containerDiv = YAHOO.util.Dom.getAncestorByClassName(this._keyboard, 'itemContainer');
        var textfields = YAHOO.util.Dom.getElementsByClassName('inputCloze', 'input', containerDiv);
        return textfields[0];
    };

    this._getAssociatedStem = function() {
        var containerDiv = YAHOO.util.Dom.getAncestorByClassName(this._keyboard, 'itemContainer');
        var stem = YAHOO.util.Dom.getElementsByClassName('stemContainer', 'div', containerDiv);
        return stem[0];
    };

    this._simulate_key = function(type, ctrlKey, altKey, shiftKey, keyCode, charCode) {
        var textFieldValueBeforeKeyPress = this._textfield.value;
        try {
            YAHOO.util.UserAction.simulateKeyEvent(this._textfield, type, true, true, null, ctrlKey, altKey, shiftKey, false, keyCode, charCode);
        } catch (ex) {
            return false;
        }
        // If the keypress did something, the textfield value should have changed. Otherwise treat the keypress as not having worked
        return (this._textfield.value != textFieldValueBeforeKeyPress);
    };
    
    // Handler for clicks on the on-screen keyboard
    this._keyboardClick = function(event) 
    {
        YAHOO.util.Event.stopEvent(event);
        var linkClicked = YAHOO.util.Event.getTarget(event);
        var value = this._keyLinkToValueMap[linkClicked.id];
        
        // if we are in read only mode then do not insert character
        if (ContentManager.isReadOnly()) return;

        if (value.toLowerCase() == "delete") 
        {
            if (!this._simulate_key('keypress', false, false, false, 8, 0)) // If we can't simulate event, we'll do it the hard way
            {
                this._deleteFromTextField();  // this is used mainly for IE or older Safari
            }
        } 
        else 
        {
            // special case handling in cases where there is only 1 char allowed to be in the text field
            // We want to remove any existing character that may be there to replace with the one just selected
            if (parseInt(this._textfield.maxLength) == 1) {
                this._textfield.value = "";
            }
            if (!this._simulate_key('keypress', false, false, false, null, value.charCodeAt())) // If we can't simulate event, we'll do it the hard way
            {
                this._appendToTextField(value); // this is used mainly for IE or older Safari
            }
        }
    };
    
    // Handler for clicks on the physical keyboard
    this._keyboardClick2 = function(key) {

        // It looks like charCode is not very reliably available for key events. So we need this hack.
        var charCode = key.charCode;
        if (!charCode || charCode == 0) {
            charCode = String.fromCharCode(key.keyCode).charCodeAt();
        }
        
        if (key.ctrlKey                //Fix to bug#12361
            || this._allowedCharCodesMap[charCode + '']
            || (key.charCode == 0 && this._allowedKeyCodesMap[key.keyCode + '']))  // fix for bug# 60568
        {
            return true; //Letting through the legit key presses
        }

        /* Removing Hack as this is causing issues on webkit browsers (see issue 60568)
        // HACK: this is for checking the number pad
        if (key.keyCode >= 96 && key.keyCode <= 105) {
            // convert the num pad keycode to a regular num keycode
            var numPadKeyCode = (key.keyCode * 1) - 48;
            charCode = String.fromCharCode(numPadKeyCode).charCodeAt();

            if (this._allowedCharCodesMap[charCode + '']) {
                return true;
            }
        }
        */

        // HACK: this is for checking the period key
        if ((!key.shiftKey && key.keyCode == 190) /* regular '.' (without shift) */ || (key.keyCode == 110 && charCode == 46) /* num pad '.' */) {
        
            if (this._allowedKeyCodesMap['46']) {
                return true;
            }
        }

        YAHOO.util.Event.stopEvent(key);
        return false;
    };

    // Append to the textfield. Limit to the maxlenght specificed (if specified)
    this._appendToTextField = function(valueToInsert) {        
        if (valueToInsert) {
            var cursorPosition = this._getCursorPosition();   //Current position of the cursor
            if ((parseInt(this._textfield.maxLength) != -1) && (this._textfield.value.length >= parseInt(this._textfield.maxLength))) {
                this._textfield.value = this._textfield.value.substr(0, this._textfield.value.length - 1) + valueToInsert;
                this._setCursorPosition(this._textfield.value.length); //Set the cursor position to the end since we have no more space for characters
            } else {
                //Insert the character at the cursor location                                 
                this._textfield.value = this._textfield.value.substr(0, cursorPosition) 
                                        + valueToInsert 
                                        + this._textfield.value.substr(cursorPosition, this._textfield.value.length);
                                        
                //Set the cursor to where it should be now                                        
                if(cursorPosition == this._textfield.value.length-1)
                {
                    this._setCursorPosition(this._textfield.value.length);
                } else 
                {
                    this._setCursorPosition(cursorPosition+1);
                }                                                            
            }                       
        }
        
        ContentManager.focus(this._textfield);
    };

    // Delete character from the text field    
    this._deleteFromTextField = function() {        
        if (this._textfield.value.length > 0) {
            var cursorPosition = this._getCursorPosition();
            this._textfield.value = this._textfield.value.substr(0, cursorPosition-1) + this._textfield.value.substr(cursorPosition, this._textfield.value.length);
            if(cursorPosition-1 < this._textfield.value.length)
            {
                this._setCursorPosition(cursorPosition-1);
            }
        }
        
        ContentManager.focus(this._textfield);
    };
    
    // IE/FF compatibility function for retrieving the text associated with an element.
    this._getText = function(element) {
        if (element.text) {
            return element.text;
        } else if (element.innerText) {
            return element.innerText;
        }
        return element.innerHTML;
    };   
    
    // Get the current cursor position within the text field
    this._getCursorPosition = function() {
    	var CaretPos = 0;	// IE Support
    	if (document.selection) {
            this._textfield.focus ();
    		var Sel = document.selection.createRange ();
    		var SelLength = document.selection.createRange().text.length;
    		Sel.moveStart ('character', -this._textfield.value.length);
    		CaretPos = Sel.text.length - SelLength;
    	}
    	// Firefox support
    	else if (this._textfield.selectionStart || this._textfield.selectionStart == '0')
    	{
    		CaretPos = this._textfield.selectionStart;
    	}
    	return (CaretPos);
    };
    
    //Set the cursor position within the text field
    this._setCursorPosition = function(pos) 
    {
        ContentManager.focus(this._textfield);
         
        if (this._textfield.setSelectionRange) {                       
            this._textfield.setSelectionRange(pos, pos);
        }
        else if (this._textfield.createTextRange) {
            var range = this._textfield.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    };     
}
