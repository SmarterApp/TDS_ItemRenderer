/** **************************************************************************
* @class String
* @superclass Object
* @param none
* @return none
* Extends String class and adds three prototype functions.  
*****************************************************************************
*/

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
};

String.prototype.ltrim = function() {
    return this.replace(/^\s+/,'');
};

String.prototype.rtrim = function() {
    return this.replace(/\s+$/,'');
};