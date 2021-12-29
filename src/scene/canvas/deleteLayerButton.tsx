import React, { useState } from "react";

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import { ILayer } from "../layer";
import { TableViewLayer } from "../layer/tableView";
import ConfirmDialog from "../../partials/confirmDialog";

type Props = { layer?: ILayer; onDelete: () => void; };
const DeleteLayerButton: React.SFC<Props> = ({ layer, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const disabled = !layer || layer.id === TableViewLayer.id;

  // Can't have a disabled button be the target of a tooltip
  if (disabled) {
    return (
      <IconButton disabled={true} color="error" size="small">
        <DeleteOutlinedIcon />
      </IconButton>
    )
  }

  return (
    <>
      <Tooltip title="Delete Layer">
        <IconButton
          onClick={() => setShowModal(true)}
          color="error"
          size="small"
        >
          <DeleteOutlinedIcon />
        </IconButton>
      </Tooltip>
      {layer && <ConfirmDialog
        description={`Are you sure you want to delete '${layer.name}'`}
        open={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          onDelete()
          setShowModal(false)
        }}
      />}
    </>
  );
};
export default DeleteLayerButton;