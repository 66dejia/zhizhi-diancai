/** 购物车悬浮条 + 详情面板（无金额） */
import { useState } from "react";
import { useApp } from "../store/AppContext";
import { formatSpecs } from "../hooks/useCartPrice";

function CartDetail({ onClose, onCheckout }) {
  const { cartItems, removeItem, addItem, clearCart } = useApp();
  if (cartItems.length === 0) return null;

  return (
    <div className="bg-white rounded-t-2xl shadow-2xl max-h-[55vh] flex flex-col animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">购物车 ({cartItems.length})</h3>
        <div className="flex items-center gap-3">
          <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-500">清空</button>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {cartItems.map((item) => {
          const specText = formatSpecs(item.specs);
          return (
            <div key={item.cartKey} className="flex items-center py-3 px-4 gap-2">
              <img src={item.dish.image} alt={item.dish.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100" onError={(e) => { e.target.style.display = "none"; }} />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 truncate">{item.dish.name}</h4>
                {specText && <p className="text-xs text-gray-400 mt-0.5">{specText}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => removeItem(item.cartKey)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary active:scale-90 transition-all">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2.5} d="M20 12H4"/></svg>
                </button>
                <span className="text-sm font-semibold text-gray-700 w-5 text-center">{item.quantity}</span>
                <button onClick={() => addItem(item.dish, item.specs)} className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark active:scale-90 transition-all shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-gray-100">
        <button onClick={onCheckout} className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark active:scale-[0.98] transition-all shadow-md">去结算</button>
      </div>
    </div>
  );
}

function EmptyCart({ onClose }) {
  return (
    <div className="bg-white rounded-t-2xl shadow-2xl animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">购物车</h3>
        <button onClick={onClose} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <svg className="w-16 h-16 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
        <p className="text-sm">购物车还是空的</p><p className="text-xs mt-1">快去选些美食吧~</p>
      </div>
    </div>
  );
}

export default function CartBar({ onCheckout }) {
  const { cartItems, totalCount } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const isEmpty = cartItems.length === 0;

  return (
    <>
      {isExpanded && <div className="fixed inset-0 bg-black/30 z-40 animate-fade-in" onClick={() => setIsExpanded(false)} />}
      {isExpanded && (
        <div className="fixed bottom-20 left-0 right-0 z-50 px-2 max-w-lg mx-auto">
          {isEmpty ? <EmptyCart onClose={() => setIsExpanded(false)} /> : <CartDetail onClose={() => setIsExpanded(false)} onCheckout={() => { setIsExpanded(false); onCheckout(); }} />}
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-lg mx-auto flex items-center px-4 py-2.5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="relative mr-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${isEmpty ? "bg-gray-200" : "bg-primary"}`}>
              <svg className={`w-6 h-6 ${isEmpty ? "text-gray-400" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
            </div>
            {!isEmpty && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow animate-bounce-cart px-1">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </div>
          <div className="flex-1">
            <span className="text-sm text-gray-500">{isEmpty ? "购物车是空的" : `已选 ${totalCount} 件菜品`}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); if (!isEmpty) { setIsExpanded(false); onCheckout(); } }}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${isEmpty ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark shadow-lg"}`}
            disabled={isEmpty}>去结算</button>
        </div>
      </div>
    </>
  );
}