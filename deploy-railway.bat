@echo off
echo === 只只点菜 Railway 部署脚本 ===
echo.
echo 正在安装 Railway CLI...
call npx railway login
echo.
echo 请按以下步骤操作：
echo 1. 浏览器会自动打开 Railway 登录页面
echo 2. 用 GitHub 账号登录并授权
echo 3. 回到此窗口，按任意键继续部署
pause
echo.
echo 正在部署后端到 Railway...
cd server
call npx railway up --detach
cd ..
echo.
echo 部署完成！获取后端地址...
call npx railway domain
echo.
echo 如果上述命令返回了 URL，请将其填入 .env 文件的 VITE_WS_URL
pause