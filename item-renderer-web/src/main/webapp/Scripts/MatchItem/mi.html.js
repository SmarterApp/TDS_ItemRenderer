//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿MatchItem = (typeof (MatchItem) == "undefined") ? {} : MatchItem;
///////////////////////////
// This file is responsible for all things regarding presentation of match QTI items.
// There are 2 formats supported: table and line-drawing.  There is a distinct class for each.
////////////////////////////

// Generate HTML codee to render the line-drawing version of the item.
MatchItem.ListHtmlGenerator = function (discriminator) {
    var getDivId = function (str) { return (discriminator ? discriminator + str : str); };

    var self = this;
    this.cellFactory = MatchItem.ListCellHtml.Create;
    var lineUl = document.createElement('ul');
    this.tabbableSpans = [];
    var choiceItems = [];

    this.getClickableHeader = function(choiceItem) {
        return choiceItem.elementContainer;
    };

    // Creates a row/columns header for the table.  In list/line form, this is 
    // an list item in unordered lists (hence the class name)
    this.createHeaderElement = function (choiceItem, scope) {
        choiceItem.elementContainer = document.createElement('li');
        var divId = getDivId('li-' + choiceItem.identifier + '-' + scope);
        choiceItem.elementContainer.setAttribute('id', divId);
        choiceItem.element = document.createElement('div');

        YUD.setAttribute(choiceItem.element, 'tabindex', '0');
        YUD.addClass(choiceItem.element, 'innerContainer');
        choiceItem.element.innerHTML = choiceItem.value;
        choiceItem.elementContainer.appendChild(choiceItem.element);
        choiceItem.lineUl = lineUl;

        // Keyboard accessibilty:
        this.tabbableSpans.push(choiceItem.elementContainer);
        choiceItems[divId] = choiceItem;
    };

    // Create the row of column headers at the top of the table.  For the 
    // list form this creates the 2 unordered lists.
    this.createTableHeaderRows = function (prompt) {
        self.headerDiv = document.createElement('div');
        YUD.addClass(self.headerDiv, 'matchItemLines');
        YUD.setAttribute(self.headerDiv, 'id', getDivId('matchItemLinesId'));
        self.headerRow = document.createElement('ul');
        YUD.addClass(self.headerRow, 'matchColumn matchFirstColumn');
        self.headerColumn = document.createElement('ul');
        YUD.addClass(self.headerColumn, 'matchColumn matchSecondColumn');
        YUD.addClass(lineUl, 'matchConnections');
        self.headerDiv.appendChild(self.headerRow);
        self.headerDiv.appendChild(self.headerColumn);
        self.headerDiv.appendChild(lineUl);

        /* var lineContainer = YUD.get('contents');
        if (lineContainer) {
        lineContainer.appendChild(lineUl);
        } else {
        self.headerDiv.appendChild(lineUl);
        } */
    };

    // For this presentation, we add the column header as a line in a list item
    this.addColumnToHeaderRow = function (column) {
        self.headerColumn.appendChild(column.elementContainer);
    };

    // We don't actually create a table in line mode, just a div.  Then we 
    // attach the unordered lists to it.
    this.createTable = function (table, captionText) {
        var caption = document.createElement('div');

        // Make title span the top row
        Util.Dom.setTextContent(caption, captionText);
        table.appendChild(self.headerDiv);
    };

    // For list mode, rows and columns are similar (lists)
    this.attachRowToTable = function (row) {
        self.headerRow.appendChild(row.elementContainer);
    };

    // For list mode only, highlight the selected element so the user can
    // see what he is choosing.
    this.setSelected = function (val, choiceItem) {
        if (val) {
            YUD.addClass(choiceItem.elementContainer, 'matchSelected');
        } else {
            YUD.removeClass(choiceItem.elementContainer, 'matchSelected');
        }
    };

    // Allow the user to click on a row/column header for updates.
    this.setHeaderCallback = function (choiceItem, func) {
        YUE.addListener(choiceItem.element, 'click', function (evt) {
            func(choiceItem);
        });
    };

    this.setItemChecked = function (header, val) {
        if (val) {
            YUD.addClass(header.elementContainer, 'matchMade');
        } else {
            YUD.removeClass(header.elementContainer, 'matchMade');
        }
    };

};

