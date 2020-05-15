"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var ChatServer = /** @class */ (function () {
    function ChatServer() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }
    ChatServer.prototype.createApp = function () {
        this.app = express();
    };
    ChatServer.prototype.createServer = function () {
        this.server = http_1.createServer(this.app);
    };
    ChatServer.prototype.config = function () {
        this.port = process.env.PORT || ChatServer.PORT;
    };
    ChatServer.prototype.sockets = function () {
        this.io = socketIo(this.server, {
            handlePreflightRequest: function (req, res) {
                var headers = {
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    "Access-Control-Allow-Origin": "https://chat-client-4c8a1.web.app",
                    "Access-Control-Allow-Credentials": true
                };
                res.writeHead(200, headers);
                res.end();
            }
        });
    };
    ChatServer.prototype.emitUserCount = function () {
        // updates all connected clients - https://socket.io/docs/emit-cheatsheet/
        this.io.emit('user_count', this.numberOfSockets());
    };
    ChatServer.prototype.numberOfSockets = function (nsp) {
        if (nsp === void 0) { nsp = '/'; }
        return Object.keys(this.io.of(nsp).sockets).length;
    };
    ChatServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        this.io.on('connect', function (socket) {
            console.log('connected client %s on port %s.', socket.id, _this.port);
            socket.on('user_joined', function (user) {
                console.log("joined " + user.name + " - " + _this.numberOfSockets());
                socket.user = user;
                socket.broadcast.emit('user_joined', user);
                _this.emitUserCount();
            });
            socket.on('change_username', function (username) {
                console.log("change user name old = " + socket.user.name + ", new = " + username);
                socket.user.name = username;
            });
            socket.on('message', function (m) {
                console.log('[server](message): %s', JSON.stringify(m));
                socket.broadcast.emit('message', m);
                socket.broadcast.emit('reset_typing');
            });
            socket.on('disconnect', function () {
                // TODO: loop over connected users print here
                console.log('client disconnected ' + socket.id + ' ' + socket.user.name + ' - ' + _this.numberOfSockets());
                socket.broadcast.emit('user_left', socket.user);
                _this.emitUserCount();
            });
            socket.on('typing', function () {
                console.log('User is typing');
                socket.broadcast.emit('typing');
            });
            socket.on('reset_typing', function () {
                console.log('User is not typing anymore');
                socket.broadcast.emit('reset_typing');
            });
        });
    };
    ChatServer.prototype.getApp = function () {
        return this.app;
    };
    ChatServer.PORT = 5000;
    return ChatServer;
}());
exports.ChatServer = ChatServer;
