/**
 * Ders İçi Etkinlik & Proje Ölçek Uygulaması
 * Frontend Mantığı
 */

// ===== Ölçüt Tanımları =====
const OLCUTLER = {
  dersici: {
    kategoriler: [
      {
        ad: '1. DERSE HAZIRLIK',
        olcutler: [
          'Kaynak bilgisi sorgulama.',
          'Bilgi kaynaklarını kendisi bulur.',
          'Bilgiyi nereden edineceğini bildiğini söyler.',
          'Derse değişik yardımcı kaynaklarla gelir.',
          'Derse hazırlıklı gelir.'
        ]
      },
      {
        ad: '2. ETKİNLİKLERE KATILIM',
        olcutler: [
          'Kendiliğinden söz alarak görüşünü söyler.',
          'Kendisine görüş sorulduğunda konuşur.',
          'Belirttiği görüş ve verdiği örnekler özgündür.',
          'Yeni ve özgün sorular sorar.',
          'Dersi dinlediğini gösteren özgün sorular sorar.'
        ]
      },
      {
        ad: '3. ARAŞTIRMA-GÖZLEM',
        olcutler: [
          'Bilgi toplamak için çeşitli kaynaklara başvurur.',
          'Verilenden farklı kaynakları da araştırır.',
          'İnceleme ve araştırma ödevlerini özenir.',
          'Gözlemlerinde mantıklı çıkarımlarda bulunur.',
          'Araştırma-incelemelerde genellemeler yapar.'
        ]
      },
      {
        ad: '4. SUNUM',
        olcutler: [
          'Verilenlerden grafik ve çizelgeler oluşturur.',
          'Yönteme uygun deney yapar.'
        ]
      },
      {
        ad: '5. UYGULAMA',
        olcutler: [
          'Derslere zamanında girer.',
          'Dersin akışını bozmaz.',
          'Ödevlerini zamanında hazırlayarak sunar.'
        ]
      }
    ]
  },
  proje: {
    kategoriler: [
      {
        ad: '1. PROJE HAZIRLAMA',
        olcutler: [
          'Projenin amacını belirleme.',
          'Projenin amacına uygun çalışma planı yapma.',
          'Farklı kaynaklardan bilgi toplama.',
          'Hazırlamaya istekli oluş.',
          'Projeyi plana göre gerçekleştirme.'
        ]
      },
      {
        ad: '2. PROJE İÇERİĞİ',
        olcutler: [
          "Türkçe'yi doğru ve düzgün kullanma.",
          'Gösterilen özen, temizlik, tertip ve düzen.',
          'Bilgilerin doğruluğu.',
          'Toplanan bilgileri düzenleme.',
          'Toplanan bilgileri analiz etme.'
        ]
      }
    ]
  }
};

const PUANLAMA = [
  { puan: 1, ad: 'ZAYIF' },
  { puan: 2, ad: 'KABUL EDİLEBİLİR' },
  { puan: 3, ad: 'ORTA' },
  { puan: 4, ad: 'İYİ' }
];

// ===== Uygulama Durumu =====
const state = {
  // Sabit bilgiler
  egitimYili: '2024-2025',
  donem: '1. Dönem',
  okulAdi: '',
  idareci: '',
  idareciunvan: 'Okul Müdürü',
  dersAdi: '',
  ogretmen: '',
  ogretmenUnvan: 'Öğretmen',
  sinif: '',

  // Öğrenci listesi
  ogrenciler: [],

  // Ölçek durumu
  olcekTipi: 'dersici', // 'dersici' veya 'proje'
  olcekNo: 1,

  // Kaç adet etkinlik notu girildi (e-Okul sütunları)
  etkinlikSayisi: 2,

  // Her ölçek sayfası için ayrı puanlar
  // tumPuanlar[olcekNo] = { ogrenciIndex: { olcutIndex: puan } }
  tumPuanlar: { 1: {}, 2: {}, 3: {} },

  // Aktif puanlar referansı (tumPuanlar[olcekNo]'ya eşittir)
  puanlar: {},

  // Hızlı doldurma puanı
  quickFillScore: null,

  // Özelleştirilmiş ölçütler
  customOlcutler: null
};

// Başlangıçta puanlar referansını ayarla
state.puanlar = state.tumPuanlar[1];

// ===== DOM Referansları =====
function el(id) { return document.getElementById(id); }

// ===== Sekme Yönetimi =====
function switchTab(tabName) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`panel-${tabName}`).classList.add('active');

  if (tabName === 'olcek') renderOlcekTable();
  if (tabName === 'pdf') renderPdfPreview();
  if (tabName === 'kayitlar') loadRecords();
}

