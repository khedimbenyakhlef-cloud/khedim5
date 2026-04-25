/**
 * ALGERIA MEGASYS v5.0 — BACKEND SERVEUR RÉEL
 * Fondé par KHEDIM BENYAKHLEF dit BENY-JOE
 *
 * Ce serveur agrège EN TEMPS RÉEL :
 *  ✈️  OpenSky Network    — vols ADS-B réels
 *  🌐  ip-api.com         — géolocalisation IP réelle
 *  🛡️  ThreatFox (public) — menaces cyber réelles
 *  🌡️  Open-Meteo         — météo Alger réelle
 *  ⏰  WorldTimeAPI        — heure Alger officielle
 *  📡  WebSocket          — push temps réel vers le frontend
 */

'use strict';

const express    = require('express');
const cors       = require('cors');
const http       = require('http');
const WebSocket  = require('ws');
const fetch      = require('node-fetch');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression = require('compression');
const path       = require('path');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use(express.json());

// Servir le frontend statique
app.use(express.static(path.join(__dirname, '..')));

// ============================================================
// ÉTAT GLOBAL DU SERVEUR
// ============================================================
const STATE = {
    flights:       [],   // Vols réels OpenSky
    threats:       [],   // Menaces cyber ThreatFox
    weather:       null, // Météo Alger
    algerTime:     null, // Heure officielle
    connectedClients: 0,
    lastUpdates: {
        flights:  0,
        threats:  0,
        weather:  0,
        time:     0,
    },
    stats: {
        total_broadcasts: 0,
        total_detections: 0,
        real_threats_found: 0,
    }
};

// ============================================================
// REAL API FETCHERS
// ============================================================

// ✈️ OpenSky Network — Vols réels au-dessus Algérie + zones limitrophes
async function fetchOpenSkyFlights() {
    const url = 'https://opensky-network.org/api/states/all?lamin=18.9&lamax=37.5&lomin=-9.0&lomax=12.5';
    try {
        const resp = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            timeout: 10000
        });
        if (!resp.ok) throw new Error(`OpenSky HTTP ${resp.status}`);
        const data = await resp.json();

        if (!data || !data.states) {
            console.log('[OpenSky] Aucun vol retourné');
            return;
        }

        STATE.flights = data.states
            .filter(s => s && s[5] !== null && s[6] !== null)
            .map(s => ({
                icao24:    s[0],
                callsign:  (s[1] || '').trim(),
                country:   s[2],
                lon:       s[5],
                lat:       s[6],
                altitude:  s[7] || 0,
                onGround:  s[8],
                speed_ms:  s[9] || 0,
                speed_kmh: s[9] ? Math.round(s[9] * 3.6) : 0,
                heading:   s[10] || 0,
                vertical:  s[11] || 0,
                squawk:    s[13],
                last_contact: s[4],
                source:    'OpenSky Network RÉEL',
                fetchedAt: Date.now(),
                // Analyse menace
                isSuspect: !s[1] || (s[1] || '').trim() === '' || (s[9] && s[9] * 3.6 > 900) || (s[7] && s[7] > 15000),
                isMilitary: militaryCheck(s[1], s[2]),
            }));

        STATE.lastUpdates.flights = Date.now();
        STATE.stats.total_detections += STATE.flights.length;

        const suspects = STATE.flights.filter(f => f.isSuspect).length;
        const military = STATE.flights.filter(f => f.isMilitary).length;

        console.log(`[OpenSky ✈️] ${STATE.flights.length} vols réels | ${suspects} suspects | ${military} militaires`);

        // Broadcast aux clients connectés
        broadcast({
            type:      'FLIGHTS_UPDATE',
            source:    'OpenSky Network',
            real:      true,
            count:     STATE.flights.length,
            suspects,
            military,
            flights:   STATE.flights,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[OpenSky] Erreur:', err.message);
        broadcast({ type: 'API_ERROR', api: 'OpenSky', error: err.message });
    }
}

function militaryCheck(callsign, country) {
    if (!callsign) return false;
    const cs = callsign.toUpperCase();
    const milPrefixes = ['MIL','AFR','RFR','FORTE','DANIA','JAKE','REACH','TOPAZ','VIPER','TIGER'];
    return milPrefixes.some(p => cs.startsWith(p));
}

