/**
 * ALGERIA MEGASYS — CLIENT WEBSOCKET TEMPS RÉEL
 * Fondé par KHEDIM BENYAKHLEF dit BENY-JOE
 *
 * Se connecte au backend Node.js pour recevoir :
 * - Vols réels OpenSky (push toutes les 30s)
 * - Menaces cyber ThreatFox (push toutes les 10min)
 * - Météo Alger réelle (push toutes les 5min)
 * - Heartbeat système (toutes les 10s)
 * - Identification du visiteur réel (à la connexion)
 */

'use strict';

const WS_CONFIG = {
    // En production (Render/Railway/VPS) → mettre l'URL du serveur
    // En local → ws://localhost:3000
    url: 'wss://algeria-megasys-backend.onrender.com',
        return `${proto}//${host}`;
    })(),
    reconnectDelay: 5000,
    maxRetries: 10,
};

let ws = null;
let wsRetries = 0;
let wsConnected = false;

// ============================================================
// CONNEXION WEBSOCKET AU BACKEND
// ============================================================
function connectWebSocket() {
    if (!WS_CONFIG.url) {
        console.log('[WS] Mode sans backend — APIs directes actives');
        logToTerminal('📡 Mode direct — APIs publiques connectées', 'info');
        return;
    }

    try {
        ws = new WebSocket(WS_CONFIG.url);

        ws.onopen = () => {
            wsConnected = true;
            wsRetries   = 0;
            console.log('[WS] ✅ Connecté au backend ALGERIA MEGASYS');
            logToTerminal('📡 Backend WebSocket connecté — Données réelles actives', 'command');
            updateWSStatus(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleServerMessage(data);
            } catch (e) {
                console.error('[WS] Parse error:', e);
            }
        };

        ws.onclose = () => {
            wsConnected = false;
            updateWSStatus(false);
            logToTerminal(`⚠️ Backend déconnecté — Reconnexion dans ${WS_CONFIG.reconnectDelay / 1000}s...`, 'warning');
            if (wsRetries < WS_CONFIG.maxRetries) {
                wsRetries++;
                setTimeout(connectWebSocket, WS_CONFIG.reconnectDelay);
            }
        };

        ws.onerror = (err) => {
            console.warn('[WS] Erreur:', err);
        };

    } catch (err) {
        console.warn('[WS] Impossible de se connecter au backend:', err.message);
        logToTerminal('⚠️ Backend non disponible — Mode APIs directes', 'warning');
    }
}

// ============================================================
// TRAITEMENT DES MESSAGES DU SERVEUR
// ============================================================
function handleServerMessage(data) {
    switch (data.type) {

        // ── Init : état complet à la connexion ──────────────────
        case 'INIT':
            logToTerminal(`🟢 Système initialisé | ${data.flights?.length || 0} vols réels | ${data.threats?.length || 0} menaces`, 'command');
            logToTerminal(`👤 Clients connectés: ${data.clients}`, 'info');
            if (data.flights?.length)  processRealFlights(data.flights);
            if (data.threats?.length)  processRealThreats(data.threats);
            if (data.weather)          processRealWeather(data.weather);
            if (data.time)             processRealTime(data.time);
            break;

        // ── Vols ADS-B réels OpenSky ────────────────────────────
        case 'FLIGHTS_UPDATE':
            processRealFlights(data.flights);
            logToTerminal(`✈️  OpenSky: ${data.count} vols réels | ${data.suspects} suspects | ${data.military} militaires`, 'command');
            setEl('traffic-air', data.count);
            ALG_STATE.metrics.air = data.count;
            break;

        // ── Menaces cyber ThreatFox ─────────────────────────────
        case 'CYBER_THREATS_UPDATE':
            processRealThreats(data.threats);
            logToTerminal(`🛡️ ThreatFox: ${data.count} menaces cyber réelles détectées`, data.count > 0 ? 'critical' : 'info');
            break;

        // ── Météo Alger réelle ──────────────────────────────────
        case 'WEATHER_UPDATE':
            processRealWeather(data.weather);
            break;

        // ── Heure officielle ────────────────────────────────────
        case 'TIME_UPDATE':
            processRealTime(data.time);
            break;

        // ── Identification du visiteur réel ─────────────────────
        case 'VISITOR_INFO':
            processVisitorInfo(data);
            break;

        // ── Alerte sécurité ─────────────────────────────────────
        case 'SECURITY_ALERT':
            logToTerminal(`🔴 ALERTE SÉCURITÉ: ${data.message}`, 'critical');
            addDetailedLog('ALERTE SÉCURITÉ RÉELLE', data.message, 'critical');
            ALG_STATE.metrics.critical++;
            setEl('hdr-threats', ALG_STATE.metrics.critical);
            // Créer une détection réelle sur la carte
            if (data.geo?.lat && data.geo?.lon) {
                addRealThreatOnMap(data.geo);
            }
            break;

        // ── Heartbeat système ───────────────────────────────────
        case 'HEARTBEAT':
            updateHeartbeat(data);
            break;

        case 'API_ERROR':
            logToTerminal(`⚠️ API ${data.api}: ${data.error}`, 'warning');
            break;

        case 'PONG':
            break;
    }
}

