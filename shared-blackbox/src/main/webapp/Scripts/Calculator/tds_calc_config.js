//Each calc type cooresponds to a class. 
var CalcType = { 
    arithmetic: 'Arithmetic', 
    graphing: 'Graphing',
    regression: 'Regression',
    linearalgebra: 'Matrices'
}

//List of calc modes supported. You can change mode namae at the right side, as long as it matches the query string
var CalcModeList = [];
CalcModeList['Basic'] = 'Basic';
CalcModeList['Standard'] = 'Standard';
CalcModeList['Scientific'] = 'Scientific';
CalcModeList['ScientificInv'] = 'ScientificInv';
CalcModeList['Graphing'] = 'Graphing';
CalcModeList['GraphingInv'] = 'GraphingInv';
CalcModeList['Regression'] = 'Regression';
CalcModeList['Matrices'] = 'Matrices';
CalcModeList['StandardMem'] = 'StandardMem';
/* TDS calc core configuration for each mode:
    name: calc mode name
    displayName: user friendly name.  not used Currently
    type: calc type, coorespoind to a calculator class
    lazyEvaluation: whether waits until all expression has been inputed before evaluation
    css: css class name. It is applied when this mode is set
    keyboardRegionDivs: region list for shortcut Tab and shift-Tab keys that cycle through different regions
        Note that region is not fixed for graphing and multi-mode calc.
    shortcutInitFunc: create maps for arrow keys for each region 
    textInputLen: maximum length for main text input. Graphing is handled separately
*/
var CalcConfigBase = 
[
    {
        name: CalcModeList['Basic'], displayName: 'Basic', type: CalcType.arithmetic, lazyEvaluation: false, css: 'basic4',
        keyboardRegionDivs: ['calcClear', 'numberPad', 'basicFunctions'],
        shortcutInitFunc: initBasicShortCut,
        //fix for https://bugz.airws.org/default.asp?22134#130826
        textInputLen: [{id: 'textinput', len: 24}]
    },
    {
        name: CalcModeList['Standard'],displayName: 'Standard', type: CalcType.arithmetic,lazyEvaluation: false, css: 'basic6',
        keyboardRegionDivs: ['calcClear', 'memLogic', 'numberPad', 'basicFunctions'],
        shortcutInitFunc: initStandardShortCut,
        //fix for https://bugz.airws.org/default.asp?22134#130826
        textInputLen: [{id: 'textinput', len: 24}]
    },
    {
        name: CalcModeList['StandardMem'],displayName: 'Standard', type: CalcType.arithmetic,lazyEvaluation: false, css: 'basicMem6',
        keyboardRegionDivs: ['calcClear', 'memLogicStandard', 'numberPad', 'basicFunctions'],
        shortcutInitFunc: initStandardMemShortCut,
        //fix for https://bugz.airws.org/default.asp?22134#130826
        textInputLen: [{id: 'textinput', len: 24}]
    },
    {
        name: CalcModeList['Scientific'],displayName: 'Scientific',type: CalcType.arithmetic,lazyEvaluation: true,css: 'scientific',
        keyboardRegionDivs: ['calcClear', 'memLogic', 'advancedFunctions', 'numberPad', 'modes', 'basicFunctions'],
        shortcutInitFunc: initScientificShortCut,
        textInputLen: [{id: 'textinput', len: 48}]
    },
    {
        name: CalcModeList['ScientificInv'], displayName: 'Scientific', type: CalcType.arithmetic, lazyEvaluation: true, css: 'scientific inv',
        keyboardRegionDivs: ['calcClear', 'memLogic', 'advancedFunctions', 'numberPad', 'modes', 'basicFunctions'],
        shortcutInitFunc: initScientificShortCut,
        textInputLen: [{ id: 'textinput', len: 48 }]
    },
    {
        name: CalcModeList['Graphing'],displayName: 'Graphing', type: CalcType.graphing,lazyEvaluation: true, css: 'graphing',
        keyboardRegionDivs: ['calcClear', 'memLogic', 'advancedFunctions', 'numberPad', 'modes', 'basicFunctions', 'graphmodes'],
        shortcutInitFunc: initGraphingShortCut,
        textInputLen: [{id: 'equa1', len: 48}, {id: 'equa2', len: 48},{id: 'equa3', len: 48},{id: 'equa4', len: 48},
                       {id: 'initX', len: 10}, {id: 'xmin', len: 6}, {id: 'ymin', len:6}, {id: 'xmax', len: 6}, {id: 'ymax', len: 6}, 
                       { id: 'xscale', len: 48 }, { id: 'yscale', len: 48 }, { id: 'tracestepsize', len: 3 }],
        fractionalPartLen: { 'xscale': 2, 'yscale': 2 }
    },
    {
        name: CalcModeList['GraphingInv'], displayName: 'Graphing', type: CalcType.graphing, lazyEvaluation: true, css: 'graphing inv',
        keyboardRegionDivs: ['calcClear', 'memLogic', 'advancedFunctions', 'numberPad', 'modes', 'basicFunctions', 'graphmodes'],
        shortcutInitFunc: initGraphingShortCut,
        textInputLen: [{ id: 'equa1', len: 48 }, { id: 'equa2', len: 48 }, { id: 'equa3', len: 48 }, { id: 'equa4', len: 48 },
                       { id: 'initX', len: 10 }, { id: 'xmin', len: 6 }, { id: 'ymin', len: 6 }, { id: 'xmax', len: 6 }, { id: 'ymax', len: 6 },
                       { id: 'xscale', len: 48 }, { id: 'yscale', len: 48 }, { id: 'tracestepsize', len: 3 }],
        fractionalPartLen: { 'xscale': 2, 'yscale': 2 }
    },
    {
        name: CalcModeList['Regression'], displayName: 'Regression',type: CalcType.regression,lazyEvaluation: true,css: 'regressions',
        keyboardRegionDivs: ['calcClear', 'numberPad', 'basicFunctions', 'regresionModes', 'yNumb'],
        shortcutInitFunc: initRegressionsShortCut,
        textInputLen: [{id: 'textinput', len: 0}, {id: 'Any', len: 9}]
    },
    {
        name: CalcModeList['Matrices'],displayName: 'Matrices',type: CalcType.linearalgebra,lazyEvaluation: true,css: 'matrices',
        keyboardRegionDivs: ['calcClear', 'advancedFunctions', 'numberPad', 'basicFunctions', 'mGroup', 'matricestabs','numberRows', 'numberCols', 'matrixResult', 'matrixClear', 'matrixArea'],
        shortcutInitFunc:initMatricesShortCut,
        textInputLen: [{id: 'textinput', len: 36}, {id:'Any', len: 9}]  //Any has to be at the end of list
    }
];

