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