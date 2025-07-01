# Buy vs Rent Calculator - Analytics Documentation

## 📊 Analytics Implementation Overview

The application implements comprehensive user behavior tracking through two primary services:
- **Google Analytics 4**: Event tracking and conversion measurement
- **Microsoft Clarity**: Session recordings and heatmap analysis

## 🔍 Microsoft Clarity Integration

### Setup & Configuration
**File**: `components/MicrosoftClarity.tsx`
**Environment Variable**: `NEXT_PUBLIC_CLARITY_PROJECT_ID`

### Data Collected
1. **Session Recordings**
   - Full user interaction recordings
   - Form filling behavior
   - Navigation patterns
   - Error interactions

2. **Heatmaps**
   - Click density maps
   - Scroll behavior analysis
   - Mobile vs desktop usage patterns
   - Form interaction hotspots

3. **User Insights**
   - Dead clicks (non-interactive elements)
   - Rage clicks (frustrated user behavior)
   - Quick backs (immediate exits)
   - Form abandonment points

### Key Metrics to Monitor
- **Session duration**: How long users engage with calculator
- **Calculation completion rate**: % who finish the calculation
- **Form interaction patterns**: Which fields cause hesitation
- **Mobile usability**: Touch interaction effectiveness

## 📈 Google Analytics 4 Implementation

### Setup & Configuration
**File**: `components/GoogleAnalytics.tsx`
**Environment Variable**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Event Tracking System
**Implementation**: `lib/analytics.ts`

#### Event Categories Structure
```typescript
type EventCategory = 
  | 'calculation'      // Core calculator usage
  | 'engagement'       // User interaction depth
  | 'form_interaction' // Input and preset usage
  | 'navigation'       // Page flow and routing
  | 'error';          // Error tracking and debugging
```

## 📊 Detailed Event Documentation

### 1. Calculation Events

#### `calculate_complete`
**Triggered**: When user successfully completes a calculation
**Category**: `calculation`
**Custom Properties**:
```typescript
{
  buy_net_worth: number,        // Final net worth for buying scenario
  rent_net_worth: number,       // Final net worth for renting scenario
  time_horizon: number,         // Analysis period in years
  break_even_year: number|null, // Year when buying becomes better
  currency: string,             // Selected currency (USD, EUR, etc.)
  buy_better: boolean          // Whether buying scenario wins
}
```

**Analysis Use Cases**:
- Identify most common time horizons
- Track buy vs rent preference trends
- Analyze break-even patterns
- Currency usage by region
- Result magnitude distribution

### 2. Form Interaction Events

#### `parameter_change`
**Triggered**: When user modifies any calculator input
**Category**: `form_interaction`
**Properties**:
```typescript
{
  label: string,     // Field name (e.g., "propertyPrice", "monthlyRent")
  value: number      // New value (if numeric)
}
```

**Analysis Use Cases**:
- Identify most-adjusted parameters
- Track user exploration patterns
- Find fields causing confusion
- Optimize preset scenarios

#### `preset_used`
**Triggered**: When user selects a preset scenario
**Category**: `form_interaction`
**Properties**:
```typescript
{
  label: string      // Preset name ("🏠 First-Time Buyer", etc.)
}
```

**Analysis Use Cases**:
- Most popular scenario types
- Preset vs custom usage rates
- User journey patterns
- Market segment identification

### 3. Engagement Events

#### `results_viewed`
**Triggered**: When user toggles between milestone and all years view
**Category**: `engagement`
**Properties**:
```typescript
{
  label: 'milestone' | 'all_years'
}
```

**Analysis Use Cases**:
- Detail-seeking behavior
- User engagement depth
- Data presentation preferences

#### `share_results`
**Triggered**: When user shares calculation results
**Category**: `engagement`
**Properties**:
```typescript
{
  label: 'email' | 'link' | 'twitter' | 'linkedin' | 'whatsapp'
}
```

**Analysis Use Cases**:
- Most effective sharing channels
- Viral coefficient calculation
- Platform-specific optimization
- User advocacy measurement

### 4. Error Events

#### `error_occurred`
**Triggered**: When application errors occur
**Category**: `error`
**Properties**:
```typescript
{
  label: string,           // Error type identifier
  error_message: string    // Detailed error description
}
```

**Analysis Use Cases**:
- Technical issue identification
- User experience problem areas
- Browser/device compatibility issues

## 📋 Key Performance Indicators (KPIs)

### User Engagement Metrics
1. **Calculation Completion Rate**
   - Formula: `calculate_complete events / page views`
   - Target: >60%
   - Tracking: GA4 custom report

2. **Share Rate**
   - Formula: `share_results events / calculate_complete events`
   - Target: >10%
   - Tracking: GA4 conversion funnel

3. **Preset Usage Rate**
   - Formula: `preset_used events / calculate_complete events`
   - Target: >40%
   - Tracking: GA4 custom dimension

4. **Parameter Exploration Depth**
   - Formula: Average `parameter_change` events per session
   - Target: >5 changes per calculation
   - Tracking: GA4 engagement metrics

### Growth & Viral Metrics
1. **Viral Coefficient**
   - Formula: New users from shared links / total shares
   - Target: >0.5 (viral growth)
   - Tracking: UTM parameters + attribution

