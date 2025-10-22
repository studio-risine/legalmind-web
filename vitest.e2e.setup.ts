import { beforeAll, afterAll, beforeEach } from 'vitest'
import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })

if (process.env.NODE_ENV !== 'test') {
  throw new Error('E2E tests must run with NODE_ENV=test')
}

beforeAll(async () => {
  console.log('Starting E2E test suite...')
  console.log('Database:', process.env.DATABASE_URL)

  // TODO: Setup test database, clear data, run migrations
  // This will be implemented when we add actual E2E tests
})

beforeEach(async () => {
  // TODO: Reset database state before each test
  // This ensures test isolation
})

afterAll(async () => {
  console.log('✅ E2E test suite completed')
  // TODO: Cleanup test database
})
