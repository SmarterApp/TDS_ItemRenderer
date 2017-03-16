//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Contains the region functions and ability to create instance of a region class.
NOTE: Region classes inherit from entity classes.
*/

// create region class based on one of our existing entities
Grid.Model.buildRegion = function(entityClass, regionName)
{
    // create a class that will represent a region
    var regionClass = function()
    {
        // call entity constructor
        var args = Array.prototype.slice.call(arguments, 0);
        regionClass.superclass.constructor.apply(this, args);

        // set region variables
        this.name = regionName;
        this._currentEvent = null;
        this._events = {};
    };

    // the region class will inherit from the entity class and contain 
    // extra functionality in the static Grid.Model.Region namespace
    Lang.extend(regionClass, entityClass, Grid.Model.Region);

    // override base isSelectable()
    regionClass.prototype.isSelectable = function()
    {
        // if what is being selected is already selected then allow this since it will get deselected
        if (this.isSelected()) return true;

        // get all the groups for this region
        var regionGroups = this.getGroups();

        for (var i = 0; i < regionGroups.length; i++)
        {
            var regionGroup = regionGroups[i];
            if (regionGroup.isMaxMet()) return false;
        }
        
        // call base isSelectable rules
        return regionClass.superclass.isSelectable.call(this);
    };

    // override base select()
    regionClass.prototype.select = function()
    {
        // before trying to dselect any conflicts make we aren't just trying to deselect currently selected region
        if (!this.isSelected()) this.deselectConflicts();

        // call base select to occur
        return regionClass.superclass.select.call(this);
    };

    // return new region class ready to be instantiated with the normal entity parameters
    return regionClass;
};

// contains functions that will be associated to an instance of a region
Grid.Model.Region = {};

// get all the groups this region is referenced by
Grid.Model.Region.getGroups = function()
{
    var refGroups = [];

    // get all region groups
    var regionGroups = this.model.getRegionGroups();

    for (var i = 0; i < regionGroups.length; i++)
    {
        var regionGroup = regionGroups[i];

        if (regionGroup.containsRegion(this))
        {
            refGroups.push(regionGroup);
        }
    }

    return refGroups;
};

// is this region associated to any groups?
Grid.Model.Region.isOrphan = function() 
{
    return (this.getGroups().length == 0);
};

// call this function to deselect any conflicting regions that we are allowed to
Grid.Model.Region.deselectConflicts = function()
{
    // get all the referenced groups for this region
    var refGroups = this.getGroups();
    var deselectRegions = [];

    // iterate over each group referenced by this region
    for (var i = 0; i < refGroups.length; i++)
    {
        var refGroup = refGroups[i];

        // get all the selected regions for ref group
        var selectedRegions = refGroup.getSelectedRegions();

        // make sure this group has something selected before checking rules
        if (selectedRegions.length > 0)
        {
            // if the ref group has max of one then we can just deselect the conflicting region
            if (refGroup.max == 1) deselectRegions.push(selectedRegions[0]);
            // if the max is met then we can't do anything so stop here 
            else if (refGroup.isMaxMet()) return false;
        }
    }
    
    // deselect any regions that we are allowed to
    for (var i = 0; i < deselectRegions.length; i++)
    {
        deselectRegions[i].deselect();
    }

    return true;
};

Grid.Model.Region.getEvent = function(name) { return this._events[name]; };

Grid.Model.Region.hasEvent = function(name) { return (this.getEvent(name) != null); };

Grid.Model.Region.createEvent = function(name)
{
    // create event
    this._events[name] = new Grid.Model.RegionEvent(this, name);
    return this.getEvent(name);
};

Grid.Model.Region.deleteEvent = function(event)
{
    event.deleteImage();
    event.deleteLabel();

    if (this._currentEvent == event) this._currentEvent = null;
    delete(this._events[event.name]);
};

// get the current event for this region
Grid.Model.Region.getCurrentEvent = function() { return this._currentEvent; };

// call this to set what the current event should be for this region
Grid.Model.Region.setCurrentEvent = function(name)
{
    // hide current event
    if (this._currentEvent != null)
    {
        var entities = this._currentEvent.getEntities();

        // hide all event entities
        for (var i = 0; i < entities.length; i++)
        {
            entities[i].hide();
        }

        this._currentEvent = null;
    }

    // set new current event
    this._currentEvent = this.getEvent(name);

    // show current event
    if (this._currentEvent != null)
    {
        var entities = this._currentEvent.getEntities();

        // show all event entities
        for (var i = 0; i < entities.length; i++)
        {
            entities[i].show();
        }

        return true;
    }

    return false;
};

// get a list of all the events for this region
Grid.Model.Region.getEvents = function()
{
    var eventList = [];

    for (var evt in this._events)
    {
        eventList.push(this._events[evt]);
    }

    return eventList;
};

// get default style
Grid.Model.Region.getStyles = function()
{
    // get current region event
    var regionEvent = this.getCurrentEvent();

    if (regionEvent != null)
    {
        // get event styles
        return regionEvent.getStyles();
    }
    else
    {
        // get empty styles
        return Grid.Model.getEmptyStyles();
    }
};

/******************************************************************************************/
/* REGION VIEW */

// used for rendering the region styles
Grid.Model.Region.updateElement = function(view)
{
    // set region event
    if (this.isSelected() && this.isFocused() && this.hasEvent('hoverselect'))
    {
        this.setCurrentEvent('hoverselect');
    }
    else if (this.isSelected() && this.hasEvent('select'))
    {
        this.setCurrentEvent('select');
    }
    else if (this.isFocused() && this.hasEvent('hover'))
    {
        this.setCurrentEvent('hover');
    }
    else if (this.hasEvent('unselect'))
    {
        this.setCurrentEvent('unselect');
    }
    else
    {
        this.setCurrentEvent(null);
    }

    // call parent shape (NOTE: in the parent shape do not use 'this' for superclass)
    this.constructor.superclass.updateElement.call(this, view);
};