// Return shortcut region divs given a mode
function getRegionDivsByMode(mode)
{
    for (var i=0; i<CalcConfigBase.length; i++)
        if (CalcConfigBase[i].name == mode) return CalcConfigBase[i].keyboardRegionDivs;
      
    return null;
}

/*
    This is associated array that stores shortcut maps. Example
    elementInRegion['Standard-numberPad-num2'] = {id:'num2',up:'num5',down:'num0',left:'num1',right:'num3'};
    means: press up arrow will go to button 5 (num5) from current position num2
    It is initialized before each calc class is created in TDS_Calc.prototype.createCalcs.
*/
var elementInRegion = [];

/*
    Add elements for CalcControl region
    calcName: calc mode name
    region:   region name
    hasTextInput: does this mode have a main text input field?
    hasANS: does this mode have active ANS button
*/
function addCalcControlElements(calcName, region, hasTextInput, hasANS, CnotShown)
{
    var textinput = 'textinput';
    if (!hasTextInput) textinput = null;
    
    if (hasTextInput) {
        elementInRegion[calcName + '-' + region + '-default'] = {id:'textinput',up:null,down:'backspace',left:null,right:null};
        elementInRegion[calcName + '-' + region + '-textinput'] = {id:'textinput',up:null,down:'backspace',left:null,right:null};
        elementInRegion[calcName + '-' + region + '-backspace'] = {id:'backspace',up:textinput,down:null,left:null,right:'CE'};
    } else {
        elementInRegion[calcName + '-' + region + '-default'] = {id:'backspace',up:textinput,down:null,left:null,right:'CE'};
        elementInRegion[calcName + '-' + region + '-backspace'] = {id:'backspace',up:textinput,down:null,left:null,right:'CE'};
    }

    if (CnotShown) {
        elementInRegion[calcName + '-' + region + '-CE'] = { id: 'CE', up: textinput, down: null, left: 'backspace', right: null };
    }
    else {
        elementInRegion[calcName + '-' + region + '-CE'] = { id: 'CE', up: textinput, down: null, left: 'backspace', right: 'C' };
    }

        if (hasANS) {
        elementInRegion[calcName + '-' + region + '-C'] = { id: 'C', up: textinput, down: null, left: 'CE', right: 'ANS' };
        elementInRegion[calcName + '-' + region + '-ANS'] = { id: 'ANS', up: textinput, down: null, left: 'C', right: null };
    } else {
        elementInRegion[calcName + '-' + region + '-C'] = { id: 'C', up: textinput, down: null, left: 'CE', right: null };
    }
}

/*
    Add elements for NumberPad region
    calcName: calc mode name
    region:   region name
*/
function addNumberPadElements(calcName, region)
{
    elementInRegion[calcName + '-' + region + '-default'] = {id:'num5',up:'num8',down:'num2',left:'num4',right:'num6'};
    elementInRegion[calcName + '-' + region + '-num1'] = {id:'num1',up:'num4',down:'num0',left:null,right:'num2'};
    elementInRegion[calcName + '-' + region + '-num2'] = {id:'num2',up:'num5',down:'num0',left:'num1',right:'num3'};
    elementInRegion[calcName + '-' + region + '-num3'] = {id:'num3',up:'num6',down:'dot',left:'num2',right:null};
    elementInRegion[calcName + '-' + region + '-num4'] = {id:'num4',up:'num7',down:'num1',left:null,right:'num5'};
    elementInRegion[calcName + '-' + region + '-num5'] = {id:'num5',up:'num8',down:'num2',left:'num4',right:'num6'};
    elementInRegion[calcName + '-' + region + '-num6'] = {id:'num6',up:'num9',down:'num3',left:'num5',right:null};
    elementInRegion[calcName + '-' + region + '-num7'] = {id:'num7',up:null,down:'num4',left:null,right:'num8'};
    elementInRegion[calcName + '-' + region + '-num8'] = {id:'num8',up:null,down:'num5',left:'num7',right:'num9'};
    elementInRegion[calcName + '-' + region + '-num9'] = {id:'num9',up:null,down:'num6',left:'num8',right:null};
    elementInRegion[calcName + '-' + region + '-num0'] = {id:'num0',up:'num1',down:null,left:null,right:'dot'};
    elementInRegion[calcName + '-' + region + '-dot'] = {id:'dot',up:'num3',down:null,left:'num0',right:null};
}

