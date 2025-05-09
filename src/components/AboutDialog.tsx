import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Link,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { cityService } from '../services/CityService';

interface AboutDialogProps {
  open: boolean
  onClose: () => void
}

export default function AboutDialog({ open, onClose }: AboutDialogProps) {
  const totalCities = cityService.getTotalCities();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
          About Worldtimez
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {totalCities.toLocaleString()} cities available in the database. Add more cities by searching with Live Lookup.
          </Typography>
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          '& p': { mb: 2 },
          '& a': { 
            color: 'primary.main', 
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          },
          '& img': { display: 'block', my: 2 }
        }}>
          <Typography paragraph>
            Made with ❤️ by <Link href="https://github.com/ziarahman" target="_blank" rel="noopener">Zia Rahman</Link> + <Link href="https://en.wikipedia.org/wiki/Vibe_coding" target="_blank" rel="noopener">Vibe Coding</Link> with AI 🤖 using <Link href="https://windsurf.ai" target="_blank" rel="noopener">Windsurf</Link> & <Link href="https://github.com/features/copilot" target="_blank" rel="noopener">GitHub Copilot</Link>.
          </Typography>
          <Typography paragraph>
            <Link href="https://github.com/ziarahman/worldtimez/issues" target="_blank" rel="noopener">Issue Tracker in Github</Link>
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
            <Link href="https://github.com/ziarahman/worldtimez" target="_blank" rel="noopener">
              <img src="https://img.shields.io/badge/Open_Source-By_Zia-blue" alt="Open Source by Zia" />
            </Link>
            <Link href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener">
              <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
            </Link>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
