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



class MeasurementCreateView(APIView):
    def post(self, request):
        serializer = AirQualityMeasurementSerializer(data=request.data)
        if serializer.is_valid():
            measurement = create_measurement(serializer.validated_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeasurementListView(APIView): # last 24 hours get data 
    def get(self, request):
        since = now() - timedelta(hours=24)
        queryset = AirQualityMeasurement.objects.filter(timestamp__gte=since).order_by('timestamp')
        data = [
            {
                "timestamp": m.timestamp,
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
