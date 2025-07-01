# Buy vs Rent Calculator - Features Documentation

## 🏠 Core Calculator Features

### Comprehensive Financial Analysis
**Location**: `lib/calculator.ts`

#### Buy Scenario Calculations
- **Mortgage amortization**: Monthly payments with principal/interest breakdown
- **Property taxes**: Annual calculation with inflation adjustment
- **Homeowners insurance**: Annual premiums with inflation
- **HOA fees**: Monthly fees with annual increases
- **Maintenance costs**: Percentage of home value (typically 1-2%)
- **Closing costs**: One-time purchase fees (typically 2-3%)
- **Selling costs**: Real estate commissions and fees (typically 6%)
- **Property appreciation**: Annual home value growth
- **Tax benefits**: Mortgage interest and property tax deductions

#### Rent & Invest Scenario Calculations
- **Monthly rent**: With annual increases
- **Renter's insurance**: Annual premiums
- **Security deposit**: Opportunity cost calculation
- **Investment portfolio**: Stock market returns with dividend reinvestment
- **Expense ratios**: Index fund fees
- **Tax implications**: Capital gains on investment returns

#### Results Provided
- **Net worth comparison**: After accounting for all costs and selling expenses
- **Break-even analysis**: Year when buying becomes permanently better
- **Year-by-year breakdown**: Detailed annual progression
- **Total cost analysis**: Comprehensive expense summaries
- **Percentage difference**: Relative advantage calculation

## 🎯 Preset Scenarios System

### Available Presets
**Location**: `lib/presetDetection.ts`

#### 1. 🏠 First-Time Buyer
**Target User**: Young professional buying their first home
- Property Price: $350,000
- Down Payment: 10%
- Current Savings: $50,000
- Time Horizon: 30 years
- Monthly Rent Alternative: $2,000

#### 2. 📈 Investment Property
**Target User**: Real estate investor with significant capital
- Property Price: $600,000
- Down Payment: 25%
- Current Savings: $200,000
- Time Horizon: 20 years
- Monthly Rent Alternative: $3,500

#### 3. 🏡 Downsizing
**Target User**: Older homeowner buying a smaller home
- Property Price: $400,000
- Down Payment: 30%
- Current Savings: $150,000
- Time Horizon: 15 years (shorter mortgage)
- Monthly Rent Alternative: $2,200

#### 4. ⚙️ Custom
**Target User**: Users with unique situations
- **Behavior**: Automatically selected when parameters don't match any preset
- **Visual**: Amber highlighting to indicate modified/custom configuration

### Smart Preset Detection
**Implementation**: Real-time comparison of current inputs vs preset configurations

#### Detection Algorithm
1. **Deep object comparison**: Handles nested TypeScript interfaces
2. **Floating-point precision**: Rounds numbers for accurate comparison (6.5 vs 6.50)
3. **Currency adaptation**: Presets work with any selected currency
4. **Performance optimization**: useEffect with dependency tracking

#### Visual Feedback System
- **Active preset**: Blue border + background + "Active" indicator
- **Custom configuration**: Amber theme to show "modified" state
- **Hover states**: Preview effects on inactive presets
- **Real-time updates**: Automatic switching as parameters change

## 🔗 Smart URL Sharing System

### URL Optimization Strategy
**Location**: `lib/urlSharing.ts`

#### Parameter Reduction Techniques
1. **Skip defaults**: Only encode values different from defaults
2. **Short parameter names**: `pp` instead of `propertyPrice`
3. **Efficient encoding**: Numbers without unnecessary decimals
4. **Boolean optimization**: Simple true/false values

#### Before vs After Comparison
- **Original URLs**: 1200+ characters
- **Optimized URLs**: 100-200 characters typical
- **Reduction**: 70% average size decrease
- **Default scenario**: Just `buyvsrent.xyz` (no parameters needed)

