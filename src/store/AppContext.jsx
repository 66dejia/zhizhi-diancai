import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { useCartTotals, getCartItemUnitPrice } from "../hooks/useCartPrice";
import { dishes as initialDishes, defaultCategories } from "../data/dishes";

// ==================== 全局状态管理 + LocalStorage 持久化 ====================

const AppContext = createContext(null);

/* ---------- 工具函数 ---------- */
export const makeCartKey = (dishId, specs) => {
  const specStr = specs
    ? Object.entries(specs)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join("|")
    : "";
  return specStr ? `${dishId}__${specStr}` : `${dishId}__default`;
};

const getNextId = (dishes) => Math.max(0, ...dishes.map((d) => d.id)) + 1;

/* ---------- 初始状态 ---------- */
const initialState = {
  cart: {},
  historyOrders: [],
  dishes: initialDishes,
  categories: defaultCategories,
};

/* ---------- Reducer ---------- */
function reducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { dish, specs } = action.payload;
      const cartKey = makeCartKey(dish.id, specs);
      const existing = state.cart[cartKey];
      return {
        ...state,
        cart: {
          ...state.cart,
          [cartKey]: existing
            ? { ...existing, quantity: existing.quantity + 1 }
            : { dish, quantity: 1, specs, cartKey },
        },
      };
    }

    case "REMOVE_ITEM": {
      const { cartKey } = action.payload;
      const existing = state.cart[cartKey];
      if (!existing) return state;
      const newQuantity = existing.quantity - 1;
      if (newQuantity <= 0) {
        const newCart = { ...state.cart };
        delete newCart[cartKey];
        return { ...state, cart: newCart };
      }
      return {
        ...state,
        cart: {
          ...state.cart,
          [cartKey]: { ...existing, quantity: newQuantity },
        },
      };
    }

    case "CLEAR_CART":
      return { ...state, cart: {} };

    /* 从 WebSocket 接收的 roomCart 同步到本地 cart */
    case "SYNC_CART": {
      const { roomCart: rcart, clientId: cid } = action.payload;
      // 将所有客户端的所有 items 合并到本地 cart
      const newCart = {};
      Object.entries(rcart || {}).forEach(([id, data]) => {
        (data.items || []).forEach((item) => {
          const cartKey = makeCartKey(item.dish.id, item.specs || null);
          if (newCart[cartKey]) {
            newCart[cartKey].quantity += item.quantity;
          } else {
            newCart[cartKey] = {
              dish: item.dish,
              quantity: item.quantity,
              specs: item.specs || null,
              cartKey,
            };
          }
        });
      });
      return { ...state, cart: newCart };
    }

    case "ADD_ORDER": {
      const { order } = action.payload;
      return {
        ...state,
        historyOrders: [order, ...state.historyOrders],
      };
    }

    /* ========== 菜品管理 ========== */
    case "ADD_DISH": {
      const newDish = {
        ...action.payload.dish,
        id: getNextId(state.dishes),
        monthlySales: 0,
      };
      return { ...state, dishes: [...state.dishes, newDish] };
    }

    case "UPDATE_DISH": {
      const { id, updates } = action.payload;
      return {
        ...state,
        dishes: state.dishes.map((d) =>
          d.id === id ? { ...d, ...updates } : d,
        ),
      };
    }

    case "DELETE_DISH": {
      const { id } = action.payload;
      return {
        ...state,
        dishes: state.dishes.filter((d) => d.id !== id),
      };
    }

    case "ADD_SALES_COUNT": {
      const { salesMap } = action.payload;
      return {
        ...state,
        dishes: state.dishes.map((d) => {
          const add = salesMap[d.id] || 0;
          return add > 0
            ? { ...d, monthlySales: d.monthlySales + add }
            : d;
        }),
      };
    }

    /* ========== 分类管理 ========== */
    case "ADD_CATEGORY": {
      const { category } = action.payload;
      if (state.categories.find((c) => c.id === category.id)) return state;
      return { ...state, categories: [...state.categories, category] };
    }

    case "DELETE_CATEGORY": {
      const { id } = action.payload;
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== id),
      };
    }

    case "LOAD_FROM_STORAGE": {
      const { cart, historyOrders, dishes, categories } = action.payload;
      return {
        ...state,
        cart: cart || {},
        historyOrders: historyOrders || [],
        dishes: dishes && dishes.length > 0 ? dishes : state.dishes,
        categories:
          categories && categories.length > 0
            ? categories
            : state.categories,
      };
    }

    default:
      return state;
  }
}

