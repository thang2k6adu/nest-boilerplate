# Hướng Dẫn Kết Nối Socket - Matchmaking Module

> **Quick Start Guide** cho Frontend Developers  
> **Ngày cập nhật:** 21/01/2026

---

## 🚀 Quick Start (5 phút)

### Bước 1: Cài Đặt Socket.IO Client

```bash
npm install socket.io-client
# hoặc
yarn add socket.io-client
```

---

### Bước 2: Kết Nối Socket

```typescript
import { io, Socket } from 'socket.io-client';

// URL Backend của bạn
const API_URL = 'http://localhost:3000'; // Hoặc URL production
const JWT_TOKEN = 'your-jwt-token-here'; // Lấy từ auth system

// Kết nối tới namespace /matchmaking
const socket = io(`${API_URL}/matchmaking`, {
  auth: {
    token: JWT_TOKEN, // ⚠️ BẮT BUỘC: JWT token để xác thực
  },
  transports: ['websocket', 'polling'], // Thử websocket trước, fallback sang polling
  reconnection: true, // Auto reconnect khi mất kết nối
  reconnectionDelay: 1000, // Đợi 1s trước khi reconnect
  reconnectionAttempts: 5, // Thử tối đa 5 lần
});
```

---

### Bước 3: Lắng Nghe Events

```typescript
// ✅ Kết nối thành công
socket.on('connected', (data) => {
  console.log('✅ Connected!', data);
  // Output: { userId: 'your-user-id', message: 'Successfully connected...' }

  // Giờ có thể gọi API join matchmaking
});

// 🎮 Tìm thấy match!
socket.on('match_found', (data) => {
  console.log('🎮 Match found!', data);
  // Output: {
  //   roomId: 'room-uuid',
  //   livekitRoomName: 'match-1234567890',
  //   token: 'eyJhbGc...',
  //   wsUrl: 'ws://localhost:7880',
  //   matchedUsers: ['user1', 'user2'],
  //   timestamp: '2026-01-21T...'
  // }

  // Redirect tới room hoặc join LiveKit
  window.location.href = `/room/${data.roomId}`;
});

// ❌ Lỗi xảy ra
socket.on('error', (error) => {
  console.error('❌ Error:', error);
  // Output: { message: 'Error description' }

  // Hiển thị lỗi cho user
  alert(error.message);
});

// 🔌 Mất kết nối
socket.on('disconnect', (reason) => {
  console.warn('🔌 Disconnected:', reason);

  if (reason === 'io server disconnect') {
    // Server ngắt kết nối (có thể do token hết hạn)
    // Cần login lại
  } else {
    // Mất kết nối tạm thời - sẽ tự động reconnect
  }
});

// 🔄 Reconnecting
socket.on('reconnecting', (attemptNumber) => {
  console.log(`🔄 Reconnecting... attempt ${attemptNumber}`);
});

// ✅ Reconnected
socket.on('reconnect', (attemptNumber) => {
  console.log(`✅ Reconnected after ${attemptNumber} attempts`);
});
```

---

### Bước 4: Gửi Events (Optional)

```typescript
// Tham gia Socket.IO room (sau khi đã có roomId)
socket.emit('join_room', { roomId: 'room-uuid-123' }, (response) => {
  console.log('Room joined:', response);
  // Output: { success: true, roomId: 'room-uuid-123' }
});

// Lắng nghe player khác join
socket.on('player_joined', (data) => {
  console.log('👤 Player joined:', data);
  // Output: { userId: 'other-user-id', roomId: 'room-uuid-123' }
});

socket.on('room_joined', (data) => {
  console.log('✅ You joined room:', data);
  // Output: { roomId: 'room-uuid-123', message: 'Successfully joined room' }
});
```

---

### Bước 5: Ngắt Kết Nối (Cleanup)

```typescript
// Khi component unmount hoặc user logout
socket.disconnect();
```

---

## 📋 Complete Example - React

