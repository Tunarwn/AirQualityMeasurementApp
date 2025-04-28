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

    from_dt = parse_datetime(from_param) if from_param else now() - timedelta(hours=24)
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
        last_sent_anomaly = None
        last_sent_measurement = None
        print("🔄 SSE stream başlatıldı")

        from measurements.models import AirQualityMeasurement

        while True:
            try:
                # --- 1. Anomali Bildirimi ---
                anomalies = AnomalyLog.objects.filter(
                    detected_at__gte=now() - timedelta(hours=1),
                    is_notified=False
                ).select_related('measurement').order_by('-detected_at')

                if anomalies.exists():
                    latest = anomalies.first()
                    print(f"📊 En son anomali: Lat={latest.measurement.latitude}, Lon={latest.measurement.longitude}")

                    if latest.detected_at != last_sent_anomaly:
                        last_sent_anomaly = latest.detected_at

                        related_anomalies = AnomalyLog.objects.filter(
                            measurement=latest.measurement
                        ).select_related('measurement')

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

                        related_anomalies.update(is_notified=True)
                        yield f"data: {message}\n\n"

                # --- 2. Yeni Ölçüm Bildirimi ---
                latest_measurement = AirQualityMeasurement.objects.order_by('-timestamp').first()
                if latest_measurement and (not last_sent_measurement or latest_measurement.timestamp > last_sent_measurement):
                    last_sent_measurement = latest_measurement.timestamp

                    measurement_data = {
                        'latitude': latest_measurement.latitude,
                        'longitude': latest_measurement.longitude,
                        'detected_at': latest_measurement.timestamp.isoformat(),
                        'parameters': [
                            {'parameter': p, 'value': getattr(latest_measurement, p)}
                            for p in ['pm25', 'pm10', 'no2', 'so2', 'o3']
                            if getattr(latest_measurement, p) is not None
                        ]
                    }
                    message = json.dumps(measurement_data)
                    yield f"data: {message}\n\n"

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

def anomaly_heatmap(request):
    # Bounding box parametreleri
    try:
        north = float(request.GET.get("north"))
        south = float(request.GET.get("south"))
        east = float(request.GET.get("east"))
        west = float(request.GET.get("west"))
    except (TypeError, ValueError):
        return JsonResponse({"error": "Geçersiz koordinatlar"}, status=400)

    # Zaman aralığı (opsiyonel)
    from_param = request.GET.get("from")
    to_param = request.GET.get("to")
    from_dt = parse_datetime(from_param) if from_param else now() - timedelta(hours=24)
    to_dt = parse_datetime(to_param) if to_param else now()

    # Sorgu
    anomalies = AnomalyLog.objects.filter(
        detected_at__range=(from_dt, to_dt),
        measurement__latitude__gte=south,
        measurement__latitude__lte=north,
        measurement__longitude__gte=west,
        measurement__longitude__lte=east
    )

    # Her konum için maksimum değeri bul
    heatmap_points = {}
    for anomaly in anomalies:
        key = (round(anomaly.measurement.latitude, 4), round(anomaly.measurement.longitude, 4))
        value = anomaly.value
        if key not in heatmap_points or value > heatmap_points[key]:
            heatmap_points[key] = value

    # Leaflet heatmap formatı: [lat, lon, intensity]
    data = [
        [lat, lon, val]
        for (lat, lon), val in heatmap_points.items()
    ]

    return JsonResponse(data, safe=False)