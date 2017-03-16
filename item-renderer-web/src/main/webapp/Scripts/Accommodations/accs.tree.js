//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function(Accs) {

    var AccsProto = Accs.prototype;

    // create a tree with one branch
    AccsProto.getTree = function() {
        var tree = new Util.Structs.TreeNode();

        // get all the types
        var accTypes = this.getTypes();

        // split types that depend on a tool and those that don't
        var results = Util.Array.partition(accTypes, function(accType) {
            return (accType.getDependsOnTool() == null);
        });

        // add top level accommodations to tree
        Util.Array.each(results.matches, function(accType) {
            var rootNode = new Util.Structs.TreeNode(accType.getName(), accType);
            tree.addChild(rootNode);
        });

        tree.forEachChild(function(node, index, children) {
            Util.Array.each(results.rejects, function(accType) {
                // check if this is a child of the parent node
                if (node.getValue() == accType.getDependsOnTool()) {
                    var childNode = new Util.Structs.TreeNode(accType.getName(), accType);
                    node.addChild(childNode);
                }
            });
        });

        return tree;
    };

    // create a tree with one branch
    AccsProto.getTypesByDependency = function() {
        var tree = this.getTree();

        // get flattened type keys
        var typeKeys = tree.getSubtreeKeys();
        typeKeys = Util.Array.flatten(typeKeys);

        return Util.Array.map(typeKeys, function(typeKey) {
            return this.getType(typeKey);
        }, this);
    };

})(Accommodations);