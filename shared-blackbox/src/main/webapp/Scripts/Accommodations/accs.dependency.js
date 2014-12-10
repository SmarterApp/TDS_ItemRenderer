Accommodations.Dependency = (function () {

    function Dependency(parentAccommodations, ifTypeName, ifValueCode, thenTypeName, thenValueCode, thenIsDefault) {

        this.ifType = function() {
            return parentAccommodations.getType(ifTypeName);
        };

        this.ifValue = function() {
            return parentAccommodations.getValue(ifValueCode);
        };

        this.thenType = function() {
            return parentAccommodations.getType(thenTypeName);
        };

        this.thenValue = function() {
            return parentAccommodations.getValue(thenValueCode);
        };

        this.isDefault = function() {
            return (thenIsDefault === true);
        };

        this.destroy = function() {
            parentAccommodations = null;
            ifTypeName = null;
            ifValueCode = null;
            thenTypeName = null;
            thenValueCode = null;
        };
    };

    return Dependency;

})();