import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto, MessageResponseDto } from './chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sendMessage')
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
  async viewMessages(
    @Request() req: any,
    @Param('userId') otherUserId: string,
  ): Promise<MessageResponseDto[]> {
    return this.chatService.getMessages(req.user.userId, otherUserId);
  }
}
