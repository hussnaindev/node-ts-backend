import 'reflect-metadata'; // required for TypeScript decorators
import { app } from './app';
import { connectMongoDB } from './config/databases/mongodb';
import { SocketServer } from './integrations/sockets/SocketServer';

connectMongoDB();

const port = process.env.PORT;

app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
});

const socketServer = new SocketServer();
socketServer.start();