// ===== Toast Bildirimi =====
function showToast(msg, type = 'info') {
  const container = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== Ölçek No Değiştirme =====
function switchOlcekNo(no) {
  // Mevcut puanları kaydet (zaten referans)
  state.olcekNo = no;
  state.puanlar = state.tumPuanlar[no];
  if (el('olcekNo')) el('olcekNo').value = no;
}

// ===== Bilgi Formu Okuma/Yazma =====
function readFormData() {
  state.egitimYili = el('egitimYili').value;
  state.donem = el('donem').value;
  state.okulAdi = el('okulAdi').value;
  state.idareci = el('idareci').value;
  state.idareciunvan = el('idareciunvan').value;
  state.dersAdi = el('dersAdi').value;
  state.ogretmen = el('ogretmen').value;
  state.ogretmenUnvan = el('ogretmenUnvan').value;
  state.sinif = el('sinif').value;
  state.olcekTipi = el('olcekTipi').value;
  state.olcekNo = parseInt(el('olcekNo').value);
  state.etkinlikSayisi = parseInt(el('etkinlikSayisi')?.value || 2);

  // Puanlar referansını güncelle
  state.puanlar = state.tumPuanlar[state.olcekNo];

  // LocalStorage'a kaydet
  localStorage.setItem('cizelge_state', JSON.stringify({
    egitimYili: state.egitimYili,
    donem: state.donem,
    okulAdi: state.okulAdi,
    idareci: state.idareci,
    idareciunvan: state.idareciunvan,
    dersAdi: state.dersAdi,
    ogretmen: state.ogretmen,
    ogretmenUnvan: state.ogretmenUnvan,
    sinif: state.sinif,
    etkinlikSayisi: state.etkinlikSayisi
  }));
}

function writeFormData() {
  el('egitimYili').value = state.egitimYili;
  el('donem').value = state.donem;
  el('okulAdi').value = state.okulAdi;
  el('idareci').value = state.idareci;
  el('idareciunvan').value = state.idareciunvan;
  el('dersAdi').value = state.dersAdi;
  el('ogretmen').value = state.ogretmen;
  el('ogretmenUnvan').value = state.ogretmenUnvan;
  el('sinif').value = state.sinif;
  el('olcekTipi').value = state.olcekTipi;
  el('olcekNo').value = state.olcekNo;
  if (el('etkinlikSayisi')) el('etkinlikSayisi').value = state.etkinlikSayisi;
}

function loadSavedState() {
  const saved = localStorage.getItem('cizelge_state');
  if (saved) {
    const data = JSON.parse(saved);
    Object.assign(state, data);
    writeFormData();
  }
}

// ===== Öğrenci Yönetimi =====
function renderStudentList() {
  const list = el('studentList');
  const count = el('studentCount');

  count.textContent = state.ogrenciler.length;

  if (state.ogrenciler.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>Henüz öğrenci eklenmedi.<br>Yukarıdaki alana yapıştırın veya manuel ekleyin.</p>
      </div>`;
    return;
  }

  list.innerHTML = state.ogrenciler.map((ogr, i) => {
    // Etkinlik notlarını göster
    let notBadges = '';
    if (ogr.etkinlikNotlari && ogr.etkinlikNotlari.length > 0) {
      notBadges = ogr.etkinlikNotlari.map((n, idx) =>
        `<span style="color:var(--accent-warning); font-weight:700; font-size:0.7rem; background:rgba(253,203,110,0.12); padding:2px 6px; border-radius:4px;" title="${idx+1}. Ders Et.Kat.">${idx+1}.EK:${n != null ? n : '-'}</span>`
      ).join(' ');
    }
    return `
    <div class="student-item" data-index="${i}">
      <span class="no">${ogr.no}</span>
      <span class="name">${ogr.ad}</span>
      <div style="display:flex; gap:4px; align-items:center;">${notBadges}</div>
      <button class="remove-btn" onclick="removeStudent(${i})" title="Sil">✕</button>
    </div>`;
  }).join('');
}

function addStudentManual() {
  const no = el('manualNo').value.trim();
  const ad = el('manualAd').value.trim();

  if (!no || !ad) {
    showToast('Okul numarası ve ad soyad zorunlu!', 'error');
    return;
  }

  state.ogrenciler.push({ no, ad });
  el('manualNo').value = '';
  el('manualAd').value = '';
  renderStudentList();
  showToast('Öğrenci eklendi', 'success');
}

function removeStudent(index) {
  state.ogrenciler.splice(index, 1);
  // Tüm ölçeklerdeki puanları yeniden düzenle
  for (let olcekNo = 1; olcekNo <= 3; olcekNo++) {
    const oldPuanlar = state.tumPuanlar[olcekNo];
    const newPuanlar = {};
    Object.keys(oldPuanlar).forEach(key => {
      const k = parseInt(key);
      if (k < index) newPuanlar[k] = oldPuanlar[k];
      else if (k > index) newPuanlar[k - 1] = oldPuanlar[k];
    });
    state.tumPuanlar[olcekNo] = newPuanlar;
  }
  state.puanlar = state.tumPuanlar[state.olcekNo];
  renderStudentList();
}

function clearStudents() {
  if (state.ogrenciler.length === 0) return;
  if (!confirm('Tüm öğrenciler silinecek. Emin misiniz?')) return;
  state.ogrenciler = [];
  state.tumPuanlar = { 1: {}, 2: {}, 3: {} };
  state.puanlar = state.tumPuanlar[state.olcekNo];
  renderStudentList();
  showToast('Tüm öğrenciler silindi', 'info');
}

// ===== e-Okul Format Ayrıştırma =====
function parseEokulFormat(text, etkinlikSayisi) {
  // e-Okul formatını algıla: "Öğrenci Not Bilgisi" işaretçisi
  if (!text.includes('Öğrenci Not Bilgisi')) {
    return null; // e-Okul formatı değil
  }

  const students = [];
  const blocks = text.split('Öğrenci Not Bilgisi');

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Satır ve tab yapısını normalize et
    const normalized = trimmed.replace(/\r/g, '').replace(/\n/g, '\t');
    const parts = normalized.split(/\t+/).map(p => p.trim()).filter(Boolean);

    if (parts.length < 2) continue;

    // İlk eleman öğrenci numarası olmalı
    if (!/^\d+$/.test(parts[0])) continue;

    const no = parts[0];
    const ad = parts[1];

    // Kalan kısımlardan sayıları çıkar
    const notlar = [];
    for (let i = 2; i < parts.length; i++) {
      const cleaned = parts[i].replace(',', '.');
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        notlar.push(num);
      }
    }

    // Ders İçi Katılım notlarını sondaki sütunlardan çıkar
    // Sütun sırası: ..., 1.DersEtKat, 2.DersEtKat, [3.DersEtKat], ProjeOrt, Puanı
    // Yani sondan: [-1]=Puanı, [-2]=ProjeOrt, [-3]=sonEtkinlik, [-4]=öncekiEtkinlik, ...
    const etkinlikNotlari = [];
    if (notlar.length >= 2 + etkinlikSayisi) {
      for (let k = 0; k < etkinlikSayisi; k++) {
        // k=0 → 1. etkinlik (en soldaki), k=etkinlikSayisi-1 → son etkinlik
        const idx = notlar.length - 2 - etkinlikSayisi + k;
        etkinlikNotlari.push(notlar[idx]);
      }
    } else if (notlar.length > 0) {
      // Yeterli veri yoksa, mevcut notları kullan
      for (let k = 0; k < etkinlikSayisi; k++) {
        etkinlikNotlari.push(null);
      }
    }

    const puan = notlar.length > 0 ? notlar[notlar.length - 1] : null;

    students.push({ no, ad, notlar, puan, etkinlikNotlari });
  }

  return students.length > 0 ? students : null;
}

// ===== Puan Dağıtım Algoritması =====
function distributeScores(targetPuan, totalOlcut) {
  if (targetPuan === null || isNaN(targetPuan) || targetPuan <= 0) {
    return new Array(totalOlcut).fill(1);
  }

  const maxScore = state.olcekTipi === 'proje' ? 10 : 4;
  const maxTotal = totalOlcut * maxScore;
  const minTotal = totalOlcut * 1;

  let targetTotal = Math.round((targetPuan / 100) * maxTotal);
  targetTotal = Math.max(minTotal, Math.min(maxTotal, targetTotal));

  const baseScore = Math.floor(targetTotal / totalOlcut);
  const remainder = targetTotal - (baseScore * totalOlcut);
  const base = Math.max(1, Math.min(maxScore, baseScore));

  const scores = [];
  for (let i = 0; i < totalOlcut; i++) {
    if (i < remainder && base < maxScore) {
      scores.push(base + 1);
    } else {
      scores.push(base);
    }
  }

  // Doğal görünsün diye karıştır
  for (let i = scores.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [scores[i], scores[j]] = [scores[j], scores[i]];
  }

  return scores;
}

// Tüm etkinlik notlarını ilgili ölçek sayfalarına dağıt
function autoDistributeAll() {
  const totalOlcut = getTotalOlcutCount();
  const etkinlikSayisi = state.etkinlikSayisi;
  let distributed = 0;

  for (let olcekNo = 1; olcekNo <= etkinlikSayisi; olcekNo++) {
    state.tumPuanlar[olcekNo] = state.tumPuanlar[olcekNo] || {};

    state.ogrenciler.forEach((ogr, ogrIdx) => {
      const etNot = ogr.etkinlikNotlari?.[olcekNo - 1];
      if (etNot != null && etNot > 0) {
        const scores = distributeScores(etNot, totalOlcut);
        state.tumPuanlar[olcekNo][ogrIdx] = {};
        scores.forEach((score, i) => {
          state.tumPuanlar[olcekNo][ogrIdx][i] = score;
        });
        distributed++;
      }
    });
  }

  // Aktif ölçek referansını güncelle
  state.puanlar = state.tumPuanlar[state.olcekNo];

  if (distributed > 0) {
    renderOlcekTable();
    showToast(`${etkinlikSayisi} ölçek sayfasına toplam ${distributed} not dağıtıldı 🎉`, 'success');
  } else {
    showToast('Dağıtılacak etkinlik notu bulunamadı. Önce e-Okul verisini yapıştırın.', 'error');
  }
}

function parseStudentPaste() {
  const text = el('pasteArea').value.trim();
  if (!text) {
    showToast('Yapıştırma alanı boş!', 'error');
    return;
  }

  const autoDistribute = el('autoDistributeCheck')?.checked || false;
  const etkinlikSayisi = parseInt(el('etkinlikSayisi')?.value || 2);
  state.etkinlikSayisi = etkinlikSayisi;

  // Önce e-Okul formatını dene
  const eokulData = parseEokulFormat(text, etkinlikSayisi);

  if (eokulData && eokulData.length > 0) {
    let parsed = 0;
    const totalOlcut = getTotalOlcutCount();

    for (const ogr of eokulData) {
      if (!state.ogrenciler.some(o => o.no === ogr.no)) {
        state.ogrenciler.push({
          no: ogr.no,
          ad: ogr.ad,
          puan: ogr.puan,
          etkinlikNotlari: ogr.etkinlikNotlari
        });
        const ogrIdx = state.ogrenciler.length - 1;

        // Her etkinlik için ayrı ölçek dağıtımı
        if (autoDistribute) {
          for (let olcekNo = 1; olcekNo <= etkinlikSayisi; olcekNo++) {
            const etNot = ogr.etkinlikNotlari?.[olcekNo - 1];
            if (etNot != null && etNot > 0) {
              state.tumPuanlar[olcekNo] = state.tumPuanlar[olcekNo] || {};
              const scores = distributeScores(etNot, totalOlcut);
              state.tumPuanlar[olcekNo][ogrIdx] = {};
              scores.forEach((score, i) => {
                state.tumPuanlar[olcekNo][ogrIdx][i] = score;
              });
            }
          }
        }

        parsed++;
      }
    }

    // Puanlar referansını güncelle
    state.puanlar = state.tumPuanlar[state.olcekNo];

    if (parsed > 0) {
      const msg = autoDistribute
        ? `${parsed} öğrenci eklendi, ${etkinlikSayisi} etkinlik notu ${etkinlikSayisi} ölçek sayfasına dağıtıldı! 🎉`
        : `${parsed} öğrenci eklendi (e-Okul formatı)`;
      showToast(msg, 'success');
      el('pasteArea').value = '';
      renderStudentList();
      if (autoDistribute) {
        switchTab('olcek');
      }
    } else {
      showToast('Tüm öğrenciler zaten listede', 'info');
    }
    return;
  }

  // Fallback: basit tab-separated format
  const lines = text.split('\n').filter(l => l.trim());
  let parsed = 0;

  for (const line of lines) {
    const parts = line.split(/\t+|\s{2,}/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const firstIsNum = /^\d+$/.test(parts[0]);
      if (firstIsNum) {
        const no = parts[0];
        const ad = parts[1];
        if (!state.ogrenciler.some(o => o.no === no)) {
          state.ogrenciler.push({ no, ad });
          parsed++;
        }
      }
    }
  }

  if (parsed > 0) {
    showToast(`${parsed} öğrenci eklendi`, 'success');
    el('pasteArea').value = '';
    renderStudentList();
  } else {
    showToast('Öğrenci verisi bulunamadı', 'error');
  }
}

// ===== Ölçek Tablosu Oluşturma =====
function getCurrentOlcutler() {
  if (state.customOlcutler) return state.customOlcutler;
  return OLCUTLER[state.olcekTipi];
}

function getTotalOlcutCount() {
  const olcutler = getCurrentOlcutler();
  return olcutler.kategoriler.reduce((sum, kat) => sum + kat.olcutler.length, 0);
}

function renderOlcekTable() {
  readFormData();

  if (state.ogrenciler.length === 0) {
    el('olcekContainer').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>Ölçek tablosu oluşturmak için önce öğrenci ekleyin.</p>
      </div>`;
    return;
  }

  const olcutler = getCurrentOlcutler();
  const totalOlcutler = getTotalOlcutCount();
  const olcekBaslik = state.olcekTipi === 'dersici'
    ? `${state.olcekNo}. DERS İÇİ KATILIM ÖLÇEĞİ`
    : `${state.olcekNo}. PROJE DEĞERLENDİRME ÖLÇEĞİ`;

  // Ölçek sayfa seçici
  let pageSelector = `<div class="olcek-page-selector">`;
  for (let i = 1; i <= state.etkinlikSayisi; i++) {
    const active = state.olcekNo === i ? 'active' : '';
    const pCount = Object.keys(state.tumPuanlar[i] || {}).length;
    pageSelector += `<button class="olcek-page-btn ${active}" onclick="switchToOlcek(${i})">
      ${i}. Ölçek <span style="font-size:0.65rem; opacity:0.7">(${pCount} öğr.)</span>
    </button>`;
  }
  pageSelector += `</div>`;

  const maxScore = state.olcekTipi === 'proje' ? 10 : 4;
  const quickFillArray = Array.from({length: maxScore}, (_, i) => i + 1);
  const legendHtml = state.olcekTipi === 'proje' 
    ? `<div class="score-legend">
         <div class="score-legend-item" style="font-weight: 500; color: var(--accent-primary);">📌 Proje değerlendirmesi her hücre için 10 puan üzerinden yapılır. Toplam 10 kriter vardır.</div>
       </div>`
    : `<div class="score-legend">
         <div class="score-legend-item"><span class="score-legend-dot s1"></span> 1 - Zayıf</div>
         <div class="score-legend-item"><span class="score-legend-dot s2"></span> 2 - Kabul Edilebilir</div>
         <div class="score-legend-item"><span class="score-legend-dot s3"></span> 3 - Orta</div>
         <div class="score-legend-item"><span class="score-legend-dot s4"></span> 4 - İyi</div>
       </div>`;

  let html = `
    ${pageSelector}

    <div class="quick-fill-bar">
      <label>🖊️ Hızlı Puan:</label>
      ${quickFillArray.map(p => `
        <button class="quick-fill-btn ${state.quickFillScore === p ? 'active' : ''}"
                onclick="setQuickFill(${p})">${p}</button>
      `).join('')}
      <button class="quick-fill-btn" onclick="setQuickFill(null)" style="font-size:0.7rem;">✕</button>
      <span style="margin-left:auto; font-size:0.75rem; color:var(--text-muted)">
        Puan seçip hücrelere tıklayarak hızlı doldurma yapın
      </span>
    </div>

    ${legendHtml}

    <div class="scale-table-wrapper">
      <table class="scale-table" id="scaleTable">
        <thead>
          <tr>
            <th rowspan="2" style="min-width:30px">S.N.</th>
            <th rowspan="2" style="min-width:35px">No</th>
            <th rowspan="2" style="min-width:140px">Adı Soyadı</th>
  `;

  // Kategori başlıkları
  olcutler.kategoriler.forEach(kat => {
    html += `<th class="category-header" colspan="${kat.olcutler.length}">${kat.ad}</th>`;
  });
  html += `<th rowspan="2" style="min-width:50px">PUAN</th></tr><tr>`;

  // Ölçüt başlıkları (Yazılar geri eklendi, rotate(-90deg) ile 3 satıra kadar sığdırıldı)
  let olcutIndex = 0;
  olcutler.kategoriler.forEach(kat => {
    kat.olcutler.forEach(olcut => {
      const shortText = olcut.length > 55 ? olcut.substring(0, 52) + '…' : olcut;
      html += `<th title="${olcut}" style="height:140px; width:32px; position:relative; vertical-align:middle; padding:0;">
                 <div style="position:absolute; top:50%; left:50%; width:130px; height:30px; transform:translate(-50%, -50%) rotate(-90deg); display:flex; align-items:center; justify-content:flex-start;">
                   <div style="width:100%; text-align:left; font-size:0.6rem; font-weight:500; line-height:1.2; color:var(--text-secondary); max-height:30px; overflow:hidden;">
                     ${shortText}
                   </div>
                 </div>
               </th>`;
      olcutIndex++;
    });
  });

  html += `</tr></thead><tbody>`;

  // Öğrenci satırları
  state.ogrenciler.forEach((ogr, ogrIdx) => {
    if (!state.puanlar[ogrIdx]) state.puanlar[ogrIdx] = {};

    // Bu öğrencinin bu ölçek için kaynak etkinlik notunu göster
    const etNot = ogr.etkinlikNotlari?.[state.olcekNo - 1];
    const etNotLabel = etNot != null ? `(e-Okul: ${etNot})` : '';

    html += `
      <tr>
        <td style="font-weight:600; color:var(--text-muted)">${ogrIdx + 1}</td>
        <td class="student-no-cell">${ogr.no}</td>
        <td class="student-name-cell" title="${ogr.ad} ${etNotLabel}">${ogr.ad}</td>
    `;

    let totalPuan = 0;
    let totalFilled = 0;
    let globalOlcutIdx = 0;

    olcutler.kategoriler.forEach(kat => {
      kat.olcutler.forEach(() => {
        const score = state.puanlar[ogrIdx]?.[globalOlcutIdx] || '';
        if (score) {
          totalPuan += score;
          totalFilled++;
        }
        html += `<td class="score-cell" data-ogr="${ogrIdx}" data-olcut="${globalOlcutIdx}" 
                     data-score="${score}" onclick="handleScoreClick(this)">${score}</td>`;
        globalOlcutIdx++;
      });
    });

    const maxScore = state.olcekTipi === 'proje' ? 10 : 4;
    const maxPuan = totalOlcutler * maxScore;
    const yuzde = totalFilled > 0 ? Math.round((totalPuan / maxPuan) * 100) : 0;

    html += `<td class="score-total">${yuzde}</td></tr>`;
  });

  html += `</tbody></table></div>`;

  // İstatistikler
  const filledCount = Object.values(state.puanlar).reduce((sum, ogr) => {
    return sum + Object.keys(ogr).length;
  }, 0);
  const totalCells = state.ogrenciler.length * totalOlcutler;
  const fillPercent = totalCells > 0 ? Math.round((filledCount / totalCells) * 100) : 0;

  html = `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${state.ogrenciler.length}</div>
        <div class="stat-label">Öğrenci</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalOlcutler}</div>
        <div class="stat-label">Ölçüt</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fillPercent}%</div>
        <div class="stat-label">Doldurulma</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${state.olcekNo}. Ölçek</div>
        <div class="stat-label">Aktif Sayfa</div>
      </div>
    </div>
  ` + html;

  el('olcekContainer').innerHTML = html;
}

function switchToOlcek(no) {
  switchOlcekNo(no);
  renderOlcekTable();
}

function handleScoreClick(cell) {
  const ogrIdx = parseInt(cell.dataset.ogr);
  const olcutIdx = parseInt(cell.dataset.olcut);

  if (state.quickFillScore !== null) {
    state.puanlar[ogrIdx] = state.puanlar[ogrIdx] || {};
    state.puanlar[ogrIdx][olcutIdx] = state.quickFillScore;
    cell.textContent = state.quickFillScore;
    cell.dataset.score = state.quickFillScore;
    updateRowTotal(ogrIdx);
  } else {
    const maxScore = state.olcekTipi === 'proje' ? 10 : 4;
    const current = parseInt(cell.dataset.score) || 0;
    const next = current >= maxScore ? 0 : current + 1;

    state.puanlar[ogrIdx] = state.puanlar[ogrIdx] || {};
    if (next === 0) {
      delete state.puanlar[ogrIdx][olcutIdx];
      cell.textContent = '';
      cell.dataset.score = '';
    } else {
      state.puanlar[ogrIdx][olcutIdx] = next;
      cell.textContent = next;
      cell.dataset.score = next;
    }
    updateRowTotal(ogrIdx);
  }
}

function updateRowTotal(ogrIdx) {
  const totalOlcutler = getTotalOlcutCount();
  const puanlar = state.puanlar[ogrIdx] || {};

  let totalPuan = 0;
  let totalFilled = 0;
  Object.values(puanlar).forEach(p => {
    totalPuan += p;
    totalFilled++;
  });

  const maxScore = state.olcekTipi === 'proje' ? 10 : 4;
  const maxPuan = totalOlcutler * maxScore;
  const yuzde = totalFilled > 0 ? Math.round((totalPuan / maxPuan) * 100) : 0;

  const rows = document.querySelectorAll('#scaleTable tbody tr');
  if (rows[ogrIdx]) {
    const lastCell = rows[ogrIdx].querySelector('.score-total');
    if (lastCell) lastCell.textContent = yuzde;
  }

  const filledCount = Object.values(state.puanlar).reduce((sum, ogr) => {
    return sum + Object.keys(ogr).length;
  }, 0);
  const totalCells = state.ogrenciler.length * totalOlcutler;
  const fillPercent = totalCells > 0 ? Math.round((filledCount / totalCells) * 100) : 0;

  const statValues = document.querySelectorAll('.stat-value');
  if (statValues.length >= 3) {
    statValues[2].textContent = fillPercent + '%';
  }
}

function setQuickFill(score) {
  state.quickFillScore = score;
  const indicator = document.querySelector('.selected-fill-score');
  if (score !== null) {
    indicator.textContent = score;
    indicator.classList.add('active');
  } else {
    indicator.classList.remove('active');
  }
  document.querySelectorAll('.quick-fill-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.textContent) === score);
  });
}

