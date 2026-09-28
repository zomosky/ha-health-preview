(() => {
  const CARD_TAG = "health-preview-card";
  const USER_DATA_KEY = "health_people";
  const COLORS = ["#ff5a6a", "#6ea8d8", "#c6f04c", "#c4a574", "#5ee0c7", "#c9a0b0", "#e8a87c"];
  const SENSOR_FIELDS = [
    ["steps", "Steps"], ["energy", "Active energy"], ["exercise", "Exercise min"],
    ["distance", "Distance"], ["flights", "Flights"], ["water", "Water"],
    ["sleep", "Sleep"], ["core", "Core"], ["deep", "Deep"], ["rem", "REM"],
    ["awake", "Awake"], ["rest_energy", "Resting energy"],
    ["hr", "Heart rate"], ["rhr", "Resting HR"], ["hrv", "HRV"], ["spo2", "SpO2"],
    ["resp", "Breathing"], ["walk_hr", "Walking HR"],
    ["weight", "Weight"], ["fat", "Body fat"], ["vo2", "VO2 Max"], ["height", "Height"],
  ];
  const CUMUL_KEYS = new Set(["steps", "energy", "exercise", "distance", "flights", "water", "rest_energy"]);
  const GOAL = { energy: 400, exercise: 30, steps: 8000, sleep: 450 };

  const CSS = `
    :host { display: block; }
    * { box-sizing: border-box; }
    .wrap {
      background: #0c0b09; color: #f4eee6;
      font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      padding: 28px 24px 48px; min-height: 70vh;
    }
    .kicker { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: #8d8478; }
    h1 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(32px, 5vw, 52px); letter-spacing: -.03em; margin: 8px 0 0; font-weight: 600; }
    header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid rgba(244,238,230,.1); }
    .asof { text-align: right; color: #8d8478; font-size: 13px; }
    .lede { margin: 22px 0 28px; font-family: Georgia, serif; font-size: clamp(16px, 2vw, 22px); color: #d9d0c4; max-width: 46rem; }
    .lede em { font-style: italic; color: #f4eee6; }
    .tabs-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin: 18px 0 8px; }
    .tabs { display: flex; gap: 4px; flex-wrap: wrap; flex: 1; }
    .tab { border: 0; background: none; color: #8d8478; cursor: pointer; font: 500 14px inherit; padding: 8px 14px 10px; border-bottom: 2px solid transparent; }
    .tab.on { color: #f4eee6; border-bottom-color: var(--accent, #ff5a6a); }
    .gear { border: 1px solid rgba(244,238,230,.12); background: none; color: #8d8478; padding: 7px 12px; cursor: pointer; font: 13px inherit; }
    .hero { display: grid; grid-template-columns: 240px 1fr; gap: 36px; align-items: center; margin-bottom: 36px; }
    .rings { position: relative; width: 220px; height: 220px; margin: 0 auto; }
    .rings svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; pointer-events: none; }
    .ring-center .num { font-family: Georgia, serif; font-size: 36px; font-weight: 600; }
    .ring-center .sub { font-size: 11px; color: #8d8478; margin-top: 4px; letter-spacing: .08em; }
    .metric { display: grid; grid-template-columns: 10px 1fr; gap: 8px 12px; margin-bottom: 14px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 10px; }
    .metric .label { font-size: 12px; color: #8d8478; }
    .metric .now { font-family: Georgia, serif; font-size: 30px; font-weight: 600; line-height: 1; }
    .unit { font-size: 13px; color: #8d8478; margin-left: 4px; font-family: inherit; }
    .metric .stat { grid-column: 2; font-size: 12px; color: #8d8478; }
    .sleep { display: grid; grid-template-columns: 1.1fr 1fr; gap: 28px; padding: 28px 0; border-top: 1px solid rgba(244,238,230,.1); border-bottom: 1px solid rgba(244,238,230,.1); }
    .sleep-num { font-family: Georgia, serif; font-size: clamp(48px, 7vw, 80px); font-weight: 600; letter-spacing: -.04em; line-height: .9; }
    .sleep-num span { font-size: .42em; color: #8d8478; margin: 0 4px; }
    h2 { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: #8d8478; font-weight: 500; margin-bottom: 8px; }
    .stage-bar { display: flex; height: 16px; overflow: hidden; margin: 14px 0 8px; background: #1c1916; }
    .stage-bar i { display: block; height: 100%; }
    .stage-keys { display: flex; flex-wrap: wrap; gap: 10px 14px; font-size: 12px; color: #8d8478; }
    .stage-keys i { display: inline-block; width: 8px; height: 8px; margin-right: 5px; }
    .chart { display: flex; align-items: flex-end; gap: 5px; height: 140px; }
    .chart .col { flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; min-width: 0; }
    .chart .stack { width: 62%; display: flex; flex-direction: column-reverse; height: 110px; }
    .chart .bar { width: 62%; background: #5ee0c7; min-height: 2px; }
    .chart .bar:not(.today) { opacity: .55; }
    .chart .xl { margin-top: 6px; font-size: 10px; color: #8d8478; }
    .caption { font-size: 12px; color: #8d8478; margin-top: 10px; }
    .section { padding: 28px 0; border-bottom: 1px solid rgba(244,238,230,.1); }
    .vitals { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; }
    .vital { padding: 8px 18px 8px 0; border-right: 1px solid rgba(244,238,230,.1); }
    .vital:last-child { border-right: 0; }
    .vital .now { font-family: Georgia, serif; font-size: 36px; font-weight: 600; margin: 6px 0 4px; }
    .vital .now small { font-size: 14px; color: #8d8478; margin-left: 4px; }
    .spark { width: 100%; height: 44px; margin-top: 8px; }
    .bodyrow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    .bodyrow .now { font-family: Georgia, serif; font-size: 30px; font-weight: 600; margin: 6px 0; }
    .stale { color: #e0b15a; font-size: 12px; }
    .empty { display: none; padding: 48px 0; font-family: Georgia, serif; font-size: 20px; color: #8d8478; max-width: 28rem; }
    .empty.show { display: block; }
    .board.hide { display: none; }
    .sheet { display: none; position: fixed; inset: 0; z-index: 50; background: rgba(8,7,6,.72); }
    .sheet.open { display: block; }
    .sheet-panel { position: absolute; right: 0; top: 0; bottom: 0; width: min(420px, 100%); background: #14110e; overflow: auto; padding: 24px 20px 72px; }
    .sheet-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; }
    .sheet-head h3 { font-family: Georgia, serif; font-size: 24px; margin: 0; font-weight: 600; }
    .sheet-head button, .sheet-actions button { border: 1px solid rgba(244,238,230,.12); background: none; color: #f4eee6; padding: 7px 12px; cursor: pointer; font: 13px inherit; }
    .person-card { border-top: 1px solid rgba(244,238,230,.1); padding: 14px 0; }
    .person-card label { display: block; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #8d8478; margin: 8px 0 5px; }
    .person-card input[type=text], .sensor-row input { width: 100%; background: #0c0b09; color: #f4eee6; border: 1px solid rgba(244,238,230,.12); padding: 7px 8px; font: 12px inherit; }
    .swatches { display: flex; gap: 8px; flex-wrap: wrap; }
    .swatch { width: 22px; height: 22px; border: 2px solid transparent; cursor: pointer; padding: 0; }
    .swatch.on { border-color: #f4eee6; }
    .sensor-row { display: grid; grid-template-columns: 92px 1fr; gap: 8px; align-items: center; margin-bottom: 5px; }
    .sensor-row span { font-size: 12px; color: #8d8478; }
    .btn-del { color: #e0b15a; }
    .hint { font-size: 12px; color: #8d8478; margin-top: 14px; }
    .sheet-actions { display: flex; gap: 8px; margin-top: 14px; }
    @media (max-width: 860px) {
      .hero, .sleep, .vitals, .bodyrow { grid-template-columns: 1fr; }
      .vital { border-right: 0; border-bottom: 1px solid rgba(244,238,230,.1); padding: 12px 0; }
    }
  `;

  function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
  function fmt(n, d = 0) {
    return n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
  }
  function hm(min) {
    if (min == null) return { h: 0, m: 0, text: "—" };
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    return { h, m, text: `${h}h ${m}m` };
  }
  function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }
  function delta(now, avg) {
    if (now == null || !avg) return "";
    const p = ((now - avg) / avg) * 100;
    return `${p >= 0 ? "+" : ""}${p.toFixed(0)}%`;
  }
  function cstParts(iso) {
    const t = new Date(iso);
    const s = t.toLocaleString("sv-SE", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" });
    const [day, time] = s.split(" ");
    const [hh, mm] = (time || "00:00").split(":");
    return { day, hour: Number(hh), minute: Number(mm) };
  }
  function lastN(daily, key, n, excludeToday, today) {
    const days = Object.keys((daily && daily[key]) || {}).sort();
    const use = excludeToday ? days.filter((d) => d !== today) : days;
    return use.slice(-n).map((d) => ({ d, ...(daily[key][d] || {}) }));
  }

  class HealthPreviewCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._hass = null;
      this._config = {};
      this._people = [{ id: "me", name: "Me", color: "#ff5a6a", sensors: {} }];
      this._current = this._people[0];
      this._last = null;
      this._mounted = false;
      this._timer = null;
    }

    setConfig(config) {
      this._config = config || {};
      if (Array.isArray(this._config.people) && this._config.people.length) {
        this._people = this._config.people.map((p, i) => ({
          id: p.id || `p${i}`,
          name: p.name || `Person ${i + 1}`,
          color: p.color || COLORS[i % COLORS.length],
          sensors: { ...(p.sensors || {}) },
        }));
        this._current = this._people[0];
      }
    }

    set hass(hass) {
      this._hass = hass;
      if (!this._mounted) {
        this._mounted = true;
        this._mount();
        this._boot();
      }
    }

    getCardSize() { return 16; }

    static getStubConfig() {
      return { people: [{ id: "me", name: "Me", color: "#ff5a6a", sensors: {} }] };
    }

    disconnectedCallback() {
      if (this._timer) clearInterval(this._timer);
    }

    _sid(key) { return (this._current.sensors || {})[key] || ""; }
    _hasSensors(p) { return Object.values(p.sensors || {}).some(Boolean); }
    _allIds() {
      const ids = [];
      this._people.forEach((p) => Object.values(p.sensors || {}).forEach((id) => { if (id) ids.push(id); }));
      return [...new Set(ids)];
    }
    _cumulIds() {
      const ids = new Set();
      this._people.forEach((p) => {
        Object.entries(p.sensors || {}).forEach(([k, id]) => {
          if (id && CUMUL_KEYS.has(k)) ids.add(id);
        });
      });
      return ids;
    }

    _mount() {
      const root = this.shadowRoot;
      root.innerHTML = `<style>${CSS}</style>
        <div class="wrap">
          <header>
            <div><div class="kicker">Health Preview</div><h1 id="titleDate">Today</h1></div>
            <div class="asof">Live · <b id="asof">—</b></div>
          </header>
          <div class="tabs-row">
            <div class="tabs" id="tabs"></div>
            <button class="gear" type="button" id="btnSettings">Settings</button>
          </div>
          <div class="empty" id="empty">No sensors mapped. Open Settings, add a person, and pick entities.</div>
          <div class="board" id="board">
            <p class="lede" id="lede"></p>
            <div class="hero">
              <div class="rings">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,90,106,.14)" stroke-width="7"/>
                  <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(198,240,76,.14)" stroke-width="7"/>
                  <circle cx="60" cy="60" r="32" fill="none" stroke="rgba(94,224,199,.14)" stroke-width="7"/>
                  <circle id="rMove" cx="60" cy="60" r="52" fill="none" stroke="var(--accent,#ff5a6a)" stroke-width="7" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100"/>
                  <circle id="rEx" cx="60" cy="60" r="42" fill="none" stroke="#c6f04c" stroke-width="7" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100"/>
                  <circle id="rStep" cx="60" cy="60" r="32" fill="none" stroke="#5ee0c7" stroke-width="7" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100"/>
                </svg>
                <div class="ring-center"><div class="num" id="ringScore">—</div><div class="sub">today</div></div>
              </div>
              <div>
                <div class="metric"><div class="dot" style="background:var(--accent,#ff5a6a)"></div><div><div class="label">Active energy</div><div class="now" id="energyNow">—</div></div><div class="stat" id="energyStat"></div></div>
                <div class="metric"><div class="dot" style="background:#c6f04c"></div><div><div class="label">Exercise</div><div class="now" id="exNow">—</div></div><div class="stat" id="exStat"></div></div>
                <div class="metric"><div class="dot" style="background:#5ee0c7"></div><div><div class="label">Steps</div><div class="now" id="stepNow">—</div></div><div class="stat" id="stepStat"></div></div>
              </div>
            </div>
            <section class="sleep">
              <div>
                <h2>Last night</h2>
                <div class="sleep-num" id="sleepNum">—</div>
                <div class="stage-bar" id="stageBar"></div>
                <div class="stage-keys" id="stageKeys"></div>
                <p class="caption" id="sleepCap"></p>
              </div>
              <div>
                <h2>10 nights</h2>
                <div id="nightChart"></div>
              </div>
            </section>
            <section class="section">
              <h2>10-day activity</h2>
              <div id="stepBars"></div>
              <p class="caption" id="stepCap"></p>
            </section>
            <section class="section">
              <h2>Vitals</h2>
              <div class="vitals">
                <div class="vital"><div class="label">Heart rate</div><div class="now" id="hrNow">—</div><div class="stat" id="hrStat"></div><svg class="spark" id="hrSpark" viewBox="0 0 240 44" preserveAspectRatio="none"></svg></div>
                <div class="vital"><div class="label">Resting</div><div class="now" id="rhrNow">—</div><div class="stat" id="rhrStat"></div></div>
                <div class="vital"><div class="label">HRV</div><div class="now" id="hrvNow">—</div><div class="stat" id="hrvStat"></div></div>
                <div class="vital"><div class="label">SpO2</div><div class="now" id="spoNow">—</div><div class="stat" id="spoStat"></div></div>
              </div>
            </section>
            <section class="section" style="border-bottom:0">
              <h2>Body</h2>
              <div class="bodyrow">
                <div><div class="label">Weight</div><div class="now" id="wtNow">—</div><div class="stale" id="wtStat"></div></div>
                <div><div class="label">BMI</div><div class="now" id="bmiNow">—</div><div class="caption" id="bmiStat"></div></div>
                <div><div class="label">Body fat</div><div class="now" id="fatNow">—</div></div>
                <div><div class="label">VO2 Max</div><div class="now" id="voNow">—</div></div>
              </div>
            </section>
          </div>
        </div>
        <div class="sheet" id="sheet">
          <div class="sheet-panel">
            <div class="sheet-head"><h3>People</h3><button type="button" id="btnClose">Done</button></div>
            <div id="peopleEditor"></div>
            <div class="sheet-actions"><button type="button" id="btnAdd">Add person</button></div>
            <p class="hint">Map each metric to a Home Assistant sensor entity. Saved on this device and, when possible, on your HA user profile. No data leaves your home.</p>
          </div>
        </div>
        <datalist id="sensorList"></datalist>`;

      this._$ = (id) => root.getElementById(id);
      this._$("btnSettings").onclick = () => { this._renderEditor(); this._$("sheet").classList.add("open"); this._fillSensors(); };
      this._$("btnClose").onclick = () => this._closeSettings();
      this._$("btnAdd").onclick = () => {
        this._people.push({ id: "p" + Date.now(), name: "New person", color: COLORS[this._people.length % COLORS.length], sensors: {} });
        this._renderEditor();
      };
      this._$("sheet").addEventListener("click", (e) => { if (e.target.id === "sheet") this._closeSettings(); });
    }

    async _boot() {
      await this._loadPeople();
      this._drawTabs();
      await this._refresh();
      this._timer = setInterval(() => this._refresh(), 120000);
    }

    async _ws(type, extra = {}) {
      if (!this._hass || !this._hass.connection) throw new Error("no hass");
      return this._hass.connection.sendMessagePromise({ type, ...extra });
    }

    async _loadPeople() {
      try {
        const r = await this._ws("frontend/get_user_data", { key: USER_DATA_KEY });
        if (r && r.value && Array.isArray(r.value) && r.value.length) this._people = r.value;
      } catch (_) { /* keep yaml/default */ }
      if (!this._people.length) this._people = [{ id: "me", name: "Me", color: "#ff5a6a", sensors: {} }];
      this._current = this._people[0];
    }

    _persistPeople() {
      this._ws("frontend/set_user_data", { key: USER_DATA_KEY, value: this._people }).catch(() => {});
    }

    _drawTabs() {
      const box = this._$("tabs");
      box.innerHTML = this._people.map((p) =>
        `<button class="tab${p.id === this._current.id ? " on" : ""}" data-id="${p.id}" style="${p.id === this._current.id ? `border-bottom-color:${p.color}` : ""}">${p.name}</button>`
      ).join("");
      box.querySelectorAll(".tab").forEach((btn) => {
        btn.onclick = () => {
          this._current = this._people.find((x) => x.id === btn.dataset.id) || this._people[0];
          this.shadowRoot.host.style.setProperty("--accent", this._current.color);
          this._drawTabs();
          if (this._last) this._render(this._last);
        };
      });
      this.shadowRoot.host.style.setProperty("--accent", this._current.color);
    }

    _renderEditor() {
      const box = this._$("peopleEditor");
      box.innerHTML = this._people.map((p, i) => {
        const sw = COLORS.map((c) => `<button type="button" class="swatch${p.color === c ? " on" : ""}" data-i="${i}" data-c="${c}" style="background:${c}"></button>`).join("");
        const rows = SENSOR_FIELDS.map(([k, lab]) =>
          `<div class="sensor-row"><span>${lab}</span><input list="sensorList" data-i="${i}" data-k="${k}" value="${(p.sensors && p.sensors[k]) || ""}" placeholder="sensor.xxx"></div>`
        ).join("");
        return `<div class="person-card">
          <label>Name</label><input type="text" data-i="${i}" data-f="name" value="${p.name || ""}">
          <label>Color</label><div class="swatches">${sw}</div>
          <label>Sensors</label>${rows}
          ${this._people.length > 1 ? `<div class="sheet-actions"><button type="button" class="btn-del" data-del="${i}">Remove</button></div>` : ""}
        </div>`;
      }).join("");
      box.querySelectorAll("input[data-f=name]").forEach((inp) => { inp.oninput = () => { this._people[+inp.dataset.i].name = inp.value; }; });
      box.querySelectorAll("input[data-k]").forEach((inp) => {
        inp.oninput = () => {
          const p = this._people[+inp.dataset.i];
          p.sensors = p.sensors || {};
          const v = inp.value.trim();
          if (v) p.sensors[inp.dataset.k] = v; else delete p.sensors[inp.dataset.k];
        };
      });
      box.querySelectorAll(".swatch").forEach((btn) => {
        btn.onclick = () => { this._people[+btn.dataset.i].color = btn.dataset.c; this._renderEditor(); };
      });
      box.querySelectorAll("[data-del]").forEach((btn) => {
        btn.onclick = () => {
          const i = +btn.dataset.del;
          const gone = this._people[i].id;
          this._people.splice(i, 1);
          if (this._current.id === gone) this._current = this._people[0];
          this._renderEditor();
        };
      });
    }

    async _fillSensors() {
      const list = this._$("sensorList");
      if (!this._hass) return;
      list.innerHTML = Object.values(this._hass.states)
        .filter((s) => s.entity_id.startsWith("sensor."))
        .map((s) => `<option value="${s.entity_id}">${(s.attributes && s.attributes.friendly_name) || s.entity_id}</option>`)
        .join("");
    }

    async _closeSettings() {
      this._persistPeople();
      this._$("sheet").classList.remove("open");
      if (!this._people.some((p) => p.id === this._current.id)) this._current = this._people[0];
      this._drawTabs();
      await this._refresh();
    }

    async _refresh() {
      if (!this._hass) return;
      try {
        const data = await this._fetchLive();
        this._last = data;
        this._render(data);
      } catch (e) {
        this._$("lede").textContent = "Could not load history.";
      }
    }

    async _fetchLive() {
      const hass = this._hass;
      const ids = this._allIds();
      const today = cstParts(new Date().toISOString()).day;
      const states = {};
      ids.forEach((id) => {
        const s = hass.states[id];
        if (s) states[id] = { state: s.state, unit: s.attributes.unit_of_measurement, last_updated: s.last_updated, name: s.attributes.friendly_name };
      });
      const startIso = new Date(Date.now() - 10 * 86400000).toISOString();
      const endIso = new Date().toISOString();
      const hist = {};
      const cumul = this._cumulIds();
      for (const id of ids) {
        try {
          const data = await hass.callApi("GET", `history/period/${encodeURIComponent(startIso)}?filter_entity_id=${id}&end_time=${encodeURIComponent(endIso)}`);
          hist[id] = ((data && data[0]) || []).map((p) => {
            const v = Number(p.state);
            if (!Number.isFinite(v)) return null;
            const c = cstParts(p.last_changed || p.last_updated);
            return { t: p.last_changed || p.last_updated, v, day: c.day, hour: c.hour, minute: c.minute };
          }).filter(Boolean);
        } catch { hist[id] = []; }
      }
      const daily = {};
      for (const [eid, pts] of Object.entries(hist)) {
        const by = {};
        pts.forEach((p) => { (by[p.day] ||= []).push(p); });
        const out = {};
        Object.keys(by).sort().forEach((day) => {
          const arr = by[day].slice().sort((a, b) => a.t.localeCompare(b.t));
          if (cumul.has(eid)) {
            let cleaned = arr;
            if (arr.length >= 2 && arr[0].hour === 0 && arr[0].minute === 0 && arr[0].v > Math.max(...arr.slice(1).map((x) => x.v)) + 20) cleaned = arr.slice(1);
            const vs = cleaned.map((x) => x.v);
            out[day] = { last: vs[vs.length - 1], max: Math.max(...vs), min: Math.min(...vs), n: vs.length };
          } else {
            const vs = arr.map((x) => x.v);
            out[day] = { last: vs[vs.length - 1], mean: Math.round((vs.reduce((a, b) => a + b, 0) / vs.length) * 100) / 100, min: Math.min(...vs), max: Math.max(...vs), n: vs.length };
          }
        });
        daily[eid] = out;
      }
      return { generated_at: new Date().toISOString(), today, states, daily, hist };
    }

    _render(data) {
      const empty = this._$("empty"), board = this._$("board");
      if (!this._hasSensors(this._current)) { empty.classList.add("show"); board.classList.add("hide"); return; }
      empty.classList.remove("show"); board.classList.remove("hide");
      const st = data.states, daily = data.daily, today = data.today;
      const val = (key) => { const id = this._sid(key); return id ? num(st[id] && st[id].state) : null; };
      const steps = val("steps"), energy = val("energy"), ex = val("exercise"), dist = val("distance");
      const sleep = val("sleep"), core = val("core"), deep = val("deep"), rem = val("rem"), awake = val("awake");
      const hr = val("hr"), rhr = val("rhr"), hrv = val("hrv"), spo = val("spo2");
      const wt = val("weight"), fat = val("fat"), height = val("height"), vo = val("vo2");
      const water = val("water"), restE = val("rest_energy");

      const dt = new Date(`${today}T12:00:00`);
      this._$("titleDate").textContent = dt.toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" });
      this._$("asof").textContent = new Date(data.generated_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

      const s7 = lastN(daily, this._sid("steps"), 7, true, today);
      const e7 = lastN(daily, this._sid("energy"), 7, true, today);
      const x7 = lastN(daily, this._sid("exercise"), 7, true, today);
      const sl7 = lastN(daily, this._sid("sleep"), 7, true, today);
      const avgS = mean(s7.map((r) => r.last)), avgE = mean(e7.map((r) => r.last)), avgX = mean(x7.map((r) => r.last)), avgSl = mean(sl7.map((r) => r.last));

      const pMove = energy != null ? (energy / GOAL.energy) * 100 : 0;
      const pEx = ex != null ? (ex / GOAL.exercise) * 100 : 0;
      const pStep = steps != null ? (steps / GOAL.steps) * 100 : 0;
      const score = Math.round(Math.min(100, (Math.min(pMove, 100) + Math.min(pEx, 100) + Math.min(pStep, 100)) / 3));
      const ring = (el, pct) => el.setAttribute("stroke-dasharray", `${Math.max(0, Math.min(100, pct || 0))} ${100 - Math.max(0, Math.min(100, pct || 0))}`);
      ring(this._$("rMove"), pMove); ring(this._$("rEx"), pEx); ring(this._$("rStep"), pStep);
      this._$("ringScore").textContent = `${score}%`;
      this._$("energyNow").innerHTML = `${fmt(energy, 0)}<span class="unit">kcal</span>`;
      this._$("exNow").innerHTML = `${fmt(ex, 0)}<span class="unit">min</span>`;
      this._$("stepNow").innerHTML = `${fmt(steps, 0)}<span class="unit"></span>`;
      this._$("energyStat").textContent = `goal ${GOAL.energy} · 7d avg ${fmt(avgE, 0)}`;
      this._$("exStat").textContent = `goal ${GOAL.exercise} · 7d avg ${fmt(avgX, 0)}`;
      this._$("stepStat").textContent = `goal ${GOAL.steps} · 7d avg ${fmt(avgS, 0)}${dist != null ? ` · ${fmt(dist, 2)} km` : ""}`;

      const sl = hm(sleep);
      this._$("sleepNum").innerHTML = `${sl.h}<span>h</span>${sl.m}<span>m</span>`;
      const stages = [{ k: "Core", v: core, c: "#4d6d8a" }, { k: "REM", v: rem, c: "#8fb4c9" }, { k: "Deep", v: deep, c: "#c4a574" }, { k: "Awake", v: awake, c: "#5a534c" }];
      const sum = stages.reduce((a, s) => a + (s.v || 0), 0) || 1;
      this._$("stageBar").innerHTML = stages.map((s) => `<i style="width:${((s.v || 0) / sum) * 100}%;background:${s.c}"></i>`).join("");
      this._$("stageKeys").innerHTML = stages.map((s) => `<span><i style="background:${s.c}"></i>${s.k} ${s.v || 0}m</span>`).join("");
      this._$("sleepCap").textContent = `7-night avg ${hm(avgSl).text}`;

      const nights = lastN(daily, this._sid("sleep"), 10, false, today);
      const nmax = Math.max(...nights.map((r) => r.last || 1), 1);
      this._$("nightChart").innerHTML = `<div class="chart">${nights.map((r) => {
        const coreV = (daily[this._sid("core")] || {})[r.d]?.last || 0;
        const remV = (daily[this._sid("rem")] || {})[r.d]?.last || 0;
        const deepV = (daily[this._sid("deep")] || {})[r.d]?.last || 0;
        return `<div class="col"><div class="stack">
          <div class="seg" style="height:${(coreV / nmax) * 110}px;background:#4d6d8a"></div>
          <div class="seg" style="height:${(remV / nmax) * 110}px;background:#8fb4c9"></div>
          <div class="seg" style="height:${(deepV / nmax) * 110}px;background:#c4a574"></div>
        </div><div class="xl">${Number(String(r.d).slice(8))}</div></div>`;
      }).join("")}</div>`;

      const stepRows = lastN(daily, this._sid("steps"), 10, false, today);
      const smax = Math.max(...stepRows.map((r) => r.last || 1), 1);
      this._$("stepBars").innerHTML = `<div class="chart">${stepRows.map((r) =>
        `<div class="col"><div class="bar${r.d === today ? " today" : ""}" style="height:${Math.max(2, (r.last / smax) * 110)}px"></div><div class="xl">${Number(String(r.d).slice(8))}</div></div>`
      ).join("")}</div>`;
      const best = stepRows.reduce((a, b) => (b.last > (a.last || 0) ? b : a), stepRows[0] || { d: "", last: 0 });
      this._$("stepCap").textContent = best.d ? `peak ${best.d.slice(5)} · ${fmt(best.last, 0)} steps${water != null ? ` · water ${fmt(water, 0)}` : ""}${restE != null ? ` · rest ${fmt(restE, 0)} kcal` : ""}` : "";

      this._$("hrNow").innerHTML = `${fmt(hr, 0)}<small>bpm</small>`;
      const hrDay = (daily[this._sid("hr")] || {})[today];
      this._$("hrStat").textContent = hrDay ? `today ${fmt(hrDay.min, 0)}–${fmt(hrDay.max, 0)}` : "";
      const spark = ((data.hist && data.hist[this._sid("hr")]) || []).slice(-180);
      this._spark(this._$("hrSpark"), spark, this._current.color);
      const rhr7 = lastN(daily, this._sid("rhr"), 7, true, today);
      const hrv7 = lastN(daily, this._sid("hrv"), 7, true, today);
      const spo7 = lastN(daily, this._sid("spo2"), 7, true, today);
      this._$("rhrNow").innerHTML = `${fmt(rhr, 0)}<small>bpm</small>`;
      this._$("rhrStat").textContent = `7d ${fmt(mean(rhr7.map((r) => r.last)), 0)} ${delta(rhr, mean(rhr7.map((r) => r.last)))}`;
      this._$("hrvNow").innerHTML = `${fmt(hrv, 1)}<small>ms</small>`;
      this._$("hrvStat").textContent = `7d ${fmt(mean(hrv7.map((r) => r.mean ?? r.last)), 0)}`;
      this._$("spoNow").innerHTML = `${fmt(spo, 0)}<small>%</small>`;
      this._$("spoStat").textContent = `7d ${fmt(mean(spo7.map((r) => r.mean ?? r.last)), 1)}`;

      this._$("wtNow").textContent = wt == null ? "—" : `${fmt(wt, 1)}`;
      const wtS = st[this._sid("weight")];
      if (wtS && wtS.last_updated) {
        const days = Math.round((Date.now() - new Date(wtS.last_updated).getTime()) / 86400000);
        this._$("wtStat").textContent = days > 1 ? `${days}d ago` : "";
      } else this._$("wtStat").textContent = "";
      const bmi = wt && height ? wt / Math.pow(height / 100, 2) : null;
      this._$("bmiNow").textContent = fmt(bmi, 1);
      this._$("bmiStat").textContent = bmi == null ? "" : (bmi < 18.5 ? "low" : bmi < 24 ? "ok" : bmi < 28 ? "high" : "obese");
      this._$("fatNow").textContent = fat == null ? "—" : `${fmt(fat, 0)}%`;
      this._$("voNow").textContent = fmt(vo, 1);

      let lede = "";
      if (sleep != null && sleep >= 420) lede = `Last night <em>${sl.text}</em>.`;
      else if (sleep != null) lede = `Last night ${sl.text}.`;
      if (avgS && steps != null && steps < avgS * 0.45) lede += " Activity is below the 7-day average.";
      this._$("lede").innerHTML = lede || "Live from Home Assistant.";
    }

    _spark(el, pts, color) {
      if (!pts || pts.length < 2) { el.innerHTML = ""; return; }
      const w = 240, h = 44, vs = pts.map((p) => p.v);
      const min = Math.min(...vs), max = Math.max(...vs), span = (max - min) || 1;
      const d = vs.map((v, i) => {
        const x = (i / (vs.length - 1)) * w;
        const y = h - ((v - min) / span) * (h - 6) - 3;
        return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      el.innerHTML = `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/>`;
    }
  }

  if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, HealthPreviewCard);
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === CARD_TAG)) {
    window.customCards.push({
      type: CARD_TAG,
      name: "Health Preview",
      description: "Editorial health dashboard with per-person tabs",
      preview: false,
    });
  }
})();