```tsx
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const MatchmakingSocket: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy token từ localStorage hoặc context
    const token = localStorage.getItem('jwt_token');

    if (!token) {
      setError('No authentication token found');
      return;
    }

    // Kết nối socket
    const newSocket = io(`${API_URL}/matchmaking`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Setup event listeners
    newSocket.on('connected', (data) => {
      console.log('✅ Connected:', data);
      setConnected(true);
      setError(null);
    });

    newSocket.on('match_found', (data) => {
      console.log('🎮 Match found:', data);
      setMatchData(data);

      // Redirect sau 2 giây
      setTimeout(() => {
        window.location.href = `/room/${data.roomId}`;
      }, 2000);
    });

    newSocket.on('error', (err) => {
      console.error('❌ Error:', err);
      setError(err.message);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err);
      setError('Failed to connect. Please check your internet connection.');
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('🔌 Disconnected:', reason);
      setConnected(false);

      if (reason === 'io server disconnect') {
        setError('Disconnected by server. Please login again.');
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setConnected(true);
      setError(null);
    });

    setSocket(newSocket);

    // Cleanup khi unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Matchmaking Socket Connection</h1>

      {/* Connection Status */}
      <div>Status: {connected ? '✅ Connected' : '🔴 Disconnected'}</div>

      {/* Error Display */}
      {error && <div style={{ color: 'red', padding: '10px', background: '#fee' }}>❌ {error}</div>}

      {/* Match Found */}
      {matchData && (
        <div style={{ color: 'green', padding: '10px', background: '#efe' }}>
          🎉 Match Found!
          <pre>{JSON.stringify(matchData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

---

## 📋 Complete Example - Vue 3

```vue
<template>
  <div class="matchmaking-socket">
    <h1>Matchmaking Socket Connection</h1>

    <!-- Connection Status -->
    <div class="status">Status: {{ connected ? '✅ Connected' : '🔴 Disconnected' }}</div>

    <!-- Error Display -->
    <div v-if="error" class="error">❌ {{ error }}</div>

    <!-- Match Found -->
    <div v-if="matchData" class="success">
      🎉 Match Found!
      <pre>{{ matchData }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const router = useRouter();

const socket = ref<Socket | null>(null);
const connected = ref(false);
const matchData = ref<any>(null);
const error = ref<string | null>(null);

onMounted(() => {
  // Lấy token
  const token = localStorage.getItem('jwt_token');

  if (!token) {
    error.value = 'No authentication token found';
    return;
  }

  // Kết nối socket
  const newSocket = io(`${API_URL}/matchmaking`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  // Setup listeners
  newSocket.on('connected', (data) => {
    console.log('✅ Connected:', data);
    connected.value = true;
    error.value = null;
  });

  newSocket.on('match_found', (data) => {
    console.log('🎮 Match found:', data);
    matchData.value = data;

    setTimeout(() => {
      router.push(`/room/${data.roomId}`);
    }, 2000);
  });

  newSocket.on('error', (err) => {
    error.value = err.message;
  });

  newSocket.on('disconnect', (reason) => {
    connected.value = false;
    if (reason === 'io server disconnect') {
      error.value = 'Disconnected by server';
    }
  });

  socket.value = newSocket;
});

onUnmounted(() => {
  socket.value?.disconnect();
});
</script>

<style scoped>
.error {
  color: red;
  background: #fee;
  padding: 10px;
  margin: 10px 0;
}

.success {
  color: green;
  background: #efe;
  padding: 10px;
  margin: 10px 0;
}
</style>
```

---

## 📋 Complete Example - JavaScript (Vanilla)

```javascript
// matchmaking-socket.js

const API_URL = 'http://localhost:3000';
let socket = null;

// Initialize socket connection
function initSocket() {
  const token = localStorage.getItem('jwt_token');

  if (!token) {
    console.error('❌ No token found');
    showError('Please login first');
    return;
  }

  // Connect
  socket = io(`${API_URL}/matchmaking`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  // Event: Connected
  socket.on('connected', (data) => {
    console.log('✅ Connected:', data);
    document.getElementById('status').textContent = '✅ Connected';
    document.getElementById('status').className = 'status connected';
  });

  // Event: Match Found
  socket.on('match_found', (data) => {
    console.log('🎮 Match found:', data);

    document.getElementById('match-info').style.display = 'block';
    document.getElementById('match-info').innerHTML = `
      <h2>🎉 Match Found!</h2>
      <p>Room ID: ${data.roomId}</p>
      <p>Redirecting...</p>
    `;

    setTimeout(() => {
      window.location.href = `/room.html?roomId=${data.roomId}&token=${data.token}`;
    }, 2000);
  });

  // Event: Error
  socket.on('error', (error) => {
    console.error('❌ Error:', error);
    showError(error.message);
  });

  // Event: Disconnect
  socket.on('disconnect', (reason) => {
    console.warn('🔌 Disconnected:', reason);
    document.getElementById('status').textContent = '🔴 Disconnected';
    document.getElementById('status').className = 'status disconnected';

    if (reason === 'io server disconnect') {
      showError('Disconnected by server. Please login again.');
    }
  });

  // Event: Reconnect
  socket.on('reconnect', (attemptNumber) => {
    console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    document.getElementById('status').textContent = '✅ Reconnected';
    document.getElementById('status').className = 'status connected';
  });
}

// Helper function
function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';

  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// Cleanup
window.addEventListener('beforeunload', () => {
  if (socket) {
    socket.disconnect();
  }
});

// Start
document.addEventListener('DOMContentLoaded', () => {
  initSocket();
});
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Matchmaking Socket</title>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
    <style>
      .status.connected {
        color: green;
      }
      .status.disconnected {
        color: red;
      }
      #error {
        color: red;
        background: #fee;
        padding: 10px;
        display: none;
      }
      #match-info {
        color: green;
        background: #efe;
        padding: 20px;
        display: none;
      }
    </style>
  </head>
  <body>
    <h1>Matchmaking Socket Connection</h1>

    <div id="status" class="status">Connecting...</div>
    <div id="error"></div>
    <div id="match-info"></div>

    <script src="matchmaking-socket.js"></script>
  </body>
</html>
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Authentication Token

```typescript
// ✅ ĐÚNG: Gửi token trong auth
const socket = io(`${API_URL}/matchmaking`, {
  auth: {
    token: JWT_TOKEN, // Token ở đây
  },
});

// ❌ SAI: Không gửi token
const socket = io(`${API_URL}/matchmaking`);
// → Server sẽ disconnect ngay lập tức!
```

### 2. Namespace URL

```typescript
// ✅ ĐÚNG: Có /matchmaking namespace
io('http://localhost:3000/matchmaking');

// ❌ SAI: Thiếu namespace
io('http://localhost:3000');
// → Sẽ không kết nối được!
```

### 3. Đợi Kết Nối Trước Khi Gọi API

```typescript
let isConnected = false;

socket.on('connected', () => {
  isConnected = true;
});

// ✅ ĐÚNG: Check trước khi join
async function joinMatchmaking() {
  if (!isConnected) {
    alert('Please wait for connection...');
    return;
  }

  // Gọi API /matchmaking/join
  const response = await fetch(`${API_URL}/matchmaking/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ❌ SAI: Gọi API ngay lập tức
// Server sẽ reject với lỗi "User not connected"
```

### 4. Cleanup Khi Unmount

```typescript
// React
useEffect(() => {
  const socket = io(/* ... */);

  return () => {
    socket.disconnect(); // ⚠️ BẮT BUỘC!
  };
}, []);

// Vue
onUnmounted(() => {
  socket.value?.disconnect(); // ⚠️ BẮT BUỘC!
});

// Vanilla JS
window.addEventListener('beforeunload', () => {
  if (socket) {
    socket.disconnect(); // ⚠️ BẮT BUỘC!
  }
});
```

---

## 🐛 Troubleshooting

### Vấn Đề 1: Socket Không Kết Nối

**Triệu chứng:** Socket luôn ở trạng thái "Connecting..."

**Nguyên nhân:**

- Token không hợp lệ hoặc hết hạn
- CORS chưa được config
- URL sai

**Giải pháp:**

```typescript
// Check token
console.log('Token:', token);

// Check URL
console.log('Connecting to:', `${API_URL}/matchmaking`);

// Listen connection error
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Output sẽ cho biết lý do
});
```

---

### Vấn Đề 2: Bị Disconnect Ngay Sau Khi Connect

**Triệu chứng:** Event `connected` chưa kịp fire đã bị `disconnect`

**Nguyên nhân:** Token không hợp lệ

**Giải pháp:**

```typescript
socket.on('error', (error) => {
  console.error('Error:', error.message);
  // Check message: "Authentication required" hoặc "Authentication failed"

  if (error.message.includes('Authentication')) {
    // Token hết hạn → redirect to login
    window.location.href = '/login';
  }
});
```

---

### Vấn Đề 3: Không Nhận Được Event `match_found`

**Triệu chứng:** Gọi API `/matchmaking/join` thành công nhưng không nhận event

**Nguyên nhân:**

- Chưa register event listener
- Socket bị disconnect

**Giải pháp:**

```typescript
// Đảm bảo listen event TRƯỚC KHI gọi API join
socket.on('match_found', (data) => {
  console.log('Match found:', data);
});

