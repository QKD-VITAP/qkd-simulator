
from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any, Union
from enum import Enum


class AttackTypeEnum(str, Enum):
    no_attack = "no_attack"
    intercept_resend = "intercept_resend"
    photon_number_splitting = "photon_number_splitting"
    detector_blinding = "detector_blinding"


class SimulationRequest(BaseModel):
    num_qubits: int = Field(1000, ge=8, le=10000, description="Number of qubits to generate")
    channel_length: float = Field(10.0, ge=0.1, le=100.0, description="Channel length in kilometers")
    channel_attenuation: float = Field(0.1, ge=0.01, le=1.0, description="Channel attenuation in dB/km")
    channel_depolarization: float = Field(0.01, ge=0.0, le=0.1, description="Channel depolarization rate")
    photon_source_efficiency: float = Field(0.8, ge=0.1, le=1.0, description="Photon source efficiency")
    detector_efficiency: float = Field(0.8, ge=0.1, le=1.0, description="Detector efficiency")
    attack_type: Optional[AttackTypeEnum] = Field(None, description="Type of attack to simulate")
    attack_parameters: Optional[Dict[str, Any]] = Field(None, description="Parameters for the attack")
    
    use_advanced_reconciliation: bool = Field(False, description="Enable advanced reconciliation")
    reconciliation_method: str = Field("cascade", description="Reconciliation method (cascade, ldpc, hybrid)")
    use_advanced_privacy_amplification: bool = Field(False, description="Enable advanced privacy amplification")
    privacy_amplification_method: str = Field("toeplitz", description="Privacy amplification method (toeplitz, universal, hybrid)")
    use_decoy_states: bool = Field(False, description="Enable decoy states")
    decoy_state_parameters: Optional[Dict[str, Any]] = Field(None, description="Decoy state parameters")
    
    @validator('num_qubits')
    def validate_num_qubits(cls, v):
        if v < 8:
            raise ValueError('Number of qubits must be at least 8')
        if v > 10000:
            raise ValueError('Number of qubits must be at most 10000')
        return v
    
    @validator('channel_length')
    def validate_channel_length(cls, v):
        if v < 0.1:
            raise ValueError('Channel length must be at least 0.1 km')
        if v > 100.0:
            raise ValueError('Channel length must be at most 100.0 km')
        return v


class SimulationResponse(BaseModel):
    """Response model for simulation requests"""
    simulation_id: str = Field(..., description="Unique simulation identifier")
    status: str = Field(..., description="Simulation status")
    message: str = Field(..., description="Status message")
    timestamp: Union[float, str] = Field(..., description="Simulation timestamp")
    results_summary: Dict[str, Any] = Field(..., description="Summary of simulation results")


class SimulationStatus(BaseModel):
    """Response model for simulation status"""
    simulation_id: str = Field(..., description="Unique simulation identifier")
    status: str = Field(..., description="Current simulation status")
    progress: int = Field(..., ge=0, le=100, description="Progress percentage")
    results: Optional[Dict[str, Any]] = Field(None, description="Simulation results if completed")
    error: Optional[str] = Field(None, description="Error message if failed")
    attack_detection: Optional[Dict[str, Any]] = Field(None, description="Attack detection information")
    simulation_time: Optional[float] = Field(None, description="Simulation execution time in seconds")


class ParameterSweepRequest(BaseModel):
    """Request model for parameter sweep simulations"""
    base_parameters: SimulationRequest = Field(..., description="Base simulation parameters")
    sweep_parameters: Dict[str, List[Union[int, float]]] = Field(
        ..., 
        description="Parameters to sweep and their values"
    )
    
    @validator('sweep_parameters')
    def validate_sweep_parameters(cls, v, values):
        if not v:
            raise ValueError('Sweep parameters cannot be empty')
        
        base_params = values.get('base_parameters')
        if base_params:
            for param_name, values_list in v.items():
                if not values_list:
                    raise ValueError(f'Values for parameter {param_name} cannot be empty')
                
                if not hasattr(base_params, param_name):
                    raise ValueError(f'Parameter {param_name} not found in base parameters')
        
        return v


class AttackSimulationRequest(BaseModel):
    """Request model for attack simulations"""
    num_qubits: int = Field(1000, ge=8, le=10000, description="Number of qubits")
    channel_length: float = Field(10.0, ge=0.1, le=100.0, description="Channel length in kilometers")
    channel_attenuation: float = Field(0.1, ge=0.01, le=1.0, description="Channel attenuation in dB/km")
    attack_type: AttackTypeEnum = Field(..., description="Type of attack to simulate")
    attack_parameters: Optional[Dict[str, Any]] = Field(None, description="Attack-specific parameters")


