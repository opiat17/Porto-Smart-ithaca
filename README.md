# 🚀 Porto Smart Account Builder

> **By affliction money** - Professional-grade tool for creating, testing, and farming Porto smart accounts with comprehensive automation features.

**Join our community**: [@afflictionmoney](https://t.me/afflictionmoney) 🚀

## ✨ Key Features

### 🎯 **Smart Account Management**
- **Porto Account Creation** - Generate smart accounts with real on-chain transactions
- **EOA Integration** - Private key-based wallet management
- **Multi-Account Support** - Process hundreds of accounts simultaneously
- **Local Storage** - Automatic account persistence and tracking
- **Random Interactions** - EOA can only interact with their own Porto accounts
- **Account Linking** - Maintains EOA ↔ Porto relationship for secure interactions
- **8 Random Action Types** - EXP-0001, EXP-0002, EXP-0003, Batch Execution, Protocol Interaction, Liquidity Provision, Swap Operations, Yield Farming

### 🔄 **Advanced Development Modes**
- **Basic Mode** - Standard Porto actions (EXP-0001, EXP-0002, EXP-0003)
- **Advanced Mode** - Protocol interactions (Uniswap, Compound, Aave)
- **Developer Mode** - Complex multi-call transactions and professional features

### ⚙️ **Automation & Optimization**
- **Circular Rotation** - Continuous 24/7 testing with account cycling
- **Smart Delays** - Configurable intervals (Light: 15-20s, Medium: 30-60s, Hard: 60-180s)
- **Auto Retry** - Automatic retry mechanism for failed transactions
- **Gas Optimization** - Dynamic gas pricing for cost efficiency

### 📱 **Monitoring & Notifications**
- **Telegram Integration** - Real-time notifications for all activities
- **Live Logging** - Professional logging system (Simple/Pro modes)
- **Transaction Tracking** - Complete history with BaseScan links
- **Progress Monitoring** - Real-time farming statistics

### 🎨 **Professional UI/UX**
- **Dark Theme** - Modern minimalist design with abstract elements
- **Responsive Design** - Works perfectly on all screen resolutions
- **Professional Logging** - Structured logs suitable for developer review
- **Export Functionality** - CSV and JSON export with complete account data

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### **Web3 & Blockchain**
- **Ethers.js v5** - Ethereum library for blockchain interactions
- **Base Sepolia** - Primary testnet for Porto development
- **Smart Contract Integration** - Real on-chain transactions

### **Architecture**
- **Component-Based** - Modular React architecture
- **State Management** - React hooks for state management
- **Local Storage** - Browser-based data persistence
- **REST API** - Telegram Bot API integration

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - Modern JavaScript runtime
- **npm/yarn** - Package manager
- **Private Keys** - EOA private keys for account creation
- **Telegram Bot** - Optional for notifications

### Installation

```bash
# Clone the repository
git clone https://github.com/opiat17/porto-farmer-ui.git
cd porto-farmer-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage Guide

### 1. **Account Setup**
```bash
# Prepare private keys file (example_keys.txt)
0x1234567890abcdef...
0xabcdef1234567890...
```

**💡 macOS Users**: Save your text file with UTF-8 encoding for best compatibility. The app now supports multiple encodings and will automatically detect the correct format.

### 2. **Development Configuration**
- **Upload Private Keys** - Import your EOA private keys
- **Select Development Mode** - Basic/Advanced/Developer
- **Configure Delays** - Smart or manual delay settings
- **Enable Features** - Circular rotation, Telegram notifications

### 3. **Start Development**
- **Single Account** - Test individual account creation
- **Mass Development** - Process all accounts sequentially
- **Circular Rotation** - Continuous 24/7 testing
- **Random Interactions** - EOA interacts only with their own Porto accounts

### 4. **Random Interactions System**
- **8 Action Types** - Diverse interaction patterns
- **Secure Linking** - EOA ↔ Porto relationship maintained
- **Gas Optimization** - Automatic balance checking
- **History Tracking** - Complete interaction logs

## 🔧 Configuration

### **Development Modes**

#### **Basic Mode** 🟢
- Standard Porto actions
- EXP-0001: Smart Account Creation
- EXP-0002: Key Authorization
- EXP-0003: Orchestrator Integration
- Perfect for beginners

#### **Advanced Mode** 🟠
- Protocol interactions
- Uniswap, Compound, Aave integration
- Auto-retry functionality
- Enhanced logging
- Suitable for experienced users

#### **Developer Mode** 🔴
- Complex multi-call transactions
- Professional-grade features
- Maximum retry attempts
- Detailed technical logging
- For developers and power users

### **Delay Settings**

#### **Smart Delays**
- **Light**: 15-20 seconds (fast testing)
- **Medium**: 30-60 seconds (balanced)
- **Hard**: 60-180 seconds (stealth mode)

#### **Manual Delays**
- Custom min/max ranges
- 1-300 seconds configurable
- Random intervals within range

### **Telegram Integration**

#### **Setup**
1. Create Telegram bot via @BotFather
2. Get bot token and chat ID
3. Enable notifications in app
4. Receive real-time updates

#### **Notifications**
- 🔄 Development start/stop
- ✅ Successful transactions
- ❌ Error reports
- 📊 Progress statistics

## 📊 Features Matrix

### ✅ **Core Features**
- [x] Porto smart account creation
- [x] Real on-chain transactions
- [x] Multi-account processing
- [x] Local storage persistence
- [x] Professional UI/UX

### ✅ **Advanced Features**
- [x] Circular rotation testing
- [x] Telegram notifications
- [x] Smart delay system
- [x] Auto-retry mechanism
- [x] Gas optimization

### ✅ **Developer Features**
- [x] Professional logging
- [x] CSV/JSON export
- [x] Transaction tracking
- [x] Error handling
- [x] Modular architecture

### ✅ **Random Interaction Features**
- [x] 8 diverse action types
- [x] Secure EOA ↔ Porto linking
- [x] Automatic gas optimization
- [x] Complete interaction history
- [x] Real-time statistics tracking

### ✅ **Development Features**
- [x] Multiple development modes
- [x] Protocol interactions
- [x] Progress monitoring
- [x] Statistics tracking
- [x] Export functionality

## 🎲 Random Interactions

### **Available Action Types**

#### **1. EXP-0001_SMART_ACCOUNT_CREATION**
- **Description**: Smart account creation and key authorization
- **Action**: Basic Porto account setup
- **Gas**: ~150,000 units

#### **2. EXP-0002_KEY_AUTHORIZATION**
- **Description**: Permission delegation and nonce setup
- **Action**: Key and session management
- **Gas**: ~180,000 units

#### **3. EXP-0003_ORCHESTRATOR_INTEGRATION**
- **Description**: Orchestrator integration and intent flow
- **Action**: Connect to orchestration system
- **Gas**: ~120,000 units

#### **4. BATCH_EXECUTION**
- **Description**: Batch operations with signature validation
- **Action**: Group transactions
- **Gas**: ~90,000 units

#### **5. PROTOCOL_INTERACTION**
- **Description**: DeFi protocol interactions
- **Action**: Work with Uniswap, Compound, Aave
- **Gas**: ~100,000 units

#### **6. LIQUIDITY_PROVISION** ⭐
- **Description**: Provide liquidity to pools
- **Action**: Add liquidity to DEX
- **Gas**: ~120,000 units

#### **7. SWAP_OPERATION**
- **Description**: Token swap operations
- **Action**: Swap between tokens
- **Gas**: ~80,000 units

#### **8. YIELD_FARMING**
- **Description**: Yield farming activities
- **Action**: Participate in yield farming protocols
- **Gas**: ~110,000 units

### **How Random Interactions Work**

1. **Random Selection** - System randomly chooses one of 8 action types
2. **EOA ↔ Porto Link** - Each EOA interacts only with their own Porto account
3. **Balance Check** - Automatic gas balance verification
4. **Execution** - Create and send transaction with appropriate data
5. **Logging** - Record all actions in interaction history

### **Interaction Statistics**

Each account tracks:
- **totalInteractions** - Total number of interactions
- **lastInteraction** - Timestamp of last interaction
- **interactions[]** - Array of all performed actions
- **Gas usage** - Detailed gas consumption per action

## 🎯 Development Strategy

### **For Smart Account Development**

#### **Basic Strategy**
1. **Create Multiple Accounts** - Use different private keys
2. **Regular Activity** - Maintain consistent interaction
3. **Network Diversity** - Test on multiple networks
4. **Track Progress** - Monitor all activities

#### **Advanced Strategy**
1. **Circular Rotation** - 24/7 continuous testing
2. **Protocol Interactions** - Engage with DeFi protocols
3. **Smart Delays** - Natural activity patterns
4. **Telegram Monitoring** - Real-time progress tracking

#### **Developer Strategy**
1. **Complex Transactions** - Multi-call operations
2. **Professional Logging** - Detailed activity records
3. **Export Data** - Complete transaction history
4. **Showcase Skills** - Demonstrate technical expertise

### **Best Practices**

#### **Account Management**
- Use **unique private keys** for each account
- **Backup account data** regularly
- **Monitor gas costs** and optimize
- **Track transaction history** for analysis

#### **Development Optimization**
- **Start with Basic mode** for testing
- **Graduate to Advanced** for efficiency
- **Use Developer mode** for maximum impact
- **Enable circular rotation** for 24/7 testing

#### **Risk Management**
- **Test on testnets** first
- **Monitor gas prices** before transactions
- **Use auto-retry** for failed transactions
- **Keep private keys secure**

## 📦 Project Structure

```
porto-farmer-ui/
├── src/
│   ├── components/
│   │   └── App.tsx              # Main application component
│   └── main.tsx                 # Application entry point
├── public/
├── package.json                 # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── example_keys.txt            # Sample private keys
└── README.md                   # This file
```

## 🔧 Advanced Configuration

### **Environment Variables**
```bash
# Optional: Custom RPC endpoints
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id
```

### **Custom Networks**
```typescript
// Add custom networks in App.tsx
const customNetworks = {
  'Custom Network': {
    chainId: 12345,
    rpcUrl: 'https://your-rpc-url.com'
  }
}
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Fork this repository
2. Connect GitHub to Vercel
3. Deploy automatically
4. Configure environment variables

### **Manual Deployment**
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
# Examples: Netlify, GitHub Pages, AWS S3
```

## 🧪 Testing

### **Local Development**
```bash
# Start development server
npm run dev

# Open http://localhost:5173
# Upload example_keys.txt for testing
```

### **Production Testing**
```bash
# Build and preview
npm run build
npm run preview

# Test all features
# Verify Telegram notifications
# Check export functionality
```

## 📊 Performance Metrics

### **Speed**
- **Account Creation**: ~30 seconds per account
- **Transaction Processing**: ~15 seconds per transaction
- **Circular Rotation**: Continuous testing with configurable delays

### **Scalability**
- **Multi-Account Support**: Unlimited accounts
- **Memory Usage**: Optimized for large datasets
- **Storage**: Local browser storage with export

### **Reliability**
- **Auto-Retry**: Configurable retry attempts
- **Error Handling**: Comprehensive error management
- **Data Persistence**: Local storage backup

## 🤝 Contributing

### **Development Setup**
```bash
# Fork and clone
git clone https://github.com/your-username/porto-farmer-ui.git
cd porto-farmer-ui

# Install dependencies
npm install

# Start development
npm run dev
```

### **Contribution Guidelines**
1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### **Code Standards**
- **TypeScript** - Strict type checking
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting
- **React Best Practices** - Component architecture

## 📞 Support & Community

### **Getting Help**
- **GitHub Issues**: [Create an issue](https://github.com/opiat17/porto-farmer-ui/issues)
- **Telegram Group**: [@afflictionmoney](https://t.me/afflictionmoney) 🚀
- **Discord**: [Ithaca Community](https://discord.gg/ithaca)

### **Resources**
- **Porto Documentation**: [https://porto.sh](https://porto.sh)
- **Ithaca Labs**: [https://ithaca.xyz](https://ithaca.xyz)
- **Base Network**: [https://base.org](https://base.org)

## 🎯 Roadmap

### **Short Term (Q1 2024)**
- [ ] Real Porto SDK integration
- [ ] Multi-chain support expansion
- [ ] Advanced analytics dashboard
- [ ] Mobile app development

### **Medium Term (Q2 2024)**
- [ ] DeFi protocol integrations
- [ ] Social features and leaderboards
- [ ] Advanced development strategies
- [ ] Community governance

### **Long Term (Q3-Q4 2024)**
- [ ] AI-powered optimization
- [ ] Cross-chain development
- [ ] DAO integration
- [ ] Enterprise features

## 📄 License

**MIT License** - See [LICENSE](LICENSE) file for details

### **Usage Rights**
- ✅ **Commercial Use** - Use for business purposes
- ✅ **Modification** - Modify and adapt the code
- ✅ **Distribution** - Share and distribute
- ✅ **Private Use** - Use in private projects

## 🙏 Acknowledgments

### **Core Team**
- **Ithaca Labs** - For creating Porto SDK and ecosystem
- **Paradigm** - For backing and supporting the project
- **Base Team** - For providing excellent infrastructure

### **Open Source**
- **Ethers.js** - Ethereum library
- **React** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety

### **Community**
- **Porto Developers** - For feedback and testing
- **Smart Account Developers** - For real-world usage data
- **Open Source Contributors** - For improvements and bug fixes

---

## 🚀 **Ready to Develop?**

**Start your Porto development journey today!**

1. **Clone the repository**
2. **Upload your private keys**
3. **Configure development settings**
4. **Start circular rotation**
5. **Monitor via Telegram**

**Built with ❤️ for the Porto community**

**Tag @ithacaxyz and @gakonst if you find this useful!**

---

*"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb*

*"The best time to develop Porto was yesterday. The second best time is now." - Porto Developers*