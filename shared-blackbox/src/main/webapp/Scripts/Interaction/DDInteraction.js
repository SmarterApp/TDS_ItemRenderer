//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Drag and drop interaction block.

Naming conventions:
http://www.terrainformatica.com/2008/02/built-in-drag-and-drop-support-in-h-smile-core/
http://www.terrainformatica.com/wiki/h-smile/drag-n-drop
http://lists.w3.org/Archives/Public/public-html/2008Feb/0271.html
http://www.renpy.org/doc/html/drag_drop.html
http://docs.sencha.com/ext-js/4-0/#!/api/Ext.grid.plugin.DragDrop

Accessibility:
http://www.w3.org/wiki/PF/ARIA/BestPractices/DragDrop
http://www.w3.org/TR/wai-aria/states_and_properties#attrs_dragdrop
http://www.w3.org/TR/2010/WD-wai-aria-practices-20100916/#dragdrop

Mobile:
https://gist.github.com/361295 (an old Google Closure patch to learn from)
*/

/*
TODO: 
- Add ability to drop something on the end of a draggable (to fix if it is the last thing in a group).
- Add some kind of line pointing to where we are going to drop text (instead of setmarker DOM element).
*/

/*
TODO: Drop targets list:

What I am thinking off is 2 attributes for each draggable: dropTargetsList, dropTargetsExcludeList

1. An empty dropTargetsList implies that all groups can be drop targets 
2. A non-empty dropTargetsList implies that only groups specified can serve as dropTargets 
3. An empty dropTargetsExcludeList implies that no group is explicitly forbidden from receiving this draggable 
4. An non-Empty dropTargetsExcludeList implies that groups specified cannot act as drop targets for this draggable

Add draggables to allowed targets.

*/

TDS.DDInteraction = function(responseIdentifier)
{
    this._groupLookup = new Util.Structs.Map(); // a lookup of group elements (TDS.DragGroup)
    this._dragLookup = new Util.Structs.Map(); // a lookup of draggable elements (TDS.DragDrop)

    this._dragSource = null; // current element we are dragging (TDS.DragDrop)
    this._dropTarget = null; // current element we are hoving over (TDS.DragDrop or TDS.DragGroup)

    this._defaultResponse = null;

    TDS.DDInteraction.superclass.constructor.call(this, responseIdentifier);
};

YAHOO.lang.extend(TDS.DDInteraction, TDS.Interaction);

TDS.DDInteraction.CSS = {
    INTERACTION: 'interaction',
    DRAGGABLE: 'draggable', // this identifies a draggable
    DRAG_GROUP: 'drag-group', // this identifies a drag group
    DROP_TARGET: 'drop-target', // this gets set on a draggable/group when you start dragging
    DROP_TARGET_COLLAPSED: 'drop-target-collapsed', // when you start dragging this gets set on a group if it has no width/height
    DRAG_SOURCE: 'drag-source', // when you start dragging this gets set on the source of the drag
    DRAG_OVER: 'drag-over', // this gets set on drop target when you hover it
    DRAG_PROXY: 'drag-proxy', // this get set on the proxy element
    DRAG_PROXY_OVER: 'drag-proxy-over', // this gets set on the proxy element when you hover over a drop target
    DROP_MARKER: 'drop-marker', // this gets set on the element that is used to identify where a drag will get placed
    DRAG_LOCKED: 'drag-locked' // this gets set when a draggable can't be dragged
};

TDS.DDInteraction.prototype.getGroups = function()
{
    return this._groupLookup.getValues();
};

TDS.DDInteraction.prototype.getGroup = function(responseIdentifier)
{
    return this._groupLookup.get(responseIdentifier);
};

TDS.DDInteraction.prototype.addGroup = function(group)
{
    var responseIdentifier = group.getIdentifier();
    this._groupLookup.set(responseIdentifier, group);
};

TDS.DDInteraction.prototype.getDraggables = function()
{
    return this._dragLookup.getValues();
};

// lookup a draggable object based on elements data-its-identifier attribute
TDS.DDInteraction.prototype.getDraggable = function(responseIdentifier)
{
    return this._dragLookup.get(responseIdentifier);
};

