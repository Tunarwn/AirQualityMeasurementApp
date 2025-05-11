import pika
import json
from anomalies.services import get_anomalies, log_anomaly
from measurements.models import AirQualityMeasurement

def send_to_queue(data):
    try:
        credentials = pika.PlainCredentials('guest', 'guest')
        parameters = pika.ConnectionParameters(
            host='rabbitmq',
            port=5672,
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=300
        )
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()

        channel.queue_declare(queue='measurement_queue', durable=True)
        channel.basic_publish(
            exchange='',
            routing_key='measurement_queue',
            body=json.dumps(data),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Mesaj kalıcı olsun
            )
        )
        connection.close()
        print("[✅] Veri kuyruğa gönderildi.")
    except Exception as e:
        print(f"[❌] Kuyruğa gönderim hatası: {e}")



def create_measurement(data):
    send_to_queue(data)
    return data

