
//Extend base
TDS.Notes.DropDown = function(args){
    args = args || {};
    this.comments = args.DropComments || TDS.Comments || [];
    this.dom = args.dom;
    this.type = TDS.Notes.Types.DropDown;
};
YAHOO.lang.extend(TDS.Notes.DropDown, TDS.Notes.Base);
     
TDS.Notes.DropDown.prototype.serialize = function(){
    return this.note.value; 
};

TDS.Notes.DropDown.prototype.unserialize = function(response){
    if(typeof response != 'string'){return;}
    return (this.note.value = response); 
};

TDS.Notes.DropDown.prototype.create = function()
{   
    // create select box
    var selectBox = document.createElement('select');
        selectBox.className = 'comment-input comment-selectbox';

    // add the comments array to the dropdown
    for(var i = 0; i < this.comments.length; ++i){
        var commentLine = this.comments[i];
        var option = document.createElement('option');
        option.text  = commentLine;
        option.value = commentLine;
        selectBox.appendChild(option);
    }
    
    document.getElementById('note_container_' + this.dom.id).appendChild(selectBox);
    this.note = selectBox;

    // set the first value of comments to be the current state
    if (this.comments.length > 0) {
        this.saveState(this.comments[0]);
    }

    return selectBox;
};