TDS.DDInteraction.prototype.addDraggable = function(draggable)
{
    var responseIdentifier = draggable.getIdentifier();
    this._dragLookup.set(responseIdentifier, draggable);
};

// Remove this draggable from the interaction.
/*
TDS.DDInteraction.prototype.removeDraggable = function(draggable, inDom)
{
    // remove element from mapping
    var responseIdentifier = draggable.getIdentifier();
    this._dragLookup.remove(responseIdentifier);
    
    // check if we should remove from DOM
    if (inDom) {
        var dragEl = draggable.getElement();
        Util.Dom.removeNode(dragEl);
    }
};
*/

// when dragging is active get the current source
TDS.DDInteraction.prototype.getSource = function() { return this._dragSource; };

// check if dragging is active
TDS.DDInteraction.prototype.hasSource = function() { return (this._dragSource != null); };

// when dragging begins set the draggable that is being moved
TDS.DDInteraction.prototype.setSource = function(draggable)
{
    // if the draggable is already set then nothing left to do
    if (this._dragSource == draggable) return;

    this.clearSource();

    // check if choice object
    if (!(draggable instanceof TDS.Choice)) return;

    // set styles
    var dragEl = draggable.getElement();
    YUD.addClass(dragEl, TDS.DDInteraction.CSS.DRAG_SOURCE);

    this._dragSource = draggable;
};

TDS.DDInteraction.prototype.clearSource = function()
{
    // if there is no draggable already set then nothing left to do
    if (this._dragSource == null) return;

    // remove style
    var dropEl = this._dragSource.getElement();
    YUD.removeClass(dropEl, TDS.DDInteraction.CSS.DRAG_SOURCE);
    
    // delete source
    this._dragSource = null;
};

// get the current target of our current draging operation
TDS.DDInteraction.prototype.getTarget = function() { return this._dropTarget; };

// check if there is a target for current dragging operation
TDS.DDInteraction.prototype.hasTarget = function() { return (this._dropTarget != null); };

// when a draggable moves over a droppable then
TDS.DDInteraction.prototype.setTarget = function(droppable)
{
    // clear existing hover
    this.clearTarget();

    // check if choice object
    if (!(droppable instanceof TDS.Choice)) return;

    // set drop target style
    var dropEl = droppable.getElement();
    YUD.addClass(dropEl, TDS.DDInteraction.CSS.DRAG_OVER);

    // set proxy to show as being over a drop target
    var dragSource = this.getSource();
    if (dragSource) {
        var proxy = dragSource.getProxy();
        var proxyEl = proxy.getDragEl();
        YUD.addClass(proxyEl, TDS.DDInteraction.CSS.DRAG_PROXY_OVER);
    }

    // add marker
    this.addMarker(droppable);

    // set hover
    this._dropTarget = droppable;
};

TDS.DDInteraction.prototype.clearTarget = function()
{
    // check if any hover
    if (this._dropTarget == null) return;

    // clear styles:
    var dropEl = this._dropTarget.getElement();
    YUD.removeClass(dropEl, TDS.DDInteraction.CSS.DRAG_OVER);

    var dragSource = this.getSource();
    if (dragSource) {
        var proxy = dragSource.getProxy();
        var proxyEl = proxy.getDragEl();
        YUD.removeClass(proxyEl, TDS.DDInteraction.CSS.DRAG_PROXY_OVER);
    }
    
    // remove marker
    this.removeMarker(this._dropTarget);

    // remove hover
    this._dropTarget = null;
};

// add a drop marker so you can tell where you are going to drag element
TDS.DDInteraction.prototype.addMarker = function(draggable)
{
    if (draggable == null) return;

    // add marker
    if (draggable instanceof TDS.DragDrop)
    {
        var dropEl = draggable.getElement();
        var dropDoc = Util.Dom.getOwnerDocument(dropEl);
        var markerId = YUD.getAttribute(dropEl, 'id');
        var markerEl = dropDoc.createElement('span');
        YUD.setAttribute(markerEl, 'id', markerId + '-marker');
        YUD.addClass(markerEl, TDS.DDInteraction.CSS.DROP_MARKER);
        YUD.insertBefore(markerEl, dropEl);
    }
};

