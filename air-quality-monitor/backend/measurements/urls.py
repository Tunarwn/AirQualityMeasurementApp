from django.urls import path
from .views import MeasurementCreateView

urlpatterns = [
    path('', MeasurementCreateView.as_view(), name='create-measurement'),
]
