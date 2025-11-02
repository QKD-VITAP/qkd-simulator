
import random
import time
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum

from .quantum_states import (
    QubitState, Basis, PhotonSource, QuantumChannel, QuantumDetector,
    create_bb84_states, calculate_qber
)


class ProtocolPhase(Enum):
    INITIALIZATION = "initialization"
    QUANTUM_TRANSMISSION = "quantum_transmission"
    BASIS_ANNOUNCEMENT = "basis_announcement"
    SIFTING = "sifting"
    ERROR_ESTIMATION = "error_estimation"
    RECONCILIATION = "reconciliation"
    PRIVACY_AMPLIFICATION = "privacy_amplification"
    COMPLETED = "completed"


@dataclass
class BB84Result:
    raw_key_length: int
    sifted_key_length: int
    final_key_length: int
    qber: float
    sifted_qber: float
    sifted_key_sender: List[int]
    sifted_key_receiver: List[int]
    final_key_sender: List[int]
    final_key_receiver: List[int]
    protocol_phases: List[ProtocolPhase]
    error_positions: List[int]
    reconciliation_info: Dict
    privacy_amplification_info: Dict
    alice_random_bits: List[int] = None
    alice_bases: List[str] = None
    bob_bases: List[str] = None
    bob_measurements: List[int] = None
    
    def __post_init__(self):
        if self.alice_random_bits is None:
            self.alice_random_bits = []
        if self.alice_bases is None:
            self.alice_bases = []
        if self.bob_bases is None:
            self.bob_bases = []
        if self.bob_measurements is None:
            self.bob_measurements = []


class BB84Sender:
    
    def __init__(self, 
                 photon_source: PhotonSource,
                 channel: QuantumChannel,
                 num_qubits: int = 1000):
        self.photon_source = photon_source
        self.channel = channel
        self.num_qubits = num_qubits
        
        self.qubit_states: List[QubitState] = []
        self.bases: List[Basis] = []
        self.bit_values: List[int] = []
        self.transmitted_qubits: List[Optional[QubitState]] = []
        
    def initialize_protocol(self) -> None:
        self.qubit_states, self.bases, self.bit_values = create_bb84_states(self.num_qubits)
        self.transmitted_qubits = []
        
    def transmit_qubits(self) -> List[Optional[QubitState]]:
        self.transmitted_qubits = []
        
        for qubit in self.qubit_states:
            emitted_qubit = self.photon_source.emit_photon(qubit)
            
            if emitted_qubit is not None:
                transmitted_qubit = self.channel.transmit_qubit(emitted_qubit)
                self.transmitted_qubits.append(transmitted_qubit)
            else:
                self.transmitted_qubits.append(None)
        
        return self.transmitted_qubits
    
    def announce_bases(self) -> List[Basis]:
        return self.bases.copy()
    
    def get_bases_string(self) -> List[str]:
        return ['+' if b == Basis.COMPUTATIONAL else 'x' for b in self.bases]
    
    def get_raw_bits(self) -> List[int]:
        return self.bit_values.copy()
    
    def get_sifted_key(self, matching_bases: List[int]) -> List[int]:
        return [self.bit_values[i] for i in matching_bases]


