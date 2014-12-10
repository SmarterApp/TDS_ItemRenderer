/**
 *  These functions can "sanitize" some forms of mathml to make it easier to grade, simply pass a 
 *  widget into the funtion you want patched, or alternatively just run sanitizeMath:
 *
 *  This is _not_ included by standard editors, and is only really used inside the math-server branch
 */
//For the index.html page
Equation = {
  MaxRender: 8,
  MaxProcess: 50,
  Data: [],
  ToParse: [],
  Fixed: {},
  MathServer: null, //Actual resource reference
  fixMathStyle: function(w){ //Ensure mstyle => single mrow => all graded content
    var editors = w.getEditors();
    for(var i=0; i<editors.length; ++i){
      var ed    = editors[i];
      var root  = ed.getEqRoot();
      var style = ed.getStyleRow();
      var mrow  = ed.getBaseMrow() || ed.createMrow(style);
      if(!style){return;}

      if(style.data[0]){
        var mrowTest = style.data[0];
        if(mrowTest.type == 'mrow' && mrowTest.data.length > 1){
           
          if(mrowTest.spanID != mrow.spanID){
             var merge = mrowTest.data.splice(1, 1 + mrowTest.data.length-1);
             for(var k = 0; k < merge.length; ++k){
               var mn = merge[k];
                   mn.parent = mrow;
               mrow.data.push(mn);
             } 
          }
        }
      }
      
      var actualBase = root.data[0];
      if(actualBase.data.length > 1){
        var styleSave = [];
        var rip       = [];
        var ab        = actualBase.data;
        
        for(var j=0; j < ab.length; ++j){
          var node = ab[j];
          if(node.type == 'mstyle'){
              styleSave =[node];
          }else if(node){ 
            node.parent = mrow;
            mrow.data.push(node);
          }
        }
        root.data = styleSave;
      }
    }
  },
  fixBadCounts: function(w){ //Fixes instance where an msup, fraction has an empty mrow on top or bot
    var editors = w.getEditors();
    for(var i=0; i<editors.length; ++i){
      var ed = editors[i];
      var mrow = ed.getBaseMrow();
      var util = ed.getUtil();
      util.dfs(mrow, {msup: true, mfrac: true}, function(mn, types){
         if(mn && types[mn.type]){ 
           if(mn.data.length == 1){
             var p = mn.parent;

             var index = util.findSpanIndex(p, mn.spanID)
             var rep = mn.data[0];
                 rep.parent = p;
             p.data[index] = rep;
           }else{
              util.dfs(mn, {mrow: true}, function(mn, types){
                if(mn && types[mn.type]){
                  if(mn.data.length == 0){
                     mn.data.push(ed.getUtil().parseTeX("1"));
                  }
                }
              });
           }
         }
      });
    }
  },
  fixEmptyMRow: function(w){ //Remove excess empty mrows
    var editors = w.getEditors();
    for(var i=0; i<editors.length; ++i){
      var ed = editors[i];
      var mrow = ed.getBaseMrow();
      var util = ed.getUtil();
      util.dfs(mrow, {mrow: true}, function(mn, types){
        if(mn && types[mn.type]){
          if(mn.data.length == 0) {
            if(mn.parent.type != 'mrow'){
               mn.data.push(ed.getUtil().parseTeX("1"));
            }else{
              util.removeMath(mn);
            }
          }
        }
      });
    }
  },
  fixNumericMsup: function(w){ //UI looks like {12.3}^2, but is 12.{3}^2 in mathml, make it {12.3}^2
    var editors = w.getEditors();
    for(var i=0; i<editors.length; ++i){
      var ed = editors[i];
      var mrow = ed.getBaseMrow();
      var util = ed.getUtil();
      console.log("Um... what?", util);

      util.dfs(mrow, {msup: true}, function(mn, types){
        if(mn && types[mn.type]){ 
          console.log("msup id = ", mn.spanID, types);

          if(mn.data && mn.data[0].type == 'mn'){
            var target = mn.data[0];
            var p      = mn.parent;
            var spanIndex = util.findSpanIndex(p, mn.spanID);
            if(spanIndex>0){
              var testMn = p.data[spanIndex-1];
              var row = ed.selectNumbers(testMn);

              if(row && (util.isNumeric(row) || util.isDot(row))){
                util.removeMath(row);
                row = util.createMrow(mn, row);
              }
              if(row && row.type == 'mrow'){
                util.removeMath(row);
                row.parent = mn;
                mn.data[0] = row;
                row.data.push(target);
                target.parent = row;
              }
            }
          }
        }
      });
    }
  },
  sanitizeMath: function(w){
    Equation.fixMathStyle(w); 
    Equation.fixEmptyMRow(w);
    Equation.fixBadCounts(w);
    Equation.fixNumericMsup(w);
  }
};

