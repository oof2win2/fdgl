import FDGL from "@fdgl/fetcher";
import { ENV } from "./env";

export const fdgl = new FDGL(ENV.FDGL_API_URL);

fdgl.setApikey(ENV.MASTER_API_KEY);
