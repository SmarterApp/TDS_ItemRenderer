// REQUIRES: util.js, util_dom.js

Util.Frame = { };

// html doctypes
Util.Frame.DOCTYPE_HTML32 =              '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">';
Util.Frame.DOCTYPE_HTML4_TRANSITIONAL =  '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">';
Util.Frame.DOCTYPE_HTML4_STRICT =        '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">';
Util.Frame.DOCTYPE_XHTML1_TRANSITIONAL = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
Util.Frame.DOCTYPE_XHTML1_STRICT =       '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
Util.Frame.DOCTYPE_XHTML11 =             '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">';
Util.Frame.DOCTYPE_MATHML =              '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1 plus MathML 2.0//EN" "http://www.w3.org/Math/DTD/mathml2/xhtml-math11-f.dtd"'; // https://developer.mozilla.org/en-US/docs/Mozilla_MathML_Project/Authoring
Util.Frame.DOCTYPE_HTML5 =               '<!DOCTYPE html>';

// create frame element
Util.Frame.createElement = function(id)
{
    var frame;
    
    // IE does not allow the setting of id and name attributes as object properties via createElement()
    if (YAHOO.env.ua.ie > 0 && Util.Browser.getIEDocMode() < 9)
    {
        frame = document.createElement('<iframe id="' + id + '" name="' + id + '">');
    }
    else
    {
        frame = document.createElement('iframe');
        frame.setAttribute('id', id);
        frame.setAttribute('name', id);
    }

    return frame;
};

// http://bindzus.wordpress.com/2007/12/24/adding-dynamic-contents-to-iframes/
// http://code.google.com/p/google-web-toolkit/source/browse/trunk/dev/core/src/com/google/gwt/core/linker/IFrameTemplate.js
Util.Frame.create = function(id, parent)
{
    // iframe states:
    // -1: aborted
    // 0: initialized
    // 1: requesting
    // 2: loaded

    // create HTML iframe element
    var iframe = Util.Frame.createElement(id);

    // css classes
    YAHOO.util.Dom.addClass(iframe, 'contentFrame');
    //YAHOO.util.Dom.addClass(iframe, 'contentFrameHide');

    // attach events/dates/counters
    iframe.onLoading = new YAHOO.util.CustomEvent('loading', iframe, false, YAHOO.util.CustomEvent.FLAT);
    iframe.onLoaded = new YAHOO.util.CustomEvent('loaded', iframe, false, YAHOO.util.CustomEvent.FLAT);
    iframe.onAborted = new YAHOO.util.CustomEvent('aborted', iframe, false, YAHOO.util.CustomEvent.FLAT);
    iframe.onBeforeShow = new YAHOO.util.CustomEvent('beforeShow', iframe, false, YAHOO.util.CustomEvent.FLAT);
    iframe.onShow = new YAHOO.util.CustomEvent('show', iframe, false, YAHOO.util.CustomEvent.FLAT);
    iframe.onBeforeHide = new YAHOO.util.CustomEvent('beforeHide', iframe, false, YAHOO.util.CustomEvent.FLAT);
    iframe.onHide = new YAHOO.util.CustomEvent('hide', iframe, false, YAHOO.util.CustomEvent.FLAT);

    // add dates
    iframe.timestamps =
    {
        // The date-time that the iframe is created. This will be used to compute the load time.
        // This should be set exactly once for each iframe.
        createDate: new Date(),

        // The last load attempt that was made
        attemptDate: null,

        // Set this time as a result of the OnLoad callback function. Set exactly once for each iframe.
        loadDate: null,

        // Set this whenever the iframe is rendered to the student. If not already loaded, then this must be done upon OnLoad.
        showDate: null,

        // Set this whenever the iframe is hidden from the student.
        hideDate: null,

        // set this when the iframe gets timed out
        abortDate: null
    };

    // These start out at zero and are incremented as follows
    iframe.durationCounters =
    {
        loadTime: 0, // = LoadDate - AttemptDate
        visitTime: 0 // += LeaveDate - RenderDate
    };

    iframe.counters =
    {
        attemptCount: 0, // how many times the iframe is attempted to load
        loadCount: 0, // how many times the iframe successfully loaded
        showCount: 0, // how many times this iframe was shown
        hideCount: 0, // how many times this iframe was hidden
        abortCount: 0 // how many times this iframe failed to load
    };

    iframe.debug = function()
    {
        Util.dir(iframe.timestamps);
        Util.dir(iframe.durationCounters);
        Util.dir(iframe.counters);
    };

    // Create the script frame, making sure it's invisible, but not "display:none", 
    // which keeps some browsers from running code in it (Mozilla 1.3).
    // CODE: style.cssText = 'position:absolute; width:0; height:0; border:none';
    // CASE: When you try and doc.open() while display:none; it hangs in Mozilla 1.3
    // RELATED: https://bugzilla.mozilla.org/show_bug.cgi?id=90268

    // set iframe properties
    var config = {
        name: id,
        border: '0'
    };

    for (var i in config)
    {
        if (YAHOO.lang.hasOwnProperty(config, i))
        {
            iframe.setAttribute(i, config[i]);
        }
    }

    // Prevents mixed mode security in IE6/7.
    if (YAHOO.env.ua.ie) iframe.src = 'javascript:false;';
    else iframe.src = 'javascript:;';

    // Due to an IE6/7 refresh quirk, this must be an appendChild.
    parent.appendChild(iframe);

    // add new functionality to iframe
    this.addEnhancements(iframe);

    return iframe;
};

