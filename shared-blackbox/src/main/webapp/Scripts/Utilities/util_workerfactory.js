(function (Util) {

    var workerFactory = {};

    if (Util.Browser.isSecure() && Util.Browser.getSecureVersion() >= 7.0) {
        // for some reason, enabling UniversalXPConnect permissions in SB clobbers the Worker constructor
        // to work around this issue, we must ahead of time
        // since we can't resolve urls at this point, we will create them from a Blob url

        var commandName = 'bootstrap-workerfactory';

        var workerBody = [
            "(function () {",
            "    function handleImportScriptCommand(event) {",
            "        var command = event.data.command,",
            "            scriptUrl = event.data.scriptUrl;",
            "",
            "        if (command === '" + commandName + "' && scriptUrl) {",
            "            console.log('bootstrapping worker with url \"' + scriptUrl + '\"');",
            "",
            "            importScripts(scriptUrl);",
            "            self.removeEventListener('message', handleImportScriptCommand);",
            "        }",
            "    }",
            "",
            "    self.addEventListener('message', handleImportScriptCommand);",
            "})();"
        ].join('\n');

        var blob = new Blob([workerBody], { type: 'text/javascript' }),
            url = URL.createObjectURL(blob);

        var workerPool = [],
            initialPoolSize = 1;

        function initializeWorkerPool() {
            for (; initialPoolSize--;) {
                var worker = new Worker(url);
                workerPool.push(worker);
            }
        }

        initializeWorkerPool();

        workerFactory.create = function (scriptUrl) {
            var worker = workerPool.shift();

            worker.postMessage({
                command: commandName,
                scriptUrl: scriptUrl
            });

            return worker;
        };

    } else {

        workerFactory.create = function (scriptUrl) {
            return new Worker(scriptUrl);
        };

    }

    Object.freeze(workerFactory);

    // exports

    Util.workerFactory = workerFactory;

})(Util);
