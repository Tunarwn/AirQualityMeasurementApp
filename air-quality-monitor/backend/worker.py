import pika
import json
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from anomalies.services import get_anomalies, log_anomaly
from measurements.models import AirQualityMeasurement


def callback(ch, method, properties, body):
    print("[x] Veri alındı:", body.decode())
    data = json.loads(body.decode())

    measurement = AirQualityMeasurement.objects.create(**data)
    anomalies = get_anomalies(data)

    for parameter, value in anomalies:
        log_anomaly(measurement, parameter, value)

    ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
    channel = connection.channel()

    channel.queue_declare(queue='measurement_queue', durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='measurement_queue', on_message_callback=callback)

    print("[*] Kuyruk dinleniyor. Çıkmak için CTRL+C")
    channel.start_consuming()


if __name__ == '__main__':
    main()
