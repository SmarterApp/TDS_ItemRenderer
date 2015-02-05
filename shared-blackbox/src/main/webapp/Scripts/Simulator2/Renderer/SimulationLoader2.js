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
SimulationLoader._regex_translationImageElement = /^.*(languageElement id="trans\..*\.image[^"]*").*$/gm; // returns whole line with image file in it
SimulationLoader._regex_translationImageFile = /value[\s]*=[\s]*".*"/g; // used on result of _regex_translationImageElement to extract value attribute

// generic function for parsing xml attributes with the regex above
SimulationLoader._parse = function(xmlText, regex) 
{
    var values = [];
    var matches = xmlText.match(regex);
    
    if (matches != null)
    {
        var extractFile = function(str) 
        {
            var index = str.indexOf('"');
            var cleanStr = str.substring(index + 1);
            index = cleanStr.indexOf('"');
            cleanStr = cleanStr.substring(0, index);
                 
            return cleanStr;
        }

        var extractFileFromTranslationImageElement = function(str)
        {
            // when checking for images in translation elements, we first match the whole line (b/c js does not support regex lookbehind...)
            // and then extract value attribute from that, hence this extra step
            var valueMatch = str.match(SimulationLoader._regex_translationImageFile)[0];

            return extractFile(valueMatch);
        }

        if (regex == this._regex_translationImageElement)
        {
            for (var i = 0; i < matches.length; i++)
            {
                values.push(extractFileFromTranslationImageElement(matches[i]));
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
SimulationLoader.parseImages = function(xmlText, translationText)
{
    var imageFiles = [];

    if (translationText == null) // pre-i18n version: image names are in simXml itself
    {
        imageFiles = imageFiles.concat(this._parse(xmlText, this._regex_images1));
        imageFiles = imageFiles.concat(this._parse(xmlText, this._regex_images2));
    }
    else if (translationText == 'TEST MODE') { // for testing when translation xml is simply appended to simXml - remove when no longer needed!
        imageFiles = imageFiles.concat(this._parse(xmlText, this._regex_translationImageElement));
    }
    else { // i18n-compliant version: image names are in the translationXml
        imageFiles = imageFiles.concat(this._parse(translationText, this._regex_translationImageElement));
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
    var flashFiles = [];

    flashFiles = flashFiles.concat(this._parse(xmlText, this._regex_flash1));
    flashFiles = flashFiles.concat(this._parse(xmlText, this._regex_flash2));
    flashFiles = flashFiles.concat(this._parse(xmlText, this._regex_flash3));
    
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


