import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import { v1 as uuidv1 } from 'uuid';
import { Message } from './common/message';
import { User } from './common/user';
import { MessageState } from './common/message_state';

export class ChatServer {
  public static readonly PORT: number = 5000;
  private app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;

  constructor() {
    this.createApp();
    this.config();
    this.createServer();
    this.sockets();
    this.listen();
  }

  private createApp(): void {
    this.app = express();
  }

  private createServer(): void {
    this.server = createServer(this.app);
  }

  private config(): void {
    this.port = process.env.PORT || ChatServer.PORT;
  }

  private sockets(): void {
    this.io = socketIo(this.server, {
      handlePreflightRequest: (req, res) => {
          const headers = {
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
              "Access-Control-Allow-Origin": "https://chat-client-4c8a1.web.app",
              "Access-Control-Allow-Credentials": true
          };
          res.writeHead(200, headers);
          res.end();
      }
    });
  }

  private emitUsersOnline(nsp = '/') {
    // updates all connected clients - https://socket.io/docs/emit-cheatsheet/
    let nspSockets = Object.values(this.io.of(nsp).sockets);
    console.log('users online ... ' + nspSockets.length);
    let users = { };
    for(let socket of nspSockets) {
      users[socket.id] = socket['user']
    }
    console.log(users);
    this.io.emit('users_online', users);
  }

  private notifyMessageState(message: Message, state: MessageState) {
    message.state = MessageState.CLIENT_READ;
    message.content = '';
    message.room = message.recipient;
    // We need to notify back the user who sent the message in the first place.
    // That's why we have to swap the recipient and sender.
    [message.recipient, message.sender] = [message.sender, message.recipient];
    console.log('%s: %s', state, JSON.stringify(message));
    this.io.to(message.recipient).emit(state, message);   

  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    this.io.on('connect', (socket: any) => {
      console.log('connected client %s on port %s.', socket.id, this.port);

      // All connected users will join and listen to messages sent to the main-room.
      socket.join('main-room');

      socket.on('user_joined', (user: User) => {
        console.log("joined " + user.name);
        socket.user = user;
        socket.broadcast.emit('user_joined', { socketId: socket.id, user: user });
        this.emitUsersOnline();
      });

      socket.on('change_username', (username: string) => {
        console.log(`change user name old = ${socket.user.name}, new = ${username}`);
        socket.user.name = username;
      });

      socket.on('message', (m: Message) => {
        console.log('[server](message): %s', JSON.stringify(m));

        // message state 3 - server_received
        let old_id = m.uuid;
        m.uuid = uuidv1();

        let room = m.room;
        if (room != 'main-room') {
          room = m.recipient;
        }

        socket.emit('message_registered', {room: room, old_id: old_id, uuid: m.uuid});

        // message state 4 - server_sent
        socket.broadcast.to(m.recipient).emit('message', m);        
      });

      socket.on('client_received', (m: Message) => {
        this.notifyMessageState(m, MessageState.CLIENT_RECEIVED);
      });

      socket.on('client_read', (m: Message) => {
        this.notifyMessageState(m, MessageState.CLIENT_READ);
      });

      socket.on('disconnect', () => {
        console.log(`client disconnected ${socket.id} ${socket.user.name}`);
        socket.broadcast.emit('user_left', { socketId: socket.id, user: socket.user });
        this.emitUsersOnline();
      });

      socket.on('typing', (data) => {
        console.log(`User ${data.sender} is typing in room ${data.room}`);
        socket.broadcast.to(data.room).emit('typing', data);
      });

      socket.on('reset_typing', (data) => {
        console.log(`User ${data.sender} is not typing in room ${data.room}`);
        socket.broadcast.to(data.room).emit('reset_typing', data);
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}