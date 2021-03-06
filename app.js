/*!   Macro4 SAPublisher Version 1.0.0  Build 2048094027 [Tue Dec 20 2016 09:40:28]
**   (c) Copyright 2006-2016 All Rights Reserved.  Macro 4 Limited - a division of UNICOM Systems, Inc.
**   THE INFORMATION CONTAINED HEREIN CONSTITUTES AN UNPUBLISHED WORK OF MACRO 4
**   LIMITED - A DIVISION OF UNICOM SYSTEMS, INC.  ALL RIGHTS RESERVED. NO 
**   MATERIAL FROM THIS WORK MAY BE REPRINTED, COPIED, OR EXTRACTED WITHOUT
**   WRITTEN PERMISSION OF MACRO 4 LIMITED.
**   http://www.macro4.com
**/

App.config = {
};

App.settings = {
    "defaultDatagridViewMode":"normal"
};

//Set your default layout. Use either App.switchTo2Up or App.switchTo3Up
App.switchTo2Up();


function lookupReportInDefinitions(link) {
    for (var c in SADefinitions) {
        var cat=SADefinitions[c];
        for (var i=0;i<cat.length;i++){
            if (cat[i][2] === link) {
                return { "link": cat[i][2], "name": cat[i][0], "report": cat[i][1],"def": c};
            }
        }
    }
}


UX4ActionHub.on("isLoggedIn.ux4app", function () {
    UX4ActionHub.trigger("isLoggedInComplete.ux4app", true);
}.bind(this));


/******************************************************************************
* Event Listener : logout.ux4app
* Add code here for when the user has clicked to logout of the app
*******************************************************************************/
//Setup an event listener for logout
UX4ActionHub.on(UX4Application.UX4_APP_LOGOUT, function (e) {
    App.clearUser();
    App.openRoute("login");
});

/******************************************************************************
* Event Listener : loginerror.ux4app
*
*******************************************************************************/
UX4ActionHub.on(UX4Application.UX4_APP_LOGIN_ERROR, function (e,msg) {
    alert(msg);
});


/******************************************************************************
* Event Listener : settings.ux4app
* Triggered when the settings menu item is clicked
*******************************************************************************/
//Setup an event listener for logout
UX4ActionHub.on(UX4Application.UX4_APP_SETTINGS, function (e) {
    UX4Pages.openBackBoneView(App.layout, 'dialog', App.views.SettingsView, {}, { "view": "settings" });
});

/******************************************************************************
* Event Listener : settings.ux4app
* Triggered when the settings menu item is clicked
*******************************************************************************/
UX4ActionHub.on(UX4Application.UX4_APP_SETTINGS_UPDATED, function (e) {
    document.location.reload();
});

/******************************************************************************
* Event Listener : beforeopenroute.ux4app
* Called just whenever a route chaneg is detected in backbone
*******************************************************************************/
//Setup an event listener for logout
UX4ActionHub.on(UX4Application.UX4_APP_BEFORE_OPEN_ROUTE, function (e) {
});

/******************************************************************************
* Event Listener : afteropenroute.ux4app
* Called after a view has been displayed
*******************************************************************************/
//Setup an event listener for logout
UX4ActionHub.on(UX4Application.UX4_APP_AFTER_OPEN_ROUTE, function (e) {
});



/******************************************************************************
* Event Listener : init.ux4app
* Setup any shared data in here. This is executed in the App before:start event
*******************************************************************************/
UX4ActionHub.on(UX4Application.UX4_APP_INIT, function () {
	App.setUser("UNICOM Systems");
    UX4ActionHub.trigger(UX4Application.UX4_APP_INIT_COMPLETE);
});






function addToBreadCrumb(url,name)
{
    var maximumHistoryTrace = 6;

    if (!App.breadcrumb) App.breadcrumb = [];

    App.breadcrumb.push({
        "href": "#"+url,
        "name": name
    });

    //Remove the first entry if we have gone over the maximum
    if (App.breadcrumb.length>maximumHistoryTrace) App.breadcrumb=App.breadcrumb.slice(1);
}

function showHideBreadcrumb (bShow){
        
    if (bShow === undefined || bShow === null) bShow = App.settings.showBreadcrumb || true;

    var $showB = $("#showB");
    var $hideB = $("#hideB");
    var $trace=$("#trace");
	
    if (bShow){
        $showB.hide();
        $hideB.show();
        $trace.show();
        
    }
    else {
        $showB.show();
        $hideB.hide();
        $trace.hide();
    }

    App.settings.showBreadcrumb=bShow;
}


