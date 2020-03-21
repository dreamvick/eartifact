/*ignore jslint start*/
// ToolBar.js

function word(ev)
{
 var EnterKey = checkKey(ev); 
 if (EnterKey == true||ev.type=="click"){
   try{
      var oWSHShell = new ActiveXObject("WScript.Shell");                    
       oWSHShell.Run("winword " +  window.location.href);
      }
      catch(e)
	{ handleError() }
   }     
}

function excel(ev)
{
    var EnterKey = checkKey(ev); 
    if (EnterKey == true||ev.type=="click"){
       try{
           var oWSHShell = new ActiveXObject("WScript.Shell");                    
     	   oWSHShell.Run("excel " +  window.location.href);  
	    }
	 catch(e)
	   { handleError() }
	}
} 

function save(ev)
 {
      var EnterKey = checkKey(ev); 
      if (EnterKey == true||ev.type=="click"){
     try{
          document.execCommand('SaveAs',true, document.title +'.htm');
	    }
	  catch(e)
	    { handleError() }
	}
}

function printme(ev)
 {
 var EnterKey = checkKey(ev); 
      if (EnterKey == true||ev.type=="click"){
    try{
		var bFF = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

		var nl = document.getElementsByTagName("svg");
		var svgelem  =  nl[0];	
		if (bFF)
		{
			var strtransform = svgelem.getAttribute("transform");
			svgelem.setAttribute("transform", ""); // without doing this the results are inconsistent with what is expected; translation is incorrect
		}
		else
		{
			svgelem.currentScale=1;
			svgelem.currentTranslate.x=0;
			svgelem.currentTranslate.y=0;
		}
		
		var prtContent = document.getElementById("printregion");
		var WinPrint = window.open('', '', 'left=0,top=0,width=' + prtContent.width + ',height=' + prtContent.height + ',toolbar=0,scrollbars=0,status=0');
		//var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
		WinPrint.document.write('<LINK REL="StyleSheet" Type="text/css" HREF="Frame.css">');
		WinPrint.document.write('<link rel="stylesheet" type="text/css" href="css/theme.css">');
		WinPrint.document.write('<div id="app-container"></div>');

		WinPrint.document.write(prtContent.innerHTML);

		if (bFF)
		{
			svgelem.setAttribute("transform", strtransform); // without doing this the results are inconsistent with what is expected; translation is incorrect
		}
		
		WinPrint.document.close();
		WinPrint.focus();
		setTimeout(function(){
			WinPrint.print();
			WinPrint.close();		
		},500);
		
		/* this coupled with an iframe - diagrams don't look good and we have about:blank at top right
					printDivCSS = new String ('<LINK REL="StyleSheet" Type="text/css" HREF="Frame.css"><link rel="stylesheet" type="text/css" href="css/theme.css">')
						window.frames["print_frame"].document.body.innerHTML=printDivCSS + document.getElementById("printregion").innerHTML;
						window.frames["print_frame"].window.focus();
						window.frames["print_frame"].window.print();
		*/			
		
		// this prints the entire window
		//       window.print();
	  }
      catch(e)
	    { handleError() }
	}
 }

function handleError() 
{	
    //alert ("TASK BROWSER SECURITY SETTING (One-time change). \n\n You will need to change a setting on the client computer to accept the Active X Script. \n\n1, In your IE browser, go to Tools | Internet Options | Security | Custom Level. \n2, Scroll down until you see Initalizing and Scripting ActiveX controls that are not marked safe is disabled. \n3, Changed it from disabled to prompt. This will ask you page if you would like to run the script (that opens in word or excel).");
	return false;
}

function comment(semail,ev)
{
  var EnterKey = checkKey(ev); 
  if (EnterKey == true||ev.type=="click"){
     try{
       document.location.href="mailto:" + semail + "\?subject\=TASK Report:" + document.title + "&body\=Report: " + escape	(window.location.href) + "%0D%0AComments here.";
	 }
	catch(e)
	{ handleError() }
   } 
}

function email(ev)
{
var EnterKey = checkKey(ev); 
  if (EnterKey == true||ev.type=="click"){
   try{
       document.location.href="mailto:\?subject\=TASK Report:" + document.title +"&body\=" + "Link: " +  escape(window.location.href) + "%0D%0ANOTE: Ctrl-V or paste to add report to email.";
	   bodyrange=document.body.createTextRange().execCommand('Copy');
	   }
    catch(e)
	{ handleError() }
    }
}

function copy(ev)
{
 var EnterKey = checkKey(ev); 
  if (EnterKey == true||ev.type=="click"){
   try{
    bodyrange=document.body.createTextRange().execCommand('SelectAll');
	bodyrange=document.body.createTextRange().execCommand('Copy');
	  }
	catch(e)
	  { handleError() }
	}
}

function checkKey(ev){
var k;
if(document.all){
    k = window.event.keyCode;
 }
 else{
    k = ev.which ;
}
if (k == 13)  return true;
}
/*ignore jslint end*/
