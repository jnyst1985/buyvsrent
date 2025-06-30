# Product Requirements Document: Buy vs. Invest Calculator

## 1. Executive Summary

### Product Vision
A web-based financial calculator that helps users make informed decisions between buying real estate or investing in the stock market while renting, by comparing the total asset value at the end of a mortgage term.

### Key Value Proposition
- Currency-agnostic comparison tool
- Comprehensive financial modeling including all costs and benefits
- Clear visualization of long-term financial outcomes
- Data-driven decision support for one of life's biggest financial choices

## 2. User Personas

### Primary Persona: First-Time Home Buyer
- Age: 25-40
- Considering purchasing their first property
- Has savings for a down payment
- Uncertain whether buying or continuing to rent and invest is better

### Secondary Persona: Real Estate Investor
- Age: 30-55
- Evaluating investment properties vs. stock market returns
- Experienced with financial planning
- Needs detailed analysis for investment decisions

## 3. Functional Requirements

### 3.1 Input Parameters

#### General Parameters
- **Currency Selection** (dropdown)
- **Time Horizon** (years - default to typical mortgage term)
- **Current Savings** (available for down payment or investment)

#### Real Estate Parameters
- **Property Price**
- **Down Payment** (% or absolute value)
- **Mortgage Interest Rate** (%)
- **Mortgage Term** (years)
- **Property Tax** (annual % of property value)
- **Homeowners Insurance** (annual amount)
- **HOA/Condo Fees** (monthly)
- **Maintenance Costs** (annual % of property value, default 1%)
- **Closing Costs** (% of property price, default 2-3%)
- **Selling Costs** (% of property price, default 6-7%)
- **Property Appreciation Rate** (annual %)
- **Property Tax Increase Rate** (annual %)

#### Stock Market Parameters
- **Expected Annual Return** (%, default 7-10%)
- **Dividend Yield** (%, default 1.5-2%)
- **Investment Expense Ratio** (%, default 0.1-0.5%)
- **Initial Investment Amount** (same as down payment)
- **Monthly Investment Amount** (equivalent to mortgage payment - rent)

#### Rental Parameters
- **Monthly Rent**
- **Annual Rent Increase** (%, default 3-5%)
- **Renter's Insurance** (monthly)
- **Security Deposit** (months of rent)

#### Tax Parameters
- **Income Tax Bracket** (%)
- **Capital Gains Tax Rate** (%)
- **Mortgage Interest Deduction** (toggle on/off)
- **Property Tax Deduction** (toggle on/off)
- **Standard Deduction Amount**

### 3.2 Calculations

#### Real Estate Calculations
1. **Monthly Mortgage Payment** (Principal + Interest)
2. **Total Monthly Housing Cost** (Mortgage + Tax + Insurance + HOA + Maintenance)
3. **Tax Savings** from deductions
4. **Home Equity** at each year
5. **Property Value** at end of term
6. **Net Proceeds** after selling costs
7. **Total Cost of Ownership**

#### Investment Calculations
1. **Initial Investment** (down payment equivalent)
2. **Monthly Investment** (Housing cost - Rent)
3. **Investment Growth** with compound returns
4. **Dividend Reinvestment**
5. **Total Portfolio Value** at end of term
6. **After-tax Portfolio Value**

### 3.3 Output Display

#### Summary Results
- **Total Net Worth - Buy Scenario**: Property value (after selling costs) + Remaining savings
- **Total Net Worth - Rent & Invest Scenario**: Investment portfolio value (after taxes)
- **Difference**: Absolute and percentage difference
- **Break-even Point**: Year when buying becomes more profitable (if applicable)

#### Detailed Visualizations
1. **Net Worth Over Time** (line chart comparing both scenarios)
2. **Cash Flow Comparison** (monthly/annual)
3. **Equity vs. Investment Growth** (stacked area chart)
4. **Cost Breakdown** (pie charts for each scenario)
5. **Sensitivity Analysis** (how results change with key variables)

### 3.4 Additional Features

#### Save/Share Functionality
- Generate shareable link
- Export to PDF report
- Save scenarios for comparison

#### Presets
- Location-based defaults (average home prices, rent, taxes)
- Conservative/Moderate/Aggressive investment return scenarios
- Different mortgage terms (15/20/30 years)

## 4. Technical Requirements

### 4.1 Frontend
- **Framework**: React or Vue.js
- **Styling**: Tailwind CSS or Material-UI
- **Charts**: Chart.js or D3.js
- **State Management**: Redux or Vuex
- **Form Validation**: Real-time input validation

### 4.2 Backend (Optional for MVP)
- **API**: RESTful API for calculations
- **Database**: Store user scenarios (PostgreSQL)
- **Authentication**: Optional user accounts

### 4.3 Deployment
- **Hosting**: Vercel, Netlify, or AWS
- **Domain**: Custom domain with SSL
- **Analytics**: Google Analytics or Plausible

## 5. User Interface Design

### 5.1 Layout Structure
```
┌─────────────────────────────────────┐
│          Header/Navigation          │
├─────────────────────────────────────┤
│  Input Form  │   Results Display    │
│              │                      │
│  - General   │   - Summary Cards    │
│  - Real      │   - Charts           │
│    Estate    │   - Detailed         │
│  - Stocks    │     Breakdown        │
│  - Rental    │                      │
│  - Taxes     │                      │
│              │                      │
│ [Calculate]  │  [Export] [Share]    │
└─────────────────────────────────────┘
```

### 5.2 Mobile Responsiveness
- Stacked layout on mobile
- Collapsible input sections
- Swipeable chart views

## 6. MVP Scope

### Phase 1 (MVP) - 4-6 weeks
- Basic input form with all parameters
- Core calculation engine
- Simple results display (numbers only)
- One comparison chart
- Desktop-optimized

### Phase 2 - 2-3 weeks
- Additional visualizations
- Mobile optimization
- Save/share functionality
- Input validation and error handling

### Phase 3 - 3-4 weeks
- Location-based presets
- Sensitivity analysis
- PDF export
- Advanced scenarios (e.g., ARM mortgages)

## 7. Success Metrics

- **User Engagement**: Average time on site > 5 minutes
- **Completion Rate**: > 70% of users who start complete a calculation
- **Return Users**: > 30% return within 30 days
- **Sharing Rate**: > 10% of users share results

## 8. Risks and Mitigation

### Technical Risks
- **Complex Calculations**: Thoroughly test edge cases
- **Performance**: Optimize calculations for real-time updates

### User Experience Risks
- **Information Overload**: Progressive disclosure of advanced options
- **Accuracy Concerns**: Clear disclaimers about assumptions

## 9. Future Enhancements

- Integration with real estate APIs for property data
- Historical market data integration
- Scenario comparison (multiple properties/portfolios)
- Educational content and tooltips
- Multi-language support
- API for third-party integration