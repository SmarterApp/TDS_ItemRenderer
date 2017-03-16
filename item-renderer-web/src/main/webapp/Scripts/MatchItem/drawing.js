//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// http://www.gapjumper.com/research/lines.html

function createLine(x1, y1, x2, y2)
{
    // create div
    var line = document.createElement('a');
    if (YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 9) {
        line.className = 'line ieline';
    } else {
        line.className = 'line';        
    }
    // document.body.appendChild(line);
    
    // update position
    updateLine(line, x1, y1, x2, y2);
    
    return line;
}

function updateLine(line, x1, y1, x2, y2)
{
    if (x2 < x1)
    {
        var temp = x1;
        x1 = x2;
        x2 = temp;
        temp = y1;
        y1 = y2;
        y2 = temp;
    }
    
    var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    line.style.width = length + 'px';

    // check if IE 8
    if (YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 9)
    {
        line.style.top = (y2 > y1) ? y1 + 'px' : y2 + 'px';
        line.style.left = x1 + 'px';
        var nCos = (x2 - x1) / length;
        var nSin = (y2 - y1) / length;
        line.style.filter = 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' + nCos + ', M12=' + (-1 * nSin) + ', M21=' + nSin + ', M22=' + nCos + ')';
    }
    else
    {
        var angle = Math.atan((y2 - y1) / (x2 - x1));
        line.style.top = y1 + 0.5 * length * Math.sin(angle) + 'px';
        line.style.left = x1 - 0.5 * length * (1 - Math.cos(angle)) + 'px';
        
        var property = getTransformProperty(line);
        line.style[property] = 'rotate(' + angle + 'rad)';
    }

    return line;
}

// gets the transform style property for this browser
function getTransformProperty(element) {

    // Note that in some versions of IE9 it is critical that
    // msTransform appear in this list before MozTransform
    var properties = [
        'transform',
        'WebkitTransform',
        'msTransform',
        'MozTransform',
        'OTransform'
    ];
    var p;
    while (p = properties.shift()) {
        if (typeof element.style[p] != 'undefined') {
            return p;
        }
    }
    return false;
}