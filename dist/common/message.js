"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Message = /** @class */ (function () {
    function Message(user, sender, recipient, content) {
        this.user = user;
        this.sender = sender;
        this.recipient = recipient;
        this.content = content;
    }
    return Message;
}());
exports.Message = Message;
