import { createServer, Server as HTTPServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import Logger from '../../utils/Logger';

export class SocketServer {
  private httpServer: HTTPServer;
  private io: SocketIOServer;
  private readonly port: number;
  private logger: Logger;

  constructor(port: number = 3000) {
    this.logger = new Logger();
    this.port = port;
    this.httpServer = createServer();
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*', // Allow all origins (adjust for production)
        methods: ['GET', 'POST'],
      },
    });

    this.initializeSocketEvents();
  }

  private initializeSocketEvents(): void {
    this.io.on('connection', (socket: Socket) => {
      this.logger.info(`A user connected with ID: ${socket.id}`);

      // Listen for a general "message" event
      socket.on('message', (msg: string) => {
        this.logger.info(`Received message from ${socket.id}: ${msg}`);
        // Echo back to the client
        socket.emit('response', `Received: ${msg}`);
      });

      // Example of broadcasting a message to all connected clients except the sender
      socket.on('broadcast', (msg: string) => {
        this.logger.info(`Broadcasting message: ${msg}`);
        socket.broadcast.emit('broadcast', `Broadcast: ${msg}`);
      });

      // Example of emitting a message to all connected clients (including the sender)
      socket.on('broadcast_all', (msg: string) => {
        this.logger.info(`Sending message to all clients: ${msg}`);
        this.io.emit('broadcast_all', `Broadcast to all: ${msg}`);
      });

      // Handle custom event
      socket.on('custom_event', (data: any) => {
        this.logger.debug(`Custom event received: `, data);
        socket.emit('custom_event_response', `Acknowledged data: ${JSON.stringify(data)}`);
      });

      // Handle client disconnection
      socket.on('disconnect', (reason: string) => {
        this.logger.info(`User disconnected with ID: ${socket.id}, Reason: ${reason}`);
      });
    });
  }

  public sendToClient(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  public start(): void {
    this.httpServer.listen(this.port, () => {
      this.logger.info(`Socket.IO server is running on http://localhost:${this.port}`);
    });
  }
}
