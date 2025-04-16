from anomalies.models import AnomalyLog
from measurements.models import AirQualityMeasurement
from django.utils.timezone import now
from datetime import timedelta


def get_anomalies(data):
    WHO_THRESHOLDS = {
        "pm25": 25.0,
        "pm10": 50.0,
        "no2": 40.0,
        "so2": 20.0,
        "o3": 100.0
    }

    anomalies = []

    for pollutant, threshold in WHO_THRESHOLDS.items():
        value = data.get(pollutant)
        if not value:
            continue

        # Threshold kontrolü
        if value > threshold:
            anomalies.append((pollutant, value))
            continue

        # Ortalama kontrolü (son 24 saat aynı konumda)
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        last_day = now() - timedelta(hours=24)

        recent_values = AirQualityMeasurement.objects.filter(
            timestamp__gte=last_day,
            latitude=latitude,
            longitude=longitude
        ).values_list(pollutant, flat=True)

        valid_values = [v for v in recent_values if v is not None]
        if valid_values:
            avg = sum(valid_values) / len(valid_values)
            if avg > 0 and value > avg * 1.5:
                anomalies.append((pollutant, value))

    return anomalies


def log_anomaly(measurement: AirQualityMeasurement, parameter: str, value: float):

    AnomalyLog.objects.create(
        measurement=measurement,
        parameter=parameter,
        value=value
    )
