# Health Preview Card

A Lovelace card for Home Assistant that shows an editorial, Apple Health–style dashboard: activity rings, sleep stages, 7-day stats, vitals, and body metrics.

- One tab per person, each with its own accent color
- In-card **Settings** UI to add people and map HA sensors — no YAML required after install
- Reads only entities already in your Home Assistant (Apple Health via Health Auto Export, iOS Shortcuts, Garmin, etc.)
- No cloud account, no telemetry, no bundled personal data

## Install (HACS)

1. HACS → **⋯** → Custom repositories
2. URL: your GitHub clone of this repo  
   Category: **Lovelace**
3. Download **Health Preview Card**
4. Restart Home Assistant if prompted
5. Add a dashboard view (panel mode recommended):

```yaml
type: panel
title: Health
path: health
icon: mdi:heart-pulse
cards:
  - type: custom:health-preview-card
```

Or add the card to any view from **Add card** → Custom: Health Preview.

## First use

Open the card → **Settings**:

1. Add a person (name + color)
2. Map sensors (`steps`, `sleep`, `hr`, …) from the dropdown
3. Tap **Done**

Config is stored in the browser and, when possible, on the current Home Assistant user (`frontend` user data key `health_people`). It is **not** written into `configuration.yaml`.

Optional YAML seed (overridden once Settings is saved):

```yaml
type: custom:health-preview-card
people:
  - id: me
    name: Me
    color: "#ff5a6a"
    sensors:
      steps: sensor.my_steps
      energy: sensor.my_active_energy
      sleep: sensor.my_sleep_duration
      hr: sensor.my_heart_rate
```

## Sensor keys

| Key | Typical source |
|-----|----------------|
| `steps` | Steps |
| `energy` | Active energy (kcal) |
| `exercise` | Exercise minutes |
| `distance` | Walking + running (km) |
| `flights` | Flights climbed |
| `water` | Water (mL) |
| `sleep` | Sleep duration (min) |
| `core` / `deep` / `rem` / `awake` | Sleep stages (min) |
| `rest_energy` | Resting energy |
| `hr` / `rhr` / `hrv` | Heart rate / resting / HRV |
| `spo2` | Blood oxygen |
| `resp` | Respiratory rate |
| `walk_hr` | Walking heart-rate average |
| `weight` / `fat` / `height` / `vo2` | Body |

Leave unused keys empty.

## Privacy

This repository contains **no** personal health samples, device IDs, tokens, or household entity names. The card only queries entities you map.

## 中文

Home Assistant Lovelace 卡片：类似 Apple 健康的预览页（活动环、睡眠分段、近 7 日统计）。

- 一人一个标签，可设主色
- 卡片内「Settings」添加人物并绑定传感器，不必先写 YAML
- 只读你 HA 里已有的实体，无云账号、无埋点、仓库不含任何个人健康数据

HACS → 自定义仓库 → Lovelace → 下载本仓库。仪表盘建议用 **panel** 视图放一张 `custom:health-preview-card`。打开卡片点 Settings 映射 `steps` / `sleep` / `hr` 等即可。

配置存在当前浏览器，并尽量写入 HA 用户数据（`health_people`），**不会**写进 `configuration.yaml`。

## License

MIT
