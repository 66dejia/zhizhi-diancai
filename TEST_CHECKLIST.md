# 功能测试清单

## 1. Railway 后端验证
- [x] 服务运行中 (HTTP 200)
- [ ] 完整前端页面可访问
  - 预期: 访问 `https://zhizhi-diancai-production.up.railway.app/` 能显示点菜界面
  - 当前: 显示"服务运行中。请确保已构建前端" → 需要在 Railway 点击 Redeploy

## 2. GitHub Pages 前端验证
- [x] 页面可访问
- [x] 显示"只只点菜"页面
- [ ] WebSocket 连接测试
  - 打开浏览器控制台，看是否有 ws 连接错误
  - Railway 地址: `wss://zhizhi-diancai-production.up.railway.app`

## 3. 多人同步测试
1. 打开两个浏览器窗口
2. 两个窗口都访问 GitHub Pages 地址
3. 输入昵称 → 创建/加入同一个房间
4. 一个窗口添加菜品到购物车
5. 检查另一个窗口是否实时看到购物车更新