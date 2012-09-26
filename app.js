var path = require('path');
var express = require('express');
var app = express();
var cookie = require('cookie');
var connect_utils = require('./node_modules/connect/lib/utils');
var fs = require('fs');
var RedisStore = require('connect-redis')(express);
var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

var session_store = new RedisStore({
    client: redis,
//    pass: "somepass",
    prefix: "s:"
});

var users = {
    "jimmy": {
        "name": "jimmy",
        "password": "letmein"
    }
};

var sessions = {};

var SESSION_KEY = "somethingSecret";

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(SESSION_KEY));
    app.use(express.session({
        secret: SESSION_KEY,
        store: session_store
    }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/js/vendor/applyr/applyr.js', function(req, res) {
//        res.set('Content-Type', 'text/javascript');

//        var jsdata = fs.readFileSync(__dirname + '/../node_modules/applyr/applyr.js', 'ascii');
        res.sendfile(path.join(__dirname, 'node_modules/applyr/applyr.js'));
    });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


var server = require('http').createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});


var io = require('socket.io').listen(server);
io.configure(function(){
//    io.set('transports', ['websocket']);
    io.set('browser client minification', true);
    io.set('browser client etag', true);
    io.set('browser client gzip', true);
//    io.set('authorization', function (handshakeData, callback) {
//        console.log("authorization");
//        callback(null, false); // error first callback style
//    });
});

//authenticated people only
var secureSocket = io.of("/secure").authorization( function(handshakeData, callback) {
    if (handshakeData.headers.cookie) {
        console.log("found cookie");
//        var cookier = cookie.parse(handshakeData.headers.cookie);
        var signedCookies = connect_utils.parseJSONCookies(connect_utils.parseSignedCookies(cookie.parse(handshakeData.headers.cookie), SESSION_KEY));
        var sid = signedCookies['connect.sid'];
        session_store.get(sid, function(err, session) {
            if (err || !session) {
                callback('Error during auth: ' + err, false);
            } else {
                handshakeData.session = session;
                console.dir(users);
                console.dir(sessions);
                //is any player authenticated with that session?
                var authUser = sessions[sid];
                if (authUser === undefined) {
                    callback("no user authorized for session", false);
                } else {
                    handshakeData.authorizedUser = authUser;
                    console.log("user %s authenticated for session", authUser.name);
                    callback(null, true);
                }
            }
        });
    } else {
        callback('No cookie', false);
    }
}.bind(this)).on('connection', function(socket) {
        console.log("connected to globalSocket".red);
        console.dir(socket.handshake.authorizedUser);
        socket.emit("authorizedUserConnected", {player: socket.handshake.authorizedUser});

        socket.on('logoutUser', function() {
            var sid = socket.handshake.sid;
            delete sessions[sid];
            socket.emit("authentication:loggedOut");
        })

    });

var uiSocket = io.of("/ui").authorization( function(handshakeData, callback) {
    if (handshakeData.headers.cookie) {
        var signedCookies = connect_utils.parseJSONCookies(connect_utils.parseSignedCookies(cookie.parse(handshakeData.headers.cookie), SESSION_KEY));
        var sid = signedCookies['connect.sid'];//.split(':')[1];
        session_store.get(sid, function(err, session) {

            if (err || !session) {
                callback('Error', false);
            } else {
                handshakeData.session = session;
                handshakeData.sid = sid;
                callback(null, true);
            }
        }.bind(this));
    } else {
        callback('No cookie', false);
    }
}).on('connection', function(socket) {

    socket.on('createUser', function (data) {
        console.log("got call to createUser");
        console.dir(data);
        users[data.name] = data;
        var sid = socket.handshake.sid;
        sessions[sid] = data.name;
        socket.emit("create:success");
        socket.emit("authentication:success", { player: data});
    });

    socket.on('authenticateUser', function (data) {
        console.log("got call to authenticateUser");
        var sid = socket.handshake.sid;
        var u = users[data.name];
        if (u === undefined || u.password !== data.password) {
            socket.emit("authentication:failure");
        } else {
            sessions[sid] = data.name;
            socket.emit("authentication:success", { player: u});
        }
    });

    socket.on('getContent', function (data) {
        console.log("got call to getWidget: %s", data.name);
        try {
            var widgetData = fs.readFileSync(__dirname + '/ui/' + data.name + ".html", 'ascii');
            socket.emit("content:" + data.name, {html: widgetData});
        }
        catch (err) {
            console.error("There was an error opening the file: %s", err);
        }
    }.bind(this));
}.bind(this));