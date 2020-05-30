"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var uuid_1 = require("uuid");
var message_state_1 = require("./common/message_state");
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
    ChatServer.prototype.emitUsersOnline = function (nsp) {
        if (nsp === void 0) { nsp = '/'; }
        // updates all connected clients - https://socket.io/docs/emit-cheatsheet/
        var nspSockets = Object.values(this.io.of(nsp).sockets);
        console.log('users online ... ' + nspSockets.length);
        var users = {};
        for (var _i = 0, nspSockets_1 = nspSockets; _i < nspSockets_1.length; _i++) {
            var socket = nspSockets_1[_i];
            users[socket.id] = socket['user'];
        }
        console.log(users);
        this.io.emit('users_online', users);
    };
    ChatServer.prototype.notifyMessageState = function (message, state) {
        var _a;
        message.state = message_state_1.MessageState.CLIENT_READ;
        message.content = '';
        message.room = message.recipient;
        // We need to notify back the user who sent the message in the first place.
        // That's why we have to swap the recipient and sender.
        _a = [message.sender, message.recipient], message.recipient = _a[0], message.sender = _a[1];
        console.log('%s: %s', state, JSON.stringify(message));
        this.io.to(message.recipient).emit(state, message);
    };
    ChatServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        this.io.on('connect', function (socket) {
            console.log('connected client %s on port %s.', socket.id, _this.port);
            // All connected users will join and listen to messages sent to the main-room.
            socket.join('main-room');
            socket.on('user_joined', function (user) {
                console.log("joined " + user.name);
                socket.user = user;
                socket.broadcast.emit('user_joined', { socketId: socket.id, user: user });
                _this.emitUsersOnline();
            });
            socket.on('change_username', function (username) {
                console.log("change user name old = " + socket.user.name + ", new = " + username);
                socket.user.name = username;
            });
            socket.on('message', function (m) {
                console.log('[server](message): %s', JSON.stringify(m));
                // message state 3 - server_received
                var old_id = m.uuid;
                m.uuid = uuid_1.v1();
                var room = m.room;
                if (room != 'main-room') {
                    room = m.recipient;
                }
                socket.emit('message_registered', { room: room, old_id: old_id, uuid: m.uuid });
                // message state 4 - server_sent
                socket.broadcast.to(m.recipient).emit('message', m);
            });
            socket.on('client_received', function (m) {
                _this.notifyMessageState(m, message_state_1.MessageState.CLIENT_RECEIVED);
            });
            socket.on('client_read', function (m) {
                _this.notifyMessageState(m, message_state_1.MessageState.CLIENT_READ);
            });
            socket.on('disconnect', function () {
                console.log("client disconnected " + socket.id + " " + socket.user.name);
                socket.broadcast.emit('user_left', { socketId: socket.id, user: socket.user });
                _this.emitUsersOnline();
            });
            socket.on('typing', function (data) {
                console.log("User " + data.sender + " is typing in room " + data.room);
                socket.broadcast.to(data.room).emit('typing', data);
            });
            socket.on('reset_typing', function (data) {
                console.log("User " + data.sender + " is not typing in room " + data.room);
                socket.broadcast.to(data.room).emit('reset_typing', data);
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
