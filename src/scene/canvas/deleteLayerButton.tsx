import React, { useState } from "react";

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import { ILayer } from "../layer";
import ConfirmDialog from "../../partials/confirmDialog";
import { TABLEVIEW_LAYER_ID } from "../layer/tableView";

type Props = { layer?: ILayer; onDelete: () => void; };
const DeleteLayerButton: React.FunctionComponent<Props> = ({ layer, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const disabled = !layer || layer.id === TABLEVIEW_LAYER_ID;

  return (
    <>
      <IconButton
        onClick={() => setShowModal(true)}
        color="error"
        size="small"
        disabled={disabled}
      >
        <Tooltip title="Delete Layer">
          <DeleteOutlinedIcon />
        </Tooltip>
      </IconButton>
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