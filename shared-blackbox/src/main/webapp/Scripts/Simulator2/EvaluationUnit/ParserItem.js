/** **************************************************************************
* @class ParserItem
* @superclass none
* @param none
* @return ParserItem instance
* Creates a new ParserItem base class.
*****************************************************************************
*/
SimParser.ParserItem = function(parser) {
	var eName = 'ParserItem';
   
    // Privileged accessor for 'eName'
    this.getEname = function() {
        return eName;
    };

    //Privileged mutator for 'eName'
    this.setEname = function(newEname) {
    	eName = newEname;
        return this;
    };

    SimParser.ParserItem.prototype.setAttributes = function (attr, node) {
        for (var i in attr) {
            switch (i) {
                case 'eName':
                    this.setEname(attr[i]);
                    break;
            }
        }
    }
    
};
