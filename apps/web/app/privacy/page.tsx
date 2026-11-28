import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="lp" style={{ maxWidth: 760, padding: '40px 20px' }}>
      <Link href="/" className="brand" style={{ padding: 0 }}><img src="/logo.png" alt="" />Frithly</Link>
      <h1 style={{ margin: '24px 0 12px' }}>Privacy</h1>
      <div className="stack sm">
        <p><strong>What we collect about our customers.</strong> Your email address, your workspace settings, the companies you watch, and the mailboxes you connect. Mailbox passwords and tokens are encrypted at rest.</p>
        <p><strong>What we collect about the people you email.</strong> Business contact details found on public company websites and job boards: name, job title, work email, and public company news. We do not buy personal data or scrape LinkedIn.</p>
        <p><strong>Opting out.</strong> Anyone can reply “no” or use the unsubscribe link in any email sent through Frithly. An opt-out is added to a global list, so that person is not emailed again by any Frithly customer.</p>
        <p><strong>Reading your mailbox.</strong> We only read replies to emails Frithly sent, to stop follow-ups and sort replies. Other mail is ignored.</p>
        <p><strong>Removal.</strong> Email privacy@frithly.com to have your data, or data about you, deleted.</p>
      </div>
    </div>
  );
}
