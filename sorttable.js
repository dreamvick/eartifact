/*
Table sorting script  by Joost de Valk, check it out at http://www.joostdevalk.nl/code/sortable-table/.
Based on a script from http://www.kryogenix.org/code/browser/sorttable/.
Distributed under the MIT license: http://www.kryogenix.org/code/browser/licence.html .

Copyright (c) 1997-2007 Stuart Langridge, Joost de Valk.

Version 1.5.7
*/

/* You can change these values */
// Begin UNICOM Systems, Inc. changes
var image_path = "";
var image_up = "arrow-up.gif";
var image_down = "arrow-down.gif";
var image_none = "arrow-none.gif";
var europeandate = false;
// End UNICOM Systems, Inc. changes
var alternate_row_colors = true;

/* Don't change anything below this unless you know what you're doing */
/*ignore jslint start*/
//addEvent(window, "load", sortables_init);

var SORT_COLUMN_INDEX;
var thead = false;

function sortables_init() {
	// Find all tables with class sortable and make them sortable
	if (!document.getElementsByTagName) return;
	tbls = document.getElementsByTagName("table");
	for (ti=0;ti<tbls.length;ti++) {
		thisTbl = tbls[ti];
		if (((' '+thisTbl.className+' ').indexOf("sortable") != -1) && (thisTbl.id)) {
			ts_makeSortable(thisTbl);
		}
	}
}

function ts_makeSortable(t) {
	if (t.rows && t.rows.length > 0) {
		if (t.tHead && t.tHead.rows.length > 0) {
			var firstRow = t.tHead.rows[t.tHead.rows.length-1];
			thead = true;
		} else {
			var firstRow = t.rows[0];
		}
	}
	if (!firstRow) return;
	
	// We have a first row: assume it's the header, and make its contents clickable links
	for (var i=0;i<firstRow.cells.length;i++) {
		var cell = firstRow.cells[i];
		var txt = ts_getInnerText(cell);
		if (cell.className != "unsortable" && cell.className.indexOf("unsortable") == -1) {
			cell.innerHTML = '<a href="#" class="sortheader" onclick="ts_resortTable(this, '+i+');return false;">'+txt+'<span class="sortarrow">&nbsp;&nbsp;<img src="'+ image_path + image_none + '" alt="Sort column"/></span></a>';
		}
	}
	if (alternate_row_colors) {
		alternate(t);
	}
}

function ts_getInnerText(el) {
	if (typeof el == "string") return el;
	if (typeof el == "undefined") { return el };
	if (el.innerText) return el.innerText;	//Not needed but it is faster
	var str = "";
	
	var cs = el.childNodes;
	var l = cs.length;
	for (var i = 0; i < l; i++) {
		switch (cs[i].nodeType) {
			case 1: //ELEMENT_NODE
				str += ts_getInnerText(cs[i]);
				break;
			case 3:	//TEXT_NODE
				str += cs[i].nodeValue;
				break;
		}
	}
	return str;
}

