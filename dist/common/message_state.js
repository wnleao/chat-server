"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageState;
(function (MessageState) {
    /** Message is ready waiting in the client to be sent. */
    MessageState["READY_TO_SEND"] = "ready_to_send";
    /** Message was sent to the server. We don't know whether message has arrived in the server. */
    MessageState["CLIENT_SENT"] = "client_sent";
    /** Message arrives in the server. Message is in the server but was not yet sent to final destination. */
    MessageState["SERVER_RECEIVED"] = "server_received";
    /**
     * Server sends the message. We don't know whether the recipient client has received it.
     * Currently, SERVER_SENT state is not being dealt with.
     */
    MessageState["SERVER_SENT"] = "server_sent";
    /**
     * The server is notified that the message has reached its final destination.
     * The message was delivered successfully.
     */
    MessageState["CLIENT_RECEIVED"] = "client_received";
    /** The message was read by the recipient client. */
    MessageState["CLIENT_READ"] = "client_read";
})(MessageState = exports.MessageState || (exports.MessageState = {}));
