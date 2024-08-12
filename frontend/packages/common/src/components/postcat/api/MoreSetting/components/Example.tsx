import { Box, Typography, useTheme } from '@mui/material'
import {Codebox} from "../../Codebox";

interface ExampleProps {
  code: string
  onChange?: (code: string) => void
  readOnly?: boolean
}

export function Example({ code, onChange, readOnly = false }: ExampleProps) {

  const theme = useTheme()
  return (
    <Box  sx={{
      border: `1px solid #EDEDED`,
      borderRadius: `${theme.shape.borderRadius}px`,
      overflow: 'hidden'
    }}>
      <Box
        height="40px"
        width="100%"
        display="flex"
        alignItems="center"
        bgcolor='#f7f8fa'
        sx={{
          borderBottom: `1px solid #EDEDED`,
          borderRadius: `${theme.shape.borderRadius}px`,
          overflow: 'hidden'
        }}
      >
        <Typography fontSize={14} px={'12px'}>
          示例
        </Typography>
      </Box>
      <Codebox
        options={{ language: 'json' }}
        height={'100px'}
        width="100%"
        value={code}
        onChange={onChange}
        readOnly={readOnly}
      />
    </Box>
  )
}
