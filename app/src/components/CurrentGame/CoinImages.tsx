import { CoinSpinner } from './CoinSpinner';
import head_image from '../../icons/svg/head.svg';
import tails_image from '../../icons/svg/tails.svg';

interface CoinImagesProps {
    isLoading: boolean;
    isShowingHead: boolean;
    setIsShowingHead: (isShowingHead: boolean) => void;
}

export const CoinImages = ({ isLoading, isShowingHead, setIsShowingHead }: CoinImagesProps) => {
    console.log('CoinImages - isLoading:', isLoading);

    if (isLoading) {
        console.log('Showing CoinSpinner');
        return <CoinSpinner isShowingHead={isShowingHead} setIsShowingHead={setIsShowingHead} />;
    }
    return (
        <div className="relative h-64 w-64">
            <img
                src={head_image}
                alt="Head"
                className={`absolute h-full w-full transition-opacity duration-300 ${
                    isShowingHead ? 'opacity-100' : 'opacity-0'
                }`}
            />
            <img
                src={tails_image}
                alt="Tails"
                className={`absolute h-full w-full transition-opacity duration-300 ${
                    isShowingHead ? 'opacity-0' : 'opacity-100'
                }`}
            />
        </div>
    );
};
