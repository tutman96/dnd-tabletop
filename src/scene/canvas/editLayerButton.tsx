import React, { useState } from "react";

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip';

import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

import { ILayer } from "../layer";
import { TableViewLayer } from "../layer/tableView";
import RenameDialog from "../../partials/renameDialog";

type Props = { layer?: ILayer; onUpdate: (layer: ILayer) => void; };
const EditLayerButton: React.SFC<Props> = ({ layer, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);

  const disabled = !layer || layer.id === TableViewLayer.id;

  // Can't have a disabled button be the target of a tooltip
  if (disabled) {
    return (
      <IconButton disabled={true} size="small">
        <DriveFileRenameOutlineOutlinedIcon />
      </IconButton>
    )
  }

  return (
    <>
      <Tooltip title="Edit Layer Name">
        <IconButton
          onClick={() => setShowModal(true)}
          size="small"
        >
          <DriveFileRenameOutlineOutlinedIcon />
        </IconButton>
      </Tooltip>
      {layer && <RenameDialog
        open={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={(name) => {
          onUpdate({ ...layer, name })
          setShowModal(false)
        }}
        name={layer.name}
      />}
    </>
  );
};
export default EditLayerButton;