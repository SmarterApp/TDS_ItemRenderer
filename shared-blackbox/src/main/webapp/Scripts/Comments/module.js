/*
Code used for showing comments.
*/

(function (CM, TS, TM) {

    // called before showing comments
    function beforeShow() {
        TM.hideAll();
    }

    // listen for when someone triggers opening item comments
    CM.onItemEvent('comment', function (page, item) {
        beforeShow();
        TS.Comments.showItem(item);
    });

    // hide comments when page changes
    CM.onPageEvent('beforeHide', function () {
        TS.Comments.hide();
    });

    // hide comments when tools show
    TM.Events.subscribe('onShow', function () {
        TS.Comments.hide();
    });

    // setup comments
    function load() {

        TS.Comments.init();

        // listen for global comments
        TS.UI.addClick('btnGlobalNotes', function () {
            beforeShow();
            TS.Comments.showGlobal();
        });
    }

    // listen for test shell init (needs to work on legacy and geo)
    TS.Events.subscribe('init', load);

})(window.ContentManager, window.TestShell, window.TDS.ToolManager);
