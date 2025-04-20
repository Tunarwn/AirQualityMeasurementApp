from django.db import models
from measurements.models import AirQualityMeasurement
from django.utils import timezone
from datetime import timedelta

class AnomalyLog(models.Model):
    measurement = models.ForeignKey(AirQualityMeasurement, on_delete=models.CASCADE, related_name="anomalies")
    detected_at = models.DateTimeField(auto_now_add=True)
    parameter = models.CharField(max_length=10, null=True, blank=True)
    value = models.FloatField(null=True, blank=True)
    reason = models.CharField(max_length=100)
    average_24h_value = models.FloatField(null=True, blank=True)
    threshold = models.FloatField(null=True, blank=True)
    exceeded_by = models.FloatField(null=True, blank=True)
    is_notified = models.BooleanField(default=False)




    def is_active(self):
        return timezone.now() < self.detected_at + timedelta(hours=1)

    def __str__(self):
        return f"Anomaly at {self.measurement.latitude}, {self.measurement.longitude}"

