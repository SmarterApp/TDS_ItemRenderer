//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Test shell page that contains the segment review screen.
*/

TestShell.PageReview = function(segment)
{
    TestShell.PageReview.superclass.constructor.call(this, segment.getSafeId());

    this._segment = segment;
    this._divReview = null;
    this._confirmed = false;

    this.init();
};

YAHOO.lang.extend(TestShell.PageReview, TestShell.Page);

// create container for review
TestShell.PageReview.prototype.init = function() 
{
    var divReviews = YUD.get('reviews');

    // create review div
    this._divReview = HTML.DIV({ className: 'review' });
    this._divReview.innerHTML = YUD.get('template_review').innerHTML;
    
    // process i18n
    TDS.Messages.Template.processLanguage(this._divReview);

    divReviews.appendChild(this._divReview);
    this.hide();
};

TestShell.PageReview.prototype.getSegment = function() { return this._segment; };

TestShell.PageReview.prototype.getLabel = function () { return Messages.getAlt('TestShell.Label.PageReview', 'Review'); };

TestShell.PageReview.prototype.isVisible = function()
{
    // check if any of the groups for this segment are enabled
    var groups = this._segment.getGroups();
    var anyGroupEnabled = Util.Array.some(groups, function(group) { return group.isEnabled(); });
    
    // since no groups are enabled disable review
    if (!anyGroupEnabled) return false;
    
    // call base 
    return TestShell.PageReview.superclass.isVisible.call(this);
};

TestShell.PageReview.prototype.hide = function()
{
    ContentManager.Renderer.hide(this._divReview);
    TestShell.PageManager.Events.fire('onHide', this);
};

// update review information
TestShell.PageReview.prototype.show = function() {

    // get list container
    var listEl = null;
    if (this._divReview) {
        listEl = $('ul', this._divReview).get(0);
    }

    // make sure list exists
    if (!listEl) {
        return;
    }

    // clear out existing questions
    listEl.innerHTML = '';

    // get segment groups
    var groups = this._segment.getGroups();

    groups.forEach(function(group) {

        // ignore disabled groups
        if (!group.isEnabled()) {
            return;
        }

        group.items.forEach(function(item) {

            // TODO: This code is mostly copied from section_TestReview. We need a way to share it.
            var el = document.createElement('li');
            var linkEl = document.createElement('a');
            linkEl.href = '#';
            $(linkEl).click(function (evt) {
                YUE.stopEvent(evt);
                TestShell.UI.Nodes.ddlNavigation.value = group.id;
                TestShell.Navigation.change();
            });
            $(linkEl).text(item.position);
            var label = 'Question';
            if (item.mark) { // marked
                $(linkEl).addClass('marked');
                label += ' marked for review';
            }
            if (!item.isAnswered()) { // answered
                $(linkEl).addClass('unanswered');
                if (item.mark) { // marked
                    label += ' and';
                }
                label += ' unanswered';
            }
            linkEl.setAttribute('title', label);
            el.appendChild(linkEl);
            listEl.appendChild(el);

        });

    });
    
    ContentManager.Renderer.show(this._divReview);
    TestShell.PageManager.Events.fire('onShow', this);
};

// get the page specific page title to show user
TestShell.PageReview.prototype.getPageTitle = function () {
    return 'Review Page';
};

TestShell.PageReview.prototype.setConfirmed = function () { this._confirmed = true; };
TestShell.PageReview.prototype.isConfirmed = function() { return this._confirmed; };

// check if this segment is considered completed which unlocks the next group in the next segment
TestShell.PageReview.prototype.isCompleted = function() // base
{
    // check if confirming if the review page being completed is disabled
    if (TDS.getAppSetting('testshell.segments.disableReviewConfirm')) return true;

    // check if someone manually confirmed this review page by pressing next on it
    if (this.isConfirmed()) return true;
    
    // since nobody manually set this review page as confirmed
    // let's see if we can implicitly figure it out..
    
    // get all segments for the test
    var segments = TestShell.SegmentManager.getSegments();

    /// get all the segments appearing after this segment review page
    var segmentCurrIdx = segments.indexOf(this._segment);
    var segmentsNext = Util.Array.slice(segments, segmentCurrIdx + 1);

    // go through all the next segments to see if any group was previously visited
    for (var i = 0; i < segmentsNext.length; i++)
    {
        var segmentNext = segmentsNext[i];
        var groups = segmentNext.getGroups();

        for (var j = 0; j < groups.length; j++)
        {
            var group = groups[j];
            
            // if this group is visited then someone must have previously seen past this review page
            if (group.isVisited()) return true;
        }
    }

    // if we get here then best we can tell nobody has got past review page yet
    return false;
};



