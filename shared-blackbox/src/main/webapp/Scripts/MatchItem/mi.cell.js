MatchItem = (typeof (MatchItem) == "undefined") ? {} : MatchItem;

// Logic for a cell in a match grid item.
// Parameters: 
// id - the unique identifier within the matrix
//       for this row/column
//  rowIndex,colIndex - row/column from the  
//                    perspective of the parent matrix
MatchItem.Cell = function (id, rowIndex, colIndex, matrix, cellFactory) {
    var row = rowIndex;
    var column = colIndex;
    this.getRow = function () { return row; };
    this.getColumn = function () { return column; };

    this.getRowItem = function () { return matrix.getRow(row); };
    this.getColumnItem = function () { return matrix.getColumn(column); };

    // Accessor for the checkbox object, used in keyboard navigation.  NULL
    // if this is the list form.
    this.getCheckbox = function() { return presentation.getCheckbox(); };

    var labelText = matrix.getRow(row).value + ' and ' + matrix.getColumn(column).value;
    var presentation = cellFactory(id, labelText, this);

    // Allow client matrix to define a callback.
    var onCheckFuncs = [];

    this.onCheck = function (func) {
        onCheckFuncs.push(func);
    };

    // Allow the parent matrix to attach this cell to a specific row.
    this.attachToRow = function (rowElement) {
        presentation.attachToRow(rowElement);
    };

    // True if the checkbox is checked.
    this.isChecked = function () {
        return presentation.isChecked();
    };

    // Make the cell look like it has been checked/unchecked.
    this.setChecked = function (val, parentSelected) {
        presentation.setChecked(val, parentSelected);
        checked = val;
    };

    this.redraw = function () {
        if (checked) {
            self.setChecked(false);
            self.setChecked(true);
        }
    };

    this.erase = function () {
        if (checked) {
            presentation.setChecked(false);
        }
    };

    // bookeeping vars...
    var checked = false;
    var self = this;

    // Handle click logic like so:  If a box is checked, we 
    // uncheck it.  If it is unchecked, we validate if first.
    // THen we call callback function to process any changes.
    presentation.addClickListener(function (ev) {
        if (matrix.isReadOnly()) {
            return false;
        } else {
            if (checked == true) {
                self.setChecked(false);
            }
            for (var i = 0; i < onCheckFuncs.length; ++i) {
                onCheckFuncs[i](self);
            }
        }

        return true;
    });

    return this;
};
