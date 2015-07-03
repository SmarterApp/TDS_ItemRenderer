//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿function loaderTest()
{
	// parse the filename from a url path
	var getFilename = function(path)
	{
		return path.substr(path.lastIndexOf('/') + 1);
	};

    var attachLoaderEvents = function(loader)
    {
        loader.subscribe(ResourceLoader.Status.LOADING, function()
        {
            console.log('IMAGE LOADING: ' + getFilename(this._img.src));
        });

        loader.subscribe(ResourceLoader.Status.COMPLETE, function()
        {
            console.log('IMAGE COMPLETE: ' + getFilename(this._img.src));
        });

        loader.subscribe(ResourceLoader.Status.ERROR, function()
        {
            console.log('IMAGE ERROR: ' + getFilename(this._img.src));
        });

        loader.subscribe(ResourceLoader.Status.ABORT, function()
        {
            console.log('IMAGE ABORT: ' + getFilename(this._img.src));
        });
    };

    /*
    We are going to:
        - Wait for three images to load as a group
        - Wait for two javascript files to load
        - Wait for xhr request to complete.
        - Wait for a boolean to appear on the page and when it does then wait for a simulated event.
    */
    
    // create root collection
    var rootCollection = new ResourceLoader.Collection();

    // create image loaders
    var url_img1 = 'http://localhost/itempreviewlite/content/GridItem/RollerCoaster.png?rnd=' + Math.random();
    var loaderImg1 = new ResourceLoader.Image(url_img1);

    var url_img2 = 'http://localhost/itempreviewlite/content/WordBuilder/Item_131_v1_graphic116112308707921246847_png256.png?rnd=' + Math.random();
    var loaderImg2 = new ResourceLoader.Image(url_img2);

    var url_img3 = 'http://localhost/itempreviewlite/content/LPN/Item_1164_v2_graphics4_png256.png?rnd=' + Math.random();
    var loaderImg3 = new ResourceLoader.Image(url_img3, 3000, 2);

    // attach some debug handlers for images
    attachLoaderEvents(loaderImg1);
    attachLoaderEvents(loaderImg2);
    attachLoaderEvents(loaderImg3);

    // create collection and add image loaders
    var imagesCollection = new ResourceLoader.Collection();
    imagesCollection.add(loaderImg1);
    imagesCollection.add(loaderImg2);
    imagesCollection.add(loaderImg3);
    
    // add the images collections to the root collection
    rootCollection.add(imagesCollection);

    // create javascript to inject into page
    var scriptUrls =
    [
        'http://localhost/blackbox/Scripts/ResourceLoader/Tests/sample1.js',
        'http://localhost/blackbox/Scripts/ResourceLoader/Tests/sample2.js'
    ];
    
    var loaderScripts = new ResourceLoader.Script(scriptUrls, null, 3000);
    rootCollection.add(loaderScripts);

    // create ajax request
    var xhrUrl = 'http://localhost/blackbox/ContentRequest.axd/test';
    var loaderXhr = new ResourceLoader.Xhr(xhrUrl);
    rootCollection.add(loaderXhr);

    // create a condition to wait for a boolean to appear on the window object at some point
    var loaderConditional = new ResourceLoader.Conditional(function()
    {
        return (window._conditionTest === true);
    }, 100, 30000);

    // create a simulated loader
    var loaderSimulate = new ResourceLoader.Simulate();
    loaderSimulate.subscribe(ResourceLoader.Status.COMPLETE, function() { console.log('SIMULATE COMPLETE'); });
    
    // create a loader dependency between conditional and simulation
    var loaderDependency = new ResourceLoader.Dependency(loaderConditional, loaderSimulate);
    rootCollection.add(loaderDependency);
    
    // subscribe to when the root collection is completed
    rootCollection.subscribe(ResourceLoader.Status.COMPLETE, function()
    {
        console.log('LOAD MANAGER COMPLETE');
    });
    
    // load root collection
    rootCollection.load();

    // fire off a boolean to be set to true in 4 seconds for the conditional loader we created
    setTimeout(function()
    {
        window._conditionTest = true;
    }, 4000);
}

