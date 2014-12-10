/* REGIONGROUP CLASS */

Grid.Model.RegionGroup = function(model, name, min, max)
{
    this.model = model;
    this.name = name || '';
    this.min = min || 0;
    this.max = max || 0;
    this._regions = []; // collection of regions
};

Grid.Model.RegionGroup.prototype.getRegions = function() { return this._regions; };

Grid.Model.RegionGroup.prototype.getRegion = function(name)
{
    var regions = this.getRegions();

    for (var i = 0; i < regions.length; i++)
    {
        var region = regions[i];
        if (region.name == name) return region;
    }

    return null;
};

Grid.Model.RegionGroup.prototype.getSelectedRegions = function()
{
    var regions = this.getRegions();

    // get selected regions
    var selectedRegions = [];

    for (var i = 0; i < regions.length; i++)
    {
        var region = regions[i];
        if (region.isSelected()) selectedRegions.push(region);
    }

    return selectedRegions;
};

// add a region to this group
Grid.Model.RegionGroup.prototype.addRegion = function(region)
{
    this._regions.push(region);
};

Grid.Model.RegionGroup.prototype.containsRegion = function(region)
{
    return (this._regions.indexOf(region) > -1);
};

// remove a region from this group
Grid.Model.RegionGroup.prototype.removeRegion = function(region, deleteOrphan)
{
    // remove region from array
    Grid.Model.arrayRemove(this._regions, region);

    // check if we are deleting from the model any regions that have no groups assigned
    if (deleteOrphan && region.getGroups().length == 0)
    {
        this.model.deleteRegion(region);
    }
};

// has the max # of regions for this group been met
Grid.Model.RegionGroup.prototype.isMaxMet = function()
{
    var selectedRegions = this.getSelectedRegions();
    return (this.max > 0 && selectedRegions.length >= this.max);
};