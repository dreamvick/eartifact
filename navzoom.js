		var NavZoom_transMatrix;      
		var NavZoom_mapMatrix;
		var NavZoom_width;
		var NavZoom_height;
	    function NavZoom_getSVGelem() 
		{
			var nl = document.getElementsByTagName("svg");
			return nl[0];	
		}
		function NavZoom_getClientWidth()
		{
			var svg = NavZoom_getSVGelem();
			return svg.parentNode.clientWidth;
		}
		function NavZoom_getClientHeight()
		{
			var svg = NavZoom_getSVGelem();
			return svg.parentNode.clientHeight;
		}
        function NavZoom_init_inner(svgelem)
        {
			NavZoom_transMatrix = [1,0,0,1,0,0];
			var svgDoc;
			
            if ( window.svgDocument == null )
            {
                svgDoc = svgelem.ownerDocument;
            }
            NavZoom_mapMatrix = svgDoc.getElementById("map-matrix");
            NavZoom_width  = svgelem.getAttributeNS(null, "width");
			if (NavZoom_width="100%")
			{
				try
				{
					NavZoom_width = NavZoom_getClientWidth();
				}
				catch(e)
				{
					NavZoom_width = 500; // used if browser is viewing the file directly
				}
			}
            NavZoom_height = svgelem.getAttributeNS(null, "height");
			if (NavZoom_height="100%")
			{
				try
				{
					NavZoom_height = NavZoom_getClientHeight();
				}
				catch(e)
				{
					NavZoom_height = 500; // used if browser is viewing the file directly
				}
			}
        }     
        function NavZoom_init(evt)
		{
			NavZoom_init_inner(evt.target);
		}
        function NavZoom_pan(dx, dy)
        {
        	
			NavZoom_transMatrix[4] += dx;
			NavZoom_transMatrix[5] += dy;
            
			var newMatrix = "matrix(" +  NavZoom_transMatrix.join(' ') + ")";
			NavZoom_mapMatrix.setAttributeNS(null, "transform", newMatrix);
        }
        
		function NavZoom_zoom(scale)
		{
			for (var i=0; i<NavZoom_transMatrix.length; i++)
			{
				NavZoom_transMatrix[i] *= scale;
			}
			NavZoom_transMatrix[4] += (1-scale)*NavZoom_width/2;
			NavZoom_transMatrix[5] += (1-scale)*NavZoom_height/2;
		        
			var newMatrix = "matrix(" +  NavZoom_transMatrix.join(' ') + ")";
			NavZoom_mapMatrix.setAttributeNS(null, "transform", newMatrix);
        }

		function NavZoom_ResetDiagramTransform(evt)
		{
			NavZoom_transMatrix = [1,0,0,1,0,0];
			NavZoom_mapMatrix.setAttributeNS(null, "transform", NavZoom_transMatrix);
		}

		