//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// CLASS: unit
// @divUnit = the unit div for the prompt
// @layout = the writing layout class parent of the prompt
function WritingUnit(divUnit)
{
    this.onOpenEdit = new YAHOO.util.CustomEvent('onOpenEdit', this, false, YAHOO.util.CustomEvent.FLAT),
    this.onCloseEdit = new YAHOO.util.CustomEvent('onCloseEdit', this, false, YAHOO.util.CustomEvent.FLAT),

    this.item = null;
    this.position = divUnit.id.split('_')[1] * 1; // get pos #

    this.divPrompt = YUD.getElementsByClassName('prompt', 'div', divUnit)[0];
    this.divContent = YUD.getElementsByClassName('promptContent', 'span', this.divPrompt)[0];
    this.linkSelect = YUD.getElementsByClassName('addMark', 'span', divUnit)[0]; // link to mark prompt selected
    this.linkExpandPrompt = YUD.getElementsByClassName('expandPrompt', 'a', divUnit)[0]; // link to mark prompt selected

    // get the html owner doc for the unit
    var unitDoc = divUnit.ownerDocument;
    
    this.divComment = unitDoc.getElementById("Item_CommentBox_" + this.position); // comment div
    this.textComment = unitDoc.getElementById("Item_Comment_" + this.position); // comment textarea
    this.hiddenChanged = unitDoc.getElementById("Item_Changed_" + this.position); // has item changed?
    this.hiddenSelected = unitDoc.getElementById("Item_Selected_" + this.position); // is item selected?
    this.textResponse = unitDoc.getElementById("Item_Response_CR_" + this.position); // response
    this.checkMark = unitDoc.getElementById("Item_Mark_" + this.position); // mark for review

    // check if the prompt is expanded
    this.isExpanded = function()
    {
        return YUD.hasClass(this.divPrompt, 'openedPrompt');
    };
    
    // expand prompt
    this.expand = function()
    {
        return YUD.addClass(this.divPrompt, 'openedPrompt');
    };

    // collapse prompt
    this.collapse = function()
    {
        return YUD.removeClass(this.divPrompt, 'openedPrompt');
    };
    
    // toggle expand/collapse
    this.toggleExpand = function()
    {
        if (this.isExpanded()) this.collapse();
        else this.expand();
    };

    // check if prompt is selected
    this.isSelected = function()
    {
        return this.hiddenSelected.value.toUpperCase() == "TRUE";
    };

    this.getValue = function()
    {
        return this.textResponse.value;
    };

    // check if prompt is selected
    this.hasChanges = function()
    {
        return this.hiddenChanged.value.toUpperCase() == "TRUE";
    };

    // select prompt
    // @PRIVATE
    this.select = function()
    {
        YUD.addClass(divUnit, 'selectedPrompt');
        this.hiddenSelected.value = true;
    };
    
    // deselect prompt
    // @PRIVATE
    this.deselect = function()
    {
        YUD.removeClass(divUnit, 'selectedPrompt');
        this.hiddenSelected.value = false;
    };
}
