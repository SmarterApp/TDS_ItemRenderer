//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This code is used for preloading and parsing image/flash.
*/

SimulationLoader = function(xmlText, callback)
{
    this._xmlText = xmlText;
    this._callback = callback;
};

SimulationLoader.prototype.start = function()
{
    var imageFiles = SimulationLoader.parseImages(this._xmlText);
    var flashFiles = SimulationLoader.parseFlash(this._xmlText);

    this._callback(this._xmlText);
};

/*************************************************************/

SimulationLoader._regex_images1 = /image[\s]*=[\s]*".*"/g;
SimulationLoader._regex_images2 = /src[\s]*=[\s]*".*(.jpg | .png | .gif)\s*"/g;
SimulationLoader._regex_flash1 = /flash[\s]*=[\s]*\".*\"/g;
SimulationLoader._regex_flash2 = /src[\s]*=[\s]*\".*(swf)\s*\"/g;
SimulationLoader._regex_flash3 = /altSrc[\s]*=[\s]*\".*(swf)\s*\"/g;
SimulationLoader._regex_translationImageElement = /^.*languageElement.*type="image\/.*$/gm;
SimulationLoader._regex_translationFlashElement = /^.*languageElement.*type="application\/x-shockwave-flash.*$/gm;
SimulationLoader._regex_extractAttribute = /="([^"]*)"/; // get (first) xml attribute in string
SimulationLoader._regex_extractNodeValue = />([^<]*)</; // get (first) xml node text value in string

// generic function for parsing xml attributes with the regex above
SimulationLoader._parse = function(xmlText, regex) 
{
    var values = [];
    var matches = xmlText.match(regex);
    
    if (matches != null)
    {
        var extractFile = function(str, isNodeValue) 
        {
            if (!isNodeValue) {
                return str.match(SimulationLoader._regex_extractAttribute)[1];
            } else {
                return str.match(SimulationLoader._regex_extractNodeValue)[1];
            }
        }

        if (regex == this._regex_translationImageElement || regex == this._regex_translationFlashElement)
        {
            for (var i = 0; i < matches.length; i++)
            {
                values.push(extractFile(matches[i], true));
            }
        }
        else
        {
            for(var i = 0; i < matches.length; i++)
            {
                values.push(extractFile(matches[i]));
            }
        }
    }
    
    return values;
};

// get all the image file names in the xml
SimulationLoader.parseImages = function(xmlText)
{
    if (typeof xmlText != 'string') {
        xmlText = new XMLSerializer().serializeToString(xmlText);
    }

    var imageFiles = [];

    var containsTranslation = xmlText.indexOf('<translation>') > -1;

    if (!containsTranslation) // pre-i18n version: image names are in simXml itself
    {
        imageFiles = imageFiles.concat(this._parse(xmlText, this._regex_images1));
        imageFiles = imageFiles.concat(this._parse(xmlText, this._regex_images2));
    }
    else { // i18n-compliant version: image names are in the translation section
        imageFiles = imageFiles.concat(this._parse(xmlText, this._regex_translationImageElement));
    }

    // resolve urls
    for (var i = 0; i < imageFiles.length; i++)
    {
        imageFiles[i] = SimulationLoader.resolveUrl(imageFiles[i]);
    }

    return imageFiles;
};

// get all the flash file names in the xml
SimulationLoader.parseFlash = function(xmlText) 
{
    if (typeof xmlText != 'string') {
        xmlText = new XMLSerializer().serializeToString(xmlText);
    }

    var flashFiles = [];

    var containsTranslation = xmlText.indexOf('<translation>') > -1;

    if (!containsTranslation) // pre-i18n version: image names are in simXml itself
    {
        flashFiles = flashFiles.concat(this._parse(xmlText, this._regex_flash1));
        flashFiles = flashFiles.concat(this._parse(xmlText, this._regex_flash2));
        flashFiles = flashFiles.concat(this._parse(xmlText, this._regex_flash3));
    }
    else { // i18n-compliant version: image names are in the translation section
        flashFiles = flashFiles.concat(this._parse(xmlText, this._regex_translationFlashElement));
    }

    
    // resolve urls
    for (var i = 0; i < flashFiles.length; i++)
    {
        flashFiles[i] = SimulationLoader.resolveUrl(flashFiles[i]);
    }

    return flashFiles;
};

// fix all the file paths in the xml to include the base url (used for dev)
SimulationLoader.fixPaths = function(xmlText, baseUrl)
{
    xmlText = xmlText.replace(/src=\"/g, 'src="' + baseUrl);
    xmlText = xmlText.replace(/altSrc=\"/g, 'altSrc="' + baseUrl);
    xmlText = xmlText.replace(/image=\"/g, 'image="' + baseUrl);
    xmlText = xmlText.replace(/deleteRowImage=\"/g, 'deleteRowImage="' + baseUrl);
    xmlText = xmlText.replace(/flash=\'"/g, 'flash="' + baseUrl);
    return xmlText;
};

// resolve the url to the current base of the document
SimulationLoader.resolveUrl = function(url)
{
    // change any html ampersand entities into the ampersand character
    url = url.replace(/&amp;/g, '&');

    // escape url
    url = url.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');

    // cross browser compatible (even in IE 6) way of qualifying a url
    // http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
    var el = document.createElement('div');
    el.innerHTML = '<a href="' + url + '">x</a>';
    return el.firstChild.href;
};


