//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Widget for the QTI extendedTextInteraction

EXAMPLE:
<extendedTextInteraction responseIdentifier="RESPONSE" base="10" expectedLength="50" minStrings="0" expectedLines="3" format="plain">
    <prompt>5. <i>(2 taškai)</i> Užrašykite du tinklaraš?iobruožus.<i><br/></i></prompt>
</extendedTextInteraction>

*/

(function(CM) {

    var match = CM.QTI.createWidgetMatch('extendedTextInteraction');

    function Widget_ET(page, item, config) {
        this.options = {
            autoLoad: true
        }
        this.textAreaEl = null;
    }

    CM.registerWidget('qti.exttext', Widget_ET, match);

    Widget_ET.prototype.load = function() {

        var extTextEl = this.element; // dom element
        var extTextNode = this.config; // qti element

        // parse QTI metadata

        /*
        Used to control the format of the text entered by the candidate. This attribute affects the 
        way the value of the associated response variable should be interpreted by response processing 
        engines and also controls the way it should be captured in the delivery engine.

        plain - Indicates that the text to be entered by the candidate is plain text. This format is suitable 
        for short unstructured responses. Delivery engines should preserve white-space characters in candidate 
        input except where a response consists only of white-space characters, in which case it should be treated 
        as an empty string (NULL).

        preFormatted - Indicates that the text to be entered by the candidate is pre-formatted and should be 
        rendered in a way consistent with the definition of pre in [XHTML]. Delivery engines must preserve 
        white-space characters except where a response consists only of white-space characters, in which case 
        it should be treated as an empty string (NULL).

        xhtml - Indicates that the text to be entered by the candidate is structured text. The value of the response
        variable is text marked up in XHTML. The delivery engine should present an interface suitable for capturing 
        structured text, this might be plain typed text interpreted with a set of simple text markup conventions such 
        as those used in wiki page editors or a complete WYSIWYG editor.

        */
        var format = extTextNode.getAttribute('format') || 'plain';

        /*
        In visual environments, string interactions are typically represented by empty boxes into
        which the candidate writes or types. However, in speech based environments it is helpful 
        to have some placeholder text that can be used to vocalize the interaction. Delivery engines 
        should use the value of this attribute (if provided) instead of their default placeholder text 
        when this is required. Implementors should be aware of the issues concerning the use of default
        values described in the section on Response Variables.
        */
        var placeholderText = extTextNode.getAttribute('placeholderText');

        /*
        If given, the pattern mask specifies a regular expression that the candidate's response 
        must match in order to be considered valid. The regular expression language used is 
        defined in Appendix F of [XML_SCHEMA2]. Care is needed to ensure that the format of the
        required input is clear to the candidate, especially when validity checking of responses 
        is required for progression through a test. This could be done by providing an illustrative 
        sample response in the prompt, for example
        */
        var patternMatch = extTextNode.getAttribute('patternMatch');

        /*
        The expectedLength attribute provides a hint to the candidate as to the expected 
        overall length of the desired response. A Delivery Engine should use the value of 
        this attribute to set the size of the response box, where applicable. 
        This is not a validity constraint. 
        */
        var expectedLength = extTextNode.getAttribute('expectedLength') * 1;

        /*
        The expectedLines attribute provides a hint to the candidate as to the expected 
        number of lines of input required. A Delivery Engine should use the value of this
        attribute to set the size of the response box, where applicable. 
        This is not a validity constraint.
        */
        var expectedLines = extTextNode.getAttribute('expectedLines') * 1;

        /*
        The minStrings attribute specifies the minimum number separate (non-empty) 
        strings required from the candidate to form a valid response. If minStrings is 0 
        then the candidate is not required to enter any strings at all. minStrings must be 
        less than or equal to the limit imposed by maxStrings. If the interaction is not 
        bound to a container then there is a special case in which minStrings may be 1. 
        In this case the candidate must enter a non-empty string to form a valid response. 
        More complex constraints on the form of the string can be controlled with the patternMask attribute. 
        */
        var minStrings = extTextNode.getAttribute('minStrings') * 1;

        /*
        The maxStrings attribute is required when the interaction is bound to 
        a response variable that is a container. A Delivery Engine must use the 
        value of this attribute to control the maximum number of separate strings 
        accepted from the candidate. When multiple strings are accepted, 
        expectedLength applies to each string.
        */
        var maxStrings = extTextNode.getAttribute('maxStrings') * 1;

        // create the <textarea>
        var textAreaEl = document.createElement('textarea');
        textAreaEl.type = 'text';
        textAreaEl.className = 'extText';
        textAreaEl.setAttribute('data-format', format);

        // set the # of columns
        if (expectedLines > 0) {
            textAreaEl.setAttribute('rows', expectedLines);
        }

        // add <textarea> to the interaction <div>
        extTextEl.appendChild(textAreaEl);

        this.textAreaEl = textAreaEl;
    }

    Widget_ET.prototype.getResponse = function() {
        var value = this.textAreaEl.value;
        var isValid = YAHOO.lang.trim(value).length > 0;
        return this.createResponse(value, isValid);
    }

    Widget_ET.prototype.setResponse = function (value) {
        this.textAreaEl.value = value;
    }

})(window.ContentManager);