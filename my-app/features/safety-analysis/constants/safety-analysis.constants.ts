import { SafetyAnalysisData } from '../types/safety-analysis.types';

export const DEMO_SAFETY_DATA: SafetyAnalysisData = {
  overallScore: 78,
  status: 'Good',
  isDemoData: true,
  categories: [
    { id: 'c1', title: 'Lifestyle Safety', score: 75, color: '#12B76A' }, // Green
    { id: 'c2', title: 'Travel Safety', score: 82, color: '#2E90FA' },    // Blue
    { id: 'c3', title: 'Home Safety', score: 70, color: '#F79009' },      // Orange
    { id: 'c4', title: 'Digital Safety', score: 85, color: '#F04470' },   // Pink
  ],
  risks: [
    {
      id: 'r1',
      title: 'Night Travel',
      description: 'Sometimes you travel late at night',
      risk: 'Medium Risk',
      percentage: 60,
      iconName: 'triangle-alert',
      themeColor: '#F2ECFF', // Light purple
      progressColor: '#F79009', // Orange
    },
    {
      id: 'r2',
      title: 'Crowded Places',
      description: 'You visit crowded places frequently',
      risk: 'Low Risk',
      percentage: 30,
      iconName: 'lightbulb',
      themeColor: '#FFF4E5', // Light orange
      progressColor: '#12B76A', // Green
    },
    {
      id: 'r3',
      title: 'Home Security',
      description: 'Improve your home safety setup',
      risk: 'Medium Risk',
      percentage: 55,
      iconName: 'house',
      themeColor: '#FDEBF1', // Light pink
      progressColor: '#F79009', // Orange
    },
    {
      id: 'r4',
      title: 'Digital Behavior',
      description: 'You follow good digital safety habits',
      risk: 'Low Risk',
      percentage: 25,
      iconName: 'lock-keyhole',
      themeColor: '#EAF4FF', // Light blue
      progressColor: '#12B76A', // Green
    }
  ],
  recommendations: [
    {
      id: 'rec1',
      title: 'Avoid Late Night Travel',
      description: 'Try to avoid traveling alone after 10 PM.',
      iconName: 'moon-star',
      themeColor: '#7138E8', // Purple
      buttonText: 'View Tips',
      actionType: 'view_tips'
    },
    {
      id: 'rec2',
      title: 'Choose Safer Routes',
      description: 'Use safe routes and well-lit areas.',
      iconName: 'users',
      themeColor: '#F79009', // Orange
      buttonText: 'Plan Route',
      actionType: 'plan_route'
    },
    {
      id: 'rec3',
      title: 'Enable Safety Timer',
      description: "Use safety timer when you're in risky situations.",
      iconName: 'bell',
      themeColor: '#F04470', // Pink
      buttonText: 'Start Timer',
      actionType: 'start_timer'
    },
    {
      id: 'rec4',
      title: 'Share Live Location',
      description: 'Share your live location with trusted contacts.',
      iconName: 'map-pin',
      themeColor: '#12B76A', // Green
      buttonText: 'Share Now',
      actionType: 'share_now'
    }
  ]
};
