import Link from 'next/link';
import { PLANS } from '@frithly/core/plans';

export default function Landing() {
  const s = PLANS.starter, p = PLANS.pro;
  return (
    <div className="lp">
      <nav className="lp-nav">
        <Link href="/" className="brand"><img src="/logo.png" alt="" />Frithly</Link>
        <span className="sp" />
        <a className="btn gh s" href="#pricing">Pricing</a>
        <Link className="btn s" href="/login">Sign in</Link>
        <Link className="btn pri s" href="/login">Start free trial</Link>
      </nav>

      <section className="hero">
        <span className="pill v">14-day free trial with 100 companies · no card needed</span>
        <h1 style={{ marginTop: 18 }}>See which companies need you this week.</h1>
        <p>Frithly watches for hiring, funding and website changes, finds the right person and their verified email, and writes a first email. You approve every email before it goes out.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link className="btn pri lg" href="/login">Show me 5 companies</Link>
          <a className="btn lg" href="#how">How it works</a>
        </div>
      </section>

      <section id="how" className="steps">
        {[
          ['1. Tell us who you sell to', 'Your offer, one proof point, and the roles and companies you want.'],
          ['2. We spot the moment', 'Hiring, funding, new tools and website changes, checked every day.'],
          ['3. We find the person', 'The right contact and an email address we check with their mail server.'],
          ['4. You approve, we send', 'Each email passes an 11-point check. Follow-ups stop the moment they reply.'],
        ].map(([t, d]) => (
          <div className="card" key={t}><h3>{t}</h3><p className="mut" style={{ marginTop: 6 }}>{d}</p></div>
        ))}
      </section>

      <section id="pricing">
        <h2 style={{ fontSize: 26 }}>Simple pricing</h2>
        <p className="mut">20% off your first month on any monthly plan.</p>
        <div className="price">
          <div className="card stack"><h3>Free trial</h3><h2>$0</h2><p className="mut">14 days · 100 companies · 1 mailbox</p><Link className="btn" href="/login">Start free</Link></div>
          <div className="card stack"><h3>Starter</h3><h2>${s.usd}<span className="mut">/mo</span></h2><p className="mut">${s.offerUsd} for the first month · {s.month} companies a month · {s.mailboxes} mailboxes included</p><Link className="btn" href="/login">Choose Starter</Link></div>
          <div className="card stack rec"><span className="pill v">Recommended</span><h3>Pro</h3><h2>${p.usd}<span className="mut">/mo</span></h2><p className="mut">${p.offerUsd} for the first month · {p.month} companies a month · {p.mailboxes} mailboxes and {p.seats} seats</p><Link className="btn pri" href="/login">Choose Pro</Link></div>
          <div className="card stack"><h3>Agency</h3><h2>Custom</h2><p className="mut">Volume for several clients. Multi-client workspaces coming soon.</p><a className="btn" href="mailto:hello@frithly.com">Talk to us</a></div>
        </div>
      </section>

      <footer className="lp-f row">
        <span>© {new Date().getFullYear()} Frithly</span><span className="sp" />
        <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}
