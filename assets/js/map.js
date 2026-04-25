/**
 * ALGERIA MEGASYS — MAP MODULE
 * Fondé par KHEDIM BENYAKHLEF dit BENY-JOE
 * Carte interactive Leaflet avec détections en temps réel
 */

'use strict';

// ============================================================
// MAP STATE
// ============================================================
let dzMap = null;
const mapLayers = {};

const DZ_CENTER = [28.0339, 1.6596];
const DZ_ZOOM = 5;

// ============================================================
// ALGERIAN WILAYAS (48 major ones)
// ============================================================
const WILAYAS_DATA = [
    { id: 16, name: "Alger", lat: 36.7372, lon: 3.0868, capital: true },
    { id: 31, name: "Oran", lat: 35.6987, lon: -0.6349 },
    { id: 25, name: "Constantine", lat: 36.3650, lon: 6.6147 },
    { id: 6,  name: "Béjaïa", lat: 36.7509, lon: 5.0644 },
    { id: 15, name: "Tizi-Ouzou", lat: 36.7169, lon: 4.0494 },
    { id: 19, name: "Sétif", lat: 36.1898, lon: 5.4108 },
    { id: 5,  name: "Batna", lat: 35.5553, lon: 6.1742 },
    { id: 23, name: "Annaba", lat: 36.9000, lon: 7.7667 },
    { id: 9,  name: "Blida", lat: 36.4700, lon: 2.8300 },
    { id: 26, name: "Médéa", lat: 36.2636, lon: 2.7500 },
    { id: 10, name: "Bouira", lat: 36.3833, lon: 3.9000 },
    { id: 11, name: "Tamanrasset", lat: 22.7851, lon: 5.5228, sahara: true },
    { id: 8,  name: "Béchar", lat: 31.6167, lon: -2.2167, sahara: true },
    { id: 30, name: "Ouargla", lat: 31.9489, lon: 5.3244, sahara: true },
    { id: 7,  name: "Biskra", lat: 34.8500, lon: 5.7333 },
    { id: 3,  name: "Laghouat", lat: 33.8000, lon: 2.8667 },
    { id: 32, name: "El Bayadh", lat: 33.6833, lon: 1.0167 },
    { id: 12, name: "Tébessa", lat: 35.4008, lon: 8.1247 },
    { id: 2,  name: "Chlef", lat: 36.1667, lon: 1.3333 },
    { id: 18, name: "Jijel", lat: 36.8200, lon: 5.7650 },
    { id: 45, name: "Naâma", lat: 33.2667, lon: -0.3167 },
    { id: 43, name: "Mila", lat: 36.4500, lon: 6.2667 },
    { id: 47, name: "Ghardaïa", lat: 32.4900, lon: 3.6742, sahara: true },
    { id: 33, name: "Illizi", lat: 26.5057, lon: 8.4756, sahara: true },
    { id: 44, name: "Aïn Defla", lat: 36.2641, lon: 1.9667 },
    { id: 35, name: "Boumerdès", lat: 36.7762, lon: 3.4834 },
    { id: 13, name: "Tlemcen", lat: 34.8828, lon: -1.3167 },
    { id: 40, name: "Khenchela", lat: 35.4356, lon: 7.1425 },
    { id: 22, name: "Sidi Bel Abbès", lat: 35.1897, lon: -0.6347 },
    { id: 4,  name: "Oum El Bouaghi", lat: 35.8686, lon: 7.1131 },
    { id: 24, name: "Guelma", lat: 36.4619, lon: 7.4328 },
    { id: 29, name: "Mascara", lat: 35.3951, lon: 0.1419 },
    { id: 34, name: "Bordj Bou Arréridj", lat: 36.0706, lon: 4.7625 },
    { id: 36, name: "El-Tarf", lat: 36.7676, lon: 8.3136 },
    { id: 37, name: "Tindouf", lat: 27.6736, lon: -8.1470, sahara: true },
    { id: 38, name: "Tissemsilt", lat: 35.6069, lon: 1.8119 },
    { id: 39, name: "El-Oued", lat: 33.3689, lon: 6.8633 },
    { id: 41, name: "Souk Ahras", lat: 36.2864, lon: 7.9508 },
    { id: 42, name: "Tipaza", lat: 36.5878, lon: 2.4503 },
    { id: 46, name: "Aïn Témouchent", lat: 35.2994, lon: -1.1394 },
    { id: 27, name: "Mostaganem", lat: 35.9311, lon: 0.0886 },
    { id: 28, name: "Msila", lat: 35.7069, lon: 4.5428 },
    { id: 14, name: "Tiaret", lat: 35.3706, lon: 1.3231 },
    { id: 17, name: "Djelfa", lat: 34.6736, lon: 3.2631 },
    { id: 48, name: "Relizane", lat: 35.7372, lon: 0.5556 },
];

