TestShell.Xml = {};

(function(TestShell) {

    function createRequest(data) {
        
        // write root
        var xml = '<request ';
        xml += 'action="update" ';
        xml += 'eventID="' + data.id + '" ';
        xml += 'timestamp="' + data.timestamp + '" ';
        xml += 'lastPage="' + data.lastPage + '" ';
        xml += 'prefetch="' + data.prefetch + '" ';
        xml += '>';

        // write accs
        if (data.accommodations) {
            xml += serializeAccs(data.accommodations);
        }

        // write responses
        if (YAHOO.util.Lang.isArray(data.responses)) {
            xml += serializeResponses(data.responses);
        }

        xml += '</request>';
        return xml;
    };

    function serializeAccs(serializedStr) {
        var xml = '<accs>';
        xml += '<![CDATA[' + serializedStr + ']]>';
        xml += "</accs>";
        return xml;
    };

    // serialize a collection of responses into XML to send to the server
    function serializeResponses(items) {
        
        var xml = '<responses>';

        Util.Array.each(items, function(item) {
            xml += serializeResponse(item);
        });

        xml += "</responses>";

        return xml;
    };

    // serialize a collection of responses into XML to send to the server
    function serializeResponse(item) {
        
        var xml = '<response ';
        xml += 'id="' + item.id + '" ';
        xml += 'bankKey="' + item.bankKey + '" ';
        xml += 'itemKey="' + item.itemKey + '" ';
        xml += 'segmentID="' + item.page.segmentID + '" ';
        xml += 'pageKey="' + item.page.pageKey + '" ';
        xml += 'dateCreated="' + item.page.dateCreated + '" ';
        xml += 'page="' + item.page.pageNum + '" ';
        xml += 'position="' + item.position + '" ';
        xml += 'sequence="' + item.sequence + '" ';
        xml += 'selected="' + item.isSelected + '" ';
        xml += 'valid="' + item.isValid + '" ';
        xml += '>';

        var contentItem = item.getContentItem();

        // add file path
        xml += '<filePath>' + (contentItem.filePath || '') + '</filePath>';

        // add response value
        xml += '<value>';

        if (item.value != null) {
            if (typeof item.value == 'string') {
                // escape closing tag for CDATA
                var responseValue = item.value.replace(/]]>/g, ']]&gt;');
                xml += '<![CDATA[' + responseValue + ']]>';
            } else {
                // get serialized value and throw error
                var serialized = item.value;
                try {
                    serialized = JSON.stringify(serialized);
                } catch(ex) {
                    // serializing was only for debugging so ignore
                }
                throw new Error('Cannot generate response xml because of invalid value property type: ' + serialized);
            }
        }

        xml += '</value>';

        xml += '</response>';

        return xml;
    };
    
    TestShell.Xml.createRequest = createRequest;

})(TestShell);


/*************************************************************************************************/

