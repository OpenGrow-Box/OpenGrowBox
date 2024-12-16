class OpenGrowBox {
    constructor(tentName = "", plantStage = "", tentMode = "", perfectionTolerance = 0.025) {

        // Tent Environment        
        this.tentName = tentName;
        this.tentMode = tentMode;
        this.plantStage = plantStage;
        this.controlSet = "";

        this.devices = [];
        this.ownSetttetDevices = []

        this.needchange = false
        this.previousActions = [];

        this.controls = {
            ownWeights:false,
            weights:{
                temp:null,
                hum:null,
            },
            co2Control:false,
            co2ppm:{
                minPPM:400,
                maxPPM:1200,
            },
            ownDeviceSetup:false,
            experimental:false,
            modes:{
                vpdPerfection:"VPD Perfection",
                inRangeVPD:"IN-VPD-Range",
                targetedVDP:"Targeted VPD",
                drying:"Drying",
                experimentel:"Experimentel",
                disabled:"Disabled"
            }
        }

        this.expMods = {
            current:"",
            plantType:"",
        }

        this.isPlantDay = {
            nightVPDHold: false,
            lightOn: false,
            lightOnTime: "",
            lightOffTime: "",
            lightbyOGBControl:false,
            sunRiseTimes:"",
            sunSetTimes:"",
        }

        this.enviorment = {
            ambientTemp: 0.0,
            ambientHumidity: 0.0,
            ambientDewpoint: 0.0,
            outsiteTemp: 0.0,
            outsiteHumidity: 0.0,
            outsiteDewpoint: 0.0,
        };

        this.tentData = {
            temperature: null,
            humidity: null,
            leafTempOffset: 0,
            dewpoint: 0.0,
            maxTemp: 0,
            minTemp: 0,
            maxHumidity: 0,
            minHumidity: 0,
            co2Level:400,
        };

        this.plantStages = {
            Germination: { vpdRange: [0.412, 0.7], minTemp: 20, maxTemp: 26, minHumidity: 65, maxHumidity: 80 },
            Clones: { vpdRange: [0.42, 0.75], minTemp: 20, maxTemp: 26, minHumidity: 65, maxHumidity: 80 },
            EarlyVeg: { vpdRange: [0.7, 0.85], minTemp: 20, maxTemp: 28, minHumidity: 55, maxHumidity: 70 },
            MidVeg: { vpdRange: [0.85, 1.1], minTemp: 22, maxTemp: 30, minHumidity: 50, maxHumidity: 65 },
            LateVeg: { vpdRange: [0.933, 1.2], minTemp: 22, maxTemp: 30, minHumidity: 50, maxHumidity: 60 },
            EarlyFlower: { vpdRange: [1.0, 1.25], minTemp: 22, maxTemp: 28, minHumidity: 45, maxHumidity: 60 },
            MidFlower: { vpdRange: [1.1, 1.4], minTemp: 22, maxTemp: 26, minHumidity: 40, maxHumidity: 55 },
            LateFlower: { vpdRange: [1.2, 1.7], minTemp: 20, maxTemp: 24, minHumidity: 40, maxHumidity: 50 }
        };

        this.vpd = {
            current: null,
            // RANGE VPD
            range: [],
            rangeTolerance: 0.0,
            diffRange: null,
            // VPD PERFECTION
            perfection: 0.0,
            perfectMin: 0.0,
            perfectMax: 0.0,
            perfectTolerance: perfectionTolerance,
            diffPerfection: null,
            // TARGETED VPD
            targeted: 0.0,
            targetedTolerance: 0.0,
            diffTargeted: null,
            ecotarget: [0.55, 0.88]
        };

        this.watering = {
            autoWatering: false,
            isRunning: false,
            pumpInvervall: "",
            pumpTime: "",
            nextPumpAction: "",
            waterTemp: 0,
            nutrients: {
                PH: 0,
                PPM: 0,
                EC: 0,
                Temp: 0,
                N: 0,
                P: 0,
                K: 0,
            }
        }

        this.dryStartTime = null;
        this.drying = {
            currentDryMode: "",
            isEnabled:false,
            isRunning:false,
            waterActivity: 0.0,
            dewpointVPD: 0.0,
            vaporPressureActual: 0.0,
            vaporPressureSaturation: 0.0,
            modes:{
                elClassico: {
                    isActive: false,
                    phase: {
                        start: {
                            targetTemp: 20, targetHumidity: 62, durationHours: 72
                        },
                        halfTime: {
                            targetTemp: 20, targetHumidity: 60, durationHours: 72
                        },
                        endTime: {
                            targetTemp: 20, targetHumidity: 58, durationHours: 72
                        }
                    }
                },
                sharkMouse: {
                    isActive: false,
                    phase: {
                        start: {
                            targetTemp: 22.2, targetHumidity: 55, targetVPD: 1.2, durationHours: 48
                        },
                        halfTime: {
                            maxTemp: 23.3, targetHumidity: 52, targetVPD: 1.39, durationHours: 24
                        },
                        endTime: {
                            maxTemp: 23.9, targetHumidity: 50, targetVPD: 1.5, durationHours: 48
                        }
                    }
                },
                dewBased: {
                    isActive: false,
                    phase: {
                        start: {
                            targetTemp: 20, targetDewPoint: 12.25, durationHours: 96
                        },
                        halfTime: {
                            targetTemp: 20, targetDewPoint: 11.1, durationHours: 96
                        },
                        endTime: {
                            targetTemp: 20, targetDewPoint: 11.1, durationHours: 48
                        }
                    }
                }
            }

        }

        this.addons ={
            GasLanternRoutine:{
                Veg:{
                    LightOnPhase: 12,
                    LightOffPhase: 5,
                    LightAddon: 1,   
                },
                Flower:{
                    Sativa:{
                    LightOnPhase: 8,
                    LightOffPhase: 16,
                    },
                    Indica:{
                    LightOnPhase: 6,
                    LightOffPhase: 18,
                    }
                }
            },
            GLR_NaturalSunshine:{
                Veg: {
                    LightOnPhase: 12,
                    LightOffPhase: 5,
                    LightAddon: 1,
                },
                Flower: {
                    Sativa: {
                        LightOnStartPhase: 12,
                        LightOnEndPhase: 8,
                        LightOffPhase: 0,
                        LightSteps:0,
                        LightStepTime:0,

                    },
                    Indica: {
                        LightOnStartPhase: 12,
                        LightOnEndPhase: 6,
                        LightOffPhase: 0,
                        LightSteps: 0,
                        LightStepTime: 0,

                    }
                }
            }
        }

        //Actions
        this.actions = {
            Increased: {
                exhaust: "increased",
                humidifier: "reduced",
                dehumidifier: "increased",
                heater: "increased",
                cooler: "reduced",
                ventilation: "increased",
                light: "increased",
                co2: "increased",
                climate: {
                    cool: "reduced",
                    dry: "increased",
                    heat: "increased",
                }
            },
            Reduced: {
                exhaust: "reduced",
                humidifier: "increased",
                dehumidifier: "reduced",
                heater: "reduced",
                cooler: "increased",
                ventilation: "reduced",
                light: "reduced",
                co2:"reduced",
                climate: {
                    cool: "increased",
                    dry: "reduced",
                    heat: "reduced",
                }
            },
            Unchanged: {
                exhaust: "unchanged",
                humidifier: "unchanged",
                dehumidifier: "unchanged",
                heater: "unchanged",
                cooler: "unchanged",
                ventilation: "unchanged",
                light: "unchanged",
                climate: {
                    cool: "unchanged",
                    dry: "unchanged",
                    heat: "unchanged"
                }
            },
        }

        this.init();
    }

    init() {

    }

   // DATA SETTER/GETTER ******************************
    setTentName(tentName = "") {
        this.tentName = tentName;
    }
    
    // Setze ob Ausleih funktion für Ambient aktiv ist. 
    setControlSet(controlSet) {
        if (this.controlSet !== controlSet) {
            this.controlSet = controlSet
        }
    }

    // erhalte ob Ambient Steuerung aktiv ist.
    getControlSet() {
        return this.controlSet
    }

    // Setze Aktiven ZeltMode
    setTentMode(tentMode = "") {
        if (this.tentMode !== tentMode) { // Vergleiche auf Gleichheit
            node.warn(`TentMode geändert von ${this.tentMode} auf ${tentMode} in ${this.tentName}`);
            
            // Prüfe, ob der neue Modus nicht "Drying" ist
            if (tentMode !== "Drying" && this.drying.isRunning) {
                this.drying.isRunning = false;
                this.drying.isEnabled = false;
                this.drying.currentDryMode = ""; // Drying-Mode zurücksetzen
                this.dryStartTime = null;        // Timer zurücksetzen
                node.warn("Drying-Modus deaktiviert und Timer zurückgesetzt.");
            }

            this.tentMode = tentMode; // Neuen Modus setzen
        } else {
            return; // Keine Änderung notwendig
        }
    }

    // Setze Targeted VPD wenn Mode aktiv!
    setTargetedVPD(targetVPD) {
        if (targetVPD !== this.vpd.targeted) {
            if(this.tentMode === "Targeted VPD"){
                this.vpd.targeted = targetVPD
            }
        }
    }

    // Ehalte Targeted VPD wenn Mode aktiv!
    getTargetedVPD() {
        if (this.tentMode === "Targeted VPD") { // Korrekt: Vergleich statt Zuweisung
            return this.vpd.targeted;
        }
        return null; // Falls der Mode nicht aktiv ist, gib einen sinnvollen Wert zurück
    }



    // Setze Plant Stage
    setPlantStageValue(plantStage = "") {
        if (this.plantStages.hasOwnProperty(plantStage)) {
            const stage = this.plantStages[plantStage];
            this.vpd.range = stage.vpdRange;
            this.tentData.maxTemp = stage.maxTemp;
            this.tentData.minTemp = stage.minTemp;
            this.tentData.maxHumidity = stage.maxHumidity;
            this.tentData.minHumidity = stage.minHumidity;
            this.calculatePerfectVPD();
            this.plantStage = plantStage; // Stelle sicher, dass plantStage gesetzt wird
            //node.warn(`PlantStage innerhalb der Instanz aktualisiert: ${this.plantStage}`);
        } else {
            node.warn(`Ungültige PlantStage: ${plantStage}`);
        }
    }

    // Setze aktuelle Temp
    setCurrentTemp(temp) {
        let newTemp = null;

        // Überprüfen, ob temp ein Array ist und den Durchschnitt berechnen
        if (Array.isArray(temp)) {
            newTemp = parseFloat(this.calculateAvgValue(temp));
        } else if (typeof temp === 'number') {
            newTemp = temp;
        } else if (typeof temp === 'string') {
            newTemp = parseFloat(temp);
        } else {
            throw new Error("Invalid temperature data. Must be an array, number, or string.");
        }

        if (newTemp === this.tentData.temperature) return;

        this.tentData.temperature = newTemp;

        if (this.tentData.humidity != null && this.tentData.temperature != null) {
            this.calculatePerfectVPD();
        }
    }

    // Setze Blatt Temp Offset
    setLeafOffset(offset) {
        this.tentData.leafTempOffset = parseFloat(offset)
    }

    // Setze aktuelle Feuchtigkeit
    setCurrentHumidity(humidity) {
        let newHumidity = null;

        // Überprüfen, ob humidity ein Array ist und den Durchschnitt berechnen
        if (Array.isArray(humidity)) {
            newHumidity = parseFloat(this.calculateAvgValue(humidity));
        } else if (typeof humidity === 'number') {
            newHumidity = humidity;
        } else if (typeof humidity === 'string') {
            newHumidity = parseFloat(humidity);
        } else {
            throw new Error("Invalid humidity data. Must be an array, number, or string.");
        }

        if (newHumidity === this.tentData.humidity) return;

        this.tentData.humidity = newHumidity;

        if (this.tentData.humidity != null && this.tentData.temperature != null) {
            this.calculatePerfectVPD();
        }
    }

    // Setze Ambient Raum Daten (WO DAS ZELT STEHT!!!!)
    setAmbientData(ambTemp, ambHum, ambDew = null) {
        // Exit if any value is null
        if (ambTemp === null || ambHum === null) return;

        // Calculate dew point if it is missing
        const dewpoint = ambDew !== null ? ambDew : this.calculateDewPoint(ambTemp, ambHum);

        // Update only if values have changed
        if (
            this.enviorment.ambientTemp !== ambTemp ||
            this.enviorment.ambientHumidity !== ambHum ||
            this.enviorment.ambientDewpoint !== dewpoint
        ) {
            this.enviorment.ambientTemp = ambTemp;
            this.enviorment.ambientHumidity = ambHum;
            this.enviorment.ambientDewpoint = dewpoint;
        }
    }

    // Setze Temp von Außen 
    setOutsiteData(outTemp, outHum, outDew = null) {
        // Exit if any value is null
        if (outTemp === null || outHum === null) return;

        // Calculate dew point if it is missing
        const dewpoint = outDew !== null ? outDew : this.calculateDewPoint(outTemp, outHum);

        // Update only if values have changed
        if (
            this.enviorment.outsiteTemp !== outTemp ||
            this.enviorment.outsiteHumidity !== outHum ||
            this.enviorment.outsiteDewpoint !== dewpoint
        ) {
            this.enviorment.outsiteTemp = outTemp;
            this.enviorment.outsiteHumidity = outHum;
            this.enviorment.outsiteDewpoint = dewpoint;
        }
    }

    // Setze aktuellen Dewpoint
    setCurrentDewPoint(dewpoint) {
        this.tentData.dewpoint = this.calculateDewPoint(dewpoint)
    }

    // Aktiviere Nacht VPD Ignoranz
    setVPDNightHold(nightHold) {
        if(nightHold != this.helperYesTrue(this.isPlantDay.nightVPDHold)){
            this.isPlantDay.nightVPDHold = this.helperYesTrue(nightHold)
        }
    }

    // Aktiviere Gewicht für Feinjustierung
    activateOwnWeights(activ) {
        if(activ !== this.controls.ownWeights){
            this.controls.ownWeights = this.helperYesTrue(activ)
            if(!this.controls.ownWeights){
                this.controls.weights.temp = null
                this.controls.weights.hum = null
            }
        }
    }

    // Erhatel Gewicht Aktivi Status
    getifOwnWeightsActive(){
        return this.helperYesTrue(this.controls.ownWeights)
    }

    // Setze Gewicht für Feinjustierung
    setOwnWeights(name, weight) {
        if (!this.controls.ownWeights) {
            // Wenn `ownWeights` deaktiviert oder nicht definiert ist
            if (!this.controls.ownWeights) {
                return { ownWeights: "Disabled" }; // Gebe zurück, dass `ownWeights` deaktiviert ist
            }
            // Falls `ownWeights` undefined oder nicht initialisiert ist
            this.controls.ownWeights = null;
            return { ownWeights: "Disabled" };
        } else {
            // Wenn `ownWeights` aktiviert ist
            if (name.includes("hum")) {
                // Feuchtigkeitsgewicht setzen
                this.controls.weights.hum = parseFloat(weight);
            } else if (name.includes("temp")) {
                // Temperaturgewicht setzen
                this.controls.weights.temp = parseFloat(weight);
            } else {
                // Ungültiger Name
                console.warn(`Unrecognized weight type: ${name}`);
                return { error: `Invalid weight type: ${name}` };
            }

            return { ownWeights: "Enabled" }; // Gebe zurück, dass `ownWeights` aktiviert ist
        }
    }

    // Erhalte Gewicht für Feinjustierung
    getOwnWeights() {
        if (this.controls.ownWeights) {
            return { tempWeight: this.controls.weights.temp, humWweight: this.controls.weights.hum }
        } else {
            return { Data: "NotNeeded" }
        }
    }

    // EXPRIMENTEL
    setGLSControl(glscControl){
        if(glscControl !== this.controls.experimental){
            this.controls.experimental = this.helperYesTrue(glscControl)
        }
    }

    // EXPRIMENTEL
    getGLSControl(){
        return this.helperYesTrue(this.controls.experimental)
    }

    // EXPRIMENTEL
    setGLSPlantType(plantType) {
        if(this.controls.experimental){
            if (plantType !== this.controls.experimental) {
                this.expMods.plantType = plantType
            }
        }else{
            if(this.expMods.plantType != ""){
                this.expMods.plantType =""
                
            }

        }

    }

    // EXPRIMENTEL
    getGLSPlantType() {
        return this.expMods.plantType
    }

    // EXPRIMENTEL
    // Aktiviere Eigene Geräte Steuerung(Experimentel"NOT-DONE")
    setOwnDeviceSetup(deviceControl){
        if (deviceControl !== this.controls.ownDeviceSetup){
            this.controls.ownDeviceSetup = this.helperYesTrue(deviceControl)
        }
        return
    }

    // EXPRIMENTEL
    // Aktiviere Eigene Geräte Steuerung(Experimentel"NOT-DONE")
    getOwnDeviceSetup(){
        return this.helperYesTrue(this.controls.ownDeviceSetup)
    }

    // Aktiviere CO2 Steuerung
    setCO2Control(co2Control){
        if(co2Control !== this.controls.co2Control){
            this.controls.co2Control = this.helperYesTrue(co2Control)
        }
    }

    // COS Status
    getCO2Control(){
        return  this.helperYesTrue(this.controls.co2Control)
    }

    // Aktiviere Kontorlle für Licht
    setLightControlByOGB(wantsControl){
        if(wantsControl !== this.isPlantDay.lightbyOGBControl){
            this.isPlantDay.lightbyOGBControl = this.helperYesTrue(wantsControl)
        }
    }

    // Licht Controll Status
    getLightControlByOGB(){
        return this.helperYesTrue(this.isPlantDay.lightbyOGBControl)
    }

    // Setze lichtzeiten wenn Kontrolle AKTIV 
    setLightTimes(startTime = "", endTime = "") {
        if(!this.isPlantDay.lightbyOGBControl)return
        if (startTime !== this.isPlantDay.lightOnTime || endTime !== this.isPlantDay.lightOffTime) {
            this.isPlantDay.lightOnTime = startTime;
            this.isPlantDay.lightOffTime = endTime;

            node.warn(`Aktualisierter Lichtzyklus: Start: ${startTime}, Ende: ${endTime}`);
            this.devices.forEach(device => {
                if (device.deviceType === "light") {
                    device.setLightTimes(startTime, endTime); // Lichtzeiten an die Geräte übergeben
                }
            });

            this.updateLightState(); // Aktualisiere den Lichtstatus
        }
    }
    // Setze Sonnen Auf/Untergang 
    setSunTimes(sunRiseTime = "", sunSetTime = "") {
        if (!this.isPlantDay.lightbyOGBControl) return
        if (sunRiseTime !== this.isPlantDay.sunRiseTimes || sunSetTime !== this.isPlantDay.sunSetTimes) {
            this.isPlantDay.sunRiseTimes = sunRiseTime;
            this.isPlantDay.sunSetTimes = sunSetTime;

            node.warn(`Aktualisierter Lichtzyklus: Start: ${sunRiseTime}, Ende: ${sunSetTime}`);
            this.devices.forEach(device => {
                if (device.deviceType === "light") {
                    device.setSunTimes(sunRiseTime, sunSetTime); // Lichtzeiten an die Geräte übergeben
                }
            });
        }
    }


    // HELPERS ******************************
    helperYesTrue(input) {
        if (typeof input === "string") {
            // Convert string to boolean
            const upperInput = input.toUpperCase(); // Normalize case
            if (upperInput === "YES") return true;
            if (upperInput === "NO") return false;
        } else if (typeof input === "boolean") {
            // Convert boolean to string
            return input ? "YES" : "NO";
        }
        // Handle invalid input
        throw new Error("Invalid input: expected a string ('YES'/'NO') or boolean (true/false).");
    }

    // Aktualisierung des Lichtstatus basierend auf der aktuellen Zeit
    updateLightState(currentTime = new Date()) {
        // Hole die aktuelle Zeit in Sekunden
        const currentSeconds = this.parseTime(currentTime.toTimeString().split(" ")[0]);

        // Konvertiere Lichtzeiten in Sekunden
        const lightOnSeconds = this.parseTime(this.isPlantDay.lightOnTime);
        const lightOffSeconds = this.parseTime(this.isPlantDay.lightOffTime);

        let lightOn;

        if (lightOffSeconds < lightOnSeconds) {
            // Lichtzyklus über Mitternacht: Licht an, wenn aktuelle Zeit nach Startzeit oder vor Endzeit
            lightOn = currentSeconds >= lightOnSeconds || currentSeconds < lightOffSeconds;
        } else {
            // Lichtzyklus innerhalb eines Tages: Licht an, wenn aktuelle Zeit zwischen Start- und Endzeit
            lightOn = currentSeconds >= lightOnSeconds && currentSeconds < lightOffSeconds;
        }

        // Setze den Lichtstatus in isPlantDay.lightOn
        if (this.isPlantDay.lightOn !== lightOn) {
            this.isPlantDay.lightOn = lightOn;

            // Logge Änderungen für Debugging
            node.warn(
                `${this.tentName}: Lichtstatus aktualisiert - ${lightOn ? "Licht AN" : "Licht AUS"
                } (Aktuelle Zeit: ${currentTime.toTimeString()}, On: ${this.isPlantDay.lightOnTime
                }, Off: ${this.isPlantDay.lightOffTime})`
            );

            // Überprüfe, ob ein Lichtgerät vorhanden ist, und aktualisiere es
        }
    }

    // Hilfsfunktion zur Zeitumrechnung (HH:MM:SS → Sekunden)
    parseTime(timeString) {
        const [hours, minutes, seconds = 0] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }


    /// DEVCIES ******************************
    // Methode zum Abrufen der passenden Geräteklasse
    getDeviceClass(deviceType) {
        const deviceClasses = {
            humidifier: Humidifier,
            dehumidifier: Dehumidifier,
            exhaustfan: ExhaustFan,
            ventilation: Ventilation,
            heater: Heater,
            cooler: Cooler,
            light: Light,
            pump: Pump,
            climate: Climate,
            sensor: Sensor,
        };

        return deviceClasses[deviceType] || Device;
    }

    // Gerät direkt zur Instanz hinzufügen und in entities speichern
    addDevice(deviceName,deviceData,context) {
        const identifiedDevice = this.identifyDevice(deviceName, deviceData);
        if (!identifiedDevice) {
            node.error(`Failed to identify device: ${deviceName}`);
            return;
        }

        // Daten initialisieren, falls nicht vorhanden
        identifiedDevice.data = { ...deviceData };
        identifiedDevice.setData(deviceData,context); // Gerätedaten setzen
        this.devices.push(identifiedDevice); // Gerät zur Liste hinzufügen
        this.registerDevices(identifiedDevice)
        node.warn(`Added new device: ${deviceName}`);
    }

    // Geräte Identifizierung
    identifyDevice(deviceName, deviceData) {
        const deviceTypeMapping = {
            "sensor": ["mode", "plant", "temperature", "temp", "humidity", "co2", "moisture", "dewpoint", "illuminance", "ppfd", "dli", "h5179"],
            "humidifier": ["humidifier", "mist"],
            "dehumidifier": ["dehumidifier", "dry", "removehumidity"],
            "exhaustfan": ["exhaust", "abluft", "ruck"],
            "ventilation": ["vent", "vents", "venti", "ventilation", "inlet", "outlet"],
            "heater": ["heater", "heizung", "warm"],
            "cooler": ["cooler", "fan", "kühl"],
            "light": ["light", "lamp", "led", "switch.light"],
            "climate": ["klima", "climate"],
            "co2": ["co2", "carbon"],
            "pump": ["pump", "waterpump", "pumpe"],
            //"sensor": ["sensor", "mode","plant", "temperature", "temp", "humidity", "co2", "moisture", "dewpoint", "illuminance", "ppfd", "dli", "flower", "veggi", "vegi", "dutycycle", "duty", "h5179"],
        };

        // Prüfen, ob der Gerätename einen bekannten Typ enthält
        // Überprüfen des Gerätetyps
        for (const [deviceType, keywords] of Object.entries(deviceTypeMapping)) {
            if (keywords.some(keyword => deviceName.toLowerCase().includes(keyword))) {
                const DeviceClass = this.getDeviceClass(deviceType);
                node.warn(`Device ${deviceName} identified as ${deviceType}`);
                return new DeviceClass(deviceName, deviceType, deviceData);
            }
        }

        // Prüfen, ob deviceData Schlüssel enthält, die auf einen Typ hindeuten
        const entityKeys = Object.keys(deviceData || {});
        for (const [deviceType, keywords] of Object.entries(deviceTypeMapping)) {
            if (entityKeys.some(key => keywords.some(keyword => key.toLowerCase().includes(keyword)))) {
                const DeviceClass = this.getDeviceClass(deviceType);
                return new DeviceClass(deviceName, deviceType); // Gerät erstellen
            }
        }

        node.warn(`Device ${deviceName} not recognized, returning unknown device.`);
        return new Device(deviceName, "unknown");
    }
    
    // Registierung Caps ( noch nicht in nutzung)
    registerDevices(device) {
        // Sensoren ignorieren
        if (device.deviceType.includes("sensor")) return;
        let capabilities
        // Bestimme die Fähigkeiten des Geräts
        capabilities = {
            canHeat: device.deviceType === "heater" || device.deviceType === "climate" || device.deviceType === "light",
            canCool: device.deviceType === "cooler" || device.deviceType === "climate",
            canHumidify: device.deviceType === "humidifier",
            canDehumidify: device.deviceType === "dehumidifier" || device.deviceType === "climate",
            canVentilate: device.deviceType === "ventilation" ,
            canExhaust: device.deviceType === "exhaust",
            canLight: device.deviceType === "light",
        };

        // Entferne alle Fähigkeiten, die das Gerät nicht besitzt
        capabilities = Object.fromEntries(
            Object.entries(capabilities).filter(([key, value]) => value)
        );

        // Füge die bereinigten Fähigkeiten zum Gerät hinzu


        // Füge das Gerät zum `registeredDevices`-Array hinzu
        if (!this.devices) this.devices = [];
        device.capabilities = { ...capabilities }

        node.warn(`Device registered: ${device.name} with capabilities: ${Object.keys(capabilities).join(", ")}`);
    }

    // Erhalte alle geräte 
    listDevices() {
        return this.devices;
    }
    
    // Gerät sperren
    lockDevice(device, roomName) {
        if (!device.isLocked) {
            device.isLocked = true;
            device.lockedFor = roomName;
            this.updateDevice(device);
            return true;
        }
        return false;
    }

    // Gerät entsperren
    unlockDevice(device) {
        if (device.isLocked) {
            device.isLocked = false;
            device.lockedFor = "";
            console.warn(`Gerät entsperrt: ${device.name}`);
            return true;
        }
        console.warn(`Gerät war nicht gesperrt: ${device.name}`);
        return false;
    }

    // Gerät ausleihen
    borrowDevice(device, fromTent) {
        if (this.lockDevice(device, fromTent)) {
            const borrowedIndex = this.devices.findIndex(d => d.name === device.name);
            if (borrowedIndex === -1) {
                this.devices.push(device);
            }
            device.inRoomName = this.tentName; // Setze den Raumnamen des geliehenen Geräts
            device.isfromAmbient = false; // Markiere, dass es nicht mehr von Ambient kommt
            return true;
        }
        return false;
    }

    // Gerät aktualisieren
    updateDevice(updatedDevice) {
        const index = this.devices.findIndex(d => d.name === updatedDevice.name);
        if (index !== -1) {
            this.devices[index] = updatedDevice;
        } else {
            this.devices.push(updatedDevice);
        }
    }

    // Gerät zurückgeben
    returnDevice(device) {
        if (this.unlockDevice(device)) {
            // Entferne alle Instanzen des Geräts aus dem Array
            device.action = "off";
            device.mode = "off";
            let offAction = device.turnOFF();
            this.devices = this.devices.filter(d => d.name !== device.name);
            console.warn(`Alle Instanzen von ${device.name} entfernt.`);

            device.inRoomName = "ambient"; // Setze den Raumnamen zurück auf Ambient
            device.isfromAmbient = true; // Markiere, dass es wieder zu Ambient gehört
            device.action = "off";
           node.warn(`OFF_Action_ROOM: ${JSON.stringify(offAction, null, 2)}`);
            return offAction
        }
        console.warn(`Gerät konnte nicht entsperrt werden: ${device.name}`);
        return false;
    }


    // Calc Funks ******************************
    // Calc Dewpoint
    calculateDewPoint(temperature = this.tentData.temperature, humidity = this.tentData.humidity) {
        const temp = parseFloat(temperature);
        const hum = parseFloat(humidity);
        if (isNaN(temp) || isNaN(hum)) {
            return "unavailable";
        }

        const a = 17.27;
        const b = 237.7;

        // Berechnung der Hilfsvariable γ(T, RH)
        const gamma = (a * temp) / (b + temp) + Math.log(hum / 100);

        // Berechnung des Taupunkts
        const dewPoint = (b * gamma) / (a - gamma);
        this.tentData.dewpoint = parseFloat(dewPoint.toFixed(2))
        return parseFloat(dewPoint.toFixed(2));
    }

    // Calc Aktellen VPD ( Based TEMP-HUM-EAFTEMP)
    calculateCurrentVPD(Temp = this.tentData.temperature, Humidity = this.tentData.humidity, LeafOffset = this.tentData.leafTempOffset) {
        const temp = parseFloat(Temp);
        const humidity = parseFloat(Humidity);
        const leafTemp = parseFloat(Temp) - parseFloat(LeafOffset);

        if (isNaN(temp) || isNaN(humidity) || isNaN(leafTemp)) {
            return NaN;
        }

        let sdpLuft = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
        let sdpBlatt = 0.6108 * Math.exp((17.27 * leafTemp) / (leafTemp + 237.3));
        let adp = (humidity / 100) * sdpLuft;
        let vpd = sdpBlatt - adp;

        this.vpd.current = parseFloat(vpd.toFixed(2));
        return this.vpd.current;
    }

    // Calc Aktellen VPD Mittelwert aus aktuellen Plantstage min/max werten 
    calculatePerfectVPD(vpdRange = this.vpd.range) {
        const averageVPD = (vpdRange[0] + vpdRange[1]) / 2;
        this.vpd.perfection = parseFloat(averageVPD.toFixed(2));

        this.vpd.perfectMin = parseFloat((this.vpd.perfection - this.vpd.perfectTolerance).toFixed(3));
        this.vpd.perfectMax = parseFloat((this.vpd.perfection + this.vpd.perfectTolerance).toFixed(3));
    }

    // Berechne aus array/string/number/object den avg wert.
    calculateAvgValue(temps = []) {
        let sum = 0;
        let count = 0;

        // Prüfen, ob es ein Array von Zahlen ist oder ein Array von Objekten mit `value`
        temps.forEach((entry) => {
            let temp = parseFloat(entry.value);

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
    }

    // DRYING ******************************
    // Setze aktuellen DryMode
    setDryingMode(dryMode) {
        const normalizedMode = Object.keys(this.drying.modes).find(
            mode => mode.toLowerCase() === dryMode.toLowerCase()
        );

        if (!normalizedMode) {
            node.warn(`Ungültiger Trocknungsmodus: ${dryMode}. Standardmodus 'elClassico' wird verwendet.`);
            this.drying.currentDryMode = "elClassico"; // Standardmodus setzen
        } else {
            this.drying.currentDryMode = normalizedMode;
        }

        if (!this.dryStartTime || !(this.dryStartTime instanceof Date)) {
            this.setDryingStartTime();
        }

        this.drying.isEnabled = true;
        this.drying.isRunning = true;
        node.warn(`Trocknungsmodus aktiviert: ${this.drying.currentDryMode}`);
    }

    
    // Erhalte aktulle DryPhase nach Zeitpunkt
    getDryingPhase() {
        // Sicherstellen, dass dryStartTime gültig ist
        if (!this.dryStartTime || !(this.dryStartTime instanceof Date) || isNaN(this.dryStartTime.getTime())) {
            node.error("Startzeit ist ungültig. Setze Startzeit neu.");
            this.setDryingStartTime();
        }

        // Sicherstellen, dass ein gültiger Drying-Mode gesetzt ist
        if (!this.drying.currentDryMode || !this.drying.modes.hasOwnProperty(this.drying.currentDryMode)) {
            node.error("Kein gültiger Drying-Mode gesetzt! Setze Standardmodus 'elClassico'.");
            this.setDryingMode("elClassico");
        }

        const startTimeInSeconds = Math.floor(this.dryStartTime.getTime() / 1000);
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const elapsedSeconds = nowInSeconds - startTimeInSeconds;

        node.warn(`Verstrichene Zeit: ${elapsedSeconds} Sekunden`);

        // Phasen abrufen und in Sekunden umrechnen
        const currentMode = this.drying.modes[this.drying.currentDryMode];
        const { start, halfTime, endTime } = currentMode.phase;

        const startDuration = start.durationHours * 3600;
        const halfTimeDuration = halfTime.durationHours * 3600;
        const endTimeDuration = endTime.durationHours * 3600;

        if (elapsedSeconds < startDuration) return "start";
        if (elapsedSeconds < startDuration + halfTimeDuration) return "halfTime";
        if (elapsedSeconds < startDuration + halfTimeDuration + endTimeDuration) return "endTime";

        node.warn("Trocknung abgeschlossen.");
        return "completed";
    }




    // Erhalte aktuellen DryMode
    getDryingMode() {
        return this.drying.currentDryMode
    }
    
    // Setze Initale Zeit für DryZeitpunkt
    setDryingStartTime() {
        if (!this.dryStartTime || !(this.dryStartTime instanceof Date) || isNaN(this.dryStartTime.getTime())) {
            this.dryStartTime = new Date(); // Erstelle gültiges Date-Objekt
            node.warn(`Startzeit wurde gesetzt: ${this.dryStartTime.toISOString()}`);
        }
    }



    // Berechne Wasseraktivität
    calcWatteractiviy(humidity = this.tentData.humidity) {
        let hum = parseFloat(humidity);

        if (isNaN(hum)) {
            console.error("Invalid humidity value. Water activity cannot be calculated.");
            this.drying.waterActivity = null; // Setze den Wert explizit auf null bei Fehler
            return null;
        }

        let wa = hum / 100; // Wasseraktivität berechnet als Verhältnis von Luftfeuchtigkeit
        this.drying.waterActivity = parseFloat(wa.toFixed(2)); // Auf zwei Dezimalstellen runden
        return this.drying.waterActivity;
    }

    // Berechne DewPointVPD (Based on Dewpoint/TEMP)
    calcDewVPD(airTemp = this.tentData.temperature, dewPoint = this.tentData.dewpoint) {
        airTemp = parseFloat(airTemp);
        dewPoint = parseFloat(dewPoint);

        if (isNaN(airTemp) || isNaN(dewPoint)) {
            console.error("Invalid air temperature or dew point for VPD calculation.");
            this.drying.dryingVPD = null;
            return null;
        }

        let sdpLuft = 0.6108 * Math.exp((17.27 * airTemp) / (airTemp + 237.3));
        let adp = 0.6108 * Math.exp((17.27 * dewPoint) / (dewPoint + 237.3));

        let dewVPD = sdpLuft - adp;
        this.drying.dewpointVPD = parseFloat(dewVPD.toFixed(2)); // Rundet den VPD-Wert auf zwei Dezimalstellen
        return this.drying.dewpointVPD;
    }


    // Setze Aktuelle Vapor Pressure Werte
    calcDryingVPs(airTemp = this.tentData.temperature, dewPoint = this.tentData.dewpoint) {
        airTemp = parseFloat(airTemp);
        dewPoint = parseFloat(dewPoint);

        if (isNaN(airTemp) || isNaN(dewPoint)) {
            console.error("Invalid air temperature or dew point for vapor pressure calculation.");
            this.drying.vaporPressureActual = null;
            this.drying.vaporPressureSaturation = null;
            return null;
        }

        // Berechnung des tatsächlichen Dampfdrucks (ADP) am Taupunkt
        let vaporPressureActual = 6.11 * Math.pow(10, (7.5 * dewPoint) / (237.3 + dewPoint));
        this.drying.vaporPressureActual = parseFloat(vaporPressureActual.toFixed(2)); // Runden

        // Berechnung des Sättigungsdampfdrucks (SDP) für Lufttemperatur
        let vaporPressureSaturation = 6.11 * Math.pow(10, (7.5 * airTemp) / (237.3 + airTemp));
        this.drying.vaporPressureSaturation = parseFloat(vaporPressureSaturation.toFixed(2)); // Runden

        return {
            vaporPressureActual: this.drying.vaporPressureActual,
            vaporPressureSaturation: this.drying.vaporPressureSaturation,
        };
    }


        //MODES ******************************
        // MASTER MODE
        ultraAdjustments(currentVPD = this.vpd.current, perfectVPD = this.vpd.perfection, tolerance = this.vpd.perfectTolerance) {
            let action;
            let vpdDiffPercent = parseFloat((((currentVPD - perfectVPD) / perfectVPD) * 100).toFixed(2));

            if (currentVPD < perfectVPD - tolerance) {
                action = this.actions.Increased;
            } else if (currentVPD > perfectVPD + tolerance) {
                action = this.actions.Reduced;
            }

            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inMode: "Ultra Perfection",
                currentVPD: currentVPD,
                targetVPD: perfectVPD,
                vpdDiffPercent: vpdDiffPercent,
                perfectMin: this.vpd.perfectMin,
                perfectMax: this.vpd.perfectMax,
                Temps: {
                    Temperature: this.tentData.temperature,
                    MinTemperature: this.tentData.minTemp,
                    MaxTemperature: this.tentData.maxTemp
                },
                Humditys: {
                    Humidity: this.tentData.humidity,
                    MinHumidity: this.tentData.minHumidity,
                    MaxHumidity: this.tentData.maxHumidity
                },
                actions: action
            };
        }
        
        // MITTEL wert ziel aus range vpd werten
        perfectionAdjustments(currentVPD = this.vpd.current, perfectVPD = this.vpd.perfection, tolerance = this.vpd.perfectTolerance) {
            let action;
            let vpdDiffPercent = parseFloat((((currentVPD - perfectVPD) / perfectVPD) * 100).toFixed(2));

            if (currentVPD < perfectVPD - tolerance) {
                action = this.actions.Increased;
            } else if (currentVPD > perfectVPD + tolerance) {
                action = this.actions.Reduced;
            }

            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inMode: "VPD Perfection",
                currentVPD: currentVPD,
                targetVPD: perfectVPD,
                vpdDiffPercent: vpdDiffPercent,
                perfectMin: this.vpd.perfectMin,
                perfectMax: this.vpd.perfectMax,
                Temps: {
                    Temperature: this.tentData.temperature,
                    MinTemperature: this.tentData.minTemp,
                    MaxTemperature: this.tentData.maxTemp
                },
                Humditys: {
                    Humidity: this.tentData.humidity,
                    MinHumidity: this.tentData.minHumidity,
                    MaxHumidity: this.tentData.maxHumidity
                },
                actions: action
            };
        }
        
        // Jumper zwishen min und max werten.
        rangeAdjustments(currentVPD = this.vpd.current, targetVPDRange = this.vpd.range, tolerance = this.vpd.rangeTolerance) {
            let action;
            let vpdDiffPercent;

            if (currentVPD < targetVPDRange[0] - tolerance) {
                vpdDiffPercent = parseFloat((((currentVPD - targetVPDRange[0]) / targetVPDRange[0]) * 100).toFixed(2));
                action = this.actions.Increased;
            } else if (currentVPD > targetVPDRange[1] + tolerance) {
                vpdDiffPercent = parseFloat((((currentVPD - targetVPDRange[1]) / targetVPDRange[1]) * 100).toFixed(2));
                action = this.actions.Reduced;
            }

            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inMode: "VPD Range",
                currentVPD: currentVPD,
                targetVPDMin: targetVPDRange[0],
                targetVPDMax: targetVPDRange[1],
                vpdDiffPercent: vpdDiffPercent,
                Temps: {
                    Temperature: this.tentData.temperature,
                    MinTemperature: this.tentData.minTemp,
                    MaxTemperature: this.tentData.maxTemp
                },
                Humditys: {
                    Humidity: this.tentData.humidity,
                    MinHumidity: this.tentData.minHumidity,
                    MaxHumidity: this.tentData.maxHumidity
                },
                actions: action
            };
        }

        // Targeted VPD Ziel mit Targed VPD
        targetAdjustment(currentVPD = this.vpd.current, targetVPD = this.vpd.targeted, tolerance = this.vpd.targetedTolerance) {
            let action;
            let vpdDiffPercent = parseFloat((((currentVPD - targetVPD) / targetVPD) * 100)); // Korrektur der Berechnung

            if (currentVPD < targetVPD + tolerance) {
                action = this.actions.Increased;
            } else if (currentVPD > targetVPD + tolerance) {
                action = this.actions.Reduced;
            }

            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                currentVPD: currentVPD,
                targetedVPD: targetVPD,
                vpdDiffPercent: vpdDiffPercent,
                Temps: {
                    Temperature: this.tentData.temperature,
                    MinTemperature: this.tentData.minTemp,
                    MaxTemperature: this.tentData.maxTemp
                },
                Humditys: {
                    Humidity: this.tentData.humidity,
                    MinHumidity: this.tentData.minHumidity,
                    MaxHumidity: this.tentData.maxHumidity
                },
                actions: action
            };
        }

    // DryingModeChecks 
    dryAdjustments() {
        if (!this.drying.isEnabled || !this.drying.isRunning) {
            this.drying.isEnabled = true;
            this.drying.isRunning = true;
            this.setDryingStartTime();
            node.warn("Trocknung gestartet und Status aktualisiert.");
        }

        const currentPhase = this.getDryingPhase();
        if (!currentPhase) {
            node.error("Keine Phase berechnet, Startzeit fehlt.");
            return { error: "Phase konnte nicht berechnet werden." };
        }

        if (currentPhase === "completed") {
            node.warn("Trocknung abgeschlossen.");
            this.drying.isRunning = false;
            return { status: "completed" };
        }

        // Wasseraktivität und VPD berechnen
        const waterActivity = this.calcWatteractiviy(this.tentData.humidity);
        const dewVPD = this.calcDewVPD(this.tentData.temperature, this.tentData.dewpoint);
        const vapors = this.calcDryingVPs(this.tentData.temperature,this.tentData.dewpoint)
        
        node.warn(`CURRENTPHASE: ${currentPhase}`);

        // Phase-spezifische Aktionen ausführen
        switch (this.drying.currentDryMode) {
            case "elClassico":
                return this.dryElClassico(currentPhase);
            case "sharkMouse":
                return this.drySharkMouse(currentPhase);
            case "dewBased":
                return this.dryDewBased(currentPhase);
            default:
                node.error("Unbekannter Drying-Mode!");
                return { error: "Unbekannter Drying-Mode" };
        }
    }


        
        // DRYMODE Classic
        dryElClassico(currentPhase) {
            const phaseConfig = this.drying.modes.elClassico.phase[currentPhase];
            const dryAction = this.actions.Unchanged; // Modus-spezifische Aktionen
            node.warn(`Aktuelle Phase der Trocknung:, ${currentPhase}`);
            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inDryMode: this.drying.currentDryMode,
                startTime: this.dryStartTime?.toISOString() || "Not Set", // Startzeit hinzufügen
                currentPhase,
                targetValues: {
                    targetTemp: phaseConfig.targetTemp,
                    targetHum: phaseConfig.targetHumidity,
                    targetDuration: phaseConfig.durationHours,
                },
                actions: dryAction
            };
        }

        // DRYMODE VPD Based
        drySharkMouse(currentPhase) {
            const phaseConfig = this.drying.modes.sharkMouse.phase[currentPhase];
            const dryAction = this.actions.Unchanged; // Modus-spezifische Aktionen
            node.warn(`Aktuelle Phase der Trocknung:, ${currentPhase}`);
            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inDryMode: this.drying.currentDryMode,
                startTime: this.dryStartTime?.toISOString() || "Not Set", // Startzeit hinzufügen
                currentPhase,
                targetValues: {
                    targetTemp: phaseConfig.targetTemp,
                    targetHum: phaseConfig.targetHumidity,
                    targetVPD: phaseConfig.targetVPD,
                    targetDuration: phaseConfig.durationHours,
                },
                actions: dryAction
            };
        }

        // DRYMODE DewPoint Based
        dryDewBased(currentPhase) {
            const phaseConfig = this.drying.modes.dewBased.phase[currentPhase];
            const dryAction = this.actions.Unchanged; // Modus-spezifische Aktionen
            node.warn(`Aktuelle Phase der Trocknung:, ${currentPhase}`);
            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inDryMode: this.drying.currentDryMode,
                startTime: this.dryStartTime?.toISOString() || "Not Set", // Startzeit hinzufügen
                currentPhase,
                targetValues: {
                    targetTemp: phaseConfig.targetTemp,
                    targetDewPoint: phaseConfig.targetDewPoint,
                    targetDuration: phaseConfig.durationHours,
                },
                actions: dryAction
            };
        }

        // EXPERIMENTEL
        ecoAdjustments(currentVPD = this.vpd.current, ecoTarget = this.vpd.ecotarget) {
            let action;
            let vpdECOPercent;

            if (currentVPD < ecoTarget[0]) {
                vpdECOPercent = parseFloat((((currentVPD - ecoTarget[0]) / ecoTarget[0]) * 100).toFixed(2));
                action = this.actions.Increased;
            } else if (currentVPD > ecoTarget[1]) {
                vpdECOPercent = parseFloat((((currentVPD - ecoTarget[1]) / ecoTarget[1]) * 100).toFixed(2));
                action = this.actions.Reduced;
            }

            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                currentVPD: currentVPD,
                targetVPDMin: ecoTarget[0],
                targetVPDMax: ecoTarget[1],
                vpdDiffPercent: vpdECOPercent,
                Temps: {
                    Temperature: this.tentData.temperature,
                    MinTemperature: this.tentData.minTemp,
                    MaxTemperature: this.tentData.maxTemp
                },
                Humditys: {
                    Humidity: this.tentData.humidity,
                    MinHumidity: this.tentData.minHumidity,
                    MaxHumidity: this.tentData.maxHumidity
                },
                actions: action
            };
        }
        // NIGHTHOLD VPD OUTPUT
        inDontCareMode() {
            let action = {
                exhaust: "maximal",
                humidifier: "Unchanged",
                dehumidifier: "Unchanged",
                heater: "Unchanged",
                cooler: "Unchanged",
                ventilation: "maximal",
                light: "Unchanged",
                co2: "Unchanged",
                climate: {
                    cool: "Unchanged",
                    dry: "Unchanged",
                    heat: "Unchanged",
                }

            }
            // NEED TO TEST ON LIGHT OFF PHASE
            node.warn(`Ignore VPD on NightTime run minimal Actions`);
            return {
                tentName: this.tentName,
                tentMode: "I DONT CARE MODE",
                Temps: {
                    Temperature: this.tentData.temperature,
                    MinTemperature: this.tentData.minTemp,
                    MaxTemperature: this.tentData.maxTemp
                },
                Humditys: {
                    Humidity: this.tentData.humidity,
                    MinHumidity: this.tentData.minHumidity,
                    MaxHumidity: this.tentData.maxHumidity
                },
                actions: action
            };
        }
        /// DISABELD 
        disabledMode() {
            node.log("Disabled mode active");
            let action = {
                exhaust: "Unchanged",
                humidifier: "Unchanged",
                dehumidifier: "Unchanged",
                heater: "Unchanged",
                cooler: "Unchanged",
                ventilation: "Unchanged",
                light: "Unchanged",
                co2: "Unchanged",
                climate: {
                    cool: "Unchanged",
                    dry: "Unchanged",
                    heat: "Unchanged",
                }

            }
            return {
                TentName: this.tentName,
                tentMode: this.tentMode,
                actions: action,
            };
        }


        /// ACTIONS ******************************
        selectAction(context) {
            let preparedDevices = []; // Speicher für Geräteaktionen
            let actionData;
            let limitAdjustments

            // Prüfen, ob der Zustand seit der letzten Aktion unverändert ist
            if (this.checkLastState()) {
                    this.needchange = false;
                    actionData = {
                        tentName: this.tentName,
                        tentMode: "Unchanged",
                        currentVPD: this.vpd.current,
                        Temps: {
                            Temperature: this.tentData.temperature,
                            MinTemperature: this.tentData.minTemp,
                            MaxTemperature: this.tentData.maxTemp,
                        },
                        Humidities: {
                            Humidity: this.tentData.humidity,
                            MinHumidity: this.tentData.minHumidity,
                            MaxHumidity: this.tentData.maxHumidity,
                        },
                        actions: this.actions.Unchanged,
                        deviceActions: preparedDevices,
                    };
            } else {
                this.needchange = true;           
            }


            // Modusabhängige Logik
            if (this.needchange) {
                switch (this.tentMode) {
                    case "VPD Perfection":
                        actionData = this.perfectionAdjustments(
                            this.vpd.current,
                            this.vpd.perfection,
                            this.vpd.perfectTolerance
                        );
                        break;
                    case "IN-VPD-Range":
                        actionData = this.rangeAdjustments(
                            this.vpd.current,
                            this.vpd.range,
                            this.vpd.rangeTolerance
                        );
                        break;
                    case "Targeted VPD":
                        actionData = this.targetAdjustment(
                            this.vpd.current,
                            this.vpd.targeted,
                            this.vpd.targetedTolerance
                        );
                        break;
                    case "ECO-VPD":
                        actionData = this.ecoAdjustments(
                            this.vpd.current,
                            this.vpd.ecotarget,
                        );
                        break;
                    case "Drying":
                        actionData = this.dryAdjustments();
                        break;
                    case "Disabled":
                        actionData = this.disabledMode();
                        break;

                    default:
                        throw new Error("Unknown mode: " + this.tentMode);
                }

                if (this.isPlantDay.lightOn === false && this.isPlantDay.nightVPDHold === false) {
                    actionData = this.inDontCareMode()
                }
                
            }

            if(this.needchange){
                limitAdjustments = this.checkLimits();
            }
            // Vorzeitige Anpassungen

                // Kombiniere alle Aktionen
            const finalActions = {
            ...actionData.actions || null,
            ...limitAdjustments || null,
            };
            //let absolutActions = this.evaluateDeviceEnvironment(finalActions)

            this.devices.forEach((device) => {

                // Prüfen, ob das Gerät korrekt initialisiert wurde
                if (device.switches.length === 0) return
                if (device && typeof device.prepareAction === "function") {
                    if (device.deviceType === "sensor" || device.deviceType === "pump" || device.deviceType === "co2") return;
                        
                    device = device.prepareAction(finalActions);

                    let actions = device.runAction(context)

                    //node.warn(`FinalAction: ${JSON.stringify(actions, null, 2)}`);

                    preparedDevices.push(actions)
                    //preparedDevices.push(device)
                } else {
                    // Falls Gerät nicht korrekt initialisiert ist, Warnung ausgeben
                    node.warn(`Device ${device?.name || "undefined"} konnte nicht verarbeitet werden.`);
                }
            });


            // Aktion speichern
            this.dataSetter({
                ...actionData || null,
                actions: finalActions || null,
                devices: this.devices || null,
                deviceActions: preparedDevices || null,
            });

            // Rückgabe der Aktion mit den angepassten Geräten
            return {
                ...actionData || null,
                actions: finalActions || null,
                devices: this.devices || null,
                deviceActions: preparedDevices || null, 
            };
        }
        // Check min/max settins and do adjustments
        checkLimits() {
            let adjustments = {};
            
            if(this.tentMode === "Drying")return

            if (!this.needchange) return adjustments

            // Dynamische Gewichtung basierend auf Plant Stage
            let humidityWeight, temperatureWeight;
            
            if(this.controls.ownWeights){
                if (this.plantStage === "MidFlower" || this.plantStage === "LateFlower") {
                    humidityWeight = this.controls.weights.hum; 
                    temperatureWeight = this.controls.weights.temp;
                } else {
                    humidityWeight = this.controls.weights.hum; 
                    temperatureWeight = this.controls.weights.temp;
                }   
            }else{
                if (this.plantStage === "MidFlower" || this.plantStage === "LateFlower") {
        
                    humidityWeight = 1.25 // In der Blütephase hat die Feuchtigkeit eine höhere Priorität
                    temperatureWeight = 1.0; // Temperatur hat in diesen Phasen weniger Priorität
                } else {
                    humidityWeight = 1.0; // In anderen Phasen wie der Vegetationsphase ist die Temperatur leicht höher als Feuchtigkeit
                    temperatureWeight = 1.0;
                }
            }

            // Temperatur- und Feuchtigkeitsabweichungen berechnen
            const tempDeviation = (this.tentData.temperature - this.tentData.maxTemp) * temperatureWeight;
            const humDeviation = (this.tentData.humidity - this.tentData.maxHumidity) * humidityWeight;

            // **Initialisiere climate innerhalb von adjustments**
            adjustments.climate = {
                cool: "unchanged",
                heat: "unchanged",
                dry: "unchanged",
            };


            // **1. Hohe Temperatur + Hohe Feuchtigkeit**
            if (tempDeviation > 0 && humDeviation > 0) {
                adjustments.dehumidifier = "increased"; // Feuchtigkeit reduzieren
                adjustments.cooler = "increased"; // Temperatur senken
                adjustments.exhaust = "increased"; // Abluft maximieren
                adjustments.climate.cool = "increased";
                adjustments.ventilation = "increased"; // Vents beibehalten oder erhöhen
            // node.warn(`${this.tentName} Fall: Hohe Temperatur + Hohe Feuchtigkeit`);

                // **2. Hohe Temperatur + Niedrige Feuchtigkeit**
            } else if (tempDeviation > 0 && humDeviation < 0) {
                adjustments.humidifier = "increased"; // Feuchtigkeit erhöhen
                adjustments.cooler = "increased"; // Temperatur senken
                adjustments.exhaust = "increased"; // Abluft beibehalten oder erhöhen
                adjustments.ventilation = "increased"; // Vents beibehalten oder erhöhen
                adjustments.climate.cool = "increased";
            // node.warn(`${this.tentName} Fall: Hohe Temperatur + Niedrige Feuchtigkeit`);

                // **3. Niedrige Temperatur + Hohe Feuchtigkeit**
            } else if (tempDeviation < 0 && humDeviation > 0) {
                adjustments.dehumidifier = "increased"; // Feuchtigkeit reduzieren
                adjustments.heater = "increased"; // Temperatur erhöhen
                adjustments.exhaust = "increased"; // Abluft erhöhen, um Feuchtigkeit abzuführen
                adjustments.climate.dry = "increased";
                adjustments.ventilation = "increased"; // Vents beibehalten oder erhöhen
                //node.warn(`${this.tentName} Fall: Niedrige Temperatur + Hohe Feuchtigkeit`);

                // **4. Niedrige Temperatur + Niedrige Feuchtigkeit**
            } else if (tempDeviation < 0 && humDeviation < 0) {
                adjustments.humidifier = "increased"; // Feuchtigkeit erhöhen
                adjustments.heater = "increased"; // Temperatur erhöhen
                adjustments.exhaust = "reduced"; // Abluft reduzieren, um Wärme und Feuchtigkeit zu halten
                adjustments.climate.heat = "increased";
                adjustments.ventilation = "reduced"; // Vents verringern
                //node.warn(`${this.tentName} Fall: Niedrige Temperatur + Niedrige Feuchtigkeit`);
            }

            // **Zusätzliche Fälle**

            // **5. Notfallmaßnahmen bei extremer Übertemperatur**
            if (this.tentData.temperature > this.tentData.maxTemp + 5) {
                adjustments.exhaust = "maximum"; // Maximale Abluft
                adjustments.ventilation = "increased"; // Vents beibehalten oder erhöhen            
                adjustments.cooler = "increased";
                adjustments.climate.cool = "increased";
                adjustments.light = "reduced"; // Licht komplett ausschalten, um Wärme zu reduzieren
            // node.warn(`${this.tentName} Kritische Übertemperatur! Notfallmaßnahmen aktiviert.`);
            }

            // **6. Notfallmaßnahmen bei extremer Untertemperatur**
            if (this.tentData.temperature < this.tentData.minTemp - 5) {
                adjustments.heater = "maximum"; // Maximale Heizung
                adjustments.exhaust = "reduced"; // Abluft reduzieren, um Wärme zu halten
                adjustments.ventilation = "increased"; // Vents beibehalten oder erhöhen        
                adjustments.climate.heat = "increased";
            // node.warn(` ${this.tentName} Kritische Untertemperatur! Notfallmaßnahmen aktiviert.`);
            }

            // **7. Lichtsteuerung basierend auf Temperatur**
            if (this.tentData.temperature > this.tentData.maxTemp && this.isPlantDay.lightOn) {
                adjustments.light = "reduced"; // Lichtleistung reduzieren, um Wärme zu verringern
            //node.warn(`${this.tentName} Lichtleistung reduziert aufgrund hoher Temperatur`);
            }

            // **8. CO₂-Management**
            if (this.tentData.co2Level < 400) {
                adjustments.co2 = "increased"; // CO₂ hinzufügen
                adjustments.exhaust = "minimum"; // CO₂ halten
                //node.warn("CO₂-Level zu niedrig, CO₂-Zufuhr erhöht");
            } else if (this.tentData.co2Level > 1200) {
                adjustments.co2 = "reduced"; // CO₂-Zufuhr stoppen
                adjustments.exhaust = "increased"; // CO₂ abführen
                //node.warn(`${this.tentName} CO₂-Level zu hoch, Abluft erhöht`);
            }

            // **9. Taupunkt- und Kondensationsschutz**
            if (this.tentData.dewpoint >= this.tentData.temperature - 1) {
                adjustments.dehumidifier = "increased"; // Feuchtigkeit reduzieren
                adjustments.exhaust = "increased"; // Abluft erhöhen
                adjustments.climate.dry = "increased";
                adjustments.ventilation = "increased"; // Vents beibehalten oder erhöhen
                //node.warn(`${this.tentName} Taupunkt erreicht, Feuchtigkeit reduziert`);
            }

            // **10. Nachtmodus (Licht aus, maximale Abluft)**
            if (!this.isPlantDay.lightOn) {
                adjustments.light = "off"; // Licht ausschalten
                adjustments.exhaust = "maximum"; // Abluft auf max setzen
                adjustments.ventilation = "increased"; // Vents beibehalten oder erhöhen
                //node.warn(`${this.tentName} Nachtmodus aktiv: Licht aus, Abluft erhöht`);
            }

            // **11. Sicherheitsfall: Abluft niemals reduzieren bei hoher Temperatur**
            if (tempDeviation > 0) {
                adjustments.exhaust = "increased"; // Abluft beibehalten oder erhöhen
                adjustments.ventilation = "maximum" // Vents beibehalten oder erhöhen
                //node.warn(`${this.tentName} Sicherheit: Abluft erhöht, da Temperatur zu hoch`);
            }

            // **12. Feuchtigkeitsgrenzwerte beachten**
            if (this.tentData.humidity < this.tentData.minHumidity) {
                adjustments.humidifier = "increased"; // Feuchtigkeit erhöhen
                adjustments.ventilation = "increased"
            //node.warn(`${this.tentName} Feuchtigkeit unter Minimum: Luftbefeuchter aktiviert`);
            } else if (this.tentData.humidity > this.tentData.maxHumidity) {
                adjustments.dehumidifier = "increased"; // Feuchtigkeit reduzieren
                adjustments.climate.dry = "increased";
                adjustments.ventilation = "increased"; // Vents beibehalten oder erhöhen
                //node.warn(`${this.tentName} Feuchtigkeit über Maximum: Entfeuchter aktiviert`);
            }

            // **13. Temperaturgrenzwerte beachten**
            if (this.tentData.temperature < this.tentData.minTemp) {
                adjustments.heater = "increased"; // Temperatur erhöhen
                adjustments.climate.heat = "increased";
                adjustments.ventilation = "reduced"; // Vents beibehalten oder erhöhen
                //node.warn(`${this.tentName} Temperatur unter Minimum: Heizung aktiviert`);
            } else if (this.tentData.temperature > this.tentData.maxTemp) {
                adjustments.cooler = "increased"; // Temperatur senken
                adjustments.climate.cool = "increased";
                adjustments.ventilation = "increased"; // Vents beibehalten oder erhöhen
                //node.warn(`${this.tentName} Temperatur über Maximum: Kühler aktiviert`);
            }

            return adjustments;
        }

        // Experimentel ( use outsite and ambient data)
        analyzeTrends(){
            let trend = {
                temperature: this.enviorment.outsiteTemp - this.enviorment.ambientTemp,
                humidity: this.enviorment.outsiteHumidity - this.enviorment.ambientHumidity,
            };

            if (trend.temperature > 0) {
                // Außentemperatur steigt -> Vorzeitig lüften
                this.actionsIncreased.exhaust = "preemptively increased";
            } else if (trend.temperature < 0) {
                // Außentemperatur sinkt -> Lüftung reduzieren
                this.actionsReduced.exhaust = "preemptively reduced";
            }

            if (trend.humidity > 0) {
                // Außenfeuchtigkeit steigt -> Entfeuchter verstärken
                this.actionsIncreased.dehumidifier = "preemptively increased";
            } else if (trend.humidity < 0) {
                // Außenfeuchtigkeit sinkt -> Befeuchter anpassen
                this.actionsReduced.humidifier = "preemptively reduced";
            }
        }

        // DATA SETTER FAKE DB ******************************
        dataSetter(data) {
            const time = new Date().toISOString();
            const lastAction = this.previousActions[this.previousActions.length - 1];
            // Definiere eine Schwelle für Änderungen
            const vpdThreshold = 0.001;

            if (this.tentMode === "Unchanged" || "Disabled" || "I DONT CARE MODE" ){
                return
            }


            // Filter für aktive oder relevante Geräte
            // Filter für aktive oder relevante Geräte
            const relevantDevices = this.devices.filter(
                (device) => (device.switches.length > 0) || device.isRunning
            );


            // Erstelle das Datenobjekt
            const enrichedData = {
                time,
                tentName: this.tentName,
                tentMode: this.tentMode,
                inMode: data.inMode,
                currentVPD: this.vpd.current,
                targetVPDMin: this.vpd.range[0],
                targetVPDMax: this.vpd.range[1],
                vpdDiffPercent: data.vpdDiffPercent || 0,
                Temps: {
                    Temperature: this.tentData.temperature,
                    MinTemperature: this.tentData.minTemp,
                    MaxTemperature: this.tentData.maxTemp,
                },
                Humditys: {
                    Humidity: this.tentData.humidity,
                    MinHumidity: this.tentData.minHumidity,
                    MaxHumidity: this.tentData.maxHumidity,
                },
                Dewpoint: this.tentData.dewpoint,
                actions: data.actions,
                Environment: {
                    ambientTemp: this.enviorment.ambientTemp,
                    ambientHumidity: this.enviorment.ambientHumidity,
                    ambientDewpoint: this.enviorment.ambientDewpoint,
                },
                Outside: {
                    outsiteTemp: this.enviorment.outsiteTemp,
                    outsiteHumidity: this.enviorment.outsiteHumidity,
                    outsiteDewpoint: this.enviorment.outsiteDewpoint,
                },
                devices: relevantDevices.map((device) => ({
                    name: device.name,
                    deviceType: device.deviceType,
                    isRunning: device.isRunning,
                    needChange: device.needChange,
                    action: device.action,
                    hasDuty: device.hasDuty,
                    dutyCycle: device.dutyCycle,
                    switches: device.switches,
                    sensors: device.sensors,
                    data: device.data,
                })),
                deviceActions: data.deviceActions
            };

            // Bedingung für signifikante Änderungen
            const significantChange =
                !lastAction ||
                Math.abs(lastAction.currentVPD - this.vpd.current) > vpdThreshold ||
                lastAction.targetVPDMin !== enrichedData.targetVPDMin ||
                lastAction.targetVPDMax !== enrichedData.targetVPDMax ||
                lastAction.Temps.Temperature !== enrichedData.Temps.Temperature ||
                lastAction.Humditys.Humidity !== enrichedData.Humditys.Humidity ||
                lastAction.Dewpoint !== enrichedData.Dewpoint;

            if (significantChange) {
                this.previousActions.push(enrichedData);
                node.log(`Neue Aktion gespeichert:", ${enrichedData}`);
            } else {
                node.log("Änderung nicht signifikant - Keine Aktion gespeichert.");
            }

            // Begrenze die Anzahl der gespeicherten Aktionen
            if (this.previousActions.length > 250) {
                this.previousActions = this.previousActions.slice(-250);
            }
        }
            // Check if action is needed to chagnes in vpd 
        checkLastState() {
            if (this.previousActions.length === 0) return false;

            const lastAction = this.previousActions[this.previousActions.length - 1];

            // Prüfen, ob der aktuelle Zustand identisch mit dem letzten gespeicherten Zustand ist
            if (lastAction && lastAction.currentVPD === this.vpd.current) {
                node.log("VPD hat sich nicht geändert. Keine Aktion notwendig.");
                return true;
            }

            return false;
        }
}

