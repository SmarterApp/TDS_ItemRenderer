//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
"undefined"==typeof MeasurementTool&&(MeasurementTool={});MeasurementTool.Set=PiObject.extend();
MeasurementTool.Set.prototype.init=function(b){b=this.set("config",b||{});this.addListener("config",this.defaultConfig);MeasurementTool.Set.parent.init.apply(this,arguments);var c=this.exists("children")?this.get("children"):this.set("children",new PiObject);this.addListener("children",this.initCollection);c.addListener(this,this.transformChildren,!1);c=this.exists("transforms")?this.get("transforms"):this.set("transforms",new PiObject);c.addListener(this,this.defineTransform);c.addListener(this,
this.transform);this.addFilter("transform",this.getTransform);this.addFilter("transforms",this.getPosition);this.addFilter("transforms",this.getRotation);this.addFilter("dragHandleAttributes",this.getDragHandleAttributes);this.addListener("canvas",this.addSet);this.addFilter("offset",this.getOffset);this.addListener("scale",this.setScale);this.addListener("visibility",this.setVisibility);this.addListener("visibility",this.resetTransforms)};
MeasurementTool.Set.prototype.defaultConfig=function(b,c,d,a){this.removeListener(c,this.defaultConfig);a="object"==typeof a?a:{};a.visibility=a.visibility||"visible"};MeasurementTool.Set.prototype.initCollection=function(b,c,d,a){if(""!=a&&(a.constructor==Array||a.constructor==Object))return new PiObject(a)};MeasurementTool.Set.prototype.setVisibility=function(){this.exists("set")&&("hidden"==this.get("visibility")?this.get("set").hide():this.get("set").show())};
MeasurementTool.Set.prototype.resetTransforms=function(b,c,d,a){"hidden"==a&&(this.get("transforms").removeAll(),this.transform(),this.setVisibility(this,"visibility","",this.get("visibility")))};MeasurementTool.Set.prototype.setScale=function(b,c,d,a){""!=d&&""==a&&this.get("transforms").remove("scale");""!=a&&this.get("transforms").set("scale",{scale:a})};
MeasurementTool.Set.prototype.defineTransform=function(b,c,d,a){if(""!=a){switch(c){case "rotation":a.type=a.type||"r";break;case "translation":a.type=a.type||"t";break;case "scale":a.type=a.type||"s"}switch(a.type){case "r":case "R":case "rotate":case "rotation":"object"!=typeof a&&(a={type:"r",angle:+a});a.svg=a.type.charAt(0);a.type="rotation";a.css="rotate";a.angle=a.angle||0;a.x="undefined"!=typeof a.x?a.x:this.exists("center")?+this.get("center").x:this.exists("width")?this.get("width")/2:0;
a.y="undefined"!=typeof a.y?a.y:this.exists("center")?+this.get("center").y:this.exists("height")?this.get("height")/2:0;a.h=Math.sqrt(Math.pow(a.x,2)+Math.pow(a.y,2));break;case "t":case "T":case "translate":case "translation":a.svg=a.type.charAt(0);a.type="translation";a.css="translate";a.x="undefined"!=typeof a.x?a.x:0;a.y="undefined"!=typeof a.y?a.y:0;break;case "s":case "S":case "scale":a.svg=a.type.charAt(0),a.type="scale",a.css="scale",a.scale="undefined"!=typeof a.scale?a.scale:1}}};
MeasurementTool.Set.prototype.getPosition=function(b,c,d){d.exists("translation")||d.set("translation",{x:this.exists("x")?this.get("x"):this.exists("width")&&this.exists("canvas")?this.get("canvas").get("width")/2-this.get("width")/2:0,y:this.exists("y")?this.get("y"):this.exists("height")&&this.exists("canvas")?this.get("canvas").get("height")/2-this.get("height")/2:0})};MeasurementTool.Set.prototype.getRotation=function(b,c,d){d.exists("rotation")||d.set("rotation",{angle:this.get("rotation")})};
MeasurementTool.Set.prototype.getDragHandleAttributes=function(b,c,d){this.removeFilter(c,this.getDragHandleAttributes);if(""==d)return this.set(c,{stroke:"none",fill:"#00F","fill-opacity":0})};MeasurementTool.Set.prototype.addSet=function(b,c,d,a){this.exists("set")||(this.set("set",a instanceof PiObject?a.get("canvas").set():a.set()),this.transform(),this.setVisibility(this,"visibility","",this.get("visibility")))};MeasurementTool.Set.prototype.getOffset=function(){if(this.exists("canvas"))return this.get("canvas").get("offset")};
MeasurementTool.Set.prototype.getTransform=function(){var b=[];this.get("transforms").each(function(c,d,a){if(""!=a)switch(a.type){case "rotation":b.push([a.svg,a.angle,a.x,a.y].join(" "));break;case "translation":b.push([a.svg,a.x,a.y].join(" "));break;case "scale":b.push([a.svg,a.scale].join(" "))}});return b.join(" ")};
MeasurementTool.Set.prototype.transformChildren=function(b,c,d,a){""!=d&&d instanceof PiObject&&d.removeFilter("transform",this,this.addParentTransform);""!=a&&a instanceof PiObject&&a.addFilter("transform",this,this.addParentTransform)};MeasurementTool.Set.prototype.addParentTransform=function(b,c,d){return[this.get("transform"),d].join(" ")};
MeasurementTool.Set.prototype.transform=function(){if(this.exists("set")){var b=this.get("set");b.transform&&b.transform(this.get("transform"));this.get("children").each(function(b,d,a){a.transform&&a.transform()})}};MeasurementTool.Set.prototype.translation=function(){var b;return{drag:function(c,d){this.get("transforms").set("translation",{x:b.x+c,y:b.y+d})},start:function(){b=this.get("transforms").get("translation")},stop:function(){}}}();
MeasurementTool.Set.prototype.rotation=function(){var b;return{drag:function(c,d,a,e){var g=this.get("offset"),c=this.get("transforms"),f=c.get("translation"),d=c.get("rotation"),a=Raphael.angle(a,e,g.x+d.x+f.x,g.y+d.y+f.y),e=a-b;-180>e?e+=360:180<e&&(e-=360);b=a;d.angle+=e;c.set("rotation",d)},start:function(c,d){var a=this.get("offset"),e=this.get("transforms"),g=e.get("translation"),e=e.get("rotation");b=Raphael.angle(c,d,a.x+e.x+g.x,a.y+e.y+g.y)},stop:function(){}}}();
"undefined"==typeof MeasurementTool&&(MeasurementTool={});MeasurementTool.Canvas=MeasurementTool.Set.extend();MeasurementTool.Canvas.prototype.init=function(b){b=b||{};b.window=b.window||window;MeasurementTool.Canvas.parent.init.apply(this,arguments);this.addListener("window",this.initRaphael);this.addFilter("node",this.createNode);this.addListener("node",this.initNode)};
MeasurementTool.Canvas.prototype.defaultConfig=function(b,c,d,a){MeasurementTool.Canvas.parent.defaultConfig.apply(this,arguments);a.width=a.width||620;a.height=a.height||420;a.r=a.r||0;a.stroke=a.stroke||"none";a.fill=a.fill||"none";a.scale=a.scale||1};MeasurementTool.Canvas.prototype.initRaphael=function(b,c,d,a){Raphael.setWindow(a)};
MeasurementTool.Canvas.prototype.createNode=function(b,c,d){b=this.get("window").document;if(b.body&&(this.removeFilter(c,this.createNode),""==d)){d=b.createElement("div");d.id=this.get("id");var c=this.exists("parent")?this.get("parent"):b.body,b=c.getBoundingClientRect(),a=this.get("width"),e=this.get("height");c.appendChild(d);d.style.cssText=["position:absolute","width:"+a,"height:"+e].join(";");this.exists("x")||this.set("x",b.left+b.width/2-a/2);this.exists("y")||this.set("y",b.top+b.height/
2-e/2);d.style.visibility=this.exists("visibility")?this.get("visibility"):"visible";this.set("node",d)}};
MeasurementTool.Canvas.prototype.initNode=function(b,c,d,a){"string"==typeof a?a=Raphael._g.doc.getElementById(this.set("id",a)):this.set("id",a.id);a.ownerDocument&&(a.ownerDocument!=Raphael._g.doc&&a.ownerDocument.defaultView)&&Raphael.setWindow(a.ownerDocument.defaultView);if(a.childNodes)for(;a.hasChildNodes();){if("IMG"==a.firstChild.tagName){var e=a.firstChild.src;"/"!=e.charAt(0)&&-1==e.indexOf("://")&&(b=window.document.location.href,c=b.split("/").pop(),b=c.indexOf(".")?b.substr(0,b.length-
c.length):b,"/"!=b.charAt(b.length-1)&&(b+="/"),e=b+e);e={type:"image",src:e,width:this.get("width"),height:this.get("height"),x:0,y:0};for(b=0;b<a.firstChild.attributes.length;b++)switch(a.firstChild.attributes[b].name){case "width":if(c=+a.firstChild.attributes[b].value)e.width=c,e.x=(this.get("width")-c)/2;break;case "height":if(c=+a.firstChild.attributes[b].value)e.height=c,e.y=(this.get("height")-c)/2}}a.removeChild(a.firstChild)}this.set("raphael",Raphael);this.set("canvas",Raphael(a,this.get("width"),
this.get("height")));this.addListener("r",this.outline,!1);this.addListener("stroke",this.outline,!1);this.addListener("fill",this.outline,!1);this.outline();e&&this.get("children").insertAt(0,e);this.addFilter("transformProperty",this.getTransformProperty);this.addFilter("transformMatrix",this.getTransformMatrix);this.get("children").addListener(this,this.initChildren);this.addListener("x",this.moveNode);this.addListener("y",this.moveNode);return a};
MeasurementTool.Canvas.prototype.moveNode=function(b,c,d,a){if(this.exists("node"))switch(c){case "x":this.get("node").style.left=a+"px";break;case "y":this.get("node").style.top=a+"px"}};MeasurementTool.Canvas.prototype.resetTransforms=function(b,c,d,a){MeasurementTool.Canvas.parent.resetTransforms.apply(this,arguments)};MeasurementTool.Canvas.prototype.getPosition=function(b,c,d){d.exists("translation")||d.set("translation",{x:0,y:0})};
MeasurementTool.Canvas.prototype.getOffset=function(b,c,d){if(this.exists("node")){var d=this.get("node"),b=this.get("height"),c=this.get("width"),a=d.getBoundingClientRect(),d=this.get("raphael").getOffset(d);if(a.height!=b||a.width!=c){var e=this.get("transformMatrix");d.x=d.x+(a.right-a.left)/2-c/2-e.e;d.y=d.y+(a.bottom-a.top)/2-b/2-e.f}return d}};MeasurementTool.Canvas.prototype.setVisibility=function(){this.exists("node")&&(this.get("node").style.visibility=this.get("visibility"))};
MeasurementTool.Canvas.prototype.getTransformProperty=function(b,c,d){for(var b=this.get("node"),a="transform WebkitTransform msTransform MozTransform OTransform filters".split(" "),e=0;e<a.length&&!(d=a[e],"undefined"!=typeof b.style[d]);e++);if("filters"!=d||"undefined"!=typeof document.body.filters)return this.removeFilter(c,this.getTransformProperty),this.set(c,d)};
MeasurementTool.Canvas.prototype.getTransformMatrix=function(b,c,d){d=Raphael.matrix(1,0,0,1,0,0);this.get("transforms").each(this,function(a,b,c){""!=c&&d.split();switch(c.type){case "rotation":if(c.angle%360){var b=this.get("raphael"),f=this.get("scale"),a=(c.x-this.get("width")/2)*f,f=(c.y-this.get("height")/2)*f,i;i=Math.sqrt(Math.pow(a,2)+Math.pow(f,2));b=b.rad(b.angle(c.x,c.y,this.get("width")/2,this.get("height")/2)+c.angle);d.translate(a-i*Math.cos(b),f-i*Math.sin(b))}d.rotate(c.angle);break;
case "translation":d.translate(c.x,c.y);break;case "scale":d.scale(c.scale)}});return d};
MeasurementTool.Canvas.prototype.transform=function(){if(this.exists("node")&&this.exists("canvas")){var b=this.get("node");this.get("transforms");var c=this.get("transformProperty"),d=this.get("transformMatrix");if(this.exists("scale")){var a=this.get("scale");b.setAttribute("width",a*this.get("width"));b.setAttribute("height",a*this.get("height"));var e=this.get("canvas").canvas;e.setAttribute("width",a*this.get("width"));e.setAttribute("height",a*this.get("height"));this.get("children").each(function(a,
b,c){c.transform&&c.transform()})}"filters"==c?(b=b.filters.item("DXImageTransform.Microsoft.Matrix"),b.M11=d[0][0],b.M12=d[0][1],b.M21=d[1][0],b.M22=d[1][1]):null!=b.style[c]&&(b.style[c]=d.toString())}};MeasurementTool.Canvas.prototype.initChildren=function(b,c,d,a){if(d!=a&&(""!=d&&(d instanceof MeasurementTool.Set?d.remove("canvas"):d.remove()),""!=a)){var e;a instanceof MeasurementTool.Set?e=a.set({canvas:this}).get("set"):a.paper||(e=this.get("canvas").add(a.constructor==Array?a:[a]));this.get("set").push(e)}};
MeasurementTool.Canvas.prototype.outline=function(b,c,d,a){this.exists("outline")?(b=this.get("outline"),b[c]=a,this.get("children").set(0,b)):(c=this.get("config"),c.type="rect",this.get("children").insertAt(0,this.set("outline",c)))};MeasurementTool.Canvas.prototype.translation=function(){var b,c;return{drag:function(d,a){this.set("x",b+d);this.set("y",c+a)},start:function(){b=this.get("x");c=this.get("y")},stop:function(){}}}();"undefined"==typeof MeasurementTool&&(MeasurementTool={});
MeasurementTool.StraightLine=MeasurementTool.Set.extend();MeasurementTool.StraightLine.prototype.init=function(b){MeasurementTool.StraightLine.parent.init.apply(this,arguments);this.set("lines",new PiObject).addListener(MeasurementTool.StraightLine.prototype.removeLine);this.addListener("set",this.addPencil);this.transform()};
MeasurementTool.StraightLine.prototype.defaultConfig=function(b,c,d,a){a.width=a.width||18;a.height=a.height||62;a.origin={x:a.width/2,y:a.height};MeasurementTool.StraightLine.parent.defaultConfig.apply(this,arguments)};
MeasurementTool.StraightLine.prototype.setVisibility=function(b,c,d,a){if(this.exists("canvas")){var e=this.get("canvas").get("canvas").canvas;if("hidden"==a)e.style.cursor="inherit",e.onmousemove=null,this.get("set").hide();else{var g=this;e.onmousemove=function(a){var b=e.getBoundingClientRect();g.get("transforms").set("translation",{x:a.clientX-b.left-15,y:a.clientY-b.top-(g.get("height")-5)});g.get("set").show()};e.style.cursor="none"}}};
MeasurementTool.StraightLine.prototype.getRotation=function(b,c,d){var a=this.get("origin");d.exists("rotation")||d.set("rotation",{type:"rotation",angle:30,x:a.x,y:a.y});MeasurementTool.StraightLine.parent.getRotation.apply(this,arguments)};
MeasurementTool.StraightLine.prototype.addPencil=function(b,c,d,a){var e,g,f=this.get("canvas").get("canvas"),b=this.get("width"),c=this.get("height"),i;a.push(this.get("children").set("pencil",f.set([f.rect(0,0,18,20,7).attr({fill:"#DB4652","stroke-miterlimit":"10",stroke:"#C1272D"}),f.rect(0,17,18,32).attr({fill:"#FBB03B"}),f.rect(5.5,17.5,9,32).attr({fill:"#F2B96D",stroke:"#D68A25","stroke-miterlimit":"10"}),f.rect(0.5,8.5,17,5).attr({fill:"#E6E6E6",stroke:"#B3B3B3","stroke-miterlimit":"10"}),
f.rect(0.5,12.5,17,5).attr({fill:"#E6E6E6",stroke:"#B3B3B3","stroke-miterlimit":"10"}),f.path("M0,49 l9,13 l9,-13 Z").attr({fill:"#C7B299"}),f.path("M6,58 l6,0 l-3,4 z").attr({fill:"#000"}),f.rect(0,0,b,c).attr(this.get("dragHandleAttributes"))]).drag(function(){var a=this.get("origin"),b=this.get("transforms").get("translation"),a=["M",e,g,"L",a.x+b.x,a.y+b.y].join(" ");i?i.attr("path",a):this.get("lines").add(i=f.path(a))},function(){var a=this.get("origin"),b=this.get("transforms").get("translation");
e=a.x+b.x;g=a.y+b.y},function(){i&&(i=null)},this,this,this)))};MeasurementTool.StraightLine.prototype.removeLine=function(b,c,d){""!=d&&d.remove()};"undefined"==typeof MeasurementTool&&(MeasurementTool={});MeasurementTool.Ruler=MeasurementTool.Canvas.extend();
MeasurementTool.Ruler.prototype.init=function(b){MeasurementTool.Ruler.parent.init.apply(this,arguments);this.addListener("set",this.addOutline);this.addListener("set",this.addTickMarks);this.addListener("set",this.addLabel);this.addListener("set",this.addDragHandles);this.get("node");this.transform()};
MeasurementTool.Ruler.prototype.defaultConfig=function(b,c,d,a){a.origin=a.origin||{x:0,y:0};a.stroke=a.stroke||"#000";a["font-size"]=a["font-size"]||"10pt";a["line-height"]=parseInt(a["font-size"]);a.type=a.type||"rect";a.cursor=a.cursor||"move";a.thickness=a.thickness||a.height||5*a["line-height"];a.height=a.height||a.thickness;a.width=a.length?a.length:a.parent?0.6*a.parent.offsetWidth:400;MeasurementTool.Ruler.parent.defaultConfig.apply(this,arguments)};
MeasurementTool.Ruler.prototype.getRotation=function(b,c,d){MeasurementTool.Ruler.parent.getRotation.apply(this,arguments);d.exists("left_rotation")||d.set("left_rotation",{type:"rotation",angle:0,x:this.get("width"),y:0});d.exists("right_rotation")||d.set("right_rotation",{type:"rotation",angle:0,x:0,y:0})};MeasurementTool.Ruler.prototype.addOutline=function(){var b=this.get("canvas");this.get("children").set("outline",b.rect(0,0,this.get("width"),this.get("height")).attr({stroke:this.get("stroke")}))};
MeasurementTool.Ruler.prototype.addTickMarks=function(){var b=this.get("canvas"),c=this.get("config"),d=this.get("system"),a=b.set();c.max=Math.ceil(c.max)||10;c.min=Math.floor(c.min)||0;var e=Math.abs(c.max)>Math.abs(c.min)?Math.abs(c.max):Math.abs(c.min),g=c.max-c.min,f=b.text(10,10,e+"W").attr({opacity:0}),e=Math.ceil(f[0].getComputedTextLength()*(g+1)/c.width),i=c.width/(g/e),m=c["line-height"];f.remove();var k=this.get("origin");k.y>=c.height&&(m=-m);var l=k.y+5*m/2;if("metric"==d){if(2>=e)f=
2;else if(2<e&&5>=e)f=e=5;else{for(e=10*Math.ceil(e/10);e<g-10&&g%e;)e+=10;f=10}i=c.width/(g/e)}else f=Math.min(4,e);for(var g=0,j,n,o;c.min+g*e<=c.max;g++){line=b.path("M"+i*g+","+k.y+"v"+2*m);a.push(line);if(1==e)if("metric"==d)for(j=1;10>j;j++)n=i*g+j*i/10,h=1.5,j%5&&(h-=0.5),n<c.width&&a.push(b.path("M"+n+","+k.y+"v"+m*h));else for(j=1;8>j;j++)n=i*g+j*i/8,h=2,j%8&&(h-=0.5),j%4&&(h-=0.5),j%2&&(h-=0.5),n<c.width&&a.push(b.path("M"+n+","+k.y+"v"+m*h));else for(j=1;j<f;j++)n=i*g+j*i/f,n<c.width&&
a.push(b.path("M"+n+","+k.y+"v"+3*m/2));j=b.text(i*g,l,c.min+e*g);n=parseInt(j.attr("x"));o=j[0].getComputedTextLength()/2;0>n-o?j.attr("x",o+c["line-height"]/4):n+o>c.width&&j.attr("x",c.width-o-c["line-height"]/4);a.push(j)}this.get("children").set("tickmarks",a)};
MeasurementTool.Ruler.prototype.addDragHandles=function(){var b=this.get("canvas"),c=this.get("config"),d=this.get("children"),a=this.get("origin").y;a>=c.height-c.thickness&&(a=c.height-c.thickness);d.add(b.rect(0,a,c.width,c.thickness).attr(this.get("dragHandleAttributes")).attr({cursor:"move"}).drag(this.translation.drag,this.translation.start,this.translation.stop,this,this,this));d.add(b.set([b.rect(0,a,c.thickness,c.thickness).attr(this.get("dragHandleAttributes"))]).attr({cursor:"rotate"}).drag(function(a,
b,c,d){this.rotation.drag.apply(this,arguments)},function(a,b,c){this.rotation.start.apply(this,arguments)},function(a,b,c){this.rotation.start.apply(this,arguments)},this,this,this));d.add(b.set([b.rect(c.width-c.thickness,a,c.thickness,c.thickness).attr(this.get("dragHandleAttributes"))]).attr({cursor:"rotate"}).drag(function(a,b,c,d){this.rotation.drag.apply(this,arguments)},function(a,b,c){this.rotation.start.apply(this,arguments)},function(a,b,c){this.rotation.start.apply(this,arguments)},this,
this,this))};MeasurementTool.Ruler.prototype.addLabel=function(){var b=this.get("canvas");this.exists("label")&&this.get("children").set("label",b.text(this.get("width")/2,this.get("height")-this.get("line-height"),this.get("label")))};"undefined"==typeof MeasurementTool&&(MeasurementTool={});MeasurementTool.Protractor=MeasurementTool.Ruler.extend();MeasurementTool.Protractor.prototype.init=function(b){MeasurementTool.Protractor.parent.init.apply(this,arguments)};
MeasurementTool.Protractor.prototype.defaultConfig=function(b,c,d,a){a.min=a.min||-5;a.max=a.max||5;MeasurementTool.Protractor.parent.defaultConfig.apply(this,arguments);a.thickness=a.height;a.height=a.width/2+a.thickness;a.origin={x:a.width/2,y:a.width/2};a.outline=a.stroke;delete a.stroke};
MeasurementTool.Protractor.prototype.getRotation=function(b,c,d){this.get("width");var a=this.get("origin");d.exists("rotation")||d.set("rotation",{type:"rotation",angle:0,x:a.x,y:a.y});MeasurementTool.Ruler.parent.getRotation.apply(this,arguments)};
MeasurementTool.Protractor.prototype.addOutline=function(b,c,d,a){var b=this.get("canvas"),c=+this.get("width"),e=+this.get("height"),d=+this.get("thickness"),g=this.get("outline"),f=c/2,e=e-d,b=b.set([b.rect(0,c/2,c,d).attr({stroke:g}),b.path(["M",0,c/2,"A",f,f,0,1,1,c,e,"Z"].join(" ")).attr({stroke:g})]);a.push(this.get("children").set("outline",b))};
MeasurementTool.Protractor.prototype.addTickMarks=function(b,c,d,a){MeasurementTool.Protractor.parent.addTickMarks.apply(this,arguments);for(var e=this.get("canvas"),g=this.get("raphael"),f=this.get("config"),i=e.set(),m=f.width/2,k=f.width/2,l,j,n,o=1;180>o;o++)l=g.rad(-o),j=f.width/2*Math.cos(l),l=f.width/2*Math.sin(l),n=[],0==o%10?(n.push("M",m+0.1*j,k+0.1*l,"L",m+0.7*j,k+0.7*l,"M",m+0.9*j,k+0.9*l,"L",m+j,k+l),i.push(e.text(m+0.75*j,k+0.75*l,o).transform("R"+(-o+90))),i.push(e.text(m+0.85*j,k+
0.85*l,180-o).transform("R"+(-o+90)))):0==o%5?n.push("M",m+0.95*j,k+0.95*l,"L",m+j,k+l):n.push("M",m+0.975*j,k+0.975*l,"L",m+j,k+l),i.push(e.path(n.join(" ")).attr({stroke:f.outline}));a.push(this.get("children").set("tickmarks",i))};
MeasurementTool.Protractor.prototype.addDragHandles=function(b,c,d,a){var b=this.get("canvas"),e=+this.get("width"),g=+this.get("height"),c=+this.get("thickness");this.get("config");var d=this.get("children"),f=g-c,i=e/2;a.push(d.set("rotate",b.set([b.rect(0,f,2*i,c),b.path(["M",0,f,"A",i,i,0,0,1,e,f,"Z"].join(" "))]).attr(this.get("dragHandleAttributes")).attr({cursor:"rotate"}).drag(this.rotation.drag,this.rotation.start,this.rotation.stop,this,this,this)));f=e-c;g-=c;e=e/2-c;a.push(d.set("drag",
b.set([b.rect(c,g,2*e,c),b.path(["M",c,g,"A",e,e,0,0,1,f,g,"Z"].join(" "))]).attr(this.get("dragHandleAttributes")).attr({cursor:"move"}).drag(this.translation.drag,this.translation.start,this.translation.stop,this,this,this)))};"undefined"==typeof MeasurementTool&&(MeasurementTool={});MeasurementTool.Compass=MeasurementTool.Set.extend();
MeasurementTool.Compass.prototype.init=function(b){MeasurementTool.Compass.parent.init.apply(this,arguments);this.set("arcs",new PiObject).addListener(MeasurementTool.Compass.prototype.removeArc);this.addListener("set",this.addPivotArm);this.addListener("set",this.addPencilArm);this.addListener("set",this.addPencil);this.addListener("set",this.addHandle)};
MeasurementTool.Compass.prototype.defaultConfig=function(b,c,d,a){a.angle=a.angle||0;a.radius=a.radius||16;a.width=a.width||32;a.height=a.height||220;a.center={x:8,y:220};a.joint={x:24,y:67};MeasurementTool.Compass.parent.defaultConfig.apply(this,arguments)};
MeasurementTool.Compass.prototype.setVisibility=function(b,c,d,a){"hidden"==a&&this.set({angle:0,radius:16}).get("children").each(function(a,b,c){c.get("transforms").remove("translation","rotation")});MeasurementTool.Compass.parent.setVisibility.apply(this,arguments)};
MeasurementTool.Compass.prototype.addHandle=function(b,c,d,a){b=this.get("canvas").get("canvas");a.push(this.get("children").set("handle",new MeasurementTool.Set({set:b.set([b.rect(13.5,20,5,10).attr({fill:"#808285",stroke:"#6D6E71","stroke-miterlimit":"10"}),b.rect(11,0,10,20).attr({fill:"#D1D3D4",stroke:"#808285","stroke-miterlimit":"10"}),b.rect(0,25,32,50,6).attr({fill:"#808285",stroke:"#6D6E71","stroke-miterlimit":"10"}),b.path("M12.5,44 l7,0 l3,6 l-3,6 l-7,0 l-3,-6 z").attr({fill:"#F1F2F2",
stroke:"#BCBEC0","stroke-miterlimit":"10"}),b.circle(16,50,2.33).attr({fill:"#F1F2F2",stroke:"#BCBEC0","stroke-miterlimit":"10"})]).attr({cursor:"move"}).drag(this.rotation.drag,this.rotation.start,this.rotation.stop,this,this,this)})).get("set"))};
MeasurementTool.Compass.prototype.addPivotArm=function(b,c,d,a){b=this.get("canvas").get("canvas");a.push(this.get("children").set("pivot_arm",new MeasurementTool.Set({rotation:0,center:{x:8,y:220},set:b.set([b.path("M7,205 l2,0 l-1,15 z").attr({fill:"none",stroke:"#BCBEC0","stroke-miterlimit":"10"}),b.rect(3,65,10,140).attr({fill:"#D1D3D4",stroke:"#808285","stroke-miterlimit":"10"}),b.circle(8,195,7).attr({fill:"#F1F2F2",stroke:"#BCBEC0","stroke-miterlimit":"10"}),b.circle(8,195,2.5).attr({fill:"#F1F2F2",
stroke:"#BCBEC0","stroke-miterlimit":"10"}),b.rect(-3,65,22,155).attr(this.get("dragHandleAttributes"))]).attr({cursor:"move"}).drag(function(a,b,c,d){this.translation.drag.apply(this,arguments)},function(a,b,c){this.translation.start.apply(this,arguments)},function(a,b,c){this.translation.stop.apply(this,arguments)},this,this,this)})).get("set"))};
MeasurementTool.Compass.prototype.addPencilArm=function(b,c,d,a){var e,b=this.get("canvas").get("canvas");a.push(this.get("children").set("pencil_arm",new MeasurementTool.Set({rotation:0,center:{x:24,y:67},set:b.set([b.rect(19,65,10,100).attr({fill:"#D1D3D4",stroke:"#808285","stroke-miterlimit":"10"}),b.rect(13,65,22,100).attr(this.get("dragHandleAttributes"))]).attr({cursor:"e-resize"}).drag(function(a,b,c,d){my={};my.offset=this.get("offset");my.children=this.get("children");my.transforms=this.get("transforms");
my.translation=my.transforms.get("translation");my.rotation=my.transforms.get("rotation");my.P1=my.children.get("pivot_arm").get("transforms").get("rotation");my.P2=my.children.get("pencil_arm").get("transforms").get("rotation");my.triangle=this.set("mouse",{x:c,y:d});my.triangle.gap=21;0>my.triangle.dx&&(my.triangle.gap=-my.triangle.gap);my.triangle.h1=e.h1;my.triangle.h2=e.h2;my.LIMIT=my.triangle.h3+my.triangle.h1+Math.abs(my.triangle.gap);my.triangle.dx<-my.LIMIT?my.triangle.dx=-my.LIMIT:my.triangle.dx>
my.LIMIT&&(my.triangle.dx=my.LIMIT);var a=0.25-Math.pow(my.triangle.h3/my.triangle.h2,2),b=Math.abs(my.triangle.dx-my.triangle.gap)/2,k=Math.pow(Math.abs(my.triangle.dx-my.triangle.gap),2)/4;my.triangle.x2=(-b-Math.sqrt(Math.pow(b,2)-4*a*k))/(2*a);0>my.triangle.x2&&(my.triangle.x2=(-b+Math.sqrt(Math.pow(b,2)-4*a*k))/(2*a));0>my.triangle.dx&&(my.triangle.x2=-my.triangle.x2);my.triangle.x3=(my.triangle.dx-my.triangle.gap+my.triangle.x2)/2;my.triangle.A=Math.acos(my.triangle.x3/my.triangle.h3);my.triangle.y3=
my.triangle.h3*Math.sin(my.triangle.A);my.triangle.dy=my.triangle.h3-my.triangle.y3;my.pivot_angle=this.set("angle",90-Raphael.deg(my.triangle.A));this.set("radius",2*my.triangle.x3+(0<=my.triangle.dx?16:-16));my.children.get("pivot_arm").get("transforms").set({rotation:{angle:my.pivot_angle,x:my.P1.x,y:my.P1.y}});my.children.get("handle").get("transforms").set({translation:{x:0>my.triangle.dx?my.triangle.x3-16:my.triangle.x3,y:my.triangle.dy}});my.children.get("pencil_arm").get("transforms").set({rotation:{angle:-my.pivot_angle,
x:my.P2.x,y:my.P2.y},translation:{x:0>my.triangle.dx?my.triangle.x3-32:my.triangle.x3,y:my.triangle.dy}});my.children.get("pencil").get("transforms").set({rotation:{angle:-my.pivot_angle,x:my.P2.x,y:my.P2.y},translation:{x:0>my.triangle.dx?my.triangle.x3-32:my.triangle.x3,y:my.triangle.dy}});Math.abs(my.triangle.dx)>Math.abs(my.triangle.gap)&&(my.triangle.y2=0==my.triangle.x2?my.triangle.h2:my.triangle.x2*Math.tan(my.triangle.A),my.delta={angle:Raphael.rad((e.rotation.angle-(0>my.triangle.dx?180:
0))%360)-Math.atan(Math.abs(my.triangle.y2)/my.triangle.dx),h:Math.sqrt(Math.pow(my.triangle.y2,2)+Math.pow(my.triangle.dx,2))},my.delta.x=my.offset.x+my.translation.x+e.rotation.x+my.delta.h*Math.cos(my.delta.angle),my.delta.y=my.offset.y+my.translation.y+e.rotation.y+my.delta.h*Math.sin(my.delta.angle),my.delta.rotation=Raphael.angle(c,d,my.delta.x,my.delta.y,my.offset.x+e.rotation.x+my.translation.x,my.offset.y+e.rotation.y+my.translation.y),my.rotation.angle=e.rotation.angle+my.delta.rotation);
my.transforms.set("rotation",my.rotation);c=my.rotation.angle+my.pivot_angle;c=0<=my.triangle.dx?c%360:(c-90)%360;c=0<=c?c:c+360;if(0<=c&&90>=c)var l="e-resize";else 90<c&&180>c?l="s-resize":180<=c&&270>=c?l="w-resize":270<c&&360>c&&(l="n-resize");my.children.get("pencil_arm").get("set").attr({cursor:l})},function(a,b){this.addListener("mouse",this.setMouse);e=this.set("mouse",{x:a,y:b})},function(){this.removeListener("mouse",this.setMouse)},this,this,null)})).get("set"))};
MeasurementTool.Compass.prototype.setMouse=function(b,c,d,a){var b=this.get("offset"),d=this.get("transforms"),c=d.get("translation"),d=d.get("rotation"),e=Raphael.rad(90-this.get("children").get("pivot_arm").get("transforms").get("rotation").angle);a.rotation=d;a.dAngle=Raphael.rad(Raphael.angle(a.x,a.y,b.x+d.x+c.x,b.y+d.y+c.y)-(d.angle||360));a.x<b.x+d.x+c.x&&(a.dAngle=-a.dAngle);a.dh=Math.sqrt(Math.pow(a.x-(b.x+d.x+c.x),2)+Math.pow(b.y+d.y+c.y-a.y,2));a.dx=a.dh*Math.cos(a.dAngle);a.dy=a.dh*Math.sin(a.dAngle);
a.y2=a.dy;a.h2=Math.abs(a.y2/Math.sin(e));a.x2=Math.abs(a.y2/Math.tan(e));a.h3=153;a.h1=a.h3-a.h2};
MeasurementTool.Compass.prototype.addPencil=function(b,c,d,a){var b=this.get("canvas").get("canvas"),e;a.push(this.get("children").set("pencil",new MeasurementTool.Set({rotation:0,center:{x:24,y:67},set:b.set([b.rect(23.5,205,1,15).attr({fill:"none",stroke:"#231F20","stroke-miterlimit":"10"}),b.rect(23,165,2,12).attr({fill:"#D1D3D4",stroke:"#808285","stroke-miterlimit":"10"}),b.rect(20.5,177,7,10).attr({fill:"#D1D3D4",stroke:"#808285","stroke-miterlimit":"10"}),b.rect(22.5,187,3.5,3).attr({fill:"#D1D3D4",
stroke:"#808285","stroke-miterlimit":"10"}),b.path("M22,190 l4,0 l-1,15 l-2,0 l-1,-15").attr({fill:"#D1D3D4",stroke:"#808285","stroke-miterlimit":"10"}),b.rect(13,165,22,55).attr(this.get("dragHandleAttributes"))]).drag(function(a,b,c,d){this.rotation.drag.apply(this,arguments);var k=this.get("radius"),k=this.get("transforms").get("rotation").angle-(0>k?180:0),l=e.get("start"),j=e.get("end");k<l?e.set("start",k):k>j&&e.set("end",k)},function(a,b,c){this.rotation.start.apply(this,arguments);var d=
this.get("radius"),k=this.get("transforms"),l=k.get("translation"),k=k.get("rotation"),j=k.angle-(0>d?180:0);this.get("arcs").add(e=new MeasurementTool.Arc({canvas:this.get("canvas"),center:{x:k.x+l.x,y:k.y+l.y},radius:Math.abs(d),start:j,end:j}))},null,this,this,null)})).get("set"))};MeasurementTool.Compass.prototype.removeArc=function(b,c,d){""!=d&&(d.get("node").remove(),d.destroy())};"undefined"==typeof MeasurementTool&&(MeasurementTool={});MeasurementTool.Arc=PiObject.extend();
MeasurementTool.Arc.prototype.init=function(b){b=b||{};b.radius=Math.abs(b.radius);b["stroke-width"]=b["stroke-width"]||13;MeasurementTool.Arc.parent.init.apply(this,arguments);this.addListener("radius",this.positiveRadius,!1);this.addListener("canvas",this.addCanvas)};MeasurementTool.Arc.prototype.positiveRadius=function(b,c,d,a){if(0>a)return Math.abs(a)};
MeasurementTool.Arc.prototype.addCanvas=function(){this.addListener("center",this.render,!1);this.addListener("start",this.render,!1);this.addListener("end",this.render,!1);this.render()};
MeasurementTool.Arc.prototype.render=function(b,c){if("node"!=c){var d,a=this.get("direction"),e=this.get("center"),g=this.get("radius"),f=this.get("start"),i=this.get("end");""==a&&(f<i?a="1":f>i&&(a="0"),""!=a?this.set("direction",a):a="0");d=180<=Math.abs(i-f)?1:0;this.exists("node")&&this.get("node").remove();360<=Math.abs(i-f)?d=this.get("canvas").get("canvas").circle(e.x,e.y,g):(f=parseInt(f)*Math.PI/180,f=[e.x+g*Math.cos(f),e.y+g*Math.sin(f)].join(),i=parseInt(i)*Math.PI/180,i=[e.x+g*Math.cos(i),
e.y+g*Math.sin(i)].join(),d=["M",f,"A",[g,g].join(),"0",[d,a].join(),i].join(" "),d=this.get("canvas").get("canvas").path(d));d.attr(this.get("config"));this.set("node",d)}};