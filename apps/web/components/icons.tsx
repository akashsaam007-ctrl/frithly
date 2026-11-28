const IC: Record<string, string> = {
  today: 'M4 5h16v15H4z M4 9h16 M9 3v4 M15 3v4', inbox: 'M4 13l2-8h12l2 8v6H4z M4 13h5l1 2h4l1-2h5',
  companies: 'M4 20V6l8-3 8 3v14 M9 20v-5h6v5 M8 9h1 M15 9h1 M8 12h1 M15 12h1',
  people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M16 4.5a3.5 3.5 0 0 1 0 6.5 M18 14c2 .8 3 2.8 3 6',
  deals: 'M4 6h4v14H4z M10 6h4v9h-4z M16 6h4v5h-4z', tasks: 'M5 12.5l3 3 6-7 M14 6h6 M14 12h6 M5 19h15',
  enrich: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4', outreach: 'M4 12l16-8-6 16-3-6z',
  analytics: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2', integrations: 'M9 7V3 M15 7V3 M7 7h10v5a5 5 0 0 1-10 0z M12 17v4',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M4 12h2 M18 12h2 M12 4v2 M12 18v2 M6.3 6.3l1.4 1.4 M16.3 16.3l1.4 1.4 M6.3 17.7l1.4-1.4 M16.3 7.7l1.4-1.4',
  billing: 'M3 6h18v12H3z M3 10h18 M7 15h4', search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4z M10 20h4', menu: 'M4 7h16 M4 12h16 M4 17h16', x: 'M6 6l12 12 M18 6L6 18',
  spark: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z', plus: 'M12 5v14 M5 12h14', down: 'M12 4v12 M7 11l5 5 5-5 M5 20h14', mail: 'M4 6h16v12H4z M4 7l8 6 8-6',
};
export function Ico({ k, s = 18 }: { k: string; s?: number }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={IC[k]} /></svg>;
}
export const LogoMark = () => <img src="/logo.png" alt="" width={26} height={26} style={{ borderRadius: 8, background: '#fff' }} />;
