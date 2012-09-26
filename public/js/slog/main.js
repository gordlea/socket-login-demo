define([
    "dojo/_base/declare",
    "dijit/registry",
    "eventemitter",
    "applyr",
    "slog/view/login",
    "slog/view/createuser",
    "slog/view/mainmenu"
], function(declare,
            registry,
            EventEmitter,
            Applyr,
            LoginView,
            CreateUserView,
            MainMenuView){



    return  declare([EventEmitter, Applyr], {
        constructor: function(config) {
            console.log(window.location.host)
            this.applyConfig(this, config, {
                baseSocketAddress: 'http://' + window.location.host + '/',
                uiSocketAddress: "ui",
                secureSocketAddress: "secure"
            });
            console.log("SockClient");
            this._setupSockets();
            this.views = {};
            this.views["login"] = new LoginView({
                uiSocket: this.uiSocket
            });
            this.views["mainmenu"] = new MainMenuView({
                uiSocket: this.uiSocket,
                secureSocket: this.secureSocket
            });
            this.views["createuser"] = new CreateUserView({
                uiSocket: this.uiSocket
            });
            this.views["mainmenu"].addListener('loggedOut', function() {
                this.views["mainmenu"].destroy();
                location.reload();
            }.bind(this));
            this.views["login"].addListener('clickedCreateuser', function() {
                this.views["login"].destroy();
                this.views["createuser"].show();
            }.bind(this));

            this.addListener("userAuthorized", function(player) {
                this.views["mainmenu"].secureSocket = this.secureSocket;
                this.showView("mainmenu");
            }.bind(this));
            this.addListener('loginFailure', function() {
                console.log("login failure");
                this.views["login"].handleFailedLogin();
            }.bind(this));

        },

        showView: function(viewname) {
            for (view in this.views) {
                if (view !== viewname) {
                    this.views[view].destroy();
                }
            }
            this.views[viewname].show();
        },

        _setupSockets: function() {
            this.uiSocket = io.connect(this.baseSocketAddress + this.uiSocketAddress);
            this.uiSocket.on("connect", function(socket) {
                console.info("UI Socket connected");
            });

            this.uiSocket.on("authentication:success", function(data) {
                console.info("User authentication successfull.");
                this._connectGlobalSocket();
            }.bind(this));
            this.uiSocket.on("authentication:failure", function() {
                console.warn("User authentication failed.");
                this.emitEvent("loginFailure");
            }.bind(this));

            this.secureSocket = null;
        },

        _connectGlobalSocket: function() {
            if (this.secureSocket !== null && this.secureSocket !== undefined) {
                this.secureSocket.socket.reconnect();
            } else {
                this.secureSocket = io.connect(this.baseSocketAddress + this.secureSocketAddress);
                this.secureSocket.on('error', function (reason) {
                    console.log('Global socket could not connect, user must be authorized: %s', reason);
                    this.showView("login");

                }.bind(this)).on('connect', function () {
                    console.info('Global socket connected, user is authorized');

                }.bind(this)).on("authorizedUserConnected", function(playerData) {
                    var player = playerData.player;
                    this.emitEvent("userAuthorized", [player]);
                }.bind(this));
            }

        },



        start: function() {
            this._connectGlobalSocket();
        }
    });

});