/*
    Add elements for memlogic region
    calcName: calc mode name
    region:   region name
    hasX: does this mode show x variable
*/
function addMemLogicElements(calcName, region, hasX, onlyhasX) {
    if(onlyhasX) {
        elementInRegion[calcName + '-' + region + '-default'] = {id:'variable',up:null,down:null,left:null,right:null};
        elementInRegion[calcName + '-' + region + '-variable'] = { id: 'variable', up: null, down: null, left: null, right: null };
        return;
    }
    
    if (!hasX) {
        elementInRegion[calcName + '-' + region + '-default'] = {id:'STO',up:null,down:'RCL',left:null,right:null};
        elementInRegion[calcName + '-' + region + '-STO'] = {id:'STO',up:null,down:'RCL',left:null,right:null};
        elementInRegion[calcName + '-' + region + '-RCL'] = {id:'RCL',up:'STO',down:null,left:null,right:null};
    } else {
        elementInRegion[calcName + '-' + region + '-default'] = {id:'STO',up:null,down:'RCL',left:null,right:null};
        elementInRegion[calcName + '-' + region + '-STO'] = {id:'STO',up:null,down:'RCL',left:null,right:null};
        elementInRegion[calcName + '-' + region + '-RCL'] = {id:'RCL',up:'STO',down:'variable',left:null,right:null};
        elementInRegion[calcName + '-' + region + '-variable'] = {id:'variable',up:'RCL',down:null,left:null,right:null};
    }
}


/*
    Add elements for memlogic region
    calcName: calc mode name
    region:   region name
    hasX: does this mode show x variable
*/
function addStandardMemLogicElements(calcName, region) {
    elementInRegion[calcName + '-' + region + '-default'] = {id:'memoryC',up:null,down:'memoryR',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-memoryC'] = {id:'memoryC',up:null,down:'memoryR',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-memoryR'] = {id:'memoryR',up:'memoryC',down:'memoryS',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-memoryS'] = {id:'memoryS',up:'memoryR',down:'memory+',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-memory+'] = {id:'memoryS',up:'memoryS',down:null,left:null,right:null};
}



/*
    Add elements for BasicFunction region
    calcName: calc mode name
    region:   region name
    elements: a list of elements of basic functions '+ - ...'
*/
function addBasicFunctionElements(calcName, region, elements)
{
    addLinearColumElements(calcName, region, elements);
}

/*
    Utility function that adds a list of elements vertically
    calcName: calc mode name
    region:   region name
    elements: a list of elements
*/
function addLinearColumElements(calcName, region, elements)
{
    var obj; 
    for (var i=0; i<elements.length; i++) {

        if (i == 0) {
            obj = {id:elements[i],up:null,down:elements[i+1],left:null,right:null};
            elementInRegion[calcName + '-' + region + '-default'] = obj;
        } else 
        if (i == elements.length-1) obj = {id:elements[i],up:elements[i-1],down:null,left:null,right:null};
        else obj = {id:elements[i],up:elements[i-1],down:elements[i+1],left:null,right:null};

        elementInRegion[calcName + '-' + region + '-' + elements[i]] = obj;
    }
}

/*
    Add elements for basic function of Standard calc region. The only exception of basic function region
    calcName: calc mode name
    region:   region name
*/
function addStandardBasicFunctionElemnts(calcName, region)
{
    elementInRegion[calcName + '-' + region + '-default'] = {id:'divide',up:null,down:'multiply',left:null,right:'remainder'};
    elementInRegion[calcName + '-' + region + '-divide'] = {id:'divide',up:null,down:'multiply',left:null,right:'remainder'};
    elementInRegion[calcName + '-' + region + '-multiply'] = { id: 'multiply', up: 'divide', down: 'minus', left: null, right: 'sqrt' };
    elementInRegion[calcName + '-' + region + '-minus'] = {id:'minus',up:'multiply',down:'plus',left:null,right:'sign'};
    elementInRegion[calcName + '-' + region + '-plus'] = {id:'plus',up:'minus',down:null,left:null,right:'equals'};
    elementInRegion[calcName + '-' + region + '-remainder'] = { id: 'remainder', up: null, down: 'sqrt', left: 'divide', right: null };
    elementInRegion[calcName + '-' + region + '-sqrt'] = { id: 'sqrt', up: 'remainder', down: 'sign', left: 'multiply', right: null };
    elementInRegion[calcName + '-' + region + '-sign'] = { id: 'sign', up: 'sqrt', down: 'equals', left: 'minus', right: null };
    elementInRegion[calcName + '-' + region + '-equals'] = {id:'equals',up:'sign',down:null,left:'plus',right:null};
}

