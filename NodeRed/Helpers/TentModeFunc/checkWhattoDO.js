let outputs = [null, null, null, null, null, null, null, null, null];

var percentDifference = msg.payload.percentDifference

// Abluft
if (msg.payload.exhaustSpeed === "unchanged") {
    outputs[0] = { payload: { value: msg.payload.exhaustSpeed, percentDifference: percentDifference }, topic: "exhaustSet" };
} else if (msg.payload.exhaustSpeed === "increased") {
    outputs[0] = { payload: { value: msg.payload.exhaustSpeed, percentDifference: percentDifference }, topic: "exhaustSet" };
} else if (msg.payload.exhaustSpeed === "reduced") {
    outputs[0] = { payload: { value: msg.payload.exhaustSpeed, percentDifference: percentDifference }, topic: "exhaustSet" };
}

// Humidifier
if (msg.payload.humidifier === "unchanged") {
    outputs[1] = { payload: { value: msg.payload.humidifier, percentDifference: percentDifference }, topic: "humidifierSet" };
} else if (msg.payload.humidifier === "increased") {
    outputs[1] = { payload: { value: msg.payload.humidifier, percentDifference: percentDifference }, topic: "humidifierSet" };
} else if (msg.payload.humidifier === "reduced") {
    outputs[1] = { payload: { value: msg.payload.humidifier, percentDifference: percentDifference }, topic: "humidifierSet" };
}

// Dehumidifier
if (msg.payload.dehumidifier === "unchanged") {
    outputs[2] = { payload: { value: msg.payload.dehumidifier, percentDifference: percentDifference }, topic: "dehumidifierSet" };
} else if (msg.payload.dehumidifier === "increased") {
    outputs[2] = { payload: { value: msg.payload.dehumidifier, percentDifference: percentDifference }, topic: "dehumidifierSet" };
} else if (msg.payload.dehumidifier === "reduced") {
    outputs[2] = { payload: { value: msg.payload.dehumidifier, percentDifference: percentDifference }, topic: "dehumidifierSet" };
}

// HeaterFan
if (msg.payload.heaterFan === "unchanged") {
    outputs[3] = { payload: { value: msg.payload.heaterFan, percentDifference: percentDifference }, topic: "heaterSet" };
} else if (msg.payload.heaterFan === "increased") {
    outputs[3] = { payload: { value: msg.payload.heaterFan, percentDifference: percentDifference }, topic: "heaterSet" };
} else if (msg.payload.heaterFan === "reduced") {
    outputs[3] = { payload: { value: msg.payload.heaterFan, percentDifference: percentDifference }, topic: "heaterSet" };
}

// CoolerFan
if (msg.payload.coolerFan === "unchanged") {
    outputs[4] = { payload: { value: msg.payload.coolerFan, percentDifference: percentDifference }, topic: "coolerSet" };
} else if (msg.payload.coolerFan === "increased") {
    outputs[4] = { payload: { value: msg.payload.coolerFan, percentDifference: percentDifference }, topic: "coolerSet" };
} else if (msg.payload.coolerFan === "reduced") {
    outputs[4] = { payload: { value: msg.payload.coolerFan, percentDifference: percentDifference }, topic: "coolerSet" };
}

// LightIntensity
if (msg.payload.lightIntensity === "unchanged") {
    outputs[5] = { payload: { value: msg.payload.lightIntensity, percentDifference: percentDifference }, topic: "lightIntensitySet" };
} else if (msg.payload.lightIntensity === "increased") {
    outputs[5] = { payload: { value: msg.payload.lightIntensity, percentDifference: percentDifference }, topic: "lightIntensitySet" };
} else if (msg.payload.lightIntensity === "reduced") {
    outputs[5] = { payload: { value: msg.payload.lightIntensity, percentDifference: percentDifference }, topic: "lightIntensitySet" };
}

// VentsALL
if (msg.payload.ventsTopSpeed === "unchanged") {
    outputs[6] = { payload: { value: msg.payload.ventsALL, percentDifference: percentDifference }, topic: "ventsALLSet" };
} else if (msg.payload.ventsALL === "increased") {
    outputs[6] = { payload: { value: msg.payload.ventsALL, percentDifference: percentDifference }, topic: "ventsALLSet" };
} else if (msg.payload.ventsALL === "reduced") {
    outputs[6] = { payload: { value: msg.payload.ventsALL, percentDifference: percentDifference }, topic: "ventsALLSet" };
}

// VentsTopSpeed
if (msg.payload.ventsTopSpeed === "unchanged") {
    outputs[7] = { payload: { value: msg.payload.ventsTopSpeed, percentDifference: percentDifference }, topic: "ventsTopSpeedSet" };
} else if (msg.payload.ventsTopSpeed === "increased") {
    outputs[7] = { payload: { value: msg.payload.ventsTopSpeed, percentDifference: percentDifference }, topic: "ventsTopSpeedSet" };
} else if (msg.payload.ventsTopSpeed === "reduced") {
    outputs[7] = { payload: { value: msg.payload.ventsTopSpeed, percentDifference: percentDifference }, topic: "ventsTopSpeedSet" };
}

// VentsDownSpeed
if (msg.payload.ventsDownSpeed === "unchanged") {
    outputs[8] = { payload: { value: msg.payload.ventsDownSpeed, percentDifference: percentDifference }, topic: "ventsDownSpeedSet" };
} else if (msg.payload.ventsDownSpeed === "increased") {
    outputs[8] = { payload: { value: msg.payload.ventsDownSpeed, percentDifference: percentDifference }, topic: "ventsDownSpeedSet" };
} else if (msg.payload.ventsDownSpeed === "reduced") {
    outputs[8] = { payload: { value: msg.payload.ventsDownSpeed, percentDifference: percentDifference }, topic: "ventsDownSpeedSet" };
}



return outputs;
