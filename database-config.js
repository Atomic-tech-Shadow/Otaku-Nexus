// Database Configuration and Environment Variables Manager
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration object
const databaseConfig = {
  // PostgreSQL Connection Details
  connection: {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'replit',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    url: process.env.DATABASE_URL || `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`
  },
  
  // Application Configuration
  app: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'development-jwt-secret-change-in-production',
    sessionSecret: process.env.SESSION_SECRET || 'development-session-secret-change-in-production'
  },
  
  // Replit Configuration
  replit: {
    replId: process.env.REPL_ID || '',
    domains: process.env.REPLIT_DOMAINS || '',
    issuerUrl: process.env.ISSUER_URL || 'https://replit.com/oidc'
  },
  
  // Admin Configuration
  admin: {
    userId: process.env.ADMIN_USER_ID || 'sorokomarco@gmail.com'
  }
};

// Function to validate required environment variables
function validateEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'PGHOST',
    'PGPORT',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}

// Function to display current configuration
function displayConfiguration() {
  console.log('\n🔧 Current Database Configuration:');
  console.log('=====================================');
  console.log(`Host: ${databaseConfig.connection.host}`);
  console.log(`Port: ${databaseConfig.connection.port}`);
  console.log(`Database: ${databaseConfig.connection.database}`);
  console.log(`User: ${databaseConfig.connection.user}`);
  console.log(`Password: ${databaseConfig.connection.password ? '***' : 'Not set'}`);
  console.log(`URL: ${databaseConfig.connection.url ? databaseConfig.connection.url.replace(/:[^:]*@/, ':***@') : 'Not set'}`);
  
  console.log('\n🚀 Application Configuration:');
  console.log('==============================');
  console.log(`Port: ${databaseConfig.app.port}`);
  console.log(`Environment: ${databaseConfig.app.nodeEnv}`);
  console.log(`JWT Secret: ${databaseConfig.app.jwtSecret ? '***' : 'Not set'}`);
  console.log(`Session Secret: ${databaseConfig.app.sessionSecret ? '***' : 'Not set'}`);
  
  console.log('\n👤 Admin Configuration:');
  console.log('========================');
  console.log(`Admin User: ${databaseConfig.admin.userId}`);
  console.log('\n');
}

// Function to create/update .env file with current environment variables
function saveEnvironmentVariables() {
  const envContent = `# Database Configuration
DATABASE_URL=${process.env.DATABASE_URL || ''}
PGHOST=${process.env.PGHOST || ''}
PGPORT=${process.env.PGPORT || ''}
PGUSER=${process.env.PGUSER || ''}
PGPASSWORD=${process.env.PGPASSWORD || ''}
PGDATABASE=${process.env.PGDATABASE || ''}

# Authentication & Security
JWT_SECRET=${process.env.JWT_SECRET || 'development-jwt-secret-change-in-production'}
SESSION_SECRET=${process.env.SESSION_SECRET || 'development-session-secret-change-in-production'}

# Replit Configuration
REPL_ID=${process.env.REPL_ID || ''}
REPLIT_DOMAINS=${process.env.REPLIT_DOMAINS || ''}
ISSUER_URL=${process.env.ISSUER_URL || 'https://replit.com/oidc'}

# Admin Configuration
ADMIN_USER_ID=${process.env.ADMIN_USER_ID || 'sorokomarco@gmail.com'}

# Application Environment
NODE_ENV=${process.env.NODE_ENV || 'development'}
PORT=${process.env.PORT || '5000'}

# Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Environment variables saved to .env file');
}

// Export configuration and functions
export {
  databaseConfig,
  validateEnvironmentVariables,
  displayConfiguration,
  saveEnvironmentVariables
};

// If this file is run directly, execute configuration check
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔍 Checking database configuration...\n');
  
  if (validateEnvironmentVariables()) {
    displayConfiguration();
    saveEnvironmentVariables();
    console.log('🎉 Database configuration completed successfully!');
  } else {
    console.log('❌ Database configuration failed. Please check your environment variables.');
    process.exit(1);
  }
}