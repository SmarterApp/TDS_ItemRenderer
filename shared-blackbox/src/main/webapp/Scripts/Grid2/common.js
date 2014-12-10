var Lang = YAHOO.util.Lang;

var ErrorHandler =
{
    report: function(name, ex)
    {
        if (typeof console != 'object') return;
        console.error(name + ' ' + ex.name + ': ' + ex.message + ' - ' + ex.fileName + ' (line ' + ex.lineNumber + ')');
    },

    wrapFunction: function(context, name)
    {
        var fn = context[name];

        if (YAHOO.lang.isObject(context) && YAHOO.lang.isFunction(fn))
        {
            context[name] = function()
            {
                try
                {
                    return fn.apply(context, arguments);
                }
                catch (ex)
                {
                    ErrorHandler.report(name, ex);
                    throw ex;
                }
            };
        }
    },

    wrapFunctions: function(context, names)
    {
        if (YAHOO.lang.isArray(names))
        {
            for (var i = 0; i < names.length; i++)
            {
                ErrorHandler.wrapFunction(context, names[i]);
            }
        }
    }
};

// lazy events helper
var EventLazyProvider = function() {};

EventLazyProvider.prototype =
{
	_scope: null,
	
	setScope: function(obj) { this._scope = obj; },
	
	fireLazy: function(name, obj)
	{
		if (!this.hasEvent(name))
		{
			if (this._scope) this.createEvent(name, { scope: this._scope });
			else this.createEvent(name);
		}
		
		return this.fireEvent(name, obj);		
	}
};

// NOTE: I am not sure why but a class has to be created like the one above for augmentProto to work here
YAHOO.lang.augmentProto(EventLazyProvider, YAHOO.util.EventProvider);

(function() {

    // get the console object
    var con;
    try {
        con = top.console;
    } catch (ex) {
        con = console;
    }

    // logging
    function Logger(prefix) {

        var enabled = true;

        this.enable = function() {
            enabled = true;
        };

        this.disable = function() {
            enabled = false;
        };

        function log(level, message, params) {
            if (!enabled) {
                return;
            }
            if (level == 'error') {
                level = 'warn';
            }
            if (!con || !con[level]) {
                return;
            }
            if (prefix) {
                message = prefix + message;
            }
            if (params) {
                message = YAHOO.lang.substitute(message, params);
            }
            try {
                con[level](message);
            } catch (ex) {
                // ignore errors from console
            }
        }

        this.debug = function (message, params) { log('debug', message, params); };
        this.info = function (message, params) { log('info', message, params); };
        this.warn = function (message, params) { log('warn', message, params); };
        this.error = function (message, params) { log('error', message, params); };
    };

    window.Logger = Logger;

})();

var logger = new Logger('GRID: ');
