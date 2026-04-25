/**
 * ALGERIA MEGASYS — DATA MODULE
 * Fondé par KHEDIM BENYAKHLEF dit BENY-JOE
 * Gestion des données en temps réel
 */

'use strict';

// ============================================================
// GLOBAL STATE
// ============================================================
const ALG_STATE = {
    detections: [],
    logs: [],
    alerts: [],
    systemsData: {
        radars: [],
        satellites: [],
        drones: [],
        capteurs: [],
        bases: [],
    },
    metrics: {
        air: 247, sea: 189, land: 1092, cyber: 3471,
        anomalies: 12, threats: 48, active_systems: 1247,
        critical: 2, neutralized: 0, total_detections: 0
    },
    historical: {
        labels: [],
        detections: [],
        alerts: [],
        threats: []
    },
    chartRefs: {}
};

const WILAYAS_NAMES = [
    "Alger","Béchar","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","El-Tarf",
    "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi-Ouzou","Alger",
    "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
    "Constantine","Médéa","Mostaganem","Msila","Mascara","Ouargla","Oran","El Bayadh",
    "Illizi","Bordj Bou Arréridj","Boumerdès","El-Tarf","Tindouf","Tissemsilt",
    "El-Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma",
    "Aïn Témouchent","Ghardaïa","Relizane"
];

const DETECTION_LABELS = {
    aerien: "Aérien Commercial", aerien_suspect: "Aérien SUSPECT",
    maritime: "Maritime Commercial", maritime_suspect: "Maritime SUSPECT",
    terrestre: "Terrestre Commercial", terrestre_suspect: "Terrestre SUSPECT",
    drone: "Drone Non-Identifié", cyber: "Attaque Cyber",
    menace_critique: "MENACE CRITIQUE", menace_haute: "Menace Haute",
    menace_moyenne: "Menace Moyenne", frontiere: "Incident Frontière"
};

const THREAT_EMOJIS = {
    critique: '🔴', haute: '🟠', moyenne: '🟡', normal: '🟢', info: '🔵'
};

