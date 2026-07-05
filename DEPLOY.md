# 只只点菜 - 部署指南（国内直连）

## 一、本地开发

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..

# 启动后端 (端口 3001)
cd server && node index.js &

# 启动前端 (端口 3000)
npm run dev
```

## 二、部署前端（静态文件，国内免梯）

### 方案 A：GitHub Pages + Cloudflare CDN（推荐，免费）

1. 在 GitHub 创建仓库，推送代码
2. Settings → Pages → Source: GitHub Actions
3. 在 Cloudflare 添加你的域名，开启 CDN 代理
4. 修改 `.env` 中 `VITE_WS_URL` 为你的后端地址
5. 重新 `npm run build && git push`

### 方案 B：Netlify（免费）

1. https://app.netlify.com → "Import an existing project"
2. 连接 GitHub 仓库
3. Build command: `npm run build`
4. Publish directory: `dist`
5. 绑定自定义域名避免 `*.netlify.app` 被墙

## 三、部署后端（需要国内云服务器）

### 推荐：腾讯云/阿里云轻量应用服务器

```bash
# SSH 登录服务器后
# 安装 Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# 上传 server 目录
scp -r server/ root@你的服务器IP:/app/

# 安装依赖并启动
cd /app/server && npm install
nohup node index.js > app.log 2>&1 &

# 配置 Nginx 反向代理（支持 wss）
# /etc/nginx/sites-available/default:
location /ws {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## 四、环境变量配置

编辑 `.env` 文件，将 `VITE_WS_URL` 改为你的后端实际地址：

```env
# 生产环境
VITE_WS_URL=wss://你的后端域名/ws
```

修改后重新构建：`npm run build`

## 五、WebSocket 消息协议

| 类型 | 方向 | 说明 |
|------|------|------|
| `JOIN_ROOM` | 客户端→服务器 | 加入房间 |
| `CART_UPDATE` | 客户端→服务器 | 同步购物车 |
| `NEW_ORDER` | 客户端→服务器 | 提交新订单 |
| `ROOM_STATE` | 服务器→客户端 | 房间当前状态 |
| `CART_SYNC` | 服务器→所有客户端 | 购物车同步 |
| `ORDER_SYNC` | 服务器→所有客户端 | 订单同步 |