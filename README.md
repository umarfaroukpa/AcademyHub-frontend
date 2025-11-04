# 🎓 AcademiHub - Academic Management Platform

A comprehensive academic management platform built with Next.js, designed to streamline university operations for students, lecturers, and administrators. AcademiHub provides a modern, user-friendly interface for course management, enrollment tracking, assignment submission, and academic collaboration.

## 📖 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Integration](#-api-integration)
- [User Roles & Permissions](#-user-roles--permissions)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Features
- **Multi-Role Authentication**: Support for students, lecturers, and administrators
- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **Role-Based Dashboards**: Customized interfaces for each user type
- **Course Management**: Complete CRUD operations for academic courses
- **Enrollment System**: Student course enrollment with approval workflows
- **Assignment Management**: Create, submit, and grade assignments
- **Study Groups**: Collaborative learning spaces for students
- **Profile Management**: User profile customization and settings

### 👨‍🎓 Student Features
- Course browsing and enrollment
- Assignment submission and tracking
- Grade viewing and progress monitoring
- Study group participation
- Academic calendar and scheduling

### 👨‍🏫 Lecturer Features
- Course creation and management
- Assignment creation and grading
- Student enrollment approval
- Class roster management
- Academic resource sharing

### 👨‍💼 Admin Features
- User management (students, lecturers, admins)
- System-wide course oversight
- Enrollment monitoring and analytics
- Platform configuration and settings
- Comprehensive reporting and statistics

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15.5.3 (React 18.3.1)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Lucide React Icons
- **HTTP Client**: Axios
- **Data Fetching**: SWR
- **Authentication**: Google OAuth (@react-oauth/google)

### Development Tools
- **Linting**: ESLint with Next.js configuration
- **Testing**: Cypress for E2E testing
- **Package Manager**: npm
- **Build Tool**: Next.js standalone output

### Supporting Services
- **AI Service**: Express.js-based microservice (planned)
- **Queue System**: Redis for background job processing
- **Container**: Docker & Docker Compose

## 📁 Project Structure

```
academic-manager-frontend/
├── 📂 src/
│   ├── 📂 app/                     # Next.js App Router pages
│   │   ├── 📂 AdminDashboard/      # Admin dashboard page
│   │   ├── 📂 LecturersDashboard/  # Lecturer dashboard page
│   │   ├── 📂 StudentsDashboard/   # Student dashboard page
│   │   ├── 📂 AssignmentManagement/ # Assignment features
│   │   ├── 📂 Study-Groups/        # Study group features
│   │   ├── 📂 login/               # Authentication pages
│   │   ├── 📂 signup/              # User registration
│   │   ├── 📂 profile/             # User profile management
│   │   └── 📄 layout.tsx           # Root layout component
│   ├── 📂 components/              # Reusable UI components
│   │   ├── 📄 Header.tsx           # Navigation header
│   │   ├── 📄 Footer.tsx           # Site footer
│   │   ├── 📄 GoogleSignInWithRole.jsx # Google auth component
│   │   └── 📄 LayoutWrapper.tsx    # Layout wrapper
│   └── 📂 courses/                 # Course-related components
├── 📂 hook/                        # Custom React hooks
│   └── 📄 useAuth.ts               # Authentication hook
├── 📂 lib/                         # Utility libraries
│   ├── 📄 api.ts                   # Axios configuration
│   └── 📄 auth.ts                  # Authentication utilities
├── 📂 types/                       # TypeScript type definitions
│   └── 📄 types.ts                 # Application interfaces
├── 📂 ai-service/                  # AI microservice (planned)
├── 📂 cypress/                     # E2E test suite
│   ├── 📂 e2e/                     # Test specifications
│   ├── 📂 support/                 # Test utilities
│   └── 📄 CYPRESS_TESTS_README.md  # Testing documentation
├── 📂 public/                      # Static assets
├── 📄 package.json                 # Dependencies and scripts
├── 📄 next.config.js               # Next.js configuration
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 tailwind.config.js           # Tailwind CSS configuration
├── 📄 cypress.config.ts            # Cypress test configuration
└── 📄 docker-compose.yml           # Docker services setup
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/umarfaroukpa/AcademyHub-frontend.git
   cd academic-manager-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

## ⚙️ Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API endpoint
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID for authentication

### Next.js Configuration
The project uses standalone output for optimized deployment:
```javascript
// next.config.js
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false }
}
```

## 💻 Development

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build production bundle
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run cypress:open`: Open Cypress test runner
- `npm run test:e2e`: Run E2E tests with server
- `npm run test:e2e:ci`: Run E2E tests in CI mode

