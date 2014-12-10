(function(Util)
{
	Util.Date = {};

    function xPad(x, pad, r) {
        if (typeof r === 'undefined') {
            r = 10;
        }
        for (; parseInt(x, 10) < r && r > 1; r /= 10) {
            x = pad.toString() + x;
        }
        return x.toString();
    }

    Util.Date.formatTime = function(d) {
        var hour = d.getHours() % 12;
        hour = xPad(hour === 0 ? 12 : hour, 0);

        var time = hour + ':' + xPad(d.getMinutes(), 0) + ':' + xPad(d.getSeconds(), 0) + '.' + xPad(d.getMilliseconds(), 00);
        //time += ' ' + (d.getHours() >= 12 ? 'PM' : 'AM');
        return time;
    };

    Util.Date.now = Date.now || (function() {
        // Unary plus operator converts its operand to a number which in the case of a date is done by calling getTime().
        return +new Date();
    });

    Util.Date.xPad = xPad;

})(Util);