function fillAllWithScore(score) {
  if (!confirm(`Bu ölçek sayfasındaki (${state.olcekNo}.) tüm boş hücrelere ${score} puanı verilecek. Emin misiniz?`)) return;
  const totalOlcutler = getTotalOlcutCount();

  state.ogrenciler.forEach((_, ogrIdx) => {
    state.puanlar[ogrIdx] = state.puanlar[ogrIdx] || {};
    for (let i = 0; i < totalOlcutler; i++) {
      if (!state.puanlar[ogrIdx][i]) {
        state.puanlar[ogrIdx][i] = score;
      }
    }
  });

  renderOlcekTable();
  showToast(`${state.olcekNo}. ölçek - boş hücreler ${score} ile dolduruldu`, 'success');
}

function clearAllScores() {
  if (!confirm(`${state.olcekNo}. ölçek sayfasının tüm puanları silinecek. Emin misiniz?`)) return;
  state.tumPuanlar[state.olcekNo] = {};
  state.puanlar = state.tumPuanlar[state.olcekNo];
  renderOlcekTable();
  showToast(`${state.olcekNo}. ölçek puanları silindi`, 'info');
}

// ===== PDF Oluşturma =====

// Tek bir ölçek sayfası için HTML oluştur
function buildPdfPageHtml(olcekNo, puanlarData) {
  const olcutler = getCurrentOlcutler();
  const totalOlcutler = getTotalOlcutCount();
  const olcekBaslik = state.olcekTipi === 'dersici'
    ? `${olcekNo}. DERS İÇİ KATILIM ÖLÇEĞİ`
    : `${olcekNo}. PROJE DEĞERLENDİRME ÖLÇEĞİ`;

  let html = `
    <div class="pdf-page" id="pdfPage${olcekNo}">
      <div class="pdf-header">
        <h2>${state.egitimYili} EĞİTİM ÖĞRETİM YILI ${state.okulAdi.toUpperCase()}</h2>
        <h3>${state.dersAdi.toUpperCase()} DERSİ ${state.donem.toUpperCase()} ${olcekBaslik}</h3>
        <div style="display:flex; justify-content:space-between; font-size:9pt; margin-top:5mm;">
          <span><strong>SINIF:</strong> ${state.sinif}</span>
          <span><strong>Öğrencide Gözlenecek Kazanımlar</strong></span>
          <span><strong>${olcekNo}.${state.olcekTipi === 'dersici' ? 'DERS İÇİ KATILIM' : 'PROJE DEĞERLENDİRME'} PUANI</strong></span>
        </div>
      </div>

      <table class="pdf-table">
        <thead>
          <tr>
            <th rowspan="2" style="width:25px">S.N.</th>
            <th rowspan="2" style="width:35px">SINIFI</th>
            <th rowspan="2" style="width:130px">ADI SOYADI</th>
  `;

  olcutler.kategoriler.forEach(kat => {
    html += `<th class="cat-header" colspan="${kat.olcutler.length}">${kat.ad}</th>`;
  });
  html += `<th rowspan="2" style="width:40px">${olcekNo}.PUAN</th></tr><tr>`;

  olcutler.kategoriler.forEach(kat => {
    kat.olcutler.forEach(olcut => {
      const shortText = olcut.length > 55 ? olcut.substring(0, 52) + '…' : olcut;
      html += `<th title="${olcut}" style="height:130px; width:28px; position:relative; vertical-align:middle; padding:0; border:1px solid #333;">
                 <div style="position:absolute; top:50%; left:50%; width:120px; height:26px; transform:translate(-50%, -50%) rotate(-90deg); display:flex; align-items:center; justify-content:flex-start;">
                   <div style="width:100%; text-align:left; font-size:6.5pt; font-weight:normal; line-height:1.1; color:#000; max-height:26px; overflow:hidden;">
                     ${shortText}
                   </div>
                 </div>
               </th>`;
    });
  });

  html += `</tr></thead><tbody>`;

  // Öğrenci satırları
  state.ogrenciler.forEach((ogr, ogrIdx) => {
    html += `<tr>
      <td>${ogrIdx + 1}</td>
      <td>${ogr.no}</td>
      <td class="student-name">${ogr.ad}</td>`;

    let totalPuan = 0;
    let totalFilled = 0;
    let globalOlcutIdx = 0;

    olcutler.kategoriler.forEach(kat => {
      kat.olcutler.forEach(() => {
        const score = puanlarData[ogrIdx]?.[globalOlcutIdx] || '';
        if (score) {
          totalPuan += score;
          totalFilled++;
        }
        html += `<td>${score}</td>`;
        globalOlcutIdx++;
      });
    });

    const maxScore = state.olcekTipi === 'proje' ? 10 : 4;
    const maxPuan = totalOlcutler * maxScore;
    const yuzde = totalFilled > 0 ? Math.round((totalPuan / maxPuan) * 100) : 0;
    html += `<td style="font-weight:700">${yuzde}</td></tr>`;
  });

  html += `</tbody></table>

    <div class="pdf-footer">
      <div class="sign-block">
        <div class="sign-name">${state.ogretmen}</div>
        <div class="sign-title">${state.ogretmenUnvan}</div>
      </div>
      <div class="sign-block">
        <div class="sign-name">${state.idareci}</div>
        <div class="sign-title">${state.idareciunvan}</div>
      </div>
    </div>
  </div>`;

  return html;
}

