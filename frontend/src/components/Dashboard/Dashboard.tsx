import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { linkService } from '../../services/api';
import { LinkTable } from '../Links/LinkTable';
import { ShortLink } from '../../types';

export const Dashboard: React.FC = () => {
  const { data: links } = useQuery<ShortLink[]>(['links'], linkService.getLinks);

  const totalClicks = links?.reduce((sum, link) => sum + link.clicks, 0) || 0;
  const activeLinks = links?.filter(link => link.isActive).length || 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Clicks
            </Typography>
            <Typography component="p" variant="h4">
              {totalClicks}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Active Links
            </Typography>
            <Typography component="p" variant="h4">
              {activeLinks}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Links
            </Typography>
            <Typography component="p" variant="h4">
              {links?.length || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Clicks Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Click History
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={links}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="createdAt" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Links Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <LinkTable />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};