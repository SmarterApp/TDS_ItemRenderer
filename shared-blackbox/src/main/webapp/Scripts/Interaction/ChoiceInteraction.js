/*
The choice interaction presents a set of choices to the candidate. 
The candidate's task is to select one or more of the choices, 
up to a maximum of maxChoices. There is no corresponding minimum 
number of choices. The interaction is always initialized with no 
choices selected. The choiceInteraction must be bound to a response 
variable with a baseType of identifier and single or multiple cardinality. 
*/
TDS.ChoiceInteraction = function(responseIdentifier)
{
    TDS.ChoiceInteraction.superclass.constructor.call(this, responseIdentifier);
    this._choices = []; // array of Choice objects
};

YAHOO.lang.extend(TDS.ChoiceInteraction, TDS.Interaction);

TDS.ChoiceInteraction.prototype.getChoices = function() { return this._choices; };

// get a specific choice by identifier
TDS.ChoiceInteraction.prototype.getChoice = function(identifier)
{
    for (var i = 0; i < this._choices.length; i++)
    {
        var choice = this._choices[i];
        if (identifier == choice.getIdentifier()) return choice;
    }

    return null;
};


TDS.ChoiceInteraction.prototype.removeChoice = function(choice)
{
    Util.Array.remove(this._choices, choice);
};

TDS.ChoiceInteraction.prototype.addChoice = function(choice)
{
    this._choices.push(choice);
};
