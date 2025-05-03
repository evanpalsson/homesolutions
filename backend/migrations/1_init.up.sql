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
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    postal_code_suffix VARCHAR(10),
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_properties (
    user_property_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id VARCHAR(255) NOT NULL,
    personal_data JSON DEFAULT NULL,
    shared BOOLEAN DEFAULT FALSE,
    year_built INT,
    square_footage INT,
    bedrooms INT,
    bathrooms DECIMAL(3,1),
    lot_size DECIMAL(10,2),
    property_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    UNIQUE KEY unique_user_property (user_id, property_id)
);

-- Create Inspection Reports table
CREATE TABLE IF NOT EXISTS inspections (
    inspection_id CHAR(36) PRIMARY KEY, -- Use CHAR(36) to store UUIDs
    property_id VARCHAR(255) NOT NULL, -- Foreign key
    customer_id INT NOT NULL, -- references users.user_id
    inspector_id INT NOT NULL, -- references inspectors.inspector_id
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
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES inspectors(inspector_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id CHAR(36) PRIMARY KEY,  -- UUID for consistency
    inspection_id CHAR(36) NOT NULL,  -- clearly linked to inspections
    customer_id INT NOT NULL,         -- who owes the payment
    inspector_id INT NOT NULL,        -- who performed the inspection
    amount DECIMAL(10, 2) NOT NULL,   -- inspection fee
    status ENUM('unpaid', 'paid', 'refunded', 'cancelled') DEFAULT 'unpaid',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP NULL,           -- timestamp when payment completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES inspectors(inspector_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inspection_invitations (
    invite_token CHAR(36) PRIMARY KEY,
    inspection_id CHAR(36) NOT NULL,
    email VARCHAR(100) NOT NULL,
    invited_by INT NULL, -- ✅ Changed from NOT NULL to NULL
    accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY)),
    FOREIGN KEY (inspection_id) REFERENCES inspections(inspection_id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(user_id) ON DELETE SET NULL
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

CREATE TABLE IF NOT EXISTS home_health_score (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id VARCHAR(36) NOT NULL,
    inspection_id VARCHAR(36), -- nullable, in case tied to a specific inspection
    score DECIMAL(5,2) NOT NULL, -- example: 87.45
    breakdown JSON, -- full JSON map like {"Roof": 90.0, "Plumbing": 78.5, ...}
    source ENUM('professional', 'diy') DEFAULT 'professional', -- type of inspection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id)
);