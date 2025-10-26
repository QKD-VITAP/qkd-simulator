"""
Secure Messaging Service for QKD Simulator
Provides real secure messaging using quantum-generated keys and AES encryption
"""

import time
import random
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

from .aes_integration import QKDAESIntegration, create_secure_demo


@dataclass
class SecureMessage:
    """Represents a secure message"""
    message_id: str
    sender_id: str
    receiver_id: str
    original_message: str
    encrypted_message: str
    timestamp: float
    key_used: str
    status: str  # 'sent', 'delivered', 'read'
    security_metrics: Dict


class SecureMessagingService:
    """Service for secure messaging using quantum keys"""
    
    def __init__(self, simulator):
        """
        Initialize secure messaging service
        
        Args:
            simulator: QKDSimulator instance for key generation
        """
        self.simulator = simulator
        self.messages: Dict[str, SecureMessage] = {}
        self.aes_service = QKDAESIntegration()
        self.message_counter = 0
        
    def send_secure_message(self, sender_id: str, receiver_id: str, message: str, 
                           encryption_mode: str = "GCM", key_length: int = 256) -> Dict:
        """
        Send a secure message using quantum keys
        
        Args:
            sender_id: ID of the sender
            receiver_id: ID of the receiver
            message: Message content to send
            encryption_mode: AES encryption mode
            key_length: AES key length
            
        Returns:
            Dictionary with message details and status
        """
        try:
            sender_key_data = self.simulator.get_user_quantum_key(sender_id)
            if not sender_key_data:
                key_result = self.simulator.generate_quantum_key_for_user(sender_id, key_length)
                if not key_result.get('success', False):
                    return {
                        'success': False,
                        'error': f'Failed to generate quantum key: {key_result.get("error", "Unknown error")}'
                    }
                sender_key_data = self.simulator.get_user_quantum_key(sender_id)
            
            receiver_key_data = self.simulator.get_user_quantum_key(receiver_id)
            if not receiver_key_data:
                key_result = self.simulator.generate_quantum_key_for_user(receiver_id, key_length)
                if not key_result.get('success', False):
                    return {
                        'success': False,
                        'error': f'Failed to generate quantum key for receiver: {key_result.get("error", "Unknown error")}'
                    }
                receiver_key_data = self.simulator.get_user_quantum_key(receiver_id)
            
            if sender_key_data.get('is_shared', False) and sender_key_data.get('shared_with') == receiver_id:
                quantum_key = sender_key_data['key']
            elif receiver_key_data.get('is_shared', False) and receiver_key_data.get('shared_with') == sender_id:
                quantum_key = receiver_key_data['key']
            else:
                shared_key_result = self.simulator.generate_shared_quantum_key(sender_id, receiver_id, key_length)
                if not shared_key_result.get('success', False):
                    return {
                        'success': False,
                        'error': f'Failed to generate shared quantum key: {shared_key_result.get("error", "Unknown error")}'
                    }
                quantum_key = self.simulator.get_user_quantum_key(sender_id)['key']
            
            quantum_key_bits = [int(bit) for bit in quantum_key]
            
            encryption_result = self.aes_service.encrypt_message(message, quantum_key_bits)
            
            if not encryption_result.encryption_success:
                return {
                    'success': False,
                    'error': 'Message encryption failed'
                }
            
            self.message_counter += 1
            message_id = f"msg_{int(time.time())}_{self.message_counter}"
            
            secure_message = SecureMessage(
                message_id=message_id,
                sender_id=sender_id,
                receiver_id=receiver_id,
                original_message=message,
                encrypted_message=encryption_result.encrypted_message,
                timestamp=time.time(),
                key_used=encryption_result.key_used,
                status='sent',
                security_metrics=encryption_result.security_metrics
            )
            
            self.messages[message_id] = secure_message
            
            return {
                'success': True,
                'message_id': message_id,
                'status': 'sent',
                'encrypted_message': encryption_result.encrypted_message,
                'security_metrics': encryption_result.security_metrics,
                'timestamp': secure_message.timestamp,
                'key_info': {
                    'key_length': len(quantum_key),
                    'key_source': 'quantum_generated',
                    'security_level': sender_key_data.get('security_level', 0.95)
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to send message: {str(e)}'
            }
    
    def receive_secure_message(self, receiver_id: str, message_id: str) -> Dict:
        """
        Receive and decrypt a secure message
        
        Args:
            receiver_id: ID of the receiver
            message_id: ID of the message to receive
            
        Returns:
            Dictionary with decrypted message and details
        """
        try:
            if message_id not in self.messages:
                return {
                    'success': False,
                    'error': 'Message not found'
                }
            
            message_data = self.messages[message_id]
            
            if message_data.receiver_id != receiver_id:
                return {
                    'success': False,
                    'error': 'Unauthorized access to message'
                }
            
            receiver_key_data = self.simulator.get_user_quantum_key(receiver_id)
            if not receiver_key_data:
                return {
                    'success': False,
                    'error': 'No valid quantum key found for receiver'
                }
            
            try:
                receiver_key_bits = [int(bit) for bit in receiver_key_data['key']]
                
                decrypted_message = self.aes_service.decrypt_message(
                    message_data.encrypted_message,
                    receiver_key_bits
                )
                
                message_data.status = 'delivered'
                
                return {
                    'success': True,
                    'message_id': message_id,
                    'sender_id': message_data.sender_id,
                    'decrypted_message': decrypted_message,
                    'timestamp': message_data.timestamp,
                    'status': 'delivered',
                    'security_metrics': message_data.security_metrics
                }
                
            except Exception as e:
                return {
                    'success': False,
                    'error': f'Message decryption failed: {str(e)}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to receive message: {str(e)}'
            }
    
    def get_user_messages(self, user_id: str, message_type: str = "all") -> List[Dict]:
        """
        Get messages for a specific user
        
        Args:
            user_id: ID of the user
            message_type: Type of messages ('sent', 'received', 'all')
            
        Returns:
            List of message summaries
        """
        user_messages = []
        
        for message in self.messages.values():
            if message_type == "all" or (
                (message_type == "sent" and message.sender_id == user_id) or
                (message_type == "received" and message.receiver_id == user_id)
            ):
                user_messages.append({
                    'message_id': message.message_id,
                    'sender_id': message.sender_id,
                    'receiver_id': message.receiver_id,
                    'timestamp': message.timestamp,
                    'status': message.status,
                    'message_preview': message.original_message[:50] + "..." if len(message.original_message) > 50 else message.original_message
                })
        
        user_messages.sort(key=lambda x: x['timestamp'], reverse=True)
        return user_messages
    
    def get_message_details(self, message_id: str, user_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific message
        
        Args:
            message_id: ID of the message
            user_id: ID of the user requesting details
            
        Returns:
            Message details if authorized, None otherwise
        """
        if message_id not in self.messages:
            return None
        
        message = self.messages[message_id]
        
        if message.sender_id != user_id and message.receiver_id != user_id:
            return None
        
        return {
            'message_id': message.message_id,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'timestamp': message.timestamp,
            'status': message.status,
            'security_metrics': message.security_metrics,
            'key_info': {
                'key_used': message.key_used[:20] + "..." if len(message.key_used) > 20 else message.key_used,
                'encryption_method': 'AES-256 with quantum-derived key'
            }
        }
    
    def get_messaging_statistics(self) -> Dict:
        """Get statistics about the messaging service"""
        total_messages = len(self.messages)
        sent_messages = sum(1 for msg in self.messages.values() if msg.status == 'sent')
        delivered_messages = sum(1 for msg in self.messages.values() if msg.status == 'delivered')
        
        if total_messages > 0:
            avg_message_length = sum(len(msg.original_message) for msg in self.messages.values()) / total_messages
        else:
            avg_message_length = 0
        
        return {
            'total_messages': total_messages,
            'sent_messages': sent_messages,
            'delivered_messages': delivered_messages,
            'average_message_length': round(avg_message_length, 2),
            'active_users': len(set(msg.sender_id for msg in self.messages.values()) | 
                             set(msg.receiver_id for msg in self.messages.values()))
        }
    
    def clear_expired_messages(self, max_age_hours: int = 24) -> int:
        """
        Clear messages older than specified age
        
        Args:
            max_age_hours: Maximum age in hours
            
        Returns:
            Number of messages cleared
        """
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        expired_messages = [
            msg_id for msg_id, message in self.messages.items()
            if current_time - message.timestamp > max_age_seconds
        ]
        
        for msg_id in expired_messages:
            del self.messages[msg_id]
        
        return len(expired_messages)


def create_secure_messaging_service(simulator) -> SecureMessagingService:
    """Create a secure messaging service instance"""
    return SecureMessagingService(simulator)
