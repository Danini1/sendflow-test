import { createTheme } from '@mui/material/styles';

export const tokens = {
  background: { default: '#0B0B0D', paper: '#151518' },
  surface: { elevated: '#1D1D22', hover: '#25252B' },
  border: '#303038',
  borderControl: '#6E6E78',
  text: { primary: '#F5F5F5', secondary: '#B5B5BD', disabled: '#85858E' },
  brand: {
    primary: '#F5D000',
    hover: '#FFDF33',
    active: '#DDBB00',
    subtle: 'rgba(245, 208, 0, 0.12)',
    selected: 'rgba(245, 208, 0, 0.2)',
    onBrand: '#171717',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#60A5FA',
  },
} as const;

declare module '@mui/material/styles' {
  interface Palette {
    surface: { elevated: string; hover: string };
    brand: { subtle: string };
  }
  interface PaletteOptions {
    surface?: { elevated: string; hover: string };
    brand?: { subtle: string };
  }
}

const FONT_FAMILY = '"Inter", "Roboto", "Arial", sans-serif';
const FOCUS_RING = `2px solid ${tokens.brand.primary}`;

export const theme = createTheme({
  cssVariables: true,
  defaultColorScheme: 'dark',
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: tokens.brand.primary,
          light: tokens.brand.hover,
          dark: tokens.brand.active,
          contrastText: tokens.brand.onBrand,
        },
        secondary: { main: tokens.text.secondary, contrastText: tokens.brand.onBrand },
        success: { main: tokens.semantic.success, contrastText: tokens.brand.onBrand },
        warning: { main: tokens.semantic.warning, contrastText: tokens.brand.onBrand },
        error: { main: tokens.semantic.error, contrastText: tokens.brand.onBrand },
        info: { main: tokens.semantic.info, contrastText: tokens.brand.onBrand },
        background: tokens.background,
        text: tokens.text,
        divider: tokens.border,
        surface: tokens.surface,
        brand: { subtle: tokens.brand.subtle },
        action: {
          hover: tokens.brand.subtle,
          hoverOpacity: 0.12,
          selected: tokens.brand.selected,
          disabled: tokens.text.disabled,
          disabledBackground: tokens.surface.elevated,
        },
      },
    },
  },
  shape: { borderRadius: 8 },
  transitions: {
    duration: {
      shortest: 120,
      shorter: 150,
      short: 180,
      standard: 200,
      complex: 200,
      enteringScreen: 180,
      leavingScreen: 150,
    },
  },
  typography: {
    fontFamily: FONT_FAMILY,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.25 },
    h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25 },
    h3: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.3 },
    h6: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.3 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.8125rem', lineHeight: 1.4 },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html { color-scheme: dark; }
        a:focus-visible,
        button:focus-visible,
        [role='button']:focus-visible,
        [tabindex]:focus-visible { outline: ${FOCUS_RING}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `,
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': { outline: FOCUS_RING, outlineOffset: 2 },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 40 },
        sizeLarge: { minHeight: 44 },
        contained: {
          '&.MuiButton-colorPrimary:hover': { backgroundColor: tokens.brand.hover },
          '&.MuiButton-colorPrimary:active': { backgroundColor: tokens.brand.active },
          '&.Mui-disabled': {
            backgroundColor: tokens.surface.elevated,
            color: tokens.text.disabled,
          },
        },
        outlined: {
          borderColor: tokens.borderControl,
          '&:hover': { backgroundColor: tokens.brand.subtle, borderColor: tokens.brand.primary },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.border}`,
          borderRadius: 8,
          '&:hover': {
            borderColor: tokens.brand.primary,
            backgroundColor: tokens.brand.subtle,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { fullWidth: true, size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.borderControl },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.text.disabled },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tokens.brand.primary },
        },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiFormHelperText: {
      styleOverrides: { root: { fontSize: '0.8125rem', lineHeight: 1.4 } },
    },
    MuiPaper: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: tokens.background.paper },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: tokens.background.paper, borderColor: tokens.border },
      },
    },
    MuiPopover: {
      styleOverrides: { paper: { backgroundColor: tokens.surface.elevated } },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: { backgroundColor: tokens.surface.elevated },
        root: { '& .MuiIconButton-root': { border: 0 } },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surface.elevated,
          color: tokens.text.primary,
          border: `1px solid ${tokens.border}`,
          fontSize: '0.8125rem',
          fontWeight: 400,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: tokens.border },
        head: {
          color: tokens.text.secondary,
          fontSize: '0.8125rem',
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { '&.MuiTableRow-hover:hover': { backgroundColor: tokens.brand.subtle } },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderColor: tokens.borderControl,
          '&.Mui-selected': {
            backgroundColor: tokens.brand.subtle,
            color: tokens.brand.primary,
            fontWeight: 600,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        filled: { color: tokens.background.default },
        root: { '& .MuiAlert-action .MuiIconButton-root': { border: 0 } },
      },
    },
  },
});