// ============================================================
// TRAITEMENT DES DONNÉES RÉELLES
// ============================================================

// Vols réels → carte + détections
function processRealFlights(flights) {
    if (!flights || !flights.length) return;

    // Mettre à jour la carte Leaflet
    if (typeof displayRealFlightsOnMap === 'function') {
        displayRealFlightsOnMap(flights);
    }

    // Analyser les suspects
    const suspects = flights.filter(f => f.isSuspect);
    suspects.forEach(f => {
        const wilaya = typeof findNearestWilaya === 'function'
            ? findNearestWilaya(f.lat, f.lon)
            : 'Zone de surveillance';

        // Ajouter aux détections si pas déjà présent
        const exists = ALG_STATE.detections.find(d => d.id === 'REAL-' + f.icao24?.toUpperCase());
        if (!exists) {
            ALG_STATE.detections.unshift({
                id:        'REAL-' + (f.icao24 || 'UNKNOWN').toUpperCase(),
                type:      f.isMilitary ? 'aerien' : 'aerien_suspect',
                label:     f.isMilitary ? `Aéronef Militaire (${f.country})` : `Aéronef Suspect — ${f.callsign || 'Non-Identifié'}`,
                level:     f.isSuspect ? 'haute' : 'normale',
                wilaya,
                lat:       f.lat?.toFixed(4),
                lon:       f.lon?.toFixed(4),
                speed:     f.speed_kmh + ' km/h',
                altitude:  Math.round(f.altitude) + ' m',
                origin:    f.country || 'Inconnu',
                timestamp: new Date().toISOString(),
                timeStr:   new Date().toLocaleTimeString('fr-DZ'),
                dateStr:   new Date().toLocaleDateString('fr-DZ'),
                status:    f.isSuspect ? '🟠 SURVEILLANCE RENFORCÉE' : '🟢 NORMAL',
                response:  f.isSuspect ? 'IDENTIFICATION EN COURS' : 'SURVEILLANCE NORMALE',
                realData:  true,
                source:    'OpenSky Network RÉEL',
            });
            ALG_STATE.metrics.total_detections++;
        }
    });

    updateDetectionsMiniList();
    updateMapCounters();
}

// Menaces cyber réelles ThreatFox → alertes
function processRealThreats(threats) {
    if (!threats || !threats.length) return;

    threats.forEach(t => {
        // Ajouter chaque menace comme détection cyber
        const det = {
            id:        'THREAT-' + t.id,
            type:      'cyber',
            label:     `Menace Cyber Réelle: ${t.malware || t.threat_type}`,
            level:     t.confidence >= 80 ? 'critique' : t.confidence >= 50 ? 'haute' : 'moyenne',
            wilaya:    'Réseau / Cyber',
            lat:       (28 + Math.random() * 8).toFixed(4),
            lon:       (1 + Math.random() * 6).toFixed(4),
            speed:     'N/A',
            altitude:  'N/A',
            origin:    t.reporter || 'ThreatFox',
            timestamp: t.first_seen || new Date().toISOString(),
            timeStr:   new Date().toLocaleTimeString('fr-DZ'),
            dateStr:   new Date().toLocaleDateString('fr-DZ'),
            status:    `🔴 IOC: ${t.ioc_type}`,
            response:  `Malware: ${t.malware || 'Inconnu'} | Confiance: ${t.confidence}%`,
            realData:  true,
            source:    'ThreatFox / abuse.ch RÉEL',
            ioc:       t.ioc,
            malware:   t.malware,
            tags:      t.tags,
        };

        const exists = ALG_STATE.detections.find(d => d.id === det.id);
        if (!exists) {
            ALG_STATE.detections.unshift(det);
            ALG_STATE.metrics.total_detections++;
            ALG_STATE.metrics.cyber++;
            if (det.level === 'critique') ALG_STATE.metrics.critical++;
        }
    });

    setEl('traffic-cyber', ALG_STATE.metrics.cyber.toLocaleString());
    setEl('hdr-threats', ALG_STATE.metrics.critical);
    updateDetectionsMiniList();

    // Afficher sur la carte
    if (mapLayers && mapLayers['cyber']) {
        threats.slice(0, 5).forEach(t => {
            const lat = 28 + Math.random() * 8;
            const lon = 1  + Math.random() * 6;
            const marker = L.marker([lat, lon], {
                icon: L.divIcon({
                    html: `<div style="font-size:22px;filter:drop-shadow(0 0 8px #0ff)">💻</div>`,
                    className: '', iconSize: [26, 26], iconAnchor: [13, 13]
                })
            });
            marker.bindPopup(createPopupHTML({
                icon: '💻',
                title: `Menace Cyber: ${t.malware || t.threat_type}`,
                type: 'CYBER — THREATFOX RÉEL',
                details: {
                    'IOC':        t.ioc,
                    'Type':       t.ioc_type,
                    'Malware':    t.malware || 'Inconnu',
                    'Confiance':  t.confidence + '%',
                    'Reporter':   t.reporter,
                    'Détecté':    t.first_seen,
                    'Source':     '📡 ThreatFox / abuse.ch RÉEL',
                }
            }));
            mapLayers['cyber'].addLayer(marker);
            setTimeout(() => mapLayers['cyber'].removeLayer(marker), 60000);
        });
    }
}