/*
    Add elements for advancedFunction region
    calcName: calc mode name
    region:   region name
*/
function addAdvancedFunctionElements(calcName, region)
{
    elementInRegion[calcName + '-' + region + '-default'] = { id: 'leftbracket', up: null, down: 'sin', left: null, right: 'rightbracket' };
    elementInRegion[calcName + '-' + region + '-leftbracket'] = { id: 'leftbracket', up: null, down: 'sin', left: null, right: 'rightbracket' };
    elementInRegion[calcName + '-' + region + '-sin'] = { id: 'sin', up: 'leftbracket', down: 'tan', left: null, right: 'cos' };
    elementInRegion[calcName + '-' + region + '-tan'] = { id: 'tan', up: 'sin', down: 'ln', left: null, right: 'exp' };
    elementInRegion[calcName + '-' + region + '-ln'] = { id: 'ln', up: 'tan', down: 'factorial', left: null, right: 'log' };
    elementInRegion[calcName + '-' + region + '-factorial'] = { id: 'factorial', up: 'ln', down: 'xpowery', left: null, right: 'reciprocal' };
    elementInRegion[calcName + '-' + region + '-xpowery'] = { id: 'xpowery', up: 'factorial', down: 'xcube', left: null, right: 'xsquare' };
    elementInRegion[calcName + '-' + region + '-xcube'] = { id: 'xcube', up: 'xpowery', down: 'abs', left: null, right: 'pi' };
    
    elementInRegion[calcName + '-' + region + '-rightbracket'] = { id: 'rightbracket', up: null, down: 'cos', left: 'leftbracket', right: null };
    elementInRegion[calcName + '-' + region + '-cos'] = { id: 'cos', up: 'rightbracket', down: 'exp', left: 'sin', right: null };
    elementInRegion[calcName + '-' + region + '-exp'] = { id: 'exp', up: 'cos', down: 'log', left: 'tan', right: null };
    elementInRegion[calcName + '-' + region + '-log'] = { id: 'log', up: 'exp', down: 'reciprocal', left: 'ln', right: null };
    elementInRegion[calcName + '-' + region + '-reciprocal'] = { id: 'reciprocal', up: 'log', down: 'xsquare', left: 'factorial', right: null };
    elementInRegion[calcName + '-' + region + '-xsquare'] = { id: 'xsquare', up: 'reciprocal', down: 'pi', left: 'xpowery', right: null };
    elementInRegion[calcName + '-' + region + '-pi'] = { id: 'pi', up: 'xsquare', down: null, left: 'xcube', right: null };
    elementInRegion[calcName + '-' + region + '-abs'] = { id: 'abs', up: 'xcube', down: null, left: null, right: null };

}

/*
    Add elements for advancedFunction region with Inverse Trigonomitric Functions
    calcName: calc mode name
    region:   region name
*/
function addAdvancedInvFunctionElements(calcName, region) {
    elementInRegion[calcName + '-' + region + '-default'] = { id: 'leftbracket', up: null, down: 'sin', left: null, right: 'rightbracket' };
    elementInRegion[calcName + '-' + region + '-leftbracket'] = { id: 'leftbracket', up: null, down: 'sin', left: null, right: 'rightbracket' };
    elementInRegion[calcName + '-' + region + '-rightbracket'] = { id: 'rightbracket', up: null, down: 'asin', left: 'leftbracket', right: null };

    elementInRegion[calcName + '-' + region + '-sin'] = { id: 'sin', up: 'leftbracket', down: 'cos', left: null, right: 'asin' };
    elementInRegion[calcName + '-' + region + '-asin'] = { id: 'asin', up: 'rightbracket', down: 'acos', left: 'sin', right: null };

    elementInRegion[calcName + '-' + region + '-cos'] = { id: 'cos', up: 'sin', down: 'tan', left: null, right: 'acos' };
    elementInRegion[calcName + '-' + region + '-acos'] = { id: 'acos', up: 'asin', down: 'atan', left: 'cos', right: null };

    elementInRegion[calcName + '-' + region + '-tan'] = { id: 'tan', up: 'cos', down: 'exp', left: null, right: 'atan' };
    elementInRegion[calcName + '-' + region + '-atan'] = { id: 'atan', up: 'acos', down: 'ln', left: 'tan', right: null };

    elementInRegion[calcName + '-' + region + '-exp'] = { id: 'exp', up: 'tan', down: 'log', left: null, right: 'ln' };
    elementInRegion[calcName + '-' + region + '-ln'] = { id: 'ln', up: 'atan', down: 'factorial', left: 'exp', right: null };

    elementInRegion[calcName + '-' + region + '-log'] = { id: 'log', up: 'exp', down: 'reciprocal', left: null, right: 'factorial' };
    elementInRegion[calcName + '-' + region + '-factorial'] = { id: 'factorial', up: 'ln', down: 'xpowery', left: 'log', right: null };

    elementInRegion[calcName + '-' + region + '-reciprocal'] = { id: 'reciprocal', up: 'log', down: 'xsquare', left: null, right: 'xpowery' };
    elementInRegion[calcName + '-' + region + '-xpowery'] = { id: 'xpowery', up: 'factorial', down: 'xcube', left: 'reciprocal', right: null };

    elementInRegion[calcName + '-' + region + '-xsquare'] = { id: 'xsquare', up: 'reciprocal', down: 'pi', left: null, right: 'xcube' };
    elementInRegion[calcName + '-' + region + '-xcube'] = { id: 'xcube', up: 'xpowery', down: 'abs', left: 'xsquare', right: null };

    elementInRegion[calcName + '-' + region + '-pi'] = { id: 'pi', up: 'xsquare', down: null, left: null, right: 'abs' };
    elementInRegion[calcName + '-' + region + '-abs'] = { id: 'abs', up: 'xcube', down: null, left: 'pi', right: null };
}

/*
    Add elements for modes region
    calcName: calc mode name
    region:   region name
*/
function addModesElements(calcName, region)
{
    elementInRegion[calcName + '-' + region + '-default'] = {id:'degrees',up:null,down:'radians',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-degrees'] = {id:'degrees',up:null,down:'radians',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-radians'] = {id:'radians',up:'degrees',down:null,left:null,right:null};

}
/*
    Create element map for basic calc
    calcName: calc mode name
    regionDivs:   list of regions for this calc
*/
function initBasicShortCut(calcName, regionDivs)
{
    addCalcControlElements(calcName, regionDivs[0], true, true);
    addNumberPadElements(calcName, regionDivs[1]);
    addBasicFunctionElements(calcName, regionDivs[2], ['divide','multiply','minus','plus','equals']);
}

