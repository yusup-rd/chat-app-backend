import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the message receiver',
    example: '60d5ecb74b24a6001f5e4e7b',
  })
  @IsMongoId()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({
    description: 'Message content to send',
    example: 'Hello! How are you doing?',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class GetMessagesDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the user to get messages with',
    example: '60d5ecb74b24a6001f5e4e7b',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Unique message identifier',
    example: '60d5ecb74b24a6001f5e4e7c',
  })
  id: string;

  @ApiProperty({
    description: 'MongoDB ObjectId of the message sender',
    example: '60d5ecb74b24a6001f5e4e7a',
  })
  senderId: string;

  @ApiProperty({
    description: 'MongoDB ObjectId of the message receiver',
    example: '60d5ecb74b24a6001f5e4e7b',
  })
  receiverId: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello! How are you doing?',
  })
  content: string;

  @ApiProperty({
    description: 'Whether the message has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2023-09-04T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Name of the message sender',
    example: 'John Doe',
    required: false,
  })
  senderName?: string;

  @ApiProperty({
    description: 'Name of the message receiver',
    example: 'Jane Doe',
    required: false,
  })
  receiverName?: string;
}
