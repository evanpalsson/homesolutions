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
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO properties (
    property_id, street, city, state, postal_code, postal_code_suffix, country
) VALUES (
    'TX782610001', '21930 Akin Bayou', 'San Antonio', 'TX', '78261', '4424', 'US'
);


-- Create Inspection Reports table
CREATE TABLE IF NOT EXISTS inspection_forms (
    inspection_id CHAR(36) PRIMARY KEY, -- Use CHAR(36) to store UUIDs
    property_id VARCHAR(255) NOT NULL, -- Foreign key
    inspection_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'in-progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

INSERT INTO inspection_forms (
    inspection_id, property_id, inspection_date, status
) VALUES (
    UUID(), 'TX782610001', '2024-01-01', 'in-progress'
);