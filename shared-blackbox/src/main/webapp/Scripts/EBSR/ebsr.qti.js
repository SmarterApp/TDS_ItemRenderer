/**********************/
/* MC QTI routines    */
/**********************/

// QTI MC item
EBSR.QTI = function (interactionXml, itemKey, contentOptionClass, interactionKey) {
    this._componentList = [];
    //  Default contentOptionClass to ContentMSOption and ContentMCOption
    if (contentOptionClass == null) {
        contentOptionClass = [];
        contentOptionClass["MS"] = ContentMSOption;
        contentOptionClass["MC"] = ContentMCOption;
    }
    
    // Determine if interaction is Multiple Choice or
    // Multiselection based on maxChoice
    var options;
    this.responseId = interactionXml.getAttribute('responseIdentifier');
    
    //Historical EBSR items in ITS were defined with maxChoice attribute, QTI is maxChoices attribute
    var maxChoices = (interactionXml.getAttribute('maxChoice') || interactionXml.getAttribute('maxChoices')) * 1;
    var minChoices = interactionXml.getAttribute('minChoices') * 1;
    if (maxChoices != 1) {
        this.type = "MS";
        options = new ContentMSGroup();
        options.setMinChoices(minChoices);
        options.setMaxChoices(maxChoices);
    } else {
        this.type = "MC";
        options = new ContentMCGroup();
    };
    
    // Save interaction keys
    this.itemKey = itemKey;
    this.key = interactionKey;
    var prompt = interactionXml.getElementsByTagName('prompt')[0];
    var promptToHtml = Util.Xml.serializeToString(prompt);
    this.promptText = $(promptToHtml).html();
    
    // Get options from XML and begin processing
    var optionsXml = interactionXml.getElementsByTagName('simpleChoice');
    var optionsArray = [];

    var contentOption = contentOptionClass[this.type];
    // Parse out options
    Util.Array.each(optionsXml, function (optionXml) {
        var optionKey = optionXml.getAttribute('identifier').toUpperCase();
        var option = new contentOption(options, optionKey, interactionKey);
        options.addOption(option);
        
        var parsedOption = {};
        parsedOption.key = optionKey;
        var optionToHtml = Util.Xml.serializeToString(optionXml);
        parsedOption.innerHTML = $(optionToHtml).html();
        optionsArray[optionKey] = parsedOption;
    });
    this.options = options;
    this.parsedOptions = optionsArray;
};

// Get all options associated with sub-item choiceInteraction
EBSR.QTI.prototype.getOptions = function () {
    return this.options.getOptions();
};

// Get the prompt
EBSR.QTI.prototype.getPrompt = function () {
    return this._prompt;
};

// Get the header
EBSR.QTI.prototype.getHeader = function () {
    return this._header;
};

// Get all components associated with sub-item choiceInteraction
EBSR.QTI.prototype.getComponentList = function () {
    return this._componentList;
};

// Generate the HTML DOM for the sub-item choiceInteraction
EBSR.QTI.prototype.generateInteractionHTML = function (answerContainer) {
    var interactionHTML = $('<div></div')
        .attr('id', 'Item_Container_EBSR_' + this.itemKey + '_' + this.key)
        .attr('role', this.options._role)
        .addClass('interactionContainer')
        .appendTo(answerContainer);
    this.generatePromptHTML(interactionHTML);
    this._componentList.push(this._prompt[0]);
    var interaction = this;
    var options = this.getOptions();
    if (options && options.length > 0) {
        Util.Array.each(options, function (option) {
            var optionContainer = interaction.generateOptionHTML(interactionHTML, option);
            interaction._componentList.push(optionContainer);
            option.render();
        });
    }
};

// Generate the HTML DOM associated with the choice interaction prompt
EBSR.QTI.prototype.generatePromptHTML = function (parent) {
    var headerKey = 'EBSR.Header.Part' + this.key;
    var ttsKey = 'TDSTTS.Speak.EBSR.Part' + this.key;
    var headerText = Messages.get(headerKey);

    this._header = $('<h3>' + headerText + '</h3>').appendTo(parent);

    if (Messages.has(ttsKey)) {
        // Add alternate TTS message to header
        var ttsText = Messages.get(ttsKey);
        this._header.attr('ssml', 'sub')
            .attr('ssml_alias', ttsText)
            .addClass('TTS')
            .addClass('speakAs');
    }
    
    this._prompt = $('<div></div>')
        .attr('id', 'Item_InteractionPrompt_Response_EBSR_' + this.itemKey + '_' + this.key)
        .addClass('interactionPrompt')
        .html(this.promptText)
        .appendTo(parent);
};

// Generate the HTML DOM associated with each individual option
EBSR.QTI.prototype.generateOptionHTML = function (parent, option) {
    // Create option node with id
    var optionIdString = this.itemKey + '_Part' + this.key;
    var nodeId = 'Item_OptionContainer_Response_EBSR_' + optionIdString + '_' + option.key;
    var nodeClass = "EBSR_" + this.type.toLowerCase();
    var node = $('<div></div>')
        .attr('id', nodeId)
        .attr('title', Messages.get('EBSR.Header.Part' + this.key) + ' Option ' + option.key)
        .addClass('optionContainer option' + option.key + ' ' + nodeClass)
        // Create striked span
        .append('<span class="striked"></span>')
        // Create optionClicker span
        .append('<span class="optionClicker"></span>')
        .appendTo(parent);

    // Create input button
    var inputButton = $('<input></input')
        .attr('name', 'Item_Response_EBSR_' + optionIdString)
        .attr('value', option.key)
        .attr('id', 'Item_Response_EBSR_' + optionIdString + '_' + option.key)
        .addClass('option')
        .appendTo(node);
    if (this.type.toUpperCase() == "MS") {
        var type = 'checkbox';
        // Add alternate TTS prefix - Treat the same as MS input button
        inputButton.attr('data-tts-prefix', 'TDSTTS.Speak.Select' + option.key);
    } else {
        type = 'radio';
    }
    inputButton.prop('type', type);

    // Create optionContent div
    $('<div></div>')
        .addClass('optionContent')
        .attr('id', 'Item_OptionContent_Response_EBSR_' + optionIdString + '_' + option.key)
        .html(this.parsedOptions[option.key].innerHTML)
        .appendTo(node);
    
    // return reference to DOM node, not a collection of nodes
    return node[0];
};
