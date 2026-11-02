"use client";

import { Render } from "@puckeditor/core";
import type { PageData } from "../types";
import { puckConfig } from "./puck-config";

/** Renders a saved page with the same Puck config as the editor (preview + published site). */
export function SiteRenderer({ data }: { data: PageData }) {
  return <Render config={puckConfig} data={data} />;
}
