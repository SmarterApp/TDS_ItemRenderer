//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/* Querystring */
// TODO: http://medialize.github.com/URI.js/

Util.QueryString = {};

// reload the current page with new querystring
Util.QueryString.reload = function(obj)
{
    var currentUrl = window.location.href;
    var currentQS = window.location.search;
    var newQS = '?' + Util.QueryString.stringify(obj);

    if (currentQS.length > 0)
    {
        currentUrl = currentUrl.replace(currentQS, newQS);
    }
    else
    {
        currentUrl = currentUrl + newQS;
    }

    window.location = currentUrl;
};

// YUI3 querystring modules:

(function()
{
    /**
    * Provides Y.QueryString.stringify method for converting objects to Query Strings.
    *
    * @module querystring
    * @submodule querystring-stringify
    * @for QueryString
    * @static
    */

    var QueryString = {},
        stack = [],
        L = YAHOO.lang;

    /**
    * Provides Y.QueryString.escape method to be able to override default encoding
    * method.  This is important in cases where non-standard delimiters are used, if
    * the delimiters would not normally be handled properly by the builtin
    * (en|de)codeURIComponent functions.
    * Default: encodeURIComponent
    * @module querystring
    * @submodule querystring-stringify
    * @for QueryString
    * @static
    **/
    QueryString.escape = encodeURIComponent;

    /**
    * <p>Converts an arbitrary value to a Query String representation.</p>
    *
    * <p>Objects with cyclical references will trigger an exception.</p>
    *
    * @method stringify
    * @public
    * @param obj {Variant} any arbitrary value to convert to query string
    * @param cfg {Object} (optional) Configuration object.  The three
    * supported configurations are:
    * <ul><li>sep: When defined, the value will be used as the key-value
    * separator.  The default value is "&".</li>
    * <li>eq: When defined, the value will be used to join the key to
    * the value.  The default value is "=".</li>
    * <li>arrayKey: When set to true, the key of an array will have the
    * '[]' notation appended to the key.  The default value is false.
    * </li></ul>
    * @param name {String} (optional) Name of the current key, for handling children recursively.
    * @static
    */
    QueryString.stringify = function(obj, c, name)
    {
        var begin, end, i, l, n, s,
            sep = c && c.sep ? c.sep : "&",
            eq = c && c.eq ? c.eq : "=",
            aK = c && c.arrayKey ? c.arrayKey : false;

        if (L.isNull(obj) || L.isUndefined(obj) || L.isFunction(obj))
        {
            return name ? QueryString.escape(name) + eq : '';
        }

        if (L.isBoolean(obj) || Object.prototype.toString.call(obj) === '[object Boolean]')
        {
            // obj = +obj; // BUG: Converts boolean into integer
            obj = obj.toString(); // FIX: Convert boolean to string ('true'/'false')
        }

        if (L.isNumber(obj) || L.isString(obj))
        {
            return QueryString.escape(name) + eq + QueryString.escape(obj);
        }

        if (L.isArray(obj))
        {
            s = [];
            name = aK ? name + '[]' : name;
            l = obj.length;
            for (i = 0; i < l; i++)
            {
                s.push(QueryString.stringify(obj[i], c, name));
            }

            return s.join(sep);
        }

        // Check for cyclical references in nested objects
        for (i = stack.length - 1; i >= 0; --i)
        {
            if (stack[i] === obj)
            {
                throw new Error("QueryString.stringify. Cyclical reference");
            }
        }

        stack.push(obj);
        s = [];
        begin = name ? name + '[' : '';
        end = name ? ']' : '';
        for (i in obj)
        {
            if (obj.hasOwnProperty(i))
            {
                n = begin + i + end;
                s.push(QueryString.stringify(obj[i], c, n));
            }
        }

        stack.pop();
        s = s.join(sep);
        if (!s && name)
        {
            return name + "=";
        }

        return s;
    };

    // Parse a key=val string.
    // These can get pretty hairy
    // example flow:
    // parse(foo[bar][][bla]=baz)
    // return parse(foo[bar][][bla],"baz")
    // return parse(foo[bar][], {bla : "baz"})
    // return parse(foo[bar], [{bla:"baz"}])
    // return parse(foo, {bar:[{bla:"baz"}]})
    // return {foo:{bar:[{bla:"baz"}]}}
    var pieceParser = function(eq)
    {
        return function parsePiece(key, val)
        {

            var sliced, numVal, head, tail, ret;

            if (arguments.length !== 2)
            {
                // key=val, called from the map/reduce
                key = key.split(eq);
                return parsePiece(
                    QueryString.unescape(key.shift()),
                    QueryString.unescape(key.join(eq))
                );
            }
            key = key.replace(/^\s+|\s+$/g, '');
            if (L.isString(val))
            {
                val = val.replace(/^\s+|\s+$/g, '');
                // convert numerals to numbers
                if (!isNaN(val))
                {
                    numVal = +val;
                    if (val === numVal.toString(10))
                    {
                        val = numVal;
                    }
                }
            }
            sliced = /(.*)\[([^\]]*)\]$/.exec(key);
            if (!sliced)
            {
                ret = {};
                if (key)
                {
                    ret[key] = val;
                }
                return ret;
            }
            // ["foo[][bar][][baz]", "foo[][bar][]", "baz"]
            tail = sliced[2];
            head = sliced[1];

            // array: key[]=val
            if (!tail)
            {
                return parsePiece(head, [val]);
            }

            // obj: key[subkey]=val
            ret = {};
            ret[tail] = val;
            return parsePiece(head, ret);
        };
    };

    // the reducer function that merges each query piece together into one set of params
    var mergeParams = function(params, addition)
    {
        return (
        // if it's uncontested, then just return the addition.
            (!params) ? addition
        // if the existing value is an array, then concat it.
            : (L.isArray(params)) ? params.concat(addition)
        // if the existing value is not an array, and either are not objects, arrayify it.
            : (!L.isObject(params) || !L.isObject(addition)) ? [params].concat(addition)
        // else merge them as objects, which is a little more complex
            : mergeObjects(params, addition)
        );
    };

    // Merge two *objects* together. If this is called, we've already ruled
    // out the simple cases, and need to do the for-in business.
    var mergeObjects = function(params, addition)
    {
        for (var i in addition)
        {
            if (i && addition.hasOwnProperty(i))
            {
                params[i] = mergeParams(params[i], addition[i]);
            }
        }
        return params;
    };

    /**
    * Provides Y.QueryString.parse method to accept Query Strings and return native
    * JavaScript objects.
    *
    * @module querystring
    * @submodule querystring-parse
    * @for QueryString
    * @method parse
    * @param qs {String} Querystring to be parsed into an object.
    * @param sep {String} (optional) Character that should join param k=v pairs together. Default: "&"
    * @param eq  {String} (optional) Character that should join keys to their values. Default: "="
    * @public
    * @static
    */
    QueryString.parse = function(qs, sep, eq)
    {
        if (qs == null) qs = window.location.search.substring(1);
        if (qs == null || qs.length == 0) return {};
        
        // wouldn't Y.Array(qs.split()).map(pieceParser(eq)).reduce(mergeParams) be prettier?
        return Util.Array.reduce(
            Util.Array.map(
                qs.split(sep || "&"),
                pieceParser(eq || "=")
            ),
            {},
            mergeParams
        );
    };

    /**
    * Provides Y.QueryString.unescape method to be able to override default decoding
    * method.  This is important in cases where non-standard delimiters are used, if
    * the delimiters would not normally be handled properly by the builtin
    * (en|de)codeURIComponent functions.
    * Default: replace "+" with " ", and then decodeURIComponent behavior.
    * @module querystring
    * @submodule querystring-parse
    * @for QueryString
    * @method unescape
    * @param s {String} String to be decoded.
    * @public
    * @static
    **/
    QueryString.unescape = function(s)
    {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    };

    Util.QueryString = QueryString;

})();
