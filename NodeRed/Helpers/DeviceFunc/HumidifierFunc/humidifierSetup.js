let outputs = [null, null, null]; // Array für drei Ausgänge

let humidifierState = null;

// Schleife, um den Zustand des Befeuchters zu finden
for (let i = 0; i < msg.payload.humidifier.length; i++) {
    if (msg.payload.humidifier[i].entity_id.includes('humidifier')) {
        humidifierState = msg.payload.humidifier[i].value;
        break;
    }
}

// Befeuchter starten
if (msg.payload.humidifierSet.value === "increased" && humidifierState === "off") {
    outputs[0] = { payload: "Starte Befeuchter", topic: "Start" };
}

// Befeuchter stoppen
if (msg.payload.humidifierSet.value === "reduced" && humidifierState === "on") {
    outputs[1] = { payload: "Stoppe Befeuchter", topic: "Stop" };
}

// Nichts tun oder ausschalten bei unverändertem Zustand
if (msg.payload.humidifierSet.value === "unchanged") {
    if (humidifierState === "on") {
        // Wenn der Befeuchter im Zelt an ist und kein Wechsel angefordert wird, sende "off"
        outputs[0] = { payload: "off", topic: "Humidifier" };
    } else {
        // Wenn der Befeuchter bereits aus ist oder nicht geändert werden soll
        outputs[1] = { payload: "Humidifier already stopped, nothing to do! Waiting for changes.", topic: "Humidifier" };
    }
}

// Nichts tun (detaillierte Information)
if (msg.payload.humidifierSet.value === "unchanged" && humidifierState !== "on" && humidifierState !== "off") {
    outputs[2] = { payload: "Befeuchter unverändert, keine Aktion erforderlich", data: msg.payload, topic: "Nothing" };
}

return outputs; // Rückgabe des Ausgangsarrays
