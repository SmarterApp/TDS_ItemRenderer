/*
Copyright (c) 2015, American Institutes for Research. All rights reserved.
GENERATED: 5/22/2015 11:29:14 AM
MACHINE: DC1KHANMOLT
*/

/* SOURCE FILE: tds_calc_config.js (957814d1) 1/26/2015 1:19:44 PM */

var CalcType = {
arithmetic: 'Arithmetic',
graphing: 'Graphing',
regression: 'Regression',
linearalgebra: 'Matrices'
}
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
var CalcConfigBase =
[
{
name: CalcModeList['Basic'], displayName: 'Basic', type: CalcType.arithmetic, lazyEvaluation: false, css: 'basic4',
keyboardRegionDivs: ['calcClear', 'numberPad', 'basicFunctions'],
shortcutInitFunc: initBasicShortCut,
textInputLen: [{id: 'textinput', len: 24}]
},
{
name: CalcModeList['Standard'],displayName: 'Standard', type: CalcType.arithmetic,lazyEvaluation: false, css: 'basic6',
keyboardRegionDivs: ['calcClear', 'memLogic', 'numberPad', 'basicFunctions'],
shortcutInitFunc: initStandardShortCut,
textInputLen: [{id: 'textinput', len: 24}]
},
{
name: CalcModeList['StandardMem'],displayName: 'Standard', type: CalcType.arithmetic,lazyEvaluation: false, css: 'basicMem6',
keyboardRegionDivs: ['calcClear', 'memLogicStandard', 'numberPad', 'basicFunctions'],
shortcutInitFunc: initStandardMemShortCut,
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
textInputLen: [{id: 'textinput', len: 36}, {id:'Any', len: 9}]
}
];
function getRegionDivsByMode(mode)
{
for (var i=0; i<CalcConfigBase.length; i++)
if (CalcConfigBase[i].name == mode) return CalcConfigBase[i].keyboardRegionDivs;
return null;
}
var elementInRegion = [];
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
function addStandardMemLogicElements(calcName, region) {
elementInRegion[calcName + '-' + region + '-default'] = {id:'memoryC',up:null,down:'memoryR',left:null,right:null};
elementInRegion[calcName + '-' + region + '-memoryC'] = {id:'memoryC',up:null,down:'memoryR',left:null,right:null};
elementInRegion[calcName + '-' + region + '-memoryR'] = {id:'memoryR',up:'memoryC',down:'memoryS',left:null,right:null};
elementInRegion[calcName + '-' + region + '-memoryS'] = {id:'memoryS',up:'memoryR',down:'memory+',left:null,right:null};
elementInRegion[calcName + '-' + region + '-memory+'] = {id:'memoryS',up:'memoryS',down:null,left:null,right:null};
}
function addBasicFunctionElements(calcName, region, elements)
{
addLinearColumElements(calcName, region, elements);
}
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
function addModesElements(calcName, region)
{
elementInRegion[calcName + '-' + region + '-default'] = {id:'degrees',up:null,down:'radians',left:null,right:null};
elementInRegion[calcName + '-' + region + '-degrees'] = {id:'degrees',up:null,down:'radians',left:null,right:null};
elementInRegion[calcName + '-' + region + '-radians'] = {id:'radians',up:'degrees',down:null,left:null,right:null};
}
function initBasicShortCut(calcName, regionDivs)
{
addCalcControlElements(calcName, regionDivs[0], true, true);
addNumberPadElements(calcName, regionDivs[1]);
addBasicFunctionElements(calcName, regionDivs[2], ['divide','multiply','minus','plus','equals']);
}
function initStandardShortCut(calcName, regionDivs)
{
addCalcControlElements(calcName, regionDivs[0], true, true);
addMemLogicElements(calcName, regionDivs[1], false);
addNumberPadElements(calcName, regionDivs[2]);
addStandardBasicFunctionElemnts(calcName, regionDivs[3]);
}
function initStandardMemShortCut(calcName, regionDivs)
{
addCalcControlElements(calcName, regionDivs[0], true, true);
addStandardMemLogicElements(calcName, regionDivs[1], false);
addNumberPadElements(calcName, regionDivs[2]);
addStandardBasicFunctionElemnts(calcName, regionDivs[3]);
}
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
function initRegressionsShortCut(calcName, regionDivs)
{
addCalcControlElements(calcName, regionDivs[0], false, false, true);
addNumberPadElements(calcName, regionDivs[1]);
addBasicFunctionElements(calcName, regionDivs[2], ['sign']);
addLinearColumElements(calcName, regionDivs[3], ['Linear','Quadratic', 'Exponential', 'Power', 'regclearall']);
elementInRegion[calcName + '-yNumb-default'] = {id:'reg-X-1',up:null,down:null,left:null,right:null};
}
function initMatricesShortCut(calcName, regionDivs)
{
addCalcControlElements(calcName, regionDivs[0], true, false, true);
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
function getRegionDivById(id)
{
for (var i=0; i<getRegionDivsByMode(getCurCalcMode()).length; i++)
{
var elID = getCurCalcMode()+'-'+ getRegionDivsByMode(getCurCalcMode())[i] + '-' + id;
if (elementInRegion[elID] != null)
return getRegionDivsByMode(getCurCalcMode())[i];
}
}
var ButtonAttributeMap = [];
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
ButtonAttributeMap.push({id: 'divide', group: 'advancedFunctions', func: buttonPressed, val: '/', op: true, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'multiply', group: 'advancedFunctions', func: buttonPressed, val: '*', op: true, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'minus', group: 'advancedFunctions', func: buttonPressed, val: '-', op: true, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'plus', group: 'advancedFunctions', func: buttonPressed, val: '+', op: true, numOprands: '2', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'sign', group: 'advancedFunctions', func: buttonPressed, val: '', op: false, numOprands: '', onePos: '', clearExistingInput: false});
ButtonAttributeMap.push({id: 'sqrt', group: 'advancedFunctions', func: buttonPressed, val: '√(', op: true, numOprands: '1', onePos: '0', clearExistingInput: false});
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
function doCalcButtonPressed(e)
{
getWorkingCalcInstance().doCalculation();
}
function buttonPressed(e)
{
if (typeof(e) == 'object') clearkeyFocus();
getWorkingCalcInstance().buttonPressProcess(e);
}
function squareRootSubPressed(target, e) {
EventUtils.stopPropagation(e);
EventUtils.preventDefault(e);
target.parentElement.click();
return false;
}
function squareRootPressed(e)
{
buttonPressed(e);
}
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
if (!isValidNumber(value)) break;
current = parseFloat(value);
}
memoryValue = '' + (previous + current);
document.getElementById("memorystatusStandard").value = "M";
break;
}
}

/* SOURCE FILE: sylvester.src.js (91f882fc) 1/26/2015 1:19:44 PM */

