/*
Accommodations
*/

(function (CM) {

    function match(page, content) {
        return page.getAccommodations() != null;
    }

    function Plugin_Accs(page, config) {
    }

    CM.registerPagePlugin('accommodations', Plugin_Accs, match);

    Plugin_Accs.prototype.beforeShow = function () {
        var page = this.page;
        var pageAccs = page.getAccommodations();
        Accommodations.Manager.updateCSS(page.getBody(), pageAccs.getId());
    }

})(ContentManager);