// ============================================================
// INIT DATA
// ============================================================
function initSystemesData() {
    // RADARS
    for (let i = 1; i <= 48; i++) {
        ALG_STATE.systemsData.radars.push({
            id: `RAD-${String(i).padStart(3,'0')}`,
            name: `Radar ${WILAYAS_NAMES[i % WILAYAS_NAMES.length]}`,
            wilaya: WILAYAS_NAMES[i % WILAYAS_NAMES.length],
            range: 200 + Math.floor(Math.random() * 400),
            status: Math.random() > 0.05 ? 'ACTIF' : 'MAINTENANCE',
            detections: Math.floor(Math.random() * 100),
            type: ['Longue portée','Basse altitude','Côtier','Terrestre'][i % 4]
        });
    }

    // SATELLITES
    const satNames = ['ALSAT-1','ALSAT-1B','ALSAT-2A','ALSAT-2B','ALSAT-1N','ZENITHR-1','ZENITHR-2'];
    satNames.forEach((name, i) => {
        ALG_STATE.systemsData.satellites.push({
            id: `SAT-${String(i + 1).padStart(3,'0')}`,
            name, orbit: ['LEO','MEO','GEO'][i % 3],
            altitude: [550, 680, 720, 35786][i % 4],
            status: 'OPÉRATIONNEL',
            coverage: Math.floor(Math.random() * 30 + 70) + '%',
            type: ['Observation','Imagerie','Surveillance','Communication'][i % 4]
        });
    });

    // DRONES
    for (let i = 1; i <= 156; i++) {
        const zones = ['NORD','EST','SUD','OUEST','CENTRE','SAHARA'];
        ALG_STATE.systemsData.drones.push({
            id: `DRN-${String(i).padStart(3,'0')}`,
            type: ['Combat','Surveillance','MALE','Tactique','Maritime'][i % 5],
            zone: zones[i % zones.length],
            altitude: Math.floor(Math.random() * 5000 + 500),
            status: Math.random() > 0.08 ? 'EN VOL' : 'AU SOL',
            mission: ['Patrouille','ISR','Combat','Convoi','SAR'][i % 5]
        });
    }

    // CAPTEURS
    const capteurTypes = ['Sismique','Thermique','Acoustique','Magnétique','Radar sol','EW','SIGINT'];
    for (let i = 1; i <= 120; i++) {
        ALG_STATE.systemsData.capteurs.push({
            id: `CPT-${String(i).padStart(3,'0')}`,
            type: capteurTypes[i % capteurTypes.length],
            zone: WILAYAS_NAMES[i % WILAYAS_NAMES.length],
            sensitivity: Math.floor(Math.random() * 40 + 60) + '%',
            status: Math.random() > 0.06 ? 'ACTIF' : 'MAINTENANCE',
        });
    }

    // BASES MILITAIRES
    const basesData = [
        { name: 'Base Aérienne Boufarik', wilaya: 'Blida', type: 'Aérien', level: 'STRATÉGIQUE' },
        { name: 'Base Navale Alger', wilaya: 'Alger', type: 'Naval', level: 'STRATÉGIQUE' },
        { name: 'Base Tamanrasset', wilaya: 'Tamanrasset', type: 'Sahara', level: 'RÉGIONAL' },
        { name: 'Base Oran', wilaya: 'Oran', type: 'Aérien', level: 'RÉGIONAL' },
        { name: 'Base Constantine', wilaya: 'Constantine', type: 'Terrestre', level: 'RÉGIONAL' },
        { name: 'Base Annaba', wilaya: 'Annaba', type: 'Naval', level: 'RÉGIONAL' },
        { name: 'Base Ouargla', wilaya: 'Ouargla', type: 'Sahara', level: 'OPÉRATIONNEL' },
    ];
    basesData.forEach((b, i) => {
        ALG_STATE.systemsData.bases.push({ id: `BASE-${String(i+1).padStart(3,'0')}`, ...b });
    });
}

function initHistoricalData() {
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
        const t = new Date(now - i * 3600000);
        ALG_STATE.historical.labels.push(t.getHours() + 'h');
        ALG_STATE.historical.detections.push(Math.floor(Math.random() * 120 + 30));
        ALG_STATE.historical.alerts.push(Math.floor(Math.random() * 20 + 2));
        ALG_STATE.historical.threats.push(Math.floor(Math.random() * 15 + 1));
    }
}

