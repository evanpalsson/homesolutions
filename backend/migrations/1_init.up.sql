-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT,
    user_type ENUM('admin', 'inspector', 'homeowner') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE inspectors (
    inspector_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Properties table
CREATE TABLE IF NOT EXISTS properties (
    property_id VARCHAR(255) PRIMARY KEY,
    owner_id INT,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    postal_code_suffix VARCHAR(10),
    country VARCHAR(100) NOT NULL,
    year_built INT,
    square_footage INT,
    bedrooms INT,
    bathrooms DECIMAL(3,1),
    lot_size DECIMAL(10,2),
    property_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Inspection Reports table
CREATE TABLE IF NOT EXISTS inspections (
    inspection_id CHAR(36) PRIMARY KEY, -- Use CHAR(36) to store UUIDs
    property_id VARCHAR(255) NOT NULL, -- Foreign key
    report_id VARCHAR(255) UNIQUE,
    inspection_date DATE,
    status VARCHAR(50) DEFAULT 'in-progress',
    temperature INT NULL, -- Outside temperature during inspection
    weather VARCHAR(50), -- Weather condition
    ground_condition VARCHAR(50), -- Ground/soil surface condition
    rain_last_three_days BOOLEAN,
    radon_test BOOLEAN,
    mold_test BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_exterior (
    inspection_id VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON NOT NULL,
    conditions JSON NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id)
);

CREATE TABLE IF NOT EXISTS inspection_roof (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_basementFoundation (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_heating (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_cooling (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_plumbing (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_electrical (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_attic (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_doorsWindows (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_fireplace (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_systemsComponents (
    inspection_id VARCHAR(36),
    item_name VARCHAR(255),
    inspection_status VARCHAR(50) DEFAULT 'Not Inspected',
    materials JSON,
    conditions JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item (inspection_id, item_name),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_photos (
  photo_id INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  photo_url VARCHAR(1024) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id),
  INDEX idx_inspection_item (inspection_id, item_name)
);

CREATE TABLE IF NOT EXISTS property_photos (
  photo_id VARCHAR(255) PRIMARY KEY,
  inspection_id VARCHAR(255),
  photo_url TEXT NOT NULL,
  uploaded_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS invitations (
  invite_id CHAR(36) PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  user_type ENUM('inspector') NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  accepted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS inspection_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id VARCHAR(36),
    analysis_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (inspection_id),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id)
);

-- Clean up previous entries
DELETE FROM inspection_roof WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_exterior WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_basementFoundation WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_heating WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_cooling WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_plumbing WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_electrical WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_attic WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_doorsWindows WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_fireplace WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspection_systemsComponents WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM inspections WHERE inspection_id = '9c729b07-0fff-48e1-965a-11a97bd359b3';
DELETE FROM properties WHERE property_id = 'TX782610001';

-- Insert dummy property
INSERT INTO properties (
    property_id, street, city, state, postal_code, postal_code_suffix, country,
    year_built, square_footage, bedrooms, bathrooms, lot_size, property_type
) VALUES (
    'TX782610001', '123 Mockingbird Lane', 'Testville',
    'TX', '75001', '1234',
    'US', 1993, 1501,
    4, 2.1, 0.9,
    'Single-Family'
);

-- Insert inspection with report_id
INSERT INTO inspections (
  inspection_id, property_id, report_id, inspection_date, status, temperature, weather, ground_condition, rain_last_three_days, radon_test, mold_test
) VALUES (
  '9c729b07-0fff-48e1-965a-11a97bd359b3',
  'TX782610001',
  'TX782610001-1',
  CURDATE(),
  'completed',
  72, 'Sunny', 'Dry',
  FALSE, FALSE, FALSE
);


-- Insert inspection
INSERT INTO inspection_roof (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Roof Covering', 'Inspected', JSON_OBJECT('Asphalt Shingles', TRUE), JSON_OBJECT('Worn', TRUE), 'Noted issues: Worn observed on roof covering.');
INSERT INTO inspection_roof (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Gutters', 'Inspected', JSON_OBJECT('Aluminum', TRUE, 'Copper', TRUE), JSON_OBJECT('Blocked', TRUE), 'Noted issues: Blocked observed on gutters.');
INSERT INTO inspection_exterior (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Porch', 'Inspected', JSON_OBJECT('Wood', TRUE, 'Concrete', TRUE), JSON_OBJECT('Loose Railings', TRUE), 'Noted issues: Loose Railings observed on porch.');
INSERT INTO inspection_exterior (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Windows', 'Inspected', JSON_OBJECT('Vinyl', TRUE), JSON_OBJECT('Cracked Pane', TRUE), 'Noted issues: Cracked Pane observed on windows.');
INSERT INTO inspection_basementFoundation (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Foundation Walls', 'Inspected', JSON_OBJECT('Concrete', TRUE), JSON_OBJECT('Cracks', TRUE), 'Noted issues: Cracks observed on foundation walls.');
INSERT INTO inspection_basementFoundation (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Sump Pump', 'Inspected', JSON_OBJECT('Present', TRUE), JSON_OBJECT('Rusting', TRUE), 'Noted issues: Rusting observed on sump pump.');
INSERT INTO inspection_heating (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Furnace', 'Inspected', JSON_OBJECT('Electric', TRUE), JSON_OBJECT('Short Cycling', TRUE, 'No Heat', TRUE), 'Noted issues: Short Cycling, No Heat observed on furnace.');
INSERT INTO inspection_heating (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Thermostat', 'Inspected', JSON_OBJECT('Programmable', TRUE), JSON_OBJECT('Unresponsive', TRUE), 'Noted issues: Unresponsive observed on thermostat.');
INSERT INTO inspection_cooling (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'AC Condenser', 'Inspected', JSON_OBJECT('Split System', TRUE), JSON_OBJECT('Leaking Refrigerant', TRUE), 'Noted issues: Leaking Refrigerant observed on ac condenser.');
INSERT INTO inspection_cooling (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Thermostat', 'Inspected', JSON_OBJECT('Digital', TRUE), JSON_OBJECT('Out of Calibration', TRUE), 'Noted issues: Out of Calibration observed on thermostat.');
INSERT INTO inspection_plumbing (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Water Heater', 'Inspected', JSON_OBJECT('Tank', TRUE, 'Tankless', TRUE), JSON_OBJECT('No Hot Water', TRUE, 'Leaking Tank', TRUE), 'Noted issues: No Hot Water, Leaking Tank observed on water heater.');
INSERT INTO inspection_plumbing (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Pipes', 'Inspected', JSON_OBJECT('Copper', TRUE), JSON_OBJECT('Loose Fittings', TRUE, 'Corrosion', TRUE), 'Noted issues: Loose Fittings, Corrosion observed on pipes.');
INSERT INTO inspection_electrical (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Main Panel', 'Inspected', JSON_OBJECT('Circuit Breakers', TRUE), JSON_OBJECT('Missing Knockouts', TRUE, 'Overfusing', TRUE), 'Noted issues: Missing Knockouts, Overfusing observed on main panel.');
INSERT INTO inspection_electrical (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Outlets', 'Inspected', JSON_OBJECT('Standard', TRUE), JSON_OBJECT('Reverse Polarity', TRUE, 'No Ground', TRUE), 'Noted issues: Reverse Polarity, No Ground observed on outlets.');
INSERT INTO inspection_attic (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Ventilation', 'Inspected', JSON_OBJECT('Ridge Vent', TRUE), JSON_OBJECT('Inadequate', TRUE), 'Noted issues: Inadequate observed on ventilation.');
INSERT INTO inspection_attic (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Insulation', 'Inspected', JSON_OBJECT('Fiberglass', TRUE, 'Cellulose', TRUE), JSON_OBJECT('Missing', TRUE, 'Compacted', TRUE), 'Noted issues: Missing, Compacted observed on insulation.');
INSERT INTO inspection_doorsWindows (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Front Door', 'Inspected', JSON_OBJECT('Steel', TRUE, 'Wood', TRUE), JSON_OBJECT('Loose Hinges', TRUE), 'Noted issues: Loose Hinges observed on front door.');
INSERT INTO inspection_doorsWindows (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Windows', 'Inspected', JSON_OBJECT('Double Pane', TRUE), JSON_OBJECT('Fogged', TRUE, 'Stuck', TRUE), 'Noted issues: Fogged, Stuck observed on windows.');
INSERT INTO inspection_fireplace (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Chimney', 'Inspected', JSON_OBJECT('Stone', TRUE), JSON_OBJECT('No Cap', TRUE, 'Cracked Crown', TRUE), 'Noted issues: No Cap, Cracked Crown observed on chimney.');
INSERT INTO inspection_fireplace (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Firebox', 'Inspected', JSON_OBJECT('Masonry', TRUE, 'Prefab', TRUE), JSON_OBJECT('Damaged Lining', TRUE), 'Noted issues: Damaged Lining observed on firebox.');
INSERT INTO inspection_systemsComponents (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Garage Door', 'Inspected', JSON_OBJECT('Automatic', TRUE), JSON_OBJECT('Sensor Misaligned', TRUE, 'No Reverse', TRUE), 'Noted issues: Sensor Misaligned, No Reverse observed on garage door.');
INSERT INTO inspection_systemsComponents (inspection_id, item_name, inspection_status, materials, conditions, comments)
VALUES ('9c729b07-0fff-48e1-965a-11a97bd359b3', 'Smoke Detectors', 'Inspected', JSON_OBJECT('Present', TRUE), JSON_OBJECT('Nonfunctional', TRUE), 'Noted issues: Nonfunctional observed on smoke detectors.');


