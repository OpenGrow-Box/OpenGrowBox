class Climate extends Device {
    constructor(name) {
        super(name, "climate");
        this.currentHAVOC = "off"; // Standardzustand
        this.havocs = {
            dry: "dry",
            cool: "cool",
            hot: "hot",
            heat: "heat",
            wind: "wind",
            off: "off",
        };
        this.isRunning = false; // Status der Klimaanlage
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.identifyCurrentHavoc();
    }

    identifyCurrentHavoc() {
        const havocDevice = this.switches[0];
        if (!havocDevice) {
            console.warn(`${this.name}: Keine Switches definiert, um HAVOC zu identifizieren.`);
            return;
        }

        const havocValue = this.data[havocDevice];

        if (havocValue && Object.values(this.havocs).includes(havocValue)) {
            this.currentHAVOC = havocValue;
            console.warn(`${this.name}: HAVOC-Modus gesetzt auf "${this.currentHAVOC}".`);
        } else {
            console.warn(`${this.name}: Ungültiger HAVOC-Wert "${havocValue}", Standardwert "off" wird verwendet.`);
        }
    }

    runAction() {
        if (!this.needChange || !this.action || typeof this.action !== "object") {
            console.warn(`${this.name}: Keine Änderungen erforderlich.`);
            return null;
        }

        const { mode, action } = this.action;
        const lowerMode = mode.toLowerCase(); // Konvertiere in Kleinbuchstaben
        const validMode = this.havocs[lowerMode]; // Vergleiche mit `havocs` Mapping

        console.warn(`Aktion empfangen: Mode = "${mode}", Action = "${action}", ValidMode = "${validMode}", CurrentHAVOC = "${this.currentHAVOC}"`);

        // Prüfen, ob der Modus ungültig ist
        if (!validMode) {
            console.warn(`${this.name}: Ungültiger Modus "${mode}" erhalten. Standardwert "off" wird verwendet.`);
            return { entity_id: this.switches[0], action: "invalid_mode", received_mode: mode };
        }

        // Prüfen, ob der Modus bereits läuft
        if (this.isRunning && this.currentHAVOC.toLowerCase() === validMode) {
            console.warn(`${this.name}: Keine Änderungen notwendig. Der Modus "${validMode}" ist bereits aktiv.`);
            return { entity_id: this.switches[0], action: "AllReady_ON", climate_mode: this.currentHAVOC };
        }

        if (action === "off") {
            return this.turnOFF();
        }

        if (!this.isRunning) {
            return this.turnON(validMode);
        }

        return this.changeMode(validMode);
    }

    turnON(mode) {
        this.isRunning = true;
        if (this.currentHAVOC !== mode) {
            this.currentHAVOC = mode;
            return { entity_id: this.switches[0], action: "climate", climate_mode: mode };
        } else {
            return { entity_id: this.switches[0], action: "AllReady_Running", climate_mode: mode };
        }

    }

    turnOFF() {
        if (this.isRunning) {
            const previousMode = this.currentHAVOC;

            if (this.isRunning === true) {
                this.isRunning = false;
                this.currentHAVOC = "off";
                return { entity_id: this.switches[0], action: "off", previous_mode: previousMode };
            } else {
                return { entity_id: this.switches[0], action: "AllreadyOFF", previous_mode: previousMode };
            }
        }
        return { entity_id: this.switches[0], action: "already_off" };
    }

    changeMode(mode) {

        if (this.currentHAVOC !== mode) {
            this.currentHAVOC = mode;
            return { entity_id: this.switches[0], action: "climate", climate_mode: mode };
        } else {
            return { entity_id: this.switches[0], action: "AllReady_OFF", climate_mode: mode };
        }

    }
}