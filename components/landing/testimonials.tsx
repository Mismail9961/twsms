import React from "react";

/**
 * ClientsSection  (replaces TestimonialsSection)
 *
 * - Full-width, edge-to-edge section showing every client logo in three
 *   slowly drifting rows (alternating direction). Hover pauses a row.
 * - Logos load straight from /public (e.g. /kia.png).
 *   Change LOGO_BASE below if you move them into a sub-folder.
 * - Works from 320px (iPhone 5s) up. No flex `gap` and no clamp() are used
 *   because iOS 12 Safari (the last version the 5s runs) doesn't support them.
 * - Respects "reduce motion": rows stop and become swipeable instead.
 */

type Client = { name: string; file: string; w: number; h: number };

const LOGO_BASE = "/";
const BRAND = "#2c2772";

const CLIENTS: Client[] = [
  { name: "AKD Securities", file: "akd.png", w: 164, h: 84 },
  { name: "Union Fabrics", file: "union-fabrics.png", w: 96, h: 128 },
  { name: "EFU Life", file: "efu-life.png", w: 113, h: 129 },
  { name: "Kia", file: "kia.png", w: 151, h: 44 },
  { name: "Master", file: "master.png", w: 109, h: 101 },
  { name: "Ismail Industries", file: "ismail-industries.png", w: 98, h: 111 },
  { name: "SIUT", file: "siut.png", w: 130, h: 51 },
  { name: "Hascol", file: "hascol.png", w: 132, h: 63 },
  { name: "Dalda", file: "dalda.png", w: 130, h: 80 },
  { name: "Tabros", file: "tabros.png", w: 89, h: 94 },
  { name: "Suzuki", file: "suzuki.png", w: 90, h: 110 },
  { name: "Pakistan Stock Exchange", file: "psx.png", w: 124, h: 111 },
  { name: "Bahria Town", file: "bahria-town.png", w: 155, h: 131 },
  { name: "UBL Funds", file: "ubl-funds.png", w: 198, h: 125 },
  { name: "Getz Pharma", file: "getz-pharma.png", w: 183, h: 70 },
  { name: "AGP", file: "agp.png", w: 146, h: 74 },
  { name: "MAL Pakistan", file: "mal-pakistan.png", w: 127, h: 59 },
  { name: "GTR Tyre", file: "gtr-tyre.png", w: 152, h: 66 },
  { name: "Client emblem", file: "emblem.png", w: 80, h: 90 },
  { name: "Rohde & Schwarz", file: "rohde-schwarz.png", w: 331, h: 73 },
  { name: "JS Global", file: "js-global.png", w: 165, h: 45 },
  { name: "Iqra University", file: "iqra-university.png", w: 159, h: 45 },
  { name: "BankIslami", file: "bankislami.png", w: 268, h: 82 },
  { name: "Gadoon", file: "gadoon.png", w: 164, h: 68 },
  { name: "DP World", file: "dp-world.png", w: 333, h: 83 },
  { name: "Engro Corp", file: "engro-corp.png", w: 253, h: 126 },
  { name: "Agility", file: "agility.png", w: 223, h: 61 },
  { name: "PMEX", file: "pmex.png", w: 136, h: 170 },
  { name: "ORIX", file: "orix.png", w: 135, h: 155 },
  { name: "Pak Oman", file: "pak-oman.png", w: 153, h: 112 },
  { name: "SAMI Pharmaceuticals", file: "sami.png", w: 107, h: 144 },
  { name: "Government of Sindh", file: "sindh-govt.png", w: 144, h: 162 },
  { name: "The Academy", file: "the-academy.png", w: 194, h: 132 },
  { name: "Al-Hamd International", file: "al-hamd.png", w: 134, h: 164 },
  { name: "KASB", file: "kasb.png", w: 134, h: 125 },
  { name: "Al Noor", file: "al-noor.png", w: 127, h: 171 },
  { name: "Pakistan Railways", file: "pakistan-railways.png", w: 187, h: 175 },
  { name: "IFFCO", file: "iffco.png", w: 155, h: 120 },
  { name: "Power Cement", file: "power-cement.png", w: 171, h: 79 },
  { name: "Patex", file: "patex.png", w: 206, h: 115 },
  { name: "Faysal Bank", file: "faysalbank.png", w: 349, h: 94 },
  { name: "Trimco", file: "trimco.png", w: 289, h: 84 },
  { name: "Falcon-i", file: "falcon-i.png", w: 296, h: 98 },
  { name: "Dubai Islamic Bank", file: "dubai-islamic-bank.png", w: 360, h: 93 },
  { name: "Samaa", file: "samaa.png", w: 194, h: 107 },
  { name: "Brookes", file: "brookes.png", w: 289, h: 71 },
  { name: "Hellmann Worldwide Logistics", file: "hellmann.png", w: 269, h: 97 },
  { name: "National Insurance Company Limited", file: "nicl.png", w: 200, h: 193 },
  { name: "Thal Industries", file: "thal-industries.png", w: 253, h: 148 },
  { name: "Aspin", file: "aspin.png", w: 316, h: 129 },
  { name: "rexD", file: "rexd.png", w: 175, h: 98 },
  { name: "Sofcom", file: "sofcom.png", w: 262, h: 78 },
  { name: "First Women Bank", file: "first-women-bank.png", w: 208, h: 128 },
];

