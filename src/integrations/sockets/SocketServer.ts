// SocketServer.ts
import { createServer, Server as HTTPServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import Logger from '../../utils/Logger';

export class SocketServer {
  protected httpServer: HTTPServer;
  protected io: SocketIOServer;
  protected readonly port: number;
  protected logger: Logger;
  protected userSockets: Map<number, string>; // Maps user ID to socket ID

  constructor(port: number = 3000) {
    this.logger = new Logger();
    this.port = port;
    this.httpServer = createServer();
    this.userSockets = new Map();
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*', // Allow all origins (adjust for production)
        methods: ['GET', 'POST'],
      },
    });

    this.initializeSocketEvents();
  }

  protected initializeSocketEvents(): void {
    this.io.on('connection', (socket: Socket) => {
      this.logger.info(`A user connected with ID: ${socket.id}`);

      // Handle register event to map user ID to socket ID
      socket.on('register', (userId: number) => {
        this.logger.info(`User registered with ID: ${userId} and socket ID: ${socket.id}`);
        this.userSockets.set(userId, socket.id);
      });

      // Handle client disconnection
      socket.on('disconnect', (reason: string) => {
        this.logger.info(`User disconnected with ID: ${socket.id}, Reason: ${reason}`);
        // Remove user from userSockets map when disconnected
        this.userSockets.forEach((value, key) => {
          if (value === socket.id) {
            this.userSockets.delete(key);
            this.logger.info(`Removed user with ID: ${key} from active connections`);
          }
        });
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
      this.logger.info(`Socket.IO server is running`);
    });
  }
}
