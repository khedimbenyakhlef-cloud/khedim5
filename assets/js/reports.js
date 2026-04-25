/**
 * ALGERIA MEGASYS — REPORTS MODULE
 * Fondé par KHEDIM BENYAKHLEF dit BENY-JOE
 * Génération de rapports téléchargeables (PDF, Excel, JSON, CSV)
 */

'use strict';

// ============================================================
// REPORT TAB SWITCHING
// ============================================================
function switchReportTab(tabId) {
    document.querySelectorAll('.dz-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#reports-modal .dz-tab').forEach(t => t.classList.remove('active'));

    const content = document.getElementById(tabId + '-report');
    if (content) content.classList.add('active');

    document.querySelectorAll('#reports-modal .dz-tab').forEach(t => {
        if (t.textContent.toLowerCase().includes(tabId.slice(0, 4).toLowerCase())) t.classList.add('active');
    });

    // Populate security report
    if (tabId === 'security') buildSecurityReport();
    if (tabId === 'detailed') buildDetailedCasesReport();

    // Update daily stats
    if (tabId === 'daily') updateDailyReport();
}

function updateDailyReport() {
    const now = new Date();
    setEl('daily-time', now.toLocaleTimeString('fr-DZ'));
    setEl('daily-date', now.toLocaleDateString('fr-DZ'));
    setEl('daily-detections', ALG_STATE.metrics.total_detections);
    setEl('daily-critical', ALG_STATE.metrics.critical);
    setEl('daily-systems', ALG_STATE.metrics.active_systems.toLocaleString());
    setEl('daily-neutralized', ALG_STATE.metrics.neutralized);
}

