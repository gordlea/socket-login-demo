define([
    "dojo/_base/declare",
    "dijit/registry",
    "eventemitter",
    "applyr",
    "dojo/dom",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/TextBox",
    "dijit/form/Button",
    "dojo/on",
    "dijit/Tooltip"
], function(declare,
            registry,
            EventEmitter,
            Applyr,
            dom,
            BorderContainer,
            ContentPane,
            TextBox,
            Button,
            on,
            Tooltip) {

    return  declare([EventEmitter, Applyr], {
        constructor: function(config) {
            this.applyConfig(this, config, {
                showing: false,
                id: "login"
            });
            console.log("view/login");

        },
        show: function() {
            if (this.showing) {
                console.log("already showing");
                return;
            }
            console.log("showing");
            this.showing = true;
            var lc = new BorderContainer({
                id: 'loginLayoutContainer',
                style: "height: 100%; width: 100%;",
                design: "headline"
            });



            var cpTop = new ContentPane({
                region: 'top',
                content: "<h1>Welcome to Socket.io Login Demo Dealie</h1>"
            });
            lc.addChild(cpTop);
            var cpRight = new ContentPane({
                id: "loginFormPane",
                region: 'right',
                style: 'width: 20em;',
                content: '<fieldset id="loginFieldset"><legend>Login</legend>' +
                    '<div id="usernameWrapper"><label class="loginLabel" for="username">Username:</label></div>' +
                    '<div id="passwordWrapper"><label class="loginLabel" for="password">Password:</label></div>' +
                    '<div id="loginButtonWrapper"><a id="createuserLink" href="#">Create new User</a>&nbsp;or&nbsp;</div></fieldset>'
            });




            lc.addChild(cpRight);
            var cpMain = new ContentPane({
                id: "welcomePageMainPane",
                region: 'center'
//                        content: dom.byId('welcomePageMainText').innerHTML
            });
            lc.addChild(cpMain);

            document.body.appendChild(lc.domNode);
            lc.startup();


            var usernameTextbox = new TextBox({
                tabindex: 1,
                class: 'loginInput',
                id: "username",
                name: "username"
            });
            usernameTextbox.placeAt("usernameWrapper");
            var passwordTextbox = new TextBox({
                id: "password",
                name: "password",
                type: 'password',
                tabindex: 2,
                class: 'loginInput'
            });
            passwordTextbox.placeAt("passwordWrapper");

            var loginButton = new Button({
                tabIndex: 3,
                class: 'loginButton',
                id: 'loginButton',
                label: 'Login',
                onClick: function(event) {
                    var vals = {
                        name: registry.byId("username").get('value'),
                        password: registry.byId('password').get('value')
                    };


                    this.uiSocket.emit('authenticateUser', vals);
                }.bind(this)
            });
            loginButton.placeAt("loginButtonWrapper");

            on(dom.byId("createuserLink"), "click", function(event) {
                console.log("clicked create user");
                this.emitEvent("clickedCreateuser");
            }.bind(this));

            this.uiSocket.once("content:welcomeMainText", function(data) {
                var wpmp = registry.byId("welcomePageMainPane");
                wpmp.setContent(data.html);
            });
            this.uiSocket.emit("getContent", {name:"welcomeMainText"});

        },

        handleFailedLogin: function() {
            console.log("handling failed login");
            Tooltip.show("Incorrect username or password, please try again.", dom.byId("loginFieldset"));
        },

        destroy: function() {
            Tooltip.hide(dom.byId("loginFieldset"));
            var lc = registry.byId('loginLayoutContainer');
            if (lc !== undefined && lc !== null) {
                lc.destroyRecursive(false);
            }

            this.showing = false;
        }
    });
});