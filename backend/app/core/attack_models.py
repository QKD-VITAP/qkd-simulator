
import random
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

from .quantum_states import QubitState, Basis, QuantumChannel


class AttackType(Enum):
    INTERCEPT_RESEND = "intercept_resend"
    PHOTON_NUMBER_SPLITTING = "photon_number_splitting"
    DETECTOR_BLINDING = "detector_blinding"
    NO_ATTACK = "no_attack"


@dataclass
class AttackResult:
    """Results from attack simulation"""
    attack_type: AttackType
    success: bool
    detected: bool
    eavesdropped_bits: List[int]
    introduced_errors: int
    attack_visibility: float
    attack_details: Dict


class Eavesdropper:
    """Base class for eavesdropper implementations"""
    
    def __init__(self, name: str = "Eve"):
        self.name = name
        self.eavesdropped_bits = []
        self.attack_history = []
    
    def intercept_qubit(self, qubit: QubitState) -> QubitState:
        """
        Intercept and measure a qubit
        
        Args:
            qubit: The qubit to intercept
            
        Returns:
            The intercepted qubit (may be modified)
        """
        raise NotImplementedError("Subclasses must implement intercept_qubit")
    
    def get_attack_statistics(self) -> Dict:
        """Get statistics about the eavesdropper's activities"""
        return {
            "name": self.name,
            "total_qubits_intercepted": len(self.eavesdropped_bits),
            "attack_history": self.attack_history
        }


class InterceptResendEavesdropper(Eavesdropper):
    """Implements Intercept-Resend attack strategy"""
    
    def __init__(self, 
                 name: str = "Eve",
                 measurement_error: float = 0.1,
                 resend_error: float = 0.05):
        """
        Initialize Intercept-Resend eavesdropper
        
        Args:
            name: Eavesdropper name
            measurement_error: Probability of measurement error
            resend_error: Probability of resend error
        """
        super().__init__(name)
        self.measurement_error = measurement_error
        self.resend_error = resend_error
    
    def intercept_qubit(self, qubit: QubitState) -> QubitState:
        """
        Intercept qubit, measure it, and resend
        
        Args:
            qubit: The qubit to intercept
            
        Returns:
            The resent qubit (may have errors)
        """

        basis = random.choice([Basis.COMPUTATIONAL, Basis.HADAMARD])
        

        measured_bit, _ = qubit.measure(basis)
        self.eavesdropped_bits.append(measured_bit)
        

        self.attack_history.append({
            "attack_type": AttackType.INTERCEPT_RESEND.value,
            "basis_used": basis.value,
            "bit_measured": measured_bit
        })
        

        if random.random() < self.resend_error:

            measured_bit = 1 - measured_bit
        

        resent_qubit = QubitState.from_basis_state(basis, measured_bit)
        
        return resent_qubit


class PhotonNumberSplittingEavesdropper(Eavesdropper):
    """Implements Photon-Number Splitting attack strategy"""
    
    def __init__(self, 
                 name: str = "Eve",
                 splitting_efficiency: float = 0.8,
                 multi_photon_threshold: int = 2):
        """
        Initialize PNS eavesdropper
        
        Args:
            name: Eavesdropper name
            splitting_efficiency: Efficiency of photon splitting
            multi_photon_threshold: Minimum photons for successful attack
        """
        super().__init__(name)
        self.splitting_efficiency = splitting_efficiency
        self.multi_photon_threshold = multi_photon_threshold
        self.successful_splits = 0
        self.failed_splits = 0
    
    def intercept_qubit(self, qubit: QubitState, photon_count: int = 1) -> QubitState:
        """
        Intercept qubit and attempt PNS attack
        
        Args:
            qubit: The qubit to intercept
            photon_count: Number of photons in the pulse
            
        Returns:
            The intercepted qubit (may be modified)
        """
        if photon_count >= self.multi_photon_threshold:

            if random.random() < self.splitting_efficiency:

                self.successful_splits += 1
                

                basis = random.choice([Basis.COMPUTATIONAL, Basis.HADAMARD])
                measured_bit, _ = qubit.measure(basis)
                self.eavesdropped_bits.append(measured_bit)
                
                self.attack_history.append({
                    "attack_type": AttackType.PHOTON_NUMBER_SPLITTING.value,
                    "photon_count": photon_count,
                    "basis_used": basis.value,
                    "bit_measured": measured_bit,
                    "success": True
                })
                

                return QubitState.from_basis_state(basis, measured_bit)
            else:

                self.failed_splits += 1
                self.attack_history.append({
                    "attack_type": AttackType.PHOTON_NUMBER_SPLITTING.value,
                    "photon_count": photon_count,
                    "success": False
                })
        

        basis = random.choice([Basis.COMPUTATIONAL, Basis.HADAMARD])
        measured_bit, _ = qubit.measure(basis)
        self.eavesdropped_bits.append(measured_bit)
        
        self.attack_history.append({
            "attack_type": AttackType.INTERCEPT_RESEND.value,
            "basis_used": basis.value,
            "bit_measured": measured_bit
        })
        
        return QubitState.from_basis_state(basis, measured_bit)
    
    def get_attack_statistics(self) -> Dict:
        """Get PNS attack statistics"""
        stats = super().get_attack_statistics()
        stats.update({
            "successful_splits": self.successful_splits,
            "failed_splits": self.failed_splits,
            "pns_success_rate": (self.successful_splits / 
                                max(1, self.successful_splits + self.failed_splits))
        })
        return stats


