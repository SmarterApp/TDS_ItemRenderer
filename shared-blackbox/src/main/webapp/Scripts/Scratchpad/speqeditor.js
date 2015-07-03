//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿//var EqWindow = {
//    id: 0,
//    wnd: null,
//    equation: null
//};

/*
Documentation Pending


*/
var SPEquations = {
    _store : [],
    _storeHash : [],
    _activeWndId : '',
    _widgetList : [],
    cfg : { //configuration object
        width: '500px',
        height: '331px',
        label: 'Equation Editor'
    },
    init: function(wndId, equation) {
        wndId = 'Eq_Equation_' + wndId;
        var wnd = this._store[this._storeHash.indexOf(wndId)];
        if (!wnd) {
            //create DOM
            var dom = this._createDOM(wndId);

            //yuiDialog
            wnd = new YAHOO.widget.Dialog(wndId, {
                visible: true,
                draggable: false,
                modal: true,
                close: false,
                fixedcenter: true,
                width: this.cfg.width,
                height: this.cfg.height,
                zIndex: 1,
                postmethod: 'none'
            });

            // BUTTONS (get the scope right, include all the crazy css)
            var buttons = [
                { text: Messages.get('Cancel'), handler: { fn: this.close, scope: this } },
                { text: Messages.get('Submit and Close'), handler: { fn: this.submit, scope: this }, isDefault: true }
            ];
            wnd.cfg.queueProperty('buttons', buttons);

            //set header
            wnd.setHeader(this.cfg.label);

            //apply css
            this._applyCSS(wnd);

            //update wnd collection
            this._storeHash.push(wndId);
            this._store.push(wnd);            
        }

        //mark current active dialog
        this._activeWndId = wndId;

        //add equation widget to window
        var widget = this._createEquation(wndId, equation);
        this._widgetList.push(widget);

        return this;
    },

    _createDOM: function(wndId) {
        //create container
        //add form element
        var dom = document.getElementById(wndId);
        if (!dom) {
            dom = document.createElement('form');
            dom.id = wndId;
            dom.className += 'notes_dialog_form notes_dialog_form_equation';
            document.body.appendChild(dom);
        }
        //editor container
        var cId = 'note_container_' + wndId;
        var c = document.getElementById(cId);
        if (!c) {
            c = document.createElement('div');
            c.className = 'notes_dialog_container';
            c.id = cId;
            dom.appendChild(c);
        }
        return dom;
    },
    _createEquation: function (wndId, equation) {
        var widget = this._widgetList[this._storeHash.indexOf(wndId)];

        if (!widget) {
            //add default equationWidget
            widget = new MathJax.Editor.Widget({
                containerId: 'note_container_' + wndId,
                RestrictKeysToContent: true,
                tabs: true,
                tabConfig: {
                    Order: ['Algebra', 'Basic']
                }
            });
        }

        if (typeof equation.properties.data === "object") {
            //update mathml if widget exists in store        
            //if (typeof equation.properties.data.mathML === "object") {
            //    widget.updateEditors([equation.properties.data.mathML]);
                
            //} else {
                widget.updateEditors(equation.properties.data.mathML);
            //}            
        }
        return widget;
    },
    _applyCSS: function(wnd) {

        //apply styles
        YAHOO.util.Dom.addClass(wnd.element, 'TDS_Notes_dialog');
        YAHOO.util.Dom.addClass(wnd.innerElement, 'comment');
        YAHOO.util.Dom.addClass(wnd.header, 'comment-header');
        YAHOO.util.Dom.addClass(wnd.body, 'comment-body');
        YAHOO.util.Dom.addClass(wnd.form, 'comment-form');
    },

    show: function() {
        var wnd = this._store[this._storeHash.indexOf(this._activeWndId)];
        if (wnd) {
            //add elements to the dom
            wnd.render(document.body);
            wnd.show();
        }
    },

    preSave: function () { return true; },
    submit: function () {        
        var widget = this._widgetList[this._storeHash.indexOf(this._activeWndId)];
        var wnd = this._store[this._storeHash.indexOf(this._activeWndId)];

        var args = {
            id: this._activeWndId,
            data: {
                type: 'Equation',
                comment: widget.serializeSettings()
            }//,
            //cb: this.saveCb.bind(this)
        };

        this.preSave(args, wnd);

        this._remove();
    },

    preClose: function() { return true; },
    close: function() {        
        this.preClose();

        this._remove();
    },

    _remove: function() {
        //reset editor content
        var wnd = this._store[this._storeHash.indexOf(this._activeWndId)];
        var wdget = this._widgetList[this._storeHash.indexOf(this._activeWndId)];

        if (wnd) {
            //clear widget editors
            wdget.clearAll();

            //hide wnd
            wnd.hide();
        }
    }
};
