class Humidifier extends Device {
    constructor(name) {
        super(name, "humidifier");
        this.isRunning = false; // Status des Befeuchters
        this.currentHumidity = 0; // Aktueller Feuchtigkeitswert
        this.targetHumidity = 0; // Ziel-Feuchtigkeitswert
        this.minHumidity = 30; // Standard-Mindestfeuchtigkeit
        this.maxHumidity = 70; // Standard-Maximalfeuchtigkeit
        this.stepSize = 5; // Schrittweite für Änderungen
        this.realHumidifier = false; // Erkennung eines echten Luftbefeuchters
        this.hasModes = false; // Erkennung von Modis
        this.isSimpleSwitch = true; // Gerät ist nur ein einfacher Schalter
        this.modes = {
            interval: true,
            small: false,
            large: false,
        };
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.identifyHumidifierType();
        this.identifyIfHasModes();
    }

    identifyMode() {
        if (!this.sensors || !Array.isArray(this.sensors)) {
            console.log(`${this.name}: Keine Sensoren definiert.`);
            return;
        }

        // Suche nach einem passenden Sensor (select.* und mode im Namen)
        const modeSensor = this.sensors.find(sensor => sensor.startsWith("select.") && sensor.includes("mode"));

        if (!modeSensor) {
            console.log(`${this.name}: Kein passender Modus-Sensor gefunden.`);
            return;
        }

        // Moduswert aus den Daten extrahieren
        const modeValue = this.data[modeSensor];

        if (!modeValue || modeValue === "unavailable") {
            console.log(`${this.name}: Kein gültiger Moduswert verfügbar für Sensor "${modeSensor}".`);
            return;
        }

        // Alle Modi zurücksetzen
        this.modes = {
            interval: false,
            small: false,
            large: false,
        };

        // Modus basierend auf dem Wert setzen
        switch (modeValue) {
            case "interval":
                this.modes.interval = true;
                break;
            case "small":
                this.modes.small = true;
                break;
            case "large":
                this.modes.large = true;
                break;
            default:
                console.log(`${this.name}: Unbekannter Moduswert "${modeValue}" für Sensor "${modeSensor}".`);
                break;
        }

        //console.log(`${this.name}: Modus erkannt: ${modeValue}`);
    }

    identifyHumidifierType() {
        if (this.data) {
            if (Object.keys(this.data).some(key => key.startsWith("humidifier."))) {
                this.realHumidifier = true;
                this.isSimpleSwitch = false;
            } else if (Object.keys(this.data).some(key => key.startsWith("switch."))) {
                this.isSimpleSwitch = true;
                this.realHumidifier = false;
            } else {
                this.realHumidifier = false;
                this.isSimpleSwitch = true;
            }
        } else {
            console.log(`${this.name}: Keine Daten vorhanden, Standard: Einfacher Schalter.`);
            this.realHumidifier = false;
            this.isSimpleSwitch = true;
        }
    }

    identifyIfHasModes() {
        if (this.data && this.data["select.humidifier_mode"]) {
            this.realHumidifier = true;
            this.hasModes = true;
            this.isSimpleSwitch = false;
            this.identifyMode()
        } else {
            this.hasModes = false;
        }
    }

    setHumidityLevel(humlevel) {
        if (!this.realHumidifier) {
            return { entity_id: this.switches[0], action: "Unsupported" };
        }
        const entity = this.sensors[0];
        this.targetHumidity = humlevel;
        console.log(`${this.name}: Luftfeuchtigkeit auf ${humlevel}% gesetzt in ${this.inRoomName}`);
        return { entity_id: entity, action: "setHumidity", value: humlevel };
    }

    runAction() {
        if (!this.needChange) {
            return { entity_id: this.switches[0], action: "noChangesNeeded" };
        }

        // Wenn es ein einfacher Schalter ist
        if (this.isSimpleSwitch) {
            return this.action === "increased" || this.action === "on"
                ? this.turnON()
                : this.turnOFF();
        }

        // Für komplexe Geräte mit Modi
        if (this.hasModes && this.realHumidifier) {
            const actions = [];

            // Gerät einschalten, falls es aus ist
            if (!this.isRunning) {
                const turnOnAction = this.turnON();
                actions.push(turnOnAction);
            }

            // Modusänderung basierend auf der Aktion
            if (this.action === "increased") {
                const modeActions = this.changeMode("increase");
                actions.push(...(Array.isArray(modeActions) ? modeActions : [modeActions]));
            } else if (this.action === "reduced") {
                const modeActions = this.changeMode("decrease");
                actions.push(...(Array.isArray(modeActions) ? modeActions : [modeActions]));
            } else if (this.action === "off") {
                const turnOffAction = this.turnOFF();
                actions.push(turnOffAction);
            }

            return actions.length > 0 ? actions : { entity_id: this.switches[0], action: "No Action Found" };
        }

        console.log(`${this.name}: Keine passenden Aktionen gefunden.`);
        return { entity_id: this.switches[0], action: "No Action Found" };
    }


