//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (exports) {
    'use strict';

    // a FIFO message bus which can wait for messages to be 'ready' before dispatching them

    function MessageQueue() {
        this.observers = [];
        this.queue = [];
    }

    MessageQueue.prototype.enqueue = function (message, callback) {

        var self = this,
            entry = {
                message: message,
                callback: callback,
                isReady: false
            };

        this.queue.push(entry);

        // return a resolve function that will let the caller tell us when this message is ready
        return function (message) {

            entry.isReady = true;
            entry.message = message || entry.message;

            var queueEntry;

            while (self.queue.length > 0) {

                if (!self.queue[0].isReady) {
                    break;
                }

                queueEntry = self.queue.shift();
                queueEntry.callback(queueEntry.message);
            }
        };
    };

    // exports

    exports.MessageQueue = MessageQueue;

})(typeof window !== 'undefined' ? window : self);
