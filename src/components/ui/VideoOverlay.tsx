import { useCallback, useEffect, useRef, useState } from "react";
import { experienceStore } from "../../store/experienceStore";
import birthdayVideo from "../../video/VID_20260910_074203_744.mp4";

/**
 * Scene 2 — Birthday Video with custom controls.
 *
 * ‣ No native browser controls (no 3-dot menu, no download, no PiP).
 * ‣ Playback is hard-capped at MAX_PLAY_TIME (13 s).
 * ‣ Custom play/pause button + scrub bar that only spans 0 – 13 s.
 * ‣ Supports bidirectional scroll: pauses when scrolling back to Scene 1,
 *   resumes when scrolling forward to Scene 2 again.
 * ‣ Always renders the <video> element (hidden when inactive) so App can
 *   control playback across scene transitions.
 */

const GIFT_OPEN_THRESHOLD = 0.38;
/** Hard stop — video never plays past this point. */
const MAX_PLAY_TIME = 13;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Play Icon ────────────────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <polygon points="4,2 18,10 4,18" />
    </svg>
  );
}

// ─── Pause Icon ───────────────────────────────────────────────────────────────
function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <rect x="3" y="2" width="5" height="16" rx="1" />
      <rect x="12" y="2" width="5" height="16" rx="1" />
    </svg>
  );
}

// ─── Replay Icon ──────────────────────────────────────────────────────────────
function ReplayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 4V1L6 5l4 4V6a5 5 0 1 1-5 5H3a7 7 0 1 0 7-7z" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface VideoOverlayProps {
  /** Called with the <video> element once it mounts, so App can control playback. */
  onVideoRef?: (el: HTMLVideoElement | null) => void;
}

export function VideoOverlay({ onVideoRef }: VideoOverlayProps) {
  const [videoSceneActive, setVideoSceneActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [ended, setEnded] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const wasActiveRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // ── Expose video element to parent ──────────────────────────────────────────
  useEffect(() => {
    onVideoRef?.(videoRef.current);
    return () => onVideoRef?.(null);
  }, [onVideoRef]);

  // ── Bidirectional scroll-driven activation ──────────────────────────────────
  // Responds to scroll position in both directions: activates when
  // progress crosses the threshold going down, deactivates going back up.
  useEffect(() => {
    const tick = () => {
      const p = experienceStore.progress;
      const shouldBeActive = p >= GIFT_OPEN_THRESHOLD;
      const wasActive = wasActiveRef.current;

      if (shouldBeActive !== wasActive) {
        wasActiveRef.current = shouldBeActive;
        setVideoSceneActive(shouldBeActive);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Handle scene activation/deactivation ────────────────────────────────────
  // Fades wrapper in/out and manages video play/pause on transitions.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current;

    if (videoSceneActive) {
      // Entering Scene 2: fade in wrapper, resume/play video
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (wrapper) wrapper.style.opacity = "1";
        });
      });

      if (video) {
        video.muted = false;
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } else {
      // Leaving Scene 2: fade out wrapper, pause video
      if (wrapper) wrapper.style.opacity = "0";
      if (video && !video.paused) {
        video.pause();
      }
    }
  }, [videoSceneActive]);

  // ── Auto-hide controls after 3 s of inactivity ─────────────────────────────
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current) setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showControls]);

  // ── Video event handlers ────────────────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Hard-cap at MAX_PLAY_TIME
    if (video.currentTime >= MAX_PLAY_TIME) {
      video.currentTime = MAX_PLAY_TIME;
      video.pause();
      setCurrentTime(MAX_PLAY_TIME);
      setIsPlaying(false);
      setEnded(true);
      experienceStore.setVideoEnded(true);
      setControlsVisible(true); // keep controls visible when done
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      return;
    }

    setCurrentTime(video.currentTime);
  }, []);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  // ── Play / Pause toggle ─────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    showControls();

    if (ended || video.currentTime >= MAX_PLAY_TIME) {
      // Replay from start
      video.currentTime = 0;
      setEnded(false);
      experienceStore.setVideoEnded(false);
    }

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [ended, showControls]);

  // ── Progress bar scrubbing ──────────────────────────────────────────────────
  const seekToPosition = useCallback((clientX: number) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;

    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = Math.min(ratio * MAX_PLAY_TIME, MAX_PLAY_TIME);
    video.currentTime = newTime;
    setCurrentTime(newTime);

    if (newTime < MAX_PLAY_TIME) {
      setEnded(false);
    }
  }, []);

  const handleBarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      seekToPosition(e.clientX);

      const onMove = (ev: MouseEvent) => seekToPosition(ev.clientX);
      const onUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        showControls();
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [seekToPosition, showControls]
  );

  const handleBarTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      seekToPosition(e.touches[0].clientX);

      const onMove = (ev: TouchEvent) => seekToPosition(ev.touches[0].clientX);
      const onEnd = () => {
        isDraggingRef.current = false;
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
        showControls();
      };
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onEnd);
    },
    [seekToPosition, showControls]
  );

  const fillPct = Math.min((currentTime / MAX_PLAY_TIME) * 100, 100);

  // When inactive, render the video element but hide the wrapper completely.
  // This keeps the <video> in the DOM so App can control it across scenes.
  if (!videoSceneActive) {
    return (
      <div
        ref={wrapperRef}
        className="video-scene"
        style={{ opacity: 0, transition: "opacity 700ms ease", visibility: "hidden", pointerEvents: "none" }}
      >
        <div className="video-player">
          <video
            ref={videoRef}
            className="birthday-video"
            src={birthdayVideo}
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={() => {
              setEnded(true);
              setIsPlaying(false);
              experienceStore.setVideoEnded(true);
              setControlsVisible(true);
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            }}
            onClick={togglePlay}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="video-scene"
      style={{ opacity: 0, transition: "opacity 700ms ease" }}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      {/* ── Video element — no native controls ─────────────────────────── */}
      <div className="video-player">
        <video
          ref={videoRef}
          className="birthday-video"
          src={birthdayVideo}
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={() => {
            setEnded(true);
            setIsPlaying(false);
            experienceStore.setVideoEnded(true);
            setControlsVisible(true);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          }}
          onClick={togglePlay}
        />

        {/* ── Custom controls bar ────────────────────────────────────────── */}
        <div className={`vc-bar ${controlsVisible ? "vc-bar--visible" : ""}`}>
          {/* Play / Pause / Replay button */}
          <button
            type="button"
            className="vc-playbtn"
            onClick={togglePlay}
            aria-label={ended ? "Replay" : isPlaying ? "Pause" : "Play"}
          >
            {ended ? <ReplayIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Time display */}
          <span className="vc-time">
            {formatTime(currentTime)} / {formatTime(MAX_PLAY_TIME)}
          </span>

          {/* Progress bar */}
          <div
            ref={progressBarRef}
            className="vc-progress"
            onMouseDown={handleBarMouseDown}
            onTouchStart={handleBarTouchStart}
            role="slider"
            aria-label="Video progress"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemin={0}
            aria-valuemax={MAX_PLAY_TIME}
          >
            <div className="vc-progress__track">
              <div
                className="vc-progress__fill"
                style={{ width: `${fillPct}%` }}
              />
              <div
                className="vc-progress__thumb"
                style={{ left: `${fillPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
