// set of xml helper method to simplify work with dom/xml
var xmlHelper = {

    // load xml document from str to dom -- return reference to the root
    loadXMLFromString: function (str) {
        if (window.DOMParser) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(str, "text/xml");
        } else // Internet Explorer
        {
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(str);
        }
        return xmlDoc;
    },

    // create an xml parser object
    createXMLParserObject: function () {
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            var xmlhttp = new XMLHttpRequest();
        }
        else {// code for IE6, IE5
            var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xmlhttp;
    },

    // load xml from url to string
    loadXML: function (source) {
        var xmlhttp = this.createXMLParserObject();
        xmlhttp.open("GET", source, false);
        xmlhttp.send();
        var response = xmlhttp.response !== undefined ? xmlhttp.response : xmlhttp.responseXML;
        return response;
    },

    // load xml from url and add it to dom
    xmlParse: function (source) {
        var str = this.loadXML(source);
        if (window.DOMParser) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(str, "text/xml");
        }
        else // Internet Explorer
        {
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(str);
        }
        return xmlDoc;
    },

    getElementByName: function (root, name) {
        return root.getElementsByTagName(name).item(0);
    }

};

// simple xml generator
// usage:
// x = new xmlGenerator();
// result = x.startDocument('document').startElement('addr', {'host': '127.0.0.1', 'port': 8000}).endElement('addr').endDocument();
var xmlGenerator = {

    doc : '',
    //var destination = dest;
    root : undefined,

    startDocument : function (r) {
        this.doc = '';
        this.root = r || 'document';
        this.startElement(root);
        return this;
    },

     startElement : function (e, attr) {
        this.addNewLine();
        this.doc = this.doc + '<' + e;
        for (var a in attr) {
            this.doc = this.doc + ' ' + a + '="' + attr[a] + '"' + ',';
        }
        this.doc = this.doc + ' >';
        this.doc = this.doc.replace(/, >/, '>');
        this.doc = this.doc.replace(/ >/, '>');
        return this;
    },

    endElement : function (e) {
        this.doc = this.doc + '</' + e + '>';
        return this;
    },

    endDocument : function () {
        this.addNewLine().endElement(this.root);
        return this.doc;
    },
    
    addNewLine : function () {
        this.doc = this.doc + '\n';
        return this;
    }
}