export const GOOGLE_OAUTH_COOKIE = 'twsms_google_oauth'

export function getGoogleOAuthConfig(requestUrl: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return null
  }

  return {
    clientId,
    clientSecret,
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      new URL('/api/auth/google/callback', requestUrl).toString(),
  }
}
