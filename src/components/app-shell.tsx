import { AppShell, Box, Burger, Grid, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'preact/hooks';
import { FaGithub } from 'react-icons/fa';

import classes from './app-shell.module.css';
import { ImportExportView } from './import-export-view.tsx';
import { ItemsView } from './item-view.tsx';
import { MostCarriedView } from './most-carried-view.tsx';
import { RotationsView } from './rotations-view.tsx';
import { TimelineView } from './timeline-view.tsx';

const viewComponents: Record<string, React.ReactNode> = {
  Items: <ItemsView />,
  Rotations: <RotationsView />,
  'Rotation Timeline': <TimelineView />,
  'Most Carried': <MostCarriedView />,
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
      padding="md"
    >
      <AppShell.Header p="sm">
        <Grid align="center">
          <Grid.Col span={1.5}>
            <Burger opened={navbarOpened} onClick={toggleNavBar} size="sm" />
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
      <AppShell.Main>{viewComponents[activeLink]}</AppShell.Main>
    </AppShell>
  );
};
