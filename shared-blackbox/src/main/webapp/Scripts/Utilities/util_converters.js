Util.Converters = {};

Util.Converters.parseBoolean = function(value) {
	if (YAHOO.util.Lang.isNull(value)) return null;
	if (YAHOO.util.Lang.isBoolean(value)) return value;
	if (YAHOO.util.Lang.isString(value)) {
		return value.toLowerCase() === 'true';
	} else {
		return null;
	}
};

Util.Converters.parseInt = function(value) {
	if (YAHOO.util.Lang.isNull(value)) return null;
	if (YAHOO.util.Lang.isNumber(value)) return value;
	if (YAHOO.util.Lang.isString(value)) {
		return value * 1;
	} else {
		return null;
	}
};