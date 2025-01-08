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
DASHBOARDVIEW="https://raw.githubusercontent.com/OpenGrow-Box/OpenGrowBox/refs/heads/main/UI/setupFiles/lovelace.dashboard_opengrowbox.json"


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
    mkdir -p /tmp/ogbUpdate && cd /tmp/ogbUpdate
    gitclone 
}

function HaRestart(){
    sudo reboot
}

function OpenGrowBoxUpdate() {
    sudo wget -O /usr/share/hassio/addon_configs/a0d7b954_nodered/flows.json "$ALLFLOWS"
    sudo wget -O /usr/share/hassio/homeassistant/.storage/lovelace.dashboard_opengrowbox "$DASHBOARDVIEW"
    sudo wget -O /usr/share/hassio/homeassistant/.storage/lovelace_dashboards "$OPG_DASHBOARD" 
    
    # OGB_HA SETUP
    echo "Instllation OGB HA-Integrations"
    cd /usr/share/hassio/homeassistant/custom_components
    sudo mkdir opengrowbox
    cd opengrowbox
    sudo wget  -O ogb.zip "$OGB"
    sudo unzip ogb.zip
    sudo mv OpenGrowBox-HA-*/custom_components/opengrowbox/* .
    sudo rm -rf OpenGrowBox-HA-* ogb.zip

    # OGB_Exhaust HA SETUP
    echo "Installation OGB Exhausts HA-Integrations"
    cd /usr/share/hassio/homeassistant/custom_components && sudo mkdir ogb_exhaust && cd ogb_exhaust
    sudo wget -O ogbexhaust.zip  "$OGB_EXHAUST"
    sudo unzip ogbexhaust.zip
    sudo mv OpenGrowBox-Exhaust-main/custom_components/ogb_exhaust/* .
    sudo rm -rf OpenGrowBox-Exhaust-main ogbexhaust.zip

    # Setup mini-Graph
    sudo mkdir -p /usr/share/hassio/homeassistant/www/
    cd /usr/share/hassio/homeassistant/www/
    sudo wget $MINIGRAPH
    
    # Setup VPD-Chart
    sudo wget -O "vpdchart-card.js" "$VPDCHART"
    
    # Setup Mushroom
    sudo wget $MUSHROOM
    
    # Setup Custom Template Card
    sudo wget -O "config-template-card.js"  "$CUSTOMTEMPPLATE"
    
    # Setup Vertical Stack Card
    sudo wget -O "vertical-stack-in-card.js" "$VERTICALCARD" 
    
    # Setup Tabbed Card
    sudo wget -O "tabbed-card.js" "$TAPPEDCARD"

    # Setup Auto Entities
    sudo wget -O "auto-entities.zip" "$AUTOENTIES" && sudo unzip auto-entities.zip && sudo rm auto-entities.zip

    # Setup LayoutCard
    sudo wget -O "layout.zip" "$LAYOUTCARD"   && sudo unzip layout.zip && sudo rm layout.zip
    
    # Setup Bubble Card
    sudo wget -O "bubble-card.js" "$BUBBLECARD"
    sudo wget -O "bubble-pop-up-fix.js" "$BUBBLEFIX"
    # SETUP loveLace_Ressource
    cd /usr/share/hassio/homeassistant/.storage/ && sudo wget -O lovelace_resources  "$LLRESSOURCE" 
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


function main() {
    Welcome
    systemPrep
    OpenGrowBoxUpdate
    HaRestart
}

main
