import React from 'react';
import { theme } from "../theme";


const FAVICON_SIZE = theme.spacing(4);

type Props = { active: boolean }
const Favicon: React.FunctionComponent<Props> = () => {
  return (
    <img
      width={FAVICON_SIZE}
      height={FAVICON_SIZE}
      src="favicon.png"
      alt="home icon"
    />
  )
}
export default Favicon;