from anomalies.models import AnomalyLog
from measurements.models import AirQualityMeasurement
from django.utils.timezone import now
from datetime import timedelta
from math import radians, cos, sin, asin, sqrt


def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Dünya yarıçapı km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return R * 2 * asin(sqrt(a))


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

        latitude = data.get("latitude")
        longitude = data.get("longitude")
        last_day = now() - timedelta(hours=24)

        # Threshold check
        if value > threshold:
            anomalies.append((pollutant, value, "threshold_exceeded"))
            continue

        # Average-based anomaly
        recent_values = AirQualityMeasurement.objects.filter(
            timestamp__gte=last_day,
            latitude=latitude,
            longitude=longitude
        ).values_list(pollutant, flat=True)

        valid_values = [v for v in recent_values if v is not None]
        if valid_values:
            avg = sum(valid_values) / len(valid_values)
            if avg > 0 and value > avg * 1.5:
                anomalies.append((pollutant, value, "relative_spike"))

        # Proximity anomaly (25km radius)
        neighbors = AirQualityMeasurement.objects.filter(
            timestamp__gte=last_day
        ).exclude(latitude=latitude, longitude=longitude)

        for neighbor in neighbors:
            dist_km = haversine(latitude, longitude, neighbor.latitude, neighbor.longitude)
            neighbor_value = getattr(neighbor, pollutant, None)
            if dist_km <= 25 and neighbor_value is not None and abs(neighbor_value - value) > 30:
                anomalies.append((pollutant, value, "proximity_spike"))
                break 

    return anomalies


def log_anomaly(measurement: AirQualityMeasurement, parameter: str, value: float, reason: str = "unknown"):
    AnomalyLog.objects.create(
        measurement=measurement,
        parameter=parameter,
        value=value,
        reason=reason
    )

