from django.urls import path
from .views import MeasurementCreateView, MeasurementListView, pm25_by_location, MeasurementByLocationView

urlpatterns = [
    path('', MeasurementCreateView.as_view(), name='create-measurement'),
    path('history/', MeasurementListView.as_view(), name='measurement-history'),
    path('pm25/', pm25_by_location),
    path('by-location/', MeasurementByLocationView.as_view(), name='measurement-by-location'),
]

