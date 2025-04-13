import pika
import json
from anomalies.services import get_anomalies, log_anomaly
from measurements.models import AirQualityMeasurement

def publish_measurement_to_queue(data):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
    channel = connection.channel()
    channel.queue_declare(queue='measurement_queue', durable=True)
    channel.basic_publish(
        exchange='',
        routing_key='measurement_queue',
        body=json.dumps(data),
        properties=pika.BasicProperties(
            delivery_mode=2,
        )
    )
    connection.close()


def create_measurement(data):
    publish_measurement_to_queue(data)
    return data