class DetectorBlindingEavesdropper(Eavesdropper):
    """Implements Detector Blinding attack strategy"""
    
    def __init__(self, 
                 name: str = "Eve",
                 blinding_efficiency: float = 0.9,
                 blinding_power: float = 0.8,
                 detector_control: float = 0.7):
        """
        Initialize Detector Blinding eavesdropper
        
        Args:
            name: Eavesdropper name
            blinding_efficiency: Efficiency of detector blinding
            blinding_power: Power of blinding signal
            detector_control: Level of control over detector response
        """
        super().__init__(name)
        self.blinding_efficiency = blinding_efficiency
        self.blinding_power = blinding_power
        self.detector_control = detector_control
        self.blinding_attempts = 0
        self.successful_blinds = 0
        self.detector_states = {}  # Track detector states
        
    def intercept_qubit(self, qubit: QubitState, detector_id: str = "detector_1") -> QubitState:
        """
        Intercept qubit and attempt detector blinding
        
        Args:
            qubit: The qubit to intercept
            detector_id: Identifier for the target detector
            
        Returns:
            The intercepted qubit (may be modified)
        """

        if random.random() < self.blinding_efficiency:
            self.successful_blinds += 1
            

            detector_analysis = self._analyze_detector(detector_id)
            

            if random.random() < self.detector_control:

                controlled_response = self._control_detector_response(detector_id, detector_analysis)
                
                if controlled_response is not None:

                    forced_bit = controlled_response
                    self.eavesdropped_bits.append(forced_bit)
                    
                    self.attack_history.append({
                        "attack_type": AttackType.DETECTOR_BLINDING.value,
                        "detector_id": detector_id,
                        "blinding_power": self.blinding_power,
                        "detector_control": self.detector_control,
                        "forced_bit": forced_bit,
                        "success": True,
                        "control_method": "full_control"
                    })
                    

                    basis = Basis.COMPUTATIONAL  # Use computational basis for simplicity
                    return QubitState.from_basis_state(basis, forced_bit)
            

            self._influence_detector(detector_id, detector_analysis)
            
            self.attack_history.append({
                "attack_type": AttackType.DETECTOR_BLINDING.value,
                "detector_id": detector_id,
                "blinding_power": self.blinding_power,
                "detector_control": self.detector_control,
                "success": True,
                "control_method": "partial_control"
            })
        
        self.blinding_attempts += 1
        

        basis = random.choice([Basis.COMPUTATIONAL, Basis.HADAMARD])
        measured_bit, _ = qubit.measure(basis)
        self.eavesdropped_bits.append(measured_bit)
        
        self.attack_history.append({
            "attack_type": AttackType.INTERCEPT_RESEND.value,
            "basis_used": basis.value,
            "bit_measured": measured_bit,
            "blinding_failed": True
        })
        
        return QubitState.from_basis_state(basis, measured_bit)
    
    def _analyze_detector(self, detector_id: str) -> Dict:
        """Analyze detector characteristics for blinding"""
        if detector_id not in self.detector_states:

            self.detector_states[detector_id] = {
                "bias_voltage": random.uniform(0.8, 1.2),  # Normalized bias
                "temperature": random.uniform(20, 80),      # Celsius
                "dark_count_rate": random.uniform(1, 1000), # counts/s
                "dead_time": random.uniform(0.001, 1.0),   # microseconds
                "efficiency": random.uniform(0.1, 0.9),    # Detection efficiency
                "blinding_susceptibility": random.uniform(0.1, 0.9)
            }
        
        return self.detector_states[detector_id]
    
    def _control_detector_response(self, detector_id: str, detector_analysis: Dict) -> Optional[int]:
        """Attempt to fully control detector response"""
        detector = self.detector_states[detector_id]
        

        if detector["blinding_susceptibility"] > 0.7:

            if random.random() < self.blinding_power:

                return random.randint(0, 1)
        
        return None
    
    def _influence_detector(self, detector_id: str, detector_analysis: Dict):
        """Influence detector behavior without full control"""
        detector = self.detector_states[detector_id]
        

        if random.random() < self.blinding_power * 0.5:

            detector["efficiency"] *= random.uniform(0.5, 0.9)
            

            detector["dark_count_rate"] *= random.uniform(1.2, 2.0)
            

            detector["dead_time"] *= random.uniform(0.8, 1.5)
    
    def get_attack_statistics(self) -> Dict:
        """Get detector blinding statistics"""
        stats = super().get_attack_statistics()
        stats.update({
            "blinding_attempts": self.blinding_attempts,
            "successful_blinds": self.successful_blinds,
            "blinding_success_rate": (self.successful_blinds / 
                                     max(1, self.blinding_attempts)),
            "detectors_analyzed": len(self.detector_states),
            "detector_control_level": self.detector_control
        })
        return stats


