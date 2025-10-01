/**
 * Common styling utilities and class names for consistent UI
 */

/**
 * Common button styles
 */
export const buttonStyles = {
  primary: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-all duration-200",
  ghost: "hover:bg-gray-100 text-gray-600 transition-all duration-200",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200",
} as const;

/**
 * Common input styles
 */
export const inputStyles = {
  default: "border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 pr-24 sm:pr-28",
  search: "pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200",
} as const;

/**
 * Common card styles
 */
export const cardStyles = {
  default: "bg-white border-0 shadow-lg rounded-2xl",
  elevated: "bg-white border-0 shadow-2xl rounded-2xl",
  gradient: "bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200",
} as const;

/**
 * Common dialog styles
 */
export const dialogStyles = {
  content: "bg-white border-0 shadow-2xl rounded-2xl max-w-xl w-[calc(100vw-2rem)] sm:w-full p-0 overflow-hidden",
  header: "bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200",
} as const;

/**
 * Common spacing utilities
 */
export const spacing = {
  section: "space-y-6",
  form: "space-y-4",
  items: "space-y-3",
  buttons: "gap-2",
} as const;

/**
 * Common text styles
 */
export const textStyles = {
  heading: "text-xl font-bold text-gray-900",
  subheading: "text-lg font-semibold text-gray-800",
  body: "text-sm text-gray-600",
  caption: "text-xs text-gray-500",
  label: "text-sm font-semibold text-gray-800",
} as const;

/**
 * Common layout utilities
 */
export const layout = {
  container: "w-full max-w-6xl mx-auto",
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexCol: "flex flex-col",
  flexRow: "flex flex-row",
  grid: "grid gap-4",
} as const;

/**
 * Common animation utilities
 */
export const animations = {
  fadeIn: "animate-in fade-in duration-200",
  slideIn: "animate-in slide-in-from-bottom-4 duration-200",
  spin: "animate-spin",
  pulse: "animate-pulse",
} as const;

/**
 * Common responsive utilities
 */
export const responsive = {
  mobile: "w-[calc(100vw-2rem)] sm:w-full",
  tablet: "max-w-md md:max-w-lg",
  desktop: "max-w-2xl lg:max-w-4xl",
} as const;
