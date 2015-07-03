//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
A drag group contains all the draggables moved into the group. 
*/

TDS.DragGroup = function(parentInteraction, responseIdentifier, element)
{
    this._parentInteraction = parentInteraction;
    // this._children = []; // a collection of DragDrop objects
    this._droppable = false;
    TDS.DragGroup.superclass.constructor.call(this, responseIdentifier, element);
};

YAHOO.extend(TDS.DragGroup, TDS.Choice);

/*
// add DragDrop object
TDS.DragGroup.prototype.add = function(child) {
    var childEl = child.getElement();
    YUD.setAttribute(childEl, 'data-its-group', this.getIdentifier());
    this._children.push(child);
};

// remove DragDrop object
TDS.DragGroup.prototype.remove = function(child) {
    var childEl = child.getElement();
    YUD.setAttribute(childEl, 'data-its-group', '');
    Util.Array.remove(this._children, child);
};
*/

// Get all the DragDrop objects in this group.
// NOTE: We do this by using the current DOM.
TDS.DragGroup.prototype.getChildren = function()
{
    var groupDraggables = [];
    var draggables = this._parentInteraction.getDraggables();

    for (var i = 0; i < draggables.length; i++)
    {
        var draggable = draggables[i];

        if (draggable.getGroup() == this)
        {
            groupDraggables.push(draggable);
        }
    }

    return groupDraggables;
};

// manually set this group as droppable
TDS.DragGroup.prototype.setDroppable = function(droppable) {
    this._droppable = droppable;
};

// can you drop things on this group directly
TDS.DragGroup.prototype.isDroppable = function() {
    
    // check if manually set to droppable
    if (this._droppable) return true;

    // check if group has any draggables
    var draggables = this.getChildren();
    return (draggables.length == 0);

    // make sure group has some kind of width/height
    /*
    var groupEl = this.getElement();
    return (groupEl.offsetWidth > 0 || groupEl.offsetHeight > 0);
    */
};

TDS.DragGroup.prototype.init = function()
{
    var element = this.getElement();
    
    // check enter
    YUE.on(element, 'mouseenter', this.onEnter, this, true);
    YUE.on(element, 'mouseleave', this.onLeave, this, true);
};

// this gets fired when the mouse enters the group element
TDS.DragGroup.prototype.onEnter = function(ev)
{
    var dragSource = this._parentInteraction.getSource();

    // check if drag drop has started and the source is not where we started
    if (dragSource && dragSource != this && this.isDroppable())
    {
        // set this draggable as the target
        this._parentInteraction.setTarget(this);
    }
};

// this gets fired when the mouse leaves the group element
TDS.DragGroup.prototype.onLeave = function(ev)
{
    var dragSource = this._parentInteraction.getSource();

    if (dragSource)
    {
        // ignore leaving to enter the proxy element that we are dragging
        var dragProxy = dragSource.getProxy();
        if (dragProxy && ev.relatedTarget === dragProxy.getDragEl()) return;

        // clear target
        this._parentInteraction.clearTarget();
    }
};