// ============================================================
// THREAT CONFIGS
// ============================================================
const THREAT_TYPES = {
    aerien: { icon: '✈️', color: '#0088ff', label: 'Trafic Aérien', symbolSize: 28 },
    aerien_suspect: { icon: '🚨', color: '#ff4400', label: 'Aérien Suspect', symbolSize: 32 },
    maritime: { icon: '🚢', color: '#00ccff', label: 'Trafic Maritime', symbolSize: 28 },
    maritime_suspect: { icon: '⛵', color: '#ff8800', label: 'Maritime Suspect', symbolSize: 30 },
    terrestre: { icon: '🚗', color: '#ff00ff', label: 'Trafic Terrestre', symbolSize: 24 },
    terrestre_suspect: { icon: '🚨', color: '#ff4400', label: 'Terrestre Suspect', symbolSize: 28 },
    drone: { icon: '🚁', color: '#ff8800', label: 'Drone', symbolSize: 30 },
    cyber: { icon: '💻', color: '#00ffff', label: 'Attaque Cyber', symbolSize: 28 },
    radar: { icon: '📡', color: '#00ff88', label: 'Radar', symbolSize: 26 },
    satellite: { icon: '🛰️', color: '#aaaaff', label: 'Satellite', symbolSize: 30 },
    base_mil: { icon: '⚓', color: '#8800ff', label: 'Base Militaire', symbolSize: 30 },
    menace_critique: { icon: '💥', color: '#ff0000', label: 'Menace Critique', symbolSize: 36 },
    menace_haute: { icon: '⚠️', color: '#ff6600', label: 'Menace Haute', symbolSize: 32 },
    menace_moyenne: { icon: '🔶', color: '#ffcc00', label: 'Menace Moyenne', symbolSize: 28 },
    frontiere: { icon: '🛡️', color: '#FFD700', label: 'Frontière', symbolSize: 24 },
};

// ============================================================
// STATIC SYSTEMS DATA
// ============================================================
const RADARS_POSITIONS = [
    { name: "Radar Alger-Centre", lat: 36.7372, lon: 3.0868, range: 400 },
    { name: "Radar Oran-Atlantique", lat: 35.6987, lon: -0.6349, range: 350 },
    { name: "Radar Tamanrasset-Sud", lat: 22.7851, lon: 5.5228, range: 600 },
    { name: "Radar Annaba-Est", lat: 36.9000, lon: 7.7667, range: 300 },
    { name: "Radar Béchar-Ouest", lat: 31.6167, lon: -2.2167, range: 450 },
    { name: "Radar Ouargla-Centre", lat: 31.9489, lon: 5.3244, range: 500 },
    { name: "Radar Tindouf-Extreme", lat: 27.6736, lon: -8.1470, range: 550 },
    { name: "Radar Constantine-Est", lat: 36.3650, lon: 6.6147, range: 320 },
    { name: "Radar Ghardaïa-Sahara", lat: 32.4900, lon: 3.6742, range: 480 },
    { name: "Radar Illizi-Sud-Est", lat: 26.5057, lon: 8.4756, range: 520 },
];

const SATELLITES_POSITIONS = [
    { name: "ALSAT-1", lat: 32.0, lon: 2.0, type: "Observation" },
    { name: "ALSAT-2A", lat: 36.0, lon: 5.0, type: "Imagerie" },
    { name: "ALSAT-1B", lat: 28.0, lon: -1.0, type: "Observation" },
    { name: "ALSAT-2B", lat: 24.0, lon: 8.0, type: "Imagerie" },
    { name: "ALSAT-1N", lat: 33.0, lon: 6.0, type: "Surveillance" },
];

