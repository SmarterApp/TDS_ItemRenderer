 /**
 Copyright © 2012 American Institute for Research. All Rights Reserved.
 
 Redistribution and use in source and binary forms, with or without modification, are permitted provided that the         following conditions are met:
 
 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following      disclaimer.
 
 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following   disclaimer in the documentation and/or other materials provided with the distribution.
 
 3. The name of the author may not be used to endorse or promote products derived from this software without specific     prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY [LICENSOR] "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,    THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE     AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)        HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR   OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/*
  This file is the configuration for some of the basic tabs and interfaces.
  It also provides a set of helper functions for dealing with buttons, and Unicode
  characters that exist in MathJax.

  MathJax.InputJax.TeX.Definitions
    mathchar0mi
    mathchar0mo
    mathchar7
    delimiter

  The main pieces a dev might be interested in are the PlaceHold which is
the default element substituted into any \PH strings.   The _only_ reason
this is allowed is that it makes editing easier (something to click on).  Also
everyone seems to want to have their own placeholder (x, \\Box, var etc etc)
*/
if(!window.console){ //Help deal with IE lacking console except in debug modes.
  window.console = {
    log: function(){},
    error: function(){},
    warn: function(){},
    info: function(){}
  };
}
if(!Function.prototype.bind){ //More legacy IE support.
  Function.prototype.bind = function (oThis){
  if(typeof this !== "function"){
    // closest thing possible to the ECMAScript 5 internal IsCallable function
    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
  }

  var aArgs = Array.prototype.slice.call(arguments, 1),
    fToBind = this,
    fNOP = function (){},
    fBound = function (){
      return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
    };

  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
  };
}
if(!String.prototype.trim){
  String.prototype.trim = function(){
    return this.replace(/^\s+|\s+$/g,"");
  }
}

