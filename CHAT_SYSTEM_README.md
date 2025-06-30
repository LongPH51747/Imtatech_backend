# 🚀 Hệ Thống Chat Real-time - ImtaTech Backend

## 📋 Tổng quan

Hệ thống chat real-time hoàn chỉnh với các tính năng:
- ✅ Chat real-time giữa User và Admin
- ✅ Hỗ trợ tin nhắn text, image, video
- ✅ Đánh dấu tin nhắn đã đọc
- ✅ Typing indicator
- ✅ Trạng thái online/offline
- ✅ Tìm kiếm tin nhắn
- ✅ Thống kê chat
- ✅ Quản lý phòng chat

## 🏗️ Cấu trúc hệ thống

```
src/
├── module/
│   ├── chat/
│   │   ├── chat.model.js      # Model phòng chat
│   │   ├── chat.service.js    # Business logic
│   │   ├── chat.controller.js # API endpoints
│   │   └── chat.route.js      # Routes
│   └── messages/
│       ├── message.model.js   # Model tin nhắn
│       ├── message.service.js # Business logic
│       ├── message.controller.js # API endpoints
│       └── message.route.js   # Routes
└── socket/
    └── socket.js              # Socket.io manager
```

## 🔧 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình môi trường
Tạo file `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/imtatech
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
```

### 3. Chạy server
```bash
npm start
```

Server sẽ chạy tại:
- 🌐 **API Server**: http://localhost:5000
- 📚 **API Docs**: http://localhost:5000/api-docs
- 💚 **Health Check**: http://localhost:5000/health
- 🔌 **Socket Status**: http://localhost:5000/socket-status

## 📡 API Endpoints

### 🔐 Authentication
Tất cả API đều cần JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

### 💬 Chat API

#### Phòng chat
- `POST /api/chat/rooms` - Tạo phòng chat mới
- `GET /api/chat/rooms` - Lấy danh sách phòng chat
- `GET /api/chat/rooms/:chatRoomId` - Lấy thông tin phòng chat
- `DELETE /api/chat/rooms/:chatRoomId` - Xóa phòng chat

#### Tin nhắn
- `GET /api/chat/rooms/:chatRoomId/messages` - Lấy tin nhắn trong phòng
- `POST /api/chat/messages` - Gửi tin nhắn
- `PUT /api/chat/rooms/:chatRoomId/read` - Đánh dấu đã đọc

#### Tính năng bổ sung
- `GET /api/chat/unread-count` - Số tin nhắn chưa đọc
- `GET /api/chat/search` - Tìm kiếm phòng chat
- `GET /api/chat/stats` - Thống kê chat

### 📨 Message API

#### Quản lý tin nhắn
- `POST /api/messages` - Tạo tin nhắn mới
- `GET /api/messages/:messageId` - Lấy tin nhắn theo ID
- `PUT /api/messages/:messageId` - Cập nhật tin nhắn
- `DELETE /api/messages/:messageId` - Xóa tin nhắn

#### Lấy danh sách
- `GET /api/messages/chat-room/:chatRoomId` - Tin nhắn trong phòng
- `GET /api/messages/my-messages` - Tin nhắn của user hiện tại
- `GET /api/messages/unread` - Tin nhắn chưa đọc

#### Tính năng nâng cao
- `GET /api/messages/search/:chatRoomId` - Tìm kiếm tin nhắn
- `GET /api/messages/stats/:chatRoomId` - Thống kê tin nhắn

## 🔌 Socket.IO Events

### Client → Server

#### Kết nối
```javascript
// Kết nối với token
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

#### Phòng chat
```javascript
// Tham gia phòng chat
socket.emit('join:chat-room', { chatRoomId: 'room_id' });

// Rời phòng chat
socket.emit('leave:chat-room', { chatRoomId: 'room_id' });
```

#### Tin nhắn
```javascript
// Gửi tin nhắn text
socket.emit('send:message', {
  chatRoomId: 'room_id',
  receiverId: 'user_id',
  content: 'Xin chào!',
  messageType: 'text'
});

// Gửi tin nhắn media
socket.emit('send:message', {
  chatRoomId: 'room_id',
  receiverId: 'user_id',
  messageType: 'image',
  mediaUrl: 'https://example.com/image.jpg'
});

// Đánh dấu đã đọc
socket.emit('mark:read', {
  chatRoomId: 'room_id',
  messageIds: ['msg_id_1', 'msg_id_2']
});
```

#### Tương tác
```javascript
// Typing indicator
socket.emit('typing:start', { chatRoomId: 'room_id' });
socket.emit('typing:stop', { chatRoomId: 'room_id' });

