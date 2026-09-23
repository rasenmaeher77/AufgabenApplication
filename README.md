# AUFGABE

Eine kleine Spaß-App fürs iPhone: Aufgaben sammeln, auf den großen Knopf drücken, eine zufällige Aufgabe bekommen.

Reines HTML, CSS und JavaScript, ohne Frameworks und ohne externe Abhängigkeiten. Die App läuft offline (Service Worker) und speichert die Aufgaben lokal auf dem Gerät (IndexedDB).

## Dateien

| Datei | Wofür? |
|---|---|
| `index.html` | Aufbau der Seite: die drei Buttons, das Ergebnis und die zwei Fenster |
| `style.css` | Optik. **Farben und Größen stehen ganz oben** in `:root` und lassen sich dort an einer Stelle ändern |
| `app.js` | Logik: Datenbank, Buttons, Zufallsauswahl |
| `sw.js` | Service Worker: macht die App offline-fähig |
| `manifest.json` | Name, Icon und Farben, wenn die App auf dem Home-Bildschirm liegt |
| `icons/` | App-Icons (180 px für das iPhone, 192/512 px für andere Geräte) |

## Lokal ausprobieren

Service Worker funktionieren nicht, wenn man `index.html` einfach doppelklickt. Starte stattdessen im Terminal einen kleinen Server im Ordner:

```bash
cd AufgabenApp
python3 -m http.server 8000
```

Dann im Browser `http://localhost:8000` öffnen.

## Aufs iPhone bringen (GitHub Pages)

1. Code zu GitHub pushen (siehe unten).
2. Auf GitHub im Repo: **Settings → Pages → Branch: `main`, Ordner `/ (root)` → Save**.
   Hinweis: Bei einem **privaten** Repo geht GitHub Pages nur mit GitHub Pro (für Studierende kostenlos über das GitHub Student Developer Pack). Alternativ das Repo auf „Public“ stellen.
3. Nach ca. 1 Minute ist die App erreichbar unter
   `https://rasenmaeher77.github.io/AufgabenApp/`
4. Die Adresse auf dem iPhone in **Safari** öffnen → Teilen-Symbol → **„Zum Home-Bildschirm“**.

Danach startet die App wie eine normale App und funktioniert auch ohne Internet.

## Änderungen machen

1. Datei bearbeiten (z. B. eine Farbe in `style.css`).
2. Lokal testen, dann committen und pushen.
3. App auf dem iPhone mit Internet öffnen: Der Service Worker lädt zuerst die neue Version aus dem Netz. Falls du trotzdem noch die alte siehst, die App einmal ganz schließen und neu öffnen.

Wenn du eine **neue Datei** hinzufügst (z. B. ein Bild), trag sie in `sw.js` in die Liste `DATEIEN` ein, damit sie auch offline verfügbar ist.

## Ideen zum Üben

- Farben in `style.css` ändern (`--akzent`, `--hintergrund` …)
- Einen Dark Mode mit `@media (prefers-color-scheme: dark)` bauen
- Eine Bestätigung vor dem Löschen einbauen (`confirm("Wirklich löschen?")`)
- Gezogene Aufgaben als „erledigt“ markieren
- Eine längere „Dreh“-Animation, bevor das Ergebnis erscheint

## Hinweis zu den Daten

Die Aufgaben liegen nur auf dem jeweiligen Gerät. Die App im Browser und die App auf dem Home-Bildschirm haben auf dem iPhone getrennte Speicher.
