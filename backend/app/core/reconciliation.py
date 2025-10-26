
import random
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import hashlib


@dataclass
class ReconciliationResult:
    corrected_key_sender: List[int]
    corrected_key_receiver: List[int]
    discarded_positions: List[int]
    reconciliation_method: str
    rounds_required: int
    bits_revealed: int
    success_rate: float
    final_key_length: int


class CascadeProtocol:
    """Implementation of the Cascade reconciliation protocol"""
    
    def __init__(self, 
                 initial_block_size: int = 64,
                 max_rounds: int = 4,
                 parity_check_method: str = "random"):
        """
        Initialize Cascade protocol
        
        Args:
            initial_block_size: Size of initial blocks
            max_rounds: Maximum number of reconciliation rounds
            parity_check_method: Method for parity check selection
        """
        self.initial_block_size = initial_block_size
        self.max_rounds = max_rounds
        self.parity_check_method = parity_check_method
        self.rounds_completed = 0
        self.bits_revealed = 0
        
    def reconcile(self, 
                  key_sender: List[int], 
                  key_receiver: List[int]) -> ReconciliationResult:
        """
        Perform Cascade reconciliation
        
        Args:
            key_sender: Sender's key bits
            key_receiver: Receiver's key bits
            
        Returns:
            ReconciliationResult with corrected keys
        """
        if len(key_sender) != len(key_receiver):
            raise ValueError("Key lengths must match")
        
        key_length = len(key_sender)
        corrected_sender = key_sender.copy()
        corrected_receiver = key_receiver.copy()
        
        revealed_positions = set()
        error_positions = []
        
        block_size = self.initial_block_size
        for round_num in range(self.max_rounds):
            self.rounds_completed = round_num + 1
            

            blocks = self._create_blocks(key_length, block_size, round_num)
            

            for block_indices in blocks:
                if len(block_indices) < 2:
                    continue
                    

                sender_parity = sum(corrected_sender[i] for i in block_indices) % 2
                receiver_parity = sum(corrected_receiver[i] for i in block_indices) % 2
                
                if sender_parity != receiver_parity:

                    error_pos = self._find_error_in_block(
                        corrected_sender, corrected_receiver, block_indices
                    )
                    if error_pos is not None:

                        corrected_receiver[error_pos] = corrected_sender[error_pos]
                        error_positions.append(error_pos)
                        

                        revealed_positions.add(error_pos)
                        self.bits_revealed += 1
            

            block_size = max(2, block_size // 2)
            

            if self._calculate_qber(corrected_sender, corrected_receiver) < 0.001:
                break
        

        final_key_length = key_length - len(revealed_positions)
        success_rate = 1 - (len(error_positions) / key_length)
        
        return ReconciliationResult(
            corrected_key_sender=corrected_sender,
            corrected_key_receiver=corrected_receiver,
            discarded_positions=list(revealed_positions),
            reconciliation_method="cascade",
            rounds_required=self.rounds_completed,
            bits_revealed=self.bits_revealed,
            success_rate=success_rate,
            final_key_length=final_key_length
        )
    
    def _create_blocks(self, 
                       key_length: int, 
                       block_size: int, 
                       round_num: int) -> List[List[int]]:
        """Create blocks for reconciliation round"""
        blocks = []
        
        if self.parity_check_method == "random":

            random.seed(42 + round_num)  # Deterministic but different per round
            positions = list(range(key_length))
            random.shuffle(positions)
            
            for i in range(0, key_length, block_size):
                block = positions[i:i + block_size]
                if len(block) >= 2:  # Only blocks with at least 2 bits
                    blocks.append(block)
        
        else:

            for i in range(0, key_length, block_size):
                block = list(range(i, min(i + block_size, key_length)))
                if len(block) >= 2:
                    blocks.append(block)
        
        return blocks
    
    def _find_error_in_block(self, 
                             key_sender: List[int], 
                             key_receiver: List[int], 
                             block_indices: List[int]) -> Optional[int]:
        """Find error position within a block using binary search"""
        if len(block_indices) == 1:
            return block_indices[0] if key_sender[block_indices[0]] != key_receiver[block_indices[0]] else None
        

        mid = len(block_indices) // 2
        left_block = block_indices[:mid]
        right_block = block_indices[mid:]
        

        left_sender_parity = sum(key_sender[i] for i in left_block) % 2
        left_receiver_parity = sum(key_receiver[i] for i in left_block) % 2
        
        if left_sender_parity != left_receiver_parity:

            return self._find_error_in_block(key_sender, key_receiver, left_block)
        else:

            return self._find_error_in_block(key_sender, key_receiver, right_block)
    
    def _calculate_qber(self, key1: List[int], key2: List[int]) -> float:
        """Calculate Quantum Bit Error Rate"""
        if len(key1) != len(key2):
            return 1.0
        if len(key1) == 0:
            return 0.0
        
        errors = sum(1 for k1, k2 in zip(key1, key2) if k1 != k2)
        return errors / len(key1)


class LDPCCodes:
    """Low-Density Parity-Check codes for error correction"""
    
    def __init__(self, 
                 code_length: int = 1024,
                 code_rate: float = 0.5,
                 max_iterations: int = 50):
        """
        Initialize LDPC codes
        
        Args:
            code_length: Length of the codeword
            code_rate: Rate of the code (information bits / codeword bits)
            max_iterations: Maximum belief propagation iterations
        """
        self.code_length = code_length
        self.code_rate = code_rate
        self.max_iterations = max_iterations
        self.parity_check_matrix = None
        self._generate_parity_check_matrix()
    
    def _generate_parity_check_matrix(self):
        """Generate random LDPC parity check matrix"""
        info_bits = int(self.code_length * self.code_rate)
        parity_bits = self.code_length - info_bits
        

        self.parity_check_matrix = np.random.choice(
            [0, 1], 
            size=(parity_bits, self.code_length), 
            p=[0.9, 0.1]  # 10% density for LDPC
        )
        

        self.parity_check_matrix[:, info_bits:] = np.eye(parity_bits)
    
    def encode(self, information_bits: List[int]) -> List[int]:
        """Encode information bits using LDPC codes"""
        if len(information_bits) != int(self.code_length * self.code_rate):
            raise ValueError("Information length doesn't match code rate")
        

        info = np.array(information_bits)
        

        parity = (self.parity_check_matrix[:, :len(info)] @ info) % 2
        

        return list(info) + list(parity)
    
    def decode(self, received_codeword: List[int]) -> Tuple[List[int], bool]:
        """
        Decode received codeword using belief propagation
        
        Args:
            received_codeword: Received codeword with potential errors
            
        Returns:
            Tuple of (decoded information bits, success flag)
        """
        if len(received_codeword) != self.code_length:
            raise ValueError("Received codeword length doesn't match code length")
        

        received = np.array(received_codeword)
        

        decoded = self._belief_propagation(received)
        

        info_bits = int(self.code_length * self.code_rate)
        decoded_info = decoded[:info_bits]
        

        success = self._check_syndrome(decoded)
        
        return list(decoded_info), success
    
    def _belief_propagation(self, received: np.ndarray) -> np.ndarray:
        """Belief propagation algorithm for LDPC decoding"""

        llr = np.log((1 - 0.1) / 0.1) * (1 - 2 * received)  # Assuming 10% error rate
        

        for iteration in range(self.max_iterations):

            llr = self._variable_node_update(llr)
            

            llr = self._check_node_update(llr)
            

            decoded = (llr < 0).astype(int)
            

            if self._check_syndrome(decoded):
                break
        
        return decoded
    
    def _variable_node_update(self, llr: np.ndarray) -> np.ndarray:
        """Variable node update in belief propagation"""


        

        noise_reduction = 0.1
        llr = llr * (1 - noise_reduction) + np.random.normal(0, 0.01, llr.shape)
        

        llr = np.clip(llr, -10, 10)
        
        return llr
    
    def _check_node_update(self, llr: np.ndarray) -> np.ndarray:
        """Check node update in belief propagation"""


        



        

        hard_decision = (llr < 0).astype(int)
        majority_bit = np.round(np.mean(hard_decision))
        

        llr_adjustment = 0.1 * (majority_bit - hard_decision)
        llr = llr + llr_adjustment
        
        return llr
    
    def _check_syndrome(self, codeword: np.ndarray) -> bool:
        """Check if codeword satisfies parity check equations"""
        syndrome = (self.parity_check_matrix @ codeword) % 2
        return np.all(syndrome == 0)


class AdvancedReconciliation:
    """Advanced reconciliation combining multiple methods"""
    
    def __init__(self, 
                 method: str = "cascade",
                 cascade_params: Dict = None,
                 ldpc_params: Dict = None):
        """
        Initialize advanced reconciliation
        
        Args:
            method: Reconciliation method ('cascade', 'ldpc', 'hybrid')
            cascade_params: Parameters for Cascade protocol
            ldpc_params: Parameters for LDPC codes
        """
        self.method = method
        
        if cascade_params is None:
            cascade_params = {}
        if ldpc_params is None:
            ldpc_params = {}
        
        self.cascade = CascadeProtocol(**cascade_params)
        self.ldpc = LDPCCodes(**ldpc_params)
    
    def reconcile(self, 
                  key_sender: List[int], 
                  key_receiver: List[int]) -> ReconciliationResult:
        """
        Perform advanced reconciliation
        
        Args:
            key_sender: Sender's key bits
            key_receiver: Receiver's key bits
            
        Returns:
            ReconciliationResult with corrected keys
        """
        if self.method == "cascade":
            return self.cascade.reconcile(key_sender, key_receiver)
        
        elif self.method == "ldpc":
            return self._ldpc_reconcile(key_sender, key_receiver)
        
        elif self.method == "hybrid":
            return self._hybrid_reconcile(key_sender, key_receiver)
        
        else:
            raise ValueError(f"Unknown reconciliation method: {self.method}")
    
    def _ldpc_reconcile(self, 
                        key_sender: List[int], 
                        key_receiver: List[int]) -> ReconciliationResult:
        """LDPC-based reconciliation"""

        padded_sender, padding_info = self._pad_for_ldpc(key_sender)
        padded_receiver, _ = self._pad_for_ldpc(key_receiver)
        

        encoded_sender = self.ldpc.encode(padded_sender)
        

        received = self._simulate_transmission(encoded_sender)
        

        decoded_info, success = self.ldpc.decode(received)
        

        final_sender = decoded_info[:len(key_sender)]
        final_receiver = key_receiver  # Receiver's key remains unchanged
        

        errors = sum(1 for s, r in zip(final_sender, final_receiver) if s != r)
        success_rate = 1 - (errors / len(key_sender))
        
        return ReconciliationResult(
            corrected_key_sender=final_sender,
            corrected_key_receiver=final_receiver,
            discarded_positions=[],
            reconciliation_method="ldpc",
            rounds_required=1,
            bits_revealed=0,
            success_rate=success_rate,
            final_key_length=len(final_sender)
        )
    
    def _hybrid_reconcile(self, 
                          key_sender: List[int], 
                          key_receiver: List[int]) -> ReconciliationResult:
        """Hybrid reconciliation combining Cascade and LDPC"""

        cascade_result = self.cascade.reconcile(key_sender, key_receiver)
        

        if cascade_result.success_rate < 0.95:
            ldpc_result = self._ldpc_reconcile(
                cascade_result.corrected_key_sender,
                cascade_result.corrected_key_receiver
            )
            

            return ReconciliationResult(
                corrected_key_sender=ldpc_result.corrected_key_sender,
                corrected_key_receiver=ldpc_result.corrected_key_receiver,
                discarded_positions=cascade_result.discarded_positions + ldpc_result.discarded_positions,
                reconciliation_method="hybrid",
                rounds_required=cascade_result.rounds_required + ldpc_result.rounds_required,
                bits_revealed=cascade_result.bits_revealed + ldpc_result.bits_revealed,
                success_rate=ldpc_result.success_rate,
                final_key_length=ldpc_result.final_key_length
            )
        
        return cascade_result
    
    def _pad_for_ldpc(self, key: List[int]) -> Tuple[List[int], Dict]:
        """Pad key to match LDPC code length"""
        info_bits = int(self.ldpc.code_length * self.ldpc.code_rate)
        
        if len(key) <= info_bits:

            padding_length = info_bits - len(key)
            padding = [random.randint(0, 1) for _ in range(padding_length)]
            padded_key = key + padding
            
            return padded_key, {
                "original_length": len(key),
                "padding_length": padding_length,
                "padded_length": len(padded_key)
            }
        else:

            truncated_key = key[:info_bits]
            return truncated_key, {
                "original_length": len(key),
                "truncated_length": len(truncated_key),
                "lost_bits": len(key) - len(truncated_key)
            }
    
    def _simulate_transmission(self, encoded: List[int]) -> List[int]:
        """Simulate transmission errors"""
        received = encoded.copy()
        error_rate = 0.05  # 5% error rate
        
        for i in range(len(received)):
            if random.random() < error_rate:
                received[i] = 1 - received[i]
        
        return received



def create_reconciliation(method: str = "cascade", **kwargs) -> AdvancedReconciliation:
    """Create reconciliation instance with specified method"""
    if method not in {"cascade", "ldpc", "hybrid"}:
        raise ValueError(f"Unknown reconciliation method: {method}")
    return AdvancedReconciliation(method=method, **kwargs)
