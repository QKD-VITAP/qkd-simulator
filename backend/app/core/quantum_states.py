
import numpy as np
from typing import Tuple, List, Optional, Dict
from enum import Enum
import random
import time


class Basis(Enum):
    COMPUTATIONAL = "computational"  # Z-basis: |0>, |1>
    HADAMARD = "hadamard"           # X-basis: |+>, |->


class QubitState:
    
    def __init__(self, alpha: complex, beta: complex):
        norm = np.sqrt(abs(alpha)**2 + abs(beta)**2)
        self.alpha = alpha / norm
        self.beta = beta / norm
    
    @classmethod
    def from_basis_state(cls, basis: Basis, value: int) -> 'QubitState':
        if basis == Basis.COMPUTATIONAL:
            if value == 0:
                return cls(1.0, 0.0)  # |0>
            else:
                return cls(0.0, 1.0)  # |1>
        elif basis == Basis.HADAMARD:
            if value == 0:
                return cls(1/np.sqrt(2), 1/np.sqrt(2))  # |+>
            else:
                return cls(1/np.sqrt(2), -1/np.sqrt(2))  # |->
        else:
            raise ValueError(f"Unknown basis: {basis}")
    
    def measure(self, basis: Basis) -> Tuple[int, float]:
        """
        Measure qubit in specified basis
        
        Returns:
            Tuple of (measurement result, probability of this result)
        """
        if basis == Basis.COMPUTATIONAL:

            prob_0 = abs(self.alpha)**2
            prob_1 = abs(self.beta)**2
            

            total_prob = prob_0 + prob_1
            prob_0 /= total_prob
            prob_1 /= total_prob
            
            result = 0 if random.random() < prob_0 else 1
            probability = prob_0 if result == 0 else prob_1
            
        elif basis == Basis.HADAMARD:


            plus_amp = (self.alpha + self.beta) / np.sqrt(2)
            minus_amp = (self.alpha - self.beta) / np.sqrt(2)
            
            prob_plus = abs(plus_amp)**2
            prob_minus = abs(minus_amp)**2
            

            total_prob = prob_plus + prob_minus
            prob_plus /= total_prob
            prob_minus /= total_prob
            
            result = 0 if random.random() < prob_plus else 1  # 0 = |+>, 1 = |->
            probability = prob_plus if result == 0 else prob_minus
            
        else:
            raise ValueError(f"Unknown basis: {basis}")
        
        return result, probability
    
    def apply_noise(self, depolarization_rate: float) -> 'QubitState':
        """
        Apply depolarization noise to the qubit
        
        Args:
            depolarization_rate: Probability of depolarization (0 to 1)
            
        Returns:
            New qubit state after noise
        """
        if random.random() < depolarization_rate:

            theta = random.uniform(0, 2 * np.pi)
            phi = random.uniform(0, 2 * np.pi)
            alpha = np.cos(theta/2)
            beta = np.exp(1j * phi) * np.sin(theta/2)
            return QubitState(alpha, beta)
        else:


            if random.random() < 0.15:  # 15% chance of phase error
                phase_error = random.gauss(0, 0.2)  # Larger random phase shift
                new_beta = self.beta * np.exp(1j * phase_error)
                return QubitState(self.alpha, new_beta)
            else:
                return self
    
    def apply_phase_noise(self, phase_noise_std: float) -> 'QubitState':
        """
        Apply phase noise to the qubit
        
        Args:
            phase_noise_std: Standard deviation of phase noise in radians
            
        Returns:
            New qubit state after phase noise
        """
        if phase_noise_std <= 0:
            return self
        

        phase_shift = random.gauss(0, phase_noise_std)
        new_beta = self.beta * np.exp(1j * phase_shift)
        
        return QubitState(self.alpha, new_beta)
    
    def get_bloch_coordinates(self) -> Tuple[float, float, float]:
        """
        Get Bloch sphere coordinates (x, y, z)
        
        Returns:
            Tuple of (x, y, z) coordinates on Bloch sphere
        """




        
        x = 2 * (self.alpha.real * self.beta.real + self.alpha.imag * self.beta.imag)
        y = 2 * (self.alpha.real * self.beta.imag - self.alpha.imag * self.beta.real)
        z = abs(self.alpha)**2 - abs(self.beta)**2
        
        return x, y, z
    
    def __str__(self) -> str:
        return f"|psi> = {self.alpha:.3f}|0> + {self.beta:.3f}|1>"


