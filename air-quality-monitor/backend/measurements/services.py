from anomalies.services import is_anomalous, log_anomaly

def create_measurement(data):
    measurement = AirQualityMeasurement.objects.create(**data)
    if is_anomalous(data):
        print("⚠️ Anomaly detected!")
        log_anomaly(measurement)
    return measurement
