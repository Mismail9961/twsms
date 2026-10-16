export const GOOGLE_OAUTH_COOKIE = 'twsms_google_oauth'

export function getGoogleOAuthConfig(request: Request | string) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) return null

  try {
    const origin = new URL(typeof request === 'string' ? request : request.url)
    const callback = new URL(process.env.GOOGLE_REDIRECT_URI?.trim() || '/api/auth/google/callback', origin)
    if (callback.username || callback.password || callback.search || callback.hash ||
      callback.pathname !== '/api/auth/google/callback' ||
      (callback.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && callback.protocol === 'http:' && callback.hostname === 'localhost'))) return null
    return { clientId, clientSecret, redirectUri: callback.toString() }
  } catch {
    return null
  }
}