class PhotonSource:
    
    def __init__(self, 
                 efficiency: float = 0.8, 
                 dark_count_rate: float = 0.001,
                 multi_photon_probability: float = 0.05,
                 timing_jitter: float = 0.1,
                 wavelength_stability: float = 0.99):
        """
        Initialize photon source with realistic parameters
        
        Args:
            efficiency: Probability of successfully emitting a photon
            dark_count_rate: Rate of false photon detections (per pulse)
            multi_photon_probability: Probability of emitting multiple photons
            timing_jitter: Standard deviation of timing jitter (ns)
            wavelength_stability: Stability of emission wavelength
        """
        self.efficiency = efficiency
        self.dark_count_rate = dark_count_rate
        self.multi_photon_probability = multi_photon_probability
        self.timing_jitter = timing_jitter
        self.wavelength_stability = wavelength_stability
        

        self.mean_photons_per_pulse = 3.5
        
    def emit_photon(self, state: QubitState) -> Optional[QubitState]:
        """
        Attempt to emit a photon in the specified state with realistic modeling
        
        Returns:
            QubitState if photon emitted successfully, None otherwise
        """

        if random.random() > self.efficiency:
            return None
        
        photon_count = np.random.poisson(self.mean_photons_per_pulse)
        
        if photon_count == 1:
            return self._apply_source_imperfections(state)
        elif photon_count > 1:
            imperfect_state = self._apply_source_imperfections(state)
            imperfect_state.is_multi_photon = True
            imperfect_state.photon_count = photon_count
            return imperfect_state
        else:
            return None
    
    def _apply_source_imperfections(self, state: QubitState) -> QubitState:

        if random.random() > self.wavelength_stability:
            phase_error = random.gauss(0, 0.1)  # Random phase shift
            new_beta = state.beta * np.exp(1j * phase_error)
            state = QubitState(state.alpha, new_beta)
        

        if self.timing_jitter > 0:
            timing_error = random.gauss(0, self.timing_jitter)
            state.timing_offset = timing_error
        
        return state
    
    def detect_photon(self, state: QubitState) -> Tuple[bool, Dict]:
        """
        Simulate realistic photon detection with dark counts and detector imperfections
        
        Returns:
            Tuple of (detection_success, detection_info)
        """
        detection_info = {
            "dark_count": False,
            "afterpulse": False,
            "timing_jitter": 0.0,
            "detection_efficiency": 1.0
        }
        

        if random.random() < self.dark_count_rate:
            detection_info["dark_count"] = True
            return True, detection_info
        

        if random.random() < 0.01:  # 1% afterpulse probability
            detection_info["afterpulse"] = True
        

        if hasattr(state, 'timing_offset'):
            detection_info["timing_jitter"] = state.timing_offset
        

        detection_efficiency = random.uniform(0.7, 0.95)
        detection_info["detection_efficiency"] = detection_efficiency
        
        if random.random() > detection_efficiency:
            return False, detection_info
        
        return True, detection_info


class QuantumDetector:
    
    def __init__(self,
                 efficiency: float = 0.8,
                 dark_count_rate: float = 100.0,  # counts/s
                 dead_time: float = 0.001,  # microseconds
                 timing_jitter: float = 0.05,  # nanoseconds
                 afterpulse_probability: float = 0.01,
                 crosstalk_probability: float = 0.001):
        """
        Initialize quantum detector with realistic parameters
        
        Args:
            efficiency: Detection efficiency (0-1)
            dark_count_rate: Dark count rate in counts per second
            dead_time: Detector dead time in microseconds
            timing_jitter: Timing jitter standard deviation in nanoseconds
            afterpulse_probability: Probability of afterpulse per detection
            crosstalk_probability: Probability of crosstalk between detectors
        """
        self.efficiency = efficiency
        self.dark_count_rate = dark_count_rate
        self.dead_time = dead_time
        self.timing_jitter = timing_jitter
        self.afterpulse_probability = afterpulse_probability
        self.crosstalk_probability = crosstalk_probability
        

        self.last_detection_time = 0
        self.detection_history = []
        self.is_dead = False
        self.dead_until = 0
        
    def detect_photon(self, 
                     qubit: QubitState, 
                     basis: Basis,
                     current_time: float = None) -> Tuple[bool, Dict]:
        """
        Detect photon with realistic detector imperfections
        
        Args:
            qubit: Quantum state to detect
            basis: Measurement basis
            current_time: Current simulation time
            
        Returns:
            Tuple of (detection_success, detection_info)
        """
        if current_time is None:
            current_time = time.time()
        
        detection_info = {
            "detection_time": current_time,
            "basis": basis.value,
            "dark_count": False,
            "afterpulse": False,
            "crosstalk": False,
            "dead_time_effect": False,
            "timing_jitter": 0.0,
            "detection_efficiency": self.efficiency
        }
        

        if self.is_dead and current_time < self.dead_until:
            detection_info["dead_time_effect"] = True
            return False, detection_info
        

        if random.random() < self.dark_count_rate * 1e-6:  # Convert to per-microsecond
            detection_info["dark_count"] = True
            self._record_detection(current_time)
            return True, detection_info
        

        if random.random() < self.crosstalk_probability:
            detection_info["crosstalk"] = True
            self._record_detection(current_time)
            return True, detection_info
        

        if (self.detection_history and 
            random.random() < self.afterpulse_probability):
            detection_info["afterpulse"] = True
            self._record_detection(current_time)
            return True, detection_info
        

        if qubit is not None:

            if random.random() < self.efficiency:

                timing_error = random.gauss(0, self.timing_jitter)
                detection_info["timing_jitter"] = timing_error
                

                self._record_detection(current_time)
                return True, detection_info
        
        return False, detection_info
    
    def _record_detection(self, current_time: float):
        self.last_detection_time = current_time
        self.detection_history.append(current_time)
        

        self.is_dead = True
        self.dead_until = current_time + self.dead_time * 1e-6  # Convert to seconds
        

        if len(self.detection_history) > 1000:
            self.detection_history = self.detection_history[-500:]
    
    def get_detector_statistics(self) -> Dict:
        current_time = time.time()
        

        recent_detections = [
            t for t in self.detection_history 
            if current_time - t < 1.0  # Last second
        ]
        
        return {
            "efficiency": self.efficiency,
            "dark_count_rate": self.dark_count_rate,
            "dead_time": self.dead_time,
            "timing_jitter": self.timing_jitter,
            "afterpulse_probability": self.afterpulse_probability,
            "crosstalk_probability": self.crosstalk_probability,
            "is_dead": self.is_dead,
            "dead_until": self.dead_until,
            "total_detections": len(self.detection_history),
            "recent_detection_rate": len(recent_detections),
            "last_detection_time": self.last_detection_time
        }


class QuantumChannel:
    
    def __init__(self, 
                 attenuation: float = 0.1,  # dB/km
                 depolarization_rate: float = 0.01,
                 length: float = 10.0,  # km
                 chromatic_dispersion: float = 17.0,  # ps/(nm·km)
                 polarization_mode_dispersion: float = 0.1,  # ps/km^0.5
                 nonlinear_coefficient: float = 2.6e-20,  # m^2/W
                 temperature: float = 20.0,  # Celsius
                 wavelength: float = 1550.0):  # nm
        """
        Initialize quantum channel with comprehensive physical modeling
        
        Args:
            attenuation: Channel attenuation in dB/km
            depolarization_rate: Probability of qubit depolarization
            length: Channel length in kilometers
            chromatic_dispersion: Chromatic dispersion coefficient
            polarization_mode_dispersion: PMD coefficient
            nonlinear_coefficient: Nonlinear Kerr coefficient
            temperature: Operating temperature
            wavelength: Operating wavelength
        """
        self.attenuation = attenuation
        self.depolarization_rate = depolarization_rate
        self.length = length
        self.chromatic_dispersion = chromatic_dispersion
        self.polarization_mode_dispersion = polarization_mode_dispersion
        self.nonlinear_coefficient = nonlinear_coefficient
        self.temperature = temperature
        self.wavelength = wavelength
        

        self.temp_corrected_attenuation = self._calculate_temperature_correction()
        
    def transmit_qubit(self, qubit: QubitState) -> Optional[QubitState]:
        """
        Transmit qubit through the channel with realistic physical effects
        
        Returns:
            Transmitted qubit state or None if lost
        """

        transmission_prob = 10**(-self.temp_corrected_attenuation * self.length / 10)
        

        if self.temp_corrected_attenuation * self.length > 30:  # Very high loss
            transmission_prob = max(0.01, transmission_prob)  # Minimum 1% survival
        elif self.temp_corrected_attenuation * self.length > 20:  # High loss
            transmission_prob = max(0.05, transmission_prob)  # Minimum 5% survival
        elif self.temp_corrected_attenuation * self.length > 10:  # Medium loss
            transmission_prob = max(0.1, transmission_prob)  # Minimum 10% survival
        
        if random.random() < transmission_prob:

            transmitted_qubit = self._apply_channel_effects(qubit)
            return transmitted_qubit
        else:

            return None
    
    def _apply_channel_effects(self, qubit: QubitState) -> QubitState:

        qubit = qubit.apply_noise(self.depolarization_rate)
        

        if self.chromatic_dispersion > 0:
            dispersion_delay = self.chromatic_dispersion * self.length * 1e-12  # Convert to seconds
            timing_jitter = random.gauss(0, dispersion_delay * 0.1)
            if hasattr(qubit, 'timing_offset'):
                qubit.timing_offset += timing_jitter
            else:
                qubit.timing_offset = timing_jitter
        

        if self.polarization_mode_dispersion > 0:
            pmd_delay = self.polarization_mode_dispersion * np.sqrt(self.length) * 1e-12
            if random.random() < 0.1:  # 10% chance of PMD-induced error

                rotation_angle = random.gauss(0, pmd_delay * 1e9)  # Convert to radians
                cos_angle = np.cos(rotation_angle)
                sin_angle = np.sin(rotation_angle)
                

                new_alpha = qubit.alpha * cos_angle - qubit.beta * sin_angle
                new_beta = qubit.alpha * sin_angle + qubit.beta * cos_angle
                qubit = QubitState(new_alpha, new_beta)
        

        if self.nonlinear_coefficient > 0 and random.random() < 0.05:  # 5% chance

            phase_shift = random.gauss(0, 0.05)  # Small random phase shift
            new_beta = qubit.beta * np.exp(1j * phase_shift)
            qubit = QubitState(qubit.alpha, new_beta)
        

        qubit = self._apply_wavelength_effects(qubit)
        
        return qubit
    
    def _apply_wavelength_effects(self, qubit: QubitState) -> QubitState:

        if abs(self.wavelength - 1550) > 10:  # Not at optimal wavelength
            wavelength_factor = 1 + abs(self.wavelength - 1550) / 100
            if random.random() < (wavelength_factor - 1) * 0.1:

                phase_noise = random.gauss(0, 0.02)
                new_beta = qubit.beta * np.exp(1j * phase_noise)
                qubit = QubitState(qubit.alpha, new_beta)
        
        return qubit
    
    def _calculate_temperature_correction(self) -> float:

        temp_coefficient = 0.001  # 0.1% per degree Celsius
        temp_correction = 1 + temp_coefficient * (self.temperature - 20)
        return self.attenuation * temp_correction
    
    def get_channel_statistics(self) -> Dict:
        transmission_prob = 10**(-self.temp_corrected_attenuation * self.length / 10)
        

        if self.temp_corrected_attenuation * self.length > 30:
            transmission_prob = max(0.01, transmission_prob)
        elif self.temp_corrected_attenuation * self.length > 20:
            transmission_prob = max(0.05, transmission_prob)
        elif self.temp_corrected_attenuation * self.length > 10:
            transmission_prob = max(0.1, transmission_prob)
        

        total_chromatic_dispersion = self.chromatic_dispersion * self.length
        total_pmd = self.polarization_mode_dispersion * np.sqrt(self.length)
        

        if transmission_prob > 0.8 and total_chromatic_dispersion < 50:
            quality = "excellent"
        elif transmission_prob > 0.5 and total_chromatic_dispersion < 100:
            quality = "good"
        elif transmission_prob > 0.2:
            quality = "fair"
        else:
            quality = "poor"
        
        return {
            "attenuation": self.attenuation,
            "temp_corrected_attenuation": self.temp_corrected_attenuation,
            "length": self.length,
            "depolarization_rate": self.depolarization_rate,
            "transmission_probability": transmission_prob,
            "total_loss_db": self.temp_corrected_attenuation * self.length,
            "chromatic_dispersion": total_chromatic_dispersion,
            "polarization_mode_dispersion": total_pmd,
            "temperature": self.temperature,
            "wavelength": self.wavelength,
            "channel_quality": quality,
            "nonlinear_effects": self.nonlinear_coefficient > 0
        }


