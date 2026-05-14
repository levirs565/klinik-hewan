# Spesifikasi Sistem Klinik Hewan

Sistem ini memiliki 2 website yang terpisah yaitu eksternal untuk pemilik hewan dan internal untuk klinik.

## Alur Bisnis

Berikut adalah alur bisnis utama dalam sistem ini:

- Pemilik hewan membuat akun di website eksternal.
- Pemilik hewan menambahkan data hewan peliharaannya.
- Pemilik hewan memilih layanan untuk janji temu
  - Ada 3 jenis layanan yaitu: Vaksin, Checkup Rutin dan Pengobatan
  - Pemilik hewan memilih hewan yang akan diberikan layanan
  - Pemilik hewan memilih tanggal, catatan pemilik (keluhan dan waktu luang (opsional)), dan riwayat pemeriksaan sebelumnya dari klinik lain
- Resepsionis dapat menerima janji temu atau menolaknya
  - Jika janji temu diterima, maka layanan akan mendapatkan nomor antrian sesuai dengan urutan pengiriman janji temu
  - Jika ditolak, maka harus memberikan alasan
- Saat hari-H, Pemilik hewan kemudian bisa menyerahkan hewan dan Resepsionis klik konfirmasi bahwa hewan sudah diterima
- Jika hewan sudah mulai ditangai maka Resepsionis bisa klik konfirmasi bahwa hewan sudah ditangai
  - Resepsionis perlu memilih dokter mana yang menanganinya
- Dokter dapat menerima atau menolak penanganan hewan tersebut
  - Jika ditolak maka kembali ke status sebelumnya dan Resepsionis bisa memilih dokter lain. Harus mengisi alasan tolak
- Dokter kemudian menangai hewan tersebut
- Jika hewan perlu reminder, maka dokter bisa menambahkan reminder untuk berlakukan perawatan secara rutin
  - Reminder bersifat rekomendasi, jadi kalau melebihi waktu tesebut tidak masalah
- Setelah selesai, maka dokter bisa mengisi detail medis untuk hewan sesuai dengan layanan yang dipilih. Status hewan akan berubah menjadi "selesai"
- Pemilik hewan bisa mengambil hewannya kembali

## Kebutuhan

Pemilik Hewan:

- Dapat membua akun serta mengubah detailnya
- Dapat mengelola data hewan miliknya
- Dapat membuat janji temu untuk hewan peliharaanya
- Dapat melihat daftar reminder untuk hewan miliknya
- Dapat melihat riwayat perawatan hewan miliknya
- Dapat melihat detail perawatan hewan miliknya termasuk dokter yang menanganinya
- Dapat membuat janji temu yang sesuai dengan reminder (dengan ini maka reminder tersebut akan dianggap sudah ditangai oleh janji temu yang baru)
- Dapat melihat status janji temu
- Dapat melihat nomor antrian hewan dan nomor sisa antrian

Janji temu dan reminder itu entitas terpisah

Manajer:

- Dapat memgelola akun resepsionis
- Dapat memgelola akun dokter
- Dapat mengelola detail dokter serta menonaktifkan dokter

Resepsionis:

- Dapat melihat antrian hewan
- Dapat melihat semua janji temu
- Dapat menerima atau menolak janji temu
- Dapat mengarahkan janji temu ke dokter yang sesuai
- Dapat melihat detail janji temu termasuk detail hewan

Dokter Hewan:

- Dapat melihat detail janji temu termasuk detail hewan. Hanya janji temu yang ditugaskan ke dokter tersebut
- Dapat mengisi detail medis sesuai dengan layanan
- Dapat mengisi reminder untuk hewan yang ditangani oleh dokter tersebut. Hanya dapat dilakukan jika pelayanan masih belum selesai

Mekanisme Antrian:

- Pemilik Hewan yang mendaftar membuat janji temu pertama akan mendapatka antrian pertama
- Antrian akan terus bertambah sesuai dengan jumlah janji temu yang dibuat oleh pemilik hewan di hari tersebut
