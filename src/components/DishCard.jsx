/**
 * 菜品卡片 - 横向布局 | 纯净 Unsplash 图片
 */
import { useRef } from "react";
import { useApp, makeCartKey } from "../store/AppContext";

export default function DishCard({ dish, onOpenSpec, onEdit }) {
  const { cart, addItem, removeItem } = useApp();
  const quantityRef = useRef(null);

  const defaultKey = makeCartKey(dish.id, null);
  const cartItem = cart[defaultKey];
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => { e.stopPropagation(); dish.specs&&dish.specs.length>0?onOpenSpec(dish):addItem(dish,null); };
  const handleRemove = (e) => { e.stopPropagation(); if(quantity>0)removeItem(defaultKey); };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex items-stretch active:scale-[0.99] overflow-hidden">
      <div className="w-24 sm:w-28 flex-shrink-0 bg-gray-100">
        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">{dish.name}</h3>
          <button onClick={(e)=>{e.stopPropagation();onEdit&&onEdit(dish);}} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 flex-shrink-0 transition-colors" title="编辑">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
        </div>
        {dish.tags.length>0 && <div className="flex items-center gap-1 mt-0.5">{dish.tags.map(tag=><span key={tag} className="px-1.5 py-0 text-[10px] rounded-full bg-gray-100 text-gray-500">{tag}</span>)}</div>}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
          {dish.monthlySales>0?<span>月售 {dish.monthlySales}</span>:<span className="text-green-500 font-medium">新品</span>}
          {dish.rating>0?<span className="flex items-center gap-0.5"><svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>{dish.rating}</span>:<span className="text-gray-300 text-[10px]">暂无评价</span>}
        </div>
        <div className="flex items-center justify-end mt-1">
          <div className="flex items-center gap-2">
            {quantity>0&&<><button onClick={handleRemove} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary active:scale-90 transition-all"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2.5} d="M20 12H4"/></svg></button><span ref={quantityRef} key={quantity} className="text-base font-semibold text-gray-700 w-5 text-center animate-pop">{quantity}</span></>}
            <button onClick={handleAdd} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark active:scale-90 transition-all shadow-sm"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
}