// AI-assisted: see AI-ATTRIBUTION.md
import { useParams } from 'react-router'
import { ComingSoon } from '../../components/ComingSoon'
import { useSession } from '../../data/auth'

export function PlayerProfilePage() {
  const { username } = useParams()
  const { profile } = useSession()
  const title = username === profile?.username ? 'My Profile' : `Player Profile: ${username ?? ''}`
  return <ComingSoon page={title} />
}
