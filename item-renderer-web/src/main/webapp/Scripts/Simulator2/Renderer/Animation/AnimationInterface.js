//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*******************************************************************
 * This file must be copied and customized for each HTML5 animation
 * These functions communicate with the HTML5Shell.
 * The animator must provide animation specific implementations
 * for most of these functions.
 * In addition, all of these function which are called by the
 * shell should return SUCCESS or FAILURE to the shell to indicate
 * the result of the function execution.
 ********************************************************************/

var source = 'AnimationInterface';
var shellInterface = null;
var SUCCESS = 1;
var FAILURE = -1;
//ANIMATION_BEHAVIOR
var INTERACTIVE_ANIMATION = "interactive";  //user interact with animation, like microscope
var TIME_BASED_ANIMATION = "timeline";  // timeline
var STATIC_ANIMATION = "static";  // animation lasts less than a second
var ANIMATION_BEHAVIOR = TIME_BASED_ANIMATION;   // the behavior of this animation
var shellInterface = null;
var shellCallback = null;

/*========================================
 // Public  API
// Implementation of animation specific functions called by shell -
// init, playAnimation, updateInputs, etc
//========================================*/

/* ------------ DO NOT MODIFY init() ------------ */
init = function(theShellInterface, animationParams) {
    shellInterface = theShellInterface; // Signature: shellInterface(type, data)
    shellCallback = animationParams.callback;
    var simHeight = animationParams.simHeight;
    var simWidth = animationParams.simWidth;
    debug("simHeight = " + animationParams.simHeight);
    debug("simWidth = " + animationParams.simWidth);
    debug("animation behavior = " + animationParams.behavior);
    if (animationParams.behavior != ANIMATION_BEHAVIOR){
        animationError("Animation behavior is not matched: expected " + behavior + "; received " + animationParams.behavior);
        return FAILURE;
    } else {
        resizeAnimation(simHeight, simWidth);
        return SUCCESS;
    }
};
/* ------------ DO NOT MODIFY init() ------------ */

function updateInputs(inputs) {  // public - from the shell
    debug('In updateInputs');
    // Implementation provided by animator
    // return status (SUCCESS or FAILURE of implementation
}

function playAnimation() {  // public - from the shell
    debug('In playAnimation');
    // Implementation provided by animator
    // return status (SUCCESS or FAILURE of implementation
}

function getProperties() { // public - request for behavior and io element names to
                            // be sent back to the shell
    debug('In getProperties');
    // Implementation provided by animator
   //return animation properties
}

function statusRequest() {   // public
    debug('In statusRequest');
    // Implementation provided by animator
    // return animation status 
}

function cancelAnimation() {  //public
    debug('In cancelAnimation');
    // Implementation provided by animator
    // return status
}

function getOutputs() {  // public
    debug('In getOutputs');
    // Implementation provided by animator
    //return animation output data;
}

function restart() {  //public
    debug('In restart');
    // Implementation provided by animator
    // return status (SUCCESS or FAILURE of implementation
}


/*========================================
// Private API
//========================================*/

function resizeAnimation(height, width) {
    //Implemented by animator to make sure animation conforms to the smallest of these dimensions.
}

function animationError(msg) {
    //Simulator.Constants.PARAM_ERROR = "error";
    console.log("animationError(): " + msg);
    shellCallback("error", msg);
}

function animationStarted(){
    shellCallback("info", "animationStarted");
}

function animationFinish() {
    shellCallback("info", "animationFinished");
}


function initAnimation() {
    debug('In initAnimation');
    // Implementation provided by animator
    // return SUCCESS or FAILURE of implementation
    return SUCCESS;
}
    