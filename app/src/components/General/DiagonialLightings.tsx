export const DiagonialLightings = () => (
    <>
        <div
            style={{
                position: 'absolute',
                width: '100px',
                height: '25%',
                left: '25%',
                top: '0',
                background: 'white',
                opacity: '0.1',
                filter: 'blur(62px)',
                transform: 'skew(45deg) translateX(-25%)',
            }}
        />
        <div
            style={{
                position: 'absolute',
                width: '100px',
                height: '25%',
                left: '25%',
                top: '25%',
                background: 'white',
                opacity: '0.1',
                filter: 'blur(62px)',
                transform: 'skew(45deg) translateX(-25%)',
            }}
        />
        <div
            style={{
                position: 'absolute',
                width: '100px',
                height: '25%',
                right: '25%',
                top: '0',
                background: 'white',
                opacity: '0.1',
                filter: 'blur(62px)',
                transform: 'skew(-45deg) translateX(-25%)',
            }}
        />
        <div
            style={{
                position: 'absolute',
                width: '100px',
                height: '25%',
                right: '25%',
                top: '25%',
                background: 'white',
                opacity: '0.1',
                filter: 'blur(62px)',
                transform: 'skew(-45deg) translateX(-25%)',
            }}
        />
    </>
);
