# e-Okul PDF'inden Toplu Sınıf ve Not Aktarımı
# Toplu Proje Ölçeği Çıkarma (Tüm Sınıflar)

Kullanıcının isteği doğrultusunda, e-Okul PDF dosyasından yalnızca **Proje Notu** girilmiş öğrencileri tespit edip, bu öğrencileri sınıflarından bağımsız olarak tek bir "Proje Değerlendirme Ölçeği" listesinde toplayacağız.

## User Review Required
- Sınıf bağımsız olarak tek sayfada çıkarılacak listeye, öğrencinin hangi sınıftan olduğu (Örn: "5/A") bilgisini de Adı Soyadı yanına veya yeni bir sütuna eklemek ister misiniz? Yoksa sadece öğrenci no ve adı yeterli mi?

## Proposed Changes

### Backend Geliştirmeleri
#### [MODIFY] [app.py](file:///c:/projeler/cizelge/app.py)
- PDF ayrıştırma mantığına `PROJE 1` ve `PROJE 2` sütunlarını okuma yeteneği eklenecek.
  - 1. Dönem Proje Sütunları: Index 7, 8
  - 2. Dönem Proje Sütunları: Index 19, 20
- Öğrenci JSON objesine `donem1_proje` ve `donem2_proje` listeleri eklenecek.

### Frontend Geliştirmeleri
#### [MODIFY] [app.js](file:///c:/projeler/cizelge/static/app.js)
- `uploadPdf` işleminden sonra, sadece proje notu olan öğrencileri tespit eden yeni bir fonksiyon (`extractProjectStudents`) yazılacak.
- Arayüze "Tüm Sınıfların Proje Ölçeklerini İndir" şeklinde yeni bir buton eklenecek.
- Bu butona basıldığında:
  - `state.olcekTipi` geçici olarak `'proje'` yapılacak.
  - Proje notu olan tüm öğrenciler tek bir listede birleştirilecek.
  - Her sayfa 25-30 öğrenci alacak şekilde (eğer proje alan öğrenci sayısı fazlaysa) sayfalanıp PDF olarak tek tıkla indirilecek.
- İşlem bitince `state.olcekTipi` tekrar eski haline döndürülecek.

#### [MODIFY] [index.html](file:///c:/projeler/cizelge/templates/index.html)
- PDF yükleme alanının altına "📁 Sadece Proje Alan Öğrencileri İndir" adında yeni bir buton eklenecek.

## Verification Plan
1. `document.pdf` üzerinde test edilecek.
2. Sadece Proje notu olan öğrencilerin çekilip çekilmediği loglanacak.
3. Çıktının Proje Değerlendirme Ölçeği formatında olup olmadığı teyit edilecek.

## Verification Plan

### Manual Verification
1. `document.pdf` sisteme yüklenecek.
2. 5/A sınıfı 1. Dönem seçilecek -> Tabloda Hüseyin Çelik (100, 100) vb. notların otomatik geldiği ve etkinlik sayısının doğru ayarlandığı görülecek.
3. 5/B sınıfı 2. Dönem seçilecek -> Verilerin anında değiştiği doğrulanacak.
4. "Önizle" ve "PDF İndir" butonlarının eskisi gibi kusursuz çalıştığı test edilecek.
