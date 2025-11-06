import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShoppingCart,
  faHeart,
  faStar,
  faBaby,
  faGift,
  faMoon,
  faTshirt,
  faShirt
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

export const CartIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faShoppingCart} size={size as any} style={style} />
)

export const HeartIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faHeart} size={size as any} style={{ color: '#e74c3c', ...style }} />
)

export const HeartOutlineIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faHeartRegular} size={size as any} style={{ opacity: 0.7, ...style }} />
)

export const StarIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faStar} size={size as any} style={{ color: 'var(--sunshine)', ...style }} />
)

export const BabyIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faBaby} size={size as any} style={style} />
)

export const GiftIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faGift} size={size as any} style={style} />
)

export const ShirtIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faTshirt} size={size as any} style={style} />
)

export const MoonIcon = ({ size = '1x', style }: { size?: string; style?: React.CSSProperties }) => (
  <FontAwesomeIcon icon={faMoon} size={size as any} style={style} />
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
  return <FontAwesomeIcon icon={icon} size={size as any} style={style} />
}
