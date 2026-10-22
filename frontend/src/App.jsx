import AuthPage from "./pages/AuthPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SmartJournalApp from "./SmartJournalApp";
import { AudioProvider } from "./context/AudioContext";

function AppGate() {
  const { user } = useAuth();
  if (!user) return <AuthPage />;
  return <SmartJournalApp />;
}

export default function App() {
  return (
    <AudioProvider>
      <AuthProvider>
        <AppGate />
      </AuthProvider>
    </AudioProvider>
  );
}
