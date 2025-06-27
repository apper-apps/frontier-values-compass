import Home from '@/components/pages/Home'

export const routes = {
  home: {
    id: 'home',
    label: 'Values Compass',
    path: '/',
    icon: 'Compass',
    component: Home
  }
}

export const routeArray = Object.values(routes)