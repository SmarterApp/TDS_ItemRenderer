/*
 Function support
 There are 3 types of functions:
  Math expression: we use Parser.js to parse and evaluate it
  Lookup table: a one dimentional dictionary of key-value pairs.
  Javascript expression: we use Parser.js to parse and evaluate it
 */

/**
 * *****************************************************************************
 * @class Function 
 * @superclass none
 * @param none
 * @return - instance of Function
 * 
 *******************************************************************************
 */
SimParser.Function = function() {

    // Inherit instance variables
    SimParser.ParserItem.call(this);
    
    // Instance variables
    var name;           // function name
    var nameProxy;      // if provided, used instead of name
    var equation='';    //  functional equation with variables and constants: 'c*sin(x)/x'
    var varList = [];      // list of SirVariableElement
    var value;          // correct answer
    var context;
    var type = 'regualar'; // function type. either 'regular' (default) or 'lookup' or 'javascript'
    var variable;
    var parser = new Parser();
    var lookup;                 // lookup expression for lookup function
    var code = '';             // javascript expression for js function
    var func;
    var keyName = undefined;   // keyName for lookup functions
    var filter = '';           // filter property: either 'min' or 'max' or 'average'
    var scoreable = 'yes';      // either 'yes' (default) or 'no'. If 'no' then function result is not added to scoringTable
    var orderedEvaluation = false;    // either true or false, indicating if a function needs to be evaluated in the specified order instead of order determined by dependency tree

    // function dependency level (level = 0 - depends on bindable, constant, or implicit variables; level = 1 - level = 0 plus function variables of level = 0; etc
    var depLevel = -1;
    // function computation order, for a function k - values for all variables is known by computing functions 1..k-1 plus bindable, constant, or implicit values
    var compOrder = -1;

    // parse the function and identify all variables used in the function
    this.bindVariables = function (vars) {
        
        var vList = [];
        
        // parse the function
        var p = parser.parse(equation);
        
        for (var i = 0; i < p.tokens.length; i++) {
            if (p.tokens[i].type_ === 3) { // only interested in variables
                for (var j = 0; j < vars.length; j++) {
                    var v = undefined;
                    if (vars[j].getName() === p.tokens[i].index_) {
                        v = vars[j];
                        break;
                    }
                }
                // if found, save it
                if (v) {
                    vList.push(v);
                }
            }
        }
        this.setVarList(vList);
    }
  
    // evaluate the result of the function
    this.evaluateEquation = function () {
        
        // bind variables
        var bindList= {};
        for (var i = 0; i < varList.length; i++) {
            bindList[varList[i].getName()] = varList[i].getValue();
        }
        return parser.parse(this.getEquation()).evaluate(bindList);
    }
  
    this.testAnswer = function(testValue) {
        return (value === testValue);
    }
  
    // setters and getters
    this.getValue = function () {
        return value;
    }
  
    this.setValue = function (newValue) {
        value = newValue;
        return this;
    }
  
    this.getEquation = function () {
        return equation;
    }
  
    this.setEquation = function (newEquation) {
        equation = newEquation;
        return this;
    }
  
    this.getVarList = function () {
        return varList;
    }

    this.setVarList = function (vars) {
        varList = vars;
        return this;
    }
    
    this.setVarList = function (newVarList) {
        varList = newVarList;
        return this;
    }

    this.getName = function () {
        // if proxyName is defined, use it instead of name
        /*if (nameProxy !== undefined ) {
               return nameProxy;
           }
        else {
           return name;
           }*/
        return name;
    }

    this.setName = function (newName) {
        name = newName;
        return this;
    }

    this.getContext = function () {
        return context;
    }

    this.setContext = function (newContext) {
        context = newContext;
        return this;
    }

    this.getDepLevel = function () {
        return depLevel;
    }

    this.setDepLevel = function (level) {
        depLevel = level;
    }

    this.getCompOrder = function () {
        return compOrder;
    }

    this.setCompOrder = function (newCompOrder) {
        compOrder = newCompOrder;
    }

    this.getVariable = function () {
        return variable;
    }

    this.setVariable = function (newVariable) {
        variable = newVariable;
    }

    this.getCode = function () {
        return code;
    }

    this.setCode = function (newCode) {
        code = newCode;
    }

    this.getScoreable = function () {
        return scoreable;
    }

    this.setScoreable = function (newScorable) {
        if (newScorable !== 'no') {
        	newScorable='yes' // default value
        }
        scoreable = newScorable;
    }
    
    this.getOrderedEvaluation = function () {
        return orderedEvaluation;
    }
    
    // setter and getter for ordered evaluation
    this.setOrderedEvaluation = function (ordered) {
        if (ordered === 'yes') {
            orderedEvaluation = true;
        }
        else {
            orderedEvaluation = false;
        }
    }

    this.getFunction = function () {
        if (!func) {
            var vNames = this.getVarNames();
            var params = vNames.join(',');
            func = new Function(params, 'return ' + this.getCode());
        }
        return func;
    }

    this.getVarNames = function () {
        var fNames = [];
        var p = parser.parse(equation);
        // can be done simpler by calling p.variables();
        for (var i = 0; i < p.tokens.length; i++) {
           // p.tokens[i].index_;
            if (p.tokens[i].type_ === 3 && fNames.indexOf(p.tokens[i].index_) === -1 && p.tokens[i].index_ !== name) { // only interested in unique variables
                // eliminate any Math symbols as variables
                if ((p.tokens[i].index_.length < 5) || (p.tokens[i].index_.substring(0,5).toLowerCase() != 'math.')) {
                    fNames.push(p.tokens[i].index_);
                }
            }
        }
        return fNames;
    }

    this.getType = function () {
        return type;
    }

    this.setType = function (t) {
        type = t;
    }

    this.getKeyName = function () {
        return keyName;
    }

    this.setKeyName = function (k) {
        keyName = k;
    }

    this.getLookupValue = function (v) {
        if (!lookup) {
            lookup = {};
            lookup = eval('(' + equation + ')');
        }
        return lookup[v];
    }

    this.getFilter = function () {
        return filter;
    }

    this.setFilter = function (f) {
        filter = f;
    }

    this.getProxyName = function () {
        return nameProxy;
    }

    this.setProxyName = function (p) {
        nameProxy = p;
    }

    // retrieve function attributes from xml
    this.setAttributes = function (attr, node) {
        // set proxyName before name, so when proxyName is defined, return it instead of name in getName()
        if (attr.type !== undefined) this.setType(attr.type);
        if (attr.nameProxy !== undefined) this.setProxyName(attr.nameProxy);
        if (attr.name !== undefined) this.setName(attr.name);
        if (attr.formula !== undefined) this.setEquation(attr.formula);
        if (attr.context !== undefined) this.setContext(attr.context);
        if (attr.value !== undefined) this.setValue(attr.value);
        if (attr.variable !== undefined) this.setVariable(attr.variable);
        if (attr.code !== undefined) {
            if (this.getType() === 'javascript') {
                this.setEquation(attr.code);
            }
            this.setCode(attr.code);
        }
        if (attr.keyName !== undefined) this.setKeyName(attr.keyName);
        if (attr.filter !== undefined) this.setFilter(attr.filter);
        this.setScoreable(attr.scoreable);
        // set orderedEvaluation attribute
        if (attr.orderedEvaluation !== undefined) this.setOrderedEvaluation(attr.orderedEvaluation);

    }

    this.setEname('Equation');

};

//Inherit methods and class variables
SimParser.Function.prototype = new SimParser.ParserItem();
SimParser.Function.prototype.constructor = SimParser.Function;
