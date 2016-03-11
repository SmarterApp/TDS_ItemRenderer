//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/* Cookies */

Util.Browser.createCookie = function(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }

    document.cookie = name + "=" + value + expires + "; path=/";
};

Util.Browser.readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }

    return null;
};

Util.Browser.readSubCookie = function(name, subName) {
    var cookie = this.readCookie(name);
    var subCookies = decodeURIComponent(cookie).split("&");
    for (var i = 0; i < subCookies.length; i++) {
        var pair = subCookies[i].split('=');
        if (decodeURIComponent(pair[0]) == subName) {
            return decodeURIComponent(pair[1]);
        }
    }
};

// clear a specific cookie
Util.Browser.eraseCookie = function(name) {
    this.createCookie(name, "", -1);
};

// clear all cookies
Util.Browser.clearCookies = function() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookieName = cookies[i].split("=")[0];
        Util.Browser.eraseCookie(cookieName);
    }
};