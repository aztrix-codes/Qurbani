USE defaultdb;

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE receipts;
TRUNCATE TABLE customers;
TRUNCATE TABLE feedback;
TRUNCATE TABLE users;
TRUNCATE TABLE areas;
TRUNCATE TABLE zones;
TRUNCATE TABLE supervisor;
TRUNCATE TABLE admin;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO admin (username, password, mumbai_cost, out_of_mumbai_cost, lock_status)
VALUES ('admin', 'admin123', 1500.00, 2000.00, FALSE);

INSERT INTO supervisor (username, password)
VALUES
('supervisor', 'supervisor123'),
('mumbai_supervisor', 'mumbai123'),
('oom_supervisor', 'oom123');

INSERT INTO zones (name, incharge, phone, email, publish)
VALUES
('South Mumbai', 'Imran Shaikh', '9820011001', 'imran.shaikh@example.com', TRUE),
('Central Mumbai', 'Yusuf Ansari', '9820011002', 'yusuf.ansari@example.com', TRUE),
('Western Suburbs', 'Sameer Khan', '9820011003', 'sameer.khan@example.com', TRUE),
('Eastern Suburbs', 'Farhan Qureshi', '9820011004', 'farhan.qureshi@example.com', TRUE),
('Navi Mumbai', 'Amaan Patel', '9820011005', 'amaan.patel@example.com', TRUE),
('Outstation Coordination', 'Rizwan Merchant', '9820011006', 'rizwan.merchant@example.com', TRUE);

INSERT INTO areas (name, incharge, zone_name, zone_incharge, phone, email, publish)
VALUES
('Byculla', 'Sajid Momin', 'South Mumbai', 'Imran Shaikh', '9820022001', 'sajid.momin@example.com', TRUE),
('Nagpada', 'Faizan Shaikh', 'South Mumbai', 'Imran Shaikh', '9820022002', 'faizan.shaikh@example.com', TRUE),
('Madanpura', 'Hamza Khan', 'South Mumbai', 'Imran Shaikh', '9820022003', 'hamza.khan@example.com', TRUE),
('Kurla West', 'Adnan Siddiqui', 'Central Mumbai', 'Yusuf Ansari', '9820022004', 'adnan.siddiqui@example.com', TRUE),
('Sion', 'Noman Khan', 'Central Mumbai', 'Yusuf Ansari', '9820022005', 'noman.khan@example.com', TRUE),
('Dharavi', 'Arif Shaikh', 'Central Mumbai', 'Yusuf Ansari', '9820022006', 'arif.shaikh@example.com', TRUE),
('Jogeshwari', 'Junaid Pathan', 'Western Suburbs', 'Sameer Khan', '9820022007', 'junaid.pathan@example.com', TRUE),
('Andheri West', 'Salman Khan', 'Western Suburbs', 'Sameer Khan', '9820022008', 'salman.khan@example.com', TRUE),
('Malad Malwani', 'Danish Shaikh', 'Western Suburbs', 'Sameer Khan', '9820022009', 'danish.shaikh@example.com', TRUE),
('Govandi', 'Tariq Qureshi', 'Eastern Suburbs', 'Farhan Qureshi', '9820022010', 'tariq.qureshi@example.com', TRUE),
('Mankhurd', 'Irfan Khan', 'Eastern Suburbs', 'Farhan Qureshi', '9820022011', 'irfan.khan@example.com', TRUE),
('Ghatkopar', 'Zeeshan Shaikh', 'Eastern Suburbs', 'Farhan Qureshi', '9820022012', 'zeeshan.shaikh@example.com', TRUE),
('Vashi', 'Asif Patel', 'Navi Mumbai', 'Amaan Patel', '9820022013', 'asif.patel@example.com', TRUE),
('Nerul', 'Khalid Shaikh', 'Navi Mumbai', 'Amaan Patel', '9820022014', 'khalid.shaikh@example.com', TRUE),
('Panvel', 'Rehan Khan', 'Navi Mumbai', 'Amaan Patel', '9820022015', 'rehan.khan@example.com', TRUE),
('Pune', 'Muzammil Shaikh', 'Outstation Coordination', 'Rizwan Merchant', '9820022016', 'muzammil.shaikh@example.com', TRUE),
('Surat', 'Bilal Patel', 'Outstation Coordination', 'Rizwan Merchant', '9820022017', 'bilal.patel@example.com', TRUE),
('Hyderabad', 'Owais Ahmed', 'Outstation Coordination', 'Rizwan Merchant', '9820022018', 'owais.ahmed@example.com', TRUE);