(function(TestShell) {

    // add helper functions
    var getNode = Util.Dom.queryTag;
    var getNodes = Util.Dom.queryTags;
    var batchNodes = Util.Dom.queryTagsBatch;
    var selectNode = Util.Dom.querySelector;
    var selectNodes = Util.Dom.querySelectorAll;
    var getAttribInt = Util.Xml.getAttributeInt;
    var getAttribBool = Util.Xml.getAttributeBool;
    var getAttrib = Util.Xml.getAttribute;
    var getText = Util.Xml.getNodeText;
    var getCData = Util.Xml.getCData;

    function validResults(xmlDoc) {
        if (xmlDoc == null) return false;
        var nodeResults = getNode('results', xmlDoc);
        if (nodeResults == null) return false;
        return true;
    };

    function parseResults(xmlDoc) {
        
        if (xmlDoc == null) return null;
        var resultsNode = getNode('results', xmlDoc);
        if (resultsNode == null) return null;

        var results = {
            eventID: getAttribInt(resultsNode, 'eventID'),
            machineID: getAttrib(resultsNode, 'machineID'),
            timestamps: readTimestamps(resultsNode),
            notification: readNotification(resultsNode),
            summary: parseTestSummary(resultsNode),
            updates: readResponseUpdates(resultsNode),
            groups: readPages(resultsNode),
        };

        // parse content
        var contentsNode = getNode('contents', resultsNode);
        if (contentsNode) {
            results.contents = ContentManager.Xml.create(xmlDoc);
        }

        return results;
    };

    function readTimestamps(resultsNode) {
        
        var node = getNode('timestamps', resultsNode);
        if (node == null) return null;

        var timestamps = {
            clientSent: getAttribInt(node, 'sent'),
            serverReceived: getAttribInt(node, 'received'),
            serverCompleted: getAttribInt(node, 'completed'),
            clientReceived: new Date().getTime()
        };

        return timestamps;
    };

    function readNotification(resultsNode)
    {
        var node = getNode('notification', resultsNode);
        if (node == null) return null;

        var notification = {
            type: node.getAttribute('type'),
            message: node.getAttribute('message')
        };

        return notification;
    };

    function parseTestSummary(resultsNode)
    {
        var node = getNode('testsummary', resultsNode);
        if (node == null) return null;

        var testSummary = {
            testLengthMet: getAttribBool(node, 'lengthMet'),
            testFinished: getAttribBool(node, 'finished')
        };

        return testSummary;
    };

    // reads the status of the response updates
    function readResponseUpdates(resultsNode) {
        
        var responses = [];
        var updatesNode = getNode('updates', resultsNode);

        // get all the <responseupdate> nodes
        batchNodes('response', updatesNode, function(updateNode) {
            var responseStatus = parseResponseStatus(updateNode);
            responses.push(responseStatus);
        });

        return responses;
    };

    function parseResponseStatus(updateNode) {
        var responseStatus = new TestShell.Item.Status();
        responseStatus.position = getAttribInt(updateNode, 'position');
        responseStatus.sequence = getAttribInt(updateNode, 'sequence');
        responseStatus.status = getAttrib(updateNode, 'status');
        responseStatus.reason = getAttrib(updateNode, 'reason');
        return responseStatus;
    };

    function readPages(resultsNode) {

        var pagesNode = getNode('pages', resultsNode);
        var pages = [];

        // get all the <group> nodes
        batchNodes('page', pagesNode, function (node) {
            var page = null;
            var type = getAttrib(node, 'type');
            if (type == 'contentpage') {
                page = parsePageGroup(node);
            }
            if (page) {
                pages.push(page);
            }
        });

        return pages;
    };

    // function for parsing group nodes into group objects
    function parsePageGroup(pageNode) {
        
        // page
        var type = getAttrib(pageNode, 'type');
        var pageNum = getAttribInt(pageNode, 'number');

        // <segment>
        var segmentNode = getNode('segment', pageNode);
        var segmentPos = getAttribInt(segmentNode, 'position');
        var segmentID = getAttrib(segmentNode, 'id');

        // <group>
        var groupNode = getNode('group', pageNode);
        var groupID = getAttrib(groupNode, 'id');
        var pageKey = getAttrib(groupNode, 'key');
        var dateCreated = getAttrib(groupNode, 'created');
        var numRequired = getAttrib(groupNode, 'required');

        // create page group
        var page = new TestShell.PageGroup();
        page.id = groupID;
        page.pageNum = pageNum;
        page.pageKey = pageKey;
        page.dateCreated = dateCreated;
        page.numRequired = numRequired;
        page.segment = segmentPos;
        page.segmentID = segmentID;

        // get all the <response> nodes for a <group>
        var itemsNode = getNode('items', pageNode);
        batchNodes('item', itemsNode, function (node) {
            var item = parseItem(node, page);
            page.items.push(item);
        });

        return page;
    };

    // function for parsing response nodes into response objects
    function parseItem(itemNode, page) {

        var item = new TestShell.Item(page);
        item.id = getAttrib(itemNode, 'id');
        // response.format = getAttrib(responseNode, 'format');

        item.bankKey = getAttribInt(itemNode, 'bankKey');
        item.itemKey = getAttribInt(itemNode, 'itemKey');
        item.pageNum = getAttribInt(itemNode, 'page');
        item.position = getAttribInt(itemNode, 'position');
        item.sequence = getAttribInt(itemNode, 'sequence');
        item.mark = getAttribBool(itemNode, 'marked');
        item.isSelected = getAttribBool(itemNode, 'selected');
        item.isRequired = getAttribBool(itemNode, 'required');
        item.isValid = getAttribBool(itemNode, 'valid');
        item.prefetched = getAttribBool(itemNode, 'prefetched');

        return item;
    };
    
    TestShell.Xml.validResults = validResults;
    TestShell.Xml.parseResults = parseResults;

})(TestShell);
