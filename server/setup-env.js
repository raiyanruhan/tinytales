import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '.env');

if (!existsSync(envPath)) {
  const envContent = `JWT_SECRET=tinytales-secret-key-2024-change-in-production
SMTP_HOST=mail.heemsbd.com
SMTP_PORT=465
SMTP_USER=tinytales@heemsbd.com
SMTP_PASS=Uk1Rd;tyokQvD.9w
NODE_ENV=development
PORT=3001
`;

  writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('⚠️  .env file already exists. Skipping creation.');
  console.log('If you need to update the password, edit server/.env manually.');
}




