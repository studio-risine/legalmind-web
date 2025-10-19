import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/modules/account/utils/get-current-account', () => ({
  getCurrentAccountId: vi.fn().mockResolvedValue(1),
}))

vi.mock('sonner', () => {
  const success = vi.fn()
  const error = vi.fn()
  const toastFn = vi.fn()
  return { toast: Object.assign(toastFn, { success, error }) }
})
