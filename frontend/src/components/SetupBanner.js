import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Link,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  CloudQueue,
  VpnKey,
  Code,
  CheckCircle,
  OpenInNew,
} from '@mui/icons-material';

const steps = [
  {
    label: 'Create a free JSONBin account',
    icon: <CloudQueue />,
    content: (
      <>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          JSONBin.io is a free cloud JSON storage service. No credit card required.
        </Typography>
        <Link
          href="https://jsonbin.io/signup"
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
        >
          <Button
            variant="outlined"
            color="primary"
            size="small"
            endIcon={<OpenInNew />}
            sx={{ mt: 1 }}
          >
            Create account at jsonbin.io
          </Button>
        </Link>
      </>
    ),
  },
  {
    label: 'Create a Bin and get your keys',
    icon: <VpnKey />,
    content: (
      <>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          After logging in:
        </Typography>
        <Box component="ol" sx={{ pl: 2, mt: 0.5 }}>
          {[
            'Click "Create Bin" and save an empty JSON: {}',
            'Copy the BIN ID from the URL (e.g. 64a1b2c3d4e5f6...)',
            'Go to "API Keys" and create a Master Key',
          ].map((step, i) => (
            <Typography key={i} component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {step}
            </Typography>
          ))}
        </Box>
      </>
    ),
  },
  {
    label: 'Add environment variables',
    icon: <Code />,
    content: (
      <>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Create a <Chip label=".env" size="small" sx={{ fontFamily: 'monospace', mx: 0.5 }} /> file in the project root with:
        </Typography>
        <Box
          sx={{
            backgroundColor: '#1e1e2e',
            borderRadius: 1,
            p: 1.5,
            mt: 1,
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: '#cdd6f4',
            whiteSpace: 'pre',
          }}
        >
          {'REACT_APP_WORKER_URL=https://your-worker.workers.dev'}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          For GitHub Pages, add this variable under Settings → Secrets → Actions.
        </Typography>
      </>
    ),
  },
  {
    label: 'Restart and deploy',
    icon: <CheckCircle />,
    content: (
      <Typography variant="body2" color="text.secondary">
        Run <Chip label="npm start" size="small" sx={{ fontFamily: 'monospace', mx: 0.5 }} /> locally
        or <Chip label="npm run deploy" size="small" sx={{ fontFamily: 'monospace', mx: 0.5 }} /> for GitHub Pages.
        Storify will use JSONBin as its database.
      </Typography>
    ),
  },
];

const SetupBanner = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #f8f9fe 0%, #ffffff 100%)',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 560,
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B7CF8 100%)',
            p: 3,
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CloudQueue sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Configure Storify
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Storify uses JSONBin.io to store files in the cloud — free and without a dedicated server.
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: index <= activeStep ? '#6C63FF' : 'rgba(0,0,0,0.12)',
                        color: index <= activeStep ? 'white' : 'rgba(0,0,0,0.38)',
                        transition: 'all 0.2s ease',
                        '& svg': { fontSize: 16 },
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    {step.content}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setActiveStep((s) => Math.min(s + 1, steps.length - 1))}
                        disabled={index === steps.length - 1}
                      >
                        {index === steps.length - 2 ? 'Finish' : 'Next'}
                      </Button>
                      {index > 0 && (
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => setActiveStep((s) => Math.max(s - 1, 0))}
                        >
                          Back
                        </Button>
                      )}
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>
    </Box>
  );
};

export default SetupBanner;