#!/usr/bin/env python3
import argparse
import random
import time
import requests
from datetime import datetime

class AutoTester:
    def __init__(self, request_limit, rate, anomaly_chance):
        self.request_limit = request_limit
        self.rate = rate
        self.anomaly_chance = anomaly_chance
        self.base_url = "http://localhost:8000/api/measurements/"
        
        # Türkiye'nin yaklaşık sınırları
        # (Kaynak: En batı: 26.0433, En doğu: 44.8344, En kuzey: 42.1054, En güney: 35.8076)
        self.locations = [
            # Büyük şehirler ve çevreleri (merkez koordinat ± 0.1 derece)
            {"name": "İstanbul", "lat": (40.9, 41.1), "lon": (28.8, 29.3)},
            {"name": "Ankara", "lat": (39.8, 40.0), "lon": (32.7, 33.0)},
            {"name": "İzmir", "lat": (38.3, 38.5), "lon": (27.0, 27.3)},
            {"name": "Bursa", "lat": (40.1, 40.3), "lon": (28.9, 29.1)},
            {"name": "Antalya", "lat": (36.8, 37.0), "lon": (30.6, 30.8)},
            {"name": "Adana", "lat": (36.9, 37.1), "lon": (35.2, 35.4)},
            {"name": "Gaziantep", "lat": (37.0, 37.2), "lon": (37.3, 37.5)},
            {"name": "Konya", "lat": (37.8, 38.0), "lon": (32.4, 32.6)},
            {"name": "Kayseri", "lat": (38.6, 38.8), "lon": (35.4, 35.6)},
            {"name": "Trabzon", "lat": (40.9, 41.1), "lon": (39.6, 39.8)},
            {"name": "Diyarbakır", "lat": (37.8, 38.0), "lon": (40.1, 40.3)},
            {"name": "Erzurum", "lat": (39.8, 40.0), "lon": (41.2, 41.4)},
            {"name": "Van", "lat": (38.4, 38.6), "lon": (43.2, 43.4)}
        ]
        
        # Kullanılan konumları takip etmek için
        self.used_locations = []
        
        # Normal değer aralıkları (tam ve yarım sayılar)
        self.normal_ranges = {
            "pm25": [(5, 25), 0.5],    # (min, max), adım
            "pm10": [(10, 50), 0.5],
            "no2": [(10, 40), 1.0],
            "so2": [(5, 20), 0.5],
            "o3": [(30, 90), 1.0]
        }
        
        # Anomali değer aralıkları (tam ve yarım sayılar)
        self.anomaly_ranges = {
            "pm25": [(50, 150), 1.0],
            "pm10": [(100, 200), 1.0],
            "no2": [(80, 150), 1.0],
            "so2": [(40, 100), 1.0],
            "o3": [(150, 250), 1.0]
        }

    def round_to_step(self, value, step):
        return round(value / step) * step

    def generate_location(self):
        # %30 ihtimalle önceden kullanılmış bir konum seç
        if self.used_locations and random.random() < 0.30:
            old_location = random.choice(self.used_locations)
            return old_location["lat"], old_location["lon"], old_location["name"]
        
        # Yeni bir konum seç
        selected_city = random.choice(self.locations)
        lat = round(random.uniform(*selected_city["lat"]), 4)
        lon = round(random.uniform(*selected_city["lon"]), 4)
        
        # Kullanılan konumları kaydet
        location_info = {"lat": lat, "lon": lon, "name": selected_city["name"]}
        self.used_locations.append(location_info)
        
        return lat, lon, selected_city["name"]

    def generate_measurements(self, is_anomaly=False):
        ranges = self.anomaly_ranges if is_anomaly else self.normal_ranges
        measurements = {}
        
        for param, ((min_val, max_val), step) in ranges.items():
            value = random.uniform(min_val, max_val)
            measurements[param] = self.round_to_step(value, step)
        
        return measurements

    def send_measurement(self, lat, lon, measurements):
        data = {
            "latitude": lat,
            "longitude": lon,
            **measurements
        }
        
        try:
            response = requests.post(self.base_url, json=data)
            return response.status_code == 201, response
        except requests.exceptions.RequestException as e:
            return False, str(e)

    def run(self):
        requests_sent = 0
        
        print(f"Test başlatılıyor - Toplam {self.request_limit} istek gönderilecek")
        print("=" * 70)
        
        while requests_sent < self.request_limit:
            lat, lon, city_name = self.generate_location()
            is_anomaly = random.random() < (self.anomaly_chance / 100)
            measurements = self.generate_measurements(is_anomaly)
            
            success, response = self.send_measurement(lat, lon, measurements)
            
            if success:
                status = "ANOMALİ" if is_anomaly else "NORMAL"
                print(f"[{datetime.now()}] İstek {requests_sent + 1}/{self.request_limit}")
                print(f"Şehir: {city_name}")
                print(f"Konum: ({lat}, {lon})")
                print(f"Tip: {status}")
                print(f"Değerler: {measurements}")
                print("-" * 70)
                requests_sent += 1
            else:
                print(f"HATA: Veri gönderilemedi - {response}")
            
            # Rate limiting
            time.sleep(1 / self.rate)
        
        print("\nTest tamamlandı!")
        print(f"Toplam {requests_sent} istek başarıyla gönderildi")
        
        # Tekrar kullanılan konumların istatistiği
        reused_locations = len([loc for loc in self.used_locations if self.used_locations.count(loc) > 1])
        print(f"Tekrar kullanılan konum sayısı: {reused_locations}")

def main():
    parser = argparse.ArgumentParser(description="Otomatik hava kalitesi test verisi üretici")
    parser.add_argument("--limit", type=int, default=25,
                      help="Toplam gönderilecek istek sayısı")
    parser.add_argument("--rate", type=float, default=1,
                      help="Saniyedeki istek sayısı")
    parser.add_argument("--anomaly-chance", type=float, default=10,
                      help="Anomali oluşturma yüzdesi (0-100)")
    
    args = parser.parse_args()
    tester = AutoTester(args.limit, args.rate, args.anomaly_chance)
    tester.run()

if __name__ == "__main__":
    main()