class AttackDetector:
    """Detects various types of attacks based on QBER and other metrics"""
    
    def __init__(self, 
                 qber_threshold: float = 0.10,  # Lowered from 0.15 to 0.10 for better sensitivity
                 statistical_threshold: float = 0.03):  # Lowered from 0.05 to 0.03
        """
        Initialize attack detector
        
        Args:
            qber_threshold: QBER threshold for attack detection (lowered for better sensitivity)
            statistical_threshold: Statistical threshold for anomaly detection (lowered for better sensitivity)
        """
        self.qber_threshold = qber_threshold
        self.statistical_threshold = statistical_threshold
        self.detection_history = []
    
    def detect_attack(self, 
                     qber: float, 
                     key_length: int,
                     error_distribution: List[int] = None,
                     attack_parameters: Dict = None) -> Dict:
        """
        Detect potential attacks based on QBER and other metrics
        
        Args:
            qber: Quantum Bit Error Rate
            key_length: Length of the key
            error_distribution: Distribution of errors across the key
            attack_parameters: Attack parameters if attack was simulated
            
        Returns:
            Dictionary containing attack detection results
        """
        detection_result = {
            "attack_detected": False,
            "attack_type": None,
            "confidence": 0.0,
            "indicators": []
        }
        

        if qber > self.qber_threshold:
            detection_result["attack_detected"] = True
            detection_result["confidence"] = min(0.9, (qber - self.qber_threshold) / 0.05)  # More sensitive scaling
            detection_result["indicators"].append(f"High QBER: {qber:.3f} (threshold: {self.qber_threshold:.3f})")
        

        if error_distribution and len(error_distribution) > 0:

            error_clustering = self._analyze_error_clustering(error_distribution)
            if error_clustering > self.statistical_threshold:
                detection_result["attack_detected"] = True
                detection_result["confidence"] = max(
                    detection_result["confidence"], 
                    error_clustering
                )
                detection_result["indicators"].append(f"Error clustering: {error_clustering:.3f}")
        

        if attack_parameters and 'strength' in attack_parameters:
            attack_strength = attack_parameters['strength']
            if attack_strength > 0.3:  # 30% threshold
                detection_result["attack_detected"] = True
                detection_result["confidence"] = max(detection_result["confidence"], attack_strength)
                detection_result["indicators"].append(f"High attack strength: {attack_strength:.2f}")
        

        if detection_result["attack_detected"]:
            attack_type = self._classify_attack(qber, error_distribution)
            detection_result["attack_type"] = attack_type
        

        self.detection_history.append({
            "qber": qber,
            "key_length": key_length,
            "detection_result": detection_result.copy()
        })
        
        return detection_result
    
    def _analyze_error_clustering(self, error_distribution: List[int]) -> float:
        """
        Analyze clustering of errors in the key
        
        Args:
            error_distribution: List of error positions
            
        Returns:
            Clustering metric (0 to 1)
        """
        if len(error_distribution) < 2:
            return 0.0
        

        sorted_errors = sorted(error_distribution)
        distances = [sorted_errors[i+1] - sorted_errors[i] 
                    for i in range(len(sorted_errors)-1)]
        
        if not distances:
            return 0.0
        
        avg_distance = sum(distances) / len(distances)
        expected_distance = 1.0  # Expected random distribution
        

        clustering = max(0, 1 - (avg_distance / expected_distance))
        
        return clustering
    
    def _classify_attack(self, 
                         qber: float, 
                         error_distribution: List[int] = None) -> str:
        """
        Classify the type of attack based on observed patterns
        
        Args:
            qber: Quantum Bit Error Rate
            error_distribution: Distribution of errors
            
        Returns:
            String describing the attack type
        """
        if qber > 0.25:
            return "intercept_resend"
        elif qber > 0.15 and error_distribution:

            clustering = self._analyze_error_clustering(error_distribution)
            if clustering > 0.3:
                return "photon_number_splitting"
            else:
                return "intercept_resend"
        else:
            return "unknown"
    
    def get_detection_statistics(self) -> Dict:
        """Get statistics about attack detection performance"""
        if not self.detection_history:
            return {"total_detections": 0, "detection_rate": 0.0}
        
        total_detections = len(self.detection_history)
        successful_detections = sum(
            1 for record in self.detection_history 
            if record["detection_result"]["attack_detected"]
        )
        
        return {
            "total_detections": total_detections,
            "successful_detections": successful_detections,
            "detection_rate": successful_detections / total_detections,
            "average_confidence": sum(
                record["detection_result"]["confidence"] 
                for record in self.detection_history
            ) / total_detections
        }


