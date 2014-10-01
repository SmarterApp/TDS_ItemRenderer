var ItemScoringEngine = {};

ItemScoringEngine.DEFAULT_EXPLANATION = 'Score explanation not available.';

ItemScoringEngine.Events = null;

// call this to setup the scoring engine once the blackbox is ready
ItemScoringEngine.init = function()
{
    this.Events = new Util.EventManager();
};

// parse the xml into a DOM document
ItemScoringEngine.loadXml = function(xml)
{
    // NOTE: we prefer ActiveXObject first because in IE 9 DOMParser does not have xpath
    if (typeof ActiveXObject != 'undefined')
    {
        var doc = Util.XML._createMsXmlDocument();
        doc.loadXML(xml);
        return doc;
    }
    if (typeof DOMParser != 'undefined')
    {
        return (new DOMParser()).parseFromString(xml, 'text/xml');
    }

    throw Error('Your browser does not support loading xml documents');
};

ItemScoringEngine.serializeXml = function(node)
{
    // NOTE: In IE 8/9 if you call serializeToString we get "No such interface supported"
    return node.xml || (new XMLSerializer()).serializeToString(node);
};

ItemScoringEngine.isScorable = function(itemFormat)
{
    return this._checkScorability(itemFormat) != 'NOTSCORED';
};

ItemScoringEngine._checkScorability = function(itemformat)
{
    switch (itemformat)
    {
        case "GI":
        case "NL":
        case "SIM":
        case "HT":
        case "WB":
        case "EQ":
        case "MS":
            return 'REMOTE';
        case "MC":
            return 'LOCAL';
    }
    return 'NOTSCORED';
};

ItemScoringEngine._localScore = function(itemFormat, response, rubric)
{
    if (itemFormat == 'MC')
    {
        var scorePoint = (response == rubric.data) ? 1 : 0; // MC scorer checks if response matches the rubric
        
        var score = new ItemScoringEngine.Score(scorePoint, ItemScoringEngine.ScoringStatus.SCORED, null, null, null, null);
        score._explanationHTML = 'Your response earned ' + scorePoint + ' point of a possible maximum of 1.';
        setTimeout(function() {
            ItemScoringEngine.Events.fire('onItemScoreResponse', new ItemScoringEngine.ItemScoreResponse(score));
        }, 0);
    }
};


// a helper function for sending a item score request to the scoring engine
// example: ItemScoringEngine.createItemScoreRequestXml('MC', '100', 'A', 'c:\\item.grx')
ItemScoringEngine.sendItemScoreRequest = function(itemFormat, itemID, studentResponse, rubric, contextToken)
{
    
    if (!this.isScorable(itemFormat)) return;
    
    // Item is locally scored
    if (this._checkScorability(itemFormat) == 'LOCAL')
    {
        this._localScore(itemFormat, studentResponse, rubric);
        return;
    }
        
    // Item is remotely scored on item scoring server.
    var responseInfo = new ItemScoringEngine.ResponseInfo(itemFormat, itemID, studentResponse, rubric, contextToken);
    var itemScoreRequest = new ItemScoringEngine.ItemScoreRequest(responseInfo);

    var xmlDoc = itemScoreRequest.createXml();
    var xmlString = ItemScoringEngine.serializeXml(xmlDoc);

    var callback = 
    {
        success: ItemScoringEngine.receiveItemScoreResponse,
        failure: ItemScoringEngine.receiveItemScoreFailure,
        scope: ItemScoringEngine
    };

    YAHOO.util.Connect.initHeader("Content-Type", "text/xml");
    YAHOO.util.Connect.asyncRequest('POST', window.ItemScoringServerUrl, callback, xmlString);

    BlackboxWin.showProgress();
};

ItemScoringEngine.receiveItemScoreResponse = function(xhrObj)
{
    BlackboxWin.hideProgress();

    var itemScoreResponse = new ItemScoringEngine.ItemScoreResponse();
    itemScoreResponse.readXml(xhrObj.responseXML);
    ItemScoringEngine.Events.fire('onItemScoreResponse', itemScoreResponse);
};