const ROWS = 3;
const rows: Client[][] = Array.from({ length: ROWS }, (_, r) =>
  CLIENTS.filter((_, i) => i % ROWS === r)
);

const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap');

.cl {
  --brand: ${BRAND};
  --line: #e7e6f2;
  --tw: 132px;
  --th: 76px;
  --gap: 10px;
  position: relative;
  width: 100%;
  overflow: hidden;
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  padding: 52px 0 56px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: #f4f3fb;
  background:
    radial-gradient(640px 280px at 50% 0%, rgba(44,39,114,.08), rgba(44,39,114,0) 70%),
    linear-gradient(180deg, #ffffff 0%, #f4f3fb 100%);
}
.cl *, .cl *::before, .cl *::after { box-sizing: border-box; }

/* ---------- heading ---------- */
.cl__head { max-width: 720px; margin: 0 auto; padding: 0 20px; text-align: center; }
.cl__title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--brand);
}
.cl__title::after {
  content: "";
  display: block;
  width: 44px; height: 3px;
  margin: 16px auto 0;
  border-radius: 3px;
  background: var(--brand);
}
.cl__lede {
  margin: 16px auto 0;
  max-width: 48ch;
  font-size: .9375rem;
  line-height: 1.65;
  color: #5b5a7a;
}

