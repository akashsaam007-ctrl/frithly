import net from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { probe } from './verify';
import { stripQuoted } from './mail';

/** Fake SMTP server: accepts only the addresses in `valid` (or everything when catchAll). */
function fakeSmtp(valid: string[], catchAll = false) {
  const srv = net.createServer((s) => {
    s.write('220 fake ESMTP\r\n');
    let buf = '';
    s.on('data', (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\r\n')) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 2);
        if (/^EHLO/i.test(line)) s.write('250-fake\r\n250 OK\r\n');
        else if (/^MAIL FROM/i.test(line)) s.write('250 OK\r\n');
        else if (/^RCPT TO/i.test(line)) {
          const addr = line.match(/<(.+)>/)?.[1] ?? '';
          s.write(catchAll || valid.includes(addr) ? '250 OK\r\n' : '550 5.1.1 No such user\r\n');
        } else if (/^QUIT/i.test(line)) { s.write('221 bye\r\n'); s.end(); }
      }
    });
  });
  return srv;
}

let a: net.Server, b: net.Server, pa = 0, pb = 0;
beforeAll(async () => {
  a = fakeSmtp(['priya.raman@acme.io']);
  b = fakeSmtp([], true);
  await new Promise<void>((r) => a.listen(0, r));
  await new Promise<void>((r) => b.listen(0, r));
  pa = (a.address() as net.AddressInfo).port;
  pb = (b.address() as net.AddressInfo).port;
});
afterAll(() => { a.close(); b.close(); });

describe('SMTP probe', () => {
  it('finds the valid candidate', async () => {
    const r = await probe('acme.io', ['priya@acme.io', 'priya.raman@acme.io', 'praman@acme.io'], { host: '127.0.0.1', port: pa });
    expect(r.catchAll).toBe(false);
    expect(r.results['priya@acme.io']).toBe('invalid');
    expect(r.results['priya.raman@acme.io']).toBe('valid');
    expect(r.results['praman@acme.io']).toBeUndefined();
  });
  it('detects catch-all', async () => {
    const r = await probe('acme.io', ['priya@acme.io'], { host: '127.0.0.1', port: pb });
    expect(r.catchAll).toBe(true);
    expect(r.results['priya@acme.io']).toBe('unknown');
  });
});

describe('stripQuoted', () => {
  it('keeps only the new reply', () => {
    expect(stripQuoted('No thanks\n\nOn Tue, 1 Dec 2026, Akash wrote:\n> hi')).toBe('No thanks');
  });
});
