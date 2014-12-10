var Util = window.Util || {};
Util.Structs = Util.Structs || {};

Util.Structs.TreeNode = (function() {

    /**
     * Generic tree node data structure with arbitrary number of child nodes.
     * It is possible to create a dynamic tree structure by overriding
     * {@link #getParent} and {@link #getChildren} in a subclass. All other getters
     * will automatically work.
     *
     * @param {*} key Key.
     * @param {*} value Value.
     * @constructor
     * @extends {Util.Structs.Node}
     */
    var TreeNode = function(key, value) {
        this._key = key;
        this._value = value;
    };

    /**
     * Gets the key.
     * @return {*} The key.
     */
    TreeNode.prototype.getKey = function() {
        return this._key;
    };

    /**
     * Gets the value.
     * @return {*} The value.
     */
    TreeNode.prototype.getValue = function() {
        return this._value;
    };

    /**
     * Constant for empty array to avoid unnecessary allocations.
     * @private
     */
    TreeNode._EMPTY_ARRAY = [];

    /**
     * Reference to the parent node or null if it has no parent.
     * @type {TreeNode}
     * @private
     */
    TreeNode.prototype._parent = null;


    /**
     * Child nodes or null in case of leaf node.
     * @type {Array.<!TreeNode>}
     * @private
     */
    TreeNode.prototype._children = null;


    /**
     * @return {!TreeNode} Clone of the tree node without its parent
     *     and child nodes. The key and the value are copied by reference.
     */
    TreeNode.prototype.clone = function() {
        return new TreeNode(this.getKey(), this.getValue());
    };


    /**
     * @return {!TreeNode} Clone of the subtree with this node as root.
     */
    TreeNode.prototype.deepClone = function() {
        var clone = this.clone();
        this.forEachChild(function(child) {
            clone.addChild(child.deepClone());
        });
        return clone;
    };

    /**
     * @return {TreeNode} Parent node or null if it has no parent.
     */
    TreeNode.prototype.getParent = function() {
        return this._parent;
    };

    /**
     * @return {boolean} Whether the node is a leaf node.
     */
    TreeNode.prototype.isLeaf = function() {
        return !this.getChildCount();
    };

    /**
     * Tells if the node is the last child of its parent. This method helps how to
     * connect the tree nodes with lines: L shapes should be used before the last
     * children and |- shapes before the rest. Schematic tree visualization:
     *
     * <pre>
     * Node1
     * |-Node2
     * | L-Node3
     * |   |-Node4
     * |   L-Node5
     * L-Node6
     * </pre>
     *
     * @return {boolean} Whether the node has parent and is the last child of it.
     */
    TreeNode.prototype.isLastChild = function() {
        var parent = this.getParent();
        return Boolean(parent && this == Util.Array.peek(parent.getChildren()));
    };

    /**
     * @return {!Array.<!TreeNode>} Immutable child nodes.
     */
    TreeNode.prototype.getChildren = function() {
        return this._children || TreeNode._EMPTY_ARRAY;
    };


    /**
     * Gets the child node of this node at the given index.
     * @param {number} index Child index.
     * @return {TreeNode} The node at the given index or null if not
     *     found.
     */
    TreeNode.prototype.getChildAt = function(index) {
        return this.getChildren()[index] || null;
    };

    /**
     * @return {number} The number of children.
     */
    TreeNode.prototype.getChildCount = function() {
        return this.getChildren().length;
    };

    /**
     * @return {number} The number of ancestors of the node.
     */
    TreeNode.prototype.getDepth = function() {
        var depth = 0;
        var node = this;
        while (node.getParent()) {
            depth++;
            node = node.getParent();
        }
        return depth;
    };

    /**
     * @return {!Array.<!TreeNode>} All ancestor nodes in bottom-up
     *     order.
     */
    TreeNode.prototype.getAncestors = function() {
        var ancestors = [];
        var node = this.getParent();
        while (node) {
            ancestors.push(node);
            node = node.getParent();
        }
        return ancestors;
    };

    /**
     * @return {!TreeNode} The root of the tree structure, i.e. the
     *     farthest ancestor of the node or the node itself if it has no parents.
     */
    TreeNode.prototype.getRoot = function() {
        var root = this;
        while (root.getParent()) {
            root = root.getParent();
        }
        return root;
    };

    /**
     * Builds a nested array structure from the node keys in this node's subtree to
     * facilitate testing tree operations that change the hierarchy.
     * @return {!Array} The structure of this node's descendants as nested array
     *     of node keys. The number of unclosed opening brackets up to a particular
     *     node is proportional to the indentation of that node in the graphical
     *     representation of the tree. Example:
     *     <pre>
     *       this
     *       |- child1
     *       |  L- grandchild
     *       L- child2
     *     </pre>
     *     is represented as ['child1', ['grandchild'], 'child2'].
     */
    TreeNode.prototype.getSubtreeKeys = function() {
        var ret = [];
        this.forEachChild(function(child) {
            ret.push(child.getKey());
            if (!child.isLeaf()) {
                ret.push(child.getSubtreeKeys());
            }
        });
        return ret;
    };

    /**
     * Tells whether this node is the ancestor of the given node.
     * @param {!TreeNode} node A node.
     * @return {boolean} Whether this node is the ancestor of {@code node}.
     */
    TreeNode.prototype.contains = function(node) {
        var current = node;
        do {
            current = current.getParent();
        } while (current && current != this);
        return Boolean(current);
    };

    /**
     * Finds the deepest common ancestor of the given nodes. The concept of
     * ancestor is not strict in this case, it includes the node itself.
     * @param {...!TreeNode} var_args The nodes.
     * @return {TreeNode} The common ancestor of the nodes or null if
     *     they are from different trees.
     */
    TreeNode.findCommonAncestor = function(var_args) {
        var ret = arguments[0];
        if (!ret) {
            return null;
        }

        var retDepth = ret.getDepth();
        for (var i = 1; i < arguments.length; i++) {
            var node = arguments[i];
            var depth = node.getDepth();
            while (node != ret) {
                if (depth <= retDepth) {
                    ret = ret.getParent();
                    retDepth--;
                }
                if (depth > retDepth) {
                    node = node.getParent();
                    depth--;
                }
            }
        }

        return ret;
    };

    /**
     * Traverses all child nodes.
     * @param {function(!TreeNode, number,
     *     !Array.<!TreeNode>)} f Callback function. It takes the
     *     node, its index and the array of all child nodes as arguments.
     * @param {Object=} opt_this The object to be used as the value of {@code this}
     *     within {@code f}.
     */
    TreeNode.prototype.forEachChild = function(f, opt_this) {
        Util.Array.each(this.getChildren(), f, opt_this);
    };

    /**
     * Traverses all child nodes recursively.
     * @param {function(!TreeNode)} f Callback function. It takes the
     *     node as argument.
     * @param {Object=} opt_this The object to be used as the value of {@code this}
     *     within {@code f}.
     */
    TreeNode.prototype.forEachDescendant = function(f, opt_this) {
        Util.Array.each(this.getChildren(), function (child) {
            f.call(opt_this, child);
            child.forEachDescendant(f, opt_this);
        });
    };

    /**
     * Sets the parent node of this node. The callers must ensure that the parent
     * node and only that has this node among its children.
     * @param {TreeNode} parent The parent to set. If null, the node
     *     will be detached from the tree.
     * @protected
     */
    TreeNode.prototype.setParent = function(parent) {
        this._parent = parent;
    };

    /**
     * Appends a child node to this node.
     * @param {!TreeNode} child Orphan child node.
     */
    TreeNode.prototype.addChild = function(child) {
        this.addChildAt(child, this._children ? this._children.length : 0);
    };

    /**
     * Inserts a child node at the given index.
     * @param {!TreeNode} child Orphan child node.
     * @param {number} index The position to insert at.
     */
    TreeNode.prototype.addChildAt = function(child, index) {
        Util.Asserts.assert(!child.getParent());
        child.setParent(this);
        this._children = this._children || [];
        Util.Asserts.assert(index >= 0 && index <= this._children.length);
        Util.Array.insertAt(this._children, child, index);
    };


    /**
     * Replaces a child node at the given index.
     * @param {!TreeNode} newChild Child node to set. It must not have
     *     parent node.
     * @param {number} index Valid index of the old child to replace.
     * @return {!TreeNode} The original child node, detached from its
     *     parent.
     */
    TreeNode.prototype.replaceChildAt = function(newChild, index) {
        Util.Asserts.assert(!newChild.getParent(), 'newChild must not have parent node');
        var children = this.getChildren();
        var oldChild = children[index];
        Util.Asserts.assert(oldChild, 'Invalid child or child index is given.');
        oldChild.setParent(null);
        children[index] = newChild;
        newChild.setParent(this);
        return oldChild;
    };

    /**
     * Replaces the given child node.
     * @param {!TreeNode} newChild New node to replace
     *     {@code oldChild}. It must not have parent node.
     * @param {!TreeNode} oldChild Existing child node to be replaced.
     * @return {!TreeNode} The replaced child node detached from its
     *     parent.
     */
    TreeNode.prototype.replaceChild = function(newChild, oldChild) {
        return this.replaceChildAt(newChild, this.getChildren().indexOf(oldChild));
    };

    /**
     * Removes the child node at the given index.
     * @param {number} index The position to remove from.
     * @return {TreeNode} The removed node if any.
     */
    TreeNode.prototype.removeChildAt = function(index) {
        var child = this._children && this._children[index];
        if (child) {
            child.setParent(null);
            Util.Array.removeAt(this._children, index);
            if (this._children.length == 0) {
                delete this._children;
            }
            return child;
        }
        return null;
    };

    /**
     * Removes the given child node of this node.
     * @param {TreeNode} child The node to remove.
     * @return {TreeNode} The removed node if any.
     */
    TreeNode.prototype.removeChild = function(child) {
        return this.removeChildAt(this.getChildren().indexOf(child));
    };

    /**
     * Removes all child nodes of this node.
     */
    TreeNode.prototype.removeChildren = function() {
        if (this._children) {
            this._children.forEach(function (child) {
                child.setParent(null);
            });
        }
        delete this._children;
    };

})();