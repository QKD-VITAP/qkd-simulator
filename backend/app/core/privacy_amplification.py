
import random
import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass
import secrets


@dataclass
class PrivacyAmplificationResult:
    final_key: List[int]
    original_length: int
    final_length: int
    compression_ratio: float
    method: str
    hash_seed: Optional[bytes] = None
    security_parameter: float = 0.0
    entropy_estimate: float = 0.0


class ToeplitzHashing:
    """Toeplitz matrix-based privacy amplification"""
    
    def __init__(self, 
                 output_length: int = 256,
                 seed_length: int = 512,
                 use_cryptographic_seed: bool = True):
        """
        Initialize Toeplitz hashing
        
        Args:
            output_length: Length of output key
            seed_length: Length of seed for Toeplitz matrix
            use_cryptographic_seed: Whether to use cryptographically secure seed
        """
        self.output_length = output_length
        self.seed_length = seed_length
        self.use_cryptographic_seed = use_cryptographic_seed
        self.seed = None
        self.toeplitz_matrix = None
        
    def generate_seed(self) -> bytes:
        """Generate cryptographically secure seed"""
        if self.use_cryptographic_seed:
            self.seed = secrets.token_bytes(self.seed_length // 8)
        else:
            self.seed = random.getrandbits(self.seed_length).to_bytes(
                self.seed_length // 8, byteorder='big'
            )
        return self.seed
    
    def build_toeplitz_matrix(self, input_length: int) -> np.ndarray:
        """
        Build Toeplitz matrix from seed
        
        Args:
            input_length: Length of input key
            
        Returns:
            Toeplitz matrix as numpy array
        """
        if self.seed is None:
            self.generate_seed()
        

        seed_bits = []
        for byte in self.seed:
            for i in range(8):
                seed_bits.append((byte >> i) & 1)
        

        matrix_size = (self.output_length, input_length)
        self.toeplitz_matrix = np.zeros(matrix_size, dtype=int)
        
        for i in range(self.output_length):
            for j in range(input_length):
                if i + j < len(seed_bits):
                    self.toeplitz_matrix[i, j] = seed_bits[i + j]
                else:

                    self.toeplitz_matrix[i, j] = seed_bits[(i + j) % len(seed_bits)]
        
        return self.toeplitz_matrix
    
    def hash_key(self, input_key: List[int]) -> List[int]:
        """
        Hash input key using Toeplitz matrix
        
        Args:
            input_key: Input key bits
            
        Returns:
            Hashed output key
        """
        if len(input_key) == 0:
            return []
        

        if self.toeplitz_matrix is None:
            self.build_toeplitz_matrix(len(input_key))
        

        if self.toeplitz_matrix.shape[1] != len(input_key):
            self.build_toeplitz_matrix(len(input_key))
        

        input_array = np.array(input_key, dtype=int)
        

        output_array = (self.toeplitz_matrix @ input_array) % 2
        
        return list(output_array)
    
    def get_security_parameters(self) -> Dict:
        """Get security parameters of the hash function"""
        return {
            "output_length": self.output_length,
            "seed_length": self.seed_length,
            "matrix_dimensions": self.toeplitz_matrix.shape if self.toeplitz_matrix is not None else None,
            "cryptographic_seed": self.use_cryptographic_seed
        }


class UniversalHashing:
    """Universal hashing for privacy amplification"""
    
    def __init__(self, 
                 output_length: int = 256,
                 field_size: int = 2,
                 hash_family: str = "polynomial"):
        """
        Initialize universal hashing
        
        Args:
            output_length: Length of output key
            field_size: Size of finite field (2 for binary)
            hash_family: Type of hash family ('polynomial', 'linear')
        """
        self.output_length = output_length
        self.field_size = field_size
        self.hash_family = hash_family
        self.hash_parameters = None
        
    def generate_hash_parameters(self, input_length: int) -> Dict:
        """Generate random hash parameters"""
        if self.hash_family == "polynomial":

            degree = min(input_length - 1, 10)  # Limit degree for efficiency
            coefficients = [random.randint(0, self.field_size - 1) for _ in range(degree + 1)]
            
            self.hash_parameters = {
                "family": "polynomial",
                "coefficients": coefficients,
                "degree": degree,
                "field_size": self.field_size
            }
            
        elif self.hash_family == "linear":

            matrix = np.random.randint(0, self.field_size, 
                                     size=(self.output_length, input_length))
            
            self.hash_parameters = {
                "family": "linear",
                "matrix": matrix,
                "field_size": self.field_size
            }
        
        return self.hash_parameters
    
    def hash_key(self, input_key: List[int]) -> List[int]:
        """
        Hash input key using universal hash function
        
        Args:
            input_key: Input key bits
            
        Returns:
            Hashed output key
        """
        if len(input_key) == 0:
            return []
        

        if self.hash_parameters is None:
            self.generate_hash_parameters(len(input_key))
        
        if self.hash_parameters["family"] == "polynomial":
            return self._polynomial_hash(input_key)
        elif self.hash_parameters["family"] == "linear":
            return self._linear_hash(input_key)
        else:
            raise ValueError(f"Unknown hash family: {self.hash_family}")
    
    def _polynomial_hash(self, input_key: List[int]) -> List[int]:
        """
        Hash input key using polynomial universal hash function
        
        Args:
            input_key: Input key bits
            
        Returns:
            Hashed output key
        """
        if not self.hash_parameters:
            raise ValueError("Hash parameters not generated")
        
        coefficients = self.hash_parameters["coefficients"]
        field_size = self.hash_parameters["field_size"]
        

        output = []
        for i in range(self.output_length):

            result = 0
            for j, coeff in enumerate(coefficients):
                if j < len(input_key):
                    result = (result + coeff * input_key[j] * (i ** j)) % field_size
            output.append(result)
        
        return output
    
    def _linear_hash(self, input_key: List[int]) -> List[int]:
        """
        Hash input key using linear universal hash function
        
        Args:
            input_key: Input key bits
            
        Returns:
            Hashed output key
        """
        if not self.hash_parameters:
            raise ValueError("Hash parameters not generated")
        
        matrix = self.hash_parameters["matrix"]
        field_size = self.hash_parameters["field_size"]
        

        input_array = np.array(input_key, dtype=int)
        output_array = (matrix @ input_array) % field_size
        
        return list(output_array)
    
    def get_security_parameters(self) -> Dict:
        """Get security parameters of the hash function"""
        return {
            "output_length": self.output_length,
            "field_size": self.field_size,
            "hash_family": self.hash_family,
            "hash_parameters": self.hash_parameters
        }


class AdvancedPrivacyAmplification:
    """Advanced privacy amplification combining multiple methods"""
    
    def __init__(self, 
                 method: str = "toeplitz",
                 output_length: int = 256,
                 security_parameter: float = 0.1):
        """
        Initialize advanced privacy amplification
        
        Args:
            method: Amplification method ('toeplitz', 'universal', 'hybrid')
            output_length: Length of output key
            security_parameter: Security parameter for entropy estimation
        """
        self.method = method
        self.output_length = output_length
        self.security_parameter = security_parameter
        

        self.toeplitz = ToeplitzHashing(output_length=output_length)
        self.universal = UniversalHashing(output_length=output_length)
        
    def amplify_privacy(self, 
                        input_key: List[int],
                        estimated_entropy: float = None) -> PrivacyAmplificationResult:
        """
        Perform privacy amplification
        
        Args:
            input_key: Input key bits
            estimated_entropy: Estimated entropy of input key
            
        Returns:
            PrivacyAmplificationResult with final key
        """
        if len(input_key) == 0:
            return PrivacyAmplificationResult(
                final_key=[],
                original_length=0,
                final_length=0,
                compression_ratio=0.0,
                method=self.method
            )
        

        if estimated_entropy is None:
            estimated_entropy = self._estimate_entropy(input_key)
        

        secure_output_length = self._calculate_secure_output_length(
            len(input_key), estimated_entropy
        )
        

        if self.method == "toeplitz":
            final_key = self.toeplitz.hash_key(input_key)
            hash_seed = self.toeplitz.seed
            
        elif self.method == "universal":
            final_key = self.universal.hash_key(input_key)
            hash_seed = None
            
        elif self.method == "hybrid":

            toeplitz_key = self.toeplitz.hash_key(input_key)
            universal_key = self.universal.hash_key(input_key)
            

            final_key = [(t ^ u) for t, u in zip(toeplitz_key, universal_key)]
            hash_seed = self.toeplitz.seed
            
        else:
            raise ValueError(f"Unknown privacy amplification method: {self.method}")
        

        if len(final_key) > secure_output_length:
            final_key = final_key[:secure_output_length]
        elif len(final_key) < secure_output_length:

            final_key = final_key + [0] * (secure_output_length - len(final_key))


        compression_ratio = len(final_key) / len(input_key)
        security_level = self._calculate_security_level(estimated_entropy, compression_ratio)
        
        return PrivacyAmplificationResult(
            final_key=final_key,
            original_length=len(input_key),
            final_length=len(final_key),
            compression_ratio=compression_ratio,
            method=self.method,
            hash_seed=hash_seed,
            security_parameter=security_level,
            entropy_estimate=estimated_entropy
        )
    
    def _estimate_entropy(self, key: List[int]) -> float:
        """Estimate entropy of the input key"""
        if len(key) == 0:
            return 0.0
        

        bit_counts = [0, 0]
        for bit in key:
            bit_counts[bit] += 1
        

        total_bits = len(key)
        entropy = 0.0
        
        for count in bit_counts:
            if count > 0:
                probability = count / total_bits
                entropy -= probability * np.log2(probability)
        
        return entropy
    
    def _calculate_secure_output_length(self, 
                                       input_length: int, 
                                       entropy: float) -> int:
        """Calculate secure output length based on entropy"""



        
        epsilon = self.security_parameter
        security_bits = np.log2(1 / epsilon)
        
        secure_length = int(entropy - security_bits)
        


        if input_length < 100:

            min_length = max(8, input_length // 10)
        elif input_length < 500:

            min_length = max(32, input_length // 15)
        else:


            min_length = max(32, input_length // 25)  # Changed from 64 to input_length // 25
        


        import random
        random_factor = random.uniform(0.9, 1.1)  # ±10% variation
        secure_length = int(secure_length * random_factor)
        
        secure_length = max(min_length, min(secure_length, self.output_length))
        
        return secure_length
    
    def _calculate_security_level(self, 
                                 entropy: float, 
                                 compression_ratio: float) -> float:
        """Calculate security level of the amplification"""


        
        if entropy <= 0:
            return 0.0
        

        security = min(1.0, entropy / (1.0 + compression_ratio))
        
        return security
    
    def get_amplification_statistics(self) -> Dict:
        """Get statistics about the privacy amplification"""
        return {
            "method": self.method,
            "output_length": self.output_length,
            "security_parameter": self.security_parameter,
            "toeplitz_params": self.toeplitz.get_security_parameters(),
            "universal_params": self.universal.get_security_parameters()
        }


class EntropyEstimation:
    """Advanced entropy estimation for privacy amplification"""
    
    @staticmethod
    def estimate_min_entropy(key: List[int], 
                           block_size: int = 8) -> float:
        """
        Estimate minimum entropy using block-based analysis
        
        Args:
            key: Input key bits
            block_size: Size of blocks for analysis
            
        Returns:
            Estimated minimum entropy per bit
        """
        if len(key) < block_size:
            return 0.0
        

        blocks = []
        for i in range(0, len(key) - block_size + 1, block_size):
            block = key[i:i + block_size]
            blocks.append(tuple(block))
        

        block_counts = {}
        for block in blocks:
            block_counts[block] = block_counts.get(block, 0) + 1
        

        max_probability = max(block_counts.values()) / len(blocks)
        min_entropy = -np.log2(max_probability) / block_size
        
        return min_entropy
    
    @staticmethod
    def estimate_conditional_entropy(key: List[int], 
                                   context_length: int = 4) -> float:
        """
        Estimate conditional entropy using context modeling
        
        Args:
            key: Input key bits
            context_length: Length of context for prediction
            
        Returns:
            Estimated conditional entropy per bit
        """
        if len(key) < context_length + 1:
            return 0.0
        

        context_next_pairs = {}
        for i in range(len(key) - context_length):
            context = tuple(key[i:i + context_length])
            next_bit = key[i + context_length]
            
            if context not in context_next_pairs:
                context_next_pairs[context] = [0, 0]
            
            context_next_pairs[context][next_bit] += 1
        

        total_entropy = 0.0
        total_contexts = 0
        
        for context, counts in context_next_pairs.items():
            total_count = sum(counts)
            if total_count > 0:
                context_entropy = 0.0
                for count in counts:
                    if count > 0:
                        probability = count / total_count
                        context_entropy -= probability * np.log2(probability)
                
                total_entropy += context_entropy * total_count
                total_contexts += total_count
        
        if total_contexts > 0:
            return total_entropy / total_contexts
        else:
            return 0.0



def create_privacy_amplification(method: str = "toeplitz", **kwargs) -> AdvancedPrivacyAmplification:
    """Create privacy amplification instance with specified method"""
    if method not in {"toeplitz", "universal", "hybrid"}:
        raise ValueError(f"Unknown privacy amplification method: {method}")
    return AdvancedPrivacyAmplification(method=method, **kwargs)
