/**
 * 菜品数据 - 70道家常菜 + 分类 Emoji
 */

export const defaultCategories = [
  { id: "meat", name: "荤菜", icon: "🍖" },
  { id: "veg", name: "素菜", icon: "🥬" },
  { id: "cold", name: "凉菜", icon: "🥒" },
  { id: "soup", name: "汤羹", icon: "🍲" },
  { id: "staple", name: "主食", icon: "🍚" },
  { id: "drink", name: "饮品", icon: "🥤" },
  { id: "seafood", name: "海鲜", icon: "🐟" },
  { id: "snack", name: "小吃", icon: "🥟" },
];

export const specOptions = {
  spiciness: { name: "辣度", choices: [{label:"不辣"},{label:"微辣"},{label:"中辣"},{label:"特辣"}] },
  size: { name: "份量", choices: [{label:"小份"},{label:"标准"},{label:"大份"}] },
  temperature: { name: "温度", choices: [{label:"常温"},{label:"冰镇"},{label:"热饮"}] },
};

const pic = (kw) => `https://source.unsplash.com/400x300/?${kw}&auto=format&fit=crop&q=80`;

export const dishes = [
  // 荤菜 16
  { id:1, name:"红烧肉",       category:"meat", emoji:"🍖", image:pic("braised-pork-belly,chinese"),           price:0,monthlySales:0,rating:0,tags:["招牌","下饭"],specs:["size"] },
  { id:2, name:"鱼香肉丝",     category:"meat", emoji:"🥩", image:pic("shredded-pork-stir-fry,chinese-dish"),  price:0,monthlySales:0,rating:0,tags:["经典"],specs:["spiciness","size"] },
  { id:3, name:"宫保鸡丁",     category:"meat", emoji:"🍗", image:pic("kung-pao-chicken,chinese-food"),        price:0,monthlySales:0,rating:0,tags:["人气","辣"],specs:["spiciness","size"] },
  { id:4, name:"回锅肉",       category:"meat", emoji:"🥓", image:pic("twice-cooked-pork,sichuan"),            price:0,monthlySales:0,rating:0,tags:["川味"],specs:["spiciness","size"] },
  { id:5, name:"糖醋排骨",     category:"meat", emoji:"🦴", image:pic("sweet-sour-ribs,chinese"),              price:0,monthlySales:0,rating:0,tags:["酸甜","招牌"],specs:["size"] },
  { id:6, name:"红烧排骨",     category:"meat", emoji:"🍖", image:pic("braised-spare-ribs,chinese-meat"),      price:0,monthlySales:0,rating:0,tags:["下饭"],specs:["size"] },
  { id:7, name:"红烧牛肉",     category:"meat", emoji:"🥩", image:pic("braised-beef-stew,chinese-cuisine"),    price:0,monthlySales:0,rating:0,tags:["硬菜"],specs:["spiciness","size"] },
  { id:8, name:"可乐鸡翅",     category:"meat", emoji:"🍗", image:pic("chicken-wings,glazed,cola"),            price:0,monthlySales:0,rating:0,tags:["人气","甜口"],specs:["size"] },
  { id:9, name:"红烧鸡块",     category:"meat", emoji:"🍗", image:pic("braised-chicken,chinese-home-cooking"), price:0,monthlySales:0,rating:0,tags:["家常"],specs:["spiciness","size"] },
  { id:10,name:"京酱肉丝",     category:"meat", emoji:"🥩", image:pic("shredded-pork-bean-sauce,beijing"),     price:0,monthlySales:0,rating:0,tags:["京味","经典"],specs:["size"] },
  { id:11,name:"木须肉",       category:"meat", emoji:"🥚", image:pic("moo-shu-pork,egg,chinese-stir-fry"),    price:0,monthlySales:0,rating:0,tags:["家常","营养"],specs:["size"] },
  { id:12,name:"椒盐排骨",     category:"meat", emoji:"🍖", image:pic("salt-pepper-ribs,crispy-fried"),        price:0,monthlySales:0,rating:0,tags:["酥脆"],specs:["spiciness","size"] },
  { id:13,name:"葱爆羊肉",     category:"meat", emoji:"🐑", image:pic("lamb-scallion-stir-fry,chinese"),       price:0,monthlySales:0,rating:0,tags:["滋补","快手"],specs:["spiciness","size"] },
  { id:14,name:"梅菜扣肉",     category:"meat", emoji:"🍖", image:pic("steamed-pork-belly-mustard-greens"),    price:0,monthlySales:0,rating:0,tags:["客家","经典"],specs:["size"] },
  { id:15,name:"粉蒸肉",       category:"meat", emoji:"🥩", image:pic("steamed-rice-flour-pork,chinese"),      price:0,monthlySales:0,rating:0,tags:["蒸菜","软糯"],specs:["spiciness","size"] },
  { id:16,name:"红烧牛腩",     category:"meat", emoji:"🐮", image:pic("braised-beef-brisket,chinese-stew"),   price:0,monthlySales:0,rating:0,tags:["硬菜"],specs:["spiciness","size"] },

  // 素菜 14
  { id:17,name:"番茄炒蛋",     category:"veg", emoji:"🍅", image:pic("tomato-eggs,chinese-home-dish"),         price:0,monthlySales:0,rating:0,tags:["国民菜","不辣"],specs:["size"] },
  { id:18,name:"酸辣土豆丝",   category:"veg", emoji:"🥔", image:pic("shredded-potato,vinegar-chili"),         price:0,monthlySales:0,rating:0,tags:["爽脆","下饭"],specs:["spiciness","size"] },
  { id:19,name:"麻婆豆腐",     category:"veg", emoji:"🫘", image:pic("mapo-tofu,spicy-sichuan"),               price:0,monthlySales:0,rating:0,tags:["川味","麻辣"],specs:["spiciness","size"] },
  { id:20,name:"清炒时蔬",     category:"veg", emoji:"🥬", image:pic("stir-fried-green-vegetables,chinese"),   price:0,monthlySales:0,rating:0,tags:["清淡"],specs:["size"] },
  { id:21,name:"地三鲜",       category:"veg", emoji:"🍆", image:pic("stir-fry-potato-eggplant-pepper"),       price:0,monthlySales:0,rating:0,tags:["东北","经典"],specs:["size"] },
  { id:22,name:"干煸四季豆",   category:"veg", emoji:"🫛", image:pic("dry-fried-green-beans,sichuan"),         price:0,monthlySales:0,rating:0,tags:["下饭","辣"],specs:["spiciness","size"] },
  { id:23,name:"家常豆腐",     category:"veg", emoji:"🫘", image:pic("fried-tofu,vegetables,chinese"),         price:0,monthlySales:0,rating:0,tags:["下饭"],specs:["spiciness","size"] },
  { id:24,name:"蒜蓉西兰花",   category:"veg", emoji:"🥦", image:pic("garlic-broccoli,stir-fry,chinese"),      price:0,monthlySales:0,rating:0,tags:["清淡","健康"],specs:["size"] },
  { id:25,name:"蚝油生菜",     category:"veg", emoji:"🥬", image:pic("lettuce-oyster-sauce,chinese-dish"),     price:0,monthlySales:0,rating:0,tags:["快手","清淡"],specs:["size"] },
  { id:26,name:"香菇青菜",     category:"veg", emoji:"🥬", image:pic("bok-choy-shiitake,chinese-vegetarian"),  price:0,monthlySales:0,rating:0,tags:["素菜","营养"],specs:["size"] },
  { id:27,name:"韭菜炒蛋",     category:"veg", emoji:"🥚", image:pic("chive-egg,scrambled,chinese"),           price:0,monthlySales:0,rating:0,tags:["家常","快手"],specs:["size"] },
  { id:28,name:"手撕包菜",     category:"veg", emoji:"🥬", image:pic("hand-torn-cabbage,chinese-stir-fry"),    price:0,monthlySales:0,rating:0,tags:["下饭"],specs:["spiciness","size"] },
  { id:29,name:"烧茄子",       category:"veg", emoji:"🍆", image:pic("braised-eggplant,chinese-cuisine"),      price:0,monthlySales:0,rating:0,tags:["下饭","经典"],specs:["size"] },
  { id:30,name:"素炒豆芽",     category:"veg", emoji:"🌱", image:pic("stir-fried-bean-sprouts,chinese"),       price:0,monthlySales:0,rating:0,tags:["爽脆","快手"],specs:["spiciness"] },

  // 凉菜 7
  { id:31,name:"拍黄瓜",       category:"cold", emoji:"🥒", image:pic("smashed-cucumber,garlic,chinese-salad"), price:0,monthlySales:0,rating:0,tags:["爽口"],specs:["spiciness"] },
  { id:32,name:"凉拌木耳",     category:"cold", emoji:"🫒", image:pic("wood-ear-mushroom,chinese-cold-dish"),   price:0,monthlySales:0,rating:0,tags:["清爽","健康"],specs:["spiciness"] },
  { id:33,name:"口水鸡",       category:"cold", emoji:"🍗", image:pic("mouthwatering-chicken,sichuan"),         price:0,monthlySales:0,rating:0,tags:["川味","招牌"],specs:["spiciness","size"] },
  { id:34,name:"皮蛋豆腐",     category:"cold", emoji:"🥚", image:pic("century-egg-tofu,chinese-appetizer"),    price:0,monthlySales:0,rating:0,tags:["经典","爽口"],specs:["spiciness"] },
  { id:35,name:"凉拌三丝",     category:"cold", emoji:"🥗", image:pic("chinese-salad,shredded-vegetables"),     price:0,monthlySales:0,rating:0,tags:["酸辣"],specs:["spiciness"] },
  { id:36,name:"蒜泥白肉",     category:"cold", emoji:"🥓", image:pic("boiled-pork,garlic-sauce,sichuan"),      price:0,monthlySales:0,rating:0,tags:["川味","经典"],specs:["spiciness","size"] },
  { id:37,name:"凉拌海带丝",   category:"cold", emoji:"🌿", image:pic("seaweed-salad,shredded-kelp"),           price:0,monthlySales:0,rating:0,tags:["清爽"],specs:["spiciness"] },

  // 汤羹 7
  { id:38,name:"紫菜蛋花汤",   category:"soup", emoji:"🍲", image:pic("egg-drop-seaweed-soup,chinese"), price:0,monthlySales:0,rating:0,tags:["清淡","快手"],specs:[] },
  { id:39,name:"番茄蛋汤",     category:"soup", emoji:"🍅", image:pic("tomato-egg-soup,chinese"),       price:0,monthlySales:0,rating:0,tags:["家常"],specs:[] },
  { id:40,name:"排骨莲藕汤",   category:"soup", emoji:"🍖", image:pic("pork-rib-lotus-root-soup"),      price:0,monthlySales:0,rating:0,tags:["滋补"],specs:["size"] },
  { id:41,name:"酸辣汤",       category:"soup", emoji:"🌶️", image:pic("hot-sour-soup,chinese"),        price:0,monthlySales:0,rating:0,tags:["开胃"],specs:["spiciness"] },
  { id:42,name:"冬瓜排骨汤",   category:"soup", emoji:"🍈", image:pic("winter-melon-rib-soup"),         price:0,monthlySales:0,rating:0,tags:["清淡","滋补"],specs:["size"] },
  { id:43,name:"玉米排骨汤",   category:"soup", emoji:"🌽", image:pic("corn-rib-soup,chinese"),         price:0,monthlySales:0,rating:0,tags:["鲜甜"],specs:["size"] },
  { id:44,name:"鲫鱼豆腐汤",   category:"soup", emoji:"🐟", image:pic("fish-tofu-soup,creamy,chinese"), price:0,monthlySales:0,rating:0,tags:["奶白","营养"],specs:[] },

  // 主食 9
  { id:45,name:"白米饭",       category:"staple", emoji:"🍚", image:pic("steamed-white-rice,chinese"),           price:0,monthlySales:0,rating:0,tags:["必点"],specs:["size"] },
  { id:46,name:"蛋炒饭",       category:"staple", emoji:"🍳", image:pic("egg-fried-rice,chinese-takeout"),       price:0,monthlySales:0,rating:0,tags:["经典"],specs:["size"] },
  { id:47,name:"手工水饺",     category:"staple", emoji:"🥟", image:pic("chinese-dumplings,jiaozi,boiled"),      price:0,monthlySales:0,rating:0,tags:["手工"],specs:["size"] },
  { id:48,name:"阳春面",       category:"staple", emoji:"🍜", image:pic("plain-noodles,scallion,chinese-soup"),  price:0,monthlySales:0,rating:0,tags:["清淡"],specs:["size"] },
  { id:49,name:"炸酱面",       category:"staple", emoji:"🍝", image:pic("zhajiang-noodles,beijing-cuisine"),     price:0,monthlySales:0,rating:0,tags:["京味","拌面"],specs:["size"] },
  { id:50,name:"馒头",         category:"staple", emoji:"🥖", image:pic("chinese-steamed-bun,mantou"),           price:0,monthlySales:0,rating:0,tags:["主食"],specs:[] },
  { id:51,name:"花卷",         category:"staple", emoji:"🥐", image:pic("flower-roll,steamed-bun,chinese"),      price:0,monthlySales:0,rating:0,tags:["松软"],specs:[] },
  { id:52,name:"包子",         category:"staple", emoji:"🫓", image:pic("baozi,steamed-stuffed-bun,chinese"),    price:0,monthlySales:0,rating:0,tags:["早点"],specs:[] },
  { id:53,name:"葱油饼",       category:"staple", emoji:"🫓", image:pic("scallion-pancake,cong-you-bing"),       price:0,monthlySales:0,rating:0,tags:["香脆"],specs:[] },

  // 海鲜 6
  { id:54,name:"清蒸鲈鱼",     category:"seafood", emoji:"🐟", image:pic("steamed-sea-bass,cantonese-fish"),    price:0,monthlySales:0,rating:0,tags:["鲜美","蒸菜"],specs:["size"] },
  { id:55,name:"红烧带鱼",     category:"seafood", emoji:"🐠", image:pic("braised-hairtail-fish,chinese"),      price:0,monthlySales:0,rating:0,tags:["下饭"],specs:["spiciness","size"] },
  { id:56,name:"蒜蓉粉丝蒸虾", category:"seafood", emoji:"🦐", image:pic("garlic-shrimp,vermicelli,steamed"),    price:0,monthlySales:0,rating:0,tags:["海鲜","蒸菜"],specs:["size"] },
  { id:57,name:"香辣蟹",       category:"seafood", emoji:"🦀", image:pic("spicy-stir-fried-crab,chinese"),       price:0,monthlySales:0,rating:0,tags:["辣","人气"],specs:["spiciness","size"] },
  { id:58,name:"白灼虾",       category:"seafood", emoji:"🦐", image:pic("boiled-shrimp,cantonese,simple"),      price:0,monthlySales:0,rating:0,tags:["鲜美","简单"],specs:[] },
  { id:59,name:"糖醋鱼",       category:"seafood", emoji:"🐟", image:pic("sweet-sour-fish,chinese-whole-fish"), price:0,monthlySales:0,rating:0,tags:["酸甜"],specs:["size"] },

  // 小吃 5
  { id:60,name:"春卷",  category:"snack", emoji:"🥠", image:pic("spring-rolls,crispy,chinese-snack"), price:0,monthlySales:0,rating:0,tags:["酥脆"],specs:[] },
  { id:61,name:"煎饺",  category:"snack", emoji:"🥟", image:pic("pan-fried-dumplings,gyoza,chinese"), price:0,monthlySales:0,rating:0,tags:["香脆"],specs:["size"] },
  { id:62,name:"锅贴",  category:"snack", emoji:"🥟", image:pic("potstickers,chinese-street-food"), price:0,monthlySales:0,rating:0,tags:["香脆","人气"],specs:["size"] },
  { id:63,name:"小笼包",category:"snack", emoji:"🫓", image:pic("xiaolongbao,soup-dumplings,shanghai"),price:0,monthlySales:0,rating:0,tags:["汤包","经典"],specs:[] },
  { id:64,name:"糯米鸡",category:"snack", emoji:"🍗", image:pic("lotus-leaf,glutinous-rice-chicken,dimsum"),price:0,monthlySales:0,rating:0,tags:["荷叶香"],specs:["size"] },

  // 饮品 6
  { id:65,name:"冰镇酸梅汤", category:"drink", emoji:"🫐", image:pic("sour-plum-drink,chinese-iced"), price:0,monthlySales:0,rating:0,tags:["解暑"],specs:["temperature"] },
  { id:66,name:"柠檬水",     category:"drink", emoji:"🍋", image:pic("lemonade,fresh,drink"), price:0,monthlySales:0,rating:0,tags:["清爽"],specs:["temperature"] },
  { id:67,name:"豆浆",       category:"drink", emoji:"🥛", image:pic("soy-milk,chinese-breakfast"), price:0,monthlySales:0,rating:0,tags:["营养"],specs:["temperature"] },
  { id:68,name:"绿豆汤",     category:"drink", emoji:"🫘", image:pic("mung-bean-soup,chinese-dessert"), price:0,monthlySales:0,rating:0,tags:["消暑"],specs:["temperature"] },
  { id:69,name:"菊花茶",     category:"drink", emoji:"🌼", image:pic("chrysanthemum-tea,chinese,hot"), price:0,monthlySales:0,rating:0,tags:["清热"],specs:["temperature"] },
  { id:70,name:"椰汁",       category:"drink", emoji:"🥥", image:pic("coconut-drink,fresh,beverage"), price:0,monthlySales:0,rating:0,tags:["清甜"],specs:["temperature"] },
];