var Sylvester = {
version: '0.1.3',
precision: 1e-6
};
function Vector() {}
Vector.prototype = {
e: function(i) {
return (i < 1 || i > this.elements.length) ? null : this.elements[i-1];
},
dimensions: function() {
return this.elements.length;
},
modulus: function() {
return Math.sqrt(this.dot(this));
},
eql: function(vector) {
var n = this.elements.length;
var V = vector.elements || vector;
if (n != V.length) { return false; }
do {
if (Math.abs(this.elements[n-1] - V[n-1]) > Sylvester.precision) { return false; }
} while (--n);
return true;
},
dup: function() {
return Vector.create(this.elements);
},
map: function(fn) {
var elements = [];
this.each(function(x, i) {
elements.push(fn(x, i));
});
return Vector.create(elements);
},
each: function(fn) {
var n = this.elements.length, k = n, i;
do { i = k - n;
fn(this.elements[i], i+1);
} while (--n);
},
toUnitVector: function() {
var r = this.modulus();
if (r === 0) { return this.dup(); }
return this.map(function(x) { return x/r; });
},
angleFrom: function(vector) {
var V = vector.elements || vector;
var n = this.elements.length, k = n, i;
if (n != V.length) { return null; }
var dot = 0, mod1 = 0, mod2 = 0;
this.each(function(x, i) {
dot += x * V[i-1];
mod1 += x * x;
mod2 += V[i-1] * V[i-1];
});
mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
if (mod1*mod2 === 0) { return null; }
var theta = dot / (mod1*mod2);
if (theta < -1) { theta = -1; }
if (theta > 1) { theta = 1; }
return Math.acos(theta);
},
isParallelTo: function(vector) {
var angle = this.angleFrom(vector);
return (angle === null) ? null : (angle <= Sylvester.precision);
},
isAntiparallelTo: function(vector) {
var angle = this.angleFrom(vector);
return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
},
isPerpendicularTo: function(vector) {
var dot = this.dot(vector);
return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
},
add: function(vector) {
var V = vector.elements || vector;
if (this.elements.length != V.length) { return null; }
return this.map(function(x, i) { return x + V[i-1]; });
},
subtract: function(vector) {
var V = vector.elements || vector;
if (this.elements.length != V.length) { return null; }
return this.map(function(x, i) { return x - V[i-1]; });
},
multiply: function(k) {
return this.map(function(x) { return x*k; });
},
x: function(k) { return this.multiply(k); },
dot: function(vector) {
var V = vector.elements || vector;
var i, product = 0, n = this.elements.length;
if (n != V.length) { return null; }
do { product += this.elements[n-1] * V[n-1]; } while (--n);
return product;
},
cross: function(vector) {
var B = vector.elements || vector;
if (this.elements.length != 3 || B.length != 3) { return null; }
var A = this.elements;
return Vector.create([
(A[1] * B[2]) - (A[2] * B[1]),
(A[2] * B[0]) - (A[0] * B[2]),
(A[0] * B[1]) - (A[1] * B[0])
]);
},
max: function() {
var m = 0, n = this.elements.length, k = n, i;
do { i = k - n;
if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
} while (--n);
return m;
},
indexOf: function(x) {
var index = null, n = this.elements.length, k = n, i;
do { i = k - n;
if (index === null && this.elements[i] == x) {
index = i + 1;
}
} while (--n);
return index;
},
toDiagonalMatrix: function() {
return Matrix.Diagonal(this.elements);
},
round: function() {
return this.map(function(x) { return Math.round(x); });
},
snapTo: function(x) {
return this.map(function(y) {
return (Math.abs(y - x) <= Sylvester.precision) ? x : y;
});
},
distanceFrom: function(obj) {
if (obj.anchor) { return obj.distanceFrom(this); }
var V = obj.elements || obj;
if (V.length != this.elements.length) { return null; }
var sum = 0, part;
this.each(function(x, i) {
part = x - V[i-1];
sum += part * part;
});
return Math.sqrt(sum);
},
liesOn: function(line) {
return line.contains(this);
},
liesIn: function(plane) {
return plane.contains(this);
},
rotate: function(t, obj) {
var V, R, x, y, z;
switch (this.elements.length) {
case 2:
V = obj.elements || obj;
if (V.length != 2) { return null; }
R = Matrix.Rotation(t).elements;
x = this.elements[0] - V[0];
y = this.elements[1] - V[1];
return Vector.create([
V[0] + R[0][0] * x + R[0][1] * y,
V[1] + R[1][0] * x + R[1][1] * y
]);
break;
case 3:
if (!obj.direction) { return null; }
var C = obj.pointClosestTo(this).elements;
R = Matrix.Rotation(t, obj.direction).elements;
x = this.elements[0] - C[0];
y = this.elements[1] - C[1];
z = this.elements[2] - C[2];
return Vector.create([
C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
]);
break;
default:
return null;
}
},
reflectionIn: function(obj) {
if (obj.anchor) {
var P = this.elements.slice();
var C = obj.pointClosestTo(P).elements;
return Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
} else {
var Q = obj.elements || obj;
if (this.elements.length != Q.length) { return null; }
return this.map(function(x, i) { return Q[i-1] + (Q[i-1] - x); });
}
},
to3D: function() {
var V = this.dup();
switch (V.elements.length) {
case 3: break;
case 2: V.elements.push(0); break;
default: return null;
}
return V;
},
inspect: function() {
return '[' + this.elements.join(', ') + ']';
},
setElements: function(els) {
this.elements = (els.elements || els).slice();
return this;
}
};
Vector.create = function(elements) {
var V = new Vector();
return V.setElements(elements);
};
Vector.i = Vector.create([1,0,0]);
Vector.j = Vector.create([0,1,0]);
Vector.k = Vector.create([0,0,1]);
Vector.Random = function(n) {
var elements = [];
do { elements.push(Math.random());
} while (--n);
return Vector.create(elements);
};
Vector.Zero = function(n) {
var elements = [];
do { elements.push(0);
} while (--n);
return Vector.create(elements);
};
function Matrix() {}
Matrix.prototype = {
e: function(i,j) {
if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
return this.elements[i-1][j-1];
},
row: function(i) {
if (i > this.elements.length) { return null; }
return Vector.create(this.elements[i-1]);
},
col: function(j) {
if (j > this.elements[0].length) { return null; }
var col = [], n = this.elements.length, k = n, i;
do { i = k - n;
col.push(this.elements[i][j-1]);
} while (--n);
return Vector.create(col);
},
dimensions: function() {
return {rows: this.elements.length, cols: this.elements[0].length};
},
rows: function() {
return this.elements.length;
},
cols: function() {
return this.elements[0].length;
},
eql: function(matrix) {
var M = matrix.elements || matrix;
if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
if (this.elements.length != M.length ||
this.elements[0].length != M[0].length) { return false; }
var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
do { i = ki - ni;
nj = kj;
do { j = kj - nj;
if (Math.abs(this.elements[i][j] - M[i][j]) > Sylvester.precision) { return false; }
} while (--nj);
} while (--ni);
return true;
},
dup: function() {
return Matrix.create(this.elements);
},
map: function(fn) {
var els = [], ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
do { i = ki - ni;
nj = kj;
els[i] = [];
do { j = kj - nj;
els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
} while (--nj);
} while (--ni);
return Matrix.create(els);
},
isSameSizeAs: function(matrix) {
var M = matrix.elements || matrix;
if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
return (this.elements.length == M.length &&
this.elements[0].length == M[0].length);
},
add: function(matrix) {
var M = matrix.elements || matrix;
if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
if (!this.isSameSizeAs(M)) { return null; }
return this.map(function(x, i, j) { return x + M[i-1][j-1]; });
},
subtract: function(matrix) {
var M = matrix.elements || matrix;
if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
if (!this.isSameSizeAs(M)) { return null; }
return this.map(function(x, i, j) { return x - M[i-1][j-1]; });
},
canMultiplyFromLeft: function(matrix) {
var M = matrix.elements || matrix;
if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
return (this.elements[0].length == M.length);
},
multiply: function(matrix) {
if (!matrix.elements) {
return this.map(function(x) { return x * matrix; });
}
var returnVector = matrix.modulus ? true : false;
var M = matrix.elements || matrix;
if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
if (!this.canMultiplyFromLeft(M)) { return null; }
var ni = this.elements.length, ki = ni, i, nj, kj = M[0].length, j;
var cols = this.elements[0].length, elements = [], sum, nc, c;
do { i = ki - ni;
elements[i] = [];
nj = kj;
do { j = kj - nj;
sum = 0;
nc = cols;
do { c = cols - nc;
sum += this.elements[i][c] * M[c][j];
} while (--nc);
elements[i][j] = sum;
} while (--nj);
} while (--ni);
var M = Matrix.create(elements);
return returnVector ? M.col(1) : M;
},
x: function(matrix) { return this.multiply(matrix); },
minor: function(a, b, c, d) {
var elements = [], ni = c, i, nj, j;
var rows = this.elements.length, cols = this.elements[0].length;
do { i = c - ni;
elements[i] = [];
nj = d;
do { j = d - nj;
elements[i][j] = this.elements[(a+i-1)%rows][(b+j-1)%cols];
} while (--nj);
} while (--ni);
return Matrix.create(elements);
},
transpose: function() {
var rows = this.elements.length, cols = this.elements[0].length;
var elements = [], ni = cols, i, nj, j;
do { i = cols - ni;
elements[i] = [];
nj = rows;
do { j = rows - nj;
elements[i][j] = this.elements[j][i];
} while (--nj);
} while (--ni);
return Matrix.create(elements);
},
isSquare: function() {
return (this.elements.length == this.elements[0].length);
},
max: function() {
var m = 0, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
do { i = ki - ni;
nj = kj;
do { j = kj - nj;
if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
} while (--nj);
} while (--ni);
return m;
},
indexOf: function(x) {
var index = null, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
do { i = ki - ni;
nj = kj;
do { j = kj - nj;
if (this.elements[i][j] == x) { return {i: i+1, j: j+1}; }
} while (--nj);
} while (--ni);
return null;
},
diagonal: function() {
if (!this.isSquare) { return null; }
var els = [], n = this.elements.length, k = n, i;
do { i = k - n;
els.push(this.elements[i][i]);
} while (--n);
return Vector.create(els);
},
toRightTriangular: function() {
var M = this.dup(), els;
var n = this.elements.length, k = n, i, np, kp = this.elements[0].length, p;
do { i = k - n;
if (M.elements[i][i] == 0) {
for (j = i + 1; j < k; j++) {
if (M.elements[j][i] != 0) {
els = []; np = kp;
do { p = kp - np;
els.push(M.elements[i][p] + M.elements[j][p]);
} while (--np);
M.elements[i] = els;
break;
}
}
}
if (M.elements[i][i] != 0) {
for (j = i + 1; j < k; j++) {
var multiplier = M.elements[j][i] / M.elements[i][i];
els = []; np = kp;
do { p = kp - np;
els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
} while (--np);
M.elements[j] = els;
}
}
} while (--n);
return M;
},
toUpperTriangular: function() { return this.toRightTriangular(); },
determinant: function() {
if (!this.isSquare()) { return null; }
var M = this.toRightTriangular();
var det = M.elements[0][0], n = M.elements.length - 1, k = n, i;
do { i = k - n + 1;
det = det * M.elements[i][i];
} while (--n);
return det;
},
det: function() { return this.determinant(); },
isSingular: function() {
return (this.isSquare() && this.determinant() === 0);
},
trace: function() {
if (!this.isSquare()) { return null; }
var tr = this.elements[0][0], n = this.elements.length - 1, k = n, i;
do { i = k - n + 1;
tr += this.elements[i][i];
} while (--n);
return tr;
},
tr: function() { return this.trace(); },
rank: function() {
var M = this.toRightTriangular(), rank = 0;
var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
do { i = ki - ni;
nj = kj;
do { j = kj - nj;
if (Math.abs(M.elements[i][j]) > Sylvester.precision) { rank++; break; }
} while (--nj);
} while (--ni);
return rank;
},
rk: function() { return this.rank(); },
augment: function(matrix) {
var M = matrix.elements || matrix;
if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
var T = this.dup(), cols = T.elements[0].length;
var ni = T.elements.length, ki = ni, i, nj, kj = M[0].length, j;
if (ni != M.length) { return null; }
do { i = ki - ni;
nj = kj;
do { j = kj - nj;
T.elements[i][cols + j] = M[i][j];
} while (--nj);
} while (--ni);
return T;
},
inverse: function() {
if (!this.isSquare() || this.isSingular()) { return null; }
var ni = this.elements.length, ki = ni, i, j;
var M = this.augment(Matrix.I(ni)).toRightTriangular();
var np, kp = M.elements[0].length, p, els, divisor;
var inverse_elements = [], new_element;
do { i = ni - 1;
els = []; np = kp;
inverse_elements[i] = [];
divisor = M.elements[i][i];
do { p = kp - np;
new_element = M.elements[i][p] / divisor;
els.push(new_element);
if (p >= ki) { inverse_elements[i].push(new_element); }
} while (--np);
M.elements[i] = els;
for (j = 0; j < i; j++) {
els = []; np = kp;
do { p = kp - np;
els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
} while (--np);
M.elements[j] = els;
}
} while (--ni);
return Matrix.create(inverse_elements);
},
inv: function() { return this.inverse(); },
round: function() {
return this.map(function(x) { return Math.round(x); });
},
snapTo: function(x) {
return this.map(function(p) {
return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
});
},
inspect: function() {
var matrix_rows = [];
var n = this.elements.length, k = n, i;
do { i = k - n;
matrix_rows.push(Vector.create(this.elements[i]).inspect());
} while (--n);
return matrix_rows.join('\n');
},
setElements: function(els) {
var i, elements = els.elements || els;
if (typeof(elements[0][0]) != 'undefined') {
var ni = elements.length, ki = ni, nj, kj, j;
this.elements = [];
do { i = ki - ni;
nj = elements[i].length; kj = nj;
this.elements[i] = [];
do { j = kj - nj;
this.elements[i][j] = elements[i][j];
} while (--nj);
} while(--ni);
return this;
}
var n = elements.length, k = n;
this.elements = [];
do { i = k - n;
this.elements.push([elements[i]]);
} while (--n);
return this;
}
};
Matrix.create = function(elements) {
var M = new Matrix();
return M.setElements(elements);
};
Matrix.I = function(n) {
var els = [], k = n, i, nj, j;
do { i = k - n;
els[i] = []; nj = k;
do { j = k - nj;
els[i][j] = (i == j) ? 1 : 0;
} while (--nj);
} while (--n);
return Matrix.create(els);
};
Matrix.Diagonal = function(elements) {
var n = elements.length, k = n, i;
var M = Matrix.I(n);
do { i = k - n;
M.elements[i][i] = elements[i];
} while (--n);
return M;
};
Matrix.Rotation = function(theta, a) {
if (!a) {
return Matrix.create([
[Math.cos(theta),  -Math.sin(theta)],
[Math.sin(theta),   Math.cos(theta)]
]);
}
var axis = a.dup();
if (axis.elements.length != 3) { return null; }
var mod = axis.modulus();
var x = axis.elements[0]/mod, y = axis.elements[1]/mod, z = axis.elements[2]/mod;
var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
return Matrix.create([
[ t*x*x + c, t*x*y - s*z, t*x*z + s*y ],
[ t*x*y + s*z, t*y*y + c, t*y*z - s*x ],
[ t*x*z - s*y, t*y*z + s*x, t*z*z + c ]
]);
};
Matrix.RotationX = function(t) {
var c = Math.cos(t), s = Math.sin(t);
return Matrix.create([
[  1,  0,  0 ],
[  0,  c, -s ],
[  0,  s,  c ]
]);
};
Matrix.RotationY = function(t) {
var c = Math.cos(t), s = Math.sin(t);
return Matrix.create([
[  c,  0,  s ],
[  0,  1,  0 ],
[ -s,  0,  c ]
]);
};
Matrix.RotationZ = function(t) {
var c = Math.cos(t), s = Math.sin(t);
return Matrix.create([
[  c, -s,  0 ],
[  s,  c,  0 ],
[  0,  0,  1 ]
]);
};
Matrix.Random = function(n, m) {
return Matrix.Zero(n, m).map(
function() { return Math.random(); }
);
};
Matrix.Zero = function(n, m) {
var els = [], ni = n, i, nj, j;
do { i = n - ni;
els[i] = [];
nj = m;
do { j = m - nj;
els[i][j] = 0;
} while (--nj);
} while (--ni);
return Matrix.create(els);
};
function Line() {}
Line.prototype = {
eql: function(line) {
return (this.isParallelTo(line) && this.contains(line.anchor));
},
dup: function() {
return Line.create(this.anchor, this.direction);
},
translate: function(vector) {
var V = vector.elements || vector;
return Line.create([
this.anchor.elements[0] + V[0],
this.anchor.elements[1] + V[1],
this.anchor.elements[2] + (V[2] || 0)
], this.direction);
},
isParallelTo: function(obj) {
if (obj.normal) { return obj.isParallelTo(this); }
var theta = this.direction.angleFrom(obj.direction);
return (Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision);
},
distanceFrom: function(obj) {
if (obj.normal) { return obj.distanceFrom(this); }
if (obj.direction) {
if (this.isParallelTo(obj)) { return this.distanceFrom(obj.anchor); }
var N = this.direction.cross(obj.direction).toUnitVector().elements;
var A = this.anchor.elements, B = obj.anchor.elements;
return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
} else {
var P = obj.elements || obj;
var A = this.anchor.elements, D = this.direction.elements;
var PA1 = P[0] - A[0], PA2 = P[1] - A[1], PA3 = (P[2] || 0) - A[2];
var modPA = Math.sqrt(PA1*PA1 + PA2*PA2 + PA3*PA3);
if (modPA === 0) return 0;
var cosTheta = (PA1 * D[0] + PA2 * D[1] + PA3 * D[2]) / modPA;
var sin2 = 1 - cosTheta*cosTheta;
return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
}
},
contains: function(point) {
var dist = this.distanceFrom(point);
return (dist !== null && dist <= Sylvester.precision);
},
liesIn: function(plane) {
return plane.contains(this);
},
intersects: function(obj) {
if (obj.normal) { return obj.intersects(this); }
return (!this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision);
},
intersectionWith: function(obj) {
if (obj.normal) { return obj.intersectionWith(this); }
if (!this.intersects(obj)) { return null; }
var P = this.anchor.elements, X = this.direction.elements,
Q = obj.anchor.elements, Y = obj.direction.elements;
var X1 = X[0], X2 = X[1], X3 = X[2], Y1 = Y[0], Y2 = Y[1], Y3 = Y[2];
var PsubQ1 = P[0] - Q[0], PsubQ2 = P[1] - Q[1], PsubQ3 = P[2] - Q[2];
var XdotQsubP = - X1*PsubQ1 - X2*PsubQ2 - X3*PsubQ3;
var YdotPsubQ = Y1*PsubQ1 + Y2*PsubQ2 + Y3*PsubQ3;
var XdotX = X1*X1 + X2*X2 + X3*X3;
var YdotY = Y1*Y1 + Y2*Y2 + Y3*Y3;
var XdotY = X1*Y1 + X2*Y2 + X3*Y3;
var k = (XdotQsubP * YdotY / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
return Vector.create([P[0] + k*X1, P[1] + k*X2, P[2] + k*X3]);
},
pointClosestTo: function(obj) {
if (obj.direction) {
if (this.intersects(obj)) { return this.intersectionWith(obj); }
if (this.isParallelTo(obj)) { return null; }
var D = this.direction.elements, E = obj.direction.elements;
var D1 = D[0], D2 = D[1], D3 = D[2], E1 = E[0], E2 = E[1], E3 = E[2];
var x = (D3 * E1 - D1 * E3), y = (D1 * E2 - D2 * E1), z = (D2 * E3 - D3 * E2);
var N = Vector.create([x * E3 - y * E2, y * E1 - z * E3, z * E2 - x * E1]);
var P = Plane.create(obj.anchor, N);
return P.intersectionWith(this);
} else {
var P = obj.elements || obj;
if (this.contains(P)) { return Vector.create(P); }
var A = this.anchor.elements, D = this.direction.elements;
var D1 = D[0], D2 = D[1], D3 = D[2], A1 = A[0], A2 = A[1], A3 = A[2];
var x = D1 * (P[1]-A2) - D2 * (P[0]-A1), y = D2 * ((P[2] || 0) - A3) - D3 * (P[1]-A2),
z = D3 * (P[0]-A1) - D1 * ((P[2] || 0) - A3);
var V = Vector.create([D2 * x - D3 * z, D3 * y - D1 * x, D1 * z - D2 * y]);
var k = this.distanceFrom(P) / V.modulus();
return Vector.create([
P[0] + V.elements[0] * k,
P[1] + V.elements[1] * k,
(P[2] || 0) + V.elements[2] * k
]);
}
},
rotate: function(t, line) {
if (typeof(line.direction) == 'undefined') { line = Line.create(line.to3D(), Vector.k); }
var R = Matrix.Rotation(t, line.direction).elements;
var C = line.pointClosestTo(this.anchor).elements;
var A = this.anchor.elements, D = this.direction.elements;
var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
var x = A1 - C1, y = A2 - C2, z = A3 - C3;
return Line.create([
C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
], [
R[0][0] * D[0] + R[0][1] * D[1] + R[0][2] * D[2],
R[1][0] * D[0] + R[1][1] * D[1] + R[1][2] * D[2],
R[2][0] * D[0] + R[2][1] * D[1] + R[2][2] * D[2]
]);
},
reflectionIn: function(obj) {
if (obj.normal) {
var A = this.anchor.elements, D = this.direction.elements;
var A1 = A[0], A2 = A[1], A3 = A[2], D1 = D[0], D2 = D[1], D3 = D[2];
var newA = this.anchor.reflectionIn(obj).elements;
var AD1 = A1 + D1, AD2 = A2 + D2, AD3 = A3 + D3;
var Q = obj.pointClosestTo([AD1, AD2, AD3]).elements;
var newD = [Q[0] + (Q[0] - AD1) - newA[0], Q[1] + (Q[1] - AD2) - newA[1], Q[2] + (Q[2] - AD3) - newA[2]];
return Line.create(newA, newD);
} else if (obj.direction) {
return this.rotate(Math.PI, obj);
} else {
var P = obj.elements || obj;
return Line.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.direction);
}
},
setVectors: function(anchor, direction) {
anchor = Vector.create(anchor);
direction = Vector.create(direction);
if (anchor.elements.length == 2) {anchor.elements.push(0); }
if (direction.elements.length == 2) { direction.elements.push(0); }
if (anchor.elements.length > 3 || direction.elements.length > 3) { return null; }
var mod = direction.modulus();
if (mod === 0) { return null; }
this.anchor = anchor;
this.direction = Vector.create([
direction.elements[0] / mod,
direction.elements[1] / mod,
direction.elements[2] / mod
]);
return this;
}
};
Line.create = function(anchor, direction) {
var L = new Line();
return L.setVectors(anchor, direction);
};
Line.X = Line.create(Vector.Zero(3), Vector.i);
Line.Y = Line.create(Vector.Zero(3), Vector.j);
Line.Z = Line.create(Vector.Zero(3), Vector.k);
function Plane() {}
Plane.prototype = {
eql: function(plane) {
return (this.contains(plane.anchor) && this.isParallelTo(plane));
},
dup: function() {
return Plane.create(this.anchor, this.normal);
},
translate: function(vector) {
var V = vector.elements || vector;
return Plane.create([
this.anchor.elements[0] + V[0],
this.anchor.elements[1] + V[1],
this.anchor.elements[2] + (V[2] || 0)
], this.normal);
},
isParallelTo: function(obj) {
var theta;
if (obj.normal) {
theta = this.normal.angleFrom(obj.normal);
return (Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision);
} else if (obj.direction) {
return this.normal.isPerpendicularTo(obj.direction);
}
return null;
},
isPerpendicularTo: function(plane) {
var theta = this.normal.angleFrom(plane.normal);
return (Math.abs(Math.PI/2 - theta) <= Sylvester.precision);
},
distanceFrom: function(obj) {
if (this.intersects(obj) || this.contains(obj)) { return 0; }
if (obj.anchor) {
var A = this.anchor.elements, B = obj.anchor.elements, N = this.normal.elements;
return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
} else {
var P = obj.elements || obj;
var A = this.anchor.elements, N = this.normal.elements;
return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
}
},
contains: function(obj) {
if (obj.normal) { return null; }
if (obj.direction) {
return (this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction)));
} else {
var P = obj.elements || obj;
var A = this.anchor.elements, N = this.normal.elements;
var diff = Math.abs(N[0]*(A[0] - P[0]) + N[1]*(A[1] - P[1]) + N[2]*(A[2] - (P[2] || 0)));
return (diff <= Sylvester.precision);
}
},
intersects: function(obj) {
if (typeof(obj.direction) == 'undefined' && typeof(obj.normal) == 'undefined') { return null; }
return !this.isParallelTo(obj);
},
intersectionWith: function(obj) {
if (!this.intersects(obj)) { return null; }
if (obj.direction) {
var A = obj.anchor.elements, D = obj.direction.elements,
P = this.anchor.elements, N = this.normal.elements;
var multiplier = (N[0]*(P[0]-A[0]) + N[1]*(P[1]-A[1]) + N[2]*(P[2]-A[2])) / (N[0]*D[0] + N[1]*D[1] + N[2]*D[2]);
return Vector.create([A[0] + D[0]*multiplier, A[1] + D[1]*multiplier, A[2] + D[2]*multiplier]);
} else if (obj.normal) {
var direction = this.normal.cross(obj.normal).toUnitVector();
var N = this.normal.elements, A = this.anchor.elements,
O = obj.normal.elements, B = obj.anchor.elements;
var solver = Matrix.Zero(2,2), i = 0;
while (solver.isSingular()) {
i++;
solver = Matrix.create([
[ N[i%3], N[(i+1)%3] ],
[ O[i%3], O[(i+1)%3]  ]
]);
}
var inverse = solver.inverse().elements;
var x = N[0]*A[0] + N[1]*A[1] + N[2]*A[2];
var y = O[0]*B[0] + O[1]*B[1] + O[2]*B[2];
var intersection = [
inverse[0][0] * x + inverse[0][1] * y,
inverse[1][0] * x + inverse[1][1] * y
];
var anchor = [];
for (var j = 1; j <= 3; j++) {
anchor.push((i == j) ? 0 : intersection[(j + (5 - i)%3)%3]);
}
return Line.create(anchor, direction);
}
},
pointClosestTo: function(point) {
var P = point.elements || point;
var A = this.anchor.elements, N = this.normal.elements;
var dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
return Vector.create([P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot]);
},
rotate: function(t, line) {
var R = Matrix.Rotation(t, line.direction).elements;
var C = line.pointClosestTo(this.anchor).elements;
var A = this.anchor.elements, N = this.normal.elements;
var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
var x = A1 - C1, y = A2 - C2, z = A3 - C3;
return Plane.create([
C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
], [
R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2],
R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2],
R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2]
]);
},
reflectionIn: function(obj) {
if (obj.normal) {
var A = this.anchor.elements, N = this.normal.elements;
var A1 = A[0], A2 = A[1], A3 = A[2], N1 = N[0], N2 = N[1], N3 = N[2];
var newA = this.anchor.reflectionIn(obj).elements;
var AN1 = A1 + N1, AN2 = A2 + N2, AN3 = A3 + N3;
var Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
var newN = [Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2]];
return Plane.create(newA, newN);
} else if (obj.direction) {
return this.rotate(Math.PI, obj);
} else {
var P = obj.elements || obj;
return Plane.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.normal);
}
},
setVectors: function(anchor, v1, v2) {
anchor = Vector.create(anchor);
anchor = anchor.to3D(); if (anchor === null) { return null; }
v1 = Vector.create(v1);
v1 = v1.to3D(); if (v1 === null) { return null; }
if (typeof(v2) == 'undefined') {
v2 = null;
} else {
v2 = Vector.create(v2);
v2 = v2.to3D(); if (v2 === null) { return null; }
}
var A1 = anchor.elements[0], A2 = anchor.elements[1], A3 = anchor.elements[2];
var v11 = v1.elements[0], v12 = v1.elements[1], v13 = v1.elements[2];
var normal, mod;
if (v2 !== null) {
var v21 = v2.elements[0], v22 = v2.elements[1], v23 = v2.elements[2];
normal = Vector.create([
(v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2),
(v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3),
(v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1)
]);
mod = normal.modulus();
if (mod === 0) { return null; }
normal = Vector.create([normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod]);
} else {
mod = Math.sqrt(v11*v11 + v12*v12 + v13*v13);
if (mod === 0) { return null; }
normal = Vector.create([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
}
this.anchor = anchor;
this.normal = normal;
return this;
}
};
Plane.create = function(anchor, v1, v2) {
var P = new Plane();
return P.setVectors(anchor, v1, v2);
};
Plane.XY = Plane.create(Vector.Zero(3), Vector.k);
Plane.YZ = Plane.create(Vector.Zero(3), Vector.i);
Plane.ZX = Plane.create(Vector.Zero(3), Vector.j);
Plane.YX = Plane.XY; Plane.ZY = Plane.YZ; Plane.XZ = Plane.ZX;
var $V = Vector.create;
var $M = Matrix.create;
var $L = Line.create;
var $P = Plane.create;

/* SOURCE FILE: tds_calc_main.js (43a57025) 2/20/2015 3:22:42 PM */

CaretPositionUtils = {
getCaretPosition: function (ctrl) {
var caretPos = 0;
if (document.selection) {
ctrl.focus ();
var Sel = document.selection.createRange ();
Sel.moveStart ('character', -ctrl.value.length);
caretPos = Sel.text.length;
}
else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
if (BrowserUtils.isIOS() && BrowserUtils.getIOSVersion() < 7 && ctrl.nodeName.toLowerCase() == 'textarea') {
ctrl.select();
}
caretPos = ctrl.selectionStart;
}
return (caretPos);
},
setCaretPosition: function (ctrl, pos){
if(ctrl.setSelectionRange)
{
ctrl.focus();
ctrl.setSelectionRange(pos, pos);
CaretPositionUtils.preventOnscreenKB(ctrl);
}
else if (ctrl.createTextRange) {
var range = ctrl.createTextRange();
range.collapse(true);
range.moveEnd('character', pos);
range.moveStart('character', pos);
range.select();
}
},
applyDeleteKeyPress: function(inputarea)
{
var currentPosition = CaretPositionUtils.getCaretPosition(inputarea);
var value = inputarea.value;
if (value.length > 0 && currentPosition < value.length)
{
var newValue = "";
if (currentPosition > 0)
newValue = value.substring(0, currentPosition);
if (currentPosition + 1 < value.length)
newValue = newValue + value.substring(currentPosition + 1);
inputarea.value = newValue;
CaretPositionUtils.setCaretPosition(inputarea, currentPosition);
}
},
applyBackspaceKeyPress: function(inputarea)
{
var currentPosition = CaretPositionUtils.getCaretPosition(inputarea);
var value = inputarea.value;
if (value.length > 0 && currentPosition > 0)
{
var newValue = "";
if (currentPosition > 1)
newValue = value.substring(0, currentPosition - 1);
if (currentPosition + 1 <= value.length)
newValue = newValue + value.substring(currentPosition);
inputarea.value = newValue;
CaretPositionUtils.setCaretPosition(inputarea, currentPosition - 1);
}
},
insertCharacter: function(inputarea, newChar)
{
var currentPosition = CaretPositionUtils.getCaretPosition(inputarea);
var value = inputarea.value;
if (value.length > 0 && currentPosition < value.length && !BrowserUtils.isTouchBrowser()) {
var newValue = "";
if (currentPosition > 0) {
newValue = value.substring(0, currentPosition);
}
newValue = newValue + newChar;
newValue = newValue + value.substring(currentPosition);
inputarea.value = newValue;
CaretPositionUtils.setCaretPosition(inputarea, currentPosition + newChar.length);
}
else {
inputarea.value = inputarea.value + newChar;
CaretPositionUtils.setCaretPosition(inputarea, currentPosition + newChar.length);
}
},
preventOnscreenKB: function (inputarea, e) {
if (BrowserUtils.isTouchBrowser()) {
var inputLen = inputarea.value.length;
if (BrowserUtils.isAndroidNativeBrowser()) {
FocusUtils.setCalcFocus(inputarea, e);
}
inputarea.setSelectionRange(inputLen, inputLen);
}
}
};
SanitizeUtils = {
isSanitizeNegativeSet: function ()
{
return true;
},
sanitizeNegative: function (inputString)
{
if (!SanitizeUtils.isSanitizeNegativeSet())
return inputString;
if (inputString == null || inputString.length == 0)
return "";
inputString = inputString.replace(new RegExp('--', 'g'), '+');
inputString = inputString.replace(new RegExp('\\+-', 'g'), '-');
return inputString;
}
};
BrowserUtils = {
uaString: navigator.userAgent,
isTouchBrowser: function() {
if ("ontouchstart" in window) return true;
return false;
},
isChromeOS: function() {
if (this.uaString.indexOf('CrOS') > -1) return true;
return false;
},
isAndroid: function() {
if (this.uaString.toLowerCase().indexOf('android') > -1) return true;
return false;
},
isIOS: function() {
if (this.getIOSVersion() > 0) return true;
return false;
},
getIOSVersion: function() {
return YAHOO.env.ua.ios;
},
getAndroidVersion: function () {
var match = this.uaString.match(/Android\s([0-9\.]*)/);
return match ? match[1] : false;
},
isAndroidNativeBrowser: function () {
if (parseFloat(this.getAndroidVersion()) < 4.4) return true;
return false;
},
isIE: function() {
if (YAHOO.env.ua.ie > 0 || this.uaString.indexOf('Trident') > -1) return true;
return false;
}
};
FocusUtils = {
setCalcFocus: function (inputArea, e) {
if (BrowserUtils.isTouchBrowser()) {
inputArea.blur();
if (e) {
var eventTarget;
if (typeof (e) == 'object') {
eventTarget = YAHOO.util.Event.getTarget(e);
} else {
eventTarget = document.getElementById(e);
}
eventTarget.focus();
}
} else {
if (inputArea) {
inputArea.focus();
}
}
}
};
PreciseUtils = {
setResultPrecision: function (number, l) {
return parseFloat(number.toFixed(l));
},
validatedInputFractionalPartLen: function (input, s) {
var value = input.value,
curPos = CaretPositionUtils.getCaretPosition(input),
decimalPos = value.indexOf('.'),
fpLen = getMaxFractionalPartLen(input);
if (fpLen && decimalPos > -1) {
if (decimalPos < curPos && value.split('.')[1].length == fpLen) {
return false;
}
} else if (fpLen && decimalPos == -1 && s == '.') {
if (value.length - curPos > fpLen) {
return false;
}
}
return true;
}
};
EventUtils = {
stopPropagation: function (e) {
if (e.stopPropagation) {
e.stopPropagation();
} else {
e.cancelBubble = true;
}
},
preventDefault: function (e) {
if (e.preventDefault) {
e.preventDefault();
} else {
e.returnValue = false;
}
}
};
function getQueryStringParams(url) {
var indexOfQuestion = url.indexOf("?");
if (indexOfQuestion >= 0) {
url = url.substr(indexOfQuestion + 1);
}
var urlParams = {};
var keyValuePairs = url.split('&');
for (var i = 0; i < keyValuePairs.length; ++i) {
var tuple = keyValuePairs[i].split('=');
var key = tuple[0];
var value = unescape(tuple[1]);
urlParams[key] = value;
}
return urlParams;
}
function TDS_Calc()
{
this.CalcModeChange = new YAHOO.util.CustomEvent("onCalcModeChange", this);
this.FuncNames = ['sqrt', 'sin', 'asin', 'cos', 'acos', 'tan', 'atan', 'pow', 'fact', 'int', 'exp', 'log', 'ln', 'abs'];
this.keyboardNav = {curRegion:'', RegionIndex:0, curElement:''};
var urlQueryParams = getQueryStringParams(location.href);
var errorCode = validateCalcList(getCalcList(urlQueryParams));
if (errorCode != 1) {
document.getElementById('calculatorwidget').setAttribute('style', 'display:none');
if (document.getElementById('errorDiv') != null) {
document.getElementById('errorDiv').innerHTML = 'Error initializing calculator.Please notify your TA. [Message code: '+errorCode+'].';
document.getElementById('errorDiv').setAttribute('style', 'display:block');
}
return;
}
if (BrowserDetect.browser == 'Explorer')
{
document.getElementById('calculatorwidget').setAttribute('style', 'display:block');
}
addClientStyleToBody(urlQueryParams);
this.calcConfigs = this.getCalcConfigs(getCalcList(urlQueryParams));
this.calcList = this.createCalcs(this.calcConfigs);
this.workingCalc;
this.init();
if (typeof parent.onCalcReady === "function")
{
parent.onCalcReady(this);
}
this.setCalc(this.calcList[0]);
if (BrowserDetect.browser != 'Explorer')
{
document.getElementById('calculatorwidget').setAttribute('style', 'display:block');
}
function getCalcList(urlQueryParams)
{
var calcs = [];
if (urlQueryParams.mode) {
var modes = urlQueryParams.mode.split(',');
for (var i = 0; i < modes.length; i++) {
calcs.push(modes[i]);
}
}
return calcs;
}
function validateCalcList(calcs) {
if (calcs.length == 0) return 10001;
for (var i = 0; i < calcs.length; i++) {
if (CalcModeList[calcs[i]] != calcs[i]) return 10002;
}
return 1;
}
function addClientStyleToBody(urlQueryParams) {
if (urlQueryParams.clientStylePath) {
var clientStyleClass = "client_" + urlQueryParams.clientStylePath;
YAHOO.util.Dom.addClass(document.body, clientStyleClass);
}
}
}
TDS_Calc.prototype.getCalcConfigs =  function(calcList)
{
var configs = [];
for (var i=0; i<calcList.length; i++) {
var config = getCalcConfig(calcList[i]);
if (config!= null) {
configs.push(config);
}
}
return configs;
function getCalcConfig(calc)
{
for (var i=0; i<CalcConfigBase.length; i++) {
if (calc == CalcConfigBase[i].name) return CalcConfigBase[i];
}
return null;
};
}
TDS_Calc.prototype.setCalc = function(calc)
{
var oldCalc = (this.workingCalc) ? this.workingCalc : null;
var newCalc = calc;
this.CalcModeChange.fire(oldCalc, newCalc);
var headDiv = document.getElementById('calculatorwidget');
for (var i=0; i<this.calcConfigs.length; i++) {
if (YAHOO.util.Dom.hasClass(headDiv, this.calcConfigs[i].css)) YAHOO.util.Dom.removeClass(headDiv, this.calcConfigs[i].css);
}
YAHOO.util.Dom.addClass(headDiv, calc.config.css);
this.workingCalc = calc.instance;
this.workingCalc.setInitKeyboardElement();
this.workingCalc.setFocus();
document.getElementById('textinput').value = '';
if (this.workingCalc.setTextInput) this.workingCalc.setTextInput();
for (var i = 0; i < document.getElementById("calcSwitch").getElementsByTagName("a").length; i++)
{
var calcBtn = document.getElementById("calcSwitch").getElementsByTagName("a")[i];
if (calcBtn.id.toLowerCase() == calc.config.displayName.toLowerCase()) {
YAHOO.util.Dom.addClass(calcBtn, "active");
}
else {
YAHOO.util.Dom.removeClass(calcBtn, "active");
}
}
}
TDS_Calc.prototype.createCalcs = function(configs)
{
for (var i=0; i<this.calcConfigs.length; i++)
{
this.calcConfigs[i].shortcutInitFunc(this.calcConfigs[i].name, this.calcConfigs[i].keyboardRegionDivs);
}
var calcList = [];
for (var i=0; i<configs.length; i++)
{
calcList.push({config:configs[i], instance:this.createCalc(configs[i])});
}
return calcList;
}
TDS_Calc.prototype.createCalc = function(config)
{
switch (config.type) {
case CalcType.arithmetic:
return (new ArithmeticCalc(config, this));
break;
case CalcType.graphing:
return (new GraphingCalc(config, this));
break;
case CalcType.regression:
return (new RegressionCalc(config, this));
break;
case CalcType.linearalgebra:
return (new LinearalgebraCalc(config, this));
break;
}
}
TDS_Calc.prototype.evalExpression = function(expression)
{
var mod_calc;
if (expression) mod_calc = this.translate_input(expression);
else return 'No expression';
if (mod_calc == '') return 'Express Error';
try{
var calc_result = eval(mod_calc);
if (calc_result != undefined) {
if ((calc_result == Infinity)||(calc_result == -Infinity)||(calc_result+'' == 'NaN' )) return (ExpressErrorMsg);
calc_result = this.processE(calc_result);
return calc_result;
}
} catch(ex){
return (ExpressErrorMsg);
}
return (ExpressErrorMsg);
}
TDS_Calc.prototype.processE = function(result)
{
var savedRst = result;
try {
var frst = parseFloat(result);
result = parseFloat(frst.toFixed(10));
} catch (e) {
result = savedRst;
}
if (Math.abs(Math.round(result) - result) < 1e-8) result = Math.round(result);
var rst = result + '';
var pos = rst.indexOf('e');
if (pos == -1) return result;
try {
var num = parseFloat(rst.substring(0,pos));
var rt = Math.round(num * 1000)/1000 + rst.substring(pos);
} catch (e) {
return result;
}
return rt;
}
TDS_Calc.prototype.evalVariableExpression = function(expression, xVal)
{
var ep = expression.replace(new RegExp('exp', 'g'), 'bbb');
ep = this.translate_input(ep.replace(new RegExp('[x]', 'g'), '(' + xVal +')' )) + '';
ep = ep.replace(new RegExp('bbb', 'g'), 'exp');
var rst = this.evalExpression(ep);
return rst;
}
TDS_Calc.prototype.translate_input = function(expStr)
{
if ((expStr == null) || (expStr == '')) return '';
var inputStr;
if (expStr) inputStr = expStr.replace(/^\s*|\s*$/g,'');
inputStr = this.translate_invtrig(inputStr);
inputStr = this.translate_negative(inputStr);
inputStr = SanitizeUtils.sanitizeNegative(inputStr);
inputStr = this.addMissingBrackets(inputStr);
inputStr = this.translate_pow(inputStr);
inputStr = this.translate_fact(inputStr);
inputStr = this.translate_sqrt(inputStr);
inputStr = this.translate_pi(inputStr);
inputStr = this.addMissingMultiplier(inputStr);
inputStr = this.otherInputErrors(inputStr);
if (inputStr.indexOf('Error')!=-1) return ExpressErrorMsg;
return inputStr;
}
TDS_Calc.prototype.flip_sign = function (e) {
var inputarea = getWorkingCalcInstance().getInputArea();
if (inputarea == null) return;
var value = inputarea.value;
if (value && (value.length > 0) && value != ExpressErrorMsg) {
if (value == "\u2010") {
inputarea.value = "";
CaretPositionUtils.setCaretPosition(inputarea, 0);
FocusUtils.setCalcFocus(inputarea, e);
return;
}
var validSymbols = "(/*-+√^";
var cPos = CaretPositionUtils.getCaretPosition(inputarea);
for (var i = (cPos > 0 ? cPos - 1 : cPos); i >= 0; i--) {
var chr = value.charAt(i);
if (chr) {
if (i > 0) {
if (parseFloat(chr) == parseInt(chr)) continue;
if (validSymbols.indexOf(chr) != -1) {
var _lead, _trail;
if (i < value.length) {
if (value.charAt(i + 1) == "\u2010") {
_lead = value.substring(0, i + 1);
_trail = value.substring(i + 2);
inputarea.value = _lead + _trail;
}
else {
_lead = value.substring(0, i + 1);
_trail = value.substring(i + 1);
inputarea.value = _lead + "\u2010" + _trail;
}
break;
}
else {
_lead = value.substring(0, i);
_trail = "";
}
inputarea.value = _lead + "\u2010" + _trail;
break;
}
}
else {
if (chr == "\u2010") {
inputarea.value = value.substring(1);
}
else {
if (validSymbols.indexOf(chr) == -1)
inputarea.value = "\u2010" + value;
else
inputarea.value = value + "\u2010";
}
break;
}
}
}
}
else {
inputarea.value = "\u2010";
}
CaretPositionUtils.setCaretPosition(inputarea, inputarea.value.length);
FocusUtils.setCalcFocus(inputarea, e);
}
function getWorkingCalcInstance()
{
if (typeof tdscalc != 'undefined' && tdscalc != null ) return tdscalc.workingCalc;
return null;
}
function getTDSCalc()
{
return tdscalc;
}
function resetTDSCalc()
{
var tdsCalc = getTDSCalc();
if (tdsCalc != null && tdsCalc.calcList != null) {
for (var i = 0; i < tdsCalc.calcList.length; i++) {
var calcInstance = tdsCalc.calcList[i].instance;
if (calcInstance != null && typeof calcInstance.reset == 'function') {
calcInstance.reset();
}
}
tdsCalc.setCalc(tdsCalc.calcList[0]);
}
}
var ExpressErrorMsg = 'Expression error';
var PI = Math.PI;
var MINORDIFF = 0.00000001;
function exp(x){return Math.exp(x);}
function ln(x){return Math.log(x);}
function abs(x){return Math.abs(x);}
function log(x) { return Math.log(x) / Math.log(10); }
function pow(x,y){return Math.pow(x,y);}
function sqrt(x){return Math.sqrt(x);}
function fact(x){return factorial(x);}
function tan(x){
var radiansX = get_RadiansValue(x);
var absRadiansX = Math.abs(radiansX);
absRadiansX = absRadiansX - PI/2;
if (absRadiansX >= 0)
{
if (absRadiansX < MINORDIFF)
{
return NaN;
}
var k = absRadiansX / PI;
if (k - Math.floor(k) < MINORDIFF)
return NaN;
}
return Math.tan(radiansX);
}
function sin(x){return Math.sin(get_RadiansValue(x));}
function cos(x) { return Math.cos(get_RadiansValue(x)); }
function asin(x) { return get_DegreesValue(Math.asin(x)); }
function acos(x) { return get_DegreesValue(Math.acos(x)); }
function atan(x) { return get_DegreesValue(Math.atan(x)); }
function factorial(n) {
if ((n < 0 || n > 100) || isNaN(n))
return NaN;
var result = 1;
for (var i = 2; i <= n; i++) {
result *= i;
}
return result;
};
function get_RadiansValue(v) {
if (document.getElementById('radians').checked) return v;
return v*PI/180;
}
function get_DegreesValue(v) {
if (document.getElementById('radians').checked) return v;
return v * 180 / PI;
}
function degreeRadianKeyPress(item, e)
{
return true;
}
function angle_mode(angleType) {
document.getElementById("degrees").checked = false;
document.getElementById("radians").checked = false;
document.getElementById(angleType).checked = true;
}
TDS_Calc.prototype.textInputFocusInit = function(inputIds) {
for (var i = 0; i < inputIds.length; i++) {
var el = document.getElementById(inputIds[i]);
if (el != null) {
if (BrowserUtils.isTouchBrowser()) {
el.setAttribute('readonly', 'readonly');
var elength = el.value.length;
if (elength != 0) {
el.setSelectionRange(elength, elength);
}
YAHOO.util.Event.on(el, 'click', function () {
CaretPositionUtils.preventOnscreenKB(this);
});
}
el.setAttribute('onkeypress', 'return CalcKeyPressProcess(this,event)');
el.focused = false;
el.hasFocus = function() {
return this.focused;
};
YAHOO.util.Event.on(inputIds[i], "focusin", function(e) {
for (var j = 0; j < inputIds.length; j++)
document.getElementById(inputIds[j]).focused = false;
this.focused = true;
var id = (e.target != null) ? e.target.id : e.srcElement.id;
setCurRegionElementById('input', id);
}, this, true);
}
}
}
var SwitchButtonMap = [];
SwitchButtonMap.push({id: CalcModeList['Matrices'], func: switchCalc});
SwitchButtonMap.push({id: CalcModeList['Regression'], func: switchCalc});
SwitchButtonMap.push({ id: CalcModeList['Scientific'], func: switchCalc });
SwitchButtonMap.push({ id: CalcModeList['ScientificInv'], func: switchCalc });
SwitchButtonMap.push({ id: CalcModeList['Graphing'], func: switchCalc });
SwitchButtonMap.push({ id: CalcModeList['GraphingInv'], func: switchCalc });
var ClearInputButtonMap = [];
ClearInputButtonMap.push({id:'backspace', func: calcClearInput});
ClearInputButtonMap.push({id:'C', func: calcClearInput});
ClearInputButtonMap.push({id:'CE', func: calcClearInput});
function calcClearInput(e) {
var id;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else id = e;
getWorkingCalcInstance().clearInput(id);
}
function clearFocus(divRegion) {
for (var i = 0; i < divRegion.length; i++) {
var divObj = document.getElementById(divRegion[i]);
if (YAHOO.util.Dom.hasClass(divObj, 'focused')) YAHOO.util.Dom.removeClass(divObj, 'focused');
}
}
function switchCalc(e)
{
var id;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else id = e;
var calc,
workingCalc = getTDSCalc().workingCalc;
if (workingCalc.radianOrDegree) {
workingCalc.setRadianOrDegree(getRadioButtonValue());
}
switch (id)
{
case CalcModeList['Matrices']:
calc = getCalcByType(CalcType.linearalgebra);
break;
case CalcModeList['Regression']:
calc = getCalcByType(CalcType.regression);
break;
case CalcModeList['Graphing']:
calc = getCalcByType(CalcType.graphing);
break;
case CalcModeList['GraphingInv']:
calc = getCalcByType(CalcType.graphing);
break;
case CalcModeList['ScientificInv']:
calc = getCalcByType(CalcType.arithmetic);
break;
default:
calc = getCalcByType(CalcType.arithmetic);
break;
}
if(getWorkingCalcInstance() != calc.instance)
{
getTDSCalc().setCalc(calc);
}
var newWorkingCalc = getTDSCalc().workingCalc;
if (typeof newWorkingCalc.getRadianOrDegree === 'function') resetRadianDegree(newWorkingCalc.getRadianOrDegree());
clearFocus(calc.config.keyboardRegionDivs);
function getCalcByType(type)
{
for (var i=0; i<getTDSCalc().calcList.length; i++)
{
if (type == getTDSCalc().calcList[i].config.type) return getTDSCalc().calcList[i];
}
return null;
}
function getRadioButtonValue() {
if (document.getElementById('radians').checked) {
return 'radians';
} else {
return 'degrees';
}
}
}
function resetRadianDegree(checkedId) {
if (checkedId == 'radians') {
document.getElementById('degrees').checked = false;
document.getElementById('radians').checked = true;
} else {
document.getElementById('radians').checked = false;
document.getElementById('degrees').checked = true;
}
}
TDS_Calc.prototype.init = function()
{
if (this.calcList.length > 1) {
var btnSwitchDiv = document.getElementById('calcSwitch');
var switchList = [];
for (var i=0; i<this.calcList.length; i++) {
var btn = document.createElement('a');
btn.setAttribute('href', '#');
var id = this.calcList[i].config.name;
switchList.push(id);
btn.setAttribute('id', id);
YAHOO.util.Event.addListener(btn, "click", switchCalc);
btn.appendChild(document.createTextNode(this.calcList[i].config.displayName));
btnSwitchDiv.appendChild(btn);
}
for (var i=0; i<switchList.length; i++)
{
getRegionDivsByMode(switchList[i]).push('calcSwitch');
for (var j=0; j<switchList.length; j++)
{
var rightCalc;
if (j==switchList.length-1) rightCalc = null;
else rightCalc = switchList[j+1];
var leftCalc;
if (j==0) leftCalc = null;
else leftCalc = switchList[j-1];
var elId = CalcModeList[switchList[i]] + '-calcSwitch-' + switchList[j];
if (j==0) elementInRegion[CalcModeList[switchList[i]] + '-calcSwitch-default'] = {id:id,up:null,down:null,left:leftCalc,right:rightCalc};
elementInRegion[elId] = {id:id,up:null,down:null,left:leftCalc,right:rightCalc};
}
}
YAHOO.util.Dom.addClass(document.getElementById("calculatorwidget"), 'modes'+this.calcList.length);
}
for (var i=0; i<ButtonAttributeMap.length; i++) {
var btnObj = document.getElementById(ButtonAttributeMap[i].id);
if (btnObj) {
YAHOO.util.Event.removeListener(btnObj, "click", ButtonAttributeMap[i].func);
YAHOO.util.Event.addListener(btnObj, "click", ButtonAttributeMap[i].func);
btnObj.setAttribute('val',ButtonAttributeMap[i].val);
btnObj.setAttribute('op',ButtonAttributeMap[i].op);
btnObj.setAttribute('numOprands',ButtonAttributeMap[i].numOprands);
btnObj.setAttribute('onePos',ButtonAttributeMap[i].onePos);
if('clearExistingInput' in  ButtonAttributeMap[i])
btnObj.setAttribute('clearExistingInput',ButtonAttributeMap[i].clearExistingInput);
}
}
for (var i=0; i<ClearInputButtonMap.length; i++)
{
var btnObj = document.getElementById(ClearInputButtonMap[i].id);
if (btnObj) {
YAHOO.util.Event.removeListener(btnObj, "click", ClearInputButtonMap[i].func);
YAHOO.util.Event.addListener(btnObj, "click", ClearInputButtonMap[i].func);
}
}
shortcut.add("ctrl+shift+right", function() {return keyboardTab('forward')});
shortcut.add("ctrl+shift+left", function() {return keyboardTab('back')});
shortcut.add("enter", function(e) {return keyboardEnter(e) });
shortcut.add("space", function(e) {return keyboardSpace(e) });
shortcut.add("shift+left", function() { return keyboardArrowKey('left') });
shortcut.add("shift+right", function() { return keyboardArrowKey('right') });
shortcut.add("shift+up", function() { return keyboardArrowKey('up') });
shortcut.add("shift+down", function () { return keyboardArrowKey('down') });
}
function keyboardArrowKey(direction)
{
var calc = getTDSCalc();
var calcMode = getCurCalcMode();
var region = calc.keyboardNav.curRegion;
var curElement = calc.keyboardNav.curElement;
var elName = calcMode+'-'+region+'-'+curElement;
if (region == 'yNumb') {
regressionInputNav(region, curElement, direction);
return false;
}
if (region == 'matrixArea') {
matricesInputNav(region, curElement, direction);
return false;
}
function applyFocusStyle(elId) {
if(curElement == 'toggleScroll' || curElement == 'toggleTrace') {
var blurElement = document.getElementById(curElement).parentNode;
YAHOO.util.Dom.removeClass(blurElement, 'focus');
}
if (elId == 'toggleScroll' || elId == 'toggleTrace') {
var focusElement = document.getElementById(elId).parentNode;
YAHOO.util.Dom.setAttribute(focusElement, 'class', 'focus');
}
}
try {
switch (direction) {
case 'left':
var leftId = elementInRegion[elName].left;
if ((leftId != null) && !disabledANSRCL(leftId)) {
document.getElementById(leftId).focus();
calc.keyboardNav.curElement = leftId;
}
applyFocusStyle(leftId);
break;
case 'right':
var rightId = elementInRegion[elName].right;
if ((rightId != null) && !disabledANSRCL(rightId))
{
document.getElementById(rightId).focus();
calc.keyboardNav.curElement = rightId;
}
applyFocusStyle(rightId);
break;
case 'up':
var upId = elementInRegion[elName].up;
if ((upId != null)&& !disabledANSRCL(upId))
{
PreProcessSelectEnter(direction, upId);
document.getElementById(upId).focus();
calc.keyboardNav.curElement = upId;
}
applyFocusStyle(upId);
break;
case 'down':
var downId = elementInRegion[elName].down;
if ((downId != null)&& !disabledANSRCL(downId))
{
PreProcessSelectEnter(direction, downId);
document.getElementById(downId).focus();
calc.keyboardNav.curElement = downId;
}
applyFocusStyle(downId);
break;
}
} catch (ex) {
return false;
}
function disabledANSRCL(id)
{
if ((id == 'ANS')||(id == 'RCL')) {
if (document.getElementById(id).getAttribute('disabled') !=null) return true;
}
return false;
}
function PreProcessSelectEnter(direction, id)
{
if ((BrowserDetect.browser == 'Firefox') || (BrowserDetect.browser == 'Mozilla')){
if (id.indexOf('equations-select') == -1) return;
var selObj = document.getElementById(id);
var len = selObj.options.length;
switch (direction)
{
case 'up':
selObj.selectedIndex += 1;
break;
case 'down':
selObj.selectedIndex -= 1;
break;
}
}
}
function matricesInputNav(region, curElement, direction)
{
var coods = curElement.split('-');
var matrix = coods[0];
var row = parseInt(coods[1]);
var col = parseInt(coods[2]);
if (curElement.indexOf('number') != -1) {
switch (direction)
{
case 'left':
if (curElement == matrix + '-numberRows') {
var newId = matrix + '-1-1';
document.getElementById(newId).focus();
getTDSCalc().keyboardNav.curElement = newId;
} else {
var newId = matrix + '-numberRows';
document.getElementById(newId).focus();
getTDSCalc().keyboardNav.curElement = newId;
}
break;
case 'right':
if (curElement == matrix + '-numberRows') {
var newId = matrix + '-numberCols';
document.getElementById(newId).focus();
getTDSCalc().keyboardNav.curElement = newId;
} else {
var newId = matrix + '-1-1';
document.getElementById(newId).focus();
getTDSCalc().keyboardNav.curElement = newId;
}
break;
}
return false;
}
var seNode = document.getElementById(matrix+'-numberRows');
var dim1Size = seNode.selectedIndex+1;
seNode = document.getElementById(matrix+'-numberCols');
var dim2Size = seNode.selectedIndex+1;
var newId = matrix + '-' + row + '-' + col;
switch (direction)
{
case 'left':
col = col - 1;
if (col <=0 ) return false;
break;
case 'right':
col = col +1;
if (col > dim2Size) return false;
newId = matrix + '-' + row + '-' + col;
break;
case 'up':
row = row - 1;
if (row < 0) return false;
break;
case 'down':
row = row + 1;
if (row > dim1Size) return false;
}
newId = matrix + '-' + row + '-' + col;;
if(document.getElementById(newId) != null)
document.getElementById(newId).focus();
getTDSCalc().keyboardNav.curElement = newId;
}
function regressionInputNav(region, curElement, direction)
{
var coods = curElement.split('-');
var colLb = coods[1];
var row = parseInt(coods[2]);
switch (direction)
{
case 'left':
var i=0;
for (i=0; i<getWorkingCalcInstance().dataLabelNames.length; i++)
if (colLb == getWorkingCalcInstance().dataLabelNames[i]) break;
if (i==0) return false;
colLb = getWorkingCalcInstance().dataLabelNames[i-1];
break;
case 'right':
var i=0;
for (i=0; i<getWorkingCalcInstance().dataLabelNames.length; i++)
if (colLb == getWorkingCalcInstance().dataLabelNames[i]) break;
if (i== getWorkingCalcInstance().dataLabelNames.length-1) return false;
colLb = getWorkingCalcInstance().dataLabelNames[i+1];
break;
case 'up':
row = row-1;
if (row < 1) return false;
break;
case 'down':
row = row+1;
if (row > getWorkingCalcInstance().maxDataEntry) return false;
break;
}
var newId = 'reg-' + colLb+ '-' + row;
document.getElementById(newId).focus();
getTDSCalc().keyboardNav.curElement = newId;
}
return false;
}
function keyboardEnter(e)
{
if (typeof(e) == 'object')
{
var keycode;
if (e) keycode = e.which;
else return false;
if (keycode == 13)
{
var target = YAHOO.util.Event.getTarget(e);
element =  document.getElementById(target.id);
id = target.id;
if (id == 'ANS' || id == 'equals')
{
getWorkingCalcInstance().doCalculation();
return false;
}
}
}
return false;
}
function keyboardSpace(e)
{
var id = getTDSCalc().keyboardNav.curElement;
function getEventTarget(evt) {
if (e.target) return evt.target;
else if (e.srcElement) return evt.srcElement;
return {};
}
if (getEventTarget(e).type == 'radio') return true;
if (applyFuncFromButtonMap(ClearInputButtonMap, id)) return false;
if (applyFuncFromButtonMap(ButtonAttributeMap, id)) return false;
if (applyFuncFromButtonMap(SwitchButtonMap,id)) return false;
getWorkingCalcInstance().buttonPressProcess(id);
return false;
}
function applyFuncFromButtonMap(map, id)
{
for (var i=0; i<map.length; i++)
{
if (id == map[i].id) {
map[i].func(id);
return true;
}
}
return false;
}
function keyboardTab(direction) {
if (getTDSCalc().keyboardNav.curRegion == 'numberRows' || getTDSCalc().keyboardNav.curRegion == 'numberColumns') {
document.getElementById(getTDSCalc().keyboardNav.curElement).blur();
}
var divRegion = getRegionDivsByMode(getCurCalcMode());
if (direction == 'forward')
{
getTDSCalc().keyboardNav.RegionIndex++;
if (getTDSCalc().keyboardNav.RegionIndex > divRegion.length -1) getTDSCalc().keyboardNav.RegionIndex = 0;
} else {
getTDSCalc().keyboardNav.RegionIndex--;
if (getTDSCalc().keyboardNav.RegionIndex < 0) getTDSCalc().keyboardNav.RegionIndex = divRegion.length-1;
}
var divObj;
for (var i=0; i<divRegion.length; i++)
{
divObj = document.getElementById(divRegion[i]);
if (YAHOO.util.Dom.hasClass(divObj, 'focused')) YAHOO.util.Dom.removeClass(divObj, 'focused');
}
divObj = document.getElementById(divRegion[getTDSCalc().keyboardNav.RegionIndex]);
YAHOO.util.Dom.addClass(divObj, 'focused');
if (divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'matrixArea') {
keyboardEnterMatrixArea('matrixArea');
return false;
}
if ( (divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'matrixResult') ||
(divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'matrixClear'))
{
keyboardEnterMatrixResultClear(divRegion[getTDSCalc().keyboardNav.RegionIndex]);
return false;
}
if ((divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'numberRows') ||
(divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'numberCols'))
{
var selId = getWorkingCalcInstance().curMatrix + '-' + divRegion[getTDSCalc().keyboardNav.RegionIndex];
setTimeout(function () { document.getElementById(selId).focus(); }, 100);
getTDSCalc().keyboardNav.curRegion = divRegion[getTDSCalc().keyboardNav.RegionIndex];
getTDSCalc().keyboardNav.curElement = selId;
return false;
}
var name = getCurCalcMode()+'-'+divRegion[getTDSCalc().keyboardNav.RegionIndex]+'-default';
var defaultId = elementInRegion[name].id;
document.getElementById(defaultId).focus();
getTDSCalc().keyboardNav.curRegion = divRegion[getTDSCalc().keyboardNav.RegionIndex];
getTDSCalc().keyboardNav.curElement = defaultId;
function keyboardEnterMatrixArea(curRegion)
{
var i=0;
for (i=0; i< getWorkingCalcInstance().matrixIds.length; i++)
{
if (document.getElementById('matrix-' + getWorkingCalcInstance().matrixIds[i]).style.display == 'block') break;
}
var id = getWorkingCalcInstance().matrixIds[i] + '-1-1';
document.getElementById(id).focus();
getTDSCalc().keyboardNav.curRegion = curRegion;
getTDSCalc().keyboardNav.curElement = id;
}
function keyboardEnterMatrixResultClear(curRegion)
{
var i=0;
for (i=0; i< getWorkingCalcInstance().matrixIds.length; i++)
{
if (document.getElementById('matrix-' + getWorkingCalcInstance().matrixIds[i]).style.display == 'block') break;
}
var id = getWorkingCalcInstance().matrixIds[i] + '-Result';
if (curRegion.indexOf('Clear') != -1) id = getWorkingCalcInstance().matrixIds[i] + '-Clear';
document.getElementById(id).focus();
getTDSCalc().keyboardNav.curRegion = curRegion;
getTDSCalc().keyboardNav.curElement = id;
}
return false;
}
TDS_Calc.prototype.getLeftOperandPos = function(str)
{
if (str.length == 0) return -1;
if (str.charAt(str.length-1)==')') {
var cnt = 1;
for (var i=str.length-2; i>=0; i--) {
if (str.charAt(i) == ')') {cnt++;}
else
if (str.charAt(i) == '(') {
cnt--;
if (cnt == 0) {
var rst = str.substring(i+1, str.length-1);
var pos = this.getLeftFuncPos(str, i);
return pos;
}
}
}
} else
if ((str.charAt(str.length-1)=='x')|| (str.charCodeAt(str.length-1)==960)){
return str.length-1;
} else
if (str.charAt(str.length-1)=='.') {
return -1;
} else
{
var digitPattern = /^[0-9]|\./;
var numflag = false;
var nonNumflag = false;
for (var i = str.length-1; i>=0; i--) {
if (digitPattern.test(str.charAt(i))) {
numflag = true;
} else {
nonNumflag = true;
break;
}
}
if (numflag) {
if (nonNumflag) return i+1;
return 0;
}
}
return -1;
}
TDS_Calc.prototype.getRightOperandPos = function(str)
{
if (str.charAt(0)=='(') {
var cnt = 1;
for (var i=1; i<str.length;i++) {
if (str.charAt(i) == '(') {cnt++;}
else
if (str.charAt(i) == ')') {
cnt--;
if (cnt == 0) {
var rst = str.substring(1, i);
return i;
}
}
}
} else
if ((str.charAt(0)=='x')||(str.charCodeAt(0)==960 ) ){
return 1;
} else
if (str.charAt(0)=='-') {
var pos = this.getRightPositiveNumPos(str.substring(1));
if (pos>0) return pos+1;
}
var pos = this.getRightFuncPos(str, 0);
if (pos>0) return pos;
pos = this.getRightPositiveNumPos(str);
if (pos>0) return pos;
return -1;
}
TDS_Calc.prototype.getLeftFuncPos = function(str, index)
{
for (var i=0; i<this.FuncNames.length; i++) {
if (this.FuncNames[i].length <= index+1) {
if (str.substring(index-this.FuncNames[i].length, index) == this.FuncNames[i]) return index-this.FuncNames[i].length;
}
}
return index;
}
TDS_Calc.prototype.getRightFuncPos = function(str, index)
{
for (var i=0; i<this.FuncNames.length; i++) {
if (this.FuncNames[i].length < str.length) {
if (str.substring(0, this.FuncNames[i].length+1) == (this.FuncNames[i]+'(') ) {
var cnt = 1;
for (var j=this.FuncNames[i].length+1; j<str.length; j++) {
if (str.charAt(j) == '(') cnt++;
else if (str.charAt(j) == ')') {
cnt--;
if (cnt == 0) {
return j;
}
}
}
return -1;
}
}
}
return -1;
}
TDS_Calc.prototype.getRightPositiveNumPos = function(str)
{
var digitPattern = /^[0-9]|\./;
var numflag = false;
var nonNumflag = false;
for (var i = 0; i<str.length; i++) {
if (digitPattern.test(str.charAt(i))) {
numflag = true;
} else {
nonNumflag = true;
break;
}
}
if (numflag) {
if (nonNumflag) return i;
return str.length;
}
return -1;
}
TDS_Calc.prototype.checkPow00 = function(inputStr)
{
var pos = inputStr.indexOf('pow');
if (pos == -1) return false;
var rightOprandPos = this.getRightOperandPos(inputStr.substring(pos + 3));
if (rightOprandPos == -1) return true;
var leftP = 0;
var rightP = 0;
var start = pos + 4;
for (var i=0; i<rightOprandPos; i++) {
if (inputStr.charAt(i+start) == '(') leftP++;
if (inputStr.charAt(i+start) == ')') rightP++;
if ((leftP == rightP) && (inputStr.charAt(i+start) == ',')) {
var leftExpression = inputStr.substring(start,start+i);
var rightExpression = inputStr.substring(start+i+1, rightOprandPos+start-1);
if ( (leftExpression.indexOf('x')==-1) && ( rightExpression.indexOf('x')==-1)
&&((this.evalExpression(leftExpression)+'') == '0') && ((this.evalExpression(rightExpression)+'') == '0')) return true;
break;
}
}
var nextStr = inputStr.substring(pos+3);
return this.checkPow00(nextStr);
}
TDS_Calc.prototype.translate_invtrig = function(inputStr) {
inputStr = inputStr.replace('sin^-1', 'asin');
inputStr = inputStr.replace('cos^-1', 'acos');
inputStr = inputStr.replace('tan^-1', 'atan');
return inputStr;
};
TDS_Calc.prototype.translate_negative = function(inputStr)
{
return inputStr.replace(/[\u2010]/g, '-');
}
TDS_Calc.prototype.translate_sqrt = function(inputStr)
{
var pos = this.getFirstCharCode(inputStr, 8730);
while (pos!=-1) {
var rightOpPos = this.getRightOperandPos(inputStr.substring(pos+1));
if (rightOpPos == -1) return 'Sqrt Error';
rightOpPos += pos;
if (rightOpPos<=inputStr.length-1) {
var str1 = '';
if (pos >0) str1 =inputStr.substring(0,pos);
var str2 = "";
if (rightOpPos < inputStr.length -1)
str2 = inputStr.substring(rightOpPos+1);
var opStr2 = inputStr.substring(pos+1, rightOpPos+1);
inputStr = str1 + 'sqrt(' + opStr2 + ')' + str2;
} else {
return 'Sqrt Error';
}
pos = this.getFirstCharCode(inputStr, 8730);
}
return inputStr;
}
TDS_Calc.prototype.translate_pi = function(inputStr)
{
var pos = this.getFirstCharCode(inputStr, 960);
while (pos!=-1) {
inputStr = inputStr.substring(0,pos) + '(' + PI + ')' + inputStr.substring(pos+1);
pos = this.getFirstCharCode(inputStr, 960);
}
return inputStr;
}
TDS_Calc.prototype.otherInputErrors = function(inputStr)
{
if ( (inputStr.indexOf('+-')!=-1) || (inputStr.indexOf('-+')!=-1) ) return 'Error';
if (this.checkPow00(inputStr)) return '0^0 Error';
return inputStr;
}
TDS_Calc.prototype.addMissingBrackets = function(str)
{
var inputStr = str;
var left = 0, right = 0;
for (var i=0; i<str.length; i++) {
if (str.charAt(i) == '(') left++;
if (str.charAt(i) == ')') right++;
}
if (left > right)
for (var j=0; j<left - right; j++) inputStr += ')';
return inputStr;
}
TDS_Calc.prototype.addMissingMultiplier = function(str)
{
var inputStr = str;
if (inputStr.match(/[\*\(+-\/][*]/g)) return ExpressErrorMsg;
inputStr = inputStr.replace(new RegExp('[e][x][p]', 'g'), 'bbb');
if(inputStr != ExpressErrorMsg) inputStr = inputStr.replace(new RegExp('[x]', 'g'), '(x)');
inputStr = inputStr.replace(new RegExp('[b][b][b]', 'g'), 'exp');
var oldInput = inputStr;
for (var i = 0; i < this.FuncNames.length; i++) {
inputStr = inputStr.replace(new RegExp(this.FuncNames[i], 'g'), '*' + this.FuncNames[i]);
inputStr = inputStr.replace(new RegExp('[*][*]', 'g'), '*');
inputStr = inputStr.replace(new RegExp('[(][*]', 'g'), '(');
inputStr = inputStr.replace(new RegExp('[+][*]', 'g'), '+');
inputStr = inputStr.replace(new RegExp('[-][*]', 'g'), '-');
inputStr = inputStr.replace(new RegExp('[/][*]', 'g'), '/');
inputStr = inputStr.replace(new RegExp('[.][*]', 'g'), '.');
}
if (inputStr.charAt(0) == '*') {
if (oldInput == inputStr) return 'Error';
else inputStr = inputStr.substring(1);
}
inputStr = inputStr.replace(new RegExp('[)][(]', 'g'), ')*(');
var digits = ['0','1','2','3','4','5','6','7','8','9', '.'];
for (var i=0; i< digits.length; i++) {
inputStr = inputStr.replace(new RegExp('[' + digits[i] + '][(]', 'g'), digits[i]+'*(');
inputStr = inputStr.replace(new RegExp('[)]' + '['+ digits[i] + ']', 'g'), ')*' + digits[i]);
}
inputStr = inputStr.replace(new RegExp('[a][*][s][i][n]', 'g'), 'asin');
inputStr = inputStr.replace(new RegExp('[a][*][c][o][s]', 'g'), 'acos');
inputStr = inputStr.replace(new RegExp('[a][*][t][a][n]', 'g'), 'atan');
return inputStr;
}
TDS_Calc.prototype.translate_pow = function(inputStr)
{
var pos = inputStr.indexOf('^');
while (pos!=-1) {
var leftOpPos = this.getLeftOperandPos(inputStr.substring(0,pos));
if (leftOpPos == -1) return 'Pow Error';
var rightOpPos = this.getRightOperandPos(inputStr.substring(pos+1));
if (rightOpPos == -1) return 'Pow Error';
rightOpPos += pos;
if ((leftOpPos>=0) && (rightOpPos<=inputStr.length-1)) {
var str1 = '';
if (leftOpPos >0) str1 =inputStr.substring(0,leftOpPos);
var str2 = "";
if (rightOpPos < inputStr.length -1)
str2 = inputStr.substring(rightOpPos+1);
var opStr1 = inputStr.substring(leftOpPos,pos);
var opStr2 = inputStr.substring(pos + 1, rightOpPos + 1);
if (opStr2.indexOf('/') > -1) {
var molecular = opStr2.split('/')[0].replace(new RegExp('[()]', 'g'), ''),
denominator = opStr2.split('/')[1].replace(new RegExp('[()]', 'g'), '');
if (this.evalExpression(opStr1) < 0 &&
Number(molecular) &&
Number(denominator) &&
denominator % 2 != 0) {
var sign = '';
opStr1 = 'Math.abs(' + opStr1 + ')';
if (opStr2.split('/')[0].replace(new RegExp('[()]', 'g'), '') % 2 != 0) {
sign = '-';
}
inputStr = str1 + sign + 'pow(' + opStr1 + ',' + opStr2 + ')' + str2;
} else {
inputStr = str1 + 'pow(' + opStr1 + ',' + opStr2 + ')' + str2;
}
} else {
inputStr = str1 + 'pow(' + opStr1 + ',' + opStr2 + ')' + str2;
}
} else {
return 'Pow Error';
}
pos = inputStr.indexOf('^');
}
return inputStr;
}
TDS_Calc.prototype.translate_fact = function(inputStr)
{
pos = inputStr.indexOf('!');
while (pos!=-1) {
var leftOpPos = this.getLeftOperandPos(inputStr.substring(0,pos));
if (leftOpPos>=0) {
var str1 = '';
if (leftOpPos >0) str1 =inputStr.substring(0,leftOpPos);
var str2 = '';
if (pos < inputStr.length-1) str2 = inputStr.substring(pos+1);
var opStr1 = inputStr.substring(leftOpPos,pos);
inputStr = str1 + 'fact(' + opStr1 + ')' + str2;
} else {
return 'Factorial Error';
}
pos = inputStr.indexOf('!');
}
return inputStr;
}
TDS_Calc.prototype.getFirstCharCode = function(inputStr, code)
{
for (var i=0; i<inputStr.length; i++) {
if (inputStr.charCodeAt(i) == code) return i;
}
return -1;
}
var focuskeys = [
{id: 'plus', symbol: '+'},
{id: 'minus', symbol: '-'},
{id: 'multiply', symbol: '*'},
{id: 'divide', symbol: '/'}
];
function CalcReturnKeyPressProcess(myfield, e) {
if ((BrowserUtils.isTouchBrowser() || BrowserUtils.isChromeOS()) && e.keyCode == 13) {
CalcKeyPressProcess(myfield, e);
return false;
} else return false;
};
function CalcKeyPressProcess(myfield, e) {
var curClass = document.getElementById("calculatorwidget");
if (YAHOO.util.Dom.hasClass(curClass, 'regressions') && (myfield.id == 'textinput')) return false;
var code;
if (!e) var e = window.event;
if ((e.keyCode == 45) && (e.which == 0)) return false;
if ((e.keyCode == 40) && (e.which == 0)) return false;
if ((e.keyCode == 38) && (e.which == 0)) return false;
if ((e.keyCode == 37) && (e.which == 0)) {
var currentPos = CaretPositionUtils.getCaretPosition(myfield);
if (currentPos > 0)
CaretPositionUtils.setCaretPosition(myfield, currentPos - 1);
return false;
}
if ((e.keyCode == 39) && (e.which == 0)) {
var currentPos = CaretPositionUtils.getCaretPosition(myfield);
if ('value' in myfield)
{
var currentValue = myfield.value;
if (currentValue != null && currentPos < currentValue.length)
{
CaretPositionUtils.setCaretPosition(myfield, currentPos + 1);
}
}
return false;
}
if (e.keyCode) code = e.keyCode;
else if (e.which) {
code = e.which;
}
if (code == 13) {
getWorkingCalcInstance().doCalculation();
return false;
}
if (code == 8) {
getWorkingCalcInstance().clearInput('backspace');
return false;
}
if (code == 46 && e.keyCode == 46 && e.which == 0) {
getWorkingCalcInstance().clearInput('delete');
return false;
}
var character = String.fromCharCode(code);
var allowed = false;
var allowedType = '[0-9]|[.]|[\b]';
if ((getCurCalcMode() == CalcModeList['Basic']) || (getCurCalcMode() == CalcModeList['Standard']) || (getCurCalcMode() == CalcModeList['StandardMem'])) {
clearkeyFocus();
allowed = character.match(new RegExp(allowedType, "g"));
if (allowed) {
var calc = getWorkingCalcInstance();
if ((calc.immediateEvalFlag.inputClearFlag)&&(myfield.id == 'textinput')) document.getElementById(myfield.id).value = '';
var new_contents = '';
if (calc.immediateEvalFlag.oprandContinueFlag) {
new_contents = document.getElementById(myfield.id).value;
if (new_contents.length < getMaxInputLen(myfield)) {
CaretPositionUtils.insertCharacter(myfield, character);
}
}
else
{
new_contents = character;
calc.immediateEvalFlag.oprandContinueFlag = true;
document.getElementById(myfield.id).value = new_contents;
}
calc.immediateEvalFlag.previousIsBiOp = false;
calc.immediateEvalFlag.inputClearFlag = false;
}
basicFunctionKeyProcess(character);
return false;
} else {
if (getCurCalcMode() == CalcModeList['Graphing'] || getCurCalcMode() == CalcModeList['GraphingInv']) allowedType += '|[x]';
if (getCurCalcMode() == CalcModeList['Graphing'] ||
getCurCalcMode() == CalcModeList['Scientific'] ||
getCurCalcMode() == CalcModeList['GraphingInv'] ||
getCurCalcMode() == CalcModeList['ScientificInv']) allowedType += '|[!]';
if (getCurCalcMode() == CalcModeList['Regression']) {
allowed = character.match(new RegExp(allowedType, "g"));
}
else {
allowedType += '|[()+-]|[*]|[/]';
allowed = character.match(new RegExp(allowedType, "g"));
if (character == '^') allowed = true;
}
if (allowed) {
new_contents = document.getElementById(myfield.id).value;
if (new_contents.length < getMaxInputLen(myfield, character) &&
PreciseUtils.validatedInputFractionalPartLen(myfield, character)) {
var workingCalc = getWorkingCalcInstance();
if (workingCalc.immediateEvalFlag && workingCalc.immediateEvalFlag.resultClearFlag && myfield.id == 'textinput') {
getWorkingCalcInstance().immediateEvalFlag.resultClearFlag = false;
if (character.match(new RegExp("[0-9]", "g"))) {
document.getElementById(myfield.id).value = '';
}
}
return true;
}
else return false;
}
return false;
}
function basicFunctionKeyProcess(ch)
{
var found = false;
var i;
for (i=0; i<focuskeys.length; i++)
{
if (focuskeys[i].symbol == ch) {
found = true;
break;
}
}
if (found) {
clearkeyFocus();
var thisBtn = document.getElementById(focuskeys[i].id);
if (thisBtn!=null) YAHOO.util.Dom.addClass(thisBtn, 'focused');
buttonPressed(focuskeys[i].id);
} else return;
}
}
function CalcFocusGained(element, event)
{
if (getWorkingCalcInstance() != null && typeof getWorkingCalcInstance().focusGained == 'function')
{
getWorkingCalcInstance().focusGained(element, event);
}
}
function CalcFocusLost(element, event) {
if (getWorkingCalcInstance() != null && typeof getWorkingCalcInstance().focusLost == 'function') {
getWorkingCalcInstance().focusLost(element, event);
}
}
function clearkeyFocus()
{
for (var i=0; i<focuskeys.length; i++) {
var btn = document.getElementById(focuskeys[i].id);
if (YAHOO.util.Dom.hasClass(btn, 'focused')) YAHOO.util.Dom.removeClass(btn, 'focused');
}
}
function getCurCalcMode()
{
var curClass = document.getElementById("calculatorwidget");
for (var i=0; i< CalcConfigBase.length; i++) {
if (YAHOO.util.Dom.hasClass(curClass, CalcConfigBase[i].css)) {
if (!YAHOO.util.Dom.hasClass(curClass, CalcConfigBase[i].css + ' inv')) {
return CalcConfigBase[i].name;
}
}
}
return null;
}
function getMaxInputLen(inputField, character) {
if (inputField == null) {
return 0;
}
var textinputId = inputField.id;
var lens = getWorkingCalcInstance().config.textInputLen;
for (var i = 0; i < lens.length; i++) {
if (lens[i].id == 'Any') return lens[i].len;
if (textinputId == lens[i].id) {
var inputId = inputField.id;
if ((inputId == 'xmin' || inputId == 'xmax' || inputId == 'ymin' || inputId == 'ymax') && inputField.value.length == lens[i].len) {
var firstCharCode = inputField.value.charCodeAt(0);
var caretPos = CaretPositionUtils.getCaretPosition(inputField);
if (firstCharCode == 8208 || firstCharCode == 45 || (caretPos == 0 && (character.charCodeAt(0) == 8208 || character.charCodeAt(0) == 45))) {
return lens[i].len + 1;
}
} else {
return lens[i].len;
}
}
}
return 0;
}
function getMaxFractionalPartLen(inputField) {
if (inputField == null) {
return 0;
}
var inputId = inputField.id;
var lens = getWorkingCalcInstance().config.fractionalPartLen;
return lens[inputId];
}
var BrowserDetect = {
init: function () {
this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
this.version = this.searchVersion(navigator.userAgent)
|| this.searchVersion(navigator.appVersion)
|| "an unknown version";
this.OS = this.searchString(this.dataOS) || "an unknown OS";
},
searchString: function (data) {
for (var i=0;i<data.length;i++) {
var dataString = data[i].string;
var dataProp = data[i].prop;
this.versionSearchString = data[i].versionSearch || data[i].identity;
if (dataString) {
if (dataString.indexOf(data[i].subString) != -1)
return data[i].identity;
}
else if (dataProp)
return data[i].identity;
}
},
searchVersion: function (dataString) {
var index = dataString.indexOf(this.versionSearchString);
if (index == -1) return;
return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
},
dataBrowser: [
{
string: navigator.userAgent,
subString: "Chrome",
identity: "Chrome"
},
{  string: navigator.userAgent,
subString: "OmniWeb",
versionSearch: "OmniWeb/",
identity: "OmniWeb"
},
{
string: navigator.vendor,
subString: "Apple",
identity: "Safari",
versionSearch: "Version"
},
{
prop: window.opera,
identity: "Opera"
},
{
string: navigator.vendor,
subString: "iCab",
identity: "iCab"
},
{
string: navigator.vendor,
subString: "KDE",
identity: "Konqueror"
},
{
string: navigator.userAgent,
subString: "Firefox",
identity: "Firefox"
},
{
string: navigator.vendor,
subString: "Camino",
identity: "Camino"
},
{
string: navigator.userAgent,
subString: "Netscape",
identity: "Netscape"
},
{
string: navigator.userAgent,
subString: "MSIE",
identity: "Explorer",
versionSearch: "MSIE"
},
{
string: navigator.userAgent,
subString: "Gecko",
identity: "Mozilla",
versionSearch: "rv"
},
{
string: navigator.userAgent,
subString: "Mozilla",
identity: "Netscape",
versionSearch: "Mozilla"
}
],
dataOS : [
{
string: navigator.platform,
subString: "Win",
identity: "Windows"
},
{
string: navigator.platform,
subString: "Mac",
identity: "Mac"
},
{
string: navigator.userAgent,
subString: "iPhone",
identity: "iPhone/iPod"
},
{
string: navigator.platform,
subString: "Linux",
identity: "Linux"
}
]
};
BrowserDetect.init();

/* SOURCE FILE: tds_calc_arithmetic.js (f9f534b8) 1/26/2015 1:19:44 PM */

function ArithmeticCalc(config, parent)
{
this.parent = parent;
this.config = config;
this.textInputIds = ['textinput'];
this.inputarea = this.outputarea = document.getElementById('textinput');
this.lazyEvaluation = config.lazyEvaluation;
this.ANS;
this.radianOrDegree = 'degrees';
this.immediateEvalFlag = {
storedValue: '',
preOperator: '',
oprandContinueFlag: true,
previousIsBiOp: false,
inputClearFlag: false,
resultClearFlag: false
};
this.lazyInputClearFlag = true;
this.init();
}
ArithmeticCalc.prototype.getInputArea = function() {
return this.inputarea;
};
ArithmeticCalc.prototype.setFocus = function () {
return;
};
ArithmeticCalc.prototype.reset = function() {
this.clearInput('C');
this.arithmeticCalcReset();
};
ArithmeticCalc.prototype.arithmeticCalcReset = function () {
this.radianOrDegree = 'degrees';
resetRadianDegree(this.radianOrDegree);
};
ArithmeticCalc.prototype.setRadianOrDegree = function (rd) {
this.radianOrDegree = rd;
};
ArithmeticCalc.prototype.getRadianOrDegree = function () {
return this.radianOrDegree;
};
ArithmeticCalc.prototype.clearInput = function(id)
{
var inputarea = this.getInputArea();
if ((id == 'C') || (id == 'CE')) {
inputarea.value = '';
if (id == 'C') {
this.resetImmEvalFlags();
document.getElementById('memorystatus').value = '';
document.getElementById('memorystatusStandard').value = '';
memoryValue = '';
var ANSBtn = document.getElementById("ANS");
if (!YAHOO.util.Dom.hasClass(ANSBtn, 'disabled')) YAHOO.util.Dom.addClass(ANSBtn, 'disabled');
ANSBtn.setAttribute('disabled', 'disabled');
var RCLBtn = document.getElementById("RCL");
if (!YAHOO.util.Dom.hasClass(RCLBtn, 'disabled')) YAHOO.util.Dom.addClass(RCLBtn, 'disabled');
RCLBtn.setAttribute('disabled', 'disabled');
this.ANS = null;
}
}
else if (id == 'delete')
{
CaretPositionUtils.applyDeleteKeyPress(inputarea);
}
else {
CaretPositionUtils.applyBackspaceKeyPress(inputarea);
}
}
ArithmeticCalc.prototype.getOutputArea = function() {
return this.outputarea;
};
ArithmeticCalc.prototype.setTextInput = function() {
document.getElementById('textinput').setAttribute('style', 'display:block');
if (!BrowserUtils.isTouchBrowser()) {
document.getElementById('textinput').removeAttribute('readonly');
}
};
var ArithButtonMaps = [];
ArithButtonMaps.push( {id: 'ANS', func: processANS});
ArithmeticCalc.prototype.init = function()
{
for (var i=0; i<ArithButtonMaps.length; i++)
{
var btnObj = document.getElementById(ArithButtonMaps[i].id);
if (btnObj) {
YAHOO.util.Event.removeListener(btnObj, "click", ArithButtonMaps[i].func);
YAHOO.util.Event.addListener(btnObj, "click", ArithButtonMaps[i].func);
}
}
this.parent.textInputFocusInit(this.textInputIds);
}
ArithmeticCalc.prototype.setInitKeyboardElement = function() {
var initialInput = document.getElementById('textinput');
setTimeout(function() {
FocusUtils.setCalcFocus(initialInput);
}, 0);
this.parent.keyboardNav.curRegion = 'calcControls';
this.parent.keyboardNav.RegionIndex = 0;
this.parent.keyboardNav.curElement = 'textinput';
};
ArithmeticCalc.prototype.isNumber = function(n) {
return !isNaN(parseFloat(n)) && isFinite(n);
}
ArithmeticCalc.prototype.setANS = function(result) {
if (this.isNumber(result))
this.ANS = result;
}
ArithmeticCalc.prototype.clearFocus = function (divsMap) {
clearFocus(divsMap);
};
function processANS(e)
{
var calc = getWorkingCalcInstance();
if (calc.ANS == null) return;
if (calc.lazyEvaluation) {
if (calc.lazyInputClearFlag) {
calc.getInputArea().value = calc.ANS;
calc.lazyInputClearFlag = false;
} else calc.getInputArea().value += calc.ANS;
} else {
calc.getInputArea().value = calc.ANS;
}
}
ArithmeticCalc.prototype.doCalculation = function()
{
if (this.lazyEvaluation) {
var rst = this.evalArithmeticExpression(this.getInputArea().value.replace(/^\s*|\s*$/g, ''));
var outputarea = this.getOutputArea();
outputarea.value = rst;
CaretPositionUtils.setCaretPosition(outputarea, outputarea.value.length);
this.setANS(rst);
this.lazyInputClearFlag = true;
this.immediateEvalFlag.resultClearFlag = true;
}
else {
var value = this.getInputArea().value;
var rst = '';
if ((value.length > 0) && (this.immediateEvalFlag.storedValue.length > 0) && (this.immediateEvalFlag.preOperator.length > 0)) {
rst = this.evalArithmeticExpression('(' + this.immediateEvalFlag.storedValue + ')' + this.immediateEvalFlag.preOperator + '(' + value + ')');
rst = rst.toString().replace('-', '\u2010');
this.getInputArea().value = rst;
if ((rst + '').indexOf('error') != -1) {
this.immediateEvalFlag.inputClearFlag = true;
this.resetImmEvalFlags();
} else {
this.setANS(rst);
this.immediateEvalFlag.oprandContinueFlag = false;
this.immediateEvalFlag.preOperator = '';
this.immediateEvalFlag.previousIsBiOp = false;
}
}
}
var ANSBtn = document.getElementById("ANS");
if (this.ANS != null) {
if (YAHOO.util.Dom.hasClass(ANSBtn, 'disabled')) YAHOO.util.Dom.removeClass(ANSBtn, 'disabled');
ANSBtn.removeAttribute('disabled');
}
else {
if (!YAHOO.util.Dom.hasClass(ANSBtn, 'disabled')) YAHOO.util.Dom.addClass(ANSBtn, 'disabled');
ANSBtn.setAttribute('disabled', 'disabled');
}
clearkeyFocus();
CaretPositionUtils.preventOnscreenKB(this.getInputArea());
}
ArithmeticCalc.prototype.resetImmEvalFlags = function()
{
this.immediateEvalFlag.storedValue = '';
this.immediateEvalFlag.preOperator = '';
this.immediateEvalFlag.oprandContinueFlag = true;
this.immediateEvalFlag.previousIsBiOp = false;
}
ArithmeticCalc.prototype.evalArithmeticExpression = function(expression)
{
return this.parent.evalExpression(expression);
}
ArithmeticCalc.prototype.buttonPressProcess = function(e)
{
var id;
var element;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
if (target.nodeName == 'SUP') {
target = target.parentNode;
}
element =  document.getElementById(target.id);
id = target.id;
} else {
if (applyFuncFromButtonMap(ArithButtonMaps, e)) return;
element = document.getElementById(e);
id = e;
}
if (id == 'sign') {
getTDSCalc().flip_sign(e);
return;
}
var s = element.getAttribute('val');
if (s == null)
{
var parent = element.parentNode;
for (var counter1 = 1; parent != null && counter1 < 4; ++counter1)
{
s = parent.getAttribute('val');
if (s != null)
break;
parent = parent.parentNode;
}
if (s == null)
return;
}
var operator = element.getAttribute('op');
var numOprands = element.getAttribute('numOprands');
var onePos = element.getAttribute('onePos');
var isClearExistingInputFlag = (element.getAttribute('clearExistingInput') == null || element.getAttribute('clearExistingInput') == "true");
if (this.immediateEvalFlag.inputClearFlag) {
this.getInputArea().value = '';
this.immediateEvalFlag.inputClearFlag = false;
}
var new_contents;
if (this.lazyEvaluation) {
if (this.lazyInputClearFlag && isClearExistingInputFlag) {
var inputarea = this.getInputArea();
inputarea.value = s;
var currentPosition = CaretPositionUtils.getCaretPosition(inputarea) + s.length;
CaretPositionUtils.setCaretPosition(inputarea, currentPosition);
} else {
new_contents = this.getInputArea().value;
if (new_contents.length < getMaxInputLen(this.getInputArea())) {
if (this.immediateEvalFlag.resultClearFlag) {
this.immediateEvalFlag.resultClearFlag = false;
if(operator != 'true')  this.getInputArea().value = '';
}
CaretPositionUtils.insertCharacter(this.getInputArea(), s);
}
}
this.lazyInputClearFlag = false;
} else {
if (operator != 'true') {
if (this.immediateEvalFlag.oprandContinueFlag) {
new_contents = this.getInputArea().value;
if (new_contents.length < getMaxInputLen(this.getInputArea()))
CaretPositionUtils.insertCharacter(this.getInputArea(), s);
}
else {
this.getInputArea().value = s;
this.immediateEvalFlag.oprandContinueFlag = true;
}
this.immediateEvalFlag.previousIsBiOp = false;
}
else {
new_contents = this.processOperator(this.getInputArea(), s, numOprands, onePos);
this.immediateEvalFlag.oprandContinueFlag = false;
this.getInputArea().value = new_contents;
}
}
FocusUtils.setCalcFocus(this.getInputArea(), e);
}
ArithmeticCalc.prototype.processOperator = function(inputarea, s, numOprands, onePos)
{
var value = inputarea.value;
if (value.length == 0) return '';
var rst='';
if (numOprands == 1) {
this.immediateEvalFlag.previousIsBiOp = false;
if (s=='%') {
rst = handlePercentage(value);
return rst;
} else
if (s=='/') {
rst = handleReciprocal(value);
return rst;
}
var s2 = s.replace('(', '');
if (onePos == 0) rst = this.evalArithmeticExpression(s2+'('+value+')');
else rst = this.evalArithmeticExpression('('+value+')'+s2);
return rst;
}
else
{
if (numOprands == 2)
{
if (!this.immediateEvalFlag.previousIsBiOp && (this.immediateEvalFlag.storedValue.length>0) && (this.immediateEvalFlag.preOperator.length>0)) {
rst = this.evalArithmeticExpression('('+this.immediateEvalFlag.storedValue+')' + this.immediateEvalFlag.preOperator + '('+value + ')');
this.immediateEvalFlag.preOperator = s;
this.immediateEvalFlag.storedValue = rst + '';
this.immediateEvalFlag.previousIsBiOp = true;
return rst;
}
if (this.immediateEvalFlag.previousIsBiOp) {
this.immediateEvalFlag.preOperator = s;
} else {
this.immediateEvalFlag.storedValue = value + '';
this.immediateEvalFlag.preOperator = s;
}
this.immediateEvalFlag.previousIsBiOp = true;
return value;
}
}
return '';
function handlePercentage(value)
{
var calc = getWorkingCalcInstance();
if ( (calc.immediateEvalFlag.preOperator=='+') || (calc.immediateEvalFlag.preOperator=='-')||
(calc.immediateEvalFlag.preOperator=='*')|| (calc.immediateEvalFlag.preOperator=='/') )
{
if (calc.immediateEvalFlag.storedValue.length == 0) return '0';
var rst = parseFloat(calc.immediateEvalFlag.storedValue) + '*' + parseFloat(value)/100;
return calc.evalArithmeticExpression(rst);
}
return '0';
}
function handleReciprocal(value)
{
return 1/value;
}
}

