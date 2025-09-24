import { IconProps } from '../../types/IconProps';

export const MystenLabsIcon = ({ color, className }: IconProps) => {
    return (
        <svg
            viewBox="0 0 416 200"
            fill={color}
            xmlns="http://www.w3.org/2000/svg"
            {...(className && { className })}
        >
            <path
                d="M150.087 99.9102C100.058 99.9102 50.0291 200 0 200V100.09C52.0086 100.09 102.038 0 150.087 0V99.9102Z"
                fill={color}
            />
            <path
                d="M300.355 99.9102C250.326 99.9102 200.297 200 150.268 200V100.09C202.276 100.09 252.305 0 300.355 0V99.9102Z"
                fill={color}
            />
            <path
                d="M416 142.307C416 174.17 390.132 200 358.222 200C326.312 200 300.444 174.17 300.444 142.307C300.444 110.445 326.312 84.615 358.222 84.615C390.132 84.615 416 110.445 416 142.307Z"
                fill={color}
            />
        </svg>
    );
};
