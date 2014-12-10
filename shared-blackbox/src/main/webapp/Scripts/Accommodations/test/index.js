QUnit.config.reorder = false;

QUnit.testDone(function () {

});

/*
createType(name, label, isVisible, isSelectable, allowChange, studentControl, dependsOn)
createValue(code, name, label, isDefault, allowCombine)
addDependency(ifType, ifValue, thenType, thenValue, isDefault)
*/

// create sample data
function createAccs() {
    var numTypes = 6;
    var accs = new Accommodations();
    for (var i = 1; i < numTypes + 1; i++) {
        var typeName = 't' + i;
        var typeObj = accs.createType(typeName, null, true, true, true, false);
        for(var j = 1; j < i + 1; j++) {
            var valueCode = typeName + 'v' + j;
            typeObj.createValue(valueCode, null, null, j == 0, false);
        }
    }
    return accs;
}

function createAccsSelected() {
    var accs = createAccs();
    accs.selectCodes('t1', 't1v1');
    accs.selectCodes('t3', 't3v2');
    accs.selectCodes('t4', 't4v4');
    accs.getType('t5').createValue('t5v6&t5v7', null, null, true, true);
    accs.selectCodes('t5', 't5v6&t5v7');
    return accs;
}

test('createType()', function () {

    var accs = new Accommodations();
    var accType = accs.createType('test', 'label', true, true, true, false);
    ok(accs.hasType('test'));
    equal(accType, accs.getType('test'), 'Get the type we created');
    equal(accType.getName(), 'test', 'Check if name was set');
    equal(accType.getLabel(), 'label', 'Check if label was set');
    equal(accType.getValues().length, 0, 'Values should be empty');
    equal(accType.getSelected().length, 0, 'Selected should be empty');
    equal(accType.isVisible(), false, 'False because there are no values');
    equal(accType.isBoolSelect(), false);
    equal(accType.isMultiSelect(), false);
});

test('createValue()', function () {

    var accs = new Accommodations();
    var t1 = accs.createType('type1', 'Type1', true, true, true, false);
    var v1 = t1.createValue('value1', 'Value1', null, true, false);
    var v2 = t1.createValue('value2', 'Value2', null, false, false);

    ok(accs.hasValue('value1'));
    ok(accs.hasValue('value2'));
    equal(v1, accs.getValue('value1'));
    equal(v2, accs.getValue('value2'));
    equal(v1.getCode(), 'value1', 'Check if code was set');
    equal(v1.getCodes().length, 1, 'Only one code');
    equal(v1.getCodes()[0], 'value1', 'Code should be same as getCode()');
    equal(v1.getName(), 'Value1', 'Check if name was set');
    equal(v1.isActive(), true, 'Value should be available');
    equal(v1.isDefault(), true, 'Should be default');
    equal(v1.isSelected(), false, 'Should not be selected');

    equal(t1.getValues().length, 2, 'Should be two values');
    equal(t1.getSelected().length, 0, 'Should be nothing selected yet');

});

test('findCode()', function () {

    var accs = new Accommodations();
    var t1 = accs.createType('type1', 'Type1', true, true, true, false);
    var v1 = t1.createValue('value1', 'Value1', null, true, false);
    var v2 = t1.createValue('value2', 'Value2', null, false, false);
    var v3 = t1.createValue('value3&value4', 'Value3', null, false, false);

    var found = accs.findCode('type1', 'value1');
    ok(found);

    found = accs.findCode('type1', 'value2', true);
    ok(!found);

    v2.select();
    found = accs.findCode('type1', 'value2', true);
    ok(found);

    found = accs.findCode('type1', 'value4');
    ok(found);

    v3.select();
    found = accs.findCode('type1', 'value4', true);
    ok(found);

});

test('value1&value2&value3', function () {

    var accs = new Accommodations();
    var t1 = accs.createType('type1', 'Type1', true, true, true, false);
    var v1 = t1.createValue('value1&value2&value3', 'Value1', null, true, true);
    equal(v1.getCode(), 'value1&value2&value3');
    equal(v1.getCodes().length, 3);
    equal(v1.getCodes()[0], 'value1');
    equal(v1.getCodes()[1], 'value2');
    equal(v1.getCodes()[2], 'value3');

});

///////////////////////////////////////////////////////////////////////////////

module('Selection');

