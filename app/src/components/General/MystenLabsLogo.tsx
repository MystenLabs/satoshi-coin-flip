import { MystenLabsIcon } from '../../icons/tsx/MystenLabsIcon';
import { MystenLabsText } from '../../icons/tsx/MystenLabsText';

interface MystenLabsLogoProps {
    iconClassName?: string;
    textClassName?: string;
}

export const MystenLabsLogo = ({ iconClassName, textClassName }: MystenLabsLogoProps) => {
    return (
        <div className="flex items-center justify-start space-x-4 text-white">
            <MystenLabsIcon color="white" className={iconClassName} />
            <MystenLabsText color="white" className={textClassName} />
        </div>
    );
};
