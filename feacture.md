# Restaurant AI Business Consultant — MVP Feature + User Flow

## 1. Product Overview

### Product Vision
Build an AI business consulting app for restaurant owners that turns their business data into clear, practical actions to improve profit, operations, and growth.

### Core Value Proposition
Most restaurant owners already have data, but they do not have time, systems, or expertise to interpret it well. This product acts like an always-on AI consultant that:

- analyzes restaurant performance
- identifies problems and opportunities
- recommends specific next steps
- tracks whether those actions worked

### MVP Goal
The MVP should **not** try to become a full restaurant operating system.  
Instead, it should prove one thing:

> If a restaurant owner uploads their core business data, the AI can generate advice that feels useful, specific, and worth paying for.

---

## 2. Target User

### Primary User
Independent restaurant owners and small restaurant groups with 1–5 locations.

### Ideal Early Adopter Profile
A restaurant owner who:
- already tracks some business data
- has recurring problems with profit, sales, reviews, or menu performance
- does not have an internal analyst or consultant
- is willing to try software if it saves time and improves decisions

### User Problems
The target user often struggles with:
- not knowing why revenue or profit changed
- not knowing which menu items help or hurt margin
- not knowing what actions to prioritize
- having too much scattered data and no clear summary
- reading reviews but not turning them into operational improvements

---

## 3. MVP Scope

## What the MVP Must Do
The MVP should focus on 3 core jobs:

1. **Collect restaurant business information**
2. **Generate an AI business health diagnosis**
3. **Provide prioritized recommendations**

## What the MVP Will Not Do
To stay focused, the MVP should avoid:
- deep POS integrations in v1
- advanced forecasting
- automatic competitor scraping at full scale
- employee scheduling optimization
- inventory management
- CRM / loyalty automation
- multi-location enterprise analytics
- fully autonomous business actions

---

## 4. MVP Feature Set

## Feature 1: Business Onboarding
The user needs a simple way to tell the app about their restaurant.

### Inputs
The onboarding flow should collect:

#### A. Basic Business Information
- restaurant name
- cuisine type
- location
- number of seats
- opening hours
- service model (dine-in / takeout / delivery / hybrid)

#### B. Business Metrics
Manual input or CSV upload for:
- weekly or monthly revenue
- number of orders
- average order value
- food cost
- labor cost
- rent / fixed cost
- delivery app share

#### C. Menu Data
Manual entry or CSV upload for:
- item name
- category
- selling price
- estimated cost
- quantity sold

#### D. Customer Feedback Data
Manual paste or upload of:
- Google reviews
- Yelp reviews
- delivery platform reviews

### MVP Requirement
Keep input flexible. In v1, it is okay if the user manually enters data or uploads CSVs instead of connecting live systems.

---

## Feature 2: AI Health Check Report
After the user submits data, the AI generates a business diagnosis.

### Report Sections
The health check should summarize:

#### A. Revenue Health
- whether revenue is stable, rising, or declining
- whether order volume or ticket size is the main driver
- whether channel mix is risky

#### B. Margin Health
- whether food cost or labor cost is too high
- whether profit is likely being squeezed
- whether delivery apps are hurting margins

#### C. Menu Performance
- high-profit, high-demand items
- high-demand, low-profit items
- low-demand items that may need removal
- pricing opportunities

#### D. Customer Sentiment
- common complaints
- common positive themes
- operational issues found in reviews
- whether customer perception may be affecting growth

#### E. Top Risks
The report should identify 3–5 major business risks.

#### F. Top Opportunities
The report should identify 3–5 major growth opportunities.

### MVP Requirement
This report must feel:
- specific to the user’s business
- easy to understand
- concise enough to skim
- detailed enough to feel valuable

---

## Feature 3: Prioritized Recommendations
The AI should not just analyze data; it should recommend actions.

### Recommendation Format
Each recommendation should include:
- title
- problem being addressed
- why the AI recommends it
- expected business impact
- priority level
- effort level
- suggested timeline

### Example Recommendation Types
- remove low-performing menu items
- raise visibility of high-margin dishes
- adjust pricing on underpriced items
- reduce labor during low-demand hours
- improve response to repeated review complaints
- promote profitable combos or bundles
- reduce delivery platform dependence

### Recommendation Categories
Organize recommendations into:
- quick wins
- operational improvements
- strategic moves

### MVP Requirement
Each user should receive 5–10 recommendations max.  
Too many suggestions will reduce clarity and actionability.

---

