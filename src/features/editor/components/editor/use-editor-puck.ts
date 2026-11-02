"use client";

import { createUsePuck } from "@puckeditor/core";
import type { puckConfig } from "../puck-config";

/** Typed Puck store selector for the editor panels. */
export const useEditorPuck = createUsePuck<typeof puckConfig>();
