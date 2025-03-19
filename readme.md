# OpenGrowBox for Everyone!!!

## Overview
Transform your growing environment with the OpenGrowBox, an open-source project designed to automate and optimize your grow tents. This setup uses a Raspberry Pi 4 and a variety of sensors to monitor and control your growing conditions.

# WIKI
- https://github.com/OpenGrow-Box/OpenGrowBox/wiki
# Integration 
- https://github.com/OpenGrow-Box/OpenGrowBox-HA
# Frontend
- https://github.com/OpenGrow-Box/OpenGrowBox-Frontend





### Control Panel 
![image](https://github.com/user-attachments/assets/0106297d-5209-4568-92c7-8dbad7043a20)

### Dashboard
![image](https://github.com/user-attachments/assets/88bb8fac-6699-4ca2-ba5b-3b8f2c18c55d)

### GrowBook
![image](https://github.com/user-attachments/assets/d086e3e8-fd8a-4c54-a6ec-a7ef186cb4e6)

### Settings
![image](https://github.com/user-attachments/assets/e14fc7c1-4a49-4405-b3d6-bf94ffb4946a)



---

## NEWS:
## New UserInterface
#### Full Device Support
#### Contorl Option 
    - Home Assistant
    - Node-RED
    - N8N
    - Self-Hosted-Control



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
    - Install OpenGrowBox-HA
      - [OpenGrowBox-HA](https://github.com/OpenGrow-Box/OpenGrowBox-HA)
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

## Sponsors

- [Chili Welten](https://chiliwelten.de)
- [cre.sience](https://cre.science/)
---

FREE - Public Version for Cannabis Social Clubs and industrial/medical production is available soon. 
       But you can use this as well. 

---

Feel free to customize the setup and add additional sensors as per your requirements. You can scale this in big ranges. If you need help, just don't hesitate to contact me. Enjoy automating your grow tents with OpenGrowBox!
