-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'customer', 'inspector', 'subscriber', 'contractor') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash) VALUES
('Admin User', 'admin@example.com', 'hashed_password_here');

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
    -- FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO properties (
    property_id, street, city, state, postal_code, postal_code_suffix, country
) VALUES (
    'TX782610001', '21930 Akin Bayou', 'San Antonio', 'TX', '78261', NULL, 'US'
);


-- Create Inspection Reports table
CREATE TABLE IF NOT EXISTS inspection_forms (
    form_id CHAR(36) PRIMARY KEY, -- Use CHAR(36) to store UUIDs
    property_id VARCHAR(255) NOT NULL, -- Foreign key
    inspection_date DATE,
    form_data JSON, -- Use JSON type in MySQL 8.0 (JSONB is for PostgreSQL)
    status VARCHAR(50) DEFAULT 'in-progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id)
);

INSERT INTO inspection_forms (
    form_id, property_id, inspection_date, form_data, status
) VALUES (
    UUID(), 'TX782610001', '2024-01-01', '{"room_count": 5}', 'in-progress'
);