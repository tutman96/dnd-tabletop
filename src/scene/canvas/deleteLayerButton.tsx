import { ILayer } from "../layer";
import { useTheme, IconButton, Dialog, Button, IconTrash2, Text } from "sancho";
import React, { useState } from "react";
import { css } from "emotion";
import { TableViewLayer } from "../layer/tableView";

type Props = { layer?: ILayer; onDelete: () => void; };
const DeleteLayerButton: React.SFC<Props> = ({ layer, onDelete }) => {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <IconButton
        variant="ghost"
        disabled={!layer || layer.id === TableViewLayer.id}
        color={theme.colors.intent.danger.base}
        icon={<IconTrash2 />}
        label="Delete"
        onClick={() => setShowModal(true)} />
      {layer && <Dialog
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        title="Delete Layer"
      >
        <div className={css`padding: ${theme.spaces.lg};`}>
          <Text variant="paragraph" muted={true}>Are you sure you want to delete '{layer.name}'?</Text>
          <div
            className={css`
                display: flex;
                margin-top: ${theme.spaces.lg};
                justify-content: flex-end;
              `}
          >
            <Button variant="ghost" intent="danger" onClick={() => {
              onDelete();
              setShowModal(false);
            }}>Delete</Button>
          </div>
        </div>
      </Dialog>}
    </>
  );
};
export default DeleteLayerButton;