/* ---------- marquee ---------- */
.cl__rows {
  margin-top: 32px;
  -webkit-mask-image: linear-gradient(90deg, rgba(0,0,0,0) 0, #000 7%, #000 93%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(90deg, rgba(0,0,0,0) 0, #000 7%, #000 93%, rgba(0,0,0,0) 100%);
}
.cl__row { overflow: hidden; padding: 6px 0; }
.cl__track {
  display: -webkit-flex;
  display: flex;
  width: -webkit-max-content;
  width: max-content;
  margin: 0;
  padding: 0;
  list-style: none;
  -webkit-animation: cl-marquee var(--dur, 90s) linear infinite;
  animation: cl-marquee var(--dur, 90s) linear infinite;
  -webkit-animation-delay: var(--delay, 0s);
  animation-delay: var(--delay, 0s);
  will-change: transform;
}
.cl__row--rev .cl__track {
  -webkit-animation-direction: reverse;
  animation-direction: reverse;
}
@-webkit-keyframes cl-marquee {
  from { -webkit-transform: translate3d(0,0,0); }
  to   { -webkit-transform: translate3d(-50%,0,0); }
}
@keyframes cl-marquee {
  from { transform: translate3d(0,0,0); }
  to   { transform: translate3d(-50%,0,0); }
}

.cl__tile {
  -webkit-flex: 0 0 auto;
  flex: 0 0 auto;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  width: var(--tw);
  height: var(--th);
  margin-right: var(--gap);
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(44,39,114,.05), 0 12px 24px -16px rgba(44,39,114,.35);
  -webkit-transition: -webkit-transform .3s ease, box-shadow .3s ease, border-color .3s ease;
  transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s ease, border-color .3s ease;
}
.cl__logo {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

@media (hover: hover) {
  .cl__row:hover .cl__track {
    -webkit-animation-play-state: paused;
    animation-play-state: paused;
  }
  .cl__tile:hover {
    -webkit-transform: translateY(-3px);
    transform: translateY(-3px);
    border-color: rgba(44,39,114,.28);
    box-shadow: 0 1px 2px rgba(44,39,114,.06), 0 18px 30px -16px rgba(44,39,114,.5);
  }
}

/* ---------- breakpoints ---------- */
@media (min-width: 480px) {
  .cl { --tw: 148px; --th: 84px; }
  .cl__lede { font-size: 1rem; }
}
@media (min-width: 768px) {
  .cl { --tw: 172px; --th: 94px; --gap: 14px; padding: 72px 0 80px; }
  .cl__title { font-size: 2.25rem; }
  .cl__rows { margin-top: 44px; }
  .cl__tile { padding: 14px 20px; border-radius: 16px; }
}
@media (min-width: 1200px) {
  .cl { --tw: 196px; --th: 104px; --gap: 16px; padding: 96px 0 104px; }
  .cl__title { font-size: 2.75rem; }
  .cl__rows { margin-top: 52px; }
  .cl__tile { padding: 16px 24px; }
}
@media (min-width: 1600px) {
  .cl { --tw: 212px; --th: 112px; }
}

/* ---------- reduced motion: stop drifting, let people swipe ---------- */
@media (prefers-reduced-motion: reduce) {
  .cl__track { -webkit-animation: none; animation: none; }
  .cl__row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .cl__dup { display: none; }
  .cl__rows { -webkit-mask-image: none; mask-image: none; }
  .cl__tile, .cl__tile:hover { -webkit-transition: none; transition: none; }
}
`;

function Tile({ c, hidden }: { c: Client; hidden?: boolean }) {
  return (
    <li
      className={hidden ? "cl__tile cl__dup" : "cl__tile"}
      aria-hidden={hidden ? true : undefined}
    >
      <img
        className="cl__logo"
        src={`${LOGO_BASE}${c.file}`}
        alt={hidden ? "" : c.name}
        width={c.w}
        height={c.h}
        loading="lazy"
        decoding="async"
      />
    </li>
  );
}

export function ClientsSection() {
  const durations = [88, 104, 96];
  const delays = [0, -34, -62];

  return (
    <section className="cl" aria-labelledby="cl-title">
      <style>{css}</style>

      <div className="cl__head">
        <h2 id="cl-title" className="cl__title">
          Valued clients
        </h2>
        <p className="cl__lede">
          Banks, universities, manufacturers and public institutions trust us
          with their networks, security and technology.
        </p>
      </div>

      <div className="cl__rows">
        {rows.map((row, r) => (
          <div
            key={r}
            className={r % 2 === 1 ? "cl__row cl__row--rev" : "cl__row"}
          >
            <ul
              className="cl__track"
              aria-label={r === 0 ? "Our clients" : undefined}
              aria-hidden={r === 0 ? undefined : true}
              style={
                {
                  ["--dur" as string]: `${durations[r]}s`,
                  ["--delay" as string]: `${delays[r]}s`,
                } as React.CSSProperties
              }
            >
              {row.map((c) => (
                <Tile key={c.file} c={c} />
              ))}
              {row.map((c) => (
                <Tile key={`${c.file}-dup`} c={c} hidden />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ClientsSection;