const BASES_MILITAIRES = [
    { name: "Base Aérienne Boufarik", lat: 36.5370, lon: 2.8750, type: "Aérien" },
    { name: "Base Navale d'Alger", lat: 36.7520, lon: 3.0400, type: "Naval" },
    { name: "Base Tamanrasset", lat: 22.7200, lon: 5.5100, type: "Sahara" },
    { name: "Base Oran-Ain el Bey", lat: 35.5800, lon: -0.6100, type: "Aérien" },
    { name: "Base Constantine", lat: 36.2800, lon: 6.6000, type: "Terrestre" },
];

// ============================================================
// INITIALIZE MAP
// ============================================================
function initAlgerieMap() {
    if (dzMap) { dzMap.remove(); dzMap = null; }

    dzMap = L.map('dz-map', {
        center: DZ_CENTER,
        zoom: DZ_ZOOM,
        zoomControl: true,
        attributionControl: false,
    });

    // Dark military tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© ALGERIA MEGASYS',
        subdomains: 'abcd',
        maxZoom: 19,
        opacity: 0.85
    }).addTo(dzMap);

    // Update zoom indicator
    dzMap.on('zoomend', function() {
        const el = document.getElementById('map-zoom');
        if (el) el.textContent = 'x' + dzMap.getZoom().toFixed(1);
    });

    // Init layers
    initMapLayers();
    addStaticSystems();
    addFrontiereLines();
    addWilayaMarkers();

    // Start real-time simulation
    setInterval(addRealTimeDetection, 3500);
    setInterval(updateMapObjects, 5000);
}

// ============================================================
// LAYER GROUPS
// ============================================================
function initMapLayers() {
    const layerNames = ['frontieres','radars','satellites','traffic-air','traffic-sea','traffic-land','menaces','wilayas','drones','bases','cyber'];
    layerNames.forEach(name => {
        mapLayers[name] = L.layerGroup().addTo(dzMap);
    });
}

// ============================================================
// CUSTOM ICON
// ============================================================
function createEmojiIcon(type) {
    const cfg = THREAT_TYPES[type] || THREAT_TYPES['menace_moyenne'];
    return L.divIcon({
        html: `<div style="
            font-size: ${cfg.symbolSize}px;
            line-height: 1;
            filter: drop-shadow(0 0 6px ${cfg.color});
            animation: markerPulse 2s infinite;
            cursor: pointer;
        ">${cfg.icon}</div>`,
        className: '',
        iconSize: [cfg.symbolSize + 4, cfg.symbolSize + 4],
        iconAnchor: [(cfg.symbolSize + 4) / 2, (cfg.symbolSize + 4) / 2],
        popupAnchor: [0, -(cfg.symbolSize / 2)]
    });
}

function createPulsingIcon(emoji, color, size = 28) {
    return L.divIcon({
        html: `<div class="pulsing-marker" style="
            font-size:${size}px;
            filter: drop-shadow(0 0 8px ${color});
            animation: markerPulse 1.5s infinite alternate;
        ">${emoji}</div>`,
        className: '',
        iconSize: [size + 8, size + 8],
        iconAnchor: [(size + 8) / 2, (size + 8) / 2],
        popupAnchor: [0, -(size / 2)]
    });
}