/* SOURCE FILE: tds_calc_regression.js (f20beaa5) 1/26/2015 1:19:44 PM */

var BasisFuncs = {
constant: function() { return 1;},
x: function(x) { return x;},
xsquare: function (x) { return x * x; },
logX: function(x) { return Math.log(x); }
}
var modelList = ['Linear', 'Quadratic', 'Exponential', 'Power'];
var RegressionModel = [];
RegressionModel['Linear'] = {
basis:[BasisFuncs.x, BasisFuncs.constant],
presentation:'({0})x+({1})',
convertY: null,
convertResult:null
};
RegressionModel['Quadratic'] = {
basis:[BasisFuncs.xsquare,BasisFuncs.x, BasisFuncs.constant],
presentation: '({0})x^2+({1})x+({2})',
convertY: null,
convertResult:null
};
RegressionModel['Exponential'] = {
basis:[BasisFuncs.constant, BasisFuncs.x],
presentation:'({0})*({1})^x',
convertY: function(x) {return Math.log(x)},
convertResult: function(x) { return Math.exp(x)}
};
RegressionModel['Power'] = {
basis: [BasisFuncs.constant, BasisFuncs.logX],
presentation: '({0})x^({1})',
convertY: function (x) { return Math.log(x) },
convertResult: [function (x) { return Math.exp(x); }, function(x) { return x; } ]
};
function RegressionCalc(config, parent)
{
this.config = config;
this.parent = parent;
this.maxDataEntry = 50;
this.textInputIds = [];
this.dataLabelNames = ['X', 'Y1', 'Y2', 'Y3', 'Y4'];
this.activeInputArea = undefined;
this.outputarea = document.getElementById('textinput');
this.init();
}
RegressionCalc.prototype.getOutputArea = function()
{
return this.outputarea;
}
RegressionCalc.prototype.setFocus = function () {
return;
};
RegressionCalc.prototype.getInputArea = function()
{
if (this.activeInputArea) return document.getElementById(this.activeInputArea);
for (var i = 0; i < this.textInputIds.length; i++)
{
if (document.getElementById(this.textInputIds[i]).hasFocus())
{
return document.getElementById(this.textInputIds[i]);
}
}
return document.getElementById(this.textInputIds[0]);
}
RegressionCalc.prototype.setActiveInputArea = function(id)
{
this.activeInputArea = id;
}
RegressionCalc.prototype.reset = function() {
this.clearRegressionData();
}
var RegButtonMap = [];
RegButtonMap.push({id:'Linear', func: doRegressionCalculation});
RegButtonMap.push({id:'Quadratic', func: doRegressionCalculation});
RegButtonMap.push({ id: 'Exponential', func: doRegressionCalculation });
RegButtonMap.push({ id: 'Power', func: doRegressionCalculation });
RegButtonMap.push({id:'regclearall', func: clearRegressDataInput});
RegressionCalc.prototype.clearInput = function (id)
{
var inputarea = this.getInputArea();
if (id == 'delete')
{
CaretPositionUtils.applyDeleteKeyPress(inputarea);
}
else if (id != 'backspace') {
inputarea.value = '';
}
else {
CaretPositionUtils.applyBackspaceKeyPress(inputarea);
}
}
RegressionCalc.prototype.setTextInput = function()
{
document.getElementById('textinput').setAttribute('style', 'display:block');
document.getElementById('textinput').setAttribute('readonly', 'readonly');
document.getElementById('textinput').value = '';
}
RegressionCalc.prototype.focusGained = function(field, event)
{
if (typeof getWorkingCalcInstance == 'function')
{
if (this.textInputIds != null && this.textInputIds.length > 0)
{
var found = false;
for (var counter1 = 0; counter1 < this.textInputIds.length; ++counter1)
{
if (this.textInputIds[counter1] == field.id)
{
found = true;
break;
}
}
if (found)
getWorkingCalcInstance().setActiveInputArea(field.id);
else
{
getWorkingCalcInstance().setActiveInputArea(this.textInputIds[0])
}
}
if (field.id.match('reg-[X|Y]([0-9]*)-1$')) {
document.getElementById('yNumb').scrollTop = -50;
}
}
}
RegressionCalc.prototype._addEventHandlers = function(id)
{
document.getElementById(id).setAttribute('onkeypress', 'return CalcKeyPressProcess(this,event)');
document.getElementById(id).setAttribute('onfocus', 'return CalcFocusGained(this, event)');
}
RegressionCalc.prototype.init = function()
{
for (var i = 0; i < this.dataLabelNames.length; i++)
{
for (var j = 0; j < this.maxDataEntry; j++)
{
var id = 'reg-' + this.dataLabelNames[i] + '-' + (j + 1);
this._addEventHandlers(id);
this.textInputIds.push(id);
}
}
for (var i = 0; i < RegButtonMap.length; i++)
{
var btnObj = document.getElementById(RegButtonMap[i].id);
if (btnObj)
{
YAHOO.util.Event.removeListener(btnObj, "click", RegButtonMap[i].func);
YAHOO.util.Event.addListener(btnObj, "click", RegButtonMap[i].func);
}
}
this.parent.textInputFocusInit(this.textInputIds);
}
RegressionCalc.prototype.setInitKeyboardElement = function() {
var initialInput = document.getElementById('reg-X-1');
setTimeout(function() {
FocusUtils.setCalcFocus(initialInput);
}, 0);
this.parent.keyboardNav.curRegion = 'yNumb';
this.parent.keyboardNav.RegionIndex = getRegionDivsByMode(CalcModeList['Regression']).length - 1;
this.parent.keyboardNav.curElement = 'reg-X-1';
};
RegressionCalc.prototype.getData = function(xy)
{
var data = [];
for (var i=0; i<this.maxDataEntry; i++)
{
var id = 'reg-' + xy + '-' + (i+1);
var value = document.getElementById(id).value;
if (value == '') break;
var expRst = this.parent.evalExpression(value);
if ((expRst+'').indexOf('error')!=-1) return 'Input Data error';
data.push(expRst);
}
return $V(data);
}
function clearRegressDataInput()
{
var calc = getWorkingCalcInstance();
if (calc != null && typeof calc.clearRegressionData == 'function')
calc.clearRegressionData();
}
RegressionCalc.prototype.clearRegressionData = function() {
for (var i = 0; i < this.dataLabelNames.length; i++) {
for (var j = 0; j < this.maxDataEntry; j++) {
var idName = 'reg-' + this.dataLabelNames[i] + '-' + (j + 1);
document.getElementById(idName).value = '';
}
}
this.setActiveRegressionButton(null);
this.getOutputArea().value = '';
};
RegressionCalc.prototype.buttonPressProcess = function(e)
{
var id;
if (typeof(e) == 'object') {
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else {
id = e;
if (applyFuncFromButtonMap(RegButtonMap, id)) return;
}
if (id == 'sign') {
getTDSCalc().flip_sign(e);
return;
}
var s = document.getElementById(id).getAttribute('val');
if (s == null) return;
var new_contents = this.getInputArea().value;
if (new_contents.length < getMaxInputLen(this.getInputArea()))
CaretPositionUtils.insertCharacter(this.getInputArea(), s);
FocusUtils.setCalcFocus(this.getInputArea(), e);
}
RegressionCalc.prototype.doCalculation = function()
{
var expression = this.getInputArea().value;
if (expression == '') return;
var rst = this.parent.evalExpression(expression) + '';
if (rst.indexOf('error')!= -1) this.getInputArea().value = 'Error';
else this.getInputArea().value = rst;
}
RegressionCalc.prototype.clearFocus = function (divsMap) {
clearFocus(divsMap);
};
function getPresentationString(params, presentationString) {
if (params == null) return presentationString;
for (var i = 0, l = params.length; i < l; ++i)
{
var reg = new RegExp("\\{" + i + "\\}", "g");
presentationString = presentationString.replace(reg, '' + params[i]);
}
return presentationString;
}
function doRegressionCalculation(e)
{
var id;
var calc = getWorkingCalcInstance();
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
calc.setActiveRegressionButton(target.id);
id = target.id;
} else
{
calc.setActiveRegressionButton(e);
id = e;
}
var model= RegressionModel[id];
var X = calc.getData('X');
if (typeof(X)!='object') {
calc.getOutputArea().value = 'Invalid data in X';
return;
}
if (model.basis.length > X.elements.length) {
calc.getOutputArea().value = 'Insufficient Data';
return;
}
calc.getOutputArea().value = '';
for (var j=1; j< calc.dataLabelNames.length; j++)
{
var Y = calc.getData(calc.dataLabelNames[j]);
if (typeof(Y)!='object') {
calc.getOutputArea().value = 'Invalid data in '+ calc.dataLabelNames[j];
return;
}
if (Y.elements.length == 0) continue;
try {
var rst = calc.doRegression(model, X, Y);
var isInappropriateData = false;
for (var i=0; i<rst.elements.length; i++) {
var parameter = calc.parent.processE(rst.elements[i]);
if ((parameter+'' == 'NaN')||(parameter+'' == 'Infinity')) {
isInappropriateData = true;
break;
}
rst.elements[i] = parameter;
}
var str = '';
if (isInappropriateData)
str = 'Inappropriate data';
else
str = getPresentationString(rst.elements, model.presentation);
calc.getOutputArea().value += calc.dataLabelNames[j] + '=' + str + '\n';
} catch (ex) {
calc.getOutputArea().value += calc.dataLabelNames[j] + '= input data error\n';
}
}
}
RegressionCalc.prototype.setActiveRegressionButton = function (modelId)
{
for (var i = 0; i < modelList.length; i++)
{
var modelNode = document.getElementById(modelList[i]);
if (YAHOO.util.Dom.hasClass(modelNode, 'active')) YAHOO.util.Dom.removeClass(modelNode, 'active');
}
if (modelId != null)
{
var activeCurNode = document.getElementById(modelId);
if (activeCurNode) YAHOO.util.Dom.addClass(activeCurNode, 'active');
}
}
RegressionCalc.prototype.doRegression = function (model, vX, vY) {
var dM = [];
for (var i = 0; i < vX.elements.length; i++) {
var dV = [];
for (var j = 0; j < model.basis.length; j++) {
dV.push(model.basis[j](vX.e(i + 1)));
}
dM.push(dV);
}
if (model.convertY != null) {
for (var i = 0; i < vY.elements.length; i++)
vY.elements[i] = model.convertY(vY.elements[i]);
}
var dMatrix = new $M(dM);
if (dMatrix.determinant() == 0) throw "Singular matrix";
var gramT = dMatrix.transpose().multiply(dMatrix);
var MM = gramT.inverse().multiply(dMatrix.transpose());
var rst = MM.multiply(vY);
if (model.convertResult != null) {
if (model.convertResult instanceof Function) {
for (var i = 0; i < rst.elements.length; i++)
rst.elements[i] = model.convertResult(rst.elements[i]);
}
else if (model.convertResult instanceof Array) {
for (var i = 0; i < rst.elements.length; i++)
rst.elements[i] = model.convertResult[i](rst.elements[i]);
}
}
if (typeof rst.elements != 'undefined') {
for (var i = 0; i < rst.elements.length; i++) {
rst.elements[i] = PreciseUtils.setResultPrecision(rst.elements[i], 2);
}
} else {
throw new Error("Illegal operation in regression: expected Matrix, got " + typeof(rst));
}
return rst;
}

