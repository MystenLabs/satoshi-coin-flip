import head_image from '../../icons/svg/head.svg';
import tails_image from '../../icons/svg/tails.svg';

interface CoinSpinnerProps {
    isShowingHead: boolean;
    setIsShowingHead: (isShowingHead: boolean) => void;
}

export const CoinSpinner = ({ isShowingHead, setIsShowingHead }: CoinSpinnerProps) => {
    const handleAnimationIteration = (event: any) => {
        if (event.elapsedTime >= 1) {
            setTimeout(() => {
                setIsShowingHead(!isShowingHead);
            }, 1000);
        }
    };

    const handleAnimationStart = () => {
        setTimeout(() => {
            setIsShowingHead(!isShowingHead);
        }, 1000);
    };

    return (
        <div className="flex justify-center">
            <img
                src={isShowingHead ? head_image : tails_image}
                alt={isShowingHead ? 'Head' : 'Tails'}
                className="h-64 animate-flip-vertical"
                onAnimationIteration={handleAnimationIteration}
                onAnimationStart={handleAnimationStart}
            />
        </div>
    );
};
