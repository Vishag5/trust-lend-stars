--# LenTrust - Complete Feature Specification

## Overview

LenTrust is a trust-based agreement management platform that helps people create, track, and enforce three types of agreements: Money Loans, Item Loans, and Service Agreements. The platform provides legal upgrade options to make agreements more enforceable and includes a reliability scoring system to help users make informed decisions about who they transact with.

---

## Core Concept

The platform operates on a **two-phase proof system** for every agreement:

1. **Phase A (Activation)**: The lender/provider must prove they delivered what was promised (disbursed money, handed over item, or started the service)
2. **Phase B (Settlement)**: The borrower/receiver must prove they returned what was owed (repaid money, returned item, or completed service payment)

Both phases require **human approval** from the counterparty, ensuring both sides agree on what actually happened.

---

## Agreement Types

### 1. Money Loan Agreements

**What it is**: A formal agreement where one person lends money to another, with a clear repayment deadline.

**Minimum Amount**: ₹100 (enforced to ensure serious agreements)

**Timeline**: Repayment must be due between 48 hours and 90 days from creation

**How it works**:
1. **Creation**: Either person can initiate. The borrower receives a request that shows: amount to be borrowed, repayment deadline, reason for the loan, and any attached documents
2. **Lender Response**: The lender can accept (by uploading proof of disbursal like a bank transfer screenshot) or reject the request
3. **Borrower Verification**: Once the lender uploads disbursal proof, the borrower must verify they actually received the money. If they approve, the agreement becomes Active
4. **Active Period**: The agreement shows how many days remain until repayment is due
5. **Repayment**: When ready, the borrower uploads repayment proof (bank transfer screenshot, payment receipt)
6. **Final Verification**: The lender reviews the repayment proof and either approves (agreement becomes Settled) or rejects (borrower must provide new proof)

**Key Features**:
- Clear due date countdown
- Visual status tracking (Requested → Pending Disbursal → Active → Due → Pending Settlement → Settled)
- Automatic reminders as deadline approaches
- Option to request deadline extensions (up to 3 times)

---

### 2. Item Loan Agreements

**What it is**: A formal agreement where one person lends a physical item to another, with a clear return deadline and documented item condition.

**No Minimum Value**: Can be used for any item (from books to expensive equipment)

**Timeline**: Return must be due between 48 hours and 90 days from creation

**How it works**:
1. **Creation**: The borrower requests to borrow an item. They must specify: item name, estimated value, return deadline, reason for borrowing, and any attachments
2. **Lender Response**: The lender can accept or reject. If accepting, they must photograph the item's current condition (multiple angles recommended) and upload these as **condition photos**
3. **Item Handover**: Along with condition photos, the lender uploads proof of handover (photo of the person receiving the item, or signed handover note)
4. **Borrower Verification**: The borrower must verify they received the item in the documented condition. If approved, agreement becomes Active
5. **Active Period**: The agreement shows the return deadline with condition photos always visible for reference
6. **Return Process**: When returning, the borrower uploads proof of return (photo of returning the item, or signed return receipt)
7. **Final Verification**: The lender reviews the return proof and condition. If item is returned satisfactorily, they approve and agreement becomes Settled. If damaged or not returned properly, they can reject and request new proof

**Key Features**:
- **Condition Documentation**: Multiple photos preserved throughout the agreement lifecycle
- **Estimated Value**: Helps establish the item's worth for trust/reliability calculations
- **Return Status Tracking**: Clear visibility of who has the item at any time
- **Dispute Protection**: Condition photos serve as evidence if disagreements arise

**Important Rule**: The lender **cannot** activate the agreement without uploading at least one condition photo. This ensures there's always documentation of the item's state.

---

### 3. Service Agreement

**What it is**: A formal agreement where one person provides a service to another, broken down into specific milestones with individual deadlines and payments.

**Flexibility**: Can have 1 or more milestones, each with its own deliverable, deadline, and payment amount

**Timeline**: Final milestone must be due between 48 hours and 90 days from creation

**How it works**:
1. **Creation**: The service provider creates an agreement specifying:
   - Overall service description
   - Multiple milestones, each with:
     - Title (e.g., "Logo Design", "Homepage Development")
     - Due date
     - Payment amount for that milestone
   - The total agreement amount is automatically calculated from all milestones

2. **Client Response**: The client reviews all milestones and can accept or reject the entire agreement

3. **Service Kickoff**: If accepted, the provider uploads kickoff proof (project brief, initial meeting notes, signed SOW) and client verifies. Agreement becomes Active

