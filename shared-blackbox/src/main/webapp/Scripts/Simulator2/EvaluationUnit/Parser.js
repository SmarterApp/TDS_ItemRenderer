 /*
 * http://forum.mathematex.net/logiciels-mathematiques-f7/exerciseur-niveau-lycee-realise-avec-geogebra-t11975-20.html
 * This code is a fork of a parser found in the following page :
 *    http://silentmatt.com/math/evaluator.php
 *
 * The original parser is based on ndef.parser, by Raphael Graf(r@undefined.ch)
 *   http://www.undefined.ch/mparser/index.html
 *
 * Invocation MUST be done by: var p = new Parser(); var z = p.parse(some expression);
 *   Else the prototype of Parser will not be extended with the new functions.
 *
 */

/*
   New features added 2012 II 15-27, III 2-5 by Norman Brenner, Segue Tech:
      Table lookup can be done with an externally or locally defined {} table: 
        a[b]    meaning "search dictionary or array named 'a' (e.g. {1:"A", 2:"B"}) for the key/index in 'b'

        {k1:"val1",k2:'val2',..}[index]   to extract a value from a table viaa its key.
         Single or double quotes ' or " may appear inside the braces, but not backquotes `.  
         "{}.index" is not permitted for the nonce.

      a=b, a==b and a===b          all meaning the same as "a==b"
      a<b, a<=b, a!=b, a!==b, a>=b, a>b   with the usual meanings  (Also, "&lt;" = "<", "&gt;" = ">")
      a&&b, a and b     meaning logical "and"   (Also, "&amp;" = "&")
      a||b, a or b      meaning logical "or"
      a?b:c, if a then b else c   meaning "if(a){b}else{c}"
	 NOTE: no parentheses are needed in the conditional expression
      Function names beginning with "Math." may have that prefix or not, as desired.
      An extensible list of synonyms for operators (i.e. infix functions like +, *, &&) (e.g. "and" for "&&")

      Precedence is correctly assigned for the new operators.
      All operator names, e.g. "and", "if", are case insensitive.
      All functions with 0 arguments are given a dummy argument during
parsing, which is then ignored during evaluation.

   Also, the insertion of "parens" was removed, as it broke function calls.

   NOTE: if any error occurs while reading this file and inserting it into another file, no error message is issued
     and the other file will fail.  Also, "</script>" must be used to close a "<script src="..">, not just "/>".

   NOTE: either single- or double quotes are now permitted around names.  (But not backquotes.)

   Should this parser be extended to most of Javascript?  E.g. should ";" be permitted?  Does "+" catenate?  Should functions be definible?

   Why are there 3 separate lists of functions?  Can they be merged?

CURRENT KNOWN BUGS:    
  (3-4*a    [error message is triggered]     
  xundefined  [error message is triggered]
  {1:{2:3}}  [braces depth is not checked]
*/

