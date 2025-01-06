from Crypto.Cipher import AES
from Crypto.Util.Padding import  unpad
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

# Use 32-byte key for AES-256
SECRET_KEY = b'12345678901234567890123456789012'  # 32-byte key

def encrypt_file(data: bytes) -> bytes:
    # Pad data to ensure it's a multiple of block size
    
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data) + padder.finalize()  # No need to encode data, it's already in bytes
    # Initialize AES cipher
    iv = b'16bytesiv1234567'  # 16-byte initialization vector
    try:
        cipher = Cipher(algorithms.AES(SECRET_KEY), modes.CBC(iv), backend=default_backend())
    except Exception as e:
        print(f"Error initializing Cipher: {e}")
    
    encryptor = cipher.encryptor()
    
    # Encrypt the data
    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
    print("inside encrypt_file", encrypted_data)
    
    # Return the encrypted data as a base64 encoded string
    return base64.b64encode(encrypted_data).decode('utf-8') 


def decrypt_file(encrypted_data: str) -> bytes:
    # Decode the base64 encoded encrypted data
    encrypted_data_bytes = base64.b64decode(encrypted_data)
    
    # Initialize AES cipher
    iv = b'16bytesiv1234567'  # 16-byte initialization vector
    try:
        cipher = Cipher(algorithms.AES(SECRET_KEY), modes.CBC(iv), backend=default_backend())
    except Exception as e:
        print(f"Error initializing Cipher: {e}")
    
    decryptor = cipher.decryptor()
    
    # Decrypt the data
    padded_data = decryptor.update(encrypted_data_bytes) + decryptor.finalize()
    
    # Unpad the data to retrieve the original
    unpadder = padding.PKCS7(128).unpadder()
    data = unpadder.update(padded_data) + unpadder.finalize()
    
    return data