2. **Organic Traffic Growth**
   - Source: GA4 acquisition reports
   - Target: 20% month-over-month
   - Key terms: "buy vs rent calculator"

3. **Return User Rate**
   - Formula: Returning users / total users
   - Target: >30%
   - Tracking: GA4 user behavior reports

### Technical Performance Metrics
1. **Core Web Vitals**
   - **LCP (Largest Contentful Paint)**: <2.5s
   - **FID (First Input Delay)**: <100ms
   - **CLS (Cumulative Layout Shift)**: <0.1
   - Tracking: GA4 web vitals report

2. **Error Rate**
   - Formula: `error_occurred` events / total events
   - Target: <1%
   - Tracking: GA4 custom report

## 🎯 Analytics Dashboard Setup

### Recommended GA4 Reports

#### 1. Calculator Usage Report
**Metrics**: 
- Total calculations completed
- Average session duration
- Calculation completion rate by traffic source

**Dimensions**:
- Date range
- Traffic source/medium
- Device category

#### 2. User Behavior Funnel
**Steps**:
1. Page view
2. First parameter change
3. Calculation completed
4. Results shared

**Analysis**: Identify drop-off points and optimization opportunities

#### 3. Preset Scenario Analysis
**Metrics**:
- Preset usage distribution
- Completion rate by preset
- Share rate by preset

**Insights**: Which scenarios resonate most with users

#### 4. Sharing Performance Report
**Metrics**:
- Shares by platform
- Conversion from shared links
- Viral coefficient calculation

### Custom Audiences for Retargeting

#### 1. Calculator Completers
**Definition**: Users who triggered `calculate_complete` event
**Use Case**: Retargeting for related financial products

#### 2. High-Value Users
**Definition**: Users who shared results or used multiple presets
**Use Case**: Premium feature promotion

#### 3. Incomplete Users
**Definition**: Users who started but didn't complete calculation
**Use Case**: Optimization and re-engagement campaigns

## 🔧 Implementation Guidelines

### Event Tracking Best Practices

#### 1. Consistent Naming
```typescript
// Good: Descriptive and consistent
trackEvent({ category: 'form_interaction', action: 'parameter_change', label: 'propertyPrice' });

// Avoid: Vague or inconsistent
trackEvent({ category: 'interaction', action: 'change', label: 'field1' });
```

#### 2. Meaningful Properties
```typescript
// Include relevant context
trackCalculation({
  buyNetWorth: results.buyScenarioNetWorth,
  rentNetWorth: results.rentScenarioNetWorth,
  timeHorizon: inputs.general.timeHorizon,
  breakEvenYear: results.breakEvenYear,
  currency: inputs.general.currency,
});
```

#### 3. Error Handling
```typescript
// Wrap analytics calls to prevent breaking user experience
try {
  trackEvent(eventData);
} catch (error) {
  console.error('Analytics tracking failed:', error);
  // Continue normal app operation
}
```

### Privacy Considerations

#### 1. No Personal Data Collection
- No email addresses, names, or contact information
- No financial account details or sensitive data
- Only anonymous usage patterns and preferences

#### 2. Data Retention
- GA4: 14 months automatic retention
- Clarity: 3 months session recording retention
- No long-term personal data storage

#### 3. Compliance
- GDPR: Anonymous usage data, no consent required
- CCPA: No personal information collection
- Cookie usage: Analytics cookies only

## 📊 Monitoring & Alerting

### Key Alerts to Set Up

#### 1. Error Rate Spike
- **Condition**: Error events > 5% of total events
- **Action**: Immediate technical investigation
- **Platform**: GA4 Intelligence alerts

#### 2. Conversion Drop
- **Condition**: Calculation completion rate drops >20%
- **Action**: UX investigation and user feedback
- **Platform**: GA4 custom alerts

#### 3. Traffic Anomaly
- **Condition**: Daily users vary >50% from rolling average
- **Action**: Investigate traffic sources and potential issues
- **Platform**: GA4 Intelligence alerts

### Regular Review Schedule

#### Weekly Reviews
- Calculation completion rates
- Popular preset scenarios
- Sharing performance metrics
- Error rates and technical issues

#### Monthly Reviews
- User growth and retention
- Viral coefficient analysis
- Feature adoption rates
- Performance optimization opportunities

#### Quarterly Reviews
- Comprehensive funnel analysis
- User persona validation
- Feature roadmap prioritization
- Competitive analysis integration

## 🚀 Advanced Analytics Opportunities

### A/B Testing Framework
**Future Implementation**: Test messaging, UI elements, preset scenarios
**Tools**: GA4 Experiments or third-party solutions
**Key Tests**: 
- Share message variations
- Preset scenario descriptions
- Results presentation formats

### Cohort Analysis
**Implementation**: Track user behavior over time
**Insights**: User lifecycle understanding, feature adoption patterns
**Use Cases**: Product development prioritization

### Attribution Modeling
**Implementation**: Multi-touch attribution for shared links
**Insights**: True viral coefficient and sharing effectiveness
**Requirements**: Enhanced UTM parameter tracking

### Predictive Analytics
**Future Opportunity**: ML models for user behavior prediction
**Use Cases**: Churn prevention, feature recommendation, optimization
**Requirements**: Sufficient data volume and advanced analytics setup