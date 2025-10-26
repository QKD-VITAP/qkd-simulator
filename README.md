# QKD Simulator & Demonstrator

A comprehensive Quantum Key Distribution (QKD) simulator implementing the BB84 protocol with realistic channel impairments, attack models, and secure messaging capabilities.

## Features

- **BB84 Protocol Implementation**: Complete quantum key distribution simulation
- **Real-time Dashboard**: Live monitoring of simulations and metrics
- **Attack Models**: Intercept-Resend, Photon-Number Splitting, Detector Blinding
- **Advanced Features**: Reconciliation, Privacy Amplification, Decoy States
- **Secure Messaging**: AES encryption using QKD-generated keys
- **Mobile-First Design**: Responsive interface optimized for all devices
- **Real-time Updates**: WebSocket-based live data streaming

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd C:\Users\ng703\Fy\qkd-simulator\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd C:\Users\ng703\Fy\qkd-simulator\frontend
npm install
npm run dev
```

## Project Structure

```
qkd-simulator/
├── backend/
│   ├── app/
│   │   ├── core/           # Core QKD simulation components
│   │   ├── models/         # Pydantic schemas
│   │   └── main.py         # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── api/          # API client
│   └── package.json
└── .cursorrules          # Development guidelines
```

## Core Components

### Backend

- **quantum_states.py**: Quantum state representation and manipulation
- **bb84_protocol.py**: BB84 protocol implementation
- **attack_models.py**: Security attack simulations
- **simulator.py**: Main simulation engine
- **aes_integration.py**: Classical encryption integration
- **decoy_states.py**: Decoy state protocol implementation
- **reconciliation.py**: Error reconciliation algorithms
- **privacy_amplification.py**: Privacy amplification methods

### Frontend

- **Dashboard**: Real-time metrics and visualization
- **Simulation**: Interactive simulation configuration
- **AttackAnalysis**: Security testing interface
- **SecureMessaging**: Quantum-secured communication demo
- **WebSocketContext**: Real-time data streaming

## API Endpoints

### Simulation
- `POST /simulate` - Run synchronous simulation
- `POST /simulate/async` - Run asynchronous simulation
- `GET /simulate/status/{id}` - Get simulation status
- `GET /simulate/history` - Get simulation history

### Dashboard
- `GET /dashboard/data` - Get dashboard metrics
- `GET /dashboard/real-time` - Get real-time data

### Secure Messaging
- `POST /messaging/generate-key` - Generate quantum key
- `POST /messaging/send` - Send encrypted message
- `GET /messaging/history` - Get message history

### WebSocket
- `WS /ws` - Real-time updates

## Development Guidelines

### Code Style
- Follow software best practices
- Write human-readable, maintainable code
- Avoid AI-generated patterns
- No excessive comments - code should be self-documenting
- Mobile-first responsive design

### Real-time Features
- WebSocket connections for live updates
- Proper state synchronization
- Graceful connection handling
- Optimistic updates where appropriate

### Performance
- Optimize for real-time updates
- Implement proper caching
- Use lazy loading
- Minimize bundle sizes

## Usage Examples

### Running a Basic Simulation

```python
from app.core.simulator import QKDSimulator, SimulationParameters

simulator = QKDSimulator()
params = SimulationParameters(
    num_qubits=1000,
    channel_length=50.0,
    channel_attenuation=0.2,
    detector_efficiency=0.8
)
result = simulator.run_simulation(params)
```

### Sending Secure Messages

```javascript
// Generate quantum key
const keyResult = await qkdApi.generateQuantumKey('alice', 'bob');

// Send encrypted message
const message = await qkdApi.sendSecureMessage('alice', 'bob', 'Hello World!');
```

## Security Features

- **Attack Detection**: Automatic detection of eavesdropping attempts
- **QBER Monitoring**: Real-time quantum bit error rate analysis
- **Key Validation**: Cryptographic key verification
- **Secure Communication**: AES-GCM encryption with quantum keys

## Performance Metrics

- **QBER**: Quantum Bit Error Rate
- **Key Rate**: Bits per second generation rate
- **Success Rate**: Percentage of successful simulations
- **Attack Detection**: Security analysis results

## Contributing

1. Follow the cursor rules in `.cursorrules`
2. Write clean, maintainable code
3. Test on mobile devices
4. Ensure real-time functionality works
5. No fake or static data

## License

This project is for educational and research purposes.

## Support

For issues or questions, please check the documentation or create an issue in the repository.
