//var EqAdapter = {
//    _translator: MathJax.Config.Translator,
//    _PLACEHOLDER: '&##&',
//    _FORMATTER: '\r\n',
//    _Empty: '',
//    convertToDesmosXml: function (xml) {
//        return this._parser(xml);
//    },
//    getTabXml: function (key) {
//        var tab = MathEditorWidget.Config.Tabs[key];
//        return '<tab title="' + tab.title + '">' + this._FORMATTER + this._rowsToXml(tab.rows) + this._FORMATTER + '</tab>';
//    },
//    getRowXml: function (key) {
//        var row = MathEditorWidget.Config.Rows[key];
//        return this._rowsToXml([row]);
//    },
//    getItemXml: function (key) {
//        if (this._translator.ignoreKey(key)) {
//            return this._Empty;
//        }

//        var item = this._getItem(key);
//        return this._toItemXml(item);
//    },
//    hasKey: function (key) {
//        return this._translator.hasKey(key);
//    },
//    _getItem: function (key) {
//        var item = this._translator.getItem(key);
//        if (item === key) //base item
//            item = { key: key, title: key, arialabel: key, text: key };
//        return item;
//    },
//    _parser: function (xml) {
//        //create xmldocument
//        var xmlDoc = null;
//        if (window.DOMParser) {
//            var parser = new DOMParser();
//            xmlDoc = parser.parseFromString(xml, "text/xml");
//        }
//        else // Internet Explorer
//        {
//            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
//            xmlDoc.async = false;
//            xmlDoc.loadXML(xml);
//        }
//        var node = xmlDoc.childNodes[0]; //root

//        var desmosXml = '';

//        //build answerboxes or editorRows
//        var labels = node.getElementsByTagName("editorLabels"),
//            mathml = node.getElementsByTagName("mathML");
//        for (var i = 0, lblen = labels.length; i < mathml.length; i++) {
//            desmosXml += '<editorRow>' + (i < lblen ? labels[i].textContent + '\\MathQuillMathField{}</editorRow>' : '\\MathQuillMathField{}</editorRow>');
//        }

//        //console.log('$$ num of editors: ' + mathml.length);
//        //console.log('$$ num of labels: ' + labels.length);

//        //get tabcontent from the content.js
//        var tabContent = MathJax.Editor.Config.Tabs;

//        //build keypad or tabConfig
//        var keypad = '';
//        var tabConfigEl = node.getElementsByTagName("tabConfig"); //collect tabConfigs    
//        if (tabConfigEl.length > 0) {
//            var tabStr = '';
//            var orders = tabConfigEl[0].getElementsByTagName("Order"); //collect orders
//            //console.log('$$ num of tabs: ' + orders.length);

//            //process orders
//            for (i = 0, len = orders.length; i < len; i++) {
//                var tName = orders[i].innerHTML;
//                tabStr = '<tab title="' + tName + '" >' + this._FORMATTER + this._PLACEHOLDER + '</tab>';
//                var rows = [];
//                //console.log('$$ process tab: ' + tName);
//                var tab = tabConfigEl[0].getElementsByTagName(tName);
//                if (tab.length > 0) {
//                    //build custom rows
//                    var rowEls = tab[0].getElementsByTagName('rows');
//                    for (var j = 0, elLen = rowEls.length; j < elLen; j++) {
//                        var r = { title: '', type: '', items: [] };
//                        for (var k = 0, plen = rowEls[j].children.length; k < plen; k++) {
//                            if (rowEls[j].children[k].tagName === 'title') {
//                                r.title = rowEls[j].children[k].textContent;
//                            } else if (rowEls[j].children[k].tagName === 'type') {
//                                r.type = rowEls[j].children[k].textContent;
//                            } else if (rowEls[j].children[k].tagName === 'items') {
//                                if (rowEls[j].children[k].children.length > 0) {
//                                    //handle parsed items                                
//                                    r.items.push(rowEls[j].children[k].children[0].textContent); //0 is key, 1 is text, 2 is value, 3 is isParsed
//                                } else {
//                                    r.items.push(rowEls[j].children[k].textContent);
//                                }
//                            }
//                        }
//                        rows.push(r);
//                    }
//                } else {
//                    //build rows from content config
//                    rows = tabContent[tName].rows;
//                }

//                tabStr = tabStr.replace(this._PLACEHOLDER, this._rowsToXml(rows));
//                keypad += tabStr + this._FORMATTER;
//            }
//        }

//        desmosXml = '<editorconfig>' + desmosXml + '<tabConfig>' + this._FORMATTER + keypad + '</tabConfig>' + '</editorconfig>';
//        //return converted desmos xml
//        return desmosXml;

//    },
//    _rowsToXml: function (rows) {
//        var keypad = '';
//        for (var j = 0, rlen = rows.length; j < rlen; j++) {
//            var r = rows[j];

//            //check type attr (text)
//            if (r.type === "grid" || r.type === "numpad") {
//                //grid
//                keypad += '<grid cols="3" title="' + r.title + '">' + this._PLACEHOLDER + '</grid>' + this._FORMATTER;
//            } else {
//                //row
//                keypad += '<row title="' + r.title + '">' + this._PLACEHOLDER + '</row>' + this._FORMATTER;
//            }

//            //process items attr (array)                    
//            var items = r.items;
//            var itemStr = '';
//            for (var k = 0, ilen = items.length; k < ilen; k++) {
//                if (typeof items[k] === "object") {
//                    if (typeof items[k].isParsed != "undefined" && items[k].isParsed) //custom buttom
//                    {
//                        itemStr += this._toItemXml({ key: items[k].key, title: items[k].key, arialabel: items[k].key, text: items[k].text });
//                    } else
//                        itemStr += this.getItemXml(items[k].key);
//                }
//                else
//                    itemStr += this.getItemXml(items[k]);
//            }
//            keypad = keypad.replace(this._PLACEHOLDER, this._FORMATTER + itemStr);
//        } //close rows
//        return keypad;
//    },
//    _toItemXml: function (item) { //builder
//        var xmlVal = '<item title="' + item.title + '" aria-label="' + item.arialabel + '" ';
//        if (typeof item.cmd != "undefined")
//            xmlVal += 'cmd="' + item.cmd + '" ';

//        if (typeof item.css != "undefined")
//            xmlVal += 'class="' + item.css + '" ';

//        if (typeof item.insertraw != "undefined")
//            xmlVal += 'insert-raw="' + item.insertraw + '" ';

//        if (typeof item.text != "undefined")
//            xmlVal += '>' + item.text + '';
//        else
//            xmlVal += '>';

//        xmlVal += '</item>' + this._FORMATTER;
//        return xmlVal;

//    },
//};

