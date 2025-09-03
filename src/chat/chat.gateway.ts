import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './chat.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Client connected without token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub || payload.userId;

      if (!client.userId) {
        this.logger.warn('No user ID found in JWT payload');
        client.disconnect();
        return;
      }
      this.connectedUsers.set(client.userId, client.id);

      this.logger.log(
        `User ${client.userId} connected with socket ${client.id}`,
      );

      // Join user to their personal room
      client.join(`user_${client.userId}`);

      // Send list of currently online users to the newly connected client
      const onlineUserIds = Array.from(this.connectedUsers.keys()).filter(
        (id) => id !== client.userId,
      );
      onlineUserIds.forEach((userId) => {
        client.emit('userOnline', userId);
      });

      // Broadcast that user came online to all other clients
      this.server.emit('userOnline', client.userId);
    } catch (error) {
      this.logger.error('Authentication failed', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected`);

      // Broadcast that user went offline
      this.server.emit('userOffline', client.userId);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const message = await this.chatService.sendMessage(client.userId, data);

      // Emit to sender
      client.emit('messageReceived', message);

      // Emit to receiver if they're online
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', message);
      }
    } catch (error) {
      this.logger.error('Error sending message', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { otherUserId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const messages = await this.chatService.getMessages(
        client.userId,
        data.otherUserId,
      );
      client.emit('chatHistory', messages);
    } catch (error) {
      this.logger.error('Error joining chat', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { otherUserId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }
      const senderSocketId = this.connectedUsers.get(data.otherUserId);
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('messagesRead', {
          readBy: client.userId,
        });
      }
    } catch (error) {
      this.logger.error('Error marking messages as read', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; isTyping: boolean },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Send typing indicator to the receiver
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('userTyping', {
          userId: client.userId,
          isTyping: data.isTyping,
        });
      }
    } catch (error) {
      this.logger.error('Error handling typing indicator', error);
    }
  }
}
