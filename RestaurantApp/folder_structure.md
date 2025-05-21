# RestaurantApp System Architecture

This document outlines the folder structure for both the mobile application (Flutter with DDD architecture) and the admin panel (React.js).

## System Overview

```
restaurant_system/
├── backend/                # Go API (RestaurantApp)
├── mobile_app/             # Flutter Mobile App (DDD Architecture)
└── admin_panel/            # React.js Admin Dashboard
```

---

## 1. Flutter Mobile App Structure (DDD Architecture with Feature-First Approach)

```
mobile_app/
├── android/                # Android-specific files
├── ios/                    # iOS-specific files
├── lib/
│   ├── app/
│   │   ├── app.dart        # App entry point
│   │   ├── routes.dart     # App routes
│   │   ├── theme.dart      # App theme
│   │   └── locator.dart    # Service locator / dependency injection
│   ├── core/               # Core functionality used across features
│   │   ├── constants/      # App constants
│   │   ├── errors/         # Error handling
│   │   ├── network/        # Network utilities and interceptors
│   │   ├── storage/        # Local storage utilities
│   │   └── utils/          # Common utility functions
│   ├── domain/             # Domain layer (entities, repositories interfaces)
│   │   ├── entities/       # Domain entities
│   │   │   ├── user.dart
│   │   │   ├── table.dart
│   │   │   ├── menu.dart
│   │   │   ├── food.dart
│   │   │   ├── order.dart
│   │   │   └── invoice.dart
│   │   ├── repositories/   # Repository interfaces
│   │   │   ├── auth_repository.dart
│   │   │   ├── table_repository.dart
│   │   │   └── ...
│   │   ├── usecases/       # Business logic use cases
│   │   │   ├── auth/
│   │   │   ├── table/
│   │   │   └── ...
│   │   └── value_objects/  # Value objects
│   │
│   ├── features/           # Feature-first organization
│   │   ├── auth/           # Authentication feature
│   │   │   ├── data/       # Data layer for auth
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── auth_remote_data_source.dart
│   │   │   │   │   └── auth_local_data_source.dart
│   │   │   │   ├── models/
│   │   │   │   │   └── user_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   ├── domain/     # Domain layer for auth
│   │   │   │   ├── entities/
│   │   │   │   ├── repositories/
│   │   │   │   └── usecases/
│   │   │   └── presentation/ # UI layer for auth
│   │   │       ├── bloc/    # State management
│   │   │       │   ├── auth_bloc.dart
│   │   │       │   ├── auth_event.dart
│   │   │       │   └── auth_state.dart
│   │   │       ├── pages/   # Screens
│   │   │       │   ├── login_page.dart
│   │   │       │   └── register_page.dart
│   │   │       └── widgets/ # UI components
│   │   │           └── login_form.dart
│   │   │
│   │   ├── menu/           # Menu feature
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── order/          # Order feature
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── table/          # Table feature
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── home/           # Home screen feature
│   │   │   └── presentation/
│   │   │
│   │   └── profile/        # User profile feature
│   │       ├── data/
│   │       ├── domain/
│   │       └── presentation/
│   │
│   ├── infrastructure/     # Implementation of repositories
│   │   ├── datasources/    # Data sources (API, local DB)
│   │   │   ├── api/
│   │   │   └── local/
│   │   └── repositories/   # Repository implementations
│   │
│   └── main.dart           # Entry point
│
├── test/                   # Tests directory
│   ├── domain/             # Domain tests
│   ├── features/           # Feature tests
│   └── infrastructure/     # Infrastructure tests
│
├── pubspec.yaml            # Dependencies
└── README.md               # Project documentation
```

## 2. React.js Admin Panel Structure

