/**
 * 点菜主页组件
 */
import { useState, useMemo, useEffect } from "react";
import { useApp } from "../store/AppContext";
import CategoryNav from "../components/CategoryNav";
import DishCard from "../components/DishCard";
import SearchSortBar from "../components/SearchSortBar";
import SpecModal from "../components/SpecModal";
import CartBar from "../components/CartBar";
import AddDishModal from "../components/AddDishModal";
import EditDishModal from "../components/EditDishModal";
import { DishCardSkeleton } from "../components/Skeleton";

export default function MenuPage({ onCheckout, syncOrder, syncClearCart }) {
  const { dishes } = useApp();
  const [activeCategory, setActiveCategory] = useState("meat");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [specDish, setSpecDish] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editDish, setEditDish] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredDishes = useMemo(() => {
    let result = dishes.filter((dish) => dish.category === activeCategory);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (dish) =>
          dish.name.toLowerCase().includes(kw) ||
          dish.tags.some((tag) => tag.toLowerCase().includes(kw))
      );
    }
    switch (sortBy) {
      case "price-asc": result = [...result].sort((a, b) => a.price - b.price); break;
      case "price-desc": result = [...result].sort((a, b) => b.price - a.price); break;
      case "sales": result = [...result].sort((a, b) => b.monthlySales - a.monthlySales); break;
      default: break;
    }
    return result;
  }, [activeCategory, keyword, sortBy, dishes]);

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={(catId) => { setActiveCategory(catId); setKeyword(""); setSortBy("default"); }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white">
          <SearchSortBar keyword={keyword} onKeywordChange={setKeyword} sortBy={sortBy} onSortChange={setSortBy} />
          <div className="px-3 pb-2">
            <button onClick={() => setShowAddModal(true)} className="w-full py-1.5 text-sm text-primary border border-dashed border-primary rounded-lg hover:bg-primary-light active:scale-[0.98] transition-all flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              添加自定义菜品
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-24 px-2.5 pt-1">
          {loading ? (
            <div className="flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => (<DishCardSkeleton key={i} />))}</div>
          ) : filteredDishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-20 h-20 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p className="text-sm">没有找到相关菜品</p><p className="text-xs mt-1">试试其他关键词或上方添加~</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 animate-fade-in">
              {filteredDishes.map((dish) => (<DishCard key={dish.id} dish={dish} onOpenSpec={setSpecDish} onEdit={setEditDish} />))}
            </div>
          )}
        </div>
      </div>
      <CartBar onCheckout={onCheckout} />
      {specDish && <SpecModal dish={specDish} onClose={() => setSpecDish(null)} />}
      {showAddModal && <AddDishModal onClose={() => setShowAddModal(false)} />}
      {editDish && <EditDishModal dish={editDish} onClose={() => setEditDish(null)} />}
    </div>
  );
}