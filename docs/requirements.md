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
- Eingabe von Maximal- oder Minimalmengen pro Fleischsorte.  

### Berechnung
- Ermittlung des Mischungsverhältnisses der Fleischsorten, sodass die Gesamtportion den Zielfettgehalt erreicht.  
- Unterstützung für **mehr als zwei Fleischsorten** (z. B. Näherungsverfahren / Optimierung).  
- Berechnung der jeweiligen Fleischmengen pro Sorte.  
- Validierung: Falls keine exakte Mischung möglich ist → Hinweis auf Abweichung vom Ziel.  

### Ausgabe / Darstellung
- Anzeige der berechneten Mengen pro Fleischsorte (in g).  
- Anzeige des **Soll- vs. Ist-Fettgehalts**.  
- Visualisierung der Fleischanteile (z. B. Tortendiagramm).  

---

## Nicht-funktionale Anforderungen
- **Usability**: Intuitive und klare Benutzeroberfläche.  
- **Performance**: Berechnungen erfolgen in Echtzeit, auch bei vielen Fleischsorten.  
- **Mobil freundlich**: Responsive Design für Nutzung auf Smartphone, Tablet und Desktop.  
- **Erweiterbarkeit**: Architektur erlaubt spätere Erweiterung (z. B. Nährstoffe, Supplemente).  
- **Persistenz**: Speicherung von Fleischsorten im LocalStorage, damit Daten nach Browser-Neustart erhalten bleiben.  

---

## 🚧 Erweiterungsideen (Future Features)
- Benutzerkonten mit gespeicherten Tieren und Rationen.  
- Vordefinierte Fleischsorten mit typischen Fettwerten.  
