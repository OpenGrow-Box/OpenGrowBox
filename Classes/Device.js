class Device {
    constructor(deviceName, deviceType = "generic") {
        this.name = deviceName;
        this.deviceType = deviceType;
        this.isRunning = false;
        this.isDimmable = false;
        this.needChange = false;
        this.action = "";
        this.inRoomName = "";
        this.isfromAmbient = false;
        this.isLocked = false;
        this.lockedFor = "";

        this.switches = [];
        this.sensors = [];
        this.data = {};
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        this.updateChangedData(this.data, data);

        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.checkIfDimmable();
    }

    updateChangedData(currentData, newData) {
        if (!newData || typeof newData !== "object") return {};
        if (!currentData || typeof currentData !== "object") currentData = {};

        let changedData = {};

        Object.keys(newData).forEach(function (key) {
            const newValue = newData[key];
            const currentValue = currentData[key];

            if (currentValue !== newValue) {
                changedData[key] = newValue;
                currentData[key] = newValue;
            }
        });
        return changedData;
    }

    setFromtent(roomName) {
        if (roomName !== this.inRoomName) {
            this.inRoomName = roomName;
        }
    }

    identifyIfFromAmbient() {
        this.isfromAmbient = typeof this.inRoomName === "string" &&
            this.inRoomName.toLowerCase().includes("ambient");
    }

    identifySwitchesAndSensors() {
        if (!this.data || typeof this.data !== "object") return;

        const keys = Object.keys(this.data);
        this.switches = keys.filter((key) =>
            key.startsWith("switch.") || key.startsWith("light.") || key.startsWith("fan.") || key.startsWith("climate.")|| key.startsWith("humidifier")
        );
        this.sensors = keys.filter((key) =>
            key.startsWith("sensor.") || key.startsWith("select.") || key.startsWith("number.") || key.startsWith("text.") || key.startsWith("time.")
        );
    }


    updateIsRunningState() {
        this.isRunning = false;

        if (!this.data || typeof this.data !== "object") {
            return;
        }

        const checkKeys = ["fan.", "light.", "climate.", "switch.", "humidifier."];
        for (const prefix of checkKeys) {
            const keys = Object.keys(this.data).filter((key) => key.startsWith(prefix));
            if (keys.some((key) => this.data[key] === "on")) {
                this.isRunning = true;
                return;
            }
        }
    }

    checkIfDimmable() {
        const allowedDeviceTypes = ["ventilation", "exhaust", "light"]; // Erlaubte Gerätetypen
        if (!allowedDeviceTypes.includes(this.deviceType)) {
            //console.log(`Dimmprüfung nicht erlaubt für Gerätetyp: ${this.deviceType}`);
            return;
        }
        if (this.foundDuty === false)return
        if (this.isDimmable) return; // Bereits als dimmbar erkannt
        if (this.name === "ogb") return; // Spezielle Ausnahme

        if (!this.data || typeof this.data !== "object") {
            console.log("Keine gültigen Daten gefunden, um Dimmfähigkeit zu prüfen.");
            return;
        }

        // Schlüsselwörter, die auf Dimmfähigkeit hinweisen
        const dimmableKeys = [
            "duty",
            "dutycycle",
            "duty_cycle",
            "fan.",
            "light.",
            "number.",
            "select."
        ];

        console.log("Prüfe auf Dimmfähigkeit. Verfügbare Daten:", Object.keys(this.data));

        // Prüfe, ob einer der Schlüssel in den Gerätedaten enthalten ist
        this.isDimmable = Object.keys(this.data).some((key) => {
            const match = dimmableKeys.some((dimmableKey) => key.toLowerCase().includes(dimmableKey));
            if (match) {
                console.log(`Dimmbare Eigenschaft gefunden: ${key}`);
            }
            return match;
        });

        if (!this.isDimmable) {
            console.log("Keine dimmbaren Eigenschaften in den Daten gefunden.");
            this.foundDuty = false
        } else {
            console.log("Das Gerät ist dimmbar.");
            this.foundDuty = true
        }
    }



    prepareAction(finalActions) {
        if (finalActions.hasOwnProperty(this.deviceType)) {
            const actionValue = finalActions[this.deviceType];

            if (this.deviceType === "light") {
                this.needChange = actionValue !== "unchanged";
                this.action = actionValue;
            } else if (this.deviceType === "climate") {
                if (finalActions.climate && typeof finalActions.climate === "object") {
                    for (const [mode, action] of Object.entries(finalActions.climate)) {
                        if (action !== "unchanged") {
                            this.needChange = true;
                            this.action = { mode, action };
                            break;
                        }
                    }
                } else {
                    this.action = "unchanged";
                }
            } else {
                this.needChange = actionValue !== "unchanged" && ["maximum", "reduced", "increased", "minimum", "on", "off"].includes(actionValue);
                this.action = actionValue;
            }
        } else {
            this.needChange = false;
            this.action = "unchanged";
        }

        return this;
    }

    evalAction() {
        return this.action !== "unchanged";
    }

    turnOFF() {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            return { entity_id: entity, action: "off" };
        }
    }

    turnON() {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            return { entity_id: entity, action: "on" };
        }
    }
}