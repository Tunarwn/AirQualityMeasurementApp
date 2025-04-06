from rest_framework import serializers
from .models import AirQualityMeasurement

class AirQualityMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirQualityMeasurement
        fields = '__all__'
