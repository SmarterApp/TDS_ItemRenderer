/** **************************************************************************
* @class SimItem
* @superclass none
* @param sim - Instance of Simulator
* @return SimItem instance
* Creates a new SimItem base class.
* Note: SimItem is an abstract class
*****************************************************************************
*/
Simulator.SimItem = function(sim) {
    var source = 'SimItem';
    var eName = 'SimItem';
    var simId = null;
    var IDNum = -1;

    var dbg = function() {return sim.getDebug();};
    var simDocument = function() { return sim.getSimDocument(); };

    if(sim) {
        //every Simulator.Simulator instance must have a unique Id associated with it 
        //and this id will be added to all elements created inside this simulator scope.
        simId = sim.getSimID();
    }

   
    this.getEname = function() {
        return eName;
    };

    this.setEname = function(newEname) {
        eName = newEname;
        return this;
    };

    this.createItemID = function (reset, itemNum, aName) {
        var name = (!aName) ? this.getName() : aName;
        if (itemNum != null) {
            if (itemNum > -1) return name + 'Item' + simId + itemNum;   // if itemNum is not null and is > -1, IDNum is not affected
            else {   // if itemNum == -1 then we are setting the id for an element
                IDNum++;
                return name + 'Element' + simId + IDNum;
            }
        }
        else {
            if (reset) IDNum = -1;
            ++IDNum;
            return name + 'Item' + simId + IDNum;
        }
    };

    this.getNodeID = function () {
        return nodeID;
    };

    this.inspect = function(embedded, force) {
        var buff = [];
        var sep = '\n';
        buff.push('Inspecting ' + source + sep);
        for ( var i in this) {
            if (i == 'items') {
                buff.push(this.parent.inspect());
            } else {
                if (i.substr(0, 3) == 'get') {
                    buff.push(i.charAt(3).toLowerCase() + i.slice(4));
                    buff.push(' = ');
                    buff.push(eval('this.' + i + '()'));
                    buff.push(sep);
                }
            }
        }
        buff.push('End Inspecting ' + source + sep + sep);
        if(!embedded) force == true ? dbg().debugf(source, buff.join('')) : dbg().debug(source, buff.join(''));
        else return buff.join('');
    };
    
    this.setAttributes = function (attr) {
      for (var i in attr) {
            switch (i) {
                case 'eName':
                    this.setEname(attr[i]);
                    break;
            }
        }
    };
    
};
