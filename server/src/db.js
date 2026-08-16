const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', 'dawatrack.db');

let db = null;

function saveDb() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

// Auto-save every 5 seconds
setInterval(saveDb, 5000);

async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('📂 Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('🆕 Created new database');
  }

  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK(role IN ('patient','doctor','pharmacist','caregiver','admin')),
    full_name TEXT NOT NULL,
    national_id TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    nhif_number TEXT,
    is_verified INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS patient_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    blood_type TEXT,
    allergies TEXT DEFAULT '[]',
    chronic_conditions TEXT DEFAULT '[]',
    emergency_contact TEXT,
    weight_kg REAL,
    height_cm REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS doctor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    kmpdc_number TEXT,
    specialization TEXT,
    hospital_name TEXT,
    is_approved INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pharmacist_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    ppb_license TEXT,
    pharmacy_name TEXT,
    pharmacy_location_lat REAL,
    pharmacy_location_lng REAL,
    pharmacy_address TEXT,
    pharmacy_phone TEXT,
    opening_hours TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS caregiver_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caregiver_user_id INTEGER NOT NULL,
    patient_user_id INTEGER NOT NULL,
    consent_token TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_code TEXT UNIQUE NOT NULL,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    issued_date TEXT DEFAULT (date('now')),
    expiry_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','dispensed','expired','cancelled')),
    notes TEXT,
    diagnosis_code TEXT,
    diagnosis_text TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS prescription_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    drug_name TEXT NOT NULL,
    drug_code TEXT,
    dosage TEXT,
    dosage_unit TEXT,
    frequency TEXT,
    duration_days INTEGER,
    refills_allowed INTEGER DEFAULT 0,
    refills_used INTEGER DEFAULT 0,
    instructions TEXT,
    route TEXT DEFAULT 'oral'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS dispensing_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    pharmacist_id INTEGER NOT NULL,
    dispensed_at TEXT DEFAULT (datetime('now')),
    items_dispensed TEXT DEFAULT '[]',
    notes TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medication_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    prescription_item_id INTEGER,
    drug_name TEXT,
    reminder_time TEXT,
    repeat_days TEXT DEFAULT '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]',
    channel TEXT DEFAULT 'push',
    is_active INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS drugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    category TEXT,
    form TEXT,
    default_dosage TEXT,
    default_unit TEXT,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS drug_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_a_code TEXT NOT NULL,
    drug_b_code TEXT NOT NULL,
    drug_a_name TEXT,
    drug_b_name TEXT,
    severity TEXT,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS drug_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pharmacist_id INTEGER NOT NULL,
    drug_code TEXT,
    drug_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    price REAL,
    expiry_date TEXT,
    reorder_threshold INTEGER DEFAULT 10,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT,
    title TEXT,
    body TEXT,
    is_read INTEGER DEFAULT 0,
    sent_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    resource TEXT,
    resource_id TEXT,
    ip_address TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
  )`);

  // Seed if empty
  const count = db.exec("SELECT COUNT(*) as count FROM users");
  if (count[0].values[0][0] === 0) {
    seedDatabase();
  }

  saveDb();
  return db;
}

function seedDatabase() {
  console.log('🌱 Seeding database...');
  const hash = bcrypt.hashSync('password123', 10);

  const users = [
    ['patient','Amina Wanjiku','12345678','patient@dawa.co.ke','+254712345678',hash,'NHIF-001234',1],
    ['doctor','Dr. James Ochieng','23456789','doctor@dawa.co.ke','+254723456789',hash,null,1],
    ['pharmacist','Faith Muthoni','34567890','pharmacist@dawa.co.ke','+254734567890',hash,null,1],
    ['caregiver','Peter Kamau','45678901','caregiver@dawa.co.ke','+254745678901',hash,null,1],
    ['admin','Sarah Njeri','56789012','admin@dawa.co.ke','+254756789012',hash,null,1],
    ['patient','John Kiprop','67890123','john@dawa.co.ke','+254767890123',hash,'NHIF-005678',1],
    ['doctor','Dr. Lucy Akinyi','78901234','lucy@dawa.co.ke','+254778901234',hash,null,1],
  ];
  for (const u of users) {
    db.run('INSERT INTO users (role,full_name,national_id,email,phone,password_hash,nhif_number,is_verified) VALUES (?,?,?,?,?,?,?,?)', u);
  }

  db.run("INSERT INTO patient_profiles (user_id,blood_type,allergies,chronic_conditions,emergency_contact,weight_kg,height_cm) VALUES (1,'O+','[\"Penicillin\",\"Sulfa drugs\"]','[\"Type 2 Diabetes\",\"Hypertension\"]','+254700111222',68,165)");
  db.run("INSERT INTO patient_profiles (user_id,blood_type,allergies,chronic_conditions,emergency_contact,weight_kg,height_cm) VALUES (6,'A+','[\"Aspirin\"]','[\"Asthma\"]','+254700333444',75,178)");

  db.run("INSERT INTO doctor_profiles (user_id,kmpdc_number,specialization,hospital_name,is_approved) VALUES (2,'KMPDC-12345','General Practice','Kenyatta National Hospital',1)");
  db.run("INSERT INTO doctor_profiles (user_id,kmpdc_number,specialization,hospital_name,is_approved) VALUES (7,'KMPDC-67890','Pediatrics','Nairobi Hospital',1)");

  db.run("INSERT INTO pharmacist_profiles (user_id,ppb_license,pharmacy_name,pharmacy_location_lat,pharmacy_location_lng,pharmacy_address,pharmacy_phone,opening_hours) VALUES (3,'PPB-54321','MedPlus Pharmacy',-1.2921,36.8219,'Kenyatta Avenue, Nairobi CBD','+254711222333','8:00 AM - 9:00 PM')");

  db.run(`INSERT INTO caregiver_links (caregiver_user_id,patient_user_id,consent_token,status) VALUES (4,1,'${uuidv4()}','active')`);

  const drugs = [
    ['Amoxicillin','AMX500','Antibiotic','Capsule','500','mg','Broad-spectrum penicillin-type antibiotic'],
    ['Paracetamol','PCM500','Analgesic','Tablet','500','mg','Pain relief and fever reduction'],
    ['Metformin','MET500','Antidiabetic','Tablet','500','mg','First-line treatment for Type 2 diabetes'],
    ['Amlodipine','AML5','Antihypertensive','Tablet','5','mg','Calcium channel blocker for blood pressure'],
    ['Ibuprofen','IBU400','NSAID','Tablet','400','mg','Anti-inflammatory pain reliever'],
    ['Omeprazole','OMP20','PPI','Capsule','20','mg','Proton pump inhibitor for acid reflux'],
    ['Salbutamol','SAL100','Bronchodilator','Inhaler','100','mcg','Quick-relief inhaler for asthma'],
    ['Losartan','LOS50','ARB','Tablet','50','mg','For hypertension'],
    ['Ciprofloxacin','CIP500','Antibiotic','Tablet','500','mg','Fluoroquinolone antibiotic'],
    ['Metronidazole','MTZ400','Antibiotic','Tablet','400','mg','For anaerobic bacteria and parasites'],
    ['Diclofenac','DCF50','NSAID','Tablet','50','mg','Non-steroidal anti-inflammatory'],
    ['Cetirizine','CTZ10','Antihistamine','Tablet','10','mg','For allergies'],
    ['Prednisolone','PRD5','Corticosteroid','Tablet','5','mg','For inflammation'],
    ['Azithromycin','AZT250','Antibiotic','Tablet','250','mg','Macrolide antibiotic'],
    ['Atorvastatin','ATV20','Statin','Tablet','20','mg','Cholesterol-lowering medication'],
  ];
  for (const d of drugs) {
    db.run('INSERT INTO drugs (name,code,category,form,default_dosage,default_unit,description) VALUES (?,?,?,?,?,?,?)', d);
  }

  const interactions = [
    ['IBU400','MET500','Ibuprofen','Metformin','moderate','NSAIDs may reduce blood sugar-lowering effect of metformin'],
    ['AMX500','MTZ400','Amoxicillin','Metronidazole','mild','Monitor for increased GI side effects'],
    ['CIP500','MTZ400','Ciprofloxacin','Metronidazole','moderate','May increase risk of QT prolongation'],
    ['AML5','LOS50','Amlodipine','Losartan','mild','May cause additive blood pressure lowering'],
    ['IBU400','DCF50','Ibuprofen','Diclofenac','severe','Never combine two NSAIDs — high risk of GI bleeding'],
    ['PRD5','IBU400','Prednisolone','Ibuprofen','severe','Significantly increases risk of GI ulceration'],
    ['ATV20','AZT250','Atorvastatin','Azithromycin','moderate','May increase atorvastatin levels'],
  ];
  for (const i of interactions) {
    db.run('INSERT INTO drug_interactions (drug_a_code,drug_b_code,drug_a_name,drug_b_name,severity,description) VALUES (?,?,?,?,?,?)', i);
  }

  const inventory = [
    [3,'AMX500','Amoxicillin 500mg',150,25,'2027-06-15',20],
    [3,'PCM500','Paracetamol 500mg',500,5,'2027-12-01',50],
    [3,'MET500','Metformin 500mg',200,15,'2027-08-20',30],
    [3,'AML5','Amlodipine 5mg',80,35,'2027-03-10',15],
    [3,'IBU400','Ibuprofen 400mg',300,10,'2027-09-15',40],
    [3,'OMP20','Omeprazole 20mg',120,20,'2027-05-01',20],
    [3,'SAL100','Salbutamol Inhaler',25,350,'2027-07-30',5],
    [3,'LOS50','Losartan 50mg',90,30,'2027-11-20',15],
    [3,'CIP500','Ciprofloxacin 500mg',8,40,'2027-04-10',15],
    [3,'CTZ10','Cetirizine 10mg',250,8,'2027-10-15',30],
  ];
  for (const inv of inventory) {
    db.run('INSERT INTO drug_inventory (pharmacist_id,drug_code,drug_name,quantity,price,expiry_date,reorder_threshold) VALUES (?,?,?,?,?,?,?)', inv);
  }

  // Prescriptions
  const rxCode1 = uuidv4().substring(0,8).toUpperCase();
  const rxCode2 = uuidv4().substring(0,8).toUpperCase();
  db.run("INSERT INTO prescriptions (prescription_code,doctor_id,patient_id,issued_date,expiry_date,status,notes,diagnosis_code,diagnosis_text) VALUES (?1,2,1,date('now','-5 days'),date('now','+25 days'),'active','Take with meals. Avoid alcohol.','E11.9','Type 2 Diabetes Mellitus')", [rxCode1]);
  db.run("INSERT INTO prescriptions (prescription_code,doctor_id,patient_id,issued_date,expiry_date,status,notes,diagnosis_code,diagnosis_text) VALUES (?1,2,1,date('now','-30 days'),date('now','-1 day'),'expired','Complete course of antibiotics.','J06.9','Upper respiratory infection')", [rxCode2]);

  db.run("INSERT INTO prescription_items (prescription_id,drug_name,drug_code,dosage,dosage_unit,frequency,duration_days,refills_allowed,refills_used,instructions,route) VALUES (1,'Metformin','MET500','500','mg','Twice daily',30,3,1,'Take with breakfast and dinner','oral')");
  db.run("INSERT INTO prescription_items (prescription_id,drug_name,drug_code,dosage,dosage_unit,frequency,duration_days,refills_allowed,refills_used,instructions,route) VALUES (1,'Amlodipine','AML5','5','mg','Once daily',30,3,1,'Take in the morning','oral')");
  db.run("INSERT INTO prescription_items (prescription_id,drug_name,drug_code,dosage,dosage_unit,frequency,duration_days,refills_allowed,refills_used,instructions,route) VALUES (2,'Amoxicillin','AMX500','500','mg','Three times daily',7,0,0,'Complete full course','oral')");

  db.run("INSERT INTO dispensing_records (prescription_id,pharmacist_id,dispensed_at,items_dispensed,notes) VALUES (1,3,datetime('now','-3 days'),'[\"Metformin 500mg x30\",\"Amlodipine 5mg x30\"]','First dispensing')");

  db.run("INSERT INTO medication_reminders (patient_id,prescription_item_id,drug_name,reminder_time,channel,is_active) VALUES (1,1,'Metformin 500mg','08:00','push',1)");
  db.run("INSERT INTO medication_reminders (patient_id,prescription_item_id,drug_name,reminder_time,channel,is_active) VALUES (1,1,'Metformin 500mg','19:00','sms',1)");
  db.run("INSERT INTO medication_reminders (patient_id,prescription_item_id,drug_name,reminder_time,channel,is_active) VALUES (1,2,'Amlodipine 5mg','08:00','push',1)");

  db.run("INSERT INTO notifications (user_id,type,title,body,is_read) VALUES (1,'prescription','New Prescription','Dr. James Ochieng has issued you a new prescription.',1)");
  db.run("INSERT INTO notifications (user_id,type,title,body,is_read) VALUES (1,'reminder','Medication Reminder','Time to take your Metformin 500mg.',0)");
  db.run("INSERT INTO notifications (user_id,type,title,body,is_read) VALUES (1,'refill','Refill Needed','Your Metformin has 2 refills remaining.',0)");

  console.log('✅ Database seeded successfully!');
}

// Helper to convert sql.js results to objects
function rowsToObjects(result) {
  if (!result || result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function getOne(sql, params = []) {
  const result = db.exec(sql, params);
  const rows = rowsToObjects(result);
  return rows[0] || null;
}

function getAll(sql, params = []) {
  const result = db.exec(sql, params);
  return rowsToObjects(result);
}

function runSql(sql, params = []) {
  db.run(sql, params);
  const id = db.exec("SELECT last_insert_rowid() as id");
  return { lastInsertRowid: id[0]?.values[0][0] || 0 };
}

module.exports = { initDatabase, getDb: () => db, getOne, getAll, runSql, saveDb };
