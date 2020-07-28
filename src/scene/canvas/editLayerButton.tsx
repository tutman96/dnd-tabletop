import { ILayer } from "../layer";
import { useTheme, IconButton, IconEdit2, Dialog, Button, InputGroup, Input } from "sancho";
import React, { useState, useEffect } from "react";
import { css } from "emotion";
import { TableViewLayer } from "../layer/tableView";

type Props = { layer?: ILayer; onUpdate: (layer: ILayer) => void; };
const EditLayerButton: React.SFC<Props> = ({ layer, onUpdate }) => {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(layer?.name);

  useEffect(() => {
    if (layer) {
      setName(layer.name);
    }
  }, [layer, showModal]);

  return (
    <>
      <IconButton
        variant="ghost"
        disabled={!layer || layer.id === TableViewLayer.id}
        icon={<IconEdit2 />}
        label="Edit"
        onClick={() => setShowModal(true)} />
      {layer && <Dialog
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        title="Edit Layer"
      >
        <div className={css`padding: ${theme.spaces.lg};`}>
          <InputGroup label="Name">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)} />
          </InputGroup>
          <div
            className={css`
                display: flex;
                margin-top: ${theme.spaces.lg};
                justify-content: flex-end;
              `}
          >
            <Button variant="ghost" intent="primary" onClick={() => {
              if (name) {
                onUpdate({ ...layer, name });
              }
              setShowModal(false);
            }}>Save</Button>
          </div>
        </div>
      </Dialog>}
    </>
  );
};
export default EditLayerButton;