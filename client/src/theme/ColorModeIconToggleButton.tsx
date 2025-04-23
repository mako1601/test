import DarkModeIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import IconButton, { IconButtonOwnProps } from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

export default function ColorModeToggleButton(props: IconButtonOwnProps) {
  const { mode, setMode } = useColorScheme();

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const icon = mode === 'light' ? <LightModeIcon /> : <DarkModeIcon />;

  return (
    <IconButton
      onClick={toggleMode}
      disableRipple
      size="small"
      aria-label="toggle color mode"
      {...props}
    >
      {icon}
    </IconButton>
  );
}