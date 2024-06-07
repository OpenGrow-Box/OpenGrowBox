// Initialisiert das Array für die Ausgänge mit Nullen
let outputs = [null, null, null, null, null ];

// Überprüft den Zustand des eingehenden Payloads und setzt den entsprechenden Ausgang
if (msg.payload === "VPD Perfection") {
    return [{ payload: msg.payload, topic: "Perfection" }, null, null, null,null];
}
else if (msg.payload === "IN-VPD-Range") {
    return [null, { payload: msg.payload, topic: "AutoAvgVPD" }, null, null, null];
}
else if (msg.payload === "Targeted VPD") {
    return [null, null, { payload: msg.payload, topic: "TargetedVPD" }, null, null];
}
else if (msg.payload === "CropSteering") {
    return [null, null, null, { payload: msg.payload, topic: "ModeDisabeld" }, null ];
}
else if (msg.payload === "Disabled") {
    return [null, null, null, null, { payload: msg.payload, topic: "ModeDisabeld" }];
}

// Wenn keine Bedingungen zutreffen, sendet nichts
return [null, null, null, null,null];
