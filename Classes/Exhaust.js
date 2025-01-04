class Exhaust extends Device {
    constructor(name) {
        super(name, "exhaust");
        this.isInitialized = false;
        this.dutyCycle = null;
        this.minDuty = 10;
        this.maxDuty = 95;
    }

    setData(data, context) {
        this.setFromtent(context.tentName)
        this.identifyIfFromAmbient()
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.checkIfDimmable();
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
        node.warn(`${this.inRoomName} - ${this.name}: Initialisiere Duty Cycle auf ${this.dutyCycle}%.`);
    }

    findDutyCycle() {
        if (!this.data) {
            node.warn(`${this.inRoomName} - ${this.name}: Keine Gerätedaten vorhanden.`);
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

    changeDuty(duty) {
        const newDuty = this.clampDutyCycle(duty);
        if (this.switches?.[0]) {
            const switchId = this.switches[0];
            if (newDuty !== this.dutyCycle) {
                const clampedDuty = this.clampDutyCycle(duty);
                this.dutyCycle = clampedDuty;
            } else {
                return { entity_id: switchId, action: "SameDuty", dutycycle: newDuty };
            }

            node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle ${this.dutyCycle} an Abluft ${switchId} gesendet.`);
            return { entity_id: switchId, action: "dutycycle", dutycycle: newDuty };
        } else {
            return { error: "No switch available" };
        }
    }

    runAction() {
        if (!this.needChange) {
            return { Exhaust: `${this.name}`, Action: "NoChangeNeeded" };
        }

        const switchId = this.switches?.[0];
        if (!switchId) {
            return { error: "No switch available" };
        }

        switch (this.action) {
            case "maximum":
                if (this.isDimmable) {
                    return this.changeDuty(this.maxDuty);
                } else {
                    return this.turnON(switchId);
                }
            case "minimum":
                if (this.isDimmable) {
                    return this.changeDuty(this.minDuty);
                } else {
                    return this.turnON(switchId);
                }
            case "increased":
                if (this.isDimmable) {
                    const increasedDuty = Math.min(this.dutyCycle + 5, this.maxDuty);
                    return this.changeDuty(increasedDuty);
                } else {
                    return this.turnON(switchId);
                }
            case "reduced":
                if (this.isDimmable) {
                    const reducedDuty = Math.max(this.dutyCycle - 5, this.minDuty);
                    return this.changeDuty(reducedDuty);
                } else {
                    return this.turnOFF(switchId);
                }


            case "on":
                return this.turnON(switchId);

            case "off":
                return this.turnOFF(switchId);

            case "unchanged":
                return { entity_id: switchId, action: "UNCHANGED" };

            default:
                node.warn(`${this.inRoomName} - ${this.name}: Unbekannte Aktion.`);
                return { Exhaust: `${this.name}`, Action: "UnknownAction" };
        }
    }

    turnON(switchId) {
        if (!this.isRunning) {
            this.isRunning = true;
            node.warn(`${this.inRoomName} - ${this.name}: Lüfter eingeschaltet in ${this.inRoomName}.`);
            return { entity_id: switchId, action: "on" };
        }
        return { entity_id: switchId, action: "Already ON" };
    }

    turnOFF(switchId) {
        if (this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.inRoomName} - ${this.name}: Lüfter ausgeschaltet in ${this.inRoomName}.`);
            return { entity_id: switchId, action: "off" };
        }
        return { entity_id: switchId, action: "Already OFF" };
    }
}