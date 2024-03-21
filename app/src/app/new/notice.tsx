"use client";

import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";

import { IconNames } from "@blueprintjs/icons";
import { useState } from "react";

export default function Notice() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog className="dialog" isOpen={open} title="Dynacurb" icon={IconNames.INFO_SIGN} isCloseButtonShown={false}>
      <DialogBody>
        <h2>Using the Dynacurb application confirms:</h2>
        <h4>• You will not use this application while operating a vehicle.</h4>
        <h4>
          • This is an experimental/prototype application designed to assist drivers in locating available parking spots
          more quickly.
        </h4>
        <h4>
          • Parking availability predictions are based upon past occupancy patterns and no accuracy guarantees are made.
        </h4>
        <h4>• This is not a reservation system and spots are filled on a first come, first serve basis.</h4>
        <h4>
          • Authorized commercial use of this application is limited to drivers who have received prior approval from
          their employer.
        </h4>
      </DialogBody>
      <DialogFooter actions={<Button intent="primary" text="Agree" onClick={() => setOpen(false)} />} />
    </Dialog>
  );
}
