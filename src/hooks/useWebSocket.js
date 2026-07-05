/**
 * WebSocket 实时通信 Hook
 * 支持房间机制：加入/离开房间、购物车同步、订单同步
 */
import { useState, useEffect, useCallback, useRef } from "react";

// 自动检测 WebSocket 地址：同域名下用 wss/wss 协议
const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}`;
};

const WS_URL = getWsUrl();

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

  // 尝试重连
  const tryReconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => {
      if (wsRef.current?.readyState !== 1 && roomId) {
        joinRoom(roomId, nickname);
      }
    }, 3000);
  }, [roomId, nickname]);

  // 发送消息
  const sendMessage = useCallback((msg) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // 加入房间
  const joinRoom = useCallback((rid, nick) => {
    // 先关闭旧连接
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
    }

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
        handleMessage(msg);
      } catch {}
    };

    ws.onerror = () => {
      setError("连接服务器失败，请确保后端已启动");
      setConnected(false);
      tryReconnect();
    };

    ws.onclose = () => {
      setConnected(false);
      // 断开后尝试自动重连
      tryReconnect();
    };
  }, []);

  // 离开房间
  const leaveRoom = useCallback(() => {
    sendMessage({ type: "LEAVE_ROOM" });
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setRoomId(null);
    setNickname("");
    setClientId(null);
    setMemberCount(0);
    setRoomCart({});
    setRoomOrders([]);
    setConnected(false);
  }, []);

  // 同步购物车
  const syncCart = useCallback((items) => {
    sendMessage({ type: "CART_UPDATE", items });
  }, []);

  // 同步新订单
  const syncOrder = useCallback((order) => {
    sendMessage({
      type: "NEW_ORDER",
      orderId: order.id,
      items: order.items,
      remark: order.remark,
      dineType: order.dineType,
      tableNo: order.tableNo,
    });
  }, []);

  // 清空购物车
  const syncClearCart = useCallback(() => {
    sendMessage({ type: "CLEAR_CART" });
  }, []);

  // 处理消息
  const handleMessage = (msg) => {
    switch (msg.type) {
      case "ROOM_STATE":
        setClientId(msg.clientId);
        setRoomCart(msg.cart || {});
        setRoomOrders(msg.orders || []);
        setMemberCount(msg.memberCount || 1);
        addNotification("已连接到房间");
        break;

      case "CART_SYNC":
        setRoomCart(msg.cart || {});
        if (msg.byClient && msg.byClient !== clientId) {
          addNotification(`${msg.nickname} 更新了购物车`);
        }
        break;

      case "ORDER_SYNC":
        setRoomOrders(msg.orders || []);
        setRoomCart(msg.cart || {});
        addNotification(`${msg.order.nickname} 提交了新订单`);
        break;

      case "MEMBER_JOINED":
        setMemberCount(msg.memberCount || 0);
        addNotification(msg.message);
        break;

      case "MEMBER_LEFT":
        setMemberCount(msg.memberCount || 0);
        setRoomCart(msg.cart || {});
        addNotification(msg.message);
        break;

      case "PONG":
        break;

      default:
        break;
    }
  };

  // 添加通知
  const addNotification = (text) => {
    const notif = { id: Date.now() + Math.random(), text, time: new Date().toISOString() };
    setNotifications((prev) => [...prev, notif]);
    // 3秒后自动消失
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 3000);
  };

  // 心跳
  useEffect(() => {
    const timer = setInterval(() => {
      if (wsRef.current?.readyState === 1) {
        sendMessage({ type: "PING" });
      }
    }, 25000);
    return () => clearInterval(timer);
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return {
    connected,
    roomId,
    nickname,
    clientId,
    memberCount,
    roomCart,
    roomOrders,
    notifications,
    error,
    joinRoom,
    leaveRoom,
    syncCart,
    syncOrder,
    syncClearCart,
  };
}