ItemScoringEngine.receiveItemScoreFailure = function(xhrObj)
{
    BlackboxWin.hideProgress();

    var errorMessage = ItemScoringEngine.DEFAULT_EXPLANATION; // +' [' + xhrObj.statusText + ']';
    showAlert('Score Failure', errorMessage);
};

/********************************************/

// Class that is used to carry info about the item and student response 
ItemScoringEngine.ResponseInfo = function(itemFormat, itemID, studentResponse, rubric, contextToken)
{
    this._itemFormat = itemFormat;
    this._itemID = itemID;
    this._studentResponse = studentResponse;
    this._rubric = rubric;
    this._contextToken = contextToken;
};

// Item format
ItemScoringEngine.ResponseInfo.prototype.getItemFormat = function() { return this._itemFormat; };

// Unique ID for the item (likely the ITS id)
ItemScoringEngine.ResponseInfo.prototype.getItemIdentifier = function() { return this._itemID; };

// Student response
ItemScoringEngine.ResponseInfo.prototype.getStudentResponse = function() { return this._studentResponse; };

// Rubric information for the scorer
ItemScoringEngine.ResponseInfo.prototype.getRubric = function() { return this._rubric; };

// Placeholder to associate add'l info related to this student response (such as testeeid, position etc)
ItemScoringEngine.ResponseInfo.prototype.getContextToken = function() { return this._contextToken; };

/********************************************/

ItemScoringEngine.ScoringStatus =
{
    NOTSCORED: 0, 
    SCORED: 1, 
    WAITINGFORMACHINESCORE: 2, 
    NOSCORINGENGINE: 3, 
    SCORINGERROR: 4
};

// Enum to represent the status of the scoring operation
ItemScoringEngine.Score = function(scorePoint /*int*/, status /*ScoringStatus*/, dimension /*string*/, rationale /*string*/, childScores /*Score[]*/, contextToken /*string*/)
{
    this._scorePoint = scorePoint;
    this._status = status;
    this._dimension = dimension;
    this._rationale = rationale;
    this._childScores = childScores;
    this._contextToken = contextToken;
    this._maxScore = -1;
    this._explanationHTML = "Score explanation not available.";

    if (this._rationale != null)
    {
        // try and figure out what kind of rationale this is
        if (this._rationale.indexOf('<CRScore>') != -1)
        {
            // NLP
            this._parseRationaleForNLP();
        }        
        else if (this._rationale.indexOf('<ScoreResponse>') == 0) 
	    {
            // GRID
            this._parseRationaleForGrid();
        }
        else {
            this._explanationHTML = this._generateScoreExplanationForSelectedResponse();
        }
    }
};

// parse the rationale for grid 
ItemScoringEngine.Score.prototype._parseRationaleForGrid = function()
{
    var html = this._rationale;

    // fixes bug in itemscoring that is returning a single bad </td>
    html = html.replace("<\/>", "<\/td>");

    // fixes image paths
    html = html.replace(/images\/RedX.gif/g, "shared/images/RedX.gif");
    html = html.replace(/images\/GreenCheck.gif/g, "shared/images/GreenCheck.gif");
    html = html.replace(/images\/NA.gif/g, "shared/images/NA.gif");

    // get explanation HTML
    var docRationale = ItemScoringEngine.loadXml(html);
    var nodeExplanation = Util.XML.selectSingleNode(docRationale, '/ScoreResponse/Explanation');
    this._explanationHTML = ItemScoringEngine.serializeXml(nodeExplanation);
};

// generate a score explanation for selected response items
ItemScoringEngine.Score.prototype._generateScoreExplanationForSelectedResponse = function () {
    return 'Your response earned ' + this._scorePoint + ' point of a possible maximum of 1. [' + this._rationale + ']';
};


