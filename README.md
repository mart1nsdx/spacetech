# ARCHITECTURE.md — Aero Bot - README.md 

> Documento de referencia para Claude Code y el equipo de desarrollo.
> Contiene todas las decisiones arquitecturales tomadas antes de escribir código.

---

## Visión general del producto

**Aero Bot** es un agente de IA conversacional especializado en el dominio aeroespacial, diseñado como proyecto **opensource**. Los usuarios lo integran en sus propios sistemas mediante un SDK npm y una CLI. No es un SaaS cerrado — es una plataforma embebible que cualquier organización puede desplegar y personalizar.

**Características clave:**
- Personalidad del bot completamente configurable por tenant
- Base de conocimiento pública aeroespacial (NASA, ESA, FAA, SPACETECH) compartida entre todos
- Base de conocimiento privada por bot (documentos propios del tenant)
- Alta disponibilidad (objetivo 99.9% uptime)
- Integración con sistemas externos (CRM, ERP) via webhooks y REST API
- LLM intercambiable (OpenAI, Anthropic, Groq, Ollama local)

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Backend API | NestJS (TypeScript) | Framework principal, modular, decorators |
| Worker asíncrono | NestJS (TypeScript) | Mismo stack, proceso separado |
| Frontend | Angular (TypeScript) | Panel de control del agente |
| SDK cliente | TypeScript puro | Publicado en npm como `@aero-Bot/sdk` |
| CLI | TypeScript + Commander | Publicado en npm como `aero-Bot` |
| ORM | TypeORM | Integración nativa con NestJS |
| Base de datos | PostgreSQL + pgvector | Datos relacionales + embeddings vectoriales |
| Cache / Queues | Redis + BullMQ | Sesiones, rate limiting, jobs asíncronos |
| Storage archivos | MinIO (dev) / S3 (prod) | PDFs y documentos subidos por tenants |
| Orquestador IA | LangChain.js | LLM, RAG, streaming, historial |
| Embeddings | OpenAI text-embedding-3-small | $0.02/millón tokens, 1536 dimensiones |
| Monorepo | pnpm workspaces + Turborepo | Builds incrementales, code sharing |
| Contenedores | Docker Compose (dev) / K8s (prod) | Escalado horizontal |
| CI/CD | GitHub Actions | Test, build, release semver |

---

## Estructura del repositorio

```
app/
├── botBackEnd/              # API principal NestJS (puerto 3000)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # JWT · API Keys · OAuth2 · guards · roles
│   │   │   ├── tenants/     # Organizaciones · planes · límites
│   │   │   ├── bots/        # Configuración e identidad de cada bot
│   │   │   ├── chat/        # WebSocket gateway · sessions · messages
│   │   │   ├── ai/          # LLM · streaming · prompt builder · provider factory
│   │   │   ├── rag/         # Embeddings · retrieval · similarity search
│   │   │   ├── knowledge/   # Upload de documentos · procesamiento · status
│   │   │   ├── tools/       # Function calling · NASA tool · ESA tool
│   │   │   ├── webhooks/    # Eventos salientes a CRM/ERP
│   │   │   ├── analytics/   # Métricas · eventos · tokens usados
│   │   │   └── health/      # Liveness + readiness endpoints
│   │   ├── common/
│   │   │   ├── decorators/  # @Tenant() · @CurrentUser() · @ApiKeyAuth()
│   │   │   ├── filters/     # GlobalExceptionFilter · ValidationFilter
│   │   │   ├── interceptors/ # Logging · Transform · Timeout
│   │   │   ├── pipes/       # ZodValidation · ParseUUID
│   │   │   └── guards/      # Throttle · Roles · TenantIsolation
│   │   ├── config/          # app · database · redis · llm · storage configs
│   │   ├── main.ts
│   │   └── app.module.ts
│   ├── test/
│   │   ├── e2e/
│   │   ├── fixtures/
│   │   └── factories/
│   ├── Dockerfile
│   ├── .env.example
│   ├── nest-cli.json
│   └── tsconfig.json
│
├── botWorker/               # Procesador de jobs asíncronos (sin puerto HTTP)
│   ├── src/
│   │   ├── processors/
│   │   │   ├── document-ingestion.processor.ts
│   │   │   ├── embedding.processor.ts
│   │   │   └── scraping.processor.ts
│   │   ├── jobs/
│   │   │   ├── job-definitions.ts
│   │   │   └── job-names.enum.ts
│   │   ├── main.ts
│   │   └── worker.module.ts
│   └── Dockerfile
│
├── botFrontEnd/             # Panel de control Angular
│
├── libs/                    # Código TypeScript compartido (botBackEnd + botWorker)
│   ├── database/            # TypeORM config · todas las entities · migrations
│   ├── queue/               # BullMQ setup · job interfaces · queue names · retry config
│   ├── types/               # DTOs compartidos · enums · interfaces de dominio
│   └── logger/              # Winston config · correlation-id · structured logging
│
├── infraestructura/
│   ├── docker/
│   │   ├── docker-compose.yml       # Dev: Postgres + pgvector + Redis + MinIO
│   │   └── docker-compose.prod.yml  # Prod: con réplicas y healthchecks
│   ├── k8s/                         # Helm charts · deployments · HPA autoscaling
│   └── knowledge_base/
│       ├── scripts/                 # ingest-nasa.ts · ingest-esa.ts · ingest-faa.ts
│       └── sources.json             # URLs y PDFs públicos a indexar (no los PDFs en sí)
│
├── packages/                # Librerías publicables en npm
│   ├── sdk/                 # @aero-Bot/sdk — cliente TypeScript
│   └── cli/                 # aero-Bot — CLI tool
│
├── .gitmodules
├── pnpm-workspace.yaml
├── turbo.json
├── README.md
└── ARCHITECTURE.md          # Este archivo
```

