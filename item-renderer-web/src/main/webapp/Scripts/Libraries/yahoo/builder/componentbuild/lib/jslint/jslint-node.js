//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 * Javascript Shell Script to Load and JSLint js files through Rhino Javascript Shell
 * The jslint source file is expected as the first argument, followed by the list of JS files to JSLint
 *
 * e.g.
 *  java -j js.jar /tools/fulljslint.js testFile1.js testFile2.js testFile3.js
 **/

JSLINT = require("./fulljslint").JSLINT;

(function(){ // Just to keep stuff seperate from JSLINT code

    var PORT = parseInt(process.argv[2]) || 8081;

    var OPTS = {
        browser : true,
        //laxLineEnd : true,
        undef: true,
        newcap: false,
        predef:["YUI", "window", "YUI_config", "YAHOO", "YAHOO_config", "Event",
                "opera", "exports", "document", "navigator", "console", "self", "require",
                "_yuitest_coverline",
                "_yuitest_coverfunc",
                "_yuitest_coverage",
                "module", "process", "__dirname", "__filename"]
    };

    function test(js, file) {
        var body = "", code = 200;

        var success = JSLINT(js, OPTS);
        if (success) {
            return {
                "content": '\t[JSLINT] [OK] ' + file,
                code: code
            };
        } else {
            if (JSLINT.errors.length) {
                body += '[JSLINT] ' + file + '\n';
                body += '----------------------------------------------------------\n';
                for (var i=0; i < JSLINT.errors.length; ++i) {
                    var e = JSLINT.errors[i];
                    if (e) {
                        body += ("\t" + e.line + ", " + e.character + ": " + e.reason + "\n\t" + clean(e.evidence) + "\n");
                    }
                }
                body += '----------------------------------------------------------\n';
            }

            // Last item is null if JSLint hit a fatal error
            if (JSLINT.errors && JSLINT.errors[JSLINT.errors.length-1] === null) {
                code = 500;
            }
            return {
                "content" : body,
                "code" : code
            };
        }
    }

    function clean(str) {
        var trimmed = "";
        if (str) {
            if(str.length <= 500) {
                trimmed = str.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
            } else {
                trimmed = "[Code Evidence Omitted: Greater than 500 chars]";
            }
        }
        return trimmed;
    }

    var qs = require("querystring");
    var fs = require("fs");
    var EventEmitter = require("events").EventEmitter;

    var ticket = 0;

    require("http").createServer(function (req, res) {
        var data = "";
        req.addListener("data", function (chunk) {
            data += chunk;
        });
        var proc = new EventEmitter();
        proc.addListener("end", function (code, body, die) {
            res.writeHead(code, {"Content-type" : "text/plain"});
            res.end(body);
            if (die) process.exit(0);
        });
        req.addListener("end", function () {
            ticket++;
            var code = 200, body;
            var die = "/kill" === req.url;
            if (die) body = "Goodbye.";
            else if (req.method === "POST") {
                var query = qs.parse(data);
                var files = query["files"].split("' '");
                var failOnError = query["failonerror"] == "true";
                var results = [];
                files.forEach(function (file) {
                    fs.readFile(file, function (err, data) {
                        var diagnosis = test(data.toString("utf8"), file);
                        results.push(diagnosis.content);

                        code = (
                            failOnError &&
                            diagnosis.code !== 200
                        ) ? diagnosis.code : code;

                        if (results.length == files.length) proc.emit("end", code, results.join("\n"));
                    });
                });
            } else {
                body = "Ready.";
            }
            if (body) proc.emit("end", code, body, die);
        });
    }).listen(PORT, "127.0.0.1");

    console.log("Server started on port " + PORT);

    (function () {
        var reap;
        setInterval(function () {
            if (reap == ticket) process.exit(0);
            reap = ticket;
        }, 10000);
    })();
})();