class BB84Receiver:
    
    def __init__(self, 
                 channel: QuantumChannel,
                 detector_efficiency: float = 0.8,
                 detector_dark_count_rate: float = 100.0,
                 detector_dead_time: float = 0.001,
                 detector_timing_jitter: float = 0.05):
        self.channel = channel
        

        self.detector = QuantumDetector(
            efficiency=detector_efficiency,
            dark_count_rate=detector_dark_count_rate,
            dead_time=detector_dead_time,
            timing_jitter=detector_timing_jitter
        )
        
        self.received_qubits: List[Optional[QubitState]] = []
        self.measurement_bases: List[Basis] = []
        self.measurement_results: List[int] = []
        self.detection_results: List[bool] = []
        self.detection_info: List[Dict] = []
        
    def receive_qubits(self, transmitted_qubits: List[Optional[QubitState]]) -> None:
        self.received_qubits = []
        self.measurement_bases = []
        self.measurement_results = []
        self.detection_results = []
        self.detection_info = []
        
        current_time = time.time()
        
        for i, qubit in enumerate(transmitted_qubits):
            if qubit is not None:

                basis = random.choice([Basis.COMPUTATIONAL, Basis.HADAMARD])
                
                detected, detection_info = self.detector.detect_photon(qubit, basis, current_time + i * 1e-6)
                
                if detected:

                    result, _ = qubit.measure(basis)
                    

                    if detection_info.get("dark_count", False):

                        result = random.randint(0, 1)
                    elif detection_info.get("crosstalk", False):

                        result = 1 - result
                    elif detection_info.get("afterpulse", False):

                        if self.measurement_results:
                            result = self.measurement_results[-1]
                    

                    timing_jitter = detection_info.get("timing_jitter", 0)
                    if abs(timing_jitter) > 0.1:  # Significant timing error
                        if random.random() < 0.1:  # 10% chance of bit flip due to timing
                            result = 1 - result
                    
                    self.received_qubits.append(qubit)
                    self.measurement_bases.append(basis)
                    self.measurement_results.append(result)
                    self.detection_results.append(True)
                    self.detection_info.append(detection_info)
                else:

                    self.received_qubits.append(None)
                    self.measurement_bases.append(None)
                    self.measurement_results.append(None)
                    self.detection_results.append(False)
                    self.detection_info.append(detection_info)
            else:

                self.received_qubits.append(None)
                self.measurement_bases.append(None)
                self.measurement_results.append(None)
                self.detection_results.append(False)
                self.detection_info.append({})
    
    def get_matching_bases(self, sender_bases: List[Basis]) -> List[int]:
        matching_indices = []
        for i, (sender_basis, receiver_basis) in enumerate(zip(sender_bases, self.measurement_bases)):
            if (receiver_basis is not None and 
                sender_basis == receiver_basis):
                matching_indices.append(i)
        return matching_indices
    
    def get_sifted_key(self, matching_bases: List[int]) -> List[int]:
        return [self.measurement_results[i] for i in matching_bases]
    
    def get_bases_string(self) -> List[str]:
        result = []
        for b in self.measurement_bases:
            if b == Basis.COMPUTATIONAL:
                result.append('+')
            elif b == Basis.HADAMARD:
                result.append('x')
            else:
                result.append('')
        return result
    
    def get_raw_measurements(self) -> List[int]:
        return self.measurement_results.copy()


