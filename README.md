# Perfect DocStudio

A TypeScript-based frontend application with full localization support, dynamic transactional logic, and integration with Activepieces backend APIs.

## Features

- 🌍 **Full Localization**: Support for English and French with easy language switching
- 📁 **CSV Upload**: Drag & drop CSV file upload with data preview
- 📧 **Email Templates**: Dynamic email template selection and management
- 📱 **SMS Failover**: Automatic SMS sending when email delivery fails
- 🔄 **Transaction Management**: Real-time transaction processing with progress tracking
- 📊 **Status Viewer**: Comprehensive status tracking for all transactions
- 🎨 **Modern UI**: Beautiful, responsive design with DocStudio theme
- 🔒 **Authentication**: Secure login system with protected routes

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with CSS Variables + Component Classes
- **Localization**: i18next + react-i18next
- **HTTP Client**: Axios
- **CSV Parsing**: PapaParse
- **Routing**: React Router DOM
- **State Management**: React Context + Hooks

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CsvUploadSection.tsx
│   ├── LanguageSelector.tsx
│   ├── StatusViewer.tsx
│   ├── TemplateSelectionSection.tsx
│   └── TransactionManager.tsx
├── contexts/           # React contexts for state management
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── hooks/              # Custom React hooks
├── locales/            # Localization files
│   ├── en.json
│   └── fr.json
├── pages/              # Page components
│   ├── DashboardPage.tsx
│   └── LoginPage.tsx
├── services/           # API services
│   └── api.ts
├── styles/             # CSS files
│   ├── global.css
│   └── components.css
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── config.ts
│   └── csvParser.ts
├── App.tsx             # Main app component
└── main.tsx            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd perfect_docstudio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` file with your configuration:
```env
LANGUAGE=en
VITE_API_BASE_URL=http://localhost:3000
VITE_ACTIVEPIECES_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### Demo Credentials

For testing purposes, use these demo credentials:
- **Email**: admin@docstudio.com
- **Password**: password

## Configuration

### Language Settings

The application supports multiple languages. Set the default language in your `.env` file:

```env
LANGUAGE=en  # English
LANGUAGE=fr  # French
```

Users can also switch languages dynamically using the language selector in the top-right corner.

### API Configuration

Configure your Activepieces backend API endpoints:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ACTIVEPIECES_API_KEY=your_api_key_here
```

## API Integration

The application integrates with Activepieces backend APIs:

### Endpoints

- `GET /email-templates` - Fetch available email templates
- `GET /sms-templates` - Fetch available SMS templates
- `POST /send-email` - Send email transaction
- `POST /send-sms` - Send SMS transaction

### Request/Response Format

All API requests include proper authentication headers and follow the defined interfaces in `src/types/index.ts`.

## Usage

### 1. Login
- Access the application and log in with your credentials
- The interface will display in your selected language

### 2. Upload CSV
- Drag and drop a CSV file or click to browse
- The application will parse and validate the CSV data
- Preview the first 5 rows to ensure data integrity

### 3. Select Templates
- Choose an email template from the dropdown
- Optionally enable SMS failover and select an SMS template
- Review template previews before proceeding

### 4. Start Transaction
- Click "Start Transaction" to begin processing
- Monitor real-time progress and status updates
- View detailed status for each row

### 5. Monitor Results
- Use the Status Viewer to track all transactions
- Click on any row to view detailed information
- Export results or retry failed transactions

## CSV Format Requirements

Your CSV file should include these columns:
- `email` - Recipient email address (required)
- `name` - Recipient name (required)
- Any additional columns will be available as template variables

Example CSV:
```csv
email,name,company,role
john@example.com,John Doe,Acme Corp,Manager
jane@example.com,Jane Smith,Tech Inc,Developer
```

## Building for Production

```bash
npm run build
```

The built application will be in the `dist/` directory.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project follows TypeScript best practices and includes ESLint configuration for code quality.

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify your `VITE_API_BASE_URL` is correct
   - Check that your Activepieces backend is running
   - Ensure your API key is valid

2. **CSV Parsing Issues**
   - Ensure your CSV file is properly formatted
   - Check that required columns (email, name) are present
   - Verify the file encoding is UTF-8

3. **Localization Issues**
   - Check that language files are properly loaded
   - Verify the `LANGUAGE` environment variable is set
   - Clear browser cache if issues persist

### Debug Mode

Enable debug logging by setting the environment variable:
```env
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Additional language support
- [ ] Advanced CSV validation rules
- [ ] Bulk retry functionality
- [ ] Export capabilities
- [ ] Advanced analytics dashboard
- [ ] Webhook integration
- [ ] Multi-tenant support
