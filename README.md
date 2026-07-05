# MeetPerto

App de relacionamentos por proximidade +18 com Chat em tempo real. Feito em React Native + Expo.

![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)
![Stack](https://img.shields.io/badge/stack-React%20Native%20%7C%20Expo%20%7C%20Firebase-blue)

## Visão Geral

MeetPerto conecta pessoas próximas com foco em privacidade, segurança e experiência fluida. Match, chat e encontros reais sem expor localização exata.

**Público-alvo:** +18 anos, Brasil.

## Stack Técnica

| Camada | Tecnologia | Descrição |
| --- | --- | --- |
| **Mobile** | React Native + Expo SDK 53 | Base cross-platform. Build via EAS |
| **Backend** | Firebase | Auth, Firestore, Storage, Cloud Functions |
| **Chat** | Firestore Real-time | Entrega instantânea, typing indicator, read receipts |
| **Geolocalização** | Expo Location + Geohash | Filtro por raio, sem coordenadas exatas |
| **Notificações** | Expo Notifications + FCM | Push para match e mensagens |
| **CI/CD** | EAS Build | APK/AAB automáticos via GitHub Actions |

## Funcionalidades Core

### **1. Descoberta por Proximidade**
- Define raio de busca: 1km a 50km
- Exibe distância aproximada: "A menos de 500m"
- Nunca expõe GPS exato por privacidade
- Filtros: idade, gênero

### **2. Match e Chat**
- Swipe: curtir/passar
- Match mútuo libera chat
- Chat em tempo real com mídia, áudio e localização temporária
- Bloqueio e denúncia em 1-clique

### **3. Perfil**
- Fotos, bio, interesses, idade
- Verificação de Selfie opcional com liveness check
- Selo "Perfil Verificado"

## Segurança e Anti-Fake

| Recurso | Descrição |
| --- | --- |
| **Verificação de Selfie** | Liveness check opcional. Gera selo de perfil verificado |
| **Detecção Multi-conta** | Bloqueio por dispositivo/IP pra evitar fakes |
| **Denúncia 1-Clique** | Botão em todo perfil. Moderação em até 24h |
| **Bloqueio Automático** | Usuário com 3+ denúncias válidas é suspenso |
| **Criptografia** | HTTPS/TLS 1.3 em todo tráfego. Senhas Argon2id |
| **Distância Aproximada** | Exibe "A menos de 500m". Nunca coordenadas exatas |

## Monetização

### **Plano Grátis - R$ 0**
- **10 curtidas/dia**: Reseta 00:00 BRT
- **Quem curtiu você**: 100% borrado + contador "X pessoas curtiram você"
- **Chat após match**: Bloqueado. Libera se a outra pessoa mandar a primeira mensagem
- **Super Like**: Compra avulsa R$ 0,50

### **Plano Essencial - R$ 29,90/mês**
- **Curtidas ilimitadas**
- **Ver quem curtiu**: Lista completa sem blur + notificação
- **5 Super Likes/mês**
- **Chat livre**: Você pode iniciar a conversa após o match
- **Desfazer curtida**: Volte 1 perfil
- **Selo Responde Rápido**: Destaque se responder em < 1h
- **Renovação automática mensal**

### **Plano Premium - R$ 79,90/trimestre**
- **Tudo do Essencial +**
- **15 Super Likes/mês**
- **Boost 1x/semana**: Perfil no topo por 30min
- **Filtros Avançados**: Altura, signo, filhos, etc
- **Modo Invisível**: Ver perfis sem aparecer pra eles
- **Prioridade no Suporte**

## Roadmap

**Q4 2026**
- [ ] iOS TestFlight
- [ ] Chamadas de vídeo no chat
- [ ] Eventos presenciais no app

**Q1 2027**
- [ ] IA pra sugerir matches por compatibilidade
- [ ] Modo Viagem

## Setup Local

**Pré-requisitos:** Node 20+, Expo CLI, conta Firebase

```bash
git clone https://github.com/eliasroberto26-arch/MeetPerto.git
cd MeetPerto
npm install

# Configure o Firebase
cp firebaseConfig.example.js firebaseConfig.js
# Cole suas chaves do Firebase

# Adicione o google-services.json na raiz
# Baixe do console do Firebase

npx expo start
