/** **************************************************************************
* @class InlineData
* @superclass none
* @param none
* @return InlineData instance
* Creates a new InlineData class.
*****************************************************************************
*/
Simulator.Animation.InlineData = function (sim) {

    var source = 'InlineData';
    var id = '';
    var name = '';
    var data = '';
    var animationElementName = '';

    //#region private functions

    var util = function () { return sim.getUtils(); };
    var simDocument = function() { return sim.getSimDocument(); };
    var dbg = function () { return sim.getDebug(); }

    //#endregion

    //#region public  functions

    this.setID = function(newID) {
        id = newID;
    };
    
    this.getID = function() {
        return id;
    };

    this.setName = function(newName) {
        name = newName;
        return this;
    };
    
    this.getName = function() {
        return name;
    };
    
    this.setData = function(newData) {
        data = newData;
        return this;
    };
    
    this.getData = function() {
        return data;
    };
    
    this.setAnimationElement = function(newAnimationElementName) {
        animationElementName = newAnimationElementName;
    };
    
    this.getAnimationElementName = function() {
        return animationElementName;
    };
    
    this.getSourceName = function() {
        return source;
    };
    
    this.inspect = function(embedded, force) {
        var buff = [];
        var sep = '\n\n';
        buff.push('Inspecting InlineData element ' + this.getName());
        if (i.substr(0, 3) == 'get') {
          buff.push(i);
          buff.push(' = ');
          buff.push(eval('this.' + i + '()'));
          buff.push(sep);
        }
        buff.push('End of inlineData element inspection');
        buff.push(sep);
        if(embedded) return buff.join('');
        else force == null ? debug(buff.join('')) : debugf(buff.join(''));
    };

    //#endregion

    //#region prototype functions

    Simulator.Animation.InlineData.prototype.setAttributes = function (attr, node) {
        var attr = util().getAttributes(node);
        for (var i in attr) {
            switch (i) {
                case 'id':
                    this.setID(attr[i]);
                    break;
                case 'name':
                    this.setName(attr[i]);
                    break;
                case 'animationElement':
                    this.setAnimationElement(attr[i]);
                    break;
            }
        }
    };

    //#endregion

    //#region Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
    //#endregion 
}