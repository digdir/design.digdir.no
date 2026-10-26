import {
  Button,
  Dialog,
  Heading,
  Label,
  Paragraph,
} from '@digdir/designsystemet-react';
import {
  ArrowUndoIcon,
  ZoomMinusIcon,
  ZoomPlusIcon,
} from '@navikt/aksel-icons';
import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
} from 'react';
import classes from './image-crop-dialog.module.css';
import type { ImageShape } from './measure';
import type { Rect } from './svg-template';
import { MAX_ZOOM, useCropView } from './use-crop-view';

/** Keyboard steps, as a share of the visible part of the image. */
const PAN_STEP = 0.05;
const PAN_STEP_LARGE = 0.2;
const ZOOM_STEP = 1.1;

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

interface ImageCropDialogProps {
  open: boolean;
  /** Field label, shown under the heading. */
  label: string;
  src: string;
  image: { width: number; height: number };
  shape: ImageShape;
  /** The crop applied so far, if any. */
  crop?: Rect;
  onApply: (crop: Rect) => void;
  onClose: () => void;
}

/**
 * Choose which part of an uploaded image fills an `[image]` shape. The
 * shape's outline is drawn over the image, and the image is moved and zoomed
 * under it – by dragging, pinching, the mouse wheel, the arrow and +/- keys,
 * or the zoom slider and buttons.
 */
export const ImageCropDialog = ({
  open,
  onClose,
  ...props
}: ImageCropDialogProps) => {
  const headingId = useId();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      closedby='any'
      aria-labelledby={headingId}
      className={classes.dialog}
    >
      {/* Mounted only while open, so it starts from the current crop. */}
      {open && (
        <CropEditor headingId={headingId} onClose={onClose} {...props} />
      )}
    </Dialog>
  );
};

