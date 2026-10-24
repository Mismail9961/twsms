import React from "react";

/**
 * StrategicPartners
 * - Logos load from /public (change LOGO_BASE for a sub-folder).
 * - variant="dark"  (default): #2c2772 card with white tiles, logos in original colours.
 * - variant="light": white card, logos in their original colours.
 * - Works from 320px (iPhone 5s) up. Plain fallbacks sit before every clamp()
 *   because iOS 12 Safari does not support it.
 */

type Partner = { name: string; logo: string; h: number };

const PARTNERS: Partner[] = [
  { name: "Fortinet", logo: "fortinet.png", h: 24 },
  { name: "Barracuda", logo: "barracuda.png", h: 54 },
  { name: "HP", logo: "hp.png", h: 54 },
  { name: "Kaspersky", logo: "kaspersky.png", h: 32 },
  { name: "Citrix", logo: "citrix.png", h: 40 },
  { name: "Grandstream", logo: "grandstream.png", h: 66 },
  { name: "F5", logo: "f5.png", h: 54 },
  { name: "Dell Technologies", logo: "dell.png", h: 26 },
  { name: "Lenovo", logo: "lenovo.png", h: 32 },
  { name: "Sophos", logo: "sophos.png", h: 66 },
  { name: "3M", logo: "3m.png", h: 44 },
  { name: "Vivanco", logo: "vivanco.png", h: 22 },
  { name: "Synology", logo: "synology.png", h: 38 },
  { name: "Palo Alto Networks", logo: "paloalto.png", h: 36 },
  { name: "Microsoft", logo: "microsoft.png", h: 44 },
];

const LOGO_BASE = "/";
const BRAND = "#2c2772";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap');

.sp {
  --brand: ${BRAND};
  --k: .64;
  --cols: 2;
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  background: #fff;
  padding: 32px 12px;
}
.sp *, .sp *::before, .sp *::after { box-sizing: border-box; }

/* ---------- card ---------- */
.sp__card {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  padding: 36px 16px 20px;
  border-radius: 20px;
  overflow: hidden;
  color: #fff;
  background: #2c2772;
  background:
    radial-gradient(520px 260px at 50% 0%, rgba(255,255,255,.14), rgba(255,255,255,0) 70%),
    linear-gradient(165deg, #342e8a 0%, #2c2772 45%, #1c1853 100%);
  box-shadow: 0 40px 80px -40px rgba(44,39,114,.6);
}
.sp__card::before {
  content: "";
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background-image: radial-gradient(rgba(255,255,255,.12) 1px, rgba(255,255,255,0) 1.5px);
  background-size: 24px 24px;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 55%);
  mask-image: linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 55%);
  pointer-events: none;
}
.sp__card > * { position: relative; }

/* ---------- header ---------- */
.sp__head { text-align: center; max-width: 640px; margin: 0 auto 28px; }
.sp__title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #fff;
}
.sp__title::after {
  content: "";
  display: block;
  width: 44px; height: 3px;
  margin: 16px auto 0;
  border-radius: 3px;
  background: #fff;
  opacity: .9;
}
.sp__lede {
  margin: 16px auto 0;
  max-width: 46ch;
  font-size: .9375rem;
  line-height: 1.65;
  color: rgba(255,255,255,.78);
}

/* ---------- grid ---------- */
.sp__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  grid-gap: 8px;
  gap: 8px;
}
.sp__cell {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  min-height: 92px;
  padding: 14px 8px;
  background: #fff;
  border-radius: 12px;
  -webkit-transition: -webkit-transform .3s ease, box-shadow .3s ease, background-color .3s ease;
  transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s ease, background-color .3s ease;
}
.sp__cell:last-child:nth-child(odd) { grid-column: span 2; }

.sp__logo {
  display: block;
  height: 28px;
  height: calc(var(--h) * var(--k) * 1px);
  width: auto;
  max-width: 100%;
  object-fit: contain;
  -webkit-transition: -webkit-transform .35s ease;
  transition: transform .35s cubic-bezier(.2,.7,.2,1);
}
@media (hover: hover) {
  .sp__cell:hover {
    -webkit-transform: translateY(-3px);
    transform: translateY(-3px);
    box-shadow: 0 16px 28px -14px rgba(0,0,0,.55);
  }
  .sp__cell:hover .sp__logo { -webkit-transform: scale(1.05); transform: scale(1.05); }
}

