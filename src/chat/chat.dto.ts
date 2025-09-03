import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class SendMessageDto {
  @IsMongoId()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class GetMessagesDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}

export class MessageResponseDto {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  senderName?: string;
  receiverName?: string;
}