TDS.DDInteraction.prototype.removeMarker = function(draggable)
{
    if (draggable == null) return;

    // remove marker
    if (draggable instanceof TDS.DragDrop)
    {
        var dropEl = draggable.getElement();
        var dropDoc = Util.Dom.getOwnerDocument(dropEl);
        var markerId = YUD.getAttribute(dropEl, 'id');
        var markerEl = dropDoc.getElementById(markerId + '-marker');
        if (markerEl != null) Util.Dom.removeNode(markerEl);
    }
};

// gets called when dragging starts
TDS.DDInteraction.prototype.onStartDrag = function(dragSource)
{
    this.setSource(dragSource);

    // find draggable drop targets
    var draggables = this.getDraggables();

    for (var i = 0; i < draggables.length; i++)
    {
        var droppable = draggables[i];
        if (droppable == dragSource) continue;

        var dropElement = droppable.getElement();
        YUD.addClass(dropElement, TDS.DDInteraction.CSS.DROP_TARGET);
    }

    // find group drop targets
    var groups = this.getGroups();

    for (var i = 0; i < groups.length; i++)
    {
        var group = groups[i];

        if (group.isDroppable())
        {
            var groupEl = group.getElement();

            /*if (YUD.getStyle(groupEl, 'display') == 'inline')
            {
            groupEl.innerHTML = "&nbsp;";

                var groupHeight = YUD.getStyle(groupEl, 'line-height');
            YUD.setStyle(groupEl, 'height', groupHeight);
            }*/

            YUD.addClass(groupEl, TDS.DDInteraction.CSS.DROP_TARGET);
            
            // check if collapsed
            if (groupEl.offsetHeight == 0 || groupEl.offsetWidth == 0) {
                YUD.addClass(groupEl, TDS.DDInteraction.CSS.DROP_TARGET_COLLAPSED);
            }

        }
    }
};

// This gets called when you are dragging an element.
// NOTE: We should cache bounding boxes for performance.
TDS.DDInteraction.prototype.onDrag = function(ev, dragSource)
{
    // get drag info
    var srcEl = dragSource.getElement(); // original element that started drag
    
    // get all draggable elements and check if any of them fall within our current x/y
    var targetEl = TDS.DDInteraction.getElementInEvent(ev, this.getDraggables());
    
    // let's see if any groups fall within our current x/y
    if (targetEl == null) {
        targetEl = TDS.DDInteraction.getElementInEvent(ev, this.getGroups());                
    }

    // get proxy info
    var proxy = dragSource.getProxy();
    var proxyEl = proxy.getDragEl(); // proxy element we are showing as we move

    // ignore proxy
    if (targetEl == proxyEl) return;

    // check if we are already hovering over the target
    if (this._dropTarget && this._dropTarget.getElement() == targetEl) return;

    // clear current target
    this.clearTarget();

    // ignore hovering over the original source
    if (targetEl == null || targetEl == srcEl) return;

    // get the ident for target
    var targetIdent = TDS.Interaction.parseIdentifier(targetEl);
    
    if (targetIdent)
    {
        // check if draggable element
        if (YUD.hasClass(targetEl, TDS.DDInteraction.CSS.DRAGGABLE))
        {
            // get draggable and set as target if found
            var droppable = this.getDraggable(targetIdent);
            if (droppable) this.setTarget(droppable);
        }
        // check if group element
        else if (YUD.hasClass(targetEl, TDS.DDInteraction.CSS.DRAG_GROUP))
        {
            // get group and set as target if found and allows for dropping
            var group = this.getGroup(targetIdent);
            if (group && group.isDroppable()) this.setTarget(group);
        }
    }
};

