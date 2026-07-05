/**
 * 应用根组件
 * 管理页面路由（点菜主页 / 订单确认 / 历史订单）之间的切换
 * 提供 PC 端居中布局，移动端自适应
 */
import { useState } from "react";
import Header from "./components/Header";
import MenuPage from "./pages/MenuPage";
import OrderConfirm from "./components/OrderConfirm";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  // 当前视图：menu | checkout | history
  const [view, setView] = useState("menu");

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <Header
        onShowHistory={() => setView("history")}
        onShowCart={() => {
          // Header 中的购物车按钮不在此处理，CartBar 自己处理展开
        }}
      />

      {/* 主内容区：PC 端最大宽度 430px 居中，模拟手机屏幕 */}
      <div className="flex-1 flex flex-col max-w-[430px] w-full mx-auto relative bg-white sm:shadow-lg sm:border-x sm:border-gray-200 overflow-hidden">
        {view === "menu" && (
          <MenuPage onCheckout={() => setView("checkout")} />
        )}

        {view === "checkout" && (
          <OrderConfirm onClose={() => setView("menu")} />
        )}

        {view === "history" && (
          <HistoryPage onClose={() => setView("menu")} />
        )}
      </div>
    </div>
  );
}