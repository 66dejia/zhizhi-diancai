/**
 * 顶部导航栏 - 纯净文本版
 * 显示品牌名、房间信息、在线人数、连接状态
 */
import { useApp } from "../store/AppContext";

export default function Header({
  roomId,
  nickname,
  memberCount,
  connected,
  onShowHistory,
  onLeaveRoom,
}) {
  const { totalCount } = useApp();

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between px-4 py-2.5 max-w-lg mx-auto">
        {/* 品牌 + 房间 */}
        <div className="flex flex-col">
          <h1 className="text-white text-lg font-bold tracking-wide leading-tight">只只点菜</h1>
          {roomId && (
            <div className="flex items-center gap-2 text-white/70 text-[11px] mt-0.5">
              <button
                onClick={onLeaveRoom}
                className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-white/90 transition-colors"
                title="退出房间"
              >
                退出
              </button>
              <span>房间: <span className="font-mono text-white/90">{roomId}</span></span>
              <span className="flex items-center gap-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
                {memberCount}人
              </span>
            </div>
          )}
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-3">
          <button
            onClick={onShowHistory}
            className="text-white/90 hover:text-white transition-colors text-sm flex items-center gap-1"
            title="历史订单"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="hidden sm:inline">历史</span>
          </button>

          <button
            className="relative text-white/90 hover:text-white transition-colors"
            title="购物车"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow animate-bounce-cart">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}