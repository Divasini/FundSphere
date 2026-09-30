import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Activity,
  Sprout,
  GraduationCap,
  Leaf,
  HeartHandshake,
  Palette,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onClick?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  Activity,
  Sprout,
  GraduationCap,
  Leaf,
  HeartHandshake,
  Palette,
  Briefcase,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected = false,
  onClick,
}) => {
  const IconComponent = (category.icon && iconMap[category.icon]) || HelpCircle;

  const content = (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center text-center group ${
        isSelected
          ? 'bg-ice-500 text-white border-ice-600 shadow-md'
          : 'bg-white text-cloud-900 border-cloud-200/90 hover:border-ice-300 hover:bg-ice-50/50 shadow-soft'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition ${
          isSelected
            ? 'bg-white/20 text-white'
            : 'bg-ice-100 text-ice-600 group-hover:bg-ice-200'
        }`}
      >
        <IconComponent className="w-5 h-5" />
      </div>
      <h4 className="text-xs font-bold leading-snug line-clamp-1">{category.name}</h4>
      {category._count?.campaigns !== undefined && (
        <span
          className={`text-[10px] mt-1 font-medium ${
            isSelected ? 'text-white/80' : 'text-cloud-800/60'
          }`}
        >
          {category._count.campaigns} campaigns
        </span>
      )}
    </div>
  );

  if (onClick) {
    return content;
  }

  return <Link to={`/discover?category=${category.slug}`}>{content}</Link>;
};
