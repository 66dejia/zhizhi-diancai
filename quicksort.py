# 快速排序算法实现
# 快速排序是一种分治算法，通过选择一个基准元素将数组分为两部分，
# 左边部分小于基准，右边部分大于基准，然后递归排序两部分。


def quicksort(arr):
    """
    快速排序主函数
    参数:
        arr: 待排序的列表
    返回:
        排序后的新列表
    """
    # 基线条件：如果数组长度小于等于1，直接返回（已经有序）
    if len(arr) <= 1:
        return arr

    # 选择基准元素（pivot），这里取数组中间位置的元素
    pivot = arr[len(arr) // 2]

    # 将数组分为三部分：
    # left:  小于基准的元素
    # middle: 等于基准的元素（处理重复元素）
    # right: 大于基准的元素
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    # 递归排序左右两部分，然后合并结果
    return quicksort(left) + middle + quicksort(right)


def quicksort_inplace(arr, low=0, high=None):
    """
    原地快速排序（不创建新列表，直接在原数组上排序）
    参数:
        arr:  待排序的列表
        low:  当前排序区间的起始索引
        high: 当前排序区间的结束索引
    """
    # 首次调用时，high 默认为数组最后一个元素的索引
    if high is None:
        high = len(arr) - 1

    # 递归终止条件：区间长度小于等于0
    if low >= high:
        return

    # 执行分区操作，返回基准元素的最终位置
    pivot_index = _partition(arr, low, high)

    # 递归排序基准元素左边的子数组
    quicksort_inplace(arr, low, pivot_index - 1)

    # 递归排序基准元素右边的子数组
    quicksort_inplace(arr, pivot_index + 1, high)


def _partition(arr, low, high):
    """
    分区函数（Lomuto 分区方案）
    选择最右边的元素作为基准，将小于基准的元素移到左边
    参数:
        arr:  待分区的列表
        low:  分区起始索引
        high: 分区结束索引（基准元素所在位置）
    返回:
        基准元素最终所在的索引位置
    """
    # 选择最右边的元素作为基准
    pivot = arr[high]

    # i 指向小于基准的最后一个元素的位置
    i = low - 1

    # 遍历区间内的所有元素（不包含基准本身）
    for j in range(low, high):
        # 如果当前元素小于等于基准
        if arr[j] <= pivot:
            i += 1
            # 将当前元素交换到小于基准的区域
            arr[i], arr[j] = arr[j], arr[i]

    # 将基准元素放到正确的位置（i + 1）
    arr[i + 1], arr[high] = arr[high], arr[i + 1]

    # 返回基准元素的最终位置
    return i + 1


# ========== 测试代码 ==========
if __name__ == "__main__":
    # 测试数据
    test_arr1 = [3, 6, 8, 10, 1, 2, 1]
    test_arr2 = [5, 2, 9, 1, 5, 6]
    test_arr3 = [1]                # 单元素
    test_arr4 = []                 # 空数组
    test_arr5 = [4, 4, 4, 4]      # 全部相同

    print("========== 新建列表版快速排序 ==========")
    print(f"排序前: {test_arr1}")
    print(f"排序后: {quicksort(test_arr1)}")

    print(f"\n空数组测试: {test_arr4} -> {quicksort(test_arr4)}")
    print(f"单元素测试: {test_arr3} -> {quicksort(test_arr3)}")
    print(f"全相同测试: {test_arr5} -> {quicksort(test_arr5)}")

    print("\n========== 原地版快速排序 ==========")
    print(f"排序前: {test_arr2}")
    quicksort_inplace(test_arr2)
    print(f"排序后: {test_arr2}")