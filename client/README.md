# CollabAI Client

React-based frontend for the CollabAI platform - a self-hosted AI operation platform for teams and businesses.

## Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Git**: For cloning the repository

## How to Add logos to site
- **Login and Forgot password pages**: Add the logo file in public/logo/ or in build/logo/ by name **logoWithText**
- **Dashboard** : Add the logo file in public/logo/ or in build/logo/ by name **faviLogo**

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/sjinnovation/collabai-ucb.git
cd collabai-ucb/client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the client root directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

### 4. Start Development Server
```bash
npm start
```

The application will open at `http://localhost:4000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Starts development server |
| `npm run build` | Creates production build |
| `npm test` | Runs test suite |
| `npm run eject` | Ejects from Create React App |
| `npm run lint` | Runs ESLint for code quality |

## Project Structure

```
client/
├── public/                 # Static assets
│   ├── index.html         # Main HTML template
│   ├── favicon.ico        # Application icon
│   └── manifest.json      # PWA manifest
|   └── logo/              # Please add your logos here 
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/            # Page-level components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service functions
│   ├── utils/            # Utility functions
│   ├── styles/           # CSS and styling files
│   ├── contexts/         # React context providers
│   ├── App.js            # Main application component
│   └── index.js          # Application entry point
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow camelCase naming convention
- Use meaningful component and variable names
- Add PropTypes for component props

### State Management
- Use React Context for global state
- Use useState for local component state

### API Integration
- All API calls should go through service functions
- Handle loading and error states consistently
- Use environment variables for API endpoints

## Building for Production

### 1. Create Production Build
```bash
npm run build
```

The build folder will contain optimized files ready for deployment.

## Features

- **Team Management**: User roles and department access
- **AI Chat Interface**: Multiple AI provider support
- **File Upload**: Document and image analysis
- **Theme Support**: Light and dark mode
- **Responsive Design**: Mobile and desktop compatible
- **Real-time Updates**: Live chat and notifications

## Troubleshooting

### Common Issues

**Port 4000 already in use:**
```bash
# Kill process using port 3000
npx kill-port 4000
# Or start on different port
PORT=3001 npm start
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build fails:**
```bash
# Check for TypeScript errors
npm run lint
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Backend Connection Issues
- Ensure backend server is running on port 8011
- Check REACT_APP_API_URL in .env file
- Verify CORS settings in backend configuration

## Contributing

1. Create feature branch from `main`
2. Follow existing code patterns
3. Add tests for new components
4. Update documentation as needed
5. Submit pull request with clear description

## Dependencies

### Main Dependencies
- **React**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Material-UI / Tailwind**: UI components and styling

### Development Dependencies
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **React Testing Library**: Component testing

## Support

- **Documentation**: [Reference Guide](https://docs.google.com/document/d/1xOyvASQyss3ElNe3-pEpZMrQVFBjqqT4DLq96WtlCoU/edit)
- **Issues**: [GitHub Issues](https://github.com/sjinnovation/CollabAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sjinnovation/CollabAI/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.