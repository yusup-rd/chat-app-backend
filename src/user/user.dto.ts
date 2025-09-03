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

export class RegisterUserDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  usernameOrEmail: string;

  @IsNotEmpty()
  password: string;
}

export class CreateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateProfileDto extends CreateProfileDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
