import { useEffect, useState } from 'react';


import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';


const RenameDialog: React.FunctionComponent<{
  name: string,
  onConfirm: (newName: string) => void,
  onCancel: () => void,
  open: boolean
}> = ({ name, onConfirm, onCancel, open }) => {
  let [localName, setLocalName] = useState(name)

  useEffect(() => {
    setLocalName(name)
  }, [name])

  return (
    <Dialog
      open={open}
      onClose={onCancel}
    >
      <DialogTitle>
        Rename '{name}'
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Edit the name of '{name}' here.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          variant="standard"
          fullWidth
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onConfirm(localName)} autoFocus>OK</Button>
      </DialogActions>
    </Dialog>
  )
}
export default RenameDialog;