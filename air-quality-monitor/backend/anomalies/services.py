def is_anomalous(data):
    WHO_THRESHOLDS = {
        "pm25": 25.0,
        "pm10": 50.0,
        "no2": 40.0,
        "so2": 20.0,
        "o3": 100.0
    }

    for pollutant, threshold in WHO_THRESHOLDS.items():
        if pollutant in data and data[pollutant] and data[pollutant] > threshold:
            return True
    return False


def log_anomaly(measurement):
    from .models import AnomalyLog
    AnomalyLog.objects.create(measurement=measurement)
