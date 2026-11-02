"use client";

import { Component, useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/** One card of the carousel: an image shown on a rounded 3D panel. */
export type Carousel3DItem = {
  id: string;
  /** Accessible name; the canvas itself is decorative, so pair it with real controls. */
  label: string;
  imageSrc: string;
  /** Image width / height. */
  aspect: number;
};

const CARD_WIDTH = 1.6;
const FRAME = 0.035;
const RADIUS = 0.06;
const FOV = 30;
/** Ring radius: how far the cards stand from the centre. */
const RING = 1.7;
/** How much lower the card at the back sits than the selected one at the front. */
const DROP = 1.0;
/** Where the selected card sits: its centre this far above the middle of the stage (share of half the height). */
const FRONT_LIFT = 0.1;
/** Camera height as a share of DROP: level with the side cards, so the back card shows below the front one. */
const EYE = 0.6;
/** How far the side cards turn towards the viewer (radians). */
const TURN = 0.6;
/** Share of the stage the cards may fill. Narrow screens let the side cards run off the edges. */
const FILL = { wide: 0.94, narrow: 1.5 };
/** Higher = the ring settles faster after a click. */
const SETTLE = 6;
/** Pixels a press may move and still count as a click. */
const CLICK_SLOP = 6;

/** Where a card stands when it is `angle` radians round the ring from the front (0 = selected). */
function ringSpot(angle: number) {
  const back = (1 - Math.cos(angle)) / 2; // 0 at the front, 1 at the back
  return {
    x: RING * Math.sin(angle),
    y: -DROP * back,
    z: RING * Math.cos(angle) - RING,
    rotateY: -Math.sin(angle) * TURN,
    /** Cards further round are darker, so the selected one stands out. */
    shade: 1 - back * 0.3,
    depth: Math.cos(angle),
  };
}

/** Shortest signed distance from `from` to `to` on a ring of `n` places. */
function ringDelta(from: number, to: number, n: number) {
  return ((((to - from) % n) + n * 1.5) % n) - n / 2;
}

/** Rounded-rectangle panel with 0–1 UVs, so an image fills it exactly. */
function roundedPanel(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape()
    .moveTo(x + radius, y)
    .lineTo(x + width - radius, y)
    .quadraticCurveTo(x + width, y, x + width, y + radius)
    .lineTo(x + width, y + height - radius)
    .quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    .lineTo(x + radius, y + height)
    .quadraticCurveTo(x, y + height, x, y + height - radius)
    .lineTo(x, y + radius)
    .quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ShapeGeometry(shape, 8);
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - x) / width, (pos.getY(i) - y) / height);
  }
  return geometry;
}

/** A design token from globals.css (e.g. `--color-border`) as a three.js colour. */
function tokenColor(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(value || "white");
}

type Carousel3DProps = {
  items: Carousel3DItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Shown instead of the canvas when WebGL is unavailable or the 3D stage fails. */
  fallback?: ReactNode;
  className?: string;
};

/** Shows `fallback` when the 3D stage throws (e.g. no WebGL context could be created). */
class StageBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * 3D ring carousel (three.js). The cards stand in a circle: the `activeIndex` card is at the front,
 * just above the middle, and the others go round the back, lower down. Clicking a card or dragging turns the ring
 * and calls `onSelect` with the card that should come to the front; the parent owns the selection,
 * so other controls (chips) stay in sync. The canvas is `aria-hidden`: always render accessible
 * controls next to it. Renders only while on screen and while moving. Without WebGL it shows `fallback`.
 */
export function Carousel3D({ fallback = null, ...props }: Carousel3DProps) {
  return (
    <StageBoundary fallback={fallback}>
      <Carousel3DStage {...props} />
    </StageBoundary>
  );
}

