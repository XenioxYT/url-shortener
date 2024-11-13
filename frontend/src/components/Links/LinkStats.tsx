import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { linkService } from '../../services/api';

interface LinkStatsProps {
  linkId: number;
}

export const LinkStats: React.FC<LinkStatsProps> = ({ linkId }) => {
  const { data: stats, isLoading } = useQuery(
    ['linkStats', linkId],
    () => linkService.getLinkStats(linkId)
  );

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Link Statistics
      </Typography>
      <Typography>Total Clicks: {stats?.total_clicks}</Typography>
      {/* Add more statistics as needed */}
    </Box>
  );
};