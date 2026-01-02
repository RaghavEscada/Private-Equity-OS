# 📄 One-Pager Generator - How It Works

## 🎯 What Is It?

The **One-Pager Generator** creates a professional, AI-powered company overview document perfect for:
- Investment memos
- Team briefings
- Investor presentations
- Quick company summaries
- Due diligence reports

---

## 🚀 How to Use

### Step 1: Open a Deal
1. Go to the **Deals CRM** (`/deals`)
2. Click on any deal card
3. You'll be taken to the deal detail page (`/deals/[id]`)

### Step 2: Generate One-Pager
1. Look at the **top-right corner** of the deal page header
2. Click the **"Generate One-Pager"** button (blue button with document icon)
3. Wait 5-10 seconds while AI generates the document

### Step 3: Review & Export
1. The one-pager appears in a modal dialog
2. Review the formatted content
3. Choose your action:
   - **Copy** - Copy text to clipboard
   - **Download PDF** - Download as PDF (opens print dialog)

---

## 🔍 Where Is the Button?

The button is located in the **header** of each deal detail page:

```
┌─────────────────────────────────────────────────────┐
│ ← Back to CRM | Company Name    [Generate One-Pager] │
└─────────────────────────────────────────────────────┘
```

**If you don't see it:**
- Make sure you're on a deal detail page (`/deals/[id]`)
- Refresh your browser (Ctrl+R or Cmd+R)
- Check that the deal loaded successfully
- The button is **blue** with a document icon

---

## 🤖 How Does It Work?

### 1. **Data Collection**
The AI gathers all available deal information:
- Company name, sector, geography
- Executive summary, key risks
- Financial metrics (ARR, MRR, revenue, margins, etc.)
- Competitors and competitive advantages
- Analyst notes and deal status

### 2. **AI Processing**
- Uses **GPT-4o** to analyze the data
- Creates structured sections:
  - Company Overview
  - Product & Solutions
  - Business Model & Revenue
  - Financial Performance
  - Market Position
  - Go-to-Market Strategy
  - Operations & Team
  - Strategic Positioning

### 3. **Formatting**
- Professional markdown formatting
- Clean section headers
- Bullet points and structured lists
- Data-driven insights

### 4. **Export Options**
- **Copy**: Plain text for pasting anywhere
- **PDF**: Formatted HTML that opens in print dialog
  - Click "Save as PDF" in the print dialog
  - Or use browser's "Print to PDF" option

---

## 📋 What Information Is Included?

The one-pager includes:

### ✅ Always Included:
- Company name and basic info
- Industry/sector
- Business model description
- Product overview
- Market positioning

### 📊 If Available:
- Financial metrics (revenue, ARR, MRR, margins)
- Growth rates and trends
- Customer metrics (count, ACV, retention)
- Unit economics (CAC, LTV, LTV:CAC)
- Cash position and runway
- Team size and structure

### 📝 If Provided:
- Executive summary
- Key risks and concerns
- Competitors and competitive advantages
- Notable clients/partnerships
- Go-to-market strategy

---

## 💡 Tips for Best Results

### 1. **Fill in Deal Information First**
- More data = better one-pager
- Add financial metrics if available
- Include executive summary and key risks

### 2. **Update After Transcripts**
- Upload call transcripts
- Approve extracted information
- Generate one-pager again to include new data

### 3. **Customize After Generation**
- Copy the content
- Edit in your preferred editor
- Add company-specific details

### 4. **Use for Multiple Purposes**
- **Internal**: Team briefings, deal reviews
- **External**: Investor updates, partner presentations
- **Documentation**: Due diligence records

---

## 🎨 PDF Export Details

### How PDF Export Works:
1. Click **"Download PDF"**
2. Browser opens print dialog
3. Select **"Save as PDF"** or **"Print to PDF"**
4. Choose location and save

### PDF Features:
- Professional formatting
- Clean typography
- Proper page breaks
- Company header with name
- Generation date
- Print-ready layout

### Browser Compatibility:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile: View only (use desktop for PDF)

---

## 🔧 Technical Details

### API Endpoint:
- **Route**: `/api/generate-onepager`
- **Method**: POST
- **Model**: GPT-4o
- **Max Tokens**: 2000
- **Temperature**: 0.7 (balanced creativity/accuracy)

### Data Flow:
```
Deal Page → Click Button → API Call → GPT-4o → Format → Display → Export
```

### Performance:
- **Generation Time**: 5-10 seconds
- **Token Usage**: ~1500-2000 tokens per generation
- **Cost**: ~$0.01-0.02 per one-pager (GPT-4o pricing)

---

## ❓ Troubleshooting

### Button Not Visible?
1. **Refresh the page** (Ctrl+R / Cmd+R)
2. **Check URL**: Should be `/deals/[id]`
3. **Check console**: Look for JavaScript errors
4. **Try different deal**: Some deals may not load properly

### Generation Fails?
1. **Check internet connection**
2. **Verify OpenAI API key** is set in environment
3. **Check browser console** for error messages
4. **Try again** - sometimes API calls timeout

### PDF Not Downloading?
1. **Check popup blocker** - allow popups for the site
2. **Use Chrome/Edge** for best PDF support
3. **Try "Copy" first** - paste into Word/Google Docs
4. **Use browser print** - Ctrl+P → Save as PDF

### Content Looks Wrong?
1. **Update deal data** - more info = better output
2. **Regenerate** - AI output can vary
3. **Edit manually** - copy and customize
4. **Check deal fields** - ensure data is accurate

---

## 📊 Example Output Structure

```
Company Overview
├── Company Name: [Name]
├── Industry: [Sector]
├── Business Model: [Description]
└── Team Size: [Number]

Product & Solutions
├── Core Products
├── Key Features
└── Target Market

Business Model & Revenue
├── Revenue Streams
├── Pricing Model
└── Revenue Mix

Financial Performance
├── Revenue: $X
├── Growth Rate: Y%
└── Margins: Z%

Market Position
├── Target Segments
├── Notable Clients
└── Competitive Advantages

Go-to-Market Strategy
├── Sales Channels
├── Marketing Approach
└── Partnerships

Operations & Team
├── Team Structure
├── Operational Capabilities
└── Scalability

Strategic Positioning
├── Key Strengths
├── Market Differentiation
└── Long-term Positioning
```

---

## ✅ Success Checklist

- [ ] Button visible in deal header
- [ ] Clicking button opens modal
- [ ] AI generates content (5-10 seconds)
- [ ] Content displays properly formatted
- [ ] Copy button works
- [ ] PDF download opens print dialog
- [ ] PDF saves successfully

---

**Status**: ✅ Fully Functional  
**Location**: Deal Detail Page Header  
**Button Color**: Blue  
**Icon**: Document/FileText

---

Need help? Check the browser console for errors or contact support!