const CropEditor = ({
  headingId,
  label,
  src,
  image,
  shape,
  crop,
  onApply,
  onClose,
}: Omit<ImageCropDialogProps, 'open'> & { headingId: string }) => {
  const helpId = useId();
  const zoomId = useId();
  const maskId = `crop-mask-${useId().replace(/[^\w-]/g, '')}`;

  const { zoom, visible, pan, zoomBy, setZoom, reset } = useCropView(
    image,
    shape.box.width / shape.box.height,
    crop,
  );

  // Show some of the image around the crop, dimmed. The stage can be wider or
  // taller than `frame`, so the dimming reaches well beyond it.
  const margin = Math.max(visible.width, visible.height) * 0.25;
  const frame = {
    x: visible.x - margin,
    y: visible.y - margin,
    width: visible.width + margin * 2,
    height: visible.height + margin * 2,
  };
  const dimmed = {
    x: frame.x - frame.width * 10,
    y: frame.y - frame.height * 10,
    width: frame.width * 21,
    height: frame.height * 21,
  };

  // Start in the crop area, so the arrow keys work right away and screen
  // readers announce the instructions. Waits a frame, as the dialog focuses
  // its first button when it opens.
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frameId = requestAnimationFrame(() => stageRef.current?.focus());
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Dragging moves the image, so the visible part moves the other way.
  const svgRef = useRef<SVGSVGElement>(null);
  const panByScreen = (dx: number, dy: number) => {
    const scale = svgRef.current?.getScreenCTM()?.a || 1;
    pan(-dx / scale, -dy / scale);
  };

  // Drag with one pointer, pinch with two.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const onPointerDown = (event: PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
  };
  const onPointerMove = (event: PointerEvent) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const next = { x: event.clientX, y: event.clientY };
    if (pointers.current.size === 1) {
      panByScreen(next.x - previous.x, next.y - previous.y);
    } else if (pointers.current.size === 2) {
      const other = [...pointers.current].find(
        ([id]) => id !== event.pointerId,
      )?.[1];
      if (other) {
        const before = Math.hypot(previous.x - other.x, previous.y - other.y);
        const after = Math.hypot(next.x - other.x, next.y - other.y);
        if (before > 0) zoomBy(after / before);
      }
    }
    pointers.current.set(event.pointerId, next);
  };
  const onPointerUp = (event: PointerEvent) => {
    pointers.current.delete(event.pointerId);
  };

  // React's wheel listener is passive, so it can't stop the page scrolling.
  const onWheel = useEffectEvent((event: WheelEvent) => {
    event.preventDefault();
    zoomBy(Math.exp(-event.deltaY * 0.002));
  });
  useEffect(() => {
    const svg = svgRef.current;
    svg?.addEventListener('wheel', onWheel, { passive: false });
    return () => svg?.removeEventListener('wheel', onWheel);
  }, []);

  const onKeyDown = (event: KeyboardEvent) => {
    const arrow = ARROWS[event.key];
    if (arrow) {
      // Same direction as dragging: the image moves with the arrow.
      const step = event.shiftKey ? PAN_STEP_LARGE : PAN_STEP;
      pan(-arrow[0] * visible.width * step, -arrow[1] * visible.height * step);
    } else if (event.key === '+' || event.key === '=') {
      zoomBy(ZOOM_STEP);
    } else if (event.key === '-') {
      zoomBy(1 / ZOOM_STEP);
    } else {
      return;
    }
    event.preventDefault();
  };

  const outline = (className: string) => (
    <svg
      {...visible}
      viewBox={`${shape.box.x} ${shape.box.y} ${shape.box.width} ${shape.box.height}`}
      preserveAspectRatio='none'
    >
      <g
        className={className}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: the outline comes from a template SVG in this repo
        dangerouslySetInnerHTML={{ __html: shape.outline }}
      />
    </svg>
  );

  const zoomPercent = Math.round(zoom * 100);

  return (
    <>
      <Dialog.Block>
        <Heading id={headingId} level={2} data-size='xs'>
          Juster utsnitt
        </Heading>
        <Paragraph data-size='sm' className={classes.subtle}>
          {label}
        </Paragraph>
      </Dialog.Block>
      <Dialog.Block className={classes.body}>
        {/* biome-ignore lint/a11y/useSemanticElements: a focusable group is the target for the arrow and +/- keys */}
        <div
          ref={stageRef}
          role='group'
          tabIndex={0}
          aria-label='Bildeutsnitt'
          aria-describedby={helpId}
          className={classes.stage}
          onKeyDown={onKeyDown}
        >
          <svg
            ref={svgRef}
            viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`}
            className={classes.canvas}
            aria-hidden
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <defs>
              <mask id={maskId}>
                <rect {...dimmed} fill='white' />
                {outline(classes.maskShape)}
              </mask>
            </defs>
            <image href={src} width={image.width} height={image.height} />
            <rect
              {...dimmed}
              className={classes.dim}
              mask={`url(#${maskId})`}
            />
            {outline(classes.outline)}
          </svg>
        </div>
        <Paragraph id={helpId} data-size='sm' className={classes.subtle}>
          Dra i bildet for å flytte det, og zoom med hjulet eller to fingre. Med
          tastaturet flytter piltastene bildet, og + og − zoomer.
        </Paragraph>
        <div className={classes.zoom}>
          <Label htmlFor={zoomId}>Zoom</Label>
          <div className={classes.zoomControls}>
            <Button
              type='button'
              variant='tertiary'
              data-size='sm'
              icon
              aria-label='Zoom ut'
              disabled={zoom <= 1}
              onClick={() => zoomBy(1 / ZOOM_STEP)}
            >
              <ZoomMinusIcon aria-hidden />
            </Button>
            <input
              id={zoomId}
              type='range'
              min={100}
              max={MAX_ZOOM * 100}
              value={zoomPercent}
              aria-valuetext={`${zoomPercent} %`}
              className={classes.slider}
              onChange={(event) => setZoom(Number(event.target.value) / 100)}
            />
            <Button
              type='button'
              variant='tertiary'
              data-size='sm'
              icon
              aria-label='Zoom inn'
              disabled={zoom >= MAX_ZOOM}
              onClick={() => zoomBy(ZOOM_STEP)}
            >
              <ZoomPlusIcon aria-hidden />
            </Button>
          </div>
        </div>
      </Dialog.Block>
      <Dialog.Block className={classes.footer}>
        <Button type='button' variant='tertiary' onClick={reset}>
          <ArrowUndoIcon aria-hidden />
          Tilbakestill
        </Button>
        <div className={classes.footerEnd} data-color='accent'>
          <Button type='button' variant='secondary' onClick={onClose}>
            Avbryt
          </Button>
          <Button
            type='button'
            onClick={() => {
              onApply(visible);
              onClose();
            }}
          >
            Bruk utsnitt
          </Button>
        </div>
      </Dialog.Block>
    </>
  );
};
