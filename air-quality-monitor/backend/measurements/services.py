from .models import AirQualityMeasurement
from anomalies.services import is_anomalous

def create_measurement(data):
    measurement = AirQualityMeasurement.objects.create(**data)

    if is_anomalous(data):
        print("⚠️ Anomaly detected!")
    
    return measurement
