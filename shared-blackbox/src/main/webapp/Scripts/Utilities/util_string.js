// IDEAS:
// * https://github.com/devongovett/slang/blob/master/slang.js
Util.String = function() { };

// check if two strings are the same
Util.String.equals = function (str1, str2, options) {

    // trim, ignoreCase, useLocale
    options = options || {};

    // check if string
    if (typeof str1 != 'string' ||
        typeof str2 != 'string') {
        return false;
    }

    // check if trimming
    if (options.trim) {
        str1 = str1.trim();
        str2 = str2.trim();
    }

    // check if ignore case
    if (options.ignoreCase) {
        if (options.useLocale) {
            str1 = str1.toLocaleLowerCase();
            str2 = str2.toLocaleLowerCase();
        } else {
            str1 = str1.toLowerCase();
            str2 = str2.toLowerCase();
        }
    }

    // compare 
    return (str1 === str2);
};

Util.String.startsWith = function(str, prefix)
{
    return (str && str.indexOf(prefix) === 0);
};

Util.String.endsWith = function(str, suffix)
{
    return (str && str.match(suffix+"$") == suffix);
};

// check if one string contains another
// http://designpepper.com/blog/drips/determining-if-a-string-contains-another-string-in-javascript-three-approaches
Util.String.contains = function(str, search) {
    return (str && search && 
            str.indexOf(search) !== -1);
};

// check if this string has an http url
Util.String.isHttpProtocol = function(str)
{
    return (Util.String.startsWith(str, 'http:') || 
            Util.String.startsWith(str, 'https:'));
};

// C# style string formatter
// TODO: Review this https://github.com/prettycode/String.prototype.format.js/blob/master/String.prototype.format.js
Util.String.format = function()
{
    var str = arguments[0];

    for (var i = 0; i < arguments.length - 1; i++)
    {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        str = str.replace(reg, arguments[i + 1]);
    }

    return str;
};

// Get a RFC4122 v4 UUID
Util.String.getUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Indicates whether the specified string is null or an empty string.
Util.String.isNullOrEmpty = function(str) {
    
    // check if null
    if (str == null) {
        return true;
    }
    
    // if a string was not passed in then technically it is empty
    if (!YAHOO.lang.isString(str)) {
        return true;
    }
    
    // check string length
    return (str.length === 0);
};

// Indicates whether the specific string is null, empty, or consists only of white-space characters.
Util.String.isNullOrWhiteSpace = function(str) {
    
    // check if empty
    if (Util.String.isNullOrEmpty(str)) {
        return true;
    }

    // trim and check string length
    str = YAHOO.lang.trim(str);
    return (str.length === 0);
};

// Capitialize the first letter
Util.String.capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

Util.String._HASHCODE_MAX = 0x100000000;

// string hash function similar to java.lang.String.hashCode().
Util.String.hashCode = function(str)
{
    var hash = 0, len = str.length;
    
    for (var i = 0; i < len; ++i)
    {
        hash = hash * 31 + str.charCodeAt(i);
        // Normalize to 4 byte range, 0 ... 2^32.
        hash %= Util.String._HASHCODE_MAX;
    }
    
    return hash;
};

/* Class for combining string hashes  */
Util.HashCombiner = function()
{
    this._hash = 17;
};

Util.HashCombiner.prototype.get = function() { return this._hash; };

Util.HashCombiner.prototype.add = function(str)
{
    this._hash = this._hash * 31 + Util.String.hashCode(str.toString());
    this._hash %= Util.String._HASHCODE_MAX;
};

// check if a string starts with 
// TODO: Remove this code and use Util.String.startsWith()
if (!String.prototype.startsWith)
{
    String.prototype.startsWith = function(s) { return this.indexOf(s) === 0; };
}

// C# style string formatter
/*
String.prototype.format = function()
{
var str = arguments[0];

for (var i = 0; i < arguments.length - 1; i++)
{
var reg = new RegExp("\\{" + i + "\\}", "gm");
str = str.replace(reg, arguments[i + 1]);
}

return str;
};
*/

/*******************************************************************************/

// C# style StringBuilder
(function(Util) {

    var NEW_LINE = '\n';

    function SB(value) {
        this._arr = [];
        if (value) {
            this.append(value);
        }
    }

    SB.prototype.append = function (value) {
        this._arr.push(value);
    }

    SB.prototype.appendLine = function (value) {
        if (value) {
            this.append(value);
        }
        this.append(NEW_LINE);
    }

    SB.prototype.appendFormat = function (/*str, args...*/) {
        var str = Util.String.format.apply(this, arguments);
        this.append(str);
    }

    SB.prototype.appendSub = function(str, obj) {
        str = YAHOO.lang.substitute(str, obj);
        this.append(str);
    }

    SB.prototype.toString = function (separator) {
        separator = separator || '';
        return this._arr.join(separator);
    }

    Util.StringBuilder = SB;

})(Util);


