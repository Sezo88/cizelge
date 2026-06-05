# -*- coding: utf-8 -*-
"""
Ders İçi Etkinlik & Proje Ölçek Uygulaması
Flask Backend Sunucusu
"""

from flask import Flask, render_template, request, jsonify, send_file
import json
import os
import glob
from datetime import datetime

app = Flask(__name__)
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)


@app.route('/')
def index():
    """Ana sayfa"""
    return render_template('index.html')


@app.route('/api/kaydet', methods=['POST'])
def kaydet():
    """Ölçek verisini JSON olarak kaydet"""
    try:
        veri = request.get_json()
        if not veri:
            return jsonify({'hata': 'Veri boş'}), 400

        # Dosya adı: okul_ders_sinif_donem_olcektipi_no.json
        dosya_adi = (
            f"{veri.get('sinif', 'sinif').replace(' ', '_').replace('/', '-')}_"
            f"{veri.get('ders', 'ders').replace(' ', '_')}_"
            f"{veri.get('olcekTipi', 'dersici')}_{veri.get('olcekNo', '1')}.json"
        )
        dosya_adi = "".join(c for c in dosya_adi if c.isalnum() or c in ('_', '-', '.'))

        dosya_yolu = os.path.join(DATA_DIR, dosya_adi)
        veri['kaydedilmeTarihi'] = datetime.now().isoformat()

        with open(dosya_yolu, 'w', encoding='utf-8') as f:
            json.dump(veri, f, ensure_ascii=False, indent=2)

        return jsonify({'mesaj': 'Başarıyla kaydedildi', 'dosya': dosya_adi})
    except Exception as e:
        return jsonify({'hata': str(e)}), 500


@app.route('/api/yukle', methods=['GET'])
def yukle():
    """Kaydedilmiş ölçekleri listele"""
    try:
        dosyalar = glob.glob(os.path.join(DATA_DIR, '*.json'))
        kayitlar = []
        for dosya in dosyalar:
            with open(dosya, 'r', encoding='utf-8') as f:
                veri = json.load(f)
                kayitlar.append({
                    'dosya': os.path.basename(dosya),
                    'sinif': veri.get('sinif', ''),
                    'ders': veri.get('ders', ''),
                    'olcekTipi': veri.get('olcekTipi', ''),
                    'olcekNo': veri.get('olcekNo', ''),
                    'tarih': veri.get('kaydedilmeTarihi', ''),
                })
        return jsonify(kayitlar)
    except Exception as e:
        return jsonify({'hata': str(e)}), 500


@app.route('/api/yukle/<dosya_adi>', methods=['GET'])
def yukle_dosya(dosya_adi):
    """Belirli bir ölçek dosyasını yükle"""
    try:
        dosya_yolu = os.path.join(DATA_DIR, dosya_adi)
        if not os.path.exists(dosya_yolu):
            return jsonify({'hata': 'Dosya bulunamadı'}), 404
        with open(dosya_yolu, 'r', encoding='utf-8') as f:
            veri = json.load(f)
        return jsonify(veri)
    except Exception as e:
        return jsonify({'hata': str(e)}), 500


@app.route('/api/sil/<dosya_adi>', methods=['DELETE'])
def sil(dosya_adi):
    """Belirli bir ölçek dosyasını sil"""
    try:
        dosya_yolu = os.path.join(DATA_DIR, dosya_adi)
        if os.path.exists(dosya_yolu):
            os.remove(dosya_yolu)
            return jsonify({'mesaj': 'Silindi'})
        return jsonify({'hata': 'Dosya bulunamadı'}), 404
    except Exception as e:
        return jsonify({'hata': str(e)}), 500


@app.route('/api/excel-import', methods=['POST'])
def excel_import():
    """Excel'den öğrenci listesi import et"""
    try:
        import openpyxl
        if 'dosya' not in request.files:
            return jsonify({'hata': 'Dosya yüklenmedi'}), 400

        dosya = request.files['dosya']
        wb = openpyxl.load_workbook(dosya, data_only=True)
        ws = wb.active

        ogrenciler = []
        for row in ws.iter_rows(min_row=2, values_only=True):
            if row[0] is not None and row[1] is not None:
                ogrenciler.append({
                    'no': str(row[0]),
                    'ad': str(row[1])
                })

        return jsonify({'ogrenciler': ogrenciler})
    except Exception as e:
        return jsonify({'hata': str(e)}), 500


