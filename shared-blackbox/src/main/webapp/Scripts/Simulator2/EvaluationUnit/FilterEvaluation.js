/**
 * *****************************************************************************
 * @class FilterEvaluation 
 * @superclass none
 * @param none
 * @return - instance of FilterEvaluation
 * 
 *******************************************************************************
 */
SimParser.FilterEvaluation = function (eUnit) {

    // class variables
    var filters = 'max, min, average';
    var rs;
    var impVar = [];
    var evUnit = eUnit;
    var vMng = evUnit.getVariableManager();
    var fMng = evUnit.getFunctionManager();
    
    function getValues(fName) {
        var r = [];
        for (var i = 0; i < rs.length; i++) {
          r.push(rs[i].functions[fName]);
        }
        return r;
    }

    function getVarValues(vName) {
        var r = [];
        for (var i = 0; i < rs.length; i++) {
            r.push(rs[i].variables[vName]);
        }
        return r;
    }

    function max(fName) {
        var v = getValues(fName);
        var f = false;
        var vr = impVar;
        var maxValue = - Infinity;
        var maxIndex = undefined;
        for (var i=0; i<v.length; i++) {
            if (v[i] && (v[i] > maxValue)) {
                maxValue = v[i];
                maxIndex = vr[i];
                f = true;
            }
        }
        //return f ? [maxValue, maxIndex] : undefined;
        return f ? maxValue : undefined;
    }

    // apply 'min' filter
    function min(fName) {
        var v = getValues(fName);
        var vr = impVar;
        var minValue = Infinity;
        var minIndex = undefined;
        var f = false;
        for (var i=0; i<v.length; i++) {
            if (v[i] && (v[i] < minValue)) {
                minValue = v[i];
                minIndex = vr[i];
                f = true;
            }
        }
        //return f ? [minValue, minIndex] : undefined;
        return f ? minValue : undefined;
    }

    // apply 'average' filter
    function average(fName) {
        var v = getValues(fName);
        var totValue = 0;
        var avValue = 0.0;
        var f = false;
        for (var i=0; i<v.length; i++) {
            totValue = totValue + v[i];
        }
        if (v.length > 0) {
            avValue = totValue / v.length;
            f = true;
        }
        // return f ? [avValue, undefined] : undefined;
        return f ? avValue : undefined;
    }

    // main function to run filter
    this.run = function (result) {
        
        rs = result;
        var fList = fMng.getFunctionNames();
        var impNames = vMng.getVariableNames(['implicit']);
        // Support filters only for ONE implicit variable; otherwise just return result without change
        if (impNames.length !== 1) {
            // alert('only one implicit variable is allowed for function filters!');
            return rs;
        }
        impVar = getVarValues(impNames[0]);

        //var sirV = vMng.getVariableByName(impNames[0]);
        for (var i = 0; i < fList.length; i++) {
            var r = {}; // result
            var sirF = fMng.getFunctionByName(fList[i]);
            var filter = sirF.getFilter();
            if (filter !== '') {
                var fValues = getValues(fList[i]);
                var aFilter = filter.split(',');
                for (var j=0; j<aFilter.length; j++){
                    switch (aFilter[j]) {
                        case 'max':
                            r = max(fList[i]);
                            break;
                        case 'min':
                            r = min(fList[i]);
                            break;
                        case 'average':
                            r = average(fList[i]);
                            break;
                    }
                }
                
                // replace result with the current value
                // delete all iterations for this function
                for (var k=0; k<rs.length;k++) {
                    delete rs[k].functions[fList[i]];

                    // in case it's the last function, check if functions attribute is empty
                    var allgone = true;
                    if (fList.length - 1 === i || k > 0) { // the last function but leave the very firt result
                        for (var p in rs[k].functions) {
                            if (rs[k].functions.hasOwnProperty(p)) {
                                allgone = false;
                                break;
                            }
                        }
                        // if it empty -- remove it from both functions and variables from result
                        // otherwise, it has JSON.stringify() in FF has an issues dealing with empty attributes {}
                        if (allgone) {
                            delete rs[k].functions;
                            delete rs[k].variables;
                            rs[k] = undefined;
                        }
                    }

                }
                // set filtered value as the first element of result set
                //rs[0].functions[fList[i]] = ((r.max !== undefined) || (r.min !== undefined) || (r.average !== undefined)) ? r : undefined;
                rs[0].functions[fList[i]] = r;
            }
        }
        
        // build a new array by removing all undefined items
        var rs1 = [];
        for (var i = 0; i < rs.length; i++) {
            if (rs[i] !== undefined) {
                rs1.push(rs[i]);
            }
        }
        return rs1;
    }

}