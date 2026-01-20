# SamvidhanAI 2.0: Superb & Attractive Transformation Plan

## 1. Vision
Transform the current single-page dashboard into a "Pro-Max" multi-page application with a premium "Glassmorphism" aesthetic, modeled after the provided reference designs. The goal is to create a "completely different, attractive" experience that feels like a high-end legal tech product.

## 2. Architecture Overhaul (Layout)
- **Switch to Top Navigation**: Move from a Sidebar-heavy design to a sleek **Top Navigation Bar** as seen in the screenshots.
- **Pages Structure**:
  - `/dashboard`: The main hub with Stats, Quick Actions, and Activity.
  - `/assistant`: The dedicated AI Chat interface (current dashboard functionality moved here).
  - `/document-lab`: A new feature for drafting and comparing documents.
  - `/search`: A dedicated Government Source search engine.
  - `/templates`: (Placeholder) Legal templates library.

## 3. Module Breakdown

### A. The Dashboard Hub (New)
*Reference: Image 1*
- **Header**: "Welcome back, [User]" with role indicator.
- **Stats Row**: 
  - Documents Generated (Counter)
  - Searches Performed (Counter)
  - Templates Used (Counter)
  - AI Queries (Counter)
- **Quick Actions Grid**: Beautiful cards for "AI Assistant", "Document Lab", "Templates", "Official Search".
- **Recent Activity**: A timeline list of recent user actions.

### B. AI Assistant (Enhanced)
*Reference: Image 2*
- **Full Screen Chat**: Dedicated space, no clutter.
- **Features**:
  - Bilingual Support (English/Hindi toggle).
  - "Compare" Logic: Enhanced rendering of IPC vs BNS comparisons.
  - **Visual Reasoning Graph**: Integrate our newly built Graph feature here.
  - **Voice Mode**: Continue using Sarvam AI STT/TTS.

### C. Document Lab (New Feature)
*Reference: Image 3*
- **Tabs**: Generate, Redraft, Compare.
- **Form Interface**: Dropdown for Document Type (e.g., Office Memorandum, Legal Notice), Text Area for details.
- **Action**: "Generate Document" button triggering AI generation.

### D. Official Search (New Feature)
*Reference: Image 4*
- **Search Bar**: Dedicated to `.gov.in` and `.nic.in` domains.
- **Filters**: Ministry/Department dropdown, Year picker.
- **Results**: Clean list of verified government sources.

## 4. "Superb" Design Language
- **Typography**: Inter or Plus Jakarta Sans.
- **Color Palette**: 
  - Primary: Deep Royal Blue / Indigo (Trust, Law).
  - Accents: Gradient Oranges (Indian Flag inspiration, subtle).
  - Backgrounds: Off-white/Gray with subtle glass blurs.
- **Animations**: `Framer Motion` for smooth page transitions and card hover effects.

## 5. Implementation Steps
1.  **Refactor Navigation**: Create `TopNav` component and updated `Layout`.
2.  **Build Dashboard**: Create the Stats and Quick Actions UI.
3.  **Migrate Chat**: Move current chat logic to `/assistant`; clean up the UI.
4.  **Implement Document Lab**: Create the UI and connect to a simple AI prompt for generation.
5.  **Implement Official Search**: Create the UI and connect to a search API (Google Custom Search or Serper).

## 6. Backend Requirements
- No major changes needed immediately, but new endpoints for "Document Generation" might be useful later.
