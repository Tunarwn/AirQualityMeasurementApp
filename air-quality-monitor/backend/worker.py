import time
import pika
import json
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from anomalies.services import get_anomalies, log_anomaly
from measurements.models import AirQualityMeasurement


def callback(ch, method, properties, body):
    raw = body.decode().strip()
    print("📥 Veri alındı:", raw)

    if not raw:
        print("⚠️ Boş veri alındı, işlenmiyor.")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse hatası: {e}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    try:
        measurement = AirQualityMeasurement.objects.create(**data)
        anomalies = get_anomalies(data)

        for parameter, value, reason in anomalies:
            log_anomaly(measurement, parameter, value, reason)

        print(f"✅ Ölçüm ve anomaly loglandı. {len(anomalies)} anomaly bulundu.")

    except Exception as e:
        print(f"❌ Ölçüm/anomaly işleme hatası: {e}")

    ch.basic_ack(delivery_tag=method.delivery_tag)


def connect_with_retry(host="rabbitmq", retries=5, delay=3):
    for attempt in range(1, retries + 1):
        try:
            print(f"[🔁] RabbitMQ bağlantı denemesi {attempt}/{retries}...")
            return pika.BlockingConnection(pika.ConnectionParameters(host=host))
        except pika.exceptions.AMQPConnectionError as e:
            print(f"❌ RabbitMQ bağlantı hatası (deneme {attempt}): {e}")
            time.sleep(delay)
    raise RuntimeError("RabbitMQ'ya bağlanılamadı.")


def main():
    print("🚀 Worker başlatılıyor...")

    connection = connect_with_retry()
    print("✅ RabbitMQ bağlantısı başarılı.")

    channel = connection.channel()
    channel.queue_declare(queue='measurement_queue', durable=True)
    print("📦 Kuyruk oluşturuldu veya zaten mevcut.")

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='measurement_queue', on_message_callback=callback)

    print("🎧 Kuyruk dinleniyor. Çıkmak için CTRL+C")
    channel.start_consuming()


if __name__ == '__main__':
    main()
