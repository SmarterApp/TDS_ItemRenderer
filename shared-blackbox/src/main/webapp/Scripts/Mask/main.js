/**
 *  This is for the TDS masking defined and tracked from FB#19180
 *
 *  You primarily only ever want to call:
 *  -> setPageId() when changing test 'page' (will turn things off if new page Id)
 *  -> create(visiblePageDom, pageId<optional>,
 *  -> off: when changing pages, using special tools etc
 *  -> on: after you set a new page, or want to toggle the tool
 */
TDS = window.TDS || {};
var YUD = YAHOO.util.Dom;
TDS.Mask = {
  Config: {
    minH: 0,
    minW: 5, 
    Debug: true,
    Enabled: true,
    altEventName: '',   // for devices support both mouse and touch
    eventName: '',      // for touch screen device
    cls: {
      INIT: 'tds_mask_init',
      MOVE: 'tds_mask_move',
      FIN:  'tds_mask_fin'
    },
    //DialogClass: 'TDS.Mask.SimpleDiv', //Just a div with a close, no drag etc
    DialogClass: 'TDS.Mask.Dialog',  //Set if you want to make it create different dialog types
    EnableClickClass: true,
    ClickClasses:[ //Will add click handlers to elements in the page with these classes (and page)
      'thePassage',
      'theQuestions',
      'layoutColumnLeft',
      'layoutColumnRight',
      'itemContainer'
    ],
    isScrollable: function(el){ //PURE blackbox hackery
      //console.log(el, el.nodeName, el.nodeType);
        if (YUD.hasClass(el, 'thePassage') === true || YUD.hasClass(el, 'theQuestions') === true) {
            return true;
        } else return false;
    },
    isTouchScreen: 'ontouchstart' in window ? true : false
    //Other stuff
  },
  EVENTS:  null, //Created once initialized
  CONTROL: null, //Created once initialized
  STATUS: 'off', //For masking button control status
  PAGE: null,    //Default document page.
  initialize: function(){
    //This is called from in the module if it is enabled
    var ctrl =  new TDS.Mask.Control();
        ctrl.setDialogClass(TDS.Mask.Config.DialogClass);
    TDS.Mask.CONTROL = ctrl;

    var em   = new TDS.Mask.EventManager();
        em.setControl(ctrl);
    TDS.Mask.EVENTS  = em;

  },
  getControl: function(){
    return TDS.Mask.CONTROL;
  },
  getEvents: function(){
    return TDS.Mask.EVENTS;
  },
  setPageDom: function(pageDom){
    TDS.Mask.PAGE = pageDom;
  },
  setPageId: function(pageId){
    var ctrl = TDS.Mask.getControl();
    if(ctrl){
      var pId = ctrl.getActivePageId();
                ctrl.setActivePageId(pageId);
      if(pId != pageId){ //Changed pages.
        ctrl.off();
      }
    }
  },
  create: function(pageDom, pageId, evt){ //Requires the actual page dom.
    var ctrl = TDS.Mask.getControl();
    if(!ctrl){ return;}

    pageDom = pageDom || TDS.Mask.PAGE;
    ctrl.newMask(pageDom, pageId, evt);
    this.on(null, pageId);
    this.STATUS = 'on';
  },
  on: function(id, pageId, win){ //optional [id] and [pageId] filters
    win = win || window;
    
    var ctrl = TDS.Mask.getControl(); if(!ctrl){return;}
    (id || pageId) ? ctrl.on({id: id, pageId: pageId}) : ctrl.on();

    var eM = TDS.Mask.getEvents(); if(!eM){return;}
        eM.setPageId(pageId);
        eM.listen(TDS.Mask.PAGE);
  },
  off: function(id, pageId){ //optional [id] and [pageId] filters
    var ctrl = TDS.Mask.getControl();
    if(!ctrl){ return;}
    ctrl.off({id: id, pageId: pageId});     //this is removing all mouse click (mask creating) listeners
    //this.getEvents().sleep();     //commenting this out to KEEP listening to scrolling event (only scroll event) after mask was turned off but existed masks are still showing up.
    this.STATUS = 'off';
  },
  hide: function (id, pageId) {
      var ctrl = TDS.Mask.getControl();
      if (!ctrl) { return; }
      ctrl.hide({ id: id, pageId: pageId });
      this.getEvents().sleep();
      this.STATUS = 'off';
  },
  clear: function(instanceOrId){

  },
  toggle: function() {
    if (this.STATUS === 'off') {
        this.create();
    } else {
        this.off();
    }
  }
};


