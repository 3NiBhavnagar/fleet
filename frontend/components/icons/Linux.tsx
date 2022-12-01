import React from "react";
import { COLORS, Colors } from "styles/var/colors";

interface ILinuxProps {
  size: "small" | "medium" | "large";
  color?: Colors;
}

const SIZE_MAP = {
  small: "12",
  medium: "16",
  large: "24",
};

const Linux = ({
  size = "medium",
  color = "ui-fleet-black-75",
}: ILinuxProps) => {
  return (
    <svg
      width={SIZE_MAP[size]}
      height={SIZE_MAP[size]}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
    >
      <path
        d="M15.992 10.96c-.717-2.833-2.224-4.3-3.069-4.927l-.136-.18c.136-.413.211-.853.211-1.306C12.998 2.033 10.76 0 7.992 0 5.226 0 2.98 2.04 2.98 4.547c0 .453.075.893.211 1.306-.06.074-.113.147-.166.22C2.172 6.72.717 8.187.008 10.96c-.03.12.023.253.129.333.113.08.263.094.392.047.392-.16.912-.4 1.394-.733A5.99 5.99 0 0 0 4.23 14.4h-.904c-.498 0-.905.36-.905.8 0 .44.407.8.905.8h9.288c.498 0 .905-.36.905-.8 0-.44-.407-.8-.905-.8h-.875a5.987 5.987 0 0 0 2.307-3.813c.49.34 1.018.586 1.418.746a.412.412 0 0 0 .392-.046.302.302 0 0 0 .136-.327Zm-8.007 2.86c-2.36 0-4.275-1.88-4.275-4.193 0-1.187.505-2.687 1.312-3.86-.422-.327-.686-.807-.686-1.334 0-.986.905-1.78 2.013-1.78.67 0 1.259.287 1.628.734.37-.447.958-.734 1.629-.734 1.116 0 2.013.8 2.013 1.78 0 .534-.264 1.007-.686 1.334.806 1.173 1.312 2.666 1.312 3.86.015 2.32-1.9 4.193-4.26 4.193Z"
        fill={COLORS[color]}
      />
      <path
        d="M9.161 5.187 8.038 4.88a.28.28 0 0 0-.106 0l-1.123.307a.161.161 0 0 0-.113.1.155.155 0 0 0 .022.14l1.124 1.34c.03.04.083.06.135.06.053 0 .106-.02.136-.06l1.123-1.34c.03-.04.046-.094.023-.14 0-.047-.045-.08-.098-.1ZM7.33 4.46c0 .233-.212.42-.476.42s-.475-.187-.475-.42c0-.233.211-.42.475-.42.264-.007.475.187.475.42ZM9.598 4.46c0 .233-.21.42-.475.42-.263 0-.475-.187-.475-.42 0-.233.212-.42.475-.42.257-.007.475.187.475.42Z"
        fill={COLORS[color]}
      />
    </svg>
  );
};

export default Linux;
