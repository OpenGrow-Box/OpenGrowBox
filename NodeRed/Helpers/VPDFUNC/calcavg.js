// Funktion zur Berechnung des Durchschnitts
const AvgTemp = (temps) => {
    let sum = 0;
    let count = 0;

    temps.forEach((entry) => {
        const temp = parseFloat(entry.value);
        if (!isNaN(temp)) {
            sum += temp;
            count++;
        }
    });

    if (count === 0) {
        return "unavailable";
    }

    const avg = sum / count;
    return avg.toFixed(2);
};

// Durchschnittstemperatur für jede Temperaturkategorie berechnen
const temperatureAvg = AvgTemp(msg.payload.temperature);
const humidityAvg = AvgTemp(msg.payload.humidity);

// Objekt mit den Durchschnittswerten erstellen
const avgData = {
    AvgTempData: temperatureAvg,
    AvgHumData: humidityAvg
};

// Nachrichten erstellen und zurückgeben
const avgDataMsg = { payload: avgData, topic: "AvgData" };
const tempMsg = { payload: temperatureAvg, topic: "AvgTemp" };
const humMsg = { payload: humidityAvg, topic: "AvgHum" };

return [avgDataMsg, tempMsg, humMsg];
