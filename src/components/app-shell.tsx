import { AppShell, Burger, Grid, Title, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'preact/hooks';

import classes from './app-shell.module.css';
import { ItemsView } from './item-view.tsx';
import { MostCarriedView } from './most-carried-view.tsx';

const RotationsView = () => <div>Rotations content</div>;
const CalendarView = () => <div>Calendar Stats content</div>;

const viewComponents: Record<string, React.ReactNode> = {
  Items: <ItemsView />,
  Calendar: <CalendarView />,
  Rotations: <RotationsView />,
  'Most Carried': <MostCarriedView />,
};

const menuItems = Object.keys(viewComponents);

export const CarryTrackerAppShell = () => {
  const [navbarOpened, { toggle: toggleNavBar }] = useDisclosure(false);
  const [activeLink, setActiveLink] = useState('Items');

  const navBarItems = menuItems.map((menuItem) => (
    <button
      className={classes.link}
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
        collapsed: { mobile: !navbarOpened, desktop: !navbarOpened },
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

          <Grid.Col span={1.5} />
        </Grid>
      </AppShell.Header>
      <AppShell.Navbar p="md">{navBarItems}</AppShell.Navbar>
      <AppShell.Main>
        <ScrollArea
          style={{
            height: 'calc(100dvh - var(--mantine-header-height, 0px) - 60px)',
          }}
          px="md"
          pb="lg"
          scrollbarSize={8}
          scrollbars="y"
        >
          {viewComponents[activeLink]}
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
};