class Device {
    constructor(deviceName, deviceType = "generic") {
        this.name = deviceName;
        this.deviceType = deviceType;
        this.isRunning = false;
        this.isLocked = false
        this.lockedFor = ""
        this.needChange = false
        this.inRoomName  = ""
        this.isfromAmbient = false
        this.action = ""
        this.switches = [];
        this.sensors = [];
        this.data = {};

    }

    setData(data,context) {
        this.setFromtent(context.tentName)
        this.identifyIfFromAmbient()
        this.data = { ...this.data, ...data };
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
    }

    setFromtent(roomName){
        if(roomName != this.inRoomName){
            this.inRoomName = roomName
        }
    }

    identifyIfFromAmbient() {
        if (typeof this.inRoomName === "string" && 
            (this.inRoomName.toLowerCase().includes("ambient"))) {
            this.isfromAmbient = true;
        } else {
            this.isfromAmbient = false;
        }
    }

    identifySwitchesAndSensors() {
        if (!this.data || typeof this.data !== "object") return;

        const keys = Object.keys(this.data);
        this.switches = keys.filter((key) =>
            key.startsWith("switch.") || key.startsWith("light.") || key.startsWith("fan.") || key.startsWith("climate.")
        );
        this.sensors = keys.filter((key) =>
            key.startsWith("sensor.") || key.startsWith("number.") || key.startsWith("text.") || key.startsWith("time.")
        );
    }

