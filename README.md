# Bookkeeping UAE - Web UI

A modern, responsive web application for managing bookkeeping operations in the UAE. Built with React, TypeScript, and Vite for optimal performance and developer experience.

## 🚀 Features

- **Dashboard** - Overview of financial metrics and key performance indicators
- **Invoices Management** - Create, view, and manage customer invoices
- **Expenses Tracking** - Record and categorize business expenses
- **Vendor Bills** - Manage vendor bills and payments
- **Chart of Accounts** - Comprehensive account management
- **Financial Reports** - Generate balance sheets, P&L statements, and more
- **Multi-language Support** - English and Arabic (i18n)
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Backend API** - The bookkeeping API must be running (see backend setup)

## 🛠️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/inteletra/book-keeping-ui.git
cd book-keeping-ui
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory (optional, defaults are provided):

```env
VITE_API_URL=http://localhost:3000
```

**Note:** The application is configured to connect to the backend API at `http://localhost:3000` by default.

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🏗️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client
- **Recharts** - Charting library
- **i18next** - Internationalization
- **Lucide React** - Icon library

## 📁 Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── layouts/         # Page layout components
├── locales/         # Translation files (en, ar)
├── pages/           # Page components
│   ├── DashboardPage.tsx
│   ├── InvoicesPage.tsx
│   ├── ExpensesPage.tsx
│   ├── VendorBillsPage.tsx
│   └── ...
├── services/        # API service layer
├── shared/          # Shared utilities and types
├── utils/           # Helper functions
├── App.tsx          # Main application component
├── main.tsx         # Application entry point
└── i18n.ts          # i18n configuration
```

## 🔌 Backend API Setup

This UI requires the backend API to be running. Follow these steps:

### 1. Navigate to API Directory

```bash
cd ../api  # If you're in the web directory
```

### 2. Install API Dependencies

```bash
npm install
```

### 3. Setup Database

Start PostgreSQL using Docker:

```bash
docker-compose up -d
```

This will start a PostgreSQL database on port 5432.

### 4. Configure API Environment

Create a `.env` file in the `api` directory:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=bookkeeping
JWT_SECRET=supersecretkey123
```

### 5. Start the API Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## 🌐 Accessing the Application

1. Ensure the backend API is running on `http://localhost:3000`
2. Start the web UI development server: `npm run dev`
3. Open your browser and navigate to `http://localhost:5173`
4. Login with your credentials (default admin user should be created by the backend)

## 🔐 Authentication

The application uses JWT-based authentication. Users must log in to access the application features. The authentication token is stored in localStorage and automatically included in API requests.

## 🌍 Language Support

The application supports:
- **English (en)** - Default language
- **Arabic (ar)** - RTL support included

Switch languages using the language selector in the application header.

## 🎨 Styling

This project uses **TailwindCSS** for styling with custom configurations:

- Custom color palette
- Responsive breakpoints
- Dark mode support (if implemented)
- Custom utility classes

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px and above)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## 🚀 Production Build

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory. You can preview the production build:

```bash
npm run preview
```

## 📝 Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Keep components small and focused
- Use TanStack Query for data fetching
- Maintain consistent code formatting (ESLint)

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port.

### API Connection Issues

- Verify the backend API is running on `http://localhost:3000`
- Check CORS settings in the backend
- Ensure `.env` file has the correct `VITE_API_URL`

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Contributors

Developed by the Inteletra team.

## 📞 Support

For issues or questions, please contact the development team or create an issue in the repository.
