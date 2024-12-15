// Initialisiere die Outputs
let outputs = [null, null];
let deviceRequests = flow.get("deviceRequests") || [];
let ambientDevices = flow.get("ambientDevices") || []; // Neue Liste, um verfügbare Geräte zu verfolgen
let devActions = [];

// Sicherstellen, dass die OpenGrowBox-Klasse geladen ist
const OpenGrowBox = global.get("OpenGrowBox");
if (!OpenGrowBox) {
    return null;
}

// Instanz für den Raum basierend auf dem Topic abrufen
let roomInstance = global.get(msg.topic);
if (!roomInstance) {
    return null;
}

// Falls roomInstance ein Array ist, greife auf das erste Element zu
if (Array.isArray(roomInstance)) {
    roomInstance = roomInstance[0];
}

// Sicherstellen, dass roomInstance die erwarteten Methoden und Eigenschaften besitzt
if (typeof roomInstance.selectAction !== "function" || !roomInstance.devices) {
    return null;
}

// Funktion, um die Anforderung an den flow zu setzen
function registerDeviceRequest(deviceName, deviceType, roomName) {
    const existingRequest = deviceRequests.find(d => d.deviceName === deviceName);

    if (!existingRequest) {
        deviceRequests.push({
            deviceName,
            deviceType,
            roomName,
            requestedAt: new Date().toISOString()
        });
        flow.set("deviceRequests", deviceRequests);
    }
}

// Funktion zur Filterung der Gerätetypen
function isDeviceAllowed(device) {
    const allowedTypes = ["climate", "humidifier", "dehumidifier", "heater", "switch", "fan"];
    return allowedTypes.includes(device.deviceType);
}

// Sicherstellen, dass der Tent-Modus korrekt ist
function isControlSetValid(roomInstance) {
    return roomInstance.controlSet === "Ambient";
}

// Geräte aus dem ambient-Raum anfordern (andere Räume)
if (isControlSetValid(roomInstance) && msg.topic !== "ambient") {
    const ambientRoom = global.get("ambient");
    if (!ambientRoom) {
        node.error("Ambient room instance not found in global context.");
        return;
    }

    // Geräteanforderungen stellen
    ambientRoom.devices.forEach(device => {
        if (isDeviceAllowed(device) && !device.isLocked) {
            roomInstance.borrowDevice(device, roomInstance.tentName);
        }
    });

    flow.set("deviceRequests", deviceRequests);
}

// Geräte zurückgeben
if (!isControlSetValid(roomInstance) && msg.topic !== "ambient") {
    if (!roomInstance) {
        node.error("Ambient room instance not found in global context.");
        return;
    }

    roomInstance.devices.forEach(device => {
        if (isDeviceAllowed(device) && device.isLocked) {
            const offAction = roomInstance.returnDevice(device);
            if (offAction) {
                devActions.push(offAction); // Direkt zu devActions hinzufügen
            }
        }
    });
}

// ambient-Raum: Geräteverarbeitung und Anfragen beantworten
if (msg.topic === "ambient") {
    // Geräte in der Liste aktualisieren
    roomInstance.devices.forEach(device => {
        let isBorrowed = roomInstance.devices.some(d => d.name === device.name);
        let isInAmbientList = ambientDevices.some(d => d.name === device.name);

        if (!isBorrowed && !device.isLocked && isDeviceAllowed(device) && !isInAmbientList) {
            ambientDevices.push(device);
        }
    });

    flow.set("ambientDevices", ambientDevices);

    // Geräteanforderungen abarbeiten
    deviceRequests = deviceRequests.filter(request => {
        const device = ambientDevices.find(d => d.name === request.deviceName);
        if (device && !device.isLocked) {
            const requestingRoom = global.get(request.roomName);
            if (!requestingRoom) {
                return true; // Behalte die Anfrage, wenn der Raum nicht existiert
            }

            requestingRoom.borrowDevice(device, roomInstance.tentName);

            const borrowedDevices = global.get("borrowedDevices") || [];
            borrowedDevices.push(device);
            global.set("borrowedDevices", borrowedDevices);

            ambientDevices = ambientDevices.filter(d => d.name !== device.name);
            flow.set("ambientDevices", ambientDevices);

            return false; // Entferne die abgearbeitete Anfrage
        } else {
            return true; // Behalte die nicht abgearbeitete Anfrage
        }
    });

    flow.set("deviceRequests", deviceRequests);

    // Geräte zurückgeben
    roomInstance.devices.forEach(device => {
        if (device.lockedFor === roomInstance.tentName) {
            const offAction = roomInstance.returnDevice(device);
            if (offAction) {
                devActions.push(offAction); // Direkt zu devActions hinzufügen
            }
        }
    });
}

if(roomInstance.tentMode === "Disabled")return null

// Aktionen für den Raum Prüfen und Ausführen
let actions;
try {
    if (roomInstance.tentName === "ambient" || msg.topic === "ambient") return;

    actions = roomInstance.selectAction(roomInstance);
    if (!actions) {
        node.warn("No actions returned from selectAction method.");
        return;
    }
} catch (err) {
    node.warn("Error during selectAction.");
    return;
}

node.status({ fill: "blue", shape: "ring", text: `Select Action for ${roomInstance.tentName}` });

// Gerätaktionen vorbereiten
if (actions.deviceActions) {
    devActions = [...actions.deviceActions, ...devActions]; // Combine deviceActions and offActions
}

// Debug-Log für alle Aktionen (inklusive OFF_Action_ROOM)
//node.warn(`Final Combined Actions: ${JSON.stringify(devActions, null, 2)}`);

// Nachrichten für den zweiten Output vorbereiten
let messages = [];

// Verarbeitung aller Aktionen für den zweiten Output
devActions.forEach((deviceAction) => {
    if (deviceAction && typeof deviceAction === "object") {
        messages.push({ payload: deviceAction });
    }
});

// Jede Nachricht einzeln an den zweiten Output senden
messages.forEach(message => {
    node.send([null, message]);
});

// Nachricht für den ersten Output zurückgeben
const msg1 = { payload: { ...actions } };
outputs[0] = msg1;

return outputs;
