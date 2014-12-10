Sections.Instructions = function()
{
    Sections.Instructions.superclass.constructor.call(this, 'sectionInstructions');

    this.addClick('btnCancelTest', function()
    {
        this.request('back');
    });

    this.addClick('btnStartTest', this.start);

};

YAHOO.lang.extend(Sections.Instructions, Sections.Base);

Sections.Instructions.prototype.init = function ()
{
    var container = YUD.get('quickQuide');
    var frame = YUD.get('helpFrame');
    var url = TDS.Help.getUrl();

    // load instructions
    TDS.ToolManager.loadFrameUrl(container, frame, url, function(frameDoc, allowAccess) // loadFrameKey
    {
        // set embedded class so the help styles itself for being embedded in a page
        YUD.addClass(frameDoc.body, 'embedded');

        // init help tts
        TDS.Help.onLoad(frame, 'startSpeakingButton', 'stopSpeakingButton', 'ttsHelpMessage', 'noTTSHelpMessage');
    });
};

Sections.Instructions.prototype.start = function () {

    var testee = TDS.Student.Storage.getTestee();

    var callback = function (testInfo) {
        TDS.Student.Storage.setTestInfo(testInfo);
        TDS.redirectTestShell();
    };

    TDS.Student.API.startTest(testee, LoginShell.formSelection).then(callback);
};
