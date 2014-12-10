// ******************** Linear Algebra (Matrices) Calculator ********************
/* Currently we support matrix operations including plus, minus, multiplication and inverse. 
 * There are existing Javascript packages that we can directly use them to perform matrix calculation. 
 * But due to the fact that we support matrix expression, which means we need to parse the expression 
 * and this is the main work of this calculator. 
*/
function LinearalgebraCalc(config, parent)
{
    this.parent = parent;
    this.config = config;
    this.curMatrix = 'M1';
    this.maxDimSize = 7;
    this.matrixIds = ['M1', 'M2', 'M3', 'M4', 'M5', 'Result'];
    this.textinputarea = document.getElementById('textinput');
    //this.textoutputarea = document.getElementById('laoutputarea');
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
//LAButtonMap.push({id:'Result', func: chooseMatrix});

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

//Clear remaining focus visual indication (blue border)
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

    // Fix for https://bugz.airws.org/default.asp?65828
    var currentPosition = CaretPositionUtils.getCaretPosition(expressionArea) + s.length;
    CaretPositionUtils.setCaretPosition(expressionArea, currentPosition);

    // fix https://bugz.airws.org/default.asp?65824
    // calc.getExpressionArea().focus();
    FocusUtils.setCalcFocus(expressionArea, e);
}

//clear input field
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

//function that select a matrix
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

//function adds 'active' class to selected matrix
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

//return the id of active matrix
LinearalgebraCalc.prototype.getActiveMatrix = function()
{
    for (var i=0; i<this.matrixIds.length; i++)
    {
        if (document.getElementById('matrix-' + this.matrixIds[i]).style.display == 'block')
            return this.matrixIds[i];
    }
    return null;
}

//show matrix computation result
function showResult(e)
{
    for (var i=0; i<getWorkingCalcInstance().matrixIds.length; i++)
        document.getElementById('matrix-' + getWorkingCalcInstance().matrixIds[i]).setAttribute('style', 'display:none');
    document.getElementById('matrix-Result').setAttribute('style', 'display:block');
    setActiveMatrix('Result');
}

//set matrix dimension to a new value
function chooseDimSize(e)
{
    var calc = getWorkingCalcInstance();

    var metaData;
    if (typeof(e) == 'object')
    {
        //id example: M1-numberRows-2
        metaData = e.target.value.split('-');
     } else {
        metaData = e.split('-'); //e is M1-numberRows
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
    //input id: M1-4-1
    
    for (var j=0; j<calc.maxDimSize; j++)
    {
        for (var k=0; k<calc.maxDimSize; k++)
        {
            //alert (metaData[0]+'-'+(j+1) + '-' + (k+1));
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
        //inv button only goes to main text input area
        this.getExpressionArea().focus();
        if (BrowserUtils.isIE()) this.activeInputArea = 'textinput';    // .focus() doesn't work in IE, setting up the activeInputArea to force focus on main input area
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

    // fix https://bugz.airws.org/default.asp?65824
    /* the following fix was redone to account for touch tablets.
    // Fix for https://bugz.airws.org/default.asp?22198
    //this.getInputArea().focus();
    */
    FocusUtils.setCalcFocus(this.getInputArea(), e);
    
}

//display result matrix
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
        //a scalar value: display in expression window.
        /* 
        * for https: //bugz.airws.org/default.asp?56976:
        * one problem we have now is that if the scalar value is negative 
        * and we add more operations on scalars to the expression field then 
        * it results in an "Invalid expression". the reason behind this is that 
        * the negative size is the subtraction sign and not the unary minus sign.
        * we now already handle unary minus at line 536 by adding it to definedTokens attribute.
        * so what we will do is if the scalar is negative then we will display it with the unary minus.
        */
        var resultDisplayString = '' + resultSet;
        if (resultSet < 0) {
	    //redo the display string.
            //we multiply first with -1 so as to loose the negative sign and then append 
            //the unary minus symbol. 
            resultDisplayString = '\u2010' +  (-1 * resultSet);
        }

        this.getExpressionArea().value = resultDisplayString;
    }
}

//Create matrix text input fields. 
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
            //selectRow.setAttribute('onkeypress', 'matrixSelectKeyPress(event)');
            selectRow.setAttribute('id', this.matrixIds[i] + '-numberRows');
            numCellDiv.appendChild(selectRow);
            
            for (var j=0; j<this.maxDimSize; j++) 
            {
                var option = document.createElement('option');
                option.setAttribute('id', this.matrixIds[i] + '-numberRows-' + (j+1));
                option.setAttribute('value', (j+1));
                option.appendChild(document.createTextNode(j+1));
                //YAHOO.util.Event.removeListener(option, "click", chooseDimSize);
                //YAHOO.util.Event.addListener(option, "click", chooseDimSize);    
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
                //YAHOO.util.Event.removeListener(option, "click", chooseDimSize);
                //YAHOO.util.Event.addListener(option, "click", chooseDimSize); 
                selectCol.appendChild(option);
            }
 
        }
        
        //clearn button
        var clearBtn = document.createElement('a');
        clearBtn.setAttribute('href', '#');
        clearBtn.setAttribute('class', 'matrixClear');
        clearBtn.setAttribute('id', this.matrixIds[i]+'-Clear');
        //YAHOO.util.Event.addListener(clearBtn, "click", clearMatrixInput);  
        clearBtn.appendChild(document.createTextNode('Clear'));
        numCellDiv.appendChild(clearBtn);        
        
        //result button
        var resultBtn = document.createElement('a');
        resultBtn.setAttribute('href', '#');
        resultBtn.setAttribute('class', 'matrixResult');
        resultBtn.setAttribute('id', this.matrixIds[i]+'-Result');
        resultBtn.setAttribute('style', 'display:block');
        //YAHOO.util.Event.addListener(resultBtn, "click", doMatrixCalculation);  
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
                //else input.setAttribute('style', 'visibility:hidden');
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
    // id: M1-clear
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

    //set dimension to 1,1
    document.getElementById(matrixId + '-numberRows').value = 1;
    document.getElementById(matrixId + '-numberCols').value = 1;

    //set focus
    if (!BrowserUtils.isTouchBrowser()) { //fix https://bugz.airws.org/default.asp?65848
        document.getElementById(matrixId + '-numberRows').focus();
    }

    this.parent.keyboardNav.curRegion = 'numberRows';
    this.parent.keyboardNav.RegionIndex = getRegionIndexByDivName('numberRows');
    this.parent.keyboardNav.curElement = matrixId + '-numberRows';
};

