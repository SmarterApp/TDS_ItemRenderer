/// <reference path="Libraries/yahoo.js" />
/// <reference path="Libraries/dom.js" />
/// <reference path="Libraries/event.js" />
/// <reference path="Libraries/selector.js" />

/*
*
@BASIC EXAMPLE: 
var LR = new TDS.LineReader(element);

@IFRAME EXAMPLE -- IF SUBMITTING AN ELEMENT IN AN IFRAME, ALSO SUBMIT IFRAME WINDOW OBJECT
var LR = new TDS.LineReader(element,winFrame);

@SETTINGS EXAMPLE -- SUBMIT YOUR CUSTOM SETTINGS
var settings = {
		lineColor: '#0ff',
		lineBorder: 'none',
		lineID: '#theLine',
		lineZIndex: '-1',
		debug: true,
		onLineMove: null};//SUBMIT METHOD TO LISTEN FOR LINE MOVE
var LR = new TDS.LineReader(element,settings);

@IGNORE ELEMENTS EXAMPLE
var ignoreThese = document.getElementsByTagName('li'); //MUST BE NODELIST/HTML COLLECTION, NOT SIMPLE ARRAY
var LR = new TDS.LineReader(element,ignoreThese);

@CUSTOM PARSER EXAMPLE - CREATE YOUR OWN PARSERS FOR HANDELING SPECIFIC ELEMENTS
var custParser1 = new TDS.LineReader.Parser('NODE NAME e.g. TD, A, HR...etc'); //CAN BE COMMA DELIMITED LIST OF NODE NAMES
custParser1._criteria = {}; //FUNCTION(ELEMENT){ MATCHING CRITERIA RETURN TRUE/FALSE }
custParser1._onClick = {}; //FUNCTION(EVENT){ DO SOMETHING WHEN OBJECT IS CLICKED}
custParser1._onLineEnter = {};//FUNCTION(EVENT){ AS THE LINE IS MOVED WITH THE ARROW KEYS-DO THIS WHEN THIS ELEMENT IS ACTIVE };
custParser1._onLineExit = {};//FUNCTION(EVENT){AS LINE MOVES AWAY DO SOMETHING HERE. Usually, turn off line}

var custParser2 = new TDS.LineReader.Parser('NODE NAME e.g. TD, A, HR...etc'); //CAN BE COMMA DELIMITED LIST OF NODE NAMES
custParser2._criteria = {}; //FUNCTION(ELEMENT){ MATCHING CRITERIA RETURN TRUE/FALSE }
custParser2._onClick = {}; //FUNCTION(EVENT){ DO SOMETHING WHEN OBJECT IS CLICKED}
custParser2._onLineEnter = {};//FUNCTION(EVENT){ AS THE LINE IS MOVED WITH THE ARROW KEYS-DO THIS WHEN THIS ELEMENT IS ACTIVE };
custParser2._onLineExit = {};//FUNCTION(EVENT){AS LINE MOVES AWAY DO SOMETHING HERE. Usually, turn off line}

var LR = new TDS.LineReader(element,[custParser1,custParser2]);//PARSERS MUST BE IN ARRAY

@@PUBLIC METHODS
var LR = new TDS.LineReader(element);
@REFRESH - RE-INITIALIZES LINE READER - DOES NOT CLEAR SETTINGS, IGNORE LIST, OR PARSERS
LR.refresh(); 

@DISPOSE - TURNS LINE READER OFF - REMOVES EVENTS AND DOM OBJECTS. DOES NOT CLEAR SETTINGS OR IGNORE LIST
LR.dispose();

@ApplySettings - APPLYS SUBMITTED SETTIGNS OBJECT - CALLS DISPOSE AND INITIALIZE
LR.applySettings(settings);

@Parsers - AN ARRAY OF PARASERS LOADED
LR.parsers;

@AddParsers - ADD A PARSER AFTER INTIAL LOAD - - CALLS DISPOSE AND INITIALIZE
LR.addParser(custParser1);
*/


//NAME SPACE
var TDS = window.TDS || {};
TDS.LineReaderControl = {
    Instance: null,
    toggle: function(){
      if(!TDS.LineReaderControl.Instance){
          TDS.LineReaderControl.on();
      }else{
          TDS.LineReaderControl.off();
      }
    },
    on: function(el){
        if(!TDS.LineReaderControl.Instance){
            var page = ContentManager.getCurrentPage();
            if(page){
              page.disableScroll();
            }
            var el = YAHOO.util.Selector.query("#contents")[0];

            var root     = YAHOO.util.Selector.query('.showing'); //Active passage
            var passages = YAHOO.util.Selector.query('.thePassage,.theQuestions', root[0]);
            var stems    = YAHOO.util.Selector.query('.stemContainer', root[0]);

            var fin = YAHOO.lang.isArray(el) ? el : passages.concat(stems);
            var lr = new TDS.LineReader(fin);
            lr.selectFirst();

            TDS.LineReaderControl.Instance =  lr;
        }
    },
    off: function(){
        if(TDS.LineReaderControl.Instance){
            if(window.ContentManager){
                var page = ContentManager.getCurrentPage();
                if(page){
                  page.enableScroll();
                }
            }
            TDS.LineReaderControl.Instance.dispose();
            delete TDS.LineReaderControl.Instance;
            TDS.LineReaderControl.Instance = null;
        }
    },
    reset: function(){
        if (TDS.LineReaderControl.Instance) {
            TDS.LineReaderControl.off();
            TDS.LineReaderControl.on();
        }
    },
    setupEvents: function(){
        if(window.ContentManager){
            ContentManager.onItemEvent('zoom', TDS.LineReaderControl.reset);
            ContentManager.onItemEvent('hide', TDS.LineReaderControl.off);
            ContentManager.onPageEvent('hide', TDS.LineReaderControl.off);
            ContentManager.onEntityEvent('menushow', TDS.LineReaderControl.off);
        }
    }
};