// ============================================================
// SECURITY REPORT BUILDER
// ============================================================
function buildSecurityReport() {
    const el = document.getElementById('security-report-content');
    if (!el) return;

    const now = new Date();
    const critDets = ALG_STATE.detections.filter(d => d.level === 'critique').length;
    const highDets = ALG_STATE.detections.filter(d => d.level === 'haute').length;

    el.textContent = `
╔══════════════════════════════════════════════════════════════╗
║      RAPPORT DE SÉCURITÉ NATIONALE — ALGERIA MEGASYS         ║
║      Fondé par KHEDIM BENYAKHLEF dit BENY-JOE                ║
╚══════════════════════════════════════════════════════════════╝

Date de génération : ${now.toLocaleDateString('fr-DZ')} à ${now.toLocaleTimeString('fr-DZ')}
Classement        : SECRET DÉFENSE
Version système   : ALG-SEC v5.0 ULTRA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÉSUMÉ EXÉCUTIF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Détections totales    : ${ALG_STATE.metrics.total_detections}
  Menaces critiques     : ${critDets}
  Menaces hautes        : ${highDets}
  Systèmes actifs       : ${ALG_STATE.metrics.active_systems}
  Couverture territoire : 100%
  Wilayas surveillées   : 58/58

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAT DES FRONTIÈRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NORD  (Méditerranée)    : 1,200 KM — ✅ SÉCURISÉE
  EST   (Tunisie/Libye)   : 1,050 KM — ⚠️ SURVEILLANCE RENFORCÉE
  SUD   (Mali/Niger)      : 3,500 KM — ⚠️ SURVEILLANCE RENFORCÉE
  OUEST (Maroc/Mauritanie): 2,500 KM — ✅ SÉCURISÉE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTÈMES DE DÉTECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Radars longue portée    : 48 unités ACTIFS
  Satellites observation  : 7 unités OPÉRATIONNELS
  Drones surveillance     : 156 unités DÉPLOYÉS
  Capteurs sismiques      : 120 unités ACTIFS
  Caméras thermiques      : 85 unités ACTIVES
  Systèmes EW/SIGINT      : 24 unités ACTIFS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRAFICS SURVEILLÉS (TEMPS RÉEL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Aérien                  : ${ALG_STATE.metrics.air} aéronefs identifiés
  Maritime                : ${ALG_STATE.metrics.sea} navires identifiés
  Terrestre               : ${ALG_STATE.metrics.land.toLocaleString()} véhicules identifiés
  Cyber                   : ${ALG_STATE.metrics.cyber.toLocaleString()} connexions surveillées
  Anomalies               : ${ALG_STATE.metrics.anomalies} anomalies détectées

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALERTES ACTIVES (${ALG_STATE.alerts.slice(0,5).length} premières)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ALG_STATE.alerts.slice(0, 5).map(a => `  ${a.level} ${a.id}: ${a.msg}\n  Zone: ${a.zone} | ${a.time}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONCLUSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Le système national de surveillance est pleinement
  opérationnel. Niveau d'alerte : MAXIMUM.
  Recommandation : Maintenir surveillance renforcée
  aux frontières SUD et EST.

  Rapport certifié par : KHEDIM BENYAKHLEF dit BENY-JOE
  Plateforme : ALGERIA MEGASYS v5.0 ULTRA
`;
}

// ============================================================
// DETAILED CASES REPORT
// ============================================================
function buildDetailedCasesReport() {
    const container = document.getElementById('detailed-cases-list');
    if (!container) return;

    if (ALG_STATE.detections.length === 0) {
        container.innerHTML = '<div style="color:rgba(255,255,255,0.5);text-align:center;padding:40px">En attente de détections...</div>';
        return;
    }

    container.innerHTML = ALG_STATE.detections.slice(0, 100).map((d, i) => `
        <div class="case-item">
            <div class="case-item-header">
                <span class="case-id">${d.id}</span>
                <span class="case-type-badge" style="background:${d.level === 'critique' ? 'rgba(210,16,52,0.6)' : d.level === 'haute' ? 'rgba(255,100,0,0.5)' : 'rgba(0,150,0,0.4)'}">
                    ${d.status}
                </span>
            </div>
            <div class="case-details">
                <div class="case-detail-item">
                    <div class="case-detail-label">Type de menace</div>
                    <div class="case-detail-value">${d.label}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Wilaya concernée</div>
                    <div class="case-detail-value">${d.wilaya}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Coordonnées GPS</div>
                    <div class="case-detail-value">${d.lat}°N / ${d.lon}°E</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Vitesse détectée</div>
                    <div class="case-detail-value">${d.speed}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Altitude</div>
                    <div class="case-detail-value">${d.altitude}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Origine supposée</div>
                    <div class="case-detail-value">${d.origin}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Date & Heure</div>
                    <div class="case-detail-value">${d.dateStr} ${d.timeStr}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Niveau de menace</div>
                    <div class="case-detail-value" style="color:${d.level === 'critique' ? '#f00' : d.level === 'haute' ? '#f90' : '#0f0'}">${d.level.toUpperCase()}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Réponse système</div>
                    <div class="case-detail-value">${d.response}</div>
                </div>
                <div class="case-detail-item">
                    <div class="case-detail-label">Fondateur</div>
                    <div class="case-detail-value" style="color:var(--dz-gold)">KHEDIM BENYAKHLEF dit BENY-JOE</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================================
// PDF GENERATION
// ============================================================
function generateDailyPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-DZ');
    const timeStr = now.toLocaleTimeString('fr-DZ');

    // Header background
    doc.setFillColor(0, 98, 51);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFillColor(210, 16, 52);
    doc.rect(0, 42, 210, 3, 'F');

    // Gold line
    doc.setFillColor(255, 215, 0);
    doc.rect(0, 45, 210, 1.5, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 215, 0);
    doc.text('ALGERIA MEGASYS', 105, 16, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('SYSTÈME NATIONAL DE SURVEILLANCE & DÉFENSE', 105, 24, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text('Fondé par KHEDIM BENYAKHLEF dit BENY-JOE', 105, 31, { align: 'center' });
    doc.text('SECRET DÉFENSE — RAPPORT OFFICIEL', 105, 37, { align: 'center' });

    // Report info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT QUOTIDIEN DE SURVEILLANCE', 105, 55, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Généré le ${dateStr} à ${timeStr}`, 105, 62, { align: 'center' });

    // Executive Summary Table
    doc.autoTable({
        startY: 70,
        head: [['INDICATEUR', 'VALEUR', 'STATUT']],
        body: [
            ['Détections totales', ALG_STATE.metrics.total_detections, 'NORMAL'],
            ['Menaces critiques', ALG_STATE.metrics.critical, 'ATTENTION'],
            ['Systèmes actifs', ALG_STATE.metrics.active_systems, 'OPTIMAL'],
            ['Couverture territoire', '100%', 'MAXIMALE'],
            ['Trafic aérien', ALG_STATE.metrics.air + ' aéronefs', 'SURVEILLÉ'],
            ['Trafic maritime', ALG_STATE.metrics.sea + ' navires', 'SURVEILLÉ'],
            ['Trafic terrestre', ALG_STATE.metrics.land.toLocaleString() + ' véhicules', 'SURVEILLÉ'],
            ['Trafic cyber', ALG_STATE.metrics.cyber.toLocaleString() + ' connexions', 'SURVEILLÉ'],
            ['Anomalies détectées', ALG_STATE.metrics.anomalies, 'ENQUÊTE EN COURS'],
            ['Wilayas surveillées', '58/58', 'COMPLET'],
        ],
        headStyles: { fillColor: [0, 98, 51], textColor: [255, 215, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 248, 240] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 }
    });

    // State of Frontiers
    const afterTable = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 98, 51);
    doc.text('ÉTAT DES FRONTIÈRES', 14, afterTable);

    doc.autoTable({
        startY: afterTable + 5,
        head: [['FRONTIÈRE', 'LONGUEUR', 'PAYS', 'STATUT']],
        body: [
            ['NORD', '1,200 KM', 'Méditerranée', 'SÉCURISÉE'],
            ['EST', '1,050 KM', 'Tunisie / Libye', 'SURVEILLANCE RENFORCÉE'],
            ['SUD', '3,500 KM', 'Mali / Niger', 'SURVEILLANCE RENFORCÉE'],
            ['OUEST', '2,500 KM', 'Maroc / Mauritanie', 'SÉCURISÉE'],
        ],
        headStyles: { fillColor: [210, 16, 52], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 }
    });

    // Recent detections
    const afterBorder = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 98, 51);
    doc.text('DÉTECTIONS RÉCENTES (CAS PAR CAS)', 14, afterBorder);

    const detRows = ALG_STATE.detections.slice(0, 20).map(d => [
        d.id, d.label, d.wilaya, d.level.toUpperCase(), d.timeStr, d.response
    ]);

    if (detRows.length > 0) {
        doc.autoTable({
            startY: afterBorder + 5,
            head: [['ID', 'TYPE', 'WILAYA', 'NIVEAU', 'HEURE', 'RÉPONSE']],
            body: detRows,
            headStyles: { fillColor: [13, 27, 42], textColor: [255, 215, 0], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: { 3: { fontStyle: 'bold' } },
            margin: { left: 14, right: 14 }
        });
    }

    // Footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(0, 98, 51);
        doc.rect(0, 284, 210, 13, 'F');
        doc.setTextColor(255, 215, 0);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('ALGERIA MEGASYS — Fondé par KHEDIM BENYAKHLEF dit BENY-JOE — SECRET DÉFENSE', 105, 290, { align: 'center' });
        doc.text(`Page ${i}/${pageCount} — Généré le ${dateStr} à ${timeStr}`, 105, 294, { align: 'center' });

        // Kinsta footer
        doc.setTextColor(180, 200, 255);
        doc.text('Hébergé avec Kinsta — kinsta.com/?kaid=HUFPGOMPMRPI — Recommandé par BENY-JOE', 105, 298, { align: 'center' });
    }

    doc.save(`ALGERIA_MEGASYS_Rapport_Quotidien_${now.toISOString().slice(0, 10)}.pdf`);
    logToTerminal('✅ Rapport PDF quotidien généré et téléchargé', 'command');
}

