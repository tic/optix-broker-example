(require("dotenv")).config();
const config = process.env;
const luxon = require("luxon").DateTime;
const mqtt = require("mqtt");

// config.OPTIX_BROKER = mqtt://<ip of the broker>
const client  = mqtt.connect(config.OPTIX_BROKER, {
    host: config.OPTIX_BROKER,
    port: 1883,
});


function data() {
    const sampleData = {
        "app_id": "new_metric_add_test_1", // dataset name
        "counter": 1,
        "payload_fields": {
            "test_sensor_0": { // metric name
                "displayName": "Test Value",
                "unit": "T",
                "value": 59
            },
        },
        "metadata": {
            "time": luxon.utc().toISO() // expects format: "2021-06-25T00:00:00.000000Z"
        }
    }
    return sampleData;
}

client.on("connect", function (r) {
    console.log("connected to broker#1883");
    client.subscribe("default/transform", function (err) {
        console.log("subbed to broker#1883");
        if (!err) {
            setInterval(() => {
                console.log("publushing to broker#1883");
                client.publish("default/transform", JSON.stringify(data()));
            }, 10000);
        }
    })
});

client.on("error", err => console.log(err));


// This is used to confirm messages after they are sent through the pretransformer.
// This can help you verify how the pretransformer is handling your data inputs.
backside = mqtt.connect(config.OPTIX_BROKER, {
    host: config.OPTIX_BROKER,
    port: 2883
});

backside.on("connect", () => {
    console.log("connected to broker#2883");
    backside.subscribe("testing/default", () => { // the topic to subscribe to here is based on what pretransformer and lambda transform you need to use
        console.log("subbed to broker#2883");
        backside.on("message", (topic, msg) => {
            console.log(msg.toString());
        })
    });
});
