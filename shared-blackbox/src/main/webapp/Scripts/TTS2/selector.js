//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TTS = window.TTS || {};
TTS.Parse = window.TTS.Parse || {};

//the selector takes a rangy selection and creates a ParseNode tree. For the most part, the tree will only contain a root node and leaves, except for 
// 'CompoundSpeak', which creates a little subtree to handle the multiple spaces (see TTSParse)
//  This calls several public, but special use, methods of ParseNode.  
TTS.Parse.Selector = function (sel, lang) {

    if (sel.rangeCount == 0) {
        if (TTS.Config.Debug) {
            //alert("nothing selected");
        }
        return null; // NOTE FOR BRUCE: Do we need to return null here?
    }

    //if the selection starts with a node nested within an alt node, expand the range to startbefore (setStartBefore(Node node)) the alt node
    var _lang = lang;
    var selection = sel.getRangeAt(0);
    var _start = selection.startContainer;
    var altParent = TTS.Parse.ParseNode.getEnclosingAltNode(_start);
    if ((altParent != null) && (altParent != _start)) {
        selection.setStartBefore(altParent);
    }

    _start = selection.startContainer;
    var _end = selection.endContainer;
    var _commonAncestor = selection.commonAncestorContainer;
    var _parseTreeRoot = new TTS.Parse.ParseNode(_lang, _commonAncestor, null, 0, 0, true);
    var _startOffset = selection.startOffset; //interpretation depends on type that is start. If it is a char node, offset is character in the value. otherwise, it is the index of the start child node
    var _endOffset = selection.endOffset; //interpretation depends on type that is end. If it is a char node, offset is character in the value. otherwise, it is the index of the end child node
    var _startNodeType = TTS.Parse.ParseNode.classifyTTSNode(_start, _startOffset, true);
    var _endNodeType = TTS.Parse.ParseNode.classifyTTSNode(_end, 0, true);
    var _nextStart = _parseTreeRoot.getEndIndex();
    var _foundStart = false;
    var _foundEnd = false;

    var Debug = function(string) {
        if (TTS.Config.Debug) {
            console.log(string);
        }
    };

    this.collectNodes = function (node, offset) {
        return _collectNodes(node, offset);
    };

    var _collectNodes = function (node, offset) {

        if (!node) {
            node = _commonAncestor;
        }

        if (!_foundStart) {
            _foundStart = ttsSameNode(node, _start);
            if (_foundStart) { //if the startnode is a characternode, then offset refers to characters, otherwise offset refers to nodes
                offset = _startOffset;
            }
        }

        if (_foundStart && !_foundEnd) {
            var pn = null;
            var startAt = (node == _start) ? _startOffset : 0;
            var ttsNodeType = TTS.Parse.ParseNode.classifyTTSNode(node, startAt, true); //might should be more specific about this--figure the offset and all
            switch (ttsNodeType) {
                case TTS.Parse.TTSNodeTypes.Speak:
                    if (differentLanguage(node)) {
                        break;
                    }
                    if (ttsSameNode(node, _end)) {
                        pn = new TTS.Parse.ParseNode(_lang, node, offset, _nextStart, _endOffset, null, true);
                    } else {
                        pn = new TTS.Parse.ParseNode(_lang, node, offset, _nextStart, null, null, true);
                    }
                    break;
                case TTS.Parse.TTSNodeTypes.CompoundSpeak:
                    if (differentLanguage(node)) {
                        break;
                    }
                    pn = new TTS.Parse.ParseNode(_lang, node, startAt, _nextStart, null, true);
                    if (node == _end) {
                        pn.setCutoff(_endOffset);
                    }
                    pn.assembleNodeForSelector();
                    break;
                case TTS.Parse.TTSNodeTypes.Image:
                case TTS.Parse.TTSNodeTypes.Alt:
                    if (differentLanguage(node)) {
                        break;
                    } //Don't need to do anything with the offset if this is a speak-as node. Even if the range starts at a child, it is all wrapped in speak-as
                    pn = new TTS.Parse.ParseNode(_lang, node, 0, _nextStart);
                    break;
                case TTS.Parse.TTSNodeTypes.DoNotSpeak:
                    break;
                case TTS.Parse.TTSNodeTypes.ContainerWithPause:
                    collectChildren(node, offset);
                    pn = _parseTreeRoot.createSilentParseNode(_nextStart);
                    break;
                case TTS.Parse.TTSNodeTypes.SpeakableInput:
                    pn = new TTS.Parse.ParseNode(_lang, node, 0, _nextStart, null);
                    break;
                case TTS.Parse.TTSNodeTypes.Other:
                    //in this case, there is no parsenode returned because this tree only stores the leaf nodes (sort of, since compound speak creates a tree)
                    if (!ttsSameNode(node, _end)) {  // Bug 163978 - If selection ends in an Element node, don't parse it's children
                        collectChildren(node, offset);
                    }
                    break;
                default:
                    TTS.getInstance().Error(new Error('Error in TTSSelector.  Unexpected node type in collect nodes: ' + ttsNodeType));
            }

            if (pn != null) {
                _parseTreeRoot.addChild(pn);
                _nextStart = pn.getEndIndex();
            }

            if (pn != null) {
                Debug("PN: " + pn.CompileSpeakString() + " start: " + pn.getStartIndex() + " end: " + pn.getEndIndex());
            }

            if (ttsSameNode(node, _end)) {
                _foundEnd = true;
            }
            _parseTreeRoot.setEndIndex(_nextStart);

        } else {

            for (var j = 0; j < node.childNodes.length; j++) {
                if (_foundEnd) {
                    return _parseTreeRoot;
                }
                _collectNodes(node.childNodes[j], offset);
                if (ttsSameNode(node.childNodes[j], _end)) {
                    _foundEnd = true;
                }
            }
        }
        return _parseTreeRoot;
    };

    var collectChildren = function(node, offset) {
        var i = 0;
        if (((_startNodeType == TTS.Parse.TTSNodeTypes.Other) || (_startNodeType == TTS.Parse.TTSNodeTypes.ContainerWithPause)) && (_startOffset)) {
            i = _startOffset; //if its not a text node, the offset refers to the nth child.   
        }
        for (i = i; i < node.childNodes.length; i++) {
            _collectNodes(node.childNodes[i], offset, _foundStart);
        }

    };

    var ttsSameNode = function(outer, other) {
        if (TTS.Parse.ParseNode.classifyTTSNode(outer) == TTS.Parse.TTSNodeTypes.Alt) {
            // Bug 122575 Firefox 3.6 does not support node.contains method, use alternate
            // http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
            if (!outer.contains) {
                var result = outer.compareDocumentPosition(other);
                return !!(result & 16);
            } else {
                return outer.contains(other);
            }
        }
        return (outer == other);
    };

    //if this finds an unmarked node, it will re-mark the entire dom body.  This large amount of work happens to deal with an instance in which a section is highlighted
    //If the highlighted carrys the language tags, too, this will not do extra work
    var differentLanguage = function(node) {
        return (_lang != TTS.getInstance().getMarkedLanguage(node));
    };

    this.getParseNode = function () {
        return _parseTreeRoot;
    };
};