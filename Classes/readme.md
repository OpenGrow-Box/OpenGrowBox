# OpenGrowBox - Class Documentation

## Overview

The `OpenGrowBox` class is designed to manage and optimize plant growth in a controlled environment. It provides various methods and properties to control, monitor, and automate different growth stages, environmental settings, and devices within a grow tent.

---

## Constructor

### `constructor(tentName = "", plantStage = "", tentMode = "", perfectionTolerance = 0.025)`

#### Parameters:
- `tentName` (string): The name of the grow tent.
- `plantStage` (string): Current growth stage of the plant (e.g., Germination, Veg, Flower).
- `tentMode` (string): The operating mode of the tent (e.g., VPD Perfection, Targeted VPD).
- `perfectionTolerance` (number): Tolerance value for perfect VPD adjustments.

#### Properties Initialized:
- **Tent Environment**: Stores tent-specific settings and modes.
- **Devices**: Tracks registered and controlled devices.
- **Controls**: Manages environmental control settings.
- **Plant Stages**: Predefined VPD, temperature, and humidity ranges for each growth stage.
- **Drying Modes**: Configuration for drying modes such as `elClassico` and `sharkMouse`.
- **Actions**: Predefined actions for devices based on environmental needs.

---

## Key Features

### Plant Stages
Predefined configurations for different growth phases:
- **Germination**: VPD range [0.412, 0.7], Temperature: 20-26°C, Humidity: 65-80%.
- **EarlyVeg, MidVeg, LateVeg**: Gradual adjustments for VPD, temperature, and humidity.
- **EarlyFlower, MidFlower, LateFlower**: Optimized for flowering phases with reduced humidity.

### Drying Modes
Supports three modes for post-harvest drying:
1. **elClassico**: Fixed temperature and humidity over three phases.
2. **sharkMouse**: VPD-based drying with progressive targets.
3. **dewBased**: Dew point-driven drying to prevent over-drying.

### Environmental Controls
- VPD Perfection: Calculates the ideal Vapor Pressure Deficit (VPD).
- CO₂ Control: Maintains CO₂ levels within defined ranges (400-1200 ppm).
- Night Mode: Adjusts settings when lights are off to maintain minimal VPD impact.

---

## Methods

### Tent Environment Management

#### `setTentName(tentName)`
- Updates the name of the tent.

#### `setTentMode(tentMode)`
- Sets the current operating mode of the tent. Automatically disables drying mode if switching away.

#### `setPlantStageValue(plantStage)`
- Configures VPD, temperature, and humidity ranges based on the selected plant stage.

#### `setAmbientData(ambTemp, ambHum, ambDew)`
- Updates ambient temperature, humidity, and dew point.

#### `setOutsiteData(outTemp, outHum, outDew)`
- Updates outdoor temperature, humidity, and dew point.

### Environmental Calculations

#### `calculateDewPoint(temperature, humidity)`
- Computes the dew point based on temperature and humidity.

#### `calculateCurrentVPD(Temp, Humidity, LeafOffset)`
- Calculates the current Vapor Pressure Deficit (VPD).

#### `calculatePerfectVPD()`
- Computes the optimal VPD based on plant stage ranges.

### Drying Modes

#### `setDryingMode(dryMode)`
- Activates the selected drying mode and initializes start time.

#### `getDryingPhase()`
- Determines the current drying phase based on elapsed time.

#### `dryAdjustments()`
- Executes adjustments specific to the active drying mode.

### Device Management

#### `addDevice(deviceName, deviceData, context)`
- Adds a new device to the tent.

#### `updateDevice(updatedDevice)`
- Updates settings for an existing device.

#### `returnDevice(device)`
- Returns a borrowed device to its original environment.

### Control Adjustments

#### `ultraAdjustments(currentVPD, perfectVPD, tolerance)`
- Implements precise adjustments to achieve the perfect VPD.

#### `rangeAdjustments(currentVPD, targetVPDRange, tolerance)`
- Manages environmental parameters within a defined VPD range.

#### `targetAdjustment(currentVPD, targetVPD, tolerance)`
- Adjusts parameters to target a specific VPD.

### Utilities

#### `checkLimits()`
- Checks and adjusts environmental settings based on min/max limits.

#### `analyzeTrends()`
- Experimental feature to analyze ambient and outdoor trends for proactive adjustments.

---

## Example Usage

```javascript
const growBox = new OpenGrowBox("MyTent", "EarlyVeg", "VPD Perfection");

// Set plant stage
growBox.setPlantStageValue("MidFlower");

// Add a new device
const deviceData = { temperature: 24, humidity: 60 };
growBox.addDevice("Humidifier-1", deviceData, context);

// Update environmental data
growBox.setAmbientData(22.5, 55, 10.2);

growBox.calculateCurrentVPD();
console.log(`Current VPD: ${growBox.vpd.current}`);

// Drying mode
growBox.setDryingMode("elClassico");
console.log(`Current Drying Phase: ${growBox.getDryingPhase()}`);
```

---

## Future Enhancements
- Integration with external weather APIs for more accurate ambient data.
- Support for advanced device scheduling.
- Automated nutrient management.

---

## Conclusion

The `OpenGrowBox` class offers a comprehensive solution for managing controlled growth environments, ensuring optimal plant health through precise environmental control and automation.
