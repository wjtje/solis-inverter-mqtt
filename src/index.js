import SolisInverterClient from 'solis-inverter/lib/solis_inverter_client.js';
import mqtt from 'mqtt'

/**
 * Log a message with a timestamp
 * 
 * @param {any} what 
 * @returns 
 */
const log = (what) => console.log([new Date().toISOString(), what].join(' '));

// Create a connection to the inverter
const inverter = new SolisInverterClient(process.env.INVERTER_ADDRESS, process.env.INVERTER_USERNAME, process.env.INVERTER_PASSWORD);
let inverterData = await inverter.fetchData();

console.log(inverterData);

// Create a connection to the mqtt server
const mqttClient = mqtt.connect(
	`mqtt://${process.env.MQTT_SERVER ?? 'localhost'}:${process.env.MQTT_PORT ?? 1883}`,
	{
		username: process.env.MQTT_USERNAME,
		password: process.env.MQTT_PASSWORD,
		will: {
			topic: `homeassistant/sensor/solis-${inverterData.logger.serial}/available`,
			payload: 'offline',
			retain: true
		}
	}
)

mqttClient.on('error', log);
mqttClient.on('connect', () => {
	log('MQTT connected, sending discovery');

	// Send config
	// Current power
	mqttClient.publish(
		`homeassistant/sensor/solis-${inverterData.logger.serial}/current_power/config`,
		`{
	"name": "Current power",
	"availability_topic": "homeassistant/sensor/solis-${inverterData.logger.serial}/available",
	"device_class": "power",
	"state_class": "measurement",
	"state_topic": "homeassistant/sensor/solis-${inverterData.logger.serial}/state",
	"unique_id": "solis_${inverterData.logger.serial}_current_power",
	"unit_of_measurement": "W",
	"value_template": "{{value_json.power}}",
	"device": {
		"identifiers": "${inverterData.logger.serial}",
		"manufacturer": "Solis",
		"model": "Data Logging Stick",
		"sw_version": "${inverterData.logger.version}",
		"name": "${process.env.NAME}"
	}
}`,
		{ retain: true }
	);

	// Energy today
	mqttClient.publish(
		`homeassistant/sensor/solis-${inverterData.logger.serial}/energy_today/config`,
		`{
	"name": "Energy today",
	"availability_topic": "homeassistant/sensor/solis-${inverterData.logger.serial}/available",
	"device_class": "energy",
	"state_class": "total_increasing",
	"state_topic": "homeassistant/sensor/solis-${inverterData.logger.serial}/state",
	"unique_id": "solis_${inverterData.logger.serial}_energy_today",
	"unit_of_measurement": "kWh",
	"value_template": "{{value_json.energy.today}}",
	"device": {
		"identifiers": "${inverterData.logger.serial}",
		"manufacturer": "Solis",
		"model": "Data Logging Stick",
		"sw_version": "${inverterData.logger.version}",
		"name": "${process.env.NAME}"
	}
}`,
		{ retain: true }
	);

	// Energy total
	mqttClient.publish(
		`homeassistant/sensor/solis-${inverterData.logger.serial}/energy_total/config`,
		`{
	"name": "Energy total",
	"availability_topic": "homeassistant/sensor/solis-${inverterData.logger.serial}/available",
	"device_class": "energy",
	"state_class": "total_increasing",
	"state_topic": "homeassistant/sensor/solis-${inverterData.logger.serial}/state",
	"unique_id": "solis_${inverterData.logger.serial}_energy_total",
	"unit_of_measurement": "kWh",
	"value_template": "{{value_json.energy.total}}",
	"device": {
		"identifiers": "${inverterData.logger.serial}",
		"manufacturer": "Solis",
		"model": "Data Logging Stick",
		"sw_version": "${inverterData.logger.version}",
		"name": "${process.env.NAME}"
	}
}`,
		{ retain: true }
	);

	// Set available message
	mqttClient.publish(
		`homeassistant/sensor/solis-${inverterData.logger.serial}/available`,
		'online',
		{ retain: true }
	);
});

const fetchData = async () => {
	log('Fetching data');
	inverter
		.fetchData()
		.then((data) => {
			if (data.inverter.serial) {
				inverterData = data;

				// Send an MQTT message
				mqttClient.publish(
					`homeassistant/sensor/solis-${inverterData.logger.serial}/state`,
					JSON.stringify(inverterData),
					{ retain: true }
				);
			}
		})
		.catch((err) => {
			mqttClient.publish(
				`homeassistant/sensor/solis-${inverterData.logger.serial}/state`,
				JSON.stringify({
					...lastResponse,
					power: 0,
				}),
				{ retain: true }
			);

			log(`Could not fetch data from inverter: ${err}`);
		});
}

setInterval(fetchData, 30000);