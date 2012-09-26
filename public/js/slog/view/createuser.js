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
    return  declare([Applyr], {
        constructor: function(config) {
            this.applyConfig(this, config, {
                showing: false,
                id: "createuser"

            });
            console.log("view/createuser");

        },
        show: function() {
            if (this.showing) {
                return;
            }
            this.showing = true;
            var lc = new BorderContainer({
                id: 'createuserContainer',
                style: "height: 100%; width: 100%;",
                design: "headline"
            });



            var cpTop = new ContentPane({
                region: 'top',
                content: "<h1>NAVCOM: Create a new User</h1>"
            });
            lc.addChild(cpTop);

            var cpMain = new ContentPane({
                id: "createuserMain",
                region: 'center',

                content:
                    '<fieldset>' +
                        '<legend>Create New User</legend>' +
                        '<div id="usernameWrapper">' +
                            '<label class="loginLabel" for="username">Username:</label>' +
                        '</div>' +
                        '<div id="emailWrapper">' +
                            '<label class="loginLabel" for="email">Email Address:</label>' +
                        '</div>' +
                        '<div id="passwordWrapper">' +
                            '<label class="loginLabel" for="password">Password:</label>' +
                        '</div>' +
                    '</fieldset>'
            });
            lc.addChild(cpMain);

            var cpBottom = new ContentPane({
                id: "createuserBottom",
                style: "height: 2em;",
                region: "bottom",
                content: "<div id=\"createuserButtonWrapper\"></div>"
            })
            lc.addChild(cpBottom);

            document.body.appendChild(lc.domNode);
            lc.startup();


            var usernameTextbox = new TextBox({
                tabindex: 1,
                class: 'loginInput',
                id: "username",
                name: "username"
            });
            usernameTextbox.placeAt("usernameWrapper");
            var emailTextbox = new TextBox({
                tabindex: 2,
                class: 'loginInput',
                id: "email",
                name: "email"
            });
            emailTextbox.placeAt("emailWrapper");
            var passwordTextbox = new TextBox({
                id: "password",
                name: "password",
                type: 'password',
                tabindex: 3,
                class: 'loginInput'
            });
            passwordTextbox.placeAt("passwordWrapper");

            var createuserButton = new Button({
                tabIndex: 4,
                class: 'createUser',
                id: 'createuserButton',
                label: 'Create New User',
                onClick: function(event) {
                    var vals = {
                        name: registry.byId("username").get('value'),
                        email: registry.byId("email").get('value'),
                        password: registry.byId('password').get('value')
                    };

//                    this.uiSocket.once("create:success", function() {
//                        this.emitEvent("createuser:success");
//                    });
                    this.uiSocket.emit('createUser', vals);
                }.bind(this)
            });
            createuserButton.placeAt("createuserButtonWrapper");
        },

        destroy: function() {
            var lc = registry.byId('createuserContainer');
            if (lc !== undefined && lc !== null) {
                lc.destroyRecursive(false);
            }
            this.showing = false;
        }
    });
});