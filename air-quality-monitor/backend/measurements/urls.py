from django.urls import path
from .views import MeasurementCreateView, MeasurementListView

urlpatterns = [
    path('', MeasurementCreateView.as_view(), name='create-measurement'),
    path('history/', MeasurementListView.as_view(), name='measurement-history'),
]

