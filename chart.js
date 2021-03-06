// Licensed Materials - Property of UNICOM Systems, Inc.

// chart.js

// Portions of this file are (c) Copyright UNICOM Systems, Inc. 2007, 2008, 2016.  All Rights Reserved.

// svg chart SCRIPT

// variables

  
var SelectedColumn=0; // holds selected column 
var ChartType="Pie"; // holds selected chart type
var ChartMax=-1; // 0= no limit, >0 limit # data points, -1 = limit to color array size -1
var ChartMode="R"; // R= regular, P=Portfolio, D= Dashboard
var Debugging=false; // do/not provide alerts from dalert function
var ChartsInitialized=false; // have we initialized the chart(s) yet?
var wd="100%"; // dashboard mode chart width
var ht=600; // dashboard mode chart height
var chtIndex=0; // current array index;
var cht = new Array(); // holds  charts
var tbl = new Array;  // holds  tables
var ChartLocs = new Array(); // urls for loading the charts in dashboard
var Titles=new Array(); // holds titles
var AnalysisTables = new Array(); // holds tables for charts
var ChartContext=new Array(); // holds chart objects
var ActiveSegment=new Array();
var chartBtns; // holds chart open close buttons..
var SelectedColumn=new Array(); // hold selected column
var displaymode=new Array(); // hold of display mode 1 for show 0 for hide
var svgCharts; // holds div if mode="R" or "P"
var xhttp; // holds either XMLHttpRequest or XMLHTTP object - depending on browser
var svgurl="chart.svg"; // holds url to the svg file
var childdlgurl="ChildOpen.html"; // holds url to the child dialog file
var forceChildData=false;
var tblID = 0; 
var maindataID = ""; // set in LoadGraph when chart button pressed, used in Chart.prototype.InitializeChart, InitAnalysisTable, all over the place
var lastrequestedchartid = ""; // set in LoadGraph from id..use for finding the list; -1 when only one chart is present, 1+ otherwise
var availablewidth=-1;
// HARDCODED VALUES THAT DIDN'T EXIST

function selectOption(id,index,text){
    //var oApplet = document.getElementById("SVGViewerApplet");
    //oApplet.executeScript("Chart.prototype.SelectChange('listselector',"+index+",'"+text+"')");
	chtIndex=id;
	Chart.prototype.SelectChange('listselector',index,text)
}
   
var innerWidth;
var innerHeight = 392;

//
// Initializer function  called by first chart button click or onload of dashboard
//

function InitializeCharting() {
      
	if(Debugging) { alert ('svgchart.js.InitializeCharting')};
	
	availablewidth = document.getElementById("ux4-app-detail-region").clientWidth;
	
	// figure out chart url
	bsavelocal = false; //saved complete to local.
	var protocol = window.location.protocol
	
	if(protocol == "file:") {
			var metacount=document.getElementsByTagName("META").length
			for(idx=0;idx<metacount;idx++) {
				if ( document.getElementsByTagName("META")[idx].getAttribute("name")=="GENERATOR") {
					svgurl=document.getElementById("chartimg").href; 
					childdlgurl= document.getElementById("childopen").href;
					bsavelocal = true;
				}
			}
			if (bsavelocal == false) {
				svgurl="chart.svg";
				childdlgurl="ChildOpen.html";
				if(window.location.pathname.indexOf("ExpandedChart")>=0) {
					svgurl="chart.svg";
					childdlgurl="ChildOpen.html";
				}
			}
	}

	// see what our chart mode is...
	// find all maindata tables
	
	var tb;
	var idx;
	var tbls=document.getElementsByTagName("TABLE");
    
    
	var mdts=new Array;
	var divs=new Array();
	var chttbls=new Array();
	chartBtns = new Array();
   
    var tblFound = false;
      
	for(tb =0;tb< tbls.length;tb++) 
	{
		tblFound = false;
	
		maindataID = tbls[tb].getAttribute("id")
	    
		if(maindataID != null)
		{ 
			if(maindataID.indexOf("maindata") > -1) 
			{
				tblFound = true
			}
		}
	   
		if(tblFound == true) 
			mdts[mdts.length]=tbls[tb];
		else if (tbls[tb].getAttribute("id")=="chart") 
			chttbls[tbls.length]=tbls[tb]; 
	}
	
	tbls=document.getElementsByTagName("DIV");
	
	if(document.all)
	{
		for(tb =0;tb< tbls.length;tb++) 
			divs[divs.length]=tbls[tb];
	}
	else
	{
	  //##Fire Fox fix##
	   for(tb =0;tb< tbls.length;tb++)
	   { 
	      divs[divs.length]=tbls[tb];
	      divs[tb].setAttribute('sourceIndex',tb);
	   }
	}
	
	if(mdts.length==0) 
	{
		// initialize for dashboard mode
		ChartMode="D"

		chtIndex=0
		var chartcount=document.getElementsByTagName("chart").length
		for(idx=0;idx<chartcount;idx++) 
		{
			SetupChartData(
				idx,
				document.getElementsByTagName("chart")[idx].getAttributeNS("http://www.w3.org/2000/svg","url"), 
				document.getElementById("chart"+(idx+1)+"data"),
				document.getElementById("chart"+(idx+1)),
				document.getElementsByTagName("chart")[idx].getAttributeNS("http://www.w3.org/2000/svg","type"),
				document.getElementsByTagName("chart")[idx].getAttributeNS("http://www.w3.org/2000/svg","column"),
				document.getElementsByTagName("chart")[idx].getAttributeNS("http://www.w3.org/2000/svg","display"))
			if(document.getElementsByTagName("chart")[idx].getAttributeNS("http://www.w3.org/2000/svg","url")=="")
			{
				var chtid=document.getElementsByTagName("chart")[idx].getAttribute("table")
				for(tb=0;tb<chttbls.length;tb++) if(chttbls[tb].getAttribute("id") == chtid) {
				   AnalysisTables[idx]=chttbls[tb];
				}
			}
		}
					
		LoadOneChart();

	}
	else if(mdts.length >= 1) 
	{
	
	
		// initialize for Portfolio/Panel mode
		ChartMode="P"
		// find divs and tables for each main data table
		var cx=document.getElementsByTagName(chartelement)
		
		var ff_uniqueID = 0;
		for(tb=0;tb<cx.length;tb++) try {
			if(new String(cx[tb].getAttribute("onclick")).indexOf("LoadGraph") >= 0 ) {
			   if (document.all) {
				 chartBtns[chartBtns.length]=cx[tb].uniqueID;
				 }else {
		          //##Fire Fox fix##
		            cx[tb].setAttribute('sourceIndex',tb);
		            cx[tb].id = "ff_id" + ff_uniqueID++;
		            var chartID = cx[tb].id;
		            chartBtns[chartBtns.length]=chartID;
		         }
		         	
				// find accompanying div...
				var theDiv;
				
				if(document.all){
				  for(idx=0;idx<divs.length;idx++) if(divs[idx].sourceIndex > cx[tb].sourceIndex) {
					theDiv=divs[idx];			
					break;
				   }
				 }
				 else{
				//##Fire Fox fix##
				  for(idx=0;idx<divs.length;idx++){
			          var DivID = document.getElementById("svgCharts");
				      var DivSource = DivID.getAttribute('sourceIndex')
				      DivID.id = cx[tb].getAttribute('sourceIndex');
				      theDiv=divs[DivSource];
				      break; 
				       }
				    }
				
				var theTbl;
				// find accompanying table...
				for(idx=0;idx<mdts.length;idx++)
				{
					if(document.all)
					{ 
						if(mdts[idx].sourceIndex > cx[tb].sourceIndex) 
						{
							theTbl=mdts[idx];			
							break;
						}
					}
					else if (idx==ff_uniqueID-1)
					{
						//##Fire Fox fix##
						theTbl=mdts[idx];
						break;
					}
				}
				
				SetupChartData(chartBtns.length-1,null, theTbl,theDiv,ChartType,0)
			}
		}
		catch(e) {} finally {}

	}
	else {
	
		// initialize for Regular mode
		// find first div that has an id of 'svgCharts'
		ChartMode="R"
		for(tb =0;tb< divs.length;tb++) if(divs[tb].id='svgCharts') { svgCharts=divs[tb]; break;}


	}
	ChartsInitialized=true;
	// initialize chart arrays
	
}


// 
// set up chart arrays for one chart chart mode =P or D
//
function SetupChartData( chartid,chartURL, chartData,chartDiv,chartType,chartColumn, chartDisplay) { 
	
		
	if(Debugging) { alert ('svgchart.js.SetupChartData')};
	
	if(ChartMode=="P") AnalysisTables[chartid]=chartData;
	ChartLocs[chartid]=chartURL
	tbl[chartid]=chartData
	cht[chartid]=chartDiv
	ActiveSegment[chartid]=chartType
	SelectedColumn[chartid]=chartColumn
	Titles[chtIndex]="";
	
    
	
	if (chartDisplay == null )
		{
			displaymode[chartid]= 1;  //1 for show 
		}
		else {
			displaymode[chartid]= 0;  //0 for hide
		}
	
}

//
// child dialog  functions
//

function ChildChart(chartindex) { // open a drill down or expand a dashboard chart
	if(Debugging) { alert ('svgchart.js.ChildChart')};
	window.showModalDialog(childdlgurl,ChartContext[chartindex])
}

function SayStatus(msg) { // show status on dialog
	if(Debugging) { alert ('svgchart.js.SayStatus')};
	
	try {
	if(document.all){ 
	document.all.namedItem("statusinfo").innerText=msg;
	}
	else{
	//##Fire Fox fix##
	document.getElementById("statusinfo").textContent=msg;
	}
	} catch(e) {} finally {}
	
}

function HandleDrillDown() { // let parent know when we are loaded
	if(Debugging) { alert ('svgchart.js.HandleDrillDown')};
	
	//	applet.executeMethod("getWindow", null).getMember("opener").setDrillDownGraphDoc(document);
	window.opener.setDrillDownGraphDoc(document);
		 
}


//
// dashboard specific functions
//


function LoadOneChart(){ // load data into a div for a chart
	if(Debugging) { alert ('svgchart.js.LoadOneChart')};
	
// perform set up functions
	if(chtIndex>=ChartLocs.length) {
		SayStatus("")
		return; // stop when all loaded

	}
	if(ChartLocs[chtIndex]!='') {

		//instantiate XmlHttpRequest

		  // Checking if IE-specific document.all collection exists
		  // to see if we are running in IE
		  if (document.all) {
		    xhttp = new ActiveXObject("Msxml2.XMLHTTP");
		   } else {
		  // Mozilla - based browser
		    xhttp = new XMLHttpRequest();
		  }
		  SayStatus("Loading chart " + chtIndex + " from " +ChartLocs[chtIndex])
		  //hook the event handler
		  xhttp.onreadystatechange = HandlerOnReadyStateChange;
		  //prepare the call, http method=GET, false=asynchronous call
		  xhttp.open("GET", ChartLocs[chtIndex], false);
		  //finally send the call
		  xhttp.send();
	}
	else {
		// it is contained in a table in the div already
		try {
		if (displaymode[chtIndex] == 0) {
		      cht[chtIndex].innerHTML= insertSVG('chart' + chtIndex, svgurl, '0', '0');
			}
		else {
		       cht[chtIndex].innerHTML= insertSVG('chart' + chtIndex, svgurl, wd, ht);
			}
		}
		catch(e) {} finally {}
		
	}
}

