import { PauseIcon, PlayIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WaveForm, WaveSurfer } from 'wavesurfer-react';

const AudioPlayer = ({ audioUrl }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);

    const wavesurferRef = useRef();
    const handleWSMount = useCallback(
        (waveSurfer) => {
            if (waveSurfer.markers) {
                waveSurfer.clearMarkers();
            }

            wavesurferRef.current = waveSurfer;

            if (wavesurferRef.current) {

                wavesurferRef.current.load('http://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a');

                wavesurferRef.current.on("ready", () => {
                    console.log("WaveSurfer is ready");
                });

                wavesurferRef.current.on("loading", (data) => {
                    console.log("loading --> ", data);
                });

                if (window) {
                    window.surferidze = wavesurferRef.current;
                }
            }
        },
        []
    );

    const handlePlayPause = () => {
        if (isPlaying) {
            wavesurferRef.current.pause();
        } else {
            wavesurferRef.current.play();
        }
    };

    const handleVolumeChange = (event) => {
        const newVolume = event.target.value;
        setVolume(newVolume);
        wavesurferRef.current.setVolume(newVolume / 100);
    };

    return (
        <div className="flex items-center">
            <button onClick={handlePlayPause} className="mr-2">
                {isPlaying ? (
                    <PauseIcon className="h-6 w-6 text-blue-500" />
                ) : (
                    <PlayIcon className="h-6 w-6 text-blue-500" />
                )}
            </button>
            <div className="flex items-center">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="h-6 w-24 mr-2"
                />
                <SpeakerWaveIcon className="h-6 w-6 text-blue-500" />
            </div>

            <WaveSurfer onMount={handleWSMount}>
                <WaveForm id="waveform" cursorColor="transparent" waveColor='#65B892'>
                </WaveForm>
            </WaveSurfer>

        </div>
    );
};

export default AudioPlayer;
