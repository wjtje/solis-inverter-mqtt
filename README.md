# Solis inverter to MQTT

This is a simple wrapper around [fss/solis-inverter](https://github.com/fss/solis-inverter) to integrate a Solis PV into Home Assistant.

## Environment

| What              | Type   | Default   | Required |
| ----------------- | ------ | --------- | -------- |
| MQTT_SERVER       | String | localhost |          |
| MQTT_PORT         | Number | 1883      |          |
| MQTT_USERNAME     | String |           |          |
| MQTT_PASSWORD     | String |           |          |
| INVERTER_ADDRESS  | String |           | Yes      |
| INVERTER_USERNAME | String |           | Yes      |
| INVERTER_PASSWORD | String |           | Yes      |
| NAME              | String |           | Yes      |
