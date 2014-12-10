/*
Code used for showing dictionary popup.
*/

(function (TS, TM) {

    function createUrl() {

        var accProps = TDS.getAccommodationProperties();

        var urlParams = [];

        var dict = accProps.getDictionary(),
            spDict = accProps.getSpanishDictionary();

        if (dict) {
            urlParams.push('dictionary=' + dict);
        }
        if (spDict) {
            urlParams.push('spanish=' + spDict);
        }

        var dictOptions = accProps.getDictionaryOptions(),
            spDictOptions = accProps.getSpanishDictionaryOptions();

        if (dictOptions && dictOptions.length > 0) {
            urlParams.push('do=' + dictOptions.join(','));
        }
        if (spDictOptions && spDictOptions.length > 0) {
            urlParams.push('so=' + spDictOptions.join(','));
        }

        var thes = accProps.getThesaurus();
        if (thes) {
            urlParams.push('thesaurus=' + thes);
        }

        var thesOptions = accProps.getThesaurusOptions();
        if (thesOptions && thesOptions.length > 0) {
            urlParams.push('to=' + thesOptions.join(','));
        }

        var url = TS.Config.dictionaryUrl + '?';
        url += urlParams.join('&');
        return url;
    }

    function toggle() {

        var url = createUrl();
        var id = 'tds-dict-' + Util.String.hashCode(url); // unique id

        // create panel
        var panel = TM.get(id);
        if (panel == null) {
            var headerText = window.Messages.getAlt('TestShell.Label.Dictionary', 'Dictionary');
            panel = TM.createPanel(id, 'dictionary', headerText, null, url);
        }

        TM.toggle(panel);
    }

    function showDictionaryButton() {
        YUD.setStyle('btnDictionary', 'display', 'block');
    }

    function hideDictionaryButton() {
        YUD.setStyle('btnDictionary', 'display', 'none');
    }

    function load() {
        if (TS.Config.dictionaryUrl) {
            TS.UI.addButtonTool({
                id: 'btnDictionary',
                className: 'dictionary',
                i18n: 'TestShell.Link.Dictionary',
                label: 'Dictionary',
                fn: toggle
            });
            hideDictionaryButton();
        }
    }

    // check if we should show dictionary button
    ContentManager.onPageEvent('show', function (page) {
        var accProps = page.getAccProps();
        if (accProps.isDictionaryEnabled() ||
            accProps.isSpanishDictionaryEnabled() ||
            accProps.isThesaurusEnabled()) {
            showDictionaryButton();
        } else {
            hideDictionaryButton();
        }
    });

    TS.registerModule({
        name: 'dictionary',
        load: load
    });

})(TestShell, TDS.ToolManager);