// Generate the item in table form.
MatchItem.TableHtmlGenerator = function (discriminator) {

    var self = this;

    this.cellFactory = MatchItem.TableCellHtml.Create;

    // For table form, don't allow user to navigate the table
    // by clicking on the headers.
    this.getClickableHeader = function (choiceItem) {
        return null;
    };

    // Creates a row/columns header for the table
    this.createHeaderElement = function (choiceItem, scope) {
        choiceItem.element = document.createElement('th');
        choiceItem.element.setAttribute('scope', scope);
        choiceItem.element.innerHTML= choiceItem.value;
        if (scope == 'row') {
            choiceItem.elementContainer = document.createElement('tr');
            choiceItem.elementContainer.appendChild(choiceItem.element);
        }
    };

    // Create the row of headers at the top of the table
    this.createTableHeaderRows = function (prompt) {
        self.headerRow = document.createElement('tr');
        self.promptCell = document.createElement('td');
        self.promptCell.innerHTML = prompt;
        YUD.addClass(self.promptCell, 'matchItem_cellSpacer');
        self.headerRow.appendChild(self.promptCell);
    };

    this.addColumnToHeaderRow = function (column) {
        self.headerRow.appendChild(column.element);
    };

    // You can't select rows/columns in table form.
    this.setSelected = function (val, choiceItem) {
    };

    // No response for click event on headers in table form.
    this.setHeaderCallback = function (choiceItem) {

    };

    this.createTable = function (parentDiv, captionText) {
        var table = document.createElement('table');
        var thead = document.createElement('THEAD');
        self.tbody = document.createElement('TBODY');

        // WCAG 20.0.5 - only add caption if captionText is present
        if (captionText && captionText.length > 0) {
            var caption = document.createElement('caption');
            Util.Dom.setTextContent(caption, captionText);
            table.appendChild(caption);
        }

        // Make title span the top row
        thead.appendChild(self.headerRow);
        table.appendChild(thead);
        table.appendChild(self.tbody);
        parentDiv.appendChild(table);
    };

    this.setItemChecked = function(header,val) {
    };

    this.attachRowToTable = function (row) {
        self.tbody.appendChild(row.elementContainer);
    };
};

// Generates HTML for the table version of a cell
// (checkbox)
MatchItem.TableCellHtml = function (id, label, discriminator) {

    var cellElement; // the row element
    var checkboxElement; // the checkbox element
    var getDivId = function (str) { return (discriminator ? discriminator + str : str); };

    this.getCheckbox = function () { return checkboxElement; };

    // Construct HTML table stuff for the cell.
    cellElement = document.createElement('td');

    // Input (checkbox)
    checkboxElement = document.createElement('input');
    checkboxElement.type = 'checkbox';

    // Label (for some keyboard accommodations)
    var lelem = document.createElement('label');
    lelem.setAttribute('for', id);

    // Assign the the table cell contents with the data from ITS
    lelem.innerHTML = label;

    // The content from ITS may contain word list spans, but these should only go in headers so remove these
    //  for table cells (aka <td> elements)
    var spanNodes = lelem.getElementsByTagName('span');
    var spanNodesToRemove = [];
    var spanNode;
    for (var spanIndex = 0; spanIndex < spanNodes.length; ++spanIndex) {
        spanNode = spanNodes[spanIndex];
        if (spanNode.hasAttribute('data-tag-boundary')) {
            var spanAttrValue = spanNode.getAttribute('data-tag-boundary');
            if (spanAttrValue === 'start' || spanAttrValue === 'end') {
                spanNodesToRemove.push(spanNode);
            }
        }
    }
    for (var removeIndex = 0; removeIndex < spanNodesToRemove.length; ++removeIndex) {
        spanNode = spanNodesToRemove[removeIndex];
        spanNode.parentNode.removeChild(spanNode);
    }

    // ITS gives us label text with <p> in it which are html blocks, which
    // are not valid within labels (not to mention this is all within a TD)
    // and this causes css to have some fails.  So replace the <p>s with <span>s.
    var par = lelem.getElementsByTagName('p');
    
    while (par != null && par.length > 0) {
        var p = par[0];
        var span = document.createElement('span');
        span.innerHTML = p.innerHTML;
        p.parentNode.replaceChild(span,p);
        par = lelem.getElementsByTagName('p');
    }

    cellElement.appendChild(checkboxElement);
    cellElement.appendChild(lelem);
    YUD.setAttribute(checkboxElement, 'id', id);

    this.attachToRow = function (rowElement) {
        rowElement.appendChild(cellElement);
    };

    this.isChecked = function () {
        return checkboxElement.checked;
    };

    // Like it sounds...
    this.setChecked = function (val) {
        checkboxElement.checked = val;
        var td = checkboxElement.parentNode;
        if (val)
            YUD.addClass(td, 'matchItem_cellChecked');
        else
            YUD.removeClass(td, 'matchItem_cellChecked');
    };

    var listenerFuncs = [];

    // Inform parents when the item has changed.
    this.addClickListener = function (func) {
        listenerFuncs.push(func);
    };

    // Add the checkbox event handler
    YUE.addListener(checkboxElement, 'click', function (ev) {

        var cancelEvent = false;
        for (var i = 0; i < listenerFuncs.length; ++i) {
            if (!listenerFuncs[i](ev)) {
                cancelEvent = true;
            }
        }

        if (cancelEvent) {
            ev.preventDefault();
        } else {
            var td = checkboxElement.parentNode;
            if (checkboxElement.checked) {
                YUD.addClass(td, 'matchItem_cellChecked');
            } else {
                YUD.removeClass(td, 'matchItem_cellChecked');
            }
        }
    });
};