function drawBreadcrumb(el)
{
    var aHTML = [];
    var that = this;

    $(el).prepend("<div class='breadcrumb-bar'></div>");
    aHTML.push("<a href='#'>Home</a>");

    showHideBreadcrumb();

    for (var i = 0; i < App.breadcrumb.length; i++) {
        aHTML.push("<i class='fa fa-chevron-right' /><a href='" + App.breadcrumb[i].href + "'>" + App.breadcrumb[i].name + "</a>");
    }

    $(".breadcrumb-bar",$(el)).html(aHTML.join(""));
}


function setupBreadcrumbEvents(url,name,el)
    {
        var that = this;

        $("#hideB").off("click").click(function (event) {
            event.preventDefault();
            showHideBreadcrumb(false);
        });

        $("#showB").off("click").click(function (event) {
            event.preventDefault();
            showHideBreadcrumb(true);
        });

        $("a[title='Reset']").off("click").click(function (event) {
            event.preventDefault();
            App.breadcrumb = [];
            addToBreadCrumb(url,name);
            drawBreadcrumb(el);
        });
}
App.views.LoginView = UX4.Marionette.ItemView.extend({

    template: "#template-login",

    init: function (opts) {

    },


    onDisplay: function () {
        //Create the login control.
        this.$el.UX4Login({
            route:this.route,
            name: "ux4login",
            rememberMe: false,
            authenticate: function (user, callback) {
                //Validate your login here. you can hook into your own API to validate the login.
                if (user.form.username === "ux4" && user.form.password === "ux4") {
                    callback(true);
                }
                else {
                    callback(false,"Invalid username or password");
                }
            },
            success: function (user) {
                App.setUser("UNICOM Systems");
                App.openRoute(App.redirectedRouteName, null, App.redirectedRouteParams);
            }
        });
    }
});

App.views.HeaderView = UX4.Marionette.ItemView.extend({

    template: "#template-header",

    init: function () {
    },

    onDisplay: function () {
        var user = App.getUser() || "";

        $(this.el).UX4Header({
            "username": user,
            "breadCrumb": true,
            "breadCrumbIcon": "server",
            "breadCrumbText": "",
            "i18nPrefix": "myheader"
        }).UX4Header("hideBackButton");

        return this;
    },

});

App.views.SidebarTreeView = UX4.Marionette.ItemView.extend({

    template: "#template-sidebartree",


    init: function () {
        var that = this;
        this.xml = null;

        this.viewOptions.deferDisplay = false;
    },


    onDisplay: function () {

		if (!browser.isMobile){
	
			this.$el.UX4ActionBar({
					name: this.route.viewName,
					container: $("body"),
					tabText: window.g_title,
					title: window.g_title,
					logo: '', 
					location: "left",
					pinned: true,
					pinnable: true,
					collapsed: false,
					collapsible: false,
					rememberSettings: false,
					hideOnMenuClick: true,
					width: "21em"
				});
			this.$el.UX4ActionBar("getMiscContainer").appendChild($(".demo-tree")[0]);
		
		} else {
			this.$el.UX4ActionBar("getMiscContainer").appendChild($(".demo-tree")[0]);
		}

        $(".demo-tree").UX4Tree({
            route: this.route,
            name: "demotree",
            xml: window.treeXML,
            renderTopMostNode: false,
            nodeAttributesToRender: ["__depth"],
            renderer: "ux4tree-accordion sidebar",
            expansionAnimation: window.UX4TREE.EXPANSION_ANIMATION.GROW,
        }).on("nodeinvoke", function (event, json, element) {

            App.currentDefinition=json.route;
            App.openRoute("report", "threeupmain", { "def": json.route });
        });

    }
});

