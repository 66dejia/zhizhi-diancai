/** 模拟支付弹窗（无金额） */
import { useState, useEffect } from "react";

export default function PaymentModal({ onSuccess, onClose }) {
  const [isPaying, setIsPaying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setIsPaying(false); setIsSuccess(true); }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDone = () => { onSuccess(); };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60" onClick={isSuccess ? handleDone : undefined} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-72 sm:w-80 p-6 flex flex-col items-center animate-slide-up">
        {isPaying ? (
          <>
            <div className="relative w-16 h-16 mb-4">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">💳</div>
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-1">正在提交订单</p>
            <p className="text-xs text-gray-400">请稍候，正在处理中...</p>
          </>
        ) : isSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce-cart">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-1">下单成功！</p>
            <p className="text-gray-400 text-sm mb-5">请稍等，我们马上为您准备~</p>
            <button onClick={handleDone} className="w-full py-2.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark active:scale-[0.98] transition-all shadow-md">完成</button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-1">提交失败</p>
            <p className="text-gray-400 text-sm mb-5">请重试</p>
            <button onClick={onClose} className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 active:scale-[0.98] transition-all">返回</button>
          </>
        )}
      </div>
    </div>
  );
}