    turnON() {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            console.log(`${this.name}: Luftbefeuchter eingeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "on" };
        }
        return { entity_id: entity, action: "Already ON" };
    }

    turnOFF() {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            this.closeModes()
            console.log(`${this.name}: Luftbefeuchter ausgeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "off" };
        }
        return { entity_id: entity, action: "Already OFF" };
    }

    closeModes(){
        this.modes.small = true
        this.modes.interval = false
        this.modes.large = false
    }

    changeMode(direction) {
        if (!this.hasModes) {
            console.log(`${this.name}: Moduswechsel nicht unterstützt.`);
            return { entity_id: this.switches[0], action: "Unsupported" };
        }
    
        const actions = [];
    
        // Modusänderung basierend auf der Richtung
        if (direction === "increase") {
            // Wenn das Gerät aus ist und der Modus "small" ist, setze "interval"
            if (!this.isRunning && this.modes.small) {
                this.modes.interval = true;
                this.modes.small = false;
                this.modes.large = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "interval" });
            }
            // Wenn das Gerät läuft und im Modus "small" ist, wechsle direkt zu "large"
            else if (this.isRunning && this.modes.small) {
                this.modes.interval = false;
                this.modes.small = false;
                this.modes.large = true;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "large" });
            }
            // Wenn der Modus "interval" ist, setze ihn auf "small"
            else if (this.modes.interval) {
                this.modes.interval = false;
                this.modes.small = true;
                this.modes.large = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "small" });
            }
            // Wenn der Modus "small" ist, setze ihn auf "large"
            else if (this.modes.small) {
                this.modes.small = false;
                this.modes.large = true;
                this.modes.interval = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "large" });
            }
        } else if (direction === "decrease") {
            // Wenn der Modus "large" ist, setze ihn auf "small"
            if (this.modes.large) {
                this.modes.large = false;
                this.modes.small = true;
                this.modes.interval = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "small" });
            }
            // Wenn der Modus "small" ist, setze ihn auf "interval"
            else if (this.modes.small) {
                this.modes.small = false;
                this.modes.interval = true;
                this.modes.large = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "interval" });
            }
            // Wenn der Modus "interval" ist, schalte das Gerät aus
            else if (this.modes.interval) {
                this.modes.small = false;
                this.modes.interval = true;
                this.modes.large = false;
                actions.unshift({ entity_id: this.switches[0], action: "off" });
                console.log(`${this.name}: Luftbefeuchter wird ausgeschaltet.`);
            }
        }
    
        // Gerät einschalten, wenn es aus ist
        if (!this.isRunning) {
            this.isRunning = true;
            actions.unshift({ entity_id: this.switches[0], action: "on" });
            console.log(`${this.name}: Luftbefeuchter wird eingeschaltet.`);
        }
    
        // Rückgabe der Aktionen
        return actions.length > 0 ? actions : { entity_id: this.switches[0], action: "No Change" };
    }
    

    changeHumidity(delta) {
        if (!this.realHumidifier) {
            console.log(`${this.name}: Luftfeuchtigkeit kann nicht geändert werden, da es sich um einen einfachen Schalter handelt.`);
            return { entity_id: this.switches[0], action: "Unsupported" };
        }

        const entity = this.switches[0];
        const newHumidity = Math.max(
            this.minHumidity,
            Math.min(this.maxHumidity, this.currentHumidity + delta)
        );
        if (newHumidity === this.currentHumidity) {
            console.log(`${this.name}: Luftfeuchtigkeit ist bereits auf Grenzwert (${this.currentHumidity}%) in ${this.inRoomName}`);
            return { entity_id: entity, action: "No Change" };
        }
        this.currentHumidity = newHumidity;
        console.log(`${this.name}: Luftfeuchtigkeit geändert auf ${newHumidity}% in ${this.inRoomName}`);
        return { entity_id: entity, action: "number", value: newHumidity };
    }
}