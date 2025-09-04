import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  UseGuards,
  Req,
  Param,
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
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  RegisterUserDto,
  LoginUserDto,
  CreateProfileDto,
  UpdateProfileDto,
} from './user.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User as UserDecorator } from '../auth/user.decorator';

@ApiTags('Authentication')
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with username, email, and password',
  })
  @ApiBody({
    type: RegisterUserDto,
    description: 'User registration data',
    examples: {
      example1: {
        summary: 'Valid registration',
        value: {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        id: '60d5ecb74b24a6001f5e4e7a',
        username: 'johndoe',
        email: 'john@example.com',
        createdAt: '2023-09-04T10:30:00Z',
        updatedAt: '2023-09-04T10:30:00Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiConflictResponse({
    description: 'User already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User with this email or username already exists',
        error: 'Conflict',
      },
    },
  })
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.userService.register(dto);
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticate user with username/email and password, returns JWT token',
  })
  @ApiBody({
    type: LoginUserDto,
    description: 'User login credentials',
    examples: {
      withEmail: {
        summary: 'Login with email',
        value: {
          usernameOrEmail: 'john@example.com',
          password: 'password123',
        },
      },
      withUsername: {
        summary: 'Login with username',
        value: {
          usernameOrEmail: 'johndoe',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '60d5ecb74b24a6001f5e4e7a',
          username: 'johndoe',
          email: 'john@example.com',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'usernameOrEmail should not be empty',
          'password should not be empty',
        ],
        error: 'Bad Request',
      },
    },
  })
  async login(@Body() dto: LoginUserDto) {
    const user = await this.userService.validateUser(dto);
    const token = this.authService.createToken(user);
    return {
      token,
      user: { id: user._id, username: user.username, email: user.email },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getProfile')
  @ApiTags('Profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile information of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: '60d5ecb74b24a6001f5e4e7a',
        username: 'johndoe',
        email: 'john@example.com',
        name: 'John Doe',
        gender: 'male',
        dob: '1990-01-15',
        height: 180,
        weight: 75,
        avatar: 'https://example.com/avatar.jpg',
        interests: ['music', 'movies', 'travel'],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async getProfile(@Req() req) {
    return this.userService.getProfile(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getAllProfiles')
  @ApiTags('Profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all user profiles',
    description:
      'Retrieve all user profiles excluding the current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'All user profiles retrieved successfully',
    schema: {
      example: [
        {
          id: '60d5ecb74b24a6001f5e4e7b',
          username: 'janedoe',
          name: 'Jane Doe',
          gender: 'female',
          dob: '1992-05-20',
          height: 165,
          weight: 60,
          avatar: 'https://example.com/jane-avatar.jpg',
          interests: ['photography', 'cooking'],
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getAllProfiles(@UserDecorator('userId') userId: string) {
    return this.userService.getAllProfiles(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getUserProfile/:userId')
  @ApiTags('Profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get specific user profile',
    description: 'Retrieve profile information for a specific user by their ID',
  })
  @ApiParam({
    name: 'userId',
    description: 'MongoDB ObjectId of the user',
    example: '60d5ecb74b24a6001f5e4e7a',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: '60d5ecb74b24a6001f5e4e7a',
        username: 'johndoe',
        name: 'John Doe',
        gender: 'male',
        dob: '1990-01-15',
        height: 180,
        weight: 75,
        avatar: 'https://example.com/avatar.jpg',
        interests: ['music', 'movies'],
      },
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
  async getUserProfile(@Param('userId') userId: string) {
    return this.userService.getUserProfile(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('createProfile')
  @ApiTags('Profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create user profile',
    description:
      'Create or update profile information for the authenticated user',
  })
  @ApiBody({
    type: CreateProfileDto,
    description: 'Profile creation data',
    examples: {
      example1: {
        summary: 'Complete profile',
        value: {
          name: 'John Doe',
          gender: 'male',
          dob: '1990-01-15',
          height: 180,
          weight: 75,
          avatar: 'https://example.com/avatar.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
    schema: {
      example: {
        id: '60d5ecb74b24a6001f5e4e7a',
        username: 'johndoe',
        email: 'john@example.com',
        name: 'John Doe',
        gender: 'male',
        dob: '1990-01-15',
        height: 180,
        weight: 75,
        avatar: 'https://example.com/avatar.jpg',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createProfile(
    @UserDecorator('userId') userId: string,
    @Body() dto: CreateProfileDto,
  ) {
    return this.userService.createProfile(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('updateProfile')
  @ApiTags('Profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Update profile information and interests for the authenticated user',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Profile update data',
    examples: {
      example1: {
        summary: 'Update with interests',
        value: {
          name: 'John Doe Updated',
          interests: ['music', 'movies', 'travel', 'photography'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        id: '60d5ecb74b24a6001f5e4e7a',
        username: 'johndoe',
        email: 'john@example.com',
        name: 'John Doe Updated',
        gender: 'male',
        dob: '1990-01-15',
        height: 180,
        weight: 75,
        avatar: 'https://example.com/avatar.jpg',
        interests: ['music', 'movies', 'travel', 'photography'],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateProfile(
    @UserDecorator('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }
}
