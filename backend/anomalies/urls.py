from django.urls import path
from .views import anomaly_list, anomaly_stream_view, anomaly_by_location, anomaly_heatmap

urlpatterns = [
    path("list/", anomaly_list, name="anomaly-list"),
    path("stream/", anomaly_stream_view, name="anomaly-stream"),
    path("by-location/", anomaly_by_location),
    path("heatmap/", anomaly_heatmap),
]
