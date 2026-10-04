import { useAuth, useUser } from '@clerk/react'

// Premium = active Clerk Billing "premium" plan OR publicMetadata.plan === 'premium' (manual grant).
export const useIsPremium = () => {
  const { has } = useAuth()
  const { user } = useUser()
  return Boolean(has?.({ plan: 'premium' }) || user?.publicMetadata?.plan === 'premium')
}
