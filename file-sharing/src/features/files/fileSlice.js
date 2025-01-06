import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CryptoJS from "crypto-js";


const SECRET_KEY = "12345678901234567890123456789012"; // Must match the encryption key
const IV = CryptoJS.enc.Utf8.parse("16bytesiv1234567"); // Same IV as used during encryption

export const decryptFile = (encryptedData) => {
  try {
    console.log("Encrypted Data:", encryptedData);
    // Decode the base64-encoded encrypted data
    const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedData);

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedBytes },
      CryptoJS.enc.Utf8.parse(SECRET_KEY),
      { iv: IV, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );

    // Convert decrypted bytes to UTF-8 string
    const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);

    console.log(decryptedData)

    if (!decryptedData) {
      throw new Error("Decryption failed or produced empty result");
    }

    return decryptedData;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null; // Handle decryption errors
  }
};


// Fetch files list from the API
export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/files/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add the Bearer token
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    const data = await response.json();
    return data.files;
  }
);

// Upload file to the server
export const uploadFile = createAsyncThunk(
  'files/uploadFile',
  async (formData, { getState }) => {
    const token = getState().auth.token;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return response.json();
  }
);

// Share file with a user
export const shareFile = createAsyncThunk(
  'files/shareFile',
  async ({ fileId, data }) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/share/file/${fileId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
);

// Generate a secure link for the file
export const generateSecureLink = createAsyncThunk(
  'files/generateSecureLink',
  async (fileId, { getState }) => {
    const token = getState().auth.token;
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/share_files/generate_secure_link/${fileId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate secure link');
    }

    const data = await response.json();
    console.log(data);
    return data.link;
  }
);

// Download a file
export const downloadFile = createAsyncThunk(
    'files/downloadFile',
    async (fileId, { getState }) => {
      const token = getState().auth.token;
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/files/download/${fileId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to download the file');
      }
  
      // Assuming the response JSON contains `file_content` as hex string
      const data = await response.json();
      const encryptedHex = data.file_content;
      console.log("file content", data.file_content);
  
      try {
        const decryptedFile = decryptFile(encryptedHex);
        const blob = new Blob([decryptedFile], { type: 'application/octet-stream' });
  
        // Trigger file download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decrypted_file.txt'; // Replace with a dynamic file name if needed
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
  
        return fileId; // Optionally return the fileId to update state
      } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt and download file.');
      }
    }
  );
  

const initialState = {
  files: [],
  status: 'idle',
  error: null,
  secureLink: null, // New state to hold the generated secure link
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.files = action.payload; // Set the files to the fetched data
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(uploadFile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.files.push(action.payload); // Assuming the server returns the newly uploaded file
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(shareFile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(shareFile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // handle the successful share action (e.g., update the file list)
      })
      .addCase(shareFile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(generateSecureLink.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(generateSecureLink.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.secureLink = "http://127.0.0.1:8000/auth/share_files" +  action.payload; // Set the generated secure link
      })
      .addCase(generateSecureLink.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(downloadFile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(downloadFile.fulfilled, (state) => {
        state.status = 'succeeded';
        // Handle post-download logic if needed
      })
      .addCase(downloadFile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default fileSlice.reducer;
