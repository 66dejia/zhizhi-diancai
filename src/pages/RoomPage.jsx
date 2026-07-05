/**
 * 房间页面 - 创建/加入房间
 * 支持输入昵称和房间号，加入同桌实时同步点菜
 */
import { useState } from "react";

export default function RoomPage({ onJoin }) {
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("join");

  // 生成随机房间号
  const generateRoomId = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateRoom = () => {
    if (!nickname.trim()) return;
    const newRoomId = generateRoomId();
    onJoin(newRoomId, nickname.trim());
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomId.trim()) return;
    onJoin(roomId.trim().toUpperCase(), nickname.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">只只点菜</h1>
          <p className="text-sm text-gray-500">同桌实时同步点菜，一人点单全桌共享</p>
        </div>

        {/* 昵称输入 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">你的昵称</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="输入你的名字"
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            autoFocus
          />
        </div>

        {/* 模式切换 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
              ${mode === "join" ? "bg-primary text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            加入房间
          </button>
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
              ${mode === "create" ? "bg-primary text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            创建房间
          </button>
        </div>

        {/* 加入房间 */}
        {mode === "join" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">房间号</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="输入6位房间号"
                maxLength={6}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono tracking-widest text-center"
              />
            </div>
            <button
              onClick={handleJoinRoom}
              disabled={!nickname.trim() || !roomId.trim()}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
                ${nickname.trim() && roomId.trim()
                  ? "bg-primary text-white hover:bg-primary-dark shadow-lg active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              加入房间
            </button>
          </div>
        )}

        {/* 创建房间 */}
        {mode === "create" && (
          <div className="space-y-3">
            <div className="bg-primary-light rounded-xl p-4 text-center">
              <p className="text-xs text-primary/70 mb-1">系统将自动生成6位房间号</p>
              <p className="text-sm text-primary font-medium">分享房间号给朋友即可同步点菜</p>
            </div>
            <button
              onClick={handleCreateRoom}
              disabled={!nickname.trim()}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
                ${nickname.trim()
                  ? "bg-primary text-white hover:bg-primary-dark shadow-lg active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              创建新房间
            </button>
          </div>
        )}
      </div>
    </div>
  );
}