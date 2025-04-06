from django.db import models

class AirQualityMeasurement(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField()
    longitude = models.FloatField()

    pm25 = models.FloatField(null=True, blank=True)
    pm10 = models.FloatField(null=True, blank=True)
    no2 = models.FloatField(null=True, blank=True)
    so2 = models.FloatField(null=True, blank=True)
    o3 = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Measurement at ({self.latitude}, {self.longitude}) on {self.timestamp}"
