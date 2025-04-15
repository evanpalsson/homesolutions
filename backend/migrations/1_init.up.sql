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

INSERT INTO properties (
    property_id, street, city, state, postal_code, postal_code_suffix, country
) VALUES (
    'TX782610001', '21930 Akin Bayou', 'San Antonio', 'TX', '78261', '4424', 'US'
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

INSERT INTO inspections (
    inspection_id, property_id, inspection_date, status
) VALUES (
    UUID(), 'TX782610001', '2024-01-01', 'in-progress'
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
    PRIMARY KEY (inspection_id, item_name), -- Composite primary key
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
    PRIMARY KEY (inspection_id, item_name),
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
    PRIMARY KEY (inspection_id, item_name),
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
    PRIMARY KEY (inspection_id, item_name),
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
    PRIMARY KEY (inspection_id, item_name),
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
    PRIMARY KEY (inspection_id, item_name),
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
    PRIMARY KEY (inspection_id, item_name),
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
    PRIMARY KEY (inspection_id, item_name),
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
    PRIMARY KEY (inspection_id, item_name),
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
    PRIMARY KEY (inspection_id, item_name),
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
    PRIMARY KEY (inspection_id, item_name),
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

CREATE TABLE property_photos (
  photo_id VARCHAR(255) PRIMARY KEY,
  inspection_id VARCHAR(255),
  photo_url TEXT NOT NULL,
  uploaded_at DATETIME NOT NULL
);

CREATE TABLE invitations (
  invite_id CHAR(36) PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  user_type ENUM('inspector') NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  accepted BOOLEAN DEFAULT FALSE
);
