# Health Preview Card

用 Home Assistant Lovelace 做的健康预览页：活动环、睡眠分段、近 7 日统计、生命体征、身体成分。一人一个标签，可设主色。

**Apple 健康数据不经过本卡片直接读 iPhone。** 数据来自 **Home Assistant iOS Companion App（官方 App）的传感器同步服务**——这是目前最新 Companion App 提供的能力（约 2026.8 Labs 起包含心率、HRV、血氧、体重、睡眠等 Apple Health 指标）。本卡片只读取已经出现在 HA 里的 `sensor.*`。

![仪表盘预览](docs/preview-dashboard.png)

![人物与传感器设置](docs/preview-settings.png)

---

## 工作原理

```
Apple Watch / iPhone
        │
        ▼
   Apple 健康 App（HealthKit）
        │
        ▼
Home Assistant Companion App（iOS）
   设置 → Companion App → 传感器
   打开健康相关传感器并授权「健康」权限
        │  周期性 / 前台 / 下拉刷新 同步
        ▼
Home Assistant 实体
   sensor.<手机名>_heart_rate
   sensor.<手机名>_health_steps
   sensor.<手机名>_sleep_duration
   …
        │
        ▼
Health Preview 卡片（Settings 里把实体映射到 steps / sleep / hr 等）
```

多人：每人一部已登录 HA 的 iPhone，各自打开传感器同步。实体前缀不同，在卡片里各建一个人物标签即可。

---

## 1. 在 iOS Companion App 里打开健康传感器

需要较新的 **Home Assistant Companion for iOS**（建议 2026.8 及以上，含 Apple Health 传感器）。

1. iPhone 安装并登录官方 Home Assistant App，能打开你的 HA。
2. 建议同时装 **Apple Watch 上的 HA 表盘组件**（任意 Complication），后台同步更稳。
3. 打开 App → **设置 → Companion App → 传感器（Sensors）**。
4. 找到健康 / Apple Health 相关项并打开（心率、步数、活动能量、睡眠、血氧、HRV、体重等）。未列出的传感器默认可能关闭，需手动启用。
5. 系统弹出「健康」权限时，允许 Companion App 读取对应类别。
6. 可选：同一页调节 **传感器更新频率**（普通 / 充电时加快 / 始终加快）。
7. 回到 HA 界面 **下拉刷新**，或把 App 留在后台。稍后在 HA「开发者工具 → 状态」里搜索 `heart_rate`、`sleep`、`steps`，应能看到以手机名为前缀的实体。

若传感器不更新：确认已授权健康权限、网络能连上 HA。必要时把 Companion App 划掉再打开。iOS 会限制后台，打开 Watch 组件和「始终加快」通常更稳。

实体名由设备名称决定，例如：

```
sensor.iphone_heart_rate
sensor.iphone_health_steps
sensor.iphone_active_energy
sensor.iphone_sleep_duration
sensor.iphone_deep_sleep
sensor.iphone_heart_rate_variability
sensor.iphone_blood_oxygen
sensor.iphone_weight
```

以你 HA 里实际 ID 为准。睡眠类请使用**分钟**（438 = 7 小时 18 分）。

---

## 2. 安装本卡片（HACS）

1. HACS → **⋯** → 自定义仓库
2. 地址：`https://github.com/zomosky/ha-health-preview`  
   类型：**Lovelace**
3. 下载 **Health Preview Card**
4. 新建一个 **面板（panel）** 视图：

```yaml
type: panel
title: 健康
path: health
icon: mdi:heart-pulse
cards:
  - type: custom:health-preview-card
```

或在任意视图点「添加卡片」→ Custom: Health Preview。

---

## 3. 在卡片里绑定传感器

打开卡片 → **Settings**：

1. 添加人物（名字 + 主色）
2. 把各指标填成 Companion App 同步出来的实体（可下拉选择）
3. 点 **Done**

配置存在本机，并尽量写入当前 HA 用户数据（`health_people`），**不会**写进 `configuration.yaml`。

| 卡片字段 | 含义 | 典型实体 |
|----------|------|----------|
| `steps` | 步数 | `sensor.iphone_health_steps` |
| `energy` | 活动能量 kcal | `sensor.iphone_active_energy` |
| `exercise` | 锻炼分钟 | `sensor.iphone_exercise_time` |
| `distance` | 步行+跑步 km | `sensor.iphone_walking_running_distance` |
| `flights` | 爬楼 | `sensor.iphone_flights_climbed` |
| `water` | 饮水 mL | `sensor.iphone_water` |
| `sleep` | 睡眠时长（分钟） | `sensor.iphone_sleep_duration` |
| `core` / `deep` / `rem` / `awake` | 睡眠分期（分钟） | 同前缀对应实体 |
| `rest_energy` | 基础代谢 | `sensor.iphone_resting_energy` |
| `hr` / `rhr` / `hrv` | 心率 / 静息 / HRV | `sensor.iphone_heart_rate` 等 |
| `spo2` | 血氧 | `sensor.iphone_blood_oxygen` |
| `resp` | 呼吸频率 | `sensor.iphone_respiratory_rate` |
| `walk_hr` | 步行平均心率 | `sensor.iphone_walking_heart_rate_average` |
| `weight` / `fat` / `height` / `vo2` | 身体成分 | `sensor.iphone_weight` 等 |

没有的指标留空。可选 YAML 种子（Settings 保存后会覆盖）：

```yaml
type: custom:health-preview-card
people:
  - id: me
    name: 我
    color: "#ff5a6a"
    sensors:
      steps: sensor.iphone_health_steps
      energy: sensor.iphone_active_energy
      sleep: sensor.iphone_sleep_duration
      hr: sensor.iphone_heart_rate
```

---

## 隐私

仓库不含任何真实健康样本、设备 ID、令牌或家庭实体名。预览图为虚构数据。卡片只查询你映射的实体，数据不离开你的 Home Assistant。

---

## English

Lovelace card that displays Apple Health **after** the official **Home Assistant Companion iOS app** has synced Health sensors into HA (Companion **2026.8+** Labs: heart rate, HRV, SpO2, weight, sleep, etc.). Enable them under **Settings → Companion App → Sensors**, grant Health access, then map entities in the card Settings UI.

Install via HACS (Lovelace): `https://github.com/zomosky/ha-health-preview`. Use a panel view with `type: custom:health-preview-card`. Sleep sensors should be in **minutes**.

## License

MIT
