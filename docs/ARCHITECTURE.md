# ALGERIA MEGASYS — Architecture Technique

## APIs Réelles Intégrées

### 1. OpenSky Network (Trafic Aérien Réel)
- **URL** : `https://opensky-network.org/api/states/all`
- **Zone** : Algérie + environs (lat 18-37, lon -9 à +12)
- **Données** : ICAO24, callsign, pays, altitude, vitesse, cap, au sol
- **Format** : JSON — tableau `states[]`
- **Limite** : 400 requêtes/jour (anonyme) | Illimité (avec compte)
- **Refresh** : Toutes les 30 secondes

### 2. ip-api.com (Géolocalisation IP)
- **URL** : `https://ip-api.com/json/`
- **Données** : IP, pays, ville, lat/lon, FAI, organisation, AS
- **Limite** : 45 req/min (gratuit)
- **Usage** : Détection et géolocalisation du visiteur en temps réel

### 3. Open-Meteo (Météo Alger)
- **URL** : `https://api.open-meteo.com/v1/forecast`
- **Paramètres** : lat=36.74, lon=3.06, current_weather=true
- **Données** : Température, vitesse vent, code météo
- **Limite** : Illimité (open source)

### 4. WorldTimeAPI (Heure Officielle Alger)
- **URL** : `https://worldtimeapi.org/api/timezone/Africa/Algiers`
- **Données** : datetime officiel, UTC offset, DST
- **Limite** : ~100 req/h

## Carte Leaflet
- **Provider** : CartoDB Dark Matter
- **Layers** : Frontières, Radars, Satellites, Trafic, Menaces, Wilayas, Drones, Bases
- **Markers** : Emoji SVG avec animation CSS
- **Popups** : HTML stylisé avec données temps réel

## Radar Canvas
- **API** : HTML5 Canvas 2D
- **Animation** : requestAnimationFrame (60fps)
- **Targets** : Mix données réelles (OpenSky) + scan simulé
- **Sweep** : Arc gradient animé

## Génération Rapports
- **PDF** : jsPDF + autoTable
- **Excel** : SheetJS (xlsx)
- **JSON** : JSON.stringify natif
- **CSV** : Blob + download link

## Responsive
- Desktop 1920px : 3 colonnes
- Laptop 1300px : 3 colonnes réduites
- Tablette 1100px : 1 colonne, panels horizontaux
- Mobile 768px : 1 colonne, carte réduite
- Mobile 480px : Compact, stats masquées
