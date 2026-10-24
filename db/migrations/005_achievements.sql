CREATE TABLE IF NOT EXISTS achievements (
  slot smallint PRIMARY KEY CHECK (slot BETWEEN 1 AND 5),
  achievement_date date NOT NULL,
  category text NOT NULL CHECK (length(trim(category)) BETWEEN 1 AND 80),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  description text NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 2000)
);

INSERT INTO achievements (slot, achievement_date, category, title, description) VALUES
(1, '2026-10-19', 'Migration', 'Multi-floor office network migrated with zero working-hours downtime', 'Planned and executed a full cutover to new switching infrastructure, completed overnight and verified before the team arrived.'),
(2, '2026-10-20', 'Security', 'Firewall upgrade for a retail client', 'Replaced legacy firewalls and applied a new access policy across all branches.'),
(3, '2026-10-22', 'Audit', 'Network audit report delivered', 'Documented topology, identified bottlenecks and handed over a prioritized fix list.'),
(4, '2026-10-23', 'Supplies', 'Hardware order fulfilled early', 'Switches, access points and structured cabling supplied ahead of schedule.'),
(5, '2026-10-24', 'Support', 'Wi-Fi coverage optimized', 'Dead zones resolved through a channel and access point placement redesign.')
ON CONFLICT (slot) DO NOTHING;