## Feature 4: AI Chat with Business Context
The user should be able to ask follow-up questions about their data.

### Example Questions
- Why did my profit drop?
- Which menu items should I promote?
- Are my prices too low?
- What is the biggest issue in my reviews?
- Should I shorten my menu?
- Where should I focus this month?

### MVP Requirement
The chat should feel grounded in the uploaded data and prior report.  
It should not behave like a generic chatbot.

---

## Feature 5: Weekly Summary
The product should create a simple recurring summary experience.

### Weekly Summary Contents
- overall business trend
- biggest issue this week
- biggest opportunity this week
- 3 recommended actions
- metrics to watch next

### MVP Requirement
Even if automated delivery is not built yet, the product should still have a “Weekly Summary” screen or report output to simulate this future feature.

---

## 5. MVP User Flow

## Flow 1: New User Onboarding

### Step 1: Landing Page
The user arrives and sees:
- what the product does
- who it is for
- clear CTA: “Analyze My Restaurant”

### Step 2: Account Creation
User creates account or signs in.

### Step 3: Restaurant Setup
User enters:
- restaurant name
- type
- location
- service model
- basic business profile

### Step 4: Data Input
User uploads or manually enters:
- sales data
- menu data
- cost data
- review data

### Step 5: Confirmation
System checks submission and confirms:
- what data has been uploaded
- what is missing
- whether analysis can proceed

### Step 6: Generate Report
System processes data and creates:
- health check
- risks
- opportunities
- recommendations

### Step 7: Results Dashboard
User lands on their personalized dashboard.

---

## Flow 2: Reviewing AI Insights

### Step 1: Dashboard Overview
The user sees:
- business health score or summary status
- top 3 problems
- top 3 recommendations
- key metrics snapshot

### Step 2: Open Full Health Check
The user clicks into the full report and reads:
- revenue analysis
- margin analysis
- menu analysis
- customer sentiment analysis

### Step 3: Open Recommendations
The user sees recommended actions ranked by priority.

### Step 4: Ask Questions
The user enters AI chat and asks follow-up questions.

---

## Flow 3: Returning User Experience

### Step 1: User Logs In
The dashboard shows previous uploads and insights.

### Step 2: User Uploads New Data
They update new monthly or weekly numbers.

### Step 3: System Compares Against Previous Period
The AI generates:
- what changed
- what improved
- what worsened
- updated recommendations

### Step 4: User Tracks Suggested Actions
User can mark recommendations as:
- not started
- in progress
- completed

This does not need to be deeply developed in v1, but a simple status system would already add value.

---

## 6. Core Screens for MVP

## Screen 1: Landing Page
### Purpose
Explain the product and drive sign-up.

### Main Elements
- headline
- subheadline
- example dashboard preview
- CTA
- trust-building explanation of value

---

## Screen 2: Restaurant Setup Page
### Purpose
Collect core business identity info.

### Main Elements
- restaurant name
- cuisine type
- location
- service model
- number of locations
- business size

---

## Screen 3: Data Upload Page
### Purpose
Let users input business data.

### Main Elements
- upload CSV section
- manual entry fallback
- review paste box
- checklist of uploaded data
- progress indicator

---

## Screen 4: Analysis Loading / Processing Page
### Purpose
Create anticipation and explain what is being analyzed.

### Main Elements
- loading state
- list of analysis categories:
  - revenue
  - margin
  - menu
  - customer sentiment
- messaging that AI is generating tailored advice

---

## Screen 5: Dashboard
### Purpose
Provide top-level business snapshot.

### Main Elements
- key metrics summary
- top risks
- top opportunities
- top recommendations
- link to detailed report
- link to AI chat

---

## Screen 6: Health Check Report
### Purpose
Show detailed analysis.

### Main Sections
- revenue analysis
- cost and margin analysis
- menu analysis
- review analysis
- key findings

---

## Screen 7: Recommendations Page
### Purpose
Make advice actionable.

### Main Elements
- recommendation cards
- priority tag
- effort tag
- expected impact
- status tracking

---

## Screen 8: AI Consultant Chat
### Purpose
Answer user questions using uploaded business context.

### Main Elements
- chat history
- suggested questions
- business-aware answers
- links back to relevant report sections

---

## 7. Data Model for MVP

This does not need to be perfect yet, but a simple structure helps.

## Restaurant
- id
- owner_id
- name
- cuisine_type
- location
- service_model
- created_at

