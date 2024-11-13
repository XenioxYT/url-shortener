import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../services/api';
import { CreateLinkResponse } from '../../types';

interface CreateLinkFormProps {
  onClose: () => void;
}

export const CreateLinkForm: React.FC<CreateLinkFormProps> = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation<CreateLinkResponse, Error, string>(
    (originalUrl: string) => linkService.createLink(originalUrl),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['links']);
        setUrl('');
        setError(null);
        onClose();
      },
      onError: (error: any) => {
        console.error('Failed to create link:', error);
        setError(error.response?.data?.error || 'Failed to create link');
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic URL validation
    try {
      new URL(url); // This will throw if URL is invalid
      await createMutation.mutateAsync(url);
    } catch (err) {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>Create New Short Link</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Original URL"
          type="url"
          fullWidth
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={createMutation.isLoading}
          placeholder="https://example.com"
          helperText="Include http:// or https:// in the URL"
          error={!!error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createMutation.isLoading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={createMutation.isLoading}
        >
          {createMutation.isLoading ? (
            <CircularProgress size={24} />
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Box>
  );
};