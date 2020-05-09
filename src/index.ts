import { ChatServer } from './server';

// https://medium.com/containers-on-aws/building-a-socket-io-chat-app-and-deploying-it-using-aws-fargate-86fd7cbce13f

let app = new ChatServer().getApp();
export { app };