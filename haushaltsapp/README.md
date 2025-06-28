# Haushaltsaufgaben App

Dieses Addon für Home Assistant ermöglicht es, Haushaltsaufgaben zu verwalten und Punkte für erledigte Aufgaben zu vergeben. Die Punkte können zurückgesetzt werden, und der Spieler mit den meisten Punkten wird zum Sieger ernannt.

## Installation

1. Kopiere den Addon-Ordner in das `addons`-Verzeichnis von Home Assistant.
2. Starte Home Assistant neu.
3. Installiere das Addon über den Addon-Store.

## Nutzung

- **Aufgaben verwalten**: Aufgaben können hinzugefügt, gelöscht und angezeigt werden.
- **Punkte verwalten**: Punkte können für Spieler hinzugefügt und zurückgesetzt werden.
- **Sieger ermitteln**: Nach dem Zurücksetzen der Punkte wird der Spieler mit den meisten Punkten als Sieger angezeigt.

## API-Endpunkte

- `GET /tasks`: Liste aller Aufgaben abrufen.
- `POST /tasks`: Neue Aufgabe hinzufügen.
- `DELETE /tasks/<task_id>`: Aufgabe löschen.
- `GET /points`: Punktestand abrufen.
- `POST /points`: Punkte für einen Spieler hinzufügen.
- `POST /reset`: Punkte zurücksetzen und Sieger ermitteln.
