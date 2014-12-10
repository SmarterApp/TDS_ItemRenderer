/*
This is the beginning of unit tests. Right now I am starting with
just getting windows stuff to work so I can see how that will look. 
At some point we need to add all browsers in a generic way.
*/

TDS.SecureBrowser.initialize();
var impl = TDS.SecureBrowser.getImplementation();

// check if SB otherwise don't run any tests
if (impl) {
    console.info('Found SB');
} else {
    console.error('No SB!');
}

var Cc = Components.classes;
var Ci = Components.interfaces;

test('Get process list', function () {
    var processes = impl.getProcessList();
    notEqual(processes.length, 0, 'Got list back');
    ok(processes.indexOf('explorer.exe') != -1, 'Check for process we know exists');
});

test('Registry', function() {

    // check for missing key
    var value = impl.readRegistryValue(impl.HKEY_LOCAL_MACHINE, 'SOFTWARE\\Foo', 'Bar');
    ok(value === null, 'Check for missing key');

    // check for missing value
    var value = impl.readRegistryValue(impl.HKEY_LOCAL_MACHINE, 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', 'FooBar');
    ok(value === null, 'Check for missing value');

    // get a known good value
    var value = impl.readRegistryValue(impl.HKEY_LOCAL_MACHINE, 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', 'ProductName');
    ok(value && value.indexOf('Windows') != -1, 'Check for known value');
});