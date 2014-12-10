/*
This module is used to listen for security breaches in the secure browser.
*/

(function (TS, MSG) {

    function load() {

        // make sure the event exists
        if (!Util.SecureBrowser.Events ||
            !Util.SecureBrowser.Events.onSecurityBreach) return;

        // listen for secutiry breach event if the acc is enabled
        var accProps = TDS.getAccommodationProperties();
        if (accProps && accProps.isSecurityBreachDetectionEnabled()) {
            Util.SecureBrowser.Events.onSecurityBreach.subscribe(function(evt) {
                var errorMsg = MSG.getAlt('TestShell.Alert.EnvironmentInsecure', 'Environment is not secure. Your test will be paused.');
                TS.UI.showAlert('Error', errorMsg, function () {
                    TS._pauseInternal(true, 'Environment Security (breach event)', TestShell.Config.disableSaveWhenEnvironmentCompromised);
                });
            });
        }
    }

    TS.registerModule({
        name: 'securitybreach',
        load: load
    });

})(TestShell, Messages);