function renderPdfPreview() {
  readFormData();

  if (state.ogrenciler.length === 0) {
    el('pdfContainer').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <p>PDF oluşturmak için önce öğrenci ekleyin ve puanları girin.</p>
      </div>`;
    return;
  }

  // Tüm ölçek sayfalarını önizle
  let fullHtml = '';
  for (let i = 1; i <= state.etkinlikSayisi; i++) {
    const puanlarData = state.tumPuanlar[i] || {};
    fullHtml += `<div class="pdf-preview" style="margin-bottom:2rem;">`;
    fullHtml += `<div class="pdf-page-indicator">📄 Sayfa ${i}/${state.etkinlikSayisi} — ${i}. ${state.olcekTipi === 'dersici' ? 'Ders İçi Katılım' : 'Proje Değerlendirme'} Ölçeği</div>`;
    fullHtml += buildPdfPageHtml(i, puanlarData);
    fullHtml += `</div>`;
  }

  el('pdfContainer').innerHTML = fullHtml;
}

async function downloadPdf() {
  readFormData();

  if (state.ogrenciler.length === 0) {
    showToast('Önce öğrenci ekleyin', 'error');
    return;
  }

  // jsPDF yüklü mü kontrol et
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('PDF kütüphanesi (jsPDF) yüklenemedi! İnternet bağlantınızı kontrol edin ve sayfayı yenileyin.', 'error');
    // Yedek olarak yazdır
    if (confirm('PDF indirilemedi. Bunun yerine tarayıcıdan yazdırmak ister misiniz?')) {
      printPdf();
    }
    return;
  }

  if (typeof html2canvas === 'undefined') {
    showToast('html2canvas kütüphanesi yüklenemedi! İnternet bağlantınızı kontrol edin ve sayfayı yenileyin.', 'error');
    return;
  }

  showToast('PDF oluşturuluyor...', 'info');

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Her ölçek sayfası için ayrı PDF sayfası
    for (let i = 1; i <= state.etkinlikSayisi; i++) {
      if (i > 1) pdf.addPage();

      // Geçici div oluştur
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '1400px';
      tempDiv.className = 'pdf-preview';
      tempDiv.innerHTML = buildPdfPageHtml(i, state.tumPuanlar[i] || {});
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight - 20) {
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      } else {
        const scale = (pageHeight - 20) / imgHeight;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * scale, imgHeight * scale);
      }
    }

    const olcekBaslik = state.olcekTipi === 'dersici' ? 'DersIci' : 'Proje';
    const fileName = `${state.sinif.replace(/[\/\s]/g, '_')}_${state.dersAdi.replace(/\s/g, '_')}_${olcekBaslik}_${state.etkinlikSayisi}Olcek.pdf`;
    pdf.save(fileName);

    showToast(`PDF indirildi (${state.etkinlikSayisi} sayfa): ${fileName}`, 'success');
  } catch (err) {
    console.error('PDF oluşturma hatası:', err);
    showToast('PDF oluşturulurken hata: ' + err.message, 'error');
  }
}

function printPdf() {
  // Önce PDF sekmesine geç
  switchTab('pdf');
  renderPdfPreview();
  setTimeout(() => window.print(), 800);
}

// ===== Kaydetme/Yükleme =====
async function saveToServer() {
  readFormData();

  const data = {
    egitimYili: state.egitimYili,
    donem: state.donem,
    okulAdi: state.okulAdi,
    idareci: state.idareci,
    idareciunvan: state.idareciunvan,
    dersAdi: state.dersAdi,
    ogretmen: state.ogretmen,
    ogretmenUnvan: state.ogretmenUnvan,
    sinif: state.sinif,
    olcekTipi: state.olcekTipi,
    olcekNo: state.olcekNo,
    etkinlikSayisi: state.etkinlikSayisi,
    ogrenciler: state.ogrenciler,
    tumPuanlar: state.tumPuanlar
  };

  try {
    const res = await fetch('/api/kaydet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok) {
      showToast('Kaydedildi: ' + result.dosya, 'success');
    } else {
      showToast('Hata: ' + result.hata, 'error');
    }
  } catch (err) {
    showToast('Sunucu bağlantı hatası: ' + err.message, 'error');
  }
}

async function loadRecords() {
  try {
    const res = await fetch('/api/yukle');
    const records = await res.json();
    const container = el('recordList');

    if (!records.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1">
          <div class="empty-icon">💾</div>
          <p>Henüz kaydedilmiş ölçek yok.</p>
        </div>`;
      return;
    }

    container.innerHTML = records.map(r => {
      const tip = r.olcekTipi === 'dersici' ? 'Ders İçi Katılım' : 'Proje';
      const tarih = r.tarih ? new Date(r.tarih).toLocaleString('tr-TR') : '';
      return `
        <div class="record-card">
          <div class="record-title">${r.sinif} - ${r.ders}</div>
          <div class="record-meta">${tip} ${r.olcekNo} • ${tarih}</div>
          <div class="record-actions">
            <button class="btn btn-secondary" onclick="loadRecord('${r.dosya}')">📂 Yükle</button>
            <button class="btn btn-danger" onclick="deleteRecord('${r.dosya}')">🗑️ Sil</button>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    showToast('Kayıtlar yüklenemedi: ' + err.message, 'error');
  }
}

async function loadRecord(filename) {
  try {
    const res = await fetch(`/api/yukle/${filename}`);
    const data = await res.json();

    if (res.ok) {
      // tumPuanlar varsa kullan, yoksa eski format (puanlar)
      if (data.tumPuanlar) {
        state.tumPuanlar = data.tumPuanlar;
      } else if (data.puanlar) {
        state.tumPuanlar = { 1: data.puanlar, 2: {}, 3: {} };
      }
      delete data.tumPuanlar;
      delete data.puanlar;
      Object.assign(state, data);
      state.puanlar = state.tumPuanlar[state.olcekNo];
      writeFormData();
      renderStudentList();
      showToast('Ölçek yüklendi', 'success');
      switchTab('olcek');
    } else {
      showToast('Hata: ' + data.hata, 'error');
    }
  } catch (err) {
    showToast('Yükleme hatası: ' + err.message, 'error');
  }
}

async function deleteRecord(filename) {
  if (!confirm('Bu kayıt silinecek. Emin misiniz?')) return;
  try {
    const res = await fetch(`/api/sil/${filename}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Kayıt silindi', 'success');
      loadRecords();
    }
  } catch (err) {
    showToast('Silme hatası: ' + err.message, 'error');
  }
}