function Carousel3DStage({
  items,
  activeIndex,
  onSelect,
  className,
}: Omit<Carousel3DProps, "fallback">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(activeIndex);
  const kickRef = useRef<() => void>(() => {});
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    targetRef.current = activeIndex;
    kickRef.current();
  }, [activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    // No separate "is WebGL there?" probe: a throwaway context costs as much as the real one
    // (hundreds of ms on slow devices). If this throws (no WebGL, too many open contexts),
    // `StageBoundary` shows the fallback.
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.touchAction = "pan-y";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const count = items.length;
    const step = (Math.PI * 2) / count;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameColor = tokenColor("--color-border");
    const loadingColor = tokenColor("--color-muted");
    const loader = new THREE.TextureLoader();
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const disposables: { dispose: () => void }[] = [];
    const cards = items.map((item, index) => {
      const height = CARD_WIDTH / item.aspect;
      const group = new THREE.Group();

      const frameGeometry = roundedPanel(CARD_WIDTH + FRAME * 2, height + FRAME * 2, RADIUS + FRAME);
      const frameMaterial = new THREE.MeshBasicMaterial({ color: frameColor.clone() });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.z = -0.002;

      const imageGeometry = roundedPanel(CARD_WIDTH, height, RADIUS);
      const imageMaterial = new THREE.MeshBasicMaterial({ color: loadingColor.clone() });
      const image = new THREE.Mesh(imageGeometry, imageMaterial);

      loader.load(item.imageSrc, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAnisotropy;
        imageMaterial.map = texture;
        imageMaterial.needsUpdate = true;
        disposables.push(texture);
        kick();
      });

      frame.userData.index = index;
      image.userData.index = index;
      group.add(frame, image);
      scene.add(group);
      disposables.push(frameGeometry, frameMaterial, imageGeometry, imageMaterial);
      return { group, imageMaterial, height, hit: [frame, image] };
    });
    const hitTargets = cards.flatMap((card) => card.hit);

    // `position` is the (fractional, unbounded) place at the front of the ring. It eases to the
    // selected index the short way round. On first view the ring turns in from one place away.
    let position = reduceMotion ? targetRef.current : targetRef.current - 1;
    let width = 1;
    let pxPerCard = 1;
    let visible = false;
    let raf = 0;
    let last = 0;
    let drag: { pointerId: number; startX: number; startPosition: number; moved: boolean } | null = null;

    function place(at: number) {
      cards.forEach((card, index) => {
        const spot = ringSpot((index - at) * step);
        card.group.position.set(spot.x, spot.y, spot.z);
        card.group.rotation.y = spot.rotateY;
        if (card.imageMaterial.map) card.imageMaterial.color.setScalar(spot.shade);
      });
    }

    function draw() {
      place(position);
      renderer.render(scene, camera);
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const goal = position + ringDelta(position, targetRef.current, count);
      if (!drag) {
        position = reduceMotion ? goal : position + (goal - position) * (1 - Math.exp(-dt * SETTLE));
      }
      const settled = !drag && Math.abs(goal - position) < 0.0005;
      if (settled) position = goal;
      draw();
      if (settled || !visible) {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function kick() {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    }
    kickRef.current = kick;

    const corner = new THREE.Vector3();
    /** Screen-space (NDC) box of every card at rest, with the camera `distance` away. */
    function restBounds(distance: number) {
      const eye = -DROP * EYE;
      camera.position.set(0, eye, distance);
      camera.lookAt(0, eye, -RING);
      camera.clearViewOffset();
      camera.updateMatrixWorld();
      place(0);
      const box = { left: Infinity, right: -Infinity, bottom: Infinity, top: -Infinity };
      cards.forEach((card) => {
        card.group.updateMatrixWorld();
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          corner.set((sx * CARD_WIDTH) / 2, (sy * card.height) / 2, 0).applyMatrix4(card.group.matrixWorld).project(camera);
          box.left = Math.min(box.left, corner.x);
          box.right = Math.max(box.right, corner.x);
          box.bottom = Math.min(box.bottom, corner.y);
          box.top = Math.max(box.top, corner.y);
        }
      });
      return box;
    }

    const front = new THREE.Vector3();
    const side = new THREE.Vector3();
    /** Screen (NDC) centres of the front card and its neighbour, after `restBounds`. */
    function restCentres() {
      front.setFromMatrixPosition(cards[0].group.matrixWorld).project(camera);
      side.setFromMatrixPosition(cards[1 % count].group.matrixWorld).project(camera);
    }

    /**
     * Moves the camera back until the whole ring fits the stage with the selected card just above
     * the middle (FRONT_LIFT) and the lower cards below it, then shifts the view to put it there.
     */
    function fit(height: number) {
      const fillX = camera.aspect >= 1.4 ? FILL.wide : FILL.narrow;
      let near = 1;
      let far = 40;
      for (let i = 0; i < 30; i++) {
        const mid = (near + far) / 2;
        const box = restBounds(mid);
        restCentres();
        const anchor = front.y - FRONT_LIFT;
        const fits =
          box.right - box.left <= 2 * fillX && box.top - anchor <= FILL.wide && box.bottom - anchor >= -FILL.wide;
        if (fits) far = mid;
        else near = mid;
      }
      restBounds(far);
      restCentres();
      // Pixels between the front card and its neighbour: one card of drag.
      pxPerCard = Math.max((Math.abs(side.x - front.x) * width) / 2, 40);
      camera.setViewOffset(width, height, 0, (-(front.y - FRONT_LIFT) * height) / 2, width, height);
    }

    function resize() {
      const rect = container!.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      renderer.setSize(width, height, false);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      fit(height);
      if (raf === 0) draw();
    }

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    function cardAt(event: PointerEvent): number | null {
      const rect = canvas.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hitTargets, false)[0];
      return hit ? (hit.object.userData.index as number) : null;
    }

    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return;
      drag = { pointerId: event.pointerId, startX: event.clientX, startPosition: position, moved: false };
    }
    function onPointerMove(event: PointerEvent) {
      if (drag && drag.pointerId === event.pointerId) {
        const dx = event.clientX - drag.startX;
        if (!drag.moved && Math.abs(dx) > CLICK_SLOP) {
          drag.moved = true;
          canvas.setPointerCapture(event.pointerId);
        }
        if (drag.moved) {
          position = drag.startPosition - dx / pxPerCard;
          kick();
        }
        return;
      }
      canvas.style.cursor = event.pointerType === "mouse" && cardAt(event) !== null ? "pointer" : "";
    }
    function onPointerUp(event: PointerEvent) {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const { moved } = drag;
      drag = null;
      const index = moved ? (((Math.round(position) % count) + count) % count) : cardAt(event);
      if (index !== null) onSelectRef.current(index);
      kick();
    }
    function onPointerCancel() {
      drag = null;
      kick();
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const inView = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    inView.observe(container);
    resize();

    return () => {
      cancelAnimationFrame(raf);
      kickRef.current = () => {};
      resizeObserver.disconnect();
      inView.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, [items]);

  return <div ref={containerRef} className={cn("relative overflow-hidden", className)} />;
}
