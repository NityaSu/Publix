export type ProjectStatus = 'shipped' | 'lost' | 'placeholder';

export interface Project {
  id: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  year: string;
  status: ProjectStatus;
  stack: string[];
  images: string[];
  github?: string;
  demo?: string;
}

export const projects: Project[] = [
  {
    id: 'ecommerce',
    title: 'E-commerce Platform',
    tagline: 'End-to-end store built for a real client',
    category: 'Full Stack',
    description:
      'A production e-commerce site with product catalog, cart, and checkout flow. Source code was lost due to a broken laptop, but screenshots and the deployed result remain.',
    year: '2023',
    status: 'lost',
    stack: ['Vue', 'Node.js'],
    images: [
      '/assets/images/projects/ecom1.jpg',
      '/assets/images/projects/ecom2.jpg',
      '/assets/images/projects/ecom3.jpg',
      '/assets/images/projects/ecom4.jpg',
      '/assets/images/projects/ecom5.jpg',
      '/assets/images/projects/ecom6.jpg',
    ],
  },
  {
    id: 'object-detection',
    title: 'Semi-Supervised Object Detection',
    tagline: 'Detection model built from scratch',
    category: 'AI / Computer Vision',
    description:
      'Thesis project implementing a semi-supervised object detector. Includes model architecture, training pipeline, and evaluation results.',
    year: '2024',
    status: 'shipped',
    stack: ['PyTorch', 'Python'],
    images: [
      '/assets/images/projects/od1.jpg',
      '/assets/images/projects/od2.jpg',
      '/assets/images/projects/od3.jpg',
      '/assets/images/projects/od4.jpg',
    ],
    github: 'https://github.com/nityasuon/semi-supervised-object-detection',
  },
  {
    id: 'movie-recommendation',
    title: 'Movie Recommendation System',
    tagline: 'Personalized movie suggestions from user behavior',
    category: 'Machine Learning',
    description:
      'A recommendation engine that learns user preferences to suggest relevant movies. Built around collaborative filtering and content-based signals.',
    year: '2024',
    status: 'shipped',
    stack: ['Python', 'scikit-learn'],
    images: ['/assets/images/projects/recommendation.jpg'],
    github: 'https://github.com/nityasuon/movie-recommendation-system',
  },
  {
    id: 'toxic-detector',
    title: 'Toxic Detector',
    tagline: 'NLP model that flags harmful text',
    category: 'NLP',
    description:
      'A text-classification system trained to detect toxic, abusive, or harmful language in user-generated content.',
    year: '2024',
    status: 'shipped',
    stack: ['Python', 'Transformers'],
    images: [
      '/assets/images/projects/toxic1.jpg',
      '/assets/images/projects/toxic2.jpg',
    ],
    github: 'https://github.com/nityasuon/toxic-detector',
  },
];
