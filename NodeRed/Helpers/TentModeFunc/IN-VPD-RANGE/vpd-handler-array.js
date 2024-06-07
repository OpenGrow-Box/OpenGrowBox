const tolerance = 0.00; // Toleranzwert für die VPD-Anpassung

// Der aktuelle VPD-Wert wird aus dem Payload geholt und in eine Zahl umgewandelt.
const currentVPD = parseFloat(msg.payload.currentVPD);

// Ziel-VPD-Bereich wird aus dem Payload geholt.
const targetVPDRange = msg.payload.targetVPD;

// Logging der aktuellen VPD und Ziel-VPD-Bereich zur Überprüfung und Debugging.
node.warn(`Veggi-VPD array between: ${targetVPDRange[0]} and ${targetVPDRange[1]}`);

// Berechnung der prozentualen Abweichung vom Ziel-VPD und Rundung auf ganze Zahlen
const percentDifference = Math.round(currentVPD < targetVPDRange[0] 
    ? ((currentVPD - targetVPDRange[0]) / targetVPDRange[0]) * 100 
    : ((currentVPD - targetVPDRange[1]) / targetVPDRange[1]) * 100);

// Funktion zur Berechnung der notwendigen Anpassungen basierend auf der Differenz zum VPD-Zielbereich.
function calculateAdjustment(currentVPD, targetVPDRange) {
    // Wenn der aktuelle VPD unter dem minimalen Zielbereich liegt, Anpassungen vornehmen, um VPD zu erhöhen.
    if (currentVPD < targetVPDRange[0] - tolerance) {
        node.warn(`Veggi-VPD:: ${currentVPD} zu gering. Erhöhe Temp oder verringere die Feuchtigkeit`);
        node.warn(`Veggi % VPD Target --> ${percentDifference} %`);
        return {
            exhaustSpeed: "increased",      // Erhöht die Abluftgeschwindigkeit, um feuchte Luft herauszuziehen
            humidifier: "reduced",          // Schaltet den Luftbefeuchter aus, um Feuchtigkeit zu reduzieren
            dehumidifier: "increased",       // Schaltet den Luftentfeuchter an, um Feuchtigkeit zu reduzieren
            heaterFan: "increased",         // Schaltet den Beheizer an, um die Feuchtigkeit zu reduzieren und Temp zu erhöhen
            coolerFan: "reduced",           // Schaltet den Kühler an, um die Feuchtigkeit zu erhöhen und Temp zu verringern
            ventsALL: "increased",          // Erhöht die Geschwindigkeit der oberen Belüftung, um mehr trockene Luft einzulassen
            ventsTopSpeed: "increased",     // Erhöht die Geschwindigkeit der oberen Belüftung, um mehr trockene Luft einzulassen
            ventsDownSpeed: "increased",    // Erhöht die Geschwindigkeit der unteren Belüftung
            lightIntensity: "increased"     // Erhöht die Lichtintensität, um die Temperatur zu steigern (wenn das die Temperatur beeinflusst)
        };
        
    }
    // Wenn der aktuelle VPD über dem maximalen Zielbereich liegt, Anpassungen vornehmen, um VPD zu senken.
    else if (currentVPD > targetVPDRange[1] + tolerance) {
        node.warn(`Veggi-VPD: ${currentVPD} zu hoch. Verringere Temp oder erhöhe die Feuchtigkeit`);
        node.warn(`Veggi % VPD Target --> ${percentDifference} %`);
        return {
            exhaustSpeed: "reduced",    // Reduziert die Abluftgeschwindigkeit, hält feuchte Luft im Raum
            humidifier: "increased",    // Schaltet den Luftbefeuchter ein, um Feuchtigkeit zu erhöhen
            dehumidifier: "reduced",    // Schaltet den Luftentfeuchter aus, um Feuchtigkeit zu erhöhen
            heaterFan: "reduced",       // Schaltet den Heizer aus, um die Temperatur zu verringern
            coolerFan: "increased",     // Schaltet den Kühler an, um die Temperatur zu verringern
            ventsALL: "reduced",        // Reduziert die Geschwindigkeit der Belüftung, um mehr feuchte Luft zu halten
            ventsTopSpeed: "reduced",   // Reduziert die Geschwindigkeit der oberen Belüftung
            ventsDownSpeed: "reduced",  // Reduziert die Geschwindigkeit der unteren Belüftung
            lightIntensity: "reduced"   // Verringert die Lichtintensität, um die Temperatur zu senken (wenn das die Temperatur beeinflusst)
        };
    }
    // Wenn der VPD im Zielbereich liegt, sind keine Anpassungen erforderlich.
    node.warn(`Veggi-VPD: ${currentVPD} im gewünschten Bereich`);
    return {
        exhaustSpeed: "unchanged",
        humidifier: "unchanged",
        dehumidifier: "unchanged",    
        heaterFan: "unchanged",        
        coolerFan: "unchanged",        
        ventsALL: "unchanged",       
        ventsTopSpeed: "unchanged",
        ventsDownSpeed: "unchanged",
        lightIntensity: "unchanged"
    };
}

// Entscheidungslogik zur Steuerung der Umgebungsbedingungen, nutzt die calculateAdjustment Funktion.
const adjustments = calculateAdjustment(currentVPD, targetVPDRange);

// Berechnung der prozentualen Abweichung und Hinzufügen zum Payload
msg.payload = {
    exhaustSpeed: adjustments.exhaustSpeed,
    humidifier: adjustments.humidifier,
    dehumidifier: adjustments.dehumidifier,
    heaterFan: adjustments.heaterFan,
    coolerFan: adjustments.coolerFan,
    ventsALL: adjustments.ventsALL,
    ventsTopSpeed: adjustments.ventsTopSpeed,
    ventsDownSpeed: adjustments.ventsDownSpeed,
    lightIntensity: adjustments.lightIntensity,
    percentDifference: percentDifference
};

msg.perfektion = "VPDActions";

// Rückgabe des modifizierten Payloads für weitere Verwendung im Flow.
return msg;
