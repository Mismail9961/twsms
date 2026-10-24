export interface Achievement {
  slot: number
  date: string
  category: string
  title: string
  description: string
}

export const MAX_ACHIEVEMENTS = 5

export const defaultAchievements: Achievement[] = [
  { slot: 1, date: '2026-10-19', category: 'Migration', title: 'Multi-floor office network migrated with zero working-hours downtime', description: 'Planned and executed a full cutover to new switching infrastructure, completed overnight and verified before the team arrived.' },
  { slot: 2, date: '2026-10-20', category: 'Security', title: 'Firewall upgrade for a retail client', description: 'Replaced legacy firewalls and applied a new access policy across all branches.' },
  { slot: 3, date: '2026-10-22', category: 'Audit', title: 'Network audit report delivered', description: 'Documented topology, identified bottlenecks and handed over a prioritized fix list.' },
  { slot: 4, date: '2026-10-23', category: 'Supplies', title: 'Hardware order fulfilled early', description: 'Switches, access points and structured cabling supplied ahead of schedule.' },
  { slot: 5, date: '2026-10-24', category: 'Support', title: 'Wi-Fi coverage optimized', description: 'Dead zones resolved through a channel and access point placement redesign.' },
]
