export type Category = 'Newborn' | 'Onesies' | 'Sets' | 'Sleepwear' | 'Accessories'

export type ProductColor = {
  name: string
  images: string[]
}

export type ImagePosition = {
  x: number // Percentage: 0-100
  y: number // Percentage: 0-100
}

export type Product = {
  id: string
  name: string
  price: number
  category: Category
  description: string
  colors: string[] | ProductColor[] // Support both old format (string[]) and new format (ProductColor[])
  sizes: string[]
  image: string
  imagePosition?: ImagePosition
  badges?: string[]
  stock?: Record<string, number> // Stock per size-color combination
  order?: number // Display order
  createdAt?: string
  updatedAt?: string
}

export const categories: { key: Category; color: string; bg: string }[] = [
  { key: 'Newborn', color: '#44B090', bg: '#E6F5F1' },
  { key: 'Onesies', color: '#6CB1DA', bg: '#E9F2FA' },
  { key: 'Sets', color: '#F39265', bg: '#FCEDE7' },
  { key: 'Sleepwear', color: '#FBC326', bg: '#FFF7D9' },
  { key: 'Accessories', color: '#F77FB2', bg: '#FFEEF6' }
]

export const products: Product[] = [
  {
    id: 'nb-cloud-romper',
    name: 'Cloud Soft Romper',
    price: 19.99,
    category: 'Newborn',
    description: 'Feather-soft romper perfect for first cuddles. Snap buttons for easy changes.',
    colors: ['Cream', 'Mint', 'Sky'],
    sizes: ['0-3m', '3-6m'],
    image: 'https://images.unsplash.com/photo-1605283177634-ff2618e67664?q=80&w=1200&auto=format&fit=crop',
    badges: ['New', 'Popular']
  },
  {
    id: 'onesie-sunshine',
    name: 'Sunshine Onesie',
    price: 14.5,
    category: 'Onesies',
    description: 'Bright and cheerful onesie with envelope shoulders and gentle stretch.',
    colors: ['Sunshine', 'Blush'],
    sizes: ['0-3m', '3-6m', '6-9m'],
    image: 'https://w7.pngwing.com/pngs/979/249/png-transparent-skirt-fashion-clothing-dress-woman-kids-clothes-polka-dot-aline-waist-thumbnail.png'
  },
  {
    id: 'set-ocean-breeze',
    name: 'Ocean Breeze Set',
    price: 29.0,
    category: 'Sets',
    description: 'Two-piece tee and shorts set in soft breathable cotton.',
    colors: ['Sky', 'Navy'],
    sizes: ['6-9m', '9-12m', '12-18m'],
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'sleep-starry',
    name: 'Starry Sleep Suit',
    price: 24.75,
    category: 'Sleepwear',
    description: 'Cozy zipper sleep suit with footies and anti-scratch cuffs.',
    colors: ['Navy', 'Cream'],
    sizes: ['3-6m', '6-9m', '9-12m'],
    image: 'https://images.unsplash.com/photo-1519689680058-c4c1a91d9d3f?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'cap-bunny-ears',
    name: 'Bunny Ears Cap',
    price: 9.95,
    category: 'Accessories',
    description: 'Adorable cap with floppy ears. Elastic back for comfy fit.',
    colors: ['Blush', 'Cream'],
    sizes: ['One Size'],
    image: 'https://images.unsplash.com/photo-1615485737657-9e6e3d4a7e09?q=80&w=1200&auto=format&fit=crop'
  }
]

export function getByCategory(cat: Category) {
  return products.filter(p => p.category === cat)
}

export function getProduct(id: string) {
  return products.find(p => p.id === id)
}


