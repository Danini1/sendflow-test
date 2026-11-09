import type { ReactElement } from 'react';
import CableIcon from '@mui/icons-material/Cable';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';

import { ROUTES } from '../../routes/paths';

export type NavItem = {
  label: string;
  to: string;
  icon: ReactElement;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Conexões', to: ROUTES.connections, icon: <CableIcon /> },
  { label: 'Contatos', to: ROUTES.contacts, icon: <PeopleIcon /> },
  { label: 'Mensagens', to: ROUTES.broadcasts, icon: <CampaignIcon /> },
];
