import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe',
    minLength: 1,
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Valid email address',
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the account',
    example: 'password123',
    minLength: 6,
  })
  @MinLength(6)
  password: string;
}

export class LoginUserDto {
  @ApiProperty({
    description: 'Username or email address for login',
    example: 'johndoe',
  })
  @IsNotEmpty()
  usernameOrEmail: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'password123',
  })
  @IsNotEmpty()
  password: string;
}

export class CreateProfileDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Gender of the user',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Date of birth in ISO format',
    example: '1990-01-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 180,
    minimum: 50,
    maximum: 300,
  })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 75,
    minimum: 20,
    maximum: 500,
  })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateProfileDto extends CreateProfileDto {
  @ApiPropertyOptional({
    description: 'Array of user interests',
    example: ['music', 'movies', 'travel', 'photography'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
