# Hava Kirliliği İzleme ve Analiz Sistemi (Monolitik Mimari)

## Proje Genel Bakış

Hava Kirliliği İzleme ve Analiz Sistemi, dünya genelindeki gerçek zamanlı hava kirliliği verilerini toplayan, işleyen, analiz eden ve kullanıcılara bildirim gönderen bir web tabanlı platformdur. Monolitik mimari yaklaşımıyla geliştirilmiş bu sistem, tüm işlevselliği tek bir uygulama içerisinde birleştirir.

### Proje Amaçları

- Sensörlerden ve kullanıcılardan gelen verilerin toplanması
- Veri akışının yönetilmesi
- Anomali tespiti yapılması
- Kullanıcılara web arayüzü üzerinden veri sağlama
- Gerçek zamanlı hava kalitesi bilgilendirmesi

## Özellikler

### Web Paneli Özellikleri
- Dinamik metrik seçimi
- Interaktif ısı haritası
- Otomatik veri güncelleme
- Detaylı anomali takibi
- Gerçek zamanlı hava kalitesi göstergeleri

### Bildirim Sistemi
- Şehir bazlı abonelik
- Anomali durumunda otomatik bilgilendirme

## Teknoloji Yığını

### Backend
- **Programlama Dili:** Python (Django)
- **Web Çatısı:** Django
- **ORM:** SQLAlchemy veya Django ORM
- **Veri İşleme:** Pandas, NumPy
- **Anomali Tespiti:** Scikit-learn

### Frontend
- **Framework:** React
- **Harita Entegrasyonu:** Mapbox
- **Durum Yönetimi:** Redux
- **Styling:** Tailwind CSS

### Veritabanı
- **Ana Veritabanı:** PostgreSQL
- **Zaman Serisi Veritabanı:** TimescaleDB (PostgreSQL eklentisi)

### Diğer Teknolojiler
- **Mesajlaşma:** Redis Queue
- **Arka Plan İşlemleri:** Celery
- **Önbellek:** Redis
- **Konteynerizasyon:** Docker
- **Sunucu:** Gunicorn + Nginx

## Mimari Yapı
![Sistem Mimarisi](./assets/mimari.png)
### Monolitik Mimarinin Avantajları
- Basitleştirilmiş geliştirme süreci
- Daha az dağıtım karmaşıklığı
- Düşük gecikme süresi
- Daha kolay hata ayıklama

### Sistem Bileşenleri
1. **Veri Toplama Katmanı**
   - Sensör ve kullanıcı veri girişi
   - Veri doğrulama
   - Ham veri kaydetme

2. **Veri İşleme Katmanı**
   - Veri temizleme
   - Bölgesel ortalama hesaplama
   - Coğrafi kodlama

3. **Anomali Tespit Katmanı**
   - Zaman serisi anomali tespiti
   - Eşik bazlı anomali kontrolü
   - Mekansal anomali analizi

4. **Bildirim Katmanı**
   - Abonelik yönetimi
   - E-posta bildirimleri
   - Kullanıcı bilgilendirme

## Kurulum Rehberi

### Ön Koşullar
- Python 3.9+
- PostgreSQL 12+
- Redis
- Docker (isteğe bağlı)

### Adım Adım Kurulum

#### 1. Depoyu Klonlama
```bash
git clone https://github.com/kullanici_adi/hava-kalitesi-izleme.git
cd hava-kalitesi-izleme
```

#### 2. Sanal Ortam Oluşturma
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# veya
venv\Scripts\activate  # Windows
```

#### 3. Bağımlılıkları Yükleme
```bash
pip install -r requirements.txt
```

#### 4. Veritabanı Kurulumu
```bash
# PostgreSQL ve TimescaleDB kurulumu
createdb hava_kalitesi_db
psql hava_kalitesi_db -c 'CREATE EXTENSION IF NOT EXISTS timescaledb;'

# Veritabanı geçişlerini uygulama
python manage.py migrate
```

#### 5. Çevre Değişkenlerini Ayarlama
`.env` dosyası oluşturun:
```
DATABASE_URL=postgresql://kullanici:sifre@localhost/hava_kalitesi_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=gizli_anahtar
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=eposta@gmail.com
EMAIL_HOST_PASSWORD=eposta_sifresi
```

#### 6. Arka Plan İşlemcilerini Başlatma
```bash
# Ayrı terminal pencerelerinde
celery -A proje worker -l info
redis-server
```

#### 7. Sunucuyu Başlatma
```bash
python manage.py runserver
```

## API Dokümantasyonu

### Veri Toplama Endpoint'leri
- `POST /api/pollution-data`: Yeni hava kirliliği verisi ekleme
- `GET /api/pollution-data`: Hava kirliliği verilerini listeleme

### Veri İşleme Endpoint'leri
- `GET /api/regional-averages`: Bölgesel ortalama değerler
- `GET /api/anomalies`: Tespit edilen anomaliler

### Bildirim Endpoint'leri
- `POST /api/notifications/subscribe`: Bildirim aboneliği
- `GET /api/notifications`: Kullanıcı bildirimlerini listeleme

## Test Senaryoları

### Birim Testleri
```bash
python -m pytest tests/
```

### Entegrasyon Testleri
```bash
python -m pytest tests/integration/
```

### Performans Testleri
```bash
locust -f performance_tests/locustfile.py
```

## Docker ile Dağıtım

### Docker Compose Kullanımı
```bash
docker-compose up --build
```

## Bakım ve İzleme

- Günlük log dosyaları: `logs/`
- Performans metrikleri: Prometheus + Grafana
- Hata takibi: Sentry entegrasyonu

## Lisans

[Lisans Bilgisi Eklenecek - MIT, Apache 2.0 vb.]

## Katkıda Bulunma

Katkıda bulunmak için lütfen `CONTRIBUTING.md` dosyasını inceleyin.

## İletişim

Proje sorumlusu: [İsim]
E-posta: [E-posta Adresi]
