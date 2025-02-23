# Welcome to my stupid washer/dryer monitoring app

## Setup

## Washer and Dryer

* Make sure they're off during the first run.
* You should follow the setup guide [here](https://github.com/thinq-connect/pythinqconnect/tree/main/thinqconnect)

### .secrets.json

Create your `.secrets.json` file in the root directory.

```JSON
{
    "thinq": {
        "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "accessToken": "thinqpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    "discordWebhook": ""
}
```

### Install Python dependencies

* Docker installed
  * If installing on Windows, ensure the Daemon is exposed without TLS.

## Washtower

### Dryer Run States

* POWER_OFF
* INITIAL
* PAUSE
* DETECTING
* COOLING
* RUNNING
* WRINKLE_CARE
* END
* RESERVED
* ERROR
* SLEEP

### Washer Run States

* ADD_DRAIN
* CHANGE_CONDITION
* CHECKING_TURBIDITY
* COOL_DOWN
* DETECTING
* DETERGENT_AMOUNT
* DISPENSING
* DISPLAY_LOADSIZE
* DRYING
* END
* ERROR
* FIRMWARE
* FROZEN_PREVENT_INITIAL
* FROZEN_PREVENT_PAUSE
* FROZEN_PREVENT_RUNNING
* INITIAL
* PAUSE
* POWER_OFF
* PREWASH
* PROOFING
* REFRESHING
* RESERVED
* RINSE_HOLD
* RINSING
* RUNNING
* SHOES_MODULE
* SLEEP
* SMART_GRID_RUN
* SOAKING
* SOFTENING
* SPINNING
* STEAM_SOFTENING
