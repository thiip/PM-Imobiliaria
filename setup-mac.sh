#!/bin/bash
# =============================================================================
# Script de instalacao do ERP Vista Alegre para macOS
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "  ERP Vista Alegre - Instalacao macOS"
echo "=========================================="
echo ""

# --- 1. Verificar/Instalar Homebrew ---
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Homebrew nao encontrado. Instalando...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Adicionar Homebrew ao PATH (Apple Silicon vs Intel)
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/usr/local/bin/brew shellenv)"
    fi
    echo -e "${GREEN}Homebrew instalado com sucesso!${NC}"
else
    echo -e "${GREEN}Homebrew ja instalado.${NC}"
fi

# --- 2. Verificar/Instalar Node.js ---
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js nao encontrado. Instalando via Homebrew...${NC}"
    brew install node
    echo -e "${GREEN}Node.js instalado com sucesso!${NC}"
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}Node.js ja instalado: ${NODE_VERSION}${NC}"

    # Verificar versao minima (Node 18+)
    NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${YELLOW}Versao do Node.js muito antiga. Atualizando...${NC}"
        brew upgrade node
    fi
fi

# --- 3. Verificar npm ---
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm nao encontrado. Verifique a instalacao do Node.js.${NC}"
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}npm disponivel: v${NPM_VERSION}${NC}"
fi

# --- 4. Instalar dependencias do projeto ---
echo ""
echo -e "${YELLOW}Instalando dependencias do projeto...${NC}"
npm install
echo -e "${GREEN}Dependencias instaladas com sucesso!${NC}"

# --- 5. Verificar build ---
echo ""
echo -e "${YELLOW}Verificando build do projeto...${NC}"
npm run build
echo -e "${GREEN}Build concluido com sucesso!${NC}"

# --- 6. Instrucoes finais ---
echo ""
echo "=========================================="
echo -e "${GREEN}  Instalacao concluida!${NC}"
echo "=========================================="
echo ""
echo "  Comandos disponiveis:"
echo ""
echo "    npm run dev     Iniciar servidor de desenvolvimento"
echo "                    (acesse http://localhost:3000)"
echo ""
echo "    npm run build   Gerar build de producao"
echo ""
echo "    npm start       Iniciar servidor de producao"
echo ""
echo "    npm run lint    Verificar qualidade do codigo"
echo ""
echo "=========================================="
echo ""
