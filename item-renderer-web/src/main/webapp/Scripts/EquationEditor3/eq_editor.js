//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
(function () {
    var P = (function (prototype, ownProperty, undefined) {
        // helper functions that also help minification
        function isObject(o) { return typeof o === 'object'; }
        function isFunction(f) { return typeof f === 'function'; }

        function P(_superclass /* = Object */, definition) {
            // handle the case where no superclass is given
            if (definition === undefined) {
                definition = _superclass;
                _superclass = Object;
            }

            // C is the class to be returned.
            // There are three ways C will be called:
            //
            // 1) We call `new C` to create a new uninitialized object.
            //    The behavior is similar to Object.create, where the prototype
            //    relationship is set up, but the ::init method is not run.
            //    Note that in this case we have `this instanceof C`, so we don't
            //    spring the first trap. Also, `args` is undefined, so the initializer
            //    doesn't get run.
            //
            // 2) A user will simply call C(a, b, c, ...) to create a new object with
            //    initialization.  This allows the user to create objects without `new`,
            //    and in particular to initialize objects with variable arguments, which
            //    is impossible with the `new` keyword.  Note that in this case,
            //    !(this instanceof C) springs the return trap at the beginning, and
            //    C is called with the `new` keyword and one argument, which is the
            //    Arguments object passed in.
            //
            // 3) For internal use only, if new C(args) is called, where args is an
            //    Arguments object.  In this case, the presence of `new` means the
            //    return trap is not sprung, but the initializer is called if present.
            //
            //    You can also call `new C([a, b, c])`, which is equivalent to `C(a, b, c)`.
            //
            //  TODO: the Chrome inspector shows all created objects as `C` rather than `Object`.
            //        Setting the .name property seems to have no effect.  Is there a way to override
            //        this behavior?
            function C(args) {
                var self = this;
                if (!(self instanceof C)) return new C(arguments);
                if (args && isFunction(self.init)) self.init.apply(self, args);
            }

            // set up the prototype of the new class
            // note that this resolves to `new Object`
            // if the superclass isn't given
            var proto = C[prototype] = C.fn = new _superclass();

            // other variables, as a minifier optimization
            var _super = _superclass[prototype];
            var extensions;

            // set the constructor property on the prototype, for convenience
            proto.constructor = C;

            C.mixin = function (def) {
                C[prototype] = P(C, def)[prototype];
                return C;
            }

            return (C.open = function (def) {
                extensions = {};

                if (isFunction(def)) {
                    // call the defining function with all the arguments you need
                    // extensions captures the return value.
                    extensions = def.call(C, proto, _super, C, _superclass);
                }
                else if (isObject(def)) {
                    // if you passed an object instead, we'll take it
                    extensions = def;
                }

                // ...and extend it
                if (isObject(extensions)) {
                    for (var ext in extensions) {
                        if (ownProperty.call(extensions, ext)) {
                            proto[ext] = extensions[ext];
                        }
                    }
                }

                // if there's no init, we assume we're inheriting a non-pjs class, so
                // we default to applying the superclass's constructor.
                if (!isFunction(proto.init)) {
                    proto.init = function () { _superclass.apply(this, arguments); };
                }

                return C;
            })(definition);
        }

        // ship it
        return P;

        // as a minifier optimization, we've closured in a few helper functions
        // and the string 'prototype' (C[p] is much shorter than C.prototype)
    })('prototype', ({}).hasOwnProperty);/**
 * Copyleft 2010-2011 Jay and Han (laughinghan@gmail.com)
 *   under the GNU Lesser General Public License
 *     http://www.gnu.org/licenses/lgpl.html
 * Project Website: http://mathquill.com
 */

    (function () {

        var $ = jQuery,
          undefined,
          _, //temp variable of prototypes
          mqCmdId = 'mathquill-command-id',
          mqBlockId = 'mathquill-block-id',
          min = Math.min,
          max = Math.max;

        var __slice = [].slice;

        function noop() { }

        /**
         * sugar to make defining lots of commands easier.
         * TODO: rethink this.
         */
        function bind(cons /*, args... */) {
            var args = __slice.call(arguments, 1);
            return function () {
                return cons.apply(this, args);
            };
        }

        /**
         * a development-only debug method.  This definition and all
         * calls to `pray` will be stripped from the minified
         * build of mathquill.
         *
         * This function must be called by name to be removed
         * at compile time.  Do not define another function
         * with the same name, and only call this function by
         * name.
         */
        function pray(message, cond) {
            if (!cond) throw new Error('prayer failed: ' + message);
        }
        var P = (function (prototype, ownProperty, undefined) {
            // helper functions that also help minification
            function isObject(o) { return typeof o === 'object'; }
            function isFunction(f) { return typeof f === 'function'; }

            function P(_superclass /* = Object */, definition) {
                // handle the case where no superclass is given
                if (definition === undefined) {
                    definition = _superclass;
                    _superclass = Object;
                }

                // C is the class to be returned.
                // There are three ways C will be called:
                //
                // 1) We call `new C` to create a new uninitialized object.
                //    The behavior is similar to Object.create, where the prototype
                //    relationship is set up, but the ::init method is not run.
                //    Note that in this case we have `this instanceof C`, so we don't
                //    spring the first trap. Also, `args` is undefined, so the initializer
                //    doesn't get run.
                //
                // 2) A user will simply call C(a, b, c, ...) to create a new object with
                //    initialization.  This allows the user to create objects without `new`,
                //    and in particular to initialize objects with variable arguments, which
                //    is impossible with the `new` keyword.  Note that in this case,
                //    !(this instanceof C) springs the return trap at the beginning, and
                //    C is called with the `new` keyword and one argument, which is the
                //    Arguments object passed in.
                //
                // 3) For internal use only, if new C(args) is called, where args is an
                //    Arguments object.  In this case, the presence of `new` means the
                //    return trap is not sprung, but the initializer is called if present.
                //
                //    You can also call `new C([a, b, c])`, which is equivalent to `C(a, b, c)`.
                //
                //  TODO: the Chrome inspector shows all created objects as `C` rather than `Object`.
                //        Setting the .name property seems to have no effect.  Is there a way to override
                //        this behavior?
                function C(args) {
                    var self = this;
                    if (!(self instanceof C)) return new C(arguments);
                    if (args && isFunction(self.init)) self.init.apply(self, args);
                }

                // set up the prototype of the new class
                // note that this resolves to `new Object`
                // if the superclass isn't given
                var proto = C[prototype] = new _superclass();

                // other variables, as a minifier optimization
                var _super = _superclass[prototype];
                var extensions;

                // set the constructor property on the prototype, for convenience
                proto.constructor = C;

                C.mixin = function (def) {
                    C[prototype] = P(C, def)[prototype];
                    return C;
                }

                return (C.open = function (def) {
                    extensions = {};

                    if (isFunction(def)) {
                        // call the defining function with all the arguments you need
                        // extensions captures the return value.
                        extensions = def.call(C, proto, _super, C, _superclass);
                    }
                    else if (isObject(def)) {
                        // if you passed an object instead, we'll take it
                        extensions = def;
                    }

                    // ...and extend it
                    if (isObject(extensions)) {
                        for (var ext in extensions) {
                            if (ownProperty.call(extensions, ext)) {
                                proto[ext] = extensions[ext];
                            }
                        }
                    }

                    // if there's no init, we assume we're inheriting a non-pjs class, so
                    // we default to applying the superclass's constructor.
                    if (!isFunction(proto.init)) {
                        proto.init = function () { _superclass.apply(this, arguments); };
                    }

                    return C;
                })(definition);
            }

            // ship it
            return P;

            // as a minifier optimization, we've closured in a few helper functions
            // and the string 'prototype' (C[p] is much shorter than C.prototype)
        })('prototype', ({}).hasOwnProperty);
        /*************************************************
         * Textarea Manager
         *
         * An abstraction layer wrapping the textarea in
         * an object with methods to manipulate and listen
         * to events on, that hides all the nasty cross-
         * browser incompatibilities behind a uniform API.
         *
         * Design goal: This is a *HARD* internal
         * abstraction barrier. Cross-browser
         * inconsistencies are not allowed to leak through
         * and be dealt with by event handlers. All future
         * cross-browser issues that arise must be dealt
         * with here, and if necessary, the API updated.
         *
         * Organization:
         * - key values map and stringify()
         * - manageTextarea()
         *    + defer() and flush()
         *    + event handler logic
         *    + attach event handlers and export methods
         ************************************************/

        var manageTextarea = (function () {
            // The following [key values][1] map was compiled from the
            // [DOM3 Events appendix section on key codes][2] and
            // [a widely cited report on cross-browser tests of key codes][3],
            // except for 10: 'Enter', which I've empirically observed in Safari on iOS
            // and doesn't appear to conflict with any other known key codes.
            //
            // [1]: http://www.w3.org/TR/2012/WD-DOM-Level-3-Events-20120614/#keys-keyvalues
            // [2]: http://www.w3.org/TR/2012/WD-DOM-Level-3-Events-20120614/#fixed-virtual-key-codes
            // [3]: http://unixpapa.com/js/key.html
            var KEY_VALUES = {
                8: 'Backspace',
                9: 'Tab',

                10: 'Enter', // for Safari on iOS

                13: 'Enter',

                16: 'Shift',
                17: 'Control',
                18: 'Alt',
                20: 'CapsLock',

                27: 'Esc',

                32: 'Spacebar',

                33: 'PageUp',
                34: 'PageDown',
                35: 'End',
                36: 'Home',

                37: 'Left',
                38: 'Up',
                39: 'Right',
                40: 'Down',

                45: 'Insert',

                46: 'Del',

                144: 'NumLock'
            };

            // To the extent possible, create a normalized string representation
            // of the key combo (i.e., key code and modifier keys).
            function stringify(evt) {
                var which = evt.which || evt.keyCode;
                var keyVal = KEY_VALUES[which];
                var key;
                var modifiers = [];

                if (evt.ctrlKey) modifiers.push('Ctrl');
                if (evt.originalEvent && evt.originalEvent.metaKey) modifiers.push('Meta');
                if (evt.altKey) modifiers.push('Alt');
                if (evt.shiftKey) modifiers.push('Shift');

                key = keyVal || String.fromCharCode(which);

                if (!modifiers.length && !keyVal) return key;

                modifiers.push(key);
                return modifiers.join('-');
            }

            // create a textarea manager that calls callbacks at useful times
            // and exports useful public methods
            return function manageTextarea(el, opts) {
                if (!el.is('textarea')) return { select: noop };
                var keydown = null;
                var keypress = null;

                if (!opts) opts = {};
                var textCallback = opts.text || noop;
                var keyCallback = opts.key || noop;
                var pasteCallback = opts.paste || noop;
                var onCut = opts.cut || noop;

                var textarea = $(el);
                var target = $(opts.container || textarea);

                // defer() runs fn immediately after the current thread.
                // flush() will run it even sooner, if possible.
                // flush always needs to be called before defer, and is called a
                // few other places besides.
                var timeout, deferredFn;

                function defer(fn) {
                    timeout = setTimeout(fn);
                    deferredFn = fn;
                }

                function flush() {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = undefined;
                        deferredFn();
                    }
                }

                target.bind('keydown keypress input keyup focusout paste', flush);


                // -*- public methods -*- //
                function select(text) {
                    flush();

                    textarea.val(text);
                    if (text) textarea[0].select();
                }

                // -*- helper subroutines -*- //

                // Determine whether there's a selection in the textarea.
                // This will always return false in IE < 9, which don't support
                // HTMLTextareaElement::selection{Start,End}.
                function hasSelection() {
                    var dom = textarea[0];

                    if (!('selectionStart' in dom)) return false;
                    return dom.selectionStart !== dom.selectionEnd;
                }

                function popText(callback) {
                    var text = textarea.val();
                    textarea.val('');
                    if (text) callback(text);
                }

                function handleKey() {
                    keyCallback(stringify(keydown), keydown);
                }

                // -*- event handlers -*- //
                function onKeydown(e) {
                    keydown = e;
                    keypress = null;

                    handleKey();
                }

                function onKeypress(e) {
                    // call the key handler for repeated keypresses.
                    // This excludes keypresses that happen directly
                    // after keydown.  In that case, there will be
                    // no previous keypress, so we skip it here
                    if (keydown && keypress) handleKey();

                    keypress = e;

                    defer(function () {
                        // If there is a selection, the contents of the textarea couldn't
                        // possibly have just been typed in.
                        // This happens in browsers like Firefox and Opera that fire
                        // keypress for keystrokes that are not text entry and leave the
                        // selection in the textarea alone, such as Ctrl-C.
                        // Note: we assume that browsers that don't support hasSelection()
                        // also never fire keypress on keystrokes that are not text entry.
                        // This seems reasonably safe because:
                        // - all modern browsers including IE 9+ support hasSelection(),
                        //   making it extremely unlikely any browser besides IE < 9 won't
                        // - as far as we know IE < 9 never fires keypress on keystrokes
                        //   that aren't text entry, which is only as reliable as our
                        //   tests are comprehensive, but the IE < 9 way to do
                        //   hasSelection() is poorly documented and is also only as
                        //   reliable as our tests are comprehensive
                        // If anything like #40 or #71 is reported in IE < 9, see
                        // b1318e5349160b665003e36d4eedd64101ceacd8

                        //updated by Eli
                        //in Safari, when text is selected inside of the textarea
                        //and then a key is pressed, there's a brief moment where
                        //the new text is selected. This circumvents that problem, by
                        //trying again a moment later
                        //this should be a no-op except in Safari
                        //NOTE / TODO: this still seems to introduce a problem with vertical
                        //alignment. In DCG, try:
                        // * type "1"
                        // * highlight the "1"
                        // * type "/"
                        // note that vertical alignment of the icon is broken
                        // it's only fixed when another action is taken that changes
                        // vertical alignment (i.e. a division inside of one of the
                        // division signs)
                        if (hasSelection()) {
                            setTimeout(function () {
                                if (!hasSelection())
                                    popText(textCallback);
                            });
                        } else {
                            popText(textCallback);
                        }

                        if (hasSelection()) return;

                        popText(textCallback);
                    });
                }

                function onBlur() { keydown = keypress = null; }

                function onPaste(e) {
                    // browsers are dumb.
                    //
                    // In Linux, middle-click pasting causes onPaste to be called,
                    // when the textarea is not necessarily focused.  We focus it
                    // here to ensure that the pasted text actually ends up in the
                    // textarea.
                    //
                    // It's pretty nifty that by changing focus in this handler,
                    // we can change the target of the default action.  (This works
                    // on keydown too, FWIW).
                    //
                    // And by nifty, we mean dumb (but useful sometimes).
                    textarea.focus();

                    defer(function () {
                        popText(pasteCallback);
                    });
                }

                // -*- attach event handlers -*- //
                target.bind({
                    keydown: onKeydown,
                    keypress: onKeypress,
                    focusout: onBlur,
                    cut: onCut,
                    paste: onPaste
                });

                // -*- export public methods -*- //
                return {
                    select: select
                };
            };
        }());
        var Parser = P(function (_, _super, Parser) {
            // The Parser object is a wrapper for a parser function.
            // Externally, you use one to parse a string by calling
            //   var result = SomeParser.parse('Me Me Me! Parse Me!');
            // You should never call the constructor, rather you should
            // construct your Parser from the base parsers and the
            // parser combinator methods.

            function parseError(stream, message) {
                if (stream) {
                    stream = "'" + stream + "'";
                }
                else {
                    stream = 'EOF';
                }

                throw 'Parse Error: ' + message + ' at ' + stream;
            }

            _.init = function (body) { this._ = body; };

            _.parse = function (stream) {
                return this.skip(eof)._(stream, success, parseError);

                function success(stream, result) { return result; }
            };

            // -*- primitive combinators -*- //
            _.or = function (alternative) {
                pray('or is passed a parser', alternative instanceof Parser);

                var self = this;

                return Parser(function (stream, onSuccess, onFailure) {
                    return self._(stream, onSuccess, failure);

                    function failure(newStream) {
                        return alternative._(stream, onSuccess, onFailure);
                    }
                });
            };

            _.then = function (next) {
                var self = this;

                return Parser(function (stream, onSuccess, onFailure) {
                    return self._(stream, success, onFailure);

                    function success(newStream, result) {
                        var nextParser = (next instanceof Parser ? next : next(result));
                        pray('a parser is returned', nextParser instanceof Parser);
                        return nextParser._(newStream, onSuccess, onFailure);
                    }
                });
            };

            // -*- optimized iterative combinators -*- //
            _.many = function () {
                var self = this;

                return Parser(function (stream, onSuccess, onFailure) {
                    var xs = [];
                    while (self._(stream, success, failure));
                    return onSuccess(stream, xs);

                    function success(newStream, x) {
                        stream = newStream;
                        xs.push(x);
                        return true;
                    }

                    function failure() {
                        return false;
                    }
                });
            };

            _.times = function (min, max) {
                if (arguments.length < 2) max = min;
                var self = this;

                return Parser(function (stream, onSuccess, onFailure) {
                    var xs = [];
                    var result = true;
                    var failure;

                    for (var i = 0; i < min; i += 1) {
                        result = self._(stream, success, firstFailure);
                        if (!result) return onFailure(stream, failure);
                    }

                    for (; i < max && result; i += 1) {
                        result = self._(stream, success, secondFailure);
                    }

                    return onSuccess(stream, xs);

                    function success(newStream, x) {
                        xs.push(x);
                        stream = newStream;
                        return true;
                    }

                    function firstFailure(newStream, msg) {
                        failure = msg;
                        stream = newStream;
                        return false;
                    }

                    function secondFailure(newStream, msg) {
                        return false;
                    }
                });
            };

            // -*- higher-level combinators -*- //
            _.result = function (res) { return this.then(succeed(res)); };
            _.atMost = function (n) { return this.times(0, n); };
            _.atLeast = function (n) {
                var self = this;
                return self.times(n).then(function (start) {
                    return self.many().map(function (end) {
                        return start.concat(end);
                    });
                });
            };

            _.map = function (fn) {
                return this.then(function (result) { return succeed(fn(result)); });
            };

            _.skip = function (two) {
                return this.then(function (result) { return two.result(result); });
            };

            // -*- primitive parsers -*- //
            var string = this.string = function (str) {
                var len = str.length;
                var expected = "expected '" + str + "'";

                return Parser(function (stream, onSuccess, onFailure) {
                    var head = stream.slice(0, len);

                    if (head === str) {
                        return onSuccess(stream.slice(len), head);
                    }
                    else {
                        return onFailure(stream, expected);
                    }
                });
            };

            var regex = this.regex = function (re) {
                pray('regexp parser is anchored', re.toString().charAt(1) === '^');

                var expected = 'expected ' + re;

                return Parser(function (stream, onSuccess, onFailure) {
                    var match = re.exec(stream);

                    if (match) {
                        var result = match[0];
                        return onSuccess(stream.slice(result.length), result);
                    }
                    else {
                        return onFailure(stream, expected);
                    }
                });
            };

            var succeed = Parser.succeed = function (result) {
                return Parser(function (stream, onSuccess) {
                    return onSuccess(stream, result);
                });
            };

            var fail = Parser.fail = function (msg) {
                return Parser(function (stream, _, onFailure) {
                    return onFailure(stream, msg);
                });
            };

            var letter = Parser.letter = regex(/^[a-z]/i);
            var letters = Parser.letters = regex(/^[a-z]*/i);
            var digit = Parser.digit = regex(/^[0-9]/);
            var digits = Parser.digits = regex(/^[0-9]*/);
            var whitespace = Parser.whitespace = regex(/^\s+/);
            var optWhitespace = Parser.optWhitespace = regex(/^\s*/);

            var any = Parser.any = Parser(function (stream, onSuccess, onFailure) {
                if (!stream) return onFailure(stream, 'expected any character');

                return onSuccess(stream.slice(1), stream.charAt(0));
            });

            var all = Parser.all = Parser(function (stream, onSuccess, onFailure) {
                return onSuccess('', stream);
            });

            var eof = Parser.eof = Parser(function (stream, onSuccess, onFailure) {
                if (stream) return onFailure(stream, 'expected EOF');

                return onSuccess(stream, stream);
            });
        });
        /*************************************************
         * Base classes of the MathQuill virtual DOM tree
         *
         * Only doing tree node manipulation via these
         * adopt/ disown methods guarantees well-formedness
         * of the tree.
         ************************************************/

        /**
         * MathQuill virtual-DOM tree-node abstract base class
         */
        var Node = P(function (_) {
            _.prev = 0;
            _.next = 0;
            _.parent = 0;
            _.firstChild = 0;
            _.lastChild = 0;

            _.children = function () {
                return Fragment(this.firstChild, this.lastChild);
            };

            _.eachChild = function (fn) {
                return this.children().each(fn);
            };

            _.foldChildren = function (fold, fn) {
                return this.children().fold(fold, fn);
            };

            _.adopt = function (parent, prev, next) {
                Fragment(this, this).adopt(parent, prev, next);
                return this;
            };

            _.disown = function () {
                Fragment(this, this).disown();
                return this;
            };
        });

        /**
         * An entity outside the virtual tree with one-way pointers (so it's only a
         * "view" of part of the tree, not an actual node/entity in the tree) that
         * delimits a doubly-linked list of sibling nodes.
         * It's like a fanfic love-child between HTML DOM DocumentFragment and the Range
         * classes: like DocumentFragment, its contents must be sibling nodes
         * (unlike Range, whose contents are arbitrary contiguous pieces of subtrees),
         * but like Range, it has only one-way pointers to its contents, its contents
         * have no reference to it and in fact may still be in the visible tree (unlike
         * DocumentFragment, whose contents must be detached from the visible tree
         * and have their 'parent' pointers set to the DocumentFragment).
         */
        var Fragment = P(function (_) {
            _.first = 0;
            _.last = 0;

            _.init = function (first, last) {
                pray('no half-empty fragments', !first === !last);

                if (!first) return;

                pray('first node is passed to Fragment', first instanceof Node);
                pray('last node is passed to Fragment', last instanceof Node);
                pray('first and last have the same parent',
                     first.parent === last.parent);

                this.first = first;
                this.last = last;
            };

            function prayWellFormed(parent, prev, next) {
                pray('a parent is always present', parent);
                pray('prev is properly set up', (function () {
                    // either it's empty and next is the first child (possibly empty)
                    if (!prev) return parent.firstChild === next;

                    // or it's there and its next and parent are properly set up
                    return prev.next === next && prev.parent === parent;
                })());

                pray('next is properly set up', (function () {
                    // either it's empty and prev is the last child (possibly empty)
                    if (!next) return parent.lastChild === prev;

                    // or it's there and its next and parent are properly set up
                    return next.prev === prev && next.parent === parent;
                })());
            }

            _.adopt = function (parent, prev, next) {
                prayWellFormed(parent, prev, next);

                var self = this;
                self.disowned = false;

                var first = self.first;
                if (!first) return this;

                var last = self.last;

                if (prev) {
                    // NB: this is handled in the ::each() block
                    // prev.next = first
                } else {
                    parent.firstChild = first;
                }

                if (next) {
                    next.prev = last;
                } else {
                    parent.lastChild = last;
                }

                self.last.next = next;

                self.each(function (el) {
                    el.prev = prev;
                    el.parent = parent;
                    if (prev) prev.next = el;

                    prev = el;
                });

                return self;
            };

            _.disown = function () {
                var self = this;
                var first = self.first;

                // guard for empty and already-disowned fragments
                if (!first || self.disowned) return self;

                self.disowned = true;

                var last = self.last;
                var parent = first.parent;

                prayWellFormed(parent, first.prev, first);
                prayWellFormed(parent, last, last.next);

                if (first.prev) {
                    first.prev.next = last.next;
                } else {
                    parent.firstChild = last.next;
                }

                if (last.next) {
                    last.next.prev = first.prev;
                } else {
                    parent.lastChild = first.prev;
                }

                return self;
            };

            _.each = function (fn) {
                var self = this;
                var el = self.first;
                if (!el) return self;

                for (; el !== self.last.next; el = el.next) {
                    if (fn.call(self, el) === false) break;
                }

                return self;
            };

            _.fold = function (fold, fn) {
                this.each(function (el) {
                    fold = fn.call(this, fold, el);
                });

                return fold;
            };
        });
        /*************************************************
         * Abstract classes of math blocks and commands.
         ************************************************/

        var uuid = (function () {
            var id = 0;

            return function () { return id += 1; };
        })();

        /**
         * Math tree node base class.
         * Some math-tree-specific extensions to Node.
         * Both MathBlock's and MathCommand's descend from it.
         */
        var MathElement = P(Node, function (_) {
            _.init = function (obj) {
                this.id = uuid();
                MathElement[this.id] = this;
            };

            _.toString = function () {
                return '[MathElement ' + this.id + ']';
            };

            _.bubble = function (event /*, args... */) {
                var args = __slice.call(arguments, 1);

                for (var ancestor = this; ancestor; ancestor = ancestor.parent) {
                    var res = ancestor[event] && ancestor[event].apply(ancestor, args);
                    if (res === false) break;
                }

                return this;
            };

            _.postOrder = function (fn /*, args... */) {
                if (typeof fn === 'string') {
                    var methodName = fn;
                    fn = function (el) {
                        if (methodName in el) el[methodName].apply(el, arguments);
                    };
                }

                (function recurse(desc) {
                    desc.eachChild(recurse);
                    fn(desc);
                })(this);
            };

            _.jQ = $();
            _.jQadd = function (jQ) { this.jQ = this.jQ.add(jQ); };

            this.jQize = function (html) {
                // Sets the .jQ of the entire math subtree rooted at this command.
                // Expects .createBlocks() to have been called already, since it
                // calls .html().
                var jQ = $(html);

                function jQadd(el) {
                    if (el.getAttribute) {
                        var cmdId = el.getAttribute('mathquill-command-id');
                        var blockId = el.getAttribute('mathquill-block-id');
                        if (cmdId) MathElement[cmdId].jQadd(el);
                        if (blockId) MathElement[blockId].jQadd(el);
                    }
                }
                function traverse(el) {
                    for (el = el.firstChild; el; el = el.nextSibling) {
                        jQadd(el);
                        if (el.firstChild) traverse(el);
                    }
                }

                for (var i = 0; i < jQ.length; i += 1) {
                    jQadd(jQ[i]);
                    traverse(jQ[i]);
                }
                return jQ;
            };

            _.finalizeInsert = function () {
                var self = this;
                self.postOrder('finalizeTree');

                // note: this order is important.
                // empty elements need the empty box provided by blur to
                // be present in order for their dimensions to be measured
                // correctly in redraw.
                self.postOrder('blur');

                // adjust context-sensitive spacing
                self.postOrder('respace');
                if (self.next.respace) self.next.respace();
                if (self.prev.respace) self.prev.respace();

                self.postOrder('redraw');
                self.bubble('redraw');
                self.bubble('redraw');
            };

            _.seek = function (cursor, clientX, clientY, root, clientRect) {
                var frontier = [];
                function popClosest() {
                    var iClosest, minSqDist = Infinity;
                    for (var i = 0; i < frontier.length; i += 1) {
                        if (!frontier[i]) continue;
                        var sqDist = frontier[i].sqDist;
                        if (sqDist < minSqDist) iClosest = i, minSqDist = sqDist;
                    }
                    var closest = frontier[iClosest];
                    frontier[iClosest] = null;
                    return closest;
                }
                function seekPoint(node) {
                    var pt = node.seekPoint(clientX, clientY, clientRect);
                    if (!pt) return;
                    var dx = clientX - pt.x, dy = clientY - pt.y;
                    frontier.push({ point: pt, sqDist: dx * dx + dy * dy });
                }
                function addNode(node) {
                    if (!node) return;
                    var rect = clientRect(node);
                    var closestX = max(rect.left, min(rect.right, clientX));
                    var closestY = max(rect.top, min(rect.bottom, clientY));
                    var dx = clientX - closestX, dy = clientY - closestY;
                    frontier.push({ node: node, sqDist: dx * dx + dy * dy });
                }
                function addContainer(node) {
                    if (node === root) return; // no potential Points outside root container
                    var rect = clientRect(node);
                    var dist = max(0, min(clientX - rect.left, clientY - rect.top,
                                          rect.right - clientX, rect.bottom - clientY));
                    frontier.push({ container: node, sqDist: dist * dist });
                }

                seekPoint(this);
                this.eachChild(addNode);
                addContainer(this);
                for (var closest = popClosest() ; !closest.point; closest = popClosest()) {
                    if (closest.container) {
                        var container = closest.container, outer = container.parent;
                        seekPoint(outer);
                        outer.eachChild(function (n) { if (n !== container) addNode(n); });
                        addContainer(outer);
                    }
                    else {
                        seekPoint(closest.node);
                        closest.node.eachChild(addNode);
                    }
                }
                if (closest.point.next) cursor.insertBefore(closest.point.next)
                else cursor.appendTo(closest.point.parent);
            };
        });

        /**
         * Commands and operators, like subscripts, exponents, or fractions.
         * Descendant commands are organized into blocks.
         */
        var MathCommand = P(MathElement, function (_, _super) {
            _.init = function (ctrlSeq, htmlTemplate, textTemplate) {
                var cmd = this;
                _super.init.call(cmd);

                if (!cmd.ctrlSeq) cmd.ctrlSeq = ctrlSeq;
                if (htmlTemplate) cmd.htmlTemplate = htmlTemplate;
                if (textTemplate) cmd.textTemplate = textTemplate;
            };

            // obvious methods
            _.replaces = function (replacedFragment) {
                replacedFragment.disown();
                this.replacedFragment = replacedFragment;
            };
            _.isEmpty = function () {
                return this.foldChildren(true, function (isEmpty, child) {
                    return isEmpty && child.isEmpty();
                });
            };

            _.parser = function () {
                var block = latexMathParser.block;
                var self = this;

                return block.times(self.numBlocks()).map(function (blocks) {
                    self.blocks = blocks;

                    for (var i = 0; i < blocks.length; i += 1) {
                        blocks[i].adopt(self, self.lastChild, 0);
                    }

                    return self;
                });
            };

            // createBefore(cursor) and the methods it calls
            _.createBefore = function (cursor) {
                var cmd = this;
                var replacedFragment = cmd.replacedFragment;

                cmd.createBlocks();
                MathElement.jQize(cmd.html());
                if (replacedFragment) {
                    replacedFragment.adopt(cmd.firstChild, 0, 0);
                    replacedFragment.jQ.appendTo(cmd.firstChild.jQ);
                }

                cursor.jQ.before(cmd.jQ);
                cursor.prev = cmd.adopt(cursor.parent, cursor.prev, cursor.next);

                cmd.finalizeInsert(cursor);

                cmd.placeCursor(cursor);
            };
            _.createBlocks = function () {
                var cmd = this,
                  numBlocks = cmd.numBlocks(),
                  blocks = cmd.blocks = Array(numBlocks);

                for (var i = 0; i < numBlocks; i += 1) {
                    var newBlock = blocks[i] = MathBlock();
                    newBlock.adopt(cmd, cmd.lastChild, 0);
                }
            };
            _.respace = noop; //placeholder for context-sensitive spacing
            _.placeCursor = function (cursor) {
                //append the cursor to the first empty child, or if none empty, the last one
                cursor.appendTo(this.foldChildren(this.firstChild, function (prev, child) {
                    return prev.isEmpty() ? prev : child;
                }));
            };

            _.seekPoint = noop;
            _.expectedCursorYNextTo = function (clientRect) {
                return this.firstChild.expectedCursorYInside(clientRect);
            };

            // remove()
            _.remove = function () {
                this.disown()
                this.jQ.remove();

                this.postOrder(function (el) { delete MathElement[el.id]; });

                return this;
            };

            // methods involved in creating and cross-linking with HTML DOM nodes
            /*
              They all expect an .htmlTemplate like
                '<span>&0</span>'
              or
                '<span><span>&0</span><span>&1</span></span>'
          
              See html.test.js for more examples.
          
              Requirements:
              - For each block of the command, there must be exactly one "block content
                marker" of the form '&<number>' where <number> is the 0-based index of the
                block. (Like the LaTeX \newcommand syntax, but with a 0-based rather than
                1-based index, because JavaScript because C because Dijkstra.)
              - The block content marker must be the sole contents of the containing
                element, there can't even be surrounding whitespace, or else we can't
                guarantee sticking to within the bounds of the block content marker when
                mucking with the HTML DOM.
              - The HTML not only must be well-formed HTML (of course), but also must
                conform to the XHTML requirements on tags, specifically all tags must
                either be self-closing (like '<br/>') or come in matching pairs.
                Close tags are never optional.
          
              Note that &<number> isn't well-formed HTML; if you wanted a literal '&123',
              your HTML template would have to have '&amp;123'.
            */
            _.numBlocks = function () {
                var matches = this.htmlTemplate.match(/&\d+/g);
                return matches ? matches.length : 0;
            };
            _.html = function () {
                // Render the entire math subtree rooted at this command, as HTML.
                // Expects .createBlocks() to have been called already, since it uses the
                // .blocks array of child blocks.
                //
                // See html.test.js for example templates and intended outputs.
                //
                // Given an .htmlTemplate as described above,
                // - insert the mathquill-command-id attribute into all top-level tags,
                //   which will be used to set this.jQ in .jQize().
                //   This is straightforward:
                //     * tokenize into tags and non-tags
                //     * loop through top-level tokens:
                //         * add #cmdId attribute macro to top-level self-closing tags
                //         * else add #cmdId attribute macro to top-level open tags
                //             * skip the matching top-level close tag and all tag pairs
                //               in between
                // - for each block content marker,
                //     + replace it with the contents of the corresponding block,
                //       rendered as HTML
                //     + insert the mathquill-block-id attribute into the containing tag
                //   This is even easier, a quick regex replace, since block tags cannot
                //   contain anything besides the block content marker.
                //
                // Two notes:
                // - The outermost loop through top-level tokens should never encounter any
                //   top-level close tags, because we should have first encountered a
                //   matching top-level open tag, all inner tags should have appeared in
                //   matching pairs and been skipped, and then we should have skipped the
                //   close tag in question.
                // - All open tags should have matching close tags, which means our inner
                //   loop should always encounter a close tag and drop nesting to 0. If
                //   a close tag is missing, the loop will continue until i >= tokens.length
                //   and token becomes undefined. This will not infinite loop, even in
                //   production without pray(), because it will then TypeError on .slice().

                var cmd = this;
                var blocks = cmd.blocks;
                var cmdId = ' mathquill-command-id=' + cmd.id;
                var tokens = cmd.htmlTemplate.match(/<[^<>]+>|[^<>]+/g);

                pray('no unmatched angle brackets', tokens.join('') === this.htmlTemplate);

                // add cmdId to all top-level tags
                for (var i = 0, token = tokens[0]; token; i += 1, token = tokens[i]) {
                    // top-level self-closing tags
                    if (token.slice(-2) === '/>') {
                        tokens[i] = token.slice(0, -2) + cmdId + '/>';
                    }
                        // top-level open tags
                    else if (token.charAt(0) === '<') {
                        pray('not an unmatched top-level close tag', token.charAt(1) !== '/');

                        tokens[i] = token.slice(0, -1) + cmdId + '>';

                        // skip matching top-level close tag and all tag pairs in between
                        var nesting = 1;
                        do {
                            i += 1, token = tokens[i];
                            pray('no missing close tags', token);
                            // close tags
                            if (token.slice(0, 2) === '</') {
                                nesting -= 1;
                            }
                                // non-self-closing open tags
                            else if (token.charAt(0) === '<' && token.slice(-2) !== '/>') {
                                nesting += 1;
                            }
                        } while (nesting > 0);
                    }
                }
                return tokens.join('').replace(/>&(\d+)/g, function ($0, $1) {
                    return ' mathquill-block-id=' + blocks[$1].id + '>' + blocks[$1].join('html');
                });
            };

            // methods to export a string representation of the math tree
            _.latex = function () {
                return this.foldChildren(this.ctrlSeq, function (latex, child) {
                    return latex + '{' + (child.latex() || ' ') + '}';
                });
            };
            _.mqLatex = function () {
                return this.foldChildren(this.ctrlSeq, function (latex, child) {
                    return latex + '{' + (child.mqLatex() || ' ') + '}';
                });
            };
            _.textTemplate = [''];
            _.text = function () {
                var i = 0;
                return this.foldChildren(this.textTemplate[i], function (text, child) {
                    i += 1;
                    var child_text = child.text();
                    if (text && this.textTemplate[i] === '('
                        && child_text[0] === '(' && child_text.slice(-1) === ')')
                        return text + child_text.slice(1, -1) + this.textTemplate[i];
                    return text + child.text() + (this.textTemplate[i] || '');
                });
            };
        });

        /**
         * Lightweight command without blocks or children.
         */
        var Symbol = P(MathCommand, function (_, _super) {
            _.init = function (ctrlSeq, html, text) {
                if (!text) text = ctrlSeq && ctrlSeq.length > 1 ? ctrlSeq.slice(1) : ctrlSeq;

                _super.init.call(this, ctrlSeq, html, [text]);
            };

            _.parser = function () { return Parser.succeed(this); };
            _.numBlocks = function () { return 0; };

            _.replaces = function (replacedFragment) {
                replacedFragment.remove();
            };
            _.createBlocks = noop;

            _.seek = function (cursor, clientX, clientY, root, clientRect) {
                var rect = clientRect(this), left = rect.left, right = rect.right;
                // insert at whichever side the click was closer to
                if (clientX - left < right - clientX) cursor.insertBefore(this);
                else cursor.insertAfter(this);
            };
            _.expectedCursorYNextTo = function (clientRect) {
                return (clientRect(this).top + clientRect(this).bottom) / 2;
            };

            _.latex = function () { return this.ctrlSeq; };
            _.text = function () { return this.textTemplate; };
            _.placeCursor = noop;
            _.isEmpty = function () { return true; };
        });

        /**
         * Children and parent of MathCommand's. Basically partitions all the
         * symbols and operators that descend (in the Math DOM tree) from
         * ancestor operators.
         */
        var MathBlock = P(MathElement, function (_) {
            _.join = function (methodName) {
                return this.foldChildren('', function (fold, child) {
                    return fold + child[methodName]();
                });
            };
            _.mqLatex = function () { return this.join('mqLatex'); };
            _.latex = function () { return this.join('latex'); };
            _.text = function () {
                return this.firstChild === this.lastChild ?
                  this.firstChild.text() :
                  '(' + this.join('text') + ')'
                ;
            };
            _.isEmpty = function () {
                return this.firstChild === 0 && this.lastChild === 0;
            };
            _.seekPoint = function (clientX, clientY, clientRect) {
                if (!this.firstChild) {
                    var pt = { next: 0, x: (clientRect(this).left + clientRect(this).right) / 2 };
                }
                else {
                    function pointLeftOf(n) { return { next: n, x: clientRect(n).left }; }
                    var pt = pointLeftOf(this.firstChild);
                    if (clientX > pt.x) {
                        pt = pointLeftOf(this.lastChild);
                        var rightwardPt = { next: 0, x: clientRect(pt.next).right };
                        while (clientX < pt.x) rightwardPt = pt, pt = pointLeftOf(pt.next.prev);
                        if (rightwardPt.x - clientX < clientX - pt.x) pt = rightwardPt;
                    }
                }
                return {
                    parent: this, next: pt.next,
                    x: pt.x, y: this.expectedCursorYInside(clientRect)
                };
            };
            _.expectedCursorYInside = function (clientRect) {
                if (this.firstChild) return this.firstChild.expectedCursorYNextTo(clientRect);
                else return (clientRect(this).top + clientRect(this).bottom) / 2;
            };
            _.focus = function () {
                this.jQ.addClass('mq-hasCursor');
                this.jQ.removeClass('mq-empty');

                return this;
            };
            _.blur = function () {
                this.jQ.removeClass('mq-hasCursor');
                if (this.isEmpty())
                    this.jQ.addClass('mq-empty');

                return this;
            };
        });

        /**
         * Math tree fragment base class.
         * Some math-tree-specific extensions to Fragment.
         */
        var MathFragment = P(Fragment, function (_, _super) {
            _.init = function (first, last) {
                // just select one thing if only one argument
                _super.init.call(this, first, last || first);
                this.jQ = this.fold($(), function (jQ, child) { return child.jQ.add(jQ); });
            };
            _.latex = function () {
                return this.fold('', function (latex, el) { return latex + el.latex(); });
            };
            _.remove = function () {
                this.jQ.remove();

                this.each(function (el) {
                    el.postOrder(function (desc) {
                        delete MathElement[desc.id];
                    });
                });

                return this.disown();
            };
        });
        /*********************************************
         * Root math elements with event delegation.
         ********************************************/

        function createRoot(container, root, textbox, editable) {
            var contents = container.contents().detach();

            if (!textbox) {
                container.addClass('mathquill-rendered-math');
            }

            root.jQ = $('<span class="mathquill-root-block"/>').appendTo(container.attr(mqBlockId, root.id));
            root.revert = function () {
                container.empty().unbind('.mathquill')
                  .removeClass('mathquill-rendered-math mathquill-editable mathquill-textbox')
                  .append(contents);
            };

            root.cursor = Cursor(root);

            root.renderLatex(contents.text());
        }

        function setupTextarea(editable, container, root, cursor) {
            var is_ios = navigator.userAgent.match(/(iPad|iPhone|iPod)/i) !== null;
            var is_android = navigator.userAgent.match(/(Android|Silk|Kindle)/i) !== null;

            //hack: by default use textarea for eq
            //enable soft/bluetooth keyboard below parameter is used for tablets only
            window.MathEditorWidgetUseKeyboard = true;                        
            if (is_ios) window.MathEditorWidgetUseKeyboard = false;
            var useTextarea = window.MathEditorWidgetUseKeyboard;
            
            var textareaSpan = root.textarea = useTextarea ?
                $('<span class="mq-textarea"><textarea></textarea></span>')
              : $('<span class="mq-textarea"><span tabindex=0></span></span>'),
              textarea = textareaSpan.children();

            /******
             * TODO [Han]: Document this
             */
            var textareaSelectionTimeout;
            root.selectionChanged = function () {
                if (textareaSelectionTimeout === undefined) {
                    textareaSelectionTimeout = setTimeout(setTextareaSelection);
                }
                forceIERedraw(container[0]);
            };
            function setTextareaSelection() {
                textareaSelectionTimeout = undefined;
                var latex = cursor.selection ? '$' + cursor.selection.latex() + '$' : '';
                textareaManager.select(latex);
                root.triggerSpecialEvent('selectionChanged');
            }

            //prevent native selection except textarea
            container.bind('selectstart.mathquill', function (e) {
                if (e.target !== textarea[0]) e.preventDefault();
                e.stopPropagation();
            });

            var textareaManager = hookUpTextarea(editable, container, root, cursor, textarea, textareaSpan, setTextareaSelection);

            return textarea;
        }

        function mouseEvents(ultimateRootjQ) {
            //drag-to-select event handling
            ultimateRootjQ.bind('mousedown.mathquill', function (e) {
                e.preventDefault();

                var container = $(e.target);
                if (!container.hasClass('mathquill-editable')) {
                    container = container.closest('.mathquill-root-block').parent();
                }
                var root = MathElement[container.attr(mqBlockId) || ultimateRootjQ.attr(mqBlockId)];
                var cursor = root.cursor, blink = cursor.blink;
                var textareaSpan = root.textarea, textarea = textareaSpan.children();

                if (root.ignoreMousedownTimeout !== undefined) {
                    clearTimeout(root.ignoreMousedownTimeout);
                    root.ignoreMousedownTimeout = undefined;
                    return;
                }

                var cachedClientRect = cachedClientRectFnForNewCache();
                function mousemove(e) {
                    cursor.seek($(e.target), e.clientX, e.clientY, cachedClientRect);

                    if (cursor.prev !== anticursor.prev
                        || cursor.parent !== anticursor.parent) {
                        cursor.selectFrom(anticursor);
                    }

                    e.preventDefault();
                }

                // docmousemove is attached to the document, so that
                // selection still works when the mouse leaves the window.
                function docmousemove(e) {
                    // [Han]: i delete the target because of the way seek works.
                    // it will not move the mouse to the target, but will instead
                    // just seek those X and Y coordinates.  If there is a target,
                    // it will try to move the cursor to document, which will not work.
                    // cursor.seek needs to be refactored.
                    delete e.target;

                    return mousemove(e);
                }

                function mouseup(e) {
                    anticursor = undefined;
                    cursor.blink = blink;
                    if (!cursor.selection) {
                        if (root.editable) {
                            cursor.show();
                        }
                        else {
                            textareaSpan.detach();
                        }
                    }

                    // delete the mouse handlers now that we're not dragging anymore
                    container.unbind('mousemove', mousemove);
                    $(e.target.ownerDocument).unbind('mousemove', docmousemove).unbind('mouseup', mouseup);
                }

                cursor.blink = noop;
                cursor.hideHandle().seek($(e.target), e.clientX, e.clientY, cachedClientRect);

                var anticursor = { parent: cursor.parent, prev: cursor.prev, next: cursor.next };

                if (!root.editable && root.blurred) container.prepend(textareaSpan);
                textarea.focus();
                root.blurred = false;

                container.mousemove(mousemove);
                $(e.target.ownerDocument).mousemove(docmousemove).mouseup(mouseup);
            });
        }

        function setupTouchHandle(editable, root, cursor) {
            // event handling for touch-draggable handle
            /**
             * Usage:
             * jQ.on('touchstart', firstFingerOnly(function(touchstartCoords) {
             *   return { // either of these are optional:
             *     touchmove: function(touchmoveCoords) {},
             *     touchend: function(touchendCoords) {}
             *   };
             * });
             */
            function firstFingerOnly(ontouchstart) {
                return function (e) {
                    e.preventDefault();
                    var e = e.originalEvent, target = $(e.target);
                    if (e.changedTouches.length < e.touches.length) return; // not first finger
                    var touchstart = e.changedTouches[0];
                    var handlers = ontouchstart(touchstart) || 0;
                    if (handlers.touchmove) {
                        target.bind('touchmove', function (e) {
                            var touchmove = e.originalEvent.changedTouches[0];
                            if (touchmove.id !== touchstart.id) return;
                            handlers.touchmove.call(this, touchmove);
                        });
                    }
                    target.bind('touchend', function (e) {
                        var touchend = e.originalEvent.changedTouches[0];
                        if (touchend.id !== touchstart.id) return;
                        if (handlers.touchend) handlers.touchend.call(this, touchend);
                        target.unbind('touchmove touchend');
                    });
                };
            }
            cursor.handle.on('touchstart', firstFingerOnly(function (e) {
                cursor.blink = noop;
                var cursorRect = cursor.jQ[0].getBoundingClientRect();
                var offsetX = e.clientX - cursorRect.left;
                var offsetY = e.clientY - (cursorRect.top + cursorRect.bottom) / 2;
                var cachedClientRect = cachedClientRectFnForNewCache();
                var onAnimationEnd;
                root.onAnimationEnd = function () { onAnimationEnd(); };
                return {
                    touchmove: function (e) {
                        var adjustedX = e.clientX - offsetX, adjustedY = e.clientY - offsetY;
                        cursor.seek(elAtPt(adjustedX, adjustedY, root), adjustedX, adjustedY, cachedClientRect, true);
                        visualHapticFeedback();
                        onAnimationEnd = visualHapticFeedback;

                        function visualHapticFeedback() {
                            var cursorRect = cursor.jQ[0].getBoundingClientRect();
                            cursor.repositionHandle(cursorRect);

                            var dx = adjustedX - cursorRect.left;
                            var dy = adjustedY - (cursorRect.top + cursorRect.bottom) / 2;
                            var dist = Math.sqrt(dx * dx + dy * dy);
                            var weight = (Math.log(dist) + 1) / dist;
                            var skewX = Math.atan2(weight * dx, offsetY);
                            var scaleY = (weight * dy + offsetY) / offsetY;
                            var steeperScale = 2 * (scaleY - 1) + 1;
                            cursor.handle.css({
                                WebkitTransform: 'translateX(.5px) skewX(' + skewX + 'rad) scaleY(' + scaleY + ')',
                                opacity: 1 - steeperScale * .5
                            });
                        }
                    },
                    touchend: function (e) {
                        cursor.handle.css({ WebkitTransform: '', opacity: '' });
                        cursor.blink = blink;
                        cursor.show(true);
                        onAnimationEnd = function () {
                            cursor.repositionHandle(cursor.jQ[0].getBoundingClientRect());
                            cursor.handle.css({ WebkitTransform: '', opacity: '' });
                            delete root.onAnimationEnd;
                        };
                    }
                };
            }));
        }

        function hookUpTextarea(editable, container, root, cursor, textarea, textareaSpan, setTextareaSelection) {
            if (!editable) {
                root.blurred = true;
                var textareaManager = manageTextarea(textarea, { container: container });
                container.bind('copy', setTextareaSelection)
                  .prepend('<span class="mq-selectable">$' + root.latex() + '$</span>');
                textarea.bind('cut paste', false).blur(function () {
                    cursor.clearSelection();
                    setTimeout(detach); //detaching during blur explodes in WebKit
                });
                function detach() {
                    textareaSpan.detach();
                    root.blurred = true;
                }
                return textareaManager;
            }

            var textareaManager = manageTextarea(textarea, {
                container: container,
                key: function (key, evt) {
                    cursor.parent.bubble('onKey', key, evt);
                },
                text: function (text) {
                    cursor.parent.bubble('onText', text);
                },
                cut: function (e) {
                    if (cursor.selection) {
                        setTimeout(function () {
                            cursor.prepareEdit();
                            cursor.parent.bubble('redraw');
                            root.triggerSpecialEvent('render');
                        });
                    }

                    e.stopPropagation();
                    root.triggerSpecialEvent('render');
                },
                paste: function (text) {
                    // FIXME HACK the parser in RootTextBlock needs to be moved to
                    // Cursor::writeLatex or something so this'll work with
                    // MathQuill textboxes
                    if (text.slice(0, 1) === '$' && text.slice(-1) === '$') {
                        text = text.slice(1, -1);
                    }

                    cursor.writeLatex(text).show();
                    root.triggerSpecialEvent('render');
                }
            });

            container.prepend(textareaSpan);
            return textareaManager;
        }

        function rootCSSClasses(container, textbox) {
            container.addClass('mathquill-editable');
            if (textbox)
                container.addClass('mathquill-textbox');
        }

        function focusBlurEvents(root, cursor, textarea) {
            textarea.focus(function (e) {
                root.blurred = false;
                if (!cursor.parent)
                    cursor.appendTo(root);
                cursor.parent.jQ.addClass('mq-hasCursor');
                if (cursor.selection) {
                    cursor.selection.jQ.removeClass('mq-blur');
                    setTimeout(root.selectionChanged); //re-select textarea contents after tabbing away and back
                }
                else
                    cursor.show();
            }).blur(function (e) {
                root.blurred = true;
                cursor.hide().parent.blur();
                if (cursor.selection)
                    cursor.selection.jQ.addClass('mq-blur');
            }).blur();
        }

        function desmosCustomEvents(container, root, cursor) {
            container.bind('select_all', function (e) {
                cursor.prepareMove().appendTo(root);
                while (cursor.prev) cursor.selectLeft();
            })
            .bind('custom_paste', function (e, text) {
                if (text.slice(0, 1) === '$' && text.slice(-1) === '$') {
                    text = text.slice(1, -1);
                }

                cursor.writeLatex(text).show();
                root.triggerSpecialEvent('render');
            });
        }

        function elAtPt(clientX, clientY, root) {
            var el = document.elementFromPoint(clientX, clientY);
            return $.contains(root.jQ[0], el) ? $(el) : root.jQ;
        }
        function cachedClientRectFnForNewCache() {
            var cache = {};
            function elById(el, id) {
                if (!cache[id]) {
                    pray('only called within Cursor::seek', 'scrollLeft' in cachedClientRect);
                    var rect = el.getBoundingClientRect(), dx = cachedClientRect.scrollLeft;
                    cache[id] = {
                        top: rect.top, right: rect.right + dx,
                        bottom: rect.bottom, left: rect.left + dx
                    };
                }
                return cache[id];
            };
            function cachedClientRect(node) { return elById(node.jQ[0], node.id); };
            cachedClientRect.elById = elById;
            return cachedClientRect;
        }

        var RootMathBlock = P(MathBlock, function (_, _super) {
            _.latex = function () {
                return _super.latex.call(this).replace(/(\\[a-z]+) (?![a-z])/ig, '$1');
            };
            _.text = function () {
                return this.foldChildren('', function (text, child) {
                    return text + child.text();
                });
            };
            _.renderLatex = function (latex) {
                var all = Parser.all;
                var eof = Parser.eof;

                var block = latexMathParser.skip(eof).or(all.result(false)).parse(latex);
                this.firstChild = this.lastChild = 0;
                if (block) {
                    block.children().adopt(this, 0, 0);
                }

                var jQ = this.jQ;

                if (block) {
                    var html = block.join('html');
                    jQ.html(html);
                    MathElement.jQize(jQ);
                    this.focus().finalizeInsert();
                }
                else {
                    jQ.empty();
                }

                this.cursor.appendTo(this);
            };
            _.renderSliderLatex = function (latex) {
                function makeCmd(ch) {
                    var cmd;
                    var code = ch.charCodeAt(0);
                    if ((65 <= code && code <= 90) || (97 <= code && code <= 122))
                        cmd = Variable(ch);
                    else {
                        if (CharCmds[ch] || LatexCmds[ch])
                            cmd = (CharCmds[ch] || LatexCmds[ch])(ch);
                        else {
                            cmd = VanillaSymbol(ch);
                        }
                    }
                    return cmd;
                }

                // valid assignment left-hand-sides: https://github.com/desmosinc/knox/blob/27709c6066a544f160123a6bd775829ec8cd7080/frontend/desmos/public/assets/grapher/jison/latex.jison#L13-L15
                var matches = /^([a-z])(?:_([a-z0-9]|\{[a-z0-9]+\}))?=([-0-9.]+)$/i.exec(latex);

                pray('valid restricted slider LaTeX', matches);
                var letter = matches[1];
                var subscript = matches[2];
                var value = matches[3];

                this.firstChild = this.lastChild = 0;

                letter = Variable(letter);

                if (subscript) {
                    var sub = LatexCmds._('_');
                    var subBlock = MathBlock().adopt(sub, 0, 0);
                    sub.blocks = [subBlock];
                    if (subscript.length === 1) {
                        makeCmd(subscript).adopt(subBlock, subBlock.lastChild, 0);
                    }
                    else {
                        for (var i = 1; i < subscript.length - 1; i += 1) {
                            makeCmd(subscript.charAt(i)).adopt(subBlock, subBlock.lastChild, 0);
                        }
                    }
                }

                letter.adopt(this, this.lastChild, 0);
                if (sub) sub.adopt(this, this.lastChild, 0);
                LatexCmds['=']('=').adopt(this, this.lastChild, 0);
                for (var i = 0, l = value.length; i < l; i += 1) {
                    var ch = value.charAt(i);
                    var cmd = makeCmd(ch);
                    cmd.adopt(this, this.lastChild, 0);
                }

                var jQ = this.jQ;

                var html = this.join('html');
                jQ.html(html);
                MathElement.jQize(jQ);
                //this.finalizeInsert();

                this.cursor.parent = this;
                this.cursor.prev = this.lastChild;
                this.cursor.next = 0;
            };
            _.up = function () { this.triggerSpecialEvent('upPressed'); };
            _.down = function () { this.triggerSpecialEvent('downPressed'); };
            _.moveOutOf = function (dir) { this.triggerSpecialEvent(dir + 'Pressed'); };
            _.onKey = function (key, e) {
                switch (key) {                    
                    case 'Ctrl-Shift-Backspace':
                    case 'Ctrl-Backspace':
                        while (this.cursor.prev || this.cursor.selection) {
                            this.cursor.backspace();
                        }
                        break;

                    case 'Shift-Backspace':
                    case 'Backspace':
                        this.cursor.backspace();
                        this.triggerSpecialEvent('render');
                        break;

                        // Tab or Esc -> go one block right if it exists, else escape right.
                    case 'Esc':
                    case 'Tab':
                        var parent = this.cursor.parent;
                        // cursor is in root editable, continue default
                        if (parent === this.cursor.root) return;

                        this.cursor.prepareMove();
                        if (parent.next) {
                            // go one block right
                            this.cursor.prependTo(parent.next);
                        } else {
                            // get out of the block
                            this.cursor.insertAfter(parent.parent);
                        }
                        break;

                        // Shift-Tab -> go one block left if it exists, else escape left.
                    case 'Shift-Tab':
                    case 'Shift-Esc':
                        var parent = this.cursor.parent;
                        //cursor is in root editable, continue default
                        if (parent === this.cursor.root) return;

                        this.cursor.prepareMove();
                        if (parent.prev) {
                            // go one block left
                            this.cursor.appendTo(parent.prev);
                        } else {
                            //get out of the block
                            this.cursor.insertBefore(parent.parent);
                        }
                        break;

                        // Prevent newlines from showing up
                    case 'Enter': this.triggerSpecialEvent('enterPressed'); break;


                        // End -> move to the end of the current block.
                    case 'End':
                        this.cursor.prepareMove().appendTo(this.cursor.parent);
                        break;

                        // Ctrl-End -> move all the way to the end of the root block.
                    case 'Ctrl-End':
                        this.cursor.prepareMove().appendTo(this);
                        break;

                        // Shift-End -> select to the end of the current block.
                    case 'Shift-End':
                        while (this.cursor.next) {
                            this.cursor.selectRight();
                        }
                        break;

                        // Ctrl-Shift-End -> select to the end of the root block.
                    case 'Ctrl-Shift-End':
                        while (this.cursor.next || this.cursor.parent !== this) {
                            this.cursor.selectRight();
                        }
                        break;

                        // Home -> move to the start of the root block or the current block.
                    case 'Home':
                        this.cursor.prepareMove().prependTo(this.cursor.parent);
                        break;

                        // Ctrl-Home -> move to the start of the current block.
                    case 'Ctrl-Home':
                        this.cursor.prepareMove().prependTo(this);
                        break;

                        // Shift-Home -> select to the start of the current block.
                    case 'Shift-Home':
                        while (this.cursor.prev) {
                            this.cursor.selectLeft();
                        }
                        break;

                        // Ctrl-Shift-Home -> move to the start of the root block.
                    case 'Ctrl-Shift-Home':
                        while (this.cursor.prev || this.cursor.parent !== this) {
                            this.cursor.selectLeft();
                        }
                        break;

                    case 'Left': this.cursor.moveLeft(); break;
                    case 'Shift-Left': this.cursor.selectLeft(); break;
                    case 'Ctrl-Left': break;
                    case 'Meta-Left': break;

                    case 'Right': this.cursor.moveRight(); break;
                    case 'Shift-Right': this.cursor.selectRight(); break;
                    case 'Ctrl-Right': break;
                    case 'Meta-Right': break;

                    case 'Up': this.cursor.moveUp(); break;
                    case 'Down': this.cursor.moveDown(); break;

                    case 'Shift-Up':
                        if (this.cursor.prev) {
                            while (this.cursor.prev) this.cursor.selectLeft();
                        } else {
                            this.cursor.selectLeft();
                        }

                    case 'Shift-Down':
                        if (this.cursor.next) {
                            while (this.cursor.next) this.cursor.selectRight();
                        }
                        else {
                            this.cursor.selectRight();
                        }

                    case 'Ctrl-Up': break;
                    case 'Meta-Up': break;
                    case 'Ctrl-Down': break;
                    case 'Meta-Down': break;

                    case 'Ctrl-Shift-Del':
                    case 'Ctrl-Del':
                        while (this.cursor.next || this.cursor.selection) {
                            this.cursor.deleteForward();
                        }
                        this.triggerSpecialEvent('render');
                        break;

                    case 'Shift-Del':
                    case 'Del':
                        this.cursor.deleteForward();
                        this.triggerSpecialEvent('render');
                        break;

                    case 'Meta-A':
                    case 'Ctrl-A':
                        //so not stopPropagation'd at RootMathCommand
                        if (this !== this.cursor.root) return;

                        this.cursor.prepareMove().appendTo(this);
                        while (this.cursor.prev) this.cursor.selectLeft();
                        break;

                    default:                                                                   
                        this.scrollHoriz();
                        return false;
                }
                e.preventDefault();
                this.scrollHoriz();
                return false;
            };
            _.onText = function (ch) {
                this.cursor.setFractionMode(1);
                this.cursor.write(ch);
                this.cursor.setFractionMode(0);
                this.triggerSpecialEvent('render');
                this.scrollHoriz();
                return false;
            };
            _.scrollHoriz = function () {
                var cursor = this.cursor, seln = cursor.selection;
                var rootRect = this.jQ[0].getBoundingClientRect();
                if (!seln) {
                    var x = cursor.jQ[0].getBoundingClientRect().left;
                    if (x > rootRect.right - 20) var scrollBy = x - (rootRect.right - 20);
                    else if (x < rootRect.left + 20) var scrollBy = x - (rootRect.left + 20);
                    else return;
                }
                else {
                    var rect = seln.jQ[0].getBoundingClientRect();
                    var overLeft = rect.left - (rootRect.left + 20);
                    var overRight = rect.right - (rootRect.right - 20);
                    if (seln.first === cursor.next) {
                        if (overLeft < 0) var scrollBy = overLeft;
                        else if (overRight > 0) {
                            if (rect.left - overRight < rootRect.left + 20) var scrollBy = overLeft;
                            else var scrollBy = overRight;
                        }
                        else return;
                    }
                    else {
                        if (overRight > 0) var scrollBy = overRight;
                        else if (overLeft < 0) {
                            if (rect.right - overLeft > rootRect.right - 20) var scrollBy = overRight;
                            else var scrollBy = overLeft;
                        }
                        else return;
                    }
                }
                this.jQ.stop().animate({ scrollLeft: '+=' + scrollBy }, 100, this.onAnimationEnd);
            };

            //triggers a special event occured:
            //  1) pressed up and was at 'top' of equation
            //  2) pressed down and was at 'bottom' of equation
            //  3) pressed backspace and equation was empty
            //  4) the equation was rendered
            //  5) etc
            _.triggerSpecialEvent = function (eventName) {
                this.jQ.trigger(eventName);
            };
        });

        var RootMathCommand = P(MathCommand, function (_, _super) {
            _.init = function (cursor) {
                _super.init.call(this, '$');
                this.cursor = cursor;
            };
            _.htmlTemplate = '<span class="mathquill-rendered-math">&0</span>';
            _.createBlocks = function () {
                this.firstChild =
                this.lastChild =
                  RootMathBlock();

                this.blocks = [this.firstChild];

                this.firstChild.parent = this;

                var cursor = this.firstChild.cursor = this.cursor;
                this.firstChild.onText = function (ch) {
                    if (ch !== '$' || cursor.parent !== this)
                        cursor.write(ch);
                    else if (this.isEmpty()) {
                        cursor.insertAfter(this.parent).backspace()
                          .insertNew(VanillaSymbol('\\$', '$')).show();
                    }
                    else if (!cursor.next)
                        cursor.insertAfter(this.parent);
                    else if (!cursor.prev)
                        cursor.insertBefore(this.parent);
                    else
                        cursor.write(ch);

                    return false;
                };
            };
            _.latex = function () {
                return '$' + this.firstChild.latex() + '$';
            };
        });

        var RootTextBlock = P(MathBlock, function (_) {
            _.renderLatex = function (latex) {
                var self = this
                var cursor = self.cursor;
                self.jQ.children().slice(1).remove();
                self.firstChild = self.lastChild = 0;
                cursor.show().appendTo(self);

                var regex = Parser.regex;
                var string = Parser.string;
                var eof = Parser.eof;
                var all = Parser.all;

                // Parser RootMathCommand
                var mathMode = string('$').then(latexMathParser)
                  // because TeX is insane, math mode doesn't necessarily
                  // have to end.  So we allow for the case that math mode
                  // continues to the end of the stream.
                  .skip(string('$').or(eof))
                  .map(function (block) {
                      // HACK FIXME: this shouldn't have to have access to cursor
                      var rootMathCommand = RootMathCommand(cursor);

                      rootMathCommand.createBlocks();
                      var rootMathBlock = rootMathCommand.firstChild;
                      block.children().adopt(rootMathBlock, 0, 0);

                      return rootMathCommand;
                  })
                ;

                var escapedDollar = string('\\$').result('$');
                var textChar = escapedDollar.or(regex(/^[^$]/)).map(VanillaSymbol);
                var latexText = mathMode.or(textChar).many();
                var commands = latexText.skip(eof).or(all.result(false)).parse(latex);

                if (commands) {
                    for (var i = 0; i < commands.length; i += 1) {
                        commands[i].adopt(self, self.lastChild, 0);
                    }

                    var html = self.join('html');
                    MathElement.jQize(html).appendTo(self.jQ);

                    this.finalizeInsert();
                }
            };
            _.onKey = RootMathBlock.prototype.onKey;
            _.onText = function (ch) {
                this.cursor.prepareEdit();
                if (ch === '$')
                    this.cursor.insertNew(RootMathCommand(this.cursor));
                else
                    this.cursor.insertNew(VanillaSymbol(ch));

                return false;
            };
            _.scrollHoriz = RootMathBlock.prototype.scrollHoriz;
        });
        /***************************
         * Commands and Operators.
         **************************/

        var CharCmds = {}, LatexCmds = {}; //single character commands, LaTeX commands

        var scale, // = function(jQ, x, y) { ... }
        //will use a CSS 2D transform to scale the jQuery-wrapped HTML elements,
        //or the filter matrix transform fallback for IE 5.5-8, or gracefully degrade to
        //increasing the fontSize to match the vertical Y scaling factor.

        //ideas from http://github.com/louisremi/jquery.transform.js
        //see also http://msdn.microsoft.com/en-us/library/ms533014(v=vs.85).aspx

          forceIERedraw = noop,
          div = document.createElement('div'),
          div_style = div.style,
          transformPropNames = {
              transform: 1,
              WebkitTransform: 1,
              MozTransform: 1,
              OTransform: 1,
              msTransform: 1
          },
          transformPropName;

        for (var prop in transformPropNames) {
            if (prop in div_style) {
                transformPropName = prop;
                break;
            }
        }

        if (transformPropName) {
            scale = function (jQ, x, y) {
                jQ.css(transformPropName, 'scale(' + x + ',' + y + ')');
            };
        }
        else if ('filter' in div_style) { //IE 6, 7, & 8 fallback, see https://github.com/laughinghan/mathquill/wiki/Transforms
            forceIERedraw = function (el) { el.className = el.className; };
            scale = function (jQ, x, y) { //NOTE: assumes y > x
                x /= (1 + (y - 1) / 2);
                jQ.css('fontSize', y + 'em');
                if (!jQ.hasClass('mq-matrixed-container')) {
                    jQ.addClass('mq-matrixed-container')
                    .wrapInner('<span class="mq-matrixed"></span>');
                }
                var innerjQ = jQ.children()
                .css('filter', 'progid:DXImageTransform.Microsoft'
                    + '.Matrix(M11=' + x + ",SizingMethod='auto expand')"
                );
                function calculateMarginRight() {
                    jQ.css('marginRight', (innerjQ.width() - 1) * (x - 1) / x + 'px');
                }
                calculateMarginRight();
                var intervalId = setInterval(calculateMarginRight);
                $(window).load(function () {
                    clearTimeout(intervalId);
                    calculateMarginRight();
                });
            };
        }
        else {
            scale = function (jQ, x, y) {
                jQ.css('fontSize', y + 'em');
            };
        }

        var Style = P(MathCommand, function (_, _super) {
            _.init = function (ctrlSeq, tagName, attrs) {
                _super.init.call(this, ctrlSeq, '<' + tagName + ' ' + attrs + '>&0</' + tagName + '>');
            };
        });

        //fonts
        LatexCmds.mathrm = bind(Style, '\\mathrm', 'span', 'class="mq-roman mq-font"');
        LatexCmds.mathit = bind(Style, '\\mathit', 'i', 'class="mq-font"');
        LatexCmds.mathbf = bind(Style, '\\mathbf', 'b', 'class="mq-font"');
        LatexCmds.mathsf = bind(Style, '\\mathsf', 'span', 'class="mq-sans-serif mq-font"');
        LatexCmds.mathtt = bind(Style, '\\mathtt', 'span', 'class="mq-monospace mq-font"');
        //text-decoration
        LatexCmds.underline = bind(Style, '\\underline', 'span', 'class="mq-non-leaf mq-underline"');
        LatexCmds.overline = LatexCmds.bar = bind(Style, '\\overline', 'span', 'class="mq-non-leaf mq-overline"');

        var SupSub = P(MathCommand, function (_, _super) {
            _.init = function (ctrlSeq, tag, text) {
                _super.init.call(this, ctrlSeq, '<' + tag + ' class="mq-non-leaf"><span class="mq-non-leaf mq-' + tag + '">&0</span></' + tag + '>', [text]);
            };
            _.finalizeTree = function () {
                //TODO: use inheritance
                pray('SupSub is only _ and ^',
                  this.ctrlSeq === '^' || this.ctrlSeq === '_'
                );

                if (this.ctrlSeq === '_') {
                    this.down = this.firstChild;
                    this.firstChild.up = insertBeforeUnlessAtEnd;
                }
                else {
                    this.up = this.firstChild;
                    this.firstChild.down = insertBeforeUnlessAtEnd;
                }
            };
            function insertBeforeUnlessAtEnd(cursor) {
                // cursor.insertBefore(cmd), unless cursor at the end of block, and every
                // ancestor cmd is at the end of every ancestor block
                var cmd = this.parent, ancestorCmd = cursor;
                do {
                    if (ancestorCmd.next) {
                        cursor.insertBefore(cmd);
                        return false;
                    }
                    ancestorCmd = ancestorCmd.parent.parent;
                } while (ancestorCmd !== cmd);
                cursor.insertAfter(cmd);
                return false;
            }
            _.latex = function () {
                if (this.ctrlSeq === '_' && this.respaced) return '';

                var latex = '';

                if (this.ctrlSeq === '^' && this.next.respaced) {
                    var block = this.next.firstChild.latex();
                    if (block.length === 1) latex += '_' + block;
                    else latex += '_{' + block + '}';
                }

                var block = this.firstChild.latex();
                if (block.length === 1) latex += this.ctrlSeq + block;
                else latex += this.ctrlSeq + '{' + (block || ' ') + '}';

                return latex;
            };
            _.redraw = function () {
                if (this.prev)
                    this.prev.respace();
                //SupSub::respace recursively calls respace on all the following SupSubs
                //so if prev is a SupSub, no need to call respace on this or following nodes
                if (!(this.prev instanceof SupSub)) {
                    this.respace();
                    //and if next is a SupSub, then this.respace() will have already called
                    //this.next.respace()
                    if (this.next && !(this.next instanceof SupSub))
                        this.next.respace();
                }
            };
            _.respace = function () {
                if (
                  this.prev.ctrlSeq === '\\int ' || (
                    this.prev instanceof SupSub && this.prev.ctrlSeq != this.ctrlSeq
                    && this.prev.prev && this.prev.prev.ctrlSeq === '\\int '
                  )
                ) {
                    if (!this['int']) {
                        this['int'] = true;
                        this.jQ.addClass('mq-int');
                    }
                }
                else {
                    if (this['int']) {
                        this['int'] = false;
                        this.jQ.removeClass('mq-int');
                    }
                }

                this.respaced = this.prev instanceof SupSub && this.prev.ctrlSeq != this.ctrlSeq && !this.prev.respaced;
                if (this.respaced) {
                    var fontSize = +this.jQ.css('fontSize').slice(0, -2),
                      prevWidth = this.prev.jQ.outerWidth(),
                      thisWidth = this.jQ.outerWidth();
                    this.jQ.css({
                        left: (this['int'] && this.ctrlSeq === '_' ? -.25 : 0) - prevWidth / fontSize + 'em',
                        marginRight: .1 - min(thisWidth, prevWidth) / fontSize + 'em'
                        //1px extra so it doesn't wrap in retarded browsers (Firefox 2, I think)
                    });
                }
                else if (this['int'] && this.ctrlSeq === '_') {
                    this.jQ.css({
                        left: '-.25em',
                        marginRight: ''
                    });
                }
                else {
                    this.jQ.css({
                        left: '',
                        marginRight: ''
                    });
                }

                if (this.respaced) {
                    if (this.ctrlSeq === '^') this.down = this.firstChild.down = this.prev.firstChild;
                    else this.up = this.firstChild.up = this.prev.firstChild;
                }
                else if (this.next.respaced) {
                    if (this.ctrlSeq === '_') this.up = this.firstChild.up = this.next.firstChild;
                    else this.down = this.firstChild.down = this.next.firstChild;
                }
                else {
                    if (this.ctrlSeq === '_') {
                        delete this.up;
                        this.firstChild.up = insertBeforeUnlessAtEnd;
                    }
                    else {
                        delete this.down;
                        this.firstChild.down = insertBeforeUnlessAtEnd;
                    }
                }

                if (this.next instanceof SupSub)
                    this.next.respace();

                return this;
            };

            _.onKey = function (key, e) {
                if (this.getCursor().parent.parent !== this) return;

                switch (key) {
                    case 'Tab':
                        if (this.next.respaced) {
                            this.getCursor().prepareMove().prependTo(this.next.firstChild);
                            e.preventDefault();
                            return false;
                        }
                        break;
                    case 'Shift-Tab':
                        if (this.respaced) {
                            this.getCursor().prepareMove().appendTo(this.prev.firstChild);
                            e.preventDefault();
                            return false;
                        }
                        break;
                    case 'Left':
                        if (!this.getCursor().prev && this.respaced) {
                            this.getCursor().prepareMove().insertBefore(this.prev);
                            return false;
                        }
                        break;
                    case 'Right':
                        if (!this.getCursor().next && this.next.respaced) {
                            this.getCursor().prepareMove().insertAfter(this.next);
                            return false;
                        }
                }
            };
            _.getCursor = function () {
                var cursor;
                for (var ancestor = this.parent; !cursor; ancestor = ancestor.parent) {
                    cursor = ancestor.cursor;
                }
                this.getCursor = function () { return cursor; };
                return this.getCursor();
            };
            _.expectedCursorYNextTo = function (clientRect) {
                // superscripts and subscripts are vertical-align-ed +/- 0.5em, so
                // their bottom or top edge almost perfectly aligns with the
                // cursor's center
                if (this.ctrlSeq === '_') return clientRect(this).top;
                else return clientRect(this).bottom;
            };
        });

        LatexCmds.subscript =
        LatexCmds._ = bind(SupSub, '_', 'sub', '_');

        LatexCmds.superscript =
        LatexCmds.supscript =
        LatexCmds['^'] = bind(SupSub, '^', 'sup', '**');

        var BigSymbol = P(MathCommand, function (_, _super) {
            _.init = function (ch, html) {
                var htmlTemplate =
                    '<span class="mq-large-operator mq-non-leaf">'
                  + '<span class="mq-to"><span>&1</span></span>'
                  + '<big>' + html + '</big>'
                  + '<span class="mq-from"><span>&0</span></span>'
                  + '</span>'
                ;
                Symbol.prototype.init.call(this, ch, htmlTemplate);
            };
            _.placeCursor = function (cursor) {
                if(cursor.prev && cursor.prev.ctrlSeq.trim() != '\\int') cursor.appendTo(this.firstChild).writeLatex('n=').show();
            };
            _.latex = function () {
                function simplify(latex) {
                    return latex.length === 1 ? latex : '{' + (latex || ' ') + '}';
                }
                return this.ctrlSeq + '_' + simplify(this.firstChild.latex()) +
                  '^' + simplify(this.lastChild.latex());
            };
            _.parser = function () {
                var string = Parser.string;
                var optWhitespace = Parser.optWhitespace;
                var succeed = Parser.succeed;
                var block = latexMathParser.block;

                var self = this;
                var blocks = self.blocks = [MathBlock(), MathBlock()];
                for (var i = 0; i < blocks.length; i += 1) {
                    blocks[i].adopt(self, self.lastChild, 0);
                }

                return optWhitespace.then(string('_').or(string('^'))).then(function (supOrSub) {
                    var child = blocks[supOrSub === '_' ? 0 : 1];
                    return block.then(function (block) {
                        block.children().adopt(child, child.lastChild, 0);
                        return succeed(self);
                    });
                }).many().result(self);
            };
            _.finalizeTree = function () {
                this.down = this.firstChild;
                this.firstChild.up = insertAfterUnlessAtBeginning;
                this.up = this.lastChild;
                this.lastChild.down = insertAfterUnlessAtBeginning;
            };
            function insertAfterUnlessAtBeginning(cursor) {
                // cursor.insertAfter(cmd), unless cursor at the beginning of block, and every
                // ancestor cmd is at the beginning of every ancestor block
                var cmd = this.parent, ancestorCmd = cursor;
                do {
                    if (ancestorCmd.prev) {
                        cursor.insertAfter(cmd);
                        return false;
                    }
                    ancestorCmd = ancestorCmd.parent.parent;
                } while (ancestorCmd !== cmd);
                cursor.insertBefore(cmd);
                return false;
            }
        });
        LatexCmds['\u2211'] = LatexCmds.sum = LatexCmds.summation = bind(BigSymbol, '\\sum ', '&sum;');
        LatexCmds['\u220F'] = LatexCmds.prod = LatexCmds.product = bind(BigSymbol, '\\prod ', '&prod;');
        LatexCmds['\u222B'] = LatexCmds.int = bind(BigSymbol, '\\int ', '&int;');

        var Fraction =
        LatexCmds.frac =
        LatexCmds.dfrac =
        LatexCmds.cfrac =
        LatexCmds.fraction = P(MathCommand, function (_, _super) {
            _.ctrlSeq = '\\frac';
            _.htmlTemplate =
                '<span class="mq-fraction mq-non-leaf">'
              + '<span class="mq-numerator">&0</span>'
              + '<span class="mq-denominator">&1</span>'
              + '<span style="display:inline-block;width:0;overflow:hidden">&nbsp;</span>'
              + '</span>'
            ;
            _.textTemplate = ['(', '/', ')'];
            _.finalizeTree = function () {
                this.up = this.lastChild.up = this.firstChild;
                this.down = this.firstChild.down = this.lastChild;
            };
            _.expectedCursorYNextTo = function (clientRect) {
                // vertical-align-ed -0.5em, so the top edge of the span that sets
                // the baseline almost perfectly aligns with the cursor's center
                return clientRect.elById(this.jQ[0].lastChild, this.id + .5).top;
            };
        });

        var LiveFraction =
        LatexCmds.over =
        CharCmds['/'] = P(Fraction, function (_, _super) {
            _.createBefore = function (cursor) {
                if (!this.replacedFragment) {
                    var prev = cursor.prev;
                    if (prev instanceof TextBlock || prev instanceof Fraction) {
                        prev = prev.prev;
                    }
                    else {
                        while (prev &&
                          !(
                            prev instanceof BinaryOperator ||
                            prev instanceof TextBlock ||
                            prev instanceof BigSymbol ||
                            prev instanceof Fraction ||
                            prev.ctrlSeq === ',' ||
                            prev.ctrlSeq === ':' ||
                            prev.ctrlSeq === '\\space '
                          ) //lookbehind for operator
                        )
                            prev = prev.prev;

                        if (prev instanceof BigSymbol && prev.next instanceof SupSub) {
                            prev = prev.next;
                            if (prev.next instanceof SupSub && prev.next.ctrlSeq != prev.ctrlSeq)
                                prev = prev.next;
                        }
                    }                    
                    //fractionModeId: 0 = placeholders for num/den, 1 = placeholders for den
                    if (prev !== cursor.prev && ((this.ctrlSeq != '\\frac' && cursor.getFractionMode() == 0) || (this.ctrlSeq == '\\frac' && cursor.getFractionMode() == 1))) {
                        this.replaces(MathFragment(prev.next || cursor.parent.firstChild, cursor.prev));
                        cursor.prev = prev;
                    }
                }
                _super.createBefore.call(this, cursor);
            };
        });

        var SquareRoot =
        LatexCmds.sqrt =
        LatexCmds['√'] = P(MathCommand, function (_, _super) {
            _.ctrlSeq = '\\sqrt';
            _.htmlTemplate =
                '<span class="mq-non-leaf">'
              + '<span class="mq-scaled mq-sqrt-prefix">&radic;</span>'
              + '<span class="mq-non-leaf mq-sqrt-stem">&0</span>'
              + '</span>'
            ;
            _.textTemplate = ['sqrt(', ')'];
            _.parser = function () {
                return latexMathParser.optBlock.then(function (optBlock) {
                    return latexMathParser.block.map(function (block) {
                        var nthroot = NthRoot();
                        nthroot.blocks = [optBlock, block];
                        optBlock.adopt(nthroot, 0, 0);
                        block.adopt(nthroot, optBlock, 0);
                        return nthroot;
                    });
                }).or(_super.parser.call(this));
            };
            _.redraw = function () {
                var block = this.lastChild.jQ;
                scale(block.prev(), 1, block.innerHeight() / +block.css('fontSize').slice(0, -2) - .1);
            };
        });


        var NthRoot =
        LatexCmds.nthroot = P(SquareRoot, function (_, _super) {
            _.ctrlSeq = '\\root';
            _.htmlTemplate =
                '<sup class="mq-nthroot mq-non-leaf">&0</sup>'
              + '<span class="mq-scaled">'
              + '<span class="mq-sqrt-prefix mq-scaled">&radic;</span>'
              + '<span class="mq-sqrt-stem mq-non-leaf">&1</span>'
              + '</span>'
            ;
            _.textTemplate = ['sqrt[', '](', ')'];
            _.onKey = function (key, e) {
                if (this.getCursor().parent.parent !== this) return;

                switch (key) {
                    case 'Right':
                        if (this.getCursor().next) return;
                    case 'Tab':
                        if (this.getCursor().parent === this.firstChild) {
                            this.getCursor().prepareMove().prependTo(this.lastChild);
                            e.preventDefault();
                            return false;
                        }
                        break;
                    case 'Left':
                        if (this.getCursor().prev) return;
                    case 'Shift-Tab':
                        if (this.getCursor().parent === this.lastChild) {
                            this.getCursor().prepareMove().appendTo(this.firstChild);
                            e.preventDefault();
                            return false;
                        }
                }
            };
            _.getCursor = SupSub.prototype.getCursor;
            _.expectedCursorYNextTo = function (clientRect) {
                // superscripts are vertical-align-ed 0.5em, so their bottom edge
                // almost perfectly aligns with the cursor's center
                return clientRect.elById(this.jQ[0], this.id + .5).bottom;
            };
        });

        // Round/Square/Curly/Angle Brackets (aka Parens/Brackets/Braces)
        var Bracket = P(MathCommand, function (_, _super) {
            _.init = function (open, close, ctrlSeq, end) {
                _super.init.call(this, '\\left' + ctrlSeq,
                    '<span class="mq-non-leaf">'
                  + '<span class="mq-scaled mq-paren">' + open + '</span>'
                  + '<span class="mq-non-leaf">&0</span>'
                  + '<span class="mq-scaled mq-paren">' + close + '</span>'
                  + '</span>',
                  [open, close]);
                this.end = '\\right' + end;
            };
            _.jQadd = function () {
                _super.jQadd.apply(this, arguments);
                var jQ = this.jQ;
                this.bracketjQs = jQ.children(':first').add(jQ.children(':last'));
            };
            //When typed, auto-expand paren to end of block
            _.finalizeTree = function () {
                if (this.firstChild.isEmpty() && this.next) {
                    var nextAll = MathFragment(this.next, this.parent.lastChild).disown();
                    nextAll.adopt(this.firstChild, 0, 0);
                    nextAll.jQ.appendTo(this.firstChild.jQ);
                }
            };
            _.placeCursor = function (cursor) {
                cursor.prependTo(this.firstChild);
            };
            _.latex = function () {
                return this.ctrlSeq + this.firstChild.latex() + this.end;
            };
            _.redraw = function () {
                var blockjQ = this.firstChild.jQ;

                var height = blockjQ.outerHeight() / +blockjQ.css('fontSize').slice(0, -2);

                scale(this.bracketjQs, min(1 + .2 * (height - 1), 1.2), 1.05 * height);
            };
        });

        LatexCmds.left = P(MathCommand, function (_) {
            _.parser = function () {
                var regex = Parser.regex;
                var string = Parser.string;
                var regex = Parser.regex;
                var succeed = Parser.succeed;
                var block = latexMathParser.block;
                var optWhitespace = Parser.optWhitespace;

                return optWhitespace.then(regex(/^(?:[([|]|\\\{)/))
                  .then(function (open) {
                      if (open.charAt(0) === '\\') open = open.slice(1);

                      var cmd = CharCmds[open]();

                      return latexMathParser
                        .map(function (block) {
                            cmd.blocks = [block];
                            block.adopt(cmd, 0, 0);
                        })
                        .then(string('\\right'))
                        .skip(optWhitespace)
                        .then(regex(/^(?:[\])|]|\\\})/))
                        .then(function (close) {
                            if (close.slice(-1) !== cmd.end.slice(-1)) {
                                return Parser.fail('open doesn\'t match close');
                            }

                            return succeed(cmd);
                        })
                      ;
                  })
                ;
            };
        });

        LatexCmds.right = P(MathCommand, function (_) {
            _.parser = function () {
                return Parser.fail('unmatched \\right');
            };
        });

        LatexCmds.lbrace =
        CharCmds['{'] = bind(Bracket, '{', '}', '\\{', '\\}');
        LatexCmds.langle =
        LatexCmds.lang = bind(Bracket, '&lang;', '&rang;', '\\langle ', '\\rangle ');

        // Closing bracket matching opening bracket above
        var CloseBracket = P(Bracket, function (_, _super) {
            _.createBefore = function (cursor) {
                // if I'm replacing a selection fragment, just wrap in parens
                if (this.replacedFragment) return _super.createBefore.call(this, cursor);

                // elsewise, if my parent is a matching open-paren, then close it here,
                // i.e. move everything after me in the open-paren to after the parens
                var openParen = cursor.parent.parent;
                if (openParen.ctrlSeq === this.ctrlSeq) {
                    if (cursor.next) {
                        var nextAll = MathFragment(cursor.next, openParen.firstChild.lastChild).disown();
                        nextAll.adopt(openParen.parent, openParen, openParen.next);
                        nextAll.jQ.insertAfter(openParen.jQ);
                        if (cursor.next.respace) cursor.next.respace();
                    }
                    cursor.insertAfter(openParen);
                    openParen.bubble('redraw');
                }
                    // or if not, make empty paren group and put cursor inside it
                    // (I think this behavior is weird - Han)
                else {
                    _super.createBefore.call(this, cursor);
                    cursor.appendTo(this.firstChild); // FIXME HACK
                }
            };
            _.finalizeTree = noop;
            _.placeCursor = function (cursor) {
                this.firstChild.blur();
                cursor.insertAfter(this);
            };
        });

        LatexCmds.rbrace =
        CharCmds['}'] = bind(CloseBracket, '{', '}', '\\{', '\\}');
        LatexCmds.rangle =
        LatexCmds.rang = bind(CloseBracket, '&lang;', '&rang;', '\\langle ', '\\rangle ');

        var parenMixin = function (_, _super) {
            _.init = function (open, close) {
                _super.init.call(this, open, close, open, close);
            };
        };

        var Paren = P(Bracket, parenMixin);

        LatexCmds.lparen =
        CharCmds['('] = bind(Paren, '(', ')');
        LatexCmds.lbrack =
        LatexCmds.lbracket =
        CharCmds['['] = bind(Paren, '[', ']');

        var CloseParen = P(CloseBracket, parenMixin);

        LatexCmds.rparen =
        CharCmds[')'] = bind(CloseParen, '(', ')');
        LatexCmds.rbrack =
        LatexCmds.rbracket =
        CharCmds[']'] = bind(CloseParen, '[', ']');

        var Pipes =
        LatexCmds.lpipe =
        LatexCmds.rpipe =
        CharCmds['|'] = P(Paren, function (_, _super) {
            _.init = function () {
                _super.init.call(this, '|', '|');
            }

            _.createBefore = function (cursor) {
                if (!cursor.next && cursor.parent.parent && cursor.parent.parent.end === this.end && !this.replacedFragment)
                    cursor.insertAfter(cursor.parent.parent);
                else
                    MathCommand.prototype.createBefore.call(this, cursor);
            };
            _.finalizeTree = noop;
        });

        // DISABLED in DCG
        var TextBlock =
        LatexCmds.text =
        LatexCmds.textnormal =
        LatexCmds.textrm =
        LatexCmds.textup =
        LatexCmds.textmd = P(MathCommand, function (_, _super) {
            _.ctrlSeq = '\\text';
            _.htmlTemplate = '<span class="mq-text">&0</span>';
            _.replaces = function (replacedText) {
                if (replacedText instanceof MathFragment)
                    this.replacedText = replacedText.remove().jQ.text();
                else if (typeof replacedText === 'string')
                    this.replacedText = replacedText;
            };
            _.textTemplate = ['"', '"'];
            _.parser = function () {
                // TODO: correctly parse text mode
                var string = Parser.string;
                var regex = Parser.regex;
                var optWhitespace = Parser.optWhitespace;
                return optWhitespace
                  .then(string('{')).then(regex(/^[^}]*/)).skip(string('}'))
                  .map(function (text) {
                      var cmd = TextBlock();
                      cmd.createBlocks();
                      var block = cmd.firstChild;
                      for (var i = 0; i < text.length; i += 1) {
                          var ch = VanillaSymbol(text.charAt(i));
                          ch.adopt(block, block.lastChild, 0);
                      }
                      return cmd;
                  })
                ;
            };
            _.createBlocks = function () {
                //FIXME: another possible Law of Demeter violation, but this seems much cleaner, like it was supposed to be done this way
                this.firstChild =
                this.lastChild =
                  InnerTextBlock();

                this.blocks = [this.firstChild];

                this.firstChild.parent = this;
            };
            _.finalizeInsert = function () {
                //FIXME HACK blur removes the TextBlock
                this.firstChild.blur = function () { delete this.blur; return this; };
                _super.finalizeInsert.call(this);
            };
            _.createBefore = function (cursor) {
                _super.createBefore.call(this, this.cursor = cursor);

                if (this.replacedText)
                    for (var i = 0; i < this.replacedText.length; i += 1)
                        this.write(this.replacedText.charAt(i));
            };
            _.write = function (ch) {
                this.cursor.insertNew(VanillaSymbol(ch));
            };
            _.onKey = function (key, e) {
                //backspace and delete and ends of block don't unwrap
                if (!this.cursor.selection &&
                  (
                    (key === 'Backspace' && !this.cursor.prev) ||
                    (key === 'Del' && !this.cursor.next)
                  )
                ) {
                    if (this.isEmpty())
                        this.cursor.insertAfter(this);

                    return false;
                }
            };
            _.onText = function (ch) {
                this.cursor.prepareEdit();
                if (ch !== '$')
                    this.write(ch);
                else if (this.isEmpty())
                    this.cursor.insertAfter(this).backspace().insertNew(VanillaSymbol('\\$', '$'));
                else if (!this.cursor.next)
                    this.cursor.insertAfter(this);
                else if (!this.cursor.prev)
                    this.cursor.insertBefore(this);
                else { //split apart
                    var next = TextBlock(MathFragment(this.cursor.next, this.firstChild.lastChild));
                    next.placeCursor = function (cursor) { //FIXME HACK: pretend no prev so they don't get merged
                        this.prev = 0;
                        delete this.placeCursor;
                        this.placeCursor(cursor);
                    };
                    next.firstChild.focus = function () { return this; };
                    this.cursor.insertAfter(this).insertNew(next);
                    next.prev = this;
                    this.cursor.insertBefore(next);
                    delete next.firstChild.focus;
                }
                this.cursor.root.triggerSpecialEvent('render');
                return false;
            };
        });

        var InnerTextBlock = P(MathBlock, function (_, _super) {
            _.blur = function () {
                this.jQ.removeClass('mq-hasCursor');
                if (this.isEmpty()) {
                    var textblock = this.parent, cursor = textblock.cursor;
                    if (cursor.parent === this)
                        this.jQ.addClass('mq-empty');
                    else {
                        cursor.hide();
                        textblock.remove();
                        if (cursor.next === textblock)
                            cursor.next = textblock.next;
                        else if (cursor.prev === textblock)
                            cursor.prev = textblock.prev;

                        cursor.show().parent.bubble('redraw');
                    }
                }
                return this;
            };
            _.focus = function () {
                _super.focus.call(this);

                var textblock = this.parent;
                if (textblock.next.ctrlSeq === textblock.ctrlSeq) { //TODO: seems like there should be a better way to move MathElements around
                    var innerblock = this,
                      cursor = textblock.cursor,
                      next = textblock.next.firstChild;

                    next.eachChild(function (child) {
                        child.parent = innerblock;
                        child.jQ.appendTo(innerblock.jQ);
                    });

                    if (this.lastChild)
                        this.lastChild.next = next.firstChild;
                    else
                        this.firstChild = next.firstChild;

                    next.firstChild.prev = this.lastChild;
                    this.lastChild = next.lastChild;

                    next.parent.remove();

                    if (cursor.prev)
                        cursor.insertAfter(cursor.prev);
                    else
                        cursor.prependTo(this);

                    cursor.parent.bubble('redraw');
                }
                else if (textblock.prev.ctrlSeq === textblock.ctrlSeq) {
                    var cursor = textblock.cursor;
                    if (cursor.prev)
                        textblock.prev.firstChild.focus();
                    else
                        cursor.appendTo(textblock.prev.firstChild);
                }
                return this;
            };
        });


        function makeTextBlock(latex, tagName, attrs) {
            return P(TextBlock, {
                ctrlSeq: latex,
                htmlTemplate: '<' + tagName + ' ' + attrs + '>&0</' + tagName + '>'
            });
        }

        LatexCmds.em = LatexCmds.italic = LatexCmds.italics =
        LatexCmds.emph = LatexCmds.textit = LatexCmds.textsl =
          makeTextBlock('\\textit', 'i', 'class="mq-text"');
        LatexCmds.strong = LatexCmds.bold = LatexCmds.textbf =
          makeTextBlock('\\textbf', 'b', 'class="mq-text"');
        LatexCmds.sf = LatexCmds.textsf =
          makeTextBlock('\\textsf', 'span', 'class="mq-sans-serif mq-text"');
        LatexCmds.tt = LatexCmds.texttt =
          makeTextBlock('\\texttt', 'span', 'class="mq-monospace mq-text"');
        LatexCmds.textsc =
          makeTextBlock('\\textsc', 'span', 'style="font-variant:small-caps" class="mq-text"');
        LatexCmds.uppercase =
          makeTextBlock('\\uppercase', 'span', 'style="text-transform:uppercase" class="mq-text"');
        LatexCmds.lowercase =
          makeTextBlock('\\lowercase', 'span', 'style="text-transform:lowercase" class="mq-text"');

        // input box to type a variety of LaTeX commands beginning with a backslash
        // DISABLED in DCG
        var LatexCommandInput =
        P(MathCommand, function (_, _super) {
            _.ctrlSeq = '\\';
            _.replaces = function (replacedFragment) {
                this._replacedFragment = replacedFragment.disown();
                this.isEmpty = function () { return false; };
            };
            _.htmlTemplate = '<span class="mq-latex-command-input mq-non-leaf">\\<span>&0</span></span>';
            _.textTemplate = ['\\'];
            _.createBlocks = function () {
                _super.createBlocks.call(this);
                this.firstChild.focus = function () {
                    this.parent.jQ.addClass('mq-hasCursor');
                    if (this.isEmpty())
                        this.parent.jQ.removeClass('mq-empty');

                    return this;
                };
                this.firstChild.blur = function () {
                    this.parent.jQ.removeClass('mq-hasCursor');
                    if (this.isEmpty())
                        this.parent.jQ.addClass('mq-empty');

                    return this;
                };
            };
            _.createBefore = function (cursor) {
                _super.createBefore.call(this, cursor);
                this.cursor = cursor.appendTo(this.firstChild);
                if (this._replacedFragment) {
                    var el = this.jQ[0];
                    this.jQ =
                      this._replacedFragment.jQ.addClass('mq-blur').bind(
                        'mousedown mousemove', //FIXME: is monkey-patching the mousedown and mousemove handlers the right way to do this?
                        function (e) {
                            $(e.target = el).trigger(e);
                            return false;
                        }
                      ).insertBefore(this.jQ).add(this.jQ);
                }
            };
            _.latex = function () {
                return '\\' + this.firstChild.latex() + ' ';
            };
            _.onKey = function (key, e) {
                if (key === 'Tab' || key === 'Enter') {
                    this.renderCommand();
                    this.cursor.root.triggerSpecialEvent('render');
                    e.preventDefault();
                    return false;
                }
            };
            _.onText = function (ch) {
                if (ch.match(/[a-z]/i)) {
                    this.cursor.prepareEdit();
                    this.cursor.insertNew(VanillaSymbol(ch));
                    return false;
                }
                this.renderCommand();
                if (ch === ' ' || (ch === '\\' && this.firstChild.isEmpty())) {
                    this.cursor.root.triggerSpecialEvent('render');
                    return false;
                }
            };
            _.renderCommand = function () {
                this.jQ = this.jQ.last();
                this.remove();
                if (this.next) {
                    this.cursor.insertBefore(this.next);
                } else {
                    this.cursor.appendTo(this.parent);
                }

                var latex = this.firstChild.latex(), cmd;
                if (!latex) latex = 'backslash';
                this.cursor.insertCmd(latex, this._replacedFragment);
            };
        });

        var Binomial =
        LatexCmds.binom =
        LatexCmds.binomial = P(MathCommand, function (_, _super) {
            _.ctrlSeq = '\\binom';
            _.htmlTemplate =
                '<span class="mq-paren mq-scaled">(</span>'
              + '<span class="mq-non-leaf">'
              + '<span class="mq-array mq-non-leaf">'
              + '<span>&0</span>'
              + '<span>&1</span>'
              + '</span>'
              + '</span>'
              + '<span class="mq-paren mq-scaled">)</span>'
            ;
            _.textTemplate = ['choose(', ',', ')'];
            _.redraw = function () {
                var blockjQ = this.jQ.eq(1);

                var height = blockjQ.outerHeight() / +blockjQ.css('fontSize').slice(0, -2);

                var parens = this.jQ.filter('.mq-paren');
                scale(parens, min(1 + .2 * (height - 1), 1.2), 1.05 * height);
            };
            // vertical-align: middle, so
            _.expectedCursorYNextTo = Symbol.prototype.expectedCursorYNextTo;
        });

        var Choose =
        LatexCmds.choose = P(Binomial, function (_) {
            _.createBefore = LiveFraction.prototype.createBefore;
        });

        var Vector =
        LatexCmds.vector = P(MathCommand, function (_, _super) {
            _.ctrlSeq = '\\vector';
            _.htmlTemplate = '<span class="mq-array"><span>&0</span></span>';
            _.latex = function () {
                return '\\begin{matrix}' + this.foldChildren([], function (latex, child) {
                    latex.push(child.latex());
                    return latex;
                }).join('\\\\') + '\\end{matrix}';
            };
            _.text = function () {
                return '[' + this.foldChildren([], function (text, child) {
                    text.push(child.text());
                    return text;
                }).join() + ']';
            }
            _.createBefore = function (cursor) {
                _super.createBefore.call(this, this.cursor = cursor);
            };
            _.onKey = function (key, e) {
                var currentBlock = this.cursor.parent;

                if (currentBlock.parent === this) {
                    if (key === 'Enter') { //enter
                        var newBlock = MathBlock();
                        newBlock.parent = this;
                        newBlock.jQ = $('<span></span>')
                          .attr(mqBlockId, newBlock.id)
                          .insertAfter(currentBlock.jQ);
                        if (currentBlock.next)
                            currentBlock.next.prev = newBlock;
                        else
                            this.lastChild = newBlock;

                        newBlock.next = currentBlock.next;
                        currentBlock.next = newBlock;
                        newBlock.prev = currentBlock;
                        this.bubble('redraw').cursor.appendTo(newBlock);

                        e.preventDefault();
                        return false;
                    }
                    else if (key === 'Tab' && !currentBlock.next) {
                        if (currentBlock.isEmpty()) {
                            if (currentBlock.prev) {
                                this.cursor.insertAfter(this);
                                delete currentBlock.prev.next;
                                this.lastChild = currentBlock.prev;
                                currentBlock.jQ.remove();
                                this.bubble('redraw');

                                e.preventDefault();
                                return false;
                            }
                            else
                                return;
                        }

                        var newBlock = MathBlock();
                        newBlock.parent = this;
                        newBlock.jQ = $('<span></span>').attr(mqBlockId, newBlock.id).appendTo(this.jQ);
                        this.lastChild = newBlock;
                        currentBlock.next = newBlock;
                        newBlock.prev = currentBlock;
                        this.bubble('redraw').cursor.appendTo(newBlock);

                        e.preventDefault();
                        return false;
                    }
                    else if (e.which === 8) { //backspace
                        if (currentBlock.isEmpty()) {
                            if (currentBlock.prev) {
                                this.cursor.appendTo(currentBlock.prev)
                                currentBlock.prev.next = currentBlock.next;
                            }
                            else {
                                this.cursor.insertBefore(this);
                                this.firstChild = currentBlock.next;
                            }

                            if (currentBlock.next)
                                currentBlock.next.prev = currentBlock.prev;
                            else
                                this.lastChild = currentBlock.prev;

                            currentBlock.jQ.remove();
                            if (this.isEmpty())
                                this.cursor.deleteForward();
                            else
                                this.bubble('redraw');

                            e.preventDefault();
                            return false;
                        }
                        else if (!this.cursor.prev) {
                            e.preventDefault();
                            return false;
                        }
                    }
                }
            };
            // vertical-align: middle, so
            _.expectedCursorYNextTo = Binomial.prototype.expectedCursorYNextTo;
        });

        LatexCmds.MathQuillMathField = P(MathCommand, function (_, _super) {
            _.ctrlSeq = '\\MathQuillMathField';
            _.htmlTemplate = '<span class="mathquill-editable">&0</span>';
            _.finalizeTree = function () {
                // parsed \MathQuillMathField{contents}, `this` is this MathCommand,
                // replace its sole child MathBlock with a RootMathBlock
                var self = this, rootBlock = RootMathBlock();

                delete MathElement[rootBlock.id];
                rootBlock.id = self.firstChild.id;
                MathElement[rootBlock.id] = rootBlock;

                self.firstChild.children().disown().adopt(rootBlock, 0, 0);
                rootBlock.parent = self;
                self.firstChild = self.lastChild = rootBlock;
                self.blocks = [rootBlock];

                rootBlock.jQ = self.jQ.wrapInner('<span class="mathquill-root-block"/>').children();

                rootBlock.editable = true;
                var cursor = rootBlock.cursor = Cursor(rootBlock).appendTo(rootBlock);
                var textarea = setupTextarea(true, self.jQ, rootBlock, cursor);
                setupTouchHandle(true, rootBlock, cursor);
                focusBlurEvents(rootBlock, cursor, textarea);
                desmosCustomEvents(self.jQ, rootBlock, cursor);
            };

            _.mqLatex = _super.latex;
            _.latex = function () { return this.firstChild.latex(); };
            _.text = function () { return this.firstChild.text(); };
        });
        /**********************************
         * Symbols and Special Characters
         *********************************/

        var Variable = P(Symbol, function (_, _super) {
            _.init = function (ch, html) {
                _super.init.call(this, ch, '<var>' + (html || ch) + '</var>');
            }
            _.createBefore = function (cursor) {
                //want the longest possible autocommand, so assemble longest series of letters (Variables) first
                var ctrlSeq = this.ctrlSeq;
                for (var i = 0, prev = cursor.prev; i < MAX_AUTOCMD_LEN - 1 && prev && prev instanceof Variable; i += 1, prev = prev.prev)
                    ctrlSeq = prev.ctrlSeq + ctrlSeq;
                //then test if there's an autocommand here, starting with the longest possible and slicing
                while (ctrlSeq.length) {
                    if (AutoCmds.hasOwnProperty(ctrlSeq)) {
                        for (var i = 1; i < ctrlSeq.length; i += 1) cursor.backspace();                        
                        //Hack By Sandeep K: for trig functions wrap ()
                        if (/^(sin|cos|tan|arcsin|arccos|arctan)$/i.test(ctrlSeq)) {
                            cursor.insertNew(CharCmds['(']('('));
                            cursor.moveLeft();
                            cursor.insertNew(LatexCmds[ctrlSeq](ctrlSeq));
                            cursor.moveRight();
                        }
                        else
                            cursor.insertNew(LatexCmds[ctrlSeq](ctrlSeq));

                        return;
                    }
                    ctrlSeq = ctrlSeq.slice(1);
                }
                _super.createBefore.apply(this, arguments);
            };
            _.respace =
            _.finalizeTree = function () {
                //TODO: in better architecture, should be done in createBefore and backspace
                //respace is called too often, inefficient

                //want the longest possible autocommand, so assemble longest series of letters (Variables)
                var ctrlSeq = this.ctrlSeq;
                if (ctrlSeq.length > 1) return;
                for (var prev = this.prev; prev instanceof Variable && prev.ctrlSeq.length === 1; prev = prev.prev)
                    ctrlSeq = prev.ctrlSeq + ctrlSeq;
                for (var next = this.next; next instanceof Variable && next.ctrlSeq.length === 1; next = next.next)
                    ctrlSeq += next.ctrlSeq;

                //removeClass from all the things before figuring out what's an autocmd, if any
                MathFragment(prev.next || this.parent.firstChild, next.prev || this.parent.lastChild)
                .each(function (el) {
                    el.jQ.removeClass('mq-un-italicized mq-last');
                    delete el.isFirstLetter;
                    delete el.isLastLetter;
                });

                //test if there's an autocommand here, going through substrings from longest to shortest
                outer: for (var i = 0, first = prev.next || this.parent.firstChild; i < ctrlSeq.length; i += 1, first = first.next) {
                    for (var len = min(MAX_UNITALICIZED_LEN, ctrlSeq.length - i) ; len > 0; len -= 1) {
                        if (UnItalicizedCmds.hasOwnProperty(ctrlSeq.slice(i, i + len))) {
                            first.isFirstLetter = true;
                            for (var j = 0, letter = first; j < len; j += 1, letter = letter.next) {
                                letter.jQ.addClass('mq-un-italicized');
                                var last = letter;
                            }
                            last.isLastLetter = true;
                            if (!(last.next instanceof SupSub || last.next instanceof Bracket))
                                last.jQ.addClass('mq-last');
                            i += len - 1;
                            first = last;
                            continue outer;
                        }
                    }
                }
            };
            _.latex = function () {
                return (
                  this.isFirstLetter ? '\\' + this.ctrlSeq :
                  this.isLastLetter ? this.ctrlSeq + ' ' :
                  this.ctrlSeq
                );
            };
            _.text = function () {
                var text = this.ctrlSeq;
                if (this.prev && !(this.prev instanceof Variable)
                    && !(this.prev instanceof BinaryOperator))
                    text = '*' + text;
                if (this.next && !(this.next instanceof BinaryOperator)
                    && !(this.next.ctrlSeq === '^'))
                    text += '*';
                return text;
            };
        });

        var UnItalicized = P(Symbol, function (_, _super) {
            _.init = function (fn) {
                this.ctrlSeq = fn;
            };
            _.createBefore = function (cursor) {
                cursor.writeLatex(this.ctrlSeq).show();
            };
            _.parser = function () {
                var fn = this.ctrlSeq;
                var block = MathBlock();
                for (var i = 0; i < fn.length; i += 1) {
                    Variable(fn.charAt(i)).adopt(block, block.lastChild, 0);
                }
                return Parser.succeed(block.children());
            };
        });

        //backslashless commands, words where adjacent letters (Variables)
        //that form them automatically are turned into commands
        var UnItalicizedCmds = {
            ln: 1,
            log: 1,
            min: 1,
            nCr: 1,
            nPr: 1,
            gcd: 1,
            lcm: 1,
            mcm: 1,
            mcd: 1,
            ceil: 1,
            exp: 1,
            abs: 1,
            max: 1,
            mod: 1,
            gcf: 1,
            exp: 1,
            floor: 1,
            sign: 1,
            signum: 1,
            round: 1
        }, MAX_UNITALICIZED_LEN = 9, AutoCmds = {
            //Hack By Sandeep K: custom autocmds for air
            sin: 1,
            cos: 1,
            tan: 1,
            arcsin: 1,
            arccos: 1,
            arctan: 1,
            sqrt: 1,
            nthroot: 1,
            sum: 1,
            prod: 1,
            pi: 1,
            phi: 1,
            tau: 1,
            gamma: 1,
            theta: 1/*,
  int: 1*/
        }, MAX_AUTOCMD_LEN = 7;

        (function () {
            var trigs = { sin: 1, cos: 1, tan: 1, sec: 1, cosec: 1, csc: 1, cotan: 1, cot: 1, ctg: 1 };
            for (var trig in trigs) {
                UnItalicizedCmds[trig] =
                UnItalicizedCmds['arc' + trig] =
                UnItalicizedCmds[trig + 'h'] =
                UnItalicizedCmds['arc' + trig + 'h'] = 1;
            }

            for (var fn in UnItalicizedCmds)
                LatexCmds[fn] = UnItalicized;
        }());

        var VanillaSymbol = P(Symbol, function (_, _super) {
            _.init = function (ch, html) {
                _super.init.call(this, ch, '<span>' + (html || ch) + '</span>');
            };
        });

        CharCmds[' '] = bind(VanillaSymbol, '\\space ', ' ');

        LatexCmds.prime = CharCmds["'"] = bind(VanillaSymbol, "'", '&prime;');

        // does not use Symbola font
        var NonSymbolaSymbol = P(Symbol, function (_, _super) {
            _.init = function (ch, html) {
                _super.init.call(this, ch, '<span class="mq-nonSymbola">' + (html || ch) + '</span>');
            };
        });

        LatexCmds['$'] = NonSymbolaSymbol;
        LatexCmds['@'] = NonSymbolaSymbol;
        LatexCmds['&'] = bind(NonSymbolaSymbol, '\\&', '&amp;');
        LatexCmds['%'] = bind(NonSymbolaSymbol, '\\%', '%');

        //the following are all Greek to me, but this helped a lot: http://www.ams.org/STIX/ion/stixsig03.html

        //lowercase Greek letter variables
        LatexCmds.alpha =
        LatexCmds.beta =
        LatexCmds.gamma =
        LatexCmds.delta =
        LatexCmds.zeta =
        LatexCmds.eta =
        LatexCmds.theta =
        LatexCmds.iota =
        LatexCmds.kappa =
        LatexCmds.mu =
        LatexCmds.nu =
        LatexCmds.xi =
        LatexCmds.rho =
        LatexCmds.sigma =
        LatexCmds.tau =
        LatexCmds.chi =
        LatexCmds.psi =
        LatexCmds.omega = P(Variable, function (_, _super) {
            _.init = function (latex) {
                _super.init.call(this, '\\' + latex + ' ', '&' + latex + ';');
            };
        });

        //Hack By Sandeep K: Autocmds for AIR
        LatexCmds.sin = bind(VanillaSymbol, '\\sin ', 'sin');
        LatexCmds.cos = bind(VanillaSymbol, '\\cos ', 'cos');
        LatexCmds.tan = bind(VanillaSymbol, '\\tan ', 'tan');
        LatexCmds.arcsin = bind(VanillaSymbol, '\\arcsin ', 'arcsin');
        LatexCmds.arccos = bind(VanillaSymbol, '\\arccos ', 'arccos');
        LatexCmds.arctan = bind(VanillaSymbol, '\\arctan ', 'arctan');

        //why can't anybody FUCKING agree on these
        LatexCmds.phi = //W3C or Unicode?
          bind(Variable, '\\phi ', '&#981;');

        LatexCmds.phiv = //Elsevier and 9573-13
        LatexCmds.varphi = //AMS and LaTeX
          bind(Variable, '\\varphi ', '&phi;');

        LatexCmds.epsilon = //W3C or Unicode?
          bind(Variable, '\\epsilon ', '&#1013;');

        LatexCmds.epsiv = //Elsevier and 9573-13
        LatexCmds.varepsilon = //AMS and LaTeX
          bind(Variable, '\\varepsilon ', '&epsilon;');

        LatexCmds.piv = //W3C/Unicode and Elsevier and 9573-13
        LatexCmds.varpi = //AMS and LaTeX
          bind(Variable, '\\varpi ', '&piv;');

        LatexCmds.sigmaf = //W3C/Unicode
        LatexCmds.sigmav = //Elsevier
        LatexCmds.varsigma = //LaTeX
          bind(Variable, '\\varsigma ', '&sigmaf;');

        LatexCmds.thetav = //Elsevier and 9573-13
        LatexCmds.vartheta = //AMS and LaTeX
        LatexCmds.thetasym = //W3C/Unicode
          bind(Variable, '\\vartheta ', '&thetasym;');

        LatexCmds.upsilon = //AMS and LaTeX and W3C/Unicode
        LatexCmds.upsi = //Elsevier and 9573-13
          bind(Variable, '\\upsilon ', '&upsilon;');

        //these aren't even mentioned in the HTML character entity references
        LatexCmds.gammad = //Elsevier
        LatexCmds.Gammad = //9573-13 -- WTF, right? I dunno if this was a typo in the reference (see above)
        LatexCmds.digamma = //LaTeX
          bind(Variable, '\\digamma ', '&#989;');

        LatexCmds.kappav = //Elsevier
        LatexCmds.varkappa = //AMS and LaTeX
          bind(Variable, '\\varkappa ', '&#1008;');

        LatexCmds.rhov = //Elsevier and 9573-13
        LatexCmds.varrho = //AMS and LaTeX
          bind(Variable, '\\varrho ', '&#1009;');

        //Greek constants, look best in un-italicised Times New Roman
        LatexCmds.pi = LatexCmds['\u03C0'] = bind(NonSymbolaSymbol, '\\pi ', '&pi;');
        LatexCmds.theta = LatexCmds['\u03B8'] = bind(NonSymbolaSymbol, '\\theta ', '&theta;');
        LatexCmds.lambda = bind(NonSymbolaSymbol, '\\lambda ', '&lambda;');

        //uppercase greek letters

        LatexCmds.Upsilon = //LaTeX
        LatexCmds.Upsi = //Elsevier and 9573-13
        LatexCmds.upsih = //W3C/Unicode "upsilon with hook"
        LatexCmds.Upsih = //'cos it makes sense to me
          bind(Symbol, '\\Upsilon ', '<var style="font-family: serif">&upsih;</var>'); //Symbola's 'upsilon with a hook' is a capital Y without hooks :(

        //other symbols with the same LaTeX command and HTML character entity reference
        LatexCmds.Gamma =
        LatexCmds.Delta =
        LatexCmds.Theta =
        LatexCmds.Lambda =
        LatexCmds.Xi =
        LatexCmds.Pi =
        LatexCmds.Sigma =
        LatexCmds.Phi =
        LatexCmds.Psi =
        LatexCmds.Omega =
        LatexCmds.forall = P(VanillaSymbol, function (_, _super) {
            _.init = function (latex) {
                _super.init.call(this, '\\' + latex + ' ', '&' + latex + ';');
            };
        });

        // symbols that aren't a single MathCommand, but are instead a whole
        // Fragment. Creates the Fragment from a LaTeX string
        var LatexFragment = P(MathCommand, function (_) {
            _.init = function (latex) { this.latex = latex; };
            _.createBefore = function (cursor) { cursor.writeLatex(this.latex); };
            _.parser = function () {
                var frag = latexMathParser.parse(this.latex).children();
                return Parser.succeed(frag);
            };
        });

        // for what seems to me like [stupid reasons][1], Unicode provides
        // subscripted and superscripted versions of all ten Arabic numerals,
        // as well as [so-called "vulgar fractions"][2].
        // Nobody really cares about most of them, but some of them actually
        // predate Unicode, dating back to [ISO-8859-1][3], apparently also
        // known as "Latin-1", which among other things [Windows-1252][4]
        // largely coincides with, so Microsoft Word sometimes inserts them
        // and they get copy-pasted into MathQuill.
        //
        // (Irrelevant but funny story: Windows-1252 is actually a strict
        // superset of the "closely related but distinct"[3] "ISO 8859-1" --
        // see the lack of a dash after "ISO"? Completely different character
        // set, like elephants vs elephant seals, or "Zombies" vs "Zombie
        // Redneck Torture Family". What kind of idiot would get them confused.
        // People in fact got them confused so much, it was so common to
        // mislabel Windows-1252 text as ISO-8859-1, that most modern web
        // browsers and email clients treat the MIME charset of ISO-8859-1
        // as actually Windows-1252, behavior now standard in the HTML5 spec.)
        //
        // [1]: http://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts
        // [2]: http://en.wikipedia.org/wiki/Number_Forms
        // [3]: http://en.wikipedia.org/wiki/ISO/IEC_8859-1
        // [4]: http://en.wikipedia.org/wiki/Windows-1252
        LatexCmds['\u00b9'] = bind(LatexFragment, '^1');
        LatexCmds['\u00b2'] = bind(LatexFragment, '^2');
        LatexCmds['\u00b3'] = bind(LatexFragment, '^3');
        LatexCmds['\u00bc'] = bind(LatexFragment, '\\frac14');
        LatexCmds['\u00bd'] = bind(LatexFragment, '\\frac12');
        LatexCmds['\u00be'] = bind(LatexFragment, '\\frac34');
        LatexCmds['\u2152'] = bind(LatexFragment, '\\frac{1}{10}');
        LatexCmds['\u2153'] = bind(LatexFragment, '\\frac13');
        LatexCmds['\u2154'] = bind(LatexFragment, '\\frac23');


        var BinaryOperator = P(Symbol, function (_, _super) {
            _.init = function (ctrlSeq, html, text) {
                _super.init.call(this,
                  ctrlSeq, '<span class="mq-binary-operator">' + html + '</span>', text
                );
            };
            _.createBefore = function (cursor) {
                var ctrlSeq = cursor.prev.ctrlSeq + this.ctrlSeq;
                if (ctrlSeq === '<=' && cursor.overridenOperators && cursor.overridenOperators['le'])
                    cursor.backspace().insertNew(BinaryOperator('\\le ', '&le;'));
                else if (ctrlSeq === '>=' && cursor.overridenOperators && cursor.overridenOperators['ge'])
                    cursor.backspace().insertNew(BinaryOperator('\\ge ', '&ge;'));
                else
                    _super.createBefore.apply(this, arguments);
            };
        });

        var PlusMinus = P(BinaryOperator, function (_) {
            _.init = VanillaSymbol.prototype.init;

            _.respace = function () {
                if (!this.prev) {
                    this.jQ[0].className = '';
                }
                else if (
                  this.prev instanceof BinaryOperator &&
                  this.next && !(this.next instanceof BinaryOperator)
                ) {
                    this.jQ[0].className = 'mq-unary-operator';
                }
                else {
                    this.jQ[0].className = 'mq-binary-operator';
                }
                return this;
            };
        });

        LatexCmds['+'] = bind(PlusMinus, '+', '+');
        //yes, these are different dashes, I think one is an en dash and the other is a hyphen
        LatexCmds['\u2013'] = LatexCmds['\u2212'] = LatexCmds['-'] = bind(PlusMinus, '-', '&minus;');
        LatexCmds['\u00B1'] = LatexCmds.pm = LatexCmds.plusmn = LatexCmds.plusminus =
          bind(PlusMinus, '\\pm ', '&plusmn;');
        LatexCmds.mp = LatexCmds.mnplus = LatexCmds.minusplus =
          bind(PlusMinus, '\\mp ', '&#8723;');

        //CharCmds['*'] = 
        LatexCmds.sdot = LatexCmds.cdot =
          bind(BinaryOperator, '\\cdot ', '&middot;');
        //semantically should be &sdot;, but &middot; looks better

        LatexCmds.bull = LatexCmds.bullet = bind(BinaryOperator, '\\bullet ', '&bull;');


        LatexCmds['='] = bind(BinaryOperator, '=', '=');
        LatexCmds['<'] = bind(BinaryOperator, '<', '&lt;');
        LatexCmds['>'] = bind(BinaryOperator, '>', '&gt;');

        LatexCmds.notin =
        LatexCmds.sim =
        LatexCmds.cong =
        LatexCmds.equiv =
        LatexCmds.oplus =
        LatexCmds.otimes = P(BinaryOperator, function (_, _super) {
            _.init = function (latex) {
                _super.init.call(this, '\\' + latex + ' ', '&' + latex + ';');
            };
        });

        LatexCmds.times = bind(BinaryOperator, '\\times ', '&times;', '[x]');

        LatexCmds['\u00F7'] = LatexCmds.div = LatexCmds.divide = LatexCmds.divides =
          bind(BinaryOperator, '\\div ', '&divide;', '[/]');

        LatexCmds['\u2260'] = LatexCmds.ne = LatexCmds.neq = bind(BinaryOperator, '\\ne ', '&ne;');

        LatexCmds.ast = LatexCmds.star = LatexCmds.loast = LatexCmds.lowast =
          bind(BinaryOperator, '\\ast ', '&lowast;');
        //case 'there4 = // a special exception for this one, perhaps?
        LatexCmds.therefor = LatexCmds.therefore =
          bind(BinaryOperator, '\\therefore ', '&there4;');

        LatexCmds.cuz = // l33t
        LatexCmds.because = bind(BinaryOperator, '\\because ', '&#8757;');

        LatexCmds.prop = LatexCmds.propto = bind(BinaryOperator, '\\propto ', '&prop;');

        LatexCmds['\u2248'] = LatexCmds.asymp = LatexCmds.approx = bind(BinaryOperator, '\\approx ', '&asymp;');

        LatexCmds.lt = bind(BinaryOperator, '<', '&lt;');

        LatexCmds.gt = bind(BinaryOperator, '>', '&gt;');

        LatexCmds['\u2264'] = LatexCmds.le = LatexCmds.leq = bind(BinaryOperator, '\\le ', '&le;');

        LatexCmds['\u2265'] = LatexCmds.ge = LatexCmds.geq = bind(BinaryOperator, '\\ge ', '&ge;');

        LatexCmds.isin = LatexCmds['in'] = bind(BinaryOperator, '\\in ', '&isin;');

        LatexCmds.ni = LatexCmds.contains = bind(BinaryOperator, '\\ni ', '&ni;');

        LatexCmds.notni = LatexCmds.niton = LatexCmds.notcontains = LatexCmds.doesnotcontain =
          bind(BinaryOperator, '\\not\\ni ', '&#8716;');

        LatexCmds.sub = LatexCmds.subset = bind(BinaryOperator, '\\subset ', '&sub;');

        LatexCmds.sup = LatexCmds.supset = LatexCmds.superset =
          bind(BinaryOperator, '\\supset ', '&sup;');

        LatexCmds.nsub = LatexCmds.notsub =
        LatexCmds.nsubset = LatexCmds.notsubset =
          bind(BinaryOperator, '\\not\\subset ', '&#8836;');

        LatexCmds.nsup = LatexCmds.notsup =
        LatexCmds.nsupset = LatexCmds.notsupset =
        LatexCmds.nsuperset = LatexCmds.notsuperset =
          bind(BinaryOperator, '\\not\\supset ', '&#8837;');

        LatexCmds.sube = LatexCmds.subeq = LatexCmds.subsete = LatexCmds.subseteq =
          bind(BinaryOperator, '\\subseteq ', '&sube;');

        LatexCmds.supe = LatexCmds.supeq =
        LatexCmds.supsete = LatexCmds.supseteq =
        LatexCmds.supersete = LatexCmds.superseteq =
          bind(BinaryOperator, '\\supseteq ', '&supe;');

        LatexCmds.nsube = LatexCmds.nsubeq =
        LatexCmds.notsube = LatexCmds.notsubeq =
        LatexCmds.nsubsete = LatexCmds.nsubseteq =
        LatexCmds.notsubsete = LatexCmds.notsubseteq =
          bind(BinaryOperator, '\\not\\subseteq ', '&#8840;');

        LatexCmds.nsupe = LatexCmds.nsupeq =
        LatexCmds.notsupe = LatexCmds.notsupeq =
        LatexCmds.nsupsete = LatexCmds.nsupseteq =
        LatexCmds.notsupsete = LatexCmds.notsupseteq =
        LatexCmds.nsupersete = LatexCmds.nsuperseteq =
        LatexCmds.notsupersete = LatexCmds.notsuperseteq =
          bind(BinaryOperator, '\\not\\supseteq ', '&#8841;');

        LatexCmds.Box = bind(VanillaSymbol, '\\Box ', '\u25A1');
        LatexCmds.mid = bind(VanillaSymbol, '\\mid ', '\u2223'); //Sandeep K: abs/mod operator

        /*
        
        //the canonical sets of numbers
        LatexCmds.N = LatexCmds.naturals = LatexCmds.Naturals =
          bind(VanillaSymbol,'\\mathbb{N}','&#8469;');
        
        LatexCmds.P =
        LatexCmds.primes = LatexCmds.Primes =
        LatexCmds.projective = LatexCmds.Projective =
        LatexCmds.probability = LatexCmds.Probability =
          bind(VanillaSymbol,'\\mathbb{P}','&#8473;');
        
        LatexCmds.Z = LatexCmds.integers = LatexCmds.Integers =
          bind(VanillaSymbol,'\\mathbb{Z}','&#8484;');
        
        LatexCmds.Q = LatexCmds.rationals = LatexCmds.Rationals =
          bind(VanillaSymbol,'\\mathbb{Q}','&#8474;');
        
        LatexCmds.R = LatexCmds.reals = LatexCmds.Reals =
          bind(VanillaSymbol,'\\mathbb{R}','&#8477;');
        
        LatexCmds.C =
        LatexCmds.complex = LatexCmds.Complex =
        LatexCmds.complexes = LatexCmds.Complexes =
        LatexCmds.complexplane = LatexCmds.Complexplane = LatexCmds.ComplexPlane =
          bind(VanillaSymbol,'\\mathbb{C}','&#8450;');
        
        LatexCmds.H = LatexCmds.Hamiltonian = LatexCmds.quaternions = LatexCmds.Quaternions =
          bind(VanillaSymbol,'\\mathbb{H}','&#8461;');
        
        //spacing
        LatexCmds.quad = LatexCmds.emsp = bind(VanillaSymbol,'\\quad ','    ');
        LatexCmds.qquad = bind(VanillaSymbol,'\\qquad ','        ');
        spacing special characters, gonna have to implement this in LatexCommandInput::onText somehow
        case ',':
          return VanillaSymbol('\\, ',' ');
        case ':':
          return VanillaSymbol('\\: ','  ');
        case ';':
          return VanillaSymbol('\\; ','   ');
        case '!':
          return Symbol('\\! ','<span style="margin-right:-.2em"></span>');
        
        //binary operators
        LatexCmds.diamond = bind(VanillaSymbol, '\\diamond ', '&#9671;');
        LatexCmds.bigtriangleup = bind(VanillaSymbol, '\\bigtriangleup ', '&#9651;');
        LatexCmds.ominus = bind(VanillaSymbol, '\\ominus ', '&#8854;');
        LatexCmds.uplus = bind(VanillaSymbol, '\\uplus ', '&#8846;');
        LatexCmds.bigtriangledown = bind(VanillaSymbol, '\\bigtriangledown ', '&#9661;');
        LatexCmds.sqcap = bind(VanillaSymbol, '\\sqcap ', '&#8851;');
        LatexCmds.triangleleft = bind(VanillaSymbol, '\\triangleleft ', '&#8882;');
        LatexCmds.sqcup = bind(VanillaSymbol, '\\sqcup ', '&#8852;');
        LatexCmds.triangleright = bind(VanillaSymbol, '\\triangleright ', '&#8883;');
        LatexCmds.odot = bind(VanillaSymbol, '\\odot ', '&#8857;');
        LatexCmds.bigcirc = bind(VanillaSymbol, '\\bigcirc ', '&#9711;');
        LatexCmds.dagger = bind(VanillaSymbol, '\\dagger ', '&#0134;');
        LatexCmds.ddagger = bind(VanillaSymbol, '\\ddagger ', '&#135;');
        LatexCmds.wr = bind(VanillaSymbol, '\\wr ', '&#8768;');
        LatexCmds.amalg = bind(VanillaSymbol, '\\amalg ', '&#8720;');
        
        //relationship symbols
        LatexCmds.models = bind(VanillaSymbol, '\\models ', '&#8872;');
        LatexCmds.prec = bind(VanillaSymbol, '\\prec ', '&#8826;');
        LatexCmds.succ = bind(VanillaSymbol, '\\succ ', '&#8827;');
        LatexCmds.preceq = bind(VanillaSymbol, '\\preceq ', '&#8828;');
        LatexCmds.succeq = bind(VanillaSymbol, '\\succeq ', '&#8829;');
        LatexCmds.simeq = bind(VanillaSymbol, '\\simeq ', '&#8771;');
        LatexCmds.mid = bind(VanillaSymbol, '\\mid ', '&#8739;');
        LatexCmds.ll = bind(VanillaSymbol, '\\ll ', '&#8810;');
        LatexCmds.gg = bind(VanillaSymbol, '\\gg ', '&#8811;');
        LatexCmds.parallel = bind(VanillaSymbol, '\\parallel ', '&#8741;');
        LatexCmds.bowtie = bind(VanillaSymbol, '\\bowtie ', '&#8904;');
        LatexCmds.sqsubset = bind(VanillaSymbol, '\\sqsubset ', '&#8847;');
        LatexCmds.sqsupset = bind(VanillaSymbol, '\\sqsupset ', '&#8848;');
        LatexCmds.smile = bind(VanillaSymbol, '\\smile ', '&#8995;');
        LatexCmds.sqsubseteq = bind(VanillaSymbol, '\\sqsubseteq ', '&#8849;');
        LatexCmds.sqsupseteq = bind(VanillaSymbol, '\\sqsupseteq ', '&#8850;');
        LatexCmds.doteq = bind(VanillaSymbol, '\\doteq ', '&#8784;');
        LatexCmds.frown = bind(VanillaSymbol, '\\frown ', '&#8994;');
        LatexCmds.vdash = bind(VanillaSymbol, '\\vdash ', '&#8870;');
        LatexCmds.dashv = bind(VanillaSymbol, '\\dashv ', '&#8867;');
        
        //arrows
        LatexCmds.longleftarrow = bind(VanillaSymbol, '\\longleftarrow ', '&#8592;');
        LatexCmds.longrightarrow = bind(VanillaSymbol, '\\longrightarrow ', '&#8594;');
        LatexCmds.Longleftarrow = bind(VanillaSymbol, '\\Longleftarrow ', '&#8656;');
        LatexCmds.Longrightarrow = bind(VanillaSymbol, '\\Longrightarrow ', '&#8658;');
        LatexCmds.longleftrightarrow = bind(VanillaSymbol, '\\longleftrightarrow ', '&#8596;');
        LatexCmds.updownarrow = bind(VanillaSymbol, '\\updownarrow ', '&#8597;');
        LatexCmds.Longleftrightarrow = bind(VanillaSymbol, '\\Longleftrightarrow ', '&#8660;');
        LatexCmds.Updownarrow = bind(VanillaSymbol, '\\Updownarrow ', '&#8661;');
        LatexCmds.mapsto = bind(VanillaSymbol, '\\mapsto ', '&#8614;');
        LatexCmds.nearrow = bind(VanillaSymbol, '\\nearrow ', '&#8599;');
        LatexCmds.hookleftarrow = bind(VanillaSymbol, '\\hookleftarrow ', '&#8617;');
        LatexCmds.hookrightarrow = bind(VanillaSymbol, '\\hookrightarrow ', '&#8618;');
        LatexCmds.searrow = bind(VanillaSymbol, '\\searrow ', '&#8600;');
        LatexCmds.leftharpoonup = bind(VanillaSymbol, '\\leftharpoonup ', '&#8636;');
        LatexCmds.rightharpoonup = bind(VanillaSymbol, '\\rightharpoonup ', '&#8640;');
        LatexCmds.swarrow = bind(VanillaSymbol, '\\swarrow ', '&#8601;');
        LatexCmds.leftharpoondown = bind(VanillaSymbol, '\\leftharpoondown ', '&#8637;');
        LatexCmds.rightharpoondown = bind(VanillaSymbol, '\\rightharpoondown ', '&#8641;');
        LatexCmds.nwarrow = bind(VanillaSymbol, '\\nwarrow ', '&#8598;');
        
        //Misc
        */
        LatexCmds.space = bind(VanillaSymbol, '\\space ', '&nbsp;');
        /*
        LatexCmds.ldots = bind(VanillaSymbol, '\\ldots ', '&#8230;');
        LatexCmds.cdots = bind(VanillaSymbol, '\\cdots ', '&#8943;');
        LatexCmds.vdots = bind(VanillaSymbol, '\\vdots ', '&#8942;');
        LatexCmds.ddots = bind(VanillaSymbol, '\\ddots ', '&#8944;');
        LatexCmds.surd = bind(VanillaSymbol, '\\surd ', '&#8730;');
        LatexCmds.triangle = bind(VanillaSymbol, '\\triangle ', '&#9653;');
        LatexCmds.ell = bind(VanillaSymbol, '\\ell ', '&#8467;');
        LatexCmds.top = bind(VanillaSymbol, '\\top ', '&#8868;');
        LatexCmds.flat = bind(VanillaSymbol, '\\flat ', '&#9837;');
        LatexCmds.natural = bind(VanillaSymbol, '\\natural ', '&#9838;');
        LatexCmds.sharp = bind(VanillaSymbol, '\\sharp ', '&#9839;');
        LatexCmds.wp = bind(VanillaSymbol, '\\wp ', '&#8472;');
        LatexCmds.bot = bind(VanillaSymbol, '\\bot ', '&#8869;');
        LatexCmds.clubsuit = bind(VanillaSymbol, '\\clubsuit ', '&#9827;');
        LatexCmds.diamondsuit = bind(VanillaSymbol, '\\diamondsuit ', '&#9826;');
        LatexCmds.heartsuit = bind(VanillaSymbol, '\\heartsuit ', '&#9825;');
        LatexCmds.spadesuit = bind(VanillaSymbol, '\\spadesuit ', '&#9824;');
        
        //variable-sized
        LatexCmds.oint = bind(VanillaSymbol, '\\oint ', '&#8750;');
        LatexCmds.bigcap = bind(VanillaSymbol, '\\bigcap ', '&#8745;');
        LatexCmds.bigcup = bind(VanillaSymbol, '\\bigcup ', '&#8746;');
        LatexCmds.bigsqcup = bind(VanillaSymbol, '\\bigsqcup ', '&#8852;');
        LatexCmds.bigvee = bind(VanillaSymbol, '\\bigvee ', '&#8744;');
        LatexCmds.bigwedge = bind(VanillaSymbol, '\\bigwedge ', '&#8743;');
        LatexCmds.bigodot = bind(VanillaSymbol, '\\bigodot ', '&#8857;');
        LatexCmds.bigotimes = bind(VanillaSymbol, '\\bigotimes ', '&#8855;');
        LatexCmds.bigoplus = bind(VanillaSymbol, '\\bigoplus ', '&#8853;');
        LatexCmds.biguplus = bind(VanillaSymbol, '\\biguplus ', '&#8846;');
        
        //delimiters
        LatexCmds.lfloor = bind(VanillaSymbol, '\\lfloor ', '&#8970;');
        LatexCmds.rfloor = bind(VanillaSymbol, '\\rfloor ', '&#8971;');
        LatexCmds.lceil = bind(VanillaSymbol, '\\lceil ', '&#8968;');
        LatexCmds.rceil = bind(VanillaSymbol, '\\rceil ', '&#8969;');
        LatexCmds.slash = bind(VanillaSymbol, '\\slash ', '&#47;');
        LatexCmds.opencurlybrace = bind(VanillaSymbol, '\\opencurlybrace ', '&#123;');
        LatexCmds.closecurlybrace = bind(VanillaSymbol, '\\closecurlybrace ', '&#125;');
        
        //various symbols
        
        LatexCmds.caret = bind(VanillaSymbol,'\\caret ','^');
        LatexCmds.underscore = bind(VanillaSymbol,'\\underscore ','_');
        LatexCmds.backslash = bind(VanillaSymbol,'\\backslash ','\\');
        LatexCmds.vert = bind(VanillaSymbol,'|');
        LatexCmds.perp = LatexCmds.perpendicular = bind(VanillaSymbol,'\\perp ','&perp;');
        LatexCmds.nabla = LatexCmds.del = bind(VanillaSymbol,'\\nabla ','&nabla;');
        LatexCmds.hbar = bind(VanillaSymbol,'\\hbar ','&#8463;');
        
        LatexCmds.AA = LatexCmds.Angstrom = LatexCmds.angstrom =
          bind(VanillaSymbol,'\\text\\AA ','&#8491;');
        
        LatexCmds.ring = LatexCmds.circ = LatexCmds.circle =
          bind(VanillaSymbol,'\\circ ','&#8728;');
        
        LatexCmds.bull = LatexCmds.bullet = bind(VanillaSymbol,'\\bullet ','&bull;');
        
        LatexCmds.setminus = LatexCmds.smallsetminus =
          bind(VanillaSymbol,'\\setminus ','&#8726;');
        
        LatexCmds.not = //bind(Symbol,'\\not ','<span class="not">/</span>');
        LatexCmds['¬'] = LatexCmds.neg = bind(VanillaSymbol,'\\neg ','&not;');
        
        LatexCmds['…'] = LatexCmds.dots = LatexCmds.ellip = LatexCmds.hellip =
        LatexCmds.ellipsis = LatexCmds.hellipsis =
          bind(VanillaSymbol,'\\dots ','&hellip;');
        
        LatexCmds.converges =
        LatexCmds.darr = LatexCmds.dnarr = LatexCmds.dnarrow = LatexCmds.downarrow =
          bind(VanillaSymbol,'\\downarrow ','&darr;');
        
        LatexCmds.dArr = LatexCmds.dnArr = LatexCmds.dnArrow = LatexCmds.Downarrow =
          bind(VanillaSymbol,'\\Downarrow ','&dArr;');
        
        LatexCmds.diverges = LatexCmds.uarr = LatexCmds.uparrow =
          bind(VanillaSymbol,'\\uparrow ','&uarr;');
        
        LatexCmds.uArr = LatexCmds.Uparrow = bind(VanillaSymbol,'\\Uparrow ','&uArr;');
        
        LatexCmds.to = bind(BinaryOperator,'\\to ','&rarr;');
        
        LatexCmds.rarr = LatexCmds.rightarrow = bind(VanillaSymbol,'\\rightarrow ','&rarr;');
        
        LatexCmds.implies = bind(BinaryOperator,'\\Rightarrow ','&rArr;');
        
        LatexCmds.rArr = LatexCmds.Rightarrow = bind(VanillaSymbol,'\\Rightarrow ','&rArr;');
        
        LatexCmds.gets = bind(BinaryOperator,'\\gets ','&larr;');
        
        LatexCmds.larr = LatexCmds.leftarrow = bind(VanillaSymbol,'\\leftarrow ','&larr;');
        
        LatexCmds.impliedby = bind(BinaryOperator,'\\Leftarrow ','&lArr;');
        
        LatexCmds.lArr = LatexCmds.Leftarrow = bind(VanillaSymbol,'\\Leftarrow ','&lArr;');
        
        LatexCmds.harr = LatexCmds.lrarr = LatexCmds.leftrightarrow =
          bind(VanillaSymbol,'\\leftrightarrow ','&harr;');
        
        LatexCmds.iff = bind(BinaryOperator,'\\Leftrightarrow ','&hArr;');
        
        LatexCmds.hArr = LatexCmds.lrArr = LatexCmds.Leftrightarrow =
          bind(VanillaSymbol,'\\Leftrightarrow ','&hArr;');
        
        LatexCmds.Re = LatexCmds.Real = LatexCmds.real = bind(VanillaSymbol,'\\Re ','&real;');
        
        LatexCmds.Im = LatexCmds.imag =
        LatexCmds.image = LatexCmds.imagin = LatexCmds.imaginary = LatexCmds.Imaginary =
          bind(VanillaSymbol,'\\Im ','&image;');
        
        LatexCmds.part = LatexCmds.partial = bind(VanillaSymbol,'\\partial ','&part;');
        
        LatexCmds.inf = LatexCmds.infin = LatexCmds.infty = LatexCmds.infinity =
          bind(VanillaSymbol,'\\infty ','&infin;');
        
        LatexCmds.alef = LatexCmds.alefsym = LatexCmds.aleph = LatexCmds.alephsym =
          bind(VanillaSymbol,'\\aleph ','&alefsym;');
        
        LatexCmds.xist = //LOL
        LatexCmds.xists = LatexCmds.exist = LatexCmds.exists =
          bind(VanillaSymbol,'\\exists ','&exist;');
        */
        LatexCmds.and = LatexCmds.land = LatexCmds.wedge =
          bind(VanillaSymbol, '\\wedge ', '&and;');

        LatexCmds.or = LatexCmds.lor = LatexCmds.vee = bind(VanillaSymbol, '\\vee ', '&or;');
        /*
        LatexCmds.o = LatexCmds.O =
        LatexCmds.empty = LatexCmds.emptyset =
        LatexCmds.oslash = LatexCmds.Oslash =
        LatexCmds.nothing = LatexCmds.varnothing =
          bind(BinaryOperator,'\\varnothing ','&empty;');
        
        LatexCmds.cup = LatexCmds.union = bind(BinaryOperator,'\\cup ','&cup;');
        
        LatexCmds.cap = LatexCmds.intersect = LatexCmds.intersection =
          bind(BinaryOperator,'\\cap ','&cap;');
        
        LatexCmds.deg = LatexCmds.degree = bind(VanillaSymbol,'^\\circ ','&deg;');
        
        LatexCmds.ang = LatexCmds.angle = bind(VanillaSymbol,'\\angle ','&ang;');
        */
        // Parser MathCommand
        var latexMathParser = (function () {
            function commandToBlock(cmd) {
                var block = MathBlock();
                cmd.adopt(block, 0, 0);
                return block;
            }
            function joinBlocks(blocks) {
                var firstBlock = blocks[0] || MathBlock();

                for (var i = 1; i < blocks.length; i += 1) {
                    blocks[i].children().adopt(firstBlock, firstBlock.lastChild, 0);
                }

                return firstBlock;
            }

            var string = Parser.string;
            var regex = Parser.regex;
            var letter = Parser.letter;
            var any = Parser.any;
            var optWhitespace = Parser.optWhitespace;
            var succeed = Parser.succeed;
            var fail = Parser.fail;

            // Parsers yielding MathCommands
            var variable = letter.map(Variable);
            var symbol = regex(/^[^${}\\_^]/).map(VanillaSymbol);

            var controlSequence =
              regex(/^[^\\]/)
              .or(string('\\').then(
                regex(/^[a-z]+/i)
                .or(regex(/^\s+/).result(' '))
                .or(any)
              )).then(function (ctrlSeq) {
                  var cmdKlass = LatexCmds[ctrlSeq];

                  if (cmdKlass) {
                      return cmdKlass(ctrlSeq).parser();
                  }
                  else {
                      return fail('unknown command: \\' + ctrlSeq);
                  }
              })
            ;

            var command =
              controlSequence
              .or(variable)
              .or(symbol)
            ;

            // Parsers yielding MathBlocks
            var mathGroup = string('{').then(function () { return mathSequence; }).skip(string('}'));
            var mathBlock = optWhitespace.then(mathGroup.or(command.map(commandToBlock)));
            var mathSequence = mathBlock.many().map(joinBlocks).skip(optWhitespace);

            var optMathBlock =
              string('[').then(
                mathBlock.then(function (block) {
                    return block.join('latex') !== ']' ? succeed(block) : fail();
                })
                .many().map(joinBlocks).skip(optWhitespace)
              ).skip(string(']'))
            ;

            var latexMath = mathSequence;

            latexMath.block = mathBlock;
            latexMath.optBlock = optMathBlock;
            return latexMath;
        })();
        /********************************************
         * Cursor and Selection "singleton" classes
         *******************************************/

        /* The main thing that manipulates the Math DOM. Makes sure to manipulate the
        HTML DOM to match. */

        /* Sort of singletons, since there should only be one per editable math
        textbox, but any one HTML document can contain many such textboxes, so any one
        JS environment could actually contain many instances. */

        //A fake cursor in the fake textbox that the math is rendered in.
        var Cursor = P(function (_) {
            _.init = function (root) {
                this.parent = this.root = root;
                var jQ = this.jQ = this._jQ = $('<span class="mq-cursor"><span class="mq-line">&zwj;</span></span>');

                //closured for setInterval
                this.blink = function () { jQ.toggleClass('mq-blink'); }

                this.upDownCache = {};

                this.handle = $('<span class="mq-handle"></span>');
                this.handleAnchor = $('<span class="mq-handle-anchor" ' +
                                            'style="display:none"></span>')
                                    .append(this.handle).insertAfter(root.jQ);
                this.handleAnchor.top = this.handleAnchor.left = 0;
            };

            _.prev = 0;
            _.next = 0;
            _.parent = 0;            
            _.showHandle = function () {
                if (!this.handleAnchor.visible) {
                    this.handleAnchor.show();
                    this.repositionHandle(this.jQ[0].getBoundingClientRect());
                    this.handleAnchor.visible = true;
                }
                return this;
            };
            _.hideHandle = function () {
                if (this.handleAnchor.visible) {
                    this.handleAnchor.hide();
                    delete this.handleAnchor.visible;
                }
                return this;
            };
            _.repositionHandle = function (cursorRect) {
                var anchor = this.handleAnchor;
                var anchorRect = anchor[0].getBoundingClientRect();
                anchor.css({
                    top: anchor.top += cursorRect.bottom - anchorRect.bottom,
                    left: anchor.left += cursorRect.left - anchorRect.left
                });
            };
            _.show = function (keepHandle) {
                if (!keepHandle) this.hideHandle();
                this.jQ = this._jQ.removeClass('mq-blink');
                if ('intervalId' in this) //already was shown, just restart interval
                    clearInterval(this.intervalId);
                else { //was hidden and detached, insert this.jQ back into HTML DOM
                    if (this.next) {
                        if (this.selection && this.selection.first.prev === this.prev)
                            this.jQ.insertBefore(this.selection.jQ);
                        else
                            this.jQ.insertBefore(this.next.jQ.first());
                    }
                    else
                        this.jQ.appendTo(this.parent.jQ);
                    this.parent.focus();
                }
                this.intervalId = setInterval(this.blink, 500);
                return this;
            };
            _.hide = function () {
                this.hideHandle();
                if ('intervalId' in this)
                    clearInterval(this.intervalId);
                delete this.intervalId;
                this.jQ.detach();
                this.jQ = $();
                return this;
            };
            _.insertAt = function (parent, prev, next) {
                var old_parent = this.parent;

                this.parent = parent;
                this.prev = prev;
                this.next = next;

                old_parent.blur(); //blur may need to know cursor's destination
            };
            _.insertBefore = function (el) {
                this.insertAt(el.parent, el.prev, el)
                this.parent.jQ.addClass('mq-hasCursor');
                this.jQ.insertBefore(el.jQ.first());
                return this;
            };
            _.insertAfter = function (el) {
                this.insertAt(el.parent, el, el.next);
                this.parent.jQ.addClass('mq-hasCursor');
                this.jQ.insertAfter(el.jQ.last());
                return this;
            };
            _.prependTo = function (el) {
                this.insertAt(el, 0, el.firstChild);
                this.jQ.prependTo(el.jQ);
                el.focus();
                return this;
            };
            _.appendTo = function (el) {
                this.insertAt(el, el.lastChild, 0);
                this.jQ.appendTo(el.jQ);
                el.focus();
                return this;
            };
            _.hopLeft = function () {
                this.jQ.insertBefore(this.prev.jQ.first());
                this.next = this.prev;
                this.prev = this.prev.prev;
                return this;
            };
            _.hopRight = function () {
                this.jQ.insertAfter(this.next.jQ.last());
                this.prev = this.next;
                this.next = this.next.next;
                return this;
            };
            _.moveLeftWithin = function (block) {
                if (this.prev) {
                    // FIXME HACK: when moving right to left, want to go into NthRoot's body,
                    // which is its lastChild.
                    if (this.prev instanceof NthRoot) this.appendTo(this.prev.lastChild);
                    else if (this.prev instanceof Fraction) this.appendTo(this.prev.lastChild);
                    else if (this.prev.prev == 0 && this.parent != 0 && this.parent.parent != 0 && this.parent.parent instanceof Fraction && typeof this.parent.up != 'undefined') {
                        //Hack by Sandeep K: begining of denominator, has parent, has grand parent, grand parent is fraction, you are in denominator
                        this.appendTo(this.parent.parent.firstChild);
                    }
                    else if (this.prev.up instanceof MathBlock) this.appendTo(this.prev.up);
                    else if (this.prev.firstChild) this.appendTo(this.prev.firstChild);
                    else this.hopLeft();
                }
                else {
                    // unless we're at the beginning of the containing block, escape left
                    if (this.parent !== block) this.insertBefore(this.parent.parent);
                    else if (block.moveOutOf) block.moveOutOf('left', this);
                }
            };
            _.moveRightWithin = function (block) {
                if (this.next) {
                    if (this.next.up instanceof MathBlock) this.prependTo(this.next.up);
                    else if (this.next.next == 0 && this.parent != 0 && this.parent.parent != 0 && this.parent.parent instanceof Fraction && typeof this.parent.down != 'undefined') {
                        //Hack by Sandeep K: end of numerator, has parent, has grand parent, grand parent is fraction, you are in numerator
                        this.prependTo(this.parent.parent.lastChild);
                    }
                    else if (this.next.firstChild) this.prependTo(this.next.firstChild);
                    else this.hopRight();
                }
                else {
                    // unless we're at the beginning of the containing block, escape left
                    if (this.parent !== block) this.insertAfter(this.parent.parent);
                    else if (block.moveOutOf) block.moveOutOf('right', this);
                }
            };
            _.moveLeft = function () {
                clearUpDownCache(this);

                if (this.selection)
                    this.insertBefore(this.selection.first).clearSelection();
                else {
                    this.moveLeftWithin(this.root);
                }
                this.root.triggerSpecialEvent('cursorMoved');
                return this.show();
            };
            _.moveRight = function () {
                clearUpDownCache(this);

                if (this.selection)
                    this.insertAfter(this.selection.last).clearSelection();
                else {
                    this.moveRightWithin(this.root);
                }
                this.root.triggerSpecialEvent('cursorMoved');
                return this.show();
            };

            /**
             * moveUp and moveDown have almost identical algorithms:
             * - first check next and prev, if so prepend/appendTo them
             * - else check the parent's 'up'/'down' property - if it's a function,
             *   call it with the cursor as the sole argument and use the return value.
             *
             *   Given undefined, will bubble up to the next ancestor block.
             *   Given false, will stop bubbling.
             *   Given a MathBlock,
             *     + moveUp will appendTo it
             *     + moveDown will prependTo it
             *
             */
            _.moveUp = function () { return moveUpDown(this, 'up'); };
            _.moveDown = function () { return moveUpDown(this, 'down'); };
            function moveUpDown(self, dir) {
                if (self.next[dir]) self.prependTo(self.next[dir]);
                else if (self.prev[dir]) self.appendTo(self.prev[dir]);
                else {
                    var ancestorBlock = self.parent;
                    do {
                        var prop = ancestorBlock[dir];
                        if (prop) {
                            if (typeof prop === 'function') prop = ancestorBlock[dir](self);
                            if (prop === false || prop instanceof MathBlock) {
                                self.upDownCache[ancestorBlock.id] = { parent: self.parent, prev: self.prev, next: self.next };

                                if (prop instanceof MathBlock) {
                                    var cached = self.upDownCache[prop.id];

                                    if (cached) {
                                        if (cached.next) {
                                            self.insertBefore(cached.next);
                                        } else {
                                            self.appendTo(cached.parent);
                                        }
                                    } else {
                                        var coords = self.jQ[0].getBoundingClientRect();
                                        var cachedClientRect = cachedClientRectFnForNewCache();
                                        cachedClientRect.scrollLeft = 0; // only used in this event thread
                                        prop.seek(self, coords.left, coords.bottom, prop, cachedClientRect);
                                    }
                                }
                                break;
                            }
                        }
                        ancestorBlock = ancestorBlock.parent.parent;
                    } while (ancestorBlock);
                }

                return self.clearSelection().show();
            }

            _.seek = function (target, clientX, clientY, clientRect, keepHandle) {
                clearUpDownCache(this);
                var cursor = this.clearSelection().show(keepHandle);

                var nodeId = target.attr(mqBlockId) || target.attr(mqCmdId);
                if (!nodeId) {
                    var targetParent = target.parent();
                    nodeId = targetParent.attr(mqBlockId) || targetParent.attr(mqCmdId);
                }
                var node = nodeId ? MathElement[nodeId] : cursor.root;
                pray('nodeId is the id of some Node that exists', node);

                var dx = clientRect.scrollLeft = this.root.jQ.scrollLeft();
                node.seek(cursor, clientX + dx, clientY, cursor.root, clientRect);
                delete clientRect.scrollLeft; // be defensive: was only valid in this event
                // thread, unlike the cache of clientRect's

                this.root.scrollHoriz(); // before .selectFrom when mouse-selecting, so
                // always hits no-selection case in scrollHoriz and scrolls slower

                return cursor;
            };
            function offset(self) {
                //in Opera 11.62, .getBoundingClientRect() and hence jQuery::offset()
                //returns all 0's on inline elements with negative margin-right (like
                //the cursor) at the end of their parent, so temporarily remove the
                //negative margin-right when calling jQuery::offset()
                //Opera bug DSK-360043
                //http://bugs.jquery.com/ticket/11523
                //https://github.com/jquery/jquery/pull/717
                var offset = self.jQ.removeClass('mq-cursor').offset();
                self.jQ.addClass('mq-cursor');
                return offset;
            }
            _.writeLatex = function (latex) {
                var self = this;
                clearUpDownCache(self);
                self.show().deleteSelection();

                var all = Parser.all;
                var eof = Parser.eof;

                var block = latexMathParser.skip(eof).or(all.result(false)).parse(latex);

                if (block && !block.isEmpty()) {
                    block.children().adopt(self.parent, self.prev, self.next);
                    var html = block.join('html');
                    var jQ = MathElement.jQize(html);
                    jQ.insertBefore(self.jQ);
                    self.prev = block.lastChild;
                    block.finalizeInsert();
                    self.parent.bubble('redraw');
                }

                return this;
            };
            //Hack Sandeep K: auto correct trig functions
            _.autoCorrect = function (latex) {
                var cursor = this;
                //Hack Sandeep K: insertsource 0 shows as independent fraction
                if (latex == ' ' && !cursor._superMode) {
                    cursor._superMode = true;
                } else {
                    if (latex == '/' && cursor._superMode) {
                        cursor.setFractionMode(0);
                    }
                    cursor._superMode = false;
                }

                //Hack Sandeep K: user types arc using keyboard and then clicks sin from on-screen button                                
                if (/(\\sin|\\cos|\\tan)/gi.test(latex) || (cursor.next && /(\\sin|\\cos|\\tan)/gi.test(cursor.next.ctrlSeq))) {
                    var ctrlSeq = "", i = 0;
                    for (var prev = cursor.prev; prev && prev instanceof Variable; prev = prev.prev)
                        ctrlSeq = prev.ctrlSeq + ctrlSeq;
                    
                    if (/arc$/.test(ctrlSeq)) {
                        for (i = 0; i < 3; i++)
                            cursor.backspace(); //clear arc characters                                            
                        latex = 'arc' + latex.slice(1); //update latex with inverse trig functions
                    } else if (/ar$/.test(ctrlSeq) && latex == 'c') {
                        latex = cursor.next.ctrlSeq.replace('\\', 'arc').replace(/\ /g, '');
                        cursor.moveRight();
                        for (i = 0; i < 3; i++)
                            cursor.backspace(); //clear ar characters 
                    } else if (/(\\sin|\\cos|\\tan)/gi.test(latex))
                        latex = latex.slice(1);
                }
                return latex;
            };            
            _._superMode = false; //add additional behaviour to known keys
            _._fractionModeId = 0; // 0 = placeholders for num/den, 1 = placeholders for den
            _.setFractionMode = function (value) {
                this._fractionModeId = value;
            };
            _.getFractionMode = function () {
                return this._fractionModeId;
            };
            _.write =
            _.insertCh = function (ch, overrideRestrictForCh) {
                var updatedCh = this.autoCorrect(ch);
                if (updatedCh != ch && updatedCh.length > 1) {
                    return this.insertCmd(updatedCh);
                }
                
                overrideRestrictForCh = (typeof overrideRestrictForCh == 'undefined') ? false : overrideRestrictForCh; //Hack
                // Hack by Balaji: Check if the ch entered is permissible based on terms allowed to be entered by the student
                var permitKey = function(cursor, keyPressed) {                           
                    var ctrlSeq = "";
                    for (var prev = cursor.prev; prev && prev instanceof Variable; prev = prev.prev)
                        ctrlSeq = prev.ctrlSeq + ctrlSeq;

                    ctrlSeq += keyPressed;

                    for (var next = cursor.next; next && next instanceof Variable; next = next.next)
                        ctrlSeq = ctrlSeq + next.ctrlSeq;

                    //return window.AllowedKeysMap.match(ctrlSeq);
                    return cursor.restrictContentKeys.match(ctrlSeq);
                };
     
                if (!overrideRestrictForCh) {
                    if (this.restrictContentKeys && !permitKey(this, ch))
                        return;
                }

                //Hack by Sandeep B: override multiple operator based on content 
                if (this.overridenOperators && this.overridenOperators[ch])
                    ch = this.overridenOperators[ch];

                //Hack by Eli: don't exponentiate if there's nothing before the cursor
                if ((ch == '^' || ch == '_') && !this.prev) return;

                //Hack #2 by Eli: if you type '+' or '-' or '=' in an exponent or subscript, break out of it
                //Hack #2 modified By Sandeep K: ch == '+' || ch == '-' || 
                if ((ch == '=' || ch == '<' || ch == '>' || ch == '≥' || ch == '≤') && (this.parent.parent.ctrlSeq === '^' || this.parent.parent.ctrlSeq === '_')
                  && !this.next && this.prev
                ) {
                    this.moveRight();
                }

                //Hack #3 by Eli: if you type "^" just after a superscript, behave as though you just pressed up
                if (ch === '^' && this.prev instanceof SupSub &&
                    //note: need both of these, because if it's a superscript and subscript,
                    //those could appear in either order
                  (this.prev.ctrlSeq === '^' || this.prev.prev.ctrlSeq === '^')) {
                    this.moveUp();
                    return;
                }

                //Hack #4 by Eli: if you type "^" just _before_ a superscript, behave as though you just pressed up
                if (ch === '^' && this.next instanceof SupSub &&
                    //note: need both of these, because if it's a superscript and subscript,
                    //those could appear in either order
                  (this.next.ctrlSeq === '^' || (this.next.next && this.next.next.ctrlSeq === '^'))) {
                    this.moveUp();
                    return;
                }


                if (ch === '_' && this.prev instanceof SupSub &&
                    //note: need both of these, because if it's a superscript and subscript,
                    //those could appear in either order
                  (this.prev.ctrlSeq === '_' || this.prev.prev.ctrlSeq === '_')) {
                    this.moveDown();
                    return;
                }

                clearUpDownCache(this);
                this.show();

                //Hack by Sandeep K: sync keyboard and on-screen keypad button for *
                if (ch == '*' && typeof CharCmds[ch] == 'undefined') {
                    CharCmds['*'] = LatexCmds.ast;
                }
                else if (ch == '∙' && typeof CharCmds[ch] == 'undefined') {
                    CharCmds['∙'] = LatexCmds.bullet;
                }

                var cmd;
                if (ch.match(/^[a-z]$/i))
                    cmd = Variable(ch);
                else if (cmd = CharCmds[ch] || LatexCmds[ch])
                    cmd = cmd(ch);
                else
                    cmd = VanillaSymbol(ch);

                if (this.selection) {
                    this.prev = this.selection.first.prev;
                    this.next = this.selection.last.next;
                    cmd.replaces(this.selection);
                    delete this.selection;
                }

                return this.insertNew(cmd);
            };
            _.insertNew = function (cmd) {
                cmd.createBefore(this);
                return this;
            };
            _.insertCmd = function (latexCmd, replacedFragment) {
                clearUpDownCache(this);
                this.show();
                if (/(\\sin|\\cos|\\tan)/gi.test('\\' + latexCmd))
                    latexCmd = this.autoCorrect('\\' + latexCmd);

                var cmd = LatexCmds[latexCmd];
                if (cmd) {
                    cmd = cmd(latexCmd);
                    if (replacedFragment) cmd.replaces(replacedFragment);
                    this.insertNew(cmd);
                }
                else {
                    cmd = TextBlock();
                    cmd.replaces(latexCmd);
                    cmd.firstChild.focus = function () { delete this.focus; return this; };
                    this.insertNew(cmd).insertAfter(cmd);
                    if (replacedFragment)
                        replacedFragment.remove();
                }
                return this;
            };
            _.unwrapGramp = function () {
                var gramp = this.parent.parent;
                var greatgramp = gramp.parent;
                var next = gramp.next;
                var cursor = this;

                var prev = gramp.prev;
                gramp.disown().eachChild(function (uncle) {
                    if (uncle.isEmpty()) return;

                    uncle.children()
                      .adopt(greatgramp, prev, next)
                      .each(function (cousin) {
                          cousin.jQ.insertBefore(gramp.jQ.first());
                      })
                    ;

                    prev = uncle.lastChild;
                });

                if (!this.next) { //then find something to be next to insertBefore
                    if (this.prev)
                        this.next = this.prev.next;
                    else {
                        while (!this.next) {
                            this.parent = this.parent.next;
                            if (this.parent)
                                this.next = this.parent.firstChild;
                            else {
                                this.next = gramp.next;
                                this.parent = greatgramp;
                                break;
                            }
                        }
                    }
                }
                if (this.next)
                    this.insertBefore(this.next);
                else
                    this.appendTo(greatgramp);

                gramp.jQ.remove();

                if (gramp.prev)
                    gramp.prev.respace();
                if (gramp.next)
                    gramp.next.respace();
            };
            _.backspace = function () {
                clearUpDownCache(this);
                this.show();

                if (this.deleteSelection()); // pass
                else if (this.prev) {
                    if (this.prev.isEmpty()) {
                        if (this.prev.ctrlSeq === '\\le ') var ins = LatexCmds['<']('<');
                        else if (this.prev.ctrlSeq === '\\ge ') var ins = LatexCmds['>']('>');
                        this.prev = this.prev.remove().prev;
                        if (ins) this.insertNew(ins);
                    }
                    else if (this.prev instanceof Bracket)
                        return this.appendTo(this.prev.firstChild).deleteForward();
                    else
                        this.selectLeft();
                }
                else if (this.parent !== this.root) {
                    if (this.parent.parent.isEmpty())
                        return this.insertAfter(this.parent.parent).backspace();
                    else if (this.next instanceof Bracket)
                        return this.prependTo(this.next.firstChild).backspace();
                    else
                        this.unwrapGramp();
                }
                else this.root.triggerSpecialEvent('backspacePressed');

                if (this.prev)
                    this.prev.respace();
                if (this.next)
                    this.next.respace();
                this.parent.bubble('redraw');

                return this;
            };
            _.deleteForward = function () {
                clearUpDownCache(this);
                this.show();

                if (this.deleteSelection()); // pass
                else if (this.next) {
                    if (this.next.isEmpty())
                        this.next = this.next.remove().next;
                    else
                        this.selectRight();
                }
                else if (this.parent !== this.root) {
                    if (this.parent.parent.isEmpty())
                        return this.insertBefore(this.parent.parent).deleteForward();
                    else
                        this.unwrapGramp();
                }
                else this.root.triggerSpecialEvent('delPressed');

                if (this.prev)
                    this.prev.respace();
                if (this.next)
                    this.next.respace();
                this.parent.bubble('redraw');

                return this;
            };
            _.selectFrom = function (anticursor) {
                //find ancestors of each with common parent
                var oneA = this, otherA = anticursor; //one ancestor, the other ancestor
                loopThroughAncestors: do {
                    for (var oneI = this; oneI !== oneA.parent.parent; oneI = oneI.parent.parent) //one intermediate, the other intermediate
                        if (oneI.parent === otherA.parent) {
                            left = oneI;
                            right = otherA;
                            break loopThroughAncestors;
                        }

                    for (var otherI = anticursor; otherI !== otherA.parent.parent; otherI = otherI.parent.parent)
                        if (oneA.parent === otherI.parent) {
                            left = oneA;
                            right = otherI;
                            break loopThroughAncestors;
                        }

                    if (oneA.parent.parent)
                        oneA = oneA.parent.parent;
                    if (otherA.parent.parent)
                        otherA = otherA.parent.parent;
                } while (oneA.parent.parent || otherA.parent.parent || oneA.parent === otherA.parent);
                // the only way for this condition to fail is if A and B are in separate
                // trees, which should be impossible, but infinite loops must never happen,
                // even under error conditions.
                pray('cursor and anticursor are in the same tree',
                     oneA.parent.parent || otherA.parent.parent || oneA.parent === otherA.parent);

                //figure out which is left/prev and which is right/next
                var left, right, leftRight;
                if (left.next !== right) {
                    for (var next = left; next; next = next.next) {
                        if (next === right.prev) {
                            leftRight = true;
                            break;
                        }
                    }
                    if (!leftRight) {
                        leftRight = right;
                        right = left;
                        left = leftRight;
                    }
                }
                this.hide().selection = Selection(left.prev.next || left.parent.firstChild, right.next.prev || right.parent.lastChild);
                this.insertAfter(right.next.prev || right.parent.lastChild);
                this.root.selectionChanged();
            };
            _.selectLeft = function () {
                clearUpDownCache(this);
                if (this.selection) {
                    if (this.selection.first === this.next) { //if cursor is at left edge of selection;
                        if (this.prev) //then extend left if possible
                            this.hopLeft().selection.extendLeft();
                        else if (this.parent !== this.root) //else level up if possible
                            this.insertBefore(this.parent.parent).selection.levelUp();
                    }
                    else { //else cursor is at right edge of selection, retract left if possible
                        this.hopLeft();
                        if (this.selection.first === this.selection.last) {
                            this.clearSelection().show(); //clear selection if retracting to nothing
                            return; //skip this.root.selectionChanged(), this.clearSelection() does it anyway
                        }
                        this.selection.retractLeft();
                    }
                }
                else {
                    if (this.prev)
                        this.hopLeft();
                    else //end of a block
                        if (this.parent !== this.root)
                            this.insertBefore(this.parent.parent);
                        else
                            return;

                    this.hide().selection = Selection(this.next);
                }
                this.root.selectionChanged();
            };
            _.selectRight = function () {
                clearUpDownCache(this);
                if (this.selection) {
                    if (this.selection.last === this.prev) { //if cursor is at right edge of selection;
                        if (this.next) //then extend right if possible
                            this.hopRight().selection.extendRight();
                        else if (this.parent !== this.root) //else level up if possible
                            this.insertAfter(this.parent.parent).selection.levelUp();
                    }
                    else { //else cursor is at left edge of selection, retract right if possible
                        this.hopRight();
                        if (this.selection.first === this.selection.last) {
                            this.clearSelection().show(); //clear selection if retracting to nothing
                            return; //skip this.root.selectionChanged(), this.clearSelection() does it anyway
                        }
                        this.selection.retractRight();
                    }
                }
                else {
                    if (this.next)
                        this.hopRight();
                    else //end of a block
                        if (this.parent !== this.root)
                            this.insertAfter(this.parent.parent);
                        else
                            return;

                    this.hide().selection = Selection(this.prev);
                }
                this.root.selectionChanged();
            };

            function clearUpDownCache(self) {
                self.upDownCache = {};
            }

            _.prepareMove = function () {
                clearUpDownCache(this);
                return this.show().clearSelection();
            };

            _.prepareEdit = function () {
                clearUpDownCache(this);
                return this.show().deleteSelection();
            }

            _.clearSelection = function () {
                if (this.selection) {
                    this.selection.clear();
                    delete this.selection;
                    this.root.selectionChanged();
                }
                return this;
            };
            _.deleteSelection = function () {
                if (!this.selection) return false;

                this.prev = this.selection.first.prev;
                this.next = this.selection.last.next;
                this.selection.remove();
                this.root.selectionChanged();
                return delete this.selection;
            };
        });

        var Selection = P(MathFragment, function (_, _super) {
            _.init = function () {
                var frag = this;
                _super.init.apply(frag, arguments);

                frag.jQwrap(frag.jQ);
            };
            _.jQwrap = function (children) {
                this.jQ = children.wrapAll('<span class="mq-selection"></span>').parent();
                //can't do wrapAll(this.jQ = $(...)) because wrapAll will clone it
            };
            _.adopt = function () {
                this.jQ.replaceWith(this.jQ = this.jQ.children());
                return _super.adopt.apply(this, arguments);
            };
            _.clear = function () {
                this.jQ.replaceWith(this.jQ.children());
                return this;
            };
            _.levelUp = function () {
                var seln = this,
                  gramp = seln.first = seln.last = seln.last.parent.parent;
                seln.clear().jQwrap(gramp.jQ);
                return seln;
            };
            _.extendLeft = function () {
                this.first = this.first.prev;
                this.first.jQ.prependTo(this.jQ);
            };
            _.extendRight = function () {
                this.last = this.last.next;
                this.last.jQ.appendTo(this.jQ);
            };
            _.retractRight = function () {
                this.first.jQ.insertBefore(this.jQ);
                this.first = this.first.next;
            };
            _.retractLeft = function () {
                this.last.jQ.insertAfter(this.jQ);
                this.last = this.last.prev;
            };
        });
        /*********************************************************
         * The actual jQuery plugin and document ready handlers.
         ********************************************************/

        //The publicy exposed method of jQuery.prototype, available (and meant to be
        //called) on jQuery-wrapped HTML DOM elements.
        $.fn.mathquill = function (cmd, latex) {
            switch (cmd) {
                case 'focus':
                case 'blur':
                    return this.each(function () {
                        var blockId = $(this).attr(mqBlockId),
                          block = blockId && MathElement[blockId];
                        if (block && block.textarea)
                            block.textarea.children().trigger(cmd);
                    });
                case 'onKey':
                case 'onText':
                    return this.each(function () {
                        var blockId = $(this).attr(mqBlockId),
                          block = blockId && MathElement[blockId],
                          cursor = block && block.cursor;

                        if (cursor) {
                            cursor.parent.bubble(cmd, latex, { preventDefault: noop });
                            if (block.blurred) cursor.hide().parent.blur();
                        }
                    });
                case 'redraw':
                    return this.each(function () {
                        var blockId = $(this).attr(mqBlockId),
                          rootBlock = blockId && MathElement[blockId];
                        if (rootBlock) {
                            (function postOrderRedraw(el) {
                                el.eachChild(postOrderRedraw);
                                if (el.redraw) el.redraw();
                            }(rootBlock));
                        }
                    });
                case 'revert':
                    return this.each(function () {
                        var blockId = $(this).attr(mqBlockId),
                          block = blockId && MathElement[blockId];
                        if (block && block.revert)
                            block.revert();
                    });
                case 'sliderLatex':
                    return this.each(function () {
                        var blockId = $(this).attr(mqBlockId),
                          block = blockId && MathElement[blockId];
                        if (block) {

                            //fixes bug with highlighting everything and then setting state with latex
                            //https://github.com/desmosinc/knox/issues/1115
                            cursor = block && block.cursor;
                            if (cursor) cursor.clearSelection();
                            block.renderSliderLatex(latex);
                            block.triggerSpecialEvent('render');
                        }
                    });
                case 'latex':
                    if (arguments.length > 1) {
                        return this.each(function () {
                            var blockId = $(this).attr(mqBlockId),
                              block = blockId && MathElement[blockId];
                            if (block) {
                                //fixes bug with highlighting everything and then setting state with latex
                                //https://github.com/desmosinc/knox/issues/1115
                                cursor = block && block.cursor;
                                if (cursor) cursor.clearSelection();
                                block.renderLatex(latex);
                                block.triggerSpecialEvent('render');
                            }
                        });
                    }

                    var blockId = $(this).attr(mqBlockId),
                      block = blockId && MathElement[blockId];
                    return block && block.latex();
                case 'mqLatex':
                    var blockId = $(this).attr(mqBlockId),
                      block = blockId && MathElement[blockId];
                    return block && block.mqLatex();
                case 'text':
                    var blockId = $(this).attr(mqBlockId),
                      block = blockId && MathElement[blockId];
                    return block && block.text();
                case 'html':
                    return this.children('.mathquill-root-block').html().replace(/ ?mq-hasCursor|mq-hasCursor /, '')
                      .replace(/ class=(""|(?= |>))/g, '')
                      .replace(/<span class="?mq-cursor( mq-blink)?"?>.?<\/span>/i, '');
                case 'write':
                    if (arguments.length > 1)
                        return this.each(function () {
                            var blockId = $(this).attr(mqBlockId),
                              block = blockId && MathElement[blockId],
                              cursor = block && block.cursor;

                            if (cursor) {
                                cursor.writeLatex(latex);
                                if (block.blurred) cursor.hide().parent.blur();
                            }
                        });
                case 'cmd':
                    if (arguments.length > 1)
                        //hack Sandeep K: override restrict feature for wrap arguments ch = "("
                        var overrideRestrictForCh = arguments[2] || false;
                        return this.each(function () {
                            var blockId = $(this).attr(mqBlockId),
                              block = blockId && MathElement[blockId],
                              cursor = block && block.cursor;

                            if (cursor) {                                
                                if (/^\\[a-z]+$/i.test(latex)) {
                                    var selection = cursor.selection;
                                    if (selection) {
                                        cursor.prev = selection.first.prev;
                                        cursor.next = selection.last.next;
                                        delete cursor.selection;
                                    }                                    
                                    cursor.insertCmd(latex.slice(1), selection); //strips fwd-slash to perform LatexCmd lookup
                                } else                                    
                                    cursor.insertCh(latex, overrideRestrictForCh);  //overrideRestrictForCh overrides restrictkeyboard feature                             
                                if (block.blurred) cursor.hide().parent.blur();
                            }
                        });                
                case 'restrictContentKeys':
                    var blockId = $(this).attr(mqBlockId),
                        block = blockId && MathElement[blockId],
                        cursor = block && block.cursor;
                    if (cursor && typeof cursor.restrictContentKeys == 'undefined')
                        cursor.restrictContentKeys = latex; //latex is ref to regexMap obj
                    break;
                case 'mathOperatorOverride':
                    var blockId = $(this).attr(mqBlockId),
                        block = blockId && MathElement[blockId],
                        cursor = block && block.cursor;
                    if (cursor && typeof cursor.overridenOperators == 'undefined') {
                        cursor.overridenOperators = {};
                        if (latex && latex.length > 0) {
                            $(latex).each(function (index, element) {
                                var operators = element.split('|');
                                if (operators.length = 2) {
                                    cursor.overridenOperators[operators[0]] = operators[1];
                                }
                            });
                        }
                    }
                    break;
                case 'touchtap':
                    var touchstartTarget = arguments[1], x = arguments[2], y = arguments[3];
                    return this.each(function () {
                        var blockId = $(this).attr(mqBlockId),
                          block = blockId && MathElement[blockId],
                          cursor = block && block.cursor;
                        if (cursor && touchstartTarget !== cursor.handle[0]) {
                            var wasBlurred = block.blurred;
                            block.textarea.children().focus();
                            cursor.seek(elAtPt(x, y, block), x, y, cachedClientRectFnForNewCache(), true);
                            if (!wasBlurred) cursor.showHandle();
                        }
                    });
                case 'ignoreNextMousedown':
                    var time = arguments[1];
                    return this.each(function () {
                        var blockId = $(this).attr(mqBlockId),
                          block = blockId && MathElement[blockId];
                        if (block) {
                            block.ignoreMousedownTimeout = setTimeout(function () {
                                block.ignoreMousedownTimeout = undefined;
                            }, time);
                        }
                    });
                case 'moveStart':
                    var blockId = $(this).attr(mqBlockId),
                      block = blockId && MathElement[blockId];
                    if (block && block.cursor)
                        block.cursor.prependTo(block);
                    break;
                case 'moveEnd':
                    var blockId = $(this).attr(mqBlockId),
                      block = blockId && MathElement[blockId];
                    if (block && block.cursor)
                        block.cursor.appendTo(block);
                    break;
                case 'isAtStart':
                    var blockId = $(this).attr(mqBlockId),
                      block = blockId && MathElement[blockId],
                      cursor = block && block.cursor;
                    if (cursor) return cursor.parent === cursor.root && !cursor.prev;
                    break;
                case 'isAtEnd':
                    var blockId = $(this).attr(mqBlockId),
                      block = blockId && MathElement[blockId],
                      cursor = block && block.cursor;
                    if (cursor) return cursor.parent === cursor.root && !cursor.next;
                    break;
                case 'selection':
                    var blockId = $(this).attr(mqBlockId),
                      block = blockId && MathElement[blockId],
                      cursor = block && block.cursor;
                    if (!cursor) return;
                    return cursor.selection ? '$' + cursor.selection.latex() + '$' : '';
                case 'clearSelection':
                    return this.each(function () {
                        var blockId = $(this).attr(mqBlockId),
                          block = blockId && MathElement[blockId],
                          cursor = block && block.cursor;
                        if (cursor) {
                            cursor.clearSelection();
                            if (block.blurred) cursor.hide().parent.blur();
                        }
                    });
                default:
                    var textbox = cmd === 'textbox',
                      editable = textbox || cmd === 'editable',
                      RootBlock = textbox ? RootTextBlock : RootMathBlock;
                    return this.each(function () {
                        var container = $(this), root = RootBlock();
                        createRoot(container, root, textbox, editable);
                        var cursor = root.cursor;
                        var textarea = setupTextarea(editable, container, root, cursor);
                        var textareaSpan = root.textarea;
                        root.editable = editable;
                        mouseEvents(container);
                        setupTouchHandle(editable, root, cursor);
                        if (!editable) return;
                        rootCSSClasses(container, textbox);
                        focusBlurEvents(root, cursor, textarea);
                        desmosCustomEvents(container, root, cursor);
                    });
            }
        };

        //NOTE desmos doesn't want auto-render functionality because we want to avoid
        //interfering with clients' mathquill in our api
        //
        //on document ready, mathquill-ify all `<tag class="mathquill-*">latex</tag>`
        //elements according to their CSS class.
        // $(function() {
        //   $('.mathquill-editable:not(.mathquill-rendered-math)').mathquill('editable');
        //   $('.mathquill-textbox:not(.mathquill-rendered-math)').mathquill('textbox');
        //   $('.mathquill-embedded-latex:not(.mathquill-rendered-math)').mathquill();
        // });


    }());
    /*
    [downloaded from https://www.maths.nottingham.ac.uk/personal/drw/LaTeXMathML.js
      - laughinghan]
    
    LaTeXMathML.js
    ==============
    
    This file, in this form, is due to Douglas Woodall, June 2006.
    It contains JavaScript functions to convert (most simple) LaTeX
    math notation to Presentation MathML.  It was obtained by
    downloading the file ASCIIMathML.js from
        http://www1.chapman.edu/~jipsen/mathml/asciimathdownload/
    and modifying it so that it carries out ONLY those conversions
    that would be carried out in LaTeX.  A description of the original
    file, with examples, can be found at
        www1.chapman.edu/~jipsen/mathml/asciimath.html
        ASCIIMathML: Math on the web for everyone
    
    Here is the header notice from the original file:
    
    ASCIIMathML.js
    ==============
    This file contains JavaScript functions to convert ASCII math notation
    to Presentation MathML. The conversion is done while the (X)HTML page
    loads, and should work with Firefox/Mozilla/Netscape 7+ and Internet
    Explorer 6+MathPlayer (http://www.dessci.com/en/products/mathplayer/).
    Just add the next line to your (X)HTML page with this file in the same folder:
    <script type="text/javascript" src="ASCIIMathML.js"></script>
    This is a convenient and inexpensive solution for authoring MathML.
    
    Version 1.4.7 Dec 15, 2005, (c) Peter Jipsen http://www.chapman.edu/~jipsen
    Latest version at http://www.chapman.edu/~jipsen/mathml/ASCIIMathML.js
    For changes see http://www.chapman.edu/~jipsen/mathml/asciimathchanges.txt
    If you use it on a webpage, please send the URL to jipsen@chapman.edu
    
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or (at
    your option) any later version.
    
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
    General Public License (at http://www.gnu.org/copyleft/gpl.html)
    for more details.
    
    LaTeXMathML.js (ctd)
    ==============
    
    The instructions for use are the same as for the original
    ASCIIMathML.js, except that of course the line you add to your
    file should be
    <script type="text/javascript" src="LaTeXMathML.js"></script>
    Or use absolute path names if the file is not in the same folder
    as your (X)HTML page.
    */

    var checkForMathML = true;   // check if browser can display MathML
    var notifyIfNoMathML = true; // display note if no MathML capability
    var alertIfNoMathML = false;  // show alert box if no MathML capability
    // was "red":
    var mathcolor = "";	     // change it to "" (to inherit) or any other color
    // was "serif":
    var mathfontfamily = "";      // change to "" to inherit (works in IE)
    // or another family (e.g. "arial")
    var showasciiformulaonhover = true; // helps students learn ASCIIMath
    /*
    // Commented out by DRW -- not now used -- see DELIMITERS (twice) near the end
    var displaystyle = false;     // puts limits above and below large operators
    var decimalsign = ".";        // change to "," if you like, beware of `(1,2)`!
    var AMdelimiter1 = "`", AMescape1 = "\\\\`"; // can use other characters
    var AMdelimiter2 = "$", AMescape2 = "\\\\\\$", AMdelimiter2regexp = "\\$";
    var doubleblankmathdelimiter = false; // if true,  x+1  is equal to `x+1`
                                          // for IE this works only in <!--   -->
    //var separatetokens;// has been removed (email me if this is a problem)
    */
    var isIE = document.createElementNS == null;

    if (document.getElementById == null)
        alert("This webpage requires a recent browser such as\
\nMozilla/Netscape 7+ or Internet Explorer 6+MathPlayer")

    // all further global variables start with "AM"

    function AMcreateElementXHTML(t) {
        if (isIE) return document.createElement(t);
        else return document.createElementNS("http://www.w3.org/1999/xhtml", t);
    }

    function AMnoMathMLNote() {
        var nd = AMcreateElementXHTML("h3");
        nd.setAttribute("align", "center")
        nd.appendChild(AMcreateElementXHTML("p"));
        nd.appendChild(document.createTextNode("To view the "));
        var an = AMcreateElementXHTML("a");
        an.appendChild(document.createTextNode("LaTeXMathML"));
        an.setAttribute("href", "http://www.maths.nott.ac.uk/personal/drw/lm.html");
        nd.appendChild(an);
        nd.appendChild(document.createTextNode(" notation use Internet Explorer 6+"));
        an = AMcreateElementXHTML("a");
        an.appendChild(document.createTextNode("MathPlayer"));
        an.setAttribute("href", "http://www.dessci.com/en/products/mathplayer/download.htm");
        nd.appendChild(an);
        nd.appendChild(document.createTextNode(" or Netscape/Mozilla/Firefox"));
        nd.appendChild(AMcreateElementXHTML("p"));
        return nd;
    }

    function AMisMathMLavailable() {
        if (navigator.appName.slice(0, 8) == "Netscape")
            if (navigator.appVersion.slice(0, 1) >= "5") return null;
            else return AMnoMathMLNote();
        else if (navigator.appName.slice(0, 9) == "Microsoft")
            try {
                var ActiveX = new ActiveXObject("MathPlayer.Factory.1");
                return null;
            } catch (e) {
                return AMnoMathMLNote();
            }
        else return AMnoMathMLNote();
    }

    // character lists for Mozilla/Netscape fonts
    var AMcal = [0xEF35, 0x212C, 0xEF36, 0xEF37, 0x2130, 0x2131, 0xEF38, 0x210B, 0x2110, 0xEF39, 0xEF3A, 0x2112, 0x2133, 0xEF3B, 0xEF3C, 0xEF3D, 0xEF3E, 0x211B, 0xEF3F, 0xEF40, 0xEF41, 0xEF42, 0xEF43, 0xEF44, 0xEF45, 0xEF46];
    var AMfrk = [0xEF5D, 0xEF5E, 0x212D, 0xEF5F, 0xEF60, 0xEF61, 0xEF62, 0x210C, 0x2111, 0xEF63, 0xEF64, 0xEF65, 0xEF66, 0xEF67, 0xEF68, 0xEF69, 0xEF6A, 0x211C, 0xEF6B, 0xEF6C, 0xEF6D, 0xEF6E, 0xEF6F, 0xEF70, 0xEF71, 0x2128];
    var AMbbb = [0xEF8C, 0xEF8D, 0x2102, 0xEF8E, 0xEF8F, 0xEF90, 0xEF91, 0x210D, 0xEF92, 0xEF93, 0xEF94, 0xEF95, 0xEF96, 0x2115, 0xEF97, 0x2119, 0x211A, 0x211D, 0xEF98, 0xEF99, 0xEF9A, 0xEF9B, 0xEF9C, 0xEF9D, 0xEF9E, 0x2124];

    var CONST = 0, UNARY = 1, BINARY = 2, INFIX = 3, LEFTBRACKET = 4,
        RIGHTBRACKET = 5, SPACE = 6, UNDEROVER = 7, DEFINITION = 8,
        TEXT = 9, BIG = 10, LONG = 11, STRETCHY = 12, MATRIX = 13; // token types

    var AMsqrt = { input: "\\sqrt", tag: "msqrt", output: "sqrt", ttype: UNARY },
      AMroot = { input: "\\root", tag: "mroot", output: "root", ttype: BINARY },
      AMfrac = { input: "\\frac", tag: "mfrac", output: "/", ttype: BINARY },
      AMover = { input: "\\stackrel", tag: "mover", output: "stackrel", ttype: BINARY },
      AMatop = { input: "\\atop", tag: "mfrac", output: "", ttype: INFIX },
      AMchoose = { input: "\\choose", tag: "mfrac", output: "", ttype: INFIX },
      AMsub = { input: "_", tag: "msub", output: "_", ttype: INFIX },
      AMsup = { input: "^", tag: "msup", output: "^", ttype: INFIX },
      AMtext = { input: "\\mathrm", tag: "mtext", output: "text", ttype: TEXT },
      AMmbox = { input: "\\mbox", tag: "mtext", output: "mbox", ttype: TEXT };

    // Commented out by DRW to prevent 1/2 turning into a 2-line fraction
    // AMdiv   = {input:"/",	 tag:"mfrac", output:"/",    ttype:INFIX},
    // Commented out by DRW so that " prints literally in equations
    // AMquote = {input:"\"",	 tag:"mtext", output:"mbox", ttype:TEXT};

    var AMsymbols = [
    //Greek letters
    { input: "\\alpha", tag: "mi", output: "\u03B1", ttype: CONST },
    { input: "\\beta", tag: "mi", output: "\u03B2", ttype: CONST },
    { input: "\\gamma", tag: "mi", output: "\u03B3", ttype: CONST },
    { input: "\\delta", tag: "mi", output: "\u03B4", ttype: CONST },
    { input: "\\epsilon", tag: "mi", output: "\u03B5", ttype: CONST },
    { input: "\\varepsilon", tag: "mi", output: "\u025B", ttype: CONST },
    { input: "\\zeta", tag: "mi", output: "\u03B6", ttype: CONST },
    { input: "\\eta", tag: "mi", output: "\u03B7", ttype: CONST },
    { input: "\\theta", tag: "mi", output: "\u03B8", ttype: CONST },
    { input: "\\vartheta", tag: "mi", output: "\u03D1", ttype: CONST },
    { input: "\\iota", tag: "mi", output: "\u03B9", ttype: CONST },
    { input: "\\kappa", tag: "mi", output: "\u03BA", ttype: CONST },
    { input: "\\lambda", tag: "mi", output: "\u03BB", ttype: CONST },
    { input: "\\mu", tag: "mi", output: "\u03BC", ttype: CONST },
    { input: "\\nu", tag: "mi", output: "\u03BD", ttype: CONST },
    { input: "\\xi", tag: "mi", output: "\u03BE", ttype: CONST },
    { input: "\\pi", tag: "mi", output: "\u03C0", ttype: CONST },
    { input: "\\varpi", tag: "mi", output: "\u03D6", ttype: CONST },
    { input: "\\rho", tag: "mi", output: "\u03C1", ttype: CONST },
    { input: "\\varrho", tag: "mi", output: "\u03F1", ttype: CONST },
    { input: "\\varsigma", tag: "mi", output: "\u03C2", ttype: CONST },
    { input: "\\sigma", tag: "mi", output: "\u03C3", ttype: CONST },
    { input: "\\tau", tag: "mi", output: "\u03C4", ttype: CONST },
    { input: "\\upsilon", tag: "mi", output: "\u03C5", ttype: CONST },
    { input: "\\phi", tag: "mi", output: "\u03C6", ttype: CONST },
    { input: "\\varphi", tag: "mi", output: "\u03D5", ttype: CONST },
    { input: "\\chi", tag: "mi", output: "\u03C7", ttype: CONST },
    { input: "\\psi", tag: "mi", output: "\u03C8", ttype: CONST },
    { input: "\\omega", tag: "mi", output: "\u03C9", ttype: CONST },
    { input: "\\Gamma", tag: "mo", output: "\u0393", ttype: CONST },
    { input: "\\Delta", tag: "mo", output: "\u0394", ttype: CONST },
    { input: "\\Theta", tag: "mo", output: "\u0398", ttype: CONST },
    { input: "\\Lambda", tag: "mo", output: "\u039B", ttype: CONST },
    { input: "\\Xi", tag: "mo", output: "\u039E", ttype: CONST },
    { input: "\\Pi", tag: "mo", output: "\u03A0", ttype: CONST },
    { input: "\\Sigma", tag: "mo", output: "\u03A3", ttype: CONST },
    { input: "\\Upsilon", tag: "mo", output: "\u03A5", ttype: CONST },
    { input: "\\Phi", tag: "mo", output: "\u03A6", ttype: CONST },
    { input: "\\Psi", tag: "mo", output: "\u03A8", ttype: CONST },
    { input: "\\Omega", tag: "mo", output: "\u03A9", ttype: CONST },

    //fractions
    { input: "\\frac12", tag: "mo", output: "\u00BD", ttype: CONST },
    { input: "\\frac14", tag: "mo", output: "\u00BC", ttype: CONST },
    { input: "\\frac34", tag: "mo", output: "\u00BE", ttype: CONST },
    { input: "\\frac13", tag: "mo", output: "\u2153", ttype: CONST },
    { input: "\\frac23", tag: "mo", output: "\u2154", ttype: CONST },
    { input: "\\frac15", tag: "mo", output: "\u2155", ttype: CONST },
    { input: "\\frac25", tag: "mo", output: "\u2156", ttype: CONST },
    { input: "\\frac35", tag: "mo", output: "\u2157", ttype: CONST },
    { input: "\\frac45", tag: "mo", output: "\u2158", ttype: CONST },
    { input: "\\frac16", tag: "mo", output: "\u2159", ttype: CONST },
    { input: "\\frac56", tag: "mo", output: "\u215A", ttype: CONST },
    { input: "\\frac18", tag: "mo", output: "\u215B", ttype: CONST },
    { input: "\\frac38", tag: "mo", output: "\u215C", ttype: CONST },
    { input: "\\frac58", tag: "mo", output: "\u215D", ttype: CONST },
    { input: "\\frac78", tag: "mo", output: "\u215E", ttype: CONST },

    //binary operation symbols
    { input: "\\pm", tag: "mo", output: "\u00B1", ttype: CONST },
    { input: "\\mp", tag: "mo", output: "\u2213", ttype: CONST },
    { input: "\\triangleleft", tag: "mo", output: "\u22B2", ttype: CONST },
    { input: "\\triangleright", tag: "mo", output: "\u22B3", ttype: CONST },
    { input: "\\cdot", tag: "mo", output: "\u22C5", ttype: CONST },
    { input: "\\star", tag: "mo", output: "\u22C6", ttype: CONST },
    { input: "\\ast", tag: "mo", output: "\u002A", ttype: CONST },
    { input: "\\times", tag: "mo", output: "\u00D7", ttype: CONST },
    { input: "\\div", tag: "mo", output: "\u00F7", ttype: CONST },
    { input: "\\circ", tag: "mo", output: "\u2218", ttype: CONST },
    {input:"\\bullet",	  tag:"mo", output:"\u2219", ttype:CONST},
    //{ input: "\\bullet", tag: "mo", output: "\u2022", ttype: CONST },
    { input: "\\oplus", tag: "mo", output: "\u2295", ttype: CONST },
    { input: "\\ominus", tag: "mo", output: "\u2296", ttype: CONST },
    { input: "\\otimes", tag: "mo", output: "\u2297", ttype: CONST },
    { input: "\\bigcirc", tag: "mo", output: "\u25CB", ttype: CONST },
    { input: "\\oslash", tag: "mo", output: "\u2298", ttype: CONST },
    { input: "\\odot", tag: "mo", output: "\u2299", ttype: CONST },
    { input: "\\land", tag: "mo", output: "\u2227", ttype: CONST },
    { input: "\\wedge", tag: "mo", output: "\u2227", ttype: CONST },
    { input: "\\lor", tag: "mo", output: "\u2228", ttype: CONST },
    { input: "\\vee", tag: "mo", output: "\u2228", ttype: CONST },
    { input: "\\cap", tag: "mo", output: "\u2229", ttype: CONST },
    { input: "\\cup", tag: "mo", output: "\u222A", ttype: CONST },
    { input: "\\sqcap", tag: "mo", output: "\u2293", ttype: CONST },
    { input: "\\sqcup", tag: "mo", output: "\u2294", ttype: CONST },
    { input: "\\uplus", tag: "mo", output: "\u228E", ttype: CONST },
    { input: "\\amalg", tag: "mo", output: "\u2210", ttype: CONST },
    { input: "\\bigtriangleup", tag: "mo", output: "\u25B3", ttype: CONST },
    { input: "\\bigtriangledown", tag: "mo", output: "\u25BD", ttype: CONST },
    { input: "\\dag", tag: "mo", output: "\u2020", ttype: CONST },
    { input: "\\dagger", tag: "mo", output: "\u2020", ttype: CONST },
    { input: "\\ddag", tag: "mo", output: "\u2021", ttype: CONST },
    { input: "\\ddagger", tag: "mo", output: "\u2021", ttype: CONST },
    { input: "\\lhd", tag: "mo", output: "\u22B2", ttype: CONST },
    { input: "\\rhd", tag: "mo", output: "\u22B3", ttype: CONST },
    { input: "\\unlhd", tag: "mo", output: "\u22B4", ttype: CONST },
    { input: "\\unrhd", tag: "mo", output: "\u22B5", ttype: CONST },


    //BIG Operators
    { input: "\\sum", tag: "mo", output: "\u2211", ttype: UNDEROVER },
    { input: "\\prod", tag: "mo", output: "\u220F", ttype: UNDEROVER },
    { input: "\\bigcap", tag: "mo", output: "\u22C2", ttype: UNDEROVER },
    { input: "\\bigcup", tag: "mo", output: "\u22C3", ttype: UNDEROVER },
    { input: "\\bigwedge", tag: "mo", output: "\u22C0", ttype: UNDEROVER },
    { input: "\\bigvee", tag: "mo", output: "\u22C1", ttype: UNDEROVER },
    { input: "\\bigsqcap", tag: "mo", output: "\u2A05", ttype: UNDEROVER },
    { input: "\\bigsqcup", tag: "mo", output: "\u2A06", ttype: UNDEROVER },
    { input: "\\coprod", tag: "mo", output: "\u2210", ttype: UNDEROVER },
    { input: "\\bigoplus", tag: "mo", output: "\u2A01", ttype: UNDEROVER },
    { input: "\\bigotimes", tag: "mo", output: "\u2A02", ttype: UNDEROVER },
    { input: "\\bigodot", tag: "mo", output: "\u2A00", ttype: UNDEROVER },
    { input: "\\biguplus", tag: "mo", output: "\u2A04", ttype: UNDEROVER },
    { input: "\\int", tag: "mo", output: "\u222B", ttype: UNDEROVER },
    { input: "\\oint", tag: "mo", output: "\u222E", ttype: CONST },

    //binary relation symbols
    { input: ":=", tag: "mo", output: ":=", ttype: CONST },
    { input: "\\lt", tag: "mo", output: "<", ttype: CONST },
    { input: "\\gt", tag: "mo", output: ">", ttype: CONST },
    { input: "\\ne", tag: "mo", output: "\u2260", ttype: CONST },
    { input: "\\neq", tag: "mo", output: "\u2260", ttype: CONST },
    { input: "\\le", tag: "mo", output: "\u2264", ttype: CONST },
    { input: "\\leq", tag: "mo", output: "\u2264", ttype: CONST },
    { input: "\\leqslant", tag: "mo", output: "\u2264", ttype: CONST },
    { input: "\\ge", tag: "mo", output: "\u2265", ttype: CONST },
    { input: "\\geq", tag: "mo", output: "\u2265", ttype: CONST },
    { input: "\\geqslant", tag: "mo", output: "\u2265", ttype: CONST },
    { input: "\\equiv", tag: "mo", output: "\u2261", ttype: CONST },
    { input: "\\ll", tag: "mo", output: "\u226A", ttype: CONST },
    { input: "\\gg", tag: "mo", output: "\u226B", ttype: CONST },
    { input: "\\doteq", tag: "mo", output: "\u2250", ttype: CONST },
    { input: "\\prec", tag: "mo", output: "\u227A", ttype: CONST },
    { input: "\\succ", tag: "mo", output: "\u227B", ttype: CONST },
    { input: "\\preceq", tag: "mo", output: "\u227C", ttype: CONST },
    { input: "\\succeq", tag: "mo", output: "\u227D", ttype: CONST },
    { input: "\\subset", tag: "mo", output: "\u2282", ttype: CONST },
    { input: "\\supset", tag: "mo", output: "\u2283", ttype: CONST },
    { input: "\\subseteq", tag: "mo", output: "\u2286", ttype: CONST },
    { input: "\\supseteq", tag: "mo", output: "\u2287", ttype: CONST },
    { input: "\\sqsubset", tag: "mo", output: "\u228F", ttype: CONST },
    { input: "\\sqsupset", tag: "mo", output: "\u2290", ttype: CONST },
    { input: "\\sqsubseteq", tag: "mo", output: "\u2291", ttype: CONST },
    { input: "\\sqsupseteq", tag: "mo", output: "\u2292", ttype: CONST },
    { input: "\\sim", tag: "mo", output: "\u223C", ttype: CONST },
    { input: "\\simeq", tag: "mo", output: "\u2243", ttype: CONST },
    { input: "\\approx", tag: "mo", output: "\u2248", ttype: CONST },
    { input: "\\cong", tag: "mo", output: "\u2245", ttype: CONST },
    { input: "\\Join", tag: "mo", output: "\u22C8", ttype: CONST },
    { input: "\\bowtie", tag: "mo", output: "\u22C8", ttype: CONST },
    { input: "\\in", tag: "mo", output: "\u2208", ttype: CONST },
    { input: "\\ni", tag: "mo", output: "\u220B", ttype: CONST },
    { input: "\\owns", tag: "mo", output: "\u220B", ttype: CONST },
    { input: "\\propto", tag: "mo", output: "\u221D", ttype: CONST },
    { input: "\\vdash", tag: "mo", output: "\u22A2", ttype: CONST },
    { input: "\\dashv", tag: "mo", output: "\u22A3", ttype: CONST },
    { input: "\\models", tag: "mo", output: "\u22A8", ttype: CONST },
    { input: "\\perp", tag: "mo", output: "\u22A5", ttype: CONST },
    { input: "\\smile", tag: "mo", output: "\u2323", ttype: CONST },
    { input: "\\frown", tag: "mo", output: "\u2322", ttype: CONST },
    { input: "\\asymp", tag: "mo", output: "\u224D", ttype: CONST },
    { input: "\\notin", tag: "mo", output: "\u2209", ttype: CONST },

    //matrices
    { input: "\\begin{eqnarray}", output: "X", ttype: MATRIX, invisible: true },
    { input: "\\begin{array}", output: "X", ttype: MATRIX, invisible: true },
    { input: "\\\\", output: "}&{", ttype: DEFINITION },
    { input: "\\end{eqnarray}", output: "}}", ttype: DEFINITION },
    { input: "\\end{array}", output: "}}", ttype: DEFINITION },

    //grouping and literal brackets -- ieval is for IE
    { input: "\\big", tag: "mo", output: "X", atval: "1.2", ieval: "2.2", ttype: BIG },
    { input: "\\Big", tag: "mo", output: "X", atval: "1.6", ieval: "2.6", ttype: BIG },
    { input: "\\bigg", tag: "mo", output: "X", atval: "2.2", ieval: "3.2", ttype: BIG },
    { input: "\\Bigg", tag: "mo", output: "X", atval: "2.9", ieval: "3.9", ttype: BIG },
    { input: "\\left", tag: "mo", output: "X", ttype: LEFTBRACKET },
    { input: "\\right", tag: "mo", output: "X", ttype: RIGHTBRACKET },
    { input: "{", output: "{", ttype: LEFTBRACKET, invisible: true },
    { input: "}", output: "}", ttype: RIGHTBRACKET, invisible: true },

    { input: "(", tag: "mo", output: "(", atval: "1", ttype: STRETCHY },
    { input: "[", tag: "mo", output: "[", atval: "1", ttype: STRETCHY },
    { input: "\\lbrack", tag: "mo", output: "[", atval: "1", ttype: STRETCHY },
    { input: "\\{", tag: "mo", output: "{", atval: "1", ttype: STRETCHY },
    { input: "\\lbrace", tag: "mo", output: "{", atval: "1", ttype: STRETCHY },
    { input: "\\langle", tag: "mo", output: "\u2329", atval: "1", ttype: STRETCHY },
    { input: "\\lfloor", tag: "mo", output: "\u230A", atval: "1", ttype: STRETCHY },
    { input: "\\lceil", tag: "mo", output: "\u2308", atval: "1", ttype: STRETCHY },

    // rtag:"mi" causes space to be inserted before a following sin, cos, etc.
    // (see function AMparseExpr() )
    { input: ")", tag: "mo", output: ")", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "]", tag: "mo", output: "]", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rbrack", tag: "mo", output: "]", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\}", tag: "mo", output: "}", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rbrace", tag: "mo", output: "}", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rangle", tag: "mo", output: "\u232A", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rfloor", tag: "mo", output: "\u230B", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rceil", tag: "mo", output: "\u2309", rtag: "mi", atval: "1", ttype: STRETCHY },

    // "|", "\\|", "\\vert" and "\\Vert" modified later: lspace = rspace = 0em
    { input: "|", tag: "mo", output: "\u2223", atval: "1", ttype: STRETCHY },
    { input: "\\|", tag: "mo", output: "\u2225", atval: "1", ttype: STRETCHY },
    { input: "\\vert", tag: "mo", output: "\u2223", atval: "1", ttype: STRETCHY },
    { input: "\\Vert", tag: "mo", output: "\u2225", atval: "1", ttype: STRETCHY },
    { input: "\\mid", tag: "mo", output: "\u2223", atval: "1", ttype: STRETCHY },
    { input: "\\parallel", tag: "mo", output: "\u2225", atval: "1", ttype: STRETCHY },
    { input: "/", tag: "mo", output: "/", atval: "1.01", ttype: STRETCHY },
    { input: "\\backslash", tag: "mo", output: "\u2216", atval: "1", ttype: STRETCHY },
    { input: "\\setminus", tag: "mo", output: "\\", ttype: CONST },

    //miscellaneous symbols
    { input: "\\!", tag: "mspace", atname: "width", atval: "-0.167em", ttype: SPACE },
    { input: "\\,", tag: "mspace", atname: "width", atval: "0.167em", ttype: SPACE },
    { input: "\\>", tag: "mspace", atname: "width", atval: "0.222em", ttype: SPACE },
    { input: "\\:", tag: "mspace", atname: "width", atval: "0.222em", ttype: SPACE },
    { input: "\\;", tag: "mspace", atname: "width", atval: "0.278em", ttype: SPACE },
    { input: "~", tag: "mspace", atname: "width", atval: "0.333em", ttype: SPACE },
    { input: "\\quad", tag: "mspace", atname: "width", atval: "1em", ttype: SPACE },
    { input: "\\qquad", tag: "mspace", atname: "width", atval: "2em", ttype: SPACE },
    //{input:"{}",		  tag:"mo", output:"\u200B", ttype:CONST}, // zero-width
    { input: "\\prime", tag: "mo", output: "\u2032", ttype: CONST },
    { input: "'", tag: "mo", output: "\u02B9", ttype: CONST },
    { input: "''", tag: "mo", output: "\u02BA", ttype: CONST },
    { input: "'''", tag: "mo", output: "\u2034", ttype: CONST },
    { input: "''''", tag: "mo", output: "\u2057", ttype: CONST },
    { input: "\\ldots", tag: "mo", output: "\u2026", ttype: CONST },
    { input: "\\cdots", tag: "mo", output: "\u22EF", ttype: CONST },
    { input: "\\vdots", tag: "mo", output: "\u22EE", ttype: CONST },
    { input: "\\ddots", tag: "mo", output: "\u22F1", ttype: CONST },
    { input: "\\forall", tag: "mo", output: "\u2200", ttype: CONST },
    { input: "\\exists", tag: "mo", output: "\u2203", ttype: CONST },
    { input: "\\Re", tag: "mo", output: "\u211C", ttype: CONST },
    { input: "\\Im", tag: "mo", output: "\u2111", ttype: CONST },
    { input: "\\aleph", tag: "mo", output: "\u2135", ttype: CONST },
    { input: "\\hbar", tag: "mo", output: "\u210F", ttype: CONST },
    { input: "\\ell", tag: "mo", output: "\u2113", ttype: CONST },
    { input: "\\wp", tag: "mo", output: "\u2118", ttype: CONST },
    { input: "\\emptyset", tag: "mo", output: "\u2205", ttype: CONST },
    { input: "\\infty", tag: "mo", output: "\u221E", ttype: CONST },
    { input: "\\surd", tag: "mo", output: "\\sqrt{}", ttype: DEFINITION },
    { input: "\\partial", tag: "mo", output: "\u2202", ttype: CONST },
    { input: "\\nabla", tag: "mo", output: "\u2207", ttype: CONST },
    { input: "\\triangle", tag: "mo", output: "\u25B3", ttype: CONST },
    { input: "\\therefore", tag: "mo", output: "\u2234", ttype: CONST },
    { input: "\\angle", tag: "mo", output: "\u2220", ttype: CONST },
    //{input:"\\\\ ",	  tag:"mo", output:"\u00A0", ttype:CONST},
    { input: "\\diamond", tag: "mo", output: "\u22C4", ttype: CONST },
    //{input:"\\Diamond",	  tag:"mo", output:"\u25CA", ttype:CONST},
    { input: "\\Diamond", tag: "mo", output: "\u25C7", ttype: CONST },
    { input: "\\neg", tag: "mo", output: "\u00AC", ttype: CONST },
    { input: "\\lnot", tag: "mo", output: "\u00AC", ttype: CONST },
    { input: "\\bot", tag: "mo", output: "\u22A5", ttype: CONST },
    { input: "\\top", tag: "mo", output: "\u22A4", ttype: CONST },
    { input: "\\square", tag: "mo", output: "\u25AB", ttype: CONST },
    { input: "\\Box", tag: "mo", output: "\u25A1", ttype: CONST },
    { input: "\\wr", tag: "mo", output: "\u2240", ttype: CONST },

    //standard functions
    //Note UNDEROVER *must* have tag:"mo" to work properly
    { input: "\\arccos", tag: "mi", output: "arccos", ttype: UNARY, func: true },
    { input: "\\arcsin", tag: "mi", output: "arcsin", ttype: UNARY, func: true },
    { input: "\\arctan", tag: "mi", output: "arctan", ttype: UNARY, func: true },
    { input: "\\arg", tag: "mi", output: "arg", ttype: UNARY, func: true },
    { input: "\\cos", tag: "mi", output: "cos", ttype: UNARY, func: true },
    { input: "\\cosh", tag: "mi", output: "cosh", ttype: UNARY, func: true },
    { input: "\\cot", tag: "mi", output: "cot", ttype: UNARY, func: true },
    { input: "\\coth", tag: "mi", output: "coth", ttype: UNARY, func: true },
    { input: "\\csc", tag: "mi", output: "csc", ttype: UNARY, func: true },
    { input: "\\deg", tag: "mi", output: "deg", ttype: UNARY, func: true },
    { input: "\\det", tag: "mi", output: "det", ttype: UNARY, func: true },
    { input: "\\dim", tag: "mi", output: "dim", ttype: UNARY, func: true }, //CONST?
    { input: "\\exp", tag: "mi", output: "exp", ttype: UNARY, func: true },
    { input: "\\gcd", tag: "mi", output: "gcd", ttype: UNARY, func: true }, //CONST?
    { input: "\\hom", tag: "mi", output: "hom", ttype: UNARY, func: true },
    { input: "\\inf", tag: "mo", output: "inf", ttype: UNDEROVER },
    { input: "\\ker", tag: "mi", output: "ker", ttype: UNARY, func: true },
    { input: "\\lg", tag: "mi", output: "lg", ttype: UNARY, func: true },
    { input: "\\lim", tag: "mo", output: "lim", ttype: UNDEROVER },
    { input: "\\liminf", tag: "mo", output: "liminf", ttype: UNDEROVER },
    { input: "\\limsup", tag: "mo", output: "limsup", ttype: UNDEROVER },
    { input: "\\ln", tag: "mi", output: "ln", ttype: UNARY, func: true },
    { input: "\\log", tag: "mi", output: "log", ttype: UNARY, func: true },
    { input: "\\max", tag: "mo", output: "max", ttype: UNDEROVER },
    { input: "\\min", tag: "mo", output: "min", ttype: UNDEROVER },
    { input: "\\Pr", tag: "mi", output: "Pr", ttype: UNARY, func: true },
    { input: "\\sec", tag: "mi", output: "sec", ttype: UNARY, func: true },
    { input: "\\sin", tag: "mi", output: "sin", ttype: UNARY, func: true },
    { input: "\\sinh", tag: "mi", output: "sinh", ttype: UNARY, func: true },
    { input: "\\sup", tag: "mo", output: "sup", ttype: UNDEROVER },
    { input: "\\tan", tag: "mi", output: "tan", ttype: UNARY, func: true },
    { input: "\\tanh", tag: "mi", output: "tanh", ttype: UNARY, func: true },

    //arrows
    { input: "\\gets", tag: "mo", output: "\u2190", ttype: CONST },
    { input: "\\leftarrow", tag: "mo", output: "\u2190", ttype: CONST },
    { input: "\\to", tag: "mo", output: "\u2192", ttype: CONST },
    { input: "\\rightarrow", tag: "mo", output: "\u2192", ttype: CONST },
    { input: "\\leftrightarrow", tag: "mo", output: "\u2194", ttype: CONST },
    { input: "\\uparrow", tag: "mo", output: "\u2191", ttype: CONST },
    { input: "\\downarrow", tag: "mo", output: "\u2193", ttype: CONST },
    { input: "\\updownarrow", tag: "mo", output: "\u2195", ttype: CONST },
    { input: "\\Leftarrow", tag: "mo", output: "\u21D0", ttype: CONST },
    { input: "\\Rightarrow", tag: "mo", output: "\u21D2", ttype: CONST },
    { input: "\\Leftrightarrow", tag: "mo", output: "\u21D4", ttype: CONST },
    { input: "\\iff", tag: "mo", output: "~\\Longleftrightarrow~", ttype: DEFINITION },
    { input: "\\Uparrow", tag: "mo", output: "\u21D1", ttype: CONST },
    { input: "\\Downarrow", tag: "mo", output: "\u21D3", ttype: CONST },
    { input: "\\Updownarrow", tag: "mo", output: "\u21D5", ttype: CONST },
    { input: "\\mapsto", tag: "mo", output: "\u21A6", ttype: CONST },
    { input: "\\longleftarrow", tag: "mo", output: "\u2190", ttype: LONG },
    { input: "\\longrightarrow", tag: "mo", output: "\u2192", ttype: LONG },
    { input: "\\longleftrightarrow", tag: "mo", output: "\u2194", ttype: LONG },
    { input: "\\Longleftarrow", tag: "mo", output: "\u21D0", ttype: LONG },
    { input: "\\Longrightarrow", tag: "mo", output: "\u21D2", ttype: LONG },
    { input: "\\Longleftrightarrow", tag: "mo", output: "\u21D4", ttype: LONG },
    { input: "\\longmapsto", tag: "mo", output: "\u21A6", ttype: CONST },
                                // disaster if LONG

    //commands with argument
    AMsqrt, AMroot, AMfrac, AMover, AMsub, AMsup, AMtext, AMmbox, AMatop, AMchoose,
    //AMdiv, AMquote,

    //diacritical marks
    { input: "\\acute", tag: "mover", output: "\u00B4", ttype: UNARY, acc: true },
    //{input:"\\acute",	  tag:"mover",  output:"\u0317", ttype:UNARY, acc:true},
    //{input:"\\acute",	  tag:"mover",  output:"\u0301", ttype:UNARY, acc:true},
    //{input:"\\grave",	  tag:"mover",  output:"\u0300", ttype:UNARY, acc:true},
    //{input:"\\grave",	  tag:"mover",  output:"\u0316", ttype:UNARY, acc:true},
    { input: "\\grave", tag: "mover", output: "\u0060", ttype: UNARY, acc: true },
    { input: "\\breve", tag: "mover", output: "\u02D8", ttype: UNARY, acc: true },
    { input: "\\check", tag: "mover", output: "\u02C7", ttype: UNARY, acc: true },
    { input: "\\dot", tag: "mover", output: ".", ttype: UNARY, acc: true },
    { input: "\\ddot", tag: "mover", output: "..", ttype: UNARY, acc: true },
    //{input:"\\ddot",	  tag:"mover",  output:"\u00A8", ttype:UNARY, acc:true},
    { input: "\\mathring", tag: "mover", output: "\u00B0", ttype: UNARY, acc: true },
    { input: "\\vec", tag: "mover", output: "\u20D7", ttype: UNARY, acc: true },
    { input: "\\overrightarrow", tag: "mover", output: "\u20D7", ttype: UNARY, acc: true },
    { input: "\\overleftarrow", tag: "mover", output: "\u20D6", ttype: UNARY, acc: true },
    { input: "\\hat", tag: "mover", output: "\u005E", ttype: UNARY, acc: true },
    { input: "\\widehat", tag: "mover", output: "\u0302", ttype: UNARY, acc: true },
    { input: "\\tilde", tag: "mover", output: "~", ttype: UNARY, acc: true },
    //{input:"\\tilde",	  tag:"mover",  output:"\u0303", ttype:UNARY, acc:true},
    { input: "\\widetilde", tag: "mover", output: "\u02DC", ttype: UNARY, acc: true },
    { input: "\\bar", tag: "mover", output: "\u203E", ttype: UNARY, acc: true },
    { input: "\\overbrace", tag: "mover", output: "\u23B4", ttype: UNARY, acc: true },
    { input: "\\overline", tag: "mover", output: "\u00AF", ttype: UNARY, acc: true },
    { input: "\\underbrace", tag: "munder", output: "\u23B5", ttype: UNARY, acc: true },
    { input: "\\underline", tag: "munder", output: "\u00AF", ttype: UNARY, acc: true },
    //{input:"underline",	tag:"munder", output:"\u0332", ttype:UNARY, acc:true},

    //typestyles and fonts
    { input: "\\displaystyle", tag: "mstyle", atname: "displaystyle", atval: "true", ttype: UNARY },
    { input: "\\textstyle", tag: "mstyle", atname: "displaystyle", atval: "false", ttype: UNARY },
    { input: "\\scriptstyle", tag: "mstyle", atname: "scriptlevel", atval: "1", ttype: UNARY },
    { input: "\\scriptscriptstyle", tag: "mstyle", atname: "scriptlevel", atval: "2", ttype: UNARY },
    { input: "\\textrm", tag: "mstyle", output: "\\mathrm", ttype: DEFINITION },
    { input: "\\mathbf", tag: "mstyle", atname: "mathvariant", atval: "bold", ttype: UNARY },
    { input: "\\textbf", tag: "mstyle", atname: "mathvariant", atval: "bold", ttype: UNARY },
    { input: "\\mathit", tag: "mstyle", atname: "mathvariant", atval: "italic", ttype: UNARY },
    { input: "\\textit", tag: "mstyle", atname: "mathvariant", atval: "italic", ttype: UNARY },
    { input: "\\mathtt", tag: "mstyle", atname: "mathvariant", atval: "monospace", ttype: UNARY },
    { input: "\\texttt", tag: "mstyle", atname: "mathvariant", atval: "monospace", ttype: UNARY },
    { input: "\\mathsf", tag: "mstyle", atname: "mathvariant", atval: "sans-serif", ttype: UNARY },
    { input: "\\mathbb", tag: "mstyle", atname: "mathvariant", atval: "double-struck", ttype: UNARY, codes: AMbbb },
    { input: "\\mathcal", tag: "mstyle", atname: "mathvariant", atval: "script", ttype: UNARY, codes: AMcal },
    { input: "\\mathfrak", tag: "mstyle", atname: "mathvariant", atval: "fraktur", ttype: UNARY, codes: AMfrk }
    ];

    function compareNames(s1, s2) {
        if (s1.input > s2.input) return 1
        else return -1;
    }

    var AMnames = []; //list of input symbols

    function AMinitSymbols() {
        AMsymbols.sort(compareNames);
        for (i = 0; i < AMsymbols.length; i++) AMnames[i] = AMsymbols[i].input;
    }

    var AMmathml = "http://www.w3.org/1998/Math/MathML";

    function AMcreateElementMathML(t) {
        if (isIE) return document.createElement("m:" + t);
        else return document.createElementNS(AMmathml, t);
    }

    function AMcreateMmlNode(t, frag) {
        //  var node = AMcreateElementMathML(name);
        if (isIE) var node = document.createElement("m:" + t);
        else var node = document.createElementNS(AMmathml, t);
        node.appendChild(frag);
        return node;
    }

    function newcommand(oldstr, newstr) {
        AMsymbols = AMsymbols.concat([{
            input: oldstr, tag: "mo", output: newstr,
            ttype: DEFINITION
        }]);
    }

    function AMremoveCharsAndBlanks(str, n) {
        //remove n characters and any following blanks
        var st;
        st = str.slice(n);
        for (var i = 0; i < st.length && st.charCodeAt(i) <= 32; i = i + 1);
        return st.slice(i);
    }

    function AMposition(arr, str, n) {
        // return position >=n where str appears or would be inserted
        // assumes arr is sorted
        if (n == 0) {
            var h, m;
            n = -1;
            h = arr.length;
            while (n + 1 < h) {
                m = (n + h) >> 1;
                if (arr[m] < str) n = m; else h = m;
            }
            return h;
        } else
            for (var i = n; i < arr.length && arr[i] < str; i++);
        return i; // i=arr.length || arr[i]>=str
    }

    function AMgetSymbol(str) {
        //return maximal initial substring of str that appears in names
        //return null if there is none
        var k = 0; //new pos
        var j = 0; //old pos
        var mk; //match pos
        var st;
        var tagst;
        var match = "";
        var more = true;
        for (var i = 1; i <= str.length && more; i++) {
            st = str.slice(0, i); //initial substring of length i
            j = k;
            k = AMposition(AMnames, st, j);
            if (k < AMnames.length && str.slice(0, AMnames[k].length) == AMnames[k]) {
                match = AMnames[k];
                mk = k;
                i = match.length;
            }
            more = k < AMnames.length && str.slice(0, AMnames[k].length) >= AMnames[k];
        }
        AMpreviousSymbol = AMcurrentSymbol;
        if (match != "") {
            AMcurrentSymbol = AMsymbols[mk].ttype;
            return AMsymbols[mk];
        }
        AMcurrentSymbol = CONST;
        k = 1;
        st = /^[\d.]+/.exec(str);
        if (st) {
            st = st[0];
            tagst = "mn";
        } else {
            st = str.slice(0, 1); //take 1 character
            tagst = (("A" > st || st > "Z") && ("a" > st || st > "z") ? "mo" : "mi");
        }
        /*
        // Commented out by DRW (not fully understood, but probably to do with
        // use of "/" as an INFIX version of "\\frac", which we don't want):
        //}
        //if (st=="-" && AMpreviousSymbol==INFIX) {
        //  AMcurrentSymbol = INFIX;  //trick "/" into recognizing "-" on second parse
        //  return {input:st, tag:tagst, output:st, ttype:UNARY, func:true};
        //}
        */
        return { input: st, tag: tagst, output: st, ttype: CONST };
    }


    /*Parsing ASCII math expressions with the following grammar
    v ::= [A-Za-z] | greek letters | numbers | other constant symbols
    u ::= sqrt | text | bb | other unary symbols for font commands
    b ::= frac | root | stackrel	binary symbols
    l ::= { | \left			left brackets
    r ::= } | \right		right brackets
    S ::= v | lEr | uS | bSS	Simple expression
    I ::= S_S | S^S | S_S^S | S	Intermediate expression
    E ::= IE | I/I			Expression
    Each terminal symbol is translated into a corresponding mathml node.*/

    var AMpreviousSymbol, AMcurrentSymbol;

    function AMparseSexpr(str) { //parses str and returns [node,tailstr,(node)tag]
        var symbol, node, result, result2, i, st,// rightvert = false,
          newFrag = document.createDocumentFragment();
        str = AMremoveCharsAndBlanks(str, 0);
        symbol = AMgetSymbol(str);             //either a token or a bracket or empty
        if (symbol == null || symbol.ttype == RIGHTBRACKET)
            return [null, str, null];
        if (symbol.ttype == DEFINITION) {
            str = symbol.output + AMremoveCharsAndBlanks(str, symbol.input.length);
            symbol = AMgetSymbol(str);
            if (symbol == null || symbol.ttype == RIGHTBRACKET)
                return [null, str, null];
        }
        str = AMremoveCharsAndBlanks(str, symbol.input.length);
        switch (symbol.ttype) {
            case SPACE:
                node = AMcreateElementMathML(symbol.tag);
                node.setAttribute(symbol.atname, symbol.atval);
                return [node, str, symbol.tag];
            case UNDEROVER:
                if (isIE) {
                    if (symbol.input.substr(0, 4) == "\\big") {   // botch for missing symbols
                        str = "\\" + symbol.input.substr(4) + str;	   // make \bigcup = \cup etc.
                        symbol = AMgetSymbol(str);
                        symbol.ttype = UNDEROVER;
                        str = AMremoveCharsAndBlanks(str, symbol.input.length);
                    }
                }
                return [AMcreateMmlNode(symbol.tag,
                        document.createTextNode(symbol.output)), str, symbol.tag];
            case CONST:
                var output = symbol.output;
                if (isIE) {
                    if (symbol.input == "'")
                        output = "\u2032";
                    else if (symbol.input == "''")
                        output = "\u2033";
                    else if (symbol.input == "'''")
                        output = "\u2033\u2032";
                    else if (symbol.input == "''''")
                        output = "\u2033\u2033";
                    else if (symbol.input == "\\square")
                        output = "\u25A1";	// same as \Box
                    else if (symbol.input.substr(0, 5) == "\\frac") {
                        // botch for missing fractions
                        var denom = symbol.input.substr(6, 1);
                        if (denom == "5" || denom == "6") {
                            str = symbol.input.replace(/\\frac/, "\\frac ") + str;
                            return [node, str, symbol.tag];
                        }
                    }
                }
                node = AMcreateMmlNode(symbol.tag, document.createTextNode(output));
                return [node, str, symbol.tag];
            case LONG:  // added by DRW
                node = AMcreateMmlNode(symbol.tag, document.createTextNode(symbol.output));
                node.setAttribute("minsize", "1.5");
                node.setAttribute("maxsize", "1.5");
                node = AMcreateMmlNode("mover", node);
                node.appendChild(AMcreateElementMathML("mspace"));
                return [node, str, symbol.tag];
            case STRETCHY:  // added by DRW
                if (isIE && symbol.input == "\\backslash")
                    symbol.output = "\\";	// doesn't expand, but then nor does "\u2216"
                node = AMcreateMmlNode(symbol.tag, document.createTextNode(symbol.output));
                if (symbol.input == "|" || symbol.input == "\\vert" ||
                symbol.input == "\\|" || symbol.input == "\\Vert") {
                    node.setAttribute("lspace", "0em");
                    node.setAttribute("rspace", "0em");
                }
                node.setAttribute("maxsize", symbol.atval);  // don't allow to stretch here
                if (symbol.rtag != null)
                    return [node, str, symbol.rtag];
                else
                    return [node, str, symbol.tag];
            case BIG:  // added by DRW
                var atval = symbol.atval;
                if (isIE)
                    atval = symbol.ieval;
                symbol = AMgetSymbol(str);
                if (symbol == null)
                    return [null, str, null];
                str = AMremoveCharsAndBlanks(str, symbol.input.length);
                node = AMcreateMmlNode(symbol.tag, document.createTextNode(symbol.output));
                if (isIE) {		// to get brackets to expand
                    var space = AMcreateElementMathML("mspace");
                    space.setAttribute("height", atval + "ex");
                    node = AMcreateMmlNode("mrow", node);
                    node.appendChild(space);
                } else {		// ignored in IE
                    node.setAttribute("minsize", atval);
                    node.setAttribute("maxsize", atval);
                }
                return [node, str, symbol.tag];
            case LEFTBRACKET:   //read (expr+)
                if (symbol.input == "\\left") { // left what?
                    symbol = AMgetSymbol(str);
                    if (symbol != null) {
                        if (symbol.input == ".")
                            symbol.invisible = true;
                        str = AMremoveCharsAndBlanks(str, symbol.input.length);
                    }
                }
                result = AMparseExpr(str, true, false);
                if (symbol == null ||
                (typeof symbol.invisible == "boolean" && symbol.invisible))
                    node = AMcreateMmlNode("mrow", result[0]);
                else {
                    node = AMcreateMmlNode("mo", document.createTextNode(symbol.output));
                    node = AMcreateMmlNode("mrow", node);
                    node.appendChild(result[0]);
                }
                return [node, result[1], result[2]];
            case MATRIX:	 //read (expr+)
                if (symbol.input == "\\begin{array}") {
                    var mask = "";
                    symbol = AMgetSymbol(str);
                    str = AMremoveCharsAndBlanks(str, 0);
                    if (symbol == null)
                        mask = "l";
                    else {
                        str = AMremoveCharsAndBlanks(str, symbol.input.length);
                        if (symbol.input != "{")
                            mask = "l";
                        else do {
                            symbol = AMgetSymbol(str);
                            if (symbol != null) {
                                str = AMremoveCharsAndBlanks(str, symbol.input.length);
                                if (symbol.input != "}")
                                    mask = mask + symbol.input;
                            }
                        } while (symbol != null && symbol.input != "" && symbol.input != "}");
                    }
                    result = AMparseExpr("{" + str, true, true);
                    //    if (result[0]==null) return [AMcreateMmlNode("mo",
                    //			   document.createTextNode(symbol.input)),str];
                    node = AMcreateMmlNode("mtable", result[0]);
                    mask = mask.replace(/l/g, "left ");
                    mask = mask.replace(/r/g, "right ");
                    mask = mask.replace(/c/g, "center ");
                    node.setAttribute("columnalign", mask);
                    node.setAttribute("displaystyle", "false");
                    if (isIE)
                        return [node, result[1], null];
                    // trying to get a *little* bit of space around the array
                    // (IE already includes it)
                    var lspace = AMcreateElementMathML("mspace");
                    lspace.setAttribute("width", "0.167em");
                    var rspace = AMcreateElementMathML("mspace");
                    rspace.setAttribute("width", "0.167em");
                    var node1 = AMcreateMmlNode("mrow", lspace);
                    node1.appendChild(node);
                    node1.appendChild(rspace);
                    return [node1, result[1], null];
                } else {	// eqnarray
                    result = AMparseExpr("{" + str, true, true);
                    node = AMcreateMmlNode("mtable", result[0]);
                    if (isIE)
                        node.setAttribute("columnspacing", "0.25em"); // best in practice?
                    else
                        node.setAttribute("columnspacing", "0.167em"); // correct (but ignored?)
                    node.setAttribute("columnalign", "right center left");
                    node.setAttribute("displaystyle", "true");
                    node = AMcreateMmlNode("mrow", node);
                    return [node, result[1], null];
                }
            case TEXT:
                if (str.charAt(0) == "{") i = str.indexOf("}");
                else i = 0;
                if (i == -1)
                    i = str.length;
                st = str.slice(1, i);
                if (st.charAt(0) == " ") {
                    node = AMcreateElementMathML("mspace");
                    node.setAttribute("width", "0.33em");	// was 1ex
                    newFrag.appendChild(node);
                }
                newFrag.appendChild(
                  AMcreateMmlNode(symbol.tag, document.createTextNode(st)));
                if (st.charAt(st.length - 1) == " ") {
                    node = AMcreateElementMathML("mspace");
                    node.setAttribute("width", "0.33em");	// was 1ex
                    newFrag.appendChild(node);
                }
                str = AMremoveCharsAndBlanks(str, i + 1);
                return [AMcreateMmlNode("mrow", newFrag), str, null];
            case UNARY:
                result = AMparseSexpr(str);
                if (result[0] == null) return [AMcreateMmlNode(symbol.tag,
                                       document.createTextNode(symbol.output)), str];
                if (typeof symbol.func == "boolean" && symbol.func) { // functions hack
                    st = str.charAt(0);
                    //	if (st=="^" || st=="_" || st=="/" || st=="|" || st==",") {
                    if (st == "^" || st == "_" || st == ",") {
                        return [AMcreateMmlNode(symbol.tag,
                              document.createTextNode(symbol.output)), str, symbol.tag];
                    } else {
                        node = AMcreateMmlNode("mrow",
                         AMcreateMmlNode(symbol.tag, document.createTextNode(symbol.output)));
                        if (isIE) {
                            var space = AMcreateElementMathML("mspace");
                            space.setAttribute("width", "0.167em");
                            node.appendChild(space);
                        }
                        node.appendChild(result[0]);
                        return [node, result[1], symbol.tag];
                    }
                }
                if (symbol.input == "\\sqrt") {		// sqrt
                    if (isIE) {	// set minsize, for \surd
                        var space = AMcreateElementMathML("mspace");
                        space.setAttribute("height", "1.2ex");
                        space.setAttribute("width", "0em");	// probably no effect
                        node = AMcreateMmlNode(symbol.tag, result[0])
                        //	  node.setAttribute("minsize","1");	// ignored
                        //	  node = AMcreateMmlNode("mrow",node);  // hopefully unnecessary
                        node.appendChild(space);
                        return [node, result[1], symbol.tag];
                    } else
                        return [AMcreateMmlNode(symbol.tag, result[0]), result[1], symbol.tag];
                } else if (typeof symbol.acc == "boolean" && symbol.acc) {   // accent
                    node = AMcreateMmlNode(symbol.tag, result[0]);
                    var output = symbol.output;
                    if (isIE) {
                        if (symbol.input == "\\hat")
                            output = "\u0302";
                        else if (symbol.input == "\\widehat")
                            output = "\u005E";
                        else if (symbol.input == "\\bar")
                            output = "\u00AF";
                        else if (symbol.input == "\\grave")
                            output = "\u0300";
                        else if (symbol.input == "\\tilde")
                            output = "\u0303";
                    }
                    var node1 = AMcreateMmlNode("mo", document.createTextNode(output));
                    if (symbol.input == "\\vec" || symbol.input == "\\check")
                        // don't allow to stretch
                        node1.setAttribute("maxsize", "1.2");
                    // why doesn't "1" work?  \vec nearly disappears in firefox
                    if (isIE && symbol.input == "\\bar")
                        node1.setAttribute("maxsize", "0.5");
                    if (symbol.input == "\\underbrace" || symbol.input == "\\underline")
                        node1.setAttribute("accentunder", "true");
                    else
                        node1.setAttribute("accent", "true");
                    node.appendChild(node1);
                    if (symbol.input == "\\overbrace" || symbol.input == "\\underbrace")
                        node.ttype = UNDEROVER;
                    return [node, result[1], symbol.tag];
                } else {			      // font change or displaystyle command
                    if (!isIE && typeof symbol.codes != "undefined") {
                        for (i = 0; i < result[0].childNodes.length; i++)
                            if (result[0].childNodes[i].nodeName == "mi" || result[0].nodeName == "mi") {
                                st = (result[0].nodeName == "mi" ? result[0].firstChild.nodeValue :
                                                result[0].childNodes[i].firstChild.nodeValue);
                                var newst = [];
                                for (var j = 0; j < st.length; j++)
                                    if (st.charCodeAt(j) > 64 && st.charCodeAt(j) < 91) newst = newst +
                                      String.fromCharCode(symbol.codes[st.charCodeAt(j) - 65]);
                                    else newst = newst + st.charAt(j);
                                if (result[0].nodeName == "mi")
                                    result[0] = AMcreateElementMathML("mo").
                                              appendChild(document.createTextNode(newst));
                                else result[0].replaceChild(AMcreateElementMathML("mo").
                            appendChild(document.createTextNode(newst)), result[0].childNodes[i]);
                            }
                    }
                    node = AMcreateMmlNode(symbol.tag, result[0]);
                    node.setAttribute(symbol.atname, symbol.atval);
                    if (symbol.input == "\\scriptstyle" ||
                        symbol.input == "\\scriptscriptstyle")
                        node.setAttribute("displaystyle", "false");
                    return [node, result[1], symbol.tag];
                }
            case BINARY:
                result = AMparseSexpr(str);
                if (result[0] == null) return [AMcreateMmlNode("mo",
                           document.createTextNode(symbol.input)), str, null];
                result2 = AMparseSexpr(result[1]);
                if (result2[0] == null) return [AMcreateMmlNode("mo",
                           document.createTextNode(symbol.input)), str, null];
                if (symbol.input == "\\root" || symbol.input == "\\stackrel")
                    newFrag.appendChild(result2[0]);
                newFrag.appendChild(result[0]);
                if (symbol.input == "\\frac") newFrag.appendChild(result2[0]);
                return [AMcreateMmlNode(symbol.tag, newFrag), result2[1], symbol.tag];
            case INFIX:
                str = AMremoveCharsAndBlanks(str, symbol.input.length);
                return [AMcreateMmlNode("mo", document.createTextNode(symbol.output)),
                str, symbol.tag];
            default:
                return [AMcreateMmlNode(symbol.tag,        //its a constant
                document.createTextNode(symbol.output)), str, symbol.tag];
        }
    }

    function AMparseIexpr(str) {
        var symbol, sym1, sym2, node, result, tag, underover;
        str = AMremoveCharsAndBlanks(str, 0);
        sym1 = AMgetSymbol(str);
        result = AMparseSexpr(str);
        node = result[0];
        str = result[1];
        tag = result[2];
        symbol = AMgetSymbol(str);
        if (symbol.ttype == INFIX) {
            str = AMremoveCharsAndBlanks(str, symbol.input.length);
            result = AMparseSexpr(str);
            if (result[0] == null) // show box in place of missing argument
                result[0] = AMcreateMmlNode("mo", document.createTextNode("\u25A1"));
            str = result[1];
            tag = result[2];
            if (symbol.input == "_" || symbol.input == "^") {
                sym2 = AMgetSymbol(str);
                tag = null;	// no space between x^2 and a following sin, cos, etc.
                // This is for \underbrace and \overbrace
                underover = ((sym1.ttype == UNDEROVER) || (node.ttype == UNDEROVER));
                //    underover = (sym1.ttype == UNDEROVER);
                if (symbol.input == "_" && sym2.input == "^") {
                    str = AMremoveCharsAndBlanks(str, sym2.input.length);
                    var res2 = AMparseSexpr(str);
                    str = res2[1];
                    tag = res2[2];  // leave space between x_1^2 and a following sin etc.
                    node = AMcreateMmlNode((underover ? "munderover" : "msubsup"), node);
                    node.appendChild(result[0]);
                    node.appendChild(res2[0]);
                } else if (symbol.input == "_") {
                    node = AMcreateMmlNode((underover ? "munder" : "msub"), node);
                    node.appendChild(result[0]);
                } else {
                    node = AMcreateMmlNode((underover ? "mover" : "msup"), node);
                    node.appendChild(result[0]);
                }
                node = AMcreateMmlNode("mrow", node); // so sum does not stretch
            } else {
                node = AMcreateMmlNode(symbol.tag, node);
                if (symbol.input == "\\atop" || symbol.input == "\\choose")
                    node.setAttribute("linethickness", "0ex");
                node.appendChild(result[0]);
                if (symbol.input == "\\choose")
                    node = AMcreateMmlNode("mfenced", node);
            }
        }
        return [node, str, tag];
    }

    function AMparseExpr(str, rightbracket, matrix) {
        var symbol, node, result, i, tag,
        newFrag = document.createDocumentFragment();
        do {
            str = AMremoveCharsAndBlanks(str, 0);
            result = AMparseIexpr(str);
            node = result[0];
            str = result[1];
            tag = result[2];
            symbol = AMgetSymbol(str);
            if (node != undefined) {
                if ((tag == "mn" || tag == "mi") && symbol != null &&
              typeof symbol.func == "boolean" && symbol.func) {
                    // Add space before \sin in 2\sin x or x\sin x
                    var space = AMcreateElementMathML("mspace");
                    space.setAttribute("width", "0.167em");
                    node = AMcreateMmlNode("mrow", node);
                    node.appendChild(space);
                }
                newFrag.appendChild(node);
            }
        } while ((symbol.ttype != RIGHTBRACKET)
              && symbol != null && symbol.output != "");
        tag = null;
        if (symbol.ttype == RIGHTBRACKET) {
            if (symbol.input == "\\right") { // right what?
                str = AMremoveCharsAndBlanks(str, symbol.input.length);
                symbol = AMgetSymbol(str);
                if (symbol != null && symbol.input == ".")
                    symbol.invisible = true;
                if (symbol != null)
                    tag = symbol.rtag;
            }
            if (symbol != null)
                str = AMremoveCharsAndBlanks(str, symbol.input.length); // ready to return
            var len = newFrag.childNodes.length;
            if (matrix &&
              len > 0 && newFrag.childNodes[len - 1].nodeName == "mrow" && len > 1 &&
              newFrag.childNodes[len - 2].nodeName == "mo" &&
              newFrag.childNodes[len - 2].firstChild.nodeValue == "&") { //matrix
                var pos = []; // positions of ampersands
                var m = newFrag.childNodes.length;
                for (i = 0; matrix && i < m; i = i + 2) {
                    pos[i] = [];
                    node = newFrag.childNodes[i];
                    for (var j = 0; j < node.childNodes.length; j++)
                        if (node.childNodes[j].firstChild.nodeValue == "&")
                            pos[i][pos[i].length] = j;
                }
                var row, frag, n, k, table = document.createDocumentFragment();
                for (i = 0; i < m; i = i + 2) {
                    row = document.createDocumentFragment();
                    frag = document.createDocumentFragment();
                    node = newFrag.firstChild; // <mrow> -&-&...&-&- </mrow>
                    n = node.childNodes.length;
                    k = 0;
                    for (j = 0; j < n; j++) {
                        if (typeof pos[i][k] != "undefined" && j == pos[i][k]) {
                            node.removeChild(node.firstChild); //remove &
                            row.appendChild(AMcreateMmlNode("mtd", frag));
                            k++;
                        } else frag.appendChild(node.firstChild);
                    }
                    row.appendChild(AMcreateMmlNode("mtd", frag));
                    if (newFrag.childNodes.length > 2) {
                        newFrag.removeChild(newFrag.firstChild); //remove <mrow> </mrow>
                        newFrag.removeChild(newFrag.firstChild); //remove <mo>&</mo>
                    }
                    table.appendChild(AMcreateMmlNode("mtr", row));
                }
                return [table, str];
            }
            if (typeof symbol.invisible != "boolean" || !symbol.invisible) {
                node = AMcreateMmlNode("mo", document.createTextNode(symbol.output));
                newFrag.appendChild(node);
            }
        }
        return [newFrag, str, tag];
    }

    function AMparseMath(str) {
        var result, node = AMcreateElementMathML("mstyle");
        if (mathcolor != "") node.setAttribute("mathcolor", mathcolor);
        if (mathfontfamily != "") node.setAttribute("fontfamily", mathfontfamily);
        node.appendChild(AMparseExpr(str.replace(/^\s+/g, ""), false, false)[0]);
        node = AMcreateMmlNode("math", node);
        if (showasciiformulaonhover)                      //fixed by djhsu so newline
            node.setAttribute("title", str.replace(/\s+/g, " "));//does not show in Gecko
        if (mathfontfamily != "" && (isIE || mathfontfamily != "serif")) {
            var fnode = AMcreateElementXHTML("font");
            fnode.setAttribute("face", mathfontfamily);
            fnode.appendChild(node);
            return fnode;
        }
        return node;
    }

    /* Commented out by laughinghan: I believe the following traverses the
     * DOM searching for LaTeX snippets and translates them to MathML,
     * onload, none of which we want. The entry point for this file is
     * AMparseMath, called by widget.js.
    
    function AMstrarr2docFrag(arr, linebreaks) {
      var newFrag=document.createDocumentFragment();
      var expr = false;
      for (var i=0; i<arr.length; i++) {
        if (expr) newFrag.appendChild(AMparseMath(arr[i]));
        else {
          var arri = (linebreaks ? arr[i].split("\n\n") : [arr[i]]);
          newFrag.appendChild(AMcreateElementXHTML("span").
          appendChild(document.createTextNode(arri[0])));
          for (var j=1; j<arri.length; j++) {
            newFrag.appendChild(AMcreateElementXHTML("p"));
            newFrag.appendChild(AMcreateElementXHTML("span").
            appendChild(document.createTextNode(arri[j])));
          }
        }
        expr = !expr;
      }
      return newFrag;
    }
    
    function AMprocessNodeR(n, linebreaks) {
      var mtch, str, arr, frg, i;
      if (n.childNodes.length == 0) {
       if ((n.nodeType!=8 || linebreaks) &&
        n.parentNode.nodeName!="form" && n.parentNode.nodeName!="FORM" &&
        n.parentNode.nodeName!="textarea" && n.parentNode.nodeName!="TEXTAREA" &&
        n.parentNode.nodeName!="pre" && n.parentNode.nodeName!="PRE") {
        str = n.nodeValue;
        if (!(str == null)) {
          str = str.replace(/\r\n\r\n/g,"\n\n");
          str = str.replace(/\x20+/g," ");
          str = str.replace(/\s*\r\n/g," ");
    // DELIMITERS:
          mtch = (str.indexOf("\$")==-1 ? false : true);
          str = str.replace(/([^\\])\$/g,"$1 \$");
          str = str.replace(/^\$/," \$");	// in case \$ at start of string
          arr = str.split(" \$");
          for (i=0; i<arr.length; i++)
        arr[i]=arr[i].replace(/\\\$/g,"\$");
          if (arr.length>1 || mtch) {
            if (checkForMathML) {
              checkForMathML = false;
              var nd = AMisMathMLavailable();
              AMnoMathML = nd != null;
              if (AMnoMathML && notifyIfNoMathML)
                if (alertIfNoMathML)
                  alert("To view the ASCIIMathML notation use Internet Explorer 6 +\nMathPlayer (free from www.dessci.com)\n\
                    or Firefox/Mozilla/Netscape");
                else AMbody.insertBefore(nd,AMbody.childNodes[0]);
            }
            if (!AMnoMathML) {
              frg = AMstrarr2docFrag(arr,n.nodeType==8);
              var len = frg.childNodes.length;
              n.parentNode.replaceChild(frg,n);
              return len-1;
            } else return 0;
          }
        }
       } else return 0;
      } else if (n.nodeName!="math") {
        for (i=0; i<n.childNodes.length; i++)
          i += AMprocessNodeR(n.childNodes[i], linebreaks);
      }
      return 0;
    }
    
    function AMprocessNode(n, linebreaks, spanclassAM) {
      var frag,st;
      if (spanclassAM!=null) {
        frag = document.getElementsByTagName("span")
        for (var i=0;i<frag.length;i++)
          if (frag[i].className == "AM")
            AMprocessNodeR(frag[i],linebreaks);
      } else {
        try {
          st = n.innerHTML;
        } catch(err) {}
    // DELIMITERS:
        if (st==null || st.indexOf("\$")!=-1)
          AMprocessNodeR(n,linebreaks);
      }
      if (isIE) { //needed to match size and font of formula to surrounding text
        frag = document.getElementsByTagName('math');
        for (var i=0;i<frag.length;i++) frag[i].update()
      }
    }
    
    var AMbody;
    var AMnoMathML = false, AMtranslated = false;
    
    function translate(spanclassAM) {
      if (!AMtranslated) { // run this only once
        AMtranslated = true;
        AMinitSymbols();
        AMbody = document.getElementsByTagName("body")[0];
        AMprocessNode(AMbody, false, spanclassAM);
      }
    }
    
    if (isIE) { // avoid adding MathPlayer info explicitly to each webpage
      document.write("<object id=\"mathplayer\"\
      classid=\"clsid:32F66A20-7614-11D4-BD11-00104BD3F987\"></object>");
      document.write("<?import namespace=\"m\" implementation=\"#mathplayer\"?>");
    }
    
    // GO1.1 Generic onload by Brothercake
    // http://www.brothercake.com/
    //onload function (replaces the onload="translate()" in the <body> tag)
    function generic()
    {
      translate();
    };
    //setup onload function
    if(typeof window.addEventListener != 'undefined')
    {
      //.. gecko, safari, konqueror and standard
      window.addEventListener('load', generic, false);
    }
    else if(typeof document.addEventListener != 'undefined')
    {
      //.. opera 7
      document.addEventListener('load', generic, false);
    }
    else if(typeof window.attachEvent != 'undefined')
    {
      //.. win/ie
      window.attachEvent('onload', generic);
    }
    //** remove this condition to degrade older browsers
    else
    {
      //.. mac/ie5 and anything else that gets this far
      //if there's an existing onload function
      if(typeof window.onload == 'function')
      {
        //store it
        var existing = onload;
        //add new onload handler
        window.onload = function()
        {
          //call existing onload function
          existing();
          //call generic onload function
          generic();
        };
      }
      else
      {
        //setup onload function
        window.onload = generic;
      }
    }
    */
    var xsltMathml = "<?xml version='1.0' encoding=\"UTF-8\"?>\r\n<xsl:stylesheet xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\"\r\n\t\txmlns:m=\"http://www.w3.org/1998/Math/MathML\"\r\n                version='1.0'>\r\n                \r\n<xsl:output method=\"text\" indent=\"no\" encoding=\"UTF-8\"/>\r\n\r\n<!-- ====================================================================== -->\r\n<!-- $id: mmltex.xsl, 2002/22/11 Exp $\r\n     This file is part of the XSLT MathML Library distribution.\r\n     See ./README or http://www.raleigh.ru/MathML/mmltex for\r\n     copyright and other information                                        -->\r\n<!-- ====================================================================== -->\r\n\r\n<!--xsl:include href=\"tokens.xsl\"/-->\r\n\r\n<xsl:template match=\"m:mi|m:mn|m:mo|m:mtext|m:ms\">\r\n\t<xsl:call-template name=\"CommonTokenAtr\"/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mi\">\r\n  <xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mn\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mo\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mtext\">\r\n\t<xsl:variable name=\"content\">\r\n\t\t<xsl:call-template name=\"replaceMtextEntities\">\r\n\t\t\t<xsl:with-param name=\"content\" select=\".\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t<xsl:text>\\text{</xsl:text>\r\n\t<xsl:value-of select=\"$content\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mspace\">\r\n</xsl:template>\r\n\r\n<xsl:template name=\"ms\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@lquote\"><xsl:value-of select=\"@lquote\"/></xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\"</xsl:text></xsl:otherwise>\r\n\t</xsl:choose><xsl:apply-templates/><xsl:choose>\r\n\t\t<xsl:when test=\"@rquote\"><xsl:value-of select=\"@rquote\"/></xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\"</xsl:text></xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"CommonTokenAtr\">\r\n\t<xsl:if test=\"@mathbackground\">\r\n\t\t<xsl:text>\\colorbox[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@mathbackground\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{$</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@color or @mathcolor\"> <!-- Note: @color is deprecated in MathML 2.0 -->\r\n\t\t<xsl:text>\\textcolor[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@color|@mathcolor\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@mathvariant\">\r\n\t\t<xsl:choose>\r\n\t\t\t<xsl:when test=\"@mathvariant='normal'\">\r\n\t\t\t\t<xsl:text>\\mathrm{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold'\">\r\n\t\t\t\t<xsl:text>\\mathbf{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='italic'\">\r\n\t\t\t\t<xsl:text>\\mathit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-italic'\">\t<!-- Required definition -->\r\n\t\t\t\t<xsl:text>\\mathbit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='double-struck'\">\t<!-- Required amsfonts -->\r\n\t\t\t\t<xsl:text>\\mathbb{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-fraktur'\">\t<!-- Error -->\r\n\t\t\t\t<xsl:text>{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='script'\">\r\n\t\t\t\t<xsl:text>\\mathcal{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-script'\">\t<!-- Error -->\r\n\t\t\t\t<xsl:text>\\mathsc{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='fraktur'\">\t<!-- Required amsfonts -->\r\n\t\t\t\t<xsl:text>\\mathfrak{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='sans-serif'\">\r\n\t\t\t\t<xsl:text>\\mathsf{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-sans-serif'\"> <!-- Required definition -->\r\n\t\t\t\t<xsl:text>\\mathbsf{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='sans-serif-italic'\"> <!-- Required definition -->\r\n\t\t\t\t<xsl:text>\\mathsfit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='sans-serif-bold-italic'\">\t<!-- Error -->\r\n\t\t\t\t<xsl:text>\\mathbsfit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='monospace'\">\r\n\t\t\t\t<xsl:text>\\mathtt{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:otherwise>\r\n\t\t\t\t<xsl:text>{</xsl:text>\r\n\t\t\t</xsl:otherwise>\r\n\t\t</xsl:choose>\r\n\t</xsl:if>\r\n\t<xsl:call-template name=\"selectTemplate\"/>\r\n\t<xsl:if test=\"@mathvariant\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@color or @mathcolor\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@mathbackground\">\r\n\t\t<xsl:text>$}</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"selectTemplate\">\r\n<!--\t<xsl:variable name=\"name\" select=\"local-name()\"/>\r\n\t<xsl:call-template name=\"{$name}\"/>-->\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"local-name(.)='mi'\">\r\n\t\t\t<xsl:call-template name=\"mi\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='mn'\">\r\n\t\t\t<xsl:call-template name=\"mn\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='mo'\">\r\n\t\t\t<xsl:call-template name=\"mo\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='mtext'\">\r\n\t\t\t<xsl:call-template name=\"mtext\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='ms'\">\r\n\t\t\t<xsl:call-template name=\"ms\"/>\r\n\t\t</xsl:when>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"color\">\r\n<!-- NB: Variables colora and valueColor{n} only for Sablotron -->\r\n\t<xsl:param name=\"color\"/>\r\n\t<xsl:variable name=\"colora\" select=\"translate($color,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')\"/>\r\n\t<xsl:choose>\r\n\t<xsl:when test=\"starts-with($colora,'#') and string-length($colora)=4\">\r\n\t\t<xsl:variable name=\"valueColor\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,2,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"$valueColor div 15\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor1\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,3,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"$valueColor1 div 15\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor2\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,4,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"$valueColor2 div 15\"/>\r\n\t</xsl:when>\r\n\t<xsl:when test=\"starts-with($colora,'#') and string-length($colora)=7\">\r\n\t\t<xsl:variable name=\"valueColor1\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,2,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:variable name=\"valueColor2\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,3,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"($valueColor1*16 + $valueColor2) div 255\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor1a\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,4,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:variable name=\"valueColor2a\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,5,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"($valueColor1a*16 + $valueColor2a) div 255\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor1b\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,6,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:variable name=\"valueColor2b\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,7,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"($valueColor1b*16 + $valueColor2b) div 255\"/>\r\n\t</xsl:when>\r\n<!-- ======================= if color specifed as an html-color-name ========================================== -->\r\n\t<xsl:when test=\"$colora='aqua'\"><xsl:text>0,1,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='black'\"><xsl:text>0,0,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='blue'\"><xsl:text>0,0,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='fuchsia'\"><xsl:text>1,0,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='gray'\"><xsl:text>.5,.5,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='green'\"><xsl:text>0,.5,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='lime'\"><xsl:text>0,1,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='maroon'\"><xsl:text>.5,0,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='navy'\"><xsl:text>0,0,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='olive'\"><xsl:text>.5,.5,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='purple'\"><xsl:text>.5,0,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='red'\"><xsl:text>1,0,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='silver'\"><xsl:text>.75,.75,.75</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='teal'\"><xsl:text>0,.5,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='white'\"><xsl:text>1,1,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='yellow'\"><xsl:text>1,1,0</xsl:text></xsl:when>\r\n\t<xsl:otherwise>\r\n\t\t<xsl:message>Exception at color template</xsl:message>\r\n\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"Hex2Decimal\">\r\n\t<xsl:param name=\"arg\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$arg='f'\">\r\n\t\t\t<xsl:value-of select=\"15\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='e'\">\r\n\t\t\t<xsl:value-of select=\"14\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='d'\">\r\n\t\t\t<xsl:value-of select=\"13\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='c'\">\r\n\t\t\t<xsl:value-of select=\"12\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='b'\">\r\n\t\t\t<xsl:value-of select=\"11\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='a'\">\r\n\t\t\t<xsl:value-of select=\"10\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($arg, '0123456789', '9999999999')='9'\"> <!-- if $arg is number -->\r\n\t\t\t<xsl:value-of select=\"$arg\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:message>Exception at Hex2Decimal template</xsl:message>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:*/text()\">\r\n\t<xsl:call-template name=\"replaceEntities\">\r\n\t\t<xsl:with-param name=\"content\" select=\"normalize-space()\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n<!--xsl:include href=\"glayout.xsl\"/-->\r\n<xsl:template match=\"m:mfrac\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@bevelled='true'\">\r\n<!--\t\t\t<xsl:text>\\raisebox{1ex}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}\\!\\left/ \\!\\raisebox{-1ex}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}\\right.</xsl:text>-->\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"@linethickness\">\r\n\t\t\t<xsl:text>\\genfrac{}{}{</xsl:text>\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"number(@linethickness)\">\r\n\t\t\t\t\t<xsl:value-of select=\"@linethickness div 10\"/>\r\n\t\t\t\t\t<xsl:text>ex</xsl:text>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:when test=\"@linethickness='thin'\">\r\n\t\t\t\t\t<xsl:text>.05ex</xsl:text>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:when test=\"@linethickness='medium'\"/>\r\n\t\t\t\t<xsl:when test=\"@linethickness='thick'\">\r\n\t\t\t\t\t<xsl:text>.2ex</xsl:text>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:otherwise>\r\n\t\t\t\t\t<xsl:value-of select=\"@linethickness\"/>\r\n\t\t\t\t</xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t\t<xsl:text>}{}{</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\frac{</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:if test=\"@numalign='right'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:if test=\"@numalign='left'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>}{</xsl:text>\t\r\n\t<xsl:if test=\"@denomalign='right'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t<xsl:if test=\"@denomalign='left'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mroot\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"count(./*)=2\">\r\n\t\t\t<xsl:text>\\sqrt[</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>]{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t<!-- number of argumnets is not 2 - code 25 -->\r\n\t\t\t<xsl:message>exception 25:</xsl:message>\r\n\t\t\t<xsl:text>\\text{exception 25:}</xsl:text> \r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msqrt\">\r\n\t<xsl:text>\\sqrt{</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mfenced\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@open\">\r\n\t\t\t<xsl:if test=\"translate(@open,'{}[]()|','{{{{{{{')='{'\">\r\n\t\t\t\t<xsl:text>\\left</xsl:text>\r\n\t\t\t</xsl:if>\r\n\t\t\t<xsl:if test=\"@open='{' or @open='}'\">\r\n\t\t\t\t<xsl:text>\\</xsl:text>\r\n\t\t\t</xsl:if>\r\n\t\t\t<xsl:value-of select=\"@open\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\left(</xsl:text></xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"count(./*)>1\">\r\n\t\t\t<xsl:variable name=\"symbol\">\r\n\t\t\t\t<xsl:choose>\r\n\t\t\t\t\t<xsl:when test=\"@separators\">\r\n\t\t\t\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t\t\t\t<xsl:with-param name=\"symbol\" select=\"@separators\"/>\r\n\t\t\t\t\t\t</xsl:call-template>\r\n\t\t\t\t\t</xsl:when>\r\n\t\t\t\t\t<xsl:otherwise>,</xsl:otherwise>\r\n\t\t\t\t</xsl:choose>\r\n\t\t\t</xsl:variable>\r\n\t\t\t<xsl:for-each select=\"./*\">\r\n\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t<xsl:if test=\"not(position()=last())\">\r\n\t\t\t\t\t<xsl:choose>\r\n\t\t\t\t\t\t<xsl:when test=\"position()>string-length($symbol)\">\r\n\t\t\t\t\t\t\t<xsl:value-of select=\"substring($symbol,string-length($symbol))\"/>\r\n\t\t\t\t\t\t</xsl:when>\r\n\t\t\t\t\t\t<xsl:otherwise>\r\n\t\t\t\t\t\t\t<xsl:value-of select=\"substring($symbol,position(),1)\"/>\r\n\t\t\t\t\t\t</xsl:otherwise>\r\n\t\t\t\t\t</xsl:choose>\r\n\t\t\t\t</xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@close\">\r\n\t\t\t<xsl:if test=\"translate(@open,'{}[]()|','{{{{{{{')='{'\">\r\n\t\t\t\t<xsl:text>\\right</xsl:text>\r\n\t\t\t</xsl:if>\r\n\t\t\t<xsl:if test=\"@open='{' or @open='}'\">\r\n\t\t\t\t<xsl:text>\\</xsl:text>\r\n\t\t\t</xsl:if>\t\t\r\n\t\t\t<xsl:value-of select=\"@close\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\right)</xsl:text></xsl:otherwise>\r\n\t</xsl:choose>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mphantom\">\r\n\t<xsl:text>\\phantom{</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:menclose\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@notation = 'actuarial'\">\r\n\t\t\t<xsl:text>\\overline{</xsl:text>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t\t<xsl:text>\\hspace{.2em}|}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"@notation = 'radical'\">\r\n\t\t\t<xsl:text>\\sqrt{</xsl:text>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\overline{)</xsl:text>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mrow\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mstyle\">\r\n\t<xsl:if test=\"@background\">\r\n\t\t<xsl:text>\\colorbox[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@background\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{$</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@color\">\r\n\t\t<xsl:text>\\textcolor[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@color\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@color\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@background\">\r\n\t\t<xsl:text>$}</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n<!--\r\n\r\n<xsl:template match=\"m:mstyle\">\r\n\t<xsl:if test=\"@displaystyle='true'\">\r\n\t\t<xsl:text>{\\displaystyle</xsl:text>\r\n\t</xsl:if>\t\t\t\r\n\t<xsl:if test=\"@scriptlevel=2\">\r\n\t\t<xsl:text>{\\scriptscriptstyle</xsl:text>\t\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@scriptlevel=2\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@displaystyle='true'\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n-->\r\n\r\n<xsl:template match=\"m:merror\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n<!--xsl:include href=\"scripts.xsl\"/-->\r\n<xsl:template match=\"m:munderover\">\r\n\t<xsl:variable name=\"base\">\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[1]\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t<xsl:variable name=\"under\">\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[2]\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t<xsl:variable name=\"over\">\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[3]\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$over='&#x000AF;'\">\t<!-- OverBar - over bar -->\r\n\t\t\t<xsl:text>\\overline{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"munder\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"under\" select=\"$under\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$over='&#x0FE37;'\">\t<!-- OverBrace - over brace -->\r\n\t\t\t<xsl:text>\\overbrace{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"munder\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"under\" select=\"$under\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$under='&#x00332;'\">\t<!-- UnderBar - combining low line -->\r\n\t\t\t<xsl:text>\\underline{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"mover\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"over\" select=\"$over\"/>\r\n\t\t\t\t<xsl:with-param name=\"pos_over\" select=\"3\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$under='&#x0FE38;'\">\t<!-- UnderBrace - under brace -->\r\n\t\t\t<xsl:text>\\underbrace{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"mover\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"over\" select=\"$over\"/>\r\n\t\t\t\t<xsl:with-param name=\"pos_over\" select=\"3\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($base,'&#x0220F;&#x02210;&#x022c2;&#x022c3;&#x02294;&#x0222B;',\r\n\t\t\t\t\t\t'&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;')='&#x02211;'\">\r\n<!-- if $base is operator, such as\r\n\t\t\t&#x02211;\t/sum L: summation operator\r\n\t\t\t&#x0220F;\t/prod L: product operator\r\n\t\t\t&#x02210;\t/coprod L: coproduct operator\r\n\t\t\t&#x022c2;\t/bigcap\r\n\t\t\t&#x022c3;\t/bigcup\r\n\t\t\t&#x02294;\t/bigsqcup\r\n-->\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>_{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[3]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\underset{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}{\\overset{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[3]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}}</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mover\">\r\n\t<xsl:call-template name=\"mover\">\r\n\t\t<xsl:with-param name=\"base\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[1]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t\t<xsl:with-param name=\"over\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[2]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:munder\">\r\n\t<xsl:call-template name=\"munder\">\r\n\t\t<xsl:with-param name=\"base\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[1]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t\t<xsl:with-param name=\"under\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[2]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mover\">\r\n\t<xsl:param name=\"base\"/>\r\n\t<xsl:param name=\"over\"/>\r\n\t<xsl:param name=\"pos_over\" select=\"2\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$over='&#x000AF;'\">\t<!-- OverBar - over bar -->\r\n\t\t\t<xsl:text>\\overline{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$over='&#x0FE37;'\">\t<!-- OverBrace - over brace -->\r\n\t\t\t<xsl:text>\\overbrace{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($base,'&#x0220F;&#x02210;&#x022c2;&#x022c3;&#x02294;',\r\n\t\t\t\t\t\t'&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;')='&#x02211;'\">\r\n<!-- if $base is operator, such as\r\n\t\t\t&#x02211;\t/sum L: summation operator\r\n\t\t\t&#x0220F;\t/prod L: product operator\r\n\t\t\t&#x02210;\t/coprod L: coproduct operator\r\n\t\t\t&#x022c2;\t/bigcap\r\n\t\t\t&#x022c3;\t/bigcup\r\n\t\t\t&#x02294;\t/bigsqcup\r\n-->\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[$pos_over]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\stackrel{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[$pos_over]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t\t<!--\r\n\t\t\t<xsl:text>\\overset{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[$pos_over]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>-->\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"munder\">\r\n\t<xsl:param name=\"base\"/>\r\n\t<xsl:param name=\"under\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$under='&#x00332;'\">\t<!-- UnderBar - combining low line -->\r\n\t\t\t<xsl:text>\\underline{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$under='&#x0FE38;'\">\t<!-- UnderBrace - under brace -->\r\n\t\t\t<xsl:text>\\underbrace{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($base,'&#x0220F;&#x02210;&#x022c2;&#x022c3;&#x02294;',\r\n\t\t\t\t\t\t'&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;')='&#x02211;'\">\r\n<!-- if $base is operator, such as\r\n\t\t\t&#x02211;\t/sum L: summation operator\r\n\t\t\t&#x0220F;\t/prod L: product operator\r\n\t\t\t&#x02210;\t/coprod L: coproduct operator\r\n\t\t\t&#x022c2;\t/bigcap\r\n\t\t\t&#x022c3;\t/bigcup\r\n\t\t\t&#x02294;\t/bigsqcup\r\n-->\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>_{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\underset{</xsl:text>\t\t<!-- Required AmsMath package -->\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msubsup\">\r\n\t<xsl:text>{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:text>}_{</xsl:text>\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t<xsl:text>}^{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[3]\"/>\r\n\t<xsl:text>}</xsl:text>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msup\">\r\n\t<xsl:text>{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:text>}^{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t<xsl:text>}</xsl:text>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msub\">\r\n\t<xsl:text>{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:text>}_{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t<xsl:text>}</xsl:text>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mmultiscripts\" mode=\"mprescripts\">\r\n\t<xsl:for-each select=\"m:mprescripts/following-sibling::*\">\r\n\t\t<xsl:if test=\"position() mod 2 and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>{}_{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t\t<xsl:if test=\"not(position() mod 2) and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>{}^{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:for-each select=\"m:mprescripts/preceding-sibling::*[position()!=last()]\">\r\n\t\t<xsl:if test=\"position()>2 and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>{}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t\t<xsl:if test=\"position() mod 2 and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>_{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t\t<xsl:if test=\"not(position() mod 2) and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>^{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mmultiscripts\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"m:mprescripts\">\r\n\t\t\t<xsl:apply-templates select=\".\" mode=\"mprescripts\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:for-each select=\"*[position()>1]\">\r\n\t\t\t\t<xsl:if test=\"position()>2 and local-name(.)!='none'\">\r\n\t\t\t\t\t<xsl:text>{}</xsl:text>\t\r\n\t\t\t\t</xsl:if>\r\n\t\t\t\t<xsl:if test=\"position() mod 2 and local-name(.)!='none'\">\r\n\t\t\t\t\t<xsl:text>_{</xsl:text>\t\r\n\t\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t\t\t</xsl:if>\r\n\t\t\t\t<xsl:if test=\"not(position() mod 2) and local-name(.)!='none'\">\r\n\t\t\t\t\t<xsl:text>^{</xsl:text>\t\r\n\t\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t\t\t</xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n<!--xsl:include href=\"tables.xsl\"/-->\r\n<xsl:template match=\"m:mtd[@columnspan]\">\r\n\t<xsl:text>\\multicolumn{</xsl:text>\r\n\t<xsl:value-of select=\"@columnspan\"/>\r\n\t<xsl:text>}{c}{</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:if test=\"count(following-sibling::*)>0\">\r\n\t\t<xsl:text>&amp; </xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n\r\n<xsl:template match=\"m:mtd\">\r\n\t<xsl:if test=\"@columnalign='right' or @columnalign='center'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@columnalign='left' or @columnalign='center'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"count(following-sibling::*)>0\">\r\n<!--    this test valid for Sablotron, another form - test=\"not(position()=last())\".\r\n\tAlso for m:mtd[@columnspan] and m:mtr  -->\r\n\t\t<xsl:text>&amp; </xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mtr\">\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"count(following-sibling::*)>0\">\r\n\t\t<xsl:text>\\\\ </xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mtable\">\r\n\t<xsl:text>\\begin{array}{</xsl:text>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>|</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:variable name=\"numbercols\" select=\"count(./m:mtr[1]/m:mtd[not(@columnspan)])+sum(./m:mtr[1]/m:mtd/@columnspan)\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@columnalign\">\r\n\t\t\t<xsl:variable name=\"colalign\">\r\n\t\t\t\t<xsl:call-template name=\"colalign\">\r\n\t\t\t\t\t<xsl:with-param name=\"colalign\" select=\"@columnalign\"/>\r\n\t\t\t\t</xsl:call-template>\r\n\t\t\t</xsl:variable>\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"string-length($colalign) > $numbercols\">\r\n\t\t\t\t\t<xsl:value-of select=\"substring($colalign,1,$numbercols)\"/>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:when test=\"string-length($colalign) &lt; $numbercols\">\r\n\t\t\t\t\t<xsl:value-of select=\"$colalign\"/>\r\n\t\t\t\t\t<xsl:call-template name=\"generate-string\">\r\n\t\t\t\t\t\t<xsl:with-param name=\"text\" select=\"substring($colalign,string-length($colalign))\"/>\r\n\t\t\t\t\t\t<xsl:with-param name=\"count\" select=\"$numbercols - string-length($colalign)\"/>\r\n\t\t\t\t\t</xsl:call-template>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:otherwise>\r\n\t\t\t\t\t<xsl:value-of select=\"$colalign\"/>\r\n\t\t\t\t</xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:call-template name=\"generate-string\">\r\n\t\t\t\t<xsl:with-param name=\"text\" select=\"'c'\"/>\r\n\t\t\t\t<xsl:with-param name=\"count\" select=\"$numbercols\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>|</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>\\hline </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>\\\\ \\hline</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>\\end{array}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"colalign\">\r\n\t<xsl:param name=\"colalign\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"contains($colalign,' ')\">\r\n\t\t\t<xsl:value-of select=\"substring($colalign,1,1)\"/>\r\n\t\t\t<xsl:call-template name=\"colalign\">\r\n\t\t\t\t<xsl:with-param name=\"colalign\" select=\"substring-after($colalign,' ')\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:value-of select=\"substring($colalign,1,1)\"/>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"generate-string\">\r\n<!-- template from XSLT Standard Library v1.1 -->\r\n    <xsl:param name=\"text\"/>\r\n    <xsl:param name=\"count\"/>\r\n\r\n    <xsl:choose>\r\n      <xsl:when test=\"string-length($text) = 0 or $count &lt;= 0\"/>\r\n\r\n      <xsl:otherwise>\r\n\t<xsl:value-of select=\"$text\"/>\r\n\t<xsl:call-template name=\"generate-string\">\r\n\t  <xsl:with-param name=\"text\" select=\"$text\"/>\r\n\t  <xsl:with-param name=\"count\" select=\"$count - 1\"/>\r\n\t</xsl:call-template>\r\n      </xsl:otherwise>\r\n    </xsl:choose>\r\n</xsl:template>\r\n<!--xsl:include href=\"entities.xsl\"/-->\r\n\r\n<xsl:template name=\"replaceEntities\">\r\n\t<xsl:param name=\"content\"/>\r\n\t<xsl:if test=\"string-length($content)>0\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$content ='sin' or $content ='cos' or $content='tan' or $content ='sec' or $content ='csc' or $content ='cot' or $content ='sinh' or $content ='cosh' or $content ='tanh' or $content ='coth' or $content ='arcsin' or $content ='arccos' or $content ='arctan' or $content ='ln'\"><xsl:text>\\</xsl:text><xsl:value-of select=\"$content\" /></xsl:when><xsl:when test=\"starts-with($content,'&#x0025B;')\"><xsl:value-of select=\"'\\varepsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0025B;')\"/></xsl:call-template></xsl:when>\t<!--/varepsilon -->\r\n\r\n<!-- ====================================================================== -->\r\n<!-- \tUnicode 3.2\r\n\tGreek\r\n\tRange: 0370-03FF\r\n\thttp://www.unicode.org/charts/PDF/U0370.pdf\t                    -->\r\n<!-- ====================================================================== -->\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x00393;')\"><xsl:value-of select=\"'\\Gamma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x00393;')\"/></xsl:call-template></xsl:when>\t<!--/Gamma capital Gamma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x00394;')\"><xsl:value-of select=\"'\\Delta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x00394;')\"/></xsl:call-template></xsl:when>\t<!--/Delta capital Delta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x00398;')\"><xsl:value-of select=\"'\\Theta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x00398;')\"/></xsl:call-template></xsl:when>\t<!--/Theta capital Theta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0039B;')\"><xsl:value-of select=\"'\\Lambda '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0039B;')\"/></xsl:call-template></xsl:when>\t<!--/Lambda capital Lambda, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0039E;')\"><xsl:value-of select=\"'\\Xi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0039E;')\"/></xsl:call-template></xsl:when>\t<!--/Xi capital Xi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A0;')\"><xsl:value-of select=\"'\\Pi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A0;')\"/></xsl:call-template></xsl:when>\t<!--/Pi capital Pi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A3;')\"><xsl:value-of select=\"'\\Sigma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A3;')\"/></xsl:call-template></xsl:when>\t<!--/Sigma capital Sigma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A6;')\"><xsl:value-of select=\"'\\Phi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A6;')\"/></xsl:call-template></xsl:when>\t<!--/Phi capital Phi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A8;')\"><xsl:value-of select=\"'\\Psi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A8;')\"/></xsl:call-template></xsl:when>\t<!--/Psi capital Psi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A9;')\"><xsl:value-of select=\"'\\Omega '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A9;')\"/></xsl:call-template></xsl:when>\t<!--/Omega capital Omega, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B1;')\"><xsl:value-of select=\"'\\alpha '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B1;')\"/></xsl:call-template></xsl:when>\t<!--/alpha small alpha, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B2;')\"><xsl:value-of select=\"'\\beta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B2;')\"/></xsl:call-template></xsl:when>\t<!--/beta small beta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B3;')\"><xsl:value-of select=\"'\\gamma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B3;')\"/></xsl:call-template></xsl:when>\t<!--/gamma small gamma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B4;')\"><xsl:value-of select=\"'\\delta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B4;')\"/></xsl:call-template></xsl:when>\t<!--/delta small delta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B5;')\"><xsl:value-of select=\"'\\epsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B5;')\"/></xsl:call-template></xsl:when>\t<!--/straightepsilon, small epsilon, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B6;')\"><xsl:value-of select=\"'\\zeta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B6;')\"/></xsl:call-template></xsl:when>\t<!--/zeta small zeta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B7;')\"><xsl:value-of select=\"'\\eta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B7;')\"/></xsl:call-template></xsl:when>\t<!--/eta small eta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B8;')\"><xsl:value-of select=\"'\\theta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B8;')\"/></xsl:call-template></xsl:when>\t<!--/theta straight theta, small theta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B9;')\"><xsl:value-of select=\"'\\iota '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B9;')\"/></xsl:call-template></xsl:when>\t<!--/iota small iota, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BA;')\"><xsl:value-of select=\"'\\kappa '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BA;')\"/></xsl:call-template></xsl:when>\t<!--/kappa small kappa, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BB;')\"><xsl:value-of select=\"'\\lambda '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BB;')\"/></xsl:call-template></xsl:when>\t<!--/lambda small lambda, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BC;')\"><xsl:value-of select=\"'\\mu '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BC;')\"/></xsl:call-template></xsl:when>\t<!--/mu small mu, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BD;')\"><xsl:value-of select=\"'\\nu '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BD;')\"/></xsl:call-template></xsl:when>\t<!--/nu small nu, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BE;')\"><xsl:value-of select=\"'\\xi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BE;')\"/></xsl:call-template></xsl:when>\t<!--/xi small xi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C0;')\"><xsl:value-of select=\"'\\pi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C0;')\"/></xsl:call-template></xsl:when>\t<!--/pi small pi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C1;')\"><xsl:value-of select=\"'\\rho '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C1;')\"/></xsl:call-template></xsl:when>\t<!--/rho small rho, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C2;')\"><xsl:value-of select=\"'\\varsigma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C2;')\"/></xsl:call-template></xsl:when>\t<!--/varsigma -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C3;')\"><xsl:value-of select=\"'\\sigma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C3;')\"/></xsl:call-template></xsl:when>\t<!--/sigma small sigma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C4;')\"><xsl:value-of select=\"'\\tau '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C4;')\"/></xsl:call-template></xsl:when>\t<!--/tau small tau, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C5;')\"><xsl:value-of select=\"'\\upsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C5;')\"/></xsl:call-template></xsl:when>\t<!--/upsilon small upsilon, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C6;')\"><xsl:value-of select=\"'\\phi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C6;')\"/></xsl:call-template></xsl:when>\t<!--/straightphi - small phi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C7;')\"><xsl:value-of select=\"'\\chi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C7;')\"/></xsl:call-template></xsl:when>\t<!--/chi small chi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C8;')\"><xsl:value-of select=\"'\\psi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C8;')\"/></xsl:call-template></xsl:when>\t<!--/psi small psi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C9;')\"><xsl:value-of select=\"'\\omega '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C9;')\"/></xsl:call-template></xsl:when>\t<!--/omega small omega, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D1;')\"><xsl:value-of select=\"'\\vartheta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D1;')\"/></xsl:call-template></xsl:when>\t<!--/vartheta - curly or open theta -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D2;')\"><xsl:value-of select=\"'\\Upsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D2;')\"/></xsl:call-template></xsl:when>\t<!--/Upsilon capital Upsilon, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D5;')\"><xsl:value-of select=\"'\\varphi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D5;')\"/></xsl:call-template></xsl:when>\t<!--/varphi - curly or open phi -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D6;')\"><xsl:value-of select=\"'\\varpi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D6;')\"/></xsl:call-template></xsl:when>\t\t<!--/varpi -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003F0;')\"><xsl:value-of select=\"'\\varkappa '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003F0;')\"/></xsl:call-template></xsl:when>\t<!--/varkappa -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003F1;')\"><xsl:value-of select=\"'\\varrho '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003F1;')\"/></xsl:call-template></xsl:when>\t<!--/varrho -->\r\n\t\t\r\n<!-- ====================================================================== -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0200B;')\"><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0200B;')\"/></xsl:call-template></xsl:when>\t\t\t\t\t\t<!--short form of  &InvisibleComma; -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02026;')\"><xsl:value-of select=\"'\\dots '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02026;')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02032;')\"><xsl:value-of select=\"'\\prime '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02032;')\"/></xsl:call-template></xsl:when>\t\t<!--/prime prime or minute -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02061;')\"><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02061;')\"/></xsl:call-template></xsl:when>\t\t\t\t\t\t<!-- ApplyFunction -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02062;')\"><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02062;')\"/></xsl:call-template></xsl:when>\t\t\t\t\t\t<!-- InvisibleTimes -->\r\n<!-- ====================================================================== -->\r\n<!-- \tUnicode 3.2\r\n\tLetterlike Symbols\r\n\tRange: 2100-214F\r\n\thttp://www.unicode.org/charts/PDF/U2100.pdf\t                    -->\r\n<!-- ====================================================================== -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0210F;&#x0FE00;')\"><xsl:value-of select=\"'\\hbar '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0210F;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/hbar - Planck's over 2pi -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0210F;')\"><xsl:value-of select=\"'\\hslash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0210F;')\"/></xsl:call-template></xsl:when>\t<!--/hslash - variant Planck's over 2pi --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02111;')\"><xsl:value-of select=\"'\\Im '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02111;')\"/></xsl:call-template></xsl:when>\t\t<!--/Im - imaginary   -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02113;')\"><xsl:value-of select=\"'\\ell '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02113;')\"/></xsl:call-template></xsl:when>\t\t<!--/ell - cursive small l -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02118;')\"><xsl:value-of select=\"'\\wp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02118;')\"/></xsl:call-template></xsl:when>\t\t<!--/wp - Weierstrass p -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0211C;')\"><xsl:value-of select=\"'\\Re '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0211C;')\"/></xsl:call-template></xsl:when>\t\t<!--/Re - real -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02127;')\"><xsl:value-of select=\"'\\mho '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02127;')\"/></xsl:call-template></xsl:when>\t\t<!--/mho - conductance -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02135;')\"><xsl:value-of select=\"'\\aleph '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02135;')\"/></xsl:call-template></xsl:when>\t\t<!--/aleph aleph, Hebrew -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02136;')\"><xsl:value-of select=\"'\\beth '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02136;')\"/></xsl:call-template></xsl:when>\t\t<!--/beth - beth, Hebrew --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02137;')\"><xsl:value-of select=\"'\\gimel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02137;')\"/></xsl:call-template></xsl:when>\t\t<!--/gimel - gimel, Hebrew --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02138;')\"><xsl:value-of select=\"'\\daleth '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02138;')\"/></xsl:call-template></xsl:when>\t<!--/daleth - daleth, Hebrew --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02145;')\"><xsl:value-of select=\"'D'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02145;')\"/></xsl:call-template></xsl:when>\t\t<!--D for use in differentials, e.g., within integrals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02146;')\"><xsl:value-of select=\"'d'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02146;')\"/></xsl:call-template></xsl:when>\t\t<!--d for use in differentials, e.g., within integrals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02147;')\"><xsl:value-of select=\"'e'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02147;')\"/></xsl:call-template></xsl:when>\t\t<!--e use for the exponential base of the natural logarithms -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02148;')\"><xsl:value-of select=\"'i'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02148;')\"/></xsl:call-template></xsl:when>\t\t<!--i for use as a square root of -1 -->\r\n\r\n<!-- ====================================================================== -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02192;')\"><xsl:value-of select=\"'\\to '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02192;')\"/></xsl:call-template></xsl:when>\t\t<!--/rightarrow /to A: =rightward arrow -->\r\n\t\t\r\n<!-- ====================================================================== -->\r\n<!-- \tUnicode 3.2\r\n\tMathematical Operators\r\n\tRange: 2200-22FF\r\n\thttp://www.unicode.org/charts/PDF/U2200.pdf                         -->\r\n<!-- ====================================================================== -->\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02200;')\"><xsl:value-of select=\"'\\forall '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02200;')\"/></xsl:call-template></xsl:when>\t<!--/forall for all -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02201;')\"><xsl:value-of select=\"'\\complement '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02201;')\"/></xsl:call-template></xsl:when>\t<!--/complement - complement sign --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02202;')\"><xsl:value-of select=\"'\\partial '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02202;')\"/></xsl:call-template></xsl:when>\t<!--/partial partial differential -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02203;')\"><xsl:value-of select=\"'\\exists '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02203;')\"/></xsl:call-template></xsl:when>\t<!--/exists at least one exists -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02204;')\"><xsl:value-of select=\"'\\nexists '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02204;')\"/></xsl:call-template></xsl:when>\t<!--/nexists - negated exists --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02205;&#x0FE00;')\"><xsl:value-of select=\"'\\emptyset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02205;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/emptyset - zero, slash -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02205;')\"><xsl:value-of select=\"'\\varnothing '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02205;')\"/></xsl:call-template></xsl:when>\t<!--/varnothing - circle, slash --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02206;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02206;')\"/></xsl:call-template></xsl:when>-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02207;')\"><xsl:value-of select=\"'\\nabla '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02207;')\"/></xsl:call-template></xsl:when>\t\t<!--/nabla del, Hamilton operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02208;')\"><xsl:value-of select=\"'\\in '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02208;')\"/></xsl:call-template></xsl:when>\t\t<!--/in R: set membership  -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02209;')\"><xsl:value-of select=\"'\\notin '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02209;')\"/></xsl:call-template></xsl:when>\t\t<!--/notin N: negated set membership -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0220B;')\"><xsl:value-of select=\"'\\ni '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0220B;')\"/></xsl:call-template></xsl:when>\t\t<!--/ni /owns R: contains -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0220C;')\"><xsl:value-of select=\"'\\not\\ni '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0220C;')\"/></xsl:call-template></xsl:when>\t<!--negated contains -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0220F;')\"><xsl:value-of select=\"'\\prod '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0220F;')\"/></xsl:call-template></xsl:when>\t\t<!--/prod L: product operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02210;')\"><xsl:value-of select=\"'\\coprod '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02210;')\"/></xsl:call-template></xsl:when>\t<!--/coprod L: coproduct operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02211;')\"><xsl:value-of select=\"'\\sum '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02211;')\"/></xsl:call-template></xsl:when>\t\t<!--/sum L: summation operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02212;')\"><xsl:value-of select=\"'-'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02212;')\"/></xsl:call-template></xsl:when>\t\t<!--B: minus sign -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02213;')\"><xsl:value-of select=\"'\\mp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02213;')\"/></xsl:call-template></xsl:when>\t\t<!--/mp B: minus-or-plus sign -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02214;')\"><xsl:value-of select=\"'\\dotplus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02214;')\"/></xsl:call-template></xsl:when>\t<!--/dotplus B: plus sign, dot above --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02215;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02215;')\"/></xsl:call-template></xsl:when>-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02216;')\"><xsl:value-of select=\"'\\setminus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02216;')\"/></xsl:call-template></xsl:when>\t<!--/setminus B: reverse solidus -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02217;')\"><xsl:value-of select=\"'\\ast '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02217;')\"/></xsl:call-template></xsl:when>\t\t<!--low asterisk -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02218;')\"><xsl:value-of select=\"'\\circ '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02218;')\"/></xsl:call-template></xsl:when>\t\t<!--/circ B: composite function (small circle) -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02219;')\"><xsl:value-of select=\"'\\bullet '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02219;')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0221A;')\"><xsl:value-of select=\"'\\surd '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221A;')\"/></xsl:call-template></xsl:when>\t\t<!--/surd radical -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0221D;')\"><xsl:value-of select=\"'\\propto '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221D;')\"/></xsl:call-template></xsl:when>\t<!--/propto R: is proportional to -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0221E;')\"><xsl:value-of select=\"'\\infty '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221E;')\"/></xsl:call-template></xsl:when>\t\t<!--/infty infinity -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0221F;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221F;')\"/></xsl:call-template></xsl:when>\t\tright (90 degree) angle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02220;')\"><xsl:value-of select=\"'\\angle '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02220;')\"/></xsl:call-template></xsl:when>\t\t<!--/angle - angle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02221;')\"><xsl:value-of select=\"'\\measuredangle '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02221;')\"/></xsl:call-template></xsl:when>\t<!--/measuredangle - angle-measured -->\t<!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02222;')\"><xsl:value-of select=\"'\\sphericalangle '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02222;')\"/></xsl:call-template></xsl:when><!--/sphericalangle angle-spherical -->\t<!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02223;')\"><xsl:value-of select=\"'\\mid '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02223;')\"/></xsl:call-template></xsl:when>\t\t<!--/mid R: -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02224;&#x0FE00;')\"><xsl:value-of select=\"'\\nshortmid '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02224;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/nshortmid --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02224;')\"><xsl:value-of select=\"'\\nmid '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02224;')\"/></xsl:call-template></xsl:when>\t\t<!--/nmid --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02225;')\"><xsl:value-of select=\"'\\parallel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02225;')\"/></xsl:call-template></xsl:when>\t<!--/parallel R: parallel -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02226;&#x0FE00;')\"><xsl:value-of select=\"'\\nshortparallel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02226;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/nshortparallel N: not short par --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02226;')\"><xsl:value-of select=\"'\\nparallel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02226;')\"/></xsl:call-template></xsl:when>\t<!--/nparallel N: not parallel --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02227;')\"><xsl:value-of select=\"'\\wedge '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02227;')\"/></xsl:call-template></xsl:when>\t\t<!--/wedge /land B: logical and -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02228;')\"><xsl:value-of select=\"'\\vee '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02228;')\"/></xsl:call-template></xsl:when>\t\t<!--/vee /lor B: logical or -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02229;')\"><xsl:value-of select=\"'\\cap '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02229;')\"/></xsl:call-template></xsl:when>\t\t<!--/cap B: intersection -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222A;')\"><xsl:value-of select=\"'\\cup '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222A;')\"/></xsl:call-template></xsl:when>\t\t<!--/cup B: union or logical sum -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222B;')\"><xsl:value-of select=\"'\\int '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222B;')\"/></xsl:call-template></xsl:when>\t\t<!--/int L: integral operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222C;')\"><xsl:value-of select=\"'\\iint '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222C;')\"/></xsl:call-template></xsl:when>\t\t<!--double integral operator --> <!-- Required amsmath -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222D;')\"><xsl:value-of select=\"'\\iiint '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222D;')\"/></xsl:call-template></xsl:when>\t\t<!--/iiint triple integral operator -->\t<!-- Required amsmath -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222E;')\"><xsl:value-of select=\"'\\oint '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222E;')\"/></xsl:call-template></xsl:when>\t\t<!--/oint L: contour integral operator -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0222F;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222F;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02230;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02230;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02231;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02231;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02232;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02232;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02233;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02233;')\"/></xsl:call-template></xsl:when>-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02234;')\"><xsl:value-of select=\"'\\therefore '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02234;')\"/></xsl:call-template></xsl:when>\t<!--/therefore R: therefore --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02235;')\"><xsl:value-of select=\"'\\because '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02235;')\"/></xsl:call-template></xsl:when>\t<!--/because R: because --> <!-- Required amssymb -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02236;')\"><xsl:value-of select=\"':'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02236;')\"/></xsl:call-template></xsl:when>\t\t<!--/ratio -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02237;')\"><xsl:value-of select=\"'\\colon\\colon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02237;')\"/></xsl:call-template></xsl:when>\t<!--/Colon, two colons -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02238;')\"><xsl:value-of select=\"'\\dot{-}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02238;')\"/></xsl:call-template></xsl:when>\t\t<!--/dotminus B: minus sign, dot above -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02239;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02239;')\"/></xsl:call-template></xsl:when>\t\t-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223A;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223A;')\"/></xsl:call-template></xsl:when>\t\tminus with four dots, geometric properties -->\t\t\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223B;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223B;')\"/></xsl:call-template></xsl:when>\t\thomothetic -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0223C;')\"><xsl:value-of select=\"'\\sim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223C;')\"/></xsl:call-template></xsl:when>\t\t<!--/sim R: similar -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0223D;')\"><xsl:value-of select=\"'\\backsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223D;')\"/></xsl:call-template></xsl:when>\t<!--/backsim R: reverse similar --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223E;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223E;')\"/></xsl:call-template></xsl:when>\t\tmost positive -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223F;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223F;')\"/></xsl:call-template></xsl:when>\t\tac current -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02240;')\"><xsl:value-of select=\"'\\wr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02240;')\"/></xsl:call-template></xsl:when>\t\t<!--/wr B: wreath product -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02241;')\"><xsl:value-of select=\"'\\nsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02241;')\"/></xsl:call-template></xsl:when>\t\t<!--/nsim N: not similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02242;')\"><xsl:value-of select=\"'\\eqsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02242;')\"/></xsl:call-template></xsl:when>\t\t<!--/esim R: equals, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02243;')\"><xsl:value-of select=\"'\\simeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02243;')\"/></xsl:call-template></xsl:when>\t\t<!--/simeq R: similar, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02244;')\"><xsl:value-of select=\"'\\not\\simeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02244;')\"/></xsl:call-template></xsl:when>\t<!--/nsimeq N: not similar, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02245;')\"><xsl:value-of select=\"'\\cong '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02245;')\"/></xsl:call-template></xsl:when>\t\t<!--/cong R: congruent with -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02246;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02246;')\"/></xsl:call-template></xsl:when>\t\tsimilar, not equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02247;')\"><xsl:value-of select=\"'\\ncong '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02247;')\"/></xsl:call-template></xsl:when>\t\t<!--/ncong N: not congruent with --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02248;')\"><xsl:value-of select=\"'\\approx '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02248;')\"/></xsl:call-template></xsl:when>\t<!--/approx R: approximate -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02249;&#x00338;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02249;&#x00338;')\"/></xsl:call-template></xsl:when>\tnot, vert, approximate -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02249;')\"><xsl:value-of select=\"'\\not\\approx '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02249;')\"/></xsl:call-template></xsl:when>\t<!--/napprox N: not approximate -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224A;')\"><xsl:value-of select=\"'\\approxeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224A;')\"/></xsl:call-template></xsl:when>\t<!--/approxeq R: approximate, equals --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0224B;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224B;')\"/></xsl:call-template></xsl:when>\t\tapproximately identical to -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0224C;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224C;')\"/></xsl:call-template></xsl:when>\t\t/backcong R: reverse congruent -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224D;')\"><xsl:value-of select=\"'\\asymp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224D;')\"/></xsl:call-template></xsl:when>\t\t<!--/asymp R: asymptotically equal to -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224E;')\"><xsl:value-of select=\"'\\Bumpeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224E;')\"/></xsl:call-template></xsl:when>\t<!--/Bumpeq R: bumpy equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224F;')\"><xsl:value-of select=\"'\\bumpeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224F;')\"/></xsl:call-template></xsl:when>\t<!--/bumpeq R: bumpy equals, equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02250;')\"><xsl:value-of select=\"'\\doteq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02250;')\"/></xsl:call-template></xsl:when>\t\t<!--/doteq R: equals, single dot above -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02251;')\"><xsl:value-of select=\"'\\doteqdot '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02251;')\"/></xsl:call-template></xsl:when>\t<!--/doteqdot /Doteq R: eq, even dots --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02252;')\"><xsl:value-of select=\"'\\fallingdotseq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02252;')\"/></xsl:call-template></xsl:when>\t<!--/fallingdotseq R: eq, falling dots --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02253;')\"><xsl:value-of select=\"'\\risingdotseq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02253;')\"/></xsl:call-template></xsl:when>\t<!--/risingdotseq R: eq, rising dots --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02254;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02254;')\"/></xsl:call-template></xsl:when>\t\t/coloneq R: colon, equals -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02255;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02255;')\"/></xsl:call-template></xsl:when>\t\t/eqcolon R: equals, colon -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02256;')\"><xsl:value-of select=\"'\\eqcirc '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02256;')\"/></xsl:call-template></xsl:when>\t<!--/eqcirc R: circle on equals sign --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02257;')\"><xsl:value-of select=\"'\\circeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02257;')\"/></xsl:call-template></xsl:when>\t<!--/circeq R: circle, equals --> <!-- Required amssymb -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02258;')\"><xsl:value-of select=\"'\\stackrel{\\frown}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02258;')\"/></xsl:call-template></xsl:when>\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02259;')\"><xsl:value-of select=\"'\\stackrel{\\wedge}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02259;')\"/></xsl:call-template></xsl:when>\t<!--/wedgeq R: corresponds to (wedge, equals) -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225A;')\"><xsl:value-of select=\"'\\stackrel{\\vee}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225A;')\"/></xsl:call-template></xsl:when>\t<!--logical or, equals -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225B;')\"><xsl:value-of select=\"'\\stackrel{\\star}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225B;')\"/></xsl:call-template></xsl:when>\t<!--equal, asterisk above -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0225C;')\"><xsl:value-of select=\"'\\triangleq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225C;')\"/></xsl:call-template></xsl:when>\t<!--/triangleq R: triangle, equals --> <!-- Required amssymb -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225D;')\"><xsl:value-of select=\"'\\stackrel{\\scriptscriptstyle\\mathrm{def}}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225D;')\"/></xsl:call-template></xsl:when>\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225E;')\"><xsl:value-of select=\"'\\stackrel{\\scriptscriptstyle\\mathrm{m}}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225E;')\"/></xsl:call-template></xsl:when>\t\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225F;')\"><xsl:value-of select=\"'\\stackrel{?}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225F;')\"/></xsl:call-template></xsl:when>\t<!--/questeq R: equal with questionmark -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02260;&#x0FE00;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02260;&#x0FE00;')\"/></xsl:call-template></xsl:when>\tnot equal, dot -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02260;')\"><xsl:value-of select=\"'\\ne '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02260;')\"/></xsl:call-template></xsl:when>\t\t<!--/ne /neq R: not equal -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02261;&#x020E5;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02261;&#x020E5;')\"/></xsl:call-template></xsl:when>\treverse not equivalent -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02261;')\"><xsl:value-of select=\"'\\equiv '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02261;')\"/></xsl:call-template></xsl:when>\t\t<!--/equiv R: identical with -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02262;')\"><xsl:value-of select=\"'\\not\\equiv '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02262;')\"/></xsl:call-template></xsl:when>\t<!--/nequiv N: not identical with -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02263;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02263;')\"/></xsl:call-template></xsl:when>\t\t-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02264;')\"><xsl:value-of select=\"'\\le '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02264;')\"/></xsl:call-template></xsl:when>\t\t<!--/leq /le R: less-than-or-equal -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02265;')\"><xsl:value-of select=\"'\\ge '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02265;')\"/></xsl:call-template></xsl:when>\t\t<!--/geq /ge R: greater-than-or-equal -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02266;')\"><xsl:value-of select=\"'\\leqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02266;')\"/></xsl:call-template></xsl:when>\t\t<!--/leqq R: less, double equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02267;')\"><xsl:value-of select=\"'\\geqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02267;')\"/></xsl:call-template></xsl:when>\t\t<!--/geqq R: greater, double equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02268;')\"><xsl:value-of select=\"'\\lneqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02268;')\"/></xsl:call-template></xsl:when>\t\t<!--/lneqq N: less, not double equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02269;')\"><xsl:value-of select=\"'\\gneqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02269;')\"/></xsl:call-template></xsl:when>\t\t<!--/gneqq N: greater, not dbl equals --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226A;&#x00338;&#x0FE00;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226A;&#x00338;&#x0FE00;')\"/></xsl:call-template></xsl:when>\tnot much less than, variant -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226A;&#x00338;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226A;&#x00338;')\"/></xsl:call-template></xsl:when>\tnot, vert, much less than -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226A;')\"><xsl:value-of select=\"'\\ll '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226A;')\"/></xsl:call-template></xsl:when>\t\t<!--/ll R: double less-than sign -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226B;&#x00338;&#x0FE00;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226B;&#x00338;&#x0FE00;')\"/></xsl:call-template></xsl:when>\tnot much greater than, variant -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226B;&#x00338;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226B;&#x00338;')\"/></xsl:call-template></xsl:when>\tnot, vert, much greater than -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226B;')\"><xsl:value-of select=\"'\\gg '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226B;')\"/></xsl:call-template></xsl:when>\t\t<!--/gg R: dbl greater-than sign -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226C;')\"><xsl:value-of select=\"'\\between '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226C;')\"/></xsl:call-template></xsl:when>\t<!--/between R: between --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226D;')\"><xsl:value-of select=\"'\\not\\asymp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226D;')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226E;')\"><xsl:value-of select=\"'\\nless '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226E;')\"/></xsl:call-template></xsl:when>\t\t<!--/nless N: not less-than --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226F;')\"><xsl:value-of select=\"'\\ngtr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226F;')\"/></xsl:call-template></xsl:when>\t\t<!--/ngtr N: not greater-than --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02270;&#x020E5;')\"><xsl:value-of select=\"'\\nleq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02270;&#x020E5;')\"/></xsl:call-template></xsl:when>\t<!--/nleq N: not less-than-or-equal --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02270;')\"><xsl:value-of select=\"'\\nleqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02270;')\"/></xsl:call-template></xsl:when>\t\t<!--/nleqq N: not less, dbl equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02271;&#x020E5;')\"><xsl:value-of select=\"'\\ngeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02271;&#x020E5;')\"/></xsl:call-template></xsl:when>\t<!--/ngeq N: not greater-than-or-equal --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02271;')\"><xsl:value-of select=\"'\\ngeqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02271;')\"/></xsl:call-template></xsl:when>\t\t<!--/ngeqq N: not greater, dbl equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02272;')\"><xsl:value-of select=\"'\\lesssim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02272;')\"/></xsl:call-template></xsl:when>\t<!--/lesssim R: less, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02273;')\"><xsl:value-of select=\"'\\gtrsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02273;')\"/></xsl:call-template></xsl:when>\t<!--/gtrsim R: greater, similar --> <!-- Required amssymb -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02274;')\"><xsl:value-of select=\"'\\not\\lesssim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02274;')\"/></xsl:call-template></xsl:when>\t<!--not less, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02275;')\"><xsl:value-of select=\"'\\not\\gtrsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02275;')\"/></xsl:call-template></xsl:when>\t<!--not greater, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02276;')\"><xsl:value-of select=\"'\\lessgtr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02276;')\"/></xsl:call-template></xsl:when>\t<!--/lessgtr R: less, greater --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02277;')\"><xsl:value-of select=\"'\\gtrless '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02277;')\"/></xsl:call-template></xsl:when>\t<!--/gtrless R: greater, less --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02278;')\"><xsl:value-of select=\"'\\not\\lessgtr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02278;')\"/></xsl:call-template></xsl:when>\t<!--not less, greater --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02279;')\"><xsl:value-of select=\"'\\not\\gtrless '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02279;')\"/></xsl:call-template></xsl:when>\t<!--not greater, less --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227A;')\"><xsl:value-of select=\"'\\prec '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227A;')\"/></xsl:call-template></xsl:when>\t\t<!--/prec R: precedes -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227B;')\"><xsl:value-of select=\"'\\succ '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227B;')\"/></xsl:call-template></xsl:when>\t\t<!--/succ R: succeeds -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227C;')\"><xsl:value-of select=\"'\\preccurlyeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227C;')\"/></xsl:call-template></xsl:when>\t<!--/preccurlyeq R: precedes, curly eq --> <!-- Required amssymb -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227D;')\"><xsl:value-of select=\"'\\succcurlyeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227D;')\"/></xsl:call-template></xsl:when>\t<!--/succcurlyeq R: succeeds, curly eq --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227E;')\"><xsl:value-of select=\"'\\precsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227E;')\"/></xsl:call-template></xsl:when>\t<!--/precsim R: precedes, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227F;')\"><xsl:value-of select=\"'\\succsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227F;')\"/></xsl:call-template></xsl:when>\t<!--/succsim R: succeeds, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02280;')\"><xsl:value-of select=\"'\\nprec '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02280;')\"/></xsl:call-template></xsl:when>\t\t<!--/nprec N: not precedes --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02281;')\"><xsl:value-of select=\"'\\nsucc '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02281;')\"/></xsl:call-template></xsl:when>\t\t<!--/nsucc N: not succeeds --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02282;')\"><xsl:value-of select=\"'\\subset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02282;')\"/></xsl:call-template></xsl:when>\t<!--/subset R: subset or is implied by -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02283;')\"><xsl:value-of select=\"'\\supset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02283;')\"/></xsl:call-template></xsl:when>\t<!--/supset R: superset or implies -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02284;')\"><xsl:value-of select=\"'\\not\\subset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02284;')\"/></xsl:call-template></xsl:when>\t<!--not subset -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02285;')\"><xsl:value-of select=\"'\\not\\supset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02285;')\"/></xsl:call-template></xsl:when>\t<!--not superset -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02286;')\"><xsl:value-of select=\"'\\subseteq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02286;')\"/></xsl:call-template></xsl:when>\t<!--/subseteq R: subset, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02287;')\"><xsl:value-of select=\"'\\supseteq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02287;')\"/></xsl:call-template></xsl:when>\t<!--/supseteq R: superset, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0228E;')\"><xsl:value-of select=\"'\\uplus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0228E;')\"/></xsl:call-template></xsl:when>\t\t<!--/uplus B: plus sign in union -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02293;')\"><xsl:value-of select=\"'\\sqcap '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02293;')\"/></xsl:call-template></xsl:when>\t\t<!--/sqcap B: square intersection -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02294;')\"><xsl:value-of select=\"'\\bigsqcup '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02294;')\"/></xsl:call-template></xsl:when>\t\t<!--/sqcup B: square union -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02295;')\"><xsl:value-of select=\"'\\oplus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02295;')\"/></xsl:call-template></xsl:when>\t\t<!--/oplus B: plus sign in circle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02296;')\"><xsl:value-of select=\"'\\ominus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02296;')\"/></xsl:call-template></xsl:when>\t<!--/ominus B: minus sign in circle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02297;')\"><xsl:value-of select=\"'\\otimes '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02297;')\"/></xsl:call-template></xsl:when>\t<!--/otimes B: multiply sign in circle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02298;')\"><xsl:value-of select=\"'\\oslash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02298;')\"/></xsl:call-template></xsl:when>\t<!--/oslash B: solidus in circle -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02299;')\"><xsl:value-of select=\"'\\odot '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02299;')\"/></xsl:call-template></xsl:when>\t\t<!--/odot B: middle dot in circle --> <!--/bigodot L: circle dot operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0229F;')\"><xsl:value-of select=\"'\\boxminus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0229F;')\"/></xsl:call-template></xsl:when>\t<!--/boxminus B: minus sign in box --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A4;')\"><xsl:value-of select=\"'\\top '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A4;')\"/></xsl:call-template></xsl:when>\t\t<!--/top top -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A5;')\"><xsl:value-of select=\"'\\perp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A5;')\"/></xsl:call-template></xsl:when>\t\t<!--/perp R: perpendicular --><!--/bot bottom -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A6;')\"><xsl:value-of select=\"'\\vdash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A6;')\"/></xsl:call-template></xsl:when>\t\t<!--/vdash R: vertical, dash -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A7;')\"><xsl:value-of select=\"'\\vDash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A7;')\"/></xsl:call-template></xsl:when>\t\t<!--/vDash R: vertical, dbl dash --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A8;')\"><xsl:value-of select=\"'\\models '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A8;')\"/></xsl:call-template></xsl:when>\t<!--/models R: -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022AA;')\"><xsl:value-of select=\"'\\Vvdash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022AA;')\"/></xsl:call-template></xsl:when>\t<!--/Vvdash R: triple vertical, dash --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C0;')\"><xsl:value-of select=\"'\\bigwedge '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C0;')\"/></xsl:call-template></xsl:when>\t<!--/bigwedge L: logical or operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C1;')\"><xsl:value-of select=\"'\\bigvee '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C1;')\"/></xsl:call-template></xsl:when>\t<!--/bigcap L: intersection operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C2;')\"><xsl:value-of select=\"'\\bigcap '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C2;')\"/></xsl:call-template></xsl:when>\t<!--/bigvee L: logical and operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C3;')\"><xsl:value-of select=\"'\\bigcup '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C3;')\"/></xsl:call-template></xsl:when>\t<!--/bigcup L: union operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C4;')\"><xsl:value-of select=\"'\\diamond '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C4;')\"/></xsl:call-template></xsl:when>\t<!--/diamond B: open diamond -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C5;')\"><xsl:value-of select=\"'\\cdot '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C5;')\"/></xsl:call-template></xsl:when>\t\t<!--/cdot B: small middle dot -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C6;')\"><xsl:value-of select=\"'\\star '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C6;')\"/></xsl:call-template></xsl:when>\t\t<!--/star B: small star, filled -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C7;')\"><xsl:value-of select=\"'\\divideontimes '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C7;')\"/></xsl:call-template></xsl:when>\t<!--/divideontimes B: division on times --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C8;')\"><xsl:value-of select=\"'\\bowtie '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C8;')\"/></xsl:call-template></xsl:when>\t<!--/bowtie R: -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022CD;')\"><xsl:value-of select=\"'\\backsimeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022CD;')\"/></xsl:call-template></xsl:when>\t<!--/backsimeq R: reverse similar, eq --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022EF;')\"><xsl:value-of select=\"'\\cdots '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022EF;')\"/></xsl:call-template></xsl:when>\t\t<!--/cdots, three dots, centered -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x022F0;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022F0;')\"/></xsl:call-template></xsl:when>\t\tthree dots, ascending -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022F1;')\"><xsl:value-of select=\"'\\ddots '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022F1;')\"/></xsl:call-template></xsl:when>\t\t<!--/ddots, three dots, descending -->\r\n\r\n<!-- ====================================================================== -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x025A1;')\"><xsl:value-of select=\"'\\Box '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x025A1;')\"/></xsl:call-template></xsl:when>\t<!--/square, square --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x025AA;')\"><xsl:value-of select=\"'\\blacksquare '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x025AA;')\"/></xsl:call-template></xsl:when>\t<!--/blacksquare, square, filled  --> <!-- Required amssymb -->\r\n\t\t\r\n\t\t<xsl:when test='starts-with($content,\"&apos;\")'><xsl:value-of select='\"\\text{&apos;}\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select='substring-after($content, \"&apos;\")'/></xsl:call-template></xsl:when><!-- \\text required amslatex -->\r\n\t\t<xsl:when test='starts-with($content,\"(\")'><xsl:value-of select='\"\\left(\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '(')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\")\")'><xsl:value-of select='\"\\right)\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, ')')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"[\")'><xsl:value-of select='\"\\left[\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '[')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"]\")'><xsl:value-of select='\"\\right]\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, ']')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"{\")'><xsl:value-of select='\"\\left\\{\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '{')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"}\")'><xsl:value-of select='\"\\right\\}\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '}')\"/></xsl:call-template></xsl:when>\r\n\t\t\r\n\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:value-of select=\"substring($content,1,1)\"/>\r\n\t\t\t<xsl:call-template name=\"replaceEntities\">\r\n\t\t\t\t<xsl:with-param name=\"content\" select=\"substring($content, 2)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose></xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"replaceMtextEntities\">\r\n\t<xsl:param name=\"content\"/>\r\n\t<xsl:choose>\r\n\t<xsl:when test=\"contains($content,'&#x02009;&#x0200A;&#x0200A;')\">\t<!-- ThickSpace - space of width 5/18 em -->\r\n\t\t<xsl:call-template name=\"replaceMtextEntities\">\r\n\t\t\t<xsl:with-param name=\"content\" select=\"concat(substring-before($content,'&#x02009;&#x0200A;&#x0200A;'),'\\hspace{0.28em}',substring-after($content,'&#x02009;&#x0200A;&#x0200A;'))\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:when>\r\n\t<xsl:when test=\"contains($content,'&#x02009;')\">\t<!-- ThinSpace - space of width 3/18 em -->\r\n\t\t<xsl:call-template name=\"replaceMtextEntities\">\r\n\t\t\t<xsl:with-param name=\"content\" select=\"concat(substring-before($content,'&#x02009;'),'\\hspace{0.17em}',substring-after($content,'&#x02009;'))\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:when>\r\n\t<xsl:otherwise>\r\n\t\t<xsl:value-of select=\"normalize-space($content)\"/>\r\n\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<!--xsl:include href=\"cmarkup.xsl\"/-->\r\n<!-- 4.4.1.1 cn -->\r\n<xsl:template match=\"m:cn\"><xsl:apply-templates/></xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='complex-cartesian']\">\r\n\t<xsl:apply-templates select=\"text()[1]\"/>\r\n  \t<xsl:text>+</xsl:text>\r\n\t<xsl:apply-templates select=\"text()[2]\"/>\r\n\t<xsl:text>i</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='rational']\">\r\n\t<xsl:apply-templates select=\"text()[1]\"/>\r\n\t<xsl:text>/</xsl:text>\r\n\t<xsl:apply-templates select=\"text()[2]\"/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='integer' and @base!=10]\">\r\n\t\t<xsl:apply-templates/>\r\n\t\t<xsl:text>_{</xsl:text><xsl:value-of select=\"@base\"/><xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='complex-polar']\">\r\n\t<xsl:apply-templates select=\"text()[1]\"/>\r\n\t<xsl:text>e^{i </xsl:text>\r\n\t<xsl:apply-templates select=\"text()[2]\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='e-notation']\">\r\n    <xsl:apply-templates select=\"text()[1]\"/>\r\n    <xsl:text>E</xsl:text>\r\n    <xsl:apply-templates select=\"text()[2]\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.1.1 ci 4.4.1.2 csymbol -->\r\n<xsl:template match=\"m:ci | m:csymbol\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"string-length(normalize-space(text()))>1\">\r\n\t\t\t<xsl:text>\\mathrm{</xsl:text><xsl:apply-templates/><xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:apply-templates/></xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.1 apply 4.4.2.2 reln -->\r\n<xsl:template match=\"m:apply | m:reln\">\r\n\t<xsl:apply-templates select=\"*[1]\">\r\n\t<!-- <? -->\r\n\t\t<xsl:with-param name=\"p\" select=\"10\"/>\r\n\t</xsl:apply-templates>\r\n\t<!-- ?> -->\r\n \t<xsl:text>(</xsl:text>\r\n\t<xsl:for-each select=\"*[position()>1]\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"not(position()=last())\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n \t<xsl:text>)</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.3 fn -->\r\n<xsl:template match=\"m:fn[m:apply[1]]\"> <!-- for m:fn using default rule -->\r\n\t<xsl:text>(</xsl:text><xsl:apply-templates/><xsl:text>)</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.4 interval -->\r\n<xsl:template match=\"m:interval[*[2]]\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@closure='open' or @closure='open-closed'\">\r\n\t\t\t<xsl:text>\\left(</xsl:text>\t\t\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\left[</xsl:text></xsl:otherwise> \r\n\t</xsl:choose>\r\n\t<xsl:apply-templates select=\"*[1]\"/>\r\n\t<xsl:text> , </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@closure='open' or @closure='closed-open'\">\r\n\t\t\t<xsl:text>\\right)</xsl:text>\t\t\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\right]</xsl:text></xsl:otherwise> \r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:interval\">\r\n\t<xsl:text>\\left\\{</xsl:text><xsl:apply-templates/><xsl:text>\\right\\}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.5 inverse -->\r\n<xsl:template match=\"m:apply[*[1][self::m:inverse]]\">\r\n\t<xsl:apply-templates select=\"*[2]\"/><xsl:text>^{(-1)}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.6 sep 4.4.2.7 condition -->\r\n<xsl:template match=\"m:sep | m:condition\"><xsl:apply-templates/></xsl:template>\r\n\r\n<!-- 4.4.2.9 lambda -->\r\n<xsl:template match=\"m:lambda\">\r\n\t<xsl:text>\\mathrm{lambda}\\: </xsl:text>\r\n  \t<xsl:apply-templates select=\"m:bvar/*\"/>\r\n  \t<xsl:text>.\\: </xsl:text>\r\n  <xsl:apply-templates select=\"*[last()]\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.10 compose -->\r\n<xsl:template match=\"m:apply[*[1][self::m:compose]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\circ </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.11 ident -->\r\n<xsl:template match=\"m:ident\"><xsl:text>\\mathrm{id}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.2.12 domain 4.4.2.13 codomain 4.4.2.14 image 4.4.3.21 arg 4.4.3.24 lcm\r\n\t\t4.4.5.9 grad 4.4.5.10 curl 4.4.9.4 median 4.4.9.5 mode-->\r\n<xsl:template match=\"m:domain | m:codomain | m:image | m:arg | m:lcm | m:grad |\r\n\t\t\t\t\t\t\t\t m:curl | m:median | m:mode\">\r\n\t<xsl:text>\\mathop{\\mathrm{</xsl:text>\r\n\t<xsl:value-of select=\"local-name()\"/>\r\n\t<xsl:text>}}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.15 domainofapplication -->\r\n<xsl:template match=\"m:domainofapplication\"/>\r\n\r\n<!-- 4.4.2.16 piecewise -->\r\n<xsl:template match=\"m:piecewise\">\r\n\t<xsl:text>\\begin{cases}</xsl:text>\r\n\t<xsl:apply-templates select=\"m:piece\"/>\r\n\t<xsl:apply-templates select=\"m:otherwise\"/>\r\n\t<xsl:text>\\end{cases}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:piece\">\r\n\t\t<xsl:apply-templates select=\"*[1]\"/>\r\n\t\t<xsl:text> &amp; \\text{if $</xsl:text>\r\n\t\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t\t<xsl:text>$}</xsl:text>\r\n\t\t<xsl:if test=\"not(position()=last()) or ../m:otherwise\"><xsl:text>\\\\ </xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:otherwise\">\r\n\t<xsl:apply-templates select=\"*[1]\"/>\r\n\t<xsl:text> &amp; \\text{otherwise}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.1 quotient -->\r\n<xsl:template match=\"m:apply[*[1][self::m:quotient]]\">\r\n\t<xsl:text>\\left\\lfloor\\frac{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>}{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\"/>\r\n\t<xsl:text>}\\right\\rfloor </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.2 factorial -->\r\n<xsl:template match=\"m:apply[*[1][self::m:factorial]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>!</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.3 divide -->\r\n<xsl:template match=\"m:apply[*[1][self::m:divide]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"this-p\" select=\"3\"/>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>\\left(</xsl:text></xsl:if>\r\n  <xsl:text>\\frac{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n<!--\t\t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>-->\r\n\t<xsl:text>}{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\"/>\r\n<!--    \t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>-->\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:if test=\"$this-p &lt; $p\"><xsl:text>\\right)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.4 max min -->\r\n<xsl:template match=\"m:apply[*[1][self::m:max or self::m:min]]\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text>\\{</xsl:text>\r\n   <xsl:choose>\r\n\t\t<xsl:when test=\"m:condition\">\r\n   \t\t<xsl:apply-templates select=\"*[last()]\"/>\r\n   \t\t<xsl:text>, </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:condition/node()\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:for-each select=\"*[position() &gt; 1]\">\r\n\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t<xsl:if test=\"position() !=last()\"><xsl:text> , </xsl:text></xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:otherwise>\r\n   </xsl:choose>\r\n\t<xsl:text>\\}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.5  minus-->\r\n<xsl:template match=\"m:apply[*[1][self::m:minus] and count(*)=2]\">\r\n\t<xsl:text>-</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:minus] and count(*)&gt;2]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">-</xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.6  plus-->\r\n<xsl:template match=\"m:apply[*[1][self::m:plus]]\">\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:if test=\"$p &gt; 2\">\r\n\t\t<xsl:text>(</xsl:text>\r\n\t</xsl:if>\r\n  <xsl:for-each select=\"*[position()&gt;1]\">\r\n   <xsl:if test=\"position() &gt; 1\">\r\n    <xsl:choose>\r\n      <xsl:when test=\"self::m:apply[*[1][self::m:times] and\r\n      *[2][self::m:apply/*[1][self::m:minus] or self::m:cn[not(m:sep) and\r\n      (number(.) &lt; 0)]]]\">-</xsl:when>\r\n      <xsl:otherwise>+</xsl:otherwise>\r\n    </xsl:choose>\r\n   </xsl:if>   \r\n    <xsl:choose>\r\n      <xsl:when test=\"self::m:apply[*[1][self::m:times] and\r\n      *[2][self::m:cn[not(m:sep) and (number(.) &lt;0)]]]\">\r\n\t\t\t<xsl:value-of select=\"-(*[2])\"/>\r\n\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t     <xsl:with-param name=\"first\" select=\"2\"/>\r\n\t\t     <xsl:with-param name=\"p\" select=\"2\"/>\r\n\t\t   </xsl:apply-templates>\r\n       </xsl:when>\r\n      <xsl:when test=\"self::m:apply[*[1][self::m:times] and\r\n      *[2][self::m:apply/*[1][self::m:minus]]]\">\r\n\t\t\t\t<xsl:apply-templates select=\"./*[2]/*[2]\"/>\r\n\t\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t\t\t<xsl:with-param name=\"first\" select=\"2\"/>\r\n\t\t\t\t\t<xsl:with-param name=\"p\" select=\"2\"/>\r\n\t\t\t\t</xsl:apply-templates>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:otherwise>\r\n\t\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t\t\t<xsl:with-param name=\"p\" select=\"2\"/>\r\n\t\t\t\t</xsl:apply-templates>\r\n\t\t\t</xsl:otherwise>\r\n\t\t</xsl:choose>\r\n\t</xsl:for-each>\r\n\t<xsl:if test=\"$p &gt; 2\">\r\n\t\t<xsl:text>)</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.7 power -->\r\n<xsl:template match=\"m:apply[*[1][self::m:power]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>^{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.8 remainder -->\r\n<xsl:template match=\"m:apply[*[1][self::m:rem]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\mod </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.9  times-->\r\n<xsl:template match=\"m:apply[*[1][self::m:times]]\" name=\"times\">\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"first\" select=\"1\"/>\r\n  <xsl:if test=\"$p &gt; 3\"><xsl:text>(</xsl:text></xsl:if>\r\n  <xsl:for-each select=\"*[position()&gt;1]\">\r\n\t\t<xsl:if test=\"position() &gt; 1\">\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"self::m:cn\">\\times <!-- times --></xsl:when>\r\n\t\t\t\t<xsl:otherwise><!--invisible times--></xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t</xsl:if> \r\n\t\t<xsl:if test=\"position()&gt;= $first\">\r\n\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t\t<xsl:with-param name=\"p\" select=\"3\"/>\r\n\t\t\t</xsl:apply-templates>\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n  <xsl:if test=\"$p &gt; 3\"><xsl:text>)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.10 root -->\r\n<xsl:template match=\"m:apply[*[1][self::m:root]]\">\r\n\t<xsl:text>\\sqrt</xsl:text>\r\n\t<xsl:if test=\"m:degree!=2\">\r\n\t\t<xsl:text>[</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:degree/*\"/>\r\n\t\t<xsl:text>]</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[position()&gt;1 and not(self::m:degree)]\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.11 gcd -->\r\n<xsl:template match=\"m:gcd\"><xsl:text>\\gcd </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.3.12 and -->\r\n<xsl:template match=\"m:apply[*[1][self::m:and]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\land <!-- and --></xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.13 or -->\r\n<xsl:template match=\"m:apply[*[1][self::m:or]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\lor </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.14 xor -->\r\n<xsl:template match=\"m:apply[*[1][self::m:xor]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\mathop{\\mathrm{xor}}</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.15 not -->\r\n<xsl:template match=\"m:apply[*[1][self::m:not]]\">\r\n\t<xsl:text>\\neg </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.16 implies -->\r\n<xsl:template match=\"m:apply[*[1][self::m:implies]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\implies </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.17 forall 4.4.3.18 exists -->\r\n<xsl:template match=\"m:apply[*[1][self::m:forall or self::m:exists]]\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"m:bvar\"/>\r\n\t<xsl:if test=\"m:condition\">\r\n\t\t<xsl:text>, </xsl:text><xsl:apply-templates select=\"m:condition\"/>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"*[last()][local-name()!='condition'][local-name()!='bvar']\">\r\n\t\t<xsl:text>\\colon </xsl:text>\r\n\t  <xsl:apply-templates select=\"*[last()]\"/>\r\n  </xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.19 abs -->\r\n<xsl:template match=\"m:apply[*[1][self::m:abs]]\">\r\n\t<xsl:text>\\left|</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>\\right|</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.20 conjugate -->\r\n<xsl:template match=\"m:apply[*[1][self::m:conjugate]]\">\r\n\t<xsl:text>\\overline{</xsl:text><xsl:apply-templates select=\"*[2]\"/><xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.22 real -->\r\n<xsl:template match=\"m:real\"><xsl:text>\\Re </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.3.23 imaginary -->\r\n<xsl:template match=\"m:imaginary\"><xsl:text>\\Im </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.3.25 floor -->\r\n<xsl:template match=\"m:apply[*[1][self::m:floor]]\">\r\n\t<xsl:text>\\lfloor </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>\\rfloor </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.25 ceiling -->\r\n<xsl:template match=\"m:apply[*[1][self::m:ceiling]]\">\r\n\t<xsl:text>\\lceil </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>\\rceil </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.1 eq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:eq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">=</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.2 neq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:neq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\neq </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.3 gt -->\r\n<xsl:template match=\"m:apply[*[1][self::m:gt]]\">\r\n<xsl:param name=\"p\" select=\"0\"/>\r\n<xsl:call-template name=\"infix\">\r\n\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t<xsl:with-param name=\"mo\">&gt; </xsl:with-param>\r\n</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.4 lt -->\r\n<xsl:template match=\"m:apply[*[1][self::m:lt]]\">\r\n<xsl:param name=\"p\" select=\"0\"/>\r\n<xsl:call-template name=\"infix\">\r\n\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t<xsl:with-param name=\"mo\">&lt; </xsl:with-param>\r\n</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.5 geq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:geq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\ge </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.6 leq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:leq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\le </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.7 equivalent -->\r\n<xsl:template match=\"m:apply[*[1][self::m:equivalent]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\equiv </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.8 approx -->\r\n<xsl:template match=\"m:apply[*[1][self::m:approx]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\approx </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.9 factorof -->\r\n<xsl:template match=\"m:apply[*[1][self::m:factorof]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\"> | </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.1 int -->\r\n<xsl:template match=\"m:apply[*[1][self::m:int]]\">\r\n\t<xsl:text>\\int</xsl:text>\r\n\t<xsl:if test=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\">\r\n\t\t<xsl:text>_{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"m:uplimit/*|m:interval/*[2]\">\r\n\t\t<xsl:text>^{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:uplimit/*|m:interval/*[2]\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t<xsl:text>\\,d </xsl:text>\r\n\t<xsl:apply-templates select=\"m:bvar\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.2 diff -->\r\n<xsl:template match=\"m:apply[*[1][self::m:diff] and m:ci and count(*)=2]\" priority=\"2\">\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>^\\prime </xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:diff]]\" priority=\"1\">\r\n\t<xsl:text>\\frac{</xsl:text>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"m:bvar/m:degree\">\r\n\t\t\t<xsl:text>d^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar/m:degree/node()\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t\t\t<xsl:text>}{d</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar/node()\"/>\r\n\t\t\t<xsl:text>^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar/m:degree/node()\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>d </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t\t\t<xsl:text>}{d </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.3 partialdiff -->\r\n<xsl:template match=\"m:apply[*[1][self::m:partialdiff] and m:list and m:ci and count(*)=3]\" priority=\"2\">\r\n\t<xsl:text>D_{</xsl:text>\r\n\t<xsl:for-each select=\"m:list[1]/*\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position()&lt;last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\"/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:partialdiff]]\" priority=\"1\">\r\n\t<xsl:text>\\frac{\\partial^{</xsl:text>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"m:degree\">\r\n\t\t\t<xsl:apply-templates select=\"m:degree/node()\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"m:bvar/m:degree[string(number(.))='NaN']\">\r\n\t\t\t<xsl:for-each select=\"m:bvar/m:degree\">\r\n\t\t\t\t<xsl:apply-templates select=\"node()\"/>\r\n\t\t\t\t<xsl:if test=\"position()&lt;last()\"><xsl:text>+</xsl:text></xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t\t<xsl:if test=\"count(m:bvar[not(m:degree)])&gt;0\">\r\n\t\t\t\t<xsl:text>+</xsl:text>\r\n\t\t\t\t<xsl:value-of select=\"count(m:bvar[not(m:degree)])\"/>\r\n\t\t\t</xsl:if>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:value-of select=\"sum(m:bvar/m:degree)+count(m:bvar[not(m:degree)])\"/>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t<xsl:text>}{</xsl:text>\r\n\t<xsl:for-each select=\"m:bvar\">\r\n\t\t<xsl:text>\\partial </xsl:text>\r\n\t\t<xsl:apply-templates select=\"node()\"/>\r\n\t\t<xsl:if test=\"m:degree\">\r\n\t\t\t<xsl:text>^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:degree/node()\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.8 declare 4.4.5.4 lowlimit 4.4.5.5 uplimit 4.4.5.7 degree 4.4.9.5 momentabout -->\r\n<xsl:template match=\"m:declare | m:lowlimit | m:uplimit | m:degree | m:momentabout\"/>\r\n\r\n<!-- 4.4.5.6  bvar-->\r\n<xsl:template match=\"m:bvar\">\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"following-sibling::m:bvar\"><xsl:text>, </xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.8 divergence-->\r\n<xsl:template match=\"m:divergence\"><xsl:text>\\mathop{\\mathrm{div}}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.5.11 laplacian-->\r\n<xsl:template match=\"m:laplacian\"><xsl:text>\\nabla^2 </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.6.1 set -->\r\n<xsl:template match=\"m:set\">\r\n\t<xsl:text>\\{</xsl:text><xsl:call-template name=\"set\"/><xsl:text>\\}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.2 list -->\r\n<xsl:template match=\"m:list\">\r\n\t<xsl:text>\\left[</xsl:text><xsl:call-template name=\"set\"/><xsl:text>\\right]</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"set\">\r\n   <xsl:choose>\r\n\t\t<xsl:when test=\"m:condition\">\r\n   \t\t<xsl:apply-templates select=\"m:bvar/*[not(self::bvar or self::condition)]\"/>\r\n   \t\t<xsl:text>\\colon </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:condition/node()\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:for-each select=\"*\">\r\n\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t<xsl:if test=\"position()!=last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:otherwise>\r\n   </xsl:choose>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.3 union -->\r\n<xsl:template match=\"m:apply[*[1][self::m:union]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\cup </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.4 intersect -->\r\n<xsl:template match=\"m:apply[*[1][self::m:intersect]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\cap </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.5 in -->\r\n<xsl:template match=\"m:apply[*[1][self::m:in]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\in </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.5 notin -->\r\n<xsl:template match=\"m:apply[*[1][self::m:notin]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\notin </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.7 subset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:subset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\subseteq </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.8 prsubset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:prsubset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\subset </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.9 notsubset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:notsubset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\nsubseteq </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.10 notprsubset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:notprsubset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\not\\subset </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.11 setdiff -->\r\n<xsl:template match=\"m:apply[*[1][self::m:setdiff]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\setminus </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.12 card -->\r\n<xsl:template match=\"m:apply[*[1][self::m:card]]\">\r\n\t<xsl:text>|</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>|</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.13 cartesianproduct 4.4.10.6 vectorproduct -->\r\n<xsl:template match=\"m:apply[*[1][self::m:cartesianproduct or self::m:vectorproduct]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\times </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<xsl:template\r\nmatch=\"m:apply[*[1][self::m:cartesianproduct][count(following-sibling::m:reals)=count(following-sibling::*)]]\"\r\npriority=\"2\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>^{</xsl:text>\r\n\t<xsl:value-of select=\"count(*)-1\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.1 sum -->\r\n<xsl:template match=\"m:apply[*[1][self::m:sum]]\">\r\n\t<xsl:text>\\sum</xsl:text><xsl:call-template name=\"series\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.2 product -->\r\n<xsl:template match=\"m:apply[*[1][self::m:product]]\">\r\n\t<xsl:text>\\prod</xsl:text><xsl:call-template name=\"series\"/>\r\n</xsl:template>\r\n\t\r\n<xsl:template name=\"series\">\r\n\t<xsl:if test=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\">\r\n\t\t<xsl:text>_{</xsl:text>\r\n\t\t<xsl:if test=\"not(m:condition)\">\r\n\t\t\t<xsl:apply-templates select=\"m:bvar\"/>\r\n\t\t\t<xsl:text>=</xsl:text>\r\n\t\t</xsl:if>\r\n\t\t<xsl:apply-templates select=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"m:uplimit/*|m:interval/*[2]\">\r\n\t\t<xsl:text>^{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:uplimit/*|m:interval/*[2]\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.3 limit -->\r\n<xsl:template match=\"m:apply[*[1][self::m:limit]]\">\r\n\t<xsl:text>\\lim_{</xsl:text>\r\n\t<xsl:apply-templates select=\"m:lowlimit|m:condition/*\"/>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[m:limit]/m:lowlimit\" priority=\"3\">\r\n\t<xsl:apply-templates select=\"../m:bvar/node()\"/>\r\n\t<xsl:text>\\to </xsl:text>\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.4 tendsto -->\r\n<xsl:template match=\"m:apply[*[1][self::m:tendsto]]\">\r\n\t<xsl:param name=\"p\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"@type='above'\">\\searrow </xsl:when>\r\n\t\t\t\t<xsl:when test=\"@type='below'\">\\nearrow </xsl:when>\r\n\t\t\t\t<xsl:when test=\"@type='two-sided'\">\\rightarrow </xsl:when>\r\n\t\t\t\t<xsl:otherwise>\\to </xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.8.1 common tringonometric functions 4.4.8.3 natural logarithm -->\r\n<xsl:template match=\"m:apply[*[1][\r\n self::m:sin or \t\tself::m:cos or \tself::m:tan or\t\tself::m:sec or\r\n self::m:csc or \t\tself::m:cot or \tself::m:sinh or\t \tself::m:cosh or\r\n self::m:tanh or \t\tself::m:coth or\tself::m:arcsin or \tself::m:arccos or\r\n self::m:arctan or \tself::m:ln]]\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:sin | m:cos | m:tan | m:sec | m:csc |\r\n\t\t\t\t\t\t\t\t m:cot | m:sinh | m:cosh | m:tanh | m:coth |\r\n\t\t\t\t\t\t\t\t m:arcsin | m:arccos | m:arctan | m:ln\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(.)\"/>\r\n\t<xsl:text> </xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][\r\n self::m:sech or \t\tself::m:csch or\t\tself::m:arccosh or\r\n self::m:arccot or \tself::m:arccoth or \tself::m:arccsc or\r\n self::m:arccsch or self::m:arcsec or \tself::m:arcsech or\r\n self::m:arcsinh or self::m:arctanh]]\">\r\n\t<xsl:text>\\mathrm{</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text>\\,}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:sech | m:csch | m:arccosh | m:arccot |\r\n\t\t\t\t\t\t\t\t m:arccoth | m:arccsc |m:arccsch |m:arcsec |\r\n\t\t\t\t\t\t\t\t m:arcsech | m:arcsinh | m:arctanh\">\r\n\t<xsl:text>\\mathrm{</xsl:text>\r\n\t<xsl:value-of select=\"local-name(.)\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.8.2 exp -->\r\n<xsl:template match=\"m:apply[*[1][self::m:exp]]\">\r\n\t<xsl:text>e^{</xsl:text><xsl:apply-templates select=\"*[2]\"/><xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.8.4 log -->\r\n<xsl:template match=\"m:apply[*[1][self::m:log]]\">\r\n\t<xsl:text>\\lg </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:log] and m:logbase != 10]\">\r\n\t<xsl:text>\\log_{</xsl:text>\r\n\t<xsl:apply-templates select=\"m:logbase/node()\"/>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<!-- 4.4.9.1 mean -->\r\n<xsl:template match=\"m:apply[*[1][self::m:mean]]\">\r\n\t<xsl:text>\\langle </xsl:text>\r\n\t<xsl:for-each select=\"*[position()&gt;1]\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position() !=last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>\\rangle </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.9.2 sdef -->\r\n<xsl:template match=\"m:sdev\"><xsl:text>\\sigma </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.9.3 variance -->\r\n<xsl:template match=\"m:apply[*[1][self::m:variance]]\">\r\n\t<xsl:text>\\sigma(</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>)^2</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.9.5 moment -->\r\n<xsl:template match=\"m:apply[*[1][self::m:moment]]\">\r\n\t<xsl:text>\\langle </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t<xsl:text>^{</xsl:text>\r\n\t<xsl:apply-templates select=\"m:degree/node()\"/>\r\n\t<xsl:text>}\\rangle</xsl:text>\r\n\t<xsl:if test=\"m:momentabout\">\r\n\t\t<xsl:text>_{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:momentabout/node()\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text> </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.1 vector  -->\r\n<xsl:template match=\"m:vector\">\r\n\t<xsl:text>\\left(\\begin{array}{c}</xsl:text>\r\n\t<xsl:for-each select=\"*\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position()!=last()\"><xsl:text>\\\\ </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>\\end{array}\\right)</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.2 matrix  -->\r\n<xsl:template match=\"m:matrix\">\r\n\t<xsl:text>\\begin{pmatrix}</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>\\end{pmatrix}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.3 matrixrow  -->\r\n<xsl:template match=\"m:matrixrow\">\r\n\t<xsl:for-each select=\"*\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position()!=last()\"><xsl:text> &amp; </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:if test=\"position()!=last()\"><xsl:text>\\\\ </xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.4 determinant  -->\r\n<xsl:template match=\"m:apply[*[1][self::m:determinant]]\">\r\n\t<xsl:text>\\det </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:determinant]][*[2][self::m:matrix]]\" priority=\"2\">\r\n\t<xsl:text>\\begin{vmatrix}</xsl:text>\r\n\t<xsl:apply-templates select=\"m:matrix/*\"/>\r\n\t<xsl:text>\\end{vmatrix}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.5 transpose -->\r\n<xsl:template match=\"m:apply[*[1][self::m:transpose]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>^T</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.5 selector -->\r\n<xsl:template match=\"m:apply[*[1][self::m:selector]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>_{</xsl:text>\r\n\t<xsl:for-each select=\"*[position()&gt;2]\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position() !=last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.7 scalarproduct 4.4.10.8 outerproduct -->\r\n<xsl:template match=\"m:apply[*[1][self::m:scalarproduct or self::m:outerproduct]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\dot </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.11.2 semantics -->\r\n<xsl:template match=\"m:semantics\"><xsl:apply-templates select=\"*[1]\"/></xsl:template>\r\n\r\n<xsl:template match=\"m:semantics[m:annotation/@encoding='TeX']\">\r\n\t<xsl:apply-templates select=\"m:annotation[@encoding='TeX']/node()\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.12.1 integers -->\r\n<xsl:template match=\"m:integers\"><xsl:text>\\mathbb{Z}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.2 reals -->\r\n<xsl:template match=\"m:reals\"><xsl:text>\\mathbb{R}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.3 rationals -->\r\n<xsl:template match=\"m:rationals\"><xsl:text>\\mathbb{Q}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.4 naturalnumbers -->\r\n<xsl:template match=\"m:naturalnumbers\"><xsl:text>\\mathbb{N}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.5 complexes -->\r\n<xsl:template match=\"m:complexes\"><xsl:text>\\mathbb{C}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.6 primes -->\r\n<xsl:template match=\"m:primes\"><xsl:text>\\mathbb{P}</xsl:text></xsl:template>\r\n\t\r\n<!-- 4.4.12.7 exponentiale -->\r\n<xsl:template match=\"m:exponentiale\"><xsl:text>e</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.8 imaginaryi -->\r\n<xsl:template match=\"m:imaginaryi\"><xsl:text>i</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.9 notanumber -->\r\n<xsl:template match=\"m:notanumber\"><xsl:text>NaN</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.10 true -->\r\n<xsl:template match=\"m:true\"><xsl:text>\\mbox{true}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.11 false -->\r\n<xsl:template match=\"m:false\"><xsl:text>\\mbox{false}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.12 emptyset -->\r\n<xsl:template match=\"m:emptyset\"><xsl:text>\\emptyset </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.13 pi -->\r\n<xsl:template match=\"m:pi\"><xsl:text>\\pi </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.14 eulergamma -->\r\n<xsl:template match=\"m:eulergamma\"><xsl:text>\\gamma </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.15 infinity -->\r\n<xsl:template match=\"m:infinity\"><xsl:text>\\infty </xsl:text></xsl:template>\r\n\r\n<!-- ****************************** -->\r\n<xsl:template name=\"infix\" >\r\n  <xsl:param name=\"mo\"/>\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"this-p\" select=\"0\"/>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>(</xsl:text></xsl:if>\r\n  <xsl:for-each select=\"*[position()&gt;1]\">\r\n\t\t<xsl:if test=\"position() &gt; 1\">\r\n\t\t\t<xsl:copy-of select=\"$mo\"/>\r\n\t\t</xsl:if>   \r\n\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t\t</xsl:apply-templates>\r\n\t</xsl:for-each>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"binary\" >\r\n  <xsl:param name=\"mo\"/>\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"this-p\" select=\"0\"/>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>(</xsl:text></xsl:if>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:value-of select=\"$mo\"/>\r\n\t<xsl:apply-templates select=\"*[3]\">\r\n    \t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:if test=\"$this-p &lt; $p\"><xsl:text>)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- Note: variables colora (template color) and symbola (template startspace) only for Sablotron -->\r\n\r\n<xsl:template name=\"startspace\">\r\n\t<xsl:param name=\"symbol\"/>\r\n\t<xsl:if test=\"contains($symbol,' ')\">\r\n\t\t<xsl:variable name=\"symbola\" select=\"concat(substring-before($symbol,' '),substring-after($symbol,' '))\"/>\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"$symbola\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"not(contains($symbol,' '))\">\r\n\t\t<xsl:value-of select=\"$symbol\"/>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:strip-space elements=\"m:*\"/>\r\n\r\n<xsl:template match=\"m:math\">\r\n\t<xsl:text>&#x00024;</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>&#x00024;</xsl:text>\r\n</xsl:template>\r\n\r\n</xsl:stylesheet>\r\n";
    //var xsltMathml = "<?xml version='1.0' encoding=\"UTF-8\"?>\r\n<xsl:stylesheet xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\"\r\n\t\txmlns:m=\"http://www.w3.org/1998/Math/MathML\"\r\n                version='1.0'>\r\n                \r\n<xsl:output method=\"text\" indent=\"no\" encoding=\"UTF-8\"/>\r\n\r\n<!-- ====================================================================== -->\r\n<!-- $id: mmltex.xsl, 2002/22/11 Exp $\r\n     This file is part of the XSLT MathML Library distribution.\r\n     See ./README or http://www.raleigh.ru/MathML/mmltex for\r\n     copyright and other information                                        -->\r\n<!-- ====================================================================== -->\r\n\r\n<!--xsl:include href=\"tokens.xsl\"/-->\r\n\r\n<xsl:template match=\"m:mi|m:mn|m:mo|m:mtext|m:ms\">\r\n\t<xsl:call-template name=\"CommonTokenAtr\"/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mi\">\r\n  <xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mn\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mo\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mtext\">\r\n\t<xsl:variable name=\"content\">\r\n\t\t<xsl:call-template name=\"replaceMtextEntities\">\r\n\t\t\t<xsl:with-param name=\"content\" select=\".\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t<xsl:text>\\text{</xsl:text>\r\n\t<xsl:value-of select=\"$content\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mspace\">\r\n</xsl:template>\r\n\r\n<xsl:template name=\"ms\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@lquote\"><xsl:value-of select=\"@lquote\"/></xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\"</xsl:text></xsl:otherwise>\r\n\t</xsl:choose><xsl:apply-templates/><xsl:choose>\r\n\t\t<xsl:when test=\"@rquote\"><xsl:value-of select=\"@rquote\"/></xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\"</xsl:text></xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"CommonTokenAtr\">\r\n\t<xsl:if test=\"@mathbackground\">\r\n\t\t<xsl:text>\\colorbox[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@mathbackground\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{$</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@color or @mathcolor\"> <!-- Note: @color is deprecated in MathML 2.0 -->\r\n\t\t<xsl:text>\\textcolor[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@color|@mathcolor\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@mathvariant\">\r\n\t\t<xsl:choose>\r\n\t\t\t<xsl:when test=\"@mathvariant='normal'\">\r\n\t\t\t\t<xsl:text>\\mathrm{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold'\">\r\n\t\t\t\t<xsl:text>\\mathbf{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='italic'\">\r\n\t\t\t\t<xsl:text>\\mathit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-italic'\">\t<!-- Required definition -->\r\n\t\t\t\t<xsl:text>\\mathbit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='double-struck'\">\t<!-- Required amsfonts -->\r\n\t\t\t\t<xsl:text>\\mathbb{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-fraktur'\">\t<!-- Error -->\r\n\t\t\t\t<xsl:text>{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='script'\">\r\n\t\t\t\t<xsl:text>\\mathcal{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-script'\">\t<!-- Error -->\r\n\t\t\t\t<xsl:text>\\mathsc{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='fraktur'\">\t<!-- Required amsfonts -->\r\n\t\t\t\t<xsl:text>\\mathfrak{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='sans-serif'\">\r\n\t\t\t\t<xsl:text>\\mathsf{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-sans-serif'\"> <!-- Required definition -->\r\n\t\t\t\t<xsl:text>\\mathbsf{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='sans-serif-italic'\"> <!-- Required definition -->\r\n\t\t\t\t<xsl:text>\\mathsfit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='sans-serif-bold-italic'\">\t<!-- Error -->\r\n\t\t\t\t<xsl:text>\\mathbsfit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='monospace'\">\r\n\t\t\t\t<xsl:text>\\mathtt{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:otherwise>\r\n\t\t\t\t<xsl:text>{</xsl:text>\r\n\t\t\t</xsl:otherwise>\r\n\t\t</xsl:choose>\r\n\t</xsl:if>\r\n\t<xsl:call-template name=\"selectTemplate\"/>\r\n\t<xsl:if test=\"@mathvariant\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@color or @mathcolor\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@mathbackground\">\r\n\t\t<xsl:text>$}</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"selectTemplate\">\r\n<!--\t<xsl:variable name=\"name\" select=\"local-name()\"/>\r\n\t<xsl:call-template name=\"{$name}\"/>-->\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"local-name(.)='mi'\">\r\n\t\t\t<xsl:call-template name=\"mi\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='mn'\">\r\n\t\t\t<xsl:call-template name=\"mn\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='mo'\">\r\n\t\t\t<xsl:call-template name=\"mo\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='mtext'\">\r\n\t\t\t<xsl:call-template name=\"mtext\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='ms'\">\r\n\t\t\t<xsl:call-template name=\"ms\"/>\r\n\t\t</xsl:when>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"color\">\r\n<!-- NB: Variables colora and valueColor{n} only for Sablotron -->\r\n\t<xsl:param name=\"color\"/>\r\n\t<xsl:variable name=\"colora\" select=\"translate($color,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')\"/>\r\n\t<xsl:choose>\r\n\t<xsl:when test=\"starts-with($colora,'#') and string-length($colora)=4\">\r\n\t\t<xsl:variable name=\"valueColor\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,2,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"$valueColor div 15\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor1\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,3,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"$valueColor1 div 15\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor2\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,4,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"$valueColor2 div 15\"/>\r\n\t</xsl:when>\r\n\t<xsl:when test=\"starts-with($colora,'#') and string-length($colora)=7\">\r\n\t\t<xsl:variable name=\"valueColor1\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,2,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:variable name=\"valueColor2\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,3,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"($valueColor1*16 + $valueColor2) div 255\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor1a\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,4,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:variable name=\"valueColor2a\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,5,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"($valueColor1a*16 + $valueColor2a) div 255\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor1b\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,6,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:variable name=\"valueColor2b\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,7,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"($valueColor1b*16 + $valueColor2b) div 255\"/>\r\n\t</xsl:when>\r\n<!-- ======================= if color specifed as an html-color-name ========================================== -->\r\n\t<xsl:when test=\"$colora='aqua'\"><xsl:text>0,1,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='black'\"><xsl:text>0,0,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='blue'\"><xsl:text>0,0,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='fuchsia'\"><xsl:text>1,0,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='gray'\"><xsl:text>.5,.5,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='green'\"><xsl:text>0,.5,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='lime'\"><xsl:text>0,1,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='maroon'\"><xsl:text>.5,0,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='navy'\"><xsl:text>0,0,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='olive'\"><xsl:text>.5,.5,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='purple'\"><xsl:text>.5,0,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='red'\"><xsl:text>1,0,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='silver'\"><xsl:text>.75,.75,.75</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='teal'\"><xsl:text>0,.5,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='white'\"><xsl:text>1,1,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='yellow'\"><xsl:text>1,1,0</xsl:text></xsl:when>\r\n\t<xsl:otherwise>\r\n\t\t<xsl:message>Exception at color template</xsl:message>\r\n\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"Hex2Decimal\">\r\n\t<xsl:param name=\"arg\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$arg='f'\">\r\n\t\t\t<xsl:value-of select=\"15\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='e'\">\r\n\t\t\t<xsl:value-of select=\"14\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='d'\">\r\n\t\t\t<xsl:value-of select=\"13\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='c'\">\r\n\t\t\t<xsl:value-of select=\"12\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='b'\">\r\n\t\t\t<xsl:value-of select=\"11\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='a'\">\r\n\t\t\t<xsl:value-of select=\"10\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($arg, '0123456789', '9999999999')='9'\"> <!-- if $arg is number -->\r\n\t\t\t<xsl:value-of select=\"$arg\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:message>Exception at Hex2Decimal template</xsl:message>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:*/text()\">\r\n\t<xsl:call-template name=\"replaceEntities\">\r\n\t\t<xsl:with-param name=\"content\" select=\"normalize-space()\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n<!--xsl:include href=\"glayout.xsl\"/-->\r\n<xsl:template match=\"m:mfrac\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@bevelled='true'\">\r\n<!--\t\t\t<xsl:text>\\raisebox{1ex}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}\\!\\left/ \\!\\raisebox{-1ex}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}\\right.</xsl:text>-->\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"@linethickness\">\r\n\t\t\t<xsl:text>\\genfrac{}{}{</xsl:text>\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"number(@linethickness)\">\r\n\t\t\t\t\t<xsl:value-of select=\"@linethickness div 10\"/>\r\n\t\t\t\t\t<xsl:text>ex</xsl:text>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:when test=\"@linethickness='thin'\">\r\n\t\t\t\t\t<xsl:text>.05ex</xsl:text>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:when test=\"@linethickness='medium'\"/>\r\n\t\t\t\t<xsl:when test=\"@linethickness='thick'\">\r\n\t\t\t\t\t<xsl:text>.2ex</xsl:text>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:otherwise>\r\n\t\t\t\t\t<xsl:value-of select=\"@linethickness\"/>\r\n\t\t\t\t</xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t\t<xsl:text>}{}{</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\frac{</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:if test=\"@numalign='right'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:if test=\"@numalign='left'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>}{</xsl:text>\t\r\n\t<xsl:if test=\"@denomalign='right'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t<xsl:if test=\"@denomalign='left'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mroot\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"count(./*)=2\">\r\n\t\t\t<xsl:text>\\sqrt[</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>]{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t<!-- number of argumnets is not 2 - code 25 -->\r\n\t\t\t<xsl:message>exception 25:</xsl:message>\r\n\t\t\t<xsl:text>\\text{exception 25:}</xsl:text> \r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msqrt\">\r\n\t<xsl:text>\\sqrt{</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mfenced\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@open\">\r\n\t\t\t<xsl:if test=\"translate(@open,'{}[]()|','{{{{{{{')='{'\">\r\n\t\t\t\t<xsl:text>\\left</xsl:text>\r\n\t\t\t</xsl:if>\r\n\t\t\t<xsl:if test=\"@open='{' or @open='}'\">\r\n\t\t\t\t<xsl:text>\\</xsl:text>\r\n\t\t\t</xsl:if>\r\n\t\t\t<xsl:value-of select=\"@open\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\left(</xsl:text></xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"count(./*)>1\">\r\n\t\t\t<xsl:variable name=\"symbol\">\r\n\t\t\t\t<xsl:choose>\r\n\t\t\t\t\t<xsl:when test=\"@separators\">\r\n\t\t\t\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t\t\t\t<xsl:with-param name=\"symbol\" select=\"@separators\"/>\r\n\t\t\t\t\t\t</xsl:call-template>\r\n\t\t\t\t\t</xsl:when>\r\n\t\t\t\t\t<xsl:otherwise>,</xsl:otherwise>\r\n\t\t\t\t</xsl:choose>\r\n\t\t\t</xsl:variable>\r\n\t\t\t<xsl:for-each select=\"./*\">\r\n\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t<xsl:if test=\"not(position()=last())\">\r\n\t\t\t\t\t<xsl:choose>\r\n\t\t\t\t\t\t<xsl:when test=\"position()>string-length($symbol)\">\r\n\t\t\t\t\t\t\t<xsl:value-of select=\"substring($symbol,string-length($symbol))\"/>\r\n\t\t\t\t\t\t</xsl:when>\r\n\t\t\t\t\t\t<xsl:otherwise>\r\n\t\t\t\t\t\t\t<xsl:value-of select=\"substring($symbol,position(),1)\"/>\r\n\t\t\t\t\t\t</xsl:otherwise>\r\n\t\t\t\t\t</xsl:choose>\r\n\t\t\t\t</xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@close\">\r\n\t\t\t<xsl:if test=\"translate(@open,'{}[]()|','{{{{{{{')='{'\">\r\n\t\t\t\t<xsl:text>\\right</xsl:text>\r\n\t\t\t</xsl:if>\r\n\t\t\t<xsl:if test=\"@open='{' or @open='}'\">\r\n\t\t\t\t<xsl:text>\\</xsl:text>\r\n\t\t\t</xsl:if>\t\t\r\n\t\t\t<xsl:value-of select=\"@close\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\right)</xsl:text></xsl:otherwise>\r\n\t</xsl:choose>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mphantom\">\r\n\t<xsl:text>\\phantom{</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:menclose\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@notation = 'actuarial'\">\r\n\t\t\t<xsl:text>\\overline{</xsl:text>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t\t<xsl:text>\\hspace{.2em}|}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"@notation = 'radical'\">\r\n\t\t\t<xsl:text>\\sqrt{</xsl:text>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\overline{)</xsl:text>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mrow\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mstyle\">\r\n\t<xsl:if test=\"@background\">\r\n\t\t<xsl:text>\\colorbox[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@background\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{$</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@color\">\r\n\t\t<xsl:text>\\textcolor[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@color\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@color\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@background\">\r\n\t\t<xsl:text>$}</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n<!--\r\n\r\n<xsl:template match=\"m:mstyle\">\r\n\t<xsl:if test=\"@displaystyle='true'\">\r\n\t\t<xsl:text>{\\displaystyle</xsl:text>\r\n\t</xsl:if>\t\t\t\r\n\t<xsl:if test=\"@scriptlevel=2\">\r\n\t\t<xsl:text>{\\scriptscriptstyle</xsl:text>\t\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@scriptlevel=2\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@displaystyle='true'\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n-->\r\n\r\n<xsl:template match=\"m:merror\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n<!--xsl:include href=\"scripts.xsl\"/-->\r\n<xsl:template match=\"m:munderover\">\r\n\t<xsl:variable name=\"base\">\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[1]\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t<xsl:variable name=\"under\">\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[2]\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t<xsl:variable name=\"over\">\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[3]\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$over='&#x000AF;'\">\t<!-- OverBar - over bar -->\r\n\t\t\t<xsl:text>\\overline{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"munder\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"under\" select=\"$under\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$over='&#x0FE37;'\">\t<!-- OverBrace - over brace -->\r\n\t\t\t<xsl:text>\\overbrace{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"munder\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"under\" select=\"$under\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$under='&#x00332;'\">\t<!-- UnderBar - combining low line -->\r\n\t\t\t<xsl:text>\\underline{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"mover\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"over\" select=\"$over\"/>\r\n\t\t\t\t<xsl:with-param name=\"pos_over\" select=\"3\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$under='&#x0FE38;'\">\t<!-- UnderBrace - under brace -->\r\n\t\t\t<xsl:text>\\underbrace{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"mover\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"over\" select=\"$over\"/>\r\n\t\t\t\t<xsl:with-param name=\"pos_over\" select=\"3\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($base,'&#x0220F;&#x02210;&#x022c2;&#x022c3;&#x02294;',\r\n\t\t\t\t\t\t'&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;')='&#x02211;'\">\r\n<!-- if $base is operator, such as\r\n\t\t\t&#x02211;\t/sum L: summation operator\r\n\t\t\t&#x0220F;\t/prod L: product operator\r\n\t\t\t&#x02210;\t/coprod L: coproduct operator\r\n\t\t\t&#x022c2;\t/bigcap\r\n\t\t\t&#x022c3;\t/bigcup\r\n\t\t\t&#x02294;\t/bigsqcup\r\n-->\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>_{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[3]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\underset{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}{\\overset{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[3]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}}</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mover\">\r\n\t<xsl:call-template name=\"mover\">\r\n\t\t<xsl:with-param name=\"base\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[1]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t\t<xsl:with-param name=\"over\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[2]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:munder\">\r\n\t<xsl:call-template name=\"munder\">\r\n\t\t<xsl:with-param name=\"base\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[1]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t\t<xsl:with-param name=\"under\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[2]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mover\">\r\n\t<xsl:param name=\"base\"/>\r\n\t<xsl:param name=\"over\"/>\r\n\t<xsl:param name=\"pos_over\" select=\"2\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$over='&#x000AF;'\">\t<!-- OverBar - over bar -->\r\n\t\t\t<xsl:text>\\overline{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$over='&#x0FE37;'\">\t<!-- OverBrace - over brace -->\r\n\t\t\t<xsl:text>\\overbrace{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($base,'&#x0220F;&#x02210;&#x022c2;&#x022c3;&#x02294;',\r\n\t\t\t\t\t\t'&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;')='&#x02211;'\">\r\n<!-- if $base is operator, such as\r\n\t\t\t&#x02211;\t/sum L: summation operator\r\n\t\t\t&#x0220F;\t/prod L: product operator\r\n\t\t\t&#x02210;\t/coprod L: coproduct operator\r\n\t\t\t&#x022c2;\t/bigcap\r\n\t\t\t&#x022c3;\t/bigcup\r\n\t\t\t&#x02294;\t/bigsqcup\r\n-->\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[$pos_over]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\stackrel{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[$pos_over]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t\t<!--\r\n\t\t\t<xsl:text>\\overset{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[$pos_over]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>-->\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"munder\">\r\n\t<xsl:param name=\"base\"/>\r\n\t<xsl:param name=\"under\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$under='&#x00332;'\">\t<!-- UnderBar - combining low line -->\r\n\t\t\t<xsl:text>\\underline{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$under='&#x0FE38;'\">\t<!-- UnderBrace - under brace -->\r\n\t\t\t<xsl:text>\\underbrace{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($base,'&#x0220F;&#x02210;&#x022c2;&#x022c3;&#x02294;',\r\n\t\t\t\t\t\t'&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;')='&#x02211;'\">\r\n<!-- if $base is operator, such as\r\n\t\t\t&#x02211;\t/sum L: summation operator\r\n\t\t\t&#x0220F;\t/prod L: product operator\r\n\t\t\t&#x02210;\t/coprod L: coproduct operator\r\n\t\t\t&#x022c2;\t/bigcap\r\n\t\t\t&#x022c3;\t/bigcup\r\n\t\t\t&#x02294;\t/bigsqcup\r\n-->\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>_{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\underset{</xsl:text>\t\t<!-- Required AmsMath package -->\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msubsup\">\r\n\t<xsl:text>{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:text>}_{</xsl:text>\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t<xsl:text>}^{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[3]\"/>\r\n\t<xsl:text>}</xsl:text>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msup\">\r\n\t<xsl:text>{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:text>}^{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t<xsl:text>}</xsl:text>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msub\">\r\n\t<xsl:text>{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:text>}_{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t<xsl:text>}</xsl:text>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mmultiscripts\" mode=\"mprescripts\">\r\n\t<xsl:for-each select=\"m:mprescripts/following-sibling::*\">\r\n\t\t<xsl:if test=\"position() mod 2 and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>{}_{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t\t<xsl:if test=\"not(position() mod 2) and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>{}^{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:for-each select=\"m:mprescripts/preceding-sibling::*[position()!=last()]\">\r\n\t\t<xsl:if test=\"position()>2 and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>{}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t\t<xsl:if test=\"position() mod 2 and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>_{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t\t<xsl:if test=\"not(position() mod 2) and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>^{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mmultiscripts\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"m:mprescripts\">\r\n\t\t\t<xsl:apply-templates select=\".\" mode=\"mprescripts\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:for-each select=\"*[position()>1]\">\r\n\t\t\t\t<xsl:if test=\"position()>2 and local-name(.)!='none'\">\r\n\t\t\t\t\t<xsl:text>{}</xsl:text>\t\r\n\t\t\t\t</xsl:if>\r\n\t\t\t\t<xsl:if test=\"position() mod 2 and local-name(.)!='none'\">\r\n\t\t\t\t\t<xsl:text>_{</xsl:text>\t\r\n\t\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t\t\t</xsl:if>\r\n\t\t\t\t<xsl:if test=\"not(position() mod 2) and local-name(.)!='none'\">\r\n\t\t\t\t\t<xsl:text>^{</xsl:text>\t\r\n\t\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t\t\t</xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n<!--xsl:include href=\"tables.xsl\"/-->\r\n<xsl:template match=\"m:mtd[@columnspan]\">\r\n\t<xsl:text>\\multicolumn{</xsl:text>\r\n\t<xsl:value-of select=\"@columnspan\"/>\r\n\t<xsl:text>}{c}{</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:if test=\"count(following-sibling::*)>0\">\r\n\t\t<xsl:text>&amp; </xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n\r\n<xsl:template match=\"m:mtd\">\r\n\t<xsl:if test=\"@columnalign='right' or @columnalign='center'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@columnalign='left' or @columnalign='center'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"count(following-sibling::*)>0\">\r\n<!--    this test valid for Sablotron, another form - test=\"not(position()=last())\".\r\n\tAlso for m:mtd[@columnspan] and m:mtr  -->\r\n\t\t<xsl:text>&amp; </xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mtr\">\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"count(following-sibling::*)>0\">\r\n\t\t<xsl:text>\\\\ </xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mtable\">\r\n\t<xsl:text>\\begin{array}{</xsl:text>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>|</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:variable name=\"numbercols\" select=\"count(./m:mtr[1]/m:mtd[not(@columnspan)])+sum(./m:mtr[1]/m:mtd/@columnspan)\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@columnalign\">\r\n\t\t\t<xsl:variable name=\"colalign\">\r\n\t\t\t\t<xsl:call-template name=\"colalign\">\r\n\t\t\t\t\t<xsl:with-param name=\"colalign\" select=\"@columnalign\"/>\r\n\t\t\t\t</xsl:call-template>\r\n\t\t\t</xsl:variable>\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"string-length($colalign) > $numbercols\">\r\n\t\t\t\t\t<xsl:value-of select=\"substring($colalign,1,$numbercols)\"/>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:when test=\"string-length($colalign) &lt; $numbercols\">\r\n\t\t\t\t\t<xsl:value-of select=\"$colalign\"/>\r\n\t\t\t\t\t<xsl:call-template name=\"generate-string\">\r\n\t\t\t\t\t\t<xsl:with-param name=\"text\" select=\"substring($colalign,string-length($colalign))\"/>\r\n\t\t\t\t\t\t<xsl:with-param name=\"count\" select=\"$numbercols - string-length($colalign)\"/>\r\n\t\t\t\t\t</xsl:call-template>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:otherwise>\r\n\t\t\t\t\t<xsl:value-of select=\"$colalign\"/>\r\n\t\t\t\t</xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:call-template name=\"generate-string\">\r\n\t\t\t\t<xsl:with-param name=\"text\" select=\"'c'\"/>\r\n\t\t\t\t<xsl:with-param name=\"count\" select=\"$numbercols\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>|</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>\\hline </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>\\\\ \\hline</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>\\end{array}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"colalign\">\r\n\t<xsl:param name=\"colalign\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"contains($colalign,' ')\">\r\n\t\t\t<xsl:value-of select=\"substring($colalign,1,1)\"/>\r\n\t\t\t<xsl:call-template name=\"colalign\">\r\n\t\t\t\t<xsl:with-param name=\"colalign\" select=\"substring-after($colalign,' ')\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:value-of select=\"substring($colalign,1,1)\"/>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"generate-string\">\r\n<!-- template from XSLT Standard Library v1.1 -->\r\n    <xsl:param name=\"text\"/>\r\n    <xsl:param name=\"count\"/>\r\n\r\n    <xsl:choose>\r\n      <xsl:when test=\"string-length($text) = 0 or $count &lt;= 0\"/>\r\n\r\n      <xsl:otherwise>\r\n\t<xsl:value-of select=\"$text\"/>\r\n\t<xsl:call-template name=\"generate-string\">\r\n\t  <xsl:with-param name=\"text\" select=\"$text\"/>\r\n\t  <xsl:with-param name=\"count\" select=\"$count - 1\"/>\r\n\t</xsl:call-template>\r\n      </xsl:otherwise>\r\n    </xsl:choose>\r\n</xsl:template>\r\n<!--xsl:include href=\"entities.xsl\"/-->\r\n\r\n<xsl:template name=\"replaceEntities\">\r\n\t<xsl:param name=\"content\"/>\r\n\t<xsl:if test=\"string-length($content)>0\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$content ='sin' or $content ='cos' or $content='tan' or $content ='sec' or $content ='csc' or $content ='cot' or $content ='sinh' or $content ='cosh' or $content ='tanh' or $content ='coth' or $content ='arcsin' or $content ='arccos' or $content ='arctan' or $content ='ln'\"><xsl:text>\\</xsl:text><xsl:value-of select=\"$content\" /></xsl:when><xsl:when test=\"starts-with($content,'&#x0025B;')\"><xsl:value-of select=\"'\\varepsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0025B;')\"/></xsl:call-template></xsl:when>\t<!--/varepsilon -->\r\n\r\n<!-- ====================================================================== -->\r\n<!-- \tUnicode 3.2\r\n\tGreek\r\n\tRange: 0370-03FF\r\n\thttp://www.unicode.org/charts/PDF/U0370.pdf\t                    -->\r\n<!-- ====================================================================== -->\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x00393;')\"><xsl:value-of select=\"'\\Gamma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x00393;')\"/></xsl:call-template></xsl:when>\t<!--/Gamma capital Gamma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x00394;')\"><xsl:value-of select=\"'\\Delta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x00394;')\"/></xsl:call-template></xsl:when>\t<!--/Delta capital Delta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x00398;')\"><xsl:value-of select=\"'\\Theta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x00398;')\"/></xsl:call-template></xsl:when>\t<!--/Theta capital Theta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0039B;')\"><xsl:value-of select=\"'\\Lambda '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0039B;')\"/></xsl:call-template></xsl:when>\t<!--/Lambda capital Lambda, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0039E;')\"><xsl:value-of select=\"'\\Xi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0039E;')\"/></xsl:call-template></xsl:when>\t<!--/Xi capital Xi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A0;')\"><xsl:value-of select=\"'\\Pi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A0;')\"/></xsl:call-template></xsl:when>\t<!--/Pi capital Pi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A3;')\"><xsl:value-of select=\"'\\Sigma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A3;')\"/></xsl:call-template></xsl:when>\t<!--/Sigma capital Sigma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A6;')\"><xsl:value-of select=\"'\\Phi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A6;')\"/></xsl:call-template></xsl:when>\t<!--/Phi capital Phi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A8;')\"><xsl:value-of select=\"'\\Psi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A8;')\"/></xsl:call-template></xsl:when>\t<!--/Psi capital Psi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A9;')\"><xsl:value-of select=\"'\\Omega '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A9;')\"/></xsl:call-template></xsl:when>\t<!--/Omega capital Omega, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B1;')\"><xsl:value-of select=\"'\\alpha '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B1;')\"/></xsl:call-template></xsl:when>\t<!--/alpha small alpha, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B2;')\"><xsl:value-of select=\"'\\beta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B2;')\"/></xsl:call-template></xsl:when>\t<!--/beta small beta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B3;')\"><xsl:value-of select=\"'\\gamma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B3;')\"/></xsl:call-template></xsl:when>\t<!--/gamma small gamma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B4;')\"><xsl:value-of select=\"'\\delta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B4;')\"/></xsl:call-template></xsl:when>\t<!--/delta small delta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B5;')\"><xsl:value-of select=\"'\\epsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B5;')\"/></xsl:call-template></xsl:when>\t<!--/straightepsilon, small epsilon, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B6;')\"><xsl:value-of select=\"'\\zeta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B6;')\"/></xsl:call-template></xsl:when>\t<!--/zeta small zeta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B7;')\"><xsl:value-of select=\"'\\eta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B7;')\"/></xsl:call-template></xsl:when>\t<!--/eta small eta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B8;')\"><xsl:value-of select=\"'\\theta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B8;')\"/></xsl:call-template></xsl:when>\t<!--/theta straight theta, small theta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B9;')\"><xsl:value-of select=\"'\\iota '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B9;')\"/></xsl:call-template></xsl:when>\t<!--/iota small iota, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BA;')\"><xsl:value-of select=\"'\\kappa '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BA;')\"/></xsl:call-template></xsl:when>\t<!--/kappa small kappa, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BB;')\"><xsl:value-of select=\"'\\lambda '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BB;')\"/></xsl:call-template></xsl:when>\t<!--/lambda small lambda, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BC;')\"><xsl:value-of select=\"'\\mu '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BC;')\"/></xsl:call-template></xsl:when>\t<!--/mu small mu, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BD;')\"><xsl:value-of select=\"'\\nu '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BD;')\"/></xsl:call-template></xsl:when>\t<!--/nu small nu, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BE;')\"><xsl:value-of select=\"'\\xi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BE;')\"/></xsl:call-template></xsl:when>\t<!--/xi small xi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C0;')\"><xsl:value-of select=\"'\\pi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C0;')\"/></xsl:call-template></xsl:when>\t<!--/pi small pi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C1;')\"><xsl:value-of select=\"'\\rho '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C1;')\"/></xsl:call-template></xsl:when>\t<!--/rho small rho, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C2;')\"><xsl:value-of select=\"'\\varsigma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C2;')\"/></xsl:call-template></xsl:when>\t<!--/varsigma -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C3;')\"><xsl:value-of select=\"'\\sigma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C3;')\"/></xsl:call-template></xsl:when>\t<!--/sigma small sigma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C4;')\"><xsl:value-of select=\"'\\tau '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C4;')\"/></xsl:call-template></xsl:when>\t<!--/tau small tau, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C5;')\"><xsl:value-of select=\"'\\upsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C5;')\"/></xsl:call-template></xsl:when>\t<!--/upsilon small upsilon, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C6;')\"><xsl:value-of select=\"'\\phi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C6;')\"/></xsl:call-template></xsl:when>\t<!--/straightphi - small phi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C7;')\"><xsl:value-of select=\"'\\chi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C7;')\"/></xsl:call-template></xsl:when>\t<!--/chi small chi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C8;')\"><xsl:value-of select=\"'\\psi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C8;')\"/></xsl:call-template></xsl:when>\t<!--/psi small psi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C9;')\"><xsl:value-of select=\"'\\omega '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C9;')\"/></xsl:call-template></xsl:when>\t<!--/omega small omega, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D1;')\"><xsl:value-of select=\"'\\vartheta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D1;')\"/></xsl:call-template></xsl:when>\t<!--/vartheta - curly or open theta -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D2;')\"><xsl:value-of select=\"'\\Upsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D2;')\"/></xsl:call-template></xsl:when>\t<!--/Upsilon capital Upsilon, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D5;')\"><xsl:value-of select=\"'\\varphi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D5;')\"/></xsl:call-template></xsl:when>\t<!--/varphi - curly or open phi -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D6;')\"><xsl:value-of select=\"'\\varpi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D6;')\"/></xsl:call-template></xsl:when>\t\t<!--/varpi -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003F0;')\"><xsl:value-of select=\"'\\varkappa '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003F0;')\"/></xsl:call-template></xsl:when>\t<!--/varkappa -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003F1;')\"><xsl:value-of select=\"'\\varrho '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003F1;')\"/></xsl:call-template></xsl:when>\t<!--/varrho -->\r\n\t\t\r\n<!-- ====================================================================== -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0200B;')\"><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0200B;')\"/></xsl:call-template></xsl:when>\t\t\t\t\t\t<!--short form of  &InvisibleComma; -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02026;')\"><xsl:value-of select=\"'\\dots '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02026;')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02032;')\"><xsl:value-of select=\"'\\prime '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02032;')\"/></xsl:call-template></xsl:when>\t\t<!--/prime prime or minute -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02061;')\"><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02061;')\"/></xsl:call-template></xsl:when>\t\t\t\t\t\t<!-- ApplyFunction -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02062;')\"><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02062;')\"/></xsl:call-template></xsl:when>\t\t\t\t\t\t<!-- InvisibleTimes -->\r\n<!-- ====================================================================== -->\r\n<!-- \tUnicode 3.2\r\n\tLetterlike Symbols\r\n\tRange: 2100-214F\r\n\thttp://www.unicode.org/charts/PDF/U2100.pdf\t                    -->\r\n<!-- ====================================================================== -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0210F;&#x0FE00;')\"><xsl:value-of select=\"'\\hbar '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0210F;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/hbar - Planck's over 2pi -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0210F;')\"><xsl:value-of select=\"'\\hslash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0210F;')\"/></xsl:call-template></xsl:when>\t<!--/hslash - variant Planck's over 2pi --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02111;')\"><xsl:value-of select=\"'\\Im '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02111;')\"/></xsl:call-template></xsl:when>\t\t<!--/Im - imaginary   -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02113;')\"><xsl:value-of select=\"'\\ell '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02113;')\"/></xsl:call-template></xsl:when>\t\t<!--/ell - cursive small l -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02118;')\"><xsl:value-of select=\"'\\wp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02118;')\"/></xsl:call-template></xsl:when>\t\t<!--/wp - Weierstrass p -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0211C;')\"><xsl:value-of select=\"'\\Re '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0211C;')\"/></xsl:call-template></xsl:when>\t\t<!--/Re - real -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02127;')\"><xsl:value-of select=\"'\\mho '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02127;')\"/></xsl:call-template></xsl:when>\t\t<!--/mho - conductance -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02135;')\"><xsl:value-of select=\"'\\aleph '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02135;')\"/></xsl:call-template></xsl:when>\t\t<!--/aleph aleph, Hebrew -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02136;')\"><xsl:value-of select=\"'\\beth '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02136;')\"/></xsl:call-template></xsl:when>\t\t<!--/beth - beth, Hebrew --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02137;')\"><xsl:value-of select=\"'\\gimel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02137;')\"/></xsl:call-template></xsl:when>\t\t<!--/gimel - gimel, Hebrew --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02138;')\"><xsl:value-of select=\"'\\daleth '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02138;')\"/></xsl:call-template></xsl:when>\t<!--/daleth - daleth, Hebrew --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02145;')\"><xsl:value-of select=\"'D'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02145;')\"/></xsl:call-template></xsl:when>\t\t<!--D for use in differentials, e.g., within integrals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02146;')\"><xsl:value-of select=\"'d'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02146;')\"/></xsl:call-template></xsl:when>\t\t<!--d for use in differentials, e.g., within integrals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02147;')\"><xsl:value-of select=\"'e'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02147;')\"/></xsl:call-template></xsl:when>\t\t<!--e use for the exponential base of the natural logarithms -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02148;')\"><xsl:value-of select=\"'i'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02148;')\"/></xsl:call-template></xsl:when>\t\t<!--i for use as a square root of -1 -->\r\n\r\n<!-- ====================================================================== -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02192;')\"><xsl:value-of select=\"'\\to '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02192;')\"/></xsl:call-template></xsl:when>\t\t<!--/rightarrow /to A: =rightward arrow -->\r\n\t\t\r\n<!-- ====================================================================== -->\r\n<!-- \tUnicode 3.2\r\n\tMathematical Operators\r\n\tRange: 2200-22FF\r\n\thttp://www.unicode.org/charts/PDF/U2200.pdf                         -->\r\n<!-- ====================================================================== -->\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02200;')\"><xsl:value-of select=\"'\\forall '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02200;')\"/></xsl:call-template></xsl:when>\t<!--/forall for all -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02201;')\"><xsl:value-of select=\"'\\complement '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02201;')\"/></xsl:call-template></xsl:when>\t<!--/complement - complement sign --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02202;')\"><xsl:value-of select=\"'\\partial '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02202;')\"/></xsl:call-template></xsl:when>\t<!--/partial partial differential -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02203;')\"><xsl:value-of select=\"'\\exists '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02203;')\"/></xsl:call-template></xsl:when>\t<!--/exists at least one exists -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02204;')\"><xsl:value-of select=\"'\\nexists '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02204;')\"/></xsl:call-template></xsl:when>\t<!--/nexists - negated exists --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02205;&#x0FE00;')\"><xsl:value-of select=\"'\\emptyset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02205;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/emptyset - zero, slash -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02205;')\"><xsl:value-of select=\"'\\varnothing '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02205;')\"/></xsl:call-template></xsl:when>\t<!--/varnothing - circle, slash --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02206;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02206;')\"/></xsl:call-template></xsl:when>-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02207;')\"><xsl:value-of select=\"'\\nabla '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02207;')\"/></xsl:call-template></xsl:when>\t\t<!--/nabla del, Hamilton operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02208;')\"><xsl:value-of select=\"'\\in '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02208;')\"/></xsl:call-template></xsl:when>\t\t<!--/in R: set membership  -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02209;')\"><xsl:value-of select=\"'\\notin '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02209;')\"/></xsl:call-template></xsl:when>\t\t<!--/notin N: negated set membership -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0220B;')\"><xsl:value-of select=\"'\\ni '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0220B;')\"/></xsl:call-template></xsl:when>\t\t<!--/ni /owns R: contains -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0220C;')\"><xsl:value-of select=\"'\\not\\ni '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0220C;')\"/></xsl:call-template></xsl:when>\t<!--negated contains -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0220F;')\"><xsl:value-of select=\"'\\prod '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0220F;')\"/></xsl:call-template></xsl:when>\t\t<!--/prod L: product operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02210;')\"><xsl:value-of select=\"'\\coprod '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02210;')\"/></xsl:call-template></xsl:when>\t<!--/coprod L: coproduct operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02211;')\"><xsl:value-of select=\"'\\sum '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02211;')\"/></xsl:call-template></xsl:when>\t\t<!--/sum L: summation operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02212;')\"><xsl:value-of select=\"'-'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02212;')\"/></xsl:call-template></xsl:when>\t\t<!--B: minus sign -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02213;')\"><xsl:value-of select=\"'\\mp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02213;')\"/></xsl:call-template></xsl:when>\t\t<!--/mp B: minus-or-plus sign -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02214;')\"><xsl:value-of select=\"'\\dotplus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02214;')\"/></xsl:call-template></xsl:when>\t<!--/dotplus B: plus sign, dot above --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02215;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02215;')\"/></xsl:call-template></xsl:when>-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02216;')\"><xsl:value-of select=\"'\\setminus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02216;')\"/></xsl:call-template></xsl:when>\t<!--/setminus B: reverse solidus -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02217;')\"><xsl:value-of select=\"'\\ast '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02217;')\"/></xsl:call-template></xsl:when>\t\t<!--low asterisk -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02218;')\"><xsl:value-of select=\"'\\circ '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02218;')\"/></xsl:call-template></xsl:when>\t\t<!--/circ B: composite function (small circle) -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02219;')\"><xsl:value-of select=\"'\\bullet '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02219;')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0221A;')\"><xsl:value-of select=\"'\\surd '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221A;')\"/></xsl:call-template></xsl:when>\t\t<!--/surd radical -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0221D;')\"><xsl:value-of select=\"'\\propto '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221D;')\"/></xsl:call-template></xsl:when>\t<!--/propto R: is proportional to -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0221E;')\"><xsl:value-of select=\"'\\infty '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221E;')\"/></xsl:call-template></xsl:when>\t\t<!--/infty infinity -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0221F;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221F;')\"/></xsl:call-template></xsl:when>\t\tright (90 degree) angle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02220;')\"><xsl:value-of select=\"'\\angle '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02220;')\"/></xsl:call-template></xsl:when>\t\t<!--/angle - angle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02221;')\"><xsl:value-of select=\"'\\measuredangle '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02221;')\"/></xsl:call-template></xsl:when>\t<!--/measuredangle - angle-measured -->\t<!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02222;')\"><xsl:value-of select=\"'\\sphericalangle '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02222;')\"/></xsl:call-template></xsl:when><!--/sphericalangle angle-spherical -->\t<!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02223;')\"><xsl:value-of select=\"'\\mid '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02223;')\"/></xsl:call-template></xsl:when>\t\t<!--/mid R: -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02224;&#x0FE00;')\"><xsl:value-of select=\"'\\nshortmid '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02224;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/nshortmid --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02224;')\"><xsl:value-of select=\"'\\nmid '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02224;')\"/></xsl:call-template></xsl:when>\t\t<!--/nmid --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02225;')\"><xsl:value-of select=\"'\\parallel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02225;')\"/></xsl:call-template></xsl:when>\t<!--/parallel R: parallel -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02226;&#x0FE00;')\"><xsl:value-of select=\"'\\nshortparallel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02226;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/nshortparallel N: not short par --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02226;')\"><xsl:value-of select=\"'\\nparallel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02226;')\"/></xsl:call-template></xsl:when>\t<!--/nparallel N: not parallel --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02227;')\"><xsl:value-of select=\"'\\wedge '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02227;')\"/></xsl:call-template></xsl:when>\t\t<!--/wedge /land B: logical and -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02228;')\"><xsl:value-of select=\"'\\vee '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02228;')\"/></xsl:call-template></xsl:when>\t\t<!--/vee /lor B: logical or -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02229;')\"><xsl:value-of select=\"'\\cap '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02229;')\"/></xsl:call-template></xsl:when>\t\t<!--/cap B: intersection -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222A;')\"><xsl:value-of select=\"'\\cup '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222A;')\"/></xsl:call-template></xsl:when>\t\t<!--/cup B: union or logical sum -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222B;')\"><xsl:value-of select=\"'\\int '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222B;')\"/></xsl:call-template></xsl:when>\t\t<!--/int L: integral operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222C;')\"><xsl:value-of select=\"'\\iint '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222C;')\"/></xsl:call-template></xsl:when>\t\t<!--double integral operator --> <!-- Required amsmath -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222D;')\"><xsl:value-of select=\"'\\iiint '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222D;')\"/></xsl:call-template></xsl:when>\t\t<!--/iiint triple integral operator -->\t<!-- Required amsmath -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222E;')\"><xsl:value-of select=\"'\\oint '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222E;')\"/></xsl:call-template></xsl:when>\t\t<!--/oint L: contour integral operator -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0222F;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222F;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02230;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02230;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02231;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02231;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02232;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02232;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02233;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02233;')\"/></xsl:call-template></xsl:when>-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02234;')\"><xsl:value-of select=\"'\\therefore '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02234;')\"/></xsl:call-template></xsl:when>\t<!--/therefore R: therefore --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02235;')\"><xsl:value-of select=\"'\\because '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02235;')\"/></xsl:call-template></xsl:when>\t<!--/because R: because --> <!-- Required amssymb -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02236;')\"><xsl:value-of select=\"':'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02236;')\"/></xsl:call-template></xsl:when>\t\t<!--/ratio -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02237;')\"><xsl:value-of select=\"'\\colon\\colon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02237;')\"/></xsl:call-template></xsl:when>\t<!--/Colon, two colons -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02238;')\"><xsl:value-of select=\"'\\dot{-}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02238;')\"/></xsl:call-template></xsl:when>\t\t<!--/dotminus B: minus sign, dot above -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02239;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02239;')\"/></xsl:call-template></xsl:when>\t\t-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223A;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223A;')\"/></xsl:call-template></xsl:when>\t\tminus with four dots, geometric properties -->\t\t\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223B;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223B;')\"/></xsl:call-template></xsl:when>\t\thomothetic -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0223C;')\"><xsl:value-of select=\"'\\sim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223C;')\"/></xsl:call-template></xsl:when>\t\t<!--/sim R: similar -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0223D;')\"><xsl:value-of select=\"'\\backsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223D;')\"/></xsl:call-template></xsl:when>\t<!--/backsim R: reverse similar --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223E;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223E;')\"/></xsl:call-template></xsl:when>\t\tmost positive -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223F;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223F;')\"/></xsl:call-template></xsl:when>\t\tac current -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02240;')\"><xsl:value-of select=\"'\\wr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02240;')\"/></xsl:call-template></xsl:when>\t\t<!--/wr B: wreath product -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02241;')\"><xsl:value-of select=\"'\\nsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02241;')\"/></xsl:call-template></xsl:when>\t\t<!--/nsim N: not similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02242;')\"><xsl:value-of select=\"'\\eqsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02242;')\"/></xsl:call-template></xsl:when>\t\t<!--/esim R: equals, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02243;')\"><xsl:value-of select=\"'\\simeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02243;')\"/></xsl:call-template></xsl:when>\t\t<!--/simeq R: similar, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02244;')\"><xsl:value-of select=\"'\\not\\simeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02244;')\"/></xsl:call-template></xsl:when>\t<!--/nsimeq N: not similar, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02245;')\"><xsl:value-of select=\"'\\cong '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02245;')\"/></xsl:call-template></xsl:when>\t\t<!--/cong R: congruent with -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02246;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02246;')\"/></xsl:call-template></xsl:when>\t\tsimilar, not equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02247;')\"><xsl:value-of select=\"'\\ncong '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02247;')\"/></xsl:call-template></xsl:when>\t\t<!--/ncong N: not congruent with --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02248;')\"><xsl:value-of select=\"'\\approx '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02248;')\"/></xsl:call-template></xsl:when>\t<!--/approx R: approximate -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02249;&#x00338;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02249;&#x00338;')\"/></xsl:call-template></xsl:when>\tnot, vert, approximate -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02249;')\"><xsl:value-of select=\"'\\not\\approx '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02249;')\"/></xsl:call-template></xsl:when>\t<!--/napprox N: not approximate -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224A;')\"><xsl:value-of select=\"'\\approxeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224A;')\"/></xsl:call-template></xsl:when>\t<!--/approxeq R: approximate, equals --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0224B;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224B;')\"/></xsl:call-template></xsl:when>\t\tapproximately identical to -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0224C;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224C;')\"/></xsl:call-template></xsl:when>\t\t/backcong R: reverse congruent -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224D;')\"><xsl:value-of select=\"'\\asymp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224D;')\"/></xsl:call-template></xsl:when>\t\t<!--/asymp R: asymptotically equal to -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224E;')\"><xsl:value-of select=\"'\\Bumpeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224E;')\"/></xsl:call-template></xsl:when>\t<!--/Bumpeq R: bumpy equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224F;')\"><xsl:value-of select=\"'\\bumpeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224F;')\"/></xsl:call-template></xsl:when>\t<!--/bumpeq R: bumpy equals, equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02250;')\"><xsl:value-of select=\"'\\doteq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02250;')\"/></xsl:call-template></xsl:when>\t\t<!--/doteq R: equals, single dot above -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02251;')\"><xsl:value-of select=\"'\\doteqdot '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02251;')\"/></xsl:call-template></xsl:when>\t<!--/doteqdot /Doteq R: eq, even dots --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02252;')\"><xsl:value-of select=\"'\\fallingdotseq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02252;')\"/></xsl:call-template></xsl:when>\t<!--/fallingdotseq R: eq, falling dots --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02253;')\"><xsl:value-of select=\"'\\risingdotseq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02253;')\"/></xsl:call-template></xsl:when>\t<!--/risingdotseq R: eq, rising dots --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02254;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02254;')\"/></xsl:call-template></xsl:when>\t\t/coloneq R: colon, equals -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02255;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02255;')\"/></xsl:call-template></xsl:when>\t\t/eqcolon R: equals, colon -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02256;')\"><xsl:value-of select=\"'\\eqcirc '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02256;')\"/></xsl:call-template></xsl:when>\t<!--/eqcirc R: circle on equals sign --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02257;')\"><xsl:value-of select=\"'\\circeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02257;')\"/></xsl:call-template></xsl:when>\t<!--/circeq R: circle, equals --> <!-- Required amssymb -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02258;')\"><xsl:value-of select=\"'\\stackrel{\\frown}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02258;')\"/></xsl:call-template></xsl:when>\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02259;')\"><xsl:value-of select=\"'\\stackrel{\\wedge}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02259;')\"/></xsl:call-template></xsl:when>\t<!--/wedgeq R: corresponds to (wedge, equals) -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225A;')\"><xsl:value-of select=\"'\\stackrel{\\vee}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225A;')\"/></xsl:call-template></xsl:when>\t<!--logical or, equals -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225B;')\"><xsl:value-of select=\"'\\stackrel{\\star}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225B;')\"/></xsl:call-template></xsl:when>\t<!--equal, asterisk above -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0225C;')\"><xsl:value-of select=\"'\\triangleq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225C;')\"/></xsl:call-template></xsl:when>\t<!--/triangleq R: triangle, equals --> <!-- Required amssymb -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225D;')\"><xsl:value-of select=\"'\\stackrel{\\scriptscriptstyle\\mathrm{def}}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225D;')\"/></xsl:call-template></xsl:when>\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225E;')\"><xsl:value-of select=\"'\\stackrel{\\scriptscriptstyle\\mathrm{m}}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225E;')\"/></xsl:call-template></xsl:when>\t\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225F;')\"><xsl:value-of select=\"'\\stackrel{?}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225F;')\"/></xsl:call-template></xsl:when>\t<!--/questeq R: equal with questionmark -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02260;&#x0FE00;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02260;&#x0FE00;')\"/></xsl:call-template></xsl:when>\tnot equal, dot -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02260;')\"><xsl:value-of select=\"'\\ne '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02260;')\"/></xsl:call-template></xsl:when>\t\t<!--/ne /neq R: not equal -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02261;&#x020E5;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02261;&#x020E5;')\"/></xsl:call-template></xsl:when>\treverse not equivalent -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02261;')\"><xsl:value-of select=\"'\\equiv '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02261;')\"/></xsl:call-template></xsl:when>\t\t<!--/equiv R: identical with -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02262;')\"><xsl:value-of select=\"'\\not\\equiv '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02262;')\"/></xsl:call-template></xsl:when>\t<!--/nequiv N: not identical with -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02263;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02263;')\"/></xsl:call-template></xsl:when>\t\t-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02264;')\"><xsl:value-of select=\"'\\le '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02264;')\"/></xsl:call-template></xsl:when>\t\t<!--/leq /le R: less-than-or-equal -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02265;')\"><xsl:value-of select=\"'\\ge '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02265;')\"/></xsl:call-template></xsl:when>\t\t<!--/geq /ge R: greater-than-or-equal -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02266;')\"><xsl:value-of select=\"'\\leqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02266;')\"/></xsl:call-template></xsl:when>\t\t<!--/leqq R: less, double equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02267;')\"><xsl:value-of select=\"'\\geqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02267;')\"/></xsl:call-template></xsl:when>\t\t<!--/geqq R: greater, double equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02268;')\"><xsl:value-of select=\"'\\lneqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02268;')\"/></xsl:call-template></xsl:when>\t\t<!--/lneqq N: less, not double equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02269;')\"><xsl:value-of select=\"'\\gneqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02269;')\"/></xsl:call-template></xsl:when>\t\t<!--/gneqq N: greater, not dbl equals --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226A;&#x00338;&#x0FE00;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226A;&#x00338;&#x0FE00;')\"/></xsl:call-template></xsl:when>\tnot much less than, variant -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226A;&#x00338;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226A;&#x00338;')\"/></xsl:call-template></xsl:when>\tnot, vert, much less than -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226A;')\"><xsl:value-of select=\"'\\ll '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226A;')\"/></xsl:call-template></xsl:when>\t\t<!--/ll R: double less-than sign -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226B;&#x00338;&#x0FE00;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226B;&#x00338;&#x0FE00;')\"/></xsl:call-template></xsl:when>\tnot much greater than, variant -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226B;&#x00338;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226B;&#x00338;')\"/></xsl:call-template></xsl:when>\tnot, vert, much greater than -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226B;')\"><xsl:value-of select=\"'\\gg '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226B;')\"/></xsl:call-template></xsl:when>\t\t<!--/gg R: dbl greater-than sign -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226C;')\"><xsl:value-of select=\"'\\between '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226C;')\"/></xsl:call-template></xsl:when>\t<!--/between R: between --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226D;')\"><xsl:value-of select=\"'\\not\\asymp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226D;')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226E;')\"><xsl:value-of select=\"'\\nless '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226E;')\"/></xsl:call-template></xsl:when>\t\t<!--/nless N: not less-than --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226F;')\"><xsl:value-of select=\"'\\ngtr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226F;')\"/></xsl:call-template></xsl:when>\t\t<!--/ngtr N: not greater-than --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02270;&#x020E5;')\"><xsl:value-of select=\"'\\nleq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02270;&#x020E5;')\"/></xsl:call-template></xsl:when>\t<!--/nleq N: not less-than-or-equal --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02270;')\"><xsl:value-of select=\"'\\nleqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02270;')\"/></xsl:call-template></xsl:when>\t\t<!--/nleqq N: not less, dbl equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02271;&#x020E5;')\"><xsl:value-of select=\"'\\ngeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02271;&#x020E5;')\"/></xsl:call-template></xsl:when>\t<!--/ngeq N: not greater-than-or-equal --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02271;')\"><xsl:value-of select=\"'\\ngeqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02271;')\"/></xsl:call-template></xsl:when>\t\t<!--/ngeqq N: not greater, dbl equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02272;')\"><xsl:value-of select=\"'\\lesssim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02272;')\"/></xsl:call-template></xsl:when>\t<!--/lesssim R: less, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02273;')\"><xsl:value-of select=\"'\\gtrsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02273;')\"/></xsl:call-template></xsl:when>\t<!--/gtrsim R: greater, similar --> <!-- Required amssymb -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02274;')\"><xsl:value-of select=\"'\\not\\lesssim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02274;')\"/></xsl:call-template></xsl:when>\t<!--not less, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02275;')\"><xsl:value-of select=\"'\\not\\gtrsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02275;')\"/></xsl:call-template></xsl:when>\t<!--not greater, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02276;')\"><xsl:value-of select=\"'\\lessgtr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02276;')\"/></xsl:call-template></xsl:when>\t<!--/lessgtr R: less, greater --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02277;')\"><xsl:value-of select=\"'\\gtrless '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02277;')\"/></xsl:call-template></xsl:when>\t<!--/gtrless R: greater, less --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02278;')\"><xsl:value-of select=\"'\\not\\lessgtr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02278;')\"/></xsl:call-template></xsl:when>\t<!--not less, greater --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02279;')\"><xsl:value-of select=\"'\\not\\gtrless '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02279;')\"/></xsl:call-template></xsl:when>\t<!--not greater, less --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227A;')\"><xsl:value-of select=\"'\\prec '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227A;')\"/></xsl:call-template></xsl:when>\t\t<!--/prec R: precedes -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227B;')\"><xsl:value-of select=\"'\\succ '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227B;')\"/></xsl:call-template></xsl:when>\t\t<!--/succ R: succeeds -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227C;')\"><xsl:value-of select=\"'\\preccurlyeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227C;')\"/></xsl:call-template></xsl:when>\t<!--/preccurlyeq R: precedes, curly eq --> <!-- Required amssymb -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227D;')\"><xsl:value-of select=\"'\\succcurlyeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227D;')\"/></xsl:call-template></xsl:when>\t<!--/succcurlyeq R: succeeds, curly eq --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227E;')\"><xsl:value-of select=\"'\\precsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227E;')\"/></xsl:call-template></xsl:when>\t<!--/precsim R: precedes, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227F;')\"><xsl:value-of select=\"'\\succsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227F;')\"/></xsl:call-template></xsl:when>\t<!--/succsim R: succeeds, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02280;')\"><xsl:value-of select=\"'\\nprec '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02280;')\"/></xsl:call-template></xsl:when>\t\t<!--/nprec N: not precedes --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02281;')\"><xsl:value-of select=\"'\\nsucc '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02281;')\"/></xsl:call-template></xsl:when>\t\t<!--/nsucc N: not succeeds --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02282;')\"><xsl:value-of select=\"'\\subset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02282;')\"/></xsl:call-template></xsl:when>\t<!--/subset R: subset or is implied by -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02283;')\"><xsl:value-of select=\"'\\supset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02283;')\"/></xsl:call-template></xsl:when>\t<!--/supset R: superset or implies -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02284;')\"><xsl:value-of select=\"'\\not\\subset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02284;')\"/></xsl:call-template></xsl:when>\t<!--not subset -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02285;')\"><xsl:value-of select=\"'\\not\\supset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02285;')\"/></xsl:call-template></xsl:when>\t<!--not superset -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02286;')\"><xsl:value-of select=\"'\\subseteq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02286;')\"/></xsl:call-template></xsl:when>\t<!--/subseteq R: subset, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02287;')\"><xsl:value-of select=\"'\\supseteq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02287;')\"/></xsl:call-template></xsl:when>\t<!--/supseteq R: superset, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0228E;')\"><xsl:value-of select=\"'\\uplus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0228E;')\"/></xsl:call-template></xsl:when>\t\t<!--/uplus B: plus sign in union -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02293;')\"><xsl:value-of select=\"'\\sqcap '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02293;')\"/></xsl:call-template></xsl:when>\t\t<!--/sqcap B: square intersection -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02294;')\"><xsl:value-of select=\"'\\bigsqcup '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02294;')\"/></xsl:call-template></xsl:when>\t\t<!--/sqcup B: square union -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02295;')\"><xsl:value-of select=\"'\\oplus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02295;')\"/></xsl:call-template></xsl:when>\t\t<!--/oplus B: plus sign in circle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02296;')\"><xsl:value-of select=\"'\\ominus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02296;')\"/></xsl:call-template></xsl:when>\t<!--/ominus B: minus sign in circle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02297;')\"><xsl:value-of select=\"'\\otimes '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02297;')\"/></xsl:call-template></xsl:when>\t<!--/otimes B: multiply sign in circle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02298;')\"><xsl:value-of select=\"'\\oslash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02298;')\"/></xsl:call-template></xsl:when>\t<!--/oslash B: solidus in circle -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02299;')\"><xsl:value-of select=\"'\\odot '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02299;')\"/></xsl:call-template></xsl:when>\t\t<!--/odot B: middle dot in circle --> <!--/bigodot L: circle dot operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0229F;')\"><xsl:value-of select=\"'\\boxminus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0229F;')\"/></xsl:call-template></xsl:when>\t<!--/boxminus B: minus sign in box --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A4;')\"><xsl:value-of select=\"'\\top '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A4;')\"/></xsl:call-template></xsl:when>\t\t<!--/top top -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A5;')\"><xsl:value-of select=\"'\\perp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A5;')\"/></xsl:call-template></xsl:when>\t\t<!--/perp R: perpendicular --><!--/bot bottom -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A6;')\"><xsl:value-of select=\"'\\vdash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A6;')\"/></xsl:call-template></xsl:when>\t\t<!--/vdash R: vertical, dash -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A7;')\"><xsl:value-of select=\"'\\vDash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A7;')\"/></xsl:call-template></xsl:when>\t\t<!--/vDash R: vertical, dbl dash --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A8;')\"><xsl:value-of select=\"'\\models '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A8;')\"/></xsl:call-template></xsl:when>\t<!--/models R: -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022AA;')\"><xsl:value-of select=\"'\\Vvdash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022AA;')\"/></xsl:call-template></xsl:when>\t<!--/Vvdash R: triple vertical, dash --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C0;')\"><xsl:value-of select=\"'\\bigwedge '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C0;')\"/></xsl:call-template></xsl:when>\t<!--/bigwedge L: logical or operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C1;')\"><xsl:value-of select=\"'\\bigvee '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C1;')\"/></xsl:call-template></xsl:when>\t<!--/bigcap L: intersection operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C2;')\"><xsl:value-of select=\"'\\bigcap '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C2;')\"/></xsl:call-template></xsl:when>\t<!--/bigvee L: logical and operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C3;')\"><xsl:value-of select=\"'\\bigcup '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C3;')\"/></xsl:call-template></xsl:when>\t<!--/bigcup L: union operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C4;')\"><xsl:value-of select=\"'\\diamond '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C4;')\"/></xsl:call-template></xsl:when>\t<!--/diamond B: open diamond -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C5;')\"><xsl:value-of select=\"'\\cdot '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C5;')\"/></xsl:call-template></xsl:when>\t\t<!--/cdot B: small middle dot -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C6;')\"><xsl:value-of select=\"'\\star '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C6;')\"/></xsl:call-template></xsl:when>\t\t<!--/star B: small star, filled -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C7;')\"><xsl:value-of select=\"'\\divideontimes '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C7;')\"/></xsl:call-template></xsl:when>\t<!--/divideontimes B: division on times --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C8;')\"><xsl:value-of select=\"'\\bowtie '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C8;')\"/></xsl:call-template></xsl:when>\t<!--/bowtie R: -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022CD;')\"><xsl:value-of select=\"'\\backsimeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022CD;')\"/></xsl:call-template></xsl:when>\t<!--/backsimeq R: reverse similar, eq --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022EF;')\"><xsl:value-of select=\"'\\cdots '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022EF;')\"/></xsl:call-template></xsl:when>\t\t<!--/cdots, three dots, centered -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x022F0;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022F0;')\"/></xsl:call-template></xsl:when>\t\tthree dots, ascending -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022F1;')\"><xsl:value-of select=\"'\\ddots '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022F1;')\"/></xsl:call-template></xsl:when>\t\t<!--/ddots, three dots, descending -->\r\n\r\n<!-- ====================================================================== -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x025A1;')\"><xsl:value-of select=\"'\\Box '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x025A1;')\"/></xsl:call-template></xsl:when>\t<!--/square, square --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x025AA;')\"><xsl:value-of select=\"'\\blacksquare '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x025AA;')\"/></xsl:call-template></xsl:when>\t<!--/blacksquare, square, filled  --> <!-- Required amssymb -->\r\n\t\t\r\n\t\t<xsl:when test='starts-with($content,\"&apos;\")'><xsl:value-of select='\"\\text{&apos;}\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select='substring-after($content, \"&apos;\")'/></xsl:call-template></xsl:when><!-- \\text required amslatex -->\r\n\t\t<xsl:when test='starts-with($content,\"(\")'><xsl:value-of select='\"\\left(\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '(')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\")\")'><xsl:value-of select='\"\\right)\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, ')')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"[\")'><xsl:value-of select='\"\\left[\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '[')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"]\")'><xsl:value-of select='\"\\right]\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, ']')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"{\")'><xsl:value-of select='\"\\left\\{\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '{')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"}\")'><xsl:value-of select='\"\\right\\}\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '}')\"/></xsl:call-template></xsl:when>\r\n\t\t\r\n\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:value-of select=\"substring($content,1,1)\"/>\r\n\t\t\t<xsl:call-template name=\"replaceEntities\">\r\n\t\t\t\t<xsl:with-param name=\"content\" select=\"substring($content, 2)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose></xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"replaceMtextEntities\">\r\n\t<xsl:param name=\"content\"/>\r\n\t<xsl:choose>\r\n\t<xsl:when test=\"contains($content,'&#x02009;&#x0200A;&#x0200A;')\">\t<!-- ThickSpace - space of width 5/18 em -->\r\n\t\t<xsl:call-template name=\"replaceMtextEntities\">\r\n\t\t\t<xsl:with-param name=\"content\" select=\"concat(substring-before($content,'&#x02009;&#x0200A;&#x0200A;'),'\\hspace{0.28em}',substring-after($content,'&#x02009;&#x0200A;&#x0200A;'))\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:when>\r\n\t<xsl:when test=\"contains($content,'&#x02009;')\">\t<!-- ThinSpace - space of width 3/18 em -->\r\n\t\t<xsl:call-template name=\"replaceMtextEntities\">\r\n\t\t\t<xsl:with-param name=\"content\" select=\"concat(substring-before($content,'&#x02009;'),'\\hspace{0.17em}',substring-after($content,'&#x02009;'))\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:when>\r\n\t<xsl:otherwise>\r\n\t\t<xsl:value-of select=\"normalize-space($content)\"/>\r\n\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<!--xsl:include href=\"cmarkup.xsl\"/-->\r\n<!-- 4.4.1.1 cn -->\r\n<xsl:template match=\"m:cn\"><xsl:apply-templates/></xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='complex-cartesian']\">\r\n\t<xsl:apply-templates select=\"text()[1]\"/>\r\n  \t<xsl:text>+</xsl:text>\r\n\t<xsl:apply-templates select=\"text()[2]\"/>\r\n\t<xsl:text>i</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='rational']\">\r\n\t<xsl:apply-templates select=\"text()[1]\"/>\r\n\t<xsl:text>/</xsl:text>\r\n\t<xsl:apply-templates select=\"text()[2]\"/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='integer' and @base!=10]\">\r\n\t\t<xsl:apply-templates/>\r\n\t\t<xsl:text>_{</xsl:text><xsl:value-of select=\"@base\"/><xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='complex-polar']\">\r\n\t<xsl:apply-templates select=\"text()[1]\"/>\r\n\t<xsl:text>e^{i </xsl:text>\r\n\t<xsl:apply-templates select=\"text()[2]\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='e-notation']\">\r\n    <xsl:apply-templates select=\"text()[1]\"/>\r\n    <xsl:text>E</xsl:text>\r\n    <xsl:apply-templates select=\"text()[2]\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.1.1 ci 4.4.1.2 csymbol -->\r\n<xsl:template match=\"m:ci | m:csymbol\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"string-length(normalize-space(text()))>1\">\r\n\t\t\t<xsl:text>\\mathrm{</xsl:text><xsl:apply-templates/><xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:apply-templates/></xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.1 apply 4.4.2.2 reln -->\r\n<xsl:template match=\"m:apply | m:reln\">\r\n\t<xsl:apply-templates select=\"*[1]\">\r\n\t<!-- <? -->\r\n\t\t<xsl:with-param name=\"p\" select=\"10\"/>\r\n\t</xsl:apply-templates>\r\n\t<!-- ?> -->\r\n \t<xsl:text>(</xsl:text>\r\n\t<xsl:for-each select=\"*[position()>1]\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"not(position()=last())\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n \t<xsl:text>)</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.3 fn -->\r\n<xsl:template match=\"m:fn[m:apply[1]]\"> <!-- for m:fn using default rule -->\r\n\t<xsl:text>(</xsl:text><xsl:apply-templates/><xsl:text>)</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.4 interval -->\r\n<xsl:template match=\"m:interval[*[2]]\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@closure='open' or @closure='open-closed'\">\r\n\t\t\t<xsl:text>\\left(</xsl:text>\t\t\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\left[</xsl:text></xsl:otherwise> \r\n\t</xsl:choose>\r\n\t<xsl:apply-templates select=\"*[1]\"/>\r\n\t<xsl:text> , </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@closure='open' or @closure='closed-open'\">\r\n\t\t\t<xsl:text>\\right)</xsl:text>\t\t\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\right]</xsl:text></xsl:otherwise> \r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:interval\">\r\n\t<xsl:text>\\left\\{</xsl:text><xsl:apply-templates/><xsl:text>\\right\\}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.5 inverse -->\r\n<xsl:template match=\"m:apply[*[1][self::m:inverse]]\">\r\n\t<xsl:apply-templates select=\"*[2]\"/><xsl:text>^{(-1)}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.6 sep 4.4.2.7 condition -->\r\n<xsl:template match=\"m:sep | m:condition\"><xsl:apply-templates/></xsl:template>\r\n\r\n<!-- 4.4.2.9 lambda -->\r\n<xsl:template match=\"m:lambda\">\r\n\t<xsl:text>\\mathrm{lambda}\\: </xsl:text>\r\n  \t<xsl:apply-templates select=\"m:bvar/*\"/>\r\n  \t<xsl:text>.\\: </xsl:text>\r\n  <xsl:apply-templates select=\"*[last()]\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.10 compose -->\r\n<xsl:template match=\"m:apply[*[1][self::m:compose]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\circ </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.11 ident -->\r\n<xsl:template match=\"m:ident\"><xsl:text>\\mathrm{id}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.2.12 domain 4.4.2.13 codomain 4.4.2.14 image 4.4.3.21 arg 4.4.3.24 lcm\r\n\t\t4.4.5.9 grad 4.4.5.10 curl 4.4.9.4 median 4.4.9.5 mode-->\r\n<xsl:template match=\"m:domain | m:codomain | m:image | m:arg | m:lcm | m:grad |\r\n\t\t\t\t\t\t\t\t m:curl | m:median | m:mode\">\r\n\t<xsl:text>\\mathop{\\mathrm{</xsl:text>\r\n\t<xsl:value-of select=\"local-name()\"/>\r\n\t<xsl:text>}}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.15 domainofapplication -->\r\n<xsl:template match=\"m:domainofapplication\"/>\r\n\r\n<!-- 4.4.2.16 piecewise -->\r\n<xsl:template match=\"m:piecewise\">\r\n\t<xsl:text>\\begin{cases}</xsl:text>\r\n\t<xsl:apply-templates select=\"m:piece\"/>\r\n\t<xsl:apply-templates select=\"m:otherwise\"/>\r\n\t<xsl:text>\\end{cases}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:piece\">\r\n\t\t<xsl:apply-templates select=\"*[1]\"/>\r\n\t\t<xsl:text> &amp; \\text{if $</xsl:text>\r\n\t\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t\t<xsl:text>$}</xsl:text>\r\n\t\t<xsl:if test=\"not(position()=last()) or ../m:otherwise\"><xsl:text>\\\\ </xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:otherwise\">\r\n\t<xsl:apply-templates select=\"*[1]\"/>\r\n\t<xsl:text> &amp; \\text{otherwise}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.1 quotient -->\r\n<xsl:template match=\"m:apply[*[1][self::m:quotient]]\">\r\n\t<xsl:text>\\left\\lfloor\\frac{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>}{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\"/>\r\n\t<xsl:text>}\\right\\rfloor </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.2 factorial -->\r\n<xsl:template match=\"m:apply[*[1][self::m:factorial]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>!</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.3 divide -->\r\n<xsl:template match=\"m:apply[*[1][self::m:divide]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"this-p\" select=\"3\"/>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>\\left(</xsl:text></xsl:if>\r\n  <xsl:text>\\frac{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n<!--\t\t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>-->\r\n\t<xsl:text>}{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\"/>\r\n<!--    \t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>-->\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:if test=\"$this-p &lt; $p\"><xsl:text>\\right)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.4 max min -->\r\n<xsl:template match=\"m:apply[*[1][self::m:max or self::m:min]]\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text>\\{</xsl:text>\r\n   <xsl:choose>\r\n\t\t<xsl:when test=\"m:condition\">\r\n   \t\t<xsl:apply-templates select=\"*[last()]\"/>\r\n   \t\t<xsl:text>, </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:condition/node()\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:for-each select=\"*[position() &gt; 1]\">\r\n\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t<xsl:if test=\"position() !=last()\"><xsl:text> , </xsl:text></xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:otherwise>\r\n   </xsl:choose>\r\n\t<xsl:text>\\}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.5  minus-->\r\n<xsl:template match=\"m:apply[*[1][self::m:minus] and count(*)=2]\">\r\n\t<xsl:text>-</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:minus] and count(*)&gt;2]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">-</xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.6  plus-->\r\n<xsl:template match=\"m:apply[*[1][self::m:plus]]\">\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:if test=\"$p &gt; 2\">\r\n\t\t<xsl:text>(</xsl:text>\r\n\t</xsl:if>\r\n  <xsl:for-each select=\"*[position()&gt;1]\">\r\n   <xsl:if test=\"position() &gt; 1\">\r\n    <xsl:choose>\r\n      <xsl:when test=\"self::m:apply[*[1][self::m:times] and\r\n      *[2][self::m:apply/*[1][self::m:minus] or self::m:cn[not(m:sep) and\r\n      (number(.) &lt; 0)]]]\">-</xsl:when>\r\n      <xsl:otherwise>+</xsl:otherwise>\r\n    </xsl:choose>\r\n   </xsl:if>   \r\n    <xsl:choose>\r\n      <xsl:when test=\"self::m:apply[*[1][self::m:times] and\r\n      *[2][self::m:cn[not(m:sep) and (number(.) &lt;0)]]]\">\r\n\t\t\t<xsl:value-of select=\"-(*[2])\"/>\r\n\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t     <xsl:with-param name=\"first\" select=\"2\"/>\r\n\t\t     <xsl:with-param name=\"p\" select=\"2\"/>\r\n\t\t   </xsl:apply-templates>\r\n       </xsl:when>\r\n      <xsl:when test=\"self::m:apply[*[1][self::m:times] and\r\n      *[2][self::m:apply/*[1][self::m:minus]]]\">\r\n\t\t\t\t<xsl:apply-templates select=\"./*[2]/*[2]\"/>\r\n\t\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t\t\t<xsl:with-param name=\"first\" select=\"2\"/>\r\n\t\t\t\t\t<xsl:with-param name=\"p\" select=\"2\"/>\r\n\t\t\t\t</xsl:apply-templates>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:otherwise>\r\n\t\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t\t\t<xsl:with-param name=\"p\" select=\"2\"/>\r\n\t\t\t\t</xsl:apply-templates>\r\n\t\t\t</xsl:otherwise>\r\n\t\t</xsl:choose>\r\n\t</xsl:for-each>\r\n\t<xsl:if test=\"$p &gt; 2\">\r\n\t\t<xsl:text>)</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.7 power -->\r\n<xsl:template match=\"m:apply[*[1][self::m:power]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>^{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.8 remainder -->\r\n<xsl:template match=\"m:apply[*[1][self::m:rem]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\mod </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.9  times-->\r\n<xsl:template match=\"m:apply[*[1][self::m:times]]\" name=\"times\">\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"first\" select=\"1\"/>\r\n  <xsl:if test=\"$p &gt; 3\"><xsl:text>(</xsl:text></xsl:if>\r\n  <xsl:for-each select=\"*[position()&gt;1]\">\r\n\t\t<xsl:if test=\"position() &gt; 1\">\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"self::m:cn\">\\times <!-- times --></xsl:when>\r\n\t\t\t\t<xsl:otherwise><!--invisible times--></xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t</xsl:if> \r\n\t\t<xsl:if test=\"position()&gt;= $first\">\r\n\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t\t<xsl:with-param name=\"p\" select=\"3\"/>\r\n\t\t\t</xsl:apply-templates>\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n  <xsl:if test=\"$p &gt; 3\"><xsl:text>)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.10 root -->\r\n<xsl:template match=\"m:apply[*[1][self::m:root]]\">\r\n\t<xsl:text>\\sqrt</xsl:text>\r\n\t<xsl:if test=\"m:degree!=2\">\r\n\t\t<xsl:text>[</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:degree/*\"/>\r\n\t\t<xsl:text>]</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[position()&gt;1 and not(self::m:degree)]\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.11 gcd -->\r\n<xsl:template match=\"m:gcd\"><xsl:text>\\gcd </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.3.12 and -->\r\n<xsl:template match=\"m:apply[*[1][self::m:and]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\land <!-- and --></xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.13 or -->\r\n<xsl:template match=\"m:apply[*[1][self::m:or]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\lor </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.14 xor -->\r\n<xsl:template match=\"m:apply[*[1][self::m:xor]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\mathop{\\mathrm{xor}}</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.15 not -->\r\n<xsl:template match=\"m:apply[*[1][self::m:not]]\">\r\n\t<xsl:text>\\neg </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.16 implies -->\r\n<xsl:template match=\"m:apply[*[1][self::m:implies]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\implies </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.17 forall 4.4.3.18 exists -->\r\n<xsl:template match=\"m:apply[*[1][self::m:forall or self::m:exists]]\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"m:bvar\"/>\r\n\t<xsl:if test=\"m:condition\">\r\n\t\t<xsl:text>, </xsl:text><xsl:apply-templates select=\"m:condition\"/>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"*[last()][local-name()!='condition'][local-name()!='bvar']\">\r\n\t\t<xsl:text>\\colon </xsl:text>\r\n\t  <xsl:apply-templates select=\"*[last()]\"/>\r\n  </xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.19 abs -->\r\n<xsl:template match=\"m:apply[*[1][self::m:abs]]\">\r\n\t<xsl:text>\\left|</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>\\right|</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.20 conjugate -->\r\n<xsl:template match=\"m:apply[*[1][self::m:conjugate]]\">\r\n\t<xsl:text>\\overline{</xsl:text><xsl:apply-templates select=\"*[2]\"/><xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.22 real -->\r\n<xsl:template match=\"m:real\"><xsl:text>\\Re </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.3.23 imaginary -->\r\n<xsl:template match=\"m:imaginary\"><xsl:text>\\Im </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.3.25 floor -->\r\n<xsl:template match=\"m:apply[*[1][self::m:floor]]\">\r\n\t<xsl:text>\\lfloor </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>\\rfloor </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.25 ceiling -->\r\n<xsl:template match=\"m:apply[*[1][self::m:ceiling]]\">\r\n\t<xsl:text>\\lceil </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>\\rceil </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.1 eq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:eq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">=</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.2 neq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:neq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\neq </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.3 gt -->\r\n<xsl:template match=\"m:apply[*[1][self::m:gt]]\">\r\n<xsl:param name=\"p\" select=\"0\"/>\r\n<xsl:call-template name=\"infix\">\r\n\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t<xsl:with-param name=\"mo\">&gt; </xsl:with-param>\r\n</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.4 lt -->\r\n<xsl:template match=\"m:apply[*[1][self::m:lt]]\">\r\n<xsl:param name=\"p\" select=\"0\"/>\r\n<xsl:call-template name=\"infix\">\r\n\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t<xsl:with-param name=\"mo\">&lt; </xsl:with-param>\r\n</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.5 geq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:geq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\ge </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.6 leq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:leq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\le </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.7 equivalent -->\r\n<xsl:template match=\"m:apply[*[1][self::m:equivalent]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\equiv </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.8 approx -->\r\n<xsl:template match=\"m:apply[*[1][self::m:approx]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\approx </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.9 factorof -->\r\n<xsl:template match=\"m:apply[*[1][self::m:factorof]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\"> | </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.1 int -->\r\n<xsl:template match=\"m:apply[*[1][self::m:int]]\">\r\n\t<xsl:text>\\int</xsl:text>\r\n\t<xsl:if test=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\">\r\n\t\t<xsl:text>_{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"m:uplimit/*|m:interval/*[2]\">\r\n\t\t<xsl:text>^{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:uplimit/*|m:interval/*[2]\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t<xsl:text>\\,d </xsl:text>\r\n\t<xsl:apply-templates select=\"m:bvar\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.2 diff -->\r\n<xsl:template match=\"m:apply[*[1][self::m:diff] and m:ci and count(*)=2]\" priority=\"2\">\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>^\\prime </xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:diff]]\" priority=\"1\">\r\n\t<xsl:text>\\frac{</xsl:text>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"m:bvar/m:degree\">\r\n\t\t\t<xsl:text>d^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar/m:degree/node()\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t\t\t<xsl:text>}{d</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar/node()\"/>\r\n\t\t\t<xsl:text>^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar/m:degree/node()\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>d </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t\t\t<xsl:text>}{d </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.3 partialdiff -->\r\n<xsl:template match=\"m:apply[*[1][self::m:partialdiff] and m:list and m:ci and count(*)=3]\" priority=\"2\">\r\n\t<xsl:text>D_{</xsl:text>\r\n\t<xsl:for-each select=\"m:list[1]/*\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position()&lt;last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\"/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:partialdiff]]\" priority=\"1\">\r\n\t<xsl:text>\\frac{\\partial^{</xsl:text>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"m:degree\">\r\n\t\t\t<xsl:apply-templates select=\"m:degree/node()\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"m:bvar/m:degree[string(number(.))='NaN']\">\r\n\t\t\t<xsl:for-each select=\"m:bvar/m:degree\">\r\n\t\t\t\t<xsl:apply-templates select=\"node()\"/>\r\n\t\t\t\t<xsl:if test=\"position()&lt;last()\"><xsl:text>+</xsl:text></xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t\t<xsl:if test=\"count(m:bvar[not(m:degree)])&gt;0\">\r\n\t\t\t\t<xsl:text>+</xsl:text>\r\n\t\t\t\t<xsl:value-of select=\"count(m:bvar[not(m:degree)])\"/>\r\n\t\t\t</xsl:if>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:value-of select=\"sum(m:bvar/m:degree)+count(m:bvar[not(m:degree)])\"/>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t<xsl:text>}{</xsl:text>\r\n\t<xsl:for-each select=\"m:bvar\">\r\n\t\t<xsl:text>\\partial </xsl:text>\r\n\t\t<xsl:apply-templates select=\"node()\"/>\r\n\t\t<xsl:if test=\"m:degree\">\r\n\t\t\t<xsl:text>^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:degree/node()\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.8 declare 4.4.5.4 lowlimit 4.4.5.5 uplimit 4.4.5.7 degree 4.4.9.5 momentabout -->\r\n<xsl:template match=\"m:declare | m:lowlimit | m:uplimit | m:degree | m:momentabout\"/>\r\n\r\n<!-- 4.4.5.6  bvar-->\r\n<xsl:template match=\"m:bvar\">\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"following-sibling::m:bvar\"><xsl:text>, </xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.8 divergence-->\r\n<xsl:template match=\"m:divergence\"><xsl:text>\\mathop{\\mathrm{div}}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.5.11 laplacian-->\r\n<xsl:template match=\"m:laplacian\"><xsl:text>\\nabla^2 </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.6.1 set -->\r\n<xsl:template match=\"m:set\">\r\n\t<xsl:text>\\{</xsl:text><xsl:call-template name=\"set\"/><xsl:text>\\}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.2 list -->\r\n<xsl:template match=\"m:list\">\r\n\t<xsl:text>\\left[</xsl:text><xsl:call-template name=\"set\"/><xsl:text>\\right]</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"set\">\r\n   <xsl:choose>\r\n\t\t<xsl:when test=\"m:condition\">\r\n   \t\t<xsl:apply-templates select=\"m:bvar/*[not(self::bvar or self::condition)]\"/>\r\n   \t\t<xsl:text>\\colon </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:condition/node()\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:for-each select=\"*\">\r\n\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t<xsl:if test=\"position()!=last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:otherwise>\r\n   </xsl:choose>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.3 union -->\r\n<xsl:template match=\"m:apply[*[1][self::m:union]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\cup </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.4 intersect -->\r\n<xsl:template match=\"m:apply[*[1][self::m:intersect]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\cap </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.5 in -->\r\n<xsl:template match=\"m:apply[*[1][self::m:in]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\in </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.5 notin -->\r\n<xsl:template match=\"m:apply[*[1][self::m:notin]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\notin </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.7 subset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:subset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\subseteq </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.8 prsubset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:prsubset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\subset </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.9 notsubset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:notsubset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\nsubseteq </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.10 notprsubset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:notprsubset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\not\\subset </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.11 setdiff -->\r\n<xsl:template match=\"m:apply[*[1][self::m:setdiff]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\setminus </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.12 card -->\r\n<xsl:template match=\"m:apply[*[1][self::m:card]]\">\r\n\t<xsl:text>|</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>|</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.13 cartesianproduct 4.4.10.6 vectorproduct -->\r\n<xsl:template match=\"m:apply[*[1][self::m:cartesianproduct or self::m:vectorproduct]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\times </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<xsl:template\r\nmatch=\"m:apply[*[1][self::m:cartesianproduct][count(following-sibling::m:reals)=count(following-sibling::*)]]\"\r\npriority=\"2\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>^{</xsl:text>\r\n\t<xsl:value-of select=\"count(*)-1\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.1 sum -->\r\n<xsl:template match=\"m:apply[*[1][self::m:sum]]\">\r\n\t<xsl:text>\\sum</xsl:text><xsl:call-template name=\"series\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.2 product -->\r\n<xsl:template match=\"m:apply[*[1][self::m:product]]\">\r\n\t<xsl:text>\\prod</xsl:text><xsl:call-template name=\"series\"/>\r\n</xsl:template>\r\n\t\r\n<xsl:template name=\"series\">\r\n\t<xsl:if test=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\">\r\n\t\t<xsl:text>_{</xsl:text>\r\n\t\t<xsl:if test=\"not(m:condition)\">\r\n\t\t\t<xsl:apply-templates select=\"m:bvar\"/>\r\n\t\t\t<xsl:text>=</xsl:text>\r\n\t\t</xsl:if>\r\n\t\t<xsl:apply-templates select=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"m:uplimit/*|m:interval/*[2]\">\r\n\t\t<xsl:text>^{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:uplimit/*|m:interval/*[2]\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.3 limit -->\r\n<xsl:template match=\"m:apply[*[1][self::m:limit]]\">\r\n\t<xsl:text>\\lim_{</xsl:text>\r\n\t<xsl:apply-templates select=\"m:lowlimit|m:condition/*\"/>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[m:limit]/m:lowlimit\" priority=\"3\">\r\n\t<xsl:apply-templates select=\"../m:bvar/node()\"/>\r\n\t<xsl:text>\\to </xsl:text>\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.4 tendsto -->\r\n<xsl:template match=\"m:apply[*[1][self::m:tendsto]]\">\r\n\t<xsl:param name=\"p\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"@type='above'\">\\searrow </xsl:when>\r\n\t\t\t\t<xsl:when test=\"@type='below'\">\\nearrow </xsl:when>\r\n\t\t\t\t<xsl:when test=\"@type='two-sided'\">\\rightarrow </xsl:when>\r\n\t\t\t\t<xsl:otherwise>\\to </xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.8.1 common tringonometric functions 4.4.8.3 natural logarithm -->\r\n<xsl:template match=\"m:apply[*[1][\r\n self::m:sin or \t\tself::m:cos or \tself::m:tan or\t\tself::m:sec or\r\n self::m:csc or \t\tself::m:cot or \tself::m:sinh or\t \tself::m:cosh or\r\n self::m:tanh or \t\tself::m:coth or\tself::m:arcsin or \tself::m:arccos or\r\n self::m:arctan or \tself::m:ln]]\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:sin | m:cos | m:tan | m:sec | m:csc |\r\n\t\t\t\t\t\t\t\t m:cot | m:sinh | m:cosh | m:tanh | m:coth |\r\n\t\t\t\t\t\t\t\t m:arcsin | m:arccos | m:arctan | m:ln\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(.)\"/>\r\n\t<xsl:text> </xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][\r\n self::m:sech or \t\tself::m:csch or\t\tself::m:arccosh or\r\n self::m:arccot or \tself::m:arccoth or \tself::m:arccsc or\r\n self::m:arccsch or self::m:arcsec or \tself::m:arcsech or\r\n self::m:arcsinh or self::m:arctanh]]\">\r\n\t<xsl:text>\\mathrm{</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text>\\,}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:sech | m:csch | m:arccosh | m:arccot |\r\n\t\t\t\t\t\t\t\t m:arccoth | m:arccsc |m:arccsch |m:arcsec |\r\n\t\t\t\t\t\t\t\t m:arcsech | m:arcsinh | m:arctanh\">\r\n\t<xsl:text>\\mathrm{</xsl:text>\r\n\t<xsl:value-of select=\"local-name(.)\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.8.2 exp -->\r\n<xsl:template match=\"m:apply[*[1][self::m:exp]]\">\r\n\t<xsl:text>e^{</xsl:text><xsl:apply-templates select=\"*[2]\"/><xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.8.4 log -->\r\n<xsl:template match=\"m:apply[*[1][self::m:log]]\">\r\n\t<xsl:text>\\lg </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:log] and m:logbase != 10]\">\r\n\t<xsl:text>\\log_{</xsl:text>\r\n\t<xsl:apply-templates select=\"m:logbase/node()\"/>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<!-- 4.4.9.1 mean -->\r\n<xsl:template match=\"m:apply[*[1][self::m:mean]]\">\r\n\t<xsl:text>\\langle </xsl:text>\r\n\t<xsl:for-each select=\"*[position()&gt;1]\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position() !=last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>\\rangle </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.9.2 sdef -->\r\n<xsl:template match=\"m:sdev\"><xsl:text>\\sigma </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.9.3 variance -->\r\n<xsl:template match=\"m:apply[*[1][self::m:variance]]\">\r\n\t<xsl:text>\\sigma(</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>)^2</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.9.5 moment -->\r\n<xsl:template match=\"m:apply[*[1][self::m:moment]]\">\r\n\t<xsl:text>\\langle </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t<xsl:text>^{</xsl:text>\r\n\t<xsl:apply-templates select=\"m:degree/node()\"/>\r\n\t<xsl:text>}\\rangle</xsl:text>\r\n\t<xsl:if test=\"m:momentabout\">\r\n\t\t<xsl:text>_{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:momentabout/node()\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text> </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.1 vector  -->\r\n<xsl:template match=\"m:vector\">\r\n\t<xsl:text>\\left(\\begin{array}{c}</xsl:text>\r\n\t<xsl:for-each select=\"*\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position()!=last()\"><xsl:text>\\\\ </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>\\end{array}\\right)</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.2 matrix  -->\r\n<xsl:template match=\"m:matrix\">\r\n\t<xsl:text>\\begin{pmatrix}</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>\\end{pmatrix}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.3 matrixrow  -->\r\n<xsl:template match=\"m:matrixrow\">\r\n\t<xsl:for-each select=\"*\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position()!=last()\"><xsl:text> &amp; </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:if test=\"position()!=last()\"><xsl:text>\\\\ </xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.4 determinant  -->\r\n<xsl:template match=\"m:apply[*[1][self::m:determinant]]\">\r\n\t<xsl:text>\\det </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:determinant]][*[2][self::m:matrix]]\" priority=\"2\">\r\n\t<xsl:text>\\begin{vmatrix}</xsl:text>\r\n\t<xsl:apply-templates select=\"m:matrix/*\"/>\r\n\t<xsl:text>\\end{vmatrix}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.5 transpose -->\r\n<xsl:template match=\"m:apply[*[1][self::m:transpose]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>^T</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.5 selector -->\r\n<xsl:template match=\"m:apply[*[1][self::m:selector]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>_{</xsl:text>\r\n\t<xsl:for-each select=\"*[position()&gt;2]\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position() !=last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.7 scalarproduct 4.4.10.8 outerproduct -->\r\n<xsl:template match=\"m:apply[*[1][self::m:scalarproduct or self::m:outerproduct]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\dot </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.11.2 semantics -->\r\n<xsl:template match=\"m:semantics\"><xsl:apply-templates select=\"*[1]\"/></xsl:template>\r\n\r\n<xsl:template match=\"m:semantics[m:annotation/@encoding='TeX']\">\r\n\t<xsl:apply-templates select=\"m:annotation[@encoding='TeX']/node()\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.12.1 integers -->\r\n<xsl:template match=\"m:integers\"><xsl:text>\\mathbb{Z}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.2 reals -->\r\n<xsl:template match=\"m:reals\"><xsl:text>\\mathbb{R}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.3 rationals -->\r\n<xsl:template match=\"m:rationals\"><xsl:text>\\mathbb{Q}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.4 naturalnumbers -->\r\n<xsl:template match=\"m:naturalnumbers\"><xsl:text>\\mathbb{N}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.5 complexes -->\r\n<xsl:template match=\"m:complexes\"><xsl:text>\\mathbb{C}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.6 primes -->\r\n<xsl:template match=\"m:primes\"><xsl:text>\\mathbb{P}</xsl:text></xsl:template>\r\n\t\r\n<!-- 4.4.12.7 exponentiale -->\r\n<xsl:template match=\"m:exponentiale\"><xsl:text>e</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.8 imaginaryi -->\r\n<xsl:template match=\"m:imaginaryi\"><xsl:text>i</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.9 notanumber -->\r\n<xsl:template match=\"m:notanumber\"><xsl:text>NaN</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.10 true -->\r\n<xsl:template match=\"m:true\"><xsl:text>\\mbox{true}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.11 false -->\r\n<xsl:template match=\"m:false\"><xsl:text>\\mbox{false}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.12 emptyset -->\r\n<xsl:template match=\"m:emptyset\"><xsl:text>\\emptyset </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.13 pi -->\r\n<xsl:template match=\"m:pi\"><xsl:text>\\pi </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.14 eulergamma -->\r\n<xsl:template match=\"m:eulergamma\"><xsl:text>\\gamma </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.15 infinity -->\r\n<xsl:template match=\"m:infinity\"><xsl:text>\\infty </xsl:text></xsl:template>\r\n\r\n<!-- ****************************** -->\r\n<xsl:template name=\"infix\" >\r\n  <xsl:param name=\"mo\"/>\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"this-p\" select=\"0\"/>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>(</xsl:text></xsl:if>\r\n  <xsl:for-each select=\"*[position()&gt;1]\">\r\n\t\t<xsl:if test=\"position() &gt; 1\">\r\n\t\t\t<xsl:copy-of select=\"$mo\"/>\r\n\t\t</xsl:if>   \r\n\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t\t</xsl:apply-templates>\r\n\t</xsl:for-each>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"binary\" >\r\n  <xsl:param name=\"mo\"/>\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"this-p\" select=\"0\"/>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>(</xsl:text></xsl:if>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:value-of select=\"$mo\"/>\r\n\t<xsl:apply-templates select=\"*[3]\">\r\n    \t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:if test=\"$this-p &lt; $p\"><xsl:text>)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- Note: variables colora (template color) and symbola (template startspace) only for Sablotron -->\r\n\r\n<xsl:template name=\"startspace\">\r\n\t<xsl:param name=\"symbol\"/>\r\n\t<xsl:if test=\"contains($symbol,' ')\">\r\n\t\t<xsl:variable name=\"symbola\" select=\"concat(substring-before($symbol,' '),substring-after($symbol,' '))\"/>\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"$symbola\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"not(contains($symbol,' '))\">\r\n\t\t<xsl:value-of select=\"$symbol\"/>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:strip-space elements=\"m:*\"/>\r\n\r\n<xsl:template match=\"m:math\">\r\n\t<xsl:text>&#x00024;</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>&#x00024;</xsl:text>\r\n</xsl:template>\r\n\r\n</xsl:stylesheet>\r\n";
    //var xsltMathml = "<?xml version='1.0' encoding=\"UTF-8\"?>\r\n<xsl:stylesheet xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\"\r\n\t\txmlns:m=\"http://www.w3.org/1998/Math/MathML\"\r\n                version='1.0'>\r\n                \r\n<xsl:output method=\"text\" indent=\"no\" encoding=\"UTF-8\"/>\r\n\r\n<!-- ====================================================================== -->\r\n<!-- $id: mmltex.xsl, 2002/22/11 Exp $\r\n     This file is part of the XSLT MathML Library distribution.\r\n     See ./README or http://www.raleigh.ru/MathML/mmltex for\r\n     copyright and other information                                        -->\r\n<!-- ====================================================================== -->\r\n\r\n<!--xsl:include href=\"tokens.xsl\"/-->\r\n\r\n<xsl:template match=\"m:mi|m:mn|m:mo|m:mtext|m:ms\">\r\n\t<xsl:call-template name=\"CommonTokenAtr\"/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mi\">\r\n  <xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mn\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mo\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mtext\">\r\n\t<xsl:variable name=\"content\">\r\n\t\t<xsl:call-template name=\"replaceMtextEntities\">\r\n\t\t\t<xsl:with-param name=\"content\" select=\".\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t<xsl:text>\\text{</xsl:text>\r\n\t<xsl:value-of select=\"$content\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mspace\">\r\n</xsl:template>\r\n\r\n<xsl:template name=\"ms\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@lquote\"><xsl:value-of select=\"@lquote\"/></xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\"</xsl:text></xsl:otherwise>\r\n\t</xsl:choose><xsl:apply-templates/><xsl:choose>\r\n\t\t<xsl:when test=\"@rquote\"><xsl:value-of select=\"@rquote\"/></xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\"</xsl:text></xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"CommonTokenAtr\">\r\n\t<xsl:if test=\"@mathbackground\">\r\n\t\t<xsl:text>\\colorbox[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@mathbackground\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{$</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@color or @mathcolor\"> <!-- Note: @color is deprecated in MathML 2.0 -->\r\n\t\t<xsl:text>\\textcolor[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@color|@mathcolor\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@mathvariant\">\r\n\t\t<xsl:choose>\r\n\t\t\t<xsl:when test=\"@mathvariant='normal'\">\r\n\t\t\t\t<xsl:text>\\mathrm{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold'\">\r\n\t\t\t\t<xsl:text>\\mathbf{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='italic'\">\r\n\t\t\t\t<xsl:text>\\mathit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-italic'\">\t<!-- Required definition -->\r\n\t\t\t\t<xsl:text>\\mathbit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='double-struck'\">\t<!-- Required amsfonts -->\r\n\t\t\t\t<xsl:text>\\mathbb{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-fraktur'\">\t<!-- Error -->\r\n\t\t\t\t<xsl:text>{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='script'\">\r\n\t\t\t\t<xsl:text>\\mathcal{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-script'\">\t<!-- Error -->\r\n\t\t\t\t<xsl:text>\\mathsc{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='fraktur'\">\t<!-- Required amsfonts -->\r\n\t\t\t\t<xsl:text>\\mathfrak{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='sans-serif'\">\r\n\t\t\t\t<xsl:text>\\mathsf{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='bold-sans-serif'\"> <!-- Required definition -->\r\n\t\t\t\t<xsl:text>\\mathbsf{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='sans-serif-italic'\"> <!-- Required definition -->\r\n\t\t\t\t<xsl:text>\\mathsfit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='sans-serif-bold-italic'\">\t<!-- Error -->\r\n\t\t\t\t<xsl:text>\\mathbsfit{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:when test=\"@mathvariant='monospace'\">\r\n\t\t\t\t<xsl:text>\\mathtt{</xsl:text>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:otherwise>\r\n\t\t\t\t<xsl:text>{</xsl:text>\r\n\t\t\t</xsl:otherwise>\r\n\t\t</xsl:choose>\r\n\t</xsl:if>\r\n\t<xsl:call-template name=\"selectTemplate\"/>\r\n\t<xsl:if test=\"@mathvariant\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@color or @mathcolor\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@mathbackground\">\r\n\t\t<xsl:text>$}</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"selectTemplate\">\r\n<!--\t<xsl:variable name=\"name\" select=\"local-name()\"/>\r\n\t<xsl:call-template name=\"{$name}\"/>-->\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"local-name(.)='mi'\">\r\n\t\t\t<xsl:call-template name=\"mi\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='mn'\">\r\n\t\t\t<xsl:call-template name=\"mn\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='mo'\">\r\n\t\t\t<xsl:call-template name=\"mo\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='mtext'\">\r\n\t\t\t<xsl:call-template name=\"mtext\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"local-name(.)='ms'\">\r\n\t\t\t<xsl:call-template name=\"ms\"/>\r\n\t\t</xsl:when>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"color\">\r\n<!-- NB: Variables colora and valueColor{n} only for Sablotron -->\r\n\t<xsl:param name=\"color\"/>\r\n\t<xsl:variable name=\"colora\" select=\"translate($color,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')\"/>\r\n\t<xsl:choose>\r\n\t<xsl:when test=\"starts-with($colora,'#') and string-length($colora)=4\">\r\n\t\t<xsl:variable name=\"valueColor\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,2,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"$valueColor div 15\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor1\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,3,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"$valueColor1 div 15\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor2\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,4,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"$valueColor2 div 15\"/>\r\n\t</xsl:when>\r\n\t<xsl:when test=\"starts-with($colora,'#') and string-length($colora)=7\">\r\n\t\t<xsl:variable name=\"valueColor1\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,2,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:variable name=\"valueColor2\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,3,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"($valueColor1*16 + $valueColor2) div 255\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor1a\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,4,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:variable name=\"valueColor2a\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,5,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"($valueColor1a*16 + $valueColor2a) div 255\"/><xsl:text>,</xsl:text>\r\n\t\t<xsl:variable name=\"valueColor1b\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,6,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:variable name=\"valueColor2b\">\r\n\t\t\t<xsl:call-template name=\"Hex2Decimal\">\r\n\t\t\t\t<xsl:with-param name=\"arg\" select=\"substring($colora,7,1)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:variable>\r\n\t\t<xsl:value-of select=\"($valueColor1b*16 + $valueColor2b) div 255\"/>\r\n\t</xsl:when>\r\n<!-- ======================= if color specifed as an html-color-name ========================================== -->\r\n\t<xsl:when test=\"$colora='aqua'\"><xsl:text>0,1,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='black'\"><xsl:text>0,0,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='blue'\"><xsl:text>0,0,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='fuchsia'\"><xsl:text>1,0,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='gray'\"><xsl:text>.5,.5,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='green'\"><xsl:text>0,.5,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='lime'\"><xsl:text>0,1,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='maroon'\"><xsl:text>.5,0,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='navy'\"><xsl:text>0,0,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='olive'\"><xsl:text>.5,.5,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='purple'\"><xsl:text>.5,0,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='red'\"><xsl:text>1,0,0</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='silver'\"><xsl:text>.75,.75,.75</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='teal'\"><xsl:text>0,.5,.5</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='white'\"><xsl:text>1,1,1</xsl:text></xsl:when>\r\n\t<xsl:when test=\"$colora='yellow'\"><xsl:text>1,1,0</xsl:text></xsl:when>\r\n\t<xsl:otherwise>\r\n\t\t<xsl:message>Exception at color template</xsl:message>\r\n\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"Hex2Decimal\">\r\n\t<xsl:param name=\"arg\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$arg='f'\">\r\n\t\t\t<xsl:value-of select=\"15\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='e'\">\r\n\t\t\t<xsl:value-of select=\"14\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='d'\">\r\n\t\t\t<xsl:value-of select=\"13\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='c'\">\r\n\t\t\t<xsl:value-of select=\"12\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='b'\">\r\n\t\t\t<xsl:value-of select=\"11\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$arg='a'\">\r\n\t\t\t<xsl:value-of select=\"10\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($arg, '0123456789', '9999999999')='9'\"> <!-- if $arg is number -->\r\n\t\t\t<xsl:value-of select=\"$arg\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:message>Exception at Hex2Decimal template</xsl:message>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:*/text()\">\r\n\t<xsl:call-template name=\"replaceEntities\">\r\n\t\t<xsl:with-param name=\"content\" select=\"normalize-space()\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n<!--xsl:include href=\"glayout.xsl\"/-->\r\n<xsl:template match=\"m:mfrac\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@bevelled='true'\">\r\n<!--\t\t\t<xsl:text>\\raisebox{1ex}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}\\!\\left/ \\!\\raisebox{-1ex}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}\\right.</xsl:text>-->\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"@linethickness\">\r\n\t\t\t<xsl:text>\\genfrac{}{}{</xsl:text>\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"number(@linethickness)\">\r\n\t\t\t\t\t<xsl:value-of select=\"@linethickness div 10\"/>\r\n\t\t\t\t\t<xsl:text>ex</xsl:text>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:when test=\"@linethickness='thin'\">\r\n\t\t\t\t\t<xsl:text>.05ex</xsl:text>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:when test=\"@linethickness='medium'\"/>\r\n\t\t\t\t<xsl:when test=\"@linethickness='thick'\">\r\n\t\t\t\t\t<xsl:text>.2ex</xsl:text>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:otherwise>\r\n\t\t\t\t\t<xsl:value-of select=\"@linethickness\"/>\r\n\t\t\t\t</xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t\t<xsl:text>}{}{</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\frac{</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:if test=\"@numalign='right'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:if test=\"@numalign='left'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>}{</xsl:text>\t\r\n\t<xsl:if test=\"@denomalign='right'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t<xsl:if test=\"@denomalign='left'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mroot\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"count(./*)=2\">\r\n\t\t\t<xsl:text>\\sqrt[</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>]{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t<!-- number of argumnets is not 2 - code 25 -->\r\n\t\t\t<xsl:message>exception 25:</xsl:message>\r\n\t\t\t<xsl:text>\\text{exception 25:}</xsl:text> \r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msqrt\">\r\n\t<xsl:text>\\sqrt{</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mfenced\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@open\">\r\n\t\t\t<xsl:if test=\"translate(@open,'{}[]()|','{{{{{{{')='{'\">\r\n\t\t\t\t<xsl:text>\\left</xsl:text>\r\n\t\t\t</xsl:if>\r\n\t\t\t<xsl:if test=\"@open='{' or @open='}'\">\r\n\t\t\t\t<xsl:text>\\</xsl:text>\r\n\t\t\t</xsl:if>\r\n\t\t\t<xsl:value-of select=\"@open\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\left(</xsl:text></xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"count(./*)>1\">\r\n\t\t\t<xsl:variable name=\"symbol\">\r\n\t\t\t\t<xsl:choose>\r\n\t\t\t\t\t<xsl:when test=\"@separators\">\r\n\t\t\t\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t\t\t\t<xsl:with-param name=\"symbol\" select=\"@separators\"/>\r\n\t\t\t\t\t\t</xsl:call-template>\r\n\t\t\t\t\t</xsl:when>\r\n\t\t\t\t\t<xsl:otherwise>,</xsl:otherwise>\r\n\t\t\t\t</xsl:choose>\r\n\t\t\t</xsl:variable>\r\n\t\t\t<xsl:for-each select=\"./*\">\r\n\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t<xsl:if test=\"not(position()=last())\">\r\n\t\t\t\t\t<xsl:choose>\r\n\t\t\t\t\t\t<xsl:when test=\"position()>string-length($symbol)\">\r\n\t\t\t\t\t\t\t<xsl:value-of select=\"substring($symbol,string-length($symbol))\"/>\r\n\t\t\t\t\t\t</xsl:when>\r\n\t\t\t\t\t\t<xsl:otherwise>\r\n\t\t\t\t\t\t\t<xsl:value-of select=\"substring($symbol,position(),1)\"/>\r\n\t\t\t\t\t\t</xsl:otherwise>\r\n\t\t\t\t\t</xsl:choose>\r\n\t\t\t\t</xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@close\">\r\n\t\t\t<xsl:if test=\"translate(@open,'{}[]()|','{{{{{{{')='{'\">\r\n\t\t\t\t<xsl:text>\\right</xsl:text>\r\n\t\t\t</xsl:if>\r\n\t\t\t<xsl:if test=\"@open='{' or @open='}'\">\r\n\t\t\t\t<xsl:text>\\</xsl:text>\r\n\t\t\t</xsl:if>\t\t\r\n\t\t\t<xsl:value-of select=\"@close\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\right)</xsl:text></xsl:otherwise>\r\n\t</xsl:choose>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mphantom\">\r\n\t<xsl:text>\\phantom{</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:menclose\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@notation = 'actuarial'\">\r\n\t\t\t<xsl:text>\\overline{</xsl:text>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t\t<xsl:text>\\hspace{.2em}|}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"@notation = 'radical'\">\r\n\t\t\t<xsl:text>\\sqrt{</xsl:text>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\overline{)</xsl:text>\r\n\t\t\t<xsl:apply-templates/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mrow\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mstyle\">\r\n\t<xsl:if test=\"@background\">\r\n\t\t<xsl:text>\\colorbox[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@background\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{$</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@color\">\r\n\t\t<xsl:text>\\textcolor[rgb]{</xsl:text>\r\n\t\t<xsl:call-template name=\"color\">\r\n\t\t\t<xsl:with-param name=\"color\" select=\"@color\"/>\r\n\t\t</xsl:call-template>\r\n\t\t<xsl:text>}{</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@color\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@background\">\r\n\t\t<xsl:text>$}</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n<!--\r\n\r\n<xsl:template match=\"m:mstyle\">\r\n\t<xsl:if test=\"@displaystyle='true'\">\r\n\t\t<xsl:text>{\\displaystyle</xsl:text>\r\n\t</xsl:if>\t\t\t\r\n\t<xsl:if test=\"@scriptlevel=2\">\r\n\t\t<xsl:text>{\\scriptscriptstyle</xsl:text>\t\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@scriptlevel=2\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"@displaystyle='true'\">\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n-->\r\n\r\n<xsl:template match=\"m:merror\">\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n<!--xsl:include href=\"scripts.xsl\"/-->\r\n<xsl:template match=\"m:munderover\">\r\n\t<xsl:variable name=\"base\">\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[1]\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t<xsl:variable name=\"under\">\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[2]\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t<xsl:variable name=\"over\">\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[3]\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:variable>\r\n\t\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$over='&#x000AF;'\">\t<!-- OverBar - over bar -->\r\n\t\t\t<xsl:text>\\overline{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"munder\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"under\" select=\"$under\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$over='&#x0FE37;'\">\t<!-- OverBrace - over brace -->\r\n\t\t\t<xsl:text>\\overbrace{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"munder\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"under\" select=\"$under\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$under='&#x00332;'\">\t<!-- UnderBar - combining low line -->\r\n\t\t\t<xsl:text>\\underline{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"mover\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"over\" select=\"$over\"/>\r\n\t\t\t\t<xsl:with-param name=\"pos_over\" select=\"3\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$under='&#x0FE38;'\">\t<!-- UnderBrace - under brace -->\r\n\t\t\t<xsl:text>\\underbrace{</xsl:text>\r\n\t\t\t<xsl:call-template name=\"mover\">\r\n\t\t\t\t<xsl:with-param name=\"base\" select=\"$base\"/>\r\n\t\t\t\t<xsl:with-param name=\"over\" select=\"$over\"/>\r\n\t\t\t\t<xsl:with-param name=\"pos_over\" select=\"3\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($base,'&#x0220F;&#x02210;&#x022c2;&#x022c3;&#x02294;',\r\n\t\t\t\t\t\t'&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;')='&#x02211;'\">\r\n<!-- if $base is operator, such as\r\n\t\t\t&#x02211;\t/sum L: summation operator\r\n\t\t\t&#x0220F;\t/prod L: product operator\r\n\t\t\t&#x02210;\t/coprod L: coproduct operator\r\n\t\t\t&#x022c2;\t/bigcap\r\n\t\t\t&#x022c3;\t/bigcup\r\n\t\t\t&#x02294;\t/bigsqcup\r\n-->\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>_{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[3]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\underset{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}{\\overset{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[3]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}}</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mover\">\r\n\t<xsl:call-template name=\"mover\">\r\n\t\t<xsl:with-param name=\"base\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[1]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t\t<xsl:with-param name=\"over\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[2]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:munder\">\r\n\t<xsl:call-template name=\"munder\">\r\n\t\t<xsl:with-param name=\"base\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[1]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t\t<xsl:with-param name=\"under\">\r\n\t\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t\t<xsl:with-param name=\"symbol\" select=\"./*[2]\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"mover\">\r\n\t<xsl:param name=\"base\"/>\r\n\t<xsl:param name=\"over\"/>\r\n\t<xsl:param name=\"pos_over\" select=\"2\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$over='&#x000AF;'\">\t<!-- OverBar - over bar -->\r\n\t\t\t<xsl:text>\\overline{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$over='&#x0FE37;'\">\t<!-- OverBrace - over brace -->\r\n\t\t\t<xsl:text>\\overbrace{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($base,'&#x0220F;&#x02210;&#x022c2;&#x022c3;&#x02294;',\r\n\t\t\t\t\t\t'&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;')='&#x02211;'\">\r\n<!-- if $base is operator, such as\r\n\t\t\t&#x02211;\t/sum L: summation operator\r\n\t\t\t&#x0220F;\t/prod L: product operator\r\n\t\t\t&#x02210;\t/coprod L: coproduct operator\r\n\t\t\t&#x022c2;\t/bigcap\r\n\t\t\t&#x022c3;\t/bigcup\r\n\t\t\t&#x02294;\t/bigsqcup\r\n-->\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[$pos_over]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\stackrel{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[$pos_over]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t\t<!--\r\n\t\t\t<xsl:text>\\overset{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[$pos_over]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>-->\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"munder\">\r\n\t<xsl:param name=\"base\"/>\r\n\t<xsl:param name=\"under\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"$under='&#x00332;'\">\t<!-- UnderBar - combining low line -->\r\n\t\t\t<xsl:text>\\underline{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"$under='&#x0FE38;'\">\t<!-- UnderBrace - under brace -->\r\n\t\t\t<xsl:text>\\underbrace{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"translate($base,'&#x0220F;&#x02210;&#x022c2;&#x022c3;&#x02294;',\r\n\t\t\t\t\t\t'&#x02211;&#x02211;&#x02211;&#x02211;&#x02211;')='&#x02211;'\">\r\n<!-- if $base is operator, such as\r\n\t\t\t&#x02211;\t/sum L: summation operator\r\n\t\t\t&#x0220F;\t/prod L: product operator\r\n\t\t\t&#x02210;\t/coprod L: coproduct operator\r\n\t\t\t&#x022c2;\t/bigcap\r\n\t\t\t&#x022c3;\t/bigcup\r\n\t\t\t&#x02294;\t/bigsqcup\r\n-->\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>_{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>\\underset{</xsl:text>\t\t<!-- Required AmsMath package -->\r\n\t\t\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t\t\t<xsl:text>}{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msubsup\">\r\n\t<xsl:text>{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:text>}_{</xsl:text>\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t<xsl:text>}^{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[3]\"/>\r\n\t<xsl:text>}</xsl:text>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msup\">\r\n\t<xsl:text>{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:text>}^{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t<xsl:text>}</xsl:text>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:msub\">\r\n\t<xsl:text>{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:text>}_{</xsl:text>\t\r\n\t<xsl:apply-templates select=\"./*[2]\"/>\r\n\t<xsl:text>}</xsl:text>\t\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mmultiscripts\" mode=\"mprescripts\">\r\n\t<xsl:for-each select=\"m:mprescripts/following-sibling::*\">\r\n\t\t<xsl:if test=\"position() mod 2 and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>{}_{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t\t<xsl:if test=\"not(position() mod 2) and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>{}^{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t<xsl:for-each select=\"m:mprescripts/preceding-sibling::*[position()!=last()]\">\r\n\t\t<xsl:if test=\"position()>2 and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>{}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t\t<xsl:if test=\"position() mod 2 and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>_{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t\t<xsl:if test=\"not(position() mod 2) and local-name(.)!='none'\">\r\n\t\t\t<xsl:text>^{</xsl:text>\t\r\n\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mmultiscripts\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"m:mprescripts\">\r\n\t\t\t<xsl:apply-templates select=\".\" mode=\"mprescripts\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:apply-templates select=\"./*[1]\"/>\r\n\t\t\t<xsl:for-each select=\"*[position()>1]\">\r\n\t\t\t\t<xsl:if test=\"position()>2 and local-name(.)!='none'\">\r\n\t\t\t\t\t<xsl:text>{}</xsl:text>\t\r\n\t\t\t\t</xsl:if>\r\n\t\t\t\t<xsl:if test=\"position() mod 2 and local-name(.)!='none'\">\r\n\t\t\t\t\t<xsl:text>_{</xsl:text>\t\r\n\t\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t\t\t</xsl:if>\r\n\t\t\t\t<xsl:if test=\"not(position() mod 2) and local-name(.)!='none'\">\r\n\t\t\t\t\t<xsl:text>^{</xsl:text>\t\r\n\t\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t\t<xsl:text>}</xsl:text>\t\r\n\t\t\t\t</xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n<!--xsl:include href=\"tables.xsl\"/-->\r\n<xsl:template match=\"m:mtd[@columnspan]\">\r\n\t<xsl:text>\\multicolumn{</xsl:text>\r\n\t<xsl:value-of select=\"@columnspan\"/>\r\n\t<xsl:text>}{c}{</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:if test=\"count(following-sibling::*)>0\">\r\n\t\t<xsl:text>&amp; </xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n\r\n<xsl:template match=\"m:mtd\">\r\n\t<xsl:if test=\"@columnalign='right' or @columnalign='center'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@columnalign='left' or @columnalign='center'\">\r\n\t\t<xsl:text>\\hfill </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"count(following-sibling::*)>0\">\r\n<!--    this test valid for Sablotron, another form - test=\"not(position()=last())\".\r\n\tAlso for m:mtd[@columnspan] and m:mtr  -->\r\n\t\t<xsl:text>&amp; </xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mtr\">\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"count(following-sibling::*)>0\">\r\n\t\t<xsl:text>\\\\ </xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:mtable\">\r\n\t<xsl:text>\\begin{array}{</xsl:text>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>|</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:variable name=\"numbercols\" select=\"count(./m:mtr[1]/m:mtd[not(@columnspan)])+sum(./m:mtr[1]/m:mtd/@columnspan)\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@columnalign\">\r\n\t\t\t<xsl:variable name=\"colalign\">\r\n\t\t\t\t<xsl:call-template name=\"colalign\">\r\n\t\t\t\t\t<xsl:with-param name=\"colalign\" select=\"@columnalign\"/>\r\n\t\t\t\t</xsl:call-template>\r\n\t\t\t</xsl:variable>\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"string-length($colalign) > $numbercols\">\r\n\t\t\t\t\t<xsl:value-of select=\"substring($colalign,1,$numbercols)\"/>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:when test=\"string-length($colalign) &lt; $numbercols\">\r\n\t\t\t\t\t<xsl:value-of select=\"$colalign\"/>\r\n\t\t\t\t\t<xsl:call-template name=\"generate-string\">\r\n\t\t\t\t\t\t<xsl:with-param name=\"text\" select=\"substring($colalign,string-length($colalign))\"/>\r\n\t\t\t\t\t\t<xsl:with-param name=\"count\" select=\"$numbercols - string-length($colalign)\"/>\r\n\t\t\t\t\t</xsl:call-template>\r\n\t\t\t\t</xsl:when>\r\n\t\t\t\t<xsl:otherwise>\r\n\t\t\t\t\t<xsl:value-of select=\"$colalign\"/>\r\n\t\t\t\t</xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:call-template name=\"generate-string\">\r\n\t\t\t\t<xsl:with-param name=\"text\" select=\"'c'\"/>\r\n\t\t\t\t<xsl:with-param name=\"count\" select=\"$numbercols\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>|</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>\\hline </xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"@frame='solid'\">\r\n\t\t<xsl:text>\\\\ \\hline</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>\\end{array}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"colalign\">\r\n\t<xsl:param name=\"colalign\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"contains($colalign,' ')\">\r\n\t\t\t<xsl:value-of select=\"substring($colalign,1,1)\"/>\r\n\t\t\t<xsl:call-template name=\"colalign\">\r\n\t\t\t\t<xsl:with-param name=\"colalign\" select=\"substring-after($colalign,' ')\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:value-of select=\"substring($colalign,1,1)\"/>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"generate-string\">\r\n<!-- template from XSLT Standard Library v1.1 -->\r\n    <xsl:param name=\"text\"/>\r\n    <xsl:param name=\"count\"/>\r\n\r\n    <xsl:choose>\r\n      <xsl:when test=\"string-length($text) = 0 or $count &lt;= 0\"/>\r\n\r\n      <xsl:otherwise>\r\n\t<xsl:value-of select=\"$text\"/>\r\n\t<xsl:call-template name=\"generate-string\">\r\n\t  <xsl:with-param name=\"text\" select=\"$text\"/>\r\n\t  <xsl:with-param name=\"count\" select=\"$count - 1\"/>\r\n\t</xsl:call-template>\r\n      </xsl:otherwise>\r\n    </xsl:choose>\r\n</xsl:template>\r\n<!--xsl:include href=\"entities.xsl\"/-->\r\n\r\n<xsl:template name=\"replaceEntities\">\r\n\t<xsl:param name=\"content\"/>\r\n\t<xsl:if test=\"string-length($content)>0\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0025B;')\"><xsl:value-of select=\"'\\varepsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0025B;')\"/></xsl:call-template></xsl:when>\t<!--/varepsilon -->\r\n\r\n<!-- ====================================================================== -->\r\n<!-- \tUnicode 3.2\r\n\tGreek\r\n\tRange: 0370-03FF\r\n\thttp://www.unicode.org/charts/PDF/U0370.pdf\t                    -->\r\n<!-- ====================================================================== -->\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x00393;')\"><xsl:value-of select=\"'\\Gamma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x00393;')\"/></xsl:call-template></xsl:when>\t<!--/Gamma capital Gamma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x00394;')\"><xsl:value-of select=\"'\\Delta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x00394;')\"/></xsl:call-template></xsl:when>\t<!--/Delta capital Delta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x00398;')\"><xsl:value-of select=\"'\\Theta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x00398;')\"/></xsl:call-template></xsl:when>\t<!--/Theta capital Theta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0039B;')\"><xsl:value-of select=\"'\\Lambda '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0039B;')\"/></xsl:call-template></xsl:when>\t<!--/Lambda capital Lambda, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0039E;')\"><xsl:value-of select=\"'\\Xi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0039E;')\"/></xsl:call-template></xsl:when>\t<!--/Xi capital Xi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A0;')\"><xsl:value-of select=\"'\\Pi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A0;')\"/></xsl:call-template></xsl:when>\t<!--/Pi capital Pi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A3;')\"><xsl:value-of select=\"'\\Sigma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A3;')\"/></xsl:call-template></xsl:when>\t<!--/Sigma capital Sigma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A6;')\"><xsl:value-of select=\"'\\Phi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A6;')\"/></xsl:call-template></xsl:when>\t<!--/Phi capital Phi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A8;')\"><xsl:value-of select=\"'\\Psi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A8;')\"/></xsl:call-template></xsl:when>\t<!--/Psi capital Psi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003A9;')\"><xsl:value-of select=\"'\\Omega '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003A9;')\"/></xsl:call-template></xsl:when>\t<!--/Omega capital Omega, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B1;')\"><xsl:value-of select=\"'\\alpha '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B1;')\"/></xsl:call-template></xsl:when>\t<!--/alpha small alpha, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B2;')\"><xsl:value-of select=\"'\\beta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B2;')\"/></xsl:call-template></xsl:when>\t<!--/beta small beta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B3;')\"><xsl:value-of select=\"'\\gamma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B3;')\"/></xsl:call-template></xsl:when>\t<!--/gamma small gamma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B4;')\"><xsl:value-of select=\"'\\delta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B4;')\"/></xsl:call-template></xsl:when>\t<!--/delta small delta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B5;')\"><xsl:value-of select=\"'\\epsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B5;')\"/></xsl:call-template></xsl:when>\t<!--/straightepsilon, small epsilon, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B6;')\"><xsl:value-of select=\"'\\zeta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B6;')\"/></xsl:call-template></xsl:when>\t<!--/zeta small zeta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B7;')\"><xsl:value-of select=\"'\\eta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B7;')\"/></xsl:call-template></xsl:when>\t<!--/eta small eta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B8;')\"><xsl:value-of select=\"'\\theta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B8;')\"/></xsl:call-template></xsl:when>\t<!--/theta straight theta, small theta, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003B9;')\"><xsl:value-of select=\"'\\iota '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003B9;')\"/></xsl:call-template></xsl:when>\t<!--/iota small iota, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BA;')\"><xsl:value-of select=\"'\\kappa '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BA;')\"/></xsl:call-template></xsl:when>\t<!--/kappa small kappa, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BB;')\"><xsl:value-of select=\"'\\lambda '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BB;')\"/></xsl:call-template></xsl:when>\t<!--/lambda small lambda, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BC;')\"><xsl:value-of select=\"'\\mu '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BC;')\"/></xsl:call-template></xsl:when>\t<!--/mu small mu, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BD;')\"><xsl:value-of select=\"'\\nu '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BD;')\"/></xsl:call-template></xsl:when>\t<!--/nu small nu, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003BE;')\"><xsl:value-of select=\"'\\xi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003BE;')\"/></xsl:call-template></xsl:when>\t<!--/xi small xi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C0;')\"><xsl:value-of select=\"'\\pi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C0;')\"/></xsl:call-template></xsl:when>\t<!--/pi small pi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C1;')\"><xsl:value-of select=\"'\\rho '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C1;')\"/></xsl:call-template></xsl:when>\t<!--/rho small rho, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C2;')\"><xsl:value-of select=\"'\\varsigma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C2;')\"/></xsl:call-template></xsl:when>\t<!--/varsigma -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C3;')\"><xsl:value-of select=\"'\\sigma '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C3;')\"/></xsl:call-template></xsl:when>\t<!--/sigma small sigma, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C4;')\"><xsl:value-of select=\"'\\tau '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C4;')\"/></xsl:call-template></xsl:when>\t<!--/tau small tau, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C5;')\"><xsl:value-of select=\"'\\upsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C5;')\"/></xsl:call-template></xsl:when>\t<!--/upsilon small upsilon, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C6;')\"><xsl:value-of select=\"'\\phi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C6;')\"/></xsl:call-template></xsl:when>\t<!--/straightphi - small phi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C7;')\"><xsl:value-of select=\"'\\chi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C7;')\"/></xsl:call-template></xsl:when>\t<!--/chi small chi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C8;')\"><xsl:value-of select=\"'\\psi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C8;')\"/></xsl:call-template></xsl:when>\t<!--/psi small psi, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003C9;')\"><xsl:value-of select=\"'\\omega '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003C9;')\"/></xsl:call-template></xsl:when>\t<!--/omega small omega, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D1;')\"><xsl:value-of select=\"'\\vartheta '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D1;')\"/></xsl:call-template></xsl:when>\t<!--/vartheta - curly or open theta -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D2;')\"><xsl:value-of select=\"'\\Upsilon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D2;')\"/></xsl:call-template></xsl:when>\t<!--/Upsilon capital Upsilon, Greek -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D5;')\"><xsl:value-of select=\"'\\varphi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D5;')\"/></xsl:call-template></xsl:when>\t<!--/varphi - curly or open phi -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003D6;')\"><xsl:value-of select=\"'\\varpi '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003D6;')\"/></xsl:call-template></xsl:when>\t\t<!--/varpi -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003F0;')\"><xsl:value-of select=\"'\\varkappa '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003F0;')\"/></xsl:call-template></xsl:when>\t<!--/varkappa -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x003F1;')\"><xsl:value-of select=\"'\\varrho '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x003F1;')\"/></xsl:call-template></xsl:when>\t<!--/varrho -->\r\n\t\t\r\n<!-- ====================================================================== -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0200B;')\"><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0200B;')\"/></xsl:call-template></xsl:when>\t\t\t\t\t\t<!--short form of  &InvisibleComma; -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02026;')\"><xsl:value-of select=\"'\\dots '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02026;')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02032;')\"><xsl:value-of select=\"'\\prime '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02032;')\"/></xsl:call-template></xsl:when>\t\t<!--/prime prime or minute -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02061;')\"><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02061;')\"/></xsl:call-template></xsl:when>\t\t\t\t\t\t<!-- ApplyFunction -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02062;')\"><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02062;')\"/></xsl:call-template></xsl:when>\t\t\t\t\t\t<!-- InvisibleTimes -->\r\n<!-- ====================================================================== -->\r\n<!-- \tUnicode 3.2\r\n\tLetterlike Symbols\r\n\tRange: 2100-214F\r\n\thttp://www.unicode.org/charts/PDF/U2100.pdf\t                    -->\r\n<!-- ====================================================================== -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0210F;&#x0FE00;')\"><xsl:value-of select=\"'\\hbar '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0210F;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/hbar - Planck's over 2pi -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0210F;')\"><xsl:value-of select=\"'\\hslash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0210F;')\"/></xsl:call-template></xsl:when>\t<!--/hslash - variant Planck's over 2pi --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02111;')\"><xsl:value-of select=\"'\\Im '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02111;')\"/></xsl:call-template></xsl:when>\t\t<!--/Im - imaginary   -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02113;')\"><xsl:value-of select=\"'\\ell '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02113;')\"/></xsl:call-template></xsl:when>\t\t<!--/ell - cursive small l -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02118;')\"><xsl:value-of select=\"'\\wp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02118;')\"/></xsl:call-template></xsl:when>\t\t<!--/wp - Weierstrass p -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0211C;')\"><xsl:value-of select=\"'\\Re '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0211C;')\"/></xsl:call-template></xsl:when>\t\t<!--/Re - real -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02127;')\"><xsl:value-of select=\"'\\mho '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02127;')\"/></xsl:call-template></xsl:when>\t\t<!--/mho - conductance -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02135;')\"><xsl:value-of select=\"'\\aleph '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02135;')\"/></xsl:call-template></xsl:when>\t\t<!--/aleph aleph, Hebrew -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02136;')\"><xsl:value-of select=\"'\\beth '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02136;')\"/></xsl:call-template></xsl:when>\t\t<!--/beth - beth, Hebrew --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02137;')\"><xsl:value-of select=\"'\\gimel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02137;')\"/></xsl:call-template></xsl:when>\t\t<!--/gimel - gimel, Hebrew --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02138;')\"><xsl:value-of select=\"'\\daleth '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02138;')\"/></xsl:call-template></xsl:when>\t<!--/daleth - daleth, Hebrew --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02145;')\"><xsl:value-of select=\"'D'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02145;')\"/></xsl:call-template></xsl:when>\t\t<!--D for use in differentials, e.g., within integrals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02146;')\"><xsl:value-of select=\"'d'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02146;')\"/></xsl:call-template></xsl:when>\t\t<!--d for use in differentials, e.g., within integrals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02147;')\"><xsl:value-of select=\"'e'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02147;')\"/></xsl:call-template></xsl:when>\t\t<!--e use for the exponential base of the natural logarithms -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02148;')\"><xsl:value-of select=\"'i'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02148;')\"/></xsl:call-template></xsl:when>\t\t<!--i for use as a square root of -1 -->\r\n\r\n<!-- ====================================================================== -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02192;')\"><xsl:value-of select=\"'\\to '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02192;')\"/></xsl:call-template></xsl:when>\t\t<!--/rightarrow /to A: =rightward arrow -->\r\n\t\t\r\n<!-- ====================================================================== -->\r\n<!-- \tUnicode 3.2\r\n\tMathematical Operators\r\n\tRange: 2200-22FF\r\n\thttp://www.unicode.org/charts/PDF/U2200.pdf                         -->\r\n<!-- ====================================================================== -->\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02200;')\"><xsl:value-of select=\"'\\forall '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02200;')\"/></xsl:call-template></xsl:when>\t<!--/forall for all -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02201;')\"><xsl:value-of select=\"'\\complement '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02201;')\"/></xsl:call-template></xsl:when>\t<!--/complement - complement sign --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02202;')\"><xsl:value-of select=\"'\\partial '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02202;')\"/></xsl:call-template></xsl:when>\t<!--/partial partial differential -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02203;')\"><xsl:value-of select=\"'\\exists '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02203;')\"/></xsl:call-template></xsl:when>\t<!--/exists at least one exists -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02204;')\"><xsl:value-of select=\"'\\nexists '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02204;')\"/></xsl:call-template></xsl:when>\t<!--/nexists - negated exists --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02205;&#x0FE00;')\"><xsl:value-of select=\"'\\emptyset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02205;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/emptyset - zero, slash -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02205;')\"><xsl:value-of select=\"'\\varnothing '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02205;')\"/></xsl:call-template></xsl:when>\t<!--/varnothing - circle, slash --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02206;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02206;')\"/></xsl:call-template></xsl:when>-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02207;')\"><xsl:value-of select=\"'\\nabla '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02207;')\"/></xsl:call-template></xsl:when>\t\t<!--/nabla del, Hamilton operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02208;')\"><xsl:value-of select=\"'\\in '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02208;')\"/></xsl:call-template></xsl:when>\t\t<!--/in R: set membership  -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02209;')\"><xsl:value-of select=\"'\\notin '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02209;')\"/></xsl:call-template></xsl:when>\t\t<!--/notin N: negated set membership -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0220B;')\"><xsl:value-of select=\"'\\ni '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0220B;')\"/></xsl:call-template></xsl:when>\t\t<!--/ni /owns R: contains -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0220C;')\"><xsl:value-of select=\"'\\not\\ni '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0220C;')\"/></xsl:call-template></xsl:when>\t<!--negated contains -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0220F;')\"><xsl:value-of select=\"'\\prod '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0220F;')\"/></xsl:call-template></xsl:when>\t\t<!--/prod L: product operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02210;')\"><xsl:value-of select=\"'\\coprod '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02210;')\"/></xsl:call-template></xsl:when>\t<!--/coprod L: coproduct operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02211;')\"><xsl:value-of select=\"'\\sum '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02211;')\"/></xsl:call-template></xsl:when>\t\t<!--/sum L: summation operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02212;')\"><xsl:value-of select=\"'-'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02212;')\"/></xsl:call-template></xsl:when>\t\t<!--B: minus sign -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02213;')\"><xsl:value-of select=\"'\\mp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02213;')\"/></xsl:call-template></xsl:when>\t\t<!--/mp B: minus-or-plus sign -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02214;')\"><xsl:value-of select=\"'\\dotplus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02214;')\"/></xsl:call-template></xsl:when>\t<!--/dotplus B: plus sign, dot above --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02215;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02215;')\"/></xsl:call-template></xsl:when>-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02216;')\"><xsl:value-of select=\"'\\setminus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02216;')\"/></xsl:call-template></xsl:when>\t<!--/setminus B: reverse solidus -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02217;')\"><xsl:value-of select=\"'\\ast '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02217;')\"/></xsl:call-template></xsl:when>\t\t<!--low asterisk -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02218;')\"><xsl:value-of select=\"'\\circ '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02218;')\"/></xsl:call-template></xsl:when>\t\t<!--/circ B: composite function (small circle) -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02219;')\"><xsl:value-of select=\"'\\bullet '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02219;')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0221A;')\"><xsl:value-of select=\"'\\surd '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221A;')\"/></xsl:call-template></xsl:when>\t\t<!--/surd radical -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0221D;')\"><xsl:value-of select=\"'\\propto '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221D;')\"/></xsl:call-template></xsl:when>\t<!--/propto R: is proportional to -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0221E;')\"><xsl:value-of select=\"'\\infty '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221E;')\"/></xsl:call-template></xsl:when>\t\t<!--/infty infinity -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0221F;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0221F;')\"/></xsl:call-template></xsl:when>\t\tright (90 degree) angle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02220;')\"><xsl:value-of select=\"'\\angle '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02220;')\"/></xsl:call-template></xsl:when>\t\t<!--/angle - angle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02221;')\"><xsl:value-of select=\"'\\measuredangle '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02221;')\"/></xsl:call-template></xsl:when>\t<!--/measuredangle - angle-measured -->\t<!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02222;')\"><xsl:value-of select=\"'\\sphericalangle '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02222;')\"/></xsl:call-template></xsl:when><!--/sphericalangle angle-spherical -->\t<!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02223;')\"><xsl:value-of select=\"'\\mid '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02223;')\"/></xsl:call-template></xsl:when>\t\t<!--/mid R: -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02224;&#x0FE00;')\"><xsl:value-of select=\"'\\nshortmid '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02224;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/nshortmid --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02224;')\"><xsl:value-of select=\"'\\nmid '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02224;')\"/></xsl:call-template></xsl:when>\t\t<!--/nmid --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02225;')\"><xsl:value-of select=\"'\\parallel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02225;')\"/></xsl:call-template></xsl:when>\t<!--/parallel R: parallel -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02226;&#x0FE00;')\"><xsl:value-of select=\"'\\nshortparallel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02226;&#x0FE00;')\"/></xsl:call-template></xsl:when>\t<!--/nshortparallel N: not short par --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02226;')\"><xsl:value-of select=\"'\\nparallel '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02226;')\"/></xsl:call-template></xsl:when>\t<!--/nparallel N: not parallel --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02227;')\"><xsl:value-of select=\"'\\wedge '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02227;')\"/></xsl:call-template></xsl:when>\t\t<!--/wedge /land B: logical and -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02228;')\"><xsl:value-of select=\"'\\vee '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02228;')\"/></xsl:call-template></xsl:when>\t\t<!--/vee /lor B: logical or -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02229;')\"><xsl:value-of select=\"'\\cap '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02229;')\"/></xsl:call-template></xsl:when>\t\t<!--/cap B: intersection -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222A;')\"><xsl:value-of select=\"'\\cup '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222A;')\"/></xsl:call-template></xsl:when>\t\t<!--/cup B: union or logical sum -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222B;')\"><xsl:value-of select=\"'\\int '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222B;')\"/></xsl:call-template></xsl:when>\t\t<!--/int L: integral operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222C;')\"><xsl:value-of select=\"'\\iint '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222C;')\"/></xsl:call-template></xsl:when>\t\t<!--double integral operator --> <!-- Required amsmath -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222D;')\"><xsl:value-of select=\"'\\iiint '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222D;')\"/></xsl:call-template></xsl:when>\t\t<!--/iiint triple integral operator -->\t<!-- Required amsmath -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0222E;')\"><xsl:value-of select=\"'\\oint '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222E;')\"/></xsl:call-template></xsl:when>\t\t<!--/oint L: contour integral operator -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0222F;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0222F;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02230;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02230;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02231;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02231;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02232;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02232;')\"/></xsl:call-template></xsl:when>-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02233;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02233;')\"/></xsl:call-template></xsl:when>-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02234;')\"><xsl:value-of select=\"'\\therefore '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02234;')\"/></xsl:call-template></xsl:when>\t<!--/therefore R: therefore --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02235;')\"><xsl:value-of select=\"'\\because '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02235;')\"/></xsl:call-template></xsl:when>\t<!--/because R: because --> <!-- Required amssymb -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02236;')\"><xsl:value-of select=\"':'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02236;')\"/></xsl:call-template></xsl:when>\t\t<!--/ratio -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02237;')\"><xsl:value-of select=\"'\\colon\\colon '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02237;')\"/></xsl:call-template></xsl:when>\t<!--/Colon, two colons -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02238;')\"><xsl:value-of select=\"'\\dot{-}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02238;')\"/></xsl:call-template></xsl:when>\t\t<!--/dotminus B: minus sign, dot above -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02239;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02239;')\"/></xsl:call-template></xsl:when>\t\t-->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223A;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223A;')\"/></xsl:call-template></xsl:when>\t\tminus with four dots, geometric properties -->\t\t\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223B;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223B;')\"/></xsl:call-template></xsl:when>\t\thomothetic -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0223C;')\"><xsl:value-of select=\"'\\sim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223C;')\"/></xsl:call-template></xsl:when>\t\t<!--/sim R: similar -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0223D;')\"><xsl:value-of select=\"'\\backsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223D;')\"/></xsl:call-template></xsl:when>\t<!--/backsim R: reverse similar --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223E;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223E;')\"/></xsl:call-template></xsl:when>\t\tmost positive -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0223F;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0223F;')\"/></xsl:call-template></xsl:when>\t\tac current -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02240;')\"><xsl:value-of select=\"'\\wr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02240;')\"/></xsl:call-template></xsl:when>\t\t<!--/wr B: wreath product -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02241;')\"><xsl:value-of select=\"'\\nsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02241;')\"/></xsl:call-template></xsl:when>\t\t<!--/nsim N: not similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02242;')\"><xsl:value-of select=\"'\\eqsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02242;')\"/></xsl:call-template></xsl:when>\t\t<!--/esim R: equals, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02243;')\"><xsl:value-of select=\"'\\simeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02243;')\"/></xsl:call-template></xsl:when>\t\t<!--/simeq R: similar, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02244;')\"><xsl:value-of select=\"'\\not\\simeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02244;')\"/></xsl:call-template></xsl:when>\t<!--/nsimeq N: not similar, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02245;')\"><xsl:value-of select=\"'\\cong '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02245;')\"/></xsl:call-template></xsl:when>\t\t<!--/cong R: congruent with -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02246;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02246;')\"/></xsl:call-template></xsl:when>\t\tsimilar, not equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02247;')\"><xsl:value-of select=\"'\\ncong '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02247;')\"/></xsl:call-template></xsl:when>\t\t<!--/ncong N: not congruent with --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02248;')\"><xsl:value-of select=\"'\\approx '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02248;')\"/></xsl:call-template></xsl:when>\t<!--/approx R: approximate -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02249;&#x00338;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02249;&#x00338;')\"/></xsl:call-template></xsl:when>\tnot, vert, approximate -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02249;')\"><xsl:value-of select=\"'\\not\\approx '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02249;')\"/></xsl:call-template></xsl:when>\t<!--/napprox N: not approximate -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224A;')\"><xsl:value-of select=\"'\\approxeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224A;')\"/></xsl:call-template></xsl:when>\t<!--/approxeq R: approximate, equals --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0224B;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224B;')\"/></xsl:call-template></xsl:when>\t\tapproximately identical to -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0224C;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224C;')\"/></xsl:call-template></xsl:when>\t\t/backcong R: reverse congruent -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224D;')\"><xsl:value-of select=\"'\\asymp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224D;')\"/></xsl:call-template></xsl:when>\t\t<!--/asymp R: asymptotically equal to -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224E;')\"><xsl:value-of select=\"'\\Bumpeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224E;')\"/></xsl:call-template></xsl:when>\t<!--/Bumpeq R: bumpy equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0224F;')\"><xsl:value-of select=\"'\\bumpeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0224F;')\"/></xsl:call-template></xsl:when>\t<!--/bumpeq R: bumpy equals, equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02250;')\"><xsl:value-of select=\"'\\doteq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02250;')\"/></xsl:call-template></xsl:when>\t\t<!--/doteq R: equals, single dot above -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02251;')\"><xsl:value-of select=\"'\\doteqdot '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02251;')\"/></xsl:call-template></xsl:when>\t<!--/doteqdot /Doteq R: eq, even dots --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02252;')\"><xsl:value-of select=\"'\\fallingdotseq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02252;')\"/></xsl:call-template></xsl:when>\t<!--/fallingdotseq R: eq, falling dots --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02253;')\"><xsl:value-of select=\"'\\risingdotseq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02253;')\"/></xsl:call-template></xsl:when>\t<!--/risingdotseq R: eq, rising dots --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02254;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02254;')\"/></xsl:call-template></xsl:when>\t\t/coloneq R: colon, equals -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02255;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02255;')\"/></xsl:call-template></xsl:when>\t\t/eqcolon R: equals, colon -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02256;')\"><xsl:value-of select=\"'\\eqcirc '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02256;')\"/></xsl:call-template></xsl:when>\t<!--/eqcirc R: circle on equals sign --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02257;')\"><xsl:value-of select=\"'\\circeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02257;')\"/></xsl:call-template></xsl:when>\t<!--/circeq R: circle, equals --> <!-- Required amssymb -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02258;')\"><xsl:value-of select=\"'\\stackrel{\\frown}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02258;')\"/></xsl:call-template></xsl:when>\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02259;')\"><xsl:value-of select=\"'\\stackrel{\\wedge}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02259;')\"/></xsl:call-template></xsl:when>\t<!--/wedgeq R: corresponds to (wedge, equals) -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225A;')\"><xsl:value-of select=\"'\\stackrel{\\vee}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225A;')\"/></xsl:call-template></xsl:when>\t<!--logical or, equals -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225B;')\"><xsl:value-of select=\"'\\stackrel{\\star}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225B;')\"/></xsl:call-template></xsl:when>\t<!--equal, asterisk above -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0225C;')\"><xsl:value-of select=\"'\\triangleq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225C;')\"/></xsl:call-template></xsl:when>\t<!--/triangleq R: triangle, equals --> <!-- Required amssymb -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225D;')\"><xsl:value-of select=\"'\\stackrel{\\scriptscriptstyle\\mathrm{def}}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225D;')\"/></xsl:call-template></xsl:when>\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225E;')\"><xsl:value-of select=\"'\\stackrel{\\scriptscriptstyle\\mathrm{m}}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225E;')\"/></xsl:call-template></xsl:when>\t\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x0225F;')\"><xsl:value-of select=\"'\\stackrel{?}{=}'\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0225F;')\"/></xsl:call-template></xsl:when>\t<!--/questeq R: equal with questionmark -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02260;&#x0FE00;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02260;&#x0FE00;')\"/></xsl:call-template></xsl:when>\tnot equal, dot -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02260;')\"><xsl:value-of select=\"'\\ne '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02260;')\"/></xsl:call-template></xsl:when>\t\t<!--/ne /neq R: not equal -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02261;&#x020E5;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02261;&#x020E5;')\"/></xsl:call-template></xsl:when>\treverse not equivalent -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02261;')\"><xsl:value-of select=\"'\\equiv '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02261;')\"/></xsl:call-template></xsl:when>\t\t<!--/equiv R: identical with -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02262;')\"><xsl:value-of select=\"'\\not\\equiv '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02262;')\"/></xsl:call-template></xsl:when>\t<!--/nequiv N: not identical with -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x02263;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02263;')\"/></xsl:call-template></xsl:when>\t\t-->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02264;')\"><xsl:value-of select=\"'\\le '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02264;')\"/></xsl:call-template></xsl:when>\t\t<!--/leq /le R: less-than-or-equal -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02265;')\"><xsl:value-of select=\"'\\ge '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02265;')\"/></xsl:call-template></xsl:when>\t\t<!--/geq /ge R: greater-than-or-equal -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02266;')\"><xsl:value-of select=\"'\\leqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02266;')\"/></xsl:call-template></xsl:when>\t\t<!--/leqq R: less, double equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02267;')\"><xsl:value-of select=\"'\\geqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02267;')\"/></xsl:call-template></xsl:when>\t\t<!--/geqq R: greater, double equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02268;')\"><xsl:value-of select=\"'\\lneqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02268;')\"/></xsl:call-template></xsl:when>\t\t<!--/lneqq N: less, not double equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02269;')\"><xsl:value-of select=\"'\\gneqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02269;')\"/></xsl:call-template></xsl:when>\t\t<!--/gneqq N: greater, not dbl equals --> <!-- Required amssymb -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226A;&#x00338;&#x0FE00;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226A;&#x00338;&#x0FE00;')\"/></xsl:call-template></xsl:when>\tnot much less than, variant -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226A;&#x00338;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226A;&#x00338;')\"/></xsl:call-template></xsl:when>\tnot, vert, much less than -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226A;')\"><xsl:value-of select=\"'\\ll '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226A;')\"/></xsl:call-template></xsl:when>\t\t<!--/ll R: double less-than sign -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226B;&#x00338;&#x0FE00;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226B;&#x00338;&#x0FE00;')\"/></xsl:call-template></xsl:when>\tnot much greater than, variant -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x0226B;&#x00338;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226B;&#x00338;')\"/></xsl:call-template></xsl:when>\tnot, vert, much greater than -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226B;')\"><xsl:value-of select=\"'\\gg '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226B;')\"/></xsl:call-template></xsl:when>\t\t<!--/gg R: dbl greater-than sign -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226C;')\"><xsl:value-of select=\"'\\between '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226C;')\"/></xsl:call-template></xsl:when>\t<!--/between R: between --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226D;')\"><xsl:value-of select=\"'\\not\\asymp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226D;')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226E;')\"><xsl:value-of select=\"'\\nless '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226E;')\"/></xsl:call-template></xsl:when>\t\t<!--/nless N: not less-than --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0226F;')\"><xsl:value-of select=\"'\\ngtr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0226F;')\"/></xsl:call-template></xsl:when>\t\t<!--/ngtr N: not greater-than --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02270;&#x020E5;')\"><xsl:value-of select=\"'\\nleq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02270;&#x020E5;')\"/></xsl:call-template></xsl:when>\t<!--/nleq N: not less-than-or-equal --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02270;')\"><xsl:value-of select=\"'\\nleqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02270;')\"/></xsl:call-template></xsl:when>\t\t<!--/nleqq N: not less, dbl equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02271;&#x020E5;')\"><xsl:value-of select=\"'\\ngeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02271;&#x020E5;')\"/></xsl:call-template></xsl:when>\t<!--/ngeq N: not greater-than-or-equal --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02271;')\"><xsl:value-of select=\"'\\ngeqq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02271;')\"/></xsl:call-template></xsl:when>\t\t<!--/ngeqq N: not greater, dbl equals --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02272;')\"><xsl:value-of select=\"'\\lesssim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02272;')\"/></xsl:call-template></xsl:when>\t<!--/lesssim R: less, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02273;')\"><xsl:value-of select=\"'\\gtrsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02273;')\"/></xsl:call-template></xsl:when>\t<!--/gtrsim R: greater, similar --> <!-- Required amssymb -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02274;')\"><xsl:value-of select=\"'\\not\\lesssim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02274;')\"/></xsl:call-template></xsl:when>\t<!--not less, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02275;')\"><xsl:value-of select=\"'\\not\\gtrsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02275;')\"/></xsl:call-template></xsl:when>\t<!--not greater, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02276;')\"><xsl:value-of select=\"'\\lessgtr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02276;')\"/></xsl:call-template></xsl:when>\t<!--/lessgtr R: less, greater --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02277;')\"><xsl:value-of select=\"'\\gtrless '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02277;')\"/></xsl:call-template></xsl:when>\t<!--/gtrless R: greater, less --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02278;')\"><xsl:value-of select=\"'\\not\\lessgtr '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02278;')\"/></xsl:call-template></xsl:when>\t<!--not less, greater --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02279;')\"><xsl:value-of select=\"'\\not\\gtrless '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02279;')\"/></xsl:call-template></xsl:when>\t<!--not greater, less --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227A;')\"><xsl:value-of select=\"'\\prec '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227A;')\"/></xsl:call-template></xsl:when>\t\t<!--/prec R: precedes -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227B;')\"><xsl:value-of select=\"'\\succ '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227B;')\"/></xsl:call-template></xsl:when>\t\t<!--/succ R: succeeds -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227C;')\"><xsl:value-of select=\"'\\preccurlyeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227C;')\"/></xsl:call-template></xsl:when>\t<!--/preccurlyeq R: precedes, curly eq --> <!-- Required amssymb -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227D;')\"><xsl:value-of select=\"'\\succcurlyeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227D;')\"/></xsl:call-template></xsl:when>\t<!--/succcurlyeq R: succeeds, curly eq --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227E;')\"><xsl:value-of select=\"'\\precsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227E;')\"/></xsl:call-template></xsl:when>\t<!--/precsim R: precedes, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0227F;')\"><xsl:value-of select=\"'\\succsim '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0227F;')\"/></xsl:call-template></xsl:when>\t<!--/succsim R: succeeds, similar --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02280;')\"><xsl:value-of select=\"'\\nprec '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02280;')\"/></xsl:call-template></xsl:when>\t\t<!--/nprec N: not precedes --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02281;')\"><xsl:value-of select=\"'\\nsucc '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02281;')\"/></xsl:call-template></xsl:when>\t\t<!--/nsucc N: not succeeds --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02282;')\"><xsl:value-of select=\"'\\subset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02282;')\"/></xsl:call-template></xsl:when>\t<!--/subset R: subset or is implied by -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02283;')\"><xsl:value-of select=\"'\\supset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02283;')\"/></xsl:call-template></xsl:when>\t<!--/supset R: superset or implies -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02284;')\"><xsl:value-of select=\"'\\not\\subset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02284;')\"/></xsl:call-template></xsl:when>\t<!--not subset -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02285;')\"><xsl:value-of select=\"'\\not\\supset '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02285;')\"/></xsl:call-template></xsl:when>\t<!--not superset -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02286;')\"><xsl:value-of select=\"'\\subseteq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02286;')\"/></xsl:call-template></xsl:when>\t<!--/subseteq R: subset, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02287;')\"><xsl:value-of select=\"'\\supseteq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02287;')\"/></xsl:call-template></xsl:when>\t<!--/supseteq R: superset, equals -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0228E;')\"><xsl:value-of select=\"'\\uplus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0228E;')\"/></xsl:call-template></xsl:when>\t\t<!--/uplus B: plus sign in union -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02293;')\"><xsl:value-of select=\"'\\sqcap '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02293;')\"/></xsl:call-template></xsl:when>\t\t<!--/sqcap B: square intersection -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02294;')\"><xsl:value-of select=\"'\\bigsqcup '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02294;')\"/></xsl:call-template></xsl:when>\t\t<!--/sqcup B: square union -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02295;')\"><xsl:value-of select=\"'\\oplus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02295;')\"/></xsl:call-template></xsl:when>\t\t<!--/oplus B: plus sign in circle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02296;')\"><xsl:value-of select=\"'\\ominus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02296;')\"/></xsl:call-template></xsl:when>\t<!--/ominus B: minus sign in circle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02297;')\"><xsl:value-of select=\"'\\otimes '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02297;')\"/></xsl:call-template></xsl:when>\t<!--/otimes B: multiply sign in circle -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x02298;')\"><xsl:value-of select=\"'\\oslash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02298;')\"/></xsl:call-template></xsl:when>\t<!--/oslash B: solidus in circle -->\r\n<!-- ? -->\t<xsl:when test=\"starts-with($content,'&#x02299;')\"><xsl:value-of select=\"'\\odot '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x02299;')\"/></xsl:call-template></xsl:when>\t\t<!--/odot B: middle dot in circle --> <!--/bigodot L: circle dot operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x0229F;')\"><xsl:value-of select=\"'\\boxminus '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x0229F;')\"/></xsl:call-template></xsl:when>\t<!--/boxminus B: minus sign in box --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A4;')\"><xsl:value-of select=\"'\\top '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A4;')\"/></xsl:call-template></xsl:when>\t\t<!--/top top -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A5;')\"><xsl:value-of select=\"'\\perp '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A5;')\"/></xsl:call-template></xsl:when>\t\t<!--/perp R: perpendicular --><!--/bot bottom -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A6;')\"><xsl:value-of select=\"'\\vdash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A6;')\"/></xsl:call-template></xsl:when>\t\t<!--/vdash R: vertical, dash -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A7;')\"><xsl:value-of select=\"'\\vDash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A7;')\"/></xsl:call-template></xsl:when>\t\t<!--/vDash R: vertical, dbl dash --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022A8;')\"><xsl:value-of select=\"'\\models '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022A8;')\"/></xsl:call-template></xsl:when>\t<!--/models R: -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022AA;')\"><xsl:value-of select=\"'\\Vvdash '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022AA;')\"/></xsl:call-template></xsl:when>\t<!--/Vvdash R: triple vertical, dash --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C0;')\"><xsl:value-of select=\"'\\bigwedge '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C0;')\"/></xsl:call-template></xsl:when>\t<!--/bigwedge L: logical or operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C1;')\"><xsl:value-of select=\"'\\bigvee '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C1;')\"/></xsl:call-template></xsl:when>\t<!--/bigcap L: intersection operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C2;')\"><xsl:value-of select=\"'\\bigcap '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C2;')\"/></xsl:call-template></xsl:when>\t<!--/bigvee L: logical and operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C3;')\"><xsl:value-of select=\"'\\bigcup '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C3;')\"/></xsl:call-template></xsl:when>\t<!--/bigcup L: union operator -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C4;')\"><xsl:value-of select=\"'\\diamond '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C4;')\"/></xsl:call-template></xsl:when>\t<!--/diamond B: open diamond -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C5;')\"><xsl:value-of select=\"'\\cdot '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C5;')\"/></xsl:call-template></xsl:when>\t\t<!--/cdot B: small middle dot -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C6;')\"><xsl:value-of select=\"'\\star '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C6;')\"/></xsl:call-template></xsl:when>\t\t<!--/star B: small star, filled -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C7;')\"><xsl:value-of select=\"'\\divideontimes '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C7;')\"/></xsl:call-template></xsl:when>\t<!--/divideontimes B: division on times --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022C8;')\"><xsl:value-of select=\"'\\bowtie '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022C8;')\"/></xsl:call-template></xsl:when>\t<!--/bowtie R: -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022CD;')\"><xsl:value-of select=\"'\\backsimeq '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022CD;')\"/></xsl:call-template></xsl:when>\t<!--/backsimeq R: reverse similar, eq --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022EF;')\"><xsl:value-of select=\"'\\cdots '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022EF;')\"/></xsl:call-template></xsl:when>\t\t<!--/cdots, three dots, centered -->\r\n<!--\t\t<xsl:when test=\"starts-with($content,'&#x022F0;')\"><xsl:value-of select=\"' '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022F0;')\"/></xsl:call-template></xsl:when>\t\tthree dots, ascending -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x022F1;')\"><xsl:value-of select=\"'\\ddots '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x022F1;')\"/></xsl:call-template></xsl:when>\t\t<!--/ddots, three dots, descending -->\r\n\r\n<!-- ====================================================================== -->\t\t\r\n\t\t<xsl:when test=\"starts-with($content,'&#x025A1;')\"><xsl:value-of select=\"'\\square '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x025A1;')\"/></xsl:call-template></xsl:when>\t<!--/square, square --> <!-- Required amssymb -->\r\n\t\t<xsl:when test=\"starts-with($content,'&#x025AA;')\"><xsl:value-of select=\"'\\blacksquare '\" /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '&#x025AA;')\"/></xsl:call-template></xsl:when>\t<!--/blacksquare, square, filled  --> <!-- Required amssymb -->\r\n\t\t\r\n\t\t<xsl:when test='starts-with($content,\"&apos;\")'><xsl:value-of select='\"\\text{&apos;}\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select='substring-after($content, \"&apos;\")'/></xsl:call-template></xsl:when><!-- \\text required amslatex -->\r\n\t\t<xsl:when test='starts-with($content,\"(\")'><xsl:value-of select='\"\\left(\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '(')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\")\")'><xsl:value-of select='\"\\right)\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, ')')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"[\")'><xsl:value-of select='\"\\left[\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '[')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"]\")'><xsl:value-of select='\"\\right]\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, ']')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"{\")'><xsl:value-of select='\"\\left\\{\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '{')\"/></xsl:call-template></xsl:when>\r\n\t\t<xsl:when test='starts-with($content,\"}\")'><xsl:value-of select='\"\\right\\}\"' /><xsl:call-template name=\"replaceEntities\"><xsl:with-param name=\"content\" select=\"substring-after($content, '}')\"/></xsl:call-template></xsl:when>\r\n\t\t\r\n\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:value-of select=\"substring($content,1,1)\"/>\r\n\t\t\t<xsl:call-template name=\"replaceEntities\">\r\n\t\t\t\t<xsl:with-param name=\"content\" select=\"substring($content, 2)\"/>\r\n\t\t\t</xsl:call-template>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose></xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"replaceMtextEntities\">\r\n\t<xsl:param name=\"content\"/>\r\n\t<xsl:choose>\r\n\t<xsl:when test=\"contains($content,'&#x02009;&#x0200A;&#x0200A;')\">\t<!-- ThickSpace - space of width 5/18 em -->\r\n\t\t<xsl:call-template name=\"replaceMtextEntities\">\r\n\t\t\t<xsl:with-param name=\"content\" select=\"concat(substring-before($content,'&#x02009;&#x0200A;&#x0200A;'),'\\hspace{0.28em}',substring-after($content,'&#x02009;&#x0200A;&#x0200A;'))\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:when>\r\n\t<xsl:when test=\"contains($content,'&#x02009;')\">\t<!-- ThinSpace - space of width 3/18 em -->\r\n\t\t<xsl:call-template name=\"replaceMtextEntities\">\r\n\t\t\t<xsl:with-param name=\"content\" select=\"concat(substring-before($content,'&#x02009;'),'\\hspace{0.17em}',substring-after($content,'&#x02009;'))\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:when>\r\n\t<xsl:otherwise>\r\n\t\t<xsl:value-of select=\"normalize-space($content)\"/>\r\n\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<!--xsl:include href=\"cmarkup.xsl\"/-->\r\n<!-- 4.4.1.1 cn -->\r\n<xsl:template match=\"m:cn\"><xsl:apply-templates/></xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='complex-cartesian']\">\r\n\t<xsl:apply-templates select=\"text()[1]\"/>\r\n  \t<xsl:text>+</xsl:text>\r\n\t<xsl:apply-templates select=\"text()[2]\"/>\r\n\t<xsl:text>i</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='rational']\">\r\n\t<xsl:apply-templates select=\"text()[1]\"/>\r\n\t<xsl:text>/</xsl:text>\r\n\t<xsl:apply-templates select=\"text()[2]\"/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='integer' and @base!=10]\">\r\n\t\t<xsl:apply-templates/>\r\n\t\t<xsl:text>_{</xsl:text><xsl:value-of select=\"@base\"/><xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='complex-polar']\">\r\n\t<xsl:apply-templates select=\"text()[1]\"/>\r\n\t<xsl:text>e^{i </xsl:text>\r\n\t<xsl:apply-templates select=\"text()[2]\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:cn[@type='e-notation']\">\r\n    <xsl:apply-templates select=\"text()[1]\"/>\r\n    <xsl:text>E</xsl:text>\r\n    <xsl:apply-templates select=\"text()[2]\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.1.1 ci 4.4.1.2 csymbol -->\r\n<xsl:template match=\"m:ci | m:csymbol\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"string-length(normalize-space(text()))>1\">\r\n\t\t\t<xsl:text>\\mathrm{</xsl:text><xsl:apply-templates/><xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:apply-templates/></xsl:otherwise>\r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.1 apply 4.4.2.2 reln -->\r\n<xsl:template match=\"m:apply | m:reln\">\r\n\t<xsl:apply-templates select=\"*[1]\">\r\n\t<!-- <? -->\r\n\t\t<xsl:with-param name=\"p\" select=\"10\"/>\r\n\t</xsl:apply-templates>\r\n\t<!-- ?> -->\r\n \t<xsl:text>(</xsl:text>\r\n\t<xsl:for-each select=\"*[position()>1]\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"not(position()=last())\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n \t<xsl:text>)</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.3 fn -->\r\n<xsl:template match=\"m:fn[m:apply[1]]\"> <!-- for m:fn using default rule -->\r\n\t<xsl:text>(</xsl:text><xsl:apply-templates/><xsl:text>)</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.4 interval -->\r\n<xsl:template match=\"m:interval[*[2]]\">\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@closure='open' or @closure='open-closed'\">\r\n\t\t\t<xsl:text>\\left(</xsl:text>\t\t\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\left[</xsl:text></xsl:otherwise> \r\n\t</xsl:choose>\r\n\t<xsl:apply-templates select=\"*[1]\"/>\r\n\t<xsl:text> , </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"@closure='open' or @closure='closed-open'\">\r\n\t\t\t<xsl:text>\\right)</xsl:text>\t\t\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise><xsl:text>\\right]</xsl:text></xsl:otherwise> \r\n\t</xsl:choose>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:interval\">\r\n\t<xsl:text>\\left\\{</xsl:text><xsl:apply-templates/><xsl:text>\\right\\}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.5 inverse -->\r\n<xsl:template match=\"m:apply[*[1][self::m:inverse]]\">\r\n\t<xsl:apply-templates select=\"*[2]\"/><xsl:text>^{(-1)}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.6 sep 4.4.2.7 condition -->\r\n<xsl:template match=\"m:sep | m:condition\"><xsl:apply-templates/></xsl:template>\r\n\r\n<!-- 4.4.2.9 lambda -->\r\n<xsl:template match=\"m:lambda\">\r\n\t<xsl:text>\\mathrm{lambda}\\: </xsl:text>\r\n  \t<xsl:apply-templates select=\"m:bvar/*\"/>\r\n  \t<xsl:text>.\\: </xsl:text>\r\n  <xsl:apply-templates select=\"*[last()]\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.10 compose -->\r\n<xsl:template match=\"m:apply[*[1][self::m:compose]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\circ </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.11 ident -->\r\n<xsl:template match=\"m:ident\"><xsl:text>\\mathrm{id}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.2.12 domain 4.4.2.13 codomain 4.4.2.14 image 4.4.3.21 arg 4.4.3.24 lcm\r\n\t\t4.4.5.9 grad 4.4.5.10 curl 4.4.9.4 median 4.4.9.5 mode-->\r\n<xsl:template match=\"m:domain | m:codomain | m:image | m:arg | m:lcm | m:grad |\r\n\t\t\t\t\t\t\t\t m:curl | m:median | m:mode\">\r\n\t<xsl:text>\\mathop{\\mathrm{</xsl:text>\r\n\t<xsl:value-of select=\"local-name()\"/>\r\n\t<xsl:text>}}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.15 domainofapplication -->\r\n<xsl:template match=\"m:domainofapplication\"/>\r\n\r\n<!-- 4.4.2.16 piecewise -->\r\n<xsl:template match=\"m:piecewise\">\r\n\t<xsl:text>\\begin{cases}</xsl:text>\r\n\t<xsl:apply-templates select=\"m:piece\"/>\r\n\t<xsl:apply-templates select=\"m:otherwise\"/>\r\n\t<xsl:text>\\end{cases}</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:piece\">\r\n\t\t<xsl:apply-templates select=\"*[1]\"/>\r\n\t\t<xsl:text> &amp; \\text{if $</xsl:text>\r\n\t\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t\t<xsl:text>$}</xsl:text>\r\n\t\t<xsl:if test=\"not(position()=last()) or ../m:otherwise\"><xsl:text>\\\\ </xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:otherwise\">\r\n\t<xsl:apply-templates select=\"*[1]\"/>\r\n\t<xsl:text> &amp; \\text{otherwise}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.1 quotient -->\r\n<xsl:template match=\"m:apply[*[1][self::m:quotient]]\">\r\n\t<xsl:text>\\left\\lfloor\\frac{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>}{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\"/>\r\n\t<xsl:text>}\\right\\rfloor </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.2 factorial -->\r\n<xsl:template match=\"m:apply[*[1][self::m:factorial]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>!</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.3 divide -->\r\n<xsl:template match=\"m:apply[*[1][self::m:divide]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"this-p\" select=\"3\"/>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>\\left(</xsl:text></xsl:if>\r\n  <xsl:text>\\frac{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n<!--\t\t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>-->\r\n\t<xsl:text>}{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\"/>\r\n<!--    \t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>-->\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:if test=\"$this-p &lt; $p\"><xsl:text>\\right)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.4 max min -->\r\n<xsl:template match=\"m:apply[*[1][self::m:max or self::m:min]]\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text>\\{</xsl:text>\r\n   <xsl:choose>\r\n\t\t<xsl:when test=\"m:condition\">\r\n   \t\t<xsl:apply-templates select=\"*[last()]\"/>\r\n   \t\t<xsl:text>, </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:condition/node()\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:for-each select=\"*[position() &gt; 1]\">\r\n\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t<xsl:if test=\"position() !=last()\"><xsl:text> , </xsl:text></xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:otherwise>\r\n   </xsl:choose>\r\n\t<xsl:text>\\}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.5  minus-->\r\n<xsl:template match=\"m:apply[*[1][self::m:minus] and count(*)=2]\">\r\n\t<xsl:text>-</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:minus] and count(*)&gt;2]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">-</xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.6  plus-->\r\n<xsl:template match=\"m:apply[*[1][self::m:plus]]\">\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:if test=\"$p &gt; 2\">\r\n\t\t<xsl:text>(</xsl:text>\r\n\t</xsl:if>\r\n  <xsl:for-each select=\"*[position()&gt;1]\">\r\n   <xsl:if test=\"position() &gt; 1\">\r\n    <xsl:choose>\r\n      <xsl:when test=\"self::m:apply[*[1][self::m:times] and\r\n      *[2][self::m:apply/*[1][self::m:minus] or self::m:cn[not(m:sep) and\r\n      (number(.) &lt; 0)]]]\">-</xsl:when>\r\n      <xsl:otherwise>+</xsl:otherwise>\r\n    </xsl:choose>\r\n   </xsl:if>   \r\n    <xsl:choose>\r\n      <xsl:when test=\"self::m:apply[*[1][self::m:times] and\r\n      *[2][self::m:cn[not(m:sep) and (number(.) &lt;0)]]]\">\r\n\t\t\t<xsl:value-of select=\"-(*[2])\"/>\r\n\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t     <xsl:with-param name=\"first\" select=\"2\"/>\r\n\t\t     <xsl:with-param name=\"p\" select=\"2\"/>\r\n\t\t   </xsl:apply-templates>\r\n       </xsl:when>\r\n      <xsl:when test=\"self::m:apply[*[1][self::m:times] and\r\n      *[2][self::m:apply/*[1][self::m:minus]]]\">\r\n\t\t\t\t<xsl:apply-templates select=\"./*[2]/*[2]\"/>\r\n\t\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t\t\t<xsl:with-param name=\"first\" select=\"2\"/>\r\n\t\t\t\t\t<xsl:with-param name=\"p\" select=\"2\"/>\r\n\t\t\t\t</xsl:apply-templates>\r\n\t\t\t</xsl:when>\r\n\t\t\t<xsl:otherwise>\r\n\t\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t\t\t<xsl:with-param name=\"p\" select=\"2\"/>\r\n\t\t\t\t</xsl:apply-templates>\r\n\t\t\t</xsl:otherwise>\r\n\t\t</xsl:choose>\r\n\t</xsl:for-each>\r\n\t<xsl:if test=\"$p &gt; 2\">\r\n\t\t<xsl:text>)</xsl:text>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.7 power -->\r\n<xsl:template match=\"m:apply[*[1][self::m:power]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>^{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.8 remainder -->\r\n<xsl:template match=\"m:apply[*[1][self::m:rem]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\mod </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.9  times-->\r\n<xsl:template match=\"m:apply[*[1][self::m:times]]\" name=\"times\">\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"first\" select=\"1\"/>\r\n  <xsl:if test=\"$p &gt; 3\"><xsl:text>(</xsl:text></xsl:if>\r\n  <xsl:for-each select=\"*[position()&gt;1]\">\r\n\t\t<xsl:if test=\"position() &gt; 1\">\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"self::m:cn\">\\times <!-- times --></xsl:when>\r\n\t\t\t\t<xsl:otherwise><!--invisible times--></xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t</xsl:if> \r\n\t\t<xsl:if test=\"position()&gt;= $first\">\r\n\t\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t\t<xsl:with-param name=\"p\" select=\"3\"/>\r\n\t\t\t</xsl:apply-templates>\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n  <xsl:if test=\"$p &gt; 3\"><xsl:text>)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.10 root -->\r\n<xsl:template match=\"m:apply[*[1][self::m:root]]\">\r\n\t<xsl:text>\\sqrt</xsl:text>\r\n\t<xsl:if test=\"m:degree!=2\">\r\n\t\t<xsl:text>[</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:degree/*\"/>\r\n\t\t<xsl:text>]</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text>{</xsl:text>\r\n\t<xsl:apply-templates select=\"*[position()&gt;1 and not(self::m:degree)]\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.11 gcd -->\r\n<xsl:template match=\"m:gcd\"><xsl:text>\\gcd </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.3.12 and -->\r\n<xsl:template match=\"m:apply[*[1][self::m:and]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\land <!-- and --></xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.13 or -->\r\n<xsl:template match=\"m:apply[*[1][self::m:or]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\lor </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.14 xor -->\r\n<xsl:template match=\"m:apply[*[1][self::m:xor]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\mathop{\\mathrm{xor}}</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.15 not -->\r\n<xsl:template match=\"m:apply[*[1][self::m:not]]\">\r\n\t<xsl:text>\\neg </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.16 implies -->\r\n<xsl:template match=\"m:apply[*[1][self::m:implies]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\implies </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.17 forall 4.4.3.18 exists -->\r\n<xsl:template match=\"m:apply[*[1][self::m:forall or self::m:exists]]\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"m:bvar\"/>\r\n\t<xsl:if test=\"m:condition\">\r\n\t\t<xsl:text>, </xsl:text><xsl:apply-templates select=\"m:condition\"/>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"*[last()][local-name()!='condition'][local-name()!='bvar']\">\r\n\t\t<xsl:text>\\colon </xsl:text>\r\n\t  <xsl:apply-templates select=\"*[last()]\"/>\r\n  </xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.19 abs -->\r\n<xsl:template match=\"m:apply[*[1][self::m:abs]]\">\r\n\t<xsl:text>\\left|</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>\\right|</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.20 conjugate -->\r\n<xsl:template match=\"m:apply[*[1][self::m:conjugate]]\">\r\n\t<xsl:text>\\overline{</xsl:text><xsl:apply-templates select=\"*[2]\"/><xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.22 real -->\r\n<xsl:template match=\"m:real\"><xsl:text>\\Re </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.3.23 imaginary -->\r\n<xsl:template match=\"m:imaginary\"><xsl:text>\\Im </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.3.25 floor -->\r\n<xsl:template match=\"m:apply[*[1][self::m:floor]]\">\r\n\t<xsl:text>\\lfloor </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>\\rfloor </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.3.25 ceiling -->\r\n<xsl:template match=\"m:apply[*[1][self::m:ceiling]]\">\r\n\t<xsl:text>\\lceil </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>\\rceil </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.1 eq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:eq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">=</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.2 neq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:neq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\neq </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.3 gt -->\r\n<xsl:template match=\"m:apply[*[1][self::m:gt]]\">\r\n<xsl:param name=\"p\" select=\"0\"/>\r\n<xsl:call-template name=\"infix\">\r\n\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t<xsl:with-param name=\"mo\">&gt; </xsl:with-param>\r\n</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.4 lt -->\r\n<xsl:template match=\"m:apply[*[1][self::m:lt]]\">\r\n<xsl:param name=\"p\" select=\"0\"/>\r\n<xsl:call-template name=\"infix\">\r\n\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t<xsl:with-param name=\"mo\">&lt; </xsl:with-param>\r\n</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.5 geq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:geq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\ge </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.6 leq -->\r\n<xsl:template match=\"m:apply[*[1][self::m:leq]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\le </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.7 equivalent -->\r\n<xsl:template match=\"m:apply[*[1][self::m:equivalent]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\equiv </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.8 approx -->\r\n<xsl:template match=\"m:apply[*[1][self::m:approx]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"1\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\approx </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.4.9 factorof -->\r\n<xsl:template match=\"m:apply[*[1][self::m:factorof]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\"> | </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.1 int -->\r\n<xsl:template match=\"m:apply[*[1][self::m:int]]\">\r\n\t<xsl:text>\\int</xsl:text>\r\n\t<xsl:if test=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\">\r\n\t\t<xsl:text>_{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"m:uplimit/*|m:interval/*[2]\">\r\n\t\t<xsl:text>^{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:uplimit/*|m:interval/*[2]\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t<xsl:text>\\,d </xsl:text>\r\n\t<xsl:apply-templates select=\"m:bvar\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.2 diff -->\r\n<xsl:template match=\"m:apply[*[1][self::m:diff] and m:ci and count(*)=2]\" priority=\"2\">\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>^\\prime </xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:diff]]\" priority=\"1\">\r\n\t<xsl:text>\\frac{</xsl:text>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"m:bvar/m:degree\">\r\n\t\t\t<xsl:text>d^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar/m:degree/node()\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t\t\t<xsl:text>}{d</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar/node()\"/>\r\n\t\t\t<xsl:text>^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar/m:degree/node()\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:text>d </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t\t\t<xsl:text>}{d </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:bvar\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.3 partialdiff -->\r\n<xsl:template match=\"m:apply[*[1][self::m:partialdiff] and m:list and m:ci and count(*)=3]\" priority=\"2\">\r\n\t<xsl:text>D_{</xsl:text>\r\n\t<xsl:for-each select=\"m:list[1]/*\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position()&lt;last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[3]\"/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:partialdiff]]\" priority=\"1\">\r\n\t<xsl:text>\\frac{\\partial^{</xsl:text>\r\n\t<xsl:choose>\r\n\t\t<xsl:when test=\"m:degree\">\r\n\t\t\t<xsl:apply-templates select=\"m:degree/node()\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:when test=\"m:bvar/m:degree[string(number(.))='NaN']\">\r\n\t\t\t<xsl:for-each select=\"m:bvar/m:degree\">\r\n\t\t\t\t<xsl:apply-templates select=\"node()\"/>\r\n\t\t\t\t<xsl:if test=\"position()&lt;last()\"><xsl:text>+</xsl:text></xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t\t<xsl:if test=\"count(m:bvar[not(m:degree)])&gt;0\">\r\n\t\t\t\t<xsl:text>+</xsl:text>\r\n\t\t\t\t<xsl:value-of select=\"count(m:bvar[not(m:degree)])\"/>\r\n\t\t\t</xsl:if>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:value-of select=\"sum(m:bvar/m:degree)+count(m:bvar[not(m:degree)])\"/>\r\n\t\t</xsl:otherwise>\r\n\t</xsl:choose>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t<xsl:text>}{</xsl:text>\r\n\t<xsl:for-each select=\"m:bvar\">\r\n\t\t<xsl:text>\\partial </xsl:text>\r\n\t\t<xsl:apply-templates select=\"node()\"/>\r\n\t\t<xsl:if test=\"m:degree\">\r\n\t\t\t<xsl:text>^{</xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:degree/node()\"/>\r\n\t\t\t<xsl:text>}</xsl:text>\r\n\t\t</xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.2.8 declare 4.4.5.4 lowlimit 4.4.5.5 uplimit 4.4.5.7 degree 4.4.9.5 momentabout -->\r\n<xsl:template match=\"m:declare | m:lowlimit | m:uplimit | m:degree | m:momentabout\"/>\r\n\r\n<!-- 4.4.5.6  bvar-->\r\n<xsl:template match=\"m:bvar\">\r\n\t<xsl:apply-templates/>\r\n\t<xsl:if test=\"following-sibling::m:bvar\"><xsl:text>, </xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.5.8 divergence-->\r\n<xsl:template match=\"m:divergence\"><xsl:text>\\mathop{\\mathrm{div}}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.5.11 laplacian-->\r\n<xsl:template match=\"m:laplacian\"><xsl:text>\\nabla^2 </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.6.1 set -->\r\n<xsl:template match=\"m:set\">\r\n\t<xsl:text>\\{</xsl:text><xsl:call-template name=\"set\"/><xsl:text>\\}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.2 list -->\r\n<xsl:template match=\"m:list\">\r\n\t<xsl:text>\\left[</xsl:text><xsl:call-template name=\"set\"/><xsl:text>\\right]</xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"set\">\r\n   <xsl:choose>\r\n\t\t<xsl:when test=\"m:condition\">\r\n   \t\t<xsl:apply-templates select=\"m:bvar/*[not(self::bvar or self::condition)]\"/>\r\n   \t\t<xsl:text>\\colon </xsl:text>\r\n\t\t\t<xsl:apply-templates select=\"m:condition/node()\"/>\r\n\t\t</xsl:when>\r\n\t\t<xsl:otherwise>\r\n\t\t\t<xsl:for-each select=\"*\">\r\n\t\t\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t\t\t<xsl:if test=\"position()!=last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t\t\t</xsl:for-each>\r\n\t\t</xsl:otherwise>\r\n   </xsl:choose>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.3 union -->\r\n<xsl:template match=\"m:apply[*[1][self::m:union]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\cup </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.4 intersect -->\r\n<xsl:template match=\"m:apply[*[1][self::m:intersect]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\cap </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.5 in -->\r\n<xsl:template match=\"m:apply[*[1][self::m:in]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\in </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.5 notin -->\r\n<xsl:template match=\"m:apply[*[1][self::m:notin]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"mo\">\\notin </xsl:with-param>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"this-p\" select=\"3\"/>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.7 subset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:subset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\subseteq </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.8 prsubset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:prsubset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\subset </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.9 notsubset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:notsubset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\nsubseteq </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.10 notprsubset -->\r\n<xsl:template match=\"m:apply[*[1][self::m:notprsubset]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\not\\subset </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.11 setdiff -->\r\n<xsl:template match=\"m:apply[*[1][self::m:setdiff]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\setminus </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.12 card -->\r\n<xsl:template match=\"m:apply[*[1][self::m:card]]\">\r\n\t<xsl:text>|</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>|</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.6.13 cartesianproduct 4.4.10.6 vectorproduct -->\r\n<xsl:template match=\"m:apply[*[1][self::m:cartesianproduct or self::m:vectorproduct]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\times </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<xsl:template\r\nmatch=\"m:apply[*[1][self::m:cartesianproduct][count(following-sibling::m:reals)=count(following-sibling::*)]]\"\r\npriority=\"2\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"5\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>^{</xsl:text>\r\n\t<xsl:value-of select=\"count(*)-1\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.1 sum -->\r\n<xsl:template match=\"m:apply[*[1][self::m:sum]]\">\r\n\t<xsl:text>\\sum</xsl:text><xsl:call-template name=\"series\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.2 product -->\r\n<xsl:template match=\"m:apply[*[1][self::m:product]]\">\r\n\t<xsl:text>\\prod</xsl:text><xsl:call-template name=\"series\"/>\r\n</xsl:template>\r\n\t\r\n<xsl:template name=\"series\">\r\n\t<xsl:if test=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\">\r\n\t\t<xsl:text>_{</xsl:text>\r\n\t\t<xsl:if test=\"not(m:condition)\">\r\n\t\t\t<xsl:apply-templates select=\"m:bvar\"/>\r\n\t\t\t<xsl:text>=</xsl:text>\r\n\t\t</xsl:if>\r\n\t\t<xsl:apply-templates select=\"m:lowlimit/*|m:interval/*[1]|m:condition/*\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"m:uplimit/*|m:interval/*[2]\">\r\n\t\t<xsl:text>^{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:uplimit/*|m:interval/*[2]\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.3 limit -->\r\n<xsl:template match=\"m:apply[*[1][self::m:limit]]\">\r\n\t<xsl:text>\\lim_{</xsl:text>\r\n\t<xsl:apply-templates select=\"m:lowlimit|m:condition/*\"/>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[m:limit]/m:lowlimit\" priority=\"3\">\r\n\t<xsl:apply-templates select=\"../m:bvar/node()\"/>\r\n\t<xsl:text>\\to </xsl:text>\r\n\t<xsl:apply-templates/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.7.4 tendsto -->\r\n<xsl:template match=\"m:apply[*[1][self::m:tendsto]]\">\r\n\t<xsl:param name=\"p\"/>\r\n\t<xsl:call-template name=\"binary\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\r\n\t\t\t<xsl:choose>\r\n\t\t\t\t<xsl:when test=\"@type='above'\">\\searrow </xsl:when>\r\n\t\t\t\t<xsl:when test=\"@type='below'\">\\nearrow </xsl:when>\r\n\t\t\t\t<xsl:when test=\"@type='two-sided'\">\\rightarrow </xsl:when>\r\n\t\t\t\t<xsl:otherwise>\\to </xsl:otherwise>\r\n\t\t\t</xsl:choose>\r\n\t\t</xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.8.1 common tringonometric functions 4.4.8.3 natural logarithm -->\r\n<xsl:template match=\"m:apply[*[1][\r\n self::m:sin or \t\tself::m:cos or \tself::m:tan or\t\tself::m:sec or\r\n self::m:csc or \t\tself::m:cot or \tself::m:sinh or\t \tself::m:cosh or\r\n self::m:tanh or \t\tself::m:coth or\tself::m:arcsin or \tself::m:arccos or\r\n self::m:arctan or \tself::m:ln]]\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text> </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:sin | m:cos | m:tan | m:sec | m:csc |\r\n\t\t\t\t\t\t\t\t m:cot | m:sinh | m:cosh | m:tanh | m:coth |\r\n\t\t\t\t\t\t\t\t m:arcsin | m:arccos | m:arctan | m:ln\">\r\n\t<xsl:text>\\</xsl:text>\r\n\t<xsl:value-of select=\"local-name(.)\"/>\r\n\t<xsl:text> </xsl:text>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][\r\n self::m:sech or \t\tself::m:csch or\t\tself::m:arccosh or\r\n self::m:arccot or \tself::m:arccoth or \tself::m:arccsc or\r\n self::m:arccsch or self::m:arcsec or \tself::m:arcsech or\r\n self::m:arcsinh or self::m:arctanh]]\">\r\n\t<xsl:text>\\mathrm{</xsl:text>\r\n\t<xsl:value-of select=\"local-name(*[1])\"/>\r\n\t<xsl:text>\\,}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:sech | m:csch | m:arccosh | m:arccot |\r\n\t\t\t\t\t\t\t\t m:arccoth | m:arccsc |m:arccsch |m:arcsec |\r\n\t\t\t\t\t\t\t\t m:arcsech | m:arcsinh | m:arctanh\">\r\n\t<xsl:text>\\mathrm{</xsl:text>\r\n\t<xsl:value-of select=\"local-name(.)\"/>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.8.2 exp -->\r\n<xsl:template match=\"m:apply[*[1][self::m:exp]]\">\r\n\t<xsl:text>e^{</xsl:text><xsl:apply-templates select=\"*[2]\"/><xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.8.4 log -->\r\n<xsl:template match=\"m:apply[*[1][self::m:log]]\">\r\n\t<xsl:text>\\lg </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:log] and m:logbase != 10]\">\r\n\t<xsl:text>\\log_{</xsl:text>\r\n\t<xsl:apply-templates select=\"m:logbase/node()\"/>\r\n\t<xsl:text>}</xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<!-- 4.4.9.1 mean -->\r\n<xsl:template match=\"m:apply[*[1][self::m:mean]]\">\r\n\t<xsl:text>\\langle </xsl:text>\r\n\t<xsl:for-each select=\"*[position()&gt;1]\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position() !=last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>\\rangle </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.9.2 sdef -->\r\n<xsl:template match=\"m:sdev\"><xsl:text>\\sigma </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.9.3 variance -->\r\n<xsl:template match=\"m:apply[*[1][self::m:variance]]\">\r\n\t<xsl:text>\\sigma(</xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\"/>\r\n\t<xsl:text>)^2</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.9.5 moment -->\r\n<xsl:template match=\"m:apply[*[1][self::m:moment]]\">\r\n\t<xsl:text>\\langle </xsl:text>\r\n\t<xsl:apply-templates select=\"*[last()]\"/>\r\n\t<xsl:text>^{</xsl:text>\r\n\t<xsl:apply-templates select=\"m:degree/node()\"/>\r\n\t<xsl:text>}\\rangle</xsl:text>\r\n\t<xsl:if test=\"m:momentabout\">\r\n\t\t<xsl:text>_{</xsl:text>\r\n\t\t<xsl:apply-templates select=\"m:momentabout/node()\"/>\r\n\t\t<xsl:text>}</xsl:text>\r\n\t</xsl:if>\r\n\t<xsl:text> </xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.1 vector  -->\r\n<xsl:template match=\"m:vector\">\r\n\t<xsl:text>\\left(\\begin{array}{c}</xsl:text>\r\n\t<xsl:for-each select=\"*\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position()!=last()\"><xsl:text>\\\\ </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>\\end{array}\\right)</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.2 matrix  -->\r\n<xsl:template match=\"m:matrix\">\r\n\t<xsl:text>\\begin{pmatrix}</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>\\end{pmatrix}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.3 matrixrow  -->\r\n<xsl:template match=\"m:matrixrow\">\r\n\t<xsl:for-each select=\"*\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position()!=last()\"><xsl:text> &amp; </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:if test=\"position()!=last()\"><xsl:text>\\\\ </xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.4 determinant  -->\r\n<xsl:template match=\"m:apply[*[1][self::m:determinant]]\">\r\n\t<xsl:text>\\det </xsl:text>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n</xsl:template>\r\n\r\n<xsl:template match=\"m:apply[*[1][self::m:determinant]][*[2][self::m:matrix]]\" priority=\"2\">\r\n\t<xsl:text>\\begin{vmatrix}</xsl:text>\r\n\t<xsl:apply-templates select=\"m:matrix/*\"/>\r\n\t<xsl:text>\\end{vmatrix}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.5 transpose -->\r\n<xsl:template match=\"m:apply[*[1][self::m:transpose]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>^T</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.5 selector -->\r\n<xsl:template match=\"m:apply[*[1][self::m:selector]]\">\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"7\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:text>_{</xsl:text>\r\n\t<xsl:for-each select=\"*[position()&gt;2]\">\r\n\t\t<xsl:apply-templates select=\".\"/>\r\n\t\t<xsl:if test=\"position() !=last()\"><xsl:text>, </xsl:text></xsl:if>\r\n\t</xsl:for-each>\r\n\t<xsl:text>}</xsl:text>\r\n</xsl:template>\r\n\r\n<!-- 4.4.10.7 scalarproduct 4.4.10.8 outerproduct -->\r\n<xsl:template match=\"m:apply[*[1][self::m:scalarproduct or self::m:outerproduct]]\">\r\n\t<xsl:param name=\"p\" select=\"0\"/>\r\n\t<xsl:call-template name=\"infix\">\r\n\t\t<xsl:with-param name=\"this-p\" select=\"2\"/>\r\n\t\t<xsl:with-param name=\"p\" select=\"$p\"/>\r\n\t\t<xsl:with-param name=\"mo\">\\dot </xsl:with-param>\r\n\t</xsl:call-template>\r\n</xsl:template>\r\n\r\n<!-- 4.4.11.2 semantics -->\r\n<xsl:template match=\"m:semantics\"><xsl:apply-templates select=\"*[1]\"/></xsl:template>\r\n\r\n<xsl:template match=\"m:semantics[m:annotation/@encoding='TeX']\">\r\n\t<xsl:apply-templates select=\"m:annotation[@encoding='TeX']/node()\"/>\r\n</xsl:template>\r\n\r\n<!-- 4.4.12.1 integers -->\r\n<xsl:template match=\"m:integers\"><xsl:text>\\mathbb{Z}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.2 reals -->\r\n<xsl:template match=\"m:reals\"><xsl:text>\\mathbb{R}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.3 rationals -->\r\n<xsl:template match=\"m:rationals\"><xsl:text>\\mathbb{Q}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.4 naturalnumbers -->\r\n<xsl:template match=\"m:naturalnumbers\"><xsl:text>\\mathbb{N}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.5 complexes -->\r\n<xsl:template match=\"m:complexes\"><xsl:text>\\mathbb{C}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.6 primes -->\r\n<xsl:template match=\"m:primes\"><xsl:text>\\mathbb{P}</xsl:text></xsl:template>\r\n\t\r\n<!-- 4.4.12.7 exponentiale -->\r\n<xsl:template match=\"m:exponentiale\"><xsl:text>e</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.8 imaginaryi -->\r\n<xsl:template match=\"m:imaginaryi\"><xsl:text>i</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.9 notanumber -->\r\n<xsl:template match=\"m:notanumber\"><xsl:text>NaN</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.10 true -->\r\n<xsl:template match=\"m:true\"><xsl:text>\\mbox{true}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.11 false -->\r\n<xsl:template match=\"m:false\"><xsl:text>\\mbox{false}</xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.12 emptyset -->\r\n<xsl:template match=\"m:emptyset\"><xsl:text>\\emptyset </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.13 pi -->\r\n<xsl:template match=\"m:pi\"><xsl:text>\\pi </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.14 eulergamma -->\r\n<xsl:template match=\"m:eulergamma\"><xsl:text>\\gamma </xsl:text></xsl:template>\r\n\r\n<!-- 4.4.12.15 infinity -->\r\n<xsl:template match=\"m:infinity\"><xsl:text>\\infty </xsl:text></xsl:template>\r\n\r\n<!-- ****************************** -->\r\n<xsl:template name=\"infix\" >\r\n  <xsl:param name=\"mo\"/>\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"this-p\" select=\"0\"/>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>(</xsl:text></xsl:if>\r\n  <xsl:for-each select=\"*[position()&gt;1]\">\r\n\t\t<xsl:if test=\"position() &gt; 1\">\r\n\t\t\t<xsl:copy-of select=\"$mo\"/>\r\n\t\t</xsl:if>   \r\n\t\t<xsl:apply-templates select=\".\">\r\n\t\t\t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t\t</xsl:apply-templates>\r\n\t</xsl:for-each>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:template name=\"binary\" >\r\n  <xsl:param name=\"mo\"/>\r\n  <xsl:param name=\"p\" select=\"0\"/>\r\n  <xsl:param name=\"this-p\" select=\"0\"/>\r\n  <xsl:if test=\"$this-p &lt; $p\"><xsl:text>(</xsl:text></xsl:if>\r\n\t<xsl:apply-templates select=\"*[2]\">\r\n\t\t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:value-of select=\"$mo\"/>\r\n\t<xsl:apply-templates select=\"*[3]\">\r\n    \t<xsl:with-param name=\"p\" select=\"$this-p\"/>\r\n\t</xsl:apply-templates>\r\n\t<xsl:if test=\"$this-p &lt; $p\"><xsl:text>)</xsl:text></xsl:if>\r\n</xsl:template>\r\n\r\n<!-- Note: variables colora (template color) and symbola (template startspace) only for Sablotron -->\r\n\r\n<xsl:template name=\"startspace\">\r\n\t<xsl:param name=\"symbol\"/>\r\n\t<xsl:if test=\"contains($symbol,' ')\">\r\n\t\t<xsl:variable name=\"symbola\" select=\"concat(substring-before($symbol,' '),substring-after($symbol,' '))\"/>\r\n\t\t<xsl:call-template name=\"startspace\">\r\n\t\t\t<xsl:with-param name=\"symbol\" select=\"$symbola\"/>\r\n\t\t</xsl:call-template>\r\n\t</xsl:if>\r\n\t<xsl:if test=\"not(contains($symbol,' '))\">\r\n\t\t<xsl:value-of select=\"$symbol\"/>\r\n\t</xsl:if>\r\n</xsl:template>\r\n\r\n<xsl:strip-space elements=\"m:*\"/>\r\n\r\n<xsl:template match=\"m:math\">\r\n\t<xsl:text>&#x00024;</xsl:text>\r\n\t<xsl:apply-templates/>\r\n\t<xsl:text>&#x00024;</xsl:text>\r\n</xsl:template>\r\n\r\n</xsl:stylesheet>\r\n";
    //MathML input widget
    var Widget = P(function (widget) {
        this.version = '0.3.12';
        widget.init = function (el, configXML, eventCallback, restrictContentFlag) {
            var self = this;
            this.el = el;
            this.configXML = configXML;
            this.eventCallback = eventCallback;

            //Parse XML:
            var xml = this.xml = $(configXML);

            //Create placeholder element (represents widget in layout) and content element (gets scaled)
            $(el).addClass('widget');
            this.$placeholder = $('<div class="widget-placeholder">').appendTo(el);
            this.$body = $('<div class="widget-body">').appendTo(el);

            //Create inputs
            var $inputs = this.$inputs = $('<div class="inputs"></div>').appendTo(this.$body);
            xml.find('editorRow').each(function (i) {
                var latexText = $(this).text().trim();
                //update dynamic width regex formatter..
                if (latexText == '' || !/\\MathQuillMathField\{/i.test(latexText)) {
                    latexText = '\\MathQuillMathField\{' + latexText + '}';
                    $('<div class="input"><span class="input-box"></span></div>')
                      .children().text(latexText).end()
                    .appendTo($inputs)
                    .find('.input-box').mathquill();
                } else {
                    $('<div class="input mje_dynamic_inputbox"><span class="input-box"></span></div>')
                        .children().text(latexText).end()
                        .appendTo($inputs)
                        .find('.input-box').mathquill();
                }
            });

            //isValid indicates whether the user has changed the content from its original state
            //This is an external-facing API for AIR, so don't change the name of this function without
            //coordinating with them
            this.isValid = function() {
                return JSON.stringify(this.getLatexResponses()) != JSON.stringify(this.initialResponses);
            };            

            //Initialize regex map
            this.restrictContentFlag = (typeof restrictContentFlag == 'undefined') ? true : restrictContentFlag; //default behaviour is true
            if (this.restrictContentFlag) {
                this.AutoCmds = {
                    //Hack By Sandeep K: custom autocmds for air
                    sin: 1,
                    cos: 1,
                    tan: 1,
                    arcsin: 1,
                    arccos: 1,
                    arctan: 1,
                    sqrt: 1,
                    nthroot: 1,
                    sum: 1,
                    prod: 1,
                    pi: 1,
                    phi: 1,
                    tau: 1,
                    gamma: 1,
                    theta: 1 /*,
  int: 1*/
                };
                this.restrictContentKeys = new RegexMap();
            }

            this.mathOperatorOverride = [];

            //Build keypad based on XML input
            this.createKeypad(xml).appendTo(this.$body);

            this.sendKey = function (key) {
                this.lastFocusedMathquill.mathquill('onKey', key);
            };

            //Keep track of mathquill focus
            this.lastFocusedMathquill = $inputs.find('.mathquill-editable:first');
            // Sandeep K: attach focus to touch or click event instead of focusin
            var is_ios = navigator.userAgent.match(/(iPad|iPhone|iPod)/i) !== null;
            //console.log('######******* ios' + is_ios);
            if (is_ios) {
                $inputs.on('touchstart click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var focusedMathquill = $(e.target).closest('.mathquill-editable');
                    if (focusedMathquill.length) {
                        self.lastFocusedMathquill = focusedMathquill;
                    }
                    self.lastFocusedMathquill.mathquill('focus');
                });
            } else {
                $inputs.on('focusin', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var focusedMathquill = $(e.target).closest('.mathquill-editable');
                    if (focusedMathquill.length) {
                        self.lastFocusedMathquill = focusedMathquill;
                    }
                    //self.lastFocusedMathquill.mathquill('focus');
                });
            }           

            //compile the restrictfeature
            if (this.restrictContentFlag) this.restrictContentKeys.compile();
	        //attach AIR properties to mathquill..overrideoperators and restrictcontentkeys
            this.$inputs.find('.mathquill-editable').each(function (i) {
                if (self.mathOperatorOverride) {
                    $(this).mathquill('mathOperatorOverride', self.mathOperatorOverride);
                }
                if (self.restrictContentFlag) {
                    $(this).mathquill('restrictContentKeys', self.restrictContentKeys);
                }
            });
	        

            //Initialize scaling
            this.$body.on('render', function () { self.resize(); });
            this.scale(1);

            //Initialize undo/redo
            this.undoStack = [];
            this.redoStack = [];
            this.undoState = this.getLatexResponses();
            this.initialResponses = this.getLatexResponses();
            this.$body.on('render', function () { pushUndoState(self); })
            .on('keydown', function (evt) {
                // below from https://github.com/desmosinc/knox/blob/0f7c988b1a778bdcd46bf03a9ce12c7b3767ce93/frontend/desmos/public/assets/js/main/undoredo.js#L23-L36
                if (evt.ctrlKey || evt.metaKey) {
                    switch (evt.which) {
                        case 90: //z
                            if (evt.shiftKey) {
                                self.redo();
                            } else {
                                self.undo();
                            }
                            return false;
                        case 89: //y
                            self.redo();
                            return false;
                    }
                }
            });

            this.eventCallback('READY');
        };

        function RegexMap(options) {
            var regexList = [];
            var terms = [], variableRegex = '', digitsRegex = '(\\d)?';
            // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp
            // these characters should be escaped  "\ ^ $ * + ? . ( ) | { } [ ]"
            var escapeTerms = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
            var operatorsAllowed = '', allowDigits = false, allowOperators = false;

            this.getTerms = function () { return terms; };
            this.addTerm = function (term) {
                if (terms.indexOf(term) == -1) {
                    terms.push(term);
                }
                return this;
            };            
            this.addRegExp = function (regexp) {
                if (!(regexp instanceof RegExp)) throw new TypeError("Invalid type passed in. Only RegExp instances can be added");
                regexList.push(regexp);
                return this;
            };
            this.compile = function () {
                var variables = [];
                terms.forEach(function (term) {
                    if (term.length == 1 && /^[a-zA-Z]$/g.test(term)) {
                        variables.push(term);
                    } else if (term.length == 1 && /[\d]/.test(term)) { //test if term is 0-9; todo: if you find one skip others
                        allowDigits = true;
                    } else if (term.length == 1 && /[\+\-\.\/\_\^><=\(\)\*\|]/.test(term)) { //test if term is +-./_^<>()|*
                        operatorsAllowed += '|' + term.replace(escapeTerms, "\\$&");
                        allowOperators = true;
                    } else {
                        var regex = "^"; //removed append digit and operator regex for commands as we are appending that info on variable regex which perform basic preprocessing on ctrlSeq
                        //regex += (allowDigits) ? digitsRegex : '';
                        //regex += (allowOperators && /^[a-zA-Z]/g.test(term)) ? '(' + operatorsAllowed.substring(1) + ')?' : '';
                        regex += "(";
                        for (var i = 1; i < term.length; i++) {
                            regex += term.substring(0, i).replace(escapeTerms, "\\$&");
                            regex += '|';
                        }
                        regex += term.replace(escapeTerms, "\\$&");
                        regex += ')$';
                        regexList.push(new RegExp(regex));
                    }
                });
                regexList.push(new RegExp("^(" + operatorsAllowed.substring(1) + ')$'));
                variableRegex = new RegExp('^[' + variables.join('') + ((allowDigits) ? digitsRegex : '') + ((allowOperators) ? '(' + operatorsAllowed.substring(1) + ')?' : '') + ']+'); //used to replace variable prefixes/suffixes at the start of ctrlSeq                                                                               
                return this;
            };
            this.match = function (input) {
                input = input.replace(escapeTerms, "\\$&"); //format the input for escape characters
                //process valid variable tokens at the beginning of the ctrlSeq
                input = input.replace(variableRegex, '');
                if (input.length == 0)
                    return true;
                
                input = input.replace(/\\/g, ""); //undo input format
                //ctrlSeq without variable tokens
                return regexList.some(function (regexp) {
                    var result = regexp.test(input);
                    if (result && window.DEBUG) console.log('RegExp:' + regexp + ":" + regexp.test(input));
                    return result;
                    // return regexp.test(input);
                });
            };
        }

        widget.createKeypad = function (xml) {
            var self = this;
            var $keypad = $('<div class="keypad mje_controls"><div class="toolbar"><button class="mje_nav_next" mathquillonkey="Left">&larr;</button><button class="mje_nav_prev" mathquillonkey="Right">&rarr;</button><button disabled class="mje_nav_undo" callselfmethod="undo">Undo</button><button disabled class="mje_nav_redo" callselfmethod="redo">Redo</button><button class="mje_nav_del" mathquillonkey="Backspace">&lArr;</button></div><div class="keypad-body"></div></div>');
            self.$undo = $keypad.find('button[callselfmethod=undo]');
            self.$redo = $keypad.find('button[callselfmethod=redo]');

            $keypad.on('selectstart', false); // prevent selection in IE<10

            self.$toolbar = $keypad.find('.toolbar').on('click', 'button', function () {
                var lastFocusedMathquill = self.lastFocusedMathquill.mathquill('focus');
                var $this = $(this), onKey = $this.attr('mathquillonkey');
                if (onKey) {
                    lastFocusedMathquill.mathquill('onKey', onKey);
                }
                else {
                    self[$this.attr('callselfmethod')]();
                }
            });

            var $keypadbody = $keypad.find('.keypad-body');
            self.$tabs = $([]);
            self.$tabButtons = $([]);
            xml.find('tabConfig').find('tab').each(function () {
                self.eventCallback("Creating Tab '" + $(this).attr('title') + "':");
                self.createKeypadTab(this).appendTo($keypadbody);
            });
            self.$tabButtons.first().click();
            return $keypad;
        };

        widget.createKeypadTab = function (xml) {
            var self = this;
            var ariaLabel = $(xml).attr('aria-label') || $(xml).attr('title');
            var $tab = $('<div class="keypad-tab">').attr('aria-label', ariaLabel);

            //Build grid(s)
            $(xml).find('grid').each(function () {
                self.createKeypadGrid(this).appendTo($tab);
            });

            //Build row(s)
            $rows = $('<div class="keypad-rows">').appendTo($tab);
            $(xml).find('row').each(function () {
                self.createKeypadRow(this).appendTo($rows);
            });

            //Create tab button(s)
            this.$tabs = this.$tabs.add($tab);
            this.createTabButton(xml, $tab);
            if (this.$tabButtons.length > 1) {
                this.$tabButtons.appendTo(this.$toolbar);
            }

            return $tab;
        };

        widget.createTabButton = function (xml, $tab) {
            var self = this;
            this.$tabButtons = this.$tabButtons.add(
              $('<span class="keypad-tab-button">' + $(xml).attr('title') + '</span>')
              .click(function () {
                  self.$tabs.add(self.$tabButtons).removeClass('selected');
                  $tab.add(this).addClass('selected');
                  self.resize();
              })
            );
        };

        widget.createKeypadRow = function (xml) {
            var self = this;
            var numItems = $(xml).find('item').length;
            var $row = $('<div class="keypad-row">').addClass($(xml).attr('class'))
            .attr('aria-label', $(xml).attr('aria-label'))
            .attr('style', 'min-width:' + (Math.round(numItems*2.3*10)/10) + 'em');
            self.eventCallback(" Creating Row:");

            $(xml).find('item').each(function () {
                self.createKeypadItem(this).appendTo($row);
            });

            return $row;
        };

        widget.createKeypadGrid = function (xml) {
            var self = this;
            var $grid = $('<div class="keypad-grid">').addClass($(xml).attr('class'))
            .attr('aria-label', $(xml).attr('aria-label'));
            self.eventCallback(" Creating Grid:");
            var numCols = $(xml).attr('cols') || 3;
            var $row;
            $(xml).find('item').each(function (i) {
                if (i % numCols === 0) {
                    $row = $('<div class="keypad-grid-row">').appendTo($grid);
                }
                self.createKeypadItem(this).appendTo($row);
            });
            return $grid;
        };

        widget.createKeypadItem = function (xml) {
            var self = this;
            var $xml = $(xml);
            // keypad items have text contents and 2 attributes, cmd (the LaTeX command
            // to be inserted into MathQuill, defaults to the text) and aria-label
            var text = $xml.text();
            var cmd = $xml.attr('cmd') || text;
            var wrap = $xml.attr('wrap-args') || false;
            var insert = $xml.attr('insert-raw') || false;
            var ariaLabel = $xml.attr('aria-label');
            var title = $xml.attr('title');

            //check if restrict content flag is true
            //add non hex keys only
            if (self.restrictContentFlag) {
                if (title == 'asterisk' || title == 'cdot' || title == 'times') {
                    self.restrictContentKeys.addTerm('*');
                    self.restrictContentKeys.addTerm(text);
                }
                else if (text == '( )') self.restrictContentKeys.addTerm('(');
                else if (text == '| |') self.restrictContentKeys.addTerm('|');
                else if (/^[\\]/.test(cmd) && self.AutoCmds.hasOwnProperty(cmd.substring(1))) self.restrictContentKeys.addTerm(cmd.substring(1));
                else if (cmd != text && text == "") {                    
                    self.restrictContentKeys.addTerm(cmd);
                }
                else self.restrictContentKeys.addTerm(text);
            }

            if (title == 'cdot' || title == 'times')
            {
                this.mathOperatorOverride.push('*' + '|' + cmd);
            }

            if (title == 'le' || title == 'ge')
            {
                this.mathOperatorOverride.push(title + '|' + title);
            }

            self.eventCallback("  Creating Item: " + text);
            // added touch event to the keypad buttons, delay between touch and click causing unexpected event triggers
            return $('<div class="keypad-item">').text(text)
            .addClass($xml.attr('class')).attr('aria-label', ariaLabel)
            .on('touchstart click', function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                //console.log('#### touchstart/click:' + evt);

                var mq = self.lastFocusedMathquill.mathquill('focus');
                if (wrap) { //Wrap the following or selected terms in parens, e.g. for inserting trig functions
                    mq.mathquill('cmd', '(', true).mathquill('onKey', 'Left').mathquill('cmd', cmd).mathquill('onKey', 'Right');
                } else if (insert) {
                    mq.mathquill('write', cmd);
                } else {
                    mq.mathquill('cmd', cmd, true);
                }
                pushUndoState(self);
                self.resize();
                self.eventCallback("Typed [" + cmd + "] with onscreen keypad");
            });
        };

        widget.scale = function (factor) {
            this.eventCallback("Scaling widget to " + factor + "x");
            //Set css3 scale on the content
            var prefixes = ['-webkit-', '-moz-', '-ms-', ''];
            for (var i = 0; i < prefixes.length; i++) {
                this.$body.css(prefixes[i] + 'transform', 'scale(' + factor + ')')
            }
            this.scaleFactor = factor;
            this.resize();
        };

        widget.resize = function () {
            //Adjust height of layout block to match scaled size
            this.$placeholder.width(this.$body.width() * this.scaleFactor);
            this.$placeholder.height(this.$body.height() * this.scaleFactor);
            //Rely on CSS to animate this nicely
        };

        // give the widget focus to listen for key events (or anything else)
        widget.focus = function () {
            this.lastFocusedMathquill.mathquill('focus');
            this.eventCallback("Focused");
        };

        // remove focus from the widget and should stop listening for key events
        widget.unfocus = function () {
            this.lastFocusedMathquill.mathquill('blur');
            this.eventCallback("Unfocused");
        };

        widget.getResponse = function () {
            if (this.readOnlyResponse) return this.readOnlyResponse;
            //Get latex from mathquill(s)
            //Convert to MathML
            //Return as a data-structure (XML with root node 'response', MathML children)
            var doc = $.parseXML('<response/>');
            var responses = doc.firstChild;
            var self = this;
            this.$inputs.find('.mathquill-editable').each(function () {
                responses.appendChild(self.mathmlFromLatex($(this).mathquill('latex')));
            });
            return doc;
        };

        widget.setResponse = function (doc) {
            //Parse data-structure (XML with root node 'response', MathML children)
            //Convert each MathML to latex
            //Insert into mathquill
            //Parse mathml into an XML document
            var responses = $(doc).children('response').children('math');

            var self = this, readOnly = this.mode === 'readOnly';
            if (readOnly) this.setMode('readWrite');
            this.$inputs.find('.mathquill-editable').each(function (i) {
                $(this).mathquill('latex', self.latexFromMathml(responses[i]));
            });
            //this.initialResponses = this.getLatexResponses();
            if (readOnly) this.setMode('readOnly');
            //return response;
        };

        widget.getLatexResponses = function () {
            return this.$inputs.find('.mathquill-editable').map(function () {
                return $(this).mathquill('latex');
            }).get();
        };
        widget.setLatexResponses = function (responses) {
            this.$inputs.find('.mathquill-editable').each(function (i) {
                $(this).mathquill('latex', responses[i]);
            });
            return responses;
        };

        widget.mode = 'readWrite';
        widget.setMode = function (mode) {
            if (mode === 'readOnly') {
                this.readOnlyResponse = this.getResponse();
                this.$inputs.find('.input-box').each(function () {
                    if ($(this).data('latex') === undefined) { // make sure not already readOnly
                        $(this).data('latex', $(this).mathquill('mqLatex'))
                          .mathquill('latex', $(this).mathquill('latex'));
                    }
                    $(this).addClass('readOnly');
                });
                this.lastFocusedMathquill = $([]);
            } else if (mode === 'readWrite') {
                delete this.readOnlyResponse;
                this.$inputs.find('.input-box').each(function () {
                    if ($(this).data('latex') !== undefined) {
                        $(this).mathquill('latex', $(this).data('latex')).removeData('latex');
                    }
                    $(this).removeClass('readOnly');
                });
                this.lastFocusedMathquill = this.$inputs.find('.mathquill-editable:first');
            } else {
                this.eventCallback("Unrecognized mode (neither 'readOnly' nor 'readWrite'): '" + mode + "'");
                return;
            }
            this.mode = mode;
            this.eventCallback("Set mode to '" + mode + "'");
        };

        function pushUndoState(self) {
            if (self.ignorePushUndoState) return;
            var newState = self.getLatexResponses();
            // only push onto stack if some latex has changed
            if (newState.some(function (latex, i) { return latex !== self.undoState[i]; })) {
                self.undoStack.push(self.undoState);
                self.undoState = newState;
                self.redoStack.splice(0);
                if (self.undoStack.length === 1) self.$undo.prop('disabled', false);
                self.$redo.prop('disabled', true);
            }
        }
        widget.undo = function () {
            if (!this.undoStack.length) return this.eventCallback('Nothing to undo');

            this.ignorePushUndoState = true;
            this.redoStack.push(this.undoState);
            this.undoState = this.setLatexResponses(this.undoStack.pop());
            if (this.redoStack.length === 1) this.$redo.prop('disabled', false);
            if (this.undoStack.length === 0) this.$undo.prop('disabled', true);
            this.ignorePushUndoState = false;

            this.eventCallback('Undid');
        };
        widget.redo = function () {
            if (!this.redoStack.length) return this.eventCallback('Nothing to redo');

            this.ignorePushUndoState = true;
            this.undoStack.push(this.undoState);
            this.undoState = this.setLatexResponses(this.redoStack.pop());
            if (this.undoStack.length === 1) this.$undo.prop('disabled', false);
            if (this.redoStack.length === 0) this.$redo.prop('disabled', true);
            this.ignorePushUndoState = false;

            this.eventCallback('Redid');
        };

        //Functions to translate between latex and mathml
        //Latex is represented as a string
        //MathML is represented as an XML document
        widget.mathmlFromLatex = function (latex) {
            var span = AMparseMath(latex);
            return span;
        };

        if (window.ActiveXObject || "ActiveXObject" in window) { // Added IE 11 hack - http://msdn.microsoft.com/en-us/library/ie/dn423948%28v=vs.85%29.aspx
            // http://msdn.microsoft.com/en-us/library/ms762796.aspx
            var xsltTree = new ActiveXObject("Msxml2.DOMDocument.6.0");
            xsltTree.async = false;
            xsltTree.loadXML(xsltMathml);

            var srcTree = new ActiveXObject("Msxml2.DOMDocument.6.0");
            srcTree.async = false;
            widget.latexFromMathml = function (math) {
                mathml = $(math).children('mstyle')[0]
                if (mathml.transformNode) return mathml.transformNode(xsltTree);
                // So, IE9+ supports DOMParser (which jQuery.parseXML() feature-detects
                // for), which is great, but the XML DOM it returns doesn't support
                // .transformNode(), unlike a legacy MSXML DOM like `srcTree`, and there
                // appears to be no other support for XSLT.  (The standards-compliant
                // thing that most browsers do is to support XSLTProcessor in addition to
                // DOMParser.) So serialize to a string to convert to MSXML.
                srcTree.loadXML((new XMLSerializer).serializeToString(mathml));
                var latexStr = srcTree.transformNode(xsltTree);
                return latexStr.replace(/\\space/g, '\\space ');
            };
        }
        else {
            var mathmlProcessor = new XSLTProcessor();
            mathmlProcessor.importStylesheet($.parseXML(xsltMathml));
            widget.latexFromMathml = function (math) {
                mathml = $(math).children('mstyle')[0]
                //Modify mathml fragment to be namespaced properly if it's not
                //mathml.firstChild.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
                //Use XSLT to convert into latex
                var fragment = mathmlProcessor.transformToFragment(mathml, document);
                //Extract latex
                var latexStr = fragment.textContent;
                return latexStr.replace(/\\space/g, '\\space ');
            };
        }
    });

    //aceepts xmldoc with <math> as root
    //latex response is wrapped by $$
    Widget.convertMathMlToLatex = function (mathml) {
        var fragment = null;
        if (window.ActiveXObject || "ActiveXObject" in window) { // Added IE 11 hack - http://msdn.microsoft.com/en-us/library/ie/dn423948%28v=vs.85%29.aspx
            // http://msdn.microsoft.com/en-us/library/ms762796.aspx
            var xsltTree = new ActiveXObject("Msxml2.DOMDocument.6.0");
            xsltTree.async = false;
            xsltTree.loadXML(xsltMathml);

            var srcTree = new ActiveXObject("Msxml2.DOMDocument.6.0");
            srcTree.async = false;
            mathml = (new XMLSerializer()).serializeToString(mathml); //hack for ie
            mathml = $(mathml).children('mstyle')[0];
            if (mathml.transformNode) return mathml.transformNode(xsltTree);
            // So, IE9+ supports DOMParser (which jQuery.parseXML() feature-detects
            // for), which is great, but the XML DOM it returns doesn't support
            // .transformNode(), unlike a legacy MSXML DOM like `srcTree`, and there
            // appears to be no other support for XSLT.  (The standards-compliant
            // thing that most browsers do is to support XSLTProcessor in addition to
            // DOMParser.) So serialize to a string to convert to MSXML.
            srcTree.loadXML((new XMLSerializer).serializeToString(mathml));
            fragment = srcTree.transformNode(xsltTree);            
            return fragment.replace(/\\space/g, '\\space ');

        }
        else {
            var mathmlProcessor = new XSLTProcessor();
            mathmlProcessor.importStylesheet($.parseXML(xsltMathml));
            mathml = $(mathml).children('mstyle')[0];
            //Modify mathml fragment to be namespaced properly if it's not
            //mathml.firstChild.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
            //Use XSLT to convert into latex
            fragment = mathmlProcessor.transformToFragment(mathml, document);
            //Extract latex
            var latexStr = fragment.textContent;
            return latexStr.replace(/\\space/g, '\\space ');

        }
    };
    //Functions to translate between latex and mathml
    //Latex is represented as a string
    //MathML is represented as an XML document
    Widget.convertLatexToMathml = function (latex) {
        var span = AMparseMath(latex);
        return span;
    };
    AMinitSymbols();
    window.MathEditorWidget = Widget;   
}());