#### Parameter Mapping
```typescript
// Examples of optimized parameter names
'pp' = propertyPrice           // $500000
'dp' = downPaymentPercent     // 20
'mr' = mortgageInterestRate   // 6.5
'rent' = monthlyRent          // 2500
'th' = timeHorizon            // 30
'c' = currency                // USD
```

#### Domain Handling
- **Development**: Uses `localhost:3000` for easy testing
- **Production**: Forces `buyvsrent.xyz` for consistent branding
- **Auto-detection**: Smart switching based on hostname

## 📱 Comprehensive Sharing System

### Share Options
**Location**: `components/ShareResults.tsx`

#### 1. Copy Shareable Results
**Behavior**: Copies formatted message + optimized URL to clipboard
**Format**: 
```
🏠 MIND BLOWN: Buying would save me $127,000 over 30 years vs renting! 
I thought renting was smarter... See your own numbers: https://buyvsrent.xyz?pp=450000&rent=2200
```

#### 2. Twitter Sharing
**Optimization**: Character-limited format for Twitter
**Hook Strategy**: Emotional hooks based on result magnitude
**Example**: 
```
🤯 Buying vs renting analysis: I'd save $127,000 over 30 years by buying! 
Totally changed my perspective. Check yours: [URL]
```

#### 3. LinkedIn Sharing
**Tone**: Professional, detailed explanation
**Content Strategy**: Emphasizes methodology and comprehensiveness
**Example**:
```
Surprising analysis: Buying would result in $127,000 more wealth over 30 years vs renting. 
This calculator accounts for all costs including maintenance, taxes, opportunity cost, etc. 
Worth running your own numbers: [URL]
```

#### 4. WhatsApp Sharing
**Style**: Conversational, casual tone
**Engagement**: Personal recommendation format
**Example**:
```
Holy crap! 😱 Just ran the numbers on buying vs renting and I'd be $127K better off buying over 30 years! 
You should check this calculator out: [URL]
```

### Dynamic Messaging System
**Algorithm**: Messages adapt based on:
1. **Result magnitude**: Different hooks for large vs small differences
2. **Winning scenario**: Buying vs renting specific messaging
3. **Platform context**: Professional vs casual tone
4. **Time horizon**: Includes specific year timeframe

## ⚠️ Stale Results UX System

### Problem Statement
Users would change parameters after calculation but results wouldn't update automatically, causing confusion about whether numbers were current.

### Solution Implementation
**Location**: `app/page.tsx`, `components/InputForm.tsx`, `components/ResultsDisplay.tsx`

#### State Management
```typescript
const [hasCalculated, setHasCalculated] = useState(false);
const [resultsStale, setResultsStale] = useState(false);
```

#### Visual Indicators

##### Calculate Button States
- **Initial**: Blue "Calculate" button
- **After calculation**: Blue "Calculate" (results fresh)
- **After parameter change**: Amber "Recalculate" button
- **Warning message**: "⚠️ Parameters changed - results may be outdated"

##### Results Panel Feedback
- **Fresh results**: Normal white background
- **Stale results**: Amber ring border around entire results panel
- **Header indicator**: "⚠️ Outdated" badge next to "Results" heading

#### User Flow
1. **Load page** → Blue calculate button
2. **Calculate** → Results appear, button stays blue
3. **Change any parameter** → Button turns amber, warning appears
4. **Results panel** → Gets amber border + outdated badge
5. **Recalculate** → Everything returns to fresh state

## 📊 Analytics & Tracking System

### Microsoft Clarity Integration
**Location**: `components/MicrosoftClarity.tsx`
**Purpose**: Session recordings and heatmaps
**Data Collected**:
- User interaction patterns
- Scroll behavior
- Click heatmaps
- Form interaction flows
- Mobile vs desktop usage

### Google Analytics Events
**Location**: `lib/analytics.ts`

#### Event Categories
1. **Calculation Events**
   - `calculate_complete`: When user finishes calculation
   - Properties: buy_net_worth, rent_net_worth, time_horizon, break_even_year, currency

