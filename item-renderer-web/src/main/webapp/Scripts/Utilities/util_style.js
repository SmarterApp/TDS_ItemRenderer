//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Util.Style = { };

/**
 * Gets the cascaded style value of a node, or null if the value cannot be
 * computed (only Internet Explorer can do this).
 *
 * @param {Element} element Element to get style of.
 * @param {string} style Property to get (camel-case).
 * @return {string} Style value.
 */
Util.Style._getCascadedStyle = function(element, style) 
{
    return element.currentStyle ? element.currentStyle[style] : null;
};

/**
 * A map used to map the border width keywords to a pixel width.
 * @type {Object}
 * @private
 */
Util.Style._ieBorderWidthKeywords = 
{
    'thin': 2,
    'medium': 4,
    'thick': 6
};

/**
 * IE specific function that converts a non pixel unit to pixels.
 * @param {Element} element  The element to convert the value for.
 * @param {string} value  The current value as a string. The value must not be
 *     ''.
 * @param {string} name  The CSS property name to use for the converstion. This
 *     should be 'left', 'top', 'width' or 'height'.
 * @param {string} pixelName  The CSS pixel property name to use to get the
 *     value in pixels.
 * @return {number} The value in pixels.
 * @private
 */
Util.Style._getIePixelValue = function(element, value, name, pixelName) 
{
    // Try if we already have a pixel value. IE does not do half pixels so we
    // only check if it matches a number followed by 'px'.
    if (/^\d+px?$/.test(value)) 
    {
        return parseInt(value, 10);
    } 
    else 
    {
        var oldStyleValue = element.style[name];
        var oldRuntimeValue = element.runtimeStyle[name];
        // set runtime style to prevent changes
        element.runtimeStyle[name] = element.currentStyle[name];
        element.style[name] = value;
        var pixelValue = element.style[pixelName];
        // restore
        element.style[name] = oldStyleValue;
        element.runtimeStyle[name] = oldRuntimeValue;
        return pixelValue;
    }
};

/**
 * Helper function for IE to get the pixel border.
 * @param {Element} element  The element to get the pixel border for.
 * @param {string} prop  The part of the property name.
 * @return {number} The value in pixels.
 * @private
 */
Util.Style._getIePixelBorder = function(element, prop) 
{
    if (Util.Style._getCascadedStyle(element, prop + 'Style') == 'none') 
    {
        return 0;
    }

    var width = Util.Style._getCascadedStyle(element, prop + 'Width');
    
    if (width in Util.Style._ieBorderWidthKeywords) 
    {
        return Util.Style._ieBorderWidthKeywords[width];
    }
    
    return Util.Style._getIePixelValue(element, width, 'left', 'pixelLeft');
};

/**
 * Gets the computed border widths (on all sides) in pixels
 * @param {Element} element  The element to get the border widths for.
 * @return {!YAHOO.util.Region} The computed border widths.
 */
Util.Style.getBorderBox = function(element) 
{
    if (YAHOO.env.ua.ie) 
    {
        var left = Util.Style._getIePixelBorder(element, 'borderLeft');
        var right = Util.Style._getIePixelBorder(element, 'borderRight');
        var top = Util.Style._getIePixelBorder(element, 'borderTop');
        var bottom = Util.Style._getIePixelBorder(element, 'borderBottom');
        
        return new YAHOO.util.Region(top, right, bottom, left);
    }
    else 
    {
        // On non-IE browsers, getComputedStyle is always non-null.
        var left = (YUD.getComputedStyle(element, 'borderLeftWidth'));
        var right = (YUD.getComputedStyle(element, 'borderRightWidth'));
        var top = (YUD.getComputedStyle(element, 'borderTopWidth'));
        var bottom = (YUD.getComputedStyle(element, 'borderBottomWidth'));

        return new YAHOO.util.Region(parseFloat(top),
                                     parseFloat(right),
                                     parseFloat(bottom),
                                     parseFloat(left));
    }
};

