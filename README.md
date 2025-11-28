# 🎙️ Talking Smart Sales

Eine Progressive Web App (PWA) für den Talking Smart Sales Podcast mit Offline-Unterstützung.

## ✨ Features

- **Offline-fähig**: Höre deine Lieblingsepisoden auch ohne Internetverbindung
- **Progressive Web App**: Installierbar auf Smartphone, Tablet und Desktop
- **Moderner Audio-Player** mit:
  - Play/Pause-Steuerung
  - Vor- und Zurückspulen (30s/15s)
  - Variable Abspielgeschwindigkeit (0.5x - 2.5x)
  - Progress-Bar zur Navigation
  - Episode-Navigation (nächste/vorherige)
- **Mehrsprachig**: Deutsch, Englisch, Spanisch, Französisch
- **Verschiedene Designs**: Wählbare Themes (thixx_standard, peterpohl, sigx, othimm)
- **Automatische Updates**: Update-Benachrichtigung bei neuen Versionen
- **Responsive Design**: Optimiert für alle Bildschirmgrößen

## 🚀 Quick Start

### Installation

1. Repository klonen:
```bash
git clone https://github.com/gunterstruck/TalkingSmartSales.git
cd TalkingSmartSales
```

2. Dependencies installieren:
```bash
npm install
```

3. App öffnen:
```bash
# Einfach die index.html in einem Browser öffnen
# oder einen lokalen Server starten:
python -m http.server 8000
# oder
npx serve
```

Die App ist nun unter `http://localhost:8000` verfügbar.

## 📱 Als PWA installieren

### Auf dem Smartphone (Android/iOS)

1. Öffne die App im Browser (Chrome, Safari, etc.)
2. Tippe auf das Menü (⋮ oder ⚙️)
3. Wähle "Zum Startbildschirm hinzufügen" oder "Installieren"
4. Die App erscheint nun als eigenständige App auf deinem Home-Screen

### Auf dem Desktop (Chrome/Edge)

1. Öffne die App im Browser
2. Klicke auf das ⊕ Symbol in der Adressleiste
3. Wähle "Installieren"

## 📂 Projektstruktur

```
TalkingSmartSales/
├── assets/
│   ├── audio/           # MP3-Episodendateien
│   ├── app.js          # Hauptanwendungslogik
│   ├── style.css       # Haupt-Styles
│   ├── theme-bootstrap.js  # Design-System
│   ├── episodes.json   # Automatisch generierte Episodenliste
│   └── *.png          # App-Icons
├── core/               # Core-Funktionalität
│   └── lang/          # Übersetzungen
├── lang/              # App-Übersetzungen
├── index.html         # Hauptseite
├── offline.html       # Offline-Fallback-Seite
├── sw.js             # Service Worker
├── manifest.webmanifest  # PWA-Manifest
├── config.json       # App-Konfiguration
├── build-episodes.js # Episode-Generator-Script
└── package.json      # NPM-Konfiguration
```

## 🎵 Neue Episoden hinzufügen

### Schritt 1: MP3-Datei vorbereiten

Benenne deine MP3-Datei nach folgendem Schema:
```
episode-XXX-YYYYMMDD.mp3
```

Beispiele:
- `episode-001-20251201.mp3` → Episode 1, veröffentlicht am 01.12.2025
- `episode-042-20250315.mp3` → Episode 42, veröffentlicht am 15.03.2025

### Schritt 2: MP3-Metadaten setzen (optional, aber empfohlen)

Füge ID3-Tags hinzu für bessere Metadaten:
- **Title**: Titel der Episode
- **Comment**: Beschreibung der Episode

### Schritt 3: Datei platzieren

Lege die MP3-Datei in den Ordner `assets/audio/`

### Schritt 4: episodes.json generieren

```bash
npm run build:episodes
```

Das Script liest automatisch aus:
- ✅ Dauer (aus der MP3-Datei)
- ✅ Titel (aus ID3-Tags oder generiert)
- ✅ Beschreibung (aus ID3-Tags oder generiert)
- ✅ Episode-ID (aus Dateiname)
- ✅ Veröffentlichungsdatum (aus Dateiname)

Mehr Details siehe [README-EPISODES.md](README-EPISODES.md)

## ⚙️ Konfiguration

### Design ändern

Bearbeite `config.json`:
```json
{
  "design": "othimm"
}
```

Verfügbare Designs:
- `thixx_standard`
- `peterpohl`
- `sigx`
- `othimm`

### Service Worker Version

Bei Änderungen an gecachten Dateien muss die Version in `sw.js` erhöht werden:
```javascript
const CACHE_VERSION = '1.15'; // Version erhöhen
```

## 🛠️ Entwicklung

### Voraussetzungen

- Node.js (v16 oder höher)
- NPM oder Yarn

### Build-Scripts

```bash
# Episodenliste neu generieren
npm run build:episodes
```

### Datei-Struktur für Entwickler

- **assets/app.js**: Haupt-JavaScript-Logik (Player, Episode-Verwaltung, etc.)
- **assets/style.css**: Globale Styles
- **assets/theme-bootstrap.js**: Lädt Design-spezifische Styles dynamisch
- **sw.js**: Service Worker für Offline-Funktionalität und Caching
- **manifest.webmanifest**: PWA-Konfiguration

### Sprachen hinzufügen

1. Erstelle neue JSON-Dateien in `lang/` und `core/lang/`
2. Folge der Struktur der existierenden Dateien (de.json, en.json, etc.)
3. Die Sprache wird automatisch basierend auf Browser-Einstellung geladen

## 📝 Technologie-Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3
- **PWA**: Service Worker API, Web App Manifest
- **Audio**: HTML5 Audio API
- **Build Tools**: Node.js für Episode-Generierung
- **Dependencies**:
  - `music-metadata`: MP3-Metadaten auslesen
  - `node-id3`: ID3-Tag-Verarbeitung

## 🌐 Browser-Unterstützung

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Browser (iOS Safari, Chrome Mobile)

## 📄 Lizenz

Dieses Projekt ist privat. Alle Rechte vorbehalten.

## 🤝 Kontakt

Bei Fragen oder Problemen öffne bitte ein Issue im Repository.

## 🔒 Datenschutz

Siehe [Datenschutzerklärung](assets/datenschutz.html) für Details zur Datenverarbeitung.

---

Entwickelt mit ❤️ für Talking Smart Sales
