## Node-Red Functions and Logic

You can copy and paste these Node-Red flows, import them into your system, and have fun with them.

# Core Components
- MasterFlow
- TargetedDevices
- Globals

## YOU ALWAYS NEED THE MASTER FLOW!
The Master Flow polls different rooms from Home Assistant.

If the room name is:
- veggitent
- flowertent
- dryingtent

All entities and devices will be clustered together and pushed out to the Tent Flow via Link-OUT/LINK-IN nodes.

## Globals 
Here are the values for Target-VPD, PlantStage selectors, and TentModes.

## Targeted Devices 
This is the only point where you need to make changes in all the flows.
Set the devices that need to be controlled here.

## Helpers 
Helpers are parts of the entire Tent Flow.