Util.Style.getPageOffset = function(element)
{
    var region = YUD.getRegion(element);
    return { x: region.left, y: region.top };
};

/**
 * Changes the scroll position of {@code container} with the minimum amount so
 * that the content and the borders of the given {@code element} become visible.
 * If the element is bigger than the container, its top left corner will be
 * aligned as close to the container's top left corner as possible.
 *
 * @param {Element} element The element to make visible.
 * @param {Element} container The container to scroll.
 * @param {boolean=} opt_center Whether to center the element in the container.
 *     Defaults to false.
 */
// http://closure-library.googlecode.com/svn/docs/closure_goog_style_style.js.source.html#line447
Util.Style.scrollIntoContainerView = function(element, container, opt_center) 
{
    // Absolute position of the element's border's top left corner.
    var elementPos = Util.Style.getPageOffset(element);

    // Absolute position of the container's border's top left corner.
    var containerPos = Util.Style.getPageOffset(container);
    var containerBorder = Util.Style.getBorderBox(container);

    // Relative pos. of the element's border box to the container's content box.
    var relX = elementPos.x - containerPos.x - containerBorder.left;
    var relY = elementPos.y - containerPos.y - containerBorder.top;

    // How much the element can move in the container, i.e. the difference between
    // the element's bottom-right-most and top-left-most position where it's
    // fully visible.
    var spaceX = container.clientWidth - element.offsetWidth;
    var spaceY = container.clientHeight - element.offsetHeight;

    if (opt_center) 
    {
        // All browsers round non-integer scroll positions down.
        container.scrollLeft += relX - spaceX / 2;
        container.scrollTop += relY - spaceY / 2;
    }
    else 
    {
        // This formula was designed to give the correct scroll values in the
        // following cases:
        // - element is higher than container (spaceY < 0) => scroll down by relY
        // - element is not higher that container (spaceY >= 0):
        //   - it is above container (relY < 0) => scroll up by abs(relY)
        //   - it is below container (relY > spaceY) => scroll down by relY - spaceY
        //   - it is in the container => don't scroll
        container.scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
        container.scrollTop += Math.min(relY, Math.max(relY - spaceY, 0));
    }
};

/************************************************************************************/

/**
* Sets the content of a style element.  The style element can be any valid
* style element.  This element will have its content completely replaced by
* the new stylesString.
* @param {Element|StyleSheet} element A stylesheet element as returned by
*     installStyles.
* @param {string} stylesString The new content of the stylesheet.
*/
Util.Style.setStyles = function(element, stylesString)
{
    if (YAHOO.env.ua.ie)
    {
        // Adding the selectors individually caused the browser to hang if the
        // selector was invalid or there were CSS comments.  Setting the cssText of
        // the style node works fine and ignores CSS that IE doesn't understand
        element.cssText = stylesString;
    } 
    else
    {
        var propToSet = YAHOO.env.ua.webkit ? 'innerText' : 'innerHTML';
        element[propToSet] = stylesString;
    }
};

/**
* Installs the styles string into the window that contains opt_element.  If
* opt_element is null, the main window is used.
* @param {string} stylesString The style string to install.
* @param {Node=} opt_node Node whose parent document should have the
*     styles installed.
* @return {Element|StyleSheet} The style element created.
*/
Util.Style.installStyles = function(doc, stylesString)
{
    var styleSheet = null;

    if (YAHOO.env.ua.ie)
    {
        styleSheet = doc.createStyleSheet();
        Util.Style.setStyles(styleSheet, stylesString);
    } 
    else
    {
        var head = doc.getElementsByTagName('head')[0];
        styleSheet = doc.createElement('style');

        // NOTE(user): Setting styles after the style element has been appended
        // to the head results in a nasty Webkit bug in certain scenarios. Please
        // refer to https://bugs.webkit.org/show_bug.cgi?id=26307 for additional
        // details.
        Util.Style.setStyles(styleSheet, stylesString);
        head.appendChild(styleSheet);
    }
    
    return styleSheet;
};