/* ---------- Provider ---------- */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /* 加载持久化数据 */
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("zzdc_cart");
      const savedOrders = localStorage.getItem("zzdc_orders");
      const savedDishes = localStorage.getItem("zzdc_dishes");
      const savedCats = localStorage.getItem("zzdc_categories");
      dispatch({
        type: "LOAD_FROM_STORAGE",
        payload: {
          cart: savedCart ? JSON.parse(savedCart) : {},
          historyOrders: savedOrders ? JSON.parse(savedOrders) : [],
          dishes: savedDishes ? JSON.parse(savedDishes) : null,
          categories: savedCats ? JSON.parse(savedCats) : null,
        },
      });
    } catch {
      // 忽略损坏数据
    }
  }, []);

  /* 持久化 */
  useEffect(() => {
    try { localStorage.setItem("zzdc_cart", JSON.stringify(state.cart)); } catch {}
  }, [state.cart]);
  useEffect(() => {
    try { localStorage.setItem("zzdc_orders", JSON.stringify(state.historyOrders)); } catch {}
  }, [state.historyOrders]);
  useEffect(() => {
    try { localStorage.setItem("zzdc_dishes", JSON.stringify(state.dishes)); } catch {}
  }, [state.dishes]);
  useEffect(() => {
    try { localStorage.setItem("zzdc_categories", JSON.stringify(state.categories)); } catch {}
  }, [state.categories]);

  /* ---------- 操作方法 ---------- */
  const addItem = useCallback((dish, specs) => {
    dispatch({ type: "ADD_ITEM", payload: { dish, specs } });
  }, []);
  const removeItem = useCallback((cartKey) => {
    dispatch({ type: "REMOVE_ITEM", payload: { cartKey } });
  }, []);
  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);
  const addOrder = useCallback((order) => {
    dispatch({ type: "ADD_ORDER", payload: { order } });
    const salesMap = {};
    order.items.forEach((item) => {
      salesMap[item.dish.id] = (salesMap[item.dish.id] || 0) + item.quantity;
    });
    dispatch({ type: "ADD_SALES_COUNT", payload: { salesMap } });
  }, []);
  const addDish = useCallback((dish) => {
    dispatch({ type: "ADD_DISH", payload: { dish } });
  }, []);
  const updateDish = useCallback((id, updates) => {
    dispatch({ type: "UPDATE_DISH", payload: { id, updates } });
  }, []);
  const deleteDish = useCallback((id) => {
    dispatch({ type: "DELETE_DISH", payload: { id } });
  }, []);
  const addCategory = useCallback((category) => {
    dispatch({ type: "ADD_CATEGORY", payload: { category } });
  }, []);
  const deleteCategory = useCallback((id) => {
    dispatch({ type: "DELETE_CATEGORY", payload: { id } });
  }, []);
  const syncCartFromRemote = useCallback((roomCart) => {
    dispatch({ type: "SYNC_CART", payload: { roomCart } });
  }, []);

  /* 计算购物车汇总 */
  const { totalPrice, totalCount, cartItems } = useCartTotals(state.cart);

  const value = {
    cart: state.cart,
    cartItems,
    totalPrice,
    totalCount,
    dishes: state.dishes,
    categories: state.categories,
    historyOrders: state.historyOrders,
    addItem,
    removeItem,
    clearCart,
    addOrder,
    addDish,
    updateDish,
    deleteDish,
    addCategory,
    deleteCategory,
    syncCartFromRemote,
    getItemUnitPrice: getCartItemUnitPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* ---------- Hook ---------- */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp 必须在 AppProvider 内部使用");
  }
  return context;
}

export default AppContext;