// Sau đó mới join
async function joinMatchmaking() {
  const response = await fetch(`${API_URL}/matchmaking/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}
```

---

### Vấn Đề 4: CORS Error

**Triệu chứng:** Console hiện lỗi CORS

**Giải pháp:** Backend phải config CORS cho Socket.IO:

```typescript
// Backend (main.ts)
app.enableCors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true,
});
```

---

## 📊 Event Flow Diagram

```
┌─────────────┐
│   Client    │
└─────┬───────┘
      │
      │ 1. Connect với token
      ├──────────────────────────────>┌──────────────┐
      │                                │   Gateway    │
      │<─────────────────────────────┤│              │
      │ 2. Event: 'connected'         └──────────────┘
      │
      │ 3. Call API: POST /matchmaking/join
      ├──────────────────────────────>┌──────────────┐
      │                                │ Controller/  │
      │                                │  Service     │
      │                                └──────┬───────┘
      │                                       │
      │                                       │ 4. Add to Redis queue
      │                                       │ 5. Check if enough users
      │                                       │ 6. If yes → Create room
      │                                       │
      │<──────────────────────────────────────┤
      │ 7. Event: 'match_found' với token
      │
      │ 8. Join LiveKit room với token
      ├──────────────────────────────>┌──────────────┐
      │                                │   LiveKit    │
      │<─────────────────────────────┤│   Server     │
      │ 9. Video/Audio streams         └──────────────┘
      │
```

---

## 🔗 Links

- **Full Guide:** [MATCHMAKING_FRONTEND_GUIDE.md](./MATCHMAKING_FRONTEND_GUIDE.md)
- **Rooms Guide:** [ROOMS_FRONTEND_GUIDE.md](./ROOMS_FRONTEND_GUIDE.md)
- **Socket.IO Docs:** https://socket.io/docs/v4/client-api/

---

## ✅ Checklist

Trước khi production, đảm bảo:

- [ ] Token được lưu an toàn (httpOnly cookie hoặc secure storage)
- [ ] Socket được disconnect khi component unmount
- [ ] Handle tất cả error events
- [ ] Có loading state khi đang kết nối
- [ ] Có timeout cho matchmaking
- [ ] Test reconnection scenario
- [ ] Test với token hết hạn
- [ ] Test với multiple users cùng lúc
- [ ] CORS được config đúng
- [ ] Environment variables được set đúng

---

**Cần hỗ trợ?** Liên hệ Backend Team hoặc xem [Full Documentation](./MATCHMAKING_FRONTEND_GUIDE.md)
