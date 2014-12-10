/*
Entity Plugin
*/

(function(CM) {

    // Entity plugin is a general plugin for passage and items.
    function EntityPlugin(page, entity, config) {
        Util.Assert.isInstanceOf(ContentPage, page);
        Util.Assert.isInstanceOf(ContentEntity, entity);
        Util.Event.Emitter(this);
        this.page = page;
        this.entity = entity;
        this.config = config;
        this.init(config);
    }

    // manager calls this to get all the resources loaders for this widget
    EntityPlugin.prototype.getResources = function () {
        return [];
    }

    // get all the components for this response
    EntityPlugin.prototype.getComponents = function () {
        return [];
    }

    // Return true when the widget is rendered and ready to show to the student.
    /*
    EntityPlugin.prototype.isReady = function () {
        return false;
    }
    */

    // This is called when the widget is first created. 
    EntityPlugin.prototype.init = function () {
        
    }

    // This is called when the entity is ready to render.
    EntityPlugin.prototype.load = function (el) {
        // TODO: throw error here
    }

    // called when the widget is shown
    EntityPlugin.prototype.show = function () {

    }

    // called when the widget is hidden
    EntityPlugin.prototype.hide = function () {

    }

    EntityPlugin.prototype.focus = function () {

    }

    EntityPlugin.prototype.blur = function () {

    }

    // called when zooming occurs on the page
    EntityPlugin.prototype.zoom = function (level) {

    }

    // what about component?
    EntityPlugin.prototype.keyEvent = function (ev) {

    }

    EntityPlugin.prototype.showMenu = function (menu, evt) {

    }

    EntityPlugin.prototype.dispose = function () {

    }
    
    CM.EntityPlugin = EntityPlugin;
    
})(ContentManager);
