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
  const { cartItems, registerWsSender, syncCartFromRemote } = useApp();
  const cartRef = useRef(cartItems);

  const ws = useWebSocket();
  const { connected, nickname, memberCount, notifications, roomCart,
    joinRoom, leaveRoom, syncCart, syncOrder, syncClearCart } = ws;

  /* keep cartRef in sync for the callback */
  useEffect(() => { cartRef.current = cartItems; }, [cartItems]);

  /* ★ Bridge: register WebSocket sender into AppContext */
  useEffect(() => {
    if (syncCart && registerWsSender) {
      registerWsSender(() => {
        syncCart(cartRef.current.map(item => ({
          dish: item.dish,
          quantity: item.quantity,
          specs: item.specs || null,
        })));
      });
    }
  }, [syncCart, registerWsSender]);

  /* ★ Bridge: remote cart → local */
  useEffect(() => {
    if (roomCart && Object.keys(roomCart).length > 0) {
      syncCartFromRemote(roomCart);
    }
  }, [roomCart, syncCartFromRemote]);

  const handleJoin = (rid, nick) => { setRoomId(rid); joinRoom(rid, nick); setView("menu"); };
  const handleLeave = () => { leaveRoom(); setView("room"); };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {view !== "room" && (
        <Header roomId={roomId} nickname={nickname} memberCount={memberCount}
          connected={connected} onShowHistory={() => setView("history")}
          onLeaveRoom={handleLeave} />
      )}
      {notifications.length > 0 && (
        <div className="fixed top-14 left-0 right-0 z-[100] flex flex-col items-center gap-1 pointer-events-none">
          {notifications.map(n => (
            <div key={n.id} className="bg-gray-900/80 text-white text-xs px-4 py-1.5 rounded-full animate-slide-down">{n.text}</div>
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

export default function App() { return <AppProvider><AppInner /></AppProvider>; }