test('select()', function () {

    var accs = new Accommodations();
    var t1 = accs.createType('type1', 'Type1', true, true, true, false);
    var v1 = t1.createValue('value1', 'Value1', null, true, false);
    var v2 = t1.createValue('value2', 'Value2', null, false, false);
    var v3 = t1.createValue('value3', 'Value3', null, false, false);

    // select value 1
    v1.select();
    equal(v1.isSelected(), true);
    equal(v2.isSelected(), false);
    equal(v3.isSelected(), false);

    // select value 2 which should automatically deselect value 1
    v2.select();
    equal(v1.isSelected(), false);
    equal(v2.isSelected(), true);
    equal(v3.isSelected(), false);

    // deselect value 2
    v2.deselect();
    equal(v1.isSelected(), false);
    equal(v2.isSelected(), false);
    equal(v3.isSelected(), false);

});

test('selectCodes()', function () {

    var accs = new Accommodations();
    var t1 = accs.createType('type1', 'Type1', true, true, true, false);
    var v1 = t1.createValue('value1', 'Value1', null, true, false);
    var v2 = t1.createValue('value2', 'Value2', null, false, false);
    var v3 = t1.createValue('value3', 'Value3', null, false, false);

    accs.selectCodes('type1', 'value1');
    equal(v1.isSelected(), true);
    equal(v2.isSelected(), false);
    equal(v3.isSelected(), false);

    accs.selectCodes('type1', ['value2']);
    equal(v1.isSelected(), false);
    equal(v2.isSelected(), true);
    equal(v3.isSelected(), false);

    accs.selectCodes('type1', ['value1', 'value3']);
    equal(v1.isSelected(), false);
    equal(v2.isSelected(), false);
    equal(v3.isSelected(), true);

});

test('selectDefaults()', function () {

    var accs = createAccs();
    accs.selectDefaults();

    var t3Selected = accs.getType('t3').getSelected();
    equal(t3Selected.length, 1);
    equal(t3Selected[0].getCode(), 't3v1');

});

test('Value allowCombine = true', function () {

    var accs = new Accommodations();
    var t1 = accs.createType('type1', 'Type1', true, true, true, false);
    var v1 = t1.createValue('value1', 'Value1', null, true, true);
    var v2 = t1.createValue('value2', 'Value2', null, false, true);
    var v3 = t1.createValue('value3', 'Value3', null, false, true);

    // select value 1
    v1.select();
    equal(v1.isSelected(), true);
    equal(v2.isSelected(), false);
    equal(v3.isSelected(), false);

    // select value 3
    v3.select();
    equal(v1.isSelected(), true);
    equal(v2.isSelected(), false);
    equal(v3.isSelected(), true);

});

// select all the acc values
test('selectAll()', function () {

    var accs = createAccs();

    accs.selectAll();
    var selected = accs.getType('t4').getSelected();
    equal(selected.length, 1, 'Allow combine is false');
    equal(selected[0], accs.getValue('t4v4'), 'Last value gets selected');

    accs.getValue('t4v1').setCombinable(true);
    accs.getValue('t4v2').setCombinable(true);
    accs.getValue('t4v3').setCombinable(true);
    accs.getValue('t4v4').setCombinable(true);

    accs.selectAll();
    selected = accs.getType('t4').getSelected();
    equal(selected.length, 4, 'Allow combine is true for all');

});

test('getSelectedEncoded()', function() {
    var accs = createAccsSelected();
    var encoded = accs.getSelectedEncoded();
    var decoded = decodeURIComponent(encoded);
    equal(decoded, 't1=t1v1&t3=t3v2&t4=t4v4&t5=t5v6%26t5v7');
});

test('getSelectedDelimited()', function () {
    var accs = createAccsSelected();
    var delimited = accs.getSelectedDelimited();
    equal(delimited, 't1v1;t3v2;t4v4;t5v6&t5v7');
});

test('getSelectedJson()', function () {
    var accs = createAccsSelected();
    var selectedJson = accs.getSelectedJson();
    var comparisonJson = [{ "type": "t1", "codes": ["t1v1"] }, { "type": "t3", "codes": ["t3v2"] }, { "type": "t4", "codes": ["t4v4"] }, { "type": "t5", "codes": ["t5v6&t5v7"] }];
    deepEqual(selectedJson, comparisonJson);
});

test('clone(), importJson(), exportJson()', function () {
    var accs = createAccsSelected();
    var accs2 = accs.clone(); // this does a export and then import
    deepEqual(accs.exportJson(), accs2.exportJson());
});