function initCharts() {
    // Daily chart
    const dailyCtx = document.getElementById('daily-chart');
    if (dailyCtx) {
        ALG_STATE.chartRefs.daily = new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: ALG_STATE.historical.labels,
                datasets: [
                    {
                        label: 'Détections',
                        data: ALG_STATE.historical.detections,
                        borderColor: '#FFD700',
                        backgroundColor: 'rgba(255,215,0,0.1)',
                        tension: 0.4, fill: true, borderWidth: 2
                    },
                    {
                        label: 'Alertes',
                        data: ALG_STATE.historical.alerts,
                        borderColor: '#D21034',
                        backgroundColor: 'rgba(210,16,52,0.1)',
                        tension: 0.4, fill: true, borderWidth: 2
                    },
                    {
                        label: 'Menaces',
                        data: ALG_STATE.historical.threats,
                        borderColor: '#ff6600',
                        backgroundColor: 'rgba(255,102,0,0.08)',
                        tension: 0.4, fill: true, borderWidth: 2
                    }
                ]
            },
            options: chartOptions('Activité sur 24h')
        });
    }

    // Weekly chart
    const weekCtx = document.getElementById('weekly-chart');
    if (weekCtx) {
        const days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
        ALG_STATE.chartRefs.weekly = new Chart(weekCtx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Détections',
                        data: days.map(() => Math.floor(Math.random() * 800 + 200)),
                        backgroundColor: 'rgba(255,215,0,0.7)',
                        borderColor: '#FFD700', borderWidth: 1
                    },
                    {
                        label: 'Alertes',
                        data: days.map(() => Math.floor(Math.random() * 80 + 10)),
                        backgroundColor: 'rgba(210,16,52,0.7)',
                        borderColor: '#D21034', borderWidth: 1
                    }
                ]
            },
            options: chartOptions('Rapport hebdomadaire')
        });
    }

    // Monthly chart
    const monthCtx = document.getElementById('monthly-chart');
    if (monthCtx) {
        const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
        ALG_STATE.chartRefs.monthly = new Chart(monthCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Détections mensuelles',
                    data: months.map(() => Math.floor(Math.random() * 5000 + 1000)),
                    borderColor: '#006233',
                    backgroundColor: 'rgba(0,98,51,0.2)',
                    tension: 0.4, fill: true, borderWidth: 2
                }]
            },
            options: chartOptions('Rapport annuel')
        });
    }

    // Traffic chart
    const trafficCtx = document.getElementById('traffic-chart');
    if (trafficCtx) {
        ALG_STATE.chartRefs.traffic = new Chart(trafficCtx, {
            type: 'doughnut',
            data: {
                labels: ['Aérien', 'Maritime', 'Terrestre', 'Cyber'],
                datasets: [{
                    data: [247, 189, 1092, 3471],
                    backgroundColor: ['rgba(0,136,255,0.7)','rgba(0,204,255,0.7)','rgba(255,0,255,0.7)','rgba(0,255,255,0.7)'],
                    borderColor: ['#0088ff','#00ccff','#ff00ff','#00ffff'],
                    borderWidth: 2
                }]
            },
            options: {
                ...chartOptions('Répartition des trafics'),
                plugins: {
                    legend: { position: 'right', labels: { color: '#fff', font: { size: 11 } } }
                }
            }
        });
    }
}

function chartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: {
            title: {
                display: true, text: title,
                color: '#FFD700', font: { size: 13, weight: 'bold' }
            },
            legend: { labels: { color: '#fff', font: { size: 11 } } }
        },
        scales: {
            x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
    };
}

// ============================================================
// REAL-TIME SIMULATION
// ============================================================
function initDataSimulation() {
    // Simulate detections every 4 seconds
    setInterval(simulateDetection, 4000);
    // Update metrics every 6 seconds
    setInterval(updateMetrics, 6000);
    // Update alerts every 8 seconds
    setInterval(simulateAlert, 8000);
}

function simulateDetection() {
    const types = Object.keys(DETECTION_LABELS);
    const type = types[Math.floor(Math.random() * types.length)];
    const label = DETECTION_LABELS[type];
    const isCritical = type.includes('critique') || type.includes('suspect');
    const isWarning = type.includes('haute') || type.includes('drone');
    const level = isCritical ? 'critique' : isWarning ? 'haute' : 'normale';

    const wilayas = WILAYAS_NAMES;
    const wilaya = wilayas[Math.floor(Math.random() * wilayas.length)];
    const id = 'DET-' + Date.now().toString(36).toUpperCase().slice(-7);
    const now = new Date();

    const det = {
        id, type, label, level, wilaya,
        lat: (22 + Math.random() * 15).toFixed(4),
        lon: (-2 + Math.random() * 12).toFixed(4),
        speed: Math.floor(Math.random() * 900 + 50) + ' km/h',
        altitude: Math.floor(Math.random() * 12000) + ' m',
        origin: ['Inconnu','Tunisie','Libye','Mali','Niger','Mauritanie','Maroc','Méditerranée','International'][Math.floor(Math.random() * 9)],
        timestamp: now.toISOString(),
        timeStr: now.toLocaleTimeString('fr-DZ'),
        dateStr: now.toLocaleDateString('fr-DZ'),
        status: isCritical ? '🔴 CRITIQUE' : isWarning ? '🟠 ÉLEVÉ' : '🟡 SURVEILLANCE',
        response: isCritical ? 'INTERVENTION IMMÉDIATE' : isWarning ? 'SURVEILLANCE RENFORCÉE' : 'SURVEILLANCE NORMALE',
        neutralized: false
    };

    ALG_STATE.detections.unshift(det);
    if (ALG_STATE.detections.length > 500) ALG_STATE.detections.pop();

    ALG_STATE.metrics.total_detections++;
    if (isCritical) ALG_STATE.metrics.critical++;

    addDetailedLog(label, `Détecté en wilaya de ${wilaya} | Niveau: ${level} | ID: ${id}`, level === 'critique' ? 'critical' : level === 'haute' ? 'warning' : 'info');

    updateDetectionsMiniList();
    updateHeaderThreatCount();
}

