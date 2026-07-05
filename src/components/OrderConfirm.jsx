/** 订单确认页（无金额） */
import { useState, useEffect, useRef } from "react";
import { useApp } from "../store/AppContext";
import { formatSpecs } from "../hooks/useCartPrice";
import PaymentModal from "./PaymentModal";

export default function OrderConfirm({ onClose }) {
  const { cartItems, addOrder, clearCart } = useApp();
  const [dineType, setDineType] = useState("dine-in");
  const [tableNo, setTableNo] = useState("");
  const [remark, setRemark] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const canSubmit = dineType === "dine-in" ? tableNo.trim() !== "" : true;

  const generateOrderId = () => {
    return "ZZ" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  };

  const handleConfirmPayment = () => {
    if (!canSubmit) return;
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    const order = {
      id: generateOrderId(),
      items: cartItems.map((item) => ({
        ...item,
        specText: formatSpecs(item.specs),
      })),
      total: 0,
      dineType,
      tableNo: dineType === "dine-in" ? tableNo : "",
      remark,
      time: new Date().toISOString(),
    };
    addOrder(order);
    clearCart();
    setShowPayment(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[55] flex flex-col bg-gray-50 animate-fade-in">
        <div className="bg-primary text-white flex items-center px-4 py-3 sticky top-0 z-10">
          <button onClick={onClose} className="mr-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">确认订单</h2>
        </div>
        <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
          <div className="bg-white mx-3 mt-3 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">已选菜品 ({cartItems.length})</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {cartItems.map((item) => {
                const specText = formatSpecs(item.specs);
                return (
                  <div key={item.cartKey} className="flex items-center py-2.5 px-4 gap-2">
                    <img src={item.dish.image} alt={item.dish.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-gray-100" onError={(e) => { e.target.style.display = "none"; }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{item.dish.name}</h4>
                      {specText && <p className="text-xs text-gray-400">{specText}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white mx-3 mt-3 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">就餐方式</h3>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setDineType("dine-in")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${dineType === "dine-in" ? "border-primary bg-primary-light text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>🪑 堂食</button>
              <button onClick={() => setDineType("takeout")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${dineType === "takeout" ? "border-primary bg-primary-light text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>🛍️ 打包外带</button>
            </div>
            {dineType === "dine-in" && (
              <div className="animate-slide-down">
                <label className="text-xs text-gray-500 mb-1 block">桌号</label>
                <input type="text" placeholder="请输入桌号（如 A12）" value={tableNo} onChange={(e) => setTableNo(e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
            )}
          </div>
          <div className="bg-white mx-3 mt-3 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-2">备注</h3>
            <textarea placeholder="如有特殊要求请在此备注（如：不加葱、少放盐）" value={remark} onChange={(e) => setRemark(e.target.value)} rows={3} maxLength={100} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" />
            <p className="text-xs text-gray-400 text-right mt-1">{remark.length}/100</p>
          </div>
          <div className="h-24" />
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-end">
            <button onClick={handleConfirmPayment} disabled={!canSubmit} className={`px-8 py-2.5 rounded-full font-semibold text-sm transition-all ${canSubmit ? "bg-primary text-white hover:bg-primary-dark shadow-lg active:scale-[0.98]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>确认支付</button>
          </div>
        </div>
      </div>
      {showPayment && <PaymentModal onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(false)} />}
    </>
  );
}