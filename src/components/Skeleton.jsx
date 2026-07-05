/**
 * 骨架屏组件
 * 用于列表加载时展示占位动效，提升加载感知体验
 */

/** 单个菜品卡片的骨架屏 - 单列横向布局 */
export function DishCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm animate-pulse flex items-center gap-3 p-3">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="flex gap-1 mb-2">
          <div className="h-3 bg-gray-200 rounded w-10" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-7 w-7 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** 购物车条目骨架屏 */
export function CartItemSkeleton() {
  return (
    <div className="flex items-center py-3 px-4 animate-pulse">
      <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0 mr-3" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-12 ml-auto" />
    </div>
  );
}

export default DishCardSkeleton;