function ts_resortTable(lnk, clid) {
	var span;
	for (var ci=0;ci<lnk.childNodes.length;ci++) {
		if (lnk.childNodes[ci].tagName && lnk.childNodes[ci].tagName.toLowerCase() == 'span') span = lnk.childNodes[ci];
	}
	var spantext = ts_getInnerText(span);
	var td = lnk.parentNode;
	var column = clid || td.cellIndex;
	var t = getParent(td,'TABLE');
	// Work out a type for the column
	if (t.rows.length <= 1) return;
	var itm = "";
// Begin UNICOM Systems, Inc. changes
	var i = 1;
// End UNICOM Systems, Inc. changes
	while (itm == "" && i < t.tBodies[0].rows.length) {
		var itm = ts_getInnerText(t.tBodies[0].rows[i].cells[column]);
		itm = trim(itm);
		if (itm.substr(0,4) == "<!--" || itm.length == 0) {
			itm = "";
		}
		i++;
	}
	if (itm == "") return; 
	sortfn = ts_sort_caseinsensitive;
	if (itm.match(/^-?[£$€Û¢´]\d/)) sortfn = ts_sort_numeric;
	if (itm.match(/^-?(\d+[,\.]?)+(E[-+][\d]+)?%?$/)) sortfn = ts_sort_numeric;
	if (itm.match(/^\d\d[\/\.-][a-zA-z][a-zA-Z][a-zA-Z][\/\.-]\d\d\d\d$/)) sortfn = ts_sort_date;
	if (itm.match(/^\d\d[\/\.-]\d\d[\/\.-]\d\d\d{2}?$/)) sortfn = ts_sort_date;
	if (itm.match(/^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d\d\d{2}?$/)) sortfn = ts_sort_date;
	//if (itm.match(/^-?[£$€Û¢´]\d/)) sortfn = ts_sort_numeric;
	//if (itm.match(/^-?(\d+[,\.]?)+(E[-+][\d]+)?%?$/)) sortfn = ts_sort_numeric;
	SORT_COLUMN_INDEX = column;
	var firstRow = new Array();
	var newRows = new Array();
	for (k=0;k<t.tBodies.length;k++) {
		for (i=0;i<t.tBodies[k].rows[0].length;i++) { 
			firstRow[i] = t.tBodies[k].rows[0][i]; 
		}
	}
	for (k=0;k<t.tBodies.length;k++) {
		if (!thead) {
			// Skip the first row
			for (j=1;j<t.tBodies[k].rows.length;j++) { 
				newRows[j-1] = t.tBodies[k].rows[j];
			}
		} else {
			// Do NOT skip the first row
			for (j=0;j<t.tBodies[k].rows.length;j++) { 
				newRows[j] = t.tBodies[k].rows[j];
			}
		}
	}
	newRows.sort(sortfn);
	if (span.getAttribute("sortdir") == 'down') {
			ARROW = '&nbsp;&nbsp;<img src="'+ image_path + image_down + '" border="0" alt="Sort by ascending"/>';
			newRows.reverse();
			span.setAttribute('sortdir','up');
	} else {
			ARROW = '&nbsp;&nbsp;<img src="'+ image_path + image_up + '" border="0" alt="Sort by descending"/>';
			span.setAttribute('sortdir','down');
	} 
    // We appendChild rows that already exist to the tbody, so it moves them rather than creating new ones
    // don't do sortbottom rows
    for (i=0; i<newRows.length; i++) { 
		if (!newRows[i].className || (newRows[i].className && (newRows[i].className.indexOf('sortbottom') == -1))) {
			t.tBodies[0].appendChild(newRows[i]);
		}
	}
    // do sortbottom rows only
    for (i=0; i<newRows.length; i++) {
		if (newRows[i].className && (newRows[i].className.indexOf('sortbottom') != -1)) 
			t.tBodies[0].appendChild(newRows[i]);
	}
	// Delete any other arrows there may be showing
	var allspans = document.getElementsByTagName("span");
	for (var ci=0;ci<allspans.length;ci++) {
		if (allspans[ci].className == 'sortarrow') {
			if (getParent(allspans[ci],"table") == getParent(lnk,"table")) { // in the same table as us?
				allspans[ci].innerHTML = '&nbsp;&nbsp;<img src="'+ image_path + image_none + '" border="0" alt="&darr;"/>';
			}
		}
	}		
	span.innerHTML = ARROW;
	alternate(t);
}

function getParent(el, pTagName) {
	if (el == null) {
		return null;
	} else if (el.nodeType == 1 && el.tagName.toLowerCase() == pTagName.toLowerCase()) {
		return el;
	} else {
		return getParent(el.parentNode, pTagName);
	}
}
function findsep(date) 
{

if (date.indexOf(".") > -1) 
   return (".");
else if (date.indexOf("-") > -1)
   return ("-");
 else if (date.indexOf("/") > -1)
   return ("/");
 else if (date.indexOf("\\") > -1)
   return ("\\");
 return "";
}


