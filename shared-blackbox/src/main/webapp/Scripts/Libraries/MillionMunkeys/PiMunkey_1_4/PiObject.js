// Constructor
PiObject = function(o){
	
	// private variables
	// var this = this; // This is required, because of an ECMAScript bug, you can't use 'this' in an inner function.
	this.properties = [];
	var values = {};
	this.length = this.properties.length;
	this.listeners = {};
	this.filters = {};
	this.globalListeners = [];
	this.globalFilters = [];
	var uuid = null;
	var uid = -1; // This is for generating unique property names.
	
	// Public Functions (w/ access to private variables)
	this.getUUID = function() {
		if (uuid == null) {
			var my = {};
			my.date = new Date();
			my.uuid = [];
			my.uuid.push(my.date.getFullYear().toString());
			my.uuid.push(my.date.getMonth().toString());
			my.uuid.push(my.date.getDate().toString());
			my.uuid.push(my.date.getTime().toString());
			uuid = my.uuid.join("");
		}
		return uuid;
	}
	
	/* GET */
	
	// Returns the total number of properties of this object.
	this.getLength = function() {
		return this.properties.length;
	}
	
	// Find the property name associated with a given index.
	this.getProperty = function(index) {
		if (index.constructor != Number) // string
			return index.replace(/^\s*(\S*)\s*$/,'$1');
		else if (index >= 0 && index < this.getLength())
			return this.properties[index];
		else
			return '';
	}
	
	// Converts property names to their numeric positions in the Array.
	this.getIndex = function(propertyName) {
		// Lookup by property name
		if (propertyName.constructor != Number) {
			for (var i=0; i < this.getLength(); i++)
				if (this.properties[i] == propertyName)
					return i;
		}
		// If not a property name, try treating it as a number.
		var num = parseInt(propertyName);
		if (propertyName == num && num >= 0 && num < this.getLength())
			return num;
		else
			return -1; // not found
	}
	
	// Without Argument: Returns a list of all of the property names of this object.
	// With Argument: Returns a list of values that match the given property name for each child object contained within this object.
	this.getPropertyList = function(propertyName) {
		if (propertyName) {
			var value;
			var propertyList = [];
			for (var i=0; i<this.properties.length; i++) {
				value = values[this.properties[i]];
				if (value instanceof PiObject)
					propertyList.push( value.get(propertyName).toString() );
				else if (value instanceof Object) // Also works for Arrays
					propertyList.push( value[propertyName] || '' );
				else
					propertyList.push('');
			}
			return propertyList.join();
		}
		else {
			// Convert to a string so that we pass a copy of the array, instead of a reference to it.
			return this.properties.join();
		}
	}
	
	// Returns the value of a property, or the empty string if not found.
	this.get = function(property) {
		var my = {};
		// Get property name from index, if numeric
		property = this.getProperty(property);
		// Get value from 'values' collection
		// CAUTION: You have to use typeof here, so that values of zero are not ignored.
		if (typeof values[property] != "undefined")
			my.result = values[property]
		else
			my.result = "";
		// Apply filters
		my.filters = this.filters[property] || [];
		my.filters = my.filters.concat(this.globalFilters);
		for (var i=0; i < my.filters.length; i++) {
			my.returnVariable = my.filters[i].method.call(my.filters[i].scope,this,property,my.result);
			if (my.returnVariable != undefined)
				my.result = my.returnVariable;
		}
		// Return result
		return my.result;
	}
	
	this.exists = function(property) {
		// Get property name from index, if numeric
		property = this.getProperty(property);
		// Check existance
		if (property.length && this.getIndex(property) >= 0)
			return true;
		else
			return false;
	}
	
	/* SET */
	
	// A function for direct assignment of properties, singly or in bulk.
	this.set = function(propertyName,value) {
		var o = {};
		// Convert arguments into an object
		if (propertyName != undefined) {
			if (propertyName.constructor == Object)
				o = propertyName;
			else
				o[this.getProperty(propertyName)] = value;
		}
		// Process collection of name/value pairs.
		var my = {};
		for (my.name in o) {
			my.index = my.name;
			// Named Property
			if (my.name.constructor == Number) // Numeric
				my.name = this.getProperty(my.name);
			// Old Value
			my.oldValue = values[my.name] || "";
			// Add New Property?
			if (this.getIndex(my.index) < 0) {
				uid++;
				this.properties.push(my.name);
				this.length = this.properties.length;
			}
			// New Value
			my.newValue = o[my.name];
			values[my.name] = my.newValue;
			// Property Listeners
			my.listeners = this.listeners[my.name] || [];
			my.listeners = my.listeners.concat(this.globalListeners);
			for (var i=0; i < my.listeners.length; i++) {
				my.result = my.listeners[i].method.call(my.listeners[i].scope,this,my.index,my.oldValue,my.newValue);
				if (my.result != undefined && my.result != my.newValue) { // If no change, don't do a set, so we dont mess up deletes.
					my.newValue = my.result;
					values[my.name] = my.newValue;
				}
			}
		}
		// If it's only a single set, return it as a convenience, to avoid "object.set(property,value); value = object.get(object.length);"  This replaces that with "value = object.set(property,value);"  We will only do this for the set operation with two arguments.  We will not do this when you pass a collection of properties (even if there is only one).
		if (propertyName != undefined && propertyName.constructor != Object)
			return this.get(my.name); // Allow chaining
		else
			return this; // Allow chaining
	}
	
	// Insert values in the middle of the PiComponent's Array.
	this.insertAt = function(i) {
		var my = {};
		var o = {};
		my.index = this.getIndex(i);
		for (var i=1; i < arguments.length; i++) {
			my.prop = (++uid).toString();
			if (my.index >= 0)
				this.properties.splice(my.index++,0,my.prop);
			else
				this.properties.push(my.prop);
			this.length = this.properties.length;
			o[my.prop] = arguments[i];
		}
		return this.set(o); // Allow chaining
	}
	
	// Adds values to the end of a PiObject like an Array.
	this.add = function() {
		var my = {};
		var o = {};
		for (var i=0; i < arguments.length; i++) {
			my.prop = (++uid).toString();
			this.properties.push(my.prop);
			this.length = this.properties.length;
			o[my.prop] = arguments[i];
		}
		return this.set(o); // Allow chaining
	}
	this.append = this.add;
	
	/* MOVE */
	
	// A special class of function that doesn't change the value of the property, but just reorders it, according to Array syntax.
	// TO DO: I'm not sure if this should fire listeners.  The value is not changing, only it's location in the property array.
	// So far, my only use is within a listener, to reorder new items after they are added.  I'm going to wait and see if I ever have to listen for this action before I fire any listeners in reaction to this function.
	// Adding listeners here could profoundly change the game.  With a move, you must always check that the oldValue != newValue, which seems like a lot of extra code to use for every listener.
	// Adding listeners here could profoundly change the game, since it is not an oldValue vs. newValue issue, but an oldIndex vs. newIndex issue.  My gut tells me that this doesn't fire any listeners.  Any designer using the move command should follow that up with the code in reaction to that move.
	this.move = function(oldName,newName) {
		var my = {};
		// Allows the use of negative indexes.
		// Make sure that if property names are used, they are converted into numerical indexes.
		my.oldIndex = this.getIndex(oldName);
		if (my.oldIndex < 0)
			throw "index does not exist";
		if (my.oldIndex < -this.properties.length || my.oldIndex > this.properties.length)
			throw "index does not exist";
		// Make sure that if newIndex is a property it is converted into a numerical index.
		my.newIndex = this.getIndex(newName);
		if (my.newIndex < 0) {
			if (typeof(oldName) == "string") // name change only
				my.newIndex = my.oldIndex;
			else // position change
				my.newIndex = this.properties.length; // Treat like an add operation
		}
		// In case the designer is passing variables that just happend to evaluate to the same number, don't waste time on fake moves.
		if (my.oldIndex != my.newIndex) { // process position change
			my.prop = this.properties.splice(my.oldIndex,1)[0];
			if (my.newIndex < 0)
				my.newIndex++; // We need to shift negative indexes after removing an element, because they are not zero-based.
			if (my.newIndex >= this.properties.length)
				this.properties.push(my.prop);
			else
				this.properties.splice(my.newIndex,0,my.prop);
		}
		if (typeof(oldName) == "string" && typeof(newName) == "string") { // process name change
			// If overwriting an existing element, fire the remove listeners, which will remove the old name.
			this.remove(newName);
			// Get index again, in case remove shifted our location
			this.properties[this.getIndex(oldName)] = newName;
			values[newName] = values[oldName];
			delete values[oldName];
		}
		return this; // Allow chaining
	}
	
	/* DELETE */
	
	// Removes the specified properties from the object.
	this.remove = function() {
		var my = {};
		var o = {};
		for (var i=0; i < arguments.length; i++) {
			// translate indexes into property names
			my.prop = this.getProperty(arguments[i]);
			// new value is empty string when calling listeners
			if (values[my.prop] != undefined)
				o[my.prop] = "";
		}
		this.set(o); // Let set call the listeners
		for (my.prop in o) {
			// get numeric index
			my.index = this.getIndex(my.prop);
			// check if delete has been overridden by a listener
			if (values[my.prop].length == 0) {
				delete values[my.prop]; // remove value
				this.properties.splice(my.index,1); // remove property
				this.length = this.properties.length;
			}
		}
		return this; // Allow chaining
	}

    //renamed this var from delete to deleteIt because conflicts with IE 
	this.deleteIt = this.remove; // alias
	
	// WARNING: The point of this function is to clean out a PiObject, so it will ignore any listeners that restore values, and delete them anyway!!!
	this.removeAll = function() {
		for (var i=0; i < this.length; i++) {
			// Let set call the listeners
			this.set(i,"");
		}
		// But ignore any restored values, and delete all
		for (var i in values)
			delete values[i];
		delete this.properties;
		this.properties = [];
		this.length=this.properties.length; // Do it this way, just to be sure.
		return this; // Allow chaining
	}
	this.deleteAll = this.removeAll // alias
	
	/* FUNCTIONS */
	
	// The core function for adding filters and listeners.
	var addFunction = function(type,action,property,scope,method,applyToExisting) {
		var my = {};
		
		/* Error-Check Parameters */
		
		// Allow for assigning to multiple properties at once.
		// Multiple named properties can be supplied through a list of names, e.g. "prop1,prop3,prop5", or an array of names, e.g. ["prop1","prop3","prop4"].
		// Multiple indexes must be supplied through an array of indexes, e.g. [1,3,5], or else they will be assumed to be names, e.g. "1,3,5" == ["1","3","5"].
		// You can mix named and numbered properties through using an array, e.g. ["prop1",3,"prop5"].
		if (typeof(property) == "string")
			property = property.split(",");
		
		// If property not supplied, shift arguments to the right.
		if (property == undefined || property.constructor != Array) {
			applyToExisting = method;
			method = scope;
			scope = property;
			property = [""];
		}
		// If direct reference to a function, shift arguments to the right.
		if (typeof(scope) == "function") {
			applyToExisting = method;
			method = scope;
			scope = this;
		}
		else if (typeof(method) == "string") {
			method = scope[method];
		}
		// Set default applyToExisting parameter
		if (applyToExisting == undefined || typeof(applyToExisting) != "boolean")
			applyToExisting = true;
		// Error Checking
		if (typeof(scope) != "object")
			throw("The scope parameter supplied to the " + action + type + "() function was not of type 'object'.");
		if (typeof(method) != "function")
			throw("The method parameter supplied to the " + action + type + "() function was not of type 'function'.");
		if (property.constructor != Array)
			throw("The property parameter supplied to the " + action + type + "() function must be either of type 'string' or 'array'.");
		if (typeof(applyToExisting) != "boolean")
			throw("The applyToExisting parameter supplied to the " + action + type + "() function was not of type 'boolean'.");
		
		// NOTE: The following will still only be executed once for global listeners/filters
		for (my.index=0; my.index<property.length; my.index++) {
			
			// Get named property, if index provided
			my.property = this.getProperty(property[my.index]);
			
			/* Add function */
			
			if (my.property.length) { // Property
				if (type == "Listener") {
					if (action == "add")
						this.listeners[my.property] = this.listeners[my.property] || [];
					my.functions = this.listeners[my.property];
				} else {
					if (action == "add")
						this.filters[my.property] = this.filters[my.property] || [];
					my.functions = this.filters[my.property];
				}
			} else { // Global
				if (type == "Listener")
					my.functions = this.globalListeners;
				else
					my.functions = this.globalFilters
			}
			if (my.functions != undefined) { // only undefined if remove action
				my.alreadyExists = false;
				for (var i=my.functions.length-1; i >= 0; i--) {
					if (my.functions[i].method == method && my.functions[i].scope === scope) { // Do an exact match on scope
						if (action == "add")
							my.alreadyExists = true;
						else if (action == "remove")
							my.functions.splice(i,1); // do remove
						break;
					}
				}
				/* 
				 NOTE: I had considered applying to existing, even if it already exists, 
				 but only if the stored applyToExisting was false.  But we don't know 
				 enough.  It could have been stored, the value changed, and the function 
				 applied, but it still says applyToExisting is false.  We could update it 
				 when the function is fired, but what if it's global, then we have to track
				 What parameters it's been fired for.  Too difficult.  Keeping it simple. 
				*/ 
				if (action == "add" && !my.alreadyExists) {
					my.functions.push({
						'property':my.property,
						'scope':scope,
						'method':method,
						'applyToExisting':applyToExisting
					});
					if (type == "Listener" && applyToExisting) {
						if (my.property.length)
							my.properties = [my.property];
						else
							my.properties = this.properties;
						for (var i=0; i < my.properties.length; i++) {
							if (values[my.properties[i]] != undefined) {
								my.result = method.call(scope,this,my.properties[i],"",values[my.properties[i]]);
								if (my.result != undefined)
									values[my.properties[i]] = my.result;
							}
						}
					}
				}
			}
			
		}
		return this; // Allow chaining
	}
	
	// Adds a listener function to either the entire object as a whole, or a specific property within the object.  
	// NOTE: You may add a listener to property even if the property doesn't exist yet.  It will be fired when the property is added to the object.
	this.addListener = function(property,scope,method,applyToExisting) {
		return addFunction.call(this,"Listener","add",property,scope,method,applyToExisting);
	}
	// Removes a listener function from either the entire object, or from a specific property within the object.
	this.removeListener = function(property,scope,method) {
		return addFunction.call(this,"Listener","remove",property,scope,method);
	}
	
	// Adds a filter function to either the entire object as a whole, or a specific property within the object.
	this.addFilter = function(property,scope,method) {
		return addFunction.call(this,"Filter","add",property,scope,method);
	}
	// Removes a filter function from either the entire object, or from a specific property within the object.
	this.removeFilter = function(property,scope,method) {
		return addFunction.call(this,"Filter","remove",property,scope,method);
	}
	
	// Iterates over all values in the object and executes the passed-in function.
	// This function was implemented such that execution is not broken, even if the function deletes items in the PiObject.
	// If no value is returned by the method, then execution continues, but if any value is returned, the loop is broken and the value is returned to the caller.
	this.each = function(scope,method) {
		// If direct reference to a function, shift arguments to the right.
		if (typeof(scope) == "function") {
			method = scope;
			scope = this;
		}
		else if (typeof(method) == "string") {
			method = scope[method];
		}
		// Error Checking
		if (typeof(scope) != "object")
			throw("The scope parameter supplied to the each() function was not of type 'object'.");
		if (typeof(method) != "function")
			throw("The method parameter supplied to the each() function was not of type 'function'.");
		// Use propertyList, so that if the function deletes items within the object, we don't care about shifting.
		var propertyList = this.getPropertyList().split(',');
		// Iterate over properties
		for (var i=0; i<propertyList.length; i++) {
			// Make sure that the property hasn't been deleted by a previous iteration.
			if (typeof(values[propertyList[i]]) != "undefined") {
				// CAUTION: The temptation here is to pass index as the second argument, instead of property.
				// However, if you do this, deleting items in the collection will break execution!
				// That's why we use property instead, plus for consistency so it exactly matches Filter functions.
				var result = method.call(scope,this,propertyList[i],values[propertyList[i]]);
				if (result != undefined) {
					return result; // returning a value breaks the loop.
				}
			}
		}
	}
	
	/* INITIALIZATION - Do This Last! */
	
	// Initialize Object
	this.init(o);
	
	/* End of Life */
	this.destroy = function() {
		delete this.properties;
		for (var prop in values)
			delete values[prop];
		// delete values; // You cannot delete local variables!
		delete this.length;
		for (var prop in this.listeners)
			for (var i in this.listeners[prop])
				delete this.listeners[prop][i];
		delete this.listeners;
		for (var prop in this.filters)
			for (var i in this.filters[prop])
				delete this.filters[prop][i];
		delete this.filters;
		for (var i in this.globalListeners)
			delete this.globalListeners[i];
		delete this.globalListeners;
		for (var i in this.globalFilters)
			delete this.globalFilters[i];
		delete this.globalFilters;
		// delete uuid; // You cannot delete local variables!
		// delete uid; // You cannot delete local variables!
	}
	
	/* DEBUG OUTPUT FUNCTIONS - These really shouldn't be used in regular code. */
	
	this.getValues = function(){
		// copy top-level items by value, and lower-level items by reference.
		var copy = {};
		for (var prop in values)
			copy[prop] = values[prop];
		return copy;
	}

};

// Public Functions (w/o access to private variables)
PiObject.prototype.init = function(o) {
	if (o instanceof Array)
		this.add.apply(this,o);
	else
		this.set.apply(this,arguments);
}

// Simplified Alias
Pi = PiObject;

// Static Functions (w/o access to private variables)
Pi.extend=function(constructor) {
	var parent = this;
	constructor = constructor || function(){
		//this.parent = this.parent || parent.prototype; // Check for existance first, so you don't overwrite a child!!!
		parent.prototype.constructor.apply(this,arguments);
	};
	constructor.parent = parent.prototype;
	constructor.extend = PiObject.extend;
	constructor.prototype = new parent();
	constructor.prototype.constructor = constructor;
	return constructor;
}
