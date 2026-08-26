#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping processes...${NC}"
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null && echo "  Backend (PID $BACKEND_PID) stopped"
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null && echo "  Frontend (PID $FRONTEND_PID) stopped"
  exit 0
}

trap cleanup SIGINT SIGTERM

# 1. Check Node.js
echo -e "${CYAN}Checking prerequisites...${NC}"
if ! command -v node &>/dev/null; then
  echo -e "${RED}Error: Node.js not found. Install Node.js 18+ first.${NC}"
  exit 1
fi
echo -e "  Node.js: $(node --version)"

# 2. Check .env
echo ""
if [ ! -f backend/.env ]; then
  echo -e "${RED}Error: backend/.env not found.${NC}"
  echo ""
  echo "  Create it with:"
  echo ""
  echo "    ZOHO_CLIENT_ID=your_client_id"
  echo "    ZOHO_CLIENT_SECRET=your_client_secret"
  echo "    ZOHO_REFRESH_TOKEN=your_refresh_token"
  echo ""
  exit 1
fi
echo -e "${GREEN}  backend/.env found${NC}"

# 3. Install dependencies
echo ""
echo -e "${CYAN}Checking dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
  echo "  Installing backend dependencies..."
  (cd backend && npm install) || { echo -e "${RED}Error: Backend npm install failed${NC}"; exit 1; }
else
  echo -e "  ${GREEN}Backend dependencies OK${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "  Installing frontend dependencies..."
  (cd frontend && npm install) || { echo -e "${RED}Error: Frontend npm install failed${NC}"; exit 1; }
else
  echo -e "  ${GREEN}Frontend dependencies OK${NC}"
fi

# 4. Start backend
echo ""
echo -e "${CYAN}Starting backend...${NC}"
(cd backend && npm run dev) &
BACKEND_PID=$!
sleep 2

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  echo -e "${RED}Error: Backend failed to start. Check backend/.env credentials.${NC}"
  exit 1
fi

# 5. Start frontend
echo -e "${CYAN}Starting frontend...${NC}"
(cd frontend && npm run dev) &
FRONTEND_PID=$!
sleep 3

if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
  echo -e "${RED}Error: Frontend failed to start.${NC}"
  kill "$BACKEND_PID" 2>/dev/null
  exit 1
fi

# 6. Print URLs
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Project is running             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}Backend:${NC}  http://localhost:3000"
echo -e "  ${CYAN}Frontend:${NC} http://localhost:5173"
echo ""
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop all processes."
echo ""

# 7. Wait for either process to exit
wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
echo -e "${RED}A process exited unexpectedly. Stopping all...${NC}"
cleanup
