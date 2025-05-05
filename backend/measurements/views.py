from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AirQualityMeasurementSerializer
from .services import create_measurement
from measurements.models import AirQualityMeasurement
from django.utils.timezone import now
from datetime import timedelta
from django.utils.timezone import now
from datetime import timedelta
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime



class MeasurementCreateView(APIView):
    def get(self, request):
        queryset = AirQualityMeasurement.objects.all().order_by('timestamp')
        data = [
            {
                "timestamp": m.timestamp,
                "latitude": m.latitude,
                "longitude": m.longitude,
                "pm25": m.pm25,
                "pm10": m.pm10,
                "no2": m.no2,
                "so2": m.so2,
                "o3": m.o3,
            }
            for m in queryset
        ]
        return Response(data)

    def post(self, request):
        # Burada mevcut POST logic’inizi kullanabilirsiniz
        # Örneğin:
        serializer = AirQualityMeasurementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class MeasurementListView(APIView): # last 24 hours get data 
    def get(self, request):
        ##since = now() - timedelta(hours=24)
        queryset = AirQualityMeasurement.objects.all().order_by('timestamp')
        data = [
            {
                "timestamp": m.timestamp,
                "latitude": m.latitude,
                "longitude": m.longitude,
                "pm25": m.pm25,
                "pm10": m.pm10,
                "no2": m.no2,
                "so2": m.so2,
                "o3": m.o3,
            }
            for m in queryset
        ]
        return Response(data)


def pm25_by_location(request):
    lat = float(request.GET.get("lat"))
    lon = float(request.GET.get("lon"))

    time_threshold = now() - timedelta(hours=24)

    measurements = AirQualityMeasurement.objects.filter(
        latitude=lat, longitude=lon, timestamp__gte=time_threshold
    ).order_by("timestamp")

    data = [
        {
            "timestamp": m.timestamp,
            "pm25": m.pm25
        }
        for m in measurements if m.pm25 is not None
    ]

    return JsonResponse(data, safe=False)

class MeasurementByLocationView(APIView):
    def get(self, request):
        try:
            lat = float(request.GET.get("lat"))
            lon = float(request.GET.get("lon"))
        except (TypeError, ValueError):
            return Response({"error": "Invalid coordinates"}, status=400)

        # Zaman aralığı opsiyonel
        from_param = request.GET.get("from")
        to_param = request.GET.get("to")
        from_dt = parse_datetime(from_param) if from_param else now() - timedelta(hours=24)
        to_dt = parse_datetime(to_param) if to_param else now()

        queryset = AirQualityMeasurement.objects.filter(
            timestamp__range=(from_dt, to_dt),
            latitude__range=(lat - 0.01, lat + 0.01),
            longitude__range=(lon - 0.01, lon + 0.01)
        ).order_by('-timestamp')

        serializer = AirQualityMeasurementSerializer(queryset, many=True)
        return Response(serializer.data)