/* ---------- light variant ---------- */
.sp--light .sp__card {
  color: ${BRAND};
  background: #fff;
  border: 1px solid #e7e6f2;
  box-shadow: 0 30px 60px -36px rgba(44,39,114,.45);
}
.sp--light .sp__card::before {
  background-image: radial-gradient(rgba(44,39,114,.1) 1px, rgba(44,39,114,0) 1.5px);
}
.sp--light .sp__title { color: ${BRAND}; }
.sp--light .sp__title::after { background: ${BRAND}; }
.sp--light .sp__lede { color: #5b5a7a; }
.sp--light .sp__clip { overflow: hidden; }
.sp--light .sp__grid { margin: 0 -1px -1px 0; grid-gap: 0; gap: 0; }
.sp--light .sp__cell {
  border-radius: 0;
  background: transparent;
  box-shadow: 1px 0 0 0 #e7e6f2, 0 1px 0 0 #e7e6f2;
}
@media (hover: hover) {
  .sp--light .sp__cell:hover { background: #f4f3fb; -webkit-transform: none; transform: none; box-shadow: 1px 0 0 0 #e7e6f2, 0 1px 0 0 #e7e6f2; }
}

/* ---------- breakpoints ---------- */
@media (min-width: 400px) {
  .sp { --k: .76; padding: 40px 16px; }
  .sp__cell { min-height: 104px; padding: 16px 12px; }
}
@media (min-width: 640px) {
  .sp { --k: .9; --cols: 3; padding: 64px 28px; }
  .sp__card { padding: 56px 32px 32px; border-radius: 26px; }
  .sp__head { margin-bottom: 40px; }
  .sp__title { font-size: 2.25rem; }
  .sp__lede { font-size: 1rem; }
  .sp__cell:last-child:nth-child(odd) { grid-column: auto; }
  .sp__grid { grid-gap: 12px; gap: 12px; }
  .sp__cell { min-height: 124px; padding: 20px 16px; border-radius: 14px; }
}
@media (min-width: 1024px) {
  .sp { --k: .98; --cols: 5; padding: 96px 40px; }
  .sp__card { padding: 72px 48px 48px; border-radius: 32px; }
  .sp__head { margin-bottom: 52px; }
  .sp__title { font-size: 2.75rem; }
  .sp__grid { grid-gap: 16px; gap: 16px; }
  .sp__cell { min-height: 136px; padding: 22px 18px; border-radius: 16px; }
}
@media (min-width: 1280px) {
  .sp { --k: 1.04; }
}
.sp--light .sp__grid { grid-gap: 0 !important; gap: 0 !important; }
.sp--light .sp__cell { border-radius: 0 !important; }
@media (prefers-reduced-motion: reduce) {
  .sp__cell, .sp__logo { -webkit-transition: none; transition: none; }
}
`;

export function StrategicPartners({
  partners = PARTNERS,
  variant = "dark",
}: {
  partners?: Partner[];
  variant?: "dark" | "light";
}) {
  return (
    <section
      className={variant === "light" ? "sp sp--light" : "sp"}
      aria-labelledby="sp-title"
    >
      <style>{css}</style>

      <div className="sp__card">
        <header className="sp__head">
          <h2 id="sp-title" className="sp__title">
            Strategic partners
          </h2>
          <p className="sp__lede">
            We work with the world&rsquo;s leading security, networking and
            technology vendors to deliver solutions you can rely on.
          </p>
        </header>

        <div className="sp__clip">
          <ul className="sp__grid">
            {partners.map((p) => (
              <li className="sp__cell" key={p.name}>
                <img
                  className="sp__logo"
                  src={`${LOGO_BASE}${p.logo}`}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  style={{ ["--h" as string]: p.h } as React.CSSProperties}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default StrategicPartners;   