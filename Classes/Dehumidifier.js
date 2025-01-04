class Dehumidifier extends Device {
    constructor(name) {
        super(name, "dehumidifier");
        this.realHumidifier = false; // Erkennung eines echten Luftentfeuchters
        this.isSimpleSwitch = false; // Standardmäßig ein einfacher Schalter
        this.hasModes = false; // Erkennung von Modis
        this.currentMode = null; // Aktueller Modus des Luftentfeuchters
    }
   
    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.identifyDehumidifierType();
    }


    
    identifyDehumidifierType() {
        if (this.data) {
            if (Object.keys(this.data).some(key => key.startsWith("humidifier."))) {
                this.realHumidifier = true;
                this.isSimpleSwitch = false;
                this.hasModes = true;
                this.currentMode = "dry"; // Standardmodus
            } else if (Object.keys(this.data).some(key => key.startsWith("switch."))) {
                this.realHumidifier = false;
                this.isSimpleSwitch = true;
                this.hasModes = false;
                this.currentMode = null;
            } else {
                console.log(`${this.name}: Keine gültigen Daten gefunden, Standard auf einfacher Schalter.`);
                this.realHumidifier = false;
                this.isSimpleSwitch = true;
                this.hasModes = false;
                this.currentMode = null;
            }
        }
    }

    runAction() {
        // Wenn keine Änderung nötig ist, gib aktuellen Zustand zurück
        if (!this.needChange) {
            if (this.action === "reduced" && !this.isRunning) {
                return { entity_id: this.switches[0], action: "Already OFF" };
            } else if (this.action === "increased" && this.isRunning) {
                return { entity_id: this.switches[0], action: "Already ON" };
            }
            return { entity_id: this.switches[0], action: "noChangesNeeded" };
        }
    
        // Aktionen für einfache Schalter
        if (this.isSimpleSwitch) {
            if (this.action === "reduced") {
                return this.turnOFF();
            } else if (this.action === "increased") {
                return this.turnON();
            }
        }
    
        // Aktionen für echte Luftentfeuchter
        if (this.realHumidifier) {
            if (this.action === "reduced") {
                return this.turnOFF();
            } else if (this.action === "increased") {
                return this.activateDryMode();
            }
        }
    
        // Wenn keine passende Aktion gefunden wurde
        console.log(`${this.name}: Keine passenden Aktionen gefunden.`);
        return { entity_id: this.switches[0], action: "No Action Found" };
    }
    
    
    activateDryMode() {
        const entity = this.sensors.find(sensor => sensor.startsWith("humidifier."));
        if (!this.isRunning) {
            this.isRunning = true;
            console.log(`${this.name}: Luftentfeuchter im Modus "dry" eingeschaltet in ${this.inRoomName}`);
            return [
                { entity_id: this.switches[0], action: "on" }, // Gerät einschalten
                { entity_id: entity, action: "select", option: "dry" }, // Modus auf "dry" setzen
            ];
        }
        return { entity_id: this.switches[0], action: "Already ON" };
    }
    

    turnON() {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            console.log(`${this.name}: Luftentfeuchter eingeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "on" };
        }else{
            return { entity_id: entity, action: "Already ON" };
        }

    }

    turnOFF() {
        const entity = this.switches[0];
        if(this.isRunning) {
            this.isRunning = false;
            console.log(`${this.name}: Luftentfeuchter ausgeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "off" };
        }else{
            return { entity_id: entity, action: "Already OFF" };
        }

    }
}