/* SOURCE FILE: tds_calc_matrices.js (487bc363) 1/26/2015 1:19:44 PM */

function LinearalgebraCalc(config, parent)
{
this.parent = parent;
this.config = config;
this.curMatrix = 'M1';
this.maxDimSize = 7;
this.matrixIds = ['M1', 'M2', 'M3', 'M4', 'M5', 'Result'];
this.textinputarea = document.getElementById('textinput');
this.textInputIds = [];
this.definedTokens = [];
this.activeInputArea = undefined;
this.init();
}
var LAButtonMap = [];
LAButtonMap.push({id:'M1-Result', func: doMatrixCalculation});
LAButtonMap.push({id:'M2-Result', func: doMatrixCalculation});
LAButtonMap.push({id:'M3-Result', func: doMatrixCalculation});
LAButtonMap.push({id:'M4-Result', func: doMatrixCalculation});
LAButtonMap.push({id:'M5-Result', func: doMatrixCalculation});
LAButtonMap.push({id:'Result-Result', func: doMatrixCalculation});
LAButtonMap.push({id:'M1-Clear', func: clearMatrixInput});
LAButtonMap.push({id:'M2-Clear', func: clearMatrixInput});
LAButtonMap.push({id:'M3-Clear', func: clearMatrixInput});
LAButtonMap.push({id:'M4-Clear', func: clearMatrixInput});
LAButtonMap.push({id:'M5-Clear', func: clearMatrixInput});
LAButtonMap.push({id:'Result-Clear', func: clearMatrixInput});
LAButtonMap.push({id:'laclearentry', func: laClearInput});
LAButtonMap.push({id:'laclearall', func: laClearInput});
LAButtonMap.push({id:'M1', func: chooseMatrix});
LAButtonMap.push({id:'M2', func: chooseMatrix});
LAButtonMap.push({id:'M3', func: chooseMatrix});
LAButtonMap.push({id:'M4', func: chooseMatrix});
LAButtonMap.push({id:'M5', func: chooseMatrix});
LAButtonMap.push({id:'inputM1', func: matrixInputButtonPressed});
LAButtonMap.push({id:'inputM2', func: matrixInputButtonPressed});
LAButtonMap.push({id:'inputM3', func: matrixInputButtonPressed});
LAButtonMap.push({id:'inputM4', func: matrixInputButtonPressed});
LAButtonMap.push({id:'inputM5', func: matrixInputButtonPressed});
LinearalgebraCalc.prototype.clearInput = function(id) {
var inputarea = this.getInputArea();
if (id == 'delete') {
CaretPositionUtils.applyDeleteKeyPress(inputarea);
}
else if (id != 'backspace') {
inputarea.value = '';
}
else {
CaretPositionUtils.applyBackspaceKeyPress(inputarea);
}
};
LinearalgebraCalc.prototype.reset = function() {
this.clearMatrixInputElements('M1');
this.clearMatrixInputElements('M2');
this.clearMatrixInputElements('M3');
this.clearMatrixInputElements('M4');
this.clearMatrixInputElements('M5');
this.clearMatrixInputElements('Result');
};
LinearalgebraCalc.prototype.setFocus = function () {
return;
};
LinearalgebraCalc.prototype.clearFocus = function (divsMap) {
clearFocus(divsMap);
};
function matrixInputButtonPressed(e)
{
var calc = getWorkingCalcInstance();
var matrixBtnId;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
matrixBtnId =  target.id;
} else {
matrixBtnId = e;
}
var s = matrixBtnId.substring(matrixBtnId.length-2);
var expressionArea = calc.getExpressionArea();
var new_contents = expressionArea.value + s;
expressionArea.value = new_contents;
var currentPosition = CaretPositionUtils.getCaretPosition(expressionArea) + s.length;
CaretPositionUtils.setCaretPosition(expressionArea, currentPosition);
FocusUtils.setCalcFocus(expressionArea, e);
}
function laClearInput(e)
{
var inputarea = getWorkingCalcInstance().getInputArea();
var target = YAHOO.util.Event.getTarget(e);
if (target.id == 'laclearall')
{
inputarea.value = '';
} else {
var value = inputarea.value;
if (value.length > 0) inputarea.value = value.substring(0, value.length-1);
}
}
function chooseMatrix(e)
{
var id;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else{
id = e;
}
for (var i=0; i<getWorkingCalcInstance().matrixIds.length; i++)
{
document.getElementById('matrix-' + getWorkingCalcInstance().matrixIds[i]).setAttribute('style', 'display:none');
var spanNode = document.getElementById(getWorkingCalcInstance().matrixIds[i]+'span');
}
var mId = 'matrix-'+ id;
document.getElementById(mId).setAttribute('style', 'display:block');
setActiveMatrix(id);
}
function setActiveMatrix(M)
{
getWorkingCalcInstance().curMatrix = M;
for (var i=0; i<getWorkingCalcInstance().matrixIds.length-1; i++)
{
var spanNode = document.getElementById(getWorkingCalcInstance().matrixIds[i]+'span');
if (YAHOO.util.Dom.hasClass(spanNode, 'active')) YAHOO.util.Dom.removeClass(spanNode, 'active');
}
if (M=='Result') return;
var activeCurNode = document.getElementById(M+'span');
YAHOO.util.Dom.addClass(activeCurNode, 'active');
}
LinearalgebraCalc.prototype.getActiveMatrix = function()
{
for (var i=0; i<this.matrixIds.length; i++)
{
if (document.getElementById('matrix-' + this.matrixIds[i]).style.display == 'block')
return this.matrixIds[i];
}
return null;
}
function showResult(e)
{
for (var i=0; i<getWorkingCalcInstance().matrixIds.length; i++)
document.getElementById('matrix-' + getWorkingCalcInstance().matrixIds[i]).setAttribute('style', 'display:none');
document.getElementById('matrix-Result').setAttribute('style', 'display:block');
setActiveMatrix('Result');
}
function chooseDimSize(e)
{
var calc = getWorkingCalcInstance();
var metaData;
if (typeof(e) == 'object')
{
metaData = e.target.value.split('-');
} else {
metaData = e.split('-');
}
var seNode = document.getElementById(metaData[0]+'-numberRows');
var dim1Size = seNode.selectedIndex+1;
seNode = document.getElementById(metaData[0]+'-numberCols');
var dim2Size = seNode.selectedIndex+1;
if (metaData[2]!=null)
{
if (metaData[1] == 'numberRows') {
dim1Size = parseInt(metaData[2]);
} else {
dim2Size = parseInt(metaData[2]);
}
}
for (var j=0; j<calc.maxDimSize; j++)
{
for (var k=0; k<calc.maxDimSize; k++)
{
var inputNode = document.getElementById(metaData[0]+'-'+(j+1) + '-' + (k+1));
inputNode.setAttribute('style', 'display:none');
}
}
for (var j=0; j<dim1Size; j++)
{
for (var k=0; k<dim2Size; k++)
{
var inputNode = document.getElementById(metaData[0]+'-'+(j+1) + '-' + (k+1));
inputNode.setAttribute('style', 'display:block');
}
}
}
LinearalgebraCalc.prototype.buttonPressProcess = function(e)
{
var id;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else {
id = e;
if (applyFuncFromButtonMap(LAButtonMap, e)) return;
var rowcolSelButtonMap = [];
for (var i=0; i<this.maxDimSize; i++)
{
rowcolSelButtonMap.push({id:'M'+(i+1)+'-numberRows', func: chooseDimSize});
rowcolSelButtonMap.push({id:'M'+(i+1)+'-numberCols', func: chooseDimSize});
}
if (applyFuncFromButtonMap(rowcolSelButtonMap, e)) return;
}
if (this.getInputArea().getAttribute('id').indexOf('Result') != -1) return;
if (id == 'inv' || id=='det' || id == 't') {
this.getExpressionArea().focus();
if (BrowserUtils.isIE()) this.activeInputArea = 'textinput';
}
if (id == 'sign') {
getTDSCalc().flip_sign(e);
return;
}
var element =  document.getElementById(id);
var s = element.getAttribute('val');
if (s == null) return;
var new_contents = this.getInputArea().value;
if (new_contents.length < getMaxInputLen(this.getInputArea()))
CaretPositionUtils.insertCharacter(this.getInputArea(), s);
FocusUtils.setCalcFocus(this.getInputArea(), e);
}
LinearalgebraCalc.prototype.displayResult = function (resultSet) {
if (typeof resultSet.elements != 'undefined') {
var result = resultSet.elements;
for (var i = 0; i < this.maxDimSize; i++) {
for (var j = 0; j < this.maxDimSize; j++) {
var inputNode = document.getElementById('Result-' + (i + 1) + '-' + (j + 1));
inputNode.value = '';
inputNode.setAttribute('style', 'display:none');
}
}
for (var i = 0; i < result.length; i++) {
var vec = result[i];
for (var j = 0; j < vec.length; j++) {
var inputNode = document.getElementById('Result-' + (i + 1) + '-' + (j + 1));
inputNode.value = vec[j] + '';
inputNode.setAttribute('style', 'display:block;background-color:yellow');
inputNode.setAttribute('readonly', 'value');
}
}
showResult();
}
else {
var resultDisplayString = '' + resultSet;
if (resultSet < 0) {
resultDisplayString = '\u2010' +  (-1 * resultSet);
}
this.getExpressionArea().value = resultDisplayString;
}
}
LinearalgebraCalc.prototype.createMatrixInput = function()
{
var matrixContainer = document.getElementById('matricesContainer');
var mroot = document.createElement('div');
mroot.setAttribute('id', 'matrixArea');
matrixContainer.appendChild(mroot);
for (var i=0; i<this.matrixIds.length; i++)
{
var mHeadDiv = document.createElement('div');
mHeadDiv.setAttribute('id', 'matrix-' + this.matrixIds[i]);
mHeadDiv.setAttribute('style', 'display:none');
mroot.appendChild(mHeadDiv);
var numCellDiv = document.createElement('div');
numCellDiv.setAttribute('class', 'numberCells');
mHeadDiv.appendChild(numCellDiv);
if (i!=this.matrixIds.length-1)
{
var lblRow = document.createElement('label');
lblRow.setAttribute('for', 'numberRows');
lblRow.appendChild(document.createTextNode('Rows:'));
numCellDiv.appendChild(lblRow);
var selectRow = document.createElement('select');
selectRow.setAttribute('onchange', 'chooseDimSize("' + this.matrixIds[i] +'-numberRows")');
selectRow.setAttribute('id', this.matrixIds[i] + '-numberRows');
numCellDiv.appendChild(selectRow);
for (var j=0; j<this.maxDimSize; j++)
{
var option = document.createElement('option');
option.setAttribute('id', this.matrixIds[i] + '-numberRows-' + (j+1));
option.setAttribute('value', (j+1));
option.appendChild(document.createTextNode(j+1));
selectRow.appendChild(option);
}
var lblCol = document.createElement('label');
lblCol.setAttribute('for', 'numberRows');
lblCol.appendChild(document.createTextNode('Columns:'));
numCellDiv.appendChild(lblCol);
var selectCol = document.createElement('select');
selectCol.setAttribute('id', this.matrixIds[i] + '-numberCols');
selectCol.setAttribute('onchange', 'chooseDimSize("' + this.matrixIds[i] +'-numberCols")');
numCellDiv.appendChild(selectCol);
for (var j=0; j<this.maxDimSize; j++)
{
var option = document.createElement('option');
option.setAttribute('id', this.matrixIds[i] + '-nemberCols-' + (j+1));
option.setAttribute('value', (j+1));
option.appendChild(document.createTextNode(j+1));
selectCol.appendChild(option);
}
}
var clearBtn = document.createElement('a');
clearBtn.setAttribute('href', '#');
clearBtn.setAttribute('class', 'matrixClear');
clearBtn.setAttribute('id', this.matrixIds[i]+'-Clear');
clearBtn.appendChild(document.createTextNode('Clear'));
numCellDiv.appendChild(clearBtn);
var resultBtn = document.createElement('a');
resultBtn.setAttribute('href', '#');
resultBtn.setAttribute('class', 'matrixResult');
resultBtn.setAttribute('id', this.matrixIds[i]+'-Result');
resultBtn.setAttribute('style', 'display:block');
resultBtn.appendChild(document.createTextNode('Result'));
numCellDiv.appendChild(resultBtn);
var mHolderDiv = document.createElement('div');
mHolderDiv.setAttribute('id', this.matrixIds[i] + '-matrixHolder');
mHolderDiv.setAttribute('class', 'matrixHolder');
mHeadDiv.appendChild(mHolderDiv);
var mBackDiv = document.createElement('div');
mBackDiv.setAttribute('class', 'matrixBack');
mHolderDiv.appendChild(mBackDiv);
var mTableDiv = document.createElement('div');
mTableDiv.setAttribute('id', this.matrixIds[i] + 'matrixTable');
mTableDiv.setAttribute('class', 'matrixTable');
mBackDiv.appendChild(mTableDiv);
var table = document.createElement('table');
table.setAttribute('boarder', '0');
mTableDiv.appendChild(table);
for (var x=0; x<this.maxDimSize; x++)
{
var tr = document.createElement('tr');
table.appendChild(tr);
for (var y=0; y<this.maxDimSize; y++)
{
var td = document.createElement('td');
tr.appendChild(td);
var input = document.createElement('input');
var idName = this.matrixIds[i]+'-'+(x+1)+'-'+(y+1);
input.setAttribute('id', idName);
if ((x==0) && (y==0)) input.setAttribute('style', 'display:block');
else input.setAttribute('style', 'display:none');
input.setAttribute('type', 'text');
input.setAttribute('name', '');
input.setAttribute('onkeypress', 'return CalcKeyPressProcess(this,event)');
input.setAttribute('onfocus', 'return CalcFocusGained(this, event)');
td.appendChild(input);
}
}
}
document.getElementById('matrix-' + this.matrixIds[0]).setAttribute('style', 'display:block');
}
function clearMatrixInput(e)
{
var id;
if (typeof(e) == 'object') {
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else id = e;
var mId = id.split('-')[0];
if(getWorkingCalcInstance() != null && typeof getWorkingCalcInstance().clearMatrixInputElements == 'function')
getWorkingCalcInstance().clearMatrixInputElements(mId);
}
LinearalgebraCalc.prototype.clearMatrixInputElements = function(matrixId) {
for (var i = 0; i < this.maxDimSize; i++) {
for (var j = 0; j < this.maxDimSize; j++) {
var inputNode = document.getElementById(matrixId + '-' + (i + 1) + '-' + (j + 1));
inputNode.value = '';
inputNode.setAttribute('style', 'display:none');
}
}
document.getElementById(matrixId + '-1-1').setAttribute('style', 'display:block');
if (matrixId == 'Result') {
document.getElementById('textinput').value = '';
document.getElementById('textinput').focus();
return;
}
document.getElementById(matrixId + '-numberRows').value = 1;
document.getElementById(matrixId + '-numberCols').value = 1;
if (!BrowserUtils.isTouchBrowser()) {
document.getElementById(matrixId + '-numberRows').focus();
}
this.parent.keyboardNav.curRegion = 'numberRows';
this.parent.keyboardNav.RegionIndex = getRegionIndexByDivName('numberRows');
this.parent.keyboardNav.curElement = matrixId + '-numberRows';
};
LinearalgebraCalc.prototype.setTextInput = function() {
document.getElementById('textinput').setAttribute('style', 'display:block');
if (!BrowserUtils.isTouchBrowser()) {
document.getElementById('textinput').removeAttribute('readonly');
}
document.getElementById('textinput').setAttribute('onfocus', 'return CalcFocusGained(this, event)');
};
LinearalgebraCalc.prototype.focusGained = function(field, event) {
this.setActiveInputArea(field.id);
if (typeof getWorkingCalcInstance == 'function' && field.id == 'textinput') {
this.parent.keyboardNav.curRegion = getRegionDivsByMode(CalcModeList['Matrices'])[0];
this.parent.keyboardNav.RegionIndex = 0;
this.parent.keyboardNav.curElement = 'textinput';
}
if (typeof getWorkingCalcInstance == 'function' && field.id.indexOf("M") == 0) {
this.parent.keyboardNav.curRegion = getRegionDivsByMode(CalcModeList['Matrices'])[10];
this.parent.keyboardNav.RegionIndex = 10;
this.parent.keyboardNav.curElement = field.id;
}
}
LinearalgebraCalc.prototype.setActiveInputArea = function(id) {
this.activeInputArea = id;
}
LinearalgebraCalc.prototype.init = function()
{
this.createMatrixInput();
this.textInputIds = ['textinput'];
for (var x=0; x<this.matrixIds.length; x++)
{
for (var i=0; i<this.maxDimSize; i++)
{
for (var j=0; j<this.maxDimSize; j++)
{
this.textInputIds.push(this.matrixIds[x] + '-' + (i+1) + '-' + (j+1));
}
}
}
for (var i=0; i<LAButtonMap.length; i++) {
var btnObj = document.getElementById(LAButtonMap[i].id);
if (btnObj) {
YAHOO.util.Event.removeListener(btnObj, "click", LAButtonMap[i].func);
YAHOO.util.Event.addListener(btnObj, "click", LAButtonMap[i].func);
}
}
this.parent.textInputFocusInit(this.textInputIds);
}
LinearalgebraCalc.prototype.setInitKeyboardElement = function() {
var initialInput = document.getElementById('textinput');
setTimeout(function() {
FocusUtils.setCalcFocus(initialInput);
}, 0);
this.parent.keyboardNav.curRegion = getRegionDivsByMode(CalcModeList['Matrices'])[0];
this.parent.keyboardNav.RegionIndex = 0;
this.parent.keyboardNav.curElement = 'textinput';
};
LinearalgebraCalc.prototype.initMatrixTokens = function () {
var A = this.getMatrix('M1');
var B = this.getMatrix('M2');
var C = this.getMatrix('M3');
var D = this.getMatrix('M4');
var E = this.getMatrix('M5');
if (!validateInput(A)) { showInvalidDataMessage('M1'); return false; }
if (!validateInput(B)) { showInvalidDataMessage('M2'); return false; }
if (!validateInput(C)) { showInvalidDataMessage('M3'); return false; }
if (!validateInput(D)) { showInvalidDataMessage('M4'); return false; }
if (!validateInput(E)) { showInvalidDataMessage('M5'); return false; }
this.definedTokens = [];
this.definedTokens.push({ symbol: 'M1', val: A, op: false, numRand: 0, precedence: 1 });
this.definedTokens.push({ symbol: 'M2', val: B, op: false, numRand: 0, precedence: 1 });
this.definedTokens.push({ symbol: 'M3', val: C, op: false, numRand: 0, precedence: 1 });
this.definedTokens.push({ symbol: 'M4', val: D, op: false, numRand: 0, precedence: 1 });
this.definedTokens.push({ symbol: 'M5', val: E, op: false, numRand: 0, precedence: 1 });
this.definedTokens.push({ symbol: '*', val: MatrixMultiply, op: true, numRand: 2, precedence: 2 });
this.definedTokens.push({ symbol: '+', val: MatrixAdd, op: true, numRand: 2, precedence: 1 });
this.definedTokens.push({ symbol: '-', val: MatrixSubtract, op: true, numRand: 2, precedence: 1 });
this.definedTokens.push({ symbol: '\u2010', val: NegativeSignOperator, op: true, numRand: 1, precedence: 5 });
this.definedTokens.push({ symbol: 'Inv', val: MatrixInverse, op: true, numRand: 1, precedence: 3 });
this.definedTokens.push({ symbol: 'Det', val: getDeterminant, op: true, numRand: 1, precedence: 3 });
this.definedTokens.push({ symbol: 'T', val: getTranspose, op: true, numRand: 1, precedence: 3 });
this.definedTokens.push({ symbol: '(', val: '(', op: true, numRand: 0, precedence: 0 });
this.definedTokens.push({ symbol: ')', val: ')', op: true, numRand: 0, precedence: 4 });
return true;
function showInvalidDataMessage(M) {
getWorkingCalcInstance().getExpressionArea().value = 'Matrix ' + M + ' has invalid data';
}
function validateInput(M) {
if (typeof (M) == 'object') return true;
return false;
}
function MatrixInverse(m) {
return m.inverse();
}
function getTranspose(m) {
return m.transpose();
}
function getDeterminant(m) {
var determinant = m.determinant();
if (determinant == null)
throw "Matrix needs to be a square matrix.";
return determinant;
}
function MatrixAdd(m1, m2) {
return m1.add(m2);
}
function MatrixMultiply(m1, m2) {
var m1Number = false;
var m2Number = false;
if (typeof (m1) != 'object') m1Number = true;
if (typeof (m2) != 'object') m2Number = true;
if (!m1Number) return m1.multiply(m2);
if (!m2Number) return m2.multiply(m1);
return (m1 * m2);
}
function MatrixSubtract(m1, m2) {
return m1.subtract(m2);
}
function NegativeSignOperator(m1) {
return MatrixMultiply(-1, m1);
}
}
LinearalgebraCalc.prototype.getMatrix = function(M)
{
var seNode = document.getElementById(M +'-numberRows');
if (seNode == null) return;
var rows = seNode.selectedIndex+1;
seNode = document.getElementById(M + '-numberCols');
var columns = seNode.selectedIndex+1;
var matrix = [];
for (var j=0; j<rows; j++)
{
var rowVec = [];
for (var k=0; k<columns; k++)
{
var val = document.getElementById(M + '-' + (j+1) + '-' + (k+1)).value;
if (val == '') val = '0';
var expRst = this.parent.evalExpression(val);
if ((expRst+'').indexOf('error') != -1) return 'Input Data error';
rowVec.push(expRst);
}
matrix.push(rowVec);
}
return new $M(matrix);
}
LinearalgebraCalc.prototype.getInputArea = function()
{
if (this.activeInputArea) return document.getElementById(this.activeInputArea);
for (var i=0; i<this.textInputIds.length; i++) {
if (document.getElementById(this.textInputIds[i]).hasFocus())
{
return document.getElementById(this.textInputIds[i]);
}
}
return document.getElementById(this.textInputIds[0]);
}
LinearalgebraCalc.prototype.getExpressionArea = function()
{
return this.textinputarea;
}
LinearalgebraCalc.prototype.getOutputArea = function()
{
}
LinearalgebraCalc.prototype.doCalculation = function ()
{
var expression = this.getInputArea().value;
if (expression == '') return;
var rst = this.parent.evalExpression(expression) + '';
if (rst.indexOf('error')!= -1) this.getInputArea().value = 'Error';
else this.getInputArea().value = rst;
}
function doMatrixCalculation()
{
var calc = getWorkingCalcInstance();
if (!calc.initMatrixTokens()) return;
var expression = calc.getExpressionArea().value;
if (expression == '') return;
var tokens = calc.tokenize(expression);
if (tokens == null) {
calc.getExpressionArea().value = 'Invalid Symbol or Expression';
return;
}
var result;
try {
result = calc.doParse(tokens).val;
calc.displayResult(result);
} catch (e) {
var errorMessage = 'Expression error or data overflow: ' + expression;
calc.getExpressionArea().value = errorMessage;
}
}
LinearalgebraCalc.prototype.processExpression = function(expression)
{
var ex = this.parent.translate_input(expression);
return ex;
}
LinearalgebraCalc.prototype.doParse = function(tokens)
{
var opStack = [];
var oprandStack = [];
var rst;
for (var i=0; i<tokens.length; i++) {
if (tokens[i].op) {
if ((tokens[i].symbol == '(') || (opStack.length == 0)) {
opStack.push(tokens[i]);
} else
if (tokens[i].symbol == ')') {
var stTop = opStack.pop();
if (stTop.symbol != '(') {
var rst = evalOperation(stTop);
oprandStack.push(rst);
i--;
}
} else
{
var stTop = opStack.pop();
if (tokens[i].precedence > stTop.precedence) {
opStack.push(stTop);
opStack.push(tokens[i]);
} else {
var rst = evalOperation(stTop);
oprandStack.push(rst);
i--;
}
}
} else {
oprandStack.push(tokens[i]);
}
}
while (opStack.length >0) {
var stTop = opStack.pop();
var rst = evalOperation(stTop);
oprandStack.push(rst);
}
if (oprandStack.length > 1) return null;
return oprandStack.pop();
function evalOperation(op)
{
var rst = {symbol: 'Intermediate', val: null, op: false, numRand:0, precedence: 1};
switch (op.numRand) {
case 0: break;
case 1:
var rand = oprandStack.pop();
rst.val = op.val(rand.val);
break;
case 2:
var rand1 = oprandStack.pop();
var rand2 = oprandStack.pop();
rst.val = op.val(rand2.val, rand1.val);
break;
}
if (typeof rst.val.elements != 'undefined') {
for (var i = 0; i < rst.val.elements.length; i++) {
for (var j = 0; j < rst.val.elements[i].length; j++) {
rst.val.elements[i][j] = PreciseUtils.setResultPrecision(rst.val.elements[i][j], 2);
}
}
} else {
rst.val = PreciseUtils.setResultPrecision(rst.val, 2);
}
return rst;
}
}
LinearalgebraCalc.prototype.tokenize = function(expression)
{
var tokens = [];
var str = expression;
while (str.length > 0) {
var matched = false;
for (var i= 0; i<this.definedTokens.length; i++) {
var candidateToken = this.definedTokens[i].symbol;
if (candidateToken.length <= str.length) {
if (candidateToken == str.substring(0, candidateToken.length)) {
matched = true;
tokens.push(this.definedTokens[i]);
str = str.substring(candidateToken.length);
break;
}
}
}
if (!matched) {
var digitPattern = /^[0-9]|\./;
var i=0;
for (i = 0; i< str.length; i++) {
if (!digitPattern.test(str.charAt(i))) break;
}
if (i > 0) {
tokens.push({symbol: 'Number', val: parseFloat(str.substring(0,i)), op: false, numRand:0, precedence: 1});
str = str.substring(i);
} else return;
}
}
return tokens;
}

/* SOURCE FILE: tds_calc_graphing.js (2b9d1aaa) 1/26/2015 1:19:44 PM */

function GraphingCalc(config, parent)
{
this.config = config;
this.textCTX;
this.parent = parent;
this.trace = {flag: false, equationIndex: -1, offset: 0};
this.lazyEvaluation = config.lazyEvaluation;
this.viewDivIds = ['equations', 'graphwindow', 'datatableHolder', 'canvasHolder', 'grapherrorholder'];
this.views = ['yequalview', 'windowview', 'tableview', 'graphview'];
this.equationsIds = [];
this.canvas_width = 280;
this.canvas_height = this.canvas_width;
this.heightAdjust = 0;
this.initXY = 5;
this.xMinDisplaySize = this.canvas_width/10;
this.yMinDisplaySize = this.xMinDisplaySize;
this.xminX= 0-this.initXY;
this.xmaxX=this.initXY;
this.yminY=0-this.initXY;
this.ymaxY=this.initXY;
this.zoom=1;
this.maxZoom=8;
this.minZoom=0.12;
this.zoomScale = 1.2;
this.numDisplayData = 5;
this.xPos;
this.radianOrDegree = 'degrees';
this.textInputIds = [];
this.activeInputArea = undefined;
this.init();
}
GraphingCalc.prototype.setFocus = function () {
return;
};
GraphingCalc.prototype.setRadianOrDegree = function (rd) {
this.radianOrDegree = rd;
};
GraphingCalc.prototype.getRadianOrDegree = function () {
return this.radianOrDegree;
};
GraphingCalc.prototype.getInputArea = function()
{
if (this.activeInputArea) return document.getElementById(this.activeInputArea);
for (var i=0; i<this.viewDivIds.length; i++) {
var elStyle = document.getElementById(this.viewDivIds[i]).style;
if (elStyle.display == 'block') {
if ((i==3) || (i==4)) return null;
break;
}
}
for (var i=0; i<this.textInputIds.length; i++) {
if (document.getElementById(this.textInputIds[i]).hasFocus())
{
return document.getElementById(this.textInputIds[i]);
}
}
return document.getElementById(this.textInputIds[0]);
}
GraphingCalc.prototype.setActiveInputArea = function(id) {
this.activeInputArea = id;
}
GraphingCalc.prototype.focusGained = function(field, event) {
if (typeof getWorkingCalcInstance == 'function') {
getWorkingCalcInstance().setActiveInputArea(field.id);
}
}
GraphingCalc.prototype.focusLost = function (field, event) {
if (getTDSCalc().getFirstCharCode(field.value, 960) > -1) {
field.value = getFixedResult(this.parent.evalExpression(field.value));
}
}
GraphingCalc.prototype.reset = function() {
this.clearInput('C');
this.graphCalcReset();
};
var graphingButtonMap = [];
graphingButtonMap.push ({id:'calczoomin', func: graphCalcZoom});
graphingButtonMap.push ({id:'calczoomout', func: graphCalcZoom});
graphingButtonMap.push({ id: 'toggleTrace', func: toggleTrace });
graphingButtonMap.push({ id: 'toggleScroll', func: toggleTrace });
graphingButtonMap.push ({id:'resetgraph', func: graphCalcResetGlobal});
graphingButtonMap.push ({id:'previous5', func: graphCalcSetDataStartingPos});
graphingButtonMap.push ({id:'next5', func: graphCalcSetDataStartingPos});
graphingButtonMap.push ({id:'applytb', func: graphCalcApplyInitX});
graphingButtonMap.push ({id:'up', func: graphCalcMoveAxis});
graphingButtonMap.push ({id:'down', func: graphCalcMoveAxis});
graphingButtonMap.push ({id:'left', func: graphCalcMoveAxis});
graphingButtonMap.push ({id:'right', func: graphCalcMoveAxis});
graphingButtonMap.push ({id:'yequalview', func: setGraphView});
graphingButtonMap.push ({id:'windowview', func: setGraphView});
graphingButtonMap.push ({id:'tableview', func: setGraphView});
graphingButtonMap.push ({id:'graphview', func: setGraphView});
function graphCalcResetGlobal()
{
if (getWorkingCalcInstance() != null && typeof getWorkingCalcInstance().graphCalcReset == 'function')
getWorkingCalcInstance().graphCalcReset();
}
GraphingCalc.prototype.clearInput = function(id)
{
var inputarea = getWorkingCalcInstance().getInputArea();
if (inputarea == null) return;
if (id == 'delete')
{
CaretPositionUtils.applyDeleteKeyPress(inputarea);
}
else if (id != 'backspace') {
inputarea.value = '';
if (id == 'C') {
document.getElementById('memorystatus').value = '';
document.getElementById('memorystatusStandard').value = '';
memoryValue = '';
var RCLBtn = document.getElementById("RCL");
if (!YAHOO.util.Dom.hasClass(RCLBtn, 'disabled')) YAHOO.util.Dom.addClass(RCLBtn, 'disabled');
}
}
else {
CaretPositionUtils.applyBackspaceKeyPress(inputarea);
}
}
GraphingCalc.prototype.setTextInput = function()
{
document.getElementById('textinput').setAttribute('readonly', 'readonly');
}
GraphingCalc.prototype.init = function(e)
{
var equaNode = document.getElementById('equations');
var inNodes = equaNode.getElementsByTagName('input');
for (var i=0; i<inNodes.length; i++) {
this.equationsIds.push(inNodes[i].getAttribute('id'));
this.textInputIds.push(inNodes[i].getAttribute('id'));
}
this.textInputIds.push('xmin');
this.textInputIds.push('xmax');
this.textInputIds.push('xscale');
this.textInputIds.push('ymin');
this.textInputIds.push('ymax');
this.textInputIds.push('yscale');
this.textInputIds.push('initX');
this.textInputIds.push('tracestepsize');
for (var i=0; i<graphingButtonMap.length; i++) {
var btn = document.getElementById(graphingButtonMap[i].id);
if (btn) {
if(btn.type != 'radio') btn.style.display = "block";
YAHOO.util.Event.removeListener(btn, "click", graphingButtonMap[i].func);
YAHOO.util.Event.addListener(btn, "click", graphingButtonMap[i].func);
}
}
this.parent.textInputFocusInit(this.textInputIds);
this.setGraphViewById(this.viewDivIds[0],this.views[0]);
}
GraphingCalc.prototype.setInitKeyboardElement = function() {
this.parent.keyboardNav.curRegion = 'yequalview';
this.parent.keyboardNav.RegionIndex = 7;
this.parent.keyboardNav.curElement = 'equa1';
var initialInput = document.getElementById('equa1');
setTimeout(function() {
FocusUtils.setCalcFocus(initialInput);
}, 0);
};
GraphingCalc.prototype.getTraceStepSize = function()
{
var defaultSize = 4;
var stepSize = document.getElementById('tracestepsize').value;
if (stepSize == '') return defaultSize;
var size = defaultSize;
try {
size = getFixedResult(stepSize);
} catch (ex) {
size = defaultSize;
}
return size;
}
GraphingCalc.prototype.clearFocus = function(divsMap) {
clearFocus(divsMap);
};
function TraceNavigation(direction) {
if (!getWorkingCalcInstance().trace.flag) return false;
var calc = getWorkingCalcInstance();
var ids = getNoneEmptyEquationIds();
if (ids.length == 0)
return false;
switch (direction) {
case 'left':
calc.trace.offset = getFixedResult(calc.trace.offset - calc.getTraceStepSize());
break;
case 'right':
calc.trace.offset = getFixedResult(calc.trace.offset + calc.getTraceStepSize());
break;
case 'up':
if (ids.length > 0) {
var curIndex = calc.trace.equationIndex;
var found = false;
for (var i=0; i<ids.length; i++)
if (ids[i] == curIndex) {
found = true;
break;
}
if (!found) calc.trace.equationIndex = ids[0];
else {
if (i!=0) calc.trace.equationIndex = ids[i-1];
else calc.trace.equationIndex = ids[ids.length-1];
}
}
break;
case 'down':
if (ids.length > 0) {
var curIndex = calc.trace.equationIndex;
var found = false;
for (var i=0; i<ids.length; i++)
if (ids[i] == curIndex) {
found = true;
break;
}
if (!found) calc.trace.equationIndex = ids[0];
else {
if (i!=ids.length-1) calc.trace.equationIndex = ids[i+1];
else calc.trace.equationIndex = ids[0];
}
}
break;
}
calc.calc_draw_graph();
function getNoneEmptyEquationIds()
{
var calc = getWorkingCalcInstance();
var ids = [];
for (var i=0; i<calc.equationsIds.length; i++)
{
if (document.getElementById(calc.equationsIds[i]).value != '') ids.push(i);
}
return ids;
}
return true;
}
GraphingCalc.prototype.buttonPressProcess = function(e)
{
var id;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
if (target.nodeName == 'SUP') {
target = target.parentNode;
}
id = target.id;
} else {
if (applyFuncFromButtonMap(graphingButtonMap,e)) return;
id = e;
}
if (id == 'sign') {
getTDSCalc().flip_sign(e);
return;
}
var element =  document.getElementById(id);
var s = element.getAttribute('val');
if ((s == null)||(this.getInputArea()==null)) return;
var curInput = this.getInputArea();
var new_contents = curInput.value;
if (new_contents.length < getMaxInputLen(curInput, s)) {
if (PreciseUtils.validatedInputFractionalPartLen(curInput, s)) {
CaretPositionUtils.insertCharacter(curInput, s);
}
}
FocusUtils.setCalcFocus(this.getInputArea(), e);
}
GraphingCalc.prototype.resetTraceParams = function()
{
this.trace.flag = false;
this.trace.equationIndex = -1;
this.trace.offset = 0;
}
GraphingCalc.prototype.doCalculation = function(e)
{
var currentInputArea = this.getInputArea();
if (currentInputArea == null) return;
var expression = currentInputArea.value;
if (expression == '') return;
if (expression.indexOf('x') == -1) currentInputArea.value = getFixedResult(this.parent.evalExpression(expression));
}
function graphCalcMoveAxis(e) {
var id;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else id = e;
var size = 1;
var traceAdjust = getWorkingCalcInstance().canvas_width/(getWorkingCalcInstance().getCanvasWindowRange('xmax') - getWorkingCalcInstance().getCanvasWindowRange('xmin'))
var toggleTrace = document.getElementById('toggleTrace').checked;
if (toggleTrace) {
TraceNavigation(id);
return;
}
switch (id) {
case 'up':
getWorkingCalcInstance().setCanvasWindowRange('ymin', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('ymin')+size));
getWorkingCalcInstance().setCanvasWindowRange('ymax', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('ymax')+size));
break;
case 'down':
getWorkingCalcInstance().setCanvasWindowRange('ymin', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('ymin')-size));
getWorkingCalcInstance().setCanvasWindowRange('ymax', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('ymax')-size));
break;
case 'left':
getWorkingCalcInstance().trace.offset += traceAdjust;
getWorkingCalcInstance().setCanvasWindowRange('xmin', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('xmin')-size));
getWorkingCalcInstance().setCanvasWindowRange('xmax', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('xmax')-size));
break;
case 'right':
getWorkingCalcInstance().trace.offset -= traceAdjust;
getWorkingCalcInstance().setCanvasWindowRange('xmin', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('xmin')+size));
getWorkingCalcInstance().setCanvasWindowRange('xmax', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('xmax')+size));
break;
}
getWorkingCalcInstance().calc_draw_graph();
}
function getFixedResult(result) {
if (result.toString().indexOf('.') > -1) {
return parseFloat(parseFloat(result).toFixed(2).toString());
}
return parseInt(result);
}
function graphCalcSetDataStartingPos(e)
{
var id;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else {
id = e;
}
if (id == 'previous5') getWorkingCalcInstance().xPos -= getWorkingCalcInstance().numDisplayData;
else getWorkingCalcInstance().xPos += getWorkingCalcInstance().numDisplayData;
getWorkingCalcInstance().showGraphingTable();
}
function graphCalcApplyInitX(e) {
var value = getFixedResult(getTDSCalc().translate_negative(document.getElementById('initX').value)).toString();
if (!isValidNumber(value)) {
getWorkingCalcInstance().showErrorMessage('Invalid init X', 'initX');
return;
}
getWorkingCalcInstance().xPos = parseFloat(value);
getWorkingCalcInstance().showGraphingTable();
}
GraphingCalc.prototype.graphCalcReset = function() {
this.resetTraceParams();
this.zoom = 1;
this.radianOrDegree = 'degrees';
resetRadianDegree(this.radianOrDegree);
this.setCanvasWindowRange('xmin', this.xminX);
this.setCanvasWindowRange('xmax', this.xmaxX);
this.setCanvasWindowRange('ymin', this.yminY);
this.setCanvasWindowRange('ymax', this.ymaxY);
document.getElementById('initX').value = this.xminX;
document.getElementById('xscale').value = '1';
document.getElementById('yscale').value = '1';
document.getElementById('tracestepsize').value = '4';
this.xPos = this.xminX;
for (var i = 0; i < this.equationsIds.length; i++) {
document.getElementById(this.equationsIds[i]).value = '';
document.getElementById("equations-select-" + (i + 1)).selectedIndex = 0;
}
document.getElementById('textinput').value = '';
this.graphing_Canvas_init();
this.setGraphViewById(this.viewDivIds[0], null, this.views[0]);
};
function graphCalcZoom(e)
{
var id;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else {
id = e;
}
switch (id) {
case 'calczoomin':
if (getWorkingCalcInstance().zoom < getWorkingCalcInstance().maxZoom) {
getWorkingCalcInstance().zoom *= getWorkingCalcInstance().zoomScale;
}
break;
case 'calczoomout':
if (getWorkingCalcInstance().zoom > getWorkingCalcInstance().minZoom) {
getWorkingCalcInstance().zoom /= getWorkingCalcInstance().zoomScale;
}
break;
}
getWorkingCalcInstance().calc_draw_graph();
}
function toggleTrace(e) {
var curTarget;
if (typeof (e) == "object") curTarget = e.target.value;
else {
curTarget = e;
}
if (curTarget == 'toggleScroll') {
getWorkingCalcInstance().resetTraceParams();
} else {
getWorkingCalcInstance().trace.flag = true;
getTDSCalc().keyboardNav.curRegion = 'graphview';
getTDSCalc().keyboardNav.curElement = 'toggleTrace';
getTDSCalc().keyboardNav.RegionIndex = 2;
}
getWorkingCalcInstance().calc_draw_graph();
}
GraphingCalc.prototype.updateGraphViewRegion = function(newRegion) {
var calcMode = CalcModeList['Graphing'];
if (this.config.name == 'GraphingInv') {
calcMode = CalcModeList['GraphingInv'];
}
var regionDivs = getRegionDivsByMode(calcMode);
for (var i=0; i<regionDivs.length; i++)
{
for (var j=0; j<this.views.length; j++)
{
if (regionDivs[i] == this.views[j]) {
regionDivs[i] = newRegion;
return;
}
}
}
regionDivs.push(newRegion);
}
function setGraphView(e)
{
var id;
if (typeof(e) == 'object')
{
var target = YAHOO.util.Event.getTarget(e);
id = target.id;
} else {
id = e;
}
var j;
for (j=0; j<getWorkingCalcInstance().views.length; j++) {
if (id == getWorkingCalcInstance().views[j]) break;
}
getWorkingCalcInstance().setGraphViewById(getWorkingCalcInstance().viewDivIds[j], id);
}
GraphingCalc.prototype.setActiveGraphViewStyle = function(id)
{
if (id == null) id = "yequalview";
var graphModes = document.getElementById("graphmodes").getElementsByTagName("a");
for (var i = 0; i < graphModes.length; i++)
{
var btnGraphMode = graphModes[i];
if (btnGraphMode.id == id) {
YAHOO.util.Dom.addClass(btnGraphMode, "active");
}
else {
YAHOO.util.Dom.removeClass(btnGraphMode, "active");
}
}
}
GraphingCalc.prototype.setGraphViewById = function(vid, id) {
this.setActiveGraphViewStyle(id);
this.cleanDataTable();
for (var i = 0; i < this.viewDivIds.length; i++) {
var elStyle = document.getElementById(this.viewDivIds[i]).style;
elStyle.display = 'none';
}
document.getElementById(vid).style.display = 'block';
if (vid == this.viewDivIds[0]) {
document.getElementById(this.equationsIds[0]).focus();
if (!document.getElementById(this.equationsIds[0]).hasFocus())
document.getElementById(this.equationsIds[0]).focused = true;
}
if (vid == this.viewDivIds[1]) {
document.getElementById('xmin').focus();
}
if (vid == this.viewDivIds[2]) {
this.showGraphingTable();
document.getElementById('initX').focus();
}
document.getElementById('graphControls').style.visibility = 'hidden';
document.getElementById('traceToggle').style.visibility = 'hidden';
if (vid == this.viewDivIds[3]) {
if (this.calc_draw_graph()) {
document.getElementById('graphControls').style.visibility = 'visible';
document.getElementById('traceToggle').style.visibility = 'visible';
document.getElementById("toggleTrace").checked = false;
toggleTrace('toggleScroll');
document.getElementById("toggleScroll").checked = true;
}
this.setActiveInputArea(null);
}
if (vid == this.viewDivIds[4]) {
document.getElementById('graphControls').style.visibility = 'hidden';
document.getElementById('traceToggle').style.visibility = 'hidden';
this.setActiveInputArea(null);
}
if (id != null) {
this.updateGraphViewRegion(id);
this.parent.keyboardNav.curRegion = id;
var calcMode = CalcModeList['Graphing'];
if (this.config.name == 'GraphingInv') {
calcMode = CalcModeList['GraphingInv'];
}
this.parent.keyboardNav.RegionIndex = getRegionDivsByMode(calcMode).length - 1;
this.parent.keyboardNav.curElement = elementInRegion[calcMode + '-' + id + '-default'].id;
document.getElementById(this.parent.keyboardNav.curElement).focus();
}
};
GraphingCalc.prototype.validateGraphingData = function(table)
{
var error1 = "You have an error: ";
var error2 = ". Please correct it or click reset button to start over";
var minMaxIds = ['xmin', 'xmax', 'ymin', 'ymax'];
for (var i=0; i<minMaxIds.length; i++) {
if (!isValidNumber(document.getElementById(minMaxIds[i]).value)) {
document.getElementById('errorcontent').innerHTML = error1 + "invalid Xmin/Xman/Ymin/Ymax" + error2;
this.setGraphViewById('grapherrorholder');
return false;
}
}
var xmin = parseFloat(document.getElementById(minMaxIds[0]).value);
var xmax = parseFloat(document.getElementById(minMaxIds[1]).value);
var ymin = parseFloat(document.getElementById(minMaxIds[2]).value);
var ymax = parseFloat(document.getElementById(minMaxIds[3]).value);
if ((xmin >= xmax)||(ymin>=ymax)) {
document.getElementById('errorcontent').innerHTML = error1 + "Xmax/Ymax is less than or equal to Xmin/Ymin" + error2;
this.setGraphViewById('grapherrorholder');
return false;
}
var trace = parseFloat(document.getElementById('tracestepsize').value);
var xscale = parseFloat(document.getElementById('xscale').value);
var yscale = parseFloat(document.getElementById('yscale').value);
if ( (!isValidNumber(trace+''))||(!isValidNumber(xscale+''))||(!isValidNumber(yscale+'')) ){
document.getElementById('errorcontent').innerHTML = error1 + "Trace/Xscale/Yscale/Ymin must be a valid number " + error2;
this.setGraphViewById('grapherrorholder');
return false;
}  else {
if ((xscale <=0) || (yscale <=0) || (trace <=0)) {
document.getElementById('errorcontent').innerHTML = error1 + "Invalid Trace/Xscale/Yscale" + error2;
this.setGraphViewById('grapherrorholder');
return false;
}
}
if (!isValidNumber(document.getElementById('initX').value)) {
if (table) {
this.showErrorMessage('Invalid init X', 'initX');
} else {
document.getElementById('errorcontent').innerHTML = error1 + "invalid Init X" + error2;
this.setGraphViewById('grapherrorholder');
}
return false;
}
for (var i=0; i<this.equationsIds.length; i++) {
var rst;
var value = document.getElementById(this.equationsIds[i]).value;
if (value.length > 0) {
try {
if (value.indexOf('x')==-1)
rst = this.parent.evalExpression(value);
else {
return true;
}
if ((rst!=Infinity) && (rst != -Infinity) && (!isValidNumber('' + rst))) {
document.getElementById('errorcontent').innerHTML = error1 + "invalid Y" + (i+1) + " expression" + error2;
this.setGraphViewById('grapherrorholder');
return false;
}
} catch (ex) {
document.getElementById('errorcontent').innerHTML = error1 + "invalid Y" + (i+1) + " expression" + error2;
this.setGraphViewById('grapherrorholder');
return false;
}
}
}
return true;
}
function isValidNumber(inpString) {
var str = getTDSCalc().translate_negative(inpString) + '';
var ePos = str.indexOf('e');
if (ePos != -1) {
var first = /^[-+]?\d+(\.\d+)?$/.test(str.substring(0,ePos));
var second = /^[-+]?\d+(\.\d+)?$/.test(str.substring(ePos+1));
return (first && second);
}
return /^[-+]?\d+(\.\d+)?$/.test(str);
}
function isInteger(val)
{
val = getTDSCalc().translate_negative(val);
if(val==null)
{
return false;
}
if (val.length==0)
{
return false;
}
for (var i = 0; i < val.length; i++)
{
var ch = val.charAt(i)
if (i == 0 && ch == "-")
{
continue;
}
if (ch < "0" || ch > "9")
{
return false;
}
}
return true;
}
GraphingCalc.prototype.calc_draw_graph = function()
{
var canvasElement = document.getElementById('canvas');
if (BrowserUtils.isAndroid()) {
canvasElement.setAttribute('style', 'display:none');
canvasElement.setAttribute('style', 'display:block');
}
if (!this.validateGraphingData(false)) return false;
var ctx = this.getCanvasCTX(true);
ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
this.graphing_Canvas_init();
for (var i = 0; i < this.equationsIds.length; i++)
{
if (document.getElementById(this.equationsIds[i]).value.length > 0)
{
var selectNode = document.getElementById('equations-select-' + (i + 1));
var op = selectNode.options[selectNode.selectedIndex].value;
this.draw_graph(this.equationsIds[i], ctx, op);
ctx.beginPath();
ctx.closePath();
if (this.trace.equationIndex < 0) this.trace.equationIndex = i;
}
}
document.getElementById('textinput').value = '';
if (this.trace.flag) this.draw_Trace();
if (BrowserUtils.isAndroid()) {
canvasElement.removeAttribute('style');
}
return true;
}
GraphingCalc.prototype.getCanvasWindowRange = function(which) {
return getFixedResult(document.getElementById(which).value);
};
GraphingCalc.prototype.setCanvasWindowRange =  function(which, value)
{
document.getElementById(which).value = value;
}
GraphingCalc.prototype.draw_graph = function(inputElm, ctx, equality)
{
var funcTxt = this.parent.translate_input(document.getElementById(inputElm).value);
if (funcTxt &&(funcTxt.length>0))
{
ctx.fillStyle = "rgba(1000, 0, 0, 0.5)";
var prevY, xLeft, xRight;
for (var a = -1; a <= this.canvas_width + 1; a++)
{
var y;
try {
y = this.getFuncYbyCanvasX(a, funcTxt);
if((y)&&(y!=Infinity)&&(y!=(-Infinity)))
{
if (!(prevY) && prevY != 0) {
xLeft = a;
}
var canvasY = this.getCanvasYbyFuncY(y);
if ((a == 0)) {
ctx.moveTo(a, canvasY);
} else {
ctx.lineTo(a, canvasY);
}
prevY = y;
}else if ((!(y) && y!=0) && (prevY)) {
xRight = a;
prevY = y;
}
} catch (ex) {
this.showErrorMessage(ExpressErrorMsg, inputElm);
break;
}
}
var yLeft = this.getFuncYbyCanvasX(xLeft || 0, funcTxt);
var fillStyle = "rgba(0, 0, 2, 0.1)";
if (equality == '>') {
ctx.lineTo((xRight + 1) || (this.canvas_width + 1), -1);
ctx.lineTo(xLeft || 0, -1);
ctx.lineTo(xLeft || -1, yLeft);
ctx.fillStyle = fillStyle;
ctx.fill();
} else if (equality == '<') {
var canvasHeight = this.canvas_height;
ctx.lineTo((xRight + 1) || (this.canvas_width + 1), canvasHeight + 1);
ctx.lineTo(xLeft || 0, canvasHeight + 1);
ctx.lineTo(xLeft || -1, yLeft);
ctx.fillStyle = fillStyle;
ctx.fill();
}
if (equality == '>' || equality == '<') {
if (ctx.setLineDash) {
ctx.setLineDash([2, 2]);
ctx.stroke();
} else {
for (var p = 0; p < this.canvas_width; p++) {
var yCanvas = this.getCanvasYbyFuncY(this.getFuncYbyCanvasX(p, funcTxt));
if (p % 2 == 0) {
ctx.beginPath();
ctx.moveTo(p, yCanvas);
} else {
ctx.lineTo(p, yCanvas);
ctx.stroke();
ctx.closePath();
}
}
}
} else {
if(ctx.setLineDash)   ctx.setLineDash([0, 0]);
ctx.stroke();
}
}
};
GraphingCalc.prototype.draw_Trace = function()
{
if (this.trace.equationIndex < 0) return;
var func = this.parent.translate_input(document.getElementById(this.equationsIds[this.trace.equationIndex]).value);
if (func == '') return;
var canvasX = this.canvas_width / 2 + this.trace.offset;
var funcY = this.getFuncYbyCanvasX(canvasX, func);
var canvasY = this.getCanvasYbyFuncY(funcY);
var ctx = this.getCanvasCTX(false);
var size = 8;
var funcX = this.getFuncXbyCanvasX(canvasX, func);
var coorStr = 'X=' + roundingTracXYFraction(funcX) + ' , Y' + (this.trace.equationIndex + 1) + '=' + roundingTracXYFraction(funcY);
document.getElementById('textinput').value = coorStr;
if (this.markWithinRegion(canvasX, canvasY))
{
ctx.fillStyle = 'blue';
ctx.fillRect(canvasX - size / 2, canvasY - size / 2, size, size);
} else
{
iterationCount = 1;
var inRegionOffset = 0;
while (!this.markWithinRegion(canvasX, canvasY) && iterationCount < 1000)
{
if (this.trace.offset < 0)
{
inRegionOffset = this.trace.offset + (this.getTraceStepSize() * iterationCount);
} else
{
inRegionOffset = this.trace.offset - (this.getTraceStepSize() * iterationCount);
}
canvasX = this.canvas_width / 2 + inRegionOffset;
funcY = this.getFuncYbyCanvasX(canvasX, func);
canvasY = this.getCanvasYbyFuncY(funcY);
iterationCount++;
}
if (this.markWithinRegion(canvasX, canvasY))
{
ctx.fillStyle = 'red';
ctx.fillRect(canvasX - size / 2, canvasY - size / 2, size, size);
} else
{
ctx.fillStyle = 'red';
ctx.fillRect(this.canvas_width / 2, this.canvas_height - 9, size, size);
}
}
function roundingTracXYFraction(realNum)
{
return (Math.round(realNum * 100) / 100);
}
}
GraphingCalc.prototype.getFuncYbyCanvasX = function(canvasX, func)
{
return eval('x='+this.getFuncXbyCanvasX(canvasX, func) + ';' + func);
}
GraphingCalc.prototype.getFuncXbyCanvasX = function(canvasX, func)
{
var xmin=this.getCanvasWindowRange('xmin')/this.zoom;
var xmax=this.getCanvasWindowRange('xmax')/this.zoom;
var xinc=(xmax-xmin)/this.canvas_width;
return xmin + xinc * canvasX;
}
GraphingCalc.prototype.getCanvasYbyFuncY = function(funcY)
{
var ymin=this.getCanvasWindowRange('ymin')/this.zoom;
var ymax=this.getCanvasWindowRange('ymax')/this.zoom;
var yinc=(ymax-ymin)/this.canvas_height;
return (this.canvas_height - (funcY - ymin) / yinc);
}
GraphingCalc.prototype.getScale =  function(xy)
{
if (xy == 'X') return parseFloat(document.getElementById('xscale').value);
if (xy == 'Y') return parseFloat(document.getElementById('yscale').value);
}
GraphingCalc.prototype.getInterval = function(step, minDisplaySize)
{
var interval;
if (step >= this.minDisplaySize) {
var i = 1;
while (true) {
if ((step / i) <= minDisplaySize) break;
i++;
}
interval = Math.round(step / i);
}
else {
var i = 1;
while (true) {
if (step * i >= minDisplaySize) break;
i++;
}
interval = step * i;
}
return interval;
}
GraphingCalc.prototype.graphing_Canvas_init = function()
{
var xmin=this.getCanvasWindowRange('xmin')/this.zoom;
var xmax=this.getCanvasWindowRange('xmax')/this.zoom;
var ymin=this.getCanvasWindowRange('ymin')/this.zoom;
var ymax=this.getCanvasWindowRange('ymax')/this.zoom;
var ctx = this.getCanvasCTX(true);
ctx.clearRect(0,0,this.canvas_width,this.canvas_height);
var xinc=(xmax-xmin)/this.canvas_width;
var yinc=(ymax-ymin)/this.canvas_height;
ctx.fillStyle = "rgba(100, 0, 0, 1)";
ctx.fillRect (0, this.canvas_height-(0-ymin)/yinc-1, this.canvas_width,3);
ctx.fillRect ((0-xmin)/xinc-1,0,3, this.canvas_height);
var xOrigin = (0-xmin)/xinc;
var yOrigin = this.canvas_height-(0-ymin)/yinc;
var stepX = 1/xinc;
var stepY = 1/yinc;
var loopSize = 1000;
var xInterval, yInterval;
var xScale = this.getScale('X');
var yScale = this.getScale('Y');
stepX = stepX * xScale;
stepY = stepY * yScale;
xInterval = this.getInterval(stepX, this.xMinDisplaySize);
if (stepX == stepY) yInterval = xInterval;
else {
yInterval = this.getInterval(stepY, this.xMinDisplaySize);
}
ctx.fillStyle = "rgba(50, 0, 1, 1)";
var k=0;
for (var i=xOrigin; i>(0-loopSize); i=i-xInterval) {
ctx.fillRect(i, this.canvas_height-(0-ymin)/yinc-4, 1, 8);
var mark = this.getAxisMark('X', i,xOrigin,stepX);
if (mark == '0') continue;
k++;
if (k%2 == 0)
this.markAxis(ctx, mark, i-5, yOrigin+12);
else
this.markAxis(ctx, mark, i-5, yOrigin-6);
}
k=0;
for (var i=xOrigin; i<loopSize; i=i+xInterval) {
ctx.fillRect(i, this.canvas_height-(0-ymin)/yinc-4, 1, 8);
var mark = this.getAxisMark('X', i,xOrigin,stepX);
if (mark == '0') continue;
k++;
if (k%2 == 0)
this.markAxis(ctx, mark, i+2, yOrigin+12);
else
this.markAxis(ctx, mark, i+2, yOrigin-6);
}
for (var j=yOrigin; j<loopSize; j=j+yInterval) {
ctx.fillRect((0-xmin)/xinc-4, j, 8, 1);
var mark = this.getAxisMark('Y', j,yOrigin,stepY);
mark = 0-mark;
if (mark != '0') this.markAxis(ctx, mark, xOrigin+3, j+5);
}
for (var j=yOrigin; j>(0-loopSize); j=j-yInterval) {
ctx.fillRect((0-xmin)/xinc-4, j, 8, 1);
var mark = this.getAxisMark('Y', j,yOrigin,stepY);
mark = 0-mark;
if (mark != '0') this.markAxis(ctx, mark, xOrigin+3, j);
}
}
GraphingCalc.prototype.getAxisMark = function(xy, ind, Origin, step)
{
var scale = this.getScale('X');
if (xy == 'Y') scale = this.getScale('Y');
var mark = (ind-Origin) * scale / step;
var str  = mark + '';
var index = str.indexOf('.');
if (index!=-1) {
if (str.charAt(index+1)!=0) {
mark = Math.round(str*100)/100;     // using str instead of trimed mark to keep it accurate
}
else
mark = str.substring(0, index);
} else {
mark = Math.round(mark);
}
return mark;
}
GraphingCalc.prototype.markAxis = function(ctx, mark, x, y)
{
if (!this.markWithinRegion(x, y)) return;
if ((BrowserDetect.browser == 'Firefox') || (BrowserDetect.browser == 'Mozilla'))
{
if (((BrowserDetect.version + '').charAt(0) == '3') || ((BrowserDetect.version + '').charAt(0) == '2') || ((BrowserDetect.version + '').charAt(0) == '1'))
{
this.drawString(mark, x, y);
}
else if (BrowserDetect.version >= 7 || (BrowserDetect.version + '').charAt(0) == 'a')
{
ctx.fillText(mark, x, y);
}
else
{
ctx.translate(x, y);
ctx.mozDrawText(mark);
ctx.translate(0 - x, 0 - y);
}
}
else if (BrowserDetect.browser == 'Explorer')
{
this.drawString(mark, x, y);
}
else
{
ctx.fillText(mark, x, y);
}
};
GraphingCalc.prototype.drawString = function(mark, x,y)
{
this.textCTX.stringStyle.fontSize = 10;
this.textCTX.drawString(x+1+'px',y-5+'px', mark);
}
GraphingCalc.prototype.markWithinRegion = function(x,y)
{
if ((x<this.canvas_width) && (x>0) && (y<this.canvas_height) && (y>0)) return true;
return false;
}
GraphingCalc.prototype.calc_Clear_Graph = function()
{
var ctx = this.getCanvasCTX(true);
ctx.clearRect(0,0,canvas_width,canvas_height);
ctx.beginPath();
ctx.closePath();
this.graphing_Canvas_init();
}
GraphingCalc.prototype.getCanvasCTX = function(clearText)
{
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
if (this.textCTX == null) {
var ctxController = new TextCanvas(document.getElementById('canvas-container'), 'ctncanvas');
ctxController.setDimensions(this.canvas_width, this.canvas_height);
this.textCTX = ctxController.getContext('2d');
}
if(clearText == true)
this.textCTX.clear();
return ctx;
}
GraphingCalc.prototype.showErrorMessage =  function(msg, inputarea)
{
if (!inputarea) inputarea = 'textinput';
document.getElementById(inputarea).value = msg;
inputClearFlag = true;
}
GraphingCalc.prototype.showGraphingTable = function(clean)
{
if (!this.validateGraphingData(true)) return;
if (this.xPos==null) this.xPos = parseInt(this.getCanvasWindowRange('xmin'));
this.cleanDataTable();
var tableDiv = document.getElementById('datatable');
var thead = document.createElement('thead');
tableDiv.appendChild(thead);
var headerTR = document.createElement('tr');
var headerTHX = document.createElement('th');
var headerX = document.createTextNode('X');
headerTHX.appendChild(headerX);
headerTR.appendChild(headerTHX);
thead.appendChild(headerTR);
for (var i=0; i<this.equationsIds.length; i++) {
var equaTH = document.createElement('th');
var equaTx = document.createTextNode('Y' + (i+1));
equaTH.appendChild(equaTx);
headerTR.appendChild(equaTH);
}
try {
var thisXPos = getFixedResult(this.xPos);
var tbody = document.createElement('tbody');
tableDiv.appendChild(tbody);
for (var i=0; i<this.numDisplayData; i++) {
var eachRow = document.createElement('tr');
var tdX = document.createElement('td');
var tTx = document.createTextNode(thisXPos);
tdX.appendChild(tTx);
eachRow.appendChild(tdX);
for (var j=0; j<this.equationsIds.length; j++) {
var equaTD = document.createElement('td');
var val = '';
var func = this.parent.translate_input(document.getElementById(this.equationsIds[j]).value);
if (func.length > 0) val = getFixedResult(this.parent.evalVariableExpression(func, thisXPos)) + '';
if (val.indexOf('error') != -1) val = 'error';
if (val == 'NaN') val = 'error';
if (val.length > 10) val = val.substring(0,10);
var equaTx = document.createTextNode(val);
equaTD.appendChild(equaTx);
eachRow.appendChild(equaTD);
}
tbody.appendChild(eachRow);
thisXPos = getFixedResult(thisXPos + 1);
}
} catch (ex) {
this.cleanDataTable();
}
}
GraphingCalc.prototype.cleanDataTable = function()
{
var tableDiv = document.getElementById('datatable');
while (tableDiv.hasChildNodes()) {
tableDiv.removeChild(tableDiv.childNodes[0]);
}
return;
}