Util.Frame.addEnhancements = function(iframe)
{
    // add new functionality to iframes
    var enhancements =
    {
        abortTimer: null,

        loadState: 0,

        getDebugID: function()
        {
            return this.id.replace('iframe_', '')
        },

        // get the iframe ready to load
        _loadInit: function(timeout)
        {
            if (this.loadState == 1) return false;

            this.loadState = 1;

            var successCallback = function()
            {
                if (this.abortTimer != null) this.abortTimer.cancel();
                YUE.removeListener(this, 'load', successCallback);

                // check if timeout was already called
                if (this.loadState == -1) return;

                // set load date and time
                this.counters.loadCount++;
                this.timestamps.loadDate = new Date();
                this.durationCounters.loadTime = (this.timestamps.loadDate - this.timestamps.attemptDate);

                this.loadState = 2;
                this.onLoaded.fire(this);
            };

            var abortCallback = function()
            {
                // remove onload listener
                YUE.removeListener(this, 'load', successCallback);

                // check if already loaded
                if (this.loadState == 2) return;

                // stop the frame from loading
                this.abort();

                // set statistics
                this.counters.abortCount++;
                this.timestamps.abortDate = new Date();

                // fire event
                this.loadState = -1;
                this.onAborted.fire(this);
            };

            YUE.addListener(this, 'load', successCallback);

            this.onLoading.fire(this);

            if (timeout != null && timeout >= 0)
            {
                this.abortTimer = YAHOO.lang.later(timeout, this, abortCallback);
            }

            this.counters.attemptCount++;
            this.timestamps.attemptDate = new Date();

            return true;
        },

        abort: function()
        {
            try
            {
                // stop the frame from loading
                var frameWin = this.getWindow();
                frameWin.stop();
            }
            catch (ex) { };
        },

        // load iframe from a url
        load: function(url, timeout)
        {
            // get the iframe ready to load (if already loading then don't try and load again)
            if (!this._loadInit(timeout)) return false;

            Util.log('iframe ' + this.getDebugID() + ': formPost = ' + url);

            // get frame request container
            var frameRequestsID = 'frameRequests';
            var frameRequests = document.getElementById(frameRequestsID);

            // create frame request container if it does not exist
            if (frameRequests == null)
            {
                frameRequests = document.createElement('div');
                frameRequests.id = frameRequestsID;
                document.body.appendChild(frameRequests);
                YUD.setStyle(frameRequests, 'display', 'none');
            }

            // create form
            var form = document.createElement("form");
            frameRequests.appendChild(form);

            // set form properties
            form.enctype = form.encoding = "multipart/form-data";
            form.setAttribute('action', url);
            form.setAttribute('method', 'POST');
            form.setAttribute('target', this.id); // post form to iframe window

            // submit form which will render pages items (TestFrame.aspx)
            form.submit();
            return true;
        },

        // load iframe from html
        loadHtml: function(html, timeout)
        {
            // get the iframe ready to load (if already loading then don't try and load again)
            if (!this._loadInit(timeout)) return false;

            var doc = this.getDocument();
            doc.open();
            doc.write(html);
            doc.close();

            return true;
        },

        isShowing: function()
        {
            //return YUD.getStyle(this, 'display') == 'block';
            //return this.style.visibility != 'hidden';

            if (this.tagName != 'IFRAME' || this.nodeName != 'IFRAME')
            {
                Util.log('iframe: show error this is not a iframe');
            }

            return !YAHOO.util.Dom.hasClass(this, 'contentFrameHide');
        },

        // force the iframe to repaint/redraw it's contents (example css: forceRedraw{padding-bottom:1px;})
        forceRedraw: function()
        {
            var body = this.getBody();

            YUD.addClass(body, 'forceRedraw');

            setTimeout(function()
            {
                YUD.removeClass(body, 'forceRedraw');
            }, 1);
        },

        show: function()
        {
            if (this.isShowing())
            {
                Util.log('iframe: Trying to show a page that is currently showing.');
                return false;
            }

            var allow = this.onBeforeShow.fire(this);
            if (allow === false) return false;

            // set timestamps/counts
            this.timestamps.showDate = new Date();
            this.counters.showCount++;

            YAHOO.util.Dom.removeClass(this, 'contentFrameHide');
            this.onShow.fire(this);

            this.forceRedraw();

            return true;
        },

        hide: function()
        {
            if (!this.isShowing())
            {
                Util.log('iframe: Trying to hide a page that is currently hidden.');
                return false;
            }

            var allow = this.onBeforeHide.fire(this);
            if (allow === false) return false;

            // set timestamps/counts
            this.timestamps.hideDate = new Date();
            this.counters.hideCount++;
            this.durationCounters.visitTime += (this.timestamps.hideDate - this.timestamps.showDate);

            YAHOO.util.Dom.addClass(this, 'contentFrameHide');
            this.onHide.fire(this);

            return true;
        },

        getWindow: function()
        {
            return window[this.id];
        },

        getDocument: function()
        {
            var doc = null;

            try
            {
                if (iframe.contentDocument)
                {
                    // Firefox, Opera  
                    doc = iframe.contentDocument;
                }
                else if (iframe.contentWindow)
                {
                    // Internet Explorer  
                    doc = iframe.contentWindow.document;
                }
                else if (iframe.document)
                {
                    // Others?  
                    doc = iframe.document;
                }
            }
            catch (ex) { }

            return doc;
        },

        getBody: function()
        {
            return this.getDocument().body;
        },

        havePermission: function()
        {
            try
            {
                this.getDocument();
                return true;
            }
            catch (e)
            {
                return false;
            }
        }

    };

    Util.Object.mix(iframe, enhancements);
};

