// Hauptschlüssel in `msg.payload` extrahieren (z.B., "flowertent", "ambient", etc.)
let mainKey = Object.keys(msg.payload)[0];
let data = msg.payload[mainKey];  // Hol das innere Objekt mit den eigentlichen Daten
let room = msg.topic;

// Sicherstellen, dass die OpenGrowBox-Klasse geladen ist
const OpenGrowBox = global.get("OpenGrowBox");
if (!OpenGrowBox) {
    return new Error("OpenGrowBox class not found in globals.");
}
// Sicherstellen, dass die Raum-Instanz geladen ist
const roomInstance = global.get(room);
if (!roomInstance) {
    node.status({ fill: "red", shape: "ring", text: `No Room Data!` });
    return new Error(`Room instance for "${msg.topic}" not found.`);
}

if (roomInstance) {
    node.status({ fill: "blue", shape: "ring", text: `Start VPD Creation for ${roomInstance.tentName || room}` });
}

// Arrays für verschiedene Sensortypen initialisieren
let wish = [];
let temperatures = [];
let humidity = [];
let dewpoints = [];
let moisture = [];
let pressures = [];
let battery = [];
let power = [];
let co2 = [];
let lumen = [];
let conductivity = [];
let switches = [];
let dutyCycleExhaust = [];
let vents = [];
let humidifier = [];
let dehumidifier = [];
let root = [];
let cooler = [];
let heater = [];
let tank = [];
let pump = [];
let climate = [];

// Funktion zur Verarbeitung verschachtelter Objekte
function processEntity(sensorName, sensorData) {
    let entity_id = sensorName.toLowerCase();
    let entity = { entity_id: entity_id, value: sensorData };

    // Sortiere die Entitäten in die entsprechenden Kategorien
    if (entity_id.includes('wish') || entity_id.includes('number.') || entity_id.includes('weigth') || entity_id.includes('level')|| entity_id.includes('avg') || entity_id.includes('current')||  entity_id.includes('target')|| entity_id.includes('ambient') || entity_id.includes('outsite')) {
        wish.push(entity);
    } else if (entity_id.includes('root') || entity_id.includes('wurzel')) {
        root.push(entity);
    } else if (entity_id.includes('temperature') || entity_id.includes('tempe')) {
        temperatures.push(entity);
    } else if (entity_id.includes('humidity') || entity_id.includes('feuchtigkeit') || entity_id.includes('rh')) {
        humidity.push(entity);
    } else if (entity_id.includes('dewpoint') || entity_id.includes('dew')) {
        dewpoints.push(entity);
    } else if (entity_id.includes('moisture') || entity_id.includes('mois')) {
        moisture.push(entity);
    } else if (entity_id.includes('pressure') || entity_id.includes('press')) {
        pressures.push(entity);
    } else if (entity_id.includes('carbondioxide') || entity_id.includes('co2') || entity_id.includes('carbon')) {
        co2.push(entity);
    } else if (entity_id.includes('conductivity')) {
        conductivity.push(entity);
    } else if (entity_id.includes('illuminance')) {
        lumen.push(entity);
    } else if (entity_id.includes('climate.')) {
        climate.push(entity);
    } else if (entity_id.includes('dehumidifier') || entity_id.includes('entfeuchter')) {
        dehumidifier.push(entity);
    } else if (entity_id.includes('humidifier') || entity_id.includes('befeuchter')) {
        humidifier.push(entity);
    } else if (entity_id.includes('cooler') || entity_id.includes('klima')) {
        cooler.push(entity);
    } else if (entity_id.includes('heater') || entity_id.includes('heizung')) {
        heater.push(entity);
    } else if (entity_id.includes('tank')) {
        tank.push(entity);
    } else if (entity_id.includes('pump') || entity_id.includes('pumping')) {
        pump.push(entity);
    } else if (entity_id.includes('ruck') || entity_id.includes('airctrl') || entity_id.includes('exhaust') || entity_id.includes('abluft')) {
        dutyCycleExhaust.push(entity);
    } else if (entity_id.includes('vent')) {
        vents.push(entity);
    } else if (entity_id.includes('switch')) {
        switches.push(entity);
    } else if (entity_id.includes('power') || entity_id.includes('energy')) {
        power.push(entity);
    } else if (entity_id.includes('battery') || entity_id.includes('batt')) {
        battery.push(entity);
    }
}

// Hauptschleife zum Durchlaufen aller Gruppen und Sensoren in data
for (let group in data) {
    if (data.hasOwnProperty(group)) {
        for (let sensor in data[group]) {
            if (data[group].hasOwnProperty(sensor)) {
                processEntity(sensor, data[group][sensor]);
            }
        }
    }
}

// Durchschnitt für Temperatur und Feuchtigkeit berechnen und an die Raum-Instanz setzen
function calculateAvgValue(entities) {
    let sum = 0;
    let count = 0;

    entities.forEach((entry) => {
        let value = parseFloat(entry.value);
        if (!isNaN(value)) {
            sum += value;
            count++;
        }
    });

    return count === 0 ? null : parseFloat((sum / count).toFixed(2));
}

// Durchschnittliche Temperatur und Luftfeuchtigkeit berechnen und setzen
const avgTemp = calculateAvgValue(temperatures);
const avgHumidity = calculateAvgValue(humidity);

if (avgTemp !== null) {
    roomInstance.setCurrentTemp(avgTemp);
}
if (avgHumidity !== null) {
    roomInstance.setCurrentHumidity(avgHumidity);
}

// Berechnungen für Dewpoint und VPD explizit aufrufen
const currentDew = roomInstance.calculateDewPoint();
const currentVPD = roomInstance.calculateCurrentVPD();

const Room = {
    Temp: roomInstance.tentData.temperature,
    Humidity: roomInstance.tentData.humidity,
    Dewpoint: roomInstance.tentData.dewpoint,
    VPD: roomInstance.vpd.current,
}

// Nachrichtenausgabe auf verschiedenen Outputs
return [
    { payload: Room, topic: `${room}` },
    { payload: wish, topic: 'Wish', room: `${room}` },
    { payload: temperatures, topic: 'temperature', room: `${room}` },
    { payload: humidity, topic: 'humidity', room: `${room}` },
    { payload: currentDew, topic: 'dewpoint', room: `${room}` },
    { payload: moisture, topic: 'moisture', room: `${room}` },
    { payload: root, topic: 'roottemp', room: `${room}` },
    { payload: conductivity, topic: 'conductivity', room: `${room}`},
    { payload: pressures, topic: 'pressure', room: `${room}` },
    { payload: co2, topic: 'carbon_dioxide', room: `${room}` },
    { payload: lumen, topic: 'illuminance', room: `${room}` },
    { payload: battery, topic: 'battery', room: `${room}` },
    { payload: power, topic: 'power', room: `${room}` },
    { payload: switches, topic: 'switch', room: `${room}` },
    { payload: vents, topic: 'Vents', room: `${room}` },
    { payload: dutyCycleExhaust, topic: 'Exhaust', room: `${room}` },
    { payload: humidifier, topic: 'humidifier', room: `${room}` },
    { payload: dehumidifier, topic: 'dehumidifier', room: `${room}` },
    { payload: cooler, topic: 'cooler', room: `${room}` },
    { payload: heater, topic: 'heater', room: `${room}` },
    { payload: climate, topic: 'climate', room: `${room}`},
    { payload: tank, topic: 'tank',room:`${room}`},
    { payload: pump, topic: 'pump',room:`${room}`},
];
