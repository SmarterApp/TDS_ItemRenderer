//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// parse a <Region> xml element into a simple JSON object
Grid.ImportExport.parseRegion = function(regionNode)
{
    var region =
    {
        name: regionNode.getAttribute('name'),
        shape: regionNode.getAttribute('shape'),
        coords: regionNode.getAttribute('coords'),
        events: []
    };

    // get region events (children of <Events>)
    var eventNodes = regionNode.getElementsByTagName('Event');

    Grid.ImportExport.eachNode(eventNodes, function(eventNode)
    {
        var regionEvent =
        {
            name: eventNode.getAttribute('name'),
            styles: {},
            image: null,
            label: null
        };

        // parse style node
        var stylesNode = eventNode.getElementsByTagName('Styles');

        if (stylesNode.length == 1)
        {
            // get all style attributes
            Grid.ImportExport.eachNode(stylesNode[0].attributes, function(styleAttrib)
            {
                regionEvent.styles[styleAttrib.name] = styleAttrib.value;
            });
        }

        // parse image node
        var imageNode = eventNode.getElementsByTagName('Image');

        if (imageNode.length == 1)
        {
            imageNode = imageNode[0];

            regionEvent.image =
            {
                src: imageNode.getAttribute('src'),
                x: imageNode.getAttribute('x') * 1,
                y: imageNode.getAttribute('y') * 1
            };
        }

        // parse label node
        var labelNode = eventNode.getElementsByTagName('Label');

        if (labelNode.length == 1)
        {
            labelNode = labelNode[0];

            regionEvent.label =
            {
                text: labelNode.getAttribute('text'),
                x: labelNode.getAttribute('x') * 1,
                y: labelNode.getAttribute('y') * 1
            };
        }

        region.events.push(regionEvent);
    });

    return region;
};

// parse a <RegionGroup> xml element into a simple JSON object
Grid.ImportExport.parseRegionGroup = function(regionGroupNode)
{
    var regionGroup =
    {
        name: regionGroupNode.getAttribute('name'),
        min: regionGroupNode.getAttribute('min') * 1,
        max: regionGroupNode.getAttribute('max') * 1,
        includes: []
    };

    // get all the regions for this group (<Region> is used by schema v2.0)
    var regionNodes = regionGroupNode.getElementsByTagName('Region');

    Grid.ImportExport.eachNode(regionNodes, function(regionNode)
    {
        var regionName = regionNode.getAttribute('name');
        regionGroup.includes.push(regionName);
    });

    // get all the includes for this group (<Include> is used by schema v2.1)
    var includeNodes = regionGroupNode.getElementsByTagName('Include');

    Grid.ImportExport.eachNode(includeNodes, function(includeNode)
    {
        var regionName = includeNode.getAttribute('region');
        regionGroup.includes.push(regionName);
    });

    return regionGroup;
};

// code for loading a region group (<RegionGroup>)
Grid.ImportExport.loadHotspots = function(xmlobject, model, imageLoader)
{
    var hotspots = { regions: [], groups: [] };

    // import regions
    var regionNodes = xmlobject.getElementsByTagName("Region");

    Grid.ImportExport.eachNode(regionNodes, function(regionNode)
    {
        var regionJson = Grid.ImportExport.parseRegion(regionNode);
        hotspots.regions.push(regionJson);
    });

    // parse region group nodes into json
    var regionGroupNodes = xmlobject.getElementsByTagName("RegionGroup");

    Grid.ImportExport.eachNode(regionGroupNodes, function(regionGroupNode)
    {
        var groupJson = Grid.ImportExport.parseRegionGroup(regionGroupNode);
        hotspots.groups.push(groupJson);
    });

    // import regions
    Grid.ImportExport.eachNode(hotspots.regions, function(regionJson)
    {
        // create region (e.x., name="rect_1" shape="rect" coords="100, 50, 150, 80")
        var region = model.createRegion(regionJson.name, regionJson.shape, regionJson.coords);
        if (region == null) return; // this can happen when shape is unknown

        // iterate through events for this region
        Grid.ImportExport.eachNode(regionJson.events, function(eventJson)
        {
            // create region event
            var event = region.createEvent(eventJson.name);
            event.setStyles(eventJson.styles);

            // create region label
            if (eventJson.label != null)
            {
                event.setLabel(eventJson.label.x, eventJson.label.y, eventJson.label.text);
            }

            // create region image
            if (eventJson.image != null)
            {
                var url = Grid.ImportExport.resolveUrl(eventJson.image.src);
                var htmlImage = imageLoader.getImage(url);

                if (htmlImage != null)
                {
                    event.setImage(url, eventJson.image.x, eventJson.image.y, htmlImage.width, htmlImage.height);
                }
            }
        });

        // this will set default region style
        region.update();
    });

    // import groups
    Grid.ImportExport.eachNode(hotspots.groups, function(groupJson)
    {
        var regionGroup = model.createRegionGroup(groupJson.name, groupJson.min, groupJson.max);

        // iterate through region includes
        for (var i = 0; i < groupJson.includes.length; i++)
        {
            var region = model.getRegion(groupJson.includes[i]);
            if (region != null) regionGroup.addRegion(region);
        }
    });
};

