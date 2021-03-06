// Licensed Materials - Property of UNICOM Systems, Inc.
//
// htmlclean.js
// SVG functions
//
// (c) Copyright UNICOM Systems, Inc. 2005, 2010, 2016.  All Rights Reserved.

var qfile;
var bAct1; 
var lastShownPopup;

// By default the features provided on mouse operations are enabled. Make this boolean true to disable the features
var disableFeatures = false;

var bFF = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

function getTarget(e) { // Declare function
	if (!e) { // If there is no event object
	e = window.event; // Use old IE event object
	}
	return e.target || e.srcElement; // Get the target of event
}
					
function initHtmlClean()
{
	try
	{
		var clnAttr1;
		var tblElem;
		var tblAttr;
		var AddTblElem;
		var bFirstTbl = true;
		var bTblExists = false;
		var intC = 1;
		var intTbl;
		var undefined;
		var newElem;
		var oldElem;
		var Attr1parms;
		
	  // get the root svg element
	  document.getSVGelem = function () {
		var nl;
		
		nl = document.getElementsByTagName("svg");
		return nl[1];	// 1 because this is nested in svg for the zoom+navigation control
	  };
		
		qfile = document;
		clnAttr1=qfile.getSVGelem();	
		
		tblElem=clnAttr1.firstChild; 
		intTbl = clnAttr1.childNodes.length;
		while (tblElem != null && intC<=intTbl)
		{
			if ((tblElem.nodeName == "g") && tblElem.hasAttributes)
			{
				tblAttr=tblElem.getAttribute("node");
				if (tblAttr == "Yes")
				{
					if (disableFeatures == false)
					{
						tblElem.setAttribute("onmouseover","exAdd(evt);")
						tblElem.setAttribute("onmouseout","exRemove(evt);")
						tblElem.setAttribute("onclick","exMove(evt);")
					}
				}
				else if (tblAttr == "No") 
				{	
					tblElem.setAttribute("onclick","exAddClick(evt);")
	
					if (bFirstTbl) 
					{
						bFirstTbl = false;
						if (tblElem.getAttribute("fromX") != "")
						{
							bTblExists = true;
						}
					}
					if (!bTblExists)
					{
						
						AddTblElem=tblElem.firstChild;
					} 
				}

				
				tblChildElem = tblElem.firstChild;
				while(tblChildElem!=null)
				{
					if(tblChildElem.nodeName == "g")
					{
						tblChildElem.setAttribute("onclick","exDisplayChild(evt);")
					}
					tblChildElem = tblChildElem.nextSibling;
				}

			}
			else if (tblElem.nodeName == "rect" )
			{ 
					tblElem.setAttribute("onclick","exUpdateClick(evt);")
			}
			tblElem=tblElem.nextSibling;
			intC ++;
		}
	}
	catch(e)
	{
		alert("@Error@ initHtmlClean: " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		clnAttr1 = undefined;
		tblElem = undefined;
		tblAttr = undefined;
		AddTblElem = undefined;
		newElem = undefined;
		oldElem = undefined;
		Attr1parms = undefined;
	}
}


function exDisplayChild(evt)
{
	var tblElem;
	try
	{
	  if(lastShownPopup != null)
	  {
		  lastShownPopup.setAttribute("class","DisplayNone");
		  lastShownPopup = null;
	  }
	  tblElem = getTarget(evt);
	  while(tblElem != null)
	  {
		  if(tblElem.nodeName == "g")
		  {
				tblElem.setAttribute("class","Display");
				lastShownPopup = tblElem;
				break;
		  }
		  tblElem = tblElem.nextSibling;
	  }
	  if(lastShownPopup != null)
	  {
		  setTimeout("exHideChild()",3000);
	  }
	  tblElem = null;
	}
	catch (e)
	{
		alert("@Error@ exDisplayChild(evt): " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
}

function exHideChild()
{
	if(lastShownPopup != null)
	{
		lastShownPopup.setAttribute("class","DisplayNone");
		lastShownPopup = null;
	}
}

function exAdd(evt)
{
	try 
	{
		var undefined;
		var tblNode;
		bAct1 = 0;
		tblNode = getTarget(evt);
		while((tblNode.nodeName != "g" && tblNode != null) || tblNode.getAttribute("ignore") == "true" )
		{
			tblNode = tblNode.parentNode;
		}
		
		if (tblNode.getAttribute("type") != 822)
		{
			setInfoForTbl(tblNode,0,0,0);
			setInfoForTbl(tblNode,1,1,0);
		
		}
	}
	catch(e)
	{
		alert("@Error@ exAdd(evt): " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		tblNode = undefined;
	}
}

function exRemove(evt){
	try
	{
		var undefined;
		var tblNode;
		bAct1 = 0;
		tblNode = getTarget(evt);
		while((tblNode.nodeName != "g" && tblNode != null) || tblNode.getAttribute("ignore") == "true" )
		{
			tblNode = tblNode.parentNode;
		}
		
		if (tblNode.getAttribute("type") != 822)
		{
			setInfoForTbl(tblNode,1,0,0);
			setInfoForTbl(tblNode,0,1,1);
		}
	}
	catch(e)
	{
		alert("@Error@ exRemove(evt): " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		tblNode = undefined;
	}
}
				
function exMove(evt)
{
	try
	{
		var undefined;
		var tblNode;
		tblNode = getTarget(evt);
		while((tblNode.nodeName != "g" && tblNode != null) || tblNode.getAttribute("ignore") == "true" )
		{
			tblNode = tblNode.parentNode;
		}
		if (tblNode.getAttribute("type") != 822)
		{
			if (evt.altKey && !evt.ctrlKey) 
			{
				if (tblNode.getAttribute("sa") == "sa")
				{
					tblNode.setAttribute("sa","");
					bAct1=1;
					bAdd=0;
					tblNode.setAttribute("style","opacity:1;"); 
					setInfoForTbl(tblNode,1,1,0);
					evt.preventDefault();
					evt.stopPropagation();
				}
				else 
				{
					tblNode.setAttribute("sa","sa");
					bAct1=1;
					bAdd=1;
					tblNode.setAttribute("style","opacity:0.5;"); 
					setInfoForTbl(tblNode,0,1,1);
					evt.preventDefault();
					evt.stopPropagation();
				}
			} 
			else if (evt.shiftKey && !evt.ctrlKey)
			{
				zoomFocusOnSymbol(GetAddItem(tblNode));
				evt.preventDefault();
				evt.stopPropagation();
			}
			else if (evt.ctrlKey && evt.altKey) 
			{
				zoomOutFromSymbol(GetAddItem(tblNode));
				evt.preventDefault();
				evt.stopPropagation();
			}
			else if (!evt.shiftKey && evt.ctrlKey)
			{
				zoomInOnSymbol(GetAddItem(tblNode));
				evt.preventDefault();
				evt.stopPropagation();
			}
		}
		else 
		{	
			if (evt.altKey && !evt.ctrlKey && GetAddItem(tblNode) == 0) 
			{ 
				if (tblNode.getAttribute("sa") == "sa")
				{
					tblNode.setAttribute("sa","");
					bAdd=0;
					setAllTbls(1,0);
					evt.preventDefault();
					evt.stopPropagation();
				}
				else 
				{
					tblNode.setAttribute("sa","sa");
					bAdd=1;
					setAllTbls(0,1);
					evt.preventDefault();
					evt.stopPropagation();
				}
			}
			else if (evt.shiftKey && !evt.ctrlKey)
			{
				var tblChild;
				var Xattrib;
				var Yattrib;
				var Hattrib;
				var Wattrib;
				var rfile;
				var Wtblattrib;
				var Htblattrib;
				var WRatio;
				var HRatio;
				var DRatio;
				var ARatio;
				var BRatio;
				var CRatio;
				var ERatio;
				var FRatio;
				var currentScale;
				var viewbox;
				var Attr1parms;
				
				tblChild = evt.target;
				Xattrib = parseInt(tblChild.getAttribute("x"));
				Yattrib = parseInt(tblChild.getAttribute("y"));
				Wattrib = parseInt(tblChild.getAttribute("width"));
				Hattrib = parseInt(tblChild.getAttribute("height"));
								
				rfile = qfile.getSVGelem(); 
				viewbox = rfile.getAttribute("viewBox");
				Attr1parms = viewbox.split(/ /);
		
				currentScale=rfile.currentScale;
				Wtblattrib=rfile.getAttribute("width");
				Htblattrib=rfile.getAttribute("height");
								
				if (Wtblattrib == "100%") 
				{
					Wtblattrib = getClientWidth();
				}
				if (Htblattrib == "100%")
				{
					Htblattrib = getClientWidth();
				}
								
				WRatio = (Attr1parms[2]/Wtblattrib);
				HRatio = (Attr1parms[3]/Htblattrib);
				
				if(WRatio>=HRatio)
				{
					DRatio=WRatio;
				}
				else
				{
					DRatio=HRatio;	
				}					
				Xattrib = Xattrib-Attr1parms[0];	
				Yattrib = Yattrib-Attr1parms[1];
			
				ARatio=Wtblattrib/(Wattrib/DRatio);
				BRatio=Htblattrib/(Hattrib/DRatio);
				
								
				
				if(ARatio>=BRatio) 
				{
					CRatio=BRatio;
					FRatio = 0;
					ERatio = (Wtblattrib - CRatio*Wattrib/DRatio)/2;
				} 
				else 
				{
					CRatio=ARatio;
					FRatio = (Htblattrib - CRatio*Hattrib/DRatio)/2;
					ERatio = 0;
				}
				if (tblChild.parentNode.id=="1")
				{
					rfile.currentScale="1"
					rfile.currentTranslate.x=-(Xattrib / DRatio ) * CRatio;
					rfile.currentTranslate.y=-(Yattrib / DRatio ) * CRatio;
					if (bFF)
					{
						rfile.setAttribute("transform", "translate(" + rfile.currentTranslate.x + " " + rfile.currentTranslate.y + ") scale(" + rfile.currentScale + ")");
					}
				}
				else
				{
					rfile.currentScale=CRatio;
					rfile.currentTranslate.x=-(Xattrib / DRatio ) * CRatio + ERatio;
					rfile.currentTranslate.y=-(Yattrib / DRatio ) * CRatio + FRatio;
					if (bFF)
					{
						rfile.setAttribute("transform", "translate(" + rfile.currentTranslate.x + " " + rfile.currentTranslate.y + ") scale(" + rfile.currentScale + ")");
					}
				}			
				
				
				
				tblChild = undefined;
				rfile = undefined;
				Attr1parms = undefined;
				evt.preventDefault();					
				evt.stopPropagation();
			}
		}
	}
	catch(e)
	{
		alert("@Error@ exMove(evt): " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		tblChild = undefined;
		tblNode = undefined;
	}
}

function exUpdateClick(evt)
{
	ResetDiagramTransform(evt);
}

function exAddClick(evt)
{
	try
	{
		var undefined;
		var tblNode;
		
		var Add1;
		var Add2;
		var Item1;
		var Item2;
		var Item3;
		var Item4;
		var AddItem;
		
		var rfile;
		var viewbox;
		var Attr1parms;
		var currentScale;
		var Wtblattrib;
		var Htblattrib;
		var WRatio;
		var HRatio;
		var DRatio;
		var targetAdd;
		
		if (evt.shiftKey && !evt.ctrlKey) 
		{
			rfile = qfile.getSVGelem(); 
			removeRotation(rfile);

			viewbox = rfile.getAttribute("viewBox");
			Attr1parms = viewbox.split(/ /);
			currentScale=rfile.currentScale;
			Wtblattrib=rfile.getAttribute("width");
			Htblattrib=rfile.getAttribute("height");
			if (Wtblattrib == "100%") 
			{
				Wtblattrib = getClientWidth();
			}
			if (Htblattrib == "100%")
			{
				Htblattrib = getClientHeight();
			}
			WRatio = Attr1parms[2]/Wtblattrib;
			HRatio = Attr1parms[3]/Htblattrib;
			
			 if(WRatio>=HRatio)
			{
				DRatio=WRatio;
			}
			else
			{
				DRatio=HRatio;
			}
		
			tblNode = getTarget(evt);
			while((tblNode.nodeName != "g" && tblNode != null) || tblNode.getAttribute("ignore") == "true" )
			{
				tblNode = tblNode.parentNode;
			}

			
			
			
			
			
			Add1 = (evt.clientX - rfile.currentTranslate.x)*DRatio/currentScale + parseInt(Attr1parms[0]);
			Add2 = (evt.clientY - rfile.currentTranslate.y)*DRatio/currentScale + parseInt(Attr1parms[1]);
			Item1 = parseInt(tblNode.getAttribute("fromX"));
			Item2 = parseInt(tblNode.getAttribute("toX"));
			Item3 = parseInt(tblNode.getAttribute("fromY"));
			Item4 = parseInt(tblNode.getAttribute("toY"));
			
		
			
			if (Math.abs(Item1-Item2) > Math.abs(Item3-Item4))
			{
				if (Math.abs(Add1 - Item1) > Math.abs(Add1-Item2))
				{
					
					AddItem = tblNode.getAttribute("fromid")
				} 
				else 
				{
					
					AddItem = tblNode.getAttribute("toid")

				}
			}
			else
			{
				if (Math.abs(Add2 - Item3) > Math.abs(Add2-Item4))
				{
					
					AddItem = tblNode.getAttribute("fromid")
				} 
				else
				{
					
					AddItem = tblNode.getAttribute("toid")
				}
			}
			
			if (AddItem == "")
			{
				
			} 
			else
			{

				getMiscInfo(AddItem);
				
				targetAdd =  getItemToAdd(AddItem);
				targetAdd.setAttribute("visibility",'hidden')
				
				setTimeout("countTbl(" + AddItem + ",'visible')",500)
				setTimeout("countTbl(" + AddItem + ",'hidden')",1000)
				setTimeout("countTbl(" + AddItem + ",'visible')",1500)
				setTimeout("countTbl(" + AddItem + ",'hidden')",2000)
				setTimeout("countTbl(" + AddItem + ",'visible')",2500)
				
			}
			evt.preventDefault();
			evt.stopPropagation();
		}
	}
	catch(e)
	{
		alert("@Error@ exAddClick(evt): " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		rfile = undefined;
		viewbox = undefined;
		Attr1parms = undefined;
	}
	
}
function countTbl(AddItem,attrib)
{
	try 
	{
		var targetAdd;
		targetAdd = getItemToAdd(AddItem);
		targetAdd.setAttribute("visibility",attrib)
	}
	catch(e)
	{
		alert("@Error@ countTbl(AddItem,attrib): " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		targetAdd = undefined;

	}

}
				
function setInfoForTbl(TblId, intChars, blnThis, blnNew)
{
	try
	{
		var undefined;
		var clnAttr1;
		var tblElem;
		var ndeidTbl;
		var Data1;
		var Data2;
		var tblAttr;
		var intC=1;
		var intTbl;
		ndeidTbl = GetAddItem(TblId);

		clnAttr1=qfile.getSVGelem();	
		tblElem=clnAttr1.firstChild; 
		intTbl = clnAttr1.childNodes.length;
		while (tblElem != null && intC<=intTbl)
		{
			if ((tblElem.tagName == "g") && tblElem.hasAttributes)
			{
				tblAttr=tblElem.getAttribute("node"); 
				if (tblAttr != "Yes")
				{
					Data1=tblElem.getAttribute("fromid");
					Data2=tblElem.getAttribute("toid");
					if (blnThis)
					{
						if (ndeidTbl == Data1 || ndeidTbl == Data2)
						{
							if (bAct1 && bAdd) 
							{
								tblElem.setAttribute("sa","sa");
							}
							else if (bAct1)
							{
								tblElem.setAttribute("sa","");
							}
							if (blnNew && tblElem.getAttribute("sa") == "sa")
							{
								tblElem.setAttribute("style","opacity:"+intChars+";");
							}
							else if (!blnNew)
							{
								tblElem.setAttribute("style","opacity:"+intChars+";");
							}
						}
					}
					else if (tblElem.getAttribute("sa") != "sa")
					{
						if (ndeidTbl != Data1 && ndeidTbl != Data2)
						{
							tblElem.setAttribute("style","opacity:"+intChars+";");
						}
					}
				}
			}
			tblElem=tblElem.nextSibling;
			intC ++
		}
	}
	catch(e)
	{
		alert("@Error@ setInfoForTbl: " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		clnAttr1 = undefined;
		tblElem = undefined;
	}
}
function setAllTbls(intChars,  blnNew)
{
	try
	{
		var undefined;
		var clnAttr1;
		var tblElem;
		var tblAttr;
		var intC=1;
		var intTbl;
		
		clnAttr1=qfile.getSVGelem();	
		tblElem=clnAttr1.firstChild; 
		intTbl = clnAttr1.childNodes.length;
		while (tblElem != null && intC<=intTbl)
		{
			if ((tblElem.tagName == "g") && tblElem.hasAttributes)
			{
				tblAttr=tblElem.getAttribute("node"); 
				if (tblAttr != "Yes")
				{
					if (bAdd) 
					{
						tblElem.setAttribute("sa","sa");
					}
					else
					{
						tblElem.setAttribute("sa","");
					}
					if (blnNew && tblElem.getAttribute("sa") == "sa")
					{
						tblElem.setAttribute("style","opacity:"+intChars+";");
					}
					else if (!blnNew)
					{
						tblElem.setAttribute("style","opacity:"+intChars+";");
					}
				}
			}
			tblElem=tblElem.nextSibling;
			intC ++
		}
	}
	catch(e)
	{
		alert("@Error@ setAllTbls: " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		clnAttr1 = undefined;
		tblElem = undefined;
	}
}
function getItemToAdd(AddItem) 
{
	var rfile;
	var tblElem;
	var tblAttr;
	
	rfile=qfile.getSVGelem();	
	tblElem=rfile.firstChild; 
	while (tblElem != null) 
	{
		if ((tblElem.tagName == "g") && tblElem.hasAttributes) 
		{
			tblAttr=GetAddItem(tblElem);
			
			if (tblAttr == AddItem) {
				return tblElem;
			}
		}
		tblElem=tblElem.nextSibling;
	}
}
function zoomFocusOnSymbol(AddItem) {
	return; // disabled
	try
	{
		var undefined;
		var tblNode;
		var tblChild;
		var Xattrib;
		var Yattrib;
		var Hattrib;
		var Wattrib;
		var rfile;
		var Wtblattrib;
		var Htblattrib;
		var WRatio;
		var HRatio;
		var DRatio;
		var ARatio;
		var BRatio;
		var CRatio;
		var ERatio;
		var FRatio;
		var currentScale;
		var viewbox;
		var Attr1parms;
	
		rfile = qfile.getSVGelem(); 
		tblNode = getItemToAdd(AddItem);

		removeRotation(rfile);

		Xattrib = tblNode.getBBox().x;
		Yattrib = tblNode.getBBox().y;
		Wattrib = tblNode.getBBox().width;
		Hattrib = tblNode.getBBox().height;
							
		viewbox = rfile.getAttribute("viewBox");
		Attr1parms = viewbox.split(/ /);
	
		currentScale=rfile.currentScale;
		Wtblattrib=rfile.getAttribute("width");
		Htblattrib=rfile.getAttribute("height");

		if (Wtblattrib == "100%")
		{
			Wtblattrib = getClientWidth();
		}
		if (Htblattrib == "100%")
		{
			Htblattrib = getClientHeight();
		}				
		WRatio = Attr1parms[2]/Wtblattrib;
		HRatio = Attr1parms[3]/Htblattrib;
		
		if(WRatio>=HRatio)
		{
			DRatio=WRatio;
		}
		else
		{
			DRatio=HRatio;
		}					
		Xattrib = Xattrib-Attr1parms[0];	
		Yattrib = Yattrib-Attr1parms[1];
							
		ARatio=Wtblattrib/(Wattrib/DRatio);
		BRatio=Htblattrib/(Hattrib/DRatio);
							
		
		if(ARatio>=BRatio)
		{
			
			
			
			CRatio=BRatio/2;
			FRatio = (Htblattrib - CRatio*Hattrib/DRatio)/2;
			ERatio = (Wtblattrib - CRatio*Wattrib/DRatio)/2;
		} 
		else
		{
			
			
			
			CRatio=ARatio/2;
			FRatio = (Htblattrib - CRatio*Hattrib/DRatio)/2;
			ERatio = (Wtblattrib - CRatio*Wattrib/DRatio)/2;
		}
		
		rfile.currentScale=CRatio;
		rfile.currentTranslate.x=-(Xattrib / DRatio ) * CRatio + ERatio;
		rfile.currentTranslate.y=-(Yattrib / DRatio ) * CRatio + FRatio;
		if (bFF)
		{
			rfile.setAttribute("transform", "translate(" + rfile.currentTranslate.x + " " + rfile.currentTranslate.y + ") scale(" + rfile.currentScale + ")");
		}
	}
	catch(e)
	{
		alert("@Error@ zoomFocusOnSymbol: " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		tblNode = undefined;
		tblChild = undefined;
		rfile = undefined;
		Attr1parms = undefined;
	}
}
function zoomInOnSymbol(AddItem) {
	return; // disabled
	try
	{
		var undefined;
		var tblNode;
		var tblChild;
		var Xattrib;
		var Yattrib;
		var Hattrib;
		var Wattrib;
		var rfile;
		var Wtblattrib;
		var Htblattrib;
		var WRatio;
		var HRatio;
		var DRatio;
		var ARatio;
		var BRatio;
		var CRatio;
		var ERatio;
		var FRatio;
		var currentScale;
		var viewbox;
		var Attr1parms;
	
		rfile = qfile.getSVGelem(); 
		tblNode = getItemToAdd(AddItem);

		removeRotation(rfile);

		Xattrib = tblNode.getBBox().x;
		Yattrib = tblNode.getBBox().y;
		Wattrib = tblNode.getBBox().width;
		Hattrib = tblNode.getBBox().height;
							
		viewbox = rfile.getAttribute("viewBox");
		Attr1parms = viewbox.split(/ /);
	
		currentScale=rfile.currentScale;
		Wtblattrib=rfile.getAttribute("width");
		Htblattrib=rfile.getAttribute("height");

		if (Wtblattrib == "100%")
		{
			Wtblattrib = getClientWidth();
		}
		if (Htblattrib == "100%")
		{
			Htblattrib = getClientHeight();
		}				
		WRatio = Attr1parms[2]/Wtblattrib;
		HRatio = Attr1parms[3]/Htblattrib;
		
		if(WRatio>=HRatio)
		{
			DRatio=WRatio;
		}
		else
		{
			DRatio=HRatio;
		}					
		Xattrib = Xattrib-Attr1parms[0];	
		Yattrib = Yattrib-Attr1parms[1];
							
		CRatio=rfile.currentScale+0.25;
		FRatio = (Htblattrib - CRatio*Hattrib/DRatio)/2;
		ERatio = (Wtblattrib - CRatio*Wattrib/DRatio)/2;
		
		rfile.currentScale=CRatio;
		rfile.currentTranslate.x=-(Xattrib / DRatio ) * CRatio + ERatio;
		rfile.currentTranslate.y=-(Yattrib / DRatio ) * CRatio + FRatio;
		if (bFF)
		{
			rfile.setAttribute("transform", "translate(" + rfile.currentTranslate.x + " " + rfile.currentTranslate.y + ") scale(" + rfile.currentScale + ")");
		}
	}
	catch(e)
	{
		alert("@Error@ zoomInOnSymbol: " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		tblNode = undefined;
		tblChild = undefined;
		rfile = undefined;
		Attr1parms = undefined;
	}
}

function zoomOutFromSymbol(AddItem) {
	return; // disabled
	try
	{
		var undefined;
		var tblNode;
		var tblChild;
		var Xattrib;
		var Yattrib;
		var Hattrib;
		var Wattrib;
		var rfile;
		var Wtblattrib;
		var Htblattrib;
		var WRatio;
		var HRatio;
		var DRatio;
		var ARatio;
		var BRatio;
		var CRatio;
		var ERatio;
		var FRatio;
		var currentScale;
		var viewbox;
		var Attr1parms;
	
		rfile = qfile.getSVGelem(); 
		tblNode = getItemToAdd(AddItem);

		removeRotation(rfile);

		Xattrib = tblNode.getBBox().x;
		Yattrib = tblNode.getBBox().y;
		Wattrib = tblNode.getBBox().width;
		Hattrib = tblNode.getBBox().height;
							
		viewbox = rfile.getAttribute("viewBox");
		Attr1parms = viewbox.split(/ /);
	
		currentScale=rfile.currentScale;
		Wtblattrib=rfile.getAttribute("width");
		Htblattrib=rfile.getAttribute("height");

		if (Wtblattrib == "100%")
		{
			Wtblattrib = getClientWidth();
		}
		if (Htblattrib == "100%")
		{
			Htblattrib = getClientHeight();
		}				
		WRatio = Attr1parms[2]/Wtblattrib;
		HRatio = Attr1parms[3]/Htblattrib;
		
		if(WRatio>=HRatio)
		{
			DRatio=WRatio;
		}
		else
		{
			DRatio=HRatio;
		}					
		Xattrib = Xattrib-Attr1parms[0];	
		Yattrib = Yattrib-Attr1parms[1];
							
		CRatio=rfile.currentScale-0.25;
		FRatio = (Htblattrib - CRatio*Hattrib/DRatio)/2;
		ERatio = (Wtblattrib - CRatio*Wattrib/DRatio)/2;
		
		rfile.currentScale=CRatio;
		rfile.currentTranslate.x=-(Xattrib / DRatio ) * CRatio + ERatio;
		rfile.currentTranslate.y=-(Yattrib / DRatio ) * CRatio + FRatio;
		if (bFF)
		{
			rfile.setAttribute("transform", "translate(" + rfile.currentTranslate.x + " " + rfile.currentTranslate.y + ") scale(" + rfile.currentScale + ")");
		}
	}
	catch(e)
	{
		alert("@Error@ zoomInOnSymbol: " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		tblNode = undefined;
		tblChild = undefined;
		rfile = undefined;
		Attr1parms = undefined;
	}
}

function removeRotation(svnewElem)
{/* this relied on batik/some other jar
		var transform = svnewElem.getSVGContext().getScreenTransform();
		transform.setToRotation(0);
		svnewElem.getSVGContext().setScreenTransform(transform);
*/		
}

function getMiscInfo(AddItem) 
{
	try
	{
		var undefined;
		var tblNode;
		var tblChild;
		var Xattrib;
		var Yattrib;
		var Hattrib;
		var Wattrib;
		var rfile;
		var Wtblattrib;
		var Htblattrib;
		var WRatio;
		var HRatio;
		var DRatio;
		var ARatio;
		var BRatio;
		var CRatio;
		var ERatio;
		var FRatio;
		var currentScale;
		var viewbox;
		var Attr1parms;
	
		rfile = qfile.getSVGelem(); 
		tblNode = getItemToAdd(AddItem);
			
		Xattrib = tblNode.getBBox().x;
		Yattrib = tblNode.getBBox().y;
		Wattrib = tblNode.getBBox().width;
		Hattrib = tblNode.getBBox().height;
							
		
		viewbox = rfile.getAttribute("viewBox");
		Attr1parms = viewbox.split(/ /);
	
		currentScale=rfile.currentScale;
		Wtblattrib=rfile.getAttribute("width");
		Htblattrib=rfile.getAttribute("height");
							
		if (Wtblattrib == "100%")
		{
			Wtblattrib = getClientWidth();
		}
		if (Htblattrib == "100%")
		{
			Htblattrib = getClientHeight();
		}				
		WRatio = Attr1parms[2]/Wtblattrib;
		HRatio = Attr1parms[3]/Htblattrib;
		
		if(WRatio>=HRatio)
		{
			DRatio=WRatio;
		}
		else
		{
			DRatio=HRatio;
		}					
		Xattrib = Xattrib-Attr1parms[0];	
		Yattrib = Yattrib-Attr1parms[1];
							
		ARatio=Wtblattrib/(Wattrib/DRatio);
		BRatio=Htblattrib/(Hattrib/DRatio);
							
		
		if(ARatio>=BRatio)
		{
			
			
			
			CRatio=rfile.currentScale
			FRatio = (Htblattrib - CRatio*Hattrib/DRatio)/2;
			ERatio = (Wtblattrib - CRatio*Wattrib/DRatio)/2;
		} 
		else
		{
			
			
			
			CRatio=rfile.currentScale;
			FRatio = (Htblattrib - CRatio*Hattrib/DRatio)/2;
			ERatio = (Wtblattrib - CRatio*Wattrib/DRatio)/2;
		}
							
		rfile.currentScale=CRatio;
		rfile.currentTranslate.x=-(Xattrib / DRatio ) * CRatio + ERatio;
		rfile.currentTranslate.y=-(Yattrib / DRatio ) * CRatio + FRatio;
		if (bFF)
		{
			rfile.setAttribute("transform", "translate(" + rfile.currentTranslate.x + " " + rfile.currentTranslate.y + ") scale(" + rfile.currentScale + ")");
		}
		
	}
	catch(e)
	{
		alert("@Error@ getMiscInfo: " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
	finally
	{
		tblNode = undefined;
		tblChild = undefined;
		rfile = undefined;
		Attr1parms = undefined;
	}
}

function GetAddItem(tblNode)
{

	try
	{
		var AddItem;

		AddItem = tblNode.getAttribute("id");

		if(AddItem=="")
		{
			AddItem = tblNode.getAttribute("ID");
		}
		return AddItem;
	}
	catch(e)
	{
		alert("@Error@ GetId: " + "\n Name: " + e.name + "\n Error Description: " + e.message + "\n Error number: " + e.number);
	}
}

function getClientWidth()
{
	var svg = document.getSVGelem();
	var container = svg.parentNode;
	return container.clientWidth;
}

function getClientHeight()
{
	var svg = document.getSVGelem();
	var container = svg.parentNode;
	return container.clientHeight;
}

function svgClick(evt)
{
	// Ctrl+Shift+Click			original view
	if (evt.shiftKey && evt.ctrlKey)
	{	
		ResetDiagramTransform(evt);
	}
}

function svgMouseDown(evt)
{
}

function svgMouseUp(evt)
{
}

function ResetDiagramTransform(evt)
{
	var rfile = qfile.getSVGelem(); 

	rfile.currentScale=1;
	rfile.currentTranslate.x=0;
	rfile.currentTranslate.y=0;
	if (bFF)
	{
//		rfile.setAttribute("transform", "translate(" + rfile.currentTranslate.x + " " + rfile.currentTranslate.y + ") scale(" + rfile.currentScale + ")");
		rfile.setAttribute("transform", ""); // does the same as the above but leaves the mouseover behavior operational
	}
	evt.preventDefault();
	evt.stopPropagation();
}

