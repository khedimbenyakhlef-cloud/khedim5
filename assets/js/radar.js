/**
 * ALGERIA MEGASYS — RADAR MODULE
 * Fondé par KHEDIM BENYAKHLEF dit BENY-JOE
 * Radar national animé en temps réel
 */

'use strict';

let radarCanvas, radarCtx;
let radarAngle = 0;
let radarTargets = [];
let radarAnimFrame;

const RADAR_COLORS = {
    bg: '#001a00',
    grid: 'rgba(0,255,0,0.25)',
    sweep: 'rgba(0,255,0,0.85)',
    sweepTrail: 'rgba(0,255,0,0.15)',
    blip_normal: '#00ff00',
    blip_warning: '#ffaa00',
    blip_critical: '#ff3300',
    blip_friend: '#0099ff',
    text: 'rgba(0,255,0,0.7)',
    center: '#00ff88',
};

// ============================================================
// INIT RADAR
// ============================================================
function initRadarSystem() {
    radarCanvas = document.getElementById('dz-radar');
    if (!radarCanvas) return;
    radarCtx = radarCanvas.getContext('2d');

    // Initial targets
    for (let i = 0; i < 18; i++) addRandomTarget();

    // Start animation
    animateRadar();

    // Add/remove targets periodically
    setInterval(updateRadarTargets, 3000);
    setInterval(updateRadarDisplay, 1000);
}

// ============================================================
// TARGETS
// ============================================================
const TARGET_TYPES = [
    { type: 'aerien', color: RADAR_COLORS.blip_normal, label: 'AÉRIEN' },
    { type: 'aerien_mil', color: RADAR_COLORS.blip_friend, label: 'AÉRIEN MIL' },
    { type: 'maritime', color: '#00ccff', label: 'MARITIME' },
    { type: 'menace', color: RADAR_COLORS.blip_critical, label: 'MENACE' },
    { type: 'inconnu', color: RADAR_COLORS.blip_warning, label: 'INCONNU' },
    { type: 'drone', color: '#ff8800', label: 'DRONE' },
];

function addRandomTarget() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.15 + Math.random() * 0.78;
    const typeData = TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)];
    const isMenace = typeData.type === 'menace' || typeData.type === 'inconnu';

    radarTargets.push({
        id: 'TGT-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        angle, dist,
        speed: (Math.random() * 0.005 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        typeData,
        isMenace,
        size: isMenace ? 5 : 4,
        brightness: 1,
        trail: [],
        lifetime: 30000 + Math.random() * 60000,
        born: Date.now(),
    });
}

function updateRadarTargets() {
    const now = Date.now();
    radarTargets = radarTargets.filter(t => now - t.born < t.lifetime);

    while (radarTargets.length < 15) addRandomTarget();

    // Randomly add threats
    if (Math.random() < 0.3) {
        const menace = {
            id: 'ALG-' + Math.random().toString(36).slice(2, 5).toUpperCase(),
            angle: Math.random() * Math.PI * 2,
            dist: 0.6 + Math.random() * 0.35,
            speed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
            typeData: TARGET_TYPES[3],
            isMenace: true,
            size: 6,
            brightness: 1,
            trail: [],
            lifetime: 15000 + Math.random() * 20000,
            born: Date.now(),
        };
        radarTargets.push(menace);
    }
}

// ============================================================
// DRAW RADAR
// ============================================================
function animateRadar() {
    if (!radarCanvas || !radarCtx) return;

    const W = radarCanvas.parentElement.offsetWidth;
    const H = radarCanvas.parentElement.offsetHeight;
    radarCanvas.width = W;
    radarCanvas.height = H;

    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) / 2 - 15;

    radarCtx.clearRect(0, 0, W, H);

    drawRadarBG(radarCtx, cx, cy, R);
    drawRadarGrid(radarCtx, cx, cy, R);
    drawRadarSweep(radarCtx, cx, cy, R);
    drawTargets(radarCtx, cx, cy, R);
    drawRadarInfo(radarCtx, cx, cy, R, W, H);

    // Move targets
    radarTargets.forEach(t => {
        t.angle += t.speed;
        t.trail.push({ angle: t.angle, dist: t.dist });
        if (t.trail.length > 8) t.trail.shift();
    });

    radarAngle += 0.025;
    if (radarAngle >= Math.PI * 2) radarAngle = 0;

    radarAnimFrame = requestAnimationFrame(animateRadar);
}

function drawRadarBG(ctx, cx, cy, R) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = RADAR_COLORS.bg;
    ctx.fill();
    ctx.restore();
}

