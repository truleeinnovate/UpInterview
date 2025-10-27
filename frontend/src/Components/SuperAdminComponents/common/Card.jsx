import { Info } from "lucide-react";

function Card({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}) {
  let trendColor = "text-gray-500";
  let trendIcon = null;

  if (trend) {
    trendColor = trend === "up" ? "text-green-500" : "text-orange-600";
    trendIcon = trend === "up" ? "↑" : "↓";
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-6 lg:p-6 xl:p-6 2xl:p-6 ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 line-clamp-2">
            {title}
          </h3>
          {description && (
            <div className="flex items-center gap-2 mt-1">
              <Info className="text-gray-400 flex-shrink-0 h-5 w-5" />
              <p className="text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm 2xl:text-sm text-gray-500 line-clamp-2">
                {description}
              </p>
            </div>
          )}
        </div>
        {icon && <div className="text-gray-400 flex-shrink-0">{icon}</div>}
      </div>
      <div className="mt-4">
        <div className="flex items-baseline flex-wrap gap-2">
          <p className="text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-semibold">
            {value}
          </p>
          {trend && trendValue && (
            <span
              className={`text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm 2xl:text-sm ${trendColor} flex items-center`}
            >
              {trendIcon} {trendValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
