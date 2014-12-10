/*
The drag drop (or draggable) is a specific instance of some draggable text.
*/

TDS.DragDrop = function(parentInteraction, responseIdentifier, element)
{
    this._parentInteraction = parentInteraction;

    this._group = null;
    this._proxy = null;

    TDS.DragDrop.superclass.constructor.call(this, responseIdentifier, element);
};

YAHOO.extend(TDS.DragDrop, TDS.Choice);

// returns the internal YUI proxy object.
TDS.DragDrop.prototype.getProxy = function() { return this._proxy; };

TDS.DragDrop.prototype.getGroup = function() { return this._group; };

// Set the current DragDrop group.
TDS.DragDrop.prototype.setGroup = function(group) {

    // update the elements group attribute
    var dragEl = this.getElement();
    dragEl.setAttribute('data-its-group', group.getIdentifier());
    
    // set current DragGroup
    this._group = group;
};

TDS.DragDrop.prototype.init = function()
{
    // create YUI proxy
    var element = this.getElement();
    var elementWin = this.getWin();
    var proxy = new elementWin.YAHOO.util.DDProxy(element);
    this._proxy = proxy;

    // map proxy functions
    proxy.startDrag = Util.bind(this.onStartDrag, this);
    proxy.onDrag = Util.bind(this.onDrag, this);
    // proxy.onDragDrop = Util.bind(this.onDragDrop, this);
    proxy.endDrag = Util.bind(this.onEndDrag, this);

    // check enter
    // YUE.on(element, MouseEvents.enter, this.onEnter, this, true);
    // YUE.on(element, MouseEvents.leave, this.onLeave, this, true);
};

TDS.DragDrop.prototype.onStartDrag = function(x, y)
{
    // get DOM elements
    var srcEl = this._proxy.getEl();
    var proxyEl = this._proxy.getDragEl();

    // set classes
    YUD.addClass(proxyEl, TDS.DDInteraction.CSS.DRAG_PROXY);
    
    // remove YUI styles
    YUD.setStyle(proxyEl, 'width', '');
    YUD.setStyle(proxyEl, 'height', '');
    YUD.setStyle(proxyEl, 'border', '');

    // set HTML in proxy
    proxyEl.innerHTML = srcEl.innerHTML;

    // set cursor position to top-left of proxy
    this._proxy.setDelta(0, 0);
    
    // call parent to start drag
    this._parentInteraction.onStartDrag(this);
};

TDS.DragDrop.prototype.onDrag = function(ev)
{
    this._parentInteraction.onDrag(ev, this);
};

/*
// this gets fired when the mouse enters the element
TDS.DragDrop.prototype.onEnter = function(ev)
{
    var dragSource = this._parentInteraction.getSource();

    // check if drag drop has started and the source is not where we started
    if (dragSource && dragSource != this)
    {
        // set this draggable as the target
        this._parentInteraction.setTarget(this);
    }
};

// this gets fired when the mouse leaves the element
TDS.DragDrop.prototype.onLeave = function(ev)
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
*/

TDS.DragDrop.prototype.onDragDrop = function(ev, id)
{
};

TDS.DragDrop.prototype.onEndDrag = function(ev)
{
    // get DOM elements
    var srcEl = this._proxy.getEl();
    var proxyEl = this._proxy.getDragEl();

    // set classes
    YUD.removeClass(proxyEl, TDS.DDInteraction.CSS.DRAG_PROXY);

    // call parent to end drag
    this._parentInteraction.onEndDrag(this);
};

// lock the draggable so you can no longer drag it
TDS.DragDrop.prototype.lock = function() {

    var dragEl = this.getElement();
    YUD.addClass(dragEl, TDS.DDInteraction.CSS.DRAG_LOCKED);

    var proxy = this.getProxy();
    proxy.lock();
};

// unlock the draggable do you can drag it around
TDS.DragDrop.prototype.unlock = function() {

    var dragEl = this.getElement();
    YUD.removeClass(dragEl, TDS.DDInteraction.CSS.DRAG_LOCKED);

    var proxy = this.getProxy();
    proxy.unlock();
};