// Météo réelle → terminal
function processRealWeather(weather) {
    if (!weather) return;
    const codes = { 0:'Ensoleillé ☀️',1:'Peu nuageux 🌤️',2:'Partiellement nuageux ⛅',3:'Couvert ☁️',45:'Brumeux 🌫️',51:'Bruine légère 🌦️',61:'Pluie légère 🌧️',80:'Averses 🌩️',95:'Orage ⛈️' };
    const desc = codes[weather.weathercode] || `Code ${weather.weathercode}`;
    const frontier = document.getElementById('frontieres-terminal');
    if (frontier) {
        frontier.textContent += `\n> MÉTÉO ALGER RÉELLE: ${weather.temperature}°C | Vent: ${weather.windspeed} km/h ${desc}`;
        frontier.scrollTop = frontier.scrollHeight;
    }
    addDetailedLog('Météo Alger réelle', `${weather.temperature}°C | Vent: ${weather.windspeed} km/h | ${desc}`, 'info');
}

// Heure officielle
function processRealTime(timeData) {
    if (!timeData) return;
    REAL_DATA.algerTime = timeData;
}

// Visiteur réel identifié
function processVisitorInfo(data) {
    if (data.local) {
        logToTerminal('🖥️ Connexion locale détectée — Administration', 'info');
        return;
    }

    logToTerminal(`🌐 Visiteur RÉEL: ${data.ip} — ${data.city}, ${data.country}`, 'command');
    logToTerminal(`🏢 FAI: ${data.isp} | ${data.org}`, 'info');

    if (data.isVPN) {
        logToTerminal(`⚠️ VPN/PROXY détecté: ${data.isp}`, 'warning');
        addDetailedLog('VPN Détecté', `IP ${data.ip} via ${data.isp} — ${data.country}`, 'warning');
    }

    if (data.isSuspect) {
        logToTerminal(`🔴 ALERTE: Connexion depuis pays sous surveillance: ${data.country}`, 'critical');
        ALG_STATE.metrics.critical++;
        setEl('hdr-threats', ALG_STATE.metrics.critical);
    }

    addDetailedLog('Visiteur identifié (RÉEL)',
        `IP: ${data.ip} | ${data.city}, ${data.country} | FAI: ${data.isp} | VPN: ${data.isVPN}`, 'info');

    // Marquer sur la carte
    if (data.lat && data.lon && typeof addVisitorMarkerOnMap === 'function') {
        addVisitorMarkerOnMap({
            query: data.ip, country: data.country, countryCode: data.countryCode,
            regionName: data.region, city: data.city, lat: data.lat, lon: data.lon,
            isp: data.isp, org: data.org
        });
    }
}

// Menace réelle sur la carte
function addRealThreatOnMap(geo) {
    if (!mapLayers || !mapLayers['menaces'] || !geo.lat || !geo.lon) return;
    const marker = L.marker([geo.lat, geo.lon], {
        icon: L.divIcon({
            html: '<div style="font-size:28px;animation:pulse 1s infinite">💥</div>',
            className: '', iconSize: [32, 32], iconAnchor: [16, 16]
        })
    });
    marker.bindPopup(createPopupHTML({
        icon: '💥',
        title: 'MENACE RÉELLE DÉTECTÉE',
        type: 'ALERTE SÉCURITÉ — DONNÉES RÉELLES',
        details: {
            'IP':      geo.ip,
            'Pays':    geo.country,
            'Ville':   geo.city,
            'FAI':     geo.isp,
            'Source':  '📡 ip-api.com RÉEL',
        }
    }));
    mapLayers['menaces'].addLayer(marker);
    setTimeout(() => mapLayers['menaces'].removeLayer(marker), 30000);
}

// Heartbeat → mise à jour UI
function updateHeartbeat(data) {
    setEl('hdr-systems', (ALG_STATE.metrics.active_systems).toLocaleString());
    // Ping WS pour garder la connexion
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'PING' }));
    }
}

// Indicateur de connexion WebSocket
function updateWSStatus(connected) {
    const ind = document.querySelector('.dz-surveillance-panel .dz-indicator');
    if (ind) {
        ind.className = connected ? 'dz-indicator dz-online' : 'dz-indicator dz-critical';
    }
}

// ============================================================
// AUTO-CONNECT au chargement
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Délai court pour laisser le reste s'initialiser
    setTimeout(connectWebSocket, 1500);
});
