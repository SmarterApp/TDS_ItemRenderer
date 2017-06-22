//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// this dialog renders a student's previously saved response values
// the dialog allows them to select one previous response to restore

TestShell.ResponseRecovery.Dialog = function () {
    this._context = null;
    this._deferred = null;
    this._focused = $();
};

TestShell.ResponseRecovery.Dialog.templates = {
    container: '<div id="tool-timeMachine">',

    drafts: '<div class="draftsPanel">',

    menuHeader: '<h1 class="invisible" aria-hidden="false" id="draftsLabel">{0}</h1>',
    menu: '<div role="application" class="menu" tabindex="0">',
    sessionList: '<ul class="sittingList" role="tree" aria-labelledby="draftsLabel">',

    session: '<li class="groupHeader" role="treeitem" tabindex="-1">',
    sessionLabel: '<h2 class="response-recovery-session"><button />{0}</h2>',
    versionList: '<ul class="versionList" role="group">',

    version: '<li role="treeitem" tabindex="-1">{0}</li>',

    preview: '<div class="previewPanel">{0}</div>',

    notification: '{0}'
};

TestShell.ResponseRecovery.Dialog.selectors = {
    menu: '.menu',
    session: 'li.groupHeader',
    sessionList: 'ul.versionList',
    version: 'ul.versionList li',
    focusable: 'li',
    focused: 'li.focus',
    expanded: '.expanded',
    preview: '.previewPanel'
};

