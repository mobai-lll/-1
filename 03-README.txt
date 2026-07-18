==========================================
项目说明文档
==========================================

项目名称：Web开发课程大作业 - 赛事信息服务平台

仓库地址：https://github.com/sunshinezxf/web-development-course

技术栈：
- 前端：Next.js 16 + React 18 + TypeScript + TailwindCSS 4
- 后端：Midway.js 3 + TypeORM + SQLite
- MCP Server：TypeScript + @mcp-server/core
- 容器化：Docker + Docker Compose

==========================================
功能特性
==========================================

1. 核心功能
- 比赛列表与详情展示（小组赛、淘汰赛）
- 球队列表与阵容展示
- 球员榜（射手榜、助攻榜）
- 积分榜（分组排名、总排名）
- 比分预测功能
- 比赛评论功能

2. 前端特色
- 借鉴MSN世界杯页面设计风格
- 沉浸式英雄区域展示关键比赛
- 数据统计卡片展示核心指标
- 四态交互覆盖（加载、空结果、错误、成功）

3. 后端特色
- RESTful API + OpenAPI契约驱动开发
- 并发一致性保证（唯一约束、条件更新）
- 请求追踪（X-Request-Id）
- 完整的错误处理机制

4. MCP集成
- 7个工具：list_matches、get_team、list_teams、get_standings、get_top_scorers、get_top_assists、list_groups
- 支持WorkBuddy接入

==========================================
运行方式
==========================================

1. 开发模式
   npm install
   npm run dev --workspace backend   # 后端服务
   npm run dev --workspace frontend  # 前端服务

2. Docker部署（02-X64运行产物包 目录）
   # 一条命令构建并启动
   bash start.sh

   # 或手动操作
   docker compose -f infra/compose.yaml up -d --build

   启动后访问：
   - Web 页面：http://localhost:3000
   - 后端健康检查：http://localhost:7001/api/health
   - 停止：docker compose -f infra/compose.yaml down

   数据库和资源文件挂载说明：
   - 数据库文件：将 course-demo.sqlite 放置在 data/ 目录下，
     容器启动时会自动挂载到容器内 /app/backend/data/ 路径。
     挂载配置：./data:/app/backend/data（参见 docker-compose.yml 第 24 行）
   - 镜像文件：images/ 目录下包含预构建的 x64 Docker 镜像：
     · course-backend.tar（后端）
     · course-frontend.tar（前端）
     在目标机器上加载镜像：
       docker load -i images/course-backend.tar
       docker load -i images/course-frontend.tar
     加载后即可通过 docker compose 启动，无需重新构建。
   - 配置文件：复制 .env.example 为 .env 可按需修改环境变量
     （端口号、数据库路径、后端地址等）

3. 运行检查
   npm run check

4. X64 运行产物包构建
   进入 02-X64运行产物包 目录，执行一键构建脚本：
   bash docker-build.sh export

   这会：
   - 构建 linux/amd64 的 backend 和 frontend 镜像
   - 导出为 images/course-backend.tar 和 images/course-frontend.tar
   - 在另一台机器上加载镜像：
     docker load -i images/course-backend.tar
     docker load -i images/course-frontend.tar

   X64 运行产物包包含：
   ├── docker-build.sh          # 一键构建 linux/amd64 镜像
   ├── docker-compose.yml       # Docker Compose 编排文件
   ├── start.sh                 # 一键构建并启动
   ├── infra/                   # Dockerfiles + compose.yaml
   ├── data/                    # 测试数据库 course-demo.sqlite
   └── 源码 (frontend/ backend/ mcp/ package.json)

==========================================
核心实现
==========================================

1. 数据模型
- Team：球队信息（名称、小组、排名等）
- Match：比赛信息（双方球队、比分、状态等）
- Player：球员信息（姓名、号码、位置、进球、助攻等）
- Prediction：预测记录（用户、比赛、比分）
- Comment：评论记录

2. API端点
- GET /api/matches：比赛列表
- GET /api/teams：球队列表
- GET /api/players/top-scorers：射手榜
- GET /api/players/top-assists：助攻榜
- GET /api/standings：积分榜
- POST /api/predictions：提交预测
- POST /api/comments：提交评论

3. 并发控制
- 数据库唯一索引：(matchId, userId)
- INSERT OR REPLACE条件更新
- 应用层状态检查

==========================================
演示数据
==========================================

数据库文件：course-demo.sqlite
包含：
- 48支球队
- 102场比赛
- 234名球员
- 真实比赛数据（2026世界杯）

==========================================
课程印象最深内容
==========================================

1. 接口契约驱动开发
- OpenAPI作为唯一事实来源，前后端并行开发
- 契约测试确保接口行为一致性

2. 并发一致性保证
- 多层防护机制（数据库、业务、应用层）
- 理解并发场景下的数据完整性问题

3. 四态交互覆盖
- 加载、空结果、错误、成功四种状态
- 提升用户体验的关键

4. Agent接入
- 通过MCP Server将Web服务能力接入AI助手
- 实现从传统Web到AI原生应用的转型

==========================================
课程改进建议
==========================================

1. 增加更多实际案例，帮助理解理论知识应用
2. 强化性能优化教学，如缓存策略、数据库优化
3. 提供更多工具链介绍，提高开发效率
