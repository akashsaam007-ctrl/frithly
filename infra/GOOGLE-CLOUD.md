# Running the worker on Google Cloud

The website runs on Vercel. The worker (scanning, finding people, drafts, sending, reading replies) runs on one small VM.

Google Cloud blocks outbound port 25, so the in-house email checker can't run there. Set `EMAIL_FINDER=prospeo`
(the setup script does this) and emails are found and verified by Prospeo instead. To switch back to the in-house
checker later, move the worker to a server with port 25 open (Hetzner, OVH) and set `EMAIL_FINDER=smtp`.
Nothing else changes.

## 1. Create the VM

Console → Compute Engine → VM instances → Create instance:

- **Name:** `frithly-worker`
- **Region:** `asia-south1` (Mumbai), same region as your Supabase project
- **Machine type:** `e2-small` (2 vCPU, 2 GB). `e2-micro` is too small for the build.
- **Boot disk:** Debian 12, 20 GB
- **Firewall:** leave HTTP/HTTPS unticked. The worker only makes outbound connections.

## 2. Get a Prospeo key

prospeo.io → sign up → API → copy the key. 1 credit per email found; no charge when nothing is found.

## 3. Install

Click **SSH** next to the VM, then:

```bash
curl -fsSL https://raw.githubusercontent.com/akashsaam007-ctrl/frithly/main/infra/gcp-setup.sh | bash
nano ~/frithly/.env        # fill in the values (same DATABASE_URL and ENCRYPTION_KEY as Vercel)
bash ~/frithly/infra/gcp-setup.sh
```

The second run builds and starts the worker. It creates the database tables on first start and restarts itself after reboots.

## 4. Check it's working

```bash
sudo docker compose -f ~/frithly/infra/docker-compose.yml logs -f
```

You should see `migrations applied` and then `{"scope":"worker","msg":"started",…}`. Within 20 minutes, `company scanned` lines appear for each company you watch.

## Cost

About $13/month for e2-small (covered by the $300 new-account credit for the first months), plus Prospeo credits.