/*
    Create element map for standard calc
    calcName: calc mode name
    regionDivs:   list of regions for this calc
*/
function initStandardShortCut(calcName, regionDivs)
{
    addCalcControlElements(calcName, regionDivs[0], true, true);
    addMemLogicElements(calcName, regionDivs[1], false);
    addNumberPadElements(calcName, regionDivs[2]);
    addStandardBasicFunctionElemnts(calcName, regionDivs[3]);
}


/*
    Create element map for standardmem calc
    calcName: calc mode name
    regionDivs:   list of regions for this calc
*/
function initStandardMemShortCut(calcName, regionDivs)
{
    addCalcControlElements(calcName, regionDivs[0], true, true);
    addStandardMemLogicElements(calcName, regionDivs[1], false);
    addNumberPadElements(calcName, regionDivs[2]);
    addStandardBasicFunctionElemnts(calcName, regionDivs[3]);
}

/*
    Create element map for Scientific calc
    calcName: calc mode name
    regionDivs:   list of regions for this calc
*/
function initScientificShortCut(calcName, regionDivs)
{
    addCalcControlElements(calcName, regionDivs[0], true, true);
    addMemLogicElements(calcName, regionDivs[1], false);
    if (calcName == 'ScientificInv') {
        addAdvancedInvFunctionElements(calcName, regionDivs[2]);
    }
    else {
        addAdvancedFunctionElements(calcName, regionDivs[2]);
    }
    addNumberPadElements(calcName, regionDivs[3]);
    addModesElements(calcName, regionDivs[4]);
    addBasicFunctionElements(calcName, regionDivs[5], ['divide', 'multiply', 'sqrt', 'minus', 'sign', 'plus', 'equals']);
}

/*
    Create element map for Regression calc
    calcName: calc mode name
    regionDivs:   list of regions for this calc
*/
function initRegressionsShortCut(calcName, regionDivs)
{
    addCalcControlElements(calcName, regionDivs[0], false, false, true);
    addNumberPadElements(calcName, regionDivs[1]);
    addBasicFunctionElements(calcName, regionDivs[2], ['sign']);
    addLinearColumElements(calcName, regionDivs[3], ['Linear','Quadratic', 'Exponential', 'Power', 'regclearall']);

    //the dfault for regression input, others by program
    elementInRegion[calcName + '-yNumb-default'] = {id:'reg-X-1',up:null,down:null,left:null,right:null};
    //use JS code to control rest of nativation
}

/*
    Create element map for Matrices calc
    calcName: calc mode name
    regionDivs:   list of regions for this calc
*/
function initMatricesShortCut(calcName, regionDivs)
{
    addCalcControlElements(calcName, regionDivs[0], true, false, true);
    //() and Inv
    elementInRegion['Matrices-advancedFunctions-default'] = {id:'leftbracket',up:null,down:null,left:null,right:'rightbracket'};
    elementInRegion['Matrices-advancedFunctions-leftbracket'] = {id:'leftbracket',up:null,down:null,left:null,right:'rightbracket'};
    elementInRegion['Matrices-advancedFunctions-rightbracket'] = {id:'rightbracket',up:null,down:null,left:'leftbracket',right:'inv'};
    elementInRegion['Matrices-advancedFunctions-inv'] = {id:'inv',up:null,down:null,left:'rightbracket',right:'det'};
    elementInRegion['Matrices-advancedFunctions-det'] = { id: 'det', up: null, down: null, left: 'inv', right: 't' };
    elementInRegion['Matrices-advancedFunctions-t'] = { id: 't', up: null, down: null, left: 'det', right: null };

    addNumberPadElements(calcName, regionDivs[2]);
    addBasicFunctionElements(calcName, regionDivs[3], ['multiply', 'minus', 'sign', 'plus']);
    addLinearColumElements(calcName, regionDivs[4], ['inputM1','inputM2', 'inputM3','inputM4', 'inputM5']);
    addLinearColumElements(calcName, regionDivs[5], ['M1','M2', 'M3','M4', 'M5']);
}

