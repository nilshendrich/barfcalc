# 📋 Anforderungen – barfcalc

Dieses Dokument beschreibt die funktionalen und nicht-funktionalen Anforderungen an die Anwendung **barfcalc**.  
Ziel ist es, eine Web-Anwendung bereitzustellen, die Tierhalter bei der Berechnung von BARF-Fleischmischungen mit gewünschtem Zielfettgehalt unterstützt.  

---

## 🎯 Ziele der Anwendung
- Unterstützung bei der Zusammenstellung von BARF-Rationen.  
- Sicherstellen, dass die Tagesportion den gewünschten Fettgehalt erreicht.  
- Einfache Bedienbarkeit auch für nicht-technische Nutzer.  

---

## Funktionale Anforderungen

### Eingaben
- Eingabe der **Gesamtmenge Fleisch** (g).  
- Eingabe des **Zielfettgehalts** (%).  
- Verwaltung mehrerer **Fleischsorten** (Name + individueller Fettgehalt in %).  
- Möglichkeit, Fleischsorten **per Checkbox ein- oder auszuschalten**, sodass sie bei der Berechnung berücksichtigt oder ignoriert werden.  
- Beim ersten Öffnen der Seite wird dem Nutzer eine **vordefinierte Liste von Fleischsorten mit Fettgehalten** angeboten.  
  - Diese Liste ist in einer **Konfigurationsdatei** (z. B. `config.json`) hinterlegt.  
  - Nutzer können diese Einträge bearbeiten oder löschen.  
  - Änderungen werden im LocalStorage gespeichert, sodass die Liste individuell angepasst werden kann.  

### Berechnung
- Ermittlung des Mischungsverhältnisses der Fleischsorten, sodass die Gesamtportion den Zielfettgehalt erreicht.  
- Unterstützung für **mehr als zwei Fleischsorten** (z. B. Näherungsverfahren / Optimierung).  
- Berechnung der jeweiligen Fleischmengen pro Sorte.  
- **Validierung**:  
  - Falls keine exakte Mischung möglich ist → Hinweis auf Abweichung vom Ziel.  
  - Zielfettgehalt muss **innerhalb des möglichen Bereichs** der aktivierten Fleischsorten liegen (zwischen minimalem und maximalem Fettgehalt).  
  - Falls außerhalb → Ziel kann nicht exakt erreicht werden, Abweichung wird berechnet und angezeigt.  
- **Mengenrestriktion**: Jede aktivierte Fleischsorte muss mindestens **1 g** enthalten.  

### Ausgabe / Darstellung
- Anzeige der berechneten Mengen pro Fleischsorte (in g).  
- Anzeige des **Soll- vs. Ist-Fettgehalts**.  
- Visualisierung der Fleischanteile (z. B. Tortendiagramm).  
- Hinweis, falls der Zielfettgehalt nicht exakt erreicht werden konnte.  

### Mehrsprachigkeit
- Die Anwendung muss **mehrsprachig** sein.  
- Unterstützte Sprachen: **Deutsch** und **Englisch**.  
- Beim ersten Laden wird die Sprache **automatisch anhand der Browsersprache** ermittelt.  
- Der Nutzer kann die Sprache jederzeit über einen **Sprachauswahl-Button** ändern.  
- Die gewählte Sprache wird im **LocalStorage** gespeichert, sodass sie beim nächsten Laden erhalten bleibt.  

---

## ⚙️ Nicht-funktionale Anforderungen
- **Usability**: Intuitive und klare Benutzeroberfläche.  
- **Performance**: Berechnungen erfolgen in Echtzeit, auch bei vielen Fleischsorten.  
- **Mobilfreundlichkeit**: Responsive Design für Nutzung auf Smartphone, Tablet und Desktop.  
- **Erweiterbarkeit**: Architektur erlaubt spätere Erweiterung (z. B. Nährstoffe, Supplemente, Rezeptdatenbank).  
- **Persistenz**: Speicherung von Fleischsorten im LocalStorage, damit Daten nach Browser-Neustart erhalten bleiben.  
- **Mehrsprachigkeit**: Alle Texte in der Anwendung werden in separaten Sprachdateien (`lang/de.json`, `lang/en.json`) gepflegt. Die Architektur ermöglicht es, später weitere Sprachen hinzuzufügen.  