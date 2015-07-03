//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class Queue
* @superclass none
* @param none
* @return Queue instance
* Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
* items are added to the end of the queue and removed from the front. 
*****************************************************************************
*/
Simulator.Utils.Queue = function (sim) {

    var source = 'Queue';


    var dbg = function () { return sim.getDebug(); };

    // initialize the queue and offset
    var queue = [];
    var offset = 0;

    /*
    * Returns the length of the queue.
    */
    this.length = function () {
        return (queue.length - offset);
    };

    /*
    * Returns true if the queue is empty, and false otherwise.
    */
    this.isEmpty = function () {
        return (queue.length == 0);
    };

    /*
    * Inserts item at the specific index.
    */
    this.insertAt = function (item, index) {
        var offsetIndex = index + offset;
        if (offsetIndex >= 0 && offsetIndex < queue.length) queue.splice(offsetIndex, 0, item);
        else if (offsetIndex == queue.length) queue.push(item);
    };

    /*
    * Adds the specified item. The parameter is:
    * 
    * item - the item to add
    */
    this.add = function (item) {
        // push the item
        queue.push(item);
    };

    this.elementAt = function (index) {
        var offsetIndex = index + offset;
        if (offsetIndex >= 0 && offsetIndex < queue.length) return queue[offsetIndex];
        else return undefined;
    };

    /*
    * Removes an item and returns it. If the queue is empty then undefined is
    * returned.
    */
    this.remove = function () {
        // if the queue is empty, return undefined
        if (queue.length == 0)
            return null;
        // store the item at the front of the queue
        var item = queue[offset];
        // increment the offset and remove the free space if necessary
        if (++offset * 2 >= queue.length) {
            queue = queue.slice(offset);
            offset = 0;
        }
        // return the added item
        return item;

    };


    /*
    * Returns the item at the front of the queue (without dequeuing it). If the
    * queue is empty then undefined is returned.
    */
    this.peek = function () {
        // return the item at the front of the queue
        return (queue.length > 0 ? queue[offset] : null);
    };

    this.clear = function () {
        var item = this.remove();
        while (item != null) {
            item = this.remove();
        }
    };

    this.inspect = function (embedded, force) {
        var buff = [];
        buff.push('\nInspecting Queue:');
        buff.push('Contains ' + queue.length + (queue.length == 1 ? ' item' : ' items'));
        buff.push('Queue offset = ' + offset);
        for (var i = offset; i < queue.length; i++) {
            buff.push('queue[' + i + '] = ' + queue[i]);
        }
        buff.push('End inspecting Queue\n');
        if (embedded) return buff.join('\n');
        else {
            if (force) debugf(buff.join('\n'));
            else debug(buff.join('\n'));
        }
    };

    this.entriesAsString = function () {
        var buff = [];
        for (var i = 0; i < queue.length; i++) {
            buff.push(queue[i]);
        }
        return buff.join(',');
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};


/** **************************************************************************
* @class OrderedQueue
* @superclass Queue
* @param none
* @return OrderedQueue instance
* Creates a new ordered queue. 
* items are added to the queue based on the item's value. 
*****************************************************************************
*/

Simulator.Utils.OrderedQueue = function (sim) {

    Simulator.Utils.Queue.call(this, sim); // Inherit Instance variables
    var source = 'OrderedQueue';  // global variable used in debug

    
    dbg = function () {return sim.getDebug();};


    /*
    * Adds the specified item on order of its quantity. The parameter is:
    * 
    * item - the item to add
    */
    this.add = function (item) {
        var len = this.length();
        if (typeof (item) != 'object') {
            if (this.isEmpty()) {
                this.insertAt(item, 0);
                return;
            }
            else for (var i = 0; i < len; i++) {
                if (item < this.elementAt(i)) {
                    this.insertAt(item, i);
                    return;
                }
            }
            this.insertAt(item, len);  // if we get this far we have gone through all of the items so just add it to the end
        }
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};
// Inherit methods and class variables
Simulator.Utils.OrderedQueue.prototype = new Simulator.Utils.Queue();
Simulator.Utils.OrderedQueue.parent = Simulator.Utils.Queue;
Simulator.Utils.OrderedQueue.prototype.constructor = Simulator.Utils.OrderedQueue; // Reset the prototype