function sort_date(date) {	



// separaters are \/\.-
	// y2k notes: two digit years less than 50 are treated as 20XX, greater than 50 are treated as 19XX
	dt = "00000000";
	if (date.length == 11) {
		mtstr = date.substr(3,3);
		mtstr = mtstr.toLowerCase();
		switch(mtstr) {
			case "jan": var mt = "01"; break;
			case "feb": var mt = "02"; break;
			case "mar": var mt = "03"; break;
			case "apr": var mt = "04"; break;
			case "may": var mt = "05"; break;
			case "jun": var mt = "06"; break;
			case "jul": var mt = "07"; break;
			case "aug": var mt = "08"; break;
			case "sep": var mt = "09"; break;
			case "oct": var mt = "10"; break;
			case "nov": var mt = "11"; break;
			case "dec": var mt = "12"; break;
			// default: var mt = "00";
		}
		dt = date.substr(7,4)+mt+date.substr(0,2);
		return dt;
	} else if (date.length == 10) {
		if (europeandate == false) {
			dt = date.substr(6,4)+date.substr(0,2)+date.substr(3,2);
			return dt;
		} else {
			dt = date.substr(6,4)+date.substr(3,2)+date.substr(0,2);
			return dt;
		}
	} /*else if (date.length == 8) {
		yr = date.substr(6,2);
		if (parseInt(yr) < 50) { 
			yr = '20'+yr; 
		} else { 
			yr = '19'+yr; 
		}
		if (europeandate == true) {
			dt = yr+date.substr(3,2)+date.substr(0,2);
			return dt;
		} else {
			dt = yr+date.substr(0,2)+date.substr(3,2);
			return dt;
		}
	}*/
	else {
	
	var sep = findsep(date) ;
	var yr;
	var p1, p2;
	//get first part
	var mySplitResult = date.split(sep);
	if ( mySplitResult[0].length  == 1 )	
		p1 = "0" + mySplitResult[0];
	else p1 = mySplitResult[0];
	if ( mySplitResult[1].length  == 1 )		
		p2 = "0" + mySplitResult[1];
	else p2 = mySplitResult[1];
	
	yr = mySplitResult[2];
	if ( yr.length  == 2 )
		{
		if (parseInt(yr) < 50) { 
				yr = '20'+yr; 
				} else { 
				yr = '19'+yr; 
				}				
	
		}
      	
      if (europeandate == true) {
			dt = yr+p2+p1;
			
		} else {
			dt = yr+p1+p2;
			
		}		
	
	
	}
	
	return dt;
}


function ts_sort_date(a,b) {
	dt1 = sort_date(ts_getInnerText(a.cells[SORT_COLUMN_INDEX]));
	dt2 = sort_date(ts_getInnerText(b.cells[SORT_COLUMN_INDEX]));
	
	if (dt1==dt2) {
		return 0;
	}
	if (dt1<dt2) { 
		return -1;
	}
	return 1;
}
function ts_sort_numeric(a,b) {
	var aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]);
	aa = clean_num(aa);
	var bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]);
	bb = clean_num(bb);
	return compare_numeric(aa,bb);
}
function compare_numeric(a,b) {
	var a = parseFloat(a);
	a = (isNaN(a) ? 0 : a);
	var b = parseFloat(b);
	b = (isNaN(b) ? 0 : b);
	return a - b;
}
function ts_sort_caseinsensitive(a,b) {
	aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]).toLowerCase();
	bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]).toLowerCase();
	if (aa==bb) {
		return 0;
	}
	if (aa<bb) {
		return -1;
	}
	return 1;
}
function ts_sort_default(a,b) {
	aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]);
	bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]);
	if (aa==bb) {
		return 0;
	}
	if (aa<bb) {
		return -1;
	}
	return 1;
}
// addEvent and removeEvent
// cross-browser event handling for IE5+,	NS6 and Mozilla
// By Scott Andrew
function addEvent(elm, evType, fn, useCapture)
{
	if (elm.addEventListener){
		elm.addEventListener(evType, fn, useCapture);
		return true;
	} else if (elm.attachEvent){
		var r = elm.attachEvent("on"+evType, fn);
		return r;
	} else {
		alert("Handler could not be removed");
	}
}
function clean_num(str) {
	str = str.replace(new RegExp(/[^-?0-9.]/g),"");
	return str;
}
function trim(s) {
	return s.replace(/^\s+|\s+$/g, "");
}
function alternate(table) {
	// Take object table and get all it's tbodies.
	var tableBodies = table.getElementsByTagName("tbody");
	// Loop through these tbodies
	for (var i = 0; i < tableBodies.length; i++) {
		// Take the tbody, and get all it's rows
		var tableRows = tableBodies[i].getElementsByTagName("tr");
		// Loop through these rows
		// Start at 1 because we want to leave the heading row untouched
		for (var j = 0; j < tableRows.length; j++) {
			// Check if j is even, and apply classes for both possible results
			if ( (j % 2) == 0  ) {
				if ( !(tableRows[j].className.indexOf('odd') == -1) ) {
					tableRows[j].className = tableRows[j].className.replace('odd', 'even');
				} else {
					if ( tableRows[j].className.indexOf('even') == -1 ) {
						tableRows[j].className += " even";
					}
				}
			} else {
				if ( !(tableRows[j].className.indexOf('even') == -1) ) {
					tableRows[j].className = tableRows[j].className.replace('even', 'odd');
				} else {
					if ( tableRows[j].className.indexOf('odd') == -1 ) {
						tableRows[j].className += " odd";
					}
				}
			} 
		}
	}
}


