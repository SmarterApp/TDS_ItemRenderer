/** **************************************************************************
* @class AnimationRenderer
* @superclass SimItem
* @param none
* @return AnimationRenderer instance
* Creates a new AnimationRenderer class.
*****************************************************************************
*/
Simulator.Animation.AnimationRenderer = function (sim, thePanel, animationSet) {

    Simulator.SimItem.call(this, sim); // Inherit instance variables

    //#region private variables
    var source = 'AnimationRenderer';
    var prevImageID = null;
    var elementInfomediaType = null;
    var elementInfoid = null;
    var elementInfosrc = null;
    var ID_SEPARATOR = '!';
    var currenAnimationName = null;
    var currentAnimationElement = null;
    var tries = 0;
    var maxTries = 10;
    var animationInterval = 500;  // ms
    var panel = thePanel;
    var simID = null;
    var iFrameID = null;

    if (sim) {
        simID = sim.getSimID();
    }

    //#region private functions
    var util = function () { return sim.getUtils(); };

    var dbg = function () { return sim.getDebug(); };

    var whiteboard = function () { return sim.getWhiteboard(); };

    var eventMgr = function () { return sim.getEventManager(); };

    var simMgr = function () { return sim.getSimulationManager(); };

    var layout = function () { return sim.getLayout(); };

    var simDocument = function () { return sim.getSimDocument(); };

    function doImageRendering(element, img, panelName, div, span, renderMaxTime) {
        debug('In doImageRendering - Image = ' + img.src + ', height = ' + img.height + ', width = ' + img.width);
        var dimensions = util().setDimensions(panel.getHeight(), panel.getWidth(), img.height, img.width, 10 /* padding */);  // Set the image height and width to fit into the animation panel
        if (dimensions.height > 0 && dimensions.width > 0) {
            img.height = dimensions.height;
            img.width = dimensions.width;
            debug('In doImageRendering - Image resize with padding to height = ' + img.height + ', width = ' + img.width);
        }
        span.appendChild(img);
        elementInfomediaType = 'image';
        elementInfoid = div.id;
        elementInfosrc = img.src;
        //var callbackStr = util().createTimeOutCallbackStr('AnimationThread', 'handleTimeout', element.getNodeID()); //TODO: delete after testing.
        //  if (renderMaxTime != undefined && renderMaxTime != null && renderMaxTime >= 0) {
        if (!renderMaxTime) remderMaxTime = 0;
        if (renderMaxTime >= 0) setTimeout(function () { handleTimeout(element); }, renderMaxTime);  // if renderMaxTIme = -1 then we are loadig a single static image
    }

    function handleTimeout(renderedElement) {
        var anEvent = null;
        if (renderedElement != undefined && renderedElement != null) {
            var thread = animationSet.getCurrentThread();
            if (thread != null && thread != undefined) {
                var element = thread.renderNextThreadElement();
                if (element == null) {
                    anEvent = new Simulator.Event(renderedElement, "info", "animationThreadFinished");
                    eventMgr().postEvent(anEvent);
                }
            }
            else {
                anEvent = new Simulator.Event(renderedElement, "info", "animationThreadFinished");
                eventMgr().postEvent(anEvent);
            }
        }
        else
            dbg().logFatalError(source, "renderedElement is null in AnimationRenderer.handleTimeout");
    };

    function flashEmbedSuccessCallback(event) {
        if (!event.success) {
            animationSet.setCurrentAnimation(null);
            dbg().logFatalError(source, 'Could not embed flash element ' + event.id);
        } else {
            animationSet.setCurrentAnimation(simDocument().getElementById(event.ref.id));
            eventMgr().postEvent(new Simulator.Event(animationSet, 'info', 'animationEmbedded', event.ref));
            sendDataToAnimationElement(false);
        }
    }

    function sendDataToAnimationElement(element, update) {
        var t = null;
        var foundSource = false;
        var interactive = false;
        var data = '';
        element = (!element) ? currentAnimationElement : element;
        debug('In sendDataToAnimationElement - element = ' + element.getName());
        if (util().elementInArray(animationSet.getInputSource(), 'evaluator')) {
            data = whiteboard().getItem('evaluationOutput', 'output');
            if (data == null || data == '') data = '';
            else foundSource = true;
        }
        if (util().elementInArray(animationSet.getInputSource(), 'animation')) {
            var animationData = whiteboard().getCategoryAsString('animationInput');
            foundSource = true;
            if (animationData != '' && animationData != null) {
                if (data != '' && data != null) data += Simulator.Constants.PAIR_DELIMITTER + animationData;
                else data = animationData;
            }
        }
        if (foundSource == false) {
            dbg().logFatalError(source, 'Unknown input source ' + animationSet.getInputSource() + ' in sendDataToAnimationElement. No data sent to animation element');
            return;
        }
        if (tries == 0) util().markTime();

        var movie = animationSet.getCurrentAnimation();
        if (movie) {
            if (!movie.animationInput) {
                t = setTimeout(function () { sendDataToAnimationElement(element, false); }, animationInterval);
                tries++;
                if (tries > maxTries) {
                    clearTimeout(t);
                    tries = 0;
                    dbg().logFatalError(source, 'Could not establish interface with animation element ' + currenAnimationName + ' after ' + tries
                        + ' attempts spanning ' + util().getElapsedTime() + ' ms');
                }
                return;
            }
            else {
                clearTimeout(t);
                tries = 0;
                var simID = sim.getSimID();
                if (element.getInteractive) interactive = element.getInteractive();
                if (movie.animationInitialize) movie.animationInitialize(simID, interactive);
                if (!update) {
                    if ((data != null) && (data != '')) {
                        movie.animationInput(simID, 'input', data);
                        debugf('Sending "' + data + '" to animation "' + currenAnimationName + '"');
                    }
                    else {
                        movie.animationInput(simID, 'input', 'input');
                        debugf('Sending "input" to animation "' + currenAnimationName + '"');
                    }
                    debugf('Sending "play" to current animation after ' + util().getElapsedTime() + ' ms');
                    eventMgr().postEvent(new Simulator.Event(animationSet, 'info', 'animationStarted'));
                    movie.animationInput(simID, 'command', 'play');
                }
                else {
                    if (movie.animationInput) {
                        debugf('Sending "update" to animation "' + currenAnimationName + '" with data: "' + data + '" after ' + util().getElapsedTime() + ' ms');
                        eventMgr().postEvent(new Simulator.Event(animationSet, 'info', 'animationStarted'));
                        if ((data != null) && (data != '')) movie.animationInput(simID, 'update', data);
                        else movie.animationInput(simID, 'update', 'input');
                    }
                    else dbg().logFatalError(source, 'Could not re-establish previously established interface with animation element ' + currenAnimationName);
                }
            }
        }
    }

    function removeFlash(flashObj) {
        swfobject.removeSWF(flashObj);
        animationSet.setCurrentAnimation(null);
    }

    function formatAnimationInput(data) {

    }

    //#endregion

    //#region public functions

    this.sendDataToAnimation = function (element) {
        sendDataToAnimationElement(element, false);
    };

    this.renderImage = function (element, panelName, imageSrc, currentElementName, renderMaxTime, thread) {
        var img = null;
        var span = null;
        var HTMLAnimation = null;
        var HTMLPanel = panel.getHTMLElement();
        span = simDocument().getElementById('holdingSpan' + simID);
        if (span)
            HTMLAnimation = span.getElementsByTagName('img')[0];
        if (!HTMLAnimation)
            HTMLAnimation = simDocument().getElementById(prevImageID);
        if (HTMLAnimation) {
            HTMLAnimation.src = imageSrc;
            HTMLAnimation.id = element.getName();
            if (!renderMaxTime) remderMaxTime = 0;
            if (renderMaxTime >= 0) setTimeout(function () { handleTimeout(element); }, renderMaxTime);
        }
        else {
            var div = simDocument().getElementById('holderAnimation' + simID);
            if (div && div.media != 'imageAnimation') {
                var parent = div.parentNode;
                if (parent.id == 'outerDiv')
                    HTMLPanel.removeChild(parent);
                else
                    HTMLPanel.removeChild(div);
            }
            div = simDocument().createElement('div');
            div.id = 'holderAnimation' + simID;
            div.elementName = currentElementName;
            div.setAttribute('class', 'holderAnimation');
            div.media = 'imageAnimation';
            HTMLPanel.appendChild(div);
            span = simDocument().createElement('span');
            span.setAttribute('class', 'holderCell');
            span.id = 'holdingSpan' + simID;
            div.appendChild(span);

            img = simDocument().createElement('img');
            img.id = currentElementName;
            prevImageID = img.id;

            var imageLoaded = false, wait;

            util().bindEvent(img, 'load', function () { imageLoaded = true; });
            img.src = imageSrc;

            wait = setInterval(function () {
                //debug('In setInterval waiting for image to load');
                if (imageLoaded) {
                    //debug('In setInterval - image loaded');
                    clearInterval(wait);
                    eventMgr().postEvent(new Simulator.Event(element, 'info', 'imageEmbedded', img));
                    eventMgr().postEvent(new Simulator.Event(element, "info", "allMediaLoaded"));
                    doImageRendering(element, img, panelName, div, span, renderMaxTime);
                }
            }, 1);
        }
    };

    this.renderAnimation = function (element, panelName, animationSrc, animationName, animationControls, currentElementName, renderMaxTime, thread) {
        var holderDiv = null;
        var hsize = panel.getHeight();
        var wsize = panel.getWidth();
        var HTMLPanel = panel.getHTMLElement();
        var result = null;
        var initialRender = false;

        if (elementInfomediaType != 'animation' || elementInfosrc != animationSrc) {
            holderDiv = simDocument().getElementById('holderAnimation' + simID);
            if (holderDiv && holderDiv.media != 'animation') {
                var parent = holderDiv.parentNode;
                if (parent.id == 'outerDiv') HTMLPanel.removeChild(parent);
                else HTMLPanel.removeChild(holderDiv);
                initialRender = true;
            }
            holderDiv = simDocument().createElement('div');
            holderDiv.id = 'holderAnimation' + simID;
            holderDiv.name = 'holderAnimation' + simID;
            holderDiv.elementName = animationName;
            holderDiv.setAttribute('class', 'holderAnimation');
            HTMLPanel.appendChild(holderDiv);
            elementInfomediaType = 'animation';
            elementInfoid = holderDiv.id;
            initialRender = true;
        } else holderDiv = simDocument().getElementById('holderAnimation' + simID);
        elementInfosrc = animationSrc;
        currentAnimationElement = element;
        if(sim.getAccessibilityIFActive()) {  // If we are in the accessibility IF, we show the altText instead
            var altText = element.getAltText();
            var altTextSpan = simDocument().createElement('span');
            altTextSpan.style.position='absolute';
            altTextSpan.style.top = '50%';
            holderDiv.style.verticalAlign='middle';
            holderDiv.style.horizontalAlign='center';
            altTextSpan.style.fontSize = 'xx-large';
            altTextSpan.innerHTML = altText;
            holderDiv.innerHTML = '';
            holderDiv.appendChild(altTextSpan);
            debug('renderAnimation simulating time of animation execution since accessibilityIF is true');
            setTimeout(simulateAnimationExecutionTime, 5000);
            return;
        }
        if (!iFrameID) iFrameID = this.createItemID(true, -1, 'html5iFrame');
        var iFrame = simDocument().getElementById(iFrameID);
        if (!iFrame) {
            iFrame = simDocument().createElement('iframe');
            iFrame.id = iFrameID;
            iFrame.width = wsize - 5;
            iFrame.height = hsize - 5;
            debug('iFrame.height = ' + iFrame.height + ', iFrame.width = ' + iFrame.width);
            iFrame.border = 0;
            iFrame.scrolling = 'no';
            iFrame.src = appendExternalScriptURLParameter(animationSrc, sim.getAnimationExternalScriptsPath());
            // force setting the iFrame height, and override any existing css settings
            iFrame.setAttribute('style', 'height:' + iFrame.height + 'px !important');
            iFrame.setAttribute('class', 'centeredAnimation');
            if (initialRender) holderDiv.appendChild(iFrame);
            iFrame.onload = function () {
                debug("iFrame is loaded");
                createHTML5AnimationInterface(element, iFrame, animationName);
            };
        }
        else {
            if (renderMaxTime != undefined && renderMaxTime != null && renderMaxTime >= 0) {
                //var callbackStr = util().createTimeOutCallbackStr('AnimationThread', 'handleTimeout', element.getNodeID());
                setTimeout(function () { handleTimeout(element); }, renderMaxTime);
            }
            sendDataToAnimationElement();  // if iframe is already loaded just send the data
        }
    };

    function appendExternalScriptURLParameter(animationUrl, scriptUrl) {
        // add the base script url if included (used for animations to resolve scripts)
        if (scriptUrl)
            scriptUrl = encodeURIComponent(scriptUrl);
        if (animationUrl) {
            if (animationUrl.indexOf('?') != -1)
                animationUrl = animationUrl.replace('?', '?scriptUrl=' + scriptUrl + '&');
            else
                animationUrl = animationUrl + '?scriptUrl=' + scriptUrl;
        }
        return animationUrl;
    }

    function createHTML5AnimationInterface(element, iFrame, animationName, renderMaxTime) {
        var html5Shell = new Simulator.Animation.HTML5Shell(sim, simID);
        if (!html5Shell) {
            dbg().logFatalError(source, 'Could not instantiate HTML5Shell');
        } else {
            var parameters = {
                callback: animationSet.animationMediaOutput,
                behavior: element.getBehavior(),
                inlineData: null,
                containerID: iFrame.id,
                outputOnReq: animationSet.getOutputOnRequest()
            };
            animationSet.setCurrentAnimation(html5Shell);
            result = html5Shell.initialize(simID, parameters);
            if (result !== Simulator.Constants.ANIMATION_LOADED) dbg().logFatalError(source, 'Could not initialize HTML5Shell');
            currenAnimationName = animationName;
        }
        if (renderMaxTime != undefined && renderMaxTime != null && renderMaxTime >= 0) {
            //var callbackStr = util().createTimeOutCallbackStr('AnimationThread', 'handleTimeout', element.getNodeID());
            setTimeout(function () { handleTimeout(element); }, renderMaxTime);
        }
        sendDataToAnimationElement(element, false);
    };

    this.renderHotText = function (element, panelName, animationSrc, animationName, animationControls, currentElementName, renderMaxTime, thread) {
        var HTMLPanel = panel.getHTMLElement();
        var holderDiv = null;
        var hsize = panel.getHeight();
        var wsize = panel.getWidth();

        if (elementInfomediaType != 'hotText' || elementInfosrc != animationSrc) {
            holderDiv = simDocument().getElementById('holderAnimation' + simID);
            if (holderDiv && holderDiv.media != 'hotText') {
                var parent = holderDiv.parentNode;
                if (parent.id == 'outerDiv') HTMLPanel.removeChild(parent);
                else HTMLPanel.removeChild(holderDiv);
            }

            holderDiv = simDocument().createElement('div');
            holderDiv.id = 'holderAnimation' + simID;
            holderDiv.style.textAlign = 'left';
            holderDiv.name = 'holderAnimation' + simID;
            holderDiv.elementName = animationName;
            holderDiv.setAttribute('class', 'holderAnimation');
            var contentDiv = simDocument().createElement('div');
            contentDiv.id = 'hotTextContentDiv';
            contentDiv.style.textAlign = 'left';
            contentDiv.style.padding = '0px';
            holderDiv.appendChild(contentDiv);
            HTMLPanel.appendChild(holderDiv);
            elementInfomediaType = 'animation';
            elementInfoid = holderDiv.id;
        }
        elementInfosrc = animationSrc;
        contentDiv.innerHTML = animationSrc;
        if (renderMaxTime != undefined && renderMaxTime != null && renderMaxTime >= 0) {
            //var callbackStr = util().createTimeOutCallbackStr('AnimationThread', 'handleTimeout', element.getNodeID());
            setTimeout(function () { handleTimeout(element); }, renderMaxTime);
        }
        currenAnimationName = animationName;

        var hotText = new Simulator.Animation.HotTextShell(sim);

        animationSet.setCurrentAnimation(hotText);

        debug('AnimationSet.CurrentAnimation = ' + animationSet.getCurrentAnimation());

        debug('Initializing the HotTextShell: inlinDataID = ' + element.getInlineDataID() + ', holderDiv.id = ' + holderDiv.id + ', outputOnRequest = ' + animationSet.getOutputOnRequest());

        var parameters = {
            callback: animationSet.animationMediaOutput,
            inlineDataID: element.getInlineDataID(),
            containerID: holderDiv.id,
            behavior: element.getBehavior(),
            outputOnReq: animationSet.getOutputOnRequest()
        };

        hotText.initialize(simID, parameters);

        sendDataToAnimationElement(element, false);
    };

    this.resizeAnimationElements = function (panel, zoom) {
        var HTMLPanel = panel.getHTMLElement();
        if (zoom) {
            var flashObjectArray = HTMLPanel.getElementsByTagName('object');
            if (flashObjectArray && flashObjectArray.length == 1) {
                var flashObj = flashObjectArray[0];
                flashObj.animationResize(parseInt(flashObj.style.width), parseInt(flashObj.style.height));
            }
        }
        else {
            var hsize = panel.getHeight();
            var wsize = panel.getWidth();
            var flashObjectArray = HTMLPanel.getElementsByTagName('object');
            if (flashObjectArray && flashObjectArray.length == 1) {
                var flashObj = flashObjectArray[0];
                var dimensions = util().setDimensions(hsize, wsize, parseInt(panel.getOriginalHeight()), parseInt(panel.getOriginalWidth()), 10 /* padding */);  // Set the image height and width to fit into the animation panel
                if (dimensions.height > 0 && dimensions.width > 0) {
                    hsize = dimensions.height;
                    wsize = dimensions.width;
                }
                flashObj.width = wsize;
                flashObj.height = hsize;
                flashObj.setAttribute('originalwidth', wsize);
                flashObj.setAttribute('originalheight', hsize);
                flashObj.style.width = wsize + 'px';
                flashObj.style.height = hsize + 'px';
                flashObj.animationResize(wsize, hsize);
            }
            var imgArray = HTMLPanel.getElementsByTagName('img');
            if (imgArray && imgArray.length == 1) {
                var image = imgArray[0];
                debug('Image height = ' + image.height + ', width = ' + image.width);
                var dimensions = util().setDimensions(hsize, wsize, image.height, image.width, 10 /* padding */);  // Set the image height and width to fit into the animation panel
                if (dimensions.height > 0 && dimensions.width > 0) {
                    image.height = dimensions.height;
                    image.width = dimensions.width;
                    debug('Image resize with padding to height = ' + image.height + ', width = ' + image.width);
                }
            }
        }
    };

    this.renderFlash = function (element, panelName, flashSrc, flashName, flashControls, currentElementName, renderMaxTime, thread) {
        var HTMLPanel = panel.getHTMLElement();
        if (elementInfomediaType != 'flash' || elementInfosrc != flashSrc) {
            var expressFlashInstall = false;
            var animationSet = thread.getAnimationSet();
            var flashvars = {
                simID: simID,
                simURL: escape(flashSrc),
                simCallback: (window.document == simDocument()) ? Simulator.Constants.SIM_CALLBACK : 'window.parent.' + Simulator.Constants.SIM_CALLBACK,
                simBehavior: element.getBehavior()
            };
            debug("flashvars.simBehavior = " + flashvars.simBehavior);
            var params = {
                wmode: 'opaque',
                allowscriptaccess: 'always',
                swliveconnect: 'true'
            };
            var attributes = {};
            attributes.name = flashName;
            attributes.media = 'flashAnimation';
            attributes.styleclass = 'centeredAnimation';
            var flashVersion = '9';
            var hsize, wsize;
            if ((panel.getOriginalHeight() == null) || (panel.getOriginalHeight() <= 0)) {
                hsize = panel.getHeight() - 10;
            } else {
                hsize = panel.getOriginalHeight() - 10;
            }
            if ((panel.getOriginalWidth() == null) || (panel.getOriginalWidth() <= 0)) {
                wsize = panel.getWidth() - 10;
            } else {
                wsize = panel.getOriginalWidth() - 10;
            }

            var holderDiv = simDocument().getElementById('holderAnimation' + simID);
            if (holderDiv && holderDiv.media != 'flashAnimation') {
                var parent = holderDiv.parentNode;
                if (parent.id == 'outerDiv') HTMLPanel.removeChild(parent);
                else HTMLPanel.removeChild(holderDiv);
            }

            holderDiv = simDocument().createElement('div');
            holderDiv.id = 'holderAnimation' + simID;
            holderDiv.name = 'holderAnimation' + simID;
            holderDiv.elementName = flashName;
            holderDiv.setAttribute('class', 'holderAnimation');
            holderDiv.innerHTML = '<h1>Alternative content</h1>';
            HTMLPanel.appendChild(holderDiv);
            if(sim.getAccessibilityIFActive()) {  // If we are in the accessibility IF, we show the altText instead
                var altText = element.getAltText();
                var altTextSpan = simDocument().createElement('span');
                altTextSpan.style.position='absolute';
                altTextSpan.style.top = '50%';
                holderDiv.style.verticalAlign='middle';
                holderDiv.style.horizontalAlign='center';
                altTextSpan.style.fontSize = 'xx-large';
                altTextSpan.innerHTML = altText;
                holderDiv.innerHTML = '';
                holderDiv.appendChild(altTextSpan);
                debug('renderFlash simulating time of animation execution since accessibilityIF is true');
                setTimeout(simulateAnimationExecutionTime, 5000);
                return;
            }
            elementInfomediaType = 'flash';
            elementInfoid = holderDiv.id;
            elementInfosrc = flashSrc;
            currentAnimationElement = element;
            currenAnimationName = flashName;
            swfobject.switchOffAutoHideShow();
            swfobject.embedSWF(sim.getAnimationShellPath(), holderDiv.id, wsize, hsize, flashVersion, expressFlashInstall, flashvars, params, attributes, simDocument(), flashEmbedSuccessCallback);
            if (renderMaxTime != undefined && renderMaxTime != null && renderMaxTime >= 0) {
                //var callbackStr = util().createTimeOutCallbackStr('AnimationThread', 'handleTimeout', element.getNodeID());
                setTimeout(function () { handleTimeout(element); }, renderMaxTime);
            }

        }
        else
            sendDataToAnimationElement(element, false);
    };

    this.renderVideo = function (element, panelName, videoSrc, currentElementName, renderMaxTime, thread) {
        var HTMLAnimation = simDocument().getElementById(currentElementName);
        var vid = simDocument().createElement('video');
        vid.setAttribute('type', 'application/x-shockwave-flash');
        vid.setAttribute('width', panel.getWidth(true) - 2);
        vid.controls = 'true';
        vid.setAttribute('src', videoSrc);
        vid.object = simDocument().createElement('object');
        vid.object.data = 'flvplayer.swf';
        vid.object.media = 'videoAnimation';
        vid.object.type = 'application/x-shockwave-flash';
        vid.object.param = simDocument().createElement('param');
        vid.object.param.value = 'flvplayer.swf';
        vid.object.param.name = 'movie';
        var div = simDocument().createElement('div');
        div.setAttribute('class', 'holderAnimation');
        var span = simDocument().createElement('span');
        span.appendChild(vid);
        div.appendChild(span);
        panel.replaceChild(div, HTMLAnimation);

    };
    function simulateAnimationExecutionTime(renderer) {
        debug('Posting animationThreadFinished event since accessibilityIF is true');
        eventMgr().postEvent(new Simulator.Event(this, 'info', 'animationThreadFinished'));
    }

    //#endregion

    //#region  Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

    //#endregion
};

//Inherit methods and class variables
Simulator.Animation.AnimationRenderer.prototype = new Simulator.SimItem();
Simulator.Animation.AnimationRenderer.prototype.constructor = Simulator.Animation.AnimationRenderer; // Reset the prototype to point
