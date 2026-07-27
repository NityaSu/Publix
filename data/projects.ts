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
    id: 'placeholder',
    title: 'Next Project',
    tagline: 'Something new is in the works',
    category: 'TBD',
    description:
      'Reserved for an upcoming project. Currently in research and prototyping phase.',
    year: '2025',
    status: 'placeholder',
    stack: [],
    images: [],
  },
];
