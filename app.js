/* =========================================================
   AUFGABE – die ganze Logik der App steht in dieser Datei.

   Aufbau:
     1. Datenbank (IndexedDB): Aufgaben speichern, lesen, ändern, löschen
     2. Elemente aus dem HTML holen
     3. Button 1: neue Aufgabe hinzufügen
     4. Button 2: Liste anzeigen, bearbeiten, löschen
     5. Button 3: zufällige Aufgabe auswählen
     6. Service Worker anmelden (damit die App offline läuft)
   ========================================================= */


/* =========================================================
   1. DATENBANK (IndexedDB)
   IndexedDB ist eine kleine Datenbank im Browser. Die Daten
   bleiben auf dem iPhone gespeichert, auch nach einem Neustart.
   Jede Aufgabe sieht so aus: { id: 1, text: "Abwasch machen" }
   ========================================================= */

const DB_NAME = "aufgabe-db";
const STORE_NAME = "aufgaben";

// Öffnet die Datenbank (und legt sie beim ersten Mal an).
function oeffneDatenbank() {
  return new Promise((resolve, reject) => {
    const anfrage = indexedDB.open(DB_NAME, 1);

    // Wird nur beim allerersten Start ausgeführt: "Tabelle" anlegen
    anfrage.onupgradeneeded = () => {
      anfrage.result.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    };

    anfrage.onsuccess = () => resolve(anfrage.result);
    anfrage.onerror = () => reject(anfrage.error);
  });
}

// Hilfsfunktion: führt eine Aktion auf der Datenbank aus und wartet auf das Ergebnis.
// modus: "readonly" (nur lesen) oder "readwrite" (auch schreiben)
async function datenbankAktion(modus, aktion) {
  const db = await oeffneDatenbank();
  return new Promise((resolve, reject) => {
    const store = db.transaction(STORE_NAME, modus).objectStore(STORE_NAME);
    const anfrage = aktion(store);
    anfrage.onsuccess = () => resolve(anfrage.result);
    anfrage.onerror = () => reject(anfrage.error);
  });
}

function alleAufgabenLaden() {
  return datenbankAktion("readonly", (store) => store.getAll());
}

function aufgabeHinzufuegen(text) {
  return datenbankAktion("readwrite", (store) => store.add({ text: text }));
}

function aufgabeAendern(id, text) {
  return datenbankAktion("readwrite", (store) => store.put({ id: id, text: text }));
}

function aufgabeLoeschen(id) {
  return datenbankAktion("readwrite", (store) => store.delete(id));
}


/* =========================================================
   2. ELEMENTE AUS DEM HTML HOLEN
   ========================================================= */

const btnNeu = document.getElementById("btn-neu");
const btnListe = document.getElementById("btn-liste");
const btnZufall = document.getElementById("btn-zufall");
const ergebnis = document.getElementById("ergebnis");

const dialogNeu = document.getElementById("dialog-neu");
const formNeu = document.getElementById("form-neu");
const inputNeu = document.getElementById("input-neu");

const dialogListe = document.getElementById("dialog-liste");
const liste = document.getElementById("liste");
const listeLeer = document.getElementById("liste-leer");

// Alle Buttons mit dem Attribut "data-schliessen" schließen ihr Fenster
document.querySelectorAll("[data-schliessen]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});


/* =========================================================
   3. BUTTON 1: NEUE AUFGABE HINZUFÜGEN
   ========================================================= */

btnNeu.addEventListener("click", () => {
  inputNeu.value = "";
  dialogNeu.showModal();
  inputNeu.focus();
});

formNeu.addEventListener("submit", async (event) => {
  event.preventDefault(); // verhindert, dass die Seite neu lädt
  const text = inputNeu.value.trim();
  if (text === "") return;

  await aufgabeHinzufuegen(text);
  dialogNeu.close();
});


/* =========================================================
   4. BUTTON 2: LISTE ANZEIGEN, BEARBEITEN, LÖSCHEN
   ========================================================= */

btnListe.addEventListener("click", async () => {
  await listeAnzeigen();
  dialogListe.showModal();
});

// Baut die Liste im Fenster komplett neu auf.
async function listeAnzeigen() {
  const aufgaben = await alleAufgabenLaden();

  liste.innerHTML = ""; // alte Einträge entfernen
  listeLeer.hidden = aufgaben.length > 0;

  aufgaben.forEach((aufgabe) => {
    liste.appendChild(erstelleListenEintrag(aufgabe));
  });
}

// Erstellt eine Zeile der Liste: Text + "Bearbeiten" + "Löschen"
function erstelleListenEintrag(aufgabe) {
  const li = document.createElement("li");

  const text = document.createElement("span");
  text.className = "aufgabe-text";
  text.textContent = aufgabe.text;

  const btnBearbeiten = document.createElement("button");
  btnBearbeiten.className = "text-button";
  btnBearbeiten.textContent = "Bearbeiten";
  btnBearbeiten.addEventListener("click", () => bearbeitenStarten(li, aufgabe));

  const btnLoeschen = document.createElement("button");
  btnLoeschen.className = "text-button gefahr";
  btnLoeschen.textContent = "Löschen";
  btnLoeschen.addEventListener("click", async () => {
    await aufgabeLoeschen(aufgabe.id);
    await listeAnzeigen();
  });

  li.append(text, btnBearbeiten, btnLoeschen);
  return li;
}

// Ersetzt die Zeile durch ein Eingabefeld + "Speichern"
function bearbeitenStarten(li, aufgabe) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = aufgabe.text;

  const btnSpeichern = document.createElement("button");
  btnSpeichern.className = "text-button primaer";
  btnSpeichern.textContent = "Speichern";
  btnSpeichern.addEventListener("click", async () => {
    const neuerText = input.value.trim();
    if (neuerText !== "") {
      await aufgabeAendern(aufgabe.id, neuerText);
    }
    await listeAnzeigen();
  });

  li.innerHTML = "";
  li.append(input, btnSpeichern);
  input.focus();
}


/* =========================================================
   5. BUTTON 3: ZUFÄLLIGE AUFGABE AUSWÄHLEN
   ========================================================= */

let letzteAufgabe = null; // damit nicht zweimal hintereinander dieselbe kommt

btnZufall.addEventListener("click", async () => {
  const aufgaben = await alleAufgabenLaden();

  if (aufgaben.length === 0) {
    ergebnis.textContent = "Noch keine Aufgaben – tippe oben auf +";
    return;
  }

  // Wenn es mehr als eine Aufgabe gibt, die zuletzt gezogene auslassen
  let auswahl = aufgaben;
  if (aufgaben.length > 1) {
    auswahl = aufgaben.filter((a) => a.id !== letzteAufgabe);
  }

  const zufallsIndex = Math.floor(Math.random() * auswahl.length);
  const gezogen = auswahl[zufallsIndex];
  letzteAufgabe = gezogen.id;

  ergebnis.textContent = gezogen.text;

  // Wackel-Animation neu starten
  btnZufall.classList.remove("wackeln");
  void btnZufall.offsetWidth; // Trick: zwingt den Browser, die Animation neu zu starten
  btnZufall.classList.add("wackeln");
});


/* =========================================================
   6. SERVICE WORKER ANMELDEN (Offline-Funktion)
   ========================================================= */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
