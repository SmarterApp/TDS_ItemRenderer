/*
Validate if a certified vmware is running.
*/

(function(SBV) {

    SBV.register({

        name: 'vmware',

        // is this browser supported
        isSupported: function () {
            // only perform VMware validation on Windows SB
            return (Util.Browser.isSecure() && Util.Browser.isWindows());
        },

        // if everything validates then return true, otherwise false
        validate: function () {
            var SB = Util.SecureBrowser;
            // retrieve the manufacturer registry key. If running on VMware, the key value contains "VMware"
            var systemManufacturer = SB.readRegistryValue(SB.HKEY_LOCAL_MACHINE, "HARDWARE\\DESCRIPTION\\System\\BIOS", "SystemManufacturer");
            if (systemManufacturer && systemManufacturer.indexOf("VMware") != -1) {
                // if the browser is running on VMware, check whether it is certified
                var viewClient = SB.readRegistryValue(SB.HKEY_CURRENT_USER, "Volatile Environment", "ViewClient_Type");
                if (viewClient != "Teradici_POiCP") {
                    return false;
                }
            }
            return true;
        },

        // message for code failure
        message: 'Browser.Denied.VMwareUncertified'
    });
    
})(TDS.SecureBrowser.Validators);