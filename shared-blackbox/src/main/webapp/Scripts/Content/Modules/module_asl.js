

// Item has been received and added to the shell - see if it contains any
// ASL resources.
/*ContentManager.onEntityEvent('available', function (page, entity) {
    //ContentManager.log("ASL: processing " + entity.getID());
    if (entity.attachments != undefined && entity.attachments != null &&
        entity.attachments.length > 0) {
        var at = entity.attachments;
        ContentManager.log("This entity has " + at.length + " attachements");
        var i;
        for (i = 0; i < at.length; ++i) {
            if (at[i].type == "ASL") {
                ContentManager.log("  file    is " + at[i].file);
                ContentManager.log("  id      is " + at[i].id);
                ContentManager.log("  type    is " + at[i].type);
                ContentManager.log("  subType is " + at[i].subType);
            }
        }
    }
});*/

// listen for context menu.  a.k.a right click menu.
// This gets hit for both option and stem right-clicks
ContentManager.onItemEvent('menushow', function (page, item, menu, evt) {
    if (!item)
        return;

    var accProps = TDS.getAccommodationProperties();

    if (!accProps.hasASL())
        return;

    // check if MC, mirror what is done in module_mc
    var menuType = 'entity';
    var optionGroup = item.MC;
    var subType = 'STEM';

    if (optionGroup) {
        var focusedOption = optionGroup.getFocusedOption();
        if (focusedOption) {
            menuType = 'component';
            subType = 'Option ' + focusedOption.key;
        }
    }

    // If there are attachements, add them to the menu.
    AslModule.addEntityToMenu(item, subType, menu, menuType);
});

// listen for context menu for passages.
ContentManager.onPassageEvent('menushow', function (page, item, menu, evt) {

    var accProps = TDS.getAccommodationProperties();
    
    if (!accProps.hasASL())
        return;

    // check if MC
    var menuType = 'entity';
    var subType = null;

    AslModule.addEntityToMenu(item, subType, menu, menuType);
});

// This stuff could be moved to its own file, if there becomes much
// more of it.  Just leave it here for now.

AslModule = {};

// See if there are attachment on the right-clicked-thing.  And then
// add it to the context menu if there are.
// entity - right-clicked-thing
// subtype - string that described the type of thing (PASSAGE etc)
// menu - the menu passed in to the callback.
// menuType - the subtye of the menu, which is different for stem vs. MC
AslModule.addEntityToMenu = function (entity, subtype, menu, menuType) {
    
    // Helper function to add something to the menu
    var addMenu = function(messageKey, menuClass, menuFunc) {
        var menuItem = {
            text: Messages.get(messageKey),
            classname: menuClass,
            onclick: { fn: menuFunc }
        };

        menu.addMenuItem(menuType, menuItem);
    };

    if (entity.hasAslAttachments(subtype)) {
        addMenu('TDSContentEventJS.Label.ASLItem', 'ASL', function() {
            var att = entity.getAslAttachments()[0];
            var link = att['url'];
            AslModule.showImageDialog(link,entity.getPage().getZoomFactor());
        });
    }

};

// Help function to just show the dialog.
AslModule.showImageDialog = function(url,zoomFactor) {    
    var anchor = document.createElement('a');
    anchor.href = url;
    VideoManager.openDialog(null, anchor, zoomFactor);
};

// See if this entity has any attachments of type ASL.  
// If so, return them
// st - string for matching the subtype.
ContentEntity.prototype.getAslAttachments = function (st) {
    var rv = [];
    // Note: null checks are for if you want all the attachments.
    Util.Array.each(this.attachments, function (att) {
        if ((att['type']) && (att['type'] == 'ASL')) {
            if ((st == null) || (st.length == 0) ||
                (att['subType'] == null) || (st == att['subType']))
                rv.push(att);
        }
    });

    return rv;
};

// See if this entity has any attachments of type ASL.  
ContentEntity.prototype.hasAslAttachments = function (st) {
    return this.getAslAttachments(st).length != 0;
};
