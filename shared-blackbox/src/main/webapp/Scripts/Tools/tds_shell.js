/*
Load up test shell settings.
*/

TDS.Shell = (function (TDS) {

    var shell = {
        name: null,
        allowFocus: false
    };

    // helper function for adding a dom onclick event
    function addClick(id, callback) {

        var target = YUD.get(id);
        if (target == null) {
            return false;
        }

        // disable targets ability to get focus
        if (!shell.allowFocus && window.ContentManager.enableARIA === false) {

            target.setAttribute('tabindex', '-1');

            // BUG #63493: If you stop mousedown on <select> in Chrome/Firefox16+ then it won't open
            if (target.tagName != 'SELECT') {
                // disable links from getting focus when clicked
                YUE.on(target, 'mousedown', function(evt) {
                    YUE.stopEvent(evt);
                });
                YUE.on(target, 'mouseup', function(evt) {
                    YUE.stopEvent(evt);
                });
            }
        }

        YUE.on(target, 'click', function (evt) {

            // stop click event on links
            if (target.nodeName == 'A' || target.nodeName == 'SELECT') {
                YUE.stopEvent(evt);
            }

            // if the button is not disabled then execute callback
            if (YUD.getAttribute(target, 'disabled') != 'disabled') {
                callback.call(this, evt);
            }

        }, this, true);

        return true;
    }

    function enableButton(id) {
        var btnEl = YUD.get(id);
        if (btnEl) {
            $(btnEl).parent().removeClass('inactive');
            $(btnEl).parent().addClass('active');
            btnEl.setAttribute('aria-disabled', 'false');
        }
    }

    function disableButton(id) {
        var btnEl = YUD.get(id);
        if (btnEl) {
            $(btnEl).parent().removeClass('active');
            $(btnEl).parent().addClass('inactive');
            btnEl.setAttribute('aria-disabled', 'true');
        }
    }

    function showButton(id) {
        var btnEl = YUD.get(id);
        if (btnEl) {
            $(btnEl).parent().show();
            btnEl.setAttribute('aria-hidden', 'false');
        }
    }

    function hideButton(id) {
        var btnEl = YUD.get(id);
        if (btnEl) {
            $(btnEl).parent().hide();
            btnEl.setAttribute('aria-hidden', 'true');
        }
    }

    /*
    Button options:
    id = Unique id assigned to the button.
    classname = Class name assigned to the button.
    fn = The function that is called when button is clicked.
    text = The text assigned to the label.
    i18n = The i18n message used for the label (higher priority than text).
    inactive = If true then inactive class is added.
    hidden = If true then the button is hidden.
    */

    function processButton(linkEl, options) {

        if (options.inactive) {
            disableButton(linkEl);
        } else {
            enableButton(linkEl);
        }

        if (options.hidden) {
            hideButton(linkEl);
        } else {
            showButton(linkEl);
        }

        // add handler
        if (YAHOO.lang.isFunction(options.fn)) {
            addClick(linkEl, options.fn);
        }
    }
    
    function createButton(parentId, options) {

        // get the parent
        var ulEl = YUD.get(parentId);
        if (ulEl == null) {
            return null;
        }
        
        var liEl = document.createElement('li');

        // create <a> button
        var linkEl = document.createElement('a');

        // set id (used for styling)
        if (options.id) {
            linkEl.id = options.id;
        }

        // set class name (used by global context menu)
        var classname = options.classname || options.className; // prefer 'classname'
        if (classname) {
            $(linkEl).addClass(classname);
        }

        if (options.allowFocus) {
            linkEl.setAttribute('tabindex', '0');
        } else {
            linkEl.setAttribute('tabindex', '-1');
        }

        YUD.setAttribute(linkEl, 'href', '#');
        YUD.setAttribute(linkEl, 'role', 'button');

        liEl.appendChild(linkEl);

        // create icon <span>
        var iconEl = document.createElement('span');
        iconEl.className = 'icon';
        linkEl.appendChild(iconEl);

        // create label <span> in universal
        var labelEl;
        if (shell.name == 'universal') {
            labelEl = document.createElement('span');
            labelEl.className = 'label';
            linkEl.appendChild(labelEl);
        } else {
            // older shells just use icon as the label
            labelEl = iconEl;
        }

        // set label
        var text = options.text || options.label; // prefer 'text'
        if (options.i18n) {
            labelEl.innerHTML = Messages.getAlt(options.i18n, text);
        } else if (text) {
            labelEl.innerHTML = text;
        }

        // add button to list
        ulEl.appendChild(liEl);

        return linkEl;
    };

    function addButton(parentId, options) {
        
        // id, label, className, fn
        options = options || {};
        if (typeof options.allowFocus != 'boolean') {
            options.allowFocus = shell.allowFocus;
        }

        // check if link already exists
        var linkEl = null;
        if (options.id) {
            linkEl = document.getElementById(options.id);
        }

        if (!linkEl) {
            linkEl = createButton(parentId, options);
        }

        processButton(linkEl, options);

        return linkEl;
    };

    var addTool = addButton.bind(shell, 'studentTools');
    var addControl = addButton.bind(shell, 'studentControls');

    // call this to process json config for buttons
    function processConfig(config) {

        var toolbar = config.toolbars[shell.name] || config.toolbars['modern'];

        toolbar.controls.forEach(function(name) {
            var button = config.controls[name];
            addControl(button);
        });

        toolbar.tools.forEach(function (name) {
            var button = config.tools[name];
            addTool(button);
        });

    }
    
    // exports
    shell.enableButton = enableButton;
    shell.disableButton = disableButton;
    shell.showButton = showButton;
    shell.hideButton = hideButton;
    shell.addTool = addTool;
    shell.addControl = addControl;
    shell.addClick = addClick;
    shell.processConfig = processConfig;

    // The <select> of pages
    shell.getNavigationEl = function () {
        return document.getElementById('ddlNavigation');
    }

    // Button used to go to a page
    shell.getJumpEl = function () {
        return document.getElementById('jumpGo');
    }

    // The help element
    shell.getHelpEl = function () {
        return document.getElementById('btnHelp');
    }

    // The settings element
    shell.getSettingsEl = function () {
        return document.getElementById('btnSettings');
    }

    shell.getSoundCuesEl = function () {
        return document.getElementById('soundCues');
    }

    shell.getContentsEl = function () {
        return document.getElementById('contents');
    }
    
    shell.setSessionName = function(text) {
        $('.sessionID').html(text);
    }

    shell.setStudentName = function(text) {
        $('#ot-studentInfo, .studentInfo').html(text);
    }

    return shell;

})(window.TDS);