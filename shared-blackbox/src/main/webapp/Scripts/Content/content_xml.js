//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This code is used to parse the xml used for rendering content.
*/

(function(CM) {

    // add helper functions
    var getNode = Util.Dom.queryTag;
    var getNodes = Util.Dom.queryTags;
    var batchNodes = Util.Dom.queryTagsBatch;
    var getAttribInt = Util.Xml.getAttributeInt;
    var getAttribBool = Util.Xml.getAttributeBool;
    var getAttrib = Util.Xml.getAttribute;
    var getText = Util.Xml.getNodeText;
    var getCData = Util.Xml.getCData;

    // this is the entry point for parsing <contents>
    function parse(contentsNode) {

        var contents = [];

        // go through each <content> element
        batchNodes('content', contentsNode, function(contentNode) {
            var content = parseContent(contentNode);
            contents.push(content);
        });

        return contents;
    };

    function parseContent(contentNode) {
        
        var content = {
            id: getAttrib(contentNode, 'groupID'),
            segmentID: getAttrib(contentNode, 'segmentID'),
            layout: getAttrib(contentNode, 'layout'),
            language: getAttrib(contentNode, 'language'),
            passage: null,
            items: []
        };

        // sound cue
        var soundCueNode = getNode('soundCue', contentNode);
        if (soundCueNode) {
            content.soundCue = {
                bankKey: getAttribInt(soundCueNode, 'bankKey'),
                itemKey: getAttribInt(soundCueNode, 'itemKey')
            };
        }

        // passage
        var passageNode = getNode('passage', contentNode);
        if (passageNode) {
            content.passage = parsePassage(passageNode);
        }

        // items
        var itemsNode = getNode('items', contentNode);
        if (itemsNode) {
            batchNodes('item', itemsNode, function(itemNode) {
                var item = parseItem(itemNode);
                content.items.push(item);
            });
        }

        // html
        content.html = getCData(contentNode, 'html');

        return content;
    };

    // parse resource list <resources>
    function parseResources(contentNode) 
    {
        var resources = {};
        var resourcesNode = getNode('resources',contentNode);

        if (resourcesNode) {
            batchNodes('resource', resourcesNode, function (resourceNode) {
                var resourceType = getAttrib(resourceNode, 'type');
                var resource = {
                    bankKey: getAttribInt(resourceNode, 'bankKey'),
                    itemKey: getAttribInt(resourceNode, 'itemKey')
                };
                resources[resourceType] = resource;
            });
        }

        return resources;
    };

    // parse attachments <attachments>.  We will use these for ASL resources.
    function parseAttachments(contentNode) {
    
        var attachments = [];
        var attachmentsNode = getNode('attachments', contentNode);

        if (attachmentsNode) {
        
            batchNodes('attachment', attachmentsNode, function (attachmentNode) {
                var attachment = {
                    id: getAttrib(attachmentNode, 'id'),
                    type: getAttrib(attachmentNode, 'type'),
                    subType: getAttrib(attachmentNode, 'subType'),
                    target: getAttrib(attachmentNode, 'target'),
                    url: getAttrib(attachmentNode, 'url')
                };

                // We can have more than one per same type - ASL may have one 
                // resource for stem and another for options, etc.
                attachments.push(attachment);
            });
        }

        return attachments;
    };

    // parse media element <media> (the data for mathml, svg, base64)
    function parseMedia(contentNode) {
    
        var mediaResources = [];
        var mediaNode = getNode('media', contentNode);
        
        if (mediaNode) {
            batchNodes('resource', mediaNode, function (resourceNode) {
                var mediaResource = {
                    file: getAttrib(resourceNode, 'file'),
                    type: getAttrib(resourceNode, 'type'),
                    data: getText(resourceNode)
                };
            
                mediaResources.push(mediaResource);
            });
        }

        return mediaResources;
    };

    // parse generic elements from the item
    function parseSpecs(node) {

        var specs = [];

        // <constraints>
        var constraintsNode = getNode('constraints', node);
        if (constraintsNode != null) {
            constraintsNode.parentNode.removeChild(constraintsNode);
            specs.push(constraintsNode);
        }

        // <search>
        var searchNode = getNode('search', node);
        if (searchNode != null) {
            searchNode.parentNode.removeChild(searchNode);
            specs.push(searchNode);
        }

        return specs;
    }

    function parsePassage(passageNode) {

        var passage = {
            bankKey: getAttribInt(passageNode, 'bankKey'),
            itemKey: getAttribInt(passageNode, 'itemKey'),
            printed: getAttribBool(passageNode, 'printed'),
            filePath: getCData(passageNode, 'filePath')
        };

        passage.resources = parseResources(passageNode);
        passage.attachments = parseAttachments(passageNode);
        passage.media = parseMedia(passageNode);
        passage.specs = parseSpecs(passageNode);

        return passage;
    }

    function parseItem(itemNode)
    {
        var item = {
            bankKey: getAttribInt(itemNode, 'bankKey'),
            itemKey: getAttribInt(itemNode, 'itemKey'),
            subject: getAttrib(itemNode, 'subject'),
            grade: getAttrib(itemNode, 'grade'),
            format: getAttrib(itemNode, 'format'),
            marked: getAttribBool(itemNode, 'marked'),
            disabled: getAttribBool(itemNode, 'disabled'),
            responseType: getAttrib(itemNode, 'responseType'),
            position: getAttribInt(itemNode, 'position'),
            positionOnPage: getAttribInt(itemNode, 'positionOnPage'),
            filePath: getCData(itemNode, 'filePath'),
            printable: getAttribBool(itemNode, 'printable'),
            printed: getAttribBool(itemNode, 'printed')
        };

        // tutorial
        var tutorialNode = getNode('tutorial', itemNode);

        if (tutorialNode) {
            item.tutorial = {
                bankKey: getAttribInt(tutorialNode, 'bankKey'),
                itemKey: getAttribInt(tutorialNode, 'itemKey')
            };
        }

        // resources
        item.resources = parseResources(itemNode);
        item.attachments = parseAttachments(itemNode);
        item.media = parseMedia(itemNode);

        // renderer spec xml
        item.rendererSpec = getCData(itemNode, 'rendererSpec');

        // grid xml
        item.gridAnswerSpace = getCData(itemNode, 'gridAnswerSpace');

        // options
        var optionsNode = getNode('options', itemNode);

        if (optionsNode) {
            item.optionsConfig = {
                minChoices: getAttribInt(optionsNode, 'minChoices'),
                maxChoices: getAttribInt(optionsNode, 'maxChoices')
            };
            item.options = [];
            batchNodes('option', optionsNode, function(optionNode) {
                var option = parseOption(optionNode);
                item.options.push(option);
            });
        }

        // response
        item.value = getCData(itemNode, 'response');

        // rubric
        var rubricNode = getNode('rubric', itemNode);

        if (rubricNode) {
            item.rubric = {
                type: getAttrib(rubricNode, 'type'),
                data: getText(rubricNode)
            };
        }
    
        // qti
        var qtiNode = getNode('qti', itemNode);

        if (qtiNode) {
            var qtiSpec = getAttrib(qtiNode, 'spec');
            var qtiXml = getText(qtiNode);
            item.qti = { spec: qtiSpec, xml: qtiXml };
        }

        item.specs = parseSpecs(itemNode);

        return item;
    };

    function parseOption(optionNode)
    {
        var option = {
            key: getAttrib(optionNode, 'key')
        };
    
        option.value = getCData(optionNode, 'value');
        option.sound = getCData(optionNode, 'sound');
        option.feedback = getCData(optionNode, 'feedback');

        return option;
    };
    
    function create (root) {
        var contentsNode = getNode('contents', root); // <contents>
        var contents = parse(contentsNode);
        return contents;
    };

    // expose public api
    CM.Xml = {};
    CM.Xml.create = create;

})(ContentManager);


