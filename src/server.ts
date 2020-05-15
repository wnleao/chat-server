import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import { Message } from './common/message';
import { User } from './common/user';

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

  private emitUserCount() {
    // updates all connected clients - https://socket.io/docs/emit-cheatsheet/
    this.io.emit('user_count', this.numberOfSockets());
  }

  private numberOfSockets(nsp = '/'): number {
    return Object.keys(this.io.of(nsp).sockets).length;
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    this.io.on('connect', (socket: any) => {
      console.log('connected client %s on port %s.', socket.id, this.port);

      socket.on('user_joined', (user: User) => {
        console.log("joined " + user.name + " - " + this.numberOfSockets());
        socket.user = user;
        socket.broadcast.emit('user_joined', user);
        this.emitUserCount();
      });

      socket.on('change_username', (username: string) => {
        console.log(`change user name old = ${socket.user.name}, new = ${username}`);
        socket.user.name = username;
      });

      socket.on('message', (m: Message) => {
        console.log('[server](message): %s', JSON.stringify(m));
        socket.broadcast.emit('message', m);
        socket.broadcast.emit('reset_typing');
      });

      socket.on('disconnect', () => {
        // TODO: loop over connected users print here

        console.log( 'client disconnected ' + socket.id + ' ' + socket.user.name + ' - ' + this.numberOfSockets());
        socket.broadcast.emit('user_left', socket.user);
        this.emitUserCount();
      });

      socket.on('typing', () => {
        console.log('User is typing');
        socket.broadcast.emit('typing');
      });

      socket.on('reset_typing', () => {
        console.log('User is not typing anymore');
        socket.broadcast.emit('reset_typing');
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}