class QBERMetrics(BaseModel):
    """Response model for QBER metrics"""
    total_simulations: int = Field(..., description="Total number of simulations")
    average_qber: float = Field(..., description="Average QBER across all simulations")
    min_qber: float = Field(..., description="Minimum QBER observed")
    max_qber: float = Field(..., description="Maximum QBER observed")
    recent_qber: List[float] = Field(..., description="QBER values from recent simulations")


class AttackResult(BaseModel):
    """Response model for attack simulation results"""
    simulation_id: str = Field(..., description="Simulation identifier")
    attack_type: str = Field(..., description="Type of attack simulated")
    attack_detected: bool = Field(..., description="Whether attack was detected")
    qber: float = Field(..., description="Quantum Bit Error Rate")
    final_key_length: int = Field(..., description="Length of final key")
    attack_details: Optional[Dict[str, Any]] = Field(None, description="Detailed attack information")


# Removed deprecated DashboardData model


class SimulationHistory(BaseModel):
    """Response model for simulation history"""
    total_simulations: int = Field(..., description="Total number of simulations")
    simulations: List[Dict[str, Any]] = Field(..., description="List of simulation results")


class SimulatorStatistics(BaseModel):
    """Response model for simulator statistics"""
    total_simulations: int = Field(..., description="Total number of simulations")
    successful_simulations: int = Field(..., description="Number of successful simulations")
    success_rate: float = Field(..., description="Success rate as a fraction")
    average_qber: float = Field(..., description="Average QBER")
    average_final_key_length: float = Field(..., description="Average final key length")
    average_simulation_time: float = Field(..., description="Average simulation time")
    attack_simulations: int = Field(..., description="Number of attack simulations")
    attack_detection_stats: Dict[str, Any] = Field(..., description="Attack detection statistics")


class ErrorResponse(BaseModel):
    """Standard error response model"""
    detail: str = Field(..., description="Error details")
    error_code: Optional[str] = Field(None, description="Optional error code")
    timestamp: Optional[str] = Field(None, description="Error timestamp")


class SuccessResponse(BaseModel):
    """Standard success response model"""
    message: str = Field(..., description="Success message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")
    timestamp: Optional[str] = Field(None, description="Response timestamp")


class ProtocolPhase(BaseModel):
    """Model for protocol phase information"""
    phase_name: str = Field(..., description="Name of the protocol phase")
    phase_order: int = Field(..., description="Order of the phase")
    description: str = Field(..., description="Description of the phase")
    completed: bool = Field(..., description="Whether the phase is completed")


class QuantumState(BaseModel):
    """Model for quantum state representation"""
    alpha: complex = Field(..., description="Alpha coefficient")
    beta: complex = Field(..., description="Beta coefficient")
    basis: str = Field(..., description="Measurement basis")
    normalized: bool = Field(True, description="Whether the state is normalized")


class ChannelParameters(BaseModel):
    """Model for quantum channel parameters"""
    length: float = Field(..., description="Channel length in kilometers")
    attenuation: float = Field(..., description="Attenuation in dB/km")
    depolarization_rate: float = Field(..., description="Depolarization rate")
    transmission_probability: float = Field(..., description="Calculated transmission probability")


class DetectorParameters(BaseModel):
    """Model for detector parameters"""
    efficiency: float = Field(..., description="Detection efficiency")
    dark_count_rate: float = Field(..., description="Dark count rate")
    dead_time: Optional[float] = Field(None, description="Detector dead time")


class PhotonSourceParameters(BaseModel):
    """Model for photon source parameters"""
    efficiency: float = Field(..., description="Emission efficiency")
    repetition_rate: Optional[float] = Field(None, description="Repetition rate")
    wavelength: Optional[float] = Field(None, description="Photon wavelength")
    pulse_duration: Optional[float] = Field(None, description="Pulse duration")


class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    name: str = Field(..., description="User full name")
    picture: Optional[str] = Field(None, description="User profile picture URL")


class UserCreate(UserBase):
    google_id: str = Field(..., description="Google user ID")


class UserResponse(UserBase):
    id: int = Field(..., description="User ID")
    google_id: str = Field(..., description="Google user ID")
    is_active: bool = Field(True, description="Whether user is active")
    created_at: str = Field(..., description="User creation timestamp")
    last_login: Optional[str] = Field(None, description="Last login timestamp")


class GoogleAuthRequest(BaseModel):
    credential: str = Field(..., description="Google OAuth credential token")


class AuthResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")
    expires_in: int = Field(3600, description="Token expiration time in seconds")


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
