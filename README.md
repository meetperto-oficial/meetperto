# MeetPerto

App de relacionamentos +18 focado em proximidade real, chat instantâneo e segurança anti-fake.

[[Expo](https://img.shields.io/badge/Expo-SDK%2053-000020?logo=expo)](https://expo.dev/)
[[React Native](https://img.shields.io/badge/React%20Native-0.79-61dafb?logo=react)](https://reactnative.dev/)
[[Firebase](https://img.shields.io/badge/Firebase-v11-ffca28?logo=firebase)](https://firebase.google.com/)
[[License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[[EAS Build](https://img.shields.io/badge/EAS-Build-blueviolet)](https://expo.dev/eas)
[[Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](https://github.com/eliasroberto26-arch/MeetPerto/actions)
[[Uptime](https://img.shields.io/badge/uptime-99.9%25-blue)](https://status.meetperto.app)

## 1. Visão Executiva

MeetPerto é um produto mobile-first que resolve dois problemas de mercado:
1. **Baixa conversão de match para encontro** por distância inviável
2. **Churn por perfis fakes** e bots

**KPIs Core:**
- D1 Retention > 40%
- Match-to-Chat > 60%
- Crash-free Sessions > 99.5%
- P95 Latência Chat < 400ms

Público: +18, Brasil. Modelo Freemium com IAP.

## 2. Arquitetura de Sistema

| Domínio | Tecnologia | Decisão de Arquitetura |
| --- | --- | --- |
| **Cliente** | React Native 0.79 + Expo SDK 53 | OTA via EAS Update, acesso nativo com Config Plugins, build determinístico |
| **Backend** | Firebase | Auth, Firestore, Functions Node 20, Storage, FCM. Serverless, escala automática, latência baixa |
| **Geolocalização** | `expo-location` + Geohash 6 | Query por `geofirestore`. Índices compostos. Nunca armazena `lat/long` exato por LGPD |
| **Real-time** | Firestore `onSnapshot` | Garante ordenação, suporte offline, presence. Substitui WebSocket |
| **Notificações** | Expo Notifications + FCM/APNs | Abstração de push cross-platform. Topics para campanhas |
| **CI/CD** | EAS Build + GitHub Actions | Pipeline: Lint → Test → Build → Submit. Preview APK em PRs |
| **Observabilidade** | Sentry + Crashlytics + Performance | Triangulação: erros JS, crashes nativos, traces de performance |
| **Segurança** | TLS 1.3, Argon2id, WAF | OWASP ASVS L2. Chaves no Google Secret Manager. Rotação 90 dias |

### **Diagrama de Alto Nível**
[Client RN] <-> [Firebase Auth]
     | |
     +------> <----> [Cloud Functions]
     | | |
     +------> [FCM/APNs] [Vision API]
     |
     +------> [Sentry/Crashlytics]
                  |
[Firestore]

### **Estrutura do Monorepo**
/assets # Ícones, splash, fontes
/functions # Cloud Functions
  index.js # Entrada das functions
  onUserCreate.js # Trigger Auth: cria perfil, verifica idade
  onMessageCreate.js # Moderação de chat com Vision API
  onReport.js # Pipeline de denúncia para Slack/Jira
  deleteUser.js # LGPD Art. 16: exclusão em cascata
/screens # Telas do app
  AuthScreen.js # Login/Cadastro
  FeedScreen.js # Swipe deck
  FilaLinearScreen.js # Lista de curtidas
  FiltrosScreen.js # Filtros de busca
  PerfilScreen.js # Edição de perfil
  PlanosScreen.js # Monetização IAP
  RadarScreen.js # Mapa de proximidade
  SettingsScreen.js # Configurações e privacidade
/__tests__ # Testes
  unit/ # Jest + RNTL
  e2e/ # Detox
App.js # Entry + Navigation + Providers
app.json # Config Expo + EAS
eas.json # Perfis: development, preview, production
firebase.json # Emulators, rules, functions config
firestore.rules # Regras de segurança do banco
firestore.indexes.json # Índices: geohash, age, lastActive
PRIVACIDADE.md # Política de Privacidade LGPD
TERMOS.md # Termos de Uso

## 3. Produto e Funcionalidades

### **3.1. Motor de Descoberta**
- **Swipe Deck**: `react-native-deck-swiper`. Pré-carrega 10 perfis. Lógica de ranking no client
- **Filtros**: Idade 18-99, gênero, raio 1-50km. Filtro Premium: altura, filhos, pets, signo
- **Perfil Rico**: 6 fotos, bio 500 chars, 5 interesses, áudio 15s, selo verificado
- **Radar**: Heatmap de densidade com `react-native-maps`. Não exibe pinos individuais

### **3.2. Chat e Comunicação**
- **Protocolo**: Firestore. Coleção `/chats/{chatId}/messages`. `onSnapshot` para real-time
- **Mídia**: Upload para Firebase Storage via URL assinada. Compressão no client com `expo-image-manipulator`
- **Features**: Digitando, entregue, lido, reagir com emoji, responder, apagar pra todos
- **Moderação**: `onMessageCreate` chama Vision API. `LIKELY` ou `VERY_LIKELY` em `adult/violence` = bloqueio automático + flag para revisão humana

### **3.3. Segurança e Anti-Fraude**
| Vetor de Ataque | Mitigação | Implementação |
| --- | --- | --- |
| **Perfis Fakes** | Verificação de Selfie | Liveness com `react-native-face-liveness`. Match 3D com foto do doc |
| **Multi-conta** | Device Fingerprint | `fingerprintjs` + `expo-device`. Hash salvo no Firestore. 2ª conta = ban |
| **Spam/Assédio** | Rate Limit + Denúncia | 10 msgs/min. Botão 1-clique. `onReport` cria ticket no Jira |
| **Stalking** | Ofuscação de Localização | Geohash 6 ≈ 1.2km x 0.6km. Cliente exibe "A menos de 500m" |
| **Vazamento Dados** | Princípio do Menor Privilégio | `firestore.rules`: `request.auth.uid == userId`. Sem leitura cross-user |

## 4. Modelo de Negócio

### **Plano Grátis**
- 10 curtidas/dia, reset 00:00 BRT
- Ver quem curtiu: blur + contador
- Chat: só responde após match
- 1 Super Like/dia

### **Plano Essencial - R$ 29,90/mês**
- Curtidas ilimitadas
- Ver quem curtiu sem blur
- Iniciar chat após match
- 5 Super Likes/mês, 1 Boost/mês
- Desfazer swipe, Selo "Responde Rápido"

### **Plano Premium - R$ 79,90/trimestre**
- Tudo do Essencial +
- 15 Super Likes/mês, 4 Boosts/mês
- Filtros Avançados
- Modo Incógnito
- Confirmação de leitura
- Suporte < 2h

**Tech**: `react-native-iap`. Validação de recibo no backend via Function `validateReceipt`. Anti-fraude de IAP.

## 5. Engenharia e Qualidade

### **5.1. Padrões de Código**
- **Linguagem**: TypeScript 5.5 `strict: true`. Proibido `any`
- **Linter**: ESLint Airbnb + Prettier. Pre-commit hook com Husky
- **Arquitetura**: Feature-based. Estado global com Zustand. Data fetching com React Query

### **5.2. Estratégia de Testes**
| Tipo | Ferramenta | Cobertura | Gatilho |
| --- | --- | --- | --- |
| **Unitário** | Jest + RNTL | 85% `screens`, `utils` | Pre-push |
| **Integração** | Firebase Emulators | Functions e Rules | CI em todo PR |
| **E2E** | Detox | Fluxo `cadastro→match→chat` | CI no `main` |
| **Carga** | k6 | 10k usuários simultâneos no chat | Quinzenal |

```bash
npm test # Unitários
npm run test:e2e # Detox Android
npm run test:rules # Firestore Rules
