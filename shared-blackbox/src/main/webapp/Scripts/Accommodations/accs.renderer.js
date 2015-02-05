Accommodations.Renderer = (function() {

    function Renderer(accs, opts) {
        this._accs = accs;
        this._opts = opts || {};
        YAHOO.lang.augmentObject(this._opts, {
            showHidden: false, // show types where isVisible() is false (mostly for debugging)
            showLocked: false, // show types where isSelectable() is false (they aren't made selectable)
            reviewDisabled: false, // if this is true then disabled types will not show user control
            reviewAll: false // renders all controls as plain text (this overrides reviewDisabled)
        });
    }

    Renderer.prototype.getContainer = function() {
        var containerId = 'accs-container-' + this._accs.getDomId();
        return document.getElementById(containerId);
    };

    Renderer.prototype.getForm = function() {
        var formId = 'accs-form-' + this._accs.getDomId();
        return document.forms[formId];
    };
    
    Renderer.prototype._onSelect = function(accValue) {
        console.log('AccSelect: ' + accValue);
        // find all the types that are dependent on this value being changed and rerender
        this.renderTypes(accValue.getParentType().getDependentTypes());
    };

    Renderer.prototype.bind = function () {
        this._accs.on('selectValue', this._onSelect.bind(this));
    };

    Renderer.prototype.unbind = function () {
        this._accs.removeListener('selectValue', this._onSelect.bind(this));
    };

    Renderer.prototype.render = function (parentEl) {

        parentEl = YAHOO.util.Dom.get(parentEl);

        // create container
        var container = this.getContainer();
        if (!container) {
            var containerId = 'accs-container-' + this._accs.getDomId();
            container = HTML.DIV({ id: containerId });
        }

        parentEl.appendChild(container);

        // create form
        var form = this.getForm();
        if (!form) {
            var formId = 'accs-form-' + this._accs.getDomId();
            form = HTML.FORM({ id: formId, name: formId });
        }

        container.appendChild(form);

        // get only the types that do not have dependencies
        var accTypes = this._accs.getTypes().filter(function(accType) {
            return (!accType.getDependsOnTool());
        });

        this.renderTypes(accTypes);

        return true;
    };

    Renderer.prototype.renderTypes = function (accTypes) {
        accTypes.forEach(this.renderType.bind(this));
    };

    Renderer.prototype.renderType = function (accType) {

        // create container or clear out existing container
        var containerEl = this.createContainer(accType);

        // check if accommodation is visible
        if ((!this._opts.showHidden && !accType.isVisible()) ||
            (!this._opts.showLocked && !accType.isSelectable())) {
            // hide container
            $(containerEl).hide();
        } else {

            // show container
            $(containerEl).show();

            // check if type has anything that is editable
            var editable = (accType.getValues().length > 1);

            // check if control is disabled
            var disabled = (!accType.isSelectable() || !editable);

            // check if we are in review mode
            var reviewMode = ((this._opts.reviewAll && (!editable || !accType.allowStudentControl())) ||
                              (this._opts.reviewDisabled && disabled));

            // create form element label
            var labelEl = this.createLabel(accType, reviewMode);
            containerEl.appendChild(labelEl);

            // logic for figuring out best way to render this accommodation
            var ctrlEl;
            if (reviewMode) {
                // plain text
                ctrlEl = this.createList(accType);
            } else {
                // form input
                if (accType.isBoolSelect()) {
                    $(containerEl).addClass('checkbox');
                    ctrlEl = this.createCheckBox(accType, disabled);
                } else if (accType.isMultiSelect()) {
                    $(containerEl).addClass('multiselect');
                    ctrlEl = this.createCheckboxes(accType, disabled);
                } else {
                    $(containerEl).addClass('singleselect');
                    ctrlEl = this.createDropdown(accType, disabled);
                }
            }

            // add control
            if (ctrlEl) {
                $(ctrlEl).addClass('control');
                containerEl.appendChild(ctrlEl);
            }

            // create line break
            var clearEl = document.createElement('span');
            clearEl.className = 'clear';
            containerEl.appendChild(clearEl);

        }

        // add container
        this.getForm().appendChild(containerEl);

        // render children
        this.renderTypes(accType.getDependentTypes());
    };

    // create the container for the label and controls
    Renderer.prototype.createContainer = function(accType) {

        // look for existing container
        var containerEl = document.getElementById(accType.getControlId());
        if (containerEl) {
            $(containerEl).empty();
        }

        // create container if it does not exist
        if (!containerEl) {
            containerEl = document.createElement('div');
            containerEl.setAttribute('id', accType.getControlId());
        }

        // clear all previous classes
        containerEl.className = '';

        // check if this type has any dependencies at all
        if (accType.getDependsOnTool()) {
            $(containerEl).addClass('dependency');
        }

        // adding aria-labelledby attribute to the container
        $(containerEl).attr({ 'aria-labelledby': 'containerLabel_' + accType.getControlId() });

        return containerEl;

    };
    
    // create label for the control
    // WCAG Note: for multiselected options (group checkboxes), use <div> instead of <label>
    Renderer.prototype.createLabel = function (accType, reviewMode) {

        var isMultiselect = accType.isMultiSelect(),

            // for multiple selection, we are using div and aria-labelledby attribute in parent container 
            // instead of label since label is more for form
            // while we need label for the entire container here
            tagName = isMultiselect ? 'div' : 'label',

            labelEl = document.createElement(reviewMode ? 'span' : tagName);

        labelEl.className = 'label';

        if (!reviewMode) {
            if (!isMultiselect) {
                labelEl.setAttribute('for', accType.getId());
            }
            labelEl.setAttribute('i18n-text', accType.getId());
        }

        if (isMultiselect) {
            $(labelEl).attr({ 'id': 'containerLabel_' + accType.getControlId() });
        }

        var labelText = document.createTextNode(accType.getLabel() + ': ');
        labelEl.appendChild(labelText);
        return labelEl;
    };

    // when in review mode render control as plain text
    Renderer.prototype.createList = function(accType) {
        var spanEl = document.createElement('span');
        var valueNames = accType.getSelected().map(function (accValue) {
            return accValue.getLabel();
        });
        $(spanEl).text(valueNames.join(', '));
        return spanEl;
    };

    // render this accommodation as a checkbox
    Renderer.prototype.createCheckBox = function (accType, disabled) {

        var accValues = accType.getValues();

        // find what represents the true value
        var trueValue = Util.Array.find(accValues, function(accValue) {
            return accValue.getName() == 'True';
        });

        // <input id="checkbutton1" type="checkbox" name="checkboxfield1" value="1" checked>
        var checkbox = document.createElement('input');
        checkbox.setAttribute('id', accType.getId());
        checkbox.setAttribute('name', accType.getId());
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('tabindex', 0);

        checkbox.value = trueValue.getCode();

        accValues.forEach(function (accValue) {
            // if this value is selected and represents "true" then check the checkbox
            if (accValue.isSelected() && accValue.getCode() == checkbox.value) {
                checkbox.checked = true;
            }
        });

        // check if accommodation is selectable and if it isn't then disable form element
        if (disabled) {
            checkbox.disabled = true;
        }

        // click events
        YUE.on(checkbox, 'click', function() {
            this.save();
        }.bind(this));

        return checkbox;
    };
    
    // render this accommodation as a series of checkboxes with logic for if combinations of values are possible
    Renderer.prototype.createCheckboxes = function (accType, disabled) {

        var accs = this._accs,
            form = this.getForm(),
            typeId = accType.getId();

        // figuring out what to do with the checkboxes when they are clicked
        function clickEvent(clickedCheckbox, clickedValue) {

            // get all the checkboxes for this type
            var checkboxes = form[typeId];

            // check if anything else else is selected
            if (!clickedCheckbox.checked) {
                var defaultValue = accType.getDefault();
                var defaultCheckbox = null;

                $(checkboxes).each(function(idx, checkbox) {
                    // keep track of default checkbox in case we need to select it
                    if (defaultValue.getCode() == checkbox.value) {
                        defaultCheckbox = checkbox;
                    }
                    // if there is something selected already then we can leave
                    if (checkbox.checked) {
                        return;
                    }
                });

                // if we got here nothing was checked so we check the default
                if (defaultCheckbox) {
                    defaultCheckbox.checked = true;
                }
                return;
            }

            $(checkboxes).each(function(idx, checkbox) {
                if (clickedValue.allowCombine()) {
                    // make sure no checkboxes that cannot be combined aren't checked
                    var accValue = accs.getValue(checkbox.value);
                    if (!accValue.allowCombine()) {
                        checkbox.checked = false;
                    }
                } else if (clickedCheckbox.value != checkbox.value) {
                    // deselect all checkboxes other than the selected one
                    checkbox.checked = false;
                }
            });

        };

        // add check boxes
        var accValues = accType.getValues(),
            $valueUl = $('<ul></ul>').addClass('values control'),
            isDisabled = !accType.isSelectable();

        accValues.forEach(function(accValue, i) {
            
            var $valueLi = $('<li></li>').addClass('value-option'),
                boxId = 'valueCb_' + typeId + '_' + i,
                $valueCb = $('<input />').addClass(accValue.allowCombine() ? 'allowCombine' : '').attr({
                    type: 'checkbox',
                    name: typeId,
                    id: boxId,
                    value: accValue.getCode()
                }).prop({
                    checked: accValue.isSelected() ? true : false,
                    disabled: disabled ? true : false
                }),
                $valueLabel = $('<label></label>')
                                .html(accValue.getLabel())
                                .addClass(isDisabled ? 'disabled' : '')                                        
                                .attr({
                                    'for': boxId
                                });

            // click events
            YUE.on($valueCb[0], 'click', function () {
                clickEvent($valueCb[0], accValue);
                this.save();
            }.bind(this));

            $valueLi.append($valueCb).append($valueLabel);
            $valueUl.append($valueLi);

        }.bind(this));

        return $valueUl[0];
    };

    // render this accommodation as dropdown select box
    Renderer.prototype.createDropdown = function (accType, disabled) {

        var accValues = accType.getValues();

        // create selectbox element
        var select = document.createElement('select');
        select.id = accType.getId();
        select.name = accType.getId();
        select.setAttribute('tabindex', 0);

        // check if accommodation supports multiple selections
        if (accType.isMultiSelect()) {
            select.setAttribute('multiple', 'multiple');
        }

        // add selectbox options
        var optIdx = 0;

        accValues.forEach(function (accValue) {

            if (accType.isMultiSelect()) {
                // skip this if the value name is "None" or the code represents none.
                if (accValue.getCode() == 'None' || accValue.getCode().indexOf('_None') != -1) {
                    return;
                }
            }

            var optionLabel = accValue.getLabel() || accValue.getCode();
            var optionValue = accValue.getCode();
            var option = select.options[optIdx] = new Option(optionLabel, optionValue);
            option.selected = accValue.isSelected();
            optIdx++;
        });

        // check if accommodation is selectable and if it isn't then disable form element
        if (disabled) {
            select.disabled = true;
        }

        // click events
        YUE.on(select, 'change', function () {
            this.save();
        }.bind(this));

        return select;
    };

    Renderer.prototype._saveType = function (accType) {

        var form = this.getForm();
        var accValues = accType.getValues();
        var ctrl = form[accType.getId()];

        // make sure form element was visible
        if (!ctrl) {
            return;
        }

        if (accType.isBoolSelect()) { // CHECKBOX
            var accValue = ctrl.checked ? accValues[1] : accValues[0];
            this._accs.selectCodes(accType.getName(), [accValue.getCode()]);
        }
        else if (accType.isMultiSelect()) { // SELECT MULTIPLE
            var selectedCodes = [];
            $(ctrl).each(function (idx, checkbox) {
                if (checkbox.checked) {
                    selectedCodes.push(checkbox.value);
                }
            });
            this._accs.selectCodes(accType.getName(), selectedCodes);
        }
        else { // SELECT SINGLE
            this._accs.selectCodes(accType.getName(), [ctrl.value]);
        }
    };

    // sync's the form values with the accommodation data structure
    Renderer.prototype.save = function() {
        this._accs.getTypes().forEach(this._saveType.bind(this));
    };

    return Renderer;

})();