def simulate_attack(attack_type: AttackType, 
                   qubit: QubitState,
                   attack_params: Dict = None) -> Tuple[QubitState, AttackResult]:
    """
    Simulate an attack on a qubit
    
    Args:
        attack_type: Type of attack to simulate
        qubit: The qubit to attack
        attack_params: Parameters for the attack
        
    Returns:
        Tuple of (modified qubit, attack result)
    """
    if attack_params is None:
        attack_params = {}
    
    if attack_type == AttackType.INTERCEPT_RESEND:
        eavesdropper = InterceptResendEavesdropper(
            measurement_error=attack_params.get("measurement_error", 0.1),
            resend_error=attack_params.get("resend_error", 0.05)
        )
    elif attack_type == AttackType.PHOTON_NUMBER_SPLITTING:
        eavesdropper = PhotonNumberSplittingEavesdropper(
            splitting_efficiency=attack_params.get("splitting_efficiency", 0.8),
            multi_photon_threshold=attack_params.get("multi_photon_threshold", 2)
        )
    elif attack_type == AttackType.DETECTOR_BLINDING:
        eavesdropper = DetectorBlindingEavesdropper(
            blinding_efficiency=attack_params.get("blinding_efficiency", 0.9),
            blinding_power=attack_params.get("blinding_power", 0.8)
        )
    else:

        return qubit, AttackResult(
            attack_type=AttackType.NO_ATTACK,
            success=False,
            detected=False,
            eavesdropped_bits=[],
            introduced_errors=0,
            attack_visibility=0.0,
            attack_details={}
        )
    

    modified_qubit = eavesdropper.intercept_qubit(qubit)
    

    attack_result = AttackResult(
        attack_type=attack_type,
        success=True,
        detected=False,  # Will be determined by attack detector
        eavesdropped_bits=eavesdropper.eavesdropped_bits.copy(),
        introduced_errors=0,  # Will be calculated later
        attack_visibility=0.0,  # Will be calculated later
        attack_details=eavesdropper.get_attack_statistics()
    )
    
    return modified_qubit, attack_result
