//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 *  Control - class maintains a list of the existing masks, provides creation logic, move logic etc.
 *  Store   - Just a place to store the instances for ease of debugging in the main page.
 *
 *  The control class is what handles the initial creation events and mose clicks, the event
 *  manager is the one that actually handles the complex issues resulting from scrolling.
 *
 *  TODO: add more multi scroll component tests, and properly associate the click with 
 *  a scroll only event in blackbox (add in module_mask.js and other TDS code)
 *
 *  Event flow
 *   -> New  Mask (listens for mousedown)
 *   -> Init Mask (listening for drag events, if the mouse is up too close, waits for 2nd click)
 *   -> Finish (finish the mask and draw it to the page)
 *
 *   TODO: Could also make the div instantly added on the first page click and 'sized' / positioned
 *   based on the mouse position but that can lead to all sorts of ugly issues (overkill)
 *
 *   Instances are placed into the TDS.Mask.Store and primarily keyed off of 'pageId', however
 *   for scrolling we may need to add a mapping based on the scroll containerId they are associated
 *   with (scary TDS layouts and independent scrolling)
 */
(function(){

var YUD = YAHOO.util.Dom;
var CFG = TDS.Mask.Config || {};
 
TDS.Mask.Control = function(args){
  args = args || {};
  this.setActivePageId(args.pageId);
  this.setDialogClass(args.dialogClass || TDS.Mask.Config.DialogClass);

  this._maskInCreation = null;
  this.sequence = 0;
};
C = TDS.Mask.Control;

//In the future you can set the dialog class if it is defined, but for a simple 
//implementation this is totally overkill.  A dialog class just needs to have
//show(), hide() but is almost certainly complete overkill and this code can
//laster be removed.
C.prototype.setDialogClass = function(str){
  var cls = null;
  if(typeof str == 'string'){
    var cmp = str.split('.'); 
    var ref = window;
    for(var i=0; i<cmp.length; ++i){
      if(ref[cmp[i]]){
        ref = ref[cmp[i]];
      }
    }
    CFG.Debug && console.log("lookup the class?", ref);
  }
    this._dialogClass = str;
};


C.prototype.getScrollParent = function(el){
  if(!el){return;}
  var pScroll = CFG.isScrollable(el) ? el : null;
  while(!pScroll && el && el.parentNode && !el.nodeName != 'BODY'){
    el = el.parentNode;
    if(CFG.isScrollable(el)){
      pScroll = el;
    }
  }
  return pScroll;
};

C.prototype.genId = function(){
  return 'tds_mask_' + (this.sequence++);
};
//Start the creation of a mask, which is just an absolutely positioned div with a close
//button inside of it.
C.prototype.createMask = function(page, x, y, w, h, debugMsg){
  //set some stuff.
  var dialog = null; 
  var id = this.genId();
  if(typeof this._dialogClass == 'function'){ //In case a class is defined..
    dialog = new this._dialogClass(x, y, w, h, debugMsg); 
    dialog.id = id;
    dialog.close = this.close.bind(this, id);
  }else{
      dialog =  document.createElement('div');
      dialog.id = id;
      dialog.innerHTML = debugMsg || '';  //hints for test cases (should be location x etc);
      YUD.addClass(dialog, "tds_mask_container");

      //The actual creation logic.
      var close = document.createElement('button');
          close.innerHTML = 'x';
          close.onclick   = this.close.bind(this, id);
          YUD.addClass(close, 'tds_mask_close');

      dialog.appendChild(close);

      CFG.Debug && console.log("createMask div (page, dialog, x, y, w, h)", page, dialog, x, y, w, h);
      YUD.setStyle(dialog, 'position', 'fixed');
      YUD.setStyle(dialog, 'left', x + 'px');
      YUD.setStyle(dialog, 'top', y + 'px');
      YUD.setStyle(dialog, 'width', w + 'px');
      YUD.setStyle(dialog, 'height', h + 'px');
      //YUD.setStyle(dialog, 'z-index', 9001);
      
      //page = page && page.appendChild ? page : null;
      //page.appendChild(dialog);
      document.body.appendChild(dialog);

      //Add it to the current page we are listening into

  }
  return dialog;
};

C.prototype.close = function(id){
  console.log("Close this item.", id);
  var dialog = TDS.Mask.Store.get(id);
  if(dialog && typeof dialog.close == 'function'){
    dialog.close();
    delete dialog;
  }else if(dialog.parentNode){
    dialog.parentNode.removeChild(dialog);
  }
  TDS.Mask.Store.remove(id);
};

/**
 *  For example {id: [x, y, z]}
 *    Or more likely: {pageId: id}
 */
C.prototype.hide = function(optionalQuery){
  var masks = TDS.Mask.Store.query(optionalQuery);
  console.log("What came from masks?", masks);
  if(!masks){return;}
  for(var i = 0; i<masks.length; ++i){
    var mask = masks[i];
    if(mask && typeof mask.hide == 'function'){
      mask.hide();
    }else{
      YUD.addClass(mask, 'hidden');
    }
  }
  //remove all unfinished masks
  this.removeIndicateDrawingContainer();
};

/**
 *  For example {id: [x, y, z]}
 *    Or more likely: {pageId: id}
 */
C.prototype.show = function(optionalQuery){
  var masks = TDS.Mask.Store.query(optionalQuery);
  if(!masks){return;}

  CFG.Debug && console.log("Should show these (masks, query)", masks, optionalQuery);

  for(var i = 0; i<masks.length; ++i){
    var mask = masks[i];
    if(mask && typeof mask.show == 'function'){
      mask.hide();
    }else{
      YUD.removeClass(mask, 'hidden');
    }
  }
};

//Defaults to turning on only the currently active 'page'
C.prototype.on = function(query){
  try{
    query = query || {pageId: this.getActivePageId()};
    CFG.Debug && console.log("TDS.Mask.Conrol.on with query: ", query);
    this.show(query);
  }catch(e){
    console.error("Failed to turn on the masks for this query.", query, e);
  }
};

//No query param {id: *, pageId: x} will just turn them all off.
C.prototype.off = function(query){
  try{
    //If box in partial create, remove 
    //(ie: this.inCreate.parentNode.removeChild(this.inCreate);  this.inCreate = null
    console.log("Turn off the items.", query);
    //this.hide(query); // commenting out this line to keep all existed masks on the page when toggle button is hit and masking is turned off.
    this.removeAllListeners();
  }catch(e){
    console.error("Failed to turn off the masks for this query.", query);
  }
  //remove all unfinished masks
  this.removeIndicateDrawingContainer();
};


//Move all masks for the current page by a diff
C.prototype.move = function(x, y, scrollDomSource, pageId){
    CFG.Debug && console.log("Move the masks (x, y, el, pageId)", x, y, scrollDomSource, pageId);

    pageId = pageId || this.getActivePageId();
    var masks = TDS.Mask.Store.query({pageId: pageId});
    if(masks && masks.length){
        var mask = null;
        for(var i=0; i<masks.length; ++i){
          mask = masks[i];

          //This must take into account the scroll of the current container if present.
          if((scrollDomSource == mask.scrollDomSource) && mask.scrollDomSource){
            var initX = YUD.getAttribute(mask, 'initialX'); 
            var initY = YUD.getAttribute(mask, 'initialY');

            YUD.setStyle(mask, 'top',  (initY - y) + 'px');
            YUD.setStyle(mask, 'left', (initX - x) + 'px');
          }
        }
    }
};


//Initialization function, will register the first click and set the page id
C.prototype.newMask  = function(page, pageId, evt){
  page   = page   || TDS.Mask.PAGE        || document.body;  
  pageId = pageId || this.getActivePageId() || page.id;

  if(pageId){
    this.setActivePageId(pageId);
  }
  CFG.Debug  && console.log("newMask (page, pageId, evt)", page, pageId, evt);
  this.removeAllListeners();
  this.createListeners(
      this.getClickElements(page),    //For possibly restriction creation into major 'areas'
      this.initMaskClick.bind(this),  //initial function
      'mousedown',                    //point, can then be updated by drag events
      CFG.cls.INIT                    //css class to apply to the elements for the cursor style
  );
};

//Ask for the currently active masks on the page.
C.prototype.getActiveMasks = function(){
  return TDS.Mask.Store.query({pageId: this.getActivePageId()});
};

//Major classes
C.prototype.getClickElements = function(page){
  if(!CFG.EnableClickClass){return [page];}

  var cls = null; 
  var elements = [];
  for(var i=0; i<CFG.ClickClasses.length; ++i){
    cls = CFG.ClickClasses[i];
    var s = YAHOO.util.Selector.query('.' + cls, page) 
    if(s && s.length){
      elements = elements.concat(s);
    }
  }
  if(!elements.length){
    elements = [page]; //Unlikely to render correctly in blackbox...
  }
  return elements;
};


//Stop the event prop
C.prototype.stopEvt = function(evt){
    evt = evt || window.event;
    if(evt){
      evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
      evt.preventDefault  ? evt.preventDefault() : evt.returnValue = false;
    }
};

//Map the function to each element, scoped with this class in mind
C.prototype.createListeners = function(elements, func, evtName, cls){
  if(!elements || typeof func != 'function'){return;}
  if(!YAHOO.lang.isArray(elements)){
    elements = [elements];
  }

  //In case we removed everything
  evtName = evtName || 'click';
  if(!this.pageListeners){
    this.pageListeners = [];
  }

  //Scope each element callback plus proper reference so we can remove the listeners
  var scopeIt = function(el, cb, evt){ cb(el, evt); };
  var el = null;
  var listener = null;
  for(var i=0; i<elements.length; ++i){
    el = elements[i];
    if(el){ //Keep a record of what we create so we can remove them.
      listener =  scopeIt.bind(this, el, func);
      
      var lsnr = this.addMouseListener(el, evtName, listener);

      // if support both mouse and touch events
      if (CFG.altEventName) {
          this.pageListeners.push({
              el: el,
              evtName: CFG.altEventName,
              listener: lsnr
          });
      }
      
      this.pageListeners.push({
        el: el,
        evtName: CFG.eventName,
        listener: lsnr
      });
      cls && YUD.addClass(el, cls);
    }
  }
  return this.pageListeners;
};

// support for touch screen devices event translation
C.prototype.addMouseListener = function (target, name, fn) {

    var touchScreen = 'ontouchstart' in window;

    var touchEvents = {
        'mousedown': 'touchstart',
        'mouseup': 'touchend',
        'mousemove': 'touchmove'
    };

    var mouseEvents = {
        'mousedown': 'mousedown',
        'mouseup': 'mouseup',
        'mousemove': 'mousemove'
    };

    // Get the windows nt version
    var getWindowsNTVersion = function () {
        var matches = navigator.userAgent.match(/Windows NT (\d+\.\d+)/);
        var value;
        if (matches && matches[1]) {
            value = parseFloat(matches[1]);
        }
        return value || 0;
    };

    // if this is true then we need to support both mouse/touch, win8 and chromebook with touchscreen
    var supportsTouchAndMouse = function () {
        return (touchScreen && (getWindowsNTVersion() >= 6.1 || window.navigator.userAgent.indexOf('CrOS') > -1));
    };

    // this fixes a touch event to look like a mouse event
    var normalizeTouchEvent = function (evt) {

        if (evt.changedTouches) {

            var touches = evt.changedTouches;

            // find touch event that matches dom event
            for (var i = 0, ii = touches.length; i < ii; i++) {

                if (touches[i].target == evt.target) {

                    // save original event
                    var oldevt = evt;

                    // replace DOM event with touch event
                    evt = touches[i];

                    evt.preventDefault = function () {
                        return oldevt.preventDefault();
                    };

                    evt.stopPropagation = function () {
                        return oldevt.stopPropagation();
                    };

                    return evt;
                }
            }
        }

        return evt;
    };

    // check if browser supports both touch and mouse
    var touchAndMouse = supportsTouchAndMouse();

    // figure out the event name and alt event name
    var eventName, altEventName;
    if (touchScreen) {
        eventName = (touchEvents[name] || name);
        if (touchAndMouse) {
            altEventName = (mouseEvents[name] || name);
        }
    } else {
        eventName = (mouseEvents[name] || name);
    }

    // perform some processing on the dom event (http://www.html5rocks.com/en/mobile/touchandmouse/)
    var processEvent = function (evt) {

        // prevents default mouse-emulation
        if (touchAndMouse) {
            evt.preventDefault();
        }

        // normalize event to look like mouse
        if (touchScreen) {
            evt = normalizeTouchEvent(evt);
        }

        fn(evt);
    };

    // add event listener
    if (eventName) {
        target.addEventListener(eventName, processEvent, false);
        if (altEventName) {
            target.addEventListener(altEventName, processEvent, false);
        }
    }
    CFG.eventName = eventName;
    if (altEventName) {
        CFG.altEventName = altEventName;
    }
    // handler for remove listener use
    return processEvent;
};

C.prototype.removeMaskClasses = function(elements){
  if(!elements || !elements.length){return;}

  var el = null;
  for(var i=0; i<elements.length; ++i){
    el = elements[i];
    YUD.removeClass(el, CFG.cls.INIT);
    YUD.removeClass(el, CFG.cls.MOVE);
    YUD.removeClass(el, CFG.cls.FIN);
  }
};


//Remove all the page listeners that we know about (off);
C.prototype.removeAllListeners = function(){
  if(this.pageListeners){
    for(var i=0; i<this.pageListeners.length; ++i){
      try{
        var cfg = this.pageListeners[i];
        if(cfg && cfg.el && cfg.listener){
          cfg.el.removeEventListener(cfg.evtName, cfg.listener, false);
          this.removeMaskClasses([cfg.el]);
        }
      }catch(e){
        CFG.Debug && console.error("Failed to remove event listener. cfg, e", cfg, e);
      }
    }
  }
  this.pageListeners = null;
};


//Start the creation of a mask.
C.prototype.initMaskClick = function(page, evt){
    this.stopEvt(evt);
    this.removeAllListeners();

    //Initial div creation here, keep reference
    this.firstClick = evt;

    /*
    * for touch screen devices, the clientX and clientY of 'evt' is changing with touchmove event
    * so we need to store the initial value of clientX/clientY of the touchstart event.
    */
    if (CFG.isTouchScreen) {
        this.firstClick = {
            clientX: evt.clientX,
            clientY: evt.clientY
        };
    }
    
    this.createListeners(
        this.getClickElements(page),
        this.mouseMove.bind(this),
        'mousemove'
    );
    this.createListeners(
        this.getClickElements(page),
        this.mouseUp.bind(this),
        'mouseup',
        CFG.cls.MOVE
    );
    //Grabe the initial click event, place tool, prepare to expend until another click
};


C.prototype.mouseMove = function (page, evt) {
    this.stopEvt(evt);
    if (!this.firstClick) return;
    this.indicateDrawing(this.firstClick, evt);
};

    //indicate mousemove event by create a div and adding dashed border to it.
C.prototype.indicateDrawing = function (a, b) {
    if (!a || !b) { return; }
    var x = a.clientX <= b.clientX ? a.clientX : b.clientX;
    var y = a.clientY <= b.clientY ? a.clientY : b.clientY;
    var w = Math.abs(a.clientX - b.clientX);
    var h = Math.abs(a.clientY - b.clientY);
    
    var iDrawing = document.getElementById('indicateDrawingContainer');

    if (!iDrawing && w > CFG.minW && h > CFG.minH) {
        iDrawing = document.createElement('div');
        iDrawing.setAttribute('id', 'indicateDrawingContainer');
        //CFG.Debug && console.log("create indicateDrawing div (a, b, x, y, w, h)", a, b, x, y, w, h);
        YUD.setStyle(iDrawing, 'position', 'fixed');
        YUD.addClass(iDrawing, 'tds_mask_container tds_mask_container_drawing');
        document.body.appendChild(iDrawing);

        // adding event listener to the new created div since mouse behavior can end up on it.
        this.createListeners(
            iDrawing,
            this.mouseMove.bind(this),
            'mousemove'
        );
        this.createListeners(
            iDrawing,
            this.mouseUp.bind(this),
            'mouseup',
            CFG.cls.MOVE
        );
    }
    //CFG.Debug && console.log("iDrawing div (w, h)", w, h);
    YUD.setStyle(iDrawing, 'left', x + 'px');
    YUD.setStyle(iDrawing, 'top', y + 'px');
    YUD.setStyle(iDrawing, 'width', w + 'px');
    YUD.setStyle(iDrawing, 'height', h + 'px');
    //YUD.setStyle(dialog, 'z-index', 9001);
    
    //page = page && page.appendChild ? page : null;
    //page.appendChild(dialog);
};

C.prototype.mouseUp = function (page, evt) {
  var box = this.determineBox(this.firstClick, evt);
  if(box){
    this.finishMaskClick(page, evt);
  }else {
      this.removeAllListeners();
      this.createListeners(
          this.getClickElements(page),
          this.finishMaskClick.bind(this),
          'mousedown',
          CFG.cls.FIN
      );

      // for touch screen, when touchend fired, there is no need and no way to listen 'touchmove'(mousemove) event without another touchstart.
      if (!CFG.isTouchScreen) {
          this.createListeners(
              this.getClickElements(page),
              this.mouseMove.bind(this),
              'mousemove'
          );
      }
      
  }

};

C.prototype.finishMaskClick = function (page, evt) {
    try {
        this.stopEvt(evt);
        this.removeAllListeners();
        this.removeIndicateDrawingContainer();
        this.secondClick = evt;

        CFG.Debug && console.log("Finish mask click", page, this.firstClick, this.secondClick);
        var box = this.determineBox(this.firstClick, this.secondClick);
        if (box) {
            this.initializeBox(page, box);
        }
        //to enable multiple mask creation with only one mask button click.
        TDS.Mask.create();
    } catch (e) {
        console.error("Cannot finish mask click.", e);
    }

};
    
//remove drawing indication element
C.prototype.removeIndicateDrawingContainer = function () {
    var iDrawing = document.getElementById('indicateDrawingContainer');
    if (iDrawing) {
        document.body.removeChild(iDrawing);
    }
};

C.prototype.determineBox = function(a, b){
  if (!a || !b) { return; }

  var box = {
    tX: a.clientX <= b.clientX ? a.clientX : b.clientX,
    tY: a.clientY <= b.clientY ? a.clientY : b.clientY,
    bX: a.clientY <= b.clientX ? b.clientX : a.clientX,
    bY: a.clientY <= b.clientX ? b.clientY : a.clientY,
    w: Math.abs(a.clientX - b.clientX),
    h: Math.abs(a.clientY - b.clientY)
  };
  //
  //Provide a min bounding box size.
  if(box && (box.w > CFG.minW) && (box.h > CFG.minH)){
    return box;
  }
};

C.prototype.initializeBox = function(page, box){
    try {
    var dialog = this.createMask(page, box.tX, box.tY, box.w, box.h);
    if(dialog){ //We are going to move around, keep references to creation info.
      var pScroll = this.getScrollParent(page);
      if(pScroll){
        box.tX += (pScroll.scrollLeft || 0);
        box.tY += (pScroll.scrollTop  || 0);
        dialog.scrollDomSource = pScroll; //Used to determine if this element should scroll
      }

      //Initial placeholder information to ensure you can place the object relative to scroll
      YUD.setAttribute(dialog, 'initialX',  box.tX);
      YUD.setAttribute(dialog, 'initialY',  box.tY);

      dialog.pageId = this.getActivePageId() || page.id;
      TDS.Mask.Store.set(dialog); //Uses the id set on the dialog to index
    }
  }catch(e){
    console.error("Failed to initialize basic box model.", e);
  }
};

C.prototype.abortMask = function(){
   //Remove in creation mask?
};

C.prototype.setActivePageId = function(pageId){
  this._pageId = pageId;
};

C.prototype.getActivePageId = function(){
  return this._pageId;
};


/**
 *  Simple top level namespace for looking up the various available mask objects
 */
TDS.Mask.Store = {
   Instances: {
     //Storage Of mask dialogs
   },
   get: function(id){
     return TDS.Mask.Store.Instances[id];
   },
   remove: function(id){
      if(TDS.Mask.Store.Instances[id]){
        delete TDS.Mask.Store.Instances[id];
      }
   },
   set: function(obj, id){
     if(obj){
       if(!obj.id){
         obj.id = obj.id || id || ('tds_mask_' + (++TDS.Mask.Store.id));
       }
       TDS.Mask.Store.Instances[id || obj.id] = obj;
     }
   },
   match: function(q, obj){
     if(!obj || !obj.id){return;}
     //id match & wildcard

     if((!q.id     || (q.id     == '*' || q.id.indexOf(obj.id) != -1)) &&
        (!q.pageId || (q.pageId == '*' || q.pageId.indexOf(obj.pageId) != -1))){
          return true;
      }
   },
   /** 
    *  q = {id: [id], pageId: [pageId]}
    *    OR
    *  matchFunc = a function that takes (q, maskObj) returns true for "yes"
    */
   query: function(q, matchFunc){
      q = q || {id: '*'};
     //make id and q.pageId into arrays
     if(q && (q.id || q.pageId)){
       if(q.id && q.id != '*' && !YAHOO.lang.isArray(q.id)){
         q.id = [q.id];
       }
       if(q.pageId && !YAHOO.lang.isArray(q.pageId)){
         q.pageId = [q.pageId];
       }
     }

     //Provide a match function if one is not provided
     if(typeof matchFunc != 'function'){
       matchFunc = TDS.Mask.Store.match;
     }
     //wildcard builder for id
     var results = [];
     for(var k in TDS.Mask.Store.Instances){
       if(k && typeof k != 'function'){
         var obj = TDS.Mask.Store.Instances[k];
         if(matchFunc(q, obj)){
           results.push(obj);
         }
       }
     }
     return results;
   }
 };

})();
