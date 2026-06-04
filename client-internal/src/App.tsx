import { useEffect, useMemo, useState } from 'react'

import loginHtml from './stitch-pages/internal_staff_login_1.html?raw'
import receptionistDashboardHtml from './stitch-pages/receptionist_landing_page.html?raw'

type StaffRole = 'receptionist'

type DummySession = {
  role: StaffRole
}

const sessionKey = 'vetconnect-internal-dummy-session'

function addDummyLoginHandler(html: string) {
  return html.replace(
    '</body>',
    `<script>
      const form = document.querySelector('form');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          window.parent.postMessage({ type: 'vetconnect:dummy-login', role: 'receptionist' }, '*');
        });
      }
    </script></body>`,
  )
}

function readSavedSession(): DummySession | null {
  const savedSession = window.localStorage.getItem(sessionKey)

  if (!savedSession) {
    return null
  }

  try {
    return JSON.parse(savedSession) as DummySession
  } catch {
    window.localStorage.removeItem(sessionKey)
    return null
  }
}

function App() {
  const [session, setSession] = useState<DummySession | null>(() => readSavedSession())
  const loginScreen = useMemo(() => addDummyLoginHandler(loginHtml), [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'vetconnect:dummy-login') {
        return
      }

      const nextSession: DummySession = { role: 'receptionist' }
      window.localStorage.setItem(sessionKey, JSON.stringify(nextSession))
      setSession(nextSession)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <iframe
      className="app-frame"
      title="VetConnect Internal Portal"
      srcDoc={session ? receptionistDashboardHtml : loginScreen}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  )
}

export default App
