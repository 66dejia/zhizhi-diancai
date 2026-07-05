/**
 * App - 最终同步架构
 *
 * 数据流 (本地→远程):
 *   DishCard +/− → AppContext.addItem/removeItem
 *     → cart state 变更 → syncCallback(cartItems) 被触发
 *       → syncCart(items) → CART_UPDATE → Railway Broadcast → 其他客户端
 *
 * 数据流 (远程→本地):
 *   Railway → CART_SYNC → useWebSocket.roomCart 更新
 *     → App.jsx useEffect 检测到变更
 *       → AppContext.syncCartFromRemote(roomCart) → 本地购物车替换
 */
import { useState, useEffect, useRef } from "react";
import { AppProvider, useApp } from "./store/AppContext";
import Header from "./components/Header";
import MenuPage from "./pages/MenuPage";
import OrderConfirm from "./components/OrderConfirm";
import HistoryPage from "./pages/HistoryPage";
import RoomPage from "./pages/RoomPage";
import useWebSocket from "./hooks/useWebSocket";

function AppInner() {
  const [view, setView] = useState("room");
  const [roomId, setRoomId] = useState(null);
  const { cartItems, setSyncCallback, syncCartFromRemote } = useApp();
  const cartRef = useRef(cartItems);

  const ws = useWebSocket();
  const {
    connected, nickname, memberCount, notifications, roomCart,
    joinRoom, leaveRoom, syncCart, syncOrder, syncClearCart,
  } = ws;

  /* 保持 cartRef 最新 */
  useEffect(() => { cartRef.current = cartItems; }, [cartItems]);

  /* ── 注册本地同步回调（只注册一次，通过 ref 保持最新状态）── */
  useEffect(() => {
    if (syncCart && setSyncCallback) {
      setSyncCallback(() => {
        syncCart(cartRef.current.map(item => ({
          dish: item.dish,
          quantity: item.quantity,
          specs: item.specs || null,
        })));
      });
    }
  }, [syncCart, setSyncCallback]);

  /* ── 远程同步：当 roomCart 变化时，合并到本地 ── */
  useEffect(() => {
    if (roomCart && Object.keys(roomCart).length > 0) {
      syncCartFromRemote(roomCart);
    }
  }, [roomCart, syncCartFromRemote]);

  /* ── 事件处理 ── */
  const handleJoin = (rid, nick) => {
    setRoomId(rid);
    joinRoom(rid, nick);
    setView("menu");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {view !== "room" && (
        <Header
          roomId={roomId} nickname={nickname}
          memberCount={memberCount} connected={connected}
          onShowHistory={() => setView("history")}
          onLeaveRoom={() => { leaveRoom(); setView("room"); }}
        />
      )}
      {notifications.length > 0 && (
        <div className="fixed top-14 left-0 right-0 z-[100] flex flex-col items-center gap-1 pointer-events-none">
          {notifications.map(n => (
            <div key={n.id} className="bg-gray-900/80 text-white text-xs px-4 py-1.5 rounded-full animate-slide-down pointer-events-auto">{n.text}</div>
          ))}
        </div>
      )}
      <div className="flex-1 flex flex-col max-w-[430px] w-full mx-auto relative bg-white sm:shadow-lg sm:border-x sm:border-gray-200 overflow-hidden">
        {view === "room"     && <RoomPage onJoin={handleJoin} />}
        {view === "menu"     && <MenuPage syncOrder={syncOrder} syncClearCart={syncClearCart} onCheckout={() => setView("checkout")} />}
        {view === "checkout" && <OrderConfirm onClose={() => setView("menu")} syncOrder={syncOrder} />}
        {view === "history"  && <HistoryPage onClose={() => setView("menu")} />}
      </div>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}