### Development Workflow
1. Make changes to source code
2. Test locally with `npm run dev`
3. Run linting with `npm run lint`
4. Execute E2E tests with `npm run cypress:open`
5. Build for production with `npm run build`

## 🧪 Testing

The project includes comprehensive E2E testing with Cypress.

### Test Categories
- **Authentication Tests**: Login/logout functionality
- **Dashboard Tests**: Role-specific dashboard features
- **Course Management**: CRUD operations for courses
- **User Management**: Admin user management features

### Running Tests
```bash
# Open Cypress Test Runner
npm run cypress:open

# Run tests headlessly
npm run cypress:run

# Run with live development server
npm run test:e2e
```

### Test Structure
```
cypress/
├── e2e/
│   ├── auth.cy.ts                    # Authentication flows
│   ├── admin-dashboard.cy.ts         # Admin dashboard tests
│   ├── lecturer-dashboard.cy.ts      # Lecturer dashboard tests
│   └── student-dashboard.cy.ts       # Student dashboard tests
├── support/
│   ├── commands.ts                   # Custom commands
│   └── dashboard-helpers.ts          # Reusable helpers
└── fixtures/                        # Test data
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

### Vercel Deployment
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy with automatic builds

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🔌 API Integration

### API Configuration
The application uses Axios for HTTP requests with automatic token management:

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});
```

### Authentication Flow
1. User authenticates via Google OAuth or email/password
2. JWT token stored in localStorage
3. Automatic token attachment to API requests
4. Token refresh and error handling

### Backend Requirements
The frontend expects a REST API with the following endpoints:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/courses` - Course listing
- `POST /api/enrollments` - Course enrollment
- `GET /api/users` - User management (admin)

## 👥 User Roles & Permissions

### 🎓 Student Role
- **Permissions**: Course browsing, enrollment, assignment submission
- **Dashboard**: Personal course list, grades, assignments
- **Restrictions**: Cannot create courses or manage other users

### 👨‍🏫 Lecturer Role
- **Permissions**: Course creation, student management, grading
- **Dashboard**: Course management, enrollment approvals, assignment grading
- **Restrictions**: Limited to own courses and enrolled students

### 👨‍💼 Admin Role
- **Permissions**: Full system access, user management, system configuration
- **Dashboard**: System statistics, user management, global course oversight
- **Restrictions**: None - full administrative access

## 🎨 UI/UX Design

### Design System
- **Color Scheme**: Modern blue and gray palette
- **Typography**: Inter font family for optimal readability
- **Icons**: Lucide React for consistent iconography
- **Responsive**: Mobile-first responsive design
- **Accessibility**: WCAG 2.1 AA compliance considerations

### Component Architecture
- Reusable component library in `/src/components`
- Consistent styling with Tailwind CSS
- TypeScript interfaces for type safety
- Custom hooks for state management

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Google OAuth configuration
   - Check API endpoint connectivity
   - Ensure environment variables are set

2. **Build Failures**
   - Clear `.next` directory: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`

3. **Cypress Test Failures**
   - Ensure development server is running
   - Check test data and API mocks
   - Verify element selectors

### Performance Optimization
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Bundle analysis with `@next/bundle-analyzer`
- Caching strategies for API responses

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Write comprehensive tests for new features
4. Follow conventional commit messages
5. Ensure accessibility compliance

### Contribution Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- TypeScript strict mode enabled
- Component and function naming conventions

## 📋 Roadmap

### Upcoming Features
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] AI-powered course recommendations
- [ ] Video conferencing integration
- [ ] Advanced reporting system

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in `/docs`

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**AcademiHub** - Transforming Academic Management for the Digital Age 🎓✨
