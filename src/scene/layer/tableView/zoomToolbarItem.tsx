import React from 'react';
import { IconButton, IconZoomOut, IconZoomIn, Button } from 'sancho';
import { css } from 'emotion';

const ZOOM_RATE = 1.5;

type Props = { zoom: number, onUpdate: (zoom: number) => void };
const ZoomToolbarItem: React.SFC<Props> = ({ zoom, onUpdate }) => {

  let zoomDisplay: string;
  if (zoom < 1) {
    zoomDisplay = `1/${+(1 / zoom).toFixed(1)}x`
  }
  else {
    zoomDisplay = `${+zoom.toFixed(1)}x`
  }

  return (
    <div
      className={css`
        display: flex;
        align-items: center;
      `}
    >
      <IconButton
        variant="ghost"
        icon={<IconZoomOut />}
        label="Zoom Out"
        onClick={() => {
          let newZoom = Math.round(zoom / ZOOM_RATE * 100) / 100;
          if (newZoom > 0.95 && newZoom < 1.05) newZoom = 1;
          onUpdate(newZoom)
        }}
      />
      <div
        className={css`
          min-width: 2rem;
          text-align: center;
        `}
      >
        {zoom === 1 ? <b>{zoomDisplay}</b> : zoomDisplay}
      </div>
      <IconButton
        variant="ghost"
        icon={<IconZoomIn />}
        label="Zoom In"
        onClick={() => {
          let newZoom = Math.round(zoom * ZOOM_RATE * 100) / 100;
          if (newZoom > 0.95 && newZoom < 1.05) newZoom = 1;
          onUpdate(newZoom)
        }}
      />
      {zoom !== 1 && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            onUpdate(1);
          }}
        >
          Reset Zoom
        </Button>
      )}
    </div>
  )
}
export default ZoomToolbarItem;