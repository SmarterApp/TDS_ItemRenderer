/* ZOOM CODE */
(function (TS) {

    /*
    NOTE:
    When zooming is manually called on the test shell we
    ask the content page zoom object to zoom.
    */
   
    // listen for when content is zoomed so we can also zoom the test shell
    ContentManager.onPageEvent('zoom', function (contentPage) {

        // BUG #66206: Bottom border of Calculators is missing when zooming in & out
        $(TDS.ToolManager.getAll()).each(function (idx, panel) {
            if (panel.refresh) {
                panel.refresh();
            }
        });

    });

    function zoomIn() {
        var currentPage = ContentManager.getCurrentPage();
        if (currentPage) {
            currentPage.zoomIn();
        }
    }

    function zoomOut() {
        var currentPage = ContentManager.getCurrentPage();
        if (currentPage) {
            currentPage.zoomOut();
        }
    }

    TS.UI.zoomIn = zoomIn;
    TS.UI.zoomOut = zoomOut;

    function load() {
        TS.UI.addClick('btnZoomIn', zoomIn);
        TS.UI.addClick('btnZoomOut', zoomOut);
    }

    TS.registerModule({
        name: 'zoom',
        load: load
    });

})(TestShell);