//enable textinput 
LinearalgebraCalc.prototype.setTextInput = function() {
    document.getElementById('textinput').setAttribute('style', 'display:block');
    if (!BrowserUtils.isTouchBrowser()) {
        document.getElementById('textinput').removeAttribute('readonly');
    }
    document.getElementById('textinput').setAttribute('onfocus', 'return CalcFocusGained(this, event)');
};

LinearalgebraCalc.prototype.focusGained = function(field, event) {
    
    // Track the last input area that had focus. We need this for using when mouse clicks are used for input
    this.setActiveInputArea(field.id);
    
    if (typeof getWorkingCalcInstance == 'function' && field.id == 'textinput') {
        /** HACK **/
        // Since the matrixArea is built in code, when you tab through the matrix area and back to the
        // main text input, the region index does not change. This hack forces the regionIndex to change
        // when focus is back in the text input
        this.parent.keyboardNav.curRegion = getRegionDivsByMode(CalcModeList['Matrices'])[0]; 
        this.parent.keyboardNav.RegionIndex = 0;
        this.parent.keyboardNav.curElement = 'textinput';
        /** HACK **/
    }
    if (typeof getWorkingCalcInstance == 'function' && field.id.indexOf("M") == 0) {
        // This is a cell in the matrix
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
    //buttons
    for (var i=0; i<LAButtonMap.length; i++) {
        var btnObj = document.getElementById(LAButtonMap[i].id);
        if (btnObj) {
            YAHOO.util.Event.removeListener(btnObj, "click", LAButtonMap[i].func);
            YAHOO.util.Event.addListener(btnObj, "click", LAButtonMap[i].func);    
        }        
    }

    // init text input focus
    this.parent.textInputFocusInit(this.textInputIds);
}

LinearalgebraCalc.prototype.setInitKeyboardElement = function() {
    //document.getElementById('textinput').focus();
    var initialInput = document.getElementById('textinput');
    setTimeout(function() {
        FocusUtils.setCalcFocus(initialInput);
    }, 0); // in FF2.0, the onFocus() is triggered as soon as focus() is called (in the same stack frame) which we dont want to happen.
    this.parent.keyboardNav.curRegion = getRegionDivsByMode(CalcModeList['Matrices'])[0]; // CalcKeyboardRegionDivs['Matrices'][0];
    this.parent.keyboardNav.RegionIndex = 0;
    this.parent.keyboardNav.curElement = 'textinput';
};

//Init tokens
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

    //support matrix multiplication with scalar
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

//construct matrix object with data
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
    //must be focused area, do it later
    for (var i=0; i<this.textInputIds.length; i++) {
        if (document.getElementById(this.textInputIds[i]).hasFocus()) 
        {
            return document.getElementById(this.textInputIds[i]);
        }
    }
    return document.getElementById(this.textInputIds[0]);
}

