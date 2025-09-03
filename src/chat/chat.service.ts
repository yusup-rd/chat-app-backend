import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './message.schema';
import { User } from '../user/user.schema';
import { SendMessageDto, MessageResponseDto } from './chat.dto';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class ChatService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    try {
      await this.rabbitMQService.connect();
      await this.rabbitMQService.consumeMessages((messageData) => {
        console.log('Processing message from queue:', messageData);
      });
    } catch (error) {
      console.error('Failed to initialize RabbitMQ:', error);
    }
  }

  async onModuleDestroy() {
    await this.rabbitMQService.closeConnection();
  }

  async sendMessage(
    senderId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const { receiverId, content } = sendMessageDto;

    // Validate that both users exist
    const [sender, receiver] = await Promise.all([
      this.userModel.findById(senderId).select('username name'),
      this.userModel.findById(receiverId).select('username name'),
    ]);

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    // Create new message
    const message = new this.messageModel({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      content: content.trim(),
    });

    const savedMessage = await message.save();

    const messageResponse = {
      id: savedMessage._id.toString(),
      senderId: savedMessage.senderId.toString(),
      receiverId: savedMessage.receiverId.toString(),
      content: savedMessage.content,
      isRead: savedMessage.isRead,
      createdAt: savedMessage.createdAt,
      senderName: sender.name || sender.username,
      receiverName: receiver.name || receiver.username,
    };

    // Publish message to RabbitMQ for additional processing
    try {
      await this.rabbitMQService.publishMessage({
        ...messageResponse,
        type: 'NEW_MESSAGE',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to publish message to RabbitMQ:', error);
    }

    return messageResponse;
  }

  async getMessages(
    currentUserId: string,
    otherUserId: string,
  ): Promise<MessageResponseDto[]> {
    // Validate that both users exist
    const [currentUser, otherUser] = await Promise.all([
      this.userModel.findById(currentUserId).select('username name'),
      this.userModel.findById(otherUserId).select('username name'),
    ]);

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }
    if (!otherUser) {
      throw new NotFoundException('Other user not found');
    }

    // Get all messages between the two users
    const messages = await this.messageModel
      .find({
        $or: [
          {
            senderId: new Types.ObjectId(currentUserId),
            receiverId: new Types.ObjectId(otherUserId),
          },
          {
            senderId: new Types.ObjectId(otherUserId),
            receiverId: new Types.ObjectId(currentUserId),
          },
        ],
      })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read if current user is the receiver
    await this.messageModel.updateMany(
      {
        senderId: new Types.ObjectId(otherUserId),
        receiverId: new Types.ObjectId(currentUserId),
        isRead: false,
      },
      { isRead: true },
    );

    return messages.map((message) => ({
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      senderName:
        message.senderId.toString() === currentUserId
          ? currentUser.name || currentUser.username
          : otherUser.name || otherUser.username,
      receiverName:
        message.receiverId.toString() === currentUserId
          ? currentUser.name || currentUser.username
          : otherUser.name || otherUser.username,
    }));
  }

  async getChatList(currentUserId: string): Promise<any[]> {
    // Get all conversations for the current user
    const conversations = await this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: new Types.ObjectId(currentUserId) },
            { receiverId: new Types.ObjectId(currentUserId) },
          ],
        },
      },
      {
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$senderId', new Types.ObjectId(currentUserId)] },
              then: '$receiverId',
              else: '$senderId',
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiverId', new Types.ObjectId(currentUserId)] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          name: '$user.name',
          avatar: '$user.avatar',
          lastMessage: '$lastMessage.content',
          lastMessageTime: '$lastMessage.createdAt',
          unreadCount: 1,
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return conversations;
  }
}
