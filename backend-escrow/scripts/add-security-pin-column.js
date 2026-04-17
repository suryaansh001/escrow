import { sql } from '../src/config/db.js';

async function addSecurityPinColumn() {
    try {
        console.log('Adding security_pin_hash column to users table...');

        await sql`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS security_pin_hash TEXT
        `;

        console.log('✅ Security PIN column added successfully');
    } catch (error) {
        console.error('❌ Error adding security PIN column:', error);
        throw error;
    }
}

addSecurityPinColumn()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });