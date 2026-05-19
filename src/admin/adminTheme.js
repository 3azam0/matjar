import { deepmerge } from '@mui/utils';
import { defaultTheme } from 'react-admin';

const gold = {
  main: '#b38e4d',
  light: '#d4bc8d',
  dark: '#8b672b',
  contrastText: '#fff',
};

const buttonBase = {
  borderRadius: '999px',
  fontWeight: 700,
  fontSize: '0.875rem',
  textTransform: 'none',
  boxShadow: 'none',
  padding: '0.5rem 1.25rem',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
};

/** Sahar Alsharq admin theme — gold add/save, soft back/cancel buttons */
export const saharAdminTheme = deepmerge(defaultTheme, {
  palette: {
    primary: gold,
    background: {
      default: '#f7f4ef',
    },
  },
  components: {
    RaToolbar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, #fffbf6 0%, #f5efe6 100%)',
          borderTop: '1px solid rgba(179, 142, 77, 0.2)',
          padding: '12px 16px',
          gap: '10px',
          flexWrap: 'wrap',
        },
      },
    },
    RaCreateButton: {
      styleOverrides: {
        root: {
          ...buttonBase,
          background: 'linear-gradient(135deg, #c9a227 0%, #b38e4d 55%, #8b672b 100%)',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(179, 142, 77, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d4b030 0%, #c9a227 50%, #9a7530 100%)',
            boxShadow: '0 6px 18px rgba(179, 142, 77, 0.45)',
            transform: 'translateY(-1px)',
          },
        },
        floating: {
          background: 'linear-gradient(135deg, #c9a227 0%, #b38e4d 100%)',
          color: '#fff',
        },
      },
    },
    RaSaveButton: {
      styleOverrides: {
        root: {
          ...buttonBase,
          background: 'linear-gradient(135deg, #c9a227 0%, #b38e4d 55%, #8b672b 100%)',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(179, 142, 77, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d4b030 0%, #c9a227 50%, #9a7530 100%)',
            boxShadow: '0 6px 18px rgba(179, 142, 77, 0.45)',
            transform: 'translateY(-1px)',
          },
          '&.Mui-disabled': {
            background: '#e0d5c4',
            color: '#9a8f82',
          },
        },
      },
    },
    RaEditButton: {
      styleOverrides: {
        root: {
          ...buttonBase,
          background: '#fff',
          color: '#8b672b',
          border: '1px solid rgba(179, 142, 77, 0.45)',
          padding: '0.35rem 0.9rem',
          minWidth: 'auto',
          '&:hover': {
            background: 'rgba(179, 142, 77, 0.12)',
            borderColor: '#b38e4d',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    RaDeleteButton: {
      styleOverrides: {
        root: {
          ...buttonBase,
          background: 'transparent',
          color: '#b54a4a',
          border: '1px solid rgba(181, 74, 74, 0.35)',
          '&:hover': {
            background: 'rgba(181, 74, 74, 0.08)',
            borderColor: '#b54a4a',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '999px',
          fontWeight: 600,
        },
      },
    },
  },
});
