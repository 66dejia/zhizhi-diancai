/**
 * 只只点菜 WebSocket 服务器 (生产环境)
 * 支持跨域 (CORS)、房间广播、健康检查
 */
import { WebSocketServer } from "ws";
import { createServer } from "http";

const PORT = process.env.PORT || 3001;

/* ─── 内存数据结构 ─── */
const rooms = new Map();    // roomId → { cart:{clientId:{items}}, orders:[] }
const clients = new Map();  // clientId → { ws, roomId, nickname }

/* ─── 工具 ─── */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);

const getRoom = (rid) => {
  if (!rooms.has(rid)) rooms.set(rid, { id:rid, cart:{}, orders:[], createdAt:new Date().toISOString() });
  return rooms.get(rid);
};

const membersIn = (rid) => [...clients.values()].filter(c => c.roomId === rid).length;

const broadcast = (rid, msg) => {
  const data = JSON.stringify(msg);
  for (const [,c] of clients) {
    if (c.roomId === rid && c.ws.readyState === 1) c.ws.send(data);
  }
};

const send = (cid, msg) => {
  const c = clients.get(cid);
  if (c && c.ws.readyState === 1) c.ws.send(JSON.stringify(msg));
};

/* ─── HTTP + WS server ─── */
const server = createServer((req, res) => {
  // CORS 头
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204); res.end(); return;
  }

  // 健康检查
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("只只点菜 WebSocket 服务器运行中");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const cid = uid();
  ws.clientId = cid;

  console.log(`[连接] ${cid}`);

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    switch (msg.type) {
      case "JOIN_ROOM": {
        const { roomId, nickname } = msg;
        const room = getRoom(roomId);
        clients.set(cid, { ws, roomId, nickname: nickname || "匿名" });

        const count = membersIn(roomId);

        send(cid, { type:"ROOM_STATE", roomId, cart:room.cart, orders:room.orders, memberCount:count, clientId:cid });

        broadcast(roomId, { type:"MEMBER_JOINED", clientId:cid, nickname:nickname||"匿名", memberCount:count, message:`${nickname||"匿名"} 加入房间` });
        console.log(`[房间] ${nickname||cid} → ${roomId} (${count}人)`);
        break;
      }

      case "LEAVE_ROOM": {
        const client = clients.get(cid);
        if (client?.roomId) {
          const room = rooms.get(client.roomId);
          if (room) { delete room.cart[cid]; }
          broadcast(client.roomId, { type:"MEMBER_LEFT", clientId:cid, nickname:client.nickname, cart:room?.cart||{}, memberCount:membersIn(client.roomId)-1, message:`${client.nickname} 离开房间` });
        }
        clients.delete(cid);
        ws.close();
        break;
      }

      case "CART_UPDATE": {
        const client = clients.get(cid);
        if (!client?.roomId) break;
        const room = rooms.get(client.roomId);
        if (!room) break;
        room.cart[cid] = { items: msg.items, nickname: client.nickname, updatedAt: new Date().toISOString() };
        broadcast(client.roomId, { type:"CART_SYNC", cart:room.cart, byClient:cid, nickname:client.nickname });
        break;
      }

      case "NEW_ORDER": {
        const client = clients.get(cid);
        if (!client?.roomId) break;
        const room = rooms.get(client.roomId);
        if (!room) break;
        const order = {
          id: msg.orderId, items: msg.items, byClient: cid,
          nickname: client.nickname, remark: msg.remark || "",
          dineType: msg.dineType || "dine-in",
          tableNo: msg.tableNo || "", time: new Date().toISOString(),
        };
        room.orders.push(order);
        delete room.cart[cid];
        broadcast(client.roomId, { type:"ORDER_SYNC", order, orders:room.orders, cart:room.cart });
        break;
      }

      case "CLEAR_CART": {
        const client = clients.get(cid);
        if (client?.roomId) {
          const room = rooms.get(client.roomId);
          if (room) { delete room.cart[cid]; broadcast(client.roomId, { type:"CART_SYNC", cart:room.cart, byClient:cid, nickname:client.nickname }); }
        }
        break;
      }

      case "PING": send(cid, { type:"PONG" }); break;
    }
  });

  ws.on("close", () => {
    const client = clients.get(cid);
    if (client?.roomId) {
      const room = rooms.get(client.roomId);
      if (room) { delete room.cart[cid]; }
      broadcast(client.roomId, { type:"MEMBER_LEFT", clientId:cid, nickname:client?.nickname||"", cart:room?.cart||{}, memberCount:membersIn(client.roomId)-1, message:`${client?.nickname||""} 断开连接` });
    }
    clients.delete(cid);
    console.log(`[断开] ${cid}`);
  });

  ws.on("error", (err) => {
    console.error(`[错误] ${cid}:`, err.message);
  });
});

// 每小时清理空房间
setInterval(() => {
  const now = Date.now();
  for (const [rid, room] of rooms) {
    if (membersIn(rid) === 0 && now - new Date(room.createdAt).getTime() > 3600000) {
      rooms.delete(rid);
      console.log(`[清理] 空房间 ${rid}`);
    }
  }
}, 60000);

server.listen(PORT, () => {
  console.log(`只只点菜 WebSocket 服务器运行在端口 ${PORT}`);
});