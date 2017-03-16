<%@ Page Language="C#" Inherits="System.Web.UI.Page" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

    <meta name="viewport" content="width=device-width, maximum-scale=1.0, user-scalable=no" />

    <link rel="apple-touch-icon" href="Images/icon.png" />

    <title>Calculator</title>
    
    <tds:ResourcesLink File="~/Scripts/scripts_student.xml" Name="TDSCalculator" runat="server" />
   
    <tds:CSSLink runat="server" href="~/Scripts/Calculator/css/calc.css" rel="stylesheet" type="text/css" />
    <tds:CSSLink runat="server" href="~/Scripts/Calculator/css/project.css" rel="stylesheet" type="text/css" />
   
    <script type="text/javascript">
        var tdscalc;
        window.onload = function()
        {
            tdscalc = new TDS_Calc();
        };        
    </script>

    <script type="text/javascript">
        //disable right click
        
        var message="";

        function clickIE()       
        {if (document.all)   {(message);return false;}}
         
        function clickNS(e) {
        if
        (document.layers||(document.getElementById&&!document.all))
        {
        if (e.which==2||e.which==3) {(message);return false;}}}
        if (document.layers)
            {document.captureEvents(Event.MOUSEDOWN);document.  onmousedown=clickNS;}
        else
            {document.onmouseup=clickNS;document.oncontextmenu  =clickIE;}
        document.oncontextmenu=new Function("return false");

    </script>
   
</head>

<body   ondragstart="return false" draggable="false"
        ondragenter="event.dataTransfer.dropEffect='none'; event.stopPropagation(); event.preventDefault();"  
        ondragover="event.dataTransfer.dropEffect='none';event.stopPropagation(); event.preventDefault();"  
        ondrop="event.dataTransfer.dropEffect='none';event.stopPropagation(); event.preventDefault();">




<div class="error" id="errorDiv" style="display:none"></div>
<div>
    <select id="selectcalc" style="display:none"></select>
</div>

<div id="calculatorwidget" class="calculatorWidget" style="display:none"><!--new classes: regressions & matrices-->

	    <div class="numericDisplay">
            <!-- spellcheck attribute fixed:https://bugz.airws.org/default.asp?69032 -->
            <textarea id="textinput" class="line" type="text" name="line" spellcheck="false"></textarea>
	    </div>
    
        <div class="calcButtons">
    	    <div id= "calcControls" class="calcControls">
            	<div id="calcClear" class="calcClear">
	        	    <a href="#" id="backspace">Backspace</a>
    	            <a href="#" id="CE">CE</a>
        	        <a href="#" id="C">C</a>
            	    <!--<a href="#" id="ANS" class="disabled">ANS</a>-->
                	<input type="button" id="ANS" disabled="disabled" class="disabled" value="ANS"/>
                 </div>
                 <div id="calcSwitch"></div>
				
			</div>
            <div id="memLogic" class="memLogic">
                <div class="memory">
                    <input id="memorystatus" readonly="readonly" type="text" value="" size = 1/>
<%--                    <a href="#" id="memoryC" >MC</a>
                    <a href="#" id="memoryR" >MR</a>          
                    <a href="#" id="memoryS" >MS</a>
                    <a href="#" id="memory+" >M+</a>--%>
                    <a href="#" id="STO" >STO</a>
