//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Sections.Accommodations = function()
{
    Sections.Accommodations.superclass.constructor.call(this, 'sectionAccommodations');

    this.addClick('btnAccBack', function()
    {
        this.request('back');
    });

    this.addClick('btnAccSelect', this.submit);

    // current accommodations
    this._segmentsAccommodations = null;
    this._rendererCollection = null;
};

YAHOO.lang.extend(Sections.Accommodations, Sections.Base);

Sections.Accommodations.prototype.init = function()
{
    // DEBUG:
    var querystring = Util.QueryString.parse();
    if (querystring.showInvisibleAccs) Accommodations.Renderer.hideInvisible = false;
    if (querystring.showUnselectableAccs) Accommodations.Renderer.hideUnselectable = false;
};

Sections.Accommodations.prototype.load = function (segmentsAccommodations)
{
    this._segmentsAccommodations = segmentsAccommodations;
    this._rendererCollection = [];

    // get segments container
    var segmentsContainer = YUD.get('segments');

    // clear segments
    segmentsContainer.innerHTML = '';

    segmentsAccommodations.forEach(function(segmentAccommodations)
    {
        // skip accommodations that have nothing visible
        if (!segmentAccommodations.isAnyVisible()) return;

        // create segment container
        var segmentContainer = HTML.DIV({ id: 'segment-' + segmentAccommodations.getId(), 'className': 'segment' });
        segmentsContainer.appendChild(segmentContainer);

        // create segment header
        var segmentHeader = HTML.H2(null, segmentAccommodations.getLabel());
        segmentContainer.appendChild(segmentHeader);

        // create segment accommodations
        var renderer = new Accommodations.Renderer(segmentAccommodations);
        renderer.bind();
        renderer.render(segmentContainer);

        this._rendererCollection.push(renderer);

    }.bind(this));
};

Sections.Accommodations.prototype.submit = function()
{
    var test = LoginShell.testSelection;
    var testee = TDS.Student.Storage.getTestee();
    var session = TDS.Student.Storage.getTestSession();
    var passphrase = TDS.Student.Storage.getPassphrase();
    
    // submit test for approval
    TDS.Student.API.openTest(test, testee, session, this._segmentsAccommodations, null, passphrase)
        .then(function (oppInfo) {
            LoginShell.setOppInfo(oppInfo);
            this.request('next');
    }.bind(this));
};
