import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "./store/AppContext";
import App from "./App";
import "./index.css";

// 应用入口：挂载到 #root 元素，全局包裹 AppProvider 状态管理
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);