/*
    Create element map for Graphing calc
    calcName: calc mode name
    regionDivs:   list of regions for this calc
*/
function initGraphingShortCut(calcName, regionDivs)
{

    addCalcControlElements(calcName, regionDivs[0], false, false, true);
    addMemLogicElements(calcName, regionDivs[1], true, true);
    if (calcName == 'GraphingInv') {
        addAdvancedInvFunctionElements(calcName, regionDivs[2]);
    } else {
        addAdvancedFunctionElements(calcName, regionDivs[2]);
    }
    addNumberPadElements(calcName,regionDivs[3]);
    addModesElements(calcName,regionDivs[4]);
    addBasicFunctionElements(calcName, regionDivs[5], ['divide', 'multiply', 'sqrt', 'minus', 'sign', 'plus', 'equals']);

    var region = 'graphmodes';
    elementInRegion[calcName + '-' + region + '-default'] = {id:'yequalview',up:null,down:null,left:null,right:null};
    elementInRegion[calcName + '-' + region + '-yequalview'] = {id:'yequalview',up:null,down:null,left:null,right:'windowview'};
    elementInRegion[calcName + '-' + region + '-windowview'] = {id:'windowview',up:null,down:null,left:'yequalview',right:'tableview'};
    elementInRegion[calcName + '-' + region + '-tableview'] = {id:'tableview',up:null,down:null,left:'windowview',right:'graphview'};
    elementInRegion[calcName + '-' + region + '-graphview'] = {id:'graphview',up:null,down:null,left:'tableview',right:null};

    region = 'yequalview';
    elementInRegion[calcName + '-' + region + '-default'] = {id:'equa1',up:null,down:null,left:'tableview',right:null};
    elementInRegion[calcName + '-' + region + '-equations-select-1'] = {id:'equations-select-1',up:null,down:'equa1',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-equa1'] = {id:'equa1',up:'equations-select-1',down:'equations-select-2',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-equations-select-2'] = {id:'equations-select-2',up:'equa1',down:'equa2',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-equa2'] = {id:'equa2',up:'equations-select-2',down:'equations-select-3',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-equations-select-3'] = {id:'equations-select-3',up:'equa2',down:'equa3',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-equa3'] = {id:'equa3',up:'equations-select-3',down:'equations-select-4',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-equations-select-4'] = {id:'equations-select-4',up:'equa3',down:'equa4',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-equa4'] = {id:'equa4',up:'equations-select-4',down:'resetgraph',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-resetgraph'] = {id:'resetgraph',up:'equa4',down:null,left:null,right:null};

    region = 'windowview';
    elementInRegion[calcName + '-' + region + '-default'] = {id:'xmin',up:null,down:'xmax',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-xmin'] = {id:'xmin',up:null,down:'xmax',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-xmax'] = { id: 'xmax', up: 'xmin', down: 'xscale', left: null, right: null };
    elementInRegion[calcName + '-' + region + '-xscale'] = { id: 'xscale', up: 'xmax', down: 'ymin', left: null, right: null };
    elementInRegion[calcName + '-' + region + '-ymin'] = { id: 'ymin', up: 'xscale', down: 'ymax', left: null, right: null };
    elementInRegion[calcName + '-' + region + '-ymax'] = { id: 'ymax', up: 'ymin', down: 'yscale', left: null, right: null };
    elementInRegion[calcName + '-' + region + '-yscale'] = { id: 'yscale', up: 'ymax', down: 'tracestepsize', left: null, right: null };
    elementInRegion[calcName + '-' + region + '-tracestepsize'] = { id: 'tracestepsize', up: 'yscale', down: 'resetgraph', left: null, right: null };
    //elementInRegion[calcName + '-' + region + '-zoomlevel'] = {id:'xmin',up:'tracestepsize',down:'xscale',left:null,right:null};
    elementInRegion[calcName + '-' + region + '-resetgraph'] = { id: 'resetgraph', up: 'tracestepsize', down: null, left: null, right: null };

    region = 'tableview';
    elementInRegion[calcName + '-' + region + '-default'] = {id:'initX',up:null,down:'previous5',left:null,right:'applytb'};
    elementInRegion[calcName + '-' + region + '-initX'] = {id:'initX',up:null,down:'previous5',left:null,right:'applytb'};
    elementInRegion[calcName + '-' + region + '-applytb'] = {id:'applytb',up:null,down:'previous5',left:'initX',right:null};
    elementInRegion[calcName + '-' + region + '-previous5'] = {id:'previous5',up:'initX',down:null,left:null,right:'next5'};
    elementInRegion[calcName + '-' + region + '-next5'] = {id:'next5',up:'initX',down:null,left:'previous5',right:'resetgraph'};
    elementInRegion[calcName + '-' + region + '-resetgraph'] = {id:'resetgraph',up:'initX',down:null,left:'next5',right:null};

    region = 'graphview';

    elementInRegion[calcName + '-' + region + '-default'] = { id: 'left', up: 'up', down: 'down', left: null, right: 'right' };
    elementInRegion[calcName + '-' + region + '-toggleScroll'] = { id: 'toggleScroll', up: 'left', down: 'calczoomin', left: null, right: 'toggleTrace' };
    elementInRegion[calcName + '-' + region + '-toggleTrace'] = { id: 'toggleTrace', up: 'left', down: 'calczoomin', left: 'toggleScroll', right: null };
    elementInRegion[calcName + '-' + region + '-calczoomin'] = { id: 'calczoomin', up: 'toggleScroll', down: null, left: null, right: 'calczoomout' };
    elementInRegion[calcName + '-' + region + '-calczoomout'] = { id: 'calczoomout', up: 'toggleScroll', down: null, left: 'calczoomin', right: 'resetgraph' };
    elementInRegion[calcName + '-' + region + '-resetgraph'] = { id: 'resetgraph', up: 'toggleScroll', down: null, left: 'calczoomout', right: null };
    elementInRegion[calcName + '-' + region + '-left'] = {id:'left',up:'up',down:'down',left:null,right:'right'};
    elementInRegion[calcName + '-' + region + '-right'] = {id:'right',up:'up',down:'down',left:'left',right:null};
    elementInRegion[calcName + '-' + region + '-up'] = {id:'up',up:null,down:'down',left:'left',right:'right'};
    elementInRegion[calcName + '-' + region + '-down'] = { id: 'down', up: 'up', down: 'toggleScroll', left: 'left', right: 'right' };

}

/* Set short cut key current position to the text field clicked
    type: 
*/

