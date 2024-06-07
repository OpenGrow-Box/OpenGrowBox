# OpenGrowBox for Everyone!!!
![image](https://github.com/OpenGrowBox/OpenGrowBox/assets/170749418/f0598a24-5961-43bf-93d0-b7042d4ef2b0)

## Overview
Transform your growing environment with the OpenGrowBox, an open-source project designed to automate and optimize your grow tents. This setup uses a Raspberry Pi 4 and a variety of sensors to monitor and control your growing conditions.

## Check the [WIKI](https://wiki.opengrowbox.net)

--
## For NEWS Scroll to the Bottom Please
-- 

### Overview All 
![image](https://github.com/OpenGrow-Box/OpenGrowBox/assets/170749418/267dbb79-1b8c-4dc2-a649-04cf3610edaa)

### FlowerTent
![image](https://github.com/OpenGrow-Box/OpenGrowBox/assets/170749418/b8d58f7f-0076-452f-a310-d98dfc729848)

### VegiTent
![image](https://github.com/OpenGrow-Box/OpenGrowBox/assets/170749418/9b527087-e0a2-477a-9f8a-f566a462c044)

## GrowRoom 
![image](https://github.com/OpenGrow-Box/OpenGrowBox/assets/170749418/7a651e0f-90b7-4124-94a4-e7ac24c6427b)

# Globals 
![image](https://github.com/OpenGrow-Box/OpenGrowBox/assets/170749418/d6ce0c8a-5bb4-4811-aae0-707a2d543cfd)
 .. no data there the reason for NaN and the rest

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

## EC FAN Setup
For detailed instructions on setting up the EC fan, visit the [Ruck_EC_API repository](https://github.com/OpenGrow-Box/PWM-Fans.git).

---

## Sensors
### Operating System
- Tasmota: [Getting Started with Tasmota](https://tasmota.github.io/docs/Getting-Started/)

### Sensor Types
- **Light:** TSL259 Light Sensor
- **Temperature:** 
    - SHT31
    - DHT 11 / DHT 22
    - MLX90640 (Infrared temperature sensor that can be pointed to plant leaves)
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

## NEWS:
### Module Industrial - Node-RED ONLY
Industrial Version:

Pi4 or Linux Vm/Linux-Computer
Sensors
Node-RED
Python
Grafana
Influxdb or other db

FREE - Public Version for Cannabis Social Clubs and industrial/medical production is available soon.

---

Feel free to customize the setup and add additional sensors as per your requirements. You can scale this in big ranges. If you need help, just don't hesitate to contact me. Enjoy automating your grow tents with OpenGrowBox!
