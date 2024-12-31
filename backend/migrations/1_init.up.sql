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

-- Create Properties table
CREATE TABLE IF NOT EXISTS properties (
    property_id VARCHAR(255) PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    postal_code_suffix VARCHAR(10),
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- id INT AUTO_INCREMENT PRIMARY KEY,
    -- address VARCHAR(255) NOT NULL,
    -- city VARCHAR(100) NOT NULL,
    -- state VARCHAR(50) NOT NULL,
    -- zip_code VARCHAR(20) NOT NULL,
    -- owner_id INT NOT NULL,
    -- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Inspections table
CREATE TABLE IF NOT EXISTS inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    inspector_id INT NOT NULL,
    inspection_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    -- FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    -- FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Inspection Reports table
CREATE TABLE IF NOT EXISTS inspection_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id INT NOT NULL,
    report TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS addresses (
    property_id VARCHAR(255) PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    postal_code_suffix VARCHAR(10),
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add initial data if needed
INSERT INTO users (name, email, password_hash) VALUES
('Admin User', 'admin@example.com', 'hashed_password_here');
