#!/bin/bash

# Server Resurslari Monitoring
# ./monitor.sh

echo "📊 SERVER RESURSLARI MONITORING"
echo "================================="
echo ""

# Ranglar
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. SYSTEM INFO
echo -e "${BLUE}🖥️  SYSTEM MA'LUMOTLARI${NC}"
echo "────────────────────────────────"
echo "Hostname:    $(hostname)"
echo "OS:          $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Kernel:      $(uname -r)"
echo "Uptime:      $(uptime -p)"
echo ""

# 2. CPU
echo -e "${BLUE}💻 CPU${NC}"
echo "────────────────────────────────"
CPU_CORES=$(nproc)
CPU_MODEL=$(lscpu | grep "Model name" | cut -d':' -f2 | xargs)
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)

echo "Model:       $CPU_MODEL"
echo "Cores:       $CPU_CORES"
echo "Usage:       ${CPU_USAGE}%"

if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo -e "${RED}⚠️  CPU yuqori!${NC}"
elif (( $(echo "$CPU_USAGE > 50" | bc -l) )); then
    echo -e "${YELLOW}⚠️  CPU o'rtacha${NC}"
else
    echo -e "${GREEN}✓ CPU yaxshi${NC}"
fi
echo ""

# 3. MEMORY (RAM)
echo -e "${BLUE}🧠 MEMORY (RAM)${NC}"
echo "────────────────────────────────"
MEM_TOTAL=$(free -h | awk '/^Mem:/ {print $2}')
MEM_USED=$(free -h | awk '/^Mem:/ {print $3}')
MEM_FREE=$(free -h | awk '/^Mem:/ {print $4}')
MEM_PERCENT=$(free | awk '/^Mem:/ {printf "%.1f", $3/$2 * 100}')

echo "Total:       $MEM_TOTAL"
echo "Used:        $MEM_USED"
echo "Free:        $MEM_FREE"
echo "Percentage:  ${MEM_PERCENT}%"

if (( $(echo "$MEM_PERCENT > 85" | bc -l) )); then
    echo -e "${RED}⚠️  RAM to'lib ketmoqda!${NC}"
elif (( $(echo "$MEM_PERCENT > 70" | bc -l) )); then
    echo -e "${YELLOW}⚠️  RAM ko'p ishlatilmoqda${NC}"
else
    echo -e "${GREEN}✓ RAM yaxshi${NC}"
fi
echo ""

# 4. DISK
echo -e "${BLUE}💾 DISK${NC}"
echo "────────────────────────────────"
DISK_TOTAL=$(df -h / | awk 'NR==2 {print $2}')
DISK_USED=$(df -h / | awk 'NR==2 {print $3}')
DISK_FREE=$(df -h / | awk 'NR==2 {print $4}')
DISK_PERCENT=$(df / | awk 'NR==2 {print $5}' | cut -d'%' -f1)

echo "Total:       $DISK_TOTAL"
echo "Used:        $DISK_USED"
echo "Free:        $DISK_FREE"
echo "Percentage:  ${DISK_PERCENT}%"

if [ "$DISK_PERCENT" -gt 90 ]; then
    echo -e "${RED}⚠️  Disk to'lib ketmoqda!${NC}"
elif [ "$DISK_PERCENT" -gt 75 ]; then
    echo -e "${YELLOW}⚠️  Disk ko'p ishlatilmoqda${NC}"
else
    echo -e "${GREEN}✓ Disk yaxshi${NC}"
fi
echo ""

# 5. DOCKER CONTAINERS
if command -v docker &> /dev/null; then
    echo -e "${BLUE}🐳 DOCKER CONTAINERS${NC}"
    echo "────────────────────────────────"
    
    if [ -f "docker-compose.yml" ] || [ -f "$HOME/lmsdb/docker-compose.yml" ]; then
        cd "$HOME/lmsdb" 2>/dev/null || cd .
        
        # Container count
        CONTAINERS_RUNNING=$(docker compose ps -q 2>/dev/null | wc -l)
        echo "Running:     $CONTAINERS_RUNNING"
        echo ""
        
        # Container stats
        echo "Container Resources:"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | head -n 10
        echo ""
        
        # Container status
        echo "Container Status:"
        docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    else
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Size}}"
    fi
    echo ""
fi

# 6. NETWORK
echo -e "${BLUE}🌐 NETWORK${NC}"
echo "────────────────────────────────"

# Active connections
CONNECTIONS=$(ss -s | grep TCP | head -1)
echo "$CONNECTIONS"

# Listening ports
echo ""
echo "Listening Ports:"
sudo netstat -tulpn 2>/dev/null | grep LISTEN | awk '{print $4, $7}' | head -n 5 || \
ss -tulpn 2>/dev/null | grep LISTEN | awk '{print $5, $7}' | head -n 5

echo ""

# 7. TOP PROCESSES
echo -e "${BLUE}⚡ TOP 5 PROCESSES (CPU)${NC}"
echo "────────────────────────────────"
ps aux --sort=-%cpu | head -n 6 | tail -n 5 | awk '{printf "%-20s %5s%% %8s\n", $11, $3, $4}'
echo ""

echo -e "${BLUE}⚡ TOP 5 PROCESSES (MEMORY)${NC}"
echo "────────────────────────────────"
ps aux --sort=-%mem | head -n 6 | tail -n 5 | awk '{printf "%-20s %5s%% %8s\n", $11, $4, $6}'
echo ""

# 8. LOAD AVERAGE
echo -e "${BLUE}📈 LOAD AVERAGE${NC}"
echo "────────────────────────────────"
LOAD=$(uptime | awk -F'load average:' '{print $2}')
echo "Load Average: $LOAD"
echo ""

# 9. WARNINGS SUMMARY
echo -e "${BLUE}⚠️  OGOHLANTIRISHLAR${NC}"
echo "────────────────────────────────"

WARNINGS=0

if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo -e "${RED}❌ CPU juda yuqori: ${CPU_USAGE}%${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if (( $(echo "$MEM_PERCENT > 85" | bc -l) )); then
    echo -e "${RED}❌ RAM to'lib ketmoqda: ${MEM_PERCENT}%${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ "$DISK_PERCENT" -gt 90 ]; then
    echo -e "${RED}❌ Disk to'lib ketmoqda: ${DISK_PERCENT}%${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}✓ Hamma narsa yaxshi!${NC}"
fi

echo ""
echo "════════════════════════════════"
echo -e "${GREEN}✅ MONITORING TUGADI${NC}"
echo "════════════════════════════════"
echo ""
echo "🔄 Real-time monitoring:"
echo "   htop         - Interactive process viewer"
echo "   docker stats - Docker resources"
echo "   watch -n 1 'free -h && df -h'  - Memory & Disk"
echo ""
