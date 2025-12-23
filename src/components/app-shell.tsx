import { AppShell, Box, Burger, Grid, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';

import classes from './app-shell.module.css';
import { CarryStatsView } from './carry-stats-view.tsx';
import { ImportExportView } from './import-export-view.tsx';
import { ItemsView } from './item-view.tsx';
import { RotationsView } from './rotations-view.tsx';
import { TimelineView } from './timeline-view.tsx';

const viewComponents: Record<string, React.ReactNode> = {
  Items: <ItemsView />,
  'Carry Stats': <CarryStatsView />,
  Rotations: <RotationsView />,
  'Rotation Timeline': <TimelineView />,
  'Import/Export': <ImportExportView />
};

const menuItems = Object.keys(viewComponents);

export const CarryTrackerAppShell = () => {
  const [navbarOpened, { toggle: toggleNavBar }] = useDisclosure(false);
  const [activeLink, setActiveLink] = useState('Items');

  const navBarItems = menuItems.map((menuItem) => (
    <button
      className={classes.navButton}
      data-active={activeLink === menuItem || undefined}
      onClick={(event) => {
        event.preventDefault();
        setActiveLink(menuItem);
        toggleNavBar();
      }}
      key={menuItem}
    >
      {menuItem}
    </button>
  ));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !navbarOpened, desktop: !navbarOpened }
      }}
    >
      <AppShell.Header>
        <Grid align="center" p="sm">
          <Grid.Col span={1.5}>
            <Burger
              aria-label={navbarOpened ? 'Close menu' : 'Open menu'}
              opened={navbarOpened}
              onClick={toggleNavBar}
              size="sm"
            />
          </Grid.Col>

          <Grid.Col span="auto">
            <Title order={2} ta="center">
              Carry Tracker
            </Title>
          </Grid.Col>

          <Grid.Col span={1.5}>
            <Box
              component="a"
              href="https://github.com/thenick775/carry-tracker"
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
              display="flex"
              h="100%"
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <FaGithub size={28} color="#fff" />
            </Box>
          </Grid.Col>
        </Grid>
      </AppShell.Header>
      <AppShell.Navbar p="md">{navBarItems}</AppShell.Navbar>
      <AppShell.Main px="md">{viewComponents[activeLink]}</AppShell.Main>
    </AppShell>
  );
};