function HandlerOnReadyStateChange(){  // handler for ready state change event for xmlhttp - dashboard mode only
	if(Debugging) { alert ('svgchart.js.HandlerOnReadyStateChange')};

// This handler is called 4 times for each
// state change of xmlhttp
// States are: 0 uninitialized
//      1 loading
//      2 loaded
//      3 interactive
//      4 complete
if (xhttp.readyState==4){

    tbl[chtIndex].innerHTML = xhttp.responseBody;

    AnalysisTables[chtIndex]=tbl[chtIndex].getElementById("maindata");  
    
    cht[chtIndex].innerHTML= insertSVG('chart', svgurl, wd, ht);
		try {
    var RespText=xhttp.responseText;

    var itle=RespText.split("itle>")

		Titles[chtIndex]= itle[1].replace("</t", '').replace("</T","");
		}
		catch(e) {
			try {
	    var RespText=xhttp.responseBody;

	    var itle=RespText.split("itle>")

			Titles[chtIndex]= itle[1].replace("</t", '').replace("</T","");
			}
			catch(e) {Titles[chtIndex]=="";} finally{}
		}
		finally{}

  }

}

//
// Misc helper functions
//

function dalert(mess) { // debugging alert

	if(Debugging) alert(mess);
}

function getDocument() {
	if(Debugging) { alert ('svgchart.js.getDocument')};
	return document;
}
//
// General Error Reporting Alert
//
var vbcrlf=String.fromCharCode(13,10)
function ErrorAlert(e) {

	if(Debugging) { alert ('svgchart.js.ErrorAlert')};
	
	// e is the error object
	msg="Error in "+ ErrorAlert.caller + ": " + vbcrlf
	msg+="    Error Number: " + e.number +vbcrlf
	msg+="          Description: " + e.description
	alert(msg)
}

//
// Load Graph function - called from chart button click
//

function whatTarget(e){
if(document.all) return (window.event.srcElement);
else return (e.target)
}

function LoadGraph(id,e) { 

	if(Debugging) { alert ('svgchart.js.LoadGraph')};
	
	lastrequestedchartid = id;
	
	if(!ChartsInitialized){
	  InitializeCharting();
	} 
	//if(svgurl=="chart.svg") ChartMode="R"
	var GraphsLoaded=false;
	
	svgCharts = document.getElementById("svgCharts")
	
	if (chartelement!="TD")
		$("#selectTable_" + id).show();
	else // support for when SAPUB patched to use old styles..
	{
		if(document.getElementById("selectHeader"+id)){
			var selectListheader = document.getElementById("selectHeader"+id)
		 }
		if(document.getElementById("List_"+id)){
			var selectList = document.getElementById("List_"+id)
		 }
		
		if(selectList){
			if(selectList.style.display =='none'){
				selectListheader.style.display = 'inline-block'
				selectList.style.display = 'inline-block'
			}
			else{
			   selectListheader.style.display = 'none'
				selectList.style.display = 'none'
			}
		}
		
	}
 
	if(ChartMode=="R") {
		try{
		    if(svgCharts.innerHTML!="") {GraphsLoaded=true;}
    		
		    if(GraphsLoaded) {
    			
	
			    if(svgCharts.style.display=="none") {
			        svgCharts.style.display="";	
			        		        
			    }
			    else {
			        svgCharts.style.display="none";
			    }
			    
		    }
		    else {
			    // load graphs
                  svgCharts.innerHTML= insertSVG(id,'', svgurl, '100%', '392.5');
		    }
		}
		catch(e) {
			
		}
	}
	else if(ChartMode=="P")
	{
	    // find the chart to open and set its index into chtIndex
	    var SrcElement = whatTarget(e);
	    if (SrcElement.tagName.toLowerCase() === "i") {
	        SrcElement = SrcElement.parentNode;
	    }

	    var chartID, srcID ;
	       if (document.all){
	                chartID = SrcElement.uniqueID
		          } else {
		            chartID = SrcElement.id;
		        }

	    srcID  = chartID;
	    
		chtIndex=-1;
		for(var idx=0;idx<chartBtns.length;idx++) {
			if(chartBtns[idx]==srcID) {
				chtIndex=idx;
				break;
			}
		}
		if(chtIndex>-1) {
			maindataID = chtIndex;
			
			svgCharts=cht[chtIndex];
			
			if(svgCharts.innerHTML!="") {GraphsLoaded=true;}
			if(GraphsLoaded) {
				if(svgCharts.style.display=="none") {svgCharts.style.display="";}
				else {svgCharts.style.display="none";}
			}
			else {
				
				// load graphs
                insertSVG(svgCharts,id,'', svgurl, '100%', '392.5');			
				
			}
		}
		else {
			var msg ="Cannot find info for chart" + srcID + String.fromCharCode(13,10);
			for(idx=0;idx<chartBtns.length;idx++) {
				msg+= chartBtns[idx] + String.fromCharCode(13,10)
			}
			
			alert(msg)
			chtIndex=0;
		}
		
	}

}

function LoadGraphEx() {  
	if(Debugging) { alert ('svgchart.js.LoadGraphEx')};

	InitializeCharting()
	ChartMode="R"
	forceChildData=true;
	LoadGraph()

	
}

function insertSVG(container,id,sname, svgsrc, swidth, sheight) 
{
    var SVGString = ''
    var maxMemory = null;
    if (parent != null && parent.document != null && parent.document.getElementById("main") != null) 
	{
		maxMemory = parent.document.getElementById("main").getAttribute("maxMemory");
    }

    // this is needed because protocols are now needed along with absolute file paths
    var path = document.location.pathname;
    var dir = path.substr(0, path.lastIndexOf('/')+1); // gives full path e.g. /e:/temp/ including first and last /
    // if loading from a file rather than a published site, the file protocol is needed
    var firstdir = dir.substr(0, path.indexOf('/',1)+1); // gives /e:/ when loading from unpublished site
    if (firstdir.lastIndexOf(':')!=-1 || firstdir.lastIndexOf('|')!=-1) // file location
    {
		var newfile = "file://" + dir + svgsrc
		svgsrc = newfile
    }


	if (container != null) 
	{
		try
		{		
			var s = Snap(container);
			
			Snap.load(svgsrc, function (f) {
				s.append(f);
				if (container.firstElementChild!=null)
				{
					var elem = SVG.adopt(container.firstElementChild);
					elem.attr({
						height: sheight,
						width: swidth
					});
					// Chrome wouldn't recognize the svg onload event so it was removed..
					var e = {target: container.firstElementChild};
					Initialize(e);
				}
				else
				{ // this is needed when using Chrome with a non-published site
					LoadSVGWithSnapByParsing(svgsrc,container,true,sheight,swidth,function () {
						// Chrome wouldn't recognize the svg onload event so it was removed..
						var e = {target: container.firstElementChild};
						Initialize(e);
						});
				}
			});
		}		
		catch(e)
		{ // this is needed when using IE with a non-published site
			LoadSVGWithSnapByParsing(svgsrc,container,true,sheight,swidth,function () {
				// Chrome wouldn't recognize the svg onload event so it was removed..
				var e = {target: container.firstElementChild};
				Initialize(e);
				});
		}
		
	}
	
	
    return SVGString;
}



      ColorArray = new Array("forestgreen", 
      			             "maroon", 
                             "orangered",
                             "orange",
                             "olive", 
                             "orchid", 
                             "steelblue", 
                             "darkcyan", 
                             "yellowgreen", 
                             "yellow",
			                 "purple", 
                             "royalblue", 
                             "deeppink",
                             "slategrey",
                             "saddlebrown")
                             

                             
      function Initialize(LoadEvent)
        {
          var SVGDocument = getTarget(LoadEvent); // really the SVG element rather than a document
           
          if(ChartContext==undefined) ChartContext=new Array();
          
          if(chtIndex==undefined) chtIndex=0
          ChartContext[chtIndex]=new Chart();
        
          ChartContext[chtIndex].InitializeChart(SVGDocument);
        }
        
// New Helper functions
	function HideElementById(doc,id) {
		var node = doc.getElementById(id);
		var elem = SVG.adopt(node);
	    elem.style("visibility", "hidden");
	}

	function ShowElementById(doc,id) {
		var node = doc.getElementById(id);
		var elem = SVG.adopt(node);
		elem.style("visibility", "visible");
		
	}
// new scatter point object
	function ScatterPoint(name,xval,yval,colorindex)
	{
	   this.PointName=name
	   this.X=xval
	   this.Y=yval
	   this.Color=ColorArray[colorindex % ColorArray.length];
	}

	
// Chart object--------------------        
      function Chart()
      {

        this.SVGWidth = 0; // width of Entire svg canvas
      	this.CurrentColor = 0;  // index into color array, holds curreent color to be rendered
      	this.ColList = new Array(); // list of columns in the current table
      	this.AnalysisTable=null; // current table used for charting
      	this.SVGDocument = null; // SVG DOM object
      	this.BarChartHeight = 75*3;  // height of the bar charts
      	this.BarChartWidth  = 75*5 // width of the bar charts
      
      	this.PieChartSize = 180 // radius of the Pie chart
      
      	this.MoveDistance = 40 // distance to move a pie segment when clicked
    
      	this.Values = new Array() // array of data points
      	this.Names = new Array() // array of names associated with hte data points
      
      	this.PieElements = new Array() // array of pie wedges 
      	this.PieElementLabels=new Array(); // NEW! pie wedge labels
      	this.BarElements = new Array() // array of bar elements
      	this.BarTexts = new Array() // array of text associated with each bar
      	this.DeleteList = new Array() // list of "selected" data items
      	this.Angles=new Array() // array of angles for pie wedges
      	this.Captions=new Array() // array of captions 
      	this.HNames=new Array() // array of horizontal bar chart names
      	this.HBarElements = new Array()  // array of horizontal bars
      	this.HBarTexts = new Array() // array of horizontal bar values
      	this.LineElements = new Array() // array of line elements
      	this.LineTexts = new Array() // array of line text
      	this.LineNames = new Array() // array of line names
      	
      	// new scatter elements
      	this.ScatterElements=new Array() // array of scatter diagram objects
      	this.ScatterTexts = new Array() // array of text elements associated with each scatter element
      	this.ScatterValues = new Array() // array of scatter point objects
      
      	this.PieTotalSize = 0; // total size of pie chart
      	this.BarTotalSize = 0; // total size of bar chart
      	this.HBarTotalSize = 0; // total size of horizontal bar chart
      	this.LineTotalSize = 0; // total size of Line chart
      	this.MaxSize = 0; // maximum size 
      
      	this.AngleFactor = Math.pow(2, .5) // used for angle calc in pie chart
      
      	this.Removed = false // flag for delete function  - should we refresh drawing
      	this.selList=null; // list box (ui element)


      	this.progress=null; // progress bar UI element
      	this.status=null; // 
	this.ProgressValue =0; //current progress value
	this.ParentGroup1=null; // groups of items for rendering
	this.ParentGroup2=null;
	this.ParentGroup3=null;
	this.ParentGroup4=null;
	this.ParentGroup5=null;
	
        this.Grandparent1=null;
        this.Grandparent2=null;
        this.Grandparent3=null;
        this.Grandparent4=null;
        this.Grandparent5=null;

	this.ActiveSegment=""; // current chart type
	this.GraphTitle="" // title for the graph
	this.GraphSubTitle="" // sub title for the graph
	this.ChartMax=0 // maximum values to display
	// drilldown/expand chart variables
	this.docURLprefix=null; // protocol for file load
	this.docChildURL=null; // url for child document
      	this.DrillDownGraphDoc=null // holds document object of child
      	this.ChildTitle=null // title for child
      	this.nwin=null // window object for child
	this.CBDCount=0; // count of selected pie/bar/line segments
	this.Drilldowntbl=null; // table for drill down chart
	this.ChildDebug=false//should child show with debug messages
	this.ChildDialog=null // child dialoig object
	this.Expanding=false; // flag for currently expanding (dashboard mode only)
      	//tool tip
      	this.myBox=null;
      	this.myTip=null;   
      	this.myBck=null;
      	this.forceChildData=false;
      }
      
