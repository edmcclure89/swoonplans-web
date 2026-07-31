export type GalleryCategory = 'all' | 'editorial' | 'intimate' | 'destination' | 'monochrome';

export interface PhotoItem {
  id: string;
  title: string;
  location: string;
  year: string;
  imageUrl: string;
  aspectRatio: 'portrait' | 'landscape' | 'square' | 'wide';
  category: GalleryCategory;
  filmSpecs?: {
    camera?: string;
    filmStock?: string;
    lens?: string;
  };
  featuredIn?: string;
  storyId?: string;
  caption?: string;
}


