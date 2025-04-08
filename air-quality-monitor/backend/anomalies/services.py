from anomalies.models import AnomalyLog
from measurements.models import AirQualityMeasurement

# WHO eşik değerleri
WHO_THRESHOLDS = {
    "pm25": 25.0,
    "pm10": 50.0,
    "no2": 40.0,
    "so2": 20.0,
    "o3": 100.0
}

def get_anomalies(data):

    anomalies = []

    for pollutant, threshold in WHO_THRESHOLDS.items():
        value = data.get(pollutant)
        if value is not None and value > threshold:
            anomalies.append((pollutant, value))

    return anomalies


def log_anomaly(measurement: AirQualityMeasurement, parameter: str, value: float):

    AnomalyLog.objects.create(
        measurement=measurement,
        parameter=parameter,
        value=value
    )