    updateIsRunningState() {
        // Standardmäßig ist das Gerät nicht laufend
        this.isRunning = false;

        if (!this.data || typeof this.data !== "object") {
            return;
        }

        // 1. Prüfen, ob ein Fan eingeschaltet ist
        const fanKeys = Object.keys(this.data).filter((key) => key.startsWith("fan."));
        if (fanKeys.some((key) => this.data[key] === "on")) {
            this.isRunning = true;
            return;
        }

        // 2. Prüfen, ob ein Light eingeschaltet ist
        const lightKeys = Object.keys(this.data).filter((key) => key.startsWith("light."));
        if (lightKeys.some((key) => this.data[key] === "on")) {
            this.isRunning = true;
            return;
        }

        // 3. Prüfen, ob eine Klimaanlage eingeschaltet ist
        const climateKeys = Object.keys(this.data).filter((key) => key.startsWith("climate."));
        if (climateKeys.some((key) => this.data[key] === "on")) {
            this.isRunning = true;
            return;
        }

        // 4. Prüfen, ob Switches eingeschaltet sind
        if (Array.isArray(this.switches) && this.switches.length > 0) {
            if (this.switches.some((switchKey) => this.data[switchKey] === "on")) {
                this.isRunning = true;
                return;
            }
        }

        // 5. Prüfen, ob ein gültiger Duty-Cycle-Wert vorhanden ist
        const dutyCycleKey = Object.keys(this.data).find((key) =>
            key.toLowerCase().includes("duty_cycle") ||
            key.toLowerCase().includes("dutycycle") ||
            key.toLowerCase().includes("duty") ||
            key.toLowerCase().includes("number.")
        );

        if (dutyCycleKey) {
            const dutyCycleValue = parseInt(this.data[dutyCycleKey], 10);
            if (!isNaN(dutyCycleValue) && dutyCycleValue > 0) {
                this.isRunning = true;
                return;
            }
        }

        // 6. Prüfen, ob Sensor-Werte anzeigen, dass das Gerät läuft
        if (Array.isArray(this.sensors) && this.sensors.length > 0) {
            const sensorKey = this.sensors.find((key) =>
                key.toLowerCase().includes("duty_cycle") || key.toLowerCase().includes("dutycycle") || key.toLowerCase().includes("duty")
            );
            if (sensorKey && parseInt(this.data[sensorKey], 10) > 0) {
                this.isRunning = true;
                return;
            }
        }
    }

