import React, { useRef, useState, useEffect } from 'react'
import RecordRTC from 'recordrtc';

const Recorder = ({ className = '' }) => {
    const [isInited, setIsInited] = useState(false);
    const [isRecordingStarted, setIsRecordingStarted] = useState(false);
    const [isRecordingFinished, setIsRecordingFinished] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const screenVideoRef = useRef();
    const cameraVideoRef = useRef();
    const screenStreamRef = useRef();
    const cameraStreamRef = useRef();
    const screenRecorderRef = useRef();
    const cameraRecorderRef = useRef();
    const isAutoPlayRef = useRef(false);

    const addStreamStopListener = (stream, callback) => {
        stream.addEventListener('ended', () => {
            callback();
            callback = () => { };
        }, false);
        stream.addEventListener('inactive', () => {
            callback();
            callback = () => { };
        }, false);
        stream.getTracks().forEach((track) => {
            track.addEventListener('ended', () => {
                callback();
                callback = () => { };
            }, false);
            track.addEventListener('inactive', () => {
                callback();
                callback = () => { };
            }, false);
        });
    }

    const invokeGetDisplayMedia = (success, error) => {
        var displaymediastreamconstraints = {
            video: {
                displaySurface: 'monitor', // monitor, window, application, browser
                logicalSurface: true,
                cursor: 'always' // never, always, motion
            }
        };

        displaymediastreamconstraints = {
            video: true
        };

        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
        }
        else {
            navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
        }
    }

    const captureCamera = (cb) => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(cb);
    }

    const captureScreen = (cb) => {
        invokeGetDisplayMedia((screen) => {
            addStreamStopListener(screen, () => {
                if (window.stopCallback) {
                    window.stopCallback();
                }

            });
            cb(screen);
        }, (error) => {
            console.error(error);
            alert('Unable to capture your screen. Please check console logs.\n' + error);
        });
    }


    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initRecorders = () => {
        setIsInited(true);
        isAutoPlayRef.current = true;
        captureCamera((camera) => {
            const { current: cameraVideo } = cameraVideoRef;

            cameraVideo.muted = true;
            cameraVideo.srcObject = camera;
            cameraVideo.autoplay = true;
            cameraStreamRef.current = camera;

            cameraRecorderRef.current = RecordRTC(camera, {
                type: 'video',
                mimeType: 'video/webm',
            });

            captureScreen((screen) => {
                const { current: screenVideo } = screenVideoRef;
                setIsRecordingStarted(true);
                screenStreamRef.current = screen;
                screenVideo.muted = true;
                screenVideo.autoplay = true;
                screenVideo.srcObject = screen;

                screenRecorderRef.current = RecordRTC(screen, {
                    type: 'video',
                    mimeType: 'video/webm',
                });
            });


        });
    }



    const handleStartRecording = async (e) => {
        e.preventDefault();
        await Promise.all([
            cameraRecorderRef.current.startRecording(),
            screenRecorderRef.current.startRecording(),
        ]);
    }

    const handleStopRecording = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const { current: cameraVideo } = cameraVideoRef;
        const { current: screenVideo } = screenVideoRef;

        cameraVideo.autoplay = false;
        screenVideo.autoplay = false;

        cameraRecorderRef.current.stopRecording(() => {


            const blob = cameraRecorderRef.current.getBlob();
            cameraVideo.srcObject = null;
            cameraVideo.src = URL.createObjectURL(blob);
            cameraVideo.muted = false;


            cameraStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
        });

        screenRecorderRef.current.stopRecording(() => {

            const blob = screenRecorderRef.current.getBlob();
            screenVideo.srcObject = null;
            screenVideo.src = URL.createObjectURL(blob);
            screenVideo.muted = false;

            screenStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
        });
        setIsRecordingFinished(true);
    }

    const togglePlayPreview = async () => {
        const { current: cameraVideo } = cameraVideoRef;
        const { current: screenVideo } = screenVideoRef;


        if (isPlaying) {
            await Promise.all([
                cameraVideo.pause(),
                screenVideo.pause(),
            ]);

            return;
        }

        await Promise.all([
            cameraVideo.play(),
            screenVideo.play(),
        ]);

    }

    const handlePlay = () => {
        if (isRecordingFinished)
            setIsPlaying(true)
    }

    const handlePause = () => {
        if (isRecordingFinished)
            setIsPlaying(false)

    }

    useEffect(() => {
        if (!isInited) initRecorders();

    }, [initRecorders, isInited]);

    return (
        <div>
            <div className={`recorder_videos ${className}`}>
                <video ref={screenVideoRef} onPlay={handlePlay} onPause={handlePause} className="recorder_videos__video" />
                <video ref={cameraVideoRef} className="recorder_videos__video" />
            </div>
            <div className="recorder_controls">
                <button onClick={handleStartRecording}>Start recording</button>
                <button onClick={handleStopRecording} disabled={!isRecordingStarted || isRecordingFinished}>Stop recording</button>
                <button onClick={togglePlayPreview} disabled={!isRecordingFinished}>{isPlaying ? 'Pause' : 'Play'}</button>
            </div>
        </div>
    )
}

export default Recorder;