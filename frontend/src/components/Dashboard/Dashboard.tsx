import React, { useState, useMemo } from 'react';
import { Container, Grid, Paper, Typography, Box, Select, MenuItem } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { linkService } from '../../services/api';
import { LinkTable } from '../Links/LinkTable';
import { ShortLink, ClickEvent } from '../../types';
import { TimeUnit, aggregateClicksByTime, timeUnitFormats } from '../../utils/analytics';

export const Dashboard: React.FC = () => {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('minutes');
  const { data: links } = useQuery<ShortLink[]>(['links'], linkService.getLinks);
  const { data: clickEvents } = useQuery<ClickEvent[]>(['clicks'], linkService.getAllClicks);

  const chartData = useMemo(() => {
    if (!clickEvents) return [];
    return aggregateClicksByTime(clickEvents, timeUnit);
  }, [clickEvents, timeUnit]);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" color="primary">
                Total Clicks Over Time
              </Typography>
              <Select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
              >
                <MenuItem value="minutes">Minutes</MenuItem>
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
                <MenuItem value="weeks">Weeks</MenuItem>
              </Select>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(time) => format(new Date(time), timeUnitFormats[timeUnit])}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(time) => format(new Date(time), 'PPpp')}
                />
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