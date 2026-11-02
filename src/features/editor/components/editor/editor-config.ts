import { puckConfig } from "../puck-config";
import { applyFieldRules } from "./field-rules";

/** The Puck config for the editor only: the shared config plus the save/deploy limits on every field. */
export const editorConfig = applyFieldRules(puckConfig);
