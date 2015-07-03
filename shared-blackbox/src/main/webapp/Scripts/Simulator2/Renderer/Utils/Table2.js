//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class Table
* @superclass none
* @param none
* @return Table instance
* Creates a new Table class.
*****************************************************************************
*/
Simulator.Utils.Table = function (incompleteRows, tableName, sim) {
    var source = 'Table';  // variable used in debug
    var columns = [];
    var typedElements = [];
    var columnNames = [];
    var contentsForInCompleteRows = false;
    var name = tableName;
    var maxRowNum = -1; // the maximum number of rows that can be output from the table, -1 means no limit

    var dbg = function () { return sim.getDebug(); };
    var simMgr = function () { return sim.getSimulationManager(); };

    var scoringTable = function () { return sim.getScoringTable(); };

    this.getName = function () {
        return name;
    };

    if (incompleteRows) contentsForInCompleteRows = true;

    this.setMaxRowNum = function (num) {
        if (num) maxRowNum = num;
    };

    this.addElement = function (name, type) {
        if (!(name in columns)) {
            //debug('Adding column in ' + type + ' of ' + name + '  for ' + name);
            columns[name] = [];
            columnNames.push(name);
            if (type) {
                if (!(type in typedElements)) {
                    var values = new Array();
                    typedElements[type] = values;
                }
                typedElements[type].push(name);
            }
        }
    };

    this.cloneInputsForOutputs = function () {
        var outputs = typedElements['output'];
        if (!outputs) {
            var values = new Array();
            typedElements['output'] = values;
            outputs = typedElements['output'];
        }
        for (var p in columns) {
            if (columns.hasOwnProperty(p)) {
                if (!outputs.hasOwnProperty(p)) {
                    typedElements['output'].push(p);
                }
            }
        }
    };

    this.clearTable = function (clearOutputs) {
        for (var p in columns) {
            if (columns.hasOwnProperty(p)) {
                var col = columns[p];
                for (var j = 0; j < col.length; j++) col[j] = '';
            }
        }
        if (clearOutputs) {
            var outputs = typedElements['output'];
            if (outputs) {
                for (var t in outputs) {
                    if (outputs.hasOwnProperty(t)) {
                        outputs[t] = '';
                    }
                }
            }
        }
    };

    this.clearEntry = function (colName, rowNum) {
        if (columns.hasOwnProperty(colName)) {
            var col = columns[colName];
            col[rowNum] = '';
        }
    };

    this.clearRow = function (rowNum, clearOutputs, deleteRow) {
        for (var p in columns) {
            if (columns.hasOwnProperty(p)) {
                var col = columns[p];
                col[rowNum] = '';
            }
        }
        if (clearOutputs) {
            var outputs = typedElements['output'];
            if (outputs) {
                for (var t in outputs) {
                    if (outputs.hasOwnProperty(t)) {
                        outputs[rowNum] = '';
                    }
                }
            }
        }

    };

    this.deleteEmptyRows = function () {
        var numRows = getNumRows();
        for (var row = 0; row < numRows; row++) {
            if (rowIsEmpty(row)) deleteRow(row);
        }
    };

    this.outputEntered = function () {
        var outputs = typedElements['output'];
        if (outputs) {
            for (var i = 0; i < outputs.length; i++) {
                if (!this.isColumnEmpty(outputs[i])) return true;
            }
            return false;
        }
        return false;
    };

    function deleteRow(num) {
        size = Object.size(columns);
        for (var col = 0; col < size; col++) {
            aColName = columnNames[col];
            columns[aColName].splice(num, 1);
        }
    }

    this.isColumnEmpty = function (elementName) {
        if (columns[elementName]) {
            for (var i = 0; i < columns[elementName].length; i++) {
                if (columns[elementName][i] != '') return false;
            }
            return true;
        }
        else return true;
    };

    this.deleteElement = function (elementName) {
        if (elementName in columns) delete columns[elementName];
        for (t in typedElements) {
            for (var j = 0; j < typedElements[t].length; j++) {
                if (typedElements[t][j] == elementName) typedElements[t].splice(j, 1);
            }
        }
    };

    this.setValue = function (colName, rowNum, value) {
        var theValue = null;
        if (value instanceof Array) {
            theValue = value.join(', ');
        }
        else theValue = value;
        if (rowNum == null || rowNum < 0) {
            //debug(name + ' rowNum = ' + rowNum + ''. Setting rowNum to ' + (simMgr().getTrialNum() - 1));
            rowNum = simMgr().getTrialNum() - 1;  // Trials start at 1, rows at 0
        }
        if (rowNum > -1) {
            if (!columns[colName]) columns[colName] = [];
            columns[colName][rowNum] = theValue;
            //debug('Setting ' + name + ' column ' + colName + ', row ' + rowNum + ' to ' + value);
        } else {
            dbg().logError(source, 'rowNum = ' + rowNum + ' in ' + name + '.setValue');
            //if(!dbg().debugIsOn()) debugger;
        }
    };

    this.getElementsOfType = function (type) {
        if (typedElements[type]) return typedElements[type];
        else return null;
    };

    function getNumRows() {
        var maxLen = 0;
        var len = 0;
        for (var p in columns) {
            len = columns[p].length;
            maxLen = Math.max(len, maxLen);
        }
        return maxLen;
    }

    this.getContents = function () {
        var buff = [];
        var colNames = [];
        var maxLen = 0;
        var len = 0;
        var i = 0;
        var aColName = null;
        buff.push('<responseTable>');
        buff.push('   <tr>');
        for (var p in columns) {
            buff.push('      <th id = "' + p + '">' + p + '</th>');
            len = columns[p].length;
            maxLen = Math.max(len, maxLen);
            colNames[i++] = p;
        }
        // limit the output rows to be the maximum rows allowed, if there is such a limit
        if ((maxRowNum > 0) && (maxLen > maxRowNum)) {
            maxLen = maxRowNum;
        }
        buff.push('   </tr>');
        var size = colNames.length;
        var value = null;
        for (var row = 0; row < maxLen; row++) {
            if (!contentsForInCompleteRows && !rowIsCompletlyFilledIn(row)) break;
            else {
                //if(rowIsEmpty(row)) continue;
                buff.push('   <tr>');
                for (var col = 0; col < size; col++) {
                    aColName = colNames[col];
                    value = columns[aColName][row];
                    if (value == undefined || value == null) value = '';
                    if (value && value.indexOf && value.indexOf('<') != -1)
                        value = '<![CDATA[' + value + ']]>';
                    buff.push('      <td>' + value + '</td>');
                    //debug('Writing contents row ' + row + ', column ' + col + ' of ' + name + ' to ' + value);
                }
                buff.push('   </tr>');
            }
        }
        buff.push('</responseTable>');
        return buff.join('\n');
    };

    function rowIsCompletlyFilledIn(rowNum) {
        var size = Object.size(columns);
        for (var col = 0; col < size; col++) {
            aColName = columnNames[col];
            if (columns[aColName][rowNum] == '') return false;
        }
        return true;
    }

    function rowIsEmpty(rowNum) {
        var size = Object.size(columns);
        for (var col = 0; col < size; col++) {
            aColName = columnNames[col];
            if (columns[aColName][rowNum] == undefined) continue;
            else if (columns[aColName][rowNum] != '') return false;
        }
        return true;
    }

    this.getNumNonEmptyRows = function () {
        var maxLen = 0;
        var numRows = 0;
        for (var p in columns) {
            numRows = 0;
            len = columns[p].length;
            for (var row = 0; row < len; row++) {
                if (columns[p][row] != '') numRows++;
            }
            maxLen = Math.max(numRows, maxLen);
        }
        return maxLen;
    };

    this.restoreResponseTable = function (node) {
        var child = null;
        var attr = null;
        var text = null;
        var colNum = -1;
        var rowNum = -2;  // We want to skip the numbering of the header row so we set rowNum to -2 (rosw start at 0
        this.clearTable();
        var children = node.childNodes;
        for (var q = 0; q < children.length; q++) {
            if (children[q].nodeName == 'tr') {
                rowNum++;
                colNum = -1;
                child = children[q];
                for (var m = 0; m < child.childNodes.length; m++) {
                    if (child.childNodes[m].nodeName == 'td') {   // we want to skip the header row
                        colNum++;
                        text = child.childNodes[m].textContent;
                        scoringTable().setValue(columnNames[colNum], rowNum, text);
                    } else if (child.childNodes[m].nodeName == 'th') {
                        attr = child.childNodes[m].attributes;
                        for (var j = 0; j < attr.length; j++) {
                            if (attr[j].nodeValue[0] != '#') {
                                columnNames.push(attr[j].nodeValue);
                                if (!attr[j].nodeValue in columns) dbg().logFatalError(source, 'response column name: ' + columnNames[j] + ' is not in ' + name + ' column names');
                            }
                        }
                    }
                }
            }
        }
    };


    this.inspectElementTypes = function (embedded, force) {
        var buff = [];
        var aType = null;
        buff.push('Inspecting typedElements:');
        for (var e in typedElements) {
            buff.push('  ' + e + ' type elements:');
            aType = typedElements[e];
            for (var j = 0; j < aType.length; j++) {
                buff.push('    ' + aType[j]);
            }
        }
        buff.push('End inspecting typeElements');
        if (embedded) return buff.join('\n');
        else (force === null) ? debug(buff.join('\n')) : debugf(buff.join('\n'));
    };

    this.inspect = function (embedded, force) {
        var str = this.getContents();
        var preface = name + 'Table output:\n';
        if (embedded) return str;
        else {
            if (!force) debug(preface + str);
            else debugf(preface + str);
        }
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
};