//#######################################################################
//#######################################################################
//#######################################################################

// F. Permadi 2005.
// Highlights table row
// Copyright (C) F. Permadi
// This code is provided "as is" and without warranty of any kind.  Use at your own risk.



// These variables are for saving the original background colors
var savedStates=new Array();
var savedStateCount=0;

/////////////////////////////////////////////////////
// This function takes an element as a parameter and 
//   returns an object which contain the saved state
//   of the element's background color.
/////////////////////////////////////////////////////
function saveBackgroundStyle(myElement)
{
  saved=new Object();
  saved.element=myElement;
  saved.className=myElement.className;
  saved.backgroundColor=myElement.style["backgroundColor"];
  return saved;   
}

/////////////////////////////////////////////////////
// This function takes an element as a parameter and 
//   returns an object which contain the saved state
//   of the element's background color.
/////////////////////////////////////////////////////
function restoreBackgroundStyle(savedState)
{
  savedState.element.style["backgroundColor"]=savedState.backgroundColor;
  if (savedState.className)
  {
    savedState.element.className=savedState.className;    
  }
}

/////////////////////////////////////////////////////
// This function is used by highlightTableRow() to find table cells (TD) node
/////////////////////////////////////////////////////
function findNode(startingNode, tagName)
{
  // on Firefox, the TD node might not be the firstChild node of the TR node
  myElement=startingNode;
  var i=0;
  while (myElement && (!myElement.tagName || (myElement.tagName && myElement.tagName!=tagName)))
  {
    myElement=startingNode.childNodes[i];
    i++;
  }  
  if (myElement && myElement.tagName && myElement.tagName==tagName)
  {
    return myElement;
  }
  // on IE, the TD node might be the firstChild node of the TR node  
  else if (startingNode.firstChild)
    return findNode(startingNode.firstChild, tagName);
  return 0;
}

