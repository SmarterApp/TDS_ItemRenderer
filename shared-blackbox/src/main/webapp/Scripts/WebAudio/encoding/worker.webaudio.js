(function (worker) {
    "use strict";

    worker.encoding = {};

    function dispatchMessage(event) {
        doEncodeDecode(event.data, event.data.command);
    }

    function formatError(error) {
        if (!error.stack || error.stack.indexOf(error.message) === -1) {
            if (!error.stack || !error.message) {
                error = error.toString();
            } else {
                error = error.message + '\n' + error.stack;
            }
        } else {
            error = error.stack;
        }

        return error;
    }

    worker.log = function (message) {
        worker.postMessage({
            command: 'log',
            message: message
        });
    };

    function doEncodeDecode(data, operation) {
        var encoderName = data.encoderName,
            track = data.track,
            id = data.id,
            operator, result, resultsToCheck, transferrables = [],
            startTime, endTime;

        function notifyProgress(percent) {
            worker.postMessage({
                status: 'progress',
                percent: percent,
                id: id
            });
        }

        try {
            operator = worker.encoding[encoderName][operation];

            startTime = Date.now();

            switch (operation) {
                case 'encode':
                case 'decode':
                    result = operator(track, notifyProgress);
                    break;

                case 'start':
                    operator(id, data.sampleRate, data.numberOfChannels, data.format);
                    break;

                case 'append':
                    operator(id, data.channelData);
                    break;

                case 'end':
                    result = operator(id);
                    break;

                default:
                    return;
            }
            endTime = Date.now();

            transferrables = getTransferrables(result, operation);

            // transfer the ArrayBuffer to the main thread
            worker.postMessage({
                command: operation,
                status: 'complete',
                result: result,
                id: id,
                time: endTime - startTime
            }, transferrables);

        } catch (error) {
            worker.postMessage({
                command: operation,
                status: 'error',
                error: formatError(error),
                id: id,
                time: endTime - startTime
            });
        }
    }

    function getTransferrables(result, operation) {
        var transferrables;

        switch (operation) {
            case 'encode':
            case 'end':
                transferrables = [result];
                break;

            case 'decode':
                transferrables = result.channelData.map(function (floats) {
                    return floats.buffer;
                });
                break;
        }

        return transferrables;
    }

    worker.addEventListener('message', dispatchMessage);

})(self);
