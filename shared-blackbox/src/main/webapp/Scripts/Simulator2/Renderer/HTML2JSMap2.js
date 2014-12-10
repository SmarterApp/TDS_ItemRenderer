/** **************************************************************************
* @class HTML2JSMap
* @superclass none
* @param sim - Instance of Simulator
* @return HTML2JSMap instance
* Maintains a map of JavaScript objects indexed by their associated HTML element
*****************************************************************************
*/
Simulator.HTML2JSMap = function(sim) {
    var source = 'HTML2JSMap';
    var map = [];

    var dbg = function() {return sim.getDebug();};   

    this.inspect = function(embedded, force) {
        var buff = [];
        var sep = '\n';
        buff.push('Inspecting ' + source + sep);
        for ( var i in map) {
            buff.push(i + ' = ' + map[i].getName() + ' ' + map[i].getEname() + sep);
        }
        buff.push('End Inspecting ' + source + sep + sep);
        if(!embedded) force == true ? debugf(buff.join('')) : debug(buff.join(''));
        else return buff.join('');
    };
    
    
    this.mapJSFromHTML = function(jsObject, htmlElement) {
        if(!jsObject || !htmlElement) dbg().logError(source, 'jsOject or htmlElement is null. Cannot map JSFromHTML');
        else {
            map[htmlElement.id] = jsObject;
        }
    };
    
    this.getJSFromHTML = function(htmlElement) {
      return map[htmlElement.id];
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
    
};