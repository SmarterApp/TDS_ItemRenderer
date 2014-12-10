/*
Renderer for MC/MS.
*/

MS = TDS.MultipleSelect || {};

(function(MS) {

    var Mode = MS.Mode;
    var Orientation = MS.Orientation;

    function Renderer(ms) {
        Util.Assert.isInstanceOf(MS, ms);
        this.ms = ms;
        this.useTable = (ms.orientation == Orientation.Horizontal);
    }

    Renderer.prototype.render = function(parentEl) {

        var containerEl = this.createContainer();

        // check for prompt
        var promptEl = this.createPrompt();
        if (promptEl) {
            containerEl.appendChild(promptEl);
        }

        var groupEl = this.createGroup();

        // render out option elements
        var optionEls = this.createOptions();
        optionEls.forEach(function(optionEl) {
            if (this.useTable) {
                var cellEl = document.createElement('td');
                cellEl.appendChild(optionEl);
                groupEl.appendChild(cellEl);
            } else {
                groupEl.appendChild(optionEl);
            }
        }.bind(this));

        containerEl.appendChild(groupEl);

        // create table
        if (this.useTable) {
            var tableEl = document.createElement('table');
            tableEl.className = 'flat';
            tableEl.appendChild(containerEl); // add <tr>
            containerEl = tableEl; // swap container 
        }

        parentEl.appendChild(containerEl);
    }

    Renderer.prototype.createContainer = function() {

        var containerTag = this.useTable ? 'tr' : 'div';
        var containerEl = document.createElement(containerTag);
        containerEl.className = 'optionsContainer';

        // add class that determines option look
        if (this.ms.mode == Mode.Single) {
            $(containerEl).addClass('format_mc');
        } else {
            $(containerEl).addClass('format_ms');
        }

        return containerEl;
    }

    Renderer.prototype.createGroup = function() {
        var groupEl = document.createElement('div');
        groupEl.className = 'optionsGroup';
        return groupEl;
    }

    // create the prompt <div class="optionsPrompt">
    Renderer.prototype.createPrompt = function() {
        if (this.ms.prompt) {
            var promptEl = document.createElement('div');
            promptEl.className = 'optionsPrompt';
            promptEl.innerHTML = this.ms.prompt;
            return promptEl;
        } else {
            return null;
        }
    }

    // create the option <div>'s and return as an array
    Renderer.prototype.createOptions = function() {
        var optionEls = [];
        this.ms.options.forEach(function(option) {
            var optionEl = this.createOption(option);
            optionEls.push(optionEl);
        }.bind(this));
        return optionEls;
    }

    // create the option <div class="optionContainer">
    Renderer.prototype.createOption = function(option) {

        // <div> container
        var optionEl = document.createElement('div');
        $(optionEl).addClass('optionContainer');
        $(optionEl).addClass('option' + option.value);
        if (option.selected) {
            $(optionEl).addClass('optionSelected');
        }

        // <span class="striked">
        var strikeEl = document.createElement('span');
        strikeEl.className = 'striked';
        optionEl.appendChild(strikeEl);

        // <span class="optionClicker">
        var clickerEl = document.createElement('span');
        clickerEl.className = 'optionClicker';
        optionEl.appendChild(clickerEl);

        // <input>
        var inputEl = document.createElement('input');
        inputEl.className = 'option';
        inputEl.name = this.ms.name;
        inputEl.type = (this.ms.mode == Mode.Single) ? 'radio' : 'checkbox';
        inputEl.value = option.value;
        inputEl.checked = option.selected;
        optionEl.appendChild(inputEl);
        inputEl.setAttribute('aria-label', 'Option ' + option.value);

        // <div class="optionContent">
        // TODO: This should be a label but it can't contain block level elements. Dan says add an ARIA tag.
        var contentEl = document.createElement('div');
        contentEl.className = 'optionContent';
        $(contentEl).html(option.html);
        optionEl.appendChild(contentEl);

        // <div class="optionFeedback">
        if (option.feedback) {
            var feedbackEl = document.createElement('div');
            feedbackEl.className = 'optionFeedback';
            optionEl.appendChild(feedbackEl);
        }

        // TODO: Add rendering the prompt html. And make it a <legend> inside the <fieldset>.

        // add option events
        this.addOptionEvents(option, optionEl, inputEl);

        return optionEl;

    }

    Renderer.prototype.addOptionEvents = function(option, optionEl, inputEl) {

        // listen for selecting option model
        option.on('selected', function() {
            $(optionEl).addClass('optionSelected');
            if (!inputEl.checked) {
                inputEl.checked = true;
            }
        });

        // listen for deselecting option model
        option.on('deselected', function() {
            $(optionEl).removeClass('optionSelected');
            if (inputEl.checked) {
                inputEl.checked = false;
            }
        });

        // listen for changes to the input
        $(inputEl).change(function(evt) {
            if (inputEl.checked) {
                if (!option.select()) {
                    // revert the input check
                    inputEl.checked = false;
                }
            } else {
                option.deselect();
            }
        });

        // listen for when someone clicks the container
        $(optionEl).click(function(evt) {
            option.select();
        });

        // stop propagation on input so container does not get event
        $(inputEl).click(function(evt) {
            evt.stopPropagation();
        });

    }

    MS.Renderer = Renderer;

})(TDS.MultipleSelect);