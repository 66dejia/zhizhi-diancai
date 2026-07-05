const defaultMenuItems = [
  {
    id: 'm1',
    name: '招牌番茄意面',
    category: '主食',
    price: 38,
    description: '浓郁番茄酱配香草，入口鲜香。'
  },
  {
    id: 'm2',
    name: '黑椒牛排饭',
    category: '主食',
    price: 58,
    description: '嫩牛排搭配香脆薯条和酱汁。'
  },
  {
    id: 'm3',
    name: '芝士鸡肉卷',
    category: '小食',
    price: 24,
    description: '金黄酥脆，芝士香气十足。'
  },
  {
    id: 'm4',
    name: '脆皮炸虾',
    category: '小食',
    price: 26,
    description: '外酥里嫩，配特制蘸酱。'
  },
  {
    id: 'm5',
    name: '柠檬气泡水',
    category: '饮品',
    price: 12,
    description: '清爽酸甜，适合搭配重口味。'
  },
  {
    id: 'm6',
    name: '抹茶奶昔',
    category: '饮品',
    price: 16,
    description: '细腻奶香与抹茶风味融合。'
  },
  {
    id: 'm7',
    name: '提拉米苏',
    category: '甜品',
    price: 18,
    description: '轻柔奶香，口感绵密。'
  },
  {
    id: 'm8',
    name: '巧克力布朗尼',
    category: '甜品',
    price: 15,
    description: '浓郁巧克力，表面微焦。'
  },
  {
    id: 'm9',
    name: '宫保鸡丁',
    category: '热菜',
    price: 32,
    description: '酸甜微辣，口感层次丰富。'
  },
  {
    id: 'm10',
    name: '香煎带鱼',
    category: '热菜',
    price: 42,
    description: '鱼肉鲜嫩，搭配柠檬香草。'
  },
  {
    id: 'm11',
    name: '海盐蘑菇汤',
    category: '汤品',
    price: 20,
    description: '暖胃鲜香，适合搭配主菜。'
  },
  {
    id: 'm12',
    name: '冰镇西柚茶',
    category: '饮品',
    price: 14,
    description: '香气清澈，带一点微微苦甜。'
  }
];

const CHANNEL_NAME = 'shared-order-channel';
const cloneMenuItems = (items) => items.map((item) => ({ ...item }));
const state = {
  tableNumber: '888',
  activeCategory: '全部',
  items: [],
  menuItems: cloneMenuItems(defaultMenuItems),
  updatedAt: Date.now(),
  clientId: createClientId()
};

let channel;

function createClientId() {
  return window.crypto?.randomUUID?.() || `client-${Math.random().toString(36).slice(2, 10)}`;
}

function getStorageKey(table) {
  return `shared-order:${table}`;
}

function loadStateForTable(table) {
  const saved = localStorage.getItem(getStorageKey(table));
  if (!saved) {
    return {
      tableNumber: table,
      activeCategory: '全部',
      items: [],
      menuItems: cloneMenuItems(defaultMenuItems),
      updatedAt: Date.now()
    };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      tableNumber: table,
      activeCategory: parsed.activeCategory || '全部',
      items: Array.isArray(parsed.items) ? parsed.items : [],
      menuItems: Array.isArray(parsed.menuItems) && parsed.menuItems.length
        ? cloneMenuItems(parsed.menuItems)
        : cloneMenuItems(defaultMenuItems),
      updatedAt: parsed.updatedAt || Date.now()
    };
  } catch (error) {
    console.warn('读取本地点餐数据失败', error);
    return {
      tableNumber: table,
      activeCategory: '全部',
      items: [],
      menuItems: cloneMenuItems(defaultMenuItems),
      updatedAt: Date.now()
    };
  }
}

function persistState() {
  state.updatedAt = Date.now();
  localStorage.setItem(getStorageKey(state.tableNumber), JSON.stringify({
    tableNumber: state.tableNumber,
    activeCategory: state.activeCategory,
    items: state.items,
    menuItems: cloneMenuItems(state.menuItems),
    updatedAt: state.updatedAt
  }));
  broadcastState();
}

function broadcastState() {
  if (!channel) return;
  channel.postMessage({
    type: 'state-sync',
    payload: {
      ...state,
      clientId: state.clientId
    }
  });
}

function setStatus(message) {
  document.getElementById('statusMessage').textContent = message;
}

