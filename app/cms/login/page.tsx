"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CmsLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/cms/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (response.status === 401) {
        setErrorMessage("Invalid username or password");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setErrorMessage("Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as { token: string };
      sessionStorage.setItem("cms_session_token", data.token);
      router.push("/cms");
    } catch {
      setErrorMessage("An error occurred during login");
      setIsLoading(false);
    }
  };

  return (
    <main className="container cmsLogin">
      <header className="hero">
        <div>
          <p className="badge">CMS Login</p>
          <h1>Portfolio Manager</h1>
          <p className="summary">Sign in to manage your portfolio content.</p>
        </div>
      </header>

      <form className="card loginForm" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter your username"
          required
          disabled={isLoading}
        />

        <label htmlFor="password">Password</label>
        <div className="tokenInputContainer">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="toggleTokenButton"
            title={showPassword ? "Hide password" : "Show password"}
            disabled={isLoading}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" className="loginButton" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      </form>
    </main>
  );
}
