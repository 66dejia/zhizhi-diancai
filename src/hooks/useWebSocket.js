/**
 * WebSocket 实时通信 Hook - 修复版
 * 支持房间机制：加入/离开房间、购物车同步、订单同步
 * 修复：防止无限循环 + 精确同步
 */
import { useState, useEffect, useCallback, useRef } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "wss://zhizhi-diancai-production.up.railway.app";

export default function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [nickname, setNickname] = useState("");
  const [clientId, setClientId] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [roomCart, setRoomCart] = useState({});
  const [roomOrders, setRoomOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const myClientIdRef = useRef(null);

  const sendMessage = useCallback((msg) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // 加入房间
  const joinRoom = useCallback((rid, nick) => {
    if (wsRef.current) { try { wsRef.current.close(); } catch {} }
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      setRoomId(rid);
      setNickname(nick);
      sendMessage({ type: "JOIN_ROOM", roomId: rid, nickname: nick });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "ROOM_STATE") {
          setClientId(msg.clientId);
          myClientIdRef.current = msg.clientId;
          setRoomCart(msg.cart || {});
          setRoomOrders(msg.orders || []);
          setMemberCount(msg.memberCount || 1);
        } else if (msg.type === "CART_SYNC") {
          // 关键修复：忽略自己触发的更新（防止无限循环）
          if (msg.byClient !== myClientIdRef.current) {
            setRoomCart(msg.cart || {});
            addNotification(`${msg.nickname} 更新了购物车`);
          }
        } else if (msg.type === "ORDER_SYNC") {
          setRoomOrders(msg.orders || []);
          setRoomCart(msg.cart || {});
          if (msg.order.byClient !== myClientIdRef.current) {
            addNotification(`${msg.order.nickname} 提交了新订单`);
          }
        } else if (msg.type === "MEMBER_JOINED") {
          setMemberCount(msg.memberCount || 0);
          addNotification(msg.message);
        } else if (msg.type === "MEMBER_LEFT") {
          setMemberCount(msg.memberCount || 0);
          setRoomCart(msg.cart || {});
          addNotification(msg.message);
        } else if (msg.type === "PONG") {
          // heartbeat
        }
      } catch {}
    };

    ws.onerror = () => {
      setError("连接服务器失败");
      setConnected(false);
    };

    ws.onclose = () => { setConnected(false); };
  }, []);

  const leaveRoom = useCallback(() => {
    sendMessage({ type: "LEAVE_ROOM" });
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    setRoomId(null); setNickname(""); setClientId(null);
    setMemberCount(0); setRoomCart({}); setRoomOrders([]);
    setConnected(false);
  }, []);

  const syncCart = useCallback((items) => {
    sendMessage({ type: "CART_UPDATE", items });
  }, []);

  const syncOrder = useCallback((order) => {
    sendMessage({ type: "NEW_ORDER", orderId: order.id, items: order.items, remark: order.remark, dineType: order.dineType, tableNo: order.tableNo });
  }, []);

  const syncClearCart = useCallback(() => { sendMessage({ type: "CLEAR_CART" }); }, []);

  const addNotification = (text) => {
    const notif = { id: Date.now() + Math.random(), text, time: new Date().toISOString() };
    setNotifications((prev) => [...prev, notif]);
    setTimeout(() => { setNotifications((prev) => prev.filter((n) => n.id !== notif.id)); }, 3000);
  };

  useEffect(() => {
    const timer = setInterval(() => { sendMessage({ type: "PING" }); }, 25000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return {
    connected, roomId, nickname, clientId, memberCount,
    roomCart, roomOrders, notifications, error,
    joinRoom, leaveRoom, syncCart, syncOrder, syncClearCart,
  };
}