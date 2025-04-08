from django.urls import path
from .views import anomaly_list, anomaly_stream_view

urlpatterns = [
    path("list/", anomaly_list, name="anomaly-list"),
    path("stream/", anomaly_stream_view, name="anomaly-stream"),
]
