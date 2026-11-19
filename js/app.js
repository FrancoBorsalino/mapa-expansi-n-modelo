// Comidita · Expansion map demo. All store data is fictional.
(function () {
  'use strict';

  const BRAND = 'Comidita';
  // CARTO basemaps need a key: request a free one at https://carto.com/basemaps/apikey and paste it here.
  const CARTO_KEY = 'cb1_28jq_1_ec4565e452c8a31a09bc245d';
  const T = (k, v) => I18N.t(k, v);
  const N = (n, d) => I18N.num(n, d);

  // ---------- Visual encodings ----------
  const FORMAT_COLORS = { classic: '#12CFAE', express: '#8EE86F', roastery: '#CFAE7F' };
  const IX_STEPS = [[85, '#8EE86F'], [75, '#3FD9A0'], [65, '#12B39A'], [55, '#11807A'], [40, '#1A5157'], [0, '#1F3340']];
  const SEQ_BLUE = ['#22303D', '#2E4A63', '#3A6F93', '#5B9BC4', '#A9D3F0'];
  const SEQ_VIOLET = ['#2A2540', '#463A6E', '#6A55A3', '#9B7FD6', '#D3C2FF'];
  const SEG_COLORS = { 1: '#F7E0B5', 2: '#E8C48C', 3: '#CFAE7F', 4: '#A9855E', 5: '#7E6246', 6: '#584536', 7: '#3A2F28' };
  const RISK_COLORS = { 1: '#2B3A3F', 2: '#6B4B3E', 3: '#A95A41', 4: '#D96444', 5: '#FD724C', 6: '#FFB199' };
  const VARIABLES = ['ix', 'd', 's', 't', 'r', 'none'];
  const OVERLAYS = [
    { id: 'stores', on: true, swatch: 'linear-gradient(90deg,#12CFAE,#8EE86F)' },
    { id: 'coverage', on: false, swatch: 'transparent', ring: '#12CFAE' },
    { id: 'opps', on: false, swatch: 'rgba(142,232,111,.45)' },
    { id: 'zones', on: true, swatch: 'transparent', ring: '#93A1AF' },
    { id: 'hoods', on: false, swatch: 'transparent', ring: '#CFAE7F' },
    { id: 'settlements', on: false, swatch: 'rgba(253,114,76,.55)' },
    { id: 'rail', on: false, swatch: '#F8F3EC', round: true },
    { id: 'edu', on: false, swatch: '#D3C2FF', round: true },
    { id: 'bus', on: false, swatch: '#FD724C', round: true }
  ];

  const state = {
    variable: 'ix', opacity: 0.65, minIx: 75, radius: 700, scope: 'all',
    formats: new Set(Object.keys(FORMAT_COLORS)), storeQuery: '', opps: []
  };

  // ---------- Geometry helpers ----------
  const KX = 111.32 * Math.cos(-34.6 * Math.PI / 180), KY = 110.95;
  const distKm = (a, b) => Math.hypot((a[0] - b[0]) * KX, (a[1] - b[1]) * KY);

  function ringContains(ring, x, y) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function polyContains(poly, x, y) {
    if (!ringContains(poly[0], x, y)) return false;
    for (let h = 1; h < poly.length; h++) if (ringContains(poly[h], x, y)) return false;
    return true;
  }
  function geomContains(g, x, y) {
    if (g.type === 'Polygon') return polyContains(g.coordinates, x, y);
    if (g.type === 'MultiPolygon') return g.coordinates.some(p => polyContains(p, x, y));
    return false;
  }
  function bboxOf(g) {
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    const walk = arr => { if (typeof arr[0] === 'number') { a = Math.min(a, arr[0]); b = Math.min(b, arr[1]); c = Math.max(c, arr[0]); d = Math.max(d, arr[1]); } else arr.forEach(walk); };
    walk(g.coordinates);
    return [a, b, c, d];
  }
  function quantileBreaks(values, k) {
    const v = values.filter(x => x != null && x > 0).sort((p, q) => p - q);
    return Array.from({ length: k - 1 }, (_, i) => v[Math.floor(v.length * (i + 1) / k)]);
  }
  const classify = (val, breaks) => { let i = 0; while (i < breaks.length && val >= breaks[i]) i++; return i; };

  // ---------- Data ----------
  const data = {};
  let dBreaks, tBreaks;

  async function loadData() {
    const files = ['radios', 'stores', 'zones', 'neighbourhoods', 'settlements', 'pois', 'meta'];
    const res = await Promise.all(files.map(f => fetch(`data/${f}.json`).then(r => { if (!r.ok) throw new Error(f); return r.json(); })));
    files.forEach((f, i) => { data[f] = res[i]; });
    // Pre-compute bounding boxes and the nearest store for every census tract (stores never move).
    data.radios.features.forEach(f => {
      f.bbox = bboxOf(f.geometry);
      let best = Infinity, idx = -1;
      data.stores.forEach((s, i) => { const d = distKm(f.properties.c, s.c); if (d < best) { best = d; idx = i; } });
      f.properties._nd = best; f.properties._ns = idx;
    });
    dBreaks = quantileBreaks(data.radios.features.map(f => f.properties.d), 5);
    tBreaks = quantileBreaks(data.radios.features.map(f => f.properties.t), 5);
  }

  function radioAt(lon, lat) {
    return data.radios.features.find(f => lon >= f.bbox[0] && lon <= f.bbox[2] && lat >= f.bbox[1] && lat <= f.bbox[3] && geomContains(f.geometry, lon, lat));
  }
  function nearestStore(c) {
    let best = Infinity, s = null;
    data.stores.forEach(x => { const d = distKm(c, x.c); if (d < best) { best = d; s = x; } });
    return { store: s, km: best };
  }
  const zoneName = p => data.meta.zones[p.z];
  const areaName = p => (p.b >= 0 ? data.meta.hoods[p.b] : zoneName(p));
  const isCaba = p => zoneName(p).startsWith('Comuna ');
  const fmtKm = km => (km < 1 ? `${N(Math.round(km * 1000))} m` : `${N(km, 1)} km`);

  // ---------- Map ----------
  let map, radiosLayer, baseLayer, labelLayer, searchMarker, storeRenderer, coverageRenderer;
  const layers = {};

  function colorFor(p) {
    switch (state.variable) {
      case 'ix': if (p.ix == null) return null; return IX_STEPS.find(([min]) => p.ix >= min)[1];
      case 'd': return p.d > 0 ? SEQ_BLUE[classify(p.d, dBreaks)] : null;
      case 's': return p.s ? SEG_COLORS[p.s] : null;
      case 't': return p.t ? SEQ_VIOLET[classify(p.t, tBreaks)] : null;
      case 'r': return p.r ? RISK_COLORS[p.r] : null;
      default: return null;
    }
  }
  const radioStyle = f => {
    const c = colorFor(f.properties);
    return { stroke: false, fill: true, fillColor: c || '#000', fillOpacity: c ? state.opacity : 0 };
  };

  function setBasemap(kind) {
    if (baseLayer) map.removeLayer(baseLayer);
    if (labelLayer) map.removeLayer(labelLayer);
    const v = kind === 'light' ? 'light' : 'dark';
    const attr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
    baseLayer = L.tileLayer(`https://{s}.basemaps.cartocdn.com/${v}_nolabels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`, { attribution: attr, subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    labelLayer = L.tileLayer(`https://{s}.basemaps.cartocdn.com/${v}_only_labels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`, { subdomains: 'abcd', maxZoom: 19, pane: 'labels' }).addTo(map);
    document.querySelectorAll('#basemap button').forEach(b => b.classList.toggle('active', b.dataset.base === v));
  }

  function initMap() {
    map = L.map('map', { zoomControl: true, preferCanvas: true, minZoom: 9, maxBounds: [[-35.4, -59.4], [-34.0, -57.6]] })
      .setView([-34.605, -58.445], 12);
    // Custom panes ignore pointer events; only SVG paths marked interactive receive clicks, so the
    // census-tract canvas underneath stays clickable.
    const svg = {};
    [['labels', 450], ['outlines', 460], ['opps', 470], ['coverage', 480], ['pois', 610], ['stores', 620]]
      .forEach(([name, z]) => {
        const p = map.createPane(name); p.style.zIndex = z; p.style.pointerEvents = 'none';
        svg[name] = L.svg({ pane: name });
      });
    setBasemap('dark');

    radiosLayer = L.geoJSON(data.radios, { style: radioStyle, renderer: L.canvas({ padding: 0.3 }) }).addTo(map);
    radiosLayer.on('click', e => openRadioPopup(e.layer.feature, e.latlng));

    layers.zones = L.geoJSON(data.zones, {
      pane: 'outlines', interactive: false, renderer: svg.outlines,
      style: f => ({ color: '#93A1AF', weight: f.properties.caba ? 1 : 1.4, opacity: 0.6, fill: false })
    });
    layers.hoods = L.geoJSON(data.neighbourhoods, {
      pane: 'outlines', renderer: svg.outlines, style: { color: '#CFAE7F', weight: 1, opacity: 0.8, dashArray: '3 4', fill: false },
      onEachFeature: (f, l) => l.bindTooltip(f.properties.name, { sticky: true })
    });
    layers.settlements = L.geoJSON(data.settlements, {
      pane: 'outlines', renderer: svg.outlines, style: { color: '#FD724C', weight: 1, fillColor: '#FD724C', fillOpacity: 0.35 },
      onEachFeature: (f, l) => l.bindTooltip(`${f.properties.name} · ${f.properties.kind}`, { sticky: true })
    });
    const poiLayer = (kinds, style) => L.layerGroup(data.pois.filter(p => kinds.includes(p.k)).map(p =>
      L.circleMarker([p.c[1], p.c[0]], Object.assign({ pane: 'pois', renderer: svg.pois, weight: 1, color: '#0F171F', fillOpacity: 1 }, style)).bindTooltip(p.n)));
    layers.rail = poiLayer(['rail'], { radius: 4.5, fillColor: '#F8F3EC' });
    layers.edu = poiLayer(['uni', 'edu'], { radius: 3.5, fillColor: '#D3C2FF' });
    layers.bus = poiLayer(['bus'], { radius: 7, fillColor: '#FD724C' });

    layers.stores = L.layerGroup();
    layers.coverage = L.layerGroup();
    layers.opps = L.geoJSON(null, {
      pane: 'opps', interactive: false, renderer: L.canvas({ pane: 'opps' }), // non-interactive: canvas is fine here
      style: { color: '#8EE86F', weight: 1.4, opacity: 0.95, fillColor: '#8EE86F', fillOpacity: 0.12 }
    });
    storeRenderer = svg.stores;
    coverageRenderer = svg.coverage;
    buildStoreLayers();

    map.on('click', () => { if (window.innerWidth <= 860) document.getElementById('panel').classList.remove('open'); });
  }

  function storeIcon(s) {
    const col = FORMAT_COLORS[s.format];
    return {
      pane: 'stores', renderer: storeRenderer, radius: s.status === 'opening' ? 6 : 8,
      color: s.ownership === 'franchise' ? col : '#F8F3EC', weight: s.ownership === 'franchise' ? 3 : 2,
      fillColor: s.ownership === 'franchise' ? '#0F171F' : col, fillOpacity: 1,
      dashArray: s.status === 'opening' ? '2 3' : null
    };
  }
  function storePopup(s) {
    return `<div class="pop-title">${BRAND} ${s.name}${s.status === 'opening' ? `<span class="tag">${T('status.opening')}</span>` : ''}</div>
      <div class="pop-sub">${s.zone}${s.area !== s.zone ? ' · ' + s.area : ''} · ${s.id}</div>
      <div class="pop-grid">
        <span>${T('pop.format')}</span><b>${T('fmt.' + s.format)}</b>
        <span>${T('pop.ownership')}</span><b>${T('own.' + s.ownership)}</b>
        <span>${T('pop.status')}</span><b>${T('status.' + s.status)}</b>
        <span>${T('pop.opened')}</span><b>${s.opened}</b>
        <span>${T('pop.m2')}</span><b>${s.m2} m²</b>
        <span>${T('pop.tickets')}</span><b>${s.tickets ? N(s.tickets) : '—'}</b>
      </div>`;
  }
  function buildStoreLayers() {
    layers.stores.clearLayers(); layers.coverage.clearLayers();
    data.stores.forEach(s => {
      s._marker = L.circleMarker([s.c[1], s.c[0]], storeIcon(s)).bindPopup(() => storePopup(s)).addTo(layers.stores);
      L.circle([s.c[1], s.c[0]], {
        pane: 'coverage', renderer: coverageRenderer, radius: state.radius, interactive: false,
        color: '#12CFAE', weight: 1, opacity: 0.7, dashArray: '4 4', fillColor: '#12CFAE', fillOpacity: 0.05
      }).addTo(layers.coverage);
    });
  }
  function updateCoverage() { layers.coverage.eachLayer(c => c.setRadius(state.radius)); }

  function radioPopupHtml(f, header, nearest) {
    const p = f.properties;
    const near = nearest ? nearest.store : data.stores[p._ns];
    const nearKm = nearest ? nearest.km : p._nd;
    const seg = p.s ? T('seg.' + p.s) : T('legend.nodata');
    return `${header || ''}<div class="pop-title">${T('pop.radio')} · ${areaName(p)}</div>
      <div class="pop-sub">${zoneName(p)}</div>
      <div class="pop-grid">
        <span>${T('pop.ix')}</span><b>${p.ix != null ? `<span class="ix-badge">${p.ix}</span>` : '—'}</b>
        <span>${T('pop.pop')}</span><b>${N(p.p)}</b>
        <span>${T('pop.dens')}</span><b>${N(p.d)} ${T('unit.hkm2')}</b>
        <span>${T('pop.seg')}</span><b>${seg}</b>
        <span>${T('pop.bus')}</span><b>${p.t ? N(p.t) : '—'}</b>
        <span>${T('pop.risk')}</span><b>${p.r ?? '—'}</b>
        <span>${T('pop.edu')}</span><b>${p.e}</b>
        <span>${T('pop.nearest')}</span><b>${BRAND} ${near.name} · ${fmtKm(nearKm)}</b>
      </div>`;
  }
  function openRadioPopup(f, latlng, header) {
    L.popup({ maxWidth: 320 }).setLatLng(latlng).setContent(radioPopupHtml(f, header)).openOn(map);
  }

  // ---------- Panel: map tab ----------
  function renderVariableList() {
    const el = document.getElementById('variable-list');
    const sw = { ix: 'linear-gradient(90deg,#1A5157,#12B39A,#8EE86F)', d: 'linear-gradient(90deg,#2E4A63,#A9D3F0)', s: 'linear-gradient(90deg,#3A2F28,#F7E0B5)', t: 'linear-gradient(90deg,#463A6E,#D3C2FF)', r: 'linear-gradient(90deg,#2B3A3F,#FD724C)', none: 'transparent' };
    el.innerHTML = VARIABLES.map(v => `<label class="choice${v === state.variable ? ' active' : ''}">
      <input type="radio" name="variable" value="${v}"${v === state.variable ? ' checked' : ''}>
      <span class="swatch" style="background:${sw[v]};${v === 'none' ? 'border:1px solid #2A3745' : ''}"></span>${T('var.' + v)}</label>`).join('');
    el.querySelectorAll('input').forEach(i => i.addEventListener('change', () => {
      state.variable = i.value; radiosLayer.setStyle(radioStyle); renderVariableList(); renderLegend();
    }));
  }
  function legendRows(items) { return items.map(([c, l]) => `<div class="legend-row"><span class="swatch" style="background:${c}"></span>${l}</div>`).join(''); }
  function renderLegend() {
    const el = document.getElementById('legend');
    const v = state.variable;
    const ranges = (b, colors) => colors.map((c, i) => [c, i === 0 ? `< ${N(b[0])}` : i === colors.length - 1 ? `≥ ${N(b[i - 1])}` : `${N(b[i - 1])} – ${N(b[i])}`]);
    let html = '';
    if (v === 'ix') html = legendRows(IX_STEPS.map(([min, c], i) => [c, i === 0 ? `≥ ${min}` : `${min} – ${IX_STEPS[i - 1][0] - 1}`]));
    else if (v === 'd') html = legendRows(ranges(dBreaks, SEQ_BLUE).reverse());
    else if (v === 's') html = legendRows(Object.keys(SEG_COLORS).map(k => [SEG_COLORS[k], T('seg.' + k)]));
    else if (v === 't') html = legendRows(ranges(tBreaks, SEQ_VIOLET).reverse());
    else if (v === 'r') html = legendRows(Object.keys(RISK_COLORS).map(k => [RISK_COLORS[k], k]));
    el.innerHTML = v === 'none' ? '' : html + `<div class="legend-note">${T('legend.' + v)}</div>`;
  }
  function renderOverlayList() {
    const el = document.getElementById('overlay-list');
    el.innerHTML = OVERLAYS.map(o => `<label class="check">
      <input type="checkbox" data-ov="${o.id}"${o.on ? ' checked' : ''}>
      <span class="swatch" style="background:${o.swatch};${o.ring ? `border:2px solid ${o.ring}` : ''};${o.round ? 'border-radius:50%' : ''}"></span>${T('ov.' + o.id)}</label>`).join('');
    el.querySelectorAll('input').forEach(i => i.addEventListener('change', () => {
      const o = OVERLAYS.find(x => x.id === i.dataset.ov); o.on = i.checked; syncOverlays();
    }));
  }
  function syncOverlays() { OVERLAYS.forEach(o => { if (o.on) layers[o.id].addTo(map); else map.removeLayer(layers[o.id]); }); }
  function renderMethod() {
    const w = data.meta.weights, pct = x => Math.round(x * 100);
    document.getElementById('method-body').innerHTML = T('method.body', { density: pct(w.density), income: pct(w.income), transit: pct(w.transit), education: pct(w.education) });
  }

  // ---------- Panel: opportunities tab ----------
  function computeOpps() {
    const r = state.radius / 1000, groups = new Map(), hits = [];
    data.radios.features.forEach(f => {
      const p = f.properties;
      if (p.ix == null || p.ix < state.minIx || p._nd <= r) return;
      const caba = isCaba(p);
      if ((state.scope === 'caba' && !caba) || (state.scope === 'pba' && caba)) return;
      hits.push(f);
      const key = areaName(p);
      const g = groups.get(key) || { area: key, zone: zoneName(p), n: 0, pop: 0, ixSum: 0, feats: [] };
      g.n++; g.pop += p.p; g.ixSum += p.ix; g.feats.push(f); groups.set(key, g);
    });
    state.opps = [...groups.values()].map(g => Object.assign(g, { avg: Math.round(g.ixSum / g.n) })).sort((a, b) => b.pop - a.pop);
    layers.opps.clearLayers();
    layers.opps.addData({ type: 'FeatureCollection', features: hits });
    renderOpps(hits.length);
  }
  function renderOpps(nRadios) {
    const pop = state.opps.reduce((s, g) => s + g.pop, 0);
    const avg = state.opps.length ? Math.round(state.opps.reduce((s, g) => s + g.ixSum, 0) / nRadios) : 0;
    document.getElementById('opp-kpis').innerHTML = [
      [N(nRadios), T('opps.kRadios')], [N(pop), T('opps.kPop')], [N(state.opps.length), T('opps.kAreas')], [nRadios ? avg : '—', T('opps.kAvg')]
    ].map(([b, s]) => `<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
    const max = state.opps[0] ? state.opps[0].pop : 1;
    const list = document.getElementById('opp-list');
    if (!state.opps.length) { list.innerHTML = `<li class="empty" style="display:block">${T('opps.empty')}</li>`; return; }
    list.innerHTML = state.opps.slice(0, 15).map((g, i) => `<li data-i="${i}">
      <span class="opp-name">${g.area}${g.area !== g.zone ? ` <span class="opp-meta">· ${g.zone}</span>` : ''}</span>
      <span class="opp-meta">${T('opps.meta', { pop: N(g.pop), n: g.n, avg: g.avg })}</span>
      <div class="bar"><i style="width:${Math.max(4, g.pop / max * 100)}%"></i></div></li>`).join('');
    list.querySelectorAll('li[data-i]').forEach(li => li.addEventListener('click', () => {
      const g = state.opps[+li.dataset.i];
      map.fitBounds(L.geoJSON({ type: 'FeatureCollection', features: g.feats }).getBounds(), { padding: [40, 40], maxZoom: 15 });
      closePanelOnMobile();
    }));
  }
  function exportCsv() {
    const head = ['csv.area', 'csv.zone', 'csv.radios', 'csv.pop', 'csv.avg'].map(k => T(k));
    const q = s => `"${String(s).replace(/"/g, '""')}"`;
    const rows = state.opps.map(g => [q(g.area), q(g.zone), g.n, g.pop, g.avg].join(','));
    const blob = new Blob(['﻿' + [head.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `comidita-oportunidades-ix${state.minIx}-${state.radius}m.csv` });
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---------- Panel: stores tab ----------
  function renderStoreKpis() {
    const s = data.stores, open = s.filter(x => x.status === 'open');
    const avgT = Math.round(open.reduce((a, x) => a + x.tickets, 0) / open.length);
    const avgM2 = Math.round(s.reduce((a, x) => a + x.m2, 0) / s.length);
    document.getElementById('store-kpis').innerHTML = [
      [open.length, T('stores.kOpen')], [s.length - open.length, T('stores.kOpening')],
      [s.filter(x => x.ownership === 'own').length, T('stores.kOwn')], [s.filter(x => x.ownership === 'franchise').length, T('stores.kFranchise')],
      [N(avgT), T('stores.kTickets')], [avgM2, T('stores.kM2')]
    ].map(([b, l]) => `<div class="kpi"><b>${b}</b><span>${l}</span></div>`).join('');
  }
  function renderChips() {
    const el = document.getElementById('format-chips');
    el.innerHTML = Object.keys(FORMAT_COLORS).map(k => `<button type="button" class="chip${state.formats.has(k) ? ' on' : ''}" data-f="${k}"><i style="background:${FORMAT_COLORS[k]}"></i>${T('fmt.' + k)}</button>`).join('');
    el.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      const f = c.dataset.f;
      if (state.formats.has(f) && state.formats.size > 1) state.formats.delete(f); else state.formats.add(f);
      renderChips(); renderStoreList(); applyStoreFilter();
    }));
  }
  function storeVisible(s) {
    const q = state.storeQuery.trim().toLowerCase();
    return state.formats.has(s.format) && (!q || `${s.name} ${s.zone} ${s.area} ${s.id}`.toLowerCase().includes(q));
  }
  function applyStoreFilter() {
    data.stores.forEach(s => { if (storeVisible(s)) layers.stores.addLayer(s._marker); else layers.stores.removeLayer(s._marker); });
  }
  function renderStoreList() {
    const list = document.getElementById('store-list');
    const items = data.stores.filter(storeVisible).slice().sort((a, b) => b.opened - a.opened || a.name.localeCompare(b.name));
    list.innerHTML = items.map(s => `<li data-id="${s.id}">
      <span class="store-dot ${s.ownership}" style="background:${FORMAT_COLORS[s.format]};color:${FORMAT_COLORS[s.format]}"></span>
      <div class="store-main"><b>${BRAND} ${s.name}</b>${s.status === 'opening' ? `<span class="tag">${T('status.opening')}</span>` : ''}
        <div class="store-sub">${s.area} · ${T('fmt.' + s.format)} · ${T('own.' + s.ownership)} · ${T('stores.since', { y: s.opened })}</div></div>
      <div class="store-num">${s.tickets ? `<b>${N(s.tickets)}</b><br>${T('stores.ticketsDay')}` : '—'}</div></li>`).join('');
    list.querySelectorAll('li').forEach(li => li.addEventListener('click', () => {
      const s = data.stores.find(x => x.id === li.dataset.id);
      if (!map.hasLayer(layers.stores)) { OVERLAYS.find(o => o.id === 'stores').on = true; syncOverlays(); renderOverlayList(); }
      map.flyTo([s.c[1], s.c[0]], 15, { duration: 0.8 });
      map.once('moveend', () => s._marker.openPopup());
      closePanelOnMobile();
    }));
  }

  // ---------- Address search (OpenStreetMap Nominatim) ----------
  async function searchAddress(q) {
    if (!q.trim()) return;
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&bounded=1&viewbox=-59.4,-34.0,-57.6,-35.4&q=' + encodeURIComponent(q);
    let res;
    try { res = await fetch(url, { headers: { 'Accept-Language': I18N.lang } }).then(r => r.json()); }
    catch (e) { alertInMap(T('search.error')); return; }
    if (!res.length) { alertInMap(T('search.none')); return; }
    const lat = +res[0].lat, lon = +res[0].lon, ll = L.latLng(lat, lon);
    if (searchMarker) map.removeLayer(searchMarker);
    searchMarker = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="search-pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), pane: 'stores' }).addTo(map);
    map.setView(ll, Math.max(map.getZoom(), 15));
    const label = res[0].display_name.split(',').slice(0, 3).join(',');
    const header = `<div class="pop-sub" style="margin-bottom:6px">${T('pop.address')}: <b style="color:#F8F3EC">${escapeHtml(label)}</b></div>`;
    const f = radioAt(lon, lat);
    if (f) {
      L.popup({ maxWidth: 320 }).setLatLng(ll).setContent(radioPopupHtml(f, header, nearestStore([lon, lat]))).openOn(map);
    } else {
      L.popup().setLatLng(ll).setContent(`${header}<div class="pop-sub">${T('pop.outside')}</div>`).openOn(map);
    }
  }
  function alertInMap(msg) { L.popup().setLatLng(map.getCenter()).setContent(`<div class="pop-sub" style="margin:0">${msg}</div>`).openOn(map); }
  const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- UI wiring ----------
  function closePanelOnMobile() { if (window.innerWidth <= 860) document.getElementById('panel').classList.remove('open'); }
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  function wireUi() {
    document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.tab-body').forEach(b => b.classList.toggle('active', b.dataset.body === tab.dataset.tab));
      // Highlighted opportunities follow the Opportunities tab (they can still be toggled by hand).
      OVERLAYS.find(o => o.id === 'opps').on = tab.dataset.tab === 'opps';
      syncOverlays(); renderOverlayList();
    }));
    document.getElementById('opacity').addEventListener('input', e => { state.opacity = +e.target.value; radiosLayer.setStyle(radioStyle); });
    document.querySelectorAll('#basemap button').forEach(b => b.addEventListener('click', () => setBasemap(b.dataset.base)));

    const recompute = debounce(computeOpps, 120);
    document.getElementById('min-ix').addEventListener('input', e => { state.minIx = +e.target.value; document.getElementById('min-ix-val').textContent = state.minIx; recompute(); });
    document.getElementById('radius').addEventListener('input', e => {
      state.radius = +e.target.value; document.getElementById('radius-val').textContent = `${N(state.radius)} m`; updateCoverage(); recompute();
    });
    document.querySelectorAll('#scope button').forEach(b => b.addEventListener('click', () => {
      state.scope = b.dataset.scope;
      document.querySelectorAll('#scope button').forEach(x => x.classList.toggle('active', x === b));
      computeOpps();
    }));
    document.getElementById('export-csv').addEventListener('click', exportCsv);
    document.getElementById('store-filter').addEventListener('input', e => { state.storeQuery = e.target.value; renderStoreList(); applyStoreFilter(); });
    document.getElementById('search-form').addEventListener('submit', e => { e.preventDefault(); searchAddress(document.getElementById('search-input').value); });
    document.getElementById('panel-toggle').addEventListener('click', () => document.getElementById('panel').classList.toggle('open'));

    const banner = document.getElementById('demo-banner');
    try { if (sessionStorage.getItem('demo-banner-closed')) banner.classList.add('hidden'); } catch (e) {}
    document.getElementById('demo-banner-close').addEventListener('click', () => {
      banner.classList.add('hidden'); map.invalidateSize();
      try { sessionStorage.setItem('demo-banner-closed', '1'); } catch (e) {}
    });

    I18N.onChange(() => {
      map.closePopup();
      renderVariableList(); renderLegend(); renderOverlayList(); renderMethod();
      document.getElementById('radius-val').textContent = `${N(state.radius)} m`;
      computeOpps(); renderStoreKpis(); renderChips(); renderStoreList();
    });
  }

  async function start() {
    try { await loadData(); }
    catch (e) { document.querySelector('#loader span').textContent = 'Error loading data / Error cargando datos'; return; }
    initMap();
    renderVariableList(); renderLegend(); renderOverlayList(); renderMethod();
    syncOverlays(); computeOpps();
    renderStoreKpis(); renderChips(); renderStoreList();
    wireUi();
    document.getElementById('loader').classList.add('done');
  }
  document.addEventListener('DOMContentLoaded', start);
})();
