Util.Number = function() { };

// parse string into number
Util.Number.parse = function(str)
{
    return parseInt(str, 10);
};

// Limits this number between two bounds.
Util.Number.limit = function(num, min, max)
{
    return Math.min(max, Math.max(min, num));
};

// Returns the passed parameter as a Number, or null if not a number.
Util.Number.from = function(item)
{
    var number = parseFloat(item);
    return isFinite(number) ? number : null;
};