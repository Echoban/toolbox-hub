# Toolbox Hub 免费部署指南

## 推荐方案：Render (后端) + Vercel (前端)

### 方案概述

| 组件 | 平台 | 费用 | 说明 |
|------|------|------|------|
| 前端 (React) | Vercel | 免费 | 静态站点托管，全球CDN |
| 后端 (Node.js) | Render | 免费 | Web服务托管 |
| 数据库 | SQLite | 免费 | 文件型数据库，无需额外服务 |

---

## 前置准备

1. GitHub 账号
2. 将项目代码推送到 GitHub 仓库

```bash
cd /workspace/toolbox-hub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/toolbox-hub.git
git push -u origin main
```

---

## 第一步：部署后端到 Render

### 1.1 注册 Render

访问 https://render.com 注册账号，用 GitHub 登录。

### 1.2 创建 Web Service

1. 进入 Dashboard，点击 **New** -> **Web Service**
2. 连接你的 GitHub 仓库
3. 配置如下：

| 配置项 | 值 |
|--------|-----|
| Name | `toolbox-hub-api` |
| Environment | `Node` |
| Region | 选择离你最近的地区 |
| Branch | `main` |
| Build Command | `cd apps/api && npm install && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `cd apps/api && npm start` |
| Plan | `Free` |

### 1.3 配置环境变量

在 Render Dashboard -> Environment 中添加：

```
DATABASE_URL=file:./dev.db
JWT_SECRET=toolbox-hub-secret-key-2024
JWT_REFRESH_SECRET=toolbox-hub-refresh-secret-key-2024
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=10000
NODE_ENV=production
```

### 1.4 修改后端配置

需要修改 `apps/api/src/app.ts` 中的 CORS 配置，允许前端域名访问：

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app',  // 部署后替换为实际前端地址
  ],
  credentials: true,
}));
```

### 1.5 Render 免费版限制

- **休眠机制**：15分钟无访问会自动休眠，下次访问需要30-60秒冷启动
- **每月750小时**免费运行时间
- **文件系统不持久**：SQLite 数据在每次重新部署后会丢失（建议定期备份或使用 Render Postgres）

---

## 第二步：部署前端到 Vercel

### 2.1 注册 Vercel

访问 https://vercel.com 注册账号，用 GitHub 登录。

### 2.2 创建项目

1. 点击 **Add New Project**
2. 导入 GitHub 仓库
3. 配置如下：

| 配置项 | 值 |
|--------|-----|
| Framework Preset | `Vite` |
| Root Directory | `apps/web` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 2.3 配置环境变量

在 Vercel Dashboard -> Settings -> Environment Variables 中添加：

```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### 2.4 修改前端 API 配置

修改 `apps/web/src/services/api.ts`，使用环境变量：

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  // ...
});
```

### 2.5 Vercel 免费版限制

- **100GB/月** 带宽
- **6000分钟/月** 构建时间
- **无限项目数**
- 自动 HTTPS + 全球 CDN

---

## 第三步：初始化数据

后端部署完成后，需要初始化数据库：

1. 在 Render Dashboard 中找到你的服务
2. 点击 **Shell** 标签
3. 运行以下命令：

```bash
cd apps/api
npx tsx src/seed.ts
```

---

## 备选方案

### 方案 A：全部部署到 Render

如果嫌麻烦，可以把前后端都部署到 Render：

- 前端作为 **Static Site** 部署
- 后端作为 **Web Service** 部署
- 全部免费，但前端没有 Vercel 的 CDN 快

### 方案 B：使用 Railway

Railway 也提供免费额度：

- 每月 $5 额度
- 支持 Node.js + SQLite
- 可以前后端一起部署

### 方案 C：使用 Cloudflare Pages + Workers

- Cloudflare Pages：免费静态托管
- Cloudflare Workers：免费边缘计算（后端）
- 但 Workers 不支持 SQLite，需要改用 D1 数据库

---

## 重要提示

1. **免费版限制**：Render 免费版会休眠，不适合生产环境
2. **数据持久化**：SQLite 在 Render 免费版中不持久，建议：
   - 定期导出备份
   - 或升级到 Render 付费版使用 Persistent Disk
   - 或改用 Render 免费 PostgreSQL（90天后删除）
3. **自定义域名**：两个平台都支持免费绑定自定义域名
4. **HTTPS**：自动提供，无需配置

---

## 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Render 后端服务已创建
- [ ] 环境变量已配置
- [ ] 数据库已初始化（管理员账户 + 预设数据）
- [ ] Vercel 前端已部署
- [ ] 前端环境变量指向正确后端地址
- [ ] CORS 配置包含前端域名
- [ ] 测试登录和功能正常
