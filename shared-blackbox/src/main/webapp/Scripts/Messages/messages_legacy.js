(function() {

    function getDisplayMessage(translation)
    {
        if (translation == null) return '';

        // get message to show client
        var clientMessage = translation.getClientMessage();

        // check if valid message
        if (YAHOO.lang.isString(clientMessage)) {
            return clientMessage;
        } else {
            // return default
            return translation.getParentMessage().getDefaultMessage();
        }
    }

    // C# style string replacement that requires array params
    function format(text, params) {
        
        if (params == null) return text;

        for (var i = 0, l = params.length; i < l; ++i) {
            var reg = new RegExp("\\{" + i + "\\}", "g");
            text = text.replace(reg, params[i]);
        }

        return text;
    }

    function get(defaultMessage, params) {
        
        var translation = null;
        
        if (TDS.messages != null) {
            translation = TDS.messages.findTranslation(defaultMessage);
        }
        
        if (translation == null) {
            return defaultMessage;
        }
        
        var text = getDisplayMessage(translation);
        if (params) {
            text = format(text, params);
        }
        
        return text;
    }

    // get a i18n message and provide an alternative in case the key does not exist
    function getAlt(key, alt) {
        var message = get(key);
        if (message == key && YAHOO.lang.isString(alt)) {
            return alt;
        } else {
            return message;
        }
    }
    
    function has(key) {
        return (key != get(key));
    }

    var regex = /\#(\S+)\#/g;

    // Parse a i18n template (e.x, "Replace this #Label# text!")
    function parse(text) {
        return text.replace(regex, function(match, key) {
            return getAlt(key, match);
        });
    }
    
    window.Messages = {        
        get: get,
        getAlt: getAlt,
        has: has,
        parse: parse,
        format: format
    };

})();

// set an elements content replacement as TEXT or HTML
Messages.setContent = function (node, key) {
    node.setAttribute('i18n-content', key);
    Util.Dom.setTextContent(node, Messages.get(key));
};
Messages.setHTMLContent = function (node, key) {
    node.setAttribute('i18n-content', key);
    node.innerHTML = Messages.get(key);
};

(function() {

    //private function
    function getDisplayMessage(translation, params) {
        
        if (translation == null) {
            return '';
        }

        var clientMessage = translation.getClientMessage();
        var messageID = translation.getParentMessage().getMessageId();

        if (clientMessage != null && clientMessage.length > 0) {
            if (params) {
                clientMessage = Messages.format(clientMessage, params);
            }
            return clientMessage + ' [Message Code: ' + messageID + ']';
        } else {
            var defaultMessage = translation.getParentMessage().getDefaultMessage();
            return defaultMessage + ' [Message Code: ' + messageID + ']';
        }
    }

    //ErrorCodes needs to return the code from the database as well.
    //ErrorCodes.get returns message code whereas Messages.get does not.
    function get(defaultMessage, params) {
        
        var translation = null;
        if (TDS.messages != null) {
            translation = TDS.messages.findTranslation(defaultMessage);
        }
        
        if (translation == null) {
            return defaultMessage;
        } else {
            return getDisplayMessage(translation, params);
        }
    }

    // get a i18n message and provide an alternative in case the key does not exist
    function getAlt(key, alt) {
        var message = get(key);
        if (message == key && alt) {
            return alt;
        } else {
            return message;
        }
    }

    window.ErrorCodes = {        
        get: get,
        getAlt: getAlt
    };

})();


