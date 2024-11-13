import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Button,
  Dialog,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../../services/api';
import { LinkStats } from './LinkStats';
import { CreateLinkForm } from './CreateLinkForm';
import { ShortLink } from '../../types';

export const LinkTable: React.FC = () => {
  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: links } = useQuery<ShortLink[]>(['links'], linkService.getLinks);

  const toggleMutation = useMutation(
    (id: number) => linkService.toggleLink(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['links']);
      },
    }
  );

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsCreateModalOpen(true)}
        sx={{ mb: 2 }}
      >
        Create New Link
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Short URL</TableCell>
            <TableCell>Original URL</TableCell>
            <TableCell>Clicks</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {links?.map((link: ShortLink) => (
            <TableRow key={link.id}>
              <TableCell>
                <a href={`http://localhost:8083/${link.shortCode}`} target="_blank" rel="noopener noreferrer">
                  {link.shortCode}
                </a>
              </TableCell>
              <TableCell>{link.originalUrl}</TableCell>
              <TableCell>{link.clicks}</TableCell>
              <TableCell>
                <Switch
                  checked={link.isActive}
                  onChange={() => toggleMutation.mutate(link.id)}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => setSelectedLinkId(link.id)}>
                  <InfoIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={selectedLinkId !== null}
        onClose={() => setSelectedLinkId(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedLinkId && <LinkStats linkId={selectedLinkId} />}
      </Dialog>

      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <CreateLinkForm onClose={() => setIsCreateModalOpen(false)} />
      </Dialog>
    </>
  );
};