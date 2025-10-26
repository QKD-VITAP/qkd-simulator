# QKD Simulator - Quantum Key Distribution

A comprehensive Quantum Key Distribution (QKD) simulator with modern web interface for running BB84 protocol simulations, attack analysis, and secure messaging.

## Features

- **BB84 Protocol Simulation** - Complete quantum key distribution implementation
- **Attack Analysis** - Test security against various quantum attacks
- **Advanced Features** - Reconciliation, privacy amplification, decoy states
- **Secure Messaging** - Quantum-secured messaging with AES encryption
- **Real-time Dashboard** - Live simulation statistics and monitoring
- **Mobile-Friendly** - Responsive design for all devices

## Quick Start

### Development Mode

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Run Development Servers**
   
   **Backend Server**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **Frontend Server (in a separate terminal)**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Production Mode

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Run Backend (serves both API and frontend)**
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

3. **Access the Application**
   - Application: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Troubleshooting

### 404 Error on Page Refresh

If you get a 404 error when refreshing pages in development:

1. **Ensure you're accessing via the correct port**:
   - Frontend: http://localhost:5173 (for development)
   - Backend: http://localhost:8000 (for production)
2. **Make sure both servers are running**:
   - Backend server on port 8000
   - Frontend dev server on port 5173

### Mobile Issues

The application is fully mobile-responsive. If you experience issues:
- Clear browser cache
- Ensure you're using a modern browser
- Check that viewport meta tag is working

### Authentication Issues

- The app uses Google OAuth for authentication
- Ensure your Google OAuth credentials are properly configured
- Check browser console for authentication errors

## Architecture

- **Backend**: FastAPI with Python
- **Frontend**: React with Vite
- **Styling**: Styled-components
- **State Management**: React Query + Zustand
- **Real-time**: WebSocket connections
- **Authentication**: Google OAuth

## API Endpoints

- `GET /` - API status
- `POST /simulate/bb84` - Run BB84 simulation
- `GET /simulation/{id}/status` - Get simulation status
- `POST /attack/simulate` - Run attack simulation
- `GET /dashboard/data` - Get dashboard statistics
- `WebSocket /ws` - Real-time updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
