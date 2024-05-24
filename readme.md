# OpenGrowBox for Everyone!!!

## Overview
Transform your growing environment with the OpenGrowBox, an open-source project designed to automate and optimize your grow tents. This setup uses a Raspberry Pi 4 and a variety of sensors to monitor and control your growing conditions.


### FlowerTent Look
![image](https://github.com/OpenGrowBox/OpenGrowBox/assets/170749418/393d5455-c261-4486-840c-ca828be5f1bb)

### VegiTent Look
![image](https://github.com/OpenGrowBox/OpenGrowBox/assets/170749418/62b956f6-da6d-4ebf-a5f7-c2c93d48ac8c)

### DryingTent Look
![image](https://github.com/OpenGrowBox/OpenGrowBox/assets/170749418/ec607466-ae51-45f9-9b51-d8630cc2b5a7)

### OverAll Look 
![image](https://github.com/OpenGrowBox/OpenGrowBox/assets/170749418/566cee62-e29a-4804-8368-2697865b830b)

---

## Base / Heart / Call it How You Like

### Raspberry Pi 4 Setup and Installation
1. Set up Raspberry Pi 4 with an external SSD (search online for guides).
2. Install Mosquitto MQTT on your Raspberry Pi 4.
3. Install Home Assistant Supervised:
    - [Home Assistant Supervised Installation Guide](https://github.com/home-assistant/supervised-installer)
    - Set up Home Assistant:
        - Install MQTT and start the server.
        - Install MQTT Broker.
        - Install the File Editor.
        - Install HACS (Home Assistant Community Store).
    - Install Node-RED:
        - [Node-RED Setup Guide](https://pimylifeup.com/install-node-red-home-assistant/)

---

## Sensors
### Operating System
- Tasmota: [Getting Started with Tasmota](https://tasmota.github.io/docs/Getting-Started/)

### Sensor Types
- **Light:** TSL259 Light Sensor
- **Temperature:** 
    - SHT31
    - DHT 11 / DHT 22
    - MLX90640 (Infrared temperature sensor that can pointed to Plantsleafs)
- **Humidity:** SHT31, DHT 11, DHT 22
- **CO2:** MH-Z19B
- **Air Pressure**
- **VPD (Vapor Pressure Deficit):** Created with a Node-RED function
- **Xiaomi Plant Sensor:**
    - Electrical Conductivity (EC)
    - Light Intensity (LX, converted with a light conversion rate of 0.0185 for Sanlight)
    - Temperature

---

## Ventilation Setup with PC Fans
### Required Devices
- **NodeMCUv3 (ESP 8266):**
    - Flash it with the latest Tasmota version.
    - Set the module type to Generic 18.
    - Use the connection part below.
    - Set the inputs on the pins in Tasmota.
    - Add MQTT server and credentials.
- **Base Board for NodeMCU V1**
- **Power Supply:** Based on the NodeMCU Base Board requirements
- **Arctic P12/P14 PWM Fan:**
    - **Pinout:**
        - 1: Ground
        - 2: VCC (5-12V)
        - 3: Signal
        - 4: PWM
    - **Connection on ESP:**
        - FAN Pin 1 to Ground Pin on ESP
        - FAN Pin 2 to 5-12V input Pin
        - FAN Pin 3: Can be ignored or read data from it
        - FAN Pin 4: Set it to a D3/D0/D2 Pin on ESP
- **Optional Sensors:** SHT31, DHT11, etc.
---
## EC FAN Setup
For detailed instructions on setting up the EC fan, visit the [Ruck_EC_API repository](https://github.com/OpenGrowBox/Ruck_EC_API).

---

Feel free to customize the setup and add additional sensors as per your requirements. You can scale this in big ranges. If you need help, just don't hesitate to contact me. Enjoy automating your grow tents with OpenGrowBox!