Util.Frame.BLANK_SOURCE = 'javascript:""';

Util.Frame.STYLES_ = 'border:0;vertical-align:bottom;';

/**
* Creates a completely blank iframe element.
*
* The iframe will not caused mixed-content warnings for IE6 under HTTPS.
* The iframe will also have no borders or padding, so that the styled width
* and height will be the actual width and height of the iframe.
*
* This function currently only attempts to create a blank iframe.  There
* are no guarantees to the contents of the iframe or whether it is rendered
* in quirks mode.
*
* @param {string=} opt_styles CSS styles for the iframe.
* @return {!HTMLIFrameElement} A completely blank iframe.
*/
Util.Frame.createBlank = function(opt_styles)
{
    return (Util.Dom.Builder.createDom('iframe', {
        'frameborder': 0,
        // Since iframes are inline elements, we must align to bottom to
        // compensate for the line descent.
        'style': Util.Frame.STYLES_ + (opt_styles || ''),
        'src': Util.Frame.BLANK_SOURCE
    }));
};


/**
* Writes the contents of a blank iframe that has already been inserted
* into the document.
* @param {!HTMLIFrameElement} iframe An iframe with no contents, such as
*     one created by goog.dom.iframe.createBlank, but already appended to
*     a parent document.
* @param {string} content Content to write to the iframe, from doctype to
*     the HTML close tag.
*/
Util.Frame.writeContent = function(iframe, content)
{
    var doc = Util.Dom.getFrameContentDocument(iframe);
    doc.open();
    doc.write(content);
    doc.close();
};


