/**
 * 规格选择弹窗组件
 * 部分菜品支持选择规格（辣度、份量、冰度等）
 * 不同规格可能影响价格，选择后确认加入购物车
 */
import { useState } from "react";
import { specOptions } from "../data/dishes";
import { useApp } from "../store/AppContext";

export default function SpecModal({ dish, onClose }) {
  const { addItem } = useApp();

  // 初始化已选规格：每个规格 key 默认选第一个选项
  const initSpecs = {};
  if (dish.specs) {
    dish.specs.forEach((specKey) => {
      const options = specOptions[specKey];
      if (options && options.choices.length > 0) {
        initSpecs[specKey] = options.choices[0].label;
      }
    });
  }

  const [selectedSpecs, setSelectedSpecs] = useState(initSpecs);

  /** 切换规格选项 */
  const selectChoice = (specKey, choiceLabel) => {
    setSelectedSpecs((prev) => ({ ...prev, [specKey]: choiceLabel }));
  };

  /** 计算当前所选规格下的实际单价 */
  const getTotalPrice = () => {
    let price = dish.price;
    Object.entries(selectedSpecs).forEach(([specKey, choiceLabel]) => {
      const option = specOptions[specKey];
      if (option) {
        const choice = option.choices.find((c) => c.label === choiceLabel);
        if (choice) {
          price += choice.priceDelta;
        }
      }
    });
    return price;
  };

  const finalPrice = getTotalPrice();

  /** 确认加入购物车 */
  const handleConfirm = () => {
    addItem(dish, { ...selectedSpecs });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />

      {/* 弹窗内容 */}
      <div
        className="relative bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl shadow-xl 
                     max-h-[80vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部：菜品信息 */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">
              {dish.name}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              基础价 <span className="text-primary font-semibold">¥{dish.price}</span>
              {finalPrice !== dish.price && (
                <span className="text-primary font-bold ml-1">
                  → ¥{finalPrice}
                </span>
              )}
            </p>
          </div>
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center
                       text-gray-400 hover:bg-gray-200 hover:text-gray-600 flex-shrink-0 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 规格选择区域 */}
        <div className="p-4 space-y-4">
          {dish.specs &&
            dish.specs.map((specKey) => {
              const option = specOptions[specKey];
              if (!option) return null;
              return (
                <div key={specKey}>
                  {/* 规格名称 */}
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {option.name}
                  </h4>
                  {/* 规格选项 */}
                  <div className="flex flex-wrap gap-2">
                    {option.choices.map((choice) => {
                      const isSelected =
                        selectedSpecs[specKey] === choice.label;
                      return (
                        <button
                          key={choice.label}
                          onClick={() => selectChoice(specKey, choice.label)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200
                            ${
                              isSelected
                                ? "border-primary bg-primary-light text-primary font-medium"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                        >
                          {choice.label}
                          {/* 价格差额提示 */}
                          {choice.priceDelta !== 0 && (
                            <span className="ml-1 text-xs opacity-75">
                              {choice.priceDelta > 0 ? "+" : ""}
                              ¥{choice.priceDelta}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* 底部确认按钮 */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleConfirm}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold
                       hover:bg-primary-dark active:scale-[0.98] transition-all shadow-md"
          >
            加入购物车 ¥{finalPrice}
          </button>
        </div>
      </div>
    </div>
  );
}