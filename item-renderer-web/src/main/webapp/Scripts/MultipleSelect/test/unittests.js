//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
var MS = TDS.MultipleSelect;
var MSRenderer = TDS.MultipleSelect.Renderer;

function createMS(minChoices, maxChoices) {
    var ms = new MS('test', minChoices, maxChoices);
    ms.createOption('A', 'Here is option A');
    ms.createOption('B', 'Here is option B');
    ms.createOption('C', 'Here is option C');
    ms.createOption('D', 'Here is option D');
    return ms;
}

test('Create empty object', function () {
    var ms = createMS();
    equal(ms.options.length, 4);
    equal(ms.selectedOptions.length, 0);
});

test('Create options and select them', function () {

    var ms = createMS(0, 2);

    // make sure nothing is selected
    equal(ms.options.length, 4); // 1
    equal(ms.selectedOptions.length, 0); //2

    // select option A
    ok(ms.select('A')); // 3
    ms.selectedOptions = null;
    equal(ms.selectedOptions.length, 1); // 4
    equal(ms.selectedOptions[0].key, 'A'); // 5

    // select option B
    ok(ms.select('B')); // 6
    equal(ms.selectedOptions.length, 2); // 7
    equal(ms.selectedOptions[0].key, 'A');
    equal(ms.selectedOptions[1].key, 'B');

    // select option B again which should deselect it
    ok(ms.select('B'));
    equal(ms.selectedOptions.length, 1);
    equal(ms.selectedOptions[0].key, 'A');

    // select option B and C.. because maxChoices is 2 then option C won't be selected
    ok(ms.select('B'));
    ok(!ms.select('C'));
    equal(ms.selectedOptions.length, 2);
    equal(ms.selectedOptions[0].key, 'A');
    equal(ms.selectedOptions[1].key, 'B');

});

test('Multiple Select with single constraint in multiple mode', function () {

    // create MS with max constraint of 1 and then multiple mode
    var ms = createMS(0, 1);
    ms.mode = MS.Mode.Multiple;

    // select option A
    ok(ms.select('A'));
    equal(ms.selectedOptions.length, 1);
    equal(ms.selectedOptions[0].key, 'A');

    // selecting option A again will deselect it
    ok(ms.select('A'));
    equal(ms.selectedOptions.length, 0);

    // select option A and then option B which should deselect option A
    ok(ms.select('A'));
    ok(ms.select('B'));
    equal(ms.selectedOptions.length, 1);
    equal(ms.selectedOptions[0].key, 'B');

});

test('Multiple Choice', function () {

    // create MS with max constraint of 1 and then multiple mode
    var ms = createMS(0, 1);
    ms.mode = MS.Mode.Single;

    // select option A
    ok(ms.select('A'));
    equal(ms.selectedOptions.length, 1);
    equal(ms.selectedOptions[0].key, 'A');

    // selecting option A again will be rejected
    ok(!ms.select('A'));
    equal(ms.selectedOptions.length, 1);

    // select option B which should deselect option A
    ok(ms.select('B'));
    equal(ms.selectedOptions.length, 1);
    equal(ms.selectedOptions[0].key, 'B');

});

test('Events', function () {

    // create MS with max constraint of 1 and then multiple mode
    var ms = createMS();

    var count = 0;
    ms.options.forEach(function(option) {
        option.on('selected', function () {
            count++;
        });
        option.on('deselected', function () {
            count--;
        });
    });

    // select option A and check event
    ok(ms.select('A'));
    ok(ms.select('B'));
    ok(ms.select('C'));
    ok(ms.deselect('B'));
    equal(count, 2);

});

test('Rendering', function () {

    var containerEl = document.createElement('div');
    document.body.appendChild(containerEl);

    // create MS with max constraint of 2 and select option A before rendering
    var ms = createMS(0, 2);
    ms.select('A');

    // render html
    var renderer = new MSRenderer(ms);
    renderer.render(containerEl);

    // check for container elements
    equal($('.optionContainer', containerEl).length, 4);
    equal($('.optionContainer.optionSelected', containerEl).length, 1);
    equal($('.optionA input', containerEl).prop('checked'), true);

    // make sure each option element was rendered
    ms.options.forEach(function(option) {
        equal($('.option' + option.key, containerEl).length, 1);
    });

    // remove div
    document.body.removeChild(containerEl);

});

test('Rendering MS Logic', function () {

    var containerEl = document.createElement('div');
    document.body.appendChild(containerEl);

    // create MS with max constraint of 2 and select option A before rendering
    var ms = createMS(0, 2);

    // render html
    var renderer = new MSRenderer(ms);
    renderer.render(containerEl);

    // select B and check if element is checked
    ms.select('A');
    equal($('.optionContainer.optionSelected', containerEl).length, 1);
    equal(ms.getOption('A').selected, true);
    equal($('.optionA input', containerEl).prop('checked'), true);

    // click on checkbox B
    $('.optionB input').trigger('click');
    equal(ms.selectedOptions.length, 2);
    equal(ms.getOption('B').selected, true);
    equal($('.optionB input', containerEl).prop('checked'), true);

    // click on checkbox C which should be rejected
    $('.optionC input').trigger('click');
    equal(ms.selectedOptions.length, 2);
    equal(ms.getOption('C').selected, false);
    equal($('.optionC input', containerEl).prop('checked'), false);

    // remove div
    document.body.removeChild(containerEl);

});

test('Rendering MC Logic', function () {

    var containerEl = document.createElement('div');
    document.body.appendChild(containerEl);

    // create MS with max constraint of 1
    var ms = createMS(0, 1);

    // render html
    var renderer = new MSRenderer(ms);
    renderer.render(containerEl);

    // select A and then B which should deselect A
    ok(ms.select('A'));
    ok(ms.select('B'));
    equal($('.optionContainer.optionSelected', containerEl).length, 1);
    equal($('.optionA input', containerEl).prop('checked'), false);
    equal($('.optionB input', containerEl).prop('checked'), true);

    // click on radio button C which should deselect B
    $('.optionC input').trigger('click');
    equal($('.optionContainer.optionSelected', containerEl).length, 1);
    equal($('.optionB input', containerEl).prop('checked'), false);
    equal($('.optionC input', containerEl).prop('checked'), true);

    // remove div
    document.body.removeChild(containerEl);

});

