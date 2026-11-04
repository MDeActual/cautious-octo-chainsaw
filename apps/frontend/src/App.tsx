import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { BrowserRouter } from "react-router-dom";
import { loginRequest } from "./auth/msalConfig";
import { selectedAccount } from "./auth/selectedAccount";
import ProductExperience from "./product/ProductExperience";
export default function App(): React.ReactElement {
  const { instance } = useMsal();
  const account = selectedAccount(instance);
  const authenticated = useIsAuthenticated() && account !== null;
  return (
    <BrowserRouter>
      <ProductExperience
        configured
        authenticated={authenticated}
        tenantId={account?.tenantId}
        onLogin={() => {
          void instance.loginRedirect(loginRequest);
        }}
        onLogout={() => {
          void instance.logoutRedirect();
        }}
      />
    </BrowserRouter>
  );
}
