from django.contrib import admin
from django.urls import path
from measurements.views import MeasurementCreateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/measurements/', MeasurementCreateView.as_view(), name='create-measurement'),
]