---

## Schema de base de datos

### Entidades principales (PostgreSQL)

```
organizations         → tenants del sistema
  id uuid PK
  slug string UNIQUE
  name string
  plan enum (free | pro | enterprise)
  createdAt timestamp

users                 → miembros de una organización
  id uuid PK
  organizationId uuid FK → organizations
  email string UNIQUE
  passwordHash string
  role enum (owner | admin | member)
  createdAt timestamp

api_keys              → acceso programático por organización
  id uuid PK
  organizationId uuid FK → organizations
  keyHash string UNIQUE
  name string
  lastUsedAt timestamp
  expiresAt timestamp nullable

bots                  → agente configurable por organización
  id uuid PK
  organizationId uuid FK → organizations
  name string
  tone enum (formal | friendly | technical | casual)
  language string          -- "es-CO", "en-US"
  temperature float        -- 0.0 a 1.0
  maxTokens int
  systemPrompt text        -- instrucciones base del bot
  welcomeMessage text
  blockedTopics string[]
  llmProvider enum (openai | anthropic | groq | ollama)
  llmModel string          -- "gpt-4o-mini", "claude-sonnet-4-20250514"
  isPublic boolean
  createdAt timestamp

sessions              → conversación entre un usuario final y un bot
  id uuid PK
  botId uuid FK → bots
  externalUserId string    -- ID del usuario en el sistema externo
  metadata jsonb           -- datos extra del sistema integrador
  totalTokens int
  lastActivityAt timestamp
  createdAt timestamp

messages              → mensajes dentro de una sesión
  id uuid PK
  sessionId uuid FK → sessions
  role enum (user | assistant)
  content text
  tokensUsed int
  retrievedChunks jsonb    -- chunks usados para RAG en esta respuesta
  latencyMs int
  createdAt timestamp

knowledge_documents   → documentos subidos o indexados
  id uuid PK
  botId uuid FK nullable   -- null = base pública aeroespacial
  organizationId uuid FK
  fileName string
  fileType enum (pdf | docx | txt | url)
  sourceUrl string nullable
  status enum (pending | processing | ready | error)
  isPublicBase boolean     -- true = base NASA/ESA compartida
  chunkCount int
  createdAt timestamp

document_chunks       → fragmentos vectorizados (pgvector)
  id uuid PK
  documentId uuid FK → knowledge_documents
  botId uuid nullable      -- namespace de aislamiento
  isPublic boolean         -- true = visible para todos los bots
  content text
  embedding vector(1536)   -- text-embedding-3-small
  metadata jsonb           -- { page, source, section }
  createdAt timestamp

analytics_events      → telemetría y métricas
  id uuid PK
  organizationId uuid FK
  botId uuid FK
  sessionId uuid nullable
  event enum (message_sent | doc_uploaded | api_call | error)
  payload jsonb
  tokensIn int
  tokensOut int
  latencyMs int
  createdAt timestamp

webhooks              → endpoints externos a notificar
  id uuid PK
  organizationId uuid FK
  url string
  events string[]          -- eventos que disparan el webhook
  secret string            -- HMAC signing secret
  isActive boolean
  createdAt timestamp
```