// TODO(user): Provide a higher-level API for the most common use case, so
// that you can just provide a list of stylesheets and some content HTML.
/**
* Creates a same-domain iframe containing preloaded content.
*
* This is primarily useful for DOM sandboxing.  One use case is to embed
* a trusted Javascript app with potentially conflicting CSS styles.  The
* second case is to reduce the cost of layout passes by the browser -- for
* example, you can perform sandbox sizing of characters in an iframe while
* manipulating a heavy DOM in the main window.  The iframe and parent frame
* can access each others' properties and functions without restriction.
*
* @param {!Element} parentElement The parent element in which to append the
*     iframe.
* @param {string=} opt_headContents Contents to go into the iframe's head.
* @param {string=} opt_bodyContents Contents to go into the iframe's body.
* @param {string=} opt_styles CSS styles for the iframe itself, before adding
*     to the parent element.
* @param {boolean=} opt_quirks Whether to use quirks mode (false by default).
* @return {HTMLIFrameElement} An iframe that has the specified contents.
*/
Util.Frame.createWithContent = function(parentElement, opt_headContents, opt_bodyContents, opt_styles, opt_quirks)
{
    // Generate the HTML content.
    var contentBuf = [];

    if (!opt_quirks)
    {
        contentBuf.push('<!DOCTYPE html>');
    }
    
    contentBuf.push('<html><head>', opt_headContents, '</head><body>', opt_bodyContents, '</body></html>');

    var iframe = Util.Frame.createBlank(opt_styles);

    // Cannot manipulate iframe content until it is in a document.
    parentElement.appendChild(iframe);
    Util.Frame.writeContent(iframe, contentBuf.join(''));

    return iframe;
};

// create a hidden iframe
Util.Frame.createHidden = function(id)
{
    var frame = Util.Frame.createElement(id);
    
    frame.setAttribute('border', '0');
    frame.setAttribute('frameBorder', '0');
    frame.setAttribute('width', '0');
    frame.setAttribute('marginWidth', '0');
    frame.setAttribute('height', '0');
    frame.setAttribute('marginHeight', '0');
    frame.setAttribute('leftMargin', '0');
    frame.setAttribute('topMargin', '0');
    frame.setAttribute('allowTransparency', 'false');
    
    var style = 'width:0px; height:0px; border: 0px; visibility: hidden; display:block;';
    frame.setAttribute('style', style);
    frame.src = (YAHOO.env.ua.ie) ? 'javascript:false;' : 'javascript:;';

    return frame;
};

