import { Box, Typography, useTheme } from '@mui/material'

export function HeaderPreview({ data }: { data: { key: string; value: string }[] }) {
  const theme = useTheme()

  return (
    <Box py={1} px={2} display="flex" flexDirection="column" gap={2.5}>
      {data.map((row) => (
        <Box display="flex" key={`${row.key}-${row.value}`}>
          <Box display="block" width="200px">
            <Typography sx={{ color: theme.palette.grey[600] }} fontSize="14px">
              {row.key}
            </Typography>
          </Box>
          <Box display="block" width="100%">
            <Typography fontSize="14px">{row.value}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