    prepareAction(finalActions) {
        if (finalActions.hasOwnProperty(this.deviceType)) {
            const actionValue = finalActions[this.deviceType];
            //node.warn(`Climate Aciton Value: ${JSON.stringify(finalActions,actionValue)}`);
            // Sonderfall für "climate" Geräte
            if (this.deviceType === "light") {
                // Spezielles Verhalten für "light"-Geräte
                this.needChange = true;
                this.action = actionValue;
            } else if (this.deviceType === "climate"){
                //node.warn(`IN Climate Aciton Value: ${JSON.stringify(finalActions, actionValue)}`);
                if (finalActions.climate && typeof finalActions.climate === "object") {
                    for (const [mode, action] of Object.entries(finalActions.climate)) {
                        if (action !== "unchanged") {
                            this.needChange = true;
                            this.action = { mode, action }; // Speichere den gefundenen Modus und die Aktion
                            break; // Beende die Schleife, sobald der erste gültige Wert gefunden wurde
                        }
                    }
                } else {
                    this.action = "unchanged"; // Standardwert, falls keine gültigen Climate-Aktionen vorhanden sind
                }
            } else{
                // Standard-Verhalten für andere Gerätetypen
                if (actionValue === "unchanged") {
                    this.needChange = false;
                    this.action = actionValue;
                } else if (
                    ["maximum", "reduced", "increased", "minimum", "medium", "on", "off"].includes(actionValue)
                ) {
                    this.needChange = true;
                    this.action = actionValue;
                }
            }
        } else {
            // Falls keine Aktion definiert ist, logge Warnung
            node.warn(`No actions defined for device type: ${this.deviceType}`);
            this.needChange = false;
            this.action = "unchanged";
        }

        // Debugging-Ausgabe zur Überprüfung der finalen Aktionen
        //node.warn(`Prepared action for ${this.name}: ${JSON.stringify(this.action, null, 2)}, needChange: ${this.needChange}`);

        return this;
    }



