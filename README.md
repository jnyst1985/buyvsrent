# Buy vs Rent Calculator

A comprehensive, currency-agnostic web application that helps users make informed financial decisions by comparing buying real estate versus renting and investing in the stock market. Built with modern web technologies and optimized for viral sharing.

🌐 **Live Site**: [buyvsrent.xyz](https://buyvsrent.xyz)  
📊 **Analytics**: Comprehensive user behavior tracking and optimization

## ✨ Key Features

### 🧮 Financial Analysis
- **Comprehensive Calculations**: All costs included (mortgage, taxes, insurance, maintenance, HOA, opportunity costs)
- **Currency Agnostic**: Works with any currency (USD, EUR, GBP, CAD, AUD, JPY, CNY, INR)
- **Tax Optimization**: Mortgage interest deduction, property tax deduction, capital gains calculations
- **Break-Even Analysis**: Identifies when buying becomes permanently better than renting

### 🎯 Smart Presets & UX
- **Quick Start Scenarios**: First-Time Buyer, Investment Property, Downsizing, Custom
- **Auto-Detection**: Real-time identification of active preset vs custom configuration
- **Visual Feedback**: Clear indicators for active scenarios and stale results
- **Stale Results Tracking**: Intelligent Calculate/Recalculate button states

### 📱 Viral Sharing System
- **Smart URL Optimization**: 70% shorter URLs with intelligent parameter encoding
- **Social Media Integration**: Platform-optimized sharing (Twitter, LinkedIn, WhatsApp)
- **Dynamic Messaging**: Emotional hooks and platform-specific content
- **Copy Shareable Results**: Formatted messages with optimized URLs

### 📊 Analytics & Insights
- **User Behavior Tracking**: Microsoft Clarity session recordings and heatmaps
- **Comprehensive Events**: Google Analytics 4 with custom dimensions
- **Performance Monitoring**: Core Web Vitals and error tracking
- **Growth Metrics**: Viral coefficient and sharing performance

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Vercel** - Deployment platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Development Setup
```bash
# Clone the repository
git clone https://github.com/jnyst1985/buyvsrent.git
cd buyvsrent

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Environment Variables (Optional)
```bash
# Copy example environment file
cp .env.example .env.local

# Add your analytics IDs (optional for development)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=XXXXXXXXXX
```

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── InputForm.tsx      # Main calculator interface
│   ├── PresetScenarios.tsx # Quick start scenarios
│   ├── ResultsDisplay.tsx  # Results visualization
│   └── ShareResults.tsx    # Sharing system
├── lib/                   # Utilities and business logic
│   ├── calculator.ts      # Core calculation engine
│   ├── urlSharing.ts      # URL optimization system
│   ├── presetDetection.ts # Smart preset detection
│   └── analytics.ts       # Event tracking
└── docs/                  # Comprehensive documentation
    ├── DEVELOPMENT.md     # Development guide
    ├── FEATURES.md        # Feature documentation
    ├── ROADMAP.md         # Future development plans
    └── ANALYTICS.md       # Analytics implementation
```

## 🎯 User Guide

### 1. Quick Start with Presets
- Choose from **First-Time Buyer**, **Investment Property**, or **Downsizing** scenarios
- Parameters auto-populate with realistic defaults
- Visual indicators show which preset is active

### 2. Custom Configuration  
- Modify any parameter to create custom scenarios
- System automatically switches to "Custom" preset
- Real-time validation and feedback

### 3. Results Analysis
- **Summary cards**: Quick comparison of both scenarios
- **Winner announcement**: Clear recommendation with dollar difference
- **Interactive charts**: Visual net worth progression over time
- **Detailed breakdown**: Year-by-year analysis and cost summaries

### 4. Sharing Results
- **Copy shareable link**: Optimized URLs with custom messaging
- **Social media**: Platform-specific sharing (Twitter, LinkedIn, WhatsApp)
- **Professional reports**: Detailed analysis for decision-making

## 🔧 Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Import repository in Vercel dashboard
3. Add environment variables in Vercel settings
4. Deploy with default Next.js settings

### Other Platforms
- **Netlify**: Compatible with static export
- **AWS Amplify**: Supports Next.js deployment
- **Railway/Render**: Node.js hosting platforms

## 📊 Analytics & Performance

### Monitoring Setup
- **Google Analytics 4**: User behavior and conversion tracking
- **Microsoft Clarity**: Session recordings and heatmaps
- **Core Web Vitals**: Performance monitoring
- **Error tracking**: Application stability monitoring

### Key Metrics
- **Calculation completion rate**: Target >60%
- **Share rate**: Target >10% of calculations
- **Viral coefficient**: New users per share
- **Mobile performance**: <3s load time

## 🛠️ Development Workflow

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run build  # Includes TypeScript validation

# Testing (when implemented)
npm test
```

### Git Workflow
1. **Feature branches**: Create from `main` for new features
2. **Commit messages**: Descriptive with context
3. **Pull requests**: Code review before merging
4. **Auto-deployment**: Vercel deploys on push to `main`

## 📋 Contributing

### Development Guidelines
1. **Read documentation**: Start with `DEVELOPMENT.md`
2. **Follow TypeScript**: Maintain type safety
3. **Test thoroughly**: All devices and scenarios
4. **Update docs**: Keep documentation current

### Priority Areas
- **Phase 4A**: Visual content generation for sharing
- **Performance optimization**: Core Web Vitals improvement  
- **SEO enhancement**: Content and technical optimization
- **Feature refinement**: Based on user feedback

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)**: Complete development guide and architecture
- **[FEATURES.md](./FEATURES.md)**: Detailed feature documentation and implementation
- **[ROADMAP.md](./ROADMAP.md)**: Future development plans and priorities
- **[ANALYTICS.md](./ANALYTICS.md)**: Analytics implementation and KPIs

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/jnyst1985/buyvsrent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jnyst1985/buyvsrent/discussions)
- **Documentation**: Comprehensive guides in `/docs` folder