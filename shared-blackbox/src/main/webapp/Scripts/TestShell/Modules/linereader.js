/*
Code used for showing linereader.
*/

(function (TS) {

    function toggle() {
        TDS.LineReaderControl.toggle();
    };

    function load() {
        TS.UI.addClick('btnLineReader', toggle);
    }

    TS.registerModule({
        name: 'linereader',
        load: load
    });

})(TestShell);
