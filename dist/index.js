"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server");
// https://medium.com/containers-on-aws/building-a-socket-io-chat-app-and-deploying-it-using-aws-fargate-86fd7cbce13f
var app = new server_1.ChatServer().getApp();
exports.app = app;
