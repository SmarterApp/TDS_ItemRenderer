//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function(CM, CI) {
    
    var DataType = {
        Unknown: 'unknown',
        String: 'string',
        Array: 'array',
        Xml: 'xml'
    }

    CM.DataType = DataType;

    // A struct for representing a widget response.
    // NOTE: Assigning func to 'var' so toString() works.
    var Response = function (id, value, valid, empty, selected) {
        
        // when was this response created
        var created = new Date();

        // define properties as read-only
        Object.defineProperties(this, {
            'id': {
                get: function () {
                    return id;
                }
            },
            'created': {
                get: function () {
                    return created;
                }
            },
            'value': {
                get: function () {
                    return value;
                }
            },
            'valid': {
                get: function () {
                    return valid;
                }
            },
            'selected': {
                get: function () {
                    return selected;
                }
            },
            'empty': {
                get: function () {
                    return empty;
                }
            }
        });

        // TODO: Remove these when possible...
        Object.defineProperties(this, {
            'isValid': {
                get: function () {
                    return valid;
                }
            },
            'isSelected': {
                get: function () {
                    return selected;
                }
            }
        });
    }

    function parseDataType(value) {
        if (typeof value === 'string') {
            return DataType.String;
        } else if ($.isArray(value)) {
            return DataType.Array;
        } else if ($.isXMLDoc(value)) {
            return DataType.Xml;
        }
        return DataType.Unknown;
    }

    Object.defineProperty(Response.prototype, 'dataType', {
        get: function () {
            return parseDataType(this.value);
        }
    });

    Response.prototype.toString = function(delimiter) {
        var type = this.dataType;
        if (this.value == null) {
            return '';
        } else if (type == DataType.String) {
            return this.value;
        } else if (type == DataType.Array) {
            return this.value.join(delimiter || ',');
        } else if (type == DataType.Xml) {
            return Util.Xml.serializeToString(this.value);
        } else {
            return JSON.stringify(this.value);
        }
    }

    CM.createResponse = function(id, value, valid, empty, selected) {

        Util.Assert.isString(id);
        Util.Assert.isNotUndefined(value);
        Util.Assert.isBoolean(valid);

        if (typeof empty != 'boolean') {
            if (value == null || value.length == 0) {
                // if the response is null or has no length then it is considered empty
                empty = true;
            } else {
                // if the response is not valid then for legacy reasons assume it is empty
                empty = !valid;
            }
        }

        if (typeof selected != 'boolean') {
            // if the response is valid or not empty then consider it selected
            selected = valid || !empty;
        }

        return new Response(id, value, valid, empty, selected);

    };

    /******************************************************************************************/

    // Response Container

    function Container() {
    }

    Container.prototype.validate = function() {
        
    }

    Container.prototype.load = function () {
        throw new Error('Container load not implemented.');
    }

    Container.prototype.create = function (responses) {
        throw new Error('Container create not implemented.');
    }

    var containerLookup = new Util.Structs.Map();
    var containerMap = new Util.Structs.Map();

    // Register an instance of a container. It will be used as a singleton. 
    CM.registerResponseContainer = function (name, cls) {
        YAHOO.lang.extend(cls, Container);
        containerLookup.set(name.toLowerCase(), cls);
    }

    CM.mapResponseContainer = function (format, name) {
        containerMap.set(format.toLowerCase(), name.toLowerCase());
    }

    CM.createResponseContainer = function (format) {
        var name = containerMap.get(format.toLowerCase());
        if (name) {
            var cls = containerLookup.get(name);
            var instance = new cls();
            cls.superclass.constructor.call(instance);
            return instance;
        }
        return null;
    }

    /******************************************************************************************/

    // If this is true the items response is available. 
    CI.prototype.isResponseAvailable = function () {
        // if there are no widget's then no response is considered available
        var widgets = this.widgets.getAll();
        if (!widgets.length) {
            return false;
        }
        // all widgets must have responses available before we consider the item response available
        return widgets.every(function(widget) {
            return widget.isResponseAvailable();
        });
    };

    // This will return the item response object. 
    CI.prototype.getResponse = function () {

        // check if the item's response is available
        if (!this.isResponseAvailable()) {
            return null;
        }

        // get responses
        var widgets = this.widgets.getAll();
        var responses = widgets.map(function (widget) {
            var response = widget.getResponse();
            // check if response object
            if (!(response instanceof Response)) {
                throw new Error('No response object returned from response \'' + response.id + '\'.');
            }
            // check if valid value data
            if (response.value != null && response.dataType != widget.dataType) {
                throw new Error('The response data type \'' + response.dataType + '\' does not match the widget data type \'' + widget.dataType + ' \'.');
            }
            return response;
        });

        // get the response container
        var container = CM.createResponseContainer(this.format);

        // if there is no container just return first response
        if (container == null) {
            return responses[0];
        }

        // create a single xml string out of all the responses
        var value = container.create(responses);

        // all widget responses need to be valid for the item response to be valid
        var valid = responses.every(function (response) {
            return response.valid;
        });

        // all widget responses need to be empty for the item response to be empty
        var empty = responses.every(function (response) {
            return response.empty;
        });

        // all widget responses need to be valid for the item response to be selected
        var selected = responses.every(function (response) {
            return response.selected;
        });

        // create response object
        return CM.createResponse(this.getID(), value, valid, empty, selected);
    };

    // set this items response, this will call into the widget
    CI.prototype.setResponse = function (value, autoLoad) {

        // get widgets
        var widgets = this.widgets.getAll();
        if (widgets.length == 0) {
            throw new Error('No item widgets found');
        }

        // if auto load is true then filter for widgets that support this
        if (autoLoad) {
            widgets = widgets.filter(function(widget) {
                return widget.options.autoLoad;
            });
            if (widgets.length == 0) {
                return false;
            }
        }

        // get the response container
        var container = CM.createResponseContainer(this.format);

        // if there is no container just set the value on the first widget
        if (container == null) {
            return widgets[0].setResponse(value);
        }

        // parse the xml and load it into each widget
        return container.load(value, widgets);
    };

    /******************************************************************************************/

})(ContentManager, ContentItem);

