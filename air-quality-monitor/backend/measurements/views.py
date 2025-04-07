from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AirQualityMeasurementSerializer
from .services import create_measurement

class MeasurementCreateView(APIView):
    def post(self, request):
        serializer = AirQualityMeasurementSerializer(data=request.data)
        if serializer.is_valid():
            measurement = create_measurement(serializer.validated_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
