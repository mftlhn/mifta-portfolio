"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        setError("Invalid password. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/cms");
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="loginCard">
        <div className="loginContent">
          <h1>CMS Access</h1>
          <p className="summary">Masukkan password untuk mengakses dashboard CMS</p>

          <form className="card cmsForm" onSubmit={handleSubmit}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              required
              disabled={isLoading}
            />

            {error && <p className="errorText">{error}</p>}

            <div className="cmsActions">
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Login"}
              </button>
            </div>

            <div className="actions" style={{ marginTop: "1rem" }}>
              <Link href="/">Back to Portfolio</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
