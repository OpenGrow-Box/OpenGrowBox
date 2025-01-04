class OGBPIDController {
    constructor(name, Kp, Ki, Kd, minValue, maxValue,setPoint = null) {
        this.name = name;
        this.Kp = Kp; // Proportionaler Faktor
        this.Ki = Ki; // Integraler Faktor
        this.Kd = Kd; // Derivativer Faktor
        this.minValue = minValue; // Minimalwert
        this.maxValue = maxValue; // Maximalwert
        this.setPoint = setPoint ?? (minValue + maxValue) / 2; // Zielwert
        this.integral = 0; // Summierter Fehler (für Ki)
        this.prevError = 0; // Fehler aus der vorherigen Berechnung (für Kd)
        this.maxIntegral = 100; // Anti-Windup Grenze
        this.prevValue = null; // Vorheriger Wert (für Glättung)
    }
    
    // Anti-Windup für Integralanteil
    clampIntegral() {
        this.integral = Math.max(-this.maxIntegral, Math.min(this.maxIntegral, this.integral));
    }

    // Ziegler-Nichols-Tuning
    zieglerNicholsTuning(ultimateGain, ultimatePeriod) {
        this.Kp = 0.6 * ultimateGain;
        this.Ki = 2 * this.Kp / ultimatePeriod;
        this.Kd = this.Kp * ultimatePeriod / 8;
    }   

    // Aktualisieren der Parameter (Optional für Feineinstellungen)
    updateProportional(value) { if (value !== this.Kp) this.Kp = value; }
    updateIntegral(value) { if (value !== this.Ki) this.Ki = value; }
    updateDerivative(value) { if (value !== this.Kd) this.Kd = value; }
    updateSetPoint(value) { if (value !== this.setPoint) this.setPoint = value; }
    
    // Glättung der Eingabewerte (Moving Average)
    smoothInput(currentValue, alpha = 0.1) {
        if (this.prevValue === null) this.prevValue = currentValue; // Initialisierung
        const smoothedValue = alpha * currentValue + (1 - alpha) * this.prevValue;
        this.prevValue = smoothedValue;
        return smoothedValue;
    }

    // PID-Berechnung (Optionale Glättung eingebaut)
    compute(currentValue, useSmoothing = false, alpha = 0.1) {
        const input = useSmoothing ? this.smoothInput(currentValue, alpha) : currentValue;
        const error = this.setPoint - input;

        // Berechnung des Integral- und Derivativen Anteils
        this.integral += error;
        this.clampIntegral();
        const derivative = error - this.prevError;

        // PID-Ausgabe
        const output = (this.Kp * error) + (this.Ki * this.integral) + (this.Kd * derivative);

        // Fehler für nächste Iteration speichern
        this.prevError = error;

        // Begrenzung der Ausgabe (z. B. Temperatur oder Feuchtigkeit)
        return Math.max(this.minValue, Math.min(this.maxValue, output));
    }

}