/*
Used to setup the tools manager.
*/

(function (TS, TDS, CM) {

    var TM = TDS.ToolManager;

    // add zooming to tools
    TM.Events.subscribe('onLoaded', function (panel) {

        // set zoom css
        var frame = panel.getFrame();
        var frameDoc = Util.Dom.getFrameContentDocument(frame);

        // add tool window to zoomable docs and refresh (make sure frame has no zoom styles or images won't zoom)
        var zoom = CM.getZoom();
        if (zoom) {
            zoom.addDocument(frameDoc);
        }
    });

    // add accommodations to help guide
    TM.Events.subscribe('onShow', function (panel) {
        YUD.addClass(document.body, 'showingTools');
    });

    // add accommodations to help guide
    TM.Events.subscribe('onHide', function (panel) {
        YUD.removeClass(document.body, 'showingTools');
    });

    // hide all dialogs if the context menu is now showing
    CM.onPageEvent('beforeHide', function (contentPage) {
        TM.hideAll();
    });

    // BUG #66206: Bottom border of Calculators is missing when zooming in & out
    CM.onPageEvent('zoom', function (contentPage) {
        if (CM.getCurrentPage() == contentPage) {
            var toolPanels = TDS.ToolManager.getAll();
            toolPanels.forEach(function(panel) {
                if (panel.refresh) {
                    panel.refresh();
                }
            });
        }
    });

    function updateShowing() {
        if (this._count) {
            YUD.addClass(document.body, TS.UI.CSS.popupShowing);
        } else {
            YUD.removeClass(document.body, TS.UI.CSS.popupShowing);
        }
    }

    TS.PageManager.Events.subscribe('onShow', function(page) {
        updateShowing();
    });

    function load() {
        TM.init();
    }

    TS.registerModule({
        name: 'tools',
        load: load
    });

})(window.TestShell, window.TDS, window.ContentManager);