/*
A simple interface for creating promises.
API: https://github.com/kriskowal/q
Interface: https://github.com/borisyankov/DefinitelyTyped/blob/master/q/Q.d.ts
Future: https://github.com/petkaantonov/bluebird (https://news.ycombinator.com/item?id=6494622)
*/

Util.Promise = {};

(function (P, Q) {
    P.defer = Q.defer;
    P.isPromise = Q.isPromise;
})(Util.Promise, Q);