// Xóa tin nhắn
socket.emit('delete:message', {
  messageId: 'msg_id',
  chatRoomId: 'room_id'
});

// Cập nhật tin nhắn
socket.emit('update:message', {
  messageId: 'msg_id',
  content: 'Nội dung mới',
  chatRoomId: 'room_id'
});
```

### Server → Client

#### Kết nối
```javascript
// User online/offline
socket.on('user:online', (data) => {
  console.log('User online:', data);
});

socket.on('user:offline', (data) => {
  console.log('User offline:', data);
});

// Danh sách user online
socket.on('users:online', (users) => {
  console.log('Online users:', users);
});
```

#### Phòng chat
```javascript
// Tham gia/rời phòng
socket.on('joined:chat-room', (data) => {
  console.log('Joined room:', data.chatRoomId);
});

socket.on('left:chat-room', (data) => {
  console.log('Left room:', data.chatRoomId);
});
```

#### Tin nhắn
```javascript
// Tin nhắn mới
socket.on('new:message', (data) => {
  console.log('New message:', data.message);
});

// Thông báo tin nhắn
socket.on('message:notification', (data) => {
  console.log('Message notification:', data);
});

// Tin nhắn đã đọc
socket.on('messages:read', (data) => {
  console.log('Messages read:', data);
});

// Tin nhắn bị xóa
socket.on('message:deleted', (data) => {
  console.log('Message deleted:', data);
});

// Tin nhắn được cập nhật
socket.on('message:updated', (data) => {
  console.log('Message updated:', data);
});
```

#### Tương tác
```javascript
// Typing indicator
socket.on('user:typing', (data) => {
  console.log(`${data.userName} đang gõ...`);
});

// Lỗi
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
});
```

## 📱 Frontend Integration

### React/Vue/Angular Example

```javascript
import io from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.token = localStorage.getItem('token');
  }

  connect() {
    this.socket = io('http://localhost:5000', {
      auth: { token: this.token }
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Kết nối
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    // Tin nhắn mới
    this.socket.on('new:message', (data) => {
      // Cập nhật UI với tin nhắn mới
      this.handleNewMessage(data.message);
    });

    // User typing
    this.socket.on('user:typing', (data) => {
      // Hiển thị typing indicator
      this.showTypingIndicator(data);
    });
  }

  joinChatRoom(chatRoomId) {
    this.socket.emit('join:chat-room', { chatRoomId });
  }

  sendMessage(chatRoomId, receiverId, content) {
    this.socket.emit('send:message', {
      chatRoomId,
      receiverId,
      content,
      messageType: 'text'
    });
  }

  startTyping(chatRoomId) {
    this.socket.emit('typing:start', { chatRoomId });
  }

  stopTyping(chatRoomId) {
    this.socket.emit('typing:stop', { chatRoomId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default ChatService;
```

## 🔒 Bảo mật

### JWT Authentication
- Tất cả API đều yêu cầu JWT token
- Token được validate trong middleware
- Socket connection cũng yêu cầu token

### Quyền truy cập
- User chỉ có thể truy cập phòng chat của mình
- Chỉ người gửi mới được sửa/xóa tin nhắn
- Admin có quyền truy cập tất cả phòng chat

### Validation
- Validation đầy đủ cho tất cả input
- Sanitize data trước khi lưu database
- Rate limiting cho API endpoints

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Socket Status
```bash
curl http://localhost:5000/socket-status
```

### Logs
Server logs sẽ hiển thị:
- Kết nối/ngắt kết nối user
- Tin nhắn được gửi
- Lỗi và exceptions

## 🚀 Deployment

### Production
1. Cấu hình environment variables
2. Sử dụng PM2 hoặc Docker
3. Cấu hình reverse proxy (Nginx)
4. SSL/TLS cho WebSocket

### Docker Example
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Socket không kết nối**
   - Kiểm tra token JWT
   - Kiểm tra CORS configuration
   - Kiểm tra port và firewall

2. **Tin nhắn không gửi được**
   - Kiểm tra quyền truy cập phòng chat
   - Kiểm tra validation data
   - Kiểm tra database connection

3. **Performance issues**
   - Kiểm tra số lượng connection
   - Monitor memory usage
   - Optimize database queries

## 📞 Support

Nếu có vấn đề, vui lòng:
1. Kiểm tra logs
2. Xem API documentation tại `/api-docs`
3. Kiểm tra health check endpoint
4. Liên hệ team development

---

**🎉 Hệ thống chat đã sẵn sàng sử dụng!** 