// Property functions

      Chart.prototype.getSelectedColumn=function() {
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.getSelectedColumn=function')};
      	
      	 return new Number((this.SVGDocument.getElementById("ChartExternalSettings").getAttributeNS("http://www.w3.org/2000/svg","selectedcolumn")));
      }
      Chart.prototype.setSelectedColumn=function(newval) {
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.getSelectedColumn=function(newval)')};
      	
      	 this.SVGDocument.getElementById("ChartExternalSettings").setAttributeNS("http://www.w3.org/2000/svg","selectedcolumn",newval)
      	 
      }
      
      Chart.prototype.getChartMode=function() {
      	 if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.getChartMode=function')};
      	 return (this.SVGDocument.getElementById("ChartExternalSettings").getAttributeNS("http://www.w3.org/2000/svg","chartmode"))
      }
      Chart.prototype.setChartMode=function(newval) {
      	     	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.setChartMode=function(newval)')};
      	 this.SVGDocument.getElementById("ChartExternalSettings").setAttributeNS("http://www.w3.org/2000/svg","chartmode",newval)	
      }
      Chart.prototype.getChartIndex=function() {
      	 if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.getChartIndex=function')};
		 
		 var elem = this.SVGDocument.getElementById("ChartExternalSettings");
				
      	 return (elem.getAttributeNS("http://www.w3.org/2000/svg","chartindex"))
      }
      Chart.prototype.setChartIndex=function(newval) {
      	     	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.setChildIndex=function(newval)')};
      	 this.SVGDocument.getElementById("ChartExternalSettings").setAttributeNS("http://www.w3.org/2000/svg","chartindex",newval)	
      	 
      }
      
      Chart.prototype.SetAnalysisTable=function( tbl) {
           	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.SetAnalysisTable=function( tbl)')};
      	this.AnalysisTable=tbl;
 
      	this.InitAnalysisTable();
      }      	
      
      Chart.prototype.GetAnalysisTable=function() {
      if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.GetAnalysisTable=function')};
      	return this.AnalysisTable;
      }




      // Initialization functions
      var bFF = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

      Chart.prototype.FindDefaultColumn=function() {
 	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.FindDefaultColumn=function')};     
      	if(this.getSelectedColumn()!=0) return;
    
      	
      }

      Chart.prototype.InitAnalysisTable=function() {
     
       	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.InitAnalysisTable=function')};   
      	var tbl=this.GetAnalysisTable()
      	if(tbl!=null) {
      	
		var col;
		this.ColList=new Array;

		if (Chart.maindata==undefined)
			Chart.maindata = maindataID;
		var maintblID = Chart.maindata;
		
		if(maintblID == -1){
		    var tgs = tbl.getElementsByTagName("th");
		}
		else{
		    var tab = tbl
		    var tgs = tab.getElementsByTagName("th");
		}
		
		for(var i=0;i<tgs.length;i++) {
		
		     if (bFF == true){
		       col=tgs[i].textContent; //Fire Fox fix 
		     }
		     else{
		        col=tgs[i].innerText;  //IE
		     }
		      
		      if((col=="Managing Partner")  && (this.getSelectedColumn() <=0)) this.setSelectedColumn(i);
		      this.ColList[this.ColList.length]=col
		     }
		  
		     
		this.FindDefaultColumn();
		this.makeSelectList();
	      }
      }
      
    Chart.prototype.InitializeChart=function(xSVGDocument) {
	 	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.InitializeChart=function(xSVGDocument)')};   
	this.SVGDocument = xSVGDocument;
	this.setChartIndex(chtIndex);          
	this.setChartMode(ChartMode);
	this.forceChildData=forceChildData
	
	this.SVGDocument.getElementById("refreshbtn").setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].RefreshChart();");
	this.SVGDocument.getElementById("vbarbtn").setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].ShowBar();");
	this.SVGDocument.getElementById("hbarbtn").setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].ShowHBar();")
	this.SVGDocument.getElementById("linebtn").setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].ShowLine();")
	this.SVGDocument.getElementById("piebtn").setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].ShowPie();")
	this.SVGDocument.getElementById("morebtn").setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].ShowMore();")
	this.SVGDocument.getElementById("lessbtn").setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].ShowLess();") 
	
	this.SVGDocument.getElementById("refreshbtn").setAttributeNS(null,"cursor","pointer");
	this.SVGDocument.getElementById("vbarbtn").setAttributeNS(null,"cursor","pointer");
	this.SVGDocument.getElementById("hbarbtn").setAttributeNS(null,"cursor","pointer");
	this.SVGDocument.getElementById("linebtn").setAttributeNS(null,"cursor","pointer");
	this.SVGDocument.getElementById("piebtn").setAttributeNS(null,"cursor","pointer");
	this.SVGDocument.getElementById("morebtn").setAttributeNS(null,"cursor","pointer");
	this.SVGDocument.getElementById("lessbtn").setAttributeNS(null,"cursor","pointer");
	
      	this.ParentGroup1 = this.SVGDocument.getElementById("slices")
      	this.Grandparent1 = this.SVGDocument.getElementById("piechart")
      	this.ParentGroup2 = this.SVGDocument.getElementById("bars")
      	this.Grandparent2 = this.SVGDocument.getElementById("barchart")
      	this.ParentGroup3 = this.SVGDocument.getElementById("hbars")
      	this.Grandparent3 = this.SVGDocument.getElementById("hbarchart")
          
      	this.ParentGroup4 = this.SVGDocument.getElementById("linenodes")
      	this.Grandparent4 = this.SVGDocument.getElementById("linechart")
      	this.progress = this.SVGDocument.getElementById("progress");
      	this.status   = this.SVGDocument.getElementById("status").firstChild;
      	
		this.docURLprefix=window.parent.location.protocol;
	
      	this.setSelectedColumn(0);
        var tbl;
        if(this.getChartMode() =="R"){

        this.SetTitles("","Loading, please wait...")
      	this.SetupUI();
		// find table 
		// ############################################################################################################
		// ############################################################################################################
		
		var maindatatblID = maindataID;
		
		if(maindatatblID == -1){
			tbl=window.document.getElementById("maindata-1");
		}
		else{
			tbl=window.document.getElementById("maindata"+maindatatblID);
		}
		
		// ############################################################################################################
		// ############################################################################################################
		
			this.docURLprefix=window.parent.location.protocol;
			this.docChildURL=window.parent.location.href;

		this.setSelectedColumn(SelectedColumn);
		 if(this.ActiveSegment=="") this.ActiveSegment="Pie";
		
	}
	else if(this.getChartMode() =="P") { // portfolio
      	this.SetTitles("","Loading, please wait...")
      	if(document.all){	
			window.parent.attachEvent("onresize",this.SetupUI);
		    }
		else{
		//##Fire Fox fix##
			window.parent.addEventListener("onresize",this.SetupUI);
		    }

      	this.SetupUI()
		// find table 
		var ci=this.getChartIndex();
		
		this.setSelectedColumn(SelectedColumn[ci]);
   		this.ActiveSegment=ActiveSegment[ci]; 
   		tbl=AnalysisTables[ci];
      		
			this.docURLprefix=window.parent.location.protocol;
			this.docChildURL=window.parent.location.href;
		
		
		this.getSelectedColumn()
	}
	
	else if(this.getChartMode() =="D") { // dashboard
		
		
		var ci=this.getChartIndex();
		
		this.SetupUIDashboard()
		
		this.docChildURL=ChartLocs[ci];
		this.setSelectedColumn(SelectedColumn[ci]);
		
   		this.ActiveSegment=ActiveSegment[ci]; 
   		tbl=AnalysisTables[ci];
   		
     }
	HideElementById(this.SVGDocument,"hlabels")

   this.SetAnalysisTable(tbl);

      	//tool tip
   	
      	this.myBox=this.SVGDocument.getElementById('toolTipBox')
      	this.myTip=this.SVGDocument.getElementById('toolTipText');
      	this.myBck=this.SVGDocument.getElementById('toolTipBack');
      	
      	chtIndex++;
  	
  		setTimeout('ChartContext['+this.getChartIndex()+'].LoadChartDataFromTable('+this.getSelectedColumn()+',"'+this.ActiveSegment+'");',100);

      }
      
      Chart.prototype.makeSelectList=function() {
     
      
      if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.makeSelectList=function()')};   
      
      	 // determine size of the list box
      	 var colmax=0
      	 var colindex=0
      	 
      	 for(var i=0; i<this.ColList.length;i++) if(this.ColList[i].length > colmax) { colmax=this.ColList[i].length; colindex=i;}
      	 var listwidth=colmax*5.3;
      	 if((colmax< 30) ||  (this.getChartMode() =="D") ) listwidth*=1.5;
	 if(listwidth > this.SVGDocument.getAttributeNS(null,"width") / 7) {
	 	
		
		if(this.getChartMode() =="D") {
			//SVGDocument.getElementById("controlpanel").setAttributeNS(null,"transform","translate("+((SVGDocument.width-(listwidth+16)))+",2)") 
		}
		else this.SVGDocument.getElementById("controlpanel").setAttributeNS(null,"transform","translate("+((this.SVGDocument.getAttributeNS(null,"width")/2)-(listwidth/2)-16)+",0)") 
	 }
	    //#########   CREATE SELECT LIST AND POPULATE IT WITH ColList values(<th> names)
	 
		 var thisDoc = window.document;
      	 
      	 var maintblID = lastrequestedchartid // NOT maindataID
      	 
		
		 
	     if(maintblID == "-1"){
	       var select = thisDoc.getElementById("List_-1")
	      }
	     else{
            var select = thisDoc.getElementById("List_"+maintblID+"")
          }
  	     
  	     var optionLength = this.ColList.length;	   // variable to hold column number
      	 
      	 if(select){
      	    select.options.length = optionLength  // sets option length = column number
      	 
      	       	       	
            for(i=0;i<optionLength;i++){
            
				select.options[i].text = this.ColList[i];
				select.options[i].value = i;
                
            }
         }
     }

      Chart.prototype.SetupUIDashboard=function(e) {
      	  if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.SetupUIDashboard=function(e)')};  
      	  
      	  var ss=1
      	  TipScale=true;
      	
      	
		  if(window.screen.availWidth > 800) 
			ss=1.25
      	  if(window.screen.availWidth > 1024) 
			ss=1.5
      	  
		  innerWidth = availablewidth;
      	  
		  var sf=ss*innerWidth/window.screen.availWidth//1400
      	  
      	  this.SVGDocument.setAttributeNS(null,"width", innerWidth);
      	  this.SVGDocument.setAttributeNS(null,"height", innerHeight);
      	  this.SVGDocument.getElementById("legendname").firstChild.data="Legend"
          this.SVGDocument.getElementById("chartbase").setAttributeNS(null,"transform","translate(0, 0) scale("+(sf)+","+(sf)+")")
          this.SVGDocument.getElementById("piechart").setAttributeNS(null,"transform","translate(" + (sf*(200+2*this.PieChartSize))+ ", " +(sf*(220+2*this.PieChartSize))+") scale(1, .5)")
          
		  if(window.screen.availWidth > 1000)
          	this.SVGDocument.getElementById("btnpanel").setAttributeNS(null,"transform","translate("+(sf*(this.SVGDocument.getAttributeNS(null,"width")-280))+", "+(this.SVGDocument.getAttributeNS(null,"height")-17) +")");
		  else 
			this.SVGDocument.getElementById("btnpanel").setAttributeNS(null,"transform","translate(20,"+(this.SVGDocument.getAttributeNS(null,"height")-17) +")  scale("+(1-sf)+","+(1-sf)+")");
		  this.SVGDocument.getElementById("controlpanel").setAttributeNS(null,"transform","translate("+(sf*(this.SVGDocument.getAttributeNS(null,"width")-100))+", 2)") //
		  HideElementById(this.SVGDocument,"controlpanel")
		  this.BarChartWidth  = this.SVGDocument.getAttributeNS(null,"width");
		  
		  this.SVGDocument.getElementById("legendbox").setAttributeNS(null,"transform","translate(" +((2.5*this.PieChartSize))+",-85) scale(2,2)")
		  
		  this.MoveDistance = 30
		  HideElementById(this.SVGDocument,"hlabels")
		  this.SVGDocument.getElementById("expandbtn").setAttributeNS(null,"style", "visibility:visible")
		  this.SVGDocument.getElementById("expandbtn").setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].Expand();") 
		  HideElementById(this.SVGDocument,"grtitle")  // show in large font...
		  
		  // Move sub-title ("title elment" to grtitle's position
		  this.SVGDocument.getElementById("title").setAttributeNS(null,"x",innerWidth)
		  this.SVGDocument.getElementById("title").setAttributeNS(null,"y","30")
		  this.SVGDocument.getElementById("title").setAttributeNS(null,"style","font-weight:bold;text-anchor:middle;font-size:30")

		  this.ChartMax=5;

		  
		  }
    	
      Chart.prototype.SetUpObjectToolTip=function(theobj,tip)      {
       
      if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.SetUpObjectToolTip=function(theobj,tip)')};  
      
      		theobj.setAttributeNS(null,"onmouseover", "showToolTip(evt, '"+tip+"')"  )
      		theobj.setAttributeNS(null,"onmouseout","hideToolTip(evt);")
      }
	
      Chart.prototype.SetupUI=function(e) {
      
		var innerWidth = availablewidth;
      	   if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.SetUpUI=function(e)')};  
          this.SVGDocument.setAttributeNS(null,"width", innerWidth);
          
          this.SVGDocument.getElementById("legendbox").setAttributeNS(null,"transform","translate("+this.SVGDocument.getAttributeNS(null,"width")/2+",0)")
          
          this.SVGDocument.getElementById("btnpanel").setAttributeNS(null,"transform","translate("+(this.SVGDocument.getAttributeNS(null,"width")-262)+",0)")
	  this.SVGDocument.getElementById("controlpanel").setAttributeNS(null,"transform","translate("+((this.SVGDocument.getAttributeNS(null,"width")/2)-this.SVGDocument.getAttributeNS(null,"width")/7-16)+",0)") //
	  this.BarChartWidth  = this.SVGDocument.getAttributeNS(null,"width") / 7
	        
	  this.PieChartSize = this.SVGDocument.getAttributeNS(null,"width") / 7
	      
	  this.MoveDistance = 30
	  
	  if(e!=null) this.Refresh();

	  }

      // Chart building/clearing/deleting functions
      Chart.prototype.ClearChart=function()
       
        {
       if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.ClearChart=function()')};     
          for (var I = 0; I < this.PieElements.length; I++)
            {
              this.ParentGroup1.removeChild(this.PieElements[I])
              this.ParentGroup1.removeChild(this.PieElementLabels[I])
              this.ParentGroup2.removeChild(this.BarElements[I])
              this.ParentGroup2.removeChild(this.BarTexts[I])
              this.ParentGroup3.removeChild(this.HBarElements[I])
              this.ParentGroup3.removeChild(this.HBarTexts[I])
              this.ParentGroup4.removeChild(this.LineElements[I])
	      this.ParentGroup4.removeChild(this.LineTexts[I])
              
              this.SVGDocument.getElementById("labels").removeChild(this.Names[I])
              this.SVGDocument.getElementById("hlabels").removeChild(this.HNames[I])
              this.SVGDocument.getElementById("linelabels").removeChild(this.LineNames[I])
            }
          this.DeleteList = new Array()
          this.PieElements = new Array()
          this.PieElementLabels = new Array()
          this.BarElements = new Array()
          this.BarTexts = new Array()
          this.Values = new Array()
          this.Names = new Array()
          this.Angles= new Array()
          this.Captions= new Array()
	  this.HNames=new Array()
          this.HBarElements = new Array()
          this.HBarTexts = new Array()
	  this.LineElements = new Array()
          this.LineTexts = new Array()
          this.LineNames=new Array()

          this.PieTotalSize = 0;
          this.BarTotalSize = 0;
          this.HBarTotalSize = 0;
          this.LineTotalSize = 0;
          this.MaxSize = 0;
	  this.CurrentColor = 0;
	  
          if (!(this.Removed))
            {
              this.Grandparent1.removeChild(this.ParentGroup1)
              this.Grandparent2.removeChild(this.ParentGroup2)
              this.Grandparent3.removeChild(this.ParentGroup3)
              this.Grandparent4.removeChild(this.ParentGroup4)
            }
          this.Removed = true
          this.ClearLegend()
        }
        
        
        
      Chart.prototype.SelectChange=function(GroupName,ActiveSelection,SelectString) {
		if (chtIndex==-1) // when there is only one chart on a page
			chtIndex = maindataID+1;
        ChartContext[chtIndex - 1].activeSelection = ActiveSelection;
      	if(ChartContext[chtIndex - 1].ChildDebug) { alert ('chart.svg.Chart.prototype.SelectChange=function(GroupName,ActiveSelection,SelectString)')};  
      	ChartContext[chtIndex - 1].setSelectedColumn(ActiveSelection);
      	
      	ChartContext[chtIndex - 1].LoadChartDataFromTable(ActiveSelection,ChartContext[chtIndex - 1].ActiveSegment);
      }
      
      
      Chart.prototype.ShowProgress=function() {
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.ShowProgress=function()')};  
        
        var percent = Math.round(this.ProgressValue);
        
      	this.progress.setAttributeNS(null, "width", percent * 1.5);
    	this.status.data = percent + "%";
    	
        if (percent ==100) { this.SVGDocument.getElementById("progressbar").setAttributeNS(null,"display", "none") } 
    	if (( (Math.round (percent/10))*10 ) == percent  ) {
    		
    	}
          return;
    }
      
    
    

      Chart.prototype.RefreshChart=function() {
      
      if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.RefreshChart=function()')};  
      		this.LoadChartDataFromTable(this.getSelectedColumn(),this.ActiveSegment)
      }
      Chart.prototype.ShowMore=function() {
      
            if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.ShowMore=function()')}; 
      		
      		if(this.ChartMax==0) return; // at max
      		this.ChartMax++
      		if (this.ChartMax > ColorArray.length-2) this.ChartMax= -1;
      		this.RefreshChart();
      		
      }
      Chart.prototype.ShowLess=function() {
      		      if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.ShowLess=function()')}; 
      		if(this.ChartMax==1) return;
      		if(this.ChartMax < 0) this.ChartMax=ColorArray.length-2;
      		else if(this.ChartMax==0) this.ChartMax=-1
		else this.ChartMax--;
		this.RefreshChart();
		

      }

      Chart.prototype.LoadChartDataFromTable=function(col, charttyp) {

      
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.LoadChartDataFromTable=function(col, charttyp)')}; 
      	
      	var Start = new Date().getTime(); 
    
      	if (col == -1) { return; }
      	
      	var ci=this.getChartIndex()
      	
      	this.ClearChart();
      	this.setSelectedColumn(col);
      	
      	this.SetTitles("","");
      	
      	
      	
      	if(this.GetAnalysisTable()==null) 
      	{
      		
      		return;
      	}
      	
        var tbl=this.GetAnalysisTable();
      	var subttl = this.ColList[col]

      	if(this.getChartMode() =="D") this.SetTitles(subttl,Titles[ci]);
	    else {
	      	if(this.ChartMax==-1) subttl+=" (Maximum " + (ColorArray.length-2) + " values)"
	      	else if(this.ChartMax > 0) subttl+=" (Maximum " + (this.ChartMax) + " values)"
		this.SetTitles("",subttl);
		
	    }      	
      	
	    var maintblID = maindataID
		
		var rowcount=tbl.rows.length;
	
        var vals=new Object();
      	var valcount=0;
      	var theval;
      	
      	
      	for(var i=1;i<rowcount;i++) 
		{
      	   var therow=tbl.rows[i];
      	   
			if(therow.cells.length >= col ) 
			{
				var thecell=therow.cells[col];
      		
      		
				if (thecell != null) 
				{
					if (bFF == true)
					{
						theval=therow.cells[col].textContent;  //FireFox fix
					}
					else
					{
						theval=therow.cells[col].innerText;   //IE
					}
      	  
					if(vals.hasOwnProperty(theval)) 
					{
						vals[theval]=vals[theval]+1;
					}
					else 
					{
						vals[theval]=1;
						valcount+=1;
					}
      			}
      			
      		}
      	}
        
       var ky;
          	var sortedvals=new Array();
          	
          	for(ky in vals) {
              if(sortedvals[vals[ky]]==null) {sortedvals[vals[ky]]=ky;}
      		  else {sortedvals[vals[ky]]+="|"+ky;}
      	}
      	
	
	var j = 0; 
      	if(this.ChartMax == 0) { // use old method...
      		j = 0;
      		    		
      		for(i<sortedvals.length-1;i>=0;i--) {
      			
      			j = j + 1;
      			if(sortedvals[i]!=null) {
      			// split value into keys
      				var keys=sortedvals[i].split("|")
    				
      				for(ky =0;ky< keys.length;ky++) { 
      				   this.AddChartValue(i,keys[ky],false, keys.length); 
      				
                   }
      		}
      			 
           this.ProgressValue = j/(i + j)*100;
      	   this.ShowProgress();
      }
  }
        else {
        	j = 0;
        	var CMAx=ColorArray.length-2; // for ChartMax==-1
      		if(this.ChartMax > 0 ) { CMAx=this.ChartMax - 1;}// fix to this number of points...
      		
		CMVals= new Array();
		CMNames= new Array();
		for(i<sortedvals.length-1;i>=0;i--) {
			j = j + 1;
			if(sortedvals[i]!=null) {
			// split value into keys
				var keys=sortedvals[i].split("|")
				for(ky =0;ky< keys.length;ky++) { 
					if((CMNames.length < CMAx)||(valcount <= CMAx+1)) {
						CMNames[CMNames.length]=keys[ky];
						CMVals[CMVals.length]=i;
					}
					else {
						if(CMNames[CMAx]==null) {
							CMNames[CMAx]="<All Others>";
							CMVals[CMAx]=0;
	
						}
						CMVals[CMAx]+=i;
					}
				}
			}
			this.ProgressValue = j/(i + j)*100;
			      			
      			this.ShowProgress();
		}
                 
	       for(i=0;i<CMNames.length;i++) {
		   this.AddChartValue(CMVals[i],CMNames[i],false, CMNames.length); 
		}  
	}
      	
      	if(charttyp==undefined) {charttyp=this.ActiveSegment;}
      	else this.ActiveSegment=charttyp;

		
		if(charttyp=="Pie") this.ShowPie();
		if(charttyp=="Bar") this.ShowBar();
		if(charttyp=="HBar") this.ShowHBar();
		if(charttyp=="Line") this.ShowLine();
	      	this.Refresh();
        
        if(this.getChartMode()=="D") {
		LoadOneChart();
        }
    }

 
      Chart.prototype.MoveOverSegments=function(i){
          Element = this.PieElements[i]
          Element.setAttributeNS(null,"opacity","0.80")
      }
      
      Chart.prototype.MoveOutSegments=function(i){
          Element = this.PieElements[i]
          Element.setAttributeNS(null,"opacity","1")
      }

      
      Chart.prototype.AddChartValue=function(Value, Name, Repress, SegmentCount)
        {
        if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.AddChartValue=function(Value, Name, Repress, SegmentCount)')}; 
        var Start = new Date().getTime(); 
	
	
	
          Value = Value * 1
          
          if ((Value <= 0) || (isNaN(Value)))
            {
            return;
            }
            
          Color = ColorArray[this.CurrentColor]
          Name=Name.replace("'","´")
          if((Name==" ")||(Name=="")||(Name==null)) {
          	Name="<blank>"
          }
          
          
          this.Captions[this.Captions.length]=Name

          this.CurrentColor++
          if (this.CurrentColor >= ColorArray.length) this.CurrentColor = 0
          
          
          if (!(this.Removed))
            {
              this.Grandparent1.removeChild(this.ParentGroup1)
              this.Grandparent2.removeChild(this.ParentGroup2)
              this.Grandparent3.removeChild(this.ParentGroup3)
              this.Grandparent4.removeChild(this.ParentGroup4)
            }
          
          this.DeleteList[this.DeleteList.length] = false
          
          this.Values[this.Values.length] = Value * 1
	  // Pie Chart
        this.Names[this.Names.length] = document.createElementNS(null,"text")
        this.PieElements[this.PieElements.length] = document.createElementNS("http://www.w3.org/2000/svg", "path")    
        this.PieElements[this.PieElements.length - 1].setAttributeNS(null,"fill",Color)  
        this.PieElements[this.PieElements.length - 1].setAttributeNS(null,"stroke","black")  
        this.PieElements[this.PieElements.length - 1].setAttributeNS(null,"id","pie"+Color)  
        this.PieElements[this.PieElements.length - 1].setAttributeNS(null,"cursor","pointer");             
        this.PieElementLabels[this.PieElementLabels.length]= document.createElementNS("http://www.w3.org/2000/svg","text")
    	this.PieElementLabels[this.PieElementLabels.length-1].appendChild(this.SVGDocument.ownerDocument.createTextNode(this.Values[this.PieElementLabels.length-1]))
        this.ParentGroup1.appendChild(this.PieElementLabels[this.PieElementLabels.length-1])
        this.SetUpObjectToolTip(this.PieElements[this.PieElements.length - 1], Name + " - " + Value)
        this.ParentGroup1.appendChild(this.PieElements[this.PieElements.length - 1])
        
         // Bar Chart
	      
	      this.BarTexts[this.BarTexts.length] = document.createElementNS("http://www.w3.org/2000/svg","text")
          this.BarElements[this.BarElements.length] = document.createElementNS("http://www.w3.org/2000/svg","path")
          this.BarElements[this.BarElements.length - 1].setAttributeNS(null,"fill", Color)      
          this.BarElements[this.BarElements.length - 1].setAttributeNS(null,"stroke", "black")  
          this.BarElements[this.BarElements.length - 1].setAttributeNS(null,"opacity", "0.7")   
          this.BarElements[this.BarElements.length - 1].setAttributeNS(null,"id", "bar"+ Color)   
          this.BarElements[this.BarElements.length - 1].setAttributeNS(null,"cursor","pointer")
          this.BarElements[this.BarElements.length - 1].setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].doLegendClick(" + (this.BarTexts.length - 1) + ");")
          this.SetUpObjectToolTip(this.BarElements[this.BarElements.length - 1], Name + " - " + Value)
          this.ParentGroup2.appendChild(this.BarElements[this.BarElements.length - 1])
          
          this.BarTexts[this.BarTexts.length - 1].setAttributeNS(null,"style", "text-anchor:middle;font-weight:bold;font-size:13;visibility:hidden")
          this.BarTexts[this.BarTexts.length - 1].appendChild(this.SVGDocument.ownerDocument.createTextNode(Value ))
          this.ParentGroup2.appendChild(this.BarTexts[this.BarTexts.length - 1])

          this.Names[this.Names.length - 1].appendChild(this.SVGDocument.ownerDocument.createTextNode(Name + ""))
          this.Names[this.Names.length - 1].setAttributeNS(null,"transform", "rotate(45)")
	      
	      this.Names[this.Names.length - 1].setAttributeNS(null,"text-anchor", "middle")      
          this.Names[this.Names.length - 1].setAttributeNS(null,"font-weight", "bold")  
          this.Names[this.Names.length - 1].setAttributeNS(null,"font-size", "13")   
          this.Names[this.Names.length - 1].setAttributeNS(null,"visibility", "hidden")   
          this.Names[this.Names.length - 1].setAttributeNS(null,"cursor","pointer");

          this.SVGDocument.getElementById("labels").appendChild(this.Names[this.Names.length - 1])
          
          // Horizontal Bar Chart
          this.HNames[this.HNames.length] = document.createElementNS("http://www.w3.org/2000/svg","text")
          this.HBarElements[this.HBarElements.length] = document.createElementNS("http://www.w3.org/2000/svg","path")
          this.HBarTexts[this.HBarTexts.length] = document.createElementNS("http://www.w3.org/2000/svg","text")
          this.HBarElements[this.HBarElements.length - 1].setAttributeNS(null,"fill", Color)      
          this.HBarElements[this.HBarElements.length - 1].setAttributeNS(null,"stroke", "black")  
          this.HBarElements[this.HBarElements.length - 1].setAttributeNS(null,"opacity", "0.7")   
          this.HBarElements[this.HBarElements.length - 1].setAttributeNS(null,"id", "hbar" + Color)   
        
          
          this.HBarElements[this.BarElements.length - 1].setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].doLegendClick(" + (this.HBarTexts.length - 1) + ");")
          this.SetUpObjectToolTip(this.HBarElements[this.HBarElements.length - 1], Name + " - " + Value)
          this.ParentGroup3.appendChild(this.HBarElements[this.HBarElements.length - 1])
          
          this.HBarTexts[this.HBarTexts.length - 1].setAttributeNS(null,"style", "text-anchor:end;font-weight:bold;font-size:13;visibility:hidden")
          this.HBarTexts[this.HBarTexts.length - 1].appendChild(this.SVGDocument.ownerDocument.createTextNode(Value ))
          this.HNames[this.HNames.length - 1].appendChild(this.SVGDocument.ownerDocument.createTextNode(Name + ""))
          this.HNames[this.HNames.length - 1].setAttributeNS(null,"style", "text-anchor:middle;font-weight:bold;font-size:13;visibility:hidden")
          this.SVGDocument.getElementById("hlabels").appendChild(this.HNames[this.HNames.length - 1])
	      this.ParentGroup3.appendChild(this.HBarTexts[this.HBarTexts.length - 1])
	  
	  // Line Chart
          this.LineNames[this.LineNames.length] = document.createElementNS("http://www.w3.org/2000/svg","text")
          this.LineElements[this.LineElements.length] = document.createElementNS("http://www.w3.org/2000/svg","circle")
          this.LineTexts[this.LineTexts.length] = document.createElementNS("http://www.w3.org/2000/svg","text")
          
          this.LineElements[this.LineElements.length-1].setAttributeNS(null,"fill",Color)     
          this.LineElements[this.LineElements.length-1].setAttributeNS(null,"stroke","black") 
          this.LineElements[this.LineElements.length-1].setAttributeNS(null,"opacity","0.7")  
          this.LineElements[this.LineElements.length-1].setAttributeNS(null,"r","300")  
          
          this.LineElements[this.LineElements.length-1].setAttributeNS(null,"cx","0")  
          this.LineElements[this.LineElements.length-1].setAttributeNS(null,"cy","0")  
          this.LineElements[this.LineElements.length-1].setAttributeNS(null,"cursor","pointer");
          
	  this.LineElements[this.LineElements.length-1].setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].doLegendClick(" + (this.LineTexts.length - 1) + ");")
	  this.SetUpObjectToolTip(this.LineElements[this.LineElements.length - 1], Name + " - " + Value)
	  this.ParentGroup4.appendChild(this.LineElements[this.LineElements.length-1])
	  
          this.LineTexts[this.LineTexts.length - 1].setAttributeNS(null,"style", "text-anchor:middle;font-weight:bold;font-size:13;visibility:hidden")
          this.LineTexts[this.LineTexts.length - 1].appendChild(this.SVGDocument.ownerDocument.createTextNode(Value ))
          this.LineNames[this.LineNames.length - 1].appendChild(this.SVGDocument.ownerDocument.createTextNode(Name + ""))
          this.LineNames[this.LineNames.length - 1].setAttributeNS(null,"style", "text-anchor:middle;font-weight:bold;font-size:13;visibility:hidden")
          this.SVGDocument.getElementById("linelabels").appendChild(this.LineNames[this.LineNames.length - 1])
          this.ParentGroup4.appendChild(this.LineTexts[this.LineTexts.length - 1])
	  
	  
	  
          
          if (Repress)
            this.Removed = true
          else
            {
              this.Removed = false
              this.Grandparent1.appendChild(this.ParentGroup1)
              this.Grandparent2.appendChild(this.ParentGroup2)
              this.Grandparent3.appendChild(this.ParentGroup3)
              this.Grandparent4.appendChild(this.ParentGroup4)
            }
        }
      
        
      Chart.prototype.Refresh=function()
        {
        
        if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.Refresh=function()')}; 
        
          this.PieTotalSize = 0
          this.BarTotalSize = 0
          this.LineTotalSize = 0
          this.MaxSize = 0
          
          for (var I = 0; I < this.Values.length; I++)
            {
              this.PieTotalSize += this.Values[I]
              this.BarTotalSize++
	      this.LineTotalSize++
              if (this.Values[I] > this.MaxSize)
                this.MaxSize = this.Values[I]
            }
          
          this.PieStart = 0
          this.BarStart = 0
	  this.HBarStart = this.BarChartHeight+10
	  
	  this.LineStart = 0
	  
          if (this.PieTotalSize > 0) {
            for (var I = 0; I < this.Values.length; I++)
              {
                this.PieStart = this.DrawPieSegment(this.PieStart, this.Values[I] / this.PieTotalSize, this.PieElements[I], I)
                this.BarStart = this.DrawBarSegment(this.BarStart, this.Values[I] / this.MaxSize, this.BarElements[I], this.BarTexts[I], this.Names[I])
                this.DeleteList[I]=false
                
                
              }
             for(var I=this.Values.length-1;I>=0;I-- )
             {
             		this.HBarStart=this.BarChartHeight-(this.BarChartHeight / (this.BarTotalSize+1))*(I+1)
             		
             		this.DrawHBarSegment(this.HBarStart, this.Values[I] / this.MaxSize, this.HBarElements[I], this.HBarTexts[I], this.HNames[I],I)
             		
             }
             // Draw Line chart
             this.DrawLineChart()   
             
          }
          
          // remove and re-add group for list box, should force to front
          
          var cp=this.SVGDocument.getElementById("controlpanel")
          var pn=cp.parentNode
         
          pn.removeChild(cp)
          pn.appendChild(cp)
          
        }
        
      Chart.prototype.DrawLineChart=function(){
      if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.DrawLineChart=function()')}; 
      
      		LinePath="M"+(this.BarChartWidth/this.Values.length)+" " +(-1*this.Values[0]/this.MaxSize*this.BarChartHeight)
      		for(I=0;I<this.Values.length;I++) {
      			X=((this.BarChartWidth/this.Values.length)*(I+1))
      			Y=(-1*this.Values[I]/this.MaxSize*this.BarChartHeight)
      			LinePath=LinePath+"L"+X+" "+Y
      			
      			this.LineElements[I].setAttributeNS(null,"cx",X)
      			this.LineElements[I].setAttributeNS(null,"cy",Y)
      			this.LineElements[I].setAttributeNS(null,"r",5)
      			this.LineTexts[I].setAttributeNS(null,"x",X)
      			this.LineTexts[I].setAttributeNS(null,"y",Y+20)
      			this.LineNames[I].setAttributeNS(null,"x",X)
      			this.LineNames[I].setAttributeNS(null,"y",Y-20)
      			
      			
      		}
      		
      		this.SVGDocument.getElementById("linechartline").setAttributeNS(null,"d",LinePath)
      	}
      
      Chart.prototype.DeleteSegment=function()
        {
        if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.DeleteSegment=function()')};
        
              NewValues = new Array()
              NewNames = new Array()
              NewPieElements = new Array()
              NewPieElementLabels= new Array()
              NewBarElements = new Array()
              NewBarTexts = new Array()
              NewDeleteList = new Array()
          
              NewAngles= new Array()
              NewCaptions= new Array()
              NewHNames=new Array()
	          NewHBarElements = new Array()
	          NewHBarTexts = new Array()
              NewLineElements = new Array()
	          NewLineTexts = new Array()
	          NewLineNames=new Array()
              
              SomethingDeleted = false
              
              CurrentCopySpot = 0
              for (var I = 0; I < this.PieElements.length; I++)
                {
                  if (!(this.DeleteList[I]))
                    {
                      NewValues[CurrentCopySpot] = this.Values[I]
                      NewNames[CurrentCopySpot] = this.Names[I]
                      NewPieElements[CurrentCopySpot] = this.PieElements[I]
                      NewPieElementsLabels[CurrentCopySpot] = this.PieElementLabels[I]
                      NewBarElements[CurrentCopySpot] = this.BarElements[I]
                      NewBarTexts[CurrentCopySpot] = this.BarTexts[I]
                      NewDeleteList[CurrentCopySpot] = this.DeleteList[I]
    
		      NewAngles[CurrentCopySpot] = this.Angles[I]
		      NewCaptions[CurrentCopySpot] = this.Captions[I]
		      NewHNames[CurrentCopySpot] =this.HNames[I]
		      NewHBarElements[CurrentCopySpot] = this.HBarElements[I]
		      NewHBarTexts[CurrentCopySpot] = this.HBarTexts[I]
		      NewLineElements[CurrentCopySpot] = this.LineElements[I]
		      NewLineTexts[CurrentCopySpot] = this.LineTexts[I]
		      NewLineNames[CurrentCopySpot] = this.LineNames[I]


                      this.NewBarElements[CurrentCopySpot].setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].doLegendClick(" + (CurrentCopySpot) + ");")
                      this.NewHBarElements[CurrentCopySpot].setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].doLegendClick(" + (CurrentCopySpot) + ");")
                      this.NewLineElements[CurrentCopySpot].setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].doLegendClick(" + (CurrentCopySpot) + ");")
                      CurrentCopySpot++
                    }
                  else
                    {
                      SomethingDeleted = true
                      // TW - Fix this code to handle deleting all the items above
                      this.PieElements[I].getParentNode().removeChild(this.PieElements[I])
                      this.PieElementLabels[I].getParentNode().removeChild(this.PieElementLabels[I])
                      this.BarElements[I].getParentNode().removeChild(this.BarElements[I])
                      this.BarTexts[I].getParentNode().removeChild(this.BarTexts[I])
                      this.Names[I].getParentNode().removeChild(this.Names[I])
                    }
                }
              
              if (SomethingDeleted)
                {            
                  this.Values = NewValues
                  this.Names = NewNames
                  this.PieElements = NewPieElements
                  this.PieElementLabels=NewPieElementLabels
                  this.BarElements = NewBarElements
                  this.BarTexts = NewBarTexts
                  this.DeleteList = NewDeleteList
		  this.Angles = NewAngles
		  this.Captions = NewCaptions
	          this.HNames=NewHNames
		  this.HBarElements=NewHBarElements
		  this.HBarTexts=NewHBarTexts
		  this.LineElements=NewLineElements
		  this.LineTexts=NewLineTexts
		  this.LineNames=NewLineNames
              
                  this.Refresh()
                }
         }

        
      Chart.prototype.DrawBarSegment=function(Start, Height, Element, Text, Label)
        {
          if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.DrawBarSegment=function(Start, Height, Element, Text, Label)')};
        
          XOffset3D = 7
          YOffset3D = 5
        
          PathData = "M" + (Start + (this.BarChartWidth / this.BarTotalSize)) + ",0"
          PathData = PathData + "h" + (this.BarChartWidth / this.BarTotalSize * -1)
          PathData = PathData + "v" + (Height * this.BarChartHeight * -1)
          PathData = PathData + "l" + XOffset3D + ",-" + YOffset3D
          PathData = PathData + "h" + (this.BarChartWidth / this.BarTotalSize)
          PathData = PathData + "v" + (Height * this.BarChartHeight)
          PathData = PathData + "l-" + XOffset3D + "," + YOffset3D
          PathData = PathData + "v" + (Height * this.BarChartHeight * -1)
          PathData = PathData + "h" + (this.BarChartWidth / this.BarTotalSize * -1)
          PathData = PathData + "h" + (this.BarChartWidth / this.BarTotalSize)
          PathData = PathData + "l" + XOffset3D + ",-" + YOffset3D
          PathData = PathData + "l-" + XOffset3D + "," + YOffset3D
          
          Element.setAttributeNS(null,"d", PathData)
         
          Label.setAttributeNS(null,"x", Start / this.AngleFactor)
          Label.setAttributeNS(null,"y", Start * -1 / this.AngleFactor)
          
          Text.setAttributeNS(null,"y",  (Height * this.BarChartHeight * -1)-20)
          Text.setAttributeNS(null,"x",(Start+.5*(this.BarChartWidth / this.BarTotalSize)))
          
          return Start + this.BarChartWidth / this.BarTotalSize
        }
        
      Chart.prototype.DrawPieSegment=function(Start, Size, Element, ID)
        {
        
        if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.DrawPieSegment=function(Start, Size, Element, ID)')};
        PathData = "M0,0L" 
        
        
        PathData = PathData + this.PieChartSize * Math.sin(Start * Math.PI * 2) + "," + this.PieChartSize * Math.cos(Start * Math.PI * 2)
        if (Size >= .5){
            var SinValue = this.PieChartSize * Math.sin((Start + Size) * Math.PI * 2);
	        var CosValue = this.PieChartSize * Math.cos((Start + Size) * Math.PI * 2);

	          if (Math.abs(SinValue) < 0.0001){
		          if(SinValue < 0){
				        SinValue = -0.0001;
		          } 
		          else{
			        SinValue = 0.0001;
		          }
	          } 

	          if (Math.abs(CosValue) < 0.0001){
		          if(CosValue < 0){
				        CosValue = -0.0001;
		          } 
		          else{
			        CosValue = 0.0001;
		          }
	          }
	      
        PathData = PathData + "A" + this.PieChartSize + " " + this.PieChartSize + " 1 1 0 " + SinValue + "," + CosValue;
        }
        else{
        PathData = PathData + "A" + this.PieChartSize + " " + this.PieChartSize + " 0 0 0 " + this.PieChartSize * Math.sin((Start + Size) * Math.PI * 2) + "," + this.PieChartSize * Math.cos((Start + Size) * Math.PI * 2)
        }
        PathData = PathData + "z"
       
        Element.setAttributeNS(null,"d", PathData)
        Element.setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].doLegendClick( "+ ID + ")")
        
        Element.setAttributeNS(null,"onmouseover","ChartContext["+this.getChartIndex()+"].MoveOverSegments("+ ID +")");
        Element.setAttributeNS(null,"onmouseout","ChartContext["+this.getChartIndex()+"].MoveOutSegments("+ ID +")");
        
       
          
        this.Angles[ID]=(Start + Size / 2)
        // Add a label in the center of the pie segment
        //
        var lblx=(this.PieChartSize*1.3) * Math.sin((this.Angles[ID]) * Math.PI * 2)
        var lbly=(this.PieChartSize*1.3) * Math.cos((this.Angles[ID]) * Math.PI * 2)

        
        if(this.getChartMode()=="D") {
        lblx=(this.PieChartSize*1.5) * Math.sin((this.Angles[ID]) * Math.PI * 2)
        lbly=(this.PieChartSize*1.5) * Math.cos((this.Angles[ID]) * Math.PI * 2)
      	this.PieElementLabels[ID].setAttributeNS(null,"style", "text-anchor:middle;font-weight:bold;font-size:48;visibility:visible")
        }
        else
          	this.PieElementLabels[ID].setAttributeNS(null,"text-anchor", "middle")
          	this.PieElementLabels[ID].setAttributeNS(null,"font-weight", "bold")
          	this.PieElementLabels[ID].setAttributeNS(null,"font-size", "18")
          	
            this.PieElementLabels[ID].setAttributeNS(null,"x",lblx)
	        this.PieElementLabels[ID].setAttributeNS(null,"y",lbly)
          
          return Start + Size
        }
        
      Chart.prototype.DrawHBarSegment=function(Start, Height, Element, Text, Label)
	        {
          if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.DrawHBarSegment=function(Start, Height, Element, Text, Label)')};
          
          XOffset3D = 5
          YOffset3D = -5
 	  BarSize=(this.BarChartHeight / (this.BarTotalSize+1))  
 	  
          PathData = "M0," +  -1*(Start) 
          PathData = PathData + "v" + BarSize*-1
          PathData = PathData + "h" + (Height * this.BarChartWidth)
          PathData = PathData + "l" + XOffset3D + "," + -1*YOffset3D
          PathData = PathData + "v" + BarSize
          PathData = PathData + "h" + -1*(Height * this.BarChartWidth)
          PathData = PathData + "l" + -1*XOffset3D + "," + YOffset3D
          
          
          
          PathData = PathData + "v" + BarSize*-1
          PathData = PathData + "h" + (Height * this.BarChartWidth )
          PathData = PathData + "l" + XOffset3D + "," + -1*YOffset3D
          PathData = PathData + "v" + BarSize
          
          
          PathData = PathData + "l" + -1*XOffset3D + "," + YOffset3D
          PathData = PathData + "v" + BarSize*-1
          PathData = PathData + "v" + BarSize+"z"
          
          Element.setAttributeNS(null,"d", PathData)
          Label.setAttributeNS(null,"x", (Height * this.BarChartWidth ))
          Label.setAttributeNS(null,"y", -1*Start-BarSize*.4)
          
          Text.setAttributeNS(null,"x", -10)
          Text.setAttributeNS(null,"y",  -1*Start-BarSize*.4)
          
          return Start - BarSize
        }
      Chart.prototype.MoveSegment=function(MouseEvent, Angle, CanBeDeleted, ID)
        {
         if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.MoveSegment=function(MouseEvent, Angle, CanBeDeleted, ID)')};
         
          Element = getTarget(MouseEvent)

          if (Angle < 0)
            {
              X = 0
              Y = 0
            }
          else
            {
              X = this.MoveDistance * Math.sin(Angle * 2 * Math.PI)
              Y = this.MoveDistance * Math.cos(Angle * 2 * Math.PI)
            }
            
          this.DeleteList[ID] = CanBeDeleted
          
          Element.setAttributeNS(null,"transform", "translate(" + X + "," + Y + ")")
          Element.setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].MoveSegment(evt, " + (Angle * -1) + ", " + (!CanBeDeleted) + ", " + ID + ")")
        }
        
      Chart.prototype.DisplayInfo=function(Text, Value)
        {
        if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.DisplayInfo=function(Text, Value)')};
          if (Text != " ")
            Percent = " (" + Math.round(Value / this.PieTotalSize * 10000) / 100 + "%)"
          else
            Percent = ""
          
          NewItem = this.SVGDocument.ownerDocument.createTextNode(Value + Percent)
          this.SVGDocument.getElementById("labelamount").replaceChild(NewItem, this.SVGDocument.getElementById("labelamount").firstChild)

          NewItem = this.SVGDocument.ownerDocument.createTextNode(Text + "")
          this.SVGDocument.getElementById("labelitem").replaceChild(NewItem, this.SVGDocument.getElementById("labelitem").firstChild)

          if (Text + Value == "  ")
            NewItem = this.SVGDocument.ownerDocument.createTextNode(" ")
          else
            NewItem = this.SVGDocument.ownerDocument.createTextNode(":")
          this.SVGDocument.getElementById("labelcolon").replaceChild(NewItem, this.SVGDocument.getElementById("labelcolon").firstChild)
        }
        
      Chart.prototype.SetTitle=function(Text)
        {
          if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.SetTitle=function(Text)')};
        }
        
      Chart.prototype.SetAxis=function(Text)
        {
        if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.SetAxis=function(Text)')};
          NewItem = this.SVGDocument.ownerDocument.createTextNode(Text + "")
          this.SVGDocument.getElementById("axis").replaceChild(NewItem, this.SVGDocument.getElementById("axis").firstChild)
          NewItem = SVGDocument.ownerDocument.createTextNode(Text + "")
          this.SVGDocument.getElementById("subtitle").replaceChild(NewItem, this.SVGDocument.getElementById("subtitle").firstChild)
        }
      Chart.prototype.SetTitles=function(Title, SubTitle)
      	{
      	
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.SetTitles=function(Title, SubTitle)')};
      	  if(this.getChartMode() !="D") {
	      	  this.GraphTitle=Title
	      	  this.GraphSubTitle=SubTitle
          	NewItem = this.SVGDocument.ownerDocument.createTextNode(Title + "")
          
			  this.SVGDocument.getElementById("grtitle").replaceChild(NewItem, this.SVGDocument.getElementById("grtitle").firstChild)
			  NewItem = this.SVGDocument.ownerDocument.createTextNode(SubTitle + "")

			  this.SVGDocument.getElementById("title").replaceChild(NewItem, this.SVGDocument.getElementById("title").firstChild)
		  }
		  else {
	      	  this.GraphTitle=Title
	      	  this.GraphSubTitle=Title
          	   NewItem = this.SVGDocument.ownerDocument.createTextNode(Title + "")
          
			  this.SVGDocument.getElementById("grtitle").replaceChild(NewItem, this.SVGDocument.getElementById("grtitle").firstChild)
			  NewItem = this.SVGDocument.ownerDocument.createTextNode(Title + "")

			  this.SVGDocument.getElementById("title").replaceChild(NewItem, this.SVGDocument.getElementById("title").firstChild)
		  }
	  
          try {
			  if(this.Names.length > 0) {
				this.SetLegend()
		  } 
          } catch(e) {} finally {}
	}
      	


      Chart.prototype.HideCharts=function()
      	{
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.HideCharts=function()')};
          HideElementById(this.SVGDocument,"subtitle")
          HideElementById(this.SVGDocument,"linechart")
	      HideElementById(this.SVGDocument,"hbarchart")
          HideElementById(this.SVGDocument,"barchart")
          HideElementById(this.SVGDocument,"piechart")
          HideElementById(this.SVGDocument,"pieitemlabel")
          HideElementById(this.SVGDocument,"barsidetext")
      	}
      	
      	
      Chart.prototype.ShowPie=function()
        {
        if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.ShowPie=function()')};
        
          this.HideCharts()
          
          
          this.ActiveSegment = "Pie"
          ChartType=this.ActiveSegment;
          ShowElementById(this.SVGDocument,"subtitle")
          ShowElementById(this.SVGDocument,"piechart")
          ShowElementById(this.SVGDocument,"pieitemlabel")
          if(this.Names.length > 0) {
          	this.SetLegend()
          }
        }



      Chart.prototype.ShowBar=function()
        {      
        
        if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.ShowBar=function()')};
	      this.HideCharts()
          this.ActiveSegment = "Bar"
          ChartType=this.ActiveSegment
          ShowElementById(this.SVGDocument,"barchart")
          ShowElementById(this.SVGDocument,"barsidetext")
          if(this.Names.length > 0) {
          	this.SetLegend()
          }
        }
      Chart.prototype.ShowLine=function()
        {
       
	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.ShowLine=function()')};
          this.HideCharts()
          this.ActiveSegment = "Line"
          ChartType=this.ActiveSegment
          ShowElementById(this.SVGDocument,"linechart")
          if(this.Names.length > 0) {
          	this.SetLegend()
          }
        }

      Chart.prototype.ShowHBar=function(){
      
      
      if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.ShowHBar=function(){')};
        this.HideCharts()
      	this.ActiveSegment = "HBar"
      	ChartType=this.ActiveSegment
	    ShowElementById(this.SVGDocument,"hbarchart")
          if(this.Names.length > 0) {
          	this.SetLegend()
          }
      }

      
      Chart.prototype.SetLegend=function()
      {
		if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.SetLegend=function()')};
      
		this.ClearLegend()
      		
      	// Turn on legend group display
      	//if(this.getChartMode() !="D") 
      	ShowElementById(this.SVGDocument,"legendbox")
      	var valtotal=0;
      	for(i=0 ;i< this.Values.length;i++) 
		{
      		valtotal+=this.Values[i]
      	}
    	for(i=0 ;i< this.Values.length;i++) 
		{
			if (i<15) 
			{
				LegendBox=this.SVGDocument.getElementById("legend"+(i+1)+"rect")

				LegendBox.setAttributeNS(null,"fill",ColorArray[i])
				LegendBox.setAttributeNS(null,"stroke","black")
				LegendBox.setAttributeNS(null,"stroke-width","1")
				LegendBox.setAttributeNS(null,"cursor","pointer")
				//LegendBox.setAttributeNS(null,"style",style="&st4;fill:"+ColorArray[i])
				LegendText=this.SVGDocument.getElementById("legend"+(i+1)+"text")
				LegendText.setAttributeNS(null,"cursor","pointer")
				if(this.getChartMode()=="D")
				{
					if(this.Captions[i].length > 25)
						LegendCaption=this.Captions[i].substring(0,22)+" ..."
					else
						LegendCaption=this.Captions[i]
				}
				else
					LegendCaption=this.Captions[i].substring(0,90)+": "+this.Values[i] + " (" + Math.round(this.Values[i] / valtotal * 10000) / 100 + "%)"
				
				LegendText.replaceChild(this.SVGDocument.ownerDocument.createTextNode(LegendCaption),LegendText.firstChild)
				this.SetUpObjectToolTip(LegendText,this.Captions[i].substring(0,90)+": "+this.Values[i] + " (" + Math.round(this.Values[i] / valtotal * 10000) / 100 + "%)")
				this.SetUpObjectToolTip(LegendBox,this.Captions[i].substring(0,90)+": "+this.Values[i] + " (" + Math.round(this.Values[i] / valtotal * 10000) / 100 + "%)")
				LegendGroup=this.SVGDocument.getElementById("legend"+(i+1))
				var elem = SVG.adopt(LegendGroup);
				elem.style("visibility", "visible")
				
				LegendGroup.setAttributeNS(null,"onclick","ChartContext["+this.getChartIndex()+"].doLegendClick("+i+")")
		
				if(this.DeleteList[i]) 
				{
					var elem = SVG.adopt(LegendText);
					elem.style("font-weight","bold");
				}
				else 
				{
					var elem = SVG.adopt(LegendText);
					elem.style("font-weight","normal");
				}
			}
      	}
      }
      Chart.prototype.ClearLegend=function() 
	  {
		if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.ClearLegend=function()')};  	
      	HideElementById(this.SVGDocument,"legendbox")
    	for(i=1 ;i< 16;i++) 
		{
			if (i<16) 
			{
				LegendText=this.SVGDocument.getElementById("legend"+i+"text")
				LegendText.replaceChild(this.SVGDocument.ownerDocument.createTextNode("."),LegendText.firstChild)
				var elem = SVG.adopt(LegendText)
				elem.style("font-weight","normal")
				
				LegendGroup=this.SVGDocument.getElementById("legend"+i)
				
				elem = SVG.adopt(LegendGroup)
				elem.style("visibility", "hidden")
				
				LegendBox=this.SVGDocument.getElementById("legend"+(i)+"rect")
				LegendText.setAttributeNS(null,"onmouseover", "")
				LegendText.setAttributeNS(null,"onmouseout", "")
				LegendBox.setAttributeNS(null,"onmouseover", "")
				LegendBox.setAttributeNS(null,"onmouseout", "")
			}
      	}
      }

// event/UI functions

      Chart.prototype.doLegendClick=function(i)
	  {
      
		if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.doLegendClick=function(i)')};
		CBD=this.DeleteList[i]
		this.DeleteList[i] = !CBD
		if(i<15) 
		{
			this.LegendText=this.SVGDocument.getElementById("legend"+(i+1)+"text")
			if(!CBD) 
			{
				var elem = SVG.adopt(this.LegendText);
				elem.style("font-weight","bold")
			}
			else 
			{
				var elem = SVG.adopt(this.LegendText);
				elem.style("font-weight","normal")
			}
		}
		Angle=this.Angles[i]
      		
  		Element = this.PieElements[i]
		if (CBD)
		{	
			X = 0
			Y = 0
		}
		else
		{ 
			X = this.MoveDistance * Math.sin(Angle * 2 * Math.PI)
			Y = this.MoveDistance * Math.cos(Angle * 2 * Math.PI)
			
		}
              
        Element.setAttributeNS(null,"transform", "translate(" + X + "," + Y + ")")
	        
        if(!CBD) 
		{
            Element.setAttributeNS(null,"stroke", "black")
            Element.setAttributeNS(null,"stroke-width", "1.5")
        }
        else
		{
            Element.setAttributeNS(null,"stroke", "black")
            Element.setAttributeNS(null,"stroke-width", "1")
        }
        
		if(!CBD) 
		{
			this.BarElements[i].setAttributeNS(null,"opacity","1");
			this.BarElements[i].setAttributeNS(null,"stroke-width","1.75");
			this.Names[i].setAttributeNS(null,"font-weight","bold");
			this.Names[i].setAttributeNS(null,"fill","red");
			this.Names[i].setAttributeNS(null,"visibility", "visible");
			this.BarTexts[i].setAttributeNS(null,"visibility", "visible");
		}
		else 
		{
			this.BarElements[i].setAttributeNS(null,"opacity","0.7");
			this.BarElements[i].setAttributeNS(null,"stroke-width","1");
			this.Names[i].setAttributeNS(null,"font-weight","normal");
			this.Names[i].setAttributeNS(null,"fill","black");
			this.Names[i].setAttributeNS(null,"visibility", "hidden");
			this.BarTexts[i].setAttributeNS(null,"visibility", "hidden");
		}
		
		if(!CBD) 
		{
			this.HBarElements[i].setAttributeNS(null,"opacity","1");
			this.HBarElements[i].setAttributeNS(null,"stroke-width","1.75");
			this.HNames[i].setAttributeNS(null,"font-weight","bold");
			this.HNames[i].setAttributeNS(null,"fill","red");
			this.HNames[i].setAttributeNS(null,"visibility", "visible");
			this.HBarTexts[i].setAttributeNS(null,"visibility", "visible");
		}
		else 
		{
			this.HBarElements[i].setAttributeNS(null,"opacity","0.7");
			this.HBarElements[i].setAttributeNS(null,"stroke-width","1");
			this.HNames[i].setAttributeNS(null,"font-weight","normal");
			this.HNames[i].setAttributeNS(null,"fill","black");
			this.HNames[i].setAttributeNS(null,"visibility", "hidden");
			this.HBarTexts[i].setAttributeNS(null,"visibility", "hidden");
		}
		
	// Line
		if(!CBD) 
		{
			this.LineElements[i].setAttributeNS(null,"opacity","1");
			this.LineElements[i].setAttributeNS(null,"stroke-width","1.75");
			this.LineNames[i].setAttributeNS(null,"font-weight","bold");
			this.LineNames[i].setAttributeNS(null,"fill","red");
			this.LineNames[i].setAttributeNS(null,"visibility", "visible");
			this.LineTexts[i].setAttributeNS(null,"visibility", "visible");
		}
		else 
		{
			this.LineElements[i].setAttributeNS(null,"opacity","0.7");
			this.LineElements[i].setAttributeNS(null,"stroke-width","1");
			this.LineNames[i].setAttributeNS(null,"font-weight","normal");
			this.LineNames[i].setAttributeNS(null,"fill","black");
			this.LineTexts[i].setAttributeNS(null,"visibility", "hidden");
			this.LineNames[i].setAttributeNS(null,"visibility", "hidden");
		}
	  }

// child window 

      Chart.prototype.IsThisOther=function(TextToCheck) 
	  {
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.IsThisOther=function(TextToCheck)')};
    	for(i=0 ;i< this.Captions.length;i++) {
		if(this.Captions[i]==TextToCheck) return 0;
      	}
      	return true;
      	
      }
      
      Chart.prototype.DoWeWantThisRow=function(thecell) 
	  {
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.DoWeWantThisRow=function(thecell)')};
      	foundit=false;
      	if(thecell!=null) 
		{
     		for(want=0;want<this.DeleteList.length;want++) 
			{
				if(this.DeleteList[want]) 
				{			
					if(document.all)
					{		
						if((this.Captions[want].replace("´","'")==thecell.innerText)||(this.Captions[want]=="<blank>" && thecell.innerText==" ") ||(this.Captions[want]=="<blank>" && thecell.innerText==null) ||(this.Captions[want]=="<blank>" && thecell.innerText=="") ||(this.Captions[want]=="<All Others>" && IsThisOther(thecell.innerText)))
						{           
				            foundit=true
							want=this.DeleteList.length+1
						}
					}
					else
					{
						if((this.Captions[want].replace("´","'")==thecell.textContent)||(this.Captions[want]=="<blank>" && thecell.textContent==" ") ||(this.Captions[want]=="<blank>" && thecell.textContent==null) ||(this.Captions[want]=="<blank>" && thecell.textContent=="") ||(this.Captions[want]=="<All Others>" && IsThisOther(thecell.textContent)))
						{          
				          foundit=true
							want=this.DeleteList.length+1
						}
				    }
				}  
			}
		} 
      	return foundit;
      }
	  
      Chart.prototype.dalert=function(msg) 
	  {
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.dalert=function(msg)')};
      	if(this.ChildDialog!=null) {
      		try {
      			this.ChildDialog.dalert(msg);
      		}
      		catch(e) {} finally {}
      	}
      }
      
      Chart.prototype.setDrillDownGraphDoc=function(ndoc) 
	  {
		if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.setDrillDownGraphDoc=function(ndoc)')};
		this.dalert("Formatting Child Diagram")
		this.DrillDownGraphDoc=ndoc;
		this.dalert("Setting child title to " + this.ChildTitle)
		ndoc.title=this.ChildTitle;
	
		this.dalert("Setting child data ")
		tblhtml=this.GetAnalysisTable().outerHTML.replace(tblid,"maindata");
		var tblid=this.GetAnalysisTable().getAttributeNS(null,"id")
		this.Drilldowntbl= ndoc.getElementById("maindata");
		this.Drilldowntbl.outerHTML=tblhtml;
		this.Drilldowntbl= ndoc.getElementById("maindata");
		
		this.dalert("Filtering child data...")
		colid=-1
		var tgs = this.Drilldowntbl.getElementsByTagName("TH");
		
		colid=this.getSelectedColumn()
		if(colid >=0 ) 
		{
					
		   for(rw=this.Drilldowntbl.rows.length-1;rw>0; rw--) 
		   {
				foundit=false
				var thecell=this.Drilldowntbl.rows(rw).cells(colid)
				foundit=this.DoWeWantThisRow(thecell)
				if(!foundit) 
				{
						
					this.Drilldowntbl.deleteRow(rw);
				}
					
			}
		}

	
		var newcount=this.Drilldowntbl.rows.length-1
		
		tgs = ndoc.getElementsByTagName("td")
		
		if(document.all)
		{
			for(i=0;i<tgs.length;i++) 
			{
				if((tgs[i].innerText.indexOf("Count:") > -1) && (tgs[i].innerText.indexOf("Count:") <20))
				{
					s=tgs[i].outerHTML.toString()
				
					if(s.length < 120)	
						tgs[i].innerText=tgs[i].innerText.replace("Count:","Count: " + newcount + " of ") 
				}
			}
		}
		else
		{
			//## FireFox fix## 
			for(i=0;i<tgs.length;i++) 
			{
				if((tgs[i].textContent.indexOf("Count:") > -1) && (tgs[i].textContent.indexOf("Count:") <20))
				{
					s=tgs[i].outerHTML.toString()
					
					if(s.length < 120)	
						tgs[i].textContent=tgs[i].textContent.replace("Count:","Count: " + newcount + " of ") 
				}
			}
		}
		this.nwin.SelectedColumn=colid
		this.nwin.ChartType=this.ActiveSegment
     	this.nwin.LoadGraph();
     	window.status=""
     	try 
		{
			this.ChildDialog.close();
		} 
		catch(e) {} 
		finally
		{
			this.ChildDialog=null;
		}
    	this.nwin.focus();
      }

      Chart.prototype.waitForChild=function() 
	  {
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.waitForChild=function()')};
      	if(this.nwin==null) return;
      	if(this.nwin.document.readyState == "complete") nwin.HandleDrillDown();
      	
      	else window.setTimeout('waitForChild()', 100);
      
      }
	  
      Chart.prototype.Expand=function() 
	  {
      	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.Expand=function()')};
      	// expand to new window - available in Dashboard mode only
      	this.Expanding=true;
	    this.ChildTitle=this.GraphTitle; 
	    ChildChart(this.getChartIndex())		
      	
      	this.Expanding=false;
      }
      
      Chart.prototype.NewGraph=function() 
	  {
    	if(this.ChildDebug) { alert ('chart.svg.Chart.prototype.NewGraph=function()')};
    	// Check for any highlighted segments in the current graph
    	this.Expanding=false;
    	this.CBDCount=0
    	
    	for(I=0;I<this.DeleteList.length;I++) if(this.DeleteList[I]) { this.CBDCount++; }
    	
    	var selcol=this.getSelectedColumn();
    	
    	if(this.CBDCount == 0 ) 
		{
    		alert("Please select one or more items.");
    		return;
    	}
    	
    	if(this.getChartMode()=="R") 
		{
			if(document.all)
			{	
				this.ChildTitle=this.GraphTitle + " Sub Chart for "+this.CBDCount+" selected: " + this.GetAnalysisTable().rows[0].cells[selcol].innerText;	
			}
			else
			{ 
				//##Firefox fix
				this.ChildTitle=this.GraphTitle + " Sub Chart for "+this.CBDCount+" selected: " + this.GetAnalysisTable().rows[0].cells[selcol].textContent;	
			}
			ChildChart(this.getChartIndex())	
        }
	
		else if(this.getChartMode()=="D") 
		{
			if(document.all)
			{
				this.ChildTitle=this.GraphTitle + " Sub Chart for "+this.CBDCount+" selected: " + this.GetAnalysisTable().rows[0].cells[selcol].innerText;	
			}
			else
			{ 
				this.ChildTitle=this.GraphTitle + " Sub Chart for "+this.CBDCount+" selected: " + this.GetAnalysisTable().rows[0].cells[selcol].textContent;	
			}
			ChildChart(this.getChartIndex())		
		}
	
    }

//tool tip
var TipScale=false;
var myBox = document.getElementById("toolTipBox");
var myTip = document.getElementById("toolTipText");
var myBck = document.getElementById("toolTipBack");
   
 function showToolTip(e,txt)
 {
/* not working.. 	 getComputedTextLength returns 0 and the position is wrong
   var innerWidth = availablewidth;
    if(this.ChildDebug) { alert ('chart.svg.function showToolTip(e,txt)')};
	
	 var myTgt = getTarget(e);
	 
	 myBox=myTgt.ownerSVGElement.getElementById('toolTipBox')
	 myTip=myTgt.ownerSVGElement.getElementById('toolTipText');
	 myBck=myTgt.ownerSVGElement.getElementById('toolTipBack');
	 
     myTip.firstChild.data = txt;
	 myTipLen = myTip.getComputedTextLength()+10;  
	 myBck.setAttributeNS(null,'width', myTipLen);
	 
	 ttx = e.clientX - 50;
	 tty = e.clientY +18;
	 // adjustments would go here (too far right e.g. if ttx > innerWidth - myTipLen ...)

	 if(ttx+myTipLen > innerWidth) {ttx=innerWidth-(myTipLen*2);}
	 if(ttx < 0) ttx=0;
	 if(tty+20 > innerHeight) {tty=innerHeight-40;}
	 if(!TipScale)
	 	myBox.setAttributeNS(null,'transform','translate(' + ttx + ',' + tty + ')');
	 else
	 	myBox.setAttributeNS(null,'transform','translate(' + ttx + ',' + tty + ') scale(3,3)');
	var elem = SVG.adopt(myBox);
	elem.style('display','inline')
*/
 }
 function hideToolTip(e)
 {
/*	 
	if(this.ChildDebug) { alert ('chart.svg. ')};
	try
	{
		myTip.firstChild.data=''
		var elem = SVG.adopt(myBox);
		elem.style('display','none')
	} finally {}
*/	
 }



//global variables necessary to create elements in these namespaces, do not delete them!!!!
var svgNS = "http://www.w3.org/2000/svg";
   function getWindow(){
	  return window;
}


var refresh_btn = document.getElementById("refresh_btn");
var vbar_btn = document.getElementById("vbar_btn");
var hbar_btn = document.getElementById("hbar_btn");
var line_btn = document.getElementById("line_btn");
var pie_btn = document.getElementById("pie_btn");
var drilldown_btn = document.getElementById("drilldown_btn");
var more_btn = document.getElementById("more_btn");
var less_btn = document.getElementById("less_btn");


function toolbarButtons(id,state){
	try // needed for IE when not accessing a published site
	{
		if(state == 'over'){
			switch(id){
				case "refresh_btn" : refresh_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_refresh_over.gif"); break;
				case "vbar_btn" : vbar_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_vbar_over.gif"); break;
				case "hbar_btn" : hbar_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_hbar_over.gif"); break;
				case "line_btn" : line_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_line_over.gif"); break;
				case "pie_btn" : pie_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_pie_over.gif"); break;
				case "drilldown_btn" : drilldown_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_drilldown_over.gif"); break;
				case "more_btn" : more_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_showmore_over.gif"); break;
				case "less_btn" : less_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_showless_over.gif"); break;
			}
		}
		else{
			switch(id){
				case "refresh_btn" : refresh_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_refresh.gif"); break;
				case "vbar_btn" : vbar_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_vbar.gif"); break;
				case "hbar_btn" : hbar_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_hbar.gif"); break;
				case "line_btn" : line_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_line.gif"); break;
				case "pie_btn" : pie_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_pie.gif"); break;
				case "drilldown_btn" : drilldown_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_drilldown.gif"); break;
				case "more_btn" : more_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_showmore.gif"); break;
				case "less_btn" : less_btn.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","btn_showless.gif"); break;
			}
		}
	}
	catch(e)
	{
	}
}

function getTarget(e) 
{ // Declare function
	if (!e) 
	{ // If there is no event object
		e = window.event; // Use old IE event object
	}
	return e.target || e.srcElement; // Get the target of event
}

function svgCreateTextNode(strText)
{
	var newText = document.createElementNS("http://www.w3.org/2000/svg","text");
	newText.setAttributeNS(null,"x",x);     
	newText.setAttributeNS(null,"y",y); 
	newText.setAttributeNS(null,"font-size","100");

	var textNode = document.createTextNode(val);
	newText.appendChild(textNode);
	document.getElementById("g").appendChild(newText);
}