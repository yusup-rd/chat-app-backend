import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, MessageResponseDto } from './chat.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sendMessage')
  @ApiOperation({
    summary: 'Send a message',
    description:
      'Send a message to another user. The message will be stored and can trigger real-time notifications.',
  })
  @ApiBody({
    type: SendMessageDto,
    description: 'Message data to send',
    examples: {
      example1: {
        summary: 'Send a text message',
        value: {
          receiverId: '60d5ecb74b24a6001f5e4e7b',
          content: 'Hello! How are you doing?',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      example: {
        message: 'Message sent successfully',
        data: {
          id: '60d5ecb74b24a6001f5e4e7c',
          senderId: '60d5ecb74b24a6001f5e4e7a',
          receiverId: '60d5ecb74b24a6001f5e4e7b',
          content: 'Hello! How are you doing?',
          isRead: false,
          createdAt: '2023-09-04T10:30:00Z',
          senderName: 'John Doe',
          receiverName: 'Jane Doe',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid message data',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'receiverId must be a mongodb id',
          'content should not be empty',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Receiver user not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Receiver not found',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async sendMessage(
    @Request() req: any,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<{ message: string; data: MessageResponseDto }> {
    const message = await this.chatService.sendMessage(
      req.user.userId,
      sendMessageDto,
    );
    return {
      message: 'Message sent successfully',
      data: message,
    };
  }

  @Get('viewMessages/:userId')
  @ApiOperation({
    summary: 'Get conversation messages',
    description:
      'Retrieve all messages between the authenticated user and another specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'MongoDB ObjectId of the other user in the conversation',
    example: '60d5ecb74b24a6001f5e4e7b',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    schema: {
      example: [
        {
          id: '60d5ecb74b24a6001f5e4e7c',
          senderId: '60d5ecb74b24a6001f5e4e7a',
          receiverId: '60d5ecb74b24a6001f5e4e7b',
          content: 'Hello! How are you doing?',
          isRead: true,
          createdAt: '2023-09-04T10:30:00Z',
          senderName: 'John Doe',
          receiverName: 'Jane Doe',
        },
        {
          id: '60d5ecb74b24a6001f5e4e7d',
          senderId: '60d5ecb74b24a6001f5e4e7b',
          receiverId: '60d5ecb74b24a6001f5e4e7a',
          content: 'Hi John! I am doing great, thanks for asking!',
          isRead: false,
          createdAt: '2023-09-04T10:32:00Z',
          senderName: 'Jane Doe',
          receiverName: 'John Doe',
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async viewMessages(
    @Request() req: any,
    @Param('userId') otherUserId: string,
  ): Promise<MessageResponseDto[]> {
    return this.chatService.getMessages(req.user.userId, otherUserId);
  }

  @Get('conversations')
  @ApiOperation({
    summary: 'Get user conversations',
    description:
      'Retrieve a list of all conversations for the authenticated user, including the last message and unread count',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
    schema: {
      example: [
        {
          userId: '60d5ecb74b24a6001f5e4e7b',
          username: 'janedoe',
          name: 'Jane Doe',
          avatar: 'https://example.com/jane-avatar.jpg',
          lastMessage: {
            content: 'Hi John! I am doing great, thanks for asking!',
            createdAt: '2023-09-04T10:32:00Z',
            senderId: '60d5ecb74b24a6001f5e4e7b',
          },
          unreadCount: 3,
        },
        {
          userId: '60d5ecb74b24a6001f5e4e7c',
          username: 'bobsmith',
          name: 'Bob Smith',
          avatar: 'https://example.com/bob-avatar.jpg',
          lastMessage: {
            content: 'See you tomorrow!',
            createdAt: '2023-09-04T09:15:00Z',
            senderId: '60d5ecb74b24a6001f5e4e7a',
          },
          unreadCount: 0,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getChatList(@Request() req: any): Promise<any[]> {
    return this.chatService.getChatList(req.user.userId);
  }
}
