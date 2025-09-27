# CertusAI Frontend

Beautiful Swiss Government-style frontend for the CertusAI legal analysis system.

## 🎨 Design System

This application follows the Swiss Government Design System with:

- **Swiss Federal Colors**: Red (#FF0000), White, and Swiss Grays
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Consistent, accessible UI components
- **Responsive Design**: Mobile-first approach for all devices

## 🚀 Features

### Core Functionality
- **Hybrid Input System**: Upload documents (PDF/DOCX) or enter text directly
- **AI Analysis**: Comprehensive analysis using Qwen AI + Swisscom Apertus
- **Similar Case Search**: Find relevant legal precedents and documents
- **Trust Scoring**: Multi-factor trust scoring for legal documents
- **Swiss Compliance**: Automated compliance checking for Swiss legal standards

### AI-Powered Features
- **Prompt Improvement**: Step-by-step AI guidance to improve legal questions
- **Comprehensive Analysis**: Combined insights from multiple AI models
- **Smart Suggestions**: Intelligent recommendations for legal research
- **Document Authentication**: Verification of document authenticity

### Admin Dashboard
- **Batch Analysis**: Process multiple documents simultaneously
- **AI Tagging**: Automated document categorization and tagging
- **Analytics**: Comprehensive usage and performance metrics
- **Document Management**: Advanced document organization tools

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS with Swiss Design System
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **HTTP Client**: Fetch API with custom service layer

## 📱 Pages

### 1. Home Page (`/`)
- Hero section with Swiss branding
- Hybrid input interface
- Feature overview
- Statistics dashboard

### 2. Analysis Page (`/analysis`)
- Comprehensive AI analysis results
- Trust score visualization
- Similar cases display
- Legal entity extraction
- Quick actions sidebar

### 3. Search Page (`/search`)
- Advanced legal document search
- AI prompt improvement interface
- Filtering by document type, legal domain, and date
- Intelligent search results

### 4. Admin Dashboard (`/admin`)
- Analytics overview
- Batch document analysis
- AI-powered tagging system
- Performance metrics

## 🎯 Key Components

### Layout Components
- `SwissHeader`: Navigation with language selector
- Responsive layout system for mobile/tablet/desktop

### Legal Components
- `SwissLegalCard`: Document display cards with trust scores
- `SwissTrustScore`: Multi-factor trust visualization
- Legal entity and reference displays

### AI Components
- `HybridAIAnalysis`: Combined Qwen + Swisscom analysis
- `AIPromptImprovementInterface`: Step-by-step prompt enhancement
- Confidence scoring and recommendation systems

### Input Components
- `SwissHybridInput`: File upload + text input with drag/drop
- Comprehensive form validation and error handling

## 🌐 Multilingual Support

The application supports four languages with Swiss German as the default:
- 🇨🇭 Swiss German (Schweizerdeutsch) - **Default**
- 🇫🇷 French (Français)
- 🇮🇹 Italian (Italiano)
- 🇬🇧 English

### Language Files Structure

```
src/locales/
├── index.ts          # Translation utilities and exports
├── de.ts            # German (Swiss) translations
├── fr.ts            # French translations
├── it.ts            # Italian translations
└── en.ts            # English translations
```

### Using Translations

```typescript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('upload.title')}</p>
    </div>
  );
};
```

### Translation Keys

All translations follow a nested structure:
- `nav.*` - Navigation items
- `upload.*` - Upload interface
- `analysis.*` - Analysis results
- `search.*` - Search interface
- `admin.*` - Admin dashboard
- `ai.*` - AI features
- `trustScore.*` - Trust scoring
- `common.*` - Common UI elements

### Language Persistence

The application automatically saves your language preference:
- ✅ **Zustand Persist**: State management with automatic localStorage persistence
- ✅ **Context Provider**: Global language state management
- ✅ **Page Navigation**: Language maintained when switching pages
- ✅ **Browser Refresh**: Language preference restored on reload
- ✅ **No Infinite Loops**: Clean, stable language management

**Storage Key**: `certusai-storage` in localStorage (managed by Zustand)

## 🔧 Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Environment Variables
Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, etc.)
│   ├── legal/          # Legal-specific components
│   ├── upload/         # Upload and input components
│   ├── ai/             # AI analysis components
│   ├── prompt-improvement/  # Prompt enhancement
│   └── admin/          # Admin dashboard components
├── pages/              # Page components
├── services/           # API service layer
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── styles/             # Global styles and design system
```

## 🎨 Swiss Design Guidelines

### Color Palette
- Primary: Swiss Red (#FF0000)
- Secondary: Swiss Blue (#0066CC)
- Neutrals: Swiss Gray scale (50-900)
- Success: Swiss Green (#059669)
- Warning: Swiss Yellow (#D97706)

### Typography
- Display: 36px, Bold
- Heading 1: 30px, Semibold
- Heading 2: 24px, Semibold
- Body: 16px, Regular
- Caption: 12px, Regular

### Components
- Cards: Clean white background with subtle shadows
- Buttons: Swiss Red primary, outlined secondary
- Forms: Focused ring states with Swiss Red
- Badges: Contextual colors with proper contrast

## 🔒 Security & Compliance

- Swiss data residency compliance
- GDPR-compliant data handling
- Secure file upload with validation
- Document anonymization
- Audit logging for all operations

## 📊 Performance

- Lazy loading for optimal performance
- Efficient state management with Zustand
- Optimized bundle size with code splitting
- Responsive images and assets

## 🧪 Testing

- React Testing Library for component tests
- TypeScript for type safety
- ESLint and Prettier for code quality

## 🚀 Deployment

The application is designed for deployment on Swiss-hosted infrastructure:
- Static hosting for frontend assets
- CDN integration for optimal performance
- Environment-specific configuration

## 📞 Support

For technical support and questions about the CertusAI frontend, please contact the development team.

---

**CertusAI** - Swiss Legal Analysis System
© 2024 Swiss Federal Government