// ============================================================
// STATIC SYSTEMS
// ============================================================
function addStaticSystems() {
    // Radars
    RADARS_POSITIONS.forEach((r, i) => {
        const marker = L.marker([r.lat, r.lon], { icon: createEmojiIcon('radar') });
        marker.bindPopup(createPopupHTML({
            icon: '📡',
            title: r.name,
            type: 'RADAR',
            details: { 'Portée': r.range + ' km', 'ID': 'RAD-' + String(i + 1).padStart(3, '0'), 'Statut': '🟢 ACTIF', 'Détections/h': Math.floor(Math.random() * 50 + 10) }
        }));
        mapLayers['radars'].addLayer(marker);

        // Radar range circle
        const circle = L.circle([r.lat, r.lon], {
            color: '#00ff88',
            fillColor: '#00ff88',
            fillOpacity: 0.03,
            weight: 1,
            radius: r.range * 1000,
            dashArray: '5, 10',
            opacity: 0.4
        });
        mapLayers['radars'].addLayer(circle);
    });

    // Satellites
    SATELLITES_POSITIONS.forEach((s, i) => {
        const marker = L.marker([s.lat, s.lon], { icon: createEmojiIcon('satellite') });
        marker.bindPopup(createPopupHTML({
            icon: '🛰️',
            title: s.name,
            type: 'SATELLITE',
            details: { 'Type': s.type, 'ID': 'SAT-' + String(i + 1).padStart(3, '0'), 'Orbite': 'LEO 680km', 'Statut': '🟢 OPÉRATIONNEL' }
        }));
        mapLayers['satellites'].addLayer(marker);
    });

    // Military bases
    BASES_MILITAIRES.forEach((b, i) => {
        const marker = L.marker([b.lat, b.lon], { icon: createEmojiIcon('base_mil') });
        marker.bindPopup(createPopupHTML({
            icon: '⚓',
            title: b.name,
            type: 'BASE MILITAIRE',
            details: { 'Type': b.type, 'ID': 'BASE-' + String(i + 1).padStart(3, '0'), 'Alerte': 'MAXIMALE', 'Statut': '🟢 OPÉRATIONNEL' }
        }));
        mapLayers['bases'].addLayer(marker);
    });
}

// ============================================================
// FRONTIER LINES
// ============================================================
function addFrontiereLines() {
    // Algeria borders approximate coordinates
    const algeriaBorder = [
        [37.09, -1.79], [37.10, 0.0], [37.09, 3.14], [37.09, 5.59],
        [36.90, 7.50], [36.88, 8.57], [36.47, 8.31], [36.10, 8.49],
        [35.55, 8.35], [34.55, 7.73], [34.12, 7.57], [33.09, 7.51],
        [32.77, 7.67], [31.99, 6.30], [31.48, 5.45], [30.68, 4.34],
        [29.61, 3.17], [28.17, 2.40], [27.31, 1.18], [25.00, 1.18],
        [21.84, 1.17], [20.50, 1.17], [19.36, 1.17],
        [19.08, 3.43], [19.08, 5.50], [19.93, 8.57], [21.43, 11.97],
        [23.47, 14.22], [23.97, 15.48],
        [23.45, 15.48], [23.17, 13.68], [22.29, 10.92], [20.38, 9.46],
        [19.93, 8.57], [21.43, 5.82],
        // Back to Mediterranean coast
        [37.09, -1.79]
    ];

    const frontiereLine = L.polyline(algeriaBorder, {
        color: '#FFD700',
        weight: 2,
        opacity: 0.7,
        dashArray: '8, 6'
    });

    mapLayers['frontieres'].addLayer(frontiereLine);

    // Mediterranean coast highlight
    const coastline = L.polyline([
        [37.09, -1.79], [37.1, 0.5], [37.09, 3.14], [37.09, 5.59],
        [36.88, 8.57]
    ], {
        color: '#00ccff',
        weight: 3,
        opacity: 0.6
    });
    mapLayers['frontieres'].addLayer(coastline);

    // Border patrol points
    const borderPoints = [
        { lat: 36.88, lon: 7.80, name: "Frontière EST - Tunisie", type: 'frontiere' },
        { lat: 36.88, lon: 8.40, name: "Frontière EST - Libye", type: 'frontiere' },
        { lat: 24.0, lon: 1.17, name: "Frontière SUD - Mali", type: 'frontiere' },
        { lat: 22.0, lon: 3.5, name: "Frontière SUD - Niger", type: 'frontiere' },
        { lat: 27.67, lon: -8.14, name: "Frontière OUEST - Mauritanie", type: 'frontiere' },
        { lat: 34.88, lon: -1.31, name: "Frontière OUEST - Maroc", type: 'frontiere' },
    ];

    borderPoints.forEach(p => {
        const marker = L.marker([p.lat, p.lon], { icon: createEmojiIcon('frontiere') });
        marker.bindPopup(createPopupHTML({
            icon: '🛡️',
            title: p.name,
            type: 'POINT FRONTIÈRE',
            details: { 'Surveillance': '24h/24', 'Patrouilles': 'ACTIVES', 'Statut': '🟡 SURVEILLANCE' }
        }));
        mapLayers['frontieres'].addLayer(marker);
    });
}

