// Hilfsfunktion zur Überprüfung, ob ein Wert numerisch ist
const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

// Funktion zur Bestimmung des dutyCycle-Werts
const findDutyCycle = (exhaustArray) => {
    if (exhaustArray.length === 0) {
        return null; // Keine Werte zu verarbeiten, wenn das Array leer ist
    }
    for (let i = 0; i < exhaustArray.length; i++) {
        if (isNumeric(exhaustArray[i].value)) {
            return parseInt(exhaustArray[i].value, 10);
        }
    }
    return null; // Falls kein numerischer Wert gefunden wurde
};

let outputs = [null, null, null, null]; // Array für vier Ausgänge

// Zustand der Abluft und Geschwindigkeit aus der Payload extrahieren
const exhaustSpeed = msg.payload.exhaustSet.value || 0; // Anpassung hier: falls kein Wert vorhanden ist, setze auf 0
let exhaustState = 'off'; // Standardwert setzen, falls kein Zustand gefunden wird
if (msg.payload.Exhaust && msg.payload.Exhaust.length > 0) {
    const exhaustSwitch = msg.payload.Exhaust.find(e => e.entity_id && e.entity_id.toLowerCase().includes("switch"));
    if (exhaustSwitch && exhaustSwitch.value) {
        exhaustState = exhaustSwitch.value;
    }
}

const dutyCycle = findDutyCycle(msg.payload.Exhaust) || 0; // Anpassung hier: falls kein Wert vorhanden ist, setze auf 50

const percentDifference = parseFloat(msg.payload.exhaustSet.percentDifference) || 0; // Anpassung hier: falls kein Wert vorhanden ist, setze auf 0
let newDutyCycle = dutyCycle;

// Berechnung des neuen Duty Cycle basierend auf der prozentualen Abweichung
if (percentDifference !== 0) {
    if (percentDifference < 0) {
        // Wenn der Wert negativ ist, erhöhen wir den Duty Cycle
        newDutyCycle = dutyCycle + Math.abs(percentDifference);
    } else {
        // Wenn der Wert positiv ist, verringern wir den Duty Cycle
        newDutyCycle = dutyCycle - percentDifference;
    }

    // Stellen Sie sicher, dass der neue Duty Cycle innerhalb der Grenzen liegt
    newDutyCycle = Math.min(95, Math.max(10, Math.round(newDutyCycle)));
}

// Abluft starten auf dem ersten Ausgang, wenn sie aus ist und erhöht werden muss
if (exhaustSpeed === "increased" && exhaustState === "off") {
    outputs[0] = { payload: "Starte Abluft", topic: "Start" };
    return outputs;
}

// Abluft-Geschwindigkeit erhöhen, wenn sie bereits eingeschaltet ist
if (exhaustSpeed === "increased" && exhaustState === "on") {
    outputs[2] = { payload: newDutyCycle.toString(), topic: "Increase" };
    return outputs;
}

// Abluft stoppen auf dem zweiten Ausgang, wenn die Geschwindigkeit reduziert wird und der Duty Cycle sehr niedrig ist
if (exhaustSpeed === "reduced" && exhaustState === "on" && newDutyCycle <= 10) {
    outputs[1] = { payload: "Stoppe Abluft", topic: "Stop" };
    return outputs;
} else if (exhaustSpeed === "reduced" && exhaustState === "on") {
    outputs[2] = { payload: newDutyCycle.toString(), topic: "Decrease" };
    return outputs;
}

// Warnung ausgeben, wenn versucht wird, die Abluftgeschwindigkeit zu reduzieren, obwohl sie bereits aus ist
if (exhaustSpeed === "reduced" && exhaustState === "off") {
    outputs[1] = { payload: "Abluft bereits gestoppt, kann nicht weiter reduziert werden", topic: "AlreadyStopped" };
    return outputs;
}

// Nichts tun, wenn keine Änderung erforderlich ist
if (exhaustSpeed === "unchanged") {
    outputs[3] = { payload: "Abluft unverändert, keine Aktion erforderlich", topic: "Nothing" };
    return outputs;
}

return outputs; // Rückgabe des Ausgangsarrays
