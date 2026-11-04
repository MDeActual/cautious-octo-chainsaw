import { BrowserRouter } from "react-router-dom";
import ProductExperience from "./ProductExperience";
export default function PublicApp(): React.ReactElement {
  return (
    <BrowserRouter>
      <ProductExperience />
    </BrowserRouter>
  );
}
