import head_image from '../../icons/svg/head.svg';
import tails_image from '../../icons/svg/tails.svg';

interface CoinSpinnerProps {
    isShowingHead: boolean;
    setIsShowingHead: (isShowingHead: boolean) => void;
}

export const CoinSpinner = ({ isShowingHead, setIsShowingHead }: CoinSpinnerProps) => {
    const handleAnimationIteration = () => {
        setIsShowingHead(!isShowingHead);
    };

    const handleAnimationStart = () => {
        setTimeout(() => {
            setIsShowingHead(!isShowingHead);
        }, 400);
    };

    return (
        <div className="flex justify-center">
            <div
                className="h-64 w-64 drop-shadow-lg"
                style={{
                    animation: 'flipVertical 0.8s ease-in-out infinite',
                    animationName: 'flipVertical'
                }}
                onAnimationIteration={handleAnimationIteration}
                onAnimationStart={handleAnimationStart}
            >
                <img
                    src={isShowingHead ? head_image : tails_image}
                    alt={isShowingHead ? 'Head' : 'Tails'}
                    className="h-full w-full"
                />
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes flipVertical {
                        0% { transform: rotateX(0deg); }
                        50% { transform: rotateX(90deg); }
                        100% { transform: rotateX(0deg); }
                    }
                `
            }} />
        </div>
    );
};