INSERT INTO users (
  name, phone, email, password, pfp, area_name, area_incharge, zone_name,
  zone_incharge, regions_incharge_of, rate_r1, rate_r2, publish
)
VALUES
('Abdul Rahman', '9833300001', 'abdul.rahman@example.com', '123456789', NULL, 'Byculla', 'Sajid Momin', 'South Mumbai', 'Imran Shaikh', 0, 1500.00, 2000.00, TRUE),
('Mohammed Faisal', '9833300002', 'mohammed.faisal@example.com', '123456789', NULL, 'Byculla', 'Sajid Momin', 'South Mumbai', 'Imran Shaikh', 1, 1500.00, 2000.00, TRUE),
('Aamir Shaikh', '9833300003', 'aamir.shaikh@example.com', '123456789', NULL, 'Nagpada', 'Faizan Shaikh', 'South Mumbai', 'Imran Shaikh', 0, 1500.00, 2000.00, TRUE),
('Shahid Ansari', '9833300004', 'shahid.ansari@example.com', '123456789', NULL, 'Madanpura', 'Hamza Khan', 'South Mumbai', 'Imran Shaikh', 1, 1500.00, 2000.00, TRUE),
('Nadeem Khan', '9833300005', 'nadeem.khan@example.com', '123456789', NULL, 'Kurla West', 'Adnan Siddiqui', 'Central Mumbai', 'Yusuf Ansari', 0, 1500.00, 2000.00, TRUE),
('Sohail Merchant', '9833300006', 'sohail.merchant@example.com', '123456789', NULL, 'Sion', 'Noman Khan', 'Central Mumbai', 'Yusuf Ansari', 2, 1500.00, 2000.00, TRUE),
('Arbaz Qureshi', '9833300007', 'arbaz.qureshi@example.com', '123456789', NULL, 'Dharavi', 'Arif Shaikh', 'Central Mumbai', 'Yusuf Ansari', 0, 1500.00, 2000.00, TRUE),
('Saif Khan', '9833300008', 'saif.khan@example.com', '123456789', NULL, 'Jogeshwari', 'Junaid Pathan', 'Western Suburbs', 'Sameer Khan', 1, 1500.00, 2000.00, TRUE),
('Rahil Shaikh', '9833300009', 'rahil.shaikh@example.com', '123456789', NULL, 'Andheri West', 'Salman Khan', 'Western Suburbs', 'Sameer Khan', 0, 1500.00, 2000.00, TRUE),
('Taha Siddiqui', '9833300010', 'taha.siddiqui@example.com', '123456789', NULL, 'Malad Malwani', 'Danish Shaikh', 'Western Suburbs', 'Sameer Khan', 0, 1500.00, 2000.00, TRUE),
('Uzair Pathan', '9833300011', 'uzair.pathan@example.com', '123456789', NULL, 'Govandi', 'Tariq Qureshi', 'Eastern Suburbs', 'Farhan Qureshi', 0, 1500.00, 2000.00, TRUE),
('Ibrahim Momin', '9833300012', 'ibrahim.momin@example.com', '123456789', NULL, 'Mankhurd', 'Irfan Khan', 'Eastern Suburbs', 'Farhan Qureshi', 2, 1500.00, 2000.00, TRUE),
('Zubair Khan', '9833300013', 'zubair.khan@example.com', '123456789', NULL, 'Ghatkopar', 'Zeeshan Shaikh', 'Eastern Suburbs', 'Farhan Qureshi', 1, 1500.00, 2000.00, TRUE),
('Fardeen Shaikh', '9833300014', 'fardeen.shaikh@example.com', '123456789', NULL, 'Vashi', 'Asif Patel', 'Navi Mumbai', 'Amaan Patel', 0, 1500.00, 2000.00, TRUE),
('Waseem Patel', '9833300015', 'waseem.patel@example.com', '123456789', NULL, 'Nerul', 'Khalid Shaikh', 'Navi Mumbai', 'Amaan Patel', 0, 1500.00, 2000.00, TRUE),
('Yasir Khan', '9833300016', 'yasir.khan@example.com', '123456789', NULL, 'Panvel', 'Rehan Khan', 'Navi Mumbai', 'Amaan Patel', 2, 1500.00, 2000.00, TRUE),
('Moin Shaikh', '9833300017', 'moin.shaikh@example.com', '123456789', NULL, 'Pune', 'Muzammil Shaikh', 'Outstation Coordination', 'Rizwan Merchant', 2, 1500.00, 2000.00, TRUE),
('Javed Patel', '9833300018', 'javed.patel@example.com', '123456789', NULL, 'Surat', 'Bilal Patel', 'Outstation Coordination', 'Rizwan Merchant', 2, 1500.00, 2000.00, TRUE),
('Owais Khan', '9833300019', 'owais.khan@example.com', '123456789', NULL, 'Hyderabad', 'Owais Ahmed', 'Outstation Coordination', 'Rizwan Merchant', 2, 1500.00, 2000.00, TRUE),
('Rayyan Shaikh', '9833300020', 'rayyan.shaikh@example.com', '123456789', NULL, 'Kurla West', 'Adnan Siddiqui', 'Central Mumbai', 'Yusuf Ansari', 0, 1500.00, 2000.00, TRUE),
('Huzaifa Ansari', '9833300021', 'huzaifa.ansari@example.com', '123456789', NULL, 'Malad Malwani', 'Danish Shaikh', 'Western Suburbs', 'Sameer Khan', 1, 1500.00, 2000.00, TRUE),
('Kashif Qureshi', '9833300022', 'kashif.qureshi@example.com', '123456789', NULL, 'Govandi', 'Tariq Qureshi', 'Eastern Suburbs', 'Farhan Qureshi', 0, 1500.00, 2000.00, TRUE),
('Talha Merchant', '9833300023', 'talha.merchant@example.com', '123456789', NULL, 'Nerul', 'Khalid Shaikh', 'Navi Mumbai', 'Amaan Patel', 0, 1500.00, 2000.00, TRUE),
('Dawood Shaikh', '9833300024', 'dawood.shaikh@example.com', '123456789', NULL, 'Madanpura', 'Hamza Khan', 'South Mumbai', 'Imran Shaikh', 0, 1500.00, 2000.00, TRUE);

