#!/bin/bash
#
# OpenGrowBox install Script
#
# Copy this script to the Device you want to use.
# use this commands: 
# vi install.sh
# chmod +x install.sh
# sudo ./install.sh
#
# Select the device type on shell when you get asked for.
# Setup User after Reboot.
# Add Node-Red-Companion
# Restart Home Assitant
# Create that rooms you need.
# FlwerTent VeggiTent GrowRoom DryingTent
#
# Have fun with it :) 
#
#


# VARS
MQTT_PASS="opengrowbox"
MQTT_USER="ogb"

PI_TYPE="raspberrypi4"
SETUP_DIR="ogbinst"
CMDLINE_FILE="/boot/firmware/cmdline.txt"
PARAMS="apparmor=1 security=apparmor"


# RUCKECYAML
RUCKEHACCONF="https://raw.githubusercontent.com/OpenGrow-Box/PWM-Fans/main/RuckEC_webapi/airCtrlSensor.yaml"
RUCKCONNF="https://raw.githubusercontent.com/OpenGrow-Box/PWM-Fans/main/RuckEC_webapi/configuration.yaml"

# Sources 
OGB_SOURCE="https://github.com/OpenGrow-Box/OpenGrowBox.git"
RUCK_SOURCE="https://github.com/OpenGrow-Box/PWM-Fans"
OS_AGENT_SOURCE="https://github.com/home-assistant/os-agent/releases/download/1.6.0/os-agent_1.6.0_linux_aarch64.deb"
HA_SOURCE="https://github.com/home-assistant/supervised-installer/releases/latest/download/homeassistant-supervised.deb"


# SETUP STUFF
ONBOARDING="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/UI/setupFiles/onboarding"
ROOMS="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/UI/setupFiles/core.area_registr.json"

MAINCONF="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/UI/setupFiles/configuration.yaml"
ADDONS="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/UI/setupFiles/addons.json"
NODEREDCONF="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/UI/setupFiles/n-r-options.json"
EDITORCONF="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/UI/setupFiles/editor-options.json"

ALLFLOWS="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/NodeRed/Core/All/All-Flows.json"

## UI 
OPG_DASHBOARD="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/UI/setupFiles/lovelace_dashboards.json"
DASHBOARDVIEW="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/UI/setupFiles/lovelace.dashboard_opengrowview.json"


## ADDONS 
OGB="https://github.com/OpenGrow-Box/OpenGrowBox-HA/archive/refs/tags/v1.1.3.zip"
OGB_EXHAUST="https://github.com/OpenGrow-Box/OpenGrowBox-Exhaust/archive/refs/tags/main.zip"

NRCOMPANION="https://github.com/zachowj/hass-node-red/archive/refs/heads/main.zip"
MINIGRAPH="https://github.com/kalkih/mini-graph-card/releases/download/v0.12.1/mini-graph-card-bundle.js"


MUSHROOM="https://github.com/piitaya/lovelace-mushroom/releases/download/v3.6.2/mushroom.js"
LLRESSOURCE="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/main/UI/setupFiles/lovelace_resources.json"

VPDCHART="https://raw.githubusercontent.com/OpenGrow-Box/vpdchart-card/master/vpdchart-card.js"

# New
VERTICALCARD="https://github.com/ofekashery/vertical-stack-in-card/releases/download/v1.0.1/vertical-stack-in-card.js"
CUSTOMTEMPPLATE="https://github.com/iantrich/config-template-card/releases/download/1.3.6/config-template-card.js"
TAPPEDCARD="https://github.com/kinghat/tabbed-card/releases/download/v0.3.2/tabbed-card.js"
AUTOENTIES="https://github.com/thomasloven/lovelace-auto-entities/archive/refs/tags/v1.13.0.zip"
BUBBLECARD="https://raw.githubusercontent.com/Clooos/Bubble-Card/main/dist/bubble-card.js"
BUBBLEFIX="https://raw.githubusercontent.com/Clooos/Bubble-Card/main/dist/bubble-pop-up-fix.js"
LAYOUTCARD="https://github.com/thomasloven/lovelace-layout-card/archive/refs/tags/v2.4.5.zip"

