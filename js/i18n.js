// Bilingual strings (ES / EN) and a tiny translation helper.
(function () {
  const STRINGS = {
    es: {
      'app.subtitle': 'Mapa de Expansión – Modelo',
      'demo.pill': 'Demo · datos ficticios',
      'demo.banner': 'Esta es una demo con datos ficticios. La cadena, sus sedes, formatos y ventas son inventados; las capas de contexto (censo, transporte, barrios) son datos públicos.',
      'search.placeholder': 'Evaluar una dirección…',
      'search.go': 'Evaluar',
      'search.none': 'No encontré esa dirección dentro del área del mapa.',
      'search.error': 'El buscador de direcciones no respondió. Probá de nuevo en unos segundos.',
      'panel.toggle': 'Panel',
      'tab.map': 'Mapa', 'tab.opps': 'Oportunidades', 'tab.stores': 'Sedes',
      'map.variable': 'Variable del mapa', 'map.opacity': 'Opacidad',
      'map.reference': 'Capas de referencia', 'map.basemap': 'Mapa base',
      'map.dark': 'Oscuro', 'map.light': 'Claro',
      'var.ix': 'Índice de oportunidad', 'var.d': 'Densidad poblacional', 'var.s': 'Nivel socioeconómico',
      'var.t': 'Uso de colectivo', 'var.r': 'Vulnerabilidad social', 'var.none': 'Ninguna',
      'ov.stores': 'Sedes Comidita', 'ov.coverage': 'Radio de cobertura', 'ov.zones': 'Comunas y partidos',
      'ov.hoods': 'Barrios de CABA', 'ov.settlements': 'Barrios populares (RENABAP)',
      'ov.rail': 'Estaciones de tren', 'ov.edu': 'Universidades y educación superior', 'ov.bus': 'Terminales de ómnibus',
      'ov.opps': 'Oportunidades resaltadas',
      'legend.ix': 'Índice 0–100 calculado para esta demo. Sin color: radios con menos de 60 habitantes.',
      'legend.d': 'Habitantes por km² (quintiles).',
      'legend.s': 'Segmento socioeconómico del radio censal.',
      'legend.t': 'Viajes en colectivo de la zona de transporte (quintiles).',
      'legend.r': 'Incidencia de riesgo de exclusión (1 = baja).',
      'legend.nodata': 'Sin dato',
      'seg.1': 'Alto', 'seg.2': 'Medio-alto', 'seg.3': 'Medio', 'seg.4': 'Medio-bajo',
      'seg.5': 'Bajo integrado', 'seg.6': 'Bajo', 'seg.7': 'Muy bajo',
      'method.title': '¿Cómo se calcula el índice?',
      'method.body': '<p>Cada radio censal recibe un puntaje de 0 a 100 que combina:</p><ul><li><b>{density}%</b> densidad residencial (percentil)</li><li><b>{income}%</b> nivel socioeconómico</li><li><b>{transit}%</b> uso de colectivo de la zona (percentil)</li><li><b>{education}%</b> universidades e institutos a menos de 600 m</li></ul><p>Es un criterio de ejemplo para una cafetería: prioriza flujo de gente y poder de compra. Los pesos se definieron en el preprocesamiento (Python + Shapely) y quedan documentados en <code>data/meta.json</code>.</p>',
      'opps.intro': 'Radios censales con índice alto que quedan fuera del radio de cobertura de las sedes actuales.',
      'opps.minIndex': 'Índice mínimo', 'opps.radius': 'Cobertura por sede',
      'opps.ranking': 'Ranking de áreas', 'opps.export': 'Exportar CSV',
      'opps.kRadios': 'radios sin cobertura', 'opps.kPop': 'habitantes', 'opps.kAreas': 'áreas', 'opps.kAvg': 'índice promedio',
      'opps.meta': '{pop} hab. · {n} radios · índice {avg}',
      'opps.empty': 'Ningún radio cumple esos criterios. Bajá el índice mínimo o el radio de cobertura.',
      'scope.all': 'Todo', 'scope.caba': 'CABA', 'scope.pba': 'Provincia',
      'stores.filter': 'Filtrar por nombre o zona…',
      'stores.kOpen': 'operativas', 'stores.kOpening': 'en apertura', 'stores.kOwn': 'propias', 'stores.kFranchise': 'franquicias',
      'stores.kTickets': 'tickets/día promedio', 'stores.kM2': 'm² promedio',
      'stores.ticketsDay': 'tickets/día', 'stores.since': 'desde {y}',
      'fmt.classic': 'Clásica', 'fmt.express': 'Express', 'fmt.roastery': 'Tostaduría',
      'own.own': 'Propia', 'own.franchise': 'Franquicia',
      'status.open': 'Operativa', 'status.opening': 'En apertura',
      'pop.radio': 'Radio censal', 'pop.ix': 'Índice', 'pop.pop': 'Habitantes', 'pop.dens': 'Densidad',
      'pop.seg': 'Nivel', 'pop.bus': 'Viajes en colectivo (zona)', 'pop.risk': 'Vulnerabilidad', 'pop.edu': 'Educación a 600 m',
      'pop.nearest': 'Sede más cercana', 'pop.format': 'Formato', 'pop.ownership': 'Gestión', 'pop.status': 'Estado',
      'pop.opened': 'Apertura', 'pop.m2': 'Superficie', 'pop.tickets': 'Tickets/día', 'pop.outside': 'Fuera del área con datos censales.',
      'pop.address': 'Dirección evaluada',
      'csv.area': 'area', 'csv.zone': 'zona', 'csv.radios': 'radios', 'csv.pop': 'habitantes', 'csv.avg': 'indice_promedio',
      'foot.sources': 'Fuentes públicas: INDEC (Censo 2022), RENABAP, BA Data, IGN · Mapa base © OpenStreetMap / CARTO.',
      'foot.fiction': 'Sedes, formatos, superficies y tickets: ficticios.',
      'loading': 'Cargando datos…',
      'unit.hkm2': 'hab/km²'
    },
    en: {
      'app.subtitle': 'Expansion Map – Model',
      'demo.pill': 'Demo · fictional data',
      'demo.banner': 'This is a demo with fictional data. The chain, its stores, formats and sales are made up; the context layers (census, transit, neighbourhoods) are public data.',
      'search.placeholder': 'Evaluate an address…',
      'search.go': 'Evaluate',
      'search.none': 'I could not find that address inside the map area.',
      'search.error': 'The address search did not respond. Please try again in a few seconds.',
      'panel.toggle': 'Panel',
      'tab.map': 'Map', 'tab.opps': 'Opportunities', 'tab.stores': 'Stores',
      'map.variable': 'Map variable', 'map.opacity': 'Opacity',
      'map.reference': 'Reference layers', 'map.basemap': 'Basemap',
      'map.dark': 'Dark', 'map.light': 'Light',
      'var.ix': 'Opportunity index', 'var.d': 'Population density', 'var.s': 'Socioeconomic level',
      'var.t': 'Bus usage', 'var.r': 'Social vulnerability', 'var.none': 'None',
      'ov.stores': 'Comidita stores', 'ov.coverage': 'Coverage radius', 'ov.zones': 'Comunas & districts',
      'ov.hoods': 'Buenos Aires neighbourhoods', 'ov.settlements': 'Informal settlements (RENABAP)',
      'ov.rail': 'Rail stations', 'ov.edu': 'Universities & higher education', 'ov.bus': 'Bus terminals',
      'ov.opps': 'Highlighted opportunities',
      'legend.ix': '0–100 index computed for this demo. No colour: census tracts with fewer than 60 residents.',
      'legend.d': 'Residents per km² (quintiles).',
      'legend.s': 'Socioeconomic segment of the census tract.',
      'legend.t': 'Bus trips in the transit zone (quintiles).',
      'legend.r': 'Social-exclusion risk incidence (1 = low).',
      'legend.nodata': 'No data',
      'seg.1': 'High', 'seg.2': 'Upper-middle', 'seg.3': 'Middle', 'seg.4': 'Lower-middle',
      'seg.5': 'Low (integrated)', 'seg.6': 'Low', 'seg.7': 'Very low',
      'method.title': 'How is the index computed?',
      'method.body': '<p>Each census tract gets a 0–100 rating that combines:</p><ul><li><b>{density}%</b> residential density (percentile)</li><li><b>{income}%</b> socioeconomic level</li><li><b>{transit}%</b> bus usage in the area (percentile)</li><li><b>{education}%</b> universities and colleges within 600 m</li></ul><p>It is a sample criterion for a coffee shop: it favours foot traffic and purchasing power. Weights were set during preprocessing (Python + Shapely) and are documented in <code>data/meta.json</code>.</p>',
      'opps.intro': 'High-index census tracts that fall outside the coverage radius of current stores.',
      'opps.minIndex': 'Minimum index', 'opps.radius': 'Coverage per store',
      'opps.ranking': 'Area ranking', 'opps.export': 'Export CSV',
      'opps.kRadios': 'uncovered tracts', 'opps.kPop': 'residents', 'opps.kAreas': 'areas', 'opps.kAvg': 'average index',
      'opps.meta': '{pop} residents · {n} tracts · index {avg}',
      'opps.empty': 'No tract matches those criteria. Lower the minimum index or the coverage radius.',
      'scope.all': 'All', 'scope.caba': 'City', 'scope.pba': 'Province',
      'stores.filter': 'Filter by name or area…',
      'stores.kOpen': 'open', 'stores.kOpening': 'opening soon', 'stores.kOwn': 'company-owned', 'stores.kFranchise': 'franchised',
      'stores.kTickets': 'avg. tickets/day', 'stores.kM2': 'avg. m²',
      'stores.ticketsDay': 'tickets/day', 'stores.since': 'since {y}',
      'fmt.classic': 'Classic', 'fmt.express': 'Express', 'fmt.roastery': 'Roastery',
      'own.own': 'Company-owned', 'own.franchise': 'Franchise',
      'status.open': 'Open', 'status.opening': 'Opening soon',
      'pop.radio': 'Census tract', 'pop.ix': 'Index', 'pop.pop': 'Residents', 'pop.dens': 'Density',
      'pop.seg': 'Level', 'pop.bus': 'Bus trips (zone)', 'pop.risk': 'Vulnerability', 'pop.edu': 'Education within 600 m',
      'pop.nearest': 'Nearest store', 'pop.format': 'Format', 'pop.ownership': 'Ownership', 'pop.status': 'Status',
      'pop.opened': 'Opened', 'pop.m2': 'Floor area', 'pop.tickets': 'Tickets/day', 'pop.outside': 'Outside the area with census data.',
      'pop.address': 'Evaluated address',
      'csv.area': 'area', 'csv.zone': 'zone', 'csv.radios': 'tracts', 'csv.pop': 'residents', 'csv.avg': 'average_index',
      'foot.sources': 'Public sources: INDEC (2022 Census), RENABAP, BA Data, IGN · Basemap © OpenStreetMap / CARTO.',
      'foot.fiction': 'Stores, formats, floor areas and tickets: fictional.',
      'loading': 'Loading data…',
      'unit.hkm2': 'res/km²'
    }
  };

  const listeners = [];
  function initialLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'es' || q === 'en') return q;
    try { const s = localStorage.getItem('demo-lang'); if (s === 'es' || s === 'en') return s; } catch (e) {}
    return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  const I18N = {
    lang: initialLang(),
    t(key, vars) {
      let s = (STRINGS[this.lang] && STRINGS[this.lang][key]) ?? STRINGS.es[key] ?? key;
      if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
      return s;
    },
    num(n, digits = 0) {
      return new Intl.NumberFormat(this.lang === 'es' ? 'es-AR' : 'en-US', { maximumFractionDigits: digits }).format(n);
    },
    apply(root = document) {
      document.documentElement.lang = this.lang;
      root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = this.t(el.dataset.i18n); });
      root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = this.t(el.dataset.i18nHtml); });
      root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = this.t(el.dataset.i18nPlaceholder); });
      document.title = 'Comidita · ' + this.t('app.subtitle');
      document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('active', b.dataset.lang === this.lang));
    },
    set(lang) {
      if (lang === this.lang) return;
      this.lang = lang;
      try { localStorage.setItem('demo-lang', lang); } catch (e) {}
      this.apply();
      listeners.forEach(fn => fn(lang));
    },
    onChange(fn) { listeners.push(fn); }
  };

  window.I18N = I18N;
  document.addEventListener('DOMContentLoaded', () => {
    I18N.apply();
    document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => I18N.set(b.dataset.lang)));
  });
})();
