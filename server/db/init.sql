-- Create the User table
CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    otp VARCHAR(255),
    otpexpiry TIMESTAMP
);

-- Create the Role table
CREATE TABLE "Role" (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(255) UNIQUE NOT NULL
);

-- Create the UserRoles table (junction table)
CREATE TABLE "UserRoles" (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES "Role"(role_id) ON DELETE CASCADE
);

-- Create the ScanType enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScanType') THEN
        CREATE TYPE "ScanType" AS ENUM ('passive', 'active');
    END IF;
END $$;

-- Create the Report table
CREATE TABLE "Report" (
    report_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- Create the Scan table
CREATE TABLE "Scan" (
    scan_id SERIAL PRIMARY KEY,
    url_or_ip VARCHAR(255) NOT NULL,
    scan_type "ScanType" NOT NULL, -- Use the ScanType enum
    scan_category VARCHAR(50),     -- New column for categorizing scans (e.g., social, web, etc.)
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    report_id INT,
    scan_results JSON,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES "Report"(report_id) ON DELETE SET NULL
);

-- Create an index on scan_type and scan_category to optimize filtering
CREATE INDEX IF NOT EXISTS "idx_scan_type_category" ON "Scan" ("scan_type", "scan_category");

-- Create the Vulnerability table
CREATE TABLE "Vulnerability" (
    vulnerability_id SERIAL PRIMARY KEY,
    cve VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    cvss_score FLOAT NOT NULL
);

-- Create the ScanVulnerabilities table (junction table)
CREATE TABLE "ScanVulnerabilities" (
    scan_id INT NOT NULL,
    vulnerability_id INT NOT NULL,
    recommendation TEXT NOT NULL,
    PRIMARY KEY (scan_id, vulnerability_id),
    FOREIGN KEY (scan_id) REFERENCES "Scan"(scan_id) ON DELETE CASCADE,
    FOREIGN KEY (vulnerability_id) REFERENCES "Vulnerability"(vulnerability_id) ON DELETE CASCADE
);

-- Create the Log table
CREATE TABLE "Log" (
    log_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);
