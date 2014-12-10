if (typeof Simulator == 'undefined' || !Simulator) {
    /**
     * The Simulator global namespace object.  If Simulator is already defined, the
     * existing Simulator namespace object will not be overwritten so that defined
     * namespaces are preserved.
     * @class Simulator
     * @static
     */
    var Simulator = {};
}

/**
 * Returns the nameSpace specified and creates it if it doesn't exist
 * <pre>
 * Simulator.namespace('property.package');
 * Simulator.namespace('Simulator.property.package');
 * </pre>
 * Either of the above would create Simulator.property, then
 * Simulator.property.package
 * 
 * This routine is adapted from the YUI YAHOO nameSpace routine
 *
 * @param  {String*} arguments 1-n nameSpaces to create
 * @return {Object}  A reference to the last nameSpace object created
 */
Simulator.nameSpace = function() {
    var nsObj = null, parts;
    for (var i = 0; i < arguments.length; i++) {
        parts = ('' + arguments[i]).split('.');
        nsObj = Simulator;

        // Simulator is implied, so it is ignored if it is included
        for (var j = (parts[0] === 'Simulator') ? 1 : 0; j < parts.length; j++) {
            nsObj[parts[j]] = nsObj[parts[j]] || {};
            nsObj = nsObj[parts[j]];
        }
    }
    console.log('Set up ' + arguments[0] + '.' + arguments[1] + ' namespace');
    return nsObj;
};

// Create the nameSpaces
Simulator.Animation = Simulator.nameSpace('Simulator', 'Animation');
Simulator.Control = Simulator.nameSpace('Simulator', 'Control'); 
Simulator.Display = Simulator.nameSpace('Simulator', 'Display'); 
Simulator.Input = Simulator.nameSpace('Simulator', 'Input'); 
Simulator.Utils = Simulator.nameSpace('Simulator', 'Utils'); 
