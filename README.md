# MoneyMate Frontend - Production Ready

A modern, secure, and responsive financial management dashboard built with vanilla JavaScript and CSS.

## Features

- 🔐 Secure Authentication (JWT Bearer Token)
- 📊 Dashboard with Real-time Data
- 💰 Expense & Income Management
- 📈 Financial Analytics
- 💳 Credit Management
- ❤️ Financial Health Score
- 🔔 Smart Alerts System
- 📱 Fully Responsive Design
- 🚀 Production Optimized

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Build Tool**: Vite
- **Libraries**: Framer Motion, Recharts, Lucide React
- **Authentication**: JWT (Bearer Token)
- **API Client**: Fetch API with Caching

## Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running at `http://localhost:9090/api/v1.0`

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

## Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:9090/api/v1.0
VITE_APP_NAME=MoneyMate
VITE_APP_VERSION=1.0.0
```

For production:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1.0
VITE_APP_NAME=MoneyMate
VITE_APP_VERSION=1.0.0
```

## Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

## Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Run linting
npm run lint
```

## Project Structure

```
MomeyMate-Frontend/
├── index.html              # Main HTML entry point
├── js/
│   ├── config.js          # API configuration and endpoints
│   ├── api.js             # API client with all methods
│   ├── auth.js            # Authentication logic
│   ├── utils.js           # Utility functions
│   └── helpers.js         # Helper functions
├── style.css              # Main stylesheet
├── auth.css               # Authentication styles
├── dashboard.css          # Dashboard styles
├── responsive.css         # Responsive design
├── package.json
└── vite.config.js
```

## API Integration

All API endpoints are configured in `js/config.js`:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh token

### Dashboard
- `GET /dashboard/summary` - Dashboard overview
- `GET /dashboard/recent-transactions` - Recent transactions

### Expenses
- `GET /expenses` - List all expenses
- `POST /expenses` - Create expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `POST /expenses/filter` - Filter expenses

### Income
- `GET /income` - List all income
- `POST /income` - Create income
- `PUT /income/:id` - Update income
- `DELETE /income/:id` - Delete income

### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Analytics
- `GET /analytics/monthly-summary` - Monthly summary
- `GET /analytics/category-breakdown` - Category breakdown

### Credit
- `GET /credit/accounts` - List credit accounts
- `POST /credit/accounts` - Create credit account
- `GET /credit/score` - Get credit score
- `GET /credit/payments` - List payments
- `POST /credit/payments` - Create payment
- `POST /credit/simulator` - Run credit simulator

### Financial Health
- `GET /financial-health/score` - Health score
- `GET /financial-health/indicators` - Health indicators

### Alerts
- `GET /alerts` - List all alerts

### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

## Features

### Authentication
- Secure JWT-based authentication
- Automatic token refresh
- Session management with localStorage
- Auto-logout on token expiry

### Data Management
- 5-minute response caching for GET requests
- Automatic cache invalidation on mutations
- Request timeout handling (30 seconds)
- Optimistic error handling

### UI/UX
- Loading states and indicators
- Toast notifications
- Form validation
- Responsive mobile-first design
- Dark/Light compatible CSS

### Security
- Bearer token in Authorization header
- HTTPS ready (configure VITE_API_BASE_URL)
- XSS protection via DOM manipulation
- CSRF token support (if backend requires)

## Deployment

### Vercel (Recommended)
```bash
# Push to GitHub and connect to Vercel
vercel
```

### Netlify
```bash
# Build and deploy
npm run build
# Then deploy the dist/ folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Traditional Server (Apache/Nginx)
1. Run `npm run build`
2. Copy `dist/` folder to server
3. Configure server to serve `index.html` for SPA routing
4. Set appropriate headers for security

## Security Checklist

- ✅ JWT Bearer token authentication
- ✅ Automatic logout on 401 Unauthorized
- ✅ HTTPS ready configuration
- ✅ XSS prevention via safe DOM methods
- ✅ CORS configured at backend
- ✅ Environment variables for API URL
- ✅ Session timeout handling
- ✅ Secure token storage (localStorage - consider sessionStorage for sensitive)

## Performance Optimization

- ✅ Lazy loading for modules
- ✅ Response caching (5 minutes)
- ✅ Minified CSS and JavaScript
- ✅ Optimized images
- ✅ Request deduplication
- ✅ Efficient DOM updates

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Troubleshooting

### API Connection Issues
1. Check `VITE_API_BASE_URL` in `.env`
2. Ensure backend is running
3. Check CORS configuration on backend
4. Open browser DevTools → Network tab to inspect requests

### Authentication Issues
1. Verify credentials
2. Check token in localStorage (DevTools → Application)
3. Ensure backend returns `token` in login response
4. Check Authorization header format: `Bearer <token>`

### Build Issues
1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear npm cache: `npm cache clean --force`
3. Check Node.js version: `node --version` (should be 16+)

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Project Issues](https://github.com/Pankaj-kurmi/MomeyMate-Frontend/issues)
- Email: support@moneymate.com

## Changelog

### v1.0.0 (Current)
- Initial production release
- Complete API integration
- Full authentication system
- Dashboard with analytics
- Responsive design