// gets called when dragging ends
TDS.DDInteraction.prototype.onEndDrag = function(dragSource)
{
    // check if we were hovering over a droppable
    var dropTarget = this.getTarget();

    if (dropTarget != null)
    {
        this.onDrop(dragSource, dropTarget);
    }

    // clear target/sources
    this.clearTarget();
    this.clearSource();
    
    // find draggable drop targets
    var draggables = this.getDraggables();

    for (var i = 0; i < draggables.length; i++)
    {
        var droppable = draggables[i];
        if (droppable == dragSource) continue;

        var dropElement = droppable.getElement();
        YUD.removeClass(dropElement, TDS.DDInteraction.CSS.DROP_TARGET);
    }

    // find group drop targets
    var groups = this.getGroups();

    for (var i = 0; i < groups.length; i++)
    {
        var group = groups[i];
        var groupEl = group.getElement();
        YUD.removeClass(groupEl, TDS.DDInteraction.CSS.DROP_TARGET);
        YUD.removeClass(groupEl, TDS.DDInteraction.CSS.DROP_TARGET_COLLAPSED);
    }
};

// called when you drop a draggable on a droppable target
TDS.DDInteraction.prototype.onDrop = function(dragSource, dropTarget)
{
    // set source group
    if (dropTarget instanceof TDS.DragGroup)
    {
        dragSource.setGroup(dropTarget);
    }
    else if (dropTarget instanceof TDS.DragDrop)
    {
        dragSource.setGroup(dropTarget.getGroup());
    }

    // get DOM elements
    var srcEl = dragSource.getElement();
    var dropEl = dropTarget.getElement();

    // remove source from DOM
    Util.Dom.removeNode(srcEl);

    // add source in dropped location
    if (dropTarget instanceof TDS.DragGroup)
    {
        // add inside group
        dropEl.appendChild(srcEl);
    }
    else if (dropTarget instanceof TDS.DragDrop)
    {
        // add before draggable
        YUD.insertBefore(srcEl, dropEl);
    }
};

/************************************************************/

// it is a valid response if the draggables have changed at all
TDS.DDInteraction.prototype.validateResponse = function()
{
    return (this._defaultResponse != this.getResponse());
};

// get the response a json object
TDS.DDInteraction.prototype.getResponseJson = function()
{
    var groupsList = [];
    
    // get all the groups and sort them by DOM order
    var groups = this.getGroups();
    Util.Array.sort(groups, TDS.Interaction.compareOrder);

    Util.Array.each(groups, function(group)
    {
        // get all the draggables for this group and sort them by DOM order
        var draggables = group.getChildren();
        Util.Array.sort(draggables, TDS.Interaction.compareOrder);

        // create json group
        var jsonGroup =
        {
            responses: [],
            identifier: group.getIdentifier()
        };

        Util.Array.each(draggables, function(draggable)
        {
            // create json response
            jsonGroup.responses.push(draggable.getIdentifier());
        });

        groupsList.push(jsonGroup);
    });

    return groupsList;
};

// get the response as a xml document
TDS.DDInteraction.prototype.getResponseXml = function()
{
    var responseXml = Util.Xml.createDocument('interaction');
    var interactionEl = responseXml.documentElement;
    interactionEl.setAttribute('identifier', this.getResponseIdentifier());
    interactionEl.setAttribute('type', 'draggable');

    var groupsList = this.getResponseJson();

    Util.Array.each(groupsList, function(groupJson)
    {
        // <group>
        var groupNode = responseXml.createElement('group');
        groupNode.setAttribute('identifier', groupJson.identifier);
        interactionEl.appendChild(groupNode);

        Util.Array.each(groupJson.responses, function(response)
        {
            // <response>
            var responseNode = responseXml.createElement('response');
            responseNode.setAttribute('identifier', response);
            groupNode.appendChild(responseNode);
        });

    });

    return responseXml;
};

// get the response as a xml string
TDS.DDInteraction.prototype.getResponse = function () {
    var responseXml = this.getResponseXml();
    return Util.Xml.serializeToString(responseXml);
};

// load a xml response string
TDS.DDInteraction.prototype.loadResponseXml = function (xml)
{
    // get root node
    var interactionNode = TDS.Interaction.parseXmlRoot(xml);
    var dd = this;

    Util.Dom.queryTagsBatch('group', interactionNode, function (groupNode)
    {
        var groupIdentifier = groupNode.getAttribute('identifier');
        var group = dd.getGroup(groupIdentifier);

        Util.Dom.queryTagsBatch('response', groupNode, function (responseNode)
        {
            var responseIdentifier = responseNode.getAttribute('identifier');
            var draggable = dd.getDraggable(responseIdentifier);
            dd.onDrop(draggable, group);
        });
    });
};

