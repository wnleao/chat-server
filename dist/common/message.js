"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Message = /** @class */ (function () {
    function Message(uuid, user, sender, recipient, room, content) {
        this.uuid = uuid;
        this.user = user;
        this.sender = sender;
        this.recipient = recipient;
        this.room = room;
        this.content = content;
    }
    return Message;
}());
exports.Message = Message;
