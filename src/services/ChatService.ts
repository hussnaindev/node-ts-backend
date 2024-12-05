import { Socket } from 'socket.io';
import { SocketServer } from '../integrations/sockets/SocketServer';

export class ChatService extends SocketServer {
    constructor(port: number = 3000) {
        super(port);
    }

    protected initializeSocketEvents(): void {
        super.initializeSocketEvents(); // Call base class event handling

        this.io.on('connection', (socket: Socket) => {
            // Handle "message" event for chat
            socket.on('message', (msg: { senderId: number, recipientId: number, message: string }) => {
                this.logger.info(`Received message from ${msg.senderId} to ${msg.recipientId}: ${msg.message}`);
                const recipientSocketId = this.userSockets.get(msg.recipientId);
                if (recipientSocketId) {
                    this.io.to(recipientSocketId).emit('message', {
                        senderId: msg.senderId,
                        recipientId: msg.recipientId,
                        message: "Hello Back",
                    });
                } else {
                    this.logger.warn(`Recipient ${msg.recipientId} is not currently online`);
                }
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
        });
    }
}
