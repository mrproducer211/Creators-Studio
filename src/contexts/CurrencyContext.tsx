"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "THB" | "USD" | "EUR" | "CNY";

interface CurrencyCtx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (thbPrice: number, includeSymbol?: boolean) => string;
  convertPrice: (thbPrice: number) => number;
}

const CurrencyContext = createContext<CurrencyCtx>({
  currency: "THB",
  setCurrency: () => {},
  formatPrice: (p) => `฿${p.toLocaleString("en-US")}`,
  convertPrice: (p) => p,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("THB");

  useEffect(() => {
    const stored = localStorage.getItem("nhp-currency");
    if (stored === "THB" || stored === "USD" || stored === "EUR" || stored === "CNY") {
      setCurrencyState(stored as Currency);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("nhp-currency", c);
  };

  const convertPrice = (thbPrice: number): number => {
    let rate = 1;
    switch (currency) {
      case "USD":
        rate = 1 / 36;
        break;
      case "EUR":
        rate = 1 / 39;
        break;
      case "CNY":
        rate = 1 / 5;
        break;
      default:
        rate = 1;
    }
    return Math.round(thbPrice * rate);
  };

  const formatPrice = (thbPrice: number, includeSymbol = true): string => {
    let symbol = "฿";
    switch (currency) {
      case "USD":
        symbol = "$";
        break;
      case "EUR":
        symbol = "€";
        break;
      case "CNY":
        symbol = "¥";
        break;
      default:
        symbol = "฿";
    }

    const converted = convertPrice(thbPrice);
    const formattedNumber = converted.toLocaleString("en-US");
    return includeSymbol ? `${symbol}${formattedNumber}` : formattedNumber;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