var Parser = function () {  //This has the same name as an internal function (!?)

    //Incredibly, Internet Explorer fails to implement the .indexOf method (despite documenting it
    //  in msdn.com).  So, from http://soledadpenades.com/2007/05/17/arrayindexof-in-internet-explorer/
    if(!Array.indexOf){
        Array.prototype.indexOf = function(arg){
            for(var i=0; i<this.length; i++){
                if(this[i]==arg){
                    return i;
                }
            }
            return -1;
        }
    }
    //Other features of Javascript, such as .getElementsByClassName, are also unimplemented in IE.  Developer beware!

    //Similarly, define a blank-trimming function
    String.trim = function(strArg) {
        return strArg.replace(/^\s+|\s+$/g,"");
    }

/*  //Somehow, keyOf is being attached to variable ops, below
    //Define Object.keyOf(value) to seek the key for a given value in an associative array {k1:v1, ..}
    if(!Object.keyOf){
        Object.prototype.keyOf = function(arg){
            for(var k in this){
                if(this[k]==arg){
                    return k ;
                }
            }
            return null;
        }
    }
    //Similarly, to test for a non-present key:   if(Obj[key]==undefined)   (No quotes!)
*/

    function object(o) {
        function F() {}
        F.prototype = o;
        return new F();
    }

    var TNUMBER = 0;
    var TOP1 = 1;
    var TOP2 = 2;
    var TVAR = 3;
    var TFUNCALL = 4;

    function Token(type_, index_, prio_, number_) {
        this.type_ = type_;
        this.index_ = index_ || 0;
        this.prio_ = prio_ || 0;
        this.number_ = (number_ !== undefined && number_ !== null) ? number_ : 0;
        this.toString = function () {
            switch (this.type_) {
                case TNUMBER:
                    return this.number_;
                case TOP1:
                case TOP2:
                case TVAR:
                    return this.index_;
                case TFUNCALL:
                    return "CALL";
                default:
                    return "Invalid Token";
            }
        };
    }

    function Expression(tokens, ops1, ops2, functions) {
        this.tokens = tokens;
        this.ops1 = ops1;
        this.ops2 = ops2;
        this.functions = functions;
    }

    // Based on http://www.json.org/json2.js
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            "'" : "\\'",
            '\\': '\\\\'
        };

    function escapeValue(v) {
        if (typeof v === "string") {
            escapable.lastIndex = 0;
            return escapable.test(v) ?
                "'" + v.replace(escapable, function (a) {
                    var c = meta[a];
                    return typeof c === 'string' ? c :
                        '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + "'" :
                "'" + v + "'";
        }
        return v;
    }

    function append(a, b) {
        if (Object.prototype.toString.call(a) != "[object Array]") {
            return [a, b];
        }
        a = a.slice();
        a.push(b);
        return a;
    }

    function fac(a) { //a!
        a = Math.floor(a);
        var b = a;
        while (a > 1) {
            b = b * (--a);
        }
        return b;
    }

    // TODO: use hypotenuse that doesn't overflow
    function pyt(a, b) {
        return Math.sqrt(a * a + b * b);
    }

    function random(a) {
        return Math.random() * (a || 1);
    }

    function Parser() {  //This should not have the same name as the outermost function (but it does!?)
        this.success = false;
        this.errormsg = "";
        this.expression = "";
        this.pos = 0;
        this.tokennumber = 0;
        this.tokenprio = 0;
        this.tokenindex = 0;
        this.tmpprio = 0;

	//List all functions which take 1 operand off the stack
        //This list is searched for string name matches
        this.ops1 = {
	  /*
            "parens": function(x){return x;},
            "brackets": function(x){return x;},
            "braces": function(x){return x;},
	  */
            "sin": Math.sin,
            "cos": Math.cos,
            "tan": Math.tan,
            "asin": Math.asin,
            "acos": Math.acos,
            "atan": Math.atan,
            "sqrt": Math.sqrt,
            "log": Math.log,
            "exp": Math.exp,
            "abs": Math.abs,
            "ceil": Math.ceil,
            "floor": Math.floor,
            "round": Math.round,
            "if": function(x){return x;},
            "-": function(x){return -x;},
            "!": function(x){return !x;},  //Boolean "not", not factorial
	    "{": function(a){eval('var z = {'+a+'}'); return z;}  //"{a}" is replaced by "{('a')", where "{" is this function; string a may include " but not '
        };

	//List all functions which take 2 operands off the stack
        //This list is searched by parse() for string name matches
        this.ops2 = {
            "+": function(a,b){return Number(a) + Number(b);},
            "-": function(a,b){return a - b;},
            "*": function(a,b){return a * b;},
            "/": function(a,b){return a / b;},
            "%": function(a,b){return a % b;},
            ",":  append,
            "&&": function(a,b){return a&&b;},  //This is "AND" in Javascript
            "||": function(a,b){return a||b;},  //This is "OR" in Javascript, not catenate "'' + a + b"
            "^":   Math.pow,
            "pow": Math.pow,
            "?":  function(a,b){if(a){return b;}else{return null;};},          //This computes "a?b"
            ":":  function(ab,c){if(ab === null){return c;}else{return ab;};}, //This computes "ab:c", assuming that "a?b" never returns a legitimate value of null
            "[]": function(a,b){return a[b];}, //"a[b]" is replaced by "a[](b)", where "[]" is this function
            "==": function(a,b){return a == b;}, //"=" and "===" are considered the same as "=="
	    "!=": function(a,b){return a != b;},
	    "<":  function(a,b){return a <  b;},      
	    "<=": function(a,b){return a <= b;},
	    ">":  function(a,b){return a >  b;},
	    ">=": function(a,b){return a >= b;}
        };

        //This list is searched by evaluate().
        //It must include all function names which look like variables (e.g. "Math.sin");
        //  note that those names are case-sensitive [or maybe not!?]
        this.functions = {
            "Math.atan2": Math.atan2,
            "Math.sin": Math.sin,
            "Math.cos": Math.cos,
            "Math.floor": Math.floor,
            "Math.min": Math.min,
            "Math.max": Math.max,
            "Math.pow": Math.pow,
            "Math.rand": Math.random,
            "Math.random": Math.random,
            "Math.round": Math.round,
            "Math.sqrt": Math.sqrt,

            "atan2": Math.atan2,
            "fac": fac,
            "min": Math.min,
            "max": Math.max,
            "pow": Math.pow,
            "random": random,
            "rand": random,

            "pyt": pyt
        };

        this.consts = {
            "E": Math.E,
            "e": Math.E,
            "PI": Math.PI,
            "pi": Math.PI
        };
    }

/*
  * The following lines of code are breathtakingly daring: the meaning of "parse()" changes from the
  *    outside to the inside.  It works if invoked WITHOUT instantiation.   So move the single 
  *    line to the beginning of the real parse() instead.

    Parser.parse = function (expr) {
// A stupid patch...
        expr = this.parbracketsAndCo(expr);
        return new Parser().parse(expr);
    };
*/

///////////////////////
// A stupid patch... //
///////////////////////
    Parser.parbracketsAndCo = function (expr){
/*
 * Here we do the following replacements :
 *    (...)  --->  (...)
 *    [...]  --->  [](...)
 *    {...}  --->  {}(...)
 * Unfortunately, nested braces are mishandled
 */
        expr = enclosers(expr, '(', ')', ''); //'parens');  //Why should a name be inserted here, which wrecks FNAME(ARGS)?
        expr = enclosers(expr, '[', ']', '[]');  //Turn brackets into a function, represented by "[]"
        expr = enclosers(expr, '{', '}', '{');  //Turn {xyz} into {(`xyz`) where "{" is a function and no backquotes appear inside
        return expr;

        function enclosers(expr, delimOpen , delimClose, name){
            var newExp = "",
                char = 0,
                pos = 0,
                charOpen = delimOpen.charAt(0),
                charClose = delimClose.charAt(0),
                countingOpenedGroup = 0;

            while(pos < expr.length) {
                char = expr.charAt(pos);

                if (char == charOpen) {
                    countingOpenedGroup ++;
		    if (delimOpen == '{')
                        newExp += name + '(' +'`';  //Backquote contents of braces; not ' or " which might appear therein
		    else	
                        newExp += name + '(';
                }
                else if (char == charClose) {
                    countingOpenedGroup --;
                    if(countingOpenedGroup < 0){
                        noIllegalGroup(countingOpenedGroup, delimOpen , delimClose);
                    }
		    if (delimOpen == '{')
                        newExp += '`' + ')';  
		    else	
                        newExp += ')';
                }
                else {
                    newExp += char;
                }
                pos++;
            }

            noIllegalGroup(countingOpenedGroup, delimOpen , delimClose);
            //Now, remove the unwanted back slashes that are inserted before the quotes
    	    //newExp.replace(/\\/g,"");
            return newExp;
        }

        function noIllegalGroup(countingOpenedGroup, delimOpen , delimClose){
            if(countingOpenedGroup < 0) {
                throw new Error('parse error : ' + delimOpen + '...'
                                + delimClose + ', missing opening character');
            }
            else if(countingOpenedGroup > 0) {
                throw new Error('parse error : ' + delimOpen + '...'
                                + delimClose + ', missing closing character');
            }
        }
    }

    Parser.evaluate = function (expr, variables) {
        return Parser.parse(expr).evaluate(variables);
    };

    Parser.Expression = Expression;

    //The following table is very like a mashup of this.ops1 with this.functions
    //My newly added functions, like "?" and "==", are not listed here.  Should they be?
    //Parser.values is used only in toJSFunction (which does what, exactly?)
    Parser.values = {
       /*
        parens: function(x){return x;},
        brackets: function(x){return x;},
        braces: function(x){return x;},
       */	
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        sqrt: Math.sqrt,
        log: Math.log,
        abs: Math.abs,
        ceil: Math.ceil,
        floor: Math.floor,
        "Math.floor": Math.floor,
        round: Math.round,
        random: random,
        rand: random,
        fac: fac,
        exp: Math.exp,
        min: Math.min,
        max: Math.max,
        "Math.max": Math.max,
        pyt: pyt,
        pow: Math.pow,
        atan2: Math.atan2,
        E: Math.E,
        PI: Math.PI
    };

    var PRIMARY  = 1 << 0;
    var OPERATOR = 1 << 1;
    var FUNCTION = 1 << 2;
    var LPAREN   = 1 << 3;
    var RPAREN   = 1 << 4;
    var COMMA    = 1 << 5;
    var SIGN     = 1 << 6;
    var CALL     = 1 << 7;

    Parser.prototype = {
        parse: function (expr) {
            //Parse out several kinds of brackets before anything else.
            //Moved here from the other parse() to make code that works after instantiation
            expr = Parser.parbracketsAndCo(expr);  

            this.errormsg = "";
            this.success = true;
            var operstack = [];
            var tokenstack = [];
            this.tmpprio = 0;
            var expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
            var noperators = 0;  //No. of items expected to be on the tokenstack
            var lptsl = -1;  //tokenstack size at last left parenthesis
            this.expression = expr;
            this.pos = 0;

            while (this.pos < this.expression.length) {
var cc = this.expression.charAt(this.pos);  //DUBUG
                if (this.isOperator()) {
                    if (this.isSign() && (expected & SIGN)) {
                        if (this.isNegativeSign()) {
                            this.tokenprio = 2;
                            this.tokenindex = "-";
                            this.addfunc(tokenstack, operstack, TOP1);
                            noperators += 1;
                        }
                        expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
                    }
                    else if (this.isComment()) {

                    }
                    else {
                        if ((expected & OPERATOR) === 0) {
                            this.error_parsing(this.pos, "unexpected operator");
                        }
                        this.addfunc(tokenstack, operstack, TOP2);
                        noperators += 2;
                        expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
                    }
                }
                else if (this.isNumber()) {
                    if ((expected & PRIMARY) === 0) {
                        this.error_parsing(this.pos, "unexpected number");
                    }
                    var token = new Token(TNUMBER, 0, 0, this.tokennumber);
                    tokenstack.push(token);

                    expected = (OPERATOR | RPAREN | COMMA);
                }
                else if (this.isString()) {
                    if ((expected & PRIMARY) === 0) {
                        this.error_parsing(this.pos, "unexpected string");
                    }
                    var token = new Token(TNUMBER, 0, 0, this.tokennumber);
                    tokenstack.push(token);

                    expected = (OPERATOR | RPAREN | COMMA);
                }
                else if (this.isLeftParen()) {
                    if ((expected & LPAREN) === 0) {
                        this.error_parsing(this.pos, "unexpected \"(\"");
                    }

                    if (expected & CALL) {
                        this.tokenprio = -2;
                        this.tokenindex = -1;
                        this.addfunc(tokenstack, operstack, TFUNCALL);
                        noperators += 2;  //Why +2 here?
                        lptsl = tokenstack.length;  //Save in case of 0 arguments inside ()
                    }

 		    //Permit also RPAREN so that () for 0 args is allowed
                    expected = (PRIMARY | LPAREN | FUNCTION | SIGN | RPAREN);
                }
                else if (this.isRightParen()) {
                    if ((expected & RPAREN) === 0) {
                        this.error_parsing(this.pos, "unexpected \")\"");
                    }
                    if (lptsl == tokenstack.length) {
                        //0 arguments detected inside (), so insert a dummy argument, 
                        //  which will do no harm if it is an extra argument.
                        //  Use an empty string, just in case.
                        var token = new Token(TNUMBER, 0, 0, '');
                        tokenstack.push(token);
                        lptsl = -1;  //Clear its value
                    }
                    expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
                }
                else if (this.isComma()) {
                    if ((expected & COMMA) === 0) {
                        this.error_parsing(this.pos, "unexpected \",\"");
                    }
                    this.addfunc(tokenstack, operstack, TOP2);
                    noperators += 2;
                    expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
                }
                else if (this.isConst()) {
                    if ((expected & PRIMARY) === 0) {
                        this.error_parsing(this.pos, "unexpected constant");
                    }
                    var consttoken = new Token(TNUMBER, 0, 0, this.tokennumber);
                    tokenstack.push(consttoken);
                    expected = (OPERATOR | RPAREN | COMMA);
                }
                else if (this.isOp2()) {
                    if ((expected & FUNCTION) === 0) {
                        this.error_parsing(this.pos, "unexpected function");
                    }
                    this.addfunc(tokenstack, operstack, TOP2);
                    noperators += 2;
                    expected = (LPAREN);
                }
                else if (this.isOp1()) {
                    if ((expected & FUNCTION) === 0) {
                        this.error_parsing(this.pos, "unexpected function");
                    }
                    this.addfunc(tokenstack, operstack, TOP1);
                    noperators += 1;
                    expected = (LPAREN);
                }
                else if (this.isVar()) {
                    if ((expected & PRIMARY) === 0) {
                        this.error_parsing(this.pos, "unexpected variable");
                    }
                    var vartoken = new Token(TVAR, this.tokenindex, 0, 0);
                    tokenstack.push(vartoken);

                    expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
                }
                else if (this.isWhite()) {
                }
                else {
                    if (this.errormsg === "") {
                        this.error_parsing(this.pos, "unknown character");
                    }
                    else {
                        this.error_parsing(this.pos, this.errormsg);
                    }
                }
              } 
           
            if (this.tmpprio < 0 || this.tmpprio >= 10) {
                this.error_parsing(this.pos, "unmatched \"()\"");
            }
            while (operstack.length > 0) {
                var tmp = operstack.pop();
                tokenstack.push(tmp);
            }
            if (noperators + 1 !== tokenstack.length) {
                this.error_parsing(this.pos, "parity");
            }
	
            //tokenstack is a Reverse Polish Notation translation of the input expression; e.g.
            //   when input expr = "a+b-c", tokenstack will be ['a','b','+','c','-']
            return new Expression(tokenstack, object(this.ops1), object(this.ops2), object(this.functions));
        },

        evaluate: function (expr, variables) {
            return this.parse(expr).evaluate(variables);
        },

        error_parsing: function (column, msg) {
            this.success = false;
            this.errormsg = "parse error: " + msg + "; col. " + column + " in: '" + this.expression + "'";
            throw new Error(this.errormsg);
            //Was: Error: parse error [column 5]: unexpected function in: a and b
        },

        //\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

        addfunc: function (tokenstack, operstack, type_) {
            var operator = new Token(type_, this.tokenindex, this.tokenprio + this.tmpprio, 0);
            while (operstack.length > 0) {
                if (operator.prio_ <= operstack[operstack.length - 1].prio_) {
                    tokenstack.push(operstack.pop());
                }
                else {
                    break;
                }
            }
            operstack.push(operator);
        },

        isNumber: function () {
            var r = false;
            var str = "";
            while (this.pos < this.expression.length) {
                var code = this.expression.charCodeAt(this.pos);
                if ((code >= 48 && code <= 57) || code === 46) {
                    str += this.expression.charAt(this.pos);
                    this.pos++;
                    this.tokennumber = parseFloat(str);
                    r = true;
                }
                else {
                    break;
                }
            }
            return r;
        },

        // Ported from the yajjl JSON parser at http://code.google.com/p/yajjl/
        unescape: function (v, pos) {
            var buffer = [];
            var escaping = false;
            var i;
            for (i = 0; i < v.length; i++) {
                var c = v.charAt(i);

                if (escaping) {
                    switch (c) {
                        case "'":
                            buffer.push("'");
                            break;
                        case '\\':
                            buffer.push('\\');
                            break;
                        case '/':
                            buffer.push('/');
                            break;
                        case 'b':
                            buffer.push('\b');
                            break;
                        case 'f':
                            buffer.push('\f');
                            break;
                        case 'n':
                            buffer.push('\n');
                            break;
                        case 'r':
                            buffer.push('\r');
                            break;
                        case 't':
                            buffer.push('\t');
                            break;
                        case 'u':
                            // interpret the following 4 characters as the hex of the Unicode code point
                            var codePoint = parseInt(v.substring(i + 1, i + 5), 16);
                            buffer.push(String.fromCharCode(codePoint));
                            i += 4;
                            break;
                        default:
                            throw this.error_parsing(pos + i, "Illegal escape sequence: '\\" + c + "'");
                    }
                    escaping = false;
                } else {
                    if (c == '\\') {
                        escaping = true;
                    } else {
                        buffer.push(c);
                    }
                }
            }

            return buffer.join('');
        },

        isString: function () {
            var r = false;
            var str = "";
            var startpos = this.pos;
	    var char0 = this.expression.charAt(this.pos);
            //The contents of braces ({}) are re-enclosed in backquotes, because if a normal quote were used, any
            //  similar quote inside the braces would end the contents.
            if (this.pos < this.expression.length && (char0 == "'" || char0=='"' || char0=='`') ) {
                this.pos++;
                while (this.pos < this.expression.length) {
                    var char = this.expression.charAt(this.pos);
                    if (char != char0 || str.slice(-1) == "\\") {  //String must begin and end with the same type of quote
                        str += this.expression.charAt(this.pos);
                        this.pos++;
                    }
                    else {
                        this.pos++;
                        this.tokennumber = this.unescape(str, startpos);
                        r = true;
                        break;
                    }
                }
            }
            return r;
        },

        isConst: function () {
            var str;
            for (var i in this.consts) {
                if (true) {
                    var L = i.length;
                    str = this.expression.substr(this.pos, L);
                    if (i === str) {
                        this.tokennumber = this.consts[i];
                        this.pos += L;
                        return true;
                    }
                }
            }
            return false;
        },
 

        //An "operator" is a symbol or name which appears between arguments (e.g. "+" in "a+b"), as opposed to a 
        //  function which appears before a parenthesized list of comma-separated arguments (e.g. "round" in "round(2.4)")

        //The operator priority levels assigned here (to this.tokenprio) run inversely to the usual precedence levels;
        //  note that "+" and "-" have priority 0, while "*" is 1, "/" and "%" are 2 [should be same as "*"], "^" is 3.
        //  Therefore, higher precedence operators must have lower priority numbers.

        isOperator: function () {
            //Order the keys by longer match first (e.g. "<=" before "<")
            //As many synonyms as desired may be included in this table
            var opsyns = { //"key": ["equivalent",priority]
                    "+": ["+",0],
                    "-": ["-",0],
                    "&&": ["&&",-3],
                    "and": ["&&",-3],
                    "&amp;&amp;": ["&&",-3],
                    "||": ["||",-4],
                    "or": ["||",-4],
                    "*": ["*",1],
                    "/": ["/",2],
                    "%": ["%",2],
                    "^": ["^",3],
                    "?": ["?",-5],
                    ":": [":",-6],
                    "if": ["+",-4], //Not quite right: "77 - if 1 then 2 else 3" becomes "if 77 - 1 then 2 else 3"
                    "then": ["?",-5],
                    "else": [":",-6],
                    "[]": ["[]",4],  //4??
                    "===": ["==",-2],
                    "==": ["==",-2],
                    "=": ["==",-2],
                    "!==": ["!=",-2],
                    "!=": ["!=",-2],
                    "<>": ["!=",-2],
                    "<=": ["<=",-1],
                    "<": ["<",-1],
                    ">=": [">=",-1],
                    ">": [">",-1],
                    "&lt;=": ["<=",-1],
                    "&lt;": ["<",-1],
                    "&gt;=": [">=",-1],
                    "&gt;": [">",-1]
            };

            //Loop thru all the keys (e.g. "and", "&lt;")
            for (var key in opsyns) {
                var found = true;
                var equiv = opsyns[key][0];
                var thischar = this.expression.charAt(this.pos);  //DUBUG
                
                //Match each letter (case-insensitive) to the corresponding character in the expression
                //Should exit the loop on first mismatch to save time
                for (var i=0; i<key.length; i+=1) {
                    found = found && this.expression.charAt(this.pos + i).toLowerCase() === key.charAt(i);
                }
                if (found) { 
                    this.tokenindex = equiv;
                    this.tokenprio = opsyns[key][1];
                    this.pos += key.length;
                    return true;
                };
            }
            return false;                                
         },
      
        isSign: function () {
            var char = this.expression.charAt(this.pos - 1);
	    var prevchar = this.expression.charAt(this.pos - 2);  //Kluge to treat "if" as a null prefix operator
            if (char === "-" || char === "+" || (prevchar+char) === "if") { 
                return true;
            }
            return false;
        },

        isPositiveSign: function () {
            var char = this.expression.charAt(this.pos - 1);
            if (char === "+") { 
                return true;
            }
            return false;
        },

        isNegativeSign: function () {
            var char = this.expression.charAt(this.pos - 1);
            if (char === "-") { 
                return true;
            }
            return false;
        },

        isLeftParen: function () {
            var char = this.expression.charAt(this.pos);
            if (char === "(") { 
                this.pos++;
                this.tmpprio += 10;
                return true;
            }
            return false;
        },

        isRightParen: function () {
            var char = this.expression.charAt(this.pos);
            if (char === ")") { 
                this.pos++;
                this.tmpprio -= 10;
                return true;
            }
            return false;
        },

        isComma: function () {
            var char = this.expression.charAt(this.pos);
            if (char === ",") { 
                this.pos++;
                this.tokenprio = -1;  //Do not make lower, or multiarg functions will misparse
                this.tokenindex = ",";
                return true;
            }
            return false;
        },

        isWhite: function () {
            var code = this.expression.charCodeAt(this.pos);
            if (code === 32 || code === 9 || code === 10 || code === 13) {
                this.pos++;
                return true;
            }
            return false;
        },

        isOp1: function () {
            var i, str = "";
            for (i = this.pos; i < this.expression.length; i++) {
                var c = this.expression.charAt(i);
                if ( (c.toUpperCase() === c.toLowerCase()) && (c != '{') ) {
                    if (i === this.pos || c < '0' || c > '9') {
                        break;
                    }
                }
                str += c;
            }
            if (str.length > 0 && (str in this.ops1)) {
                this.tokenindex = str;
                this.tokenprio = 5;
                this.pos += str.length;
                return true;
            }
            return false;
        },

        isOp2: function () {
            var i, str = "";
            for (i = this.pos; i < this.expression.length; i++) {
                var c = this.expression.charAt(i);
                if (c.toUpperCase() === c.toLowerCase()) {
                    if (i === this.pos || c < '0' || c > '9') {
                        break;
                    }
                }
                str += c;
            }
            if (str.length > 0 && (str in this.ops2)) {
                this.tokenindex = str;
                this.tokenprio = 5;
                this.pos += str.length;
                return true;
            }
            return false;
        },

        isVar: function () {
            var i, str = "";
            for (i = this.pos; i < this.expression.length; i++) {
                var c = this.expression.charAt(i);
                //Permit both underscore and period in names (since "Math.sin" is extracted here)
                if ((c.toUpperCase() === c.toLowerCase()) && (c !== '_') && (c !== '.')) {    
                    if (i === this.pos || c < '0' || c > '9') {
                        break;
                    }
                }
                str += c;
            }
            if (str.length > 0) {
                this.tokenindex = str;
                this.tokenprio = 4;
                this.pos += str.length;
                return true;
            }
            return false;
        },

        isComment: function () {
            var char = this.expression.charAt(this.pos - 1);
            if (char === "/" && this.expression.charAt(this.pos) === "*") {
                this.pos = this.expression.indexOf("*/", this.pos) + 2;
                if (this.pos === 1) {
                    this.pos = this.expression.length;
                }
                return true;
            }
            return false;
        }
    };


    Expression.prototype = {
        simplify: function (values) {
            values = values || {};
            var nstack = [];
            var newexpression = [];
            var f, i, item, n1, n2;
            var L = this.tokens.length;
            for (i = 0; i < L; i++) {
                item = this.tokens[i];
                var type_ = item.type_;
                if (type_ === TNUMBER) {
                    nstack.push(item);
                }
                else if (type_ === TVAR && (item.index_ in values)) {
                    item = new Token(TNUMBER, 0, 0, values[item.index_]);
                    nstack.push(item);
                }
                else if (type_ === TOP2 && nstack.length > 1) {
                    n2 = nstack.pop();
                    n1 = nstack.pop();
                    f = this.ops2[item.index_];
                    item = new Token(TNUMBER, 0, 0, f(n1.number_, n2.number_));
                    nstack.push(item);
                }
                else if (type_ === TOP1 && nstack.length > 0) {
                    n1 = nstack.pop();
                    f = this.ops1[item.index_];
                    item = new Token(TNUMBER, 0, 0, f(n1.number_));
                    nstack.push(item);
                }
                else {
                    while (nstack.length > 0) {
                        newexpression.push(nstack.shift());
                    }
                    newexpression.push(item);
                }
            }
            while (nstack.length > 0) {
                newexpression.push(nstack.shift());
            }

            return new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
        },

        substitute: function (variable, expr) {
            if (!(expr instanceof Expression)) {
                expr = new Parser().parse(String(expr));
            }
            var newexpression = [];
            var L = this.tokens.length;
            var i, item;
            for (i = 0; i < L; i++) {
                item = this.tokens[i];
                var type_ = item.type_;
                if (type_ === TVAR && item.index_ === variable) {
                    for (var j = 0; j < expr.tokens.length; j++) {
                        var expritem = expr.tokens[j];
                        var replitem = new Token(expritem.type_, expritem.index_, expritem.prio_, expritem.number_);
                        newexpression.push(replitem);
                    }
                }
                else {
                    newexpression.push(item);
                }
            }

            var ret = new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
            return ret;
        },

        evaluate: function (values) {
            values = values || {};
            var nstack = [];
            var f, i, item, n1, n2;
            var L = this.tokens.length;
            for (i = 0; i < L; i++) {
                item = this.tokens[i];
                var type_ = item.type_;
                if (type_ === TNUMBER) {
                    nstack.push(item.number_);
                }
                else if (type_ === TOP2) {
                    n2 = nstack.pop();
                    n1 = nstack.pop();
                    f = this.ops2[item.index_];
                    nstack.push(f(n1, n2));
                }
                else if (type_ === TVAR) {
                    if (item.index_ in values) {
                        nstack.push(values[item.index_]);
                    }
                    else if (item.index_ in this.functions) {
                        nstack.push(this.functions[item.index_]);
                    }
                    else {
                        throw new Error("undefined variable: " + item.index_);
                    }
                }
                else if (type_ === TOP1) {
                    n1 = nstack.pop();
                    f = this.ops1[item.index_];
                    nstack.push(f(n1));
                }
                else if (type_ === TFUNCALL) {
                    n1 = nstack.pop();
                    f = nstack.pop();
                    if (f.apply && f.call) {
                        if (Object.prototype.toString.call(n1) == "[object Array]") {
                            nstack.push(f.apply(undefined, n1));
                        }
                        else {
                            nstack.push(f.call(undefined, n1));
                        }
                    }
                    else {
                        throw new Error(f + " is not a function");
                    }
                }
                else {
                    throw new Error("invalid Expression");
                }
            }
            if (nstack.length > 1) {
                throw new Error("invalid Expression (parity)");
            }
            return nstack[0];
        },

        toString: function (toJS) {
            var nstack = [];
            var L = this.tokens.length;
            var f, i, item, n1, n2;
            for (i = 0; i < L; i++) {
                item = this.tokens[i];
                var type_ = item.type_;
                if (type_ === TNUMBER) {
                    nstack.push(escapeValue(item.number_));
                }
                else if (type_ === TOP2) {
                    n2 = nstack.pop();
                    n1 = nstack.pop();
                    f = item.index_;
                    if (toJS && f == "^") {
                        nstack.push("Math.pow(" + n1 + "," + n2 + ")");
                    }
                    else {
                        nstack.push("(" + n1 + f + n2 + ")");
                    }
                }
                else if (type_ === TVAR) {
                    nstack.push(item.index_);
                }
                else if (type_ === TOP1) {
                    n1 = nstack.pop();
                    f = item.index_;
                    if (f === "-") {
                        nstack.push("(" + f + n1 + ")");
                    }
                    else {
                        nstack.push(f + "(" + n1 + ")");
                    }
                }
                else if (type_ === TFUNCALL) {
                    n1 = nstack.pop();
                    f = nstack.pop();
                    nstack.push(f + "(" + n1 + ")");
                }
                else {
                    throw new Error("invalid Expression");
                }
            }
            if (nstack.length > 1) {
                throw new Error("invalid Expression (parity)");
            }
            return nstack[0];
        },



/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

        toLaTeX: function () {
            var nstack = [];
            var f, i, item, n1, n2;
            var L = this.tokens.length;
            for (i = 0; i < L; i++) {
                item = this.tokens[i];
                var type_ = item.type_;
                if (type_ === TNUMBER) {
                    nstack.push(escapeValue(item.number_));
                }
                else if (type_ === TOP2) {
                    n2 = nstack.pop();
                    n1 = nstack.pop();
                    f = item.index_;
                    if (f == "^") {
                        nstack.push("{" + n1 + "}^{" + n2 + "}");
                    }
                    else if (f == "*") {
                        nstack.push(n1 + " \\times " + n2);
                    }
                    else if (f == "/") {
                        nstack.push("\\frac{" + n1 + "}{" + n2 + "}");
                    }
                    else {
                        nstack.push(n1 + " " + f + " " + n2);
                    }
                }
                else if (type_ === TVAR) {
                    nstack.push(item.index_);
                }
                else if (type_ === TOP1) {
                    n1 = nstack.pop();
                    f = item.index_;
                    if (f === "-") {
                        nstack.push(f + n1);
                    }
		/* Comment out the obsolete names for enclosers; what was the point?
                    else if (f === "parens"){
                        //nstack.push(n1);  //Was ('(' + n1 + ')'), but parentheses are already present 
			nstack.push('(' + n1 + ')');
                    }
                    else if (f === "brackets"){
                        nstack.push('[' + n1 + ']');
                    }
                    else if (f === "braces"){
                        nstack.push('{' + n1 + '}');
                    }
		*/
                    else {
                        nstack.push(f + ' ' + n1);
                    }
                }
                else if (type_ === TFUNCALL) {
                    n1 = nstack.pop();
                    f = nstack.pop();

                    nstack.push(f + ' ' + n1);
                }
                else {
                    throw new Error("invalid Expression");
                }
            }
            if (nstack.length > 1) {
                throw new Error("invalid Expression (parity)");
            }
            return nstack[0];
        },

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

        variables: function () {
            var L = this.tokens.length;
            var vars = [];
	    var i;
            for (i = 0; i < L; i++) {
                var item = this.tokens[i];
                if (item.type_ === TVAR && (vars.indexOf(item.index_) == -1)) {
                    vars.push(item.index_);
                }
            }

            return vars;
        },

        toJSFunction: function (param, variables) {
            var f = new Function(param, "with(Parser.values) { return " + this.simplify(variables).toString(true) + "; }");
            return f;
        }
    };

    return Parser;
} ();