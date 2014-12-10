
// Utility function.  if 'shuffle' is false, returns an array of integers
// of 'size' of values 0 through (size-1).  IF shuffle
// is true values are randomized.
MatchItem.PermutationArray = function (size, shuffle) {
    var ar = [];
    for (var i = 0; i < size; ++i) {
        ar.push(i);
        if (shuffle && (i > 0)) {
            var ix = (Math.floor(Math.random() * (i + 1)));
            var p = ar[i];
            ar[i] = ar[ix];
            ar[ix] = p;
        }
    }
    return ar;
};

// main logic for the match grid (aka matrix) handling.
// Constructs the grid from rows/columns from parser.
// componentServer allows us to interact with the itemCompenent service for kb accessibilitiy
MatchItem.Matrix = function (parseResult, htmlGenerator, discriminator) {
    var rowHeaders = [];
    var columnHeaders = [];
    var cells = [];
    var onChangedFuncs = [];
    var addComponentArray = [];
    var keyEventHandlerArray = [];

    // var htmlGenerator = new MatchItem.TableHtmlGenerator();
    // var htmlGenerator = new MatchItem.ListHtmlGenerator();

    // Get values from the parser.
    var prompt = "";
    if (parseResult.prompt != null) {
        prompt = parseResult.prompt;
    }
    var maxAssociations = parseResult.maxAssociations;
    var shuffle = parseResult.shuffle;
    var title = parseResult.title;
    var cs = parseResult.columns;
    var rs = parseResult.rows;
    this.responseId = parseResult.responseId;

    var self = this;

    // Allows clients to add callbacks when changes 
    // are made.
    this.onChanged = function (func) {
        onChangedFuncs.push(func);
    };

    // Some accessors...
    this.getRow = function (index) {
        return rowHeaders[index];
    };
    this.getColumn = function (index) {
        return columnHeaders[index];
    };
    this.getRowCount = function () {
        return rowHeaders.length;
    };
    this.getColumnCount = function () {
        return columnHeaders.length;
    };

    this.getCell = function (r, c) {
        return cells[this.index(rowHeaders[r].identifier, columnHeaders[c].identifier)];
    };

    // Rows/cols have max matches allowed.  Before we allow a 
    // cell to be checked, see if we violate that fact.
    this.violatesMatchMax = function (cell) {
        var column = columnHeaders[cell.getColumn()];
        var row = rowHeaders[cell.getRow()];
        var rmax = row.matchMax;
        var cmax = column.matchMax;

        var orow, ocol;
        var changed = false;

        // If this check will violate any of the ary-ness constraints of the 
        // QTI item, reject it.
        if ((cmax) && self.checksInColumn(cell.getColumn()) > cmax) {
            cell.setChecked(false);
            // See special case below
            if (cmax == 1) {
                ocol = getOnlyCheckInColumn(cell.getColumn());
                if (rmax == 1)
                    orow = getOnlyCheckInRow(cell.getRow());
                cell.setChecked(true);
            }
        } else if ((rmax) && self.checksInRow(cell.getRow()) > rmax) {
            cell.setChecked(false);
            // See special case below
            if (rmax == 1) {
                orow = getOnlyCheckInRow(cell.getRow());
                if (cmax == 1)
                    ocol = getOnlyCheckInColumn(cell.getColumn());
                cell.setChecked(true);
            }
        } else if ((maxAssociations) && self.countAssociations() > maxAssociations) {
            cell.setChecked(false);
        } else {
            // Otherwise, cell was either checked or unchecked.  Notify clients
            for (var i = 0; i < onChangedFuncs.length; ++i) {
                onChangedFuncs[i](self);
            }
        }

        // In the special case of  matchMax==1, allow the student to 'move' the
        // line instead of just denying it.
        if (orow) {
            orow.setChecked(false);
        }
        if (ocol) {
            ocol.setChecked(false);
        }

    };

    this.isResponseValid = function() {
        var value = this.getResult();
        return (value && value.length > 0);
    };
    
    // Returns the response in XML format
    this.getResponseXML = function() {
        var value = this.getResult();

        var xmlDoc = Util.Xml.createDocument('itemResponse');
        var xmlEl = xmlDoc.documentElement;
        var responseXML = xmlDoc.createElement('response');
        responseXML.setAttribute('id', this.responseId);
        xmlEl.appendChild(responseXML);

        if (value && value.length > 0) {
            for (var i = 0; i < value.length; i++) {
                var valueXML = xmlDoc.createElement('value');
                valueXML.textContent = value[i];
                responseXML.appendChild(valueXML);
            }
        }

        var xmlStr = Util.Xml.serializeToString(xmlDoc);

        return xmlStr;
    };
    
    // Returns the result of the currently checked items.
    this.getResult = function () {
        var result = [];
        this.forEachCell(function (cell) {
            if (cell.isChecked()) {
                var str = rowHeaders[cell.getRow()].identifier +
                    ' ' +
                    columnHeaders[cell.getColumn()].identifier;
                result.push(str);
            }
        });
        return result;
    };
    
    // Parse XML and set values
    this.setResultXML = function (resultXML) {
        var xmlDoc = Util.Xml.parseFromString(resultXML);
        var docEl = xmlDoc.documentElement;
        var values = docEl.getElementsByTagName('value');

        var result = [];
        if (values && values.length >0 ) {
            for (var i = 0; i < values.length; i++) {
                result.push(values[i].textContent);
            }
        }
        this.setResult(result);
    };

    // Called from the setter.
    this.setResult = function (ar) {
        var i;

        // Cells should be unchecked, but uncheck them anyway
        // and set styling to idle cells
        this.forEachCell(function (cell) {
            var row = rowHeaders[cell.getRow()];
            var col = columnHeaders[cell.getColumn()];
            cell.setChecked(false);
            htmlGenerator.setItemChecked(row, false);
            htmlGenerator.setItemChecked(col, false);
        });
        if (ar == null)
            return;

        // Parse the result and check the correct boxes.
        this.forEachCell(function (cell) {
            for (i = 0; i < ar.length; ++i) {
                var ar2 = ar[i].split(' ');
                var row = rowHeaders[cell.getRow()];
                var col = columnHeaders[cell.getColumn()];
                var rowid = row.identifier;
                var colid = col.identifier;
                if ((ar2[0] == rowid) && (ar2[1] == colid)) {
                    cell.setChecked(true);
                    htmlGenerator.setItemChecked(row, true);
                    htmlGenerator.setItemChecked(col, true);
                }
            }
        });
    };

    // Some iterators.

    // Iterator for all the cells.
    this.forEachCell = function (func) {
        for (var i = 0; i < this.getRowCount(); ++i) {
            for (var j = 0; j < this.getColumnCount(); ++j) {
                var cell = this.getCell(i, j);
                func(cell);
            }
        }
    };

    this.forEachRow = function (func) {
        for (var i = 0; i < self.getRowCount(); ++i) {
            func(self.getRow(i));
        }
    };

    this.forEachColumn = function (func) {
        for (var j = 0; j < self.getColumnCount(); ++j) {
            func(self.getColumn(j));
        }
    };

    // For list mode only, we have a special way of selecting a pair.
    var handleHeaderClick = function (header) {
        var iterator, otherIterator;
        var selectedRow = null;
        var selectedCol = null;

        if (header.isSelected) {
            htmlGenerator.setSelected(false, header);
            header.isSelected = false;
            updateParentSelected(header);
            return;
        }

        if (header.scope == 'row') {
            otherIterator = self.forEachColumn;
            iterator = self.forEachRow;
            selectedRow = header;
        } else {
            otherIterator = self.forEachRow;
            iterator = self.forEachColumn;
            selectedCol = header;
        }

        // Only allow one row/column to be selected at a time.
        iterator(function (entity) {
            if ((entity.identifier != header.identifier) &&
                (entity.isSelected == true)) {
                entity.isSelected = false;
                htmlGenerator.setSelected(false, entity);
            }
        });

        otherIterator(function (entity) {
            if (entity.isSelected) {
                if (selectedRow == null) {
                    selectedRow = entity;
                } else {
                    selectedCol = entity;
                }
            }
        });

        if (selectedRow && selectedCol) {
            self.forEachCell(function (cell) {
                if ((cell.getRowItem().identifier == selectedRow.identifier) &&
                    (cell.getColumnItem().identifier == selectedCol.identifier)) {
                    selectedRow.isSelected = false;
                    htmlGenerator.setSelected(false, selectedRow);
                    selectedCol.isSelected = false;
                    htmlGenerator.setSelected(false, selectedCol);
                    if (cell.isChecked() == false) {
                        cell.setChecked(true);
                        self.violatesMatchMax(cell);
                    } else {
                        cell.setChecked(false);
                    }
                }
            });
        } else {
            header.isSelected = true;
            htmlGenerator.setSelected(true, header);
        }

        updateParentSelected(header);
    };

    var updateParentSelected = function (header) {
        // Finally, update styling for lines under selected headers
        self.forEachCell(function (cell) {
            if (cell.isChecked() == true) {
                if ((rowHeaders[cell.getRow()].isSelected == true) ||
                    (columnHeaders[cell.getColumn()].isSelected == true)) {
                    cell.setChecked(true, true);
                } else {
                    cell.setChecked(true, false);
                }
            }
        });

        self.forEachRow(function (row) {
            if (self.checksInRow(row.index) > 0) {
                htmlGenerator.setItemChecked(row, true);
            } else {
                htmlGenerator.setItemChecked(row, false);
            }
        });
        self.forEachColumn(function (column) {
            if (self.checksInColumn(column.index) > 0) {
                htmlGenerator.setItemChecked(column, true);
            } else {
                htmlGenerator.setItemChecked(column, false);
            }
        });

    };

    // Creates HTML things, and also state information about a row/column header
    var addHeader = function (xHeader, scopeString) {
        var choiceItem = {
            identifier: xHeader.identifier,
            matchMax: parseInt(xHeader.matchMax),
            value: xHeader.content,
            element: null,
            elementContainer: null,
            isSelected: false,
            scope: scopeString
        };

        htmlGenerator.createHeaderElement(choiceItem, scopeString);
        htmlGenerator.setHeaderCallback(choiceItem, handleHeaderClick);
        return choiceItem;
    };

    // Creates HTML things
    var addColumn = function (xHeader) {
        var acol = addHeader(xHeader, 'col');
        acol.index = columnHeaders.length;
        columnHeaders.push(acol);
    };

    // Creates HTML things
    var addRow = function (xHeader) {
        var arow = addHeader(xHeader, 'row');
        arow.index = rowHeaders.length;
        rowHeaders.push(arow);
        return arow;
    };

    // Construct array index for cell array.
    this.index = function (rowid, colid) {
        return parseResult.mid + '-' + rowid + '-' + colid;
    };

    // Add a new cell at row/col.
    var addCell = function (row, col) {
        var identifier = self.index(rowHeaders[row].identifier, columnHeaders[col].identifier);
        var tmpCell = new MatchItem.Cell('micell-' + identifier, row, col, self, htmlGenerator.cellFactory, discriminator);
        cells[identifier] = tmpCell;
        tmpCell.attachToRow(rowHeaders[row].elementContainer);
        tmpCell.onCheck(self.violatesMatchMax);
    };

    // Count checks in column
    this.checksInColumn = function (ix) {
        var rv = 0;
        this.forEachCell(function (cell) {
            if ((cell.getColumn() == ix) && cell.isChecked())
                ++rv;
        });
        return rv;
    };

    // This allows users to 'overwrite' a choice, if there is only a single choice
    // allowed (matchMax) and they are choosing a second thing.
    var getOnlyCheckInColumn = function (ix) {
        var rv = null;
        self.forEachCell(function (cell) {
            if ((cell.getColumn() == ix) && cell.isChecked() &&
                (columnHeaders[cell.getColumn()].matchMax == 1))
                rv = cell;
        });
        return rv;
    };

    // This allows users to 'overwrite' a choice, if there is only a single choice
    // allowed (matchMax) and they are choosing a second thing.
    var getOnlyCheckInRow = function (ix) {
        var rv = null;
        self.forEachCell(function (cell) {
            if ((cell.getRow() == ix) && cell.isChecked() &&
                (rowHeaders[cell.getRow()].matchMax == 1))
                rv = cell;
        });
        return rv;
    };

    // Count checks in row
    this.checksInRow = function (ix) {
        var rv = 0;
        this.forEachCell(function (cell) {
            if ((cell.getRow() == ix) && cell.isChecked())
                ++rv;
        });
        return rv;
    };

    // Count checks in matrix
    this.countAssociations = function () {
        var rv = 0;
        this.forEachCell(function (cell) {
            if (cell.isChecked())
                ++rv;
        });
        return rv;
    };

    // We attach the rows to the table at the end, after all of the 
    // rows/columns have been rendered.
    this.attachTable = function (table) {
        htmlGenerator.createTable(table, title);

        // After title row, add other rows to the table.
        for (var i = 0; i < rowHeaders.length; ++i) {
            htmlGenerator.attachRowToTable(rowHeaders[i]);
        }
    };

    // Only applies to list form
    this.eraseChecks = function () {
        this.forEachCell(function (cell) {
            cell.erase();
        });
    };

    // Only applies to list form
    this.reDrawChecks = function () {
        window.setTimeout(function () {
            self.forEachCell(function (cell) {
                cell.redraw();
            });
        }, 1);
    };

    var getParentElement = function (choiceItem) {
        return choiceItem.elementContainer ? choiceItem.elementContainer : choiceItem.element;

    };

    ///////
    // ctor logic.  Make the rows/cells of the table.
    //////
    htmlGenerator.createTableHeaderRows(prompt);

    // Randomize rows/columns
    var colperms = MatchItem.PermutationArray(cs.length, parseResult.shuffle);

    // Create column headers first.
    for (var colix = 0; colix < cs.length; ++colix) {
        addColumn(cs[colperms[colix]]);
        htmlGenerator.addColumnToHeaderRow(columnHeaders[colix]);
    }

    // Create row header and a ce3ll for each column i nthe row
    var rowperms = MatchItem.PermutationArray(rs.length, shuffle);
    for (var rowix = 0; rowix < rs.length; ++rowix) {
        addRow(rs[rowperms[rowix]]);
        for (colix = 0; colix < columnHeaders.length; ++colix) {
            addCell(rowix, colix);
        }
    }

    // Add Keyboard Navigabilty
    // Fat interface.  First for the list version
    
    // Method called by module to retrieve array of all widget components
    this.getComponentArray = function () {
        return addComponentArray;
    };
    
    // Method called by module upon a keyEvent, to handle event for provided component
    this.handleKeyEvent = function(spanId, evt) {
        if (spanId) {
            var handleEnterKey = keyEventHandlerArray[spanId];
            if ((handleEnterKey) && (typeof handleEnterKey == "function")) {
                handleEnterKey();
            }
        }
    };

    var headerNavIterator = function (iterator) {
        iterator(function (entity) {
            var span = htmlGenerator.getClickableHeader(entity);
            if ((span != null) && (span.id)) {
                addComponentArray.push(span);
                keyEventHandlerArray[span.id] = function () {
                    handleHeaderClick(entity);
                };
            }
        });
    };
    headerNavIterator(this.forEachRow);
    headerNavIterator(this.forEachColumn);

    // For table version allow navigation via cells.
    this.forEachCell(function (cell) {
        var checkbox = cell.getCheckbox();
        if ((checkbox) && (checkbox.id)) {
            addComponentArray.push(checkbox);
            keyEventHandlerArray[checkbox.id] = function() {
                cell.setChecked(!(cell.isChecked()));
                self.violatesMatchMax(cell);
            };

        }
    });
};

MatchItem.Matrix.prototype.isReadOnly = function () { return false; };
