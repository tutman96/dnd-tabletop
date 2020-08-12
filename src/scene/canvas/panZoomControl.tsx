import React, { useState, useEffect } from 'react';
import { css } from 'emotion';
import { useTheme, IconChevronUp, IconChevronRight, IconChevronDown, IconChevronLeft, IconButton, IconPlus, IconMinus, IconButtonProps, IconHome } from 'sancho';
import { Vector2d } from 'konva/types/types';

const PanButton: React.SFC<{ onActivateRepeat?: (multiplier: number) => void } & IconButtonProps> = ({ onActivateRepeat, ...props }) => {
  const [mouseDown, setMouseDown] = useState<boolean>(false);

  useEffect(() => {
    if (mouseDown && onActivateRepeat) {
      const timeDown = Date.now();

      let animationFrame: number;
      const callback = () => {
        let multiplier = (Date.now() - timeDown) / 200;
        if (multiplier > 100) multiplier = 100;
        onActivateRepeat(multiplier);
        animationFrame = requestAnimationFrame(callback);
      }
      animationFrame = requestAnimationFrame(callback);
      
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [mouseDown, onActivateRepeat])

  return (
    <IconButton
      variant="ghost"
      {...props}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
    />
  );
}

type Vector3d = Vector2d & { z: number };
type Props = { onPanZoom: (direction: Vector3d) => void, onHome: () => void };
const PanZoomControl: React.SFC<Props> = ({ onPanZoom, onHome }) => {
  const theme = useTheme();
  const PAN_CONTROL_RADIUS = 75;

  const controlBase = css`
    display: flex;
    background-color: ${theme.colors.background.layer};
    box-shadow: ${theme.shadows.md};
  `;

  const controlButtonBase = css`
    width: ${theme.spaces.lg} !important;
    height: ${theme.spaces.lg} !important;
  `;

  return (
    <div
      className={css`
        position: relative;
        float: right;
        z-index: 1;
        padding: ${theme.spaces.md};
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <div
        className={css`
          ${controlBase};
          border-radius: 50%;
          width: ${PAN_CONTROL_RADIUS}px;
          height: ${PAN_CONTROL_RADIUS}px;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
        `}
      >
        <PanButton label="Pan Left" size="lg" icon={<IconChevronLeft />} onActivateRepeat={(multiplier) => onPanZoom({ x: -multiplier, y: 0, z: 0 })} className={controlButtonBase} />
        <div
          className={css`
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            height: 100%;
          `}
        >
          <PanButton label="Pan Up" size="lg" icon={<IconChevronUp />} onActivateRepeat={(multiplier) => onPanZoom({ x: 0, y: -multiplier, z: 0 })} className={controlButtonBase} />
          <PanButton label="Home" size="sm" icon={<IconHome />} onClick={onHome} className={controlButtonBase} />
          <PanButton label="Pan Down" size="lg" icon={<IconChevronDown />} onActivateRepeat={(multiplier) => onPanZoom({ x: 0, y: multiplier, z: 0 })} className={controlButtonBase} />
        </div>
        <PanButton label="Pan Right" size="lg" icon={<IconChevronRight />} onActivateRepeat={(multiplier) => onPanZoom({ x: multiplier, y: 0, z: 0 })} className={controlButtonBase} />
      </div>
      <div
        className={css`
          ${controlBase};
          flex-direction: column;
          margin-top: ${theme.spaces.md};
          border-radius: ${theme.radii.sm};
        `}
      >
        <PanButton variant="ghost" size="sm" icon={<IconPlus />} label="Zoom In" onActivateRepeat={(multiplier) => onPanZoom({ x: 0, y: 0, z: multiplier })} />
        <PanButton variant="ghost" size="sm" icon={<IconMinus />} label="Zoom Out" onActivateRepeat={(multiplier) => onPanZoom({ x: 0, y: 0, z: -multiplier })} />
      </div>
    </div>
  );
}
export default PanZoomControl;