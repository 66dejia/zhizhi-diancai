/** 编辑菜品弹窗（无价格） */
import { useState } from "react";
import { useApp } from "../store/AppContext";
import { specOptions } from "../data/dishes";

export default function EditDishModal({ dish, onClose }) {
  const { updateDish, deleteDish, categories } = useApp();
  const [name, setName] = useState(dish.name);
  const [category, setCategory] = useState(dish.category);
  const [image, setImage] = useState(dish.image);
  const [rating, setRating] = useState(String(dish.rating));
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([...dish.tags]);
  const [selectedSpecs, setSelectedSpecs] = useState([...(dish.specs || [])]);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); }
    setTagInput("");
  };

  const handleRemoveTag = (tag) => { setTags(tags.filter((t) => t !== tag)); };

  const handleToggleSpec = (specKey) => {
    setSelectedSpecs((prev) =>
      prev.includes(specKey) ? prev.filter((s) => s !== specKey) : [...prev, specKey]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    updateDish(dish.id, {
      name: name.trim(), category, price: 0, image: image.trim(),
      rating: parseFloat(rating) || 0, tags, specs: selectedSpecs,
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`确定要删除「${dish.name}」吗？此操作不可撤销。`)) {
      deleteDish(dish.id); onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />
      <div className="relative bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 text-lg">✏️ 编辑菜品</h3>
            <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 underline" title="删除菜品">删除</button>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">菜品名称 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">分类</label>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setCategory(cat.id)} className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${category === cat.id ? "border-primary bg-primary-light text-primary font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>{cat.icon} {cat.name}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">好评率</label>
            <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} min="0" max="5" step="0.1" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">图片 URL</label>
            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            {image && <img src={image} alt="预览" className="mt-2 w-24 h-18 object-cover rounded-lg border" onError={(e) => { e.target.style.display = "none"; }} />}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">标签</label>
            <div className="flex gap-1 mb-2">
              <input type="text" placeholder="输入标签后回车" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              <button onClick={handleAddTag} className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">添加</button>
            </div>
            {tags.length > 0 && <div className="flex flex-wrap gap-1">{tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full">{tag}<button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">&times;</button></span>)}</div>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">可选规格</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(specOptions).map(([key, opt]) => (
                <button key={key} onClick={() => handleToggleSpec(key)} className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${selectedSpecs.includes(key) ? "border-primary bg-primary-light text-primary font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>{opt.name}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all">取消</button>
          <button onClick={handleSave} disabled={!name.trim()} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${name.trim() ? "bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>保存修改</button>
        </div>
      </div>
    </div>
  );
}