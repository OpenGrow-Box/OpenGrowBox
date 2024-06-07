function calculateVPD(luftTemperatur, blattTemperatur, relativeLuftfeuchtigkeit) {
    // Stellen Sie sicher, dass alle Eingaben Zahlen sind
    luftTemperatur = parseFloat(luftTemperatur);
    blattTemperatur = parseFloat(blattTemperatur);
    relativeLuftfeuchtigkeit = parseFloat(relativeLuftfeuchtigkeit);

    // Überprüfen Sie, ob einer der Werte NaN ist
    if (isNaN(luftTemperatur) || isNaN(blattTemperatur) || isNaN(relativeLuftfeuchtigkeit)) {
        return NaN; // Geändert von "unavailable" zu NaN für bessere Handhabung in numerischen Berechnungen
    }

    // Berechnungen ohne Rundung
    let sdpLuft = 0.6108 * Math.exp((17.27 * luftTemperatur) / (luftTemperatur + 237.3));
    let sdpBlatt = 0.6108 * Math.exp((17.27 * blattTemperatur) / (blattTemperatur + 237.3));
    let adp = (relativeLuftfeuchtigkeit / 100) * sdpLuft;
    let vpd = sdpBlatt - adp;

    // Rückgabe als number, nicht als string
    return parseFloat(vpd.toFixed(2));
}

// Beispiel für die Verwendung der Funktion
let luftTemperatur = parseFloat(msg.payload.AvgData.AvgTempData); // Stellen Sie sicher, dass dies eine Zahl ist
let blattTemperatur = parseFloat(msg.payload.AvgData.AvgTempData) - parseFloat(msg.payload.LeafOffSet); // Keine Rundung, genaue Berechnung
let relativeLuftfeuchtigkeit = parseFloat(msg.payload.AvgData.AvgHumData); // Stellen Sie sicher, dass dies eine Zahl ist

let vpd = calculateVPD(luftTemperatur, blattTemperatur, relativeLuftfeuchtigkeit);

msg.payload = vpd; // Nun ist msg.payload eine Zahl

return msg;
