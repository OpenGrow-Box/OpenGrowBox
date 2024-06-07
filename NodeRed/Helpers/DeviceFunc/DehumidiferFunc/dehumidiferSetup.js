let outputs = [null, null]; // Array für zwei Ausgänge

let dehumidifierState = null;

// Schleife, um den Zustand des Dehumidifier zu finden
for (let i = 0; i < msg.payload.dehumidifier.length; i++) {
    if (msg.payload.dehumidifier[i].entity_id.includes('dehumidifier')) {
        dehumidifierState = msg.payload.dehumidifier[i].value;
        break;
    }
}

// Dehumidifier starten
if (msg.payload.dehumidifierSet.value === "increased" && dehumidifierState === "off") {
    outputs[0] = { payload: "Starte Dehumidifier", topic: "Start" };
}

// Dehumidifier stoppen
if (msg.payload.dehumidifierSet.value === "reduced" && dehumidifierState === "on") {
    outputs[1] = { payload: "Stoppe Dehumidifier", topic: "Stop" };
}

// Nichts tun
if (msg.payload.dehumidifierSet.value === "unchanged") {
    outputs[2] = { payload: "Dehumidifier unverändert, keine Aktion erforderlich", topic: "Nothing" };
}

return outputs; // Rückgabe des Ausgangsarrays