4. **Milestone Workflow**: As work progresses:
   - **Provider completes milestone**: Uploads proof of completion (screenshots, deliverable files, demo video)
   - **Client reviews**: Can approve (releasing that milestone's payment conceptually) or reject with feedback
   - **Iterate**: If rejected, provider uploads revised proof until client approves
   - Each milestone tracks its own status: Pending → Proof Submitted → Approved or Rejected

5. **Final Settlement**: Once ALL milestones are approved, the client uploads final payment proof covering all approved amounts

6. **Provider Verification**: Provider reviews total payment proof and approves, making the agreement Settled

**Key Features**:
- **Milestone Tracking**: Visual table showing each milestone's title, due date, amount, proof status, and approval status
- **Progressive Work**: No need to wait until everything is done; milestones can be approved incrementally
- **Payment Clarity**: Each milestone has a defined payment, reducing "scope creep" disputes
- **Flexible Timelines**: Different milestones can have different deadlines

**Important Rule**: The agreement **cannot** be marked as fully settled until every single milestone is approved. This protects both parties from incomplete work scenarios.

---

## Legal Upgrade System

### What is Legal Upgrade?

Legal Upgrade is an **optional add-on** that makes any agreement more legally enforceable and dispute-resistant. It offers three independent modules that can be purchased individually or as a discounted bundle.

### The Three Modules

#### 1. e-Sign (Electronic Signature)
**What it does**: Adds verifiable digital signatures from both parties with a complete audit trail.

**Why it matters**:
- Proves both parties explicitly agreed to the terms
- Timestamped signature records
- Legal identity verification
- Creates a paper trail showing who signed what and when

**Special Note**: e-Sign requires the counterparty to accept and sign. The module status stays "Pending" until both parties have signed.

---

#### 2. e-Stamp (Electronic Stamp Duty)
**What it does**: Adds government-recognized stamp duty to the digital agreement, making it a legally stamped document.

**Why it matters**:
- Stamped documents have stronger legal admissibility in courts
- Complies with Indian Stamp Act requirements
- Makes the agreement equivalent to a traditional stamped paper agreement
- Protects against future disputes about document validity

**Special Note**: e-Stamp can be completed immediately without counterparty action.

---

#### 3. Evidence Bundle
**What it does**: Creates a tamper-evident package containing the complete agreement lifecycle.

**What's included**:
- Original agreement terms and all attachments
- All proof uploads (disbursal, repayment, condition photos, milestone deliverables)
- Complete timeline of every action taken
- All reminder history showing who was notified when
- Communication logs
- Extension requests and approvals

**Why it matters**:
- Everything is packaged with cryptographic tamper-detection
- Creates an indisputable record of what actually happened
- Useful for mediation or legal proceedings
- Shows good faith efforts (reminders sent, extensions offered)

**Special Note**: Evidence Bundle can be completed immediately without counterparty action.

---

### Pricing Structure

The Legal Upgrade has **two pricing tiers** depending on when you purchase:

#### Discounted Tier (₹79 Bundle)
Available when:
- **At agreement creation** (most recommended time)
- **Within 24 hours after agreement becomes Active**

Individual module prices:
- e-Sign: ₹29
- e-Stamp: ₹39
- Evidence Bundle: ₹29
- **All Three (Bundle): ₹79** (saves ₹18)

---

#### Premium Tier (₹99 Bundle)
Available when:
- **Agreement becomes Due** (deadline passed)
- **Agreement is in Pending Settlement** (dispute situation)
- **More than 24 hours after activation**

Individual module prices:
- e-Sign: ₹39
- e-Stamp: ₹49
- Evidence Bundle: ₹39
- **All Three (Bundle): ₹99** (saves ₹28)

---

### Pay-The-Difference System

**Smart Upgrade Path**: You're never charged twice for the same module.

**Examples**:

**Scenario 1**: You bought e-Sign (₹29) at creation. Later, during a dispute, you want to add e-Stamp and Evidence:
- You already paid: ₹29
- Premium bundle price: ₹99
- **You pay: ₹70** (the difference)
- You get: All three modules

**Scenario 2**: You bought e-Stamp (₹39) and Evidence (₹29) at creation (₹68 total). Now you want to add e-Sign:
- You already paid: ₹68
- Discounted bundle price: ₹79
- **You pay: ₹11** (the difference)
- You get: All three modules at the cheaper bundle rate

**Scenario 3**: You bought e-Sign (₹29) at discount tier. It's now past 24h and you want to add e-Stamp:
- You already paid: ₹29
- Premium e-Stamp price: ₹49
- **You pay: ₹49** (individual module at current premium tier)
- No bundle benefit since you're only adding one module

The system always calculates the fairest price based on:
1. What you've already purchased
2. What you're selecting now
3. The current pricing tier (discounted or premium)
4. Whether bundle pricing applies

---

### When to Offer Legal Upgrade

The platform **actively suggests** Legal Upgrade at strategic moments:

**1. During Agreement Creation** (Recommended)
- Shows up as an optional card in the creation flow
- All three modules pre-selected (Bundle)
- Displays discounted pricing (₹79)
- Clear note: "If this agreement is rejected before activation, we'll automatically refund your payment"

**2. Within 24 Hours of Activation**
- Small banner appears at top of agreement details
- Message: "Add legal strength to this agreement (₹79) — offer expires in [time remaining]"
- One-click access to upgrade dialog
- Same discounted pricing

**3. At Risk Moments** (Premium pricing)
- When agreement becomes **Due** (deadline passed, payment overdue)
- When agreement is in **Pending Settlement** (potential dispute arising)
- After an **extension request is rejected** (trust breakdown signal)
- Shows premium pricing (₹99) with clear explanation of why it's more expensive

**4. On Demand**
- Users can always click "Legal Upgrade" button on any active agreement
- Pricing tier automatically determined by agreement status and timing

---

### Who Pays for Legal Upgrade?

**Current System**: The person who initiates the upgrade pays for it.

**What this means**:
- If the lender upgrades a money loan, the lender pays
- If the borrower upgrades later during a dispute, the borrower pays
- Payment protects both parties equally once completed

**Future Enhancement** (not currently implemented): Option for cost-splitting where both parties contribute to the legal upgrade cost.

---

### Upgrade Status Tracking

After purchasing Legal Upgrade, each module shows its status:

**Pending**:
- Module is being processed
- For e-Sign: Waiting for counterparty to sign
- For e-Stamp/Evidence: Processing with legal provider

**Completed**:
- Module successfully applied
- Agreement now has that legal protection

**Failed**:
- Module couldn't be completed (rare)
- Shows error message
- Option to retry at no additional cost

**Overall Status**:
- Agreement shows "Legal Upgrade: Pending" if any module is still pending
- Agreement shows "Legal Upgrade: Completed" when all selected modules are done
- Agreement shows "Legal Upgrade: Failed" if any module failed and none are pending

Users can hover over the legal badge to see detailed status breakdown for each module.

---

### Auto-Refund Protection

**Important Consumer Protection**:

If you purchase Legal Upgrade during agreement creation, but the counterparty **rejects the agreement before it's activated**, you are automatically refunded the full amount you paid.

**Why this matters**:
- You're not penalized for trying to be responsible
- No risk in choosing legal protection early
- Encourages people to opt for legal upgrade at creation (best time, best price)

**How it works in demo**:
- Shows a toast notification: "Agreement rejected. ₹[amount] auto-credited to your account"
- Demo panel shows your credit balance increase
- In production, this would process as a real refund to your payment method

---

## Reliability & Trust System

### What is Reliability Score?

Every user has a **Reliability Score** ranging from 0 to 100, which translates to a **0 to 5 star rating**. This score helps others assess whether someone is trustworthy to enter agreements with.

### Important Privacy Rule

**Reliability scores are PRIVATE**. You can only see someone's reliability score if:
- You have an existing agreement with them (current or past)
- You are viewing them as a counterparty in a shared agreement

**You cannot**:
- Search for people and see their scores
- Browse a public leaderboard
- See scores of random people

This prevents score-shaming and keeps the focus on bilateral trust.

---

### How Scores Are Calculated

Scores are recalculated **automatically** whenever an agreement reaches "Settled" status.

**Base Score**: 80 (everyone starts here)

#### Factor 1: Timeliness (±20 points)
- **On time or early** (settled by or before due date): +10 points
- **Slightly late** (1-14 days late): -10 points
- **Very late** (more than 14 days late): -20 points

#### Factor 2: Review Quality (±10 points)
Based on average star rating from all reviews received:
- **Excellent** (4.5+ stars average): +10 points
- **Good** (3.5-4.49 stars average): 0 points (neutral)
- **Poor** (below 3.5 stars average): -10 points

#### Factor 3: Unresolved Disputes (Score Cap)
If you have any reviews with **less than 3 stars** that are marked as **unresolved**:
- Your score is **capped at 67** (maximum)
- Even if you'd normally score 90, it stays at 67
- Only removed when those negative reviews are marked "resolved"

**Why this matters**: Forces users to address serious complaints before their reputation can recover.

---

### Score Range Interpretation

**90-100 (5 stars)**: Exceptional reliability
- Always pays on time
- Excellent reviews
- No unresolved disputes
- Highly trustworthy

**80-89 (4-4.5 stars)**: Good reliability
- Usually pays on time
- Positive reviews
- Minor issues, if any

**67-79 (3.5-4 stars)**: Acceptable reliability
- Some late payments
- Mixed reviews
- May have resolved past issues

**34-66 (1.5-3.5 stars)**: Concerning reliability
- Frequently late
- Poor reviews
- Multiple issues

**0-33 (0-1.5 stars)**: Poor reliability
- Consistently defaults or very late
- Many negative reviews
- High risk

---

### Star Display

Scores are converted to stars for easier understanding:
- **Full stars**: Represent complete 20-point increments
- **Half stars**: Represent 10-point increments
- **Empty stars**: Remaining unfilled stars

Example: Score of 87 = 4.35 stars = ★★★★☆ (4.5 stars displayed)

When you hover over the stars, a tooltip shows:
- The exact score (e.g., "87/100")
- Note: "Visible only to your counterparties"

---

### When Scores Update

1. **Agreement Settled**: The borrower's score is recalculated based on payment timing
2. **Review Submitted**: The reviewee's score is recalculated including the new review
3. **Review Resolved**: If the negative review is marked resolved, the score cap is lifted and recalculated
4. **Multiple Agreements**: Scores consider the average behavior across all agreements

---

### Score Impact Examples

**Example 1: Perfect User**
- 5 agreements, all paid on time
- Average 4.8 star reviews
- No unresolved disputes
- **Score: 100** (5 stars)

**Example 2: Generally Good User**
- 3 agreements: 2 on time, 1 slightly late (5 days)
- Average 4.2 star reviews
- No unresolved disputes
- **Score: 86** (4.5 stars)

**Example 3: User with Dispute**
- 10 agreements, all paid on time
- Average 4.5 star reviews
- BUT: 1 unresolved 2-star review from a disputed agreement
- **Score: 67** (capped, despite good history) (3.5 stars)
- Once that review is resolved → score jumps to 96

**Example 4: Problematic User**
- 4 agreements: 1 on time, 3 very late (20+ days each)
- Average 2.8 star reviews
- Multiple unresolved disputes
- **Score: 43** (capped at 67, but actual calculation is lower) (2 stars)

---

## Extensions System

### What are Extensions?

Extensions allow the borrower/receiver to formally request more time to fulfill their obligation (repay money, return item, or complete service payment).

### Extension Limits

**Maximum 3 extensions per agreement** (strictly enforced)

**Why this limit?**:
- Prevents indefinite delays
- Maintains agreement seriousness
- After 3 extensions, if still not settled, indicates a serious problem

### How Extensions Work

**1. Requesting an Extension**

When the borrower needs more time:
- Clicks "Request Extension" button on agreement details
- Selects a new due date (must be later than current due date)
- Automatically calculates "extra days" being requested
- Writes a reason explaining why they need more time (mandatory)
- Submits the request

**Validation Rules**:
- New date must be after current due date
- New date should ideally be within 90 days of original creation (warning shown if beyond)
- Cannot request extension while another extension is pending approval
- Cannot request extension if already used 3 extensions

**2. Lender Reviews Extension Request**

The lender receives the extension request showing:
- Current due date
- Requested new due date
- Number of extra days requested
- Borrower's reason
- How many extensions already used (e.g., "2 of 3 extensions used")

Lender can:
- **Approve**: New due date is set, agreement continues normally, extension count increases
- **Reject**: Due date stays the same, borrower must meet original deadline

**3. After Approval**

When an extension is approved:
- Agreement's `due_at` is updated to the new date
- Extension count increments (shown on agreement details)
- New reminder schedule is generated based on new due date
- Status may change from "Due" back to "Active" if new date is in the future
- Both parties are notified

**4. After Rejection**

When an extension is rejected:
- Original due date remains unchanged
- Borrower must fulfill by original deadline
- Borrower can still request another extension (up to the 3 limit)
- May trigger "Legal Upgrade" suggestion (risk moment)

---

### Extension UI Indicators

Throughout the agreement:
- Shows "X of 3 extensions used"
- If 3 used: "No extensions remaining"
- If extension pending: Shows "Extension Pending" badge
- Extension history visible: past extensions with dates, reasons, and approval status

---

### Strategic Use of Extensions

**Good Extension Request** (likely approved):
```
Extra days: 7
Reason: "Bank processing delayed my salary. Will repay immediately after salary credits on 15th."
```

**Poor Extension Request** (likely rejected):
```
Extra days: 45
Reason: "Need more time"
```

**Best Practice**:
- Request reasonable time (7-14 days typically)
- Provide specific, honest reason
- Communicate proactively before deadline
- Don't wait until last minute

---

## Reviews & Feedback System

### When Can You Leave a Review?

Reviews can **only** be submitted **after** an agreement reaches "Settled" status.

**Why?**:
- Ensures both parties fulfilled their obligations before judging
- Prevents premature negative reviews during normal agreement progression
- Reviews are about the overall experience, not just one phase

### One Review Per Party

Each person in the agreement can leave **one review** for the other person:
- Lender reviews the borrower
- Borrower reviews the lender

**Immutable**: Once submitted, reviews cannot be edited or deleted (only marked as resolved).

---

### Review Components

**1. Star Rating (Required)**: 1 to 5 stars
- 5 stars: Excellent experience
- 4 stars: Good experience
- 3 stars: Acceptable experience
- 2 stars: Poor experience
- 1 star: Very bad experience

**2. Written Feedback (Optional)**:
- Freeform text explaining the rating
- Visible to the reviewed person
- Helps provide context for the score

**3. Resolution Status**:
- Starts as "Unresolved"
- Can be marked "Resolved" later if issues were addressed

---

### Negative Review Handling

**Critical Feature**: Reviews with **less than 3 stars** (1 or 2 stars) have special handling.

**1. Immediate Impact**:
- Review is marked as "Unresolved" by default
- Caps the reviewee's reliability score at 67

**2. Resolution Process**:
Either party can mark a negative review as "Resolved" when:
- The issue was discussed and settled offline
- Compensation was provided
- Misunderstanding was cleared up
- Both parties reached agreement

**3. After Resolution**:
- Reliability score cap (67) is lifted
- Score is recalculated normally
- Review still shows in history, but marked as "Resolved"

**Why this system?**:
- Incentivizes conflict resolution
- Doesn't delete history (transparency)
- Allows reputation recovery after making amends
- Prevents permanent damage from single incidents

---

### Review Privacy

- Reviews are **visible to both parties** of that specific agreement
- Reviews **affect the reliability score** that others can see (if they have agreements with that person)
- The review text itself is **not** publicly visible to random users
- Only people with agreements can see the star rating via reliability score

---

### Review Examples

**Example 1: Positive Review (5 stars)**
```
Rating: ★★★★★
"Paid exactly on time. Clear communication throughout. Would lend again."
Status: Unresolved (not applicable for positive reviews)
```

**Example 2: Negative Review, Then Resolved (2 stars)**
```
Rating: ★★☆☆☆
"Paid 25 days late without communication. However, we discussed it afterward and they explained unexpected medical emergency. They paid extra ₹500 as apology. Issue resolved."
Status: Resolved
```

**Example 3: Unresolved Negative (1 star)**
```
Rating: ★☆☆☆☆
"Paid 45 days late. Multiple excuses. Had to send daily reminders."
Status: Unresolved
(This caps their reliability score at 67 until marked resolved)
```

---

### Review Impact on Reliability

Reviews factor into the reliability calculation:
- Average star rating across all reviews affects the ±10 point adjustment
- Unresolved reviews below 3 stars apply the score cap
- More reviews = more stable, representative score
- Single bad review among many good ones has smaller impact

---

## Reminder System

### Automatic Reminder Generation

Reminders are **automatically created** at two key moments:

**1. When Agreement is Created**:
- A "DUE" reminder is scheduled for the exact due date/time
- If agreement has extensions approved, the due reminder is rescheduled

**2. After Extension Approved**:
- Old due reminder is replaced
- New due reminder created for the new deadline
- Overdue reminders are recalculated

### Reminder Types

**DUE Reminder**:
- Scheduled for the exact due date and time
- Friendly reminder that the deadline has arrived
- Gives borrower last chance to submit proof on time

**OVERDUE Reminders**:
- Start the day after the due date passes
- **First 14 days**: Daily reminders (every 24 hours)
- **After 14 days**: Weekly reminders (every 7 days)
- Continue until agreement is settled

---

### Reminder Delivery

**When They Trigger**:
Reminders are processed when the user **opens the app** (not pushed in background).

**What Happens**:
1. App checks for any reminders with `scheduled_at` in the past that haven't been sent yet
2. Shows a toast notification for each reminder:
   - "⏰ Reminder: [Agreement Title] - [Reminder Type]"
   - Example: "⏰ Reminder: Money Loan ₹5,000 - Due Today"
   - Example: "⏰ Reminder: Camera Lens - 3 Days Overdue"
3. Marks the reminder as "sent" so it doesn't show again
4. If multiple reminders are due, shows them sequentially (not overwhelming)

---

### Reminder Visibility

On the agreement details page:
- **Reminders Timeline**: Shows all scheduled and sent reminders
- Each reminder displays:
  - Type (DUE or OVERDUE)
  - Scheduled date/time
  - Sent date/time (if triggered)
  - Status icon (pending/sent)

**Why visible?**:
- Transparency for both parties
- Shows good faith effort in seeking payment
- Useful for Evidence Bundle (proves reminders were sent)
- Helps in disputes ("I sent 15 reminders")

---

### Reminder Schedule Example

**Original Due Date**: January 15, 2025 at 6:00 PM

**Reminders Created**:
1. **DUE**: January 15, 6:00 PM
2. **OVERDUE Day 1**: January 16, 6:00 PM
3. **OVERDUE Day 2**: January 17, 6:00 PM
4. **OVERDUE Day 3**: January 18, 6:00 PM
   ... (continues daily)
5. **OVERDUE Day 14**: January 29, 6:00 PM
6. **OVERDUE Week 3**: February 5, 6:00 PM
7. **OVERDUE Week 4**: February 12, 6:00 PM
   ... (continues weekly)

**If Extension Approved on January 20 to January 30**:
- All pending overdue reminders are cancelled
- New DUE reminder: January 30, 6:00 PM
- New overdue reminders scheduled from January 31 onward

---

### Reminder Best Practices

**For Lenders**:
- Check the reminders timeline to see if borrower is being notified
- If many overdue reminders sent with no response, consider Legal Upgrade
- Reminder history strengthens your position in disputes

**For Borrowers**:
- Don't ignore reminders - respond or request extension
- Each reminder makes it harder to maintain good reliability score
- Proactive communication prevents reminder escalation

---

## Dashboard Organization

The dashboard is the central hub showing all agreements organized by their current state and required actions.

### Dashboard Sections

**1. My Requests**
Shows agreements where **you are the borrower/receiver**:
- Money you've requested to borrow
- Items you've requested to borrow
- Services you've hired someone to provide

**Statuses shown**: Requested, Pending Disbursal, Active, Due, Pending Settlement, Settled, Rejected

**Why separate**: Helps you track what you owe others.

---

**2. Requests to Me**
Shows agreements where **you are the lender/provider**:
- Money others have requested from you
- Items others want to borrow from you
- Services you're providing to others

**Statuses shown**: Requested, Pending Disbursal, Active, Due, Pending Settlement, Settled, Rejected

**Why separate**: Helps you track what others owe you.

---

**3. Active Agreements**
Combined view of all agreements currently in "Active" status:
- Both where you're borrower and lender
- Shows days remaining until due
- Quick access to agreements in progress

**Sorted by**: Due date (soonest first)

---

**4. Due & Overdue**
Combined view of all agreements past their due date:
- Both where you're borrower and lender
- Highlights urgent items needing attention
- Shows how many days overdue

**Sorted by**: Most overdue first

---

**5. Pending Actions**
Smart section showing only agreements that need **your** attention right now:

**If you're the lender**:
- Agreements in "Requested" status (need to approve/reject and upload disbursal proof)
- Agreements in "Pending Settlement" status (need to verify repayment proof)
- Extension requests awaiting your approval

**If you're the borrower**:
- Agreements in "Pending Disbursal" status (need to verify disbursal proof)
- Agreements in "Active" or "Due" status (need to upload repayment proof)

**Why important**: Zero inbox approach - shows only what requires action.

---

**6. Extensions Pending**
Shows extension requests across all agreements:
- Extensions you've requested (pending counterparty approval)
- Extensions requested from you (needing your decision)

**Includes**:
- Current due date vs requested new date
- Extra days requested
- Reason provided
- Your role (approver or requester)

---

### Agreement Cards

Each agreement card displays:

**Top Row**:
- Agreement type icon (💰 for money, 📦 for item, 💼 for service)
- Agreement title/description
- Status badge (color-coded)

**Middle Row**:
- Counterparty name with reliability stars (if visible)
- Key amount (total for money/service, estimated value for item)
- Due date with countdown or overdue indicator

**Bottom Row**:
- Next action button (context-aware):
  - "Upload Proof" (if you need to provide proof)
  - "Verify Proof" (if you need to approve proof)
  - "Approve Extension" (if extension pending your approval)
  - "Leave Review" (if settled and you haven't reviewed)
- Legal upgrade badge (if enabled)
- Extension count (if any used)

---

### Empty States

Each dashboard section shows helpful empty states when no agreements match:

**My Requests** (empty):
"You haven't requested any agreements yet. Click 'Create Agreement' to start."

**Active Agreements** (empty):
"No active agreements right now. All clear! 🎉"

**Due & Overdue** (empty):
"Nothing overdue. Great job staying on top of your agreements! ✅"

**Pending Actions** (empty):
"All caught up! No actions needed at the moment. ☕"

---

## Agreement Detail View

The detail view is a comprehensive page showing everything about a single agreement.

### Header Section

**Left Side**:
- Large agreement type icon
- Agreement title
  - Money: "Money Loan - ₹[amount]"
  - Item: "[Item Title]"
  - Service: "[Service Description]"
- Counterparty name with "with [Name]" and reliability stars

**Right Side**:
- Large status badge
- Legal upgrade badge (if enabled, with status)

---

### Key Information Panel

Displays type-specific information:

**For Money Loans**:
- Amount: ₹[amount]
- Due Date: [Date and time, with countdown/overdue indicator]
- Created: [Date]
- Reason: [Text provided at creation]
- Attachment: [Link to download if provided]

**For Item Loans**:
- Item: [Title]
- Estimated Value: ₹[amount]
- Return By: [Date and time, with countdown/overdue indicator]
- Created: [Date]
- Reason: [Text provided at creation]
- Condition Photos: [Gallery of photos with zoom]
- Attachment: [Link to download if provided]

**For Service Agreements**:
- Description: [Full service description]
- Total Amount: ₹[sum of all milestones]
- Final Due Date: [Last milestone due date]
- Created: [Date]
- Attachment: [Link to download if provided]
- Milestones Table:
  - Title | Due Date | Amount | Proof Status | Approval Status | Actions

---

### Proof Section

Shows the two-phase proof system visually:

**Phase A (Activation)**:
- Label based on type: "Disbursal" (money), "Handover" (item), "Kickoff" (service)
- If uploaded: Shows proof preview (image thumbnail or file icon)
- If pending verification: Shows "Pending Verification" with Approve/Reject buttons (for borrower)
- If not uploaded: Shows "Upload Proof" button (for lender)

**Phase B (Settlement)**:
- Label based on type: "Repayment" (money), "Return" (item), "Completion" (service)
- Same interaction pattern as Phase A
- Only accessible after agreement is Active

---

### Extensions Section

**If No Extensions Used**:
"No extensions requested yet. 3 extensions available."

**If Extensions Used**:
Shows a timeline of all extensions:
- Extension 1: Jan 15 → Jan 22 (7 extra days) - Approved
  - Reason: "Salary delayed"
  - Approved by: [Name] on [Date]
- Extension 2: Jan 22 → Jan 30 (8 extra days) - Pending
  - Reason: "Unexpected medical expense"
  - Awaiting decision from [Name]

**Extension Count Indicator**: "2 of 3 extensions used" or "No extensions remaining"

---

### Reminders Section

Timeline showing all reminders for this agreement:
- ✅ DUE Reminder - Sent Jan 15 at 6:00 PM
- ✅ Overdue Day 1 - Sent Jan 16 at 6:00 PM
- ⏳ Overdue Day 2 - Scheduled Jan 17 at 6:00 PM (not sent yet)
- ⏳ Overdue Week 2 - Scheduled Jan 29 at 6:00 PM

---

### Legal Upgrade Section

**If Not Upgraded**:
- Shows "Legal Upgrade Available" card
- Displays current pricing tier (Discounted or Premium)
- Shows time remaining for discounted pricing (if applicable)
- "Add Legal Protection" button

**If Upgraded**:
- Shows "Legal Upgrade: [Status]" badge
- Expandable details showing each module:
  - ✅ e-Sign: Completed
  - ✅ e-Stamp: Completed
  - ⏳ Evidence Bundle: Pending
- Total paid: ₹[amount]
- Option to add more modules (pay-the-difference pricing shown)

---

### Actions Section

Context-aware action buttons based on agreement status and your role:

**Requested Status (Lender)**:
- "Accept & Upload Proof" (primary)
- "Reject Agreement" (destructive)

**Pending Disbursal (Borrower)**:
- "Approve Disbursal" (primary)
- "Reject & Request New Proof" (secondary)

**Active Status (Borrower)**:
- "Upload Repayment Proof" (primary)
- "Request Extension" (secondary, disabled if 3 used or pending)

**Pending Settlement (Lender)**:
- "Approve Settlement" (primary)
- "Reject & Request New Proof" (secondary)

**Settled Status (Either Party)**:
- "Leave Review" (if you haven't reviewed yet)
- "View Review" (if you already reviewed)

**Any Status**:
- "Add Legal Protection" or "Upgrade Legal Protection" (if not all modules owned)

---

### Review Section

**Before Settlement**:
"Reviews can be left after the agreement is settled."

**After Settlement (Not Reviewed)**:
- "Leave Review for [Counterparty Name]" button
- Opens review dialog with star rating and optional text

**After Settlement (Already Reviewed)**:
- Shows your review:
  - Your rating: ★★★★☆ (4 stars)
  - Your feedback: "[Text if provided]"
  - Status: Resolved / Unresolved
- Shows their review (if they left one):
  - Their rating: ★★★★★ (5 stars)
  - Their feedback: "[Text if provided]"
  - Status: Resolved / Unresolved

**Unresolved Negative Reviews**:
- If either party left a review below 3 stars that's unresolved
- Shows "Mark as Resolved" button
- Explains impact: "This review caps [Name]'s reliability score at 67. Mark resolved after discussing offline."

---

## Profile Views

Users can view profile pages for their counterparties (people they have agreements with).

### Profile Information

**Top Section**:
- Profile avatar or initials
- Full name
- Phone number
- Reliability stars (only visible if you have agreements together)
- Member since date

**Reliability Breakdown**:
- Shows the star rating with exact score (e.g., "87/100")
- Note: "This reliability score is based on [Name]'s agreement history with all their counterparties"
- Graph or breakdown showing:
  - Total agreements: X
  - Settled on time: Y
  - Average review rating: Z stars

**Agreements Together**:
List of all agreements you share:
- Agreement type and title
- Status
- Date created
- Link to view details

**Reviews Received** (limited visibility):
- Shows aggregate stats only (not individual review texts):
  - Average rating: X.X stars
  - Total reviews: Y
  - Distribution: 5★(X), 4★(X), 3★(X), 2★(X), 1★(X)

**Privacy Note**:
Individual review texts are NOT shown on profile pages - only visible on the specific agreement detail pages to involved parties.

---

## Validation Rules Summary

### Phone Numbers
- Must match format: +91 followed by 10 digits
- Spaces allowed but stripped before validation
- Cannot create agreement with yourself

### Money Loans
- Minimum amount: ₹100 (strictly enforced)
- Due date: Between 48 hours and 90 days from now
- Reason: At least 10 characters

### Item Loans
- Estimated value: ≥ ₹0 (can be zero for sentimental items)
- Return date: Between 48 hours and 90 days from now
- Condition photos: At least 1 required before activation
- Item title: At least 3 characters

### Service Agreements
- Milestones: At least 1 required
- Each milestone:
  - Title: At least 3 characters
  - Due date: Between now and 90 days from creation
  - Amount: ≥ ₹0
- Final milestone due date becomes agreement due date

### Extensions
- Maximum 3 per agreement (hard limit)
- New date must be after current due date
- New date ideally within 90 days of original creation (warning if beyond)
- Reason: At least 15 characters
- Cannot request while another extension is pending

### Duplicate Prevention
**Only one active request per borrower-lender pair per contract type**

Active means status is one of: Requested, Pending Disbursal, Active, Due, Pending Settlement

**Allowed**:
- User A borrows ₹5000 from User B (Money - Active)
- User A borrows Camera from User B (Item - Active)
- User A hires User B for Logo (Service - Active)
All three can coexist.

**Not Allowed**:
- User A borrows ₹5000 from User B (Money - Active)
- User A tries to borrow ₹10000 from User B (Money)
Blocked with message: "You already have an active Money Loan agreement with [Name]. Please settle it before creating another."

**Allowed After Settlement**:
Once the first money loan is Settled or Rejected, User A can create a new money loan request with User B.

---

## Status Lifecycle Flowcharts

### Money Loan Flow

```
REQUESTED
   ↓ (Lender uploads disbursal proof)
PENDING_DISBURSAL
   ↓ (Borrower approves disbursal)
ACTIVE
   ↓ (Time passes due date OR borrower uploads repayment proof)
DUE (if past due date) OR PENDING_SETTLEMENT (if proof uploaded)
   ↓ (Lender approves repayment proof)
SETTLED

Rejection paths:
- REQUESTED → REJECTED (Lender rejects)
- PENDING_DISBURSAL → REQUESTED (Borrower rejects disbursal proof, lender must re-upload)
- PENDING_SETTLEMENT → ACTIVE/DUE (Lender rejects repayment proof, borrower must re-upload)
```

### Item Loan Flow

```
REQUESTED
   ↓ (Lender uploads condition photos + handover proof)
PENDING_DISBURSAL
   ↓ (Borrower approves handover)
ACTIVE
   ↓ (Time passes return date OR borrower uploads return proof)
DUE (if past return date) OR PENDING_SETTLEMENT (if proof uploaded)
   ↓ (Lender approves return proof)
SETTLED

Same rejection paths as Money Loan
```

### Service Agreement Flow

```
REQUESTED
   ↓ (Provider uploads kickoff proof)
PENDING_DISBURSAL
   ↓ (Client approves kickoff)
ACTIVE
   ↓ (Provider uploads milestone proofs, client approves each)
   ↓ (ALL milestones approved)
   ↓ (Client uploads completion payment proof)
PENDING_SETTLEMENT
   ↓ (Provider approves payment proof)
SETTLED

Special rules:
- Cannot move to PENDING_SETTLEMENT until all milestones approved
- Individual milestone rejections don't change agreement status
- DUE status applies if final milestone due date passes
```

---

## Edge Cases & Error Handling

### Duplicate Active Agreement
**What happens**: User tries to create a second active Money Loan with the same person while one already exists.

**System response**:
- Blocks creation
- Shows error: "You already have an active Money Loan agreement with [Name]. Please settle or reject the existing agreement before creating a new one."
- Provides link to existing agreement

---

### Missing Condition Photos (Item Loan)
**What happens**: Lender tries to activate an item loan without uploading condition photos.

**System response**:
- Blocks activation
- Shows error: "At least one condition photo is required before activating an item loan. This protects both parties."
- Highlights the photo upload section

---

### Service Settlement with Pending Milestones
**What happens**: Client tries to mark service as settled while some milestones are pending or rejected.

**System response**:
- Blocks settlement
- Shows error: "All milestones must be approved before final settlement. Currently, 2 of 5 milestones are pending."
- Lists pending/rejected milestones
- Provides guidance: "Review and approve each milestone before proceeding."

---

### Extension Beyond 3 Limit
**What happens**: Borrower tries to request a 4th extension.

**System response**:
- Disables "Request Extension" button
- Shows tooltip: "Maximum 3 extensions reached. No further extensions available."
- Suggests: "Consider discussing a new agreement if you need significantly more time."

---

### Extension While One Pending
**What happens**: Borrower tries to request extension while previous extension request hasn't been approved/rejected.

**System response**:
- Disables "Request Extension" button
- Shows banner: "Extension request pending approval from [Name]. You cannot request another extension until this one is decided."

---

### Legal Upgrade on Rejected Agreement (Auto-Refund)
**What happens**: User bought legal upgrade at creation (₹79), then counterparty rejected the agreement before activation.

**System response**:
- Shows toast: "Agreement rejected before activation. ₹79 has been auto-credited to your account."
- Updates demo credit balance (in production, processes real refund)
- Legal upgrade status marked as "Refunded"

---

### Payment Proof Verification Mismatch
**What happens**: Lender claims they didn't receive the repayment shown in borrower's proof.

**System response**:
- Lender clicks "Reject Proof"
- Optional: Lender adds comment explaining the issue
- Agreement returns to ACTIVE/DUE status
- Borrower sees: "Repayment proof rejected by [Name]. Reason: [Comment]. Please upload correct proof."
- Suggests: "If there's a dispute, consider enabling Legal Upgrade for better documentation."

---

### localStorage Corruption
**What happens**: Browser localStorage data gets corrupted or malformed.

**System response**:
- Safe JSON parse with try-catch
- If parse fails, shows error dialog:
  - "Demo data appears corrupted. This sometimes happens with browser storage."
  - "Reset Demo Data" button (clears localStorage and reseeds)
  - "Report Issue" button (copies error to clipboard)

---

### Time Zone Edge Cases
**What happens**: User creates agreement right before midnight, due date calculations might be off.

**System response**:
- All date comparisons use Asia/Kolkata timezone (UTC+5:30)
- Consistent `toKolkata()` helper throughout codebase
- Due date times always displayed with timezone indicator
- Reminder scheduling uses timezone-aware calculations

---

## User Flows: Common Scenarios

### Scenario 1: Lending ₹10,000 to a Friend (Happy Path)

**Step 1: Lender Creates Agreement**
- Opens LenTrust app
- Clicks "Create Agreement" → "Money Loan"
- Enters friend's phone number (+919876543210)
- Amount: ₹10,000
- Return by: 30 days from now (selects date/time)
- Reason: "For medical emergency"
- Opts for Legal Upgrade (discounted ₹79) - all three modules selected
- Attaches supporting document (optional)
- Clicks "Create Agreement"

**Step 2: Friend Receives Request**
- Friend sees notification/alert (in demo, logs in and sees in dashboard)
- Reviews request in "Requests to Me" section
- Sees: ₹10,000, due date, reason, attachment
- Checks lender's reliability score (e.g., 4.5 stars - trustworthy)

**Step 3: Lender Uploads Disbursal Proof**
- Agreement status: REQUESTED
- Lender transfers ₹10,000 via UPI/bank
- Takes screenshot of successful transfer
- Uploads to LenTrust as "Disbursal Proof"
- Status changes to PENDING_DISBURSAL

**Step 4: Friend Verifies Receipt**
- Friend receives alert to verify
- Opens agreement, sees disbursal proof (screenshot)
- Checks own bank account - ₹10,000 received
- Clicks "Approve Disbursal"
- Status changes to ACTIVE
- Legal upgrade modules start processing:
  - e-Sign: Both parties sign (simulated)
  - e-Stamp: Processing (completes in 3-5 sec in demo)
  - Evidence Bundle: Processing (completes in 3-5 sec in demo)

**Step 5: Active Period**
- Agreement shows countdown: "25 days remaining"
- Reminders are scheduled
- 3 days before due: DUE reminder notification
- Friend can request extension if needed

**Step 6: Friend Repays**
- On day 28 (2 days before due), friend repays ₹10,000
- Takes screenshot of transfer
- Uploads to LenTrust as "Repayment Proof"
- Status changes to PENDING_SETTLEMENT

**Step 7: Lender Verifies Repayment**
- Lender receives alert
- Opens agreement, sees repayment proof
- Checks own bank account - ₹10,000 received
- Clicks "Approve Settlement"
- Status changes to SETTLED

**Step 8: Post-Settlement**
- Friend's reliability score recalculates: +10 (paid on time)
- Lender can now leave a review
- Leaves 5-star review: "Paid on time, smooth transaction"
- Friend's score increases to 90 (5 stars)
- Legal upgrade completed: All modules show "Completed" badge

---

### Scenario 2: Borrowing a Camera Lens (Late Return + Extension)

**Step 1: Borrower Requests**
- Opens app → "Create Agreement" → "Item Loan"
- Enters lender's phone: +919123456789
- Item: "Canon 50mm f/1.8 Lens"
- Estimated value: ₹8,000
- Return by: 14 days from now
- Reason: "Weekend wedding photography project"
- No legal upgrade (decides to add later if needed)
- Creates agreement

**Step 2: Owner Responds**
- Sees request in "Requests to Me"
- Accepts request
- Takes 4 photos of lens (front, back, sides, serial number)
- Uploads as condition photos
- Takes photo of handing lens to borrower
- Uploads as handover proof
- Status: PENDING_DISBURSAL

**Step 3: Borrower Verifies**
- Reviews condition photos - lens looks good
- Verifies handover proof
- Clicks "Approve Handover"
- Status: ACTIVE

**Step 4: Borrower Realizes Need More Time**
- Day 10: Realizes wedding extended to next weekend
- Needs 5 more days
- Clicks "Request Extension"
- New return date: 19 days from original creation
- Reason: "Wedding extended to next weekend, need lens for additional day"
- Submits request

**Step 5: Owner Considers Extension**
- Sees extension request
- Reason seems legitimate
- Clicks "Approve Extension"
- New due date: 19 days from creation
- Extension count: 1 of 3 used

**Step 6: Late Return**
- Day 20 arrives: Borrower still hasn't returned (1 day overdue)
- Status automatically changes to DUE
- OVERDUE reminder triggers: "Camera Lens - 1 Day Overdue"
- Platform suggests Legal Upgrade (premium ₹99) - owner considers it

**Step 7: Return Finally Happens**
- Day 22 (3 days overdue): Borrower returns lens
- Takes photo of returning lens to owner
- Uploads return proof
- Status: PENDING_SETTLEMENT

**Step 8: Owner Verifies Return**
- Checks lens condition against original photos
- Lens in good condition
- Clicks "Approve Settlement"
- Status: SETTLED

**Step 9: Review Impact**
- Borrower's reliability calculated:
  - Base: 80
  - Late by 3 days (within 14 days): -10
  - Final score: 70
- Owner leaves 3-star review: "Returned late but item in good condition. Communication could be better."
- Borrower's reliability adjusts slightly based on review (stays around 70)
- Borrower leaves 5-star review for owner: "Generous with extension, easy to work with"

---

### Scenario 3: Service Agreement with Dispute (Legal Upgrade Saves the Day)

**Step 1: Designer Creates Service Agreement**
- Creates Service Agreement
- Client phone: +919888777666
- Description: "Logo Design + Landing Page"
- Milestone 1: "Logo Concepts" - Due in 7 days - ₹5,000
- Milestone 2: "Final Logo" - Due in 14 days - ₹3,000
- Milestone 3: "Landing Page Design" - Due in 30 days - ₹12,000
- Total: ₹20,000
- Adds discounted Legal Upgrade (₹79) - only e-Stamp and Evidence Bundle
- Creates agreement

**Step 2: Client Accepts**
- Reviews milestones
- Checks designer's reliability: 4 stars (good)
- Accepts agreement

**Step 3: Kickoff**
- Designer uploads kickoff proof (project brief PDF)
- Client verifies and approves
- Status: ACTIVE
- Legal modules: e-Stamp and Evidence Bundle start processing

**Step 4: Milestone 1 Completed**
- Day 6: Designer uploads 5 logo concepts (images)
- Client reviews concepts
- Likes 2 of them
- Approves Milestone 1
- Milestone 1 status: Approved

**Step 5: Milestone 2 Completed**
- Day 12: Designer uploads final logo (3 formats: PNG, SVG, AI)
- Client approves
- Milestone 2 status: Approved

**Step 6: Milestone 3 Dispute Begins**
- Day 28: Designer uploads landing page design (Figma link)
- Client reviews: "This doesn't match the brief. Background should be blue, not green. Hero section layout is wrong."
- Client rejects Milestone 3
- Milestone 3 status: Rejected

**Step 7: Revision Cycle**
- Day 29: Designer uploads revised design
- Client: "Better, but CTA button placement is still off."
- Client rejects again
- Milestone 3 status: Rejected

**Step 8: Due Date Passes**
- Day 31: Due date arrives, Milestone 3 still not approved
- Status changes to DUE
- Platform suggests upgrading to e-Sign (premium ₹49)
- Designer adds e-Sign to agreement (pay-the-difference: ₹49)
- Total paid: ₹79 + ₹49 = ₹128

**Step 9: Resolution**
- Day 32: Designer and client have call (recorded via e-Sign's audit trail)
- Agree on final changes
- Day 33: Designer uploads final version
- Client approves Milestone 3
- All milestones now approved

**Step 10: Payment**
- Client uploads payment proof (₹20,000 total transfer screenshot)
- Status: PENDING_SETTLEMENT

**Step 11: Designer Verifies**
- Checks bank - ₹20,000 received
- Approves settlement
- Status: SETTLED

**Step 12: Reviews & Reliability**
- Designer's reliability:
  - Base: 80
  - Late by 3 days: -10
  - Final: 70
- Client leaves 3-star review: "Good final result but took extra time and revisions. Communication improved after legal upgrade."
- Review not marked as unresolved (since issue was resolved)
- Designer leaves 4-star review for client: "Clear about requirements after discussion. Payment on time."

**Legal Upgrade Value**:
- Evidence Bundle captured all revision requests, proofs, and timeline
- e-Sign audit trail showed good faith effort and resolution discussion
- Both parties felt protected, leading to successful resolution

---

## Mobile Experience & PWA Features

### Progressive Web App (PWA) Capabilities

**Install to Home Screen**:
- Users can install LenTrust like a native app
- Shows on phone home screen with app icon
- Launches in fullscreen (no browser UI)
- Works offline after first load

**Offline Functionality**:
- All data stored in browser's localStorage
- View existing agreements without internet
- Create new agreements offline (sync when online in production)
- Cache-first strategy for fast loading

**Push Notifications** (future):
- Reminder notifications delivered as push
- Extension approval/rejection alerts
- Proof verification needed alerts
- Review request reminders

---

### Mobile-First Design

**Touch Optimized**:
- Large touch targets (48px minimum)
- Swipeable cards
- Pull-to-refresh on dashboard
- Bottom-sheet dialogs for actions

**Responsive Layouts**:
- Single column on mobile
- Two columns on tablet
- Three columns on desktop
- Cards stack vertically on small screens

**Camera Integration**:
- Direct camera access for proof uploads
- Condition photo capture for items
- Auto-resize images to reduce storage

**Quick Actions**:
- FAB (Floating Action Button) for "Create Agreement"
- Quick filters on dashboard (All, Money, Item, Service)
- Swipe actions on agreement cards (Archive, Share)

---

## Security & Privacy

### Data Storage

**Demo Mode** (current):
- All data in browser localStorage
- No server transmission
- Cleared when browser cache cleared
- Private to your device

**Production Mode** (future):
- End-to-end encryption for sensitive data
- Server-side backups
- Multi-device sync

---

### Privacy Protections

**Reliability Scores**:
- Not publicly searchable
- Only visible to counterparties (people you have agreements with)
- Aggregate statistics only (no individual details exposed)

**Review Text**:
- Visible only to agreement participants
- Not indexed or searchable
- Cannot be screenshot-protected (platform limitation)

**Phone Numbers**:
- Displayed as "+91 XXXXX-XXXXX" in some contexts
- Full number only visible in agreement details
- Not exposed in public profiles (if feature added)

**Legal Upgrade Documents**:
- Encrypted in production
- Access restricted to agreement parties
- Tamper-evident (Evidence Bundle)

---

### Demo vs Production

**Current Demo Limitations**:
- No real payments (simulated credits)
- No real legal provider integration (mocked)
- No WhatsApp/SMS notifications (toasts only)
- No multi-device sync (localStorage only)

**Production Enhancements** (when migrated):
- Real Razorpay/Stripe integration for legal upgrade payments
- Actual e-Sign provider (DigiLocker, Aadhaar eSign)
- Government e-Stamp integration
- SMS/WhatsApp reminders via Twilio/Gupshup
- Cloud database (Supabase) with RLS policies
- Backup and recovery
- Admin dashboard for support

---

## Terminology & Language

### Terms Used Consistently

**Agreement** (primary) / **Contract** (secondary):
- Both terms used interchangeably
- "Agreement" is friendlier, less formal
- "Contract" appears in legal contexts

**Borrower** (not "debtor"):
- Person receiving money, item, or service
- Neutral, non-judgmental term

**Lender** (not "creditor"):
- Person providing money, item, or service
- Simple, clear term

**Counterparty**:
- The other person in the agreement
- Used when role (borrower/lender) isn't relevant

**Proof** (not "evidence" unless in legal context):
- Screenshots, photos, documents uploaded
- "Evidence Bundle" is exception (legal module name)

**Settlement** (not "closure" or "completion"):
- Final approval that agreement obligations are met
- Formal but understandable

---

### Tone & Voice

**Friendly but Professional**:
- "Your agreement is now active! 🎉"
- Not: "Contract execution initiated."

**Clear over Clever**:
- "Upload proof that you returned the item"
- Not: "Provide restitution documentation"

**Action-Oriented**:
- "Approve Settlement" (button)
- Not: "Mark as Completed" or "Finalize"

**Reassuring in Edge Cases**:
- "If this agreement is rejected before activation, we'll automatically refund your payment."
- Not: "Refund policy applies per TOS section 7.2.1"

**Honest about Limitations**:
- "Demo app • All data stored locally"
- Not: "Fully functional blockchain-enabled platform"

---

## Future Enhancements (Not Currently Implemented)

### Planned Features

**1. Cost Splitting for Legal Upgrade**:
- Option for both parties to split legal upgrade cost
- Initiator pays 50%, counterparty pays 50%
- Requires counterparty acceptance before processing

**2. Dispute Mediation Flow**:
- Formal "Dispute" status
- Both parties describe their side
- Platform suggests mediator (future integration)
- Legal upgrade evidence automatically packaged for mediator

**3. Recurring Agreements**:
- Monthly rent payments
- Repeat service retainers
- Auto-create new agreement when previous one settles

**4. Multi-Party Agreements**:
- Group loans (multiple lenders to one borrower)
- Joint borrowing (multiple borrowers from one lender)
- Requires more complex approval and settlement logic

**5. Integration with Banking APIs**:
- Automatic proof verification via bank transaction matching
- No manual screenshot upload needed
- Instant settlement when payment detected

**6. WhatsApp Bot**:
- Manage agreements via WhatsApp chat
- "Approve proof" without opening app
- Natural language queries: "Show my active agreements"

**7. Credit Score Export**:
- Export reliability score to other platforms
- Verifiable trust credential
- OAuth-based sharing

**8. Insurance Integration**:
- Optional insurance for high-value items
- Premium calculation based on reliability scores
- Auto-claim filing if dispute occurs

**9. Agreement Templates**:
- Pre-filled templates for common scenarios
- "Small Personal Loan", "Camera Equipment Rental", "Freelance Logo Design"
- One-click customization

**10. Analytics Dashboard**:
- Personal finance insights (total lent, borrowed, in-flight)
- Reliability trends over time
- Most reliable counterparties
- Agreement success rates

---

## Key Success Metrics

### For Demo/Prototype

**Completion Rates**:
- % of agreements that reach Settled status
- Target: >80% for demo scenarios

**Time to Settlement**:
- Average days from creation to settled
- Target: Within due date +7 days

**Legal Upgrade Adoption**:
- % of agreements with legal upgrade
- Target: >40% at creation, >60% by DUE status

**Extension Usage**:
- Average extensions per agreement
- Target: <1.5 average (most settle on time or with 1 extension)

**Review Submission Rate**:
- % of settled agreements with reviews from both parties
- Target: >70%

**User Satisfaction**:
- Average review stars across all reviews
- Target: >4.0 stars

---

## Summary: What Makes LenTrust Different

**1. Trust Without Judgment**:
- Reliability scores are private and contextual
- Not a public credit score or social ranking
- Encourages honest transactions

**2. Proof-Based, Not Promise-Based**:
- Every phase requires actual proof (screenshots, photos, files)
- Both parties must verify what happened
- No "he said, she said"

**3. Legal Strength on Demand**:
- Start casual, upgrade when needed
- Pay-the-difference pricing (never double-pay)
- Auto-refund if agreement falls through

**4. Designed for Real Relationships**:
- Between friends, family, colleagues
- Extensions and resolution built-in
- Reviews can be marked "resolved" (not permanent scarring)

**5. Mobile-First, Offline-Capable**:
- Works even in low-connectivity areas
- Camera integration for proof capture
- Fast, lightweight Progressive Web App

**6. Transparent Timelines**:
- Every action is timestamped
- Reminders are logged and visible
- Legal Evidence Bundle captures everything

**7. Three Distinct Agreement Types**:
- Not just money - items and services too
- Type-specific workflows and validations
- Unified status machine across all types

---

## Appendix: Quick Reference

### Status Colors
- 🟡 **Requested**: Yellow - Awaiting lender's initial response
- 🟠 **Pending Disbursal**: Orange - Awaiting borrower's verification
- 🟢 **Active**: Green - In progress, on track
- 🔴 **Due**: Red - Deadline passed, overdue
- 🟣 **Pending Settlement**: Purple - Awaiting final approval
- 🔵 **Settled**: Blue - Successfully completed
- ⚫ **Rejected**: Gray - Declined or cancelled

### Legal Module Costs
| Module | Discounted | Premium |
|--------|-----------|---------|
| e-Sign | ₹29 | ₹39 |
| e-Stamp | ₹39 | ₹49 |
| Evidence | ₹29 | ₹39 |
| Bundle (All 3) | ₹79 | ₹99 |

### Reliability Score Impact
| Event | Impact |
|-------|--------|
| On-time settlement | +10 |
| Late 1-14 days | -10 |
| Late 15+ days | -20 |
| Avg 4.5+ star reviews | +10 |
| Avg 3.5-4.49 stars | 0 |
| Avg <3.5 stars | -10 |
| Unresolved <3★ review | Cap at 67 |

### Time Limits
| Rule | Limit |
|------|-------|
| Minimum due date | 48 hours from now |
| Maximum due date | 90 days from now |
| Maximum extensions | 3 per agreement |
| Discounted legal pricing | 24 hours after activation |
| DUE reminders | Daily for 14 days, then weekly |

---

**End of Feature Specification**
