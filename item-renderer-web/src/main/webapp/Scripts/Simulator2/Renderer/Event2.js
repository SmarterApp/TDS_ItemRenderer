//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************


/**
 * *****************************************************************
 * @class Event
 * @superclass: None
 * @param src- the object creating the event
 * @param type - the event type (info, command, etc)
 * @param context - the context in which the event was created
 * @param data - any additional data carried by the event
 * @param postOnChange - if true, the event is posted as soon as 
 *        its conditions occur
 * @param completeWithoutOutput - indicates that the event 
 *        processing is to complete without waiting for any output
 * @return none
 ********************************************************************
 */

Simulator.Event = function(src, type, context, data, postOnChange, completeWithoutOutput) {
    // Instance variables - they are public
    this.type = type;
    this.src = src;
    this.context = context;
    this.data = data;
    this.postOnChange = postOnChange;
    this.completeWithoutOutput = (completeWithoutOutput === true) ? true : false;
        
    // Instance methods
    this.inspect = function() {  // Must be embedded since Event has no access to the simulator object
        var buff = [];
        var sep = '\n\n';
        buff.push('Inspecting event'); buff.push(sep);
        if(this.src.getName) {
            buff.push('event src = '); buff.push(this.src.getName()); buff.push(';'); buff.push(sep);
        }
        buff.push('event type = '); buff.push(this.type); buff.push(';'); buff.push(sep);
        buff.push('event context = '); buff.push(this.context);  buff.push(';'); buff.push(sep);
        buff.push('event data = '); buff.push(this.data);  buff.push(';'); buff.push(sep);;
        buff.push('event postOnChange = '); buff.push(this.postOnChange);  buff.push(';'); buff.push(sep);;
        buff.push('event completeWithoutOutput = '); buff.push(this.completeWithoutOutput);  buff.push(';'); buff.push(sep);;
        return buff.join('');
    };

    // Private functions
    function addHTMLEvent( obj, type, fn ) {
      if( obj.attachEvent ) {
        obj['e'+type+fn] = fn;
        obj[type+fn] = function(){obj['e'+type+fn]( window.event );};
        obj.attachEvent( 'on'+type, obj[type+fn] );
      } else
      obj.addEventListener( type, fn, false );
    }


    function removeHTMLEvent( obj, type, fn ) {
      if( obj.detachEvent ) {
        obj.detachEvent( 'on'+type, obj[type+fn] );
        obj[type+fn] = null;
      } else
      obj.removeEventListener( type, fn, false );
    }

};

