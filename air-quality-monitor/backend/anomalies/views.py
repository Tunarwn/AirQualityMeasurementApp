from django.http import StreamingHttpResponse
from django.utils.timezone import now
from time import sleep
from .models import AnomalyLog

def anomaly_stream_view(request):
    def event_stream():
        last_sent = None
        while True:
            # Yeni anomaly var mı kontrol et
            anomalies = AnomalyLog.objects.filter(detected_at__gte=now() - timedelta(hours=1)).order_by('-detected_at')

            if anomalies.exists():
                latest = anomalies.first()
                if latest.detected_at != last_sent:
                    last_sent = latest.detected_at
                    yield f"data: Anomaly at ({latest.measurement.latitude}, {latest.measurement.longitude})\n\n"

            sleep(3)  # 3 saniyede bir kontrol et

    return StreamingHttpResponse(event_stream(), content_type='text/event-stream')
