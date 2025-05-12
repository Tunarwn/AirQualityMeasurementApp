#!/usr/bin/env python3
import sys
import requests
import argparse

def parse_parameter_value(param_value_str):
    """Parametre-değer çiftlerini ayrıştırır (örn: 'pm25 35.5' -> ('pm25', 35.5))"""
    try:
        param, value = param_value_str.split()
        return param, float(value)
    except ValueError:
        raise argparse.ArgumentTypeError(f"Geçersiz parametre-değer formatı: {param_value_str}. Doğru format: 'pm25 35.5'")

def send_measurement(latitude, longitude, parameter_values):
    url = "http://localhost:8000/api/measurements/"
    
    # Tüm parametreleri None olarak başlat
    data = {
        "latitude": float(latitude),
        "longitude": float(longitude),
        "pm25": None,
        "pm10": None,
        "no2": None,
        "so2": None,
        "o3": None
    }
    
    for param, value in parameter_values:
        if param not in data:
            print(f"Uyarı: Geçersiz parametre '{param}' yok sayılıyor.")
            continue
        data[param] = value
    
    response = requests.post(url, json=data)
    if response.status_code == 201:
        print(f"Başarıyla eklendi: {data}")
    else:
        print(f"Hata: {response.status_code} - {response.text}")

def main():
    parser = argparse.ArgumentParser(description="Manuel hava kalitesi ölçümü girişi")
    parser.add_argument("latitude", type=float, help="Enlem değeri")
    parser.add_argument("longitude", type=float, help="Boylam değeri")
    parser.add_argument("parameters", nargs='+', type=parse_parameter_value,
                      help="Parametre-değer çiftleri (örn: 'pm25 35.5' 'pm10 40' 'no2 15')")
    
    args = parser.parse_args()
    send_measurement(args.latitude, args.longitude, args.parameters)

if __name__ == "__main__":
    main()