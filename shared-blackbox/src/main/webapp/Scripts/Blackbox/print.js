var gWaitForPrinter = 30; //wait for printer countdown

//Call from the parent page to load print content
function loadPrintContent(testeeRequest) 
{
    ContentManager.subscribe('pageAvailable', function(evt) 
    {
        setPrintInfo(evt, testeeRequest);
    });
}

//name: elem name
//objAtts: { {attname: "", attvalue=""},  }
function buildElem(name, aryAtts) {
    if(name ==null)
        return null;
    var elem = document.createElement(name);
    if (aryAtts == null || aryAtts.length < 1)
        return elem;
    for (var i = 0; i < aryAtts.length; i++) {
        elem.setAttribute(aryAtts[i].attname, aryAtts[i].attvalue);
    }
    return elem;
}

//set client print specific to the page
function setPrintInfo(evt, testeeRequest) {
    //printInfo settings
    //make sure the content is loaded.
    var doc = getDocument();
    
    var printInfo = testeeRequest.PrintRequest;
    doc.title = printInfo.PageTitle;    
    
    var elem = doc.getElementById('printInst');  
    if (elem != undefined && printInfo.PrintInst != undefined) {
        elem.innerHTML = printInfo.PrintInst;
    }

    elem = doc.getElementById('lblName1');
    if (elem != undefined && testeeRequest.TesteeName != undefined)
        elem.innerHTML = testeeRequest.TesteeName;

    elem = doc.getElementById('lblName2');
    if (elem != undefined && testeeRequest.TesteeName != undefined)
        elem.innerHTML = testeeRequest.TesteeName;

    var elem = doc.getElementById('lblMessage1');   
    if (elem != undefined && printInfo.HeaderText != undefined)
        elem.innerHTML = printInfo.HeaderText;
   
    elem = doc.getElementById('lblMessage2');
    if (elem != undefined && printInfo.FooterText != undefined)
        elem.innerHTML = printInfo.FooterText;

    elem = doc.getElementById('lblDate');
    if (elem != undefined && printInfo.StrDate != undefined)
        elem.innerHTML = printInfo.StrDate;        
  
    if (testeeRequest.waitForPrinter && testeeRequest.waitForPrinter >= 0)
        gWaitForPrinter = testeeRequest.waitForPrinter;            
}

//print button clicked
function printClicked() {
    //call print and the set the countdown timmer    
    var doc = getDocument();        
    var lblTimerText = doc.getElementById('lblTimerText');
    lblTimerText.style.display = "block";

    //start the count down
    countDown();    
}
//close button click
function closeClicked() {
    top.close();
}

function countDown() {
    gWaitForPrinter--;
    if (gWaitForPrinter < 0) { //we are done, close the window
        closeClicked();
        return;
    }
    var doc = getDocument();
    doc.getElementById('lblTime').innerHTML = gWaitForPrinter;
    var id = setTimeout("countDown()", 1000); //1 sec
}
//get content doc
function getDocument() {
    var frmContentFrame = getFrame();
    if (YAHOO.env.ua.webkit){
        return (frmContentFrame.document || frmContentFrame.contentWindow.document);
    }
    else{
        return (frmContentFrame.contentDocument || frmContentFrame.contentWindow.document);
    }    
}

function getWindow() {
    var frmContentFrame = getFrame();
    return frmContentFrame.contentWindow;
}

function getFrame() {
    return document.getElementById('frmContent');
}