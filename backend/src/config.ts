import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Determine which environment file to load
const env = process.env.NODE_ENV || 'development'

// Load environment-specific .env file
const envFile = path.resolve(__dirname, '..', `.env.${env}`)

console.log(`Loading environment from: ${path.basename(envFile)}`)

const result = dotenv.config({ path: envFile })

if (result.error) {
  console.warn(`Warning: Could not load ${envFile}:`, result.error.message)
}

// Optional: Load .env.local for local overrides (don't commit this)
const localEnvFile = path.resolve(__dirname, '..', '.env.local')
const localResult = dotenv.config({ path: localEnvFile })
if (!localResult.error) {
  console.log('Loaded local overrides from .env.local')
}

export default result