// ============================================================
// WILAYA MARKERS
// ============================================================
function addWilayaMarkers() {
    WILAYAS_DATA.forEach(w => {
        const size = w.capital ? 14 : (w.sahara ? 10 : 12);
        const color = w.capital ? '#FFD700' : (w.sahara ? '#ff8800' : '#00cc66');
        const marker = L.circleMarker([w.lat, w.lon], {
            radius: size,
            fillColor: color,
            color: '#000',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6
        });
        marker.bindTooltip(`W-${w.id} ${w.name}`, { direction: 'top', permanent: false });
        marker.bindPopup(createPopupHTML({
            icon: w.capital ? '🏛️' : '🏙️',
            title: `Wilaya de ${w.name}`,
            type: 'WILAYA ' + w.id,
            details: {
                'Statut': w.capital ? '🏛️ CAPITALE' : (w.sahara ? '🏜️ SAHARA' : '🏙️ NORD'),
                'Surveillance': '✅ ACTIVE',
                'Radars locaux': Math.floor(Math.random() * 3 + 1),
                'Incidents': Math.floor(Math.random() * 5)
            }
        }));
        mapLayers['wilayas'].addLayer(marker);
    });
}

// ============================================================
// POPUP HTML BUILDER
// ============================================================
function createPopupHTML({ icon, title, type, details, timestamp }) {
    const ts = timestamp || new Date().toLocaleTimeString('fr-DZ');
    const rows = Object.entries(details || {}).map(([k, v]) =>
        `<tr><td style="color:#aaa;padding:3px 8px 3px 0">${k}</td><td style="color:#fff;font-weight:bold">${v}</td></tr>`
    ).join('');

    return `<div style="
        background: linear-gradient(145deg, rgba(13,27,42,0.98), rgba(0,98,51,0.95));
        border: 2px solid #FFD700;
        border-radius: 10px;
        padding: 14px;
        min-width: 200px;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #fff;
    ">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;border-bottom:1px solid rgba(255,215,0,0.4);padding-bottom:8px">
            <span style="font-size:1.8em">${icon}</span>
            <div>
                <div style="font-weight:bold;color:#FFD700;font-size:0.95em">${title}</div>
                <div style="font-size:0.72em;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1px">${type}</div>
            </div>
        </div>
        <table style="width:100%;font-size:0.82em">${rows}</table>
        <div style="margin-top:8px;font-size:0.72em;color:rgba(255,255,255,0.5);border-top:1px solid rgba(255,215,0,0.2);padding-top:6px">
            ⏱ ${ts} | ALGERIA MEGASYS
        </div>
    </div>`;
}

// ============================================================
// REAL-TIME DETECTION
// ============================================================
const DETECTION_SCENARIOS = [
    { type: 'aerien_suspect', latRange: [30, 37], lonRange: [-2, 9], threat: 'haute' },
    { type: 'maritime_suspect', latRange: [36.5, 37.1], lonRange: [-1.5, 8.5], threat: 'critique' },
    { type: 'terrestre_suspect', latRange: [19, 37], lonRange: [-2, 9], threat: 'moyenne' },
    { type: 'aerien', latRange: [30, 37], lonRange: [-2, 9], threat: 'normal' },
    { type: 'maritime', latRange: [36.5, 37.1], lonRange: [-1.5, 8.5], threat: 'normal' },
    { type: 'terrestre', latRange: [19, 37], lonRange: [-2, 9], threat: 'normal' },
    { type: 'drone', latRange: [20, 37], lonRange: [-2, 9], threat: 'haute' },
    { type: 'cyber', latRange: [25, 37], lonRange: [-1, 9], threat: 'critique' },
    { type: 'menace_critique', latRange: [20, 37], lonRange: [-2, 9], threat: 'critique' },
    { type: 'menace_haute', latRange: [19, 37], lonRange: [-3, 10], threat: 'haute' },
];