function setCurRegionElementById(type, id) {

    var calc = getTDSCalc();
    
    if ((getCurCalcMode() == 'Matrices') && (type == 'input')) 
    {
        if (id != 'textinput') {
            calc.keyboardNav.curRegion = 'matrixArea';
            calc.keyboardNav.RegionIndex = getRegionIndexByDivName('matrixArea');
            calc.keyboardNav.curElement = id;
        }      
    } else 
    
    if ((getCurCalcMode() == 'Regression') && (type == 'input')) 
    {
        calc.keyboardNav.curRegion = 'yNumb';
        calc.keyboardNav.RegionIndex = getRegionIndexByDivName('yNumb');
        calc.keyboardNav.curElement = id;    
    }
    
//    else
//    
//    if (type == 'button')
//    {
//        var regionDiv = getRegionDivById(id); //'numberPad'; 
//        calc.keyboardNav.curRegion = regionDiv;
//        calc.keyboardNav.RegionIndex = getRegionIndexByDivName(regionDiv);
//        calc.keyboardNav.curElement = id;
//    }
}

function getRegionIndexByDivName(divName)
{
    for (var i=0; i<getRegionDivsByMode(getCurCalcMode()).length; i++) 
    {
        if (getRegionDivsByMode(getCurCalcMode())[i] == divName ) {
            return i;
        }
    } 
}
 
function getRegionDivById(id) //id is element id
{
    for (var i=0; i<getRegionDivsByMode(getCurCalcMode()).length; i++) 
    {
        var elID = getCurCalcMode()+'-'+ getRegionDivsByMode(getCurCalcMode())[i] + '-' + id;
        if (elementInRegion[elID] != null)
            return getRegionDivsByMode(getCurCalcMode())[i];
    }
}

var ButtonAttributeMap = [];

//number Pad
ButtonAttributeMap.push({id: 'num0', group: 'numberPad', func: buttonPressed, val: '0', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'num1', group: 'numberPad', func: buttonPressed, val: '1', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'num2', group: 'numberPad', func: buttonPressed, val: '2', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'num3', group: 'numberPad', func: buttonPressed, val: '3', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'num4', group: 'numberPad', func: buttonPressed, val: '4', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'num5', group: 'numberPad', func: buttonPressed, val: '5', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'num6', group: 'numberPad', func: buttonPressed, val: '6', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'num7', group: 'numberPad', func: buttonPressed, val: '7', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'num8', group: 'numberPad', func: buttonPressed, val: '8', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'num9', group: 'numberPad', func: buttonPressed, val: '9', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'dot', group: 'numberPad', func: buttonPressed, val: '.', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'leftbracket', group: 'numberPad', func: buttonPressed, val: '(', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'rightbracket', group: 'numberPad', func: buttonPressed, val: ')', op: false, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'variable', group: 'numberPad', func: buttonPressed, val: 'x', op: false, numOprands: '2', onePos: '', clearExistingInput: false});

