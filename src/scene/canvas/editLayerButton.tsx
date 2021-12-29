import React, { useState } from "react";

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip';

import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

import { ILayer } from "../layer";
import { TableViewLayer } from "../layer/tableView";
import RenameDialog from "../../partials/renameDialog";

type Props = { layer?: ILayer; onUpdate: (layer: ILayer) => void; };
const EditLayerButton: React.FunctionComponent<Props> = ({ layer, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);

  const disabled = !layer || layer.id === TableViewLayer.id;

  return (
    <>
      <IconButton
        onClick={() => setShowModal(true)}
        size="small"
        disabled={disabled}
      >
        <Tooltip title="Edit Layer Name">
          <DriveFileRenameOutlineOutlinedIcon />
        </Tooltip>
      </IconButton>
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