let totalMapObjects = 2500;
let criticalCount = 0;

function addRealTimeDetection() {
    const scenario = DETECTION_SCENARIOS[Math.floor(Math.random() * DETECTION_SCENARIOS.length)];
    const lat = scenario.latRange[0] + Math.random() * (scenario.latRange[1] - scenario.latRange[0]);
    const lon = scenario.lonRange[0] + Math.random() * (scenario.lonRange[1] - scenario.lonRange[0]);
    const id = 'DET-' + Date.now().toString(36).toUpperCase().slice(-6);
    const ts = new Date().toLocaleTimeString('fr-DZ');

    const threatLevel = scenario.threat;
    const isCritical = threatLevel === 'critique';

    if (isCritical) criticalCount++;
    totalMapObjects++;

    // Select layer
    let layerKey = 'menaces';
    if (scenario.type.includes('aerien')) layerKey = 'traffic-air';
    else if (scenario.type.includes('maritime')) layerKey = 'traffic-sea';
    else if (scenario.type.includes('terrestre')) layerKey = 'traffic-land';
    else if (scenario.type === 'drone') layerKey = 'drones';
    else if (scenario.type === 'cyber') layerKey = 'cyber';

    const cfg = THREAT_TYPES[scenario.type];
    const marker = L.marker([lat, lon], { icon: createEmojiIcon(scenario.type) });

    const speed = Math.floor(Math.random() * 800 + 100);
    const altitude = Math.floor(Math.random() * 12000 + 500);
    const origin = ['Inconnu', 'Nord', 'Est', 'Sud', 'Ouest', 'International'][Math.floor(Math.random() * 6)];

    marker.bindPopup(createPopupHTML({
        icon: cfg.icon,
        title: cfg.label + ' — ' + id,
        type: 'DÉTECTION TEMPS RÉEL',
        timestamp: ts,
        details: {
            'ID': id,
            'Type': cfg.label,
            'Niveau': threatLevel.toUpperCase(),
            'Position': `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
            'Vitesse': speed + ' km/h',
            'Altitude': altitude + ' m',
            'Origine': origin,
            'Détecté': ts,
            'Statut': isCritical ? '🔴 CRITIQUE' : '🟡 SURVEILLANCE'
        }
    }));

    // Add to layer
    if (mapLayers[layerKey]) {
        mapLayers[layerKey].addLayer(marker);
    }

    // Remove after 30 seconds
    setTimeout(() => {
        if (mapLayers[layerKey]) mapLayers[layerKey].removeLayer(marker);
        if (isCritical && criticalCount > 0) criticalCount--;
    }, 30000);

    // Update counters
    updateMapCounters();

    // Log to app
    if (typeof addRealTimeEvent === 'function') {
        addRealTimeEvent({
            id, type: scenario.type, label: cfg.label,
            lat, lon, threat: threatLevel, time: ts, speed, altitude, origin
        });
    }
}

function updateMapCounters() {
    const critEl = document.getElementById('map-critical-count');
    const totalEl = document.getElementById('map-total-count');
    const objEl = document.getElementById('map-objects');

    if (critEl) critEl.textContent = criticalCount;
    if (totalEl) totalEl.textContent = totalMapObjects.toLocaleString();
    if (objEl) objEl.textContent = totalMapObjects.toLocaleString();
}

function updateMapObjects() {
    totalMapObjects += Math.floor(Math.random() * 5 - 1);
    if (totalMapObjects < 2400) totalMapObjects = 2400;
    updateMapCounters();
}

// ============================================================
// LAYER TOGGLE
// ============================================================
function toggleLayer(name) {
    if (!mapLayers[name]) return;
    if (dzMap.hasLayer(mapLayers[name])) {
        dzMap.removeLayer(mapLayers[name]);
    } else {
        dzMap.addLayer(mapLayers[name]);
    }
}
