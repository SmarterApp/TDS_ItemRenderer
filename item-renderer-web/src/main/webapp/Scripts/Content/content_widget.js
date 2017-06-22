//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Item Widget
*/

(function(CM) {

    // The config is returned when a widget match if found. 
    function WidgetConfig(id /*String*/, element /*HTMLElement*/, data /*any (optional)*/) {
        Util.Assert.isInstanceOf(WidgetConfig, this, 'WidgetConfig is a class.');
        Util.Assert.isString(id, 'WidgetConfig requires string id.');
        Util.Assert.isElement(element, 'WidgetConfig requires HTMLElement.');
        this.id = id; // string
        this.element = element; // HTMLElement
        this.data = data; // object (optional))
    }

    CM.WidgetConfig = WidgetConfig;

    // default properties on the widget
    var DefaultProps = {
        // the expected data type of the response
        dataType: CM.DataType.String
    };

    // default options for the widget
    var DefaultOptions = {
        // call setResponse() with previous response value when item is loaded
        autoLoad: false,
    };

    // Item widget is for a specific interaction (e.x., MC)
    function ItemWidget(page /*ContentPage*/, item /*ContentItem*/, config /*WidgetConfig*/) {

        // check params
        Util.Assert.isInstanceOf(ContentPage, page);
        Util.Assert.isInstanceOf(ContentItem, item);
        Util.Assert.isInstanceOf(WidgetConfig, config);

        // set property values
        this.id = config.id;
        this.element = config.element;

        // set default properties
        YAHOO.lang.augmentObject(this, DefaultProps);

        // set default options
        if (!this.options) {
            this.options = {};
        }
        YAHOO.lang.augmentObject(this.options, DefaultOptions);

        ItemWidget.superclass.constructor.call(this, page, item, config.data);
    }

    YAHOO.lang.extend(ItemWidget, CM.EntityPlugin);

    // A helper function for creating a response object.
    ItemWidget.prototype.createResponse = function(value, valid, empty, selected) {
        return CM.createResponse(this.id, value, valid, empty, selected);
    };

    // Is the response available to read.
    // If the item is not loaded then this should return false.
    ItemWidget.prototype.isResponseAvailable = function() {
        // NOTE: For legacy reasons this is true. But it really should be false by default.
        return true;
    };

    // Call this to get the response for the widget.
    ItemWidget.prototype.getResponse = function () {
        return null;
    };

    // Call this to set the response on the widget. 
    ItemWidget.prototype.setResponse = function (value) {
        return false;
    };

    CM.ItemWidget = ItemWidget;

})(ContentManager);