    prepareAction2(finalActions) {
        if (finalActions.hasOwnProperty(this.deviceType)) {
            const actionValue = finalActions[this.deviceType];

            // Sonderfall für "climate" Geräte
            if (this.deviceType === "light") {
                this.needChange = true;
                this.action = actionValue;
            } else if (this.deviceType === "climate") {
                const climateActions = finalActions.climate; // Hole die climate-Aktionen
                if (typeof climateActions === "object") {
                    // Initialisiere `this.action` als Objekt, falls es aktuell ein String ist
                    if (typeof this.action === "string") {
                        this.action = {};
                    }
                    node.warn(`HAVOCS: ${climateActions.heat}`);
                    // Iteriere über die verfügbaren Havoc-Modi
                    for (const mode in this.havocs) {
                        if (this.havocs.hasOwnProperty(mode)) {
                            const mappedMode = mode.toLowerCase(); // Mappe Havoc-Modus (z.B. "Dry") auf Lowercase ("dry")
                            const action = climateActions[mappedMode]; // Hole die Aktion für den Modus
                            
                            if (action) {
                                if (action !== "unchanged") {
                                    this.needChange = true;
                                    this.action[mappedMode] = action; // Speichere Aktionen pro Modus
                                } else {
                                    this.action[mappedMode] = action; // Unverändert bleibt erhalten
                                }
                            }
                        }
                    }
                }
            } else {
                // Standard-Verhalten für andere Gerätetypen
                if (actionValue === "unchanged") {
                    this.needChange = false;
                    this.action = actionValue;
                } else if (
                    ["maximum", "reduced", "increased", "minimum","medium","on","off"].includes(actionValue)
                ) {
                    this.needChange = true;
                    this.action = actionValue;
                }
            }
        }
        return this;
    }
  
