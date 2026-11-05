import { useEffect, useRef, useState } from "react";

const TRIGGER_DISTANCE = 72;
const MAX_DISTANCE = 96;

/** Implements a top-of-page mobile pull gesture that reloads fresh server data. */
function PullToRefresh() {
  const [distance, setDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentDistance = useRef(0);
  const isTracking = useRef(false);

  useEffect(() => {
    function isAtTop() {
      return window.scrollY <= 0;
    }

    function handleTouchStart(event: TouchEvent) {
      if (isRefreshing || event.touches.length !== 1 || !isAtTop()) return;
      startY.current = event.touches[0].clientY;
      isTracking.current = true;
    }

    function handleTouchMove(event: TouchEvent) {
      if (!isTracking.current || isRefreshing) return;
      const pullDistance = event.touches[0].clientY - startY.current;

      if (pullDistance <= 0 || !isAtTop()) {
        currentDistance.current = 0;
        setDistance(0);
        return;
      }

      event.preventDefault();
      currentDistance.current = Math.min(MAX_DISTANCE, pullDistance * 0.45);
      setDistance(currentDistance.current);
    }

    function handleTouchEnd() {
      if (!isTracking.current) return;
      isTracking.current = false;

      if (currentDistance.current >= TRIGGER_DISTANCE) {
        setIsRefreshing(true);
        setDistance(TRIGGER_DISTANCE);
        window.setTimeout(() => window.location.reload(), 280);
        return;
      }

      currentDistance.current = 0;
      setDistance(0);
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isRefreshing]);

  const visible = distance > 0 || isRefreshing;
  const ready = distance >= TRIGGER_DISTANCE;

  return (
    <div
      className={visible ? "pull-refresh-indicator visible" : "pull-refresh-indicator"}
      style={{ transform: `translate(-50%, ${-76 + distance}px)` }}
      aria-live="polite"
      aria-hidden={!visible}
    >
      <i className={isRefreshing ? "bi bi-arrow-clockwise spinning" : "bi bi-arrow-down"} aria-hidden="true" />
      <span>{isRefreshing ? "Refreshing…" : ready ? "Release to refresh" : "Pull to refresh"}</span>
    </div>
  );
}

export default PullToRefresh;