/************************************************************/

// find all the draggables and groups from a element and its children
TDS.DDInteraction.prototype.load = function (parentEl, opts) {

    opts = opts || {};

    // create missing group elements
    opts.createGroups = opts.createGroups || true;

    // move orphaned draggables into group
    opts.moveDraggables = opts.moveDraggables || false;

    parentEl = YUD.get(parentEl);

    // get all the interactions
    var interactionElements = YUD.getElementsByClassName(TDS.DDInteraction.CSS.INTERACTION, null, parentEl);

    var dragElements = [];
    var groupElements = [];

    // sort out the elements
    YUD.batch(interactionElements, function(interactionEl)
    {
        if (YUD.hasClass(interactionEl, TDS.DDInteraction.CSS.DRAGGABLE))
        {
            dragElements.push(interactionEl);
        }
        else if (YUD.hasClass(interactionEl, TDS.DDInteraction.CSS.DRAG_GROUP))
        {
            groupElements.push(interactionEl);
        }
    });

    // process all the drag groups
    for (var i = 0; i < groupElements.length; i++)
    {
        var groupElement = groupElements[i];
        var groupIdent = TDS.Interaction.parseIdentifier(groupElement);
        var group = new TDS.DragGroup(this, groupIdent, groupElement);
        this.addGroup(group);
    }

    // process all the draggables
    for (var i = 0; i < dragElements.length; i++)
    {
        var dragEl = dragElements[i];
        var responseIdent = TDS.Interaction.parseIdentifier(dragEl);
        var draggable = new TDS.DragDrop(this, responseIdent, dragEl);
        this.addDraggable(draggable);

        var groups = this.getGroups();

        for (var j = 0; j < groups.length; j++)
        {
            var group = groups[j];
            var groupEl = group.getElement();

            if (dragEl.parentNode == groupEl)
            {
                draggable.setGroup(group);
                break;
            }
        }
    }

    // fix missing groups
    if (opts.createGroups) {
        this._createGroupContainers(opts);
    }
    
    // save original response
    this._defaultResponse = this.getResponse();
};

