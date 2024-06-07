let outputs = [null, null]; // Array für zwei Ausgänge

let heaterState = null;

// Schleife, um den Zustand des Heater zu finden
for (let i = 0; i < msg.payload.heater.length; i++) {
    if (msg.payload.heater[i].entity_id.includes('heater')) {
        heaterState = msg.payload.heater[i].value;
        break;
    }
}

// Heater starten
if (msg.payload.heaterSet.value === "increased" && heaterState === "off") {
    outputs[0] = { payload: "Start Heater", topic: "Start" };
}

// Heater stoppen
if (msg.payload.heaterSet.value === "reduced" && heaterState === "on") {
    outputs[1] = { payload: "Stop Heater", topic: "Stop" };
}

// Nichts tun
if (msg.payload.heaterSet.value === "unchanged") {
    outputs[2] = { payload: "Heater unverändert, keine Aktion erforderlich", topic: "Nothing" };
}

return outputs; // Rückgabe des Ausgangsarrays
