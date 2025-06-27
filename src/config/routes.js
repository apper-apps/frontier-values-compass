import Home from '@/components/pages/Home'
import ValuesElicitationProcess from '@/components/organisms/ValuesElicitationProcess'

export const routes = {
  home: {
    id: 'home',
    label: 'Values Compass',
    path: '/',
    icon: 'Compass',
    component: Home
  },
  questionnaire: {
    id: 'questionnaire',
    label: 'Questionnaire',
    path: '/questionnaire',
    icon: 'MessageSquare',
    component: ValuesElicitationProcess
  }
}

export const routeArray = Object.values(routes)