import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


const ConfirmDialog: React.FunctionComponent<{
  description: string,
  onConfirm: React.MouseEventHandler<HTMLButtonElement>,
  onCancel: React.MouseEventHandler<HTMLButtonElement>,
  open: boolean
}> = ({ description, onConfirm, onCancel, open }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
    >
      <DialogTitle>
        Are you sure?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} autoFocus>OK</Button>
      </DialogActions>
    </Dialog>
  )
}
export default ConfirmDialog;