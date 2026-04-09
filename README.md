# QRate — Расчёт стоимости испытаний РКТ

Система автоматизированного расчёта начальной (максимальной) цены испытаний ракетно-космической техники (НИЦ).

## Архитектура

```
┌───────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                   │
│              localhost:3000 · App Router · shadcn/ui       │
└──────────────────────────┬────────────────────────────────┘
                           │  REST / JWT
┌──────────────────────────▼────────────────────────────────┐
│                   API Gateway (NestJS)                     │
│       localhost:3001 · Swagger: /api/docs · Mongoose       │
│   Auth · Customers · Orders · TestTypes · PDF Generation   │
└────────────────┬─────────────────────┬────────────────────┘
                 │  gRPC               │  MongoDB
┌────────────────▼──────┐    ┌─────────▼─────────┐
│   Calc Service (Go)   │    │  MongoDB (Atlas)   │
│   :50051 · Protobuf   │    │                    │
└───────────────────────┘    └────────────────────┘
```

## Стек технологий

| Компонент | Технологии |
|-----------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Hook Form, Zod |
| **API Gateway** | NestJS 10, TypeScript, Mongoose, JWT, class-validator, Swagger, pdf-lib |
| **Calc Service** | Go 1.24, gRPC, Protobuf |
| **База данных** | MongoDB (Atlas) |
| **Инфраструктура** | Docker, Docker Compose |

## Возможности

- Регистрация и авторизация (JWT access + refresh tokens)
- Управление заказчиками (CRUD)
- Управление заказами с привязкой к заказчикам
- Справочник видов испытаний с пресетами параметров
- Расчёт НИЦ по утверждённой формуле (gRPC-микросервис)
- Генерация PDF-отчёта с кириллицей
- Адаптивный интерфейс на русском языке

## Быстрый старт

### Требования

- Docker и Docker Compose v2+
- Или: Go 1.22+, Node.js 20+, MongoDB

### Запуск (Docker)

```bash
# 1. Скопируйте и настройте переменные окружения
cp .env.example .env
# Отредактируйте .env — укажите MONGODB_URI и JWT_SECRET

# 2. Запустите все сервисы
docker compose up --build

# 3. Откройте в браузере
#    Frontend:  http://localhost:3000
#    API Docs:  http://localhost:3001/api/docs
```

### Запуск (production)

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Локальная разработка (без Docker)

```bash
# Go calc service
cd apps/calc
go run ./cmd/server

# NestJS API
cd apps/api
npm install
cp .env.example .env  # настройте переменные
npm run start:dev

# Next.js frontend
cd apps/frontend
npm install
cp .env.example .env.local
npm run dev
```

## Структура проекта

```
qrate/
├── proto/                    # Protobuf-контракт
│   └── calculation.proto
├── apps/
│   ├── calc/                 # Go gRPC микросервис
│   │   ├── cmd/server/       # Точка входа
│   │   ├── internal/         # Бизнес-логика и gRPC-обработчик
│   │   └── pb/               # Сгенерированный код Protobuf
│   ├── api/                  # NestJS API Gateway
│   │   └── src/
│   │       ├── auth/         # JWT авторизация
│   │       ├── customers/    # Управление заказчиками
│   │       ├── orders/       # Управление заказами
│   │       ├── test-types/   # Справочник видов испытаний
│   │       ├── calculation/  # gRPC-клиент к calc
│   │       └── pdf/          # Генерация PDF-отчётов
│   └── frontend/             # Next.js приложение
│       └── src/
│           ├── app/          # App Router (страницы)
│           ├── components/   # UI компоненты
│           ├── lib/          # API клиент, утилиты, auth
│           └── types/        # TypeScript типы
├── docker-compose.yml        # Dev окружение
├── docker-compose.prod.yml   # Production окружение
└── .env.example              # Шаблон переменных окружения
```

## Скриншоты

<!-- TODO: добавить скриншоты -->

## Автор

Разработано в рамках магистерской работы.