//return matrix expression input area 'textinput'
LinearalgebraCalc.prototype.getExpressionArea = function()
{
    return this.textinputarea;
}

LinearalgebraCalc.prototype.getOutputArea = function()
{
    //empty because result is shown in result matrix
}

//arithmetic calculation for data expression 
LinearalgebraCalc.prototype.doCalculation = function ()
{
    var expression = this.getInputArea().value;
    if (expression == '') return;
    //this.getInputArea().value = this.parent.evalExpression(expression);
    var rst = this.parent.evalExpression(expression) + '';
    if (rst.indexOf('error')!= -1) this.getInputArea().value = 'Error';
    else this.getInputArea().value = rst;    
}

//matrix calcuation
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
        /*if (e)
            errorMessage = errorMessage + ". Error: " + e;*/
        calc.getExpressionArea().value = errorMessage;
    }
   
}

//return processed(translated) expression
LinearalgebraCalc.prototype.processExpression = function(expression)
{
    var ex = this.parent.translate_input(expression);
    return ex;
}

/*
 * Parsing: due to operators and parentheses have different precedence, we implement parsing with 
 * two stacks, one stack stores operators and one for operands. 
    Take a token from input string
    If token is not operator, push to operand stack
    If token is operator and its precedence is higher than the previous in the stack, push to operator stack.
    If token is operator and its precedence is lower or equal to the previous one on the stack,  then pop the operator from operator stack and pop corresponding number of operands and perform corresponding calculation and put result back to operand stack
    Continue the process until all  
*/
LinearalgebraCalc.prototype.doParse = function(tokens)
{
    var opStack = [];
    var oprandStack = [];
    
    var rst;
    for (var i=0; i<tokens.length; i++) {
    
        if (tokens[i].op) {//operator
            if ((tokens[i].symbol == '(') || (opStack.length == 0)) {
                opStack.push(tokens[i]);
            } else 
            if (tokens[i].symbol == ')') {
                var stTop = opStack.pop();
                if (stTop.symbol != '(') {
                    var rst = evalOperation(stTop);
                    oprandStack.push(rst);
                    i--; //trick to check current op with previous ones in opStack
                }
            } else
            {
                var stTop = opStack.pop();
                //compare with previous operator's precedence
                if (tokens[i].precedence > stTop.precedence) {
                    opStack.push(stTop);
                    opStack.push(tokens[i]);
                } else {
                    var rst = evalOperation(stTop);
                    oprandStack.push(rst);
                    i--; //trick to check current op with previous ones in opStack
                }
            }
        
        } else {
            //operand, just push to operand stack
            oprandStack.push(tokens[i]);
        }
    }

    //evalute remaining expression on stacks
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
                //rst.symbol = eval(rand1.symbol + op.symbol + rand2.symbol) + '';
                rst.val = op.val(rand2.val, rand1.val);
                break;
        }

        //fix https://bugz.airws.org/default.asp?58589
        if (typeof rst.val.elements != 'undefined') {
            //we have a matrix value.
            for (var i = 0; i < rst.val.elements.length; i++) {
                for (var j = 0; j < rst.val.elements[i].length; j++) {
                    rst.val.elements[i][j] = PreciseUtils.setResultPrecision(rst.val.elements[i][j], 2);
                }
            }
        } else {
            //we have a scalar value.
            rst.val = PreciseUtils.setResultPrecision(rst.val, 2);
        }
        
        return rst;
    }
}

//tokenize matrix expression, return a list of tokens
/*
 * Takenization: In order to parse matrix expression, we need to first tokenize an expression . 
 * The tokens include M1, M2, M3, M4, M5: names of matrices
 * + - * and Inverse: operators
 *	( ):  parentheses 
 * scalars
*/

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
            //check if it is a number
            var digitPattern = /^[0-9]|\./;
            var i=0;
            for (i = 0; i< str.length; i++) {
                if (!digitPattern.test(str.charAt(i))) break;
            }
            if (i > 0) {
                //create number operand
                tokens.push({symbol: 'Number', val: parseFloat(str.substring(0,i)), op: false, numRand:0, precedence: 1}); 
                str = str.substring(i);
            } else return;
        }
    }
    return tokens;
}