CREATE TEMPORARY TABLE seed_numbers (n INT PRIMARY KEY);
INSERT INTO seed_numbers (n)
VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9);

INSERT INTO customers (
  receipt, name, phone, email, type, region, user_name, area_name, area_incharge,
  zone_name, zone_incharge, status, payment_status, amount_paid
)
SELECT
  2026000 + (seeded.user_id * 10) + seeded.n AS receipt,
  seeded.customer_name,
  CONCAT('98', LPAD(44000000 + (seeded.user_id * 10) + seeded.n, 8, '0')) AS phone,
  CONCAT(LOWER(REPLACE(seeded.customer_name, ' ', '.')), seeded.user_id, seeded.n, '@example.com') AS email,
  CASE
    WHEN seeded.n IN (8) THEN 2
    WHEN seeded.n IN (9) THEN 3
    ELSE 1
  END AS type,
  seeded.region,
  seeded.user_name,
  seeded.area_name,
  seeded.area_incharge,
  seeded.zone_name,
  seeded.zone_incharge,
  seeded.is_exported AS status,
  seeded.is_paid AS payment_status,
  CASE
    WHEN seeded.is_paid = TRUE AND seeded.region = 1 THEN seeded.rate_r1
    WHEN seeded.is_paid = TRUE AND seeded.region = 2 THEN seeded.rate_r2
    ELSE 0.00
  END AS amount_paid
