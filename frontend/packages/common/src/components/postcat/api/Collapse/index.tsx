
import { AccordionDetails, Chip, Stack, Typography, useTheme } from '@mui/material'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import { useState, type ReactNode } from 'react'
import { Icon } from '../Icon'
import { styled } from '@mui/material/styles';

export interface CollapseProps {
  children: ReactNode
  title: string
  tag?: string
  key?:string
}

export function Collapse({ children, title, tag,key }: CollapseProps): JSX.Element {
  const [expanded, setExpanded] = useState<boolean>(true)

  const theme = useTheme()

  const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    border: `1px solid #EDEDED`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&::before': {
      display: 'none',
    },
  }));

  
const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
      expandIcon={<Icon mx={0} px={0} name="down" />}
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .05)'
        : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(180deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
      ' .MuiTypography-root':{
        fontWeight:'bold'
      }
    },
  }));

  return (
    <Accordion
      square
      expanded={expanded}
      elevation={2}
      defaultExpanded
      key={key}
      sx={{
        borderRadius: '4px',
        '&::before': {
          display: 'none'
        },
        border:`1px solid #EDEDED`,
        borderBottom:`1px solid #EDEDED !important`,
        boxShadow:0,
        marginBottom:'12px'
      }}
    >
      <AccordionSummary
        sx={{
          backgroundColor: theme.palette.grey[100],
          height: '40px',
          minHeight: '40px',
          background:'#f7f8fa',
          borderRadius: '4px 4px 0 0',
          borderBottom: `1px solid ${expanded ? '#EDEDED':'transparent'}`,
          '&.Mui-expanded': {
            minHeight: '40px',
            '.MuiTypography-root.MuiTypography-body1':{
              marginLeft:'8px'
            }
          },
          '& .MuiAccordionSummary-content.Mui-expanded': {
            margin: 0
          }
        }}
        expandIcon={<Icon mx={0} px={0} name="down" />}
        aria-controls={`${title}-panel-content`}
        id={`${title}-panel-header`}
        onClick={(): void => setExpanded(!expanded)}
      >
        <Stack spacing={1} direction="row" alignItems="center">
          <Typography sx={{fontSize:'14px'}}>{title}</Typography>
          {tag ? <Chip label={tag} variant="filled" 
            sx={{
              height:'22px',
              // borderRadius: '4px',
            }}/> : null}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0 }}>{children}</AccordionDetails>
    </Accordion>
  )
}
