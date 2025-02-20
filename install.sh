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

# Sources 
OGB_SOURCE="https://github.com/OpenGrow-Box/OpenGrowBox.git"
RUCK_SOURCE="https://github.com/OpenGrow-Box/PWM-Fans"
OS_AGENT_SOURCE="https://github.com/home-assistant/os-agent/releases/download/1.6.0/os-agent_1.6.0_linux_aarch64.deb"
HA_SOURCE="https://github.com/home-assistant/supervised-installer/releases/latest/download/homeassistant-supervised.deb"

## ADDONS 
OGB="https://github.com/OpenGrow-Box/OpenGrowBox-HA/archive/refs/tags/v1.2.0._1.zip"
OGB_EXHAUST="https://github.com/OpenGrow-Box/OpenGrowBox-Exhaust/archive/refs/tags/0.2.zip"


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

}

function OpenGrowBoxSetup() {
    
    ## ONBOARDING MISSING RIGHT NOW TO DO!! 
    #sudo wget -O /usr/share/hassio/homeassistant/.storage/onboarding "$ONBOARDING"

    # Startup Addons

    sleep 5

     # OGB_HA SETUP
    echo "Instllation OGB HA-Integrations"
    cd /usr/share/hassio/homeassistant/custom_components
    sudo mkdir opengrowbox
    cd opengrowbox
    sudo wget -O ogb.zip "$OGB" 
    sudo unzip ogb.zip
    sudo mv OpenGrowBox-HA-*/custom_components/opengrowbox/* .
    sudo rm -rf OpenGrowBox-HA-* ogb.zip

    # OGB_Exhaust HA SETUP
    echo "Installation OGB Exhausts HA-Integrations"
    cd /usr/share/hassio/homeassistant/custom_components && sudo mkdir ogb_exhaust && cd ogb_exhaust
    sudo wget -O ogbexhaust.zip "$OGB_EXHAUST"
    sudo unzip ogbexhaust.zip
    sudo mv OpenGrowBox-Exhaust-main/custom_components/ogb_exhaust/* .
    sudo rm -rf OpenGrowBox-Exhaust-main ogbexhaust.zip

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