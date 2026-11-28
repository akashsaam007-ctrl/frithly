import Link from 'next/link';

export default function Terms() {
  return (
    <div className="lp" style={{ maxWidth: 760, padding: '40px 20px' }}>
      <Link href="/" className="brand" style={{ padding: 0 }}><img src="/logo.png" alt="" />Frithly</Link>
      <h1 style={{ margin: '24px 0 12px' }}>Terms</h1>
      <div className="stack sm">
        <p>You may use Frithly to send relevant, one-to-one business emails that you have reviewed and approved. You are responsible for following the anti-spam and privacy laws that apply to you and your recipients (such as CAN-SPAM, GDPR and PECR), including a real postal address and a working opt-out in every email.</p>
        <p>We may pause sending from a workspace with high bounce or complaint rates, or that sends to people who opted out.</p>
        <p>Plans renew monthly or yearly until cancelled. The 20% first-month offer applies once per customer.</p>
      </div>
    </div>
  );
}
