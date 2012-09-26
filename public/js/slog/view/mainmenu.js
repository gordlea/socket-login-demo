define([
    "dojo/_base/declare",
    "dijit/registry",
    "eventemitter",
    "applyr",
    "dojo/dom",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/TextBox",
    "dijit/form/Button"
], function(declare,
            registry,
            EventEmitter,
            Applyr,
            dom,
            BorderContainer,
            ContentPane,
            TextBox,
            Button) {
    return  declare([EventEmitter, Applyr], {
        constructor: function(config) {
            this.applyConfig(this, config, {
                showing: false,
                id: "mainmenu"
            });
//            console.dir(this);
            console.log("view/mainmenu");

        },
        show: function() {
            if (this.showing) {
                return;
            }
            this.showing = true;
            var lc = new BorderContainer({
                id: 'mainmenuLayoutContainer',
                style: "height: 100%; width: 100%;",
                design: "headline"
            });



            var cpTop = new ContentPane({
                region: 'top',
                content: "<h1>NAVCOM: Main Menu</h1>"
            });
            lc.addChild(cpTop);
            var cpMain = new ContentPane({
                id: "mainmenuMainPane",
                region: 'center',
                content: "<h3>Choose an option:</h3><div id=\"logoutButtonWrapper\"></div>"
            });
            lc.addChild(cpMain);

            document.body.appendChild(lc.domNode);
            lc.startup();



            var logoutButton = new Button({
                tabIndex: 1,
                class: 'logoutButton',
                id: 'logoutButton',
                label: 'Log Out',
                onClick: function(event) {

                    this.secureSocket.on('authentication:loggedOut', function() {
                        this.emitEvent('loggedOut');
                    }.bind(this));
                    this.secureSocket.emit('logoutUser');


                }.bind(this)
            });
            logoutButton.placeAt("logoutButtonWrapper");
        },

        destroy: function() {
            var lc = registry.byId('mainmenuLayoutContainer');
            if (lc !== undefined && lc !== null) {
                lc.destroyRecursive(false);
            }

            this.showing = false;
        }
    });
});