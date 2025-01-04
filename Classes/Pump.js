class Pump extends Device {
    constructor(name) {
        super(name, "pump");
        this.pumpInterval = 3600; // Mindestintervall zwischen Pumpzyklen (in Sekunden)
        this.pumpDuration = 10; // Pumpdauer in Sekunden
        this.isAutoRun = false; // Automatikmodus
        this.OGBAutoMODE = false; // OpenGrowBox Steuerung
        this.lastPumpTime = null; // Zeitpunkt des letzten Pumpvorgangs
        this.soilMoisture = 0; // Bodenfeuchtigkeit
        this.soilEC = 0; // Elektrische Leitfähigkeit
        this.minSoilMoisture = 25; // Mindestbodenfeuchte
        this.maxSoilEC = 2.5; // Maximaler EC-Wert
    }

    // Gerätedaten setzen und Bodenwerte aktualisieren
    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.evaluateStateFromData();
        this.identifyIfOGBControlled(context);

        // Aktualisiere Sensorwerte
        if (data.soilmoisture) this.soilMoisture = parseFloat(data.soilmoisture);
        if (data.soilec) this.soilEC = parseFloat(data.soilec);
    }

    // Prüfe OpenGrowBox Steuerung
    identifyIfOGBControlled(context) {
        this.OGBAutoMODE = !!context.controls.co2Control;
    }

    // Status aus Gerätedaten evaluieren
    evaluateStateFromData() {
        if (this.data) {
            const pumpOnKey = Object.keys(this.data).find(key => key.includes("pump_on"));
            if (pumpOnKey) this.isRunning = this.data[pumpOnKey] === "on";

            const autoRunKey = Object.keys(this.data).find(key => key.includes("pump_autorun"));
            if (autoRunKey) this.isAutoRun = this.data[autoRunKey] === "on";
        }
    }

    // Mindestintervall prüfen
    canPumpNow() {
        const now = new Date();
        const elapsedTime = this.lastPumpTime
            ? (now.getTime() - this.lastPumpTime.getTime()) / 1000
            : this.pumpInterval;

        return elapsedTime >= this.pumpInterval;
    }

    // Prüfe, ob Bewässerung notwendig ist
    needsWatering() {
        return this.soilMoisture < this.minSoilMoisture && this.soilEC < this.maxSoilEC;
    }

    // Geräteaktionen ausführen
    runAction(context) {
        // Prüfe ob AutoModus aktiv ist
        if (this.isAutoRun) {
            return this.runAutoMode();
        }

        switch (this.action) {
            case "on":
                return this.runPump("on");
            case "off":
                return this.runPump("off");
            case "autorun-on":
                return this.setAutoMode(true);
            case "autorun-off":
                return this.setAutoMode(false);
            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { entity_id: this.switches[0], action: "UnknownAction" };
        }
    }

    // Automatische Steuerung der Pumpe
    runAutoMode() {
        if (!this.canPumpNow()) {
            node.warn(`${this.name}: Intervall nicht erreicht.`);
            return { entity_id: this.switches[0], action: "wait_interval" };
        }

        if (!this.needsWatering()) {
            node.warn(`${this.name}: Keine Bewässerung notwendig (Moisture: ${this.soilMoisture}, EC: ${this.soilEC}).`);
            return { entity_id: this.switches[0], action: "no_water_needed" };
        }

        this.lastPumpTime = new Date();
        this.isRunning = true;

        node.warn(`${this.name}: Starte automatische Bewässerung.`);
        return { entity_id: this.switches[0], action: "on", duration: this.pumpDuration };
    }

    // Manuelle Pumpaktion ausführen
    runPump(state) {
        if (state === "on" && !this.isRunning) {
            this.isRunning = true;
            this.lastPumpTime = new Date();
            node.warn(`${this.name}: Pumpe manuell eingeschaltet.`);
            return { entity_id: this.switches[0], action: "on" };
        } else if (state === "off" && this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.name}: Pumpe manuell ausgeschaltet.`);
            return { entity_id: this.switches[0], action: "off" };
        } else {
            return { entity_id: this.switches[0], action: `Already ${state.toUpperCase()}` };
        }
    }

    // AutoModus setzen
    setAutoMode(state) {
        this.isAutoRun = state;
        const action = state ? "on" : "off";
        node.warn(`${this.name}: Automatikmodus ${state ? "aktiviert" : "deaktiviert"}.`);
        return { entity_id: this.switches[1], action: action };
    }
}