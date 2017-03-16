//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TestShell.ResponseManager.Events.onSuccess.subscribe(function (results) {

    //check if the array already contains a segment for the specified segment position;
    function contains(arr, segmentPosition) {
        for (var index = 0; index < arr.length; ++index) {
            if (arr[index].position == segmentPosition)
                return true;
        }
        return false;
    };

    function createTestSegment(segmentPosition, segmentId) {
        //we will create a segment object as would have been done in TestShellScripts otherwise.
        var segment = {
            id: segmentId,
            position: segmentPosition,
            label: segmentId,
            itemReview: false,
            isPermeable: true,
            updatePermeable: false,
            entryApproval: 0,
            exitApproval: 0
        };
        return segment;
    };

    //in SIRVE we do not have segment info when TestShell is initialized. we now have received the responses from the XHR call.
    //we will use that to create the segment informaion here and then call <segment manager init()> again.
    if (TDS.isSIRVE) {
        var totalNumberOfItems = 0;
        //we will assume that the elements in the group are sorted by increasing segment id.

        throw new Error('TODO: You need to add segments to the storage test info object.');

        window.tdsSegments = [];
        for (var groupIndex = 0; groupIndex < results.groups.length; ++groupIndex) {
            var group = results.groups[groupIndex];
            var segmentPosition = group.segment;
            var segmentId = group.segmentID;
            if (!contains(window.tdsSegments, segmentPosition))
                window.tdsSegments.push(createTestSegment(segmentPosition, segmentId));

            //get count of item.
            totalNumberOfItems += group.responses.length;
        }

        //reset test length. we do not have the test length available when we invoke SIRVEOpportunityService.OpenTest.
        //we will need to read just our item length here.
        TestShell.Config.testLength = totalNumberOfItems;

        //initialize the segment manager again.
        TestShell.SegmentManager.init();

        //set group to the first group.
        TestShell.PageManager.setCurrent(results.groups[0]);
    }
});
