/*
 * Requires
 * ==============================================================================
 * require MathJax.js
 * require MathJax.Editor.Config from config.js
 *
 * Classes in this file 
 * ==============================================================================
 *  MathJax.Editor.Config : Provides default settings & unicode helpers.
 *
 *  MathJax.Editor.Store : Global store of all the current Widgets in the page.
 *    .query({containerId: 'someIdToFind'}); //can query on any CFG key
 *    .get(Widget.id);                      //Integer lookup for widgets
 *
 *  MathJax.Editor.KeyPressHandler : Global key press handler.  Singleton.  
 *    -Widget : Allows key editing of only one Widget at a time.
 *    -CODES  : A registry of what to do when users press different keys.
 *              can add/remove listeners for additional keys. 
 *
 *  BASE : Closure class extends MathJax.Object and provides simple css helpers.
 *  COMP : Closure base class extends Base
 *
 *  MathJax.Editor.Widget : Top level container, what is initialized.
 *  -EDIT[]    : each editable line has state and helper operations each edit is a MathJax eq
 *  -CONTENT   : Tabs full of buttons if enabled.
 *  -NAVIGATION: Buttons for moving left, right and deleting (add more to basic nav)
 *  -CONFIGURE : Default config and parsing / serialize helpers for the widget
 *               Also provides the helpers for configuring a widget  
 *  -UTIL      : Helper for searching around the MathJax Eq tree.
 *
 *  Example Initialization:
 * ==============================================================================
 *
 *  new MathJax.Editor.Widget();//New editor in the page
 *
 *  new MathJax.Editor.Widget({
 *    contentLabel: 'string',                //Label for the math
 *    TeX: 'x' || ['x', 'x + 2', '\int x+2'] //Mutiple edit lines, can be TeX
 *  }); 
 *
 *  new MathJax.Editor.Widget({mathML: 'valid math ml' || [mml, mml, mml]});
 *
 *  new MathJax.Editor.Widget({
 *    containerId: 'SomeDomId', //creates if not present in document
 *    tabs: true,               //Provide the default tabs
 *    cb: function(w){},        //Callback with the widget when the equation is parsed/ready
 *  });
 *
 *  new MathJax.Editor.Widget({ //If you want to configure an editor, then save the json cfg
 *    configure: true,
 *    tabs: true
 *  });
 *
 *  Additional editor edit modes.
 *  new MathJax.Editor.Widget({ //If you want to configure an editor, then save the json cfg
 *     TeXEntryMode: MathJax.Editor.Config.TeXEntryMode.None, //.Allow, .Vim   
 *     EditMode: MathJax.Editor.Config.EditModes.REPLACE, //If you want to replace instead of insert
 *  });
 *
 *  For more complex configuration I suggest using the configure: true to poke around at 
 *  the available settings.
 */