2. **Form Interaction Events**
   - `parameter_change`: When user modifies any input
   - `preset_used`: When user selects a preset scenario

3. **Engagement Events**
   - `results_viewed`: Toggle between milestone and all years view
   - `share_results`: Track sharing method (link, twitter, linkedin, whatsapp)

4. **Navigation Events**
   - Page views and user flow tracking

#### Custom Dimensions Tracked
- **Financial Preference**: Whether buying or renting is better
- **Result Magnitude**: Large vs small differences
- **Preset Usage**: Which scenarios are most popular
- **Time Horizon**: Short vs long-term analysis
- **Geographic**: Via Google Analytics built-in

## 🎨 User Interface Features

### Responsive Design
**Breakpoints**:
- **Mobile**: < 768px (stack everything vertically)
- **Tablet**: 768px - 1024px (2-column form, 1-column results)
- **Desktop**: > 1024px (side-by-side layout)

### Component Hierarchy

#### Input Form (`components/InputForm.tsx`)
- **Preset scenarios**: 2x2 grid on mobile, 4 columns on desktop
- **Parameter sections**: General, Real Estate, Stock Market, Rental, Tax
- **Validation**: Real-time feedback on invalid inputs
- **Tooltips**: Contextual help for complex parameters

#### Results Display (`components/ResultsDisplay.tsx`)
- **Summary cards**: Side-by-side comparison of scenarios
- **Winner announcement**: Clear indication of better option
- **Sharing section**: Prominent placement after key results
- **Cost breakdown**: Detailed expense analysis
- **Interactive chart**: Visual comparison over time
- **Year-by-year table**: Toggle between milestone and full view

### Accessibility Features
- **Keyboard navigation**: Full tab order support
- **Screen reader support**: Proper ARIA labels
- **Color contrast**: WCAG AA compliant
- **Focus indicators**: Clear visual focus states
- **Alternative text**: All images have alt descriptions

## 🔧 Technical Implementation Details

### State Management Patterns
**Approach**: React useState hooks with prop drilling
**Key States**:
- `inputs`: Current calculation parameters
- `results`: Last calculation results
- `showResults`: Whether to display results panel
- `hasCalculated`: Whether user has run calculation
- `resultsStale`: Whether results match current inputs

### Performance Optimizations
- **Client-side calculations**: No server requests needed
- **Debounced operations**: Chart updates optimized
- **Lazy loading**: Results panel only renders when needed
- **Memoization**: Currency formatting cached

### Error Handling
- **Calculation errors**: Try-catch with user-friendly messages
- **Input validation**: Real-time feedback on invalid values
- **Network failures**: Graceful degradation for analytics
- **Browser compatibility**: Fallbacks for older browsers

### SEO Implementation
**Location**: `app/layout.tsx`, `app/page.tsx`
- **Meta tags**: Comprehensive title, description, keywords
- **Open Graph**: Social media preview optimization
- **Structured data**: JSON-LD for rich snippets
- **Semantic HTML**: Proper heading hierarchy
- **Content**: Educational section for keyword density

## 🚀 Growth & Monetization Features

### Viral Growth Mechanisms
1. **Compelling share messages**: Emotional hooks drive clicks
2. **Optimized URLs**: Short, clean links increase sharing
3. **Social media optimization**: Platform-specific content
4. **Preset scenarios**: Easy exploration encourages experimentation
5. **Educational content**: Builds trust and shareability

### Revenue Streams (Implemented)
- **Google AdSense**: Display advertising integration
- **Affiliate potential**: Ready for mortgage/investment product partnerships
- **Lead generation**: Email collection infrastructure in place

### Conversion Optimization
- **Fast time-to-value**: Calculator accessible immediately
- **Progressive disclosure**: Advanced features available but not overwhelming
- **Social proof**: Share functionality encourages usage
- **Clear value proposition**: Immediate, actionable insights