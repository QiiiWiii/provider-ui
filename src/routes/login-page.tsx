import { useLocation, useNavigate } from 'react-router'

import { AuthPageLayout } from '@/components/layout/auth-page-layout'
import { CredentialsForm } from '@/features/auth/credentials-form'
import { readAuthReturnTo } from '@/features/auth/auth-navigation'
import { establishAuthSession } from '@/features/auth/auth-session'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const invitationToken = readInvitationToken(location.hash)
  const mode = invitationToken ? 'register' : 'login'

  return (
    <AuthPageLayout>
      <CredentialsForm
        key={mode}
        mode={mode}
        invitationToken={invitationToken}
        onSuccess={(user) => {
          establishAuthSession(user)
          navigate(readAuthReturnTo(location.state), { replace: true })
        }}
      />
    </AuthPageLayout>
  )
}

function readInvitationToken(hash: string): string {
  if (!hash.startsWith('#')) return ''
  return new URLSearchParams(hash.slice(1)).get('invite')?.trim() ?? ''
}
