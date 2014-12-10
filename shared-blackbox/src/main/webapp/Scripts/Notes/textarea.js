TDS.Notes.TextArea = function(args){
    args = args || {};
    this.dom = args.dom;
    this.type = TDS.Notes.Types.TextArea;
};
YAHOO.lang.extend(TDS.Notes.TextArea, TDS.Notes.Base);

TDS.Notes.TextArea.prototype.serialize = function(){
    return this.note.value;
};

TDS.Notes.TextArea.prototype.unserialize = function(response){
    if(typeof response != 'string'){return;}
    //Might need to at least detect the type and handle any json
    return (this.note.value = response);
};

TDS.Notes.TextArea.prototype.create = function()
{
    var ta = document.createElement('textarea');
        ta.className = 'comment-input comment-textbox';
        ta.rows = 4;
        YAHOO.util.Dom.setStyle(ta, 'resize', 'none');
    document.getElementById('note_container_' + this.dom.id).appendChild(ta);
    this.note = ta;
    return this.note;
};


TDS.Notes.TextArea.prototype.unfocus = function()
{
  if(this.note){
      this.note.unfocus();
  }
}

TDS.Notes.TextArea.prototype.focus = function()
{
    if(this.note){
        this.note.focus();
    }
};
