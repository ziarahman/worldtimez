import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef } from 'react'
import { Box, IconButton, Paper, Tooltip, Typography, useTheme } from '@mui/material'
import { DateTime } from 'luxon'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import DeleteIcon from '@mui/icons-material/Delete'

import { Timezone, getTimezoneUniqueId } from '../types'

interface SortableTimezoneRowProps {
  timezone: Timezone
  selectedTime: DateTime
  onTimeSelect: (time: DateTime) => void
  onDelete: (timezone: Timezone) => void
}

// Helper function to format timezone IDs to match IANA format
function formatTimezone(timezone: string): string {
  // First check if it's already a valid IANA timezone
  const validIANA = timezone.match(/^[A-Za-z]+\/[A-Za-z0-9_]+$/);
  if (validIANA) {
    return timezone;
  }

  // Try to match against known continent/city format
  const continentMap = {
    'asia': 'Asia',
    'europe': 'Europe',
    'americas': 'America',
    'africa': 'Africa',
    'oceania': 'Australia'
  };

  // Try to match the city name against known cities
  const knownCities = {
    'dhaka': 'Dhaka',
    'sylhet': 'Dhaka', // Sylhet is in the same timezone as Dhaka
    // Add more known cities as needed
  };

  // Split the timezone into parts
  const parts = timezone.toLowerCase().split('_');
  const continent = parts[0];
  const city = parts[1] || parts[0];

  // Get the proper continent name
  const properContinent = continentMap[continent] || continent.charAt(0).toUpperCase() + continent.slice(1);
  // Get the proper city name
  const properCity = knownCities[city] || city.charAt(0).toUpperCase() + city.slice(1);

  // Return in IANA format
  return `${properContinent}/${properCity}`;
}

export default function SortableTimezoneRow({
  timezone,
  selectedTime,
  onTimeSelect,
  onDelete
}: SortableTimezoneRowProps) {
  const theme = useTheme()
  
  // Reference to the time slider for scrolling
  const sliderRef = useRef<HTMLDivElement>(null)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getTimezoneUniqueId(timezone),
    data: timezone
  })

  // Center the selected time slot when it changes
  useEffect(() => {
    const sliderElement = sliderRef.current
    if (!sliderElement) return

    const selectedElement = sliderElement.querySelector('[data-selected=true]') as HTMLElement
    if (selectedElement) {
      const scrollLeft = selectedElement.offsetLeft - (sliderElement.offsetWidth / 2) + (selectedElement.offsetWidth / 2)
      sliderElement.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [selectedTime])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  }

  // Convert selected time to this timezone
  const localTime = selectedTime.setZone(formatTimezone(timezone.id))
  if (!localTime.isValid) {
    console.error(`Invalid time for timezone ${timezone.id}:`, localTime.invalidReason)
    return null
  }
  const currentDate = localTime.toFormat('ccc, MMM d')
  
  // Generate time slots centered around the selected time
  const baseTime = selectedTime.setZone(formatTimezone(timezone.id))
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    // Calculate offset from current hour (-12 to +11) with 30-minute intervals
    const halfHourOffset = i - 24
    const hourOffset = Math.floor(halfHourOffset / 2)
    const isHalfHour = halfHourOffset % 2 !== 0
    
    // Get the time for this slot in the target timezone
    const slotTime = baseTime
      .plus({ hours: hourOffset })
      .plus({ minutes: isHalfHour ? 30 : 0 })
    
    if (!slotTime.isValid) {
      console.error(`Invalid time for timezone ${timezone.id}:`, { slotTime, hourOffset, invalidReason: slotTime.invalidReason })
      return null
    }
    
    return {
      hour: slotTime.hour,
      minute: slotTime.minute,
      period: slotTime.toFormat('a'),
      dateTime: slotTime,
      isSelected: halfHourOffset === 0,
      key: `${slotTime.toFormat('HH:mm')}-${halfHourOffset}`
    }
  }).filter((slot): slot is NonNullable<typeof slot> => slot !== null)

  return (
    <Paper 
      ref={setNodeRef}
      style={style}
      variant="outlined" 
      sx={{ 
        py: 0.5,
        px: 1,
        borderRadius: 1,
        background: theme.palette.background.paper,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 0.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="small"
            {...attributes}
            {...listeners}
            sx={{ mr: 1, cursor: 'grab' }}
          >
            <Tooltip title="Drag to reorder">
              <DragIndicatorIcon fontSize="small" />
            </Tooltip>
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              {`${timezone.country}/${timezone.city}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (UTC{timezone.offset >= 0 ? '+' : '-'}
              {Math.floor(Math.abs(timezone.offset) / 60).toString().padStart(2, '0')}:
              {(Math.abs(timezone.offset) % 60).toString().padStart(2, '0')})
            </Typography>
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5,
          ml: 1
        }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {currentDate}
          </Typography>
          <Tooltip title="Remove timezone">
            <IconButton 
              size="small" 
              onClick={() => onDelete(timezone)}
              sx={{ p: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box
        ref={sliderRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 0.5,
          py: 0.5,
          px: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          msOverflowStyle: 'none',
          scrollBehavior: 'smooth',
          position: 'relative',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: '50%',
            height: '1px',
            pointerEvents: 'none'
          }
        }}
      >
        {timeSlots.map((slot) => (
          <Box
            key={slot.key}
            data-selected={slot.isSelected}
            onClick={() => onTimeSelect(slot.dateTime)}
          >
            <Tooltip 
              title={`Select ${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')} ${slot.period}`}
              placement="top"
            >
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  bgcolor: slot.isSelected ? 'primary.main' : 'transparent',
                  color: slot.isSelected ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: slot.isSelected 
                      ? 'primary.dark' 
                      : theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                {slot.hour.toString().padStart(2, '0')}:{slot.minute.toString().padStart(2, '0')} {slot.period}
              </Box>
            </Tooltip>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
