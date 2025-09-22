import head_image from '../../icons/svg/head.svg';
import tails_image from '../../icons/svg/tails.svg';

interface CoinSpinnerProps {
    isShowingHead: boolean;
    setIsShowingHead: (isShowingHead: boolean) => void;
}

export const CoinSpinner = ({ isShowingHead, setIsShowingHead }: CoinSpinnerProps) => {
    console.log('CoinSpinner rendering, isShowingHead:', isShowingHead);

    const handleAnimationIteration = () => {
        console.log('Animation iteration - switching coin');
        setIsShowingHead(!isShowingHead);
    };

    const handleAnimationStart = () => {
        console.log('Animation started');
        setTimeout(() => {
            setIsShowingHead(!isShowingHead);
        }, 400); // Switch faster for more dynamic effect
    };

    return (
        <div className="flex justify-center">
            <img
                src={isShowingHead ? head_image : tails_image}
                alt={isShowingHead ? 'Head' : 'Tails'}
                className="h-64 w-64 animate-flip-vertical drop-shadow-lg"
                onAnimationIteration={handleAnimationIteration}
                onAnimationStart={handleAnimationStart}
            />
        </div>
    );
};
