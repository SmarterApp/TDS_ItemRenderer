// REQUIRES: util.js

Util.Xml = { };

// cross browser (firefox/ie) way of getting a nodes text (text, CData)
Util.Xml.getNodeText = function(node) {
    // For IE, then DOM...
    return (node) ? ((node.text) ? node.text : (node.textContent) ? node.textContent : null) : null;
};

Util.Xml.escapeHTMLEncode = function(str)
{
    if (str == null) return '';
    var div = document.createElement('div');
    var text = document.createTextNode(str);
    div.appendChild(text);
    return div.innerHTML;
};

Util.Xml.getAttribute = function(node, name) {
    return node.getAttribute(name);
};

Util.Xml.getAttributeBool = function(node, name)
{
    return Util.Converters.parseBoolean(node.getAttribute(name));
};

Util.Xml.getAttributeInt = function(node, name)
{
    return Util.Converters.parseInt(node.getAttribute(name));
};

Util.Xml.getCData = function(node, name)
{
    var nodeText = Util.Dom.queryTag(name, node);

    if (nodeText != null) {
        return Util.Xml.getNodeText(nodeText);
    }

    return null;
};

/**********************************************************************************************/

/**
* Max XML size for MSXML2.  Used to prevent potential DoS attacks.
* @type {number}
*/
Util.Xml.MAX_XML_SIZE_KB = 2 * 1024;  // In kB

/**
* Max XML size for MSXML2.  Used to prevent potential DoS attacks.
* @type {number}
*/
Util.Xml.MAX_ELEMENT_DEPTH = 256; // Same default as MSXML6.

/**
* Creates an XML document appropriate for the current JS runtime
* @param {string=} opt_rootTagName The root tag name.
* @param {string=} opt_namespaceUri Namespace URI of the document element.
* @return {Document} The new document.
*/
Util.Xml.createDocument = function(opt_rootTagName, opt_namespaceUri)
{
    if (opt_namespaceUri && !opt_rootTagName) {
        throw Error("Can't create document with namespace and no root tag");
    }

    if (document.implementation && document.implementation.createDocument) {
        return document.implementation.createDocument(opt_namespaceUri || '', opt_rootTagName || '', null);
    }
    else if (typeof ActiveXObject != 'undefined') {
        var doc = Util.Xml._createMsXmlDocument();
        if (doc) {
            if (opt_rootTagName) {
                doc.appendChild(doc.createNode(Util.Dom.NodeType.ELEMENT, opt_rootTagName, opt_namespaceUri || ''));
            }
            return doc;
        }
    }

    throw Error('Your browser does not support creating new documents');
};

Util.Xml.parseFromString = function(text, type)
{
    type = type || 'text/xml'; // e.x., application/xml, text/html, image/svg+xml
    var xmlDoc;
    
    if (window.DOMParser) {
        xmlDoc = (new window.DOMParser()).parseFromString(text, type);
    } else {
        xmlDoc = Util.Xml._createMsXmlDocument();
        xmlDoc.loadXML(text);
    }

    // check for errors
    var errorMsg = null;
    
    // check for IE errors
    if (xmlDoc.parseError && xmlDoc.parseError.errorCode != 0) {
        errorMsg = 'XML Parsing Error: ' + xmlDoc.parseError.reason
            + ' at line ' + xmlDoc.parseError.line
            + ' at position ' + xmlDoc.parseError.linepos;
    } else {
        
        // check if xml doc has element
        if (xmlDoc.documentElement) {
            
            // check for firefox errors
            if (xmlDoc.documentElement.nodeName == 'parsererror') {
                errorMsg = xmlDoc.documentElement.childNodes[0].nodeValue;
            }

            // check for chrome/safari errors
            var errors = xmlDoc.getElementsByTagName('parsererror');
            
            if (errors.length > 0) {
                errorMsg = errors[0].textContent;
            }

        } else {
            // there was nothing loaded into document
            errorMsg = 'XML Parsing Error';
        }
    }

    // throw exception if there was an error
    if (errorMsg) {
        throw new Error(errorMsg);
    }
    
    return xmlDoc;
};

/**
* Serializes an XML document or subtree to string.
* @param {Document|Element} xml The document or the root node of the subtree.
* @return {string} The serialized XML.
*/
Util.Xml.serializeToString = function(node)
{
    // Compatible with Firefox, Opera and WebKit.
    if (typeof XMLSerializer != 'undefined') {
        return new XMLSerializer().serializeToString(node);
    }

    // Compatible with Internet Explorer.
    if (node.xml) {
        return node.xml;
    }

    throw Error('Your browser does not support serializing XML documents');
};

/**
* Creates an instance of the MSXML2.DOMDocument.
* @return {Document} The new document.
* @private
*/
Util.Xml._createMsXmlDocument = function() {
    
    var doc = new ActiveXObject('Microsoft.XMLDOM');
    doc.async = false;

    // Prevent potential vulnerabilities exposed by MSXML2, see
    // http://b/1707300 and http://wiki/Main/ISETeamXMLAttacks for details.
    doc.resolveExternals = false;
    doc.validateOnParse = false;

    // Add a try catch block because accessing these properties will throw an
    // error on unsupported MSXML versions. This affects Windows machines
    // running IE6 or IE7 that are on XP SP2 or earlier without MSXML updates.
    // See http://msdn.microsoft.com/en-us/library/ms766391(VS.85).aspx for
    // specific details on which MSXML versions support these properties.
    try {
        doc.setProperty('ProhibitDTD', true);
        doc.setProperty('MaxXMLSize', Util.Dom.MAX_XML_SIZE_KB);
        doc.setProperty('MaxElementDepth', Util.Dom.MAX_ELEMENT_DEPTH);
    } catch (e) {
        // No-op.
    }

    return doc;
};

/*
Cross browser way of getting inner html of an xml node.
NOTE: If the browser supports innerHTML on a node it does not
work like I want. It would turn <div></div> into just <div/>. 
This causes rendering problems in browsers since <div> cannot be
self closing. 
*/
Util.Xml.innerHTML = function (node) {
    var str = Util.Xml.serializeToString(node);
    return $(str).html();
};