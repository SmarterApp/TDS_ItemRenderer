(function (window) {
    'use strict';

    var iframe = document.getElementById('xpcom');

    iframe.style.display = 'none';

    function loadIFrame() {
        iframe.removeEventListener('load', loadIFrame);
    }

    iframe.addEventListener('load', loadIFrame);

    window.xpcom = iframe.contentWindow;

})(window);
