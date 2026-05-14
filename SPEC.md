# Spesifikasi Sistem Klinik Hewan

Sistem ini memiliki 2 platform yang terpisah: platform eksternal untuk pemilik hewan dan platform internal untuk operasional klinik.

## 1. Peran Pengguna

- Pemilik Hewan: Pengguna eksternal yang mendaftarkan hewan dan melakukan reservasi layanan.
- Manajer: Staf internal yang mengelola akun staf (Resepsionis dan Dokter) serta profil profesional dokter.
- Resepsionis: Staf internal yang mengelola administrasi, konfirmasi janji temu, antrian, dan alokasi dokter.
- Dokter: Staf medis internal yang melakukan tindakan, mengisi rekam medis, dan mengatur jadwal pengingat (reminder).

## 2. Daftar State Layanan

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

## 3. Alur Bisnis Utama

### A. Reservasi dan Antrian
1. Pemilik Hewan melakukan reservasi dengan memilih hewan, jenis layanan (Vaksin, Checkup, Pengobatan), tanggal kunjungan, catatan, dan riwayat medis sebelumnya.
2. Resepsionis meninjau janji temu.
   - Jika Diterima, sistem memberikan nomor antrian (menaik/incremental).
   - Jika Ditolak, alasan penolakan harus diinformasikan ke pemilik hewan.
3. Pada hari-H, Resepsionis melakukan Check-In saat hewan diserahkan.
   - Pemilik dapat memantau sisa antrian (jumlah pasien di depan mereka yang sudah Check-In).

### B. Penanganan Medis
1. Resepsionis melakukan Alokasi Dokter pada pasien yang sudah Check-In.
2. Dokter meninjau tugas. Jika Ditolak (wajib mengisi alasan), layanan kembali ke pool untuk dialokasikan ulang.
3. Jika Diterima, status berubah menjadi Dalam Penanganan.
4. Dokter menangani hewan dan mengisi:
   - Detail Medis (Hasil pemeriksaan, diagnosa, tindakan, sesuai jenis layanan).
   - Reminder (Rekomendasi perawatan rutin atau kontrol ulang).
5. Dokter menekan tombol Selesai. Status menjadi Selesai dan data menjadi permanen.

### C. Kepulangan dan Tindak Lanjut
1. Resepsionis menutup layanan setelah administrasi selesai.
2. Pemilik Hewan mengambil hewan kembali.
3. Pemilik dapat membuat janji temu baru berdasarkan reminder. Jika janji temu dibuat dari reminder, maka reminder tersebut dianggap sudah ditangani.

## 4. Fitur Berdasarkan Peran

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

## 5. Ketentuan Teknis dan Logika

- Nomor Antrian: Identitas urut tetap untuk hari layanan tersebut.
- Sisa Antrian: Jumlah pasien berstatus Check-In, Alokasi Dokter, atau Menunggu Dokter dengan nomor antrian lebih kecil dari pengguna.
- Integritas Data: Data medis dan reminder bersifat read-only setelah layanan berstatus Selesai.
- Audit Log: Setiap perubahan status mencatat waktu dan aktor pelaksana.
