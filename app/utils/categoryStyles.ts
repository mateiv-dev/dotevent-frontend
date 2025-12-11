export const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Academic':
      return { color: 'blue', gradient: 'from-blue-300 to-indigo-300', bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'Social':
      return { color: 'purple', gradient: 'from-purple-300 to-pink-300', bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'Sports':
      return { color: 'orange', gradient: 'from-orange-300 to-red-300', bg: 'bg-orange-100', text: 'text-orange-700' };
    case 'Career':
      return { color: 'indigo', gradient: 'from-indigo-300 to-purple-300', bg: 'bg-indigo-100', text: 'text-indigo-700' };
    default:
      return { color: 'green', gradient: 'from-green-300 to-teal-300', bg: 'bg-green-100', text: 'text-green-700' };
  }
};