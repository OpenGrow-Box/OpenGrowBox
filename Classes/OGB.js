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
            pidControl: false,
            ownWeights: false,
            weights: {
                temp: null,
                hum: null,
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

        this.pid = {
            temp:{
                proportionalFaktor: 0.1,
                integralFaktor: 0.01,
                derivativFaktor: 0.1,
            },
            hum:{
                proportionalFaktor: 0.5,
                integralFaktor: 0.0001,
                derivativFaktor: 0.001,
            },
            vpd:{
                proportionalFaktor: 0.01,
                integralFaktor: 0.0001,
                derivativFaktor: 0.001,
            },
            co2:{
                proportionalFaktor: 0.1,
                integralFaktor: 0.0001,
                derivativFaktor: 0.01,
            }

        }

        this.init();
    }

    init() {
        this.initPIDControllers();
    }

    initPIDControllers() {
        console.log("Initialisiere PID-Controller mit Werten:");
        console.log(`Temp Min: ${this.tentData.minTemp}, Temp Max: ${this.tentData.maxTemp}`);
        console.log(`VPD Min: ${this.getVPDRangeForMode().minVPD}, VPD Max: ${this.getVPDRangeForMode().maxVPD}`);

        this.tempPID = new OGBPIDController(
            "tempPID",
            this.pid.temp.proportionalFaktor,
            this.pid.temp.integralFaktor,
            this.pid.temp.derivativFaktor,
            this.tentData.minTemp,
            this.tentData.maxTemp
        );

        this.humPID = new OGBPIDController(
            "humPID",
            this.pid.hum.proportionalFaktor,
            this.pid.hum.integralFaktor,
            this.pid.hum.derivativFaktor,
            this.tentData.minHumidity,
            this.tentData.maxHumidity
        );

        const { minVPD, maxVPD } = this.getVPDRangeForMode();

        this.vpdPID = new OGBPIDController(
            "vpdPID",
            this.pid.vpd.proportionalFaktor,
            this.pid.vpd.integralFaktor,
            this.pid.vpd.derivativFaktor,
            minVPD,
            maxVPD
        );
        this.co2PID = new OGBPIDController(
            "co2PID",
            this.pid.co2.proportionalFaktor,
            this.pid.co2.integralFaktor,
            this.pid.co2.derivativFaktor,
            this.controls.co2ppm.minPPM,
            this.controls.co2ppm.maxPPM
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

    applyPIDControl() {
        if (!this.tempPID || !this.humPID || !this.vpdPID) {
            console.error("PID-Controller sind nicht initialisiert.");
            return;
        }

        // Berechne Anpassungen basierend auf den aktuellen PID-Werten
        const tempAdjustment = this.tempPID.compute(this.tentData.temperature);
        const humAdjustment = this.humPID.compute(this.tentData.humidity);
        const vpdAdjustment = this.vpdPID.compute(this.vpd.current);

        // Überprüfen, ob Änderungen nötig sind
        const adjustmentsNeeded = this.checkIfActionNeeded();

        if (!adjustmentsNeeded) {
            console.log("Keine signifikanten Änderungen erkannt. Aktionen bleiben unverändert.");
            return {
                PIDAdjustments: {
                    temperatureAdjustment: tempAdjustment,
                    humidityAdjustment: humAdjustment,
                    vpdAdjustment: vpdAdjustment,
                },
                Actions: this.actions.Unchanged,
            };
        }

        // Generiere Aktionen basierend auf den PID-Werten
        const pidActions = this.generateActionsFromPID(tempAdjustment, humAdjustment, vpdAdjustment, this.vpd.lightControl);

        // Geräte vorbereiten und Aktionen ausführen
        const preparedDevices = [];
        this.devices.forEach((device) => {
            if (device && typeof device.prepareAction === "function") {
                device.prepareAction(pidActions);
                const deviceAction = device.runAction();
                if (deviceAction) {
                    preparedDevices.push({
                        device: device.name,
                        type: device.deviceType,
                        action: deviceAction,
                    });
                }
            } else {
                console.warn(`Gerät ${device?.name || "unbekannt"} konnte nicht verarbeitet werden.`);
            }
        });

        // Ergebnisse speichern
        const result = {
            PIDAdjustments: {
                temperatureAdjustment: tempAdjustment,
                humidityAdjustment: humAdjustment,
                vpdAdjustment: vpdAdjustment,
            },
            Actions: pidActions,
            DeviceActions: preparedDevices,
        };

        this.dataSetter(result); // Speichert die Aktion
        return result;
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
        if (pidControl !== this.vpd.lightControl) {
            this.controls.pidControl = this.helperYesTrue(pidControl);
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
                this.vpdPID.updateProptional(this.pid.vpd.proportionalFaktor)
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
                this.vpdPID.updateDerivativer(this.pid.vpd.derivativFaktor)
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
                this.tempPID.updateProptional(this.pid.temp.proportionalFaktor)
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
                this.tempPID.updateDerivativer(this.pid.temp.derivativFaktor)
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
                this.humPID.updateProptional(this.pid.hum.proportionalFaktor)
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
                this.humPID.updateDerivativer(this.pid.hum.derivativFaktor)
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
        return this.vpd.targeted;
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
    getGLSPlantType() {
        return this.expMods.plantType
    }

    // EXPRIMENTEL
    // Aktiviere Eigene Geräte Steuerung(Experimentel"NOT-DONE")
    setOwnDeviceSetup(deviceControl) {
        if (deviceControl !== this.controls.ownDeviceSetup) {
            this.controls.ownDeviceSetup = this.helperYesTrue(deviceControl)
            if(this.controls.ownDeviceSetup){
                this.devices = []
            }else{
                return
            }

        }
        return
    }

    // EXPRIMENTEL
    // Aktiviere Eigene Geräte Steuerung(Experimentel"NOT-DONE")
    getOwnDeviceSetup() {
        return this.helperYesTrue(this.controls.ownDeviceSetup)
    }

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

        if(this.controls.ownDeviceSetup){
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
       
       
       
       
       
        }else{
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
    }

    addOwnDevices(deviceName,deviceType,deviceData){

    }


    // Geräte Identifizierung
    identifyDevice(deviceName, deviceData) {
        const deviceTypeMapping = {
            "sensor": ["mode", "plant", "temperature", "temp", "humidity", "co2", "moisture", "dewpoint", "illuminance", "ppfd", "dli", "h5179"],
            "dehumidifier": ["dehumidifier", "drying", "dryer", "entfeuchter", "removehumidity"],
            "humidifier": ["humidifier", "mist", "befeuchter",],
            "exhaust": ["exhaust", "abluft", "ruck"],
            "ventilation": ["vent", "vents", "venti", "ventilation", "inlet", "outlet"],
            "heater": ["heater", "heizung", "warm"],
            "cooler": ["cooler", "kühler", "klima"],
            "light": ["light", "lamp", "led", "switch.light"],
            "climate": ["climate", "klima",],
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
        let isUnchanged = false; 

        if (currentVPD < perfectVPD - tolerance) {
            action = this.actions.Increased;
            isUnchanged = false;
        } else if (currentVPD > perfectVPD + tolerance) {
            action = this.actions.Reduced;
            isUnchanged = false;        
        }

        return {
            tentName: this.tentName,
            tentMode: isUnchanged ? "Unchanged" : this.tentMode, // Wenn unverändert, setzen wir "Unchanged"
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
    selectModeAction(){
        if(!this.controls.pidControl){
            return this.selectAction()
        }else{
            return this.selectPIDAction()
        }
    }

    selectAction() {
        let preparedDevices = []; // Speicher für Geräteaktionen
        let actionData;
        let limitAdjustments
        
        // Prüfen, ob der Zustand seit der letzten Aktion unverändert ist
        if (this.checkIfActionNeeded()) {
            this.needchange = true;
        } else {
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

            // Vorzeitige Anpassungen
            limitAdjustments = this.checkLimits();
        }

        // Kombiniere alle Aktionen
        const finalActions = {
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


        if(this.needchange){
            // Aktion speichern
        this.dataSetter({
                ...actionData || null,
                actions: finalActions || null,
                devices: this.devices || null,
                deviceActions: preparedDevices || null,
            });
            // Rückgabe der Aktion mit den angepassten Geräten
        }

        // Rückgabe der Aktion mit den angepassten Geräten
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
            Humidities: {
                Humidity: this.tentData.humidity,
                MinHumidity: this.tentData.minHumidity,
                MaxHumidity: this.tentData.maxHumidity,
                },
        };

    }

    selectPIDAction() {
        if (!this.tempPID || !this.humPID || !this.vpdPID) {
            console.error("PID-Controller sind nicht initialisiert.");
            return {
                error: "PID-Controller nicht initialisiert",
            };
        }

        // Berechnungen der applyPIDControl-Methode aufrufen
        const pidControlResults = this.applyPIDControl();

        if (!pidControlResults) {
            console.error("applyPIDControl hat keine Ergebnisse geliefert.");
            return {
                error: "Keine Ergebnisse von applyPIDControl",
            };
        }

        const { PIDAdjustments, Actions } = pidControlResults;

        // Geräteaktionen vorbereiten
        const preparedDevices = [];
        this.devices.forEach((device) => {
            if (device.deviceType === "sensor" || device.deviceType === "pump" || device.deviceType === "co2") return;

            if (device && typeof device.prepareAction === "function") {
                device = device.prepareAction(Actions);
                const actions = device.runAction();
                preparedDevices.push(actions);
            } else {
                console.warn(`Device ${device?.name || "undefined"} konnte nicht verarbeitet werden.`);
            }
        });

        // Speichere die Aktion
        this.dataSetter({
            actions: Actions || {},
            devices: this.devices || {},
            deviceActions: preparedDevices || {},
        });

        // Rückgabe der Aktion mit den angepassten Geräten und PID-Werten
        return {
            tentName: this.tentName,
            tentMode: "P.I.D",
            vpdPID:this.vpdPID,
            tempPID:this.tempPID,
            humPID:this.humPID,
            PIDAdjustments: PIDAdjustments || {},
            VPD:{
                VPD:this.vpd.current
            },
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

            devices: this.devices || {},
            actions: Actions || {},
            deviceActions: preparedDevices || {},
        };
    }

    checkLimits() {
        let adjustments = {};
        adjustments.climate = {}
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

        if (data.tentMode === "Unchanged" || this.tentMode === "Unchanged" || this.tentMode === "Disabled" || this.tentMode === "I DONT CARE MODE") {
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
            tentMode: this.controls.pidControl ? "P.I.D" : this.tentMode,
            currentVPD: this.vpd.current,
            targetVPD: data.targetVPD,
            targetVPDMin: this.vpd.range[0],
            targetVPDMax: this.vpd.range[1],
            vpdDiffPercent: data.vpdDiffPercent || 0,
            PIDAdjustments: data.PIDAdjustments ? data.PIDAdjustments : "Not in P.I.D Mode",
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
            node.log(`Neue Aktion gespeichert:", ${enrichedData}`);
            return enrichedData
        } else {
            node.log("Änderung nicht signifikant - Keine Aktion gespeichert.");
        }

        // Begrenze die Anzahl der gespeicherten Aktionen
        if (this.previousActions.length > 250) {
            this.previousActions = this.previousActions.slice(-250);
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
}