function drawRadarGrid(ctx, cx, cy, R) {
    ctx.save();
    ctx.strokeStyle = RADAR_COLORS.grid;
    ctx.lineWidth = 0.8;

    // Concentric circles
    [0.25, 0.5, 0.75, 1.0].forEach(ratio => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * ratio, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Cross lines
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
        ctx.stroke();
    }

    // Range labels
    ctx.fillStyle = RADAR_COLORS.text;
    ctx.font = '10px Courier New';
    ctx.textAlign = 'center';
    ['800KM', '1600KM', '2400KM', '3200KM'].forEach((label, i) => {
        ctx.fillText(label, cx + R * (i + 1) * 0.25 + 5, cy - 4);
    });

    // Cardinal directions
    ctx.font = 'bold 11px Courier New';
    ctx.fillStyle = 'rgba(0,255,0,0.9)';
    ctx.fillText('N', cx, cy - R - 5);
    ctx.fillText('S', cx, cy + R + 14);
    ctx.textAlign = 'right';
    ctx.fillText('O', cx - R - 5, cy + 4);
    ctx.textAlign = 'left';
    ctx.fillText('E', cx + R + 5, cy + 4);

    ctx.restore();
}

function drawRadarSweep(ctx, cx, cy, R) {
    ctx.save();

    // Sweep trail gradient
    const gradient = ctx.createConicalGradient ?
        null : null; // fallback

    // Draw sweep arc trail
    for (let trail = 0; trail < 30; trail++) {
        const trailAngle = radarAngle - (trail / 30) * 1.2;
        const alpha = (1 - trail / 30) * 0.18;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, trailAngle - 0.04, trailAngle);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,255,100,${alpha})`;
        ctx.fill();
    }

    // Main sweep line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(radarAngle) * R, cy + Math.sin(radarAngle) * R);
    ctx.strokeStyle = 'rgba(0,255,100,0.9)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ff66';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
}

function drawTargets(ctx, cx, cy, R) {
    radarTargets.forEach(t => {
        const x = cx + Math.cos(t.angle) * R * t.dist;
        const y = cy + Math.sin(t.angle) * R * t.dist;

        // Check if within sweep proximity (make it "blink" when swept)
        const sweepDiff = ((t.angle - radarAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (sweepDiff < 0.3) { t.brightness = 1; }
        else { t.brightness = Math.max(0.2, t.brightness - 0.01); }

        const color = t.typeData.color;
        const alpha = t.brightness;

        // Draw trail
        t.trail.forEach((point, i) => {
            const tx = cx + Math.cos(point.angle) * R * point.dist;
            const ty = cy + Math.sin(point.angle) * R * point.dist;
            const trailAlpha = (i / t.trail.length) * alpha * 0.4;
            ctx.beginPath();
            ctx.arc(tx, ty, 2, 0, Math.PI * 2);
            ctx.fillStyle = color.replace(')', `, ${trailAlpha})`).replace('rgb(', 'rgba(') || `rgba(0,255,0,${trailAlpha})`;
            ctx.fill();
        });

        // Draw blip
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, t.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = t.isMenace ? 15 : 8;
        ctx.shadowColor = color;
        ctx.fill();

        // Cross hair for threats
        if (t.isMenace) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = alpha * 0.7;
            const cross = t.size + 5;
            ctx.beginPath();
            ctx.moveTo(x - cross, y); ctx.lineTo(x + cross, y);
            ctx.moveTo(x, y - cross); ctx.lineTo(x, y + cross);
            ctx.stroke();
        }

        ctx.restore();

        // Label
        if (t.brightness > 0.5) {
            ctx.save();
            ctx.font = '9px Courier New';
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.fillText(t.id, x + t.size + 3, y - 2);
            ctx.restore();
        }
    });
}

function drawRadarInfo(ctx, cx, cy, R, W, H) {
    ctx.save();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-DZ');
    const totalTargets = radarTargets.length;
    const threats = radarTargets.filter(t => t.isMenace).length;

    // Outer ring glow
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,255,100,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00ff88';
    ctx.fill();

    ctx.restore();

    // Update DOM indicators
    const radEl = document.getElementById('radar-detections');
    const actEl = document.getElementById('active-detections');
    const thrEl = document.getElementById('radar-threats');
    if (radEl) radEl.textContent = totalTargets;
    if (actEl) actEl.textContent = totalTargets;
    if (thrEl) thrEl.textContent = threats;
}

function updateRadarDisplay() {
    // Ensure canvas resizes with container
    if (!radarCanvas) return;
    const parent = radarCanvas.parentElement;
    if (!parent) return;
    if (radarCanvas.width !== parent.offsetWidth || radarCanvas.height !== parent.offsetHeight) {
        // Will be handled in animateRadar
    }
}