// parse the rationale for NLP
ItemScoringEngine.Score.prototype._parseRationaleForNLP = function()
{
    var htmlBuilder = [];
    
    // helper function for adding to the html with C# style formatter
    var html = function()
    {
        var str = Util.String.format.apply(this, arguments);
        htmlBuilder.push(str);
    };

    var docRationale = ItemScoringEngine.loadXml(this._rationale);
    var nodeInfo = Util.XML.selectSingleNode(docRationale, 'CRScore/ScoreInfo');

    var score = Util.XML.getAttributeInt(nodeInfo, 'score');
    var maxScore = Util.XML.getAttributeInt(nodeInfo, 'maxScore');

    // table
    html('<table border="1"><tbody>');
    html('<tr><b>Your response earned <font color="blue">{0}</font> points of a possible {1}</b></tr>', score, maxScore);

    // columns
    html('<tr>');
    html('<td><b>Description</b></td>');
    html('<td><b>Your answer</b></td>');
    html('</tr>');

    // rows
    Util.XML.forEachNode(nodeInfo, 'Proposition', function(nodeProp)
    {
        html('<tr>');
        html('<td>{0}</td>', nodeProp.getAttribute('description'));

        var correct = Util.XML.getAttributeBool(nodeProp, 'asserted');

        if (correct) html('<td align="center" class="correct">');
        else html('<td align="center" class="incorrect">');
        
        if (correct) html('<img alt="Correct" src="shared/images/GreenCheck.gif" />');
        else html('<img alt="Incorrect" src="shared/images/RedX.gif" />');
        
        html('</td>');

        html('</tr>');
    });

    html('</tbody></table>');

    this._explanationHTML = htmlBuilder.join('');
};

// Score point for this dimension
ItemScoringEngine.Score.prototype.getScorePoint = function() { return this._scorePoint; };

// Status of this score
ItemScoringEngine.Score.prototype.getStatus = function() { return this._status; };

// Dimension that this score is for
ItemScoringEngine.Score.prototype.getScoringDimension = function() { return this._dimension; };

// Rationale for this score for this dimension
ItemScoringEngine.Score.prototype.getScoringRationale = function() { return this._rationale; };

// Any children (sub-dimensional) scores associated with this compound score
ItemScoringEngine.Score.prototype.getSubScores = function() { return this._childScores; };

// Placeholder to associate add'l info related to this student response (such as testeeid, position etc)
ItemScoringEngine.Score.prototype.getContextToken = function() { return this._contextToken; };

// HTML score explanation returned from the server 
ItemScoringEngine.Score.prototype.getExplanationHTML = function() { return this._explanationHTML; };

/********************************************/

// A class used for transporting a scoring request.
ItemScoringEngine.ItemScoreRequest = function(responseInfo /*ResponseInfo*/)
{
    this._responseInfo = responseInfo;
};

ItemScoringEngine.ItemScoreRequest.prototype.getResponseInfo = function() { return this._responseInfo; };

ItemScoringEngine.ItemScoreRequest.prototype.createXml = function()
{
    var responseInfo = this.getResponseInfo();

    // <ItemScoreRequest>
    var xmlDoc = ItemScoringEngine.loadXml('<ItemScoreRequest></ItemScoreRequest>');
    var itemScoreRequestNode = xmlDoc.documentElement;

    // <ResponseInfo>
    var responseInfoNode = xmlDoc.createElement('ResponseInfo');
    responseInfoNode.setAttribute('itemIdentifier', responseInfo.getItemIdentifier());
    responseInfoNode.setAttribute('itemFormat', responseInfo.getItemFormat());
    itemScoreRequestNode.appendChild(responseInfoNode);

    // <StudentResponse>
    var studentResponseNode = xmlDoc.createElement('StudentResponse');
    var studentResponseData = xmlDoc.createCDATASection(responseInfo.getStudentResponse());
    studentResponseNode.appendChild(studentResponseData);
    responseInfoNode.appendChild(studentResponseNode);

    // <Rubric>
    var rubric = responseInfo.getRubric();
    var rubricNode = xmlDoc.createElement('Rubric');

    if (rubric.type == 'Text')
    {
        rubricNode.setAttribute('type', 'Data');
        rubricNode.setAttribute('cancache', 'false');
        rubricNode.appendChild(xmlDoc.createCDATASection(rubric.data));
    }
    else
    {
        rubricNode.setAttribute('type', 'Uri');
        rubricNode.setAttribute('cancache', 'false');
        rubricNode.appendChild(xmlDoc.createTextNode(rubric.data));
    }
    
    responseInfoNode.appendChild(rubricNode);

    // <ContextToken>
    if (responseInfo.getContextToken() != null)
    {
        var contextTokenNode = xmlDoc.createElement('ContextToken');
        var contextTokenData = xmlDoc.createCDATASection(responseInfo.getContextToken());
        contextTokenNode.appendChild(contextTokenData);
        responseInfoNode.appendChild(contextTokenNode);
    }

    return xmlDoc;
};