class BB84Protocol:
    
    def __init__(self, 
                 num_qubits: int = 1000,
                 channel_length: float = 10.0,
                 channel_attenuation: float = 0.1,
                 channel_depolarization: float = 0.01,
                 photon_source_efficiency: float = 0.8,
                 detector_efficiency: float = 0.8,
                 detector_dark_count_rate: float = 100.0,
                 detector_dead_time: float = 0.001,
                 detector_timing_jitter: float = 0.05,
                 wavelength: float = 1550.0,
                 temperature: float = 20.0):
        self.num_qubits = num_qubits
        

        self.photon_source = PhotonSource(
            efficiency=photon_source_efficiency,
            multi_photon_probability=0.05,
            timing_jitter=0.1,
            wavelength_stability=0.99
        )
        

        self.channel = QuantumChannel(
            attenuation=channel_attenuation,
            depolarization_rate=channel_depolarization,
            length=channel_length,
            wavelength=wavelength,
            temperature=temperature,
            chromatic_dispersion=17.0,
            polarization_mode_dispersion=0.1,
            nonlinear_coefficient=2.6e-20
        )
        
        self.sender = BB84Sender(self.photon_source, self.channel, num_qubits)
        self.receiver = BB84Receiver(
            self.channel, 
            detector_efficiency,
            detector_dark_count_rate,
            detector_dead_time,
            detector_timing_jitter
        )
        
        self.current_phase = ProtocolPhase.INITIALIZATION
        self.protocol_phases = []
        
    def execute_protocol(self, attack_type=None, attack_parameters=None) -> BB84Result:
        self.protocol_phases = [ProtocolPhase.INITIALIZATION]
        
        self.sender.initialize_protocol()
        self.protocol_phases.append(ProtocolPhase.QUANTUM_TRANSMISSION)
        
        transmitted_qubits = self.sender.transmit_qubits()
        
        if attack_type and attack_type != "no_attack":
            transmitted_qubits = self._apply_attack_to_qubits(
                transmitted_qubits, attack_type, attack_parameters
            )
        
        self.receiver.receive_qubits(transmitted_qubits)
        self.protocol_phases.append(ProtocolPhase.BASIS_ANNOUNCEMENT)
        
        sender_bases = self.sender.announce_bases()
        self.protocol_phases.append(ProtocolPhase.SIFTING)
        
        matching_bases = self.receiver.get_matching_bases(sender_bases)
        sifted_key_sender = self.sender.get_sifted_key(matching_bases)
        sifted_key_receiver = self.receiver.get_sifted_key(matching_bases)
        self.protocol_phases.append(ProtocolPhase.ERROR_ESTIMATION)
        
        error_positions = [
            i for i, (s, r) in enumerate(zip(sifted_key_sender, sifted_key_receiver))
            if s != r
        ]
        
        sifted_qber_value = len(error_positions) / len(sifted_key_sender) if len(sifted_key_sender) > 0 else 0.0
        
        self.protocol_phases.append(ProtocolPhase.RECONCILIATION)
        
        reconciliation_info = self._perform_reconciliation(
            sifted_key_sender, sifted_key_receiver, error_positions
        )
        
        reconciled_sender = reconciliation_info["reconciled_key_sender"]
        reconciled_receiver = reconciliation_info["reconciled_key_receiver"]
        
        self.protocol_phases.append(ProtocolPhase.PRIVACY_AMPLIFICATION)
        
        privacy_amplification_info = self._perform_privacy_amplification(
            reconciled_sender, reconciled_receiver
        )
        
        final_key_sender = self._generate_final_key(reconciled_sender, privacy_amplification_info)
        final_key_receiver = self._generate_final_key(reconciled_receiver, privacy_amplification_info)
        
        final_qber = calculate_qber(final_key_sender, final_key_receiver)
        
        alice_random_bits = self.sender.get_raw_bits()
        alice_bases = self.sender.get_bases_string()
        bob_bases = self.receiver.get_bases_string()
        bob_measurements = self.receiver.get_raw_measurements()
        
        self.protocol_phases.append(ProtocolPhase.COMPLETED)
        self.current_phase = ProtocolPhase.COMPLETED
        
        return BB84Result(
            raw_key_length=self.num_qubits,
            sifted_key_length=len(sifted_key_sender),
            final_key_length=len(final_key_sender),
            qber=final_qber,
            sifted_qber=sifted_qber_value,
            error_positions=error_positions,
            sifted_key_sender=sifted_key_sender,
            sifted_key_receiver=sifted_key_receiver,
            final_key_sender=final_key_sender,
            final_key_receiver=final_key_receiver,
            protocol_phases=self.protocol_phases,
            reconciliation_info=reconciliation_info,
            privacy_amplification_info=privacy_amplification_info,
            alice_random_bits=alice_random_bits,
            alice_bases=alice_bases,
            bob_bases=bob_bases,
            bob_measurements=bob_measurements
        )
    
    def _perform_reconciliation(self, 
                              key_sender: List[int], 
                              key_receiver: List[int],
                              error_positions: List[int]) -> Dict:
        reconciled_key_sender = key_sender.copy()
        reconciled_key_receiver = key_receiver.copy()
        
        reconciliation_efficiency = 0.6
        num_errors = len(error_positions)
        num_to_correct = int(num_errors * reconciliation_efficiency)
        
        errors_to_correct = random.sample(error_positions, min(num_to_correct, len(error_positions)))
        
        corrected_positions = []
        for error_pos in errors_to_correct:
            if error_pos < len(reconciled_key_receiver):
                reconciled_key_receiver[error_pos] = reconciled_key_sender[error_pos]
                corrected_positions.append(error_pos)
        
        uncorrected_errors = [pos for pos in error_positions if pos not in errors_to_correct]
        
        return {
            "reconciled_key_sender": reconciled_key_sender,
            "reconciled_key_receiver": reconciled_key_receiver,
            "corrected_positions": corrected_positions,
            "uncorrected_errors": uncorrected_errors,
            "reconciliation_method": "realistic_error_correction",
            "efficiency": reconciliation_efficiency
        }
    
    def _perform_privacy_amplification(self, 
                                     key_sender: List[int], 
                                     key_receiver: List[int]) -> Dict:
        key_length = len(key_sender)
        
        if key_length < 10:
            final_length = max(1, int(key_length * 0.8))
        else:
            final_length = max(1, int(key_length * 0.98))
        
        privacy_amplified_key = key_sender[:final_length]
        
        return {
            "privacy_amplified_key": privacy_amplified_key,
            "original_length": key_length,
            "final_length": len(privacy_amplified_key),
            "amplification_method": "adaptive_compression",
            "compression_ratio": len(privacy_amplified_key) / key_length if key_length > 0 else 0
        }
    
    def _generate_final_key(self, 
                           sifted_key: List[int], 
                           privacy_amplification_info: Dict) -> List[int]:
        return privacy_amplification_info["privacy_amplified_key"]
    
    def get_protocol_status(self) -> Dict:
        return {
            "current_phase": self.current_phase.value,
            "phases_completed": len(self.protocol_phases),
            "total_phases": len(ProtocolPhase),
            "qubits_generated": self.num_qubits
        }
    
    def get_system_statistics(self) -> Dict:
        return {
            "photon_source": {
                "efficiency": self.photon_source.efficiency,
                "multi_photon_probability": self.photon_source.multi_photon_probability,
                "timing_jitter": self.photon_source.timing_jitter,
                "wavelength_stability": self.photon_source.wavelength_stability,
                "mean_photons_per_pulse": self.photon_source.mean_photons_per_pulse
            },
            "quantum_channel": self.channel.get_channel_statistics(),
            "quantum_detector": self.receiver.detector.get_detector_statistics(),
            "protocol_parameters": {
                "num_qubits": self.num_qubits,
                "channel_length": self.channel.length,
                "channel_attenuation": self.channel.attenuation,
                "channel_depolarization": self.channel.depolarization_rate,
                "detector_efficiency": self.receiver.detector.efficiency,
                "detector_dark_count_rate": self.receiver.detector.dark_count_rate,
                "detector_dead_time": self.receiver.detector.dead_time,
                "detector_timing_jitter": self.receiver.detector.timing_jitter
            }
        }

    def _apply_attack_to_qubits(self, qubits, attack_type, attack_parameters):
        if attack_type == "intercept_resend":
            return self._intercept_resend_attack(qubits, attack_parameters)
        elif attack_type == "photon_number_splitting":
            return self._photon_number_splitting_attack(qubits, attack_parameters)
        elif attack_type == "detector_blinding":
            return self._detector_blinding_attack(qubits, attack_parameters)
        else:
            return qubits
    
    def _intercept_resend_attack(self, qubits, attack_parameters):
        attack_strength = attack_parameters.get('strength', 0.5)
        
        valid_qubits = [(i, qubit) for i, qubit in enumerate(qubits) if qubit is not None]
        
        if not valid_qubits:
            return qubits
        
        num_qubits_to_attack = max(1, int(len(valid_qubits) * attack_strength))
        
        attack_positions = random.sample(range(len(valid_qubits)), min(num_qubits_to_attack, len(valid_qubits)))
        
        modified_qubits = qubits.copy()
        for pos in attack_positions:
            original_pos, qubit = valid_qubits[pos]
            
            measured_bit, _ = qubit.measure(random.choice([Basis.COMPUTATIONAL, Basis.HADAMARD]))
            
            error_probability = 0.3
            if random.random() < error_probability:
                measured_bit = 1 - measured_bit
            
            new_qubit = QubitState.from_basis_state(random.choice([Basis.COMPUTATIONAL, Basis.HADAMARD]), measured_bit)
            modified_qubits[original_pos] = new_qubit
        
        return modified_qubits
    
    def _photon_number_splitting_attack(self, qubits, attack_parameters):
        return self._intercept_resend_attack(qubits, {'strength': attack_parameters.get('strength', 0.5) * 0.7})
    
    def _detector_blinding_attack(self, qubits, attack_parameters):
        return self._intercept_resend_attack(qubits, {'strength': attack_parameters.get('strength', 0.5) * 0.8})

    
