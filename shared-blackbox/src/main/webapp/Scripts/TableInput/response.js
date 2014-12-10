/*
This file contains code for generating and setting a xml response.
*/

(function (TI) {

    TI.prototype.getResponseXml = function () {

        // create root
        var xmlDoc = Util.Xml.createDocument('responseSpec');
        var rootEl = xmlDoc.documentElement;

        // create table
        var tableNode = xmlDoc.createElement('responseTable');

        // create rows
        var tableEl = this.getElement();
        $('tr', tableEl).each(function (rowIdx, rowEl) {

            var rowNode = xmlDoc.createElement('tr');

            // create columns
            $('th, td', rowEl).each(function (colIdx, colEl) {

                var colName = colEl.nodeName.toLowerCase(); // <th> or <td>
                var colNode = xmlDoc.createElement(colName);

                // set the identifier
                var id = $(colEl).data('itsIdentifier');
                if (id) {
                    $(colNode).attr('id', id);
                }

                // set response text if there is an input
                var response = $('.' + TI.CSS_INPUT, colEl).first().val();
                if (response) {
                    $(colNode).text(response);
                }

                rowNode.appendChild(colNode);
            });

            tableNode.appendChild(rowNode);
        });

        rootEl.appendChild(tableNode);

        return xmlDoc;
    };

    TI.prototype.getResponse = function() {
        var xmlDoc = this.getResponseXml();
        var xmlStr = Util.Xml.serializeToString(xmlDoc);
        return xmlStr;
    };

    TI.prototype.setResponseXml = function (xmlDoc) {
        var tableEl = this.getElement();
        var $htmlRows = $('tr', tableEl);
        var $xmlRows = $('tr', xmlDoc);

        // iterate over rows
        for (var i = 0, ii = $htmlRows.length; i < ii; i++) {

            var $htmlCols =  $('th, td', $htmlRows[i]);
            var $xmlCols = $('th, td', $xmlRows[i]);

            // iterate over columns
            for (var j = 0, jj = $htmlCols.length; j < jj; j++) {
                var $htmlCol = $($htmlCols[j]);
                var $xmlCol = $($xmlCols[j]);
                var $input = $('.' + TI.CSS_INPUT, $htmlCol).first();
                if ($input) {
                    var response = $xmlCol.text();
                    $input.val(response || '');
                }
            }
        }
    };

    TI.prototype.setResponse = function (xmlStr) {
        var xmlDoc = Util.Xml.parseFromString(xmlStr);
        this.setResponseXml(xmlDoc);
    };

    // check if response is correct
    TI.prototype.isResponseValid = function () {

        /*
        I spoke with Jeremy/Balaji and for right now
        all the inputs need to be different before
        being considered a valid response.
        */

        var $inputs = this.getInputs();

        // if there are no inputs found then nobody tagged the content
        if ($inputs.length == 0) return false;

        var valid = true;

        // check if the current response is different than the original response
        $inputs.each(function (idx, inputEl) {
            var originalResponse = $(inputEl).data('originalResponse');
            var currentResponse = $(inputEl).val().trim();
            if (originalResponse === currentResponse) {
                valid = false;
                return false; // stop loop
            }
        });

        return valid;
    };

})(TDS.TableInput);