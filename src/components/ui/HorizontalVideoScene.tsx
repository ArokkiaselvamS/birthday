import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { experienceStore } from "../../store/experienceStore";
import horizontalVideo from "../../video/video1.mp4";

gsap.registerPlugin(ScrollTrigger);

interface HorizontalVideoSceneProps {
  /** Callback so parent App can track and silence the video if needed */
  onVideoRef?: (el: HTMLVideoElement | null) => void;
}

export function HorizontalVideoScene({ onVideoRef }: HorizontalVideoSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [, setIsPlaying] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Subscribe to scene3Completed
  const scene3Completed = useSyncExternalStore(
    experienceStore.subscribe,
    experienceStore.getScene3Completed
  );

  // Expose video element to parent
  useEffect(() => {
    onVideoRef?.(videoRef.current);
    return () => onVideoRef?.(null);
  }, [onVideoRef]);

  // Handle play with audio and catch browser autoplay audio restrictions
  const playWithAudio = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.warn("Autoplay with audio was restricted by browser:", err);
          // Fallback: try muted autoplay if unmuted was rejected, and prompt user
          video.muted = true;
          video
            .play()
            .then(() => {
              setIsPlaying(true);
              setAutoplayBlocked(true);
            })
            .catch((e) => {
              console.warn("Muted autoplay also blocked:", e);
              setIsPlaying(false);
              setAutoplayBlocked(true);
            });
        });
    }
  }, []);

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;
    if (video && !video.paused) {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Set up ScrollTrigger & playback lifecycle
  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!section || !container) return;

    // Initial styling for reveal
    gsap.set(container, { opacity: 0, scale: 0.96, y: 30 });
    if (glow) gsap.set(glow, { opacity: 0, scale: 0.9 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      end: "bottom 25%",
      onEnter: () => {
        // Activate only if Scene 3 has completed
        if (experienceStore.scene3Completed) {
          gsap.to(container, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
          });
          if (glow) {
            gsap.to(glow, {
              opacity: 1,
              scale: 1,
              duration: 1.1,
              ease: "power2.out",
            });
          }

          const video = videoRef.current;
          if (video) {
            video.currentTime = 0;
            setVideoCompleted(false);
            playWithAudio();
          }
        }
      },
      onLeave: () => {
        // Leaving scrolling downward
        pauseVideo();
      },
      onEnterBack: () => {
        // Scrolling back up into Scene 4
        if (experienceStore.scene3Completed) {
          gsap.to(container, { opacity: 1, scale: 1, y: 0, duration: 0.6 });
          const video = videoRef.current;
          if (video) {
            video.currentTime = 0;
            setVideoCompleted(false);
            playWithAudio();
          }
        }
      },
      onLeaveBack: () => {
        // Scrolling back up into Scene 3
        pauseVideo();
        gsap.to(container, { opacity: 0, scale: 0.96, y: 30, duration: 0.5 });
        if (glow) gsap.to(glow, { opacity: 0, duration: 0.5 });
      },
    });

    return () => {
      trigger.kill();
      pauseVideo();
    };
  }, [playWithAudio, pauseVideo]);

  // Video event listeners: ended, pause, play
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      // Scene 4 video completed — do not loop
      setIsPlaying(false);
      setVideoCompleted(true);
      experienceStore.setHorizontalVideoEnded(true);

      // Smooth scroll gently to Scene 5
      setTimeout(() => {
        const s5 = document.getElementById("scene-5");
        if (s5) {
          s5.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 700);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  // When user clicks the unmute fallback banner if browser initially blocked audio
  const handleUnmuteClick = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.play().catch(() => {});
      setAutoplayBlocked(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="s4-section"
      aria-label="Scene 4 — Birthday Cinematic Video"
      style={{
        pointerEvents: scene3Completed ? "auto" : "none",
      }}
    >
      {/* Deep midnight blue atmosphere glow */}
      <div ref={glowRef} className="s4-glow" aria-hidden="true" />
      <div className="s4-vignette" aria-hidden="true" />

      {/* Main cinematic video frame container */}
      <div ref={containerRef} className="s4-container">
        <div className="s4-video-frame">
          <video
            ref={videoRef}
            src={horizontalVideo}
            className="s4-video"
            playsInline
            preload="auto"
          />

          {/* Minimal audio tap prompt if browser blocked autoplay sound */}
          {autoplayBlocked && !videoCompleted && (
            <button
              type="button"
              onClick={handleUnmuteClick}
              className="s4-unmute-btn"
              aria-label="Click to play audio"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <span>Tap for Sound</span>
            </button>
          )}

          {/* Subtly indicate replay action when video finishes */}
          {videoCompleted && (
            <button
              type="button"
              className="s4-replay-pill"
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.currentTime = 0;
                  setVideoCompleted(false);
                  playWithAudio();
                }
              }}
              aria-label="Replay video"
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 4V1L6 5l4 4V6a5 5 0 1 1-5 5H3a7 7 0 1 0 7-7z" />
              </svg>
              <span>Replay</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
