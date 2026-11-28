#!/usr/bin/env bash
# One-time setup of the Frithly worker on a fresh Google Cloud VM (Debian 12 or Ubuntu 22.04+).
#   curl -fsSL https://raw.githubusercontent.com/akashsaam007-ctrl/frithly/main/infra/gcp-setup.sh | bash
set -euo pipefail

if ! command -v docker >/dev/null; then
  echo "Installing Docker…"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi

if [ ! -d "$HOME/frithly" ]; then
  git clone https://github.com/akashsaam007-ctrl/frithly "$HOME/frithly"
fi
cd "$HOME/frithly"
git pull --ff-only

if [ ! -f .env ]; then
  cp .env.example .env
  # Google Cloud blocks outbound port 25, so emails are found through Prospeo.
  sed -i 's/^EMAIL_FINDER=.*/EMAIL_FINDER=prospeo/' .env
  echo
  echo "Created ~/frithly/.env. Fill it in now (DATABASE_URL, ENCRYPTION_KEY, APP_URL, ANTHROPIC_API_KEY, PROSPEO_API_KEY),"
  echo "using the SAME DATABASE_URL and ENCRYPTION_KEY as Vercel. Then run this script again."
  echo "  nano ~/frithly/.env"
  exit 0
fi

for v in DATABASE_URL ENCRYPTION_KEY ANTHROPIC_API_KEY; do
  if ! grep -qE "^$v=.+" .env; then echo "Missing $v in .env"; exit 1; fi
done
if grep -qE '^EMAIL_FINDER=prospeo' .env && ! grep -qE '^PROSPEO_API_KEY=.+' .env; then echo "EMAIL_FINDER=prospeo needs PROSPEO_API_KEY in .env"; exit 1; fi

sudo docker compose -f infra/docker-compose.yml up -d --build
echo
echo "Worker started. It creates the database tables on first start."
echo "Logs:    sudo docker compose -f ~/frithly/infra/docker-compose.yml logs -f"
echo "Update:  cd ~/frithly && git pull && sudo docker compose -f infra/docker-compose.yml up -d --build"
