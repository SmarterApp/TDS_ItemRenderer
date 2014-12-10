(function(CM, CI) {
    
    var DataType = {
        Unknown: 'unknown',
        String: 'string',
        Array: 'array',
        Xml: 'xml'
    }

    CM.DataType = DataType;

    // A struct for representing a widget response.
    // NOTE: Assigning func to 'var' so toString() works.
    var Response = function(id, value, valid, selected) {

        Util.Assert.isString(id);
        Util.Assert.isNotUndefined(value);
        Util.Assert.isBoolean(valid);

        // set defaults
        var created = new Date();
        selected = (typeof selected == 'boolean') ? selected : valid;

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

    Response.parseDataType = function(value) {
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
            return Response.parseDataType(this.value);
        }
    });

    Response.prototype.toString = function (delimiter) {
        var type = dataType;
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
    
    CM.Response = Response;

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

        // create a Response object
        var valid = responses.every(function(response) {
            return response.valid;
        });

        var selected = responses.every(function (response) {
            return response.selected;
        });

        return new CM.Response(this.getID(), value, valid, selected);
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

