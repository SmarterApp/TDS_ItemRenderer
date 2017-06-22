//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Page Plugin
*/

(function(CM) {

    function PagePlugin(page, config) {
        Util.Assert.isInstanceOf(ContentPage, page);
        Util.Event.Emitter(this);
        this.page = page;
        this.config = config;

        // set default values for missing properties
        YAHOO.lang.augmentObject(this, {

            // wait to call load() until page is actually "loaded"
            delay: false,

        });

        this.init(config);
    }

    PagePlugin.prototype.getName = function() {
        return 'default';
    };

    // manager calls this to get all the resources loaders for this widget
    PagePlugin.prototype.getResources = function() {
        return [];
    };

    // This is called when the widget is first created. 
    PagePlugin.prototype.init = function(config) {

    };

    // This is called when the page is first available
    PagePlugin.prototype.load = function () {

    };

    // called before the page is shown
    PagePlugin.prototype.beforeShow = function() {

    };

    // called when the page is shown
    PagePlugin.prototype.show = function() {

    };

    // called before the page is hidden
    PagePlugin.prototype.beforeHide = function() {

    };

    // called when the page is hidden
    PagePlugin.prototype.hide = function() {

    };

    // called when zooming occurs on the page
    PagePlugin.prototype.zoom = function(level) {

    };

    PagePlugin.prototype.dispose = function () {

    };

    // Use this to override how we show items when showing a page. 
    PagePlugin.prototype.getEntitiesToShow = function () {
        // return array of entities if you implemented this yourself
        return undefined;
    }

    // Use this to override which entity becomes active when showing a page.
    PagePlugin.prototype.getEntityForFocus = function () {
        // return the entity to make active
        return null;
    }

    PagePlugin.prototype.getString = function() {
        return 'PLUGIN [' + this.getName() + ']';
    }

    CM.PagePlugin = PagePlugin;

})(ContentManager);