(() => {
  const mark = document.querySelector("[data-metal-mark]");
  const artwork = mark?.querySelector(".metal-mark__artwork");
  const hint = document.querySelector("#metal-mark-hint");
  if (!artwork || !hint || !mark.setPointerCapture) return;

  const restingPose = { pitch: -12, yaw: -19, x: 0, y: 0 };
  const turns = {
    ArrowUp: { pitch: -8, yaw: 0 },
    ArrowDown: { pitch: 8, yaw: 0 },
    ArrowLeft: { pitch: 0, yaw: -8 },
    ArrowRight: { pitch: 0, yaw: 8 },
  };
  let pose = restingPose;
  let drag = null;

  const bounded = (value, limit) => Math.min(limit, Math.max(-limit, value));
  const showPose = ({ pitch, yaw, x, y }) => {
    pose = { pitch: bounded(pitch, 36), yaw: bounded(yaw, 44), x, y };
    artwork.style.setProperty("--pitch", `${pose.pitch}deg`);
    artwork.style.setProperty("--yaw", `${pose.yaw}deg`);
    artwork.style.setProperty("--shift-x", `${x}px`);
    artwork.style.setProperty("--shift-y", `${y}px`);
    artwork.style.setProperty("--reflection", `${53 + (pose.yaw - restingPose.yaw) * 0.7 + (pose.pitch - restingPose.pitch) * 0.23}%`);
  };

  const endDrag = () => {
    const pointerId = drag?.pointerId;
    drag = null;
    delete mark.dataset.dragging;
    if (pointerId !== undefined && mark.hasPointerCapture(pointerId)) {
      mark.releasePointerCapture(pointerId);
    }
    showPose(restingPose);
  };

  mark.dataset.interactive = "";
  mark.tabIndex = 0;
  mark.setAttribute("aria-describedby", hint.id);
  hint.hidden = false;

  mark.addEventListener("pointerdown", (event) => {
    if (drag || !event.isPrimary || event.button !== 0) return;
    const { pointerId, clientX, clientY } = event;
    mark.setPointerCapture(pointerId);
    drag = { pointerId, clientX, clientY, pose };
    mark.dataset.dragging = "";
    event.preventDefault();
  });

  mark.addEventListener("pointermove", (event) => {
    if (event.pointerId !== drag?.pointerId) return;
    const x = event.clientX - drag.clientX;
    const y = event.clientY - drag.clientY;
    showPose({
      pitch: drag.pose.pitch - y * 0.24,
      yaw: drag.pose.yaw + x * 0.37,
      x: bounded(drag.pose.x + x * 0.23, 30),
      y: bounded(drag.pose.y + y * 0.23, 30),
    });
  });

  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    mark.addEventListener(type, (event) => {
      if (event.pointerId === drag?.pointerId) endDrag();
    });
  }

  mark.addEventListener("keydown", (event) => {
    if (event.key === "Home" || event.key === "Escape") {
      event.preventDefault();
      endDrag();
      return;
    }
    if (drag || !Object.hasOwn(turns, event.key)) return;

    event.preventDefault();
    const turn = turns[event.key];
    showPose({ ...pose, pitch: pose.pitch + turn.pitch, yaw: pose.yaw + turn.yaw });
  });

  window.addEventListener("blur", () => {
    if (drag) endDrag();
  });
})();
