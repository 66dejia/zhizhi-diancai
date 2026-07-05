/**
 * Vite 插件：将 WebSocket 服务注入到 Vite 开发服务器
 * 复用 Vite 的 HTTP 服务器端口，无需独立运行后端
 */
import { WebSocketServer } from "ws";

// 房间数据存储
const rooms = new Map();
const clients = new Map();

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const getOrCreateRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { id: roomId, cart: {}, orders: [], members: new Set(), createdAt: new Date().toISOString() });
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
  if (client && client.ws.readyState === 1) client.ws.send(JSON.stringify(message));
};

export default function viteWsPlugin() {
  return {
    name: "vite-ws-plugin",
    configureServer(server) {
      const wss = new WebSocketServer({ server: server.httpServer });

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
              clients.set(clientId, { ws, roomId, nickname: nickname || "匿名" });

              const roomState = {
                type: "ROOM_STATE", roomId, cart: room.cart, orders: room.orders,
                memberCount: [...clients.values()].filter(c => c.roomId === roomId).length, clientId,
              };
              sendToClient(clientId, roomState);

              broadcastToRoom(roomId, {
                type: "MEMBER_JOINED", clientId, nickname: nickname || "匿名",
                memberCount: [...clients.values()].filter(c => c.roomId === roomId).length,
                message: `${nickname || "匿名"} 加入了房间`,
              });
              break;
            }

            case "LEAVE_ROOM": {
              const client = clients.get(clientId);
              if (client?.roomId) {
                const room = rooms.get(client.roomId);
                if (room) { room.members.delete(clientId); delete room.cart[clientId]; }
                broadcastToRoom(client.roomId, { type: "MEMBER_LEFT", clientId, nickname: client.nickname, cart: room?.cart || {} });
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
                  room.cart[clientId] = { items: msg.items, nickname: client.nickname, updatedAt: new Date().toISOString() };
                  broadcastToRoom(client.roomId, { type: "CART_SYNC", cart: room.cart, byClient: clientId, nickname: client.nickname });
                }
              }
              break;
            }

            case "NEW_ORDER": {
              const client = clients.get(clientId);
              if (client?.roomId) {
                const room = rooms.get(client.roomId);
                if (room) {
                  const order = { id: msg.orderId, items: msg.items, byClient: clientId, nickname: client.nickname, remark: msg.remark || "", dineType: msg.dineType || "dine-in", tableNo: msg.tableNo || "", time: new Date().toISOString() };
                  room.orders.push(order);
                  delete room.cart[clientId];
                  broadcastToRoom(client.roomId, { type: "ORDER_SYNC", order, orders: room.orders, cart: room.cart });
                }
              }
              break;
            }

            case "CLEAR_CART": {
              const client = clients.get(clientId);
              if (client?.roomId) {
                const room = rooms.get(client.roomId);
                if (room) { delete room.cart[clientId]; broadcastToRoom(client.roomId, { type: "CART_SYNC", cart: room.cart }); }
              }
              break;
            }

            case "PING": sendToClient(clientId, { type: "PONG" }); break;
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

      console.log("WebSocket 服务已集成到 Vite 开发服务器");
    },
  };
}