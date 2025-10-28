
import base64
import secrets
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256


@dataclass
class AESDemoResult:
    """Results from AES encryption demo"""
    original_message: str
    encrypted_message: str
    decrypted_message: str
    key_used: str
    key_length: int
    encryption_success: bool
    decryption_success: bool
    security_metrics: Dict


class QKDAESIntegration:
    """Integration between QKD and AES encryption"""
    
    def __init__(self, 
                 key_derivation_method: str = "sha256",
                 aes_mode: str = "GCM",
                 key_length: int = 256):
        """
        Initialize QKD-AES integration
        
        Args:
            key_derivation_method: Method for deriving AES key from QKD bits
            aes_mode: AES mode of operation ('GCM', 'CBC', 'CTR')
            key_length: AES key length in bits (128, 192, or 256)
        """
        self.key_derivation_method = key_derivation_method
        self.aes_mode = aes_mode
        self.key_length = key_length
        self.supported_modes = ['GCM', 'CBC', 'CTR']
        
        if aes_mode not in self.supported_modes:
            raise ValueError(f"Unsupported AES mode: {aes_mode}")
        
        if key_length not in [128, 192, 256]:
            raise ValueError(f"Unsupported key length: {key_length}")
    
    def derive_aes_key(self, qkd_key: List[int], salt: bytes = None) -> Tuple[bytes, bytes]:
        """
        Derive AES key from QKD-generated key bits
        
        Args:
            qkd_key: QKD-generated key bits
            salt: Salt for key derivation (generated if None)
            
        Returns:
            Tuple of (derived_key, salt)
        """
        if not qkd_key:
            raise ValueError("QKD key cannot be empty")
        

        qkd_bytes = self._bits_to_bytes(qkd_key)
        

        if salt is None:
            salt = secrets.token_bytes(16)
        

        if self.key_derivation_method == "sha256":
            hash_module = SHA256
        elif self.key_derivation_method == "sha512":
            hash_module = SHA512
        else:
            hash_module = SHA256
        
        derived_key = PBKDF2(
            qkd_bytes,
            salt,
            dkLen=self.key_length // 8,
            count=100000,  # 100k iterations for security
            hmac_hash_module=hash_module
        )
        
        return derived_key, salt
    
    def encrypt_message(self, 
                       message: str, 
                       qkd_key: List[int],
                       salt: bytes = None) -> AESDemoResult:
        """
        Encrypt message using QKD-derived AES key
        
        Args:
            message: Message to encrypt
            qkd_key: QKD-generated key bits
            salt: Salt for key derivation
            
        Returns:
            AESDemoResult with encryption details
        """
        try:

            aes_key, salt_used = self.derive_aes_key(qkd_key, salt)
            

            if self.aes_mode == "GCM":
                encrypted_data, nonce, tag = self._encrypt_gcm(message, aes_key)

                encrypted_message = base64.b64encode(salt_used + nonce + encrypted_data + tag).decode('utf-8')
                
            elif self.aes_mode == "CBC":
                encrypted_data, iv = self._encrypt_cbc(message, aes_key)
                encrypted_message = base64.b64encode(salt_used + iv + encrypted_data).decode('utf-8')
                
            elif self.aes_mode == "CTR":
                encrypted_data, nonce = self._encrypt_ctr(message, aes_key)
                encrypted_message = base64.b64encode(salt_used + nonce + encrypted_data).decode('utf-8')
            

            decrypted_message = self.decrypt_message(encrypted_message, qkd_key, salt_used)
            

            security_metrics = self._calculate_security_metrics(qkd_key, aes_key)
            
            return AESDemoResult(
                original_message=message,
                encrypted_message=encrypted_message,
                decrypted_message=decrypted_message,
                key_used=base64.b64encode(aes_key).decode('utf-8'),
                key_length=len(aes_key) * 8,
                encryption_success=True,
                decryption_success=(decrypted_message == message),
                security_metrics=security_metrics
            )
            
        except Exception as e:
            return AESDemoResult(
                original_message=message,
                encrypted_message="",
                decrypted_message="",
                key_used="",
                key_length=0,
                encryption_success=False,
                decryption_success=False,
                security_metrics={"error": str(e)}
            )
    
    def decrypt_message(self, 
                       encrypted_message: str, 
                       qkd_key: List[int],
                       salt: bytes = None) -> str:
        """
        Decrypt message using QKD-derived AES key
        
        Args:
            encrypted_message: Base64-encoded encrypted message
            qkd_key: QKD-generated key bits
            salt: Salt for key derivation
            
        Returns:
            Decrypted message
        """
        try:

            encrypted_data = base64.b64decode(encrypted_message)


            salt_len = 16
            salt_used = encrypted_data[:salt_len]


            aes_key, _ = self.derive_aes_key(qkd_key, salt_used)
            
            

            if self.aes_mode == "GCM":

                offset = salt_len
                nonce_size = 16
                tag_size = 16
                nonce = encrypted_data[offset:offset+nonce_size]
                data = encrypted_data[offset+nonce_size:-tag_size]
                tag = encrypted_data[-tag_size:]
                decrypted = self._decrypt_gcm(data, nonce, tag, aes_key)
                
            elif self.aes_mode == "CBC":

                offset = salt_len
                iv_size = 16
                iv = encrypted_data[offset:offset+iv_size]
                data = encrypted_data[offset+iv_size:]
                decrypted = self._decrypt_cbc(data, iv, aes_key)
                
            elif self.aes_mode == "CTR":

                offset = salt_len
                nonce_size = 16
                nonce = encrypted_data[offset:offset+nonce_size]
                data = encrypted_data[offset+nonce_size:]
                decrypted = self._decrypt_ctr(data, nonce, aes_key)
            
            return decrypted
            
        except Exception as e:
            raise ValueError(f"Decryption failed: {e}")
    
    def _encrypt_gcm(self, message: str, key: bytes) -> Tuple[bytes, bytes, bytes]:
        """Encrypt using AES-GCM mode"""
        cipher = AES.new(key, AES.MODE_GCM)
        ciphertext, tag = cipher.encrypt_and_digest(message.encode('utf-8'))
        return ciphertext, cipher.nonce, tag
    
    def _decrypt_gcm(self, ciphertext: bytes, nonce: bytes, tag: bytes, key: bytes) -> str:
        """Decrypt using AES-GCM mode"""
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        return plaintext.decode('utf-8')
    
    def _encrypt_cbc(self, message: str, key: bytes) -> Tuple[bytes, bytes]:
        """Encrypt using AES-CBC mode"""
        iv = secrets.token_bytes(16)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        padded_message = pad(message.encode('utf-8'), AES.block_size)
        ciphertext = cipher.encrypt(padded_message)
        return ciphertext, iv
    
    def _decrypt_cbc(self, ciphertext: bytes, iv: bytes, key: bytes) -> str:
        """Decrypt using AES-CBC mode"""
        cipher = AES.new(key, AES.MODE_CBC, iv)
        padded_plaintext = cipher.decrypt(ciphertext)
        plaintext = unpad(padded_plaintext, AES.block_size)
        return plaintext.decode('utf-8')
    
    def _encrypt_ctr(self, message: str, key: bytes) -> Tuple[bytes, bytes]:
        """Encrypt using AES-CTR mode"""
        nonce = secrets.token_bytes(16)
        cipher = AES.new(key, AES.MODE_CTR, nonce=nonce)
        ciphertext = cipher.encrypt(message.encode('utf-8'))
        return ciphertext, nonce
    
    def _decrypt_ctr(self, ciphertext: bytes, nonce: bytes, key: bytes) -> str:
        """Decrypt using AES-CTR mode"""
        cipher = AES.new(key, AES.MODE_CTR, nonce=nonce)
        plaintext = cipher.decrypt(ciphertext)
        return plaintext.decode('utf-8')
    
    def _bits_to_bytes(self, bits: List[int]) -> bytes:
        """Convert list of bits to bytes"""
        if len(bits) % 8 != 0:

            bits = bits + [0] * (8 - len(bits) % 8)
        

        byte_array = bytearray()
        for i in range(0, len(bits), 8):
            byte = 0
            for j in range(8):
                if i + j < len(bits):
                    byte |= bits[i + j] << j
            byte_array.append(byte)
        
        return bytes(byte_array)
    
    def _calculate_security_metrics(self, qkd_key: List[int], aes_key: bytes) -> Dict:
        """Calculate security metrics for the encryption"""

        bit_counts = [0, 0]
        for bit in qkd_key:
            bit_counts[bit] += 1
        
        total_bits = len(qkd_key)
        if total_bits > 0:
            entropy = 0.0
            for count in bit_counts:
                if count > 0:
                    probability = count / total_bits
                    entropy -= probability * np.log2(probability)
        else:
            entropy = 0.0
        

        key_strength = len(aes_key) * 8  # bits
        

        if key_strength == 128:
            brute_force_time = "2^127 operations (AES-128)"
        elif key_strength == 192:
            brute_force_time = "2^191 operations (AES-192)"
        elif key_strength == 256:
            brute_force_time = "2^255 operations (AES-256)"
        else:
            brute_force_time = "Unknown"
        
        return {
            "qkd_key_entropy": entropy,
            "qkd_key_length": len(qkd_key),
            "aes_key_length": key_strength,
            "aes_mode": self.aes_mode,
            "key_derivation_method": self.key_derivation_method,
            "brute_force_resistance": brute_force_time,
            "quantum_resistance": "Yes (QKD-based key)",
            "entropy_per_bit": entropy / max(1, len(qkd_key))
        }