## Business Metrics
- restaurant_id
- period_start
- period_end
- revenue
- orders
- avg_order_value
- food_cost
- labor_cost
- fixed_cost
- delivery_share

## Menu Items
- restaurant_id
- item_name
- category
- price
- estimated_cost
- quantity_sold

## Reviews
- restaurant_id
- source
- review_text
- rating
- date

## Reports
- restaurant_id
- created_at
- summary
- risks
- opportunities
- recommendations

## Recommendation
- report_id
- title
- description
- reason
- priority
- effort
- status

---

## 8. MVP Success Criteria

The MVP succeeds if users say:
- “This feels relevant to my business.”
- “These recommendations are actually useful.”
- “This saved me time.”
- “I would use this again.”
- “I would pay for this if it keeps improving.”

### Quantitative MVP Signals
Good early signals might include:
- onboarding completion rate
- report generation completion rate
- percentage of users asking follow-up questions
- repeat uploads of new data
- number of recommendations marked complete
- willingness to pay / demo conversion / pilot interest

---

## 9. MVP Prioritization

## Must-Have
- account creation
- restaurant setup
- data input
- AI-generated health report
- recommendation engine
- business-aware AI chat
- dashboard

## Nice-to-Have
- recommendation status tracking
- weekly summary view
- simple trend comparison
- export report as PDF

## Later
- live POS integrations
- automated review syncing
- competitor intelligence
- multi-location benchmarking
- forecasting
- labor schedule optimization
- inventory insights

---

## 10. AI Logic Design for MVP

The AI should be designed to operate in a structured way.

### Step 1: Normalize Input Data
Convert uploaded restaurant data into clean categories.

### Step 2: Run Analysis Layers
Analyze:
- business performance
- margin structure
- menu performance
- customer sentiment

### Step 3: Generate Findings
Identify:
- biggest risks
- biggest opportunities
- likely root causes

### Step 4: Generate Recommendations
Create recommendations ranked by:
- impact
- urgency
- feasibility

### Step 5: Support Conversational Follow-Up
Allow user to ask natural-language questions grounded in report results.

---

## 11. Example User Journey

### Example User
Owner of a small Asian fusion restaurant.

### Their Input
- 3 months of revenue
- menu pricing and cost estimates
- quantity sold by item
- 40 recent Google reviews

### AI Output
The system tells them:
- delivery sales are growing but hurting margin
- two popular dishes have weak profitability
- one high-margin dish has low visibility
- reviews repeatedly mention slow service at dinner
- late evening labor may be too heavy for demand

### AI Recommendations
- raise price of two underpriced items
- feature one profitable dish higher on the menu
- reduce one low-selling menu item
- examine dinner staffing and prep process
- respond to service complaints with a clearer action plan

That is exactly the kind of result that makes the product feel real.

---

## 12. Key MVP Risks

## Risk 1: Generic Advice
If the recommendations feel generic, users will not trust the product.

### Mitigation
Tie every recommendation to specific user data.

## Risk 2: Too Much Friction in Data Entry
If uploading data is painful, users will drop off.

### Mitigation
Allow lightweight manual entry and CSV templates.

## Risk 3: Too Broad a Scope
Trying to solve every restaurant problem will weaken the MVP.

### Mitigation
Stay tightly focused on diagnosis + recommendations.

## Risk 4: Weak Trust
Restaurant owners may question whether the AI understands their business.

### Mitigation
Use clear reasoning and explain why each recommendation exists.

---

## 13. Recommended MVP Build Order

### Phase 1
- landing page
- auth
- restaurant setup
- manual data entry / CSV upload

### Phase 2
- AI health check generation
- recommendation engine
- dashboard

### Phase 3
- AI chat with report context
- recommendation tracking
- weekly summary page

### Phase 4
- polish
- export
- better analytics
- beta testing with real restaurant owners

---

## 14. One-Sentence Product Positioning

### Option A
An AI consultant for restaurant owners that turns business data into profit-driving actions.

### Option B
A restaurant intelligence app that helps owners understand what is hurting profit and what to do next.

### Option C
Your AI business advisor for running a smarter, more profitable restaurant.

---

## 15. Final MVP Definition

### MVP in One Sentence
A restaurant owner uploads their business data, receives an AI-generated health check and prioritized recommendations, and can ask follow-up questions through an AI consultant chat.

### MVP Promise
The first version should help restaurant owners answer:
- What is going wrong?
- What should I fix first?
- What action is most likely to improve my business?

If the MVP does that well, it is strong enough to validate the concept.
