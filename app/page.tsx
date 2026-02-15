import ErrorBoundary from "@/components/ErrorBoundary";
import TradingTerminal from "@/components/TradingTerminal";

export default function Page() {
  return (
    <ErrorBoundary>
      <TradingTerminal />
    </ErrorBoundary>
  );
}