test('unionWith()', function () {
    var accs1 = createAccsSelected();
    var accs2 = new Accommodations();

    // create existing type with selection
    var t3 = accs2.createType('t3', null, true, true, true, false);
    var t3v1 = t3.createValue('t3v1', null, null, false, false);
    t3v1.select(); // <-- in accs1 t3v2 is selected

    // create existing type with no selection (but the current type has one)
    var t4 = accs2.createType('t4', null, true, true, true, false);
    var t4v4 = t4.createValue('t4v4', null, null, false, false);

    // create value that does not exist in accs1
    var t5 = accs2.createType('t5', null, true, true, true, false);
    var t5v8 = t5.createValue('t5v8', null, null, false, false);

    // create type that does not exist in accs1
    var t7 = accs2.createType('t7', null, true, true, true, false);
    var t7v1 = t7.createValue('t7v1', null, null, false, false);

    // merge accs2 into accs1
    accs1.unionWith(accs2);

    ok(accs1.getValue('t3v1').isSelected(), 't4v1 is selected, but this is a bug');
    ok(accs1.getValue('t3v2').isSelected(), 't4v2 should be selected');
    ok(!accs1.getValue('t4v4').isSelected(), 't4v4 should not be selected');
    ok(accs1.getValue('t5v8'), 't5v8 should of been merged into existing type');
    ok(accs1.getValue('t7v1'), 't7v1 should of created a new type');

});

test('replaceWith()', function() {

    var accs1 = createAccs();
    var accs2 = new Accommodations();
    var t3 = accs2.createType('t3', null, true, true, true, false);
    var t4 = accs2.createType('t4', null, true, true, true, false);
    var t4v1 = t4.createValue('t4v1', null, null, false, false);
    var t4v2 = t4.createValue('t4v2', null, null, false, false);
    t4v2.select();

    equal(accs1.getType('t3').getValues().length, 3);
    equal(accs1.getType('t3').getSelected().length, 0);
    accs1.replaceWith(accs2);
    equal(accs1.getType('t3').getValues().length, 0);
    equal(accs2.getType('t4').getValues().length, 2);
    equal(accs2.getType('t4').getSelected().length, 1);

});

///////////////////////////////////////////////////////////////////////////////

module('Dependencies');

test('Selection basic', function () {

    var accs = createAccs();
    var t3 = accs.getType('t3');
    
    equal(t3.getValues().length, 3, 'Should be 4 values');

    // add dependencies
    accs.addDependency('t2', 't2v2', 't3', 't3v3', true);
    accs.addDependency('t2', 't2v2', 't3', 't3v4');
    equal(t3.getValues().length, 3, 'Should still be 4 values');

    // select value 1
    accs.selectCodes('t2', ['t2v2']);
    equal(t3.getValues().length, 3, 'Even when depencencies match should be 4 values');

    // set depends on tool which will trigger filtering
    t3.setDependsOnTool('t2');
    equal(t3.getValues().length, 1, 'Now it is filtered 2 values');

    // try and select a value that was filtered
    accs.selectCodes('t3', ['t3v1']);
    equal(t3.getSelected().length, 0, 'Selection should of been rejected');

    // select all the defaults
    accs.selectDefaults();

    // debugger;
});

test('Selection rejected', function () {

    var accs = createAccs();

    accs.addDependency('t1', 't1v2', 't3', 't3v3', true);
    accs.addDependency('t1', 't1v2', 't3', 't3v4');

    var t3 = accs.getType('t3');
    t3.setDependsOnTool('t1');

    accs.selectCodes('t1', ['t1v2']);
    accs.selectCodes('t3', ['t3v1']);
    equal(t3.getSelected().length, 0, 'Selection should of been rejected');

});

test('Selecting defaults', function () {

    var accs = createAccs();

    accs.addDependency('t1', 't1v1', 't3', 't3v3', true);
    accs.addDependency('t1', 't1v1', 't3', 't3v4');

    var t3 = accs.getType('t3');
    t3.setDependsOnTool('t1');

    accs.selectDefaults();

    equal(t3.getSelected().length, 1);

});

// test out multiple dependencies
test('Use value restrict()', function () {

    var accs = createAccs();

    // restrict the type 't3' to the codes 't3v3' and 't3v4'
    var v1 = accs.getValue('t1v1');
    v1.restrict('t3', 't3v3', true);
    v1.restrict('t3', 't3v4');
    accs.selectDefaults();

    var t3 = accs.getType('t3');
    equal(t3.getSelected().length, 1);
    equal(t3.getSelected()[0], 't3v3');

});

/*
test('Use value dependsOn()', function () {

    var accs = createAccs();

    accs.getValue('t3v3').depends('t1', 't1v1', true);
    accs.getValue('t3v4').depends('t1', 't1v1');
    accs.selectDefaults();

    var v1 = accs.getType('t1');
    equal(v1.getSelected().length, 1);
    equal(v1.getSelected()[0], 't3v3');

});
*/