/* SOURCE FILE: yahoo-dom-event.js (8a4cd7e8) 1/26/2015 1:19:44 PM */

if(typeof YAHOO=="undefined"||!YAHOO){var YAHOO={};}YAHOO.namespace=function(){var A=arguments,E=null,C,B,D;for(C=0;C<A.length;C=C+1){D=(""+A[C]).split(".");E=YAHOO;for(B=(D[0]=="YAHOO")?1:0;B<D.length;B=B+1){E[D[B]]=E[D[B]]||{};E=E[D[B]];}}return E;};YAHOO.log=function(D,A,C){var B=YAHOO.widget.Logger;if(B&&B.log){return B.log(D,A,C);}else{return false;}};YAHOO.register=function(A,E,D){var I=YAHOO.env.modules,B,H,G,F,C;if(!I[A]){I[A]={versions:[],builds:[]};}B=I[A];H=D.version;G=D.build;F=YAHOO.env.listeners;B.name=A;B.version=H;B.build=G;B.versions.push(H);B.builds.push(G);B.mainClass=E;for(C=0;C<F.length;C=C+1){F[C](B);}if(E){E.VERSION=H;E.BUILD=G;}else{YAHOO.log("mainClass is undefined for module "+A,"warn");}};YAHOO.env=YAHOO.env||{modules:[],listeners:[]};YAHOO.env.getVersion=function(A){return YAHOO.env.modules[A]||null;};YAHOO.env.ua=function(){var D=function(H){var I=0;return parseFloat(H.replace(/\./g,function(){return(I++==1)?"":".";}));},G=navigator,F={ie:0,opera:0,gecko:0,webkit:0,mobile:null,air:0,caja:G.cajaVersion,secure:false,os:null},C=navigator&&navigator.userAgent,E=window&&window.location,B=E&&E.href,A;F.secure=B&&(B.toLowerCase().indexOf("https")===0);if(C){if((/windows|win32/i).test(C)){F.os="windows";}else{if((/macintosh/i).test(C)){F.os="macintosh";}}if((/KHTML/).test(C)){F.webkit=1;}A=C.match(/AppleWebKit\/([^\s]*)/);if(A&&A[1]){F.webkit=D(A[1]);if(/ Mobile\//.test(C)){F.mobile="Apple";}else{A=C.match(/NokiaN[^\/]*/);if(A){F.mobile=A[0];}}A=C.match(/AdobeAIR\/([^\s]*)/);if(A){F.air=A[0];}}if(!F.webkit){A=C.match(/Opera[\s\/]([^\s]*)/);if(A&&A[1]){F.opera=D(A[1]);A=C.match(/Opera Mini[^;]*/);if(A){F.mobile=A[0];}}else{A=C.match(/MSIE\s([^;]*)/);if(A&&A[1]){F.ie=D(A[1]);}else{A=C.match(/Gecko\/([^\s]*)/);if(A){F.gecko=1;A=C.match(/rv:([^\s\)]*)/);if(A&&A[1]){F.gecko=D(A[1]);}}}}}}return F;}();(function(){YAHOO.namespace("util","widget","example");if("undefined"!==typeof YAHOO_config){var B=YAHOO_config.listener,A=YAHOO.env.listeners,D=true,C;if(B){for(C=0;C<A.length;C++){if(A[C]==B){D=false;break;}}if(D){A.push(B);}}}})();YAHOO.lang=YAHOO.lang||{};(function(){var B=YAHOO.lang,A=Object.prototype,H="[object Array]",C="[object Function]",G="[object Object]",E=[],F=["toString","valueOf"],D={isArray:function(I){return A.toString.apply(I)===H;},isBoolean:function(I){return typeof I==="boolean";},isFunction:function(I){return(typeof I==="function")||A.toString.apply(I)===C;},isNull:function(I){return I===null;},isNumber:function(I){return typeof I==="number"&&isFinite(I);},isObject:function(I){return(I&&(typeof I==="object"||B.isFunction(I)))||false;},isString:function(I){return typeof I==="string";},isUndefined:function(I){return typeof I==="undefined";},_IEEnumFix:(YAHOO.env.ua.ie)?function(K,J){var I,M,L;for(I=0;I<F.length;I=I+1){M=F[I];L=J[M];if(B.isFunction(L)&&L!=A[M]){K[M]=L;}}}:function(){},extend:function(L,M,K){if(!M||!L){throw new Error("extend failed, please check that "+"all dependencies are included.");}var J=function(){},I;J.prototype=M.prototype;L.prototype=new J();L.prototype.constructor=L;L.superclass=M.prototype;if(M.prototype.constructor==A.constructor){M.prototype.constructor=M;}if(K){for(I in K){if(B.hasOwnProperty(K,I)){L.prototype[I]=K[I];}}B._IEEnumFix(L.prototype,K);}},augmentObject:function(M,L){if(!L||!M){throw new Error("Absorb failed, verify dependencies.");}var I=arguments,K,N,J=I[2];if(J&&J!==true){for(K=2;K<I.length;K=K+1){M[I[K]]=L[I[K]];}}else{for(N in L){if(J||!(N in M)){M[N]=L[N];}}B._IEEnumFix(M,L);}},augmentProto:function(L,K){if(!K||!L){throw new Error("Augment failed, verify dependencies.");}var I=[L.prototype,K.prototype],J;for(J=2;J<arguments.length;J=J+1){I.push(arguments[J]);}B.augmentObject.apply(this,I);},dump:function(I,N){var K,M,P=[],Q="{...}",J="f(){...}",O=", ",L=" => ";if(!B.isObject(I)){return I+"";}else{if(I instanceof Date||("nodeType" in I&&"tagName" in I)){return I;}else{if(B.isFunction(I)){return J;}}}N=(B.isNumber(N))?N:3;if(B.isArray(I)){P.push("[");for(K=0,M=I.length;K<M;K=K+1){if(B.isObject(I[K])){P.push((N>0)?B.dump(I[K],N-1):Q);}else{P.push(I[K]);}P.push(O);}if(P.length>1){P.pop();}P.push("]");}else{P.push("{");for(K in I){if(B.hasOwnProperty(I,K)){P.push(K+L);if(B.isObject(I[K])){P.push((N>0)?B.dump(I[K],N-1):Q);}else{P.push(I[K]);}P.push(O);}}if(P.length>1){P.pop();}P.push("}");}return P.join("");},substitute:function(Y,J,R){var N,M,L,U,V,X,T=[],K,O="dump",S=" ",I="{",W="}",Q,P;for(;;){N=Y.lastIndexOf(I);if(N<0){break;}M=Y.indexOf(W,N);if(N+1>=M){break;}K=Y.substring(N+1,M);U=K;X=null;L=U.indexOf(S);if(L>-1){X=U.substring(L+1);U=U.substring(0,L);}V=J[U];if(R){V=R(U,V,X);}if(B.isObject(V)){if(B.isArray(V)){V=B.dump(V,parseInt(X,10));}else{X=X||"";Q=X.indexOf(O);if(Q>-1){X=X.substring(4);}P=V.toString();if(P===G||Q>-1){V=B.dump(V,parseInt(X,10));}else{V=P;}}}else{if(!B.isString(V)&&!B.isNumber(V)){V="~-"+T.length+"-~";T[T.length]=K;}}Y=Y.substring(0,N)+V+Y.substring(M+1);}for(N=T.length-1;N>=0;N=N-1){Y=Y.replace(new RegExp("~-"+N+"-~"),"{"+T[N]+"}","g");}return Y;},trim:function(I){try{return I.replace(/^\s+|\s+$/g,"");}catch(J){return I;}},merge:function(){var L={},J=arguments,I=J.length,K;for(K=0;K<I;K=K+1){B.augmentObject(L,J[K],true);}return L;},later:function(P,J,Q,L,M){P=P||0;J=J||{};var K=Q,O=L,N,I;if(B.isString(Q)){K=J[Q];}if(!K){throw new TypeError("method undefined");}if(O&&!B.isArray(O)){O=[L];}N=function(){K.apply(J,O||E);};I=(M)?setInterval(N,P):setTimeout(N,P);return{interval:M,cancel:function(){if(this.interval){clearInterval(I);}else{clearTimeout(I);}}};},isValue:function(I){return(B.isObject(I)||B.isString(I)||B.isNumber(I)||B.isBoolean(I));}};B.hasOwnProperty=(A.hasOwnProperty)?function(I,J){return I&&I.hasOwnProperty(J);}:function(I,J){return !B.isUndefined(I[J])&&I.constructor.prototype[J]!==I[J];};D.augmentObject(B,D,true);YAHOO.util.Lang=B;B.augment=B.augmentProto;YAHOO.augment=B.augmentProto;YAHOO.extend=B.extend;})();YAHOO.register("yahoo",YAHOO,{version:"2.8.1",build:"19"});
(function(){YAHOO.env._id_counter=YAHOO.env._id_counter||0;var E=YAHOO.util,L=YAHOO.lang,m=YAHOO.env.ua,A=YAHOO.lang.trim,d={},h={},N=/^t(?:able|d|h)$/i,X=/color$/i,K=window.document,W=K.documentElement,e="ownerDocument",n="defaultView",v="documentElement",t="compatMode",b="offsetLeft",P="offsetTop",u="offsetParent",Z="parentNode",l="nodeType",C="tagName",O="scrollLeft",i="scrollTop",Q="getBoundingClientRect",w="getComputedStyle",a="currentStyle",M="CSS1Compat",c="BackCompat",g="class",F="className",J="",B=" ",s="(?:^|\\s)",k="(?= |$)",U="g",p="position",f="fixed",V="relative",j="left",o="top",r="medium",q="borderLeftWidth",R="borderTopWidth",D=m.opera,I=m.webkit,H=m.gecko,T=m.ie;E.Dom={CUSTOM_ATTRIBUTES:(!W.hasAttribute)?{"for":"htmlFor","class":F}:{"htmlFor":"for","className":g},DOT_ATTRIBUTES:{},get:function(z){var AB,x,AA,y,Y,G;if(z){if(z[l]||z.item){return z;}if(typeof z==="string"){AB=z;z=K.getElementById(z);G=(z)?z.attributes:null;if(z&&G&&G.id&&G.id.value===AB){return z;}else{if(z&&K.all){z=null;x=K.all[AB];for(y=0,Y=x.length;y<Y;++y){if(x[y].id===AB){return x[y];}}}}return z;}if(YAHOO.util.Element&&z instanceof YAHOO.util.Element){z=z.get("element");}if("length" in z){AA=[];for(y=0,Y=z.length;y<Y;++y){AA[AA.length]=E.Dom.get(z[y]);}return AA;}return z;}return null;},getComputedStyle:function(G,Y){if(window[w]){return G[e][n][w](G,null)[Y];}else{if(G[a]){return E.Dom.IE_ComputedStyle.get(G,Y);}}},getStyle:function(G,Y){return E.Dom.batch(G,E.Dom._getStyle,Y);},_getStyle:function(){if(window[w]){return function(G,y){y=(y==="float")?y="cssFloat":E.Dom._toCamel(y);var x=G.style[y],Y;if(!x){Y=G[e][n][w](G,null);if(Y){x=Y[y];}}return x;};}else{if(W[a]){return function(G,y){var x;switch(y){case"opacity":x=100;try{x=G.filters["DXImageTransform.Microsoft.Alpha"].opacity;}catch(z){try{x=G.filters("alpha").opacity;}catch(Y){}}return x/100;case"float":y="styleFloat";default:y=E.Dom._toCamel(y);x=G[a]?G[a][y]:null;return(G.style[y]||x);}};}}}(),setStyle:function(G,Y,x){E.Dom.batch(G,E.Dom._setStyle,{prop:Y,val:x});},_setStyle:function(){if(T){return function(Y,G){var x=E.Dom._toCamel(G.prop),y=G.val;if(Y){switch(x){case"opacity":if(L.isString(Y.style.filter)){Y.style.filter="alpha(opacity="+y*100+")";if(!Y[a]||!Y[a].hasLayout){Y.style.zoom=1;}}break;case"float":x="styleFloat";default:Y.style[x]=y;}}else{}};}else{return function(Y,G){var x=E.Dom._toCamel(G.prop),y=G.val;if(Y){if(x=="float"){x="cssFloat";}Y.style[x]=y;}else{}};}}(),getXY:function(G){return E.Dom.batch(G,E.Dom._getXY);},_canPosition:function(G){return(E.Dom._getStyle(G,"display")!=="none"&&E.Dom._inDoc(G));},_getXY:function(){if(K[v][Q]){return function(y){var z,Y,AA,AF,AE,AD,AC,G,x,AB=Math.floor,AG=false;if(E.Dom._canPosition(y)){AA=y[Q]();AF=y[e];z=E.Dom.getDocumentScrollLeft(AF);Y=E.Dom.getDocumentScrollTop(AF);AG=[AB(AA[j]),AB(AA[o])];if(T&&m.ie<8){AE=2;AD=2;AC=AF[t];if(m.ie===6){if(AC!==c){AE=0;AD=0;}}if((AC===c)){G=S(AF[v],q);x=S(AF[v],R);if(G!==r){AE=parseInt(G,10);}if(x!==r){AD=parseInt(x,10);}}AG[0]-=AE;AG[1]-=AD;}if((Y||z)){AG[0]+=z;AG[1]+=Y;}AG[0]=AB(AG[0]);AG[1]=AB(AG[1]);}else{}return AG;};}else{return function(y){var x,Y,AA,AB,AC,z=false,G=y;if(E.Dom._canPosition(y)){z=[y[b],y[P]];x=E.Dom.getDocumentScrollLeft(y[e]);Y=E.Dom.getDocumentScrollTop(y[e]);AC=((H||m.webkit>519)?true:false);while((G=G[u])){z[0]+=G[b];z[1]+=G[P];if(AC){z=E.Dom._calcBorders(G,z);}}if(E.Dom._getStyle(y,p)!==f){G=y;while((G=G[Z])&&G[C]){AA=G[i];AB=G[O];if(H&&(E.Dom._getStyle(G,"overflow")!=="visible")){z=E.Dom._calcBorders(G,z);}if(AA||AB){z[0]-=AB;z[1]-=AA;}}z[0]+=x;z[1]+=Y;}else{if(D){z[0]-=x;z[1]-=Y;}else{if(I||H){z[0]+=x;z[1]+=Y;}}}z[0]=Math.floor(z[0]);z[1]=Math.floor(z[1]);}else{}return z;};}}(),getX:function(G){var Y=function(x){return E.Dom.getXY(x)[0];};return E.Dom.batch(G,Y,E.Dom,true);},getY:function(G){var Y=function(x){return E.Dom.getXY(x)[1];};return E.Dom.batch(G,Y,E.Dom,true);},setXY:function(G,x,Y){E.Dom.batch(G,E.Dom._setXY,{pos:x,noRetry:Y});},_setXY:function(G,z){var AA=E.Dom._getStyle(G,p),y=E.Dom.setStyle,AD=z.pos,Y=z.noRetry,AB=[parseInt(E.Dom.getComputedStyle(G,j),10),parseInt(E.Dom.getComputedStyle(G,o),10)],AC,x;if(AA=="static"){AA=V;y(G,p,AA);}AC=E.Dom._getXY(G);if(!AD||AC===false){return false;}if(isNaN(AB[0])){AB[0]=(AA==V)?0:G[b];}if(isNaN(AB[1])){AB[1]=(AA==V)?0:G[P];}if(AD[0]!==null){y(G,j,AD[0]-AC[0]+AB[0]+"px");}if(AD[1]!==null){y(G,o,AD[1]-AC[1]+AB[1]+"px");}if(!Y){x=E.Dom._getXY(G);if((AD[0]!==null&&x[0]!=AD[0])||(AD[1]!==null&&x[1]!=AD[1])){E.Dom._setXY(G,{pos:AD,noRetry:true});}}},setX:function(Y,G){E.Dom.setXY(Y,[G,null]);},setY:function(G,Y){E.Dom.setXY(G,[null,Y]);},getRegion:function(G){var Y=function(x){var y=false;if(E.Dom._canPosition(x)){y=E.Region.getRegion(x);}else{}return y;};return E.Dom.batch(G,Y,E.Dom,true);},getClientWidth:function(){return E.Dom.getViewportWidth();},getClientHeight:function(){return E.Dom.getViewportHeight();},getElementsByClassName:function(AB,AF,AC,AE,x,AD){AF=AF||"*";AC=(AC)?E.Dom.get(AC):null||K;if(!AC){return[];}var Y=[],G=AC.getElementsByTagName(AF),z=E.Dom.hasClass;for(var y=0,AA=G.length;y<AA;++y){if(z(G[y],AB)){Y[Y.length]=G[y];}}if(AE){E.Dom.batch(Y,AE,x,AD);}return Y;},hasClass:function(Y,G){return E.Dom.batch(Y,E.Dom._hasClass,G);},_hasClass:function(x,Y){var G=false,y;if(x&&Y){y=E.Dom._getAttribute(x,F)||J;if(Y.exec){G=Y.test(y);}else{G=Y&&(B+y+B).indexOf(B+Y+B)>-1;}}else{}return G;},addClass:function(Y,G){return E.Dom.batch(Y,E.Dom._addClass,G);},_addClass:function(x,Y){var G=false,y;if(x&&Y){y=E.Dom._getAttribute(x,F)||J;if(!E.Dom._hasClass(x,Y)){E.Dom.setAttribute(x,F,A(y+B+Y));G=true;}}else{}return G;},removeClass:function(Y,G){return E.Dom.batch(Y,E.Dom._removeClass,G);},_removeClass:function(y,x){var Y=false,AA,z,G;if(y&&x){AA=E.Dom._getAttribute(y,F)||J;E.Dom.setAttribute(y,F,AA.replace(E.Dom._getClassRegex(x),J));z=E.Dom._getAttribute(y,F);if(AA!==z){E.Dom.setAttribute(y,F,A(z));Y=true;if(E.Dom._getAttribute(y,F)===""){G=(y.hasAttribute&&y.hasAttribute(g))?g:F;
y.removeAttribute(G);}}}else{}return Y;},replaceClass:function(x,Y,G){return E.Dom.batch(x,E.Dom._replaceClass,{from:Y,to:G});},_replaceClass:function(y,x){var Y,AB,AA,G=false,z;if(y&&x){AB=x.from;AA=x.to;if(!AA){G=false;}else{if(!AB){G=E.Dom._addClass(y,x.to);}else{if(AB!==AA){z=E.Dom._getAttribute(y,F)||J;Y=(B+z.replace(E.Dom._getClassRegex(AB),B+AA)).split(E.Dom._getClassRegex(AA));Y.splice(1,0,B+AA);E.Dom.setAttribute(y,F,A(Y.join(J)));G=true;}}}}else{}return G;},generateId:function(G,x){x=x||"yui-gen";var Y=function(y){if(y&&y.id){return y.id;}var z=x+YAHOO.env._id_counter++;if(y){if(y[e]&&y[e].getElementById(z)){return E.Dom.generateId(y,z+x);}y.id=z;}return z;};return E.Dom.batch(G,Y,E.Dom,true)||Y.apply(E.Dom,arguments);},isAncestor:function(Y,x){Y=E.Dom.get(Y);x=E.Dom.get(x);var G=false;if((Y&&x)&&(Y[l]&&x[l])){if(Y.contains&&Y!==x){G=Y.contains(x);}else{if(Y.compareDocumentPosition){G=!!(Y.compareDocumentPosition(x)&16);}}}else{}return G;},inDocument:function(G,Y){return E.Dom._inDoc(E.Dom.get(G),Y);},_inDoc:function(Y,x){var G=false;if(Y&&Y[C]){x=x||Y[e];G=E.Dom.isAncestor(x[v],Y);}else{}return G;},getElementsBy:function(Y,AF,AB,AD,y,AC,AE){AF=AF||"*";AB=(AB)?E.Dom.get(AB):null||K;if(!AB){return[];}var x=[],G=AB.getElementsByTagName(AF);for(var z=0,AA=G.length;z<AA;++z){if(Y(G[z])){if(AE){x=G[z];break;}else{x[x.length]=G[z];}}}if(AD){E.Dom.batch(x,AD,y,AC);}return x;},getElementBy:function(x,G,Y){return E.Dom.getElementsBy(x,G,Y,null,null,null,true);},batch:function(x,AB,AA,z){var y=[],Y=(z)?AA:window;x=(x&&(x[C]||x.item))?x:E.Dom.get(x);if(x&&AB){if(x[C]||x.length===undefined){return AB.call(Y,x,AA);}for(var G=0;G<x.length;++G){y[y.length]=AB.call(Y,x[G],AA);}}else{return false;}return y;},getDocumentHeight:function(){var Y=(K[t]!=M||I)?K.body.scrollHeight:W.scrollHeight,G=Math.max(Y,E.Dom.getViewportHeight());return G;},getDocumentWidth:function(){var Y=(K[t]!=M||I)?K.body.scrollWidth:W.scrollWidth,G=Math.max(Y,E.Dom.getViewportWidth());return G;},getViewportHeight:function(){var G=self.innerHeight,Y=K[t];if((Y||T)&&!D){G=(Y==M)?W.clientHeight:K.body.clientHeight;}return G;},getViewportWidth:function(){var G=self.innerWidth,Y=K[t];if(Y||T){G=(Y==M)?W.clientWidth:K.body.clientWidth;}return G;},getAncestorBy:function(G,Y){while((G=G[Z])){if(E.Dom._testElement(G,Y)){return G;}}return null;},getAncestorByClassName:function(Y,G){Y=E.Dom.get(Y);if(!Y){return null;}var x=function(y){return E.Dom.hasClass(y,G);};return E.Dom.getAncestorBy(Y,x);},getAncestorByTagName:function(Y,G){Y=E.Dom.get(Y);if(!Y){return null;}var x=function(y){return y[C]&&y[C].toUpperCase()==G.toUpperCase();};return E.Dom.getAncestorBy(Y,x);},getPreviousSiblingBy:function(G,Y){while(G){G=G.previousSibling;if(E.Dom._testElement(G,Y)){return G;}}return null;},getPreviousSibling:function(G){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getPreviousSiblingBy(G);},getNextSiblingBy:function(G,Y){while(G){G=G.nextSibling;if(E.Dom._testElement(G,Y)){return G;}}return null;},getNextSibling:function(G){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getNextSiblingBy(G);},getFirstChildBy:function(G,x){var Y=(E.Dom._testElement(G.firstChild,x))?G.firstChild:null;return Y||E.Dom.getNextSiblingBy(G.firstChild,x);},getFirstChild:function(G,Y){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getFirstChildBy(G);},getLastChildBy:function(G,x){if(!G){return null;}var Y=(E.Dom._testElement(G.lastChild,x))?G.lastChild:null;return Y||E.Dom.getPreviousSiblingBy(G.lastChild,x);},getLastChild:function(G){G=E.Dom.get(G);return E.Dom.getLastChildBy(G);},getChildrenBy:function(Y,y){var x=E.Dom.getFirstChildBy(Y,y),G=x?[x]:[];E.Dom.getNextSiblingBy(x,function(z){if(!y||y(z)){G[G.length]=z;}return false;});return G;},getChildren:function(G){G=E.Dom.get(G);if(!G){}return E.Dom.getChildrenBy(G);},getDocumentScrollLeft:function(G){G=G||K;return Math.max(G[v].scrollLeft,G.body.scrollLeft);},getDocumentScrollTop:function(G){G=G||K;return Math.max(G[v].scrollTop,G.body.scrollTop);},insertBefore:function(Y,G){Y=E.Dom.get(Y);G=E.Dom.get(G);if(!Y||!G||!G[Z]){return null;}return G[Z].insertBefore(Y,G);},insertAfter:function(Y,G){Y=E.Dom.get(Y);G=E.Dom.get(G);if(!Y||!G||!G[Z]){return null;}if(G.nextSibling){return G[Z].insertBefore(Y,G.nextSibling);}else{return G[Z].appendChild(Y);}},getClientRegion:function(){var x=E.Dom.getDocumentScrollTop(),Y=E.Dom.getDocumentScrollLeft(),y=E.Dom.getViewportWidth()+Y,G=E.Dom.getViewportHeight()+x;return new E.Region(x,y,G,Y);},setAttribute:function(Y,G,x){E.Dom.batch(Y,E.Dom._setAttribute,{attr:G,val:x});},_setAttribute:function(x,Y){var G=E.Dom._toCamel(Y.attr),y=Y.val;if(x&&x.setAttribute){if(E.Dom.DOT_ATTRIBUTES[G]){x[G]=y;}else{G=E.Dom.CUSTOM_ATTRIBUTES[G]||G;x.setAttribute(G,y);}}else{}},getAttribute:function(Y,G){return E.Dom.batch(Y,E.Dom._getAttribute,G);},_getAttribute:function(Y,G){var x;G=E.Dom.CUSTOM_ATTRIBUTES[G]||G;if(Y&&Y.getAttribute){x=Y.getAttribute(G,2);}else{}return x;},_toCamel:function(Y){var x=d;function G(y,z){return z.toUpperCase();}return x[Y]||(x[Y]=Y.indexOf("-")===-1?Y:Y.replace(/-([a-z])/gi,G));},_getClassRegex:function(Y){var G;if(Y!==undefined){if(Y.exec){G=Y;}else{G=h[Y];if(!G){Y=Y.replace(E.Dom._patterns.CLASS_RE_TOKENS,"\\$1");G=h[Y]=new RegExp(s+Y+k,U);}}}return G;},_patterns:{ROOT_TAG:/^body|html$/i,CLASS_RE_TOKENS:/([\.\(\)\^\$\*\+\?\|\[\]\{\}\\])/g},_testElement:function(G,Y){return G&&G[l]==1&&(!Y||Y(G));},_calcBorders:function(x,y){var Y=parseInt(E.Dom[w](x,R),10)||0,G=parseInt(E.Dom[w](x,q),10)||0;if(H){if(N.test(x[C])){Y=0;G=0;}}y[0]+=G;y[1]+=Y;return y;}};var S=E.Dom[w];if(m.opera){E.Dom[w]=function(Y,G){var x=S(Y,G);if(X.test(G)){x=E.Dom.Color.toRGB(x);}return x;};}if(m.webkit){E.Dom[w]=function(Y,G){var x=S(Y,G);if(x==="rgba(0, 0, 0, 0)"){x="transparent";}return x;};}if(m.ie&&m.ie>=8&&K.documentElement.hasAttribute){E.Dom.DOT_ATTRIBUTES.type=true;}})();YAHOO.util.Region=function(C,D,A,B){this.top=C;this.y=C;this[1]=C;this.right=D;this.bottom=A;this.left=B;this.x=B;this[0]=B;
this.width=this.right-this.left;this.height=this.bottom-this.top;};YAHOO.util.Region.prototype.contains=function(A){return(A.left>=this.left&&A.right<=this.right&&A.top>=this.top&&A.bottom<=this.bottom);};YAHOO.util.Region.prototype.getArea=function(){return((this.bottom-this.top)*(this.right-this.left));};YAHOO.util.Region.prototype.intersect=function(E){var C=Math.max(this.top,E.top),D=Math.min(this.right,E.right),A=Math.min(this.bottom,E.bottom),B=Math.max(this.left,E.left);if(A>=C&&D>=B){return new YAHOO.util.Region(C,D,A,B);}else{return null;}};YAHOO.util.Region.prototype.union=function(E){var C=Math.min(this.top,E.top),D=Math.max(this.right,E.right),A=Math.max(this.bottom,E.bottom),B=Math.min(this.left,E.left);return new YAHOO.util.Region(C,D,A,B);};YAHOO.util.Region.prototype.toString=function(){return("Region {"+"top: "+this.top+", right: "+this.right+", bottom: "+this.bottom+", left: "+this.left+", height: "+this.height+", width: "+this.width+"}");};YAHOO.util.Region.getRegion=function(D){var F=YAHOO.util.Dom.getXY(D),C=F[1],E=F[0]+D.offsetWidth,A=F[1]+D.offsetHeight,B=F[0];return new YAHOO.util.Region(C,E,A,B);};YAHOO.util.Point=function(A,B){if(YAHOO.lang.isArray(A)){B=A[1];A=A[0];}YAHOO.util.Point.superclass.constructor.call(this,B,A,B,A);};YAHOO.extend(YAHOO.util.Point,YAHOO.util.Region);(function(){var B=YAHOO.util,A="clientTop",F="clientLeft",J="parentNode",K="right",W="hasLayout",I="px",U="opacity",L="auto",D="borderLeftWidth",G="borderTopWidth",P="borderRightWidth",V="borderBottomWidth",S="visible",Q="transparent",N="height",E="width",H="style",T="currentStyle",R=/^width|height$/,O=/^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i,M={get:function(X,Z){var Y="",a=X[T][Z];if(Z===U){Y=B.Dom.getStyle(X,U);}else{if(!a||(a.indexOf&&a.indexOf(I)>-1)){Y=a;}else{if(B.Dom.IE_COMPUTED[Z]){Y=B.Dom.IE_COMPUTED[Z](X,Z);}else{if(O.test(a)){Y=B.Dom.IE.ComputedStyle.getPixel(X,Z);}else{Y=a;}}}}return Y;},getOffset:function(Z,e){var b=Z[T][e],X=e.charAt(0).toUpperCase()+e.substr(1),c="offset"+X,Y="pixel"+X,a="",d;if(b==L){d=Z[c];if(d===undefined){a=0;}a=d;if(R.test(e)){Z[H][e]=d;if(Z[c]>d){a=d-(Z[c]-d);}Z[H][e]=L;}}else{if(!Z[H][Y]&&!Z[H][e]){Z[H][e]=b;}a=Z[H][Y];}return a+I;},getBorderWidth:function(X,Z){var Y=null;if(!X[T][W]){X[H].zoom=1;}switch(Z){case G:Y=X[A];break;case V:Y=X.offsetHeight-X.clientHeight-X[A];break;case D:Y=X[F];break;case P:Y=X.offsetWidth-X.clientWidth-X[F];break;}return Y+I;},getPixel:function(Y,X){var a=null,b=Y[T][K],Z=Y[T][X];Y[H][K]=Z;a=Y[H].pixelRight;Y[H][K]=b;return a+I;},getMargin:function(Y,X){var Z;if(Y[T][X]==L){Z=0+I;}else{Z=B.Dom.IE.ComputedStyle.getPixel(Y,X);}return Z;},getVisibility:function(Y,X){var Z;while((Z=Y[T])&&Z[X]=="inherit"){Y=Y[J];}return(Z)?Z[X]:S;},getColor:function(Y,X){return B.Dom.Color.toRGB(Y[T][X])||Q;},getBorderColor:function(Y,X){var Z=Y[T],a=Z[X]||Z.color;return B.Dom.Color.toRGB(B.Dom.Color.toHex(a));}},C={};C.top=C.right=C.bottom=C.left=C[E]=C[N]=M.getOffset;C.color=M.getColor;C[G]=C[P]=C[V]=C[D]=M.getBorderWidth;C.marginTop=C.marginRight=C.marginBottom=C.marginLeft=M.getMargin;C.visibility=M.getVisibility;C.borderColor=C.borderTopColor=C.borderRightColor=C.borderBottomColor=C.borderLeftColor=M.getBorderColor;B.Dom.IE_COMPUTED=C;B.Dom.IE_ComputedStyle=M;})();(function(){var C="toString",A=parseInt,B=RegExp,D=YAHOO.util;D.Dom.Color={KEYWORDS:{black:"000",silver:"c0c0c0",gray:"808080",white:"fff",maroon:"800000",red:"f00",purple:"800080",fuchsia:"f0f",green:"008000",lime:"0f0",olive:"808000",yellow:"ff0",navy:"000080",blue:"00f",teal:"008080",aqua:"0ff"},re_RGB:/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,re_hex:/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,re_hex3:/([0-9A-F])/gi,toRGB:function(E){if(!D.Dom.Color.re_RGB.test(E)){E=D.Dom.Color.toHex(E);}if(D.Dom.Color.re_hex.exec(E)){E="rgb("+[A(B.$1,16),A(B.$2,16),A(B.$3,16)].join(", ")+")";}return E;},toHex:function(H){H=D.Dom.Color.KEYWORDS[H]||H;if(D.Dom.Color.re_RGB.exec(H)){var G=(B.$1.length===1)?"0"+B.$1:Number(B.$1),F=(B.$2.length===1)?"0"+B.$2:Number(B.$2),E=(B.$3.length===1)?"0"+B.$3:Number(B.$3);H=[G[C](16),F[C](16),E[C](16)].join("");}if(H.length<6){H=H.replace(D.Dom.Color.re_hex3,"$1$1");}if(H!=="transparent"&&H.indexOf("#")<0){H="#"+H;}return H.toLowerCase();}};}());YAHOO.register("dom",YAHOO.util.Dom,{version:"2.8.1",build:"19"});YAHOO.util.CustomEvent=function(D,C,B,A,E){this.type=D;this.scope=C||window;this.silent=B;this.fireOnce=E;this.fired=false;this.firedWith=null;this.signature=A||YAHOO.util.CustomEvent.LIST;this.subscribers=[];if(!this.silent){}var F="_YUICEOnSubscribe";if(D!==F){this.subscribeEvent=new YAHOO.util.CustomEvent(F,this,true);}this.lastError=null;};YAHOO.util.CustomEvent.LIST=0;YAHOO.util.CustomEvent.FLAT=1;YAHOO.util.CustomEvent.prototype={subscribe:function(B,C,D){if(!B){throw new Error("Invalid callback for subscriber to '"+this.type+"'");}if(this.subscribeEvent){this.subscribeEvent.fire(B,C,D);}var A=new YAHOO.util.Subscriber(B,C,D);if(this.fireOnce&&this.fired){this.notify(A,this.firedWith);}else{this.subscribers.push(A);}},unsubscribe:function(D,F){if(!D){return this.unsubscribeAll();}var E=false;for(var B=0,A=this.subscribers.length;B<A;++B){var C=this.subscribers[B];if(C&&C.contains(D,F)){this._delete(B);E=true;}}return E;},fire:function(){this.lastError=null;var H=[],A=this.subscribers.length;var D=[].slice.call(arguments,0),C=true,F,B=false;if(this.fireOnce){if(this.fired){return true;}else{this.firedWith=D;}}this.fired=true;if(!A&&this.silent){return true;}if(!this.silent){}var E=this.subscribers.slice();for(F=0;F<A;++F){var G=E[F];if(!G){B=true;}else{C=this.notify(G,D);if(false===C){if(!this.silent){}break;}}}return(C!==false);},notify:function(F,C){var B,H=null,E=F.getScope(this.scope),A=YAHOO.util.Event.throwErrors;if(!this.silent){}if(this.signature==YAHOO.util.CustomEvent.FLAT){if(C.length>0){H=C[0];}try{B=F.fn.call(E,H,F.obj);}catch(G){this.lastError=G;if(A){throw G;}}}else{try{B=F.fn.call(E,this.type,C,F.obj);}catch(D){this.lastError=D;if(A){throw D;}}}return B;},unsubscribeAll:function(){var A=this.subscribers.length,B;for(B=A-1;B>-1;B--){this._delete(B);}this.subscribers=[];return A;},_delete:function(A){var B=this.subscribers[A];if(B){delete B.fn;delete B.obj;}this.subscribers.splice(A,1);},toString:function(){return"CustomEvent: "+"'"+this.type+"', "+"context: "+this.scope;}};YAHOO.util.Subscriber=function(A,B,C){this.fn=A;this.obj=YAHOO.lang.isUndefined(B)?null:B;this.overrideContext=C;};YAHOO.util.Subscriber.prototype.getScope=function(A){if(this.overrideContext){if(this.overrideContext===true){return this.obj;}else{return this.overrideContext;}}return A;};YAHOO.util.Subscriber.prototype.contains=function(A,B){if(B){return(this.fn==A&&this.obj==B);}else{return(this.fn==A);}};YAHOO.util.Subscriber.prototype.toString=function(){return"Subscriber { obj: "+this.obj+", overrideContext: "+(this.overrideContext||"no")+" }";};if(!YAHOO.util.Event){YAHOO.util.Event=function(){var G=false,H=[],J=[],A=0,E=[],B=0,C={63232:38,63233:40,63234:37,63235:39,63276:33,63277:34,25:9},D=YAHOO.env.ua.ie,F="focusin",I="focusout";return{POLL_RETRYS:500,POLL_INTERVAL:40,EL:0,TYPE:1,FN:2,WFN:3,UNLOAD_OBJ:3,ADJ_SCOPE:4,OBJ:5,OVERRIDE:6,CAPTURE:7,lastError:null,isSafari:YAHOO.env.ua.webkit,webkit:YAHOO.env.ua.webkit,isIE:D,_interval:null,_dri:null,_specialTypes:{focusin:(D?"focusin":"focus"),focusout:(D?"focusout":"blur")},DOMReady:false,throwErrors:false,startInterval:function(){if(!this._interval){this._interval=YAHOO.lang.later(this.POLL_INTERVAL,this,this._tryPreloadAttach,null,true);}},onAvailable:function(Q,M,O,P,N){var K=(YAHOO.lang.isString(Q))?[Q]:Q;for(var L=0;L<K.length;L=L+1){E.push({id:K[L],fn:M,obj:O,overrideContext:P,checkReady:N});}A=this.POLL_RETRYS;this.startInterval();},onContentReady:function(N,K,L,M){this.onAvailable(N,K,L,M,true);},onDOMReady:function(){this.DOMReadyEvent.subscribe.apply(this.DOMReadyEvent,arguments);},_addListener:function(M,K,V,P,T,Y){if(!V||!V.call){return false;}if(this._isValidCollection(M)){var W=true;for(var Q=0,S=M.length;Q<S;++Q){W=this.on(M[Q],K,V,P,T)&&W;}return W;}else{if(YAHOO.lang.isString(M)){var O=this.getEl(M);if(O){M=O;}else{this.onAvailable(M,function(){YAHOO.util.Event._addListener(M,K,V,P,T,Y);});return true;}}}if(!M){return false;}if("unload"==K&&P!==this){J[J.length]=[M,K,V,P,T];return true;}var L=M;if(T){if(T===true){L=P;}else{L=T;}}var N=function(Z){return V.call(L,YAHOO.util.Event.getEvent(Z,M),P);};var X=[M,K,V,N,L,P,T,Y];var R=H.length;H[R]=X;try{this._simpleAdd(M,K,N,Y);}catch(U){this.lastError=U;this.removeListener(M,K,V);return false;}return true;},_getType:function(K){return this._specialTypes[K]||K;},addListener:function(M,P,L,N,O){var K=((P==F||P==I)&&!YAHOO.env.ua.ie)?true:false;return this._addListener(M,this._getType(P),L,N,O,K);},addFocusListener:function(L,K,M,N){return this.on(L,F,K,M,N);},removeFocusListener:function(L,K){return this.removeListener(L,F,K);},addBlurListener:function(L,K,M,N){return this.on(L,I,K,M,N);},removeBlurListener:function(L,K){return this.removeListener(L,I,K);},removeListener:function(L,K,R){var M,P,U;K=this._getType(K);if(typeof L=="string"){L=this.getEl(L);}else{if(this._isValidCollection(L)){var S=true;for(M=L.length-1;M>-1;M--){S=(this.removeListener(L[M],K,R)&&S);}return S;}}if(!R||!R.call){return this.purgeElement(L,false,K);}if("unload"==K){for(M=J.length-1;M>-1;M--){U=J[M];if(U&&U[0]==L&&U[1]==K&&U[2]==R){J.splice(M,1);return true;}}return false;}var N=null;var O=arguments[3];if("undefined"===typeof O){O=this._getCacheIndex(H,L,K,R);}if(O>=0){N=H[O];}if(!L||!N){return false;}var T=N[this.CAPTURE]===true?true:false;try{this._simpleRemove(L,K,N[this.WFN],T);}catch(Q){this.lastError=Q;return false;}delete H[O][this.WFN];delete H[O][this.FN];H.splice(O,1);return true;},getTarget:function(M,L){var K=M.target||M.srcElement;return this.resolveTextNode(K);},resolveTextNode:function(L){try{if(L&&3==L.nodeType){return L.parentNode;}}catch(K){}return L;},getPageX:function(L){var K=L.pageX;if(!K&&0!==K){K=L.clientX||0;if(this.isIE){K+=this._getScrollLeft();}}return K;},getPageY:function(K){var L=K.pageY;if(!L&&0!==L){L=K.clientY||0;if(this.isIE){L+=this._getScrollTop();}}return L;},getXY:function(K){return[this.getPageX(K),this.getPageY(K)];},getRelatedTarget:function(L){var K=L.relatedTarget;if(!K){if(L.type=="mouseout"){K=L.toElement;
}else{if(L.type=="mouseover"){K=L.fromElement;}}}return this.resolveTextNode(K);},getTime:function(M){if(!M.time){var L=new Date().getTime();try{M.time=L;}catch(K){this.lastError=K;return L;}}return M.time;},stopEvent:function(K){this.stopPropagation(K);this.preventDefault(K);},stopPropagation:function(K){if(K.stopPropagation){K.stopPropagation();}else{K.cancelBubble=true;}},preventDefault:function(K){if(K.preventDefault){K.preventDefault();}else{K.returnValue=false;}},getEvent:function(M,K){var L=M||window.event;if(!L){var N=this.getEvent.caller;while(N){L=N.arguments[0];if(L&&Event==L.constructor){break;}N=N.caller;}}return L;},getCharCode:function(L){var K=L.keyCode||L.charCode||0;if(YAHOO.env.ua.webkit&&(K in C)){K=C[K];}return K;},_getCacheIndex:function(M,P,Q,O){for(var N=0,L=M.length;N<L;N=N+1){var K=M[N];if(K&&K[this.FN]==O&&K[this.EL]==P&&K[this.TYPE]==Q){return N;}}return -1;},generateId:function(K){var L=K.id;if(!L){L="yuievtautoid-"+B;++B;K.id=L;}return L;},_isValidCollection:function(L){try{return(L&&typeof L!=="string"&&L.length&&!L.tagName&&!L.alert&&typeof L[0]!=="undefined");}catch(K){return false;}},elCache:{},getEl:function(K){return(typeof K==="string")?document.getElementById(K):K;},clearCache:function(){},DOMReadyEvent:new YAHOO.util.CustomEvent("DOMReady",YAHOO,0,0,1),_load:function(L){if(!G){G=true;var K=YAHOO.util.Event;K._ready();K._tryPreloadAttach();}},_ready:function(L){var K=YAHOO.util.Event;if(!K.DOMReady){K.DOMReady=true;K.DOMReadyEvent.fire();K._simpleRemove(document,"DOMContentLoaded",K._ready);}},_tryPreloadAttach:function(){if(E.length===0){A=0;if(this._interval){this._interval.cancel();this._interval=null;}return;}if(this.locked){return;}if(this.isIE){if(!this.DOMReady){this.startInterval();return;}}this.locked=true;var Q=!G;if(!Q){Q=(A>0&&E.length>0);}var P=[];var R=function(T,U){var S=T;if(U.overrideContext){if(U.overrideContext===true){S=U.obj;}else{S=U.overrideContext;}}U.fn.call(S,U.obj);};var L,K,O,N,M=[];for(L=0,K=E.length;L<K;L=L+1){O=E[L];if(O){N=this.getEl(O.id);if(N){if(O.checkReady){if(G||N.nextSibling||!Q){M.push(O);E[L]=null;}}else{R(N,O);E[L]=null;}}else{P.push(O);}}}for(L=0,K=M.length;L<K;L=L+1){O=M[L];R(this.getEl(O.id),O);}A--;if(Q){for(L=E.length-1;L>-1;L--){O=E[L];if(!O||!O.id){E.splice(L,1);}}this.startInterval();}else{if(this._interval){this._interval.cancel();this._interval=null;}}this.locked=false;},purgeElement:function(O,P,R){var M=(YAHOO.lang.isString(O))?this.getEl(O):O;var Q=this.getListeners(M,R),N,K;if(Q){for(N=Q.length-1;N>-1;N--){var L=Q[N];this.removeListener(M,L.type,L.fn);}}if(P&&M&&M.childNodes){for(N=0,K=M.childNodes.length;N<K;++N){this.purgeElement(M.childNodes[N],P,R);}}},getListeners:function(M,K){var P=[],L;if(!K){L=[H,J];}else{if(K==="unload"){L=[J];}else{K=this._getType(K);L=[H];}}var R=(YAHOO.lang.isString(M))?this.getEl(M):M;for(var O=0;O<L.length;O=O+1){var T=L[O];if(T){for(var Q=0,S=T.length;Q<S;++Q){var N=T[Q];if(N&&N[this.EL]===R&&(!K||K===N[this.TYPE])){P.push({type:N[this.TYPE],fn:N[this.FN],obj:N[this.OBJ],adjust:N[this.OVERRIDE],scope:N[this.ADJ_SCOPE],index:Q});}}}}return(P.length)?P:null;},_unload:function(R){var L=YAHOO.util.Event,O,N,M,Q,P,S=J.slice(),K;for(O=0,Q=J.length;O<Q;++O){M=S[O];if(M){K=window;if(M[L.ADJ_SCOPE]){if(M[L.ADJ_SCOPE]===true){K=M[L.UNLOAD_OBJ];}else{K=M[L.ADJ_SCOPE];}}M[L.FN].call(K,L.getEvent(R,M[L.EL]),M[L.UNLOAD_OBJ]);S[O]=null;}}M=null;K=null;J=null;if(H){for(N=H.length-1;N>-1;N--){M=H[N];if(M){L.removeListener(M[L.EL],M[L.TYPE],M[L.FN],N);}}M=null;}L._simpleRemove(window,"unload",L._unload);},_getScrollLeft:function(){return this._getScroll()[1];},_getScrollTop:function(){return this._getScroll()[0];},_getScroll:function(){var K=document.documentElement,L=document.body;if(K&&(K.scrollTop||K.scrollLeft)){return[K.scrollTop,K.scrollLeft];}else{if(L){return[L.scrollTop,L.scrollLeft];}else{return[0,0];}}},regCE:function(){},_simpleAdd:function(){if(window.addEventListener){return function(M,N,L,K){M.addEventListener(N,L,(K));};}else{if(window.attachEvent){return function(M,N,L,K){M.attachEvent("on"+N,L);};}else{return function(){};}}}(),_simpleRemove:function(){if(window.removeEventListener){return function(M,N,L,K){M.removeEventListener(N,L,(K));};}else{if(window.detachEvent){return function(L,M,K){L.detachEvent("on"+M,K);};}else{return function(){};}}}()};}();(function(){var EU=YAHOO.util.Event;EU.on=EU.addListener;EU.onFocus=EU.addFocusListener;EU.onBlur=EU.addBlurListener;
if(EU.isIE){if(self!==self.top){document.onreadystatechange=function(){if(document.readyState=="complete"){document.onreadystatechange=null;EU._ready();}};}else{YAHOO.util.Event.onDOMReady(YAHOO.util.Event._tryPreloadAttach,YAHOO.util.Event,true);var n=document.createElement("p");EU._dri=setInterval(function(){try{n.doScroll("left");clearInterval(EU._dri);EU._dri=null;EU._ready();n=null;}catch(ex){}},EU.POLL_INTERVAL);}}else{if(EU.webkit&&EU.webkit<525){EU._dri=setInterval(function(){var rs=document.readyState;if("loaded"==rs||"complete"==rs){clearInterval(EU._dri);EU._dri=null;EU._ready();}},EU.POLL_INTERVAL);}else{EU._simpleAdd(document,"DOMContentLoaded",EU._ready);}}EU._simpleAdd(window,"load",EU._load);EU._simpleAdd(window,"unload",EU._unload);EU._tryPreloadAttach();})();}YAHOO.util.EventProvider=function(){};YAHOO.util.EventProvider.prototype={__yui_events:null,__yui_subscribers:null,subscribe:function(A,C,F,E){this.__yui_events=this.__yui_events||{};var D=this.__yui_events[A];if(D){D.subscribe(C,F,E);}else{this.__yui_subscribers=this.__yui_subscribers||{};var B=this.__yui_subscribers;if(!B[A]){B[A]=[];}B[A].push({fn:C,obj:F,overrideContext:E});}},unsubscribe:function(C,E,G){this.__yui_events=this.__yui_events||{};var A=this.__yui_events;if(C){var F=A[C];if(F){return F.unsubscribe(E,G);}}else{var B=true;for(var D in A){if(YAHOO.lang.hasOwnProperty(A,D)){B=B&&A[D].unsubscribe(E,G);}}return B;}return false;},unsubscribeAll:function(A){return this.unsubscribe(A);
},createEvent:function(B,G){this.__yui_events=this.__yui_events||{};var E=G||{},D=this.__yui_events,F;if(D[B]){}else{F=new YAHOO.util.CustomEvent(B,E.scope||this,E.silent,YAHOO.util.CustomEvent.FLAT,E.fireOnce);D[B]=F;if(E.onSubscribeCallback){F.subscribeEvent.subscribe(E.onSubscribeCallback);}this.__yui_subscribers=this.__yui_subscribers||{};var A=this.__yui_subscribers[B];if(A){for(var C=0;C<A.length;++C){F.subscribe(A[C].fn,A[C].obj,A[C].overrideContext);}}}return D[B];},fireEvent:function(B){this.__yui_events=this.__yui_events||{};var D=this.__yui_events[B];if(!D){return null;}var A=[];for(var C=1;C<arguments.length;++C){A.push(arguments[C]);}return D.fire.apply(D,A);},hasEvent:function(A){if(this.__yui_events){if(this.__yui_events[A]){return true;}}return false;}};(function(){var A=YAHOO.util.Event,C=YAHOO.lang;YAHOO.util.KeyListener=function(D,I,E,F){if(!D){}else{if(!I){}else{if(!E){}}}if(!F){F=YAHOO.util.KeyListener.KEYDOWN;}var G=new YAHOO.util.CustomEvent("keyPressed");this.enabledEvent=new YAHOO.util.CustomEvent("enabled");this.disabledEvent=new YAHOO.util.CustomEvent("disabled");if(C.isString(D)){D=document.getElementById(D);}if(C.isFunction(E)){G.subscribe(E);}else{G.subscribe(E.fn,E.scope,E.correctScope);}function H(O,N){if(!I.shift){I.shift=false;}if(!I.alt){I.alt=false;}if(!I.ctrl){I.ctrl=false;}if(O.shiftKey==I.shift&&O.altKey==I.alt&&O.ctrlKey==I.ctrl){var J,M=I.keys,L;if(YAHOO.lang.isArray(M)){for(var K=0;K<M.length;K++){J=M[K];L=A.getCharCode(O);if(J==L){G.fire(L,O);break;}}}else{L=A.getCharCode(O);if(M==L){G.fire(L,O);}}}}this.enable=function(){if(!this.enabled){A.on(D,F,H);this.enabledEvent.fire(I);}this.enabled=true;};this.disable=function(){if(this.enabled){A.removeListener(D,F,H);this.disabledEvent.fire(I);}this.enabled=false;};this.toString=function(){return"KeyListener ["+I.keys+"] "+D.tagName+(D.id?"["+D.id+"]":"");};};var B=YAHOO.util.KeyListener;B.KEYDOWN="keydown";B.KEYUP="keyup";B.KEY={ALT:18,BACK_SPACE:8,CAPS_LOCK:20,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,META:224,NUM_LOCK:144,PAGE_DOWN:34,PAGE_UP:33,PAUSE:19,PRINTSCREEN:44,RIGHT:39,SCROLL_LOCK:145,SHIFT:16,SPACE:32,TAB:9,UP:38};})();YAHOO.register("event",YAHOO.util.Event,{version:"2.8.1",build:"19"});YAHOO.register("yahoo-dom-event", YAHOO, {version: "2.8.1", build: "19"});

/* SOURCE FILE: tds_calc_env.js (218bd70c) 1/26/2015 1:19:44 PM */

YAHOO.env = YAHOO.env || {
modules: [],
listeners: []
};
YAHOO.env.getVersion = function(name) {
return YAHOO.env.modules[name] || null;
};
YAHOO.env.parseUA = function(agent) {
var numberify = function(s) {
var c = 0;
return parseFloat(s.replace(/\./g, function() {
return (c++ == 1) ? '' : '.';
}));
},
nav = navigator,
o = {
ie: 0,
opera: 0,
gecko: 0,
webkit: 0,
chrome: 0,
mobile: null,
air: 0,
ipad: 0,
iphone: 0,
ipod: 0,
ios: null,
android: 0,
webos: 0,
caja: nav && nav.cajaVersion,
secure: false,
os: null
},
ua = agent || (navigator && navigator.userAgent),
loc = window && window.location,
href = loc && loc.href,
m;
o.secure = href && (href.toLowerCase().indexOf("https") === 0);
if (ua) {
if ((/windows|win32/i).test(ua)) {
o.os = 'windows';
} else if ((/macintosh/i).test(ua)) {
o.os = 'macintosh';
} else if ((/rhino/i).test(ua)) {
o.os = 'rhino';
}
if ((/KHTML/).test(ua)) {
o.webkit = 1;
}
m = ua.match(/AppleWebKit\/([^\s]*)/);
if (m && m[1]) {
o.webkit = numberify(m[1]);
if (/ Mobile\//.test(ua)) {
o.mobile = 'Apple';
m = ua.match(/OS ([^\s]*)/);
if (m && m[1]) {
m = numberify(m[1].replace('_', '.'));
}
o.ios = m;
o.ipad = o.ipod = o.iphone = 0;
m = ua.match(/iPad|iPod|iPhone/);
if (m && m[0]) {
o[m[0].toLowerCase()] = o.ios;
}
} else {
m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);
if (m) {
o.mobile = m[0];
}
if (/webOS/.test(ua)) {
o.mobile = 'WebOS';
m = ua.match(/webOS\/([^\s]*);/);
if (m && m[1]) {
o.webos = numberify(m[1]);
}
}
if (/ Android/.test(ua)) {
o.mobile = 'Android';
m = ua.match(/Android ([^\s]*);/);
if (m && m[1]) {
o.android = numberify(m[1]);
}
}
}
m = ua.match(/Chrome\/([^\s]*)/);
if (m && m[1]) {
o.chrome = numberify(m[1]);
} else {
m = ua.match(/AdobeAIR\/([^\s]*)/);
if (m) {
o.air = m[0];
}
}
}
if (!o.webkit) {
m = ua.match(/Opera[\s\/]([^\s]*)/);
if (m && m[1]) {
o.opera = numberify(m[1]);
m = ua.match(/Version\/([^\s]*)/);
if (m && m[1]) {
o.opera = numberify(m[1]);
}
m = ua.match(/Opera Mini[^;]*/);
if (m) {
o.mobile = m[0];
}
} else {
m = ua.match(/MSIE\s([^;]*)/);
if (m && m[1]) {
o.ie = numberify(m[1]);
} else {
m = ua.match(/Gecko\/([^\s]*)/);
if (m) {
o.gecko = 1;
m = ua.match(/rv:([^\s\)]*)/);
if (m && m[1]) {
o.gecko = numberify(m[1]);
}
}
}
}
}
}
return o;
};
YAHOO.env.ua = YAHOO.env.parseUA();
(function() {
YAHOO.namespace("util", "widget", "example");
if ("undefined" !== typeof YAHOO_config) {
var l=YAHOO_config.listener, ls=YAHOO.env.listeners,unique=true, i;
if (l) {
for (i=0; i<ls.length; i++) {
if (ls[i] == l) {
unique = false;
break;
}
}
if (unique) {
ls.push(l);
}
}
}
})();

/* SOURCE FILE: shortcut.js (1fc9ae0b) 1/26/2015 1:19:44 PM */

shortcut = {
'all_shortcuts':{},
'add': function(shortcut_combination,callback,opt) {
var default_options = {
'type':'keydown',
'propagate':false,
'disable_in_input':false,
'target':document,
'keycode':false
}
if(!opt) opt = default_options;
else {
for(var dfo in default_options) {
if(typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
}
}
var ele = opt.target;
if(typeof opt.target == 'string') ele = document.getElementById(opt.target);
var ths = this;
shortcut_combination = shortcut_combination.toLowerCase();
var func = function(e) {
e = e || window.event;
if(opt['disable_in_input']) {
var element;
if(e.target) element=e.target;
else if(e.srcElement) element=e.srcElement;
if(element.nodeType==3) element=element.parentNode;
if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
}
if (e.keyCode) code = e.keyCode;
else if (e.which) code = e.which;
var character = String.fromCharCode(code).toLowerCase();
if(code == 188) character=",";
if(code == 190) character=".";
var keys = shortcut_combination.split("+");
var kp = 0;
var shift_nums = {
"`":"~",
"1":"!",
"2":"@",
"3":"#",
"4":"$",
"5":"%",
"6":"^",
"7":"&",
"8":"*",
"9":"(",
"0":")",
"-":"_",
"=":"+",
";":":",
"'":"\"",
",":"<",
".":">",
"/":"?",
"\\":"|"
}
var special_keys = {
'esc':27,
'escape':27,
'tab':9,
'space':32,
'return':13,
'enter':13,
'backspace':8,
'scrolllock':145,
'scroll_lock':145,
'scroll':145,
'capslock':20,
'caps_lock':20,
'caps':20,
'numlock':144,
'num_lock':144,
'num':144,
'pause':19,
'break':19,
'insert':45,
'home':36,
'delete':46,
'end':35,
'pageup':33,
'page_up':33,
'pu':33,
'pagedown':34,
'page_down':34,
'pd':34,
'left':37,
'up':38,
'right':39,
'down':40,
'f1':112,
'f2':113,
'f3':114,
'f4':115,
'f5':116,
'f6':117,
'f7':118,
'f8':119,
'f9':120,
'f10':121,
'f11':122,
'f12':123
}
var modifiers = {
shift: { wanted:false, pressed:false},
ctrl : { wanted:false, pressed:false},
alt  : { wanted:false, pressed:false},
meta : { wanted:false, pressed:false}
};
if(e.ctrlKey) modifiers.ctrl.pressed = true;
if(e.shiftKey) modifiers.shift.pressed = true;
if(e.altKey) modifiers.alt.pressed = true;
if(e.metaKey)   modifiers.meta.pressed = true;
for(var i=0; k=keys[i],i<keys.length; i++) {
if(k == 'ctrl' || k == 'control') {
kp++;
modifiers.ctrl.wanted = true;
} else if(k == 'shift') {
kp++;
modifiers.shift.wanted = true;
} else if(k == 'alt') {
kp++;
modifiers.alt.wanted = true;
} else if(k == 'meta') {
kp++;
modifiers.meta.wanted = true;
} else if(k.length > 1) {
if(special_keys[k] == code) kp++;
} else if(opt['keycode']) {
if(opt['keycode'] == code) kp++;
} else {
if(character == k) kp++;
else {
if(shift_nums[character] && e.shiftKey) {
character = shift_nums[character];
if(character == k) kp++;
}
}
}
}
if(kp == keys.length &&
modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
modifiers.shift.pressed == modifiers.shift.wanted &&
modifiers.alt.pressed == modifiers.alt.wanted &&
modifiers.meta.pressed == modifiers.meta.wanted) {
var keepPropagating = callback(e);
if(!opt['propagate'] && !keepPropagating) {
e.cancelBubble = true;
e.returnValue = false;
if (e.stopPropagation) {
e.stopPropagation();
e.preventDefault();
}
return false;
}
}
}
this.all_shortcuts[shortcut_combination] = {
'callback':func,
'target':ele,
'event': opt['type']
};
if(ele.addEventListener) ele.addEventListener(opt['type'], func, false);
else if(ele.attachEvent) ele.attachEvent('on'+opt['type'], func);
else ele['on'+opt['type']] = func;
},
'remove':function(shortcut_combination) {
shortcut_combination = shortcut_combination.toLowerCase();
var binding = this.all_shortcuts[shortcut_combination];
delete(this.all_shortcuts[shortcut_combination])
if(!binding) return;
var type = binding['event'];
var ele = binding['target'];
var callback = binding['callback'];
if(ele.detachEvent) ele.detachEvent('on'+type, callback);
else if(ele.removeEventListener) ele.removeEventListener(type, callback, false);
else ele['on'+type] = false;
}
}

/* SOURCE FILE: textCanvas.js (24936d44) 1/26/2015 1:19:44 PM */

function TextCanvas(container, ctnCanvas) {
this.container = container;
if (!container.style.position)
container.style.position = 'relative';
var canvas = document.getElementById(ctnCanvas);
this.canvas = canvas;
this.canvas.style.position = 'absolute';
this.labels = [];
}
TextCanvas.CSSStringProperties = 'color direction fontFamily fontSize fontSizeAdjust fontStretch fontStyle fontVariant fontWeight letterSpacing lineHeight textAlign textDecoration textIndent textShadow textTransform unicodeBidi whiteSpace wordSpacing'.split(' ');
TextCanvas.prototype.getContext = function(contextID) {
var ctx = this.canvas.getContext(contextID);
if (contextID == '2d')
this.attachMethods(ctx, this);
return ctx;
};
TextCanvas.prototype.setDimensions = function(width, height) {
var container = this.container;
var canvas = this.canvas;
canvas.setAttribute('width', width);
canvas.setAttribute('height', height);
this.container.style.width = width;
this.container.style.height = height;
}
TextCanvas.prototype.clear = function() {
var canvas = this.canvas;
var ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height);
for (var i = 0; i < this.labels.length; i++)
this.container.removeChild(this.labels[i]);
this.labels = [];
};
TextCanvas.prototype.attachMethods = function(ctx, controller) {
ctx.drawString = function(x, y, string) {
controller.addLabel(x, y, string);
};
ctx.clear = function () {
controller.clear();
};
ctx.stringStyle = controller.container.style;
};
TextCanvas.prototype.addLabel = function(x, y, string) {
var label = document.createElement('div');
label.innerHTML = string;
var style = this.container.style;
var cssNames = TextCanvas.CSSStringProperties;
for (var i = 0; i < cssNames.length; i++) {
var name = cssNames[i];
label.style[name] = style[name];
}
label.style.position = 'absolute';
label.style.left = x;
label.style.top = y;
this.container.appendChild(label);
this.labels.push(label);
}

/* SOURCE FILE: excanvas.js (a26ce297) 1/26/2015 1:19:44 PM */

if (!document.createElement('canvas').getContext) {
(function() {
var m = Math;
var mr = m.round;
var ms = m.sin;
var mc = m.cos;
var abs = m.abs;
var sqrt = m.sqrt;
var Z = 10;
var Z2 = Z / 2;
function getContext() {
return this.context_ ||
(this.context_ = new CanvasRenderingContext2D_(this));
}
var slice = Array.prototype.slice;
function bind(f, obj, var_args) {
var a = slice.call(arguments, 2);
return function() {
return f.apply(obj, a.concat(slice.call(arguments)));
};
}
var G_vmlCanvasManager_ = {
init: function(opt_doc) {
if (/MSIE/.test(navigator.userAgent) && !window.opera) {
var doc = opt_doc || document;
doc.createElement('canvas');
doc.attachEvent('onreadystatechange', bind(this.init_, this, doc));
}
},
init_: function(doc) {
if (!doc.namespaces['g_vml_']) {
doc.namespaces.add('g_vml_', 'urn:schemas-microsoft-com:vml',
'#default#VML');
}
if (!doc.namespaces['g_o_']) {
doc.namespaces.add('g_o_', 'urn:schemas-microsoft-com:office:office',
'#default#VML');
}
if (!doc.styleSheets['ex_canvas_']) {
var ss = doc.createStyleSheet();
ss.owningElement.id = 'ex_canvas_';
ss.cssText = 'canvas{display:inline-block;overflow:hidden;' +
'text-align:left;width:300px;height:150px}' +
'g_vml_\\:*{behavior:url(#default#VML)}' +
'g_o_\\:*{behavior:url(#default#VML)}';
}
var els = doc.getElementsByTagName('canvas');
for (var i = 0; i < els.length; i++) {
this.initElement(els[i]);
}
},
initElement: function(el) {
if (!el.getContext) {
el.getContext = getContext;
el.innerHTML = '';
el.attachEvent('onpropertychange', onPropertyChange);
el.attachEvent('onresize', onResize);
var attrs = el.attributes;
if (attrs.width && attrs.width.specified) {
el.style.width = attrs.width.nodeValue + 'px';
} else {
el.width = el.clientWidth;
}
if (attrs.height && attrs.height.specified) {
el.style.height = attrs.height.nodeValue + 'px';
} else {
el.height = el.clientHeight;
}
}
return el;
}
};
function onPropertyChange(e) {
var el = e.srcElement;
switch (e.propertyName) {
case 'width':
el.style.width = el.attributes.width.nodeValue + 'px';
el.getContext().clearRect();
break;
case 'height':
el.style.height = el.attributes.height.nodeValue + 'px';
el.getContext().clearRect();
break;
}
}
function onResize(e) {
var el = e.srcElement;
if (el.firstChild) {
el.firstChild.style.width =  el.clientWidth + 'px';
el.firstChild.style.height = el.clientHeight + 'px';
}
}
G_vmlCanvasManager_.init();
var dec2hex = [];
for (var i = 0; i < 16; i++) {
for (var j = 0; j < 16; j++) {
dec2hex[i * 16 + j] = i.toString(16) + j.toString(16);
}
}
function createMatrixIdentity() {
return [
[1, 0, 0],
[0, 1, 0],
[0, 0, 1]
];
}
function matrixMultiply(m1, m2) {
var result = createMatrixIdentity();
for (var x = 0; x < 3; x++) {
for (var y = 0; y < 3; y++) {
var sum = 0;
for (var z = 0; z < 3; z++) {
sum += m1[x][z] * m2[z][y];
}
result[x][y] = sum;
}
}
return result;
}
function copyState(o1, o2) {
o2.fillStyle     = o1.fillStyle;
o2.lineCap       = o1.lineCap;
o2.lineJoin      = o1.lineJoin;
o2.lineWidth     = o1.lineWidth;
o2.miterLimit    = o1.miterLimit;
o2.shadowBlur    = o1.shadowBlur;
o2.shadowColor   = o1.shadowColor;
o2.shadowOffsetX = o1.shadowOffsetX;
o2.shadowOffsetY = o1.shadowOffsetY;
o2.strokeStyle   = o1.strokeStyle;
o2.globalAlpha   = o1.globalAlpha;
o2.arcScaleX_    = o1.arcScaleX_;
o2.arcScaleY_    = o1.arcScaleY_;
o2.lineScale_    = o1.lineScale_;
}
function processStyle(styleString) {
var str, alpha = 1;
styleString = String(styleString);
if (styleString.substring(0, 3) == 'rgb') {
var start = styleString.indexOf('(', 3);
var end = styleString.indexOf(')', start + 1);
var guts = styleString.substring(start + 1, end).split(',');
str = '#';
for (var i = 0; i < 3; i++) {
str += dec2hex[Number(guts[i])];
}
if (guts.length == 4 && styleString.substr(3, 1) == 'a') {
alpha = guts[3];
}
} else {
str = styleString;
}
return {color: str, alpha: alpha};
}
function processLineCap(lineCap) {
switch (lineCap) {
case 'butt':
return 'flat';
case 'round':
return 'round';
case 'square':
default:
return 'square';
}
}
function CanvasRenderingContext2D_(surfaceElement) {
this.m_ = createMatrixIdentity();
this.mStack_ = [];
this.aStack_ = [];
this.currentPath_ = [];
this.strokeStyle = '#000';
this.fillStyle = '#000';
this.lineWidth = 1;
this.lineJoin = 'miter';
this.lineCap = 'butt';
this.miterLimit = Z * 1;
this.globalAlpha = 1;
this.canvas = surfaceElement;
var el = surfaceElement.ownerDocument.createElement('div');
el.style.width =  surfaceElement.clientWidth + 'px';
el.style.height = surfaceElement.clientHeight + 'px';
el.style.overflow = 'hidden';
el.style.position = 'absolute';
surfaceElement.appendChild(el);
this.element_ = el;
this.arcScaleX_ = 1;
this.arcScaleY_ = 1;
this.lineScale_ = 1;
}
var contextPrototype = CanvasRenderingContext2D_.prototype;
contextPrototype.clearRect = function() {
this.element_.innerHTML = '';
};
contextPrototype.beginPath = function() {
this.currentPath_ = [];
};
contextPrototype.moveTo = function(aX, aY) {
var p = this.getCoords_(aX, aY);
this.currentPath_.push({type: 'moveTo', x: p.x, y: p.y});
this.currentX_ = p.x;
this.currentY_ = p.y;
};
contextPrototype.lineTo = function(aX, aY) {
var p = this.getCoords_(aX, aY);
this.currentPath_.push({type: 'lineTo', x: p.x, y: p.y});
this.currentX_ = p.x;
this.currentY_ = p.y;
};
contextPrototype.bezierCurveTo = function(aCP1x, aCP1y,
aCP2x, aCP2y,
aX, aY) {
var p = this.getCoords_(aX, aY);
var cp1 = this.getCoords_(aCP1x, aCP1y);
var cp2 = this.getCoords_(aCP2x, aCP2y);
bezierCurveTo(this, cp1, cp2, p);
};
function bezierCurveTo(self, cp1, cp2, p) {
self.currentPath_.push({
type: 'bezierCurveTo',
cp1x: cp1.x,
cp1y: cp1.y,
cp2x: cp2.x,
cp2y: cp2.y,
x: p.x,
y: p.y
});
self.currentX_ = p.x;
self.currentY_ = p.y;
}
contextPrototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
var cp = this.getCoords_(aCPx, aCPy);
var p = this.getCoords_(aX, aY);
var cp1 = {
x: this.currentX_ + 2.0 / 3.0 * (cp.x - this.currentX_),
y: this.currentY_ + 2.0 / 3.0 * (cp.y - this.currentY_)
};
var cp2 = {
x: cp1.x + (p.x - this.currentX_) / 3.0,
y: cp1.y + (p.y - this.currentY_) / 3.0
};
bezierCurveTo(this, cp1, cp2, p);
};
contextPrototype.arc = function(aX, aY, aRadius,
aStartAngle, aEndAngle, aClockwise) {
aRadius *= Z;
var arcType = aClockwise ? 'at' : 'wa';
var xStart = aX + mc(aStartAngle) * aRadius - Z2;
var yStart = aY + ms(aStartAngle) * aRadius - Z2;
var xEnd = aX + mc(aEndAngle) * aRadius - Z2;
var yEnd = aY + ms(aEndAngle) * aRadius - Z2;
if (xStart == xEnd && !aClockwise) {
xStart += 0.125;
}
var p = this.getCoords_(aX, aY);
var pStart = this.getCoords_(xStart, yStart);
var pEnd = this.getCoords_(xEnd, yEnd);
this.currentPath_.push({type: arcType,
x: p.x,
y: p.y,
radius: aRadius,
xStart: pStart.x,
yStart: pStart.y,
xEnd: pEnd.x,
yEnd: pEnd.y});
};
contextPrototype.rect = function(aX, aY, aWidth, aHeight) {
this.moveTo(aX, aY);
this.lineTo(aX + aWidth, aY);
this.lineTo(aX + aWidth, aY + aHeight);
this.lineTo(aX, aY + aHeight);
this.closePath();
};
contextPrototype.strokeRect = function(aX, aY, aWidth, aHeight) {
var oldPath = this.currentPath_;
this.beginPath();
this.moveTo(aX, aY);
this.lineTo(aX + aWidth, aY);
this.lineTo(aX + aWidth, aY + aHeight);
this.lineTo(aX, aY + aHeight);
this.closePath();
this.stroke();
this.currentPath_ = oldPath;
};
contextPrototype.fillRect = function(aX, aY, aWidth, aHeight) {
var oldPath = this.currentPath_;
this.beginPath();
this.moveTo(aX, aY);
this.lineTo(aX + aWidth, aY);
this.lineTo(aX + aWidth, aY + aHeight);
this.lineTo(aX, aY + aHeight);
this.closePath();
this.fill();
this.currentPath_ = oldPath;
};
contextPrototype.createLinearGradient = function(aX0, aY0, aX1, aY1) {
var gradient = new CanvasGradient_('gradient');
gradient.x0_ = aX0;
gradient.y0_ = aY0;
gradient.x1_ = aX1;
gradient.y1_ = aY1;
return gradient;
};
contextPrototype.createRadialGradient = function(aX0, aY0, aR0,
aX1, aY1, aR1) {
var gradient = new CanvasGradient_('gradientradial');
gradient.x0_ = aX0;
gradient.y0_ = aY0;
gradient.r0_ = aR0;
gradient.x1_ = aX1;
gradient.y1_ = aY1;
gradient.r1_ = aR1;
return gradient;
};
contextPrototype.drawImage = function(image, var_args) {
var dx, dy, dw, dh, sx, sy, sw, sh;
var oldRuntimeWidth = image.runtimeStyle.width;
var oldRuntimeHeight = image.runtimeStyle.height;
image.runtimeStyle.width = 'auto';
image.runtimeStyle.height = 'auto';
var w = image.width;
var h = image.height;
image.runtimeStyle.width = oldRuntimeWidth;
image.runtimeStyle.height = oldRuntimeHeight;
if (arguments.length == 3) {
dx = arguments[1];
dy = arguments[2];
sx = sy = 0;
sw = dw = w;
sh = dh = h;
} else if (arguments.length == 5) {
dx = arguments[1];
dy = arguments[2];
dw = arguments[3];
dh = arguments[4];
sx = sy = 0;
sw = w;
sh = h;
} else if (arguments.length == 9) {
sx = arguments[1];
sy = arguments[2];
sw = arguments[3];
sh = arguments[4];
dx = arguments[5];
dy = arguments[6];
dw = arguments[7];
dh = arguments[8];
} else {
throw Error('Invalid number of arguments');
}
var d = this.getCoords_(dx, dy);
var w2 = sw / 2;
var h2 = sh / 2;
var vmlStr = [];
var W = 10;
var H = 10;
vmlStr.push(' <g_vml_:group',
' coordsize="', Z * W, ',', Z * H, '"',
' coordorigin="0,0"' ,
' style="width:', W, 'px;height:', H, 'px;position:absolute;');
if (this.m_[0][0] != 1 || this.m_[0][1]) {
var filter = [];
filter.push('M11=', this.m_[0][0], ',',
'M12=', this.m_[1][0], ',',
'M21=', this.m_[0][1], ',',
'M22=', this.m_[1][1], ',',
'Dx=', mr(d.x / Z), ',',
'Dy=', mr(d.y / Z), '');
var max = d;
var c2 = this.getCoords_(dx + dw, dy);
var c3 = this.getCoords_(dx, dy + dh);
var c4 = this.getCoords_(dx + dw, dy + dh);
max.x = m.max(max.x, c2.x, c3.x, c4.x);
max.y = m.max(max.y, c2.y, c3.y, c4.y);
vmlStr.push('padding:0 ', mr(max.x / Z), 'px ', mr(max.y / Z),
'px 0;filter:progid:DXImageTransform.Microsoft.Matrix(',
filter.join(''), ", sizingmethod='clip');")
} else {
vmlStr.push('top:', mr(d.y / Z), 'px;left:', mr(d.x / Z), 'px;');
}
vmlStr.push(' ">' ,
'<g_vml_:image src="', image.src, '"',
' style="width:', Z * dw, 'px;',
' height:', Z * dh, 'px;"',
' cropleft="', sx / w, '"',
' croptop="', sy / h, '"',
' cropright="', (w - sx - sw) / w, '"',
' cropbottom="', (h - sy - sh) / h, '"',
' />',
'</g_vml_:group>');
this.element_.insertAdjacentHTML('BeforeEnd',
vmlStr.join(''));
};
contextPrototype.stroke = function(aFill) {
var lineStr = [];
var lineOpen = false;
var a = processStyle(aFill ? this.fillStyle : this.strokeStyle);
var color = a.color;
var opacity = a.alpha * this.globalAlpha;
var W = 10;
var H = 10;
lineStr.push('<g_vml_:shape',
' filled="', !!aFill, '"',
' style="position:absolute;width:', W, 'px;height:', H, 'px;"',
' coordorigin="0 0" coordsize="', Z * W, ' ', Z * H, '"',
' stroked="', !aFill, '"',
' path="');
var newSeq = false;
var min = {x: null, y: null};
var max = {x: null, y: null};
for (var i = 0; i < this.currentPath_.length; i++) {
var p = this.currentPath_[i];
var c;
switch (p.type) {
case 'moveTo':
c = p;
lineStr.push(' m ', mr(p.x), ',', mr(p.y));
break;
case 'lineTo':
lineStr.push(' l ', mr(p.x), ',', mr(p.y));
break;
case 'close':
lineStr.push(' x ');
p = null;
break;
case 'bezierCurveTo':
lineStr.push(' c ',
mr(p.cp1x), ',', mr(p.cp1y), ',',
mr(p.cp2x), ',', mr(p.cp2y), ',',
mr(p.x), ',', mr(p.y));
break;
case 'at':
case 'wa':
lineStr.push(' ', p.type, ' ',
mr(p.x - this.arcScaleX_ * p.radius), ',',
mr(p.y - this.arcScaleY_ * p.radius), ' ',
mr(p.x + this.arcScaleX_ * p.radius), ',',
mr(p.y + this.arcScaleY_ * p.radius), ' ',
mr(p.xStart), ',', mr(p.yStart), ' ',
mr(p.xEnd), ',', mr(p.yEnd));
break;
}
if (p) {
if (min.x == null || p.x < min.x) {
min.x = p.x;
}
if (max.x == null || p.x > max.x) {
max.x = p.x;
}
if (min.y == null || p.y < min.y) {
min.y = p.y;
}
if (max.y == null || p.y > max.y) {
max.y = p.y;
}
}
}
lineStr.push(' ">');
if (!aFill) {
var lineWidth = this.lineScale_ * this.lineWidth;
if (lineWidth < 1) {
opacity *= lineWidth;
}
lineStr.push(
'<g_vml_:stroke',
' opacity="', opacity, '"',
' joinstyle="', this.lineJoin, '"',
' miterlimit="', this.miterLimit, '"',
' endcap="', processLineCap(this.lineCap), '"',
' weight="', lineWidth, 'px"',
' color="', color, '" />'
);
} else if (typeof this.fillStyle == 'object') {
var fillStyle = this.fillStyle;
var angle = 0;
var focus = {x: 0, y: 0};
var shift = 0;
var expansion = 1;
if (fillStyle.type_ == 'gradient') {
var x0 = fillStyle.x0_ / this.arcScaleX_;
var y0 = fillStyle.y0_ / this.arcScaleY_;
var x1 = fillStyle.x1_ / this.arcScaleX_;
var y1 = fillStyle.y1_ / this.arcScaleY_;
var p0 = this.getCoords_(x0, y0);
var p1 = this.getCoords_(x1, y1);
var dx = p1.x - p0.x;
var dy = p1.y - p0.y;
angle = Math.atan2(dx, dy) * 180 / Math.PI;
if (angle < 0) {
angle += 360;
}
if (angle < 1e-6) {
angle = 0;
}
} else {
var p0 = this.getCoords_(fillStyle.x0_, fillStyle.y0_);
var width  = max.x - min.x;
var height = max.y - min.y;
focus = {
x: (p0.x - min.x) / width,
y: (p0.y - min.y) / height
};
width  /= this.arcScaleX_ * Z;
height /= this.arcScaleY_ * Z;
var dimension = m.max(width, height);
shift = 2 * fillStyle.r0_ / dimension;
expansion = 2 * fillStyle.r1_ / dimension - shift;
}
var stops = fillStyle.colors_;
stops.sort(function(cs1, cs2) {
return cs1.offset - cs2.offset;
});
var length = stops.length;
var color1 = stops[0].color;
var color2 = stops[length - 1].color;
var opacity1 = stops[0].alpha * this.globalAlpha;
var opacity2 = stops[length - 1].alpha * this.globalAlpha;
var colors = [];
for (var i = 0; i < length; i++) {
var stop = stops[i];
colors.push(stop.offset * expansion + shift + ' ' + stop.color);
}
lineStr.push('<g_vml_:fill type="', fillStyle.type_, '"',
' method="none" focus="100%"',
' color="', color1, '"',
' color2="', color2, '"',
' colors="', colors.join(','), '"',
' opacity="', opacity2, '"',
' g_o_:opacity2="', opacity1, '"',
' angle="', angle, '"',
' focusposition="', focus.x, ',', focus.y, '" />');
} else {
lineStr.push('<g_vml_:fill color="', color, '" opacity="', opacity,
'" />');
}
lineStr.push('</g_vml_:shape>');
this.element_.insertAdjacentHTML('beforeEnd', lineStr.join(''));
};
contextPrototype.fill = function() {
this.stroke(true);
}
contextPrototype.closePath = function() {
this.currentPath_.push({type: 'close'});
};
contextPrototype.getCoords_ = function(aX, aY) {
var m = this.m_;
return {
x: Z * (aX * m[0][0] + aY * m[1][0] + m[2][0]) - Z2,
y: Z * (aX * m[0][1] + aY * m[1][1] + m[2][1]) - Z2
}
};
contextPrototype.save = function() {
var o = {};
copyState(this, o);
this.aStack_.push(o);
this.mStack_.push(this.m_);
this.m_ = matrixMultiply(createMatrixIdentity(), this.m_);
};
contextPrototype.restore = function() {
copyState(this.aStack_.pop(), this);
this.m_ = this.mStack_.pop();
};
function matrixIsFinite(m) {
for (var j = 0; j < 3; j++) {
for (var k = 0; k < 2; k++) {
if (!isFinite(m[j][k]) || isNaN(m[j][k])) {
return false;
}
}
}
return true;
}
function setM(ctx, m, updateLineScale) {
if (!matrixIsFinite(m)) {
return;
}
ctx.m_ = m;
if (updateLineScale) {
var det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
ctx.lineScale_ = sqrt(abs(det));
}
}
contextPrototype.translate = function(aX, aY) {
var m1 = [
[1,  0,  0],
[0,  1,  0],
[aX, aY, 1]
];
setM(this, matrixMultiply(m1, this.m_), false);
};
contextPrototype.rotate = function(aRot) {
var c = mc(aRot);
var s = ms(aRot);
var m1 = [
[c,  s, 0],
[-s, c, 0],
[0,  0, 1]
];
setM(this, matrixMultiply(m1, this.m_), false);
};
contextPrototype.scale = function(aX, aY) {
this.arcScaleX_ *= aX;
this.arcScaleY_ *= aY;
var m1 = [
[aX, 0,  0],
[0,  aY, 0],
[0,  0,  1]
];
setM(this, matrixMultiply(m1, this.m_), true);
};
contextPrototype.transform = function(m11, m12, m21, m22, dx, dy) {
var m1 = [
[m11, m12, 0],
[m21, m22, 0],
[dx,  dy,  1]
];
setM(this, matrixMultiply(m1, this.m_), true);
};
contextPrototype.setTransform = function(m11, m12, m21, m22, dx, dy) {
var m = [
[m11, m12, 0],
[m21, m22, 0],
[dx,  dy,  1]
];
setM(this, m, true);
};
contextPrototype.clip = function() {
};
contextPrototype.arcTo = function() {
};
contextPrototype.createPattern = function() {
return new CanvasPattern_;
};
function CanvasGradient_(aType) {
this.type_ = aType;
this.x0_ = 0;
this.y0_ = 0;
this.r0_ = 0;
this.x1_ = 0;
this.y1_ = 0;
this.r1_ = 0;
this.colors_ = [];
}
CanvasGradient_.prototype.addColorStop = function(aOffset, aColor) {
aColor = processStyle(aColor);
this.colors_.push({offset: aOffset,
color: aColor.color,
alpha: aColor.alpha});
};
function CanvasPattern_() {}
G_vmlCanvasManager = G_vmlCanvasManager_;
CanvasRenderingContext2D = CanvasRenderingContext2D_;
CanvasGradient = CanvasGradient_;
CanvasPattern = CanvasPattern_;
})();
}

/* SOURCE FILE: css_browser_selector.js (4578adf2) 1/26/2015 1:19:44 PM */

function css_browser_selector(u){var ua=u.toLowerCase(),is=function(t){return ua.indexOf(t)>-1},g='gecko',w='webkit',s='safari',o='opera',m='mobile',h=document.documentElement,b=[(!(/opera|webtv/i.test(ua))&&/msie\s(\d)/.test(ua))?('ie ie'+RegExp.$1):is('firefox/2')?g+' ff2':is('firefox/3.5')?g+' ff3 ff3_5':is('firefox/3.6')?g+' ff3 ff3_6':is('firefox/3')?g+' ff3':is('gecko/')?g:is('opera')?o+(/version\/(\d+)/.test(ua)?' '+o+RegExp.$1:(/opera(\s|\/)(\d+)/.test(ua)?' '+o+RegExp.$2:'')):is('konqueror')?'konqueror':is('blackberry')?m+' blackberry':is('android')?m+' android':is('chrome')?w+' chrome':is('iron')?w+' iron':is('applewebkit/')?w+' '+s+(/version\/(\d+)/.test(ua)?' '+s+RegExp.$1:''):is('mozilla/')?g:'',is('j2me')?m+' j2me':is('iphone')?m+' iphone':is('ipod')?m+' ipod':is('ipad')?m+' ipad':is('mac')?'mac':is('darwin')?'mac':is('webtv')?'webtv':is('win')?'win'+(is('windows nt 6.0')?' vista':''):is('freebsd')?'freebsd':(is('x11')||is('linux'))?'linux':'','js']; c = b.join(' '); h.className += ' '+c; return c;}; css_browser_selector(navigator.userAgent);

