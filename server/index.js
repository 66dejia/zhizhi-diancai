/**
 * 只只点菜 - 一体化服务器 (WebSocket + 静态文件)
 * Railway 自动部署：npm install && node index.js
 */
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = join(__dirname, "..", "dist");

// MIME 类型
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

// ========== WebSocket 房间管理 ==========
const rooms = new Map();
const clients = new Map();

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const getOrCreateRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      cart: {},
      orders: [],
      members: new Set(),
      createdAt: new Date().toISOString(),
    });
  }
  return rooms.get(roomId);
};

const broadcastToRoom = (roomId, message) => {
  const data = JSON.stringify(message);
  for (const [, client] of clients) {
    if (client.roomId === roomId && client.ws.readyState === 1) {
      client.ws.send(data);
    }
  }
};

const sendToClient = (clientId, message) => {
  const client = clients.get(clientId);
  if (client?.ws.readyState === 1) client.ws.send(JSON.stringify(message));
};

// ========== HTTP + WebSocket 服务器 ==========
const server = createServer((req, res) => {
  // 解析路径
  let url = req.url.split("?")[0];
  if (url === "/" || url === "") url = "/index.html";

  // SPA 路由：所有非 API 路径返回 index.html
  let filePath = join(DIST, url);

  try {
    if (!existsSync(filePath)) {
      filePath = join(DIST, "index.html");
    }
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const content = readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    // 404 降级到 index.html (SPA)
    try {
      const fallback = readFileSync(join(DIST, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fallback);
    } catch {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("服务运行中。请确保已构建前端: npm run build");
    }
  }
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  const clientId = generateId();
  ws.clientId = clientId;

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    switch (msg.type) {
      case "JOIN_ROOM": {
        const { roomId, nickname } = msg;
        const room = getOrCreateRoom(roomId);
        room.members.add(clientId);
        clients.set(clientId, {
          ws, roomId, nickname: nickname || "匿名",
        });

        const count = [...clients.values()].filter(
          (c) => c.roomId === roomId
        ).length;

        sendToClient(clientId, {
          type: "ROOM_STATE", roomId, cart: room.cart,
          orders: room.orders, memberCount: count, clientId,
        });

        broadcastToRoom(roomId, {
          type: "MEMBER_JOINED", clientId,
          nickname: nickname || "匿名", memberCount: count,
          message: `${nickname || "匿名"} 加入了房间`,
        });
        break;
      }

      case "LEAVE_ROOM": {
        const client = clients.get(clientId);
        if (client?.roomId) {
          const room = rooms.get(client.roomId);
          if (room) { room.members.delete(clientId); delete room.cart[clientId]; }
          broadcastToRoom(client.roomId, {
            type: "MEMBER_LEFT", clientId, nickname: client.nickname,
            cart: room?.cart || {},
          });
        }
        clients.delete(clientId);
        ws.close();
        break;
      }

      case "CART_UPDATE": {
        const client = clients.get(clientId);
        if (client?.roomId) {
          const room = rooms.get(client.roomId);
          if (room) {
            room.cart[clientId] = {
              items: msg.items, nickname: client.nickname,
              updatedAt: new Date().toISOString(),
            };
            broadcastToRoom(client.roomId, {
              type: "CART_SYNC", cart: room.cart,
              byClient: clientId, nickname: client.nickname,
            });
          }
        }
        break;
      }

      case "NEW_ORDER": {
        const client = clients.get(clientId);
        if (client?.roomId) {
          const room = rooms.get(client.roomId);
          if (room) {
            const order = {
              id: msg.orderId, items: msg.items,
              byClient: clientId, nickname: client.nickname,
              remark: msg.remark || "", dineType: msg.dineType || "dine-in",
              tableNo: msg.tableNo || "", time: new Date().toISOString(),
            };
            room.orders.push(order);
            delete room.cart[clientId];
            broadcastToRoom(client.roomId, {
              type: "ORDER_SYNC", order, orders: room.orders,
              cart: room.cart,
            });
          }
        }
        break;
      }

      case "CLEAR_CART": {
        const client = clients.get(clientId);
        if (client?.roomId) {
          const room = rooms.get(client.roomId);
          if (room) {
            delete room.cart[clientId];
            broadcastToRoom(client.roomId, {
              type: "CART_SYNC", cart: room.cart,
            });
          }
        }
        break;
      }

      case "PING":
        sendToClient(clientId, { type: "PONG" });
        break;
    }
  });

  ws.on("close", () => {
    const client = clients.get(clientId);
    if (client?.roomId) {
      const room = rooms.get(client.roomId);
      if (room) { room.members.delete(clientId); delete room.cart[clientId]; }
    }
    clients.delete(clientId);
  });
});

server.listen(PORT, () => {
  console.log(`只只点菜服务器运行在端口 ${PORT}`);
  if (!existsSync(DIST)) {
    console.warn("警告: dist/ 目录不存在，请先运行 npm run build");
  }
});