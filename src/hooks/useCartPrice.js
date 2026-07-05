import { useMemo } from "react";
import { specOptions } from "../data/dishes";

/**
 * 计算单个购物车条目的实际单价（基础价 + 所选规格的价格差额）
 * @param {Object} item - 购物车条目 { dish, quantity, specs }
 * @returns {number} 实际单价
 */
export function getCartItemUnitPrice(item) {
  let price = item.dish.price;
  if (item.specs) {
    Object.entries(item.specs).forEach(([specKey, choiceLabel]) => {
      const option = specOptions[specKey];
      if (option) {
        const choice = option.choices.find((c) => c.label === choiceLabel);
        if (choice) {
          price += choice.priceDelta;
        }
      }
    });
  }
  return price;
}

/**
 * 根据购物车条目计算总金额和总数量
 * @param {Object} cart - 购物车对象 { [cartKey]: item }
 * @returns {{ totalPrice: number, totalCount: number, cartItems: Array }}
 */
export function useCartTotals(cart) {
  return useMemo(() => {
    const cartItems = Object.values(cart);
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => {
      const unitPrice = getCartItemUnitPrice(item);
      return sum + unitPrice * item.quantity;
    }, 0);
    return { totalPrice, totalCount, cartItems };
  }, [cart]);
}

/**
 * 格式化规格选择为可读文本，例如 "中辣 / 大份"
 * @param {Object} specs - { spiciness: "中辣", size: "大份" }
 * @returns {string}
 */
export function formatSpecs(specs) {
  if (!specs || Object.keys(specs).length === 0) return "";
  return Object.values(specs).join(" / ");
}