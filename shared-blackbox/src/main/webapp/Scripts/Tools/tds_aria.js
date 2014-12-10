if (typeof TDS != 'object') TDS = {};

/*
SB JAWS FIX:
Basically, what you need to do is JAWS user settings, add to the confignames.ini a single line (after Firefox3=firefox) the line 
OaksSecureBrowser5.0=firefox
JAWS user setting is an option in the program list
*/

TDS.ARIA = {};

// create log section on the page
TDS.ARIA.createLog = function()
{
    var logDiv = YUD.get('log');
    if (logDiv) return logDiv;

    logDiv = HTML.DIV(
    {
        'id': 'log',
        'className': 'element-invisible',
        'role': 'log'
    });

    logDiv.setAttribute('aria-live', 'polite');
    logDiv.setAttribute('aria-relevant', 'additions text');
    logDiv.setAttribute('aria-atomic', 'true');

    document.body.appendChild(logDiv);
    return logDiv;
};

TDS.ARIA.writeLog = function(msg)
{
    var logDiv = YUD.get('log');

    if (logDiv == null)
    {
        logDiv = this.createLog();
    }

    var currentMsgDiv = YUD.getFirstChild(logDiv);
    var msgDiv = HTML.P(null, msg);

    if (currentMsgDiv)
    {
        logDiv.replaceChild(msgDiv, currentMsgDiv);
    }
    else
    {
        logDiv.appendChild(msgDiv);
    }

    Util.log('ARIA LOG: ' + msg);
};