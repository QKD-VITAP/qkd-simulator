
import random
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import math


class DecoyStateType(Enum):
    SIGNAL = "signal"      # High intensity for key generation
    DECOY = "decoy"        # Medium intensity for parameter estimation
    VACUUM = "vacuum"      # Zero intensity for background estimation


@dataclass
class DecoyStateParameters:
    """Parameters for decoy-state protocol"""
    signal_intensity: float = 0.5      # Signal state intensity (photons per pulse)
    decoy_intensity: float = 0.1      # Decoy state intensity
    vacuum_intensity: float = 0.0     # Vacuum state intensity
    signal_probability: float = 0.7   # Probability of sending signal state
    decoy_probability: float = 0.2    # Probability of sending decoy state
    vacuum_probability: float = 0.1   # Probability of sending vacuum state


@dataclass
class DecoyStateResult:
    """Results from decoy-state analysis"""
    estimated_single_photon_yield: float
    estimated_single_photon_error_rate: float
    estimated_single_photon_gain: float
    estimated_multi_photon_gain: float
    security_parameter: float
    final_key_rate: float
    decoy_state_analysis_success: bool


class DecoyStateProtocol:
    """Implementation of decoy-state protocol for PNS attack mitigation"""
    
    def __init__(self, 
                 parameters: DecoyStateParameters = None,
                 detector_efficiency: float = 0.1,
                 dark_count_rate: float = 1e-6):
        """
        Initialize decoy-state protocol
        
        Args:
            parameters: Decoy state parameters
            detector_efficiency: Detector efficiency
            dark_count_rate: Dark count rate per detector
        """
        if parameters is None:
            parameters = DecoyStateParameters()
        
        self.parameters = parameters
        self.detector_efficiency = detector_efficiency
        self.dark_count_rate = dark_count_rate
        

        total_prob = (parameters.signal_probability + 
                     parameters.decoy_probability + 
                     parameters.vacuum_probability)
        if abs(total_prob - 1.0) > 1e-6:
            raise ValueError("Decoy state probabilities must sum to 1.0")
    
    def generate_decoy_sequence(self, num_pulses: int) -> List[DecoyStateType]:
        """
        Generate sequence of decoy states
        
        Args:
            num_pulses: Number of pulses to generate
            
        Returns:
            List of decoy state types
        """
        states = []
        for _ in range(num_pulses):
            rand = random.random()
            if rand < self.parameters.signal_probability:
                states.append(DecoyStateType.SIGNAL)
            elif rand < self.parameters.signal_probability + self.parameters.decoy_probability:
                states.append(DecoyStateType.DECOY)
            else:
                states.append(DecoyStateType.VACUUM)
        
        return states
    
    def simulate_photon_number_distribution(self, 
                                          state_type: DecoyStateType,
                                          num_pulses: int = 1000) -> Dict[int, int]:
        """
        Simulate photon number distribution for given state type
        
        Args:
            state_type: Type of decoy state
            num_pulses: Number of pulses to simulate
            
        Returns:
            Dictionary mapping photon numbers to counts
        """
        if state_type == DecoyStateType.VACUUM:
            return {0: num_pulses}
        

        if state_type == DecoyStateType.SIGNAL:
            intensity = self.parameters.signal_intensity
        elif state_type == DecoyStateType.DECOY:
            intensity = self.parameters.decoy_intensity
        else:
            intensity = 0.0
        

        photon_counts = np.random.poisson(intensity, num_pulses)
        

        distribution = {}
        for count in photon_counts:
            distribution[count] = distribution.get(count, 0) + 1
        
        return distribution
    
    def calculate_gain_and_error_rates(self, 
                                     state_type: DecoyStateType,
                                     num_pulses: int = 10000) -> Tuple[float, float]:
        """
        Calculate gain and error rates for a given state type
        
        Args:
            state_type: Type of decoy state
            num_pulses: Number of pulses to simulate
            
        Returns:
            Tuple of (gain_rate, error_rate)
        """

        photon_dist = self.simulate_photon_number_distribution(state_type, num_pulses)
        

        total_detections = 0
        total_errors = 0
        
        for photon_count, count in photon_dist.items():
            if photon_count == 0:

                detection_prob = self.dark_count_rate
                error_prob = 0.5  # Random bit for dark count
            else:

                detection_prob = 1 - (1 - self.detector_efficiency) ** photon_count
                error_prob = 0.5  # Simplified error model
            
            total_detections += count * detection_prob
            total_errors += count * detection_prob * error_prob
        
        gain_rate = total_detections / num_pulses
        error_rate = total_errors / max(total_detections, 1)
        
        return gain_rate, error_rate
    
    def estimate_single_photon_parameters(self, 
                                        signal_gain: float,
                                        signal_error: float,
                                        decoy_gain: float,
                                        decoy_error: float,
                                        vacuum_gain: float,
                                        vacuum_error: float) -> DecoyStateResult:
        """
        Estimate single-photon parameters using decoy-state analysis
        
        Args:
            signal_gain: Gain rate for signal states
            signal_error: Error rate for signal states
            decoy_gain: Gain rate for decoy states
            decoy_error: Error rate for decoy states
            vacuum_gain: Gain rate for vacuum states
            vacuum_error: Error rate for vacuum states
            
        Returns:
            DecoyStateResult with estimated parameters
        """
        try:

            Y0 = vacuum_gain  # Vacuum yield
            



            
            μ_signal = self.parameters.signal_intensity
            μ_decoy = self.parameters.decoy_intensity
            


            
            if abs(μ_signal - μ_decoy) < 1e-6:

                return DecoyStateResult(
                    estimated_single_photon_yield=0.0,
                    estimated_single_photon_error_rate=0.0,
                    estimated_single_photon_gain=0.0,
                    estimated_multi_photon_gain=0.0,
                    security_parameter=0.0,
                    final_key_rate=0.0,
                    decoy_state_analysis_success=False
                )
            

            Y1 = (decoy_gain - vacuum_gain) / μ_decoy
            

            if decoy_gain > vacuum_gain:
                e1 = (decoy_error * decoy_gain - vacuum_error * vacuum_gain) / (decoy_gain - vacuum_gain)
            else:
                e1 = 0.5  # Default error rate
            

            single_photon_gain = Y1 * μ_signal
            

            multi_photon_gain = signal_gain - vacuum_gain - single_photon_gain
            multi_photon_gain = max(0, multi_photon_gain)
            

            security_parameter = self._calculate_security_parameter(
                single_photon_gain, multi_photon_gain, signal_gain
            )
            

            final_key_rate = self._calculate_final_key_rate(
                single_photon_gain, e1, multi_photon_gain, signal_gain
            )
            
            return DecoyStateResult(
                estimated_single_photon_yield=Y1,
                estimated_single_photon_error_rate=e1,
                estimated_single_photon_gain=single_photon_gain,
                estimated_multi_photon_gain=multi_photon_gain,
                security_parameter=security_parameter,
                final_key_rate=final_key_rate,
                decoy_state_analysis_success=True
            )
            
        except Exception as e:

            return DecoyStateResult(
                estimated_single_photon_yield=0.0,
                estimated_single_photon_error_rate=0.0,
                estimated_single_photon_gain=0.0,
                estimated_multi_photon_gain=0.0,
                security_parameter=0.0,
                final_key_rate=0.0,
                decoy_state_analysis_success=False
            )
    
    def _calculate_security_parameter(self, 
                                    single_photon_gain: float,
                                    multi_photon_gain: float,
                                    total_gain: float) -> float:
        """Calculate security parameter based on photon number distribution"""
        if total_gain <= 0:
            return 0.0
        

        security = single_photon_gain / total_gain
        

        if multi_photon_gain > 0:
            security *= (1 - multi_photon_gain / total_gain)
        
        return max(0.0, min(1.0, security))
    
    def run_decoy_state_simulation(self) -> Dict:
        """
        Run decoy-state simulation and return results
        
        Returns:
            Dictionary with simulation results
        """
        try:

            signal_gain, signal_error = self.calculate_gain_and_error_rates(
                DecoyStateType.SIGNAL, 1000
            )
            decoy_gain, decoy_error = self.calculate_gain_and_error_rates(
                DecoyStateType.DECOY, 1000
            )
            vacuum_gain, vacuum_error = self.calculate_gain_and_error_rates(
                DecoyStateType.VACUUM, 1000
            )
            

            decoy_analysis = self.estimate_single_photon_parameters(
                signal_gain, signal_error,
                decoy_gain, decoy_error,
                vacuum_gain, vacuum_error
            )
            

            security_improvement = self._calculate_security_improvement(decoy_analysis)
            
            return {
                "signal_results": {"gain": signal_gain, "error": signal_error},
                "decoy_results": {"gain": decoy_gain, "error": decoy_error},
                "vacuum_results": {"gain": vacuum_gain, "error": vacuum_error},
                "decoy_analysis": decoy_analysis.__dict__,
                "final_key_rate": decoy_analysis.final_key_rate,
                "security_improvement": security_improvement
            }
            
        except Exception as e:
            return {
                "error": f"Decoy-state simulation failed: {e}",
                "decoy_analysis": {"decoy_state_analysis_success": False},
                "final_key_rate": 0.0,
                "security_improvement": {"improvement": 0.0, "description": "Simulation failed"}
            }
    
    def _calculate_security_improvement(self, decoy_analysis) -> Dict:
        """Calculate security improvement compared to standard BB84"""
        if not hasattr(decoy_analysis, 'decoy_state_analysis_success') or not decoy_analysis.decoy_state_analysis_success:
            return {"improvement": 0.0, "description": "Analysis failed"}
        

        single_photon_ratio = decoy_analysis.estimated_single_photon_gain / max(
            decoy_analysis.estimated_single_photon_gain + decoy_analysis.estimated_multi_photon_gain, 1
        )
        
        improvement = single_photon_ratio - 0.5  # Baseline improvement
        
        if improvement > 0.3:
            description = "High security improvement - PNS attacks effectively mitigated"
        elif improvement > 0.1:
            description = "Moderate security improvement - PNS attacks partially mitigated"
        else:
            description = "Low security improvement - PNS attacks still possible"
        
        return {
            "improvement": max(0.0, improvement),
            "description": description,
            "single_photon_ratio": single_photon_ratio,
            "pns_attack_mitigation": "Effective" if improvement > 0.2 else "Partial"
        }
    
    def _calculate_final_key_rate(self, 
                                 single_photon_gain: float,
                                 single_photon_error: float,
                                 multi_photon_gain: float,
                                 total_gain: float) -> float:
        """Calculate final key rate using GLLP formula"""
        if total_gain <= 0:
            return 0.0
        


        

        def H2(p):
            if p <= 0 or p >= 1:
                return 0
            return -p * math.log2(p) - (1 - p) * math.log2(1 - p)
        

        if single_photon_gain > 0:
            error_rate = single_photon_error
        else:
            error_rate = 0.5
        

        f = 1.1
        

        if single_photon_gain > 0:
            key_rate = single_photon_gain * (1 - H2(error_rate) - f * H2(error_rate))
        else:
            key_rate = 0.0
        
        return max(0.0, key_rate)


