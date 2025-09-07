declare module "ejs-mate" {
  import type { RenderFileCallback } from "ejs";
  // ejs-mate は app.engine('ejs', ejsMate) に渡す「ビューエンジン関数」を export します
  const ejsMate: (path: string, options: any, callback: RenderFileCallback) => void;
  export default ejsMate;
}