function simulateAlert() {
    const alertTypes = [
        'Trafic non-identifié détecté',
        'Anomalie thermique signalée',
        'Signal radio inconnu intercepté',
        'Mouvement suspect en zone frontière',
        'Intrusion cyber détectée',
        'Drone non-autorisé repéré',
        'Navire suspect en zone exclusive',
        'Véhicule non-identifié à la frontière'
    ];
    const zones = ['FRONTIÈRE EST','FRONTIÈRE SUD','ZONE CÔTIÈRE','WILAYA TAMANRASSET','ALGER','ORAN','SUD SAHARA','ZONE MARITIME'];
    const levels = ['🔴 ROUGE','🟠 ORANGE','🟡 JAUNE'];

    const alert = {
        id: 'ALG-' + String(ALG_STATE.alerts.length + 1).padStart(3, '0'),
        msg: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        zone: zones[Math.floor(Math.random() * zones.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        time: new Date().toLocaleTimeString('fr-DZ')
    };

    ALG_STATE.alerts.unshift(alert);
    if (ALG_STATE.alerts.length > 100) ALG_STATE.alerts.pop();

    updateAlertesMiniList();
    updateAlertTerminal(alert);
}

function updateMetrics() {
    ALG_STATE.metrics.air += Math.floor(Math.random() * 6 - 2);
    ALG_STATE.metrics.sea += Math.floor(Math.random() * 4 - 1);
    ALG_STATE.metrics.land += Math.floor(Math.random() * 15 - 5);
    ALG_STATE.metrics.cyber += Math.floor(Math.random() * 30 - 10);
    ALG_STATE.metrics.anomalies = Math.max(0, ALG_STATE.metrics.anomalies + Math.floor(Math.random() * 3 - 1));

    ALG_STATE.metrics.air = Math.max(150, ALG_STATE.metrics.air);
    ALG_STATE.metrics.sea = Math.max(80, ALG_STATE.metrics.sea);
    ALG_STATE.metrics.land = Math.max(500, ALG_STATE.metrics.land);
    ALG_STATE.metrics.cyber = Math.max(2000, ALG_STATE.metrics.cyber);

    // Update DOM
    setEl('traffic-air', ALG_STATE.metrics.air);
    setEl('traffic-sea', ALG_STATE.metrics.sea);
    setEl('traffic-land', ALG_STATE.metrics.land.toLocaleString());
    setEl('traffic-cyber', ALG_STATE.metrics.cyber.toLocaleString());
    setEl('traffic-anomalies', ALG_STATE.metrics.anomalies);
    setEl('hdr-systems', ALG_STATE.metrics.active_systems.toLocaleString());

    // Update report fields
    setEl('rpt-air', ALG_STATE.metrics.air);
    setEl('rpt-sea', ALG_STATE.metrics.sea);
    setEl('rpt-land', ALG_STATE.metrics.land.toLocaleString());
    setEl('rpt-cyber', ALG_STATE.metrics.cyber.toLocaleString());
    setEl('daily-detections', ALG_STATE.metrics.total_detections);
    setEl('daily-critical', ALG_STATE.metrics.critical);
    setEl('daily-neutralized', ALG_STATE.metrics.neutralized);
}

function updateHeaderThreatCount() {
    setEl('hdr-threats', ALG_STATE.metrics.critical);
}

// ============================================================
// DOM UPDATERS
// ============================================================
function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function updateDetectionsMiniList() {
    const container = document.getElementById('detections-list');
    if (!container) return;

    const recent = ALG_STATE.detections.slice(0, 8);
    container.innerHTML = recent.map(d => {
        const cls = d.level === 'critique' ? 'critical' : d.level === 'haute' ? 'warning' : 'info';
        return `<div class="detection-item ${cls}">
            ${THREAT_EMOJIS[d.level] || '⚪'} <strong>${d.label}</strong> — ${d.wilaya}<br>
            <small style="color:rgba(255,255,255,0.5)">${d.timeStr} | ${d.id}</small>
        </div>`;
    }).join('');
}

function updateAlertesMiniList() {
    const container = document.getElementById('alertes-list');
    if (!container) return;

    const recent = ALG_STATE.alerts.slice(0, 6);
    container.innerHTML = recent.map(a =>
        `<div class="detection-item critical">
            ${a.level} <strong>${a.msg}</strong><br>
            <small style="color:rgba(255,255,255,0.5)">${a.zone} — ${a.time}</small>
        </div>`
    ).join('');
}

function updateAlertTerminal(alert) {
    const terminal = document.getElementById('alert-terminal');
    if (!terminal) return;
    const line = `\n> ${alert.level} ${alert.id}: ${alert.msg}\n> ZONE: ${alert.zone} — ${alert.time}`;
    terminal.textContent += line;
    terminal.scrollTop = terminal.scrollHeight;
}

// ============================================================
// LOGS SYSTEM
// ============================================================
function addDetailedLog(event, detail, level = 'info') {
    const log = {
        id: 'LOG-' + Date.now(),
        timestamp: new Date().toISOString(),
        timeStr: new Date().toLocaleTimeString('fr-DZ'),
        event, detail, level
    };
    ALG_STATE.logs.unshift(log);
    if (ALG_STATE.logs.length > 1000) ALG_STATE.logs.pop();
}

function logToTerminal(msg, level = 'info') {
    const terminal = document.getElementById('command-terminal');
    if (!terminal) return;
    const prefix = level === 'critical' ? '🔴' : level === 'warning' ? '🟡' : level === 'command' ? '⚡' : '>';
    const line = `\n${prefix} ${msg}`;
    terminal.textContent += line;
    terminal.scrollTop = terminal.scrollHeight;
    addDetailedLog(msg, '', level);
}

// ============================================================
// REAL-TIME MAP EVENT
// ============================================================
function addRealTimeEvent(event) {
    ALG_STATE.metrics.total_detections++;
    if (event.threat === 'critique') ALG_STATE.metrics.critical++;

    const line = `\n> [MAP] ${event.label} | ${event.id} | ${event.lat},${event.lon}`;
    const frontiereTerminal = document.getElementById('frontieres-terminal');
    if (frontiereTerminal && Math.random() < 0.3) {
        frontiereTerminal.textContent += `\n> DÉTECTION: ${event.label} — ${event.time}`;
        frontiereTerminal.scrollTop = frontiereTerminal.scrollHeight;
    }

    setEl('hdr-threats', ALG_STATE.metrics.critical);
}

// ============================================================
// SYSTEMS TABLE BUILDERS
// ============================================================
function buildRadarsTable() {
    const tbody = document.getElementById('radars-tbody');
    if (!tbody) return;
    tbody.innerHTML = ALG_STATE.systemsData.radars.slice(0, 30).map(r =>
        `<tr>
            <td style="color:var(--dz-gold);font-family:monospace">${r.id}</td>
            <td>${r.name}</td>
            <td>${r.wilaya}</td>
            <td>${r.range} km</td>
            <td><span style="color:${r.status === 'ACTIF' ? '#0f0' : '#f90'}">${r.status}</span></td>
            <td>${r.detections}</td>
        </tr>`
    ).join('');
}

function buildSatellitesTable() {
    const tbody = document.getElementById('sats-tbody');
    if (!tbody) return;
    tbody.innerHTML = ALG_STATE.systemsData.satellites.map(s =>
        `<tr>
            <td style="color:var(--dz-gold);font-family:monospace">${s.id}</td>
            <td>${s.name}</td>
            <td>${s.orbit}</td>
            <td>${s.altitude} km</td>
            <td><span style="color:#0f0">${s.status}</span></td>
            <td>${s.coverage}</td>
        </tr>`
    ).join('');
}

function buildDronesTable() {
    const tbody = document.getElementById('drones-tbody');
    if (!tbody) return;
    tbody.innerHTML = ALG_STATE.systemsData.drones.slice(0, 30).map(d =>
        `<tr>
            <td style="color:var(--dz-gold);font-family:monospace">${d.id}</td>
            <td>${d.type}</td>
            <td>${d.zone}</td>
            <td>${d.altitude} m</td>
            <td><span style="color:${d.status === 'EN VOL' ? '#0f0' : '#888'}">${d.status}</span></td>
            <td>${d.mission}</td>
        </tr>`
    ).join('');
}

function buildCapteursTable() {
    const tbody = document.getElementById('capteurs-tbody');
    if (!tbody) return;
    tbody.innerHTML = ALG_STATE.systemsData.capteurs.slice(0, 30).map(c =>
        `<tr>
            <td style="color:var(--dz-gold);font-family:monospace">${c.id}</td>
            <td>${c.type}</td>
            <td>${c.zone}</td>
            <td>${c.sensitivity}</td>
            <td><span style="color:${c.status === 'ACTIF' ? '#0f0' : '#f90'}">${c.status}</span></td>
        </tr>`
    ).join('');
}

function buildBasesTable() {
    const tbody = document.getElementById('bases-tbody');
    if (!tbody) return;
    tbody.innerHTML = ALG_STATE.systemsData.bases.map(b =>
        `<tr>
            <td style="color:var(--dz-gold);font-family:monospace">${b.id}</td>
            <td>${b.name}</td>
            <td>${b.wilaya}</td>
            <td>${b.type}</td>
            <td><span style="color:${b.level === 'STRATÉGIQUE' ? 'var(--dz-red)' : 'var(--dz-gold)'}">${b.level}</span></td>
        </tr>`
    ).join('');
}

// ============================================================
// LOGS/DETECTIONS DISPLAY
// ============================================================
function updateLogsDisplay(filter = 'all') {
    const container = document.getElementById('logs-list');
    if (!container) return;

    const logs = filter === 'all' ? ALG_STATE.logs : ALG_STATE.logs.filter(l => l.level === filter);

    container.innerHTML = logs.slice(0, 200).map(l =>
        `<div class="log-entry ${l.level}">
            <div class="log-time">${l.timeStr}</div>
            <div class="log-content">
                <span style="color:${l.level === 'critical' ? 'var(--dz-red)' : l.level === 'warning' ? '#f90' : l.level === 'command' ? 'var(--dz-blue)' : 'var(--dz-green)'}">[${l.level.toUpperCase()}]</span>
                <strong>${l.event}</strong>${l.detail ? ' — ' + l.detail : ''}
            </div>
        </div>`
    ).join('');
}

function updateDetectionsDisplay(filter = 'all') {
    const container = document.getElementById('detections-list-full');
    if (!container) return;

    let dets = ALG_STATE.detections;
    if (filter !== 'all') {
        dets = dets.filter(d => d.type.includes(filter) || d.level === filter);
    }

    container.innerHTML = dets.slice(0, 200).map(d =>
        `<div class="case-item">
            <div class="case-item-header">
                <span class="case-id">${d.id}</span>
                <span class="case-type-badge" style="background:${d.level === 'critique' ? 'rgba(210,16,52,0.5)' : d.level === 'haute' ? 'rgba(255,100,0,0.5)' : 'rgba(0,150,0,0.4)'}">
                    ${d.status}
                </span>
            </div>
            <div class="case-details">
                <div class="case-detail-item"><div class="case-detail-label">Type</div><div class="case-detail-value">${d.label}</div></div>
                <div class="case-detail-item"><div class="case-detail-label">Wilaya</div><div class="case-detail-value">${d.wilaya}</div></div>
                <div class="case-detail-item"><div class="case-detail-label">Position</div><div class="case-detail-value">${d.lat}°N, ${d.lon}°E</div></div>
                <div class="case-detail-item"><div class="case-detail-label">Vitesse</div><div class="case-detail-value">${d.speed}</div></div>
                <div class="case-detail-item"><div class="case-detail-label">Altitude</div><div class="case-detail-value">${d.altitude}</div></div>
                <div class="case-detail-item"><div class="case-detail-label">Origine</div><div class="case-detail-value">${d.origin}</div></div>
                <div class="case-detail-item"><div class="case-detail-label">Date/Heure</div><div class="case-detail-value">${d.dateStr} ${d.timeStr}</div></div>
                <div class="case-detail-item"><div class="case-detail-label">Réponse</div><div class="case-detail-value">${d.response}</div></div>
            </div>
        </div>`
    ).join('');
}

function filterLogs(val) { updateLogsDisplay(val); }
function filterDetections(val) { updateDetectionsDisplay(val); }

function clearLogs() {
    ALG_STATE.logs = [];
    updateLogsDisplay();
}

function clearOldDetections() {
    ALG_STATE.detections = ALG_STATE.detections.slice(0, 50);
    updateDetectionsDisplay();
}

function exportLogs() {
    const data = JSON.stringify(ALG_STATE.logs, null, 2);
    downloadBlob(data, 'application/json', 'ALGERIA_MEGASYS_Logs_' + Date.now() + '.json');
}

function exportDetections() {
    const data = JSON.stringify(ALG_STATE.detections, null, 2);
    downloadBlob(data, 'application/json', 'ALGERIA_MEGASYS_Detections_' + Date.now() + '.json');
}

function downloadBlob(data, type, filename) {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================================
// SURVEILLANCE SYSTEMS CONTINUOUS UPDATES
// ============================================================
function startContinuousSurveillance() {
    setInterval(() => {
        // Update traffic terminal
        const trafficTerminal = document.getElementById('traffic-terminal');
        if (trafficTerminal) {
            const line = `\n> UPD ${new Date().toLocaleTimeString('fr-DZ')}: Aérien:${ALG_STATE.metrics.air} Maritime:${ALG_STATE.metrics.sea} Terrestres:${ALG_STATE.metrics.land}`;
            trafficTerminal.textContent += line;
            if (trafficTerminal.textContent.length > 5000) {
                trafficTerminal.textContent = trafficTerminal.textContent.slice(-3000);
            }
            trafficTerminal.scrollTop = trafficTerminal.scrollHeight;
        }
    }, 12000);
}

function autoSaveData() {
    addDetailedLog('Sauvegarde automatique', `${ALG_STATE.detections.length} détections et ${ALG_STATE.logs.length} logs sauvegardés`, 'info');
}

function systemCheck() {
    const active = 1200 + Math.floor(Math.random() * 100);
    ALG_STATE.metrics.active_systems = active;
    setEl('hdr-systems', active.toLocaleString());
    setEl('daily-systems', active.toLocaleString());
}