// create and add a applet to the page in a hidden iframe
Util.Frame.injectApplet = function(id, config)
{
    var frame = Util.Frame.createHidden(id);
    document.body.appendChild(frame);

    // create html to go in iframe
    var script_cookie = '<script type="text/javascript">function getCookies() { return document.cookie; }</script>';

    var script_events = '<script type="text/javascript">function tdsFireEvent(id, name, event, data, sequenceNumber, logSeqNumber) { setTimeout(function() { if (typeof(parent.{callback}) != "function") return; parent.{callback}(document.getElementById(id), event, data, sequenceNumber, logSeqNumber); }, 0); }</script>';
    script_events = YAHOO.lang.substitute(script_events, config);

    var appletHtml = '<applet id="{id}" name="{id}" archive="{archive}" codebase="{codebase}" code="{code}" mayscript="true" scriptable="true"><param value="{id}" name="id"/></applet>';
    appletHtml = YAHOO.lang.substitute(appletHtml, config);

    var frameHtml = '<html><head>' + script_cookie + script_events + '</head><body>' + appletHtml + '</body></html>';

    // write to iframe
    var frameDoc = frame.contentDocument ? frame.contentDocument : frame.contentWindow ? frame.contentWindow.document : frame.document;
    frameDoc.open();
    frameDoc.write(frameHtml);
    frameDoc.close();

    return frameDoc.getElementById(config.id);
};

// create and add a embed plugin to the page in a hidden iframe
Util.Frame.injectEmbed = function(id, type)
{
    var frame = Util.Frame.createHidden(id);
    document.body.appendChild(frame);

    var embedHtml = '<embed type="{type}"></embed>';
    embedHtml = YAHOO.lang.substitute(embedHtml, {
        type: type
    });

    var frameHtml = '<html><head></head><body>' + embedHtml + '</body></html>';

    // write to iframe
    var frameDoc = frame.contentDocument ? frame.contentDocument : frame.contentWindow ? frame.contentWindow.document : frame.document;
    frameDoc.open();
    frameDoc.write(frameHtml);
    frameDoc.close();

    return frameDoc.getElementsByTagName('embed')[0];
};

// returns the html that can used for an iframe
Util.Frame.createHtml = function(bodyHtml, options)
{
    // frameOptions: docType, baseURI, scripts, styles, bodyHtml, callbackName
    options = options || {};
    var html = [];

    // add doc type (or we use default)
    if (!YAHOO.lang.isObject(options.docType))
    {
        options.docType = Util.Frame.DOCTYPE_XHTML1_TRANSITIONAL;
    }

    html.push(options.docType);
    
    // add html
    html.push('<html xmlns="http://www.w3.org/1999/xhtml">');
    html.push('<head>');
    html.push('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />');
    
    // set frames base url (used to resolve resources)
    if (!YAHOO.lang.isObject(options.baseURI))
    {
        options.baseURI = document.baseURI || document.URL;
    }
    
    var frameURI = options.baseURI.replace(/[^/]*$/, '');
    html.push('<base href="' + frameURI + '" />');
    
    // set frames scripts
    if (YAHOO.lang.isArray(options.scripts))
    {
        Util.Array.each(options.scripts, function(script)
        {
            html.push('<script type="text/javascript" src="' + script + '"></script>');
        });
    }

    // set frames styles
    if (YAHOO.lang.isArray(options.styles))
    {
        Util.Array.each(options.styles, function(style)
        {
            html.push('<link type="text/css" rel="stylesheet" href="' + style + '" />');
        });
    }
    
    html.push('</head>');

    // if there is a callback function name then call it on the parent when frame loads
    if (YAHOO.lang.isString(options.callbackName))
    {
        html.push('<body onload="setTimeout(function() { parent.' + options.callbackName + '(this); }, 0);"');
    }
    else
    {
        html.push('<body>');
    }
    
    // set body html
    if (YAHOO.lang.isString(bodyHtml)) html.push(bodyHtml);
    
    html.push('</body></html>');

    return html.join('');
};

Util.Frame.loadInBackground = function (src, parent) {
    var iframe = $('<iframe>').attr({
        src: src,
        style: 'display:none;'
    });

    var deferred = Util.Promise.defer();

    iframe.load(function () {
        // pass the iframe to the handler
        deferred.resolve(iframe);
    });

    iframe.appendTo(parent || document.body);

    return deferred.promise;
};
