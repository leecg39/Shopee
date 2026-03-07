import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { DemoDataProvider } from "./state/demo-store";

export default function App() {
  return (
    <DemoDataProvider>
      <RouterProvider router={router} />
    </DemoDataProvider>
  );
}
