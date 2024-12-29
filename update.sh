#!/bin/bash
#
# OpenGrowBox update Script
#
# Copy this script to the Device you want to use.
# use this commands: 
# vi update.sh
# chmod +x update.sh
# sudo ./update.sh
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


# Sources 
OGB_SOURCE="https://github.com/OpenGrow-Box/OpenGrowBox.git"

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
OGB="https://github.com/OpenGrow-Box/OpenGrowBox-HA/archive/refs/tags/v1.1.zip"
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
AUTOENTIES=""

function systemPrep() {
    sudo apt update && sudo apt upgrade -y && sudo apt autoclean -y && sudo apt autoremove -y
    mkdir -p /tmp/ogbUpdate && cd /tmp/ogbUpdate
    gitclone 
}

function HaRestart(){
    sudo systemctl restart hassio-supervisor.service
    sleep 30
}

function OpenGrowBoxSetup() {
    sudo wget -O /usr/share/hassio/addon_configs/a0d7b954_nodered/flows.json "$ALLFLOWS"

    #sudo wget -O /usr/share/hassio/homeassistant/airCtrlSensor.yaml  "$RUCKEHACCONF"
    sudo wget -O /usr/share/hassio/homeassistant/configuration.yaml "$MAINCONF"
    sudo wget -O /usr/share/hassio/homeassistant/.storage/lovelace.dashboard_opengrowbox "$DASHBOARDVIEW"
    sudo wget -O /usr/share/hassio/homeassistant/.storage/lovelace_dashboards "$OPG_DASHBOARD" 
    
    # Node-Red-Companion-Setup
    echo "Setup Node-Red-Companion-Integration"
    cd /usr/share/hassio/homeassistant/custom_components && sudo mkdir nodered && cd nodered
    sudo wget "$NRCOMPANION" -O nodered.zip
    sudo unzip nodered.zip
    sudo mv hass-node-red-main/custom_components/nodered/* .
    sudo rm -rf hass-node-red-main nodered.zip

    # OGB_HA SETUP
    echo "Instllation OGB HA-Integrations"
    cd /usr/share/hassio/homeassistant/custom_components && sudo mkdir opengrowbox && cd opengrowbox
    sudo wget "$OGB" -o ogb.zip
    sudo unzip ogb.zip
    sudo mv OpenGrowBox-HA-*/custom_components/opengrowbox/* .
    sudo rm -rf  OpenGrowBox-HA-* ogb.zip

    # OGB_Exhaust HA SETUP
    echo "Instllation OGB Exhausts HA-Integrations"
    cd /usr/share/hassio/homeassistant/custom_components && sudo mkdir ogb_exhaust && cd ogb_exhaust
    sudo wget "$OGB_EXHAUST" -o ogbexhaust.zip
    sudo unzip ogb.zip
    sudo mv OpenGrowBox-Exhaust-main/custom_components/ogb_exhaust/* .
    sudo rm -rf OpenGrowBox-Exhaust-main ogbexhaust.zip

    # Setup mini-Graph
    sudo mkdir -p /usr/share/hassio/homeassistant/www/
    cd /usr/share/hassio/homeassistant/www/
    sudo wget $MINIGRAPH
    # Setup VPD-Chart
    sudo wget "$VPDCHART" -O "vpdchart-card.js" 
    # Setup 
    sudo wget $MUSHROOM
    sudo wget $CUSTOMTEMPPLATE
    sudo wget $VERTICALCARD
    sudo wget $AUTOENTIES
    sudo wget $TAPPEDCARD

    # SETUP loveLace_Ressource
    cd /usr/share/hassio/homeassistant/.storage/ && sudo wget  "$LLRESSOURCE" -O lovelace_resources
}


function Welcome() {
    cat << "EOF"
___                 ___                    ___          
| . | ___  ___ ._ _ /  _>  _ _  ___  _ _ _ | . > ___ __  
| | || . \/ ._>| ' || <_/\| '_>/ . \| | | || . \/ . \\ \/
`___'|  _/\___.|_|_|`____/|_|  \___/|__/_/ |___/\___//\_\
     |_|                                                 

Updater = version 2

EOF

echo "OpenGrowBox Update Script"
echo "One Control To Rule Them All!!!"
sleep 3
}

function clearSetup(){
    cd ~ && rm -rf ~/$SETUP_DIR/PWM-Fans/
}

function main() {
    Welcome
    systemPrep
    OpenGrowBoxUpdate
    HaRestart
}

main