class DecoyStateBB84:
    """BB84 protocol with decoy-state implementation"""
    
    def __init__(self, 
                 decoy_parameters: DecoyStateParameters = None,
                 num_pulses: int = 10000):
        """
        Initialize decoy-state BB84 protocol
        
        Args:
            decoy_parameters: Decoy state parameters
            num_pulses: Number of pulses to generate
        """
        self.decoy_protocol = DecoyStateProtocol(decoy_parameters)
        self.num_pulses = num_pulses
        self.decoy_sequence = []
        self.measurement_results = {}
        self.final_key = []
        
    def generate_decoy_sequence(self) -> List[DecoyStateType]:
        """Generate sequence of decoy states"""
        self.decoy_sequence = self.decoy_protocol.generate_decoy_sequence(self.num_pulses)
        return self.decoy_sequence
    
    def simulate_measurements(self, channel_efficiency: float = 0.1) -> Dict:
        """Simulate measurements for all decoy states"""
        self.measurement_results = {
            DecoyStateType.SIGNAL: {"detections": [], "errors": []},
            DecoyStateType.DECOY: {"detections": [], "errors": []},
            DecoyStateType.VACUUM: {"detections": [], "errors": []}
        }
        
        for i, state_type in enumerate(self.decoy_sequence):

            if random.random() < channel_efficiency:

                self.measurement_results[state_type]["detections"].append(i)
                

                if random.random() < 0.02:  # 2% error rate
                    self.measurement_results[state_type]["errors"].append(i)
        
        return self.measurement_results
    
    def analyze_decoy_states(self) -> DecoyStateResult:
        """Analyze decoy states to estimate single-photon parameters"""

        signal_gain = len(self.measurement_results[DecoyStateType.SIGNAL]["detections"]) / self.num_pulses
        signal_error = len(self.measurement_results[DecoyStateType.SIGNAL]["errors"]) / max(
            len(self.measurement_results[DecoyStateType.SIGNAL]["detections"]), 1
        )
        
        decoy_gain = len(self.measurement_results[DecoyStateType.DECOY]["detections"]) / self.num_pulses
        decoy_error = len(self.measurement_results[DecoyStateType.DECOY]["errors"]) / max(
            len(self.measurement_results[DecoyStateType.DECOY]["detections"]), 1
        )
        
        vacuum_gain = len(self.measurement_results[DecoyStateType.VACUUM]["detections"]) / self.num_pulses
        vacuum_error = len(self.measurement_results[DecoyStateType.VACUUM]["errors"]) / max(
            len(self.measurement_results[DecoyStateType.VACUUM]["detections"]), 1
        )
        

        return self.decoy_protocol.estimate_single_photon_parameters(
            signal_gain, signal_error,
            decoy_gain, decoy_error,
            vacuum_gain, vacuum_error
        )
    
    def generate_final_key(self, analysis_result: DecoyStateResult) -> List[int]:
        """Generate final key based on decoy-state analysis"""
        if not analysis_result.decoy_state_analysis_success:
            return []
        

        single_photon_bits = int(analysis_result.estimated_single_photon_gain * self.num_pulses)
        

        self.final_key = [random.randint(0, 1) for _ in range(single_photon_bits)]
        
        return self.final_key
    
    def get_protocol_statistics(self) -> Dict:
        """Get comprehensive protocol statistics"""
        if not self.measurement_results:
            return {"error": "No measurements performed"}
        
        stats = {
            "total_pulses": self.num_pulses,
            "decoy_sequence_length": len(self.decoy_sequence),
            "measurement_results": {
                state_type.value: {
                    "detections": len(results["detections"]),
                    "errors": len(results["errors"]),
                    "gain": len(results["detections"]) / self.num_pulses,
                    "error_rate": len(results["errors"]) / max(len(results["detections"]), 1)
                }
                for state_type, results in self.measurement_results.items()
            },
            "final_key_length": len(self.final_key)
        }
        
        return stats


