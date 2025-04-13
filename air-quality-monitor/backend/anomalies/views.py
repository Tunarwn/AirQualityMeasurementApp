from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from .models import AnomalyLog
from datetime import timedelta
from django.utils.timezone import now
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from time import sleep

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
        while True:
            anomalies = AnomalyLog.objects.filter(
                detected_at__gte=now() - timedelta(hours=1)
            ).order_by('-detected_at')

            if anomalies.exists():
                latest = anomalies.first()
                if latest.detected_at != last_sent:
                    last_sent = latest.detected_at
                    msg = f"Anomaly at ({latest.measurement.latitude}, {latest.measurement.longitude})"
                    yield f"data: {msg}\n\n"
                else:
                    yield "data: \n\n"  # boş mesaj ile SSE bağlantısını canlı tut
            else:
                yield "data: \n\n"
            sleep(3)

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response


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