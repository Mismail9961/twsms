export const GOOGLE_OAUTH_COOKIE = 'twsms_google_oauth'

export function getGoogleOAuthConfig(request: Request | string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return null
  }

  let redirectUri = process.env.GOOGLE_REDIRECT_URI
  if (!redirectUri) {
    if (typeof request === 'string') {
      redirectUri = new URL('/api/auth/google/callback', request).toString()
    } else {
      const proto =
        request.headers.get('x-forwarded-proto') ||
        (request.url.startsWith('https') ? 'https' : 'http')
      const host =
        request.headers.get('x-forwarded-host') ||
        request.headers.get('host') ||
        new URL(request.url).host
      redirectUri = `${proto}://${host}/api/auth/google/callback`
    }
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  }
}
