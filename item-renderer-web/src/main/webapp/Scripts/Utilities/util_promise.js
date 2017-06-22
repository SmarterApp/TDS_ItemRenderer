//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
A simple interface for creating promises.
API: https://github.com/kriskowal/q
Interface: https://github.com/borisyankov/DefinitelyTyped/blob/master/q/Q.d.ts
Future: https://github.com/petkaantonov/bluebird (https://news.ycombinator.com/item?id=6494622)
*/

Util.Promise = {};

(function (P, Q) {
    Q.stopUnhandledRejectionTracking();
    P.defer = Q.defer;
    P.isPromise = Q.isPromise;
    P.when = Q.when;
})(Util.Promise, Q);