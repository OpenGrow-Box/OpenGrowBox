class Heater extends Device {
    constructor(name) {
        super(name, "heater");
    }
    runAction() {
        if (!this.needChange) {
            return { entity_id: this.switches[0], action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "off":
                return this.turnOFF();
            case "on":
                return this.turnON();
            case "increased":
                return this.turnON();
            case "reduced":
                return this.turnOFF();
            case "unchanged":
                return { entity_id: this.switches[0], action: "UNCHANGED" };
            default:
                node.warn(`${this.name}: Unbekannte Aktion "${this.action}".`);
                return { entity_id: this.switches[0], action: "Unknown Action" };
        }
    }

    turnON() {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            node.warn(`${this.name}: Luftentfeuchter eingeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "on" };
        }
        return { entity_id: entity, action: "Already ON" };
    }

    turnOFF() {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.name}: Luftentfeuchter ausgeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "off" };
        }
        return { entity_id: entity, action: "Already OFF" };
    }
}