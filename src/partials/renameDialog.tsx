import {useEffect, useState} from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

const RenameDialog: React.FunctionComponent<{
  name: string;
  isNew?: boolean;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
  open: boolean;
}> = ({name, isNew, onConfirm, onCancel, open}) => {
  const [localName, setLocalName] = useState(name);

  useEffect(() => {
    setLocalName(name);
  }, [name]);

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>
        {isNew ? 'Create new scene' : `Rename '${name}'`}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isNew
            ? 'What would you like to name this scene? This can be changed later'
            : `Edit the name of '${name}' here.`}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          variant="standard"
          fullWidth
          value={localName}
          onChange={e => setLocalName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onConfirm(localName)} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default RenameDialog;