// Takes all the loaded draggables and creates group elements if they don't exist.
// NOTE: This is a hack because ITS doesn't create group elements.
TDS.DDInteraction.prototype._createGroupContainers = function (opts)
{
    var getGroupIdent = function(el) { return YUD.getAttribute(el, 'data-its-group'); };

    // get all the draggables
    var draggables = this.getDraggables();

    var groupMapping = {};

    // create a mapping of all the groups and matching draggables
    for (var i = 0; i < draggables.length; i++)
    {
        var draggable = draggables[i];

        // ignore draggables that already have a group
        if (draggable.getGroup()) continue;

        // get group identifier
        var dragEl = draggable.getElement();
        var groupIdent = getGroupIdent(dragEl);
        if (groupIdent == null) continue;

        // add draggable to mapping
        var groupDraggables = groupMapping[groupIdent];
        
        // if there is no current mapping then create one
        if (!groupDraggables)
        {
            groupDraggables = [];
            groupMapping[groupIdent] = groupDraggables;
        }

        groupDraggables.push(draggable);
    }

    // iterate over the group mappings
    for (var groupIdent in groupMapping)
    {
        var groupDraggables = groupMapping[groupIdent];
        
        // get the first draggable in the group which will be our anchor
        var dragStartEl = groupDraggables[0].getElement();

        // get the parent node of the first draggable as a potential parent group
        var groupEl = dragStartEl.parentNode;
        var groupChildren = YUD.getChildren(groupEl);

        // check if the parent node can be used as the group
        var groupUsingParent = Util.Array.every(groupChildren, function(child)
        {
            // check if same group identifier
            return (groupIdent == getGroupIdent(child));
        });

        // if we can't group using parent then create fake group
        if (!groupUsingParent)
        {
            // create fake group element
            var dragDoc = Util.Dom.getOwnerDocument(dragStartEl);
            groupEl = dragDoc.createElement('span');

            // add fake group element before the first draggable
            YUD.insertBefore(groupEl, dragStartEl);
        }

        // add attributes
        groupEl.setAttribute('data-its-identifier', groupIdent);
        groupEl.className = TDS.DDInteraction.CSS.INTERACTION + ' ' + TDS.DDInteraction.CSS.DRAG_GROUP;

        // create group object
        var group = new TDS.DragGroup(this, groupIdent, groupEl);
        this.addGroup(group);

        // move draggables into new group
        for (var i = 0; i < groupDraggables.length; i++)
        {
            var groupDraggable = groupDraggables[i];
            var dragEl = groupDraggable.getElement();

            // If we aren't grouping by parent then we need to 
            // move draggable element into the new group element.
            // NOTE: Not sure why we need 'groupUsingParent' here
            // so added ability to force this using 'moveDraggables'.
            if (opts.moveDraggables || !groupUsingParent) {
                console.log('DDI: Moving draggable into group: ', dragEl, group.getElement());
                Util.Dom.removeNode(dragEl);
                group.getElement().appendChild(dragEl);
            }

            groupDraggable.setGroup(group);
        }

    }

    // check if any of the draggables are just placeholders
    for (var i = 0; i < draggables.length; i++) {

        var draggable = draggables[i];
        var dragEl = draggable.getElement();
        var dragText = Util.Dom.getTextContent(dragEl);
        dragText = YAHOO.lang.trim(dragText);

        // check if this text is marked as immovable
        if (Util.String.startsWith(dragText, '#') && 
            Util.String.endsWith(dragText, '#')) {
            
            // remove pound signs
            dragText = dragText.substr(1);
            dragText = dragText.substring(0, dragText.length - 1);
            Util.Dom.setTextContent(dragEl, dragText);

            // set this draggables group as being drop target
            var dragGroup = draggable.getGroup();
            dragGroup.setDroppable(true);

            // lock draggable so it can no longer be moved
            draggable.lock();
        }
        
    }

};

/**************************************************************************/

// returns the first element that is located in the region
TDS.DDInteraction.getElementInRegion = function(region, choices)
{
    for(var i = 0, ii = choices.length; i < ii; i++)
    {
        var choice = choices[i];
        var regions = choice.getRegions();

        for (var j = 0, jj = regions.length; j < jj; j++)
        {
            if (regions[j].contains(region)) return choice.getElement();
        }
    }

    return null;
};

// returns the first element that is located in DOM event x/y coordinates
TDS.DDInteraction.getElementInEvent = function(evt, choices)
{
    var point = new YAHOO.util.Point(evt.clientX, evt.clientY);
    return TDS.DDInteraction.getElementInRegion(point, choices);
};

// draws an HTML line
TDS.DDInteraction.drawLine = function(x1, y1, x2, y2) {

    if (y1 < y2) {
        var pom = y1;
        y1 = y2;
        y2 = pom;
        pom = x1;
        x1 = x2;
        x2 = pom;
    }

    var a = Math.abs(x1 - x2);
    var b = Math.abs(y1 - y2);
    var c;
    var sx = (x1 + x2) / 2;
    var sy = (y1 + y2) / 2;
    var width = Math.sqrt(a * a + b * b);
    var x = sx - width / 2;
    var y = sy;

    a = width / 2;
    b = Math.sqrt(Math.abs(x1 - x) * Math.abs(x1 - x) + Math.abs(y1 - y) * Math.abs(y1 - y));
    c = Math.abs(sx-x);

    var cosb = (b * b - a * a - c * c) / (2 * a * c);
    var rad = Math.acos(cosb);
    var deg = (rad * 180) / Math.PI;

    var htmlns = 'http://www.w3.org/1999/xhtml';
    var div = document.createElementNS(htmlns, 'div');
    div.setAttribute('style', 'border:1px solid red;width:' + width + 'px;height:0px;-moz-transform:rotate(' + deg + 'deg);-webkit-transform:rotate(' + deg + 'deg);position:absolute;top:' + y + 'px;left:' + x + 'px;');

    document.body.appendChild(div);
}