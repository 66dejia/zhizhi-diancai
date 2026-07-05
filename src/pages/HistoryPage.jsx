/**
 * 历史订单页面
 * 展示过去的所有订单，支持查看详情和"再来一单"功能
 */
import { useApp } from "../store/AppContext";

export default function HistoryPage({ onClose }) {
  const { historyOrders, addItem } = useApp();

  /** "再来一单"：将历史订单中的所有菜品重新加入购物车 */
  const handleReorder = (order) => {
    order.items.forEach((item) => {
      // 直接调用 addItem，传入原来的 dish 和 specs
      addItem(item.dish, item.specs || null);
    });
    onClose(); // 返回点菜页
  };

  /** 格式化时间 */
  const formatTime = (isoStr) => {
    try {
      const d = new Date(isoStr);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return isoStr;
    }
  };

  /** 就餐方式文本 */
  const dineTypeText = (type) => (type === "dine-in" ? "堂食" : "打包外带");

  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-gray-50 animate-fade-in">
      {/* 顶部导航 */}
      <div className="bg-primary text-white flex items-center px-4 py-3 sticky top-0 z-10">
        <button onClick={onClose} className="mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">历史订单</h2>
      </div>

      {/* 订单列表 */}
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full pb-4">
        {historyOrders.length === 0 ? (
          /* 空订单占位 */
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-20 h-20 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">暂无历史订单</p>
            <p className="text-xs mt-1">去点一份美食吧~</p>
          </div>
        ) : (
          <div className="px-3 pt-3 space-y-3">
            {historyOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* 订单头部 */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      订单 #{order.id}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatTime(order.time)} · {dineTypeText(order.dineType)}
                      {order.tableNo && ` · ${order.tableNo}号桌`}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary">¥{order.total}</span>
                </div>

                {/* 订单菜品列表 */}
                <div className="px-3 py-1 divide-y divide-gray-50">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center py-2 gap-2">
                      <img
                        src={item.dish.image}
                        alt={item.dish.name}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-gray-800 truncate">
                          {item.dish.name}
                        </h4>
                        {item.specText && (
                          <p className="text-[11px] text-gray-400">{item.specText}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-primary font-semibold">¥{item.unitPrice}</p>
                        <p className="text-[10px] text-gray-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 备注 */}
                {order.remark && (
                  <div className="px-3 py-1.5 bg-orange-50 border-t border-gray-50">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-600">备注：</span>
                      {order.remark}
                    </p>
                  </div>
                )}

                {/* 再来一单按钮 */}
                <div className="px-3 py-2 border-t border-gray-50 flex justify-end">
                  <button
                    onClick={() => handleReorder(order)}
                    className="px-4 py-1.5 text-xs font-medium text-primary border border-primary rounded-full
                               hover:bg-primary hover:text-white active:scale-95 transition-all"
                  >
                    再来一单
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}