FROM (
  SELECT
    u.id AS user_id,
    n.n,
    u.name AS user_name,
    u.area_name,
    u.area_incharge,
    u.zone_name,
    u.zone_incharge,
    u.rate_r1,
    u.rate_r2,
    CASE
      WHEN u.regions_incharge_of = 1 THEN 1
      WHEN u.regions_incharge_of = 2 THEN 2
      WHEN MOD(n.n, 2) = 0 THEN 1
      ELSE 2
    END AS region,
    CASE
      WHEN n.n IN (7, 9) THEN FALSE
      ELSE TRUE
    END AS is_exported,
    CASE
      WHEN n.n IN (1, 2, 4, 6) THEN TRUE
      ELSE FALSE
    END AS is_paid,
    CONCAT(
      CASE MOD((u.id * 3) + n.n, 24)
        WHEN 0 THEN 'Ayaan'
        WHEN 1 THEN 'Rehan'
        WHEN 2 THEN 'Arham'
        WHEN 3 THEN 'Zaid'
        WHEN 4 THEN 'Faizan'
        WHEN 5 THEN 'Hamza'
        WHEN 6 THEN 'Ilyas'
        WHEN 7 THEN 'Musa'
        WHEN 8 THEN 'Danish'
        WHEN 9 THEN 'Rayan'
        WHEN 10 THEN 'Aqib'
        WHEN 11 THEN 'Bilal'
        WHEN 12 THEN 'Salman'
        WHEN 13 THEN 'Noman'
        WHEN 14 THEN 'Irfan'
        WHEN 15 THEN 'Adil'
        WHEN 16 THEN 'Sufiyan'
        WHEN 17 THEN 'Faraz'
        WHEN 18 THEN 'Khalid'
        WHEN 19 THEN 'Wasim'
        WHEN 20 THEN 'Yunus'
        WHEN 21 THEN 'Omar'
        WHEN 22 THEN 'Hassan'
        ELSE 'Usman'
      END,
      ' ',
      CASE MOD((u.id * 5) + n.n, 18)
        WHEN 0 THEN 'Shaikh'
        WHEN 1 THEN 'Khan'
        WHEN 2 THEN 'Ansari'
        WHEN 3 THEN 'Qureshi'
        WHEN 4 THEN 'Pathan'
        WHEN 5 THEN 'Momin'
        WHEN 6 THEN 'Patel'
        WHEN 7 THEN 'Siddiqui'
        WHEN 8 THEN 'Merchant'
        WHEN 9 THEN 'Sayyed'
        WHEN 10 THEN 'Chaudhary'
        WHEN 11 THEN 'Malik'
        WHEN 12 THEN 'Tamboli'
        WHEN 13 THEN 'Mirza'
        WHEN 14 THEN 'Kazi'
        WHEN 15 THEN 'Khatri'
        WHEN 16 THEN 'Mulla'
        ELSE 'Syed'
      END
    ) AS customer_name
  FROM users u
  JOIN seed_numbers n
) seeded;

INSERT INTO receipts (
  user_name, phone, email, paid_by, collected_by, img, rate, hissa, total_amt,
  area_name, area_incharge, zone_name, zone_incharge
)
SELECT
  c.user_name,
  c.phone,
  c.email,
  c.name AS paid_by,
  c.user_name AS collected_by,
  CONCAT('https://placehold.co/480x640?text=Receipt+', c.receipt) AS img,
  c.amount_paid AS rate,
  1 AS hissa,
  c.amount_paid AS total_amt,
  c.area_name,
  c.area_incharge,
  c.zone_name,
  c.zone_incharge
FROM customers c
WHERE c.payment_status = TRUE;

INSERT INTO feedback (name, feedback)
VALUES
('Abdul Rahman', 'The receipt flow is working smoothly. Camera proof is helpful during collection.'),
('Mohammed Faisal', 'Dashboard totals are easy to understand after marking records as paid.'),
('Aamir Shaikh', 'Please keep the mobile layout simple because most entries are done on phones.'),
('Shahid Ansari', 'Some payers request confirmation immediately, so receipt records are useful.'),
('Nadeem Khan', 'Area-wise filtering helps when checking pending shares at night.'),
('Sohail Merchant', 'Out of Mumbai collections need clear separation from Mumbai rates.'),
('Arbaz Qureshi', 'The export list is useful for final animal allocation.'),
('Saif Khan', 'Payment proof should remain mandatory for all collections.'),
('Rahil Shaikh', 'Search by receipt number and phone is very helpful.'),
('Taha Siddiqui', 'Pending amount summary helps us follow up faster.'),
('Uzair Pathan', 'Receipt photo preview should stay compact for laptop screens.'),
('Ibrahim Momin', 'The system feels ready for a proper dry run with full sample data.');

DROP TEMPORARY TABLE seed_numbers;

SELECT 'Seed completed' AS message;
SELECT COUNT(*) AS zones FROM zones;
SELECT COUNT(*) AS areas FROM areas;
SELECT COUNT(*) AS users FROM users;
SELECT COUNT(*) AS customers FROM customers;
SELECT COUNT(*) AS receipts FROM receipts;