/********************************************/

// A class used for transporting a scoring response.
ItemScoringEngine.ItemScoreResponse = function(score /*Score*/)
{
    this._score = score;
};

ItemScoringEngine.ItemScoreResponse.prototype.getScore = function() { return this._score; };
ItemScoringEngine.ItemScoreResponse.prototype.getContextToken = function() { return this._contextToken; };

ItemScoringEngine.ItemScoreResponse.prototype.readXml = function(xmlDoc)
{
    // <ScoreInfo>
    var itemScoreResponseNode = zXPath.selectSingleNode(xmlDoc, 'ItemScoreResponse');
    var scoreNode = zXPath.selectSingleNode(itemScoreResponseNode, 'Score');
    var scoreInfoNode = zXPath.selectSingleNode(scoreNode, 'ScoreInfo');

    var scorePoint = Util.XML.getAttributeInt(scoreInfoNode, 'scorePoint');
    var dimension = scoreInfoNode.getAttribute('scoreDimension');

    var status = ItemScoringEngine.ScoringStatus.SCORINGERROR;
    var statusName = scoreInfoNode.getAttribute('scoreStatus');

    switch (statusName.toUpperCase())
    {
        case "NOTSCORED": status = ItemScoringEngine.ScoringStatus.NOTSCORED; break;
        case "SCORED": status = ItemScoringEngine.ScoringStatus.SCORED; break;
        case "WAITINGFORMACHINESCORE": status = ItemScoringEngine.ScoringStatus.WAITINGFORMACHINESCORE; break;
        case "NOSCORINGENGINE": status = ItemScoringEngine.ScoringStatus.NOSCORINGENGINE; break;
        case "SCORINGERROR": status = ItemScoringEngine.ScoringStatus.SCORINGERROR; break;
    }

    // <ScoreRationale>
    var rationale = Util.XML.getCData(scoreNode, 'ScoreRationale');

    // <SubScoreList>
    var childScores = [];

    // <ContextToken>
    var contextToken = Util.XML.getCData(scoreNode, 'ContextToken');

    this._score = new ItemScoringEngine.Score(scorePoint, status, dimension, rationale, childScores, contextToken);
};

/********************************************/
// this is item preview usage of item scoring code:

ItemPreview.initItemScoringEngine = function()
{
    ItemScoringEngine.init();

    ItemScoringEngine.Events.subscribe('onItemScoreResponse', function(itemScoreResponse) 
    {
        var score = itemScoreResponse.getScore();
        showAlert('Score Result', score.getExplanationHTML());
    });
};

// score the current item
ItemPreview.score = function()
{
    // get current page
    var currentPage = ContentManager.getCurrentPage();
    if (currentPage == null) return;

    var activeEntity = currentPage.getActiveEntity();
    
    // check if passage
    if (activeEntity instanceof BlackboxWin.ContentPassage)
    {
        showAlert('Score Status', 'Cannot score a passage.');
        return;
    }
    
    // get response
    var response = activeEntity.getResponse();
    
    if (response == null)
    {
        showAlert('Score Status', 'No response handler for this item type.');
        return;
    }        

    if (ItemScoringEngine.isScorable(activeEntity.format))
    {
        if (activeEntity.rubric == null)
        {
          showAlert('Score Status', 'This item is not currently scored automatically.');
          return;
        }
        
        ItemScoringEngine.sendItemScoreRequest(activeEntity.format, activeEntity.itemKey, response.value, activeEntity.rubric, null);
    } 
    else
    {
        showAlert('Score Status', 'This item is not currently scored automatically.');
    }
};
