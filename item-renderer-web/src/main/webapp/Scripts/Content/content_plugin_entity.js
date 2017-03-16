//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Entity Plugin
*/

(function(CM) {

    // Entity plugin is a general plugin for passage and items.
    function EntityPlugin(page, entity, config) {
        Util.Assert.isInstanceOf(ContentPage, page);
        Util.Assert.isInstanceOf(ContentEntity, entity);
        Util.Event.Emitter(this);
        this.page = page;
        this.entity = entity;
        this.config = config;
        this.init(config);
    }

    // manager calls this to get all the resources loaders for this widget
    EntityPlugin.prototype.getResources = function () {
        return [];
    }

    // get all the components for this response
    EntityPlugin.prototype.getComponents = function () {
        return [];
    }

    // Return true when the widget is rendered and ready to show to the student.
    /*
    EntityPlugin.prototype.isReady = function () {
        return false;
    }
    */

    // This is called when the widget is first created. 
    EntityPlugin.prototype.init = function () {
        
    }

    // This is called when the entity is ready to render.
    EntityPlugin.prototype.load = function (el) {
        // TODO: throw error here
    }

    // called when the widget is shown
    EntityPlugin.prototype.show = function () {

    }

    // called when the widget is hidden
    EntityPlugin.prototype.hide = function () {

    }

    EntityPlugin.prototype.focus = function () {

    }

    EntityPlugin.prototype.blur = function () {

    }

    // called when zooming occurs on the page
    EntityPlugin.prototype.zoom = function (level) {

    }

    // what about component?
    EntityPlugin.prototype.keyEvent = function (ev) {

    }

    EntityPlugin.prototype.showMenu = function (menu, evt) {

    }

    EntityPlugin.prototype.dispose = function () {

    }
    
    CM.EntityPlugin = EntityPlugin;
    
})(ContentManager);
