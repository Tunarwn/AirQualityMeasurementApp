from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from .models import AnomalyLog
from datetime import timedelta
from django.utils.timezone import now
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from time import sleep
import json
import time

def anomaly_list(request):
    from_param = request.GET.get("from")
    to_param = request.GET.get("to")

    from_dt = parse_datetime(from_param) if from_param else now() - timedelta(hours=1)
    to_dt = parse_datetime(to_param) if to_param else now()

    anomalies = AnomalyLog.objects.filter(
        detected_at__range=(from_dt, to_dt)
    ).select_related("measurement")

    data = []
    for anomaly in anomalies:
        data.append({
            "latitude": anomaly.measurement.latitude,
            "longitude": anomaly.measurement.longitude,
            "detected_at": anomaly.detected_at.isoformat(),
            "parameter": anomaly.parameter,
            "value": anomaly.value
        })

    return JsonResponse(data, safe=False)


@csrf_exempt
def anomaly_stream_view(request):
    def event_stream():
        last_sent = None
        print("🔄 SSE stream başlatıldı")
        
        while True:
            try:
                # Son 1 saatteki bildirimi gönderilmemiş anomalileri al
                anomalies = AnomalyLog.objects.filter(
                    detected_at__gte=now() - timedelta(hours=1),
                    is_notified=False
                ).select_related('measurement').order_by('-detected_at')

                print(f"🔍 Anomali kontrolü: {anomalies.count()} yeni anomali bulundu")

                if anomalies.exists():
                    latest = anomalies.first()
                    print(f"📊 En son anomali: Lat={latest.measurement.latitude}, Lon={latest.measurement.longitude}")
                    
                    if latest.detected_at != last_sent:
                        last_sent = latest.detected_at
                        
                        # Aynı ölçümdeki tüm anomalileri bul
                        related_anomalies = AnomalyLog.objects.filter(
                            measurement=latest.measurement
                        ).select_related('measurement')
                        
                        # Anomali verilerini hazırla
                        anomaly_data = {
                            'latitude': latest.measurement.latitude,
                            'longitude': latest.measurement.longitude,
                            'detected_at': latest.detected_at.isoformat(),
                            'parameters': [
                                {
                                    'parameter': a.parameter,
                                    'value': a.value,
                                    'reason': a.reason
                                } for a in related_anomalies
                            ]
                        }
                        
                        message = json.dumps(anomaly_data)
                        print(f"📤 SSE mesajı gönderiliyor: {message}")
                        
                        # Bildirimi gönderildi olarak işaretle
                        related_anomalies.update(is_notified=True)
                        
                        yield f"data: {message}\n\n"
                    else:
                        print("⏭️ Bu anomali daha önce gönderilmiş")
                else:
                    print("💤 Yeni anomali yok")
                
                yield "data: \n\n"  # Bağlantıyı canlı tut
                
            except Exception as e:
                print(f"❌ SSE hata: {e}")
                yield "data: \n\n"
            
            time.sleep(3)

    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    response['Access-Control-Allow-Origin'] = '*'
    return response

@csrf_exempt
def measurement_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # RabbitMQ'ya bağlan ve veri gönder
            connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
            channel = connection.channel()
            channel.queue_declare(queue='measurement_queue', durable=True)
            channel.basic_publish(
                exchange='',
                routing_key='measurement_queue',
                body=json.dumps(data),
                properties=pika.BasicProperties(delivery_mode=2),
            )
            connection.close()

            return JsonResponse({"message": "Queued for processing"}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

def anomaly_by_location(request):
    try:
        lat = float(request.GET.get("lat"))
        lon = float(request.GET.get("lon"))
    except (TypeError, ValueError):
        return JsonResponse({"error": "Invalid coordinates"}, status=400)

    since = now() - timedelta(hours=24)

    results = AnomalyLog.objects.filter(
        detected_at__gte=since,
        measurement__latitude__range=(lat - 0.01, lat + 0.01),
        measurement__longitude__range=(lon - 0.01, lon + 0.01)
    ).order_by('-detected_at')

    data = [
        {
            "parameter": a.parameter,
            "value": a.value,
            "detected_at": a.detected_at,
        }
        for a in results
    ]

    return JsonResponse(data, safe=False)