// get the region responses json (inside <RegionGroupObject>)
Grid.ImportExport.parseRegionGroupObjects = function(xmlobject)
{
    var regionObjects = [];
    var regionObjNodes = xmlobject.getElementsByTagName("RegionObject");

    Grid.ImportExport.eachNode(regionObjNodes, function(regionObjNode)
    {
        var regionObject =
        {
            name: regionObjNode.getAttribute('name'),
            selected: (regionObjNode.getAttribute('isselected') == 'true')
        };

        regionObjects.push(regionObject);
    });

    return regionObjects;
};

// loads the region answer response into the model
Grid.ImportExport.loadRegionGroupObjects = function(xmlobject, model)
{
    var regionObjects = Grid.ImportExport.parseRegionGroupObjects(xmlobject);

    for (var i = 0; i < regionObjects.length; i++)
    {
        var regionObject = regionObjects[i];
        var region = model.getRegion(regionObject.name);

        // check for region (if it is missing then it is not defined)
        if (region != null)
        {
            if (regionObject.selected) region.select();
            else region.deselect();
        }
    }
};

/************************************************************************************/

Grid.ImportExport.getRegionGroupsXmlString = function(model)
{
    var xmlDoc = Grid.ImportExport.getRegionGroupsXmlDoc(model);
    return Grid.ImportExport.serializeToString(xmlDoc);
};

Grid.ImportExport.getRegionGroupsXmlDoc = function(model)
{
    var xmlDoc = Grid.ImportExport.parseFromString('<HotSpots></HotSpots>');

    // append <Event> to parent node
    var appendEvent = function(event, parentNode)
    {
        var eventNode = xmlDoc.createElement('Event');
        eventNode.setAttribute('name', event.name);

        // create <Styles>
        var styles = event.getStyles();
        var stylesNode = xmlDoc.createElement('Styles');

        for (var styleName in styles)
        {
            var styleValue = styles[styleName];
            stylesNode.setAttribute(styleName, styleValue);
        }

        eventNode.appendChild(stylesNode);

        // create <Image>
        var image = event.getImage();

        if (image != null)
        {
            var imageNode = xmlDoc.createElement('Image');
            imageNode.setAttribute('src', image.url);
            imageNode.setAttribute('x', image.x);
            imageNode.setAttribute('y', image.y);
            eventNode.appendChild(imageNode);
        }

        // create <Label>
        var label = event.getLabel();

        if (label != null)
        {
            var labelNode = xmlDoc.createElement('Label');
            labelNode.setAttribute('text', label.text);
            labelNode.setAttribute('x', label.x);
            labelNode.setAttribute('y', label.y);
            eventNode.appendChild(labelNode);
        }
        
        parentNode.appendChild(eventNode);
    };

    // append <Region> to parent node
    var appendRegion = function(region, parentNode)
    {
        var regionNode = xmlDoc.createElement('Region');
        var shapeName = region.getType();
        var shapeCoords = region.getCoords();

        regionNode.setAttribute('name', region.name);
        regionNode.setAttribute('shape', shapeName);
        regionNode.setAttribute('coords', shapeCoords);

        var events = region.getEvents();

        for (var i = 0; i < events.length; i++)
        {
            appendEvent(events[i], regionNode);
        }

        parentNode.appendChild(regionNode);
    };

    // append <RegionGroup> to parent node
    var appendRegionGroup = function(regionGroup, parentNode)
    {
        var regionGroupNode = xmlDoc.createElement('RegionGroup');
        regionGroupNode.setAttribute('name', regionGroup.name);
        regionGroupNode.setAttribute('min', regionGroup.min);
        regionGroupNode.setAttribute('max', regionGroup.max);

        var regions = regionGroup.getRegions();

        // add region includes
        for (var i = 0; i < regions.length; i++)
        {
            var region = regions[i];
            var includeNode = xmlDoc.createElement('Include');
            includeNode.setAttribute('region', region.name);
            regionGroupNode.appendChild(includeNode);
        }
        
        parentNode.appendChild(regionGroupNode);
    };

    // create <Regions>
    var regions = model.getRegions();
    var regionsNode = xmlDoc.createElement('Regions');
    xmlDoc.documentElement.appendChild(regionsNode);

    for (var i = 0; i < regions.length; i++)
    {
        appendRegion(regions[i], regionsNode);
    }

    // create <RegionGroups>
    var regionGroups = model.getRegionGroups();
    var regionGroupsNode = xmlDoc.createElement('RegionGroups');
    xmlDoc.documentElement.appendChild(regionGroupsNode);

    for (var i = 0; i < regionGroups.length; i++)
    {
        appendRegionGroup(regionGroups[i], regionGroupsNode);
    }

    return xmlDoc;
};
