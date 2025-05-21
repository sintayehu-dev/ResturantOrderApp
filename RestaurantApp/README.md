# 🍽️ RestaurantApp

A powerful, full-featured Restaurant Management System API built with Go, providing comprehensive functionality for restaurant operations.

![License](https://img.shields.io/badge/license-MIT-blue)
![Go Version](https://img.shields.io/badge/Go-1.24-00ADD8)
![Gin](https://img.shields.io/badge/Gin-Framework-00ADD8)
![GORM](https://img.shields.io/badge/GORM-ORM-00ADD8)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)

## 🌟 Features

- **User Authentication** - Secure JWT-based authentication with role-based access control
- **Menu Management** - Create, update, and organize menu items and categories
- **Table Management** - Track table availability and status
- **Order Processing** - Comprehensive order lifecycle management
- **Invoice Generation** - Generate and manage customer invoices
- **Role-Based Access** - Different permission levels for staff and administrators



## 🔧 Installation & Setup

### Prerequisites
- Go 1.24 or higher
- PostgreSQL
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RestaurantApp.git
   cd RestaurantApp
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=restaurant_db
   DB_PORT=5432
   PORT=9000
   SECRET_KEY=your_secret_key
   ```

3. **Install dependencies**
   ```bash
   go mod download
   ```

4. **Run the application**
   ```bash
   go run main.go
   ```

## 📝 Database Schema

The application uses the following models:
- `User` - Authentication and user management
- `Table` - Restaurant tables information
- `Menu` - Menu categories and organization
- `Food` - Food items with prices and details
- `Order` - Customer orders with status tracking
- `OrderItem` - Individual items within an order
- `Invoice` - Payment information for completed orders
- `Note` - Additional notes and information

## 🧪 Testing

Run the test suite with:

```bash
go test ./...
```

## 🚀 Deployment

The application can be deployed as a standalone API or as part of a larger system:

- **Docker**
  ```bash
  docker build -t restaurant-app .
  docker run -p 9000:9000 restaurant-app
  ```

- **Kubernetes** - Deployment templates available in the `/deployment` directory

## 🔒 Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Request validation
- Environment-based configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

