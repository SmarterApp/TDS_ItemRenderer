/* TOOLBAR CLASS */

Grid.Toolbar = function(grid)
{
    this.grid = grid;
    this.view = grid.view;

    this._buttonHash = {};
    this._buttons = [];
};

Grid.Toolbar.prototype.init = function()
{
    var buttonNames = ['move', 'delete', 'point', 'connect', 'arrow', 'arrw2', 'dash', 'circle']; // , 'label', 'value'

    var grid = this.grid;

    for (var i = 0; i < buttonNames.length; i++)
    {
        var buttonName = buttonNames[i];

        var button = null;

        switch (buttonName)
        {
            case 'move': button = new Grid.Toolbar.Button.Circle(this, buttonName); break;
            default: button = new Grid.Toolbar.Button(this, buttonName); break;
        }

        button.hide();

        this._buttons.push(button);
        this._buttonHash[buttonName] = button;

        // listen for button click and then set mode
        (function (button) {
            var buttonGroup = button.getGroup();
            Grid.Utils.addMouseListener(buttonGroup, 'mousedown', function () {
                if (!grid.isReadOnly()) {
                    grid.setMode(button.name);
                }
            }, false);
        })(button);
    }
};

Grid.Toolbar.prototype.getButton = function(buttonName) { return this._buttonHash[buttonName]; };

Grid.Toolbar.prototype.getButtons = function() { return this._buttons; };

Grid.Toolbar.prototype.getVisibleButtons = function()
{
    var visibleButtons = [];

    for (var i = 0; i < this._buttons.length; i++)
    {
        var button = this._buttons[i];
        
        if (button.isVisible()) visibleButtons.push(button);
    }

    return visibleButtons;
};

// hides all the buttons
Grid.Toolbar.prototype.resetButtons = function()
{
    for (var i = 0; i < this._buttons.length; i++)
    {
        var button = this._buttons[i];
        button.hide();
    }
};

// shows all the buttons passed in the string array
Grid.Toolbar.prototype.enableButtons = function(buttonNames)
{
    // hide all the buttons
    this.resetButtons();

    // make buttons called out in item XML visible
    for (var i = 0; i < buttonNames.length; i++) {
        var button = this._buttonHash[buttonNames[i]];
        button.show();
    }

    var spacing = 5;
    var x = spacing;
    var y = 2;

    // based on button order determined by this._buttons, position visible buttons
    for (var i = 0; i < this._buttons.length; i++) {
        var button = this._buttons[i];
        if (!button.isVisible()) continue;

        var buttonGroup = button.getGroup();

        // set the button spacing
        this.view.setAttributes(buttonGroup,
        {
            'transform': 'translate(' + x + ', ' + y + ')'
        });

        x = x + button.width + spacing;
    }

};

Grid.Toolbar.prototype.processKeyEvent = function(evt)
{
    // enter moves you to canvas
    if (evt.key == 'enter')
    {
        this.grid.setArea('canvas');
        return;
    }

    // left/right moves selected button
    if (evt.key != 'left' && evt.key != 'right') return;

    var selectedButton = this.getButton(this.grid.getMode());
    var visibleButtons = this.getVisibleButtons();
    
    // make sure there are some buttons
    if (visibleButtons.length == 0) return;

    for (var i = 0; i < visibleButtons.length; i++)
    {
        var button = visibleButtons[i];

        if (button == selectedButton)
        {
            if (evt.key == 'left')
            {
                if (i == 0) selectedButton = visibleButtons[visibleButtons.length - 1]; // first
                else selectedButton = visibleButtons[i - 1]; // left
            }
            else if (evt.key == 'right')
            {
                if (i == (visibleButtons.length - 1)) selectedButton = visibleButtons[0]; // last
                else selectedButton = visibleButtons[i + 1]; // right
            }

            break;
        }
    }

    this.grid.setMode(selectedButton.name);
};

// register actions for a mode
Grid.Action.registerAction('move', Grid.Action.Move);
Grid.Action.registerAction('delete', Grid.Action.Delete);
Grid.Action.registerAction('point', Grid.Action.Point);
Grid.Action.registerAction('connect', Grid.Action.Line);
Grid.Action.registerAction('arrow', Grid.Action.ArrowSingle);
Grid.Action.registerAction('arrw2', Grid.Action.ArrowDouble);
Grid.Action.registerAction('dash', Grid.Action.LineDash);
Grid.Action.registerAction('circle', Grid.Action.Circle);
