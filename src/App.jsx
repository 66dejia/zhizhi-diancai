/**
 * 应用根组件
 * 流程：选择/创建房间 → 点菜主页（带实时同步）
 * 纯净文本 UI，无 Emoji
 */
import { useState, useEffect } from "react";
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
  const { syncCartFromRemote } = useApp();

  const ws = useWebSocket();
  const {
    connected,
    nickname,
    memberCount,
    notifications,
    roomCart,
    joinRoom,
    leaveRoom,
    syncCart,
    syncOrder,
    syncClearCart,
  } = ws;

  // 实时同步：当 WebSocket 接收到 roomCart 变化时，更新本地 AppContext
  useEffect(() => {
    if (roomCart && Object.keys(roomCart).length > 0) {
      syncCartFromRemote(roomCart);
    }
  }, [roomCart, syncCartFromRemote]);

  const handleJoinRoom = (rid, nick) => {
    setRoomId(rid);
    joinRoom(rid, nick);
    setView("menu");
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setView("room");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      {view !== "room" && (
        <Header
          roomId={roomId}
          nickname={nickname}
          memberCount={memberCount}
          connected={connected}
          onShowHistory={() => setView("history")}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {/* 通知条 */}
      {notifications.length > 0 && (
        <div className="fixed top-14 left-0 right-0 z-[100] flex flex-col items-center gap-1 pointer-events-none">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-gray-900/80 text-white text-xs px-4 py-1.5 rounded-full animate-slide-down pointer-events-auto"
            >
              {n.text}
            </div>
          ))}
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col max-w-[430px] w-full mx-auto relative bg-white sm:shadow-lg sm:border-x sm:border-gray-200 overflow-hidden">
        {view === "room" && <RoomPage onJoin={handleJoinRoom} />}

        {view === "menu" && (
          <MenuPage
            syncCart={syncCart}
            syncOrder={syncOrder}
            syncClearCart={syncClearCart}
            onCheckout={() => setView("checkout")}
          />
        )}

        {view === "checkout" && (
          <OrderConfirm
            onClose={() => setView("menu")}
            syncOrder={syncOrder}
          />
        )}

        {view === "history" && (
          <HistoryPage onClose={() => setView("menu")} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}