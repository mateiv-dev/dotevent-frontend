export const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Academic':
      return { color: 'blue', gradient: 'from-blue-300 to-indigo-300' };
    case 'Social':
      return { color: 'purple', gradient: 'from-purple-300 to-pink-300' };
    case 'Sports':
      return { color: 'orange', gradient: 'from-orange-300 to-red-300' };
    case 'Career':
      return { color: 'indigo', gradient: 'from-indigo-300 to-purple-300' };
    default:
      return { color: 'green', gradient: 'from-green-300 to-teal-300' };
  }
};