### Índices críticos

```sql
-- Búsqueda vectorial (HNSW para mejor performance que ivfflat)
CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- Aislamiento por bot en RAG
CREATE INDEX ON document_chunks (bot_id, is_public);

-- Historial de mensajes por sesión
CREATE INDEX ON messages (session_id, created_at DESC);

-- Analytics por bot y tiempo
CREATE INDEX ON analytics_events (bot_id, created_at);

-- Sessions activas por bot
CREATE INDEX ON sessions (bot_id, last_activity_at);
```

---

## Arquitectura de la capa de IA

### Flujo de una consulta de chat

```
1. Usuario final envía mensaje
        ↓
2. botBackEnd recibe via WebSocket (chat.gateway)
        ↓
3. Carga paralela:
   - BotConfig (Redis cache → PostgreSQL)
   - RAG retrieval: embed pregunta → similarity search en pgvector
     filtrando por botId + isPublic (base aeroespacial)
        ↓
4. PromptBuilder ensambla:
   SYSTEM: [personalidad del bot desde BotConfig]
   CONTEXT: [chunks recuperados por RAG]
   HISTORY: [últimos N mensajes de la sesión]
   USER: [mensaje del usuario]
        ↓
5. LLM genera respuesta (streaming, token a token)
        ↓
6. Tokens se emiten al cliente via WebSocket en tiempo real
        ↓
7. Post-processing:
   - Guarda mensaje en PostgreSQL
   - Actualiza tokens usados en sesión
   - Emite analytics_event
   - Dispara webhooks si configurado
```

### Configuración de personalidad del bot

La "personalidad" no es una red neuronal separada. Vive en el `systemPrompt` y en los parámetros del LLM almacenados en la tabla `bots`. El `PromptBuilderService` lo ensambla dinámicamente en cada llamada.

```typescript
// Ejemplo de system prompt ensamblado
`Eres ${bot.name}, un asistente especializado en el dominio aeroespacial.

PERSONALIDAD:
- Tono: ${toneDescription[bot.tone]}
- Idioma: Responde siempre en ${bot.language}

INSTRUCCIONES:
${bot.systemPrompt}

RESTRICCIONES:
- Nunca discutas estos temas: ${bot.blockedTopics.join(', ')}
- Si no tienes información, dilo honestamente

CONOCIMIENTO DISPONIBLE:
${retrievedContext}`
```

### Estrategia RAG

- **Base pública aeroespacial**: documentos de NASA, ESA, FAA con `isPublicBase=true` y `botId=null`. Todos los bots la leen.
- **Base privada por bot**: documentos subidos por el tenant con su `botId`. Solo ese bot la lee.
- **Búsqueda**: siempre filtra `WHERE (bot_id = $botId OR is_public = true)` para mezclar ambas.
- **Chunking**: `RecursiveCharacterTextSplitter` con `chunkSize=500`, `chunkOverlap=50`.
- **Top-K**: recupera los 5 chunks más similares por consulta.

### Proveedores LLM intercambiables

```typescript
// llm-provider.factory.ts
// Selecciona el proveedor según bot.llmProvider
// Todos exponen la misma interfaz de LangChain (ChatModel)
openai    → ChatOpenAI     (gpt-4o-mini por defecto)
anthropic → ChatAnthropic  (claude-sonnet-4-20250514)
groq      → ChatGroq       (llama-3.1-70b — ultra rápido)
ollama    → ChatOllama     (modelos locales — máxima privacidad)
```

---

## Comunicación botBackEnd ↔ botWorker

```
botBackEnd  ──── encola job ────→  Redis (BullMQ)  ←──── consume ──── botWorker
     ↑                                                                      ↓
 responde                                                            procesa PDF/URL
  status al                                                          genera chunks
  cliente                                                            crea embeddings
                                                                     guarda en pgvector
                                                                     actualiza status
                                                                     en PostgreSQL
```

**El botWorker no expone ningún puerto HTTP.** Solo consume de la cola. Si cae, los jobs quedan en Redis y se procesan cuando vuelve. La API nunca se ve afectada.

