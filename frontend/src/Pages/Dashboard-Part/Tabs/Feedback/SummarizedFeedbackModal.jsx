// <-------v1.0.1-----Venkatesh----------------SummarizedFeedbackModal.jsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Chip,
  Box,
  Stack,
} from '@mui/material';

import { StarIcon, DownloadIcon, X } from 'lucide-react';

// Helper: Generate star icons for rating
const getStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <StarIcon
        key={i}
        size={20}
        style={{
          color: i <= rating ? '#facc15' : '#d1d5db',
          fill: i <= rating ? '#facc15' : 'none',
        }}
      />
    );
  }
  return stars;
};

const getBadgeColor = (recommendation) => {
  switch (recommendation) {
    case 'Yes':
      return 'success';
    case 'No':
      return 'error';
    default:
      return 'default';
  }
};

const SummarizedFeedbackModal = ({ open, onClose, data }) => {
  if (!data) return null;

  const {
    candidate_name,
    candidate_job_title,
    overall_impression,
    recommendation,
    skills = [],
  } = data;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Summary for {candidate_name}
        <IconButton onClick={onClose}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          {candidate_job_title}
        </Typography>

        {/* Overall Impression */}
        <Box mb={3}>
          <Typography variant="h6">Overall Impression</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {overall_impression}
          </Typography>
        </Box>

        {/* Skills */}
        <Box mb={3}>
          <Typography variant="h6">Skill Ratings</Typography>
          <Stack spacing={1} mt={1}>
            {skills.map((skill, index) => (
              <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {skill.name}
                </Typography>
                <Box display="flex" gap={0.5}>{getStars(skill.rating)}</Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Recommendation */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">Recommendation:</Typography>
          <Chip
            label={recommendation}
            color={getBadgeColor(recommendation)}
            sx={{ fontWeight: 500, fontSize: '0.85rem' }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose} sx={{ color: '#227a8a', borderColor: '#227a8a' }}>
          Close
        </Button>
        <Button variant="contained" onClick={() => window.print()} startIcon={<DownloadIcon size={18} />} sx={{ backgroundColor: '#227a8a', '&:hover': { backgroundColor: '#1e6a78' } }}>
          Export to PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SummarizedFeedbackModal;
//-----v1.0.0------->