//MathJax has some async safety loaders that will need to be properly used.
//Hmm, the requires are a bit of a problem without the full dependency tree 
//(I am probably just missing some clever include file or obvious load [] method and cb)
(function(HUB, AJAX, CONFIG){ 
if(!window.MathJax){return;}

HUB.Queue(//Need to fix this loading we can actually use the editor
  ["Require", AJAX, "[MathJax]/extensions/tex2jax.js"],
  ["Require", AJAX, "[MathJax]/jax/input/TeX/jax.js"],
  ["Require", AJAX, "[MathJax]/extensions/mml2jax.js"],
  ["Require", AJAX, "[MathJax]/jax/input/MathML/jax.js"]
);

MathJax.Editor = MathJax.Editor || {};

var H = MathJax.HTML;
/**
* Simple class which provides some css helper functions and a place to put
* a get/set Editor operations.
*/
var BASE = MathJax.Object.Subclass({
  multiCls: function(cls){ //break the string into a cls hash
    cls = typeof cls == 'string' ? cls.trim().split(' ') : cls;
    cls = [].concat(cls);
    var ret = {};
    for(var i = 0; i < cls.length; ++i){
      ret[cls[i]] = true; 
    }
    return ret;
  },
  stopEvt: function(evt){
    evt = evt || window.event;
    if(evt){ 
      evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
      evt.preventDefault  ? evt.preventDefault() : evt.returnValue = false;
    }
  },
  reCombo: function(multiCls){//Helper, join "true" keys(css cls) into a string
    var str = ''; 
    for (k in multiCls){
      if(multiCls[k]){
        str = str + " " + k;
      }
    }
    return str;
  },
  hasCls: function(idOrDom, cls){
    var el = typeof idOrDom == 'string' ? document.getElementById(idOrDom) : idOrDom;
    if(el && cls){
      if(el.className && el.className.match(cls)) {
        return true;
      }
    }
  },
  //Because we _love_ IE8 (replace with classList support given shim?)
  addCls: function(idOrDom, cls){ //Add a set of classes to the elements
    if(!idOrDom || !cls) return; 
    var elems      = [].concat(idOrDom);

    for (k in elems){
      var add = true;
      var el  = elems[k];
      var multiCheck = this.multiCls(cls); 
      typeof el == 'string' ? el = document.getElementById(idOrDom) : el;
      if(!el){
        console.warn("Could not find a node for: ", el);
        continue;
      }
      var check = (el.className || '').trim().split(" ");
      for (var i = 0; i < check.length; ++i){
        multiCheck[check[i]] = false;
      }
      var add = this.reCombo(multiCheck);
      if(add){
        check.push(add);
        el.className = check.join(" ");
      } 
    }
  },
  removeCls: function(idOrDom, cls){ //remove the classes from the dom elements
    if(!idOrDom || !cls){ return; }
    var elems      = [].concat(idOrDom);
    var multiCheck = this.multiCls(cls); 

    for (k in elems){
      var el  = elems[k];
      typeof el == 'string' ? el = document.getElementById(idOrDom) : el;
      if(!el || !el.className){
        continue;
      }
      //Probably could just regex replace each time
      var check = (el.className || '').trim().split(" ");
      for (var i = 0; i < check.length; ++i){
        if(multiCheck[check[i]]){  check[i] = ''; }
      }
      var f = check.join(" ");
      el.className = f;
    }
  }
});

/**
 *  For all the sub components that require a widget reference to function. 
 */
var COMP = BASE.Subclass({
  Init: function(w){
    this.setWidget(w);
  },
  setWidget: function(w){
    this.WIDGET = w;
    if(!w) return;
    this.CFG    = w.CFG;
  },
  getWidget: function(){
    return this.WIDGET;
  },
  getEdit: function(){
    return this.WIDGET ? this.WIDGET.getEdit() : null;
  },
  getEq: function(){
    var edit = this.getEdit(); 
    if(edit){
     return MathJax.Hub.getAllJax(edit.contentId)[0];
    }else{
      console.error("Unknown equation for this", this, edit ? edit.contentId : null);
    }
  },
  getEqRoot: function(){
    var eq = this.getEq();
    if(eq) return eq.root;
  }
});
MathJax.Editor.Comp = COMP;

/**
* Simple lookup utility  for the widgets / editors that are added into the page.
*/
MathJax.Editor.Store = {};
MathJax.Editor.Store.Widgets = {};
MathJax.Editor.Store.set = function(widgetId, widget){//Set the widget in the store
  MathJax.Editor.Store.Widgets[widgetId] = widget;
  if(widget == null && widgetId){
    delete MathJax.Editor.Store.Widgets[widgetId];
  }
};
MathJax.Editor.Store.get = function(widgetId){//Grab a widget by id
  return MathJax.Editor.Store.Widgets[widgetId];
};
MathJax.Editor.Store.query = function(q){ //Look for an existing Widget by id info
  q = q || {};
  var match = [];
  for (widgetId in MathJax.Editor.Store.Widgets){
    var widget = MathJax.Editor.Store.Widgets[widgetId];
    for (key in q){    
      var val = q[key];
      if(widget && widget.CFG && widget.CFG[key] == val){
        match.push(widget);
      }
    }
  }
  return match;
};
MathJax.Editor.Store.remove = function (widgetId) {
    var widget = MathJax.Editor.Store.Widgets[widgetId];

    if(widget)
        delete MathJax.Editor.Store.Widgets[widgetId];
};

/**
 * Key bindings for the content panel and edit panels for the editors.  Very tempting 
 * to move the input text field into edit, but currenlty there is almost no dom logic 
 * in edit and it seems right to keep it out.
 */
var KPH  = null;
var KEYS = COMP.Subclass({
  //functions take w=> widget, edit => active editor, nE => no text entered, evt => the key event
  $className: 'MathJax.Editor.KeyPressHandler',
  CODES: { 
    ctrlKey:{
      82: [function(w, edit, nE){nE && edit.redo(); }], //r (Cannot use in firefox win or lin)
      90: [function(w, edit, nE){nE && edit.undo(); }], //z

      /*  Todo: Button selection and tab movement
      72: [function(w, edit, nE){w.CONTENT.prevTab(); }],//'h' Select the previous tab
      76: [function(w, edit, nE){w.CONTENT.nextTab(); }],//'l' Select the next tab

      78: [function(w, edit, nE){w.addEditor();}],
      68: [function(w, edit, nE){w.removeEditorObj(w.getEdit());}],
      */

      //Copy paste
      67: [function(w, edit, nE){KPH.copy(w);}], //cntrl c
      86: [function(w, edit, nE){KPH.paste(w);}], //cntrl v

      //Unselect all editors.
      27: [function(w, edit, nE){KPH.sleep(null);}] //ESC
    },
    altKey:{
      //Doesn't seem to be used by any browser..
      72: [function(w, edit, nE){w.CONTENT.prevBtn();}],//h 
      74: [function(w, edit, nE){w.CONTENT.prevTab();}],//j
      76: [function(w, edit, nE){w.CONTENT.nextBtn();}],//l
      75: [function(w, edit, nE){w.CONTENT.nextTab();}] //k
    },
    shiftKey: {
      //Does highlight selection
      37: [function(w, edit, nE){w.CONTENT.prevBtn();}],//ARROW_LEFT
      38: [function(w, edit, nE){w.CONTENT.prevTab();}],//ARROW_UP
      39: [function(w, edit, nE){w.CONTENT.nextBtn();}],//Select content controls if avail 'ARROW_RIGHT',
      40: [function(w, edit, nE){w.CONTENT.nextTab();}] //selects prev tab 'ARROW_DOWN',
    },
    13: [function(w, edit, nE){!nE && edit.updateMath(null, edit.inputField.value); }], //'ENTER' Inserts math
    32: [function(w, edit, nE){!nE && edit.updateMath(null, edit.inputField.value); }],  //SPACE, Insert math 

    //Key Navigation
    37: [function(w, edit, nE){nE && edit.leftQ(); }], //ARROW_LEFT
    38: [function(w, edit, nE){nE && w.prevEdit(); }],//ARROW_UP
    39: [function(w, edit, nE){nE && edit.rightQ(); }],//Select content controls if avail 'ARROW_RIGHT',
    40: [function(w, edit, nE){nE && w.nextEdit(); }],//selects prev tab 'ARROW_DOWN',
    8:  [function(w, edit, nE){nE && edit.remove(); }], //Delete cursor, do update UI 'DELETE', 
    46: [function(w, edit, nE){nE && edit.remove(); }], //Delete cursor, do update UI 'BACKSPACE',

    17: null, //'L CTRL'
    18: null, //'L Alt'

    //Extra movement keys (vimish) only works if you do not have a text entry box enabled.
    27: [function(w, edit, nE){edit.esc(); }], //Hide the text area if in VIMish navigation mode  'ESC'
    /*
    72: [function(w, edit, nE){nE && edit.leftQ(); }],//'LEFT<same>', 'h',
    74: [function(w, edit, nE){nE && w.prevEdit(); }],//'j' Select the next editor
    75: [function(w, edit, nE){nE && w.nextEdit(); }],//'k' Select the prev editor
    76: [function(w, edit, nE){nE && edit.rightQ(); }],//'RIGHT<same>', 'l',
    */

    //88: [function(w, edit, nE){nE && edit.remove();}],  //'DELETE', 'x' (often disabled),
    //68: [function(w, edit, nE){nE && edit.remove();}],  //'DELETE', 'd' (rarely disabled?),
    //85: [function(w, edit, nE){nE && edit.undo(); }],  //'UNDO', 'u' //Bug 114704
    73: [function(w, edit, nE){edit.vimEditable(CONFIG.EditModes.INSERT,  nE); }],//'INSERT', 'i',
    82: [function(w, edit, nE){edit.vimEditable(CONFIG.EditModes.REPLACE, nE);}],//'REPLACE', 'r',
    65: [function(w, edit, nE){edit.vimEditable(CONFIG.EditModes.APPEND,  nE);}],//'APPEND', 'a',

    //Very special and scary : make a fraction if the user presses: '/'  or numpad divide
    191: [function(w, edit, nE){edit.makeFraction(null, edit.grabValue(edit));}],
    111: [function(w, edit, nE){edit.makeFraction(null, edit.grabValue(edit));}] 
  },
  copy: function(w){ //I wish using the clipboard would be easier
     this._cpyBuf = w && w.getEdit() ? w.getEdit().toMathML() : null;
  },
  paste: function(w){ //Paste into the currently selected widget
    if(this._cpyBuf){
      console.log("About to try and paste this.", this._cpyBuf); 
    }
  },
  getSetCallStack: function(keyCode, op){//Get or empty init the calls stack for key presses
    if(typeof keyCode == 'undefined') return; 
    var addTo = this.CODES;
    if(op){ //ctrlKey, etc.  Things you can detect on an event (only ctrl support right now)
      addTo = (this.CODES[op] = (this.CODES[op] || {}));
    }
    if(!addTo[keyCode] && getSet){
      addTo[keyCode] = [];
    }
    return addTo;
  },
  getCallStack: function(keyCode, op){ //Get the keypress stack for a code and operaion(ie ctrl)
    if(typeof keyCode == 'undefined') return; 
    var addTo = this.CODES;
    if(op && addTo[op]){ //ctrlKey, etc.  Things you can detect on an event (only ctrl support right now)
      addTo = addTo[op];
    }
    return addTo[keyCode];
  },
  addEvt: function(keyCode, func, op/* optional: ie ctrlKey */){ //Add a function to the keypress evts
    var add = this.getSetCallStack(keyCode, op, true);
    if(typeof func == 'function' && add) {
      add[keyCode].push(func);
    } else{
      console.error('Invalid function or keyCode provided (keyCode, func, op)', keyCode, func, op);
    }
  },
  replaceEvts: function(keyCode, func, op){//Replace ALL events for a keycode and optional op+keyCode
    var rep = this.getSetCallStack(keyCode, op, true);
    if(rep && typeof func == 'function'){
      rep[keyCode] = [func];
    }else{
      console.error('Could not replace the events with (keyCode, func, op)', keyCode, func, op);
    }
  },
  removeEvts: function(keyCode, op){//Remove all events for a keycode and optionally op+keyCode
    var rm = this.getCallStack(keyCode, op);
    if(rm){
      rm[keyCode] = null;
    }
  },
  runEvents: function(evt, keyCode, op, w, edit){//Run all the events associated with a key, op
    w    = w    || this.getWidget();
    edit = edit || this.getEdit();
    var run = this.getCallStack(keyCode, op);
    if(!w || !edit || !run) return;

    var nE  = !edit.isTextEntered();
    for (var i in run){
      var func = run[i];
      if(typeof func == 'function'){
        func(w, edit, nE, evt);
      }
    }
    //If we have a callstack we have 'handled' the event.
    evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
    evt.preventDefault  && evt.preventDefault();
  },
  keyup: function (evt) { //Key press handler
      try {
          
          evt = evt || window.event;
          var w = this.getWidget();
          if (w && !w.CFG.noKeyboard) {
              var op = evt.ctrlKey ? 'ctrlKey' : null; //Make this smarter
              op = evt.shiftKey ? 'shiftKey' : op;
              op = evt.altKey ? 'altKey' : op;

              //check for character limit restrictions, need to add allow {backspace, arrows, undo, redo keys and special keys}
              if (op != null) {
                  //skip codes
                  this.runEvents(evt, evt.keyCode, op, w);
              }
              else if (w.CFG.checkEditorCharLimit()) {
                  //character limit not exceeded
                  this.runEvents(evt, evt.keyCode, op, w);
              }
              else {
                  //call undo to remove last character
                  w.getEdit().undo();
              }
          }
      } catch (e) {
          console.error("Failed to handle a key event (evt, e)", e);
      }
  },
  enableInputField: function(widget, domNode, mn, mode){ //Enable the field at this dom, for this math node
    this.listen(widget);
    try{
      var edit = widget.getEdit(); //Key could set the text entry, esc remove Text entry?
      if(typeof domNode == 'string'){
        domNode = document.getElementById(domNode);
      }
      mode = mode || edit.editMode;

      //Determine if the node should be read only.
      var textNode = this.getInputField(domNode, mn, mode);
      if(!edit.isTeXEntryEnabled()){
        textNode.readOnly = true; 
        this.addCls(textNode, 'mje_read_only'); this.removeCls(textNode, 'mje_allow_edit');
      }else{
        textNode.readOnly = false; 
        this.removeCls(textNode, 'mje_read_only'); this.addCls(textNode, 'mje_allow_edit');
      }

      if(mode == CONFIG.EditModes.UNSHIFT){ //Place the cursor before other math
        domNode = document.getElementById(widget.getEdit().htmlId);
        domNode.insertBefore(textNode, domNode.firstChild)
      }else if(mode == CONFIG.EditModes.APPEND){ //Place after all math
        domNode = document.getElementById(edit.htmlId);
        domNode.appendChild(textNode);
      }else if(mn && edit.getUtil().isCloseBounding(mn)){
        domNode.parentNode.insertBefore(textNode, domNode); //Insert after the cursor
      }else{
        domNode.parentNode.insertBefore(textNode, domNode.nextSibling); //Insert after the cursor
      }
      edit.inputField = textNode;
      this.removeCls(textNode, 'hidden');//Ensure our editor is visible (many things hide it)

      //Not happy about this, a bit hacky (allow the cursor to "hide" the box placeholder)
      if(mn && edit.getUtil().isBox(mn)){
        this.addCls(textNode, 'mje_box_input');
      }else{
        this.removeCls(textNode, 'mje_box_input');
      }
      ///IE focus issue, any dom manip with focus requires it to process outside the main
      //add to dom loop.
      this.handleDeviceFocus(textNode)
      return textNode;
    }catch(e){
      console.error("Failed to get the replacement field.", e);
    }
  },
  handleDeviceFocus: function(textNode){
      if(this.CFG.isMobile) {
        //Prevents the focus from actually opening the keyboard unless the user actually
        //taps into the button.
      }
      //else if (MathJax.Hub.Browser.isMSIE) { //MathJax.Hub.Browser.isMSIE returns false for IE11 so below hack is not applied on ie11
      //  setTimeout(function(textNode){ textNode.focus();}.bind(this, textNode), 1);
      //}
      else {
          //textNode.focus();
          setTimeout(function (textNode) { textNode.focus(); }.bind(this, textNode), 1); //apply hack for all browsers
      }
  },
  getInputField: function(domNode, mn, mode){//Get an input field where you can type math
    var edit = this.getEdit();
    if(!edit) return;
    var id       = "MathEditorField-" + edit.id;  //This needs to be a complex function/get method?
    var textNode = document.getElementById(id);
    if(!textNode){
      textNode = H.Element("input", {
        style: {}, type: 'text', id: id, className: 'mje_cursor_field'
      });
    }
    if(mn){
      if(!mode || mode != CONFIG.EditModes.APPEND){
        textNode.value   = '';
      }
      textNode.onclick = function(w, evt){//Listen to "this" widget on click
        evt = evt || window.event;
        evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
        KPH.listen(w); 
      }.bind(this, this.getWidget());

      textNode.onkeyup = (function(textNode, domNode, mn, kp){ 
        try{
          kp = kp || window.event;
          //Ensure that if you type 'char' hit delete, it prevents deleting the previous math.
          if((kp.keyCode == 8 || kp.keyCode == 46) && textNode.prev && textNode.prev.length == 1){
            this.stopEvt(kp);
          }
          this.nodeResize(textNode);
          textNode.prev = textNode.value;
        }catch(e){
          console.error("Failed to update the document width.", e);
        }
      }).bind(this, textNode, domNode, mn);
      if(typeof edit.CFG.restrictKeys == 'function'){
        textNode.onkeypress = edit.CFG.restrictKeys.bind(edit);
      }
    }
    this.nodeResize(textNode);
    return textNode;
  },
  nodeResize: function (textNode) {//Helper for resizing the TeX input field if it exists.      
    if(!textNode){ return; }
    var val = textNode.value;
    var len = this.CFG.FontSizePx || 10;
    if(val && val.length){
      len = parseInt(this.CFG.DefaultTextBoxPx) + len*val.length;
    }
    len = Math.ceil(len) + 'px';
    textNode.style.width  = len;
  },
  listen: function(w, target){ //Listen needs to pass in the widget, widget must select editor
    if(!w) return;
    var prevW = this.getWidget();
    if(prevW && prevW != w) {
      prevW.unfocus();
    }
    try{
      target = target || window.document;
      this.sleep(this.getWidget());
      this.setWidget(w);

      if (!this.listener) {
          this.listener = this.keyup.bind(this);
          if (target.addEventListener) {
              //if(!MathJax.Hub.Browser.isMSIE){
              target.addEventListener('keyup', this.listener, false);
          } else if (target.attachEvent) {
              target.attachEvent('onkeyup', this.listener, false);
          }
      }
      this.addCls(w.CFG.containerId, 'mje_selected_widget');
    }catch(e){
      console.error("Failed to listen to the key up events.", e);
    }
  },
  sleep: function(w, target){//Stop paying attention to keypress events on the widget
    try{
      w = w || this.getWidget();
      target = target || window.document;
      if (this.listener) {
          if (target.addEventListener) {
              //if(!MathJax.Hub.Browser.isMSIE){
              target.removeEventListener('keyup', this.listener, false);
          } else if (target.attachEvent) {
              target.detachEvent('onkeyup', this.listener, false);
          }
      }
      this.setWidget(null);
      this.listener = null;

      if(w){
        this.removeCls(w.CFG.containerId, 'mje_selected_widget');
      }
    }catch(e){
      console.error("Failed to detach to the key up events.", e);
    }
  },
  bindUnfocus: function(){//This seems a bit hacky..
    if(!this._bodyClick){
      this._bodyClick = function(){ 
        var w = this.getWidget();
        if(w){
          w.unfocus();
        }
      }.bind(this);
      document.body.onclick = this._bodyClick;
    }
  }
});
KPH = new KEYS();
MathJax.Editor.KeyPressHandler = KPH; //Singleton instance.. make it per editor?



/**
* Util provides some remove support, insert guidelines and a bunch of little 
* tweaks that make editing the math tree "seem" correct.  It contains utility
* functions for searching the math tree, and bubble up functions for trying
* to figure out where you have to replace vs delete a node.
*/
var UTIL = COMP.Subclass({
  $className: 'MathJax.Editor.Util',
  BasicTypes: {mn: true, mo: true, mi: true, chars: true, entity: true}, //Easily replaced / updated
  BasicInsertTypes: {mn: true, mo: true, mi: true, chars: true, texatom: true,  entity: true}, //Simple to append insert in
  NoSelection: {texatom: true, math: true, chars: true, mstyle: true},
  LegalReplace: { //Legal replacement rules, complex types have more issues
    mi: {mi: true, mn: true, mo: true, mrow: true,  entity: true},
    mn: {mi: true, mn: true, mo: true, mrow: true,  entity: true},
    mo: {mi: true, mn: true, mo: true, mrow: true,  entity: true},
    mrow: {mi: true, mo: true, mn: true, mrow: true,  entity: true}, 
    msubsup: {mrow: true}
  },
  InsertRules: {
    //Add a key corresponding to the mathML type pointed at a scoped function
    //Note that these are GLOBAL when defined in this manner.
    //That you want to run.  Ie: msubsup: (function(match, path, to, ins) {}).bind(scope);
  },
  parseTeX: function(text, parent){ //TODO: Strip out invalid characters
    if(text == null || text == "" || text == " "){ //Math jax function?
      return;
    }
    //In the case of a MathML entry?
    if(text.match(/^<math/)){
      //TODO: Parse using the MML parser, ensure it is properly pulled in via mathjax
      console.error("Found mathML in place of TeX");
    }
    text = text.replace(/\\PH/g, this.CFG.placeHold);
    text = CONFIG.getMathVal(text);
    var m = this.getParserTeX().Parse(text).mml();
      MathJax.ElementJax.mml(m); //Is this even useful?
        m.parent = parent;
    return m;
  },
  removeMath: function(node){//Kills this math node (if it can)
    if(node && node.parent && node.type != 'mstyle' && node.type != 'math'){
      var index = this.findSpanIndex(node.parent, node.spanID);
      return this.removeMathAt(node.parent, index, 1);
    }
  },
  removeMathAt: function(mn, position, count){//Remove math from a position in the data arr
    if(mn && mn.data && mn.data.length){
      position = !isNaN(position) ? position : mn.data.length - 1;
      var kill = mn.data[position];
      if(kill && kill.type != 'mstyle' && kill.type != 'math'){
        mn.data.splice(position, count || 1);  
        return kill;
      }
    }
  },
  getContainer: function(mn){ 
    if(!mn){return;}
    if(mn.type == 'mrow'){
      var p = mn.parent;
      if(p.type == 'texatom'){ //always inside an mrow
        p = p.parent;
        return p;
      }else if(p.type == 'mrow'){ 
        return p;
      }
    }
    return mn; //We are our own proper container
  },
  isValue: function(mn, hex, unicode){ //Hex and unicode PURELY to remind people they have to check _both_
    var type = mn ? mn.type : null;
    if(!type || this.BasicTypes[type]) { //It must be a basic element, OR it is a string 
      if(typeof mn == 'string' && (mn == hex || mn == unicode)) return true;
      if(mn && mn.data && mn.data.length == 1) return this.isValue(mn.data[0], hex, unicode);
    }
    return false;
  },
  isBox: function(mn){ //Is the mn an empty element aka: "Box"
    return this.isValue(mn, "#x25FB", "◻");
  },
  isContainer: function(mn){ //Is this an mrow, used to handle mfenced as a container as well.
    if(mn && mn.type == 'mrow'){
      return true;
    }
    return false;
  },
  isNumeric: function(mn){ //Is this maybe part of a number (floating point included)
    if(mn && mn.type == 'mn'){
      return true;
    }
  },
  isDot: function(mn){ //Is it a decimal (thus maybe part of a number
    return this.isValue(mn, '#x002e',  '.');
  },
  isFunction: function(node){//Is this element a function that has a scary hidden element after it?
    if(typeof node == 'string' && node == "#x2061") return true;
    if(node && node.data && node.data.length == 1) return this.isFunction(node.data[0]);
    return false;
  },
  /* Search through all the nodes and determine if the elements are only texatom, mi, mrow
     mn-> The math node to test
     emptinessIsRelative -> Used only in the editor call to determine if the math is 'empty'
       for example a person entering only \frac \Box \Box has not really entered anything,
       but for non-human emptiness, the box fraction is considered empty and must be cleaned
       up or will mrow.  You probably do NOT want to set the flag ever.
  */
  getValue: function(mn){
    if(!mn){return;}
    var str = null;
    if(mn && this.BasicTypes[mn.type] && mn.data[0]){
      str = mn.data[0].toString();
    }else if(mn.type == 'chars'){
      str = mn.toString();
    }else if(typeof mn == 'string'){
      str = mn;
    }
    return str;
  },
  isCloseBounding: function(mn){ //Test this.
    var str = this.isBounding(mn);
    if(str == ')' || str == '|'){
      if(this.findSpanIndex(mn.parent, mn.spanID) == mn.parent.data.length-1){
        return str;
      }
    }
  },
  isOpenBounding: function(mn){ //Test this...
    var str = this.isBounding(mn);
    if(str == '(' || str == '|'){
      if(this.findSpanIndex(mn.parent, mn.spanID) == 0){
        return str;
      }
    }
  },
  isBounding: function(mn){ //Test if an mn is actually a paren.
    var str = this.getValue(mn);
    if(str == '|' || str == '(' || str == ')'){
      return str; 
    }
    return null;
  },
  isBounded: function(mn){
    if(mn && mn.type == 'mrow' && this.isBounding(mn.data[0])){
      return true;
    }
    return false;
  },
  isEmpty: function(mn, emptinessIsRelative){ //A dfs with an empty hash will match any element (test)
    mn = mn || this.getEqRoot();
    var matchFunc = function(emptinessIsRelative, mn, types){ 
      if(emptinessIsRelative && mn && mn.type != 'mrow' && this.isComplex(mn)){
        return true;
      }
      //Box is considered 'empty'
      if(mn && types[mn.type] && !(this.isBox(mn) || this.isBounding(mn))){ 
        return true; 
      }
      return false;
    }.bind(this, emptinessIsRelative ? true : false);
    if(emptinessIsRelative && !matchFunc(mn, this.BasicTypes)){
      return false; 
    }
    return this.dfs(mn, this.BasicTypes, matchFunc) ? false : true;
  },
  isRoot: function(node){ //Test if the math node is our top level insert el
    if(node && (node.type == 'mstyle' || node.type == 'math')){
      return true;
    }
    return false;
  },
  isComplex: function(mn, types){ //Is the mn a complex element made up of many mn, mo etc
    if(!mn) return false;
    types = types || this.BasicTypes;
    var match = function(types, mn){
      if(mn && typeof mn != 'string' && (!types[mn.type] || mn.type == null)){
        return true;
      } 
      return false;
    }.bind(this, types);

    if(!types[mn.type]){ //Quick check to see if we don't have to dfs
      return true;
    }else{
      var isComplex = this.dfs(mn, {}, match); 
      return isComplex ? true : false;
    }
  },
  findSpanIndex: function(p, spanID){ //Find the index of a span in the parent node
    for (var i = 0; i < p.data.length; ++i){
      if(p.data[i] && p.data[i].spanID == spanID){
        return i;
      }
    }
    return null;
  },
  bubble: function(ref, match, matchFunc, pathResult){ //Searches up the math tree
    if(!ref) return;

    match      = match      || this.BasicTypes;
    pathResult = pathResult || {}; 
    matchFunc  = matchFunc  || this.matched;

    //Reference the last node we bubbled up through
    if(!pathResult.match && (matchFunc(ref, match) || this.isRoot(ref))){
      pathResult.match = ref;
    } 
    if(!pathResult.match){
      pathResult.path = ref; 
      this.bubble(ref.parent, match, matchFunc, pathResult);
    }
    return pathResult;
  },
  depth: function(){ //Determine how "deep" the math tree is, will be used to auto zoom?
    var eq    = this.getEq();
    var match = {suffer: true};
    this.dfs(eq.root, {no_match_ever: 'thing'}, null, match);
    return match && match.depth ? match.depth : 0;
  },
  getCommonParent: function(nodes){
    if(!nodes || !nodes.length) return;

    var ids = [];
    var mn = null;
    for(var i = 0; i < nodes.length; ++i){
      mn = nodes[i];
      if(mn && mn.spanID){
        ids.push(mn.spanID);
      }
    }
    return this.bubble(nodes[0], ids, this.contains.bind(this));
  },
  //Does the math node contain all the ids, id can be string, arr of ids, or {id: false}
  contains: function(mn, ids, searchResult){ 
    var search = searchResult || {containsALL: true};
    if(!ids || !mn) return search;

    //Massage the search param into a nice hash lookup
    if(typeof ids == 'string' || typeof ids == 'number'){
      search[ids] = false;
    }else if(ids.indexOf && ids.length){
      for(var i=0; i < ids.length; ++i){
        search[ids[i]] = false;
      }
    }
    //Check the node against our list of valid search nodes.
    var matchFunc = function(search, mn){
      if(mn && search[mn.spanID] === false){
        search[mn.spanID] = true;
      }
    }.bind(this, search); 
    matchFunc(mn); //Detect if the topmost node if the node is itself a search node 

    this.dfs(mn, {}, matchFunc);
    for(var k in search){ //Ensure we actually found all the nodes vs missing some.
      if(!search[k]){
        search.containsALL = false;
      }
    }
    return search.containsALL;
  },
  dfs: function(ref, match, matchFunc, pathResult, rI, depth){ //Default will be left dfs
    return this.dfsL(ref, match, matchFunc, pathResult, rI, depth);
  },
  dfsR: function(ref, match, matchFunc, pathResult, rI, depth){
    pathResult = pathResult || {};
    matchFunc  = matchFunc  || this.matchedNoParen.bind(this);
    depth = depth || 1;
    if(ref && ref.data){
      rI = !isNaN(rI) && rI!=null && rI < ref.data.length && rI >=0 ? rI : 0;
      mn = null;
      for (var i = rI; i < ref.data.length; ++i){
        if(pathResult.node){ break; };
        mn = ref.data[i];
        if(matchFunc(mn, match)){
          pathResult.node = ref.data[i];
          return pathResult.node;
        } else if(!pathResult.node){
          this.dfsR(mn, match, matchFunc, pathResult, null, ++depth);
          depth--;
        }
      }
    }
    if(!pathResult.depth || pathResult.depth < depth) pathResult.depth = depth;
    return pathResult.node;
  },
  dfsL: function(ref, match, matchFunc, pathResult, rI, depth){
    depth = depth || 1;
    pathResult = pathResult || {};
    matchFunc  = matchFunc  || this.matchedNoParen.bind(this);
    if(ref && ref.data){
      rI = !isNaN(rI) && rI != null && rI < ref.data.length ? rI : ref.data.length-1;
      var mn = null;
      for (var i = rI; i >= 0; --i){
        if(pathResult.node){ break; };
        mn = ref.data[i];
        if(matchFunc(mn, match)){
          pathResult.node = mn;
          return pathResult.node;
        } else if(!pathResult.node){
          this.dfsL(mn, match, matchFunc, pathResult, null, ++depth);
          depth--;
        }
      }
    }
    if(!pathResult.depth || pathResult.depth < depth) pathResult.depth = depth;
    return pathResult.node;
  },
  exclude: function(mn, match){ //A match function for excluding nodes
    if(!match[mn.type]){ 
      return true;
    }
  },
  matchedNoParen: function(ref, match){
    if(!this.isBounding(ref)){
      return this.matched(ref, match);
    }
  },
  matched: function(ref, match){ //A match function for finding the first of a type
    if(!ref) return false; 
    var truth = true;
    match = match || {};
    for (key in match){
      if(key && typeof match[key] == 'string'){ //Handle matching against a string.
        var m = {}; 
        m[match[key]] = true; 
        match[key]    = m;
      }
      if(match[key] && !match[key][ref[key]]){
        truth = false;
        break;
      }
    }
    return truth;
  },
  getParserTeX: function(){ //Get the TeX parser.
    return this.parser || MathJax.InputJax.TeX; //Need to load this correctly
  },
  parenTypes: {msubsup: true, mrow: true},
  addParensInComplexMrows: function(mn, doAdd){ //For looks and clarity we must insert parens for sub sup rows.
    if(!mn) return;
    var base = mn;
    this.dfs(base, this.parenTypes, function(mn, types){
      if(mn && mn.parent && types[mn.parent.type]){
        if(mn.type == 'mrow' && mn.parent.type == 'mrow'){
          return; //We only want to add one set of parens at most
        }
        if(mn.type == 'texatom'){ //Handle a wrapped mrow (that is in a texatom)
          var sub = mn.data[0];
          if(sub && sub.type == 'mrow'){
            mn = sub;
          }
        }
        if(mn.type == 'mrow' && !mn.open && !mn.close){
          if(!mn.spanID){mn.spanID='ADD_PARENS';}
          this.addParensToMrow(mn);
          if(mn.spanID == 'ADD_PARENS'){mn.spanID=null;}
        }
      }
    }.bind(this));
  },
  addParensToMrow: function(mn){ //Add parens around the mrow for clarity (if they are not already there).
    var p      = mn.parent;
    var fenced = this.parseTeX('\\left( \\right)', p); //Fenced parent is now set to p by this call
    var index  = this.findSpanIndex(p, mn.spanID);

    //Inserts the newly paren modified mrow into the parent node at the proper index
    p.data[index] = fenced;

    //Set the fence data to the mrow, ensure the mrow has a new parent
    this.mergeNodes(fenced, mn);
  },
  createMrow: function(parent, elems){ //Creates an empty mrow
    var row = this.parseTeX('mrow');//TODO: Hacky but funny at the same time, find correct method.
    row.data = []; 
    row.parent = parent;
    if (elems){
      row.data = row.data.concat(elems);
      for(var i =0; i < row.data.length; ++i){  
        row.data[i].parent=row;
      }
    }
    return row;
  },
  mergeNodes: function(match, ins, index){ //For merging mrow
    if(match && ins && match.data){
      index = index || 0;
      if(ins.type == 'mrow' && ins.open){ //mathjax 2.2, no mfenced to use as a crutch
        ins.parent = match;
        match.data.splice(index+1, 0, ins);
      }else if(ins && ins.data){
        for(k in ins.data){
          var d = ins.data[k];
              d.parent = match;
          match.data.splice(++index,0, d);
        }
      }
    }
    return match;
  },
  /**
   * Handles the insert of an element into a "complex" parent node.  This lets
   * us insert elements and ensure we merge mrows, and replace simple elements
   * with an MN when within something like a frac
   */
  complexInsert: function(match, path, to, ins){
    CONFIG.DEBUG && console.log("The node is complex.", 'match: ', match, 'type: ', match.type, 'path: ', path, 'to: ', to, 'ins: ', ins);
    if(!match || !ins) return;
    try{
      //Case where user clicks the sqrt/frac etc
      if(this.isComplex(to) && match.type != 'mrow'){
        var m = this.bubble(match, {type: {mrow: true}});
        if(m && m.match){
          match = m.match;
          path  = m.path ? m.path : path;
        }
      }
      //This seems like it should trigger the chained mrow... maybe
      if(match.type != 'mrow'){
        if(ins.type != 'mrow'){
          ins = this.createMrow(match, ins);    
        }
      }
      //Must get the index of the element before we remove it.
      var index = path ? this.findSpanIndex(match, path.spanID) : null; 
      if(!this.isComplex(to) && ins.type == 'mrow'){
        if(match != to && match.type != 'mrow'){
          this.removeMath(to);
          ins.data.unshift(to);
          to.parent = ins;
          index--; //(since we are removing the current element from that index)
        }
      }
      ins = this.basicInsert(match, path, to, ins, index);
    }catch(e){
      console.error("Failed to properly handle a complex insert (this, e, match, path, to, ins) ", 
        this, e, match, path, to, ins
      );
    }
    return ins;
  },
  basicInsert: function(match, path, to, ins, index){ //insert after a matching node, merge mrows
    CONFIG.DEBUG && console.log("Basic insert of match", match, " path", path, " to ", to, " ins ", ins, " index ", index);
    if(!match || !ins) return;

    if(path){
      var index = !isNaN(index) && index != null ? index : this.findSpanIndex(match, path.spanID);
      if(match.type == 'mrow' && ins.type =='mrow'){
        this.mergeNodes(match, ins, index);
      }else if(index != null){
        ins.parent = match; 
        match.data.splice(index+1, 0, ins);
      } 
    }else if(match.type == 'mstyle' || match.type == 'math'){
      match.data[0].Append(ins); //This should be rare...
    }else if(match.type == 'mrow' && ins.type == 'mrow'){
      var index = null;
      if(match.parent.type == 'mrow'){ //special case... another one dealing with complex mrows
        index = this.findSpanIndex(match.parent, match.spanID);
        match = match.parent;
      }
      this.mergeNodes(match, ins, index); 
    }else if(match.type == 'mrow' && this.isBounding(match.data[0])){ 
        //Possible nasty bugs.
        var p     = this.getContainer(match);
        var index = this.findSpanIndex(p, match.spanID); 
        if(index != null){
          ins.parent = p;
          p.data.splice(index+1, 0, ins); 
        }else{
          match.Append(ins);
        }
    }else{
        match.Append(ins); 
    }
  },
  Insert: function(match, path, to, ins){//Top level insert so you can add custom InsertRules
    if(!match) return;
    if (typeof this.InsertRules[match.type] == 'function'){
      var func = this.InsertRules[match.type]; //Hope you scoped this correctly.
          func(match, path, to, ins);
    }else if(!this.BasicTypes[match.type]){ 
      this.complexInsert(match, path, to, ins);
    }else{
      this.basicInsert(match, path, to, ins);
    }
  },
  findLegalParent: function(ref, type, types){ //Find a legal place to insert the math
    var legal = types || {type: this.LegalReplace[type]};
    var into = this.bubble(ref, legal);
    return into;
  },
  getLegalSelection: function(targetNode){ //A dom node the user clicked on
    var mn = null;
    if(targetNode && targetNode.id){
      mn = this.findNode(targetNode.id); 
      if(this.isBounding(mn)){ //Simpler mrow selection when you click a paren.
        mn = mn.parent;
      }
    }
    return mn;
  },
  findActualTarget: function(idOrDom){ //Find the math node for this dom spanID
    var target = (typeof idOrDom == 'string') ? document.getElementById(idOrDom) : idOrDom;
    if(!target){
      return false;
    }
    while (target && !target.id){ //Look up the tree for a proper math node vs container
      target = target.parentNode 
    }
    return target;
  },
  //Helper function to go from dom ID to internal MathJax ID information
  findNode: function(spanId){ 
    if(!spanId || !spanId.match){
      console.error("You told me to find a node but didn't provide an id.", spanId);
      return;
    }
    var maths = this.getEq();
    var id  = spanId.match(/\d+/);
    if(id && id.length){
       id = id[0];
    }
    return this.dfs(maths.root, {spanID: id}, this.matched);
  }
});

/**
  Main edit manager, text area that will allow you to add new content / over-write existing content
Will provide the next, previous and update capabilities (hopefully without screwing up the MathML)
*/
var EDIT = COMP.Subclass({
  $className: 'MathJax.Editor.Edit',
  Init: function(w){ //TODO: Call via superclass methods.
    this.WIDGET = w;
    this.CFG    = w.CFG;

    this.cursor  = null;
    this.updateCb  = [];

    this.ALLOW_HISTORY  = true;
    this.historyArr     = []; //This needs to be some hideous tree of complex... bleah
    this.historyPointer = -1;

    this.inputField = null;
  },
  getEq: function(){//Return this editors equation, not the Widgets current editor.eq
    //Override is intentional!!!
    return MathJax.Hub.getAllJax(this.contentId)[0];
  },
  searchIn: { //Useful for determining if we should be able to edit a node
    mn: true,
    mo: true,
    mi: true
  },
  setEditMode: function(m){ //CONFIG.EditModes
    this.editMode        = CONFIG.EditModes[m] || CONFIG.EditModes.DEFAULT;
    this.defaultEditMode = this.editMode;
    if(this.editMode == CONFIG.EditModes.REPLACE){
      this.toggleEditMode = CONFIG.EditModes.INSERT;
    } else {
      this.toggleEditMode = CONFIG.EditModes.REPLACE;
    }
    if(this.isEmpty(null, true)){
      this.editMode = CONFIG.APPEND;
    }
  },
  getEditMode: function(){//Currently active edit mode
    return this.editMode;
  },
  setEditCls: function(clsHash){ //The css classes to apply while selecting nodes
    this.clsForEdit = clsHash || CONFIG.EditCls;
  },
  getClsForEditMode: function(mode){//Do a lookup for the current edit mode
    if(!this.clsForEdit){
      this.setEditCls(null); //Use defaults
    }
    return this.clsForEdit[mode || this.editMode];
  },
  insertPending: function(cb){ //Insert any text the user has entered for an editor (unfocus, click around etc)
    var val = this.grabValue();
    if(val){
      this.updateMath(null, val, null, cb);
    }
  },
  grabValue: function(edit){//Grab the value out of an input field and empty the field
    if(this.inputField){
      var val = this.inputField.value;
      this.inputField.value = '';
      KPH.nodeResize(this.inputField);
      return val;
    }
  },
  isTextEntered: function(){//Did the user type something into an input field on this editor?
    if(this.isTeXEntryEnabled() && this.inputField){
      var f = this.inputField;
      if(f){
        var val = f.value + ''; //Ensure we are treating this like a string and not a \d
        if(val.length > 0){
          return true;
        } 
      }
    }
    return false;
  },
  isTeXEntryEnabled: function(){//Should we have an input text box vs force button use
    return this.CFG.isTeXEntryEnabled();
  },
  sanitizeTeX: function(initialText){ //Hacks to make some Tex entry things along
    if(this.CFG.SanitizeTeXEnabled){
      if(typeof this.CFG.sanitizeTeX == 'function'){
        return this.CFG.sanitizeTeX(initialText); //Defaults to CONFIG.sanitizeTeX
      }
    }
    return initialText;
  },
  /**
   *  These functions handle some strange behavior around fractions, powers and subs.  Basically
   *  in the few cases where the user selects an item, and enters \\frac \\Box \\Box or \\Box^\\Box
   *  we want the selection to be be in the place of the first box.
   *
   *  ie \\frac \\Box \\Box -> \\frac {cursor selection} \\Box 
   *     \\Box^\\Box        -> {cursor selection}^\\Box
   *
   *  Note this will _not_ occur if the selected element is an mo (ie +, -)  
   */
  magicHandler: function(p, mn){ //Sub in the 'replacement' node into the first box placeholder
    var util = this.getUtil();
    var guess =  this.guessTheDesiredCursor(p);  //Find a box
    if(mn && util.isBox(guess)){

      //At this point it doesn't have a valid spanID, but we still need to insert into the correct
      //index lookup.  The index replacement in the replace function is based off spanID lookups.
      guess.spanID = guess.spanID || "FAKE_MAGIC_SPAN_ID"; 
      this.replace(guess, mn); //Replace the box
      this.setCursor(this.guessTheDesiredCursor(p));  //Find a box
      if(guess.spanID == "FAKE_MAGIC_SPAN_ID"){
        guess.spanID = null;
      }
      if(mn.spanID == 'MAGIC_NUMBER'){
        mn.spanID = null;
      }
      return mn;
    }
  },
  confirmEditMode: function(mn, text, magic, eM){ //For the updateMath function, ensure we are in the right edit mode.
    var util = this.getUtil();
    if(!mn && util.isEmpty(null, true)){
      eM = CONFIG.EditModes.APPEND;
    } else if(mn && util.isBox(mn) && 
        this.editMode !== CONFIG.EditModes.APPEND && 
        this.editMode != CONFIG.EditModes.UNSHIFT){
      eM = CONFIG.EditModes.REPLACE;
    } else if(magic){
      eM = CONFIG.EditModes.REPLACE;
    } else if(!eM){
      eM = this.getEditMode();
    }
    return eM;
  },
  queueUpdate: function(mn, text, eM, cb){//update the math respecting the MathJax Queue orders
    try{ 
      //Get the current cursor
      mn = mn || this.getCursor();

      //Sanitize any text, parse the TeX.
      var util  = this.getUtil();
      var newMn = util.parseTeX(this.sanitizeTeX(text));
      
      //Attempt to guess the proper edit mode (defer to user, check it isn't crazy)
      eM = eM || this.isEmpty(null, true) ? CONFIG.EditModes.APPEND : this.editMode;
      var magic = this.isMagic(mn, newMn, eM);
      if(magic){
        mn = this.selectNumbers(mn);
      }
      eM = this.confirmEditMode(mn, newMn, magic, eM);

      //Not magical, but must 'fake' a left cursor selection (ugly... want to put this elsewhere)

      CONFIG.DEBUG && console.log("Edit mode given math.", eM, newMn);
      //Actually insert the new math
      if(eM == 'INSERT'){
        mn = mn || this.getCursor();
        mn = this.handleClosedBounding(mn);
        this.insert(mn, newMn);
      }else if(eM == 'APPEND'){
        this.append(newMn); //Always appends to the last part of a row
      }else if(eM == 'UNSHIFT'){
        this.unshift(newMn); //Always appends to the first part of the math
      }else{
        var rep = this.replace(mn, newMn, null, magic);
        if(magic){
          newMn = this.magicHandler(newMn, mn);
        }
      }
      util.addParensInComplexMrows(this.getBaseMrow(), this.allowRemove.bind(this));
      if(magic){
        this.Update(cb);
      }else{
        this.UpdateGuessCb(newMn, cb);
      }
    }catch(e){
      console.error("Failed to update the math (mn, newMn, e)", mn, newMn, e);
    }
  },
  updateMath: function(mn, text, eM, cb){//Update the math with the currently selected edit mode.
    this.setTempMrow(null); //"Save the state of the row revert"
    MathJax.Hub.Queue(this.queueUpdate.bind(this, mn, text, eM, cb));
  },
  toMathML: function(){//Convert this edit equation to mathML
    var eq = this.getEq();
    if(eq && eq.root){
      this.revertTempMrow();
      return eq.root.toMathML();
    }else{
      console.error("No equetion present in this editor", this);
    }
  },
  history: function(mml){ //Keep a history of the edits, bad / start of undo/redo
    if(!this.ALLOW_HISTORY) return;
    this.historyArr[++this.historyPointer] = mml;
    if(this.historyArr.length > CONFIG.HistoryLength){ //Some conf value?
      this.historyArr.shift();
      this.historyPointer = this.historyArr.length - 1;
    }
  },
  updateMathML: function(mmlString){//TODO:  There MUST be a better way...
    if(mmlString){//Use a mathML parser to update the current eq
      this.ALLOW_HISTORY = false;
      try {
        //Ensure the parser is defined.  It is not loaded if no mathML has been parsed
        //ie: only TeX was passed to the various items you are creating.
        if(!MathJax.InputJax.MathML.ParseXML){
          MathJax.InputJax.MathML.ParseXML = MathJax.InputJax.MathML.createParser();
        }

        var parsed = MathJax.InputJax.MathML.Parse(mmlString);
        if(parsed){
          var mml = MathJax.ElementJax.mml(parsed.mml);
          var eq = this.getEq();
          eq.root = mml.root;

          this.UpdateGuessCb(null, function() { this.ALLOW_HISTORY = true}.bind(this));
        }
      }catch(e){
          console.error("Failed to parse (mmlString, mml, e)", mmlString, mml, e); //p, invalid argument
      }
    }
  },
  undo: function(cb){//Undo the last edit
    if(this.historyPointer > 0){
      this.historyPointer--;
      var mml = this.historyArr[this.historyPointer];
      MathJax.Hub.Queue(this.updateMathML.bind(this, mml));
      return mml;
    }
  },
  redo: function(cb){//Move forward in the edit stack if we can
    if(this.historyPointer < (this.historyArr.length - 1)){
      this.historyPointer++;
      var mml = this.historyArr[this.historyPointer];
      MathJax.Hub.Queue(this.updateMathML.bind(this, mml));
      return mml;
    }
  },
  getFormInput: function(){//TODO: Fix so this works on a per editor basis.
    var inputId = this.CFG.getFormInputId(this);
    if(!inputId){return;}

    var input = document.getElementById(inputId);
    if(!input){
      input = H.addElement(document.getElementById(this.rowId), 'input', {
        type: 'text', className: 'hidden', id: inputId, name: inputId
      });
    }
    return input;
  },
  setInput: function(dom){//TODO: Fix to handle multiple editors
    if(!dom) return;
    this.input = dom;
  },
  updateInput: function(mml){//Update the input dom & history
    var input = this.getFormInput();
    if(input){ 
      mml = typeof mml != 'undefined' ? mml : this.toMathML();
      if(mml){
        input.value = mml
        this.history(mml);
      }
    }
  },
  addUpdateCb: function(cb){//Add a cb to run after the Hub updates the equation
    if(typeof cb != 'function') return;
    this.updateCb.push(cb);
  },
  runUpdateCb: function(){ //Run all the current callbacks.
    for (var i = 0; i < this.updateCb.length; ++i){
      this.updateCb[i]();
    }
  },
  setLabel: function(label){ //Look to see if we have a label based on editor id... Hacky...
    if(!this._labelDom && label){
      this._labelDom = H.Element('span', {className: 'mje_label_span'});
      var d = document.getElementById(this.rowId);
      if (d) {
          //d.parentNode.insertBefore(this._labelDom, d);          
          d.insertBefore(this._labelDom, d.firstChild);
      }
    }

    if(this._labelDom){
      this._labelDom.innerHTML = label;
      if(label != null && label != ''){
        this.addCls(this.rowId, 'mje_row_has_label');
      }else{
        this.removeCls(this.rowId, 'mje_row_has_label');
      }
    }
    return this._labelDom;
  },
  htmlHack: function(id){
    if(this.htmlId != this.CFG.contentId){
      var d = document.getElementById(this.htmlId);
      if(d){
        d.parentNode.removeChild(d);
      }
    }
  },
  UpdateGuessCb: function(mn, cb){ //Update and gess where the cursor should be
    this.Update(function(mn){
      var guess = this.guessTheDesiredCursor(mn); 
      this.setCursor(guess || this.getLast());
      this.makeEditable();
      if(typeof cb == 'function') cb(mn);

    }.bind(this, mn, cb));
  },
  Update: function(cb){//Run the mathjax hub update, then any callbacks.
    MathJax.Hub.Queue(
        this.htmlHack.bind(this),
        ["Update", this.getEq()], 
        this.runUpdateCb.bind(this)
    );
    if(typeof cb == 'function'){
      MathJax.Hub.Queue(cb);
    }
  },
  getParserTeX: function(){//Get the MathJax TeX parser
    return this.parser || MathJax.InputJax.TeX; //Need to load this correctly
  },
  setUtil: function(util){//Reference to the current Util class
    this.UTIL = util;
  },
  getUtil: function(){
    return this.UTIL;
  },
  left: function(c, search, force){ //Goes from the "right most" element in the tree, left.
    search = typeof search == 'function' ? search : this.allowSelection.bind(this);
    try{
      var possible = null;
      var eM       = this.editMode;
      this.editMode = this.defaultEditMode; //always reset to default mode

      //If we are in append, we don't want to go left, we want to select last.
      if(!force && eM == CONFIG.EditModes.APPEND){
        if(search(this.getLast())){
          this.makeEditable(this.getLast());
          return;
        }
      }

      //Grab the current cursor and test if we are already too high up the tree
      c = c || this.getCursor();
      if(!c || !this.allowRemove(c) || eM == CONFIG.EditModes.UNSHIFT){
        this.enableUnshiftMode(); 
        return; 
      }

      //Came in with this node, trying to find the next good one.
      var util  = this.getUtil();
      var index = util.findSpanIndex(c.parent, c.spanID);
      if(index > 0){
        for (var i = index-1; i >= 0; --i){ 
          if(possible = c.parent.data[i]){ //Skips some null entries
            if(!util.isBounding(possible)){
              break; 
            }
          }
        }
        if(possible && !this.searchIn[possible.type]){
          possible = util.dfsL(possible, {type: this.searchIn}) || possible;
        }else if(util.isBounding(possible) && !util.isOpenBounding(possible)){
            possible = c.parent; 
        }
      }else{//If we are at the leftmost element, see if we can select the parent.
        possible = c.parent;
      }

      //Test if we can make it editable, else go up a level.
      if(possible && (search(possible) || util.isOpenBounding(possible))){
        this.makeEditable(possible);
      }else{
        this.left(c.parent, search);
      }
    }catch(e){
      console.error("Failed to move left (c, search, e)", c, search, e);
    }
  },
  leftQ: function(c, search, count){//go left from a node, optional
    count = count || 1;
    this.insertPending();
    for(var i =0; i<count; ++i){
      MathJax.Hub.Queue(this.left.bind(this, c, search));
    }
  },
  right: function(c, search, force){ //Goes from the "left most" element to the right
    search = typeof search == 'function' ? search : this.allowSelection.bind(this);
    try{
      var possible = null;
      var eM       = this.editMode;
      this.editMode = this.defaultEditMode;

      //If we are in unshift mode, we want to jump to the leftmost element
      if(!force && eM == CONFIG.EditModes.UNSHIFT){
        if(search(this.getFirst())){
          this.makeEditable(this.getFirst());
          return;
        }
      }
      //If not we start searching, first test if we are all the way right.
      c = c || this.getCursor();
      if(!c || !this.allowRemove(c) || eM == CONFIG.EditModes.APPEND){
        this.enableAppendMode();
        return;
      }
      var util  = this.getUtil();
      var index = util.findSpanIndex(c.parent, c.spanID);
      if(index < c.parent.data.length - 1){
        for (var i = index+1; i < c.parent.data.length; ++i){ 
          if(possible = c.parent.data[i]){ 
            if(!util.isBounding(possible)){
              break; 
            }
          }
        }
        if(possible && !this.searchIn[possible.type]){ 
          possible = util.dfsR(possible, {type: this.searchIn}) || possible;
        }else if(util.isBounding(possible) && !util.isCloseBounding(possible)){
          possible = c.parent;
        }
      }else{ //If we are at the rightmost element, test if we can select the parent.
        possible = c.parent;
      }
      if(possible && (search(possible) || util.isCloseBounding(possible))){
        this.makeEditable(possible);
      }else{ 
        this.right(c.parent, search);
      }
    }
    catch(e){
      console.error("Failed to move to the right (c, search, e)", c, search, e);
    }
  },
  rightQ: function(c, search, count){
    count = count || 1;
    this.insertPending();
    for(var i=0; i<count; ++i){
      MathJax.Hub.Queue(this.right.bind(this, c, search));
    }
  },
  allowSelection: function(mn){
    if(!mn) return false;
    if(mn.type == 'texatom' || this.getUtil().isBounding(mn)) return false;
    if(this.allowRemove(mn)){//Checks it is not a root element
      return true;
    }
    return false;
  },
  emptyEqCheck: function(){
    try{
      //If you cannot remove it should go into append (either root, style, basemrow)
      if(this.getUtil().isEmpty()){
        var mn = this.getLast();
        if(!mn || !this.allowRemove(mn)){
          this.enableAppendMode();
        }
      }
    } catch (e){
      console.error('Empty equation check.', e);
    }
  },
  enableUnshiftMode: function(){ //Force the cursor to be before the current math eq
    this.editMode = CONFIG.EditModes.UNSHIFT;
    KPH.enableInputField(
        this.getWidget(), 
        this.CFG.contentId, 
        this.getBaseMrow(), 
        this.editMode
    );
    this.removeHighlight();
    this.setCursor(this.getFirst());
  },
  enableAppendMode: function(){ //Turn on appending (user moved right enough)
    this.editMode = CONFIG.EditModes.APPEND;
    KPH.enableInputField(this.getWidget(), this.CFG.contentId, this.getBaseMrow(), this.editMode);
    this.removeHighlight();
    this.setCursor(this.getLast());
  },
  isEmpty: function(mn, emptinessIsRelative){ //Is the eq "empty", relative is that a \\Box is empty
    return this.getUtil().isEmpty(mn || this.getEqRoot(), emptinessIsRelative);
  },
  //By default we want to merge into a row, mstyles have a top level mrow
  //which we try to locate for append and unshift edits (TODO: clean this up?)
  getBaseMrow: function(root){ //Find a place to put more math 
    var mn = this.getStyleRow(root);
    if(mn && (mn.type == 'mstyle' || mn.type == 'math')){
      var mr = mn.data[0];
      if(mr && mr.type == 'mrow'){
        mn = mr;
      }
      if(mn.data[0] && mn.data[0].type == 'texatom'){
        mr = mn.data[0].data[0];
        if(mr && mr.type == 'mrow'){
          mn = mr;
        }
      }
    }
    return mn;
  },
  getStyleRow: function(root){ //Get either the math root, or default mstyle node
    root     = root || this.getEqRoot();
    var row  = this.getUtil().dfs(root, {type: {mstyle: true}}) || root;
    return row;
  },
  guessTheDesiredCursor: function(mn){ //Try to select what the user most likely wants highlighted
    if(!mn) return;
    var util  = this.getUtil();

    var found = null;
    if(util.isBox(mn)){  //dfs does _not_ check the initial node
      found = mn;
    }else{
      found = util.dfsR(mn, {}, util.isBox.bind(util));
    }
    if(!found){
      if(this.searchIn[mn.type]){
        found = mn;
      }else{
        found = util.dfsL(mn, {type: this.searchIn});
      }
    }
    return found;
  },
  /** This is _only_ safe'ish because we have not assigned a valid spanID or updated the math
   *  so we know we can unroll the "row" back into the parent which was a valid container for
   *  all the math we moved into the mrow.
   */
  revertTempMrow: function(){ //This maybe a horrible idea, reverts the temp mrow when possible
    if(this.REVERT_ROW_HELL){
      var mn = this.REVERT_ROW_HELL;
      var p = mn.parent;

      mn.magic  = true;
      mn.spanID = 'MAGIC_TEMP_MROW';
      var index = this.getUtil().findSpanIndex(p, mn.spanID);
      mn.spanID = null;

      p.data.splice(index, 1);
      for(var i=0; i < mn.data.length; ++i){
        var into = mn.data[i];
        into.parent = p;
        p.data.splice(index+i, 0, into);
      }
      this.REVERT_ROW_HELL = null;
    }
  },
  //Setting to null implies we now consider the row "valid" and it will be assigned a valid spanID
  setTempMrow: function(mn){
    this.REVERT_ROW_HELL = mn;
  },
  selectRowRange: function(start, end, p){
    var mrow = this.makeRowRange(start, end, p); 
    if(mrow){
      this.Update(function(mrow, isTempMrow){
        this.makeEditable(mrow, this.defaultEditMode);
        if(!isTempMrow){
          this.setTempMrow(mrow);
        }
      }.bind(this, mrow, mrow.spanID));  //Temp if no id already in the mrow selected
    }
  },
  handleClosedBounding: function(mn){
    var util = this.getUtil();
    if(mn && util.isCloseBounding(mn)){ 
      if(mn.spanID){
        var index = util.findSpanIndex(mn.parent, mn.spanID);
        mn = mn.parent.data[index-1];
      }else{
        mn = this.left();
      }
      this.setCursor(mn);
    }
    return mn;
  },
  selectNumbers: function(mn){
    var util = this.getUtil();
    var alreadyDot = util.isDot(mn);

    if(!mn || !(util.isNumeric(mn) || alreadyDot)){ 
      return mn;
    }
    var p = mn.parent;
    if(!p || p.type != 'mrow'){  
        return mn;
    }

    //Try and find the bounds of a number
    var rightIndex = util.findSpanIndex(p, mn.spanID);
    var leftIndex  = rightIndex; 
    for(var i = rightIndex-1; i >=0; --i){
        var sib = p.data[i];
        if(util.isNumeric(sib)){ 
          leftIndex = i; 
        }else if(util.isDot(sib) && !alreadyDot){ 
          alreadyDot = true; 
          leftIndex = i;
        }else{
          break;
        }
    }

    //If we can determine it is probably a number, 
    CONFIG.DEBUG && console.log("Cannot create a select number because", leftIndex, rightIndex);
    if(leftIndex < rightIndex){
        var mrow = this.makeRowRange(p.data[leftIndex], p.data[rightIndex], p);
        if(mrow && !mrow.spanID){
          mrow.spanID = "MAGIC_NUMBER";
        }
        return mrow || mn;
    }
    return mn;
  },
  isMagic: function(mn, newMn, eM){ //Suffering is Magic.  Client wants things.. 'intuitive'
    var util = this.getUtil();
    if(this.CFG.MagicDisabled){
      return false;
    }
    if(eM == CONFIG.EditModes.APPEND || eM == CONFIG.EditModes.UNSHIFT) return false;
    if(!mn || util.isBox(mn) || !this.allowRemove(mn) || (!util.isDot(mn) && mn.type =='mo')){
      if(!util.isComplex(mn.parent) || !this.allowRemove(mn.parent)){
        return false;
      }
      if(util.isBounding(mn)){
        return false;
      }
    }

    if(newMn){
      var guess =  this.guessTheDesiredCursor(newMn);  //Try to find the "first" box
      if(util.isBox(guess)) {
        if(mn && mn.type == 'mrow' && newMn.type == 'mrow'){
          if(!(typeof mn.spanID == 'string' && mn.spanID.match('MAGIC'))){
            return false; 
          }
        }
        return true;
      }
    }
    return false;
  },
  makeRowRange: function(start, end, p){ //Test which paths are required to contain the start and end node
    var util = this.getUtil();
    var sIndex = null;
    var eIndex = null;
    var test = null;
    for(var i = 0; i < p.data.length; ++i){
      test = p.data[i]; 
      if(sIndex === null && util.contains(test, start.spanID)){
        sIndex = i;
      }else if(eIndex === null && util.contains(test, end.spanID)){
        eIndex = i;
      }
    }
    //Ensure that we select rows that the user fully selected rather than add new rows into a row
    if(this.allowRemove(p) && p.type == 'mrow' && ((eIndex+1  - sIndex) == p.data.length)){
      return p;
    }else{
      //Create a "temporary" mrow from the user selection, this must be referenced 
      //and possibly undo deleted if the next operation is not an update to the math
      var prune = p.data.splice(sIndex, (eIndex+1) - sIndex);
      var mrow = util.createMrow(p, prune);
          p.data.splice(sIndex, 0, mrow);
      return mrow;
    }
  },
  setCursor: function(MathNode){//Set the currently focused math node
    this.cursor = MathNode;  
  },
  getCursor: function(){ //Get the currently "selected" node in an editor
    try{
      if(!this.cursor){
        this.cursor = this.getLast();
      }
    }catch(e){
      console.error("Could not get the last element for this math eq.", e);
    }
    return this.cursor;
  },
  esc: function(){ //Remove cursor again (I really like this mode but only a coder would)
    if(this.CFG.TeXEntryInit != 'Vim') return;
    if(this.inputField){ //Make non-editable
      this.inputField.value = '';
      this.addCls(this.inputField, 'hidden');
      this.CFG.TeXEntryMode = CONFIG.TeXEntryMode.None;
    }
  },
  vimEditable: function(mode, nE){
    if(this.CFG.TeXEntryInit != 'Vim') return;
    if(this.CFG.TeXEntryMode != CONFIG.TeXEntryMode.None && !nE) return;

    this.CFG.TeXEntryMode = CONFIG.TeXEntryMode.Allow;
    if(mode == CONFIG.EditModes.INSERT){
      this.left();
    } else if(mode == CONFIG.EditModes.APPEND){ //Just want to insert after cursor
      mode = CONFIG.EditModes.INSERT;
    }
    this.editMode = mode;
    this.makeEditable(this.getCursor(), mode);
  },
  makeEditable: function(mn, mode){ //Attempt to place an input field near the mn
    return this.makeEditableQ(mn, mode);
  },
  makeEditableQ: function(mn, mode){ //Set the math node so that input from the keyboard is on
    mn = mn || this.getCursor();
    if(!this.allowSelection(mn)){ //Ensure that we only ever allow the selection of legal items.
      mn = this.guessTheDesiredCursor(mn) || this.getLast();
    }
    if(!mn){ return; }

    var dom = document.getElementById("MathJax-Span-" + mn.spanID);
    if(!dom){
      mn  = this.getFirst(); //The case where you deleted the left most element
      dom = document.getElementById("MathJax-Span-" + mn.spanID);
    }
    if(dom && this.highlight(dom, mode, mn)){
      this.setCursor(mn);
      return KPH.enableInputField(this.getWidget(), dom, mn, mode);
    }
  },
  removeHighlight: function(target){ //Remove any possible highlight classes
    if(!this.highlightCls){
      this.highlightCls = [];
      for(k in CONFIG.EditCls){
        this.highlightCls.push(CONFIG.EditCls[k]);
      }
    }
    this.removeCls(target || this.lastTarget, this.highlightCls);
  },
  toggleEdit: function(toggle){ //Double click causes you to replace vs insert
    if(this.CFG.allowClickToggle && toggle != null && this.editMode == this.defaultEditMode){
      this.editMode = this.toggleEditMode;
      return;
    }
    this.editMode = this.defaultEditMode;
  },
  checkEditMode: function(target){ //Used if you can double click to enable replace mode (disabled default)
    this.toggleEdit((this.lastTarget && this.lastTarget.id == target.id) ? true : null);
  },
  highlight: function(target, mode, mn){ //Highlight the target math node
    var util = this.getUtil();
    this.removeHighlight(); 
    if(!util.isBounding(mn)){
      this.addCls(target, this.getClsForEditMode(mode));
    }
    if(this.getUtil().isBox(mn)) {//Hacky...
      this.addCls(target, 'mje_box_selection');
    }
    this.lastTarget = target;
    return true;
  },
  getFirst: function(mn){//Get the first/leftmost math element under this node
    var util   = this.getUtil();
    var c      = mn || this.getBaseMrow() || this.getEqRoot();
    var ret = util.dfsR(c, {type: this.searchIn});
    if(ret){
      c = ret;
    } 
    return c;
  },
  getLast: function(mn){//Get the last/righmost "math" element under this node
    var util   = this.getUtil();
    var c      = mn || this.getBaseMrow() || this.getEqRoot();
    var ret    = util.dfs(c, {type: this.searchIn});
    if(ret){
      c = ret;
    } 
    return c;
  },
  unshift: function(text){//Add the math to the beginning of the eq
    var util = this.getUtil();
    if(typeof text == 'string'){ 
      text = util.parseTeX(text);
    }
    if(!text) return; 
    var s = this.getBaseMrow();
    if(s.type == 'mrow' && text.type == 'mrow'){
      util.mergeNodes(s, text, -1); 
    }else{
      text.parent = s;
      s.data.unshift(text);
    }
    this.setCursor(this.guessTheDesiredCursor(text) || this.getFirst());
    this.editMode = this.defaultEditMode;
  },
  append: function(text){//add the math to the end of the eq
    var util = this.getUtil();
    if(typeof text == 'string'){ 
      text = util.parseTeX(text);
    }
    if(!text) return;
    var s = this.getBaseMrow();
    if(s.type == 'mrow' && text.type == 'mrow'){
      text = util.mergeNodes(s, text, s.data.length); 
    }else{
      text.parent = s;
      s.Append(text);
    }
    this.setCursor(this.guessTheDesiredCursor(text), this.getLast());
    this.editMode = this.defaultEditMode;
  },
  makeFraction: function(mn, input){//Called if you press '/', attempts to sub in a fraction
    if(!this.CFG.isKeyEnabled('/')) return; //If we restricted keys and prevented fractions this will be false

    //Input is if the user types in a 1 then hits /.  We want \frac 1 \PH
    input = input ? input.replace(/\//, '') : '';
    if(!input && (this.editMode == CONFIG.EditModes.UNSHIFT || this.editMode == CONFIG.EditModes.APPEND)){
      input = '\\PH';
    }
    var frac = input ? "\\frac{" + input +  "}{\\PH}" : "\\frac{\\PH}{\\PH}";
    var util = this.getUtil();
    this.updateMath(mn, frac);
  },
  clear: function(){ //Clear the current math.
    if(this.getEq()){
      this.getBaseMrow().data = [];
      this.Update(this.emptyEqCheck.bind(this));
    }
  },
  /**
   * match -> put the insert into here "after" the path node
   * path  -> the last path element we traversed up from (for index purposes)
   * to    -> the original node with the highlight on it / bubbled from
   * ins   -> what we want to insert
   */
  insert: function(to, ins){
    try{
      if(typeof ins == 'string'){
        ins = this.getUtil().parseTeX(ins);
      }   
      var util    = this.getUtil();
      var r       = util.bubble(to, util.BasicTypes, util.exclude);
      if(!r.match) {
        console.error("Failed to insert into a node (into, insert, e)", to, ins, e);
        return; 
      }
      util.Insert(r.match, r.path, to, ins);
      this.setCursor(this.guessTheDesiredCursor(ins) || ins);
    }catch(e){
      console.error("Failed to insert into a node (into, insert, e)", to, ins, e);
    }
  },
  //The replace / selection event needs to prevent me from getting certain items, or move
  //up and down the tree in a better manner.  ie legal to put a mrow in a msubseq?
  replace: function(mn, repWith, r, magic){
    if(!mn){ console.error("Failed to find the math node to actually replace.", evt); return; }
    CONFIG.DEBUG && console.log("replace function: (mn, repWith, r, magic)", mn, repWith, r, magic);
    try{
      var util = this.getUtil();
      if(typeof repWith == 'string'){
        repWith   = util.parseTeX(repWith);
      }
      if(!repWith){ return; }

      //mrows have different legal parent containers, that is why this is here.
      if(mn.parent.type != 'mrow' && util.isComplex(repWith) && repWith.type != 'mrow'){
        repWith = util.createMrow(null, repWith);
      }

      //Find a legal parent for this replacement node
      r = r || util.findLegalParent(mn, repWith.type); 
      if(r.match){
        var p = null;
        var repIndex = null;
        if(r.match.spanID == mn.spanID){ //If it is a valid container node, replace into
          p = r.match.parent;
          if(util.isComplex(p) && p.type != 'mrow' && repWith.type != 'mrow' && util.isComplex(repWith)){
            repWith = util.createMrow(p, repWith);
          }else if(magic && util.isComplex(p) && p.type != 'mrow' && util.isEmpty(repWith)){
            repWith = util.createMrow(p, repWith);
          }else{
            repWith.parent = p;
          }
          //If we are replacing an mrow into the base mrow, we want to smooth it out so that we
          //don't have extra () around every element. This is _only_ if we are magic replacing..
          repIndex = util.findSpanIndex(p, r.match.spanID);
          if(!this.allowRemove(p) && repWith.type == 'mrow' && magic){ //Oh gods why...
            util.mergeNodes(p, repWith, repIndex);
          }else{
            if(repWith.type == 'mrow' && p.type == 'mrow'){
              util.mergeNodes(p, repWith, repIndex);
            }else{
              p.data.splice(repIndex, 0, repWith); 
            }
          }
        }else{ //If the parent node was not the initial mn selected for replacement
          p = r.match;
          repWith.parent = p;
          if(r.path){ //If there is a path, we had to bubble up a certain distance
            repIndex = util.findSpanIndex(p, r.path.spanID);
            p.data.splice(repIndex, 0, repWith); 
          } else { //If we just have a match high up in the tree
            p.Append(repWith);
          } 
        }
        util.removeMath(mn); //Ensure we remove the math node.

        var curse = this.guessTheDesiredCursor(repWith) || repWith;
        this.setCursor(curse);
      } else {
        console.error("Failed to find a valid parent node to insert into.");
      }
    }catch(e){
      console.error("Failed to replace the item.", repWith, e);
    }
    return repWith; //Note we can modify what is being replaced to some extend
  },
  allowRemove: function(mn){ //Don't allow selection or deletion of the base "hidden" mrow in MathJax eq
    if(!mn) return;
    var br = this.getBaseMrow();
    return mn && mn.spanID > br.spanID;
  },
  removeEmpty: function(p, node){ //If we empty out an mrow, remember to delete it
    var util = this.getUtil();
    if(!p || util.isRoot(p)) return;

    if(util.isEmpty(p) && this.allowRemove(p)){ //Don't delete the base mrow...
      if(util.isContainer(p) && !util.isBox(node) ){
        return this.replace(p, '\\Box');
      }else{
        this.removeQueue(p); //Instant call rather than waiting for the update
      }
    }
    return null;
  },
  //Handles parent node removal, also replaces math with box in the 
  //case of deleting the y in x / y so you can still edit.
  sanitizeRemove: function(curse){ 
    //If we delete a box, we might need to remove the parents.
    if(!curse) return null;

    //Get the actual container if it exists 
    var util = this.getUtil();

    if(!(util.isComplex(curse.parent) && util.isContainer(curse) && !util.isEmpty(curse))){
      var p = util.getContainer(curse);
      if(this.allowRemove(p)){
        curse = p;
      }
    }

    //Now that we can remove and select mrows, ensure we delete row contents, but
    //replace with a box if you deleted multiple items.
    if(this.allowRemove(curse) && util.isContainer(curse)){
        if (!util.isEmpty(curse)) {
            this.setCursor(this.replace(curse, "\\Box"));
            //var box = util.parseTeX('\\Box', curse);
            //curse.data = [box];//Note we destroy all the contents..
            //this.setCursor(box);
        return null;
      }
    }

    //If we remove empty elements, test that we don't that to remove a msubsup etc
    if(curse && !util.isContainer(curse.parent)){
      var p = curse.parent;
      if(this.allowRemove(p)){
        if(util.isEmpty(p)){
          var r = util.bubble(p, util.BasicInsertTypes, util.exclude);
          curse = r ? r.match : null;
        }else if(util.isBox(curse)){
          curse = p;
        }else {

          if(util.isComplex(p) && util.isContainer(curse)){
            curse = p;
          }
          this.setCursor(this.replace(curse, "\\Box"));
          curse = null; //Required unless you want to double remove something
        }
      }
    }
    return curse;
  },
  removeQueue:  function(curse, cb){
    try{
      var util = this.getUtil();
      //Grab the cursor, see if we can remove it.
      curse = curse || this.getCursor();

      if(!this.allowRemove(curse)){ 
        return;
      }

      if(util.isBounding(curse) && !this.isEmpty(curse.parent)){
        return;
      }

      //Handles complex removes of mrows etc, if handled curse will be null, else
      //can point at the correct element to remove (often a parent mn)
      curse = this.sanitizeRemove(curse);
      if(this.allowRemove(curse)){

        //Force the movement of the current cursor left
        this.left(curse, null, true); 

        var p   = curse.parent;
        var kia = util.removeMath(curse);
        if(p.data && util.isFunction(p.data[0])){ //if you remove a cos and leave a x2061 == BOOM
          this.remove(p.data[0]);
        }

        if(kia && kia.spanID != p.spanID){ 
          var empty = this.removeEmpty(p, kia);
          if(empty){ //If we did an empty replace, reset the edit to the cursor.
            this.editMode = this.defaultEditMode;
            this.setCursor(empty); 
          }
        }
      }
      cb = cb || this.emptyEqCheck.bind(this);
      this.Update(cb);
    }catch(e){
      console.error("Failed to remove this node (curse, e)", curse,  e);
    }
  },
  remove: function(curse, cb){ 
    this.setTempMrow(null);//HACK TO prevent the user from drag creating multiple mrows
    MathJax.Hub.Queue(this.removeQueue.bind(this, curse, cb));
  }
});


/**
 * How mouse events will be handled on the content panel eqaution container
 */
var MOUSE = COMP.Subclass({
  $className: 'MathJax.Editor.Mouse',
  Init: function(widget){
    this.setWidget(widget);
  },
  selectMathNodes: function(start, end, cb){ 
    if(!start || !end || (start.spanID == end.spanID)) return;

    //Cannot allow them to create multiple mrows by selecting, and immediately selecting
    var ed   = this.getWidget().getEdit();
        ed.revertTempMrow(); //Ensure a second selection removes temp mrows.

    //Probably really have to clean this up to be a smarter bubble with both paths returned...
    //Next determine what we actually have to select (complex parent bounds etc)
    var util   = ed.getUtil();
    var common = util.getCommonParent([start, end]);
    if(!common || !common.match){
      console.error("ERROR in common parent bubble selection logic.", end, start);
      return;
    }

    //If we can select the parent, and the parent is a complex object just choose it
    //ie: This is in a fraction.
    var p = common.match; //The common parent.
    ed.editMode = ed.defaultEditMode;  
    if(ed.allowRemove(p) && util.isComplex(p) && p.type != 'mrow'){
      ed.makeEditable(p, ed.defaultEditMode);  
    }else if(ed.allowRemove(p) && (p == start || p == end)){
      ed.makeEditable(p, ed.defaultEditMode);  
    }else{ //HERE BE DRAGONS.
      ed.selectRowRange(start, end, p);
    }
    typeof cb == 'function' && MathJax.Hub.Queue(cb);
  },
  onmouseup: function(edit, cb){ //Enabled to handle user drag selection of math
    if(!window.rangy) return; //If we don't have it, we don't have it!

    var rng = rangy.getSelection().getAllRanges();
    if(!rng || !rng.length) return;
    rng = rng[0];

    //Ensure that even if they start with a drag operation we gain focus.

    //Bail if this is not a valid selection
    var start = rng.startContainer;
    var end   = rng.endContainer;
    if(!start || !end) return;

    var w    = this.getWidget();
        w.focusEdit(edit); //Have to have focus before using rangy
    var ed   = edit;
    var util = ed.getUtil();

    //Try to filter out all the strange things a user can mis-select
    start = util.getLegalSelection(util.findActualTarget(start));
    end   = util.getLegalSelection(util.findActualTarget(end));

    //Handle case where you only highlighted a single element
    if(!start || !end || (start == end)) return; //handled by standard click events.

    start = !util.isRoot(start) ? start : ed.getFirst();  
    end   = !util.isRoot(end)   ? end   : ed.getLast();
      
    //Try and select the proper set of math nodes.
    this.selectMathNodes(start, end, cb);
  },
  bindToDom: function(edit){
    try{
      //For reconnecting every time MathJax completely kills the content
      var htmlId = edit.htmlId;
      var node = document.getElementById(htmlId);
      var w = this.getWidget();
      var self = this;
      if(node){
          if (!edit.mouseUp) {
              //edit.clickHandler = this.click.bind(this, edit);
              edit.mouseUp = this.onmouseup.bind(this, edit);
          } else {
              //Nodes are often completely destroyed every update to the math function,
              //this ensures we can reconnect and not bleed listeners. IE === POS
              if (node.removeEventListener) { // for windows 8, IE11 (MathJax.Hub.Browser.isMSIE && MathJax.Hub.Browser.version == '11.0')
              //if (!MathJax.Hub.Browser.isMSIE) {
                  //node.removeEventListener('click', edit.clickHandler, false);               
                  node.removeEventListener('mouseup', edit.mouseUp, false);
              } else if (node.detachEvent) {
                  //node.detachEvent('onclick', edit.clickHandler, false);
                  node.detachEvent('onmouseup', edit.mouseUp, false);
              }
          }
          if (node.addEventListener) {
          //if (!MathJax.Hub.Browser.isMSIE) {
              //node.addEventListener('click', edit.clickHandler, false);            
              node.addEventListener('mouseup', edit.mouseUp, false);
          } else if (node.attachEvent) {
              //node.attachEvent('onclick', edit.clickHandler, false);
              node.attachEvent('onmouseup', edit.mouseUp, false);
          }

          //unbind and bind click handler to row
          $('#' + edit.rowId).unbind('click').bind('click', function (evt) {
            try {                
                w.focusEdit(edit, true); //Can cause the text to be inserted aka Hub.Queue
                KPH.listen(w); //TODO: port to set the widget
                MathJax.Hub.Queue(self.selectEditor.bind(self, w, edit, evt));
            } catch (e) {
                console.error("Failed to handle the click event.", e);
            }
        });

      } else {
        console.error("Failed to find this content element to bind the mouse (this, htmlId)", this, htmlId);
      }
    }catch(e){  
      console.error('Failed to setup a click event (this, e)', this, e);
    }
  },
  selectEditor: function(w, edit, evt){//Maybe this should partially live in the editor focus
    var target = evt.srcElement || evt.target;
    var util   = edit.getUtil();

    target = util.findActualTarget(target); //Feels like this should be util.
    edit.checkEditMode(target); //If toggle edit is enabled

    var mn = util.getLegalSelection(target);
    if(!mn || (mn.type == 'math' || mn.type == 'mstyle')){
      edit.enableAppendMode();
    }else{
      CONFIG.DEBUG && console.log("Select Editor, making mn editable.", w, mn);
      KPH.enableInputField(w, target, mn, edit.getEditMode()); //Get Edit.enableInputField()
      edit.makeEditable(mn);
    }
  },
  //This is actually double click, maybe (see designer)
  click: function(edit, evt){ 
    try{ 
      evt = evt || window.event;
      if(!evt){ return; }; //Or set to window.event
      this.stopEvt(evt);

      var w = this.getWidget();
          w.focusEdit(edit, true); //Can cause the text to be inserted aka Hub.Queue
      KPH.listen(w); //TODO: port to set the widget

      MathJax.Hub.Queue(this.selectEditor.bind(this, w, edit, evt));
    }catch(e){
      console.error("Failed to handle the click event.", e);
    }
  }
});


/**
 * Because trying to touchpad an element on an iPhone is actually really hard.
 */
var NAVIGATION = COMP.Subclass({
  $className: 'MathJax.Editor.Navigation',
  build: function(){
    var pId = this.CFG.tabContainerId || this.CFG.containerId
    var d   = document.getElementById(pId);
    if(!d) return;

    var nav = document.getElementById(this.CFG.navigationId);
    if(!nav && d){
      nav = H.Element('div', {className: 'mje_nav'});
      d.insertBefore(nav, d.firstChild);
    }

    var w = this.getWidget();
    var e = this.getEdit();
    if(nav && e){ //Note the stop events are for Safari which REALLY likes to form submit
      var next= H.addElement(nav, 'button', {type: 'button', className: 'mje_nav_next'}, CONFIG.Label.Next);
          next.onclick = function(evt){ 
            this.stopEvt(evt || window.event);
            KPH.listen(w); w.getEdit().leftQ(); 
          }.bind(this);

      var prev =  H.addElement(nav, 'button', {type: 'button', className: 'mje_nav_prev'}, CONFIG.Label.Prev);  
          prev.onclick = function(evt){ 
            this.stopEvt(evt || window.event);
            KPH.listen(w); w.getEdit().rightQ(); 
          }.bind(this);

      var undo =  H.addElement(nav, 'button', {type: 'button', className: 'mje_nav_undo'}, CONFIG.Label.Undo);  
          undo.onclick = function(evt){ 
            this.stopEvt(evt || window.event);
            KPH.listen(w); w.getEdit().undo(); 
          }.bind(this);

      var redo =  H.addElement(nav, 'button', {type: 'button', className: 'mje_nav_redo'}, CONFIG.Label.Redo);  
          redo.onclick = function(evt){ 
            this.stopEvt(evt || window.event);
            KPH.listen(w); w.getEdit().redo(); 
          }.bind(this);

      var del = H.addElement(nav, 'button', {type: 'button', className: 'mje_nav_del'}, CONFIG.Label.Delete);  
          del.onclick = function(evt){ 
            this.stopEvt(evt || window.event);
            KPH.listen(w); w.getEdit().remove(); 
          }.bind(this);
          
    }
  }
});

/** Render the actual editor, handle html layout for the editor, buttons etc
 * See config.js for more detailed examples.
 * 
 * The config for the tabs is in the following format
 *  tabConfig: {
 *    Order: ['Key1', 'Key2'], 
 *    Key1: {
 *      type: <default: 'row'> supports 'grid' and 'numpad'
 *      func: '<optional>' => this[optional].bind(this, btnInfo)
 *      items:[{
 *        key: 'AButton',
 *        value: <default: key> OR TeX like: '\int_x^{\infty}x',
 *        text: <default: unicode for key or key> 'button label',
 *        css: <optional: will override any text>
 *        click: <default: this.btnClick>
 *      },
 *      'y', //val will become parseTeX(y) because the key is only length 1
 *      'pi' //TeX key will become something that is "parseTeX(\pi)" on btn click
 *      ]
 *    },
 *    Key2:{
 *      type: 'numpad' //Special config for a keypad
 *    }
 *  }
 **/
var CONTENT = COMP.Subclass({ //Provides tabs.
  Init: function(w){
    this.setWidget(w);

    this.selectedTabId = null;
    this.initConfig();
    this.buildCb = [];
  },
  addBuildCb: function(cb, runAtOnce){//Add a callback
    if(typeof cb == 'function') {
      this.buildCb.push(cb);
      if(runAtOnce) cb();
    }
  },
  runBuildCb: function(){ //Runs after the tabs are built
    for(k in this.buildCb){
      var cb = this.buildCb[k];
      try{
        if(typeof cb == 'function') cb(this);
      }catch(e){
        console.error("Failed to run build callbacks", this, e);
      }
    }
  },
  initConfig: function(){
    this.tabs = [];
    this.tabContent = [];
    this.tabBtns = {};
    this.btnsActive = {}; //Btn key lookup (kind of a bad idea?
    this.selectedBtnIndex = null;
  },
  TAB_ID: {
    id: 0
  },
  setUtil: function(util){
    this.UTIL = util;
  },
  getUtil: function(){
    return this.UTIL;
  },
  nextBtn: function(){//Todo: note this doesn't preserve rowIndex,btnIndex
    var index = this.findBtnIndex();
    var tabBtns = this.tabBtns[this.selectedTabIndex] || [];
    if(index+1 < tabBtns.length){
      this.selectBtn(null, tabBtns[index+1]);
    }
  },
  prevBtn: function(){//Todo: note this doesn't preserve rowIndex,btnIndex
    var index = this.findBtnIndex();
    var tabBtns = this.tabBtns[this.selectedTabIndex] || [];
    if(index-1 >= 0 && tabBtns.length){
      this.selectBtn(null, tabBtns[index-1]);
    }
  },
  findBtnIndex: function(tabIndex, btnId){//Find which button we have selected
    tabIndex = tabIndex || this.selectedTabIndex || 0;
    btnId    = btnId    || this.selectedBtnDom ? this.selectedBtnDom.id : null;
    if(btnId == null){
      return -1;
    }
    var tabBtns = this.tabBtns[tabIndex] || [];
    for(var i in tabBtns){
      if(tabBtns[i].id == btnId){
        return parseInt(i);
      }
    }
    return 0;
  },
  nextTab: function(){//TODO: Tie to key
    if(!this.tabs.length){ return; }
    var index = this.findTabIndex(this.selectedTabId);
    if(index != null && index+1 < this.tabs.length){
        index++;
      this.selectTab(this.tabs[index], this.tabContent[index]); 
    }
  },
  prevTab: function(){//TODO: Tie to key
    if(!this.tabs.length){ return; }
    var index = this.findTabIndex(this.selectedTabId);
    if(index > 0){
      index--;
      this.selectTab(this.tabs[index], this.tabContent[index]); 
    }
  },
  findTabIndex: function(id){ //Gets the tab for this id
    for (var i = 0; i < this.tabs.length; ++i){
      if(this.tabs[i].id == id) return i;
    }
    return null;
  },
  rebuild: function(config){ //Rebuilds the tabs
    config = config || this.CFG.tabConfig;
    this.initConfig();
    var d   = document.getElementById("Controls_" + this.CFG.containerId);
    if(d){
      d.parentNode.removeChild(d);
    }
    this.build(config);
  },
  build: function(tabConfig){ //Builds the content tabs
    var d = document.getElementById(this.CFG.tabContainerId);
    if(!d){
      d = H.Element('div', {id: this.CFG.tabContainerId, className: 'mje_controls_parent no-highlight'});
      this.getWidget().getContainerDom().appendChild(d);
    }
    if(!d) return; 

    tabConfig     = tabConfig       || CONFIG.Tabs;
    var tabNames  = tabConfig.Order || CONFIG.Tabs.Order || [];

    var controls = H.Element('div', {id: "Controls_" + this.CFG.containerId, className: 'mje_controls'});
    var tabs     = H.addElement(controls, 'div', {id: "Controls_Tabs_"    + this.CFG.containerId, className: 'mje_controls_tabs'});
    var content  = H.addElement(controls, 'div', {id: "Controls_Content_" + this.CFG.containerId, className: 'mje_controls_content'});

    for (i in tabNames){
      var key    = tabNames[i];
      var config = tabConfig[key] || CONFIG.Tabs[key]; //In case of later updates.
      if(config){
        var cp = JSON.parse(JSON.stringify(config));
        this.addTab(cp, key,  tabs, content, i); //Copy the config into the local Content.
      } else {
        console.warn("A Tab name was passed in (", key, ") that is not in the config: ", tabConfig);
      }
    }
    //d.insertBefore(controls, d.firstChild)
    var index = this.findTabIndex(this.selectedTabId) || 0;
    this.selectTab(this.tabs[index], this.tabContent[index]);
    if(this.tabs.length == 1){ //In case the CSS people want to hide the 'tab' label.
      this.addCls(tabs, 'mje_single_tab');
    }
    d.appendChild(controls);
    this.runBuildCb();
  },
  addTab: function(config, key, tabs, content, i){ //Add in a tab using this config
    if(!config) return;
    key          = key          || config.title;
    config.rows  = config.rows  ? [].concat(config.rows) : [{items: []}];
    config.title = config.title || key || 'New Tab';
    tabs         = tabs    || document.getElementById("Controls_Tabs_"    + this.CFG.containerId);
    content      = content || document.getElementById("Controls_Content_" + this.CFG.containerId);

    var c = this.createContent(config, i);
        content.appendChild(c);
    this.tabContent.push(c);

    var t = this.createTab(config.title, i, c);
        tabs.appendChild(t);
    this.tabs.push(t);

    //Ensure we keep a list of the tab configuration up to date.
    this.CFG.tabConfig[key] = config;
    var order = this.CFG.tabConfig.Order;
    var found = false;
    for(var i in order){  //indexOf not in IE version we have to support
      if(order[i] == key) found = true;
    }
    if(!found){
      order.splice(i+1, 0, key);
    }
  },
  getSelectedTabIndex: function(){
    if(!this.CFG.tabContent){return;}
    for(var i=0; i<this.CFG.tabContent.length; ++i){
      var tab = this.CFG.tabContent[i];
      if(this.hasClass(tab, 'mje_selected_tab')){
        return i;
      }
    }
    return null;
  },
  addBtn: function(btnCfg, tabIndex, rowIndex, btnPos){//Adds a button
    tabIndex = (!isNaN(tabIndex) || tabIndex === null) ? tabIndex : this.getSelectedTabIndex();
    if(btnCfg && this.CFG.tabConfig){
      var row = this.getRowCfg(rowIndex, tabIndex);
      if(row && row.items){
          var index = !isNaN(btnPos) ? btnPos : this.selectedBtnIndex;
          if(isNaN(index) || index == null){
            index = row.items.length;
          } 
          row.items.splice(index, 0, btnCfg);
      }
    }
  },
  removeBtn: function(btnIndex, rowIndex, tabIndex){//Remove a buttton (uses default selectinos
    btnIndex = !isNaN(btnIndex) ? btnIndex : this.selectedBtnIndex;
    var rows = this.getRowCfg(rowIndex, tabIndex);
    if(rows && rows.items && btnIndex < rows.items.length && btnIndex >= 0){
      rows.items.splice(btnIndex, 1); 
      if(rows.items.length == 0){
        this.removeRow(rowIndex);
      }
    }
    this.rebuild();
  },
  getTabCfg: function(tabIndex){//Get the tab configuration for a tab
    tabIndex = !isNaN(tabIndex) ? tabIndex : this.findTabIndex(this.selectedTabId);
    if(!isNaN(tabIndex)){
      var key  = this.CFG.tabConfig.Order[tabIndex];
      return this.CFG.tabConfig[key];
    }
  },
  getRowCfg: function(rowIndex, tabIndex){ //Get the configuration for a row
    rowIndex = (rowIndex != null && !isNaN(rowIndex)) ? rowIndex : this.selectedRowIndex;
    var cfg = this.getTabCfg(tabIndex);
    if(cfg && !isNaN(rowIndex)){
      return cfg.rows[rowIndex];
    }
  },
  addRow: function(rowCfg, index, tabIndex){//Add a row to the tab, rebuilds the tabs
    var tCfg = this.getTabCfg(tabIndex);
    if(tCfg){
      if(isNaN(index) || index == null){
        index = this.selectedRowIndex || 0;
      }
      tCfg.rows.splice(index, 0, rowCfg);
    }
    this.rebuild();
  },
  removeRow: function(index, tabIndex){//Remove the row from index(def: selected) in tab
    var tCfg = this.getTabCfg(tabIndex);
    if(tCfg){
      index = !isNaN(index) ? index : this.selectedRowIndex;
      tCfg.rows.splice(index, 1);
    }
    this.rebuild();
  },
  removeTab: function(index, evt){ //Remove a tab at the index (defaults to currently selected tab)
    if(isNaN(index) || index == null){
      index = this.findTabIndex(this.selectedTabId); 
      this.selectedTabId = null;
    }
    if(this.CFG.tabConfig && this.CFG.tabConfig.Order){
      var key = this.CFG.tabConfig.Order[index];
      this.CFG.tabConfig.Order.splice(index, 1);
      if(this.CFG.tabConfig[key]){ 
        delete this.CFG.tabConfig[key];
      }
    }
    this.stopEvt(evt);
    this.rebuild();
  },
  createTab: function(text, index, content){ //Creates a tab that you can click on
    var id = "Controls_Tabs_" + this.CFG.containerId + "_" + index;
    var el = H.Element('div', {className: "editor_controls_tabs_el", id: id}, text);
        el.onclick = this.selectTab.bind(this, el, content)
    return el;
  },
  getRowId: function(containerId, tabIndex, rowIndex){
    containerId = containerId || this.CFG.containerId;
    return 'Controls_Content_Row_' + this.CFG.containerId + '_' + tabIndex + '_' + rowIndex;
  },
  getContentId: function(id, tabIndex){
    id = id || this.CFG.containerId;
    return 'Controls_Content_' + id + '_' + tabIndex;
  },
  createContent: function(cfg, tabIndex, title){ //Create the tab panel, aka buttons go here
    var div = H.Element('div', 
        {className: "mje_controls_content_el hidden " +  
                    "mje_controls_content_" + (cfg.title ? cfg.title : tabIndex),
          id: this.getContentId(tabIndex)
        }
    );
    var rows = cfg && cfg.rows ? [].concat(cfg.rows) : null;
    var btns = [];
    for (var i = 0; i < rows.length; ++i){
      var row  = rows[i];
      if(!row) continue;

      var container = H.Element('div', {
        className: 'mje_controls_content_row ' + 
                   'mje_row_' + (row.title ? row.title : i),
        id: this.getRowId(cfg.containerId, tabIndex, i)
      });
      container.onclick = this.selectRow.bind(this, i, container.id);

      var type  = row.type;
      if(type == 'grid'){
        btns = btns.concat(this.gridRow(row, container, i));
      }else if(type == 'numpad'){
        btns = btns.concat(this.numPad(row, container, i));
      } else {
        btns = btns.concat(this.simpleRow(row, container, i));
      }
      if (type == 'grid' || type == 'numpad') {
          div.insertBefore(container, div.firstChild);
      } else {
          div.appendChild(container);
      }
    }
    this.tabBtns[tabIndex] = btns;
    return div;
  },
  getBtnId: function(container, btnIndex){ //Get a button id based on container
    if(typeof container == 'string'){
      return container + '_btn_' + btnIndex;
    }else if (container && container.id){
      return container.id + '_btn_' + btnIndex;
    }
  },
  simpleRow: function(row, container, rowIndex, func, cb){ //buttons in a span
    if(!row || !container) return;
    var btns = [];
    var items    = row.items ? [].concat(row.items) : ['empty'];
    if(row.title){
      H.addElement(container, 'span', {className: 'mje_simple_row_title'}, row.title);
    }
    for (var i in items){
      if(!items[i]) continue;//more crappy xml translation handlers
      var item = items[i];
      var btn  = this.getMathBtn(item, row, cb, this.getBtnId(container, i));
          btn.onclick = this.selectBtn.bind(this, i, btn, rowIndex, btn.onclick);
      container.appendChild(btn);
      btns.push(btn);
    }
    this.addCls(container, 'mje_simple_row');
    return btns;
  },
  apdNum: function(btn, proc, cb){
    if(typeof cb == 'function') cb(btn, proc);
  },
  enterNumpad: function(input){//On enter insert the information to the eq
    console.warn("Need to enforce only numbers for this thing.");
    var e = this.getEdit();
    if(input && input.value && input.value.length){
      e.updateMath(null, input.value);
    }
    input.value = '';
  },
  numPad: function(row, container, rowIndex, func, cb){//Create a special element, the number pad
    row.click = row.click || this.apdNum; //Add special config sauce
    func      = func || this[row.func] ||  this.enterNumpad;
    var inp = H.Element('input', { //add on keyup method.
      className: 'mje_numpad_input',
      type: 'text',
      id: container.id + 'numpad_input' + rowIndex
    });
    var cb = function(inp, btn, proc){
      inp.value += proc.value;
    }.bind(this, inp);
    
    var ret = H.Element('button', {type: 'button', className: 'matchjax_editor_button_ret'}, 'R');
        ret.onclick = func.bind(this, inp);

    var btns = this.gridRow(row, container, rowIndex, null, cb);
    btns.push(ret);
    container.appendChild(inp);
    container.appendChild(ret);
    this.addCls(container, 'mje_numpad_row');
    return btns;
  },
  gridRow: function(row, container, rowIndex, func, cb){ //Create a set of spans of 'cols' per row
    if(!row || !container) return;
    if(row.title){
      H.addElement(container, 'span', {className: 'mje_grid_row_title'}, row.title);
    }
    var btns  = [];
    var items = row.items || ['empty'];
    var cols  = row.cols || 3;
    var cnt   = 0;
    var span  = H.Element('span', {className: 'mje_button_grid_row'});
    var func  = func || this.selectBtn;
    
    for (var i in items){
      var item = row.items[i];
      var btn = this.getMathBtn(item, row, cb, this.getBtnId(container, i));
          btn.onclick =  func.bind(this, i, btn, rowIndex, btn.onclick);
          span.appendChild(btn);
          btns.push(btn);

      if((++cnt) >= cols){
        container.appendChild(span);
        span  = H.Element('span', {className: 'mje_button_grid_row'});
        cnt = 0;
      }
    }
    if(cnt != 0){
      container.appendChild(span);
    }
    this.addCls(container, 'mje_grid_row');

    return btns;
  },
  getActiveBtns: function(){ //In case you want to restrict keys to what is in editor button fields...
    return this.btnsActive; 
  },
  regHacks: { //common keys
    fraction: '/', frac: '/',  //Enable fractions by pressing /
    lt: '<', le: '<', ge: '>', gt: '>',  //equality symboles
    sub: '_', sup: '^', subsup: '^',  //powers that work in TeX
    times: '*', 
    bullet: '*', 
    '| |': true,
    '( )': true //Helpers for paren
  }, 
  regBtn: function(conf){ //A list of the currently active buttons.
    if(!conf || !conf.key) return;
    var key = conf.key;
    this.btnsActive[key + ''] = conf; //Ensure this is the string value

    //Hacks to enable really common key => math handlers.
    var rhack = this.regHacks[key];
    if(rhack) {
      if(key == 'fraction' || key == 'frac'){
        this.btnsActive['/'] = true;
      }else if(key == '| |'){
        this.btnsActive['|'] = true;
      } else if(key == '( )'){
        this.btnsActive['('] = true;
        this.btnsActive[')'] = true;
      } else if(key == 'subsup'){
        this.btnsActive['_'] = true;
        this.btnsActive['^'] = true;
      }
      this.btnsActive[rhack] = true;
    }
  },
  getMathBtn: function(conf, rowCfg, cb, id){ //Create a button that will add the math to the eq on click
    if(!conf) return;
   
    var proc = !conf.isParsed ? CONFIG.getUnicode(conf, this.CFG.placeHold) : conf;
    var btn  = H.Element(
        'button', 
        {id: id, 
         type: 'button',
         className: (conf.css || '') + " mje_button " + " mje_button_" + proc.key
        },  
        proc.text || '\u00a0'
    );
    var click = conf.click || rowCfg.click || this[rowCfg.func] || this.btnClick;
        click = click.bind(this, btn, proc, cb);
        btn.onclick = click;
    this.regBtn(proc);
    return btn; 
  },
  apdClick: function(btn, proc){ //Append to the current text field rather than add directly to the eq
    try{
      var e = this.getEdit();
      var field = e.makeEditable(null, CONFIG.EditModes.APPEND);
      if(field){
        if(proc.value){
          var val = (field.value || '').concat(proc.value);
          field.focus();
          field.value = val;
        }
        field.onkeyup({keyCode: proc.keyCode});
      }
    }catch(e){
      console.error("Failed to handle a button click append.", e);
    } 
  },
  btnClick: function (btn, proc, cb, evt) { //By default we do not buffer, and just insert the math
      try {
          this.stopEvt(evt || window.event);

          //check for character limit restrictions, need to add allow {backspace, arrows, undo, redo keys and special keys}
          var w = this.getWidget();
          var ed = this.getEdit();
          if (w.CFG.checkEditorCharLimit()) {

              if (ed.isTextEntered()) {//If text is entered, then insert it.
                  ed.updateMath(null, CONFIG.getMathVal(e.inputField.value));
              }
              ed.updateMath(null, proc.value, null, cb);
          }

          return false; //Don't form submit...
      } catch (e) {
          console.error("Failed to insert into the Editor.", e, proc);
      }
  },
  selectBtn: function(btnIndex, dom, rowIndex, func){
     if(this.CFG.configure){//In config mode show which button the user selected
       if(this.selectedBtnDom){
          this.removeCls(this.selectedBtnDom, 'mje_row_btn_selected');
       }
       this.addCls(dom, 'mje_row_btn_selected');
     }
     this.selectedBtnIndex = btnIndex; //Index in the currently selected row.
     this.selectedBtnDom   = dom; //This can be the container to highlight
     this.buttonRowIndex   = rowIndex;
     if(dom){//Is this going to work at all?
       dom.focus();
     }
     if(func){
      func(); //Should have a proper scope binding.
     }
  },
  selectRow: function(index, containerId){//Select which tab is active
    if(this.CFG.configure){
      if(this.currentRowId){
        this.removeCls(this.currentRowId, 'mje_selected_row');
      }
      this.addCls(containerId, 'mje_selected_row');
    }
    this.selectedRowIndex = index;
    this.currentRowId     = containerId;
    if(this.buttonRowIndex != index){
      this.selectBtn(null);
    }
  },
  selectTab: function(t, content){//Select the currently active tab
    this.removeCls(this.tabs, 'mje_selected_tab');
    this.addCls(this.tabContent, 'hidden');

    this.addCls(t, 'mje_selected_tab');
    this.removeCls(content, 'hidden');

    this.selectRow(this.selectedRowIndex || 0, this.currentRowId);
    if(t){
      this.selectedTabIndex = this.findTabIndex(t.id);
      this.selectedTabId    = t.id;
      this.selectedTab      = t; 
    }
  }
});

/**
 *  This class provides IDs, defaults and helpers for setting up equation editors.  It is two
 *  parts: this.CFG used in subwidgets, and provides a basic HTML layout for creating your 
 *  editor widget. 
 *
 *  Note:  The config for the widget could easily go in another class / UI but is kind of 
 *  nice to see the id / info configured in the class that modifies them.
 *
 * You are going to see a bunch of [].concat(, this is to handle the problems with a legacy system
 * that still uses XML for js config.   The XML parsing loses single element arrays and can pass in
 * items: 'b', or items: {key: 'b'}.  The correct choice would have been to port the config
 * to JSON, but people _love_ their legacy apps.  
 *
 * See config.js for better descriptions of what some of this does.
 */
var CONFIGURE = COMP.Subclass({
  $className: 'MathJax.Editor.Configure',
  Init: function(w, init, id){
    init = this.parseKeys(init);

    this.setWidget(w);
    this.id = id;

    this.navigation      = (typeof init.navigation != 'undefined') ? init.navigation : CONFIG.Navigation;
    this.containerId     = init.containerId    || "Eq-Container-"   + id;
    this.tabContainerId  = init.tabContainerId || init.tabs    ? "Eq-Controls-"     + id : null;
    this.navigationId    = init.navigationId   || this.navigation ? "Eq-Editor-Nav" + id : null;

    this.TeX       = init.TeX    && init.TeX.length    ? [].concat(init.TeX) : null;
    this.mathML    = init.mathML && init.mathML.length ? [].concat(init.mathML) : null;
    this.contentId = init.contentId ? [].concat(init.contentId) : null;   

    //Tab Configuration and the placeholders to use in creating math.
    this.tabConfig = this.validateTabs(init.tabConfig);
    this.placeHold = init.placeHold || CONFIG.PlaceHold; //default \Box evals into \PH in TeX

    //Can the user type in text to have it evaludated as math?
    this.TeXEntryMode = CONFIG.TeXEntryMode[init.TeXEntryMode] || CONFIG.TeXEntryDefault;
    this.TeXEntryInit = this.TeXEntryMode;

    //For configuring how the user typing inputs are validated / modified.
    this.SanitizeTeXEnabled = typeof init.SanitizeTeXEnabled == 'boolean' ?  init.SanitizeTeXEnabled : CONFIG.SanitizeTeXEnabled;
    this.sanitizeTeX        = typeof init.sanitizeTeX == 'function ' ? init.sanitizeTeX :  CONFIG.sanitizeTeX;

    //Get the default text entry box, if on a mobile browser this should be larger so 
    //people like me with fat fingers can click the thing.
    this.DefaultTextBoxPx = init.DefaultTextBoxPx || CONFIG.DefaultTextBoxPx;
    this.isMobile = this.isMobileBrowser();

    //Complicated, see CONFIG.  Deals with how complex placeholder elements interact with the selected math.
    this.MagicDisabled = init.MagicDisabled || MathJax.Editor.Config.MagicDisabled;

    //Not sure I like this serialization format, or implementation...  TODO: not this?
    //Does mathml have a label / title element I could hack or something...
    if(typeof init.editorLabels == 'string'){
      this.editorLabels = [init.editorLabels];
    }else{
      this.editorLabels = init.editorLabels || [];
    }

    //Will tie to the input text field if it is enabled.
    if(typeof init.restrictKeys == 'function'){
      this.restrictKeys = typeof init.restrictKeys == 'function' ? init.restrictKeys : null;
    }else if(init.RestrictKeysToContent){ 
      this.restrictKeys          = this.restrictToContentKeys.bind(this);
      this.RestrictKeysToContent = true;
    }else if(CONFIG.RestrictKeysToContent){ //Don't put defaults into cfg entries 
      this.restrictKeys          = this.restrictToContentKeys.bind(this);
    }
  },

  //Note: true max character limit is not reached otherwise false
  checkEditorCharLimit: function () {      
      var edit = this.getWidget().getEdit();
      var numOfCharacters = YAHOO.util.Dom.getElementsByClassName('mn', 'span', edit.htmlId).length + YAHOO.util.Dom.getElementsByClassName('mo', 'span', edit.htmlId).length;
      var maxCharacters = CONFIG.MaxCharacterLimit;
      if (numOfCharacters <= maxCharacters)
          return true;

      return false;
  },
  isMobileBrowser: function(){ //Are we running on a mobile platform?
    var isMobile = false;
    if(navigator && navigator.userAgent && typeof navigator.userAgent == 'string'){
      var ua = navigator.userAgent;
      if(ua.match(/iPad/i) || ua.match(/iPhone/) || ua.match(/Android/i)){
        isMobile = true;
      }
    }
    if(isMobile){
      this.DefaultTextBoxPx *= 3; //Make a bigger default size so mobile can gain text focus
    }
    return isMobile;
  },
  fontTest: function(){
    var d = null;
    try{
      d  = this.getWidget().getContainerDom();
      if(d){
        var el = H.addElement(d, 'span', {
          className: 'mje_cursor_field  mje_allow_edit',
          style: {width: 'auto', height: 'auto', position: 'absolute'}}, 
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+=/-%^'
        );
        this.FontSizePx = (el.clientWidth / 58) || CONFIG.FontSizePx;
        this.FontSizePx = this.FontSizePx * (CONFIG.Scale / 100);
        this.FontSizeHt =  el.clientHeight;
        return this.FontSizePx;
      }
    }catch(e){
      console.error('Failed to determine the font size', e);
    }finally{
      try{
        d && d.removeChild && d.removeChild(el);
      }catch(e){
        console.error("Failed to remove the font test (dom, e)", d, e);
      }
    }
  },
  validateTabs: function(tabConfig){ //Ensure the tab configuration doesn't break..
    if(tabConfig){
      if(typeof tabConfig.Order == 'string'){
        tabConfig.Order = [tabConfig.Order];
      }
      var order = tabConfig.Order;
      for(var k in order){
        var cfg = tabConfig[order[k]];
        if(cfg && cfg.rows){
          cfg.rows = [].concat(cfg.rows); 
        }
      }
      return tabConfig;
    }else{
      return JSON.parse(JSON.stringify(CONFIG.Tabs));//intentional cp
    }
  },
  getFormInputId: function(edit){ //Determine where to store mathML in the page (for form submits)
    if(!edit) return;
    return this.containerId + '_input_' + edit.id;
  },
  parseKeys: function(init){ //Parses out the Place hold elements in TeX strings.
    init = init || {};
    for(var k in init){
      if(!this[k]) this[k]=init[k];
    }
    if(typeof init.TeX == 'string'){
      init.TeX = [init.TeX];
    }
    var TeX = init.TeX || [];
    for(var i in TeX){
      if(typeof TeX[i] == 'string') TeX[i] = TeX[i].replace(/\\PH/g, this.placeHold);
    }
    this.TeX = TeX;
    return init;
  },
  isTeXEntryEnabled: function(){//Can the user type in math or do we restrict to buttons?
    if(this.TeXEntryMode == 'Allow'){
      return true;
    }
    return false;
  },
  getNextEditId: function(){//Get the id for the next edit line we create
    this.editId = this.editId || 0;
    return 'Eq-Editor-' + this.containerId + "-" + (++this.editId);
  },
  /**
   *  3 Behaviors based on returns
   *    boolean true: allow any keypress & full text entry
   *    boolean false: not a valid key, stop event
   *    string key: 'Valid key, update the math with this.
   */
  isKeyEnabled: function(key){
    //No content, no restrictions or instant entry of values (full TeX entry)
    var content = this.getWidget().CONTENT;
    if(!content) return true;
    
    //No buttons, no restriction or instant entry of values (full TeX entry)
    var lookup  = content.getActiveBtns();
    if(!lookup) return true;

    //Check the key lookup to see if legal, if so return the string key value
    if(lookup[key]){
      return key;
    }
    return false; //Invalid and we want to restrict to only legal button press
  },
  restrictToContentKeys: function(evt){
    evt = evt || window.event;
    if(!evt) return;
    if(!evt.charCode) return;

    var key = this.isKeyEnabled(String.fromCharCode(evt.charCode));
    if(key == '/'){ //This is handled by makeFraction if it is enabled
      this.stopEvt(evt);
      return;
    }
    if(typeof key == 'boolean'){ 
      if(!key){//No restriction will allow the keypress to update the text input
        this.stopEvt(evt);
        return;
      }
    }else if(key && !key.match(/\<|\>/)){ //Immediately update the math unless they are trying to type le, ge
      if(key == '(' || key == ')'){
        key = '(\\Box)';
      }else if(key == '|'){
        key = '\\lvert\\Box\\rvert';
      }else{
        var target = evt.target;
        if(target && target.value != null){
          key = target.value + key;
        }
      }
      this.getWidget().getEdit().updateMath(null, key);
      this.stopEvt(evt);
    }
  },
  cleanTabConfig: function(tabCfg){//Ensure that the defaults can be updated
    if(!tabCfg) return;
    var stdCfg  = CONFIG.Tabs;
    for(var k in tabCfg){
      if(k != 'Order' && stdCfg[k]){
        if(JSON.stringify(tabCfg[k]) == JSON.stringify(stdCfg[k])){
          delete tabCfg[k];
        }else{
          console.warn("You are not using the defaults for this tab: tabCfg != stdCfg", k);
        }
      }
    }
    return tabCfg;
  }
});


/**
Main class, create a new widget on the page at a content location

init = {
  contentId: domId, 
  mathML: valid math ml str, 
  TeX: valid Tex to initialize with, 
  NO_BUILD:<false> create, but do not add to page
}
**/
var WIDGET = BASE.Subclass({
  $className: 'MathJax.Editor.Widget',
  sequence: {
    id: 0
  },
  Init: function(init){ 
    //Not always used, but simply easier so we can keep track of how many are created
    this.id  = ++this.sequence.id;
    this.CFG = this.unserialize(init, this.id);      
    if(!this.CFG.NO_BUILD){ 
      this.build();
    }
    MathJax.Editor.Store.set(this.id, this);
  },
  getEdit: function(){//Get the currently active edit line
    return this.edit;
  },
  setEdit: function(edit){//Set the currently active edit line
    this.edit = edit;
    return this.edit;
  },
  getEditIndex: function(){ //Which editor do you currently have selected?
    var index = 0;//Need to do this since the user clicks around, tabs etc.
    var editors = this.getEditors();
    var edit    = this.getEdit();
    if(edit){
      for(var i =0; i< editors.length; ++i){
        if(editors[i].id == edit.id){
          return i;
        }
      }
    }
    return index;
  },
  nextEdit: function(){//Get the next editor (assuming you have multiple editors)
    var index   = this.getEditIndex();
    var editors = this.getEditors();
    if(++index < editors.length){
      this.focusEdit(editors[index]);
    }
  },
  prevEdit: function(){ //Get the previous editor in the list (often you just have one line)
    var index   = this.getEditIndex();
    var editors = this.getEditors();
    if(--index >= 0){
      this.focusEdit(editors[index]);
    }
  },
  focusEdit: function(setEdit, noEditable){//When you focus on an edit line, make sure we remove focus from others.
    var editors = this.getEditors() || [];
    var edit = null;
    for(var i =0; i < editors.length; ++i){
      try{
        edit = editors[i];
        edit.removeHighlight();
        edit.revertTempMrow();
        edit.insertPending();
        if(edit.inputField){
          this.addCls(edit.inputField, 'hidden');
        }
      }catch(e){
        console.error("Failed to focus an editor.", e, edit);
      }
    }
    //On a click selection go into append mode if there are no math nodes
    if(setEdit && setEdit.$className == 'MathJax.Editor.Edit'){
      this.setEdit(setEdit);
      var ln = setEdit.getCursor()  || setEdit.getLast();
      var em = setEdit.isEmpty(null, true) ? CONFIG.EditModes.APPEND : setEdit.editMode;

      if(!noEditable){
        setEdit.makeEditable(ln, em);
      }
    }
  },
  getContentLabel: function(){//The label for your widget
    return this.label;
  },
  getContainerDom: function(){//Get the container dom for the widget, all stuff goes in here by default
    if(!this.containerDom){
      var c = document.getElementById(this.CFG.containerId);
      if(!c){
        c = H.Element("div", {id: this.CFG.containerId, className: "mje_container" });
        document.body.appendChild(c);
      } else {
        this.addCls(c, "mje_container");
      }
      this.containerDom = c;
    }
    return this.containerDom;
  },
  buildEditors: function(dom){//Create the editors for a widget
    var editors = [];
    if(this.CFG.contentId){//If the user specified a dom element has the math
      for(var i in this.CFG.contentId){ 
        editors.push(this.createEditor(this.CFG.contentId[i], null, null, dom));
      }
    }else if(this.CFG.mathML){//If the user passed in mathML
      for(var i in this.CFG.mathML){
        editors.push(this.createEditor(this.CFG.getNextEditId(), this.CFG.mathML[i], 'math/mml', dom));
      }
    }else if(this.CFG.TeX){//Did the user pass in TeX?
      for(var i in this.CFG.TeX){
        editors.push(this.createEditor(this.CFG.getNextEditId(), this.CFG.TeX[i], 'math/tex', dom));
      }
    }else{ //Ok, you get an math editor with just a displaystyle
        editors.push(this.createEditor(this.CFG.getNextEditId(), null, 'math/tex', dom));
    }
    return editors;
  },
  removeEditor: function(edit){//Remove the editor using the mathjax q
    if(!edit) return;
    edit && edit.getEq() ? edit.getEq().Remove() : null;
    this.setEdit(null);
    delete edit;
  },
  removeEditorObj: function(edit, btn){//Pass in an editor to remove it
    var eArr  = this.getEditors();
    var index = null;
    for(var i in eArr){
      var ed = eArr[i];
      if(ed.id == edit.id){
        index = i;
      }
    }
    if(index!= null){
      eArr.splice(index, 1);
      this.rebuild(index);
    }else{
      console.error("Failed to find this editor to remove.", edit);
    }
  },
  //NOTE: Not safe to use the edit reference to perform math immediately, use the cb it
  //will pass in the editor once it is parsed and ready.
  addEditor: function(id, content, type, dom, cb){//Add a new editor to a created widget
    id      = id  || this.CFG.getNextEditId();
    dom     = dom || this.getContainerDom(); 

    var beforeDom = this.CFG.tabContainerId ? document.getElementById(this.CFG.tabContainerId) : null;
    var edit = this.createEditor(id, content, type, dom, beforeDom);
    this.getEditors().push(edit);

    MathJax.Hub.Queue(["Typeset", MathJax.Hub, edit.contentId]);
    MathJax.Hub.Queue(this.connectEditor.bind(this, edit, cb));
    
    return edit; //Probably should not use immediately unless you want to suffer, trust only the cb
  },
  createEditor: function(id, content, type, dom, beforeDom){//Create an Edit line for the widget
    var edit = new EDIT(this);
        edit.contentId = id;
        edit.htmlId    = id;
        edit.id        = id;
        edit.rowId     = id + '-Row';

    var d   = document.getElementById(id);
    if(!d){
      //Create a location to dump in the label.
      var row = H.Element('div', {className: 'mje_editor_row', id: edit.rowId});
      if(beforeDom) {
          dom.insertBefore(row, beforeDom);
      }else{
        dom.appendChild(row);
      }

      //add div container for span.mathjax
      var mathJaxWrapper = H.Element('div', { className: 'mathJax_blockContainer', id: edit.id + '-mathJaxblockContainer' });
      row.appendChild(mathJaxWrapper);

      //Add in the script tag.
      if(content && type=='math/mml'){
          d = H.addElement(mathJaxWrapper, "script", { id: id, type: 'math/mml' }, content || '');
      } else {
          d = H.addElement(mathJaxWrapper, "script", { id: id, type: 'math/tex' }, content || "\\displaystyle {}");
      } 
    } 
    if(d && d.type){
      edit.htmlId = id + "-Frame";
    }
    return edit;
  },
  getEditors: function(){//Get all the editors associated with this widget
    return this.editors;
  },
  setEditors: function(editors){//Keep a reference to all our built up ed
    this.editors = editors;
  },
  build: function(){//If you do NOT want this called on class init pass {NO_BUILD: true}
    //Build the nodes into the html as needed
    var editors = this.buildEditors(this.getContainerDom());
    
    //Ensure the math is processed for each new editor
    for(var i in editors){
      var edit = editors[i];
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, edit.contentId]);
    }
    this.setEditors(editors);
    //Bind information in the dom to the different editors
    MathJax.Hub.Queue(this.connectPipes.bind(this));
  },
  bindClick: function(){
    var d = document.getElementById(this.CFG.containerId);
    if(d){
      d.onclick = this.focus.bind(this);
      try{
        KPH.bindUnfocus(); //So that we can unfocus if they click something else.
      }catch(e){
        console.error("Failed to bind unfocus.", e);
      }
    }
  },
  //This is the default callback that is called from MathJax when the eq is parsed
  connectPipes: function(args){ //Connects all the subclasses together with this widget
    if(!this.UTIL){

      this.UTIL  = this.UTIL  || new UTIL(this);
      this.MOUSE = this.MOUSE || new MOUSE(this);

      //GARNISH and assemble the sandwich
      this.setContentLabel(this.CFG.contentLabel);
      this.bindClick();

      //Configure tool is only defined so that we can add remove buttons to the
      //editors when they are created.
      if(this.CFG.configure && MathJax.Editor.Tools){
        this.TOOLS = new MathJax.Editor.Tools(this);
      }

      var editors = this.getEditors();
      var edit    = null;
      for (var i=0; i<editors.length;++i){
        edit = editors[i];
          var lText = this.CFG.editorLabels[i];
        this.connectEditor(edit, null, this.CFG.editorLabels[i]);
      }
      this.setEdit(editors[0]); //Default select the "first" editor rather than last

      //Navigation controls
      if(this.CFG.tabs && this.CFG.tabContainerId){
      	this.CONTENT = this.CONTENT || new CONTENT(this);
      	this.CONTENT.setUtil(this.UTIL);
        this.CONTENT.build(this.CFG.tabConfig);
      }
      //If content tabs exist, it will be the 1st el in tab div
      if(this.CFG.navigationId){  //Note: Intentionally AFTER content creation.
        this.NAVIGATION = this.NAVIGATION || new NAVIGATION(this);
        this.NAVIGATION.build();
      }

      //Actually build the config tool UI, this requires the elements already in the page.
      if(this.TOOLS){
        this.TOOLS.setContent(this.CONTENT);
        this.TOOLS.build();
      }
      if(typeof this.CFG.cb == 'function'){ //post create callbacks when building the editor
        this.CFG.cb(this);
      }
      this.CFG.fontTest(); //Test the font sizes on this page.
    }
  },
  connectEditor: function(edit, cb, label){ //Connects all the callbacks and mouse click handlers
    this.setEdit(edit);
    edit.setUtil(this.UTIL);
    edit.setEditMode(this.CFG.editMode);

    edit.updateInput();
    edit.addUpdateCb(edit.makeEditable.bind(edit));
    edit.addUpdateCb(edit.updateInput.bind(edit));
    edit.addUpdateCb(this.MOUSE.bindToDom.bind(this.MOUSE, edit));

    edit.setLabel(label);
    //This function appears to be safe to call now
    this.MOUSE.bindToDom(edit);
    if(this.TOOLS){//Only created if this.CFG.configure set to true
      this.TOOLS.createTools(edit, label);
    }
    if(typeof cb == 'function'){ 
      cb(edit);
    }
  },
  focus: function(evt){ //Send all the top level key events to this editor 
    evt = evt || window.event;
    if(evt){
      this.stopEvt(evt);
    }
    this.focusEdit(this.getEdit());
    KPH.listen(this);
  },
  unfocus: function(){//Remove focus from the widget (key operations etc)
    this.focusEdit(null);
    KPH.sleep(); //Don't pay attention to me
  },
  setContentLabel: function(label){ //Set the label on the eq
    var d = document.getElementById(this.CFG.containerId);
    if(label && d){
      this.CFG.contentLabel = label;
      var labelId = 'Eq-Label-' + this.CFG.containerId;
      var labelDom = document.getElementById(labelId);
      if(!labelDom){
        labelDom = H.Element('div', {className: 'mje_class_label no-highlight', id: labelId});
        d.insertBefore(labelDom, d.firstChild);
      }
      labelDom.innerHTML = label;
    }
  },
  toMathML: function(){//Get all the mathML for the various editors
    var mathML  = [];
    var editors = this.getEditors();
    if(editors && editors.length){
      for (var i in editors){
        var eq = editors[i].getEq();
        if(eq){
          mathML.push(editors[i].toMathML());
        }
      }
    }
    return mathML;
  },
  serialize: function(){//Serialize the object state and ids 
    var data = {};
    for (k in this.CFG){ 
      var val =  this.CFG[k]; 
      if(typeof val != 'function' && !(typeof val == 'object' && val && val.CFG)){
        data[k] = val;
      }
    }
    data.tabConfig = this.CFG.cleanTabConfig(data.tabConfig);
    data.mathML    = this.toMathML();

    delete data['$className'];
    return data;
  },
  serializeSettings: function(){ //Serialize a "config" but remove domId information
    var conf  = this.serialize() || {};
    for(k in conf){
      if(k && (k.match('Id') || k == 'id')){
        conf[k] = ''; delete conf[k];
      }else if (typeof conf[k] == 'undefined' || conf[k] === '' || typeof conf[k] == 'function'){
        delete conf[k];
      }
    }
    conf.configure = false;
    conf = JSON.parse(JSON.stringify(conf)); //Purge any functions and copy.
    return conf;
  },
  updateEditors: function(mathMLArr){ //Update editors with new mathml
    if(!mathMLArr) return;
    if(typeof mathMLArr == 'string'){
      mathMLArr = [mathMLArr];
    }
    var editors = this.getEditors();
    for(var m in mathMLArr){
      var mathML = mathMLArr[m];
      if(m < editors.length){
        editors[m].updateMathML(mathML);
      }else{
        this.addEditor(null, mathML, 'math/mml');
      }
    }
  },
  unserialize: function(data, id){//Take config data and rebuild a widget
    data = data || {};
    if(typeof data == 'string'){
      try{
        data = JSON.parse(data);
      }catch(e){
        console.error("Invalid initialization config (data, id, e)", data, id, e);
        data = {};
      }
    }
    this.id = data.id || id;
    return new CONFIGURE(this, data || {}, this.id);
  },
  rebuild: function(focusIndex){ //Rebuild the widget and then rebuild it into the page.
    var conf = JSON.parse(JSON.stringify(this.serialize()));
    if(!isNaN(focusIndex) && focusIndex != null){
      conf.cb = function(focusIndex, w) { 
        var editors = w.getEditors();
        if(focusIndex-1 >=0){
          w.focusEdit(editors[focusIndex-1]);
        }else if(editors.length){
          w.focusEdit(editors[editors.length -1]);
        }
      }.bind(null, focusIndex);
    }

    //Rebuild the widget and re-focus (Note that you LOSE your references!!!)
    this.remove();
    return new MathJax.Editor.Widget(conf);  
  },
  remove: function(){ //Remove the Widget from the page
    //Remove from globals
    MathJax.Editor.Store.set(this.id, null);

    //Clear out the editors
    var editors = this.getEditors(); 
    for(var i in editors){
      var ed = editors[i];
      this.removeEditor(ed);
    }
    //Remove HTML content(todo, ensure this is the behavior we want?)
    this.cleanDom(this.CFG.tabContainerId);
    this.cleanDom(this.CFG.navigationId);
    var cl = document.getElementById(this.CFG.containerId);
    if(cl){//Assume we might be rebuilding, leave the container in position?
      cl.innerHTML = '';
    }
    this.cleanDom(this.CFG.configureId);
  },
  isEmpty: function(){ //Test to see if the user has entered anything, note that \\Box == empty
    var check   = true;
    var editors = this.getEditors();
    if(editors){
      for(var i in editors){
        var edit = editors[i];
        if(!edit.isEmpty()){
          check = false;
        }
      }
    }
    return check;
  },
  getImage: function(userCb){ //Gets the image, unfortunately the svg doesn't work without the fonts
    if(typeof userCb != 'function'){
      console.error("You must provide a callback function to use this call.");
      return;
    }
    var callback = function(userCb){
      try{
        var edit = this.getEdit();
        var dom = document.getElementById(edit.htmlId); 

        var svg  = dom.firstChild;
            dom.removeChild(svg);
        var img = H.Element('img');
            img.appendChild(svg);
        userCb(img);
      }catch(e){
        console.error("Failed to create an image.", e);
      } 
      MathJax.Hub.Queue(
        ["setRenderer",HUB,'HTML-CSS',"jax/mml"], 
        edit.Update.bind(edit)
      );
    }.bind(this, userCb);

    MathJax.Hub.Queue(
      ["setRenderer",HUB,'SVG',"jax/mml"]
    );
    this.getEdit().Update(callback);
  },
  Update: function(cb){ //Update all the editors (helper for when zoom level is changed)
    var eds = this.getEditors() || [];
    for(var i =0; i<eds.length; ++i){
      eds[i] && eds[i].Update && eds[i].Update(cb);
    }
  },
  cleanDom: function(id){//TODO: Test Memory, listener leaks...
    if(!id) return;
    var d = document.getElementById(id); 
    if(d && d.parentNode){ d.parentNode.removeChild(d);}
  },
  clearAll: function(){//Clear the math from all the editors on this widget.
    var editors = this.getEditors();
    for(var i in editors){
      editors[i].clear();
    }
  }
});
MathJax.Editor.Widget = WIDGET;
//Close class definition
})(MathJax.Hub, MathJax.Ajax, MathJax.Editor.Config);