class DecoyStateOptimization:
    """Optimize decoy-state parameters for maximum key rate"""
    
    def __init__(self, 
                 target_distance: float = 50.0,  # km
                 channel_loss: float = 0.2):     # dB/km
        """
        Initialize decoy-state optimization
        
        Args:
            target_distance: Target transmission distance
            channel_loss: Channel loss per kilometer
        """
        self.target_distance = target_distance
        self.channel_loss = channel_loss
        
    def optimize_parameters(self, 
                           min_intensity: float = 0.01,
                           max_intensity: float = 1.0,
                           num_samples: int = 20) -> Dict:
        """
        Optimize decoy-state parameters for maximum key rate
        
        Args:
            min_intensity: Minimum signal intensity to test
            max_intensity: Maximum signal intensity to test
            num_samples: Number of intensity values to test
            
        Returns:
            Dictionary with optimization results
        """

        transmission = 10 ** (-self.channel_loss * self.target_distance / 10)
        

        best_key_rate = 0.0
        best_parameters = None
        optimization_results = []
        
        signal_intensities = np.linspace(min_intensity, max_intensity, num_samples)
        decoy_intensities = np.linspace(0.01, max_intensity * 0.5, num_samples)
        
        for μ_signal in signal_intensities:
            for μ_decoy in decoy_intensities:
                if μ_decoy >= μ_signal:
                    continue
                

                parameters = DecoyStateParameters(
                    signal_intensity=μ_signal,
                    decoy_intensity=μ_decoy,
                    vacuum_intensity=0.0,
                    signal_probability=0.7,
                    decoy_probability=0.2,
                    vacuum_probability=0.1
                )
                

                decoy_protocol = DecoyStateProtocol(parameters)
                signal_gain, signal_error = decoy_protocol.calculate_gain_and_error_rates(
                    DecoyStateType.SIGNAL, 1000
                )
                decoy_gain, decoy_error = decoy_protocol.calculate_gain_and_error_rates(
                    DecoyStateType.DECOY, 1000
                )
                vacuum_gain, vacuum_error = decoy_protocol.calculate_gain_and_error_rates(
                    DecoyStateType.VACUUM, 1000
                )
                

                analysis = decoy_protocol.estimate_single_photon_parameters(
                    signal_gain, signal_error,
                    decoy_gain, decoy_error,
                    vacuum_gain, vacuum_error
                )
                
                key_rate = analysis.final_key_rate
                

                result = {
                    "signal_intensity": μ_signal,
                    "decoy_intensity": μ_decoy,
                    "key_rate": key_rate,
                    "security_parameter": analysis.security_parameter,
                    "single_photon_yield": analysis.estimated_single_photon_yield
                }
                optimization_results.append(result)
                

                if key_rate > best_key_rate:
                    best_key_rate = key_rate
                    best_parameters = parameters
        
        return {
            "best_parameters": best_parameters.__dict__ if best_parameters else None,
            "best_key_rate": best_key_rate,
            "optimization_results": optimization_results,
            "target_distance": self.target_distance,
            "channel_transmission": transmission
        }






def create_decoy_state_protocol(parameters: DecoyStateParameters = None) -> DecoyStateProtocol:
    """Create decoy-state protocol instance"""
    return DecoyStateProtocol(parameters)
