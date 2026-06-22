"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess: (captureId: string) => void;
  onError?: (err: unknown) => void;
}

export function PayPalButton({
  amount,
  currency = "MAD",
  description,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency,
        intent: "capture",
      }}
    >
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
          {error}
        </p>
      )}
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
        createOrder={async () => {
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, currency, description }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to create order");
          return data.id;
        }}
        onApprove={async (data) => {
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const capture = await res.json();
          if (!res.ok || capture.status !== "COMPLETED") {
            const msg = capture.error ?? "Payment capture failed";
            setError(msg);
            onError?.(msg);
            return;
          }
          onSuccess(capture.captureId);
        }}
        onError={(err) => {
          setError("Payment failed. Please try again.");
          onError?.(err);
        }}
      />
    </PayPalScriptProvider>
  );
}
