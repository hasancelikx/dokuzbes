#!/usr/bin/env bash
# Dokuz Beş — tüm mikroservisleri başlat
# Kullanım: ./dev.sh           → hepsini başlat
#           ./dev.sh stop      → hepsini durdur
#           ./dev.sh status    → çalışanları göster
#           ./dev.sh logs auth-service → servis logunu izle

ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT/.env.dev"
LOG_DIR="$ROOT/.logs"
PID_FILE="$ROOT/.service-pids"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

# "servis:port" çiftleri — bağımlılık sırasıyla
SERVISLER=(
  "auth-service:3001"
  "user-service:3002"
  "performer-service:3003"
  "mesa-service:3004"
  "gold-service:3007"
  "payment-service:3008"
  "livekit-service:3009"
  "notification-service:3010"
  "admin-service:3011"
  "withdrawal-service:3012"
)

port_of() {
  # "auth-service:3001" → "3001"
  echo "${1##*:}"
}

name_of() {
  # "auth-service:3001" → "auth-service"
  echo "${1%%:*}"
}

load_env() {
  if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Hata: $ENV_FILE bulunamadı${NC}"; exit 1
  fi
  set -a; source "$ENV_FILE"; set +a
}

baslat() {
  load_env
  mkdir -p "$LOG_DIR"
  rm -f "$PID_FILE"; touch "$PID_FILE"

  echo -e "${CYAN}╔═══════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║    Dokuz Beş — Servisler Başlıyor     ║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════╝${NC}"
  echo ""

  for ENTRY in "${SERVISLER[@]}"; do
    SERVIS=$(name_of "$ENTRY")
    PORT=$(port_of "$ENTRY")
    LOG="$LOG_DIR/$SERVIS.log"
    DIR="$ROOT/services/$SERVIS"

    if [ ! -d "$DIR" ]; then
      echo -e "  ${YELLOW}⊘ $SERVIS — dizin yok${NC}"; continue
    fi

    if lsof -ti:"$PORT" > /dev/null 2>&1; then
      echo -e "  ${GREEN}✓ $SERVIS${NC} (port $PORT zaten açık)"; continue
    fi

    printf "  %-35s" "$SERVIS (port $PORT)..."
    cd "$DIR"
    npx tsx src/index.ts > "$LOG" 2>&1 &
    PID=$!
    echo "$SERVIS=$PID" >> "$PID_FILE"
    cd "$ROOT"

    # Port açılana kadar bekle (max 10 sn)
    WAITED=0
    while ! lsof -ti:"$PORT" > /dev/null 2>&1; do
      sleep 0.5; WAITED=$((WAITED+1))
      if [ $WAITED -ge 20 ]; then
        echo -e "${RED}ZAMAN AŞIMI${NC}"
        echo -e "    ${RED}↳ Log: .logs/$SERVIS.log${NC}"; break 2
      fi
    done
    echo -e "${GREEN}✓${NC}"
  done

  echo ""
  echo -e "${GREEN}Tüm servisler hazır.${NC}"
  echo -e "  Loglar:     ${CYAN}.logs/<servis>.log${NC}"
  echo -e "  Durdurmak:  ${CYAN}./dev.sh stop${NC}"
  echo -e "  Durum:      ${CYAN}./dev.sh status${NC}"
}

durdur() {
  echo -e "${YELLOW}Servisler durduruluyor...${NC}"
  if [ -f "$PID_FILE" ]; then
    while IFS='=' read -r SERVIS PID; do
      if kill -0 "$PID" 2>/dev/null; then
        kill "$PID" 2>/dev/null
        echo -e "  ${RED}✗${NC} $SERVIS"
      fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
  fi
  # Kalan süreçleri temizle
  for ENTRY in "${SERVISLER[@]}"; do
    PORT=$(port_of "$ENTRY")
    PIDS=$(lsof -ti:"$PORT" 2>/dev/null)
    [ -n "$PIDS" ] && kill $PIDS 2>/dev/null || true
  done
  echo -e "${GREEN}Durduruldu.${NC}"
}

durum() {
  echo -e "${CYAN}Servis Durumu:${NC}"; echo ""
  for ENTRY in "${SERVISLER[@]}"; do
    SERVIS=$(name_of "$ENTRY")
    PORT=$(port_of "$ENTRY")
    if lsof -ti:"$PORT" > /dev/null 2>&1; then
      printf "  \033[0;32m●\033[0m %-28s http://localhost:%s\n" "$SERVIS" "$PORT"
    else
      printf "  \033[0;31m○\033[0m %-28s port %s — çalışmıyor\n" "$SERVIS" "$PORT"
    fi
  done
}

loglar() {
  SERVIS="${2:-}"
  LOG="$LOG_DIR/$SERVIS.log"
  if [ -z "$SERVIS" ]; then
    echo "Kullanım: ./dev.sh logs <servis-adi>"
    echo "Servisler:"; for E in "${SERVISLER[@]}"; do echo "  $(name_of "$E")"; done
    exit 0
  fi
  [ -f "$LOG" ] && tail -f "$LOG" || echo -e "${RED}Log bulunamadı: $LOG${NC}"
}

case "${1:-baslat}" in
  stop|durdur)  durdur ;;
  status|durum) durum ;;
  logs|loglar)  loglar "$@" ;;
  *)            baslat ;;
esac
