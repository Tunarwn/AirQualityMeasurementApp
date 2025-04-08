from anomalies.services import get_anomalies, log_anomaly
from measurements.models import AirQualityMeasurement

def create_measurement(data):
    measurement = AirQualityMeasurement.objects.create(**data)

    anomalies = get_anomalies(data)
    for parameter, value in anomalies:
        log_anomaly(measurement, parameter, value)

    return measurement