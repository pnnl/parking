"use client";

import "normalize.css/normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "./style.css";

import Map from "./map";
import Notice from "./notice";

export default function Page() {
  return (
    <div>
      <Map />
      <Notice />
    </div>
  );
}
