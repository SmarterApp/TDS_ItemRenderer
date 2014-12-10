/*
Fixes for CKEditor table plugin.
*/

(function(CKEDITOR, HTMLEditor) {

    //Table fixes
    var MAX_ROWS = 100;
    var MAX_COLS = 10;
    var lang = HTMLEditor.getLanguage();
    var invalidRowsMsg = 'TDSCKE.Alert.InvalidRows.' + lang;
    var invalidColsMsg = 'TDSCKE.Alert.InvalidCols.' + lang;
    var invalidWidthMsg = 'TDSCKE.Alert.InvalidWidth.' + lang;
    var invalidHeightMsg = 'TDSCKE.Alert.InvalidHeight.' + lang;

    function validateNum(msg, max) {
        return function () {
            var value = this.getValue(),
				pass = !!(CKEDITOR.dialog.validate.integer()(value) && value > 0 && value <= max);

            if (!pass) {
                var invalidValue = this.getInputElement().$;
                TDS.Dialog.showAlert(msg, function () { invalidValue.select(); });
            }

            return pass;
        };
    }

    function validateSize(msg) {
        return function () {
            var value = this.getValue(); // Get the text value from the text box

            // Validate it... the following regular expression basically says give me a floating point number with at least one non-zero digit optionally
            //  followed by a unit (e.g. 'px') or leave the whole thing blank (i.e. the last ? makes the whole thing optional)
			var pass = /^((0*\.\d*[1-9]\d*|0*[1-9]\d*(\.\d+)?)(px|em|ex|in|cm|mm|pt|pc|\%)?)?$/i.test(value);
            
            if (!pass) {
                var invalidValue = this.getInputElement().$;
                TDS.Dialog.showAlert(msg, function () { invalidValue.select(); });
            }

            return pass;
        };
    }

    CKEDITOR.on('dialogDefinition', function (e) {
        var dialogName = e.data.name;
        var dialog = e.data.definition.dialog;
        var def = e.data.definition;

        if (dialogName && def) {
            if (dialogName == 'table' || dialogName == 'tableProperties') {
                var tableTab = def.getContents('info');
                if (tableTab) {
                    //bug 115713 Remove table properties that are currently not functional
                    //TODO add functionality to these properties in the future
                    //tableTab.remove('cmbAlign');
                    tableTab.remove('txtBorder');
                    tableTab.remove('txtCellSpace');
                    tableTab.remove('txtCellPad');
                    tableTab.remove('txtSummary');

                    //bug 116541 Overload txtRows/txtCols validate functions
                    var txtRows = tableTab.get('txtRows');
                    txtRows.validate = validateNum(invalidRowsMsg, MAX_ROWS);
                    var txtCols = tableTab.get('txtCols');
                    txtCols.validate = validateNum(invalidColsMsg, MAX_COLS);

                    //bug 119519 Overload txtWidth/txtHeight validate functions
                    var txtWidth = tableTab.get('txtWidth');
                    txtWidth.validate = validateSize(invalidWidthMsg);
                    var txtHeight = tableTab.get('txtHeight');
                    txtHeight.validate = validateSize(invalidHeightMsg);

                    //bug 115678 Overload setup/cmbAlign commit functions
                    var cmbAlign = tableTab.get('cmbAlign');
                    cmbAlign.setup = function (selectedTable) {
                        this.setValue($(selectedTable.$).css('text-align') || '');
                    };
                    cmbAlign.commit = function (data, selectedTable) {
                        if (this.getValue()) {
                            $(selectedTable.$).css('text-align', this.getValue());
                        } else {
                            $(selectedTable.$).css('text-align', '');
                        }
                    };
                }
            } else if (dialogName == 'cellProperties') {
                var cellTab = def.getContents('info');
                if (cellTab) {
                    //bug 116763 Remove cell properties that are currently not functional
                    //TODO add functionality to these properties in the future
                    cellTab.remove('rowSpan');
                    cellTab.remove('colSpan');
                    cellTab.remove('txtSummary');
                }
            }
        }
    });
    
})(CKEDITOR, HTMLEditor);

