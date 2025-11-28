# Episodes Management

## Automatische Generierung von episodes.json

Dieses Projekt verwendet ein Build-Script, das automatisch `assets/episodes.json` aus den MP3-Dateien im `assets/audio/` Ordner generiert.

### Wie es funktioniert

1. **MP3-Dateien benennen**: Verwenden Sie das Format `episode-XXX-YYYYMMDD.mp3`
   - Beispiel: `episode-001-20251201.mp3`
   - `XXX` = Episode-Nummer (z.B. 001, 002, etc.)
   - `YYYYMMDD` = Veröffentlichungsdatum

2. **MP3-Metadaten setzen** (optional, aber empfohlen):
   ```bash
   # Mit ffmpeg oder einem ID3-Tag-Editor:
   # - Title: Der Podcast-Titel
   # - Comment: Die Beschreibung
   ```

3. **episodes.json generieren**:
   ```bash
   npm run build:episodes
   ```

### Was wird automatisch ausgelesen?

- ✅ **Dauer**: Wird automatisch aus der MP3-Datei berechnet
- ✅ **Titel**: Aus ID3-Tags (falls vorhanden) oder generiert als "Episode epXXX"
- ✅ **Beschreibung**: Aus ID3-Tags (Comment-Feld) oder generiert
- ✅ **ID**: Aus dem Dateinamen (episode-001 → ep001)
- ✅ **publishedAt**: Aus dem Dateinamen (20251201 → 2025-12-01)
- ✅ **fileUrl**: Automatisch generiert

### Neue Episode hinzufügen

1. MP3-Datei ins `assets/audio/` Verzeichnis legen
2. Datei nach dem Schema benennen: `episode-XXX-YYYYMMDD.mp3`
3. `npm run build:episodes` ausführen
4. Fertig! Die `episodes.json` wird automatisch aktualisiert

### Vorteile

- 🎯 Keine manuelle Pflege von `episodes.json` mehr
- ⏱️ Dauer wird immer korrekt aus der MP3 ausgelesen
- 🔄 Konsistente Datenstruktur
- 🚀 Einfaches Hinzufügen neuer Episoden
