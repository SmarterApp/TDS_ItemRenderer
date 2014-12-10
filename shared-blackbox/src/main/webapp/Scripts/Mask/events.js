/**
 *  The only events that we are trying to manipulate and use are scroll events.
 *
 *  May need to key off of both pageId AND the primary scroll container that is generating
 *  the scroll event.
 */
(function(){ //For managing scroll events.

var CFG = TDS.Mask.Config;
TDS.Mask.EventManager = function(ctrl, doc){
  this._listeners = null;

  this.setControl(ctrl);
  this.setScrollDocument(doc);
};
var eM = TDS.Mask.EventManager; 

eM.prototype.getPageId = function(){
  return this._pageId;
};

eM.prototype.setPageId = function(pageId){
  this._pageId = pageId;
};

eM.prototype.getControl = function(){
  return this._ctrl;
};
eM.prototype.setControl = function(ctrl){
  this._ctrl = ctrl;
};

//Have to deal with crappy iFrame code.
eM.prototype.setScrollDocument = function(doc){
  doc = doc || document;
  this._document = doc;
};

eM.prototype.getScrollDocument = function(){
  return this._document || document.body;
}

//Can the element scroll, might want to use Util gunk in TDS.
eM.prototype.isElScrollable = function(dom){
  if(!dom){return;}

  var hasHorizontalScrollbar = dom.scrollWidth>div.clientWidth;
  var hasVerticalScrollbar   = dom.scrollHeight>div.clientHeight;

  if(hasHorizontalScrollbar || hasVerticalScrollbar){
    return {
      vertical: hasVerticalScrollbar,
      horizontal: hasHorizontalScrollbar
    };
  }
  return false;
};

//Apply the scroll event to the actual control page
eM.prototype.applyScroll = function(x, y, scrollContainer){
  var ctrl = this.getControl(); 
  if(ctrl){
    ctrl.move(x, y, scrollContainer);
  }
};

eM.prototype.findScrollable = function(dom){
    //DFS looking for certain types that might scroll.
    if(dom && CFG.isScrollable(dom)){
      return true;
    }
    return false;
};

//Blarg.
eM.prototype.dfs = function(el, match, results){
  if(!el){return;}
  match   = typeof match == 'function' ? match : function(){return true};
  results = results || [];
  
  if(match(el)){
    results.push(el);
  }
  var children = el.childNodes;
  if(children){
    for(var i=0; i<children.length; ++i){
      this.dfs(children[i], match, results);
    }
  }
  return results;
};

//Stop the event prop
eM.prototype.stopEvt = function(evt){
    evt = evt || window.event;
    if(evt){
      evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
      evt.preventDefault  ? evt.preventDefault() : evt.returnValue = false;
    }
};

//FRAK, have to check the page scroll against the element scroll.
eM.prototype.scrollDiff = function(el, evt){
  try{
    //Initial scroll document, relative to the element scroll (possible element scroll)
    var sD = this.getScrollDocument();

    var doc = sD && sD.documentElement ? sD.documentElement : document.documentElement;
    var left = (window.pageXOffset  || doc.scrollLeft) - (doc.clientLeft || 0);
    var top  = (window.pageYOffset  || doc.scrollTop)  - (doc.clientTop || 0);


    //Inner element scroll modifiers... BLEAH
    var elTop  = el ? el.scrollTop  : 0;
    var elLeft = el ? el.scrollLeft : 0;

    //CFG.Debug && console.log("Scroll Diff info(left, elLef, top, elTop, el)", left, elLeft, top, elTop, el);

    //Move the control
    var ctrl = this.getControl();
        ctrl.move(left + elLeft, top + elTop, el)
  }catch(e){
    console.error("Failed to scroll correctly.", e);
  }
};

//Listen for scroll events, use this listener to adjust the elements that are in the control
eM.prototype.listen = function(docOrDom, cb, evtName){
  if(this._listeners && this._listeners.length) { return; } //already awake
  CFG.Debug && console.log("What is in eventManager listen?", docOrDom, cb);

  evtName  = evtName || 'scroll';
  docOrDom = docOrDom || this.getScrollDocument(); //Could also be they passed in a dom container
  docOrDom = docOrDom && docOrDom.body ? docOrDom.body : docOrDom;

  cb  = typeof cb == 'function' ? cb : this.scrollDiff;

  //Search the container for elements with scrollbars, listen (else body?)
  var results = this.dfs(docOrDom, this.findScrollable);

  CFG.Debug && console.log("Tried to find scrollable elements, results (docOrDom, results) ", docOrDom, results);

  if(!results || !results.length){
    results = [this.getScrollDocument()];
  }

  //Add the listeners and keep a recorf for when we need to sleep
  this._listeners = [];
  for(var i=0; i<results.length; ++i){
    var el     = results[i];
    var listen = cb.bind(this, el);
    el.addEventListener(evtName, listen, false);
    this._listeners.push({
      evtName: evtName,
      el: el,
      listen: listen
    });
  }
};

//Consider making a remove all listeners function for this type of config
eM.prototype.sleep = function(){
  if(!this._listeners){ return; }

  for(var i=0; i<this._listeners.length;++i){
    var cfg = this._listeners[i];
    if(cfg && cfg.el && typeof cfg.listen == 'function'){
      cfg.el.removeEventListener(cfg.evtName, cfg.listen, false);
    }
  }
  this._listeners = null;
};
})();
