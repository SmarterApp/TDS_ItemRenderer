//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
MC/MS object model.
NOTE: Do not add DOM code here.
*/

(function(TDS) {

    var Mode = {
        Single: 'single', // radio buttons
        Multiple: 'multiple' // check boxs
    }

    var Orientation = {
        Vertical: 'vertical',
        Horizontal: 'horizontal',
        Stacked: 'stacked',
        StackedB: 'stackedb'
    };

    function MS(name, minChoices, maxChoices, orientation) {
        Util.Event.Emitter(this);
        this.name = name;
        this.title = '';
        this.prompt = '';
        this.options = [];
        this.minChoices = minChoices || 0;
        this.maxChoices = maxChoices || 0;
        this.mode = this.maxChoices === 1 ? Mode.Single : Mode.Multiple;
        this.orientation = orientation || Orientation.Vertical;
    }

    MS.Mode = Mode;
    MS.Orientation = Orientation;

    // return all the selected options
    Object.defineProperty(MS.prototype, 'selectedOptions', {
        get: function() {
            return this.options.filter(function(option) {
                return option.selected === true;
            });
        }
    });

    Object.defineProperty(MS.prototype, 'selectedKeys', {
        get: function() {
            return this.selectedOptions.map(function(option) {
                return option.key;
            });
        }
    });

    MS.prototype.createOption = function(key, html, feedback, soundLink) {

        // check if key already exists
        var option = this.getOption(key);
        if (option) {
            throw new Error('An option with the key \'' + key + '\' already exists.');
        }

        option = new MS.Option(this, key, html);

        if (feedback) {
            option.feedback = feedback;
        }

        if (soundLink) {
            option.soundLink = soundLink;
        }

        this.options.push(option);
        return option;
    }

    MS.prototype.getOption = function(key) {
        return Util.Array.find(this.options, function(option) {
            return option.key === key;
        });
    }

    MS.prototype.select = function(key) {
        var option = this.getOption(key);
        if (option) {
            return option.select();
        }
        return false;
    }

    MS.prototype.deselect = function(key) {
        var option = this.getOption(key);
        if (option) {
            return option.deselect();
        }
        return false;
    }

    MS.prototype.shuffle = function() {
        this.options = Util.Array.shuffle(this.options);
    }

    TDS.MultipleSelect = MS;

})(window.TDS);