    evalAction() {
        // Generische Prüfungen für alle Geräte
        if (this.action === "unchanged") {
            return false; // Keine Aktion erforderlich
        }

        return true; // Standardmäßig erlauben
    }

    runAction(context) {
        // Falls keine Änderung notwendig ist, abbrechen
        if (this.needChange === false) return;
        if (!this.evalAction()) {
            return { Device: `${this.switches[0]}`, Action: "noChangesNeeded",State:"unchanged" };
        }

        //node.warn(`Running Action for ${this.name} in ${this.inRoomName} `);
        //node.warn(`Action State:${this.action}`);


        // Aktion: increased
        if (this.action === "increased") {
            if (!this.hasDuty) {
                // Kein Duty-Modus: Schalte das Gerät ein, falls es nicht läuft
                if (!this.isRunning) {
                    node.warn(`${this.name} wurde eingeschaltet in ${this.inRoomName} .`);
                    return this.turnON();
                } else {
                    return { entity_id: this.switches[0], action: "Allready ON" }
                }
            } else {
                // Duty-Modus: Verwalte Duty-Cycle
                if (!this.isRunning) {
                    if (this.dutyCycle === 0) {
                        this.setDutyCycle(50);
                        node.warn(`${this.name} Duty-Cycle wurde auf 50% gesetzt und eingeschaltet in ${this.inRoomName} .`);
                        return this.changeDuty(this.dutyCycle);
                    }
                } else {
                    if (this.dutyCycle === 95) {
                        node.warn(`${this.name} läuft bereits auf maximalem Duty-Cycle in ${this.inRoomName} .`);
                        return { entity_id: this.switches[0], action: "Max Reached" }
                    } else {
                        node.warn(`${this.name} Duty-Cycle wurde auf ${this.dutyCycle + 5}% erhöht in ${this.inRoomName} .`);
                        return this.changeDuty(this.dutyCycle + 5); // Beispiel: Erhöhe Duty-Cycle um 10%
                    }
                }

            }

            // Aktion: reduced
        } else if (this.action === "reduced") {
            if (!this.hasDuty) {
                // Kein Duty-Modus: Schalte das Gerät aus, falls es läuft
                if (this.isRunning) {
                    node.warn(`${this.name} wurde ausgeschaltet in ${this.inRoomName} .`);
                    return this.turnOFF();
                } else {
                    return { entity_id: this.switches[0], action: "Allready OFF" }
                }
            } else {
                // Duty-Modus: Verwalte Duty-Cycle
                if (this.dutyCycle === 5) {
                    node.warn(`${this.name} ist auf Minimum gestellt in ${this.inRoomName} .`);
                    node.warn(`${this.name} wurde ausgeschaltet in ${this.inRoomName} .`);
                    return { entity_id: this.switches[0], action: "Minium Reached" }
                } else {
                    node.warn(`${this.name} Duty-Cycle wurde auf ${this.dutyCycle - 5}% reduziert in ${this.inRoomName} .`);
                    return this.changeDuty(this.dutyCycle - 5); // Beispiel: Reduziere Duty-Cycle um 10%
                }
            }

            // Aktion: unchanged
        } else if (this.action === "maximum"){
            if (!this.hasDuty) {
                // Kein Duty-Modus: Schalte das Gerät ein, falls es nicht läuft
                if (!this.isRunning) {
                    node.warn(`${this.name} wurde eingeschaltet in ${this.inRoomName} .`);
                    return this.turnON();
                } else {
                    return { entity_id: this.switches[0], action: "Allready ON" }
                }
            } else {
                // Duty-Modus: Verwalte Duty-Cycle
                if (!this.isRunning) {
                    if (this.dutyCycle === 0) {
                        this.setDutyCycle(100);
                        node.warn(`${this.name} Duty-Cycle wurde auf MAX %gesetzt und eingeschaltet in ${this.inRoomName} .`);
                        return this.changeDuty(this.dutyCycle);
                    }
                } else {
                    if (this.dutyCycle === 95) {
                        node.warn(`${this.name} läuft bereits auf maximalem Duty-Cycle in ${this.inRoomName} .`);
                        return { entity_id: this.switches[0], action: "Max Reached" }
                    } else {
                        node.warn(`${this.name} Duty-Cycle wurde auf MAX % erhöht in ${this.inRoomName} .`);
                        return this.changeDuty(100); // Beispiel: Erhöhe Duty-Cycle um 10%
                    }
                }

            }
        } else if (this.action === "minimum") {

        } else if (this.action === "unchanged") {
            //node.warn(`${this.name} bleibt unverändert.`);
            return { entity_id: this.switches[0], action: "UNCHANGED" }
            // Fehlerfall
        } else {
            node.warn(`Etwas Ungewöhnliches ist passiert: ${this.name} hat eine unbekannte Aktion. Bitte Support kontaktieren.`);

        }
    }

    turnOFF() {
        let enitiy = this.switches[0]
        if (this.isRunning === true) {
            this.isRunning = false
            return { "entity_id": enitiy, "action": "off" }
        }

    }

    turnON() {
        let enitiy = this.switches[0]
        if (this.isRunning == false) {
            this.isRunning = true
            return { "entity_id": enitiy, "action": "on" }
        }

    }
}

class ExhaustFan extends Device {
    constructor(name, dutyCycle = 0) {
        super(name, "exhaust");
        this.dutyCycle = this.clampDutyCycle(dutyCycle);
        this.minDuty = 10;
        this.maxDuty = 95;
        this.hasDuty = false;
        this.isRuckEC = false;
        this.init();
    }

    init() {
        this.findDutyCycle();
        this.identifyIfRuckEC();
    }

    clampDutyCycle(dutyCycle) {
        return Math.max(this.minDuty, Math.min(this.maxDuty, dutyCycle));
    }

    identifyIfRuckEC() {
        this.isRuckEC = this.name.toLowerCase().includes("ruck");
        if (this.isRuckEC) {
            node.warn(`${this.name}: Gerät als RuckEC erkannt.`);
        }
    }

    findDutyCycle() {
        if (!this.data) {
            node.warn(`${this.name}: Keine Gerätedaten gefunden.`);
            this.dutyCycle = this.minDuty;
            this.hasDuty = false;
            return;
        }

        const dutyCycleKey = Object.keys(this.data).find((key) =>
            key.toLowerCase().includes("dutycycle") ||
            key.toLowerCase().includes("duty_cycle") ||
            key.toLowerCase().includes("duty") ||
            key.toLowerCase().includes("number.")
        );

        if (dutyCycleKey) {
            const dutyCycleValue = parseInt(this.data[dutyCycleKey], 10);
            if (!isNaN(dutyCycleValue)) {
                this.dutyCycle = this.clampDutyCycle(dutyCycleValue);
                this.hasDuty = true;
                node.warn(`${this.name}: Duty Cycle gesetzt auf ${this.dutyCycle}%.`);
            } else {
                node.warn(`${this.name}: Ungültiger Duty Cycle-Wert. Setze auf ${this.minDuty}%.`);
                this.dutyCycle = this.minDuty;
            }
        } else {
            node.warn(`${this.name}: Kein Duty Cycle-Schlüssel gefunden.`);
            this.dutyCycle = this.minDuty;
        }
    }

    setDutyCycle(dutyCycle) {
        this.dutyCycle = this.clampDutyCycle(dutyCycle);
        node.warn(`${this.name}: Duty Cycle auf ${this.dutyCycle}% gesetzt.`);
        return this.dutyCycle;
    }

    changeDuty(duty) {
        const clampedDuty = this.clampDutyCycle(duty);
        this.dutyCycle = clampedDuty;

        if (this.switches?.[0]) {
            const switchId = this.switches[0];
            node.warn(`${this.name}: Duty Cycle an Switch ${switchId} gesendet.`);
            return { entity_id: switchId, action: "dutycycle", dutycycle: clampedDuty };
        } else {
            node.warn(`${this.name}: Kein Switch verfügbar.`);
            return { error: "No switch available" };
        }
    }

    runAction(context) {
        if (!this.needChange) {
            return { ExhaustFan: `${this.name}`, Action: "NoChangeNeeded" };
        }

        const switchId = this.switches?.[0];
        if (!switchId) {
            node.warn(`${this.name}: Kein Switch verfügbar.`);
            return { error: "No switch available" };
        }

        switch (this.action) {
            case "maximum":
                if (this.hasDuty) {
                    return this.changeDuty(this.maxDuty);
                } else {
                    return this.turnON(switchId);
                }
            case "minimum":
                if (this.hasDuty) {
                    return this.changeDuty(this.minDuty);
                } else {
                    return this.turnON(switchId);
                }
            case "increased":
                if(this.hasDuty){
                    const increasedDuty = Math.min(this.dutyCycle + 5, this.maxDuty);
                    return this.changeDuty(increasedDuty);
                }else{
                    return this.turnON(switchId);
                }
            case "reduced":
                if(this.hasDuty){
                    const reducedDuty = Math.max(this.dutyCycle - 5, this.minDuty);
                    return this.changeDuty(reducedDuty);
                }else{
                    return this.turnOFF(switchId);
                }


            case "on":
                return this.turnON(switchId);

            case "off":
                return this.turnOFF(switchId);

            case "unchanged":
                return { entity_id: switchId, action: "UNCHANGED" };

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { ExhaustFan: `${this.name}`, Action: "UnknownAction" };
        }
    }

    turnON(switchId) {
        if (!this.isRunning) {
            this.isRunning = true;
            node.warn(`${this.name}: Lüfter eingeschaltet.`);
            return { entity_id: switchId, action: "on" };
        }
        return { entity_id: switchId, action: "Already ON" };
    }

