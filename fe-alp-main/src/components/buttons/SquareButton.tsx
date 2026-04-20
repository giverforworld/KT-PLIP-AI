/* 
* ALP version 1.0

* Copyright © 2024 kt corp. All rights reserved.

* 

* This is a proprietary software of kt corp, and you may not use this file except in

* compliance with license agreement with kt corp. Any redistribution or use of this

* software, with or without modification shall be strictly prohibited without prior written

* approval of kt corp, and the copyright notice above does not evidence any actual or

* intended publication of such software.

*/

interface SquareButtonProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  className?: string;
  ariaLabel: string;
  onClick?: () => void;
}

/**
 * 아이콘이 들어간 사각형 모양의 버튼
 * @param {SquareButtonProps} SquareButtonProps
 * @returns {React.JSX.Element} Button
 */
export default function SquareButton({
  Icon,
  className,
  ariaLabel,
  onClick,
}: SquareButtonProps) {
  return (
    <button
      className={`flex justify-center items-center w-[36px] h-[36px] border border-stroke rounded-md hover:bg-backGray text-[#BEBEBE] ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {<Icon />}
    </button>
  );
}
