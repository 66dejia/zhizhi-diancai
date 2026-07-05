import { useState, useEffect, useCallback, useRef } from "react";

/* ── 环境变量：优先使用 .env 中的 WS_URL，否则自动检测当前域名 ── */
const getWsUrl = () => {
  const env = import.meta.env.VITE_WS_URL;
  if (env) return env;
  return `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
};

const WS_URL = getWsUrl();

export default function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId]             = useState(null);
  const [nickname, setNickname]         = useState("");
  const [myClientId, setMyClientId]     = useState(null);
  const [memberCount, setMemberCount]   = useState(0);
  const [roomCart,  setRoomCart]        = useState({});
  const [roomOrders, setRoomOrders]     = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError]               = useState(null);

  const wsRef          = useRef(null);
  const reconnectTimer = useRef(null);
  const clientIdRef    = useRef(null);   // 持久化 clientId
  const roomIdRef      = useRef(null);
  const nickRef        = useRef("");

  /* ── 心跳 ── */
  useEffect(() => {
    const hb = setInterval(() => {
      if (wsRef.current?.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: "PING" }));
      }
    }, 25000);
    return () => clearInterval(hb);
  }, []);

  /* ── 发送 JSON 消息 ── */
  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  /* ── 重连 ── */
  const tryReconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => {
      if (roomIdRef.current && wsRef.current?.readyState !== 1) {
        doConnect(roomIdRef.current, nickRef.current);
      }
    }, 3000);
  }, []);

  /* ── 核心连接函数 ── */
  const doConnect = useCallback((rid, nick) => {
    // 清理旧连接
    if (wsRef.current) { try { wsRef.current.close(); } catch {} }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      send({ type: "JOIN_ROOM", roomId: rid, nickname: nick });
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        switch (msg.type) {
          case "ROOM_STATE":
            setMyClientId(msg.clientId);
            setMemberCount(msg.memberCount);
            setRoomCart(msg.cart || {});
            setRoomOrders(msg.orders || []);
            break;
          case "CART_SYNC":
            // ★ 关键：只接收别人的更新（服务端已过滤 byClient）
            setRoomCart(msg.cart || {});
            if (msg.byClient && msg.byClient !== clientIdRef.current) {
              addNotif(`${msg.nickname} 更新了购物车`);
            }
            break;
          case "ORDER_SYNC":
            setRoomOrders(msg.orders || []);
            setRoomCart(msg.cart || {});
            addNotif(`${msg.order?.nickname || "成员"} 提交了新订单`);
            break;
          case "MEMBER_JOINED":
            setMemberCount(msg.memberCount);
            addNotif(msg.message);
            break;
          case "MEMBER_LEFT":
            setMemberCount(msg.memberCount);
            addNotif(msg.message);
            break;
          case "PONG": break;
          default: break;
        }
      } catch { /* ignore malformed */ }
    };

    ws.onerror = () => {
      setConnected(false);
      tryReconnect();
    };

    ws.onclose = () => {
      setConnected(false);
      tryReconnect();
    };
  }, [send]);

  /* ── 公开操作 ── */
  const joinRoom = useCallback((rid, nick) => {
    roomIdRef.current = rid;
    nickRef.current = nick;
    setRoomId(rid);
    setNickname(nick);
    doConnect(rid, nick);
  }, [doConnect]);

  const leaveRoom = useCallback(() => {
    send({ type: "LEAVE_ROOM" });
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    setRoomId(null); setNickname(""); setMyClientId(null);
    setMemberCount(0); setRoomCart({}); setRoomOrders([]);
    setConnected(false);
  }, [send]);

  /* 同步购物车至服务端 */
  const syncCart = useCallback((items) => {
    send({ type: "CART_UPDATE", items });
  }, [send]);

  const syncOrder = useCallback((order) => {
    send({ type: "NEW_ORDER", orderId: order.id, items: order.items, remark: order.remark, dineType: order.dineType, tableNo: order.tableNo });
  }, [send]);

  const syncClearCart = useCallback(() => send({ type: "CLEAR_CART" }), [send]);

  /* ── 通知 ── */
  const addNotif = (text) => {
    const n = { id: Date.now() + Math.random(), text };
    setNotifications(prev => [...prev, n]);
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 3500);
  };

  /* ── 清理 ── */
  useEffect(() => () => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (wsRef.current) wsRef.current.close();
  }, []);

  return {
    connected, roomId, nickname, memberCount,
    roomCart, roomOrders, notifications, error,
    joinRoom, leaveRoom, syncCart, syncOrder, syncClearCart,
  };
}