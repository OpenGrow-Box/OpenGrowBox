class GenericSwitch extends Device {
    constructor(name) {
        super(name, "switch"); // Setze den Gerätetyp auf "switch"
        this.isRunning = false; // Status des Schalters
    }

    init() {
        // Initialisierungen, falls notwendig
    }

    evalAction(context) {
        if (this.action === "unchanged") {
            return false; // Keine Aktion erforderlich
        }
        return true; // Standardmäßig erlauben
    }

    runAction(context) {
        if (!this.evalAction(context)) {
            return { Switch: `${this.name}`, Action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "on":
                if (!this.isRunning) {
                    this.isRunning = true;
                    node.warn(`${this.name}: Switch wird eingeschaltet.`);
                    return { entity_id: this.switches[0], action: "on" };
                } else {
                    node.warn(`${this.name}: Switch ist bereits eingeschaltet.`);
                    return { entity_id: this.switches[0], action: "Already ON" };
                }

            case "off":
                if (this.isRunning) {
                    this.isRunning = false;
                    node.warn(`${this.name}: Switch wird ausgeschaltet.`);
                    return { entity_id: this.switches[0], action: "off" };
                } else {
                    node.warn(`${this.name}: Switch ist bereits ausgeschaltet.`);
                    return { entity_id: this.switches[0], action: "Already OFF" };
                }

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { Switch: `${this.name}`, Action: "UnknownAction" };
        }
    }
}