/////////////////////////////////////////////////////
// Highlight table row.
// newElement could be any element nested inside the table
// highlightColor is the color of the highlight
/////////////////////////////////////////////////////
function highlightTableRow(myElement, highlightColor)
{
  var i=0;
  // Restore color of the previously highlighted row
  for (i; i<savedStateCount; i++)
  {
    restoreBackgroundStyle(savedStates[i]);          
  }
  savedStateCount=0;

  // To get the node to the row (ie: the <TR> element), 
  // we need to traverse the parent nodes until we get a row element (TR)
  // Netscape has a weird node (if the mouse is over a text object, then there's no tagName
  while (myElement && ((myElement.tagName && myElement.tagName!="TR") || !myElement.tagName))
  {
    myElement=myElement.parentNode;
  }

  // If you don't want a particular row to be highlighted, set it's id to "header"
  // If you don't want a particular row to be highlighted, set it's id to "header"
  if (!myElement || (myElement && myElement.id && myElement.id=="header") )
    return;
		  
  // Highlight every cell on the row
  if (myElement)
  {
    var tableRow=myElement;
    
    // Save the backgroundColor style OR the style class of the row (if defined)
    if (tableRow)
    {
	  savedStates[savedStateCount]=saveBackgroundStyle(tableRow);
      savedStateCount++;
    }

    // myElement is a <TR>, then find the first TD
    var tableCell=findNode(myElement, "TD");    

    var i=0;
    // Loop through every sibling (a sibling of a cell should be a cell)
    // We then highlight every siblings
    while (tableCell)
    {
      // Make sure it's actually a cell (a TD)
      if (tableCell.tagName=="TD")
      {
        // If no style has been assigned, assign it, otherwise Netscape will 
        // behave weird.
        if (!tableCell.style)
        {
          tableCell.style={};
        }
        else
        {
          savedStates[savedStateCount]=saveBackgroundStyle(tableCell);        
          savedStateCount++;
        }
        // Assign the highlight color
        tableCell.style["backgroundColor"]=highlightColor;

        // Optional: alter cursor
        tableCell.style.cursor='default';
        i++;
      }
      // Go to the next cell in the row
      tableCell=tableCell.nextSibling;
    }
  }
}

/////////////////////////////////////////////////////
// This function is to be assigned to a <table> mouse event handler.
// If the element that fired the event is within a table row,
//   this function will highlight the row.
/////////////////////////////////////////////////////
function trackTableHighlight(mEvent, highlightColor)
{
  if (!mEvent)
    mEvent=window.event;
		
  // Internet Explorer
  if (mEvent.srcElement)
  {
    highlightTableRow( mEvent.srcElement, highlightColor);
  }
  // Netscape and Firefox
  else if (mEvent.target)
  {
    highlightTableRow( mEvent.target, highlightColor);		
  }
}

/////////////////////////////////////////////////////
// Highlight table row.
// newElement could be any element nested inside the table
// highlightColor is the color of the highlight
/////////////////////////////////////////////////////
function highlightTableRowVersionA(myElement, highlightColor)
{
  var i=0;
  // Restore color of the previously highlighted row
  for (i; i<savedStateCount; i++)
  {
    restoreBackgroundStyle(savedStates[i]);          
  }
  savedStateCount=0;

  // If you don't want a particular row to be highlighted, set it's id to "header"
  if (!myElement || (myElement && myElement.id && myElement.id=="header") )
    return;
		  
  // Highlight every cell on the row
  if (myElement)
  {
    var tableRow=myElement;
    
    // Save the backgroundColor style OR the style class of the row (if defined)
    if (tableRow)
    {
	  savedStates[savedStateCount]=saveBackgroundStyle(tableRow);
      savedStateCount++;
    }

    // myElement is a <TR>, then find the first TD
    var tableCell=findNode(myElement, "TD");    

    var i=0;
    // Loop through every sibling (a sibling of a cell should be a cell)
    // We then highlight every siblings
    while (tableCell)
    {
      // Make sure it's actually a cell (a TD)
      if (tableCell.tagName=="TD")
      {
        // If no style has been assigned, assign it, otherwise Netscape will 
        // behave weird.
        if (!tableCell.style)
        {
          tableCell.style={};
        }
        else
        {
          savedStates[savedStateCount]=saveBackgroundStyle(tableCell);        
          savedStateCount++;
        }
        // Assign the highlight color
        tableCell.style["backgroundColor"]=highlightColor;

        // Optional: alter cursor
        tableCell.style.cursor='default';
        i++;
      }
      // Go to the next cell in the row
      tableCell=tableCell.nextSibling;
    }
  }
}
/*ignore jslint end*/
