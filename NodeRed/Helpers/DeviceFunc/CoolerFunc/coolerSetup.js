let outputs = [null, null]; // Array für zwei Ausgänge

let coolerState = null;

// Schleife, um den Zustand des Cooler zu finden
for (let i = 0; i < msg.payload.cooler.length; i++) {
    if (msg.payload.cooler[i].entity_id.includes('cooler')) {
        coolerState = msg.payload.cooler[i].value;
        break;
    }
}

// Cooler starten
if (msg.payload.coolerSet.value === "increased" && coolerState === "off") {
    outputs[0] = { payload: "Start Cooler", topic: "Start" };
}

// Cooler stoppen
if (msg.payload.coolerSet.value === "reduced" && coolerState === "on") {
    outputs[1] = { payload: "Stop Cooler", topic: "Stop" };
}

// Nichts tun
if (msg.payload.coolerSet.value === "unchanged") {
    outputs[2] = { payload: "Cooler unverändert, keine Aktion erforderlich", topic: "Nothing" };
}

return outputs; // Rückgabe des Ausgangsarrays
