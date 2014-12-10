/*
Test shell page that contains adaptive item groups.
*/

TestShell.PageGroup = function(id)
{
    TestShell.PageGroup.superclass.constructor.call(this, id);

    this.pageKey = null;
    this.dateCreated = null;
    this.pageNum = 0;
    this.items = [];
    this.numRequired = -1;
    
    this.segment = 0;
    this.segmentID = null;
};

YAHOO.lang.extend(TestShell.PageGroup, TestShell.PageContent);

// get the xhr url for loading the content
TestShell.PageGroup.prototype.getContentUrl = function()
{
    var urlBuilder = [];
    urlBuilder.push(TDS.baseUrl);
    urlBuilder.push('Pages/API/TestShell.axd/getPageContent');
    urlBuilder.push('?groupID=' + this.id);
    urlBuilder.push('&page=' + this.pageNum);
    urlBuilder.push('&pageKey=' + this.pageKey);
    urlBuilder.push('&datecreated=' + this.dateCreated);
    urlBuilder.push('&new=' + this.isNew());
    urlBuilder.push('&attempt=' + this.getRequestCount());
    return urlBuilder.join('');
};

// check if this group is new (prefetched)
TestShell.PageGroup.prototype.isNew = function()
{
    return Util.Array.some(this.items, function (item) {
        return item.prefetched;
    }, this);
};

TestShell.PageGroup.prototype.isEnabled = function()
{
    // check if the segment is locked
    var segment = this.getSegment();
    if (segment && segment.isLocked()) {
        return false;
    }

    return TestShell.PageGroup.superclass.isEnabled.call(this);
};

// Does this item group have all the required responses.
TestShell.PageGroup.prototype.isCompleted = function() // base
{
    var numValid = 0;

    for (var i = 0; i < this.items.length; i++) {

        var item = this.items[i];

        // check if the item is selected and has a valid response
        if (item.isSelected && item.isValid) {
            numValid++;
        }
        // if the item was required we can stop here, this group is not complete
        else if (item.isRequired) {
            return false;
        }
    }

    // check if completed
    var completed = (numValid >= this.numRequired);
    
    // if the page is completed but doesn't have any valid responses then check 
    // the accommodation to see if we need to visit the page at least once first
    if (completed && numValid === 0 && this.requiresVisit()) {
        return this.isVisited();
    }

    return completed;
};

// check if this page was visited
TestShell.PageGroup.prototype.isVisited = function() {
    
    // if this page has any questions answered then it must of been visited
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].isAnswered()) return true;
    }
    
    // if any previous page has questions answered then this must of been visited
    if (this.requiresVisit()) {
        var nextPages = this.getNextPages();
        for (var i = 0; i < nextPages.length; i++) {
            var page = nextPages[i];
            // check if answered
            if (page instanceof TestShell.PageGroup) {
                if (page.getNumAnswered() > 0) {
                    return true;
                }
            }
        }
    }
    
    // check base if explicitly visited
    return TestShell.PageGroup.superclass.isVisited.call(this);
};

TestShell.PageGroup.prototype.getLabelGroup = function() // base
{
    // check if showing segment labels is enabled
    if (!TestShell.Config.showSegmentLabels) return null;

    var segment = this.getSegment();
    if (segment == null) return null;

    // return segment as the group label
    var id = 'segment_' + segment.getSafeId();

    return { id: id, label: segment.getLabel() };
};

// override function naivgation dropdown label to show page info
TestShell.PageGroup.prototype.getLabel = function(showMarked) // base
{
    // check if the nav acc says to use tasks for labels
    var defaultAccProps = Accommodations.Manager.getDefaultProperties();
    
    if (defaultAccProps && defaultAccProps.getNavigationDropdown() == 'TDS_NavTk')
    {
        return this.getLabelTask(showMarked);
    }
    
    // get first pos
    var firstItem = this.items[0];

    // get last pos
    var lastItem = this.items[this.items.length - 1];

    // create label for select option
    var text = firstItem.position;

    // set last position if there is one
    if (firstItem != lastItem)
    {
        text += ' - ' + lastItem.position;
    }
    
    // if we are not hiding marked for review and this is marked then add text
    if (showMarked && this.hasMark())
    {
        text += ' (' + Messages.get('TDSShellObjectsJS.Label.Marked') + ')';
    }

    return text;
};

// return a task label.
TestShell.PageGroup.prototype.getLabelTask = function(showMarked)
{
    var text = Messages.getAlt('TDSShellObjectsJS.Label.TaskLabel', 'Task ') + this.pageNum;
    if (showMarked && this.hasMark())
    {
        text += ' (' + Messages.get('TDSShellObjectsJS.Label.Marked') + ')';
    }
    return text;
};

TestShell.PageGroup.prototype.toString = function() // base
{
    return (this.pageNum > 0) ? this.pageNum.toString() : '';
};

/**********************************************************************************/

// get the number of items answered for this group
TestShell.PageGroup.prototype.getNumAnswered = function()
{
    var numAnswered = 0;

    for (var i = 0; i < this.items.length; i++)
    {
        var item = this.items[i];

        // check if the item is selected and has a valid response
        if (item.isSelected && item.isValid)
        {
            numAnswered++;
        }
    }

    return numAnswered;
};

TestShell.PageGroup.prototype.getResponse = function(position)
{
    return Util.Array.find(this.items, function (item)
    {
        return item.position == position;
    });
};


// check if any of the responses have mark for review
TestShell.PageGroup.prototype.hasMark = function()
{
    var markedResponse = Util.Array.find(this.items, function (item)
    {
        return item.mark;
    });

    return (markedResponse != null);
};

// get the segment for this group
TestShell.PageGroup.prototype.getSegment = function()
{
    return TestShell.SegmentManager.get(this.segmentID);
};

// get the bank/item keys for the cover page
TestShell.PageGroup.prototype.getCoverPageInfo = function()
{
    var contentPage = this.getContentPage();
    if (contentPage == null) return null;

    // try and get the pages first item
    var items = contentPage.getItems();
    if (items == null || items.length == 0) return null;
    var contentItem = items[0];

    // check if this item has a cover page
    if (contentItem.coverPage == null) return null;

    // get the cover page info for this page
    var bankKey = contentItem.coverPage.bankKey;
    var itemKey = contentItem.coverPage.itemKey;
    var id = 'I-' + bankKey + '-' + itemKey;

    return {
        bankKey: bankKey,
        itemKey: itemKey,
        id: id
    };
};

TestShell.PageGroup.prototype.hasCoverPage = function()
{
    var cpInfo = this.getCoverPageInfo();
    return (cpInfo != null);
};

// get the cover page object (only available when this pages xml has been loaded and parsed)
TestShell.PageGroup.prototype.getCoverPage = function()
{
    // get cover page info
    var cpInfo = this.getCoverPageInfo();
    if (cpInfo == null) return null;

    // check if cover page was created
    return TestShell.CoverPages.get(cpInfo.id);
};

/**********************************************************************************/

// Does this item group have any unanswered questions.
TestShell.PageGroup.prototype.getInfo = function()
{
    var responsesRequired = 0; // how many items are marked as being required
    var responsesValid = 0; // how many items have valid responses

    for (var i = 0; i < this.items.length; i++)
    {
        var item = this.items[i];
        if (item.isRequired) responsesRequired++;
        if (item.isValid) responsesValid++;
    }

    return {
        itemCount: this.items.length, // how many items are in this group
        groupRequired: this.numRequired, // how many items are required to have items to satisfy this group
        itemsRequired: responsesRequired,
        itemsAnswered: responsesValid
    };
};


