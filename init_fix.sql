-- =========================================================
-- SISTEM MANAJEMEN TUGAS AKHIR (SKRIPSI)
-- =========================================================

-- 1. Setup Database
CREATE DATABASE IF NOT EXISTS thesis_management_system;
USE thesis_management_system;

-- 2. Tabel Mahasiswa
CREATE TABLE student (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nim VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 3. Tabel Dosen
CREATE TABLE lecturer (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nip VARCHAR(18) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 4. Tabel Tugas Akhir
CREATE TABLE thesis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title TEXT,
    progress_status ENUM('pengajuan_judul', 'seminar_proposal', 'penelitian', 'seminar_hasil', 'ujian_akhir', 'selesai') DEFAULT 'pengajuan_judul',
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

-- 5. Tabel Relasi Dosen & Skripsi
CREATE TABLE thesis_lecturers (
    thesis_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    role ENUM('pembimbing', 'penguji'),
    PRIMARY KEY (thesis_id, lecturer_id),
    FOREIGN KEY (thesis_id) REFERENCES thesis(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturer(id) ON DELETE CASCADE
);

-- 6. Tabel Konsultasi (Kolom 'date' diubah menjadi 'consultation_date')
CREATE TABLE consultations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    thesis_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    consultation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    topic TEXT,
    request_status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    lecturer_note TEXT,
    FOREIGN KEY (thesis_id) REFERENCES thesis(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturer(id) ON DELETE CASCADE
);

-- 7. Tabel Events (Kolom 'date' diubah menjadi 'event_date')
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    thesis_id INT NOT NULL,
    type ENUM('seminar_proposal', 'seminar_hasil', 'ujian_akhir'),
    event_date DATETIME,
    location VARCHAR(100),
    request_status ENUM('requested', 'approved', 'rejected') DEFAULT 'requested',
    pass_status ENUM('pending', 'pass', 'fail') DEFAULT 'pending',
    FOREIGN KEY (thesis_id) REFERENCES thesis(id) ON DELETE CASCADE
);

-- 8. Tabel Persetujuan Jadwal
CREATE TABLE event_approvals (
    event_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    PRIMARY KEY (event_id, lecturer_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturer(id) ON DELETE CASCADE
);

-- 9. Tabel Penonton Seminar
CREATE TABLE event_attendees (
    event_id INT NOT NULL,
    student_id INT NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_present BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (event_id, student_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

-- =========================================================
-- TRIGGERS
-- =========================================================
DELIMITER //

-- TRIGGER 1: Otomatis buat record approval saat event di-insert
CREATE TRIGGER after_event_insert_setup_approvals
AFTER INSERT ON events FOR EACH ROW
BEGIN
    INSERT INTO event_approvals (event_id, lecturer_id, approval_status)
    SELECT NEW.id, lecturer_id, 'pending' FROM thesis_lecturers WHERE thesis_id = NEW.thesis_id;
END //

-- TRIGGER 2: Update status event jika semua dosen approve/reject
CREATE TRIGGER after_approval_update_check_status
AFTER UPDATE ON event_approvals FOR EACH ROW
BEGIN
    DECLARE total_lec, approved_lec, rejected_lec INT;
    SELECT COUNT(*) INTO total_lec FROM event_approvals WHERE event_id = NEW.event_id;
    SELECT COUNT(*) INTO approved_lec FROM event_approvals WHERE event_id = NEW.event_id AND approval_status = 'approved';
    SELECT COUNT(*) INTO rejected_lec FROM event_approvals WHERE event_id = NEW.event_id AND approval_status = 'rejected';

    IF rejected_lec > 0 THEN 
        UPDATE events SET request_status = 'rejected' WHERE id = NEW.event_id;
    ELSEIF approved_lec = total_lec THEN 
        UPDATE events SET request_status = 'approved' WHERE id = NEW.event_id;
    END IF;
END //

-- TRIGGER 3 & 4: Otomatis update tahapan skripsi berdasarkan kelulusan
CREATE TRIGGER after_event_pass_fail_update
AFTER UPDATE ON events FOR EACH ROW
BEGIN
    IF NEW.pass_status = 'pass' THEN
        IF NEW.type = 'seminar_proposal' THEN UPDATE thesis SET progress_status = 'penelitian' WHERE id = NEW.thesis_id;
        ELSEIF NEW.type = 'seminar_hasil' THEN UPDATE thesis SET progress_status = 'ujian_akhir' WHERE id = NEW.thesis_id;
        ELSEIF NEW.type = 'ujian_akhir' THEN UPDATE thesis SET progress_status = 'selesai' WHERE id = NEW.thesis_id;
        END IF;
    ELSEIF NEW.pass_status = 'fail' THEN
        IF NEW.type = 'seminar_proposal' THEN UPDATE thesis SET progress_status = 'pengajuan_judul' WHERE id = NEW.thesis_id;
        ELSEIF NEW.type = 'seminar_hasil' THEN UPDATE thesis SET progress_status = 'penelitian' WHERE id = NEW.thesis_id;
        END IF;
    END IF;
END //

-- TRIGGER 5: Validasi Konsultasi (Hanya dengan Pembimbing)
CREATE TRIGGER before_consultation_insert
BEFORE INSERT ON consultations FOR EACH ROW
BEGIN
    DECLARE v_role VARCHAR(20);
    SELECT role INTO v_role FROM thesis_lecturers WHERE thesis_id = NEW.thesis_id AND lecturer_id = NEW.lecturer_id;
    IF v_role IS NULL OR v_role != 'pembimbing' THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ERR_CONSULT_NOT_SUPERVISOR';
    END IF;
END //

DELIMITER ;

-- =========================================================
-- STORED PROCEDURES
-- =========================================================
DELIMITER //

CREATE PROCEDURE assign_lecturer(IN t_id INT, IN l_id INT, IN l_role VARCHAR(20))
BEGIN
    DECLARE v_role VARCHAR(20);
    SELECT role INTO v_role FROM thesis_lecturers WHERE thesis_id = t_id AND lecturer_id = l_id;
    IF v_role IS NOT NULL THEN
        IF v_role <> l_role THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'ERR_ROLE_CONFLICT';
        ELSE SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'ERR_DUPLICATE_ASSIGNMENT';
        END IF;
    ELSE
        INSERT INTO thesis_lecturers (thesis_id, lecturer_id, role) VALUES (t_id, l_id, l_role);
    END IF;
END //

CREATE PROCEDURE register_attendee(IN s_id INT, IN e_id INT)
BEGIN
    DECLARE v_status, v_type VARCHAR(20);
    SELECT request_status, type INTO v_status, v_type FROM events WHERE id = e_id;
    IF v_status != 'approved' THEN SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'ERR_EVENT_NOT_APPROVED';
    ELSEIF v_type = 'ujian_akhir' THEN SIGNAL SQLSTATE '45005' SET MESSAGE_TEXT = 'ERR_PRIVATE_EVENT';
    ELSE INSERT INTO event_attendees (event_id, student_id) VALUES (e_id, s_id);
    END IF;
END //

DELIMITER ;