// 🛡️ ThreatFox — Menaces cyber réelles (abuse.ch)
async function fetchRealCyberThreats() {
    const url = 'https://threatfox-api.abuse.ch/api/v1/';
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'get_iocs', days: 1, limit: 20 }),
            timeout: 10000
        });
        if (!resp.ok) throw new Error(`ThreatFox HTTP ${resp.status}`);
        const data = await resp.json();

        if (data.query_status !== 'ok' || !data.data) {
            console.log('[ThreatFox] Pas de données');
            return;
        }

        STATE.threats = data.data.slice(0, 20).map(t => ({
            id:          t.id,
            ioc:         t.ioc,
            ioc_type:    t.ioc_type,
            threat_type: t.threat_type,
            malware:     t.malware,
            malware_alias: t.malware_alias,
            confidence:  t.confidence_level,
            reporter:    t.reporter,
            first_seen:  t.first_seen,
            last_seen:   t.last_seen,
            tags:        t.tags,
            source:      'ThreatFox / abuse.ch RÉEL',
        }));

        STATE.lastUpdates.threats = Date.now();
        STATE.stats.real_threats_found += STATE.threats.length;

        console.log(`[ThreatFox 🛡️] ${STATE.threats.length} menaces cyber réelles récupérées`);

        broadcast({
            type:      'CYBER_THREATS_UPDATE',
            source:    'ThreatFox abuse.ch',
            real:      true,
            count:     STATE.threats.length,
            threats:   STATE.threats,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[ThreatFox] Erreur:', err.message);
    }
}

// 🌡️ Météo Alger réelle — Open-Meteo
async function fetchRealWeather() {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=36.7372&longitude=3.0868&current_weather=true&wind_speed_unit=kmh&hourly=temperature_2m,precipitation,cloudcover&forecast_days=1';
    try {
        const resp = await fetch(url, { timeout: 8000 });
        if (!resp.ok) throw new Error(`Open-Meteo HTTP ${resp.status}`);
        const data = await resp.json();

        STATE.weather = {
            temperature:  data.current_weather.temperature,
            windspeed:    data.current_weather.windspeed,
            winddirection: data.current_weather.winddirection,
            weathercode:  data.current_weather.weathercode,
            is_day:       data.current_weather.is_day,
            source:       'Open-Meteo RÉEL',
            location:     'Alger, Algérie',
            fetchedAt:    Date.now(),
        };

        STATE.lastUpdates.weather = Date.now();
        console.log(`[Open-Meteo 🌡️] ${STATE.weather.temperature}°C | Vent: ${STATE.weather.windspeed} km/h`);

        broadcast({
            type:      'WEATHER_UPDATE',
            source:    'Open-Meteo',
            real:      true,
            weather:   STATE.weather,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[Open-Meteo] Erreur:', err.message);
    }
}

// ⏰ Heure officielle Alger
async function fetchAlgerTime() {
    try {
        const resp = await fetch('https://worldtimeapi.org/api/timezone/Africa/Algiers', { timeout: 5000 });
        if (!resp.ok) throw new Error(`WorldTimeAPI HTTP ${resp.status}`);
        const data = await resp.json();

        STATE.algerTime = {
            datetime:   data.datetime,
            utc_offset: data.utc_offset,
            dst:        data.dst,
            timezone:   data.timezone,
            source:     'WorldTimeAPI RÉEL',
        };

        STATE.lastUpdates.time = Date.now();

        broadcast({
            type:      'TIME_UPDATE',
            source:    'WorldTimeAPI',
            real:      true,
            time:      STATE.algerTime,
            timestamp: data.datetime
        });

    } catch (err) {
        // Fallback silencieux — le frontend calcule l'heure lui-même
    }
}

// ============================================================
// WEBSOCKET — PUSH TEMPS RÉEL
// ============================================================
wss.on('connection', (ws, req) => {
    STATE.connectedClients++;
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`[WS] Client connecté: ${clientIP} | Total: ${STATE.connectedClients}`);

    // Envoyer l'état actuel immédiatement
    ws.send(JSON.stringify({
        type:     'INIT',
        message:  'Connexion ALGERIA MEGASYS établie',
        founder:  'KHEDIM BENYAKHLEF dit BENY-JOE',
        version:  'v5.0 ULTRA',
        flights:  STATE.flights,
        threats:  STATE.threats,
        weather:  STATE.weather,
        time:     STATE.algerTime,
        stats:    STATE.stats,
        clients:  STATE.connectedClients,
        timestamp: new Date().toISOString()
    }));

    // Identifier le visiteur
    identifyVisitor(clientIP, ws);

    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            handleClientMessage(data, ws);
        } catch (e) {}
    });

    ws.on('close', () => {
        STATE.connectedClients = Math.max(0, STATE.connectedClients - 1);
        console.log(`[WS] Client déconnecté | Total: ${STATE.connectedClients}`);
    });

    ws.on('error', (err) => console.error('[WS] Erreur client:', err.message));
});