TestShell.ResponseRecovery.Dialog.prototype = {
    _getDialog: (function () {
        var _dialog = null;

        function onShow() {
            TDS.Dialog.onShow();
        }

        function onHide() {
            TDS.Dialog.onHide();
        }

        // remove YUI dialog config
        function removeConfig(name) {
            delete _dialog.cfg.config[name];
            var eventIdx = Util.Array.findIndex(_dialog.cfg.eventQueue, function (params) {
                return (params && params[0] == name);
            });
            if (eventIdx >= 0) {
                Util.Array.removeAt(_dialog.cfg.eventQueue, eventIdx);
            }
        }

        return function () {
            if (!_dialog) {
                _dialog = new YAHOO.widget.Dialog('dialogResponseRecovery', {
                    visible: false,
                    draggable: false,
                    modal: true,
                    constraintoviewport: true,
                    close: false,
                    fixedcenter: true,
                    zindex: 999,
                    postmethod: 'none',
                    autofillheight: false
                });

                // override standard focusable elements so that we include elements with tabindices
                _dialog.getFocusableElements = function (root) {

                    root = root || this.innerElement;

                    var focusable = {};
                    for (var i = 0; i < YAHOO.widget.Panel.FOCUSABLE.length; i++) {
                        focusable[YAHOO.widget.Panel.FOCUSABLE[i]] = true;
                    }

                    function isFocusable(el) {
                        if (el.focus && el.type !== "hidden" && !el.disabled && (focusable[el.tagName.toLowerCase()] || (typeof el.tabIndex === 'number' && el.tabIndex >= 0))) {
                            return true;
                        }
                        return false;
                    }

                    // Not looking by Tag, since we want elements in DOM order
                    return YAHOO.util.Dom.getElementsBy(isFocusable, null, root);
                };

                // allows esc to work on all platforms
                TDS.ToolManager._overlayManager.register(_dialog);

                // add css
                _dialog.showEvent.subscribe(onShow);
                _dialog.hideEvent.subscribe(onHide);

                // set dimensions
                _dialog.beforeShowEvent.subscribe(function () {
                    _dialog.cfg.setProperty('width', YUD.getStyle(_dialog.innerElement, 'width'));
                    _dialog.cfg.setProperty('height', YUD.getStyle(_dialog.innerElement, 'height'));
                });

                // these are called when rendered and creates the form
                removeConfig('postdata');
                removeConfig('postmethod');

                // this is called when setting the body and updates the form
                _dialog.changeBodyEvent.unsubscribeAll();

                // set header
                var header = Messages.getAlt('ResponseRecovery.header', 'Response Recovery');
                _dialog.setHeader(header);
            }

            return _dialog;
        };
    })(),

    _onClose: function () {
        var dialog = this._getDialog();
        dialog.hide();

        // cleanup the dialog html, so that all event handlers are cleaned up
        $(dialog.body).remove();

        this._context = null;
        this._deferred = null;
    },

    _formatSessionLabel: function (session) {
        return YAHOO.lang.substitute(TestShell.ResponseRecovery.messages.dialogSessionLabel, session);
    },

    _formatVersionLabel: function (version) {
        return YAHOO.lang.substitute(TestShell.ResponseRecovery.messages.dialogVersionLabel, version);
    },

    _renderHtml: function (history) {
        var templates = TestShell.ResponseRecovery.Dialog.templates,
            messages = TestShell.ResponseRecovery.messages,
            self = this;

        var $container = $(templates.container);

        var $drafts = $(templates.drafts).appendTo($container);
        $drafts.append(Util.String.format(templates.menuHeader, messages.dialogMenuHeader));

        // create the html for the version selector
        var menu = $(templates.menu).appendTo($drafts);

        var tree = $(templates.sessionList).appendTo(menu);

        history.sessions.reverse();
        history.sessions.forEach(function (session) {
            var item = $(templates.session).appendTo(tree);
            item.append(Util.String.format(templates.sessionLabel, this._formatSessionLabel(session)));

            var group = $(templates.versionList).appendTo(item);

            session.versions.reverse();
            session.versions.forEach(function (version) {
                var item = $(Util.String.format(templates.version, this._formatVersionLabel(version)));

                item.data({
                    sessionId: session.id,
                    sequence: version.sequence
                });

                item.appendTo(group);
            }.bind(this));
        }.bind(this));

        // create the html for the response previewer
        $container.append(Util.String.format(templates.preview, messages.previewPlaceholder));

        // TODO: add notification to UI
        var notification;
        if (!history.hasCompleteHistory) {
            notification = Util.String.format(templates.notification, messages.loadFailure);
        } else if (!history.hasRecoverableVersions) {
            notification = Util.String.format(templates.notification, messages.noHistory);
        }

        return $container;
    },

    _bindEvents: function (history, $container) {
        var self = this,
            selectors = TestShell.ResponseRecovery.Dialog.selectors;

        var $preview = $container.find(selectors.preview);

        // focus handler for menu
        $container.find(selectors.menu).on('focus', function (event) {
            self._focused.focus();
        });

        // click handlers for session items
        $container.find(selectors.session).on('dblclick', function (event) {
            var $this = $(this);
            self._toggle($this);

            event.stopPropagation();
        });

        // click handlers for version items
        $container.find(selectors.version).on('click', function (event) {
            var $this = $(this);

            // when a version is clicked, show its value in the preview
            var data = $this.data(),
                version = history.getVersion(data.sessionId, data.sequence);

            version.getValue(self._context.parameters).done(function (value) {
                $preview.html(value);
            });

            // save the version so that we can restore its value if Submit is called
            self._context.selectedVersion = version;

            event.stopPropagation();
        });

        var focusables = $container.find(selectors.focusable);

        focusables.on('focus', function (event) {
            // unstyle the old focused element
            self._focused.removeClass('focus');

            // add the focus class for styling, and make it reachable by tab
            var $this = $(this).addClass('focus');
            self._focused = $this;

            event.stopPropagation();
        });

        focusables.each(function (index, element) {
            var $element = $(element);

            $element.on('keydown', function (event) {
                var newIndex, $newElement,
                    key = event.which;

                if (key === 13) {
                    if ($element.is(selectors.session)) {
                        // enter expands/collapses the session
                        key = $element.is(selectors.expanded) ? 37 : 39;
                    } else {
                        // enter shows the focused version
                        key = 39;
                        $element.click();
                    }
                }

                switch (key) {
                    case 37:    // left
                        if ($element.is(selectors.expanded)) {
                            self._toggle($element);
                        } else {
                            $newElement = $element.parents(selectors.session);
                            $newElement.focus();
                        }

                        break;

                    case 38:    // up
                        newIndex = Math.max(index - 1, 0);
                        $newElement = focusables.eq(newIndex);
                        $newElement.focus();

                        break;

                    case 39:    // right
                        if ($element.is(selectors.session)) {
                            if (!$element.is(selectors.expanded)) {
                                self._toggle($element);
                            } else {
                                newIndex = Math.min(index + 1, focusables.length - 1);
                                $newElement = focusables.eq(newIndex);
                                $newElement.focus();
                            }
                        }

                        break;

                    case 40:    // down
                        newIndex = Math.min(index + 1, focusables.length - 1);
                        $newElement = focusables.eq(newIndex);
                        $newElement.focus();

                        break;

                    default:
                        key = 0;
                        break;
                }

                if (key) {
                    event.stopPropagation();
                    event.preventDefault();
                }
            });
        });
    },

    _toggle: function ($item) {
        var selectors = TestShell.ResponseRecovery.Dialog.selectors;

        var isExpanded = $item.attr('aria-expanded') !== 'false';

        if (isExpanded) {
            $item.attr('aria-expanded', 'false')
                 .removeClass('expanded')
                 .find(selectors.sessionList).hide();
        } else {
            $item.attr('aria-expanded', 'true')
                 .addClass('expanded')
                 .find(selectors.sessionList).show();
        }
    },

    _render: function (history) {
        var $container = this._renderHtml(history);

        // wire up the ui events
        this._bindEvents(history, $container);

        var sessions = $container.find(TestShell.ResponseRecovery.Dialog.selectors.session),
            versions = $container.find(TestShell.ResponseRecovery.Dialog.selectors.version);

        // focus the first
        this._focused = sessions.first().focus();

        // hide all but the focused one
        this._focused.attr('aria-expanded', 'false');
        sessions.each(function (index, element) {
            this._toggle($(element));
        }.bind(this));

        // mark the first session/version as active
        sessions.first().addClass('active');
        versions.first().addClass('active');

        return $container[0];
    },

    _submit: function () {
        var version = this._context.selectedVersion,
            item = this._context.item,
            parameters = this._context.parameters,
            self = this;

        version.getValue(parameters).then(function (value) {
            item.getContentItem().setResponse(value);

            // get a ref to the deferred, because it will be cleaned up by onClose
            var deferred = self._deferred;

            // close the dialog
            self._onClose();

            // now begin resolving the promise chain
            deferred.resolve();
        });
    },

    _cancel: function () {
        this._deferred.reject();
        this._onClose();
    },

    update: function (history, item, pageKey, itemId, position) {
        this._context = {
            item: item,
            parameters: { pageKey: pageKey, itemId: itemId, position: position },
            selectedVersion: null
        }

        var dialog = this._getDialog();

        var contents = this._render(history);
        dialog.setBody(contents);

        dialog.cfg.queueProperty("buttons", [
            { text: TestShell.ResponseRecovery.messages.dialogCancel, handler: { fn: this._cancel.bind(this), scope: this } },
            { text: TestShell.ResponseRecovery.messages.dialogSubmit, handler: { fn: this._submit.bind(this), scope: this }, isDefault: true }
        ]);

        // render dialog
        dialog.render('dialogs');

        TDS.Dialog.fixTabLoop(dialog, true);
    },

    show: function () {
        if (!this._deferred) {
            this._deferred = Util.Promise.defer();
            this._getDialog().show();
        }

        return this._deferred.promise;
    },

    hide: function () {
        this._cancel();
    }
};
