# Instalacao no macOS - ERP Vista Alegre

## Pre-requisitos

- macOS 12 (Monterey) ou superior
- Acesso a internet para download das dependencias

## Instalacao Automatica

Abra o Terminal e execute:

```bash
cd PM-Imobiliaria
chmod +x setup-mac.sh
./setup-mac.sh
```

O script instala automaticamente:
- **Homebrew** (gerenciador de pacotes do macOS)
- **Node.js** (versao 18 ou superior)
- **Dependencias do projeto** via npm

## Instalacao Manual

### 1. Instalar Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Instalar Node.js

```bash
brew install node
```

### 3. Instalar dependencias do projeto

```bash
cd PM-Imobiliaria
npm install
```

### 4. Iniciar o sistema

```bash
npm run dev
```

Acesse **http://localhost:3000** no navegador.

## Comandos

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (hot reload) |
| `npm run build` | Gerar build de producao |
| `npm start` | Iniciar servidor de producao |
| `npm run lint` | Verificar qualidade do codigo |

## Solucao de Problemas

### Porta 3000 em uso

```bash
# Verificar qual processo usa a porta
lsof -i :3000

# Ou iniciar em outra porta
npx next dev -p 3001
```

### Problemas com Apple Silicon (M1/M2/M3/M4)

Se tiver erro ao instalar dependencias:

```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problemas com permissoes

```bash
sudo chown -R $(whoami) ~/.npm
```