// ===== Excel Import =====
async function importExcel(input) {
  if (!input.files.length) return;

  const formData = new FormData();
  formData.append('dosya', input.files[0]);

  try {
    const res = await fetch('/api/excel-import', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (res.ok && data.ogrenciler) {
      let added = 0;
      data.ogrenciler.forEach(ogr => {
        if (!state.ogrenciler.some(o => o.no === ogr.no)) {
          state.ogrenciler.push(ogr);
          added++;
        }
      });
      renderStudentList();
      showToast(`${added} öğrenci Excel'den eklendi`, 'success');
    } else {
      showToast('Hata: ' + (data.hata || 'Bilinmeyen hata'), 'error');
    }
  } catch (err) {
    showToast('Import hatası: ' + err.message, 'error');
  }

  input.value = '';
}

// ===== Ölçüt Düzenleme =====
function openOlcutEditor() {
  const olcutler = getCurrentOlcutler();
  let html = `<h3>📝 Ölçüt Düzenleme - ${state.olcekTipi === 'dersici' ? 'Ders İçi Katılım' : 'Proje'}</h3>`;

  html += '<div class="olcut-edit-list">';
  let globalIdx = 0;
  olcutler.kategoriler.forEach((kat, katIdx) => {
    html += `<div style="margin: 0.5rem 0; font-weight:700; color:var(--accent-primary)">${kat.ad}</div>`;
    kat.olcutler.forEach((olcut, olcutIdx) => {
      html += `
        <div class="olcut-edit-item">
          <span class="olcut-num">${globalIdx + 1}</span>
          <input type="text" value="${olcut}" data-kat="${katIdx}" data-olcut="${olcutIdx}" />
        </div>`;
      globalIdx++;
    });
  });
  html += '</div>';

  html += `<div class="btn-group">
    <button class="btn btn-primary" onclick="saveOlcutEdits()">💾 Kaydet</button>
    <button class="btn btn-secondary" onclick="closeModal()">İptal</button>
    <button class="btn btn-danger" onclick="resetOlcutler()">🔄 Varsayılana Dön</button>
  </div>`;

  const modal = document.querySelector('.modal-content');
  modal.innerHTML = html;
  document.querySelector('.modal-overlay').classList.add('active');
}

function saveOlcutEdits() {
  const inputs = document.querySelectorAll('.olcut-edit-item input');
  const olcutler = JSON.parse(JSON.stringify(getCurrentOlcutler()));

  inputs.forEach(input => {
    const katIdx = parseInt(input.dataset.kat);
    const olcutIdx = parseInt(input.dataset.olcut);
    olcutler.kategoriler[katIdx].olcutler[olcutIdx] = input.value;
  });

  state.customOlcutler = olcutler;
  closeModal();
  renderOlcekTable();
  showToast('Ölçütler güncellendi', 'success');
}

function resetOlcutler() {
  state.customOlcutler = null;
  closeModal();
  renderOlcekTable();
  showToast('Ölçütler varsayılana döndürüldü', 'info');
}

function closeModal() {
  document.querySelector('.modal-overlay').classList.remove('active');
}

// ===== PDF Yükleme ve Çoklu Sınıf İşlemleri =====
function toggleVeriKaynagi() {
  const isPdf = document.querySelector('input[name="veri_kaynagi"][value="pdf"]').checked;
  document.getElementById('veri-manuel').style.display = isPdf ? 'none' : 'block';
  document.getElementById('veri-pdf').style.display = isPdf ? 'block' : 'none';
}

async function uploadPdf() {
  const fileInput = document.getElementById('pdfFileInput');
  if (!fileInput.files.length) {
    showToast('Lütfen bir PDF dosyası seçin.', 'error');
    return;
  }
  
  if (window.location.protocol === 'file:') {
    showToast('HATA: Bu özellik için http://localhost:5000 adresinden girmeniz gerekir!', 'error');
    return;
  }
  
  const btn = document.getElementById('btnUploadPdf');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Yükleniyor ve Taranıyor...';
  btn.disabled = true;

  const formData = new FormData();
  formData.append('dosya', fileInput.files[0]);

  try {
    const response = await fetch('/parse-pdf', {
      method: 'POST',
      body: formData
    });
    
    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Sunucu JSON döndürmedi. Sunucu hatası olabilir.");
    }
    
    const result = await response.json();
    if (response.ok && result.classes && result.classes.length > 0) {
      state.pdfData = result;
      showToast(`${result.classes.length} sınıf başarıyla tarandı!`, 'success');
      
      // Meta verileri form elemanlarına ve state'e aktar
      if (result.metadata) {
        if (result.metadata.okulAdi) {
          state.okulAdi = result.metadata.okulAdi;
          if (document.getElementById('okulAdi')) document.getElementById('okulAdi').value = result.metadata.okulAdi;
        }
        if (result.metadata.egitimYili) {
          state.egitimYili = result.metadata.egitimYili;
          if (document.getElementById('egitimYili')) document.getElementById('egitimYili').value = result.metadata.egitimYili;
        }
        if (result.metadata.dersAdi) {
          state.dersAdi = result.metadata.dersAdi;
          if (document.getElementById('dersAdi')) document.getElementById('dersAdi').value = result.metadata.dersAdi;
        }
        if (result.metadata.ogretmen) {
          state.ogretmen = result.metadata.ogretmen;
          if (document.getElementById('ogretmen')) document.getElementById('ogretmen').value = result.metadata.ogretmen;
        }
        if (result.metadata.mudur) {
          state.idareci = result.metadata.mudur;
          if (document.getElementById('idareci')) document.getElementById('idareci').value = result.metadata.mudur;
        }
        readFormData();
      }
      
      // Select box'ları doldur
      const sinifSelect = document.getElementById('pdfSinifSelect');
      sinifSelect.innerHTML = '';
      result.classes.forEach((cls, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = cls.sinif;
        sinifSelect.appendChild(option);
      });
      
      document.getElementById('pdf-selection-area').style.display = 'block';
      applyPdfSelection();
    } else {
      showToast(result.hata || 'PDF okunamadı veya uygun veri bulunamadı.', 'error');
    }
  } catch (err) {
    console.error("PDF Yükleme Hatası:", err);
    showToast('Hata: ' + err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function applyPdfSelection() {
  if (!state.pdfData || !state.pdfData.classes) return;
  
  const classIdx = document.getElementById('pdfSinifSelect').value;
  const donem = document.getElementById('pdfDonemSelect').value; // '1' veya '2'
  const clsData = state.pdfData.classes[classIdx];
  
  if (!clsData) return;
  
  // Sınıf adını güncelle
  state.sinif = clsData.sinif;
  const sinifInput = document.getElementById('sinif');
  if (sinifInput) sinifInput.value = clsData.sinif;
  
  // Dönemi güncelle
  const formDonemValue = donem + '. Dönem';
  state.donem = formDonemValue;
  const donemInput = document.getElementById('donem');
  if (donemInput) donemInput.value = formDonemValue;
  
  // Ders adını güncelle (Her sınıfın kendi dersi olabilir)
  if (clsData.ders && clsData.ders !== "Bilinmeyen Ders") {
    state.dersAdi = clsData.ders;
    const dersInput = document.getElementById('dersAdi');
    if (dersInput) dersInput.value = clsData.ders;
  }
  
  // Döneme göre etkinlik notlarını tespit et
  const donemKey = donem === '1' ? 'donem1' : 'donem2';
  
  // Max etkinlik sayısını bul
  let maxEtkinlik = 1;
  clsData.ogrenciler.forEach(ogr => {
    if (ogr[donemKey] && ogr[donemKey].length > maxEtkinlik) {
      maxEtkinlik = ogr[donemKey].length;
    }
  });
  
  // Etkinlik sayısını güncelle (2 veya 3)
  const requiredCount = Math.max(2, Math.min(3, maxEtkinlik)); // Arayüzde 2 veya 3 var
  state.etkinlikSayisi = requiredCount;
  const etInput = document.getElementById('etkinlikSayisi');
  if (etInput) etInput.value = requiredCount;
  
  // Öğrencileri ve notlarını yükle
  state.ogrenciler = [];
  state.tumPuanlar = { 1: {}, 2: {}, 3: {} };
  const totalOlcut = getTotalOlcutCount();
  
  clsData.ogrenciler.forEach((ogr, idx) => {
    state.ogrenciler.push({
      no: ogr.no,
      ad: ogr.ad,
      etkinlikNotlari: ogr[donemKey] || []
    });
    
    // Notları dağıt
    const scores = ogr[donemKey] || [];
    scores.forEach((score, scoreIdx) => {
      const olcekPage = scoreIdx + 1;
      if (olcekPage <= 3 && score != null && score > 0) { // Maksimum 3 sayfa destekleniyor
        const distributedScores = distributeScores(score, totalOlcut);
        state.tumPuanlar[olcekPage] = state.tumPuanlar[olcekPage] || {};
        state.tumPuanlar[olcekPage][idx] = {};
        distributedScores.forEach((s, i) => {
          state.tumPuanlar[olcekPage][idx][i] = s;
        });
      }
    });
  });
  
  // Mevcut sayfayı güncelle
  state.puanlar = state.tumPuanlar[state.olcekNo] || {};
  readFormData();
  renderStudentList();
  renderOlcekTable();
  showToast(`${clsData.sinif} - ${donem}. Dönem yüklendi!`, 'success');
}

async function downloadAllClassesPdf() {
  if (!state.pdfData || !state.pdfData.classes) return;
  
  const jspdf = new window.jspdf.jsPDF('l', 'mm', 'a4');
  const donem = document.getElementById('pdfDonemSelect').value;
  const originalClassIdx = document.getElementById('pdfSinifSelect').value;
  
  showToast('Toplu PDF oluşturuluyor, lütfen bekleyin (Bu işlem biraz sürebilir)...', 'info');
  document.body.style.cursor = 'wait';
  
  let pageCount = 0;
  
  try {
    const pageWidth = jspdf.internal.pageSize.getWidth();
    const pageHeight = jspdf.internal.pageSize.getHeight();

    for (let i = 0; i < state.pdfData.classes.length; i++) {
      // Sınıfı seç ve UI'ı güncelle
      document.getElementById('pdfSinifSelect').value = i;
      applyPdfSelection();
      
      // Tarayıcının nefes alması ve UI'ı güncellemesi için kısa bir bekleme (Donmayı engeller)
      await new Promise(r => setTimeout(r, 150));
      
      // Her bir sınıf için sayfaları oluştur
      for (let olcek = 1; olcek <= state.etkinlikSayisi; olcek++) {
        if (pageCount > 0) {
          jspdf.addPage();
        }
        
        const html = buildPdfPageHtml(olcek, state.tumPuanlar[olcek] || {});
        const tempDiv = document.createElement('div');
        tempDiv.className = 'pdf-preview';
        tempDiv.innerHTML = html;
        // Ekranda görünmeden render olması için sakla ve genişliği sabitle (gerdirmeyi önler)
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '1400px';
        document.body.appendChild(tempDiv);
        
        try {
          const canvas = await html2canvas(tempDiv, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (imgHeight <= pageHeight - 20) {
            jspdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
          } else {
            const scale = (pageHeight - 20) / imgHeight;
            jspdf.addImage(imgData, 'PNG', 10, 10, imgWidth * scale, imgHeight * scale);
          }
        } catch (err) {
          console.error('Canvas error:', err);
        }
        
        document.body.removeChild(tempDiv);
        pageCount++;
        
        // Her sayfa sonrası tarayıcıya nefes aldır
        await new Promise(r => setTimeout(r, 50));
      }
    }
    
    // Dosyayı kaydet
    jspdf.save(`Tüm_Siniflar_${donem}Donem_Olcek.pdf`);
    showToast('Toplu PDF başarıyla indirildi!', 'success');
  } catch (err) {
    console.error(err);
    showToast('PDF oluşturulurken bir hata oluştu.', 'error');
  } finally {
    document.body.style.cursor = 'default';
    // Eski seçime geri dön
    document.getElementById('pdfSinifSelect').value = originalClassIdx;
    applyPdfSelection();
  }
}

async function downloadAllProjectsPdf() {
  if (!state.pdfData || !state.pdfData.classes) {
    showToast('Önce PDF yüklemelisiniz.', 'error');
    return;
  }
  
  const jspdf = new window.jspdf.jsPDF('l', 'mm', 'a4');
  const donem = document.getElementById('pdfDonemSelect').value;
  const donemKey = donem === '1' ? 'donem1_proje' : 'donem2_proje';
  
  showToast('Tüm sınıflar taranıp proje ölçekleri çıkarılıyor...', 'info');
  document.body.style.cursor = 'wait';
  
  // Orijinal state değerlerini sakla
  const originalState = {
    ogrenciler: [...state.ogrenciler],
    tumPuanlar: JSON.parse(JSON.stringify(state.tumPuanlar)),
    olcekTipi: state.olcekTipi,
    dersAdi: state.dersAdi,
    sinif: state.sinif,
    donem: state.donem,
    etkinlikSayisi: state.etkinlikSayisi
  };
  
  try {
    const pageWidth = jspdf.internal.pageSize.getWidth();
    const pageHeight = jspdf.internal.pageSize.getHeight();
    let pageCount = 0;
    
    // Ders bazında grupla
    const dersGruplari = {};
    
    state.pdfData.classes.forEach(cls => {
      const ders = cls.ders || state.dersAdi || 'Bilinmeyen Ders';
      if (!dersGruplari[ders]) dersGruplari[ders] = [];
      
      cls.ogrenciler.forEach(ogr => {
        const projeler = ogr[donemKey] || [];
        if (projeler.length > 0) {
          // Öğrencinin proje notu var, gruba ekle
          dersGruplari[ders].push({
            no: ogr.no,
            // Sınıf adını isminin sonuna ekle
            ad: ogr.ad + ` (${cls.sinif})`,
            etkinlikNotlari: projeler
          });
        }
      });
    });
    
    const dersler = Object.keys(dersGruplari);
    if (dersler.length === 0) {
      showToast('Seçili dönemde proje notu olan hiçbir öğrenci bulunamadı.', 'error');
      document.body.style.cursor = 'default';
      return;
    }

    state.olcekTipi = 'proje';
    state.donem = donem + '. Dönem';
    
    for (const ders of dersler) {
      const ogrenciler = dersGruplari[ders];
      if (ogrenciler.length === 0) continue;
      
      state.dersAdi = ders;
      state.sinif = "Karma Proje Grubu";
      
      // Proje sayısı max 1 veya 2 olabilir
      const maxProje = Math.max(...ogrenciler.map(o => o.etkinlikNotlari.length));
      state.etkinlikSayisi = Math.min(3, Math.max(1, maxProje));
      
      // Sayfalama (Örn: her sayfada max 35 öğrenci)
      const studentsPerPage = 35;
      for (let i = 0; i < ogrenciler.length; i += studentsPerPage) {
        state.ogrenciler = ogrenciler.slice(i, i + studentsPerPage);
        
        // Bu sayfadaki öğrencilerin notlarını dağıt
        state.tumPuanlar = { 1: {}, 2: {}, 3: {} };
        const totalOlcut = getTotalOlcutCount();
        
        state.ogrenciler.forEach((ogr, idx) => {
          ogr.etkinlikNotlari.forEach((score, scoreIdx) => {
            const olcekPage = scoreIdx + 1;
            if (olcekPage <= 3 && score != null && score > 0) {
              const distributedScores = distributeScores(score, totalOlcut);
              state.tumPuanlar[olcekPage] = state.tumPuanlar[olcekPage] || {};
              state.tumPuanlar[olcekPage][idx] = {};
              distributedScores.forEach((s, idx2) => {
                state.tumPuanlar[olcekPage][idx][idx2] = s;
              });
            }
          });
        });
        
        // PDF sayfalarını oluştur
        for (let olcek = 1; olcek <= state.etkinlikSayisi; olcek++) {
          if (pageCount > 0) jspdf.addPage();
          
          const html = buildPdfPageHtml(olcek, state.tumPuanlar[olcek] || {});
          const tempDiv = document.createElement('div');
          tempDiv.className = 'pdf-preview';
          tempDiv.innerHTML = html;
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.top = '0';
          tempDiv.style.width = '1400px';
          document.body.appendChild(tempDiv);
          
          await new Promise(r => setTimeout(r, 150));
          
          try {
            const canvas = await html2canvas(tempDiv, { 
              scale: 2, 
              useCORS: true,
              backgroundColor: '#ffffff',
              logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (imgHeight <= pageHeight - 20) {
              jspdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            } else {
              const scale = (pageHeight - 20) / imgHeight;
              jspdf.addImage(imgData, 'PNG', 10, 10, imgWidth * scale, imgHeight * scale);
            }
          } catch (err) {
            console.error('Canvas error:', err);
          }
          
          document.body.removeChild(tempDiv);
          pageCount++;
        }
      }
    }
    
    jspdf.save(`Proje_Olcekleri_Tum_Siniflar_${donem}Donem.pdf`);
    showToast(`Toplu proje ölçekleri başarıyla indirildi (${pageCount} sayfa).`, 'success');
    
  } catch (err) {
    console.error(err);
    showToast('Proje PDF oluşturulurken hata: ' + err.message, 'error');
  } finally {
    // Orijinal durumu geri yükle
    state.ogrenciler = originalState.ogrenciler;
    state.tumPuanlar = originalState.tumPuanlar;
    state.olcekTipi = originalState.olcekTipi;
    state.dersAdi = originalState.dersAdi;
    state.sinif = originalState.sinif;
    state.donem = originalState.donem;
    state.etkinlikSayisi = originalState.etkinlikSayisi;
    
    document.body.style.cursor = 'default';
    // Görsel tabloyu eski haline döndür
    renderStudentList();
    renderOlcekTable();
  }
}

// ===== Ölçek Tipi Değişimi =====
function onOlcekTipiChange() {
  readFormData();
  state.customOlcutler = null;
  state.tumPuanlar = { 1: {}, 2: {}, 3: {} };
  state.puanlar = state.tumPuanlar[state.olcekNo];
  renderOlcekTable();
}

// ===== Başlatma =====
document.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  renderStudentList();

  // Form değişikliklerini dinle
  document.querySelectorAll('#panel-bilgi input, #panel-bilgi select').forEach(input => {
    input.addEventListener('change', readFormData);
  });

  // Ölçek tipi değişikliği
  el('olcekTipi').addEventListener('change', onOlcekTipiChange);
  el('olcekNo').addEventListener('change', () => {
    readFormData();
    switchOlcekNo(state.olcekNo);
    renderOlcekTable();
  });

  // Klavye kısayolları
  document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '4' && e.ctrlKey) {
      e.preventDefault();
      setQuickFill(parseInt(e.key));
    }
    if (e.key === 'Escape') {
      setQuickFill(null);
      closeModal();
    }
  });

  // Modal dışına tıklama
  document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });
});