class SecureCommunicationDemo:
    """Complete secure communication demo using QKD and AES"""
    
    def __init__(self, 
                 qkd_key: List[int],
                 encryption_mode: str = "GCM",
                 key_length: int = 256):
        """
        Initialize secure communication demo
        
        Args:
            qkd_key: QKD-generated key bits
            encryption_mode: AES encryption mode
            key_length: AES key length
        """
        self.qkd_key = qkd_key
        self.aes_integration = QKDAESIntegration(
            aes_mode=encryption_mode,
            key_length=key_length
        )
        self.communication_history = []
        
    def send_secure_message(self, 
                           sender: str, 
                           receiver: str, 
                           message: str) -> Dict:
        """
        Send a secure message using QKD-derived key
        
        Args:
            sender: Name of sender
            receiver: Name of receiver
            message: Message to send
            
        Returns:
            Dictionary with communication details
        """

        encryption_result = self.aes_integration.encrypt_message(message, self.qkd_key)
        

        communication_record = {
            "timestamp": self._get_timestamp(),
            "sender": sender,
            "receiver": receiver,
            "message_type": "encrypted",
            "original_message": message,
            "encrypted_message": encryption_result.encrypted_message,
            "key_used": encryption_result.key_used,
            "encryption_success": encryption_result.encryption_success,
            "security_metrics": encryption_result.security_metrics
        }
        
        self.communication_history.append(communication_record)
        
        return communication_record
    
    def receive_secure_message(self, 
                              encrypted_message: str, 
                              receiver: str) -> Dict:
        """
        Receive and decrypt a secure message
        
        Args:
            encrypted_message: Encrypted message
            receiver: Name of receiver
            
        Returns:
            Dictionary with decryption details
        """
        try:

            decrypted_message = self.aes_integration.decrypt_message(
                encrypted_message, self.qkd_key
            )
            

            communication_record = {
                "timestamp": self._get_timestamp(),
                "sender": "Unknown",
                "receiver": receiver,
                "message_type": "decrypted",
                "encrypted_message": encrypted_message,
                "decrypted_message": decrypted_message,
                "decryption_success": True,
                "key_used": self.aes_integration.derive_aes_key(self.qkd_key)[0].hex()
            }
            
            self.communication_history.append(communication_record)
            
            return communication_record
            
        except Exception as e:

            communication_record = {
                "timestamp": self._get_timestamp(),
                "sender": "Unknown",
                "receiver": receiver,
                "message_type": "failed_decryption",
                "encrypted_message": encrypted_message,
                "decrypted_message": "",
                "decryption_success": False,
                "error": str(e)
            }
            
            self.communication_history.append(communication_record)
            
            return communication_record
    
    def demonstrate_secure_chat(self, 
                               messages: List[Dict]) -> List[Dict]:
        """
        Demonstrate a complete secure chat session
        
        Args:
            messages: List of message dictionaries with 'sender', 'receiver', 'content'
            
        Returns:
            List of communication records
        """
        chat_records = []
        
        for msg in messages:

            send_record = self.send_secure_message(
                msg['sender'], 
                msg['receiver'], 
                msg['content']
            )
            chat_records.append(send_record)
            

            receive_record = self.receive_secure_message(
                send_record['encrypted_message'],
                msg['receiver']
            )
            chat_records.append(receive_record)
        
        return chat_records
    
    def get_communication_statistics(self) -> Dict:
        """Get statistics about the secure communication"""
        if not self.communication_history:
            return {"total_messages": 0}
        
        total_messages = len(self.communication_history)
        successful_encryptions = sum(
            1 for record in self.communication_history 
            if record.get('encryption_success', False)
        )
        successful_decryptions = sum(
            1 for record in self.communication_history 
            if record.get('decryption_success', False)
        )
        

        message_lengths = [
            len(record.get('original_message', '')) 
            for record in self.communication_history
            if record.get('original_message')
        ]
        avg_message_length = sum(message_lengths) / len(message_lengths) if message_lengths else 0
        
        return {
            "total_messages": total_messages,
            "successful_encryptions": successful_encryptions,
            "successful_decryptions": successful_decryptions,
            "encryption_success_rate": successful_encryptions / total_messages,
            "decryption_success_rate": successful_decryptions / total_messages,
            "average_message_length": avg_message_length,
            "qkd_key_length": len(self.qkd_key),
            "aes_mode": self.aes_integration.aes_mode,
            "aes_key_length": self.aes_integration.key_length
        }
    
    def _get_timestamp(self) -> str:
        """Get current timestamp as string"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def export_communication_log(self, filepath: str) -> bool:
        """Export communication history to JSON file"""
        try:
            with open(filepath, 'w') as f:
                json.dump({
                    "qkd_key_length": len(self.qkd_key),
                    "aes_configuration": {
                        "mode": self.aes_integration.aes_mode,
                        "key_length": self.aes_integration.key_length
                    },
                    "communication_history": self.communication_history,
                    "statistics": self.get_communication_statistics()
                }, f, indent=2)
            return True
        except Exception:
            return False



def create_secure_demo(qkd_key: List[int], 
                       encryption_mode: str = "GCM",
                       key_length: int = 256) -> SecureCommunicationDemo:
    """Create secure communication demo instance"""
    return SecureCommunicationDemo(qkd_key, encryption_mode, key_length)