def create_bb84_states(num_qubits: int) -> Tuple[List[QubitState], List[Basis], List[int]]:
    """
    Create random BB84 states for key generation
    
    Args:
        num_qubits: Number of qubits to generate
        
    Returns:
        Tuple of (qubit states, measurement bases, bit values)
    """
    states = []
    bases = []
    values = []
    
    for _ in range(num_qubits):

        basis = random.choice([Basis.COMPUTATIONAL, Basis.HADAMARD])
        value = random.randint(0, 1)
        

        qubit = QubitState.from_basis_state(basis, value)
        
        states.append(qubit)
        bases.append(basis)
        values.append(value)
    
    return states, bases, values


def calculate_qber(sifted_key_sender: List[int], sifted_key_receiver: List[int]) -> float:
    """
    Calculate Quantum Bit Error Rate (QBER)
    
    Args:
        sifted_key_sender: Sender's sifted key bits
        sifted_key_receiver: Receiver's sifted key bits
        
    Returns:
        QBER as a fraction (0 to 1)
    """
    if len(sifted_key_sender) != len(sifted_key_receiver):
        raise ValueError("Key lengths must match")
    
    if len(sifted_key_sender) == 0:
        return 0.0
    
    errors = sum(1 for s, r in zip(sifted_key_sender, sifted_key_receiver) if s != r)
    return errors / len(sifted_key_sender)
