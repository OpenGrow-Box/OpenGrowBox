class Sensor extends Device {
    constructor(name) {
        super(name, "sensor");
        this.readings = []; // Speichert Sensordaten
    }

    addReading(reading) {
        this.readings.push(reading);
        return this.readings;
    }

    getLastReading() {
        return this.readings.length > 0 ? this.readings[this.readings.length - 1] : null;
    }

    clearReadings() {
        this.readings = [];
    }
}