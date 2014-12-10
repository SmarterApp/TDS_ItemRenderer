/** **************************************************************************
* @class Range
* @superclass none
* @param none
* @return - an instance of Range
*
*****************************************************************************
*/
SimParser.Range = function() {

    // Inherit instance variables
    SimParser.ParserItem.call(this);
    
    // class variables
    var name;
    var type;
    
    // setters and getters
    this.getName = function () {
        return name;
    }
    this.setName = function (newName) {
        name = newName;
    }

    this.getType = function () {
        return type;
    }
    this.setType = function (newType) {
        type = newType;
    }

    SimParser.Range.prototype.setAttributes = function (attr) {
        if (attr.name !== undefined) {
            this.setName(attr.name);
        }
        if (attr.type !== undefined) {
            this.setType(attr.type);
        }
    }

}

SimParser.Range.prototype = new SimParser.ParserItem();
SimParser.Range.prototype.constructor = SimParser.Range;