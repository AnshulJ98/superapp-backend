-- Create superapp user and database
CREATE USER superapp WITH PASSWORD 'superapp_dev';
CREATE DATABASE superapp_db OWNER superapp;
GRANT ALL PRIVILEGES ON DATABASE superapp_db TO superapp;