App.views.ThreeUpMainView = UX4.Marionette.ItemView.extend({

    template: "#template-threeupmain",

    init: function () {
        var that = this;

        this.def = (App.currentDefinition) ? App.currentDefinition : ((this.params.def) ? this.params.def : lookupReportInDefinitions(this.params.link).def);
            
        this.datagridTemplate = [
         { "name": "name", "label": "Name", "datatype": "string", "width": 200 },
         { "name": "report", "visible": false, "datatype": "string", "width": 200 },
         { "name": "link", "visible": false, "datatype": "string", "width": 200 },
        ];

    },

    onDisplay: function () {
        var that = this;

        function getRowTemp() {
            return '<div class="customRow"><div class="name">{{name}}</div></div>';
        }

        $(".datagrid-container").UX4Matchlist({
            name: "demo-datagrid",
            route: this.route,
            columns: this.datagridTemplate,
            data: SADefinitions[this.def],
            globalFilter:true,
            rowTemplate: getRowTemp(),
            rowMode: UX4MATCHLIST_ROWMODE.TEMPLATE,
            showHeader:false
        });

        $(".datagrid-container").on("rowselected", function (event,opts) {
            App.openRoute("report", "report", {"def":that.def, "link": opts.row.link});
        });

    }

});

App.views.ReportView = UX4.Marionette.ItemView.extend({

    init: function () {

        if (!this.params || !this.params.link) {
            if ($("template-blank").length === 0) {
                $("body").append("<div id='template-blank'></div>'");
                this.template = "#template-blank";
                this.viewOptions.deferDisplay = true;
                this.destroy();
				App.stopPacifier();
                return;
            }
        }

        this.template = "#template-" + this.params.link;
       
        this.pageInfo = lookupReportInDefinitions(this.params.link);
    },


    onDisplay: function () {

        this.updateTitle({ title: this.pageInfo.name ,"icon": "fa fa-file"});

        addToBreadCrumb(this.route.url, this.pageInfo.name);
        drawBreadcrumb(this.$el);
        setupBreadcrumbEvents(this.route.url,this.pageInfo.name,this.$el);

        //svg:
        displayDefaultDiagram();
		
		// charts:
		ChartsInitialized = false;

        sortables_init();
    },

    onDestroy: function () {
     //   UX4ActionHub.off(UX4Application.UX4_APP_AFTER_OPEN_ROUTE, this.onAfterEvent);
    }
});

App.views.defaultpage = UX4.Marionette.ItemView.extend({

    template: "#template-defaultpage",



    init: function () {
    },


    onDisplay: function () {

        this.updateTitle({ title: "Home",icon:"fa-home" });

        addToBreadCrumb(this.route.url, "Home");
        drawBreadcrumb();
        setupBreadcrumbEvents(this.route.url, "Home", this.$el);

        //svg:
        displayDefaultDiagram();

        // charts:
        ChartsInitialized = false;

        sortables_init();


    }
});

App.configureRoutes = function () {
App.loadRouteMap({
	"views": {
		"header": {
			"className": "HeaderView",
			"region": "header",
			"mobile": false
		},
		"sidebar": {
			"className": "SidebarTreeView",
			"region": "sidebar",
			"viewOptions": {
				"icon": "fa fa-star",
				"defaultMobilePage": "demotree",
				"deferDisplay": true,
				"mobileActions": {
					"*": {
						"menu": "ux4-mobile-options",
						"headerGroup": "headerGroup"
					}
				}
			}
		},
		"defaultpage": {
			"className": "defaultpage",
			"region": "main",
			"viewOptions": {
				"icon": "fa fa-pencil-edit-o",
				"defaultMobilePage": "demo-datagrid"
			}
		},
		"report": {
			"className": "ReportView",
			"region": "details",
			"viewOptions": {
				"icon": "fa fa-file"
			},
			"params": [
				"link"
			]
		},
		"threeupmain": {
			"className": "ThreeUpMainView",
			"region": "main",
			"viewOptions": {
				"icon": "fa fa-file"
			},
			"params": [
				"def",
				"link"
			]
		}
	},
	"routes": {
		"default": {
			"url": "",
			"views": [
				"sidebar",
				"header",
				"defaultpage"
			],
			"params": [
				"path"
			],
			"mobileTarget": "sidebar",
			"layout": "2up"
		},
		"settings": {
			"url": "settings",
			"views": [
				"settings"
			]
		},
		"report": {
			"url": "report(/def/:def)(/link/:link)",
			"views": [
				"header",
				"sidebar",
				"threeupmain",
				"report"
			],
			"mobileTarget": "threeupmain",
			"params": [
				"def",
				"link"
			],
			"layout": "3up",
			"resizableRegions": false,
			"regionOrientation": "horizontal",
			"mainRegionWidth": 300
		}
	},
	"defaultRoute": {
		"desktop": "default",
		"phone": "default",
		"tablet": "default"
	}
});
};