(function(){
  if(!window.MathJax){return;}
  MathJax.Editor        = MathJax.Editor || {};
  MathJax.Editor.Config = MathJax.Editor.Config || {};

  //For a few extra console logs.
  MathJax.Editor.Config.DEBUG = true;

  /**
   *  Tab and row configuration should probably be loaded on an app by app
   *  basis.   Our defaults are in content.js (simple example tabs etc);
   */
  MathJax.Editor.Config.Rows = MathJax.Editor.Config.Rows || {}; //see content.js
  MathJax.Editor.Config.Tabs = MathJax.Editor.Config.Tabs || {}; //see content.js

  MathJax.Editor.Config.HistoryLength = 10;       //How many undo / redo operations to store (arr based history)
  MathJax.Editor.Config.PlaceHold    = '\\Box';   //What to use to sub into PH elements (also defaults to replace mode in edits)
  //MathJax.Editor.Config.StarReplace = '\\bullet'; //Replace a * with this in text entry mode
  MathJax.Editor.Config.StarReplace = MathJax.Editor.Config.StarReplace || function (editorContext) {
      var starBtn = {};
      if (editorContext) {
          if (typeof (editorContext.WIDGET.CONTENT.getActiveBtns()["*"]) == 'object') {
              starBtn = editorContext.WIDGET.CONTENT.getActiveBtns()["*"];
          }
          else if (editorContext && typeof (editorContext.WIDGET.CONTENT.getActiveBtns()["times"]) == 'object') {
              starBtn = editorContext.WIDGET.CONTENT.getActiveBtns()["times"];
          }
      }
      if (starBtn.value)
          return starBtn.value;
      else if (starBtn.key)
          return starBtn.key;
      else
          return '\*';

  };

  //Helpful defualts.
  MathJax.Editor.Config.TeXEntryMode = {
    None: 'None',
    Allow:  'Allow',
    Vim: 'Vim'
  };
  //Allow the user to type things into the text input
  MathJax.Editor.Config.TeXEntryDefault = MathJax.Editor.Config.TeXEntryMode.Allow;

  //Only allow the user to type in keys that correspond to buttons
  MathJax.Editor.Config.RestrictKeysToContent = false;

  //Should the navigation controls show up by default.
  MathJax.Editor.Config.Navigation = true;

  //Used if the font size text fails.
  MathJax.Editor.Config.DefaultTextBoxPx = 5; //Initial size so you can see and tap it.
  MathJax.Editor.Config.FontSizePx = 10;  //How much the input box grows as you type into it (dynamically tries to calc better val)
  MathJax.Editor.Config.Scale      = 150; //Scale value for the MathJax Config
  MathJax.Editor.Config.MaxCharacterLimit = 100; //Number of maximum characters per editor Row.

  //Codes used to alter behavior in the editor itself.
  MathJax.Editor.Config.EditModes = MathJax.Editor.Config.EditModes || {
    DEFAULT: 'INSERT',
    INSERT:  'INSERT',
    APPEND:  'APPEND',
    UNSHIFT: 'UNSHIFT',
    REPLACE: 'REPLACE'
  };

  //Classes to apply to the element that is currently being acted upon ie(select a 2)
  MathJax.Editor.Config.EditCls = MathJax.Editor.Config.EditCls || {
    INSERT : 'mje_insert_select',
    REPLACE: 'mje_replace_select'
  };

  //Labels for Navigation and eventually extended to support configuration labels.
  MathJax.Editor.Config.Label = MathJax.Editor.Config.Label || {
    Next: '←',
    Prev: '→',
    Undo: 'Undo',
    Redo: 'Redo',
    Delete: 'Delete',
    
    //Placeholder
    None: 'None'
  };

  /* This one is complicated.  This determines if a placeholder replacement is going to try and
   * contain your selection instead of just inserting / appending.  For example if you had selected
   * x, and hit a button that inserted \sqrt{\PH} magic on will produce \sqrt{x}.  Without it you  
   * would get x \sqrt{\\PH}.  Note Magic does note affect mo objects (ie: +\sqrt{PH})
   */
  MathJax.Editor.Config.MagicDisabled      = false;

  //Hacks to make some TeX entry things play nice, can override by passing the keys
  //ie new MathJax.Editor.Widget({SanitizeTeXEnabled: false, sanitizeTeX: myFunctionRetunsString});
  MathJax.Editor.Config.SanitizeTeXEnabled = true;
  MathJax.Editor.Config.sanitizeTeX = MathJax.Editor.Config.sanitizeTeX || function(initialText){
    if(typeof initialText != 'string') return;
    var text = initialText.trim();
    if(text.match(/^\^/)) {text = '\\PH' + text;}
    if(text.match(/\^$/)) {text = text + '\\PH';}
    if(text.match(/^_/))  {text = '\\PH' + text;}
    if(text.match(/_$/))  {text = text + '\\PH';}
    if(text.match(/\*/)) { text = text.replace(/\*/, MathJax.Editor.Config.StarReplace(this)); }
    text = text.replace(/\<=/, '\\le ');
    text = text.replace(/=\</, '\\le ');
    text = text.replace(/\</, '\\lt ');
    text = text.replace(/\>=/, '\\ge ');
    text = text.replace(/=\>/, '\\ge ');
    text = text.replace(/\>/,  '\\gt ');

    //mfenced operations (a bit scary)
    text = !text.match('left') ? text.replace(/\(/, '\\left(') : text;
    text = !text.match('right') ? text.replace(/\)/, '\\right)') : text;
    text = text.replace(/\\left\(\\right\)/, '\\left(\\Box\\right)');
 
    if(text == '\\lvert\\Box\\rvert'){text = '\\left|\\Box\\right|';} //Force actual mrow element
    return text;
  };



  /**
   * Creates a one time lookup of standard MathJax elements pointing
   * to what you probably want to use when creating a button.   Also
   * adds on (\PH) to any Named functions so that when a user clicks
   * a button they get function(\Box) instead of just a cos floating about.
   */
  MathJax.Editor.Config.Lookup = null;
  MathJax.Editor.Config.getLookup = function(){
    if(MathJax.Editor.Config.Lookup == null){
      MathJax.Editor.Config.Lookup = {};
  
      var lookups = [
        MathJax.InputJax.TeX.Definitions.mathchar0mi,
        MathJax.InputJax.TeX.Definitions.mathchar0mo,
        MathJax.InputJax.TeX.Definitions.mathchar7,
        MathJax.InputJax.TeX.Definitions.macros,
        MathJax.InputJax.TeX.Definitions.delimiter
      ];
      var uni  = null;
      var look = null;
      var hex  = null;
      for(var i in lookups){
        look = lookups[i];
        for (var k in look){
          uni = look[k];
          if(typeof uni != 'string'){
            uni = uni[0];
          }
          hex = uni;
          if(hex && hex.length == 4){//Guess that if it is 4 char and a string...
            hex = '"\\u' + hex +'"';
            try{ uni = eval(hex); }catch(e){uni = k;} //There MUST be a faster way.
          } else {
            if(hex == 'NamedFn'  || hex == 'NamedOp'){
              uni =  '\\'+ k + '(\\PH)';
            }else{
              uni = k; //AKA do not know how to handle correctly...
            }
          }
          MathJax.Editor.Config.Lookup[k] = uni;
        }
      }
    }
    return MathJax.Editor.Config.Lookup;
  };



  /**
   *  Ensure that if you are assuming a 'key' of pi, that you add \pi before
   * sending it onto the TeX parser.
   */
  MathJax.Editor.Config.getMathVal = function(val, ph){
    if(typeof val == 'string'){
       var look = MathJax.Editor.Config.getLookup(); 
       val = (val || '').trim();
       if(look[val]){ 
        val = val && val.length > 1 && !val.match(/\\/) ? "\\" + val : val;
       }
     } else {
       console.warn('Non string value in getMathVal', val);
       val += '';
     }
     return val;
  };


  /**
   * Provide a hash of useful configuration for a particular TeX => Unicode 
   * info.   This is for subsituting out placeholders, displaying the unicode
   * on buttons and generally handling the mapping from MathJax into easy to 
   * configure buttons.
   */
  MathJax.Editor.Config.getUnicode = function(k, ph){
    if(!k || k.isParsed){
      return k;
    }
    var value = k.value;
    var ret = {key: k.key || k, text: k.text || (!k.css ? (k.key || k) : '')};
    var hex = null;
    var uni = null;
    var lookups = MathJax.Editor.Config.getLookup();

    var key = k.key || k;
    if(!k.value && lookups[key]){
      hex = lookups[key];     
      if(hex){
        ret.text = k.text || hex;
        if(ph){
          ret.text = ret.text.replace(/\(\\PH\)/g, '');
          ret.text = ret.text.replace('\\', '');
        }
        if(hex.length > 1){ //If it is a named function we have done a sub with key(\\PH)
          value = hex;
        }
      }
    }
    if(value == '' || value == null || typeof value == 'undefined'){
      value = MathJax.Editor.Config.getMathVal(k.key || k);
    }
    ret.value    = value.replace(/\\PH/g, ph || '');
    ret.keyCode  = k.keyCode;
    ret.isParsed = true;
    return ret;
  };
})();
