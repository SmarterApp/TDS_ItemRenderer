// Below is subset of 2D.js from Keven Lindsey http://www.kevlindev.com/ (UNMODIFIED)
// ALSO: This seems nice: http://code.google.com/p/renderengine/source/browse/trunk/engine/engine.math2d.js

// HELP: http://www.kevlindev.com/gui/math/point2d/index.htm

function Point2D(x,y){if(arguments.length>0){this.x=x;this.y=y;}}
Point2D.prototype.clone=function(){return new Point2D(this.x,this.y);};
Point2D.prototype.add=function(that){return new Point2D(this.x+that.x,this.y+that.y);};
Point2D.prototype.addEquals=function(that){this.x+=that.x;this.y+=that.y;return this;};
Point2D.prototype.offset=function(a,b){var result=0;if(!(b.x<=this.x||this.x+a.x<=0)){var t=b.x*a.y-a.x*b.y;var s;var d;if(t>0){if(this.x<0){s=this.x*a.y;d=s/a.x-this.y;}else if(this.x>0){s=this.x*b.y;d=s/b.x-this.y}else{d=-this.y;}}else{if(b.x<this.x+a.x){s=(b.x-this.x)*a.y;d=b.y-(this.y+s/a.x);}else if(b.x>this.x+a.x){s=(a.x+this.x)*b.y;d=s/b.x-(this.y+a.y);}else{d=b.y-(this.y+a.y);}}if(d>0){result=d;}}return result;};
Point2D.prototype.rmoveto=function(dx,dy){this.x+=dx;this.y+=dy;};
Point2D.prototype.scalarAdd=function(scalar){return new Point2D(this.x+scalar,this.y+scalar);};
Point2D.prototype.scalarAddEquals=function(scalar){this.x+=scalar;this.y+=scalar;return this;};
Point2D.prototype.subtract=function(that){return new Point2D(this.x-that.x,this.y-that.y);};
Point2D.prototype.subtractEquals=function(that){this.x-=that.x;this.y-=that.y;return this;};
Point2D.prototype.scalarSubtract=function(scalar){return new Point2D(this.x-scalar,this.y-scalar);};
Point2D.prototype.scalarSubtractEquals=function(scalar){this.x-=scalar;this.y-=scalar;return this;};
Point2D.prototype.multiply=function(scalar){return new Point2D(this.x*scalar,this.y*scalar);};
Point2D.prototype.multiplyEquals=function(scalar){this.x*=scalar;this.y*=scalar;return this;};
Point2D.prototype.divide=function(scalar){return new Point2D(this.x/scalar, this.y/scalar);};
Point2D.prototype.divideEquals=function(scalar){this.x/=scalar;this.y/=scalar;return this;};
Point2D.prototype.compare=function(that){return(this.x-that.x||this.y-that.y);};
Point2D.prototype.eq=function(that){return(this.x==that.x&&this.y==that.y);};
Point2D.prototype.lt=function(that){return(this.x<that.x&&this.y<that.y);};
Point2D.prototype.lte=function(that){return(this.x<=that.x&&this.y<=that.y);};
Point2D.prototype.gt=function(that){return(this.x>that.x&&this.y>that.y);};
Point2D.prototype.gte=function(that){return(this.x>=that.x&&this.y>=that.y);};
Point2D.prototype.distanceFrom=function(that){var dx=this.x-that.x;var dy=this.y-that.y;return Math.sqrt(dx*dx+dy*dy);};
Point2D.prototype.min=function(that){return new Point2D(Math.min(this.x,that.x),Math.min(this.y,that.y));};
Point2D.prototype.max=function(that){return new Point2D(Math.max(this.x,that.x),Math.max(this.y,that.y));};
Point2D.prototype.toString=function(){return this.x+","+this.y;};
Point2D.prototype.setXY=function(x,y){this.x=x;this.y=y;};
Point2D.prototype.setFromPoint=function(that){this.x=that.x;this.y=that.y;};
Point2D.prototype.swap=function(that){var x=this.x;var y=this.y;this.x=that.x;this.y=that.y;that.x=x;that.y=y;};
Point2D.prototype.lerp=function(that,t){return new Point2D(this.x+(that.x-this.x)*t,this.y+(that.y-this.y)*t);};

// HELP: http://www.kevlindev.com/gui/math/intersection/index.htm
function Intersection(status){if(arguments.length>0){this.init(status);}}
Intersection.prototype.init=function(status){this.status=status;this.points=new Array();};
Intersection.prototype.appendPoint=function(point){this.points.push(point);};
Intersection.prototype.appendPoints=function(points){this.points=this.points.concat(points);};

Intersection.intersectCircleCircle=function(c1,r1,c2,r2){var result;var r_max=r1+r2;var r_min=Math.abs(r1-r2);var c_dist=c1.distanceFrom(c2);if(c_dist>r_max){result=new Intersection("Outside");}else if(c_dist<r_min){result=new Intersection("Inside");}else{result=new Intersection("Intersection");var a=(r1*r1-r2*r2+c_dist*c_dist)/(2*c_dist);var h=Math.sqrt(r1*r1-a*a);var p=c1.lerp(c2,a/c_dist);var b=h/c_dist;result.points.push(new Point2D(p.x-b*(c2.y-c1.y),p.y+b*(c2.x-c1.x)));result.points.push(new Point2D(p.x+b*(c2.y-c1.y),p.y-b*(c2.x-c1.x)));}return result;};
Intersection.intersectCircleLine=function(c,r,a1,a2){var result;var a=(a2.x-a1.x)*(a2.x-a1.x)+(a2.y-a1.y)*(a2.y-a1.y);var b=2*((a2.x-a1.x)*(a1.x-c.x)+(a2.y-a1.y)*(a1.y-c.y));var cc=c.x*c.x+c.y*c.y+a1.x*a1.x+a1.y*a1.y-2*(c.x*a1.x+c.y*a1.y)-r*r;var deter=b*b-4*a*cc;if(deter<0){result=new Intersection("Outside");}else if(deter==0){result=new Intersection("Tangent");}else{var e=Math.sqrt(deter);var u1=(-b+e)/(2*a);var u2=(-b-e)/(2*a);if((u1<0||u1>1)&&(u2<0||u2>1)){if((u1<0&&u2<0)||(u1>1&&u2>1)){result=new Intersection("Outside");}else{result=new Intersection("Inside");}}else{result=new Intersection("Intersection");if(0<=u1&&u1<=1)result.points.push(a1.lerp(a2,u1));if(0<=u2&&u2<=1)result.points.push(a1.lerp(a2,u2));}}return result;};
Intersection.intersectLineLine=function(a1,a2,b1,b2){var result;var ua_t=(b2.x-b1.x)*(a1.y-b1.y)-(b2.y-b1.y)*(a1.x-b1.x);var ub_t=(a2.x-a1.x)*(a1.y-b1.y)-(a2.y-a1.y)*(a1.x-b1.x);var u_b=(b2.y-b1.y)*(a2.x-a1.x)-(b2.x-b1.x)*(a2.y-a1.y);if(u_b!=0){var ua=ua_t/u_b;var ub=ub_t/u_b;if(0<=ua&&ua<=1&&0<=ub&&ub<=1){result=new Intersection("Intersection");result.points.push(new Point2D(a1.x+ua*(a2.x-a1.x),a1.y+ua*(a2.y-a1.y)));}else{result=new Intersection("No Intersection");}}else{if(ua_t==0||ub_t==0){result=new Intersection("Coincident");}else{result=new Intersection("Parallel");}}return result;};
Intersection.intersectRectangleRectangle=function(a1,a2,b1,b2){var min=a1.min(a2);var max=a1.max(a2);var topRight=new Point2D(max.x,min.y);var bottomLeft=new Point2D(min.x,max.y);var inter1=Intersection.intersectLineRectangle(min,topRight,b1,b2);var inter2=Intersection.intersectLineRectangle(topRight,max,b1,b2);var inter3=Intersection.intersectLineRectangle(max,bottomLeft,b1,b2);var inter4=Intersection.intersectLineRectangle(bottomLeft,min,b1,b2);var result=new Intersection("No Intersection");result.appendPoints(inter1.points);result.appendPoints(inter2.points);result.appendPoints(inter3.points);result.appendPoints(inter4.points);if(result.points.length>0)result.status="Intersection";return result;};
Intersection.intersectCircleRectangle = function(c, r, r1, r2) { var min = r1.min(r2); var max = r1.max(r2); var topRight = new Point2D(max.x, min.y); var bottomLeft = new Point2D(min.x, max.y); var inter1 = Intersection.intersectCircleLine(c, r, min, topRight); var inter2 = Intersection.intersectCircleLine(c, r, topRight, max); var inter3 = Intersection.intersectCircleLine(c, r, max, bottomLeft); var inter4 = Intersection.intersectCircleLine(c, r, bottomLeft, min); var result = new Intersection("No Intersection"); result.appendPoints(inter1.points); result.appendPoints(inter2.points); result.appendPoints(inter3.points); result.appendPoints(inter4.points); if (result.points.length > 0) result.status = "Intersection"; else result.status = inter1.status; return result; };
Intersection.intersectLineRectangle = function(a1, a2, r1, r2) { var min = r1.min(r2); var max = r1.max(r2); var topRight = new Point2D(max.x, min.y); var bottomLeft = new Point2D(min.x, max.y); var inter1 = Intersection.intersectLineLine(min, topRight, a1, a2); var inter2 = Intersection.intersectLineLine(topRight, max, a1, a2); var inter3 = Intersection.intersectLineLine(max, bottomLeft, a1, a2); var inter4 = Intersection.intersectLineLine(bottomLeft, min, a1, a2); var result = new Intersection("No Intersection"); result.appendPoints(inter1.points); result.appendPoints(inter2.points); result.appendPoints(inter3.points); result.appendPoints(inter4.points); if (result.points.length > 0) result.status = "Intersection"; return result; };
