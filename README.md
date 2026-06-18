# 金属徽章 Pin 交换记录

记录与管理金属徽章（pin）的交换信息：图案描述、来源、交换对象、日期、是否佩戴过。

## 技术栈

| 层级 | 技术 | 端口 |
|------|------|------|
| 前端 | React + Chakra UI + React Hook Form + axios | **6101** |
| 后端 | FastAPI + SQLite (`backend/data/pins.db`) | **6000** |

## 快速启动

### 1. 后端（一条命令）

```bash
cd backend && python -m venv .venv && .venv\Scripts\activate && pip install -e . && uvicorn main:app --reload --port 6000
```

> macOS / Linux 将激活命令改为：`source .venv/bin/activate`

首次启动会自动创建数据库并写入 **5 条** seed 数据。

API 文档：http://localhost:6000/docs

### 2. 前端

```bash
cd frontend && npm install && npm run dev
```

浏览器访问：http://localhost:6101

## 功能（MVP）

- 徽章交换记录列表（按日期倒序）
- 新增 / 编辑 / 删除记录
- 字段：图案描述、来源、交换对象、日期、是否佩戴过

## 目录结构

```
├── backend/
│   ├── main.py          # FastAPI 入口
│   ├── database.py      # SQLite 初始化与 seed
│   ├── schemas.py       # Pydantic 模型
│   ├── pyproject.toml   # Python 依赖
│   └── data/pins.db     # 运行时生成（已 gitignore）
└── frontend/
    ├── src/
    │   ├── api/         # axios 请求
    │   ├── pages/       # 列表页 + 编辑页
    │   └── types/       # TypeScript 类型
    └── package.json
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/pins` | 获取全部记录 |
| GET | `/api/pins/{id}` | 获取单条 |
| POST | `/api/pins` | 新增 |
| PUT | `/api/pins/{id}` | 更新 |
| DELETE | `/api/pins/{id}` | 删除 |
