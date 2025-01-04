class OpenGrowBox {
    constructor(tentName = "", plantStage = "", tentMode = "", perfectionTolerance = 0.025) {

        // Tent Environment        
        this.tentName = tentName;
        this.tentMode = tentMode;
        this.plantStage = plantStage;
        this.controlSet = "";

        this.devices = [];
        this.ownDeviceList = []
        
        this.needchange = false
        this.previousActions = [];
        this.previousPIDActions = [];
        
        this.controls = {
            pidControl: false,
            ownWeights: false,
            weights: {
                temp: null,
                hum: null,
                defaultValue:1,
            },
            co2Control: false,
            co2ppm: {
                minPPM: 400,
                maxPPM: 1200,
            },
            ownDeviceSetup: false,
            experimental: false,
            modes: {
                vpdPerfection: "VPD Perfection",
                inRangeVPD: "IN-VPD-Range",
                targetedVDP: "Targeted VPD",
                drying: "Drying",
                experimentel: "Experimentel",
                disabled: "Disabled"
            }
        }

        this.expMods = {
            current: "",
            plantType: "",
        }

        this.isPlantDay = {
            nightVPDHold: false,
            lightOn: false,
            lightOnTime: "",
            lightOffTime: "",
            lightbyOGBControl: false,
            sunRiseTimes: "",
            sunSetTimes: "",
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
            co2Level: 400,
        };

        this.plantStages = {
            Germination: { vpdRange: [0.412, 0.7], minTemp: 20, maxTemp: 26, minHumidity: 65, maxHumidity: 80 },
            Clones: { vpdRange: [0.42, 0.75], minTemp: 20, maxTemp: 26, minHumidity: 65, maxHumidity: 80 },
            EarlyVeg: { vpdRange: [0.7, 0.85], minTemp: 20, maxTemp: 28, minHumidity: 55, maxHumidity: 70 },
            MidVeg: { vpdRange: [0.85, 1.1], minTemp: 20, maxTemp: 30, minHumidity: 50, maxHumidity: 65 },
            LateVeg: { vpdRange: [0.933, 1.2], minTemp: 20, maxTemp: 30, minHumidity: 50, maxHumidity: 60 },
            EarlyFlower: { vpdRange: [1.0, 1.25], minTemp: 22, maxTemp: 28, minHumidity: 45, maxHumidity: 60 },
            MidFlower: { vpdRange: [1.1, 1.4], minTemp: 22, maxTemp: 26, minHumidity: 40, maxHumidity: 55 },
            LateFlower: { vpdRange: [1.3, 1.7], minTemp: 20, maxTemp: 24, minHumidity: 40, maxHumidity: 50 }
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
            ecotarget: [0.55, 0.88],
            lightControl:false,
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
            isEnabled: false,
            isRunning: false,
            waterActivity: 0.0,
            dewpointVPD: 0.0,
            vaporPressureActual: 0.0,
            vaporPressureSaturation: 0.0,
            sharkMouseVPD: 0.0,
            modes: {
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
                SharkMouse: {
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

        this.addons = {
            GasLanternRoutine: {
                Veg: {
                    LightOnPhase: 12,
                    LightOffPhase: 5,
                    LightAddon: 1,
                },
                Flower: {
                    Sativa: {
                        LightOnPhase: 8,
                        LightOffPhase: 16,
                    },
                    Indica: {
                        LightOnPhase: 6,
                        LightOffPhase: 18,
                    }
                }
            },
            GLR_NaturalSunshine: {
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
                        LightSteps: 0,
                        LightStepTime: 0,

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
                light: this.vpd.lightControl ? "increased" : "unchanged",
                co2: "increased",
                climate: {
                    cool: "reduced",
                    dry: "increased",
                    heat: "unchanged",
                }
            },
            Reduced: {
                exhaust: "reduced",
                humidifier: "increased",
                dehumidifier: "reduced",
                heater: "reduced",
                cooler: "increased",
                ventilation: "reduced",
                light: this.vpd.lightControl ? "reduced" : "unchanged",
                co2: "reduced",
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
        this.PIDAdjustments = {}
        this.pid = {
            temp:{
                proportionalFaktor: 0.1,
                integralFaktor: 0.01,
                derivativFaktor: 0.1,
            },
            hum:{
                proportionalFaktor: 5.0,
                integralFaktor: 0.02,
                derivativFaktor: 0.1,
            },
            vpd:{
                proportionalFaktor: 5.0,
                integralFaktor: 0.05,
                derivativFaktor: 0.5,
            },
            co2:{
                proportionalFaktor: 10.0,
                integralFaktor: 0.1,
                derivativFaktor: 0.1,
            }

        }

        this.init();
    }

    init() {
        this.initPIDControllers()
    }

    initPIDControllers() {
        console.log("Initialisiere PID-Controller mit Werten:");
        console.log(`Temp Min: ${this.tentData.minTemp}, Temp Max: ${this.tentData.maxTemp}`);
        console.log(`VPD Min: ${this.getVPDRangeForMode().minVPD}, VPD Max: ${this.getVPDRangeForMode().maxVPD}`);

        this.tempPID = new OGBPIDController(
            "tempPID",
            parseFloat(this.pid.temp.proportionalFaktor),
            parseFloat(this.pid.temp.integralFaktor),
            parseFloat(this.pid.temp.derivativFaktor),
            parseFloat(this.tentData.minTemp),
            parseFloat(this.tentData.maxTemp),            
        );

        this.humPID = new OGBPIDController(
            "humPID",
            parseFloat(this.pid.hum.proportionalFaktor),
            parseFloat(this.pid.hum.integralFaktor),
            parseFloat(this.pid.hum.derivativFaktor),
            parseFloat(this.tentData.minHumidity),
            parseFloat(this.tentData.maxHumidity),
        );

        const { minVPD, maxVPD } = this.getVPDRangeForMode();

        this.vpdPID = new OGBPIDController(
            "vpdPID",
            parseFloat(this.pid.vpd.proportionalFaktor),
            parseFloat(this.pid.vpd.integralFaktor),
            parseFloat(this.pid.vpd.derivativFaktor),
            parseFloat(minVPD),
            parseFloat(maxVPD),
        );
        this.co2PID = new OGBPIDController(
            "co2PID",
            parseFloat(this.pid.co2.proportionalFaktor),
            parseFloat(this.pid.co2.integralFaktor),
            parseFloat(this.pid.co2.derivativFaktor),
            parseFloat(this.controls.co2ppm.minPPM),
            parseFloat(this.controls.co2ppm.maxPPM),  
        )

        console.log("PID-Controller erfolgreich initialisiert.");
    }

    updatePIDControllers() {
        // Dynamische Min- und Max-Werte für VPD basierend auf dem Modus
        const { minVPD, maxVPD } = this.getVPDRangeForMode();

        // Temperatur-PID aktualisieren
        this.tempPID.minValue = this.tentData.minTemp;
        this.tempPID.maxValue = this.tentData.maxTemp;
        this.tempPID.integral = 0; // Reset Integral
        this.tempPID.prevError = 0; // Reset Fehler

        // Feuchtigkeits-PID aktualisieren
        this.humPID.minValue = this.tentData.minHumidity;
        this.humPID.maxValue = this.tentData.maxHumidity;
        this.humPID.integral = 0; // Reset Integral
        this.humPID.prevError = 0; // Reset Fehler

        // VPD-PID aktualisieren
        this.vpdPID.minValue = minVPD;
        this.vpdPID.maxValue = maxVPD;
        this.vpdPID.integral = 0; // Reset Integral
        this.vpdPID.prevError = 0; // Reset Fehler

        console.log("PID-Controller wurden aktualisiert mit neuen Werten.");
    }

    generateActionsFromPID(tempAdjustment, humAdjustment, vpdAdjustment, lightVPDControl) {
        const actions = {
            exhaust: "unchanged",
            humidifier: "unchanged",
            dehumidifier: "unchanged",
            heater: "unchanged",
            cooler: "unchanged",
            ventilation: "unchanged",
            light: "unchanged",
            climate: {
                cool: "unchanged",
                heat: "unchanged",
                dry: "unchanged",
            },
        };

        // Temperaturaktionen
        if (tempAdjustment > 0) {
            actions.heater = "reduced";
            actions.cooler = "increased";
            actions.climate.cool = "increased";
            actions.climate.heat = "reduced";
        } else if (tempAdjustment < 0) {
            actions.climate.heat = "increased";
            actions.climate.cool = "reduced"; 
            actions.cooler = "reduced";
            actions.heater = "increased";
        } else {
            actions.cooler = "unchanged";
            actions.heater = "unchanged";
            actions.climate.cool = "unchanged";
            actions.climate.heat = "unchanged";
        }

        // Feuchtigkeitsaktionen
        if (humAdjustment > 0) {
            actions.dehumidifier = "increased";
            actions.climate.dry = "increased";
            actions.humidifier = "reduced";
        } else if (humAdjustment < 0) {
            actions.humidifier = "increased";
            actions.climate.dry = "reduced";
            actions.dehumidifier = "reduced";
        } else {
            actions.dehumidifier = "unchanged";
            actions.humidifier = "unchanged";
            actions.climate.dry = "unchanged";
        }

        // VPD-Aktionen
        if (vpdAdjustment > 0) {
            actions.exhaust = "increased";
            actions.ventilation = "increased";
            actions.dehumidifier = "reduced";
        } else if (vpdAdjustment < 0) {
            actions.exhaust = "reduced";
            actions.ventilation = "reduced";
            actions.humidifier = "increased";
        } else {
            actions.exhaust = "unchanged";
            actions.ventilation = "unchanged";
        }

        // Lichtsteuerung basierend auf VPD-Control
        if (lightVPDControl) {
            if (vpdAdjustment > 0) {
                actions.light = "reduced";
            } else if (vpdAdjustment < 0) {
                actions.light = "increased";
            } else {
                actions.light = "unchanged";
            }
        } else {
            actions.light = "unchanged"; // Kein VPD-Kontrollmodus aktiv
        }

        return actions;
    }

    getVPDRangeForMode() {
            let minVPD, maxVPD;

            switch (this.tentMode) {
                case "IN-VPD-Range":
                    // Nutzt die rangeVPD-Werte
                    minVPD = this.vpd.range[0];
                    maxVPD = this.vpd.range[1];
                    break;

                case "VPD Perfection":
                    // Nutzt die perfekt min und perfekt max Werte
                    minVPD = this.vpd.perfectMin;
                    maxVPD = this.vpd.perfectMax;
                    break;

                case "Targeted VPD":
                    // Nutzt die targeted Tolerance für Min und Max
                    minVPD = this.vpd.targeted - this.vpd.targetedTolerance;
                    maxVPD = this.vpd.targeted + this.vpd.targetedTolerance;
                    break;

                default:
                    // Fallback: Nutzt Standardwerte
                    minVPD = this.vpd.range[0];
                    maxVPD = this.vpd.range[1];
                    break;
            }

            return { minVPD, maxVPD };
    }

    checkCurrentVPD() {
        const { minVPD, maxVPD } = this.getVPDRangeForMode();

        if (this.vpd.current < minVPD) {
            console.log(`VPD zu niedrig: ${this.vpd.current} < ${minVPD}`);
            return "increased";
        } else if (this.vpd.current > maxVPD) {
            console.log(`VPD zu hoch: ${this.vpd.current} > ${maxVPD}`);
            return "reduced";
        } else {
            console.log(`VPD innerhalb des Bereichs: ${minVPD} <= ${this.vpd.current} <= ${maxVPD}`);
            return "unchanged";
        }
    }

    adjustDevices(vpdAdjustment, tempAdjustment, humAdjustment, lightVPDControl) {
        // Generiere Aktionen basierend auf PID
        const actions = this.generateActionsFromPID(tempAdjustment, humAdjustment, vpdAdjustment, lightVPDControl);

        // Aktionen für alle Geräte sammeln
        const allActions = [];

        this.devices.forEach((device) => {
            if (device.deviceType in actions) {
                const deviceAction = {
                    device: device.name,
                    type: device.deviceType,
                    action: actions[device.deviceType],
                };
                allActions.push(deviceAction);
            }

            // Spezielle Behandlung für "climate" Subtypen (cool, heat, dry)
            if (device.deviceType === "climate" && device.deviceSubtype in actions.climate) {
                const climateAction = {
                    device: device.name,
                    type: `climate.${device.deviceSubtype}`,
                    action: actions.climate[device.deviceSubtype],
                };
                allActions.push(climateAction);
            }
        });

        return allActions;
    }

    increaseCooling(adjustment) {
        const cooler = this.devices.find(device => device.deviceType === "cooler");
        if (cooler) {
            cooler.action = "increased";
            node.warn(`Cooling increased by ${adjustment}`);
            return { device: cooler.name, action: "increased", adjustment };
        }
    }

    increaseHeating(adjustment) {
        const heater = this.devices.find(device => device.deviceType === "heater");
        if (heater) {
            heater.action = "increased";
            node.warn(`Heating increased by ${adjustment}`);
            return { device: heater.name, action: "increased", adjustment};
        }
    }

    increaseDehumidifying(adjustment) {
        const dehumidifier = this.devices.find(device => device.deviceType === "dehumidifier");
        if (dehumidifier) {
            dehumidifier.action = "increased";
            node.warn(`Dehumidifying increased by ${adjustment}`);
            return { device: dehumidifier.name, action: "increased", adjustment};
        }
    }

    increaseHumidifying(adjustment) {
        const humidifier = this.devices.find(device => device.deviceType === "humidifier");
        if (humidifier) {
            humidifier.action = "increased";
            node.warn(`Humidifying increased by ${adjustment}`);
            return { device: humidifier.name, action: "increased", adjustment};
        }
    }

    // Setze PID COntroll / default deaktivert
    setPIDControl(pidControl) {
        if (pidControl !== this.controls.pidControl) {
            this.controls.pidControl = this.helperYesTrue(pidControl);
            if(this.controls.pidControl){
                this.updatePIDControllers();
            }
        }
    }

    // aktuler pid control
    getPIDControl() {
        return this.helperYesTrue(this.controls.pidControl)
    }

    // PID VPD
    setProportionalVPDFactor(vpdFactor) {
        if (vpdFactor !== undefined && vpdFactor !== null) {
            if (parseFloat(vpdFactor) !== this.pid.vpd.proportionalFaktor) {
                this.pid.vpd.proportionalFaktor = parseFloat(vpdFactor);
                node.warn(`VPD-Proportionalfaktor gesetzt auf: ${this.pid.vpd.proportionalFaktor}`);
                this.vpdPID.updateProportional(this.pid.vpd.proportionalFaktor)
                this.updatePIDControllers();
            }
        }
    }

    getProportionalVPDFactor() {
        return this.pid.vpd.proportionalFaktor;
    }

    setIntegralVPDFactor(vpdFactor) {
        if (vpdFactor !== undefined && vpdFactor !== null) {
            if (parseFloat(vpdFactor) !== this.pid.vpd.integralFaktor) {
                this.pid.vpd.integralFaktor = parseFloat(vpdFactor);
                node.warn(`VPD-Integralfaktor gesetzt auf: ${this.pid.vpd.integralFaktor}`);
                this.vpdPID.updateIntegral(this.pid.vpd.integralFaktor)
                this.updatePIDControllers();
            }
        }
    }

    getIntegralVPDFactor() {
        return this.pid.vpd.integralFaktor;
    }

    setDerivativVPDFactor(vpdFactor) {
        if (vpdFactor !== undefined && vpdFactor !== null) {
            if (parseFloat(vpdFactor) !== this.pid.vpd.derivativFaktor) {
                this.pid.vpd.derivativFaktor = parseFloat(vpdFactor);
                node.warn(`VPD-Derivativfaktor gesetzt auf: ${this.pid.vpd.derivativFaktor}`);
                this.vpdPID.updateDerivative(this.pid.vpd.derivativFaktor)
                this.updatePIDControllers();
            }
        }
    }

    getDerivativVPDFactor() {
        return this.pid.vpd.derivativFaktor;
    }

    // P.I.D Temp
    setProportionalTempFactor(tempFactor) {
        if (tempFactor !== undefined && tempFactor !== null) {
            if (parseFloat(tempFactor) !== this.pid.temp.proportionalFaktor) {
                this.pid.temp.proportionalFaktor = parseFloat(tempFactor);
                node.warn(`Temperatur-Proportionalfaktor gesetzt auf: ${this.pid.temp.proportionalFaktor}`);
                this.tempPID.updateProportional(this.pid.temp.proportionalFaktor)
                this.updatePIDControllers();
            }
        }
    }

    getProportionalTempFactor() {
        return this.pid.temp.proportionalFaktor;
    }

    setIntegralTempFactor(tempFactor) {
        if (tempFactor !== undefined && tempFactor !== null) {
            if (parseFloat(tempFactor) !== this.pid.temp.integralFaktor) {
                this.pid.temp.integralFaktor = parseFloat(tempFactor);
                node.warn(`Temperatur-Integralfaktor gesetzt auf: ${this.pid.temp.integralFaktor}`);
                this.tempPID.updateIntegral(this.pid.temp.integralFaktor)
                this.updatePIDControllers();
            }
        }
    }

    getIntegralTempFactor() {
        return this.pid.temp.integralFaktor;
    }

    setDerivativTempFactor(tempFactor) {
        if (tempFactor !== undefined && tempFactor !== null) {
            if (parseFloat(tempFactor) !== this.pid.temp.derivativFaktor) {
                this.pid.temp.derivativFaktor = parseFloat(tempFactor);
                node.warn(`Temperatur-Derivativfaktor gesetzt auf: ${this.pid.temp.derivativFaktor}`);
                this.tempPID.updateDerivative(this.pid.temp.derivativFaktor)
                this.updatePIDControllers();
            }
        }
    }

    getDerivativTempFactor() {
        return this.pid.temp.derivativFaktor;
    }

    // P.I.D Humidity
    setProportionalHumidityFactor(humidityFactor) {
        if (humidityFactor !== undefined && humidityFactor !== null) {
            if (parseFloat(humidityFactor) !== this.pid.hum.proportionalFaktor) {
                this.pid.hum.proportionalFaktor = parseFloat(humidityFactor);
                node.warn(`Feuchtigkeits-Proportionalfaktor gesetzt auf: ${this.pid.hum.proportionalFaktor}`);
                this.humPID.updateProportional(this.pid.hum.proportionalFaktor)
                this.updatePIDControllers();
            }
        }
    }

    getProportionalHumidityFactor() {
        return this.pid.hum.proportionalFaktor;
    }

    setIntegralHumidityFactor(humidityFactor) {
        if (humidityFactor !== undefined && humidityFactor !== null) {
            if (parseFloat(humidityFactor) !== this.pid.hum.integralFaktor) {
                this.pid.hum.integralFaktor = parseFloat(humidityFactor);
                node.warn(`Feuchtigkeits-Integralfaktor gesetzt auf: ${this.pid.hum.integralFaktor}`);
                this.humPID.updateIntegral(this.pid.hum.integralFaktor)
                this.updatePIDControllers();
            }
        }
    }

    getIntegralHumidityFactor() {
        return this.pid.hum.integralFaktor;
    }

    setDerivativHumidityFactor(humidityFactor) {
        if (humidityFactor !== undefined && humidityFactor !== null) {
            if (parseFloat(humidityFactor) !== this.pid.hum.derivativFaktor) {
                this.pid.hum.derivativFaktor = parseFloat(humidityFactor);
                node.warn(`Feuchtigkeits-Derivativfaktor gesetzt auf: ${this.pid.hum.derivativFaktor}`);
                this.humPID.updateDerivative(this.pid.hum.derivativFaktor)
                this.updatePIDControllers();
            }
        }
    }

    getDerivativHumidityFactor() {
        return this.pid.hum.derivativFaktor;
    }

    // DATA SETTER/GETTER ******************************
    setTentName(tentName = "") {
        if (tentName !== this.tentName) {
            this.tentName = tentName;
        }

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
        if (this.tentMode !== tentMode) {
            console.warn(`TentMode geändert von ${this.tentMode} auf ${tentMode} in ${this.tentName}`);

            if (tentMode !== "Drying") {
                this.drying.isRunning = false;
                this.drying.isEnabled = false;
                this.drying.currentDryMode = "";
                this.dryStartTime = null;
                console.warn("Drying-Modus deaktiviert und Timer zurückgesetzt.");
            }

            this.tentMode = tentMode;

            // PID-Controller aktualisieren
            this.updatePIDControllers();
        }
    }

    getTentMode() {
        return this.tentMode
    }

    // Setze Targeted VPD wenn Mode aktiv!
    setTargetedVPD(targetVPD) {
        if (targetVPD !== this.vpd.targeted) {
            if (this.tentMode === "Targeted VPD") {
                this.vpd.targeted = parseFloat(targetVPD)
            }
        }
    }

    // Ehalte Targeted VPD wenn Mode aktiv!
    getTargetedVPD() {
        return parseFloat(this.vpd.targeted);
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
            this.plantStage = plantStage;

            // PID-Controller aktualisieren
            this.updatePIDControllers();
        } else {
            console.warn(`Ungültige PlantStage: ${plantStage}`);
        }
    }

    getPlantStageValue() {
        return this.plantStage
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
        if (parseFloat(offset) !== parseFloat(this.tentData.leafTempOffset)) {
            this.tentData.leafTempOffset = parseFloat(offset)
        }
    }

    getLeafOffset() {
        return this.tentData.leafTempOffset
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
        if (dewpoint !== this.tentData.dewpoint) {
            this.tentData.dewpoint = this.calculateDewPoint(dewpoint)
        }
    }

    // Aktiviere Nacht VPD Ignoranz
    setVPDNightHold(nightHold) {
        if (nightHold != this.helperYesTrue(this.isPlantDay.nightVPDHold)) {
            this.isPlantDay.nightVPDHold = this.helperYesTrue(nightHold)
        }
    }

    getVPDNightHold() {
        return this.helperYesTrue(this.isPlantDay.nightVPDHold)
    }

    // Aktiviere Gewicht für Feinjustierung
    activateOwnWeights(activ) {
        if (activ !== this.controls.ownWeights) {
            this.controls.ownWeights = this.helperYesTrue(activ)
            if (!this.controls.ownWeights) {
                this.controls.weights.temp = null
                this.controls.weights.hum = null
            }
        }
    }

    // Erhatel Gewicht Aktivi Status
    getifOwnWeightsActive() {
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
    setGLSControl(glscControl) {
        if (glscControl !== this.controls.experimental) {
            this.controls.experimental = this.helperYesTrue(glscControl)
        }
    }

    // EXPRIMENTEL
    getGLSControl() {
        return this.helperYesTrue(this.controls.experimental)
    }

    // EXPRIMENTEL
    setGLSPlantType(plantType) {
        if (this.controls.experimental) {
            if (plantType !== this.controls.experimental) {
                this.expMods.plantType = plantType
            }
        } else {
            if (this.expMods.plantType != "") {
                this.expMods.plantType = ""

            }

        }

    }
    // EXPRIMENTEL
    // EXPRIMENTEL
    getGLSPlantType() {
        return this.expMods.plantType
    }

    // EXPRIMENTEL


    // Aktiviere CO2 Steuerung
    setCO2Control(co2Control) {
        if (co2Control !== this.controls.co2Control) {
            this.controls.co2Control = this.helperYesTrue(co2Control)
        }
    }

    // COS Status
    getCO2Control() {
        return this.helperYesTrue(this.controls.co2Control)
    }

    // Aktiviere Kontorlle für Licht
    setLightControlByOGB(wantsControl) {
        if (wantsControl !== this.isPlantDay.lightbyOGBControl) {
            this.isPlantDay.lightbyOGBControl = this.helperYesTrue(wantsControl)
        }
    }

    // Licht Controll Status
    getLightControlByOGB() {
        return this.helperYesTrue(this.isPlantDay.lightbyOGBControl)
    }

    // LICHT steuerung mit VPD //DEFAULT AUS
    setVPDLightControl(lightControl) {
        if (lightControl !== this.vpd.lightControl) {
            this.vpd.lightControl = this.helperYesTrue(lightControl);

            // Trigger: Update des Lichtstatus
            this.evaluateLightVPDControl();
        }
    }
    // AKTULER CONTROLLE STATUS
    getVPDLightControl(){
        return this.helperYesTrue(this.vpd.lightControl)  
    }

    // Setze lichtzeiten wenn Kontrolle AKTIV 
    setLightTimes(startTime = "", endTime = "") {
        if (!this.isPlantDay.lightbyOGBControl) return
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

    evaluateLightVPDControl() {
        // Prüfen, ob Licht an oder aus ist
        const vpdLightControl = this.vpd.lightControl;

        // Status basierend auf Lichtbedingung setzen
        if (vpdLightControl) {
            this.actions.Increased.light = "increased";
            this.actions.Reduced.light = "reduced";
        } else {
            this.actions.Reduced.light = "unchanged"; 
            this.actions.Increased.light = "unchanged"; 
        }
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
            // Evaluieren des Lichtstatus
            this.evaluateLightVPDControl();
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

    // Aktiviere Eigene Geräte Steuerung(Experimentel"NOT-DONE")
    setOwnDeviceSetup(deviceControl) {
        const isActivated = this.helperYesTrue(deviceControl);

        if (isActivated !== this.controls.ownDeviceSetup) {
            this.controls.ownDeviceSetup = isActivated;

            // Wenn `ownDeviceSetup` aktiviert ist, leere die Geräte
            if (this.controls.ownDeviceSetup) {
                node.warn("Eigene Geräte aktiviert: Lösche alle Geräte aus der Liste.");
                this.devices = [];

            } else {
                node.warn("Eigene Geräte deaktiviert: Lösche alle Geräte aus der Liste.");
                this.devices = [];
            }
        }
    }


    // Aktiviere Eigene Geräte Steuerung(Experimentel"NOT-DONE")
    getOwnDeviceSetup() {
        return this.helperYesTrue(this.controls.ownDeviceSetup)
    }


    getDeviceClass(deviceType) {
        const deviceClasses = {
            humidifier: Humidifier,
            dehumidifier: Dehumidifier,
            exhaust: Exhaust,
            ventilation: Ventilation,
            heater: Heater,
            cooler: Cooler,
            light: Light,
            pump: Pump,
            climate: Climate,
            switch: GenericSwitch,
            sensor: Sensor,
        };

        return deviceClasses[deviceType] || Device;
    }
    // Gerät direkt zur Instanz hinzufügen und in entities speichern
    addDevice(deviceName, deviceData, context) {
        const identifiedDevice = this.identifyDevice(deviceName, deviceData);
        if (!identifiedDevice) {
            node.error(`Failed to identify device: ${deviceName}`);
            return;
        }

        // Daten initialisieren, falls nicht vorhanden
        identifiedDevice.data = { ...deviceData };
        identifiedDevice.setData(deviceData, context); // Gerätedaten setzen
        this.devices.push(identifiedDevice); // Gerät zur Liste hinzufügen
        this.registerDevices(identifiedDevice)
        node.warn(`Added new device: ${deviceName}`);
    }

    addListDevice(deviceName, deviceData, context) {
        let listDeviceType
        let listDeviceName
            node.warn(`Add Own selected Device: ${deviceName}`);
            const parts = deviceName.split(".");
            if (parts.length > 1) {
                listDeviceName = parts[1]; // Der Teil nach dem Punkt
                listDeviceType = parts[0];
            } else {
                console.log("Kein Punkt im String gefunden.");
            }
            const identifiedDevice = this.identifyDevice(listDeviceName, deviceData,listDeviceType);

            if (!identifiedDevice) {
                node.error(`Failed to identify device: ${listDeviceName}`);
                return;
            }
            // Daten initialisieren, falls nicht vorhanden
            identifiedDevice.data = { ...deviceData };
            identifiedDevice.setData(deviceData, context); // Gerätedaten setzen
            this.devices.push(identifiedDevice); // Gerät zur Liste hinzufügen
            this.registerDevices(identifiedDevice)
            node.warn(`Added new device: ${listDeviceName}`);
    }

    // Gerät direkt zur Instanz hinzufügen und in entities speichern
    addDevice2(deviceName, deviceData, context) {
        const identifiedDevice = this.identifyDevice(deviceName, deviceData);
        if (!identifiedDevice) {
            node.error(`Failed to identify device: ${deviceName}`);
            return;
        }

        // Daten initialisieren, falls nicht vorhanden
        identifiedDevice.data = { ...deviceData };
        identifiedDevice.setData(deviceData, context); // Gerätedaten setzen
        this.devices.push(identifiedDevice); // Gerät zur Liste hinzufügen
        this.registerDevices(identifiedDevice)
        node.warn(`Added new device: ${deviceName}`);
    }

    // Geräte Identifizierung
    identifyDevice(deviceName, deviceData, devType) {

        if(devType){
            const DeviceClass = this.getDeviceClass(devType);
            node.warn(`Device ${deviceName} identified as ${devType}`);
            return new DeviceClass(deviceName, devType, deviceData);
        }

        const deviceTypeMapping = {
            "sensor": ["mode", "plant", "temperature", "temp", "humidity", "co2", "moisture", "dewpoint", "illuminance", "ppfd", "dli", "h5179"],
            "dehumidifier": ["dehumidifier", "drying", "dryer", "entfeuchter", "removehumidity"],
            "humidifier": ["humidifier", "mist", "befeuchter",],
            "exhaust": ["exhaust", "abluft", "ruck"],
            "ventilation": ["vent", "vents", "venti", "ventilation", "inlet", "outlet"],
            "heater": ["heater", "heizung", "warm"],
            "climate": ["climate", "klima",],
            "cooler": ["cooler", "kühler", "klima"],
            "light": ["light", "lamp", "led", "switch.light"],
            "co2": ["co2", "carbon"],
            "switch": ["generic", "switch"],
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
            canVentilate: device.deviceType === "ventilation",
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
    
    // Add Own Devices von list ohne erkennung 
    addOwnDevices(deviceName,deviceData,context){

        const identifiedDevice = this.identifyDevice(deviceName, deviceData);
        if (!identifiedDevice) {
            node.error(`Failed to identify device: ${deviceName}`);
            return;
        }
        // Daten initialisieren, falls nicht vorhanden
        identifiedDevice.data = { ...deviceData };
        identifiedDevice.setData(deviceData, context); // Gerätedaten setzen
        this.devices.push(identifiedDevice); // Gerät zur Liste hinzufügen
        this.registerDevices(identifiedDevice)
        node.warn(`Added new device: ${deviceName}`);
   
    }

    getCurrentOwnDeviceList(deviceType) {
        // Filtere die Geräte basierend auf dem übergebenen `deviceType`
        let devicetypes = this.ownDeviceList.filter(device => device.deviceType === deviceType);

        // Extrahiere nur die Namen der Geräte (`entity`) aus der gefilterten Liste
        let deviceNames = devicetypes.map(device => device.entity);

        // Rückgabe der Gerätenamen
        return deviceNames;
    }

    setCurrentOwnDeviceList(entity, deviceType) {
        // Erstelle ein neues Gerät-Objekt
        const deviceObject = { entity, deviceType };

        // Überprüfen, ob ein Gerät mit derselben entity und deviceType bereits existiert
        const exists = this.ownDeviceList.some(
            (device) => device.entity === entity && device.deviceType === deviceType
        );

        // Nur hinzufügen, wenn es noch nicht existiert
        if (!exists) {
            this.ownDeviceList.push(deviceObject);
        }
    }


    findDeviceByEntity(entity) {
        // Überprüfen, ob ownSetttetDevices existieren und ein Array sind
        if (!Array.isArray(this.devices)) {
            return false;
        }

        // Durchlaufe alle Geräte in ownSetttetDevices
        for (const device of this.devices) {
            // Überprüfe, ob die Entität im `data`-Objekt des Geräts existiert
            if (device.data && Object.prototype.hasOwnProperty.call(device.data, entity)) {
                return { device, found: true };
            }
        }

        // Wenn keine Entität gefunden wurde, gib false zurück
        return { device: null, found: false };
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
        if (this.tentMode !== "Drying") return
        node.warn(`DryingModeINcome:${dryMode}`);
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

    // Berechne SharkMouse VPD (Based on TERMP/HUM/VPD)
    calcSharkMouseVPD(Temp = this.tentData.temperature, Humidity = this.tentData.humidity, LeafOffset = this.tentData.temperature) {
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

        this.drying.sharkMouseVPD = parseFloat(vpd.toFixed(2));
        return this.drying.sharkMouseVPD;
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
    // MITTEL wert ziel aus range vpd werten
    perfectionAdjustments(currentVPD = this.vpd.current, perfectVPD = this.vpd.perfection, tolerance = this.vpd.perfectTolerance) {
        let action;
        let vpdDiffPercent = parseFloat((((currentVPD - perfectVPD) / perfectVPD) * 100).toFixed(2));
        let ActionType = ""
        if (currentVPD < perfectVPD - tolerance) {
            action = this.actions.Increased;
            ActionType = "Increased"
        } else if (currentVPD > perfectVPD + tolerance) {
            action = this.actions.Reduced;
            ActionType = "Reduced"
        }else{
            action = this.actions.Unchanged;
            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inMode: "Perfection Reached",
                ActionType: "Perfection",
                currentVPD: currentVPD,
                targetVPD: perfectVPD,
                targetReached:true,
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

        return {
            tentName: this.tentName,
            tentMode: this.tentMode, // Wenn unverändert, setzen wir "Unchanged"
            inMode: "VPD Perfection",
            ActionType: ActionType,
            currentVPD: currentVPD,
            targetVPD: perfectVPD,
            targetReached:false,
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
        let ActionType = ""
        if (currentVPD < targetVPDRange[0] - tolerance) {
            vpdDiffPercent = parseFloat((((currentVPD - targetVPDRange[0]) / targetVPDRange[0]) * 100).toFixed(2));
            action = this.actions.Increased;
            ActionType = "Increased"
        } else if (currentVPD > targetVPDRange[1] + tolerance) {
            vpdDiffPercent = parseFloat((((currentVPD - targetVPDRange[1]) / targetVPDRange[1]) * 100).toFixed(2));
            action = this.actions.Reduced;
            ActionType = "Reduced"
        }else{
            vpdDiffPercent = parseFloat((((currentVPD - targetVPDRange[1]) / targetVPDRange[1]) * 100).toFixed(2));
            action = this.actions.Unchanged;
            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inMode: "Range Reached",
                ActionType: "Unchanged",
                targetReached:true,
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

        return {
            tentName: this.tentName,
            tentMode: this.tentMode,
            inMode: "VPD Range",
            ActionType:ActionType,
            targetReached:false,
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
        let ActionType = ""
        let vpdDiffPercent = parseFloat((((currentVPD - targetVPD) / targetVPD) * 100)); // Korrektur der Berechnung


        if (currentVPD < targetVPD + tolerance) {
            action = this.actions.Increased;
            ActionType = "Increased"
        } else if (currentVPD > targetVPD + tolerance) {
            action = this.actions.Reduced;
            ActionType = "Reduced"
            
        }else{
            action = this.actions.Unchanged;
            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inMode: "Target Reached",
                ActionType: "Unchanged",
                currentVPD: currentVPD,
                targetedVPD: targetVPD,
                targetReached:true,
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
        
        return {
            tentName: this.tentName,
            tentMode: this.tentMode,
            inMode: "Targeted-VPD",
            ActionType: ActionType,
            currentVPD: currentVPD,
            targetedVPD: targetVPD,
            targetReached:false,
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
        this.calcWatteractiviy(this.tentData.humidity);
        this.calcDewVPD(this.tentData.temperature, this.tentData.dewpoint);
        this.calcDryingVPs(this.tentData.temperature, this.tentData.dewpoint)
        this.calcSharkMouseVPD(this.tentData.temperature, this.tentData.humidity)

        node.warn(`CURRENTPHASE: ${currentPhase}`);


        // Phase-spezifische Aktionen ausführen
        switch (this.drying.currentDryMode) {
            case "elClassico":
                return this.dryElClassico(currentPhase);
            case "SharkMouse":
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
        const dryAction = { ...this.actions.Unchanged }; // Modus-spezifische Aktionen
        const tempTolerance = 0.5; // Toleranz in °C
        const humTolerance = 2;   // Toleranz in %

        // Anpassungen basierend auf Temperatur
        if (Math.abs(this.tentData.temperature - phaseConfig.targetTemp) > tempTolerance) {
            if (this.tentData.temperature < phaseConfig.targetTemp) {
                dryAction.heater = "increased";
                dryAction.cooler = "unchanged";
                dryAction.exhaust = "increased";
                dryAction.climate = { heat: "increased", cool: "unchanged", dry: "unchanged" };
            } else {
                dryAction.cooler = "increased";
                dryAction.heater = "unchanged";
                dryAction.exhaust = "increased";
                dryAction.climate = { heat: "unchanged", cool: "increased", dry: "unchanged" };
            }
        }

        // Anpassungen basierend auf Feuchtigkeit
        if (Math.abs(this.tentData.humidity - phaseConfig.targetHumidity) > humTolerance) {
            if (this.tentData.humidity < phaseConfig.targetHumidity) {
                dryAction.humidifier = "increased";
                dryAction.dehumidifier = "unchanged";
                dryAction.ventilation = "increased";
                dryAction.climate = { ...dryAction.climate, dry: "unchanged" };
            } else {
                dryAction.dehumidifier = "increased";
                dryAction.humidifier = "unchanged";
                dryAction.ventilation = "increased";
                dryAction.climate = { ...dryAction.climate, dry: "increased" };
            }
        }

        // Konfliktlösung: Priorisierung von Temperatur
        if (dryAction.dehumidifier === "increased" && this.tentData.temperature < phaseConfig.targetTemp) {
            dryAction.heater = "increased";
        }

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
        const phaseConfig = this.drying.modes.SharkMouse.phase[currentPhase];
        const dryAction = { ...this.actions.Unchanged }; // Modus-spezifische Aktionen
        const vpdTolerance = 0.05; // Toleranz für VPD

        // Anpassungen basierend auf VPD
        const currentVPD = this.calculateCurrentVPD();
        if (Math.abs(currentVPD - phaseConfig.targetVPD) > vpdTolerance) {
            if (currentVPD < phaseConfig.targetVPD) {
                dryAction.heater = "increased";
                dryAction.dehumidifier = "unchanged";
                dryAction.exhaust = "increased";
                dryAction.ventilation = "increased";
                dryAction.climate = { heat: "increased", cool: "unchanged", dry: "unchanged" };
            } else {
                dryAction.cooler = "increased";
                dryAction.humidifier = "unchanged";
                dryAction.exhaust = "increased";
                dryAction.ventilation = "increased";
                dryAction.climate = { heat: "unchanged", cool: "increased", dry: "unchanged" };
            }
        }

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
    // DRYMODE DewPoint Based
    dryDewBased(currentPhase) {
        const phaseConfig = this.drying.modes.dewBased.phase[currentPhase];
        const dryAction = { ...this.actions.Unchanged }; // Modus-spezifische Aktionen
        const dewPointTolerance = 0.5; // Toleranz für Taupunkt

        // Anpassungen basierend auf Vapor Pressure (Taupunkt, tatsächlicher Dampfdruck und Sättigungsdampfdruck)
        const currentDewPoint = this.calculateDewPoint();
        const vaporPressureActual = this.drying.vaporPressureActual;
        const vaporPressureSaturation = this.drying.vaporPressureSaturation;

        // Sicherstellen, dass currentDewPoint eine Zahl ist
        if (typeof currentDewPoint !== "number" || isNaN(currentDewPoint)) {
            console.warn("Current Dew Point is unavailable or invalid.");
            return {
                tentName: this.tentName,
                tentMode: this.tentMode,
                inDryMode: this.drying.currentDryMode,
                currentPhase,
                targetValues: {
                    targetTemp: phaseConfig.targetTemp,
                    targetDewPoint: phaseConfig.targetDewPoint,
                    targetDuration: phaseConfig.durationHours,
                },
                actions: dryAction,
                warning: "Dew Point data is invalid or unavailable.",
            };
        }

        // Überprüfen, ob die aktuellen Werte im Zielbereich liegen
        if (
            Math.abs(currentDewPoint - phaseConfig.targetDewPoint) > dewPointTolerance ||
            vaporPressureActual < 0.9 * vaporPressureSaturation ||
            vaporPressureActual > 1.1 * vaporPressureSaturation
        ) {
            if (currentDewPoint < phaseConfig.targetDewPoint || vaporPressureActual < 0.9 * vaporPressureSaturation) {
                dryAction.humidifier = "increased";
                dryAction.cooler = "unchanged";
                dryAction.exhaust = "increased";
                dryAction.ventilation = "increased";
                dryAction.climate = { dry: "unchanged", cool: "unchanged", heat: "increased" };
            } else {
                dryAction.dehumidifier = "increased";
                dryAction.heater = "unchanged";
                dryAction.exhaust = "increased";
                dryAction.ventilation = "increased";
                dryAction.climate = { dry: "increased", cool: "unchanged", heat: "unchanged" };
            }
        }

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
            actions: dryAction,
        };
    }

    // EXPERIMENTEL
    glbjAdjustments(currentVPD = this.vpd.current, ecoTarget = this.vpd.ecotarget) {
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
            Action:"MasterBrain",
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

    selectModeAction(){
        if(this.controls.pidControl){
            return this.selectPIDAction()
        }else{
            return this.selectAction()

        }
    }

    selectAction() {
        let preparedDevices = []; // Speicher für Geräteaktionen
        let actionData = {};
        let limitAdjustments
        let finalActions 
        // Prüfen, ob der Zustand seit der letzten Aktion unverändert ist
        if (this.checkIfActionNeeded()) {
            this.needchange = true;
        } else {
            this.needchange = false;
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
                case "GLBJ-Mode":
                    actionData = this.glbjAdjustments(
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

            // Vorzeitige Anpassungen
            limitAdjustments = this.checkLimits();

            // Kombiniere alle Aktionen
            finalActions = {
                ...actionData.actions || null,
                ...limitAdjustments || null,
            };

            this.devices.forEach((device) => {

                // Prüfen, ob das Gerät korrekt initialisiert wurde
                if (device.switches.length === 0) return
                if (device && typeof device.prepareAction === "function") {
                    if (device.deviceType === "sensor" || device.deviceType === "pump" || device.deviceType === "co2") return;

                    device = device.prepareAction(finalActions);

                    let actions = device.runAction()

                    //node.warn(`FinalAction: ${JSON.stringify(actions, null, 2)}`);

                    preparedDevices.push(actions)

                } else {
                    // Falls Gerät nicht korrekt initialisiert ist, Warnung ausgeben
                    node.warn(`Device ${device?.name || "undefined"} konnte nicht verarbeitet werden.`);
                }
            });


            this.dataSetter({
                    ...actionData || null,
                    actions: finalActions || null,
                    devices: this.devices || null,
                    deviceActions: preparedDevices || null,
                });


            return {
                ...actionData || null,
                actions: finalActions || null,
                devices: this.devices || null,
                deviceActions: preparedDevices || null,
                Temps: {
                    Temperature: this.tentData.temperature,
                    MinTemperature: this.tentData.minTemp,
                    MaxTemperature: this.tentData.maxTemp,
                },

            };

        }else{
            this.devices.forEach((device) => {
                device.needChange = false
                finalActions = this.actions.Unchanged
                // Prüfen, ob das Gerät korrekt initialisiert wurde
                if (device.switches.length === 0) return
                if (device && typeof device.prepareAction === "function") {
                    if (device.deviceType === "sensor" || device.deviceType === "pump" || device.deviceType === "co2") return;
                        device = device.prepareAction(finalActions);
                        let actions = device.runAction()
                        preparedDevices.push(actions)
                } else {
                    // Falls Gerät nicht korrekt initialisiert ist, Warnung ausgeben
                    node.warn(`Device ${device?.name || "undefined"} konnte nicht verarbeitet werden.`);
                }
            });
            return {
                TentName:this.tentName,
                TentMode:this.tentMode,
                Action:"Unchanged",
                TargetReached:false,
                NeedChange:false,
                ...actionData || null,
                actions: finalActions || null,
                devices: this.devices || null,
                deviceActions: preparedDevices || null,
            };
        }

    }

    selectPIDAction() {

        const preparedDevices = [];
        let tempAdjustment
        let humAdjustment
        let vpdAdjustment
        let pidActions
        let pidAdjustments


        if (!this.tempPID || !this.humPID || !this.vpdPID) {
            console.error("PID-Controller sind nicht initialisiert.");
            return {
                error: "PID-Controller nicht initialisiert",
            };
        }

        // Berechne Anpassungen basierend auf den aktuellen PID-Werten
        this.PIDAdjustments.tempAdjustment = this.tempPID.compute(parseFloat(this.tentData.temperature));
        this.PIDAdjustments.humAdjustment = this.humPID.compute(parseFloat(this.tentData.humidity));
        this.PIDAdjustments.vpdAdjustment = this.vpdPID.compute(parseFloat(this.vpd.current));
        pidAdjustments = this.PIDAdjustments

        if (this.checkIPIDfActionNeeded()) {
            this.needchange = true;

        } else {
            this.needchange = false;
        }

        if(this.needchange){

            // Generiere Aktionen basierend auf den PID-Werten
            pidActions = this.generateActionsFromPID(tempAdjustment, humAdjustment, vpdAdjustment, this.vpd.lightControl);
           
            if (!pidActions) {
                console.error("applyPIDControl hat keine Ergebnisse geliefert.");
                return {
                    error: "Keine Ergebnisse von applyPIDControl",
                };
            }

            // Geräteaktionen vorbereiten
            this.devices.forEach((device) => {
                if (device.deviceType === "sensor" || device.deviceType === "pump" || device.deviceType === "co2") return;

                if (device && typeof device.prepareAction === "function") {
                    device = device.prepareAction(pidActions);
                    const actions = device.runAction();
                    preparedDevices.push(actions);
                } else {
                    console.warn(`Device ${device?.name || "undefined"} konnte nicht verarbeitet werden.`);
                }
            });

            // Speichere die Aktion
            this.dataPIDSetter({
                tentMode:"P.I.D",
                PIDAdjustments:pidAdjustments || {},
                actions: pidActions || {},
                devices: this.devices || {},
                deviceActions: preparedDevices || {},
            });
            // Rückgabe der Aktion mit den angepassten Geräten und PID-Werten
            return {
                tentName: this.tentName,
                tentMode: "P.I.D",
                vpdPID: this.vpdPID,
                tempPID: this.tempPID,
                humPID: this.humPID,
                PIDAdjustments: pidAdjustments || {},
                VPD: {
                    VPD: this.vpd.current
                },
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

                devices: this.devices || {},
                actions: pidActions || {},
                deviceActions: preparedDevices || {},
            };
        }else{
            this.devices.forEach((device) => {

                // Prüfen, ob das Gerät korrekt initialisiert wurde
                if (device.switches.length === 0) return
                if (device && typeof device.prepareAction === "function") {
                    if (device.deviceType === "sensor" || device.deviceType === "pump" || device.deviceType === "co2") return;
                        device = device.prepareAction(this.actions.Unchanged);
                        let actions = device.runAction()
                        preparedDevices.push(actions)
                } else {
                    // Falls Gerät nicht korrekt initialisiert ist, Warnung ausgeben
                    node.warn(`Device ${device?.name || "undefined"} konnte nicht verarbeitet werden.`);
                }
            });
            return {
                tentName: this.tentName,
                tentMode: "P.I.D-Unchanged",
                vpdPID: this.vpdPID,
                tempPID: this.tempPID,
                humPID: this.humPID,
                PIDAdjustments: pidAdjustments || {},
                VPD: {
                    VPD: this.vpd.current
                },
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

                devices: this.devices || {},
                actions: pidActions || {},
                deviceActions: preparedDevices || {},
            };
        }

    }

    calculateDynamicWeight(plantStage, deviation) {
        const baseWeight = this.controls.weights.defaultValue;
        const stageMultiplier = plantStage.includes("Flower") ? 1.25 : 1.0;
        return baseWeight * stageMultiplier * Math.abs(deviation);
    }

    checkLimits() {
        let adjustments = {};

        //CALC DIYNAMIC WEWIGHT
        //this.calculateDynamicWeight(this.plantStage)

        // Sicherstellen, dass der Modus nicht "Drying" ist
        if (this.tentMode === "Drying") return;

        // Keine Änderungen erforderlich, wenn kein Bedarf besteht
        if (!this.needchange) return adjustments;

        // Dynamische Gewichtung basierend auf Plant Stage
        let humidityWeight, temperatureWeight;

        if (this.controls.ownWeights) {
            humidityWeight = this.controls.weights.hum || 1.0;
            temperatureWeight = this.controls.weights.temp || 1.0;
        } else {
            if (this.plantStage === "MidFlower" || this.plantStage === "LateFlower") {
                humidityWeight = 1.25; // Feuchtigkeit ist wichtiger
                temperatureWeight = 1.0; // Temperatur ist weniger wichtig
            } else {
                humidityWeight = 1.0; // Standardgewichtung
                temperatureWeight = 1.0;
            }
        }

        // Initialisierung von Abweichungen
        let tempDeviation = 0;
        let humDeviation = 0;

        // Abweichungen nur berechnen, wenn außerhalb der Grenzen
        if (this.tentData.temperature > this.tentData.maxTemp) {
            tempDeviation = (this.tentData.temperature - this.tentData.maxTemp) * temperatureWeight;
        } else if (this.tentData.temperature < this.tentData.minTemp) {
            tempDeviation = (this.tentData.temperature - this.tentData.minTemp) * temperatureWeight;
        }

        if (this.tentData.humidity > this.tentData.maxHumidity) {
            humDeviation = (this.tentData.humidity - this.tentData.maxHumidity) * humidityWeight;
        } else if (this.tentData.humidity < this.tentData.minHumidity) {
            humDeviation = (this.tentData.humidity - this.tentData.minHumidity) * humidityWeight;
        }

        //adjustments.climate = {
        //    cool: "unchanged",
        //    heat: "unchanged",
        //    dry: "unchanged",
        //};

        // **1. Hohe Temperatur + Hohe Feuchtigkeit**
        if (tempDeviation > 0 && humDeviation > 0 && this.isPlantDay.lightOn) {
            adjustments.dehumidifier = "increased";
            adjustments.cooler = "increased";
            adjustments.exhaust = "increased";
            adjustments.climate.cool = "increased";
            adjustments.ventilation = "increased";
            adjustments.light = this.vpd.lightControl ? "reduced" : "unchanged"
            // Ambient-Integration
            const ambientInfluence = this.analyzeAmbientInfluence();
            adjustments = { ...adjustments, ...ambientInfluence };

            node.warn(`${this.tentName} Fall: Hohe Temperatur + Hohe Feuchtigkeit`);

            // **2. Hohe Temperatur + Niedrige Feuchtigkeit**
        } else if (tempDeviation > 0 && humDeviation < 0 && this.isPlantDay.lightOn) {
            adjustments.humidifier = "increased";
            adjustments.cooler = "increased";
            adjustments.exhaust = "increased";
            adjustments.ventilation = "increased";
            adjustments.climate.cool = "increased";
            adjustments.light = this.vpd.lightControl ? "reduced" : "unchanged"

            // Ambient-Integration
            const ambientInfluence = this.analyzeAmbientInfluence();
            adjustments = { ...adjustments, ...ambientInfluence };

            node.warn(`${this.tentName} Fall: Hohe Temperatur + Niedrige Feuchtigkeit`);

            // **3. Niedrige Temperatur + Hohe Feuchtigkeit**
        } else if (tempDeviation < 0 && humDeviation > 0 && this.isPlantDay.lightOn) {
            adjustments.dehumidifier = "increased";
            adjustments.heater = "increased";
            adjustments.exhaust = "increased";
            adjustments.climate.dry = "increased";
            adjustments.ventilation = "increased";
            adjustments.light = this.vpd.lightControl ? "increased" : "unchanged"

            // Ambient-Integration
            const ambientInfluence = this.analyzeAmbientInfluence();
            adjustments = { ...adjustments, ...ambientInfluence };

            node.warn(`${this.tentName} Fall: Niedrige Temperatur + Hohe Feuchtigkeit`);

            // **4. Niedrige Temperatur + Niedrige Feuchtigkeit**
        } else if (tempDeviation < 0 && humDeviation < 0 && this.isPlantDay.lightOn) {
            adjustments.humidifier = "increased";
            adjustments.heater = "increased";
            adjustments.exhaust = "reduced";
            adjustments.climate.heat = "increased";
            adjustments.ventilation = "reduced";
            adjustments.light = this.vpd.lightControl ? "increased" : "unchanged"

            // Ambient-Integration
            const ambientInfluence = this.analyzeAmbientInfluence();
            adjustments = { ...adjustments, ...ambientInfluence };

            node.warn(`${this.tentName} Fall: Niedrige Temperatur + Niedrige Feuchtigkeit`);
        }

        // **5. Notfallmaßnahmen bei extremer Übertemperatur**
        if (this.tentData.temperature > this.tentData.maxTemp + 5 && this.isPlantDay.lightOn) {
            adjustments.exhaust = "maximum";
            adjustments.ventilation = "increased";
            adjustments.cooler = "increased";
            adjustments.climate.cool = "increased";
            adjustments.light = this.vpd.lightControl ? "reduced" : "unchanged"

            // Ambient-Integration
            const ambientInfluence = this.analyzeAmbientInfluence();
            adjustments = { ...adjustments, ...ambientInfluence };

            node.warn(`${this.tentName} Kritische Übertemperatur! Notfallmaßnahmen aktiviert.`);
        }

        // **6. Notfallmaßnahmen bei extremer Untertemperatur**
        if (this.tentData.temperature < this.tentData.minTemp - 5 && this.isPlantDay.lightOn) {
            adjustments.heater = "increased";
            adjustments.exhaust = "reduced";
            adjustments.ventilation = "increased";
            adjustments.climate.heat = "increased";
            adjustments.light = this.vpd.lightControl ? "increased" : "unchanged"
            
            // Ambient-Integration
            const ambientInfluence = this.analyzeAmbientInfluence();
            adjustments = { ...adjustments, ...ambientInfluence };

            node.warn(`${this.tentName} Kritische Untertemperatur! Notfallmaßnahmen aktiviert.`);

        }

        // **7. Lichtsteuerung basierend auf Temperatur**
        if (this.tentData.temperature > this.tentData.maxTemp && this.isPlantDay.lightOn) {
            adjustments.light = this.vpd.lightControl ? "reduced" : "unchanged"
            node.warn(`${this.tentName} Lichtleistung reduziert aufgrund hoher Temperatur`);
            
            // Ambient-Integration
            const ambientInfluence = this.analyzeAmbientInfluence();
            adjustments = { ...adjustments, ...ambientInfluence };
        }

        // **8. CO₂-Management**
        if (this.tentData.co2Level < 400 && this.isPlantDay.lightOn) {
            adjustments.light = this.vpd.lightControl ? "increased" : "unchanged"
            adjustments.co2 = "increased";
            adjustments.exhaust = "minimum";
            node.warn("CO₂-Level zu niedrig, CO₂-Zufuhr erhöht");

        } else if (this.tentData.co2Level > 1200 && this.isPlantDay.lightOn) {
            adjustments.light = this.vpd.lightControl ? "increased" : "unchanged"
            adjustments.co2 = "reduced";
            adjustments.exhaust = "increased";
            node.warn(`${this.tentName} CO₂-Level zu hoch, Abluft erhöht`);

        }

        // **9. Taupunkt- und Kondensationsschutz**
        if (this.tentData.dewpoint >= this.tentData.temperature - 1 && this.isPlantDay.lightOn) {
            adjustments.exhaust = "increased";
            adjustments.climate.dry = "increased";
            adjustments.ventilation = "increased";

            // Ambient-Integration
            const ambientInfluence = this.analyzeAmbientInfluence();
            adjustments = { ...adjustments, ...ambientInfluence };

            node.warn(`${this.tentName} Taupunkt erreicht, Feuchtigkeit reduziert`);

        }

        // **10. Nachtmodus (Licht aus, maximale Abluft)**
        if (!this.isPlantDay.lightOn) {
            adjustments.light = "off";
            //adjustments.exhaust = "maximum";
            //adjustments.ventilation = "increased";
            //adjustments.co2 = "minimum";

            // Ambient-Integration
            const ambientInfluence = this.analyzeAmbientInfluence();
            adjustments = { ...adjustments, ...ambientInfluence };

            node.warn(`${this.tentName} Nachtmodus aktiv: Licht aus, Abluft erhöht`);
        }

        return adjustments;
    }

    checkLimitsWithOutAmbient() {
        let adjustments = {};

        // Sicherstellen, dass der Modus nicht "Drying" ist
        if (this.tentMode === "Drying") return;

        // Keine Änderungen erforderlich, wenn kein Bedarf besteht
        if (!this.needchange) return adjustments;

        // Dynamische Gewichtung basierend auf Plant Stage
        let humidityWeight, temperatureWeight;

        if (this.controls.ownWeights) {
            humidityWeight = this.controls.weights.hum || 1.0;
            temperatureWeight = this.controls.weights.temp || 1.0;
        } else {
            if (this.plantStage === "MidFlower" || this.plantStage === "LateFlower") {
                humidityWeight = 1.25; // Feuchtigkeit ist wichtiger
                temperatureWeight = 1.0; // Temperatur ist weniger wichtig
            } else {
                humidityWeight = 1.0; // Standardgewichtung
                temperatureWeight = 1.0;
            }
        }

        // Initialisierung von Abweichungen
        let tempDeviation = 0;
        let humDeviation = 0;

        // Abweichungen nur berechnen, wenn außerhalb der Grenzen
        if (this.tentData.temperature > this.tentData.maxTemp) {
            tempDeviation = (this.tentData.temperature - this.tentData.maxTemp) * temperatureWeight;
        } else if (this.tentData.temperature < this.tentData.minTemp) {
            tempDeviation = (this.tentData.temperature - this.tentData.minTemp) * temperatureWeight;
        }

        if (this.tentData.humidity > this.tentData.maxHumidity) {
            humDeviation = (this.tentData.humidity - this.tentData.maxHumidity) * humidityWeight;
        } else if (this.tentData.humidity < this.tentData.minHumidity) {
            humDeviation = (this.tentData.humidity - this.tentData.minHumidity) * humidityWeight;
        }

        // **Initialisiere climate innerhalb von adjustments**
        adjustments.climate = {
            cool: "unchanged",
            heat: "unchanged",
            dry: "unchanged",
        };

        // **1. Hohe Temperatur + Hohe Feuchtigkeit**
        if (tempDeviation > 0 && humDeviation > 0) {
            adjustments.dehumidifier = "increased";
            adjustments.cooler = "increased";
            adjustments.exhaust = "increased";
            adjustments.climate.cool = "increased";
            adjustments.ventilation = "increased";
            node.warn(`${this.tentName} Fall: Hohe Temperatur + Hohe Feuchtigkeit`);

            // **2. Hohe Temperatur + Niedrige Feuchtigkeit**
        } else if (tempDeviation > 0 && humDeviation < 0) {
            adjustments.humidifier = "increased";
            adjustments.cooler = "increased";
            adjustments.exhaust = "increased";
            adjustments.ventilation = "increased";
            adjustments.climate.cool = "increased";
            node.warn(`${this.tentName} Fall: Hohe Temperatur + Niedrige Feuchtigkeit`);

            // **3. Niedrige Temperatur + Hohe Feuchtigkeit**
        } else if (tempDeviation < 0 && humDeviation > 0) {
            adjustments.dehumidifier = "increased";
            adjustments.heater = "increased";
            adjustments.exhaust = "increased";
            adjustments.climate.dry = "increased";
            adjustments.ventilation = "increased";
            if (this.isPlantDay.lightOn) {
                adjustments.light = "increased"
            }
            node.warn(`${this.tentName} Fall: Niedrige Temperatur + Hohe Feuchtigkeit`);

            // **4. Niedrige Temperatur + Niedrige Feuchtigkeit**
        } else if (tempDeviation < 0 && humDeviation < 0) {
            adjustments.humidifier = "increased";
            adjustments.heater = "increased";
            adjustments.exhaust = "reduced";
            adjustments.climate.heat = "increased";
            adjustments.ventilation = "reduced";
            if (this.isPlantDay.lightOn) {
                adjustments.light = "increased"
            }
            node.warn(`${this.tentName} Fall: Niedrige Temperatur + Niedrige Feuchtigkeit`);
        }

        // **5. Notfallmaßnahmen bei extremer Übertemperatur**
        if (this.tentData.temperature > this.tentData.maxTemp + 5) {
            adjustments.exhaust = "maximum";
            adjustments.ventilation = "increased";
            adjustments.cooler = "increased";
            adjustments.climate.cool = "increased";
            adjustments.light = "reduced";
            node.warn(`${this.tentName} Kritische Übertemperatur! Notfallmaßnahmen aktiviert.`);
        }

        // **6. Notfallmaßnahmen bei extremer Untertemperatur**
        if (this.tentData.temperature < this.tentData.minTemp - 5) {
            adjustments.heater = "increased";
            adjustments.exhaust = "reduced";
            adjustments.ventilation = "increased";
            adjustments.climate.heat = "increased";
            if (this.isPlantDay.lightOn) {
                adjustments.light = "maximum"
            }
            node.warn(`${this.tentName} Kritische Untertemperatur! Notfallmaßnahmen aktiviert.`);
        }

        // **7. Lichtsteuerung basierend auf Temperatur**
        if (this.tentData.temperature > this.tentData.maxTemp && this.isPlantDay.lightOn) {
            adjustments.light = "reduced";
            node.warn(`${this.tentName} Lichtleistung reduziert aufgrund hoher Temperatur`);
        }

        // **8. CO₂-Management**
        if (this.tentData.co2Level < 400) {
            if (this.isPlantDay.lightOn) {
                adjustments.light = "increased"
                adjustments.co2 = "increased";
                adjustments.exhaust = "minimum";
                node.warn("CO₂-Level zu niedrig, CO₂-Zufuhr erhöht");
            }

        } else if (this.tentData.co2Level > 1200) {
            if (this.isPlantDay.lightOn) {
                adjustments.light = "increased"
                adjustments.co2 = "reduced";
                adjustments.exhaust = "increased";
                node.warn(`${this.tentName} CO₂-Level zu hoch, Abluft erhöht`);
            }
            adjustments.co2 = "reduced";
            adjustments.exhaust = "increased";
            node.warn(`${this.tentName} CO₂-Level zu hoch, Abluft erhöht`);
        }

        // **9. Taupunkt- und Kondensationsschutz**
        if (this.tentData.dewpoint >= this.tentData.temperature - 1) {
            adjustments.exhaust = "increased";
            adjustments.climate.dry = "increased";
            adjustments.ventilation = "increased";
            node.warn(`${this.tentName} Taupunkt erreicht, Feuchtigkeit reduziert`);
        }

        // **10. Nachtmodus (Licht aus, maximale Abluft)**
        if (!this.isPlantDay.lightOn) {
            adjustments.light = "off";
            adjustments.exhaust = "maximum";
            adjustments.ventilation = "increased";
            adjustments.co2 = "minimum";
            node.warn(`${this.tentName} Nachtmodus aktiv: Licht aus, Abluft erhöht`);
        }

        return adjustments;
    }

    analyzeAmbientInfluence() {
        let ambientAdjustments = {};
        if (this.enviorment.ambientTemp === 0) return ambientAdjustments
        // Temperaturdifferenz berechnen
        const ambientTempDiff = this.tentData.temperature - this.enviorment.ambientTemp;

        if (!isNaN(ambientTempDiff)) {
            if (ambientTempDiff > 2) {
                // Zelt ist wärmer -> Nutze Umgebungsluft zum Kühlen
                ambientAdjustments.cooler = "increased";
                ambientAdjustments.exhaust = "increased";
                ambientAdjustments.climate = { ...ambientAdjustments.climate, cool: "increased" };
            } else if (ambientTempDiff < -2) {
                // Zelt ist kälter -> Reduziere Abluft
                ambientAdjustments.cooler = "reduced";
                ambientAdjustments.exhaust = "reduced";
                ambientAdjustments.climate = { ...ambientAdjustments.climate, cool: "reduced" };
            }
        }

        // Feuchtigkeitsdifferenz berechnen
        const ambientHumDiff = this.tentData.humidity - this.enviorment.ambientHumidity;

        if (!isNaN(ambientHumDiff)) {
            if (ambientHumDiff > 5) {
                // Zelt ist feuchter -> Nutze Umgebungsluft zum Entfeuchten
                ambientAdjustments.dehumidifier = "increased";
                ambientAdjustments.exhaust = "increased";
                ambientAdjustments.climate = { ...ambientAdjustments.climate, dry: "increased" };
            } else if (ambientHumDiff < -5) {
                // Zelt ist trockener -> Reduziere Abluft, erhöhe Befeuchtung
                ambientAdjustments.humidifier = "increased";
                ambientAdjustments.exhaust = "reduced";
                ambientAdjustments.climate = { ...ambientAdjustments.climate, dry: "reduced" };
            }
        }

        return ambientAdjustments;
    }

    // Experimentel ( use outsite and ambient data)
    analyzeTrends() {
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
        const vpdThreshold = 0.005;

        if (data.Action === "Unchanged" ||data.tentMode === "Unchanged" || this.tentMode === "Unchanged" || this.tentMode === "Disabled" || this.tentMode === "I DONT CARE MODE") {
            return;
        }

        // Filter für aktive oder relevante Geräte
        // Filter für aktive oder relevante Geräte
        const relevantDevices = this.devices.filter(
            (device) => (device.switches.length > 0) || device.isRunning
        );

        if (data.PIDAdjustments){

        }


        // Erstelle das Datenobjekt
        const enrichedData = {
            time,
            tentName: this.tentName,
            tentMode: this.tentMode,
            currentVPD: this.vpd.current,
            targetVPD: data.targetVPD,
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
            actions: data.actions,
            devices: relevantDevices.map((device) => ({
                ...device
            })),
            deviceActions: data.deviceActions
        };

        // Bedingung für signifikante Änderungen
        const significantChange =
            !lastAction ||
            Math.abs(lastAction.currentVPD - this.vpd.current) > vpdThreshold ||
            lastAction.Temps.Temperature !== enrichedData.Temps.Temperature ||
            lastAction.Humditys.Humidity !== enrichedData.Humditys.Humidity ||
            lastAction.Dewpoint !== enrichedData.Dewpoint;

        if (significantChange) {
            this.previousActions.push(enrichedData);
            node.log(`${this.tentName} Neue Aktion gespeichert:", ${enrichedData}`);
            return enrichedData
        } else {
            node.log(`${this.tentName} Änderung nicht signifikant - Keine Aktion gespeichert.`);
        }

        // Begrenze die Anzahl der gespeicherten Aktionen
        if (this.previousActions.length > 250) {
            this.previousActions = this.previousActions.slice(-250);
        }

    }

    dataPIDSetter(data) {
        const time = new Date().toISOString();
        const vpdThreshold = 0.005;
        const tempThreshold = 0.25;
        const humThreshold = 0.25;

        if (
            data.tentMode === "P.I.D-Unchanged" ||
            this.tentMode === "Unchanged" ||
            this.tentMode === "Disabled" ||
            this.tentMode === "I DONT CARE MODE"
        ) {
            return;
        }

        // Filter für aktive oder relevante Geräte
        const relevantDevices = this.devices.filter(
            (device) => device.switches.length > 0 || device.isRunning
        );

        // Erstelle das Datenobjekt
        const enrichedData = {
            time,
            tentName: this.tentName,
            tentMode: "P.I.D",
            currentVPD: this.vpd.current,
            PIDAdjustments: data.PIDAdjustments,
            VPDPID:this.vpdPID,
            TempPID:this.tempPID,
            HumidityPID:this.humPID,
            CO2PID:this.co2PID,
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
            actions: data.actions,
            devices: relevantDevices.map((device) => ({
                ...device
            })),
            deviceActions: data.deviceActions
        };

        // Hole die letzte Aktion
        const lastAction = this.previousPIDActions[this.previousPIDActions.length - 1];

        // Prüfe, ob sich Werte signifikant geändert haben
        const significantChange =
            !lastAction ||
            Math.abs(lastAction.PIDAdjustments.vpdAdjustment - data.PIDAdjustments.vpdAdjustment) > vpdThreshold ||
            Math.abs(lastAction.PIDAdjustments.temperatureAdjustment - data.PIDAdjustments.temperatureAdjustment) > tempThreshold ||
            Math.abs(lastAction.PIDAdjustments.humidityAdjustment - data.PIDAdjustments.humidityAdjustment) > humThreshold;

        if (significantChange) {
            this.previousPIDActions.push(enrichedData);
            node.log(`${this.tentName} Neue Aktion gespeichert: ${JSON.stringify(enrichedData, null, 2)}`);
            return enrichedData;
        } else {
            node.log(`${this.tentName} Änderung nicht signifikant - Keine Aktion gespeichert.`);
        }

        // Begrenze die Anzahl der gespeicherten Aktionen
        if (this.previousPIDActions.length > 250) {
            this.previousPIDActions = this.previousPIDActions.slice(-250);
        }
    }

    // Check if action is needed to chagnes in vpd 
    checkIfActionNeeded() {
        if (this.previousActions.length === 0) return true;

        const lastAction = this.previousActions[this.previousActions.length - 1];

       

        // Prüfen, ob der aktuelle Zustand identisch mit dem letzten gespeicherten Zustand ist
        if (lastAction && lastAction.currentVPD === this.vpd.current) {
            //node.warn("VPD hat sich nicht geändert. Keine Aktion notwendig.");
            return false;
        }else{
            node.warn(`CurrentVPD:${this.vpd.current}, LastActionVPD:${lastAction.currentVPD}`)
            return true;
        }

    }
    
    // Check if action is needed to chagnes in vpd,temp,humidity over TEMP
    checkIPIDfActionNeeded2() {
        if (this.previousPIDActions.length === 0) {
            console.warn("Keine vorherigen Aktionen vorhanden. Aktion notwendig.");
            return true;
        }

        const lastAction = this.previousPIDActions[this.previousPIDActions.length - 1];
        const { temperatureAdjustment, humidityAdjustment, vpdAdjustment } = this.PIDAdjustments;

        // Prüfen, ob sich die VPD geändert hat
        if (lastAction && lastAction.PIDAdjustments) {
            const {
                temperatureAdjustment: lastTempAdjustment,
                humidityAdjustment: lastHumAdjustment,
                vpdAdjustment: lastVpdAdjustment,
            } = lastAction.PIDAdjustments;

            if (
                temperatureAdjustment === lastTempAdjustment &&
                humidityAdjustment === lastHumAdjustment &&
                vpdAdjustment === lastVpdAdjustment &&
                lastAction.currentVPD === this.vpd.current
            ) {
                console.warn("Keine Änderungen an PID-Parametern oder VPD. Keine Aktion notwendig.");
                return false;
            } else {
                console.warn(`Änderung festgestellt:
                Temperatur: ${lastTempAdjustment} -> ${temperatureAdjustment},
                Luftfeuchtigkeit: ${lastHumAdjustment} -> ${humidityAdjustment},
                VPD: ${lastVpdAdjustment} -> ${vpdAdjustment},
                CurrentVPD: ${lastAction.currentVPD} -> ${this.vpd.current}`);
                return true;
            }
        } else {
            console.warn("Fehlende vorherige PID-Daten. Aktion notwendig.");
            return true;
        }
    }

    checkIPIDfActionNeeded() {
        if (this.previousPIDActions.length === 0) {
            console.warn("Keine vorherigen Aktionen vorhanden. Aktion notwendig.");
            return true;
        }

        const lastAction = this.previousPIDActions[this.previousPIDActions.length - 1];
        const { temperatureAdjustment, humidityAdjustment, vpdAdjustment } = this.PIDAdjustments;

        // Prüfen, ob sich die VPD geändert hat
        if (lastAction && lastAction.PIDAdjustments) {
            const {
                temperatureAdjustment: lastTempAdjustment,
                humidityAdjustment: lastHumAdjustment,
                vpdAdjustment: lastVpdAdjustment,
            } = lastAction.PIDAdjustments;

            const areAdjustmentsEqual =
                Math.abs(temperatureAdjustment - lastTempAdjustment) < 0.01 &&
                Math.abs(humidityAdjustment - lastHumAdjustment) < 0.01 &&
                Math.abs(vpdAdjustment - lastVpdAdjustment) < 0.01 &&
                Math.abs(lastAction.currentVPD - this.vpd.current) < 0.01;

            if (areAdjustmentsEqual) {
                console.warn("Keine Änderungen an PID-Parametern oder VPD. Keine Aktion notwendig.");
                return false;
            } else {
                console.warn(`Änderung festgestellt:
            Temperatur: ${lastTempAdjustment} -> ${temperatureAdjustment},
            Luftfeuchtigkeit: ${lastHumAdjustment} -> ${humidityAdjustment},
            VPD: ${lastVpdAdjustment} -> ${vpdAdjustment},
            CurrentVPD: ${lastAction.currentVPD} -> ${this.vpd.current}`);
                return true;
            }
        } else {
            console.warn("Fehlende vorherige PID-Daten. Aktion notwendig.");
            return true;
        }
    }

}

class OGBPIDController {
    constructor(name, Kp, Ki, Kd, minValue, maxValue, setPoint = null) {
        this.name = name;
        this.Kp = Kp; // Proportionaler Faktor
        this.Ki = Ki; // Integraler Faktor
        this.Kd = Kd; // Derivativer Faktor
        this.minValue = minValue; // Minimalwert
        this.maxValue = maxValue; // Maximalwert
        this.SetPoint = 0; // Zielwert
        this.integral = 0; // Summierter Fehler (für Ki)
        this.prevError = 0; // Fehler aus der vorherigen Berechnung (für Kd)
        this.maxIntegral = 100; // Anti-Windup Grenze
        this.prevValue = null; // Vorheriger Wert (für Glättung)
        this.lastComputeTime = null; // Zeit der letzten Berechnung
    }

    // Anti-Windup für Integralanteil
    clampIntegral() {
        this.integral = Math.max(-this.maxIntegral, Math.min(this.maxIntegral, this.integral));
    }

    // Aktualisieren der Parameter
    updateProportional(value) { if (value !== this.Kp) this.Kp = value; }
    updateIntegral(value) { if (value !== this.Ki) this.Ki = value; }
    updateDerivative(value) { if (value !== this.Kd) this.Kd = value; }

    // Glättung der Eingabewerte (Moving Average)
    smoothInput(currentValue, alpha = 0.1) {
        if (this.prevValue === null) {
            this.prevValue = currentValue; // Initialisierung, wenn noch kein vorheriger Wert existiert
            console.log(`[${this.name}] prevValue initialisiert: ${this.prevValue}`);
        }
        const smoothedValue = alpha * currentValue + (1 - alpha) * this.prevValue;
        this.prevValue = smoothedValue; // `prevValue` wird aktualisiert
        console.log(`[${this.name}] Glättung: currentValue=${currentValue}, prevValue=${this.prevValue}, smoothedValue=${smoothedValue}`);
        return smoothedValue;
    }

    updateSetPoint() {
        this.SetPoint = (this.minValue + this.maxValue) / 2; // Zielwert
    }

    // PID-Berechnung mit Zeitdifferenz und korrekt verwendetem `prevValue`
    compute(currentValue, useSmoothing = false, alpha = 0.1) {
        if (typeof currentValue !== 'number' || isNaN(currentValue)) {
            console.error(`[${this.name}] Ungültiger Eingabewert: ${currentValue}`);
            return this.minValue; // Standardausgabe bei Fehler
        }

        // Sicherstellen, dass der SetPoint korrekt aktualisiert wird
        if (typeof this.updateSetPoint === 'function') {
            this.updateSetPoint();
        } else {
            console.warn(`[${this.name}] updateSetPoint() ist nicht definiert.`);
        }

        const now = Date.now(); // Aktuelle Zeit in Millisekunden
        const deltaTime = this.lastComputeTime ? (now - this.lastComputeTime) / 1000 : 0; // Zeitdifferenz in Sekunden
        this.lastComputeTime = now;

        if (deltaTime === 0) {
            console.warn(`[${this.name}] DeltaTime ist 0. Keine Berechnung durchgeführt.`);
            return this.minValue; // Keine Berechnung, falls keine Zeit vergangen ist
        }

        const input = useSmoothing ? this.smoothInput(currentValue, alpha) : currentValue;
        const error = this.SetPoint - input;

        // Debugging: Fehlervergleich und Eingabewerte
        console.log(`[${this.name}] Fehlervergleich: error=${error}, prevError=${this.prevError}`);
        console.log(`[${this.name}] Eingabewerte: input=${input}, SetPoint=${this.SetPoint}`);

        // Berechnung des Integral- und Derivativen Anteils mit Zeitdifferenz
        this.integral += error * deltaTime;
        this.clampIntegral();
        const derivative = (error - this.prevError) / deltaTime;

        // Debugging: DeltaTime, Integral und Derivative
        console.log(`[${this.name}] DeltaTime=${deltaTime}, Integral=${this.integral}, Derivative=${derivative}`);

        // PID-Ausgabe
        const output = (this.Kp * error) + (this.Ki * this.integral) + (this.Kd * derivative);

        // Fehler für nächste Iteration speichern
        this.prevError = error;

        // Begrenzung der Ausgabe
        const boundedOutput = Math.max(this.minValue, Math.min(this.maxValue, output));

        // Debugging: Ausgabe
        console.log(`[${this.name}] PID-Ausgabe: output=${output}, boundedOutput=${boundedOutput}`);

        return boundedOutput;
    }
}

class OGBPIDController1{
    constructor(name,Kp, Ki, Kd, minValue, maxValue) {
        this.name = name
        this.Kp = Kp; // Proportionaler Faktor
        this.Ki = Ki; // Integraler Faktor
        this.Kd = Kd; // Derivativer Faktor
        this.SetPoint = 0
        this.minValue = minValue; // Minimalwert
        this.maxValue = maxValue; // Maximalwert
        this.integral = 0; // Summierter Fehler (für Ki)
        this.prevError = 0; // Fehler aus der vorherigen Berechnung (für Kd)
    }

    updateProportional(value){
        if(value !== this.Kp){
            this.Kp = value
        } 
    }

    updateIntegral(value){
        if(value !== this.Ki){
            this.Ki = value
        } 
    }

    updateDerivative(value){
        if(value !== this.Kd){
            this.Kd = value
        } 
    }

    compute(currentValue) {
        const setPoint = (this.minValue + this.maxValue) / 2;
        this.SetPoint = parseFloat(setPoint)
        const error = setPoint - currentValue;

        // Begrenzung für den Integralwert
        this.integral = Math.max(-100, Math.min(100, this.integral + error));

        const derivative = error - this.prevError;
        const output = (this.Kp * error) + (this.Ki * this.integral) + (this.Kd * derivative);

        this.prevError = error;

        return Math.max(this.minValue, Math.min(this.maxValue, output)); // Begrenzte Ausgabe
    }

    compute2(currentValue) {
        const setPoint = (this.minValue + this.maxValue) / 2;
        const error = setPoint - currentValue;
        this.integral += error;
        const derivative = error - this.prevError;

        //node.warn(`${this.name} Berechnung: SetPoint=${setPoint}, Error=${error}, Integral=${this.integral}, Derivative=${derivative}`);

        const output = (this.Kp * error) + (this.Ki * this.integral) + (this.Kd * derivative);
        this.prevError = error;

        //node.warn(`${this.name} PID-Ausgabe: ${output}`);
        return output;
    }

}

class Device {
    constructor(deviceName, deviceType = "generic") {
        this.name = deviceName;
        this.deviceType = deviceType;
        this.isRunning = false;
        this.isDimmable = false;
        this.needChange = false;
        this.action = "";
        this.inRoomName = "";
        this.isfromAmbient = false;
        this.isLocked = false;
        this.lockedFor = "";

        this.switches = [];
        this.sensors = [];
        this.data = {};
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        this.updateChangedData(this.data, data);

        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.checkIfDimmable();
    }

    updateChangedData(currentData, newData) {
        if (!newData || typeof newData !== "object") return {};
        if (!currentData || typeof currentData !== "object") currentData = {};

        let changedData = {};

        Object.keys(newData).forEach(function (key) {
            const newValue = newData[key];
            const currentValue = currentData[key];

            if (currentValue !== newValue) {
                changedData[key] = newValue;
                currentData[key] = newValue;
            }
        });
        return changedData;
    }

    setFromtent(roomName) {
        if (roomName !== this.inRoomName) {
            this.inRoomName = roomName;
        }
    }

    identifyIfFromAmbient() {
        this.isfromAmbient = typeof this.inRoomName === "string" &&
            this.inRoomName.toLowerCase().includes("ambient");
    }

    identifySwitchesAndSensors() {
        if (!this.data || typeof this.data !== "object") return;

        const keys = Object.keys(this.data);
        this.switches = keys.filter((key) =>
            key.startsWith("switch.") || key.startsWith("light.") || key.startsWith("fan.") || key.startsWith("climate.")|| key.startsWith("humidifier")
        );
        this.sensors = keys.filter((key) =>
            key.startsWith("sensor.") || key.startsWith("select.") || key.startsWith("number.") || key.startsWith("text.") || key.startsWith("time.")
        );
    }


    updateIsRunningState() {
        this.isRunning = false;

        if (!this.data || typeof this.data !== "object") {
            return;
        }

        const checkKeys = ["fan.", "light.", "climate.", "switch.", "humidifier."];
        for (const prefix of checkKeys) {
            const keys = Object.keys(this.data).filter((key) => key.startsWith(prefix));
            if (keys.some((key) => this.data[key] === "on")) {
                this.isRunning = true;
                return;
            }
        }
    }

    checkIfDimmable() {
        const allowedDeviceTypes = ["ventilation", "exhaust", "light"]; // Erlaubte Gerätetypen
        if (!allowedDeviceTypes.includes(this.deviceType)) {
            //console.log(`Dimmprüfung nicht erlaubt für Gerätetyp: ${this.deviceType}`);
            return;
        }
        if (this.foundDuty === false)return
        if (this.isDimmable) return; // Bereits als dimmbar erkannt
        if (this.name === "ogb") return; // Spezielle Ausnahme

        if (!this.data || typeof this.data !== "object") {
            console.log("Keine gültigen Daten gefunden, um Dimmfähigkeit zu prüfen.");
            return;
        }

        // Schlüsselwörter, die auf Dimmfähigkeit hinweisen
        const dimmableKeys = [
            "duty",
            "dutycycle",
            "duty_cycle",
            "fan.",
            "light.",
            "number.",
            "select."
        ];

        console.log("Prüfe auf Dimmfähigkeit. Verfügbare Daten:", Object.keys(this.data));

        // Prüfe, ob einer der Schlüssel in den Gerätedaten enthalten ist
        this.isDimmable = Object.keys(this.data).some((key) => {
            const match = dimmableKeys.some((dimmableKey) => key.toLowerCase().includes(dimmableKey));
            if (match) {
                console.log(`Dimmbare Eigenschaft gefunden: ${key}`);
            }
            return match;
        });

        if (!this.isDimmable) {
            console.log("Keine dimmbaren Eigenschaften in den Daten gefunden.");
            this.foundDuty = false
        } else {
            console.log("Das Gerät ist dimmbar.");
            this.foundDuty = true
        }
    }



    prepareAction(finalActions) {
        if (finalActions.hasOwnProperty(this.deviceType)) {
            const actionValue = finalActions[this.deviceType];

            if (this.deviceType === "light") {
                this.needChange = actionValue !== "unchanged";
                this.action = actionValue;
            } else if (this.deviceType === "climate") {
                if (finalActions.climate && typeof finalActions.climate === "object") {
                    for (const [mode, action] of Object.entries(finalActions.climate)) {
                        if (action !== "unchanged") {
                            this.needChange = true;
                            this.action = { mode, action };
                            break;
                        }
                    }
                } else {
                    this.action = "unchanged";
                }
            } else {
                this.needChange = actionValue !== "unchanged" && ["maximum", "reduced", "increased", "minimum", "on", "off"].includes(actionValue);
                this.action = actionValue;
            }
        } else {
            this.needChange = false;
            this.action = "unchanged";
        }

        return this;
    }

    evalAction() {
        return this.action !== "unchanged";
    }

    turnOFF() {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            return { entity_id: entity, action: "off" };
        }
    }

    turnON() {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            return { entity_id: entity, action: "on" };
        }
    }
}

class Light extends Device {
    constructor(name) {
        super(name, "light");
        this.isInitialized = false;
        this.dutyCycle = null;
        this.voltage = 0.0;
        this.minDuty = 20;
        this.maxDuty = 100;

        // Light Times
        this.lightOnTime = ""; // Startzeit des Lichts
        this.lightOffTime = ""; // Endzeit des Lichts
        this.isScheduled = false; // Ob das Licht Zeitpläne berücksichtigt

        // Sunrise/SunSet StepSize
        this.stepSize = 1; // Schrittweite für Änderungen

        // CONTROL VARS
        this.controlOverVoltage = false;
        this.controledOverOGB = true
        this.worksWithCO2 = false;

        // PHASE VARS
        this.currentPlantPhase = {
            phase:"",
            min: 0,
            max: 0,
        };
        this.PlantStageMinMax = {
            Germ: {
                min: 20,
                max: 30,
                phase:"",
            },
            Veg: {
                min: 30,
                max: 55,
                phase:"",
            },
            Flower: {
                min: 70,
                max: 100,
                phase:"",
            },
        };
        // Sunrise and Sunset Data       
        this.sunPhases={
            sunRise:{
                isSunRise: false,
                isRunning: false,
                time:"",
                minSunRise:20,
                maxSunRise: this.currentPlantPhase.max,
            },
            sunSet:{
                isSunSet: false,
                isRunning: false,
                time: "",
                minSunSet:20,
                maxSunSet: this.currentPlantPhase.max,
                startDuty: null,
            }
        }
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.setCurrenPlantPhaseName(context);
        this.checkIfDimmable();
        this.identifyIfControledByVoltage();
        this.identifyIfControledByOGB(context.isPlantDay.lightbyOGBControl);
        this.setLightTimes(context);
        this.setSunTimes(context.isPlantDay.sunRiseTimes, context.isPlantDay.sunSetTimes);
    
        // **Validiere Sunrise und Sunset**
        this.validateSunTimes();
    
        if (!this.controledOverOGB) {
            this.resetOGBControl();
        }
    
        if (!this.isInitialized) {
            this.initializeDutyCycle();
            this.isInitialized = true;
        } else {
            this.findDutyCycle();
        }
    }  
    
    initializeDutyCycle() {
        if (!this.isDimmable) return;
    
        // Versuche, den Duty-Cycle zu finden
        this.findDutyCycle();
    
        // Wenn kein Duty-Cycle gesetzt wurde, initialisiere ihn
        if (this.dutyCycle === null || this.dutyCycle === undefined) {
            this.dutyCycle = this.minDuty; // Setze auf den minimalen Wert der aktuellen Phase
            console.log(`${this.inRoomName} - ${this.name}: Duty Cycle nicht gefunden. Initialisiere auf ${this.dutyCycle}%.`);
        } else {
            console.log(`${this.name}: Bestehender Duty Cycle gefunden: ${this.dutyCycle}%.`);
        }
    } 

    identifyIfControledByOGB(controledBY) {
        if (typeof controledBY !== "boolean") {
            console.log(`${this.inRoomName} - ${this.name}: Ungültiger Wert für controledBY.`);
            return;
        }
    
        if (this.controledOverOGB !== controledBY) {
            this.controledOverOGB = controledBY;
            if (!this.controledOverOGB) {
                this.resetOGBControl();
            }
        }
    }
    
    identifyIfControledByVoltage(){
        if (!this.isDimmable) return;
        const voltageKey = Object.keys(this.data).find((key) =>
            key.toLowerCase().includes("voltage") && !key.toLowerCase().startsWith("sensor.")
        );
        if(voltageKey){
            this.controlOverVoltage = true
        }else{
            this.controlOverVoltage = false
        }
    }

    voltageFactorToDutyCycle(voltage) {
        return Math.floor(voltage * 10);
    }

    resetOGBControl() {
        if (!this.controledOverOGB) {
            console.log(`${this.name}: Steuerung durch OGB deaktiviert. Alle relevanten Daten werden zurückgesetzt.`);
    
            // Zurücksetzen aller OGB-gesteuerten Variablen
            this.resetPhaseAndTimes();
            this.isScheduled = false;
            this.isRunning = false;
            this.dutyCycle = null;
            this.controlOverVoltage = false;
    
            // Sicherstellen, dass alle Aktionen zurückgesetzt werden
            this.action = "unchanged";
    
            // Entfernen von möglichen Locks
            this.isLocked = false;
            this.lockedFor = "";
    
            console.log(`${this.name}: Steuerung zurückgesetzt.`);
        }
    }
    
    validateSunTimes() {
        if (!this.isDimmable) return;
        // Überprüfen, ob Sunrise- oder Sunset-Zeit auf "00:00:00" gesetzt ist
        if (!this.sunPhases.sunRise.time || this.sunPhases.sunRise.time === "00:00:00") {
            this.sunPhases.sunRise.isSunRise = false;
            console.log(`${this.name}: Sunrise deaktiviert, da Zeit auf 00:00:00 gesetzt ist oder nicht vorhanden.`);
        } else {
            this.sunPhases.sunRise.isSunRise = true;
        }

        if (!this.sunPhases.sunSet.time || this.sunPhases.sunSet.time === "00:00:00") {
            this.sunPhases.sunSet.isSunSet = false;
            console.log(`${this.name}: Sunset deaktiviert, da Zeit auf 00:00:00 gesetzt ist oder nicht vorhanden.`);
        } else {
            this.sunPhases.sunSet.isSunSet  = true;
        }

        console.log(`${this.name}: isSunrise: ${this.sunPhases.sunRise.isSunRise}, isSunset: ${this.sunPhases.sunSet.isSunSet}`);
    }   
   
    findDutyCycle() {
        if (!this.isDimmable) return;
        if (!this.data) {
            console.log(`${this.name}: Keine Gerätedaten gefunden.`);
            return;
        }
    
        const voltageKey = Object.keys(this.data).find((key) =>
            key.toLowerCase().includes("voltage") && !key.toLowerCase().startsWith("sensor.")
        );
    
        const dutyCycleKey = Object.keys(this.data).find((key) =>
            key.toLowerCase().includes("dutycycle") || key.toLowerCase().includes("duty_cycle") ||
            key.toLowerCase().includes("lightpower")
        );
    
        if (voltageKey) {
            const voltageValue = parseFloat(this.data[voltageKey]);
            if (!isNaN(voltageValue)) {
                const calculatedDuty = this.voltageFactorToDutyCycle(voltageValue);
                const clampedDuty = this.clampDutyCycle(calculatedDuty);
                if (clampedDuty !== this.dutyCycle) {
                    this.dutyCycle = clampedDuty;
                    this.voltage = voltageValue;
                    console.log(`${this.inRoomName} - ${this.name}: Duty Cycle aus Voltage berechnet: ${this.dutyCycle}%, Voltage: ${this.voltage}.`);
                }
            }
        }
    
        if (dutyCycleKey) {
            const dutyCycleValue = parseInt(this.data[dutyCycleKey], 10);
            if (!isNaN(dutyCycleValue)) {
                const clampedDuty = this.clampDutyCycle(dutyCycleValue);
                if (clampedDuty !== this.dutyCycle) {
                    this.dutyCycle = clampedDuty;
                    console.log(`${this.inRoomName} - ${this.name}: Duty Cycle aus Daten gesetzt auf ${this.dutyCycle}%.`);
                }
            }
        }
    }
    
    clampDutyCycle(dutyCycle) {
        return Math.max(this.minDuty, Math.min(this.maxDuty, dutyCycle));
    }

    clampSunriseDuty(dutyCycle) {
        return Math.max(this.sunPhases.sunRise.minSunRise, Math.min(this.sunPhases.sunRise.maxSunRise, dutyCycle));
    } 

    clampSunsetDuty(duty) {
        return Math.max(this.sunPhases.sunSet.minSunSet, Math.min(this.sunPhases.sunSet.maxSunSet, duty));
    }

    setCurrenPlantPhaseName(context) {
        if (!context || !context.plantStage  ) return;
        if (this.currentPlantPhase.phase !== context.plantStage ) {
            this.currentPlantPhase.phase = context.plantStage;
            this.setForPlantLightPhase();
        }
    }

    setForPlantLightPhase() {
        const phase = this.currentPlantPhase.phase;
        if (phase.includes("Germination") || phase.includes("Clones")) {
            this.currentPlantPhase = { ...this.PlantStageMinMax.Germ };
        } else if (phase.includes("Veg")) {
            this.currentPlantPhase = { ...this.PlantStageMinMax.Veg };
        } else if (phase.includes("Flower")) {
            this.currentPlantPhase = { ...this.PlantStageMinMax.Flower };
        }
        this.minDuty = this.currentPlantPhase.min;
        this.maxDuty = this.currentPlantPhase.max;
        this.sunPhases.sunRise.maxSunRise = this.currentPlantPhase.max
        this.sunPhases.sunSet.maxSunSet = this.currentPlantPhase.max
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
        if (!this.isDimmable) return;
        if (this.isDimmable) {
            if (sunRiseTime || sunSetTime !== "") {
                this.sunPhases.sunRise.time = sunRiseTime;
                this.sunPhases.sunSet.time = sunSetTime;
            }
            this.validateSunTimes()
        } else {
            return { ERROR: "NoDuty" }
        }

    }

    parseTime(timeString) {
        if (!timeString || typeof timeString !== "string") {
            console.log("DEBUG: Invalid time string provided:", timeString);
            return 0; // Fallback auf Mitternacht
        }

        const [hours, minutes, seconds = 0] = timeString.split(":").map(Number);
        return (hours * 3600) + (minutes * 60) + seconds;
    }

    parseSunTime(timeString) {
        if (!this.isDimmable) return 
        if (!timeString || typeof timeString !== "string") {
            console.log("DEBUG: Invalid time string provided:", timeString);
            return 0; // Fallback auf Mitternacht
        }

        const [hours, minutes, seconds = 0] = timeString.split(":").map(Number);
        return (hours * 3600) + (minutes * 60) + seconds;
    }

    checkforStartStop() {
        if(!this.controledOverOGB)return
        const currentTime = new Date();
        const currentSeconds = this.parseTime(currentTime.toTimeString().split(" ")[0]);
        const startTime = this.parseTime(this.lightOnTime);
        const endTime = this.parseTime(this.lightOffTime);
    
        //console.log(`DEBUG: Current Time: ${currentSeconds}, Start Time: ${startTime}, End Time: ${endTime}`);
    
        let isLightOn;
    
        if (endTime < startTime) {
            isLightOn = currentSeconds >= startTime || currentSeconds <= endTime;
        } else {
            isLightOn = currentSeconds >= startTime && currentSeconds <= endTime;
        }
    
        //console.log(`DEBUG: Is Light On: ${isLightOn}, Is Running: ${this.isRunning}`);
    
        if (!isLightOn && this.isRunning) {
            console.log(`${this.inRoomName} - ${this.name}: Turning light OFF as current time is outside schedule.`);
            this.action = "off";
            return this.turnOFF();
        }
    
        if (isLightOn && !this.isRunning) {
            console.log(`${this.inRoomName} - ${this.name}: Turning light ON as current time is within schedule.`);
            this.action = "on";
            return this.turnON();
        }
    
        console.log(`${this.inRoomName} - ${this.name}: No changes needed for light ON/OFF schedule.`);
        return null;
    }

    checkforPhase() {
        if (!this.controledOverOGB) return;

        this.validateSunTimes();
        const currentTime = new Date();
        const currentSeconds = this.parseSunTime(currentTime.toTimeString().split(" ")[0]);

        const lightOnSeconds = this.parseSunTime(this.lightOnTime);
        const lightOffSeconds = this.parseSunTime(this.lightOffTime);
        const sunRiseSeconds = this.parseSunTime(this.sunPhases.sunRise.time);
        const sunSetSeconds = this.parseSunTime(this.sunPhases.sunSet.time);

        const sunriseEndSeconds = lightOnSeconds + sunRiseSeconds;
        const sunsetStartSeconds = lightOffSeconds - sunSetSeconds;

        const actions = [];

        //console.log(`DEBUG: Current Time (Seconds): ${currentSeconds}`);
        //console.log(`DEBUG: Light On Time: ${lightOnSeconds}, Light Off Time: ${lightOffSeconds}`);
        //console.log(`DEBUG: Sunrise End: ${sunriseEndSeconds}, Sunset Start: ${sunsetStartSeconds}`);
        //console.log(`DEBUG: Current Duty Cycle: ${this.dutyCycle}`);
        //console.log(`DEBUG: Current Voltage: ${this.voltage}`);

        // **Sonnenaufgang (Sunrise Phase)**
        if (this.sunPhases.sunRise.isSunRise && currentSeconds >= lightOnSeconds && currentSeconds <= sunriseEndSeconds) {
            console.log(`${this.name}: Sunrise phase active.`);
            this.sunPhases.sunRise.isRunning = true
            const elapsedSunrise = currentSeconds - lightOnSeconds;
            const totalSunriseDuration = sunRiseSeconds;

            //console.log(`DEBUG: Elapsed Sunrise Seconds: ${elapsedSunrise}, Total Sunrise Duration: ${totalSunriseDuration}`);
            //console.log(`DEBUG: MinSunRise: ${this.sunPhases.sunRise.minSunRise}, MaxSunRise: ${this.sunPhases.sunRise.maxSunRise}`);

            const totalIncrement = this.sunPhases.sunRise.maxSunRise - this.sunPhases.sunRise.minSunRise;
            const incrementFactor = Math.min(elapsedSunrise / totalSunriseDuration, 1);
            const dutyIncrement = totalIncrement * incrementFactor;

            //console.log(`DEBUG: Increment Factor: ${incrementFactor}, Duty Increment: ${dutyIncrement}`);

            let newDuty = Math.floor(this.sunPhases.sunRise.minSunRise + dutyIncrement);

            // **Erzwinge Maximalwert am Ende der Sunrise-Phase**
            if (currentSeconds === sunriseEndSeconds) {
                newDuty = this.sunPhases.sunRise.maxSunRise;
                console.log(`${this.inRoomName} - ${this.name}: Sunrise phase ending. Forcing max Duty Cycle: ${newDuty}`);
                this.sunPhases.sunRise.isRunning = false
            }

            const newVoltage = parseFloat((newDuty / 10).toFixed(1));

            //console.log(`DEBUG: Calculated Duty: ${newDuty}, Voltage: ${newVoltage}`);

            if (this.dutyCycle !== newDuty || this.voltage !== newVoltage) {
                //console.log(`DEBUG: Sunrise Phase - New Duty Cycle: ${newDuty}, Voltage: ${newVoltage}`);
                actions.push(this.changeDuty(newDuty));
            } else {
                //console.log(`DEBUG: No changes to Duty Cycle during Sunrise Phase.`);
            }
        }


        // **Sonnenuntergang (Sunset Phase)**
        if (this.sunPhases.sunSet.isSunSet && currentSeconds >= sunsetStartSeconds && currentSeconds <= lightOffSeconds) {
            console.log(`${this.inRoomName} - ${this.name}: Sunset phase active.`);
            this.sunPhases.sunSet.isRunning = true
            // Speichere den Start-Duty-Cycle bei Beginn der Sunset-Phase
            if (this.sunPhases.sunSet.startDuty === null) {
                this.sunPhases.sunSet.startDuty = this.dutyCycle; // Initialisiere den Start-Duty-Cycle
                //console.log(`DEBUG: Sunset Start Duty Cycle initialized: ${this.sunPhases.sunSet.startDuty}`);
            }

            const elapsedSunset = currentSeconds - sunsetStartSeconds;
            const totalSunsetDuration = sunSetSeconds;

            //console.log(`DEBUG: Elapsed Sunset Seconds: ${elapsedSunset}, Total Sunset Duration: ${totalSunsetDuration}`);

            const totalDecrement = this.sunPhases.sunSet.startDuty - this.sunPhases.sunSet.minSunSet; // Differenz vom Start-Duty-Cycle
            const decrementFactor = Math.min(elapsedSunset / totalSunsetDuration, 1); // Fortschritt (0-1)
            const dutyDecrement = totalDecrement * decrementFactor;

            //console.log(`DEBUG: Decrement Factor: ${decrementFactor}, Duty Decrement: ${dutyDecrement}`);

            const newDuty = this.clampSunsetDuty(
                Math.floor(this.sunPhases.sunSet.startDuty - dutyDecrement) // Subtrahiere Reduktion von Start-Duty
            );
            const newVoltage = parseFloat((newDuty / 10).toFixed(1)); // Voltage = DutyCycle / 10

            //console.log(`DEBUG: Calculated Duty: ${newDuty}, Voltage: ${newVoltage}`);

            if (this.dutyCycle !== newDuty || this.voltage !== newVoltage) {
                //console.log(`DEBUG: Sunset Phase - New Duty Cycle: ${newDuty}, Voltage: ${newVoltage}`);
                actions.push(this.changeDuty(newDuty)); // Aktualisiert Werte korrekt
            } else {
                //console.log(`DEBUG: No changes to Duty Cycle during Sunset Phase.`);
            }

            // Zurücksetzen des Start-Duty-Cycle bei Ende der Sunset-Phase
            if (currentSeconds > lightOffSeconds) {
                this.sunPhases.sunSet.startDuty = null; // Zurücksetzen
                this.sunPhases.sunSet.isRunning = false
            }
        }

        return actions;
    }
    
    resetPhaseAndTimes() {
        this.action = "Unchanged"
        this.currentPlantPhase.max = 0
        this.currentPlantPhase.min = 0
        this.dutyCycle = null
        this.minDuty = null
        this.maxDuty = null
        this.lightOnTime = ""
        this.lightOffTime = ""
        this.sunPhases.sunRise.time = "00:00:00"
        this.sunPhases.sunSet.time = "00:00:00"
    }

    handleGeneralControl() {
        if(this.controledOverOGB){
            if (!this.isDimmable) {
                console.log(`${this.inRoomName} - ${this.name}: Gerät nicht Dimmbar.`);
                return { Light: `${this.switches[0]}`, Action: "NoDimmeActionPossible" };
            } else {
                // Duty-Modus: Verwalte Duty-Cycle
                let newDuty;
                switch (this.action) {
                    case "increased":
                        newDuty = Math.min(this.maxDuty, this.dutyCycle + this.stepSize);
                        break;
                    case "reduced":
                        newDuty = Math.max(this.minDuty, this.dutyCycle - this.stepSize);
                        break;
                    case "maximum":
                        newDuty = this.maxDuty;
                        break;
                    case "minimum":
                        newDuty = this.minDuty;
                        break;
                    case "reset":
                        newDuty = this.minDuty;
                        break;
                    default:
                        return null; // Unbekannte Aktion
                }
        
                if (newDuty !== this.dutyCycle) {
                    return this.changeDuty(newDuty);
                }
            }
        
            return null; // Keine Änderungen notwendig
        }else{
            return null 
        }
   
    }
    
    runAction() {
        if (!this.controledOverOGB) {
            console.log(`${this.inRoomName} - ${this.name}: Steuerung durch OGB deaktiviert.`);
            return { Light: `${this.switches[0]}`, Action: "NoControlForOGB" };
        }
        
        if(this.controledOverOGB){
            // Prüfen, ob Start/Stop-Logik angewendet werden muss
            const startStopAction = this.checkforStartStop();
            if (startStopAction) {
                return [startStopAction]; // Priorisiere Start/Stop
            }
        }

    
        const actions = [];
    
        // Sunrise/Sunset-Logik prüfen
        const phaseActions = this.checkforPhase();
        if (phaseActions && phaseActions.length > 0) {
            console.log(`${this.inRoomName} - ${this.name} SunPhase actions found, skipping general actions.`);
            actions.push(...phaseActions);
        }
    
        // Allgemeine Steuerung ausführen, wenn keine Phase aktiv ist
        if (!phaseActions || phaseActions.length === 0) {
            console.log("DEBUG: No active phase. Executing general control.");
            const generalAction = this.handleGeneralControl();
            if (generalAction) {
                actions.push(generalAction);
            }
        }
    
        // Entfernen redundanter Aktionen
        const filteredActions = actions.filter((action, index, self) =>
            self.findIndex(a => a.entity_id === action.entity_id && a.action === action.action) === index
        );
    
        //console.log(`DEBUG: Actions nach Verarbeitung: ${JSON.stringify(filteredActions, null, 2)}`);
        return filteredActions.length > 0 ? filteredActions : [];
    }

    changeDuty(newDuty) {
        if (!this.isDimmable) {
            return { entity_id: this.switches[0], action: "NoDutyCycle" };
        }
    
        const clampedDuty = Math.max(this.sunPhases.sunRise.minSunRise, Math.min(this.sunPhases.sunRise.maxSunRise, newDuty));
        const newVoltage = parseFloat((clampedDuty / 10).toFixed(1)); // Voltage = DutyCycle / 10
    
        //console.log(`DEBUG: Current DutyCycle: ${this.dutyCycle}, New DutyCycle: ${clampedDuty}`);
        //console.log(`DEBUG: Current Voltage: ${this.voltage}, New Voltage: ${newVoltage}`);
    
        // Fall: Kontrolle nur über Voltage
        if (this.controlOverVoltage) {
            if (this.voltage !== newVoltage) {
                this.voltage = newVoltage;
                this.dutyCycle = clampedDuty; // Voltage und Duty synchronisieren
                console.log(`${this.name}: Voltage wird aktualisiert.`);
                const voltageEntity = this.sensors.find(key =>
                    key.toLowerCase().includes("voltage")
                );
                return [
                    { entity_id: voltageEntity, action: "number", value: newVoltage }
                ];
            }
            return { entity_id: this.switches[0], action: "NoChangeNeeded" };
        }
    
        // Fall: Kontrolle über DutyCycle
        if (this.dutyCycle === clampedDuty && this.voltage === newVoltage) {
            console.log(`${this.inRoomName} - ${this.name}: Keine Änderung nötig. Duty-Cycle und Voltage bleiben gleich.`);
            return { entity_id: this.switches[0], action: "NoChangeNeeded" };
        }
    
        // Aktualisiere Werte
        this.dutyCycle = clampedDuty;
        this.voltage = newVoltage;
    
        return [
            { entity_id: this.switches[0], action: "dutycycle", dutycycle: clampedDuty }
        ];
    }

    turnLightON() {
        const entity = this.switches[0];

        if (!this.isRunning) {
            this.isRunning = true;
            console.log(`${this.inRoomName} - ${this.name}: Gerät wurde eingeschaltet in ${this.inRoomName}.`);

            if (this.isDimmable) {
                const newVoltage = parseFloat((this.dutyCycle / 10).toFixed(1));
                this.voltage = newVoltage;

                const voltageEntity = this.sensors.find(key =>
                    key.toLowerCase().includes("voltage")
                );

                console.log(`${this.name}: Voltage auf ${newVoltage}V gesetzt basierend auf Duty-Cycle ${this.dutyCycle}.`);
                return [
                    { entity_id: entity, action: "on" },
                    { entity_id: voltageEntity, action: "number", value: newVoltage }
                ];
            }

            return { entity_id: entity, action: "on" };
        } else {
            console.log(`${this.name}: Gerät ist bereits eingeschaltet in ${this.inRoomName}.`);
            return { entity_id: entity, action: "AlreadyON" };
        }
    

    }

    turnLightOFF() {
        const entity = this.switches[0]; // Dynamische Entität
        if (this.isRunning) {
            this.isRunning = false;
            console.log(`${this.inRoomName} - ${this.name}: Gerät wurde ausgeschaltet in ${this.inRoomName}.`);
            return { entity_id: entity, action: "off" };
        } else {
            console.log(`${this.inRoomName} - ${this.name}: Gerät ist bereits ausgeschaltet in ${this.inRoomName}.`);
            return { entity_id: entity, action: "AlreadyOFF" };
        }
    }

}

class Exhaust extends Device {
    constructor(name) {
        super(name, "exhaust");
        this.isInitialized = false;
        this.dutyCycle = null;
        this.minDuty = 10;
        this.maxDuty = 95;
    }

    setData(data, context) {
        this.setFromtent(context.tentName)
        this.identifyIfFromAmbient()
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.checkIfDimmable();
        if (!this.isInitialized) {
            this.initializeDutyCycle();
            this.isInitialized = true;
        } else {
            this.findDutyCycle();
        }
    }

    initializeDutyCycle() {
        if (!this.isDimmable) return
        let initDuty = 50
        this.dutyCycle = initDuty; // Initialisiere auf 50%
        node.warn(`${this.inRoomName} - ${this.name}: Initialisiere Duty Cycle auf ${this.dutyCycle}%.`);
    }

    findDutyCycle() {
        if (!this.data) {
            node.warn(`${this.inRoomName} - ${this.name}: Keine Gerätedaten vorhanden.`);
            return;
        }

        const dutyCycleKey = Object.keys(this.data).find((key) =>
            key.toLowerCase().includes("dutycycle") || key.toLowerCase().includes("duty_cycle")
        );

        if (dutyCycleKey) {
            const dutyCycleValue = parseInt(this.data[dutyCycleKey], 10);
            if (!isNaN(dutyCycleValue)) {
                if (dutyCycleValue === this.dutyCycle) return
                this.dutyCycle = this.clampDutyCycle(dutyCycleValue);
                //node.warn(`${this.name}: Duty Cycle aus Daten gesetzt auf ${this.dutyCycle}%.`);
            }
        } else {
            node.warn(`${this.inRoomName} - ${this.name}: Kein Duty Cycle-Schlüssel gefunden.`);
        }
    }

    setDutyCycle(dutyCycle) {
        const clampedDuty = this.clampDutyCycle(dutyCycle);

        if (clampedDuty !== this.dutyCycle) {
            this.dutyCycle = clampedDuty;
            return clampedDuty;
        }

        return

    }

    clampDutyCycle(dutyCycle) {
        return Math.max(this.minDuty, Math.min(this.maxDuty, dutyCycle));
    }

    changeDuty(duty) {
        const newDuty = this.clampDutyCycle(duty);
        if (this.switches?.[0]) {
            const switchId = this.switches[0];
            if (newDuty !== this.dutyCycle) {
                const clampedDuty = this.clampDutyCycle(duty);
                this.dutyCycle = clampedDuty;
            } else {
                return { entity_id: switchId, action: "SameDuty", dutycycle: newDuty };
            }

            node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle ${this.dutyCycle} an Abluft ${switchId} gesendet.`);
            return { entity_id: switchId, action: "dutycycle", dutycycle: newDuty };
        } else {
            return { error: "No switch available" };
        }
    }

    runAction() {
        if (!this.needChange) {
            return { Exhaust: `${this.name}`, Action: "NoChangeNeeded" };
        }

        const switchId = this.switches?.[0];
        if (!switchId) {
            return { error: "No switch available" };
        }

        switch (this.action) {
            case "maximum":
                if (this.isDimmable) {
                    return this.changeDuty(this.maxDuty);
                } else {
                    return this.turnON(switchId);
                }
            case "minimum":
                if (this.isDimmable) {
                    return this.changeDuty(this.minDuty);
                } else {
                    return this.turnON(switchId);
                }
            case "increased":
                if (this.isDimmable) {
                    const increasedDuty = Math.min(this.dutyCycle + 5, this.maxDuty);
                    return this.changeDuty(increasedDuty);
                } else {
                    return this.turnON(switchId);
                }
            case "reduced":
                if (this.isDimmable) {
                    const reducedDuty = Math.max(this.dutyCycle - 5, this.minDuty);
                    return this.changeDuty(reducedDuty);
                } else {
                    return this.turnOFF(switchId);
                }


            case "on":
                return this.turnON(switchId);

            case "off":
                return this.turnOFF(switchId);

            case "unchanged":
                return { entity_id: switchId, action: "UNCHANGED" };

            default:
                node.warn(`${this.inRoomName} - ${this.name}: Unbekannte Aktion.`);
                return { Exhaust: `${this.name}`, Action: "UnknownAction" };
        }
    }

    turnON(switchId) {
        if (!this.isRunning) {
            this.isRunning = true;
            node.warn(`${this.inRoomName} - ${this.name}: Lüfter eingeschaltet in ${this.inRoomName}.`);
            return { entity_id: switchId, action: "on" };
        }
        return { entity_id: switchId, action: "Already ON" };
    }

    turnOFF(switchId) {
        if (this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.inRoomName} - ${this.name}: Lüfter ausgeschaltet in ${this.inRoomName}.`);
            return { entity_id: switchId, action: "off" };
        }
        return { entity_id: switchId, action: "Already OFF" };
    }
}

class Ventilation extends Device {
    constructor(name) {
        super(name, "ventilation");
        this.dutyCycle = null; // Startwert
        this.maxDuty = 75;   // Minimalwert
        this.minDuty = 100;  // Maximalwert
        this.isInitialized = false;
        this.isTasmota = false;

    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.checkIfDimmable();
        this.identifyIfTasmota(); // Prüfe, ob es ein Tasmota-Gerät ist

        if (this.isTasmota) {
            // Für Tasmota-Geräte initialisiere Duty Cycle und überspringe findDutyCycle
            if (!this.isInitialized) {
                this.initializeDutyCycle();
                this.isInitialized = true;
            }
            return;
        }

        // Für Nicht-Tasmota-Geräte den Duty Cycle aus den Daten suchen
        if (!this.isInitialized) {
            this.initializeDutyCycle();
            this.isInitialized = true;
        } else {
            this.findDutyCycle();
        }
    }

    initializeDutyCycle() {
        if (!this.isDimmable) return
        let initDuty = 50
        this.dutyCycle = initDuty; // Initialisiere auf 50%
        node.warn(`${this.name}: Initialisiere Duty Cycle auf ${this.dutyCycle}%.`);
    }

    identifyIfTasmota() {
        this.isTasmota = this.switches.some(
            (switchDevice) => typeof switchDevice === "string" && switchDevice.startsWith("light.")
        );
    }

    findDutyCycle() {
        if (!this.data) {
            node.warn(`${this.name}: Keine Gerätedaten gefunden.`);
            return;
        }

        const dutyCycleKey = Object.keys(this.data).find((key) =>
            key.toLowerCase().includes("dutycycle") || key.toLowerCase().includes("duty_cycle")
        );

        if (dutyCycleKey) {
            const dutyCycleValue = parseInt(this.data[dutyCycleKey], 10);
            if (!isNaN(dutyCycleValue)) {
                if (dutyCycleValue === this.dutyCycle) return
                this.dutyCycle = this.clampDutyCycle(dutyCycleValue);
                //node.warn(`${this.name}: Duty Cycle aus Daten gesetzt auf ${this.dutyCycle}%.`);
            }
        } else {
            node.warn(`${this.inRoomName} - ${this.name}: Kein Duty Cycle-Schlüssel gefunden.`);
        }
    }

    setDutyCycle(dutyCycle) {
        const clampedDuty = this.clampDutyCycle(dutyCycle);

        if (clampedDuty !== this.dutyCycle) {
            this.dutyCycle = clampedDuty;
            return clampedDuty;
        }

        return

    }

    clampDutyCycle(dutyCycle) {
        return Math.max(this.minDuty, Math.min(this.maxDuty, dutyCycle));
    }

    changeDuty(switchId, duty) {
        const newDuty = this.clampDutyCycle(duty);

        if (newDuty !== this.dutyCycle) {
            const clampedDuty = this.clampDutyCycle(duty);
            this.dutyCycle = clampedDuty;
        } else {
            return { entity_id: switchId, action: "SameDuty", dutycycle: newDuty };
        }

        node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle ${this.dutyCycle} an Vents ${switchId} gesendet.`);
        return { entity_id: switchId, action: "dutycycle", dutycycle: newDuty };
    }

    runAction() {
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
                node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle auf Maximum (${this.maxDuty}%) gesetzt.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, this.maxDuty));

            case "minimum":
                node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle auf Minimum (${this.minDuty}%) gesetzt.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, this.minDuty));

            case "reduced":
                const reducedDuty = Math.max(this.dutyCycle - 5, this.minDuty);
                node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle reduziert auf ${reducedDuty}%.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, reducedDuty));

            case "increased":
                const increasedDuty = Math.min(this.dutyCycle + 5, this.maxDuty);
                node.warn(`${this.inRoomName} - ${this.name}: Duty Cycle erhöht auf ${increasedDuty}%.`);
                return applyActionToSwitches((switchId) => this.changeDuty(switchId, increasedDuty));

            case "on":
                return applyActionToSwitches((switchId) => this.turnON(switchId));

            case "off":
                return applyActionToSwitches((switchId) => this.turnOFF(switchId));

            case "unchanged":
                node.warn(`${this.inRoomName} - ${this.name}: Keine Änderung erforderlich.`);
                return applyActionToSwitches((switchId) => ({ entity_id: switchId, action: "UNCHANGED" }));

            default:
                node.warn(`${this.inRoomName} - ${this.name}: Unbekannte Aktion.`);
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
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.identifyCurrentHavoc();
    }

    identifyCurrentHavoc() {
        const havocDevice = this.switches[0];
        if (!havocDevice) {
            console.warn(`${this.inRoomName} - ${this.name}: Keine Switches definiert, um HAVOC zu identifizieren.`);
            return;
        }

        const havocValue = this.data[havocDevice];

        if (havocValue && Object.values(this.havocs).includes(havocValue)) {
            this.currentHAVOC = havocValue;
            console.warn(`${this.inRoomName} - ${this.name}: HAVOC-Modus gesetzt auf "${this.currentHAVOC}".`);
        } else {
            console.warn(`${this.inRoomName} - ${this.name}: Ungültiger HAVOC-Wert "${havocValue}", Standardwert "off" wird verwendet.`);
        }
    }

    runAction() {
        if (!this.needChange || !this.action || typeof this.action !== "object") {
            console.warn(`${this.inRoomName} - ${this.name}: Keine Änderungen erforderlich.`);
            return null;
        }

        const { mode, action } = this.action;
        const lowerMode = mode.toLowerCase(); // Konvertiere in Kleinbuchstaben
        const validMode = this.havocs[lowerMode]; // Vergleiche mit `havocs` Mapping

        //console.warn(`${this.inRoomName} - Aktion empfangen: Mode = "${mode}", Action = "${action}", ValidMode = "${validMode}", CurrentHAVOC = "${this.currentHAVOC}"`);

        // Prüfen, ob der Modus ungültig ist
        if (!validMode) {
            console.warn(`${this.inRoomName} - ${this.name}: Ungültiger Modus "${mode}" erhalten. Standardwert "off" wird verwendet.`);
            return { entity_id: this.switches[0], action: "invalid_mode", received_mode: mode };
        }

        // Prüfen, ob der Modus bereits läuft
        if (this.isRunning && this.currentHAVOC.toLowerCase() === validMode) {
            console.warn(`${this.inRoomName} - ${this.name}: Keine Änderungen notwendig. Der Modus "${validMode}" ist bereits aktiv.`);
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
        if (this.currentHAVOC !== mode) {
            this.currentHAVOC = mode;
            return { entity_id: this.switches[0], action: "climate", climate_mode: mode };
        } else {
            return { entity_id: this.switches[0], action: "AllReady_Running", climate_mode: mode };
        }

    }

    turnOFF() {
        if (this.isRunning) {
            const previousMode = this.currentHAVOC;

            if (this.isRunning === true) {
                this.isRunning = false;
                this.currentHAVOC = "off";
                return { entity_id: this.switches[0], action: "off", previous_mode: previousMode };
            } else {
                return { entity_id: this.switches[0], action: "AllreadyOFF", previous_mode: previousMode };
            }
        }
        return { entity_id: this.switches[0], action: "already_off" };
    }

    changeMode(mode) {
        if (this.currentHAVOC !== mode) {
            this.currentHAVOC = mode;
            return { entity_id: this.switches[0], action: "climate", climate_mode: mode };
        } else {
            return { entity_id: this.switches[0], action: "AllReady_OFF", climate_mode: mode };
        }

    }
}

class Humidifier extends Device {
    constructor(name) {
        super(name, "humidifier");
        this.isRunning = false; // Status des Befeuchters
        this.currentHumidity = 0; // Aktueller Feuchtigkeitswert
        this.targetHumidity = 0; // Ziel-Feuchtigkeitswert
        this.minHumidity = 30; // Standard-Mindestfeuchtigkeit
        this.maxHumidity = 70; // Standard-Maximalfeuchtigkeit
        this.stepSize = 5; // Schrittweite für Änderungen
        this.realHumidifier = false; // Erkennung eines echten Luftbefeuchters
        this.hasModes = false; // Erkennung von Modis
        this.isSimpleSwitch = true; // Gerät ist nur ein einfacher Schalter
        this.modes = {
            interval: true,
            small: false,
            large: false,
        };
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.identifyHumidifierType();
        this.identifyIfHasModes();
    }

    identifyMode() {
        if (!this.sensors || !Array.isArray(this.sensors)) {
            console.log(`${this.name}: Keine Sensoren definiert.`);
            return;
        }

        // Suche nach einem passenden Sensor (select.* und mode im Namen)
        const modeSensor = this.sensors.find(sensor => sensor.startsWith("select.") && sensor.includes("mode"));

        if (!modeSensor) {
            console.log(`${this.name}: Kein passender Modus-Sensor gefunden.`);
            return;
        }

        // Moduswert aus den Daten extrahieren
        const modeValue = this.data[modeSensor];

        if (!modeValue || modeValue === "unavailable") {
            console.log(`${this.name}: Kein gültiger Moduswert verfügbar für Sensor "${modeSensor}".`);
            return;
        }

        // Alle Modi zurücksetzen
        this.modes = {
            interval: false,
            small: false,
            large: false,
        };

        // Modus basierend auf dem Wert setzen
        switch (modeValue) {
            case "interval":
                this.modes.interval = true;
                break;
            case "small":
                this.modes.small = true;
                break;
            case "large":
                this.modes.large = true;
                break;
            default:
                console.log(`${this.name}: Unbekannter Moduswert "${modeValue}" für Sensor "${modeSensor}".`);
                break;
        }

        //console.log(`${this.name}: Modus erkannt: ${modeValue}`);
    }

    identifyHumidifierType() {
        if (this.data) {
            if (Object.keys(this.data).some(key => key.startsWith("humidifier."))) {
                this.realHumidifier = true;
                this.isSimpleSwitch = false;
            } else if (Object.keys(this.data).some(key => key.startsWith("switch."))) {
                this.isSimpleSwitch = true;
                this.realHumidifier = false;
            } else {
                this.realHumidifier = false;
                this.isSimpleSwitch = true;
            }
        } else {
            console.log(`${this.name}: Keine Daten vorhanden, Standard: Einfacher Schalter.`);
            this.realHumidifier = false;
            this.isSimpleSwitch = true;
        }
    }

    identifyIfHasModes() {
        if (this.data && this.data["select.humidifier_mode"]) {
            this.realHumidifier = true;
            this.hasModes = true;
            this.isSimpleSwitch = false;
            this.identifyMode()
        } else {
            this.hasModes = false;
        }
    }

    setHumidityLevel(humlevel) {
        if (!this.realHumidifier) {
            return { entity_id: this.switches[0], action: "Unsupported" };
        }
        const entity = this.sensors[0];
        this.targetHumidity = humlevel;
        console.log(`${this.name}: Luftfeuchtigkeit auf ${humlevel}% gesetzt in ${this.inRoomName}`);
        return { entity_id: entity, action: "setHumidity", value: humlevel };
    }

    runAction() {
        if (!this.needChange) {
            return { entity_id: this.switches[0], action: "noChangesNeeded" };
        }

        // Wenn es ein einfacher Schalter ist
        if (this.isSimpleSwitch) {
            return this.action === "increased" || this.action === "on"
                ? this.turnON()
                : this.turnOFF();
        }

        // Für komplexe Geräte mit Modi
        if (this.hasModes && this.realHumidifier) {
            const actions = [];

            // Gerät einschalten, falls es aus ist
            if (!this.isRunning) {
                const turnOnAction = this.turnON();
                actions.push(turnOnAction);
            }

            // Modusänderung basierend auf der Aktion
            if (this.action === "increased") {
                const modeActions = this.changeMode("increase");
                actions.push(...(Array.isArray(modeActions) ? modeActions : [modeActions]));
            } else if (this.action === "reduced") {
                const modeActions = this.changeMode("decrease");
                actions.push(...(Array.isArray(modeActions) ? modeActions : [modeActions]));
            } else if (this.action === "off") {
                const turnOffAction = this.turnOFF();
                actions.push(turnOffAction);
            }

            return actions.length > 0 ? actions : { entity_id: this.switches[0], action: "No Action Found" };
        }

        console.log(`${this.name}: Keine passenden Aktionen gefunden.`);
        return { entity_id: this.switches[0], action: "No Action Found" };
    }


    turnON() {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            console.log(`${this.name}: Luftbefeuchter eingeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "on" };
        }
        return { entity_id: entity, action: "Already ON" };
    }

    turnOFF() {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            this.closeModes()
            console.log(`${this.name}: Luftbefeuchter ausgeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "off" };
        }
        return { entity_id: entity, action: "Already OFF" };
    }

    closeModes(){
        this.modes.small = true
        this.modes.interval = false
        this.modes.large = false
    }

    changeMode(direction) {
        if (!this.hasModes) {
            console.log(`${this.name}: Moduswechsel nicht unterstützt.`);
            return { entity_id: this.switches[0], action: "Unsupported" };
        }
    
        const actions = [];
    
        // Modusänderung basierend auf der Richtung
        if (direction === "increase") {
            // Wenn das Gerät aus ist und der Modus "small" ist, setze "interval"
            if (!this.isRunning && this.modes.small) {
                this.modes.interval = true;
                this.modes.small = false;
                this.modes.large = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "interval" });
            }
            // Wenn das Gerät läuft und im Modus "small" ist, wechsle direkt zu "large"
            else if (this.isRunning && this.modes.small) {
                this.modes.interval = false;
                this.modes.small = false;
                this.modes.large = true;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "large" });
            }
            // Wenn der Modus "interval" ist, setze ihn auf "small"
            else if (this.modes.interval) {
                this.modes.interval = false;
                this.modes.small = true;
                this.modes.large = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "small" });
            }
            // Wenn der Modus "small" ist, setze ihn auf "large"
            else if (this.modes.small) {
                this.modes.small = false;
                this.modes.large = true;
                this.modes.interval = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "large" });
            }
        } else if (direction === "decrease") {
            // Wenn der Modus "large" ist, setze ihn auf "small"
            if (this.modes.large) {
                this.modes.large = false;
                this.modes.small = true;
                this.modes.interval = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "small" });
            }
            // Wenn der Modus "small" ist, setze ihn auf "interval"
            else if (this.modes.small) {
                this.modes.small = false;
                this.modes.interval = true;
                this.modes.large = false;
                actions.push({ entity_id: "select.humidifier_mode", action: "select", option: "interval" });
            }
            // Wenn der Modus "interval" ist, schalte das Gerät aus
            else if (this.modes.interval) {
                this.modes.small = false;
                this.modes.interval = true;
                this.modes.large = false;
                actions.unshift({ entity_id: this.switches[0], action: "off" });
                console.log(`${this.name}: Luftbefeuchter wird ausgeschaltet.`);
            }
        }
    
        // Gerät einschalten, wenn es aus ist
        if (!this.isRunning) {
            this.isRunning = true;
            actions.unshift({ entity_id: this.switches[0], action: "on" });
            console.log(`${this.name}: Luftbefeuchter wird eingeschaltet.`);
        }
    
        // Rückgabe der Aktionen
        return actions.length > 0 ? actions : { entity_id: this.switches[0], action: "No Change" };
    }
    

    changeHumidity(delta) {
        if (!this.realHumidifier) {
            console.log(`${this.name}: Luftfeuchtigkeit kann nicht geändert werden, da es sich um einen einfachen Schalter handelt.`);
            return { entity_id: this.switches[0], action: "Unsupported" };
        }

        const entity = this.switches[0];
        const newHumidity = Math.max(
            this.minHumidity,
            Math.min(this.maxHumidity, this.currentHumidity + delta)
        );
        if (newHumidity === this.currentHumidity) {
            console.log(`${this.name}: Luftfeuchtigkeit ist bereits auf Grenzwert (${this.currentHumidity}%) in ${this.inRoomName}`);
            return { entity_id: entity, action: "No Change" };
        }
        this.currentHumidity = newHumidity;
        console.log(`${this.name}: Luftfeuchtigkeit geändert auf ${newHumidity}% in ${this.inRoomName}`);
        return { entity_id: entity, action: "number", value: newHumidity };
    }
}

class Dehumidifier extends Device {
    constructor(name) {
        super(name, "dehumidifier");
        this.realHumidifier = false; // Erkennung eines echten Luftentfeuchters
        this.isSimpleSwitch = false; // Standardmäßig ein einfacher Schalter
        this.hasModes = false; // Erkennung von Modis
        this.currentMode = null; // Aktueller Modus des Luftentfeuchters
    }

    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.identifyDehumidifierType();
    }



    identifyDehumidifierType() {
        if (this.data) {
            if (Object.keys(this.data).some(key => key.startsWith("humidifier."))) {
                this.realHumidifier = true;
                this.isSimpleSwitch = false;
                this.hasModes = true;
                this.currentMode = "dry"; // Standardmodus
            } else if (Object.keys(this.data).some(key => key.startsWith("switch."))) {
                this.realHumidifier = false;
                this.isSimpleSwitch = true;
                this.hasModes = false;
                this.currentMode = null;
            } else {
                console.log(`${this.name}: Keine gültigen Daten gefunden, Standard auf einfacher Schalter.`);
                this.realHumidifier = false;
                this.isSimpleSwitch = true;
                this.hasModes = false;
                this.currentMode = null;
            }
        }
    }

    runAction() {
        // Wenn keine Änderung nötig ist, gib aktuellen Zustand zurück
        if (!this.needChange) {
            if (this.action === "reduced" && !this.isRunning) {
                return { entity_id: this.switches[0], action: "Already OFF" };
            } else if (this.action === "increased" && this.isRunning) {
                return { entity_id: this.switches[0], action: "Already ON" };
            }
            return { entity_id: this.switches[0], action: "noChangesNeeded" };
        }

        // Aktionen für einfache Schalter
        if (this.isSimpleSwitch) {
            if (this.action === "reduced") {
                return this.turnOFF();
            } else if (this.action === "increased") {
                return this.turnON();
            }
        }

        // Aktionen für echte Luftentfeuchter
        if (this.realHumidifier) {
            if (this.action === "reduced") {
                return this.turnOFF();
            } else if (this.action === "increased") {
                return this.activateDryMode();
            }
        }

        // Wenn keine passende Aktion gefunden wurde
        console.log(`${this.name}: Keine passenden Aktionen gefunden.`);
        return { entity_id: this.switches[0], action: "No Action Found" };
    }


    activateDryMode() {
        const entity = this.sensors.find(sensor => sensor.startsWith("humidifier."));
        if (!this.isRunning) {
            this.isRunning = true;
            console.log(`${this.name}: Luftentfeuchter im Modus "dry" eingeschaltet in ${this.inRoomName}`);
            return [
                { entity_id: this.switches[0], action: "on" }, // Gerät einschalten
                { entity_id: entity, action: "select", option: "dry" }, // Modus auf "dry" setzen
            ];
        }
        return { entity_id: this.switches[0], action: "Already ON" };
    }


    turnON() {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            console.log(`${this.name}: Luftentfeuchter eingeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "on" };
        } else {
            return { entity_id: entity, action: "Already ON" };
        }

    }

    turnOFF() {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            console.log(`${this.name}: Luftentfeuchter ausgeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "off" };
        } else {
            return { entity_id: entity, action: "Already OFF" };
        }

    }
}

class Heater extends Device {
    constructor(name) {
        super(name, "heater");
    }
    runAction() {
        if (!this.needChange) {
            return { entity_id: this.switches[0], action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "off":
                return this.turnOFF();
            case "on":
                return this.turnON();
            case "increased":
                return this.turnON();
            case "reduced":
                return this.turnOFF();
            case "unchanged":
                return { entity_id: this.switches[0], action: "UNCHANGED" };
            default:
                node.warn(`${this.inRoomName} - ${this.name}: Unbekannte Aktion "${this.action}".`);
                return { entity_id: this.switches[0], action: "Unknown Action" };
        }
    }

    turnON() {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            node.warn(`${this.inRoomName} - ${this.name}: Luftentfeuchter eingeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "on" };
        }
        return { entity_id: entity, action: "Already ON" };
    }

    turnOFF() {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.inRoomName} - ${this.name}: Luftentfeuchter ausgeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "off" };
        }
        return { entity_id: entity, action: "Already OFF" };
    }
}

class Cooler extends Device {
    constructor(name) {
        super(name, "cooler");
    }

    runAction() {
        if (!this.needChange) {
            return { entity_id: this.switches[0], action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "off":
                return this.turnOFF();
            case "on":
                return this.turnON();
            case "increased":
                return this.turnON();
            case "reduced":
                return this.turnOFF();
            case "unchanged":
                return { entity_id: this.switches[0], action: "UNCHANGED" };
            default:
                node.warn(`${this.inRoomName} - ${this.name}: Unbekannte Aktion "${this.action}".`);
                return { entity_id: this.switches[0], action: "Unknown Action" };
        }
    }

    turnON() {
        const entity = this.switches[0];
        if (!this.isRunning) {
            this.isRunning = true;
            node.warn(`${this.inRoomName} - ${this.name}: Luftentfeuchter eingeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "on" };
        }
        return { entity_id: entity, action: "Already ON" };
    }

    turnOFF() {
        const entity = this.switches[0];
        if (this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.inRoomName} - ${this.name}: Luftentfeuchter ausgeschaltet in ${this.inRoomName}`);
            return { entity_id: entity, action: "off" };
        }
        return { entity_id: entity, action: "Already OFF" };
    }
}

//NEED TO TEST THIS 
class Pump extends Device {
    constructor(name) {
        super(name, "pump");
        this.pumpInterval = 3600; // Mindestintervall zwischen Pumpzyklen (in Sekunden)
        this.pumpDuration = 10; // Pumpdauer in Sekunden
        this.isAutoRun = false; // Automatikmodus
        this.OGBAutoMODE = false; // OpenGrowBox Steuerung
        this.lastPumpTime = null; // Zeitpunkt des letzten Pumpvorgangs
        this.soilMoisture = 0; // Bodenfeuchtigkeit
        this.soilEC = 0; // Elektrische Leitfähigkeit
        this.minSoilMoisture = 25; // Mindestbodenfeuchte
        this.maxSoilEC = 2.5; // Maximaler EC-Wert
    }

    // Gerätedaten setzen und Bodenwerte aktualisieren
    setData(data, context) {
        this.setFromtent(context.tentName);
        this.identifyIfFromAmbient();
        //this.data = { ...this.data, ...data };
        this.updateChangedData(this.data, data);
        this.identifySwitchesAndSensors();
        this.updateIsRunningState();
        this.evaluateStateFromData();
        this.identifyIfOGBControlled(context);

        // Aktualisiere Sensorwerte
        if (data.soilmoisture) this.soilMoisture = parseFloat(data.soilmoisture);
        if (data.soilec) this.soilEC = parseFloat(data.soilec);
    }

    // Prüfe OpenGrowBox Steuerung
    identifyIfOGBControlled(context) {
        this.OGBAutoMODE = !!context.controls.co2Control;
    }

    // Status aus Gerätedaten evaluieren
    evaluateStateFromData() {
        if (this.data) {
            const pumpOnKey = Object.keys(this.data).find(key => key.includes("pump_on"));
            if (pumpOnKey) this.isRunning = this.data[pumpOnKey] === "on";

            const autoRunKey = Object.keys(this.data).find(key => key.includes("pump_autorun"));
            if (autoRunKey) this.isAutoRun = this.data[autoRunKey] === "on";
        }
    }

    // Mindestintervall prüfen
    canPumpNow() {
        const now = new Date();
        const elapsedTime = this.lastPumpTime
            ? (now.getTime() - this.lastPumpTime.getTime()) / 1000
            : this.pumpInterval;

        return elapsedTime >= this.pumpInterval;
    }

    // Prüfe, ob Bewässerung notwendig ist
    needsWatering() {
        return this.soilMoisture < this.minSoilMoisture && this.soilEC < this.maxSoilEC;
    }

    // Geräteaktionen ausführen
    runAction(context) {
        // Prüfe ob AutoModus aktiv ist
        if (this.isAutoRun) {
            return this.runAutoMode();
        }

        switch (this.action) {
            case "on":
                return this.runPump("on");
            case "off":
                return this.runPump("off");
            case "autorun-on":
                return this.setAutoMode(true);
            case "autorun-off":
                return this.setAutoMode(false);
            default:
                node.warn(`${this.name}: Unbekannte Aktion.`);
                return { entity_id: this.switches[0], action: "UnknownAction" };
        }
    }

    // Automatische Steuerung der Pumpe
    runAutoMode() {
        if (!this.canPumpNow()) {
            node.warn(`${this.name}: Intervall nicht erreicht.`);
            return { entity_id: this.switches[0], action: "wait_interval" };
        }

        if (!this.needsWatering()) {
            node.warn(`${this.name}: Keine Bewässerung notwendig (Moisture: ${this.soilMoisture}, EC: ${this.soilEC}).`);
            return { entity_id: this.switches[0], action: "no_water_needed" };
        }

        this.lastPumpTime = new Date();
        this.isRunning = true;

        node.warn(`${this.name}: Starte automatische Bewässerung.`);
        return { entity_id: this.switches[0], action: "on", duration: this.pumpDuration };
    }

    // Manuelle Pumpaktion ausführen
    runPump(state) {
        if (state === "on" && !this.isRunning) {
            this.isRunning = true;
            this.lastPumpTime = new Date();
            node.warn(`${this.name}: Pumpe manuell eingeschaltet.`);
            return { entity_id: this.switches[0], action: "on" };
        } else if (state === "off" && this.isRunning) {
            this.isRunning = false;
            node.warn(`${this.name}: Pumpe manuell ausgeschaltet.`);
            return { entity_id: this.switches[0], action: "off" };
        } else {
            return { entity_id: this.switches[0], action: `Already ${state.toUpperCase()}` };
        }
    }

    // AutoModus setzen
    setAutoMode(state) {
        this.isAutoRun = state;
        const action = state ? "on" : "off";
        node.warn(`${this.name}: Automatikmodus ${state ? "aktiviert" : "deaktiviert"}.`);
        return { entity_id: this.switches[1], action: action };
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
        if (target !== this.targetCO2) {
            this.targetCO2 = target;
        }
    }

    enableAutoRegulation() {
        if (!this.enableAutoRegulation) {
            this.autoRegulate = true;
        }
    }

    disableAutoRegulation() {
        if (this.enableAutoRegulation) {
            this.autoRegulate = false;
        }
    }

    updateCurrentCO2(value) {
        if (value !== this.currentCO2) {
            this.currentCO2 = value;
        }
    }

    evalAction(context) {
        if (this.action === "unchanged") return false;

        if (this.autoRegulate && this.currentCO2 < this.targetCO2) {
            this.action = "increased";
            return true;
        } else if (this.autoRegulate && this.currentCO2 > this.targetCO2) {
            this.action = "reduced";
            return true;
        }

        return this.action !== "unchanged";
    }

    runAction(context) {
        if (!this.evalAction(context)) {
            return { CO2: `${this.name}`, Action: "noChangesNeeded" };
        }

        switch (this.action) {
            case "increased":
                node.warn(`${this.name}: CO2-Zufuhr wird erhöht.`);
                return { entity_id: this.switches[0], action: "on" };

            case "reduced":
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
                    node.warn(`${this.inRoomName} - ${this.name}: Switch wird eingeschaltet.`);
                    return { entity_id: this.switches[0], action: "on" };
                } else {
                    node.warn(`${this.inRoomName} - ${this.name}: Switch ist bereits eingeschaltet.`);
                    return { entity_id: this.switches[0], action: "Already ON" };
                }

            case "off":
                if (this.isRunning) {
                    this.isRunning = false;
                    node.warn(`${this.inRoomName} - ${this.name}: Switch wird ausgeschaltet.`);
                    return { entity_id: this.switches[0], action: "off" };
                } else {
                    node.warn(`${this.inRoomName} - ${this.name}: Switch ist bereits ausgeschaltet.`);
                    return { entity_id: this.switches[0], action: "Already OFF" };
                }

            default:
                node.warn(`${this.inRoomName} - ${this.name}: Unbekannte Aktion.`);
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

// Instanziiere die VPDControl-Klasse und speichere sie in der globalen Node-RED-Variablen
global.set("OpenGrowBox", OpenGrowBox);
node.status({ fill: "green", shape: "ring", text: "OpenGrowBox Started" });
msg.topic = "Init"
return msg
