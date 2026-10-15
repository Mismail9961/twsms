import nextEnv from '@next/env'
import { fileURLToPath } from 'node:url'

export { emailConfigurationIssues } from '../lib/email/config.mjs'
export function loadEmailEnv() {
  const root = fileURLToPath(new URL('../', import.meta.url))
  nextEnv.loadEnvConfig(root, process.env.NODE_ENV !== 'production')
}