function getItemById(itemId) {
  return state.items.find((entry) => entry.id === itemId);
}

function addItem(itemId) {
  const menuItem = state.menuItems.find((item) => item.id === itemId);
  if (!menuItem) return;

  const existing = getItemById(itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.items.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      qty: 1
    });
  }

  persistState();
  render();
  setStatus(`已加入 ${menuItem.name}`);
}

function addCustomMenuItem() {
  const nameInput = document.getElementById('customName');
  const priceInput = document.getElementById('customPrice');
  const categoryInput = document.getElementById('customCategory');
  const descriptionInput = document.getElementById('customDescription');

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const category = categoryInput.value.trim() || '自定义';
  const description = descriptionInput.value.trim() || '由你亲自加入的特色菜。';

  if (!name || !Number.isFinite(price) || price <= 0) {
    setStatus('请填写正确的菜名和价格');
    return;
  }

  const newItem = {
    id: `custom-${Date.now()}`,
    name,
    category,
    price: Math.round(price),
    description
  };

  state.menuItems.unshift(newItem);
  state.activeCategory = category;
  nameInput.value = '';
  priceInput.value = '20';
  categoryInput.value = '自定义';
  descriptionInput.value = '';

  persistState();
  render();
  setStatus(`已添加 ${name}，价格为 ¥${newItem.price}`);
}

function updateMenuPrice(itemId, value) {
  const item = state.menuItems.find((entry) => entry.id === itemId);
  if (!item) return;
  const nextPrice = Number(value);
  if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
    setStatus('价格必须是大于 0 的整数');
    return;
  }
  item.price = Math.round(nextPrice);
  persistState();
  render();
  setStatus(`已更新 ${item.name} 的价格为 ¥${item.price}`);
}

function decreaseItem(itemId) {
  const existing = getItemById(itemId);
  if (!existing) return;

  existing.qty -= 1;
  if (existing.qty <= 0) {
    state.items = state.items.filter((entry) => entry.id !== itemId);
  }

  persistState();
  render();
  setStatus('已调整购物车');
}

function renderCategories() {
  const categories = ['全部', ...new Set(state.menuItems.map((item) => item.category))];
  const categoryBar = document.getElementById('categoryBar');
  categoryBar.innerHTML = categories
    .map((category) => {
      const active = category === state.activeCategory;
      return `
        <button
          class="rounded-full px-3 py-2 text-sm transition ${active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"
          data-category="${category}"
        >
          ${category}
        </button>
      `;
    })
    .join('');
}

function renderMenu() {
  const menuList = document.getElementById('menuList');
  const filtered = state.activeCategory === '全部'
    ? state.menuItems
    : state.menuItems.filter((item) => item.category === state.activeCategory);

  menuList.innerHTML = filtered
    .map((item) => `
      <article class="rounded-2xl border border-white/10 bg-slate-800/80 p-3">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <p class="text-sm text-emerald-300">${item.category}</p>
            <h3 class="mt-1 font-semibold text-white">${item.name}</h3>
            <p class="mt-1 text-sm text-slate-400">${item.description}</p>
          </div>
          <div class="text-right">
            <label class="block text-xs text-slate-400">价格</label>
            <input
              type="number"
              min="1"
              step="1"
              value="${item.price}"
              class="mt-1 w-20 rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-sm text-white outline-none"
              data-action="update-price"
              data-id="${item.id}"
            />
            <button
              class="mt-2 rounded-full bg-emerald-500 px-3 py-1 text-sm font-medium text-white"
              data-action="add"
              data-id="${item.id}"
            >
              + 加入
            </button>
          </div>
        </div>
      </article>
    `)
    .join('');
}

function renderCart() {
  const cartList = document.getElementById('cartList');
  const totalCount = document.getElementById('totalCount');
  const subtotal = document.getElementById('subtotal');

  if (!state.items.length) {
    cartList.innerHTML = `
      <div class="rounded-2xl border border-dashed border-white/10 bg-slate-800/70 p-4 text-center text-sm text-slate-400">
        当前桌号还没有点餐，快来选一道喜欢的吧。
      </div>
    `;
    totalCount.textContent = '0';
    subtotal.textContent = '¥0';
    return;
  }

  const count = state.items.reduce((sum, item) => sum + item.qty, 0);
  const total = state.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  totalCount.textContent = count;
  subtotal.textContent = `¥${total}`;

  cartList.innerHTML = state.items
    .map((item) => `
      <div class="rounded-2xl border border-white/10 bg-slate-800/80 p-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-medium text-white">${item.name}</p>
            <p class="mt-1 text-sm text-slate-400">¥${item.price} / 份</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-emerald-300">x${item.qty}</p>
            <div class="mt-2 flex items-center gap-2">
              <button class="rounded-full border border-white/10 px-2 py-1 text-sm" data-action="decrease" data-id="${item.id}">-</button>
              <button class="rounded-full border border-white/10 px-2 py-1 text-sm" data-action="increase" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `)
    .join('');
}

