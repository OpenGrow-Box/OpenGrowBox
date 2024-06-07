const tolerance = 0.025; // Toleranzwert für die VPD-Anpassung

// Berechnet den durchschnittlichen Wert aus zwei Zahlen im Array VPDStageValue und begrenzt das Ergebnis auf zwei Dezimalstellen
const averageVPD = (msg.payload.VPDStageValue[0] + msg.payload.VPDStageValue[1]) / 2;
const perfectVPD = parseFloat(averageVPD.toFixed(3));

const currentVPD = parseFloat(msg.payload.currentVPD);

// Build increase base of State % diffrence from Current VPD to avarangeVPD
// Berechnung der prozentualen Abweichung vom Ziel-VPD
const percentDifference = ((currentVPD - perfectVPD) / perfectVPD) * 100;



// IF not in Range Do Nothing
if (currentVPD < msg.payload.VPDStageValue[0] || currentVPD > msg.payload.VPDStageValue[1]){
    return
}
// Warnung über die prozentuale Abweichung
node.warn(`Perfect-VEGGI % : ${percentDifference.toFixed(2)}%`);
node.warn(`Perfect-Veggi-Current VPD: ${currentVPD}`);
node.warn(`Perfect-Veggi-Target-VPD: ${perfectVPD} with ${tolerance} Tolerance`);



// Funktion zur Berechnung der notwendigen Anpassungen basierend auf der Differenz zum VPD-Zielbereich.
function calculateAdjustment(currentVPD, perfectVPD) {
    // Wenn der aktuelle VPD unter dem minimalen Zielbereich liegt, Anpassungen vornehmen, um VPD zu erhöhen.
    if (currentVPD < perfectVPD - tolerance) {
        node.warn(`Perfect-Veggi-VPD:: ${currentVPD} zu Gering Erhöe Temp oder veringere die Feuchtikeit`);
        return {
            exhaustSpeed: "increased",      // Erhöht die Abluftgeschwindigkeit, um feuchte Luft herauszuziehen
            humidifier: "reduced",          // Schaltet den Luftbefeuchter aus, um Feuchtigkeit zu reduzieren
            dehumidifier: "increased",       // Schaltet den Luftentfeuchter an, um Feuchtigkeit zu reduzieren
            heaterFan: "increased",            // Schaltet den Beheizer an um, um die feuchtigkeit zu Reduzieren und Temp zu erhöhen
            coolerFan: "reduced",            // Schaltet den Beheizer an um, um die feuchtigkeit zu Erhöhen und Temp zu veringern
            ventsTopSpeed: "increased",     // Erhöht die Geschwindigkeit der oberen Belüftung, um mehr trockene Luft einzulassen
            ventsDownSpeed: "increased",    // Erhöht die Geschwindigkeit der unteren Belüftung
            lightIntensity: "increased"     // Erhöht die Lichtintensität, um die Temperatur zu steigern (wenn das die Temperatur beeinflusst)
        };
        
    }
    // Wenn der aktuelle VPD über dem maximalen Zielbereich liegt, Anpassungen vornehmen, um VPD zu senken.
    else if (currentVPD > perfectVPD + tolerance) {
        node.warn(`Perfect-Veggi-VPD: ${currentVPD} zu hoch verringere Temp oder erhöe die Feuchtikeit`);
        return {
            exhaustSpeed: "reduced",    // Reduziert die Abluftgeschwindigkeit, hält feuchte Luft im Raum
            humidifier: "increased",           // Schaltet den Luftbefeuchter ein, um Feuchtigkeit zu erhöhen
            dehumidifier: "reduced",       // Schaltet den Luftentfeuchter an, um Feuchtigkeit zu reduzieren
            heaterFan: "reduced",            // Schaltet den Beheizer an um, um die feuchtigkeit zu Reduzieren und Temp zu erhöhen
            coolerFan: "increased",            // Schaltet den Beheizer an um, um die feuchtigkeit zu Erhöhen und Temp zu veringern
            ventsTopSpeed: "reduced",   // Reduziert die Geschwindigkeit der oberen Belüftung
            ventsDownSpeed: "reduced",  // Reduziert die Geschwindigkeit der unteren Belüftung
            lightIntensity: "reduced"      // Verringert die Lichtintensität, um die Temperatur zu senken (wenn das die Temperatur beeinflusst)
        };
    }
    // Wenn der VPD im Zielbereich liegt, sind keine Anpassungen erforderlich.
             node.warn(`Perfect-Veggi-VPD: ${currentVPD} im Gewünschten Bereich`);
    return {
        exhaustSpeed: "unchanged",
        humidifier: "unchanged",
        dehumidifier: "unchanged",       // Schaltet den Luftentfeuchter an, um Feuchtigkeit zu reduzieren
        heaterFan: "unchanged",            // Schaltet den Beheizer an um, um die feuchtigkeit zu Reduzieren und Temp zu erhöhen
        coolerFan: "unchanged",            // Schaltet den Beheizer an um, um die feuchtigkeit zu Erhöhen und Temp zu veringern
        ventsTopSpeed: "unchanged",
        ventsDownSpeed: "unchanged",
        lightIntensity: "unchanged"
    };
}

// Entscheidungslogik zur Steuerung der Umgebungsbedingungen, nutzt die calculateAdjustment Funktion.
const adjustments = calculateAdjustment(currentVPD, perfectVPD);
msg.payload = {
    exhaustSpeed: adjustments.exhaustSpeed,
    humidifier: adjustments.humidifier,
    dehumidifier: adjustments.dehumidifier,
    heaterFan: adjustments.heaterFan,
    coolerFan: adjustments.coolerFan,
    ventsTopSpeed: adjustments.ventsTopSpeed,
    ventsDownSpeed: adjustments.ventsDownSpeed,
    lightIntensity: adjustments.lightIntensity,
    percentDifference: percentDifference.toFixed(2)
};
msg.perfektion = "VPDActions"

// Rückgabe des modifizierten Payloads für weitere Verwendung im Flow.
return msg;