    turnOFF(switchId) {
        if (this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.name}: Lüfter ausgeschaltet.`);
            return { entity_id: switchId, action: "off" };
        }
        return { entity_id: switchId, action: "Already OFF" };
    }
}
class Ventilation extends Device {
    constructor(name) {
        super(name, "ventilation");
        this.dutyCycle = 0; // Duty Cycle für Lüftung
        this.dutyMin = 50; // Mindestwert für Duty Cycle
        this.dutyMax = 100; // Maximalwert für Duty Cycle
        this.hasDuty = false;
        this.isTasmota = false;
        this.init(); // Initialisierungsmethode aufrufen
    }

    init() {
        this.findDutyCycle(); // Duty Cycle initialisieren

        if (this.dutyCycle < this.dutyMin) {
            node.warn(`${this.name}: Duty Cycle unter Mindestwert. Setze auf ${this.dutyMin}%.`);
            this.dutyCycle = this.dutyMin;
        }

        this.identifyIfTasmota();
    }

    identifyIfTasmota() {
        if (Array.isArray(this.switches)) {
            this.isTasmota = this.switches.some(
                (switchDevice) => typeof switchDevice === "string" && switchDevice.startsWith("light.")
            );

            if (this.isTasmota) {
                this.hasDuty = true;
                if (this.isRunning && this.dutyCycle < this.dutyMin) {
                    this.dutyCycle = this.dutyMin;
                    node.warn(`Tasmota-Ventilation initialisiert mit ${this.dutyCycle}% DutyCycle.`);
                }
            }
        } else {
            node.warn(`${this.name}: Keine gültigen Switches gefunden.`);
        }
    }

    findDutyCycle() {
        if (!this.data) {
            node.warn(`${this.name}: Keine Gerätedaten gefunden.`);
            this.dutyCycle = this.dutyMin; // Fallback auf Mindestwert
            this.hasDuty = false;
            return;
        }

        if (this.isTasmota) return; // Ignoriere Tasmota-Geräte

        const dutyCycleKey = Object.keys(this.data).find((key) =>
            key.toLowerCase().includes("dutycycle")
        );

        if (dutyCycleKey) {
            const dutyCycleValue = parseInt(this.data[dutyCycleKey], 10);
            if (!isNaN(dutyCycleValue)) {
                this.dutyCycle = Math.max(this.dutyMin, Math.min(this.dutyMax, dutyCycleValue));
                this.hasDuty = true;
                node.warn(`${this.name}: Duty Cycle gesetzt auf ${this.dutyCycle}%.`);
            } else {
                node.warn(`${this.name}: Ungültiger Duty Cycle-Wert. Setze auf ${this.dutyMin}%.`);
                this.dutyCycle = this.dutyMin;
            }
        } else {
            node.warn(`${this.name}: Kein Duty Cycle-Schlüssel gefunden. Setze auf ${this.dutyMin}%.`);
            this.dutyCycle = this.dutyMin;
        }
    }

    setDutyCycle(dutyCycle) {
        const clampedDuty = Math.max(this.dutyMin, Math.min(this.dutyMax, dutyCycle));
        this.dutyCycle = clampedDuty;
        return clampedDuty;
    }

    changeDuty(switchId, duty) {
        this.setDutyCycle(duty);
        return { entity_id: switchId, action: "dutycycle", dutycycle: this.dutyCycle };
    }

    runAction(context) {
        if (!this.needChange) return { Ventilation: `${this.switches[0]}`, Action: "NoChangeNeeded" };

        const results = [];
        const applyActionToSwitches = (actionCallback) => {
            return this.switches.map((switchId) => {
                const result = actionCallback(switchId);
                results.push(result);
                return result;
            });
        };

        switch (this.action) {
            case "maximum":
                node.warn(`${this.name}: Duty Cycle auf Maximum (${this.dutyMax}%) gesetzt.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, this.dutyMax));

            case "minimum":
                node.warn(`${this.name}: Duty Cycle auf Minimum (${this.dutyMin}%) gesetzt.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, this.dutyMin));

            case "reduced":
                const reducedDuty = Math.max(this.dutyCycle - 5, this.dutyMin);
                node.warn(`${this.name}: Duty Cycle reduziert auf ${reducedDuty}%.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, reducedDuty));

            case "increased":
                const increasedDuty = Math.min(this.dutyCycle + 5, this.dutyMax);
                node.warn(`${this.name}: Duty Cycle erhöht auf ${increasedDuty}%.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, increasedDuty));

            case "on":
                return applyActionToSwitches((switchId) => this.turnON(switchId));

            case "off":
                return applyActionToSwitches((switchId) => this.turnOFF(switchId));

            case "unchanged":
                node.warn(`${this.name}: Keine Änderung erforderlich.`);
                return applyActionToSwitches((switchId) => ({ entity_id: switchId, action: "UNCHANGED" }));

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { Ventilation: `${this.switches[0]}`, Action: "UnknownAction" };
        }
    }

    turnOFF(switchId) {
        if (this.isRunning) {
            this.isRunning = false;
            return { entity_id: switchId, action: "off" };
        }
        return { entity_id: switchId, action: "Already OFF" };
    }

    turnON(switchId) {
        if (!this.isRunning) {
            this.isRunning = true;
            return { entity_id: switchId, action: "on" };
        }
        return { entity_id: switchId, action: "Already ON" };
    }
}

class Climate extends Device {
    constructor(name) {
        super(name, "climate");
        this.currentHAVOC = "off"; // Standardzustand
        this.havocs = {
            dry: "dry",
            cool: "cool",
            hot: "hot",
            heat: "heat",
            wind: "wind",
            off: "off",
        };
        this.isRunning = false; // Status der Klimaanlage
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        this.data = { ...this.data, ...data };
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.identifyCurrentHavoc();
    }

    identifyCurrentHavoc() {
        const havocDevice = this.switches[0];
        if (!havocDevice) {
            console.warn(`${this.name}: Keine Switches definiert, um HAVOC zu identifizieren.`);
            return;
        }

        const havocValue = this.data[havocDevice];

        if (havocValue && Object.values(this.havocs).includes(havocValue)) {
            this.currentHAVOC = havocValue;
            console.warn(`${this.name}: HAVOC-Modus gesetzt auf "${this.currentHAVOC}".`);
        } else {
            console.warn(`${this.name}: Ungültiger HAVOC-Wert "${havocValue}", Standardwert "off" wird verwendet.`);
        }
    }

    runAction() {
        if (!this.needChange || !this.action || typeof this.action !== "object") {
            console.warn(`${this.name}: Keine Änderungen erforderlich.`);
            return null;
        }

        const { mode, action } = this.action;
        const lowerMode = mode.toLowerCase(); // Konvertiere in Kleinbuchstaben
        const validMode = this.havocs[lowerMode]; // Vergleiche mit `havocs` Mapping

        console.warn(`Aktion empfangen: Mode = "${mode}", Action = "${action}", ValidMode = "${validMode}", CurrentHAVOC = "${this.currentHAVOC}"`);

        // Prüfen, ob der Modus ungültig ist
        if (!validMode) {
            console.warn(`${this.name}: Ungültiger Modus "${mode}" erhalten. Standardwert "off" wird verwendet.`);
            return { entity_id: this.switches[0], action: "invalid_mode", received_mode: mode };
        }

        // Prüfen, ob der Modus bereits läuft
        if (this.isRunning && this.currentHAVOC.toLowerCase() === validMode) {
            console.warn(`${this.name}: Keine Änderungen notwendig. Der Modus "${validMode}" ist bereits aktiv.`);
            return { entity_id: this.switches[0], action: "AllReady_ON", climate_mode: this.currentHAVOC };
        }

        if (action === "off") {
            return this.turnOFF();
        }

        if (!this.isRunning) {
            return this.turnON(validMode);
        }

        return this.changeMode(validMode);
    }

    turnON(mode) {
        this.isRunning = true;
        if(this.currentHAVOC !== mode){
            this.currentHAVOC = mode;
            return { entity_id: this.switches[0], action: "climate", climate_mode: mode };
        }else{
            return { entity_id: this.switches[0], action: "AllReady_Running", climate_mode: mode };
        }

    }

    turnOFF() {
        if (this.isRunning) {
            const previousMode = this.currentHAVOC;
            this.isRunning = false;
            this.currentHAVOC = "off";
            return { entity_id: this.switches[0], action: "off", previous_mode: previousMode };
        }
        return { entity_id: this.switches[0], action: "already_off" };
    }

    changeMode(mode) {
        
        if(this.currentHAVOC !== mode){
            this.currentHAVOC = mode;
            return { entity_id: this.switches[0], action: "climate", climate_mode: mode };
        }else{
            return { entity_id: this.switches[0], action: "AllReady_OFF", climate_mode: mode };
        }

    }
}

class Light extends Device {
    constructor(name) {
        super(name, "light");
        this.hasDuty = false;
        this.dutyCycle = null;
        this.minDuty = 20;
        this.maxDuty = 100;
        this.stepSize = 1; // Schrittweite für Änderungen
        this.sunRiseTime = "";
        this.sunSetTime = "";
        this.lightOnTime = ""; // Startzeit des Lichts
        this.lightOffTime = ""; // Endzeit des Lichts
        this.isScheduled = false; // Ob das Licht Zeitpläne berücksichtigt
        this.currentPlantPhase = {
            min: 0,
            max: 0,
        };
        this.PlantStageMinMax = {
            Germ: {
                min: 20,
                max: 30,
            },
            Veg: {
                min: 20,
                max: 50,
            },
            Flower: {
                min: 50,
                max: 100,
            },
        };
        this.init();
    }

    init() {
        this.findDutyCycle(); // Initialisiere den Duty-Cycle, falls vorhanden
    }

    findDutyCycle() {
        if (!this.data) {
            node.warn(`${this.name}: Keine Gerätedaten gefunden.`);
            return;
        }

        const dutyCycleKey = Object.keys(this.data).find((key) =>
            ["dutycycle", "number.", "duty", "light."].some((term) => key.toLowerCase().includes(term))
        );

        if (dutyCycleKey) {
            const dutyCycleValue = parseFloat(this.data[dutyCycleKey]);
            if (!isNaN(dutyCycleValue)) {
                const clampedValue = Math.max(this.minDuty, Math.min(this.maxDuty, dutyCycleValue));
                this.dutyCycle = clampedValue;
                this.hasDuty = true;
                node.warn(`${this.name}: Duty-Cycle gesetzt auf ${this.dutyCycle} (aus Schlüssel '${dutyCycleKey}')`);
            } else {
                this.hasDuty = false;
                node.warn(`${this.name}: Ungültiger Duty-Cycle-Wert (${this.data[dutyCycleKey]})`);
            }
        } else {
            this.hasDuty = false;
            node.warn(`${this.name}: Kein Duty-Cycle-Schlüssel gefunden.`);
        }
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        this.data = { ...this.data, ...data };
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.setCurrenPlantPhaseName(context);
        this.setLightTimes(context);
        this.setSunTimes(context.isPlantDay.sunRiseTimes, context.isPlantDay.sunSetTimes);
    }

    setCurrenPlantPhaseName(context) {
        if (!context) return;
        if (context.plantStage !== this.currentPlantPhase) {
            this.currentPlantPhase = context.plantStage;
            this.setForPlantLightPhase();
        }
    }

    setForPlantLightPhase() {
        const phase = this.currentPlantPhase;
        if (phase.includes("Germination") || phase.includes("Clones")) {
            this.currentPlantPhase = { ...this.PlantStageMinMax.Germ };
        } else if (phase.includes("Veg")) {
            this.currentPlantPhase = { ...this.PlantStageMinMax.Veg };
        } else if (phase.includes("Flower")) {
            this.currentPlantPhase = { ...this.PlantStageMinMax.Flower };
        }
        this.minDuty = this.currentPlantPhase.min;
        this.maxDuty = this.currentPlantPhase.max;
    }

    setLightTimes(context) {
        if (!context) return;
        const { lightOnTime, lightOffTime } = context.isPlantDay || {};
        this.lightOnTime = lightOnTime;
        this.lightOffTime = lightOffTime;

        if (this.lightOnTime && this.lightOffTime !== "") {
            this.isScheduled = true;
        }
    }

    setSunTimes(sunRiseTime, sunSetTime) {
        if (sunRiseTime || sunSetTime !== "") {
            this.sunRiseTime = sunRiseTime;
            this.sunSetTime = sunSetTime;
        }
    }

    parseTime(timeString) {
        const [hours, minutes, seconds = 0] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }

    runAction(context) {
        if (!this.lightOnTime || !this.lightOffTime) {
            node.warn(`${this.name}: Lichtzeiten fehlen. Keine Aktion durchgeführt.`);
            return { Light: `${this.switches[0]}`, Action: "NoLightTimesSet", Status: this.isRunning };
        }

        const currentTime = new Date();
        const currentSeconds = this.parseTime(currentTime.toTimeString().split(" ")[0]);

        // Sonnenaufgang und Sonnenuntergang prüfen
        const sunRiseSeconds = this.parseTime(this.sunRiseTime);
        const sunSetSeconds = this.parseTime(this.sunSetTime);

        if (currentSeconds >= sunRiseSeconds && currentSeconds < sunSetSeconds) {
            // Sonnenaufgang: Duty-Cycle von minDuty auf maxDuty erhöhen
            const sunriseDuration = sunSetSeconds - sunRiseSeconds;
            const elapsed = currentSeconds - sunRiseSeconds;
            const dutyIncrement = (elapsed / sunriseDuration) * (this.maxDuty - this.minDuty);
            const newDuty = Math.min(this.maxDuty, this.minDuty + dutyIncrement);
            this.changeDuty(newDuty);
        } else if (currentSeconds >= sunSetSeconds || currentSeconds < sunRiseSeconds) {
            // Sonnenuntergang: Duty-Cycle von maxDuty auf minDuty reduzieren
            const sunsetDuration = (24 * 3600 - sunSetSeconds) + sunRiseSeconds; // Über Mitternacht
            const elapsed = currentSeconds >= sunSetSeconds
                ? currentSeconds - sunSetSeconds
                : 24 * 3600 - sunSetSeconds + currentSeconds;
            const dutyDecrement = (elapsed / sunsetDuration) * (this.maxDuty - this.minDuty);
            const newDuty = Math.max(this.minDuty, this.maxDuty - dutyDecrement);
            this.changeDuty(newDuty);
        }

        // Lichtsteuerung basierend auf Zeitplan
        const startTime = this.parseTime(this.lightOnTime);
        const endTime = this.parseTime(this.lightOffTime);

        let isLightOn;
        if (endTime < startTime) {
            isLightOn = currentSeconds >= startTime || currentSeconds <= endTime;
        } else {
            isLightOn = currentSeconds >= startTime && currentSeconds <= endTime;
        }

        if (isLightOn !== this.isRunning) {
            this.isRunning = isLightOn;
            this.action = isLightOn ? "on" : "off";
        } else {
            this.action = "unchanged";
        }

        switch (this.action) {
            case "on":
                return this.turnON();

            case "off":
                return this.turnOFF();

            case "unchanged":
                //node.warn(`${this.name}: Keine Änderung erforderlich, Lichtstatus bleibt ${this.isRunning ? "AN" : "AUS"} in ${this.inRoomName}.`);
                return { Light: `${this.switches[0]}`, Action: "NoChange", Status: this.isRunning };

            case "increased":
                if (this.hasDuty && this.isRunning) {
                    const newDuty = Math.min(this.maxDuty, this.dutyCycle + this.stepSize);
                    return this.changeDuty(newDuty);
                }
                break;

            case "reduced":
                if (this.hasDuty && this.isRunning) {
                    const newDuty = Math.max(this.minDuty, this.dutyCycle - this.stepSize);
                    return this.changeDuty(newDuty);
                }
                break;

            case "minimum":
                if (this.hasDuty && this.isRunning) {
                    return this.changeDuty(this.minDuty);
                }
                break;

            case "maximum":
                if (this.hasDuty && this.isRunning) {
                    return this.changeDuty(this.maxDuty);
                }
                break;

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { Light: `${this.switches[0]}`, Action: "UnknownAction", Status: this.isRunning };
        }
    }

    changeDuty(newDuty) {
        if (this.hasDuty === false) return { entity_id: this.switches[0], action: "NoDutyCycle" };
        const clampedDuty = Math.max(this.minDuty, Math.min(this.maxDuty, newDuty));
        this.dutyCycle = clampedDuty;
        const entity = this.switches[0];
        node.warn(`${this.name}: Duty-Cycle geändert auf ${clampedDuty}%.`);
        return { entity_id: entity, action: "dutycycle", dutycycle: clampedDuty };
    }

    turnON() {
        const entity = this.switches[0];
        this.isRunning = true;
        node.warn(`${this.name}: Licht wurde eingeschaltet.`);
        return { entity_id: entity, action: "on" };
    }

    turnOFF() {
        const entity = this.switches[0];
        this.isRunning = false;
        node.warn(`${this.name}: Licht wurde ausgeschaltet.`);
        return { entity_id: entity, action: "off" };
    }
}

//NEED TO TEST THIS 
class Humidifier extends Device {
    constructor(name) {
        super(name, "humidifier");
        this.isRunning = false; // Status des Befeuchters
        this.currentHumidity = 0; // Aktueller Feuchtigkeitswert
        this.minHumidity = 30; // Standard-Mindestfeuchtigkeit
        this.maxHumidity = 70; // Standard-Maximalfeuchtigkeit
        this.stepSize = 5; // Schrittweite für Änderungen
    }

    init() {
        this.identifySwitchesAndSensors();
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        this.data = { ...this.data, ...data }; // Aktualisiere die Gerätedaten
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
    }

    evalAction() {
        return this.action !== "unchanged"; // Nur Änderung erforderlich, wenn Aktion nicht "unchanged" ist
    }

    runAction(context) {
        if (!this.needChange) {
            return { entity_id: this.switches[0], action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "off":
                return this.turnOFF(context);
            case "on":
                return this.turnON(context);
            case "maximum":
                return this.setHumidityLevel(context, this.maxHumidity);
            case "minimum":
                return this.setHumidityLevel(context, this.minHumidity);
            case "increased":
                return this.changeHumidity(context, this.stepSize);
            case "reduced":
                return this.changeHumidity(context, -this.stepSize);
            case "unchanged":
                return { entity_id: this.switches[0], action: "UNCHANGED" };
            default:
                node.warn(`${this.name}: Unbekannte Aktion "${this.action}".`);
                return { entity_id: this.switches[0], action: "Unknown Action" };
        }
    }

    turnON(context) {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            node.warn(`${this.name}: Luftbefeuchter eingeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "on" };
        }
        return { entity_id: entity, action: "Already ON" };
    }

    turnOFF(context) {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.name}: Luftbefeuchter ausgeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "off" };
        }
        return { entity_id: entity, action: "Already OFF" };
    }

    setHumidityLevel(context, level) {
        const entity = this.switches[0];
        this.currentHumidity = level;
        node.warn(`${this.name}: Luftfeuchtigkeit auf ${level}% gesetzt in ${this.inRoomName}`);
        return { entity_id: entity, action: "setHumidity", value: level };
    }

    changeHumidity(context, delta) {
        const entity = this.switches[0];
        const newHumidity = Math.max(
            this.minHumidity,
            Math.min(this.maxHumidity, this.currentHumidity + delta)
        );
        if (newHumidity === this.currentHumidity) {
            node.warn(`${this.name}: Luftfeuchtigkeit ist bereits auf Grenzwert (${this.currentHumidity}%) in ${this.inRoomName}`);
            return { entity_id: entity, action: "No Change" };
        }
        this.currentHumidity = newHumidity;
        node.warn(`${this.name}: Luftfeuchtigkeit geändert auf ${newHumidity}% in ${this.inRoomName}`);
        return { entity_id: entity, action: "setHumidity", value: newHumidity };
    }
}

