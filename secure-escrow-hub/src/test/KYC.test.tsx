import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import KYC from "../pages/KYC";

const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("KYC Page", () => {
  it("should render the KYC page with DigiLocker branding", () => {
    renderWithProviders(<KYC />);

    expect(screen.getByText("Complete Your KYC Verification")).toBeInTheDocument();
    expect(screen.getByText("DigiLocker KYC")).toBeInTheDocument();
    expect(screen.getByText("Secure and government-compliant identity verification")).toBeInTheDocument();
  });

  it("should show step 1 by default", () => {
    renderWithProviders(<KYC />);

    expect(screen.getByText("Enter Your Details")).toBeInTheDocument();
    expect(screen.getByText("Please provide your Aadhar and PAN card details")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter 12-digit Aadhar number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter PAN number (e.g., ABCDE1234F)")).toBeInTheDocument();
  });

  it("should show progress indicator", () => {
    renderWithProviders(<KYC />);

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("33% Complete")).toBeInTheDocument();
  });
});