//operators
ButtonAttributeMap.push({id: 'divide', group: 'advancedFunctions', func: buttonPressed, val: '/', op: true, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'multiply', group: 'advancedFunctions', func: buttonPressed, val: '*', op: true, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'minus', group: 'advancedFunctions', func: buttonPressed, val: '-', op: true, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'plus', group: 'advancedFunctions', func: buttonPressed, val: '+', op: true, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'sign', group: 'advancedFunctions', func: buttonPressed, val: '', op: false, numOprands: '', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'sqrt', group: 'advancedFunctions', func: buttonPressed, val: '√(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});
//ButtonAttributeMap.push({id: 'squareroot', group: 'advancedFunctions', func: buttonPressed, val: 'sqrt(', op: true, numOprands: '1', onePos: '0'});
//ButtonAttributeMap.push({id: 'squareroot2', group: 'advancedFunctions', func: buttonPressed, val: 'sqrt(', op: true, numOprands: '1', onePos: '0'});

ButtonAttributeMap.push({id: 'remainder', group: 'advancedFunctions', func: buttonPressed, val: '%', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});

ButtonAttributeMap.push({id: 'equals', group: 'advancedFunctions', func: doCalcButtonPressed, val: '=', op: false, numOprands: '', onePos: ''});
ButtonAttributeMap.push({id: 'inv', group: 'advancedFunctions', func: buttonPressed, val: 'Inv(', op: false, numOprands: '', onePos: ''});
ButtonAttributeMap.push({ id: 'det', group: 'advancedFunctions', func: buttonPressed, val: 'Det(', op: false, numOprands: '', onePos: '' });
ButtonAttributeMap.push({ id: 't', group: 'advancedFunctions', func: buttonPressed, val: 'T(', op: false, numOprands: '', onePos: '' });

ButtonAttributeMap.push({id: 'sin', group: 'advancedFunctions', func: buttonPressed, val: 'sin(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});
ButtonAttributeMap.push({id: 'asin', group: 'advancedFunctions', func: buttonPressed, val: 'sin^-1(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false });
ButtonAttributeMap.push({id: 'cos', group: 'advancedFunctions', func: buttonPressed, val: 'cos(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});
ButtonAttributeMap.push({ id: 'acos', group: 'advancedFunctions', func: buttonPressed, val: 'cos^-1(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false });
ButtonAttributeMap.push({id: 'tan', group: 'advancedFunctions', func: buttonPressed, val: 'tan(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false });
ButtonAttributeMap.push({ id: 'atan', group: 'advancedFunctions', func: buttonPressed, val: 'tan^-1(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false });
ButtonAttributeMap.push({id: 'exp', group: 'advancedFunctions', func: buttonPressed, val: 'exp(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});
ButtonAttributeMap.push({id: 'log', group: 'advancedFunctions', func: buttonPressed, val: 'log(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});
ButtonAttributeMap.push({id: 'pow', group: 'advancedFunctions', func: buttonPressed, val: 'pow(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});
ButtonAttributeMap.push({id: 'ln', group: 'advancedFunctions', func: buttonPressed, val: 'ln(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});
ButtonAttributeMap.push({id: 'factorial', group: 'advancedFunctions', func: buttonPressed, val: '!', op: true, numOprands: '1', onePos: '1', clearExistingInput: false});
ButtonAttributeMap.push({id: 'reciprocal', group: 'advancedFunctions', func: buttonPressed, val: '^-1', op: true, numOprands: '1', onePos: '1', clearExistingInput: false});
ButtonAttributeMap.push({id: 'xsquare', group: 'advancedFunctions', func: buttonPressed, val: '^2', op: true, numOprands: '1', onePos: '1', clearExistingInput: false});
ButtonAttributeMap.push({id: 'xcube', group: 'advancedFunctions', func: buttonPressed, val: '^3', op: true, numOprands: '1', onePos: '1', clearExistingInput: false});
ButtonAttributeMap.push({id: 'xpowery', group: 'advancedFunctions', func: buttonPressed, val: '^', op: true, numOprands: '1', onePos: '1', clearExistingInput: false});
ButtonAttributeMap.push({id: 'pi', group: 'advancedFunctions', func: buttonPressed, val: 'π', op: false, numOprands: '0', onePos: '1', clearExistingInput: false});
ButtonAttributeMap.push({id: 'abs', group: 'advancedFunctions', func: buttonPressed, val: 'abs(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});

ButtonAttributeMap.push({id: 'memoryC', group: 'memory', func: memButtonPressed, val: '', op: false, numOprands: '0', onePos: '0'});
ButtonAttributeMap.push({id: 'memoryS', group: 'memory', func: memButtonPressed, val: '', op: false, numOprands: '0', onePos: '0'});
ButtonAttributeMap.push({id: 'memoryR', group: 'memory', func: memButtonPressed, val: '', op: false, numOprands: '0', onePos: '0'});
ButtonAttributeMap.push({id: 'memory+', group: 'memory', func: memButtonPressed, val: '', op: false, numOprands: '0', onePos: '0'});
ButtonAttributeMap.push({id: 'STO', group: 'memory', func: memButtonPressed, val: '', op: false, numOprands: '0', onePos: '0'});
ButtonAttributeMap.push({id: 'RCL', group: 'memory', func: memButtonPressed, val: '', op: false, numOprands: '0', onePos: '0'});

//'=' button is pressed
function doCalcButtonPressed(e)
{
    //delegate to current calc's doCalcuation function. This is an arithmetic calculation
    getWorkingCalcInstance().doCalculation();
}

// Button is pressed
function buttonPressed(e)
{
    if (typeof(e) == 'object') clearkeyFocus();
    getWorkingCalcInstance().buttonPressProcess(e);
}

/** invoked while squre root button's childElement without an id was clicked, will create a new event of click on the squreroot button.
  * when click happens on the blank <span> of sqrt button, target will not be recognizible
  * this function will stop the click event and create a new click on parent Element of <span>, which is the sqrt button.
  */
function squareRootSubPressed(target, e) {
    EventUtils.stopPropagation(e);
    EventUtils.preventDefault(e);

    target.parentElement.click();
    return false;
}

//squre root button is pressed. It is handled separately due to complex sqrt root html.
//todo: use only the buttonPressed handler in the future.
//https://bugz.airws.org/default.asp?65824#321831
function squareRootPressed(e)
{
    buttonPressed(e);
}

// Memory function
var memoryValue;
function memButtonPressed(e) {
    var id;
    if (typeof(e) == 'object') 
    {
        var target = YAHOO.util.Event.getTarget(e);
        id = target.id;
    } else {
        id = e;
    }
    var inputarea = getWorkingCalcInstance().getInputArea();
    switch (id) {
        case 'memoryC':
            document.getElementById("memorystatusStandard").value = "";
            memoryValue = "";

            break;

        case 'memoryR': case 'RCL':
            if (inputarea == null) return;
            if (memoryValue.length>0) {
            
                if (getWorkingCalcInstance().lazyEvaluation) {
                    inputarea.value += memoryValue;
                } else {
                    inputarea.value = memoryValue;
                }

            }
            break;            

        case 'memoryS': case 'STO':
            if (inputarea == null) return;
            if (inputarea.value.length > 0) {
                var value = getWorkingCalcInstance().parent.evalExpression(inputarea.value) + '';
                if (!isValidNumber(value)) break;
                memoryValue = value;

                document.getElementById("memorystatus").value = "M";  
                document.getElementById("memorystatusStandard").value = "M";
                  
                var RCLBtn = document.getElementById("RCL");
                if (YAHOO.util.Dom.hasClass(RCLBtn, 'disabled')) YAHOO.util.Dom.removeClass(RCLBtn, 'disabled');
                RCLBtn.removeAttribute('disabled');
            }
            break;
            
        case 'memory+':
            if (inputarea == null) return;
            var previous = 0;
            if (memoryValue.length >0) previous = parseFloat(memoryValue);
            var current = 0;
            if (inputarea.value.length > 0) {
                var value = getWorkingCalcInstance().parent.evalExpression(inputarea.value) + '';
                //if (isNaN(value)) break;
                if (!isValidNumber(value)) break;
                current = parseFloat(value);
            }
            memoryValue = '' + (previous + current);
            document.getElementById("memorystatusStandard").value = "M";

            break;  
    }
}