// Generates HTML for the list version of a cell
// (lines instead of checkboxes)
MatchItem.ListCellHtml = function (id, label, parentCell, discriminator) {
    var cellElement; // the row element
    var line;

    // Construct HTML table stuff for the cell.
    cellElement = document.createElement('li');

    this.attachToRow = function (rowElement) {
        // rowElement.appendChild(cellElement);
    };

    this.isChecked = function () {
        return line != null;
    };

    this.getCheckbox = function () { return null; };
    
    // Draw the line...
    this.setChecked = function (val, parentSelected) {
        if (val == false) {
            // Erase the line by just removing the div.
            if (line) {
                cellElement.parentNode.removeChild(cellElement);
                line.parentNode.removeChild(line);
                line = null;
            }
        } else {
            // Calculate coordinates and render

            if (line == null) {
                var row = parentCell.getRowItem().elementContainer;
                var column = parentCell.getColumnItem().elementContainer;

                // we call 'row' thing on the left whether it is or not
                if (row.offsetLeft > column.offsetLeft) {
                    var rrr = row;
                    row = column;
                    column = rrr;
                }
                var container = parentCell.getRowItem().lineUl;

                var r1 = YUD.getRegion(row);
                var r2 = YUD.getRegion(column);

                var x1 = row.offsetLeft;
                var y1 = row.offsetTop;
                var x2 = column.offsetLeft;
                var y2 = column.offsetTop;

                // Make the lines go from right middle of left box to left-middle of right box
                x1 += r1.width;
                y1 += r1.height / 2;
                y2 += r2.height / 2;

                line = createLine(x1, y1,
                    x2, y2);

                Util.Dom.setTextContent(line, label);
                container.appendChild(cellElement);
                cellElement.appendChild(line);
            }
            if (parentSelected)
                YUD.addClass(line, 'matchParentSelected');
            else
                YUD.removeClass(line, 'matchParentSelected');
        }
    };

    var listenerFuncs = [];

    // Fat interface - no clicking on lines is supported (yet).
    this.addClickListener = function (func) {
        listenerFuncs.push(func);
    };

};

// Factories for the types of cells.
MatchItem.TableCellHtml.Create = function(id, label,parentCell,discriminator) {
    return new MatchItem.TableCellHtml(id, label, parentCell, discriminator);
};

MatchItem.ListCellHtml.Create = function (id, label, parentCell, discriminator) {
    return new MatchItem.ListCellHtml(id, label, parentCell, discriminator);
};