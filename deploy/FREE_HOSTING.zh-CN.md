# FreightSentinel 零费用试用部署

目标：Cloudflare Pages 提供前端和同源 API 转发；Render Free 运行现有 Python 后端。模型训练实验台继续在本机运行。

这是带免费额度、休眠和临时存储限制的试用配置。

## 当前发布状态（2026-10-24）

- 代码分支：`Bcs-oh/FS` 的 `codex/free-hosting`。
- Render 新工作区：`FreightSentinel Free`，Hobby，控制台已确认 `No card on file`。
- 后端：`freightsentinel-personal-free`，Free，无持久磁盘，手动部署。
- 已上线地址：[个人后端](https://freightsentinel-personal-free.onrender.com)。`/health` 已返回 `status: ok`、520 封邮件，主 AI 和资深复核均关闭。
- Cloudflare 账号已确认 Workers Free；前端已发布：[FreightSentinel 免费试用站](https://freightsentinel-demo.pages.dev/)。
- 已通过公开页面确认首页、520 封邮件列表、`email_004` 详情和附件原文能够读取。AI 和批处理保持关闭。
- `frontend/wrangler.jsonc` 已记录上述公开后端 origin，作为 Pages Functions 的 `BACKEND_URL`。

## 1. 零费用成立的条件

- Cloudflare 使用 **Workers Free**，不启用付费 Workers 或其他付费产品。静态页面免费；Pages Functions 与其他 Workers 共用每天 100,000 次免费请求额度。
- Render 目标 workspace 使用免费方案，**没有绑定支付方式**，新 Web Service 选择 **Free**，不挂付费磁盘。没有支付方式时，超额带宽会暂停服务，超额构建会暂停构建。有支付方式的 workspace 可能产生这些超额费用，因此不能直接保证零费用。
- 使用平台提供的 `pages.dev`、`onrender.com` 地址，不购买域名。
- 试用配置默认关闭外部 AI。托管免费不代表模型 API 免费；后续若配置第三方模型，需要另行明确其费用。
- 新建免费服务不会停止旧服务计费。若账号仍有原来的付费 Render 服务，需要另外核对其用途、账单和停用影响。

免费额度和政策可能变化。发布前以控制台实际计划和官方文档为准：

- [Cloudflare Pages Functions 费用](https://developers.cloudflare.com/pages/functions/pricing/)
- [Cloudflare Pages 限制](https://developers.cloudflare.com/pages/platform/limits/)
- [Render Free 限制与超额行为](https://render.com/docs/free)

## 2. 免费试用的功能边界

- 保留邮件列表、原始邮件内容、附件元信息和附件文本查看。
- `NEXT_PUBLIC_FREE_DEMO=1` 明确显示试用状态，并关闭分析和批量分析入口。`AI_MODE=off` 不会训练或调用模型，也不会提供规则分类结果。
- 免费试用关闭后台自动轮询，避免页面闲置时持续消耗 API 额度；需要更新内容时手动刷新。
- 尚未接入训练好的个人分类器。训练实验台中的人工标签、模型文件和密钥不会发布到前端。
- 未提供 AI 分析的邮件不应被解释为已完成分类或单据比对。
- Render Free 闲置 15 分钟后会休眠；首次唤醒约需一分钟。重启、休眠或重新部署会丢失临时分析结果、人工操作、补充附件和生成文件。Git 中的原始演示收件箱可以重新解压恢复。
- 现有提交 JSON/CSV 导出不是完整状态备份，不能承诺完整恢复人工操作和附件。
- 后台批处理是进程内任务，重启可能中断。免费试用不承诺持续在线或无人值守批处理。

## 3. 先发布个人后端

先登录 [Render 控制台](https://dashboard.render.com/)，核对 workspace 套餐和支付方式。如果无法提供无支付方式的目标 workspace，先停止发布，重新选择免费后端方案。

使用自己的 `Bcs-oh/FS` 仓库和包含本次部署文件的分支创建 **新的 Blueprint**：

1. 选择 **New → Blueprint**。
2. 连接个人仓库和对应分支。
3. 将 **Blueprint Path** 设置为 `render.free.yaml`。默认的 `render.yaml` 包含付费计算和磁盘设置，不适合本次零费用试用。
4. 确认预览只有一个 **Free Web Service**，名称为 `freightsentinel-personal-free` 或平台生成的带后缀名称，没有付费磁盘、数据库或密钥请求。
5. 部署后记下平台实际生成的 HTTPS 地址。不要猜测服务域名。

也可以手动创建新的 Free Web Service，使用以下设置：

- Runtime：Python。
- Repository root：仓库根目录，Root Directory 留空。
- Build Command：`pip install -r backend/requirements.txt`。
- Start Command：`uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`。
- Health Check Path：`/health`。
- 环境变量以 `render.free.yaml` 为准。

免费 Blueprint 设置了 `autoDeploy: false`。普通应用代码推送后需要在 Render 手动触发部署，减少自动构建消耗。修改关联的 `render.free.yaml` 仍可能触发 Blueprint 同步和部署；如需完全手动控制，还需在该 Blueprint 的 Settings 将 Auto Sync 设为 No。

必须从仓库根目录构建，使后端能读取 Git 跟踪的 `data/sdoc-hackathon-bundle.zip`。

[Render 自定义 Blueprint Path 说明](https://render.com/docs/infrastructure-as-code#setup)

## 4. 发布 Cloudflare 前端

登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，确认账号使用 Workers Free，然后创建 **Pages** 项目并连接个人仓库和对应分支。

- Project name：与 `frontend/wrangler.jsonc` 中的 `name` 一致，当前为 `freightsentinel-demo`。如果名称不可用，先同步修改配置。
- Root directory：`frontend`。
- Build command：`npm run build:pages`。
- Build output directory：`out`。
- 构建环境变量：`NEXT_PUBLIC_FREE_DEMO=1`。
- Pages Functions 的 `BACKEND_URL` 已在 `frontend/wrangler.jsonc` 的 `vars` 中配置，生产与预览环境共用该公开后端 origin。更换后端时同步修改此值，不带 `/api`。
- Wrangler 文件是 Pages 配置的来源；不要在控制台额外创建同名且冲突的绑定。若日后为 Preview 设置独立配置，需要分别维护对应环境的变量。

不要把 `AI_API_KEY` 或其他密钥填入任何 `NEXT_PUBLIC_*` 环境变量。

静态页面由 Pages 提供；`/api/*` 和 `/backend-health` 交给 Pages Functions 转发。前端不需要知道模型密钥。案例页面使用演示数据中的实际邮件 ID 生成静态路由；构建会核对数据包的 SHA-256，防止新数据沿用旧路由清单。

更换演示收件箱 ZIP 后，在 `frontend` 目录执行 `python3 scripts/generate-demo-routes.py`，提交更新的路由清单，然后重新构建。日常构建只需 Node；生成路由清单的 Python 脚本只在数据包变更时需要运行。

[Cloudflare 静态 Next.js 部署说明](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/)

## 5. 发布完成的判定

上线后需要实际打开平台生成的 URL，确认首页、收件箱、一个邮件详情及附件文本能访问，`/backend-health` 返回正常，试用提示和禁用的 AI 操作与本配置一致。免费后端冷启动时需要等待唤醒。

本地构建成功只说明代码能生成部署产物，不代表云端已经发布、已确认零费用，或能长期保存数据。
