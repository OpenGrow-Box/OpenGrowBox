// Hole oder initialisiere die globale Variable für Räume
if (msg.topic === "all_rooms") return null;

// Prüfen, ob die Klasse OpenGrowBox im globalen Kontext verfügbar ist
const OpenGrowBox = global.get("OpenGrowBox");
if (!OpenGrowBox) {
    node.error("OpenGrowBox class not found in global context");
    return null;
}

const room = msg.topic;

// Hole die aktuelle Instanz des Raums
let roomInstance = global.get(room);

// Instanz für den Raum erstellen, falls sie nicht existiert
if (!roomInstance) {
    roomInstance = new OpenGrowBox(room);
    global.set(room, roomInstance);
    node.warn(`Created new room instance for: ${room}`);
}

// Prüfen, ob Payload-Daten vorhanden sind
if (msg.payload && typeof msg.payload === "object") {
    const data = msg.payload;

    // Iteriere über die Räume (Gruppen) und Geräte
    for (const roomKey in data) {
        const group = data[roomKey];

        // Iteration über die Geräte in der Gruppe
        for (const deviceName in group) {
            const deviceData = group[deviceName];
            const currentRoomDevs = roomInstance.devices || []; // Geräte aus der Instanz abrufen oder leeres Array initialisieren

            // Überprüfen, ob das Gerät bereits existiert
            const existingDevice = currentRoomDevs.find((device) => device.name === deviceName);

            if (existingDevice) {
                // Gerät existiert: Aktualisieren
                existingDevice.setData(deviceData, roomInstance);
            } else {
                // Gerät existiert nicht: Neues Gerät hinzufügen
                roomInstance.addDevice(deviceName, deviceData, roomInstance);
                node.warn(`Added new device: ${deviceName}`);
            }

            // Iteration über die inneren Daten des Geräts für weitere Verarbeitung
            for (const entity in deviceData) {
                try {
                    let currentValue = deviceData[entity];
                    updateTentEnvs(entity, currentValue, roomInstance);
                } catch (err) {
                    node.error(`Error processing entity: ${entity} - ${err.message}`);
                }
            }
        }
    }

    // Nach Verarbeitung die aktualisierte Instanz in den globalen Kontext zurückschreiben
    global.set(room, roomInstance);
}

// Hilfsfunktion zur Normalisierung von Werten
function normalizeValue(val) {
    if (typeof val === "string") return val.trim(); // Trimme Strings
    if (!isNaN(val)) return parseFloat(val);        // Konvertiere Zahlen
    return val;                                     // Sonstige Werte unverändert
}

// Update-Funktion für TentEnvs
function updateTentEnvs(entity, value, roomInstance) {
    if (!roomInstance) return;

    value = normalizeValue(value); // Eingehenden Wert normalisieren

    if (entity.toLowerCase().includes("ogb_dryingmodes")) {
        if(roomInstance.tentMode !== "Drying")return
        let currentObjState = roomInstance.getDryingMode ? normalizeValue(roomInstance.getDryingMode()) : "";
        if (currentObjState !== value) {
            node.warn(`DryingMode geändert: ${currentObjState} -> ${value}`);
            roomInstance.setDryingMode(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_plantstage")) {
        let currentObjState = roomInstance.getPlantStageValue ? normalizeValue(roomInstance.getPlantStageValue()) : "";
        if (currentObjState !== value) {
            roomInstance.setPlantStageValue(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_tentmode")) {
        let currentObjState = roomInstance.getTentMode ? normalizeValue(roomInstance.getTentMode()) : "";
        if (currentObjState !== value) {
            roomInstance.setTentMode(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_holdvpdnight")) {
        let currentObjState = roomInstance.getVPDNightHold ? normalizeValue(roomInstance.getVPDNightHold()) : "";
        if (currentObjState !== value) {
            roomInstance.setVPDNightHold(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_controlset")) {
        let currentObjState = roomInstance.getControlSet ? normalizeValue(roomInstance.getControlSet()) : "";
        if (currentObjState !== value) {
            roomInstance.setControlSet(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_lightontime")) {
        let currentObjState = roomInstance.isPlantDay ? roomInstance.isPlantDay.lightOnTime : "";
        if (currentObjState !== value) {
            let stopTime = roomInstance.isPlantDay ? roomInstance.isPlantDay.lightOffTime : "";
            roomInstance.setLightTimes(value, stopTime);
        }
        roomInstance.updateLightState();
    }
    if (entity.toLowerCase().includes("ogb_lightofftime")) {
        let currentObjState = roomInstance.isPlantDay ? roomInstance.isPlantDay.lightOffTime : "";
        if (currentObjState !== value) {
            let startTime = roomInstance.isPlantDay ? roomInstance.isPlantDay.lightOnTime : "";
            roomInstance.setLightTimes(startTime, value);
        }
        roomInstance.updateLightState();
    }
    if (entity.toLowerCase().includes("ogb_vpdtarget")) {
        let currentObjState = roomInstance.getTargetedVPD ? normalizeValue(roomInstance.getTargetedVPD()) : "";
        if (currentObjState !== value) {
            roomInstance.setTargetedVPD(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_leaftemp")) {
        let currentObjState = roomInstance.getLeafOffset ? normalizeValue(roomInstance.getLeafOffset()) : "";
        if (currentObjState !== value) {
            roomInstance.setLeafOffset(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_co2_control")) {
        let currentObjState = roomInstance.getCO2Control ? normalizeValue(roomInstance.getCO2Control()) : "";
        if (currentObjState !== value) {
            roomInstance.setCO2Control(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_lightcontrol")) {
        let currentObjState = roomInstance.getLightControlByOGB ? normalizeValue(roomInstance.getLightControlByOGB()) : "";
        if (currentObjState !== value) {
            roomInstance.setLightControlByOGB(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_ownweights")) {
        let currentObjState = roomInstance.getifOwnWeightsActive ? normalizeValue(roomInstance.getifOwnWeightsActive()) : "";
        if (currentObjState !== value) {
            roomInstance.activateOwnWeights(value);
        }
    }
    if (entity.toLowerCase().includes("ogb_temperatureweight") || entity.toLowerCase().includes("ogb_humidityweight")) {
        let currentObjState = roomInstance.getOwnWeights ? normalizeValue(roomInstance.getOwnWeights()) : "";

        if (currentObjState !== value) {
            roomInstance.setOwnWeights(entity, value);
        }
    }
}

// Rückgabe der aktualisierten Rauminstanz
global.set(`${room}`, roomInstance);
return msg;
