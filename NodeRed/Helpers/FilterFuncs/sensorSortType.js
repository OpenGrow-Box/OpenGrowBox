let data = msg.payload;

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

// Durchlaufe alle Schlüssel im data-Objekt und sortiere sie nach bestimmten Sensortypen
for (let key in data) {
    if (data.hasOwnProperty(key)) {
        let entity_id = key.toLowerCase();
        let entity = { entity_id: key, value: data[key] };

        // Prioritize to ensure it is captured first
        if (entity_id.includes('wish') || entity_id.includes('avg') || entity_id.includes('target')) {
            wish.push(entity);
        } else if (entity_id.includes('root') || entity_id.includes('wurzel') || entity_id.includes('water')) {
            root.push(entity);
        }
        // ENVIORMENT
        else if (entity_id.includes('temperature') || entity_id.includes('tempe')) {
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
        } else if (entity_id.includes('illuminance') || entity_id.includes('light') || entity_id.includes('licht')) {
            lumen.push(entity);
        }
        // Devices
        else if (entity_id.includes('humidifier') || entity_id.includes('befeuchter')) {
            humidifier.push(entity);
        } else if (entity_id.includes('dehumidifier') || entity_id.includes('entfeuchter')) {
            dehumidifier.push(entity);
        } else if (entity_id.includes('ruckec') || entity_id.includes('airctr') || entity_id.includes('exhaust') || entity_id.includes('abluft')) {
            dutyCycleExhaust.push(entity);
        } else if (entity_id.includes('vent')) {
            vents.push(entity);
        } else if (entity_id.includes('switch')) {
            switches.push(entity);
        } else if (entity_id.includes('power') || entity_id.includes('energy')) {
            power.push(entity);
        }

        // ADDONS
        else if (entity_id.includes('battery') || entity_id.includes('batt')) {
            battery.push(entity);
        }
    }
}

// Nachrichtenausgabe auf verschiedenen Outputs
return [
    // ENVIORMENT
    { payload: wish, topic: 'Wish' },
    { payload: temperatures, topic: 'temperature' },
    { payload: humidity, topic: 'humidity' },
    { payload: dewpoints, topic: 'dewpoint' },
    { payload: moisture, topic: 'moisture' },
    { payload: root, topic: 'roottemp' },
    { payload: conductivity, topic: 'conductivity' },
    { payload: pressures, topic: 'pressure' },
    { payload: co2, topic: 'carbon_dioxide' },
    { payload: lumen, topic: 'illuminance' },
    // DEVICEINFO
    { payload: battery, topic: 'battery' },
    { payload: power, topic: 'power' },
    // DEVICES
    { payload: switches, topic: 'switch' },
    { payload: vents, topic: 'Vents' },
    { payload: dutyCycleExhaust, topic: 'Exhaust' },
    { payload: humidifier, topic: 'humidifier' },
    { payload: dehumidifier, topic: 'dehumidifier' }


];
