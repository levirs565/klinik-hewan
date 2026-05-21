# Arsitektur Sistem Klinik Hewan

Sistem ini menggunakan strategi **Polyglot Persistence** untuk mengoptimalkan penyimpanan data berdasarkan karakteristiknya:

1.  **MySQL (MariaDB)**: Digunakan sebagai database utama untuk data relasional yang memerlukan integritas transaksional tinggi, seperti manajemen pengguna, profil hewan, janji temu (appointments), antrian, dan pengingat (reminders).
2.  **MongoDB**: Digunakan untuk menyimpan data yang bersifat dokumen, log, atau memiliki skema dinamis, meliputi:
    *   **Rekam Medis**: Data medis yang detailnya bervariasi tergantung jenis layanan.
    *   **Audit Log**: Riwayat perubahan status janji temu.
    *   **Manajemen Sesi & Keamanan**: Refresh tokens, OTP logins, dan login logs.
    *   **Push Notifications**: Penyimpanan FCM tokens.

## Infrastruktur & Integrasi

- **Penyimpanan File**: Menggunakan **RustFS (S3 Compatible Object Storage)** untuk menyimpan aset digital.
- **Notifikasi**:
    - **Push Notification**: Menggunakan **Firebase Cloud Messaging (FCM)**.
    - **Email**: Menggunakan **Resend**.
    - **Abstraksi**: Implementasi notifikasi menggunakan interface generik untuk mendukung berbagai penyedia layanan di masa depan.
- **Keamanan & Akses**:
    - **API Gateway**: Menggunakan **GCP API Gateway** sebagai titik masuk tunggal bagi **Platform Eksternal** untuk terhubung ke backend.
    - **Pemisahan Platform & Konektivitas**:
        1.  **Platform Eksternal**: Untuk Pemilik Hewan. Akses dilakukan melalui API Gateway.
        2.  **Platform Internal**: Untuk operasional klinik (Manajer, Resepsionis, Dokter). Terhubung **langsung ke backend** tanpa melalui API Gateway. Akses dibatasi pada IP perusahaan untuk keamanan tambahan.
