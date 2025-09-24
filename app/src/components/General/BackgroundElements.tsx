import { DiagonialLightings } from './DiagonialLightings';
import { DotGrid } from './DotGrid';
import { VerticalLines } from './VerticalLines';

export const BackgroundElements = () => {
    return (
        <>
            <VerticalLines />
            <DiagonialLightings />
            <DotGrid />
        </>
    );
};
