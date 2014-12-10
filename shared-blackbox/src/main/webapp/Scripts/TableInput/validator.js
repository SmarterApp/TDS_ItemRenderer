/*
This file contains the validation logic for TableInput.
*/

(function (TI) {

    var Rules = {
        'alphaOnly': /^[a-zA-Z]+$/i, // a-z
        'numericOnly': /^(\+|-)?(\d+)?([.]?\d*)?$/, // e.x., "-4.3"
        'alphaNumericOnly': /[a-zA-Z0-9]/i, // e.x., a-z and 0-9
        'textOnly': null // any text
    };

    function showAlert(msg) {
        if (TDS.Dialog) {
            TDS.Dialog.showWarning(msg);
        } else {
            alert(msg);
        }
    }

    function validator($input, $cell, rule, evt) {

        // check if regex matches
        var textValid = true;
        var re = Rules[rule];
        if (re) {
            var text = $input.val().trim();
            if (text) {
                textValid = re.test(text);
            }
        }

        // check if the input is currently has invalid style
        var styleInvalid = $cell.hasClass(TI.CSS_INVALID);

        // check current state
        if (textValid && styleInvalid) {
            // remove error
            $cell.removeClass(TI.CSS_INVALID);
        } else if (!textValid && !styleInvalid) {
            // show error
            $cell.addClass(TI.CSS_INVALID);
            // if error came from dom event then show alert, ignore manual validation
            if (evt) {
                // using timer so we let event finish then show error
                setTimeout(function() {
                    showAlert('TI.InvalidInput.' + rule);
                }, 0);
            }
        }
    }

    TI.setValidator(validator);

})(TDS.TableInput);