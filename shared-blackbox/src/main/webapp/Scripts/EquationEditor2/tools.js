//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 *  This class is a helper for constructing a new instance of the widget.   If you pass 
 *  {configure: true} into the widget it will use this to make an editor UI.  This editor
 *  will help with creating a JSON config that you can use to customize the widget.
 */
(function(HUB, AJAX, CONFIG){
if(!window.MathJax){return;}

var H   = MathJax.HTML;

MathJax.Editor.Tools = MathJax.Editor.Comp.Subclass({
  $className: 'MathJax.Editor.Build',
  Init: function(w){
    this.WIDGET = w;
    this.CFG    = w.CFG;
  },
  setContent: function(content){//Reference for the tab class
    this.content = content;
  },
  getContent: function(){//Return the content el (deals with button tabs etc);
    return this.content;
  },
  buildCommon: function(conf){
    if(!conf) return;
    var sel = H.Element('select');
        sel.onchange = this.onChange.bind(this);
    for(var k in conf){
      var el = conf[k];
      H.addElement(sel, 'option', {
        value: JSON.stringify(el),
        style: {height: '32px'},
        className: el.css || ''
      }, !el.css ? (el.text || el.key) : '');
    }
    var tr  = H.Element('tr');
    var td  = H.addElement(tr, 'td', {}, '');
        td.appendChild(sel);
    H.addElement(tr, 'td', {}, 'Common');
    return tr;
  },
  getEditorLabelInput: function(edit, label){ //Update the editor labels.
    var inp =  H.Element('input', {
      id: 'Eq-Editor-Label-Input' + this.CFG.id,
      type: 'text',
      className: 'mje_label_input',
      title: 'For labeling a single editor',
      value: (label || '')
    });
    inp.onkeyup = (function(edit, inp, evt){
      this.stopEvt(evt);
      this.CFG.editorLabels[this.getWidget().getEditIndex()] = inp.value;
      try{
        edit.setLabel(inp.value);
      }catch(e){
        console.error("Failed to set the label.", e);
      }
    }).bind(this, edit, inp);
    inp.onclick = (function(edit, inp, evt){
      this.stopEvt(evt);
      this.getWidget().setEdit(edit); //Important for indexing the label
    }).bind(this, edit, inp);
    return inp;
  },
  buildTblRow: function(label, hash){//Builds button creation using the MathJax configuration
    var tr  = H.Element('tr');
    var cmb = this.buildComboOps(hash);
        cmb.onchange = this.onChange.bind(this);
    var td  = H.addElement(tr, 'td', {}, '');
        td.appendChild(cmb);
    H.addElement(tr, 'td', {}, label);
    return tr;
  },
  getToggleBtn: function(text, div, container){//A button that toggles the hidden state of the target div
    var btn = H.Element('button', {type: 'button'}, text || ''); 
        btn.onclick = this.toggle.bind(this, {div: div}, btn);

    this.addCls(div, 'hidden mje_toggle_div');
    container.appendChild(btn);
    container.appendChild(div);
    return btn;
  },
  toggle: function(info, btn){//Toggle function for the button created in getToggleBtn
    info.state = !info.state;
    var div = info.div;
    if(info.state){
      this.addCls(btn, 'mje_button_down');
      if(div){
        this.removeCls(div, 'hidden');
      }
    }else{
      this.removeCls(btn, 'mje_button_down');
      if(div){
        this.addCls(div, 'hidden');
      }
    }
  },
  getConfigureDom: function(){
    var id = 'Configure_' + this.CFG.containerId;
    var d = document.getElementById(id);
    if(!d){
        d = H.Element('div', {id: id, className: 'mje_configure'});
    }
    this.CFG.configureId = id;
    return d;
  },
  getNewEqBtn: function(){//Will add an eq line to the current widget (adds an EDIT instance)
    var w = this.getWidget();
    var nBtn = H.Element('button', {type: 'button', className: 'mje_new_eq_btn'}, 'Add New');
        nBtn.onclick = function() {
          this.addEditor();
        }.bind(w);
    return nBtn;
  },
  getClearEqBtn: function(edit){ //Clears the passed in editor for the user
    var cBtn = H.Element('button', {type: 'button',className: 'mje_new_clr_btn'}, 'Clear');
        cBtn.onclick = edit.clear.bind(edit);
    return cBtn;
  },
  getRmEqBtn: function(edit){//A button that allows for the removal of an editor line
    if(!edit) return;
    var w = this.getWidget();
    var rBtn = H.Element('button', {type: 'button', className: 'mje_rm_eq_btn'}, 'Remove');
        rBtn.onclick = w.removeEditorObj.bind(w, edit);
    return rBtn;
  },
  createTools: function(edit, label){
    var d = document.getElementById(edit.htmlId);
    console.log("Create tools being called for edit", edit, edit.htmlId);
    if(d){
      var ctl = H.Element('span', {className: 'mje_eq_ctl'});
      ctl.appendChild(this.getEditorLabelInput(edit, label));
      ctl.appendChild(this.getNewEqBtn()); 
      ctl.appendChild(this.getClearEqBtn(edit)); 
      ctl.appendChild(this.getRmEqBtn(edit)); 

      d.parentNode.insertBefore(ctl, d.nextSibling);
    }
  },
  build: function(){ //Create the tabs and buttons for this widget.
    var dom = document.getElementById(this.CFG.containerId);
    if(!dom) return;
    var d = this.getConfigureDom();
    d.onclick = function(){
      MathJax.Editor.KeyPressHandler.sleep();
    };

    //Edit Modes
    d.appendChild(this.getConfigContent());
    H.addElement(d, 'br');
    d.appendChild(this.getRowBuilder());
    d.appendChild(this.getTabBuilder());
    H.addElement(d, 'br');
    d.appendChild(this.getBtnTable());
    
    //Advanced options you typically won't need or would not want a non-tech content person touching
    var advDiv = H.Element('div');
        advDiv.appendChild(this.getCustomBtnTbl());
        advDiv.appendChild(this.getEditMode());
        advDiv.appendChild(this.getTeXConfBtn()); //TODO: Port
        advDiv.appendChild(this.getEditPlaceHold());
        H.addElement(advDiv, 'br');
    this.getToggleBtn('Advanced', advDiv, d);
    
    //Serialize
    d.appendChild(this.getSerializeBtns());

    //We insert before the container in configure mode because we are listing for certain click events
    //that make using buttons pretty annoying.
    dom.parentNode.insertBefore(d, dom);
    this.getContent().addBuildCb(this.makeControlsEditable.bind(this), true);
  },
  makeControlsEditable: function(){
    var content = this.getContent();
    if(content){
      this.makeRowsEditable(content);
      this.makeTabsEditable(content);
    }
  },
  makeRowsEditable: function(content){
    var tabs = content.tabContent;
    for(var i=0; i<tabs.length; ++i){
      var rows = tabs[i].children || [];
      for(var j = 0; j < rows.length; ++j){
      var rBtn = H.Element('button', {type: 'button', className: 'mje_del_row_btn'}, 'REMOVE'); 
          rBtn.onclick = content.removeRow.bind(content, j, i);
        rows[j].appendChild(rBtn);
      }
    }
  },
  makeTabsEditable: function(content){
    var tabs = content.tabs;
    for(var i=0; i<tabs.length; ++i){
      var edit = H.Element('span', {className: 'mje_edit_tab'});
      var rBtn   = H.addElement(edit, 'button', {type: 'button', className: 'mje_del_tab_btn', alt: 'Remove Tab'}, 'x');
          rBtn.onclick = content.removeTab.bind(content, i);
      tabs[i].appendChild(edit);
    }
  },
  getHelp: function(hover, str){
    str = str || '?';
    var qMark = H.Element('span', {title: hover || '', className: 'mje_question'}, str);
    var div = H.addElement(qMark, 'div', {className: 'hidden'}, hover);
    qMark.onclick = function(hover){alert(hover);}.bind(null, hover);
    return qMark;
  },
  getConfigContent: function(){
    var confDiv = H.Element('div');
        confDiv.appendChild(this.getHelp('Configuration for the label and' + 
          ', if the navigation controls should show up in the widget.'
        ));
        confDiv.appendChild(this.getLabelContent()); //
        confDiv.appendChild(this.getNavigationBtn());
    return confDiv;
  },
  getLabelContent: function(){
    var inp = H.Element('input', {
      title: 'Header label for the entire eq item', 
      type: 'text', 
      style: {width: '400px'}, 
      value: this.contentLabel || ''
    });
    inp.onkeyup = (function(inp, evt){
      evt = evt || window.event;
      evt.stopPropagation ? evt.stopPropagation() : window.event.cancelBubble = true;
      this.CFG.contentLabel = inp.value;
      try{
        this.getWidget().setContentLabel(inp.value);
      }catch(e){
        console.error("Failed to set the label.", e);
      }
    }).bind(this, inp);
    return inp;
  },
  getTeXConfBtn: function(){
    var div = H.Element('div', {className: 'mje_conf_subdiv'}); 
        div.appendChild(H.Element('span', null, 'Keyboard Editing: '));
    var modes = CONFIG.TeXEntryMode;
    for(var k in modes){
      var val = modes[k];
      var inp = H.addElement(div, 'input', {
        type: 'radio', 
        name: 'TeXEntryMode', 
        value: val,
        checked: (val == this.CFG.TeXEntryMode) ? true : false
        }
      );
      H.addElement(div, 'span', {}, k);
      inp.onchange = function(inp){
        this.CFG.TeXEntryMode = inp.value;
      }.bind(this, inp);
    }
    div.appendChild(this.getHelp('Choose the type of edit mode the user has available.' +  
    '  None will disable keyboard entry for the user.' +
    '  TeX will allow the user to type in math / TeX commands.' + 
    '  Vim will allow for modified editing using Vim like editing and keys to do replacement of elements.'
    ));
    return div;
  },
  getNavigationBtn: function(){
    var div = H.Element('div', {className: 'mje_conf_subdiv'}); 
    var inp = H.addElement(div, 'input', {
       type: 'checkbox',
       name: 'navigation',
       checked: typeof this.CFG.navigation != 'undefined' ? this.CFG.navigation : false
    });
    inp.onchange = function(inp){
      this.CFG.navigation = inp.checked;
    }.bind(this, inp);
    H.addElement(div, 'span', null, 'Enable Button Navigation');
    return div;
  },
  getSerializeBtns: function(){
    var div = H.Element('div', {className: 'mje_serialize_button'}, 'Serialize Config: ');

    var widget = this.getWidget();
    var newEdit = H.addElement(div, 'button', {type: 'button',className: 'mje_new_edit_line_button'}, 'New Edit Line');
	  newEdit.onclick = function(){this.addEditor();}.bind(widget);//Chrome passes the btn event...

    var bJson = H.addElement(div, 'button', {type: 'button',className: 'mje_serialize_button'}, 'As Json');
        bJson.onclick = (function(){ 
          var settings = JSON.stringify(this.getWidget().serializeSettings()); 
          alert(settings);
        }).bind(this);

    var bRebuild  = H.addElement(div, 'button', {type: 'button',className: 'mje_serialize_button'}, 'Rebuild');
        bRebuild.onclick = widget.rebuild.bind(widget); 

    return div;
  },
  getEditPlaceHold: function(){
    var div = H.Element('div'); 
    var inpt = H.addElement(div, 'input', {type: 'text', value: this.CFG.placeHold});
    var btn  = H.addElement(div, 'button', {type: 'button'}, 'Set default placeholder'); 
        btn.onclick = (function(inp){ 
          if(inp.value){
            this.CFG.placeHold = inp.value;
          } else {
            alert('You must provide a value for the default placeholder.');
          }
        }).bind(this, inpt);
    div.appendChild(this.getHelp('The placeholder to use when inserting math items.  Probably want to leave as box.' +
          '  You can change to TeX or vars like x so that the when the user inserts a fraction it would be a/x vs' +
          ' a/\\Box'));
    return div;
  },
  getEditMode: function(){
    this.CFG.editMode = this.CFG.editMode || CONFIG.EditModes.DEFAULT;
    var div = H.Element('div'); 
        H.addElement(div, 'span', null, 'Selection Options: ');
        div.appendChild(this.getHelp("The default edit mode to use when the user clicks an element." + 
        "  Replace would always replace the selected math, Insert will insert after the cursor.")
        ); 
    var eM = CONFIG.EditModes;
    for (k in eM){
      if(k == 'UNSHIFT' || k == 'APPEND') continue;//Dumb as defaults? probably.
      var inp = H.addElement(div, 'input', {
        type: 'radio', name: 'editModes', value: k, checked: k == this.CFG.editMode ? true : false
      });
      inp.onchange = function(inp){
        this.CFG.editMode = inp.value;
        this.getEdit().setEditMode(inp.value);
      }.bind(this, inp);
      H.addElement(div, 'span', {}, k);
    }
    return div;
  },
  getRowBuilder: function(){
    var rowDiv = H.Element('div');
    var inp = H.Element('input', {type: 'text', value: 'New Row(Press Enter) or'}); 
        inp.onkeyup  = function(inp, evt){
          evt = evt || window.event;
          if(evt && evt.keyCode == 13 && inp.value){
            this.getContent().addRow(
              {title: inp.value,
             items: []
            });
          }
        }.bind(this, inp);

    var rowSelector = this.buildComboHash(CONFIG.Rows);
        rowSelector.onchange = (function(evt){
          evt = evt || window.event;
          var val = evt.currentTarget ? evt.currentTarget.value : '';
          var row = CONFIG.Rows[val];
          if(row){
            var content = this.getContent();
            content.addRow(row);
            content.rebuild();
          }
        }.bind(this));

    rowDiv.appendChild(inp);
    rowDiv.appendChild(rowSelector);
    rowDiv.appendChild(this.getHelp('The ability to add a row into the selected tab, these start empty or can be a default button set from the dropdown.'));
    return rowDiv;
  },
  getTabBuilder: function(){
    var content = this.getContent();
    var inp = H.Element('input', {type: 'text', value: 'New Tab (press enter) or'}); 
        inp.onkeypress = function(inp, evt){
          evt = evt || window.event;
          if(evt && evt.keyCode == 13 && inp.value){
            this.getContent().addTab({}, inp.value);
            this.getContent().rebuild();
          }
        }.bind(this, inp);

    var selTabs = this.buildComboArr(CONFIG.Tabs.Order, 'Select predefined');
        selTabs.onchange = (function(evt){
          evt = evt || window.event;
          if(!evt || !evt.currentTarget) return;
          var val = evt.currentTarget.value;
          if(val && CONFIG.Tabs[val]){
            var content = this.getContent();
            content.addTab(CONFIG.Tabs[val], val);
            content.rebuild();
          }
        }).bind(this);

    var selDiv  = H.Element('div');
        selDiv.appendChild(inp);
        selDiv.appendChild(selTabs);
        selDiv.appendChild(this.getHelp(
          'Add a new tab to the editor, this tab can be a predefined element from the dropdown or text entered in the box.  You may later add rows and then buttons into the tab'
        ));
    return selDiv;
  },
  buildBtnRow: function(k, el){
    var tr  = H.Element('tr');
    var td  = H.addElement(tr, 'td', {}, k);
    var tdEl = H.addElement(tr, 'td');
        tdEl.appendChild(el);
    return tr;
  },
  getBtnTable: function(){
    var div = H.Element('div');
    var tbl = H.Element('table');
    var tbd = H.addElement(tbl, 'tbody');
    H.addElement(tbd, 'th', {}, 'Default Buttons');

    //Common buttons defined in our editor config, not in the MathJax set.  
    if(CONFIG.Common){
      tbd.appendChild(this.buildCommon(CONFIG.Common));
    }

    tbd.appendChild(this.buildTblRow('MI', MathJax.InputJax.TeX.Definitions.mathchar0mi));
    tbd.appendChild(this.buildTblRow('MO', MathJax.InputJax.TeX.Definitions.mathchar0mo));
    tbd.appendChild(this.buildTblRow('CHAR', MathJax.InputJax.TeX.Definitions.mathchar7));
    tbd.appendChild(this.buildTblRow('MACROS', MathJax.InputJax.TeX.Definitions.macros));
    tbd.appendChild(this.buildTblRow('DELIMITER', MathJax.InputJax.TeX.Definitions.delimiter));
    div.appendChild(this.getHelp('Choose from a set of existing MathJax terms to create a button in the currently selected row.  To select a row, simply click on a tab, and then click on a button or the page near the row.'));
    div.appendChild(tbl); //Don't add to dom till it is all built up.
    return div;
  },
  getCustomBtnTbl: function(){
    var div = H.Element('div');
        div.appendChild(this.getHelp('Create a custom button.' + 
        '  First provide a key this can be the only required piece of information such as x.' +   
        '  Alternatively provide a value for the button which can be a complex TeX element.' + 
        '  For example you could have a button with key: Test and value: \\int_x^{\\infty}{x}. ' + 
        '  That button would insert a complex intergal inserted onclick.' + 
        '  You can test your button after hitting create, by clicking it in the row you had selected/added to.')
       );
        
    var key  = H.Element('input', {type: 'text'}, ''); //key
    var val  = H.Element('input', {type: 'text'}, ''); //value
    var css  = H.Element('input', {type: 'text'}, ''); //css
    var text = H.Element('input', {type: 'text'}, ''); //text

    var tbl = H.Element('table');
    var tbd = H.Element('tbody');
        tbd.appendChild(H.Element('th', {}, 'Custom Button'));
        tbd.appendChild(this.buildBtnRow('Key (TeX lookup)', key));
        tbd.appendChild(this.buildBtnRow('Value (can be complex TeX)', val));
        tbd.appendChild(this.buildBtnRow('Text (optional, defaults to key / unicode lookup)', text));
        tbd.appendChild(this.buildBtnRow('CSS (optional, overrides text / button display)', css));
        tbl.appendChild(tbd);
    var btn = H.Element('button', {type: 'button'}, 'Create Custom Button');
        btn.onclick = (function(key, val, css){ 
          if(key.value === '' || key.value === null){
            alert('You cannot create a button without a key.');
          } else {
            var conf = CONFIG.getUnicode(key.value, this.CFG.placeHold);
                conf.value = val.value  || conf.value;
                conf.css   = css.value  || conf.css;
                conf.text  = text.value || conf.text;
            this.addBtn(conf);
          }
        }).bind(this, key, val, css);

    var content = this.getContent();
    var rBtn = H.Element('button', {type: 'button'}, 'Remove Selected Button');
        rBtn.onclick = content.removeBtn.bind(content);
    div.appendChild(tbl);
    div.appendChild(btn);
    div.appendChild(rBtn);
    div.appendChild(H.Element('br'));
    return div;
  },
  onChange: function(evt){
    var val = evt.currentTarget ? evt.currentTarget.value : null;
    var ph  = this.CFG.placeHold;
    if(typeof val == 'string'){
      try{
        val = JSON.parse(val);
      }catch(e){} //swallow it whole
    }
    var ret = CONFIG.getUnicode(val, ph);
    if(ret){
      this.addBtn(ret);
    }
  },
  addBtn: function(conf){
    if(conf && !this.preventVariableConfusion(conf, this.CFG.tabConfig)){
      var content = this.getContent();
      content.addBtn(conf);
      content.rebuild();
    }
  },
  buildComboHash: function(arr, defaultText){//Build using the hash keys.
    defaultText = defaultText || '';
    var sel = H.Element('select');
      sel.appendChild(H.Element('option', {value: defaultText}));
    for (var k in arr){
      sel.appendChild(H.Element('option', {
        value: k
      }, arr[k].title || k));
    }
    return sel;
  },
  buildComboArr: function(arr, defaultText){//Build a selector using an array.
    var sel = H.Element('select');
    if(defaultText){
      sel.appendChild(H.Element('option', {value: defaultText}), defaultText);
    }
    for (var k in arr){
      sel.appendChild(H.Element('option', {
        value: arr[k]
      }, arr[k]));
    }
      
    return sel;
  },
  buildComboOps: function(info){//For configuration of button tabs
    var sel = H.Element('select');
    var ph  = this.CFG.placeHold;
    for (var k in info){
      var ret = CONFIG.getUnicode(k, ph);
      sel.appendChild(H.Element('option', {
        value: k
      }, ret.text));
    };
    return sel;
  },
  /**
   *  This is all hacks to prevent a user form entering x & \times on the same buttons UI and
   *  confusing people since they look so similar... this seems like a bad idea but management
   *  has spoken.
   *  TODO: Delete this preventive code 
   */
  isVariableRestricted: function(btn){ //Determine if we want to prevent 2 of these in the same eq
      for(var i=0; i< CONFIG.RestrictVariableButtons.length; ++i){
        var key = CONFIG.RestrictVariableButtons[i];    
        if(btn == key || btn.key == key){
            return true;
        }
      }
  },
  /**
   *  Check the complete tab structure for existing duplicates on the restricted list, prevent
   *  them if they are both found
   */
  alreadyHasRestricted: function(tabsCfg){
    var order = tabsCfg.Order || [];
    for(var i=0; i < order.length; ++i){ //Go through all the tabs
      var tab = tabsCfg[order[i]];
      if(tab && tab.rows){
        for(var k=0; k < tab.rows.length; ++k){ //Go through all the rows
          var row = tab.rows[k];
          for(var j in row.items){
            var item = row.items[j]; //Check each item
            if(typeof item != 'function'){
              if(this.isVariableRestricted(item)){
                return true;
              }
            }
          }
        }
      }
    }
  },
  /**
   * If you want to prevent duplicate buttons, simply provide a handler on the MathJax.Editor.Config
   * level that returns false.  The duplicate config will be passed into this handler.
   */
  preventVariableConfusion: function(btnCfg, tabsCfg){
    if(CONFIG.RestrictVariableButtons && tabsCfg){
      if(this.isVariableRestricted(btnCfg) && this.alreadyHasRestricted(tabsCfg)){   
        if(typeof CONFIG.duplicateHandler == 'function'){
          return CONFIG.duplicateHandler(btnCfg);
        }
      }
    }
  }
});
})(MathJax.Hub, MathJax.Ajax, MathJax.Editor.Config);
