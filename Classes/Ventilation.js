class Ventilation extends Device {
    constructor(name) {
        super(name, "ventilation");
        this.dutyCycle = null; // Startwert
        this.maxDuty = 75;   // Minimalwert
        this.minDuty = 100;  // Maximalwert
        this.isInitialized = false;
        this.isTasmota = false;

    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.checkIfDimmable();
        this.identifyIfTasmota(); // Prüfe, ob es ein Tasmota-Gerät ist

        if (this.isTasmota) {
            // Für Tasmota-Geräte initialisiere Duty Cycle und überspringe findDutyCycle
            if (!this.isInitialized) {
                this.initializeDutyCycle();
                this.isInitialized = true;
            }
            return;
        }

        // Für Nicht-Tasmota-Geräte den Duty Cycle aus den Daten suchen
        if (!this.isInitialized) {
            this.initializeDutyCycle();
            this.isInitialized = true;
        } else {
            this.findDutyCycle();
        }
    }

    initializeDutyCycle() {
        if (!this.isDimmable) return
        let initDuty = 50
        this.dutyCycle = initDuty; // Initialisiere auf 50%
        node.warn(`${this.name}: Initialisiere Duty Cycle auf ${this.dutyCycle}%.`);
    }

    identifyIfTasmota() {
        this.isTasmota = this.switches.some(
            (switchDevice) => typeof switchDevice === "string" && switchDevice.startsWith("light.")
        );
    }

    findDutyCycle() {
        if (!this.data) {
            node.warn(`${this.name}: Keine Gerätedaten gefunden.`);
            return;
        }

        const dutyCycleKey = Object.keys(this.data).find((key) =>
            key.toLowerCase().includes("dutycycle") || key.toLowerCase().includes("duty_cycle")
        );

        if (dutyCycleKey) {
            const dutyCycleValue = parseInt(this.data[dutyCycleKey], 10);
            if (!isNaN(dutyCycleValue)) {
                if (dutyCycleValue === this.dutyCycle) return
                this.dutyCycle = this.clampDutyCycle(dutyCycleValue);
                //node.warn(`${this.name}: Duty Cycle aus Daten gesetzt auf ${this.dutyCycle}%.`);
            }
        } else {
            node.warn(`${this.inRoomName} - ${this.name}: Kein Duty Cycle-Schlüssel gefunden.`);
        }
    }

    setDutyCycle(dutyCycle) {
        const clampedDuty = this.clampDutyCycle(dutyCycle);

        if (clampedDuty !== this.dutyCycle) {
            this.dutyCycle = clampedDuty;
            return clampedDuty;
        }

        return

    }

    clampDutyCycle(dutyCycle) {
        return Math.max(this.minDuty, Math.min(this.maxDuty, dutyCycle));
    }

    changeDuty(switchId, duty) {
        const newDuty = this.clampDutyCycle(duty);

        if (newDuty !== this.dutyCycle) {
            const clampedDuty = this.clampDutyCycle(duty);
            this.dutyCycle = clampedDuty;
        } else {
            return { entity_id: switchId, action: "SameDuty", dutycycle: newDuty };
        }

        node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle ${this.dutyCycle} an Vents ${switchId} gesendet.`);
        return { entity_id: switchId, action: "dutycycle", dutycycle: newDuty };
    }

    runAction() {
        if (!this.needChange) return { Ventilation: `${this.switches[0]}`, Action: "NoChangeNeeded" };

        const results = [];
        const applyActionToSwitches = (actionCallback) => {
            return this.switches.map((switchId) => {
                const result = actionCallback(switchId);
                results.push(result);
                return result;
            });
        };

        switch (this.action) {
            case "maximum":
                node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle auf Maximum (${this.maxDuty}%) gesetzt.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, this.maxDuty));

            case "minimum":
                node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle auf Minimum (${this.minDuty}%) gesetzt.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, this.minDuty));

            case "reduced":
                const reducedDuty = Math.max(this.dutyCycle - 5, this.minDuty);
                node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle reduziert auf ${reducedDuty}%.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, reducedDuty));

            case "increased":
                const increasedDuty = Math.min(this.dutyCycle + 5, this.maxDuty);
                node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle erhöht auf ${increasedDuty}%.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, increasedDuty));

            case "on":
                return applyActionToSwitches((switchId) => this.turnON(switchId));

            case "off":
                return applyActionToSwitches((switchId) => this.turnOFF(switchId));

            case "unchanged":
                node.warn(`${this.inRoomName} - ${this.name}: Keine Änderung erforderlich.`);
                return applyActionToSwitches((switchId) => ({ entity_id: switchId, action: "UNCHANGED" }));

            default:
                node.warn(`${this.inRoomName} - ${this.name}: Unbekannte Aktion.`);
                return { Ventilation: `${this.switches[0]}`, Action: "UnknownAction" };
        }
    }

    turnOFF(switchId) {
        if (this.isRunning) {
            this.isRunning = false;
            return { entity_id: switchId, action: "off" };
        }
        return { entity_id: switchId, action: "Already OFF" };
    }

    turnON(switchId) {
        if (!this.isRunning) {
            this.isRunning = true;
            return { entity_id: switchId, action: "on" };
        }
        return { entity_id: switchId, action: "Already ON" };
    }
}