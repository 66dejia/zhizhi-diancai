import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from "react";
import { useCartTotals, getCartItemUnitPrice } from "../hooks/useCartPrice";
import { dishes as initialDishes, defaultCategories } from "../data/dishes";

const AppContext = createContext(null);

export const makeCartKey = (dishId, specs) => {
  const s = specs ? Object.entries(specs).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}:${v}`).join("|") : "";
  return s ? `${dishId}__${s}` : `${dishId}__default`;
};

const nid = a => Math.max(0, ...a.map(d => d.id)) + 1;

const init = { cart: {}, historyOrders: [], dishes: initialDishes, categories: defaultCategories };

function reducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { dish, specs } = action.payload;
      const key = makeCartKey(dish.id, specs);
      const ex = state.cart[key];
      return { ...state, cart: { ...state.cart, [key]: ex ? { ...ex, quantity: ex.quantity + 1 } : { dish, quantity: 1, specs, cartKey: key } } };
    }
    case "REMOVE_ITEM": {
      const { cartKey } = action.payload;
      const ex = state.cart[cartKey];
      if (!ex) return state;
      const q = ex.quantity - 1;
      if (q <= 0) { const c = { ...state.cart }; delete c[cartKey]; return { ...state, cart: c }; }
      return { ...state, cart: { ...state.cart, [cartKey]: { ...ex, quantity: q } } };
    }
    case "CLEAR_CART": return { ...state, cart: {} };
    case "SYNC_CART": {
      const { roomCart } = action.payload;
      const nc = {};
      Object.entries(roomCart || {}).forEach(([, data]) => {
        (data.items || []).forEach(item => {
          const key = makeCartKey(item.dish.id, item.specs || null);
          if (nc[key]) nc[key].quantity += item.quantity;
          else nc[key] = { dish: item.dish, quantity: item.quantity, specs: item.specs || null, cartKey: key };
        });
      });
      return { ...state, cart: nc };
    }
    case "ADD_ORDER": return { ...state, historyOrders: [action.payload.order, ...state.historyOrders] };
    case "ADD_DISH": return { ...state, dishes: [...state.dishes, { ...action.payload.dish, id: nid(state.dishes), monthlySales: 0 }] };
    case "UPDATE_DISH": { const { id, updates } = action.payload; return { ...state, dishes: state.dishes.map(d => d.id === id ? { ...d, ...updates } : d) }; }
    case "DELETE_DISH": return { ...state, dishes: state.dishes.filter(d => d.id !== action.payload.id) };
    case "ADD_SALES_COUNT": { const sm = action.payload.salesMap; return { ...state, dishes: state.dishes.map(d => ({ ...d, monthlySales: d.monthlySales + (sm[d.id] || 0) })) }; }
    case "ADD_CATEGORY": { const c = action.payload.category; if (state.categories.find(x => x.id === c.id)) return state; return { ...state, categories: [...state.categories, c] }; }
    case "DELETE_CATEGORY": return { ...state, categories: state.categories.filter(x => x.id !== action.payload.id) };
    case "LOAD_FROM_STORAGE": { const { cart, historyOrders, dishes, categories } = action.payload; return { ...state, cart: cart || {}, historyOrders: historyOrders || [], dishes: dishes?.length > 0 ? dishes : state.dishes, categories: categories?.length > 0 ? categories : state.categories }; }
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  /* 从 localStorage 恢复 */
  useEffect(() => {
    try {
      const ca = localStorage.getItem("zzdc_cart"), ho = localStorage.getItem("zzdc_orders"), di = localStorage.getItem("zzdc_dishes"), ct = localStorage.getItem("zzdc_categories");
      dispatch({ type: "LOAD_FROM_STORAGE", payload: { cart: ca ? JSON.parse(ca) : {}, historyOrders: ho ? JSON.parse(ho) : [], dishes: di ? JSON.parse(di) : null, categories: ct ? JSON.parse(ct) : null } });
    } catch {}
  }, []);

  /* 持久化到 localStorage */
  useEffect(() => { try { localStorage.setItem("zzdc_cart", JSON.stringify(state.cart)); } catch {} }, [state.cart]);
  useEffect(() => { try { localStorage.setItem("zzdc_orders", JSON.stringify(state.historyOrders)); } catch {} }, [state.historyOrders]);
  useEffect(() => { try { localStorage.setItem("zzdc_dishes", JSON.stringify(state.dishes)); } catch {} }, [state.dishes]);
  useEffect(() => { try { localStorage.setItem("zzdc_categories", JSON.stringify(state.categories)); } catch {} }, [state.categories]);

  /* ── ★ 核心：WebSocket 发送回调 ── */
  const wsSendFn = useRef(null);
  const registerWsSender = useCallback(fn => { wsSendFn.current = fn; }, []);

  /* 本地操作增加后，通过 ref 触发 WebSocket 同步（无 useEffect 依赖） */
  const addItem = useCallback((dish, specs) => {
    dispatch({ type: "ADD_ITEM", payload: { dish, specs } });
  }, []);
  const removeItem = useCallback((cartKey) => {
    dispatch({ type: "REMOVE_ITEM", payload: { cartKey } });
  }, []);
  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  /* 从远程同步（SYNC_CART 不触发 WebSocket 发送） */
  const syncingRef = useRef(false);
  const syncCartFromRemote = useCallback((roomCart) => {
    syncingRef.current = true;
    dispatch({ type: "SYNC_CART", payload: { roomCart } });
    syncingRef.current = false;
  }, []);

  /* 当 cart 变化时（且不是远程同步导致），把 cartItems 发送到 WebSocket */
  const { totalPrice, totalCount, cartItems } = useCartTotals(state.cart);
  useEffect(() => {
    if (!syncingRef.current && wsSendFn.current) {
      wsSendFn.current();
    }
  }, [state.cart]);

  const addOrder = useCallback(o => { dispatch({ type: "ADD_ORDER", payload: { order: o } }); const sm = {}; o.items.forEach(i => { sm[i.dish.id] = (sm[i.dish.id] || 0) + i.quantity; }); dispatch({ type: "ADD_SALES_COUNT", payload: { salesMap: sm } }); }, []);
  const addDish = useCallback(d => dispatch({ type: "ADD_DISH", payload: { dish: d } }), []);
  const updateDish = useCallback((id, u) => dispatch({ type: "UPDATE_DISH", payload: { id, updates: u } }), []);
  const deleteDish = useCallback(id => dispatch({ type: "DELETE_DISH", payload: { id } }), []);
  const addCategory = useCallback(c => dispatch({ type: "ADD_CATEGORY", payload: { category: c } }), []);
  const deleteCategory = useCallback(id => dispatch({ type: "DELETE_CATEGORY", payload: { id } }), []);

  const value = {
    cart: state.cart, cartItems, totalPrice, totalCount,
    dishes: state.dishes, categories: state.categories, historyOrders: state.historyOrders,
    addItem, removeItem, clearCart, addOrder, addDish, updateDish, deleteDish, addCategory, deleteCategory,
    registerWsSender, syncCartFromRemote,
    getItemUnitPrice: getCartItemUnitPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { const ctx = useContext(AppContext); if (!ctx) throw new Error("useApp inside <AppProvider>"); return ctx; }
export default AppContext;