//Only search under: stemContainer, thePassage
YAHOO.util.Event.onDOMReady(function(){
    TDS.LineReaderControl.setupEvents();
});

//CONSTRUCTOR
TDS.LineReader = function (el) {

	//LINE HEIGHT TO FONT SIZE RATIO
    var LHR = 1.25,
        DEBUG_LINE_CLASS = 'LINERREADERDEBUGLINE',
        AUTOSCROLL_TOLERANCE = 44;//THE DISTANCE FROM THE BOTTOM OF THE PAGE TO SCROLL THE PAGE UP.
	
	//*********PROPERTIES*********//
	var that = this;
	this.TheLine;					//THE ACTUAL LINE ELEMENT IS REFERENCED
	this._parsers = [];				//AN ARRAY OF PARSERS
	this._arguments = arguments;    //SUBMITTED PARAMETERS
	this._linesList = [];			//AN ARRAY OF ALL FOUND LINES ON THE PAGE
	this._parentContainers;         //A REFERENCE TO THE SINGLE SUBMITTED 
	this._textContainers = [];      //AN ARRAY OF FOUND ELEMENTS THAT ARE TO CONTAIN
	this._ignoreContainers = [];    //AN ARRAY OF SUBMITTED ELEMENTS TO BE IGNORED
	this._scrollableContainers = [];//AN ARRAY OF FOUND ELEMENTS THAT ARE SCROLLABLE 
	this._parentWindow = window;    //THE WINDOW OBJECT
	this._activeLineIndex = -1;     //THE ACTIVE INDEX OF THE _linesList[]
	this._savedBackgroundColor = 'transparent';//SAVED BG COLOR OF ACTIVE OBJECT
	this._bgActiveClassName = 'TDS_Line_Reader_bgActive';//ELEMENT HAS CHILDNODE OF IMG OR MATH, WE HIGHLIGHT THE BACKGROUND OF IT INSTEAD OF ADDING THE LINE ELEMENT
	//*********END PROPERTIES*********//


	//*******CUSTOM EVENTS***********//
	this._onLineMove =  new YAHOO.util.CustomEvent('onLineMove');
	

	//*********OBJECTS*********//
	//SETTINGS
	this._settings = {
	    lineColor: 'rgba(0, 191, 243, 0.2)',
		lineBorder: 'none',
		lineID: '#theLine',
		lineZIndex: '-1',
		debug: false,
		onLineMove: null
	};
	//LINE OBJECT - STORED IN _linesList[]
	this.line = function () {
		this.element = null;//REFERENCE TO TEXT CONTAINER ELEMENT
		this.top = 0;		//TOP POSITION RELATIVE TO ITS PARENT TEXT CONTAINER
		this.width = 0;		//WIDTH 
		this.height = 0;	//HEIGHT
		this.bottom = 0;	//BOTTOM OF LINE
	};
	//*********END OBJECTS*********//

    //*********PROCESS METHODS*********//

    // the paragragh element has one single image/math element, or at most with a <br> with it
	this._hasSingleImageOrMath = function (parEl) {

	    var imgLen = $('img', parEl).length,
            mathLen = $('math', parEl).length,
	        brCount = $('br', parEl).length,
            childrenCount = $(parEl).children().length;

	    if ($(parEl).is('p') && (childrenCount == 1 || (childrenCount == 2 && brCount == 1)) && (imgLen == 1 || mathLen == 1)) {
	        return true;
	    } else {
	        return false;
	    }
	};

    // image/math element size is reasonable forthe line reader (between line height and 2 * ling height)
	this._hasFitImageOrMath = function (parEl, lnHeight) {

	    var img = $('img', parEl),
	        math = $('math', parEl),
	        imgLen = img.length,
            mathLen = math.length,
	        imgHeight = imgLen == 1 ? img[0].clientHeight : null,
	        mathHeight = mathLen == 1 ? math[0].clientHeight : null,
            heightLimit = lnHeight * 2;

        if (imgHeight > heightLimit || mathHeight > heightLimit) {
            return false;
        } else {
            return true;
        }
    };
    
	//SEARCH SUBMITTED ELEMENT FOR TEXT CONTAINERS
	this._findElements = function (el) {
        
		var _foundElementsArray = [];
		var _criteria = function (x) {

		    if ($(x).closest('div.itemContainer.hiding').length ||  // make sure CM hasn't hidden the item container
                $(x).closest('.lr-skip').length > 0) {    // make sure to exclude the 'lr-skip' widget
		        return false;
		    }

		    //IS ELEMENT SCROLLABLE? YES, SAVE REFERENCE TO IT.
		    //BUG 109466 YUD.getStyle crashes the script in SB when given a non-standard tag like <math>
		    var overflow = $(x.parentNode).css('overflow').toLowerCase();
		    if (overflow === 'auto' || overflow === 'scroll') {
		    	that._scrollableContainers.push(x.parentNode);
		    }
		    overflow = null;
				
		    //FIND ELEMENT SPECIFIC CRITERIA PARSER
		    var p = that._get_parser(x.nodeName);
				if (p) {
		    	return p._criteria.call(that, x); //CALL FOUND PARSER
		    } else {
				//IF NO PARSER
		    	return false;
		    }
		},
		_saveElementToTextContainers = function (x) { //Passed test
            if (that._ignoreContainers.indexOf(x) === -1 && _foundElementsArray.indexOf(x) === -1) { 
                _foundElementsArray.push(x);
            }
		};

		//SEARCH AND SAVE
		YAHOO.util.Dom.getElementsBy(
            _criteria,	//SEARCH CRITERIA
            '',			//ALT ROOT ELEMENT
            el,			//ROOT ELEMENT
			_saveElementToTextContainers
        );              //SAVE ALL MATCHING ELEMENTS

		return _foundElementsArray;
	};
	//GIVEN AN ELEMENT - CREATE POSSIBLE LINES IN THAT ELEMENT - SAVE THEM TO ._linesList[]
	this._processElement = function (el) {
		//BUILD LINE OBJECTS
        //FIND PARSER THAT MATCHES NODE TYPE
        var p = that._get_parser(el.nodeName);
        if (p && p._processLines instanceof Function) {
			  p._processLines.call(this,el);
		}

	};
    this._selectLineAt = function(index){
        if(this._linesList){
            if(index >= 0 && index < this._linesList.length){
                var l = this._linesList[index];
			    this._activeLineIndex = this._linesList.indexOf(l);
			    this._moveLine(l);
            }
        }
    };
	//GIVEN A TEXT CONTAINER AND A "Y" COORD, RETURN A LINE FROM _linesList[]
	this._findLine = function (el, Y) {
		for (var i = 0; i < this._linesList.length; i++) {
			var l = this._linesList[i];
			if ((l.element === el ||
                (($(el).is('img') || $(el).is('math')) && $(l.element).has(el).length == 1))
                && (l.top < Y && l.bottom > Y)) {
				return l;
			}
		}
		return null;
	};

    //GIVEN A LINE OBJECT, APPLY TO DOM LINE OBJECT this.TheLine
    // @direction: indicate if the line is going 'up' or 'down', when click or other case without up/down key press, it will be undefined
	this._moveLine = function (line) {
	    if (line) {
	        var le = $(line.element);

            // if there is only one <img>/<math> element in the current paragraph, then deal with the <p> element instead of using that line <div>
	        if (this._hasSingleImageOrMath(line.element)) {

	            // hide current line <div>
	            if ($(this.TheLine).is(':visible')) {
	                $(this.TheLine).hide();
	            }                     

                // remove the highlighten line and hightlight 'this' line
                $('.' + this._bgActiveClassName).removeClass(this._bgActiveClassName);
                le.addClass(this._bgActiveClassName);

	        } else {
                var elY = YAHOO.util.Dom.getXY(line.element)[1];

                $('.' + this._bgActiveClassName).removeClass(this._bgActiveClassName);

                YAHOO.util.Dom.setStyle(this.TheLine, 'top', line.top + 'px');
                YAHOO.util.Dom.setStyle(this.TheLine, 'left', '0');
                YAHOO.util.Dom.setStyle(this.TheLine, 'height', line.height + 'px');
                YAHOO.util.Dom.setStyle(this.TheLine, 'width', line.width);
                YAHOO.util.Dom.addClass(this.TheLine, 'TDS_Line_Reader_Active');


	            // hide current line
                if (YAHOO.util.Dom.getStyle(this.TheLine, 'display') === 'none') {
                    YAHOO.util.Dom.setStyle(this.TheLine, 'display', 'block');
                }

                line.element.appendChild(this.TheLine);
	        }

	        //FIRE CUSTOME EVENT
	        this._onLineMove.fire();
			
		}
	};
	//HIDE LINES - A GENERAL WAY TO HIDE DEFAULT LINE TYPES 
	this._hideLine = function() {
	    var ln = this._linesList[this._activeLineIndex];
	    if (this._activeLineIndex > -1 && ln && ln.element.nodeName === 'TR') {
	        YAHOO.util.Dom.setStyle(ln.element, 'background-color', that._savedBackgroundColor);
	    } else {
	        if (ln) {
	            YAHOO.util.Dom.setStyle(that.TheLine, 'display', 'none');
	        }
	    }
	};
	//CALLED ONLOAD - INITIALIZES THE ENTIRE OBJECT, IS ALSO CALLED FROM .Refresh()
	this._initialize = function () {
		
		//CLEAR ARRAYS AND INDEX
		this._linesList = [];
		this._textContainers = [];
		this._scrollableContainers = [];
		this._activeLineIndex = -1;
		
        //ADD SCROLL

		//FIND CONTAINERS IN SUBMITTED PARENT CONTAINERS
		var textContArray = [];
        for(var i = 0; i < this._parentContainers.length; ++i){
            var els = this._findElements.call(this, this._parentContainers[i]);
            if(els && els.length){
                textContArray = textContArray.concat(els);
            }
        }

		//ADD FILTER CONTAINERS IF NECESSARY
		for (var j = 0; j < textContArray.length; j++) {
			if (this._textContainers.indexOf(textContArray[j]) === -1) {
				this._textContainers.push(textContArray[j]);
			}
		}//END j loop
		textContArray = null;
		
		//PROCESS LINES FOR EACH FOUND TEXT CONTAINER 
		for (var i = 0; i < this._textContainers.length; i++) {
			this._processElement(this._textContainers[i]);
		}

		//ADD ONCLICK EVENT HANDLERS FOR EACH FOUND TEXT CONTAINER
		for (var i = 0; i < this._textContainers.length; i++) {
			var p = that._get_parser(this._textContainers[i].nodeName);
			if (p && p._onClick) {
				YAHOO.util.Event.on(this._textContainers[i], "click", p._onClick, null, this);
			}
		}

		//ADD KEYDOWN EVENT HANDLER
		this._onKeyDownRef = YAHOO.util.Event.on(
            this._parentContainers[0].ownerDocument, 
            'keydown', 
            this._onArrowKeyPress, 
            null, 
            this
        );


		//SUBSCRIBE TO ONLINEMOVE EVENT
		if (this._settings.onLineMove) {
			this._onLineMove.subscribe(this._settings.onLineMove);
		}

		//CREATE THE LINE
		this._createLine();

		//DRAW LINES IN DEBUG MODE
		if (this._settings.debug) {
		    for (var i = 0; i < this._linesList.length; i++) {
		        var l = this._linesList[i];
		        if (l.element.nodeName !== 'TR') {
		            var div = document.createElement('div');
		            div.id = "LR_DEBUG_" + i;
		            div.title = "LR_DEBUG_" + i;
		            div.className = DEBUG_LINE_CLASS;
		            //div.innerHTML = i;
		            YAHOO.util.Dom.setStyle(div, 'position', 'absolute');
		            YAHOO.util.Dom.setStyle(div, 'top', l.top + 'px');
		            YAHOO.util.Dom.setStyle(div, 'height', '1px');
		            YAHOO.util.Dom.setStyle(div, 'width', l.width + 'px');
		            if (l.EXP) {
		                YAHOO.util.Dom.setStyle(div, 'background-color', '#0f0');
		            } else {
		                YAHOO.util.Dom.setStyle(div, 'background-color', '#f00');
		            }
		            YAHOO.util.Dom.setStyle(div, 'z-index', '-1');
		            YAHOO.util.Dom.setStyle(div, 'display', 'block');

		            l.element.appendChild(div);
		        }
		        else {
		            YAHOO.util.Dom.setStyle(l.element, 'border', '1px solid #00f');
		        }
		    }
		}
	};
	//TURNS ON THE LINEREADER OFF, REMOVES EVENTS, DEBUG LINES, THELINE
	this._dispose = function () {
		//REMOVE LISTENERS (I don't think this worked either);
		//ADD EVENT HANDLERS FOR EACH ELEMENT
		//ON CLICKS
		for (var i = 0; i < this._textContainers.length; i++) {
			var p = this._get_parser(this._textContainers[i].nodeName);
			if (p._onClick) {
				YAHOO.util.Event.removeListener(this._textContainers[i], "click", p._onClick);
			}
		}
		//ON KEY DOWNS
		YAHOO.util.Event.removeListener(
            this._parentContainers[0].ownerDocument,
            'keydown', 
            this._onArrowKeyPress
        );

        //Remove the lines that we added into the page.
        var elements = YAHOO.util.Selector.query('.TDS_Line_Reader');
        for(var j=0; j<elements.length; ++j){
            var el = elements[j];
            if(el && el.parentNode && typeof el.parentNode.removeChild == 'function'){
                el.parentNode.removeChild(el);
            }
        }

		//REMOVE DEBUG LINES
		for (var i = 0; i < this._linesList.length; i++) {
			var l = this._linesList[i];
			var debugLines = YAHOO.util.Dom.getChildrenBy(l.element,
				function (x) {
					return x.className === DEBUG_LINE_CLASS;
				});
			for (var j = 0; j < debugLines.length; j++) {
				l.element.removeChild(debugLines[j]);
			}
		}

	    // REMOVE CLASSNAME WE ADDED TO PARENTS EL OF IMG AND MATH
		$('.' + this._bgActiveClassName).removeClass(this._bgActiveClassName);

        var elRelative = YAHOO.util.Selector.query('.TDS_Line_Reader_Relative_Pos');
        for(var i = 0; i < elRelative.length; ++i){ 
          YAHOO.util.Dom.removeClass(elRelative[i], 'TDS_Line_Reader_Relative_Pos');
        }
	};
	//*********END PROCESS METHODS*********//

	//*********HELPER METHODS*********//
	//CREATE THE HIGHLIGH LINE
	this._createLine = function () {
		this.TheLine = YAHOO.util.Selector.query(this._settings.lineID).length > 0 ? YAHOO.util.Selector.query(this._settings.lineID)[0] : document.createElement('div');

		if (YAHOO.util.Selector.query(this._settings.lineID).length === 0) {
			this.TheLine.setAttribute("id", this._settings.lineID.replace('#', ''));
		}
        YAHOO.util.Dom.addClass(this.TheLine, 'TDS_Line_Reader');
	};
	//IF SETTINGS ARE SUBMITTED, APPLIES SETTINGS, OVERRIDES DEFAULT SETTINGS
	this._applySettings = function (settings) {
		if (settings) {
			if (settings.lineColor) { this._settings.lineColor = settings.lineColor; }
			if (settings.lineBorder) { this._settings.lineBorder = settings.lineBorder; }
			if (settings.lineID) { this._settings.lineID = settings.lineID; }
			if (settings.lineZIndex) { this._settings.lineZIndex = settings.lineZIndex; }
			if (settings.onLineMove) { this._settings.onLineMove = settings.onLineMove; }
			if (typeof settings.debug === 'boolean') { this._settings.debug = settings.debug; }
		}
		return true;
	};
	//ADD A PARSER TO THE ._parsers ARRAY
	this._add_parser = function (parserObj) {
		this._parsers.push(parserObj);
	};
	//GIVEN A NODENAME i.e. 'TR' || 'DIV', FINDS MATCHING PARSER OBJECT FROM ._parsers ARRAY 
	this._get_parser = function (nodeName) {
		for (var i = 0; i < this._parsers.length; i++) {
			var nodeNames = [];
			if (this._parsers[i]._nodeName.indexOf(',') > -1) {
				nodeNames = this._parsers[i]._nodeName.split(',');
			} else {
				nodeNames.push(this._parsers[i]._nodeName);
			}

			for (var j = 0; j < nodeNames.length; j++) {
				if (nodeNames[j].toUpperCase() === nodeName) {
					nodeNames = null;
					return this._parsers[i];
				}
			}
		}
		return null;
	};

	this._getSuperScriptOffset = function (el,fontSize) {
	    var measurement1 = 0;
	    var measurement1 = 0;

	    //SET UP EXPERIMENT
	    var experimentDiv = document.createElement('div');
	    experimentDiv.id = 'SUPERSCRIPT_TEST';
	    experimentDiv.innerHTML = 'this is a test';
	    YAHOO.util.Dom.setStyle(experimentDiv, 'font-size', 'inherit');
	    YAHOO.util.Dom.setStyle(experimentDiv, 'line-height', 'inherit');
	    var experimentSpan1 = document.createElement('span');
	    experimentSpan1.innerHTML = "1";
	    YAHOO.util.Dom.setStyle(experimentSpan1, 'vertical-align', 'super');
	    YAHOO.util.Dom.setStyle(experimentSpan1, 'font-size', fontSize);

	    var experimentSpan2 = document.createElement('span');
	    experimentSpan2.innerHTML = "2";
	    YAHOO.util.Dom.setStyle(experimentSpan1, 'font-size', fontSize);

	    experimentDiv.appendChild(experimentSpan1);
	    experimentDiv.appendChild(experimentSpan2);

	    el.appendChild(experimentDiv);

	    //FIRST MEASUREMENT
	    measurement1 = YAHOO.util.Dom.getY(experimentSpan2);

	    //ADJUST
	    YAHOO.util.Dom.setStyle(experimentSpan1, 'vertical-align', 'bottom');

	    //SECOND MEASUREMENT
	    measurement2 = YAHOO.util.Dom.getY(experimentSpan2);

	    //DIFFERENCE
	    var diff = (parseFloat(measurement1) - parseFloat(measurement2)) + 1;

	    //REMOVE EXPERIMENT
	    el.removeChild(experimentDiv);


	    return diff;
       
	};
	//*****END HELPER METHODS*****//

	//*********EVENT HANDLERS*********//
	//HANDLES ONCLICK FOR MOST TEXT CONTAINERS
	this._textContainerOnClick = function (e) {
		var target = e.target || e.srcElement;

		//EVEN THOUGH SPANS ARE NOT ADDED TO A LIST WHEN CLICK ON THEY
		if (target.nodeName === 'SPAN') {
			target = YAHOO.util.Dom.getAncestorBy(target, function () { return true; });
		}

		var Y = YAHOO.util.Event.getXY(e)[1];
		var elY = YAHOO.util.Region.getRegion(target);
		Y = Y - elY.top;
		var l = this._findLine(target, Y);
		if (l) {
			this._activeLineIndex = this._linesList.indexOf(l);
			this._moveLine(l);
		}
	};

    //Select the previous line on an up arrow
	this.up = function () {
	    //turn off last line
        if (this._activeLineIndex > 0) {
	        pOff = this._get_parser(this._linesList[this._activeLineIndex].element.nodeName);
	        pOff._onLineExit.call(this, this._linesList[this._activeLineIndex]);
        }
        //go to next 
        if ((this._activeLineIndex -1) >= 0) {
	        this._activeLineIndex = this._activeLineIndex - 1;
	        pOn = this._get_parser(this._linesList[this._activeLineIndex].element.nodeName);
	        pOn._onLineEnter.call(this, this._linesList[this._activeLineIndex]);
        }
	};
    //Select the next line on a down arrow
    this.down = function(){
        //turn off last line
        if (this._activeLineIndex > -1 && this._activeLineIndex < (this._linesList.length - 1) ) {
	        pOff = this._get_parser(this._linesList[this._activeLineIndex].element.nodeName);
	        pOff._onLineExit.call(this,this._linesList[this._activeLineIndex]);
        }
        //go to next 
        if (this._activeLineIndex < (this._linesList.length - 1)) {
	        this._activeLineIndex = this._activeLineIndex + 1;
	        pOn = this._get_parser(this._linesList[this._activeLineIndex].element.nodeName);
	        pOn._onLineEnter.call(this, this._linesList[this._activeLineIndex]);
        }
    };

	//HANDLES ARROW KEY UP AND DOW
    this._onArrowKeyPress = function (e) {
        if (e.keyCode === 38 || e.keyCode === 40) {
			//STOP DEFAULT ARROW BEHAVIOR
            YAHOO.util.Event.stopEvent(e);

			var target = e.target || e.srcElement;
			var pOn;
			var pOff;
			var viewableOffset = 0;
			var scrollableOffset = this._parentWindow.pageYOffset;

			//IS LINE WITHIN A SCROLLABE ELEMENT
			var scrollParent = null;
			for (var i = 0; i < this._scrollableContainers.length; i++) {
				if (this._activeLineIndex > -1 && YAHOO.util.Dom.isAncestor(this._scrollableContainers[i], this._linesList[this._activeLineIndex].element)) {
					scrollParent = this._scrollableContainers[i];
					break;
				}
			}
			if (e.keyCode === 38) {
                this.up();
			}
			//DOWN
			if (e.keyCode === 40) {
                this.down();
			}

			var currentLinePostion = (YAHOO.util.Dom.getY(this.TheLine) - YAHOO.util.Dom.getY(scrollParent));
			var topOfViewableArea = YAHOO.util.Dom.getY(scrollParent);
			var bottomofViewableArea = parseInt(YAHOO.util.Dom.getStyle(scrollParent, 'height'));

			if (currentLinePostion < 1 || (currentLinePostion + AUTOSCROLL_TOLERANCE) > bottomofViewableArea) {
			    this.TheLine.scrollIntoView(true);
			}
		}
	};
	//*********END EVENT HANDLERS*********//

	//*********DEFAULT PARSERS*********//
	//PARAGRAPH, DIV and LI
	//var par    = new TDS.LineReader.Parser('P,DIV,LI,H2,H1,H3,H4');
	var par    = new TDS.LineReader.Parser('P,DIV,LI');//Fixes several bugs by removing H tags from scope of LineReader
    var exclude = { 
        'TD': true,
        'BUTTON': true,
        'H': true
    };

    //FB: 90302
    var excludeClasses = [
        'prompt',
        'format_wb'
    ];
    var excludeClass = function(el){
        for(var i=0; i<excludeClasses.length; ++i){
            if(el && YAHOO.util.Dom.hasClass(el, excludeClasses[i])){
                return true;
            }
        }
    };
    var hasSingleImageOrMath = this._hasSingleImageOrMath;

    var dfsText = function (x) {

        if (excludeClass(x)) { return; }

		var parEles = YAHOO.util.Dom.getAncestorBy(x, function (e) { return true; });

		//IF THE NEAREST PARENT IS A TD TAG IGNORE. THE ROW SHOULD BE HIGHLIGHTED. UNLESS IT IS A SINGLE COLUMN TABLE
		if ((!exclude[parEles.nodeName] &&
            !excludeClass(parEles)) ||
            ((parEles.nodeName == 'TD') &&
            $(parEles).siblings().length == 0)) {    // Single column table

		    for (var i = 0; i < x.childNodes.length; i++) {
		        
		        var cn = x.childNodes[i];
		        var nv = typeof cn.nodeValue == 'string' ? cn.nodeValue.trim() : '';
		        //DOES ELEMENT HAVE CHILD NODES? ARE CHILD NODES TEXT NODES -- IF SO PASS
		        if (cn.nodeType === 3 && nv.length > 0) {            
                    if(x.offsetWidth && x.offsetHeight) {
                        return true;
                    }
			    }else if(cn.nodeName == 'SPAN') {
                    //Bug 134755, checks for empty spans which may cause line reader to skip lines
				    if (!cn.textContent.trim() && x.childNodes[i + 1]) {
                        //If current span is empty but has sibling node it will continue on and check that node
		            } else {
		                return dfsText(cn);
		            }
			    } else if (hasSingleImageOrMath(x)                  // x contains single image or math element
                       && ($(cn).is('img') || $(cn).is('math'))) {  // only do this check when current child node is img/math
			                return true;                            // bring them into this._linesList array
			    }
		    }
		}
    };

    par._criteria = function (x) {
        var parent = x.parentNode;
        if (x.nodeName == 'P' &&        //is p with parent of th or td 
            (parent.nodeName == 'TH' ||
            parent.nodeName == 'TD')) {

            // if the parent TD is the only column in this row, then include it
            if ((parent.nodeName == 'TD' || parent.nodeName == 'TH') &&
                $(parent).siblings().length == 0) {
                return dfsText(x);
            } else {
                // for multiple column table, don't include it (<TD>)
                return false;
            }
        }
        return dfsText(x);
    };
	par._processLines = function (el) {
		//GET DIMENSIONS
	    var el_h = el.clientHeight,
	        el_w = el.clientWidth,
	        el_y = YAHOO.util.Dom.getY(el),
	        el_padding = parseInt(YAHOO.util.Dom.getStyle(el, 'padding-top'));

	    var ln_height = 0; 
	            
	    var el_line_height = YAHOO.util.Dom.getStyle(el, 'line-height');
	    var el_font_size = YAHOO.util.Dom.getStyle(el, 'font-size');

	    var pfel_lh = parseFloat(el_line_height);
	    var pfel_fs = parseFloat(el_font_size);

	    if (isNaN(pfel_lh)) {
	        ln_height = pfel_fs * LHR;
	    } else {
	        if(el_line_height.indexOf('%') > -1){
	            ln_height = pfel_fs * (pfel_lh / 100);
	        } else if (el_line_height.indexOf('in') > -1) { //bug 109466 half-fix
	            ln_height = pfel_fs * LHR;
	        } else {
	            ln_height = pfel_lh;
	        }
	    }
	    
		var curr_pos = 0,
	    pos = YAHOO.util.Dom.getStyle(el, 'position');

		if (el.nodeName === 'SPAN') {
			el_h = ln_height;
		}
		//SET POSITION OF ELEMENTS TO RELATIVE IF NOT ALREADY
		if (pos.toLowerCase() !== 'relative' && pos.toLowerCase() !== 'absolute') {
			YAHOO.util.Dom.addClass(el, 'TDS_Line_Reader_Relative_Pos');
		}
	    //FIND ALL SPANS AND IMAGES
		//var foundSpans = YAHOO.util.Selector.query("[ssml_alias*=foot]", el);
		var x = 1;
		var foundSpans = YAHOO.util.Dom.getElementsBy(function (fel) {
		    if (YAHOO.util.Dom.getStyle(fel, 'vertical-align') !=='baseline') {
		        return true;
		    }
		    return false;

		},'span',el);
            


		var spansArray = [];
        for (var i = 0; i < foundSpans.length; i++) {

		    var topY = (YAHOO.util.Dom.getY(foundSpans[i]) - el_y);
		    var height = 2;//parseFloat(YAHOO.util.Dom.getStyle(foundSpans[i],'height')),
		    var bottom = topY + height;

		    spansArray.push({
		        obj: foundSpans[i],
		        bottom: bottom,
		        height: height,
		        topY: topY,
		        left: YAHOO.util.Dom.getX(foundSpans[i])
		    });
		}
        //ACCUMULATE THE OFFSETS TO ADJUST SUBSEQUENT LINES
        var ssOffset = 0;
        //DYNAMICALLY GET THE OFFSET FOR A SUPER SCRIPT
        var curSuperOffset = spansArray.length > 0 ? that._getSuperScriptOffset(el, YAHOO.util.Dom.getStyle(spansArray[0].obj, 'font-size')) : 0;
        //CREATE LINES UNTIL THE BOTTOM OF THE ELEMENT IS REACHED
        while (curr_pos < el_h) {

			var linObj = new that.line();
			linObj.height = ln_height;
			linObj.width = el_w;
			linObj.top = (curr_pos + el_padding) + ssOffset;
			linObj.element = el;
			linObj.bottom = linObj.top + linObj.height;

			for (var i = 0; i < spansArray.length; i++) {
			    if (spansArray[i].bottom > linObj.top && spansArray[i].bottom < linObj.bottom) {
			        //var curSuperOffset = 6;
			        linObj.height += curSuperOffset;
			        linObj.EXP = true;
			        ssOffset += curSuperOffset;
			        //TESTING - $(el).append('<div style="position:absolute;top:' + spansArray[i].topY + 'px;left:' + spansArray[i].left + 'px;width:17px;height:17px;border:1px solid #00f"></div>');

			        break;
			    }
			}


            // for image/math is the only children of the paragraph except <br> 
		    // and the height between single line height and twice line height, render them as same line, line height will be the element height
		    if (this._hasSingleImageOrMath(el)) {
		        if (this._hasFitImageOrMath(el, ln_height)) {
		            curr_pos += el_h;
		        } else {
		            break;
		        }
		    } else {
			    curr_pos = curr_pos + ln_height;
			}

		    this._linesList.push(linObj);

			//IF TR ELEMENT, ONLY CREATE ONE LINE OBJECT
			if (el.nodeName === 'TR') {
				break;
			}

		}
	};
	par._onClick = function (e) {
		this._textContainerOnClick(e);
	};
	par._onLineEnter = function (line) {
	    this._moveLine(line);
	};
	par._onLineExit = function (line) {
		//this is handled by _moveLine;
	};
	this._add_parser(par);
		

	//TABLE ROWS
	par = new TDS.LineReader.Parser('TR');
	par._criteria = function (x) {
		return true;
	};
	par._processLines = function (el) {
		var linObj = new that.line();
		linObj.height = 0;
		linObj.width = 0;
		linObj.top = 0;
		linObj.element = el;//we are really just saving the tr element
		linObj.bottom = 0;
		this._linesList.push(linObj);
	};
	par._onClick = function (e) {
		//HIDE THE CURRENT LINE
		//WHAT WAS CLICKED?
		var target = e.target || e.srcElement;
		if (target.nodeName === 'TD' || target.nodeName === 'P' || target.nodeName === 'DIV' || target.nodeName === 'SPAN') {
			//IF IT WAS SOMETHING OTHER THAN A TR FIND THE TR
			target = YAHOO.util.Dom.getAncestorByTagName(target, 'TR');
		}

		//FIND THE TR IN THE LINE LIST
		for (var i = 0; i <  this._linesList.length; i++) {
			if (this._linesList[i].element === target){
				this._activeLineIndex = i;
				break;
			}
		}
		//SET THE NEW BACKGROUND COLOR
		YAHOO.util.Dom.addClass(target, 'TDS_Line_Reader_Active');

		//FIRE EVENT
		this._onLineMove.fire();
	};
	par._onLineEnter = function (line) {
	    //CHANGE BACKGROUND COLOR
	    if (that.TheLine) {
	        //HIDE LINE
	        YAHOO.util.Dom.setStyle(that.TheLine, 'display', 'none');
            //GET LINE'S COLOR
	        that._settings.lineColor = YAHOO.util.Dom.getStyle(that.TheLine, 'background-color');
	    }
	    //SET HIGHLIGHTED ROW BACKGROUND TO LINE'S BACKGROUND COLOR
	    YAHOO.util.Dom.setStyle(line.element, 'background-color', that._settings.lineColor);
	};
	par._onLineExit = function (line) {
	    //HIDE ROW LINE I.E. SET BGCOLOR BACK TO SAVED VALUE
	    YAHOO.util.Dom.setStyle(line.element, 'background-color', that._savedBackgroundColor);
	};
	//this._add_parser(par);//Matt says: not using this parser improves 102511 : make this work without commenting out this parser, but I can't yet tell what breaks from not using it
	//*********END DEFAULT PARSERS*********//

	//*****SET PROPERTIES ON INSTANTIATION***//
	//ALWAYS THE FIRST ARGUMENT
	this._parentContainers = YAHOO.lang.isArray(arguments[0]) ? arguments[0] : [arguments[0]]; //PARENT ELEMENT
	for (var i = 1; i < arguments.length; i++) { //PARSE OPTIONAL ARGUMENTS
		if (arguments[i]) {
			//LOOK FOR SETTINGS
			if (arguments[i].lineColor ||
				arguments[i].lineBorder ||
				arguments[i].lineID ||
				arguments[i].lineZIndex ||
				arguments[i].debug ||
				arguments[i].onLineMove) {
			}

			//DETECT WINDOW FOR PARENT WINDOW
			if (arguments[i].toString().toLowerCase().indexOf('window') > -1) {
				this._parentWindow = arguments[i];
			}

			//ARRAY DETECT ELEMENT LIST FOR IGNORE ELEMENTS
			if (arguments[i].toString().toLowerCase().indexOf('nodelist') > -1 || arguments[i].toString().toLowerCase().indexOf('htmlcollection') > -1) {
				for (var j = 0; j < arguments[i].length; j++) {
					this._ignoreContainers.push(arguments[i][j]);
				}
				
			}

			//ADD CUSTOM ELEMENT PARSERS
			if (arguments[i] instanceof Array) {
				for (var j = 0; j < arguments[i].length; j++) {
					this._add_parser(arguments[i][j]);
				}
			}
		}
	}

	//*******INITIALIZE ONLOAD********//
	this._initialize();

	//*********PUBLIC METHODS*********
    return {
        obj: this,//DEBUG
        dispose: function() {
            that._dispose.call(that);
            return true;
        },
        refresh: function() {
            if (!that.TheLine) {
                that._dispose.call(that)
            }
            ;
            that._initialize.call(that);
            return true;
        },
        applySettings: function(settings) {
            //APPLY SETTINGS
            that._applySettings.call(that, settings);
            //REFRESH
            that._dispose.call(that);
            that._initialize.call(that);
            return true;
        },
        settings: this._settings,
        addParser: function(p) {
            //ADD PARSER
            that._add_parser.call(that, p);
            //REFRESH
            that._dispose.call(that);
            that._initialize.call(that);
            return true;
        },
        selectFirst: function() {
            that._selectLineAt(0);
        },
        parsers: this._parsers
    };

};

//PARSER OBJECT
TDS.LineReader.Parser = function (nodeName) {
	this._nodeName = nodeName.toUpperCase();
	this._criteria = {}; //FUNCTION(ELEMENT){ MATCHING CRITERIA RETURN TRUE/FALSE }
	this._processLines = {};//FUNCTION(ELEMENT){CREATE LINES IN ELEMENT};
	this._onClick = {}; //FUNCTION(EVENT){ DO SOMETHING WHEN OBJECT IS CLICKED}
	this._onLineEnter = {};//FUNCTION(EVENT){ AS THE LINE IS MOVED WITH THE ARROW KEYS-DO THIS WHEN THIS ELEMENT IS ACTIVE };
	this._onLineExit = {};//FUNCTION(EVENT){AS LINE MOVES AWAY - DO SOMETHING HERE. Usually, turn off line}
};

