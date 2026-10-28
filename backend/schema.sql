-- =============================================
-- Club Management System Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS club_management;
USE club_management;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  club_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  date DATE NOT NULL,
  time VARCHAR(50) NULL,
  venue VARCHAR(255) NULL,
  event_type VARCHAR(100) NULL,
  coordinator_name VARCHAR(255) NULL,
  sponsors VARCHAR(255) NULL,
  fee DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'upcoming',
  is_competition BOOLEAN DEFAULT FALSE,
  registration_count INT DEFAULT 0,
  created_by INT NULL,
  results_declared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  student_id VARCHAR(100) NULL,
  payment_id VARCHAR(255) NULL,
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  status VARCHAR(50) DEFAULT 'registered',
  position VARCHAR(50) DEFAULT 'participant',
  certificate_sent BOOLEAN DEFAULT FALSE,
  certificate_path VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Event Registrations Table (Auxiliary)
CREATE TABLE IF NOT EXISTS event_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  student_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Initial Seed Data for Demo & Testing
INSERT IGNORE INTO clubs (id, name, description, password) VALUES
(1, 'Coding & Algorithms Club', 'Competitive coding, hackathons, and software engineering workshops.', '$2b$10$wTf258eLhyCj5b6XmXU8Uu834EhyhY2eI84Qk3QfE8k58zLgX8sde'),
(2, 'Robotics & AI Club', 'Autonomous robotics, hardware prototyping, and machine learning.', '$2b$10$wTf258eLhyCj5b6XmXU8Uu834EhyhY2eI84Qk3QfE8k58zLgX8sde'),
(3, 'Design & Arts Society', 'UI/UX design, visual branding, and digital media.', '$2b$10$wTf258eLhyCj5b6XmXU8Uu834EhyhY2eI84Qk3QfE8k58zLgX8sde');

INSERT IGNORE INTO events (id, club_id, title, description, date, time, venue, event_type, coordinator_name, sponsors, fee, status, is_competition, registration_count, created_by, results_declared) VALUES
(1, 1, 'National Hackathon 2026', '24-hour innovation hackathon to build intelligent AI student platforms.', '2026-11-20', '10:00 AM', 'Main Auditorium', 'Hackathon', 'Dr. Sarah Rao', 'Google Cloud', 0.00, 'upcoming', 1, 1, NULL, 0),
(2, 2, 'RoboWars & Drone Race', 'Battle of combat bots and high-speed obstacle drone flight.', '2026-12-05', '02:00 PM', 'Indoor Arena', 'Competition', 'Prof. Arvind K', 'RoboLabs', 150.00, 'upcoming', 1, 0, NULL, 0),
(3, 3, 'UI/UX Design Sprint', 'Hands-on product design sprint with Figma and design systems.', '2026-12-15', '11:00 AM', 'Design Studio 3', 'Workshop', 'Priya Nair', 'DesignHub', 0.00, 'upcoming', 0, 0, NULL, 0),
(4, 1, 'CodeMaster Cup 2025', 'Annual algorithmic problem solving and competitive coding cup.', '2025-10-10', '09:00 AM', 'CS Lab 101', 'Contest', 'Dr. Sarah Rao', 'CodeHub', 0.00, 'past', 1, 3, NULL, 1);
