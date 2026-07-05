/**
 * 搜索与排序栏组件
 * 支持关键词搜索菜品，支持按价格和销量排序
 */
export default function SearchSortBar({
  keyword,
  onKeywordChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="px-3 py-2 bg-white border-b border-gray-100 sticky top-0 z-10">
      {/* 搜索框 */}
      <div className="relative mb-2">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="搜索菜品..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg 
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary 
                     placeholder-gray-400 transition-colors"
        />
        {/* 清除按钮 */}
        {keyword && (
          <button
            onClick={() => onKeywordChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 排序按钮组 */}
      <div className="flex gap-2">
        {[
          { key: "default", label: "综合排序" },
          { key: "sales", label: "销量优先" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => onSortChange(item.key)}
            className={`px-2.5 py-1 text-xs rounded-full transition-all duration-200
              ${
                sortBy === item.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}