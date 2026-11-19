# Mapa de Expansión – Modelo · Expansion Map – Model

> **Demo con datos ficticios · Fictional-data demo.**
> "Comidita" es una cadena de cafeterías inventada. Sus 35 sedes, formatos, superficies y tickets son ficticios. Las capas de contexto (censo, transporte, barrios) son datos públicos.
> *"Comidita" is a made-up coffee chain. Its 35 stores, formats, floor areas and tickets are fictional. Context layers (census, transit, neighbourhoods) are public data.*

**Demo en vivo · Live demo:** https://francoborsalino.github.io/mapa-expansion-modelo/

---

## Español

### Qué problema resuelve
Una cadena que quiere abrir sucursales necesita responder rápido **dónde conviene abrir**. Este mapa cruza datos públicos del censo, transporte y educación con la red actual de sedes. Con eso:

- calcula un **índice de oportunidad (0–100)** para cada radio censal de CABA y AMBA;
- detecta las zonas con índice alto que **quedan fuera de la cobertura** de las sedes actuales y las ordena por población;
- permite **evaluar una dirección puntual** antes de visitar un local.

### Cómo se usa
- **Mapa:** elegí la variable que querés ver (índice, densidad, nivel socioeconómico, uso de colectivo o vulnerabilidad) y prendé las capas de referencia: sedes, cobertura, barrios, estaciones, universidades.
- **Oportunidades:** ajustá el índice mínimo, el radio de cobertura por sede y el ámbito (CABA o Provincia). El ranking se recalcula al instante. Un click en un área la muestra en el mapa, y el ranking se puede exportar a CSV.
- **Sedes:** indicadores de la red, filtros por formato y búsqueda por nombre o zona.
- **Buscador:** escribí una dirección y el mapa muestra el índice del radio censal y la sede más cercana.
- La interfaz está en **español e inglés** (botón ES/EN) y funciona en el celular.

### Cómo se calcula el índice
| Componente | Peso |
|---|---|
| Densidad residencial (percentil) | 35 % |
| Nivel socioeconómico del radio | 30 % |
| Uso de colectivo de la zona (percentil) | 20 % |
| Universidades e institutos a menos de 600 m | 15 % |

Es un criterio de ejemplo pensado para una cafetería: prioriza flujo de gente y poder de compra. Los radios con menos de 60 habitantes no tienen índice.

### Tecnologías
- **Frontend:** HTML, CSS y JavaScript sin frameworks ni build, con [Leaflet 1.9](https://leafletjs.com/) incluido en el repo.
- **Datos:** preprocesamiento en Python con Shapely (uniones espaciales, simplificación de geometrías y cálculo del índice). El resultado son archivos JSON estáticos.
- **Servicios:** mapas base de CARTO y OpenStreetMap, geocodificación con Nominatim.
- **Hosting:** GitHub Pages.

### Fuentes de datos públicas
INDEC (Censo 2022: población, segmentación socioeconómica y riesgo de exclusión por radio censal) · RENABAP (barrios populares) · BA Data (barrios de CABA; uso de colectivo) · IGN (estaciones de tren, universidades y terminales) · Establecimientos de educación superior no universitaria (datos abiertos) · Mapa base © OpenStreetMap / CARTO.

---

## English

### What it solves
A chain planning new stores needs a quick answer to **where to open next**. This map combines public census, transit and education data with the current store network. With that it:

- computes a **0–100 opportunity index** for every census tract in Buenos Aires City and Greater Buenos Aires;
- finds high-index areas **outside the coverage** of existing stores and ranks them by population;
- lets you **evaluate a specific address** before visiting a site.

### How to use it
- **Map:** pick the variable to show (index, density, socioeconomic level, bus usage or vulnerability) and toggle reference layers: stores, coverage, neighbourhoods, stations, universities.
- **Opportunities:** set the minimum index, the coverage radius per store and the scope (City or Province). The ranking updates instantly. Click an area to see it on the map, or export the ranking to CSV.
- **Stores:** network KPIs, format filters and search by name or area.
- **Search:** type an address and the map shows the tract's index and the nearest store.
- The interface is in **Spanish and English** (ES/EN toggle) and works on mobile.

### How the index is computed
| Component | Weight |
|---|---|
| Residential density (percentile) | 35% |
| Socioeconomic level of the tract | 30% |
| Bus usage in the area (percentile) | 20% |
| Universities and colleges within 600 m | 15% |

It is a sample criterion for a coffee shop that favours foot traffic and purchasing power. Tracts with fewer than 60 residents get no index.

### Tech stack
- **Frontend:** HTML, CSS and vanilla JavaScript with no framework or build step; [Leaflet 1.9](https://leafletjs.com/) is included in the repo.
- **Data:** Python + Shapely preprocessing (spatial joins, geometry simplification, index computation) that outputs static JSON.
- **Services:** CARTO/OpenStreetMap basemaps, Nominatim geocoding.
- **Hosting:** GitHub Pages.

### Public data sources
INDEC (2022 Census: population, socioeconomic segmentation and social-exclusion risk by census tract) · RENABAP (informal settlements) · BA Data (City neighbourhoods; bus usage) · IGN (rail stations, universities and bus terminals) · Non-university higher-education sites (open data) · Basemap © OpenStreetMap / CARTO.

---

## Estructura · Structure
```
index.html          interfaz · UI
css/styles.css      estilos · styles
js/i18n.js          textos ES/EN · ES/EN strings
js/app.js           lógica del mapa · map logic
data/*.json         capas y sedes ficticias · layers and fictional stores
vendor/leaflet/     Leaflet 1.9.4 (BSD-2-Clause)
assets/             logo e íconos · logo and icons
```
Para correrlo localmente · To run locally: `python3 -m http.server` en la carpeta y abrir · in the folder, then open `http://localhost:8000`.

## Autor · Author
**Franco Borsalino** · [linkedin.com/in/francoborsalino](https://www.linkedin.com/in/francoborsalino) · fl.borsalino@gmail.com
