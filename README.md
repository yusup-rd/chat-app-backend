# Chat App Backend 🚀

A real-time chat application backend built with NestJS, Socket.IO, MongoDB, and RabbitMQ. Features include user authentication, real-time messaging, online status tracking, and comprehensive API documentation.

## 🔗 Repository Links

- **Backend**: https://github.com/yusup-rd/chat-app-backend
- **Frontend**: https://github.com/yusup-rd/chat-app-frontend

## ✨ Features

- 🔐 **User Authentication** - JWT-based registration and login
- 👤 **Profile Management** - Create and update user profiles with interests
- 💬 **Real-time Messaging** - Socket.IO powered instant messaging
- 🟢 **Online Status** - Live user presence indicators
- 📊 **Message History** - Persistent chat conversations
- 🔔 **Unread Messages** - Message notification system
- 📚 **API Documentation** - Interactive Swagger documentation
- 🐳 **Docker Support** - Complete containerized setup
- 🔍 **Database Admin** - Mongo Express web interface

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Message Queue**: RabbitMQ
- **Authentication**: JWT
- **Documentation**: Swagger
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the backend repository**

   ```bash
   git clone https://github.com/yusup-rd/chat-app-backend.git
   cd chat-app-backend
   ```

2. **Clone the frontend repository** (in a separate directory)

   ```bash
   git clone https://github.com/yusup-rd/chat-app-frontend.git
   cd chat-app-frontend
   npm install
   npm run dev
   ```

3. **Start the backend services**

   ```bash
   # In the backend directory
   docker compose up --build
   ```

4. **Wait for services to start**
   - The API will be available at `http://localhost:5000`
   - Frontend will be at `http://localhost:3000`

## 🔧 Services & Ports

| Service                 | URL                            | Purpose              |
| ----------------------- | ------------------------------ | -------------------- |
| **API Server**          | http://localhost:5000          | Main backend API     |
| **Swagger Docs**        | http://localhost:5000/api/docs | API documentation    |
| **Frontend**            | http://localhost:3000          | React Next.js app    |
| **MongoDB**             | http://localhost:27017         | Database             |
| **Mongo Express**       | http://localhost:8081          | Database admin panel |
| **RabbitMQ Management** | http://localhost:15672         | Message queue admin  |

## 🔑 Default Credentials

### MongoDB & Mongo Express

- **Username**: `root`
- **Password**: `rootpassword`
- **Database**: `chat-app`

### RabbitMQ Management

- **Username**: `guest`
- **Password**: `guest`

## 📖 Getting Started Guide

### 1. Create Test Users

Use the API or frontend to create 2-3 test users:

**Via API** (POST `/api/register`):

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Via Frontend**: Navigate to http://localhost:3000/register

### 2. Login with User Credentials

**Via API** (POST `/api/login`):

```json
{
  "usernameOrEmail": "john@example.com",
  "password": "password123"
}
```

**Via Frontend**: Navigate to http://localhost:3000/login

### 3. Set Up Profile Data

After logging in, complete your profile with:

- Name, gender, date of birth
- Height, weight, avatar
- Interests and hobbies

### 4. Explore the Feed

- Homepage displays all users in the system
- Click "Chat" button on any user to start messaging

### 5. Test Real-time Chat

For the best experience:

1. Open `http://localhost:3000` in **2 different browsers**
2. Login with **different users** in each browser
3. Start chatting between the users
4. Observe **real-time message delivery**
5. Notice **online/offline status** indicators

### 6. Real-time Features

- ✅ Messages appear instantly without refresh
- ✅ Online/offline status updates in real-time
- ✅ Typing indicators show when someone is typing
- ✅ Message timestamps and read status

### 7. Notification System

- 🔔 Unread message badges on conversation list
- 🔔 Notification counts on homepage
- 🔔 Visual indicators for new messages

## 🛠️ API Endpoints

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Profile Management

- `GET /api/getProfile` - Get current user profile
- `POST /api/createProfile` - Create user profile
- `PUT /api/updateProfile` - Update user profile
- `GET /api/getAllProfiles` - Get all users
- `GET /api/getUserProfile/:userId` - Get specific user profile

### Chat & Messaging

- `POST /api/chat/sendMessage` - Send a message
- `GET /api/chat/viewMessages/:userId` - Get conversation messages
- `GET /api/chat/conversations` - Get user's conversations

## 🔌 WebSocket Events

### Client → Server

- `joinChat` - Join a chat room
- `sendMessage` - Send a message
- `typing` - Start typing indicator
- `stopTyping` - Stop typing indicator

### Server → Client

- `newMessage` - New message received
- `messageReceived` - Message confirmation
- `userTyping` - Someone is typing
- `userOnline` - User came online
- `userOffline` - User went offline

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  name: String,
  gender: String,
  dob: Date,
  height: Number,
  weight: Number,
  avatar: String,
  interests: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection

```javascript
{
  _id: ObjectId,
  senderId: ObjectId,
  receiverId: ObjectId,
  content: String,
  isRead: Boolean,
  createdAt: Date
}
```

## 🐳 Docker Services

The docker-compose setup includes:

- **API Container**: NestJS application with hot reload
- **MongoDB**: Database with persistent storage
- **Mongo Express**: Web-based database admin
- **RabbitMQ**: Message queue with management UI

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://root:rootpassword@mongo:27017
MONGODB_DB=chat-app
RABBITMQ_URL=amqp://rabbitmq:5672
```

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong passwords for MongoDB
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use environment-specific configuration
6. Enable MongoDB authentication
7. Configure RabbitMQ security

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Docker build fails**

```bash
docker system prune -f
docker compose up --build
```

**MongoDB connection issues**

```bash
docker compose restart mongo
```

**RabbitMQ not connecting**

```bash
docker compose restart rabbitmq
```

**API not responding**

```bash
docker compose logs api
```

### Health Checks

- API Health: `GET http://localhost:5000/api`
- MongoDB: Check Mongo Express at `http://localhost:8081`
- RabbitMQ: Check management at `http://localhost:15672`

---

Made with ❤️ using NestJS, MongoDB, RabbitMQ and Socket.IO
