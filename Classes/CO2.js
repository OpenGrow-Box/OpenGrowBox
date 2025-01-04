class CO2 extends Device {
    constructor(name) {
        super(name, "co2"); // Setze den Gerätetyp auf "co2"
        this.targetCO2 = 0; // Zielwert für CO2 (ppm)
        this.currentCO2 = 0; // Aktueller CO2-Wert (ppm)
        this.autoRegulate = false; // Automatische Steuerung
    }

    init() {
        // Initialisierungen, falls notwendig
    }

    setTargetCO2(target) {
        if (target !== this.targetCO2) {
            this.targetCO2 = target;
        }
    }

    enableAutoRegulation() {
        if (!this.enableAutoRegulation) {
            this.autoRegulate = true;
        }
    }

    disableAutoRegulation() {
        if (this.enableAutoRegulation) {
            this.autoRegulate = false;
        }
    }

    updateCurrentCO2(value) {
        if (value !== this.currentCO2) {
            this.currentCO2 = value;
        }
    }

    evalAction(context) {
        if (this.action === "unchanged") return false;

        if (this.autoRegulate && this.currentCO2 < this.targetCO2) {
            this.action = "increased";
            return true;
        } else if (this.autoRegulate && this.currentCO2 > this.targetCO2) {
            this.action = "reduced";
            return true;
        }

        return this.action !== "unchanged";
    }

    runAction(context) {
        if (!this.evalAction(context)) {
            return { CO2: `${this.name}`, Action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "increased":
                node.warn(`${this.name}: CO2-Zufuhr wird erhöht.`);
                return { entity_id: this.switches[0], action: "on" };

            case "reduced":
                node.warn(`${this.name}: CO2-Zufuhr wird gestoppt.`);
                return { entity_id: this.switches[0], action: "off" };

            case "on":
                node.warn(`${this.name}: CO2-Zufuhr wird aktiviert.`);
                return { entity_id: this.switches[0], action: "on" };

            case "off":
                node.warn(`${this.name}: CO2-Zufuhr wird deaktiviert.`);
                return { entity_id: this.switches[0], action: "off" };

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { CO2: `${this.name}`, Action: "UnknownAction" };
        }
    }
}