```
admin_panel/
├── public/                 # Public assets
│   ├── favicon.ico
│   ├── index.html
│   └── assets/
│       └── images/
│
├── src/
│   ├── api/                # API connections
│   │   ├── axios.js        # Axios instance with interceptors
│   │   ├── auth.api.js     # Auth API calls
│   │   ├── users.api.js    # Users API calls
│   │   ├── menus.api.js    # Menus API calls
│   │   ├── foods.api.js    # Foods API calls
│   │   ├── tables.api.js   # Tables API calls
│   │   ├── orders.api.js   # Orders API calls
│   │   └── invoices.api.js # Invoices API calls
│   │
│   ├── assets/             # Static assets
│   │   ├── css/
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/         # Shared components
│   │   ├── common/         # Common UI components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   ├── Form/
│   │   │   └── Loading/
│   │   ├── layout/         # Layout components
│   │   │   ├── Sidebar/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── MainLayout.jsx
│   │   └── charts/         # Chart components
│   │       ├── BarChart/
│   │       ├── LineChart/
│   │       └── PieChart/
│   │
│   ├── context/            # React Context API
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   │
│   ├── features/           # Feature modules
│   │   ├── auth/           # Authentication
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   │
│   │   ├── dashboard/      # Dashboard
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── DashboardPage.jsx
│   │   │
│   │   ├── users/          # User management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── UsersListPage.jsx
│   │   │   └── UserDetailPage.jsx
│   │   │
│   │   ├── menus/          # Menu management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── MenusListPage.jsx
│   │   │   └── MenuDetailPage.jsx
│   │   │
│   │   ├── foods/          # Food items management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── FoodsListPage.jsx
│   │   │   └── FoodDetailPage.jsx
│   │   │
│   │   ├── tables/         # Table management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── TablesListPage.jsx
│   │   │   └── TableDetailPage.jsx
│   │   │
│   │   ├── orders/         # Order management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── OrdersListPage.jsx
│   │   │   └── OrderDetailPage.jsx
│   │   │
│   │   └── invoices/       # Invoice management
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── InvoicesListPage.jsx
│   │       └── InvoiceDetailPage.jsx
│   │
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── useForm.js
│   │
│   ├── redux/              # Redux state management
│   │   ├── slices/         # Redux Toolkit slices
│   │   │   ├── authSlice.js
│   │   │   ├── userSlice.js
│   │   │   ├── menuSlice.js
│   │   │   ├── foodSlice.js
│   │   │   ├── tableSlice.js
│   │   │   ├── orderSlice.js
│   │   │   └── invoiceSlice.js
│   │   ├── store.js        # Redux store
│   │   └── selectors.js    # Redux selectors
│   │
│   ├── routes/             # Application routes
│   │   ├── PrivateRoute.jsx
│   │   ├── PublicRoute.jsx
│   │   └── AppRoutes.jsx
│   │
│   ├── services/           # Business logic services
│   │   ├── auth.service.js
│   │   ├── storage.service.js
│   │   └── api.service.js
│   │
│   ├── utils/              # Utility functions
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── helpers.js
│   │   └── constants.js
│   │
│   ├── App.jsx             # Main app component
│   ├── index.jsx           # Entry point
│   └── index.css           # Global styles
│
├── .env                    # Environment variables
├── .env.development        # Development env variables
├── .env.production         # Production env variables
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── jest.config.js          # Jest configuration
├── package.json            # Dependencies
├── README.md               # Project documentation
└── tsconfig.json           # TypeScript configuration (if using TS)
```

## Key Benefits of this Architecture

### Flutter Mobile App (DDD Architecture)

1. **Separation of Concerns**: Clear separation between domain logic, data handling, and presentation.
2. **Maintainability**: Feature-first approach makes it easy to locate and modify specific functionality.
3. **Scalability**: New features can be added without changing existing code.
4. **Testability**: Each layer can be tested independently.
5. **Domain-Driven**: Business rules are centralized in the domain layer.

### React.js Admin Panel

1. **Feature Organization**: Code is organized by business domain features.
2. **Reusability**: Common components and hooks are shared across features.
3. **State Management**: Redux for global state, React Context for theme/auth.
4. **Separation of API Logic**: API calls are isolated in their own modules.
5. **Maintainability**: Clear organization makes it easy to find and update code.

## Implementation Guidelines

### Flutter Mobile App

1. **Start with Core Infrastructure**:
   - Set up dependency injection
   - Implement network layer
   - Set up local storage utilities

2. **Implement Authentication Feature**:
   - Complete auth feature first (login/register)
   - Set up token handling and session management

3. **Build Feature by Feature**:
   - Implement one feature at a time (menu browsing, ordering, etc.)
   - For each feature, build from domain to presentation

4. **Use BLoC Pattern for State Management**:
   - Implement BLoC for each feature
   - Handle state transitions and side effects

### React Admin Panel

1. **Set Up Project Structure**:
   - Initialize with Create React App
   - Set up routing and layouts

2. **Implement Authentication**:
   - Build login/register pages
   - Set up token handling and protected routes

3. **Develop Core Admin Features**:
   - Dashboard with key metrics
   - User management
   - Menu and food management
   - Order tracking and management
   - Invoice generation and tracking

4. **Use Redux for State Management**:
   - Implement Redux Toolkit for complex state
   - Use React Context for simpler state like theme 