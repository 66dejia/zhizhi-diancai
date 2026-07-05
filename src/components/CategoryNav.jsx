/** 左侧分类导航 - 纯净文本版 */
import { useState } from "react";
import { useApp } from "../store/AppContext";

const defaultIds = ["meat","veg","cold","soup","staple","drink","seafood","snack"];

export default function CategoryNav({ activeCategory, onSelectCategory }) {
  const { categories, addCategory, deleteCategory } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const id = "cat_" + Date.now().toString(36);
    addCategory({ id, name, icon: "" });
    setNewName(""); setShowAdd(false);
  };

  return (
    <nav className="w-20 sm:w-24 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto flex flex-col">
      <ul className="py-1 flex-1">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategory;
          return (
            <li key={cat.id} className="relative group">
              <button onClick={() => onSelectCategory(cat.id)}
                className={`w-full py-3 px-1 text-center transition-all duration-200 text-xs
                  ${isActive ? "bg-primary-light text-primary font-semibold border-r-[3px] border-primary" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
                {cat.name}
              </button>
              {!defaultIds.includes(cat.id) && (
                <button onClick={(e)=>{e.stopPropagation();if(window.confirm(`删除分类「${cat.name}」？`)){deleteCategory(cat.id);if(activeCategory===cat.id)onSelectCategory("meat");}}}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-100 text-red-400 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all" title="删除">x</button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="border-t border-gray-100 p-2">
        {showAdd ? (
          <div className="flex flex-col gap-1">
            <input type="text" placeholder="分类名" value={newName} onChange={(e)=>setNewName(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")handleAdd();}}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-primary" autoFocus />
            <div className="flex gap-1">
              <button onClick={handleAdd} className="flex-1 py-1 text-xs bg-primary text-white rounded">确定</button>
              <button onClick={()=>setShowAdd(false)} className="flex-1 py-1 text-xs bg-gray-100 rounded">取消</button>
            </div>
          </div>
        ) : (
          <button onClick={()=>setShowAdd(true)} className="w-full py-1 text-xs text-primary border border-dashed border-gray-300 rounded hover:bg-primary-light transition-colors">+ 分类</button>
        )}
      </div>
    </nav>
  );
}