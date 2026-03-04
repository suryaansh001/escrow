import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('🔄 Starting database migration...\n');
    
    // Read the schema file and remove TimescaleDB-specific lines
    const schemaPath = path.join(__dirname, '../db.txt');
    let schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Remove TimescaleDB lines
    schema = schema
      .split('\n')
      .filter(line => !line.includes('CREATE EXTENSION IF NOT EXISTS timescaledb') && !line.includes('create_hypertable'))
      .join('\n');
    
    // Execute the entire schema
    await sql.unsafe(schema);
    
    console.log('✅ Database schema created successfully!\n');
    
    // Verify tables were created
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`📊 Created ${tables.length} tables:\n`);
    tables.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.table_name}`);
    });
    
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
