<div align="center">

# MeetPerto 💕

**O amor não mora longe.**

App de relacionamentos +18 com Chat por proximidade em tempo real.

[![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0.28-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.4-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Baixar na Play Store](#) • [Baixar na App Store](#) • [Política de Privacidade](./PRIVACIDADE.md) • [Termos de Uso](./TERMOS.md) • [Reportar Bug](https://github.com/eliasroberto26-arch/MeetPerto/issues)

</div>

---

## 📸 Screenshots

<div align="center">
<img src="./assets/screenshots/feed.png" width="200" alt="Feed por proximidade">
<img src="./assets/screenshots/chat.png" width="200" alt="Chat em tempo real">
<img src="./assets/screenshots/perfil.png" width="200" alt="Perfil verificado">
<img src="./assets/screenshots/filtros.png" width="200" alt="Filtros de busca">
</div>

---

## 📱 Como Funciona

### **Cadastro Seguro em 6 Etapas**
1. **Login**: E-mail + senha ou Telefone
2. **Verificação**: Código SMS 6 dígitos ou link e-mail
3. **Perfil**: Nome, Data nascimento 18+, Gênero, Cidade, Fotos até 7
4. **Localização**: Usada só pra distância. Posição exata nunca exibida.
5. **Termos**: Aceite obrigatório de Termos + Política de Privacidade
6. **Segurança**: Senhas Argon2, HTTPS total, tokens com expiração, rate limit

**Fluxo**: Google/Apple/Telefone/E-mail → Código → Nome/Data → Fotos → Selfie liveness opcional → Localização → App

---

## 🛡️ Segurança e Anti-Fake

| Recurso | Descrição |
| --- | --- |
| **Verificação de Selfie** | Liveness check opcional. Gera selo de perfil verificado. |
| **Detecção Multi-conta** | Bloqueio por dispositivo/IP pra evitar fakes. |
| **Denúncia 1-Clique** | Botão em todo perfil. Moderação em até 24h. |
| **Bloqueio Automático** | Usuário com 3+ denúncias válidas é suspenso. |
| **Criptografia** | HTTPS/TLS 1.3 em todo tráfego. Senhas Argon2id. |
| **Distância Aproximada** | Exibe "A menos de 500m". Nunca coordenadas exatas. |
| **Verificação Instagram** | Conecte seu perfil e ganhe selo azul. +40% matches. |

---

## 💰 Planos e Preços

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

### **Plano Premium - R$ 79,90/trimestre**
- Tudo do Essencial +
- **15 Super Likes/mês**
- **1 Boost/semana**: Perfil em destaque
- **Filtros exclusivos**: Altura e Escolaridade
- **Modo Radar Comercial**: Veja só quem está no mesmo local - shoppings, shows
- **Match Caminhos Cruzados 2.0**: Aviso: "Compatível a 200m de você agora"

### **Plano VIP - R$ 149,90/semestre**
- Tudo do Premium +
- **30 Super Likes/mês**
- **Modo Invisível**: Navegue sem aparecer em "quem visitou"
- **Selo VIP**: Destaque dourado no perfil
- **Suporte prioritário**

**Avulsos**: Super Like R$ 0,50 | Pacote 5 por R$ 1,99 | 15 por R$ 4,99 | 30 por R$ 8,99

**Indique e Ganhe**: Convide 3 amigos e ganhe 24h de Essencial ou +20 curtidas.

---

## 🔍 Filtros de Busca

| Filtro | Grátis | Essencial | Premium/VIP |
| --- | --- | --- | --- |
| **Gênero** | ✅ | ✅ | ✅ |
| **Idade 18-70** | ✅ | ✅ | ✅ |
| **Tom de cabelo** | ✅ | ✅ | ✅ |
| **Buscando** | ✅ | ✅ | ✅ |
| **Altura** | ❌ | ❌ | ✅ |
| **Escolaridade** | ❌ | ❌ | ✅ |

**Ordem do Feed**: Sempre do mais próximo pro mais distante. Sem algoritmo de ELO.

---

## 🛠️ Stack Técnica

| Tecnologia | Versão | Decisão de Arquitetura |
| --- | --- | --- |
| **React Native** | Expo SDK 51+ | OTA updates, build iOS sem Mac, DX superior |
| **Firebase** | v10+ | Auth + Firestore real-time + Storage + Functions |
| **TypeScript** | 5.3.3 | Type safety pra evitar bugs em produção |
| **AsyncStorage** | - | Persistência de sessão offline |
| **Expo SecureStore** | - | Tokens sensíveis criptografados no device |

### **Features de Engenharia Implementadas**

1. **Upload de Foto com Compliance LGPD**
   - Compressão client: 800px JPEG 70% via `expo-image-manipulator`
   - Validação server: `storage.rules` rejeita >2MB e MIME inválido
   - Anti-spam: `request.time > resource.metadata.ultimaFotoPerfil + duration.value(5, 'm')`
   - Deleção automática da foto antiga no Storage ao enviar nova
   - Path: `fotos_perfil/{uid}/{timestamp}.jpg`

2. **Arquitetura de Segurança**
   - **Firestore Rules**: Usuário só lê/escreve próprio doc. `matches` só se `uid` está no array
   - **Firebase Auth**: `initializeAuth` com `ReactNativeAsyncStorage` pra persistência
   - **Singleton Pattern**: Evita re-init do Firebase no hot reload do Metro
   - **Env Validation**: App não boota se `FIREBASE_API_KEY` não existir

3. **Performance e Bateria**
   - **Geolocalização**: `getCurrentPosition` só no boot. Background via Geofencing
   - **Paginação**: Firestore `limit(20)` + `startAfter` no feed
   - **Imagens**: `expo-image` com cache disk + memory

---

## ⚙️ Setup Local

### **Pré-requisitos**
- Node.js 18+
- Expo CLI: `npm i -g expo-cli`
- Conta Firebase com projeto criado

### **1. Instalação**
```bash
git clone https://github.com/eliasroberto26-arch/MeetPerto.git
cd MeetPerto
npm install
npx expo install firebase @react-native-async-storage/async-storage expo-image-picker expo-image-manipulator expo-secure-store expo-location
