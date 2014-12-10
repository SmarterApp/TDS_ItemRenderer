/**************/
/* PROPERTIES */
/**************/

(function(Accs) {

    // create a "strongly typed" wrapper for an accommodations data structure which assumes all accommodations in the data structure are selected
    function Props(accommodations) {
        this._accommodations = accommodations;
    }

    var PropsProto = Props.prototype;

    // get the first selected value for a type
    PropsProto.getSelectedValue = function(typeName) {
        if (this._accommodations == null) {
            return null;
        }
        var accType = this._accommodations.getType(typeName);
        if (accType != null) {
            var selectedValues = accType.getSelected();

            if (selectedValues.length > 0) {
                return selectedValues[0];
            }
        }
        return null;
    };

    // get the first selected value code for a type
    PropsProto.getSelectedCode = function(type) {
        var selectedValue = this.getSelectedValue(type);
        return (selectedValue) ? selectedValue.getCode() : null;
    };

    // check if a acc value code is selected
    PropsProto.isSelected = function(type, code) {
        if (this._accommodations == null) {
            return false;
        }
        var foundValue = this._accommodations.findCode(type, code, true);
        return (foundValue != null);
    };

    // check if a acc type exists and if it does not equal the selected types code
    PropsProto.existsAndNotEquals = function(type, code) {
        // get selected types code
        var selectedCode = this.getSelectedCode(type);

        // make sure there is something selected and if there is that it doesn't equal the valye passed in
        return (selectedCode != null && selectedCode != code);
    };

    /***
    Below is a list of helper functions for getting known accommodations
    ***/

    // get selected language code
    PropsProto.getLanguage = function() {
        var language = this.getSelectedCode('Language');
        return (language) ? language : 'ENU';
    };

    // get all languages
    PropsProto.getLanguages = function(selectedOnly) {
        var accType = this._accommodations.getType('Language');
        return (accType != null) ? accType.getCodes(selectedOnly) : ['ENU'];
    };

    PropsProto.hasBraille = function() {
        // for legacy ITS reasons check braille accommodation
        if (this.isSelected('Braille', 'TDS_Braille1')) {
            return true;
        }

        // otherwise check if language has braille support
        var language = this.getLanguage();
        return Util.String.endsWith(language, '-Braille');
    };

    PropsProto.getBrailleType = function() {
        return this.getSelectedCode('Braille Type');
    };

    PropsProto.getCalculator = function() {
        return this.getSelectedCode('Calculator');
    };

    PropsProto.getColorChoice = function() {
        return this.getSelectedCode('Color Choices');
    };

    PropsProto.getFormula = function() {
        return this.getSelectedCode('Formula');
    };

    PropsProto.getFontSize = function() {
        return this.getSelectedCode('Font Size');
    };

    PropsProto.getFontType = function() {
        return this.getSelectedCode('Font Type');
    };

    PropsProto.hasGuideForRevision = function() {
        return this.isSelected('Guide for Revision', 'TDS_GfR1');
    };

    PropsProto.hasHighlighting = function() {
        return this.isSelected('Highlight', 'TDS_Highlight1');
    };

    PropsProto.hasMarkForReview = function() {
        return this.isSelected('Mark for Review', 'TDS_MfR1');
    };

    PropsProto.hasPrintItem = function() {
        return this.isSelected('Print on Request', 'TDS_PoD_Item');
    };

    PropsProto.hasPrintStimulus = function() {
        return this.isSelected('Print on Request', 'TDS_PoD_Stim');
    };

    PropsProto.getPrintSize = function() {
        return this.getSelectedCode('Print Size');
    };

    PropsProto.getPeriodicTable = function() {
        return this.getSelectedCode('Periodic Table');
    };

    PropsProto.hasStrikethrough = function() {
        return this.isSelected('Strikethrough', 'TDS_ST1');
    };

    PropsProto.hasTutorial = function() {
        return this.isSelected('Tutorial', 'TDS_T1');
    };

    PropsProto.hasASIVoiceGuidance = function() {
        return this.isSelected('Scaffolding Voice Guidance', 'TDS_ASIGuide1');
    };

    PropsProto.hasTTSInstruction = function() {
        return this.isSelected('TTS', 'TDS_TTS_Inst');
    };

    PropsProto.hasTTSItem = function() {
        return this.isSelected('TTS', 'TDS_TTS_Item');
    };

    PropsProto.hasTTSStimulus = function() {
        return this.isSelected('TTS', 'TDS_TTS_Stim');
    };

    PropsProto.hasTTS = function () {
        return this.existsAndNotEquals('TTS', 'TDS_TTS0');
    };

    PropsProto.hasTTSPausing = function() {
        return this.isSelected('TTS Pausing', 'TDS_TTSPause1');
    };

    PropsProto.hasCalculator = function() {
        return this.existsAndNotEquals('Calculator', 'TDS_Calc0');
    };

    PropsProto.hasColorChoice = function() {
        return this.existsAndNotEquals('Color Choices', 'TDS_CC0');
    };

    PropsProto.hasFormula = function() {
        return this.existsAndNotEquals('Formula', 'TDS_F0');
    };

    PropsProto.hasPeriodicTable = function() {
        return this.existsAndNotEquals('Periodic Table', 'TDS_PT0');
    };

    PropsProto.hasStudentComments = function() {
        return this.existsAndNotEquals('Student Comments', 'TDS_SC0');
    };

    PropsProto.getStudentComments = function() {
        return this.getSelectedCode('Student Comments');
    };

    // get the type of navigation drop down that should be down on the test shell
    // 'TDS_Nav0' = No Dropdown
    // 'TDS_NavQu' = Show Question Numbers
    // 'TDS_NavPg' = Show Page Numbers
    // 'TDS_NavTk' = Show Task Numbers
    PropsProto.getNavigationDropdown = function() {
        return this.getSelectedCode('Navigation Dropdown');
    };

    PropsProto.getTTXBusinessRules = function() {
        return this.getSelectedCode('TTX Business Rules');
    };

    // when answering a question do we show visual feedback (rationale)
    PropsProto.showFeedback = function () { // does show feedback
        // NOTE: this acc type/value might be changed later
        return this.isSelected('Feedback', 'LPN_FB1');
    };

    // do we show and enable the expandable passages link
    PropsProto.showExpandablePassages = function() {
        return this.isSelected('Expandable Passages', 'TDS_ExpandablePassages1');
    };

    // In the sound check page, do we show the volume, pitch, and/or rate controls
    PropsProto.hasAudioControl = function() {
        return this.existsAndNotEquals('TTS Audio Adjustments', 'TDS_TTSAA0');
    };

    // In the sound check page, do we show the voice pack control 
    PropsProto.showVoicePackControl = function() {
        return this.isSelected('TTS Audio Adjustments', 'TDS_TTSAA_SelectVP');
    };

    // In the sound check page, do we show the volume control 
    PropsProto.showVolumeControl = function() {
        return this.isSelected('TTS Audio Adjustments', 'TDS_TTSAA_Volume');
    };

    // In the sound check page, do we show the pitch control
    PropsProto.showPitchControl = function() {
        return this.isSelected('TTS Audio Adjustments', 'TDS_TTSAA_Pitch');
    };

    // In the sound check page, do we show the rate control
    PropsProto.showRateControl = function() {
        return this.isSelected('TTS Audio Adjustments', 'TDS_TTSAA_Rate');
    };

    // if true then you can only pause if the page has all questions answered
    PropsProto.blockPausing = function() {
        return this.isSelected('Block Pausing', 'TDS_BP1');
    };

    // if true then you can only pause if the page has all questions answered
    PropsProto.hasResponseReset = function() {
        return this.isSelected('Item Response Reset', 'TDS_ItemReset1');
    };

    // check if we should load the classic test shell
    PropsProto.isTestShellClassic = function() {
        return this.isSelected('Test Shell', 'TDS_TS_Classic');
    };

    // check if we should load the modern test shell
    PropsProto.isTestShellModern = function() {
        return this.isSelected('Test Shell', 'TDS_TS_Modern');
    };

    // check if we should load the universal shell (default)
    PropsProto.isTestShellUniversal = function() {
        return this.isSelected('Test Shell', 'TDS_TS_Universal');
    };

    // check if we should load the accessibility shell
    PropsProto.isTestShellAccessibility = function() {
        return this.isSelected('Test Shell', 'TDS_TS_Accessibility');
    };

    PropsProto.isStreamlinedMode = function() {
        return this.isSelected('Streamlined Mode', 'TDS_SLM1');
    };

    // if this is true you are required to visit a page before it is considered completed
    PropsProto.requirePageVisit = function() {
        return this.isSelected('Require Page Visit', 'TDS_RPV1');
    };

    PropsProto.hasASL = function() {
        return this.isSelected('American Sign Language', 'TDS_ASL1');
    };

    PropsProto.hasClosedCaptioning = function () {
        return this.isSelected('Closed Captioning', 'TDS_ClosedCap1');
    };

    // If this is true then hide the final test score from the student on the results page.
    PropsProto.hideTestScore = function() {
        return this.isSelected('Suppress Score', 'TDS_SS1');
    };

    // If this is true then we show the item score report summary on the test results page.
    PropsProto.showItemScoreReportSummary = function() {
        return this.isSelected('Item Score Report', 'TDS_ISR_Summary');
    };

    PropsProto.showItemScoreReportResponses = function() {
        return this.isSelected('Item Score Report', 'TDS_ISR_SumViewResp');
    };

    PropsProto.isPermissiveModeEnabled = function() {
        return this.isSelected('Permissive Mode', 'TDS_PM1');
    };

    // check if fullscreen button is showing on test shell
    PropsProto.hasFullScreenEnabled = function() {
        return this.isSelected('Fullscreen', 'TDS_FS_On') ||
               this.isSelected('Fullscreen', 'TDS_FS_Pass');
    };

    // check if password is required to exit from fullscreen
    PropsProto.hasFullScreenPassword = function() {
        return this.isSelected('Fullscreen', 'TDS_FS_Pass');
    };

    PropsProto.hasSoundPlayCheck = function() {
        return this.isSelected('Hardware Checks', 'TDS_HWPlayback') ||
               this.isSelected('Hardware Checks', 'TDS_HWPlaybackVol');
    };

    PropsProto.hasSoundPlayVolCheck = function () {
        return this.isSelected('Hardware Checks', 'TDS_HWPlaybackVol');
    };

    PropsProto.hasRecorderCheck = function () {
        return this.isSelected('Hardware Checks', 'TDS_HWRecording');
    };

    PropsProto.hasSoundCheck = function() {
        return this.existsAndNotEquals('Hardware Checks', 'TDS_HW0');
    };

    PropsProto.isAutoMute = function() {
        return this.isSelected('Mute System Volume', 'TDS_Mute1');
    };

    // check if masking tool is showing on test shell
    PropsProto.hasMaskingEnabled = function() {
        return this.isSelected('Masking', 'TDS_Masking1');
    };

    // check if audio rewind is set
    PropsProto.isAudioRewindEnabled = function() {
        return this.isSelected('Audio Playback Controls', 'TDS_APC_PSP');
    };

    // check if paginate item groups is enabled
    PropsProto.isPaginatedItemGroupsEnabled = function() {
        return this.isSelected('Paginate Item Groups', 'TDS_PIG1');
    };

    // check if reverse contrast color scheme is selected.
    PropsProto.hasReverseContrast = function() {
        return this.isSelected('Color Choices', 'TDS_CCInvert');
    };

    /* 
    What kind of test progress indicator to show?
    •	TDS_TPI_None – Hide progress indicator.
    •	TDS_TPI_Responses – Shows “1 out of 20”. This is the current way of doing it and we default to this if acc is missing.
    •	TDS_TPI_ResponsesFix – Shows “1 out of 20” and performs test length adjust when test is completed. 
    •	TDS_TPI_Percent – Show “10% completed” and performs test length adjust when test is completed. 
    */
    PropsProto.getTestProgressIndicator = function() {
        return this.getSelectedCode('Test Progress Indictator') || 'TDS_TPI_Responses';
    };

    // check if system volume control is enabled
    PropsProto.hasSystemVolumeControl = function() {
        return this.isSelected('System Volume Control', 'TDS_SVC1');
    };

    PropsProto.isDictionaryEnabled = function() {
        return this.existsAndNotEquals('Dictionary', 'TDS_Dict0');
    };

    PropsProto.getDictionary = function() {
        return this.getSelectedCode('Dictionary');
    };

    PropsProto.getDictionaryOptions = function() {
        var accType = this._accommodations.getType('Dictionary Options');
        return (accType != null) ? accType.getCodes() : [];
    };

    PropsProto.isSpanishDictionaryEnabled = function () {
        return this.existsAndNotEquals('Spanish Dictionary', 'TDS_SP0');
    };

    PropsProto.getSpanishDictionary = function () {
        return this.getSelectedCode('Spanish Dictionary');
    };

    PropsProto.getSpanishDictionaryOptions = function () {
        var accType = this._accommodations.getType('Spanish Dictionary Options');
        return (accType != null) ? accType.getCodes() : [];
    };

    PropsProto.isThesaurusEnabled = function() {
        return this.existsAndNotEquals('Thesaurus', 'TDS_TH0');
    };

    PropsProto.getThesaurus = function() {
        return this.getSelectedCode('Thesaurus');
    };

    PropsProto.getThesaurusOptions = function() {
        var accType = this._accommodations.getType('Thesaurus Options');
        return (accType != null) ? accType.getCodes() : [];
    };

    PropsProto.isTTSTrackingEnabled = function() {
        return this.existsAndNotEquals('TTS Tracking', 'TDS_TTSTracking0');
    };

    PropsProto.isSecurityBreachDetectionEnabled = function() {
        return this.isSelected('Enhanced Security Options', 'TDS_ESO_DetectBrowserBreach') && !this.isPermissiveModeEnabled();
    };

    // If this is true then we will show the item tools menu
    PropsProto.showItemToolsMenu = function() {
        return this.isSelected('Item Tools Menu', 'TDS_ITM1');
    };

    PropsProto.checkOptionalUnanswered = function() {
        return this.isSelected('Check Optional Unanswered', 'TDS_COU1');
    };

    PropsProto.getHTMLEditorButtonGroups = function () {
        var accType = this._accommodations.getType('HTMLEditor Button Groups');
        var selButtonGroups = accType ? accType.getSelected() : [];
        var buttonGroups = [];
        for (var index = 0; index < selButtonGroups.length; ++index) {
            buttonGroups.push(selButtonGroups[index].getCode());
        }
        return buttonGroups;
    };

    // should we use a drop down on the review shell
    PropsProto.isReviewScreenLayoutDropDown = function() {
        return this.isSelected('Review Screen Layout', 'TDS_RSL_DropDown');
    };

    // should we use a list view on the review shell
    PropsProto.isReviewScreenLayoutListView = function () {
        return this.isSelected('Review Screen Layout', 'TDS_RSL_ListView');
    };
    
    Accs.Properties = Props;

})(Accommodations);