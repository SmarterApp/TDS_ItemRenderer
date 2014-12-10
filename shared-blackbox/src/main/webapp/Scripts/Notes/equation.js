//Depends on MathJax and the equation editor code.

TDS.Notes.Equation = function(args){    
    args = args || {};
    this.dom = args.dom;
    this.type = TDS.Notes.Types.Equation;
};
YAHOO.lang.extend(TDS.Notes.Equation, TDS.Notes.Base);

TDS.Notes.Equation.prototype.serialize = function(){
    TDS.Notes.Debug && console.log("What save callback exists here?");
    return this.note.serializeSettings();
};

TDS.Notes.Equation.prototype.unserialize = function(response){
    if(!response){return;}
    if(typeof response == 'string'){
        response = JSON.parse(response);
    }
    TDS.Notes.Debug && console.log("What is in the response?", response);
    if(this.note && response){
      this.note.remove();
      response.containerId = 'note_container_' + this.dom.id;
      this.note = new MathJax.Editor.Widget(response);

    }
    return true;
};

TDS.Notes.Equation.prototype.create = function(){
  //By default does not actually want to create without the config to
  //tell us what it should look like (could create with no build?)
  this.note = new MathJax.Editor.Widget({
    containerId: 'note_container_' + this.dom.id,
    RestrictKeysToContent: true,
    tabs: true,
    tabConfig: {
      Order: ['Algebra', 'Basic']
    }
  });
};

