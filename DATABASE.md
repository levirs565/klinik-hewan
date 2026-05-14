# Skema Basis Data Klinik Hewan

Berikut adalah rancangan tabel basis data berdasarkan spesifikasi sistem.

```mermaid
erDiagram
    EXTERNAL_USER ||--o{ ANIMAL : owns
    EXTERNAL_USER {
        uuid id PK
        string username
        string password
        string full_name
        string address
        string phone_number
        datetime last_login
    }

    INTERNAL_USER ||--|| DOCTOR_PROFILE : is
    INTERNAL_USER {
        uuid id PK
        string username
        string password
        string role "manager, receptionist, doctor"
        string full_name
        boolean is_active
    }

    DOCTOR_PROFILE ||--o{ APPOINTMENT : has
    DOCTOR_PROFILE {
        uuid id PK
        uuid internal_user_id FK
        date birth_date
        text education_history
        date practice_start_date
        date join_date
        text practice_location_history
        text special_services_history
    }

    ANIMAL ||--o{ APPOINTMENT : has
    ANIMAL {
        uuid id PK
        uuid owner_id FK "refers to EXTERNAL_USER"
        string name
        string type "cat, dog, etc"
        string breed
        string hair_color
        date birth_date_or_age
        string gender
    }

    APPOINTMENT ||--o{ MEDICAL_RECORD : produces
    APPOINTMENT ||--o{ STATUS_HISTORY : tracks
    APPOINTMENT {
        uuid id PK
        uuid animal_id FK
        uuid doctor_id FK "refers to INTERNAL_USER"
        string service_type "vaccine, checkup, treatment"
        date appointment_date
        integer queue_number
        text owner_notes
        text previous_medical_history
        string current_state
        datetime created_at
    }

    STATUS_HISTORY {
        uuid id PK
        uuid appointment_id FK
        string state
        uuid actor_id FK "refers to INTERNAL_USER"
        datetime changed_at
        text reason "required for rejection"
    }

    MEDICAL_RECORD {
        uuid id PK
        uuid appointment_id FK
        float weight
        float temperature
        string physical_condition
        string heart_rate
        string respiratory_rate
        text diagnosis
        text clinical_symptoms
        text medical_action
        text prescription
        text home_care_notes
        decimal estimated_cost
    }

    VACCINE_DETAIL ||--|| MEDICAL_RECORD : extends
    VACCINE_DETAIL {
        uuid id PK
        uuid medical_record_id FK
        string vaccine_type
        string brand
        string batch_number
        date administration_date
        text pre_vaccine_condition
        text post_vaccine_reaction
    }

    REMINDER ||--o{ APPOINTMENT : triggered_by
    REMINDER ||--o{ APPOINTMENT : fulfills
    REMINDER {
        uuid id PK
        uuid animal_id FK
        uuid source_appointment_id FK
        uuid fulfilling_appointment_id FK
        string description
        date reminder_date
        boolean is_handled computed
    }
```

## Penjelasan Tabel

1. **EXTERNAL_USER**: Menyimpan data login dan profil untuk Pemilik Hewan pada aplikasi eksternal.
2. **INTERNAL_USER**: Menyimpan data login dan peran staf klinik (Manajer, Resepsionis, Dokter) pada aplikasi internal.
3. **DOCTOR_PROFILE**: Data tambahan khusus untuk dokter yang terhubung ke akun staf internal.
4. **ANIMAL**: Data hewan peliharaan yang terhubung ke Pemilik Hewan (EXTERNAL_USER).
5. **APPOINTMENT**: Inti dari sistem antrian. Menyimpan jenis layanan, nomor antrian, dan status saat ini.
6. **STATUS_HISTORY**: Audit log untuk mencatat setiap perubahan status layanan, aktor internal yang mengubah, dan alasan penolakan.
7. **MEDICAL_RECORD**: Data pemeriksaan fisik umum dan hasil medis yang diisi oleh Dokter.
8. **VACCINE_DETAIL**: Tabel tambahan khusus untuk menyimpan detail teknis vaksinasi.
9. **REMINDER**: Pengingat medis yang dibuat oleh dokter. Dapat melacak keterkaitan dengan janji temu asal dan janji temu baru yang menanganinya.
