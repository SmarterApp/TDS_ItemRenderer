/*
This test shell module is used for the masking button.
*/

(function (TS) {

    if (window.TDS && !window.TDS.Mask) {
        return;
    }
    
    var CSS_ENABLED = 'msk-enabled';

    function isEnabled() {
        return YUD.hasClass(document.body, CSS_ENABLED);
    }

    // this is called when masking tool is requested
    function enable() {
        YUD.addClass(document.body, CSS_ENABLED);
    }

    // this is called when masking tool is disabled
    function disable() {
        YUD.removeClass(document.body, CSS_ENABLED);
    }

    // call this to toggle masking tool on and off
    function toggle() {
        if (isEnabled()) {
            disable();
        } else {
            enable();
        }
        TDS.Mask.toggle();
    }

    function load() {

        // check if masking is enabled
        var accProps = TDS.getAccommodationProperties();
        if (accProps && accProps.hasMaskingEnabled()) {
            // setup button
            TestShell.UI.addButtonTool({
                id: 'btnMask',
                className: 'maskingtool',
                i18n: 'TestShell.Link.Masking',
                label: 'Masking',
                fn: toggle
            });
        } else {
            console.warn("Masking not enabled.");
            return;
        }
        //removing CSS_ENABLED class from body element while page hide.
        ContentManager.onPageEvent('hide', function () {
            if (isEnabled()) {
                disable();
            }
        });

    }

    TS.registerModule({
        name: 'masking',
        load: load
    });

})(TestShell);