class Dehumidifier extends Device {
    constructor(name) {
        super(name, "dehumidifier");
        this.isRunning = false; // Status des Luftentfeuchters
        this.currentHumidity = 0; // Aktueller Feuchtigkeitswert
        this.minHumidity = 30; // Standard-Mindestfeuchtigkeit
        this.maxHumidity = 70; // Standard-Maximalfeuchtigkeit
        this.stepSize = 5; // Schrittweite für Änderungen
    }

    init() {
        this.identifySwitchesAndSensors();
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        this.data = { ...this.data, ...data }; // Aktualisiere die Gerätedaten
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
    }

    evalAction() {
        return this.action !== "unchanged"; // Nur Änderung erforderlich, wenn Aktion nicht "unchanged" ist
    }

    runAction(context) {
        if (!this.needChange) {
            return { entity_id: this.switches[0], action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "off":
                return this.turnOFF(context);
            case "on":
                return this.turnON(context);
            case "maximum":
                return this.setHumidityLevel(context, this.maxHumidity);
            case "minimum":
                return this.setHumidityLevel(context, this.minHumidity);
            case "increased":
                return this.changeHumidity(context, this.stepSize);
            case "reduced":
                return this.changeHumidity(context, -this.stepSize);
            case "unchanged":
                return { entity_id: this.switches[0], action: "UNCHANGED" };
            default:
                node.warn(`${this.name}: Unbekannte Aktion "${this.action}".`);
                return { entity_id: this.switches[0], action: "Unknown Action" };
        }
    }

    turnON(context) {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            node.warn(`${this.name}: Luftentfeuchter eingeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "on" };
        }
        return { entity_id: entity, action: "Already ON" };
    }

    turnOFF(context) {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.name}: Luftentfeuchter ausgeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "off" };
        }
        return { entity_id: entity, action: "Already OFF" };
    }

    setHumidityLevel(context, level) {
        const entity = this.switches[0];
        this.currentHumidity = level;
        node.warn(`${this.name}: Luftfeuchtigkeit auf ${level}% gesetzt in ${this.inRoomName}`);
        return { entity_id: entity, action: "setHumidity", value: level };
    }

    changeHumidity(context, delta) {
        const entity = this.switches[0];
        const newHumidity = Math.max(
            this.minHumidity,
            Math.min(this.maxHumidity, this.currentHumidity + delta)
        );
        if (newHumidity === this.currentHumidity) {
            node.warn(`${this.name}: Luftfeuchtigkeit ist bereits auf Grenzwert (${this.currentHumidity}%) in ${this.inRoomName}`);
            return { entity_id: entity, action: "No Change" };
        }
        this.currentHumidity = newHumidity;
        node.warn(`${this.name}: Luftfeuchtigkeit geändert auf ${newHumidity}% in ${this.inRoomName}`);
        return { entity_id: entity, action: "setHumidity", value: newHumidity };
    }
}

class Heater extends Device {
    constructor(name) {
        super(name, "heater");
        this.minTemp = 0; // Minimale Temperatur
        this.maxTemp = 0; // Maximale Temperatur
        this.currentTemp = null; // Aktuelle Temperatur
    }

    init() {
        // Initialisierungslogik, falls erforderlich
    }

    setTemps(minTemp, maxTemp) {
        this.minTemp = minTemp;
        this.maxTemp = maxTemp;
        node.warn(`${this.name}: Temperaturbereich gesetzt auf ${minTemp}°C - ${maxTemp}°C.`);
    }

    getTemperatureRange() {
        return { minTemp: this.minTemp, maxTemp: this.maxTemp };
    }

    evalAction(context) {
        if (this.action === "unchanged") {
            return false; // Keine Aktion erforderlich
        }
        return true; // Standardmäßig erlauben
    }

    runAction(context) {
        if (!this.evalAction(context)) {
            return { Heater: `${this.name}`, Action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "on":
                node.warn(`${this.name}: Heizung wird eingeschaltet.`);
                return { entity_id: this.switches[0], action: "on" };

            case "off":
                node.warn(`${this.name}: Heizung wird ausgeschaltet.`);
                return { entity_id: this.switches[0], action: "off" };

            case "maximum":
                node.warn(`${this.name}: Heizung wird auf maximale Temperatur ${this.maxTemp}°C eingestellt.`);
                return { entity_id: this.switches[0], action: "setTemp", temperature: this.maxTemp };

            case "minimum":
                node.warn(`${this.name}: Heizung wird auf minimale Temperatur ${this.minTemp}°C eingestellt.`);
                return { entity_id: this.switches[0], action: "setTemp", temperature: this.minTemp };

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { Heater: `${this.name}`, Action: "UnknownAction" };
        }
    }
}

class Cooler extends Device {
    constructor(name) {
        super(name, "cooler");
        this.minTemp = 0; // Minimale Temperatur
        this.maxTemp = 0; // Maximale Temperatur
        this.currentTemp = null; // Aktuelle Temperatur
    }

    init() {
        // Initialisierungslogik, falls erforderlich
    }

    setTemps(minTemp, maxTemp) {
        this.minTemp = minTemp;
        this.maxTemp = maxTemp;
        node.warn(`${this.name}: Temperaturbereich gesetzt auf ${minTemp}°C - ${maxTemp}°C.`);
    }

    getTemperatureRange() {
        return { minTemp: this.minTemp, maxTemp: this.maxTemp };
    }

    evalAction(context) {
        if (this.action === "unchanged") {
            return false; // Keine Aktion erforderlich
        }
        return true; // Standardmäßig erlauben
    }

    runAction(context) {
        if (!this.evalAction(context)) {
            return { Cooler: `${this.name}`, Action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "on":
                node.warn(`${this.name}: Kühlung wird eingeschaltet.`);
                return { entity_id: this.switches[0], action: "on" };

            case "off":
                node.warn(`${this.name}: Kühlung wird ausgeschaltet.`);
                return { entity_id: this.switches[0], action: "off" };

            case "maximum":
                node.warn(`${this.name}: Kühlung wird auf maximale Temperatur ${this.maxTemp}°C eingestellt.`);
                return { entity_id: this.switches[0], action: "setTemp", temperature: this.maxTemp };

            case "minimum":
                node.warn(`${this.name}: Kühlung wird auf minimale Temperatur ${this.minTemp}°C eingestellt.`);
                return { entity_id: this.switches[0], action: "setTemp", temperature: this.minTemp };

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { Cooler: `${this.name}`, Action: "UnknownAction" };
        }
    }
}

class CO2 extends Device {
    constructor(name) {
        super(name, "co2"); // Setze den Gerätetyp auf "co2"
        this.targetCO2 = 0; // Zielwert für CO2 (ppm)
        this.currentCO2 = 0; // Aktueller CO2-Wert (ppm)
        this.autoRegulate = false; // Automatische Steuerung
    }

    init() {
        // Initialisierungen, falls notwendig
    }

    setTargetCO2(target) {
        this.targetCO2 = target;
    }

    enableAutoRegulation() {
        this.autoRegulate = true;
    }

    disableAutoRegulation() {
        this.autoRegulate = false;
    }

    updateCurrentCO2(value) {
        this.currentCO2 = value;
    }

    evalAction(context) {
        if (this.action === "unchanged") return false;

        if (this.autoRegulate && this.currentCO2 < this.targetCO2) {
            this.action = "increase";
            return true;
        } else if (this.autoRegulate && this.currentCO2 > this.targetCO2) {
            this.action = "decrease";
            return true;
        }

        return this.action !== "unchanged";
    }

    runAction(context) {
        if (!this.evalAction(context)) {
            return { CO2: `${this.name}`, Action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "increase":
                node.warn(`${this.name}: CO2-Zufuhr wird erhöht.`);
                return { entity_id: this.switches[0], action: "on" };

            case "decrease":
                node.warn(`${this.name}: CO2-Zufuhr wird gestoppt.`);
                return { entity_id: this.switches[0], action: "off" };

            case "on":
                node.warn(`${this.name}: CO2-Zufuhr wird aktiviert.`);
                return { entity_id: this.switches[0], action: "on" };

            case "off":
                node.warn(`${this.name}: CO2-Zufuhr wird deaktiviert.`);
                return { entity_id: this.switches[0], action: "off" };

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { CO2: `${this.name}`, Action: "UnknownAction" };
        }
    }
}

class Pump extends Device {
    constructor(name) {
        super(name, "pump");
        this.pumpInterval = 0; // Mindestintervall zwischen Pumpzyklen
        this.pumpDuration = 0; // Pumpdauer in Sekunden
        this.isAutoRun = false; // Automatikmodus
        this.lastPumpTime = null; // Zeitpunkt des letzten Pumpvorgangs
        this.evaluateStateFromData()
    }

    setData(data, context) {
        this.setFromtent(context.tentName)
        this.identifyIfFromAmbient()
        this.data = { ...this.data, ...data };
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.evaluateStateFromData();
    }


    evaluateStateFromData() {
        if (this.data) {
            // Dynamisch Pump-Status suchen
            const pumpOnKey = Object.keys(this.data).find(key => key.includes("pump_on"));
            const autoRunKey = Object.keys(this.data).find(key => key.includes("pump_autorun"));

            if (pumpOnKey) {
                this.isRunning = this.data[pumpOnKey] === "on";
            }

            if (autoRunKey) {
                this.isAutoRun = this.data[autoRunKey] === "on";
            }

            // Dynamisch Pump-Duration suchen
            const pumpDurationKey = Object.keys(this.data).find(key => key.includes("pump_watteringduration"));
            if (pumpDurationKey) {
                this.pumpDuration = parseInt(this.data[pumpDurationKey], 10) || 0;
            }

            // Dynamisch Pump-Intervall suchen
            const pumpIntervalKey = Object.keys(this.data).find(key => key.includes("pump_hours"));
            if (pumpIntervalKey) {
                this.minPumpInterval = parseInt(this.data[pumpIntervalKey], 10) * 3600 || 0;
            }
        }
    }

    evalAction(context) {
        if (this.action === "unchanged") {
            return false; // Keine Aktion erforderlich
        }
        return true; // Standardmäßig erlauben
    }

    runAction(context) {
        if (!this.evalAction(context)) {
            return { Pump: `${this.name}`, Action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "on":
                if (!this.isRunning) {
                    this.isRunning = true;
                    this.lastPumpTime = new Date();
                    node.warn(`${this.name}: Pumpe wird eingeschaltet.`);
                    return { entity_id: this.switches[0], action: "on" };
                } else {
                    node.warn(`${this.name}: Pumpe ist bereits eingeschaltet.`);
                    return { entity_id: this.switches[0], action: "Already ON" };
                }

            case "off":
                if (this.isRunning) {
                    this.isRunning = false;
                    node.warn(`${this.name}: Pumpe wird ausgeschaltet.`);
                    return { entity_id: this.switches[0], action: "off" };
                } else {
                    node.warn(`${this.name}: Pumpe ist bereits ausgeschaltet.`);
                    return { entity_id: this.switches[0], action: "Already OFF" };
                }

            case "autorun-on":
                if (!this.isAutoRun) {
                    this.isAutoRun = true;
                    node.warn(`${this.name}: Automatikmodus wird aktiviert.`);
                    return { entity_id: this.switches[1], action: "on" };
                } else {
                    node.warn(`${this.name}: Automatikmodus ist bereits aktiv.`);
                    return { entity_id: this.switches[1], action: "Already ON" };
                }

            case "autorun-off":
                if (this.isAutoRun) {
                    this.isAutoRun = false;
                    node.warn(`${this.name}: Automatikmodus wird deaktiviert.`);
                    return { entity_id: this.switches[1], action: "off" };
                } else {
                    node.warn(`${this.name}: Automatikmodus ist bereits deaktiviert.`);
                    return { entity_id: this.switches[1], action: "Already OFF" };
                }

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { Pump: `${this.name}`, Action: "UnknownAction" };
        }
    }

    canPumpNow() {
        if (!this.lastPumpTime || isNaN(this.lastPumpTime.getTime())) {
            return true; // Noch keine Pumplogik ausgeführt
        }

        const now = new Date();
        const elapsedTime = (now.getTime() - this.lastPumpTime.getTime()) / 1000; // Zeit seit dem letzten Pumpvorgang in Sekunden

        return elapsedTime >= this.minPumpInterval;
    }
}

class GenericSwitch extends Device {
    constructor(name) {
        super(name, "switch"); // Setze den Gerätetyp auf "switch"
        this.isRunning = false; // Status des Schalters
    }

    init() {
        // Initialisierungen, falls notwendig
    }

    evalAction(context) {
        if (this.action === "unchanged") {
            return false; // Keine Aktion erforderlich
        }
        return true; // Standardmäßig erlauben
    }

    runAction(context) {
        if (!this.evalAction(context)) {
            return { Switch: `${this.name}`, Action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "on":
                if (!this.isRunning) {
                    this.isRunning = true;
                    node.warn(`${this.name}: Switch wird eingeschaltet.`);
                    return { entity_id: this.switches[0], action: "on" };
                } else {
                    node.warn(`${this.name}: Switch ist bereits eingeschaltet.`);
                    return { entity_id: this.switches[0], action: "Already ON" };
                }

            case "off":
                if (this.isRunning) {
                    this.isRunning = false;
                    node.warn(`${this.name}: Switch wird ausgeschaltet.`);
                    return { entity_id: this.switches[0], action: "off" };
                } else {
                    node.warn(`${this.name}: Switch ist bereits ausgeschaltet.`);
                    return { entity_id: this.switches[0], action: "Already OFF" };
                }

            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { Switch: `${this.name}`, Action: "UnknownAction" };
        }
    }
}
//// UNTIL HERE

class Sensor extends Device {
    constructor(name) {
        super(name, "sensor");
        this.readings = []; // Speichert Sensordaten
    }

    init() { }
    evalAction(context) {
        // Generische Prüfungen für alle Geräte
        if (this.action === "unchanged") {
            return false; // Keine Aktion erforderlich
        }

        return true; // Standardmäßig erlauben
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