@app.route('/parse-pdf', methods=['POST'])
def parse_pdf():
    """e-Okul PDF raporunu ayrıştır"""
    try:
        import pdfplumber
        import re

        if 'dosya' not in request.files:
            return jsonify({'hata': 'Dosya yüklenmedi'}), 400

        dosya = request.files['dosya']
        classes_data = []
        metadata = {}

        with pdfplumber.open(dosya) as pdf:
            if pdf.pages:
                page0 = pdf.pages[0]
                text0 = page0.extract_text()
                layout0 = page0.extract_text(layout=True)
                
                if text0:
                    lines = text0.split('\n')
                    if len(lines) >= 4:
                        okul_line = lines[2]
                        metadata['okulAdi'] = okul_line.split('/')[-1].replace('Müdürlüğü', '').strip()
                        
                        ders_match = re.search(r'(\d{4}-\d{4})\s+DERS\s+YILI\s+(.*?)\s+DERS', lines[3])
                        if ders_match:
                            metadata['egitimYili'] = ders_match.group(1).strip()
                            metadata['dersAdi'] = ders_match.group(2).strip()
                
                if layout0:
                    layout_lines = layout0.split('\n')
                    for i, l in enumerate(layout_lines):
                        if 'DERS ÖĞRETMENİ' in l and 'OKUL MÜDÜRÜ' in l:
                            if i > 0:
                                prev_line = layout_lines[i-1]
                                parts = re.split(r'\s{5,}', prev_line.strip())
                                if len(parts) >= 2:
                                    metadata['ogretmen'] = parts[0].strip()
                                    metadata['mudur'] = parts[1].strip()
                            break

            for page in pdf.pages:
                text = page.extract_text()
                if not text: continue
                
                # Sınıf adını bul: "5. Sınıf / A Şubesi" veya "8. Sınıf / B Şubesi" vs.
                match = re.search(r'(\d+\.\s*Sınıf\s*/\s*[A-Z]\s*Şubesi)', text, re.IGNORECASE)
                sinif_adi = re.sub(r'\s*/\s*', '/', match.group(1)) if match else "Bilinmeyen Sınıf"
                
                # Ders adını bul (Her sayfa/sınıf için değişebilir)
                ders_match = re.search(r'DERS\s+YILI\s+(.*?)\s+DERSİ', text)
                ders_adi_page = ders_match.group(1).strip() if ders_match else "Bilinmeyen Ders"
                
                tables = page.extract_tables()
                if not tables: continue
                
                table = tables[0]
                ogrenciler = []
                
                # İlk 2 satır genelde başlıktır, 3. satırdan (index 2) başlar
                for row in table[2:]:
                    # Satır boşsa veya öğrenci no (row[1]) yoksa atla
                    if not row or len(row) < 28 or not row[1] or not str(row[1]).isdigit():
                        continue
                        
                    ogrenci_no = str(row[1]).strip()
                    ad_soyad = str(row[2]).strip().replace('\n', ' ')
                    
                    # 1. Dönem Ders Etkinliklerine Katılım (Sütun 9-13)
                    donem1_notlar = [row[i] for i in range(9, 14) if row[i] and str(row[i]).strip().isdigit()]
                    # 2. Dönem Ders Etkinliklerine Katılım (Sütun 21-25)
                    donem2_notlar = [row[i] for i in range(21, 26) if row[i] and str(row[i]).strip().isdigit()]
                    
                    # Proje Notları
                    # 1. Dönem Proje (Sütun 7-8)
                    donem1_proje = [row[i] for i in range(7, 9) if row[i] and str(row[i]).strip().isdigit()]
                    # 2. Dönem Proje (Sütun 19-20)
                    donem2_proje = [row[i] for i in range(19, 21) if row[i] and str(row[i]).strip().isdigit()]
                    
                    ogrenciler.append({
                        'no': ogrenci_no,
                        'ad': ad_soyad,
                        'donem1': [int(n) for n in donem1_notlar],
                        'donem2': [int(n) for n in donem2_notlar],
                        'donem1_proje': [int(n) for n in donem1_proje],
                        'donem2_proje': [int(n) for n in donem2_proje]
                    })
                
                if ogrenciler:
                    classes_data.append({
                        'sinif': sinif_adi,
                        'ders': ders_adi_page,
                        'ogrenciler': ogrenciler
                    })

        return jsonify({
            'metadata': metadata,
            'classes': classes_data
        })
    except Exception as e:
        print(f"PDF Parse Hatası: {e}")
        return jsonify({'hata': str(e)}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("  Ders İçi Etkinlik & Proje Ölçek Uygulaması")
    print("  Tarayıcınızda açın: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)