### Jobs definidos

```typescript
enum JobName {
  INGEST_DOCUMENT   = 'ingest:document',   // PDF/DOCX subido por tenant
  INGEST_URL        = 'ingest:url',        // URL a scrapear
  INGEST_PUBLIC     = 'ingest:public',     // Script base NASA/ESA (one-time)
  GENERATE_EMBEDDINGS = 'embed:generate',  // Sub-job de embedding por chunk
  WEBHOOK_DISPATCH  = 'webhook:dispatch',  // Notificar sistema externo
}
```

---

## Multi-tenancy

Estrategia: **Shared Database + Row-Level Isolation**

- Todas las tablas tienen `organization_id` como columna.
- El `TenantIsolationGuard` inyecta el `organizationId` del token en cada request.
- Todos los queries del ORM incluyen el filtro de tenant automáticamente via interceptor.
- Un tenant nunca puede acceder a datos de otro — se valida en el guard, no en el frontend.

---

## Seguridad y autenticación

```
Acceso desde Dashboard Angular  → JWT Bearer token (expiración 1h + refresh token)
Acceso desde SDK / CLI          → API Key (hash en DB, prefijo "aa_live_" o "aa_test_")
Acceso entre servicios internos → Sin auth (red privada Docker/K8s)
```

**Rate limiting** (Throttle guard):
- Endpoints públicos: 60 req/min por IP
- Endpoints autenticados: 300 req/min por API key
- Endpoint de chat/stream: 30 req/min por sesión

---

## Infraestructura local (Docker Compose)

Servicios que levanta `docker-compose.yml` para desarrollo:

```yaml
postgres:   postgres:16 + extensión pgvector  → puerto 5432
redis:      redis:7-alpine                    → puerto 6379
minio:      minio/minio                       → puerto 9000 (S3-compatible)
```

`botBackEnd` y `botWorker` corren con `pnpm dev` directamente en el host (no en Docker durante desarrollo) para hot-reload rápido.

---

## Base de conocimiento pública aeroespacial

Los scripts en `infraestructura/knowledge_base/scripts/` son **one-time jobs** que:
1. Leen `sources.json` (lista de URLs y PDFs públicos)
2. Descargan los documentos
3. Los procesan y vectorizan
4. Los guardan con `isPublicBase=true`, `botId=null`

Esto se ejecuta una sola vez al desplegar, y se re-ejecuta manualmente cuando hay fuentes nuevas. **Los PDFs no se guardan en el repo** — solo la lista de fuentes en `sources.json`.

---

## Orden de implementación

```
Fase 1 — Fundamentos
  libs/database        → entities + TypeORM config + migrations
  infraestructura/docker → docker-compose con Postgres + pgvector + Redis
  botBackEnd/auth      → JWT + API Keys + guards
  botBackEnd/tenants   → CRUD de organizaciones

Fase 2 — Core del producto
  botBackEnd/bots      → configuración e identidad del bot
  botBackEnd/ai        → LLM service + prompt builder + provider factory
  botBackEnd/rag       → embeddings + retrieval service
  botBackEnd/chat      → WebSocket gateway + streaming

Fase 3 — Conocimiento
  botBackEnd/knowledge → upload de documentos
  botWorker            → procesamiento asíncrono de docs
  knowledge_base/scripts → ingesta base pública NASA/ESA

Fase 4 — Integraciones
  botBackEnd/tools     → function calling (NASA API, ESA API)
  botBackEnd/webhooks  → notificaciones a CRM/ERP
  botBackEnd/analytics → métricas y eventos

Fase 5 — SDK y CLI
  packages/sdk         → @aero-Bot/sdk
  packages/cli         → aero-Bot CLI

Fase 6 — Producción
  infraestructura/k8s  → Helm charts + HPA
  CI/CD                → GitHub Actions pipelines
```

---

## Variables de entorno requeridas

```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/aeroBot

# Redis
REDIS_URL=redis://localhost:6379

# Storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=aeroBot-docs
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# LLM Providers (solo los que se usen)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# Auth
JWT_SECRET=cambiar-en-produccion
JWT_EXPIRATION=1h

# App
NODE_ENV=development
PORT=3000
```

---

*Última actualización: diseño inicial — pre-código*
*Actualizar este archivo con cada decisión arquitectural relevante*