// Used in the sidebar to show color pickers and series labels

import React from "react";

interface Props {
  files: File[];
  seriesColors: string[];
  labels: string[];
  updateColor: (i: number, color: string) => void;
}

const SeriesCustomLabelColor: React.FC<Props> = ({
  files,
  seriesColors,
  labels,
  updateColor,
}) =>
  files.length > 0 ? (
    <div>
      <label className="block text-sm font-medium mb-2">Series Colors</label>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="color"
              value={seriesColors[index] || "#61b0e6"}
              onChange={(e) => updateColor(index, e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <span className="text-sm truncate max-w-[180px]">
              {labels[index] || file.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  ) : null;

export default SeriesCustomLabelColor;