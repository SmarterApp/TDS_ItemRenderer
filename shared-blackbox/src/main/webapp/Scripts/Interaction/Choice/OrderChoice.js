/*
Sortable lists interaction block.
*/

(function(TDS) {

    var OI = TDS.OrderInteraction;
    var Orientation = OI.Orientation;
    var CSS = OI.CSS;

    // order choice
    function OC(parentGroup, responseIdentifier, element) {
        this._parentGroup = parentGroup;
        this._parentInteraction = parentGroup.getParentInteraction();
        this._proxy = null;
        this._dragging = false;
        this._dragBack = false; // false means moving up or left, true means moving down or right
        this._lastX = 0; // used for horizontal
        this._lastY = 0; // used for vertical
        this._preventDrag = false;
        OC.superclass.constructor.call(this, responseIdentifier, element);
    };

    YAHOO.extend(OC, TDS.Choice);

    OC.prototype.getGroup = function() {
        return this._parentGroup;
    };

    OC.prototype.getParentInteraction = function () {
        return this._parentInteraction;
    };

    // get the YUI DD proxy object
    OC.prototype.getProxy = function() {
        return this._proxy;
    };

    // are we moving this choice right now?
    OC.prototype.isDragging = function () {
        return this._dragging;
    };

    OC.prototype.init = function() {

        var element = this.getElement();
        var elementWin = element.ownerDocument.defaultView;

        // create YUI proxy
        var proxy = new elementWin.YAHOO.util.DDProxy(element);
        //proxy.__ygDragDrop = false;
        this._proxy = proxy;

        // only go up and down
        if (this._parentInteraction.getOrientation() == Orientation.Vertical) {
            proxy.setXConstraint(0, 0);
        } else {
            proxy.setYConstraint(0, 0);
        }

        // map proxy functions
        proxy.startDrag = this.onStartDrag.bind(this);
        proxy.onDrag = this.onDrag.bind(this);
        proxy.onDragOver = this.onDragOver.bind(this);
        proxy.onDragDrop = this.onDragDrop.bind(this);
        proxy.endDrag = this.onEndDrag.bind(this);
        proxy.b4MouseDown = this.onBeforeMouseDown.bind(this);
    };
    
    OC.prototype.refreshCache = function () {
        var element = this.getElement();
        var elementWin = element.ownerDocument.defaultView;
        elementWin.YAHOO.util.DragDropMgr.refreshCache();
    };

    //  http://yui.github.io/yui2/docs/yui_2.9.0_full/docs/DD.html: 
    //      b4MouseDownEvent
    //   b4MouseDownEvent ( )  
    //  Provides access to the mousedown event, before the mouseDownEvent gets fired. Returning false will cancel the drag. 
    OC.prototype.onBeforeMouseDown = function(ev) {
        if (this._preventDrag) {
            return false;
        }
    };
    
    OC.prototype.onStartDrag = function (x, y) {
        this._dragging = true;

        // bug 132516: if we are on multi-touch display user can initiate multiple 
        // drag events.  Prevent it.
        this._parentGroup.toggleLockDrag(this._identifier, true);
        
        // get DOM elements
        var $srcEl = $(this._proxy.getEl());
        var $proxyEl = $(this._proxy.getDragEl());

        // set classes
        $srcEl.addClass(CSS.ORDER_SOURCE);
        $proxyEl.addClass(CSS.ORDER_PROXY);

        // remove YUI styles
        $proxyEl.css('width', '');
        $proxyEl.css('height', '');
        $proxyEl.css('border', '');

        // set HTML in proxy
        $proxyEl.html($srcEl.html());

        // set cursor position to middle of proxy
        this._proxy.setDelta(0, ($proxyEl.height() / 2));
    };

    OC.prototype.onDrag = function(ev) {
        // check if going up down
        if (this._parentInteraction.getOrientation() == Orientation.Horizontal) {
            var x = YUE.getPageX(ev);
            if (x < this._lastX) {
                this._dragBack = true;
            } else if (x > this._lastX) {
                this._dragBack = false;
            }
            this._lastX = x;
        } else {
            var y = YUE.getPageY(ev);
            if (y < this._lastY) {
                this._dragBack = true;
            } else if (y > this._lastY) {
                this._dragBack = false;
            }
            this._lastY = y;
        }

    };

    OC.prototype.onDragOver = function (ev, id) {

        var $src = $(this.getElement());
        var $dest = $(YUD.get(id)); // other <li>

        // make sure same parent
        if (!$src.parent().is($dest.parent())) return;

        // check if choice element
        if (this._dragBack) {
            $src.insertBefore($dest);
        } else {
            $src.insertAfter($dest);
        }

        this.refreshCache();

    };

    OC.prototype.onDragDrop = function(ev, id) {
    };

    OC.prototype.onEndDrag = function() {
        this._dragging = false;
        this._parentGroup.toggleLockDrag(this._identifier, false);

        // get DOM elements
        var $srcEl = $(this._proxy.getEl());
        var $proxyEl = $(this._proxy.getDragEl());

        // set classes
        $srcEl.removeClass(CSS.ORDER_SOURCE);
        $proxyEl.removeClass(CSS.ORDER_PROXY);
    };
    
    OC.prototype.dispose = function() {
        this._parentGroup = null;
        this._parentInteraction = null;
        this._proxy = null;
    };

    TDS.OrderChoice = OC;

})(TDS);