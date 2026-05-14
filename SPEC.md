# Spesifikasi Sistem Klinik Hewan

Sistem ini memiliki 2 platform yang terpisah: platform eksternal untuk pemilik hewan dan platform internal untuk operasional klinik.

## Peran Pengguna

- Pemilik Hewan: Pengguna eksternal yang mendaftarkan hewan dan melakukan reservasi layanan.
- Manajer: Staf internal yang mengelola akun staf (Resepsionis dan Dokter) serta profil profesional dokter.
- Resepsionis: Staf internal yang mengelola administrasi, konfirmasi janji temu, antrian, dan alokasi dokter.
- Dokter: Staf medis internal yang melakukan tindakan, mengisi rekam medis, dan mengatur jadwal pengingat (reminder).

## Daftar State Layanan

Status layanan bersifat sekuensial untuk menjaga integritas data:

- Menunggu Konfirmasi: Janji temu baru saja dikirim oleh pemilik hewan. (Aktor: Resepsionis)
- Diterima: Janji temu disetujui dan mendapatkan nomor antrian. (Aktor: Resepsionis)
- Ditolak: Janji temu ditolak dengan alasan yang wajib diisi. (Aktor: Resepsionis)
- Check-In: Pemilik hewan tiba di lokasi; sistem mulai menghitung sisa antrian. (Aktor: Resepsionis)
- Alokasi Dokter: Resepsionis menunjuk dokter untuk menangani pasien. (Aktor: Resepsionis)
- Menunggu Dokter: Dokter menerima notifikasi tugas dan dapat memilih Terima/Tolak. (Aktor: Dokter)
- Dalam Penanganan: Dokter sedang melakukan tindakan medis. Data medis dan reminder dapat diisi. (Aktor: Dokter)
- Selesai: Tindakan selesai. Data medis dan reminder dikunci (Read-Only). (Aktor: Dokter)
- Selesai Administrasi: Hewan siap diambil dan urusan administrasi tuntas. (Aktor: Resepsionis)

## Alur Bisnis Utama

### A. Reservasi dan Antrian
1. Pemilik Hewan melakukan reservasi dengan memilih hewan, jenis layanan (Vaksin, Checkup, Pengobatan), tanggal kunjungan, catatan, dan riwayat medis sebelumnya.
2. Resepsionis meninjau janji temu.
   - Jika Diterima, sistem memberikan nomor antrian. Nomor ini ditentukan berdasarkan waktu pembuatan janji temu oleh pemilik hewan.
   - Jika Ditolak, alasan penolakan harus diinformasikan ke pemilik hewan.
3. Pada hari-H, Resepsionis melakukan Check-In saat hewan diserahkan.
   - Pemilik dapat memantau sisa antrian (posisi urutan saat ini).

### B. Penanganan Medis
1. Saat waktu penanganan hewan telah tiba (setelah masa tunggu setelah Check-In), Resepsionis melakukan Alokasi Dokter.
2. Dokter meninjau tugas. Jika Ditolak (wajib mengisi alasan), layanan kembali ke pool untuk dialokasikan ulang oleh Resepsionis.
3. Jika Diterima, status berubah menjadi Dalam Penanganan.
4. Dokter menangani hewan dan mengisi:
   - Detail Medis (Hasil pemeriksaan, diagnosa, tindakan, sesuai jenis layanan).
   - Reminder (Rekomendasi perawatan rutin atau kontrol ulang).
5. Dokter menekan tombol Selesai. Status menjadi Selesai dan data menjadi permanen.

### C. Kepulangan dan Tindak Lanjut
1. Resepsionis menutup layanan setelah administrasi selesai.
2. Pemilik Hewan mengambil hewan kembali.
3. Pemilik dapat membuat janji temu baru berdasarkan reminder. Jika janji temu dibuat dari reminder, maka reminder tersebut dianggap sudah ditangani.

## Fitur Berdasarkan Peran

### Pemilik Hewan
- Kelola akun dan profil hewan.
- Buat dan pantau status janji temu (termasuk nomor antrian dan sisa antrian).
- Lihat riwayat rekam medis lengkap dan daftar pengingat (reminder).
- Buat janji temu baru dari reminder yang ada.

### Manajer
- Kelola akun staf (Resepsionis dan Dokter).
- Kelola profil profesional dokter dan status aktif/nonaktif dokter.

### Resepsionis
- Manajemen antrian dan semua janji temu.
- Konfirmasi janji temu (Terima/Tolak).
- Alokasi dokter untuk pasien yang sudah Check-In.

### Dokter
- Dashboard tugas pribadi (hanya janji temu yang dialokasikan ke dirinya).
- Pengisian data medis dan reminder (hanya selama state Dalam Penanganan).

## Ketentuan Teknis dan Logika

- Nomor Antrian: Identitas urut tetap untuk hari layanan tersebut, ditentukan berdasarkan waktu pembuatan janji temu.
- Sisa Antrian: Menunjukkan posisi urutan saat ini, dihitung dengan rumus: (Nomor Antrian hewan tersebut - jumlah hewan dengan nomor antrian lebih kecil yang sudah berstatus Selesai).
- Integritas Data: Data medis dan reminder bersifat read-only setelah layanan berstatus Selesai.
- Audit Log: Setiap perubahan status mencatat waktu dan aktor pelaksana.

## Detail Data Hewan

- Nama
- Jenis (Kucing/Anjing/dsb)
- Ras Hewan
- Warna Bulu
- TL / Umur
- Jenis Kelamin'

## Detail Data Medis Berdasarkan Layanan

Data medis yang wajib diisi oleh Dokter ditentukan oleh jenis layanan yang dipilih saat reservasi.

### Data Pemeriksaan Fisik (Wajib untuk semua layanan)
- Berat badan (kg)
- Suhu tubuh (derajat Celsius)
- Kondisi fisik umum (mata, telinga, mulut, kulit/bulu)
- Detak jantung dan frekuensi nafas (jika diperlukan)

### Layanan Vaksin
- Jenis vaksin (misal: F3, F4, Rabies)
- Merk dan nomor batch vaksin
- Tanggal pemberian vaksin
- Catatan kondisi hewan sebelum vaksinasi (harus dalam kondisi sehat)
- Catatan reaksi pasca vaksin (jika ada)

### Layanan Checkup Rutin
- Hasil palpasi (pemeriksaan organ dalam melalui perabaan)
- Catatan kebersihan (gigi, kuku, telinga)
- Rekomendasi nutrisi atau vitamin
- Rekomendasi perawatan berkala (misal: scaling gigi)

### Layanan Pengobatan
- Gejala klinis (keluhan utama yang diamati pemilik atau dokter)
- Diagnosa (hasil analisis dokter mengenai penyakit hewan)
- Tindakan medis (misal: pembersihan luka, pemberian infus, atau suntikan)
- Resep obat (nama obat, dosis, dan frekuensi pemberian)
- Catatan khusus perawatan di rumah (misal: harus dikandangkan atau dilarang mandi)
- Estimasi biaya tindakan medis
