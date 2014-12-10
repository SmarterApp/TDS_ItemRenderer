/* BUTTON CLASS */

Grid.Toolbar.Button = function(toolbar, name)
{
    this.name = name;
    this.width = 100;
    
    this.toolbar = toolbar;
    this.grid = toolbar.grid;
    this.view = toolbar.view;

    this._visible = true;
    this._state = Grid.Toolbar.Button.State.Up;

    this._iconFillElements = [];
    this._iconStrokeElements = [];

    this._init();
};

// up, over, selected, selOver
Grid.Toolbar.Button.State =
{
    Up: 0,
    Selected: 1,
    Over: 2,
    SelectedOver: 3
};

Grid.Toolbar.Button.prototype._init = function()
{
    var buttonGroup = this.getGroup();

    for (var i = 0; i < buttonGroup.childNodes.length; i++)
    {
        var element = buttonGroup.childNodes[i];

        if (element.nodeType == 1)
        {
            if (element.getAttribute('fill') == '#ffffff') this._iconFillElements.push(element);
            if (element.getAttribute('stroke') == '#ffffff') this._iconStrokeElements.push(element);
        }
        
        if (typeof window.Messages == 'object' && element.nodeName == 'text') //<text> node
        {
            // We may have internationalized messages     
            // The prefix here is match up with the keys used for internationalization
            var key = "GridSVG.Label.button_"+element.textContent.replace(" ","_");
            var alternateLabel = window.Messages.get(key);  
            // check to make sure an alternate label was found. If not, leave the text alone                          
            if(alternateLabel != key) {
                element.textContent = alternateLabel;
            }                     
        }
    }
};

// get the button group <g>
Grid.Toolbar.Button.prototype.getGroup = function()
{
    return this.view.getElementById('button_' + this.name);
};

// get the button container <path>
Grid.Toolbar.Button.prototype.getContainer = function()
{
    var buttonGroup = this.getGroup();

    var path = null;
    for (var i = 0; i < buttonGroup.childNodes.length; i++)
    {
        var node = buttonGroup.childNodes[i];

        if (node.nodeName == 'path')
        {
            path = node;
            break;
        }
    }

    return path;
};

Grid.Toolbar.Button.prototype.show = function()
{
    var buttonGroup = this.getGroup();
    buttonGroup.style.display = '';
    this._visible = true;
};

Grid.Toolbar.Button.prototype.hide = function()
{
    var buttonGroup = this.getGroup();
    buttonGroup.style.display = 'none';
    this._visible = false;
};

Grid.Toolbar.Button.prototype.isVisible = function() { return this._visible; };

Grid.Toolbar.Button.prototype._setIconColor = function(color)
{
    for (var i = 0; i < this._iconFillElements.length; i++)
    {
        var element = this._iconFillElements[i];
        element.setAttribute('fill', color);
    }

    for (var i = 0; i < this._iconStrokeElements.length; i++)
    {
        var element = this._iconStrokeElements[i];
        element.setAttribute('stroke', color);
    }
};

Grid.Toolbar.Button.prototype.deselect = function()
{
    this._state = Grid.Toolbar.Button.State.Up;
    this._setIconColor('#ffffff');
    
    var container = this.getContainer();
    container.setAttribute('fill', 'url(#buttons_background_up)');
};

Grid.Toolbar.Button.prototype.select = function()
{
    this._state = Grid.Toolbar.Button.State.Selected;
    this._setIconColor('#1f5181');

    var container = this.getContainer();
    container.setAttribute('fill', 'url(#buttons_background_selected)');
};

Grid.Toolbar.Button.Circle = function(toolbar, name)
{
    Grid.Toolbar.Button.Circle.superclass.constructor.call(this, toolbar, name);
    this.width = 18;
};

Lang.extend(Grid.Toolbar.Button.Circle, Grid.Toolbar.Button);

// get the button container <path>
Grid.Toolbar.Button.Circle.prototype.getContainer = function()
{
    var buttonGroup = this.getGroup();

    var circle = null;
    for (var i = 0; i < buttonGroup.childNodes.length; i++)
    {
        var node = buttonGroup.childNodes[i];

        if (node.nodeName == 'circle')
        {
            circle = node;
            break;
        }
    }

    return circle;
};