/** **************************************************************************
* @class ConstraintManager
* @superclass none
* @param none
* @return - an instance of FunctionManager
*
*****************************************************************************
*/
SimParser.ConstraintManager = function() {

    // class variables
    var constraints = []; // new Dictionary();
    var that = this;
    var subs = { '&lt;': '<', '&gt;': '>'};

    // setters and getters
    this.getConstraints = function () {
        return constraints;
    };
    
    // load constrain from xml
    // root is the reference to the root of the evaluation unit
    this.setConstraints = function (root) {
        
        constraints = []; // new Dictionary();
        
        var r = root.getElementsByTagName('constraints').item(0);
        if (r !== null && r.hasChildNodes()) {
            for (var i = 0; i < r.childNodes.length; i++) {
                var attr = {};
                if (r.childNodes[i].nodeName[0] === '#') {
                	continue;
                }
                for (var j = 0; j < r.childNodes[i].attributes.length; j++) {
                    attr[r.childNodes[i].attributes[j].name] = r.childNodes[i].attributes[j].nodeValue;
                }
                c = new SimParser.Constraint();
                c.setAttributes(attr, r);
                constraints.push(c);
            }
        }
    };

    // return a list of constraint names for a given function
    this.getConstraintNames = function (funcName, filter) {
    	
        var cNames = [];
        if (typeof (filter) === 'undefined') {
        	filter = 'pre-condition';
        }
        for (var i = 0; i < constraints.length; i++) {
            if (constraints[i].getFormulaName() === funcName && constraints[i].getType() === filter) {
                cNames.push(constraints[i].getName());
            }
        }
        return cNames;
    };
    
    // return the constraint by its constraint name
    this.getConstraintByName = function (cName, filter) {
    	
        if (typeof (filter) === 'undefined') {
        	filter = 'pre-condition';
        }
        for (var i = 0; i < constraints.length; i++) {
            if (constraints[i].getName() === cName && constraints[i].getType() === filter) {
                return constraints[i];
            }
        }
    };

    // evaluate the preconditions of a function given by the function name and the current variable values
    this.evalPreConstraints = function (fName, varValueList) {
        
        var cEval = true;
        if (typeof (fName) === 'undefined') {
            fName = '';
        }
        
        // retrieve all preconditions for the function
        var cn = that.getConstraintNames(fName, 'pre-condition');
        for (var j = 0; j < cn.length; j++) {
            // retrieve each constraint in the precondition, and evaluate one by one
            var cnt = that.getConstraintByName(cn[j]);
            var r = evalConstraint(cnt.getConstraint(), varValueList);
            if (typeof (r) !== 'boolean') {
                cEval = false;
            }
            else {
                // evaluate the set of constraints using logical AND
                cEval = cEval && r;
            }
            // if a constraint cannot be satisfied, no need to proceed further
            if (!cEval) {
            	break;
            }
        }
        return cEval;
    };

    // evaluate the postconditions of a function given by the function name, the current variable values, and current result variable values
    this.evalPostConstraints = function (fName, varValueList, funcValueList) {
    	
        var cEval = true;
        if (typeof (fName) === 'undefined') {
        	fName = '';
        }
        var varList = [];
        
        // merge both lists
        for (var i = 0; i < varValueList.length; i++) {
            varList.push(varValueList[i]);
        }
        for (var i = 0; i < funcValueList.length; i++) {
            if (typeof (funcValueList[i]) !== 'undefined') {
            	// skip empty values
                varList.push(funcValueList[i]);
            }
        }
        
        // retrieve postconditions of a function
        var cn = that.getConstraintNames(fName, 'post-condition');
        for (var j = 0; j < cn.length; j++) {
            // retrieve each constraints in the postcondition, and evaluate one by one
            var cnt = that.getConstraintByName(cn[j], 'post-condition');
            var r = evalConstraint(cnt.getConstraint(), varList);
            if (typeof (r) !== 'boolean') {
                cEval = false;
            }
            else {
                // evaluate the set of constraints using logical AND
                cEval = cEval && r;
            }
            // if a constraint cannot be satisfied, no need to proceed further
            if (!cEval) {
                break;
            }
        }
        return cEval;
    };
    
    var evalConstraint = function (constraint, vars) {
        var result = null;
        var varList = [];
        var c = constraint;
        var variables = vars;
        var nonVariableTokens = [];    // store all string tokens that are not variables
        // step 1 -- use regexp as a tokenizer
        // match tokens with variable names
        var tokens = c.match(/\w+/g);
        for (var i = 0; i < tokens.length; i++) {
            var tokenIsVariable = false;
            for (var j = 0; j < variables.length; j++) {
                if (tokens[i] === variables[j].name) {
                    varList.push(variables[j]);
                    tokenIsVariable = true;
                    break;
                }
            }
            if ((isNaN(tokens[i])) && (tokens[i] !== 'and') && (tokens[i] !== 'or') && (tokenIsVariable == false) && (!arrayContains(nonVariableTokens, tokens[i]))) {
                // if the token is not a number, not a variable, not either 'or' or 'and', and has not been treated as non variable token before, 
                // add a pair of quotation marks in the constraint string
                var pattern = new RegExp(tokens[i], 'g');
                var newPatten = "'" + tokens[i] + "'";
                c = c.replace(pattern, newPatten);
                // store the token to the list, so that any other occurrences of the token will not be subjective to string replacement
                nonVariableTokens.push(tokens[i]);
            }
        }

        // step 2 -- make a string 'var=value1; var2=value2;' etc for all bound variables
        var strVar = new String();
        for (var i = 0; i < varList.length; i++) {
            if (varList[i].value[0] != null) {
                if (isNaN(varList[i].value[0])) {
                	// if the value is a string, enclose the value with a pair of quotation marks
                    strVar = strVar + varList[i].name + "='" + varList[i].value + "';";
                }
                else {
                    // otherwise it's a number, just use the value
                    strVar = strVar + varList[i].name + '=' + varList[i].value + ';';
                }
            }
            else if (varList[i].value != null) {
                if (isNaN(varList[i].value)) {
                    // if the value is a string, enclose the value with a pair of quotation marks
                    strVar = strVar + varList[i].name + "='" + varList[i].value + "';";
                }
                else {
                	// otherwise it's a number, just use the value
                    strVar = strVar + varList[i].name + '=' + varList[i].value + ';';
                }
            }
        }

        // step 3 replace OR and AND operators with javascript's || and && (single words only not as part of variable name (ex: v1or, tand, etc)
        c = c.replace(/\bor\b/g, '||').replace(/\band\b/g, '&&');
        try {
            result = eval(strVar + '(' + c + ')');
        }

        catch (err) {
            result = err.message;
        }

        return result;

    };
    
    // a utility function checking of an array contains an object
    var arrayContains = function(arr, obj) {
        var i = arr.length;
        while (i--) {
           if (arr[i] === obj) {
               return true;
           }
        }
        return false;
    };

};