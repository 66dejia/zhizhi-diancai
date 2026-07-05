/**
 * 添加菜品弹窗
 * 用户可自定义菜品名称、分类、价格、图片 URL、标签、规格选项
 */
import { useState } from "react";
import { useApp } from "../store/AppContext";
import { specOptions } from "../data/dishes";

// 默认占位图
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

export default function AddDishModal({ onClose }) {
  const { addDish, categories } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]?.id || "");
  const [image, setImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState([]);

  /** 添加标签 */
  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  /** 删除标签 */
  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  /** 切换规格选项 */
  const handleToggleSpec = (specKey) => {
    setSelectedSpecs((prev) =>
      prev.includes(specKey)
        ? prev.filter((s) => s !== specKey)
        : [...prev, specKey]
    );
  };

  /** 提交 */
  const handleSubmit = () => {
    if (!name.trim()) return;
    addDish({
      name: name.trim(),
      category,
      price: 0,
      image: image.trim() || DEFAULT_IMAGE,
      tags,
      specs: selectedSpecs,
      rating: 0,
      monthlySales: 0,
    });
    onClose();
  };

  const canSubmit = name.trim() !== "";

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />
      <div
        className="relative bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl shadow-xl
                     max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-800 text-lg">➕ 添加菜品</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center
                       text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 菜品名称 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">菜品名称 *</label>
            <input
              type="text"
              placeholder="如：红烧排骨"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">分类</label>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all
                    ${category === cat.id
                      ? "border-primary bg-primary-light text-primary font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>


          {/* 图片 URL */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              图片 URL <span className="text-gray-400 font-normal">（可选）</span>
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {image && (
              <img
                src={image}
                alt="预览"
                className="mt-2 w-24 h-18 object-cover rounded-lg border"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
          </div>

          {/* 标签 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">标签</label>
            <div className="flex gap-1 mb-2">
              <input
                type="text"
                placeholder="输入标签后回车"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                添加
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full"
                  >
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 规格选项 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">可选规格</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(specOptions).map(([key, opt]) => (
                <button
                  key={key}
                  onClick={() => handleToggleSpec(key)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all
                    ${selectedSpecs.includes(key)
                      ? "border-primary bg-primary-light text-primary font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all
              ${canSubmit
                ? "bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            确认添加
          </button>
        </div>
      </div>
    </div>
  );
}