// Géolocaliser le visiteur réel
async function identifyVisitor(ip, ws) {
    // Ne pas géolocaliser les IPs locales
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
        ws.send(JSON.stringify({
            type:   'VISITOR_INFO',
            ip,
            local:  true,
            source: 'Connexion locale',
        }));
        return;
    }

    try {
        const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp,org,as,query`, { timeout: 5000 });
        if (!resp.ok) return;
        const geo = await resp.json();

        if (geo.status !== 'success') return;

        const visitorData = {
            type:        'VISITOR_INFO',
            ip:          geo.query,
            country:     geo.country,
            countryCode: geo.countryCode,
            region:      geo.regionName,
            city:        geo.city,
            lat:         geo.lat,
            lon:         geo.lon,
            isp:         geo.isp,
            org:         geo.org,
            as:          geo.as,
            source:      'ip-api.com RÉEL',
            real:        true,
            timestamp:   new Date().toISOString(),
        };

        // Analyse sécurité
        const suspiciousCountries = ['RU','CN','KP','IR','SY','LY','ML','SD'];
        const org = (geo.org || '').toLowerCase();
        const isp = (geo.isp || '').toLowerCase();
        const vpnKeywords = ['vpn','proxy','tor','hosting','server','cloud','digitalocean','linode','vultr','ovh','hetzner','aws','azure','google cloud'];
        const isVPN = vpnKeywords.some(k => org.includes(k) || isp.includes(k));
        const isSuspect = suspiciousCountries.includes(geo.countryCode) || isVPN;

        visitorData.isVPN      = isVPN;
        visitorData.isSuspect  = isSuspect;
        visitorData.threatLevel = isSuspect ? 'haute' : geo.countryCode === 'DZ' ? 'normale' : 'surveillance';

        console.log(`[Visiteur 🌐] ${geo.city}, ${geo.country} | ${geo.isp} | VPN: ${isVPN} | Suspect: ${isSuspect}`);

        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(visitorData));

        // Broadcaster à tous si suspect
        if (isSuspect) {
            broadcast({
                type:    'SECURITY_ALERT',
                message: `Connexion suspecte depuis ${geo.country} (${geo.isp})`,
                ip:      geo.query,
                geo:     visitorData,
                real:    true,
            });
        }

    } catch (err) {
        console.error('[Visitor ID] Erreur:', err.message);
    }
}

function handleClientMessage(data, ws) {
    switch (data.type) {
        case 'REQUEST_FLIGHTS':
            ws.send(JSON.stringify({ type: 'FLIGHTS_UPDATE', flights: STATE.flights, timestamp: new Date().toISOString() }));
            break;
        case 'REQUEST_THREATS':
            ws.send(JSON.stringify({ type: 'CYBER_THREATS_UPDATE', threats: STATE.threats, timestamp: new Date().toISOString() }));
            break;
        case 'PING':
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
            break;
    }
}

function broadcast(data) {
    const msg = JSON.stringify(data);
    STATE.stats.total_broadcasts++;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

// ============================================================
// REST API ROUTES
// ============================================================

// Statut général du système
app.get('/api/status', (req, res) => {
    res.json({
        system:   'ALGERIA MEGASYS v5.0 ULTRA',
        founder:  'KHEDIM BENYAKHLEF dit BENY-JOE',
        status:   'OPÉRATIONNEL',
        uptime:   process.uptime(),
        clients:  STATE.connectedClients,
        stats:    STATE.stats,
        lastUpdates: STATE.lastUpdates,
        timestamp: new Date().toISOString()
    });
});

// Vols réels actuels
app.get('/api/flights', (req, res) => {
    res.json({
        source:    'OpenSky Network RÉEL',
        count:     STATE.flights.length,
        suspects:  STATE.flights.filter(f => f.isSuspect).length,
        flights:   STATE.flights,
        updatedAt: STATE.lastUpdates.flights,
        timestamp: new Date().toISOString()
    });
});

// Menaces cyber réelles
app.get('/api/threats', (req, res) => {
    res.json({
        source:    'ThreatFox / abuse.ch RÉEL',
        count:     STATE.threats.length,
        threats:   STATE.threats,
        updatedAt: STATE.lastUpdates.threats,
        timestamp: new Date().toISOString()
    });
});

// Météo réelle
app.get('/api/weather', (req, res) => {
    res.json({
        source:    'Open-Meteo RÉEL',
        location:  'Alger, Algérie',
        weather:   STATE.weather,
        updatedAt: STATE.lastUpdates.weather,
        timestamp: new Date().toISOString()
    });
});

// Géolocalisation IP (du demandeur)
app.get('/api/identify', async (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    try {
        const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp,org,query`);
        const geo  = await resp.json();
        res.json({ ...geo, source: 'ip-api.com RÉEL', requestedAt: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rapport JSON complet
app.get('/api/report', (req, res) => {
    res.json({
        system:    'ALGERIA MEGASYS v5.0 ULTRA',
        founder:   'KHEDIM BENYAKHLEF dit BENY-JOE',
        affiliate: 'https://kinsta.com/?kaid=HUFPGOMPMRPI',
        generated: new Date().toISOString(),
        flights:   STATE.flights,
        threats:   STATE.threats,
        weather:   STATE.weather,
        stats:     STATE.stats,
        clients:   STATE.connectedClients,
    });
});

// ============================================================
// SCHEDULER — Mise à jour automatique
// ============================================================
async function runAllFetches() {
    console.log('\n[SCHEDULER] ⏰ Mise à jour données réelles...');
    await fetchAlgerTime();
    await fetchOpenSkyFlights();
    await fetchRealWeather();
    await fetchRealCyberThreats();
    console.log('[SCHEDULER] ✅ Toutes les données mises à jour\n');
}

// Premier fetch immédiat
runAllFetches();

// Vols : toutes les 30 secondes (limite OpenSky)
setInterval(fetchOpenSkyFlights, 30 * 1000);

// Météo : toutes les 5 minutes
setInterval(fetchRealWeather, 5 * 60 * 1000);

// Menaces cyber : toutes les 10 minutes
setInterval(fetchRealCyberThreats, 10 * 60 * 1000);

// Heure : toutes les minutes
setInterval(fetchAlgerTime, 60 * 1000);

// Heartbeat WebSocket toutes les 10 secondes
setInterval(() => {
    broadcast({
        type:      'HEARTBEAT',
        timestamp: new Date().toISOString(),
        clients:   STATE.connectedClients,
        flights:   STATE.flights.length,
        threats:   STATE.threats.length,
        stats:     STATE.stats,
    });
}, 10 * 1000);

// ============================================================
// START SERVER
// ============================================================
server.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║   ALGERIA MEGASYS v5.0 ULTRA — BACKEND       ║');
    console.log('║   Fondé par KHEDIM BENYAKHLEF dit BENY-JOE   ║');
    console.log('╠═══════════════════════════════════════════════╣');
    console.log(`║   🌐 HTTP  : http://localhost:${PORT}             ║`);
    console.log(`║   📡 WS    : ws://localhost:${PORT}               ║`);
    console.log('║   ✈️  OpenSky : Vols réels (30s)               ║');
    console.log('║   🛡️  ThreatFox : Menaces réelles (10min)      ║');
    console.log('║   🌡️  Open-Meteo : Météo réelle (5min)         ║');
    console.log('║   🌐 ip-api : Géoloc visiteurs réelle          ║');
    console.log('╚═══════════════════════════════════════════════╝\n');
});

module.exports = { app, server };