function systemPrep() {
    sudo apt update && sudo apt upgrade -y && sudo apt autoclean -y && sudo apt autoremove -y
    sudo apt install -y curl git wget python3-pip python3-flask mosquitto mosquitto-clients apparmor bluetooth bluez libbluetooth-dev nfs-common systemd-journal-remote systemd-resolved udisks2 libudev-dev libglib2.0-bin cifs-utils dbus jq lsb-release network-manager
    sudo systemctl enable --now mosquitto apparmor
    sudo systemctl restart networking systemd-resolved.service

    curl -fsSL get.docker.com | sh
    sudo usermod -aG docker $USER


    git clone $OGB_SOURCE 
    mkdir -p ~/$SETUP_DIR && cd ~/$SETUP_DIR

    git clone $RUCK_SOURCE
    wget -O os-agent.deb $OS_AGENT_SOURCE
    wget -O homeassistant-supervised.deb $HA_SOURCE
}

function ruckapiSetup() {
    sudo mkdir -p /opt/ruckecapi

    cd ~/$SETUP_DIR/PWM-Fans/RuckEC_webapi/

    sudo cp bin/* /opt/ruckecapi/.
    sudo cp ruckecapi.service /etc/systemd/system/.

    sudo systemctl enable --now ruckecapi.service
    
}

function mqttSetup() {
    if [ -z "$MQTT_PASS" ]; then
        echo "MQTT_PASS ist nicht gesetzt. Bitte setze das Passwort und versuche es erneut."
        return 1
    fi

    echo -e "$MQTT_PASS\n$MQTT_PASS" | sudo mosquitto_passwd -c /etc/mosquitto/credentials $MQTT_USER
    echo -e "listener 1883\nallow_anonymous false\npassword_file /etc/mosquitto/credentials" | sudo tee /etc/mosquitto/conf.d/local.conf
    sudo systemctl restart mosquitto && sudo systemctl enable mosquitto
}

function homeassistantSetup() {
    cd ~/$SETUP_DIR
    sudo chown _apt:root *.deb
    sudo dpkg -i ./os-agent.deb
    sudo apt install -y ./homeassistant-supervised.deb
    sudo rm os-agent.deb homeassistant-supervised.deb
    echo "Waiting 5 Min for internal Home Assistant setup"
    ## Add support For SD-CARD setup time needed!
    echo "Do not Stop or Interrupt this step !!!!"
    sleep 300
    sudo systemctl restart hassio-supervisor.service
    sleep 30
}

function HACSsetup(){
    wget -O - https://get.hacs.xyz > /tmp/hacs_inst.sh
    sudo bash /tmp/hacs_inst.sh

}

function postSetup(){
    echo "Install ADDONS"
    ha addons install core_configurator
    ha addons install a0d7b954_nodered
}

function OpenGrowBoxSetup() {
    
    ## ONBOARDING MISSING RIGHT NOW TO DO!! 
    #sudo wget -O /usr/share/hassio/homeassistant/.storage/onboarding "$ONBOARDING"

    # Startup Addons
    ha addons start a0d7b954_nodered
    ha addons start core_configurator
    sleep 5
    sudo wget -O /usr/share/hassio/addon_configs/a0d7b954_nodered/flows.json "$ALLFLOWS"

    sudo wget -O /usr/share/hassio/addons.json "$ADDONS"
    sudo wget -O /usr/share/hassio/addons/data/a0d7b954_nodered/options.json "$NODEREDCONF"
    sudo wget -O /usr/share/hassio/addons/data/core_configurator/options.json "$EDITORCONF"

    sudo wget -O /usr/share/hassio/homeassistant/.storage/lovelace.dashboard_opengrowbox "$DASHBOARDVIEW"
    sudo wget -O /usr/share/hassio/homeassistant/.storage/lovelace_dashboards "$OPG_DASHBOARD" 
    
    # Node-Red-Companion-Setup
    echo "Setup Node-Red-Companion-Integration"
    cd /usr/share/hassio/homeassistant/custom_components
    sudo mkdir nodered 
    cd nodered
    sudo wget "$NRCOMPANION" -O nodered.zip
    sudo unzip nodered.zip
    sudo mv hass-node-red-main/custom_components/nodered/* .
    sudo rm -rf hass-node-red-main nodered.zip

     # OGB_HA SETUP
    echo "Instllation OGB HA-Integrations"
    cd /usr/share/hassio/homeassistant/custom_components
    sudo mkdir opengrowbox
    cd opengrowbox
    sudo wget "$OGB" -O ogb.zip
    sudo unzip ogb.zip
    sudo mv OpenGrowBox-HA-*/custom_components/opengrowbox/* .
    sudo rm -rf OpenGrowBox-HA-* ogb.zip

    # OGB_Exhaust HA SETUP
    echo "Installation OGB Exhausts HA-Integrations"
    cd /usr/share/hassio/homeassistant/custom_components && sudo mkdir ogb_exhaust && cd ogb_exhaust
    sudo wget "$OGB_EXHAUST" -O ogbexhaust.zip
    sudo unzip ogbexhaust.zip
    sudo mv OpenGrowBox-Exhaust-main/custom_components/ogb_exhaust/* .
    sudo rm -rf OpenGrowBox-Exhaust-main ogbexhaust.zip

    # Setup mini-Graph
    sudo mkdir -p /usr/share/hassio/homeassistant/www/
    cd /usr/share/hassio/homeassistant/www/
    sudo wget $MINIGRAPH
    # Setup VPD-Chart
    sudo wget "$VPDCHART" -O "vpdchart-card.js" 

    # Setup Mushroom
    sudo wget $MUSHROOM
    
    # Setup Custom Template Card
    sudo wget "$CUSTOMTEMPPLATE" -O "config-template-card.js"
    
    # Setup Vertical Stack Card
    sudo wget "$VERTICALCARD" -O "vertical-stack-in-card.js"
    
    # Setup Tabbed Card
    sudo wget "$TAPPEDCARD" -O "tabbed-card.js"

    # Setup Auto Entities
    sudo wget "$AUTOENTIES" -O "auto-entities.zip" && sudo unzip auto-entities.zip && sudo rm auto-entities.zip 
    # Setup LayoutCard
    sudo wget "$LAYOUTCARD" -O "layout.zip" && sudo unzip layout.zip && sudo rm layout.zip
    # Setup Bubble Cardhist 
    sudo wget "$BUBBLECARD" -O "bubble-card.js"
    sudo wget "$BUBBLEFIX" -O "bubble-pop-up-fix.js"

    # SETUP loveLace_Ressource
    cd /usr/share/hassio/homeassistant/.storage/ && sudo wget  "$LLRESSOURCE" -O lovelace_resources

    # Setup Predefined Rooms and Integrations 
    sudo wget -O /usr/share/hassio/homeassistant/.storage/core.area_registr "$ROOMS"

}

function appArmorBootConf(){
    if grep -q "$PARAMS" "$CMDLINE_FILE"; then
        echo "Die Parameter sind bereits vorhanden."
        clearSetup
        sudo reboot
    else
        # Parameter hinzufügen
        sudo sed -i "s/$/ $PARAMS/" "$CMDLINE_FILE"
        echo "Parameter wurden hinzugefügt. System wird neu gestartet..."
        clearSetup
        sudo reboot
    fi
}

function Welcome() {
    cat << "EOF"
___                 ___                    ___          
| . | ___  ___ ._ _ /  _>  _ _  ___  _ _ _ | . > ___ __  
| | || . \/ ._>| ' || <_/\| '_>/ . \| | | || . \/ . \\ \/
`___'|  _/\___.|_|_|`____/|_|  \___/|__/_/ |___/\___//\_\
     |_|                                                 

Version 2

EOF

echo "OpenGrowBox Install Script"
echo "One Control To Rule Them All!!!"
sleep 3
}

function clearSetup(){
    cd ~ && rm -rf ~/$SETUP_DIR/PWM-Fans/
}

function main() {
    Welcome
    systemPrep
    ruckapiSetup
    mqttSetup
    homeassistantSetup
    postSetup
    HACSsetup
    OpenGrowBoxSetup
    appArmorBootConf
}

main