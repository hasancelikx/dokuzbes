#!/usr/bin/env bash
# Cloudflare Tunnel + Next.js başlatıcı
# Kullanım: ./tunnel.sh          → başlat
#           ./tunnel.sh stop     → durdur
#           ./tunnel.sh url      → mevcut URL'yi göster

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
NEXT_CONFIG="$ROOT/apps/web/next.config.ts"
TUNNEL_LOG="/tmp/cf-tunnel.log"
NEXT_LOG="/tmp/nextjs-dev.log"
PID_FILE="/tmp/dokuzbes-tunnel.pids"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ─────────────────────────────────────────────
durdur() {
  echo -e "${YELLOW}Durduruluyor...${NC}"
  pkill -f "cloudflared tunnel --url" 2>/dev/null || true
  kill "$(lsof -ti:3000)" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo -e "${GREEN}✓ Tunnel ve Next.js durduruldu.${NC}"
}

# ─────────────────────────────────────────────
url_goster() {
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | tail -1)
  if [ -n "$URL" ]; then
    echo -e "${GREEN}$URL${NC}"
  else
    echo -e "${RED}Tunnel çalışmıyor. ./tunnel.sh ile başlat.${NC}"
  fi
}

# ─────────────────────────────────────────────
baslat() {
  echo -e "${CYAN}${BOLD}"
  echo "  ╔═══════════════════════════════════╗"
  echo "  ║   Dokuz Beş — Tunnel Başlatıcı    ║"
  echo "  ╚═══════════════════════════════════╝"
  echo -e "${NC}"

  # 1. Eski süreçleri temizle
  echo -e "${YELLOW}→ Eski süreçler temizleniyor...${NC}"
  pkill -f "cloudflared tunnel --url" 2>/dev/null || true
  kill "$(lsof -ti:3000)" 2>/dev/null || true
  sleep 1

  # 2. Tunnel başlat, URL yakala
  echo -e "${YELLOW}→ Cloudflare Tunnel başlatılıyor...${NC}"
  rm -f "$TUNNEL_LOG"
  nohup cloudflared tunnel --url http://localhost:3000 --no-autoupdate > "$TUNNEL_LOG" 2>&1 &
  echo "TUNNEL_PID=$!" >> "$PID_FILE"

  echo -n "  URL bekleniyor"
  TUNNEL_URL=""
  for i in $(seq 1 30); do
    sleep 1
    TUNNEL_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | tail -1)
    [ -n "$TUNNEL_URL" ] && break
    echo -n "."
  done
  echo ""

  if [ -z "$TUNNEL_URL" ]; then
    echo -e "${RED}✗ Tunnel URL alınamadı. Log: $TUNNEL_LOG${NC}"
    exit 1
  fi

  HOSTNAME="${TUNNEL_URL#https://}"
  echo -e "  ${GREEN}✓ Tunnel: ${BOLD}$TUNNEL_URL${NC}"

  # 3. next.config.ts'i yeni hostname ile güncelle
  echo -e "${YELLOW}→ next.config.ts güncelleniyor...${NC}"
  node --input-type=module << EOF
import { readFileSync, writeFileSync } from 'fs'

const path = '$NEXT_CONFIG'
let c = readFileSync(path, 'utf8')

const block = \`  allowedDevOrigins: ['$HOSTNAME'],\`
const regex = /allowedDevOrigins:\s*\[[^\]]*\],?/s

if (regex.test(c)) {
  c = c.replace(regex, block)
} else {
  c = c.replace('const nextConfig: NextConfig = {', 'const nextConfig: NextConfig = {\n' + block)
}

writeFileSync(path, c)
console.log('  ✓ allowedDevOrigins güncellendi: $HOSTNAME')
EOF

  # 4. Next.js başlat
  echo -e "${YELLOW}→ Next.js başlatılıyor...${NC}"
  cd "$ROOT"
  nohup npm run dev --workspace=apps/web > "$NEXT_LOG" 2>&1 &
  echo "NEXT_PID=$!" >> "$PID_FILE"

  echo -n "  Hazır bekleniyor"
  for i in $(seq 1 40); do
    sleep 1
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    case "$STATUS" in 200|307|308) break ;; esac
    echo -n "."
  done
  echo ""

  # 5. Sonuç
  echo ""
  echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}${BOLD}║  ✅ Siteniz yayında!                                      ║${NC}"
  echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
  printf "${GREEN}${BOLD}║  %-58s ║\n${NC}" "🌐 $TUNNEL_URL"
  echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
  echo -e "${GREEN}${BOLD}║  Durdurmak : ./tunnel.sh stop                              ║${NC}"
  echo -e "${GREEN}${BOLD}║  URL göster: ./tunnel.sh url                               ║${NC}"
  echo -e "${GREEN}${BOLD}║  Loglar    : tail -f /tmp/nextjs-dev.log                   ║${NC}"
  echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
}

# ─────────────────────────────────────────────
case "${1:-baslat}" in
  stop|durdur)  durdur ;;
  url)          url_goster ;;
  *)            baslat ;;
esac