function renderOrderSummary() {
  const orderSummary = document.getElementById('orderSummary');
  if (!state.items.length) {
    orderSummary.innerHTML = '<p class="text-slate-500">还没有点菜内容</p>';
    return;
  }

  orderSummary.innerHTML = state.items
    .map((item) => `
      <div class="flex items-center justify-between rounded-xl bg-slate-800/70 px-2 py-2">
        <span>${item.name} × ${item.qty}</span>
        <span class="text-emerald-300">¥${item.price * item.qty}</span>
      </div>
    `)
    .join('');
}

function render() {
  renderCategories();
  renderMenu();
  renderCart();
  renderOrderSummary();
}

function switchTable(table) {
  const nextTable = (table || '888').trim() || '888';
  state.tableNumber = nextTable;
  state.activeCategory = '全部';
  const restored = loadStateForTable(nextTable);
  state.items = restored.items;
  state.menuItems = restored.menuItems;
  state.activeCategory = restored.activeCategory || '全部';
  state.updatedAt = restored.updatedAt || Date.now();
  document.getElementById('tableNumber').value = nextTable;
  render();
  setStatus(`已切换到桌号 ${nextTable}`);
  persistState();
}

function handleBroadcast(event) {
  const { type, payload } = event.data || {};
  if (type !== 'state-sync' || !payload || payload.clientId === state.clientId) return;
  if (payload.tableNumber !== state.tableNumber) return;
  if (!payload.updatedAt || payload.updatedAt < state.updatedAt) return;

  state.activeCategory = payload.activeCategory || '全部';
  state.items = payload.items || [];
  state.menuItems = Array.isArray(payload.menuItems) && payload.menuItems.length
    ? cloneMenuItems(payload.menuItems)
    : cloneMenuItems(defaultMenuItems);
  state.updatedAt = payload.updatedAt;
  render();
  setStatus(`已同步桌号 ${payload.tableNumber} 的点餐内容`);
}

function init() {
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.addEventListener('message', handleBroadcast);

  document.getElementById('tableNumber').addEventListener('change', (event) => {
    switchTable(event.target.value);
  });

  document.getElementById('categoryBar').addEventListener('click', (event) => {
    const target = event.target.closest('[data-category]');
    if (!target) return;
    state.activeCategory = target.dataset.category;
    persistState();
    render();
  });

  document.getElementById('menuList').addEventListener('click', (event) => {
    const target = event.target.closest('[data-action="add"][data-id]');
    if (!target) return;
    addItem(target.dataset.id);
  });

  document.getElementById('menuList').addEventListener('change', (event) => {
    const target = event.target.closest('[data-action="update-price"][data-id]');
    if (!target) return;
    updateMenuPrice(target.dataset.id, target.value);
  });

  document.getElementById('cartList').addEventListener('click', (event) => {
    const target = event.target.closest('[data-action][data-id]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'increase') {
      addItem(target.dataset.id);
    } else if (action === 'decrease') {
      decreaseItem(target.dataset.id);
    }
  });

  document.getElementById('clearCartBtn').addEventListener('click', () => {
    state.items = [];
    persistState();
    render();
    setStatus('购物车已清空');
  });

  document.getElementById('orderBtn').addEventListener('click', () => {
    if (!state.items.length) {
      setStatus('请先选择菜品后再下单');
      return;
    }

    const summary = state.items.map((item) => `${item.name}×${item.qty}`).join('，');
    setStatus(`已为桌号 ${state.tableNumber} 下单：${summary}`);
    state.items = [];
    persistState();
    render();
  });

  document.getElementById('addCustomItemBtn').addEventListener('click', addCustomMenuItem);

  switchTable(state.tableNumber);
}

init();
