import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '.env');

if (!existsSync(envPath)) {
  const envContent = `JWT_SECRET=tinytales-secret-key-2024-change-in-production
SMTP_HOST=mail.tinytalesearth.com
SMTP_PORT=465
SMTP_USER=no-reply@tinytalesearth.com
SMTP_PASS=tinytales@@
NODE_ENV=development
PORT=3001
`;

  writeFileSync(envPath, envContent);
  console.log(' .env file created successfully with email configuration!');
  console.log('📧 Email configured: no-reply@tinytalesearth.com');
} else {
  console.log('⚠️  .env file already exists. Skipping creation.');
  console.log('If you need to update email credentials, edit server/.env manually.');
  console.log('Current email settings:');
  console.log('  SMTP_HOST: mail.tinytalesearth.com');
  console.log('  SMTP_PORT: 465');
  console.log('  SMTP_USER: no-reply@tinytalesearth.com');
}