<!--                    <a href="#" id="RCL"  class="disabled">RCL</a>-->
                    <input type="button" id="RCL" disabled="disabled" class="disabled" value="RCL"/>
                    <span class="clear"></span>                        
                </div>
                <div class="misc">
                	<a href="#" id="variable" >x-var</a>
                </div>
                <div class="logicFunctions">

                	<span class="clear"></span>
            	</div>
            </div>
            
            <div id="memLogicStandard" class="memLogic">
                <div class="memory">
                    <input id="memorystatusStandard" readonly="readonly" type="text" value="" size = 1/>
                    <a href="#" id="memoryC" >MC</a>
                    <a href="#" id="memoryR" >MR</a>          
                    <a href="#" id="memoryS" >MS</a>
                    <a href="#" id="memory+" >M+</a>                   
                   <span class="clear"></span>                        
                </div>
                <!---<div class="misc">
                	<a href="#" id="variable" >x-var</a>
                </div>-->
                <div class="logicFunctions">
                	<span class="clear"></span>
            	</div>
            </div>
            
            <span class="advnacedPad">
            <div id="advancedFunctions" class="advancedFunctions">
                <a href="#" id="leftbracket" val="(">(</a>
                <a href="#" id="rightbracket" val=")">)</a>
        	    <a href="#" id="sin" >Sin</a>
                <a href="#" id="asin">sin<sup>-1</sup></a>
                <a href="#" id="cos" >Cos</a>
                <a href="#" id="acos">cos<sup>-1</sup></a>
                <a href="#" id="tan" >Tan</a>
                <a href="#" id="atan">tan<sup>-1</sup></a>
                <a href="#" id="exp" >e^x</a>
                <a href="#" id="ln" >ln</a>
                <a href="#" id="log" >log</a>
                <a href="#" id="factorial" >n!</a>
                <a href="#" id="reciprocal" >1/x</a>
                <a href="#" id="xpowery" >x^y</a>
                <a href="#" id="xsquare" >x^2</a>
                <a href="#" id="xcube" >x^3</a>
                <a href="#" id="pi" val="&#960;" >π</a>
                <a href="#" id="inv">Inv</a>
                <a href="#" id="abs">Abs</a>
                <a href="#" id="det">Det</a>
                <a href="#" id="t">T</a>
                <span class="clear"></span>
            </div>
            <div class="numbersWrap">
                <div id="numberPad" class="numberPad">
                    <a href="#" id="num7" >7</a>
                    <a href="#" id="num8" >8</a>
                    <a href="#" id="num9" >9</a>
                    <a href="#" id="num4" >4</a>
                    <a href="#" id="num5" >5</a>
                    <a href="#" id="num6" >6</a>
                    <a href="#" id="num1" >1</a>
                    <a href="#" id="num2" >2</a>
                    <a href="#" id="num3" >3</a>
                    <a href="#" id="num0" >0</a>
                    <a href="#" id="dot" >.</a>
                    <span class="clear"></span>
                </div>
                
                <span id= "modes" class="modes">
                    <input type="radio" id="degrees" name="degrees" onclick="angle_mode('degrees')" checked=""/> Degrees <br />
                    <input type="radio" id="radians" name="radians" onclick="angle_mode('radians')" /> Radians <br />

                </span>
            </div>
            </span>
            
    	    <div id= "basicFunctions" class="basicFunctions">
                    <a href="#" id="divide" >÷</a>
                    <a href="#" id="remainder">%</a>    
                    <a href="#" id="multiply">x</a>    
    	            <!--<a href="#" onclick = "squareRootPressed(event)" id="sqrt" val="&#8730;(" op="true" numOprands="1" onePos="0">&radic;</a>-->
                    <a href="#" id="sqrt">&radic;</a>
                    <a href="#" id="minus">&#8722;</a>      
                    <a href="#" id="sign">+/-</a>                          
                    <a href="#" id="plus">+</a>             
                    <a href="#" id="equals">=</a>

                    <a href="#" id="comma">,</a>
                

                <span class="clear"></span>
            </div>
        </div>

        <div id="Graphing" class="calcGraph" >
            
            <span id="graphmodes" class="graphmodes">
                <a href="#" id="yequalview" >Expressions(Y=)</a>
                <a href="#" id="windowview" >Window</a>
                <a href="#" id="tableview" >Table</a>
                <a href="#" id="graphview" >Graph</a>
                <span class="clear"></span>
            </span>
            
            <div id = "canvasHolder">
    		    <canvas id="canvas" height="280" width="280"></canvas><div id="canvas-container"><canvas id="ctncanvas"></canvas></div> 
                <a href="#" id ="calczoomin" >Zoom In</a>
                <a href="#" id ="calczoomout" >Zoom Out</a>
            </div>
            <div id="equations" >
                <!-- SB07072011: I am not sure why there is a display:none option in the following selections. IE does not honor the display:none attribute on a option and hence the "=" would show up twice. I am going to comment those out. -->
                Y&#x2081;<select id="equations-select-1"><option selected="selected">=</option><option>&gt;</option><option>&lt;</option><!-- <option style="display:none">=</option> --> </select><input id="equa1" value="" class=line type="text" name="line" onfocus="return CalcFocusGained(this, event)"/><span class="clear"></span>
                Y&#x2082;<select id="equations-select-2"><option selected="selected">=</option><option>&gt;</option><option>&lt;</option><!-- <option style="display:none">=</option> --> </select><input id="equa2" value="" class=line type="text" name="line" onfocus="return CalcFocusGained(this, event)"/><span class="clear"></span>
                Y&#x2083;<select id="equations-select-3"><option selected="selected">=</option><option>&gt;</option><option>&lt;</option><!-- <option style="display:none">=</option> --> </select><input id="equa3" value="" class=line type="text" name="line" onfocus="return CalcFocusGained(this, event)"/><span class="clear"></span>
                Y&#x2084;<select id="equations-select-4"><option selected="selected">=</option><option>&gt;</option><option>&lt;</option><!-- <option style="display:none">=</option> --> </select><input id="equa4" value="" class=line type="text" name="line" onfocus="return CalcFocusGained(this, event)"/>
            </div>

            <div id="graphwindow" style="display:none">
                <label>Xmin</label> <INPUT type=TEXT value="-5" id = "xmin" onfocus="return CalcFocusGained(this, event)" onblur="return CalcFocusLost(this, event)"/><br />
                <label>Xmax</label> <INPUT type=TEXT value="5"  id = "xmax" onfocus="return CalcFocusGained(this, event)" onblur="return CalcFocusLost(this, event)"/><br />
                <label>Xscale</label> <INPUT type=TEXT value="1" id = "xscale" onfocus="return CalcFocusGained(this, event)" onblur="return CalcFocusLost(this, event)"/> <br />
                <label>Ymin</label> <INPUT type=TEXT value="-5"  id = "ymin" onfocus="return CalcFocusGained(this, event)" onblur="return CalcFocusLost(this, event)"/><br />
                <label>Ymax</label> <INPUT type=TEXT value="5" id = "ymax" onfocus="return CalcFocusGained(this, event)" onblur="return CalcFocusLost(this, event)"/> <br />
                <label>Yscale</label> <INPUT type=TEXT value="1" id = "yscale" onfocus="return CalcFocusGained(this, event)" onblur="return CalcFocusLost(this, event)"/> 
                <label>Trace Step Size</label> <INPUT type=TEXT value="4" id = "tracestepsize" onfocus="return CalcFocusGained(this, event)" onblur="return CalcFocusLost(this, event)"/> <br />
                <!--<label>Zoom</label> <INPUT type=TEXT value="1" class="disabled" id = "zoomlevel" readonly="value"/> <br />-->
            </div>
            <div id="datatableHolder" style="display:none">
                <label>Init X</label> <INPUT type=TEXT value="-5" id = "initX" onfocus="return CalcFocusGained(this, event)" onblur="return CalcFocusLost(this, event)"/> 
                <a href="#" id="applytb" >Apply</a>
                
                <span class="tableholder">
                	<table id="datatable" border="1"></table>
                </span>
                
                <a href="#" id ="previous5" >Previous</a>
                <a href="#" id ="next5" >Next</a>
            </div>
            <div id="grapherrorholder" style="display:none">
                <br />
                <div id="errorcontent">You have errors in your graphing data, please correct it</div>
                <br />
            </div>
            <div id="graphControls" class="graphControls">
            	<a href="#" id="left"><</a>
                <span>
                <a href="#" id="up" >up</a>
                <a href="#" id="down">down</a>
                </span>
                <a href="#" id="right" ></a>
            </div>
            <div id="traceToggle">
                <div id="scrollHolder"> <input type="radio" id="toggleScroll" class="toggleTrace" name="toggleTrace" value="toggleScroll" checked="" /><span>Scroll</span></div>
                <div id="traceHolder"><input type="radio" id="toggleTrace" class="toggleTrace" name="toggleTrace" value="toggleTrace" /><span>Trace</span></div>
            </div>
            <a href="#" id ="resetgraph" >Reset</a>
    </div>
        
        <div class="regressionContainer" id="Regression">
        	<div id="regresionModes" class="regresionModes">
            	<a href="#" id="Linear">Linear</a>
            	<a href="#" id="Quadratic">Quadratic</a>
            	<a href="#" id="Exponential">Exponential</a><!--add class active to indicate which model-->          
                <a href="#" id="Power">Power</a>
                <a href="#" id="regclearall">Clear</a>
            </div>
            
            <div id="yNumb" class="yNumb">
            	<table border="0">
                      <tr>
                        <th scope="col">X</th>
                        <th scope="col">Y1</th>
                        <th scope="col">Y2</th>
                        <th scope="col">Y3</th>
                        <th scope="col">Y4</th>
                      </tr>
                      <tr>
                        <td><input id="reg-X-1" name="" type="text" /></td>
                        <td><input id="reg-Y1-1" name="" type="text" /></td>
                        <td><input id="reg-Y2-1" name="" type="text" /></td>
                        <td><input id="reg-Y3-1" name="" type="text" /></td>
                        <td><input id="reg-Y4-1" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-2" name="" type="text" /></td>
                        <td><input id="reg-Y1-2" name="" type="text" /></td>
                        <td><input id="reg-Y2-2" name="" type="text" /></td>
                        <td><input id="reg-Y3-2" name="" type="text" /></td>
                        <td><input id="reg-Y4-2" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-3" name="" type="text" /></td>
                        <td><input id="reg-Y1-3" name="" type="text" /></td>
                        <td><input id="reg-Y2-3" name="" type="text" /></td>
                        <td><input id="reg-Y3-3" name="" type="text" /></td>
                        <td><input id="reg-Y4-3" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-4" name="" type="text" /></td>
                        <td><input id="reg-Y1-4" name="" type="text" /></td>
                        <td><input id="reg-Y2-4" name="" type="text" /></td>
                        <td><input id="reg-Y3-4" name="" type="text" /></td>
                        <td><input id="reg-Y4-4" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-5" name="" type="text" /></td>
                        <td><input id="reg-Y1-5" name="" type="text" /></td>
                        <td><input id="reg-Y2-5" name="" type="text" /></td>
                        <td><input id="reg-Y3-5" name="" type="text" /></td>
                        <td><input id="reg-Y4-5" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-6" name="" type="text" /></td>
                        <td><input id="reg-Y1-6" name="" type="text" /></td>
                        <td><input id="reg-Y2-6" name="" type="text" /></td>
                        <td><input id="reg-Y3-6" name="" type="text" /></td>
                        <td><input id="reg-Y4-6" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-7" name="" type="text" /></td>
                        <td><input id="reg-Y1-7" name="" type="text" /></td>
                        <td><input id="reg-Y2-7" name="" type="text" /></td>
                        <td><input id="reg-Y3-7" name="" type="text" /></td>
                        <td><input id="reg-Y4-7" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-8" name="" type="text" /></td>
                        <td><input id="reg-Y1-8" name="" type="text" /></td>
                        <td><input id="reg-Y2-8" name="" type="text" /></td>
                        <td><input id="reg-Y3-8" name="" type="text" /></td>
                        <td><input id="reg-Y4-8" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-9" name="" type="text" /></td>
                        <td><input id="reg-Y1-9" name="" type="text" /></td>
                        <td><input id="reg-Y2-9" name="" type="text" /></td>
                        <td><input id="reg-Y3-9" name="" type="text" /></td>
                        <td><input id="reg-Y4-9" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-10" name="" type="text" /></td>
                        <td><input id="reg-Y1-10" name="" type="text" /></td>
                        <td><input id="reg-Y2-10" name="" type="text" /></td>
                        <td><input id="reg-Y3-10" name="" type="text" /></td>
                        <td><input id="reg-Y4-10" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-11" name="" type="text" /></td>
                        <td><input id="reg-Y1-11" name="" type="text" /></td>
                        <td><input id="reg-Y2-11" name="" type="text" /></td>
                        <td><input id="reg-Y3-11" name="" type="text" /></td>
                        <td><input id="reg-Y4-11" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-12" name="" type="text" /></td>
                        <td><input id="reg-Y1-12" name="" type="text" /></td>
                        <td><input id="reg-Y2-12" name="" type="text" /></td>
                        <td><input id="reg-Y3-12" name="" type="text" /></td>
                        <td><input id="reg-Y4-12" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-13" name="" type="text" /></td>
                        <td><input id="reg-Y1-13" name="" type="text" /></td>
                        <td><input id="reg-Y2-13" name="" type="text" /></td>
                        <td><input id="reg-Y3-13" name="" type="text" /></td>
                        <td><input id="reg-Y4-13" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-14" name="" type="text" /></td>
                        <td><input id="reg-Y1-14" name="" type="text" /></td>
                        <td><input id="reg-Y2-14" name="" type="text" /></td>
                        <td><input id="reg-Y3-14" name="" type="text" /></td>
                        <td><input id="reg-Y4-14" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-15" name="" type="text" /></td>
                        <td><input id="reg-Y1-15" name="" type="text" /></td>
                        <td><input id="reg-Y2-15" name="" type="text" /></td>
                        <td><input id="reg-Y3-15" name="" type="text" /></td>
                        <td><input id="reg-Y4-15" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-16" name="" type="text" /></td>
                        <td><input id="reg-Y1-16" name="" type="text" /></td>
                        <td><input id="reg-Y2-16" name="" type="text" /></td>
                        <td><input id="reg-Y3-16" name="" type="text" /></td>
                        <td><input id="reg-Y4-16" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-17" name="" type="text" /></td>
                        <td><input id="reg-Y1-17" name="" type="text" /></td>
                        <td><input id="reg-Y2-17" name="" type="text" /></td>
                        <td><input id="reg-Y3-17" name="" type="text" /></td>
                        <td><input id="reg-Y4-17" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-18" name="" type="text" /></td>
                        <td><input id="reg-Y1-18" name="" type="text" /></td>
                        <td><input id="reg-Y2-18" name="" type="text" /></td>
                        <td><input id="reg-Y3-18" name="" type="text" /></td>
                        <td><input id="reg-Y4-18" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-19" name="" type="text" /></td>
                        <td><input id="reg-Y1-19" name="" type="text" /></td>
                        <td><input id="reg-Y2-19" name="" type="text" /></td>
                        <td><input id="reg-Y3-19" name="" type="text" /></td>
                        <td><input id="reg-Y4-19" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-20" name="" type="text" /></td>
                        <td><input id="reg-Y1-20" name="" type="text" /></td>
                        <td><input id="reg-Y2-20" name="" type="text" /></td>
                        <td><input id="reg-Y3-20" name="" type="text" /></td>
                        <td><input id="reg-Y4-20" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-21" name="" type="text" /></td>
                        <td><input id="reg-Y1-21" name="" type="text" /></td>
                        <td><input id="reg-Y2-21" name="" type="text" /></td>
                        <td><input id="reg-Y3-21" name="" type="text" /></td>
                        <td><input id="reg-Y4-21" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-22" name="" type="text" /></td>
                        <td><input id="reg-Y1-22" name="" type="text" /></td>
                        <td><input id="reg-Y2-22" name="" type="text" /></td>
                        <td><input id="reg-Y3-22" name="" type="text" /></td>
                        <td><input id="reg-Y4-22" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-23" name="" type="text" /></td>
                        <td><input id="reg-Y1-23" name="" type="text" /></td>
                        <td><input id="reg-Y2-23" name="" type="text" /></td>
                        <td><input id="reg-Y3-23" name="" type="text" /></td>
                        <td><input id="reg-Y4-23" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-24" name="" type="text" /></td>
                        <td><input id="reg-Y1-24" name="" type="text" /></td>
                        <td><input id="reg-Y2-24" name="" type="text" /></td>
                        <td><input id="reg-Y3-24" name="" type="text" /></td>
                        <td><input id="reg-Y4-24" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-25" name="" type="text" /></td>
                        <td><input id="reg-Y1-25" name="" type="text" /></td>
                        <td><input id="reg-Y2-25" name="" type="text" /></td>
                        <td><input id="reg-Y3-25" name="" type="text" /></td>
                        <td><input id="reg-Y4-25" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-26" name="" type="text" /></td>
                        <td><input id="reg-Y1-26" name="" type="text" /></td>
                        <td><input id="reg-Y2-26" name="" type="text" /></td>
                        <td><input id="reg-Y3-26" name="" type="text" /></td>
                        <td><input id="reg-Y4-26" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-27" name="" type="text" /></td>
                        <td><input id="reg-Y1-27" name="" type="text" /></td>
                        <td><input id="reg-Y2-27" name="" type="text" /></td>
                        <td><input id="reg-Y3-27" name="" type="text" /></td>
                        <td><input id="reg-Y4-27" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-28" name="" type="text" /></td>
                        <td><input id="reg-Y1-28" name="" type="text" /></td>
                        <td><input id="reg-Y2-28" name="" type="text" /></td>
                        <td><input id="reg-Y3-28" name="" type="text" /></td>
                        <td><input id="reg-Y4-28" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-29" name="" type="text" /></td>
                        <td><input id="reg-Y1-29" name="" type="text" /></td>
                        <td><input id="reg-Y2-29" name="" type="text" /></td>
                        <td><input id="reg-Y3-29" name="" type="text" /></td>
                        <td><input id="reg-Y4-29" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-30" name="" type="text" /></td>
                        <td><input id="reg-Y1-30" name="" type="text" /></td>
                        <td><input id="reg-Y2-30" name="" type="text" /></td>
                        <td><input id="reg-Y3-30" name="" type="text" /></td>
                        <td><input id="reg-Y4-30" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-31" name="" type="text" /></td>
                        <td><input id="reg-Y1-31" name="" type="text" /></td>
                        <td><input id="reg-Y2-31" name="" type="text" /></td>
                        <td><input id="reg-Y3-31" name="" type="text" /></td>
                        <td><input id="reg-Y4-31" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-32" name="" type="text" /></td>
                        <td><input id="reg-Y1-32" name="" type="text" /></td>
                        <td><input id="reg-Y2-32" name="" type="text" /></td>
                        <td><input id="reg-Y3-32" name="" type="text" /></td>
                        <td><input id="reg-Y4-32" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-33" name="" type="text" /></td>
                        <td><input id="reg-Y1-33" name="" type="text" /></td>
                        <td><input id="reg-Y2-33" name="" type="text" /></td>
                        <td><input id="reg-Y3-33" name="" type="text" /></td>
                        <td><input id="reg-Y4-33" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-34" name="" type="text" /></td>
                        <td><input id="reg-Y1-34" name="" type="text" /></td>
                        <td><input id="reg-Y2-34" name="" type="text" /></td>
                        <td><input id="reg-Y3-34" name="" type="text" /></td>
                        <td><input id="reg-Y4-34" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-35" name="" type="text" /></td>
                        <td><input id="reg-Y1-35" name="" type="text" /></td>
                        <td><input id="reg-Y2-35" name="" type="text" /></td>
                        <td><input id="reg-Y3-35" name="" type="text" /></td>
                        <td><input id="reg-Y4-35" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-36" name="" type="text" /></td>
                        <td><input id="reg-Y1-36" name="" type="text" /></td>
                        <td><input id="reg-Y2-36" name="" type="text" /></td>
                        <td><input id="reg-Y3-36" name="" type="text" /></td>
                        <td><input id="reg-Y4-36" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-37" name="" type="text" /></td>
                        <td><input id="reg-Y1-37" name="" type="text" /></td>
                        <td><input id="reg-Y2-37" name="" type="text" /></td>
                        <td><input id="reg-Y3-37" name="" type="text" /></td>
                        <td><input id="reg-Y4-37" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-38" name="" type="text" /></td>
                        <td><input id="reg-Y1-38" name="" type="text" /></td>
                        <td><input id="reg-Y2-38" name="" type="text" /></td>
                        <td><input id="reg-Y3-38" name="" type="text" /></td>
                        <td><input id="reg-Y4-38" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-39" name="" type="text" /></td>
                        <td><input id="reg-Y1-39" name="" type="text" /></td>
                        <td><input id="reg-Y2-39" name="" type="text" /></td>
                        <td><input id="reg-Y3-39" name="" type="text" /></td>
                        <td><input id="reg-Y4-39" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-40" name="" type="text" /></td>
                        <td><input id="reg-Y1-40" name="" type="text" /></td>
                        <td><input id="reg-Y2-40" name="" type="text" /></td>
                        <td><input id="reg-Y3-40" name="" type="text" /></td>
                        <td><input id="reg-Y4-40" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-41" name="" type="text" /></td>
                        <td><input id="reg-Y1-41" name="" type="text" /></td>
                        <td><input id="reg-Y2-41" name="" type="text" /></td>
                        <td><input id="reg-Y3-41" name="" type="text" /></td>
                        <td><input id="reg-Y4-41" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-42" name="" type="text" /></td>
                        <td><input id="reg-Y1-42" name="" type="text" /></td>
                        <td><input id="reg-Y2-42" name="" type="text" /></td>
                        <td><input id="reg-Y3-42" name="" type="text" /></td>
                        <td><input id="reg-Y4-42" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-43" name="" type="text" /></td>
                        <td><input id="reg-Y1-43" name="" type="text" /></td>
                        <td><input id="reg-Y2-43" name="" type="text" /></td>
                        <td><input id="reg-Y3-43" name="" type="text" /></td>
                        <td><input id="reg-Y4-43" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-44" name="" type="text" /></td>
                        <td><input id="reg-Y1-44" name="" type="text" /></td>
                        <td><input id="reg-Y2-44" name="" type="text" /></td>
                        <td><input id="reg-Y3-44" name="" type="text" /></td>
                        <td><input id="reg-Y4-44" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-45" name="" type="text" /></td>
                        <td><input id="reg-Y1-45" name="" type="text" /></td>
                        <td><input id="reg-Y2-45" name="" type="text" /></td>
                        <td><input id="reg-Y3-45" name="" type="text" /></td>
                        <td><input id="reg-Y4-45" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-46" name="" type="text" /></td>
                        <td><input id="reg-Y1-46" name="" type="text" /></td>
                        <td><input id="reg-Y2-46" name="" type="text" /></td>
                        <td><input id="reg-Y3-46" name="" type="text" /></td>
                        <td><input id="reg-Y4-46" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-47" name="" type="text" /></td>
                        <td><input id="reg-Y1-47" name="" type="text" /></td>
                        <td><input id="reg-Y2-47" name="" type="text" /></td>
                        <td><input id="reg-Y3-47" name="" type="text" /></td>
                        <td><input id="reg-Y4-47" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-48" name="" type="text" /></td>
                        <td><input id="reg-Y1-48" name="" type="text" /></td>
                        <td><input id="reg-Y2-48" name="" type="text" /></td>
                        <td><input id="reg-Y3-48" name="" type="text" /></td>
                        <td><input id="reg-Y4-48" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-49" name="" type="text" /></td>
                        <td><input id="reg-Y1-49" name="" type="text" /></td>
                        <td><input id="reg-Y2-49" name="" type="text" /></td>
                        <td><input id="reg-Y3-49" name="" type="text" /></td>
                        <td><input id="reg-Y4-49" name="" type="text" /></td>
                      </tr>
                      <tr>
                        <td><input id="reg-X-50" name="" type="text" /></td>
                        <td><input id="reg-Y1-50" name="" type="text" /></td>
                        <td><input id="reg-Y2-50" name="" type="text" /></td>
                        <td><input id="reg-Y3-50" name="" type="text" /></td>
                        <td><input id="reg-Y4-50" name="" type="text" /></td>
                      </tr>
            	</table>
            </div>
            
        
        </div>
        
		<div class="matricesContainer" id="matricesContainer">
        	<span class="mGroup" id="mGroup">
                <a href="#" id="inputM1" class="singleMatrix">M1</a>
                <a href="#" id="inputM2" class="singleMatrix">M2</a>
                <a href="#" id="inputM3" class="singleMatrix">M3</a>
                <a href="#" id="inputM4" class="singleMatrix">M4</a>
                <a href="#" id="inputM5" class="singleMatrix">M5</a>
            </span>
        
        	<div id="matricestabs" class="tabs">
            	<span id="M1span" class="tab active"><a href="#" id="M1" class="switchTab">M1</a></span>
                <span id="M2span" class="tab"><a href="#" id="M2" class="switchTab">M2</a></span>
                <span id="M3span" class="tab"><a href="#" id="M3" class="switchTab">M3</a></span>
                <span id="M4span" class="tab"><a href="#" id="M4" class="switchTab">M4</a></span>
                <span id="M5span" class="tab"><a href="#" id="M5" class="switchTab">M5</a></span>
                <!-- move to 'numberCells' div <a href="#" id="Result" class="matrixResult">Result</a>-->
			</div>

  </div>
        
        <div style="visibility:hidden" class="hidden">
            <p><select id="history" name=history class=history onChange="if(this.selectedIndex>0)set_calc(this.options[this.selectedIndex].text);" title="View previous entries (Alt-h)">
                    <option>History:
                    <option><option><option><option><option><option><option><option><option>
                    <option><option><option><option><option><option><option><option><option><option>
            </select></p>
            <div id="calc_setting">
                <input id="calc_mode" type="text" name="calc_mode" value="scientific"/>
            </div>
        </div>
        <div class="options" style="visibility:hidden">
            <input type="radio" id="hex" name="hex" onclick="pns_mode('hex')" /> Hex 
    	    <input type="radio" id="dec" name="dec" onclick="pns_mode('dec')" checked=""/> Dec 
    	    <input type="radio" id="oct" name="oct" onclick="pns_mode('oct')" /> Oct 
    	    <input type="radio" id="bin" name="bin" onclick="pns_mode('bin')" /> Bin
        </div>
        <span class="clear"></span>
        <div style ="display:none">
    	    <input id="textinputCursorPos" value="0" />
    	    <input id="equa1CursorPos" value="0" />
    	    <input id="equa2CursorPos" value="0" />
    	    <input id="equa3CursorPos" value="0" />
    	    <input id="equa4CursorPos" value="0" />
    	    <input id="initXCursorPos" value="2" />
    	    <input id="xminCursorPos" value="2" />
    	    <input id="xmaxCursorPos" value="1" />
    	    <input id="yminCursorPos" value="2" />
    	    <input id="ymaxCursorPos" value="1" />
    	</div>


</div>

<script type="text/javascript">
    var bodyTag = (document.getElementsByTagName("body"))[0];
    var browserPlatformStyle = css_browser_selector(navigator.userAgent); 
    bodyTag.className = bodyTag.className + ' ' + browserPlatformStyle;
</script>

</body>
</html>