// ============================================================
// ULTRA-DETAILED PDF
// ============================================================
function generateUltraDetailedPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-DZ');
    const timeStr = now.toLocaleTimeString('fr-DZ');

    // Cover page
    doc.setFillColor(13, 27, 42);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setFillColor(0, 98, 51);
    doc.rect(0, 0, 297, 8, 'F');
    doc.setFillColor(210, 16, 52);
    doc.rect(0, 202, 297, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(255, 215, 0);
    doc.text('ALGERIA MEGASYS', 148, 70, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('RAPPORT ULTRA-DÉTAILLÉ — CAS PAR CAS', 148, 85, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text('Fondé par KHEDIM BENYAKHLEF dit BENY-JOE', 148, 96, { align: 'center' });
    doc.text(`Généré le ${dateStr} à ${timeStr}`, 148, 104, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(210, 16, 52);
    doc.text('⚠  DOCUMENT CLASSIFIÉ — SECRET DÉFENSE  ⚠', 148, 115, { align: 'center' });

    // Page 2 — Summary
    doc.addPage('a4', 'landscape');

    doc.setFillColor(0, 98, 51);
    doc.rect(0, 0, 297, 15, 'F');
    doc.setTextColor(255, 215, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('RÉSUMÉ EXÉCUTIF — ALGERIA MEGASYS', 148, 10, { align: 'center' });

    doc.autoTable({
        startY: 22,
        head: [['INDICATEUR', 'VALEUR', 'VARIATION', 'STATUT', 'PRIORITÉ']],
        body: [
            ['Détections totales', ALG_STATE.metrics.total_detections, '+' + Math.floor(Math.random() * 20), 'NORMAL', 'BASSE'],
            ['Menaces critiques', ALG_STATE.metrics.critical, '+' + Math.floor(Math.random() * 3), 'ALERTE', 'HAUTE'],
            ['Systèmes actifs', ALG_STATE.metrics.active_systems, '0', 'OPTIMAL', 'BASSE'],
            ['Couverture', '100%', '=', 'MAXIMALE', 'N/A'],
            ['Trafic aérien', ALG_STATE.metrics.air, '+' + Math.floor(Math.random() * 10), 'NORMAL', 'BASSE'],
            ['Trafic maritime', ALG_STATE.metrics.sea, '+' + Math.floor(Math.random() * 5), 'NORMAL', 'BASSE'],
            ['Trafic terrestre', ALG_STATE.metrics.land.toLocaleString(), '+' + Math.floor(Math.random() * 30), 'NORMAL', 'BASSE'],
            ['Trafic cyber', ALG_STATE.metrics.cyber.toLocaleString(), '+' + Math.floor(Math.random() * 100), 'SURVEILLANCE', 'MOYENNE'],
            ['Anomalies', ALG_STATE.metrics.anomalies, '+' + Math.floor(Math.random() * 2), 'ENQUÊTE', 'MOYENNE'],
        ],
        headStyles: { fillColor: [0, 0, 30], textColor: [255, 215, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 248, 240] },
        styles: { fontSize: 9, cellPadding: 3 },
    });

    // Pages for each detection
    const dets = ALG_STATE.detections.slice(0, 50);
    dets.forEach((d, i) => {
        doc.addPage('a4', 'landscape');

        doc.setFillColor(13, 27, 42);
        doc.rect(0, 0, 297, 15, 'F');
        doc.setTextColor(255, 215, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`CAS N°${i + 1} — ${d.id}`, 148, 10, { align: 'center' });

        doc.autoTable({
            startY: 20,
            head: [['CHAMP', 'INFORMATION']],
            body: [
                ['Identifiant unique', d.id],
                ['Type de menace', d.label],
                ['Niveau de menace', d.level.toUpperCase()],
                ['Wilaya', d.wilaya],
                ['Latitude', d.lat + '°N'],
                ['Longitude', d.lon + '°E'],
                ['Vitesse détectée', d.speed],
                ['Altitude', d.altitude],
                ['Origine supposée', d.origin],
                ['Date de détection', d.dateStr],
                ['Heure de détection', d.timeStr],
                ['Statut', d.status],
                ['Réponse système', d.response],
                ['Fondateur', 'KHEDIM BENYAKHLEF dit BENY-JOE'],
                ['Plateforme', 'ALGERIA MEGASYS v5.0 ULTRA'],
            ],
            headStyles: { fillColor: [210, 16, 52], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
        });
    });

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 202, 297, 8, 'F');
        doc.setTextColor(255, 215, 0);
        doc.setFontSize(7);
        doc.text('ALGERIA MEGASYS — Fondé par KHEDIM BENYAKHLEF dit BENY-JOE | kinsta.com/?kaid=HUFPGOMPMRPI', 148, 207, { align: 'center' });
        doc.text(`Page ${i}/${pageCount}`, 280, 207);
    }

    doc.save(`ALGERIA_MEGASYS_Ultra_Détaillé_${Date.now()}.pdf`);
    logToTerminal('✅ Rapport Ultra-Détaillé PDF généré', 'command');
}

function generateWeeklyPDF() { generateDailyPDF(); }

// ============================================================
// EXCEL GENERATION
// ============================================================
function generateDailyExcel() {
    const wb = XLSX.utils.book_new();
    const now = new Date();

    // Sheet 1 — Summary
    const summaryData = [
        ['ALGERIA MEGASYS — RAPPORT QUOTIDIEN'],
        ['Fondé par KHEDIM BENYAKHLEF dit BENY-JOE'],
        ['Généré le', now.toLocaleDateString('fr-DZ'), 'à', now.toLocaleTimeString('fr-DZ')],
        [],
        ['INDICATEUR', 'VALEUR', 'STATUT'],
        ['Détections totales', ALG_STATE.metrics.total_detections, 'NORMAL'],
        ['Menaces critiques', ALG_STATE.metrics.critical, 'ALERTE'],
        ['Systèmes actifs', ALG_STATE.metrics.active_systems, 'OPTIMAL'],
        ['Trafic aérien', ALG_STATE.metrics.air, 'SURVEILLÉ'],
        ['Trafic maritime', ALG_STATE.metrics.sea, 'SURVEILLÉ'],
        ['Trafic terrestre', ALG_STATE.metrics.land, 'SURVEILLÉ'],
        ['Trafic cyber', ALG_STATE.metrics.cyber, 'SURVEILLÉ'],
        ['Anomalies', ALG_STATE.metrics.anomalies, 'ENQUÊTE'],
        ['Couverture territoire', '100%', 'MAXIMALE'],
        ['Wilayas surveillées', '58/58', 'COMPLET'],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Résumé');

    // Sheet 2 — Detections
    const detHeader = ['ID', 'TYPE', 'LABEL', 'WILAYA', 'NIVEAU', 'LATITUDE', 'LONGITUDE', 'VITESSE', 'ALTITUDE', 'ORIGINE', 'DATE', 'HEURE', 'STATUT', 'RÉPONSE'];
    const detRows = ALG_STATE.detections.slice(0, 1000).map(d => [
        d.id, d.type, d.label, d.wilaya, d.level, d.lat, d.lon, d.speed, d.altitude, d.origin, d.dateStr, d.timeStr, d.status, d.response
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([detHeader, ...detRows]);
    XLSX.utils.book_append_sheet(wb, ws2, 'Détections');

    // Sheet 3 — Alerts
    if (ALG_STATE.alerts.length > 0) {
        const alertHeader = ['ID', 'MESSAGE', 'ZONE', 'NIVEAU', 'HEURE'];
        const alertRows = ALG_STATE.alerts.map(a => [a.id, a.msg, a.zone, a.level, a.time]);
        const ws3 = XLSX.utils.aoa_to_sheet([alertHeader, ...alertRows]);
        XLSX.utils.book_append_sheet(wb, ws3, 'Alertes');
    }

    // Sheet 4 — Systems
    const sysHeader = ['ID', 'NOM', 'TYPE', 'STATUT'];
    const sysRows = [
        ...ALG_STATE.systemsData.radars.slice(0, 20).map(r => [r.id, r.name, 'RADAR', r.status]),
        ...ALG_STATE.systemsData.satellites.map(s => [s.id, s.name, 'SATELLITE', s.status]),
        ...ALG_STATE.systemsData.drones.slice(0, 20).map(d => [d.id, d.type, 'DRONE', d.status]),
    ];
    const ws4 = XLSX.utils.aoa_to_sheet([sysHeader, ...sysRows]);
    XLSX.utils.book_append_sheet(wb, ws4, 'Systèmes');

    XLSX.writeFile(wb, `ALGERIA_MEGASYS_Rapport_${now.toISOString().slice(0, 10)}.xlsx`);
    logToTerminal('✅ Rapport Excel généré', 'command');
}

function generateDetailedExcel() { generateDailyExcel(); }

// ============================================================
// JSON EXPORT
// ============================================================
function generateDailyJSON() {
    const now = new Date();
    const payload = {
        metadata: {
            system: 'ALGERIA MEGASYS v5.0 ULTRA',
            founder: 'KHEDIM BENYAKHLEF dit BENY-JOE',
            platform: 'kinsta.com/?kaid=HUFPGOMPMRPI',
            generated: now.toISOString(),
            classification: 'SECRET DÉFENSE'
        },
        summary: {
            total_detections: ALG_STATE.metrics.total_detections,
            critical_threats: ALG_STATE.metrics.critical,
            active_systems: ALG_STATE.metrics.active_systems,
            coverage: '100%',
            wilayas: 58
        },
        traffic: {
            air: ALG_STATE.metrics.air,
            sea: ALG_STATE.metrics.sea,
            land: ALG_STATE.metrics.land,
            cyber: ALG_STATE.metrics.cyber,
            anomalies: ALG_STATE.metrics.anomalies
        },
        detections: ALG_STATE.detections.slice(0, 500),
        alerts: ALG_STATE.alerts.slice(0, 100),
        logs: ALG_STATE.logs.slice(0, 200)
    };
    downloadBlob(JSON.stringify(payload, null, 2), 'application/json',
        `ALGERIA_MEGASYS_${now.toISOString().slice(0, 10)}.json`);
    logToTerminal('✅ Export JSON généré', 'command');
}

// ============================================================
// CSV EXPORT
// ============================================================
function generateDailyCSV() {
    const now = new Date();
    let csv = 'ID,TYPE,LABEL,WILAYA,NIVEAU,LATITUDE,LONGITUDE,VITESSE,ALTITUDE,ORIGINE,DATE,HEURE,STATUT,RÉPONSE\n';
    csv += ALG_STATE.detections.slice(0, 500).map(d =>
        `"${d.id}","${d.type}","${d.label}","${d.wilaya}","${d.level}","${d.lat}","${d.lon}","${d.speed}","${d.altitude}","${d.origin}","${d.dateStr}","${d.timeStr}","${d.status}","${d.response}"`
    ).join('\n');

    downloadBlob(csv, 'text/csv;charset=utf-8',
        `ALGERIA_MEGASYS_Detections_${now.toISOString().slice(0, 10)}.csv`);
    logToTerminal('✅ Export CSV généré', 'command');
}

// ============================================================
// PRINT
// ============================================================
function printDailyReport() { window.print(); }

// ============================================================
// EXPORT ALL
// ============================================================
function exportAllData() {
    generateDailyPDF();
    setTimeout(() => generateDailyExcel(), 1000);
    setTimeout(() => generateDailyJSON(), 2000);
    setTimeout(() => generateDailyCSV(), 3000);
    logToTerminal('✅ Export complet en cours (PDF + Excel + JSON + CSV)', 'command');
}
