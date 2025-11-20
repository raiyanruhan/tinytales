import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShoppingCart,
  faHeart,
  faStar,
  faBaby,
  faGift,
  faMoon,
  faTshirt,
  faShirt,
  faUser,
  faBangladeshiTakaSign,
  faBars,
  faXmark,
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons'
import { FaHome, FaRegHeart } from 'react-icons/fa'
import { GiCardboardBox } from 'react-icons/gi'
import { MdCategory } from 'react-icons/md'

// Helper function to convert FontAwesome size strings to pixel values for react-icons
const getSize = (size: string): number => {
  const sizeMap: Record<string, number> = {
    '1x': 16,
    'lg': 20,
    '2x': 32,
    '3x': 48,
    '4x': 64
  }
  return sizeMap[size] || 16
}

export const CartIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faShoppingCart} size={size as any} style={style as any} />
)

export const HeartIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faHeart} size={size as any} style={{ color: 'var(--coral)', ...style } as any} />
)

export const HeartOutlineIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FaRegHeart size={getSize(size)} style={{ opacity: 0.7, ...style }} />
)

export const StarIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faStar} size={size as any} style={{ color: 'var(--sunshine)', ...style } as any} />
)

export const BabyIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faBaby} size={size as any} style={style as any} />
)

export const GiftIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faGift} size={size as any} style={style as any} />
)

export const ShirtIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faTshirt} size={size as any} style={style as any} />
)

export const MoonIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faMoon} size={size as any} style={style as any} />
)

export const PersonIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faUser} size={size as any} style={style as any} />
)

export const TakaIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faBangladeshiTakaSign} size={size as any} style={style as any} />
)

export const MenuIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faBars} size={size as any} style={style as any} />
)

export const CloseIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faXmark} size={size as any} style={style as any} />
)

export const SearchIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faMagnifyingGlass} size={size as any} style={style as any} />
)

export const HomeIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FaHome size={getSize(size)} style={style} />
)

export const ProductsIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <GiCardboardBox size={getSize(size)} style={style} />
)

export const CategoriesIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <MdCategory size={getSize(size)} style={style} />
)

const categoryIcons: Record<string, any> = {
  'Newborn': faBaby,
  'Onesies': faGift,
  'Sets': faTshirt,
  'Sleepwear': faMoon,
  'Accessories': faStar
}

export const CategoryIcon = ({ category, size = '4x', style }: { category: string; size?: string; style?: React.CSSProperties }) => {
  const icon = categoryIcons[category] || faStar
  return <FontAwesomeIcon icon={icon} size={size as any} style={style as any} />
}
